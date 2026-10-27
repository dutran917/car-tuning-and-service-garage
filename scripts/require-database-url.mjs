import "dotenv/config";

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL before changing the database schema.");
  process.exit(1);
}
