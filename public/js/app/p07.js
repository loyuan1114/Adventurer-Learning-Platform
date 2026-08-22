/* ════════ 每日任務 ════════ */



function getMissions(g){

const d=today();

if(g.missions.date!==d){

g.missions.date=d;

const pool=MISSION_POOL.slice();const list=[];

while(list.length<sysCfg().dailyMissions&&pool.length){const m=JSON.parse(JSON.stringify(pool.splice((Math.random()*pool.length)|0,1)[0]));m.p=0;m.status='IN_PROGRESS';list.push(m)}

g.missions.list=list;

}

return g.missions.list;

}

function updMission(g,k,amt){

const wkly=getWeekly(g);wkly.n+=amt; /* 所有任務行為同步累計每週進度 */

const list=getMissions(g);

for(const m of list)if(m.k===k&&m.status!=='CLAIMED'&&m.p<m.g){

m.p=Math.min(m.p+amt,m.g);

if(m.p>=m.g&&m.status!=='COMPLETED'){m.status='COMPLETED';toast('📜 任務完成：'+m.n)}

}

if(list.every(m=>m.status==='CLAIMED')&&!g._allDone){g._allDone=true;g.diamond+=3;toast('💎 全部任務完成！+3 鑽石')}

if(!list.every(m=>m.status==='CLAIMED'))g._allDone=false;

}

/* ════════════════════════════════════════════
   vMiss 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vMiss, rwText
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMiss 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMiss
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMiss 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMiss
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMiss 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMiss
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMiss 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMiss
   ════════════════════════════════════════════ */
async function vMiss(){
  if(!await needJs(['js/views/vMiss.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vMiss();
}





function rwText(rw){const p=[];if(rw.gold)p.push('🪙'+rw.gold);if(rw.crystal)p.push('💠'+rw.crystal);if(rw.diamond)p.push('💎'+rw.diamond);if(rw.starlight)p.push('✨'+rw.starlight);if(rw.ironOre)p.push('⛏️'+rw.ironOre);if(rw.enhStone)p.push('🔩'+rw.enhStone);if(rw.labMat)p.push('🧪'+rw.labMat);if(rw.honor)p.push('🏅'+rw.honor);if(rw.quizPts)p.push('📖'+rw.quizPts);return p.join(' ')||'—'}




function claimOne(id){

const u=me(),g=u.g;const m=getMissions(g).find(x=>x.id===id);

if(!m||m.status!=='COMPLETED')return toast('⚠️ 任務未完成或已領取','bad');

m.status='CLAIMED';grantRw(g,m.rw);g.stats.missions=(g.stats.missions||0)+1;

saveU(u);hud();toast('🎁 已領取：'+m.n+'（'+rwText(m.rw)+'）');vMiss();

}

function claimAll(){

const u=me(),g=u.g;let cnt=0;

getMissions(g).forEach(m=>{if(m.status==='COMPLETED'){m.status='CLAIMED';grantRw(g,m.rw);g.stats.missions=(g.stats.missions||0)+1;cnt++}});

saveU(u);hud();toast('🎁 一鍵領取 '+cnt+' 個任務獎勵！');vMiss();

}

function claimWeekly(){

const u=me(),g=u.g;const wkly=getWeekly(g),goal=sysCfg().weeklyGoal;

if(wkly.claimed)return toast('⚠️ 本週獎勵已領取','bad');

if(wkly.n<goal)return toast('⚠️ 每週進度尚未達標（'+wkly.n+'/'+goal+'）','bad');

wkly.claimed=true;g.diamond+=20;g.gold+=1000;g.starlight+=20;

showRewardFX({diamond:20,gold:1000,starlight:20});

saveU(u);hud();toast('🎉 每週任務達標！💎20 🪙1000 ✨20 已入帳');vMiss();

}

/* ════════ 每日商店 ════════ */



/* ════════════════════════════════════════════
   vShopV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：SHOP_POOL, vShopV
   ════════════════════════════════════════════ */
const SHOP_POOL=[

{n:'強化石 ×5',ty:'mat',k:'enhStone',a:5,c:'gold',p:50,r:'N'},{n:'強化石 ×20',ty:'mat',k:'enhStone',a:20,c:'gold',p:180,r:'R'},

{n:'保護卷軸 ×1',ty:'mat',k:'protect',a:1,c:'gold',p:80,r:'R'},{n:'防爆盾 ×1',ty:'mat',k:'shield',a:1,c:'diamond',p:5,r:'SR'},

{n:'💠 水晶 ×30',ty:'cur',k:'crystal',a:30,c:'gold',p:120,r:'N'},{n:'💠 水晶 ×100',ty:'cur',k:'crystal',a:100,c:'gold',p:380,r:'R'},

{n:'🪙 金幣 ×200',ty:'cur',k:'gold',a:200,c:'diamond',p:5,r:'R'},{n:'🎫 十連券',ty:'cur',k:'crystal',a:270,c:'diamond',p:15,r:'SSR'},

{n:'經驗藥水(小)+200',ty:'exp',a:200,c:'gold',p:60,r:'N'},{n:'經驗藥水(大)+800',ty:'exp',a:800,c:'gold',p:200,r:'SR'},

{n:'✨ 星光碎片 ×5',ty:'mat',k:'starlight',a:5,c:'gold',p:150,r:'SR'},{n:'✨ 星光碎片 ×20',ty:'mat',k:'starlight',a:20,c:'diamond',p:8,r:'SSR'},

{n:'⛏️ 鐵礦 ×10',ty:'mat',k:'ironOre',a:10,c:'gold',p:90,r:'N'},{n:'⛏️ 鐵礦 ×30',ty:'mat',k:'ironOre',a:30,c:'gold',p:250,r:'R'},

{n:'🧪 實驗素材 ×15',ty:'mat',k:'labMat',a:15,c:'gold',p:110,r:'R'},{n:'🏅 榮譽幣 ×20',ty:'cur',k:'honor',a:20,c:'crystal',p:60,r:'R'},

{n:'🏟️ PK挑戰券 ×1',ty:'cur',k:'pkExtra',a:1,c:'diamond',p:8,r:'SR'},{n:'⚔️ 修煉場次數 ×1',ty:'cur',k:'quizExtra',a:1,c:'diamond',p:6,r:'SR'},

{n:'🎖 限時稱號「商店常客」',ty:'title',a:0,c:'gold',p:500,r:'SR'},{n:'🧩 角色碎片（隨機）',ty:'shard',a:1,c:'crystal',p:100,r:'SR'},

{n:'🛡️ 高階材料包',ty:'mat',k:'enhStone',a:10,c:'diamond',p:12,r:'SSR'}

];

/* ════════════════════════════════════════════
   vShopV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vShopV
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vShopV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vShopV
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vShopV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vShopV
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vShopV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vShopV
   ════════════════════════════════════════════ */
async function vShopV(){
  if(!await needJs(['js/views/vShopV.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vShopV();
}






function refreshShop(){

const u=me(),g=u.g,s=getShop(g);

if(s.refreshes>=3)return toast('⚠️ 今日刷新次數已用完','bad');

const cost=2+s.refreshes*2;

if(g.diamond<cost)return toast('💎 鑽石不足（需 '+cost+'）','bad');

g.diamond-=cost;s.refreshes++;

const pool=SHOP_POOL.slice();const items=[];

while(items.length<8&&pool.length){const it=JSON.parse(JSON.stringify(pool.splice((Math.random()*pool.length)|0,1)[0]));

it.disc=Math.random()<.3?(.6+Math.random()*.3):1;it.hot=Math.random()<.25;items.push(it)}

s.items=items;s.bought=[];

saveU(u);hud();toast('🔄 商店已刷新！');vShopV();

}

function buyIt(i){

const u=me(),g=u.g,s=getShop(g);

if(s.bought.includes(i))return toast('已購買過','bad');

const it=s.items[i];if(!it)return toast('⚠️ 商品不存在','bad');const price=Math.max(1,Math.round(it.p*it.disc));

if(g[it.c]<price)return toast((it.c==='gold'?'🪙':it.c==='diamond'?'💎':'💠')+' 不足','bad');

g[it.c]-=price;

if(it.ty==='mat')g[it.k]+=it.a;else if(it.ty==='cur')g[it.k]+=it.a;

else if(it.ty==='exp'){g.xp+=it.a;(()=>{const _ol=g.lv;while(g.xp>=g.needXp&&g.lv<effMaxLv()){g.xp-=g.needXp;g.lv++;g.needXp=CFG.needXp(g.lv)}if(g.lv>_ol)showLevelUpFX(g.lv)})()}

else if(it.ty==='title'){if(!g.titles.includes('shop'))g.titles.push('shop');toast('🎖 獲得稱號「商店常客」')}

else if(it.ty==='shard'){const cat=pick(['character','pet','anime']);const src=POOLS[cat];const n=pick(Object.keys(src));

if(!g.owned[cat].includes(n))g.owned[cat].push(n);toast('🧩 獲得角色：'+n)}

s.bought.push(i);saveU(u);hud();toast('✅ 購買成功：'+it.n);vShopV();

}

/* ════════════════════════════════════════════════

#8【新增】全服商店：全服共享限量庫存，任何人購買→庫存減少，每日補貨

════════════════════════════════════════════════ */


function getGShop(){

const d=today();

let gs=get(LS.gshop,null);

if(!gs||gs.date!==d){

gs={date:d,stock:{}};

GSHOP_ITEMS.forEach(it=>gs.stock[it.id]=it.stock); /* 每日補貨 */

set(LS.gshop,gs);

}

return gs;

}


/* ════════════════════════════════════════════
   vGShop 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：GSHOP_ITEMS, vGShop
   ════════════════════════════════════════════ */
const GSHOP_ITEMS=[

{id:'g1',n:'🧩 UR角色「創世之神」',ty:'char',cat:'character',name:'創世之神',r:'UR',price:800,cur:'diamond',stock:1},

{id:'g2',n:'🐾 UR寵物「創世鳳凰」',ty:'char',cat:'pet',name:'創世鳳凰',r:'UR',price:600,cur:'diamond',stock:2},

{id:'g3',n:'🤝 SSR隊友「���法學園長」',ty:'char',cat:'teammate',name:'魔法學園長',r:'SSR',price:300,cur:'diamond',stock:3},

{id:'g4',n:'✨ 星光碎片 ×50',ty:'mat',k:'starlight',a:50,r:'SSR',price:5000,cur:'gold',stock:5},

{id:'g5',n:'🔩 強化石 ×100',ty:'mat',k:'enhStone',a:100,r:'SR',price:3000,cur:'gold',stock:8},

{id:'g6',n:'⛏️ 鐵礦 ×200',ty:'mat',k:'ironOre',a:200,r:'SR',price:2500,cur:'gold',stock:10},

{id:'g7',n:'🎫 十連抽獎券',ty:'cur',k:'crystal',a:270,r:'SSR',price:20,cur:'diamond',stock:6},

{id:'g8',n:'🏅 榮譽幣 ×500',ty:'cur',k:'honor',a:500,r:'SR',price:150,cur:'diamond',stock:4},

{id:'g9',n:'📜 高階鍛造圖紙「傳說之劍」',ty:'bp',name:'傳說之劍',r:'UR',price:100,cur:'diamond',stock:2},

{id:'g10',n:'💎 鑽石 ×30',ty:'cur',k:'diamond',a:30,r:'UR',price:10000,cur:'gold',stock:3}

];

/* ════════════════════════════════════════════
   vGShop 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：gshopTabs, vGShop
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vGShop 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：gshopTabs, vGShop
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vGShop 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：gshopTabs, vGShop
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vGShop 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：gshopTabs, vGShop
   ════════════════════════════════════════════ */

async function vGShop(){
  if(!await needJs(['js/views/vMarket.js', 'js/views/vGShop.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vGShop();
}






function buyG(id){

const u=me(),g=u.g,gs=getGShop();

const it=GSHOP_ITEMS.find(x=>x.id===id);

/* 已移除非售罄檢查 */

if(g[it.cur]<it.price)return toast((it.cur==='gold'?'🪙':'💎')+' 不足','bad');

g[it.cur]-=it.price;

/* 已移除全服庫存遞減 */

if(it.ty==='char'){if(!g.owned[it.cat].includes(it.name))g.owned[it.cat].push(it.name);toast('🎉 獲得 '+it.n)}

else if(it.ty==='mat')g[it.k]+=it.a;

else if(it.ty==='cur')g[it.k]+=it.a;

else if(it.ty==='bp'){if(!g.blueprints.includes(it.name))g.blueprints.push(it.name);toast('📜 獲得圖紙：'+it.name)}

saveU(u);hud();toast('✅ 搶購成功！'+it.n+'（剩餘 '+(gs.stock[id])+' 件）');vGShop();

}
