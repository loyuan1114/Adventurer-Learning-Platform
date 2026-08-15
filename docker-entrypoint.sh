#!/bin/sh
# 全新啟動（/app/data 是空 volume）時，把內建 seed 資料（管理員帳號、AI 金鑰、設定）補進去
mkdir -p /app/data
if [ ! -f /app/data/kv.json ]; then
  cp -r /app/seed/. /app/data/
  echo "✅ seed 資料已複製到 /app/data（含管理員帳號與 AI 金鑰）"
else
  echo "✅ data 已有資料，保留現有內容"
fi
exec "$@"