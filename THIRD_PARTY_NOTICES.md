# 第三方服務與授權聲明（Third-Party Notices）

本專案以 AGPL-3.0-or-later License 開源（見 `LICENSE`）。以下是程式執行時**所有會對外呼叫的服務、使用的素材與依賴**，確保使用者能自行評估版權與使用風險。

## 一、外部服務（程式執行時會連線）

| 服務 | 用途 | 何時連線 | 版權／授權說明 |
|---|---|---|---|
| **Google Fonts**（`fonts.googleapis.com` / `fonts.gstatic.com`） | 載入網頁字型 **Noto Sans TC**、**Noto Serif TC** | 每次開網頁 | 字型為 **SIL Open Font License 1.1**（可自由使用、嵌入、商用）；字型檔由 Google 伺服器提供，連線時會傳送基本請求資訊 |
| **Microsoft Bing 縮圖服務**（`tse2.mm.bing.net`） | 遊戲內「收集圖鑑」的角色圖片縮圖（即時檢索） | 開啟圖鑑頁面時 | 縮圖來自 Bing 圖像檢索，**僅供課堂教學顯示**；圖片版權屬原作者。載入失敗自動退回內建 emoji 圖示。若用於公開網站請自行確認圖片授權 |
| **Google Drive 影片嵌入**（`drive.google.com/file/d/.../preview`） | 選用功能：管理員把影片放 Google Drive 時，以 `gd:` 前綴嵌入播放 | 僅當影片網址以 `gd:` 開頭 | 影片版權屬上傳者；需管理員自行上傳並確認分享權限 |
| **Google Apps Script**（`script.google.com/macros/...`） | 選用外掛：Google Drive 影片清單自動同步 | 預設**未設定**（`GDRIVE_URL` 為空，不連線） | 需管理員自行建立並提供腳本網址，才會有連線行為 |
| **Supabase**（`supabase.com`） | 舊版架構的選用備援（媒體儲存／帳號建立 RPC） | 僅在部分舊流程失敗時嘗試；**本版預設不使用**（media 存本機） | 需管理員自行建立專案並填入網址才會有連線行為 |

## 二、AI 服務（全部由管理員自行輸入 API 金鑰，可選用）

以下為內建支援的 AI 對話／出題服務，**不會自動連線**——只有管理員在「API 金鑰管理」貼入金鑰後才會呼叫。呼叫所產生的費用由使用者的 API 帳戶自行負擔：

| 服務 | 網址 | 說明 |
|---|---|---|
| Google Gemini | `generativelanguage.googleapis.com` | Google 官方 API |
| OpenAI | `api.openai.com` | OpenAI 官方 API |
| DeepSeek | `api.deepseek.com` | DeepSeek 官方 API |
| 阿里雲通義千問（Qwen） | `dashscope.aliyuncs.com` | 阿里雲百煉平台 API |
| Moonshot Kimi | `api.moonshot.cn` | Moonshot 官方 API |
| **Ollama（本地，免金鑰）** | `http://127.0.0.1:11434`（或自訂位址） | 完全本機執行，**資料不出伺服器**；模型為第三方於 Ollama 模型庫發佈（詳見 README「模型出處與版權聲明」） |

> ⚠️ AI 回覆內容由各模型供應商生成，版權與內容責任歸屬各供應商；本平台僅作為呼叫端轉介。

## 三、軟體依賴（部署環境）

| 依賴 | 用途 | 授權 |
|---|---|---|
| **Node.js**（內建模組，零 npm 套件） | 伺服器執行環境 | MIT（Node.js 本體授權） |
| **Docker 基底映像** `node:20-bookworm-slim` | 容器執行環境 | 官方映像，各層依 Debian 與 Node.js 授權 |
| **Python 3**（apt 安裝） | 作業 PDF/Word 題目文字擷取 | PSF License |
| **pypdf**（選用，需另行 `pip install`） | PDF 文字擷取 | BSD-3-Clause |
| **get.docker.com 安裝腳本**（選用，僅 Ubuntu/Debian 一鍵安裝時用到） | 自動安裝 Docker | Apache-2.0（Docker 官方腳本） |

## 四、內建素材與照片授權政策

- 遊戲內 emoji、符號均為 Unicode 標準字元（Unicode License），免授權
- 題庫、文字內容由平台管理者自行建立，與本專案無關
- 系統未內建任何第三方圖片、音樂、影片檔案（media/ 資料夾為使用者上傳內容）

### 📸 照片（CC0 公眾領域政策）

- **本專案所有照片一律採 CC0 公眾領域授權（Public Domain Dedication，CC0 1.0）**：任何人皆可自由複製、修改、散布、商用，無需署名、無需詢問。
- 玩家／老師上傳的頭像、背景、動態照片，**上傳即代表同意以 CC0 授權釋出**（介面上已有明示）。
- 內建背景請選用 CC0 來源（如 Pixabay、Unsplash、Wikimedia Commons 的 CC0 素材）。
- CC0 全文：<https://creativecommons.org/publicdomain/zero/1.0/legalcode.zh-hant>

---

如有任何版權疑慮，歡迎透過 GitHub Issue 提出，我們會協助處理。