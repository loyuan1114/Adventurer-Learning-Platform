/* ════════════════════════════════════════════
   vShopV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vShopV
   ════════════════════════════════════════════ */
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
