/* ════════════════════════════════════════════
   vHome 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vHome, tutorGuide
   ════════════════════════════════════════════ */
function vHome(){

const u=me(),g=u.g;

const eq=g.equip.character?CHARS[g.equip.character].icon:'🧑‍🎓';

const tt=TITLES.find(t=>t.id===g.equippedTitle);

$('#view').innerHTML=

'<div class="panel2" style="display:flex;gap:14px;align-items:center;margin-bottom:10px"><div style="font-size:44px;animation:bob 3s infinite">'+(u.prof&&u.prof.avatar?avatarHtml(u,52):eq)+'</div><div><b style="font-family:var(--serif);font-weight:900;font-size:20px;color:var(--gold2);display:block">⚔️ 冒險者，歡迎回來！</b>'+

'<div style="font-size:12.5px;color:var(--mut);margin-top:3px">Lv.'+g.lv+' 【'+titleOf(g.lv)+'】'+(tt?'｜🎖 '+tt.n:'')+(g.rebirth?'｜🔁 轉生×'+g.rebirth:'')+'｜⚡戰力 '+power(g)+'｜🏟️競技塔 第'+(g.arena.best||1)+'層｜'+timeStatus(g)+'</div></div></div>'+

(isGrade9(u)?(()=>{const n=examCountdown();const d=examDate();const ai=examSrc()==='ai';return n>0?'<div class="panel2" style="margin-bottom:10px;border-left:4px solid #ff8a80;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="font-size:26px">📝</span><div style="flex:1"><b style="font-family:var(--serif);color:#ffb4ab;font-size:16px">會考倒數 '+n+' 天</b><div style="font-size:11.5px;color:var(--mut)">'+d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()+' 國中教育會考 '+(ai?'🤖 AI 查詢':'（預估）')+'｜每天答題就是最好的複習，加油！</div></div><button class="btn ghost mini" onclick="examRefresh()">🔄 AI 更新日期</button></div>':''})():'')+

(u.graduated?'<div class="panel2" style="margin-bottom:10px;border-left:4px solid var(--gold);display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="font-size:26px">🎓</span><div style="flex:1"><b style="font-family:var(--serif);color:var(--gold2)">校友模式｜'+(u.gradYear||'')+' 學年度畢業</b><div style="font-size:11.5px;color:var(--mut)">帳號永久保留，所有功能照常玩'+(g.rebirth?'｜🔁 轉生加成：全經驗+'+(g.rebirth*10)+'%・掉落+'+(g.rebirth*5)+'%':'')+'</div></div><button class="btn ghost mini" onclick="gradCeremony()">🎓 畢業紀念冊</button></div>':'')+

'<div style="background:rgba(0,0,0,.25);border:1px dashed #6b4a1f;color:#ffb26b;padding:8px 12px;border-radius:5px;font-size:12.5px;margin-bottom:14px">'+pick(TIPS)+'</div>'+

featCatsHtml();

if(u.role==='student')setTimeout(tutorGuide,700); /* 首登新手引導（只顯示一次）*/

}

function tutorGuide(){
  try{if(localStorage.getItem('ADV9_TUTOR'))return;localStorage.setItem('ADV9_TUTOR','1')}catch(e){return}
  const steps=[
    {i:'🧑‍🎓',t:'完成每日任務',d:'登入後每天可完成答題、簽到、PK 等任務，獲得金幣、水晶與經驗值；等級越高解鎖越多玩法！'},
    {i:'🗺️',t:'征服領土',d:'每個科目有 500 關領土關卡，越後面獎勵越多，還可獲得獨特稱號與裝備。'},
    {i:'✏️',t:'按時交作業',d:'老師發布的作業請在截止前完成；作答畫面有專屬防作弊變體，離窗次數會被記錄。'},
    {i:'💎',t:'收集與強化',d:'抽卡收集角色夥伴、鍛造裝備並強化（上限＝玩家等級×100），變強挑戰更高難度！'}
  ];
  let idx=0;
  const box=document.createElement('div');
  box.style.cssText='position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center';
  const render=()=>{const s=steps[idx];box.innerHTML='<div style="background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:24px 26px;max-width:340px;text-align:center;animation:pop .3s">'+
    '<div style="font-size:44px">'+s.i+'</div><div style="font-size:17px;font-weight:900;font-family:var(--serif);color:var(--gold2);margin:8px 0">'+s.t+'</div>'+
    '<div style="font-size:12.5px;color:var(--mut);line-height:1.8">'+s.d+'</div>'+
    '<div style="display:flex;gap:8px;justify-content:center;margin-top:16px">'+
    (idx>0?'<button class="btn ghost mini" onclick="window._tg('+(idx-1)+')">⬅ 上一步</button>':'')+
    (idx<steps.length-1?'<button class="btn teal" onclick="window._tg('+(idx+1)+')">下一步 ➡</button>':'<button class="btn big" onclick="window._tg(-1)">🎮 開始冒險！</button>')+
    '</div><div style="font-size:11px;color:var(--mut);margin-top:10px">第 '+(idx+1)+'/'+steps.length+' 步</div></div>'};
  window._tg=(n)=>{if(n<0){box.remove();delete window._tg;return}idx=n;render()};
  box.onclick=(e)=>{if(e.target===box)box.remove()};
  render();document.body.appendChild(box);
}
