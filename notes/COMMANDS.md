# 常用指令


## 開發啟動

每次開發前，依序確認以下三個都有跑：

| 順序 | 指令 | 說明 | 終端機分頁 |
|------|------|------|-----------|
| 1 | `docker compose up -d` | 啟動 PostgreSQL 容器（背景執行） | 不需要佔分頁 |
| 2 | `npm run dev` | 啟動 Node.js 伺服器 | 分頁 1 |
| 3 | `npm run studio` | 開啟資料庫視覺化介面（需要時才開） | 分頁 2 |

> Docker 用 `-d` 背景執行，啟動後不需要佔終端機分頁。
> Studio 不是每次都需要，想查資料時再開。

---

## npm 指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 開發模式，存檔自動重啟伺服器 |
| `npm run studio` | 開啟 Prisma Studio（瀏覽器視覺化資料庫介面） |
| `npm run tsoa` | 重新產生 `routes.ts` 和 `swagger.json` |
| `npm run build` | 編譯 TypeScript（部署用） |
| `npm start` | 執行編譯後的版本（production 用） |

---

## Docker 指令

| 指令 | 說明 |
|------|------|
| `docker compose up -d` | 啟動容器（背景執行） |
| `docker compose stop` | 停止容器（資料保留） |
| `docker compose down` | 停止並移除容器（資料保留） |
| `docker compose down -v` | 停止並清除所有資料（危險！） |
| `docker ps` | 查看目前執行中的容器 |
| `docker logs angular_blog_postgres` | 查看容器 log |

---

## Prisma 指令

| 指令 | 說明 | 什麼時候用 |
|------|------|-----------|
| `npx prisma migrate dev --name "描述"` | 產生並套用 migration（**互動式，需在自己終端機跑**） | 改了 `schema.prisma` 之後 |
| `npx prisma migrate deploy` | 只套用既有 migration，不新增 | production 部署時 |
| `npx prisma generate` | 重新產生 TypeScript 型別 | 通常不需手動，migrate 後自動執行 |
| `npx prisma studio` | 開啟瀏覽器視覺化資料庫管理介面 | 想查看或修改資料時（用 `npm run studio`） |
| `npx prisma db push` | 直接同步 schema 到 DB（不產生 migration） | 快速實驗，正式環境不推薦 |

> ⚠️ **Prisma 7 注意事項：**
> - `schema.prisma` 裡**不要**放 `url = env("DATABASE_URL")`，Prisma 7 已不支援
> - 連線 URL 統一放在 `prisma.config.ts`，這個檔案不能刪
> - `npm run studio` 跑起來後若看到 `ERR_STREAM_UNABLE_TO_PIPE` 錯誤是已知 noise，不影響使用

---

## 開發流程提醒

**改了 Controller（新增端點、改參數）後：**

```bash
npm run tsoa
```

**改了 schema.prisma（新增欄位或資料表）後：**

```bash
# ⚠️ 這是互動式指令，請在你自己的終端機視窗執行
npx prisma migrate dev --name "描述"
```

> 若資料表裡已有資料，且新增的是 NOT NULL 欄位（沒有 `?` 也沒有 `@default`），
> Prisma 會提示無法自動執行，需要你手動確認或補預設值。
> 這時在 schema 加 `@default("")` 或 `?` 讓欄位可為 null，是最簡單的解法。

接著手動更新 `src/models/` 對應的 interface，再跑：

```bash
npm run tsoa
```
