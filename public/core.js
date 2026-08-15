/* ═══════════════════════════════════════════════════════════════════════════
 * core.js — adv9 前端共享核心（按需分包的基礎）
 * ----------------------------------------------------------------------------
 * 職責（只做所有功能都要用的事，絕不內含任何遊戲邏輯）：
 *  - 登入 token（ADV9_WTOKEN）讀寫，所有寫入請求帶 x-adv9-token 表頭
 *  - 三個微服務的基底網址：C++ 計算(8082) / Python 自動化(8090) / Java 中繼(8081)
 *  - CORE.loadFeature(key)：進入某功能時，才去下載並執行 features/<key>.js
 *    → 實踐「html 只跑當前需要的」：沒進修鍊場，修鍊場的程式碼根本不下載、不執行
 * 設計：零依賴、純瀏覽器；每個 feature 檔案透過 new Function 隔離作用域。
 * ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var CORE = {};

  /* ── 登入 token（與主遊戲 index.html 共用同一把鑰匙）── */
  CORE.token = (function () {
    try { return localStorage.getItem("ADV9_WTOKEN") || ""; } catch (e) { return ""; }
  })();
  CORE.setToken = function (t) {
    CORE.token = t || "";
    try { if (t) localStorage.setItem("ADV9_WTOKEN", t); else localStorage.removeItem("ADV9_WTOKEN"); } catch (e) {}
  };

  /* ── 微服務基底網址（跨埠，各服務皆已開 CORS *）── */
  CORE.host = location.hostname;
  CORE.calcBase   = "http://" + CORE.host + ":8082"; // C++ 計算微服務
  CORE.autoBase   = "http://" + CORE.host + ":8090"; // Python 自動化微服務
  CORE.coopBase   = "http://" + CORE.host + ":8081"; // Java 即時中繼

  /* ── 通用 fetch 封裝（帶遊戲 token）── */
  CORE.api = function (path, body, opts) {
    opts = opts || {};
    var url = (opts.base || location.origin) + path;
    var hd = { "Content-Type": "application/json" };
    if (CORE.token) hd["x-adv9-token"] = CORE.token;
    return fetch(url, {
      method: opts.method || (body ? "POST" : "GET"),
      headers: hd,
      body: body ? JSON.stringify(body) : undefined
    });
  };
  /* 計算微服務（C++）：CPU 密集的模擬 / 掉落生成 */
  CORE.compute = function (path, body) { return CORE.api(path, body, { base: CORE.calcBase }); };
  /* 自動化微服務（Python）：健康 / 排程任務 */
  CORE.auto = function (path) { return CORE.api(path, null, { base: CORE.autoBase, method: "GET" }); };
  /* 即時中繼（Java） */
  CORE.coop = function (path, body) { return CORE.api(path, body, { base: CORE.coopBase }); };

  /* ── 動態按需載入 feature 套件 ── */
  CORE.cache = {};
  CORE.loadFeature = function (key) {
    if (CORE.cache[key]) return Promise.resolve(CORE.cache[key]);
    return fetch("features/" + key + ".js", { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error("找不到功能套件：" + key);
      return res.text();
    }).then(function (code) {
      var mod = {};
      /* new Function 提供隔離作用域，feature 內的 const/function 不污染全域 */
      var fn = new Function("CORE", "module", "window", code);
      fn(CORE, mod, window);
      CORE.cache[key] = mod.exports || mod;
      return CORE.cache[key];
    });
  };

  /* ── 小工具 ── */
  CORE.el = function (id) { return document.getElementById(id); };
  CORE.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  CORE.toast = function (msg, kind) {
    var t = document.createElement("div");
    t.className = "core-toast " + (kind || "");
    t.textContent = msg;
    (document.body || document.documentElement).appendChild(t);
    setTimeout(function () { t.classList.add("show"); }, 10);
    setTimeout(function () { t.classList.remove("show"); setTimeout(function () { t.remove(); }, 300); }, 2600);
  };

  /* ── 頂部導覽：點擊某功能，才去載入並執行對應套件 ── */
  CORE.nav = function (items, mountId) {
    var bar = CORE.el("nav");
    if (!bar) return;
    bar.innerHTML = items.map(function (it) {
      return '<button class="navbtn" data-key="' + CORE.esc(it.key) + '">' + CORE.esc(it.icon) + " " + CORE.esc(it.label) + "</button>";
    }).join("");
    bar.querySelectorAll(".navbtn").forEach(function (b) {
      b.addEventListener("click", function () {
        var key = b.getAttribute("data-key");
        var mount = CORE.el(mountId || "view");
        // 高亮當前
        bar.querySelectorAll(".navbtn").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        mount.innerHTML = '<div class="loading">⏳ 正在載入「' + CORE.esc(key) + '」套件（僅下載此功能所需程式）…</div>';
        CORE.loadFeature(key).then(function (mod) {
          if (mod && typeof mod.mount === "function") mod.mount(mount, CORE);
          else mount.innerHTML = '<div class="err">套件 ' + CORE.esc(key) + " 未提供 mount()</div>";
        }).catch(function (e) {
          mount.innerHTML = '<div class="err">載入失敗：' + CORE.esc(e.message) + "</div>";
        });
      });
    });
  };

  window.CORE = CORE;
})();
