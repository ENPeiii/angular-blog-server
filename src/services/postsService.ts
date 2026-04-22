import { toSlug } from "../lib/slug";
import { CreatePostDto, Post, UpdatePostDto } from "../models/post";
import { prisma } from "../lib/prisma";

const includeTags = {
  include: {
    tags: {
      select: { id: true, name: true },
    },
  },
} as const;

export class PostsService {
  async getAll(): Promise<Post[]> {
    return prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      ...includeTags,
    });
  }

  async getById(id: string): Promise<Post | undefined> {
    const post = await prisma.post.findUnique({
      where: { id },
      ...includeTags,
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
      ...includeTags,
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
        ...includeTags,
      });
    } catch {
      return undefined;
    }
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
