-- CreateTable
CREATE TABLE "CleanupLog" (
    "id" TEXT NOT NULL,
    "deletedCount" INTEGER NOT NULL,
    "ranAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CleanupLog_pkey" PRIMARY KEY ("id")
);
