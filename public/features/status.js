/* ═══════════════════════════════════════════════════════════════════════════
 * features/status.js — 服務狀態（按需套件）
 * ----------------------------------------------------------------------------
 * 只有點擊「服務狀態」才載入。本功能只需呼叫各微服務的 /healthz，
 * 用來展示「按語言分工」的架構：Java=併發中繼 / Python=自動化 / C++=計算。
 * ═══════════════════════════════════════════════════════════════════════════ */
module.exports = {
  mount: function (container, CORE) {
    var cards = [
      { name: "主遊戲 (Node)",        base: location.origin,      path: "/",            lang: "Node.js", role: "遊戲主程式 / 靜態檔 / 帳號" },
      { name: "併發中繼 (Java)",      base: CORE.coopBase,       path: "/healthz",     lang: "Java 21", role: "虛擬執行緒即時中繼（組隊）" },
      { name: "自動化 (Python)",      base: CORE.autoBase,       path: "/healthz",     lang: "Python",  role: "定時/背景任務（清 token/報表/ping）" },
      { name: "計算 (C++)",           base: CORE.calcBase,       path: "/healthz",     lang: "C++",     role: "CPU 密集計算（修鍊場模擬/掉落）" }
    ];

    container.innerHTML = '<div class="card"><h3 class="vt">📊 服務狀態 <span class="vsub">按語言分工的微服務架構</span></h3>' +
      '<div class="muted">每項服務獨立監聽埠、systemd Restart=always。下方即時探活：</div>' +
      '<div id="stWrap" style="margin-top:12px"></div></div>';

    var wrap = document.getElementById("stWrap");
    wrap.innerHTML = cards.map(function () { return '<div class="loot" style="display:block;margin:8px 0;opacity:.5">探活中…</div>'; }).join("");

    cards.forEach(function (c, i) {
      CORE.api(c.path, null, { base: c.base, method: "GET" }).then(function (r) {
        var ok = r.status >= 200 && r.status < 400;
        var cls = ok ? "ok" : "bad";
        wrap.children[i].innerHTML =
          '<b>' + CORE.esc(c.name) + '</b> <span class="' + cls + '">● ' + (ok ? "運行中" : "異常 " + r.status) + '</span><br>' +
          '<span class="muted">' + CORE.esc(c.lang) + ' · ' + CORE.esc(c.role) + '</span><br>' +
          '<span class="muted">' + CORE.esc(c.base + c.path) + '</span>';
        wrap.children[i].style.opacity = "1";
      }).catch(function (e) {
        wrap.children[i].innerHTML =
          '<b>' + CORE.esc(c.name) + '</b> <span class="bad">● 無法連線</span><br>' +
          '<span class="muted">' + CORE.esc(c.lang) + ' · ' + CORE.esc(c.role) + '</span><br>' +
          '<span class="muted">' + CORE.esc(c.base + c.path) + '</span><br>' +
          '<span class="bad">' + CORE.esc(e.message) + '</span>';
        wrap.children[i].style.opacity = "1";
      });
    });
  }
};
