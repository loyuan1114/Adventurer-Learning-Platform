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

function vGShop(){

const tab=CUR.gshopTab||'official';if(tab==='market')return vMarket();

const u=me(),g=u.g,gs=getGShop();

$('#view').innerHTML=back()+'<h3 class="vt">🌐 全服商店 <span class="vsub">全服自由交易｜每日補貨｜💠'+g.crystal+' 💎'+g.diamond+' 🪙'+g.gold+'</span></h3>'+gshopTabs('official')+

'<div class="panel2" style="margin-bottom:12px;font-size:12.5px;border-left:4px solid #e040fb;color:var(--mut)">📌 全服商店<b style="color:#e040fb">開放自由交易</b>，所有商品不限購、不限量，隨時歡迎選購！</div>'+

'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px">'+

GSHOP_ITEMS.map(it=>{

const left=gs.stock[it.id]||0;

const sold=left<=0;

return '<div class="panel2 gshopIt" style="border-color:'+CFG.RAR_C[it.r]+'">'+

'<span class="stockTag">自由交易</span>'+

'<b style="color:'+CFG.RAR_C[it.r]+';display:block;font-size:14px;margin-bottom:5px">'+it.n+'</b>'+

'<span style="font-size:12px;color:var(--mut)">'+(it.cur==='gold'?'🪙':it.cur==='diamond'?'💎':'💠')+' '+it.price+'</span>'+

'<div style="margin-top:9px"><button class="btn mini" onclick="buyG(\''+it.id+'\')">購買</button></div></div>';

}).join('')+'</div>';

}
