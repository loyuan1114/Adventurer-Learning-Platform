#!/usr/bin/env node
/* smoke_test.js — 語言自學 v3.0 功能冒煙測試（Node + DOM stub）
   用法：node tools/build/smoke_test.js（需先 unify 產生 merged index.html） */
const fs = require('fs');
const vm = require('vm');

// ---- DOM/環境 stub ----
const store = {};
const mkEl = () => ({ innerHTML: '', style: { setProperty() {}, removeProperty() {} }, value: '', classList: { add() {}, remove() {}, contains: () => false }, appendChild() {}, remove() {}, setAttribute() {}, getAttribute: () => null, focus() {}, click() {}, addEventListener() {}, removeEventListener() {}, dataset: {}, scrollIntoView() {}, getBoundingClientRect: () => ({ width: 0, height: 0 }) });
const documentStub = {
  getElementById: () => mkEl(),
  querySelectorAll: () => [],
  querySelector: () => mkEl(),
  createElement: () => mkEl(),
  createElementNS: () => mkEl(),
  documentElement: mkEl(),
  head: { appendChild() {} },
  body: { appendChild() {} },
  addEventListener() {},
  cookie: ''
};
const sandbox = {
  console, setTimeout, clearTimeout, setInterval, clearInterval,
  Date, Math, JSON, Promise, RegExp, String, Number, Boolean, Array, Object,
  parseInt, parseFloat, isNaN, encodeURIComponent, decodeURIComponent,
  document: documentStub,
  window: null,
  location: { origin: 'http://localhost', href: '', pathname: '/' },
  navigator: { userAgent: 'smoke', onLine: true },
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) }, removeItem: k => { delete store[k] } },
  sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  fetch: async () => ({ ok: true, status: 200, json: async () => ({}) }),
  XMLHttpRequest: function () { this.open = () => {}; this.send = () => {}; this.setRequestHeader = () => {}; this.status = 200; this.responseText = '[]'; },
  Audio: function () {},
  Image: function () {},
  alert() {}, confirm: () => true, prompt: () => null,
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  addEventListener() {}, removeEventListener() {},
  URLSearchParams: class { constructor() {} get() { return null } set() {} toString() { return '' } append() {} },
  FormData: class { append() {} },
  Blob: class { constructor() {} },
  FileReader: class { readAsDataURL() {} },
  requestAnimationFrame: () => 0, cancelAnimationFrame: () => {},
  TextEncoder: class { encode(s) { return Buffer.from(String(s), 'utf8') } },
  TextDecoder: class { decode(b) { return Buffer.from(b || []).toString('utf8') } },
  performance: { now: () => Date.now() },
  atob: s => Buffer.from(String(s), 'base64').toString('binary'),
  btoa: s => Buffer.from(String(s), 'binary').toString('base64'),
  AbortController: class { constructor() { this.signal = {} } abort() {} },
  CustomEvent: class { constructor(type) { this.type = type } },
  crypto: { getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); return a } },
  MutationObserver: class { observe() {} disconnect() {} },
  IntersectionObserver: class { observe() {} disconnect() {} },
  structuredClone: o => JSON.parse(JSON.stringify(o)),
  Notification: function () {}
};
sandbox.window = sandbox;
vm.createContext(sandbox);

// me() 是主腳本詞法作用域的 const（無法從 sandbox 覆寫），
// 改由預置 localStorage session + 本機帳號，讓真實 me() 回傳使用者
store['ADV9_SES'] = JSON.stringify({ local: true, u: 'tester' });
store['ADV9_LOCAL'] = JSON.stringify([{
  id: 1, username: 'tester', pass: 'x', localOnly: true,
  g: { stats: {}, gold: 0, crystal: 0, xp: 0, lv: 1, needXp: 100, combo: 0, maxCombo: 0, weekly: { wk: 'x', n: 0, claimed: false } },
  prof: {}
}]);

// ---- 讀 merged index.html 主腳本（script #3 = 主要外殼）----
const html = fs.readFileSync('public/index.html', 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
if (scripts.length < 3) { console.log('✖ 找不到主腳本'); process.exit(1); }

let errors = 0;
const RESULT = [];
const log = s => { RESULT.push(s); console.log(s); };
const test = (name, fn) => {
  try { fn(); log('  ✓ ' + name); }
  catch (e) { errors++; log('  ✖ ' + name + ' → ' + e.message); }
};

try {
  // script #1 = 共用層（loader+shared：CHARS/POOLS 等，主外殼頂層會引用），
  // script #2 = 雲端層（config），script #3 = 主外殼；匯出器附加在 script #3 尾部，
  // 讓測試能讀到該腳本詞法作用域的 const（LANG_DATA/LANG_REGIONS/LQ）
  const main = scripts[2] + '\n;this.LANG_DATA=LANG_DATA;this.LANG_REGIONS=LANG_REGIONS;this.LQ=LQ;';
  vm.runInContext(scripts[0], sandbox, { timeout: 10000 });
  vm.runInContext(scripts[1], sandbox, { timeout: 10000 });
  vm.runInContext(main, sandbox, { timeout: 10000 });
  console.log('✓ 主腳本執行無 SyntaxError');
} catch (e) {
  // 執行期錯誤（DOM stub 不完全）容忍，只要不是語法/宣告層級
  console.log('⚠ 主腳本執行期拋錯（stub 容忍）: ' + e.message.slice(0, 120));
}
if (typeof sandbox.esc !== 'function') sandbox.esc = x => String(x);
console.log('DEBUG export LANG_DATA:', typeof sandbox.LANG_DATA, '| LQ:', typeof sandbox.LQ, '| langName:', typeof sandbox.langName);

const s = sandbox;
const { LANG_DATA, LANG_REGIONS, langName, langFind, langPref, setLangPref, langG, langStatsHtml, setLangGrid, LQ } = s;

test('LANG_DATA 已定義且含 8 區、203 語言', () => {
  if (!LANG_DATA) throw new Error('LANG_DATA undefined');
  const regions = Object.keys(LANG_DATA);
  if (regions.length < 8) throw new Error('區域數 ' + regions.length);
  const codes = new Set();
  for (const r of regions) for (const x of LANG_DATA[r]) codes.add(x[0]);
  if (codes.size < 200) throw new Error('語言數 ' + codes.size);
});

test('LANG_REGIONS 8 區', () => {
  if (!LANG_REGIONS || LANG_REGIONS.length < 8) throw new Error('LANG_REGIONS=' + LANG_REGIONS);
});

test('langName(ja)=日語、langName(en)=英語、langName(xx)=原樣', () => {
  if (langName('ja') !== '日語') throw new Error('ja→' + langName('ja'));
  if (langName('en') !== '英語') throw new Error('en→' + langName('en'));
  if (langName('zzz') !== 'zzz') throw new Error('zzz→' + langName('zzz'));
});

test('langFind 搜尋「英」命中 English/英語', () => {
  const r = langFind('英');
  if (!r.length) throw new Error('無結果');
  if (!r.some(x => x[1] === 'en')) throw new Error('找不到 en');
});

test('langFind 空白 = 全部 203', () => {
  if (langFind('').length < 200) throw new Error('只有 ' + langFind('').length);
});

// ---- 補上環境函式 stub（function 宣告可直接覆寫全域）；saveU 讓真實版執行以寫回 store ----
sandbox.toast = () => {};
sandbox.hud = () => {};
sandbox.vSet = () => {};

test('langPref() 預設空字串', () => {
  if (langPref() !== '') throw new Error('langPref=' + langPref());
});

test('setLangPref(ja) 寫入 prof.langPref', () => {
  setLangPref('ja');
  const u = vm.runInContext('me()', sandbox);
  if (!u || u.prof.langPref !== 'ja') throw new Error('未寫入');
});

test('langG(g) 初始化 stats.lang', () => {
  const g = { stats: {} };
  const L = langG(g);
  L.ja = { t: 5, c: 4 };
  if (g.stats.lang.ja.t !== 5) throw new Error('langG 未作用');
});

test('langStatsHtml 有資料時輸出排名與正確率', () => {
  const g = { stats: { lang: { ja: { t: 10, c: 8 }, en: { t: 5, c: 3 } } } };
  const h = langStatsHtml(g);
  if (!h.includes('15')) throw new Error('總題數錯誤: ' + h.slice(0, 80));
  if (!h.includes('日語')) throw new Error('缺語言名');
});

test('langStatsHtml 無資料時提示', () => {
  const h = langStatsHtml({ stats: {} });
  if (!h.includes('還沒開始')) throw new Error(h);
});

test('setLangGrid 渲染語言按鈕（需 document stub）', () => {
  const els = {};
  sandbox.document.getElementById = id => els[id] || (els[id] = { innerHTML: '' });
  setLangGrid('日');
  if (!els.setLangGrid) throw new Error('未存取 setLangGrid 元素');
  if (!els.setLangGrid.innerHTML.includes('日語')) throw new Error('渲染內容缺日語');
});

test('langSettle 答對：1.3x 獎勵 + recordAns（stats.lang 計數在 langPick）', () => {
  const g = { stats: {}, gold: 100, crystal: 10, diamond: 0, xp: 0, combo: 0, maxCombo: 0, lv: 1, needXp: 100, weekly: { wk: 'x', n: 0, claimed: false } };
  sandbox.recordAns = (gg, ok, d, subj) => { gg.stats.total = (gg.stats.total || 0) + 1; if (ok) gg.stats.correct = (gg.stats.correct || 0) + 1; };
  sandbox.grantExp = (gg, diff, retry, subj) => { const xp = diff >= 70 ? 30 : diff >= 40 ? 20 : 10; gg.xp += xp; return xp; };
  sandbox.grantRew = (gg, diff, combo) => { const r = { crystal: 1, gold: 10, diamond: 0 }; gg.crystal += r.crystal; gg.gold += r.gold; gg.diamond += r.diamond; return r; };
  sandbox.addCombo = gg => { gg.combo++; gg.maxCombo = Math.max(gg.maxCombo, gg.combo); };
  sandbox.resetCombo = gg => { gg.combo = 0; };
  sandbox.effMaxLv = () => 99;
  sandbox.titleOf = lv => 'Lv.' + lv;
  LQ.code = 'ja'; LQ.diff = 45;
  const R = s.langSettle(g, true);
  if (R.exp !== 26) throw new Error('exp 應為 20*1.3=26，得到 ' + R.exp);
  if (R.au !== 13) throw new Error('金幣應為 10*1.3=13，得到 ' + R.au);
  if (R.cr !== 1) throw new Error('水晶 1*1.3 取 floor=1，得到 ' + R.cr);
  if (g.stats.total !== 1 || g.stats.correct !== 1) throw new Error('recordAns 未計數');
  if (g.xp !== 26 || g.gold !== 113 || g.crystal !== 11) throw new Error('實際加值錯誤 xp=' + g.xp + ' gold=' + g.gold + ' cr=' + g.crystal);
});

test('langSettle 答錯：combo 重置、不給獎勵', () => {
  const g = { stats: {}, gold: 100, crystal: 10, diamond: 0, xp: 0, combo: 5, maxCombo: 5, lv: 1, needXp: 100, weekly: { wk: 'x', n: 0, claimed: false } };
  sandbox.recordAns = (gg, ok) => { gg.stats.total = (gg.stats.total || 0) + 1; gg.stats.correct = (gg.stats.correct || 0); if (ok) gg.stats.correct++; };
  sandbox.grantExp = () => 10;
  sandbox.grantRew = () => ({ crystal: 1, gold: 10, diamond: 0 });
  sandbox.addCombo = gg => { gg.combo++; };
  sandbox.resetCombo = gg => { gg.combo = 0; };
  LQ.code = 'ja';
  const R = s.langSettle(g, false);
  if (g.stats.total !== 1 || g.stats.correct !== 0) throw new Error('答錯計數錯誤');
  if (g.combo !== 0) throw new Error('combo 未重置');
  if (R.exp !== 0 || R.au !== 0) throw new Error('答錯不該有獎勵');
});

test('langAskAI 解析 Gemini 回應（stub callGemini）', async () => {
  sandbox.callGemini = async () => '[{"題目":"「謝謝」的日文是？","選項":["ありがとう","さようなら","こんにちは","はい"],"答案":0,"解析":"ありがとう = 謝謝"}]';
  const q = await s.langAskAI('日語', 'ja', '簡單');
  if (!q || q['題目'].indexOf('日文') < 0) throw new Error('題目解析失敗');
  if (q['選項'].length !== 4) throw new Error('選項數 ' + q['選項'].length);
});

test('langAskAI 收到亂碼回應回傳 null', async () => {
  sandbox.callGemini = async () => '抱歉，我無法回應。';
  const q = await s.langAskAI('日語', 'ja', '簡單');
  if (q !== null) throw new Error('應回 null');
});

test('vLangStudy() 渲染語言網格', () => {
  const els = {};
  const mkEl = () => ({ innerHTML: '', value: '' });
  sandbox.document.getElementById = id => els[id] || (els[id] = mkEl());
  sandbox.document.querySelector = sel => els[sel] || (els[sel] = mkEl());
  sandbox.document.querySelectorAll = () => [];
  sandbox.back = () => '';
  sandbox.esc = x => String(x);
  s.vLangStudy();
  const html = els['#view'] && els['#view'].innerHTML;
  if (!html || !html.includes('語言包')) throw new Error('未渲染 #view');
  if (!html.includes('日語')) throw new Error('渲染內容缺語言按鈕');
});

test('langStart 進入載入畫面（stub 不出題）', () => {
  sandbox.back = () => '';
  sandbox.esc = x => String(x);
  sandbox.langAsk = async () => null;
  const els = {};
  sandbox.document.getElementById = id => els[id] || (els[id] = { innerHTML: '' });
  sandbox.document.querySelector = sel => els[sel] || (els[sel] = { innerHTML: '' });
  sandbox.document.querySelectorAll = () => [];
  s.langStart('en');
  const html = els['#view'] && els['#view'].innerHTML;
  if (!html || !html.includes('AI 正在出')) throw new Error('未渲染載入畫面');
  LQ.phase = 'IDLE';
});

console.log(errors ? '\n✖ 共 ' + errors + ' 個失敗' : '\n✓ 全部冒煙測試通過');
fs.writeFileSync('tools/build/smoke_result.txt', RESULT.join('\n') + '\n' + (errors ? '✖ 共 ' + errors + ' 個失敗' : '✓ 全部通過') + '\n');
process.exit(errors ? 1 : 0);