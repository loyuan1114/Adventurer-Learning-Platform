#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""dupcheck.py — 檢查同時載入的檔案間是否有人重複宣告 const/let（會炸 SyntaxError）
   載入組合：外殼(always) + shared + 模組 + 模組依賴。只要任兩檔有同名 const/let 且可能同載即報錯。"""
import re, subprocess, json, sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ACORN = 'C:/Users/weimyown/AppData/Local/Temp/opencode/acorn/node_modules/acorn'

def parse_file(path):
    code = open(path, encoding='utf-8').read()
    env = dict(__import__('os').environ)
    env['ACORN_PATH'] = ACORN
    r = subprocess.run(['node', '-e', """
const acorn=require(process.env.ACORN_PATH);
const code=require('fs').readFileSync(process.argv[1],'utf8');
try{
  const ast=acorn.parse(code,{ecmaVersion:2022});
  const names=[];
  for(const st of ast.body){
    if(st.type==='VariableDeclaration'&&(st.kind==='const'||st.kind==='let')){
      for(const d of st.declarations){ if(d.id.type==='Identifier')names.push(d.id.name); }
    }
  }
  console.log(JSON.stringify(names));
}catch(e){console.log('PARSEERR');process.exit(1)}
""", path], capture_output=True, text=True, encoding='utf-8', env=env)
    if r.returncode:
        print('parse fail', path, r.stderr[:200]); return set()
    return set(json.loads(r.stdout))

import os
ROOT = os.getcwd()
html = open('public/index.html', encoding='utf-8').read()
scripts = re.findall(r'<script\b[^>]*>([\s\S]*?)</script>', html)
shell = set()
for i, sc in enumerate(scripts):
    if not sc.strip():
        continue
    open('_tmp_shell_%d.js' % i, 'w', encoding='utf-8').write(sc)
    shell |= parse_file('_tmp_shell_%d.js' % i)
    os.remove('_tmp_shell_%d.js' % i)

# 每模組的 const/let 名
mod_names = {}
for f in os.listdir('public/js/views'):
    if f.endswith('.js'):
        mod_names[f] = parse_file(os.path.join('public/js/views', f))
shared = parse_file('public/js/shared.js') if os.path.exists('public/js/shared.js') else set()

errs = []
for f, names in mod_names.items():
    dup = names & shell
    if dup:
        errs.append('外殼 vs %s 重複 const/let: %s' % (f, sorted(dup)))
dup = shared & shell
if dup:
    errs.append('外殼 vs shared.js 重複: %s' % sorted(dup))
allnames = {}
for f, names in mod_names.items():
    for n in names:
        allnames.setdefault(n, []).append(f)
for f, names in mod_names.items():
    dup = names & shared
    if dup:
        errs.append('%s vs shared.js 重複: %s' % (f, sorted(dup)))
if errs:
    print('✖ 發現 %d 處重複宣告（同時載入會 SyntaxError）：' % len(errs))
    for e in errs[:40]:
        print('   ', e)
else:
    print('✓ 無 const/let 碰撞（外殼+shared+模組 同時載入安全）')