import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  if (!await isAdmin()) return NextResponse.json({ error: "Cần đăng nhập." }, { status: 401 });

  const input = await request.json().catch(() => null) as { type?: unknown; size?: unknown } | null;
  const type = typeof input?.type === "string" ? input.type : "";
  const size = typeof input?.size === "number" ? input.size : 0;
  const extension = allowedTypes[type];
  const maxSize = type.startsWith("video/") ? 100 * 1024 * 1024 : 8 * 1024 * 1024;
  if (!extension || !Number.isSafeInteger(size) || size < 1 || size > maxSize) return NextResponse.json({ error: "Định dạng hoặc dung lượng tệp không hợp lệ." }, { status: 400 });

  const storageUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const storageKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!storageUrl || !storageKey || !bucket || !/^[a-z0-9_-]+$/i.test(bucket)) return NextResponse.json({ error: "Chưa cấu hình Supabase Storage." }, { status: 503 });

  const objectPath = `uploads/${randomUUID()}.${extension}`;
  const signUrl = `${storageUrl}/storage/v1/object/upload/sign/${encodeURIComponent(bucket)}/${objectPath}`;
  const signedResponse = await fetch(signUrl, {
    method: "POST",
    headers: { apikey: storageKey, Authorization: `Bearer ${storageKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({}),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  }).catch(() => null);
  if (!signedResponse?.ok) return NextResponse.json({ error: "Không thể tạo liên kết tải lên. Kiểm tra bucket và quyền Storage." }, { status: 502 });

  const result = await signedResponse.json() as { url?: unknown };
  if (typeof result.url !== "string") return NextResponse.json({ error: "Storage trả về liên kết tải lên không hợp lệ." }, { status: 502 });
  const uploadUrl = result.url.startsWith("https://") ? result.url : `${storageUrl}/storage/v1${result.url}`;
  const publicUrl = `${storageUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectPath}`;
  return NextResponse.json({ uploadUrl, publicUrl, type });
}
