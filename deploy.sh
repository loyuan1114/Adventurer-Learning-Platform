#!/bin/bash
# ADV9 一鍵部署腳本（Linux / Mac）
# 自動安裝 Docker（如未安裝）→ 建置映像 → 啟動服務
# 用法：chmod +x deploy.sh && ./deploy.sh

set -e
PORT=8080

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
step(){ echo -e "\n${CYAN}=== $1 ===${NC}"; }
ok(){ echo -e "  ${GREEN}OK: $1${NC}"; }
bad(){ echo -e "  ${RED}ERROR: $1${NC}"; exit 1; }

# --- 1. 檢查 Docker ---
step "1/4 檢查 Docker"
if command -v docker &>/dev/null; then
  ok "Docker 已安裝: $(docker --version)"
else
  echo -e "  ${YELLOW}Docker 未安裝，正在自動安裝...${NC}"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  請先安裝 Docker Desktop for Mac:"
    echo "  https://www.docker.com/products/docker-desktop/"
    echo "  安裝後執行: open -a Docker"
    exit 1
  fi
  # Linux: 用官方腳本安裝
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  ok "Docker 已安裝，請執行: newgrp docker"
  echo -e "  ${YELLOW}然後再執行此腳本。${NC}"
  exit 0
fi

# 確認 docker compose 可用
docker compose version &>/dev/null || bad "需要 docker compose 插件"

# --- 2. 準備檔案 ---
step "2/4 準備檔案"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/server.js" ]; then
  PROJ_DIR="$SCRIPT_DIR"
elif [ -f "./server.js" ]; then
  PROJ_DIR="$(pwd)"
else
  bad "找不到 server.js，請將此腳本放在 adv9 目錄中"
fi
ok "專案目錄: $PROJ_DIR"
cd "$PROJ_DIR"

# --- 3. 建置 ---
step "3/4 建置 Docker 映像"
docker build -t adv9 . 2>&1
ok "映像建置完成"

# --- 4. 啟動 ---
step "4/4 啟動 ADV9 服務"
docker compose down 2>/dev/null || true
docker compose up -d 2>&1
sleep 3

if ss -tlnp 2>/dev/null | grep -q ":$PORT " || lsof -i :$PORT &>/dev/null; then
  ok "ADV9 已啟動！"
  echo -e "\n  ${GREEN}http://127.0.0.1:$PORT${NC}"
  echo "  管理員: adv9boss / admin123"
  echo "  停止: docker compose down"
  echo "  日誌: docker compose logs -f"
  # 嘗試開啟瀏覽器
  command -v xdg-open &>/dev/null && xdg-open "http://127.0.0.1:$PORT"
  command -v open &>/dev/null && open "http://127.0.0.1:$PORT"
else
  echo -e "  ${YELLOW}等待服務就緒...${NC}"
  sleep 5
  echo -e "  ${GREEN}http://127.0.0.1:$PORT${NC}"
fi
