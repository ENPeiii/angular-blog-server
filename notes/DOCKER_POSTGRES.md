# 用 Docker 跑 PostgreSQL

## 前置條件

- 已安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- 確認 Docker 已啟動（系統列有 Docker 圖示）

---

## Step 1：確認 docker-compose.yml

專案根目錄的 `docker-compose.yml`（本專案實際設定）：

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine        # 使用官方 PostgreSQL 16 輕量版
    container_name: angular_blog_postgres
    restart: unless-stopped          # 非手動停止時自動重啟
    environment:
      POSTGRES_USER: enpei
      POSTGRES_PASSWORD: Pei830509
      POSTGRES_DB: angular_blog_db
    ports:
      - "5432:5432"                  # 主機埠號:container 埠號
    volumes:
      - postgres_data:/var/lib/postgresql/data  # 資料持久化

volumes:
  postgres_data:  # named volume，重啟 container 資料不會消失
```

> **本機有安裝原生 PostgreSQL 的注意事項**
> 本機 Windows 有安裝 PostgreSQL 17（`C:\Engineer\DB\PostgreSQL\`），
> 已將該服務改為**手動啟動**（不會在開機時自動佔用 5432），
> 所以 Docker container 可以正常使用 5432。
> 若哪天 5432 又被佔用，檢查方式：`netstat -ano | grep :5432`

---

## Step 2：建立 .env

專案已有 `.env.example`，複製並填入對應帳密：

```bash
cp .env.example .env
```

`.env` 實際內容（對應 docker-compose.yml）：

```
DATABASE_URL="postgresql://enpei:Pei830509@localhost:5432/angular_blog_db"
NODE_ENV="development"
PORT=3000
```

> **注意**：`POSTGRES_USER`、`POSTGRES_PASSWORD`、`POSTGRES_DB`、port 號
> 必須與 `docker-compose.yml` 的 environment 完全對應。

---

## Step 3：啟動 PostgreSQL container

```bash
# 在專案根目錄執行
docker compose up -d
```

- `-d`：background 執行（detached mode）
- 第一次執行會自動 pull `postgres:16-alpine` image

**確認 container 是否正常運行：**

```bash
docker ps
```

應看到 `angular_blog_postgres` 狀態為 `Up`，Port 欄位為 `0.0.0.0:5432->5432/tcp`。

**查看 logs（若有問題）：**

```bash
docker logs angular_blog_postgres
```

---

## Step 4：設定 prisma.config.ts（Prisma 7 必要）

Prisma 7 不再支援在 `schema.prisma` 裡寫 `url = env(...)`，
必須改用專案根目錄的 `prisma.config.ts`：

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

`prisma/schema.prisma` 的 datasource 只留 `provider`，移除 `url`：

```prisma
datasource db {
  provider = "postgresql"
  // url 移到 prisma.config.ts，Prisma 7 的新規範
}
```

---

## Step 5：執行 Prisma Migration

Container 啟動後，讓 Prisma 建立資料表：

```bash
# 開發環境：建立並套用 migration
npx prisma migrate dev --name init

# 只套用既有 migration（不新增）
npx prisma migrate deploy
```

成功後會出現：

```
Applying migration `20260413134045_init`
Your database is now in sync with your schema.
```

**產生 Prisma Client：**

```bash
npx prisma generate
```

---

## Step 6：確認資料庫連線

用 Prisma Studio 在瀏覽器查看資料：

```bash
npx prisma studio
```

或用 `psql` CLI 直接連入 container（不需要 TTY，去掉 `-it`）：

```bash
docker exec angular_blog_postgres psql -U enpei -d angular_blog_db
```

常用 psql 指令：

```sql
\dt                  -- 列出所有資料表
\d "Post"            -- 查看 Post 資料表結構
SELECT * FROM "Post";
\q                   -- 離開
```

---

## 日常操作指令

| 動作 | 指令 |
|------|------|
| 啟動 container | `docker compose up -d` |
| 停止 container | `docker compose stop` |
| 停止並移除 container | `docker compose down` |
| 停止並清除資料（危險！） | `docker compose down -v` |
| 查看 container 狀態 | `docker ps` |
| 查看 logs | `docker logs angular_blog_postgres` |
| 進入 psql | `docker exec angular_blog_postgres psql -U enpei -d angular_blog_db` |

---

## 常見問題

### Port already in use

**症狀**：`docker compose up -d` 出現 `Bind for 0.0.0.0:5432 failed: port is already allocated`

**原因**：本機已有服務佔用該 port（可能是另一個 container 或原生 PostgreSQL）

```bash
# 查看是誰佔用
netstat -ano | grep :5432

# 查看所有 container
docker ps -a | grep postgres
```

**解法**：改 docker-compose.yml 的 port 映射，`.env` 同步修改：

```yaml
ports:
  - "5433:5432"  # 主機改用 5433（若 5432 被其他服務佔用）
```

### Prisma P1000 — Authentication failed（帳密正確但還是失敗）

**根本原因**：本機原生 PostgreSQL 搶先監聽 5432，Prisma 的連線根本到不了 Docker 容器。

**診斷方式**：

```bash
netstat -ano | grep :5432
# 若看到 "postgres" process 佔用 5432，就是這個問題
```

**解法**：停止佔用的服務，或將 Docker container 改用其他 port（如 5433，見上方 Port already in use）。

### Volume 帳密問題（改了 docker-compose.yml 但還是舊帳密）

**原因**：`postgres_data` volume 已有舊資料，PostgreSQL 啟動時會忽略新的環境變數。

**解法**（開發初期安全，會清除所有資料）：

```bash
docker compose down -v   # -v 同時刪除 volume
docker compose up -d     # 重新建立，使用新帳密
```

### 一般排查步驟

1. 確認 container 狀態：`docker ps`
2. 確認 `.env` 的帳密與 `docker-compose.yml` 一致
3. 確認 port 沒有與本機服務衝突（`netstat -ano | grep :5432`）
4. 若改過帳密：先 `docker compose down -v` 再重啟
5. 查看 container log：`docker logs angular_blog_postgres`
