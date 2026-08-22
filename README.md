# 🎮 ADV9 Adventurer Learning Platform / 冒險者學習平台

> A gamified learning platform: quiz adventures, card-based character development, guild battles, homework assignment, AI assistants, and social interaction.
>
> 把課業變成冒險遊戲的學習平台：答題冒險、抽卡養成、公會對戰、作業發布、AI 助理、社群互動。

- **密碼安全** / **Password security**: Argon2id 雜湊（無法使用 argon2 時自動降級為 scrypt）/ Argon2id hashing (falls back to scrypt if argon2 is unavailable)
- **Docker 一鍵部署** / **Docker one-click deploy**: 支援 Linux / macOS / Windows / Works on any OS with Docker
- **資料留在本機** / **All data stays local**: 帳號、設定、AI 金鑰都存在 `data/`、`media/` / Accounts, settings, AI keys stored in `data/`, `media/`
- **預設管理員** / **Default admin**: `adv9boss` / `admin123`（首次登入請改密碼 / **change password on first login**）

---

## 🚀 快速開始 / Quick Start

### 📥 桌面安裝器 / Desktop Installer

下載對應版本，雙擊執行：
Download the installer for your platform and double-click:

| 檔案 / File | 平台 / Platform | 下載 / Download |
|------------|----------------|----------------|
| `adv9-installer-windows-x64.exe` | Windows 64 位元 | [Releases](../../releases/latest) |
| `adv9-installer-windows-x86.exe` | Windows 32 位元 | [Releases](../../releases/latest) |
| `adv9-installer-windows-arm64.exe` | Windows ARM | [Releases](../../releases/latest) |
| `adv9-installer-mac-arm64` | macOS Apple Silicon (M1+) | [Releases](../../releases/latest) |
| `adv9-installer-mac-x64` | macOS Intel | [Releases](../../releases/latest) |
| `adv9-installer-linux-x64` | Linux 64 位元 | [Releases](../../releases/latest) |

> 安裝器會自動：安裝 Docker → 下載專案 → 建置容器 → 開啟瀏覽器 / The installer will: install Docker → download project → build container → open browser.

**預設登入 / Default login**: `adv9boss` / `admin123`

---

### 🐳 Docker Compose

```bash
git clone https://github.com/loyuan1114/Adventurer-Learning-Platform.git
cd Adventurer-Learning-Platform
docker compose up -d
```

---

### 💻 GitHub Codespaces（免費）/ Free

1. Fork 此倉庫 → **Code → Codespaces → Create codespace**
2. 在終端機執行：
```bash
docker compose up -d --build
```
3. **Ports** 面板 → 8080 → 右鍵 → **Port Visibility → Public**

---

## ✨ 功能特色 / Features

### 📚 核心學習 / Core Learning

| 模組 / Module | 功能 / Description |
|--------------|-------------------|
| 🎯 問答冒險 / Quiz Adventure | AI 出題、地牢推進、XP 與戰利品獎勵 / AI-generated questions, dungeon progression, XP & loot |
| 📝 作業系統 / Homework System | 老師發布、自動批改、AI 弱點分析 / Teacher assignment, auto-grading, AI weak-point analysis |
| 🃏 閃卡複習 / Flashcards (SM-2) | 間隔重複算法，長期記憶保留 / Spaced repetition for long-term retention |
| 📝 筆記與心智圖 / Notes & Mindmaps | 豐富筆記 + AI 生成視覺心智圖 / Rich notes with AI-generated mindmaps |
| 📅 考試規劃 / Exam Planning | 倒數計時、AI 學習計畫、進度追蹤 / Countdown, AI study plans, progress tracking |

### ⚔️ RPG 系統 / RPG Systems

| 模組 / Module | 功能 / Description |
|--------------|-------------------|
| 🎴 卡牌收集 / Card Gacha | 角色、寵物、動漫卡牌，稀有度階梯 / Character, pet, anime card gacha with rarity tiers |
| ⚒️ 鍛造裝備 / Forge & Equipment | 品質階梯、強化、素材蒐集 / Crafting, enhancement, material gathering |
| 🗺️ 領土征服 / Territory | 跨學科攻佔戰，獎勵倍率 / Cross-subject conquest with reward multipliers |
| 🏰 公會戰 / Guild Wars | 團隊戰鬥、領土控制、班級競賽 / Team battles, territory control, class competitions |
| 🗡️ 個人冒險 / Rogue-like | 每個玩家獨一無二的冒險路線 / Unique adventure path per player |

### 🤖 AI 整合 / AI Integration

| 模組 / Module | 功能 / Description |
|--------------|-------------------|
| 🤖 多供應商 AI / Multi-Provider AI | Gemini、OpenAI、DeepSeek、Qwen、Kimi、Ollama（本機）/ 6+ AI providers, local Ollama support |
| 🗣️ AI 導師 / AI Tutor | 根據筆記與進度個人化輔導 / Personalized tutoring based on notes & progress |
| 📊 AI 學情稽核 / AI Audit | 老師後台 + AI 學生行為分析 / Teacher dashboard with AI-powered analysis |
| 🎙️ AI 播客 / AI Podcast | 自動生成音訊學習教材 / Auto-generated audio study materials |
| 🧭 AI 學習路徑 / AI Learning Path | 根據表現數據個人化課程 / Personalized curriculum from performance data |

### 💬 社交與管理 / Social & Admin

| 模組 / Module | 功能 / Description |
|--------------|-------------------|
| 💬 聊天與社交 / Chat & Social | 好友、群組、郵件、貼文 / Friends, groups, mail, story posting |
| 💻 程式沙盒 / Code Sandbox | Python、C++、Java 執行 / Python, C++, Java execution |
| 👨‍👩‍👧 家長儀表板 / Parent Dashboard | 即時進度監控、同意管理 / Real-time progress monitoring, consent management |
| 👑 管理員後台 / Admin Panel | 用戶管理、系統備份還原、API 金鑰管理 / User management, backup/restore, API keys |

---

## 📊 平台比較 / Platform Comparison

| 項目 / Item | **ADV9** | PaGamO | 均一教育平台 | Cool English |
|------------|---------|--------|-----------|-------------|
| **類型 / Type** | 開源自架 / Open-source | 商業 SaaS | 非營利 SaaS | 政府 SaaS |
| **費用 / Cost** | 免費（自備主機）/ Free | 免費＋課金 / Free + premium | 完全免費 / Free | 完全免費 / Free |
| **學科 / Subjects** | 全科 + 程式 + 211 語言 / All + code + 211 langs | 國小到高中五大領域 / K-12 five domains | 國小到高中數理語文 / K-12 STEM | 僅英語 / English only |
| **遊戲化 / Gamification** | RPG 抽卡 + 公會 + 領土 + 鍛造 / Full RPG | 領土攻佔 + PK / Territory + PK | 徽章 + 點數 / Badges + points | 小遊戲 / Mini-games |
| **AI 功能 / AI** | 6+ 供應商，支援本機 / 6+ providers | 基本分析 / Basic analytics | 內容推薦 / Content rec. | AI 發音 / Pronunciation |
| **程式沙盒 / Code** | Python, C++, Java | ✗ | 電腦科學課程 / CS courses | ✗ |
| **社群 / Social** | 好友、公會、郵件、貼文 / Full social | 團隊 PK、排行榜 / Team PK | 有限 / Limited | 有限 / Limited |
| **部署 / Deploy** | Docker / Codespaces / VPS / 本機 | 雲端僅 / Cloud only | 雲端僅 / Cloud only | 雲端僅 / Cloud only |
| **資料控制 / Data** | 完全自控 / Full control | 廠商代管 / Vendor | 廠商代管 / Vendor | 政府代管 / Gov |
| **可客製 / Custom** | 完全（開源）/ Full (open) | 否 / No | 否 / No | 否 / No |

---

## 🌐 線上演示 / Live Demo

**GitHub Pages**: [https://loyuan1114.github.io/Adventurer-Learning-Platform/](https://loyuan1114.github.io/Adventurer-Learning-Platform/)

| 角色 / Role | 帳號 / Username | 密碼 / Password |
|------------|----------------|----------------|
| 管理員 / Admin | `adv9boss` | `admin123` |

> ⚠️ Pages 版資料只存於該瀏覽器的 `localStorage`，清除瀏覽器資料會清空進度。
> The Pages version stores all data in browser `localStorage`. Clearing browser data will erase progress.

---

## 🛠️ 管理員設定 / Admin Settings

| 設定 / Setting | 位置 / Location |
|--------------|----------------|
| 預設帳號 / Default account | `adv9boss` / `admin123` |
| 密碼雜湊 / Password hashing | Argon2id（scrypt 降級）/ Argon2id (scrypt fallback) |
| 修改密碼 / Change password | 登入 → 帳號頁 / Login → Account page |
| AI 金鑰 / AI keys | 管理員 → API 金鑰管理 / Admin → API Keys |
| AI 端點 / AI endpoints | 管理員 → AI 端點 / Admin → AI Endpoints |
| 背景音樂 / Background music | 設定 → 背景音樂 / Settings → Music |
| 蘇格拉底設定 / Socratic settings | 管理員 → 蘇格拉底設定 / Admin → Socratic |

---

## 🤖 本機 AI（Ollama，免費無 API 金鑰）/ Local AI (Ollama, Free)

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull huihui_ai/qwen2.5-vl-abliterated:7b
```

然後：管理員 → **AI 端點** → 新增 → 供應商：Ollama → 模型：`qwen2.5-vl-abliterated:7b` → 金鑰：`http://127.0.0.1:11434`
Then: Admin → **AI Endpoints** → Add → Provider: Ollama → Model: `qwen2.5-vl-abliterated:7b` → Key: `http://127.0.0.1:11434`

---

## 📝 作業檔案匯入 / Homework Import

### 檔案格式 / File Format

推薦使用 `.txt`（Word 請另存新檔為純文字）
Recommend using `.txt` (in Word: File → Save As → Plain Text)

每題固定 **6 行**：
Each question requires exactly **6 lines**:
1. 題目 / Question
2. 選項 a / Option a
3. 選項 b / Option b
4. 選項 c / Option c
5. 選項 d / Option d
6. 答案 / Answer（可填 a/b/c/d、1-4 或選項全文 / can be a/b/c/d, 1-2-3-4, or full option text）

### 範例 / Example

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

### 雙引號格式 / Quoted Format（支援）

也可以每個欄位用雙引號包起來，或者混用：
You can also wrap each field in quotes, or mix formats:

```
"題目：下列哪一個是質數？"
"a. 4"
"b. 6"
"c. 7"
"d. 9"
"答案：c"
```

---

## 📁 資料與備份 / Data & Backup

```
data/    帳號、設定、AI 金鑰、作業、聊天記錄（JSON 檔案）
         Accounts, settings, AI keys, homework, chat logs (JSON)
media/   上傳的照片、影片、音樂
         Uploaded photos, videos, music
```

| 動作 / Action | 指令 / Command |
|--------------|---------------|
| 升級 / Upgrade | `docker compose down && docker compose up -d --build` |
| 備份 / Backup | `tar czf backup.tgz data media` |
| 還原 / Restore | 解壓備份 → `docker compose restart` |
| 卸載 / Uninstall | 使用安裝器「卸載」按鈕，或 `docker compose down && rm -rf adv9` |

---

## 🗑️ 卸載與刪除 / Uninstall

- **停止（保留資料）** / **Stop (keep data)**: `cd adv9 && docker compose down`
- **刪除所有** / **Delete everything**: `docker compose down && rm -rf adv9`
- **先備份** / **Backup first**: `tar czf backup.tgz data media` before deleting

---

## 📜 開源授權 / License

**AGPL-3.0-or-later**（見 `LICENSE`）。若您修改此軟體並以網路服務形式運行，必須向使用者提供原始碼。
If you modify and run this software as a network service, you must provide the source code to users.

---

## 🔍 AI 呼叫揭露 / AI Call Disclosure

| 功能 / Function | 供應商 / Provider | 資料流向 / Data Flow |
|----------------|------------------|---------------------|
| 🤖 自動出題 / Auto Quiz | 您設定的供應商 / Your configured provider | 題目請求 → 供應商 → 題目回傳 / Question request → Provider → Quiz returned |
| 📊 弱點分析 / Weak Analysis | 同上（預設：本機 Ollama）/ Same (default: Ollama local) | 錯誤統計 → 供應商 → 教學建議 / Error stats → Provider → Teaching suggestions |
| 💬 AI 評語 / AI Comments | 同上 / Same | 學生姓名、成績 → 供應商 / Student name, grades → Provider |
| 🔤 字體 / Fonts | Google Fonts | 瀏覽器載入字體檔案 / Browser loads font files |
| 🖼 縮圖 / Thumbnails | Bing | 搜尋縮圖載入 / Search thumbnails loaded |

> 只有 **Ollama 本機模式** 能完全保留資料在您的伺服器上。
> **Only Ollama local mode** keeps data entirely on your server.

---

## 📸 圖片授權政策 / Photo Policy

所有照片均為 **CC0 公有領域**。上傳照片即表示同意 CC0 授權。請使用 CC0 來源（Pixabay/Unsplash/Wikimedia Commons）作為內建背景。
All photos are **CC0 Public Domain**. Uploading photos implies consent to CC0 licensing. Use CC0 sources (Pixabay/Unsplash/Wikimedia Commons) for built-in backgrounds.

---

## ❓ 常見問題 / FAQ

- **Port 8080 無法存取？** / **Port 8080 not accessible?**
  請在防火牆放行 8080 埠 / Allow port 8080 in your firewall/security group

- **如何更新？** / **How to update?**
  下載最新版，解壓縮覆蓋（保留 `data/` 和 `media/`），執行 `docker compose up -d --build`
  Download latest, extract over old (keep `data/` and `media/`), run `docker compose up -d --build`

- **沒有 Docker？** / **No Docker?**
  直接執行 `node server.js`（需要 Node.js 18+，先 `npm install` 安裝 Argon2）
  Run `node server.js` directly (Node.js 18+ required, `npm install` first for Argon2)

---

<p align="center">
  <sub>Built with ❤️ for learners everywhere / 為全世界學習者而建 ❤️</sub>
</p>
