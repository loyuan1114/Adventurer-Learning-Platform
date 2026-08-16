#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
還原 split.py 的半拆狀態（把 js/bank.js 等 4 個模組合回 index.html）
用法：python3 tools/build/merge.py
"""
import re, io, sys

try:
    sys.stdout.reconfigure(errors="replace")
except Exception:
    pass

ROOT = __file__.replace("\\", "/").rsplit("/", 3)[0]
HTML = ROOT + "/public/index.html"
MODULES = [
    ("public/js/bank.js", "題庫"),
    ("public/js/quiz.js", "修練場答題流程"),
    ("public/js/dungeon.js", "副本戰鬥"),
    ("public/js/admin.js", "管理員面板"),
]

def read(p):
    return io.open(p, "r", encoding="utf-8").read().split("\n")

def write(p, lines):
    io.open(p, "w", encoding="utf-8").write("\n".join(lines))

def module_body(fn):
    lines = read(ROOT + "/" + fn)
    assert lines[0].startswith("/* ═"), lines[0]
    assert lines[3].startswith("   ═"), lines[3]
    return lines[4:]

def main():
    lines = read(HTML)
    out = []
    i = 0
    n = len(lines)
    merged = 0
    while i < n:
        line = lines[i]
        # 1) 找模組標記（3 行；「已移至」在第二行）
        m = None
        if line.startswith("/* ═"):
            m = re.search(r"（已移至 (public/js/[a-z]+\.js)，懶載入）", lines[i + 1] if i + 1 < n else "")
        if m:
            name = m.group(1)
            assert lines[i + 2].startswith("   ═"), lines[i + 2]
            body = module_body(name)
            out.extend(body)
            merged += 1
            i += 3
            # 跳過 LOADER 註解頭（4 行）
            if i + 1 < n and lines[i].strip().startswith("/* ═") and "模組懶載入" in lines[i + 1]:
                i += 4
            # 移除 LOADER 區塊
            if i < n and lines[i].strip() == "const JSLOAD={};":
                i += 1
                assert lines[i].strip().startswith("async function needJs"), lines[i]
                i += 1
                while i < n and lines[i].strip() != "return out.every(Boolean);":
                    i += 1
                i += 1
                if i < n and lines[i].strip() == "}":
                    i += 1
            # 移除包裝函式（async function vX(){ + needJs + vX(); + }）
            while i < n:
                mw = re.match(r"^async function (v\w+)\(\)\{$", lines[i])
                if mw and i + 3 < n and "needJs" in lines[i + 1] and lines[i + 3].strip() == "}":
                    i += 4
                    continue
                break
            continue
        # 2) 還原被改成 async 的函式
        m2 = re.match(r"^async function (vSpeedMatch|vTerr|vWrong|vAiQuiz)\(\)\{$", line)
        if m2:
            out.append("function %s(){" % m2.group(1))
            i += 1
            if i < n and lines[i].strip().startswith("await needJs("):
                i += 1  # 刪掉 await 行
            continue
        out.append(line)
        i += 1
    write(HTML, out)
    print("✓ 已合回 %d 個模組，index.html = %d 行" % (merged, len(out)))

if __name__ == "__main__":
    main()