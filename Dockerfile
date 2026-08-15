FROM node:20-bookworm-slim

# docx_extract.py 需要 python3（作業 PDF 文字擷取）
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 只複製必要檔案（.dockerignore 已排除備份檔）
COPY server.js docx_extract.py package.json ./
COPY public ./public
COPY media ./media

# seed 資料放獨立目錄；/app/data 用 volume 掛載，首次啟動時由 entrypoint 補種子
COPY data ./seed

EXPOSE 8080

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

CMD ["node", "server.js"]