# VPS deployment reference

Use this runbook when the owner asks to deploy this project again.

## Production host

- SSH: `dutran@136.85.106.0`, port `22` (use the configured SSH key; do not store passwords or private keys here).
- App checkout: `/home/dutran/quocduong-auto`.
- Runtime: Node.js 22 at `/opt/node22/bin/node`.
- systemd unit: `quocduong-auto.service`.
- Production environment file: `/etc/quocduong-auto.env` (secrets; never copy it to a build artifact or print its contents).
- Service listens on `127.0.0.1:3000`; Caddy serves `https://quocduong-auto.com` and redirects `www`.
- PostgreSQL runs as `postgresql@17-main`.
- Persistent local uploads live at `/var/lib/quocduong-auto/uploads` and are served by Caddy. Keep this directory intact; do not replace it from the local `public/uploads` folder.
- Keep the previous `.next/standalone` directory as a rollback copy when switching releases.

## Deploy procedure

1. Build or prepare the current workspace source. Exclude `.env*`, `.git`, `.next`, `node_modules`, `.venv-logo`, and `public/uploads` from transfer.
2. Stage source in a new directory under `/home/dutran`; hard-link the existing app's `node_modules` into the stage so Next standalone tracing includes dependencies.
3. Run `npm run build` from the stage using systemd with `EnvironmentFile=/etc/quocduong-auto.env`. This keeps production `NEXT_PUBLIC_*` settings in the build and secrets on the VPS.
4. Copy the staged `public` assets and `.next/static` into `.next/standalone`. Do not copy local uploads.
5. Stop `quocduong-auto.service`, move the live standalone directory to a dated rollback path, move the new standalone into place, then start the service.
6. Confirm the service is active and check `/`, `/goi-do`, `/kien-thuc`, and `/sitemap.xml` over HTTPS. If startup or HTTP checks fail, restore the rollback directory and restart the service.

Do not run database schema changes as part of a routine UI deployment. Review the Prisma schema and migration needs separately when it changes.
