# Alcosi Web (New Agentic)

This is a Next.js 15+ project using the App Router, Prisma (PostgreSQL), and Tailwind CSS.
Designed for high-performance, SEO-optimized corporate web presence with a custom Admin Panel.

## 🚀 Quick Start (Zero to Hero)

Follow these steps to set up the project locally from scratch.

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose** (for the database)

### 2. Setup Environment
Copy the example environment file:
```bash
cp .env.example .env
```
*Note: The default `.env.example` is configured for the local Docker setup described below.*

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Database
This project includes a `docker-compose.yml` for a robust local PostgreSQL instance.
```bash
docker-compose up -d
```
*Wait a few seconds for the database to accept connections.*

### 5. Initialize Database & Seed Data
Run migrations to create tables and Seed script to populate initial content (CMS pages, Redirects, Portfolio).
```bash
# Apply migrations
npx prisma migrate dev

# Populate database with starter content
npx prisma db seed
```
*The seed script will populate:*
- *Admins & Users (handled via external auth or future implementation)*
- *Legacy Redirects (vital for SEO)*
- *Portfolio Projects*
- *Blog Articles*

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.
Access the Admin Panel at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 📂 Project Structure

- **`src/app`**: Next.js App Router pages and API routes.
- **`src/components`**: Reusable UI components (shadcn/ui, custom).
- **`src/lib`**: Utilities, DB client (`db.ts`), constants.
- **`prisma`**: Database schema (`schema.prisma`) and Seed scripts (`seed.ts`).
- **`public`**: Static assets.

## 🛠 Admin Panel Features
- **Dashboard**: Traffic statisics and event logs.
- **Redirects**: Manage 301/302 redirects for SEO preservation.
- **Articles**: Full CMS for multi-language blog posts.
- **Portfolio**: Manage projects and case studies.
- **Settings**: Configure Contact Form SMTP and Legal pages.

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub.
2. Import project in Vercel.
3. Configure Environment Variables (`DATABASE_URL`, `WEBHOOK_SECRET`, etc.).
   *Note: For Vercel, you need a cloud hosted PostgreSQL (e.g. Neon, Supabase, or Vercel Postgres).*

### Docker (Production)
Build the container using the included `Dockerfile`:
```bash
docker build -t alcosi-web .
docker run -p 3000:3000 --env-file .env alcosi-web
```
