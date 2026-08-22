# 🎮 Adventurer Learning Platform / 冒險者學習平台

A gamified learning platform: quiz adventures, card-based character development, guild battles, homework assignment, AI assistants, and social interaction. **Single Node.js server + Argon2 password hashing.**

把課業變成冒險遊戲的學習平台：答題冒險、抽卡養成、公會對戰、作業發布、AI 助理、社群互動。**單一 Node.js 伺服器、Argon2 密碼雜湊**。

- **Password security / 密碼安全**: Argon2id hashing (falls back to scrypt if `argon2` is unavailable)
- **Docker one-click deploy / Docker 一鍵部署**: Any Linux / macOS / Windows
- **All data stays local / 資料皆留在本機**: Accounts, settings, AI keys in `data/`, `media/`
- **Default admin / 預設管理員**: `adv9boss` / `admin123` (**change password on first login** / 首次登入請改密碼)

---

## 📸 Screenshots / 畫面截圖

### 管理員後台 / Admin Panel
![管理員後台](docs/screenshots/admin.png)

### 學生主頁 / Student Home
![學生主頁](docs/screenshots/student-home.png)

### 學生功能總覽 / Student Features
![學生功能](docs/screenshots/student-features.png)

### 老師工作台 / Teacher Dashboard
![老師工作台](docs/screenshots/teacher.png)

---

## ✨ Features / 功能特色

| Feature | Description / 說明 |
|---------|-------------|
| 🎯 Quiz Adventure / 問答冒險 | Answer questions to progress through dungeons, earn XP and loot |
| 🃏 Card Collection / 卡牌收藏 | Character, pet, and anime card gacha system |
| ⚔️ Guild Wars / 公會戰 | Team battles, territory control, class competitions |
| 📝 Homework / 作業 | Teachers assign work, AI-powered weak point analysis |
| 🤖 AI Assistant / AI 助手 | Multi-provider (Gemini/OpenAI/DeepSeek/Qwen/Kimi/Ollama) |
| 🌍 Language Learning / 語言學習 | 211 languages with AI-generated vocabulary quizzes |
| 💻 Code Sandbox / 程式沙盒 | Python, C++, Java, CaoMang, BingZhengZheng execution |
| ⚙️ C++ Black Box / C++ 黑盒 | Cultivation battle simulation & loot generation computed by a compiled C++ black box |
| 🎨 Pixel Art / 像素畫 | Collaborative pixel art gallery |
| 🎵 Background Music / 背景音樂 | Admin-managed MP3/YouTube music player |
| 💬 Chat & Social / 聊天與社交 | Friends, groups, mail, story posting |
| 📊 AI 學情稽核 / AI Audit | Teacher dashboard with AI-powered student behavior analysis |
| 🗡️ Rogue-like / 個人冒險 | Each player's adventure path is unique |
| 📝 Notes & Flashcards / 筆記寶庫 | Note-taking, flashcards, spaced repetition, exam planning |
| 🧪 Forge & Equipment / 鍛造裝備 | Crafting system with quality tiers and material gathering |
| 🏰 Territory / 領土征服 | Cross-subject conquest battles with reward multipliers |
| 🗣️ AI 導師 / AI Tutor | Personalized tutoring based on your notes and progress |

---

## 🤖 AI Reviews / AI 評價

Multiple AI models have independently evaluated this platform against major education platforms (PaGamO, Cool English, 均一教育平台). Below is a summary.

### DeepSeek 評價

> **5 大核心差異**
> 1. **開源可自架** — 不同於 PaGamO/酷英/均一的雲端 SaaS，可完全自主部署、掌握資料
> 2. **遊戲化深度** — 抽卡養成 + 公會戰 + 職業競賽，遊戲機制比 PaGamO 更豐富多元
> 3. **多模型 AI 整合** — 支援 6 種以上 AI 提供商，遠超酷英的單一 AI 方案
> 4. **程式碼沙盒** — 內建 Python/C++/Java 執行環境，是唯一同時具備遊戲化 + 程式實作的平台
> 5. **211 種語言學習** — 語言覆蓋範圍遠超酷英（僅英語）與均一（主要中英數理）

> ⭐⭐⭐⭐⭐ **推薦給技術玩家、自架愛好者**：開源、可完全掌控資料與功能；遊戲化機制最完整；支援多種 AI 模型；內建程式沙盒。

### Qwen 評價

> | 目標受眾 | 推薦平台 | 推薦程度 |
> |---------|---------|---------|
> | 創新實驗教育機構 / 資訊科教師 / 教學研究團隊 | Adventurer-Learning-Platform | ⭐⭐⭐⭐⭐ 極高 |
> | 自學者 / 程式開發者 / 重度遊戲愛好者 | Adventurer-Learning-Platform | ⭐⭐⭐⭐ 高 |

> **優勢**：極致客製化、隱私與 AI 整合（支援 Ollama 本地部署）、跨領域整合（內建程式沙盒非常適合資訊科或創客課程）。

### Claude 評價

> **與 PaGamO / 均一 / 酷英網完整比較**
>
> | 維度 | 冒險者學習平台 | PaGamO | 均一 | 酷英網 |
> |------|------------|--------|------|-------|
> | 遊戲化強度 | ★★★★★ 極高 | ★★★★ 高 | ★★ 中等 | ★★★ 中等 |
> | AI 功能 | ★★★★★ 多模型 | ★ 無 | ★ 無 | ★★★★ 語音強 |
> | 客製化彈性 | ★★★★★ 極高 | ★ 低 | ★ 低 | ★ 低 |
> | 資料主權 | ★★★★★ 自管 | ★★★ 代管 | ★★★ 代管 | ★★★★ 政府 |
> | 社群互動 | ★★★★★ 強 | ★★★★ 中 | ★ 弱 | ★ 弱 |
> | 程式學習 | ★★★★★ 沙盒 | ✗ 無 | ★★★ 電腦課 | ✗ 無 |

---

## 🚀 Deployment / 部署方法

### Option 1: GitHub Codespaces (Free / 免費)

前往儲存庫 → **Code → Codespaces → Create codespace on main**，然後貼上:

```bash
[ -f adv9_public.tgz ] || curl -sL https://raw.githubusercontent.com/loyuan1114/Adventurer-Learning-Platform/main/adv9_public.tgz -o adv9_public.tgz; mkdir -p adv9 && tar xzf adv9_public.tgz -C adv9 && cd adv9 && docker compose up -d --build
```

Then: **Ports** panel → 8080 → Right-click → **Port Visibility → Public** → Open 🌐

### Option 2: VPS (Ubuntu/Debian)

```bash
command -v docker >/dev/null 2>&1 || curl -fsSL https://get.docker.com | sh; docker compose version >/dev/null 2>&1 || sudo apt-get install -y docker-compose-plugin; [ -f adv9_public.tgz ] || curl -sL https://raw.githubusercontent.com/loyuan1114/Adventurer-Learning-Platform/main/adv9_public.tgz -o adv9_public.tgz; mkdir -p adv9 && tar xzf adv9_public.tgz -C adv9 && cd adv9 && docker compose up -d --build
```

Open `http://your-ip:8080` (allow port 8080 in firewall/security group).

### Option 3: Direct Node.js (No Docker)

```bash
git clone https://github.com/loyuan1114/Adventurer-Learning-Platform.git
cd Adventurer-Learning-Platform
npm install          # installs argon2 (optional: falls back to scrypt)
g++ -O2 -std=c++17 calc_blackbox.cpp -o calc_blackbox   # compile C++ black box (simulation/loot)
node server.js
```

Requires **Node.js 18+** (Node 20+ recommended for Argon2) and **g++** (for the C++ black box). Python 3 optional (for document import).

### Option 4: macOS / Windows

- **macOS**: `brew install --cask docker` → Docker Desktop → run Option 1 command
- **Windows**: `winget install Docker.DockerDesktop` → Docker Desktop → run Option 1 command

---

## 🌐 GitHub Pages (Static Full-Game Demo)

GitHub Pages serves the **entire `public/` folder** as a fully static site. Because the frontend stores everything in `localStorage`, the **complete game runs offline in single-admin mode** without any backend.

**Live demo**: `https://loyuan1114.github.io/Adventurer-Learning-Platform/`

**GitHub Pages account**:

| Role | Username | Password |
|------|----------|----------|
| 管理員 / Master admin | `adv9boss` | `admin123` |

> ⚠️ 請在第一次登入後立即變更密碼（帳號頁）。Pages 版資料只存於該瀏覽器的 `localStorage`，清除瀏覽器資料會清空進度。

How it works:

1. The `index.html` on GitHub Pages auto-detects `github.io` and runs in **offline single-admin mode** (`SUPA_ON = false`).
2. All data is stored in the browser's `localStorage`.
3. Optionally, you can set an **API server address** (設定 → API 伺服器位址) to connect to your VPS for shared data.
4. Deployment is automatic via GitHub Actions (`deploy-pages`) on every push to `main`.

Deploy to your own Pages:

1. Fork this repository
2. Keep the built-in GitHub Actions workflow (`.github/workflows/pages.yml`) — it deploys on every push to `main`
3. Your demo is live at `https://your-username.github.io/Adventurer-Learning-Platform/`

> ⚠️ GitHub Pages only serves static files. Multi-user shared data requires a VPS backend.

---

## 🛠️ Admin Settings / 管理員設定

| Setting | Description |
|---------|-------------|
| Default account | `adv9boss` / `admin123` |
| Password hashing | Argon2id (or scrypt fallback) |
| Change password | Login → Account page |
| AI keys | Login → Admin → **API 金鑰管理** |
| AI Provider | Login → Admin → **AI 端點** (Gemini/OpenAI/DeepSeek/Qwen/Kimi/Ollama) |
| Music upload | Login → Settings → **背景音樂** → Admin upload block |
| Socratic prompts | Login → Admin → **蘇格拉底設定** |

---

## 🤖 Local AI (Ollama, Free / 免費本機 AI)

Run AI entirely on your server with no API keys:

```bash
curl -fsSL https://ollama.com/install.sh | sh && ollama pull huihui_ai/qwen2.5-vl-abliterated:7b
```

Then: Admin → **AI 端點** → Add → Provider: Ollama → Model: `qwen2.5-vl-abliterated:7b` → Key: `http://127.0.0.1:11434`

---

## 📁 Data & Backup / 資料與備份

```
data/    Accounts, settings, AI keys, homework, chat logs (JSON files)
media/   Uploaded photos, videos, music
```

- **Upgrade without losing data**: `docker compose down` then `up -d --build`
- **Full backup**: `tar czf backup.tgz data media`
- **Restore**: Extract backup → `docker compose restart`

---

## 🗑️ Uninstall / 刪除與卸載

- **Stop (keep data)**: `cd adv9 && docker compose down`
- **Delete everything**: `docker compose down; cd ..; rm -rf adv9 adv9_public.tgz`
- **Backup first**: `tar czf backup.tgz data media` before deleting

---

## 📜 License / 開源授權

**AGPL-3.0-or-later** (see `LICENSE`). If you modify and run this software as a network service, you must provide the source code to users.

---

## 🔍 AI / Tool Call Disclosure / AI 呼叫揭露

| Function | Provider | Data Flow |
|----------|----------|-----------|
| 🤖 Auto Quiz | Your configured provider | Question request → Provider → Quiz returned |
| 📊 Weak Analysis | Same (default: Ollama local) | Error stats → Provider → Teaching suggestions |
| 💬 AI Comments | Same | Student name, grades → Provider |
| 🔤 Fonts | Google Fonts | Browser loads font files |
| 🖼 Thumbnails | Bing | Search thumbnails loaded |

> See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for full list. **Only Ollama local mode** keeps data entirely on your server.

---

## 📸 Photo Policy (CC0 / 圖片授權)

All photos are **CC0 Public Domain**. Uploading photos implies consent to CC0 licensing. Use CC0 sources (Pixabay/Unsplash/Wikimedia Commons) for built-in backgrounds.

---

## ❓ FAQ / 常見問題

- **Port 8080 not accessible?** Allow port 8080 in your firewall/security group.
- **How to update?** Download latest release, extract over old (keep `data/` and `media/`), run `docker compose up -d --build`.
- **No Docker?** Run `node server.js` directly (Node.js 18+ required, `npm install` first for Argon2).
