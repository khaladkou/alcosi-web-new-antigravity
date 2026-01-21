# Production Deployment Guide

This guide ensures a smooth migration of the Alcosi Web application to a production environment (e.g., Vercel, Railway, or VPS).

## 1. Environment Variables

Strictly configure the following variables in your production environment settings.

| Variable | Description | Example (Production) | Critical Notes |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Connection string for your production PostgreSQL database. | `postgresql://user:pass@host:5432/db` | Must be pooling-enabled if using Serverless (e.g., Neon/Supabase). |
| `NEXT_PUBLIC_BASE_URL` | The public user-facing URL of your site. | `https://alcosi.com` | **CRITICAL**: Used for `sitemap.xml`, Canonical Tags, and Hreflang. **Do not use localhost**. |
| `NEXT_PUBLIC_SITE_URL` | (Optional) Sometimes used by Auth/Next.js. | `https://alcosi.com` | Keep consistent with `BASE_URL`. |
| `WEBHOOK_SECRET` | Secret for revalidating ISR cache via webhooks. | `your-secure-secret` | If not set, content updates won't reflect instantly. |

### ⚠️ IMPORTANT: URL Configuration
*   **Public Site (`sitemap.xml`, `<head>` tags)**: Relies on `NEXT_PUBLIC_BASE_URL`. If you set this to `localhost` in production, Google will index your site incorrectly.
*   **Admin Tools (SEO Audit)**: Automatically detect the current host (e.g., `admin.alcosi.com` or `preview-123.vercel.app`), so they work correctly on staging URLs without config changes.

## 2. SEO & Localization Strategy

The application uses a **Strict Canonical Strategy**. 

*   **Behavior**: Regardless of how a user accesses a page (e.g., via a proxy mirror, HTTP vs HTTPS), the application will always tell Google that the "True" version is what is defined in `NEXT_PUBLIC_BASE_URL`.
*   **Verification**: After deploying, go to `https://your-domain.com/sitemap.xml` and ensure all URLs start with `https://your-domain.com`.

## 3. SEO Audit Tool Migration

The Admin SEO Audit tool (`/admin/seo-audit`) is designed to be **Server-Agnostic**.

*   It uses `x-forwarded-host` headers to scan pages on the *same* server instance where the admin panel is running.
*   **Action Required**: None. It will "just work" on production.
*   **Troubleshooting**: If "Start Audit" fails on production, ensure your hosting provider passes standard headers (`Host` or `X-Forwarded-Host`). Vercel and most VPS setups do this by default.

## 4. Database Migration

Before deploying the code, ensure the production database schema is up to date.

```bash
# Run migrations on production DB
npx prisma migrate deploy

# (Optional) Seed initial data if fresh install
npx prisma db seed
```

*Note: Do NOT run `migrate dev` in production.*

## 5. Security Checklist

- [ ] **Cookie Secure Flag**: Next.js automatically sets cookies to `Secure` in production (HTTPS). Ensure your domain has SSL active.
- [ ] **Admin Access**: Currently, admin access relies on the `admin_token` cookie. Ensure your production environment has a strategy to set this (or migrate to NextAuth/Auth.js if not already done).
