# Nginx + HTTPS 設定指南

> 在 GCP VM 上架設 Nginx 反向代理，並透過 Let's Encrypt 取得免費 SSL 憑證。
> 這份文件的操作只需要做**一次**。

---

## 架構說明

```
外部請求
  ├── https://enpei.com.tw        → Nginx → /var/www/enpei.com.tw （前台靜態檔）
  ├── https://www.enpei.com.tw    → 同上
  ├── https://admin.enpei.com.tw  → Nginx → /var/www/admin.enpei.com.tw （後台靜態檔）
  └── https://api.enpei.com.tw    → Nginx → localhost:3000 （Docker 容器）
```

Nginx 直接裝在 VM 上（不走 Docker），作為所有流量的入口。
port 3000 只對 127.0.0.1 開放，外部無法直接訪問後端。

---

## Step 1：GoDaddy 新增 DNS 記錄

進入 GoDaddy → My Products → enpei.com.tw → DNS，新增以下四筆 A record：

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `35.222.136.176` | 600 秒 |
| A | `www` | `35.222.136.176` | 600 秒 |
| A | `admin` | `35.222.136.176` | 600 秒 |
| A | `api` | `35.222.136.176` | 600 秒 |

> `@` 代表根網域（enpei.com.tw 本身）。
> DNS 傳播需要幾分鐘到幾小時，可用 `nslookup enpei.com.tw` 確認是否已生效。

---

## Step 2：GCP 開放防火牆 Port 80 & 443

前往 GCP Console → VPC Network → Firewall → **Create Firewall Rule**：

| 欄位 | 值 |
|------|------|
| Name | `allow-http-https` |
| Direction | Ingress |
| Action | Allow |
| Targets | All instances in the network |
| Source IP ranges | `0.0.0.0/0` |
| Protocols and ports | TCP: `80, 443` |

> 沒有開 80 的話 Let's Encrypt 無法驗證網域所有權，SSL 申請會失敗。

---

## Step 3：在 GCP VM 上執行安裝腳本

DNS 生效後，SSH 進 VM，把 `nginx/` 資料夾傳過去並執行：

```bash
# 在本機執行：把 nginx 資料夾複製到 VM
scp -r -i ~/.ssh/你的私鑰 ./nginx/ 你的帳號@35.222.136.176:~/nginx/

# SSH 進 VM
ssh -i ~/.ssh/你的私鑰 你的帳號@35.222.136.176

# 在 VM 上執行安裝腳本
cd ~/nginx
chmod +x setup.sh
./setup.sh
```

腳本會依序完成：
1. 安裝 Nginx 和 Certbot
2. 建立前端靜態檔目錄
3. 套用三個子網域的 Nginx 設定
4. 申請 SSL 憑證（certbot 會自動把 HTTP 設定改成 HTTPS）
5. 確認憑證自動續約設定

---

## Step 4：部署前端靜態檔

Angular build 後把 `dist/` 資料夾傳到 VM 對應目錄：

```bash
# 前台前端（在前端專案目錄執行）
ng build --configuration production
scp -r -i ~/.ssh/你的私鑰 dist/瀏覽器目錄/ 你的帳號@35.222.136.176:/var/www/enpei.com.tw/

# 後台前端（同上）
ng build --configuration production
scp -r -i ~/.ssh/你的私鑰 dist/瀏覽器目錄/ 你的帳號@35.222.136.176:/var/www/admin.enpei.com.tw/
```

---

## 完成後確認

| 網址 | 預期結果 |
|------|---------|
| `https://enpei.com.tw` | 前台 Angular App |
| `https://www.enpei.com.tw` | 同上 |
| `https://admin.enpei.com.tw` | 後台 Angular App |
| `https://api.enpei.com.tw/swagger` | Swagger API 文件 |
| `http://35.222.136.176:3000` | 無法連線（port 已鎖住） |

---

## 常見問題

### certbot 申請失敗：DNS 未生效

```
Could not resolve host: enpei.com.tw
```

代表 DNS 還沒傳播，等幾分鐘後用 `nslookup enpei.com.tw` 確認，再重跑：

```bash
sudo certbot --nginx -d enpei.com.tw -d www.enpei.com.tw -d admin.enpei.com.tw -d api.enpei.com.tw
```

### 憑證更新

Let's Encrypt 憑證 90 天到期，Certbot 會自動續約。手動測試續約：

```bash
sudo certbot renew --dry-run
```

### 更新 Nginx 設定後重新載入

```bash
sudo nginx -t          # 測試設定有沒有錯誤
sudo systemctl reload nginx  # 不中斷服務重新載入
```

### 查看 Nginx 錯誤 log

```bash
sudo tail -f /var/log/nginx/error.log
```
