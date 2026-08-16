#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ADV9 前端「多檔懶載入」拆分工具（build 工具鏈：Python 做建置）
==============================================================
把 public/index.html 的大型 <script> 切成多個 js/ 模組：
  js/bank.js    題庫（BANK、bankQ、procMathQ、shuffleQ、qHash、fallbackQ）
  js/quiz.js    修練場答題流程（Quiz 狀態、vSubj、vQuestion、結算、掉落…）
  js/dungeon.js 副本戰鬥（vDungeon）
  js/admin.js   管理員面板（vAdminPanel 與管理功能）

切完之後 index.html 只保留「應用程式外殼 + 核心功能」，進入某個功能時
才由 needJs() 載入對應模組（例如只進修練場就只載 js/bank.js + js/quiz.js）。

用法：python3 tools/build/split.py   （在倉庫根目錄執行）
驗證：node --check public/js/bank.js 等 + 瀏覽器實測
"""
import re, sys, io

try:
    sys.stdout.reconfigure(errors="replace")
    sys.stderr.reconfigure(errors="replace")
except Exception:
    pass

ROOT = __file__.replace("\\", "/").rsplit("/", 3)[0]
if not ROOT:
    ROOT = "."
HTML = ROOT + "/public/index.html"

# (起始行, 結束行, 模組檔名, 模組標題)  行號皆為 1-based、含頭尾
CUTS = [
    (1971, 2101, "public/js/bank.js", "題庫（BANK 資料、bankQ、procMathQ、shuffleQ、qHash、qSeenHas、fallbackQ）"),
    (3831, 4339, "public/js/quiz.js", "修練場答題流程（Quiz 狀態、qReset、vSubj、vQuestion、結算、掉落、稱號）"),
    (11073, 11353, "public/js/dungeon.js", "副本戰鬥（vDungeon）"),
    (11871, 12021, "public/js/admin.js", "管理員面板（vAdminPanel 與管理/備份功能）"),
]

# 留在 index.html、但開頭要先確保模組已載入的函式：(函式起始行, 要載入的模組 JS 片段)
AWAIT_INSERTS = [
    (4631, '"js/bank.js"'),                    # vSpeedMatch（週末競速：用 bankQ/procMathQ）
    (5219, "['js/bank.js','js/quiz.js']"),     # vTerr（領土戰：qReset/bankQ/vQuestion）
    (7422, "['js/bank.js','js/quiz.js']"),     # vWrong（錯題複習）
    (10083, '"js/bank.js"'),                   # vAiQuiz（AI 出題：qSeenHas）
]

# 抽出模組的「入口函式」→ 在 index.html 原位放 async 載入包裝
ENTRY_WRAPPERS = {
    "js/quiz.js": ("vSubj", ["js/bank.js", "js/quiz.js"]),
    "js/dungeon.js": ("vDungeon", ["js/dungeon.js"]),
    "js/admin.js": ("vAdminPanel", ["js/admin.js"]),
}

LOADER = """/* ════════════════════════════════════════════════════════════
   模組懶載入（由 tools/build/split.py 產生，勿手動改）
   進入對應功能時才載入 js/ 模組，只跑需要的檔案資料
   ════════════════════════════════════════════════════════════ */
const JSLOAD={};
async function needJs(list){
  if(typeof list==='string')list=[list];
  const out=await Promise.all(list.map(src=>new Promise(res=>{
    if(JSLOAD[src])return res(true);
    const t=document.createElement('script');
    t.src=src;t.onload=()=>{JSLOAD[src]=1;res(true)};t.onerror=()=>res(false);
    document.head.appendChild(t);
  })));
  return out.every(Boolean);
}"""


def read_lines(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read().split("\n")


def main():
    lines = read_lines(HTML)
    total = len(lines)
    cuts = sorted(CUTS, key=lambda c: -c[0])  # 由下往上處理較安全（驗證重疊）
    for s, e, fn, title in cuts:
        assert s <= e, (s, e)
        for s2, e2, _, _ in CUTS:
            if (s, e) != (s2, e2) and not (e < s2 or e2 < s):
                raise SystemExit("範圍重疊：%d-%d 與 %d-%d" % (s, e, s2, e2))

    # 1) 產出模組檔（從原始行數抽，內容逐位元保留）
    cuts_by_line = {s: (e, fn, title) for s, e, fn, title in CUTS}
    for s, e, fn, title in CUTS:
        body = "\n".join(lines[s - 1:e])
        header = ("/* ════════════════════════════════════════════════════\n"
                  "   %s\n"
                  "   由 tools/build/split.py 從 public/index.html 抽出（懶載入模組）\n"
                  "   ════════════════════════════════════════════════════ */\n"
                  % title)
        with io.open(ROOT + "/" + fn, "w", encoding="utf-8") as f:
            f.write(header + body + "\n")
        n_fn = len(re.findall(r"^(?:async )?function \w+", body, re.M))
        print("✓ %s  ← 抽出 %d 行（%d 個函式）" % (fn, e - s + 1, n_fn))

    # 2) 重建 index.html
    out = []
    i = 0
    while i < total:
        ln = i + 1
        if ln in cuts_by_line:
            e, fn, title = cuts_by_line[ln]
            out.append("/* ════════════════════════════════════════════\n"
                       "   %s（已移至 %s，懶載入）\n"
                       "   ════════════════════════════════════════════ */"
                       % (title, fn))
            if fn == "public/js/quiz.js":
                out.append(LOADER)
            for js, (fname, deps) in ENTRY_WRAPPERS.items():
                if fn == "public/" + js:
                    dep_s = "[" + ", ".join("'%s'" % d for d in deps) + "]"
                    out.append("async function %s(){\n"
                               "  if(!await needJs(%s))return toast('模組載入失敗，請重新整理頁面','bad');\n"
                               "  %s();\n}"
                               % (fname, dep_s, fname))
            i = e  # 跳到範圍後
            continue
        line = lines[i]
        for sig, dep in AWAIT_INSERTS:
            if ln == sig:
                if not re.match(r"^function \w+\(\)\{$", line.strip()):
                    raise SystemExit("簽名不符 line %d: %r" % (ln, line.strip()))
                out.append(re.sub(r"^function (\w+)\(\)\{$", r"async function \1(){", line))
                out.append("  await needJs(%s);" % dep)
                i += 1
                break
        else:
            out.append(line)
            i += 1

    with io.open(HTML, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print("✓ index.html 重寫完成：%d 行 → %d 行" % (total, len(out)))


if __name__ == "__main__":
    sys.exit(main() or 0)