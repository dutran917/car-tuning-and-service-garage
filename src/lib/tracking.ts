export type MarketingEventName = "page_view" | "view_service" | "view_package" | "view_project" | "click_phone" | "click_zalo" | "click_messenger" | "click_facebook" | "click_quote" | "form_start" | "generate_lead" | "qualify_lead" | "appointment_booked" | "sale_won" | "purchase" | "refund" | "order_cancelled";
export type MarketingEvent = { event: MarketingEventName; event_id?: string; page_type?: string; service_id?: string; package_id?: string; project_id?: string; lead_id?: string; order_id?: string; currency?: "VND"; value?: number; transaction_id?: string; gclid?: string; source?: string; [key: string]: unknown };

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: MarketingEvent) {
  if (typeof window === "undefined") return;
  
  // Always push to dataLayer for Google Tag Manager & Google Ads
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event as Record<string, unknown>);

  // If gtag is available, also fire standard gtag event
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", event.event, {
        event_category: "Engagement",
        event_label: event.page_type || window.location.pathname,
        ...event,
      });
    } catch {
      // Ignore gtag delivery failures
    }
  }
}
