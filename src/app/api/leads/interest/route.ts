import { NextRequest, NextResponse } from "next/server";
import { sendPackageInterestNotification } from "@/lib/lead-notification";

export const runtime = "nodejs";

const interestRateLimit = new Map<string, { count: number; reset: number }>();

function safeString(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const max = 15; // 15 clicks per minute per ip

  if (interestRateLimit.size > 1000) {
    for (const [key, value] of interestRateLimit) {
      if (value.reset <= now) interestRateLimit.delete(key);
    }
  }

  const bucket = interestRateLimit.get(ip);
  if (bucket && bucket.reset > now && bucket.count >= max) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  if (!bucket || bucket.reset <= now) {
    interestRateLimit.set(ip, { count: 1, reset: now + windowMs });
  } else {
    bucket.count++;
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const packageSlug = safeString(body.packageSlug, 120);
  const packageName = safeString(body.packageName, 200) || "Gói độ xe";
  const vehicle = safeString(body.vehicle, 120) || "VinFast VF3";
  const action = safeString(body.action, 50) || "chat_zalo";
  const pageUrl = safeString(body.pageUrl, 500) || `https://quocduong-auto.com/goi-do/${packageSlug}`;

  // Fire notification asynchronously in background
  try {
    await sendPackageInterestNotification({
      packageSlug,
      packageName,
      vehicle,
      action,
      pageUrl,
    });
  } catch (err) {
    console.error("package_interest_notification_failed", err);
  }

  return NextResponse.json({ ok: true });
}