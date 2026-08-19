# 🎮 Adventurer Learning Platform / 冒險者學習平台

A gamified learning platform: quiz adventures, card-based character development, guild battles, homework assignment, AI assistants, and social interaction. **Single Node.js server + Argon2 password hashing.**

把課業變成冒險遊戲的學習平台：答題冒險、抽卡養成、公會對戰、作業發布、AI 助理、社群互動。**單一 Node.js 伺服器、Argon2 密碼雜湊**。

- **Password security / 密碼安全**: Argon2id hashing (falls back to scrypt if `argon2` is unavailable)（Argon2id 雜湊，若無 `argon2` 則回退 scrypt）
- **Docker one-click deploy / Docker 一鍵部署**: Any Linux / macOS / Windows（支援任何 Linux／macOS／Windows）
- **All data stays local / 資料皆留在本機**: Accounts, settings, AI keys in `data/`, `media/`（帳號、設定、AI 金鑰存於 `data/`、`media/`）
- **Default admin / 預設管理員**: `adv9boss` / `admin123` (**change password on first login** / 首次登入請改密碼)

---

## ✨ Features / 功能特色

| Feature | Description / 說明 |
|---------|-------------|
| 🎯 Quiz Adventure / 問答冒險 | Answer questions to progress through dungeons, earn XP and loot（答題闖關地下城、累積經驗與掉落） |
| 🃏 Card Collection / 卡牌收藏 | Character, pet, and anime card gacha system（角色、寵物、動漫卡抽取系統） |
| ⚔️ Guild Wars / 公會戰 | Team battles, territory control, class competitions（團隊對戰、領地爭奪、職業競賽） |
| 📝 Homework / 作業 | Teachers assign work, AI-powered weak point analysis（教師派作業、AI 弱點分析） |
| 🤖 AI Assistant / AI 助手 | Multi-provider (Gemini/OpenAI/DeepSeek/Qwen/Kimi/Ollama)（多供應商） |
| 🌍 Language Learning / 語言學習 | 211 languages with AI-generated vocabulary quizzes（211 種語言、AI 生成單字測驗） |
| 💻 Code Sandbox / 程式沙盒 | Python, C++, Java, CaoMang, BingZhengZheng execution（執行） |
| ⚙️ C++ Black Box / C++ 黑盒 | Cultivation battle simulation & loot generation computed by a compiled C++ black box (`calc_blackbox.cpp`), served by the main server（修練場模擬與掉落由編譯後的 C++ 黑盒計算，由主伺服器提供） |
| 🎨 Pixel Art / 像素畫 | Collaborative pixel art gallery（協作像素畫廊） |
| 🎵 Background Music / 背景音樂 | Admin-managed MP3/YouTube music player（管理員管理之 MP3／YouTube 播放器） |
| 💬 Chat & Social / 聊天與社交 | Friends, groups, mail, story posting（好友、群組、郵件、貼文） |

---

## 🚀 Deployment / 部署方法

### Option 1: GitHub Codespaces (Free / 免費)

前往儲存庫 → **Code → Codespaces → Create codespace on main**，然後貼上（前往 repo → **Code → Codespaces → Create codespace on main**, then paste）:

```bash
[ -f adv9_public.tgz ] || curl -sL https://raw.githubusercontent.com/loyuan1114/Adventurer-Learning-Platform/main/adv9_public.tgz -o adv9_public.tgz; mkdir -p adv9 && tar xzf adv9_public.tgz -C adv9 && cd adv9 && docker compose up -d --build
```

Then: **Ports** panel → 8080 → Right-click → **Port Visibility → Public** → Open 🌐
（接著：**Ports** 面板 → 8080 → 右鍵 → **Port Visibility → Public** → 開啟 🌐）

### Option 2: VPS (Ubuntu/Debian)

```bash
command -v docker >/dev/null 2>&1 || curl -fsSL https://get.docker.com | sh; docker compose version >/dev/null 2>&1 || sudo apt-get install -y docker-compose-plugin; [ -f adv9_public.tgz ] || curl -sL https://raw.githubusercontent.com/loyuan1114/Adventurer-Learning-Platform/main/adv9_public.tgz -o adv9_public.tgz; mkdir -p adv9 && tar xzf adv9_public.tgz -C adv9 && cd adv9 && docker compose up -d --build
```

Open `http://your-ip:8080` (allow port 8080 in firewall/security group).
開啟 `http://你的IP:8080`（請在防火牆／安全群組放行 8080 埠）。

### Option 3: Direct Node.js (No Docker)

```bash
git clone https://github.com/loyuan1114/Adventurer-Learning-Platform.git
cd Adventurer-Learning-Platform
npm install          # installs argon2 (optional: falls back to scrypt)
g++ -O2 -std=c++17 calc_blackbox.cpp -o calc_blackbox   # compile C++ black box (simulation/loot)
node server.js
```

Requires **Node.js 18+** (Node 20+ recommended for Argon2) and **g++** (for the C++ black box). Python 3 optional (for document import).
需要 **Node.js 18+**（Argon2 建議 Node 20+）與 **g++**（用於 C++ 黑盒）。Python 3 為選用（用於文件匯入）。

### Option 4: macOS / Windows

- **macOS**: `brew install --cask docker` → Docker Desktop → run Option 1 command（執行選項 1 指令）
- **Windows**: `winget install Docker.DockerDesktop` → Docker Desktop → run Option 1 command（執行選項 1 指令）

---

## 🌐 GitHub Pages (Static Full-Game Demo)

GitHub Pages serves the **entire `public/` folder** as a fully static site. Because the frontend stores everything in `localStorage`, the **complete game runs offline in single-admin mode** without any backend — no server needed to try it.

**Live demo**: `https://loyuan1114.github.io/Adventurer-Learning-Platform/`
(The CI workflow deploys `public/*` to the site root — the game is served directly at the root URL.)

**GitHub Pages account**:

| Role | Username | Password |
|------|----------|----------|
| 管理員 / Master admin | `adv9boss` | `admin123` |

> ⚠️ 請在第一次登入後立即變更密碼（帳號頁）。Pages 版資料只存於該瀏覽器的 `localStorage`，清除瀏覽器資料會清空進度。
> ⚠️ Please change the password immediately after first login (Account page). The Pages version keeps all data in that browser's `localStorage`; clearing browser data wipes progress.

How it works / 運作方式:

1. The `index.html` on GitHub Pages auto-detects `github.io` and runs in **offline single-admin mode** (`SUPA_ON = false`).
2. All data is stored in the browser's `localStorage`.
3. Optionally, you can set an **API server address** (設定 → API 伺服器位址) to connect to your VPS for shared data.
4. Deployment is automatic via GitHub Actions (`deploy-pages`) on every push to `main`.

Deploy to your own Pages / 自行部屬:

1. Fork this repository
2. Keep the built-in GitHub Actions workflow (`.github/workflows/pages.yml`) — it deploys on every push to `main`
3. Your demo is live at `https://your-username.github.io/Adventurer-Learning-Platform/`

> ⚠️ GitHub Pages only serves static files. Multi-user shared data requires a VPS backend.
> ⚠️ GitHub Pages 只提供靜態檔案。若要多人共用資料，請設定 VPS 後端位址。

---

## 🛠️ Admin Settings / 管理員設定

| Setting / 設定 | Description / 說明 |
|---------|-------------|
| Default account / 預設帳號 | `adv9boss` / `admin123` |
| Password hashing / 密碼雜湊 | Argon2id (or scrypt fallback / 或 scrypt 備援) |
| Change password / 變更密碼 | Login → Account page（登入 → 帳號頁） |
| AI keys / AI 金鑰 | Login → Admin → **API 金鑰管理** |
| AI Provider / AI 端點 | Login → Admin → **AI 端點** (Gemini/OpenAI/DeepSeek/Qwen/Kimi/Ollama) |
| Music upload / 音樂上傳 | Login → Settings → **背景音樂** → Admin upload block |
| Socratic prompts / 蘇格拉底設定 | Login → Admin → **蘇格拉底設定** (templates for AI hinting / 提示範本) |

---

## 🤖 Local AI (Ollama, Free / 免費本機 AI)

Run AI entirely on your server with no API keys:
不需任何 API 金鑰，即可在你的伺服器上完全本機運行 AI：

```bash
curl -fsSL https://ollama.com/install.sh | sh && ollama pull huihui_ai/qwen2.5-vl-abliterated:7b
```

Then: Admin → **AI 端點** → Add → Provider: Ollama → Model: `qwen2.5-vl-abliterated:7b` → Key: `http://127.0.0.1:11434`
設定：管理員 → **AI 端點** → 新增 → Provider: Ollama → Model: `qwen2.5-vl-abliterated:7b` → Key: `http://127.0.0.1:11434`

---

## 📁 Data & Backup / 資料與備份

```
data/    Accounts, settings, AI keys, homework, chat logs (JSON files) / 帳號、設定、AI 金鑰、作業、聊天紀錄
media/   Uploaded photos, videos, music / 上傳的照片、影片、音樂
```

- **Upgrade without losing data / 不遺失資料的升級**: `docker compose down` then `up -d --build`
- **Full backup / 完整備份**: `tar czf backup.tgz data media`
- **Restore / 還原**: Extract backup → `docker compose restart`（解壓備份 → 重新啟動）

---

## 🗑️ Uninstall / 刪除與卸載

- **Stop (keep data)**: `cd adv9 && docker compose down`（停止但保留資料）
- **Delete everything**: `docker compose down; cd ..; rm -rf adv9 adv9_public.tgz`（完整刪除）
- **Backup first**: `tar czf backup.tgz data media` before deleting（刪除前請先備份）

---

## 📜 License / 開源授權

**AGPL-3.0-or-later**（見 `LICENSE`）。

**AGPL-3.0-or-later** (see `LICENSE`). If you modify and run this software as a network service, you must provide the source code to users.

如果你修改此軟體並透過網路提供服務，必須向使用者提供原始碼。

---

## 🔍 AI / Tool Call Disclosure / AI 呼叫揭露

| Function / 功能 | Provider / 供應商 | Data Flow / 資料流向 |
|----------|----------|-----------|
| 🤖 Auto Quiz / 自動出題 | Your configured provider（你設定的供應商） | Question request → Provider → Quiz returned（出題請求 → 供應商 → 回傳題目） |
| 📊 Weak Analysis / 弱點分析 | Same (default: Ollama local)（預設本機 Ollama） | Error stats → Provider → Teaching suggestions（錯誤統計 → 供應商 → 教學建議） |
| 💬 AI Comments / AI 評論 | Same（同左） | Student name, grades → Provider（學生姓名、成績 → 供應商） |
| 🔤 Fonts / 字型 | Google Fonts | Browser loads font files（瀏覽器載入字型檔） |
| 🖼 Thumbnails / 縮圖 | Bing | Search thumbnails loaded（載入搜尋縮圖） |

> See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for full list. **Only Ollama local mode** keeps data entirely on your server.（完整清單請見此檔。**僅本機 Ollama 模式**能讓資料完全留在你的伺服器。）

---

## 📸 Photo Policy (CC0 / 圖片授權)

All photos are **CC0 Public Domain**. Uploading photos implies consent to CC0 licensing. Use CC0 sources (Pixabay/Unsplash/Wikimedia Commons) for built-in backgrounds.
所有圖片皆為 **CC0 公有領域**。上傳圖片即表示同意 CC0 授權。內建背景請使用 CC0 來源（Pixabay／Unsplash／Wikimedia Commons）。

---

## ❓ FAQ / 常見問題

- **Port 8080 not accessible?** Allow port 8080 in your firewall/security group.（8080 埠無法連線？請在防火牆／安全群組放行 8080 埠。）
- **How to update?** Download latest release, extract over old (keep `data/` and `media/`), run `docker compose up -d --build`.（如何更新？下載最新版本覆蓋舊檔，保留 `data/` 與 `media/`，再執行 `docker compose up -d --build`。）
- **No Docker?** Run `node server.js` directly (Node.js 18+ required, `npm install` first for Argon2).（沒有 Docker？可直接執行 `node server.js`，需 Node.js 18+，先 `npm install` 以取得 Argon2。）
