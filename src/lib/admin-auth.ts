import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const adminCookieName = "qda_admin";
const sessionDuration = 8 * 60 * 60;

function signature(expiresAt: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return createHmac("sha256", secret).update(`admin:${expiresAt}`).digest("base64url");
}

export function verifyAdminSession(value?: string) {
  if (!value) return false;
  const [expiresAt, providedSignature] = value.split(".");
  if (!expiresAt || !providedSignature || Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;
  const expected = signature(expiresAt);
  const provided = Buffer.from(providedSignature);
  const trusted = Buffer.from(expected);
  return provided.length === trusted.length && timingSafeEqual(provided, trusted);
}

export function createAdminSession() {
  const expiresAt = String(Math.floor(Date.now() / 1000) + sessionDuration);
  return { value: `${expiresAt}.${signature(expiresAt)}`, maxAge: sessionDuration };
}

export async function isAdmin() {
  const store = await cookies();
  return verifyAdminSession(store.get(adminCookieName)?.value);
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
