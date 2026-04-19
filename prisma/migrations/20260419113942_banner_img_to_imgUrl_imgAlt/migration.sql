-- 新增 imgUrl、imgAlt 欄位（先給 default 讓現有資料可以填入）
ALTER TABLE "Banner" ADD COLUMN "imgUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Banner" ADD COLUMN "imgAlt" TEXT NOT NULL DEFAULT '';

-- 將舊的 img 值複製到 imgUrl
UPDATE "Banner" SET "imgUrl" = "img";

-- 移除 default（之後新資料由程式端提供）
ALTER TABLE "Banner" ALTER COLUMN "imgUrl" DROP DEFAULT;
ALTER TABLE "Banner" ALTER COLUMN "imgAlt" DROP DEFAULT;

-- 刪除舊欄位
ALTER TABLE "Banner" DROP COLUMN "img";
