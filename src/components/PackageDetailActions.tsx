"use client";

import Link from "next/link";
import { BrandIcon } from "@/components/BrandIcon";

type Props = {
  packageSlug: string;
  packageName: string;
  vehicle: string;
};

export function PackageDetailActions({ packageSlug }: Props) {
  return (
    <div className="package-action-group">
      <Link
        href={`/tu-van?package=${encodeURIComponent(packageSlug)}`}
        className="package-btn package-quote-btn"
      >
        <BrandIcon name="wrench" />
        <span>Tư vấn cấu hình này</span>
      </Link>
    </div>
  );
}
