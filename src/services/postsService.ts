import { CreatePostDto, Post, UpdatePostDto } from "../models/post";
import { prisma } from "../lib/prisma";

export class PostsService {
  async getAll(): Promise<Post[]> {
    return prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: string): Promise<Post | undefined> {
    const post = await prisma.post.findUnique({
      where: { id },
    });
    return post ?? undefined;
  }

  async create(dto: CreatePostDto): Promise<Post> {
    return prisma.post.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post | undefined> {
    try {
      return await prisma.post.update({
        where: { id },
        data: dto,
      });
    } catch {
      // Prisma 找不到 id 時會 throw P2025 錯誤，這裡統一回傳 undefined
      return undefined;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.post.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}
