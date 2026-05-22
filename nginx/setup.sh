#!/bin/bash
set -e

echo ">>> 安裝 Nginx 與 Certbot"
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

echo ">>> 建立前端靜態檔案目錄"
sudo mkdir -p /var/www/enpei.com.tw
sudo mkdir -p /var/www/admin.enpei.com.tw
sudo chown -R $USER:$USER /var/www/enpei.com.tw
sudo chown -R $USER:$USER /var/www/admin.enpei.com.tw

echo ">>> 複製 Nginx 設定"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
sudo cp "$SCRIPT_DIR"/*.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/enpei.com.tw.conf   /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/admin.enpei.com.tw.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/api.enpei.com.tw.conf  /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

echo ">>> 測試並啟動 Nginx"
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo ">>> 申請 SSL 憑證（Let's Encrypt）"
sudo certbot --nginx \
  -d enpei.com.tw \
  -d www.enpei.com.tw \
  -d admin.enpei.com.tw \
  -d api.enpei.com.tw \
  --agree-tos \
  --redirect

echo ">>> 確認憑證自動續約設定"
sudo systemctl is-enabled certbot.timer && echo "自動續約：已啟用" || echo "自動續約：未啟用，請手動確認"

echo ""
echo "完成！以下網址應該都可以 HTTPS 訪問："
echo "  https://enpei.com.tw"
echo "  https://www.enpei.com.tw"
echo "  https://admin.enpei.com.tw"
echo "  https://api.enpei.com.tw"
