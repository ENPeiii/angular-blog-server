import { randomUUID } from "crypto";
import { CreateTagDto, Tag, UpdateTagDto } from "../models/tag";

const tags: Tag[] = [
  { id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", name: "TypeScript", createdAt: new Date("2026-01-01") },
  { id: "c3d4e5f6-a7b8-9012-cdef-123456789012", name: "Node.js", createdAt: new Date("2026-01-01") },
];

export class TagsService {
  getAll(): Tag[] {
    return tags;
  }

  getById(id: string): Tag | undefined {
    return tags.find((t) => t.id === id);
  }

  create(dto: CreateTagDto): Tag {
    const tag: Tag = {
      id: randomUUID(),
      name: dto.name,
      createdAt: new Date(),
    };
    tags.push(tag);
    return tag;
  }

  update(id: string, dto: UpdateTagDto): Tag | undefined {
    const tag = tags.find((t) => t.id === id);
    if (!tag) return undefined;
    tag.name = dto.name;
    return tag;
  }

  delete(id: string): boolean {
    const index = tags.findIndex((t) => t.id === id);
    if (index === -1) return false;
    tags.splice(index, 1);
    return true;
  }
}
