FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./
COPY public/ ./public/
COPY data/ ./data/
EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "server.js"]
