#!/usr/bin/env node
/* analyze.js — 用 acorn 解析 index.html 主腳本，輸出頂層單位與「程式碼引用」
   輸出 JSON：{funcs:[{name,start,end,codeRefs:[...]}], consts:[...], others:[{start,end}]}
   行號 = index.html 檔案中的 1-based 行號
   codeRefs = AST 中的真實識別字引用（排除字串文字、屬性鍵、成員屬性、宣告名、參數） */
const fs = require('fs');
const acorn = require(process.env.ACORN_PATH || 'C:/Users/weimyown/AppData/Local/Temp/opencode/acorn/node_modules/acorn');
const html = fs.readFileSync('public/index.html', 'utf8');
const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let m, scripts = [];
while ((m = re.exec(html))) {
  const before = html.slice(0, m.index);
  const code = m[1];
  const nlBefore = (before.match(/\n/g) || []).length;
  const startsNewLine = code.startsWith('\n');
  scripts.push({ code, startLine: nlBefore + 1 + (startsNewLine ? 1 : 0) });
}
const scriptsAll = scripts.filter(s => s.code.trim().length > 0);

function codeRefsOf(stmt) {
  const refs = new Set();
  (function walk(node, parent) {
    if (!node || typeof node.type !== 'string') return;
    if (node.type === 'Identifier') {
      let skip = false;
      if (parent) {
        const p = parent.node, key = parent.key;
        if (p.type === 'Property' && p.key === node && !p.computed) skip = true;
        if (p.type === 'MemberExpression' && p.property === node && !p.computed) skip = true;
        if (p.type === 'VariableDeclarator' && p.id === node) skip = true;
        if ((p.type === 'FunctionDeclaration' || p.type === 'FunctionExpression' || p.type === 'ArrowFunctionExpression')
            && (p.id === node || (Array.isArray(p.params) && p.params.includes(node)))) skip = true;
        if (p.type === 'LabeledStatement' && p.label === node) skip = true;
        if ((p.type === 'BreakStatement' || p.type === 'ContinueStatement') && p.label === node) skip = true;
      }
      if (!skip) refs.add(node.name);
      return;
    }
    for (const k of Object.keys(node)) {
      if (k === 'loc' || k === 'range' || k === 'start' || k === 'end' || k === 'type') continue;
      const v = node[k];
      if (Array.isArray(v)) { for (const c of v) if (c && typeof c.type === 'string') walk(c, { node, key: k }); }
      else if (v && typeof v.type === 'string') walk(v, { node, key: k });
    }
  })(stmt, null);
  return [...refs];
}

const funcs = [], consts = [], others = [];
function walkTop(st, off) {
  const sl = st.loc.start.line + off, el = st.loc.end.line + off;
  if (st.type === 'FunctionDeclaration') {
    funcs.push({ name: st.id.name, start: sl, end: el, codeRefs: codeRefsOf(st) });
    return;
  }
  if (st.type === 'VariableDeclaration') {
    for (const d of st.declarations) {
      if (d.id.type === 'Identifier') consts.push({ name: d.id.name, start: sl, end: el, codeRefs: codeRefsOf(st) });
    }
    return;
  }
  if (st.type === 'BlockStatement') { for (const s of st.body) walkTop(s, off); return; }
  others.push({ type: st.type, start: sl, end: el, codeRefs: codeRefsOf(st) });
}
for (const s of scriptsAll) {
  const ast = acorn.parse(s.code, { ecmaVersion: 2022, locations: true, sourceType: 'script' });
  const off = s.startLine - 1;
  for (const st of ast.body) walkTop(st, off);
}
console.log(JSON.stringify({ funcs, consts, others }));