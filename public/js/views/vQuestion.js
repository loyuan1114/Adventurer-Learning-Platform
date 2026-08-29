/* vQuestion — 題庫管理 */
function vQuestion() {
  var u = me(); if (!u) return;
  var h = back() + '<h3 class="vt">❓ 題庫管理 <span class="vsub">建立與管理測驗題目</span></h3>';

  /* 新增題目 */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--gold2);font-size:15px">📝 新增題目</b>';
  h += '<div style="margin-top:10px">';
  h += '<div><label style="font-size:11px;color:var(--mut)">題目類型</label>';
  h += '<select id="qType" class="inp" style="margin-top:4px;width:140px">';
  h += '<option value="choice">📋 選擇題</option><option value="tf">✅ 是非題</option>';
  h += '<option value="fill">✏️ 填充題</option><option value="short">📝 簡答題</option>';
  h += '</select></div>';
  h += '<div style="margin-top:8px"><label style="font-size:11px;color:var(--mut)">學科</label>';
  h += '<select id="qSubject" class="inp" style="margin-top:4px;width:140px">';
  h += '<option value="math">📐 數學</option><option value="chinese">📝 國文</option>';
  h += '<option value="english">🔤 英文</option><option value="science">🔬 自然</option>';
  h += '<option value="social">🌍 社會</option>';
  h += '</select></div>';
  h += '<div style="margin-top:8px"><label style="font-size:11px;color:var(--mut)">難度</label>';
  h += '<select id="qDiff" class="inp" style="margin-top:4px;width:140px">';
  h += '<option value="1">⭐ 簡單</option><option value="2">⭐⭐ 普通</option>';
  h += '<option value="3">⭐⭐⭐ 困難</option>';
  h += '</select></div>';
  h += '<div style="margin-top:8px"><label style="font-size:11px;color:var(--mut)">題目內容</label>';
  h += '<textarea id="qContent" class="inp" rows="3" style="margin-top:4px;width:100%;resize:vertical" placeholder="輸入題目…"></textarea></div>';
  h += '<div style="margin-top:8px"><label style="font-size:11px;color:var(--mut)">選項（每行一個，或用 | 分隔）</label>';
  h += '<textarea id="qOptions" class="inp" rows="2" style="margin-top:4px;width:100%;resize:vertical" placeholder="A選項|B選項|C選項|D選項"></textarea></div>';
  h += '<div style="margin-top:8px"><label style="font-size:11px;color:var(--mut)">正確答案</label>';
  h += '<input id="qAnswer" class="inp" style="margin-top:4px;width:140px" placeholder="例: A 或 true"></div>';
  h += '<div style="margin-top:8px"><label style="font-size:11px;color:var(--mut)">解析（選填）</label>';
  h += '<textarea id="qExplain" class="inp" rows="2" style="margin-top:4px;width:100%;resize:vertical" placeholder="題目解析…"></textarea></div>';
  h += '<button class="btn gold" onclick="vQuestionAdd()" style="margin-top:10px">➕ 新增題目</button>';
  h += '</div></div>';

  /* 題目列表 */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center">';
  h += '<b style="color:var(--teal);font-size:15px">📚 題目列表</b>';
  h += '<div style="display:flex;gap:6px">';
  h += '<select id="qFilter" class="inp" style="width:100px;font-size:11px" onchange="vQuestionList()">';
  h += '<option value="all">全部</option><option value="math">數學</option><option value="chinese">國文</option>';
  h += '<option value="english">英文</option><option value="science">自然</option><option value="social">社會</option>';
  h += '</select>';
  h += '<button class="btn ghost mini" onclick="vQuestionList()">🔄</button></div></div>';
  h += '<div id="qList" style="margin-top:10px">';
  h += '<div style="color:var(--mut);font-size:12px">載入中…</div>';
  h += '</div></div>';

  /* 統計 */
  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--purple);font-size:15px">📊 題庫統計</b>';
  h += '<div id="qStats" style="margin-top:10px"></div>';
  h += '</div>';

  $('#view').innerHTML = h;
  vQuestionList();
}
window.vQuestion = vQuestion;

function vQuestionAdd() {
  var typeEl = document.getElementById('qType');
  var subjEl = document.getElementById('qSubject');
  var diffEl = document.getElementById('qDiff');
  var contentEl = document.getElementById('qContent');
  var optionsEl = document.getElementById('qOptions');
  var answerEl = document.getElementById('qAnswer');
  var explainEl = document.getElementById('qExplain');
  var content = contentEl ? contentEl.value.trim() : '';
  var options = optionsEl ? optionsEl.value.trim() : '';
  var answer = answerEl ? answerEl.value.trim() : '';
  var explain = explainEl ? explainEl.value.trim() : '';
  if (!content) { toast('⚠️ 請輸入題目', 'bad'); return; }
  if (!answer) { toast('⚠️ 請輸入正確答案', 'bad'); return; }
  var questions = get('bank_questions') || [];
  questions.push({
    id: 'q_' + Date.now(),
    type: typeEl ? typeEl.value : 'choice',
    subject: subjEl ? subjEl.value : 'math',
    difficulty: parseInt(diffEl ? diffEl.value : '1'),
    content: content,
    options: options ? options.split(/[|,\n]/).map(function (s) { return s.trim(); }) : [],
    answer: answer,
    explain: explain,
    ts: Date.now()
  });
  set('bank_questions', questions);
  toast('✅ 題目已新增');
  if (contentEl) contentEl.value = '';
  if (optionsEl) optionsEl.value = '';
  if (answerEl) answerEl.value = '';
  if (explainEl) explainEl.value = '';
  vQuestionList();
}
window.vQuestionAdd = vQuestionAdd;

function vQuestionList() {
  var questions = get('bank_questions') || [];
  var filter = document.getElementById('qFilter');
  var f = filter ? filter.value : 'all';
  if (f !== 'all') questions = questions.filter(function (q) { return q.subject === f; });
  var el = document.getElementById('qList');
  var statsEl = document.getElementById('qStats');
  if (!el) return;

  var subjIcons = { math: '📐', chinese: '📝', english: '🔤', science: '🔬', social: '🌍' };
  var subjNames = { math: '數學', chinese: '國文', english: '英文', science: '自然', social: '社會' };
  var typeNames = { choice: '選擇題', tf: '是非題', fill: '填充題', short: '簡答題' };
  var diffStars = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐' };

  if (!questions.length) {
    el.innerHTML = '<div style="color:var(--mut);font-size:12px;padding:8px 0">尚無題目，請先新增</div>';
  } else {
    var html = '<div style="max-height:400px;overflow-y:auto">';
    for (var i = questions.length - 1; i >= 0 && i >= questions.length - 50; i--) {
      var q = questions[i];
      html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06)">';
      html += '<span style="font-size:16px">' + (subjIcons[q.subject] || '❓') + '</span>';
      html += '<div style="flex:1;font-size:12px">';
      html += '<b>' + (q.content || '').slice(0, 50) + '</b>';
      html += '<div style="color:var(--mut);font-size:11px;margin-top:2px">' + (typeNames[q.type] || q.type) + ' · ' + (diffStars[q.difficulty] || '⭐') + ' · ' + (subjNames[q.subject] || q.subject) + '</div>';
      html += '</div>';
      html += '<button class="btn ghost mini" onclick="vQuestionDel(' + i + ')" style="font-size:10px">🗑️</button>';
      html += '</div>';
    }
    html += '</div>';
    el.innerHTML = html;
  }

  /* 統計 */
  if (statsEl) {
    var all = get('bank_questions') || [];
    var subjs = {};
    all.forEach(function (q) { subjs[q.subject] = (subjs[q.subject] || 0) + 1; });
    var sh = '<div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12px">';
    sh += '<span style="color:var(--gold2)">總計: <b>' + all.length + '</b> 題</span>';
    Object.keys(subjs).forEach(function (s) {
      sh += '<span style="color:var(--mut)">' + (subjIcons[s] || '') + ' ' + (subjNames[s] || s) + ': ' + subjs[s] + '</span>';
    });
    sh += '</div>';
    statsEl.innerHTML = sh;
  }
}
window.vQuestionList = vQuestionList;

function vQuestionDel(idx) {
  var questions = get('bank_questions') || [];
  if (idx < 0 || idx >= questions.length) return;
  questions.splice(idx, 1);
  set('bank_questions', questions);
  toast('🗑️ 題目已刪除');
  vQuestionList();
}
window.vQuestionDel = vQuestionDel;