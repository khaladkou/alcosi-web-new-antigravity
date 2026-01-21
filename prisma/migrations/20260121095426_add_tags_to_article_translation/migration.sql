-- AlterTable
ALTER TABLE "article_translations" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
