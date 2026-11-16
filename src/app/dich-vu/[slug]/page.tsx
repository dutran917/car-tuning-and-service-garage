import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BrandIcon } from "@/components/BrandIcon";
import { Breadcrumb, CTA, SectionHeading } from "@/components/Sections";
import { PaginatedPackageCards } from "@/components/PaginatedPackageCards";
import { services, site } from "@/lib/site";
import { pageMetadata, JsonLd } from "@/lib/seo";
import { getManagedPackages } from "@/lib/managed-content";

export const revalidate = 60;

export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = services.find((s) => s.slug === slug);
  return item
    ? pageMetadata(
        `${item.title} | Quốc Dương Auto`,
        item.detail,
        `/dich-vu/${slug}`,
        item.image || "/og-image.jpg"
      )
    : {};
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = services.find((s) => s.slug === slug);
  if (!item) notFound();

  const packages = await getManagedPackages();
  const isTurnkey = slug === "mua-xe-do-custom-tron-goi";

  return (
    <>
      <div className="container detail-page">
        <Breadcrumb
          items={[
            { label: "Dịch vụ", href: "/dich-vu" },
            { label: item.title },
          ]}
        />

        <div className="detail-layout">
          <article>
            <div className="eyebrow">
              <span className="eyebrow-line" />
              DỊCH VỤ ĐỘC BẢN · QUỐC DƯƠNG AUTO
            </div>
            <h1>{item.title}</h1>
            <p className="detail-lead">{item.short}</p>

            {item.image && (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "320px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  margin: "24px 0 28px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 720px"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  priority
                  unoptimized
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(16,17,17,0.85) 100%)",
                  }}
                />
              </div>
            )}

            <p style={{ fontSize: "15px", lineHeight: 1.8, color: "#d2d7d2" }}>
              {item.detail}
            </p>

            {isTurnkey && (
              <div
                style={{
                  background: "rgba(255, 109, 0, 0.05)",
                  border: "1px solid rgba(255, 109, 0, 0.2)",
                  borderRadius: "12px",
                  padding: "24px",
                  margin: "32px 0",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#ff6d00",
                    margin: "0 0 16px",
                  }}
                >
                  ⚡ Quy trình Mua xe &amp; Bàn giao Chìa Khóa Trao Tay
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <strong style={{ color: "#ff6d00", fontSize: "18px" }}>
                      01
                    </strong>
                    <h4
                      style={{
                        margin: "6px 0 4px",
                        fontSize: "14px",
                        color: "#fff",
                      }}
                    >
                      Chọn xe Đại lý
                    </h4>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.7)",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      Liên kết đại lý VinFast chính hãng, xuất xe với chính sách
                      giá và phiên bản tốt nhất.
                    </p>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <strong style={{ color: "#ff6d00", fontSize: "18px" }}>
                      02
                    </strong>
                    <h4
                      style={{
                        margin: "6px 0 4px",
                        fontSize: "14px",
                        color: "#fff",
                      }}
                    >
                      Độ theo Gu riêng
                    </h4>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.7)",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      Lên cấu hình Bodykit G63, mâm lốp, nội thất da Nappa, đèn
                      Bi-LED chuẩn kỹ thuật.
                    </p>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <strong style={{ color: "#ff6d00", fontSize: "18px" }}>
                      03
                    </strong>
                    <h4
                      style={{
                        margin: "6px 0 4px",
                        fontSize: "14px",
                        color: "#fff",
                      }}
                    >
                      Bàn giao tận nhà
                    </h4>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.7)",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      Nhận xe hoàn thiện nguyên chiếc tận cửa nhà, an tâm đăng
                      kiểm và bảo hành điện tử.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <h2>Quy trình tư vấn &amp; cam kết kỹ thuật</h2>
            <ul className="detail-list">
              <li>
                Lắng nghe nhu cầu, sở thích và định hướng phong cách bản độ theo
                ngân sách dự kiến.
              </li>
              <li>
                Xác nhận phụ kiện chuẩn zin, tương thích 100% với phiên bản xe và
                đáp ứng tiêu chuẩn đăng kiểm.
              </li>
              <li>
                Báo giá trọn gói minh bạch từng chi tiết trước khi tiến hành thi
                công, không phát sinh chi phí.
              </li>
              <li>
                Thi công tỉ mỉ, nghiệm thu kỹ lưỡng và kích hoạt bảo hành kỹ thuật
                dài hạn.
              </li>
            </ul>

            <div
              className="detail-actions"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "32px",
                paddingTop: "24px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <a
                href={site.zalo}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 24px",
                  background: "linear-gradient(135deg, #0068ff, #0052cc)",
                  color: "#fff",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "13px",
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(0,104,255,0.4)",
                }}
              >
                <BrandIcon name="zalo" />
                <span>Nhắn Zalo nhận báo giá ngay</span>
              </a>

              <a
                href={`tel:${site.phone}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 22px",
                  background: "linear-gradient(135deg, #f26a32, #e65100)",
                  color: "#fff",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "13px",
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(242,106,50,0.35)",
                }}
              >
                <BrandIcon name="phone" />
                <span>Hotline: {site.phoneDisplay}</span>
              </a>

              <Link
                className="button button-outline"
                href={`/tu-van?service=${item.slug}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "14px 20px",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                <span>Yêu cầu gọi lại tư vấn</span>
                <BrandIcon name="arrow-up-right" />
              </Link>
            </div>
          </article>

          <aside className="detail-aside">
            <span>QD / SERVICE</span>
            <strong>{item.icon}</strong>
            <small>{item.title}</small>
            <div className="aside-rule" />
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.8)",
                marginBottom: "16px",
              }}
            >
              Tư vấn trực tiếp cùng kỹ thuật trưởng Quốc Dương Auto tại Cẩm Phả,
              Quảng Ninh.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <a
                href={site.zalo}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  background: "#0068ff",
                  color: "#fff",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "12px",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(0,104,255,0.3)",
                }}
              >
                <BrandIcon name="zalo" />
                <span>Chat Zalo 24/7</span>
              </a>

              <a
                href={`tel:${site.phone}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "12px",
                  textDecoration: "none",
                }}
              >
                <BrandIcon name="phone" />
                <span>Gọi Hotline: {site.phoneDisplay}</span>
              </a>
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: "14px",
                fontSize: "11px",
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.6,
              }}
            >
              <p style={{ margin: "0 0 6px" }}>
                📍 <strong>Địa chỉ xưởng:</strong> Tổ 5, khu Hòa Lạc, P. Cẩm
                Bình, Cẩm Phả, Quảng Ninh
              </p>
              <p style={{ margin: 0 }}>
                🛡️ <strong>Bảo hành:</strong> Kỹ thuật điện tử, hỗ trợ trọn đời
                dòng xe VinFast.
              </p>
            </div>
          </aside>
        </div>

        {/* Real Packages Showcase Section */}
        <section
          className="section packages-section"
          style={{
            marginTop: "60px",
            paddingTop: "50px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <SectionHeading
            kicker="GỢI Ý CẤU HÌNH THỰC TẾ"
            title="Các bản độ thực tế được khách hàng ưa chuộng nhất."
            text="Hình ảnh thi công thực tế tại xưởng Quốc Dương Auto. Quý khách có thể lựa chọn trọn gói hoặc tùy biến từng chi tiết theo sở thích cá nhân."
            link="Xem tất cả gói nâng cấp"
            href="/goi-do"
          />
          <PaginatedPackageCards items={packages} pageSize={6} />
        </section>

        <nav className="related-links" style={{ marginTop: "40px" }}>
          <span>Dịch vụ khác</span>
          {services
            .filter((s) => s.slug !== item.slug)
            .slice(0, 4)
            .map((s) => (
              <Link key={s.slug} href={`/dich-vu/${s.slug}`}>
                {s.title} <BrandIcon name="arrow-right" />
              </Link>
            ))}
        </nav>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: item.title,
          description: item.detail,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://quocduong-auto.com"}/dich-vu/${item.slug}`,
          provider: {
            "@type": "Organization",
            name: "Quốc Dương Auto",
            telephone: site.phone,
            address: {
              "@type": "PostalAddress",
              streetAddress: "Tổ 5, khu Hòa Lạc, P. Cẩm Bình",
              addressLocality: "Cẩm Phả",
              addressRegion: "Quảng Ninh",
              addressCountry: "VN",
            },
          },
        }}
      />
      <CTA />
    </>
  );
}
