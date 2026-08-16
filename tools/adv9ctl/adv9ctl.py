#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ADV9 遠端控制工具 v2（跨平台版：Windows / macOS / Linux）
=========================================================
只用系統內建的 ssh / scp（Windows 10/11 內建 OpenSSH、macOS/Linux 內建），
不需安裝任何 pip 套件。支援「密碼登入」與「SSH 金鑰登入」兩種方式。

兩種用法：
  A) 互動選單：直接執行本檔（或 adv9ctl.exe），照著選單操作。
  B) 命令列：
       python3 adv9ctl.py up            # 開公開網址（主機讀 adv9ctl.ini）
       python3 adv9ctl.py url           # 查目前公開網址
       python3 adv9ctl.py status        # 看後端/通道/區網狀態
       python3 adv9ctl.py down          # 關閉公開通道
       python3 adv9ctl.py restart       # 重啟後端＋通道
       python3 adv9ctl.py deploy        # 上傳 server/ 內容並重啟
       python3 adv9ctl.py test          # 測試 SSH 連線
       python3 adv9ctl.py <IP> up       # 指定主機 + 指令

設定檔：與本程式同層的 adv9ctl.ini（第一次互動操作後自動產生），範例：
  HOST=你的伺服器IP或網址
  USER=你的登入帳號
  PORT=22
  PASSWORD=            # 留空＝每次詢問；想免輸入可填（注意：明文存放，自己保管好）
  APPDIR=/home/你的帳號/adv9    # 後端程式資料夾（放 server.js 與 public/）
  SVC=adv9             # 後端 systemd 服務名（用 Docker 安裝的請見下）
  TUNNEL=adv9-tunnel   # 公開通道 systemd 服務名（cloudflared）
  MODE=systemd         # systemd（Linux 服務）或 docker（Docker Compose）
  SERVER_SRC=server    # deploy 用的本機資料夾（與本檔同層的 server/，可改路徑）
"""
import os, sys, time, tempfile, subprocess, getpass

__version__ = "2.0"

def base_dir():
    if getattr(sys, "frozen", False):
        return os.path.dirname(sys.executable)   # exe 所在資料夾
    return os.path.dirname(os.path.abspath(__file__))

INI = os.path.join(base_dir(), "adv9ctl.ini")
IS_WIN = sys.platform.startswith("win")

# ---------- 設定載入 ----------
DEFAULTS = {
    "HOST": "", "USER": "", "PORT": "22", "PASSWORD": "",
    "APPDIR": "", "SVC": "adv9", "TUNNEL": "adv9-tunnel",
    "MODE": "systemd", "SERVER_SRC": "server",
}
CFG = dict(DEFAULTS)

def load_ini():
    try:
        with open(INI, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip().upper(); v = v.strip()
                if k in CFG:
                    CFG[k] = v
    except OSError:
        pass

def save_ini():
    try:
        with open(INI, "w", encoding="utf-8") as f:
            f.write("# ADV9 遠端控制設定（首次操作後自動產生，可自行編輯）\n")
            for k in DEFAULTS:
                f.write("%s=%s\n" % (k, CFG[k]))
    except OSError:
        pass

# ---------- SSH 底層 ----------
SSH_OPTS = ["-o", "StrictHostKeyChecking=no", "-o", "UserKnownHostsFile=" + os.devnull,
            "-o", "ConnectTimeout=15"]

def _askpass_file(pw):
    if IS_WIN:
        f = tempfile.NamedTemporaryFile("w", suffix=".cmd", delete=False, encoding="ascii")
        f.write("@echo off\necho %s\n" % pw); f.close()
    else:
        f = tempfile.NamedTemporaryFile("w", suffix=".sh", delete=False, encoding="ascii")
        f.write("#!/bin/sh\necho '%s'\n" % pw.replace("'", "'\\''")); f.close()
        try: os.chmod(f.name, 0o700)
        except OSError: pass
    return f.name

def _env(ap):
    e = dict(os.environ)
    if ap:
        e["SSH_ASKPASS"] = ap
        e["SSH_ASKPASS_REQUIRE"] = "force"
        if not IS_WIN:
            e["DISPLAY"] = "localhost:0"
    return e

def ssh_base():
    return ["ssh"] + SSH_OPTS + ["-p", str(CFG["PORT"]),
                                 "%s@%s" % (CFG["USER"], CFG["HOST"])]

def has_tty():
    try:
        return sys.stdin.isatty()
    except Exception:
        return False

def run_remote(cmd, use_sudo=False, feed_pw=False):
    """執行遠端指令。密碼策略：
       1) 設定檔有 PASSWORD → 用 askpass（Windows 用 .cmd；macOS/Linux 用 .sh + setsid）
       2) 無密碼、但終端是 tty（macOS/Linux 終端機）→ 讓 ssh 自己互動詢問
       3) 無密碼、也無 tty（exe 雙擊）→ 嘗試 SSH 金鑰（金鑰已裝好就能用）
    """
    pw = CFG.get("PASSWORD", "")
    ap = None
    if pw:
        ap = _askpass_file(pw)
    remote = cmd
    if use_sudo:
        remote = "sudo -S " + remote if pw else "sudo " + remote
    argv = ssh_base() + [remote]
    try:
        if IS_WIN:
            # Windows：必須 askpass（雙擊 exe 無 tty）
            return subprocess.run(argv, env=_env(ap), text=True,
                                  input=(pw + "\n") if (use_sudo and pw) else None,
                                  capture_output=True)
        # macOS / Linux
        if pw:
            # 用 setsid 脫離 tty 才能觸發 askpass；沒有 setsid 就退回首尾直接跑（macOS 可改用金鑰）
            setsid = "/usr/bin/setsid" if os.path.exists("/usr/bin/setsid") else \
                     ("/bin/setsid" if os.path.exists("/bin/setsid") else None)
            if setsid:
                argv = [setsid, "-w"] + argv
                return subprocess.run(argv, env=_env(ap), text=True,
                                      input=(pw + "\n") if (use_sudo and pw) else None,
                                      capture_output=True)
        return subprocess.run(argv, env=_env(ap) if ap else os.environ, text=True,
                              input=(pw + "\n") if (use_sudo and pw) else None,
                              capture_output=True)
    finally:
        if ap:
            try: os.remove(ap)
            except OSError: pass

def run_scp(local, remote, feed_pw=False):
    pw = CFG.get("PASSWORD", "")
    ap = _askpass_file(pw) if pw else None
    argv = ["scp"] + SSH_OPTS + ["-P", str(CFG["PORT"]), "-r", local,
                                 "%s@%s:%s" % (CFG["USER"], CFG["HOST"], remote)]
    try:
        if IS_WIN:
            return subprocess.run(argv, env=_env(ap), text=True, capture_output=True)
        if pw and (os.path.exists("/usr/bin/setsid") or os.path.exists("/bin/setsid")):
            s = "/usr/bin/setsid" if os.path.exists("/usr/bin/setsid") else "/bin/setsid"
            argv = [s, "-w"] + argv
            return subprocess.run(argv, env=_env(ap), text=True, capture_output=True)
        return subprocess.run(argv, env=_env(ap) if ap else os.environ, text=True,
                              capture_output=True)
    finally:
        if ap:
            try: os.remove(ap)
            except OSError: pass

def ok(r):
    return r and r.returncode == 0

def show(r, label):
    if ok(r):
        out = (r.stdout or "").strip()
        print(out if out else "✔ %s 完成" % label)
    else:
        print("✖ %s 失敗：" % label)
        print((r.stderr or r.stdout or "").strip() or "（無回應，請確認主機與帳號密碼是否正確）")

# ---------- 指令 ----------
def cmd_test():
    r = run_remote("echo PONG && whoami && hostname")
    show(r, "SSH 連線測試")

def get_url():
    r = run_remote("journalctl -u %s --no-pager 2>/dev/null | "
                   "grep -Eo 'https://[a-z0-9-]+\\.trycloudflare\\.com' | tail -1" % CFG["TUNNEL"],
                   use_sudo=True, feed_pw=True)
    return (r.stdout or "").strip()

def cmd_status():
    r = run_remote("echo backend=$(systemctl is-active %s); "
                   "echo tunnel=$(systemctl is-active %s); "
                   "echo lan=$(hostname -I | awk '{print $1}')"
                   % (CFG["SVC"], CFG["TUNNEL"]), use_sudo=True, feed_pw=True)
    show(r, "狀態查詢")

def cmd_up():
    print("→ 開啟公開通道…")
    run_remote("systemctl start %s" % CFG["TUNNEL"], use_sudo=True, feed_pw=True)
    print("→ 等待網址（最多 40 秒）…")
    for _ in range(20):
        time.sleep(2)
        u = get_url()
        if u:
            print("\n🌍 公開網址： " + u)
            print("（把這個網址發給學生即可；用完記得 down）")
            return
    print("尚未取得網址，稍後再選『查網址』。")

def cmd_url():
    u = get_url()
    print("🌍 公開網址： " + u if u else "（通道未開，請先選『開公開網址』）")

def cmd_down():
    run_remote("systemctl stop %s" % CFG["TUNNEL"], use_sudo=True, feed_pw=True)
    print("✔ 已關閉公開通道（後端仍在跑）")

def _restart_backend():
    if CFG["MODE"] == "docker":
        r = run_remote("cd %s && docker compose restart" % (CFG["APPDIR"] or "."),
                       use_sudo=True, feed_pw=True)
    else:
        r = run_remote("systemctl restart %s" % CFG["SVC"], use_sudo=True, feed_pw=True)
    show(r, "重啟後端")

def cmd_restart():
    _restart_backend()
    run_remote("systemctl restart %s" % CFG["TUNNEL"], use_sudo=True, feed_pw=True)
    print("✔ 已重啟後端＋通道")
    time.sleep(3)
    cmd_status()

def cmd_deploy():
    src = CFG["SERVER_SRC"] or "server"
    if not os.path.isabs(src):
        src = os.path.join(base_dir(), src)
    if not os.path.isdir(src):
        print("✖ 找不到來源資料夾：%s" % src)
        print("  請在 adv9ctl.ini 設定 SERVER_SRC=你的資料夾，或把 server/ 放到本程式同層。")
        return
    appdir = CFG["APPDIR"] or "/home/%s/adv9" % CFG["USER"]
    print("→ 上傳 %s 到 %s:%s …" % (src, CFG["HOST"], appdir))
    if os.path.isfile(os.path.join(src, "server.js")):
        run_scp(os.path.join(src, "server.js"), appdir + "/server.js")
    if os.path.isdir(os.path.join(src, "public")):
        run_scp(os.path.join(src, "public"), appdir + "/")
    for extra in ["docx_extract.py", "package.json", "Dockerfile",
                  "docker-compose.yml", "docker-entrypoint.sh"]:
        p = os.path.join(src, extra)
        if os.path.isfile(p):
            run_scp(p, appdir + "/" + extra)
    _restart_backend()
    print("✔ 佈署完成，後端已重啟。要開公開網址請選『開公開網址』。")

CMDS = {"test": cmd_test, "status": cmd_status, "up": cmd_up, "url": cmd_url,
        "down": cmd_down, "restart": cmd_restart, "deploy": cmd_deploy}

MENU = [("1", "開公開網址（上課前）", cmd_up),
        ("2", "查目前公開網址", cmd_url),
        ("3", "看狀態", cmd_status),
        ("4", "關閉公開（下課後）", cmd_down),
        ("5", "重啟後端＋通道", cmd_restart),
        ("6", "重新佈署 server/（進階）", cmd_deploy),
        ("7", "SSH 連線測試", cmd_test),
        ("0", "離開", None)]

# ---------- 互動選單 ----------
def ask_config(first_time=False):
    def ask(label, key, secret=False):
        cur = CFG.get(key, "")
        if first_time and not cur and key in ("HOST", "USER"):
            cur = "" if key == "HOST" else os.getenv("USER", "")
        if secret and cur:
            v = input("%s（直接 Enter 沿用現有）： " % label).strip()
            if not v:
                return
        else:
            hint = ("（直接 Enter = %s）" % cur) if cur else ""
            v = input("%s%s： " % (label, hint)).strip()
            if not v and cur:
                v = cur
        CFG[key] = v
        if key == "HOST" and v:
            save_ini()
    ask("請輸入伺服器 IP 或網址", "HOST")
    ask("登入帳號", "USER")
    ask("SSH 連接埠", "PORT")
    ask("SSH 密碼（留空＝用金鑰登入）", "PASSWORD", secret=True)
    ask("後端資料夾（伺服器上放 server.js 的位置，如 /home/帳號/adv9）", "APPDIR")
    if first_time:
        print("  提示：其餘設定（服務名、MODE、SERVER_SRC 等）可之後編輯同層的 adv9ctl.ini。")
    print("\n使用： %s@%s:%s  （APPDIR=%s）" % (CFG["USER"], CFG["HOST"], CFG["PORT"], CFG["APPDIR"] or "-"))
    save_ini()

def interactive():
    print("=" * 46)
    print(" ADV9 遠端控制工具 v%s（跨平台）" % __version__)
    print("=" * 46)
    first = not os.path.exists(INI)
    ask_config(first_time=first)
    while True:
        print("\n---- 請選擇 ----")
        for k, label, _ in MENU:
            print("  %s) %s" % (k, label))
        c = input("輸入編號： ").strip()
        if c == "0":
            break
        fn = dict((k, f) for k, _, f in MENU).get(c)
        if fn:
            print()
            try: fn()
            except Exception as e: print("發生錯誤：", e)
        else:
            print("沒有這個選項。")
    input("\n已結束，按 Enter 關閉視窗…")

def main():
    try:
        sys.stdout.reconfigure(errors="replace")
        sys.stderr.reconfigure(errors="replace")
    except Exception:
        pass
    load_ini()
    args = sys.argv[1:]
    host_arg = None
    while args:
        a = args[0]
        if a in CMDS:
            break
        host_arg = a
        args = args[1:]
    if host_arg:
        CFG["HOST"] = host_arg
        save_ini()
    if args and args[0] in CMDS:
        if not CFG["USER"]:
            CFG["USER"] = input("請輸入登入帳號： ").strip()
            save_ini()
        try:
            CMDS[args[0]]()
        except KeyboardInterrupt:
            print("\n已取消。")
    elif args:
        print(__doc__)
    else:
        interactive()

if __name__ == "__main__":
    main()