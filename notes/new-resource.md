# 開發日常：新增資源、欄位與常用指令

---

## 情境一：新增一個全新的資源（例如 Comment）

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
# ⚠️ 互動式指令，必須在你自己的終端機視窗執行
npx prisma migrate dev --name "add_comment"
```

`migrate dev` 做了三件事：
1. 讀取 `schema.prisma` 的變更
2. 產生 SQL 存進 `prisma/migrations/`（🤖 自動產生，不要手動改）
3. 執行 SQL，在資料庫裡建立資料表

**若資料表已有資料，新增 NOT NULL 欄位會失敗：**

Prisma 會報錯說現有資料沒有值可以填入。解法：在 schema 補 `@default` 或改為選填：

```prisma
// 方案 A：給預設值（現有資料自動填入，之後新資料由程式提供）
newColumn String @default("")

// 方案 B：改為選填（nullable，現有資料填 null）
newColumn String?
```

加了 `@default` 後再跑一次 `migrate dev` 就能正常執行。

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

@Route("public/comments")
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

@Route("admin/comments")
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
- 後台保護已經用 `apiRouter.use("/admin", authMiddleware)` 統一處理，新增的 admin controller 自動受保護
- Tsoa 會自動掃描 `src/controllers/**/*.ts`

---

## 命名規則快速參考

| 資源 | 前台路徑（@Route） | 後台路徑（@Route） | Class 名稱 |
|------|---------|---------|-----------|
| Post | `public/posts` | `admin/posts` | `PublicPostsController` / `AdminPostsController` |
| Tag | `public/tags` | `admin/tags` | `PublicTagsController` / `AdminTagsController` |
| Banner | `public/banner` | `admin/banner` | `PublicBannerController` / `AdminBannerController` |
| Comment | `public/comments` | `admin/comments` | `PublicCommentsController` / `AdminCommentsController` |

> `@Route()` 不需要加 `api/` 前綴，完整 URL 為 `/api/{路徑}`。
> `api` 前綴由 `app.ts` 的 `API_PREFIX` 統一管理。

規則：
- Controller Class：`Public資源名稱Controller` / `Admin資源名稱Controller`
- Service Class：`資源名稱Service`（前後台共用同一個 Service）
- 檔案位置：`controllers/public/` 和 `controllers/admin/`

---

## 情境二：替現有資源新增欄位

以替 `Post` 新增 `slug` 欄位為例。

### 步驟總覽

```
1. 修改 prisma/schema.prisma
2. 執行 Prisma migration
3. 更新 src/models/xxx.ts
4. 更新 src/controllers（如果前台/後台要回傳這個欄位）
5. 執行 npm run tsoa
```

---

### Step 1 — 修改 schema.prisma

```prisma
model Post {
  id        String   @id @default(uuid())
  title     String
  content   String
  author    String
  slug      String   @unique   // ← 新增這行
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**選填欄位（不強迫現有資料填值）：**

如果資料表裡已經有資料，新增必填欄位會讓 migration 失敗（現有資料沒有值可以填）。
這時要加 `?` 設為 nullable，或提供 `@default(...)` 預設值：

```prisma
slug  String?           // nullable，現有資料自動填 null
slug  String @default("") // 有預設值，現有資料自動填空字串
```

---

### Step 2 — 執行 Migration

```bash
# ⚠️ 互動式指令，必須在你自己的終端機視窗執行
npx prisma migrate dev --name "add_slug_to_post"
```

Prisma 會自動產生對應的 SQL 並套用到資料庫（🤖 自動產生，不要手動改）：

```sql
-- prisma/migrations/xxxxxxxx_add_slug_to_post/migration.sql
ALTER TABLE "Post" ADD COLUMN "slug" TEXT NOT NULL;
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
```

---

### Step 3 — 更新 TypeScript Model

`src/models/post.ts`

```typescript
export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  slug: string;       // ← 新增
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostDto {
  title: string;
  content: string;
  author: string;
  slug: string;       // ← 新增（新增文章時前端要送）
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  author?: string;
  slug?: string;      // ← 新增（選填）
}
```

`PublicPost` 視需要決定要不要也加上去（前台需要顯示就加）。

---

### Step 4 — 更新 Controller（如果前台要回傳這個欄位）

前台 Controller 用解構賦值過濾欄位，只需要確認 `PublicPost` 的 interface 有沒有包含新欄位，不用改 Service。

---

### Step 5 — 重新產生路由和文件

```bash
npm run tsoa
```

更新 `routes.ts` 和 `swagger.json`，讓 Swagger 文件反映新的欄位。

---

### 新增欄位 vs 新增資源 差異比較

| | 新增欄位 | 新增資源 |
|---|---|---|
| schema.prisma | 改既有 model | 新增 model |
| migration | 產生 ALTER TABLE | 產生 CREATE TABLE |
| models/ | 改既有 interface | 新增 .ts 檔案 |
| services/ | 通常不用動 | 新增 .ts 檔案 |
| controllers/ | 視需要微調 | 新增兩個 .ts 檔案 |
| npm run tsoa | 要跑 | 要跑 |

---

## 常用 Prisma 指令

| 指令 | 說明 | 什麼時候用 |
|------|------|-----------|
| `npx prisma migrate dev --name "描述"` | 產生並套用 migration（自動執行 generate） | 改了 `schema.prisma` 之後 |
| `npx prisma generate` | 重新產生 TypeScript 型別 | 通常不需手動，migrate 後自動執行 |
| `npx prisma migrate deploy` | 只套用既有 migration，不新增 | production 環境部署時 |
| `npx prisma studio` | 開啟瀏覽器視覺化資料庫介面 | 想直接查看或修改資料時 |
| `npx prisma db push` | 直接同步 schema 到 DB（不產生 migration） | 快速實驗，正式環境不推薦 |

---

## 查看資料庫內容

**Prisma Studio（推薦）**

```bash
npx prisma studio
```

在瀏覽器開啟視覺化介面，可以直接查看和修改資料，不需要寫 SQL。
跑起來後終端機會顯示實際的 port（例如 `http://localhost:51212`），用那個網址開啟即可。

**DBeaver**

用 GUI 工具連線：Host `localhost`、Port `5432`、Database `angular_blog_db`、Username `enpei`。

**psql（命令列）**

```bash
docker exec angular_blog_postgres psql -U enpei -d angular_blog_db
```

常用 SQL（PostgreSQL 資料表名稱有大小寫，查詢時要加引號）：

```sql
SELECT * FROM "Post";
SELECT * FROM "Tag";
SELECT * FROM "Banner";
\dt   -- 列出所有資料表
\q    -- 離開
```
