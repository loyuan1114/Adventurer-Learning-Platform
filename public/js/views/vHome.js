/* ════════════════════════════════════════════
   vHome 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vHome, tutorGuide
   ════════════════════════════════════════════ */
function vHome(){

const u=me(),g=u.g;

const eq=(g.equip.character&&CHARS&&CHARS[g.equip.character])?CHARS[g.equip.character].icon:'🧑‍🎓';

const tt=TITLES.find(t=>t.id===g.equippedTitle);

const prefLang=langPref();
const prefLabel=prefLang?(langName(prefLang)||prefLang):'';

$('#view').innerHTML=

'<div class="panel2" style="display:flex;gap:14px;align-items:center;margin-bottom:10px"><div style="font-size:44px;animation:bob 3s infinite">'+(u.prof&&u.prof.avatar?avatarHtml(u,52):eq)+'</div><div><b style="font-family:var(--serif);font-weight:900;font-size:20px;color:var(--gold2);display:block">⚔️ 冒險者，歡迎回來！</b>'+

'<div style="font-size:12.5px;color:var(--mut);margin-top:3px">Lv.'+g.lv+' 【'+titleOf(g.lv)+'】'+(tt?'｜🎖 '+tt.n:'')+(g.rebirth?'｜🔁 轉生×'+g.rebirth:'')+'｜⚡戰力 '+power(g)+'｜🏟️競技塔 第'+(g.arena.best||1)+'層｜'+timeStatus(g)+'</div></div></div>'+

'<div class="panel2" style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap"><span style="font-size:13px;color:var(--mut)">🌍 語言偏好：</span><span style="font-size:13px;color:var(--teal);font-weight:700">'+(prefLabel||'未設定')+'</span><button class="btn ghost mini" onclick="homeLangSwitch()">🔄 切換語言</button><button class="btn ghost mini" onclick="vLangStudy()">📖 語言學習</button></div>'+

'<div class="panel2" style="margin-bottom:10px;border-left:4px solid #ff8a80;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="font-size:26px">📝</span><div style="flex:1"><b style="font-family:var(--serif);color:#ffb4ab;font-size:16px">會考倒數 '+Math.max(0,examCountdown())+' 天</b><div style="font-size:11.5px;color:var(--mut)">'+(function(){var d=examDate();return d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()})()+' 國中教育會考 '+(examSrc()==='ai'?'🤖 AI 查詢':'（預估）')+'｜'+(isGrade9(u)?'九年級下學期必看！':'每天答題就是最好的複習')+'</div></div><button class="btn ghost mini" onclick="examRefresh()">🔄 AI 更新日期</button></div>'+

(u.graduated?'<div class="panel2" style="margin-bottom:10px;border-left:4px solid var(--gold);display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="font-size:26px">🎓</span><div style="flex:1"><b style="font-family:var(--serif);color:var(--gold2)">校友模式｜'+(u.gradYear||'')+' 學年度畢業</b><div style="font-size:12.5px;color:var(--mut)">帳號永久保留，所有功能照常玩'+(g.rebirth?'｜🔁 轉生加成：全經驗+'+(g.rebirth*10)+'%・掉落+'+(g.rebirth*5)+'%':'')+'</div></div><button class="btn ghost mini" onclick="gradCeremony()">🎓 畢業紀念冊</button></div>':'')+

'<div style="background:rgba(0,0,0,.25);border:1px dashed #6b4a1f;color:#ffb26b;padding:8px 12px;border-radius:5px;font-size:12.5px;margin-bottom:14px">'+pick(TIPS)+'</div>'+

'<div class="featCat">⭐ AP 獎勵中心</div>'+
'<div class="featGrid">'+
'<div class="feat" style="--fc:#4caf50" onclick="needJs([\'js/views/vFreePoints.js\']).then(()=>vFreePoints())"><span class="fIco">🚶</span><b>步數獎勵</b><i>30步=1AP・每日上限100</i></div>'+
'<div class="feat" style="--fc:#2196f3" onclick="needJs([\'js/views/vFreePoints.js\']).then(()=>vFreePoints())"><span class="fIco">🏃</span><b>運動獎勵</b><i>跑步/游泳賺AP</i></div>'+
'<div class="feat" style="--fc:#ff9800" onclick="needJs([\'js/views/vGames.js\']).then(()=>vGames())"><span class="fIco">🎮</span><b>遊戲獎勵</b><i>小測驗・邏輯謎題</i></div>'+
'<div class="feat" style="--fc:#e91e63" onclick="needJs([\'js/views/vCreate.js\']).then(()=>vCreate())"><span class="fIco">🎨</span><b>創作贊助</b><i>提交作品・贊助創作者</i></div>'+
'<div class="feat" style="--fc:#00bcd4" onclick="needJs([\'js/views/vLearn.js\']).then(()=>vLearn())"><span class="fIco">📚</span><b>學習獎勵</b><i>答題賺AP・困難題加倍</i></div>'+
'<div class="feat" style="--fc:#9c27b0" onclick="needJs([\'js/views/vChatV.js\']).then(()=>vChatV())"><span class="fIco">💬</span><b>社群貢獻</b><i>幫助他人・導師活動</i></div>'+
'<div class="feat" style="--fc:#ffd700" onclick="needJs([\'js/views/vShopV.js\']).then(()=>vShopV())"><span class="fIco">🏫</span><b>嘉獎兌換</b><i>10AP=1嘉獎</i></div>'+
'</div>'+

featCatsHtml();

if(u.role==='student')setTimeout(tutorGuide,700); /* 首登新手引導（只顯示一次）*/

}

function homeLangSwitch(){
  var cur=langPref();
  var allLangs=[];
  for(var r in LANG_DATA){LANG_DATA[r].forEach(function(x){allLangs.push([r,x[0],x[1]])})}
  allLangs.sort(function(a,b){return a[2].localeCompare(b[2],'zh')});
  var cache=getI18nCache();
  var cachedCount=cur&&cache[cur]?Object.keys(cache[cur]).length:0;
  var h='<div style="margin-bottom:8px"><input id="hlSearch" placeholder="🔍 搜尋語言..." oninput="homeLangFilter(this.value)" style="width:100%;padding:10px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px"></div>';
  h+='<div style="font-size:11px;color:var(--mut);margin-bottom:6px">共 <b style="color:var(--gold2)">'+allLangs.length+'</b> 種語言可選'+(cur?'｜目前：<b style="color:var(--teal)">'+(langName(cur)||cur)+'</b>'+(cachedCount?' ('+cachedCount+' 筆已翻譯)':''):'')+'</div>';
  h+='<div id="hlGrid" style="max-height:55vh;overflow-y:auto;display:flex;flex-direction:column;gap:2px">';
  allLangs.forEach(function(x,i){
    var isActive=cur===x[0];
    var cc=cache[x[0]]?Object.keys(cache[x[0]]).length:0;
    h+='<button onclick="setLangPref(\''+x[0]+'\');closeModal()" style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:'+(isActive?'rgba(255,215,0,.1)':'transparent')+';border:1px '+(isActive?'solid var(--gold)':'solid transparent')+';border-radius:6px;cursor:pointer;text-align:left;color:'+(isActive?'var(--gold2)':'var(--txt)')+';font-size:12px;width:100%;font-family:inherit" onmouseover="this.style.background=\'rgba(255,255,255,.05)\'" onmouseout="this.style.background=\''+(isActive?'rgba(255,215,0,.1)':'transparent')+'\'">'+
    '<span style="color:var(--mut);min-width:28px;text-align:right;font-size:11px">'+(i+1)+'</span>'+
    '<span style="flex:1"><b>'+x[2]+'</b> <span style="color:var(--mut);font-size:10px">'+x[0]+'</span></span>'+
    (cc>0?'<span style="font-size:9px;color:var(--teal);background:rgba(0,230,118,.1);padding:1px 5px;border-radius:8px">'+cc+' 已翻</span>':'')+
    (isActive?'<span style="font-size:10px;color:var(--gold2)">✓</span>':'')+
    '</button>';
  });
  h+='</div>';
  h='<div style="font-size:16px;font-weight:900;font-family:var(--serif);color:var(--gold2);margin-bottom:10px">🌍 切換語言（'+allLangs.length+' 種）</div>'+h;
  openModal(h);
}
function homeLangFilter(q){
  q=(q||'').trim().toLowerCase();
  var grid=document.getElementById('hlGrid');if(!grid)return;
  var btns=grid.querySelectorAll('button');
  var idx=0;
  btns.forEach(function(b){
    var txt=b.textContent.toLowerCase();
    var show=(!q||txt.includes(q));
    b.style.display=show?'flex':'none';
    if(show){idx++;b.querySelector('span').textContent=idx}
  });
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
