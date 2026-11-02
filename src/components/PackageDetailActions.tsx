"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandIcon } from "@/components/BrandIcon";
import { site } from "@/lib/site";

type Props = {
  packageSlug: string;
  packageName: string;
  vehicle: string;
  variant?: "primary" | "aside";
};

export function PackageDetailActions({ packageSlug, packageName, vehicle, variant = "primary" }: Props) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  async function handleZaloClick() {
    const fullUrl = typeof window !== "undefined" ? window.location.href : `https://quocduong-auto.com/goi-do/${packageSlug}`;
    const zaloMsg = `Chào Quốc Dương Auto (0399.513.456), tôi đang quan tâm gói độ: "${packageName}" (${vehicle}).\nLink tham khảo: ${fullUrl}\nTư vấn chi tiết cấu hình và chi phí giúp tôi nhé!`;

    // 1. Copy message to clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(zaloMsg);
      }
    } catch {
      // Fallback: clipboard might fail in some restricted webviews
    }

    // 2. Fire interest notification in background to ductcp@gmail.com
    try {
      fetch("/api/leads/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageSlug,
          packageName,
          vehicle,
          action: "chat_zalo",
          pageUrl: fullUrl,
        }),
      }).catch(() => null);
    } catch {
      // Non-blocking
    }

    // 3. Display toast
    setToastMessage("Đã sao chép thông tin gói độ! Đang mở Zalo 0399.513.456, bạn hãy DÁN (Paste) tin nhắn vào chat nhé.");
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);

    // 4. Open Zalo
    window.open(site.zalo, "_blank", "noopener,noreferrer");
  }

  async function handleQuoteClick() {
    const fullUrl = typeof window !== "undefined" ? window.location.href : `https://quocduong-auto.com/goi-do/${packageSlug}`;
    try {
      fetch("/api/leads/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageSlug,
          packageName,
          vehicle,
          action: "tu_van_form",
          pageUrl: fullUrl,
        }),
      }).catch(() => null);
    } catch {
      // Non-blocking
    }
  }

  if (variant === "aside") {
    return (
      <>
        <Link
          href={`/tu-van?package=${encodeURIComponent(packageSlug)}`}
          className="aside-quote-btn"
          onClick={handleQuoteClick}
        >
          Gửi yêu cầu tư vấn <BrandIcon name="arrow-up-right" />
        </Link>
        <button
          type="button"
          className="aside-zalo-btn"
          onClick={handleZaloClick}
          aria-label="Chat Zalo ngay với Quốc Dương Auto"
        >
          Chat Zalo: 0399.513.456 <BrandIcon name="arrow-up-right" />
        </button>

        {toastMessage && (
          <div className="zalo-toast-notification" role="status">
            <span className="toast-icon">📋</span>
            <p>{toastMessage}</p>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="detail-actions">
        <Link
          className="button"
          href={`/tu-van?package=${encodeURIComponent(packageSlug)}`}
          onClick={handleQuoteClick}
        >
          Tư vấn cấu hình này <BrandIcon name="arrow-up-right" />
        </Link>
        <button
          type="button"
          className="button button-zalo"
          onClick={handleZaloClick}
        >
          Chat Zalo ngay <BrandIcon name="arrow-up-right" />
        </button>
        <Link className="text-link" href="/dich-vu">
          Xem danh mục dịch vụ
        </Link>
      </div>

      {toastMessage && (
        <div className="zalo-toast-notification" role="status">
          <span className="toast-icon">📋</span>
          <p>{toastMessage}</p>
        </div>
      )}
    </>
  );
}