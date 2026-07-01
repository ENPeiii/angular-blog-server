import { Prisma } from "@prisma/client";
import { toSlug } from "../lib/slug";
import { CreateTagDto, Tag, UpdateTagDto } from "../models/tag";
import { prisma } from "../lib/prisma";

export class TagsService {
  async getAll(
    page: number,
    pageSize: number,
    search?: string,
    onlyPublished = false,
  ): Promise<{ data: Tag[]; total: number }> {
    const publishedFilter = onlyPublished
      ? { status: 'published' as const }
      : undefined;

    const where = {
      ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
      ...(publishedFilter ? { posts: { some: publishedFilter } } : {}),
    };

    const postCountWhere = onlyPublished ? { where: { status: 'published' as const } } : true;

    const [rawData, total] = await prisma.$transaction([
      prisma.tag.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { posts: postCountWhere } } },
      }),
      prisma.tag.count({ where }),
    ]);

    const data: Tag[] = rawData.map(({ _count, ...tag }) => ({
      ...tag,
      postCount: _count.posts,
    }));

    return { data, total };
  }

  async getById(id: string): Promise<Tag | undefined> {
    const raw = await prisma.tag.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    });
    if (!raw) return undefined;
    const { _count, ...tag } = raw;
    return { ...tag, postCount: _count.posts };
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    try {
      const raw = await prisma.tag.create({
        data: { id: toSlug(dto.name), name: dto.name },
        include: { _count: { select: { posts: true } } },
      });
      const { _count, ...tag } = raw;
      return { ...tag, postCount: _count.posts };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new Error('標籤名稱已存在');
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateTagDto): Promise<Tag | undefined> {
    try {
      const raw = await prisma.tag.update({
        where: { id },
        data: dto,
        include: { _count: { select: { posts: true } } },
      });
      const { _count, ...tag } = raw;
      return { ...tag, postCount: _count.posts };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') return undefined; // 找不到此標籤
        if (e.code === 'P2002') throw new Error('標籤名稱已存在');
      }
      return undefined;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.tag.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
