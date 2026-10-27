import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  if (!await isAdmin()) return NextResponse.json({ error: "Cần đăng nhập." }, { status: 401 });
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (process.env.NODE_ENV === "production" && contentLength > 4 * 1024 * 1024) return NextResponse.json({ error: "Production yêu cầu tải trực tiếp lên Supabase Storage; kiểm tra cấu hình public URL và publishable key." }, { status: 413 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size < 1 || file.size > 100 * 1024 * 1024) return NextResponse.json({ error: "Tệp phải nhỏ hơn 100 MB." }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  let extension: string | null = null;
  let mediaType: "image" | "video" = "image";
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) extension = "png";
  if (bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) extension = "jpg";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") extension = "webp";
  if (bytes.toString("ascii", 4, 8) === "ftyp" && ["isom", "iso2", "mp41", "mp42", "M4V ", "avc1"].includes(bytes.toString("ascii", 8, 12))) { extension = "mp4"; mediaType = "video"; }
  if (bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) { extension = "webm"; mediaType = "video"; }
  if (!extension || (mediaType === "image" && file.size > 8 * 1024 * 1024)) return NextResponse.json({ error: "Ảnh JPG, PNG, WebP tối đa 8 MB; video MP4/WebM tối đa 100 MB." }, { status: 400 });
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  const storageUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const storageKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (storageUrl && storageKey && bucket && /^[a-z0-9_-]+$/i.test(bucket)) {
    const response = await fetch(`${storageUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${filename}`, {
      method: "POST",
      headers: { apikey: storageKey, Authorization: `Bearer ${storageKey}`, "Content-Type": file.type || "application/octet-stream", "x-upsert": "false" },
      body: new Uint8Array(bytes),
      signal: AbortSignal.timeout(30_000),
      cache: "no-store",
    }).catch(() => null);
    if (!response?.ok) return NextResponse.json({ error: "Không tải được tệp lên object storage. Kiểm tra cấu hình Supabase Storage." }, { status: 502 });
    return NextResponse.json({ url: `${storageUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${filename}`, mediaType });
  }
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Production cần cấu hình Supabase Storage trước khi tải ảnh hoặc video." }, { status: 503 });
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), bytes, { flag: "wx", mode: 0o644 });
  return NextResponse.json({ url: `/uploads/${filename}`, mediaType });
}
