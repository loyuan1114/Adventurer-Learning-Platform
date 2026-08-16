/* ════════════════════════════════════════════
   vBuffStore 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBuffStore
   ════════════════════════════════════════════ */
function vBuffStore(){
  const b = buffGet();
  const active = checkBuffActive();
  const starCoins = Number((me()&&me().g&&me().g.star&&me().g.star.coin)||0);

  let html = back() + '<h3 class="vt">🧪 雙倍增益商店與背包 <span class="vsub">使用星辰幣或寶石購買｜同一時間僅能生效一種雙倍</span></h3>';

  html += '<div class="panel2" style="margin-bottom:12px;border-left:4px solid var(--teal)">';
  html += '<b style="font-size:15px;color:var(--gold2)">⚡ 當前生效增益：</b>';
  if (active) {
    const leftSec = Math.max(0, Math.floor((active.expireTime - Date.now()) / 1000));
    const m = Math.floor(leftSec / 60), s = leftSec % 60;
    html += '<div style="font-size:14px;color:var(--teal);margin-top:4px;font-weight:700">🔥 ' + active.name + '｜剩餘時間：' + m + ' 分 ' + s + ' 秒</div>';
  } else {
    html += '<span style="color:var(--mut);margin-left:8px">目前無任何生效中增益</span>';
  }
  html += '</div>';

  html += '<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2)">🛒 增益道具商店 (持有 星辰幣 ⭐' + starCoins + ')</b>';
  const shopItems = [
    { type: 'double_luck', name: '🍀 雙倍運氣券 (1小時)', costCoins: 20, costGems: 1000, ms: 3600000 },
    { type: 'double_gold', name: '💰 雙倍金幣券 (1小時)', costCoins: 20, costGems: 1000, ms: 3600000 },
    { type: 'double_gems', name: '💎 雙倍寶石券 (1小時)', costCoins: 30, costGems: 1500, ms: 3600000 },
    { type: 'double_chests', name: '🎁 雙倍寶箱券 (1小時)', costCoins: 40, costGems: 2000, ms: 3600000 }
  ];
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-top:8px">';
  shopItems.forEach((item, idx) => {
    html += '<div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:6px;border:1px solid var(--line)">';
    html += '<div style="font-weight:700;color:var(--gold2)">' + item.name + '</div>';
    html += '<div style="margin-top:8px;display:flex;gap:6px">';
    html += '<button class="btn mini" onclick="buyBuff(' + idx + ',\'coins\')">⭐' + item.costCoins + ' 買</button>';
    html += '<button class="btn mini ghost" onclick="buyBuff(' + idx + ',\'gems\')">💎' + item.costGems + ' 買</button>';
    html += '</div></div>';
  });
  html += '</div></div>';

  html += '<div class="panel2"><b style="color:var(--gold2)">🎒 增益道具背包</b>';
  if (b.inventory.length === 0) {
    html += '<div style="font-size:12px;color:var(--mut);margin-top:8px">背包中無未使用的增益道具</div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">';
    b.inventory.forEach((item, i) => {
      html += '<div style="display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.2);padding:8px 12px;border-radius:6px;flex-wrap:wrap;gap:6px">';
      html += '<div><b>' + item.name + '</b> <span style="font-size:12px;color:var(--mut)">(' + item.duration + ')</span></div>';
      html += '<div style="display:flex;gap:6px">';
      html += '<button class="btn mini" onclick="useBuff(' + i + ')">▶️ 使用</button>';
      html += '<button class="btn mini ghost" onclick="openGiftBoxModal(' + i + ')">🎁 贈送好友</button>';
      html += '</div></div>';
    });
    html += '</div>';
  }
  html += '</div>';

  $('#view').innerHTML = html;
}
