<p align="center">
  <img src="https://raw.githubusercontent.com/loyuan1114/Adventurer-Learning-Platform/main/docs/screenshots/banner.png" width="640" alt="ADV9 Banner">
</p>

<h1 align="center">ADV9</h1>
<p align="center"><strong>Adventurer Learning Platform</strong><br><sub>A gamified learning platform with AI, code sandbox, and RPG progression</sub></p>

<p align="center">
  <a href="#installation"><kbd>Installation</kbd></a>
  <span>&nbsp;·&nbsp;</span>
  <a href="#features"><kbd>Features</kbd></a>
  <span>&nbsp;·&nbsp;</span>
  <a href="#demo"><kbd>Live Demo</kbd></a>
  <span>&nbsp;·&nbsp;</span>
  <a href="#deployment"><kbd>Deployment</kbd></a>
  <span>&nbsp;·&nbsp;</span>
  <a href="#license"><kbd>License</kbd></a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/v/release/loyuan1114/Adventurer-Learning-Platform?style=flat-square" alt="Release">
  <img src="https://img.shields.io/github/downloads/loyuan1114/Adventurer-Learning-Platform/total?style=flat-square" alt="Downloads">
  <img src="https://img.shields.io/github/license/loyuan1114/Adventurer-Learning-Platform?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=flat-square" alt="Node.js">
</p>

---

## Overview

ADV9 transforms academic subjects into an RPG adventure. Students answer questions to progress through dungeons, collect cards, forge equipment, and compete in guild battles — all while teachers get AI-powered analytics and students get personalized learning paths.

<strong>ADV9 把課業變成冒險遊戲。</strong>學生答題推進地牢、收集卡牌、鍛造裝備、公會對戰；老師獲得 AI 學情分析，學生獲得個人化學習路徑。

### Quick Stats

| Metric | Value |
|--------|-------|
| Subjects | Math, Chinese, English, Science, Social, Code, 211 Languages |
| AI Providers | Gemini, OpenAI, DeepSeek, Qwen, Kimi, Ollama (local) |
| Code Sandbox | Python, C++, Java |
| Data Storage | Local JSON / Optional Supabase |
| Deployment | Docker, VPS, GitHub Pages, Local |

---

## Installation / 安裝

### Option 1: Desktop Installer (Recommended) / 桌面安裝器（推薦）

Download the installer for your platform from [Releases](../../releases/latest) and double-click.

| File | Platform | Size |
|------|----------|------|
| `adv9-installer-windows-x64.exe` | Windows 64-bit | 7.5 MB |
| `adv9-installer-windows-x86.exe` | Windows 32-bit | 6.6 MB |
| `adv9-installer-windows-arm64.exe` | Windows ARM | 6.8 MB |
| `adv9-installer-mac-arm64` | macOS Apple Silicon | 8.5 MB |
| `adv9-installer-mac-x64` | macOS Intel | 8.8 MB |
| `adv9-installer-linux-x64` | Linux 64-bit | 19.0 MB |

**What the installer does / 安裝器會自動：**
1. Install Docker (if not present) / 安裝 Docker（如未安裝）
2. Download project from GitHub / 從 GitHub 下載專案
3. Build and start Docker container / 建置並啟動容器
4. Open browser to `http://127.0.0.1:8080` / 自動開啟瀏覽器

Default credentials / 預設帳號：`adv9boss` / `admin123`

### Option 2: Docker Compose / Docker Compose 部署

```bash
git clone https://github.com/loyuan1114/Adventurer-Learning-Platform.git
cd Adventurer-Learning-Platform
docker compose up -d
```

### Option 3: Direct Node.js / 直接執行

```bash
git clone https://github.com/loyuan1114/Adventurer-Learning-Platform.git
cd Adventurer-Learning-Platform
npm install
node server.js
```

---

## Features / 功能

### Core Learning / 核心學習

| Module | Description |
|--------|-------------|
| **Quiz Adventure** / 問答冒險 | AI-generated questions, dungeon progression, XP & loot rewards |
| **Homework System** / 作業系統 | Teacher assignment, auto-grading, AI weak-point analysis |
| **Flashcards (SM-2)** / 閃卡複習 | Spaced repetition algorithm for long-term retention |
| **Notes & Mindmaps** / 筆記與心智圖 | Rich note-taking with AI-generated visual mindmaps |
| **Exam Planning** / 考試規劃 | Countdown, AI-generated study plans, progress tracking |

### RPG Systems / RPG 系統

| Module | Description |
|--------|-------------|
| **Card Gacha** / 卡牌收集 | Character, pet, and anime card collection with rarity tiers |
| **Forge & Equipment** / 鍛造裝備 | Crafting with quality tiers, enhancement, material gathering |
| **Territory** / 領土征服 | Cross-subject conquest battles with reward multipliers |
| **Guild Wars** / 公會戰 | Team battles, territory control, class competitions |
| **Rogue-like** / 個人冒險 | Unique adventure path per player |

### AI Integration / AI 整合

| Module | Description |
|--------|-------------|
| **Multi-Provider AI** / 多供應商 AI | Gemini, OpenAI, DeepSeek, Qwen, Kimi, Ollama (local) |
| **AI Tutor** / AI 導師 | Personalized tutoring based on notes and progress |
| **AI Audit** / AI 學情稽核 | Teacher dashboard with AI-powered student behavior analysis |
| **AI Podcast** / AI 播客 | Auto-generated audio study materials |
| **AI Learning Path** / AI 學習路徑 | Personalized curriculum based on performance data |

### Social & Admin / 社交與管理

| Module | Description |
|--------|-------------|
| **Chat & Social** / 聊天與社交 | Friends, groups, mail, story posting |
| **Code Sandbox** / 程式沙盒 | Python, C++, Java execution in isolated containers |
| **Parent Dashboard** / 家長儀表板 | Real-time progress monitoring, consent management |
| **Admin Panel** / 管理員後台 | User management, system backup/restore, API key management |

---

## Platform Comparison / 平台比較

| | **ADV9** | PaGamO | 均一 | Cool English |
|---|---------|--------|------|-------------|
| **Type** | Open-source self-hosted | Commercial SaaS | Non-profit SaaS | Government SaaS |
| **Cost** | Free (self-host) | Free + premium | Free | Free |
| **Subjects** | All + code + 211 langs | K-12 five domains | K-12 STEM | English only |
| **Gamification** | Full RPG system | Territory + PK | Badges + points | Mini-games |
| **AI** | 6+ providers, local | Basic analytics | Content rec. | Pronunciation |
| **Code Sandbox** | Python, C++, Java | ✗ | CS courses | ✗ |
| **Social** | Full (guilds, mail) | Limited | Limited | Limited |
| **Deployment** | Docker / VPS / Pages | Cloud only | Cloud only | Cloud only |
| **Data Control** | Full ownership | Vendor managed | Vendor managed | Government |
| **Custom** | AGPL-3.0 (open) | No | No | No |

---

## Live Demo / 線上演示

**GitHub Pages**: [https://loyuan1114.github.io/Adventurer-Learning-Platform/](https://loyuan1114.github.io/Adventurer-Learning-Platform/)

| Role / 角色 | Username / 帳號 | Password / 密碼 |
|------------|----------------|----------------|
| Admin / 管理員 | `adv9boss` | `admin123` |

> ⚠️ Pages version runs entirely in browser `localStorage`. Multi-user requires VPS backend.
> Pages 版資料存在瀏覽器 `localStorage`，多人連線需架 VPS。

---

## Deployment / 部署

### Docker

```bash
git clone https://github.com/loyuan1114/Adventurer-Learning-Platform.git
cd Adventurer-Learning-Platform
docker compose up -d --build
```

### VPS (Ubuntu/Debian)

```bash
# Install Docker / 安裝 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Clone and run / 克隆並運行
git clone https://github.com/loyuan1114/Adventurer-Learning-Platform.git
cd Adventurer-Learning-Platform
docker compose up -d --build
```

### Port Configuration / 端口設定

Edit `docker-compose.yml` to change port:
修改 `docker-compose.yml` 更改端口：

```yaml
services:
  adv9:
    ports:
      - "3000:8080"  # Host:Container
```

---

## Data & Backup / 資料與備份

```
data/    Accounts, settings, AI keys, homework, chat logs
media/   Uploaded photos, videos, music
```

| Action / 動作 | Command / 指令 |
|--------------|---------------|
| Upgrade / 升級 | `docker compose down && docker compose up -d --build` |
| Backup / 備份 | `tar czf backup.tgz data media` |
| Restore / 還原 | Extract backup → `docker compose restart` |
| Uninstall / 卸載 | `docker compose down && rm -rf adv9` |

---

## Local AI (Ollama) / 本機 AI

Run AI entirely on your server with no API keys needed:
完全在伺服器上運行 AI，無需 API 金鑰：

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull huihui_ai/qwen2.5-vl-abliterated:7b
```

Then configure in Admin → **AI Endpoints** → Add → Provider: Ollama → Key: `http://127.0.0.1:11434`
然後在管理員 → **AI 端點** → 新增 → 供應商：Ollama → 金鑰：`http://127.0.0.1:11434`

---

## Architecture / 架構

```
adv9/
├── server.js              # Node.js HTTP server (auth, KV, WebSocket, sandbox)
├── public/
│   ├── index.html         # Main entry (1,461 lines, CSS + loader + SW)
│   ├── js/
│   │   ├── app/           # 19 app modules (p00-p15, q00-q01, api-layer)
│   │   └── views/         # 84 lazy-loaded view modules
│   ├── sw.js              # Service Worker (network-first)
│   └── manifest.json      # PWA manifest
├── data/                  # Persistent storage (JSON files)
├── installer/             # Rust desktop installer source
│   └── src/               # main.rs, docker.rs, deploy.rs, platform.rs
├── Dockerfile             # Node 20 Alpine
└── docker-compose.yml
```

---

## Development / 開發

```bash
git clone https://github.com/loyuan1114/Adventurer-Learning-Platform.git
cd Adventurer-Learning-Platform
npm install
node server.js
```

Requires **Node.js 18+**.

### Building the Installer / 編譯安裝器

```bash
cd installer
cargo build --release
# Binary: target/release/adv9-installer
```

Cross-compile targets / 交叉編譯目標：
```bash
cargo build --release --target x86_64-unknown-linux-gnu   # Linux x64
cargo build --release --target aarch64-apple-darwin       # macOS ARM64
cargo build --release --target x86_64-apple-darwin        # macOS x64
```

---

## Homework Import Format / 作業匯入格式

### Plain Text / 純文字格式

Each question requires exactly 6 lines:
每題固定 6 行：

```
題目：下列哪一個是質數？
a. 4
b. 6
c. 7
d. 9
答案：c
```

### Quoted Format / 帶引號格式

Also supported, with quotes around each field:
也支援每欄位加引號：

```
"題目：下列哪一個是質數？"
"a. 4"
"b. 6"
"c. 7"
"d. 9"
"答案：c"
```

### Mixed Format / 混用格式

You can mix quoted and unquoted lines:
可以混用有引號和無引號的格式：

```
題目：下列哪一個是質數？
"a. 4"
b. 6
"c. 7"
d. 9
答案：c
```

Answer formats: `a/b/c/d`, `1-4`, or exact option text.
答案格式：`a/b/c/d`、`1-4`、或選項原文。

---

## FAQ / 常見問題

**Q: Port 8080 is not accessible? / 端口 8080 無法存取？**
Allow port 8080 in your firewall or security group.
在防火牆或安全組中放行 8080 端口。

**Q: How to update? / 如何更新？**
Download latest release, extract over old (keep `data/` and `media/`), run `docker compose up -d --build`.
下載最新版，解壓縮覆蓋（保留 `data/` 和 `media/`），執行 `docker compose up -d --build`。

**Q: No Docker? / 沒有 Docker？**
Run `node server.js` directly (requires Node.js 18+).
直接執行 `node server.js`（需要 Node.js 18+）。

---

## License / 授權

**AGPL-3.0-or-later**

If you modify and run this software as a network service, you must provide the source code to users.
若您修改此軟體並以網路服務形式運行，必須向使用者提供原始碼。

See [`LICENSE`](LICENSE) for full text.
完整授權條款請見 [`LICENSE`](LICENSE)。

---

<p align="center">
  <sub>Built with ❤️ for learners everywhere · 為全世界學習者而建 ❤️</sub>
</p>
