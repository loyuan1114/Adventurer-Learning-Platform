/* vFreePoints — 步數/運動 Dashboard */
let FP = { balance: 0, caps: {}, ledger: [], loading: false };

function vFreePoints() {
  var u = me(); if (!u) return;
  FP.balance = u.g.apBalance || 0;
  let h = back() + '<h3 class="vt">🚶 步數/運動 Dashboard <span class="vsub">步數獎勵・運動獎勵・遊戲獎勵</span></h3>';

  /* ── 步數獎勵 ── */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--gold2);font-size:15px">🚶 步數獎勵</b>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:10px">';
  h += '<div class="panel2" style="text-align:center;padding:14px"><div style="font-size:11px;color:var(--mut)">今日已賺 AP</div><div id="fpEarned" style="font-size:28px;font-weight:900;color:var(--gold2);margin-top:4px">' + FP._earnedToday() + '</div></div>';
  h += '<div class="panel2" style="text-align:center;padding:14px"><div style="font-size:11px;color:var(--mut)">目前 AP 餘額</div><div id="fpBal" style="font-size:28px;font-weight:900;color:var(--teal);margin-top:4px">' + FP.balance + '</div></div>';
  h += '<div class="panel2" style="text-align:center;padding:14px"><div style="font-size:11px;color:var(--mut)">步數每日上限</div><div id="fpCap" style="font-size:28px;font-weight:900;color:var(--orange);margin-top:4px">' + FP._capDisplay() + '</div></div>';
  h += '</div>';

  h += '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:flex-end">';
  h += '<div><label style="font-size:11px;color:var(--mut)">輸入步數</label>';
  h += '<input id="fpSteps" class="inp" type="number" min="1" max="100000" value="3000" style="width:140px;margin-top:4px"></div>';
  h += '<button class="btn gold" onclick="fpSubmitSteps()" style="height:38px">🏃 提交步數</button>';
  h += '</div></div>';

  /* ── 運動獎勵 ── */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--teal);font-size:15px">🏃 運動獎勵</b>';
  h += '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:flex-end">';
  h += '<div><label style="font-size:11px;color:var(--mut)">選擇運動</label>';
  h += '<select id="fpSport" class="inp" style="width:130px;margin-top:4px">';
  h += '<option value="running">🏃 跑步</option><option value="swimming">🏊 游泳</option>';
  h += '<option value="cycling">🚴 騎車</option><option value="hiking">🥾 健行</option>';
  h += '<option value="yoga">🧘 瑜珈</option><option value="other">🏅 其他</option>';
  h += '</select></div>';
  h += '<div><label style="font-size:11px;color:var(--mut)">距離 (km)</label>';
  h += '<input id="fpDist" class="inp" type="number" min="0.1" step="0.1" value="3" style="width:100px;margin-top:4px"></div>';
  h += '<button class="btn teal" onclick="fpSubmitSport()" style="height:38px">✅ 提交運動</button>';
  h += '</div></div>';

  /* ── 快速遊戲/學習入口 ── */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--purple);font-size:15px">🎮 快速獎勵入口</b>';
  h += '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">';
  h += '<button class="rwChip" onclick="vLearn()">📚 學習獎勵</button>';
  h += '<button class="rwChip" onclick="fpQuickGame(\'quiz\')">🧪 小測驗</button>';
  h += '<button class="rwChip" onclick="fpQuickGame(\'puzzle\')">🧩 數學練習</button>';
  h += '<button class="rwChip" onclick="fpQuickGame(\'challenge\')">💻 程式挑戰</button>';
  h += '</div></div>';

  /* ── 最近 AP 獎勵紀錄 ── */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center">';
  h += '<b style="color:var(--gold2);font-size:15px">📋 最近 AP 獎勵紀錄</b>';
  h += '<button class="btn ghost mini" onclick="fpRefreshLedger()">🔄 刷新</button></div>';
  h += '<div id="fpLedger" style="margin-top:10px">';
  h += FP._renderLedger();
  h += '</div></div>';

  $('#view').innerHTML = h;
  fpFetchLedger();
}

FP._earnedToday = function () {
  var led = FP.ledger || [];
  var today = new Date().toISOString().slice(0, 10);
  var sum = 0;
  for (var i = 0; i < led.length; i++) {
    var tx = led[i];
    var ts = tx.ts || '';
    if (ts.indexOf(today) === 0 && tx.amount > 0) sum += tx.amount;
  }
  return sum;
};

FP._capDisplay = function () {
  var caps = FP.caps || {};
  var s = caps.STEPS || {};
  return (s.daily || 0) + ' / ' + (s.last_daily || 100);
};

FP._renderLedger = function () {
  var led = FP.ledger || [];
  var types = ['STEPS', 'SPORTS', 'GAME', 'LEARNING'];
  var icons = { STEPS: '🚶', SPORTS: '🏃', GAME: '🎮', LEARNING: '📚' };
  var names = { STEPS: '步數', SPORTS: '運動', GAME: '遊戲', LEARNING: '學習' };
  var filtered = [];
  for (var i = 0; i < led.length; i++) {
    if (types.indexOf(led[i].type) >= 0) filtered.push(led[i]);
  }
  if (!filtered.length) return '<div style="color:var(--mut);font-size:12px;padding:8px 0">尚無獎勵紀錄</div>';
  var html = '<div style="max-height:260px;overflow-y:auto">';
  for (var j = 0; j < filtered.length && j < 30; j++) {
    var tx = filtered[j];
    var icon = icons[tx.type] || '⭐';
    var name = names[tx.type] || tx.type;
    var meta = tx.meta || {};
    var detail = '';
    if (tx.type === 'STEPS') detail = (meta.steps || 0) + ' 步';
    else if (tx.type === 'SPORTS') detail = (meta.sport || '') + ' ' + (meta.distance_km || 0) + 'km';
    else if (tx.type === 'LEARNING') detail = (meta.subject || '') + ' ' + (meta.duration_min || 0) + '分鐘';
    else if (tx.type === 'GAME') detail = (meta.game || '');
    var time = tx.ts ? new Date(tx.ts).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '';
    html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">';
    html += '<span style="font-size:16px">' + icon + '</span>';
    html += '<div style="flex:1;font-size:12px"><b>' + name + '</b> <span style="color:var(--mut)">' + detail + '</span></div>';
    html += '<span style="font-size:12px;color:var(--mut)">' + time + '</span>';
    html += '<span style="font-size:13px;font-weight:700;color:var(--gold2)">+' + tx.amount + ' AP</span>';
    html += '</div>';
  }
  html += '</div>';
  return html;
};

function fpFetchLedger() {
  fetch('/rest/v1/ap/ledger', { headers: { 'x-adv9-token': WTOKEN } })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.ok) { FP.ledger = d.ledger || []; FP._updateLedger(); FP._updateEarned(); }
    }).catch(function () { });
  fetch('/rest/v1/ap/balance', { headers: { 'x-adv9-token': WTOKEN } })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.ok) { FP.balance = d.balance || 0; FP.caps = d.caps || {}; FP._updateBal(); FP._updateCap(); }
    }).catch(function () { });
}

FP._updateLedger = function () {
  var el = document.getElementById('fpLedger');
  if (el) el.innerHTML = FP._renderLedger();
};

FP._updateBal = function () {
  var el = document.getElementById('fpBal');
  if (el) el.textContent = FP.balance;
};

FP._updateCap = function () {
  var el = document.getElementById('fpCap');
  if (el) el.textContent = FP._capDisplay();
};

FP._updateEarned = function () {
  var el = document.getElementById('fpEarned');
  if (el) el.textContent = FP._earnedToday();
};

function fpRefreshLedger() { fpFetchLedger(); }

function fpSubmitSteps() {
  var inp = document.getElementById('fpSteps');
  var steps = parseInt(inp ? inp.value : '0', 10);
  if (!steps || steps <= 0) { toast('⚠️ 請輸入有效步數', 'bad'); return; }
  fetch('/rest/v1/ap/steps', {
    method: 'POST',
    headers: { 'x-adv9-token': WTOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ steps: steps })
  }).then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.ok) {
        toast('🚶 +' + d.ap + ' AP！（' + steps + ' 步）');
        FP.balance = d.balance || 0;
        FP.caps = d.caps || FP.caps;
        fetchApBalance();
        fpFetchLedger();
      } else { toast('❌ ' + (d.reason || '提交失敗'), 'bad'); }
    }).catch(function () { toast('❌ 網路錯誤', 'bad'); });
}

function fpSubmitSport() {
  var sel = document.getElementById('fpSport');
  var distEl = document.getElementById('fpDist');
  var sport = sel ? sel.value : 'running';
  var dist = parseFloat(distEl ? distEl.value : '0');
  if (!dist || dist <= 0) { toast('⚠️ 請輸入有效距離', 'bad'); return; }
  fetch('/rest/v1/ap/sports', {
    method: 'POST',
    headers: { 'x-adv9-token': WTOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ distance_km: dist, sport: sport })
  }).then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.ok) {
        toast('🏃 +' + d.ap + ' AP！（' + sport + ' ' + dist + 'km）');
        FP.balance = d.balance || 0;
        fetchApBalance();
        fpFetchLedger();
      } else { toast('❌ ' + (d.reason || '提交失敗'), 'bad'); }
    }).catch(function () { toast('❌ 網路錯誤', 'bad'); });
}

function fpQuickGame(game) {
  var names = { quiz: '小測驗', puzzle: '數學練習', challenge: '程式挑戰' };
  toast('🎮 啟動' + (names[game] || game) + '…');
  setTimeout(function () { if (typeof tGo === 'function') tGo('quiz'); }, 500);
}
