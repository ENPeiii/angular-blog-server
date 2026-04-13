# 新增一個 API 資源的步驟

以新增 `Comment` 為例，說明每次新增資源的固定流程。

---

## 步驟總覽

```
1. 在 prisma/schema.prisma 新增 model
2. 執行 Prisma migration（建立資料表）
3. 建 src/models/xxx.ts
4. 建 src/services/xxxService.ts
5. 建 src/controllers/public/xxxController.ts   ← 前台（只讀）
6. 建 src/controllers/admin/xxxController.ts    ← 後台（完整 CRUD）
7. 執行 npm run tsoa
```

---

## Step 1 — 在 Prisma Schema 新增 model

`prisma/schema.prisma`

```prisma
model Comment {
  id        String   @id @default(uuid())
  content   String
  author    String
  postId    String           // 關聯到 Post（如果有的話）
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**常用 Prisma 欄位標記：**

| 標記 | 說明 |
|------|------|
| `@id` | 主鍵 |
| `@default(uuid())` | 自動產生 UUID |
| `@default(now())` | 自動設定為現在時間 |
| `@updatedAt` | 每次更新自動更新時間 |
| `@unique` | 唯一值（不能重複） |
| `?` 結尾（如 `String?`） | 選填欄位（nullable） |

---

## Step 2 — 執行 Prisma Migration

```bash
npx prisma migrate dev --name "add_comment"
npx prisma generate
```

`migrate dev` 做了三件事：
1. 讀取 `schema.prisma` 的變更
2. 產生 SQL 存進 `prisma/migrations/`
3. 執行 SQL，在資料庫裡建立資料表

---

## Step 3 — 建立 Model（TypeScript interface）

`src/models/comment.ts`

```typescript
/** 後台完整物件（從資料庫讀出來的） */
export interface Comment {
  id: string;
  content: string;
  author: string;
  postId: string;
  createdAt: Date;
  updatedAt: Date;
}

/** 前台公開物件（只暴露前台需要的欄位） */
export interface PublicComment {
  id: string;
  content: string;
  author: string;
  postId: string;
  createdAt: Date;
}

/** 新增時前端要送的欄位（id 和時間戳由後端自動產生） */
export interface CreateCommentDto {
  content: string;
  author: string;
  postId: string;
}

/** 更新時前端要送的欄位（選填） */
export interface UpdateCommentDto {
  content?: string;
  author?: string;
}
```

**為什麼需要 `PublicComment`？**

前後台看到的資料不一定一樣。`Comment` 是後台完整版（含 `updatedAt`），
`PublicComment` 是前台精簡版，只回傳前台真正需要的欄位。

---

## Step 4 — 建立 Service（Prisma 版）

`src/services/commentsService.ts`

```typescript
import { prisma } from "../lib/prisma";
import { Comment, CreateCommentDto, UpdateCommentDto } from "../models/comment";

export class CommentsService {
  async getAll(): Promise<Comment[]> {
    return prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: string): Promise<Comment | undefined> {
    const comment = await prisma.comment.findUnique({ where: { id } });
    return comment ?? undefined;
  }

  async create(dto: CreateCommentDto): Promise<Comment> {
    return prisma.comment.create({ data: dto });
  }

  async update(id: string, dto: UpdateCommentDto): Promise<Comment | undefined> {
    try {
      return await prisma.comment.update({ where: { id }, data: dto });
    } catch {
      return undefined; // Prisma P2025：id 不存在時 throw，統一回傳 undefined
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.comment.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
```

---

## Step 5 — 建立前台 Controller（只讀）

`src/controllers/public/commentsController.ts`

```typescript
import { Controller, Get, Path, Route, Tags, Response } from "tsoa";
import { PublicComment } from "../../models/comment";
import { CommentsService } from "../../services/commentsService";
import { ApiResponse } from "../../models/response";

@Route("api/public/comments")
@Tags("Public - Comments")
export class PublicCommentsController extends Controller {
  private commentsService = new CommentsService();

  @Get("/")
  public async getComments(): Promise<ApiResponse<PublicComment[]>> {
    const comments = await this.commentsService.getAll();
    // 解構賦值過濾掉不給前台的欄位（這裡去掉 updatedAt）
    return { data: comments.map(({ updatedAt, ...comment }) => comment) };
  }

  @Get("{id}")
  @Response<{ message: string }>(404, "Comment not found")
  public async getComment(@Path() id: string): Promise<ApiResponse<PublicComment>> {
    const comment = await this.commentsService.getById(id);
    if (!comment) {
      this.setStatus(404);
      throw new Error("Comment not found");
    }
    const { updatedAt, ...publicComment } = comment;
    return { data: publicComment };
  }
}
```

**重點：**
- return type 宣告為 `PublicComment`（不是 `Comment`）→ Swagger 文件只顯示前台看到的欄位
- 用解構賦值過濾欄位，Service 完全不用改
- 所有 Service 呼叫都要加 `await`（DB 操作是非同步的）
- 回傳格式用 `ApiResponse<T>` 統一包一層 `{ data: ... }`

---

## Step 6 — 建立後台 Controller（完整 CRUD）

`src/controllers/admin/commentsController.ts`

```typescript
import {
  Body, Controller, Delete, Get, Path,
  Post, Put, Route, SuccessResponse, Tags, Response,
} from "tsoa";
import { Comment, CreateCommentDto, UpdateCommentDto } from "../../models/comment";
import { CommentsService } from "../../services/commentsService";
import { ApiResponse } from "../../models/response";

@Route("api/admin/comments")
@Tags("Admin - Comments")
export class AdminCommentsController extends Controller {
  private commentsService = new CommentsService();

  @Get("/")
  public async getComments(): Promise<ApiResponse<Comment[]>> {
    return { data: await this.commentsService.getAll() };
  }

  @Get("{id}")
  @Response<{ message: string }>(404, "Comment not found")
  public async getComment(@Path() id: string): Promise<ApiResponse<Comment>> {
    const comment = await this.commentsService.getById(id);
    if (!comment) {
      this.setStatus(404);
      throw new Error("Comment not found");
    }
    return { data: comment };
  }

  @Post("/")
  @SuccessResponse(201, "Created")
  public async createComment(@Body() body: CreateCommentDto): Promise<ApiResponse<Comment>> {
    this.setStatus(201);
    return { data: await this.commentsService.create(body) };
  }

  @Put("{id}")
  @Response<{ message: string }>(404, "Comment not found")
  public async updateComment(
    @Path() id: string,
    @Body() body: UpdateCommentDto
  ): Promise<ApiResponse<Comment>> {
    const comment = await this.commentsService.update(id, body);
    if (!comment) {
      this.setStatus(404);
      throw new Error("Comment not found");
    }
    return { data: comment };
  }

  @Delete("{id}")
  @SuccessResponse(204, "Deleted")
  @Response<{ message: string }>(404, "Comment not found")
  public async deleteComment(@Path() id: string): Promise<void> {
    const success = await this.commentsService.delete(id);
    if (!success) {
      this.setStatus(404);
      throw new Error("Comment not found");
    }
    this.setStatus(204);
  }
}
```

---

## Step 7 — 重新產生路由和文件

```bash
npm run tsoa
```

這個指令會更新：
- `src/routes.ts` — 把新的 Controller 加進 Express 路由
- `public/swagger.json` — 把新的 API 加進 Swagger / ReDoc 文件

**不需要動 `app.ts` 或 `server.ts`。**
- 後台保護已經用 `app.use("/api/admin", authMiddleware)` 統一處理，新增的 admin controller 自動受保護
- Tsoa 會自動掃描 `src/controllers/**/*.ts`

---

## 命名規則快速參考

| 資源 | 前台路徑 | 後台路徑 | Class 名稱 |
|------|---------|---------|-----------|
| Post | `api/public/posts` | `api/admin/posts` | `PublicPostsController` / `AdminPostsController` |
| Tag | `api/public/tags` | `api/admin/tags` | `PublicTagsController` / `AdminTagsController` |
| Banner | `api/public/banner` | `api/admin/banner` | `PublicBannerController` / `AdminBannerController` |
| Comment | `api/public/comments` | `api/admin/comments` | `PublicCommentsController` / `AdminCommentsController` |

規則：
- Controller Class：`Public資源名稱Controller` / `Admin資源名稱Controller`
- Service Class：`資源名稱Service`（前後台共用同一個 Service）
- 檔案位置：`controllers/public/` 和 `controllers/admin/`
