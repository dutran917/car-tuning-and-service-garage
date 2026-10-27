import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, CTA } from "@/components/Sections";
import { articles } from "@/lib/site";
import { pageMetadata, JsonLd } from "@/lib/seo";
import { getManagedArticle, getManagedArticles } from "@/lib/managed-content";
import { ArticleGallery } from "@/components/ArticleGallery";
import { VideoGallery } from "@/components/VideoGallery";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [...articles.map(({ slug }) => ({ slug })), ...(await getManagedArticles()).map(({ slug }) => ({ slug }))].filter((item, index, array) => array.findIndex((entry) => entry.slug === item.slug) === index);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getManagedArticle(slug);
  return post ? pageMetadata(post.title, post.intro, `/kien-thuc/${slug}`) : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getManagedArticle(slug);
  if (!post) notFound();
  const date = new Date(`${post.date}T00:00:00+07:00`);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const imageUrls = post.images.map((image) => image.url.startsWith("http") ? image.url : `${siteUrl}${image.url}`);
  const imagesAfter = (paragraph: number) => post.images.filter((image) => image.afterParagraph === paragraph);
  return <><article className="container article-detail"><Breadcrumb items={[{ label: "Kiến thức", href: "/kien-thuc" }, { label: post.category, href: "/kien-thuc" }, { label: post.title }]} /><div className="article-body"><div className="eyebrow"><span className="eyebrow-line" />{post.category}</div><h1>{post.title}</h1><p className="article-intro">{post.intro}</p><p className="article-byline">Quốc Dương Auto <span>·</span> <time dateTime={post.date}>{date.toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}</time></p><div className="article-content"><ArticleGallery images={imagesAfter(0)} /><VideoGallery videos={post.videos ?? []} />{post.body.map((paragraph, index) => <div key={`${index}-${paragraph}`}><p>{paragraph}</p><ArticleGallery images={imagesAfter(index + 1)} /></div>)}<h2>Trao đổi phương án phù hợp</h2><p>Mỗi dòng xe và phiên bản có thể yêu cầu cấu hình khác nhau. Hãy chia sẻ nhu cầu để gara xác nhận hạng mục và chi phí cụ thể trước khi quyết định.</p><Link className="text-link" href={`/dich-vu/${post.related}`}>Tìm hiểu dịch vụ liên quan <span>↗</span></Link></div></div></article><JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.intro, datePublished: post.date, dateModified: post.date, author: { "@type": "Organization", name: "Quốc Dương Auto" }, publisher: { "@type": "Organization", name: "Quốc Dương Auto" }, image: imageUrls, mainEntityOfPage: `${siteUrl}/kien-thuc/${post.slug}` }} /><CTA /></>;
}
