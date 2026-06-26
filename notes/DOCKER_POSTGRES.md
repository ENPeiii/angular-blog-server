# 環境建立：Docker + PostgreSQL + Prisma

> 從零開始，第一次設定環境的完整流程。環境建好後不需要再跑一次。

---

## 前置條件

- 已安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- 確認 Docker 已啟動（系統列有 Docker 圖示）

---

## Step 1：建立 .env

```bash
cp .env.example .env
```

`.env.example` 的內容如下，複製後填入你自己的帳密：

```
POSTGRES_USER=enpei
POSTGRES_PASSWORD=your_password
POSTGRES_DB=angular_blog_db
DATABASE_URL=postgresql://enpei:your_password@localhost:5432/angular_blog_db
NODE_ENV=development
PORT=3000
```

| 變數 | 說明 |
|------|------|
| `POSTGRES_USER` | PostgreSQL 帳號，docker-compose 會用這個建立使用者 |
| `POSTGRES_PASSWORD` | PostgreSQL 密碼 |
| `POSTGRES_DB` | 資料庫名稱 |
| `DATABASE_URL` | Prisma 連線字串，帳密要與上面三個一致 |
| `NODE_ENV` | 執行環境，本地開發填 `development` |
| `PORT` | 伺服器 port，預設 3000 |

> `DATABASE_URL` 裡的帳密、db 名稱必須與 `POSTGRES_*` 變數完全一致，否則 Prisma 連線會失敗。

---

## Step 2：了解 docker-compose.prod.yml

專案根目錄的 `docker-compose.prod.yml` 定義了兩個 service：

```yaml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}       # 從 .env 讀取
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
    depends_on:
      postgres:
        condition: service_healthy   # 等 postgres 真正 ready 才啟動 app
```

- **本機開發**：只啟動 `postgres`，Node 伺服器直接跑在機器上
- **完整 Docker 測試**：啟動所有 service，app 容器也一起跑

帳密不寫死在 compose 裡，全部從根目錄的 `.env` 讀取，所以 Step 1 的 `.env` 一定要先建好。

---

## Step 3：啟動 PostgreSQL 容器

本地開發只需要啟動 postgres：

```bash
docker compose up postgres -d
```

確認正常運行：

```bash
docker ps
```

應看到 `angular_blog_postgres` 狀態為 `Up (healthy)`，Port 欄位為 `0.0.0.0:5432->5432/tcp`。

查看 log（若有問題）：

```bash
docker logs angular_blog_postgres
```

---

## Step 4：確認 prisma.config.ts

Prisma 7 的資料庫連線設定不寫在 `schema.prisma` 裡，改用專案根目錄的 `prisma.config.ts`：

```ts
import { defineConfig } from 'prisma/config'
import 'dotenv/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
```

對應的 `schema.prisma` datasource 只留 `provider`，不寫 `url`：

```prisma
datasource db {
  provider = "postgresql"
}
```

---

## Step 5：執行第一次 Migration

讓 Prisma 把 `prisma/migrations/` 裡的 SQL 跑進資料庫，建立所有資料表：

```bash
npx prisma migrate deploy
```

> `migrate deploy`（不是 `migrate dev`）：只套用已有的 migration 檔，不新增、不互動，適合初次建立環境。

成功後會出現：

```
Applying migration `20260413134045_init`
Applying migration `20260413151214_add_tag_banner`
Applying migration `20260419113942_banner_img_to_imgUrl_imgAlt`
All migrations have been successfully applied.
```

---

## Step 6：啟動伺服器

```bash
npm run dev
```

確認以下 URL 都能正常開啟：

| URL | 說明 |
|-----|------|
| `http://localhost:3000/swagger` | API 互動文件 |
| `http://localhost:3000/redoc` | 閱讀型 API 文件 |

---

## 日常 Docker 操作

| 動作 | 指令 |
|------|------|
| 啟動 postgres（本地開發用） | `docker compose up postgres -d` |
| 啟動所有容器（完整 Docker 環境） | `docker compose up -d` |
| 停止容器 | `docker compose stop` |
| 停止並移除容器 | `docker compose down` |
| 停止並清除資料（危險！） | `docker compose down -v` |
| 查看容器狀態 | `docker ps` |
| 查看 postgres logs | `docker logs angular_blog_postgres` |
| 進入 psql | `docker exec angular_blog_postgres psql -U enpei -d angular_blog_db` |

常用 psql 指令：

```sql
\dt                   -- 列出所有資料表
\d "Post"             -- 查看 Post 資料表結構
SELECT * FROM "Post"; -- 查詢資料（資料表名稱要加引號）
\q                    -- 離開
```

---

## 常見問題

### Port 5432 已被佔用

**症狀**：`docker compose up` 出現 `Bind for 0.0.0.0:5432 failed`

```bash
# 查看是誰佔用
netstat -ano | findstr :5432

# 查看所有 postgres 相關容器
docker ps -a | findstr postgres
```

**解法**：停掉佔用的服務，或改 `docker-compose.prod.yml` 的 port 映射（`.env` 同步修改）：

```yaml
ports:
  - "5433:5432"
```

### 帳密正確但 Prisma 連線失敗（P1000）

**原因**：另一個服務搶先監聽 5432，Prisma 的連線根本到不了 Docker 容器。

```bash
netstat -ano | findstr :5432
```

確認 `docker ps` 的 Port 欄位正確顯示 `0.0.0.0:5432->5432/tcp`，若沒有代表容器的 port 沒有正確綁定。

### 改了 .env 的帳密但沒有生效

**原因**：volume 裡已有舊資料，PostgreSQL 啟動時會忽略新的環境變數。

```bash
docker compose down -v   # 刪除 volume（資料會清空）
docker compose up postgres -d
npx prisma migrate deploy   # 重新建立資料表
```

### PostgreSQL 版本升級（例如 16 → 17）

volume 裡的資料格式與版本綁定，直接換版本會導致容器不斷重啟。解法同上：

```bash
docker compose down -v
docker compose up postgres -d
npx prisma migrate deploy
```

### 一般排查步驟

1. `docker ps` — 確認容器狀態是否為 `Up (healthy)`
2. `docker logs angular_blog_postgres` — 查看容器 log
3. `netstat -ano | findstr :5432` — 確認 port 沒有衝突
4. 確認 `.env` 裡的帳密與 `POSTGRES_*` 變數一致
