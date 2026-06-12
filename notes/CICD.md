# CI/CD 部署流程

> 說明從 push 程式碼到正式環境自動更新的完整流程。

---

## 整體流程

```
開發者 push 到 GitHub
         │
         ▼
┌─────────────────────────────────┐
│  docker-build.yml               │
│  Build Docker Image             │
│  Push → ghcr.io (GHCR)         │
└───────────────┬─────────────────┘
                │ 成功後自動觸發
                ▼
┌─────────────────────────────────┐
│  deploy.yml                     │
│  SCP docker-compose.prod.yml    │
│  SSH 進 GCP VM                  │
│  docker compose pull + up -d    │
└─────────────────────────────────┘
                │
                ▼
         GCP VM 跑最新版
```

---

## Workflow 一：Build and Push（docker-build.yml）

**觸發條件：** push 或 PR 到 `main` 分支

**做了什麼：**

1. Checkout 程式碼
2. 登入 GitHub Container Registry（GHCR）
3. 用根目錄的 `Dockerfile` 建立 image
4. Push 兩個 tag 到 `ghcr.io/enpeiii/angular-blog-server`：
   - `sha-xxxxxxx`（當下這個 commit 的 hash）
   - `latest`（只有 push 到預設分支才會更新）

> PR 時只 build 不 push（確認 Dockerfile 沒壞），push 才真的推上去。

**所需 Secret：**

| Secret         | 說明                            |
| -------------- | ------------------------------- |
| `GITHUB_TOKEN` | GitHub 自動提供，不需要手動設定 |

---

## Workflow 二：Deploy to GCP（deploy.yml）

**觸發條件：** `docker-build.yml` 成功完成後自動觸發

**做了什麼：**

1. **SCP** — 把 `docker-compose.prod.yml` 複製到 GCP VM 的 `~/`
2. **SSH** — 遠端執行以下步驟：
   - 登入 GHCR（`docker login ghcr.io`）
   - 從 GitHub Secrets 動態產生 `~/env.prod` 環境變數檔
   - `docker compose pull` — 拉最新 image
   - `docker compose up -d` — 重新啟動容器
   - `docker image prune -f` — 清理舊 image

**GCP VM 上執行的指令（簡化版）：**

```bash
docker compose -f ~/docker-compose.prod.yml --env-file ~/env.prod pull
docker compose -f ~/docker-compose.prod.yml --env-file ~/env.prod up -d
docker image prune -f
```

**所需 Secrets：**

| Secret              | 說明                                                          |
| ------------------- | ------------------------------------------------------------- |
| `GCP_HOST`          | GCP VM 的 IP 或 domain                                        |
| `GCP_USERNAME`      | SSH 登入帳號                                                  |
| `GCP_SSH_KEY`       | SSH 私鑰（對應 VM 上的 authorized_keys）                      |
| `GH_CR_TOKEN`       | GitHub Personal Access Token，用來在 VM 上 pull private image |
| `POSTGRES_USER`     | PostgreSQL 帳號                                               |
| `POSTGRES_PASSWORD` | PostgreSQL 密碼                                               |
| `POSTGRES_DB`       | 資料庫名稱                                                    |

> Secrets 在 GitHub repo → Settings → Secrets and variables → Actions 設定。

---

## 正式環境的 .env 從哪來？

正式環境**不使用** `.env.prod` 實體檔案（不傳上 VM、不存進 git）。

deploy.yml 在每次部署時用 GitHub Secrets 動態產生 `~/env.prod`：

```bash
printf '%s\n' \
  "POSTGRES_USER=..." \
  "POSTGRES_PASSWORD=..." \
  "POSTGRES_DB=..." \
  "DATABASE_URL=postgresql://...@postgres:5432/..." \
  "NODE_ENV=production" \
  "PORT=3000" > ~/env.prod
```

這樣密碼永遠不會出現在 repo 或 VM 的持久檔案裡。

---

## Dockerfile 建置流程

採用 **multi-stage build** 減少 production image 大小：

```
Builder stage（含 devDependencies）
  ├── npm ci（安裝全部依賴，包含 TypeScript）
  ├── npx prisma generate（產生 Prisma Client）
  └── npm run build（編譯 TypeScript → dist/）

Production stage（只裝 production deps）
  ├── npm ci --omit=dev（排除 TypeScript、nodemon 等）
  ├── npx prisma generate（重新產生 Prisma Client）
  └── COPY dist/（從 builder 拿編譯結果）

容器啟動時：
  npx prisma migrate deploy && node dist/server.js
```

> `prisma migrate deploy` 在容器啟動時自動把 migration 跑進資料庫，不需要手動執行。

---

## 本地測試完整 Docker 環境

如果想在本地模擬正式環境（用 container 跑 app，而不是 `npm run dev`）：

```bash
# 建立並啟動所有 service
npm run docker
# 等同於：docker compose up -d

# 查看 app 啟動 log
docker logs angular_blog_app

# 停止
docker compose down
```

---

## 常見問題

### deploy.yml 沒有被觸發

- 確認 `docker-build.yml` 有成功跑完（不是 failed 或 cancelled）
- `workflow_run` trigger 只在 default branch 可靠，目前設定的是 `main`

### GCP VM 上的容器跑舊版 image

```bash
# 手動在 VM 上執行
docker compose -f ~/docker-compose.prod.yml --env-file ~/env.prod pull
docker compose -f ~/docker-compose.prod.yml --env-file ~/env.prod up -d
```

### SSH 連線失敗

確認 `GCP_SSH_KEY` secret 是私鑰（`-----BEGIN OPENSSH PRIVATE KEY-----`），對應的公鑰有放在 VM 的 `~/.ssh/authorized_keys`。
