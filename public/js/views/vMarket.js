/* ════════════════════════════════════════════
   vMarket 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMarket
   ════════════════════════════════════════════ */
function vMarket(){

const u=me(),g=u.g;const mkt=get(LS.market,[]);

const q=(CUR.mktSearch||'').toLowerCase();

let items=mkt.slice().sort((a,b)=>b.t-a.t);

if(q)items=items.filter(it=>it.w.n.toLowerCase().includes(q)||(it.seller||'').toLowerCase().includes(q));

$('#view').innerHTML=back()+'<h3 class="vt">🌐 全服商店 <span class="vsub">🛒 玩家市集｜🪙 '+g.gold+'</span></h3>'+gshopTabs('market')+

'<div class="panel2" style="margin-bottom:12px;font-size:12.5px;border-left:4px solid var(--teal);color:var(--mut)">📌 全服玩家自由交易：在 🎒背包 點「📤 上架市集」掛牌，其他玩家可搜尋、瀏覽並以 🪙金幣 購買；售出金額全額入賣家帳戶。定價不得低於物品價值 40%。</div>'+

'<div style="display:flex;gap:8px;margin-bottom:12px"><input id="mktQ" placeholder="🔍 搜尋物品或賣家..." value="'+esc(CUR.mktSearch||'')+'" onkeydown="if(event.key===\'Enter\'){CUR.mktSearch=this.value;vMarket()}"><button class="btn mini" onclick="CUR.mktSearch=$(\'#mktQ\').value;vMarket()">搜尋</button></div>'+

(items.length?items.map(it=>{const minePost=it.sellerId===u.id;

return '<div class="panel2" style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap"><b style="color:'+(CFG.QUAL_C[it.w.q]||'var(--txt)')+'">🛡️ '+esc(it.w.n)+' +'+(it.w.lv||0)+'</b>'+

'<span style="font-size:11.5px;color:var(--mut)">'+(it.w.slot||'')+'｜品質 '+it.w.q+'｜賣家：'+esc(it.seller)+'｜'+fmt(it.t)+'</span>'+

'<span style="margin-left:auto;display:flex;gap:8px;align-items:center"><b style="color:var(--gold2)">🪙 '+it.price+'</b>'+

(minePost?'<button class="btn danger mini" onclick="marketCancel(\''+it.id+'\')">下架</button>':'<button class="btn mini" onclick="marketBuy(\''+it.id+'\')">購買</button>')+'</span></div>'}).join('')

:'<p class="empty">市集目前沒有商品，快去背包上架吧！</p>');

}
