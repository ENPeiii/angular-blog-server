import { toSlug } from "../lib/slug";
import { CreateTopicDto, Topic, UpdateTopicDto } from "../models/topic";
import { prisma } from "../lib/prisma";

export class TopicsService {
  async getAll(page: number, pageSize: number): Promise<{ data: Topic[]; total: number }> {
    const [data, total] = await prisma.$transaction([
      prisma.topic.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.topic.count(),
    ]);
    return { data, total };
  }

  async getById(id: string): Promise<Topic | undefined> {
    const topic = await prisma.topic.findUnique({ where: { id } });
    return topic ?? undefined;
  }

  async create(dto: CreateTopicDto): Promise<Topic> {
    return prisma.topic.create({
      data: {
        id: toSlug(dto.name),
        ...dto,
      },
    });
  }

  async update(id: string, dto: UpdateTopicDto): Promise<Topic | undefined> {
    try {
      return await prisma.topic.update({ where: { id }, data: dto });
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
