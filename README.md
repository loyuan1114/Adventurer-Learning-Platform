# 🎮 ADV9 Adventurer Learning Platform v9.0.0
## 冒險者學習平台 v9.0.0

> A gamified learning platform: quiz adventures, card-based character development, guild battles, homework assignment, AI assistants, and social interaction.
>
> 把課業變成冒險遊戲的學習平台：答題冒險、抽卡養成、公會對戰、作業發布、AI 助理、社群互動。

> **v9.0.0 Highlights / v9.0.0 重點**:
> - 🏫 **Class Management System** / 班級管理系統（老師認領、批量建立、檔案上傳）
> - 🎁 **AP Reward System** / AP 獎勵系統（7 種來源、獨立上限、審計日誌、學生兌換）
> - 🔐 **Cluster Race Condition Fixed** / 叢集競態修復（file-based class storage）
> - ♾️ **Token Never Expires** / Token 永不過期
> - 🛡️ **Comprehensive Security Audit** / 全面安全稽核（11 issues fixed）

把課業變成冒險遊戲的學習平台：答題冒險、抽卡養成、公會對戰、作業發布、AI 助理、班級管理、AP 獎勵。

---

## ✨ v9.0.0 New Features / 新功能

### 🏫 Class Management System / 班級管理系統
- **Teacher Class Management** / 老師班級管理 — create, claim, delete classes
- **Admin Class Assignment** / 管理員指派 — assign students to classes
- **Bulk Account Creation** / 批量建立帳號 — paste 100+ accounts at once
- **File Upload Import** / 檔案上傳匯入 — `.txt` upload for class rosters
- **Student Class View** / 學生班級檢視 — see class members and code
- **Race-Condition-Free** / 無競態 — file-based `classes.json` (bypasses cluster IPC)

### 🎁 AP Reward System / AP 獎勵系統
- **7 AP Sources** / 7 種 AP 來源:
  - 🚶 Steps / 步行 (1 AP per 30 steps, daily cap 100)
  - 🎮 Games / 遊戲 (ap_per_unit: 10)
  - 🎨 Creation / 創作 (ap_per_unit: 15)
  - 🏃 Sports / 運動 (0.5 AP/km)
  - 📚 Learning / 學習 (ap_per_unit: 5)
  - 🎵 Music / 音樂 (ap_per_unit: 10)
  - 🤝 Community / 社群 (ap_per_unit: 5)
- **Independent Caps** / 獨立上限 — daily/weekly/monthly per source
- **Audit Log** / 審計日誌 — every grant/spend recorded with reason
- **Student Redemption** / 學生兌換 — exchange AP for commendations, coupons, titles
- **Admin Manual Grant** / 管理員手動發放 — with reason field for audit

### 🔐 Security Hardening / 安全加固
- **Password Security** / 密碼安全 — Argon2id (scrypt fallback)
- **Timing-Safe Comparison** / 時間常數比較 — no password timing attacks
- **Prototype Pollution Fixed** / 原型污染修復 — whitelist AI provider fields
- **DoS Protection** / DoS 防護 — jsCalc capped at 50K iterations
- **Sanitized Errors** / 錯誤訊息淨化 — no internal info leakage
- **Client-Side Auth Guards** / 客戶端授權守衛 — `IS_ADMIN()` checks
- **SSRF Protection** / SSRF 防護 — AI endpoint validation
- **Rate Limiting** / 速率限制 — sandbox + login lockout

### 🔑 Authentication / 認證
- **Token Never Expires** / Token 永不過期 — re-login not required
- **HMAC-SHA256 Signed** / HMAC-SHA256 簽章 — tamper-proof tokens
- **Per-User Version** / 每用戶版本 — invalidated on password change
- **Server Pepper** / 伺服器胡椒 — stored in `data/pepper.json`

### 🏗️ Architecture / 架構
- **Cluster Mode** / 叢集模式 — multi-CPU with master-worker IPC
- **File-Based Persistence** / 檔案持久化 — per-user `.json` files + master index
- **Auto-Recovery** / 自動復原 — `users_index.json` backup + reconcile
- **Graceful Restart** / 平滑重啟 — SIGTERM/SIGINT handling
- **30-Second Sync** / 30 秒同步 — frontend auto-refresh from server

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

## 🚀 Quick Start / 快速開始

### Option 1: Desktop Installer / 桌面安裝器

Download and double-click:

| File / 檔案 | Platform / 平台 |
|------------|----------------|
| `adv9-installer-windows-x64.exe` | Windows 64-bit |
| `adv9-installer-windows-x86.exe` | Windows 32-bit |
| `adv9-installer-windows-arm64.exe` | Windows ARM |
| `adv9-installer-mac-arm64` | macOS Apple Silicon |
| `adv9-installer-mac-x64` | macOS Intel |
| `adv9-installer-linux-x64` | Linux 64-bit |

> Installer auto-installs Docker → downloads project → builds container → opens browser.
> 安裝器自動安裝 Docker → 下載專案 → 建置容器 → 開啟瀏覽器

### Option 2: Direct Node.js / 直接用 Node.js

Requires Node.js 18+ and optionally `argon2`:

```bash
git clone https://github.com/loyuan1114/Adventurer-Learning-Platform.git
cd Adventurer-Learning-Platform
npm install  # installs argon2 (optional, scrypt fallback works without)
node server.js
```

Open http://localhost:8080

**Default admin** / **預設管理員**: `adv9boss` / `admin123`
⚠️ **Change password on first login** / ⚠️ 首次登入請改密碼

### Option 3: Docker / Docker

```bash
docker compose up -d --build
```

---

## 📋 v9.0.0 Changelog / 更新日誌

### Added / 新增
- 🏫 **Class Management API** — `/rest/v1/class/{create,list,claim,delete,assign}`
- 🎁 **AP System** — 7 sources with independent caps + audit log
- 📤 **Bulk Account Creation** — paste 100+ accounts + file upload
- 🛍️ **Student AP Redemption** — exchange AP for items
- 📊 **AP Stats Dashboard** — admin overview
- 🔍 **AP User Search** — find specific student's AP balance
- 📋 **AP Audit Log** — every grant/spend with admin + reason
- 🏫 **Class Management in Admin Panel** — manage all classes
- 🔄 **Periodic Data Sync** — frontend refreshes every 30s
- 🔍 **Admin User Search** — filter by role/class/keyword

### Changed / 變更
- 🔐 **Token never expires** — removed `exp` field from `newToken()`
- 🏫 **Class storage moved to `data/classes.json`** — file-based, no cluster race
- 🛡️ **`safeJson` no longer clears token** — only network errors clear token
- 🔄 **All async wrapper recursive calls use `await`**
- 🏗️ **`vMonitor.js` syntax error fixed**
- 🎨 **New loading screen** — "v9.0.0 班級管理・AP 獎勵・永不過期 Token"

### Fixed / 修復
- 🐛 Cluster race condition: classes created on worker A invisible on worker B
- 🐛 Token false-positive: "Token 已失效" caused by cluster tokenVer sync delay
- 🐛 Bulk import: `findOrCreateClass` now uses `loadClasses()` (file-based)
- 🐛 Admin user delete: removes private KV data + individual file
- 🐛 Sandbox code execution: DoS protected (50K iteration cap)
- 🐛 AI provider config: prototype pollution prevented
- 🐛 Error messages: internal info no longer leaked
- 🐛 Impersonate: returns JSON error with reason
- 🐛 `vMonitor.js`: mismatched parens caused "❌ 載入失敗" infinite loop
- 🐛 50+ async wrapper functions: missing `await` on recursive calls
- 🐛 `safeJson`: was aggressively clearing token on 401/403 (false positives)

### Security / 安全
- 🛡️ **3 HIGH** vulnerabilities fixed (timing attack, DoS, error leak)
- 🛡️ **5 MEDIUM** vulnerabilities fixed (auth bypass, prototype pollution)
- 🛡️ **3 LOW** improvements (backtick encoding, client-side guards)
- 🛡️ **Token replay** — tokenVer bumped on password change

---

## 🏫 Class Management Workflow / 班級管理流程

### Teacher / 老師
1. Login → 班級管理 → 輸入班級代號 + 名稱 → 點「新增」
2. 系統自動將老師設為班級管理員
3. 學生可被老師或管理員指派到此班級
4. 老師可發布作業給班級

### Admin / 管理員
1. Login → 班級管理 → 看到所有班級列表
2. 可刪除任何班級（會自動移除所有學生的 classId）
3. 可手動指派學生到班級（透過「指派學生到班級」下拉選單）
4. 批量建立帳號時，可用班級代號自動建立/指派

### Student / 學生
1. Login → 班級系統 → 看到自己的班級名稱、代號、成員
2. 收到作業通知時，自動篩選到自己班級的作業

---

## 🎁 AP System Architecture / AP 系統架構

```
AP Balance (per user)
  ├── Steps (每日 100, 每週 700, 每月 3000)
  ├── Games (每日 200, 每週 1000, 每月 4000)
  ├── Creation (每日 100, 每週 500, 每月 2000)
  ├── Sports (每日 200, 每週 1400, 每月 6000)
  ├── Learning (每日 300, 每週 1500, 每月 6000)
  ├── Music (每日 200, 每週 1000, 每月 4000)
  └── Community (每日 150, 每週 750, 每月 3000)

Global Caps / 全域上限
  ├── Daily Total: 10,000 AP
  ├── Weekly Total: 50,000 AP
  ├── Monthly Total: 200,000 AP
  └── 7-Day Rolling: 30,000 AP
```

### Admin Grant / 管理員發放
- Path / 路徑: Admin → 獎勵規則 → 手動發放
- Required / 必填: 學生帳號、來源、數量、原因（for audit）
- Recorded / 記錄: admin username, timestamp, reason, before/after balance

### Student Redemption / 學生兌換
- 🏅 嘉獎 — 10 AP
- 🎫 兌換券 — 50 AP
- ⭐ 特殊稱號 — 100 AP
- 可由管理員自訂更多項目

---

## 📁 Data Structure / 資料結構

```
data/
├── pepper.json              # Server HMAC pepper (auto-generated)
├── users_index.json         # All accounts backup (for recovery)
├── kv.json                  # Shared KV (chat, market, etc.)
├── classes.json             # Classes (file-based, race-free)
├── tokens.json              # Active tokens
├── ap_audit.json            # AP grant/spend history
├── ap_exchange_items.json   # Redemption catalog
├── ap_rules.json            # AP cap rules
├── online.json              # Online status
├── dolls.json               # Doll customization
├── shop.json                # Shop items
├── events.json              # Events
├── settings/system.json     # System settings
└── users/                   # Per-user JSON files
    ├── adv9boss.json
    ├── student.json
    └── ...

media/                       # Uploaded photos, videos, music
public/                      # Frontend (HTML + JS)
```

### Backup / 備份
```bash
tar czf backup.tgz data media
```

### Restore / 還原
```bash
tar xzf backup.tgz
node server.js  # auto-reconciles from users_index.json
```

---

## 🔧 Admin API Reference / 管理員 API

### Class Management / 班級管理
```
POST /rest/v1/class/create   {name, code}
POST /rest/v1/class/claim    {classId}
POST /rest/v1/class/delete   {classId}
POST /rest/v1/class/assign   {studentId, classId}
GET  /rest/v1/class/list
```

### AP System / AP 系統
```
GET  /rest/v1/ap/stats
GET  /rest/v1/ap/user/:username
POST /rest/v1/ap/grant       {username, source, amount, reason}
GET  /rest/v1/ap/audit
GET  /rest/v1/ap/rules
POST /rest/v1/ap/rules       {rules, global_caps, platform_min, school_overrides}
GET  /rest/v1/ap/exchange-items
POST /rest/v1/ap/exchange-items  {items}
GET  /rest/v1/ap/redemptions
POST /rest/v1/ap/redeem      {itemId}
```

### User Management / 用戶管理
```
GET  /rest/v1/users
POST /rest/v1/admin/users/create       {username, password, role, ...}
POST /rest/v1/admin/users/bulk_create  {role, text}
POST /rest/v1/admin/users/delete       {username}
POST /rest/v1/admin/users/import       {users, mode}
POST /rest/v1/admin/reset_password     {username, newPassword}
POST /rest/v1/admin/impersonate        {username}
POST /rest/v1/admin/restore            {data, passwords}
```

---

## 🛠️ Admin Settings / 管理員設定

| Setting / 設定 | Location / 位置 |
|--------------|----------------|
| Default account / 預設帳號 | `adv9boss` / `admin123` |
| Password hashing / 密碼雜湊 | Argon2id (scrypt fallback) |
| Change password / 修改密碼 | Login → Account page |
| AI keys / AI 金鑰 | Admin → API Keys |
| AI endpoints / AI 端點 | Admin → AI Endpoints |
| AP rules / AP 規則 | Admin → 獎勵規則 |
| AP grants / AP 發放 | Admin → 手動發放 |
| AP audit / AP 審計 | Admin → 審計日誌 |
| Class management / 班級管理 | Admin → 班級管理 |
| Background music / 背景音樂 | Settings → Music |
| Socratic settings / 蘇格拉底設定 | Admin → Socratic |
| System backup / 系統備份 | Admin → Backup |

---

## 🤖 Local AI (Ollama, Free) / 本機 AI

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull huihui_ai/qwen2.5-vl-abliterated:7b
```

Then: Admin → **AI Endpoints** → Add → Provider: Ollama → Key: `http://127.0.0.1:11434`

---

## 🗑️ Uninstall / 卸載

- **Stop (keep data)** / **停止（保留資料）**: `docker compose down` 或關閉 Node 程序
- **Delete everything** / **刪除所有**: `docker compose down && rm -rf data media` 或刪除整個資料夾
- **Backup first** / **先備份**: `tar czf backup.tgz data media`

---

## 🌐 Live Demo / 線上演示

**GitHub Pages**: [https://loyuan1114.github.io/Adventurer-Learning-Platform/](https://loyuan1114.github.io/Adventurer-Learning-Platform/)

| Role / 角色 | Username / 帳號 | Password / 密碼 |
|------------|----------------|----------------|
| Admin / 管理員 | `adv9boss` | `admin123` |
| Student / 學生 | `student` | `student` |
| Teacher / 老師 | `teacher` | `teacher` |
| Parent / 家長 | `parent1` | `parent1` |

> Pages version runs entirely in browser `localStorage`. Multi-user requires VPS backend.
> Pages 版資料存在瀏覽器 `localStorage`，多人連線需架 VPS。

---

## 📊 Tech Stack / 技術棧

- **Backend** / 後端: Node.js 18+, built-in `http`, `crypto`, `cluster`, `fs`
- **Hashing** / 雜湊: Argon2id (primary), scrypt (fallback)
- **Storage** / 儲存: File-based JSON (per-user + shared KV)
- **Cluster** / 叢集: Node.js cluster (master-worker IPC)
- **Frontend** / 前端: Vanilla JS, no build step, progressive enhancement
- **Auth** / 認證: HMAC-SHA256 signed tokens with pepper
- **DB (Optional)** / 資料庫: PostgreSQL (stage 2, in progress)

---

## 📜 License / 授權

**AGPL-3.0-or-later** — If you modify and run this software as a network service, you must provide the source code to users.

若您修改此軟體並以網路服務運行，必須向使用者提供原始碼。

Copyright (C) 2026 loyuan1114

---

## ❓ FAQ / 常見問題

- **Port 8080 not accessible?** / **Port 8080 無法存取？**
  Allow port 8080 in your firewall. / 請在防火牆放行 8080 埠。

- **How to update?** / **如何更新？**
  Download latest, extract over old (keep `data/` and `media/`), run `node server.js`.

- **No argon2 installed?** / **沒安裝 argon2？**
  Works fine with scrypt fallback. / 會自動 fallback 到 scrypt，不影響功能。

- **Forgot admin password?** / **忘記管理員密碼？**
  Delete `data/users/adv9boss.json` and restart. The master admin will be re-seeded with default `admin123`. / 刪除 `data/users/adv9boss.json` 並重啟，主管理員會用預設密碼重新建立。

- **AP grants not showing up?** / **AP 發放沒出現？**
  Check Admin → 審計日誌 for the grant record. If it's there but balance is wrong, the cap was hit. / 到審計日誌查看，如果有記錄但餘額不對，表示達到上限了。

- **Class not found after creating?** / **建立班級後找不到？**
  v9.0.0 fixed this with file-based storage. Restart server if upgrading from v8.x. / v9.0.0 用 file-based 儲存修復了此問題，從 v8.x 升級請重啟伺服器。

- **Token expired message?** / **Token 過期訊息？**
  v9.0.0 tokens never expire. If you still see this, hard refresh (Ctrl+F5) to clear browser cache. / v9.0.0 的 token 永不過期。若仍看到此訊息，請強制刷新（Ctrl+F5）清除瀏覽器快取。

---

<p align="center">
  <sub>Built with ❤️ for learners everywhere / 為全世界學習者而建 ❤️</sub>
  <br>
  <sub>ADV9 v9.0.0 — 班級管理・AP 獎勵・永不過期 Token</sub>
</p>
