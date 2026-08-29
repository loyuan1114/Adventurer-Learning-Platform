/* vTerr — 領地戰 */
function vTerr() {
  var u = me(); if (!u) return;
  var g = u.g;
  var territories = get('ADV9_TERRITORIES', []);

  var h = back() + '<h3 class="vt">🗺️ 領地戰 <span class="vsub">佔領領地・防禦據點・爭奪資源</span></h3>';

  if (!territories.length) {
    var defaultTerr = [
      { id: 't1', name: '🌲 翡翠森林', icon: '🌲', level: 1, bonus: 'exp', bonusAmt: 10, color: '#4caf50', defense: 0 },
      { id: 't2', name: '🏜️ 烈焰荒漠', icon: '🏜️', level: 5, bonus: 'gold', bonusAmt: 50, color: '#ff9800', defense: 0 },
      { id: 't3', name: '❄️ 霜寒冰原', icon: '❄️', level: 10, bonus: 'gems', bonusAmt: 2, color: '#2196f3', defense: 0 },
      { id: 't4', name: '🌋 熔岩火山', icon: '🌋', level: 20, bonus: 'exp', bonusAmt: 25, color: '#e91e63', defense: 0 },
      { id: 't5', name: '🏰 遺跡要塞', icon: '🏰', level: 30, bonus: 'gold', bonusAmt: 100, color: '#9c27b0', defense: 0 },
      { id: 't6', name: '🌊 深海之淵', icon: '🌊', level: 40, bonus: 'gems', bonusAmt: 5, color: '#00bcd4', defense: 0 },
      { id: 't7', name: '⚡ 雷霆高原', icon: '⚡', level: 50, bonus: 'exp', bonusAmt: 50, color: '#ffd700', defense: 0 },
      { id: 't8', name: '🌙 暗影谷地', icon: '🌙', level: 60, bonus: 'gold', bonusAmt: 200, color: '#7c4dff', defense: 0 },
      { id: 't9', name: '⭐ 星辰之巅', icon: '⭐', level: 75, bonus: 'gems', bonusAmt: 10, color: '#ff5722', defense: 0 },
      { id: 't10', name: '👑 王者聖殿', icon: '👑', level: 90, bonus: 'exp', bonusAmt: 100, color: '#ffd700', defense: 0 }
    ];
    territories = defaultTerr;
    set('ADV9_TERRITORIES', territories);
  }

  h += '<div class="panel2" style="margin-top:12px">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  h += '<b style="color:var(--gold2);font-size:15px">🗺️ 領地地圖</b>';
  h += '<div style="display:flex;gap:6px">';
  var myTerr = territories.filter(function(t) { return t.ownerId === u.id; });
  h += '<div class="chip">🏰 我的領地：' + myTerr.length + '/3</div>';
  h += '<div class="chip">⚡ 體力：' + (g.stamina || 100) + '/100</div>';
  h += '</div></div></div>';

  if (myTerr.length) {
    h += '<div class="panel2" style="margin-top:12px;border-left:4px solid var(--green)"><b style="color:var(--green);font-size:14px">👑 我佔領的領地</b>';
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-top:10px">';
    myTerr.forEach(function(t) {
      var bonusLabels = { exp: '+' + t.bonusAmt + ' EXP/hr', gold: '+' + t.bonusAmt + ' 金/hr', gems: '+' + t.bonusAmt + ' 寶石/hr' };
      h += '<div style="text-align:center;padding:10px;background:rgba(76,175,80,.1);border-radius:8px;border:1px solid var(--green)">';
      h += '<div style="font-size:24px">' + t.icon + '</div>';
      h += '<b style="font-size:12px;color:var(--gold2);display:block;margin-top:4px">' + esc(t.name.split(' ').slice(1).join(' ')) + '</b>';
      h += '<div style="font-size:10px;color:var(--green);margin-top:2px">' + bonusLabels[t.bonus] + '</div>';
      h += '<div style="font-size:10px;color:var(--mut)">防禦力：' + (t.defense || 0) + '</div>';
      h += '</div>';
    });
    h += '</div></div>';
  }

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--teal);font-size:15px">🗺️ 領地列表</b></div>';

  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-top:12px">';
  territories.forEach(function(t) {
    var owned = t.ownerId === u.id;
    var canAttack = g.lv >= t.level;
    var bonusLabels = { exp: '+' + t.bonusAmt + ' EXP/hr', gold: '+' + t.bonusAmt + ' 金/hr', gems: '+' + t.bonusAmt + ' 寶石/hr' };
    h += '<div class="panel2" style="position:relative;border-left:4px solid ' + (owned ? 'var(--green)' : t.color) + ';' + (owned ? 'background:rgba(76,175,80,.08)' : '') + '">';
    if (owned) h += '<div class="stockTag" style="background:var(--green);top:8px;right:8px">👑 我的</div>';
    h += '<div style="text-align:center;margin-bottom:8px">';
    h += '<div style="font-size:32px">' + t.icon + '</div>';
    h += '<b style="font-family:var(--serif);color:var(--gold2);font-size:14px;display:block;margin-top:4px">' + esc(t.name.split(' ').slice(1).join(' ')) + '</b>';
    h += '</div>';
    h += '<div class="skTxt" style="text-align:center">需求等級：Lv.' + t.level + ' ｜ 加成：' + bonusLabels[t.bonus] + '</div>';
    if (t.ownerName && !owned) h += '<div class="chip" style="text-align:center;margin:6px auto;width:fit-content">🏰 領主：' + esc(t.ownerName) + ' (Lv.' + (t.ownerLv || '?') + ')</div>';
    if (t.defense && t.defense > 0) h += '<div class="chip" style="text-align:center;margin:0 auto;width:fit-content;font-size:10px">🛡️ 防禦力：' + t.defense + '</div>';
    h += '<div class="mBtns" style="margin-top:8px">';
    if (owned) {
      h += '<button class="btn ghost mini" onclick="territoryDefend(\'' + t.id + '\')">🛡️ 加固防禦 (100金)</button>';
      h += '<button class="btn ghost mini" onclick="territoryAbandon(\'' + t.id + '\')">🚪 放棄</button>';
    } else {
      h += '<button class="btn ' + (canAttack ? 'teal mini' : 'ghost mini dis') + '" ' + (canAttack ? '' : 'disabled') + ' onclick="territoryAttack(\'' + t.id + '\')">⚔️ 進攻 (15體力)</button>';
    }
    h += '</div></div>';
  });
  h += '</div>';

  h += '<div class="panel2" style="margin-top:14px"><b style="color:var(--teal);font-size:14px">📊 領地加成總覽</b>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:10px">';
  var expBonus = myTerr.filter(function(t) { return t.bonus === 'exp'; }).reduce(function(a, t) { return a + t.bonusAmt; }, 0);
  var goldBonus = myTerr.filter(function(t) { return t.bonus === 'gold'; }).reduce(function(a, t) { return a + t.bonusAmt; }, 0);
  var gemsBonus = myTerr.filter(function(t) { return t.bonus === 'gems'; }).reduce(function(a, t) { return a + t.bonusAmt; }, 0);
  h += '<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px">💡</div><div style="font-size:16px;font-weight:900;color:var(--teal);margin:4px 0">+' + expBonus + '</div><div style="font-size:10px;color:var(--mut)">EXP/hr</div></div>';
  h += '<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px">💰</div><div style="font-size:16px;font-weight:900;color:#ffd700;margin:4px 0">+' + goldBonus + '</div><div style="font-size:10px;color:var(--mut)">金/hr</div></div>';
  h += '<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px">💎</div><div style="font-size:16px;font-weight:900;color:var(--purple);margin:4px 0">+' + gemsBonus + '</div><div style="font-size:10px;color:var(--mut)">寶石/hr</div></div>';
  h += '</div></div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--gold2);font-size:14px">📜 戰鬥紀錄</b>';
  var logs = (g.terrLogs || []).slice(-10).reverse();
  if (logs.length) {
    h += '<div style="margin-top:8px;display:flex;flex-direction:column;gap:4px">';
    logs.forEach(function(l) {
      h += '<div class="chip">' + new Date(l.ts).toLocaleString() + ' ' + (l.win ? '🏆 佔領成功' : '💥 佔領失敗') + ' ' + esc(l.terrName || '') + '</div>';
    });
    h += '</div>';
  } else {
    h += '<div class="empty" style="margin-top:8px">暫無戰鬥紀錄</div>';
  }
  h += '</div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--gold2);font-size:14px">📖 領地戰規則</b>';
  h += '<div class="skTxt" style="margin-top:6px">';
  h += '佔領領地可獲得持續性的資源加成（經驗/金幣/寶石）。每個領地有等級需求，攻佔時需通過戰鬥檢定。戰鬥成功率取決於你的戰力與領地等級。已佔領的領地可加固防禦（消耗 100 金幣提升 10 防禦力），也可隨時放棄。每位玩家最多佔領 3 個領地。領地加成每小時自動結算一次。防禦力越高，被他人攻佔的難度越大。</div></div>';

  $('#view').innerHTML = h;
}

function territoryAttack(id) {
  var u = me(), g = u.g;
  var territories = get('ADV9_TERRITORIES', []);
  var t = territories.find(function(x) { return x.id === id; });
  if (!t) return;
  if (g.lv < t.level) return toast('⚠️ 等級不足（需 Lv.' + t.level + '）', 'bad');
  var myTerr = territories.filter(function(x) { return x.ownerId === u.id; });
  if (myTerr.length >= 3) return toast('⚠️ 最多佔領 3 個領地', 'bad');
  if ((g.stamina || 100) < 15) return toast('⚠️ 體力不足（需 15）', 'bad');
  g.stamina -= 15;

  var power = (g.atk || 0) + (g.def || 0) + (g.hp || 0) + (g.spd || 0) + (g.crit || 0);
  var threshold = t.level * 100;
  var defenseMod = (t.defense || 0) * 0.5;
  var win = power > (threshold + defenseMod) ? Math.random() < 0.85 : Math.random() < 0.25;
  if (t.ownerId) win = win && Math.random() < 0.6;

  var log = { terrId: id, terrName: t.name, win: win, ts: Date.now() };
  g.terrLogs = g.terrLogs || [];
  g.terrLogs.push(log);
  if (g.terrLogs.length > 50) g.terrLogs = g.terrLogs.slice(-50);

  if (win) {
    t.ownerId = u.id;
    t.ownerName = u.name || u.username;
    t.ownerLv = g.lv;
    toast('🏆 佔領成功！' + esc(t.name));
  } else {
    toast('💥 佔領失敗，體力已扣除');
  }
  set('ADV9_TERRITORIES', territories);
  set(LS.users, get(LS.users, []));
  vTerr();
}

function territoryDefend(id) {
  var u = me();
  if (u.g.gold < 100) return toast('⚠️ 需要 100 金幣', 'bad');
  u.g.gold -= 100;
  var territories = get('ADV9_TERRITORIES', []);
  var t = territories.find(function(x) { return x.id === id; });
  if (t) t.defense = (t.defense || 0) + 10;
  set('ADV9_TERRITORIES', territories);
  set(LS.users, get(LS.users, []));
  toast('🛡️ 防禦已加固 +10');
  vTerr();
}

function territoryAbandon(id) {
  if (!confirm('確定放棄此領地？')) return;
  var territories = get('ADV9_TERRITORIES', []);
  var t = territories.find(function(x) { return x.id === id; });
  if (t) { t.ownerId = null; t.ownerName = null; t.ownerLv = null; t.defense = 0; }
  set('ADV9_TERRITORIES', territories);
  toast('🚪 已放棄領地');
  vTerr();
}

function territoryCollectBonus() {
  var u = me(), g = u.g;
  var territories = get('ADV9_TERRITORIES', []);
  var myTerr = territories.filter(function(t) { return t.ownerId === u.id; });
  if (!myTerr.length) return toast('⚠️ 你沒有佔領任何領地', 'bad');
  var expGain = 0, goldGain = 0, gemsGain = 0;
  myTerr.forEach(function(t) {
    if (t.bonus === 'exp') expGain += t.bonusAmt;
    else if (t.bonus === 'gold') goldGain += t.bonusAmt;
    else if (t.bonus === 'gems') gemsGain += t.bonusAmt;
  });
  g.exp = (g.exp || 0) + expGain;
  g.gold = (g.gold || 0) + goldGain;
  g.gems = (g.gems || 0) + gemsGain;
  set(LS.users, get(LS.users, []));
  var parts = [];
  if (expGain) parts.push('+' + expGain + ' EXP');
  if (goldGain) parts.push('+' + goldGain + ' 金幣');
  if (gemsGain) parts.push('+' + gemsGain + ' 寶石');
  toast('💰 收取加成：' + parts.join('、'));
  vTerr();
}

function territoryShowRanking() {
  var territories = get('ADV9_TERRITORIES', []);
  var owners = {};
  territories.forEach(function(t) {
    if (t.ownerId) {
      if (!owners[t.ownerId]) owners[t.ownerId] = { name: t.ownerName || '未知', count: 0, totalDef: 0 };
      owners[t.ownerId].count++;
      owners[t.ownerId].totalDef += (t.defense || 0);
    }
  });
  var list = Object.keys(owners).map(function(k) { return owners[k]; });
  list.sort(function(a, b) { return b.count - a.count; });
  var h = '<div style="padding:10px"><b style="font-family:var(--serif);color:var(--gold2);font-size:16px;display:block;margin-bottom:10px">🏆 領地排名</b>';
  if (!list.length) {
    h += '<div class="empty">暫無佔領者</div>';
  } else {
    list.forEach(function(o, i) {
      var medals = ['🥇', '🥈', '🥉'];
      h += '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(0,0,0,.1);border-radius:6px;margin-bottom:6px">';
      h += '<span style="font-size:16px;min-width:24px;text-align:center">' + (i < 3 ? medals[i] : (i + 1)) + '</span>';
      h += '<div style="flex:1"><b style="font-size:13px;color:var(--gold2)">' + esc(o.name) + '</b></div>';
      h += '<div class="chip">' + o.count + ' 領地</div>';
      h += '<div class="chip">🛡️ ' + o.totalDef + '</div>';
      h += '</div>';
    });
  }
  h += '<div class="mBtns"><button class="btn" onclick="closeModal()">關閉</button></div></div>';
  openModal(h);
}

function territoryScout(id) {
  var territories = get('ADV9_TERRITORIES', []);
  var t = territories.find(function(x) { return x.id === id; });
  if (!t) return;
  var h = '<div style="padding:10px">';
  h += '<div style="text-align:center;margin-bottom:12px">';
  h += '<div style="font-size:48px">' + t.icon + '</div>';
  h += '<b style="font-family:var(--serif);color:var(--gold2);font-size:18px;display:block;margin-top:8px">' + esc(t.name) + '</b>';
  h += '</div>';
  h += '<div class="panel2">';
  h += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">';
  h += '<div style="text-align:center;padding:8px;background:rgba(0,0,0,.15);border-radius:6px"><div style="font-size:11px;color:var(--mut)">需求等級</div><div style="font-size:16px;font-weight:900;color:var(--gold2)">Lv.' + t.level + '</div></div>';
  h += '<div style="text-align:center;padding:8px;background:rgba(0,0,0,.15);border-radius:6px"><div style="font-size:11px;color:var(--mut)">防禦力</div><div style="font-size:16px;font-weight:900;color:var(--teal)">' + (t.defense || 0) + '</div></div>';
  h += '<div style="text-align:center;padding:8px;background:rgba(0,0,0,.15);border-radius:6px"><div style="font-size:11px;color:var(--mut)">加成類型</div><div style="font-size:14px;font-weight:700;color:var(--gold2)">' + t.bonus.toUpperCase() + '</div></div>';
  h += '<div style="text-align:center;padding:8px;background:rgba(0,0,0,.15);border-radius:6px"><div style="font-size:11px;color:var(--mut)">加成數值</div><div style="font-size:14px;font-weight:700;color:var(--gold2)">' + t.bonusAmt + '/hr</div></div>';
  h += '</div></div>';
  if (t.ownerId) {
    h += '<div class="panel2" style="margin-top:8px"><b style="font-size:12px">🏰 領主資訊</b>';
    h += '<div style="font-size:12px;margin-top:4px">' + esc(t.ownerName || '未知') + ' (Lv.' + (t.ownerLv || '?') + ')</div></div>';
  }
  h += '<div class="mBtns"><button class="btn" onclick="closeModal()">關閉</button></div></div>';
  openModal(h);
}
window.vTerr = vTerr;
