# 接上 PostgreSQL 資料庫指南

> 目前專案用記憶體（array）儲存資料，重啟伺服器後資料會消失。
> 照這份指南操作，即可換成真正的 PostgreSQL 資料庫。

---

## 目前的檔案配置

```
src/services/
  ├── postsService.ts      ← 現在用這個（記憶體版）
  └── postsService.db.ts   ← 準備好了，等你啟用（PostgreSQL 版）
```

切換時只需要：
1. 建好資料庫環境
2. 改 **2 個檔案**

---

## Step 1 — 安裝 dotenv（讀取 .env 檔）

```bash
npm install dotenv
```

---

## Step 2 — 建立 .env 檔案

把 `.env.example` 複製一份，改名為 `.env`，填入你的 PostgreSQL 連線資訊：

```bash
# Windows
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

打開 `.env`，把連線字串改成你的：

```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/blog_db"
```

格式說明：
```
postgresql://  使用者名稱 : 密碼 @ 主機 : 埠號 / 資料庫名稱
              ──────────  ──── ─────── ─────  ─────────────
              postgres   1234  localhost 5432  blog_db
```

> 如果你用 Docker 起 PostgreSQL，主機填 `localhost`。
> 如果你用雲端服務（如 Supabase、Neon），直接貼上他們給你的連線字串。

---

## Step 3 — 執行 Prisma Migration（建立資料表）

```bash
# 產生 Prisma Client（讓 TypeScript 知道資料庫有哪些欄位）
npx prisma generate

# 建立並執行 migration（在資料庫裡真正建立 posts 資料表）
npx prisma migrate dev --name init
```

`migrate dev` 做了三件事：
1. 讀取 `prisma/schema.prisma`
2. 比對資料庫現況，產生 SQL 變更語句（存在 `prisma/migrations/` 資料夾）
3. 執行那些 SQL，把資料表建起來

執行後，你的資料庫裡會有這張表：
```sql
CREATE TABLE "Post" (
  "id"        SERIAL PRIMARY KEY,
  "title"     TEXT NOT NULL,
  "content"   TEXT NOT NULL,
  "author"    TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP
);
```

---

## Step 4 — 修改 server.ts，載入 .env

打開 [src/server.ts](src/server.ts)，在第一行加上：

```typescript
// 加在最頂端，其他 import 之前
import "dotenv/config";

import { app } from "./app";
// ... 其餘不變
```

---

## Step 5 — 替換 Controller 裡的 Service

打開 [src/controllers/postsController.ts](src/controllers/postsController.ts)：

**改第 1 行 import：**

```typescript
// 改之前（記憶體版）
import { PostsService } from "../services/postsService";

// 改之後（資料庫版）
import { PostsService } from "../services/postsService.db";
```

**替所有 Service 呼叫加上 `await`：**

因為資料庫操作是非同步的，方法都變成 `async`，需要 `await` 才能拿到結果。

```typescript
// 改之前（記憶體版，同步）
const post = this.postsService.getById(id);

// 改之後（資料庫版，非同步）
const post = await this.postsService.getById(id);
```

完整的 Controller 改法（共 5 處需要加 `await`）：

```typescript
// GET /posts
public async getPosts(): Promise<PostModel[]> {
  return this.postsService.getAll();  // ← 加 await
  // return await this.postsService.getAll();
}

// GET /posts/:id
public async getPost(@Path() id: number): Promise<PostModel> {
  const post = this.postsService.getById(id);  // ← 加 await
  // const post = await this.postsService.getById(id);
  ...
}

// POST /posts
public async createPost(@Body() body: CreatePostDto): Promise<PostModel> {
  return this.postsService.create(body);  // ← 加 await
  // return await this.postsService.create(body);
}

// PUT /posts/:id
public async updatePost(...): Promise<PostModel> {
  const post = this.postsService.update(id, body);  // ← 加 await
  // const post = await this.postsService.update(id, body);
  ...
}

// DELETE /posts/:id
public async deletePost(@Path() id: number): Promise<void> {
  const success = this.postsService.delete(id);  // ← 加 await
  // const success = await this.postsService.delete(id);
  ...
}
```

---

## Step 6 — 重新產生 Tsoa 路由，啟動伺服器

```bash
npm run tsoa   # 重新產生 routes.ts
npm run dev    # 啟動伺服器
```

---

## 完成後的檔案結構

```
src/
├── lib/
│   └── prisma.ts            ← Prisma Client 單例（已建好，不用動）
├── services/
│   ├── postsService.ts      ← 記憶體版（可以留著備用，或直接刪掉）
│   └── postsService.db.ts   ← 現在用這個
├── controllers/
│   └── postsController.ts   ← import 已改成 .db 版
prisma/
├── schema.prisma            ← 資料庫 schema（已建好）
└── migrations/              ← Prisma 自動產生的 SQL 歷史紀錄
```

---

## 常用 Prisma 指令

```bash
# 用視覺化介面瀏覽資料庫內容（類似 PgAdmin 的 web 版）
npx prisma studio

# schema 有改動時，重新建立 migration
npx prisma migrate dev --name "add_tags_to_post"

# 重新產生 Prisma Client（schema 改動後都要跑一次）
npx prisma generate

# 把 migration 直接推到資料庫（不產生 migration 檔，適合 production 部署）
npx prisma migrate deploy
```

---

## 架構比較：切換前後的差異

```
切換前（記憶體版）                切換後（資料庫版）
─────────────────────            ─────────────────────────
Controller                       Controller
  │                                │
  ▼                                ▼
PostsService (sync)              PostsService (async)
  │                                │
  ▼                                ▼
posts[] in RAM                   Prisma Client
                                   │
                                   ▼
                                 PostgreSQL
```

**注意：Controller 的邏輯完全沒有改變，只是加了 `await`。**
這就是三層架構的好處：換底層實作時，上層幾乎不用動。

---

## 如果你用 Docker 起 PostgreSQL

如果電腦上沒有裝 PostgreSQL，最快的方式是用 Docker：

```bash
docker run --name blog-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=blog_db \
  -p 5432:5432 \
  -d postgres:16
```

然後 `.env` 填：
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/blog_db"
```
