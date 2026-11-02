import Link from "next/link";
import { BrandIcon } from "@/components/BrandIcon";
import { Hero, SectionHeading, ServiceCards, ProjectGallery, Process, FAQ, ArticleCards, CTA } from "@/components/Sections";
import { PaginatedPackageCards } from "@/components/PaginatedPackageCards";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { getHeroImage, getManagedArticles, getManagedPackages } from "@/lib/managed-content";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata(
  "Độ xe & nâng cấp VinFast VF3 theo phong cách riêng",
  "Tư vấn concept, nâng cấp nội thất, ngoại thất và phụ kiện ô tô theo nhu cầu tại Quốc Dương Auto. Bắt đầu với cấu hình VinFast VF3.",
  "/",
  "/og-image.jpg"
);
export default async function HomePage() { const [heroImage, packages, articles] = await Promise.all([getHeroImage(), getManagedPackages(), getManagedArticles()]); return <>
  <Hero imageUrl={heroImage}/>
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
