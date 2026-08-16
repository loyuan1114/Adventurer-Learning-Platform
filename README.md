# 🎮 冒險者學習平台

單一 Node.js 伺服器、零套件依賴（只用 Node 內建模組）。內建：答題冒險、抽卡養成、公會對戰、作業發布、AI 助理、社群互動等遊戲化學習功能。

- **免安裝任何軟體**：GitHub Codespaces 開箱即用
- **Docker 一鍵部署**：任何 Linux / macOS / Windows
- **資料全在本機**：帳號、設定、AI 金鑰都在 `data/` 與 `media/` 資料夾，換機複製就走
- **預設管理員**：`adv9boss` / `admin123`（**首次登入請改密碼**）

---

## 🎯 遊戲介紹

一款**把課業變成冒險遊戲**的學習平台，學生登入就像進入一個 RPG 世界：

- **📚 答題冒險**：數學、國文、英文、自然、社會五科題庫，答對推進冒險地圖、挑戰 BOSS、累積經驗升級
- **⚔️ 戰鬥對決**：班級 PK 賽、競技場爬塔、公會戰，考驗學生的知識與策略
- **🎁 抽卡養成**：收集角色、寵物、動漫夥伴；鍛造與洗練裝備、領土經營、星球資源
- **🤖 AI 助理**：寵物會長大、會跟你聊天；AI 自動出題、解題輔助（需在管理員設定 AI 金鑰）
- **📝 作業系統**：老師一鍵發布作業（支援 **Word / PDF 題目自動匯入**與全班／全年級發布）、學生繳交、自動批改統計
- **💬 社群互動**：好友、私訊、貼文動態、送禮、公會聊天
- **🏆 成就與商城**：稱號、成就徽章、兌換商城、課金點數與優惠券系統
- **⚙️ 管理後台**：帳號批次管理、題庫管理、作業發布、AI 金鑰管理、系統設定

> 老師管理、學生遊玩、家長安心——全部在同一個網址，免安裝、免註冊，開瀏覽器就能玩。

---

## ⚠️ 免責聲明

1. **教育用途**：本平台為免費、開源的教育工具，僅供教學與學習使用；使用與部署風險由部署者自負。
2. **AI 內容**：AI 回覆由第三方模型供應商（Gemini／OpenAI／DeepSeek／Qwen／Kimi）生成，內容不代表本平台立場，可能出錯或涉版權；教師請審閱 AI 出題與回覆內容後再使用。使用 AI 功能需自行申請 API 金鑰並負擔費用。
3. **圖片素材**：遊戲內「收集圖鑑」圖片來自 Microsoft Bing 圖像檢索的即時縮圖，版權屬原作者，僅供課堂教學顯示；載入失敗會自動退回 emoji。公開網站使用時請自行確認授權。
4. **學生資料**：帳號、照片、影片、聊天紀錄等資料儲存在**部署者自己的伺服器**（`data/`、`media/`），資料安全、備份與個資保護責任由部署者負責。
5. **無擔保**：本專案依 MIT 授權「現況」提供，不提供任何明示或默示擔保，開發者不對任何直接或間接損失負責。
6. **第三方服務**：本專案會連線的外部服務與其授權，完整清單見 `THIRD_PARTY_NOTICES.md`。

---

## 📜 開源授權

本專案以 **MIT License** 開源（見 `LICENSE`）。歡迎自由使用、修改、複製、商用，只需保留版權宣告。

- **原始碼**就在本倉庫根目錄：`server.js`（單一檔案，零外部套件）、`public/`（遊戲前端）、`docx_extract.py`（PDF/Word 題目匯入）
- 想自己改程式？直接 clone 下來就能建置：
  ```bash
  git clone https://github.com/loyuan1114/Adventurer-Learning-Platform.git
  cd Adventurer-Learning-Platform
  docker compose up -d --build
  ```
- 不會程式也沒關係：上面的安裝方法二～五用現成 `adv9_public.tgz` 就能跑，兩種方式結果一樣

---

## 🚀 方法一：GitHub Codespaces（最簡單，免費臨時伺服器）

1. 開一個 GitHub 帳號，進到本倉庫頁面
2. 點 **Code → Codespaces → Create codespace on main**
3. **Docker 已內建**，免安裝（可用 `docker --version` 確認版本）
4. 在終端機（Terminal）貼上這一行：

```bash
[ -f adv9_public.tgz ] || curl -sL https://raw.githubusercontent.com/loyuan1114/Adventurer-Learning-Platform/main/adv9_public.tgz -o adv9_public.tgz; mkdir -p adv9 && tar xzf adv9_public.tgz -C adv9 && cd adv9 && docker compose up -d --build
```

5. 建置完成後，左邊 **Ports（連接埠）** 面板 → 找到 **8080** → 滑鼠右鍵 → **Port Visibility → Public**
6. 點 🌐 圖示開啟，或把網址貼給學生就能玩

> ⚠️ 注意：Codespaces 關閉後資料不會馬上消失，但免費時數用完或你刪除 Codespaces 後**資料會不見**——重要資料請定期備份（見下方「備份」）。

---

## 🐧 方法二：Ubuntu / Debian（VPS、雲主機）

**一整行搞定**（自動安裝 Docker → 下載 → 啟動）：

```bash
command -v docker >/dev/null 2>&1 || curl -fsSL https://get.docker.com | sh; docker compose version >/dev/null 2>&1 || sudo apt-get install -y docker-compose-plugin; [ -f adv9_public.tgz ] || curl -sL https://raw.githubusercontent.com/loyuan1114/Adventurer-Learning-Platform/main/adv9_public.tgz -o adv9_public.tgz; mkdir -p adv9 && tar xzf adv9_public.tgz -C adv9 && cd adv9 && docker compose up -d --build
```

完成後開啟 `http://你的IP:8080`（記得在雲主機的防火牆／安全群組放行 8080）。

---

## 💻 方法三：其他 Linux（Fedora / CentOS / Rocky…）

**步驟 1：安裝 Docker**（`get.docker.com` 支援主流發行版，會自動偵測並安裝含 compose 外掛）：

```bash
curl -fsSL https://get.docker.com | sh
```

> Arch 用：`sudo pacman -S docker docker-compose-plugin docker-buildx` 再 `sudo systemctl enable --now docker`

**步驟 2：下載並啟動遊戲**：

```bash
[ -f adv9_public.tgz ] || curl -sL https://raw.githubusercontent.com/loyuan1114/Adventurer-Learning-Platform/main/adv9_public.tgz -o adv9_public.tgz; mkdir -p adv9 && tar xzf adv9_public.tgz -C adv9 && cd adv9 && docker compose up -d --build
```

---

## 🍎 方法四：macOS

**步驟 1：安裝 Docker Desktop**（二選一）：

```bash
brew install --cask docker
```

或到 https://www.docker.com/products/docker-desktop/ 下載安裝。

**步驟 2：開啟 Docker Desktop**（首次請等它啟動完成）

**步驟 3：打開「終端機」，貼上**：

```bash
[ -f adv9_public.tgz ] || curl -sL https://raw.githubusercontent.com/loyuan1114/Adventurer-Learning-Platform/main/adv9_public.tgz -o adv9_public.tgz; mkdir -p adv9 && tar xzf adv9_public.tgz -C adv9 && cd adv9 && docker compose up -d --build
```

---

## 🪟 方法五：Windows

**步驟 1：安裝 Docker Desktop**（二選一）：

```powershell
winget install Docker.DockerDesktop
```

或到 https://www.docker.com/products/docker-desktop/ 下載安裝。

**步驟 2：開啟 Docker Desktop**（首次請等它啟動完成）

**步驟 3：打開 PowerShell，貼上**：

```powershell
if (!(Test-Path adv9_public.tgz)) { curl.exe -sL https://raw.githubusercontent.com/loyuan1114/Adventurer-Learning-Platform/main/adv9_public.tgz -o adv9_public.tgz }
mkdir adv9 -Force | Out-Null; tar xzf adv9_public.tgz -C adv9; Set-Location adv9; docker compose up -d --build
```

**步驟 4：開啟 `http://localhost:8080`**

---

## 🛠️ 管理員設定

| 項目 | 說明 |
|---|---|
| 預設帳號 | `adv9boss`，密碼 `admin123` |
| 改密碼 | 登入後到「帳號」頁修改 |
| 改管理員密碼（進階） | 管理員密碼寫在 `server.js` 開頭的 `MASTER` 設定裡：`hash` = sha256(`adv9boss|新密碼|ADV9|v1|9f3a7`)，改完重啟容器 |
| AI 金鑰 | 登入後 → 管理員 → **API 金鑰管理** → 貼上你的金鑰（Gemini / DeepSeek / Qwen / Kimi / 本地 Ollama 皆可） |

> 🔒 本公開版**不含任何 AI 金鑰或學生資料**。金鑰貼上後只存在**你自己的** `data/kv.json`，不會外洩；別人部署是全新空環境。

---

## 🤖 本地 AI（Ollama，免金鑰）

不想用雲端 AI 金鑰？可安裝 **Ollama**，讓遊戲在本機跑 AI（出題、批改、弱點分析全可走本地模型，資料完全不離開你的伺服器）。

### 一鍵命令（Linux，安裝 Ollama + 下載模型一次搞定）

**推薦：Qwen2.5 7B（出題/分析全能）**：

```bash
curl -fsSL https://ollama.com/install.sh | sh && ollama pull huihui_ai/qwen2.5-vl-abliterated:7b
```

**或：DeepSeek R1 7B（推理強、數學好）**：

```bash
curl -fsSL https://ollama.com/install.sh | sh && ollama pull huihui_ai/deepseek-r1-abliterated:7b
```

**兩顆都要（模型可隨時切換）**：

```bash
curl -fsSL https://ollama.com/install.sh | sh && ollama pull huihui_ai/qwen2.5-vl-abliterated:7b && ollama pull huihui_ai/deepseek-r1-abliterated:7b
```

> macOS / Windows 沒有這種安裝法，直接到 [Ollama.app 官網](https://ollama.com/download) 下載安裝，再開啟「終端機／命令提示字元」貼上 `ollama pull huihui_ai/qwen2.5-vl-abliterated:7b`（或 deepseek-r1 那條）即可。

### 如何使用本地模型

**① 確認 Ollama 服務有開**：`ollama serve`（Linux 裝成服務的會自動啟動），瀏覽器開 `http://127.0.0.1:11434` 有回應代表正常。

**② 到遊戲設定 Ollama**：登入 → 管理員 → **API 金鑰管理** → 新增 →

1. 供應商選 **「Ollama 本地」**
2. 模型選你剛剛下載的（`huihui_ai/qwen2.5-vl-abliterated:7b` 或 `huihui_ai/deepseek-r1-abliterated:7b`，也可自訂）
3. 「金鑰」欄位填 **`http://127.0.0.1:11434`**（Ollama 主機位址；若 Ollama 裝在別的機器，就填那台的網址，例如 `http://192.168.1.50:11434`）
4. 儲存

之後所有 AI 功能（自動出題、作業弱點分析、AI 評語…）就會優先用本地模型，完全不需要任何 API 金鑰、不花一毛錢。

> ⚠️ 7B 模型約需 **6~8GB 記憶體**。RAM 不到 4GB 的機器請改拉 `qwen2.5:1.7b` 或 `qwen2.5:0.6b`；只有 2GB 的小 VPS 建議繼續用雲端 AI。
>
> Ollama 呼叫走自架伺服器代理（`/rest/v1/ai/ollama`），模型與題目**不會上傳到任何第三方**。

---

## 📁 資料與備份

所有資料都在兩個資料夾：

```
data/    帳號、設定、AI 金鑰、作業、聊天紀錄…（json 檔）
media/   上傳的照片、影片
```

- **升級容器不會刪資料**：`docker compose down` 再 `up -d --build` 資料都還在
- **完整備份**（一行）：
  ```bash
  tar czf backup.tgz data media
  ```
- **還原**：把備份檔放到專案資料夾，解壓即可：
  ```bash
  tar xzf backup.tgz
  docker compose restart
  ```

---

## 🗑️ 刪除與卸載

**只想停止遊戲（資料保留）**：

```bash
cd adv9 && docker compose down
```

想再啟動：`cd adv9 && docker compose up -d --build`（或 `docker compose start`）

**刪除遊戲（連資料一起刪）**：

```bash
docker compose down; cd ..; rm -rf adv9 adv9_public.tgz
```

Windows PowerShell 版：

```powershell
Set-Location adv9; docker compose down; Set-Location ..; Remove-Item -Recurse -Force adv9
```

**刪掉遊戲但保留資料**：只刪 `adv9` 資料夾裡 `data/`、`media/` 以外的檔案（或先 `tar czf backup.tgz data media` 備份再整個刪）。

**卸載 Docker**：

| 平台 | 指令 |
|---|---|
| Ubuntu/Debian | `sudo apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras` 再 `sudo rm -rf /var/lib/docker` |
| Fedora/CentOS | `sudo dnf remove -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin` 再 `sudo rm -rf /var/lib/docker` |
| macOS | `brew uninstall --cask docker`（或把 Docker Desktop 拖進垃圾桶） |
| Windows | `winget uninstall Docker.DockerDesktop`（或 設定 → 應用程式 → Docker Desktop → 解除安裝） |
| Codespaces | 不用卸載 Docker——直接在 GitHub 倉庫頁 **Code → Codespaces → 你的 Codespaces → … → Delete** 整台刪掉 |

---

## ❓ 常見問題

**Q：8080 打不開？**
雲主機要放行防火牆／安全群組的 8080 連接埠；本機（localhost）則無需。

**Q：Codespaces 的網址要怎麼給學生？**
Ports 面板 → 8080 → 右鍵 → Port Visibility → **Public**，再用 🌐 開啟；也可以直接分享「轉送網址」（Forwarded Address）。

**Q：要更新程式？**
刪掉舊的 `adv9` 資料夾**以外的檔案**，重新下載最新的 `adv9_public.tgz` 解壓覆蓋，然後 `docker compose up -d --build`。**不要刪 `data/` 和 `media/`**，帳號資料才會保留。

**Q：沒裝 Docker 的舊版怎麼跑？**
直接 `node server.js`（需 Node.js 18+）；作業 PDF 匯入需另裝 `python3`。
