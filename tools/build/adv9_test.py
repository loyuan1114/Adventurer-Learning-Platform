#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ADV9 全功能自動測試腳本
連線目標：VPS 伺服器 (http://10.67.50.212:8080)
測試：靜態資源、登入、全部 REST 端點、修練場、sandbox、calc 黑盒、AI providers

用法：
  python adv9_test.py                # 全部測試
  python adv9_test.py --url http://x.x.x.x:8080
  python adv9_test.py --admin adv9boss --pass admin123
"""
import json
import sys
import io
import time
import urllib.request
import urllib.error

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE = 'http://10.67.50.212:8080'
ADMIN = 'adv9boss'
ADMIN_PW = 'admin123'
TIMEOUT = 30

PASS, FAIL, SKIP = [], [], []

def req(method, path, body=None, token=None, timeout=TIMEOUT):
    url = BASE + path
    data = None
    headers = {'User-Agent': 'adv9-test', 'Accept': 'application/json'}
    if body is not None:
        data = json.dumps(body).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    if token:
        headers['x-adv9-token'] = token
    r = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        resp = urllib.request.urlopen(r, timeout=timeout)
        raw = resp.read().decode('utf-8', errors='replace')
        try:
            return resp.status, json.loads(raw)
        except Exception:
            return resp.status, raw
    except urllib.error.HTTPError as e:
        raw = e.read().decode('utf-8', errors='replace')
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, raw
    except Exception as e:
        return None, str(e)

def check(name, ok, detail=''):
    if ok:
        PASS.append(name)
        print(f'  ✅ {name}')
    else:
        FAIL.append(name)
        print(f'  ❌ {name}  {detail}')

def section(title):
    print(f'\n═══ {title} ═══')

def main():
    global BASE, ADMIN, ADMIN_PW
    args = sys.argv[1:]
    for i, a in enumerate(args):
        if a == '--url' and i + 1 < len(args):
            BASE = args[i + 1].rstrip('/')
        if a == '--admin' and i + 1 < len(args):
            ADMIN = args[i + 1]
        if a == '--pass' and i + 1 < len(args):
            ADMIN_PW = args[i + 1]

    print(f'🔌 測試目標: {BASE}')
    print(f'👤 管理員: {ADMIN}')
    print('=' * 50)

    # ── 1. 靜態資源 ──
    section('1. 靜態資源')
    for p, expect in [('/', 200), ('/index.html', 200), ('/core.js', 200),
                      ('/js/i18n.js', 200),
                      ('/features/cultivate.js', 200),
                      ('/js/langpacks/zh-TW.js', None),
                      ('/js/langpacks/en.js', None),
                      ('/css', None), ('/favicon.ico', None)]:
        st, _ = req('GET', p)
        if expect is None:
            check(f'GET {p} (任意狀態)', st is not None, f'got {st}')
        else:
            check(f'GET {p} → {expect}', st == expect, f'got {st}')

    # ── 2. 登入 ──
    section('2. 登入')
    st, j = req('POST', '/rest/v1/rpc/login_user', {'p_username': ADMIN, 'p_password': ADMIN_PW})
    ok = st == 200 and isinstance(j, dict) and j.get('token')
    check(f'登入 {ADMIN} → token', ok, f'status={st} resp={str(j)[:100]}')
    TOKEN = j.get('token') if ok else None

    st, _ = req('POST', '/rest/v1/rpc/login_user', {'p_username': ADMIN, 'p_password': 'wrongpw'})
    check('錯誤密碼被拒', st in (401, 400, 403), f'got {st}')

    # ── 3. 未授權保護 ──
    section('3. 授權檢查（無 token 應 401）')
    for p, m in [('/rest/v1/user/heartbeat', 'POST'), ('/rest/v1/sandbox/run', 'POST'),
                 ('/rest/v1/calc/simulate', 'POST'), ('/rest/v1/calc/loot', 'POST'),
                 ('/rest/v1/admin/users_index', 'GET')]:
        body = {'a': 1} if m == 'POST' else None
        st, _ = req(m, p, body)
        check(f'無 token → {p}', st in (401, 403), f'got {st}')

    if not TOKEN:
        print('\n❌ 無法登入，跳過需要授權的測試')
    else:
        # ── 4. 授權端點冒煙測試 ──
        section('4. 授權端點（登入後）')
        st, _ = req('POST', '/rest/v1/user/heartbeat', {'t': int(time.time())}, TOKEN)
        check('heartbeat', st == 200, f'got {st}')

        st, _ = req('GET', '/rest/v1/admin/users_index', token=TOKEN)
        check('admin/users_index', st == 200, f'got {st}')

        st, j = req('GET', '/rest/v1/system_settings', token=TOKEN)
        check('system_settings', st == 200, f'got {st}')

        st, j = req('GET', '/rest/v1/adv9_kv', token=TOKEN)
        check('adv9_kv', st == 200, f'got {st}')

        st, j = req('GET', '/rest/v1/stream', token=TOKEN, timeout=5)
        check('stream', st in (200, 400) or (st is None and ('timeout' in str(j).lower() or 'timed out' in str(j).lower())), f'got {st} {str(j)[:60]}')

        st, _ = req('GET', '/rest/v1/ai/providers', token=TOKEN)
        check('ai/providers', st == 200, f'got {st}')

        st, _ = req('GET', '/rest/v1/sandbox/languages', token=TOKEN)
        check('sandbox/languages', st == 200, f'got {st}')

        st, _ = req('GET', '/rest/v1/sudoku/new', token=TOKEN)
        check('sudoku/new', st == 200, f'got {st}')

        # ── 5. C++ 黑盒 ──
        section('5. C++ 計算黑盒')
        st, j = req('POST', '/rest/v1/calc/simulate',
                    {'seed': 12345, 'ticks': 50, 'players': 1, 'enemies': 10}, TOKEN)
        ok = st == 200 and isinstance(j, dict) and 'totalDamage' in j
        check('calc/simulate', ok, f'got {st} {str(j)[:100]}')

        st, j = req('POST', '/rest/v1/calc/loot', {'seed': 99, 'count': 3, 'tier': 5}, TOKEN)
        ok = st == 200 and isinstance(j, list) and len(j) == 3
        check('calc/loot', ok, f'got {st} {str(j)[:100]}')

        # ── 6. 程式沙盒 ──
        section('6. 程式沙盒')
        st, j = req('POST', '/rest/v1/sandbox/run',
                    {'lang': 'python', 'code': 'print(6*7)'}, TOKEN)
        ok = st == 200 and isinstance(j, dict) and '42' in str(j.get('stdout', ''))
        check('sandbox python 6*7=42', ok, f'got {st} {str(j)[:120]}')

        st, j = req('POST', '/rest/v1/sandbox/run',
                    {'lang': 'cpp', 'code': '#include <iostream>\nint main(){std::cout<<21*2;return 0;}'}, TOKEN)
        ok = st == 200 and isinstance(j, dict) and '42' in str(j.get('stdout', ''))
        check('sandbox cpp 21*2=42', ok, f'got {st} {str(j)[:120]}')

        st, j = req('POST', '/rest/v1/sandbox/run', {'lang': 'badlang', 'code': 'x'}, TOKEN)
        ok = st == 200 and isinstance(j, dict) and j.get('error')
        check('sandbox 不支援語言 → error 訊息', ok, f'got {st} {str(j)[:80]}')

        # ── 7. 修練場資料端點 ──
        section('7. 修練場/課堂')
        st, j = req('GET', '/rest/v1/class_war', token=TOKEN)
        check('class_war', st in (200, 400, 405), f'got {st}')

        st, j = req('GET', '/rest/v1/sudoku/rank', token=TOKEN)
        check('sudoku/rank', st in (200, 400), f'got {st}')

        st, j = req('POST', '/rest/v1/questions/validate', {'question': '測試'}, TOKEN)
        check('questions/validate', st in (200, 400), f'got {st}')

        # ── 8. 信任/同意 ──
        section('8. 信任/同意')
        st, _ = req('POST', '/rest/v1/consent/status/', {'u': ADMIN}, TOKEN)
        check('consent/status', st in (200, 400, 404), f'got {st}')

        st, _ = req('POST', '/rest/v1/trust/agreement/accept', {}, TOKEN)
        check('trust/agreement/accept', st in (200, 400, 409), f'got {st}')

        # ── 9. 備份/匯出 ──
        section('9. 備份/匯出')
        st, _ = req('GET', '/rest/v1/system_backup', token=TOKEN)
        check('system_backup', st in (200, 404, 500), f'got {st}')

        st, _ = req('POST', '/rest/v1/user_export/', {'u': ADMIN}, TOKEN)
        check('user_export', st in (200, 400, 404), f'got {st}')

    # ── 10. 驗證黑盒可執行檔存在（server 端資訊） ──
    section('10. C++ 黑盒可執行檔')
    st, j = req('POST', '/rest/v1/calc/simulate', {'seed': 1, 'ticks': 5, 'players': 1, 'enemies': 1}, TOKEN)
    if st == 200 and isinstance(j, dict) and j.get('error'):
        check('黑盒已編譯（無 error）', False, str(j)[:100])
    elif st == 200:
        check('黑盒已編譯並執行', True)
    else:
        check('黑盒已編譯並執行', False, f'got {st}')

    # ── 總結 ──
    print('\n' + '=' * 50)
    print(f'✅ 通過: {len(PASS)}   ❌ 失敗: {len(FAIL)}')
    if FAIL:
        print('\n失敗項目:')
        for f in FAIL:
            print(f'  ❌ {f}')
    print('=' * 50)
    sys.exit(1 if FAIL else 0)

if __name__ == '__main__':
    main()