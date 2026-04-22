import { CategoriesType } from "@prisma/client";
import { toSlug } from "../lib/slug";
import { CreatePostDto, Post, PostLatestItem, PostListItem, UpdatePostDto } from "../models/post";
import { prisma } from "../lib/prisma";

const includeRelations = {
  include: {
    tags: { select: { id: true, name: true } },
    topic: { select: { id: true, name: true, description: true } },
  },
} as const;

export class PostsService {
  async getAll(): Promise<Post[]> {
    return prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      ...includeRelations,
    });
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

    return prisma.post.create({
      data: {
        ...postData,
        tags: { connect: tagConnects },
      },
      ...includeRelations,
    });
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post | undefined> {
    const { tags: tagNames, ...postData } = dto;

    try {
      const tagsOperation =
        tagNames !== undefined
          ? { set: await upsertTags(tagNames) }
          : undefined;

      return await prisma.post.update({
        where: { id },
        data: {
          ...postData,
          ...(tagsOperation ? { tags: tagsOperation } : {}),
        },
        ...includeRelations,
      });
    } catch {
      return undefined;
    }
  }

  async getList(categories?: string, topicId?: string): Promise<PostListItem[]> {
    const validCategories = Object.values(CategoriesType);
    const categoriesFilter =
      categories && validCategories.includes(categories as CategoriesType)
        ? { categories: categories as CategoriesType }
        : {};

    return prisma.post.findMany({
      where: {
        ...categoriesFilter,
        ...(topicId ? { topicId } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, categories: true, topicId: true, createdAt: true },
    });
  }

  async getLatest(): Promise<PostLatestItem[]> {
    const posts = await prisma.post.findMany({
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
      const id = toSlug(name);
      await prisma.tag.upsert({
        where: { id },
        create: { id, name },
        update: {},
      });
      return { id };
    })
  );
}
