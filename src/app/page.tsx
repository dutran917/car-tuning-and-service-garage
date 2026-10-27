import Link from "next/link";
import { Hero, SectionHeading, PackageCards, ServiceCards, ProjectGallery, Process, FAQ, ArticleCards, CTA } from "@/components/Sections";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { getHeroImage, getManagedArticles, getManagedPackages } from "@/lib/managed-content";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata("Độ xe & nâng cấp VinFast VF3 theo phong cách riêng", "Tư vấn concept, nâng cấp nội thất, ngoại thất và phụ kiện ô tô theo nhu cầu tại Quốc Dương Auto. Bắt đầu với cấu hình VinFast VF3.", "/");
export default async function HomePage() { const [heroImage, packages, articles] = await Promise.all([getHeroImage(), getManagedPackages(), getManagedArticles()]); return <>
  <Hero imageUrl={heroImage}/>
  <section className="section packages-section"><div className="container"><SectionHeading kicker="VF3 PERSONAL BUILDS" title="Một chiếc VF3. Nhiều cách kể chuyện." text="Gợi ý cấu hình để bắt đầu trao đổi. Hạng mục và ngân sách được xác nhận theo phiên bản xe, phụ kiện và phạm vi thi công." link="Xem tất cả gợi ý" href="/goi-do"/><PackageCards compact items={packages}/></div></section>
  <section className="section services-section"><div className="container"><SectionHeading kicker="TỪ Ý TƯỞNG ĐẾN THI CÔNG" title="Nâng cấp theo điều bạn cần." text="Tư vấn rõ hạng mục, xác nhận tương thích và báo giá trước khi thực hiện." link="Khám phá dịch vụ" href="/dich-vu"/><ServiceCards/></div></section>
  <section className="section projects-section"><div className="container"><SectionHeading kicker="THE BUILD LIBRARY" title="Cảm hứng cho bản độ tiếp theo." text="Concept minh họa giúp hình dung hướng cá nhân hóa. Thư viện dự án thực tế sẽ được cập nhật khi có tư liệu được xác nhận." link="Xem thư viện" href="/du-an"/><ProjectGallery/></div></section>
  <section className="section process-section"><div className="container"><SectionHeading kicker="A CLEAR PROCESS" title="Rõ ràng từ cuộc trò chuyện đầu tiên." text="Từng hạng mục, chi phí và lịch thực hiện được trao đổi trước khi xác nhận."/><Process/></div></section>
  <section className="section about-strip"><div className="container about-strip-inner"><span className="about-stamp">QD<br/><small>AUTO</small></span><div><div className="eyebrow"><span className="eyebrow-line"/>OUR APPROACH</div><h2>Chọn đúng thứ bạn cần.<br/><span>Làm rõ trước khi làm.</span></h2><p>Quốc Dương Auto định hướng tư vấn theo nhu cầu sử dụng, ngân sách và phong cách của từng chủ xe. Danh mục vật tư, tính tương thích, tiến độ và điều kiện bảo hành được xác nhận riêng theo cấu hình.</p><Link className="text-link" href="/gioi-thieu">Tìm hiểu cách chúng tôi làm việc <span>↗</span></Link></div></div></section>
  <section className="section faq-section"><div className="container faq-layout"><div><div className="eyebrow"><span className="eyebrow-line"/>BEFORE YOU BUILD</div><h2>Câu hỏi thường gặp.</h2><p>Thông tin giúp bạn chuẩn bị cho buổi tư vấn cấu hình.</p><Link className="text-link" href="/tu-van">Hỏi về chiếc xe của bạn <span>↗</span></Link></div><FAQ/></div></section>
  <section className="section articles-section"><div className="container"><SectionHeading kicker="FIELD NOTES" title="Đọc trước khi nâng cấp." text="Gợi ý thực tế để chuẩn bị nhu cầu và câu hỏi khi tư vấn." link="Tất cả bài viết" href="/kien-thuc"/><ArticleCards items={articles.slice(0,3)}/></div></section>
  <CTA/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context":"https://schema.org","@type":"Organization",name:site.name,description:site.tagline,url:site.url,sameAs:[site.facebook]}).replace(/</g,"\\u003c")}}/>
  <Link className="visually-hidden" href="/lien-he">Thông tin liên hệ</Link>
  </>; }
