import { articles as defaultArticles, packages as defaults } from "@/lib/site";
import { getPrisma } from "@/lib/prisma";

export type ManagedPackage = {
  slug: string;
  name: string;
  vehicle: string;
  style: string;
  budget: string;
  range: string;
  text: string;
  items: string[];
  imageUrl?: string | null;
  images: PackageImage[];
  videos?: ManagedVideo[];
};

export type PackageImage = { url: string; alt: string; caption: string };
export type ManagedVideo = { url: string; title: string };
export type ArticleImage = { url: string; alt: string; caption: string; afterParagraph: number };
export type ManagedArticle = { slug: string; title: string; category: string; date: string; intro: string; body: string[]; related: string; images: ArticleImage[]; videos?: ManagedVideo[] };

function normalize(row: { slug: string; name: string; vehicle: string; style: string; budget: string; range: string; text: string; items: unknown; imageUrl: string | null; images: unknown; videos: unknown }): ManagedPackage {
  const images = Array.isArray(row.images) ? row.images.filter((item): item is PackageImage => Boolean(item) && typeof item === "object" && typeof (item as PackageImage).url === "string" && typeof (item as PackageImage).alt === "string") : [];
  const videos = Array.isArray(row.videos) ? row.videos.filter((item): item is ManagedVideo => Boolean(item) && typeof item === "object" && typeof (item as ManagedVideo).url === "string" && typeof (item as ManagedVideo).title === "string") : [];
  return { ...row, items: Array.isArray(row.items) ? row.items.filter((item): item is string => typeof item === "string") : [], images: images.length ? images : row.imageUrl ? [{ url: row.imageUrl, alt: row.name, caption: "" }] : [], videos };
}

export async function getManagedPackages() {
  try {
    const rows = await getPrisma().managedPackage.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    if (rows.length) return rows.map(normalize);
  } catch {
    return defaults.map((item) => ({ ...item, imageUrl: null, images: [], videos: [] }));
  }
  return defaults.map((item) => ({ ...item, imageUrl: null, images: [], videos: [] }));
}

export async function getManagedPackage(slug: string) {
  return (await getManagedPackages()).find((item) => item.slug === slug);
}

export async function getPackageRedirect(slug: string) {
  try {
    return (await getPrisma().contentRedirect.findUnique({ where: { fromPath: `/goi-do/${slug}` } }))?.toPath ?? null;
  } catch {
    return null;
  }
}

export async function getHeroImage() {
  try {
    const setting = await getPrisma().siteSetting.findUnique({ where: { key: "heroImage" } });
    return setting?.value || null;
  } catch {
    return null;
  }
}

export async function seedManagedPackages() {
  const prisma = getPrisma();
  if (await prisma.managedPackage.count()) return;
  await prisma.managedPackage.createMany({ data: defaults.map((item, sortOrder) => ({ ...item, items: item.items, images: [], sortOrder })) });
}

function normalizeArticle(row: { slug: string; title: string; category: string; date: string; intro: string; body: unknown; related: string; images: unknown; videos: unknown }): ManagedArticle {
  return {
    ...row,
    body: Array.isArray(row.body) ? row.body.filter((item): item is string => typeof item === "string") : [],
    images: Array.isArray(row.images) ? row.images.filter((item): item is ArticleImage => Boolean(item) && typeof item === "object" && typeof (item as ArticleImage).url === "string" && typeof (item as ArticleImage).alt === "string") : [],
    videos: Array.isArray(row.videos) ? row.videos.filter((item): item is ManagedVideo => Boolean(item) && typeof item === "object" && typeof (item as ManagedVideo).url === "string" && typeof (item as ManagedVideo).title === "string") : [],
  };
}

export async function getManagedArticles() {
  try {
    const rows = await getPrisma().managedArticle.findMany({ where: { active: true }, orderBy: [{ date: "desc" }, { createdAt: "desc" }] });
    if (rows.length) return rows.map(normalizeArticle);
  } catch {
    return defaultArticles.map((item) => ({ ...item, images: [], videos: [] }));
  }
  return defaultArticles.map((item) => ({ ...item, images: [], videos: [] }));
}

export async function getManagedArticle(slug: string) {
  return (await getManagedArticles()).find((item) => item.slug === slug);
}

export async function seedManagedArticles() {
  const prisma = getPrisma();
  if (await prisma.managedArticle.count()) return;
  await prisma.managedArticle.createMany({ data: defaultArticles.map((item) => ({ ...item, body: item.body, images: [] })) });
}
