# 學習清單：CICD → GCP → HTTPS 全流程知識點

> 從這次把 `http://35.222.136.176:3000` 升級到 `https://api.enpei.com.tw` 整理出的補強清單

---

## 網路基礎

- [ ] **DNS 解析流程**：瀏覽器輸入網址到拿到回應，中間發生了什麼
- [ ] **A Record、CNAME、TTL** 各自是什麼、什麼時候用哪個
- [ ] **TLS 握手流程**：HTTPS 連線建立的步驟
- [ ] **SSL 憑證**：瀏覽器為什麼信任它、CA 的角色
- [ ] **Let's Encrypt**：免費憑證怎麼運作（ACME 協定）

---

## Linux 基礎

- [ ] **sudo 權限模型**：誰能執行、`/etc/sudoers` 怎麼設定
- [ ] **systemctl**：start / stop / reload / status 管理服務
- [ ] **Linux 檔案系統結構**：`/etc/nginx/`、`/etc/letsencrypt/` 為什麼在那裡
- [ ] **軟連結 `ln -sf`**：是什麼、`sites-available` vs `sites-enabled` 的設計用意

---

## nginx

- [ ] **反向代理（Reverse Proxy）概念**：為什麼需要 nginx 而不是直接對外暴露 Express
- [ ] **`proxy_pass`**：怎麼把流量轉發到後端
- [ ] **`proxy_set_header`**：各個 header（X-Real-IP、X-Forwarded-For 等）的用途
- [ ] **certbot 自動修改 nginx config**：申請完 SSL 後 config 發生了什麼變化

---

## SSH

- [ ] **公鑰/私鑰非對稱加密原理**：為什麼私鑰不能外洩、公鑰可以公開
- [ ] **`authorized_keys` 運作方式**：SSH 連線時怎麼驗證
- [ ] **GCP OS Login**：和傳統 `authorized_keys` 的差異、為什麼 GCP 會覆蓋 authorized_keys

---

## Docker

- [ ] **Image vs Container 的差別**
- [ ] **docker-compose 多容器編排**：service 之間怎麼溝通
- [ ] **Port binding 資安差異**：`127.0.0.1:3000:3000` vs `0.0.0.0:3000:3000`
- [ ] **Container Registry（GHCR）**：image 的存放與拉取流程

---

## CI/CD

- [ ] **GitHub Actions 觸發機制**：`workflow_run`、`on: push` 等觸發條件
- [ ] **Secrets 管理**：為什麼金鑰不能寫在 yaml 裡、如何安全傳入
- [ ] **冪等性（Idempotency）**：部署腳本設計最重要的概念，同一段跑多次結果一樣

---

## 雲端基礎（GCP）

- [ ] **VM、防火牆規則、網路標記**：三者的關係
- [ ] **IAM 角色與權限模型**：Owner / Editor / 特定角色的差別
- [ ] **靜態 IP vs 動態 IP**：為什麼生產環境要綁定靜態 IP

---

## Cloudflare（進階）

> 可以立刻加，免費方案就夠用。把 DNS 託管到 Cloudflare，流量會先過 Cloudflare 再到 GCP VM。

- [ ] **Cloudflare 的角色**：CDN + DDoS 防護 + WAF + 隱藏真實 IP
- [ ] **Orange Cloud vs Grey Cloud**：代理模式 vs 僅 DNS 的差別
- [ ] **Cloudflare SSL 模式**：Flexible / Full / Full (Strict) 的差異與風險
- [ ] **把 GoDaddy DNS 託管到 Cloudflare**：Nameserver 指向怎麼改
- [ ] **Page Rules / Transform Rules**：設定 redirect、快取策略

---

## Kubernetes（進階）

> 現在規模用不到，但業界標配，值得作為學習目標。

- [ ] **為什麼需要 K8s**：docker-compose 的痛點（手動擴容、單點故障、零停機部署）
- [ ] **核心概念**：Pod、Deployment、Service、Ingress 各自的角色
- [ ] **Ingress**：K8s 裡 nginx 的對應角色，流量進入的入口
- [ ] **Rolling Update**：部署新版本時舊容器怎麼被替換、零停機怎麼實現
- [ ] **HPA（Horizontal Pod Autoscaler）**：根據流量自動增減 Pod 數量
- [ ] **kubectl 基本操作**：`apply`、`get`、`describe`、`logs`、`exec`

---

## 推薦學習資源

### 網路基礎
- [Cloudflare Learning Center](https://www.cloudflare.com/learning/) — DNS、HTTPS、TLS 解釋清楚，圖多，免費
- [MDN Web Docs — HTTP](https://developer.mozilla.org/zh-TW/docs/Web/HTTP) — 前端最熟悉的文件，HTTP/HTTPS 概念完整

### Linux 基礎
- [The Linux Command Line（免費線上版）](https://linuxcommand.org/tlcl.php) — 最推薦的 Linux 入門書
- [Linux Journey](https://linuxjourney.com/) — 互動式學習網站，適合從零開始

### nginx
- [nginx 官方 Beginner's Guide](https://nginx.org/en/docs/beginners_guide.html) — 短、精準
- 《NGINX Cookbook》by Derek DeJonghe（O'Reilly，搜尋書名即可）

### SSH
- 《SSH Mastery》by Michael Lucas（搜尋書名即可）— 薄薄一本，把 SSH 講透了

### Docker
- 《Docker Deep Dive》by Nigel Poulton（搜尋書名即可）— 最推薦，很薄、很好讀
- [TechWorld with Nana（YouTube）](https://www.youtube.com/@TechWorldwithNana) — Docker、CI/CD 系列影片品質高

### CI/CD
- [GitHub Actions 官方文件](https://docs.github.com/en/actions) — 直接看官方最準
- [TechWorld with Nana（YouTube）](https://www.youtube.com/@TechWorldwithNana) — CI/CD 系列完整

### GCP
- [Google Cloud Skills Boost](https://cloudskillsboost.google/) — Google 官方免費課程平台，有 lab 實作

### Cloudflare
- [Cloudflare Learning Center](https://www.cloudflare.com/learning/) — 官方教學，解釋自家產品原理
- [Cloudflare 官方文件](https://developers.cloudflare.com/) — 設定參考

### Kubernetes
- [Kubernetes 官方互動教學](https://kubernetes.io/docs/tutorials/kubernetes-basics/) — 免費，有 lab
- [TechWorld with Nana（YouTube）](https://www.youtube.com/@TechWorldwithNana) — K8s 完整系列，非常推薦
- 《Kubernetes in Action》by Marko Lukša（搜尋書名即可）— 最完整的 K8s 書

---

## 優先補強順序

1. DNS + HTTPS 原理（每個專案都會碰到）
2. Docker 基礎（現代開發標配）
3. CI/CD 設計（大幅提升開發效率）
4. nginx 反向代理（理解後端部署架構）
5. Linux 基礎（上面四個的底層）
6. **Cloudflare**（可立刻實作，免費，收益直接）
7. **Kubernetes**（長期學習目標，業界標配）
