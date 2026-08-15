/* ═══════════════════════════════════════════════════════════════════════════
 * features/cultivate.js — 修鍊場（按需套件）
 * ----------------------------------------------------------------------------
 * 只有當使用者在導覽點擊「修鍊場」時，core.js 才會下載並執行本檔。
 * 本功能所需 API 僅有：C++ 計算微服務 (8082) 的 /simulate 與 /loot。
 * 其餘功能（組隊、商店…）的程式碼與 API，在進入修鍊場期間完全不載入、不呼叫。
 * ═══════════════════════════════════════════════════════════════════════════ */
module.exports = {
  /* 只依賴 core 提供的 CORE.compute；不引用任何其它功能 */
  mount: function (container, CORE) {
    var SUBJ = {
      "數學": { em: "🧮" }, "國文": { em: "📖" }, "英文": { em: "🔤" },
      "自然": { em: "🔬" }, "社會": { em: "🌏" }, "程式": { em: "💻" }
    };
    var state = { subj: null, diff: 30, ticks: 120 };

    function render() {
      var html = "";
      html += '<div class="card"><h3 class="vt">⚔️ 修鍊場 <span class="vsub">精靈嚮導・一鍵開始（C++ 計算微服務）</span></h3>';
      html += '<div class="muted">選科目 → 拉難度 → 開始修鍊。修鍊過程的戰鬥模擬與掉落，全部交由 <b>C++ 計算微服務</b> 運算。</div>';
      // 科目選擇
      html += '<div class="grid" style="margin-top:12px">';
      Object.keys(SUBJ).forEach(function (s) {
        var sel = state.subj === s ? " sel" : "";
        html += '<div class="pick' + sel + '" data-s="' + s + '"><div class="em">' + SUBJ[s].em + '</div><div class="nm">' + s + '</div></div>';
      });
      html += '</div>';
      // 難度 / 回合
      html += '<div class="card" style="margin-top:14px">';
      html += '<b style="color:var(--teal)">🎯 難度（1~100）</b>';
      html += '<div class="row" style="margin:8px 0"><input type="range" id="cDiff" min="1" max="100" value="' + state.diff + '" oninput="window.__c.diffChg()">';
      html += '<b id="cDiffL" style="color:var(--gold2);min-width:90px"></b></div>';
      html += '<b style="color:var(--teal)">⏱️ 修鍊回合（模擬 tick 數）</b>';
      html += '<div class="row" style="margin:8px 0"><input type="number" id="cTicks" value="' + state.ticks + '" min="10" max="2000" style="width:120px;padding:6px"></div>';
      html += '<button class="btn big" id="cStart" onclick="window.__c.start()">⚔️ 開始修鍊</button>';
      html += '</div>';
      // 歷史
      var hist = readLog();
      if (hist.length) {
        html += '<div class="card"><h3 class="vt">📜 最近修鍊紀錄</h3>';
        html += hist.slice(0, 5).map(function (h) {
          return '<div class="chip">' + CORE.esc(h.subj) + ' · 難度' + h.diff + ' · 傷害' + h.dmg + ' · 擊殺' + h.kills + (h.loot ? ' · 🎁' + h.loot + '件' : '') + '</div>';
        }).join("");
        html += '</div>';
      }
      html += '</div>';
      container.innerHTML = html;

      container.querySelectorAll(".pick").forEach(function (p) {
        p.addEventListener("click", function () { state.subj = p.getAttribute("data-s"); render(); });
      });
      window.__c = {
        diffChg: function () {
          var v = +document.getElementById("cDiff").value;
          state.diff = v;
          document.getElementById("cDiffL").textContent = "Lv." + v;
        },
        start: function () { start(CORE, container, state, render); }
      };
      window.__c.diffChg();
    }

    render();
  }
};

/* ── 與 C++ 計算微服務互動（本功能唯一需要的外部 API）── */
function start(CORE, container, state, rerender) {
  if (!state.subj) { CORE.toast("⚠️ 請先選擇科目", "bad"); return; }
  var ticksEl = document.getElementById("cTicks");
  state.ticks = Math.max(10, Math.min(2000, +(ticksEl && ticksEl.value) || 120));
  var seed = (Date.now() % 1000000) + 1;
  var enemies = Math.max(1, Math.min(60, Math.round(state.diff / 2)));

  container.innerHTML = '<div class="loading">🤖 C++ 計算微服務運算中…<br><span class="muted">模擬 ' + state.ticks + ' 回合 × ' + enemies + ' 敵人</span></div>';

  // 同時呼叫 /simulate 與 /loot（只呼叫 C++ 計算微服務）
  Promise.all([
    CORE.compute("/simulate", { seed: seed, ticks: state.ticks, players: 1, enemies: enemies }),
    CORE.compute("/loot", { count: Math.max(1, Math.round(state.diff / 10)), tier: Math.max(1, Math.round(state.diff / 20)), seed: seed + 7 })
  ]).then(function (rs) {
    return Promise.all([rs[0].json(), rs[1].json()]);
  }).then(function (data) {
    var sim = data[0], loot = data[1];
    var exp = sim.totalDamage || 0;
    var items = (loot && loot.items) || [];
    pushLog({ subj: state.subj, diff: state.diff, dmg: sim.totalDamage, kills: sim.kills, loot: items.length });

    var html = '<div class="card"><h3 class="vt">✅ 修鍊完成 · ' + CORE.esc(state.subj) + ' <span class="vsub">C++ 計算結果</span></h3>';
    html += '<div class="row">';
    html += '<span class="chip">💥 總傷害 <b>' + (sim.totalDamage || 0) + '</b></span>';
    html += '<span class="chip">🗡️ 擊殺 <b>' + (sim.kills || 0) + '</b></span>';
    html += '<span class="chip">⏱️ 存活回合 <b>' + (sim.tickSurvived || 0) + '</b></span>';
    html += '<span class="chip">⭐ 獲得經驗 <b class="ok">+' + exp + '</b></span>';
    html += '</div>';
    if (items.length) {
      html += '<div style="margin-top:12px"><b style="color:var(--teal)">🎁 修鍊掉落</b><div style="margin-top:8px">';
      html += items.map(function (it) {
        return '<span class="loot">【' + CORE.esc(it.slot) + '】' + CORE.esc(it.rarity) + ' · ' + CORE.esc(it.attr) + ' +' + it.value + '</span>';
      }).join("");
      html += '</div></div>';
    } else {
      html += '<div class="muted" style="margin-top:10px">本次沒有掉落。</div>';
    }
    html += '<button class="btn ghost" style="margin-top:14px" onclick="window.__cBack && window.__cBack()">↩ 再修鍊一次</button>';
    html += '</div>';
    container.innerHTML = html;
    window.__cBack = function () { rerender(); };
    CORE.toast("修鍊完成！+" + exp + " 經驗");
  }).catch(function (e) {
    container.innerHTML = '<div class="err">❌ 計算微服務呼叫失敗：' + CORE.esc(e.message) + '<br><span class="muted">請確認 C++ 微服務 (8082) 正在運行。</span><br><button class="btn ghost" onclick="window.__cBack && window.__cBack()">↩ 返回</button></div>';
    window.__cBack = function () { rerender(); };
  });
}

/* ── 修鍊紀錄（僅本機 localStorage）── */
function readLog() {
  try { return JSON.parse(localStorage.getItem("ADV9_CULTIVATE") || "[]"); } catch (e) { return []; }
}
function pushLog(rec) {
  try {
    var a = readLog(); a.unshift(rec);
    if (a.length > 20) a = a.slice(0, 20);
    localStorage.setItem("ADV9_CULTIVATE", JSON.stringify(a));
  } catch (e) {}
}
