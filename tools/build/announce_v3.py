#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""announce_v3.py — v3.0 開場標語 + 公告 + 聊天訊息"""
import io

HTML = "public/index.html"
s = io.open(HTML, encoding="utf-8").read()
crlf = "\r\n" if "\r\n" in s else "\n"
s = s.replace("\r\n", "\n")

old1 = "v3.0　傳說冒險即將開始…"
new1 = "v3.0　語言自學・AI 出題・1.3x 獎勵！"
assert old1 in s, "開場標語錨點"
s = s.replace(old1, new1, 1)

ann = "set(LS.ann,[{id:1,title:'📢 歡迎來到全領域冒險者養成系統 v3.0！'"
assert ann in s, "公告錨點"
v3 = ("set(LS.ann,[{id:2,title:'🌍 v3.0 語言自學上線！',content:'203 種語言任你挑：在「🌍 語言自學」選一個想學的語言，"
      "AI 會自動出單字配對題；答對可得 1.3 倍經驗／金幣／水晶，每個語言的答題數都會個別記錄在「📊 統計報表」。"
      "也可以在「⚙️ 設定」把最常學的語言設為偏好，自學畫面會優先顯示。',time:now},{id:1,title:'📢 歡迎來到全領域冒險者養成系統 v3.0！'")
s = s.replace(ann, v3, 1)

old3 = "🎉 v3.0 九大強化版上線啦！"
new3 = "🌍 v3.0 語言自學上線！203 種語言、AI 出題、獎勵 1.3 倍！"
assert old3 in s, "聊天訊息錨點"
s = s.replace(old3, new3, 1)

io.open(HTML, "w", encoding="utf-8", newline="").write(s if not crlf else s.replace("\n", "\r\n"))
print("✓ 開場標語／公告／聊天訊息 更新完成")