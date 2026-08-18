# 🎮 Adventurer Learning Platform / 冒險者學習平台

A gamified learning platform: quiz adventures, card-based character development, guild battles, homework assignment, AI assistants, and social interaction. **Single Node.js server, zero npm dependencies.**

把課業變成冒險遊戲的學習平台：答題冒險、抽卡養成、公會對戰、作業發布、AI 助理、社群互動。**單一 Node.js 伺服器、零 npm 套件依賴**。

- **No installation required**: GitHub Codespaces ready out of the box
- **Docker one-click deploy**: Any Linux / macOS / Windows
- **All data stays local**: Accounts, settings, AI keys in `data/`, `media/`
- **Default admin**: `adv9boss` / `admin123` (**change password on first login**)

---

## ✨ Features / 功能特色

| Feature | Description |
|---------|-------------|
| 🎯 Quiz Adventure | Answer questions to progress through dungeons, earn XP and loot |
| 🃏 Card Collection | Character, pet, and anime card gacha system |
| ⚔️ Guild Wars | Team battles, territory control, class competitions |
| 📝 Homework | Teachers assign work, AI-powered weak point analysis |
| 🤖 AI Assistant | Multi-provider (Gemini/OpenAI/DeepSeek/Qwen/Kimi/Ollama) |
| 🌍 Language Learning | 211 languages with AI-generated vocabulary quizzes |
| 💻 Code Sandbox | Python, C++, Java, CaoMang, BingZhengZheng execution |
| 🎨 Pixel Art | Collaborative pixel art gallery |
| 🎵 Background Music | Admin-managed MP3/YouTube music player |
| 💬 Chat & Social | Friends, groups, mail, story posting |

---

## 🚀 Deployment / 部署方法

### Option 1: GitHub Codespaces (Free)

Go to repo → **Code → Codespaces → Create codespace on main**, then paste:

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
node server.js
```

Requires Node.js 18+. Python 3 optional (for document import).

### Option 4: macOS / Windows

- **macOS**: `brew install --cask docker` → Docker Desktop → run Option 1 command
- **Windows**: `winget install Docker.DockerDesktop` → Docker Desktop → run Option 1 command

---

## 🌐 GitHub Pages (Static Frontend Demo)

The full app requires a Node.js backend. For a **static demo** that connects to your VPS backend:

1. Fork this repository
2. Go to **Settings → Pages → Source**: Select `main` branch, `/ (root)` folder
3. The static frontend will be available at `https://loyuan1114.github.io/Adventurer-Learning-Platform/public/index.html`
4. In the app, go to **Settings → API 金鑰管理** and set the API endpoint to your VPS URL

> ⚠️ GitHub Pages only serves static files. Login and data require a running backend server.

---

## 🛠️ Admin Settings / 管理員設定

| Setting | Description |
|---------|-------------|
| Default account | `adv9boss` / `admin123` |
| Change password | Login → Account page |
| AI keys | Login → Admin → **API 金鑰管理** |
| AI Provider | Login → Admin → **AI 端點** (Gemini/OpenAI/DeepSeek/Qwen/Kimi/Ollama) |
| Music upload | Login → Settings → **背景音樂** → Admin upload block |
| Socratic prompts | Login → Admin → **蘇格拉底設定** (templates for AI hinting) |

---

## 🤖 Local AI (Ollama, Free)

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

**AGPL-3.0-or-later**（見 `LICENSE`）。

**AGPL-3.0-or-later** (see `LICENSE`). If you modify and run this software as a network service, you must provide the source code to users.

如果你修改此軟體並透過網路提供服務，必須向使用者提供原始碼。

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

## 📸 Photo Policy (CC0)

All photos are **CC0 Public Domain**. Uploading photos implies consent to CC0 licensing. Use CC0 sources (Pixabay/Unsplash/Wikimedia Commons) for built-in backgrounds.

---

## ❓ FAQ

- **Port 8080 not accessible?** Allow port 8080 in your firewall/security group.
- **How to update?** Download latest release, extract over old (keep `data/` and `media/`), run `docker compose up -d --build`.
- **No Docker?** Run `node server.js` directly (Node.js 18+ required).
