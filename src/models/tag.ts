export interface Tag {
  id: number;
  name: string;
  createdAt: Date;
}

export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto {
  name: string;
}
