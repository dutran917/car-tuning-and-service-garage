import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { seedManagedArticles, seedManagedPackages } from "@/lib/managed-content";

export const runtime = "nodejs";

function safeImage(value: unknown): value is string | null {
  return value === null || value === "" || (typeof value === "string" && value.length <= 2000 && (value.startsWith("/uploads/") || /^https:\/\//i.test(value)));
}

function safeVideos(value: unknown) {
  return Array.isArray(value) && value.length <= 8 && value.every((entry) => entry && typeof entry === "object" && typeof (entry as Record<string, unknown>).url === "string" && ((entry as Record<string, unknown>).url as string).length <= 2000 && ((entry as Record<string, unknown>).url as string).match(/^(\/uploads\/|https:\/\/)/i) && typeof (entry as Record<string, unknown>).title === "string" && ((entry as Record<string, unknown>).title as string).length <= 180);
}

function parsePackage(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const fields = ["slug", "name", "vehicle", "style", "budget", "range", "text"] as const;
  if (fields.some((key) => typeof input[key] !== "string" || !(input[key] as string).trim() || (input[key] as string).length > (key === "text" ? 1800 : 180))) return null;
  const slug = input.slug as string;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  if (!Array.isArray(input.items) || input.items.length > 20 || input.items.some((item) => typeof item !== "string" || item.length > 180)) return null;
  if (!safeImage(input.imageUrl ?? null)) return null;
  if (!Array.isArray(input.images) || input.images.length > 20) return null;
  const images = input.images.map((entry) => {
    if (!entry || typeof entry !== "object") return null;
    const image = entry as Record<string, unknown>;
    if (!safeImage(image.url) || typeof image.alt !== "string" || !image.alt.trim() || image.alt.length > 240 || typeof image.caption !== "string" || image.caption.length > 300) return null;
    return { url: image.url, alt: image.alt.trim(), caption: image.caption.trim() };
  });
  if (images.some((image) => image === null)) return null;
  if (!safeVideos(input.videos ?? [])) return null;
  const videos = (input.videos ?? []) as { url: string; title: string }[];
  return { slug, name: input.name as string, vehicle: input.vehicle as string, style: input.style as string, budget: input.budget as string, range: input.range as string, text: input.text as string, items: input.items as string[], imageUrl: null, images, videos, active: input.active !== false, sortOrder: Number.isInteger(input.sortOrder) ? input.sortOrder as number : 0 };
}

function parseArticle(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const textFields = ["slug", "title", "category", "date", "intro", "related"] as const;
  if (textFields.some((key) => typeof input[key] !== "string" || !(input[key] as string).trim() || (input[key] as string).length > (key === "intro" ? 600 : 180))) return null;
  const slug = input.slug as string;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^\d{4}-\d{2}-\d{2}$/.test(input.date as string) || Number.isNaN(Date.parse(`${input.date}T00:00:00Z`))) return null;
  if (!Array.isArray(input.body) || input.body.length < 1 || input.body.length > 50 || input.body.some((part) => typeof part !== "string" || !part.trim() || part.length > 5000)) return null;
  const body = input.body as string[];
  if (!Array.isArray(input.images) || input.images.length > 20) return null;
  const images = input.images.map((entry) => {
    if (!entry || typeof entry !== "object") return null;
    const image = entry as Record<string, unknown>;
    if (!safeImage(image.url) || typeof image.alt !== "string" || !image.alt.trim() || image.alt.length > 240 || typeof image.caption !== "string" || image.caption.length > 300 || !Number.isInteger(image.afterParagraph)) return null;
    const afterParagraph = image.afterParagraph as number;
    if (afterParagraph < 0 || afterParagraph > body.length) return null;
    return { url: image.url, alt: image.alt.trim(), caption: image.caption.trim(), afterParagraph };
  });
  if (images.some((image) => image === null)) return null;
  if (!safeVideos(input.videos ?? [])) return null;
  const videos = (input.videos ?? []) as { url: string; title: string }[];
  return { slug, title: input.title as string, category: input.category as string, date: input.date as string, intro: input.intro as string, body, related: input.related as string, images, videos, active: input.active !== false };
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Cần đăng nhập." }, { status: 401 });
  await Promise.all([seedManagedPackages(), seedManagedArticles()]);
  const prisma = getPrisma();
  const [packages, hero, articles] = await Promise.all([
    prisma.managedPackage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.siteSetting.findUnique({ where: { key: "heroImage" } }),
    prisma.managedArticle.findMany({ orderBy: [{ date: "desc" }, { createdAt: "desc" }] }),
  ]);
  return NextResponse.json({ packages, heroImage: hero?.value ?? "", articles });
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  if (!await isAdmin()) return NextResponse.json({ error: "Cần đăng nhập." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 }); }
  try {
  const input = body as { heroImage?: unknown; package?: unknown; deleteSlug?: unknown; article?: unknown; deleteArticleSlug?: unknown };
  const prisma = getPrisma();
  if (typeof input.heroImage !== "undefined") {
    if (!safeImage(input.heroImage)) return NextResponse.json({ error: "Ảnh cần là URL HTTPS hoặc ảnh đã tải lên." }, { status: 400 });
    await prisma.siteSetting.upsert({ where: { key: "heroImage" }, update: { value: input.heroImage || "" }, create: { key: "heroImage", value: input.heroImage || "" } });
    return NextResponse.json({ ok: true });
  }
  if (typeof input.deleteSlug === "string") {
    await prisma.managedPackage.delete({ where: { slug: input.deleteSlug } });
    return NextResponse.json({ ok: true });
  }
  if (typeof input.deleteArticleSlug === "string") {
    await prisma.managedArticle.delete({ where: { slug: input.deleteArticleSlug } });
    return NextResponse.json({ ok: true });
  }
  if (typeof input.article !== "undefined") {
    const parsed = parseArticle(input.article);
    if (!parsed) return NextResponse.json({ error: "Kiểm tra tiêu đề, slug, nội dung và thông tin ảnh của bài viết." }, { status: 400 });
    const { slug, ...data } = parsed;
    const saved = await prisma.managedArticle.upsert({ where: { slug }, update: data, create: { slug, ...data } });
    return NextResponse.json({ ok: true, slug: saved.slug });
  }
  const parsed = parsePackage(input.package);
  if (!parsed) return NextResponse.json({ error: "Kiểm tra các trường gói độ và định dạng slug." }, { status: 400 });
  const { slug, ...data } = parsed;
  const originalSlug = input.package && typeof input.package === "object" && typeof (input.package as Record<string, unknown>).originalSlug === "string" ? ((input.package as Record<string, unknown>).originalSlug as string).trim() : "";
  if (originalSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(originalSlug)) return NextResponse.json({ error: "Slug cũ không hợp lệ." }, { status: 400 });
  if (originalSlug) {
    const original = await prisma.managedPackage.findUnique({ where: { slug: originalSlug }, select: { slug: true } });
    if (!original) return NextResponse.json({ error: "Không tìm thấy gói độ cần sửa." }, { status: 404 });
    if (slug !== originalSlug && await prisma.managedPackage.findUnique({ where: { slug }, select: { slug: true } })) return NextResponse.json({ error: "Slug này đã được dùng cho gói khác." }, { status: 409 });
    if (slug === originalSlug) {
      const saved = await prisma.managedPackage.update({ where: { slug }, data });
      return NextResponse.json({ ok: true, slug: saved.slug });
    }
    await prisma.$transaction(async (transaction) => {
      await transaction.managedPackage.update({ where: { slug: originalSlug }, data: { slug, ...data } });
      await transaction.contentRedirect.updateMany({ where: { toPath: `/goi-do/${originalSlug}` }, data: { toPath: `/goi-do/${slug}` } });
      await transaction.contentRedirect.upsert({ where: { fromPath: `/goi-do/${originalSlug}` }, update: { toPath: `/goi-do/${slug}` }, create: { fromPath: `/goi-do/${originalSlug}`, toPath: `/goi-do/${slug}` } });
    });
    return NextResponse.json({ ok: true, slug, redirectFrom: originalSlug });
  }
  if (await prisma.managedPackage.findUnique({ where: { slug }, select: { slug: true } })) return NextResponse.json({ error: "Slug này đã tồn tại. Hãy chọn gói cần sửa trong danh sách." }, { status: 409 });
  const saved = await prisma.managedPackage.create({ data: { slug, ...data } });
  return NextResponse.json({ ok: true, slug: saved.slug });
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (code === "P1000" || code === "P1001" || code === "P2021" || code === "P2022") {
      return NextResponse.json({ error: "Không thể lưu: kiểm tra database đang chạy và đã cập nhật schema bằng npm run db:push." }, { status: 503 });
    }
    if (code === "P2002") return NextResponse.json({ error: "Slug đã tồn tại. Hãy đổi slug hoặc mở nội dung hiện có để chỉnh sửa." }, { status: 409 });
    if (code === "P2025") return NextResponse.json({ error: "Không tìm thấy nội dung cần cập nhật hoặc xóa." }, { status: 404 });
    console.error("Admin content update failed", code || "UNKNOWN");
    return NextResponse.json({ error: "Lưu thất bại do lỗi máy chủ. Nội dung chưa được cập nhật; hãy thử lại sau." }, { status: 500 });
  }
}
