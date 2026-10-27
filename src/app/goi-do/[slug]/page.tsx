import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { Breadcrumb, CTA } from "@/components/Sections";
import { getManagedPackage, getManagedPackages, getPackageRedirect } from "@/lib/managed-content";
import { pageMetadata, JsonLd } from "@/lib/seo";
import { ArticleGallery } from "@/components/ArticleGallery";
import { VideoGallery } from "@/components/VideoGallery";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return (await getManagedPackages()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getManagedPackage(slug);
  return item ? pageMetadata(item.name, item.text, `/goi-do/${slug}`) : {};
}

export default async function PackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getManagedPackage(slug);
  if (!item) {
    const target = await getPackageRedirect(slug);
    if (target) permanentRedirect(target);
    notFound();
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const imageUrls = item.images.map((image) => image.url.startsWith("http") ? image.url : `${siteUrl}${image.url}`);
  return <><div className="container detail-page"><Breadcrumb items={[{ label: "Gói nâng cấp", href: "/goi-do" }, { label: item.name }]} /><div className="detail-layout"><article><div className="eyebrow"><span className="eyebrow-line" />GỢI Ý CẤU HÌNH · {item.vehicle.toUpperCase()}</div><h1>{item.name}</h1><ArticleGallery images={item.images.map((image) => ({ ...image, afterParagraph: 0 }))} /><VideoGallery videos={item.videos ?? []} /><p className="detail-lead">{item.text}</p><div className="detail-disclosure">{item.range}. Đây là ngân sách tham khảo, không phải giá cố định. Báo giá cuối cùng được xác nhận sau khi thống nhất phiên bản xe, vật tư và phạm vi thi công.</div><h2>Gợi ý nội dung trao đổi</h2><ul className="detail-list">{item.items.map((row, index) => <li key={`${item.slug}-item-${index}`}>{row}</li>)}</ul><h2>Trước khi xác nhận</h2><p>Yêu cầu xác nhận sản phẩm và tính tương thích với phiên bản xe, thời gian dự kiến, chi phí phát sinh (nếu có) và điều kiện bảo hành của từng hạng mục.</p><div className="detail-actions"><Link className="button" href={`/tu-van?package=${item.slug}`}>Tư vấn cấu hình này <span>↗</span></Link><Link className="text-link" href="/dich-vu">Xem danh mục dịch vụ</Link></div></article><aside className="detail-aside"><span>{item.vehicle}</span><strong>VF3</strong><small>{item.style}</small><div className="aside-rule" /><p>Hình ảnh website hiện là concept minh họa, không đại diện cho dự án đã thi công.</p><Link href="/tu-van">Gửi yêu cầu tư vấn ↗</Link></aside></div><nav className="related-links"><span>Có thể bạn quan tâm</span><Link href="/kien-thuc/bat-dau-nang-cap-vinfast-vf3-tu-dau">Bắt đầu nâng cấp VF3 từ đâu? →</Link><Link href="/dich-vu/tu-van-concept">Tư vấn concept →</Link></nav></div><JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: item.name, description: item.text, serviceType: item.style, image: imageUrls, url: `${siteUrl}/goi-do/${item.slug}`, provider: { "@type": "Organization", name: "Quốc Dương Auto" } }} /><CTA /></>;
}
