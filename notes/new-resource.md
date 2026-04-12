# 新增一個 API 資源的步驟

以新增 `Tag` 為例，說明每次新增資源的固定流程。

---

## 步驟總覽

```
1. 建 src/models/xxx.ts
2. 建 src/services/xxxService.ts
3. 建 src/controllers/public/xxxController.ts   ← 前台（只讀）
4. 建 src/controllers/admin/xxxController.ts    ← 後台（完整 CRUD）
5. 執行 npm run tsoa
```

---

## Step 1 — 建立 Model

`src/models/tag.ts`

```typescript
// 完整的物件（從記憶體/資料庫讀出來的樣子）
// 後台 controller 回傳這個
export interface Tag {
  id: string;   // UUID，用 crypto.randomUUID() 產生
  name: string;
  createdAt: Date;
}

// 前台回傳用：只暴露前台需要的欄位，去掉不必要或敏感的欄位
export interface PublicTag {
  id: string;
  name: string;
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

**為什麼需要 `PublicTag`？**

前後台看到的資料不一定一樣。`Tag` 是後台完整版（含 `createdAt`），
`PublicTag` 是前台精簡版，只回傳前台真正需要的欄位。
之後如果 `Tag` 加了 `internalNote` 之類的欄位，前台也不會意外拿到。

---

## Step 2 — 建立 Service

`src/services/tagsService.ts`

```typescript
import { randomUUID } from "crypto";
import { CreateTagDto, Tag, UpdateTagDto } from "../models/tag";

const tags: Tag[] = [];  // 暫時用記憶體存，之後換成 Prisma

export class TagsService {
  getAll(): Tag[] {
    return tags;
  }

  getById(id: string): Tag | undefined {
    return tags.find((t) => t.id === id);
  }

  create(dto: CreateTagDto): Tag {
    const tag: Tag = { id: randomUUID(), ...dto, createdAt: new Date() };
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
```

---

## Step 3 — 建立前台 Controller（只讀）

`src/controllers/public/tagsController.ts`

```typescript
import { Controller, Get, Path, Route, Tags, Response } from "tsoa";
import { PublicTag } from "../../models/tag";   // ← 用 PublicTag，不是 Tag
import { TagsService } from "../../services/tagsService";

@Route("api/public/tags")   // ← 前台路徑
@Tags("Public - Tags")      // ← Swagger 分組
export class PublicTagsController extends Controller {
  private tagsService = new TagsService();

  @Get("/")
  public async getTags(): Promise<PublicTag[]> {
    // 解構賦值過濾掉不給前台的欄位（這裡去掉 createdAt）
    return this.tagsService.getAll().map(({ createdAt, ...tag }) => tag);
  }

  @Get("{id}")
  @Response<{ message: string }>(404, "Tag not found")
  public async getTag(@Path() id: string): Promise<PublicTag> {
    const tag = this.tagsService.getById(id);
    if (!tag) {
      this.setStatus(404);
      throw new Error("Tag not found");
    }
    const { createdAt, ...publicTag } = tag;
    return publicTag;
  }
}
```

**重點：**
- return type 宣告為 `PublicTag`（不是 `Tag`）→ Swagger 文件只顯示前台能看到的欄位
- 用解構賦值 `const { createdAt, ...publicTag } = tag` 過濾欄位
- Service 完全不用改，轉換只發生在 Controller 層

---

## Step 4 — 建立後台 Controller（完整 CRUD）

`src/controllers/admin/tagsController.ts`

```typescript
import {
  Body, Controller, Delete, Get, Path,
  Post, Put, Route, SuccessResponse, Tags, Response,
} from "tsoa";
import { CreateTagDto, Tag, UpdateTagDto } from "../../models/tag";
import { TagsService } from "../../services/tagsService";

@Route("api/admin/tags")   // ← 後台路徑（會被 authMiddleware 保護）
@Tags("Admin - Tags")      // ← Swagger 分組
export class AdminTagsController extends Controller {
  private tagsService = new TagsService();

  @Get("/")
  public async getTags(): Promise<Tag[]> {
    return this.tagsService.getAll();
  }

  @Get("{id}")
  @Response<{ message: string }>(404, "Tag not found")
  public async getTag(@Path() id: string): Promise<Tag> {
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
    @Path() id: string,
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
  public async deleteTag(@Path() id: string): Promise<void> {
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

## Step 5 — 重新產生路由和文件

```bash
npm run tsoa
```

這個指令會更新：
- `src/routes.ts` — 把新的 Controller 加進 Express 路由
- `public/swagger.json` — 把新的 API 加進 Swagger / ReDoc 文件

**不需要動 `app.ts` 或 `server.ts`。**
- 後台保護已經用 `app.use("/api/admin", authMiddleware)` 統一處理，新增的 admin controller 自動受保護
- Tsoa 會自動掃描 `src/controllers/**/*.ts`（包含子資料夾）

---

## 命名規則快速參考

| 資源 | 前台路徑 | 後台路徑 | Class 名稱 |
|------|---------|---------|-----------|
| Post | `api/public/posts` | `api/admin/posts` | `PublicPostsController` / `AdminPostsController` |
| Tag | `api/public/tags` | `api/admin/tags` | `PublicTagsController` / `AdminTagsController` |
| Comment | `api/public/comments` | `api/admin/comments` | `PublicCommentsController` / `AdminCommentsController` |
| User | — | `api/admin/users` | `AdminUsersController` |

規則：
- Controller Class：`Public資源名稱Controller` / `Admin資源名稱Controller`
- Service Class：`資源名稱Service`（前後台共用同一個 Service）
- 檔案位置：`controllers/public/` 和 `controllers/admin/`
