import { randomUUID } from "crypto";
import { CreatePostDto, Post, UpdatePostDto } from "../models/post";

const posts: Post[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    title: "First Post",
    content: "Hello World!",
    author: "Admin",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
];

export class PostsService {
  getAll(): Post[] {
    return posts;
  }

  getById(id: string): Post | undefined {
    return posts.find((p) => p.id === id);
  }

  create(dto: CreatePostDto): Post {
    const now = new Date();
    const post: Post = {
      id: randomUUID(),
      ...dto,
      createdAt: now,
      updatedAt: now,
    };
    posts.push(post);
    return post;
  }

  update(id: string, dto: UpdatePostDto): Post | undefined {
    const post = posts.find((p) => p.id === id);
    if (!post) return undefined;

    if (dto.title !== undefined) post.title = dto.title;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.author !== undefined) post.author = dto.author;
    post.updatedAt = new Date();

    return post;
  }

  delete(id: string): boolean {
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) return false;
    posts.splice(index, 1);
    return true;
  }
}
