"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandIcon } from "@/components/BrandIcon";
import { site } from "@/lib/site";

type Props = {
  packageSlug: string;
  packageName: string;
  vehicle: string;
};

export function PackageDetailActions({ packageSlug, packageName, vehicle }: Props) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  async function handleZaloClick() {
    const fullUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://quocduong-auto.com/goi-do/${packageSlug}`;
    const zaloMsg = `Chào Quốc Dương Auto (0399.513.456), tôi đang quan tâm gói độ: "${packageName}" (${vehicle}).\nLink tham khảo: ${fullUrl}\nTư vấn chi tiết cấu hình và chi phí giúp tôi nhé!`;

    // Copy message to clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(zaloMsg);
      }
    } catch {
      // Fallback
    }

    setToastMessage("Đã sao chép link gói độ! Mở Zalo dán (Paste) để gửi ngay cho gara.");
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);

    window.open(site.zalo, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="package-action-group">
      <Link
        href={`/tu-van?package=${encodeURIComponent(packageSlug)}`}
        className="package-btn package-quote-btn"
      >
        <BrandIcon name="wrench" />
        <span>Tư vấn cấu hình này</span>
      </Link>
      <button
        type="button"
        className="package-btn package-zalo-btn"
        onClick={handleZaloClick}
        aria-label="Chat Zalo ngay với Quốc Dương Auto"
      >
        <BrandIcon name="zalo" />
        <span>Chat Zalo: 0399.513.456</span>
      </button>

      {toastMessage && (
        <div className="zalo-toast-notification" role="status">
          <span className="toast-icon">📋</span>
          <p>{toastMessage}</p>
        </div>
      )}
    </div>
  );
}