// 刪除載入畫面
(function() {
    // 刪除包含「全領域冒險者養成系統 v9.0」的 h2
    document.querySelectorAll('h2').forEach(el => {
        if (el.textContent.includes('全領域冒險者養成系統 v9.0')) {
            el.remove();
        }
    });
    
    // 只刪除載入畫面內的 p（不可刪除全頁 p，否則登入卡 lgSub/lgNote/lgReset 會被誤刪）
    document.querySelectorAll('p.sp2').forEach(el => el.remove());
    
    // 刪除 class="spBar" 的 div
    document.querySelectorAll('div.spBar').forEach(el => el.remove());
})();

// === AI 出題功能 (Teacher) ===
/* ════════════════════════════════════════════
   vAiQuiz 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vAiQuiz
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAiQuiz 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vAiQuiz
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAiQuiz 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vAiQuiz
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAiQuiz 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vAiQuiz
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAiQuiz 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vAiQuiz
   ════════════════════════════════════════════ */
async function vAiQuiz(){
  if(!await needJs(['js/views/vAiQuiz.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vAiQuiz();
}






function updateAiUnits(){
const grade=$('#aiGrade').value;
const subject=$('#aiSubject').value;
const unitSel=$('#aiUnit');
const units=(SUBJ[subject]&&SUBJ[subject].u&&SUBJ[subject].u[grade])||[];
unitSel.innerHTML=units.map(u=>{const name=Array.isArray(u)?u[0]:u;return '<option value="'+name+'">'+name+'</option>'}).join('');
}

async function aiGenQuiz(){
const grade=$('#aiGrade').value;
const subject=$('#aiSubject').value;
const unit=$('#aiUnit').value;
const diff=$('#aiDiff').value;
const count=Math.max(1,Math.min(50,parseInt($('#aiCount').value)||5));
$('#aiResults').innerHTML='<div style="text-align:center;padding:30px"><div style="font-size:40px;animation:bob 1s infinite">🤖</div><p style="color:var(--mut);margin-top:10px">AI 正在生成題目...</p></div>';
const recent=aiGetRecent(subject,unit); /* 🗂 全服最近題目池：禁止重複 */
const systemInst='你是一位專業的台灣國中教師，專門負責出選擇題。你必須嚴格按照指定的 JSON 格式回應，不要包含任何額外文字。';
const prompt=`請根據以下條件生成選擇題：

年級：${grade}
科目：${subject}（必須嚴格匹配此科目內容，不可混雜其他科目）
單元：${unit}
難度：${diff}
數量：${count} 題

嚴格要求：
1. 所有題目必須是純文字，絕對不能包含圖片、照片或任何圖像描述（不能有「如圖」「下圖」「附圖」等）
2. 題目內容必須嚴格屬於「${subject}」科目
3. 所有科目一律禁止生成任何聽力相關題目（不能有「請聽錄音」「聽力測驗」等）
4. 每題必須有恰好 4 個選項
5. 使用繁體中文（英文科目除外，英文科目用英文出題）
6. 答案索引從 0 開始（0=第一個選項，1=第二個，以此類推）
7. 嚴禁使用 LaTeX 或數學標記語法（禁止 $、\\times、\\frac、\\sqrt 等），數學式直接用一般文字與符號：× ÷ ² √ π ≤ ≥ ≠，例如「(-5) + 3 × (-2)」
8. 下列是最近已出過的題目，絕對禁止與其完全相同、僅改數字或僅換人名：${recent.length?recent.map((r,i)=>(i+1)+'. '+r).join('\n'):'（無）'}
9. 本次 ${count} 題之間必須彼此不同（不同數字、不同情境、不同題型）；隨機碼：${Math.random().toString(36).slice(2,9)}

請以純 JSON 陣列格式回應：
[{"題目":"...","選項":["A","B","C","D"],"答案":0,"解析":"..."},...]`;
try{
const result=await callGemini(prompt,systemInst);
const questions=parseAiQuestions(result,subject);
if(questions.length===0){
$('#aiResults').innerHTML='<div class="panel2" style="padding:14px;text-align:center"><p style="color:var(--red)">AI 未能生成有效題目，請重試</p></div>';
return;
}
const verified=await aiVerifyQuestions(questions,subject,unit); /* 🔍 AI 二次驗算：逐題重算答案 */
const fixCount=verified.filter((v,i)=>v&&questions[i]&&v['答案']!==questions[i]['答案']).length;
verified.forEach(q=>{if(q&&q['題目'])aiPushRecent(subject,unit,q['題目'])}); /* 記入全服最近題目池 */
let html='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b style="color:var(--gold)">✅ 成功生成 '+verified.length+' 題</b>';
html+='<button class="btn teal" onclick="addAllAiQ()">📥 全部加入題庫</button></div>';
html+='<div style="font-size:11px;color:var(--teal);margin-bottom:8px">🔍 已通過 AI 二次驗算（答案逐題重算核對'+(fixCount?'，其中 '+fixCount+' 題答案已自動修正':'，全部正確')+'）</div>';
verified.forEach((q,i)=>{
html+='<div class="panel2" style="padding:12px;margin-bottom:8px">';
html+='<div style="font-size:13px;font-weight:bold;margin-bottom:6px">第 '+(i+1)+' 題：'+esc(q['題目'])+'</div>';
q['選項'].forEach((opt,oi)=>{
const isAns=oi===q['答案'];
html+='<div style="font-size:12px;padding:2px 8px;'+(isAns?'color:var(--green);font-weight:bold':'color:var(--mut)')+'">'+String.fromCharCode(65+oi)+'. '+esc(opt)+(isAns?' ✓':'')+'</div>';
});
if(q['解析'])html+='<div style="font-size:11px;color:var(--mut);margin-top:6px;border-top:1px solid var(--line);padding-top:4px">解析：'+esc(q['解析'])+'</div>';
html+='</div>';
});
$('#aiResults').innerHTML=html;
window._aiGenQuestions=verified;
window._aiGenSubject=subject;
window._aiGenUnit=unit;
}catch(e){
$('#aiResults').innerHTML='<div class="panel2" style="padding:14px;text-align:center"><p style="color:var(--red)">❌ '+esc(e.message)+'</p><button class="btn" onclick="aiGenQuiz()" style="margin-top:8px">重試</button></div>';
}
}

function addAllAiQ(){
const qs=window._aiGenQuestions;
if(!qs||!qs.length){toast('沒有可加入的題目','error');return;}
const subj=window._aiGenSubject;
const unit=window._aiGenUnit;
const teacherQ=get('ADV9_TEACHERQ',{});
if(!teacherQ[subj])teacherQ[subj]={};
if(!teacherQ[subj][unit])teacherQ[subj][unit]=[];
teacherQ[subj][unit]=teacherQ[subj][unit].concat(qs);
set('ADV9_TEACHERQ',teacherQ);
toast('✅ 已加入 '+qs.length+' 題到題庫','success');
}

// === AI 出題功能 (Student) ===
/* 🗂 全服「最近出過題目」池：記住每個科目/單元最近出的題目，出題時當禁止範例，避免題目一直重複 */
function aiGetRecent(subj,unit){try{const m=get('ADV9_AI_RECENT',{});const arr=(m[subj]&&m[subj][unit])||[];return arr.slice(-10)}catch(e){return[]}}
function aiPushRecent(subj,unit,txt){try{const m=get('ADV9_AI_RECENT',{});m[subj]=m[subj]||{};m[subj][unit]=m[subj][unit]||[];m[subj][unit].push(txt);if(m[subj][unit].length>30)m[subj][unit]=m[subj][unit].slice(-30);set('ADV9_AI_RECENT',m)}catch(e){}}
async function aiGenerateQuiz(subj,unit,diff){
const diffLabel=diff>=70?'困難':(diff>=40?'中等':'簡單');
const systemInst='你是一位專業的台灣國中教師，專門負責出選擇題。嚴格按照 JSON 格式回應，不要包含任何額外文字或 markdown 標記。';
const g=(me()&&me().g)?me().g:null;
const recent=[...(g?(g.qSeenTxt||[]):[]).slice(-5),...aiGetRecent(subj,unit)].slice(-10);
for(let att=0;att<2;att++){ /* 若抽到重複題自動重抽一次 */
const prompt=`生成 1 道選擇題：
年級：國中
科目：${subj}（必須嚴格屬於此科目）
單元：${unit}
難度：${diffLabel}

要求：
1. 純文字題目，不能有圖片、照片、「如圖」「下圖」等描述
2. 必須嚴格屬於「${subj}」科目內容
3. 所有科目一律禁止聽力題（不能有「請聽錄音」等）
4. 恰好 4 個選項
5. 使用繁體中文（英文科目用英文）
6. 答案索引從 0 開始
7. 嚴禁使用 LaTeX 或數學標記語法（禁止 $、\\times、\\frac、\\sqrt 等），數學式直接用一般文字與符號：× ÷ ² √ π ≤ ≥ ≠，例如「(-5) + 3 × (-2)」
${aiRecentPromptBlock(recent)}`;
try{
const result=await callGemini(prompt,systemInst);
const questions=parseAiQuestions(result,subj);
if(questions.length>0){
const q=questions[0];
if(g&&qSeenHas(g,q)&&att===0)continue; /* 重複題→重抽 */
if(q['題目'])aiPushRecent(subj,unit,q['題目']); /* 記入全服最近題目池，避免之後再出同樣的 */
const vq=await aiVerifyQuestions([q],subj,unit); /* 🔍 AI 二次驗算：重算答案，錯就修正 */
return (vq&&vq[0])?vq[0]:q;
}
}catch(e){if(att===1)return null}
}
return null;
}

/* 🔍 AI 二次驗算：把 AI 剛生成的題目再送去「獨立重算一遍」，答案標錯就自動修正索引與解析。
   所有科目通用；驗算失敗（API/解析問題）時保留原題，絕不阻擋出題 */
async function aiVerifyQuestions(questions,subj,unit){
  if(!Array.isArray(questions)||!questions.length)return questions;
  const systemInst='你是嚴謹的台灣國中閱卷老師，負責逐題驗算選擇題答案是否正確。嚴格按照 JSON 格式回應，不要包含任何額外文字。';
  const prompt=`請驗算以下 ${questions.length} 道「${subj}」選擇題（單元：${unit}）：
每題的「答案」欄是出題者標示的答案索引（0=A，1=B，2=C，3=D）。
請逐題獨立重新解題、驗算：
1. 若標示的答案正確 → 保留原答案索引
2. 若標示的答案錯誤 → 改成正確的答案索引
3. 解析必須與正確答案一致，有誤請一併修正
4. 題目與選項文字必須原封不動照抄，不可更改、不可增刪

${questions.map((q,i)=>'第'+(i+1)+'題：'+JSON.stringify({題目:q['題目'],選項:q['選項'],答案:q['答案'],解析:q['解析']||''})).join('\n')}

回傳嚴格 JSON 陣列（每題一筆，順序對應）：[{"題目":"...","選項":["A","B","C","D"],"答案":0,"解析":"...","驗算":"正確"},...]`;
  try{
    const result=await callGemini(prompt,systemInst);
    const vq=parseAiQuestions(result,subj);
    if(!vq.length)return questions;
    return questions.map(q=>{
      const v=vq.find(x=>x['題目']===q['題目']);
      if(!v||typeof v['答案']!=='number'||v['答案']<0||v['答案']>3)return q;
      const out=Object.assign({},q,{答案:v['答案']});
      if(typeof v['解析']==='string'&&v['解析'])out['解析']=v['解析'];
      return out;
    });
  }catch(e){return questions}
}

/* ════════ 娃娃系統：風火水土四屬性 ════════ */
/* 金木水火土 × 16 MBTI → 獨一無二的人格（80 種組合）*/
const DOLL_RARITY=['R','SR','SSR','UR'];

/* 獨一無二的人格：元素名號 × MBTI 全名 */
/* 性格隨互動持續改變：依互動類型與元素天賦演進 */

function _dGet(){
  const u=me();
  if(u&&u.id){const perUser=_dGetForUser(u.id);return{owned:perUser.owned||[],shop:perUser.shop||[]}}
  return{owned:[],shop:[]};
}
function _dSet(d){
  const u=me();
  if(u&&u.id)_dSetForUser(u.id,d);
}

async function _dTalkRespAI(doll,msg){
  const fallback=_dTalkResp(doll,msg);window._dollApiUsed=false;
  if(typeof callAI!=='function')return fallback;
  const r=DOLL_ELT[doll.element]||DOLL_ELT['?'];
  const history=(doll.history||[]).filter(h=>h.type==='talk').slice(-80).map(h=>((h.message?'User: '+h.message:'')+(h.response?' Doll: '+h.response:''))).join('\n').slice(-10000);
  const pn=_dPersona(doll);
  const sys='You are a unique game doll character named '+pn.name+'. Reply in Traditional Chinese only, first person, natural and concise. Maintain continuity: remember and naturally reference what was said before, forming an ongoing conversation. Let your personality evolve with bond, mood, trust and element. Never mention AI, model, system, or API.';
  const prompt=['Conversation history (up to 10000 chars):',history||'(none)','User said: '+String(msg||''),'Character name: '+pn.name,'Unique personality: '+pn.desc,'Element: '+(doll.element||'?'),'Trait: '+(r.trait||'warm'),'Bond: '+(doll.bond||0),'Mood: '+(doll.mood||50),'Trust: '+(doll.trust||0),'MBTI: '+doll.mbti+' '+(DOLL_MBTI_TRAITS[doll.mbti]||'獨特人格'),'Evolving personality: '+JSON.stringify(_dPersonality(doll)),'Reply with one or two natural sentences only.'].join('\n');
  try{
    const txt=await callAI(prompt,sys);const clean=sanitizeText(txt,240).trim();
    if(clean){window._dollApiUsed=true;return clean;}
  }catch(e){window._dollApiError=e&&e.message||'API failed'}
  return fallback;
}

/* ════════════════════════════════════════════
   vDoll 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 22 個單位：DOLL_MBTI, DOLL_MBTI_FULL, DOLL_ELT_EPI, DOLL_ELT_NATURE, DOLL_MBTI_DELTA, DOLL_ELT_DELTA, DOLL_ELT, _dInputOpen, _dRand, _dDefaultMbti, _dPersonality, _dPersonaName…
   ════════════════════════════════════════════ */
const DOLL_ELEMENTS=['金','木','水','火','土']; const DOLL_MBTI=['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']; const DOLL_MBTI_TRAITS={INTJ:'策略觀察',INTP:'好奇研究',ENTJ:'領導果斷',ENTP:'創意辯證',INFJ:'深情洞察',INFP:'理想溫柔',ENFJ:'溫暖引導',ENFP:'熱情探索',ISTJ:'可靠守序',ISFJ:'細心守護',ESTJ:'務實管理',ESFJ:'親切照顧',ISTP:'冷靜實作',ISFP:'感性自由',ESTP:'勇敢行動',ESFP:'開朗感染'};

const DOLL_MBTI_FULL={INTJ:'建築師',INTP:'邏輯學家',ENTJ:'指揮官',ENTP:'辯論家',INFJ:'提倡者',INFP:'調停者',ENFJ:'主人公',ENFP:'競選者',ISTJ:'物流師',ISFJ:'守衛者',ESTJ:'總經理',ESFJ:'執政官',ISTP:'鑑賞家',ISFP:'探險家',ESTP:'企業家',ESFP:'表演者'};

const DOLL_ELT_EPI={'金':'金石','木':'靈木','水':'流水','火':'燄火','土':'磐土'};

const DOLL_ELT_NATURE={'金':'穩重睿智，重視承諾','木':'生機蓬勃，溫柔包容','水':'沉靜靈敏，善解人意','火':'熱情洋溢，敢想敢做','土':'敦厚踏實，堅守原則'};

const DOLL_MBTI_DELTA={INTJ:{logic:14,curiosity:6},INTP:{logic:12,curiosity:12},ENTJ:{logic:10,energy:6},ENTP:{curiosity:12,energy:8},INFJ:{empathy:14,warmth:8},INFP:{empathy:14,warmth:12},ENFJ:{warmth:14,empathy:10},ENFP:{energy:12,warmth:8},ISTJ:{logic:10},ISFJ:{empathy:10,warmth:8},ESTJ:{logic:8,energy:6},ESFJ:{warmth:12,empathy:8},ISTP:{logic:8,curiosity:6},ISFP:{empathy:10,warmth:6},ESTP:{energy:10,logic:4},ESFP:{energy:10,warmth:8}};

const DOLL_ELT_DELTA={'金':{logic:12},'木':{warmth:8,curiosity:4},'水':{empathy:12,warmth:4},'火':{energy:12,curiosity:6},'土':{logic:6,empathy:8}};

const DOLL_ELT={
  '金':{icon:'🪙',color:'#f6d365',border:'#b8860b',trait:'堅定睿智',bondRate:.75,talk:['（閃著沉穩的光）我會替你想清楚。','（認真端詳）細節也很重要。'],feed:['（仔細品嚐）很有價值的心意。']},
  '木':{icon:'🌿',color:'#8bd17c',border:'#3f8f4f',trait:'成長仁慈',bondRate:.9,talk:['（伸展枝葉）我們一起慢慢長大。','（溫柔地）今天也要照顧好自己。'],feed:['（枝葉舒展）好溫暖的心意。']},
  '風':{icon:'🌬️',color:'#7ff0dd',border:'#38d9c0',trait:'自由輕盈',bondRate:.8,
    talk:['（輕盈地飄動）好高好遠…','（轉了個圈）風告訴我一個秘密！','（翹起腳丫）呼～好舒服～','（閉眼感受）你聽，風在唱歌…'],
    feed:['（輕盈地吃下，像羽毛一樣飄起來）','（開心地轉圈）風的味道！','（飄來飄去）好好吃～']},
  '火':{icon:'🔥',color:'#ff8a65',border:'#e64a19',trait:'熱情衝動',bondRate:.6,
    talk:['（眼睛發亮）我想到一個超棒的計畫！','（握拳）讓我來做！現在就現在！','（燦爛笑）太好了太好了！','（激動地跳）我們一起來吧！'],
    feed:['（一口咬下，火花飛濺）好美味！','（吃得熱熱的）嗯～好滿足！','（開心地吃）哈哈哈太好吃了！']},
  '水':{icon:'💧',color:'#82b1ff',border:'#2979ff',trait:'溫柔包容',bondRate:.95,
    talk:['（輕輕微笑）你今天過得好嗎？','（安靜地看著你）我陪著你。','（像水一樣柔和）沒關係的，慢慢來。','（輕柔地）我懂你的感覺…'],
    feed:['（小口品嚐，表情溫柔）謝謝你。','（安靜地吃）好好吃…','（輕柔笑）你的心意我收到了。']},
  '土':{icon:'🌍',color:'#a1887f',border:'#5d4037',trait:'穩重可靠',bondRate:.7,
    talk:['（穩穩地站著）嗯，我聽懂了。','（沉穩地點頭）讓我來幫你。','（堅定的眼神）我會一直陪著你。','（踏實地）一步一步來就好。'],
    feed:['（穩穩地吃）嗯，很實在的味道。','（認真品嚐）這是大地的味道。','（滿意的點頭）很棒的點心。']}
};

let _dCur=null,_dChat=[],_dInputOpen=false;

function _dRand(a,b){return a+Math.random()*(b-a)}

function _dDefaultMbti(d){return DOLL_MBTI[(String(d.id||d.name||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0))%DOLL_MBTI.length]}

function _dPersonality(d){d.mbti=d.mbti||_dDefaultMbti(d);if(!d.personality||typeof d.personality.warmth!=='number'){const base={warmth:50,energy:50,curiosity:50,logic:50,empathy:50};const ed=DOLL_ELT_DELTA[d.element]||{};const md=DOLL_MBTI_DELTA[d.mbti]||{};Object.keys(base).forEach(k=>{base[k]=Math.max(0,Math.min(100,base[k]+(ed[k]||0)+(md[k]||0)))});d.personality=base;}return d.personality}

function _dPersonaName(d){const el=d.element||'金';const ep=DOLL_ELT_EPI[el]||'靈玉';const fn=DOLL_MBTI_FULL[d.mbti]||d.mbti;return ep+'·'+fn}

function _dPersonaDesc(d){const x=_dPersonality(d);const el=d.element||'金';const base=DOLL_ELT_NATURE[el]||'獨特';const tags=[];if(x.empathy>=65)tags.push('心思細膩、善於傾聽');if(x.logic>=65)tags.push('理性果斷、條理分明');if(x.curiosity>=65)tags.push('求知慾旺盛、愛問為什麼');if(x.warmth>=65)tags.push('待人溫暖、總在身旁');if(x.energy>=65)tags.push('活力四射、行動力強');const lows=[];if(x.empathy<=35)lows.push('偶爾顯得疏離');if(x.logic<=35)lows.push('有時憑感覺行事');if(x.energy<=35)lows.push('沉靜慢熱');const bond=d.bond||0;const mood=d.mood||50;const trust=d.trust||0;const bondLine=bond>=80?'與你默契深厚、心意相通':bond>=50?'與你愈來愈有默契':'正一步步向你敞開心房';return base+'，性格'+(tags.length?tags.slice(0,3).join('、'):'中庸沉穩')+(lows.length?'（'+lows.join('、')+'）':'')+'。'+bondLine+'。目前心情'+(mood>=65?'愉悅':mood>=35?'平穩':'低落')+'，對你的信任'+(trust>=65?'深厚':trust>=35?'漸增':'尚淺')+'。'}

function _dPersona(d){d.personaName=d.personaName||_dPersonaName(d);return{name:d.personaName,desc:_dPersonaDesc(d)}}

function _dEvolve(d,type,foodType){
  const x=_dPersonality(d);
  const evo={talk:{curiosity:2,warmth:1},pet:{empathy:2,warmth:1},feed:{}};
  const feed={sweet:{warmth:3},spicy:{energy:3},sour:{curiosity:3},bitter:{logic:3}};
  const ed=DOLL_ELT_DELTA[d.element]||{};
  const aff=ed.energy>ed.empathy?'energy':ed.empathy>ed.logic?'empathy':ed.logic>ed.warmth?'logic':ed.warmth?'warmth':'curiosity';
  const cur=(evo[type]||{});const fx=(type==='feed'&&foodType&&feed[foodType])?feed[foodType]:{};
  Object.keys(x).forEach(k=>{let delta=(cur[k]||0)+(fx[k]||0);if(k===aff)delta+=0.5;delta+=Math.random()>.5?0.6:-0.4;x[k]=Math.max(0,Math.min(100,Math.round((x[k]+delta)*10)/10))});
  d.personalityVersion=(d.personalityVersion||0)+1;d.personalityUpdatedAt=new Date().toISOString();
}

function _dTalkResp(doll,msg){
  const r=DOLL_ELT[doll.element]||DOLL_ELT['?'];
  const base=r.talk[Math.floor(Math.random()*r.talk.length)];
  if(doll.bond>80)return '（很有默契地）'+base;
  if(doll.bond>50)return base;
  return '（有點害羞地）'+base;
}

function _dPetResp(doll){
  const el=DOLL_ELT[doll.element]||DOLL_ELT['風'];
  const r={
    '風':['（輕盈地蹭你的手心，像一陣風）','（轉個圈，發出了輕快的聲音）','（飄來飄去，最後安靜下來）'],
    '火':['（身體微微發燙，蹭了蹭你）','（開心地跳了一下）','（溫暖地靠過來）'],
    '水':['（溫柔地貼近你）','（輕輕波動，像水面）','（安靜地靠在你身邊）'],
    '土':['（穩穩地靠過來）','（輕輕蹭了蹭，很踏實）','（安靜地陪伴著）']
  };
  return (r[doll.element]||r['風'])[Math.floor(Math.random()*(r[doll.element]||r['風']).length)];
}

/* ════════════════════════════════════════════
   vDoll 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vDoll
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vDoll 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vDoll
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vDoll 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vDoll
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vDoll 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vDoll
   ════════════════════════════════════════════ */
async function vDoll(){
  if(!await needJs(['js/views/vDoll.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vDoll();
}


/* ════════════════════════════════════════════
   vPixel 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 11 個單位：vPixel, pxInit, pxRender, pxClick, pxFill, pxSave, pxMy, pxGallery, pxLike, pxDel, pxToggle
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vPixel / vVideo 懶載入
   ════════════════════════════════════════════ */
async function vPixel(){
  if(!await needJs(['js/views/vPixel.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vPixel();
}

async function vVideo(){
  if(!await needJs(['js/views/vVideos.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vVideo();
}




let SD={id:null,board:'',start:0,sec:0,lock:[],timer:null};

function sdLoad(){
  fetch(SUPA_URL+'/rest/v1/sudoku/new',{headers:{'x-adv9-token':WTOKEN}}).then(r=>r.json()).then(j=>{
    if(!j||!j.ok){$('#sdBody').innerHTML='<div class="panel2" style="text-align:center;padding:30px;color:var(--red)">❌ 題目載入失敗</div>';return}
    SD.id=j.id;SD.board=j.board;SD.start=Date.now();SD.sec=0;
    SD.lock=[];
    for(let i=0;i<81;i++)SD.lock.push(j.board[i]!=='.');
    if(SD.timer)clearInterval(SD.timer);
    SD.timer=setInterval(sdTimer,1000);
    sdRender();
    sdRank();
  }).catch(()=>{$('#sdBody').innerHTML='<div class="panel2" style="text-align:center;padding:30px;color:var(--red)">❌ 網路錯誤，請重試</div>'});
}

function sdRender(){
  $('#sdBody').innerHTML=
  '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start">'+
  '<div class="panel2" style="flex:1;min-width:300px">'+
  '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><b style="color:var(--gold2)">⏱ <span id="sdTime">0:00</span></b>'+
  '<button class="btn ghost mini" onclick="sdLoad()">🔄 重新載入</button></div>'+
  '<div style="display:grid;grid-template-columns:repeat(9,1fr);gap:1px;background:var(--line);border:3px solid var(--line);border-radius:6px;width:min(420px,100%)">'+
  Array.from({length:81},(_,i)=>{
    const r=Math.floor(i/9),c=i%9;
    const isLock=SD.lock[i];
    return '<input data-sd="'+i+'" '+(isLock?'readonly':'')+' value="'+(SD.board[i]==='.'?'':SD.board[i])+'" maxlength="1" oninput="sdCell('+i+')" style="width:100%;aspect-ratio:1;text-align:center;font-size:16px;font-weight:'+(isLock?'900':'400')+';background:'+(isLock?'var(--panel2)':'var(--panel)')+';border:0;color:'+(isLock?'var(--gold2)':'var(--txt)')+';border-top:'+(r%3===0?'2px solid var(--gold)':'')+';border-left:'+(c%3===0?'2px solid var(--gold)':'')+'">';
  }).join('')+'</div>'+
  '<button class="btn big" style="margin-top:10px;width:100%" onclick="sdSubmit()">🏁 提交答案</button></div>'+
  '<div id="sdRankBox" class="panel2" style="flex:1;min-width:280px"></div>'+
  '</div>';
  const el=document.querySelectorAll('input[data-sd]');
  el.forEach(inp=>{const i=parseInt(inp.getAttribute('data-sd'),10);inp.addEventListener('keydown',e=>{if(e.key==='Backspace'||e.key==='Delete'){if(!SD.lock[i])inp.value=''}},true)});
}

function sdCell(i){
  const inp=document.querySelector('input[data-sd="'+i+'"]');
  if(SD.lock[i]){inp.value=SD.board[i];return}
  inp.value=inp.value.replace(/[^1-9]/g,'');
}

function sdTimer(){
  SD.sec=Math.floor((Date.now()-SD.start)/1000);
  const el=document.getElementById('sdTime');if(el)el.textContent=Math.floor(SD.sec/60)+':'+String(SD.sec%60).padStart(2,'0');
}

function sdSubmit(){
  const els=document.querySelectorAll('input[data-sd]');
  let grid='';
  for(let i=0;i<81;i++)grid+=(els[i]&&els[i].value)||'';
  if(grid.replace(/[^1-9]/g,'').length!==81)return toast('還有空格沒填喔！','bad');
  const sec=Math.floor((Date.now()-SD.start)/1000);
  fetch(SUPA_URL+'/rest/v1/sudoku/submit',{method:'POST',headers:{'Content-Type':'application/json','x-adv9-token':WTOKEN},body:JSON.stringify({id:SD.id,grid:grid,sec:sec})}).then(r=>r.json()).then(j=>{
    if(j&&j.ok){toast('🎉 完成！用時 '+Math.floor(j.sec/60)+'分'+j.sec%60+'秒','success');sdRank()}
    else toast('❌ '+(j&&j.msg||'提交失敗'),'bad');
  }).catch(()=>toast('❌ 網路錯誤','bad'));
}

function sdRank(){
  const box=document.getElementById('sdRankBox');if(!box)return;
  fetch(SUPA_URL+'/rest/v1/sudoku/rank',{headers:{'x-adv9-token':WTOKEN}}).then(r=>r.json()).then(j=>{
    if(!j||!j.ok)return;
    const done=j.done||[],best=j.best||[];
    const nameOf=u=>{const f=(get(LS.users,[]).find(x=>x.username===u));return f?f.name||u:u};
    const fmt=s=>Math.floor(s/60)+'分'+s%60+'秒';
    box.innerHTML='<b style="color:var(--gold2)">🏆 本場競速</b>'+
    '<div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">'+
    (done.length?done.slice(0,10).map((d,i)=>'<div style="display:flex;gap:6px;font-size:12.5px;align-items:center"><span style="color:'+(i===0?'var(--gold2)':'var(--mut)')+'">'+(i+1)+'.</span><span style="flex:1">'+esc(nameOf(d.username))+'</span><b style="color:var(--teal)">'+fmt(d.sec)+'</b></div>').join(''):'<span style="font-size:12px;color:var(--mut)">還沒有人完成這張題目，快搶第一！</span>')+
    '</div><div style="border-top:1px solid var(--line);margin:10px 0"></div>'+
    '<b style="color:var(--gold2)">📈 個人最佳排行</b>'+
    '<div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">'+
    (best.length?best.slice(0,10).map((d,i)=>'<div style="display:flex;gap:6px;font-size:12.5px;align-items:center"><span style="color:'+(i===0?'var(--gold2)':'var(--mut)')+'">'+(i+1)+'.</span><span style="flex:1">'+esc(nameOf(d.username))+'</span><b style="color:var(--teal)">'+fmt(d.sec)+'</b></div>').join(''):'<span style="font-size:12px;color:var(--mut)">尚無紀錄</span>')+
    '</div>';
  }).catch(()=>{});
}

/* ════════════════════════════════════════════
   vClassWar 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：vClassWar, cwLoad, cwRender
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vClassWar 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：vClassWar, cwLoad, cwRender
   ════════════════════════════════════════════ */
let CW_STATE={rows:[],ts:0};

async function vClassWar(){
  if(!await needJs(['js/views/vClassWar.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vClassWar();
}

function cwLoad(){
  fetch(SUPA_URL+'/rest/v1/class_war',{headers:{'x-adv9-token':WTOKEN}}).then(r=>r.json()).then(j=>{
    if(!j||!j.ok)return;
    CW_STATE.rows=j.rows||[];
    cwRender();
  }).catch(()=>{});
}

function cwRender(){
  const body=document.getElementById('cwBody');if(!body)return;
  const rows=CW_STATE.rows;
  const cls=get(LS.classes,{})||{};
  const nameOf=cid=>((cls.names||{})[cid])||cid;
  const totalQ=rows.reduce((n,r)=>n+r.total,0);
  const totalMin=rows.reduce((n,r)=>n+r.minutes,0);
  if(!rows.length){body.innerHTML='<div class="panel2" style="text-align:center;padding:40px;color:var(--mut)">還沒有班級數據</div>';return}
  body.innerHTML=
  '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px">'+
  '<div class="panel2" style="flex:1;min-width:140px;text-align:center;margin:0"><div style="font-size:22px;font-weight:900;color:var(--gold2)">'+totalQ+'</div><div style="font-size:11.5px;color:var(--mut)">全服總答題數</div></div>'+
  '<div class="panel2" style="flex:1;min-width:140px;text-align:center;margin:0"><div style="font-size:22px;font-weight:900;color:var(--teal)">'+Math.floor(totalMin/60)+'h'+totalMin%60+'m</div><div style="font-size:11.5px;color:var(--mut)">全服上線時間</div></div></div>'+
  '<div class="panel2" style="margin:0">'+rows.map((r,i)=>
  '<div style="display:flex;align-items:center;gap:10px;padding:10px 4px;border-bottom:'+(i<rows.length-1?'1px solid var(--line)':'')+'">'+
  '<span style="font-size:20px">'+(i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1))+'</span>'+
  '<div style="flex:1"><b style="font-size:14px">'+esc(nameOf(r.classId))+'</b><div style="font-size:11px;color:var(--mut)">'+r.users+' 人</div></div>'+
  '<div style="text-align:right"><div style="font-weight:900;color:var(--gold2);font-size:14px">'+r.total+' 題</div><div style="font-size:11px;color:var(--teal)">⏱ '+Math.floor(r.minutes/60)+'h'+r.minutes%60+'m</div></div>'+
  '</div>').join('')+'</div>';
}




function dollStatHtml(label,label2,val,color){
  return '<div class="statBar"><div class="statLbl"><span>'+label2+'</span><span>'+Math.round(val)+'</span></div><div class="statTrack"><div class="statFill w" style="width:'+Math.min(100,Math.max(0,val))+'%;background:'+color+'"></div></div></div>';
}

function showDollTalkInput(){
  document.getElementById('dollTalkInput').style.display='flex';
  document.getElementById('dollTalkTxt').focus();
}

function doDollTalk(){_dInputOpen=true;showDollTalkInput();}

let DOLL_EVENTS=[];


function dollListHtml(owned,shopDolls,u,g,d,mult){
  if(owned.length===0){
    return '<div class="panel2" style="text-align:center;padding:40px;color:var(--mut)"><div style="font-size:40px;margin-bottom:12px">🌟</div><b style="color:var(--pink2);font-family:var(--serif);font-size:16px">還沒有娃娃夥伴</b><p style="margin-top:8px;font-size:13px">點擊「✨ 創造娃娃」開始你的娃娃養成之旅！</p></div>';
  }
  return '<div class="featGrid">'+owned.map(dd=>{
    const el=DOLL_ELT[dd.element]||DOLL_ELT['風'];
    return '<div class="dollCard '+dd.rarity.toLowerCase()+'" style="border-color:'+el.border+';background:'+el.bg+'" onclick="openDoll(\''+dd.id+'\')">'+
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'+
        '<div class="dollAvatar" style="border-color:'+el.color+'">'+(dd.emoji||el.icon||'🌟')+'</div>'+
        '<div style="flex:1">'+
          '<h4 style="color:'+el.color+'">'+esc(dd.name)+'</h4>'+
          '<div class="dollMeta">'+
            '<span class="rarityTag rarity-'+dd.rarity+'">'+dd.rarity+'</span>'+
            '<span style="color:'+el.color+'">'+dd.element+' · '+el.trait+'</span>'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="dollStats">'+
        dollStatHtml('','💕 親密度',dd.bond||0,el.color)+
        dollStatHtml('','🌟 元素共振',Math.round((dd.elementBoost||0)*100),el.color)+
        dollStatHtml('','😊 心情',Math.round((dd.mood||50)),el.color)+
        dollStatHtml('','🤝 信任',Math.round((dd.trust||0)),el.color)+
      '</div>'+
      '<div style="margin-top:8px;font-size:10px;color:var(--mut);text-align:center">✨ 印記：'+esc(dd.imprint||'—')+'</div>'+
    '</div>';
  }).join('')+
  '<div style="margin-top:20px"><button class="btn ghost" style="width:100%" onclick="renderDollShop()">🛒 前往商店購買新娃娃</button></div>'+
  (shopDolls.length?'<div style="margin-top:14px"><b style="color:var(--gold);font-size:13px">🛒 商店預覽</b><div class="shopGrid" style="margin-top:8px">'+
    shopDolls.slice(0,4).map(s=>'<div class="shopItem" onclick="buyDollFromShop(\''+s.id+'\')">'+
      '<div class="sIcon">'+esc(s.emoji||'🌟')+'</div>'+
      '<div class="sName">'+esc(s.name)+'</div>'+
      '<div class="sPrice">🪙 '+s.price+'</div>'+
      '<div style="font-size:9px;color:var(--mut);margin-top:4px">'+s.element+' · '+s.rarity+'</div>'+
    '</div>').join('')+'</div></div>':'');
}


function openDoll(id){
  const d=_dGet();
  var _u=me();
  const doll=d.owned.find(x=>x.id===id&&_u&&x.owner===_u.id);
  if(!doll)return toast('娃娃不存在','bad');
  _dCur=doll;
  /* 重開後仍顯示之前的對話紀錄（連續聊天）*/
  _dChat=(doll.history||[]).filter(h=>h.type==='talk').slice(-40).reduce((arr,h)=>{
    if(h.message)arr.push({type:'user',text:h.message});
    if(h.response)arr.push({type:'doll',text:h.response});
    return arr;
  },[]);
  renderDollView(doll);
}

function renderDollView(doll){
  const el=DOLL_ELT[doll.element]||DOLL_ELT['風'];
  const pn=_dPersona(doll);
  $('#dollView').innerHTML=
    back('vDoll()')+
    '<div style="display:flex;gap:14px;align-items:center;margin-bottom:16px">'+
      '<div class="dollAvatar" style="width:72px;height:72px;font-size:36px;border-radius:16px;border-color:'+el.color+'">'+(doll.emoji||el.icon||'🌟')+'</div>'+
      '<div>'+
        '<b style="font-family:var(--serif);font-size:20px;color:'+el.color+';display:block">'+esc(doll.name)+'</b>'+
        '<div style="font-size:12px;color:var(--mut);margin-top:4px">'+
          '<span class="rarityTag rarity-'+doll.rarity+'">'+doll.rarity+'</span> '+
          doll.element+' · '+el.trait+
          ' ｜✨ 印記：'+esc(doll.imprint)+' ｜💬 已互動 '+doll.interactCount+' 次'+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div class="panel2" style="margin-bottom:12px;border-left:4px solid '+el.color+'">'+
      '<b style="color:'+el.color+';font-size:13px">🧬 獨特人格：'+esc(pn.name)+'</b>'+
      '<div style="font-size:12px;color:var(--mut);margin-top:4px;line-height:1.7">'+esc(pn.desc)+'</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 12px;margin-top:8px">'+
        dollStatHtml('','❤️ 溫暖',doll.personality.warmth,el.color)+
        dollStatHtml('','⚡ 活力',doll.personality.energy,el.color)+
        dollStatHtml('','🔍 好奇',doll.personality.curiosity,el.color)+
        dollStatHtml('','🧠 理性',doll.personality.logic,el.color)+
        dollStatHtml('','🤝 同理',doll.personality.empathy,el.color)+
        '<div style="font-size:11px;color:var(--mut);grid-column:1/-1;margin-top:4px">🔄 人格演進 Lv.'+(doll.personalityVersion||0)+(doll.personalityUpdatedAt?'（更新於 '+new Date(doll.personalityUpdatedAt).toLocaleString('zh-TW')+'）':'')+'，會隨互動持續改變</div>'+
      '</div>'+
    '</div>'+
    '<div class="dollInteract">'+
      '<button class="dollIBtn" onclick="doDollTalk()"><span class="iIcon">💬</span><span class="iLabel">對話</span></button>'+
      '<button class="dollIBtn" onclick="doDollPet()"><span class="iIcon">🤗</span><span class="iLabel">摸頭</span></button>'+
      '<button class="dollIBtn" onclick="showDollFeed()"><span class="iIcon">🍎</span><span class="iLabel">餵食</span></button>'+
    '</div>'+
    '<div id="dollFeedArea"></div>'+
    '<div class="dollChat" id="dollChatArea">'+(_dChat.length?_dChat.map(m=>'<div class="dollMsg '+m.type+'">'+esc(m.text)+'</div>').join(''):'<div style="color:var(--mut);text-align:center;font-size:12px;padding:20px">與娃娃開始對話吧！</div>')+'</div>'+
    '<div id="dollTalkInput" style="display:'+(_dInputOpen?'flex':'none')+'" class="dollInput">'+
      '<input id="dollTalkTxt" placeholder="輸入你想對 '+esc(doll.name)+' 說的話..." maxlength="500" onkeydown="if(event.key===\'Enter\')sendDollTalk()">'+
      '<button class="btn btn-primary" onclick="sendDollTalk()">發送</button>'+
    '</div>'+
    '<div class="dollStats" style="margin-top:14px">'+
      dollStatHtml('','💕 親密度',doll.bond||0,el.color)+
      dollStatHtml('','🌟 元素共振',Math.round((doll.elementBoost||0)*100),el.color)+
      dollStatHtml('','😊 心情',Math.round((doll.mood||50)),el.color)+
      dollStatHtml('','🤝 信任',Math.round((doll.trust||0)),el.color)+
    '</div>'+
    (doll.history&&doll.history.length?'<div class="dollHistory"><div class="dollHistTitle">📜 互動紀錄（最近 8 筆）</div>'+
      doll.history.slice(-8).reverse().map(h=>'<div class="dollHistItem"><span class="hIcon">'+({talk:'💬',pet:'🤗',feed:'🍎'}[h.type]||'✨')+'</span><span class="hType">'+({talk:'對話',pet:'摸頭',feed:'餵食'}[h.type]||h.type)+'</span><span style="flex:1">'+(h.response?esc(h.response.substring(0,40))+'...':'')+'</span><span>'+new Date(h.time).toLocaleDateString('zh-TW')+'</span></div>').join('')+'</div>':'')+
    '<div style="margin-top:12px;display:flex;gap:8px">'+
      '<button class="btn danger mini" onclick="deleteDoll(\''+doll.id+'\')">🗑️ 捨棄娃娃</button>'+
    '</div>';
  /* 每次新訊息都自動捲到最下面，持續聊天不需手動下拉 */
  const ca=document.getElementById('dollChatArea');if(ca)ca.scrollTop=ca.scrollHeight;
  if(_dInputOpen){const it=document.getElementById('dollTalkTxt');if(it)it.focus();}
}


function doDollPet(){
  if(!_dCur)return;
  const d=_dGet();const doll=d.owned.find(x=>x.id===_dCur.id);if(!doll)return;
  const el=DOLL_ELT[doll.element]||DOLL_ELT['風'];
  const bondGain=Math.round(el.bondRate*_dRand(3,8));
  doll.bond=Math.min(100,(doll.bond||0)+bondGain);
  doll.mood=Math.min(100,(doll.mood||50)+_dRand(5,15)|0);
  doll.trust=Math.min(100,(doll.trust||0)+_dRand(2,6)|0);
  doll.elementBoost=Math.min(1,(doll.elementBoost||0)+_dRand(0.01,0.03));
  const resp=_dPetResp(doll);
  doll.history=doll.history||[];
  doll.history.push({time:new Date().toISOString(),type:'pet',response:resp,bondGain});
  if(doll.history.length>120)doll.history=doll.history.slice(-120);
  doll.lastInteract=new Date().toISOString();doll.interactCount=(doll.interactCount||0)+1;_dEvolve(doll,'pet');
  _dSet(d);_dCur=doll;_dChat.push({type:'doll',text:resp});
  renderDollView(doll);toast('💕 親密度 +'+bondGain,'success');
}

function showDollFeed(){
  if(!_dCur)return;
  const area=document.getElementById('dollFeedArea');
  if(area.innerHTML.trim()){area.innerHTML='';return;}
  area.innerHTML='<b style="font-size:12px;color:var(--mut);display:block;margin-bottom:8px">選擇食物餵食：</b>'+
    '<div class="dollFoodGrid">'+
    [{t:'sweet',i:'🍬',n:'甜食',d:'心情↑'}, {t:'spicy',i:'🌶️',n:'辣食',d:'信任↑'}, {t:'sour',i:'🍋',n:'酸食',d:'共振↑'}, {t:'bitter',i:'🍵',n:'苦食',d:'親密度↑'}].map(f=>
      '<button class="dollFoodBtn" onclick="doDollFeed(\''+f.t+'\')"><span class="fIcon">'+f.i+'</span><span class="fName">'+f.n+'</span><span class="fDesc">'+f.d+'</span></button>'
    ).join('')+'</div>';
}

function doDollFeed(type){
  if(!_dCur)return;
  document.getElementById('dollFeedArea').innerHTML='';
  const d=_dGet();const doll=d.owned.find(x=>x.id===_dCur.id);if(!doll)return;
  const el=DOLL_ELT[doll.element]||DOLL_ELT['風'];
  const effects={sweet:{mood:10,trust:0,elementBoost:0,bond:3},spicy:{mood:0,trust:10,elementBoost:0,bond:2},sour:{mood:0,trust:0,elementBoost:8,bond:2},bitter:{mood:-5,trust:0,elementBoost:0,bond:8}};
  const ef=effects[type]||effects.sweet;
  doll.mood=Math.min(100,Math.max(0,(doll.mood||50)+ef.mood));
  doll.trust=Math.min(100,Math.max(0,(doll.trust||0)+ef.trust));
  doll.elementBoost=Math.min(1,(doll.elementBoost||0)+ef.elementBoost*0.01);
  doll.bond=Math.min(100,(doll.bond||0)+ef.bond);
  const resp=el.feed[Math.floor(Math.random()*el.feed.length)];
  doll.history=doll.history||[];
  doll.history.push({time:new Date().toISOString(),type:'feed',response:resp,foodType:type,bondGain:ef.bond});
  if(doll.history.length>120)doll.history=doll.history.slice(-120);
  doll.lastInteract=new Date().toISOString();doll.interactCount=(doll.interactCount||0)+1;_dEvolve(doll,'feed',type);
  _dSet(d);_dCur=doll;_dChat.push({type:'doll',text:resp});
  renderDollView(doll);toast('💕 親密度 +'+ef.bond,'success');
}

async function sendDollTalk(){
  const box=document.getElementById('dollTalkTxt');
  const txt=box.value.trim();
  if(!txt||!_dCur)return;
  box.value='';
  _dChat.push({type:'user',text:txt});
  const d=_dGet();const doll=d.owned.find(x=>x.id===_dCur.id);if(!doll)return;
  let resp=_dTalkResp(doll,txt);
  try{resp=await _dTalkRespAI(doll,txt)}catch(e){}
  if(!window._dollApiUsed)toast(window._dollApiError?'⚠️ 娃娃 API 呼叫失敗，已使用性格備援':'⚠️ 尚未設定可用 API，已使用性格備援','bad');
  doll.mood=Math.min(100,Math.max(0,(doll.mood||50)+_dRand(-2,5)|0));
  doll.trust=Math.min(100,Math.max(0,(doll.trust||0)+_dRand(1,4)|0));
  doll.elementBoost=Math.min(1,(doll.elementBoost||0)+_dRand(0.005,0.02));
  doll.history=doll.history||[];
  doll.history.push({time:new Date().toISOString(),type:'talk',response:resp,message:txt});
  if(doll.history.length>120)doll.history=doll.history.slice(-120);
  doll.lastInteract=new Date().toISOString();doll.interactCount=(doll.interactCount||0)+1;_dEvolve(doll,'talk');
  _dSet(d);_dCur=doll;_dChat.push({type:'doll',text:resp});
  renderDollView(doll);
}
function deleteDoll(id){
  if(!confirm('確定要捨棄這個娃娃嗎？所有互動紀錄將消失。'))return;
  const d=_dGet();
  d.owned=d.owned.filter(x=>x.id!==id);
  _dSet(d);toast('🗑️ 娃娃已捨棄','success');vDoll();
}

function showDollCreate(){
  const eltHtml=DOLL_ELEMENTS.map(e=>{const el=DOLL_ELT[e]||{};return '<button class="mbtiBtn" onclick="selDollElement(\''+e+'\',this)">'+e+'<span class="mbName">'+el.trait+'</span></button>';}).join('');
  openModal('<div class="createForm">'+
    '<div class="fg"><label>娃娃名稱</label><input id="dNewName" placeholder="給她一個名字..." maxlength="20"></div>'+
    '<div class="fg"><label>選擇屬性</label><div class="mbtiGrid">'+eltHtml+'</div><input type="hidden" id="dNewElement" value="金"></div>'+
    '<div class="fg"><label>MBTI 人格</label><select id="dNewMbti" onchange="dollPersonaPreview()">'+DOLL_MBTI.map(x=>'<option value="'+x+'">'+x+' · '+DOLL_MBTI_TRAITS[x]+'</option>').join('')+'</select></div>'+ '<div class="fg"><label>稀有度</label><select id="dNewRarity">'+DOLL_RARITY.map(r=>'<option value="'+r+'">'+r+'</option>').join('')+'</select></div>'+
    '<div id="dPersonaPrev" class="panel2" style="margin-top:10px;font-size:12.5px;border-left:4px solid var(--pink2)"></div>'+
    '<button class="btn btn-primary big" style="margin-top:12px" onclick="createDoll()">✨ 創造娃娃</button>'+
  '</div>');
  dollPersonaPreview();
}



function createDoll(){
  try{
    const name=(document.getElementById('dNewName')||{}).value.trim();
    if(!name)return toast('請輸入娃娃名稱','bad');
    const u=me();if(!u||!u.id)return toast('請先登入再創造娃娃','bad');
    const d=_dGet();d.owned=d.owned||[];
    if(d.owned.filter(x=>x.owner===u.id).length>=1)return toast('🌟 每個人只能擁有一個娃娃！','bad'); /* v4.0 一人一個 */
    const element=((document.getElementById('dNewElement')||{}).value||'金');
    const mbti=((document.getElementById('dNewMbti')||{}).value||'INFJ').split(' ')[0];
    const rarity=((document.getElementById('dNewRarity')||{}).value||'R');
    const el=DOLL_ELT[element]||DOLL_ELT['金'];
    const doll={id:_dGenId(),name,element,emoji:el.icon,rarity,bond:0,mood:50,trust:0,elementBoost:0,mbti,personality:_dPersonality({id:_dGenId(),element,mbti}),personalityVersion:0,personaName:_dPersonaName({element,mbti}),imprint:_dImprint(),owner:u.id,createdAt:new Date().toISOString(),lastInteract:new Date().toISOString(),interactCount:0,history:[]};
    d.owned.push(doll);_dSet(d);
    closeModal();toast('✨ 新娃娃「'+name+'」（'+element+'・'+mbti+'）創造成功！','success');vDoll();
  }catch(e){console.error('[DOLL_CREATE]',e);toast('⚠️ 娃娃建立失敗：'+(e.message||'資料錯誤'),'bad')}
}

function renderDollShop(){
  const d=_dGet();const u=me(),g=u.g;
  const shop=d.shop||[];
  if(!shop.length){
    $('#dollView').innerHTML=
      back('vDoll()')+'<h3 class="vt">🛒 娃娃商店 <span class="vsub">目前尚無商品，請等待管理員上架</span></h3>'+
      '<div class="panel2" style="text-align:center;padding:40px;color:var(--mut)"><div style="font-size:40px;margin-bottom:12px">🛒</div><b>商店暫空</b><p style="margin-top:8px;font-size:13px">管理員正在準備可愛娃娃...</p></div>';
    return;
  }
  $('#dollView').innerHTML=
    back('vDoll()')+'<h3 class="vt">🛒 娃娃商店 <span class="vsub">用 🪙 金幣購買新娃娃</span></h3>'+
    '<div class="panel2" style="margin-bottom:12px;font-size:12.5px;color:var(--gold2)">💰 你的金幣：🪙'+g.gold+'</div>'+
    '<div class="shopGrid">'+shop.map(s=>{
      const el=DOLL_ELT[s.element]||DOLL_ELT['風'];
      return '<div class="shopItem" onclick="buyDollFromShop(\''+s.id+'\')">'+
        '<div class="sIcon">'+esc(s.emoji||el.icon||'🌟')+'</div>'+
        '<div class="sName">'+esc(s.name)+'</div>'+
        '<div class="sPrice">🪙 '+s.price+'</div>'+
        '<div style="font-size:9px;color:var(--mut);margin-top:4px">'+s.element+' · '+el.trait+' · '+s.rarity+'</div>'+
      '</div>';
    }).join('')+'</div>';
}

function buyDollFromShop(sid){
  const d=_dGet();const u=me(),g=u.g;
  if(d.owned.filter(x=>x.owner===u.id).length>=1)return toast('🌟 每個人只能擁有一個娃娃！','bad'); /* v4.0 一人一個 */
  const s=d.shop&&d.shop.find(x=>x.id===sid);
  if(!s)return toast('娃娃不存在','bad');
  if(g.gold<s.price)return toast('🪙 金幣不足！（需要 '+s.price+'）','bad');
  g.gold-=s.price;saveU(u);
  const el=DOLL_ELT[s.element]||DOLL_ELT['風'];
  const doll={
    id:_dGenId(),name:s.name,element:s.element,emoji:s.emoji||el.icon,rarity:s.rarity,
    bond:0,mood:50,trust:0,elementBoost:0,
    imprint:_dImprint(),owner:u.id,
    createdAt:new Date().toISOString(),lastInteract:new Date().toISOString(),
    interactCount:0,history:[]
  };
  d.owned=d.owned||[];d.owned.push(doll);_dSet(d);
  saveU(u);hud();
  toast('🎉 獲得新娃娃「'+s.name+'」（'+s.element+'）！','success');vDoll();
}

function loadDollEvents(){
  DOLL_EVENTS=get(LS.events,[]);
}
loadDollEvents();

/* ═══════════════════════════════════════════════════════════════════
   ★ 裝備・副本戰鬥・重新滾動統計值系統（v3.0★ 九大強化版）
   ═══════════════════════════════════════════════════════════════════ */