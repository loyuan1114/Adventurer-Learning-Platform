/* vMiss — 缺課/請假管理 */
function vMiss() {
  var u = me(); if (!u) return;
  var h = back() + '<h3 class="vt">📋 缺課/請假管理 <span class="vsub">查看缺課紀錄與請假申請</span></h3>';

  /* 請假申請 */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--gold2);font-size:15px">📝 請假申請</b>';
  h += '<div style="margin-top:10px">';
  h += '<div><label style="font-size:11px;color:var(--mut)">請假日期</label>';
  h += '<input id="missDate" class="inp" type="date" style="margin-top:4px"></div>';
  h += '<div style="margin-top:8px"><label style="font-size:11px;color:var(--mut)">請假類型</label>';
  h += '<select id="missType" class="inp" style="margin-top:4px;width:140px">';
  h += '<option value="sick">🤒 病假</option><option value="personal">🏠 事假</option>';
  h += '<option value="official">📋 公假</option><option value="other">📌 其他</option>';
  h += '</select></div>';
  h += '<div style="margin-top:8px"><label style="font-size:11px;color:var(--mut)">原因說明</label>';
  h += '<textarea id="missReason" class="inp" rows="3" style="margin-top:4px;width:100%;resize:vertical" placeholder="請輸入請假原因…"></textarea></div>';
  h += '<button class="btn gold" onclick="vMissSubmit()" style="margin-top:10px">📤 提交申請</button>';
  h += '</div></div>';

  /* 缺課紀錄 */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center">';
  h += '<b style="color:var(--orange);font-size:15px">📊 缺課紀錄</b>';
  h += '<button class="btn ghost mini" onclick="vMissRefresh()">🔄 刷新</button></div>';
  h += '<div id="missList" style="margin-top:10px">';
  h += '<div style="color:var(--mut);font-size:12px;padding:8px 0">載入中…</div>';
  h += '</div></div>';

  /* 統計 */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--teal);font-size:15px">📈 本學期統計</b>';
  h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px">';
  h += '<div class="panel2" style="text-align:center;padding:10px"><div style="font-size:11px;color:var(--mut)">病假</div><div id="missSick" style="font-size:22px;font-weight:900;color:var(--teal);margin-top:4px">0</div></div>';
  h += '<div class="panel2" style="text-align:center;padding:10px"><div style="font-size:11px;color:var(--mut)">事假</div><div id="missPersonal" style="font-size:22px;font-weight:900;color:var(--orange);margin-top:4px">0</div></div>';
  h += '<div class="panel2" style="text-align:center;padding:10px"><div style="font-size:11px;color:var(--mut)">公假</div><div id="missOfficial" style="font-size:22px;font-weight:900;color:var(--blue);margin-top:4px">0</div></div>';
  h += '</div></div>';

  $('#view').innerHTML = h;
  vMissRefresh();
}
window.vMiss = vMiss;

function vMissSubmit() {
  var dateEl = document.getElementById('missDate');
  var typeEl = document.getElementById('missType');
  var reasonEl = document.getElementById('missReason');
  var date = dateEl ? dateEl.value : '';
  var type = typeEl ? typeEl.value : 'sick';
  var reason = reasonEl ? reasonEl.value.trim() : '';
  if (!date) { toast('⚠️ 請選擇日期', 'bad'); return; }
  if (!reason) { toast('⚠️ 請輸入原因', 'bad'); return; }
  var records = get('miss_records') || [];
  records.push({ date: date, type: type, reason: reason, status: 'pending', ts: Date.now() });
  set('miss_records', records);
  toast('✅ 請假申請已提交');
  if (dateEl) dateEl.value = '';
  if (reasonEl) reasonEl.value = '';
  vMissRefresh();
}
window.vMissSubmit = vMissSubmit;

function vMissRefresh() {
  var records = get('miss_records') || [];
  var el = document.getElementById('missList');
  var sick = 0, personal = 0, official = 0;
  records.forEach(function (r) {
    if (r.type === 'sick') sick++;
    else if (r.type === 'personal') personal++;
    else if (r.type === 'official') official++;
  });
  var se = document.getElementById('missSick'); if (se) se.textContent = sick;
  var pe = document.getElementById('missPersonal'); if (pe) pe.textContent = personal;
  var oe = document.getElementById('missOfficial'); if (oe) oe.textContent = official;
  if (!el) return;
  if (!records.length) { el.innerHTML = '<div style="color:var(--mut);font-size:12px;padding:8px 0">尚無缺課紀錄</div>'; return; }
  var icons = { sick: '🤒', personal: '🏠', official: '📋', other: '📌' };
  var names = { sick: '病假', personal: '事假', official: '公假', other: '其他' };
  var statusColors = { pending: 'var(--orange)', approved: 'var(--teal)', rejected: '#ef4444' };
  var statusNames = { pending: '待審核', approved: '已通過', rejected: '已駁回' };
  var html = '';
  for (var i = records.length - 1; i >= 0 && i >= records.length - 20; i--) {
    var r = records[i];
    html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06)">';
    html += '<span style="font-size:16px">' + (icons[r.type] || '📌') + '</span>';
    html += '<div style="flex:1;font-size:12px"><b>' + r.date + '</b> <span style="color:var(--mut)">' + (names[r.type] || r.type) + '</span>';
    html += '<div style="color:var(--mut);font-size:11px;margin-top:2px">' + (r.reason || '') + '</div></div>';
    html += '<span style="font-size:11px;color:' + (statusColors[r.status] || 'var(--mut)') + '">' + (statusNames[r.status] || r.status) + '</span>';
    html += '</div>';
  }
  el.innerHTML = html;
}
window.vMissRefresh = vMissRefresh;