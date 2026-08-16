/* ════════════════════════════════════════════
   vHome 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 47 個單位：SUPA_KEY, WTOKEN, mediaHeaders, upProg, GDRIVE_URL, gdDelete, _hbTimer, stopHeartbeat, updateOnlBadges, _es, stopStream, closeReqPanel…
   ════════════════════════════════════════════ */
const SUPA_KEY='sb_publishable_hmOcXUgwSE2wWv7vwOs1WQ_1T2X65mA'; /* anon public key */

let WTOKEN=localStorage.getItem('ADV9_WTOKEN')||''; /* 🎫 登入 token：所有寫入需帶，僅存本機不同步 */

function mediaHeaders(ct){const h={'apikey':SUPA_KEY};if(WTOKEN)h['x-adv9-token']=WTOKEN;if(ct)h['Content-Type']=ct;if(/^eyJ/.test(SUPA_KEY))h['Authorization']='Bearer '+SUPA_KEY;return h}

function upProg(pct,label){
let w=document.getElementById('__upProg');
if(pct===null){if(w)w.remove();return}
if(!w){w=document.createElement('div');w.id='__upProg';
w.style.cssText='position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:2147483000;background:rgba(13,21,38,.97);border:1px solid #7a5f27;border-radius:10px;padding:10px 16px;min-width:250px;box-shadow:0 8px 24px rgba(0,0,0,.55);font-family:sans-serif;pointer-events:none';
w.innerHTML='<div id="__upTxt" style="font-size:12.5px;color:#ffd97a;font-weight:700;margin-bottom:6px"></div><div style="height:8px;background:rgba(0,0,0,.45);border:1px solid #2c3d63;border-radius:99px;overflow:hidden"><i id="__upBar" style="display:block;height:100%;width:0%;background:linear-gradient(90deg,#c8862a,#ffd97a);transition:width .15s"></i></div>';
(document.body||document.documentElement).appendChild(w);}
document.getElementById('__upTxt').textContent=label||('☁️ 傳送中… '+pct+'%');
document.getElementById('__upBar').style.width=Math.max(2,Math.min(100,pct))+'%';
}

const GDRIVE_URL=''; /* 例：https://script.google.com/macros/s/xxxxx/exec ← 留空時影片照常走 Supabase */

function gdDelete(src){try{if(typeof src!=='string'||src.indexOf('gd:')!==0||!GDRIVE_URL)return;
fetch(GDRIVE_URL,{method:'POST',body:JSON.stringify({action:'del',id:src.slice(3)})}).catch(()=>{})}catch(e){}}

let _onlineSet=new Set(),_hbTimer=null;

function stopHeartbeat(){if(_hbTimer){clearInterval(_hbTimer);_hbTimer=null}}

function updateOnlBadges(){
  try{
    document.querySelectorAll('.onlBadge').forEach(el=>{
      const un=el.getAttribute('data-u');
      const on=un&&_onlineSet.has(un);
      el.className='onlBadge '+(on?'on':'off');
      el.textContent=on?'● 線上':'○ 離線';
    });
    document.querySelectorAll('.onDot').forEach(el=>{
      const un=el.getAttribute('data-u');
      const on=un&&_onlineSet.has(un);
      el.className='onDot '+(on?'on':'off');
    });
  }catch(e){}
}

let _es=null;

function stopStream(){try{if(_es)_es.close()}catch(e){}_es=null}

function closeReqPanel(){const el=document.getElementById('reqPanel');if(el)el.remove()}

function sanitizeText(s,max){s=String(s==null?'':s);
s=s.replace(/<\/?[a-z][\s\S]*?>/gi,'').replace(/<[^>]*$/,'') /* 移除 HTML 標籤 */
.replace(/javascript:/gi,'').replace(/data:text\/html/gi,'').replace(/on\w+\s*=/gi,'') /* 移除危險協定與事件屬性 */
.replace(/[\u0000-\u001f\u007f]/g,''); /* 控制字元 */
return max?s.slice(0,max):s}

function validPassword(p){return /^[\x21-\x7E]{4,100}$/.test(String(p||''))}

let QID=1; const newQid=()=>'q'+(QID++)+'_'+Date.now().toString(36);

async function callOneAI(k,prompt,sys){
const pv=AI_PROVIDERS[k.provider||'gemini'];let model=k.model||pv.defModel;
if(pv.banned&&pv.banned.includes(model))model=pv.defModel; /* 禁用模型自動改用預設 */
if(pv.type==='ol'){ /* 本地 Ollama：經自架伺服器代理，金鑰欄位 = 主機位址 */
const res=await fetch(pv.url,{method:'POST',headers:{'Content-Type':'application/json',...((typeof WTOKEN!=='undefined'&&WTOKEN)?{'x-adv9-token':WTOKEN}:{})},body:JSON.stringify({model,host:k.key||'http://127.0.0.1:11434',messages:[{role:'system',content:sys||'你是一個專業的出題助手。'},{role:'user',content:prompt}],temperature:0.7})});
if(!res.ok)throw new Error('HTTP '+res.status);
const j=await res.json();if(!j.message||!j.message.content)throw new Error('No content');
return j.message.content}
if(pv.type==='gm'){
const url='https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent?key='+k.key;
const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system_instruction:{parts:[{text:sys||'你是一個專業的出題助手。'}]},contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.7,maxOutputTokens:4096}})});
if(!res.ok)throw new Error('HTTP '+res.status);
const j=await res.json();if(!j.candidates||!j.candidates[0])throw new Error('No candidates');
return j.candidates[0].content.parts[0].text}
const res=await fetch(pv.url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+k.key},body:JSON.stringify({model,messages:[{role:'system',content:sys||'你是一個專業的出題助手。'},{role:'user',content:prompt}],temperature:0.7,max_tokens:4096})});
if(!res.ok)throw new Error('HTTP '+res.status);
const j=await res.json();if(!j.choices||!j.choices[0])throw new Error('No choices');
return j.choices[0].message.content}

const TIPS=['💡 氫氣是密度最小的氣體','💡 英文的 I 永遠大寫','💡 歐姆定律 V = IR','💡 電流 I = Q/t','💡 光的入射角等於反射角','💡 質量守恆定律','💡 pH 值越小越酸','💡 地球自轉一圈約 24 小時','💡 三角形內角和 180°','💡 水的電解：氫:氧 = 2:1','💡 光合作用需要光與葉綠素','💡 牛頓第二運動定律 F = ma','💡 連擊 10 以上經驗加成 12%！'];

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

function shuffleQOrder(arr){for(let i=arr.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;const t=arr[i];arr[i]=arr[j];arr[j]=t}return arr}

function qHash(s){let h=0;s=String(s||'');for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return h.toString(36)}

function qSeenHas(g,q){return !!g&&(g.qSeen||[]).includes(qHash(q&&q['題目']))}

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

function collCount(g){return g.owned.character.length+g.owned.pet.length+g.owned.anime.length+g.owned.teammate.length}

function findIt(cat,n){return POOLS[cat][n]}

function titleOf(lv){const T=['見習冒險者','初級冒險者','青銅冒險者','白銀冒險者','黃金冒險者','白金冒險者','鑽石冒險者','大師冒險者','傳說冒險者','全領域之王'];return T[Math.min(lv-1,9)]}

function acadYear(){const d=new Date();return d.getMonth()+1>=8?d.getFullYear():d.getFullYear()-1} /* 學年度以 8/1 為界 */

function promoteClassId(id){const m=String(id||'').match(/^([1-9])(\d+)(.*)$/);if(!m)return null;const gr=+m[1];if(gr>=9)return 'GRAD';return (gr+1)+m[2]+m[3]}

function promoteNameOnce(name){if(!name)return name;if(name.includes('八年'))return name.replace('八年','九年');if(name.includes('七年'))return name.replace('七年','八年');return name}

function isGrade9(u){return !u.graduated&&/^9/.test(String(u.classId||''))}

function vHome(){

const u=me(),g=u.g;

const eq=g.equip.character?CHARS[g.equip.character].icon:'🧑‍🎓';

const tt=TITLES.find(t=>t.id===g.equippedTitle);

$('#view').innerHTML=

'<div class="panel2" style="display:flex;gap:14px;align-items:center;margin-bottom:10px"><div style="font-size:44px;animation:bob 3s infinite">'+(u.prof&&u.prof.avatar?avatarHtml(u,52):eq)+'</div><div><b style="font-family:var(--serif);font-weight:900;font-size:20px;color:var(--gold2);display:block">⚔️ 冒險者，歡迎回來！</b>'+

'<div style="font-size:12.5px;color:var(--mut);margin-top:3px">Lv.'+g.lv+' 【'+titleOf(g.lv)+'】'+(tt?'｜🎖 '+tt.n:'')+(g.rebirth?'｜🔁 轉生×'+g.rebirth:'')+'｜⚡戰力 '+power(g)+'｜🏟️競技塔 第'+(g.arena.best||1)+'層｜'+timeStatus(g)+'</div></div></div>'+

(isGrade9(u)?(()=>{const n=examCountdown();const d=examDate();const ai=examSrc()==='ai';return n>0?'<div class="panel2" style="margin-bottom:10px;border-left:4px solid #ff8a80;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="font-size:26px">📝</span><div style="flex:1"><b style="font-family:var(--serif);color:#ffb4ab;font-size:16px">會考倒數 '+n+' 天</b><div style="font-size:11.5px;color:var(--mut)">'+d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()+' 國中教育會考 '+(ai?'🤖 AI 查詢':'（預估）')+'｜每天答題就是最好的複習，加油！</div></div><button class="btn ghost mini" onclick="examRefresh()">🔄 AI 更新日期</button></div>':''})():'')+

(u.graduated?'<div class="panel2" style="margin-bottom:10px;border-left:4px solid var(--gold);display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="font-size:26px">🎓</span><div style="flex:1"><b style="font-family:var(--serif);color:var(--gold2)">校友模式｜'+(u.gradYear||'')+' 學年度畢業</b><div style="font-size:11.5px;color:var(--mut)">帳號永久保留，所有功能照常玩'+(g.rebirth?'｜🔁 轉生加成：全經驗+'+(g.rebirth*10)+'%・掉落+'+(g.rebirth*5)+'%':'')+'</div></div><button class="btn ghost mini" onclick="gradCeremony()">🎓 畢業紀念冊</button></div>':'')+

'<div style="background:rgba(0,0,0,.25);border:1px dashed #6b4a1f;color:#ffb26b;padding:8px 12px;border-radius:5px;font-size:12.5px;margin-bottom:14px">'+pick(TIPS)+'</div>'+

featCatsHtml();

if(u.role==='student')setTimeout(tutorGuide,700); /* 首登新手引導（只顯示一次）*/

}

function addMail(g,title,body,rw){g.mail=g.mail||[];g.mail.push({id:'m'+Date.now()+Math.floor(Math.random()*1e4),title,body,rw:rw||null,t:Date.now(),claimed:false});if(g.mail.length>50)g.mail=g.mail.slice(-50)}

function unreadMail(g){return (g&&g.mail||[]).filter(m=>!m.claimed&&m.rw).length}

function avatarHtml(usr,px){px=px||30;const av=usr&&usr.prof&&usr.prof.avatar;

if(av&&av.indexOf('data:')===0)return '<img src="'+av+'" style="width:'+px+'px;height:'+px+'px;border-radius:50%;object-fit:cover;vertical-align:middle;border:1px solid var(--goldD)">';

return '<span style="font-size:'+Math.round(px*.8)+'px;line-height:1;vertical-align:middle">'+(av||'🧑‍🎓')+'</span>'}

function compressImgFile(f,mx,q,cb){const r=new FileReader();r.onload=e=>{const img=new Image();img.onload=()=>{const sc=Math.min(1,mx/Math.max(img.width,img.height));const cv=document.createElement('canvas');cv.width=Math.round(img.width*sc);cv.height=Math.round(img.height*sc);cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);cb(cv.toDataURL('image/jpeg',q))};img.src=e.target.result};r.readAsDataURL(f)}

function vidTag(src,muted,mw){mw=mw||440;src=mediaUrl(src);

if(typeof src==='string'&&src.indexOf('gd:')===0)return '<iframe src="https://drive.google.com/file/d/'+src.slice(3)+'/preview" style="width:min(100%,'+(mw+90)+'px);height:'+Math.round(mw*0.7)+'px;border:none;border-radius:8px;display:block" allow="autoplay; fullscreen" allowfullscreen></iframe>'+(muted?'<div style="font-size:10.5px;color:var(--mut)">🔇 建議靜音觀看</div>':'');

return '<video src="'+src+'" controls preload="metadata" '+(muted?'muted onvolumechange="this.muted=true"':'')+' style="max-width:'+mw+'px;border-radius:8px;display:block"></video>'+(muted?'<div style="font-size:10.5px;color:var(--mut)">🔇 靜音影片</div>':'');

}

function mediaUrl(src){
  try{
    if(typeof src!=='string'||!src)return src;
    if(src.indexOf('gd:')===0)return src;
    const p='/storage/v1/object/public/media/';
    const i=src.indexOf(p);
    if(i>=0)return location.origin+src.slice(i);
    if(src.indexOf('/storage/v1/object/public/')===0)return src;
  }catch(e){}
  return src;
}

function pmId(a,b){return [a,b].sort().join('|')}

function tutorGuide(){
  try{if(localStorage.getItem('ADV9_TUTOR'))return;localStorage.setItem('ADV9_TUTOR','1')}catch(e){return}
  const steps=[
    {i:'🧑‍🎓',t:'完成每日任務',d:'登入後每天可完成答題、簽到、PK 等任務，獲得金幣、水晶與經驗值；等級越高解鎖越多玩法！'},
    {i:'🗺️',t:'征服領土',d:'每個科目有 500 關領土關卡，越後面獎勵越多，還可獲得獨特稱號與裝備。'},
    {i:'✏️',t:'按時交作業',d:'老師發布的作業請在截止前完成；作答畫面有專屬防作弊變體，離窗次數會被記錄。'},
    {i:'💎',t:'收集與強化',d:'抽卡收集角色夥伴、鍛造裝備並強化（上限＝玩家等級×100），變強挑戰更高難度！'}
  ];
  let idx=0;
  const box=document.createElement('div');
  box.style.cssText='position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center';
  const render=()=>{const s=steps[idx];box.innerHTML='<div style="background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:24px 26px;max-width:340px;text-align:center;animation:pop .3s">'+
    '<div style="font-size:44px">'+s.i+'</div><div style="font-size:17px;font-weight:900;font-family:var(--serif);color:var(--gold2);margin:8px 0">'+s.t+'</div>'+
    '<div style="font-size:12.5px;color:var(--mut);line-height:1.8">'+s.d+'</div>'+
    '<div style="display:flex;gap:8px;justify-content:center;margin-top:16px">'+
    (idx>0?'<button class="btn ghost mini" onclick="window._tg('+(idx-1)+')">⬅ 上一步</button>':'')+
    (idx<steps.length-1?'<button class="btn teal" onclick="window._tg('+(idx+1)+')">下一步 ➡</button>':'<button class="btn big" onclick="window._tg(-1)">🎮 開始冒險！</button>')+
    '</div><div style="font-size:11px;color:var(--mut);margin-top:10px">第 '+(idx+1)+'/'+steps.length+' 步</div></div>'};
  window._tg=(n)=>{if(n<0){box.remove();delete window._tg;return}idx=n;render()};
  box.onclick=(e)=>{if(e.target===box)box.remove()};
  render();document.body.appendChild(box);
}

let PUB={qs:[],pdf:null};

let HW_SCOPE='class';

function hwScope(s){
  HW_SCOPE=s;
  const g=document.getElementById('hwScopeGrade'),c=document.getElementById('hwScopeClass');
  g.className='btn '+(s==='grade'?'':'ghost')+' mini';c.className='btn '+(s==='class'?'':'ghost')+' mini';
  document.getElementById('hwGradeWrap').style.display=s==='grade'?'block':'none';
  document.getElementById('hwClassWrap').style.display=s==='class'?'block':'none';
}

function hwGrades(classId){return classId&&classId[0]==='G'?classId.slice(1):null}

function hwTargetLabel(h){
  const gs=hwGrades(h.classId);
  if(gs)return gs.split('').map(d=>d+' 年級').join('+');
  return h.classId+' 班';
}

function hwForTeacher(h,u){return h.teacherId===u.id||(u.managedClassIds||[]).includes(h.classId)||(hwGrades(h.classId)&&(u.managedClassIds||[]).some(c=>hwGrades(h.classId).indexOf(String(c||'')[0])>-1))}

function validateQuestion(q){
  if(!q||typeof q!=='object')return{ok:false,msg:'題目格式錯誤'};
  const stem=String(q['題目']||'').trim();if(!stem)return{ok:false,msg:'題目內容為空'};
  const opts=q['選項'];if(!Array.isArray(opts)||opts.length!==4)return{ok:false,msg:'必須恰好 4 個選項'};
  for(let i=0;i<4;i++){if(!String(opts[i]||'').trim())return{ok:false,msg:'選項 '+(i+1)+' 為空'}}
  const seen={};for(let i=0;i<4;i++){const v=String(opts[i]).trim();if(seen[v])return{ok:false,msg:'選項重複：'+v};seen[v]=1}
  const ans=q['答案'];
  if(!(ans===0||ans===1||ans===2||ans===3))return{ok:false,msg:'答案索引必須為 0-3（對應 A-D）'};
  return{ok:true};
}

function parseTxtQuestions(text){
  const t=(text||'').trim().replace(/^\uFEFF/,'');
  if(t.startsWith('[')){try{const j=JSON.parse(t);if(Array.isArray(j))return j}catch(_){}}
  const lines=t.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const qs=[];let cur=null;
  for(const line of lines){
    let m=line.match(/^(?:題目\s*)?(\d+)[\.、\)]\s*(.*)$/);
    if(m){if(cur&&cur['選項'].length)qs.push(cur);cur={'題目':m[2],'選項':[],'答案':0,'解析':''};continue}
    m=line.match(/^([A-D])[\.、\)：:]?\s*(.*)$/i);
    if(m&&cur){cur['選項'].push(m[2]);continue}
    m=line.match(/^(?:答案|正確答案)[:：]?\s*([A-D1-4])/i);
    if(m&&cur){const a=m[1].toUpperCase();cur['答案']=(a>='1'&&a<='4')?(+a)-1:'ABCD'.indexOf(a);continue}
    if(cur&&line.startsWith('解析'))cur['解析']=line.replace(/^[^:：]*[:：]/,'');
  }
  if(cur&&cur['選項'].length)qs.push(cur);
  return qs;
}
