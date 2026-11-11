"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandIcon } from "@/components/BrandIcon";
import { site } from "@/lib/site";

export function FloatingContact() {
  const pathname = usePathname();
  const [isGoogleAds, setIsGoogleAds] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsGoogleAds(sessionStorage.getItem("qda-is-google-ads") === "1");
    }
  }, []);

  function handleZaloClick() {
    if (typeof window === "undefined") return;

    let msg = "";
    if (pathname.startsWith("/goi-do/")) {
      const fullUrl = window.location.href;
      msg = isGoogleAds
        ? `Chào Quốc Dương Auto, tôi xem bài viết/gói độ tại: ${fullUrl} (qua Google). Nhờ gara tư vấn cấu hình và báo giá giúp tôi!`
        : `Chào Quốc Dương Auto, tôi đang xem bài viết/gói độ tại: ${fullUrl}. Nhờ gara tư vấn cấu hình và báo giá giúp tôi!`;
    } else {
      msg = isGoogleAds
        ? "Chào Quốc Dương Auto, tôi tìm thấy xưởng từ Google và cần tư vấn gói độ xe, phụ kiện ô tô!"
        : "Chào Quốc Dương Auto, tôi cần tư vấn gói độ xe và phụ kiện ô tô!";
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).catch(() => null);
      }
    } catch {}
  }

  function handleMessengerClick() {
    if (typeof window === "undefined") return;

    let msg = "";
    if (pathname.startsWith("/goi-do/")) {
      const fullUrl = window.location.href;
      msg = isGoogleAds
        ? `Chào Quốc Dương Auto, tôi xem bài viết/gói độ tại: ${fullUrl} (qua Google Ads). Nhờ xưởng tư vấn cấu hình và báo giá giúp tôi!`
        : `Chào Quốc Dương Auto, tôi đang xem bài viết/gói độ tại: ${fullUrl}. Nhờ xưởng tư vấn cấu hình và báo giá giúp tôi!`;
    } else {
      msg = isGoogleAds
        ? "Chào Quốc Dương Auto, tôi tìm thấy xưởng từ Google Ads và cần tư vấn độ xe, phụ kiện ô tô!"
        : "Chào Quốc Dương Auto, tôi cần tư vấn gói độ xe và phụ kiện ô tô!";
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).catch(() => null);
      }
    } catch {}
  }

  const messengerHref = isGoogleAds
    ? `${site.messenger}?ref=google_ads`
    : `${site.messenger}?ref=website`;

  return (
    <aside className="floating-dock" aria-label="Liên hệ nhanh Quốc Dương Auto">
      <div className="floating-dock-pill">
        <a
          className="floating-dock-action dock-action-messenger"
          href={messengerHref}
          target="_blank"
          rel="noreferrer"
          data-track="messenger"
          aria-label="Nhắn tin Facebook Messenger"
          onClick={handleMessengerClick}
        >
          <span className="dock-icon messenger-icon">
            <BrandIcon name="messenger" />
          </span>
          <span className="dock-label">Messenger</span>
        </a>

        <span className="dock-divider" aria-hidden="true" />

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
