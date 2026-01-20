-- CreateTable
CREATE TABLE "webhook_logs" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" INTEGER NOT NULL,
    "response" JSONB,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);
