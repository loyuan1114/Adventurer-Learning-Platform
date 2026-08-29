/* vTitleV — 稱號系統 */
function vTitleV() {
  var u = me(); if (!u) return;
  var g = u.g;

  var allTitles = [
    { id: 'newbie', name: '冒險新手', icon: '🌱', desc: 'Lv.1 起步', req: function() { return g.lv >= 1; }, color: '#4caf50', category: 'level' },
    { id: 'warrior', name: '初級戰士', icon: '⚔️', desc: 'Lv.10 達成', req: function() { return g.lv >= 10; }, color: '#2196f3', category: 'level' },
    { id: 'ranger', name: '中級冒險者', icon: '🛡️', desc: 'Lv.20 達成', req: function() { return g.lv >= 20; }, color: '#ff9800', category: 'level' },
    { id: 'hunter', name: '高級獵人', icon: '🏹', desc: 'Lv.30 達成', req: function() { return g.lv >= 30; }, color: '#e91e63', category: 'level' },
    { id: 'elite', name: '精英戰士', icon: '🗡️', desc: 'Lv.40 達成', req: function() { return g.lv >= 40; }, color: '#9c27b0', category: 'level' },
    { id: 'hero', name: '傳說勇者', icon: '👑', desc: 'Lv.50 達成', req: function() { return g.lv >= 50; }, color: '#ffd700', category: 'level' },
    { id: 'mythic', name: '神話英雄', icon: '🌟', desc: 'Lv.60 達成', req: function() { return g.lv >= 60; }, color: '#ff5722', category: 'level' },
    { id: 'guardian', name: '遠古守護者', icon: '🏰', desc: 'Lv.70 達成', req: function() { return g.lv >= 70; }, color: '#7c4dff', category: 'level' },
    { id: 'eternal', name: '永恆之光', icon: '✨', desc: 'Lv.80 達成', req: function() { return g.lv >= 80; }, color: '#00bcd4', category: 'level' },
    { id: 'supreme', name: '至高無上', icon: '💫', desc: 'Lv.90 達成', req: function() { return g.lv >= 90; }, color: '#e91e63', category: 'level' },
    { id: 'legend', name: '傳奇冒險者', icon: '🏆', desc: 'Lv.100 達成', req: function() { return g.lv >= 100; }, color: '#ffd700', category: 'level' },
    { id: 'pk_king', name: 'PK 之王', icon: '⚔️', desc: 'PK 勝場 50+', req: function() { return (g.pkWin || 0) >= 50; }, color: '#e91e63', category: 'pk' },
    { id: 'pk_master', name: 'PK 大師', icon: '🗡️', desc: 'PK 勝場 100+', req: function() { return (g.pkWin || 0) >= 100; }, color: '#ff5722', category: 'pk' },
    { id: 'arena_top', name: '競技之巔', icon: '🏟️', desc: '競技塔 30 層', req: function() { return (g.arena && g.arena.best || 0) >= 30; }, color: '#9c27b0', category: 'pk' },
    { id: 'dungeon_clear', name: '副本征服者', icon: '🏰', desc: '通關全部副本', req: function() { var c = g.dunCleared || {}; return c.d1 && c.d2 && c.d3 && c.d4 && c.d5; }, color: '#ffd700', category: 'special' },
    { id: 'social_butterfly', name: '社交達人', icon: '👥', desc: '好友 10 人', req: function() { return (g.friends || []).length >= 10; }, color: '#4caf50', category: 'social' },
    { id: 'rich', name: '富豪', icon: '💰', desc: '金幣 10 萬', req: function() { return (g.gold || 0) >= 100000; }, color: '#ffd700', category: 'collect' },
    { id: 'gem_hoarder', name: '寶石收藏家', icon: '💎', desc: '寶石 50+', req: function() { return (g.gems || 0) >= 50; }, color: '#00bcd4', category: 'collect' },
    { id: 'rebirth1', name: '轉生者', icon: '🔁', desc: '轉生 1 次', req: function() { return (g.rebirth || 0) >= 1; }, color: '#ff9800', category: 'special' },
    { id: 'rebirth3', name: '轉生大師', icon: '♻️', desc: '轉生 3 次', req: function() { return (g.rebirth || 0) >= 3; }, color: '#e91e63', category: 'special' },
    { id: 'viewer5', name: '學習新手', icon: '📖', desc: '觀看 5 部影片', req: function() { return (g.videosWatched || 0) >= 5; }, color: '#2196f3', category: 'learn' },
    { id: 'viewer20', name: '影片大師', icon: '🎬', desc: '觀看 20 部影片', req: function() { return (g.videosWatched || 0) >= 20; }, color: '#9c27b0', category: 'learn' },
    { id: 'qa50', name: '答題好手', icon: '📝', desc: '答對 50 題', req: function() { return (g.correctTotal || 0) >= 50; }, color: '#4caf50', category: 'learn' },
    { id: 'qa200', name: '答題王者', icon: '🧠', desc: '答對 200 題', req: function() { return (g.correctTotal || 0) >= 200; }, color: '#ffd700', category: 'learn' },
    { id: 'guild_member', name: '公會成員', icon: '🏰', desc: '加入公會', req: function() { return !!g.guildId; }, color: '#7c4dff', category: 'social' },
    { id: 'perfect10', name: '滿分達人', icon: '💯', desc: '一次滿分 10 次', req: function() { return (g.perfectCount || 0) >= 10; }, color: '#e91e63', category: 'learn' }
  ];

  var h = back() + '<h3 class="vt">🏅 稱號系統 <span class="vsub">收集稱號・展示成就・解鎖榮耀</span></h3>';

  var unlocked = allTitles.filter(function(t) { return t.req(); });
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  h += '<b style="color:var(--gold2);font-size:15px">🏅 我的稱號</b>';
  h += '<div style="display:flex;gap:6px">';
  h += '<div class="chip">✅ 已解鎖：' + unlocked.length + '/' + allTitles.length + '</div>';
  h += '<div class="chip">📊 進度：' + Math.round(unlocked.length / allTitles.length * 100) + '%</div>';
  h += '</div></div>';
  if (unlocked.length) {
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">';
    unlocked.forEach(function(t) {
      var equipped = g.equippedTitle === t.id;
      h += '<button class="btn mini ' + (equipped ? 'teal' : 'ghost') + '" onclick="titleEquip(\'' + t.id + '\')" style="font-size:11px">' + t.icon + ' ' + t.name + (equipped ? ' ✓' : '') + '</button>';
    });
    h += '</div>';
  } else {
    h += '<div class="empty" style="margin-top:8px">尚未獲得任何稱號</div>';
  }
  h += '</div>';

  var categories = [
    { id: 'level', name: '⭐ 等級稱號', icon: '⭐' },
    { id: 'pk', name: '⚔️ 戰鬥稱號', icon: '⚔️' },
    { id: 'learn', name: '📖 學習稱號', icon: '📖' },
    { id: 'social', name: '👥 社交稱號', icon: '👥' },
    { id: 'collect', name: '💎 收藏稱號', icon: '💎' },
    { id: 'special', name: '🌟 特殊稱號', icon: '🌟' }
  ];

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--teal);font-size:15px">📋 稱號圖鑑</b>';
  categories.forEach(function(cat) {
    var catTitles = allTitles.filter(function(t) { return t.category === cat.id; });
    if (!catTitles.length) return;
    h += '<div style="margin-top:10px">';
    h += '<b style="font-size:12px;color:var(--mut)">' + cat.name + '</b>';
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px;margin-top:6px">';
    catTitles.forEach(function(t) {
      var unlocked = t.req();
      var equipped = g.equippedTitle === t.id;
      h += '<div class="panel2" style="text-align:center;padding:10px;' + (unlocked ? 'border-color:' + t.color : 'opacity:.45') + ';' + (equipped ? 'border:2px solid var(--teal);background:rgba(0,230,118,.08)' : '') + '">';
      h += '<div style="font-size:24px">' + (unlocked ? t.icon : '🔒') + '</div>';
      h += '<b style="font-size:11px;color:' + (unlocked ? 'var(--gold2)' : 'var(--mut)') + ';display:block;margin-top:4px">' + t.name + '</b>';
      h += '<div style="font-size:9px;color:var(--mut);margin-top:2px">' + t.desc + '</div>';
      if (equipped) h += '<div class="chip" style="margin-top:4px;font-size:8px">佩戴中</div>';
      else if (unlocked) h += '<button class="btn mini ghost" style="margin-top:4px;font-size:9px" onclick="titleEquip(\'' + t.id + '\')">佩戴</button>';
      h += '</div>';
    });
    h += '</div></div>';
  });
  h += '</div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--purple);font-size:14px">📊 稱號統計</b>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:10px">';
  categories.forEach(function(cat) {
    var catTitles = allTitles.filter(function(t) { return t.category === cat.id; });
    var catUnlocked = catTitles.filter(function(t) { return t.req(); }).length;
    h += '<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px">';
    h += '<div style="font-size:18px">' + cat.icon + '</div>';
    h += '<div style="font-size:14px;font-weight:900;color:var(--gold2);margin:4px 0">' + catUnlocked + '/' + catTitles.length + '</div>';
    h += '<div style="font-size:10px;color:var(--mut)">' + cat.name.replace(/[^\u4e00-\u9fa5]/g, '') + '</div>';
    h += '</div>';
  });
  h += '</div></div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--gold2);font-size:14px">📖 稱號說明</b>';
  h += '<div class="skTxt" style="margin-top:6px">';
  h += '稱號是榮耀的象徵！透過提升等級、PK勝場、觀看影片、收集資源等方式解鎖稱號。已解鎖的稱號可選擇佩戴，佩戴後會顯示在你的個人面板上。點擊「佩戴」按鈕切換當前展示的稱號。每個玩家同時只能佩戴一個稱號。稱號分為等級、戰鬥、學習、社交、收藏和特殊六大類別。</div></div>';

  $('#view').innerHTML = h;
}

function titleEquip(id) {
  var u = me(), g = u.g;
  var allTitles = [
    { id: 'newbie', req: function() { return g.lv >= 1; } },
    { id: 'warrior', req: function() { return g.lv >= 10; } },
    { id: 'ranger', req: function() { return g.lv >= 20; } },
    { id: 'hunter', req: function() { return g.lv >= 30; } },
    { id: 'elite', req: function() { return g.lv >= 40; } },
    { id: 'hero', req: function() { return g.lv >= 50; } },
    { id: 'mythic', req: function() { return g.lv >= 60; } },
    { id: 'guardian', req: function() { return g.lv >= 70; } },
    { id: 'eternal', req: function() { return g.lv >= 80; } },
    { id: 'supreme', req: function() { return g.lv >= 90; } },
    { id: 'legend', req: function() { return g.lv >= 100; } },
    { id: 'pk_king', req: function() { return (g.pkWin || 0) >= 50; } },
    { id: 'pk_master', req: function() { return (g.pkWin || 0) >= 100; } },
    { id: 'arena_top', req: function() { return (g.arena && g.arena.best || 0) >= 30; } },
    { id: 'dungeon_clear', req: function() { var c = g.dunCleared || {}; return c.d1 && c.d2 && c.d3 && c.d4 && c.d5; } },
    { id: 'social_butterfly', req: function() { return (g.friends || []).length >= 10; } },
    { id: 'rich', req: function() { return (g.gold || 0) >= 100000; } },
    { id: 'gem_hoarder', req: function() { return (g.gems || 0) >= 50; } },
    { id: 'rebirth1', req: function() { return (g.rebirth || 0) >= 1; } },
    { id: 'rebirth3', req: function() { return (g.rebirth || 0) >= 3; } },
    { id: 'viewer5', req: function() { return (g.videosWatched || 0) >= 5; } },
    { id: 'viewer20', req: function() { return (g.videosWatched || 0) >= 20; } },
    { id: 'qa50', req: function() { return (g.correctTotal || 0) >= 50; } },
    { id: 'qa200', req: function() { return (g.correctTotal || 0) >= 200; } },
    { id: 'guild_member', req: function() { return !!g.guildId; } },
    { id: 'perfect10', req: function() { return (g.perfectCount || 0) >= 10; } }
  ];
  var title = allTitles.find(function(t) { return t.id === id; });
  if (!title || !title.req()) return toast('⚠️ 此稱號尚未解鎖', 'bad');
  g.equippedTitle = id;
  set(LS.users, get(LS.users, []));
  toast('🏅 已佩戴稱號');
  vTitleV();
}

function titleUnequip() {
  var u = me();
  u.g.equippedTitle = null;
  set(LS.users, get(LS.users, []));
  toast('🏅 已卸下稱號');
  vTitleV();
}

function titleDetail(id) {
  var u = me(), g = u.g;
  var allTitles = [
    { id: 'newbie', name: '冒險新手', icon: '🌱', desc: 'Lv.1 起步', req: function() { return g.lv >= 1; }, category: 'level' },
    { id: 'warrior', name: '初級戰士', icon: '⚔️', desc: 'Lv.10 達成', req: function() { return g.lv >= 10; }, category: 'level' },
    { id: 'ranger', name: '中級冒險者', icon: '🛡️', desc: 'Lv.20 達成', req: function() { return g.lv >= 20; }, category: 'level' },
    { id: 'hunter', name: '高級獵人', icon: '🏹', desc: 'Lv.30 達成', req: function() { return g.lv >= 30; }, category: 'level' },
    { id: 'elite', name: '精英戰士', icon: '🗡️', desc: 'Lv.40 達成', req: function() { return g.lv >= 40; }, category: 'level' },
    { id: 'hero', name: '傳說勇者', icon: '👑', desc: 'Lv.50 達成', req: function() { return g.lv >= 50; }, category: 'level' },
    { id: 'mythic', name: '神話英雄', icon: '🌟', desc: 'Lv.60 達成', req: function() { return g.lv >= 60; }, category: 'level' },
    { id: 'guardian', name: '遠古守護者', icon: '🏰', desc: 'Lv.70 達成', req: function() { return g.lv >= 70; }, category: 'level' },
    { id: 'eternal', name: '永恆之光', icon: '✨', desc: 'Lv.80 達成', req: function() { return g.lv >= 80; }, category: 'level' },
    { id: 'supreme', name: '至高無上', icon: '💫', desc: 'Lv.90 達成', req: function() { return g.lv >= 90; }, category: 'level' },
    { id: 'legend', name: '傳奇冒險者', icon: '🏆', desc: 'Lv.100 達成', req: function() { return g.lv >= 100; }, category: 'level' },
    { id: 'pk_king', name: 'PK 之王', icon: '⚔️', desc: 'PK 勝場 50+', req: function() { return (g.pkWin || 0) >= 50; }, category: 'pk' },
    { id: 'pk_master', name: 'PK 大師', icon: '🗡️', desc: 'PK 勝場 100+', req: function() { return (g.pkWin || 0) >= 100; }, category: 'pk' },
    { id: 'arena_top', name: '競技之巔', icon: '🏟️', desc: '競技塔 30 層', req: function() { return (g.arena && g.arena.best || 0) >= 30; }, category: 'pk' },
    { id: 'dungeon_clear', name: '副本征服者', icon: '🏰', desc: '通關全部副本', req: function() { var c = g.dunCleared || {}; return c.d1 && c.d2 && c.d3 && c.d4 && c.d5; }, category: 'special' },
    { id: 'social_butterfly', name: '社交達人', icon: '👥', desc: '好友 10 人', req: function() { return (g.friends || []).length >= 10; }, category: 'social' },
    { id: 'rich', name: '富豪', icon: '💰', desc: '金幣 10 萬', req: function() { return (g.gold || 0) >= 100000; }, category: 'collect' },
    { id: 'gem_hoarder', name: '寶石收藏家', icon: '💎', desc: '寶石 50+', req: function() { return (g.gems || 0) >= 50; }, category: 'collect' },
    { id: 'rebirth1', name: '轉生者', icon: '🔁', desc: '轉生 1 次', req: function() { return (g.rebirth || 0) >= 1; }, category: 'special' },
    { id: 'rebirth3', name: '轉生大師', icon: '♻️', desc: '轉生 3 次', req: function() { return (g.rebirth || 0) >= 3; }, category: 'special' },
    { id: 'viewer5', name: '學習新手', icon: '📖', desc: '觀看 5 部影片', req: function() { return (g.videosWatched || 0) >= 5; }, category: 'learn' },
    { id: 'viewer20', name: '影片大師', icon: '🎬', desc: '觀看 20 部影片', req: function() { return (g.videosWatched || 0) >= 20; }, category: 'learn' },
    { id: 'qa50', name: '答題好手', icon: '📝', desc: '答對 50 題', req: function() { return (g.correctTotal || 0) >= 50; }, category: 'learn' },
    { id: 'qa200', name: '答題王者', icon: '🧠', desc: '答對 200 題', req: function() { return (g.correctTotal || 0) >= 200; }, category: 'learn' },
    { id: 'guild_member', name: '公會成員', icon: '🏰', desc: '加入公會', req: function() { return !!g.guildId; }, category: 'social' },
    { id: 'perfect10', name: '滿分達人', icon: '💯', desc: '一次滿分 10 次', req: function() { return (g.perfectCount || 0) >= 10; }, category: 'learn' }
  ];
  var title = allTitles.find(function(t) { return t.id === id; });
  if (!title) return;
  var unlocked = title.req();
  var equipped = g.equippedTitle === id;
  var h = '<div style="padding:10px;text-align:center">';
  h += '<div style="font-size:64px">' + (unlocked ? title.icon : '🔒') + '</div>';
  h += '<b style="font-family:var(--serif);color:var(--gold2);font-size:20px;display:block;margin-top:10px">' + title.name + '</b>';
  h += '<div style="font-size:13px;color:var(--mut);margin-top:4px">' + title.desc + '</div>';
  if (equipped) h += '<div class="chip" style="margin-top:8px;background:rgba(0,230,118,.15);color:var(--green)">✓ 目前佩戴中</div>';
  else if (unlocked) h += '<button class="btn teal" style="margin-top:12px" onclick="titleEquip(\'' + id + '\');closeModal()">佩戴此稱號</button>';
  else h += '<div class="chip" style="margin-top:8px;background:rgba(233,30,99,.1);color:#e91e63">🔒 尚未解鎖</div>';
  h += '<div class="mBtns" style="margin-top:12px"><button class="btn" onclick="closeModal()">關閉</button></div></div>';
  openModal(h);
}
window.vTitleV = vTitleV;
