"use client";

import { usePathname } from "next/navigation";
import { BrandIcon } from "@/components/BrandIcon";
import { site } from "@/lib/site";

export function FloatingContact() {
  const pathname = usePathname();

  function handleZaloClick() {
    if (typeof window !== "undefined" && pathname.startsWith("/goi-do/")) {
      const fullUrl = window.location.href;
      const msg = `Chào Quốc Dương Auto (0399.513.456), tôi đang xem bài viết/gói độ tại: ${fullUrl}. Nhờ gara tư vấn cấu hình và báo giá giúp tôi!`;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(msg).catch(() => null);
        }
      } catch {}
    }
  }

  return (
    <aside className="floating-dock" aria-label="Liên hệ nhanh Quốc Dương Auto">
      <div className="floating-dock-pill">
        <a
          className="floating-dock-action dock-action-zalo"
          href={site.zalo}
          target="_blank"
          rel="noreferrer"
          data-track="zalo"
          aria-label="Chat Zalo tư vấn cấu hình"
          onClick={handleZaloClick}
        >
          <span className="dock-icon">
            <BrandIcon name="zalo" />
          </span>
          <span className="dock-label">Chat Zalo</span>
        </a>

        <span className="dock-divider" aria-hidden="true" />

        <a
          className="floating-dock-action dock-action-phone"
          href={`tel:${site.phone}`}
          data-track="phone"
          aria-label={`Hotline Quốc Dương Auto: ${site.phoneDisplay}`}
        >
          <span className="dock-icon">
            <BrandIcon name="phone" />
          </span>
          <span className="dock-label">{site.phoneDisplay}</span>
        </a>
      </div>
    </aside>
  );
}
