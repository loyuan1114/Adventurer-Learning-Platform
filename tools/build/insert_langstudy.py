#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""insert_langstudy.py — 插入 vLangStudy 語言自學畫面 + AI 答題流程（v3.0）"""
import io, re

HTML = "public/index.html"
s = io.open(HTML, encoding="utf-8").read()
crlf = "\r\n" if "\r\n" in s else "\n"

anchor = "function langG(g){g.stats.lang=g.stats.lang||{};return g.stats.lang}"
assert anchor in s, "找不到 langG 錨點"

FUNCS = r"""
/* ════════ 語言自學畫面（v3.0）：選語言 → AI 出題 → 1.3x 獎勵，每語言個別統計 ════════ */
let LQ={code:'',name:'',q:null,phase:'IDLE',sel:-1,t0:0,diff:45};
function vLangStudy(){
  const g=me().g,pref=langPref();
  $('#view').innerHTML=back()+'<h3 class="vt">🌍 語言自學 <span class="vsub">203 種語言・AI 出題・獎勵 1.3 倍</span></h3>'+
  '<div class="panel2" style="margin-bottom:10px;line-height:1.9;font-size:13.5px;border-left:4px solid var(--teal)">📖 挑一個想學的語言，AI 會自動出題（單字中⇄外配對）；答對可得 <b style="color:var(--gold2)">1.3 倍</b> 經驗／金幣／水晶，每個語言的答題數都會個別記錄。<br>📌 也可以先在「⚙️ 設定」裡把常用語言設為偏好。</div>'+
  '<div class="panel2" style="margin-bottom:10px;display:flex;gap:6px;flex-wrap:wrap">'+LANG_REGIONS.map(r=>'<button class="btn ghost mini" id="lgf_'+r+'" onclick="langFilter(\''+r+'\')">'+r+'</button>').join('')+
  '<button class="btn ghost mini" id="lgf_全部" onclick="langFilter(\'\')" style="border-color:var(--gold);color:var(--gold2)">全部</button></div>'+
  '<div class="panel2" style="margin-bottom:10px"><input id="langSearch" placeholder="🔍 直接搜尋語言（例：日語、English、zh…）" oninput="langFilter(langFilter.cur||\'\')" style="width:100%;padding:9px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt)"></div>'+
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
    '<button class="btn mini" onclick="langStart(\''+code+'\')">✏️ 開始學習</button>'+
    (pref!==code?'<button class="btn ghost mini" onclick="setLangPref(\''+code+'\')">⭐ 設為偏好</button>':'')+
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
      '<button class="btn big" onclick="langStart(\''+LQ.code+'\')">🔄 重試</button>';return}
    LQ.q=q;LQ.sel=-1;LQ.t0=Date.now();LQ.phase='ANSWERING';langRenderQ();
  }).catch(()=>{LQ.phase='IDLE';toast('⚠️ 出題失敗，請重試','bad')});
}
async function langAsk(){
  const diffLabel=LQ.diff>=70?'困難':(LQ.diff>=40?'中等':'簡單');
  const prompt='生成 1 道語言學習選擇題：\n學習語言：'+LQ.name+'（代碼 '+LQ.code+'）\n難度：'+diffLabel+'\n題型：單字／片語 中⇄外配對（題目用繁體中文發問，外文部分用該語言正確的文字）\n要求：\n1. 恰好 4 個選項、只有 1 個正確\n2. 外文拼寫必須正確，含該語言的文字系統\n3. 純文字，禁止圖片、照片、「如圖」、聽力題\n4. 題目與選項避免與常見教材模板完全相同\n5. 本次出題隨機碼：'+Math.random().toString(36).slice(2,9)+'\n\nJSON 格式：[{"題目":"...","選項":["A","B","C","D"],"答案":0,"解析":"..."}]';
  try{
    const result=await callGemini(prompt,'你是專業的語言教學專家，精通各國語言與人工語言（含克林貢語、精靈語、納美語等）。嚴格按照 JSON 格式回應，不要包含任何額外文字或 markdown。');
    const qs=parseAiQuestions(result,'語言');
    return qs&&qs[0]?qs[0]:null;
  }catch(e){return null}
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
  '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn big" onclick="langStart(\''+LQ.code+'\')">⏭ 下一題</button>'+
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
s = s.replace(anchor, anchor + crlf + FUNCS.strip().replace("\n", crlf), 1)

io.open(HTML, "w", encoding="utf-8", newline="").write(s)
print("vLangStudy 插入完成")