import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";
import * as path from "path";
import { prisma } from "../lib/prisma";

const bucketName = process.env.GCS_BUCKET_NAME!;

const credentials = process.env.GCS_CREDENTIALS_JSON
  ? JSON.parse(Buffer.from(process.env.GCS_CREDENTIALS_JSON, "base64").toString("utf8"))
  : undefined;

const storage = credentials
  ? new Storage({ projectId: process.env.GCS_PROJECT_ID, credentials })
  : new Storage({ projectId: process.env.GCS_PROJECT_ID });

export class UploadService {
  async uploadImage(file: Express.Multer.File): Promise<string> {
    const bucket = storage.bucket(bucketName);
    const ext = path.extname(file.originalname) || `.${file.mimetype.split("/")[1] ?? "png"}`;
    const gcsPath = `posts/${Date.now()}-${randomUUID()}${ext}`;
    const blob = bucket.file(gcsPath);

    await blob.save(file.buffer, { contentType: file.mimetype });

    const url = `https://storage.googleapis.com/${bucketName}/${gcsPath}`;

    await prisma.postImage.create({ data: { url, gcsPath } });

    return url;
  }

  async deleteImage(gcsPath: string): Promise<void> {
    await storage.bucket(bucketName).file(gcsPath).delete({ ignoreNotFound: true });
  }

  // 刪除超過 1 天且未關聯任何文章的孤兒圖片
  async cleanupOrphanImages(): Promise<number> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const orphans = await prisma.postImage.findMany({
      where: { postId: null, createdAt: { lt: cutoff } },
    });

    await Promise.allSettled(
      orphans.map((img) =>
        storage.bucket(bucketName).file(img.gcsPath).delete({ ignoreNotFound: true }),
      ),
    );

    await prisma.postImage.deleteMany({
      where: { id: { in: orphans.map((o) => o.id) } },
    });

    await prisma.cleanupLog.create({ data: { deletedCount: orphans.length } });

    return orphans.length;
  }

  async listCleanupLogs() {
    return prisma.cleanupLog.findMany({ orderBy: { ranAt: "desc" } });
  }

  // 刪除指定日期以前的孤兒圖片清理紀錄
  async deleteCleanupLogsBefore(before: Date): Promise<number> {
    const result = await prisma.cleanupLog.deleteMany({
      where: { ranAt: { lt: before } },
    });
    return result.count;
  }
}
