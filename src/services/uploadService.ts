import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";
import * as path from "path";

const bucketName = process.env.GCS_BUCKET_NAME!;

// 服務帳戶金鑰：本地開發用 GOOGLE_APPLICATION_CREDENTIALS 指向金鑰檔案路徑，
// 正式環境用 GCS_CREDENTIALS_JSON 直接帶入金鑰 JSON 內容（避免要掛載檔案）。
const credentials = process.env.GCS_CREDENTIALS_JSON
  ? JSON.parse(Buffer.from(process.env.GCS_CREDENTIALS_JSON, "base64").toString("utf8"))
  : undefined;

const storage = credentials
  ? new Storage({ projectId: process.env.GCS_PROJECT_ID, credentials })
  : new Storage({ projectId: process.env.GCS_PROJECT_ID });

export class UploadService {
  /**
   * 上傳圖片到 GCS bucket，回傳公開存取網址
   * 注意：bucket 需開啟「統一存取權限」並允許 allUsers 為 Storage Object Viewer
   */
  async uploadImage(file: Express.Multer.File): Promise<string> {
    const bucket = storage.bucket(bucketName);

    const ext = path.extname(file.originalname) || `.${file.mimetype.split("/")[1] ?? "png"}`;
    const filename = `posts/${Date.now()}-${randomUUID()}${ext}`;
    const blob = bucket.file(filename);

    await blob.save(file.buffer, {
      contentType: file.mimetype,
    });

    return `https://storage.googleapis.com/${bucketName}/${filename}`;
  }
}
