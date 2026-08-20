/* ════════════════════════════════════════════
   vJourney 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   個人化冒險路線：roguelike 風格，種子=玩家名+等級 → 每人的冒險路線、事件、獎勵都不同
   ════════════════════════════════════════════ */
let JR={route:null,pos:0,hp:100,mode:'map'};

function vJourney(){
  const u=me();if(!u)return;
  const g=u.g||{};
  $('#view').innerHTML=back()+'<h3 class="vt">🗺️ 個人冒險 <span class="vsub">你的冒險路線與別人都不同・越練越獨特</span></h3>'+
  '<div class="panel2" style="margin-bottom:10px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">'+
  '<span>📈 等級 <b style="color:var(--gold2)">'+g.lv+'</b></span>'+
  '<span>🔮 冒險進度 '+Math.min(100,Math.round((g.jrStep||0)/50*100))+'%</span>'+
  '<button class="btn gold" onclick="jrStart()">🚀 開始/重走冒險</button>'+
  '<button class="btn ghost" onclick="jrMap()">🗺️ 路線地圖</button></div>'+
  '<div id="jrBody"></div>';
  jrMap();
}

async function jrFetch(){
  const r=await fetch(SUPA_URL+'/rest/v1/cr/journey',{method:'GET',headers:supaHeaders()});
  return await r.json();
}

async function jrStart(){
  toast('生成你的個人冒險路線...');
  try{
    const j=await jrFetch();
    if(!j||j.error){toast('冒險生成失敗','bad');return}
    JR.route=j.route||[];JR.pos=0;JR.hp=100;
    const u=me();u.g=u.g||{};u.g.jrStep=0;saveU(u);
    jrShow();
  }catch(e){toast('連線失敗','bad')}
}

async function jrMap(){
  const j=await jrFetch().catch(()=>null);
  const box=document.getElementById('jrBody');if(!box)return;
  const route=(j&&j.route)||[];
  if(!route.length){box.innerHTML='<p class="empty">還沒走過冒險。按「🚀 開始冒險」生成你的專屬路線！<br><span style="font-size:11px;color:var(--mut)">路線由你的帳號與等級決定，每個人都不一樣。</span></p>';return}
  box.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:8px">'+route.map((s,i)=>'<div class="panel2" style="flex:1;min-width:150px;cursor:pointer;border-color:'+(i<=Math.min((me().g&&me().g.jrStep)||0,route.length-1)?'var(--gold)':'var(--line)')+'" onclick="jrGo('+i+')">'+
  '<div style="font-size:20px">'+(s.type==='battle'?'⚔️':s.type==='study'?'📖':s.type==='treasure'?'🎁':'🌟')+'</div>'+
  '<b>'+esc(s.title)+'</b><div style="font-size:11px;color:var(--mut)">'+(i+1)+' / '+route.length+'・獎勵 '+s.reward+' XP</div></div>').join('')+'</div>'+
  '<div style="margin-top:10px;font-size:12px;color:var(--mut)">當前進度：'+(me().g&&me().g.jrStep||0)+' / '+route.length+' 站</div>';
}

function jrGo(i){
  const s=JR.route[i]||JR.route[0];if(!s){toast('先開始冒險','bad');return}
  JR.pos=i;JR.mode=s.type;jrShow();
}

function jrShow(){
  const s=JR.route[JR.pos];if(!s){jrStart();return}
  const u=me();u.g=u.g||{};const g=u.g;
  const nodeKey='jr_done_'+s.id;
  const done=!!(g[nodeKey]);
  let body='';
  if(s.type==='battle'){
    body='<div class="panel2" style="text-align:center;padding:30px"><div style="font-size:48px">⚔️</div><b style="font-size:18px;font-family:var(--serif)">'+esc(s.title)+' 戰鬥</b>'+
    '<div style="font-size:12px;color:var(--mut);margin:8px 0">選擇你的行動：</div><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px">'+
    s.choices.map((c,i)=>'<button class="btn" style="background:rgba(61,90,254,.2);border:1px solid #5c6bc0" onclick="jrAct('+i+')">'+esc(c.text)+'</button>').join('')+'</div>'+
    (done?'<div style="margin-top:12px;color:var(--gold2)">✅ 已征服此戰</div>':'')+'</div>';
  }else if(s.type==='study'){
    body='<div class="panel2" style="text-align:center;padding:30px"><div style="font-size:48px">📖</div><b style="font-size:18px;font-family:var(--serif)">'+esc(s.title)+' 學習關</b>'+
    '<div style="font-size:12px;color:var(--mut);margin:8px 0">先複習一個單元，再回來繼續冒險！</div><div style="display:flex;gap:8px;justify-content:center;margin-top:10px">'+
    '<button class="btn gold" onclick="jrStudyNow()">📖 去複習</button><button class="btn ghost" onclick="jrAct(0)">跳過（無獎勵）</button></div>'+
    (done?'<div style="margin-top:12px;color:var(--gold2)">✅ 已通過</div>':'')+'</div>';
  }else if(s.type==='treasure'){
    body='<div class="panel2" style="text-align:center;padding:30px"><div style="font-size:48px">🎁</div><b style="font-size:18px;font-family:var(--serif)">'+esc(s.title)+' 寶藏</b>'+
    '<div style="font-size:13px;color:var(--mut);margin:8px 0">獲得獎勵：<b style="color:var(--gold2)">'+s.reward+' XP</b></div>'+
    '<button class="btn teal" onclick="jrClaim()">🎁 領取</button></div>';
  }else{
    body='<div class="panel2" style="text-align:center;padding:30px"><div style="font-size:48px">🌟</div><b style="font-size:18px;font-family:var(--serif)">'+esc(s.title)+' 事件</b>'+
    '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px">'+
    s.choices.map((c,i)=>'<button class="btn" style="background:rgba(0,230,118,.15);border:1px solid #69f0ae" onclick="jrAct('+i+')">'+esc(c.text)+'</button>').join('')+'</div></div>';
  }
  $('#view').innerHTML=back("vJourney()")+'<h3 class="vt">🗺️ 第 '+(JR.pos+1)+' 站：'+esc(s.title)+'</h3>'+
  '<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap"><button class="btn ghost mini" onclick="jrPrev()">⬅ 上一站</button><button class="btn ghost mini" onclick="jrNext()">下一站 ➡</button><button class="btn ghost mini" onclick="vJourney()">🗺️ 地圖</button></div>'+
  body;
}

function jrAct(ci){
  const s=JR.route[JR.pos];if(!s)return;
  const c=s.choices[ci];if(!c)return;
  const eff=Number(c.effect)||0;
  const u=me();u.g=u.g||{};
  u.g[nodeKey()]='done';u.g.jrStep=Math.max(u.g.jrStep||0,JR.pos+1);
  addXp(u,eff*10);saveU(u);hud();
  toast('行動成功！獲得 '+(eff*10)+' XP','ok');
  jrNext();
  function nodeKey(){return 'jr_done_'+s.id}
}

function jrClaim(){
  const s=JR.route[JR.pos];if(!s)return;
  const u=me();u.g=u.g||{};
  u.g[nodeKey()]='done';u.g.jrStep=Math.max(u.g.jrStep||0,JR.pos+1);
  addXp(u,s.reward);saveU(u);hud();
  toast('獲得 '+s.reward+' XP！','ok');
  jrNext();
  function nodeKey(){return 'jr_done_'+s.id}
}

function jrPrev(){if(JR.pos>0){JR.pos--;jrShow()}else toast('已是第一站','bad')}
function jrNext(){if(JR.pos<JR.route.length-1){JR.pos++;jrShow()}else{toast('🎉 冒險完成！你的路線已永久記錄','ok');jrMap()}}

function jrStudyNow(){toast('前往「📝 筆記寶庫」複習吧！', 'ok');setTimeout(vNotes,600)}