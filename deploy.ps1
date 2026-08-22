# ADV9 一鍵部署腳本（Windows）
# 自動安裝 Docker Desktop（如未安裝）→ 建置映像 → 啟動服務
# 用法：右鍵 → 用 PowerShell 執行，或在 PowerShell 中執行 .\deploy.ps1

$ErrorActionPreference="Stop"
$REPO="loyuan1114/Adventurer-Learning-Platform"
$PORT=8080

function Write-Step($msg){Write-Host "`n=== $msg ===" -ForegroundColor Cyan}
function Write-Ok($msg){Write-Host "  OK: $msg" -ForegroundColor Green}
function Write-Bad($msg){Write-Host "  ERROR: $msg" -ForegroundColor Red}

# --- 1. 檢查 Docker ---
Write-Step "1/4 檢查 Docker"
$docker=$null
try{$docker=(Get-Command docker -ErrorAction SilentlyContinue).Source}catch{}
if($docker){
  Write-Ok "Docker 已安裝: $docker"
}else{
  Write-Host "  Docker 未安裝，正在自動安裝 Docker Desktop..." -ForegroundColor Yellow

  # 嘗試 winget
  $winget=$null
  try{$winget=(Get-Command winget -ErrorAction SilentlyContinue).Source}catch{}
  if($winget){
    Write-Host "  使用 winget 安裝..."
    winget install Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
  }else{
    # 手動下載安裝
    $tmp="$env:TEMP\DockerDesktopInstaller.exe"
    $url="https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
    Write-Host "  下載 Docker Desktop... (約 500MB)"
    Invoke-WebRequest -Uri $url -OutFile $tmp -UseBasicParsing
    Write-Host "  安裝中... (可能需要管理員權限)"
    Start-Process -FilePath $tmp -ArgumentList "install","--quiet","--accept-license" -Wait
  }

  Write-Host "`n  Docker Desktop 已安裝，請重開機後再執行此腳本。" -ForegroundColor Yellow
  Write-Host "  或者手動啟動 Docker Desktop 後再執行。" -ForegroundColor Yellow

  # 檢查 Docker 是否現在可用
  $docker=$null
  try{$docker=(Get-Command docker -ErrorAction SilentlyContinue).Source}catch{}
  if(-not $docker){
    Write-Host "`n  請重開機或啟動 Docker Desktop 後再執行此腳本。" -ForegroundColor Red
    exit 1
  }
}

# --- 2. 複製部署檔案到 adv9 目錄 ---
Write-Step "2/4 準備檔案"
$scriptDir=Split-Path -Parent $MyInvocation.MyCommand.Definition
$projDir="D:\Windows11LTSC\Users\weimyown\adv9"
if(-not (Test-Path "$projDir\server.js")){
  # 嘗試同目錄
  $projDir=$scriptDir
}
if(-not (Test-Path "$projDir\server.js")){
  Write-Bad "找不到 adv9 專案目錄（server.js）"
  Write-Host "  請將此腳本放在 adv9 目錄中，或修改 \$projDir 變數" -ForegroundColor Yellow
  exit 1
}
Write-Ok "專案目錄: $projDir"

# 確保 Dockerfile 存在
if(-not (Test-Path "$projDir\Dockerfile")){
  Write-Bad "找不到 Dockerfile，請確認檔案完整"
  exit 1
}

# --- 3. 建置 Docker 映像 ---
Write-Step "3/4 建置 Docker 映像"
Push-Location $projDir
docker build -t adv9 . 2>&1
if($LASTEXITCODE -ne 0){Write-Bad "Docker build 失敗";Pop-Location;exit 1}
Write-Ok "映像建置完成"

# --- 4. 啟動服務 ---
Write-Step "4/4 啟動 ADV9 服務"
# 先停舊容器
docker compose down 2>$null
docker compose up -d 2>&1
if($LASTEXITCODE -ne 0){Write-Bad "docker compose up 失敗";Pop-Location;exit 1}
Pop-Location

Start-Sleep -Seconds 3
$listening=netstat -ano | Select-String ":$PORT.*LISTEN"
if($listening){
  Write-Ok "ADV9 已啟動！"
  Write-Host "`n  === http://127.0.0.1:$PORT ===" -ForegroundColor Green -BackgroundColor Black
  Write-Host "  管理員: adv9boss / admin123" -ForegroundColor Gray
  Write-Host "  停止: docker compose down" -ForegroundColor Gray
  Write-Host "  日誌: docker compose logs -f" -ForegroundColor Gray
  # 自動開啟瀏覽器
  Start-Process "http://127.0.0.1:$PORT"
}else{
  Write-Host "  容器已啟動，等待服務就緒..." -ForegroundColor Yellow
  Start-Sleep -Seconds 5
  $listening=netstat -ano | Select-String ":$PORT.*LISTEN"
  if($listening){
    Write-Ok "ADV9 已啟動！http://127.0.0.1:$PORT"
    Start-Process "http://127.0.0.1:$PORT"
  }else{
    Write-Bad "服務似乎未正常啟動，請執行 docker compose logs 查看日誌"
  }
}
