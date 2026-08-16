#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""unify.py — 把「全畫面拆分」的 index.html 合回單一檔（splitall 的反向操作）
   每個 js/views/*.js 模組：用檔案內容取代 index.html 中對應的包裝函式
   js/shared.js：插入在 LOADER 位置；LOADER 一併移除（splitall 會重新產生）
   產出 = 單一 index.html（含全部函式），供 splitall 重新拆分"""
import io, re, os, sys

try:
    sys.stdout.reconfigure(errors="replace")
except Exception:
    pass

ROOT = __file__.replace("\\", "/").rsplit("/", 3)[0]
HTML = ROOT + "/public/index.html"
VIEWS = ROOT + "/public/js/views"
SHARED = ROOT + "/public/js/shared.js"

lines = io.open(HTML, encoding="utf-8").read().split("\n")
crlf = "\r\n" if io.open(HTML, encoding="utf-8", newline="").read().find("\r\n") >= 0 else "\n"

def read_file(p):
    return io.open(p, encoding="utf-8").read().replace("\r\n", "\n").split("\n")

out = []
merged = 0
removed_loader = False
shared_inserted = False
i = 0
n = len(lines)
while i < n:
    ln = lines[i]
    m = re.match(r"^async function (v[A-Z]\w*)\(\)\{\r?$", ln)
    if m and i + 3 < n and "needJs" in lines[i + 1] and lines[i + 3].strip() == "}":
        root = m.group(1)
        path = os.path.join(VIEWS, root + ".js")
        if os.path.exists(path):
            body = read_file(path)
            # 去掉模組頭註解（splitall 產生）
            if body and body[0].strip().startswith("/*") and body[1].strip().startswith("="):
                end = 1
                while end < len(body) and not body[end].strip().endswith("*/"):
                    end += 1
                body = body[end + 1:]
            out.extend(body)
            merged += 1
            i += 4
            continue
    if not removed_loader and ln.strip() == "const JSLOAD={};":
        # 移除 LOADER 註解頭（往上找，含「模組懶載入」字樣的行）
        for k in range(1, 5):
            if i - k >= 0 and out and ("模組懶載入" in out[-1] or out[-1].strip().startswith("/* ═") or out[-1].strip().startswith("═") or out[-1].strip().endswith("*/")):
                out.pop()
        # 吃掉 needJs 函式（到 return out.every(Boolean); 再 +1 行收尾 }）
        j = i + 1
        while j < n and lines[j].strip() != "return out.every(Boolean);":
            j += 1
        j += 1
        if j < n and lines[j].strip() == "}":
            j += 1
        if not shared_inserted and os.path.exists(SHARED):
            body = read_file(SHARED)
            if body and body[0].strip().startswith("/*") and body[1].strip().startswith("="):
                end = 1
                while end < len(body) and not body[end].strip().endswith("*/"):
                    end += 1
                body = body[end + 1:]
            out.extend(body)
            shared_inserted = True
        i = j
        removed_loader = True
        continue
    out.append(ln)
    i += 1

io.open(HTML, "w", encoding="utf-8", newline="").write("\n".join(out).replace("\n", crlf) if crlf == "\r\n" else "\n".join(out))
print("✓ 合回 %d 個畫面模組%s，index.html = %d 行" %
      (merged, ("＋shared" if shared_inserted else ""), len(out)))