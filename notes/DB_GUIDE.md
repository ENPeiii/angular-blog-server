# PostgreSQL + Prisma 設定參考

> 本專案已完整接上 PostgreSQL（跑在 Docker）。
> 這份文件記錄目前的設定方式與常用指令，供日後參考。

---

## 目前的資料庫架構

```
prisma/schema.prisma   ← 定義資料表結構
prisma/migrations/     ← Prisma 自動產生的 SQL 變更歷史
prisma.config.ts       ← 資料庫連線設定（Prisma 7 新規範）
.env                   ← 連線字串（不進 git）
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String
  author    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Tag {
  id        String   @id @default(uuid())
  name      String   @unique
  createdAt DateTime @default(now())
}

model Banner {
  id        String   @id @default(uuid())
  title     String
  type      String          // "img" | "imgText"
  img       String
  isActive  Boolean  @default(false)
  content   String?         // 選填
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Prisma 7 連線設定

Prisma 7 移除了在 `schema.prisma` 裡設定 `url` 的方式，改用 `prisma.config.ts`：

```ts
// prisma.config.ts
import { defineConfig } from 'prisma/config'
import 'dotenv/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
```

`.env` 連線字串：

```
DATABASE_URL="postgresql://enpei:Pei830509@localhost:5432/angular_blog_db"
```

---

## Migration 歷史

| Migration | 內容 |
|-----------|------|
| `20260413134045_init` | 建立 `Post` 資料表 |
| `20260413151214_add_tag_banner` | 新增 `Tag`、`Banner` 資料表 |

---

## 常用 Prisma 指令

```bash
# schema 有改動時，建立並套用新的 migration
npx prisma migrate dev --name "描述這次的變更"

# 重新產生 Prisma Client（schema 改動後必跑）
npx prisma generate

# 用視覺化介面瀏覽資料庫內容（類似 PgAdmin 的 web 版）
npx prisma studio

# 把現有 migration 套用到資料庫（不新增 migration，適合 production）
npx prisma migrate deploy
```

---

## 新增資料表的流程

1. 在 `prisma/schema.prisma` 加上新的 `model`
2. 執行 migration：

```bash
npx prisma migrate dev --name "add_新資源名稱"
npx prisma generate
```

3. 建立對應的 TypeScript interface（`src/models/新資源.ts`）
4. 建立 Service（`src/services/新資源Service.ts`）
5. 建立 Controller（`src/controllers/public/` 和 `src/controllers/admin/`）
6. 重新產生 Tsoa 路由：

```bash
npm run tsoa
```

詳細步驟見 [new-resource.md](new-resource.md)。

---

## 用 Docker 起 PostgreSQL

詳見 [DOCKER_POSTGRES.md](DOCKER_POSTGRES.md)。

**快速啟動：**

```bash
docker compose up -d
```
