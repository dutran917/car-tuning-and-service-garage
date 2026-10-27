export type MarketingEventName = "page_view" | "view_service" | "view_package" | "view_project" | "click_phone" | "click_zalo" | "click_facebook" | "click_quote" | "form_start" | "generate_lead" | "qualify_lead" | "appointment_booked" | "sale_won" | "purchase" | "refund" | "order_cancelled";
export type MarketingEvent = { event: MarketingEventName; event_id?: string; page_type?: string; service_id?: string; package_id?: string; project_id?: string; lead_id?: string; order_id?: string; currency?: "VND"; value?: number; transaction_id?: string };

declare global { interface Window { dataLayer?: Record<string, unknown>[]; } }

export function track(event: MarketingEvent) {
  if (typeof window === "undefined") return;
  const consent = localStorage.getItem("qda-consent");
  if (!consent) return;
  try {
    const parsed = JSON.parse(consent) as { analytics?: boolean; advertising?: boolean };
    if (!parsed.analytics && !parsed.advertising) return;
  } catch { return; }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event as unknown as Record<string, unknown>);
}
