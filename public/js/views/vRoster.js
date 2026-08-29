/* vRoster — 名冊管理 */
function vRoster() {
  var u = me(); if (!u) return;
  var g = u.g;
  var h = back() + '<h3 class="vt">👥 名冊管理 <span class="vsub">班級成員・角色資料・在線狀態</span></h3>';

  var cls = g.classId ? get(LS.classes, []).find(function(c) { return c.id === g.classId; }) : null;
  var rosterUsers = [];
  if (cls) {
    cls.members.forEach(function(mid) {
      var m = get(LS.users, []).find(function(x) { return x.id === mid; });
      if (m) rosterUsers.push(m);
    });
  }

  var myClass = cls;
  h += '<div class="panel2" style="margin-top:12px">';
  if (myClass) {
    h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
    h += '<b style="color:var(--gold2);font-size:15px">🏫 ' + esc(myClass.name) + ' 名冊</b>';
    h += '<div style="display:flex;gap:6px">';
    h += '<div class="chip">👥 ' + rosterUsers.length + ' 人</div>';
    h += '<div class="chip">📊 平均 Lv.' + (rosterUsers.length ? Math.round(rosterUsers.reduce(function(a, m) { return a + ((m.g || {}).lv || 1); }, 0) / rosterUsers.length) : 0) + '</div>';
    h += '</div></div>';
    h += '<input id="rosterSearch" class="inp" placeholder="🔍 搜尋學號、姓名..." oninput="rosterFilter(this.value)" style="margin-top:10px">';
    h += '</div>';

    h += '<div id="rosterGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px;margin-top:12px">';
    h += rosterRenderList(rosterUsers);
    h += '</div>';
  } else {
    h += '<div class="empty">⚠️ 你尚未加入班級，無法查看名冊</div>';
    h += '<div class="mBtns"><button class="btn teal" onclick="vClasses()">🏫 加入班級</button></div>';
  }
  h += '</div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--teal);font-size:14px">📊 名冊統計</b>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:10px">';
  var totalMembers = rosterUsers.length;
  var onlineCount = rosterUsers.filter(function(m) { return Date.now() - ((m.g || {}).lastLogin || 0) < 300000; }).length;
  var avgLv = totalMembers ? Math.round(rosterUsers.reduce(function(a, m) { return a + ((m.g || {}).lv || 1); }, 0) / totalMembers) : 0;
  var maxLv = totalMembers ? Math.max.apply(null, rosterUsers.map(function(m) { return (m.g || {}).lv || 1; })) : 0;
  var avgExp = totalMembers ? Math.round(rosterUsers.reduce(function(a, m) { return a + ((m.g || {}).exp || 0); }, 0) / totalMembers) : 0;
  var totalGold = rosterUsers.reduce(function(a, m) { return a + ((m.g || {}).gold || 0); }, 0);
  var stats = [
    { icon: '👥', label: '總人數', val: totalMembers },
    { icon: '🟢', label: '在線', val: onlineCount },
    { icon: '⭐', label: '平均等級', val: 'Lv.' + avgLv },
    { icon: '👑', label: '最高等級', val: 'Lv.' + maxLv },
    { icon: '📊', label: '平均經驗', val: numFmt(avgExp) },
    { icon: '💰', label: '總金幣', val: numFmt(totalGold) }
  ];
  stats.forEach(function(s) {
    h += '<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px">';
    h += '<div style="font-size:20px">' + s.icon + '</div>';
    h += '<div style="font-size:16px;font-weight:900;color:var(--gold2);margin:4px 0">' + s.val + '</div>';
    h += '<div style="font-size:10px;color:var(--mut)">' + s.label + '</div>';
    h += '</div>';
  });
  h += '</div></div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--purple);font-size:14px">📋 名冊管理功能</b>';
  h += '<div class="rwRow" style="margin-top:10px">';
  h += '<button class="rwChip" onclick="rosterExportCSV()">📥 匯出 CSV</button>';
  h += '<button class="rwChip" onclick="rosterSortByLevel()">📊 依等級排序</button>';
  h += '<button class="rwChip" onclick="rosterSortByName()">🔤 依姓名排序</button>';
  h += '<button class="rwChip" onclick="rosterSortByExp()">📈 依經驗排序</button>';
  h += '<button class="rwChip" onclick="rosterShowOnline()">🟢 只看在線</button>';
  h += '</div></div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--gold2);font-size:14px">📖 名冊說明</b>';
  h += '<div class="skTxt" style="margin-top:6px">';
  h += '名冊顯示班級所有成員的基本資料與在線狀態。每位成員顯示等級、經驗值、金幣與最後登入時間。可透過搜尋框快速篩選成員，或使用排序功能依不同條件排列。匯出 CSV 功能可將名冊資料下載為表格檔案，方便老師管理。</div></div>';

  h += '<div id="rosterDetail"></div>';

  $('#view').innerHTML = h;
  window._rosterSortMode = 'default';
}

function rosterRenderList(users) {
  if (!users.length) return '<div class="empty" style="grid-column:1/-1">無成員資料</div>';
  var html = '';
  var medals = ['🥇', '🥈', '🥉'];
  var sorted = users.slice().sort(function(a, b) {
    return ((b.g || {}).lv || 1) - ((a.g || {}).lv || 1);
  });
  sorted.forEach(function(m, i) {
    var mg = m.g || {};
    var online = Date.now() - (mg.lastLogin || 0) < 300000;
    var role = '';
    if (m.role === 'teacher' || m.role === 'admin') role = ' <span class="chip" style="font-size:10px">👤 教師</span>';
    var medal = i < 3 ? medals[i] : '';
    html += '<div class="panel2" style="cursor:pointer;padding:12px" onclick="rosterDetail(\'' + m.id + '\')">';
    html += '<div style="display:flex;gap:10px;align-items:center">';
    html += '<div style="font-size:32px;flex-shrink:0">' + (m.prof && m.prof.avatar ? avatarHtml(m, 36) : '🧑‍🎓') + '</div>';
    html += '<div style="flex:1;min-width:0">';
    html += '<b style="font-family:var(--serif);color:var(--gold2);font-size:14px;display:block">' + medal + ' ' + esc(m.name || m.username) + role + '</b>';
    html += '<div class="skTxt">Lv.' + (mg.lv || 1) + ' 【' + titleOf(mg.lv || 1) + '】</div>';
    html += '<div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">';
    html += '<span class="chip" style="font-size:10px">💡 ' + numFmt(mg.exp || 0) + ' EXP</span>';
    html += '<span class="chip" style="font-size:10px">💰 ' + numFmt(mg.gold || 0) + '</span>';
    html += '</div></div>';
    html += '<div style="text-align:right;flex-shrink:0">';
    html += '<div style="font-size:11px;color:' + (online ? 'var(--green)' : 'var(--mut)') + '">';
    html += online ? '<span class="onDot on"></span> 在線' : '<span class="onDot off"></span> 離線';
    html += '</div>';
    if (mg.lastLogin) html += '<div style="font-size:9px;color:var(--mut);margin-top:2px">' + new Date(mg.lastLogin).toLocaleDateString() + '</div>';
    html += '</div></div></div>';
  });
  return html;
}

function rosterFilter(q) {
  var el = document.getElementById('rosterGrid');
  if (!el) return;
  var u = me();
  var cls = u.g.classId ? get(LS.classes, []).find(function(c) { return c.id === u.g.classId; }) : null;
  if (!cls) return;
  var users = [];
  cls.members.forEach(function(mid) {
    var m = get(LS.users, []).find(function(x) { return x.id === mid; });
    if (m) users.push(m);
  });
  q = q.trim().toLowerCase();
  if (q) {
    users = users.filter(function(m) {
      return (m.name || '').toLowerCase().includes(q) ||
             (m.username || '').toLowerCase().includes(q) ||
             (m.studentId || '').toLowerCase().includes(q);
    });
  }
  el.innerHTML = rosterRenderList(users);
}

function rosterDetail(id) {
  var m = get(LS.users, []).find(function(x) { return x.id === id; });
  if (!m) return toast('⚠️ 找不到成員', 'bad');
  var mg = m.g || {};
  var power = (mg.atk || 0) + (mg.def || 0) + (mg.hp || 0) + (mg.spd || 0) + (mg.crit || 0);
  var h = '<div class="panel2" style="margin-top:12px">';
  h += '<div style="text-align:center;margin-bottom:12px">';
  h += '<div style="font-size:48px">' + (m.prof && m.prof.avatar ? avatarHtml(m, 48) : '🧑‍🎓') + '</div>';
  h += '<b style="font-family:var(--serif);color:var(--gold2);font-size:18px;display:block;margin-top:8px">' + esc(m.name || m.username) + '</b>';
  h += '<div style="font-size:12px;color:var(--mut)">Lv.' + (mg.lv || 1) + ' 【' + titleOf(mg.lv || 1) + '】' + (mg.rebirth ? ' 🔁 轉生×' + mg.rebirth : '') + '</div>';
  h += '</div>';
  h += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">';
  h += '<div class="panel2" style="text-align:center"><div style="font-size:18px;font-weight:900;color:var(--gold2)">' + numFmt(mg.exp || 0) + '</div><div style="font-size:11px;color:var(--mut)">經驗值</div></div>';
  h += '<div class="panel2" style="text-align:center"><div style="font-size:18px;font-weight:900;color:#ffd700">' + numFmt(mg.gold || 0) + '</div><div style="font-size:11px;color:var(--mut)">金幣</div></div>';
  h += '<div class="panel2" style="text-align:center"><div style="font-size:18px;font-weight:900;color:#ff9800">' + numFmt(power) + '</div><div style="font-size:11px;color:var(--mut)">戰力</div></div>';
  h += '<div class="panel2" style="text-align:center"><div style="font-size:18px;font-weight:900;color:#e91e63">' + (mg.pkWin || 0) + '</div><div style="font-size:11px;color:var(--mut)">PK 勝場</div></div>';
  h += '</div>';
  h += '<div class="panel2" style="margin-top:8px"><b style="font-size:13px">📦 裝備</b>';
  h += '<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">';
  ['weapon', 'armor', 'accessory'].forEach(function(slot) {
    var it = mg.equip && mg.equip[slot];
    h += '<div class="chip">' + (it ? esc(it.name) : slot) + '</div>';
  });
  h += '</div></div>';
  h += '<div class="mBtns"><button class="btn" onclick="document.getElementById(\'rosterDetail\').innerHTML=\'\'">關閉</button></div>';
  h += '</div>';
  var el = document.getElementById('rosterDetail');
  if (el) el.innerHTML = h;
}

function rosterSortByLevel() {
  var el = document.getElementById('rosterGrid');
  if (!el) return;
  var u = me();
  var cls = u.g.classId ? get(LS.classes, []).find(function(c) { return c.id === u.g.classId; }) : null;
  if (!cls) return;
  var users = [];
  cls.members.forEach(function(mid) {
    var m = get(LS.users, []).find(function(x) { return x.id === mid; });
    if (m) users.push(m);
  });
  users.sort(function(a, b) { return ((b.g || {}).lv || 1) - ((a.g || {}).lv || 1); });
  el.innerHTML = rosterRenderList(users);
  toast('📊 依等級排序');
}

function rosterSortByName() {
  var el = document.getElementById('rosterGrid');
  if (!el) return;
  var u = me();
  var cls = u.g.classId ? get(LS.classes, []).find(function(c) { return c.id === u.g.classId; }) : null;
  if (!cls) return;
  var users = [];
  cls.members.forEach(function(mid) {
    var m = get(LS.users, []).find(function(x) { return x.id === mid; });
    if (m) users.push(m);
  });
  users.sort(function(a, b) { return (a.name || '').localeCompare(b.name || '', 'zh'); });
  el.innerHTML = rosterRenderList(users);
  toast('🔤 依姓名排序');
}

function rosterSortByExp() {
  var el = document.getElementById('rosterGrid');
  if (!el) return;
  var u = me();
  var cls = u.g.classId ? get(LS.classes, []).find(function(c) { return c.id === u.g.classId; }) : null;
  if (!cls) return;
  var users = [];
  cls.members.forEach(function(mid) {
    var m = get(LS.users, []).find(function(x) { return x.id === mid; });
    if (m) users.push(m);
  });
  users.sort(function(a, b) { return ((b.g || {}).exp || 0) - ((a.g || {}).exp || 0); });
  el.innerHTML = rosterRenderList(users);
  toast('📈 依經驗排序');
}

function rosterShowOnline() {
  var el = document.getElementById('rosterGrid');
  if (!el) return;
  var u = me();
  var cls = u.g.classId ? get(LS.classes, []).find(function(c) { return c.id === u.g.classId; }) : null;
  if (!cls) return;
  var users = [];
  cls.members.forEach(function(mid) {
    var m = get(LS.users, []).find(function(x) { return x.id === mid; });
    if (m) users.push(m);
  });
  var online = users.filter(function(m) { return Date.now() - ((m.g || {}).lastLogin || 0) < 300000; });
  el.innerHTML = rosterRenderList(online);
  toast('🟢 只顯示在線成員（' + online.length + ' 人）');
}

function rosterExportCSV() {
  var u = me();
  var cls = u.g.classId ? get(LS.classes, []).find(function(c) { return c.id === u.g.classId; }) : null;
  if (!cls) return toast('⚠️ 無法匯出', 'bad');
  var csv = '姓名,帳號,等級,經驗值,金幣,PK勝場,最後登入\n';
  cls.members.forEach(function(mid) {
    var m = get(LS.users, []).find(function(x) { return x.id === mid; });
    if (!m) return;
    var mg = m.g || {};
    csv += (m.name || '') + ',' + (m.username || '') + ',' + (mg.lv || 1) + ',' + (mg.exp || 0) + ',' + (mg.gold || 0) + ',' + (mg.pkWin || 0) + ',' + (mg.lastLogin ? new Date(mg.lastLogin).toLocaleDateString() : '從未登入') + '\n';
  });
  var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'roster_' + esc(cls.name) + '_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast('📥 名冊已匯出為 CSV');
}
window.vRoster = vRoster;
