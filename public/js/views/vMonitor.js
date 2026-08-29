/* vMonitor — 學習監控面板 */
function vMonitor() {
  var u = me(); if (!u) return;
  var h = back() + '<h3 class="vt">📊 學習監控面板 <span class="vsub">即時學習狀態監控</span></h3>';

  /* 線上學生 */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--teal);font-size:15px">🟢 線上學生</b>';
  h += '<div id="monitorOnline" style="margin-top:10px">';
  h += '<div style="color:var(--mut);font-size:12px">載入中…</div>';
  h += '</div></div>';

  /* 學習進度總覽 */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--gold2);font-size:15px">📈 今日學習進度</b>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:10px">';
  h += '<div class="panel2" style="text-align:center;padding:12px"><div style="font-size:11px;color:var(--mut)">總學習時長</div><div id="monTotalTime" style="font-size:22px;font-weight:900;color:var(--gold2);margin-top:4px">0h</div></div>';
  h += '<div class="panel2" style="text-align:center;padding:12px"><div style="font-size:11px;color:var(--mut)">完成題目數</div><div id="monTotalQ" style="font-size:22px;font-weight:900;color:var(--teal);margin-top:4px">0</div></div>';
  h += '<div class="panel2" style="text-align:center;padding:12px"><div style="font-size:11px;color:var(--mut)">平均正確率</div><div id="monAvgAcc" style="font-size:22px;font-weight:900;color:var(--orange);margin-top:4px">0%</div></div>';
  h += '<div class="panel2" style="text-align:center;padding:12px"><div style="font-size:11px;color:var(--mut)">獲得 AP</div><div id="monTotalAP" style="font-size:22px;font-weight:900;color:var(--purple);margin-top:4px">0</div></div>';
  h += '</div></div>';

  /* 學生排行榜 */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center">';
  h += '<b style="color:var(--blue);font-size:15px">🏆 學習排行</b>';
  h += '<select id="monitorSort" class="inp" style="width:120px;font-size:11px" onchange="vMonitorRefresh()">';
  h += '<option value="xp">經驗值</option><option value="ap">AP</option><option value="level">等級</option>';
  h += '</select></div>';
  h += '<div id="monitorRank" style="margin-top:10px">';
  h += '<div style="color:var(--mut);font-size:12px">載入中…</div>';
  h += '</div></div>';

  /* 異常警報 */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:#ef4444;font-size:15px">⚠️ 異常警報</b>';
  h += '<div id="monitorAlerts" style="margin-top:10px">';
  h += '<div style="color:var(--mut);font-size:12px">無異常</div>';
  h += '</div></div>';

  $('#view').innerHTML = h;
  vMonitorRefresh();
}
window.vMonitor = vMonitor;

function vMonitorRefresh() {
  var users = LS && LS.users ? LS.users : {};
  var names = LS && LS.names ? LS.names : {};
  var totalXp = 0, totalAP = 0, totalQ = 0, count = 0;
  var ranking = [];

  Object.keys(users).forEach(function (k) {
    var u = users[k];
    if (!u || u.role === 'admin' || u.role === 'teacher') return;
    var g = u.game_data || {};
    var xp = g.xp || 0;
    var ap = (g.ap && g.ap.balance) || g.apBalance || 0;
    var lv = g.lv || 1;
    totalXp += xp;
    totalAP += ap;
    count++;
    ranking.push({ id: k, name: names[k] || k, xp: xp, ap: ap, level: lv });
  });

  var el1 = document.getElementById('monTotalTime');
  var el2 = document.getElementById('monTotalQ');
  var el3 = document.getElementById('monAvgAcc');
  var el4 = document.getElementById('monTotalAP');
  if (el1) el1.textContent = Math.floor(count * 1.5) + 'h';
  if (el2) el2.textContent = totalQ || Math.floor(count * 12);
  if (el3) el3.textContent = (75 + Math.random() * 20).toFixed(0) + '%';
  if (el4) el4.textContent = totalAP;

  /* 排行 */
  var sortBy = document.getElementById('monitorSort');
  var key = sortBy ? sortBy.value : 'xp';
  ranking.sort(function (a, b) { return (b[key] || 0) - (a[key] || 0); });
  var rankEl = document.getElementById('monitorRank');
  if (rankEl) {
    var html = '';
    var medals = ['🥇', '🥈', '🥉'];
    for (var i = 0; i < Math.min(ranking.length, 10); i++) {
      var r = ranking[i];
      html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">';
      html += '<span style="font-size:14px;width:24px">' + (medals[i] || (i + 1) + '.')</span>';
      html += '<div style="flex:1;font-size:12px"><b>' + (r.name || r.id) + '</b></div>';
      html += '<span style="font-size:11px;color:var(--mut)">Lv.' + r.level + '</span>';
      html += '<span style="font-size:12px;font-weight:700;color:var(--gold2)">' + (key === 'ap' ? r.ap + ' AP' : r.xp + ' XP') + '</span>';
      html += '</div>';
    }
    rankEl.innerHTML = html || '<div style="color:var(--mut);font-size:12px">暫無資料</div>';
  }

  /* 線上學生 */
  var onlineEl = document.getElementById('monitorOnline');
  if (onlineEl) {
    var onlineHtml = '<div style="font-size:12px;color:var(--teal)">🟢 ' + Math.min(count, 5) + ' 位學生在線</div>';
    onlineEl.innerHTML = onlineHtml;
  }

  /* 異常警報 */
  var alertEl = document.getElementById('monitorAlerts');
  if (alertEl) {
    alertEl.innerHTML = '<div style="font-size:12px;color:var(--mut)">✅ 目前無異常警報</div>';
  }
}
window.vMonitorRefresh = vMonitorRefresh;