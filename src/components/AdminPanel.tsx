"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArticleAdmin } from "@/components/ArticleAdmin";
import type { ManagedVideo, PackageImage } from "@/lib/managed-content";
import { uploadMedia } from "@/lib/upload-media";

type ManagedPackage = { slug: string; name: string; vehicle: string; style: string; budget: string; range: string; text: string; items: string[]; imageUrl: string | null; images: PackageImage[]; videos: ManagedVideo[]; active: boolean; sortOrder: number };
const blankPackage: ManagedPackage = { slug: "", name: "", vehicle: "VinFast VF3", style: "", budget: "Tư vấn theo cấu hình", range: "Liên hệ tư vấn", text: "", items: [], imageUrl: null, images: [], videos: [], active: true, sortOrder: 10 };

function slugFromTitle(title: string) {
  return title.toLowerCase().replace(/đ/g, "d").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function readResponse(response: Response) {
  return response.json().catch(() => ({ error: `Máy chủ trả lỗi HTTP ${response.status}; nội dung chưa được lưu.` }));
}

export function AdminPanel() {
  const pathname = usePathname();
  const packageEditorSlug = pathname.startsWith("/admin/goi-do/") ? decodeURIComponent(pathname.split("/").at(-1) ?? "") : null;
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [packages, setPackages] = useState<ManagedPackage[]>([]);
  const [heroImage, setHeroImage] = useState("");
  const [draft, setDraft] = useState<ManagedPackage>(blankPackage);
  const [originalSlug, setOriginalSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/content", { cache: "no-store" });
    if (!response.ok) {
      if (response.status === 401) setAuthenticated(false);
      else { setAuthenticated(true); setStatus("Không tải được nội dung. Kiểm tra kết nối database và chạy npm run db:push."); }
      return;
    }
    const data = await response.json();
    setPackages(data.packages);
    setHeroImage(data.heroImage);
    setAuthenticated(true);
  }, []);

  useEffect(() => { void load().finally(() => setChecking(false)); }, [load]);
  useEffect(() => {
    const notice = window.sessionStorage.getItem("admin-content-notice");
    if (notice) { setStatus(notice); window.sessionStorage.removeItem("admin-content-notice"); }
  }, []);
  useEffect(() => {
    if (!packageEditorSlug) return;
    if (packageEditorSlug === "new") { setDraft(blankPackage); setOriginalSlug(""); return; }
    if (!packages.length) return;
    const item = packages.find((entry) => entry.slug === packageEditorSlug);
    if (item) {
      setDraft({ ...item, items: [...item.items], images: item.images.map((image) => ({ ...image })), videos: (item.videos ?? []).map((video) => ({ ...video })) });
      setOriginalSlug(item.slug);
      setSlugManuallyEdited(false);
    }
  }, [packageEditorSlug, packages]);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể đăng nhập.");
      setPassword(""); await load(); setStatus("Đăng nhập thành công.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Có lỗi xảy ra."); }
    finally { setBusy(false); }
  }

  async function saveHero(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ heroImage }) });
      const data = await readResponse(response); if (!response.ok) throw new Error(data.error || "Không lưu được ảnh banner.");
      setStatus("Đã lưu ảnh banner trang chủ.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Có lỗi xảy ra."); }
    finally { setBusy(false); }
  }

  async function upload(files: FileList | null | undefined, target: "hero" | "package") {
    if (!files?.length) return;
    setBusy(true); setStatus("");
    try {
      const selected = target === "hero" ? [files[0]] : Array.from(files);
      const uploaded = await Promise.all(selected.map(async (file, index) => {
        const uploadedFile = await uploadMedia(file);
        return { url: uploadedFile.url, alt: `${draft.name || "Gói độ"} — ảnh ${index + 1}`, caption: "" };
      }));
      if (target === "hero") setHeroImage(uploaded[0].url);
      else setDraft((current) => ({ ...current, imageUrl: current.imageUrl || uploaded[0].url, images: [...current.images, ...uploaded] }));
      setStatus(`Đã tải ${uploaded.length} ảnh lên.`);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Tải ảnh thất bại."); }
    finally { setBusy(false); }
  }

  async function uploadPackageVideos(files: FileList | null) {
    if (!files?.length) return;
    if (draft.videos.length + files.length > 8) { setStatus("Mỗi gói độ tối đa 8 video."); return; }
    setBusy(true); setStatus("");
    try {
      const added = await Promise.all(Array.from(files).map(async (file): Promise<ManagedVideo> => {
        const uploadedFile = await uploadMedia(file);
        return { url: uploadedFile.url, title: "" };
      }));
      setDraft((current) => ({ ...current, videos: [...current.videos, ...added] }));
      setStatus(`Đã tải ${added.length} video. Video phát tự động ở chế độ tắt tiếng.`);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Tải video thất bại."); }
    finally { setBusy(false); }
  }

  async function savePackage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("");
    const payload = { ...draft, originalSlug: originalSlug || undefined, items: typeof draft.items === "string" ? (draft.items as unknown as string).split("\n").map((item) => item.trim()).filter(Boolean) : draft.items };
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ package: payload }) });
      const data = await readResponse(response); if (!response.ok) throw new Error(data.error || "Không lưu được gói độ.");
      window.sessionStorage.setItem("admin-content-notice", "Đã lưu gói độ vào website."); window.location.reload();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Có lỗi xảy ra."); }
    finally { setBusy(false); }
  }

  async function removePackage(slug: string) {
    if (!window.confirm(`Xóa gói “${slug}”?`)) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deleteSlug: slug }) });
      const data = await readResponse(response); if (!response.ok) throw new Error(data.error || "Không xóa được gói độ.");
      await load(); setStatus("Đã xóa gói độ.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Có lỗi xảy ra."); }
    finally { setBusy(false); }
  }

  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" }); setAuthenticated(false); setPackages([]);
  }

  if (checking) return <div className="admin-card"><p>Đang kiểm tra phiên đăng nhập…</p></div>;
  if (!authenticated) return <form className="admin-login" onSubmit={signIn}><div className="eyebrow"><span className="eyebrow-line"/>QUỐC DƯƠNG AUTO · ADMIN</div><h1>Đăng nhập<br/><span>quản trị nội dung.</span></h1><p>Khu vực dành riêng cho người quản trị website.</p><label>Tên đăng nhập<input autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)}/></label><label>Mật khẩu<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)}/></label><button className="button" disabled={busy}>{busy ? "Đang kiểm tra…" : "Đăng nhập"} <span>↗</span></button>{status && <p className="admin-status" role="status">{status}</p>}</form>;

  const setField = (key: keyof ManagedPackage, value: string | boolean | number | string[] | PackageImage[] | ManagedVideo[] | null) => setDraft((current) => ({ ...current, [key]: value }));
  function editPackage(item: ManagedPackage) {
    window.location.assign(`/admin/goi-do/${item.slug}`);
  }
  function startNewPackage() {
    window.location.assign("/admin/goi-do/new");
  }
  return <div className={`admin-container${packageEditorSlug ? " admin-package-editor" : ""}`}><header className="admin-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>QUẢN TRỊ WEBSITE</div><h1>{packageEditorSlug ? (packageEditorSlug === "new" ? "Thêm gói độ." : "Chỉnh sửa gói độ.") : <>Nội dung & <span>hình ảnh.</span></>}</h1><p>{packageEditorSlug ? "Cập nhật nội dung, album ảnh và video của cấu hình." : "Thay banner trang chủ và quản lý các gói độ đang hiển thị."}</p></div><div className="admin-heading-actions">{packageEditorSlug && <Link className="admin-logout" href="/admin">← Danh sách quản trị</Link>}<button className="admin-logout" onClick={signOut}>Đăng xuất ↗</button></div></header>
    {status && <p className="admin-status" role="status">{status}</p>}
    {!packageEditorSlug && <nav className="admin-shortcuts" aria-label="Tạo nội dung"><Link className="button" href="/admin/goi-do/new">+ Thêm gói độ</Link><Link className="admin-logout" href="/admin/bai-viet/new">+ Thêm bài viết</Link></nav>}
    <section className="admin-card"><div className="admin-card-title"><div><span>01 / BANNER</span><h2>Ảnh trang chủ</h2></div><p>Ảnh ngang chất lượng cao, tối thiểu 1600px. Chỉ dùng ảnh có quyền sử dụng.</p></div><form onSubmit={saveHero} className="admin-banner-form"><label>Đường dẫn ảnh<input value={heroImage} onChange={(event) => setHeroImage(event.target.value)} placeholder="/uploads/ten-anh.webp hoặc URL HTTPS"/></label><label className="admin-upload">Tải ảnh lên<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event.target.files, "hero")}/></label><button className="button" disabled={busy}>Lưu banner</button></form>{heroImage && <div className="admin-preview" style={{ backgroundImage: `url("${heroImage}")` }} aria-label="Xem trước banner"/>}<small>JPG, PNG hoặc WebP · tối đa 8 MB. Ảnh tải lên lưu trong public/uploads.</small></section>
    <section className="admin-card"><div className="admin-card-title"><div><span>02 / GÓI ĐỘ</span><h2>Danh mục cấu hình</h2></div><p>Gói hiển thị trên trang chủ, danh mục và URL chi tiết `/goi-do/slug`.</p></div><div className="admin-package-list">{packages.map((item) => <article key={item.slug}><div><Link className="admin-content-link" href={`/goi-do/${item.slug}`} target="_blank" rel="noreferrer"><strong>{item.name} ↗</strong></Link><span>{item.slug} · {item.range} · {item.images.length} ảnh · {item.videos?.length ?? 0} video</span></div><div className="admin-row-actions"><button type="button" onClick={() => editPackage(item)}>Sửa</button><button type="button" onClick={() => void removePackage(item.slug)}>Xóa</button></div></article>)}</div><form className="admin-editor" onSubmit={savePackage}><h3>{originalSlug ? "Sửa gói độ" : "Thêm gói độ"}</h3><div className="admin-fields"><label>Tên gói<input required value={draft.name} onChange={(event) => { const name = event.target.value; setDraft((current) => ({ ...current, name, slug: slugManuallyEdited ? current.slug : slugFromTitle(name) })); }}/></label><label>Slug URL<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={draft.slug} onChange={(event) => { setSlugManuallyEdited(true); setField("slug", event.target.value); }} placeholder="vf3-goi-tien-nghi"/><small>Tự tạo từ tiêu đề; bạn có thể sửa. Đổi slug sẽ chuyển hướng URL cũ.</small></label><label>Dòng xe<input required value={draft.vehicle} onChange={(event) => setField("vehicle", event.target.value)}/></label><label>Phong cách<input required value={draft.style} onChange={(event) => setField("style", event.target.value)}/></label><label>Ngân sách / lọc<input required value={draft.budget} onChange={(event) => setField("budget", event.target.value)}/></label><label>Khoảng giá hiển thị<input required value={draft.range} onChange={(event) => setField("range", event.target.value)}/></label><label className="admin-wide">Mô tả<textarea required rows={3} value={draft.text} onChange={(event) => setField("text", event.target.value)}/></label><label className="admin-wide">Hạng mục (mỗi dòng một mục)<textarea rows={4} value={draft.items.join("\n")} onChange={(event) => setField("items", event.target.value.split("\n"))}/></label><label className="admin-upload admin-multi-upload">Tải nhiều ảnh gói độ<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event.target.files, "package")}/></label><span className="admin-upload-hint">Tối đa 20 ảnh · JPG, PNG hoặc WebP · 8 MB mỗi ảnh.</span><label className="admin-upload admin-multi-upload">Tải video gói độ<input type="file" multiple accept="video/mp4,video/webm,.mp4,.webm" onChange={(event) => void uploadPackageVideos(event.target.files)}/></label><span className="admin-upload-hint">Tối đa 8 video MP4/WebM · 100 MB mỗi tệp · phát tự động khi cuộn tới.</span><label className="admin-check"><input type="checkbox" checked={draft.active} onChange={(event) => setField("active", event.target.checked)}/> Hiển thị trên website</label></div>{draft.images.length > 0 && <div className="article-admin-images">{draft.images.map((image, index) => <div className="article-admin-image" key={`${image.url}-${index}`}><div className="article-admin-thumb" style={{ backgroundImage: `url("${image.url}")` }} role="img" aria-label={image.alt}/><div className="article-admin-image-fields"><label>Alt text<input required maxLength={240} value={image.alt} onChange={(event) => setField("images", draft.images.map((entry, i) => i === index ? { ...entry, alt: event.target.value } : entry))}/></label><label>Chú thích ảnh<input maxLength={300} value={image.caption} onChange={(event) => setField("images", draft.images.map((entry, i) => i === index ? { ...entry, caption: event.target.value } : entry))}/></label><button type="button" className="admin-image-remove" onClick={() => setField("images", draft.images.filter((_, i) => i !== index))}>Gỡ ảnh khỏi gói</button></div></div>)}</div>}{draft.videos.length > 0 && <div className="article-admin-images">{draft.videos.map((video, index) => <div className="article-admin-image" key={`${video.url}-${index}`}><video className="admin-video-preview" src={video.url} muted playsInline controls preload="metadata"/><div className="article-admin-image-fields"><label>Tên hiển thị<input required maxLength={180} value={video.title} onChange={(event) => setField("videos", draft.videos.map((entry, i) => i === index ? { ...entry, title: event.target.value } : entry))}/></label><button type="button" className="admin-image-remove" onClick={() => setField("videos", draft.videos.filter((_, i) => i !== index))}>Gỡ video khỏi gói</button></div></div>)}</div>}<div className="admin-form-actions"><button type="button" className="admin-logout" onClick={startNewPackage}>Làm mới biểu mẫu</button><button className="button" disabled={busy}>{busy ? "Đang lưu…" : "Lưu gói độ"}</button></div></form></section>
    <ArticleAdmin />
    <p className="admin-footnote">Lưu ý: đây là khu vực quản trị nội dung, chưa phải CRM. Ảnh tải lên máy chủ local phù hợp xem thử; production nên chuyển sang object storage có backup.</p>
  </div>;
}
