-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('published', 'draft');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'draft';
