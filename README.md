# Quốc Dương Auto — Car Tuning & Service

Marketing site and first-party lead capture for Quốc Dương Auto. Built with Next.js App Router, TypeScript and PostgreSQL through Prisma. Content is server rendered; lead capture fails visibly when persistence is unavailable.

## Local setup

Requirements: Node.js 22.12+ (22 LTS) or 24+, npm and PostgreSQL 14+.

1. Copy `.env.example` to `.env` and set `DATABASE_URL` plus a local `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
2. Install and prepare the database:

   ```sh
   npm install
   npm run db:generate
   npm run db:push
   ```

3. Run `npm run dev`, then open `http://localhost:3000`.
4. Use `npm run typecheck`, `npm run lint` and `npm run build` before deployment.

The quote form is intentionally not presented as successful if PostgreSQL is missing or unreachable. The API returns a visible error and does not claim that a lead was saved.

## Production deployment

For Google Cloud, see [`docs/gcp-deployment.md`](docs/gcp-deployment.md) for Cloud Run, Cloud SQL, Cloud Build, Artifact Registry, Secret Manager and media-storage setup. The app is packaged as a standalone Next.js container. Cloud Run's local filesystem is ephemeral; production media continues to use Supabase Storage unless a durable object storage adapter is implemented.

Set a unique production `ADMIN_PASSWORD` and random `ADMIN_SESSION_SECRET` (at least 32 characters); never reuse local credentials. Keep credentials in Secret Manager. Use managed PostgreSQL, back it up, run schema updates deliberately (not on container startup), and migrate existing database content and uploads before cutover. Do not run the application database as `root`.

The process-local IP rate limit is only a basic safeguard and does not coordinate multiple instances. Before campaigns, add an edge/WAF limit or shared rate-limit store. Configure a verified canonical HTTPS domain before building because `NEXT_PUBLIC_SITE_URL` is embedded at build time. Add Search Console verification and submit `/sitemap.xml`. Only publish verified contact, location, warranty and business facts.

## SEO and content

Static routes, service pages, VF3 package pages and article pages have distinct metadata and canonical URLs. `src/app/sitemap.ts` builds a sitemap from the central content catalog. `robots.ts` publishes it. Dynamic parameter/filter result URLs are not generated. Add redirects for old paths in `next.config.ts` after confirming historic URLs and destination pages. The hostname remains a deployment setting.

Content catalogs live in `src/lib/site.ts`. Current budget bands reflect the owner-provided approximate 30–200 million VND context and are explicitly presented as non-binding references. The concept gallery is labeled; it is not represented as completed customer work. Replace with approved project assets and verified captions when available.

## Leads and revenue model

`POST /api/leads` validates/sanitizes the form, rejects a honeypot, checks same-origin requests, applies a basic rate limit, creates a unique lead ID and stores attribution in one PostgreSQL transaction. A unique request idempotency key returns the existing lead on network retries and suppresses a repeated `generate_lead` event. Prisma 7 uses the PostgreSQL driver adapter. The `Lead` row is related to `Attribution`, `Appointment`, `Quotation`, `Order`, `MarketingCost` and an idempotent `EventOutbox`. Do not treat a quote amount as booked or collected revenue. Update order events only when the corresponding real business state occurs.

The basic in-memory rate limiter is not shared between serverless workers; production should add a managed edge limit or shared Redis-compatible counter. Lead records contain contact details and need restricted DB/admin access, backups and an approved retention schedule. The content admin is password-protected; it is not a CRM and has no lead-management interface.

## Tracking plan

`/admin` manages the home hero image, package catalog and article content. Clicking a package/article title opens its public detail page in a new tab. Both packages and articles support multiple images and MP4/WebM videos; image galleries use an accessible slider and lightbox, show only operator-written captions, and never expose source filenames. Article images can be placed after a selected paragraph. Videos play muted when scrolled into view, pause outside the viewport, and do not autoplay when reduced motion is preferred. Image uploads are limited to 8 MB; videos to 100 MB each and eight per content item. Local uploads use `public/uploads`; production uploads go directly to configured Supabase Storage. Run `npm run db:push` after schema changes so PostgreSQL adds the `videos` columns.

Tracking implementation is centralized in `src/lib/tracking.ts` and `src/components/TrackingProvider.tsx`. GTM loads only after the visitor consents to analytics or advertising. Consent choices are stored locally; visitors can change them with “Cài đặt cookie” in the footer. No tag IDs are hardcoded. Provide the IDs in `.env.local`/hosting configuration and create the corresponding tags in GTM.

| Event | Trigger | Safe parameters |
| --- | --- | --- |
| `page_view` | Route rendered | `page_type` |
| `view_service`, `view_package` | Detail page rendered; `view_project` becomes active when individual project pages are published | matching content ID |
| `click_phone`, `click_zalo`, `click_facebook`, `click_quote` | Matching CTA activated | `page_type` |
| `form_start` | First focus in quote form | `page_type` |
| `generate_lead` | API returns HTTP 201 with persisted lead ID | `lead_id`, optional `package_id` |
| `qualify_lead`, `appointment_booked`, `sale_won`, `purchase`, `refund`, `order_cancelled` | Emit from authenticated CRM/admin workflow after the real state change | internal IDs, currency/value only where confirmed |

Never include name, phone, free-text notes or email in analytics events. The API does not emit ad conversions. Connect an authenticated operator workflow and outbox dispatcher before sending offline conversions; use outbox idempotency keys and the platform's consent/policy requirements. GTM should map `dataLayer` events to GA4/Ads/Meta tags and apply the visitor's consent state. The current banner has separate analytics and advertising choices; implement Consent Mode v2 mapping in GTM after deciding the legal configuration. `NEXT_PUBLIC_GA4_ID`, Ads IDs and Meta Pixel ID are reserved config points; direct tags are intentionally disabled until configured and consent behavior has been reviewed.

## Attribution and reporting definitions

With analytics or advertising consent, the browser keeps first-touch, last non-direct and current session touchpoints in local storage/session storage, then sends them on lead submission. Direct visits do not replace the last non-direct touch. With neither consent, campaign and click identifiers are discarded server-side. First-touch, last non-direct and platform-attributed conversions answer different questions and are not interchangeable.

- Lead count: unique persisted `Lead.id` records.
- Qualified leads: leads marked `QUALIFIED` by an operator; rate denominator is persisted leads.
- Funnel conversion: count reaching a stage divided by the explicitly selected prior-stage cohort.
- Booked revenue: confirmed won order value (`bookedRevenue`), not a quote.
- Collected revenue: actual receipts (`collectedRevenue`) less recorded refunds.
- Gross profit: collected revenue less direct cost, using the business's agreed accounting definition.
- Ad spend: recorded `MarketingCost` by platform/campaign/period.
- CPL = ad spend / unique leads; cost per qualified lead = ad spend / qualified leads; CAC = acquisition spend / won customers; ROAS = attributed revenue / ad spend; ROI = (gross profit − ad spend) / ad spend.

If a denominator or direct cost is missing, report “insufficient data”; ROAS is not profit. No revenue dashboard is represented as live until actual orders, receipts, costs and ad spend have been entered.

## Facebook reference and launch facts

The supplied Facebook page could not be fetched in this environment, so its posts, phone, location, offers and reviews have not been used. The link itself is the supplied official URL. Before production, provide verified canonical domain, contact phone/Zalo, garage address/service area, privacy contact/retention policy, warranty terms and approved real project photos. Then configure the production database and tracking IDs. No customer reviews, business metrics or certifications have been invented.
