"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track } from "@/lib/tracking";

export function TrackingProvider() {
  const path = usePathname();
  const params = useSearchParams();
  useEffect(() => {
    const onConsentChange = () => track({ event: "page_view", page_type: path.split("/")[1] || "home" });
    window.addEventListener("qda-consent-changed", onConsentChange);
    track({ event: "page_view", page_type: path.split("/")[1] || "home" });
    const consent = (() => { try { return JSON.parse(localStorage.getItem("qda-consent") || "{}"); } catch { return {}; } })();
    if (!consent.analytics && !consent.advertising) return () => window.removeEventListener("qda-consent-changed", onConsentChange);
    const paramsNow = new URLSearchParams(window.location.search);
    const touch = { landingPage: window.location.pathname, referrer: document.referrer || "", capturedAt: new Date().toISOString(), ...Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "gbraid", "wbraid", "fbclid"].map(key => [key, paramsNow.get(key)])) };
    try {
      if (!localStorage.getItem("qda-first-touch")) localStorage.setItem("qda-first-touch", JSON.stringify(touch));
      const hasCampaign = Object.entries(touch).some(([key, value]) => key.startsWith("utm_") || ["gclid", "gbraid", "wbraid", "fbclid"].includes(key) ? Boolean(value) : false);
      if (hasCampaign) localStorage.setItem("qda-last-non-direct", JSON.stringify(touch));
      sessionStorage.setItem("qda-session-touch", JSON.stringify(touch));
    } catch { /* Attribution storage is optional. */ }
    const viewed = new Set<string>();
    const emitContentView = () => {
      const segments = path.split("/").filter(Boolean);
      if (segments.length !== 2 || viewed.has(path)) return;
      viewed.add(path);
      const kind = segments[0] === "dich-vu" ? "service" : segments[0] === "goi-do" ? "package" : segments[0] === "du-an" ? "project" : null;
      if (kind === "service") track({ event: "view_service", page_type: "service", service_id: segments[1] });
      if (kind === "package") track({ event: "view_package", page_type: "package", package_id: segments[1] });
      if (kind === "project") track({ event: "view_project", page_type: "project", project_id: segments[1] });
    };
    emitContentView();
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      const kind = anchor.dataset.track || (href.startsWith("tel:") ? "phone" : href.includes("zalo.me/") ? "zalo" : "");
      if (kind === "phone") track({ event: "click_phone", page_type: path.split("/")[1] || "home" });
      if (kind === "zalo") track({ event: "click_zalo", page_type: path.split("/")[1] || "home" });
      if (kind === "facebook") track({ event: "click_facebook", page_type: path.split("/")[1] || "home" });
      if (href.startsWith("/tu-van")) track({ event: "click_quote", page_type: path.split("/")[1] || "home" });
    };
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("click", onClick); window.removeEventListener("qda-consent-changed", onConsentChange); };
  }, [path, params]);
  return null;
}
