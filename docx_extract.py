import sys,json,re
fn=sys.argv[1]
raw=open(fn,'rb').read()
paras=[]
if raw[:2]==b'PK':
    import zipfile
    from xml.etree import ElementTree as ET
    with zipfile.ZipFile(fn) as z:
        root=ET.fromstring(z.read('word/document.xml'))
    ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    for p in root.findall('.//w:p',ns):
        t=''.join(x.text or '' for x in p.findall('.//w:t',ns)).strip()
        if t: paras.append(t)
elif raw[:4]==b'%PDF':
    import pypdf
    reader=pypdf.PdfReader(fn)
    for pg in reader.pages:
        for ln in (pg.extract_text() or '').splitlines():
            t=ln.strip()
            if t: paras.append(t)
else:
    paras=[l.strip().lstrip('\ufeff') for l in open(fn,encoding='utf-8-sig',errors='ignore').read().splitlines() if l.strip()]
qs=[]; cur=None
for line in paras:
    m=re.match(r'^(?:題目\s*)?(\d+)[\.、\)]\s*(.*)$',line)
    if m:
        if cur: qs.append(cur)
        cur={'題目':m.group(2),'選項':[],'答案':0,'解析':''}; continue
    m=re.match(r'^([A-DＡ-Ｄ])[\.、\)：:]?\s*(.*)$',line)
    if m and cur: cur['選項'].append(m.group(2)); continue
    m=re.match(r'^(?:答案|正確答案)[:：]?\s*([A-DＡ-Ｄ1-4])',line)
    if m and cur:
        a=m.group(1).translate(str.maketrans('ＡＢＣＤ','ABCD')); cur['答案']=int(a)-1 if a.isdigit() else 'ABCD'.index(a); continue
    if cur and line.startswith(('解析','說明')): cur['解析']=re.sub(r'^[^:：]*[:：]','',line)
if cur: qs.append(cur)
print(json.dumps(qs,ensure_ascii=False))