import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  // No emails are dispatched on click interest.
  // Emails are strictly sent ONLY when the customer submits the consultation form.
  return NextResponse.json({ ok: true });
}