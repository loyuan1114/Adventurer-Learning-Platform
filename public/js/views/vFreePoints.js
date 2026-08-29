/* vFreePoints — 步數/運動 Dashboard */
let FP = { balance: 0, caps: {}, ledger: [], loading: false };

function vFreePoints() {
  var u = me(); if (!u) return;
  // Clear any stale FP data from previous session
  FP.balance = 0; FP.caps = {}; FP.ledger = [];
  // CRITICAL: Reset FP from current user to prevent stale data from previous user
  FP.balance = u.g.apBalance || 0;
  FP.caps = {};
  FP.ledger = [];
  let h = back() + '<h3 class="vt">🚶 步數/運動 Dashboard <span class="vsub">步數獎勵・運動獎勵・遊戲獎勵</span></h3>';

  /* ── 步數獎勵 ── */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--gold2);font-size:15px">🚶 步數獎勵 <span style="font-size:11px;font-weight:400;color:var(--mut)">30步=1AP・每日上限100AP</span></b>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:10px">';
  h += '<div class="panel2" style="text-align:center;padding:14px"><div style="font-size:11px;color:var(--mut)">今日已賺 AP</div><div id="fpEarned" style="font-size:28px;font-weight:900;color:var(--gold2);margin-top:4px">' + FP._earnedToday('STEPS') + '</div></div>';
  h += '<div class="panel2" style="text-align:center;padding:14px"><div style="font-size:11px;color:var(--mut)">目前 AP 餘額</div><div id="fpBal" style="font-size:28px;font-weight:900;color:var(--teal);margin-top:4px">' + FP.balance + '</div></div>';
  h += '<div class="panel2" style="text-align:center;padding:14px"><div style="font-size:11px;color:var(--mut)">步數每日上限</div><div id="fpCap" style="font-size:28px;font-weight:900;color:var(--orange);margin-top:4px">' + FP._capDisplay('STEPS') + '</div></div>';
  h += '</div>';

  h += '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:flex-end">';
  h += '<div><label style="font-size:11px;color:var(--mut)">輸入步數</label>';
  h += '<input id="fpSteps" class="inp" type="number" min="1" max="100000" value="3000" style="width:140px;margin-top:4px"></div>';
  h += '<button id="fpStepsBtn" class="btn gold" onclick="fpSubmitSteps()" style="height:38px">🏃 提交步數</button>';
  h += '</div></div>';

  /* ── 運動獎勵 ── */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--teal);font-size:15px">🏃 運動獎勵 <span style="font-size:11px;font-weight:400;color:var(--mut)">跑步/游泳賺AP・每日上限200AP</span></b>';
  h += '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:flex-end">';
  h += '<div><label style="font-size:11px;color:var(--mut)">選擇運動</label>';
  h += '<select id="fpSport" class="inp" style="width:130px;margin-top:4px">';
  h += '<option value="running">🏃 跑步</option><option value="swimming">🏊 游泳</option>';
  h += '<option value="cycling">🚴 騎車</option><option value="hiking">🥾 健行</option>';
  h += '<option value="yoga">🧘 瑜珈</option><option value="other">🏅 其他</option>';
  h += '</select></div>';
  h += '<div><label style="font-size:11px;color:var(--mut)">距離 (km)</label>';
  h += '<input id="fpDist" class="inp" type="number" min="0.1" step="0.1" value="3" style="width:100px;margin-top:4px"></div>';
  h += '<div><label style="font-size:11px;color:var(--mut)">照片證明</label>';
  h += '<input id="fpSportProof" type="file" accept="image/*" style="display:none" onchange="fpSportPreview(this)">';
  h += '<button class="btn ghost mini" onclick="document.getElementById(\'fpSportProof\').click()" style="margin-top:4px">📷 選擇照片</button>';
  h += '<div id="fpSportPreview" style="margin-top:4px"></div></div>';
  h += '<button id="fpSportBtn" class="btn teal" onclick="fpSubmitSport()" style="height:38px">✅ 提交運動</button>';
  h += '</div></div>';

  /* ── 運動每日上限 ── */
  h += '<div class="panel2" style="margin-top:8px;display:flex;gap:16px;align-items:center">';
  h += '<span style="font-size:12px;color:var(--mut)">🏃 運動今日已領: <b id="fpSportEarned" style="color:var(--teal)">' + FP._earnedToday('SPORTS') + ' AP</b></span>';
  h += '<span style="font-size:12px;color:var(--mut)">剩餘: <b id="fpSportRemain" style="color:var(--gold2)">' + FP._remainDisplay('SPORTS', 200) + ' AP</b></span>';
  h += '</div>';

  /* ── 快速遊戲/學習入口 ── */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--purple);font-size:15px">🎮 快速獎勵入口</b>';
  h += '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">';
  h += '<button class="rwChip" onclick="vLearn()">📚 學習獎勵</button>';
  h += '<button class="rwChip" onclick="fpQuickGame(\'quiz\')">🧪 小測驗</button>';
  h += '<button class="rwChip" onclick="fpQuickGame(\'puzzle\')">🧩 數學練習</button>';
  h += '<button class="rwChip" onclick="fpQuickGame(\'challenge\')">💻 程式挑戰</button>';
  h += '</div></div>';

  /* ── 獨立上限說明 ── */
  h += '<div class="panel2" style="margin-top:12px;background:rgba(79,172,254,.08);border:1px solid rgba(79,172,254,.2)">';
  h += '<b style="color:var(--blue);font-size:13px">📊 各類型獨立上限</b>';
  h += '<div style="margin-top:8px;font-size:11px;color:var(--mut);line-height:1.8">';
  h += FP._allCapsTable();
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

FP._earnedToday = function (type) {
  var led = FP.ledger || [];
  var today = new Date().toISOString().slice(0, 10);
  var sum = 0;
  for (var i = 0; i < led.length; i++) {
    var tx = led[i];
    if (type && tx.type !== type) continue;
    var ts = tx.ts || 0;
    var d = new Date(ts);
    var ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    if (ds === today && tx.amount > 0) sum += tx.amount;
  }
  return sum;
};

FP._capDisplay = function (type) {
  var caps = FP.caps || {};
  var s = caps[type] || {};
  var used = s.daily || 0;
  var capMap = { STEPS: 100, SPORTS: 2, GAME: 200, CREATION: 100, LEARNING: 300, COMMUNITY: 150 };
  var total = capMap[type] || 100;
  var remain = Math.max(0, total - used);
  if (remain <= 0) return '<span style="color:#ef4444">已達上限</span>';
  return used + ' / ' + total;
};

FP._remainDisplay = function (type, total) {
  var caps = FP.caps || {};
  var s = caps[type] || {};
  var used = s.daily || 0;
  var remain = Math.max(0, total - used);
  return remain;
};

FP._allCapsTable = function () {
  var caps = FP.caps || {};
  var types = [
    { key: 'STEPS', name: '🚶 步數', daily: 100, weekly: 700, monthly: 3000 },
    { key: 'SPORTS', name: '🏃 運動', daily: 200, weekly: 1400, monthly: 6000 },
    { key: 'GAME', name: '🎮 遊戲', daily: 200, weekly: 1000, monthly: 4000 },
    { key: 'CREATION', name: '🎨 創作', daily: 100, weekly: 500, monthly: 2000 },
    { key: 'LEARNING', name: '📚 學習', daily: 300, weekly: 1500, monthly: 6000 },
    { key: 'COMMUNITY', name: '💬 社群', daily: 150, weekly: 750, monthly: 3000 }
  ];
  var h = '<table style="width:100%;font-size:11px;border-collapse:collapse">';
  h += '<tr style="color:var(--blue)"><td>類型</td><td>今日</td><td>本週</td><td>本月</td></tr>';
  for (var i = 0; i < types.length; i++) {
    var t = types[i];
    var c = caps[t.key] || {};
    var dr = Math.max(0, t.daily - (c.daily || 0));
    var wr = Math.max(0, t.weekly - (c.weekly || 0));
    var mr = Math.max(0, t.monthly - (c.monthly || 0));
    h += '<tr><td>' + t.name + '</td>';
    h += '<td style="color:' + (dr <= 0 ? '#ef4444' : 'var(--gold2)') + '">' + dr + '/' + t.daily + '</td>';
    h += '<td style="color:' + (wr <= 0 ? '#ef4444' : 'var(--gold2)') + '">' + wr + '/' + t.weekly + '</td>';
    h += '<td style="color:' + (mr <= 0 ? '#ef4444' : 'var(--gold2)') + '">' + mr + '/' + t.monthly + '</td>';
    h += '</tr>';
  }
  h += '</table>';
  return h;
};

FP._renderLedger = function () {
  var led = FP.ledger || [];
  var types = ['STEPS', 'SPORTS', 'GAME', 'LEARNING', 'CREATION', 'COMMUNITY', 'COMMENDATION'];
  var icons = { STEPS: '🚶', SPORTS: '🏃', GAME: '🎮', LEARNING: '📚', CREATION: '🎨', COMMUNITY: '💬', COMMENDATION: '🏅' };
  var names = { STEPS: '步數', SPORTS: '運動', GAME: '遊戲', LEARNING: '學習', CREATION: '創作', COMMUNITY: '社群', COMMENDATION: '嘉獎' };
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
    else if (tx.type === 'GAME') detail = (meta.game || meta.type || '');
    else if (tx.type === 'CREATION') detail = (meta.type || '');
    var time = tx.ts ? new Date(tx.ts).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '';
    var color = tx.amount > 0 ? 'var(--gold2)' : '#ef4444';
    html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">';
    html += '<span style="font-size:16px">' + icon + '</span>';
    html += '<div style="flex:1;font-size:12px"><b>' + name + '</b> <span style="color:var(--mut)">' + detail + '</span></div>';
    html += '<span style="font-size:12px;color:var(--mut)">' + time + '</span>';
    html += '<span style="font-size:13px;font-weight:700;color:' + color + '">' + (tx.amount > 0 ? '+' : '') + tx.amount + ' AP</span>';
    html += '</div>';
  }
  html += '</div>';
  return html;
};

function fpFetchLedger() {
  fetch('/rest/v1/ap/ledger', { headers: { 'x-adv9-token': WTOKEN }, cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.ok) { FP.ledger = d.ledger || []; FP._updateLedger(); FP._updateEarned(); }
    }).catch(function () { });
  fetch('/rest/v1/ap/balance', { headers: { 'x-adv9-token': WTOKEN }, cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.ok) { FP.balance = d.balance || 0; FP.caps = d.caps || {}; FP._updateBal(); FP._updateCap(); FP._updateEarned(); }
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
  if (el) el.innerHTML = FP._capDisplay('STEPS');
  var el2 = document.getElementById('fpSportRemain');
  if (el2) el2.textContent = FP._remainDisplay('SPORTS', 200) + ' AP';
};

FP._updateEarned = function () {
  var el = document.getElementById('fpEarned');
  if (el) el.textContent = FP._earnedToday('STEPS');
  var el2 = document.getElementById('fpSportEarned');
  if (el2) el2.textContent = FP._earnedToday('SPORTS') + ' AP';
};

function fpRefreshLedger() { fpFetchLedger(); }
window.fpRefreshLedger = fpRefreshLedger;

function fpSubmitSteps() {
  if (FP.loading) return;
  var btn = document.getElementById('fpStepsBtn');
  var inp = document.getElementById('fpSteps');
  var steps = parseInt(inp ? inp.value : '0', 10);
  if (!steps || steps <= 0) { toast('⚠️ 請輸入有效步數', 'bad'); return; }
  FP.loading = true;
  if (btn) { btn.textContent = '⏳ 提交中...'; btn.disabled = true; }
  fetch('/rest/v1/ap/steps', {
    method: 'POST',
    headers: { 'x-adv9-token': WTOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ steps: steps })
  }).then(function (r) { return r.json(); })
    .then(function (d) {
      FP.loading = false;
      if (btn) { btn.textContent = '🏃 提交步數'; btn.disabled = false; }
      if (d.ok) {
        toast('🚶 +' + d.ap + ' AP！（' + steps + ' 步）');
        FP.balance = d.balance || 0;
        FP.caps = d.caps || FP.caps;
        fetchApBalance();
        fpFetchLedger();
      } else {
        var msg = d.reason || '提交失敗';
        if (msg.indexOf('daily') >= 0) msg = '今日步數上限已達（100 AP/天），明天再來！';
        else if (msg.indexOf('weekly') >= 0) msg = '本週步數上限已達（700 AP/週）';
        else if (msg.indexOf('monthly') >= 0) msg = '本月步數上限已達（3000 AP/月）';
        toast('❌ ' + msg, 'bad');
      }
    }).catch(function () {
      FP.loading = false;
      if (btn) { btn.textContent = '🏃 提交步數'; btn.disabled = false; }
      toast('❌ 網路錯誤', 'bad');
    });
}
window.fpSubmitSteps = fpSubmitSteps;

function fpSportPreview(input) {
  var preview = document.getElementById('fpSportPreview');
  if (!preview) return;
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = '<img src="' + e.target.result + '" style="max-width:120px;max-height:80px;border-radius:6px;border:1px solid rgba(255,255,255,.1)">';
    };
    reader.readAsDataURL(input.files[0]);
  } else {
    preview.innerHTML = '';
  }
}
window.fpSportPreview = fpSportPreview;

function fpSubmitSport() {
  if (FP.loading) return;
  var btn = document.getElementById('fpSportBtn');
  var sel = document.getElementById('fpSport');
  var distEl = document.getElementById('fpDist');
  var proofInput = document.getElementById('fpSportProof');
  var sport = sel ? sel.value : 'running';
  var dist = parseFloat(distEl ? distEl.value : '0');
  if (!dist || dist <= 0) { toast('⚠️ 請輸入有效距離', 'bad'); return; }

  FP.loading = true;
  if (btn) { btn.textContent = '⏳ 提交中...'; btn.disabled = true; }

  var body = { distance_km: dist, sport: sport };

  function doSubmit(photoBase64) {
    if (photoBase64) body.photo_proof = photoBase64;
    fetch('/rest/v1/ap/sports', {
      method: 'POST',
      headers: { 'x-adv9-token': WTOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); })
      .then(function (d) {
        FP.loading = false;
        if (btn) { btn.textContent = '✅ 提交運動'; btn.disabled = false; }
        if (d.ok) {
          toast('🏃 +' + d.ap + ' AP！（' + sport + ' ' + dist + 'km）');
          FP.balance = d.balance || 0;
          FP.caps = d.caps || FP.caps;
          fetchApBalance();
          fpFetchLedger();
          var preview = document.getElementById('fpSportPreview');
          if (preview) preview.innerHTML = '';
          if (proofInput) proofInput.value = '';
        } else {
          var msg = d.reason || '提交失敗';
          if (msg.indexOf('daily') >= 0) msg = '今日運動上限已達（200 AP/天），明天再來！';
          toast('❌ ' + msg, 'bad');
        }
      }).catch(function () {
        FP.loading = false;
        if (btn) { btn.textContent = '✅ 提交運動'; btn.disabled = false; }
        toast('❌ 網路錯誤', 'bad');
      });
  }

  if (proofInput && proofInput.files && proofInput.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) { doSubmit(e.target.result); };
    reader.onerror = function () { doSubmit(null); };
    reader.readAsDataURL(proofInput.files[0]);
  } else {
    doSubmit(null);
  }
}
window.fpSubmitSport = fpSubmitSport;

function fpQuickGame(game) {
  var names = { quiz: '小測驗', puzzle: '數學練習', challenge: '程式挑戰' };
  toast('🎮 啟動' + (names[game] || game) + '…');
  setTimeout(function () { if (typeof tGo === 'function') tGo(game); else toast('功能載入中…', 'bad'); }, 500);
}
window.fpQuickGame = fpQuickGame;
window.vFreePoints = vFreePoints;