"use client";

import Link from "next/link";
import { BrandIcon } from "@/components/BrandIcon";
import { site } from "@/lib/site";

type Props = {
  packageSlug: string;
  packageName: string;
  vehicle: string;
};

export function PackageDetailActions({ packageSlug, packageName }: Props) {
  function handleZaloClick() {
    if (typeof window === "undefined") return;
    const msg = `Chào Quốc Dương Auto, tôi đang quan tâm gói: ${packageName} (mã: ${packageSlug}). Nhờ xưởng báo giá và tư vấn giúp tôi!`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).catch(() => null);
      }
    } catch {}
  }

  return (
    <div className="package-action-group" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
      <a
        href={site.zalo}
        target="_blank"
        rel="noreferrer"
        onClick={handleZaloClick}
        className="package-btn package-zalo-btn"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "12px 16px",
          background: "#0068ff",
          color: "#fff",
          borderRadius: "8px",
          fontWeight: 600,
          textDecoration: "none",
          boxShadow: "0 4px 14px rgba(0,104,255,0.3)"
        }}
      >
        <BrandIcon name="zalo" />
        <span>Chat Zalo báo giá ngay</span>
      </a>

      <a
        href={`tel:${site.phone}`}
        className="package-btn package-phone-btn"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "12px 16px",
          background: "linear-gradient(135deg, #e65100, #ff6d00)",
          color: "#fff",
          borderRadius: "8px",
          fontWeight: 600,
          textDecoration: "none",
          boxShadow: "0 4px 14px rgba(230,81,0,0.3)"
        }}
      >
        <BrandIcon name="phone" />
        <span>Gọi Hotline: {site.phoneDisplay}</span>
      </a>

      <Link
        href={`/tu-van?package=${encodeURIComponent(packageSlug)}`}
        className="package-btn package-quote-btn"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "10px 16px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "14px",
          textDecoration: "none"
        }}
      >
        <BrandIcon name="wrench" />
        <span>Để lại yêu cầu tư vấn</span>
      </Link>
    </div>
  );
}

