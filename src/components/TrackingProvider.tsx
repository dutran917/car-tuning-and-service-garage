"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track } from "@/lib/tracking";

export function TrackingProvider() {
  const path = usePathname();
  const params = useSearchParams();

  useEffect(() => {
    // 1. Capture marketing touchpoints (UTM, gclid, etc.) immediately on landing
    const paramsNow = new URLSearchParams(window.location.search);
    const gclid = paramsNow.get("gclid");
    const utmSource = paramsNow.get("utm_source");
    const utmMedium = paramsNow.get("utm_medium");
    const isGoogleAds = Boolean(gclid || (utmSource === "google" && (utmMedium === "cpc" || utmMedium === "ads")));

    const touch = {
      landingPage: window.location.pathname,
      referrer: document.referrer || "",
      capturedAt: new Date().toISOString(),
      isGoogleAds,
      ...Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "gbraid", "wbraid", "fbclid"].map(key => [key, paramsNow.get(key)]))
    };

    try {
      if (isGoogleAds) {
        sessionStorage.setItem("qda-is-google-ads", "1");
        if (gclid) sessionStorage.setItem("qda-gclid", gclid);
      }
      if (!localStorage.getItem("qda-first-touch")) {
        localStorage.setItem("qda-first-touch", JSON.stringify(touch));
      }
      const hasCampaign = Object.entries(touch).some(([key, value]) => key.startsWith("utm_") || ["gclid", "gbraid", "wbraid", "fbclid"].includes(key) ? Boolean(value) : false);
      if (hasCampaign) {
        localStorage.setItem("qda-last-non-direct", JSON.stringify(touch));
      }
      sessionStorage.setItem("qda-session-touch", JSON.stringify(touch));
    } catch {
      /* Storage is safe to fail */
    }

    // 2. Track Page View
    track({
      event: "page_view",
      page_type: path.split("/")[1] || "home",
      gclid: gclid || undefined,
      source: isGoogleAds ? "google_ads" : utmSource || undefined
    });

    // 3. Track Content Views
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

    // 4. Click Listener for Phone, Zalo, Quote
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      const kind = anchor.dataset.track || (href.startsWith("tel:") ? "phone" : href.includes("zalo.me/") ? "zalo" : href.includes("m.me/") ? "messenger" : "");
      
      const currentIsGoogleAds = sessionStorage.getItem("qda-is-google-ads") === "1";
      const currentGclid = sessionStorage.getItem("qda-gclid") || undefined;
      const adContext = {
        is_google_ads: currentIsGoogleAds,
        gclid: currentGclid,
        source: currentIsGoogleAds ? "google_ads" : undefined,
      };

      if (kind === "phone") {
        track({ event: "click_phone", page_type: path.split("/")[1] || "home", ...adContext });
      }
      if (kind === "zalo") {
        track({ event: "click_zalo", page_type: path.split("/")[1] || "home", ...adContext });
      }
      if (kind === "messenger") {
        track({ event: "click_messenger", page_type: path.split("/")[1] || "home", ...adContext });
      }
      if (kind === "facebook") {
        track({ event: "click_facebook", page_type: path.split("/")[1] || "home", ...adContext });
      }
      if (href.startsWith("/tu-van")) {
        track({ event: "click_quote", page_type: path.split("/")[1] || "home", ...adContext });
      }
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
    };
  }, [path, params]);

  return null;
}
