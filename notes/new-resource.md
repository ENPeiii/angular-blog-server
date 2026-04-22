# 開發日常：Schema、欄位、資源與關聯操作指南

---

## 目錄

**欄位層級**
- [新增欄位](#新增欄位)
- [刪除欄位](#刪除欄位)
- [重新命名欄位](#重新命名欄位)
- [修改欄位型別（String → Enum）](#修改欄位型別string--enum)

**資源層級**
- [新增全新資源（Model + API）](#新增全新資源model--api)
- [刪除整個資源](#刪除整個資源)

**關聯層級**
- [新增多對多關聯](#新增多對多關聯)
- [新增一對多關聯](#新增一對多關聯)

**型別層級**
- [新增 Prisma Enum](#新增-prisma-enum)

**參考**
- [命名規則快速參考](#命名規則快速參考)
- [常用 Prisma 指令](#常用-prisma-指令)
- [查看資料庫內容](#查看資料庫內容)

---

## 新增欄位

以替 `Post` 新增 `slug` 欄位為例。

**步驟：**

```
1. 修改 prisma/schema.prisma
2. 執行 migration（更新 DB + 自動 generate）
3. 更新 src/models/xxx.ts
4. 更新 Controller（如果前台/後台要回傳這個欄位）
5. 執行 npm run tsoa
```

### Step 1 — 修改 schema.prisma

```prisma
model Post {
  id        String   @id @default(uuid())
  title     String
  slug      String   @unique   // ← 新增
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**欄位已有資料時，新增 NOT NULL 欄位會失敗：**

```prisma
// 方案 A：給預設值
slug  String @default("")

// 方案 B：改為選填（nullable）
slug  String?
```

### Step 2 — 執行 Migration

```bash
# ⚠️ 互動式指令，必須在你自己的終端機視窗執行
npx prisma migrate dev --name "add_slug_to_post"
```

`migrate dev` 做了四件事：
1. 讀取 `schema.prisma` 的變更
2. 產生 SQL 存進 `prisma/migrations/`（🤖 自動產生，不要手動改）
3. 執行 SQL，在資料庫裡套用變更
4. 自動執行 `prisma generate`，更新 `@prisma/client` 的 TypeScript 型別

> **Docker 沒開、只想更新 TypeScript 型別時：**
> 跑 `npx prisma generate` 即可，不需要資料庫連線。

### Step 3 — 更新 TypeScript Model

```typescript
export interface Post {
  id: string;
  title: string;
  slug: string;       // ← 新增
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostDto {
  title: string;
  slug: string;       // ← 新增（新增文章時前端要送）
}

export interface UpdatePostDto {
  title?: string;
  slug?: string;      // ← 新增（選填）
}
```

`PublicPost` 視需要決定是否加上。

### Step 4 — 執行 tsoa

```bash
npm run tsoa
```

---

## 刪除欄位

以從 `Post` 移除 `author` 欄位為例。

**步驟：**

```
1. 修改 prisma/schema.prisma（移除欄位）
2. 執行 migration
3. 更新 src/models/xxx.ts（移除欄位）
4. 更新 Controller（確認沒有地方還在用這個欄位）
5. 執行 npm run tsoa
```

### Step 1 — 修改 schema.prisma

```prisma
model Post {
  id        String   @id @default(uuid())
  title     String
  // author String  ← 刪掉這行
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Step 2 — 執行 Migration

```bash
npx prisma migrate dev --name "remove_author_from_post"
```

> ⚠️ **注意：** 刪除欄位會永久清除該欄的所有資料，且無法透過 migration 還原。
> 確認資料已備份或不需要再跑 migration。

### Step 3 — 更新 TypeScript Model

從所有 interface 移除該欄位（`Post`、`PublicPost`、`CreatePostDto`、`UpdatePostDto`）。

---

## 重新命名欄位

> ⚠️ **這是 Prisma 最容易踩的坑。**
> Prisma 無法自動偵測「改名」，會把它誤判成「刪除舊欄位 + 新增新欄位」，造成資料遺失。

以把 `Post.author` 改名成 `Post.authorName` 為例。

**步驟：**

```
1. 修改 prisma/schema.prisma（改名 + 加 @map）
2. 執行 migration
3. 更新 src/models/xxx.ts
4. 執行 npm run tsoa
```

### Step 1 — 修改 schema.prisma（用 `@map` 保留欄位名稱）

```prisma
model Post {
  authorName String @map("author")  // TypeScript 用 authorName，DB 欄位仍叫 author
}
```

`@map` 告訴 Prisma：TypeScript 這端叫 `authorName`，但資料庫欄位名稱維持原本的 `author`，不需要動 DB，也不會遺失資料。

**如果真的要連 DB 欄位名稱也改：**

```bash
npx prisma migrate dev --name "rename_author_to_authorName"
```

Migration 產生後，打開 SQL 檔案，手動把：
```sql
-- Prisma 錯誤產生的（會刪資料）
ALTER TABLE "Post" DROP COLUMN "author";
ALTER TABLE "Post" ADD COLUMN "authorName" TEXT NOT NULL;
```
改成：
```sql
-- 正確做法（資料不會遺失）
ALTER TABLE "Post" RENAME COLUMN "author" TO "authorName";
```
然後執行：
```bash
npx prisma migrate dev --name "rename_author_to_authorName"
```

---

## 修改欄位型別（String → Enum）

以把 `Banner.type` 從 `String` 改成 `BannerType` enum 為例（實際做過的案例）。

**步驟：**

```
1. 在 schema.prisma 新增 enum，修改欄位型別
2. 執行 migration
3. 更新 src/models/xxx.ts，改成 import from @prisma/client
```

### Step 1 — 修改 schema.prisma

```prisma
enum BannerType {
  img
  imgText
}

model Banner {
  type BannerType   // 原本是 String
}
```

### Step 2 — 執行 Migration

```bash
npx prisma migrate dev --name "banner_type_enum"
```

### Step 3 — 更新 TypeScript Model

```typescript
// 之前（自己定義）
type BannerType = 'img' | 'imgText';

// 之後（從 Prisma 自動產生的型別 import）
import { BannerType } from "@prisma/client";
```

**為什麼要改成 import？**
Prisma 在 `generate` 後會自動在 `@prisma/client` 產生對應的 TypeScript enum，
和 DB 的 enum 定義保持同步。自己定義的話容易和 DB 脫節，且 service 會出現型別錯誤。

---

## 新增全新資源（Model + API）

以新增 `Comment` 資源為例。

**步驟：**

```
1. 在 prisma/schema.prisma 新增 model
2. 執行 migration
3. 建 src/models/xxx.ts
4. 建 src/services/xxxService.ts
5. 建 src/controllers/public/xxxController.ts   ← 前台（只讀）
6. 建 src/controllers/admin/xxxController.ts    ← 後台（完整 CRUD）
7. 執行 npm run tsoa
```

### Step 1 — 新增 model

```prisma
model Comment {
  id        String   @id @default(uuid())
  content   String
  author    String
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
| `String?` | 選填欄位（nullable） |

### Step 2 — 執行 Migration

```bash
npx prisma migrate dev --name "add_comment"
```

### Step 3 — 建立 Model

`src/models/comment.ts`

```typescript
export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicComment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
}

export interface CreateCommentDto {
  content: string;
  author: string;
}

export interface UpdateCommentDto {
  content?: string;
  author?: string;
}
```

### Step 4 — 建立 Service

`src/services/commentsService.ts`

```typescript
import { prisma } from "../lib/prisma";
import { Comment, CreateCommentDto, UpdateCommentDto } from "../models/comment";

export class CommentsService {
  async getAll(): Promise<Comment[]> {
    return prisma.comment.findMany({ orderBy: { createdAt: "desc" } });
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
      return undefined;
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

### Step 5 — 建立前台 Controller（只讀）

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
    return { data: comments.map(({ id, content, author, createdAt }) => ({ id, content, author, createdAt })) };
  }

  @Get("{id}")
  @Response<{ message: string }>(404, "Comment not found")
  public async getComment(@Path() id: string): Promise<ApiResponse<PublicComment>> {
    const comment = await this.commentsService.getById(id);
    if (!comment) {
      this.setStatus(404);
      throw new Error("Comment not found");
    }
    const { id, content, author, createdAt } = comment;
    return { data: { id, content, author, createdAt } };
  }
}
```

### Step 6 — 建立後台 Controller（完整 CRUD）

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

### Step 7 — 執行 tsoa

```bash
npm run tsoa
```

**不需要動 `app.ts`。** 後台保護已由 `apiRouter.use("/admin", authMiddleware)` 統一處理。

---

## 刪除整個資源

以刪除 `Comment` 資源為例。

**步驟：**

```
1. 刪除 src/controllers/public/commentsController.ts
2. 刪除 src/controllers/admin/commentsController.ts
3. 刪除 src/services/commentsService.ts
4. 刪除 src/models/comment.ts
5. 從 prisma/schema.prisma 移除 model
6. 執行 migration
7. 執行 npm run tsoa
```

### Step 5 — 移除 schema model

```prisma
// 刪掉整個 model Comment { ... } 區塊
```

若有其他 model 關聯到這個 model，要一併移除關聯欄位。

### Step 6 — 執行 Migration

```bash
npx prisma migrate dev --name "remove_comment"
```

> ⚠️ **注意：** 這會永久刪除資料表和所有資料，確認備份後再執行。

---

## 新增多對多關聯

以 `Post` ↔ `Tag` 為例（實際做過的案例）。

**適用情境：** 一篇文章可以有多個 Tag，一個 Tag 也可以屬於多篇文章。

**步驟：**

```
1. 在兩個 model 各加對應的關聯欄位
2. 執行 migration（Prisma 自動建立 join table）
3. 更新 TypeScript models
4. 更新 Service（加 include 查詢、upsert 邏輯）
```

### Step 1 — 修改 schema.prisma

```prisma
model Post {
  tags  Tag[]   // ← 新增
}

model Tag {
  posts Post[]  // ← 新增
}
```

Prisma 看到雙方都有對方的陣列，會自動建立隱式 join table `_PostToTag`，不需要手動定義。

### Step 2 — 執行 Migration

```bash
npx prisma migrate dev --name "post_tag_relation"
```

產生的 SQL 會長這樣：

```sql
CREATE TABLE "_PostToTag" (
    "A" TEXT NOT NULL,  -- Post.id
    "B" TEXT NOT NULL,  -- Tag.id
    CONSTRAINT "_PostToTag_AB_pkey" PRIMARY KEY ("A","B")
);
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

`ON DELETE CASCADE` 代表刪除 Post 時，join table 裡對應的記錄也會自動刪除（Tag 本身不會被刪）。

### Step 3 — 更新 TypeScript Model

在 `Post` 的 interface 加上 tags：

```typescript
import { PublicTag } from "./tag";

export interface Post {
  // ...其他欄位
  tags: PublicTag[];
}
```

### Step 4 — 更新 Service

```typescript
// 所有查詢加上 include
const includeTags = {
  include: { tags: { select: { id: true, name: true } } },
} as const;

// create 時 upsert tag 並 connect
async create(dto: CreatePostDto): Promise<Post> {
  const { tags: tagNames = [], ...postData } = dto;
  const tagConnects = await upsertTags(tagNames);
  return prisma.post.create({
    data: { ...postData, tags: { connect: tagConnects } },
    ...includeTags,
  });
}

// update 時用 set 完整替換
async update(id: string, dto: UpdatePostDto): Promise<Post | undefined> {
  const { tags: tagNames, ...postData } = dto;
  const tagsOp = tagNames !== undefined
    ? { set: await upsertTags(tagNames) }
    : undefined;
  // ...
}

// 用 upsert 避免重複建立 tag
async function upsertTags(names: string[]): Promise<{ id: string }[]> {
  return Promise.all(
    names.map(async (name) => {
      const id = toSlug(name);
      await prisma.tag.upsert({ where: { id }, create: { id, name }, update: {} });
      return { id };
    })
  );
}
```

**`connect` vs `set` 的差別：**

| 操作 | 說明 | 用在哪 |
|------|------|--------|
| `connect` | 新增關聯（不動現有的） | `create` |
| `set` | 完整替換（先清空再建立） | `update` |
| `disconnect` | 移除特定關聯 | 部分移除時 |

---

## 新增一對多關聯

以 `Topic` → `Post` 為例（一個主題可以有很多文章，一篇文章最多屬於一個主題）。
這也是實際做過的案例（Topic 是主題系列頁，Post.topicId 為外鍵）。

**步驟：**

```
1. 在「多」的 model 加 foreignKey 欄位和 @relation
2. 在「一」的 model 加關聯陣列
3. 執行 migration
4. 更新 TypeScript models
5. 更新 Service（加 include 查詢）
```

### Step 1 — 修改 schema.prisma

```prisma
model Topic {
  // ...其他欄位
  posts Post[]   // ← 一個 Topic 有多篇 Post（反向關聯）
}

model Post {
  // ...其他欄位
  topicId String?       // ← 外鍵欄位（nullable，文章不一定屬於某個主題）
  topic   Topic? @relation(fields: [topicId], references: [id])
}
```

`topicId` 設為 `String?`（nullable）：文章不一定隸屬於某個主題，可以是獨立文章。
若改為 `String`（非 nullable），則每篇文章都必須指定主題。

### Step 2 — 執行 Migration

```bash
npx prisma migrate dev --name "topic_post_relation"
```

### Step 3 — 更新 TypeScript Model

```typescript
// models/topic.ts
export interface Topic {
  posts?: Post[];   // 若需要在 topic 回傳時帶入文章列表
}

// models/post.ts
import { PublicTopic } from "./topic";

export interface Post {
  topicId: string | null;   // ← 新增
  topic: PublicTopic | null; // ← 新增（include 後的關聯物件）
}

export interface CreatePostDto {
  topicId?: string;   // ← 新增（選填，建立時指定所屬主題）
}

export interface UpdatePostDto {
  topicId?: string | null;   // ← 傳 null 可解除主題關聯
}
```

### Step 4 — 更新 Service

查詢時在 include 加上 topic：

```typescript
const includeRelations = {
  include: {
    tags: { select: { id: true, name: true } },
    topic: { select: { id: true, name: true, description: true } },
  },
} as const;

prisma.post.findMany({ ...includeRelations });
```

前台文章列表支援依主題篩選：
```typescript
prisma.post.findMany({
  where: { topicId: "vue-series" }
});
```

---

## 新增 Prisma Enum

以新增 `BannerType` 為例（實際做過的案例）。

**適用情境：** 欄位只能是固定幾個值（例如狀態、類型），想讓 DB 層也做限制，且希望 TypeScript 型別自動同步。

**步驟：**

```
1. 在 schema.prisma 新增 enum，修改欄位型別
2. 執行 migration
3. 更新 TypeScript model，改成 import from @prisma/client
```

### Step 1 — 修改 schema.prisma

```prisma
enum BannerType {
  img
  imgText
}

model Banner {
  type BannerType   // 原本是 String
}
```

### Step 2 — 執行 Migration

```bash
npx prisma migrate dev --name "banner_type_enum"
```

### Step 3 — 更新 TypeScript Model

```typescript
// 之前（自己定義，容易和 DB 脫節）
type BannerType = 'img' | 'imgText';

// 之後（從 Prisma 自動產生的型別 import，永遠和 DB 同步）
import { BannerType } from "@prisma/client";
export { BannerType };  // 若其他地方需要 import 這個型別
```

**為什麼不用自己定義？**
Prisma generate 後，`@prisma/client` 裡會自動有對應的 TypeScript enum。
自己定義的話，service 回傳 Prisma 物件時，`string` 和 `'img' | 'imgText'` 型別不相容，TypeScript 會報錯。

---

## 命名規則快速參考

| 資源 | 前台路徑（@Route） | 後台路徑（@Route） | Class 名稱 |
|------|---------|---------|-----------|
| Post | `public/posts` | `admin/posts` | `PublicPostsController` / `AdminPostsController` |
| Tag | `public/tags` | `admin/tags` | `PublicTagsController` / `AdminTagsController` |
| Topic | `public/topics` | `admin/topics` | `PublicTopicsController` / `AdminTopicsController` |
| Banner | `public/banner` | `admin/banner` | `PublicBannerController` / `AdminBannerController` |
| Comment | `public/comments` | `admin/comments` | `PublicCommentsController` / `AdminCommentsController` |

規則：
- `@Route()` 不需要加 `api/` 前綴，完整 URL 為 `/api/{路徑}`
- Controller Class：`Public資源名稱Controller` / `Admin資源名稱Controller`
- Service Class：`資源名稱Service`（前後台共用同一個 Service）

---

## 常用 Prisma 指令

| 指令 | 說明 | 什麼時候用 |
|------|------|-----------|
| `npx prisma migrate dev --name "描述"` | 產生並套用 migration，自動執行 generate | 改了 `schema.prisma` 之後 |
| `npx prisma generate` | 只更新 TypeScript 型別，不動 DB | Docker 沒開時想先讓 TypeScript 不報錯 |
| `npx prisma migrate deploy` | 只套用既有 migration，不新增 | production 環境部署時 |
| `npx prisma studio` | 開啟瀏覽器視覺化資料庫介面 | 想直接查看或修改資料時 |
| `npx prisma db push` | 直接同步 schema 到 DB（不產生 migration） | 快速實驗，正式環境不推薦 |

---

## 查看資料庫內容

**Prisma Studio（推薦）**

```bash
npx prisma studio
```

在瀏覽器開啟視覺化介面，可以直接查看和修改資料。
跑起來後終端機會顯示實際的 port（例如 `http://localhost:51212`）。

**DBeaver**

GUI 工具連線：Host `localhost`、Port `5432`、Database `angular_blog_db`、Username `enpei`。

**psql（命令列）**

```bash
docker exec angular_blog_postgres psql -U enpei -d angular_blog_db
```

常用 SQL：

```sql
SELECT * FROM "Post";
SELECT * FROM "Tag";
SELECT * FROM "Banner";
SELECT * FROM "_PostToTag";  -- 查看 Post ↔ Tag 的關聯記錄
\dt   -- 列出所有資料表
\q    -- 離開
```
