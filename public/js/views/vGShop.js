/* ════════════════════════════════════════════
   vGShop 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：gshopTabs, vGShop
   ════════════════════════════════════════════ */
function gshopTabs(tab){return '<div class="tabRow" style="margin-bottom:10px"><button class="tabB '+(tab==='official'?'on':'')+'" onclick="CUR.gshopTab=\'official\';vGShop()">🏪 官方商店</button><button class="tabB '+(tab==='market'?'on':'')+'" onclick="CUR.gshopTab=\'market\';vGShop()">🛒 玩家市集</button></div>'}

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
