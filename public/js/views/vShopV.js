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

function vShopV(){

const u=me(),g=u.g,s=getShop(g);

$('#view').innerHTML=back()+'<h3 class="vt">🏪 每日商店 <span class="vsub">💠'+g.crystal+'｜🪙'+g.gold+'｜💎'+g.diamond+'｜刷新 '+s.refreshes+'/3</span></h3>'+

'<button class="btn teal mini" style="margin-bottom:12px" onclick="refreshShop()">🔄 手動刷新（💎'+(2+s.refreshes*2)+'）</button>'+

'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">'+

s.items.map((it,i)=>{const bought=s.bought.includes(i);const price=Math.max(1,Math.round(it.p*it.disc));

return '<div class="panel2" style="border-color:'+CFG.RAR_C[it.r]+';position:relative">'+

(it.hot?'<span style="position:absolute;top:-8px;right:8px;background:#e5484d;color:#fff;font-size:10px;padding:2px 8px;border-radius:99px;font-weight:900">🔥 熱賣</span>':'')+

'<b style="color:'+CFG.RAR_C[it.r]+';display:block;font-size:14px">'+it.n+'</b>'+

'<span style="font-size:12px;color:var(--mut)">'+(it.disc<1?'<s style="opacity:.6">'+it.p+'</s> <b style="color:#ff9d7a">'+price+'</b>':'<b>'+price+'</b>')+' '+(it.c==='gold'?'🪙':it.c==='diamond'?'💎':'💠')+'</span>'+

'<div style="margin-top:8px">'+(bought?'<b style="color:var(--green)">已購買</b>':'<button class="btn mini" onclick="buyIt('+i+')">購買</button>')+'</div></div>'}).join('')+'</div>';

}
