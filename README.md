# 🎮 冒險者學習平台 v6.0

把課業變成冒險遊戲的學習平台：答題冒險、抽卡養成、公會對戰、作業發布、AI 助理、社群互動。**單一 HTML 檔案、零後端依賴**。

## 🌐 免費永久部署

**GitHub Pages（免費永久）**：
1. Fork 此 repo
2. 到 Settings → Pages → Source 選 `main` 分支
3. 一分鐘後網址：`https://你的用戶名.github.io/Adventurer-Learning-Platform/`

資料全存在瀏覽器 localStorage，不需任何伺服器。

## 🚀 v6.0.0 更新

- **💻 虛擬終端機 v3**：4 種系統選擇（Linux / Kali / macOS / Windows），真實檔案系統模擬，ls/cd/cat/pwd/top/ps/df/free/netstat/ping 完整指令，Kali 專屬 nmap/msfconsole/hashcat/sqlmap/airmon-ng，右側 Agent 面板可下指令讓學生觀看，歷史紀錄持久保存
- **🎨 像素畫板 v2**：256 色調色盤、5 種工具（鉛筆/橡皮/填滿/取色/選取）、網格線、鏡像模式、撤銷重做 50 步、PNG 匯出、4 種預設 palette
- **🎬 影片專區**：修復按鈕不見的問題（FEAT_CATS 分類遺漏），已加入語言包分類
- **🌍 AI 即時翻譯**：選擇語言時 AI 自動翻譯所有中文介面，localStorage 快取
- **📩 管理員發信箱**：管理員可給學生發訊息+獎勵（金幣/鑽石/水晶/星光/榮譽）
- **🔄 Cache-busting**：防止瀏覽器快取舊版 JS/HTML**

## ✨ v3.0 新增

- **🌍 語言自學**：203 種語言可搜尋、可設偏好；AI 自動出題（單字中⇄外配對），答對 **1.3 倍** 經驗／金幣／水晶，每語言答題數個別統計
- **🔒 安全性修復**：公開版移除 Supabase 金鑰，登入改走代理（金鑰只存在你自己的伺服器）

## ⚠️ 免責聲明

1. **教育用途**：免費、開源的教育工具，部署風險由部署者自負。
2. **AI 內容**：AI 回覆由第三方模型（Gemini／OpenAI／DeepSeek／Qwen／Kimi／Ollama）生成，可能出錯；教師請審閱後再使用。AI 功能需自行申請 API 金鑰並負擔費用。
3. **圖片素材**：「收集圖鑑」圖片來自 Bing 即時縮圖，版權屬原作者，載入失敗自動退回 emoji；公開使用請自行確認授權。
4. **學生資料**：帳號、照片、聊天紀錄存在**部署者自己的伺服器**（`data/`、`media/`），資安、備份與個資責任由部署者負責。
5. **無擔保**：MIT 授權「現況」提供，開發者不對任何直接或間接損失負責。
6. 第三方服務完整清單見 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。

## 📸 照片授權政策（CC0）

所有照片一律 **CC0 公眾領域授權**——可自由複製、修改、散布、商用，無需署名。玩家／老師上傳照片**即代表同意以 CC0 授權釋出**（介面已明示）。內建背景請選用 CC0 素材來源（Pixabay／Unsplash／Wikimedia Commons）。

## 📜 開源授權

**MIT License**（見 `LICENSE`）。原始碼在倉庫根目錄：`server.js`（單一檔案，零外部套件）、`public/`（遊戲前端）、`docx_extract.py`（PDF/Word 題目匯入）。

```bash
git clone https://github.com/loyuan1114/Adventurer-Learning-Platform.git
cd Adventurer-Learning-Platform
docker compose up -d --build
```

### 🧩 前端多檔案架構（全畫面懶載入）

```
public/index.html          應用程式外殼（登入、主介面、核心系統）
public/js/shared.js        共用模組（被多個畫面共用時自動產生）
public/js/views/vHome.js   主頁
public/js/views/vCodes.js  兌換碼（沒點進去就完全不載入！）
public/js/views/…          共 70 個畫面，一畫面一檔
```

**用哪個畫面，才載哪個畫面的程式碼**：進入畫面時由 `needJs()` 動態載入對應模組（含依賴），學校舊電腦／低網速也能順暢開局。拆分由 `tools/build/splitall.py` 自動處理，改完 `index.html` 執行：

```bash
python3 tools/build/splitall.py   # 重新切分（Python 3 + Node.js）
node --check public/js/*.js       # 驗證語法
```

### 🛠️ 多語言開發工具鏈

| 語言 | 角色 |
|---|---|
| **JavaScript (Node.js)** | 伺服器（零 npm 套件）與遊戲前端 |
| **Python 3** | 建置工具（`tools/build/` 全畫面切分/合回/驗證）、題目文字擷取（`docx_extract.py`）、跨平台控制工具（`tools/adv9ctl/`） |
| **Shell** | 一鍵安裝與部署腳本 |

## 🚀 部署方法（擇一，全部同一條指令）

**① Codespaces（免費臨時伺服器）**：進倉庫頁 → **Code → Codespaces → Create codespace on main**，在終端機貼上：

```bash
[ -f adv9_public.tgz ] || curl -sL https://raw.githubusercontent.com/loyuan1114/Adventurer-Learning-Platform/main/adv9_public.tgz -o adv9_public.tgz; mkdir -p adv9 && tar xzf adv9_public.tgz -C adv9 && cd adv9 && docker compose up -d --build
```

建置完成後：左邊 **Ports** 面板 → 8080 → 右鍵 → **Port Visibility → Public** → 點 🌐 開啟，把網址貼給學生即可。

> ⚠️ Codespaces 關閉後資料不會馬上消失，但免費時數用完或刪除後**資料會不見**——請定期備份（見下方「備份」）。

**② Ubuntu / Debian（VPS）**：

```bash
command -v docker >/dev/null 2>&1 || curl -fsSL https://get.docker.com | sh; docker compose version >/dev/null 2>&1 || sudo apt-get install -y docker-compose-plugin; [ -f adv9_public.tgz ] || curl -sL https://raw.githubusercontent.com/loyuan1114/Adventurer-Learning-Platform/main/adv9_public.tgz -o adv9_public.tgz; mkdir -p adv9 && tar xzf adv9_public.tgz -C adv9 && cd adv9 && docker compose up -d --build
```

完成後開啟 `http://你的IP:8080`（雲主機請放行 8080）。

**③ 其他 Linux（Fedora / CentOS / Rocky…）**：先 `curl -fsSL https://get.docker.com | sh`（Arch 用 `sudo pacman -S docker docker-compose-plugin docker-buildx` 再 `sudo systemctl enable --now docker`），再執行①的那條下載啟動指令。

**④ macOS**：`brew install --cask docker`（或到 docker.com 下載）→ 開啟 Docker Desktop → 執行①的指令。

**⑤ Windows**：`winget install Docker.DockerDesktop`（或到 docker.com 下載）→ 開啟 Docker Desktop → PowerShell 貼上：

```powershell
if (!(Test-Path adv9_public.tgz)) { curl.exe -sL https://raw.githubusercontent.com/loyuan1114/Adventurer-Learning-Platform/main/adv9_public.tgz -o adv9_public.tgz }
mkdir adv9 -Force | Out-Null; tar xzf adv9_public.tgz -C adv9; Set-Location adv9; docker compose up -d --build
```

開啟 `http://localhost:8080`。

## 🛠️ 管理員設定

| 項目 | 說明 |
|---|---|
| 預設帳號 | `adv9boss` / `admin123` |
| 改密碼 | 登入後到「帳號」頁 |
| 改管理員密碼（進階） | `server.js` 開頭 `MASTER` 設定：`hash` = sha256(`adv9boss|新密碼|ADV9|v1|9f3a7`)，改完重啟 |
| AI 金鑰 | 登入後 → 管理員 → **API 金鑰管理**（Gemini / DeepSeek / Qwen / Kimi / 本地 Ollama 皆可） |

> 🔒 公開版**不含任何 AI 金鑰或學生資料**。金鑰只存在你自己的 `data/kv.json`。

## 🤖 本地 AI（Ollama，免金鑰）

不想用雲端金鑰？安裝 Ollama 讓 AI 全部在本機跑（出題、批改、弱點分析），資料不離開伺服器：

```bash
curl -fsSL https://ollama.com/install.sh | sh && ollama pull huihui_ai/qwen2.5-vl-abliterated:7b
```

- macOS / Windows：到 [Ollama.app](https://ollama.com/download) 下載，終端機貼 `ollama pull huihui_ai/qwen2.5-vl-abliterated:7b`（也可拉 `deepseek-r1-abliterated:7b`）
- 然後登入 → 管理員 → **API 金鑰管理** → 新增 → 供應商選「Ollama 本地」→ 模型選剛下載的 → 「金鑰」欄填 `http://127.0.0.1:11434` → 儲存
- ⚠️ 7B 模型約需 **6~8GB 記憶體**；RAM 不足可改拉 `qwen2.5:1.7b`／`qwen2.5:0.6b`；2GB 小 VPS 建議用雲端 AI
- 模型為第三方 `huihui_ai` 於 Ollama 官方庫發佈的開放權重模型（Qwen2.5-VL、DeepSeek-R1-Distill-Qwen 的微調版），授權以 Ollama 模型頁為準；本專案僅呼叫 API，不含模型權重

### 🔍 AI／工具呼叫全揭露

| 功能 | 呼叫 | 資料流向 |
|---|---|---|
| 🤖 自動出題 | 你設定的供應商（OpenAI/DeepSeek/Gemini/Qwen/Kimi/**Ollama 本地**） | 題目要求 → 供應商 → 回傳題目 |
| 📊 作業弱點分析 | 同上（預設 Ollama 本地） | 每題錯誤統計 → 供應商 → 教學建議（**不含學生個資**） |
| 💬 AI 評語／畢業祝福 | 同上 | 學生姓名、成績摘要 → 供應商 |
| 🔤 字型 | Google Fonts | 瀏覽器載入字型檔 |
| 🖼 縮圖 | Bing | 顯示搜尋縮圖 |
| 📎 Google Drive 教材 | Google Drive（老師貼的連結） | 瀏覽器載入 |

> 完整清單見 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。**只有 Ollama 本地模式**資料完全不離開伺服器。

## 📁 資料與備份

```
data/    帳號、設定、AI 金鑰、作業、聊天紀錄…（json 檔）
media/   上傳的照片、影片
```

- **升級不刪資料**：`docker compose down` 再 `up -d --build` 資料都在
- **完整備份（一行）**：`tar czf backup.tgz data media`
- **還原**：把備份解壓回專案資料夾，`docker compose restart`

## 🗑️ 刪除與卸載

- **停止（資料保留）**：`cd adv9 && docker compose down`（再啟動：`docker compose up -d --build`）
- **全部刪除**：`docker compose down; cd ..; rm -rf adv9 adv9_public.tgz`（Windows：`Set-Location adv9; docker compose down; Set-Location ..; Remove-Item -Recurse -Force adv9`）
- **只刪遊戲留資料**：先 `tar czf backup.tgz data media` 備份再刪整個資料夾
- **卸載 Docker**：Ubuntu/Debian `sudo apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`；Fedora/CentOS 把 apt-get 換成 `dnf remove`；macOS `brew uninstall --cask docker`；Windows `winget uninstall Docker.DockerDesktop`；Codespaces 直接刪整台

## 🖥️ 遠端管理工具（adv9ctl）

用自己的電腦遠端管理伺服器？[`tools/adv9ctl/`](tools/adv9ctl/) 附跨平台控制工具（Windows 可直接用 `adv9ctl.exe`，雙擊）：

```bash
adv9ctl.exe up          # 開公開網址（cloudflared）
adv9ctl.exe status      # 看狀態
adv9ctl.exe restart     # 重啟
```

只用系統內建 `ssh/scp`、免裝套件。詳見 [`tools/adv9ctl/README-adv9ctl.md`](tools/adv9ctl/README-adv9ctl.md)。

## ❓ 常見問題

- **8080 打不開？** 雲主機要放行防火牆／安全群組的 8080；本機無需。
- **Codespaces 網址怎麼給學生？** Ports → 8080 → 右鍵 → Port Visibility → **Public** → 分享轉送網址。
- **要更新程式？** 刪掉舊 `adv9` 資料夾**以外的檔案**，下載最新 `adv9_public.tgz` 解壓覆蓋，`docker compose up -d --build`。**不要刪 `data/` 和 `media/`**。
- **沒裝 Docker？** 直接 `node server.js`（需 Node.js 18+）；作業 PDF 匯入需另裝 `python3`。