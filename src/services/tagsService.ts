import { CreateTagDto, Tag, UpdateTagDto } from "../models/tag";
import { prisma } from "../lib/prisma";

export class TagsService {
  async getAll(): Promise<Tag[]> {
    return prisma.tag.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: string): Promise<Tag | undefined> {
    const tag = await prisma.tag.findUnique({
      where: { id },
    });
    return tag ?? undefined;
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    return prisma.tag.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateTagDto): Promise<Tag | undefined> {
    try {
      return await prisma.tag.update({
        where: { id },
        data: dto,
      });
    } catch {
      return undefined;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.tag.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}
