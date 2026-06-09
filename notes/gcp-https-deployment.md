# GCP HTTPS 部署筆記

> 目標：把 `http://35.222.136.176:3000` 升級成 `https://api.enpei.com.tw`

---

## 整體架構

```
瀏覽器
  │
  ▼ HTTPS (443)
nginx（GCP VM 上）
  │
  ▼ HTTP localhost:3000
Express（Docker 容器）
  │
  ▼
PostgreSQL（Docker 容器）
```

nginx 負責：
- 終止 SSL（接受外部 HTTPS）
- 把流量代理到 Docker 內的 Express

---

## Step 1：買網域後設 DNS

在 GoDaddy（或任何 DNS 服務商）新增 A Record：

| 類型 | 名稱 | 值 | TTL |
|------|------|----|-----|
| A | api | `35.222.136.176`（VM 外部 IP）| 600 |

> 等待 DNS 生效約 5～30 分鐘，可用 `nslookup api.enpei.com.tw` 確認。

---

## Step 2：GCP 防火牆開放 port 80 / 443

GCP Console → VPC 網路 → 防火牆，或直接在 VM 設定裡：

- 確認 VM 已打勾 **允許 HTTP 流量**
- 確認 VM 已打勾 **允許 HTTPS 流量**

這兩個選項會自動新增網路標記 `http-server`、`https-server`，並建立對應的防火牆規則。

---

## Step 3：SSH 金鑰讓 CD Pipeline 能連線

### 為何需要特別設定？
GitHub Actions 需要用 SSH key 連進 GCP VM，但 GCP 預設用 OS Login 管理金鑰，不能直接把 key 加進 `~/.ssh/authorized_keys`（GCP 會覆蓋）。

### 正確做法：在 GCP 元數據加入公鑰

1. 在 GCP VM 上產生金鑰對：
   ```bash
   ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
   ```
2. 把**公鑰**（`github_actions.pub`）內容加進 GCP Console → 中繼資料 → SSH 金鑰
3. 把**私鑰**（`github_actions`）內容存進 GitHub Secret `GCP_SSH_KEY`

### GitHub Secrets 清單

| Secret 名稱 | 說明 |
|-------------|------|
| `GCP_HOST` | VM 外部 IP，如 `35.222.136.176` |
| `GCP_USERNAME` | SSH 使用者名稱，如 `labibi_lg` |
| `GCP_SSH_KEY` | 上面產生的私鑰內容 |
| `CERTBOT_EMAIL` | Let's Encrypt 通知信箱 |
| `GH_CR_TOKEN` | GitHub PAT，用來登入 GHCR 拉 Docker image |

---

## Step 4：nginx 設定檔

路徑：`nginx/api.enpei.com.tw.conf`

```nginx
server {
    listen 80;
    server_name api.enpei.com.tw;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

> 只寫 HTTP（port 80）就好，Certbot 申請完 SSL 後會**自動把這個檔案升級成 HTTPS + redirect**。

---

## Step 5：首次手動設定 nginx + SSL

CD Pipeline 裡的 nginx/certbot 安裝需要 `sudo`，而 GitHub Actions SSH 連進去的使用者沒有 passwordless sudo 權限。

**解法：第一次用 GCP Console 的瀏覽器 SSH 手動執行一次：**

```bash
sudo apt-get update -qq
sudo apt-get install -y nginx certbot python3-certbot-nginx

sudo cp ~/nginx/api.enpei.com.tw.conf /etc/nginx/sites-available/api.enpei.com.tw
sudo ln -sf /etc/nginx/sites-available/api.enpei.com.tw /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx \
  -d api.enpei.com.tw \
  --non-interactive \
  --agree-tos \
  -m your@email.com \
  --redirect
```

成功後畫面會顯示：
```
Congratulations! You have successfully enabled HTTPS on https://api.enpei.com.tw
```

> Let's Encrypt 憑證 90 天到期，Certbot 安裝後會自動設 cron job 續期，不需要手動處理。

---

## Step 6：CD Pipeline 設計

**三段式部署流程：**

```
1. SCP 上傳檔案
   └── docker-compose.prod.yml
   └── nginx/api.enpei.com.tw.conf

2. SSH：Setup nginx + SSL（只在首次執行，憑證存在就跳過）
   └── 安裝 nginx, certbot
   └── 套用 nginx config
   └── certbot 申請 SSL

3. SSH：Deploy Docker 容器
   └── docker login ghcr.io
   └── 寫入 env.prod
   └── docker compose pull + up -d
   └── docker image prune
```

**關鍵設計：冪等性（Idempotent）**

```yaml
CERT_PATH="/etc/letsencrypt/live/api.enpei.com.tw/fullchain.pem"
if [ ! -f "$CERT_PATH" ]; then
  # 只有憑證不存在才執行安裝
fi
```

這樣設計讓 Step 2 在第一次之後永遠跳過，不會重複安裝。

---

## docker-compose.prod.yml 重點

```yaml
ports:
  - "127.0.0.1:3000:3000"  # 只綁定 localhost，不對外暴露
```

`127.0.0.1:3000` 而非 `0.0.0.0:3000`，確保外部無法直接訪問 3000 port，只能透過 nginx。

---

## 常見問題

### `ERR_CONNECTION_REFUSED`
- 防火牆沒開 port 80/443
- nginx 沒有安裝或沒有啟動
- nginx config 語法錯誤（`sudo nginx -t` 檢查）

### `ssh: handshake failed: unable to authenticate`
- SSH 公鑰沒有加進 GCP 元數據（GCP 會覆蓋 `authorized_keys`）
- Secret `GCP_SSH_KEY` 貼錯（多了空格或換行）

### `sudo: I'm sorry I can't do that`
- SSH 連進來的使用者沒有 passwordless sudo
- 解法：用 GCP Console 瀏覽器 SSH 手動執行需要 sudo 的指令

### DNS 沒有生效
- 等待時間不夠（最長 48 小時，通常 5～30 分鐘）
- 用 `nslookup api.enpei.com.tw 8.8.8.8` 確認是否已解析到正確 IP

---

## 驗證清單

- [ ] `nslookup api.enpei.com.tw` → 回傳 `35.222.136.176`
- [ ] `http://api.enpei.com.tw` → 自動跳轉到 `https://`
- [ ] `https://api.enpei.com.tw/swagger` → 正常顯示 Swagger UI
- [ ] 瀏覽器網址列有鎖頭圖示（憑證有效）
- [ ] CD Pipeline 推新版本 → 自動部署成功
