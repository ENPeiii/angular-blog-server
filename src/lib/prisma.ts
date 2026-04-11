import { PrismaClient } from "@prisma/client";

// 全域只建立一個 PrismaClient 實例，避免開發時 hot-reload 造成連線數爆炸
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"], // 開發時在終端機印出每條 SQL
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
