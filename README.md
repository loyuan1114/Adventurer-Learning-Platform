# 🎮 ADV9 Adventurer Learning Platform / 冒險者學習平台

> A gamified learning platform: quiz adventures, card-based character development, guild battles, homework assignment, AI assistants, and social interaction.
>
> 把課業變成冒險遊戲的學習平台：答題冒險、抽卡養成、公會對戰、作業發布、AI 助理、社群互動。

- **Password security / 密碼安全**: Argon2id hashing (falls back to scrypt if `argon2` is unavailable)
- **Docker one-click deploy / Docker 一鍵部署**: Any Linux / macOS / Windows
- **All data stays local / 資料皆留在本機**: Accounts, settings, AI keys in `data/`, `media/`
- **Default admin / 預設管理員**: `adv9boss` / `admin123` (**change password on first login** / 首次登入請改密碼)

---

## 🚀 Quick Start / 快速開始

### 📥 Desktop Installer / 桌面安裝器

Download and double-click:

| File / 檔案 | Platform / 平台 | Download / 下載 |
|------------|----------------|----------------|
| `adv9-installer-windows-x64.exe` | Windows 64-bit | [Download ⬇️](https://github.com/loyuan1114/Adventurer-Learning-Platform/releases/download/v1.1.0/adv9-installer-windows-x64.exe) |
| `adv9-installer-windows-x86.exe` | Windows 32-bit | [Download ⬇️](https://github.com/loyuan1114/Adventurer-Learning-Platform/releases/download/v1.1.0/adv9-installer-windows-x86.exe) |
| `adv9-installer-windows-arm64.exe` | Windows ARM | [Download ⬇️](https://github.com/loyuan1114/Adventurer-Learning-Platform/releases/download/v1.1.0/adv9-installer-windows-arm64.exe) |
| `adv9-installer-mac-arm64` | macOS Apple Silicon | [Download ⬇️](https://github.com/loyuan1114/Adventurer-Learning-Platform/releases/download/v1.1.0/adv9-installer-mac-arm64) |
| `adv9-installer-mac-x64` | macOS Intel | [Download ⬇️](https://github.com/loyuan1114/Adventurer-Learning-Platform/releases/download/v1.1.0/adv9-installer-mac-x64) |
| `adv9-installer-linux-x64` | Linux 64-bit | [Download ⬇️](https://github.com/loyuan1114/Adventurer-Learning-Platform/releases/download/v1.1.0/adv9-installer-linux-x64) |

> The installer will auto-install Docker → download project → build container → open browser.
> 安裝器會自動安裝 Docker → 下載專案 → 建置容器 → 開啟瀏覽器

Default login / 預設登入：`adv9boss` / `admin123`

---

## 📝 Homework Import / 作業檔案匯入

### File Format / 檔案格式

Recommend using `.txt` (Word: File → Save As → Plain Text)
推薦使用 `.txt`（Word 請另存新檔為純文字）

Each question requires exactly **6 lines**:
每題固定 **6 行**：
1. Question / 題目
2. Option a / 選項 a
3. Option b / 選項 b
4. Option c / 選項 c
5. Option d / 選項 d
6. Answer / 答案

### Example / 範例

```
題目：下列哪一個是質數？
a. 4
b. 6
c. 7
d. 9
答案：c

題目：水的化學式為何？
a. CO2
b. H2O
c. NaCl
d. O2
答案：b
```

### Quoted Format / 雙引號格式（支援）

You can also wrap each field in quotes, or mix formats:
也可以每欄位加引號，或混用：

```
"題目：下列哪一個是質數？"
"a. 4"
"b. 6"
"c. 7"
"d. 9"
"答案：c"
```

---

## ✨ Features / 功能特色

### Core Learning / 核心學習

| Module / 模組 | Description / 功能 |
|--------------|-------------------|
| Quiz Adventure / 問答冒險 | AI-generated questions, dungeon progression, XP & loot |
| Homework System / 作業系統 | Teacher assignment, auto-grading, AI weak-point analysis |
| Flashcards (SM-2) / 閃卡複習 | Spaced repetition for long-term retention |
| Notes & Mindmaps / 筆記與心智圖 | Rich notes with AI-generated mindmaps |
| Exam Planning / 考試規劃 | Countdown, AI study plans, progress tracking |

### RPG Systems / RPG 系統

| Module / 模組 | Description / 功能 |
|--------------|-------------------|
| Card Gacha / 卡牌收集 | Character, pet, anime card collection with rarity tiers |
| Forge & Equipment / 鍛造裝備 | Crafting with quality tiers, enhancement, materials |
| Territory / 領土征服 | Cross-subject conquest battles with reward multipliers |
| Guild Wars / 公會戰 | Team battles, territory control, class competitions |
| Rogue-like / 個人冒險 | Unique adventure path per player |

### AI Integration / AI 整合

| Module / 模組 | Description / 功能 |
|--------------|-------------------|
| Multi-Provider AI / 多供應商 AI | Gemini, OpenAI, DeepSeek, Qwen, Kimi, Ollama (local) |
| AI Tutor / AI 導師 | Personalized tutoring based on notes and progress |
| AI Audit / AI 學情稽核 | Teacher dashboard with AI-powered student behavior analysis |
| AI Podcast / AI 播客 | Auto-generated audio study materials |
| AI Learning Path / AI 學習路徑 | Personalized curriculum based on performance data |

### Social & Admin / 社交與管理

| Module / 模組 | Description / 功能 |
|--------------|-------------------|
| Chat & Social / 聊天與社交 | Friends, groups, mail, story posting |
| Code Sandbox / 程式沙盒 | Python, C++, Java execution in isolated containers |
| Parent Dashboard / 家長儀表板 | Real-time progress monitoring, consent management |
| Admin Panel / 管理員後台 | User management, system backup/restore, API key management |

---

## 📊 Platform Comparison / 平台比較

| Item / 項目 | **ADV9** | PaGamO | 均一 | Cool English |
|------------|---------|--------|------|-------------|
| **Type / 類型** | Open-source self-hosted | Commercial SaaS | Non-profit SaaS | Government SaaS |
| **Cost / 費用** | Free (self-host) | Free + premium | Free | Free |
| **Subjects / 學科** | All + code + 211 languages | K-12 five domains | K-12 STEM | English only |
| **Gamification / 遊戲化** | Full RPG system | Territory + PK | Badges + points | Mini-games |
| **AI / AI** | 6+ providers, local Ollama | Basic analytics | Content rec. | Pronunciation |
| **Code / 程式** | Python, C++, Java | ✗ | CS courses | ✗ |
| **Social / 社群** | Full (guilds, mail) | Limited | Limited | Limited |
| **Deploy / 部署** | Docker / VPS / Pages | Cloud only | Cloud only | Cloud only |
| **Data / 資料** | Full ownership | Vendor managed | Vendor managed | Government |
| **Custom / 客製** | AGPL-3.0 (open) | No | No | No |

---

## 🌐 Live Demo / 線上演示

**GitHub Pages**: [https://loyuan1114.github.io/Adventurer-Learning-Platform/](https://loyuan1114.github.io/Adventurer-Learning-Platform/)

| Role / 角色 | Username / 帳號 | Password / 密碼 |
|------------|----------------|----------------|
| Admin / 管理員 | `adv9boss` | `admin123` |

> Pages version runs entirely in browser `localStorage`. Multi-user requires VPS backend.
> Pages 版資料存在瀏覽器 `localStorage`，多人連線需架 VPS。

---

## 🛠️ Admin Settings / 管理員設定

| Setting / 設定 | Location / 位置 |
|--------------|----------------|
| Default account / 預設帳號 | `adv9boss` / `admin123` |
| Password hashing / 密碼雜湊 | Argon2id (scrypt fallback) |
| Change password / 修改密碼 | Login → Account page |
| AI keys / AI 金鑰 | Admin → API Keys |
| AI endpoints / AI 端點 | Admin → AI Endpoints |
| Background music / 背景音樂 | Settings → Music |
| Socratic settings / 蘇格拉底設定 | Admin → Socratic |

---

## 🤖 Local AI (Ollama, Free) / 本機 AI

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull huihui_ai/qwen2.5-vl-abliterated:7b
```

Then: Admin → **AI Endpoints** → Add → Provider: Ollama → Key: `http://127.0.0.1:11434`

---

## 📁 Data & Backup / 資料與備份

```
data/    Accounts, settings, AI keys, homework, chat logs
media/   Uploaded photos, videos, music
```

| Action / 動作 | Command / 指令 |
|--------------|---------------|
| Upgrade / 升級 | `docker compose down && up -d --build` |
| Backup / 備份 | `tar czf backup.tgz data media` |
| Restore / 還原 | Extract backup → `docker compose restart` |
| Uninstall / 卸載 | Use installer's "Uninstall" button |

---

## 🗑️ Uninstall / 卸載

- **Stop (keep data)** / **停止（保留資料）**: `docker compose down`
- **Delete everything** / **刪除所有**: `docker compose down && rm -rf adv9`
- **Backup first** / **先備份**: `tar czf backup.tgz data media`

---

## 📜 License / 授權

**AGPL-3.0-or-later** — If you modify and run this software as a network service, you must provide the source code to users.

若您修改此軟體並以網路服務運行，必須向使用者提供原始碼。

---

## ❓ FAQ / 常見問題

- **Port 8080 not accessible?** / **Port 8080 無法存取？**
  Allow port 8080 in your firewall. / 請在防火牆放行 8080 埠。

- **How to update?** / **如何更新？**
  Download latest, extract over old (keep `data/` and `media/`), run `docker compose up -d --build`.

- **No Docker?** / **沒有 Docker？**
  Run `node server.js` directly (Node.js 18+ required).

---

<p align="center">
  <sub>Built with ❤️ for learners everywhere / 為全世界學習者而建 ❤️</sub>
</p>
