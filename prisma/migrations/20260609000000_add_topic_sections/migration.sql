-- CreateTable
CREATE TABLE "TopicSection" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicSection_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "topicOrder" INTEGER,
ADD COLUMN     "topicSectionId" TEXT;

-- AddForeignKey
ALTER TABLE "TopicSection" ADD CONSTRAINT "TopicSection_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_topicSectionId_fkey" FOREIGN KEY ("topicSectionId") REFERENCES "TopicSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
