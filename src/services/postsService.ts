import { CreatePostDto, Post, UpdatePostDto } from "../models/post";

const posts: Post[] = [
  {
    id: 1,
    title: "First Post",
    content: "Hello World!",
    author: "Admin",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
];

let nextId = 2;

export class PostsService {
  getAll(): Post[] {
    return posts;
  }

  getById(id: number): Post | undefined {
    return posts.find((p) => p.id === id);
  }

  create(dto: CreatePostDto): Post {
    const now = new Date();
    const post: Post = {
      id: nextId++,
      ...dto,
      createdAt: now,
      updatedAt: now,
    };
    posts.push(post);
    return post;
  }

  update(id: number, dto: UpdatePostDto): Post | undefined {
    const post = posts.find((p) => p.id === id);
    if (!post) return undefined;

    if (dto.title !== undefined) post.title = dto.title;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.author !== undefined) post.author = dto.author;
    post.updatedAt = new Date();

    return post;
  }

  delete(id: number): boolean {
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) return false;
    posts.splice(index, 1);
    return true;
  }
}
