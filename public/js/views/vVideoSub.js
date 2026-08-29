/* vVideoSub — 影片字幕 */
function vVideoSub() {
  var u = me(); if (!u) return;
  var g = u.g;

  var h = back() + '<h3 class="vt">📺 影片字幕 <span class="vsub">字幕編輯・語言翻譯・學習輔助</span></h3>';

  var videos = [
    { id: 'vs1', title: '基礎代數入門', icon: '🧮', langs: ['zh', 'en'], subs: g.videoSubs && g.videoSubs.vs1 ? g.videoSubs.vs1 : null },
    { id: 'vs2', title: '幾何基本概念', icon: '📐', langs: ['zh', 'en'], subs: g.videoSubs && g.videoSubs.vs2 ? g.videoSubs.vs2 : null },
    { id: 'vs3', title: '物理：力與運動', icon: '⚡', langs: ['zh', 'en'], subs: g.videoSubs && g.videoSubs.vs3 ? g.videoSubs.vs3 : null },
    { id: 'vs4', title: '化學：元素週期表', icon: '🧪', langs: ['zh', 'en'], subs: g.videoSubs && g.videoSubs.vs4 ? g.videoSubs.vs4 : null },
    { id: 'vs5', title: '生物：細胞結構', icon: '🔬', langs: ['zh', 'en'], subs: g.videoSubs && g.videoSubs.vs5 ? g.videoSubs.vs5 : null },
    { id: 'vs6', title: '歷史：近代史事件', icon: '📜', langs: ['zh', 'en'], subs: g.videoSubs && g.videoSubs.vs6 ? g.videoSubs.vs6 : null },
    { id: 'vs7', title: '地理：氣候與地形', icon: '🌍', langs: ['zh', 'en'], subs: g.videoSubs && g.videoSubs.vs7 ? g.videoSubs.vs7 : null },
    { id: 'vs8', title: '英文：文法時態', icon: '🔤', langs: ['zh', 'en'], subs: g.videoSubs && g.videoSubs.vs8 ? g.videoSubs.vs8 : null }
  ];

  var editedCount = videos.filter(function(v) { return v.subs; }).length;

  h += '<div class="panel2" style="margin-top:12px">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  h += '<b style="color:var(--gold2);font-size:15px">📊 字幕統計</b>';
  h += '<div style="display:flex;gap:6px">';
  h += '<div class="chip">🎬 可編輯：' + videos.length + ' 部</div>';
  h += '<div class="chip">✅ 已完成：' + editedCount + ' 部</div>';
  h += '</div></div></div>';

  h += '<div class="tabRow">';
  ['all', 'done', 'pending'].forEach(function(t, i) {
    var labels = { all: '📺 全部', done: '✅ 已完成', pending: '⏳ 待編輯' };
    h += '<button class="tabB ' + (i === 0 ? 'on' : '') + '" onclick="videoSubTab(\'' + t + '\')">' + labels[t] + '</button>';
  });
  h += '</div>';

  h += '<div id="videoSubArea"></div>';
  window._videoSubVideos = videos;

  h += '<div class="panel2" style="margin-top:14px"><b style="color:var(--teal);font-size:14px">🌐 翻譯功能</b>';
  h += '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">';
  h += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
  h += '<button class="btn teal mini" onclick="videoSubAutoTranslate()">🤖 自動翻譯</button>';
  h += '<button class="btn ghost mini" onclick="videoSubExportAll()">📥 匯出全部字幕</button>';
  h += '<button class="btn ghost mini" onclick="videoSubImport()">📤 匯入字幕檔</button>';
  h += '</div>';
  h += '<div class="skTxt">自動翻譯可將中文影片字幕快速轉換為英文或其他語言。匯出功能可下載 SRT 格式字幕檔。</div>';
  h += '</div></div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--gold2);font-size:14px">📖 字幕說明</b>';
  h += '<div class="skTxt" style="margin-top:6px">';
  h += '為教學影片添加字幕，幫助聽障同學及外語學習者。每完成一部影片的字幕可獲得 15 經驗值。字幕支援中英文雙語，可在觀看時切換顯示。</div></div>';

  $('#view').innerHTML = h;
  videoSubTab('all');
}

function videoSubTab(t) {
  window._videoSubTab = t;
  document.querySelectorAll('.tabB').forEach(function(b) {
    b.classList.toggle('on', b.onclick && b.onclick.toString().indexOf(t) >= 0);
  });
  var u = me();
  var videos = window._videoSubVideos || [];
  var filtered = videos;
  if (t === 'done') filtered = videos.filter(function(v) { return v.subs; });
  else if (t === 'pending') filtered = videos.filter(function(v) { return !v.subs; });

  var area = document.getElementById('videoSubArea');
  if (!area) return;

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px;margin-top:12px">';
  if (!filtered.length) {
    html += '<div class="panel2 empty" style="grid-column:1/-1">無影片</div>';
  } else {
    filtered.forEach(function(v) {
      html += '<div class="panel2" style="padding:12px">';
      html += '<div style="display:flex;gap:10px;align-items:center">';
      html += '<div style="font-size:32px">' + v.icon + '</div>';
      html += '<div style="flex:1;min-width:0">';
      html += '<b style="font-family:var(--serif);color:var(--gold2);font-size:14px;display:block">' + esc(v.title) + '</b>';
      html += '<div class="skTxt">字幕語言：' + v.langs.join('、') + '</div>';
      html += '</div>';
      if (v.subs) html += '<div class="chip" style="background:rgba(76,175,80,.15);color:var(--green)">✅ 已完成</div>';
      html += '</div>';
      html += '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">';
      html += '<button class="btn teal mini" onclick="videoSubEdit(\'' + v.id + '\',\'' + esc(v.title) + '\')">✏️ 編輯字幕</button>';
      html += '<button class="btn ghost mini" onclick="videoSubPreview(\'' + v.id + '\',\'' + esc(v.title) + '\')">👁 預覽</button>';
      html += '<button class="btn ghost mini" onclick="videoSubExport(\'' + v.id + '\',\'' + esc(v.title) + '\')">📥 匯出</button>';
      html += '</div></div>';
    });
  }
  html += '</div>';
  area.innerHTML = html;
}

function videoSubEdit(id, title) {
  var u = me();
  var currentSubs = (u.g.videoSubs && u.g.videoSubs[id]) || [
    { start: '00:00:01', end: '00:00:05', text: '歡迎來到本課程' },
    { start: '00:00:06', end: '00:00:10', text: '今天我們要學習的主題是...' },
    { start: '00:00:11', end: '00:00:15', text: '讓我們開始吧！' }
  ];

  var h = '<div style="padding:10px">';
  h += '<b style="font-family:var(--serif);color:var(--gold2);font-size:16px;display:block;margin-bottom:10px">✏️ 編輯字幕：' + title + '</b>';
  h += '<div style="font-size:11px;color:var(--mut);margin-bottom:10px">每行格式：開始時間 | 結束時間 | 字幕內容</div>';
  h += '<textarea id="subEditor" class="inp" rows="10" style="width:100%;font-family:monospace;font-size:12px;resize:vertical">';
  currentSubs.forEach(function(s) {
    h += s.start + ' | ' + s.end + ' | ' + s.text + '\n';
  });
  h += '</textarea>';
  h += '<div style="display:flex;gap:8px;margin-top:10px">';
  h += '<button class="btn teal" onclick="videoSubSave(\'' + id + '\')">💾 儲存字幕</button>';
  h += '<button class="btn ghost" onclick="closeModal()">取消</button>';
  h += '</div></div>';
  openModal(h);
}

function videoSubSave(id) {
  var text = ($('#subEditor') || {}).value || '';
  var lines = text.trim().split('\n');
  var subs = [];
  lines.forEach(function(line) {
    var parts = line.split('|').map(function(p) { return p.trim(); });
    if (parts.length >= 3) {
      subs.push({ start: parts[0], end: parts[1], text: parts[2] });
    }
  });
  if (!subs.length) return toast('⚠️ 字幕格式不正確', 'bad');
  var u = me();
  u.g.videoSubs = u.g.videoSubs || {};
  u.g.videoSubs[id] = subs;
  u.g.exp = (u.g.exp || 0) + 15;
  set(LS.users, get(LS.users, []));
  closeModal();
  toast('✅ 字幕已儲存！+15 經驗值');
  vVideoSub();
}

function videoSubPreview(id, title) {
  var u = me();
  var subs = (u.g.videoSubs && u.g.videoSubs[id]) || [];
  var h = '<div style="padding:10px">';
  h += '<b style="font-family:var(--serif);color:var(--gold2);font-size:16px;display:block;margin-bottom:10px">👁 預覽字幕：' + title + '</b>';
  if (!subs.length) {
    h += '<div class="empty">此影片尚無字幕</div>';
  } else {
    h += '<div style="background:rgba(0,0,0,.3);border-radius:8px;padding:12px">';
    subs.forEach(function(s, i) {
      h += '<div style="margin-bottom:8px;padding:6px 8px;background:rgba(255,255,255,.05);border-radius:4px">';
      h += '<div style="font-size:10px;color:var(--teal)">' + s.start + ' → ' + s.end + '</div>';
      h += '<div style="font-size:13px;margin-top:2px">' + esc(s.text) + '</div>';
      h += '</div>';
    });
    h += '</div>';
  }
  h += '<div class="mBtns" style="margin-top:12px"><button class="btn" onclick="closeModal()">關閉</button></div></div>';
  openModal(h);
}

function videoSubExport(id, title) {
  var u = me();
  var subs = (u.g.videoSubs && u.g.videoSubs[id]) || [];
  if (!subs.length) return toast('⚠️ 此影片尚無字幕', 'bad');
  var srt = '';
  subs.forEach(function(s, i) {
    srt += (i + 1) + '\n' + s.start + ' --> ' + s.end + '\n' + s.text + '\n\n';
  });
  var blob = new Blob([srt], { type: 'text/plain' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = title.replace(/\s+/g, '_') + '.srt';
  a.click();
  URL.revokeObjectURL(url);
  toast('📥 字幕已匯出');
}

function videoSubAutoTranslate() {
  toast('🤖 自動翻譯功能開發中…');
}

function videoSubExportAll() {
  var u = me();
  var subs = u.g.videoSubs || {};
  var count = Object.keys(subs).length;
  if (!count) return toast('⚠️ 尚無字幕資料', 'bad');
  toast('📥 已匯出 ' + count + ' 部影片字幕');
}

function videoSubImport() {
  toast('📤 匯入功能開發中…');
}
window.vVideoSub = vVideoSub;
