# 🛠️ ADV9 遠端控制工具（adv9ctl）

用你自己的電腦（Windows / macOS / Linux）遠端管理 ADV9 伺服器：
開關公開網址、查狀態、重啟、重新佈署，全部用系統內建 `ssh` / `scp`，**不用裝任何套件**。

## 檔案

| 檔名 | 說明 |
|---|---|
| `adv9ctl.py` | 主程式（Python 3.7+ 直接跑） |
| `adv9ctl.exe` | Windows 免 Python 版（雙擊即可） |
| `adv9ctl.ini.example` | 設定範例，改名成 `adv9ctl.ini` 即可 |

## 安裝（各系統）

**Windows**：直接用 `adv9ctl.exe`（雙擊）或 `python adv9ctl.py`。Windows 10/11 內建 OpenSSH，免安裝。

**macOS**：內建 ssh/scp，終端機直接 `python3 adv9ctl.py` 或 `chmod +x adv9ctl.py && ./adv9ctl.py`。

**Linux**：同上，`python3 adv9ctl.py`。

## 使用

### 互動選單（雙擊 / 直接執行）
第一次執行會依序問你：**伺服器 IP、帳號、連接埠、密碼（可留空用金鑰）、後端資料夾**，
之後會存到同層 `adv9ctl.ini`，下次直接 Enter 沿用。

選單功能：
1. 開公開網址（上課前）— 啟動 cloudflared 通道並回報網址
2. 查目前公開網址
3. 看狀態（後端 / 通道 / 區網 IP）
4. 關閉公開（下課後）
5. 重啟後端＋通道
6. 重新佈署 server/（進階）
7. SSH 連線測試

### 命令列（一排搞定）

```bash
python3 adv9ctl.py up            # 開公開網址
python3 adv9ctl.py url           # 查網址
python3 adv9ctl.py status        # 看狀態
python3 adv9ctl.py down          # 關公開
python3 adv9ctl.py restart       # 重啟後端＋通道
python3 adv9ctl.py deploy        # 上傳 server/ 並重啟
python3 adv9ctl.py test          # 測連線
python3 adv9ctl.py 你的IP up     # 指定主機 + 指令
```

## 設定檔 adv9ctl.ini

```ini
HOST=你的伺服器IP或網址
USER=你的登入帳號
PORT=22
PASSWORD=            # 留空＝每次輸入或用 SSH 金鑰
APPDIR=/home/帳號/adv9    # 伺服器上放 server.js 與 public/ 的資料夾
SVC=adv9             # 後端服務名
TUNNEL=adv9-tunnel   # cloudflared 服務名
MODE=systemd         # systemd 或 docker
SERVER_SRC=server    # 本機要上傳的資料夾
```

## 密碼與安全

- **建議用 SSH 金鑰**：`ssh-keygen` 產生後把公鑰放上伺服器 `~/.ssh/authorized_keys`，`PASSWORD=` 留空即可，最安全。
- 密碼若寫進 ini 是**明文**，只適合可信賴的私人電腦。
- 連線一律走 SSH（加密），密碼不會出現在畫面上。

## 注意

- 公開通道需要伺服器上有安裝 cloudflared 並建立 `adv9-tunnel` 服務；沒有通道服務的環境，`up/url/down` 會回報失敗，其他功能不受影響。
- `deploy` 會上傳 `server.js`、`public/`、`docx_extract.py`、`package.json`、Docker 檔到 APPDIR 並重啟後端。
- Docker 安裝（MODE=docker）時 `restart` 改用 `docker compose restart`。