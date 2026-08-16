/* ════════════════════════════════════════════════════
   題庫（BANK 資料、bankQ、procMathQ、shuffleQ、qHash、qSeenHas、fallbackQ）
   由 tools/build/split.py 從 public/index.html 抽出（懶載入模組）
   ════════════════════════════════════════════════════ */
/* ════════ 題庫 ════════ */

const BANK={

'數學':{'整數運算':{'簡單':[

{'題目':'計算 (-3) + (+5) = ?','選項':['-8','2','-2','8'],'答案':1,'解析':'1. 異號兩數相加\n2. 取絕對值大的符號：|5|>|3| 故為正\n3. 5 - 3 = 2'},

{'題目':'數線上 -2 與 3 的距離為何？','選項':['1','5','-5','3'],'答案':1,'解析':'1. 距離 = |a - b|\n2. |3 - (-2)| = |3 + 2| = 5\n3. 距離恆為非負數'},

{'題目':'(-4) × (-3) = ?','選項':['-12','12','-7','7'],'答案':1,'解析':'1. 負負得正\n2. |−4|×|−3| = 12\n3. 兩負數相乘為正'}],

'困難':[{'題目':'若 a=-2、b=3、c=-1，求 |a×b - c²| + a² = ?','選項':['9','11','7','13'],'答案':1,'解析':'1. a×b = -6，c² = 1，a² = 4\n2. |−6 − 1| = 7\n3. 7 + 4 = 11'}]},

'一元一次方程式':{'簡單':[

{'題目':'解方程式 x + 3 = 11，x = ?','選項':['3','4','5','7'],'答案':1,'解析':'1. 移項：x = 11 − 3 = 8\n2. x = 8\n3. 移項要變號'},

{'題目':'解方程式 3x - 5 = 10，x = ?','選項':['3','5','15','4'],'答案':1,'��析':'1. 3x = 10 + 5 = 15\n2. x = 15 ÷ 3 = 5\n3. 先移項���除���係數'}],

'困難':[{'題目':'解 3(2x-1) - 2(x+4) = x + 5，x = ?','選項':['16/3','4','6','5'],'答案':0,'解析':'1. 展開：6x − 3 − 2x − 8 = x + 5\n2. 4x ��� 11 = x + 5 → 3x = 16\n3. x = 16/3'}]}},

'英文':{'Be動詞':{'簡單':[

{'題目':'She ___ a student.','選項':['am','is','are','be'],'答案':1,'解析':'1. 主詞 She 為第三人稱單數\n2. Be 動詞用 is\n3. 口訣：I 用 am，You/複數用 are，He/She/It 用 is'},

{'題目':'Which sentence is correct?','選項':['They is happy.','We am students.','I are a teacher.','You are my friend.'],'答案':3,'解析':'1. You 搭配 are\n2. They 應配 are\n3. 注意主詞與 Be 動詞一致性'}],

'困難':[{'題目':"Neither Tom nor his brothers ___ at home, but either his mother or his father ___ there.",'選項':['is; are','are; is','are; are','is; is'],'答案':1,'解析':'1. neither…nor 動詞隨最近主詞 brothers → are\n2. either…or 隨 father → is\n3. 就近原則'}]},

'現在簡單式':{'簡單':[

{'題目':'He ___ to school every day.','選項':['go','goes','going','gone'],'答案':1,'解析':'1. 第三人稱單數現在簡單式\n2. 動詞加 s/es → goes\n3. every day 為現在簡單式訊號'},

{'題目':'They ___ basketball after school.','選項':['plays','play','playing','played'],'答案':1,'解析':'1. They 為複數主詞\n2. 動詞用原形 play\n3. 第三人稱單數才加 s'}],

'困難':[{'題目':'Which sentence is grammatically INCORRECT?','選項':["She doesn't like coffee.","He don't have a car.",'Do they know the answer?','Does she play tennis?'],'答案':1,'解析':"1. He 應搭配 doesn't\n2. 正確：He doesn't have a car\n3. 三單否定用 doesn't + 原形動詞"}]}}

};

function bankQ(subj,unit,diff){

const tier=diff>=50?'困難':'簡單';

const _mu=(typeof me==='function'&&me())?me():null;const g=_mu&&_mu.g?_mu.g:null;

if(subj==='數學'&&Math.random()<.5)return procMathQ(tier); /* 數學半數改用隨機出題器，避免題庫太小一直重複 */

try{const qs=BANK[subj][unit][tier];if(qs&&qs.length){

const unseen=g?qs.filter(q=>!qSeenHas(g,q)):qs; /* 優先出沒出過的題 */

if(!unseen.length){if(subj==='數學')return procMathQ(tier); /* 數學全出過→改隨機出題器，不重複 */

if(g){g.qSeen=(g.qSeen||[]).filter(h=>!qs.some(q=>qHash(q['題目'])===h));saveU(_mu)}} /* 其餘科目全部出過則重置本單元輪迴 */

return shuffleQ(JSON.parse(JSON.stringify(pick(unseen.length?unseen:qs))))}}catch(e){}

return fallbackQ(subj,unit,tier);

}

/* 數學隨機出題器：每次隨機數字，題目永不重複 */

function procMathQ(tier){

const R=(a,b)=>a+((Math.random()*(b-a+1))|0);

const mk=(q,ans,exp)=>{const s=new Set([ans]);while(s.size<4){const c=ans+R(-9,9);if(c!==ans)s.add(c)}const o=[...s].sort(()=>Math.random()-.5);return{'題目':q,'選項':o.map(String),'答案':o.indexOf(ans),'解析':exp}};

if(tier==='困難'){const t=R(1,4);

if(t===1){const s=R(3,9),p=R(2,18);return mk('若 a + b = '+s+'，ab = '+p+'，則 a² + b² = ?',s*s-2*p,'1. (a+b)² = a²+2ab+b²\n2. a²+b² = '+s+'² − 2×'+p+'\n3. = '+(s*s)+' − '+(2*p)+' = '+(s*s-2*p))}

if(t===2){const a=R(2,9),x=R(2,12),b=R(1,20),c=a*x+b;return mk('解方程式：'+a+'x + '+b+' = '+c+'，x = ?',x,'1. '+a+'x = '+c+' − '+b+' = '+(c-b)+'\n2. x = '+(c-b)+' ÷ '+a+'\n3. x = '+x)}

if(t===3){const k=R(1,5);return mk('直角三角形兩股為 '+(3*k)+' 與 '+(4*k)+'，斜邊長 = ?',5*k,'1. 畢氏定理 c² = a²+b²\n2. c² = '+(9*k*k)+'+'+(16*k*k)+' = '+(25*k*k)+'\n3. c = '+(5*k))}

const n=R(2,6),m=R(2,4);return mk('2^'+n+' × 2^'+m+' = 2 的幾次方？',n+m,'1. 同底數相乘、指數相加\n2. '+n+' + '+m+' = '+(n+m)+'\n3. 答案為 2^'+(n+m))}

const t=R(1,4);

if(t===1){const a=R(11,99),b=R(11,99);return mk(a+' + '+b+' = ?',a+b,'1. 直式相加\n2. '+a+' + '+b+'\n3. = '+(a+b))}

if(t===2){const a=R(3,12),b=R(3,12);return mk(a+' × '+b+' = ?',a*b,'1. 九九乘法延伸\n2. '+a+' × '+b+'\n3. = '+(a*b))}

if(t===3){const x=R(2,9),c=R(1,9);return mk('若 x = '+x+'，則 2x + '+c+' = ?',2*x+c,'1. 代入 x = '+x+'\n2. 2×'+x+' + '+c+'\n3. = '+(2*x+c))}

const a=R(40,99),b=R(11,39);return mk(a+' − '+b+' = ?',a-b,'1. 直式相減\n2. '+a+' − '+b+'\n3. = '+(a-b))}

function shuffleQ(q){const o=q['選項'],c=o[q['答案']];for(let i=o.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;const t=o[i];o[i]=o[j];o[j]=t}q['答案']=o.indexOf(c);return q}

/* 打亂題目陣列順序（Fisher-Yates），不回傳新陣列 */
function shuffleQOrder(arr){for(let i=arr.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;const t=arr[i];arr[i]=arr[j];arr[j]=t}return arr}

/* 題目去重：每位學生記錄出過的題目雜湊，確保每次題目都不一樣 */

function qHash(s){let h=0;s=String(s||'');for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return h.toString(36)}

function qSeenHas(g,q){return !!g&&(g.qSeen||[]).includes(qHash(q&&q['題目']))}

function qMarkSeen(g,q){if(!g||!q)return;g.qSeen=g.qSeen||[];g.qSeenTxt=g.qSeenTxt||[];const h=qHash(q['題目']);

if(!g.qSeen.includes(h)){g.qSeen.push(h);if(g.qSeen.length>800)g.qSeen=g.qSeen.slice(-800);

g.qSeenTxt.push(String(q['題目']).slice(0,42));if(g.qSeenTxt.length>8)g.qSeenTxt=g.qSeenTxt.slice(-8)}}

function fallbackQ(subj,unit,tier){

if(subj==='數學')return procMathQ(tier); /* 數學一律用隨機出題器，不再固定同一題 */

const T={

'數學':tier==='困難'?{'題目':'若 a + b = 5，ab = 6，則 a² + b² = ?','選項':['13','11','25','19'],'答案':0,'解析':'1. (a+b)² = a² + 2ab + b²\n2. 25 = a² + b² + 12\n3. a² + b² = 13'}:{'題目':'若 x = 3，則 2x + 1 = ?','選項':['5','7','6','9'],'答案':1,'解析':'1. 代入 x = 3\n2. 2×3 + 1 = 7\n3. 代入法'},

'英文':{'題目':'Choose the correct sentence.','選項':['She go to school.','She goes to school.','She going to school.','She gone to school.'],'答案':1,'解析':'1. 第三人稱單數現在簡單式\n2. 動詞加 es\n3. goes 正確'},

'國文':{'題目':'「床前明月光」的作者是誰？','選項':['杜甫','李白','白居易','王維'],'答案':1,'解析':'1. 出自《靜夜思》\n2. 作者為詩仙李白\n3. 唐詩代表作'},

'自然':{'題目':'下列何者為光合作用必需的條件？','選項':['光照與葉綠素','高溫與高壓','氧氣與糖分','土壤與風'],'答案':0,'解析':'1. 光合作用需要光與葉綠素\n2. 產生醣類與氧氣\n3. 場所為葉綠體'},

'社會':{'題目':'臺灣在荷西時期，哪國曾占領臺南？','選項':['西班牙','荷蘭','葡萄牙','英國'],'答案':1,'解析':'1. 1624 年荷蘭占領臺南\n2. 西班牙占領北部\n3. 1662 年鄭成功驅逐荷蘭'}

};

return T[subj]||{'題目':'【'+subj+'・'+unit+'】下列敘述何者正確？','選項':['選項 A（正確答案）','選項 B','選項 C','選項 D'],'答案':0,'解析':'1. 本題為該單元觀念題\n2. A 為正確敘述\n3. 其餘為常見迷思觀念'};

}

/* ════════ 遊戲資料結構 ════════ */

