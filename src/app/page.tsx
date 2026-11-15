import Link from "next/link";
import { BrandIcon } from "@/components/BrandIcon";
import { Hero, SectionHeading, ServiceCards, ProjectGallery, Process, FAQ, ArticleCards, CTA } from "@/components/Sections";
import { PaginatedPackageCards } from "@/components/PaginatedPackageCards";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { getHeroImage, getManagedArticles, getManagedPackages } from "@/lib/managed-content";

export const revalidate = 60;

export const metadata = pageMetadata(
  "Độ xe & nâng cấp VinFast VF3 theo phong cách riêng",
  "Tư vấn concept, nâng cấp nội thất, ngoại thất và phụ kiện ô tô theo nhu cầu tại Quốc Dương Auto. Bắt đầu với cấu hình VinFast VF3.",
  "/",
  "/og-image.jpg"
);
export default async function HomePage() { const [heroImage, packages, articles] = await Promise.all([getHeroImage(), getManagedPackages(), getManagedArticles()]); return <>
  <Hero imageUrl={heroImage}/>
  <section className="section turnkey-section" style={{
    background: "linear-gradient(180deg, rgba(255, 109, 0, 0.08) 0%, rgba(0, 0, 0, 0) 100%)",
    padding: "60px 0",
    borderTop: "1px solid rgba(255, 109, 0, 0.2)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
  }}>
    <div className="container">
      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <div className="eyebrow" style={{ color: "#ff6d00", justifyContent: "center" }}>
          <span className="eyebrow-line" style={{ background: "#ff6d00" }} />
          DỊCH VỤ ĐỘC BẢN · CHÌA KHÓA TRAO TAY
        </div>
        <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, margin: "12px 0 16px", color: "#fff", lineHeight: 1.25 }}>
          Mua Xe VinFast Mới &amp; Độ Custom Theo Gu Riêng
        </h2>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: "32px" }}>
          Không cần vất vả mua xe thô rồi tự tìm chỗ làm từng món. <strong>Quốc Dương Auto</strong> liên kết trực tiếp đại lý VinFast chính hãng: hỗ trợ xuất xe với chính sách tốt nhất, thi công trọn gói theo bản thiết kế riêng (G63, Brabus, Thể thao...) và <strong>bàn giao xe hoàn thiện tận tay</strong>.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          textAlign: "left",
          marginBottom: "32px"
        }}>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#ff6d00", marginBottom: "8px" }}>01</div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px", color: "#fff" }}>Chọn xe từ Đại lý</h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.5 }}>
              Liên kết đại lý VinFast chính hãng, hỗ trợ chọn màu xe, phiên bản và chính sách giá tốt nhất.
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#ff6d00", marginBottom: "8px" }}>02</div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px", color: "#fff" }}>Thi công theo Gu riêng</h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.5 }}>
              Lên bài độ theo yêu cầu: Bodykit G63/Brabus, mâm lốp, nội thất da Nappa, màn hình &amp; tiện nghi.
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#ff6d00", marginBottom: "8px" }}>03</div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px", color: "#fff" }}>Bàn giao trọn gói</h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.5 }}>
              Nhận xe hoàn thiện nguyên chiếc tận nhà, an tâm đăng kiểm và bảo hành kỹ thuật dài hạn.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href={site.zalo}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: "#0068ff",
              color: "#fff",
              borderRadius: "10px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 15px rgba(0,104,255,0.4)"
            }}
          >
            <BrandIcon name="zalo" />
            <span>Chat Zalo tư vấn Mua &amp; Độ xe</span>
          </a>

          <a
            href={`tel:${site.phone}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #e65100, #ff6d00)",
              color: "#fff",
              borderRadius: "10px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 15px rgba(230,81,0,0.4)"
            }}
          >
            <BrandIcon name="phone" />
            <span>Hotline: {site.phoneDisplay}</span>
          </a>

          <Link
            href="/dich-vu/mua-xe-do-custom-tron-goi"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              borderRadius: "10px",
              fontSize: "14px",
              textDecoration: "none"
            }}
          >
            <span>Chi tiết quy trình</span>
            <BrandIcon name="arrow-right" />
          </Link>
        </div>
      </div>
    </div>
  </section>
  <section className="section packages-section" id="packages-section"><div className="container"><SectionHeading kicker="DANH MỤC CẤU HÌNH" title="Định hình chất riêng cho từng dòng xe." text="Các gói nâng cấp thực tế từ VinFast (VF3, VF7, VF8, MPV7) đến các dòng xe khác (Lexus, Mazda, Toyota...). Hạng mục và ngân sách được tư vấn chuẩn xác theo xe của bạn." link="Xem tất cả gợi ý" href="/goi-do"/><PaginatedPackageCards items={packages} pageSize={10}/></div></section>
  <section className="section services-section"><div className="container"><SectionHeading kicker="TỪ Ý TƯỞNG ĐẾN THI CÔNG" title="Nâng cấp chuyên nghiệp & toàn diện." text="Tư vấn bài bản, sử dụng linh phụ kiện chất lượng cao, thi công chuẩn xác và bảo hành điện tử minh bạch." link="Khám phá dịch vụ" href="/dich-vu"/><ServiceCards/></div></section>
  <section className="section projects-section"><div className="container"><SectionHeading kicker="THE BUILD LIBRARY" title="Bản độ thực tế đã bàn giao." text="Khám phá những dự án độ xe VinFast VF3 thực tế được Quốc Dương Auto trực tiếp thiết kế, thi công và bàn giao tới tay khách hàng." link="Xem tất cả dự án" href="/du-an"/><ProjectGallery/></div></section>
  <section className="section process-section"><div className="container"><SectionHeading kicker="A CLEAR PROCESS" title="Rõ ràng từ cuộc trò chuyện đầu tiên." text="Từng hạng mục, chi phí và lịch thực hiện được trao đổi trước khi xác nhận."/><Process/></div></section>
  <section className="section about-strip"><div className="container about-strip-inner"><span className="about-stamp">QD<br/><small>AUTO</small></span><div><div className="eyebrow"><span className="eyebrow-line"/>OUR APPROACH</div><h2>Chọn đúng thứ bạn cần.<br/><span>Làm rõ trước khi làm.</span></h2><p>Quốc Dương Auto định hướng tư vấn theo nhu cầu sử dụng, ngân sách và phong cách của từng chủ xe. Danh mục vật tư, tính tương thích, tiến độ và điều kiện bảo hành được xác nhận riêng theo cấu hình.</p><Link className="text-link" href="/gioi-thieu">Tìm hiểu cách chúng tôi làm việc <BrandIcon name="arrow-up-right"/></Link></div></div></section>
  <section className="section faq-section"><div className="container faq-layout"><div><div className="eyebrow"><span className="eyebrow-line"/>BEFORE YOU BUILD</div><h2>Câu hỏi thường gặp.</h2><p>Thông tin giúp bạn chuẩn bị cho buổi tư vấn cấu hình.</p><Link className="text-link" href="/tu-van">Hỏi về chiếc xe của bạn <BrandIcon name="arrow-up-right"/></Link></div><FAQ/></div></section>
  <section className="section articles-section"><div className="container"><SectionHeading kicker="FIELD NOTES" title="Đọc trước khi nâng cấp." text="Gợi ý thực tế để chuẩn bị nhu cầu và câu hỏi khi tư vấn." link="Tất cả bài viết" href="/kien-thuc"/><ArticleCards items={articles.slice(0,3)}/></div></section>
  <CTA/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context":"https://schema.org","@type":"Organization",name:site.name,description:site.tagline,url:site.url,sameAs:[site.facebook]}).replace(/</g,"\\u003c")}}/>
  <Link className="visually-hidden" href="/lien-he">Thông tin liên hệ</Link>
  </>; }
