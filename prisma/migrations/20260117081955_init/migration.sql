-- CreateEnum
CREATE TYPE "Language" AS ENUM ('en', 'pl', 'es', 'de', 'pt', 'ru');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateTable
CREATE TABLE "articles" (
    "id" SERIAL NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_translations" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "locale" "Language" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content_html" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "og_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "url_aliases" (
    "id" SERIAL NOT NULL,
    "from_path" TEXT NOT NULL,
    "to_path" TEXT NOT NULL,
    "http_code" INTEGER NOT NULL DEFAULT 301,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "url_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "article_translations_locale_slug_key" ON "article_translations"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "article_translations_article_id_locale_key" ON "article_translations"("article_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "url_aliases_from_path_key" ON "url_aliases"("from_path");

-- AddForeignKey
ALTER TABLE "article_translations" ADD CONSTRAINT "article_translations_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
