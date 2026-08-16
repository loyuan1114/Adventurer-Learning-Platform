#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""insert_lang.py — 把 LANG_DATA + 語言助手 + FEATS 項目插入 index.html（v3.0 語言自學）"""
import io, re

HTML = "public/index.html"
s = io.open(HTML, encoding="utf-8").read()
crlf = "\r\n" if "\r\n" in s else "\n"

lang = io.open("genlangs.out.js", encoding="utf-8").read().strip().replace("\r", "")
block = (
    "/* ════════ 語言自學（v3.0）：203 種語言 × 8 大區，代碼唯一，可直接搜尋 ════════ */" + "\n" + lang + "\n" +
    "const LANG_REGIONS=Object.keys(LANG_DATA);" + "\n" +
    "function langName(code){for(const r in LANG_DATA){const f=LANG_DATA[r].find(x=>x[0]===code);if(f)return f[1]}return code||''}" + "\n" +
    "function langFind(txt){const t=(txt||'').trim().toLowerCase();const out=[];for(const r in LANG_DATA)for(const x of LANG_DATA[r]){if(!t||x[0].toLowerCase().includes(t)||x[1].includes(t))out.push([r,x[0],x[1]])}return out}" + "\n" +
    "function langPref(){const u=me();return (u&&u.prof&&u.prof.langPref)||''}" + "\n" +
    "function setLangPref(code){const u=me();if(!u)return;u.prof=u.prof||{};u.prof.langPref=code;saveU(u);toast('🌍 已設定語言偏好：'+langName(code));hud();if(typeof vSet==='function')vSet()}" + "\n" +
    "function langG(g){g.stats.lang=g.stats.lang||{};return g.stats.lang}" + "\n"
).replace("\n", crlf)

# 1) FEATS 陣列結束後插入 LANG 區塊
m = re.search(r"let FEATS=\[[\s\S]*?\n\];", s)
assert m, "找不到 FEATS"
pos = m.end()
s = s[:pos] + crlf + block + s[pos:]

# 2) FEATS 加「語言自學」項目
old_feat = "['🎟','密碼禮包','自動辨識','#e040fb','vCodes()'],"
assert old_feat in s, "找不到 FEATS 兌換碼列"
new_feat = old_feat + crlf + "['🌍','語言自學','203 種語言・AI 出題・1.3x 獎勵','#29b6f6','vLangStudy()'],"
s = s.replace(old_feat, new_feat, 1)

# 3) FEAT_CATS 學習精靈分類加入 vLangStudy
old_cat = "['vSubj','vLearn','vHomework','vVideos','vLab','vWrong','vStats']"
assert old_cat in s, "找不到 FEAT_CATS 學習精靈"
s = s.replace(old_cat, "['vSubj','vLearn','vHomework','vVideos','vLab','vWrong','vStats','vLangStudy']", 1)

io.open(HTML, "w", encoding="utf-8", newline="").write(s)
print("插入完成")