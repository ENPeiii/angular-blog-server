import { CreateTagDto, Tag, UpdateTagDto } from "../models/tag";

const tags: Tag[] = [
  { id: 1, name: "TypeScript", createdAt: new Date("2026-01-01") },
  { id: 2, name: "Node.js", createdAt: new Date("2026-01-01") },
];

let nextId = 3;

export class TagsService {
  getAll(): Tag[] {
    return tags;
  }

  getById(id: number): Tag | undefined {
    return tags.find((t) => t.id === id);
  }

  create(dto: CreateTagDto): Tag {
    const tag: Tag = {
      id: nextId++,
      name: dto.name,
      createdAt: new Date(),
    };
    tags.push(tag);
    return tag;
  }

  update(id: number, dto: UpdateTagDto): Tag | undefined {
    const tag = tags.find((t) => t.id === id);
    if (!tag) return undefined;
    tag.name = dto.name;
    return tag;
  }

  delete(id: number): boolean {
    const index = tags.findIndex((t) => t.id === id);
    if (index === -1) return false;
    tags.splice(index, 1);
    return true;
  }
}
