# 新增一個 API 資源的步驟

以新增 `Tag` 為例，說明每次新增資源的固定流程。

---

## 步驟總覽

```
1. 建 src/models/xxx.ts
2. 建 src/services/xxxService.ts
3. 建 src/controllers/xxxController.ts
4. 執行 npm run tsoa
```

---

## Step 1 — 建立 Model

`src/models/tag.ts`

```typescript
// 完整的物件（從記憶體/資料庫讀出來的樣子）
export interface Tag {
  id: number;
  name: string;
  createdAt: Date;
}

// 新增時前端要送的欄位（不含 id、createdAt，這些由後端產生）
export interface CreateTagDto {
  name: string;
}

// 更新時前端要送的欄位（選填的話就加 ?）
export interface UpdateTagDto {
  name: string;
}
```

---

## Step 2 — 建立 Service

`src/services/tagsService.ts`

```typescript
import { CreateTagDto, Tag, UpdateTagDto } from "../models/tag";

const tags: Tag[] = [];  // 暫時用記憶體存，之後換成 Prisma
let nextId = 1;

export class TagsService {
  getAll(): Tag[] {
    return tags;
  }

  getById(id: number): Tag | undefined {
    return tags.find((t) => t.id === id);
  }

  create(dto: CreateTagDto): Tag {
    const tag: Tag = { id: nextId++, ...dto, createdAt: new Date() };
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
```

---

## Step 3 — 建立 Controller

`src/controllers/tagsController.ts`

```typescript
import {
  Body, Controller, Delete, Get, Path,
  Post, Put, Route, SuccessResponse, Tags, Response,
} from "tsoa";
import { CreateTagDto, Tag, UpdateTagDto } from "../models/tag";
import { TagsService } from "../services/tagsService";

@Route("tags")   // ← API 路徑前綴，改成你的資源名稱
@Tags("Tags")    // ← Swagger 分組名稱
export class TagsController extends Controller {
  private tagsService = new TagsService();

  @Get("/")
  public async getTags(): Promise<Tag[]> {
    return this.tagsService.getAll();
  }

  @Get("{id}")
  @Response<{ message: string }>(404, "Tag not found")
  public async getTag(@Path() id: number): Promise<Tag> {
    const tag = this.tagsService.getById(id);
    if (!tag) {
      this.setStatus(404);
      throw new Error("Tag not found");
    }
    return tag;
  }

  @Post("/")
  @SuccessResponse(201, "Created")
  public async createTag(@Body() body: CreateTagDto): Promise<Tag> {
    this.setStatus(201);
    return this.tagsService.create(body);
  }

  @Put("{id}")
  @Response<{ message: string }>(404, "Tag not found")
  public async updateTag(
    @Path() id: number,
    @Body() body: UpdateTagDto
  ): Promise<Tag> {
    const tag = this.tagsService.update(id, body);
    if (!tag) {
      this.setStatus(404);
      throw new Error("Tag not found");
    }
    return tag;
  }

  @Delete("{id}")
  @SuccessResponse(204, "Deleted")
  @Response<{ message: string }>(404, "Tag not found")
  public async deleteTag(@Path() id: number): Promise<void> {
    const success = this.tagsService.delete(id);
    if (!success) {
      this.setStatus(404);
      throw new Error("Tag not found");
    }
    this.setStatus(204);
  }
}
```

---

## Step 4 — 重新產生路由和文件

```bash
npm run tsoa
```

這個指令會更新：
- `src/routes.ts` — 把新的 Controller 加進 Express 路由
- `public/swagger.json` — 把新的 API 加進 Swagger / ReDoc 文件

**不需要動 `app.ts` 或 `server.ts`**，Tsoa 會自動掃描 `src/controllers/` 裡的所有 controller。

---

## 命名規則快速參考

| 資源名稱 | 路徑 | Class 名稱 |
|---------|------|-----------|
| Post | `/posts` | `PostsController` / `PostsService` |
| Tag | `/tags` | `TagsController` / `TagsService` |
| Comment | `/comments` | `CommentsController` / `CommentsService` |
| User | `/users` | `UsersController` / `UsersService` |

規則：**資源名稱複數 + Controller / Service**。
