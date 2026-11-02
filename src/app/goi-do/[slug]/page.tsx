import { notFound, permanentRedirect } from "next/navigation";
import { BrandIcon } from "@/components/BrandIcon";
import Link from "next/link";
import { Breadcrumb, CTA } from "@/components/Sections";
import { getManagedPackage, getManagedPackages, getPackageRedirect } from "@/lib/managed-content";
import { getVehicleBadge } from "@/lib/vehicle-badge";
import { pageMetadata, JsonLd } from "@/lib/seo";
import { ArticleGallery } from "@/components/ArticleGallery";
import { VideoGallery } from "@/components/VideoGallery";
import { RelatedPackages } from "@/components/RelatedPackages";
import { PackageDetailActions } from "@/components/PackageDetailActions";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return (await getManagedPackages()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getManagedPackage(slug);
  if (!item) return {};
  const cover = item.imageUrl || item.images[0]?.url;
  return pageMetadata(item.name, item.text, `/goi-do/${slug}`, cover);
}

export default async function PackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const allPackages = await getManagedPackages();
  const item = allPackages.find((pkg) => pkg.slug === slug);
  if (!item) {
    const target = await getPackageRedirect(slug);
    if (target) permanentRedirect(target);
    notFound();
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const imageUrls = item.images.map((image) => image.url.startsWith("http") ? image.url : `${siteUrl}${image.url}`);
  return (
    <>
      <div className="container detail-page">
        <Breadcrumb items={[{ label: "Gói nâng cấp", href: "/goi-do" }, { label: item.name }]} />
        <div className="detail-layout">
          <article>
            <div className="eyebrow"><span className="eyebrow-line" />GỢI Ý CẤU HÌNH · {item.vehicle.toUpperCase()}</div>
            <h1>{item.name}</h1>
            <ArticleGallery images={item.images.map((image) => ({ ...image, afterParagraph: 0 }))} />
            <VideoGallery videos={item.videos ?? []} />
            <p className="detail-lead">{item.text}</p>
            <div className="detail-disclosure">{item.range}. Đây là ngân sách tham khảo, không phải giá cố định. Báo giá cuối cùng được xác nhận sau khi thống nhất phiên bản xe, vật tư và phạm vi thi công.</div>
            <h2>Gợi ý nội dung trao đổi</h2>
            <ul className="detail-list">{item.items.map((row, index) => <li key={`${item.slug}-item-${index}`}>{row}</li>)}</ul>
            <h2>Trước khi xác nhận</h2>
            <p>Yêu cầu xác nhận sản phẩm và tính tương thích với phiên bản xe, thời gian dự kiến, chi phí phát sinh (nếu có) và điều kiện bảo hành của từng hạng mục.</p>
            <div className="detail-article-footer">
              <Link className="text-link" href="/dich-vu">Xem tất cả dịch vụ nâng cấp <BrandIcon name="arrow-right"/></Link>
            </div>
          </article>
          <aside className="detail-aside">
            <span>{item.vehicle}</span>
            <strong>{getVehicleBadge(item.vehicle)}</strong>
            <small>{item.style}</small>
            <div className="aside-rule" />
            <p>Hình ảnh và video thực tế từ các bản độ thi công tại xưởng Quốc Dương Auto. Cam kết vật tư chất lượng và bảo hành kỹ thuật tận tâm.</p>
            <PackageDetailActions
              packageSlug={item.slug}
              packageName={item.name}
              vehicle={item.vehicle}
            />
          </aside>
        </div>

        <RelatedPackages
          currentSlug={item.slug}
          currentVehicle={item.vehicle}
          allPackages={allPackages}
        />

        <nav className="related-links">
          <span>Có thể bạn quan tâm</span>
          <Link href="/kien-thuc/bat-dau-nang-cap-vinfast-vf3-tu-dau">Bắt đầu nâng cấp VF3 từ đâu? <BrandIcon name="arrow-right"/></Link>
          <Link href="/dich-vu/tu-van-concept">Tư vấn concept <BrandIcon name="arrow-right"/></Link>
        </nav>
      </div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: item.name, description: item.text, serviceType: item.style, image: imageUrls, url: `${siteUrl}/goi-do/${item.slug}`, provider: { "@type": "Organization", name: "Quốc Dương Auto" } }} />
      <CTA />
    </>
  );
}
