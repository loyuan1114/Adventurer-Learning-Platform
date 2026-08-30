/* vCreate — 創作贊助 Dashboard */
function safeJson(r){
  if(!r.ok){
    if(r.status===401||r.status===403){
      return Promise.resolve({ok:false,reason:'auth_error',status:r.status});
    }
    return r.text().then(function(t){throw new Error(t||('HTTP '+r.status))});
  }
  return r.json();
}
let CR = { balance: 0, ledger: [], loading: false };

function vCreate() {
  var u = me(); if (!u) return;
  CR.balance = u.g.apBalance || 0;
  let h = back() + '<h3 class="vt">🎨 創作贊助 Dashboard <span class="vsub">提交創作・贊助創作者・AP 流動</span></h3>';

  /* ── AP 餘額 ── */
  h += '<div class="panel2" style="margin-top:12px;text-align:center;padding:18px">';
  h += '<div style="font-size:11px;color:var(--mut)">目前 AP 餘額</div>';
  h += '<div id="crBal" style="font-size:36px;font-weight:900;color:var(--gold2);margin-top:4px">' + CR.balance + '</div>';
  h += '<div style="font-size:11px;color:var(--mut);margin-top:4px">提交創作或贊助他人以累積經驗</div>';
  h += '</div>';

  /* ── 提交創作 ── */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--teal);font-size:15px">📝 提交創作</b>';
  h += '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">';
  h += '<div><label style="font-size:11px;color:var(--mut)">創作標題</label>';
  h += '<input id="crTitle" class="inp" placeholder="例如：Python 繪圖教學" style="margin-top:4px"></div>';
  h += '<div><label style="font-size:11px;color:var(--mut)">創作類型</label>';
  h += '<select id="crType" class="inp" style="margin-top:4px">';
  h += '<option value="code">💻 程式碼</option>';
  h += '<option value="art">🎨 繪圖</option>';
  h += '<option value="writing">✍️ 寫作</option>';
  h += '</select></div>';
  h += '<button class="btn teal" onclick="crSubmitCreation()" style="align-self:flex-start">🚀 提交創作</button>';
  h += '</div></div>';

  /* ── 贊助創作者 ── */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--purple);font-size:15px">💝 贊助創作者</b>';
  h += '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">';
  h += '<div><label style="font-size:11px;color:var(--mut)">目標用戶名</label>';
  h += '<input id="crTarget" class="inp" placeholder="輸入對方用戶名" style="margin-top:4px"></div>';
  h += '<div style="display:flex;gap:8px">';
  h += '<div style="flex:1"><label style="font-size:11px;color:var(--mut)">贊助 AP 數量</label>';
  h += '<input id="crAmount" class="inp" type="number" min="1" value="50" style="margin-top:4px"></div>';
  h += '</div>';
  h += '<div><label style="font-size:11px;color:var(--mut)">留言（選填）</label>';
  h += '<input id="crMsg" class="inp" placeholder="鼓勵的話..." style="margin-top:4px"></div>';
  h += '<button class="btn gold" onclick="crSubmitSponsor()" style="align-self:flex-start">💝 送出贊助</button>';
  h += '</div></div>';

  /* ── 最近創作/贊助紀錄 ── */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center">';
  h += '<b style="color:var(--gold2);font-size:15px">📋 最近創作/贊助紀錄</b>';
  h += '<button class="btn ghost mini" onclick="crRefreshLedger()">🔄 刷新</button></div>';
  h += '<div id="crLedger" style="margin-top:10px">';
  h += CR._renderLedger();
  h += '</div></div>';

  $('#view').innerHTML = h;
  crFetchLedger();
}

CR._renderLedger = function () {
  var led = CR.ledger || [];
  var types = ['CREATION', 'SPONSOR'];
  var icons = { CREATION: '📝', SPONSOR: '💝' };
  var names = { CREATION: '提交創作', SPONSOR: '贊助' };
  var filtered = [];
  for (var i = 0; i < led.length; i++) {
    if (types.indexOf(led[i].type) >= 0) filtered.push(led[i]);
  }
  if (!filtered.length) return '<div style="color:var(--mut);font-size:12px;padding:8px 0">尚無創作/贊助紀錄</div>';
  var html = '<div style="max-height:260px;overflow-y:auto">';
  for (var j = 0; j < filtered.length && j < 30; j++) {
    var tx = filtered[j];
    var icon = icons[tx.type] || '⭐';
    var name = names[tx.type] || tx.type;
    var meta = tx.meta || {};
    var detail = '';
    if (tx.type === 'CREATION') detail = (meta.title || '無標題') + '（' + (meta.creation_type || '') + '）';
    else if (tx.type === 'SPONSOR') detail = '→ ' + (meta.target_user || '') + (meta.message ? '：' + meta.message : '');
    var time = tx.ts ? new Date(tx.ts).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '';
    var color = tx.amount > 0 ? 'var(--gold2)' : 'var(--teal)';
    var sign = tx.amount > 0 ? '+' : '';
    html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">';
    html += '<span style="font-size:16px">' + icon + '</span>';
    html += '<div style="flex:1;font-size:12px"><b>' + name + '</b> <span style="color:var(--mut)">' + detail + '</span></div>';
    html += '<span style="font-size:12px;color:var(--mut)">' + time + '</span>';
    html += '<span style="font-size:13px;font-weight:700;color:' + color + '">' + sign + tx.amount + ' AP</span>';
    html += '</div>';
  }
  html += '</div>';
  return html;
};

function crFetchLedger() {
  fetch('/rest/v1/ap/ledger', { headers: { 'x-adv9-token': WTOKEN } })
    .then(safeJson)
    .then(function (d) {
      if (d.ok) { CR.ledger = d.ledger || []; CR._updateLedger(); }
    }).catch(function () { });
  fetch('/rest/v1/ap/balance', { headers: { 'x-adv9-token': WTOKEN } })
    .then(safeJson)
    .then(function (d) {
      if (d.ok) { CR.balance = d.balance || 0; CR._updateBal(); }
    }).catch(function () { });
}

CR._updateLedger = function () {
  var el = document.getElementById('crLedger');
  if (el) el.innerHTML = CR._renderLedger();
};

CR._updateBal = function () {
  var el = document.getElementById('crBal');
  if (el) el.textContent = CR.balance;
};

function crRefreshLedger() { crFetchLedger(); }

function crSubmitCreation() {
  var titleEl = document.getElementById('crTitle');
  var typeEl = document.getElementById('crType');
  var title = (titleEl ? titleEl.value : '').trim();
  var type = typeEl ? typeEl.value : 'code';
  if (!title) { toast('⚠️ 請輸入創作標題', 'bad'); return; }
  fetch('/rest/v1/ap/creation', {
    method: 'POST',
    headers: { 'x-adv9-token': WTOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title, creation_type: type })
  }).then(safeJson)
    .then(function (d) {
      if (d.ok) {
        toast('📝 創作已提交！+' + d.ap + ' AP');
        CR.balance = d.balance || 0;
        fetchApBalance();
        crFetchLedger();
        if (titleEl) titleEl.value = '';
      } else { toast('❌ ' + (d.reason || '提交失敗'), 'bad'); }
    }).catch(function () { toast('❌ 網路錯誤', 'bad'); });
}

function crSubmitSponsor() {
  var targetEl = document.getElementById('crTarget');
  var amountEl = document.getElementById('crAmount');
  var msgEl = document.getElementById('crMsg');
  var target = (targetEl ? targetEl.value : '').trim();
  var amount = parseInt(amountEl ? amountEl.value : '0', 10);
  var message = (msgEl ? msgEl.value : '').trim();
  if (!target) { toast('⚠️ 請輸入目標用戶名', 'bad'); return; }
  if (!amount || amount <= 0) { toast('⚠️ 請輸入有效 AP 數量', 'bad'); return; }
  fetch('/rest/v1/ap/creation', {
    method: 'POST',
    headers: { 'x-adv9-token': WTOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'sponsor', target_user: target, amount: amount, message: message })
  }).then(safeJson)
    .then(function (d) {
      if (d.ok) {
        toast('💝 已贊助 ' + target + ' ' + amount + ' AP！');
        CR.balance = d.balance || 0;
        fetchApBalance();
        crFetchLedger();
        if (targetEl) targetEl.value = '';
        if (amountEl) amountEl.value = '50';
        if (msgEl) msgEl.value = '';
      } else { toast('❌ ' + (d.reason || '贊助失敗'), 'bad'); }
    }).catch(function () { toast('❌ 網路錯誤', 'bad'); });
}
