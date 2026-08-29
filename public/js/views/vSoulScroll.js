/* vSoulScroll — 靈魂卷軸：AI 消耗品 */
const SCROLL_COST_AP = 200;
const SCROLL_SAN_DROP = 20;
const SCROLL_XP_DUR_MS = 86400000;
const SCROLL_DURABILITY_DROP = 0.10;
const SCROLL_KEY = 'ADV9_SOUL_SCROLL';

function scrollData() {
  return get(SCROLL_KEY, { count: 0, used: 0, xpDebuffUntil: 0, lastUsed: 0 });
}
function scrollSave(d) { set(SCROLL_KEY, d); }

function scrollSan() {
  const u = me(); if (!u || !u.g) return 100;
  return typeof u.g.san === 'number' ? u.g.san : 100;
}
function scrollSanSet(v) {
  const u = me(); if (!u || !u.g) return;
  u.g.san = Math.max(0, Math.min(100, v));
  saveU(u); hud();
}
function scrollXpDebuffActive() {
  const d = scrollData();
  return d.xpDebuffUntil > Date.now();
}
function scrollXpDebuffLeft() {
  const d = scrollData();
  return Math.max(0, d.xpDebuffUntil - Date.now());
}
function scrollEquipDurabilityDrop() {
  const eq = get('ADV9_EQUIP', { owned: [], equipped: {} });
  let dropped = 0;
  eq.owned.forEach(e => {
    if (e && typeof e.durability === 'number') {
      e.durability = Math.max(0, e.durability - SCROLL_DURABILITY_DROP);
      dropped++;
    }
  });
  if (dropped) set('ADV9_EQUIP', eq);
  return dropped;
}

var _scrollLoading=false;
function scrollPurchase() {
  if(_scrollLoading)return;
  _scrollLoading=true;
  const u = me(); if (!u || !u.g) { _scrollLoading=false; return toast('⚠️ 請先登入', 'bad'); }
  fetch('/rest/v1/ap/balance', { headers: { 'x-adv9-token': WTOKEN } })
    .then(r => r.json())
    .then(d => {
      if (!d.ok) { _scrollLoading=false; return toast('❌ 查詢失敗', 'bad'); }
      if ((d.balance || 0) < SCROLL_COST_AP) { _scrollLoading=false; return toast('❌ AP 不足（需 ' + SCROLL_COST_AP + '）', 'bad'); }
      fetch('/rest/v1/ap/spend', {
        method: 'POST',
        headers: { 'x-adv9-token': WTOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: SCROLL_COST_AP, reason: '購買靈魂卷軸' })
      }).then(r2 => r2.json()).then(d2 => {
        _scrollLoading=false;
        if (!d2.ok) return toast('❌ ' + (d2.reason || '購買失敗'), 'bad');
        const sd = scrollData();
        sd.count++;
        scrollSave(sd);
        toast('✅ 購買成功！靈魂卷軸 x1');
        vSoulScroll();
      }).catch(() => { _scrollLoading=false; toast('❌ 網路錯誤', 'bad'); });
    }).catch(() => { _scrollLoading=false; toast('❌ 網路錯誤', 'bad'); });
}

function scrollUse() {
  const u = me(); if (!u || !u.g) return toast('⚠️ 請先登入', 'bad');
  const sd = scrollData();
  if (sd.count <= 0) return toast('❌ 沒有靈魂卷軸', 'bad');

  sd.count--;
  sd.used++;
  sd.lastUsed = Date.now();
  sd.xpDebuffUntil = Date.now() + SCROLL_XP_DUR_MS;
  scrollSave(sd);

  scrollSanSet(scrollSan() - SCROLL_SAN_DROP);
  scrollEquipDurabilityDrop();

  toast('📜 靈魂卷軸已使用！理智值 -20，裝備耐久 -10%');
  toast('⚠️ 經驗值減半 debuff 持續 24 小時', 'bad');
  vSoulScroll();
}

function scrollStatusHtml() {
  const sd = scrollData();
  const san = scrollSan();
  const sanColor = san > 60 ? '#4caf50' : san > 30 ? '#ff9800' : '#ef5350';
  const sanIcon = san > 60 ? '😊' : san > 30 ? '😐' : '😵';
  let h = '';

  h += '<div class="panel2" style="margin-top:14px">';
  h += '<b style="color:var(--gold2)">🧠 理智值（SAN）</b>';
  h += '<div style="display:flex;align-items:center;gap:10px;margin-top:8px">';
  h += '<div style="flex:1"><div class="bar" style="height:16px"><i style="width:' + san + '%;background:' + sanColor + '"></i></div></div>';
  h += '<span style="font-size:20px">' + sanIcon + '</span>';
  h += '<span style="font-size:15px;font-weight:700;color:' + sanColor + '">' + san + '/100</span>';
  h += '</div>';
  if (san <= 0) h += '<div style="color:#ef5350;font-size:12px;margin-top:6px">💀 理智歸零！你已陷入瘋狂，無法使用卷軸。</div>';
  else if (san <= 30) h += '<div style="color:#ff9800;font-size:12px;margin-top:6px">⚠️ 理智低落，繼續使用可能導致不可逆後果！</div>';
  h += '</div>';

  if (scrollXpDebuffActive()) {
    const left = scrollXpDebuffLeft();
    const hrs = Math.floor(left / 3600000);
    const mins = Math.floor((left % 3600000) / 60000);
    h += '<div class="panel2" style="margin-top:10px;border-color:#ff9800">';
    h += '<b style="color:#ff9800">⚠️ 經驗減半 Debuff</b>';
    h += '<div style="font-size:13px;margin-top:6px">剩餘時間：<b style="color:#ff9800">' + hrs + 'h ' + mins + 'm</b></div>';
    h += '<div class="bar" style="height:8px;margin-top:6px"><i style="width:' + Math.min(100, (left / SCROLL_XP_DUR_MS) * 100) + '%;background:#ff9800"></i></div>';
    h += '<div style="font-size:11px;color:var(--mut);margin-top:4px">此期間所有經驗獲取量減半</div>';
    h += '</div>';
  }

  return h;
}

function vSoulScroll() {
  const u = me(); if (!u) return toast('⚠️ 請先登入', 'bad');
  const sd = scrollData();
  const san = scrollSan();

  let h = back() + '<h3 class="vt">📜 靈魂卷軸 <span class="vsub">AI 消耗品・代價沉重</span></h3>';

  h += '<div class="panel2">';
  h += '<div style="font-size:36px;text-align:center">📜</div>';
  h += '<b style="display:block;text-align:center;font-family:var(--serif);color:var(--gold2);margin:6px 0">靈魂卷軸</b>';
  h += '<div class="skTxt" style="text-align:center">召喚 AI 之力直接揭示答案，但代價是理智與力量。</div>';
  h += '<div style="display:flex;justify-content:center;gap:16px;margin-top:10px;font-size:12px;color:var(--mut)">';
  h += '<span>🧠 SAN -' + SCROLL_SAN_DROP + '</span>';
  h += '<span>📉 經驗 -50% (24h)</span>';
  h += '<span>🔨 耐久 -10%</span>';
  h += '</div>';
  h += '</div>';

  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:12px">';
  h += '<div class="panel2" style="text-align:center;padding:14px">';
  h += '<div style="font-size:11px;color:var(--mut)">持有數量</div>';
  h += '<div style="font-size:28px;font-weight:900;color:var(--teal);margin-top:4px">x' + sd.count + '</div>';
  h += '</div>';
  h += '<div class="panel2" style="text-align:center;padding:14px">';
  h += '<div style="font-size:11px;color:var(--mut)">已使用次數</div>';
  h += '<div style="font-size:28px;font-weight:900;color:#ff9800;margin-top:4px">' + sd.used + '</div>';
  h += '</div>';
  h += '<div class="panel2" style="text-align:center;padding:14px">';
  h += '<div style="font-size:11px;color:var(--mut)">購買費用</div>';
  h += '<div style="font-size:28px;font-weight:900;color:var(--gold2);margin-top:4px">' + SCROLL_COST_AP + '</div>';
  h += '<div style="font-size:11px;color:var(--mut)">AP</div>';
  h += '</div>';
  h += '</div>';

  h += scrollStatusHtml();

  h += '<div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">';
  h += '<button class="btn gold" style="flex:1;min-width:120px" onclick="scrollPurchase()">🛒 購買卷軸 (' + SCROLL_COST_AP + ' AP)</button>';
  h += '<button class="btn" style="flex:1;min-width:120px;background:linear-gradient(135deg,#7b1fa2,#4a148c);border-color:#9c27b0" onclick="scrollUse()"' + (sd.count <= 0 || san <= 0 ? ' disabled' : '') + '>📜 使用卷軸</button>';
  h += '</div>';
  if (sd.count <= 0) h += '<div style="color:var(--mut);font-size:11px;text-align:center;margin-top:6px">需要至少一個卷軸才能使用</div>';
  if (san <= 0) h += '<div style="color:#ef5350;font-size:11px;text-align:center;margin-top:6px">理智值為零，無法使用卷軸</div>';

  h += '<div class="panel2" style="margin-top:14px">';
  h += '<b style="color:var(--gold2)">📊 卷軸歷史紀錄</b>';
  h += '<div style="max-height:180px;overflow-y:auto;margin-top:8px">';
  if (sd.used === 0) {
    h += '<div style="color:var(--mut);font-size:12px">尚無使用紀錄</div>';
  } else {
    for (let i = 0; i < Math.min(sd.used, 20); i++) {
      h += '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05)">';
      h += '<span>📜</span>';
      h += '<span style="flex:1;font-size:12px">使用第 ' + (sd.used - i) + ' 次</span>';
      h += '<span style="font-size:11px;color:var(--mut)">SAN -' + SCROLL_SAN_DROP + '</span>';
      h += '</div>';
    }
  }
  h += '</div></div>';

  $('#view').innerHTML = h;
}

window.vSoulScroll = vSoulScroll;
window.scrollPurchase = scrollPurchase;
window.scrollUse = scrollUse;
