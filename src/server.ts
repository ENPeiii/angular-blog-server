import "dotenv/config";
import { app } from "./app";
import cron from "node-cron";
import { UploadService } from "./services/uploadService";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger UI  →  http://localhost:${PORT}/swagger`);
  console.log(`ReDoc       →  http://localhost:${PORT}/redoc`);
});

// 每天凌晨 3 點清理孤兒圖片（postId = null 且超過 1 天）
cron.schedule("0 3 * * *", async () => {
  const uploadService = new UploadService();
  const deleted = await uploadService.cleanupOrphanImages();
  console.log(`[cron] 孤兒圖片清理完成，共刪除 ${deleted} 張`);
});
