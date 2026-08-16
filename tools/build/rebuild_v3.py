#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""rebuild_v3.py — v3.0 全自動重建：從 HEAD 乾淨狀態套用全部修改 → unify → splitall
   用法：在 repo 根目錄執行（先 git checkout 還原三路徑）"""
import io, re, subprocess, sys, os

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(os.path.join(ROOT, '..', '..'))
CRLF_HTML = 'public/index.html'

def rd(p):
    return io.open(p, encoding='utf-8').read()

def wr(p, s, crlf=None):
    if crlf is None:
        crlf = '\r\n' if '\r\n' in rd(p) else '\n'
    io.open(p, 'w', encoding='utf-8', newline='').write(s.replace('\n', crlf) if crlf == '\r\n' else s)

def rep(p, old, new, n=1):
    s = rd(p)
    assert old in s, '錨點失敗: %s 於 %s' % (old[:60], p)
    wr(p, s.replace(old, new, n))
    print('  ✓', os.path.basename(p), '·', old[:40].replace('\n', '\\n'))

# ---------- 1) index.html 外殼 ----------
print('== index.html')
s = rd(CRLF_HTML)
# SUPA_KEY 宣告（若不存在則加）
if "const SUPA_KEY=" not in s:
    old = "const SUPA_SKIP=['ADV9_SES','ADV9_LOCAL','ADV9_WTOKEN'];/* session 與本機畢業帳號僅存本機，不上雲 */"
    assert old in s
    s = s.replace(old, old + "\nconst SUPA_KEY='';/* 金鑰自動從後端 /rest/v1/key 取得（svcKey 流程）；此處留空即代表「尚未取得」 */", 1)
    print('  ✓ 插入 const SUPA_KEY')

# supaHeaders 防護
old = "function supaHeaders(){const h={'apikey':SUPA_KEY,'Content-Type':'application/json'};"
assert old in s
s = s.replace(old, "function supaHeaders(){const h={'Content-Type':'application/json'};if(SUPA_KEY)h['apikey']=SUPA_KEY;", 1)
print('  ✓ supaHeaders 防護')

# 登入方法 2
old = "headers: {\n              'apikey': SUPA_KEY,\n              'Content-Type': 'application/json'\n            },\n            body: JSON.stringify({ p_username: un, p_password: pw })"
assert old in s
s = s.replace(old, "headers: supaHeaders(),\n            body: JSON.stringify({ p_username: un, p_password: pw })", 1)
print('  ✓ 登入方法 2')

# 老師註冊
old = "headers: {\n          'apikey': SUPA_KEY,\n          'Content-Type': 'application/json'\n        },\n        body: JSON.stringify({\n          p_username: username,"
assert old in s
s = s.replace(old, "headers: supaHeaders(),\n        body: JSON.stringify({\n          p_username: username,", 1)
print('  ✓ 老師註冊')

# 版本提升 + 公告
s = s.replace('v2.0', 'v3.0')
old1 = "v3.0　傳說冒險即將開始…"
new1 = "v3.0　語言自學・AI 出題・1.3x 獎勵！"
assert old1 in s
s = s.replace(old1, new1, 1)
old2 = "set(LS.ann,[{id:1,title:'📢 歡迎來到全領域冒險者養成系統 v3.0！'"
v3ann = ("set(LS.ann,[{id:2,title:'🌍 v3.0 語言自學上線！',content:'203 種語言任你挑：在「🌍 語言自學」選一個想學的語言，"
         "AI 會自動出單字配對題；答對可得 1.3 倍經驗／金幣／水晶，每個語言的答題數都會個別記錄在「📊 統計報表」。"
         "也可以在「⚙️ 設定」把最常學的語言設為偏好，自學畫面會優先顯示。',time:now},{id:1,title:'📢 歡迎來到全領域冒險者養成系統 v3.0！'")
assert old2 in s
s = s.replace(old2, v3ann, 1)
old3 = "🎉 v3.0 九大強化版上線啦！"
new3 = "🌍 v3.0 語言自學上線！203 種語言、AI 出題、獎勵 1.3 倍！"
assert old3 in s
s = s.replace(old3, new3, 1)
print('  ✓ 版本 v3.0 + 開場標語 + 公告 + 聊天訊息')

# LANG_DATA + 語言助手（從 genlangs.out.js）
lang = io.open('genlangs.out.js', encoding='utf-8').read().strip().replace('\r', '')
block = (
    "/* ════════ 語言自學（v3.0）：203 種語言 × 8 大區，代碼唯一，可直接搜尋 ════════ */\n" + lang + "\n" +
    "const LANG_REGIONS=Object.keys(LANG_DATA);\n" +
    "function langName(code){for(const r in LANG_DATA){const f=LANG_DATA[r].find(x=>x[0]===code);if(f)return f[1]}return code||''}\n" +
    "function langFind(txt){const t=(txt||'').trim().toLowerCase();const out=[];for(const r in LANG_DATA)for(const x of LANG_DATA[r]){if(!t||x[0].toLowerCase().includes(t)||x[1].includes(t))out.push([r,x[0],x[1]])}return out}\n" +
    "function langPref(){const u=me();return (u&&u.prof&&u.prof.langPref)||''}\n" +
    "function setLangPref(code){const u=me();if(!u)return;u.prof=u.prof||{};u.prof.langPref=code;saveU(u);toast('🌍 已設定語言偏好：'+langName(code));hud();if(typeof vSet==='function')vSet()}\n" +
    "function langG(g){g.stats.lang=g.stats.lang||{};return g.stats.lang}\n" +
    "async function langAskAI(name,code,diffLabel){\n" +
    "  const prompt='生成 1 道語言學習選擇題：\\n學習語言：'+name+'（代碼 '+code+'）\\n難度：'+diffLabel+'\\n題型：單字／片語 中⇄外配對（題目用繁體中文發問，外文部分用該語言正確的文字）\\n要求：\\n1. 恰好 4 個選項、只有 1 個正確\\n2. 外文拼寫必須正確，含該語言的文字系統\\n3. 純文字，禁止圖片、照片、「如圖」、聽力題\\n4. 題目與選項避免與常見教材模板完全相同\\n5. 本次出題隨機碼：'+Math.random().toString(36).slice(2,9)+'\\n\\nJSON 格式：[{\"題目\":\"...\",\"選項\":[\"A\",\"B\",\"C\",\"D\"],\"答案\":0,\"解析\":\"...\"}]';\n" +
    "  const raw=await callGemini(prompt,'你是專業的語言教學專家，精通各國語言與人工語言（含克林貢語、精靈語、納美語等）。嚴格按照 JSON 格式回應，不要包含任何額外文字或 markdown。');\n" +
    "  const m=raw.match(/\\[[\\s\\S]*?\\]/);if(!m)return null;\n" +
    "  let arr;\n" +
    "  try{arr=JSON.parse(m[0])}catch(e){return null}\n" +
    "  if(!Array.isArray(arr)||!arr[0]||typeof arr[0]['題目']!=='string'||!Array.isArray(arr[0]['選項'])||arr[0]['選項'].length<2)return null;\n" +
    "  const q=arr[0];\n" +
    "  q['選項']=q['選項'].slice(0,4);\n" +
    "  if(typeof q['答案']!=='number'||q['答案']<0||q['答案']>=q['選項'].length)q['答案']=0;\n" +
    "  if(typeof q['解析']!=='string')q['解析']='';\n" +
    "  return q;\n" +
    "}\n"
)
m = re.search(r"let FEATS=\[[\s\S]*?\n\];", s)
assert m, '找不到 FEATS'
s = s[:m.end()] + "\n" + block + s[m.end():]

old_feat = "['🎟','密碼禮包','自動辨識','#e040fb','vCodes()'],"
assert old_feat in s
s = s.replace(old_feat, old_feat + "\n['🌍','語言自學','203 種語言・AI 出題・1.3x 獎勵','#29b6f6','vLangStudy()'],", 1)
old_cat = "['vSubj','vLearn','vHomework','vVideos','vLab','vWrong','vStats']"
assert old_cat in s
s = s.replace(old_cat, "['vSubj','vLearn','vHomework','vVideos','vLab','vWrong','vStats','vLangStudy']", 1)
print('  ✓ LANG_DATA 203 語言 + 語言助手 + FEATS/FEAT_CATS 入口')

# vLangStudy 畫面 + 答題流程
FUNCS = """
/* ════════ 語言自學畫面（v3.0）：選語言 → AI 出題 → 1.3x 獎勵，每語言個別統計 ════════ */
let LQ={code:'',name:'',q:null,phase:'IDLE',sel:-1,t0:0,diff:45};
function vLangStudy(){
  const g=me().g,pref=langPref();
  $('#view').innerHTML=back()+'<h3 class="vt">🌍 語言自學 <span class="vsub">203 種語言・AI 出題・獎勵 1.3 倍</span></h3>'+
  '<div class="panel2" style="margin-bottom:10px;line-height:1.9;font-size:13.5px;border-left:4px solid var(--teal)">📖 挑一個想學的語言，AI 會自動出題（單字中⇄外配對）；答對可得 <b style="color:var(--gold2)">1.3 倍</b> 經驗／金幣／水晶，每個語言的答題數都會個別記錄。<br>📌 也可以先在「⚙️ 設定」裡把常用語言設為偏好。</div>'+
  '<div class="panel2" style="margin-bottom:10px;display:flex;gap:6px;flex-wrap:wrap">'+LANG_REGIONS.map(r=>'<button class="btn ghost mini" id="lgf_'+r+'" onclick="langFilter(\\''+r+'\\')">'+r+'</button>').join('')+
  '<button class="btn ghost mini" id="lgf_全部" onclick="langFilter(\\'\\')" style="border-color:var(--gold);color:var(--gold2)">全部</button></div>'+
  '<div class="panel2" style="margin-bottom:10px"><input id="langSearch" placeholder="🔍 直接搜尋語言（例：日語、English、zh…）" oninput="langFilter(langFilter.cur||\\'\\')" style="width:100%;padding:9px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt)"></div>'+
  '<div id="langGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px"></div>';
  langFilter('');
}
langFilter.cur='';
function langFilter(cat){
  langFilter.cur=cat;
  document.querySelectorAll('[id^=lgf_]').forEach(b=>{b.style.borderColor=(b.id==='lgf_'+(cat||'全部'))?'var(--gold)':'';b.style.color=(b.id==='lgf_'+(cat||'全部'))?'var(--gold2)':''});
  const t=$('#langSearch')?$('#langSearch').value.trim():'';
  const rows=t?langFind(t):(cat?LANG_DATA[cat].map(x=>[cat,x[0],x[1]]):LANG_REGIONS.flatMap(r=>LANG_DATA[r].map(x=>[r,x[0],x[1]])));
  const g=me().g,pref=langPref(),langs=langG(g);
  const el=$('#langGrid');if(!el)return;
  el.innerHTML=rows.map(x=>{
    const [r,code,name]=x,st=langs[code];
    return '<div class="panel2" style="margin:0;padding:12px;display:flex;flex-direction:column;gap:4px">'+
    '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><b style="font-size:14px">'+esc(name)+'</b><span style="font-size:10px;color:var(--mut)">'+code+'</span>'+
    (pref===code?'<span style="font-size:10px;color:var(--gold2);border:1px solid var(--gold);border-radius:8px;padding:1px 6px">⭐ 我的偏好</span>':'')+'</div>'+
    '<span style="font-size:11px;color:'+(st?'var(--teal)':'var(--mut)')+'">'+(st?('📊 已答 '+st.t+' 題・答對 '+st.c+' 題'):'尚未開始')+'</span>'+
    '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">'+
    '<button class="btn mini" onclick="langStart(\\''+code+'\\')">✏️ 開始學習</button>'+
    (pref!==code?'<button class="btn ghost mini" onclick="setLangPref(\\''+code+'\\')">⭐ 設為偏好</button>':'')+
    '</div></div>';
  }).join('')||'<div class="panel2" style="text-align:center;color:var(--mut)">找不到符合的語言，試試別的字。</div>';
}
function langStart(code){
  LQ.code=code;LQ.name=langName(code);LQ.phase='LOADING';
  $('#view').innerHTML=back('vLangStudy()')+'<h3 class="vt">🌍 '+esc(LQ.name)+' <span class="vsub">AI 出題・1.3x 獎勵</span></h3>'+
  '<div style="text-align:center;padding:50px 0"><div style="font-size:52px;animation:spP 1s infinite">🌏</div><p style="color:var(--gold2);font-weight:900;font-family:var(--serif)">AI 正在出 '+esc(LQ.name)+' 的題目…</p></div>';
  langAsk().then(q=>{
    if(!q){LQ.phase='IDLE';$('#view').innerHTML=back('vLangStudy()')+'<h3 class="vt">🌍 '+esc(LQ.name)+'</h3>'+
      '<div class="panel2" style="border-left:4px solid var(--red);margin-bottom:12px">❌ 出題服務暫時無法使用，請稍後重試。</div>'+
      '<button class="btn big" onclick="langStart(\\''+LQ.code+'\\')">🔄 重試</button>';return}
    LQ.q=q;LQ.sel=-1;LQ.t0=Date.now();LQ.phase='ANSWERING';langRenderQ();
  }).catch(()=>{LQ.phase='IDLE';toast('⚠️ 出題失敗，請重試','bad')});
}
async function langAsk(){
  const diffLabel=LQ.diff>=70?'困難':(LQ.diff>=40?'中等':'簡單');
  try{return await langAskAI(LQ.name,LQ.code,diffLabel)}catch(e){return null}
}
function langRenderQ(){
  const q=LQ.q,st=langG(me().g)[LQ.code]||{t:0,c:0};
  $('#view').innerHTML=back('vLangStudy()')+'<h3 class="vt">🌍 '+esc(LQ.name)+' <span class="vsub">第 '+(st.t+1)+' 題・答對可獲 1.3x 獎勵</span></h3>'+
  '<div class="panel2" style="border-left:4px solid var(--teal);font-size:15.5px;line-height:1.8;margin-bottom:12px">'+esc(q['題目'])+'</div>'+
  '<div id="langOpts" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+q['選項'].map((o,i)=>'<button class="optBtn" id="lopt'+i+'" onclick="langPick('+i+')">'+esc(o)+'</button>').join('')+'</div>'+
  '<div id="langFoot" style="margin-top:12px"></div>';
}
function langPick(i){
  if(LQ.phase!=='ANSWERING')return;
  LQ.sel=i;LQ.phase='SUBMITTED';
  const q=LQ.q,ok=i===q['答案'];
  document.querySelectorAll('#langOpts .optBtn').forEach(b=>b.classList.add('lock'));
  document.getElementById('lopt'+q['答案']).classList.add('ok');
  if(!ok)document.getElementById('lopt'+i).classList.add('no');
  const g=me().g,st=langG(g)[LQ.code]=langG(g)[LQ.code]||{t:0,c:0};
  st.t=(st.t||0)+1;if(ok)st.c=(st.c||0)+1;
  const R=langSettle(g,ok);
  const el=((Date.now()-LQ.t0)/1000).toFixed(1);
  $('#langFoot').innerHTML='<div class="rwRow">'+(ok?'<span class="rwChip" style="border-color:#2e7d32;color:#a5d6a7">✅ 答對了！</span>':'<span class="rwChip" style="border-color:#8f272b;color:#ffb4ab">❌ 答錯了，正確答案：'+esc(q['選項'][q['答案']])+'</span>')+
  '<span class="rwChip">⏱ '+el+'s</span>'+(ok?'<span class="rwChip" style="border-color:var(--gold);color:var(--gold2)">✨ 經驗 +'+R.exp+'</span><span class="rwChip" style="border-color:var(--gold);color:var(--gold2)">🪙 金幣 +'+R.au+'</span><span class="rwChip" style="border-color:var(--gold);color:var(--gold2)">💠 水晶 +'+R.cr+'</span>':'')+'</div>'+
  '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn big" onclick="langStart(\\''+LQ.code+'\\')">⏭ 下一題</button>'+
  '<button class="btn ghost big" onclick="vLangStudy()">🌍 換語言</button></div>';
}
function langSettle(g,ok){
  recordAns(g,ok,LQ.diff,'lang:'+LQ.code);
  const R={exp:0,cr:0,au:0,dm:0};
  if(ok){
    addCombo(g);
    const xp=grantExp(g,LQ.diff,false,'lang:'+LQ.code),xpE=Math.floor(xp*0.3);
    g.xp+=xpE;R.exp=xp+xpE;
    const rw=grantRew(g,LQ.diff,g.combo),crE=Math.floor(rw.crystal*0.3),auE=Math.floor(rw.gold*0.3),dmE=Math.floor(rw.diamond*0.3);
    g.crystal+=crE;g.gold+=auE;g.diamond=Number(g.diamond||0)+dmE;
    R.cr=rw.crystal+crE;R.au=rw.gold+auE;R.dm=rw.diamond+dmE;
    if(g.xp>=g.needXp&&g.lv<effMaxLv()){g.xp-=g.needXp;g.lv++;g.needXp=CFG.needXp(g.lv);toast('🌟 等級提升！Lv.'+g.lv+' 【'+titleOf(g.lv)+'】')}
  }else resetCombo(g);
  saveU(g);
  return R;
}
"""
anchor = "function langG(g){g.stats.lang=g.stats.lang||{};return g.stats.lang}"
assert anchor in s
s = s.replace(anchor, anchor + "\n" + FUNCS.strip(), 1)
print('  ✓ vLangStudy 畫面 + lang* 答題流程')

wr(CRLF_HTML, s)

# ---------- 2) 模組檔 ----------
print('== 模組檔')
# vHome.js：移除舊 SUPA_KEY 宣告
vhome = rd('public/js/views/vHome.js')
old = "const SUPA_KEY='sb_publishable_hmOcXUgwSE2wWv7vwOs1WQ_1T2X65mA'; /* anon public key */\n\n"
assert old in vhome
wr('public/js/views/vHome.js', vhome.replace(old, '', 1))
print('  ✓ vHome.js 移除舊 SUPA_KEY')

# vSet.js：語言偏好面板
vset = rd('public/js/views/vSet.js')
old = "'<label style=\"display:flex;gap:8px;align-items:center;margin-top:8px;cursor:pointer\"><input type=\"checkbox\" id=\"hideOnline\" style=\"width:auto\"'+(pf.hideOnline?' checked':'')+' onchange=\"setHideOnline(this.checked)\"> 🙈 隱藏我的上線狀態（好友看不到我的「● 線上」）</label></div>'+"
assert old in vset
new = old + "\n\n/* 語言偏好 */\n\n" + (
    "'<div class=\"panel2\" style=\"margin-bottom:10px\"><b style=\"color:var(--gold2);font-family:var(--serif)\">🌍 語言偏好</b> <span style=\"font-size:11.5px;color:var(--mut)\">選一個想學的語言，語言自學會優先顯示（203 種語言可搜尋）</span>'+\n\n" +
    "'<div style=\"margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap\">'+(langPref()?'<span style=\"font-size:12.5px;color:var(--teal)\">⭐ 目前：'+esc(langName(langPref()))+'（'+langPref()+'）</span>':'<span style=\"font-size:12.5px;color:var(--mut)\">尚未設定偏好</span>')+\n\n" +
    "'<button class=\"btn ghost mini\" onclick=\"setLangPref(\\'\\')\">🧹 清除偏好</button></div>'+\n\n" +
    "'<input id=\"setLangSearch\" placeholder=\"🔍 搜尋語言（例：日語、English、fr…）\" oninput=\"setLangGrid(this.value)\" style=\"width:100%;margin-top:8px;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt)\">'+\n\n" +
    "'<div id=\"setLangGrid\" style=\"display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;margin-top:8px;max-height:180px;overflow-y:auto\"></div></div>'+"
)
vset = vset.replace(old, new, 1)
old = "  if(MUSIC.idx>=0)ms.value=String(MUSIC.idx);\n});\n\n}"
assert old in vset
new = "  if(MUSIC.idx>=0)ms.value=String(MUSIC.idx);\n});\n\nsetLangGrid('');\n\n}\n\nfunction setLangGrid(t){\n  const rows=langFind(t||'');\n  const g=me().g;\n  const el=document.getElementById('setLangGrid');if(!el)return;\n  el.innerHTML=rows.slice(0,60).map(x=>{\n    const [r,code,name]=x,st=(g.stats.lang||{})[code];\n    return '<button class=\"btn ghost mini\" style=\"font-size:12px;text-align:left\" onclick=\"setLangPref(\\''+code+'\\')\">'+esc(name)+(st?' <span style=\"color:var(--teal)\">('+st.t+')</span>':'')+'</button>';\n  }).join('')+(rows.length>60?'<span style=\"font-size:11px;color:var(--mut)\">…共 '+rows.length+' 種，輸入關鍵字可搜尋</span>':'')||'<span style=\"font-size:12px;color:var(--mut)\">找不到，試試別的字。</span>';\n}"
vset = vset.replace(old, new, 1)
wr('public/js/views/vSet.js', vset)
print('  ✓ vSet.js 語言偏好面板 + setLangGrid')

# vStats.js：語言統計面板
vstats = rd('public/js/views/vStats.js')
old = "'<div class=\"panel2\"><b style=\"font-family:var(--serif);color:var(--gold2)\">📋 本週報告</b><div style=\"font-size:13px;line-height:2;margin-top:6px\">'+"
assert old in vstats
new = ("'<div class=\"panel2\" style=\"margin:12px 0\"><b style=\"font-family:var(--serif);color:var(--gold2)\">🌍 語言自學</b><div style=\"font-size:13px;line-height:2;margin-top:6px\">'+\n\n" +
       "langStatsHtml(g)+'</div></div>'+\n\n" + old)
vstats = vstats.replace(old, new, 1)
old = "'最強科目：'+(best==='—'?'—':(SUBJ[best]?SUBJ[best].i:'')+' '+best)+'</div></div>';\n\n}"
assert old in vstats
new = ("'最強科目：'+(best==='—'?'—':(SUBJ[best]?SUBJ[best].i:'')+' '+best)+'</div></div>';\n\n}\n\n" +
       "function langStatsHtml(g){\n  const langs=(g.stats&&g.stats.lang)||{};\n  const codes=Object.keys(langs);\n" +
       "  const langT=Object.values(langs).reduce((a,b)=>a+(b.t||0),0);\n  const langC=Object.values(langs).reduce((a,b)=>a+(b.c||0),0);\n" +
       "  let h='答題：<b style=\"color:var(--teal)\">'+langT+'</b> 題｜答對：'+langC+' 題｜正確率：'+(langT?(Math.round(langC/langT*100)):0)+'%<br>';\n" +
       "  if(!codes.length)h+='<span style=\"color:var(--mut)\">還沒開始語言自學，去「🌍 語言自學」挑一個語言吧！</span>';\n  else{\n" +
       "    codes.sort((a,b)=>(langs[b].t||0)-(langs[a].t||0));\n" +
       "    h+=codes.slice(0,12).map(c=>{\n      const s=langs[c],t=s.t||0,cq=s.c||0;\n" +
       "      return '<div style=\"display:flex;align-items:center;gap:8px;margin-top:4px\"><span style=\"width:110px;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\">'+esc(langName(c))+'</span><div class=\"bar\" style=\"flex:1\"><i style=\"width:'+Math.min(100,Math.round(t/Math.max(1,langT)*100))+'%;background:var(--teal)\"></i></div><b style=\"font-size:12px;width:110px;text-align:right;color:'+(t?'var(--teal)':'var(--mut)')+'\">'+t+' 題・'+cq+' 對</b></div>';\n    }).join('');\n" +
       "    if(codes.length>12)h+='<div style=\"font-size:11.5px;color:var(--mut);margin-top:4px\">…共 '+codes.length+' 種語言</div>';\n  }\n  return h;\n}")
vstats = vstats.replace(old, new, 1)
wr('public/js/views/vStats.js', vstats)
print('  ✓ vStats.js 語言統計 + langStatsHtml')

# ---------- 3) 其餘 html/css 版本 ----------
for f in ['public/admin.html', 'public/student.html', 'public/teacher.html', 'public/adv9_plus.css', 'public/adv9_equipment_reroll.css']:
    if os.path.exists(f):
        s2 = rd(f)
        if 'v2.0' in s2:
            wr(f, s2.replace('v2.0', 'v3.0'))
            print('  ✓', f, 'v3.0')

print('\n重建修改完成，接著執行 unify → splitall')