import { toSlug } from "../lib/slug";
import {
  CreateTopicDto,
  SyncSectionItem,
  SyncSectionsDto,
  Topic,
  TopicNavSection,
  TopicSection,
  TopicWithSections,
  UpdateTopicDto,
} from "../models/topic";
import { prisma } from "../lib/prisma";

const includeCount = {
  include: { _count: { select: { posts: true } } },
} as const;

type RawTopic = {
  _count: { posts: number };
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toTopic(raw: RawTopic): Topic {
  const { _count, ...topic } = raw;
  return { ...topic, postCount: _count.posts };
}

export class TopicsService {
  async getAll(page: number, pageSize: number): Promise<{ data: Topic[]; total: number }> {
    const [rawData, total] = await prisma.$transaction([
      prisma.topic.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        ...includeCount,
      }),
      prisma.topic.count(),
    ]);
    return { data: rawData.map(toTopic), total };
  }

  async getById(id: string): Promise<Topic | undefined> {
    const raw = await prisma.topic.findUnique({ where: { id }, ...includeCount });
    return raw ? toTopic(raw) : undefined;
  }

  async getByIdWithSections(id: string): Promise<TopicWithSections | undefined> {
    const raw = await prisma.topic.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true } },
        sections: {
          orderBy: { order: "asc" },
          include: {
            posts: {
              orderBy: { topicOrder: "asc" },
              select: { id: true, title: true, topicOrder: true },
            },
          },
        },
      },
    });
    if (!raw) return undefined;
    const { _count, sections, ...topic } = raw;
    return {
      ...topic,
      postCount: _count.posts,
      sections: sections.map((s) => ({
        id: s.id,
        name: s.name,
        order: s.order,
        posts: s.posts.map((p) => ({ id: p.id, title: p.title, order: p.topicOrder ?? 0 })),
      })),
    };
  }

  async getTopicNav(id: string): Promise<TopicNavSection[] | undefined> {
    const topic = await prisma.topic.findUnique({ where: { id }, select: { id: true } });
    if (!topic) return undefined;

    const sections = await prisma.topicSection.findMany({
      where: { topicId: id },
      orderBy: { order: "asc" },
      include: {
        posts: {
          where: { status: "published" },
          orderBy: { topicOrder: "asc" },
          select: { id: true, title: true },
        },
      },
    });

    return sections.map((s) => ({
      id: s.id,
      name: s.name,
      items: s.posts.map((p) => ({ id: p.id, name: p.title })),
    }));
  }

  async syncSections(topicId: string, dto: SyncSectionsDto): Promise<void> {
    const { sections } = dto;

    await prisma.$transaction(async (tx) => {
      const existingIds = sections.filter((s) => s.id).map((s) => s.id!);

      // Delete sections not in the new list (cascade clears topicSectionId on posts via DB)
      await tx.topicSection.deleteMany({
        where: { topicId, id: { notIn: existingIds } },
      });

      // Clear topicId for posts in this topic that aren't mentioned in any section
      const allMentionedPostIds = sections.flatMap((s) => s.postIds);
      await tx.post.updateMany({
        where: { topicId, id: { notIn: allMentionedPostIds } },
        data: { topicId: null, topicSectionId: null, topicOrder: null },
      });

      // Create/update sections and assign posts
      for (const section of sections) {
        let sectionId: string;

        if (section.id) {
          await tx.topicSection.update({
            where: { id: section.id },
            data: { name: section.name, order: section.order },
          });
          sectionId = section.id;
        } else {
          const created = await tx.topicSection.create({
            data: { topicId, name: section.name, order: section.order },
          });
          sectionId = created.id;
        }

        // Assign posts to this section with order
        for (let i = 0; i < section.postIds.length; i++) {
          await tx.post.update({
            where: { id: section.postIds[i] },
            data: { topicId, topicSectionId: sectionId, topicOrder: i },
          });
        }
      }
    });
  }

  async create(dto: CreateTopicDto): Promise<Topic> {
    const raw = await prisma.topic.create({
      data: { id: toSlug(dto.name), ...dto },
      ...includeCount,
    });
    return toTopic(raw);
  }

  async update(id: string, dto: UpdateTopicDto): Promise<Topic | undefined> {
    try {
      const raw = await prisma.topic.update({ where: { id }, data: dto, ...includeCount });
      return toTopic(raw);
    } catch {
      return undefined;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.topic.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
