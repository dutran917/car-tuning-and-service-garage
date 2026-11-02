import Link from "next/link";
import Image from "next/image";
import { articles, faq, packages, services, site } from "@/lib/site";
import type { ManagedPackage } from "@/lib/managed-content";
import { getVehicleBadge } from "@/lib/vehicle-badge";
import { packageExcerpt } from "@/lib/package-excerpt";
import type { ManagedArticle } from "@/lib/managed-content";
import { BrandIcon } from "@/components/BrandIcon";

export function Hero({ imageUrl }: { imageUrl?: string | null }) { return <section className={`hero ${imageUrl ? "hero-has-image" : ""}`}><div className="hero-art" aria-hidden="true" style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined}><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-light"/><div className="hero-car"><div className="car-roof"/><div className="car-window"/><div className="car-body"/><div className="car-wheel wheel-a"/><div className="car-wheel wheel-b"/><div className="car-light"/></div><div className="art-caption"><span>VF3 / PERSONAL BUILD</span><span>{imageUrl ? "QUỐC DƯƠNG AUTO" : "CONCEPT IMAGE · NOT A CUSTOMER PROJECT"}</span></div></div><div className="container hero-content"><div className="eyebrow"><span className="eyebrow-line"/>CAR TUNING, THE PERSONAL WAY</div><h1>Không chỉ nâng cấp xe.<br/><span>Định hình chất riêng.</span></h1><p className="hero-description">Tư vấn concept, lựa chọn phụ kiện và thi công theo cách bạn muốn sử dụng chiếc xe — bắt đầu từ VinFast VF3.</p><div className="hero-actions"><Link className="button" href="/du-an">Khám phá các bản độ <BrandIcon name="arrow-up-right"/></Link><Link className="text-link" href="/tu-van">Tư vấn cấu hình <BrandIcon name="arrow-right"/></Link></div><div className="hero-index"><span>01 / 04</span><span>ĐỘ XE THEO CÁCH CỦA BẠN</span></div></div><div className="hero-side-label">QUỐC DƯƠNG AUTO — CAR TUNING & SERVICE</div></section>; }

export function SectionHeading({ kicker, title, text, link, href }: { kicker: string; title: string; text?: string; link?: string; href?: string }) { return <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>{kicker}</div><h2>{title}</h2>{text && <p>{text}</p>}</div>{link && href && <Link className="text-link heading-link" href={href}>{link} <BrandIcon name="arrow-up-right"/></Link>}</div>; }

export function PackageCards({ compact = false, items = packages.map((item) => ({ ...item, images: [], imageUrl: null })) }: { compact?: boolean; items?: ManagedPackage[] }) { return <div className={`package-grid ${compact ? "package-grid-compact" : ""}`}>{items.map((item, index) => { const cover = item.imageUrl || item.images[0]?.url; return <Link href={`/goi-do/${item.slug}`} className="package-card" key={item.slug}><div className={`package-art package-art-${index + 1}`} style={cover ? { backgroundImage: `linear-gradient(0deg,rgba(13,15,14,.72),rgba(13,15,14,.06)),url("${cover}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><span>{item.style}</span><strong>{getVehicleBadge(item.vehicle)}<small> / {String(index + 1).padStart(2, "0")}</small></strong><span className="package-art-mark"><Image src="/logo-quoc-duong-auto-transparent.png" alt="Quốc Dương Auto" width={352} height={157}/></span></div><div className="package-info"><div className="package-kicker">GỢI Ý CẤU HÌNH · {item.vehicle.toUpperCase()}</div><h3>{item.name}</h3><p className="package-excerpt">{packageExcerpt(item.text)}</p><div className="package-range">{item.range}<small> · tham khảo</small></div><span className="arrow-link">Xem cấu hình <BrandIcon name="arrow-up-right"/></span></div></Link>; })}</div>; }

function articleCoverUrl(article: ManagedArticle) {
  return article.images.find((image) => image.isCover)?.url || article.images[0]?.url;
}

export function ServiceCards() { return <div className="service-grid">{services.map((item) => <Link href={`/dich-vu/${item.slug}`} className="service-card" key={item.slug}><span className="service-number">{item.icon} <span>WHAT WE DO</span></span><h3>{item.title}</h3><p>{item.short}</p><span className="service-arrow" aria-label={`Tìm hiểu ${item.title}`}><BrandIcon name="arrow-up-right"/></span></Link>)}</div>; }

export function ProjectGallery() {
  const featuredProjects = [
    {
      slug: "goi-nang-cap-style-brabus-tri-gia-17x-moi-ae-tham-khao",
      title: "BRABUS EDITION",
      subtitle: "Bản độ Brabus khí động học, mâm 16 inch & nội thất da cao cấp",
      car: "VINFAST VF3 · BRABUS STYLE",
      tag: "BẢN ĐỘ THỰC TẾ · 17X TRIỆU",
      image: "/uploads/quocduong-auto-goi-nang-cap-style-brabus-tri-gia-17x-moi-ae-tham-khao-1-09d8f2.webp",
    },
    {
      slug: "vf3-goi-do-brabus-full-noi-ngoai-that-cho-vf3-tri-gia-200",
      title: "MASTERPIECE 200",
      subtitle: "Full combo nội ngoại thất cao cấp, âm thanh vòm & tiện nghi công nghệ",
      car: "VINFAST VF3 · MASTER CUSTOM",
      tag: "BẢN ĐỘ THỰC TẾ · 200 TRIỆU",
      image: "/uploads/quocduong-auto-vf3-goi-do-brabus-full-noi-ngoai-that-cho-vf3-tri-gia-200-1-444de7.webp",
    },
    {
      slug: "mot-trong-nhung-chiec-mau-do-hiem-hoi-dc-len-do-day-du-nhat-tai-quoc-duong",
      title: "RED STORM SPORT",
      subtitle: "Bản độ sắc đỏ độc bản, full đồ chơi ngoại thất & mâm thể thao",
      car: "VINFAST VF3 · SPORT RED",
      tag: "BẢN ĐỘ THỰC TẾ · FULL OPTION",
      image: "/uploads/quocduong-auto-mot-trong-nhung-chiec-mau-do-hiem-hoi-dc-len-do-day-du-nhat-tai-quoc-duong-1-b3312c.webp",
    },
  ];

  return (
    <div className="project-grid">
      {featuredProjects.map((project) => (
        <Link href={`/goi-do/${project.slug}`} className="project-card" key={project.slug}>
          <div
            className="project-visual"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(16,17,17,0.25) 0%, rgba(16,17,17,0.85) 100%), url("${project.image}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <span className="concept-label project-real-label">{project.tag}</span>
            <span className="project-visual-title">
              {project.title.split(" ")[0]}
              <br />
              <i>{project.title.split(" ").slice(1).join(" ")}</i>
            </span>
            <span className="project-visual-car">{project.car}</span>
          </div>
          <div className="project-meta">
            <div>
              <span>{project.car}</span>
              <h3>{project.subtitle}</h3>
            </div>
            <span className="project-meta-arrow" aria-label={`Xem chi tiết ${project.title}`}>
              <BrandIcon name="arrow-up-right" />
            </span>
          </div>
        </Link>
      ))}
      <div className="gallery-disclosure">
        Tất cả dự án được giới thiệu đều là xe thực tế đã thi công hoàn thiện và bàn giao cho khách hàng tại Quốc Dương Auto.
      </div>
    </div>
  );
}

export function Process() { const steps = ["Tiếp nhận nhu cầu", "Tư vấn concept", "Báo giá chi tiết", "Xác nhận cấu hình", "Thi công & lắp đặt", "Bàn giao & hỗ trợ"]; return <div className="process-grid">{steps.map((step, index) => <div className="process-step" key={step}><span>0{index + 1}</span><h3>{step}</h3></div>)}</div>; }

export function FAQ() { return <div className="faq-list">{faq.map((item, i) => <details key={item.q}><summary><span>0{i + 1}</span>{item.q}<b><BrandIcon name="plus"/></b></summary><p>{item.a}</p></details>)}</div>; }

export function ArticleCards({ items = articles.map((article) => ({ ...article, images: [] })) }: { items?: ManagedArticle[] }) { return <div className="article-grid">{items.map((article) => { const cover = articleCoverUrl(article); return <Link href={`/kien-thuc/${article.slug}`} className="article-card" key={article.slug}><div className="article-cover" style={cover ? { backgroundImage: `linear-gradient(0deg,rgba(13,15,14,.65),rgba(13,15,14,.05)),url("${cover}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><span>{article.category}</span><b className="article-cover-logo"><Image src="/logo-quoc-duong-auto-transparent.png" alt="Quốc Dương Auto" width={352} height={157}/></b></div><p className="article-date">{new Date(`${article.date}T00:00:00+07:00`).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</p><h3>{article.title}</h3><p>{article.intro}</p><span className="arrow-link">Đọc bài viết <BrandIcon name="arrow-up-right"/></span></Link>; })}</div>; }

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) { const entries = [{ label: "Trang chủ", href: "/" }, ...items]; return <><nav aria-label="Breadcrumb" className="breadcrumb"><Link href="/">Trang chủ</Link>{items.map((item, index) => <span key={`${item.label}-${index}`}> / {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: entries.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, ...(item.href ? { item: `${site.url}${item.href}` } : {}) })) }).replace(/</g, "\\u003c") }} /></>; }

export function CTA() { return <section className="cta-band"><div className="container cta-inner"><div><div className="eyebrow"><span className="eyebrow-line"/>START WITH A CONVERSATION</div><h2>Chiếc xe tiếp theo<br/>của bạn bắt đầu từ đây.</h2><p>Chia sẻ điều bạn muốn thay đổi. Cùng bắt đầu từ một cấu hình phù hợp.</p></div><Link className="button" href="/tu-van">Bắt đầu tư vấn <BrandIcon name="arrow-up-right"/></Link></div></section>; }

export function ServiceJson({ name, description, path }: { name: string; description: string; path: string }) { return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Service", name, description, provider: { "@type": "Organization", name: site.name, url: site.url }, url: `${site.url}${path}` }).replace(/</g, "\\u003c") }} />; }
