/*
  Warnings:

  - Changed the type of `type` on the `Banner` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `categories` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CategoriesType" AS ENUM ('tech', 'life');

-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('img', 'imgText');

-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "type",
ADD COLUMN     "type" "BannerType" NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "topicId" TEXT,
DROP COLUMN "categories",
ADD COLUMN     "categories" "CategoriesType" NOT NULL;

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
