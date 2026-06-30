import { About } from "../models/about";
import { prisma } from "../lib/prisma";

const SINGLETON_ID = "singleton";

export class AboutService {
  async get(): Promise<About> {
    return prisma.about.upsert({
      where: { id: SINGLETON_ID },
      create: { id: SINGLETON_ID, content: "" },
      update: {},
    });
  }

  async update(content: string): Promise<About> {
    return prisma.about.upsert({
      where: { id: SINGLETON_ID },
      create: { id: SINGLETON_ID, content },
      update: { content },
    });
  }
}
