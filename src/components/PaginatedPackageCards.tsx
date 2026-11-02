"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ManagedPackage } from "@/lib/managed-content";
import { getVehicleBadge } from "@/lib/vehicle-badge";

function getExcerpt(text: string, maxLength = 120): string {
  if (!text) return "";
  const cleaned = text.split("\n")[0].trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trim() + "…";
}

export function PaginatedPackageCards({
  items = [],
  pageSize = 10,
}: {
  items?: ManagedPackage[];
  pageSize?: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(items.length / pageSize) || 1;

  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = items.slice(startIndex, startIndex + pageSize);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const element = document.getElementById("packages-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="paginated-package-container">
      <div className="package-grid">
        {currentItems.map((item, index) => {
          const cover = item.imageUrl || item.images[0]?.url;
          const displayNumber = startIndex + index + 1;
          return (
            <Link
              href={`/goi-do/${item.slug}`}
              className="package-card"
              key={item.slug}
            >
              <div
                className={`package-art package-art-${(index % 3) + 1}`}
                style={
                  cover
                    ? {
                        backgroundImage: `linear-gradient(0deg,rgba(13,15,14,.72),rgba(13,15,14,.06)),url("${cover}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                <span>{item.style}</span>
                <strong>
                  {getVehicleBadge(item.vehicle)}
                  <small> / {String(displayNumber).padStart(2, "0")}</small>
                </strong>
                <span className="package-art-mark">
                  <Image
                    src="/logo-quoc-duong-auto-transparent.png"
                    alt="Quốc Dương Auto"
                    width={352}
                    height={157}
                  />
                </span>
              </div>
              <div className="package-info">
                <div className="package-kicker">
                  GỢI Ý CẤU HÌNH · {item.vehicle ? item.vehicle.toUpperCase() : "VINFAST VF3"}
                </div>
                <h3>{item.name}</h3>
                <p className="package-excerpt">{getExcerpt(item.text)}</p>
                <div className="package-range">
                  {item.range}
                  <small> · tham khảo</small>
                </div>
                <span className="arrow-link">
                  Xem cấu hình{" "}
                  <svg
                    className="brand-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M7 17 17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav className="home-pagination" aria-label="Phân trang danh mục cấu hình">
          <div className="pagination-info">
            Trang <strong>{currentPage}</strong> / {totalPages} · Hiển thị{" "}
            <strong>
              {startIndex + 1}–{Math.min(startIndex + pageSize, items.length)}
            </strong>{" "}
            trên tổng số <strong>{items.length}</strong> cấu hình
          </div>
          <div className="pagination-buttons">
            <button
              type="button"
              className="pagination-btn pagination-prev"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              aria-label="Trang trước"
            >
              ‹ Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={`pagination-btn pagination-num ${
                  page === currentPage ? "pagination-active" : ""
                }`}
                onClick={() => goToPage(page)}
                aria-label={`Trang ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              className="pagination-btn pagination-next"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              aria-label="Trang sau"
            >
              Sau ›
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
