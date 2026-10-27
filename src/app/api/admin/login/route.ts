import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { adminCookieName, createAdminSession, sameOrigin } from "@/lib/admin-auth";

const attempts = new Map<string, { count: number; resetAt: number }>();

function equalSecret(candidate: string, expected: string) {
  const left = Buffer.from(candidate);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  const config = [process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD, process.env.ADMIN_SESSION_SECRET];
  if (config.some((value) => !value)) return NextResponse.json({ error: "Chưa cấu hình tài khoản quản trị." }, { status: 503 });
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const bucket = attempts.get(address);
  if (bucket && bucket.resetAt > now && bucket.count >= 8) return NextResponse.json({ error: "Thử đăng nhập lại sau 15 phút." }, { status: 429 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 }); }
  const input = body as { username?: unknown; password?: unknown };
  const valid = typeof input.username === "string" && typeof input.password === "string" && equalSecret(input.username, process.env.ADMIN_USERNAME!) && equalSecret(input.password, process.env.ADMIN_PASSWORD!);
  if (!valid) {
    attempts.set(address, { count: bucket && bucket.resetAt > now ? bucket.count + 1 : 1, resetAt: bucket && bucket.resetAt > now ? bucket.resetAt : now + 15 * 60_000 });
    return NextResponse.json({ error: "Tên đăng nhập hoặc mật khẩu chưa đúng." }, { status: 401 });
  }
  attempts.delete(address);
  const session = createAdminSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, session.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: session.maxAge });
  return response;
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
