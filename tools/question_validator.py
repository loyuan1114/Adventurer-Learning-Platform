#!/usr/bin/env python3
"""
ADV9 出題驗證器 v1.0
驗證 AI 生成的題目格式、答案、選項、詳解等
"""
import json,sys,re,math

VERSION='1.0'

def validate_question(q):
    """驗證單一題目，回傳 {ok:bool, errors:[], warnings:[]}
    q: dict with keys: question_text, options, answer, explanation, grade_level, difficulty, tags
    """
    errors=[]
    warnings=[]
    
    # 1. 格式檢查
    if not q.get('question_text','').strip():
        errors.append('題目文字為空')
    
    opts=q.get('options',[])
    if not isinstance(opts,list) or len(opts)<2:
        errors.append('選項必須是陣列且至少 2 個')
    elif len(opts)>6:
        warnings.append('選項超過 6 個，建議精簡')
    
    ans=q.get('answer','')
    if isinstance(ans,int):
        if ans<0 or ans>=len(opts):
            errors.append(f'答案索引 {ans} 超出選項範圍 (0-{len(opts)-1})')
    elif isinstance(ans,str):
        if ans not in opts and ans.strip() not in [str(o).strip() for o in opts]:
            # 嘗試模糊匹配
            matched=False
            for o in opts:
                if ans.strip().lower()==str(o).strip().lower():
                    matched=True
                    break
            if not matched:
                errors.append(f'答案 "{ans}" 不在選項中')
    
    # 2. 選項重複檢查
    seen=[]
    for o in opts:
        s=str(o).strip().lower()
        if s in seen:
            errors.append(f'選項重複：{o}')
        seen.append(s)
    
    # 3. 詳解檢查
    exp=q.get('explanation','')
    if not exp or len(exp.strip())<10:
        warnings.append('詳解過短，建議至少 10 字')
    
    # 4. 年級範圍檢查
    grade=q.get('grade_level')
    if grade is not None:
        try:
            g=int(grade)
            if g<1 or g>12:
                warnings.append(f'年級 {g} 超出常規範圍 (1-12)')
        except:
            errors.append('年級格式錯誤')
    
    # 5. 難度檢查
    diff=q.get('difficulty')
    if diff is not None:
        try:
            d=int(diff)
            if d<1 or d>5:
                warnings.append(f'難度 {d} 超出範圍 (1-5)')
        except:
            pass
    
    # 6. 敏感內容檢查
    sensitive_patterns=[
        r'考試\s*答案', r'作弊\s*方法', r'偷看',
        r'槍手', r'代寫', r'洩題',
    ]
    text=(q.get('question_text','')+' '+str(exp))
    for pat in sensitive_patterns:
        if re.search(pat,text):
            warnings.append(f'可能含敏感內容：匹配模式 "{pat}"')
    
    # 7. 數學題驗算
    subject=q.get('subject','')
    topic=q.get('topic','')
    if any(k in str(subject)+str(topic) for k in ['數學','Math','方程式','計算','幾何']):
        math_result=validate_math_answer(q)
        if math_result:
            warnings.append(f'數學驗算：{math_result}')
    
    return {
        'ok':len(errors)==0,
        'errors':errors,
        'warnings':warnings,
        'validator_version':VERSION
    }

def validate_math_answer(q):
    """嘗試驗算數學題答案"""
    try:
        text=q.get('question_text','')
        ans=str(q.get('answer',''))
        # 簡單的算術表達式驗算
        # 匹配 A + B = ? 或 A - B = ? 等模式
        m=re.search(r'(\d+)\s*([+\-×\*÷/])\s*(\d+)\s*=\s*\?',text)
        if m:
            a=int(m.group(1))
            op=m.group(2)
            b=int(m.group(3))
            if op=='+':expected=str(a+b)
            elif op=='-' or op=='−':expected=str(a-b)
            elif op=='×' or op=='*':expected=str(a*b)
            elif op=='÷' or op=='/':
                if b==0:expected='error'
                else:expected=str(a/b) if a%b!=0 else str(a//b)
            else:return None
            
            # 檢查答案
            expected_num=expected.replace('.0','')
            ans_clean=ans.strip()
            if ans_clean!=expected_num and ans_clean!=expected:
                return f'算術驗算：{a}{op}{b}={expected}，但答案為 {ans_clean}'
    except:
        pass
    return None

def validate_batch(questions):
    """批量驗證題目"""
    results=[]
    for i,q in enumerate(questions):
        r=validate_question(q)
        r['index']=i
        r['question_text']=q.get('question_text','')[:50]
        results.append(r)
    
    total=len(results)
    passed=sum(1 for r in results if r['ok'])
    failed=total-passed
    
    return {
        'version':VERSION,
        'total':total,
        'passed':passed,
        'failed':failed,
        'results':results
    }

if __name__=='__main__':
    # 從 stdin 或檔案讀取題目
    if len(sys.argv)>1:
        with open(sys.argv[1],'r',encoding='utf-8') as f:
            data=json.load(f)
    else:
        data=json.load(sys.stdin)
    
    if isinstance(data,list):
        result=validate_batch(data)
    elif isinstance(data,dict):
        result=validate_question(data)
        result={'version':VERSION,'result':result}
    else:
        result={'error':'無效的輸入格式'}
    
    print(json.dumps(result,ensure_ascii=False,indent=2))
