# -*- coding: utf-8 -*-
import subprocess, os, sys, glob, re, tempfile
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

html = open('public/index.html', encoding='utf-8').read()

# 1) 內嵌腳本逐一 node --check
scripts = re.findall(r'<script\b[^>]*>([\s\S]*?)</script>', html)
bad = 0
for i, sc in enumerate(scripts):
    if not sc.strip():
        continue
    tmp = os.path.join(tempfile.gettempdir(), '_chk_%d.js' % i)
    open(tmp, 'w', encoding='utf-8').write(sc)
    r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True, encoding='utf-8')
    os.remove(tmp)
    if r.returncode:
        bad += 1
        print('FAIL script[%d]: %s' % (i, r.stderr[:200]))
print('inline scripts node --check: %d/%d ok' % (len([s for s in scripts if s.strip()]) - bad, len([s for s in scripts if s.strip()])))

# 2) 模組檔 node --check
files = glob.glob('public/js/views/*.js')
bad = 0
for f in files:
    r = subprocess.run(['node', '--check', f], capture_output=True, text=True, encoding='utf-8')
    if r.returncode:
        bad += 1
        print('FAIL', f, r.stderr[:200])
print('module files node --check: %d/%d ok' % (len(files) - bad, len(files)))

# 3) needJs wrapper 對照
wraps = re.findall(r"needJs\(\[['\"]js/views/([^'\"]+)['\"]\]\)", html)
fileset = set(os.path.basename(f) for f in files)
print('needJs wrappers:', len(wraps))
print('files without wrapper:', sorted(fileset - set(wraps)))
print('wrappers without file:', sorted(set(wraps) - fileset))
print('shared.js exists:', os.path.exists('public/js/shared.js'))