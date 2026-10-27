"use client";
import { useSyncExternalStore } from "react";
import Script from "next/script";

type Consent = { necessary: true; analytics: boolean; advertising: boolean };
function subscribeConsent(callback: () => void) { window.addEventListener("storage", callback); window.addEventListener("qda-consent-changed", callback); return () => { window.removeEventListener("storage", callback); window.removeEventListener("qda-consent-changed", callback); }; }
function getConsentSnapshot() { return `${localStorage.getItem("qda-consent") || ""}|${localStorage.getItem("qda-consent-open") || ""}`; }
export function ConsentBanner() {
  const consentSnapshot = useSyncExternalStore(subscribeConsent, getConsentSnapshot, () => "pending");
  const [storedConsent, consentOpen] = consentSnapshot.split("|");
  let consent: Consent | null = null;
  try { if (storedConsent && storedConsent !== "pending") consent = JSON.parse(storedConsent); } catch { consent = null; }
  const visible = storedConsent !== "pending" && (consent === null || consentOpen === "1");
  function choose(analytics: boolean, advertising: boolean) {
    const value: Consent = { necessary: true, analytics, advertising };
    localStorage.setItem("qda-consent", JSON.stringify(value));
    localStorage.removeItem("qda-consent-open");
    document.cookie = `qda-consent=${encodeURIComponent(JSON.stringify(value))}; Path=/; Max-Age=15552000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    window.dispatchEvent(new Event("qda-consent-changed"));
  }
  const gtm = process.env.NEXT_PUBLIC_GTM_ID;
  return <>
    {consent && (consent.analytics || consent.advertising) && gtm && <><Script id="gtm-loader" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm.replace(/[^A-Z0-9-]/gi, "")}');` }} /></>}
    {visible && <aside className="consent" aria-label="Tùy chọn quyền riêng tư"><div><strong>Quyền riêng tư của bạn</strong><p>Cookie cần thiết giúp website hoạt động. Bạn có thể cho phép cookie phân tích và quảng cáo để đo hiệu quả tiếp thị.</p><a href="/quyen-rieng-tu">Tìm hiểu cách chúng tôi xử lý dữ liệu</a></div><div className="consent-actions"><button className="button button-outline button-small" onClick={() => choose(false, false)}>Từ chối tùy chọn</button><button className="button button-outline button-small" onClick={() => choose(true, false)}>Chỉ phân tích</button><button className="button button-small" onClick={() => choose(true, true)}>Đồng ý tất cả</button></div></aside>}
  </>;
}
