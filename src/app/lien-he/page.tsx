import Link from "next/link";
import { BrandIcon } from "@/components/BrandIcon";
import { Breadcrumb, CTA } from "@/components/Sections";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata(
  "Liên hệ Quốc Dương Auto",
  "Hotline & Zalo: 0399.513.456. Gửi yêu cầu tư vấn cấu hình xe hoặc kết nối trực tiếp với Quốc Dương Auto.",
  "/lien-he"
);

export default function ContactPage() {
  return (
    <>
      <div className="container page-wrap">
        <Breadcrumb items={[{ label: "Liên hệ" }]} />
        <header className="page-intro">
          <div className="eyebrow"><span className="eyebrow-line"/>CONTACT</div>
          <h1>Cùng bắt đầu<br/><span>một cuộc trò chuyện.</span></h1>
          <p>Chọn cách thuận tiện nhất để chia sẻ nhu cầu nâng cấp xe và nhận tư vấn cấu hình chi tiết.</p>
        </header>

        <div className="contact-grid">
          <a className="contact-card" href={`tel:${site.phone}`} data-track="phone">
            <span>01 / HOTLINE</span>
            <h2>{site.phoneDisplay}</h2>
            <p>Gọi điện trao đổi trực tiếp với kỹ thuật viên xưởng độ.</p>
            <b>Gọi ngay <BrandIcon name="arrow-up-right"/></b>
          </a>

          <a className="contact-card" href={site.zalo} target="_blank" rel="noreferrer" data-track="zalo">
            <span>02 / ZALO</span>
            <h2>Chat Zalo trực tiếp</h2>
            <p>Gửi ảnh xe, nhận báo giá và tư vấn cấu hình qua Zalo ({site.phoneDisplay}).</p>
            <b>Mở Zalo <BrandIcon name="arrow-up-right"/></b>
          </a>

          <Link className="contact-card" href="/tu-van">
            <span>03 / FORM</span>
            <h2>Gửi yêu cầu cấu hình</h2>
            <p>Chia sẻ dòng xe, ngân sách, hạng mục và thời gian dự kiến để nhận phân tích phương án.</p>
            <b>Mở biểu mẫu <BrandIcon name="arrow-up-right"/></b>
          </Link>

          <a className="contact-card" href={site.facebook} target="_blank" rel="noreferrer" data-track="facebook">
            <span>04 / SOCIAL</span>
            <h2>Facebook Fanpage</h2>
            <p>Theo dõi các bản độ mới nhất và nhắn tin qua Messenger.</p>
            <b>Mở Facebook <BrandIcon name="arrow-up-right"/></b>
          </a>
        </div>

        <div className="disclosure">
          <strong>Thông tin liên hệ trực tiếp:</strong> Hotline/Zalo: <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a> · Email: <a href={`mailto:${site.email}`}>{site.email}</a> · Khu vực xưởng: {site.address}.
        </div>
      </div>
      <CTA/>
    </>
  );
}
