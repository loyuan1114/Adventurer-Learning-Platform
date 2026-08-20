#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ADV9 文件題目解析器 — 輸入檔案路徑，輸出 JSON（stdout）
支援：.docx（zip+xml）、.txt（純文字）、.pdf（若系統有 pdftotext）
輸出格式：{"questions":[{"題目":..., "答案":..., "選項":[...], "解析":...}], "raw_text":...}
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
import xml.etree.ElementTree as ET

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}


def extract_docx(path):
    """從 docx 提取段落文字"""
    paras = []
    with zipfile.ZipFile(path) as z:
        xml = z.read('word/document.xml')
    root = ET.fromstring(xml)
    for p in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        texts = []
        for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
            if t.text:
                texts.append(t.text)
        line = ''.join(texts).strip()
        if line:
            paras.append(line)
    return paras


def extract_txt(path):
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        return [l.strip() for l in f if l.strip()]


def extract_pdf(path):
    if not shutil.which('pdftotext'):
        return ['（PDF 解析需要 pdftotext，未安裝）']
    r = subprocess.run(['pdftotext', '-layout', path, '-'],
                       capture_output=True, timeout=30)
    return [l.strip() for l in r.stdout.decode('utf-8', errors='replace').split('\n') if l.strip()]


def parse_questions(paras):
    """從段落中盡量切出題目/答案/選項"""
    questions = []
    cur = None
    for line in paras:
        # 選項行：A. xxx / (A) xxx / 1. xxx（題號）
        m_opt = re.match(r'^\(?([A-Ea-e])\)?[.、)．]\s*(.+)$', line)
        m_q = re.match(r'^(\d{1,3})[.、)．]\s*(.+)$', line)
        if m_q and len(m_q.group(2)) > 4:
            if cur and (cur.get('題目')):
                questions.append(cur)
            cur = {'題目': m_q.group(2), '答案': '', '選項': [], '解析': ''}
        elif m_opt and cur:
            cur['選項'].append(m_opt.group(1).upper() + '. ' + m_opt.group(2))
            if line.startswith('答案') or line.startswith('答'):
                pass
        elif cur and not m_opt:
            if line.startswith('答案') or line.startswith('答：') or line.startswith('答:'):
                cur['答案'] = re.sub(r'^答[案：:]\s*', '', line)
            elif line.startswith('解析') or line.startswith('解'):
                cur['解析'] = re.sub(r'^解析[：:]\s*', '', line)
    if cur and cur.get('題目'):
        questions.append(cur)
    return questions


def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'no file'}, ensure_ascii=False))
        sys.exit(1)
    path = sys.argv[1]
    if not os.path.exists(path):
        print(json.dumps({'error': 'file not found'}, ensure_ascii=False))
        sys.exit(1)
    ext = os.path.splitext(path)[1].lower()
    try:
        if ext == '.docx':
            paras = extract_docx(path)
        elif ext == '.pdf':
            paras = extract_pdf(path)
        else:
            paras = extract_txt(path)
        questions = parse_questions(paras)
        print(json.dumps({
            'questions': questions,
            'raw_text': '\n'.join(paras),
            'count': len(questions),
        }, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'error': str(e)}, ensure_ascii=False))
        sys.exit(1)


if __name__ == '__main__':
    main()