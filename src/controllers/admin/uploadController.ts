import { Controller, Post, Get, Delete, Query, Route, Tags, UploadedFile, Response } from "tsoa";
import { UploadService } from "../../services/uploadService";
import { ApiResponse } from "../../models/response";

export interface UploadImageResult { url: string; }
export interface CleanupResult { deleted: number; }
export interface CleanupLogItem { id: string; deletedCount: number; ranAt: Date; }

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

@Route("admin/upload")
@Tags("Admin - Upload")
export class AdminUploadController extends Controller {
  private uploadService = new UploadService();

  /**
   * 上傳圖片到雲端儲存（GCS），回傳公開網址，供文章編輯器插入圖片使用
   */
  @Post("image")
  @Response<{ message: string }>(400, "Invalid file")
  public async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<ApiResponse<UploadImageResult>> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      this.setStatus(400);
      throw new Error("不支援的圖片格式，請上傳 JPEG / PNG / WebP / GIF");
    }
    if (file.size > MAX_FILE_SIZE) {
      this.setStatus(400);
      throw new Error("圖片檔案過大，請小於 5MB");
    }
    const url = await this.uploadService.uploadImage(file);
    return { data: { url } };
  }

  /**
   * 清除超過 1 天且未關聯任何文章的孤兒圖片（GCS + DB）
   */
  @Post("cleanup")
  public async cleanupOrphanImages(): Promise<ApiResponse<CleanupResult>> {
    const deleted = await this.uploadService.cleanupOrphanImages();
    return { data: { deleted } };
  }

  /**
   * 查詢孤兒圖片清理紀錄
   */
  @Get("cleanup-logs")
  public async getCleanupLogs(): Promise<ApiResponse<CleanupLogItem[]>> {
    const logs = await this.uploadService.listCleanupLogs();
    return { data: logs };
  }

  /**
   * 刪除指定日期以前的孤兒圖片清理紀錄
   */
  @Delete("cleanup-logs")
  public async deleteCleanupLogs(@Query() before: string): Promise<ApiResponse<CleanupResult>> {
    const deleted = await this.uploadService.deleteCleanupLogsBefore(new Date(before));
    return { data: { deleted } };
  }
}
