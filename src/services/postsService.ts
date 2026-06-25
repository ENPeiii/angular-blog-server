import { Prisma } from "@prisma/client";
import { toSlug } from "../lib/slug";
import { CategoriesType, CreatePostDto, Post, PostLatestItem, PostListItem, UpdatePostDto } from "../models/post";
import { prisma } from "../lib/prisma";
import { UploadService } from "./uploadService";

const uploadService = new UploadService();

function extractGcsImageUrls(content: string): string[] {
  const regex = /https:\/\/storage\.googleapis\.com\/[^\s)"]+/g;
  return [...new Set(content.match(regex) ?? [])];
}

const includeRelations = {
  include: {
    tags: { select: { id: true, name: true } },
    topic: { select: { id: true, name: true, description: true } },
  },
} as const;

export class PostsService {
  async getAll(
    page: number,
    pageSize: number,
    tagId?: string,
  ): Promise<{ data: Post[]; total: number }> {
    const where = tagId ? { tags: { some: { id: tagId } } } : {};
    const [data, total] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        ...includeRelations,
      }),
      prisma.post.count({ where }),
    ]);
    return { data, total };
  }

  async getById(id: string): Promise<Post | undefined> {
    const post = await prisma.post.findUnique({
      where: { id },
      ...includeRelations,
    });
    return post ?? undefined;
  }

  async create(dto: CreatePostDto): Promise<Post> {
    const { tags: tagNames = [], ...postData } = dto;
    const tagConnects = await upsertTags(tagNames);

    try {
      const post = await prisma.post.create({
        data: {
          ...postData,
          tags: { connect: tagConnects },
        },
        ...includeRelations,
      });

      const urls = extractGcsImageUrls(dto.content);
      if (urls.length > 0) {
        await prisma.postImage.updateMany({
          where: { url: { in: urls } },
          data: { postId: post.id },
        });
      }

      return post;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new Error('topicId 不存在');
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post | undefined> {
    const { tags: tagNames, ...postData } = dto;

    const isStatusOnlyUpdate =
      Object.keys(postData).length === 1 &&
      postData.status !== undefined &&
      tagNames === undefined;

    try {
      const tagsOperation =
        tagNames !== undefined
          ? { set: await upsertTags(tagNames) }
          : undefined;

      let preservedUpdatedAt: Date | undefined;
      if (isStatusOnlyUpdate) {
        const current = await prisma.post.findUnique({ where: { id }, select: { updatedAt: true } });
        preservedUpdatedAt = current?.updatedAt;
      }

      const updated = await prisma.post.update({
        where: { id },
        data: {
          ...postData,
          ...(tagsOperation ? { tags: tagsOperation } : {}),
          ...(preservedUpdatedAt ? { updatedAt: preservedUpdatedAt } : {}),
        },
        ...includeRelations,
      });

      if (dto.content !== undefined) {
        const newUrls = extractGcsImageUrls(dto.content);
        // 新增的圖片關聯到此文章
        if (newUrls.length > 0) {
          await prisma.postImage.updateMany({
            where: { url: { in: newUrls } },
            data: { postId: id },
          });
        }
        // 從內容中移除的圖片變成孤兒，等待 cleanup
        await prisma.postImage.updateMany({
          where: { postId: id, url: { notIn: newUrls } },
          data: { postId: null },
        });
      }

      return updated;
    } catch {
      return undefined;
    }
  }

  async getList(
    page: number,
    pageSize: number,
    categories?: string,
    topicId?: string,
    tagId?: string,
  ): Promise<{ data: PostListItem[]; total: number }> {
    const validCategories = Object.values(CategoriesType);
    const where = {
      status: 'published' as const,
      ...(categories && validCategories.includes(categories as CategoriesType)
        ? { categories: categories as CategoriesType }
        : {}),
      ...(topicId ? { topicId } : {}),
      ...(tagId ? { tags: { some: { id: tagId } } } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          categories: true,
          topicId: true,
          createdAt: true,
          tags: { select: { id: true, name: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);
    return { data, total };
  }

  async getLatest(): Promise<PostLatestItem[]> {
    const posts = await prisma.post.findMany({
      where: { status: 'published' as const },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        categories: true,
        content: true,
        createdAt: true,
        tags: { select: { id: true, name: true } },
      },
    });
    return posts.map(post => ({
      ...post,
      content: post.content.slice(0, 100),
    }));
  }

  async delete(id: string): Promise<boolean> {
    try {
      const images = await prisma.postImage.findMany({ where: { postId: id } });
      await Promise.allSettled(images.map((img) => uploadService.deleteImage(img.gcsPath)));
      await prisma.postImage.deleteMany({ where: { postId: id } });
      await prisma.post.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

async function upsertTags(names: string[]): Promise<{ id: string }[]> {
  return Promise.all(
    names.map(async (name) => {
      // Look up by name (unique) so an existing tag with any ID is reused.
      // Fall back to slug as the new ID only when creating.
      const tag = await prisma.tag.upsert({
        where: { name },
        create: { id: toSlug(name), name },
        update: {},
        select: { id: true },
      });
      return { id: tag.id };
    })
  );
}
