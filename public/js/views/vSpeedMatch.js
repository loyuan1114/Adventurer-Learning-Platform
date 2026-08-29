/* vSpeedMatch — 速配對戰 */
function vSpeedMatch() {
  var u = me(); if (!u) return;
  var g = u.g;
  var records = g.speedMatchLogs || [];
  var wins = records.filter(function(r) { return r.win; }).length;

  var h = back() + '<h3 class="vt">⚡ 速配對戰 <span class="vsub">即時PK・限時答題・快速匹配</span></h3>';

  h += '<div class="panel2" style="margin-top:12px;text-align:center">';
  h += '<div style="font-size:48px;animation:bob 2s infinite">⚡</div>';
  h += '<b style="font-family:var(--serif);color:var(--gold2);font-size:20px;display:block;margin:8px 0">速配對戰</b>';
  h += '<div style="font-size:13px;color:var(--mut)">限時 30 秒，答對越多分數越高！</div>';
  h += '<div style="display:flex;gap:12px;justify-content:center;margin-top:12px">';
  h += '<div class="chip">🏆 勝場：' + wins + '</div>';
  h += '<div class="chip">📊 總場：' + records.length + '</div>';
  h += '<div class="chip">⭐ 最高分：' + (g.speedMatchBest || 0) + '</div>';
  h += '</div></div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--teal);font-size:15px">🎮 選擇模式</b>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:10px">';
  var modes = [
    { id: 'math', name: '數學速算', icon: '🧮', desc: '加減乘除快速計算', color: '#2196f3', difficulty: 'normal' },
    { id: 'word', name: '英文單字', icon: '🔤', desc: '單字翻譯與拼寫', color: '#4caf50', difficulty: 'normal' },
    { id: 'science', name: '科學常識', icon: '🔬', desc: '自然科學知識問答', color: '#ff9800', difficulty: 'hard' },
    { id: 'history', name: '歷史挑戰', icon: '📜', desc: '中外歷史事件', color: '#e91e63', difficulty: 'hard' },
    { id: 'mix', name: '混合挑戰', icon: '🎯', desc: '隨機題目混戰', color: '#9c27b0', difficulty: 'extreme' }
  ];
  modes.forEach(function(m) {
    h += '<div class="panel2" style="cursor:pointer;padding:14px;text-align:center;border-left:4px solid ' + m.color + '" onclick="speedMatchStart(\'' + m.id + '\')">';
    h += '<div style="font-size:32px">' + m.icon + '</div>';
    h += '<b style="font-family:var(--serif);color:var(--gold2);font-size:14px;display:block;margin-top:4px">' + m.name + '</b>';
    h += '<div style="font-size:11px;color:var(--mut)">' + m.desc + '</div>';
    h += '<div class="chip" style="margin-top:6px;font-size:10px">' + m.difficulty + '</div>';
    h += '</div>';
  });
  h += '</div></div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--purple);font-size:14px">📊 對戰紀錄</b>';
  if (records.length) {
    h += '<div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">';
    records.slice(-8).reverse().forEach(function(r) {
      var diffColors = { normal: '#2196f3', hard: '#ff9800', extreme: '#e91e63' };
      h += '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(0,0,0,.1);border-radius:6px">';
      h += '<span style="font-size:16px">' + (r.win ? '🏆' : '💥') + '</span>';
      h += '<div style="flex:1;font-size:12px"><b>' + (r.mode || '未知') + '</b> <span style="color:var(--mut)">' + (r.correct || 0) + ' 題對</span></div>';
      h += '<span style="font-size:14px;font-weight:900;color:' + (r.win ? 'var(--gold2)' : '#e91e63') + '">' + (r.score || 0) + ' 分</span>';
      h += '<span style="font-size:10px;color:var(--mut)">' + new Date(r.ts).toLocaleTimeString() + '</span>';
      h += '</div>';
    });
    h += '</div>';
  } else {
    h += '<div class="empty" style="margin-top:8px">尚無對戰紀錄</div>';
  }
  h += '</div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--gold2);font-size:14px">📖 速配規則</b>';
  h += '<div class="skTxt" style="margin-top:6px">';
  h += '限時 30 秒內盡可能答對更多題目。答對一題 +10 分，連對加成最高 +5。答錯扣除連對加成。難度越高題目越難但基礎分數不變。每場對戰消耗 5 點體力。排行榜顯示今日最高分。</div></div>';

  $('#view').innerHTML = h;
}

function speedMatchStart(mode) {
  var u = me(), g = u.g;
  if ((g.stamina || 100) < 5) return toast('⚠️ 體力不足（需 5）', 'bad');
  g.stamina -= 5;
  set(LS.users, get(LS.users, []));

  var questions = speedMatchGenQuestions(mode);
  var current = 0;
  var score = 0;
  var correct = 0;
  var streak = 0;
  var timeLeft = 30;

  function render() {
    if (current >= questions.length || timeLeft <= 0) {
      var win = correct >= Math.ceil(questions.length * 0.6);
      var best = g.speedMatchBest || 0;
      if (score > best) g.speedMatchBest = score;
      g.speedMatchLogs = g.speedMatchLogs || [];
      g.speedMatchLogs.push({ mode: mode, score: score, correct: correct, total: questions.length, win: win, ts: Date.now() });
      if (g.speedMatchLogs.length > 30) g.speedMatchLogs = g.speedMatchLogs.slice(-30);
      if (win) { g.gold = (g.gold || 0) + score; g.exp = (g.exp || 0) + Math.round(score * 0.5); }
      set(LS.users, get(LS.users, []));
      var resH = '<div style="text-align:center;padding:20px">';
      resH += '<div style="font-size:60px">' + (win ? '🏆' : '💪') + '</div>';
      resH += '<b style="font-family:var(--serif);color:var(--gold2);font-size:20px;display:block;margin:12px 0">' + (win ? '勝利！' : '再接再厲！') + '</b>';
      resH += '<div style="font-size:36px;font-weight:900;color:var(--teal)">' + score + ' 分</div>';
      resH += '<div class="skTxt" style="margin-top:8px">答對 ' + correct + '/' + questions.length + ' 題</div>';
      if (win) resH += '<div class="chip" style="margin-top:8px">+' + score + ' 金幣 +' + Math.round(score * 0.5) + ' 經驗</div>';
      resH += '<div class="mBtns" style="margin-top:16px"><button class="btn teal" onclick="closeModal();vSpeedMatch()">再來一場</button><button class="btn ghost" onclick="closeModal()">返回</button></div></div>';
      openModal(resH);
      return;
    }
    var q = questions[current];
    var h = '<div style="padding:16px">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">';
    h += '<div class="chip">⏱ ' + timeLeft + 's</div>';
    h += '<div class="chip">' + (current + 1) + '/' + questions.length + '</div>';
    h += '<div class="chip" style="color:var(--gold2);font-weight:900">' + score + ' 分</div>';
    h += '</div>';
    h += '<div style="background:rgba(0,0,0,.2);border-radius:8px;height:6px;overflow:hidden;margin-bottom:16px">';
    h += '<div id="smTimer" style="height:100%;width:100%;background:linear-gradient(90deg,var(--teal),var(--gold2));border-radius:8px;transition:width 1s linear"></div></div>';
    h += '<b style="font-size:16px;display:block;margin-bottom:12px;color:var(--gold2)">' + esc(q.q) + '</b>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    q.opts.forEach(function(opt, i) {
      h += '<button class="btn" style="text-align:left;padding:12px" onclick="speedMatchAnswer(' + i + ')">' + opt + '</button>';
    });
    h += '</div>';
    h += '<div id="smFeedback" style="margin-top:12px;text-align:center;font-size:14px;font-weight:700"></div>';
    h += '</div>';
    openModal(h);
  }

  window._smQuestions = questions;
  window._smScore = function() { return score; };
  window._smCorrect = function() { return correct; };
  window._smStreak = function() { return streak; };
  window._smRender = render;

  window.speedMatchAnswer = function(idx) {
    var q = questions[current];
    var fb = document.getElementById('smFeedback');
    if (idx === q.ans) {
      streak++;
      correct++;
      score += 10 + Math.min(streak * 2, 10);
      if (fb) { fb.textContent = '✅ 正確！+' + (10 + Math.min(streak * 2, 10)) + '分'; fb.style.color = 'var(--green)'; }
    } else {
      streak = 0;
      if (fb) { fb.textContent = '❌ 答錯！正確答案：' + q.opts[q.ans]; fb.style.color = '#e91e63'; }
    }
    current++;
    setTimeout(render, 800);
  };

  var timer = setInterval(function() {
    timeLeft--;
    var bar = document.getElementById('smTimer');
    if (bar) bar.style.width = Math.max(0, timeLeft / 30 * 100) + '%';
    var chip = document.querySelector('.chip');
    if (chip) chip.textContent = '⏱ ' + timeLeft + 's';
    if (timeLeft <= 0) {
      clearInterval(timer);
      render();
    }
  }, 1000);

  window._smTimer = timer;
  render();
}

function speedMatchGenQuestions(mode) {
  var qs = [];
  var types = {
    math: function() {
      var a = Math.floor(Math.random() * 20) + 1;
      var b = Math.floor(Math.random() * 20) + 1;
      var ops = ['+', '-', '×'];
      var op = ops[Math.floor(Math.random() * ops.length)];
      var ans;
      if (op === '+') ans = a + b;
      else if (op === '-') ans = a - b;
      else ans = a * b;
      var opts = [ans];
      while (opts.length < 4) {
        var fake = ans + Math.floor(Math.random() * 10) - 5;
        if (fake !== ans && opts.indexOf(fake) < 0) opts.push(fake);
      }
      opts.sort(function() { return Math.random() - 0.5; });
      return { q: a + ' ' + op + ' ' + b + ' = ?', opts: opts.map(String), ans: opts.indexOf(ans) };
    },
    word: function() {
      var words = [
        { en: 'abundant', zh: '豐富的' }, { en: 'benevolent', zh: '仁慈的' }, { en: 'contemplate', zh: '沉思' },
        { en: 'diligent', zh: '勤奮的' }, { en: 'eloquent', zh: '雄辯的' }, { en: 'fortify', zh: '加強' },
        { en: 'generous', zh: '慷慨的' }, { en: 'harmonious', zh: '和諧的' }, { en: 'innovative', zh: '創新的' },
        { en: 'jubilant', zh: '歡欣的' }, { en: 'kinetic', zh: '動力的' }, { en: 'luminous', zh: '發光的' }
      ];
      var w = words[Math.floor(Math.random() * words.length)];
      var opts = [w.zh];
      while (opts.length < 4) {
        var fake = words[Math.floor(Math.random() * words.length)].zh;
        if (opts.indexOf(fake) < 0) opts.push(fake);
      }
      opts.sort(function() { return Math.random() - 0.5; });
      return { q: '「' + w.en + '」的中文意思是？', opts: opts, ans: opts.indexOf(w.zh) };
    },
    science: function() {
      var items = [
        { q: '水的化學式是？', a: 'H2O', o: ['H2O', 'CO2', 'NaCl', 'O2'] },
        { q: '地球繞太陽一圈約幾天？', a: '365', o: ['365', '30', '24', '100'] },
        { q: '人體最大的器官是？', a: '皮膚', o: ['皮膚', '肝臟', '心臟', '大腦'] },
        { q: '光速約為每秒幾公里？', a: '30萬', o: ['30萬', '3萬', '300萬', '3000'] },
        { q: 'DNA的全名是？', a: '去氧核糖核酸', o: ['去氧核糖核酸', '核糖核酸', '胺基酸', '脂肪酸'] }
      ];
      var item = items[Math.floor(Math.random() * items.length)];
      var opts = item.o.slice();
      opts.sort(function() { return Math.random() - 0.5; });
      return { q: item.q, opts: opts, ans: opts.indexOf(item.a) };
    },
    history: function() {
      var items = [
        { q: '中華民國建國於哪一年？', a: '1912', o: ['1912', '1945', '1895', '1900'] },
        { q: '第二次世界大戰結束於？', a: '1945', o: ['1945', '1939', '1918', '1950'] },
        { q: '工業革命起源於哪個國家？', a: '英國', o: ['英國', '法國', '德國', '美國'] },
        { q: '孔子是哪個學派的創始人？', a: '儒家', o: ['儒家', '道家', '法家', '墨家'] },
        { q: '鄭和下西洋發生在哪个朝代？', a: '明朝', o: ['明朝', '清朝', '唐朝', '宋朝'] }
      ];
      var item = items[Math.floor(Math.random() * items.length)];
      var opts = item.o.slice();
      opts.sort(function() { return Math.random() - 0.5; });
      return { q: item.q, opts: opts, ans: opts.indexOf(item.a) };
    }
  };

  var gen = types[mode] || types.math;
  for (var i = 0; i < 10; i++) qs.push(gen());
  return qs;
}
window.vSpeedMatch = vSpeedMatch;
