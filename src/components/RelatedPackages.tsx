import Link from "next/link";
import Image from "next/image";
import type { ManagedPackage } from "@/lib/managed-content";
import { getVehicleBadge } from "@/lib/vehicle-badge";
import { packageExcerpt } from "@/lib/package-excerpt";
import { BrandIcon } from "@/components/BrandIcon";

interface RelatedPackagesProps {
  currentSlug: string;
  currentVehicle: string;
  allPackages: ManagedPackage[];
}

export function RelatedPackages({
  currentSlug,
  currentVehicle,
  allPackages,
}: RelatedPackagesProps) {
  const others = allPackages.filter((p) => p.slug !== currentSlug);
  if (!others.length) return null;

  // Filter packages matching current vehicle
  const normCurrent = (currentVehicle || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  const sameVehicle = others.filter((p) => {
    const norm = (p.vehicle || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return norm && (norm === normCurrent || norm.includes(normCurrent) || normCurrent.includes(norm));
  });

  const differentVehicle = others.filter((p) => !sameVehicle.includes(p));

  // Pick 3 related packages: same vehicle first, then others
  const related = [...sameVehicle, ...differentVehicle].slice(0, 3);
  if (!related.length) return null;

  return (
    <section className="related-packages-section" aria-label="Gói nâng cấp tương tự">
      <div className="related-packages-header">
        <div className="eyebrow">
          <span className="eyebrow-line" />
          GỢI Ý THAM KHẢO THÊM
        </div>
        <h2>Các gói độ & cấu hình tương tự</h2>
        <p>Tham khảo thêm các cấu hình và bản độ thực tế khác được thi công tại xưởng Quốc Dương Auto</p>
      </div>

      <div className="package-grid">
        {related.map((pkg, index) => {
          const cover = pkg.imageUrl || pkg.images[0]?.url;
          return (
            <Link href={`/goi-do/${pkg.slug}`} className="package-card" key={pkg.slug}>
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
                <span>{pkg.style}</span>
                <strong>
                  {getVehicleBadge(pkg.vehicle)}
                  <small> / {String(index + 1).padStart(2, "0")}</small>
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
                  GỢI Ý CẤU HÌNH · {pkg.vehicle ? pkg.vehicle.toUpperCase() : "VINFAST VF3"}
                </div>
                <h3>{pkg.name}</h3>
                <p className="package-excerpt">{packageExcerpt(pkg.text)}</p>
                <div className="package-range">
                  {pkg.range}
                  <small> · tham khảo</small>
                </div>
                <span className="arrow-link">
                  Xem cấu hình <BrandIcon name="arrow-up-right" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="related-packages-cta">
        <Link href="/goi-do" className="button button-outline">
          Xem tất cả cấu hình xe <BrandIcon name="arrow-right" />
        </Link>
      </div>
    </section>
  );
}
