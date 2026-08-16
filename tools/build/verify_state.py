#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
s = open('public/index.html', encoding='utf-8').read()
print('SUPA_KEY const:', "const SUPA_KEY='';/* 金鑰自動" in s)
print('supaHeaders usage count:', s.count('headers: supaHeaders(),'))
print('login method2 ok:', 'headers: supaHeaders(),\n            body: JSON.stringify({ p_username: un' in s.replace('\r\n', '\n'))
print('teacher register ok:', 'headers: supaHeaders(),\n        body: JSON.stringify({\n          p_username: username' in s.replace('\r\n', '\n'))
print('langAskAI in shell:', 'function langAskAI(' in s)