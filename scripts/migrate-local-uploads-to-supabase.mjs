import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

const applyChanges = process.argv.includes("--apply");
const databaseUrl = process.env.DATABASE_URL;
const storageUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const storageKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET;

if (!databaseUrl || !storageUrl || !storageKey || !bucket || !/^[a-z0-9_-]+$/i.test(bucket)) {
  throw new Error("Set DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET first.");
}

const pool = new Pool({ connectionString: databaseUrl });
const uploadsDirectory = path.join(process.cwd(), "public", "uploads");
const assets = new Map();

function getLocalFilename(url) {
  const match = /^\/uploads\/([a-zA-Z0-9._-]+)$/.exec(url);
  return match?.[1] ?? null;
}

function mediaTypeFor(filename) {
  const extension = path.extname(filename).toLowerCase();
  return ({ ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".mp4": "video/mp4", ".webm": "video/webm" })[extension] ?? "application/octet-stream";
}

async function migrateUrl(url) {
  if (!url.startsWith("/uploads/")) return url;
  if (assets.has(url)) return assets.get(url);
  const filename = getLocalFilename(url);
  if (!filename) throw new Error(`Unsafe local upload path: ${url}`);
  const bytes = await readFile(path.join(uploadsDirectory, filename));
  const objectPath = `legacy/${filename}`;
  if (applyChanges) {
    const response = await globalThis.fetch(`${storageUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath}`, {
      method: "POST",
      headers: { apikey: storageKey, Authorization: `Bearer ${storageKey}`, "Content-Type": mediaTypeFor(filename), "x-upsert": "true", "cache-control": "max-age=31536000" },
      body: bytes,
      signal: globalThis.AbortSignal.timeout(60_000),
    });
    if (!response.ok) throw new Error(`Storage upload failed for ${filename} (${response.status}).`);
  }
  const publicUrl = `${storageUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectPath}`;
  assets.set(url, publicUrl);
  return publicUrl;
}

async function migrateJson(value) {
  if (Array.isArray(value)) return Promise.all(value.map(migrateJson));
  if (!value || typeof value !== "object") return value;
  const entries = await Promise.all(Object.entries(value).map(async ([key, item]) => [key, key === "url" && typeof item === "string" ? await migrateUrl(item) : await migrateJson(item)]));
  return Object.fromEntries(entries);
}

try {
  const [packages, articles, hero] = await Promise.all([
    pool.query('SELECT slug, "imageUrl", images, videos FROM "ManagedPackage"'),
    pool.query('SELECT slug, images, videos FROM "ManagedArticle"'),
    pool.query('SELECT key, value FROM "SiteSetting" WHERE key = $1', ["heroImage"]),
  ]);

  for (const row of packages.rows) {
    await migrateUrl(row.imageUrl || "");
    await migrateJson(row.images);
    await migrateJson(row.videos);
  }
  for (const row of articles.rows) {
    await migrateJson(row.images);
    await migrateJson(row.videos);
  }
  for (const row of hero.rows) await migrateUrl(row.value || "");

  if (!applyChanges) {
    console.log(`Dry run: ${assets.size} local media files referenced by ${packages.rowCount} packages, ${articles.rowCount} articles and ${hero.rowCount} hero settings.`);
    console.log("Run npm run storage:migrate:apply to upload them and replace database URLs.");
  } else {
    await pool.query("BEGIN");
    try {
      for (const row of packages.rows) {
        await pool.query('UPDATE "ManagedPackage" SET "imageUrl" = $1, images = $2::jsonb, videos = $3::jsonb WHERE slug = $4', [assets.get(row.imageUrl) ?? row.imageUrl, JSON.stringify(await migrateJson(row.images)), JSON.stringify(await migrateJson(row.videos)), row.slug]);
      }
      for (const row of articles.rows) {
        await pool.query('UPDATE "ManagedArticle" SET images = $1::jsonb, videos = $2::jsonb WHERE slug = $3', [JSON.stringify(await migrateJson(row.images)), JSON.stringify(await migrateJson(row.videos)), row.slug]);
      }
      for (const row of hero.rows) await pool.query('UPDATE "SiteSetting" SET value = $1 WHERE key = $2', [assets.get(row.value) ?? row.value, row.key]);
      await pool.query("COMMIT");
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
    console.log(`Migrated ${assets.size} media files to Supabase Storage and updated database references.`);
  }
} finally {
  await pool.end();
}
