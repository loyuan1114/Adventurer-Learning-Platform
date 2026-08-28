/* vLearn — 學習獎勵 Dashboard */
let LV = { balance: 0, caps: {}, ledger: [], loading: false };

function vLearn() {
  var u = me(); if (!u) return;
  LV.balance = u.g.apBalance || 0;
  let h = back() + '<h3 class="vt">📚 學習獎勵 Dashboard <span class="vsub">科目學習・時長記錄・難度調整</span></h3>';

  /* ── 今日學習統計 ── */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--gold2);font-size:15px">📊 今日學習統計</b>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:10px">';
  h += '<div class="panel2" style="text-align:center;padding:14px"><div style="font-size:11px;color:var(--mut)">今日已賺 AP</div><div id="lvEarned" style="font-size:28px;font-weight:900;color:var(--gold2);margin-top:4px">' + LV._earnedToday() + '</div></div>';
  h += '<div class="panel2" style="text-align:center;padding:14px"><div style="font-size:11px;color:var(--mut)">AP 餘額</div><div id="lvBal" style="font-size:28px;font-weight:900;color:var(--teal);margin-top:4px">' + LV.balance + '</div></div>';
  h += '<div class="panel2" style="text-align:center;padding:14px"><div style="font-size:11px;color:var(--mut)">學習每日上限</div><div id="lvCap" style="font-size:28px;font-weight:900;color:var(--orange);margin-top:4px">' + LV._capDisplay() + '</div></div>';
  h += '</div></div>';

  /* ── 學習提交 ── */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--teal);font-size:15px">📝 記錄學習</b>';
  h += '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">';

  /* 科目選擇 */
  h += '<div><label style="font-size:11px;color:var(--mut)">選擇科目</label>';
  h += '<div id="lvSubjects" style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">';
  var subjects = [
    { id: 'math', n: '數學', em: '🧮', c: '#e91e63' },
    { id: 'english', n: '英文', em: '🔤', c: '#2196f3' },
    { id: 'science', n: '自然', em: '🔬', c: '#4caf50' },
    { id: 'social', n: '社會', em: '🌏', c: '#9c27b0' },
    { id: 'programming', n: '程式', em: '💻', c: '#ff9800' }
  ];
  for (var i = 0; i < subjects.length; i++) {
    var s = subjects[i];
    h += '<button class="rwChip lvSubjBtn" data-subj="' + s.id + '" onclick="lvPickSubject(\'' + s.id + '\')" style="border:2px solid transparent">';
    h += s.em + ' ' + s.n + '</button>';
  }
  h += '</div></div>';

  /* 時長 */
  h += '<div style="display:flex;gap:8px">';
  h += '<div style="flex:1"><label style="font-size:11px;color:var(--mut)">學習時長（分鐘）</label>';
  h += '<input id="lvDuration" class="inp" type="number" min="1" max="480" value="30" style="margin-top:4px"></div>';
  h += '</div>';

  /* 難度 */
  h += '<div><label style="font-size:11px;color:var(--mut)">難度</label>';
  h += '<div style="display:flex;gap:6px;margin-top:6px">';
  h += '<button class="rwChip lvDiffBtn" data-diff="0" onclick="lvPickDiff(0)" style="border:2px solid var(--teal)">🌱 簡單</button>';
  h += '<button class="rwChip lvDiffBtn" data-diff="1" onclick="lvPickDiff(1)" style="border:2px solid transparent">⚔️ 普通</button>';
  h += '<button class="rwChip lvDiffBtn" data-diff="2" onclick="lvPickDiff(2)" style="border:2px solid transparent">🔥 困難</button>';
  h += '</div></div>';

  h += '<button class="btn gold" onclick="lvSubmitLearning()" style="align-self:flex-start;margin-top:4px">📚 提交學習紀錄</button>';
  h += '</div></div>';

  /* ── 最近學習紀錄 ── */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center">';
  h += '<b style="color:var(--gold2);font-size:15px">📋 最近學習紀錄</b>';
  h += '<button class="btn ghost mini" onclick="lvRefreshLedger()">🔄 刷新</button></div>';
  h += '<div id="lvLedger" style="margin-top:10px">';
  h += LV._renderLedger();
  h += '</div></div>';

  $('#view').innerHTML = h;
  LV._subj = LV._subj || 'math';
  LV._diff = LV._diff || 0;
  lvHighlightSubj();
  lvHighlightDiff();
  lvFetchLedger();
}

LV._earnedToday = function () {
  var led = LV.ledger || [];
  var today = new Date().toISOString().slice(0, 10);
  var sum = 0;
  for (var i = 0; i < led.length; i++) {
    var tx = led[i];
    if ((tx.ts || '').indexOf(today) === 0 && tx.amount > 0) sum += tx.amount;
  }
  return sum;
};

LV._capDisplay = function () {
  var caps = LV.caps || {};
  var s = caps.LEARNING || {};
  return (s.daily || 0) + ' / ' + (s.last_daily || 100);
};

LV._renderLedger = function () {
  var led = LV.ledger || [];
  var filtered = [];
  for (var i = 0; i < led.length; i++) {
    if (led[i].type === 'LEARNING') filtered.push(led[i]);
  }
  if (!filtered.length) return '<div style="color:var(--mut);font-size:12px;padding:8px 0">尚無學習紀錄</div>';
  var subjectNames = { math: '🧮 數學', english: '🔤 英文', science: '🔬 自然', social: '🌏 社會', programming: '💻 程式' };
  var diffNames = { 0: '🌱 簡單', 1: '⚔️ 普通', 2: '🔥 困難' };
  var html = '<div style="max-height:260px;overflow-y:auto">';
  for (var j = 0; j < filtered.length && j < 30; j++) {
    var tx = filtered[j];
    var meta = tx.meta || {};
    var subj = subjectNames[meta.subject] || meta.subject || '';
    var diff = diffNames[meta.difficulty] || '普通';
    var dur = meta.duration_min || 0;
    var time = tx.ts ? new Date(tx.ts).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '';
    html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">';
    html += '<span style="font-size:16px">📚</span>';
    html += '<div style="flex:1;font-size:12px"><b>' + subj + '</b> <span style="color:var(--mut)">' + dur + ' 分鐘・' + diff + '</span></div>';
    html += '<span style="font-size:12px;color:var(--mut)">' + time + '</span>';
    html += '<span style="font-size:13px;font-weight:700;color:var(--gold2)">+' + tx.amount + ' AP</span>';
    html += '</div>';
  }
  html += '</div>';
  return html;
};

function lvPickSubject(id) {
  LV._subj = id;
  lvHighlightSubj();
}

function lvHighlightSubj() {
  var btns = document.querySelectorAll('.lvSubjBtn');
  for (var i = 0; i < btns.length; i++) {
    var b = btns[i];
    if (b.getAttribute('data-subj') === LV._subj) b.style.borderColor = 'var(--teal)';
    else b.style.borderColor = 'transparent';
  }
}

function lvPickDiff(d) {
  LV._diff = d;
  lvHighlightDiff();
}

function lvHighlightDiff() {
  var btns = document.querySelectorAll('.lvDiffBtn');
  for (var i = 0; i < btns.length; i++) {
    var b = btns[i];
    if (parseInt(b.getAttribute('data-diff'), 10) === LV._diff) b.style.borderColor = 'var(--teal)';
    else b.style.borderColor = 'transparent';
  }
}

function lvFetchLedger() {
  fetch('/rest/v1/ap/ledger', { headers: { 'x-adv9-token': WTOKEN } })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.ok) { LV.ledger = d.ledger || []; LV._updateLedger(); LV._updateEarned(); }
    }).catch(function () { });
  fetch('/rest/v1/ap/balance', { headers: { 'x-adv9-token': WTOKEN } })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.ok) { LV.balance = d.balance || 0; LV.caps = d.caps || {}; LV._updateBal(); LV._updateCap(); }
    }).catch(function () { });
}

LV._updateLedger = function () {
  var el = document.getElementById('lvLedger');
  if (el) el.innerHTML = LV._renderLedger();
};

LV._updateBal = function () {
  var el = document.getElementById('lvBal');
  if (el) el.textContent = LV.balance;
};

LV._updateCap = function () {
  var el = document.getElementById('lvCap');
  if (el) el.textContent = LV._capDisplay();
};

LV._updateEarned = function () {
  var el = document.getElementById('lvEarned');
  if (el) el.textContent = LV._earnedToday();
};

function lvRefreshLedger() { lvFetchLedger(); }

function lvSubmitLearning() {
  var durEl = document.getElementById('lvDuration');
  var duration = parseInt(durEl ? durEl.value : '0', 10);
  if (!duration || duration <= 0) { toast('⚠️ 請輸入有效學習時長', 'bad'); return; }
  var subject = LV._subj || 'math';
  var difficulty = LV._diff || 0;
  fetch('/rest/v1/ap/learning', {
    method: 'POST',
    headers: { 'x-adv9-token': WTOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject: subject, duration_min: duration, difficulty: difficulty })
  }).then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.ok) {
        toast('📚 +' + d.ap + ' AP！（' + subject + ' ' + duration + ' 分鐘）');
        LV.balance = d.balance || 0;
        fetchApBalance();
        lvFetchLedger();
      } else { toast('❌ ' + (d.reason || '提交失敗'), 'bad'); }
    }).catch(function () { toast('❌ 網路錯誤', 'bad'); });
}
