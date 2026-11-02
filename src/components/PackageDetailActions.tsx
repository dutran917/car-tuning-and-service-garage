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

    // Copy message to clipboard for easy pasting in Zalo
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(zaloMsg);
      }
    } catch {
      // Fallback
    }

    // Display toast
    setToastMessage("Đã sao chép link gói độ! Mở Zalo dán (Paste) để gửi ngay cho gara.");
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);

    // Open Zalo without sending any unwanted email
    window.open(site.zalo, "_blank", "noopener,noreferrer");
  }

  if (variant === "aside") {
    return (
      <>
        <Link
          href={`/tu-van?package=${encodeURIComponent(packageSlug)}`}
          className="aside-quote-btn"
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