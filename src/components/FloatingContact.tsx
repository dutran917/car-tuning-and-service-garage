"use client";

import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

export function FloatingContact() {
  const pathname = usePathname();

  function handleZaloClick() {
    if (typeof window !== "undefined" && pathname.startsWith("/goi-do/")) {
      const fullUrl = window.location.href;
      const slug = pathname.replace("/goi-do/", "");
      const msg = `Chào Quốc Dương Auto (0399.513.456), tôi đang xem bài viết/gói độ tại: ${fullUrl}. Nhờ gara tư vấn cấu hình và báo giá giúp tôi!`;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(msg).catch(() => null);
        }
      } catch {}

      try {
        fetch("/api/leads/interest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageSlug: slug,
            packageName: "Khách xem chi tiết gói độ",
            vehicle: "Xe khách quan tâm",
            action: "floating_zalo",
            pageUrl: fullUrl,
          }),
        }).catch(() => null);
      } catch {}
    }
  }

  return (
    <aside className="floating-contact" aria-label="Liên hệ nhanh">
      <a
        className="floating-btn floating-zalo"
        href={site.zalo}
        target="_blank"
        rel="noreferrer"
        data-track="zalo"
        aria-label="Chat Zalo với Quốc Dương Auto"
        onClick={handleZaloClick}
      >
        <span className="floating-icon zalo-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.5 5.43 3.86 7.02-.17.95-.7 2.68-1.55 3.73-.13.16-.03.39.17.41 1.45.15 3.56-.37 5.07-1.42.8.17 1.62.26 2.45.26 5.52 0 10-4.03 10-9s-4.48-9-10-9zm-1.8 11.8H7.4a.6.6 0 0 1-.6-.6v-.3c0-.33.27-.6.6-.6h1.7l-2.2-2.8a.6.6 0 0 1 .47-.9h2.7c.33 0 .6.27.6.6v.3c0 .33-.27.6-.6.6H8.9l2.2 2.8c.2.25.1.9-.9.9zm3.8 0h-1.6a.6.6 0 0 1-.6-.6V8.6c0-.33.27-.6.6-.6h1.6c1.2 0 2.1.8 2.1 2.4 0 1.5-.9 2.4-2.1 2.4zm0-1.2c.5 0 .9-.4.9-1.2 0-.8-.4-1.2-.9-1.2h-.4v2.4h.4z"/>
          </svg>
        </span>
        <span className="floating-label">Chat Zalo</span>
      </a>

      <a
        className="floating-btn floating-phone"
        href={`tel:${site.phone}`}
        data-track="phone"
        aria-label="Gọi hotline Quốc Dương Auto"
      >
        <span className="floating-icon phone-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </span>
        <span className="floating-label">{site.phoneDisplay}</span>
      </a>
    </aside>
  );
}