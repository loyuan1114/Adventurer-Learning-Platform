/* ════════════════════════════════════════════
   vDoll 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vDoll
   ════════════════════════════════════════════ */
function vDoll(){
  const u=me(),g=u.g;
  const d=_dGet();
  if(!g.doll)g.doll={list:[],shopBought:[]};
  if(!d.owned)d.owned=[];
  if(!d.shop)d.shop=[];
  _dSet(d);
  const owned=d.owned.filter(x=>x.owner===u.id);
  const shopDolls=d.shop||[];
  const evt=DOLL_EVENTS.find(e=>e.active&&(!e.startTime||e.startTime<=new Date().toISOString())&&(!e.endTime||e.endTime>=new Date().toISOString()));
  const mult=evt?evt.multiplier:1;
  $('#view').innerHTML=back('vHome()')+'<h3 class="vt">🌟 娃娃物語 <span class="vsub">風火水土・四屬性養成系統</span></h3>'+
    (evt?`<div class="panel2" style="margin-bottom:12px;border-left:4px solid var(--green);display:flex;align-items:center;gap:10px"><span style="font-size:22px">⚡</span><div style="flex:1"><b style="color:var(--green);font-size:13px">活動進行中：${evt.type==='bond_double'?'親密度獲取 x'+mult : evt.type==='exp_double'?'經驗值 x'+mult:'掉落率 x'+mult}</b></div><button class="btn ghost mini" onclick="vHome()">✕</button></div>`:'')+
    '<div style="display:flex;gap:10px;align-items:center;margin-bottom:14px;flex-wrap:wrap">'+
      '<button class="btn btn-primary" onclick="showDollCreate()">✨ 創造娃娃</button>'+
      '<button class="btn ghost" onclick="renderDollShop()">🛒 商店</button>'+
      '<span style="font-size:12px;color:var(--mut);margin-left:8px">持有：'+owned.length+' 隻｜總互動：'+owned.reduce((s,x)=>s+(x.interactCount||0),0)+' 次</span>'+
    '</div>'+
    '<div id="dollView">'+dollListHtml(owned,shopDolls,u,g,d,mult)+'</div>';
}
