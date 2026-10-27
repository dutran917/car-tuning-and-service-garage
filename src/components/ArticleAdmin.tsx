"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ArticleImage, ManagedArticle, ManagedVideo } from "@/lib/managed-content";
import { uploadMedia } from "@/lib/upload-media";

type AdminArticle = ManagedArticle & { active: boolean };
const emptyArticle = (): AdminArticle => ({ slug: "", title: "", category: "Cẩm nang VF3", date: new Date().toISOString().slice(0, 10), intro: "", body: [""], related: "tu-van-concept", images: [], videos: [], active: true });

async function readResponse(response: Response) {
  return response.json().catch(() => ({ error: `Máy chủ trả lỗi HTTP ${response.status}; nội dung chưa được lưu.` }));
}

export function ArticleAdmin() {
  const pathname = usePathname();
  const editorSlug = pathname.startsWith("/admin/bai-viet/") ? decodeURIComponent(pathname.split("/").at(-1) ?? "") : null;
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [draft, setDraft] = useState<AdminArticle>(emptyArticle());
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch("/api/admin/content", { cache: "no-store" });
    if (!response.ok) return [] as AdminArticle[];
    const data = await response.json();
    setArticles(data.articles);
    return data.articles as AdminArticle[];
  }

  useEffect(() => {
    const notice = window.sessionStorage.getItem("admin-content-notice");
    if (notice) { setStatus(notice); window.sessionStorage.removeItem("admin-content-notice"); }
    void load().then((items) => {
      if (!editorSlug) return;
      if (editorSlug === "new") { setDraft(emptyArticle()); return; }
      const article = items.find((entry) => entry.slug === editorSlug);
      if (article) setDraft({ ...article, body: [...article.body], images: article.images.map((image) => ({ ...image })), videos: (article.videos ?? []).map((video) => ({ ...video })) });
    });
  }, [editorSlug]);

  function change<K extends keyof AdminArticle>(key: K, value: AdminArticle[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setStatus("");
    try {
      const added = await Promise.all(Array.from(files).map(async (file, index): Promise<ArticleImage> => {
        const uploadedFile = await uploadMedia(file);
        return { url: uploadedFile.url, alt: `${draft.title || "Ảnh minh họa bài viết"} — ảnh ${(draft.images.length + index + 1)}`, caption: "", afterParagraph: 1 };
      }));
      setDraft((current) => ({ ...current, images: [...current.images, ...added] }));
      setStatus(`Đã tải ${added.length} ảnh. Bổ sung alt và chú thích trước khi lưu bài.`);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Tải ảnh thất bại."); }
    finally { setBusy(false); }
  }

  async function uploadVideos(files: FileList | null) {
    if (!files?.length) return;
    if ((draft.videos?.length ?? 0) + files.length > 8) { setStatus("Mỗi bài viết tối đa 8 video."); return; }
    setBusy(true); setStatus("");
    try {
      const added = await Promise.all(Array.from(files).map(async (file): Promise<ManagedVideo> => {
        const uploadedFile = await uploadMedia(file);
        return { url: uploadedFile.url, title: "" };
      }));
      change("videos", [...(draft.videos ?? []), ...added]);
      setStatus(`Đã tải ${added.length} video. Video phát tự động ở chế độ tắt tiếng.`);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Tải video thất bại."); }
    finally { setBusy(false); }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("");
    const body = draft.body.flatMap((value) => value.split(/\n\s*\n/)).map((value) => value.trim()).filter(Boolean);
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ article: { ...draft, body } }) });
      const data = await readResponse(response);
      if (!response.ok) throw new Error(data.error || "Không lưu được bài viết.");
      window.sessionStorage.setItem("admin-content-notice", "Đã lưu bài viết. Nội dung và thư viện ảnh đã cập nhật trên website."); window.location.reload();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Có lỗi khi lưu bài viết."); }
    finally { setBusy(false); }
  }

  async function remove(slug: string) {
    if (!window.confirm(`Xóa bài “${slug}”?`)) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deleteArticleSlug: slug }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Không xóa được bài viết.");
      await load(); setStatus("Đã xóa bài viết.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Không xóa được bài viết."); }
    finally { setBusy(false); }
  }

  const existingSlug = articles.some((article) => article.slug === draft.slug);
  return <section className="admin-card"><div className="admin-card-title"><div><span>03 / KIẾN THỨC</span><h2>Bài viết & thư viện ảnh</h2></div><p>Mỗi bài có thể có nhiều ảnh, alt text, chú thích và vị trí xuất hiện sau từng đoạn nội dung.</p></div>
    {status && <p className="admin-status" role="status">{status}</p>}
    <div className="admin-package-list">{articles.map((article) => <article key={article.slug}><div><Link className="admin-content-link" href={`/kien-thuc/${article.slug}`} target="_blank" rel="noreferrer"><strong>{article.title} ↗</strong></Link><span>{article.slug} · {article.images.length} ảnh · {article.videos?.length ?? 0} video</span></div><div className="admin-row-actions"><button type="button" onClick={() => setDraft({ ...article, body: [...article.body], images: article.images.map((image) => ({ ...image })), videos: (article.videos ?? []).map((video) => ({ ...video })) })}>Sửa</button><button type="button" onClick={() => void remove(article.slug)}>Xóa</button></div></article>)}</div>
    <form className="admin-editor" onSubmit={save}><h3>{existingSlug ? "Sửa bài viết" : "Thêm bài viết"}</h3><div className="admin-fields"><label>Tiêu đề<input required maxLength={180} value={draft.title} onChange={(event) => change("title", event.target.value)}/></label><label>Slug URL<input required disabled={existingSlug} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={draft.slug} onChange={(event) => change("slug", event.target.value)}/></label><label>Chuyên mục<input required value={draft.category} onChange={(event) => change("category", event.target.value)}/></label><label>Ngày đăng<input required type="date" value={draft.date} onChange={(event) => change("date", event.target.value)}/></label><label className="admin-wide">Mô tả mở đầu<textarea required maxLength={600} rows={2} value={draft.intro} onChange={(event) => change("intro", event.target.value)}/></label><label className="admin-wide">Nội dung bài viết<textarea required rows={10} value={draft.body.join("\n\n")} onChange={(event) => change("body", event.target.value.split(/\n\s*\n/))} placeholder="Mỗi đoạn cách nhau một dòng trống."/></label><label>Dịch vụ liên quan (slug)<input required value={draft.related} onChange={(event) => change("related", event.target.value)}/></label><label className="admin-check"><input type="checkbox" checked={draft.active} onChange={(event) => change("active", event.target.checked)}/> Hiển thị bài viết</label></div>
      <label className="admin-upload admin-multi-upload">Thêm nhiều ảnh cùng lúc<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event.target.files)}/></label><span className="admin-upload-hint">Chọn nhiều ảnh JPG, PNG hoặc WebP · tối đa 8 MB mỗi ảnh.</span>
      <label className="admin-upload admin-multi-upload">Tải video bài viết<input type="file" multiple accept="video/mp4,video/webm,.mp4,.webm" onChange={(event) => void uploadVideos(event.target.files)}/></label><span className="admin-upload-hint">Tối đa 8 video MP4/WebM · 100 MB mỗi tệp · phát tự động khi cuộn tới.</span>
      {draft.images.length > 0 && <div className="article-admin-images">{draft.images.map((image, index) => <div className="article-admin-image" key={`${image.url}-${index}`}><div className="article-admin-thumb" style={{ backgroundImage: `url("${image.url}")` }} role="img" aria-label={image.alt}/><div className="article-admin-image-fields"><label>Alt text<input required maxLength={240} value={image.alt} onChange={(event) => change("images", draft.images.map((entry, i) => i === index ? { ...entry, alt: event.target.value } : entry))}/></label><label>Chú thích ảnh<input maxLength={300} value={image.caption} onChange={(event) => change("images", draft.images.map((entry, i) => i === index ? { ...entry, caption: event.target.value } : entry))}/></label><label>Chèn sau đoạn<input type="number" min={0} max={draft.body.length} value={image.afterParagraph} onChange={(event) => change("images", draft.images.map((entry, i) => i === index ? { ...entry, afterParagraph: Number(event.target.value) } : entry))}/></label><button type="button" className="admin-image-remove" onClick={() => change("images", draft.images.filter((_, i) => i !== index))}>Gỡ ảnh khỏi bài</button></div></div>)}</div>}
      {(draft.videos ?? []).length > 0 && <div className="article-admin-images">{(draft.videos ?? []).map((video, index) => <div className="article-admin-image" key={`${video.url}-${index}`}><video className="admin-video-preview" src={video.url} muted playsInline controls preload="metadata"/><div className="article-admin-image-fields"><label>Chú thích video (không bắt buộc)<input maxLength={180} value={video.title} onChange={(event) => change("videos", (draft.videos ?? []).map((entry, i) => i === index ? { ...entry, title: event.target.value } : entry))}/></label><button type="button" className="admin-image-remove" onClick={() => change("videos", (draft.videos ?? []).filter((_, i) => i !== index))}>Gỡ video khỏi bài</button></div></div>)}</div>}
      <div className="admin-form-actions"><button type="button" className="admin-logout" onClick={() => setDraft(emptyArticle())}>Bài mới</button><button className="button" disabled={busy}>{busy ? "Đang lưu…" : "Lưu bài viết"}</button></div>
    </form>
  </section>;
}
