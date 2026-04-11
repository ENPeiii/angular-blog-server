export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostDto {
  title: string;
  content: string;
  author: string;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  author?: string;
}
