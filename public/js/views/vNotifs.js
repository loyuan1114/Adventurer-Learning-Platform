/* vNotifs — 通知中心 */
function vNotifs() {
  var u = me(); if (!u) return;
  var g = u.g;
  var allNotifs = g.notifications || [];
  var unread = allNotifs.filter(function(n) { return !n.read; }).length;

  var h = back() + '<h3 class="vt">🔔 通知中心 <span class="vsub">系統通知・活動提醒・個人訊息</span></h3>';

  h += '<div class="panel2" style="margin-top:12px">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  h += '<b style="color:var(--gold2);font-size:15px">📬 通知列表</b>';
  h += '<div style="display:flex;gap:6px">';
  h += '<div class="chip">' + (unread > 0 ? '🆕 ' + unread + ' 則未讀' : '✅ 全部已讀') + '</div>';
  h += '<div class="chip">共 ' + allNotifs.length + ' 則</div>';
  h += '</div></div></div>';

  h += '<div class="tabRow">';
  ['all', 'unread', 'system', 'game', 'social'].forEach(function(t, i) {
    var labels = {
      all: '📬 全部',
      unread: '🆕 未讀' + (unread ? ' (' + unread + ')' : ''),
      system: '⚙️ 系統',
      game: '🎮 遊戲',
      social: '👥 社交'
    };
    h += '<button class="tabB ' + (i === 0 ? 'on' : '') + '" onclick="notifTab(\'' + t + '\')">' + labels[t] + '</button>';
  });
  h += '</div>';

  h += '<div id="notifArea"></div>';
  $('#view').innerHTML = h;
  notifTab('all');
}

function notifTab(t) {
  window._notifTab = t;
  document.querySelectorAll('.tabB').forEach(function(b) {
    b.classList.toggle('on', b.onclick && b.onclick.toString().indexOf(t) >= 0);
  });
  var u = me();
  var allNotifs = (u.g.notifications || []).slice().reverse();
  var filtered = allNotifs;
  if (t === 'unread') filtered = allNotifs.filter(function(n) { return !n.read; });
  else if (t === 'system') filtered = allNotifs.filter(function(n) { return n.type === 'system'; });
  else if (t === 'game') filtered = allNotifs.filter(function(n) { return n.type === 'game'; });
  else if (t === 'social') filtered = allNotifs.filter(function(n) { return n.type === 'social'; });

  var area = document.getElementById('notifArea');
  if (!area) return;

  var icons = { system: '⚙️', game: '🎮', social: '👥', reward: '🎁', level: '⭐', pk: '⚔️', guild: '🏰', exam: '📝' };
  var html = '<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">';

  if (!filtered.length) {
    html += '<div class="panel2 empty">無通知</div>';
  } else {
    filtered.forEach(function(n) {
      html += '<div class="panel2 ' + (!n.read ? 'impcard' : '') + '" style="position:relative;cursor:pointer;padding:12px" onclick="notifOpen(\'' + (n.id || '') + '\')">';
      if (!n.read) html += '<div class="stockTag" style="background:var(--teal);top:8px;right:8px">🆕</div>';
      html += '<div style="display:flex;gap:10px;align-items:flex-start">';
      html += '<div style="font-size:24px;flex-shrink:0">' + (icons[n.type] || '📌') + '</div>';
      html += '<div style="flex:1;min-width:0">';
      html += '<b style="font-size:13px;color:' + (!n.read ? 'var(--gold2)' : 'var(--txt)') + '">' + esc(n.title || '通知') + '</b>';
      html += '<div class="skTxt" style="margin-top:2px">' + esc((n.content || '').slice(0, 80)) + ((n.content || '').length > 80 ? '...' : '') + '</div>';
      html += '<div style="font-size:10px;color:var(--mut);margin-top:4px">' + new Date(n.ts || Date.now()).toLocaleString() + '</div>';
      html += '</div>';
      if (!n.read) html += '<div style="width:8px;height:8px;border-radius:50%;background:var(--teal);flex-shrink:0;margin-top:4px"></div>';
      html += '</div></div>';
    });
  }
  html += '</div>';

  if (allNotifs.some(function(n) { return !n.read; })) {
    html += '<div class="mBtns" style="margin-top:12px;justify-content:center">';
    html += '<button class="btn teal" onclick="notifReadAll()">✅ 全部標記已讀</button>';
    html += '<button class="btn ghost" onclick="notifClearAll()">🗑️ 清除全部</button>';
    html += '</div>';
  }

  html += '<div class="panel2" style="margin-top:14px"><b style="color:var(--teal);font-size:14px">⚙️ 通知設定</b>';
  html += '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">';
  var settings = [
    { key: 'sysNotif', label: '系統通知', desc: '系統更新、維護公告等', default: true },
    { key: 'gameNotif', label: '遊戲通知', desc: 'PK結果、副本獎勵等', default: true },
    { key: 'socialNotif', label: '社交通知', desc: '好友申請、公會訊息等', default: true },
    { key: 'examNotif', label: '考試提醒', desc: '會考倒數、模擬考通知', default: true },
    { key: 'rewardNotif', label: '獎勵通知', desc: 'AP發放、金幣獎勵等', default: true },
    { key: 'levelNotif', label: '升級通知', desc: '等級提升、稱號解鎖等', default: true }
  ];
  settings.forEach(function(s) {
    var enabled = g.notifSettings ? g.notifSettings[s.key] !== false : s.default;
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:rgba(0,0,0,.1);border-radius:6px">';
    html += '<div><b style="font-size:12px">' + s.label + '</b><div class="skTxt">' + s.desc + '</div></div>';
    html += '<button class="btn mini ' + (enabled ? 'teal' : 'ghost') + '" onclick="notifToggleSetting(\'' + s.key + '\')">' + (enabled ? '✅ 開啟' : '❌ 關閉') + '</button>';
    html += '</div>';
  });
  html += '</div></div>';

  html += '<div class="panel2" style="margin-top:12px"><b style="color:var(--gold2);font-size:14px">📊 通知統計</b>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:10px">';
  var stats = [
    { icon: '📬', label: '總通知', val: allNotifs.length },
    { icon: '🆕', label: '未讀', val: unread },
    { icon: '⚙️', label: '系統', val: allNotifs.filter(function(n) { return n.type === 'system'; }).length },
    { icon: '🎮', label: '遊戲', val: allNotifs.filter(function(n) { return n.type === 'game'; }).length },
    { icon: '👥', label: '社交', val: allNotifs.filter(function(n) { return n.type === 'social'; }).length },
    { icon: '🎁', label: '獎勵', val: allNotifs.filter(function(n) { return n.type === 'reward'; }).length }
  ];
  stats.forEach(function(s) {
    html += '<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px">';
    html += '<div style="font-size:18px">' + s.icon + '</div>';
    html += '<div style="font-size:14px;font-weight:900;color:var(--gold2);margin:4px 0">' + s.val + '</div>';
    html += '<div style="font-size:10px;color:var(--mut)">' + s.label + '</div>';
    html += '</div>';
  });
  html += '</div></div>';

  html += '<div class="panel2" style="margin-top:12px"><b style="color:var(--gold2);font-size:14px">📖 通知說明</b>';
  html += '<div class="skTxt" style="margin-top:6px">';
  html += '通知中心收錄所有系統訊息、遊戲活動與社交互動。未讀通知會以藍色標記並排在最上方。點擊通知可查看完整內容。你可以在下方設定中關閉不需要的通知類別。系統會自動清理超過 30 天的已讀通知。</div></div>';

  area.innerHTML = html;
}

function notifOpen(id) {
  var u = me();
  var notifs = u.g.notifications || [];
  var n = notifs.find(function(x) { return x.id === id; });
  if (n && !n.read) {
    n.read = true;
    set(LS.users, get(LS.users, []));
  }
  if (!n) return;
  var icons = { system: '⚙️', game: '🎮', social: '👥', reward: '🎁', level: '⭐', pk: '⚔️', guild: '🏰', exam: '📝' };
  var h = '<div style="padding:10px">';
  h += '<div style="text-align:center;margin-bottom:12px">';
  h += '<div style="font-size:40px">' + (icons[n.type] || '📌') + '</div>';
  h += '<b style="font-family:var(--serif);color:var(--gold2);font-size:17px;display:block;margin-top:8px">' + esc(n.title || '通知') + '</b>';
  h += '<div style="font-size:11px;color:var(--mut)">' + new Date(n.ts || Date.now()).toLocaleString() + '</div>';
  h += '</div>';
  h += '<div class="panel2" style="white-space:pre-wrap">' + esc(n.content || '無內容') + '</div>';
  if (n.link) {
    h += '<div class="mBtns" style="margin-top:10px"><button class="btn teal" onclick="closeModal();' + n.link + '">前往查看</button></div>';
  }
  if (n.rewards) {
    h += '<div style="margin-top:10px;padding:10px;background:rgba(242,193,78,.1);border:1px solid var(--goldD);border-radius:8px">';
    h += '<b style="color:var(--gold2)">🎁 附件獎勵：</b>';
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">';
    Object.entries(n.rewards).forEach(function(kv) {
      var label = { gold: '金幣', gems: '寶石', exp: '經驗' }[kv[0]] || kv[0];
      h += '<span class="chip">' + label + ' x' + kv[1] + '</span>';
    });
    h += '</div></div>';
  }
  h += '<div class="mBtns" style="margin-top:12px">';
  h += '<button class="btn danger" onclick="notifDelete(\'' + id + '\');closeModal()">🗑️ 刪除</button>';
  h += '<button class="btn ghost" onclick="closeModal()">關閉</button>';
  h += '</div></div>';
  openModal(h);
}

function notifDelete(id) {
  var u = me();
  u.g.notifications = (u.g.notifications || []).filter(function(n) { return n.id !== id; });
  set(LS.users, get(LS.users, []));
  toast('🗑️ 通知已刪除');
  notifTab(window._notifTab || 'all');
}

function notifReadAll() {
  var u = me();
  (u.g.notifications || []).forEach(function(n) { n.read = true; });
  set(LS.users, get(LS.users, []));
  toast('✅ 全部標記已讀');
  notifTab('all');
}

function notifClearAll() {
  if (!confirm('確定清除全部已讀通知？')) return;
  var u = me();
  u.g.notifications = (u.g.notifications || []).filter(function(n) { return !n.read; });
  set(LS.users, get(LS.users, []));
  toast('🗑️ 已清除已讀通知');
  notifTab(window._notifTab || 'all');
}

function notifToggleSetting(key) {
  var u = me();
  u.g.notifSettings = u.g.notifSettings || {};
  u.g.notifSettings[key] = u.g.notifSettings[key] === false ? true : false;
  set(LS.users, get(LS.users, []));
  toast(u.g.notifSettings[key] ? '✅ 已開啟' : '❌ 已關閉');
  notifTab(window._notifTab || 'all');
}

function notifMarkRead(id) {
  var u = me();
  var n = (u.g.notifications || []).find(function(x) { return x.id === id; });
  if (n) { n.read = true; set(LS.users, get(LS.users, [])); }
  notifTab(window._notifTab || 'all');
}
window.vNotifs = vNotifs;
