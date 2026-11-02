#!/usr/bin/env python3
"""
Quốc Dương Auto - Facebook Fanpage Post Crawler & Website Database Importer
Synchronizes posts (text, images, videos, original links) from Facebook Fanpage to
Quốc Dương Auto website database (PostgreSQL) and static media directory.
"""

import argparse
import hashlib
import io
import json
import logging
import os
import re
import sys
import unicodedata
import urllib.parse
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone

try:
    import psycopg2
    from psycopg2.extras import Json
except ImportError:
    psycopg2 = None
    Json = None

try:
    from PIL import Image, ImageOps
except ImportError:
    Image = None
    ImageOps = None

# Default configuration
DEFAULT_FANPAGE_ID = "108880947180099"  # profile.php?id=100063240608455 maps to page 108880947180099
DEFAULT_ACCESS_TOKEN = (
    "EAApaouqufG8BSx4tDfbuks3s1YOdq1kOmgJI2fqJxvJc4Cd4ipkZCKUGb9RZBuZAnxytWIFfD9wJX2elZCjl8IQayZAVscLZBeDAPZAWIZCWEF2PJ1XpiStaQATPOTtqt7FTXe7GqaMvcR0XDDCYxSLp9ZBs3wCGT2VFumZA7uZB2FEURJ0wFmvR3xIE8PNZBoCgJWjZAshaeFjAs00HFdWgZANHa14GWvwDLo9HMRgmCQRfOKr5VTZCScZB5VVA6gZDZD"
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("fb_crawler")


def parse_env_file(filepath):
    """Load key-value pairs from an env file."""
    env = {}
    if not os.path.exists(filepath):
        return env
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip("\"'")
    return env


def get_db_connection(database_url):
    """Establish PostgreSQL connection using psycopg2."""
    if not psycopg2:
        raise RuntimeError("psycopg2 is required. Run 'sudo apt-get install python3-psycopg2' or 'pip install psycopg2-binary'.")
    # Clean Prisma query params
    clean_url = database_url.split("?")[0]
    return psycopg2.connect(clean_url)


def init_sync_table(conn):
    """Ensure FacebookImportSync tracking table exists."""
    with conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS "FacebookImportSync" (
                "postId" VARCHAR(120) PRIMARY KEY,
                "targetType" VARCHAR(50) NOT NULL,
                "slug" VARCHAR(200) NOT NULL,
                "permalink" VARCHAR(500),
                "createdTime" VARCHAR(100),
                "importedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "mediaCount" INT DEFAULT 0
            );
            CREATE INDEX IF NOT EXISTS "FacebookImportSync_slug_idx" ON "FacebookImportSync"("slug");
            """
        )
    conn.commit()


def slugify(text):
    """Convert Vietnamese text to SEO friendly slug."""
    text = text.lower()
    text = text.replace("đ", "d").replace("Đ", "d")
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text[:75].rstrip("-")


def clean_title(caption):
    """Extract and format a clean title from post caption."""
    lines = [l.strip() for l in caption.split("\n") if l.strip()]
    if not lines:
        return "Gói nâng cấp xe Quốc Dương Auto"

    first = lines[0]
    # Remove hashtags and decorative symbols
    first = re.sub(r"#\S+", "", first)
    first = re.sub(r"[^\w\s,.\-–·&/()]", "", first).strip()

    # If first line has multiple sentences, take the primary one
    if len(first) > 80 and ("." in first or "," in first):
        parts = re.split(r"[.,;]", first)
        if len(parts[0].strip()) >= 20:
            first = parts[0].strip()

    caption_lower = caption.lower()
    prefix = ""
    if "lx600" in first.lower() or "lx600" in caption_lower:
        prefix = "LX600 · "
    elif "mpv7" in first.lower() or "mpv7" in caption_lower:
        prefix = "MPV7 · "
    elif "vf8" in first.lower() or "vf8" in caption_lower:
        prefix = "VF8 · "
    elif "vf7" in first.lower() or "vf7" in caption_lower:
        prefix = "VF7 · "
    elif "vf5" in first.lower() or "vf5" in caption_lower:
        prefix = "VF5 · "
    elif "vf3" in first.lower() or "vf3" in caption_lower or any("vf3" in l.lower() for l in lines):
        if not first.upper().startswith("VF3"):
            prefix = "VF3 · "

    clean = f"{prefix}{first}".strip()
    clean = re.sub(r"\s+", " ", clean)
    return clean[:140]


def extract_items(caption):
    """Extract list items / upgrade highlights from caption."""
    items = []
    lines = caption.split("\n")
    for line in lines:
        line = line.strip()
        m = re.match(r"^(?:[✔️•\-\*\+✅✦▪️▫️]|\d+[\.\)])\s*(.+)$", line)
        if m:
            item_text = m.group(1).strip()
            item_text = re.sub(r"[^\w\s,.\-–/()%()+]", "", item_text).strip()
            if item_text and len(item_text) >= 3:
                items.append(item_text[:180])

    if not items:
        # Default fallback items for packages
        items = [
            "Tư vấn concept và phong cách nâng cấp theo nhu cầu",
            "Chọn phụ kiện, vật liệu và phương án thi công tương thích",
            "Xác nhận kiểm tra kỹ thuật trước khi lắp đặt hoàn thiện",
            "Báo giá chi tiết và cam kết chế độ bảo hành gara",
        ]
    return items[:18]


def detect_attributes(caption, items):
    """Detect car model, upgrade style, budget category, and range."""
    combined = (caption + " " + " ".join(items)).lower()

    # Vehicle
    if "lx600" in combined or "lexus" in combined:
        vehicle = "Lexus LX600"
    elif "mpv7" in combined:
        vehicle = "VinFast MPV7"
    elif "vf7" in combined:
        vehicle = "VinFast VF7"
    elif "vf8" in combined:
        vehicle = "VinFast VF8"
    elif "vf9" in combined:
        vehicle = "VinFast VF9"
    elif "vf6" in combined:
        vehicle = "VinFast VF6"
    elif "vf5" in combined:
        vehicle = "VinFast VF5"
    elif "mazda" in combined:
        vehicle = "Mazda"
    elif "toyota" in combined or "camry" in combined or "cross" in combined:
        vehicle = "Toyota"
    elif "ford" in combined or "ranger" in combined or "raptor" in combined:
        vehicle = "Ford"
    elif "kia" in combined or "carnival" in combined:
        vehicle = "Kia"
    elif "hyundai" in combined or "santafe" in combined or "tucson" in combined:
        vehicle = "Hyundai"
    elif "mercedes" in combined or "glc" in combined or "c300" in combined:
        vehicle = "Mercedes-Benz"
    elif "vf3" in combined:
        vehicle = "VinFast VF3"
    else:
        vehicle = "VinFast VF3"

    # Range and Budget
    if "200" in combined or "2xx" in combined:
        range_str = "120–200 triệu đồng tham khảo (gói 2xx)"
        budget = "120–200"
    elif "17x" in combined or "16x" in combined:
        range_str = "120–200 triệu đồng tham khảo (gói cao cấp)"
        budget = "120–200"
    elif "1xx" in combined or "svip" in combined:
        range_str = "120–200 triệu đồng tham khảo (gói 1xx)"
        budget = "120–200"
    elif "8x" in combined:
        range_str = "60–120 triệu đồng tham khảo (gói 8x)"
        budget = "60–120"
    elif "7x" in combined:
        range_str = "60–120 triệu đồng tham khảo (gói 7x)"
        budget = "60–120"
    elif "6x" in combined or "hơn 60" in combined:
        range_str = "60–120 triệu đồng tham khảo (gói 6x)"
        budget = "60–120"
    elif "3x" in combined or "4x" in combined or "5x" in combined:
        range_str = "30–60 triệu đồng tham khảo"
        budget = "30–60"
    else:
        range_str = "Tư vấn theo cấu hình xe"
        budget = "all"

    # Style
    if "brabus" in combined or "g63" in combined or "cá tính" in combined or "cá nhân" in combined or "svip" in combined:
        style = "Concept cá nhân hóa"
    elif "nội" in combined and "ngoại" in combined:
        style = "Ngoại thất & nội thất"
    elif "body" in combined or "lip" in combined or "mâm" in combined or "cản" in combined:
        style = "Ngoại thất thể thao"
    elif "nội thất" in combined or "ghế" in combined or "da nappa" in combined or "trần" in combined:
        style = "Nội thất & tiện nghi"
    else:
        style = "Nâng cấp tiện nghi"

    return vehicle, style, budget, range_str


def format_package_text(caption, permalink):
    """Format package text body with paragraphs and canonical source link."""
    paragraphs = []
    for block in caption.split("\n\n"):
        block = block.strip()
        if not block:
            continue
        paragraphs.append(block)

    text = "\n\n".join(paragraphs).strip()

    # Clamp text to schema limit 1800 chars
    if len(text) > 1780:
        text = text[:1770] + "..."
    return text


def download_and_optimize_image(url, output_dir, slug, index):
    """Download an image, optimize and convert to WebP."""
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()

    short_hash = hashlib.md5(data[:512]).hexdigest()[:6]
    filename = f"quocduong-auto-{slug}-{index}-{short_hash}.webp"
    filepath = os.path.join(output_dir, filename)

    if Image:
        im = Image.open(io.BytesIO(data))
        if ImageOps:
            try:
                im = ImageOps.exif_transpose(im)
            except Exception:
                pass

        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGB")

        # Resize if very large (> 1920)
        max_dim = 1920
        if im.width > max_dim or im.height > max_dim:
            im.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

        im.save(filepath, format="WEBP", quality=85, method=6)
    else:
        filename = f"quocduong-auto-{slug}-{index}-{short_hash}.jpg"
        filepath = os.path.join(output_dir, filename)
        with open(filepath, "wb") as f:
            f.write(data)

    os.chmod(filepath, 0o644)
    return f"/uploads/{filename}"


def download_video(url, output_dir, slug, index=1):
    """Stream and download an MP4 video (max 60MB)."""
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
    )
    short_uuid = uuid.uuid4().hex[:6]
    filename = f"quocduong-auto-{slug}-video-{index}-{short_uuid}.mp4"
    filepath = os.path.join(output_dir, filename)

    downloaded = 0
    max_bytes = 60 * 1024 * 1024  # 60 MB safety cap

    with urllib.request.urlopen(req, timeout=120) as resp, open(filepath, "wb") as f:
        while True:
            chunk = resp.read(64 * 1024)
            if not chunk:
                break
            downloaded += len(chunk)
            if downloaded > max_bytes:
                logger.warning(f"Video exceeded {max_bytes // (1024*1024)}MB cap. Stopping stream.")
                break
            f.write(chunk)

    os.chmod(filepath, 0o644)
    return f"/uploads/{filename}"


def fetch_fanpage_posts(page_id, access_token, days=None, year=None, limit=None):
    """Fetch posts from Facebook Fanpage Graph API within date range."""
    cutoff_start = None
    cutoff_end = None

    if year:
        cutoff_start = datetime(year, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
        cutoff_end = datetime(year, 12, 31, 23, 59, 59, tzinfo=timezone.utc)
        logger.info(f"Filtering posts for full year {year}: {cutoff_start} to {cutoff_end}")
    elif days and days > 0:
        cutoff_start = datetime.now(timezone.utc) - timedelta(days=days)
        logger.info(f"Filtering posts newer than: {cutoff_start.strftime('%Y-%m-%d %H:%M:%S UTC')} (past {days} days)")

    url = (
        f"https://graph.facebook.com/v19.0/{page_id}/feed?"
        + urllib.parse.urlencode({
            "fields": "id,created_time,message,permalink_url,attachments{media_type,type,url,title,description,media,subattachments}",
            "limit": 50,
            "access_token": access_token,
        })
    )

    all_posts = []
    page_num = 0

    while url:
        page_num += 1
        logger.info(f"Fetching Facebook feed page {page_num}...")
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        posts = data.get("data", [])
        if not posts:
            break

        for p in posts:
            dt = datetime.fromisoformat(p["created_time"].replace("+0000", "+00:00"))
            p["parsed_dt"] = dt

            if cutoff_start and dt < cutoff_start:
                logger.info(f"Reached cutoff start at post {p['id']} ({p['created_time'][:10]}). Stopping pagination.")
                return all_posts

            if cutoff_end and dt > cutoff_end:
                continue

            all_posts.append(p)
            if limit and len(all_posts) >= limit:
                logger.info(f"Reached requested limit of {limit} posts.")
                return all_posts

        url = data.get("paging", {}).get("next")

    return all_posts


def process_post_media(post, output_dir, slug, dry_run=False):
    """Extract, download and optimize images and videos from post attachments."""
    attachments = post.get("attachments", {}).get("data", [])
    raw_images = []
    raw_videos = []

    for att in attachments:
        if att.get("media_type") == "video" or "source" in att.get("media", {}):
            vid_source = att.get("media", {}).get("source")
            thumb = att.get("media", {}).get("image", {}).get("src")
            if vid_source:
                raw_videos.append({"url": vid_source, "thumb": thumb})
        elif att.get("media_type") == "photo" or "image" in att.get("media", {}):
            img_src = att.get("media", {}).get("image", {}).get("src")
            if img_src:
                raw_images.append(img_src)

        sub = att.get("subattachments", {}).get("data", [])
        for s in sub:
            if s.get("media_type") == "video" or "source" in s.get("media", {}):
                vid_source = s.get("media", {}).get("source")
                thumb = s.get("media", {}).get("image", {}).get("src")
                if vid_source:
                    raw_videos.append({"url": vid_source, "thumb": thumb})
            elif "image" in s.get("media", {}):
                img_src = s.get("media", {}).get("image", {}).get("src")
                if img_src:
                    raw_images.append(img_src)

    if dry_run:
        return [f"/uploads/dry-run-image-{i}.webp" for i in range(len(raw_images))], [
            f"/uploads/dry-run-video-{i}.mp4" for i in range(len(raw_videos))
        ]

    uploaded_images = []
    for idx, img_url in enumerate(raw_images[:16], 1):
        try:
            local_url = download_and_optimize_image(img_url, output_dir, slug, idx)
            uploaded_images.append(local_url)
        except Exception as e:
            logger.warning(f"Failed to download image {idx} for {slug}: {e}")

    uploaded_videos = []
    for idx, vid_info in enumerate(raw_videos[:4], 1):
        try:
            local_vid = download_video(vid_info["url"], output_dir, slug, idx)
            uploaded_videos.append(local_vid)
            if not uploaded_images and vid_info.get("thumb"):
                try:
                    thumb_url = download_and_optimize_image(vid_info["thumb"], output_dir, slug, "cover")
                    uploaded_images.append(thumb_url)
                except Exception as te:
                    logger.warning(f"Failed to download video thumbnail: {te}")
        except Exception as e:
            logger.warning(f"Failed to download video {idx} for {slug}: {e}")

    return uploaded_images, uploaded_videos


def generate_unique_slug(conn, base_slug, post_id):
    """Ensure slug is unique across ManagedPackage and not used by another post."""
    with conn.cursor() as cur:
        # Check if this exact post already owns a slug
        cur.execute('SELECT slug FROM "FacebookImportSync" WHERE "postId" = %s;', (post_id,))
        row = cur.fetchone()
        if row:
            return row[0]

        slug = base_slug
        # Check if slug exists in ManagedPackage
        cur.execute('SELECT id FROM "ManagedPackage" WHERE slug = %s;', (slug,))
        if not cur.fetchone():
            return slug

        # Append short post id fragment
        short_id = post_id.split("_")[-1][-6:]
        slug = f"{base_slug}-{short_id}"
        cur.execute('SELECT id FROM "ManagedPackage" WHERE slug = %s;', (slug,))
        if not cur.fetchone():
            return slug

        # Fallback counter
        for counter in range(2, 50):
            cand = f"{base_slug}-{short_id}-{counter}"
            cur.execute('SELECT id FROM "ManagedPackage" WHERE slug = %s;', (cand,))
            if not cur.fetchone():
                return cand

    return f"{base_slug}-{uuid.uuid4().hex[:6]}"


def import_package(conn, package_data, post_id, permalink, created_time, overwrite=False, dry_run=False):
    """Upsert package into ManagedPackage and record sync."""
    slug = package_data["slug"]
    if dry_run:
        logger.info(f"[DRY-RUN] Would upsert ManagedPackage: slug={slug}, name={package_data['name']}")
        return True

    with conn.cursor() as cur:
        cur.execute('SELECT id FROM "ManagedPackage" WHERE slug = %s;', (slug,))
        existing = cur.fetchone()

        if existing and not overwrite:
            logger.info(f"[SKIP] ManagedPackage slug '{slug}' already exists in DB.")
            cur.execute(
                """
                INSERT INTO "FacebookImportSync" ("postId", "targetType", "slug", "permalink", "createdTime", "mediaCount")
                VALUES (%s, 'ManagedPackage', %s, %s, %s, %s)
                ON CONFLICT ("postId") DO UPDATE SET "slug" = EXCLUDED."slug";
                """,
                (post_id, slug, permalink, created_time, len(package_data["images"])),
            )
            conn.commit()
            return False

        record_id = existing[0] if existing else f"cmv_fb_{uuid.uuid4().hex[:18]}"

        if existing:
            cur.execute(
                """
                UPDATE "ManagedPackage"
                SET "name" = %s,
                    "vehicle" = %s,
                    "style" = %s,
                    "budget" = %s,
                    "range" = %s,
                    "text" = %s,
                    "items" = %s,
                    "imageUrl" = %s,
                    "images" = %s,
                    "videos" = %s,
                    "active" = %s,
                    "sortOrder" = %s,
                    "updatedAt" = CURRENT_TIMESTAMP
                WHERE slug = %s;
                """,
                (
                    package_data["name"],
                    package_data["vehicle"],
                    package_data["style"],
                    package_data["budget"],
                    package_data["range"],
                    package_data["text"],
                    Json(package_data["items"]),
                    package_data["imageUrl"],
                    Json(package_data["images"]),
                    Json(package_data["videos"]),
                    package_data["active"],
                    package_data["sortOrder"],
                    slug,
                ),
            )
            logger.info(f"[UPDATE] Updated ManagedPackage '{slug}' in DB.")
        else:
            cur.execute(
                """
                INSERT INTO "ManagedPackage" (
                    "id", "slug", "name", "vehicle", "style", "budget", "range",
                    "text", "items", "imageUrl", "images", "videos", "active", "sortOrder",
                    "createdAt", "updatedAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
                """,
                (
                    record_id,
                    slug,
                    package_data["name"],
                    package_data["vehicle"],
                    package_data["style"],
                    package_data["budget"],
                    package_data["range"],
                    package_data["text"],
                    Json(package_data["items"]),
                    package_data["imageUrl"],
                    Json(package_data["images"]),
                    Json(package_data["videos"]),
                    package_data["active"],
                    package_data["sortOrder"],
                ),
            )
            logger.info(f"[INSERT] Inserted ManagedPackage '{slug}' into DB.")

        cur.execute(
            """
            INSERT INTO "FacebookImportSync" ("postId", "targetType", "slug", "permalink", "createdTime", "mediaCount")
            VALUES (%s, 'ManagedPackage', %s, %s, %s, %s)
            ON CONFLICT ("postId") DO UPDATE
            SET "slug" = EXCLUDED."slug",
                "permalink" = EXCLUDED."permalink",
                "importedAt" = CURRENT_TIMESTAMP,
                "mediaCount" = EXCLUDED."mediaCount";
            """,
            (post_id, slug, permalink, created_time, len(package_data["images"])),
        )

    conn.commit()
    return True


def check_is_synced(conn, post_id):
    """Check if post was already imported."""
    with conn.cursor() as cur:
        cur.execute('SELECT slug FROM "FacebookImportSync" WHERE "postId" = %s;', (post_id,))
        row = cur.fetchone()
        return row[0] if row else None


def main():
    parser = argparse.ArgumentParser(description="Quốc Dương Auto FB Crawler & Importer")
    parser.add_argument("--token", default=os.environ.get("FB_ACCESS_TOKEN", DEFAULT_ACCESS_TOKEN), help="Facebook Access Token")
    parser.add_argument("--page-id", default=os.environ.get("FB_PAGE_ID", DEFAULT_FANPAGE_ID), help="Facebook Page ID")
    parser.add_argument("--env-file", default="/etc/quocduong-auto.env", help="Path to production .env file")
    parser.add_argument("--days", type=int, default=None, help="Crawl posts from past N days")
    parser.add_argument("--year", type=int, default=None, help="Crawl all posts for specific year (e.g. 2026)")
    parser.add_argument("--limit", type=int, default=None, help="Maximum number of posts to process")
    parser.add_argument("--dry-run", action="store_true", help="Preview crawl without modifying files or DB")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing database entries")
    parser.add_argument("--upload-dir", default=None, help="Custom upload directory")
    args = parser.parse_args()

    env_vars = {}
    if os.path.exists(args.env_file):
        env_vars = parse_env_file(args.env_file)
    elif os.path.exists(".env"):
        env_vars = parse_env_file(".env")

    db_url = env_vars.get("DATABASE_URL") or os.environ.get("DATABASE_URL")
    upload_dir = args.upload_dir or env_vars.get("UPLOAD_DIR") or "/var/lib/quocduong-auto/uploads"

    if not db_url:
        logger.error("DATABASE_URL not found in env file or environment variables.")
        sys.exit(1)

    os.makedirs(upload_dir, exist_ok=True)

    logger.info("==================================================")
    logger.info("QUỐC DƯƠNG AUTO - FACEBOOK CRAWLER & DB IMPORTER")
    logger.info(f"Target Page ID: {args.page_id}")
    if args.year:
        logger.info(f"Year Filter: Full Year {args.year}")
    elif args.days:
        logger.info(f"Date Range: Past {args.days} days")
    else:
        logger.info("Date Range: All available posts")
    logger.info(f"Upload Directory: {upload_dir}")
    logger.info(f"Dry Run Mode: {args.dry_run}")
    logger.info("==================================================")

    conn = get_db_connection(db_url)
    init_sync_table(conn)

    posts = fetch_fanpage_posts(
        page_id=args.page_id,
        access_token=args.token,
        days=args.days,
        year=args.year,
        limit=args.limit,
    )
    logger.info(f"Fetched {len(posts)} posts matching criteria.")

    success_count = 0
    skip_count = 0
    error_count = 0

    for idx, post in enumerate(posts, 1):
        post_id = post["id"]
        created_time = post["created_time"]
        permalink = post.get("permalink_url", "")
        caption = post.get("message", "").strip()

        logger.info(f"\n[{idx}/{len(posts)}] Processing Post: {post_id} ({created_time[:10]})")

        if not caption:
            logger.warning(f"Post {post_id} has no caption/message. Skipping.")
            skip_count += 1
            continue

        already_synced_slug = check_is_synced(conn, post_id)
        if already_synced_slug and not args.overwrite:
            logger.info(f"[SKIP] Post {post_id} already synced with slug '{already_synced_slug}'.")
            skip_count += 1
            continue

        try:
            title = clean_title(caption)
            base_slug = slugify(title)
            slug = generate_unique_slug(conn, base_slug, post_id)

            if already_synced_slug:
                slug = already_synced_slug

            items = extract_items(caption)
            vehicle, style, budget, range_str = detect_attributes(caption, items)
            formatted_text = format_package_text(caption, permalink)

            logger.info(f"  Title: {title}")
            logger.info(f"  Slug: {slug}")
            logger.info(f"  Vehicle: {vehicle} | Style: {style} | Budget: {budget} | Range: {range_str}")
            logger.info(f"  Items extracted: {len(items)}")

            image_urls, video_urls = process_post_media(post, upload_dir, slug, dry_run=args.dry_run)
            logger.info(f"  Media saved: {len(image_urls)} images, {len(video_urls)} videos")

            package_images = [
                {"url": u, "alt": f"{title} — ảnh {i+1}", "caption": ""}
                for i, u in enumerate(image_urls)
            ]
            package_videos = [
                {"url": u, "title": "Video thi công / bàn giao xe"}
                for u in video_urls
            ]
            cover_url = image_urls[0] if image_urls else None

            package_data = {
                "slug": slug,
                "name": title,
                "vehicle": vehicle,
                "style": style,
                "budget": budget,
                "range": range_str,
                "text": formatted_text,
                "items": items,
                "imageUrl": cover_url,
                "images": package_images,
                "videos": package_videos,
                "active": True,
                "sortOrder": idx,
            }

            res = import_package(
                conn=conn,
                package_data=package_data,
                post_id=post_id,
                permalink=permalink,
                created_time=created_time,
                overwrite=args.overwrite,
                dry_run=args.dry_run,
            )
            if res:
                success_count += 1
            else:
                skip_count += 1

        except Exception as e:
            logger.error(f"[ERROR] Failed to process post {post_id}: {e}", exc_info=True)
            error_count += 1

    conn.close()
    logger.info("\n==================================================")
    logger.info("IMPORT PIPELINE SUMMARY")
    logger.info(f"Total posts processed: {len(posts)}")
    logger.info(f"Successfully imported: {success_count}")
    logger.info(f"Skipped (existing):    {skip_count}")
    logger.info(f"Errors encountered:    {error_count}")
    logger.info("==================================================")


if __name__ == "__main__":
    main()
