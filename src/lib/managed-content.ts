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
export type ArticleImage = { url: string; alt: string; caption: string; afterParagraph: number; isCover?: boolean };
export type ManagedArticle = { slug: string; title: string; category: string; date: string; intro: string; body: string[]; related: string; images: ArticleImage[]; videos?: ManagedVideo[] };

let cachedPackages: ManagedPackage[] | null = null;
let lastPackagesFetch = 0;
let cachedArticles: ManagedArticle[] | null = null;
let lastArticlesFetch = 0;
const CACHE_TTL_MS = 60 * 1000; // 60s memory cache to avoid DB thrashing

export function invalidateManagedContentCache() {
  cachedPackages = null;
  lastPackagesFetch = 0;
  cachedArticles = null;
  lastArticlesFetch = 0;
}

function normalize(row: { slug: string; name: string; vehicle: string; style: string; budget: string; range: string; text: string; items: unknown; imageUrl: string | null; images: unknown; videos: unknown }): ManagedPackage {
  const images = Array.isArray(row.images) ? row.images.filter((item): item is PackageImage => Boolean(item) && typeof item === "object" && typeof (item as PackageImage).url === "string" && typeof (item as PackageImage).alt === "string") : [];
  const videos = Array.isArray(row.videos) ? row.videos.filter((item): item is ManagedVideo => Boolean(item) && typeof item === "object" && typeof (item as ManagedVideo).url === "string" && typeof (item as ManagedVideo).title === "string") : [];
  return { ...row, items: Array.isArray(row.items) ? row.items.filter((item): item is string => typeof item === "string") : [], images: images.length ? images : row.imageUrl ? [{ url: row.imageUrl, alt: row.name, caption: "" }] : [], videos };
}

export async function getManagedPackages(forceRefresh = false): Promise<ManagedPackage[]> {
  const now = Date.now();
  if (!forceRefresh && cachedPackages && now - lastPackagesFetch < CACHE_TTL_MS) {
    return cachedPackages;
  }
  try {
    const rows = await getPrisma().managedPackage.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    if (rows.length) {
      cachedPackages = rows.map(normalize);
      lastPackagesFetch = now;
      return cachedPackages;
    }
  } catch {
    if (cachedPackages) return cachedPackages;
    return defaults.map((item) => ({ ...item, imageUrl: null, images: [], videos: [] }));
  }
  cachedPackages = defaults.map((item) => ({ ...item, imageUrl: null, images: [], videos: [] }));
  lastPackagesFetch = now;
  return cachedPackages;
}

export async function getManagedPackage(slug: string): Promise<ManagedPackage | null> {
  const all = await getManagedPackages();
  const found = all.find((item) => item.slug === slug);
  if (found) return found;

  try {
    const row = await getPrisma().managedPackage.findFirst({ where: { slug, active: true } });
    if (row) return normalize(row);
  } catch {
    // fallback
  }
  return null;
}

export async function getRelatedPackages(currentSlug: string, currentVehicle: string, limit = 3): Promise<ManagedPackage[]> {
  const all = await getManagedPackages();
  const others = all.filter((p) => p.slug !== currentSlug);
  if (!others.length) return [];

  const normCurrent = (currentVehicle || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const sameVehicle = others.filter((p) => {
    const norm = (p.vehicle || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return norm && (norm === normCurrent || norm.includes(normCurrent) || normCurrent.includes(norm));
  });
  const differentVehicle = others.filter((p) => !sameVehicle.includes(p));
  return [...sameVehicle, ...differentVehicle].slice(0, limit);
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

export async function getManagedArticles(forceRefresh = false): Promise<ManagedArticle[]> {
  const now = Date.now();
  if (!forceRefresh && cachedArticles && now - lastArticlesFetch < CACHE_TTL_MS) {
    return cachedArticles;
  }
  try {
    const rows = await getPrisma().managedArticle.findMany({ where: { active: true }, orderBy: [{ date: "desc" }, { createdAt: "desc" }] });
    if (rows.length) {
      cachedArticles = rows.map(normalizeArticle);
      lastArticlesFetch = now;
      return cachedArticles;
    }
  } catch {
    if (cachedArticles) return cachedArticles;
    return defaultArticles.map((item) => ({ ...item, images: [], videos: [] }));
  }
  cachedArticles = defaultArticles.map((item) => ({ ...item, images: [], videos: [] }));
  lastArticlesFetch = now;
  return cachedArticles;
}

export async function getManagedArticle(slug: string): Promise<ManagedArticle | null> {
  const all = await getManagedArticles();
  const found = all.find((item) => item.slug === slug);
  if (found) return found;

  try {
    const row = await getPrisma().managedArticle.findFirst({ where: { slug, active: true } });
    if (row) return normalizeArticle(row);
  } catch {
    // fallback
  }
  return null;
}

export async function seedManagedArticles() {
  const prisma = getPrisma();
  if (await prisma.managedArticle.count()) return;
  await prisma.managedArticle.createMany({ data: defaultArticles.map((item) => ({ ...item, body: item.body, images: [] })) });
}

export { getVehicleBadge } from "@/lib/vehicle-badge";
