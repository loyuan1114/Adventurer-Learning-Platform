/* vGuildQuiz — 公會質詢：解釋你的答案 */
const GQ_KEY = 'ADV9_GUILD_QUIZ';
const GQ_MIN_CHARS = 50;
const GQ_PASS_BONUS_AP = 15;
const GQ_FAIL_PENALTY_AP = 5;
const GQ_GUILD_PASS = 20;
const GQ_GUILD_FAIL = -5;

function gqData() {
  return get(GQ_KEY, {
    totalAttempts: 0,
    passCount: 0,
    failCount: 0,
    guildPoints: 0,
    streak: 0,
    bestStreak: 0,
    history: []
  });
}
function gqSave(d) { set(GQ_KEY, d); }

function gqPickQuestion() {
  const solved = get('ADV9_QUIZ_SOLVED', []);
  if (!solved.length) return null;
  const idx = Math.floor(Math.random() * solved.length);
  return solved[idx];
}

function gqCheckExplanation(text, question) {
  const trimmed = text.trim();
  const result = { pass: false, reason: '', score: 0, details: [] };

  if (trimmed.length < GQ_MIN_CHARS) {
    result.reason = '字數不足（需 ' + GQ_MIN_CHARS + ' 字以上，目前 ' + trimmed.length + ' 字）';
    result.details.push({ ok: false, msg: '字數 ' + trimmed.length + '/' + GQ_MIN_CHARS });
    return result;
  }
  result.details.push({ ok: true, msg: '字數 ' + trimmed.length + '/' + GQ_MIN_CHARS });

  const answer = (question.answer || '').replace(/\s+/g, '');
  if (answer.length >= 4) {
    const keywords = answer.split(/[,，、；;]/).filter(w => w.length >= 2);
    for (const kw of keywords) {
      if (trimmed.includes(kw)) {
        result.reason = '⚠️ 包含答案原文「' + kw + '」，請用你自己的話解釋';
        result.details.push({ ok: false, msg: '包含答案原文「' + kw + '」' });
        return result;
      }
    }
    let matchCount = 0;
    const qWords = (question.q || '').replace(/[？?！!。，、]/g, '').split(/\s+/).filter(w => w.length >= 2);
    for (const w of qWords) {
      if (trimmed.includes(w)) matchCount++;
    }
    if (qWords.length > 0) {
      const coverage = matchCount / qWords.length;
      result.score = Math.min(100, Math.round(coverage * 60 + (trimmed.length / GQ_MIN_CHARS) * 40));
    } else {
      result.score = Math.min(100, Math.round((trimmed.length / GQ_MIN_CHARS) * 50 + 50));
    }
  } else {
    result.score = Math.min(100, Math.round((trimmed.length / GQ_MIN_CHARS) * 50 + 50));
  }

  result.details.push({ ok: result.score >= 40, msg: '內容相關度 ' + result.score + '%' });

  result.pass = trimmed.length >= GQ_MIN_CHARS && result.score >= 40;
  if (result.pass) result.reason = '✅ 解釋通過！獲得獎勵';
  else result.reason = '❌ 解釋未通過：' + (result.details.find(d => !d.ok)?.msg || '相關度不足');

  return result;
}

let gqCurrentQuestion = null;
let gqCurrentResult = null;

function gqStart() {
  const u = me(); if (!u || !u.g) return toast('⚠️ 請先登入', 'bad');
  const q = gqPickQuestion();
  if (!q) return toast('❌ 沒有已解答的題目，先去答題吧！', 'bad');
  gqCurrentQuestion = q;
  gqCurrentResult = null;
  vGuildQuiz();
}

function gqSubmit() {
  const u = me(); if (!u || !u.g) return toast('⚠️ 請先登入', 'bad');
  if (!gqCurrentQuestion) return toast('❌ 請先開始質詢', 'bad');
  const input = document.getElementById('gqInput');
  if (!input) return;
  const text = input.value;
  if (!text.trim()) return toast('❌ 請輸入你的解釋', 'bad');

  const result = gqCheckExplanation(text, gqCurrentQuestion);
  gqCurrentResult = result;

  const d = gqData();
  d.totalAttempts++;

  function saveAndRender() {
    d.history = d.history.slice(0, 50);
    gqSave(d);
    vGuildQuiz();
  }

  if (result.pass) {
    d.passCount++;
    d.streak++;
    d.bestStreak = Math.max(d.bestStreak, d.streak);
    d.guildPoints += GQ_GUILD_PASS;
    d.history.unshift({
      q: gqCurrentQuestion.q || '(未知題目)',
      pass: true,
      ts: Date.now(),
      score: result.score
    });
    fetch('/rest/v1/ap/balance', { headers: { 'x-adv9-token': WTOKEN } })
      .then(r => r.json())
      .then(bal => {
        if (bal.ok) {
          fetch('/rest/v1/ap/spend', {
            method: 'POST',
            headers: { 'x-adv9-token': WTOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: -GQ_PASS_BONUS_AP, reason: '公會質詢通過獎勵' })
          }).then(r2 => r2.json()).then(() => {
            toast('🎉 + ' + GQ_PASS_BONUS_AP + ' AP + 公會 +' + GQ_GUILD_PASS + ' 分！');
            saveAndRender();
          }).catch(function(){toast('❌ AP 操作失敗，請稍後重試','bad'); saveAndRender();});
        } else { saveAndRender(); }
      }).catch(function(){toast('❌ AP 操作失敗，請稍後重試','bad'); saveAndRender();});
  } else {
    d.failCount++;
    d.streak = 0;
    d.guildPoints = Math.max(0, d.guildPoints + GQ_GUILD_FAIL);
    d.history.unshift({
      q: gqCurrentQuestion.q || '(未知題目)',
      pass: false,
      ts: Date.now(),
      score: result.score,
      reason: result.reason
    });
    fetch('/rest/v1/ap/balance', { headers: { 'x-adv9-token': WTOKEN } })
      .then(r => r.json())
      .then(bal => {
        if (bal.ok) {
          fetch('/rest/v1/ap/spend', {
            method: 'POST',
            headers: { 'x-adv9-token': WTOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: GQ_FAIL_PENALTY_AP, reason: '公會質詢失敗懲罰' })
          }).then(r2 => r2.json()).then(() => {
            toast('💀 失敗反噬！- ' + GQ_FAIL_PENALTY_AP + ' AP，公會 -' + Math.abs(GQ_GUILD_FAIL) + ' 分');
            saveAndRender();
          }).catch(function(){toast('❌ AP 操作失敗，請稍後重試','bad'); saveAndRender();});
        } else { saveAndRender(); }
      }).catch(function(){toast('❌ AP 操作失敗，請稍後重試','bad'); saveAndRender();});
  }
}

function gqRenderLeaderboard() {
  const u = me();
  const myPts = gqData().guildPoints;
  const entries = get('ADV9_GUILD_LEADERBOARD', []);

  let h = '<div class="panel2" style="margin-top:14px">';
  h += '<b style="color:var(--gold2)">🏆 公會貢獻排行</b>';
  h += '<div style="margin-top:8px">';
  if (!entries.length) {
    h += '<div style="color:var(--mut);font-size:12px">尚無排行資料</div>';
  } else {
    h += '<div style="display:grid;grid-template-columns:30px 1fr 60px;gap:4px;font-size:13px">';
    entries.sort((a, b) => b.points - a.points).slice(0, 10).forEach((e, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1);
      const isMe = u && e.name === u.name;
      h += '<span style="' + (isMe ? 'color:var(--gold2);font-weight:700' : '') + '">' + medal + '</span>';
      h += '<span style="' + (isMe ? 'color:var(--gold2);font-weight:700' : '') + '">' + esc(e.name) + '</span>';
      h += '<span style="text-align:right;color:var(--teal)">' + e.points + ' pt</span>';
    });
    h += '</div>';
  }
  h += '</div></div>';
  return h;
}

function gqUpdateLeaderboard() {
  const u = me(); if (!u) return;
  const entries = get('ADV9_GUILD_LEADERBOARD', []);
  const idx = entries.findIndex(e => e.name === u.name);
  const d = gqData();
  if (idx >= 0) {
    entries[idx].points = d.guildPoints;
    entries[idx].attempts = d.totalAttempts;
  } else {
    entries.push({ name: u.name, points: d.guildPoints, attempts: d.totalAttempts });
  }
  set('ADV9_GUILD_LEADERBOARD', entries);
}

function vGuildQuiz() {
  const u = me(); if (!u) return toast('⚠️ 請先登入', 'bad');
  const d = gqData();
  gqUpdateLeaderboard();

  let h = back() + '<h3 class="vt">⚔️ 公會質詢 <span class="vsub">領地戰・解釋你的答案</span></h3>';

  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:12px">';
  h += '<div class="panel2" style="text-align:center;padding:12px">';
  h += '<div style="font-size:11px;color:var(--mut)">質詢次數</div>';
  h += '<div style="font-size:24px;font-weight:900;color:var(--teal);margin-top:4px">' + d.totalAttempts + '</div></div>';
  h += '<div class="panel2" style="text-align:center;padding:12px">';
  h += '<div style="font-size:11px;color:var(--mut)">通過率</div>';
  h += '<div style="font-size:24px;font-weight:900;color:#4caf50;margin-top:4px">' + (d.totalAttempts ? Math.round(d.passCount / d.totalAttempts * 100) : 0) + '%</div></div>';
  h += '<div class="panel2" style="text-align:center;padding:12px">';
  h += '<div style="font-size:11px;color:var(--mut)">公會積分</div>';
  h += '<div style="font-size:24px;font-weight:900;color:var(--gold2);margin-top:4px">' + d.guildPoints + '</div></div>';
  h += '<div class="panel2" style="text-align:center;padding:12px">';
  h += '<div style="font-size:11px;color:var(--mut)">連續通過</div>';
  h += '<div style="font-size:24px;font-weight:900;color:#ff9800;margin-top:4px">' + d.streak + '</div></div>';
  h += '</div>';

  if (!gqCurrentQuestion) {
    h += '<div class="panel2" style="margin-top:14px;text-align:center">';
    h += '<div style="font-size:40px">⚔️</div>';
    h += '<b style="display:block;margin:8px 0;color:var(--gold2)">準備開始公會質詢</b>';
    h += '<div class="skTxt">系統會隨機抽取一道你已解答的題目，你需要用自己的話解釋答案。</div>';
    h += '<div class="skTxt" style="margin-top:6px">⚠️ 不得直接複製答案原文，否則判定失敗</div>';
    h += '<button class="btn gold" style="margin-top:14px" onclick="gqStart()">⚔️ 開始質詢</button>';
    h += '</div>';
  } else {
    h += '<div class="panel2" style="margin-top:14px">';
    h += '<b style="color:var(--gold2)">📝 題目</b>';
    h += '<div style="margin-top:8px;padding:10px;background:rgba(255,255,255,.04);border-radius:8px;font-size:13px">';
    h += esc(gqCurrentQuestion.q || '(無題目)');
    h += '</div>';

    if (gqCurrentQuestion.hint) {
      h += '<div style="margin-top:6px;font-size:11px;color:var(--mut)">💡 提示：' + esc(gqCurrentQuestion.hint) + '</div>';
    }

    if (gqCurrentResult) {
      const r = gqCurrentResult;
      h += '<div style="margin-top:12px;padding:10px;border-radius:8px;border:1px solid ' + (r.pass ? '#4caf50' : '#ef5350') + ';background:' + (r.pass ? 'rgba(76,175,80,.1)' : 'rgba(239,83,80,.1)') + '">';
      h += '<b style="color:' + (r.pass ? '#4caf50' : '#ef5350') + '">' + r.reason + '</b>';
      h += '<div style="margin-top:6px">';
      r.details.forEach(d => {
        h += '<div style="font-size:12px;color:' + (d.ok ? '#4caf50' : '#ef5350') + '">' + (d.ok ? '✅' : '❌') + ' ' + esc(d.msg) + '</div>';
      });
      h += '</div>';
      h += '<div style="font-size:12px;margin-top:4px;color:var(--mut)">評分：' + r.score + '/100</div>';
      h += '</div>';

      h += '<button class="btn gold" style="margin-top:12px;width:100%" onclick="gqStart()">🔄 再次質詢</button>';
    } else {
      h += '<textarea id="gqInput" class="inp" rows="5" placeholder="用你自己的話解釋這道題目的答案（至少 ' + GQ_MIN_CHARS + ' 字）" style="margin-top:10px;width:100%;box-sizing:border-box"></textarea>';
      h += '<button class="btn" style="margin-top:10px;width:100%;background:linear-gradient(135deg,#1565c0,#0d47a1);border-color:#1976d2" onclick="gqSubmit()">📤 提交解釋</button>';
    }
    h += '</div>';
  }

  h += '<div class="panel2" style="margin-top:14px">';
  h += '<b style="color:var(--gold2)">📋 質詢規則</b>';
  h += '<div style="margin-top:8px;font-size:12px;color:var(--mut)">';
  h += '<div>✅ 字數 ≥ ' + GQ_MIN_CHARS + ' 字 → 通過</div>';
  h += '<div>✅ 包含與題目相關的關鍵詞 → 加分</div>';
  h += '<div>❌ 直接複製答案原文 → 失敗</div>';
  h += '<div>❌ 字數不足 → 失敗</div>';
  h += '<div style="margin-top:6px;font-size:11px">通過：+' + GQ_PASS_BONUS_AP + ' AP + 公會 +' + GQ_GUILD_PASS + ' 分</div>';
  h += '<div style="font-size:11px">失敗：-' + GQ_FAIL_PENALTY_AP + ' AP（魔法反噬）+ 公會 ' + GQ_GUILD_FAIL + ' 分</div>';
  h += '</div></div>';

  h += gqRenderLeaderboard();

  h += '<div class="panel2" style="margin-top:14px">';
  h += '<b style="color:var(--gold2)">📜 質詢紀錄</b>';
  h += '<div style="max-height:200px;overflow-y:auto;margin-top:8px">';
  if (!d.history.length) {
    h += '<div style="color:var(--mut);font-size:12px">尚無紀錄</div>';
  } else {
    d.history.slice(0, 20).forEach((rec, i) => {
      const time = rec.ts ? new Date(rec.ts).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '';
      h += '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05)">';
      h += '<span>' + (rec.pass ? '✅' : '❌') + '</span>';
      h += '<span style="flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(rec.q) + '</span>';
      h += '<span style="font-size:11px;color:var(--mut)">' + time + '</span>';
      h += '<span style="font-size:11px;color:' + (rec.pass ? '#4caf50' : '#ef5350') + '">' + rec.score + '</span>';
      h += '</div>';
    });
  }
  h += '</div></div>';

  $('#view').innerHTML = h;
}

window.vGuildQuiz = vGuildQuiz;
window.gqStart = gqStart;
window.gqSubmit = gqSubmit;
