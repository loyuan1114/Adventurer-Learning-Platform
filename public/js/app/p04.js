/* ════════ 個人化：頭像／好友暱稱／摯友／背景／好友申請隱私 ════════ */

function profOf(uid){const x=get(LS.users,[]).find(v=>v.id===uid);return (x&&x.prof)||{}}

function myProf(){const u=me();u.prof=u.prof||{};u.prof.nick=u.prof.nick||{};u.prof.bff=u.prof.bff||[];u.prof.chatBg=u.prof.chatBg||{};return u}


function dispName(fid){const u=me();const nk=u&&u.prof&&u.prof.nick&&u.prof.nick[fid];const x=get(LS.users,[]).find(v=>v.id===fid);return nk||(x?x.name:fid)}

function isBff(fid){const u=me();return !!(u&&u.prof&&u.prof.bff&&u.prof.bff.includes(fid))}

function bffToggle(fid){const u=myProf();const i=u.prof.bff.indexOf(fid);if(i>-1){u.prof.bff.splice(i,1);toast('💔 已取消摯友')}else{u.prof.bff.push(fid);toast('💖 已設為摯友！')}saveU(u);vFriends()}

function setFrNick(fid){const u=myProf();const cur=u.prof.nick[fid]||'';const nk=prompt('為好友設定暱稱（留空恢復本名）',cur);if(nk===null)return;const c=sanitizeText(nk.trim(),20);if(c)u.prof.nick[fid]=c;else delete u.prof.nick[fid];saveU(u);toast('✏️ 暱稱已更新');vFriends()}



function applyMyBg(){const u=me();const bg=u&&u.prof&&u.prof.bg;
applyMyTheme();

if(!bg){document.body.style.background='';return}

if(bg.indexOf('data:')===0){document.body.style.background='linear-gradient(rgba(13,21,38,.82),rgba(13,21,38,.82)),url('+bg+') center/cover no-repeat fixed'}

else if(BG_PRESETS[bg]&&BG_PRESETS[bg][1]){document.body.style.background=BG_PRESETS[bg][1];document.body.style.backgroundAttachment='fixed'}

else document.body.style.background='';}

function setBg(id){const u=myProf();u.prof.bg=id==='bg1'?'':id;saveU(u);applyMyBg();toast('🎨 背景已更換');vSet()}

/* 🎨 介面顏色主題（v4.0）：覆寫 CSS 變數，每人都可選自己喜歡的配色 */
const COLOR_PRESETS={
'gold':['🌙 默認金黑',''],
'blue':['🌊 深海藍','--bg:#0b1a2c;--panel:#10233a;--panel2:#0e2035;--line:#1f4266;--gold:#4fc3f7;--gold2:#81d4fa;--goldD:#27618a;--txt:#e8f4fd;--mut:#7fa8c4;--teal:#26c6da'],
'purple':['🍇 暗夜紫','--bg:#170f2b;--panel:#1f1640;--panel2:#1c1338;--line:#3a2c6b;--gold:#b39ddb;--gold2:#d1c4e9;--goldD:#5e4a8f;--txt:#efe9fa;--mut:#a394c8;--teal:#7e57c2'],
'green':['🌿 翡翠綠','--bg:#0d2317;--panel:#123322;--panel2:#102d1e;--line:#225a3c;--gold:#81c784;--gold2:#a5d6a7;--goldD:#3d7a4e;--txt:#e8f5ec;--mut:#82b594;--teal:#26a69a'],
'red':['🍁 楓紅','--bg:#291014;--panel:#3a1820;--panel2:#33151c;--line:#6b2f3a;--gold:#ff8a80;--gold2:#ffab91;--goldD:#8f3a44;--txt:#fdeeef;--mut:#c48b93;--teal:#ef5350'],
'pink':['🌸 夜櫻粉','--bg:#26101f;--panel:#381c30;--panel2:#31182a;--line:#6b3a5a;--gold:#f48fb1;--gold2:#f8bbd0;--goldD:#8f4a6e;--txt:#fdeef5;--mut:#c08fa9;--teal:#ec407a'],
'cyan':['❄️ 墨青','--bg:#06252b;--panel:#0a3640;--panel2:#08303a;--line:#14566b;--gold:#4dd0e1;--gold2:#80deea;--goldD:#1f7f96;--txt:#e6f8fb;--mut:#7fb4c0;--teal:#00bcd4'],
'oled':['⚫ 純黑 OLED','--bg:#000000;--panel:#0d0d0d;--panel2:#0a0a0a;--line:#262626;--gold:#f2c14e;--gold2:#ffd97a;--goldD:#5c4a20;--txt:#e5e5e5;--mut:#8a8a8a;--teal:#38d9c0']
};
function applyMyTheme(){
  const vars=['--bg','--panel','--panel2','--line','--gold','--gold2','--goldD','--txt','--mut','--teal'];
  vars.forEach(v=>document.documentElement.style.removeProperty(v));
  const u=me(),t=u&&u.prof&&u.prof.uiTheme;
  if(!t||!COLOR_PRESETS[t]||!COLOR_PRESETS[t][1])return;
  COLOR_PRESETS[t][1].split(';').forEach(kv=>{const i=kv.indexOf(':');if(i>0)document.documentElement.style.setProperty(kv.slice(0,i),kv.slice(i+1))});
}
function setTheme(id){const u=myProf();u.prof.uiTheme=id==='gold'?'':id;saveU(u);applyMyTheme();toast('🌈 介面主題已更換');vSet()}

function onBgFile(inp){const f=inp.files[0];if(!f)return;compressImgFile(f,1000,.55,d=>{const u=myProf();u.prof.bg=d;saveU(u);applyMyBg();toast('🖼 已使用照片當背景');vSet()})}


function setAvatar(v){const u=myProf();u.prof.avatar=v;saveU(u);toast('✅ 頭像已更換');vSet()}

function onAvatarFile(inp){const f=inp.files[0];if(!f)return;compressImgFile(f,96,.75,d=>setAvatar(d))}

function setFrPrivacy(v){const u=myProf();u.prof.frPrivacy=v;saveU(u);toast('🔒 好友申請設定已更新：'+(v==='off'?'關閉申請':'所有人可加我'))}

/* 聊天室照片背景（僅自己可見） */

function onChatBg(inp,key,boxId){const f=inp.files[0];if(!f)return;compressImgFile(f,900,.55,d=>{const u=myProf();u.prof.chatBg[key]=d;saveU(u);const b=$(boxId);if(b)b.style.background='linear-gradient(rgba(10,16,30,.55),rgba(10,16,30,.55)),url('+d+') center/cover';toast('🖼 聊天背景已設定')})}

function clearChatBg(key,boxId){const u=myProf();delete u.prof.chatBg[key];saveU(u);const b=$(boxId);if(b)b.style.background='';toast('🧹 聊天背景已清除')}

function chatBgStyle(key){const u=me();const d=u&&u.prof&&u.prof.chatBg&&u.prof.chatBg[key];return d?'background:linear-gradient(rgba(10,16,30,.55),rgba(10,16,30,.55)),url('+d+') center/cover;':''}

/* ☁️ 媒體上傳統一入口：影片優先存 Google Drive（15GB，需設 GDRIVE_URL），其餘走 Supabase；全部失敗才退回內嵌（3MB 內） */

function mediaUpload(f,done){

const mb=(f.size/1048576).toFixed(1),showProg=f.size>150*1024; /* 小檔秒傳不用顯示進度 */

const prog=pct=>{if(showProg)upProg(pct,'☁️ 傳送中… '+pct+'%（'+mb+'MB）')};

const fin=src=>{if(showProg){upProg(100,'✅ 傳送完成');setTimeout(()=>upProg(null),450)}done(src)};

const supaPath=()=>cloudUpload(f,fin,()=>{ /* 雲端失敗 → 退回 base64 內嵌（舊機制） */

upProg(null);

if(f.size>3*1024*1024)return toast('⚠️ 雲端儲存未就緒，暫時僅支援 3MB 以內（請管理員執行 supabase_storage_setup.sql）','bad');

const r=new FileReader();r.onload=e=>fin(e.target.result);r.readAsDataURL(f);

},prog);

if(/^video\//.test(f.type||'')&&GDRIVE_URL){ /* 📂 影片 → Google Drive，失敗自動改走 Supabase */

if(f.size>GDRIVE_MAX)return toast('⚠️ 影片請小於 30MB','bad');

if(showProg)upProg(0,'☁️ 傳送中… 0%（'+mb+'MB）');

return gdUpload(f,fin,()=>supaPath(),prog);

}

if(f.size>MEDIA_MAX)return toast('⚠️ 檔案請小於 50MB','bad');

if(showProg)upProg(0,'☁️ 傳送中… 0%（'+mb+'MB）');

supaPath();

}

/* 🎞 影片渲染：Google Drive（gd:檔ID）用 Drive 播放器 iframe，其餘用原生 video */


/* 🔗 媒體網址重寫：舊訊息存的絕對網址（舊隧道網域已死）→ 一律改用目前伺服器網域，影片/照片永遠載得到 */
/* 🔍 照片點擊放大（全螢幕檢視） */

function zoomEl(el){openModal('<div style="text-align:center"><img src="'+el.src+'" style="max-width:100%;max-height:76vh;border-radius:10px"></div><div class="mBtns"><button class="btn" onclick="closeModal()">關閉</button></div>')}

/* 🔥 限看次數訊息：每人限看 N 次；發送者與管理員不計次、無限制且不留痕跡 */

function msgMedia(m){

if(m.recalled)return '<p style="color:var(--mut);font-size:12px;font-style:italic">↩ 此訊息已收回</p>'; /* 收回的訊息 */

if(m.expired)return '<p style="color:var(--mut);font-size:12.5px">🎞 影片已過期（3 天）</p>'; /* 過期影片顯示標記 */

if(m.vid)return vidTag(m.vid,m.muted,480);

if(m.img)return '<img src="'+mediaUrl(m.img)+'" alt="照片" style="cursor:zoom-in" onclick="zoomEl(this)" title="點擊放大">';

return '<p>'+esc(m.text||'')+'</p>'}

function viewBurn(scope,key,t){

const u=me();const isAdm=u.role==='admin';

let store,msgs,save;

if(scope==='pm'){store=get(LS.pm,{});msgs=store[key]||[];save=()=>set(LS.pm,store)}

else{store=get(LS.gr,[]);const gr=store.find(x=>x.id===key);msgs=(gr&&gr.msgs)||[];save=()=>set(LS.gr,store)}

const m=msgs.find(x=>x.t===t&&x.burn);if(!m)return;

m.views=m.views||{};const n=m.views[u.id]||0;

if(!isAdm&&m.from!==u.id){if(n>=m.burn)return toast('🚫 已達觀看次數上限（'+m.burn+' 次）','bad');m.views[u.id]=n+1;save()}

openModal('<h3 class="mt">🔥 限次觀看內容 <span style="font-size:11px;color:var(--mut)">'+((isAdm||m.from===u.id)?'不限次數':'第 '+(n+1)+'/'+m.burn+' 次觀看')+'</span></h3>'+

'<div style="text-align:center">'+(m.img?'<img src="'+mediaUrl(m.img)+'" style="max-width:100%;max-height:60vh;border-radius:8px">':m.vid?vidTag(m.vid,m.muted,420):'<p style="font-size:15px;white-space:pre-wrap;text-align:left">'+esc(m.text||'')+'</p>')+'</div>'+

'<div class="mBtns"><button class="btn" onclick="closeModal()">關閉</button></div>');

}

/* ════════════════════════════════════════════════

#1【修復】修煉場精靈嚮導

流程：選科目 → 選學期+單元（點選即進入設定）→ 難度/版本 → 大按鈕開始

點選單元後直接跳到「出發設定」畫面，不再只顯示「已選擇」就卡住

════════════════════════════════════════════════ */



/* ════════════════════════════════════════════
   vSubj 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vSubj
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vSubj 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vSubj
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vSubj 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vSubj
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vSubj 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vSubj
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vSubj 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vSubj
   ════════════════════════════════════════════ */
async function vSubj(){
  if(!await needJs(['js/views/vSubj.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vSubj();
}






/* 第一步：選學期→單元（點單元直接進設定，解決卡住問題）*/

/* ════════════════════════════════════════════
   vUnitList 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vUnitList
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vUnitList 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vUnitList
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vUnitList 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vUnitList
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vUnitList 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vUnitList
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vUnitList 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vUnitList
   ════════════════════════════════════════════ */

async function vUnitList(){
  if(!await needJs(['js/views/vUnitList.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vUnitList();
}





/* 第二步：出發設定（難度/版本/AI）＋ 超大開始按鈕 */

/* ════════════════════════════════════════════
   vReady 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 4 個單位：deTex, parseAiQuestions, vReady, aiRecentPromptBlock
   ════════════════════════════════════════════ */
function deTex(s){if(typeof s!=='string')return s;let t=s;
t=t.replace(/\\\\(?=[A-Za-z])/g,'\\'); /* JSON 雙反斜線形式（\\\\times）先歸一為單反斜線 */
t=t.replace(/\\left|\\right/g,'');
t=t.replace(/\\text\{([^{}]*)\}/g,'$1');
t=t.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g,'($1)/($2)');
t=t.replace(/\frac\{([^{}]*)\}\{([^{}]*)\}/g,'($1)/($2)');
t=t.replace(/\\sqrt\{([^{}]*)\}/g,'√($1)');
t=t.replace(/\\times/g,'×');
t=t.replace(/\times/g,'×');
t=t.replace(/\\div/g,'÷').replace(/\\cdot/g,'·').replace(/\\pm/g,'±');
t=t.replace(/\\neq/g,'≠');
t=t.replace(/\neq/g,'≠');
t=t.replace(/\\leq?/g,'≤').replace(/\\geq?/g,'≥');
t=t.replace(/\\pi/g,'π').replace(/\\degree/g,'°').replace(/\^\{?\\circ\}?/g,'°');
t=t.replace(/\^\{([^{}]*)\}/g,'^($1)');
t=t.replace(/\\%/g,'%').replace(/\\,|\\;|\\ /g,' ');
t=t.replace(/\$\$?/g,'');
return t}

function parseAiQuestions(text,subject){let cleaned=text.trim();cleaned=cleaned.replace(/```json\s*/gi,'').replace(/```\s*/g,'');cleaned=deTex(cleaned);/* 先轉換 LaTeX，避免 \\times 等被 JSON 轉義成亂碼 */const arrMatch=cleaned.match(/\[[\s\S]*\]/);if(!arrMatch)throw new Error('無法解析 AI 回應，請重試');let questions;try{questions=JSON.parse(arrMatch[0])}catch{throw new Error('JSON 解析失敗，請重試')}if(!Array.isArray(questions))throw new Error('回應格式錯誤');const badWords=['圖','照片','圖片','圖像','如圖','下圖','附圖','看圖'];const listenWords=['聽力','聽','錄音','播放','audio','listening','請聽'];questions=questions.filter(q=>{if(!q['題目']||!q['選項']||!Array.isArray(q['選項'])||q['選項'].length!==4)return false;if(typeof q['答案']!=='number'||q['答案']<0||q['答案']>3)return false;const all=q['題目']+' '+q['選項'].join(' ');for(const w of badWords){if(all.includes(w))return false}for(const w of listenWords){if(all.toLowerCase().includes(w.toLowerCase()))return false}/* 所有科目一律過濾照片與聽力題 */return true});questions.forEach(q=>{q['題目']=deTex(q['題目']);q['選項']=q['選項'].map(deTex);if(q['解析'])q['解析']=deTex(q['解析'])});/* 解析後再清一次殘留符號 */return questions}

/* ════════════════════════════════════════════
   vReady 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vReady
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vReady 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：maxDiff, vReady
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vReady 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：maxDiff, vReady
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vReady 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：maxDiff, vReady
   ════════════════════════════════════════════ */

async function vReady(sem,unit){
  if(!await needJs(['js/views/vReady.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vReady(sem,unit);
}





function aiRecentPromptBlock(recent){return recent&&recent.length?('8. 下列是最近已出過的題目，絕對禁止與其完全相同、僅改數字或僅換人名：\n'+recent.map((r,i)=>(i+1)+'. '+r).join('\n')+'\n9. 請刻意使用與上述範例完全不同的數字組合、情境與題型（若題目型態一直相同，請換一種問法）\n10. 本次出題隨機碼：'+Math.random().toString(36).slice(2,9)+'，每題必須是全新題目\n\nJSON 格式：[{"題目":"...","選項":["A","B","C","D"],"答案":0,"解析":"..."}]'):('8. 必須是全新題目，不可與常見模板完全相同或僅改數字\n9. 本次出題隨機碼：'+Math.random().toString(36).slice(2,9)+'，請從不同角度、數字、情境出題\n\nJSON 格式：[{"題目":"...","選項":["A","B","C","D"],"答案":0,"解析":"..."}]')}


function diffChg(){

const v=+$('#diffS').value,r=CFG.dRew(v);

$('#diffL').textContent='Lv.'+v+' '+CFG.dDesc(v).split('-')[0];

$('#diffD').textContent=CFG.dDesc(v);

$('#diffR').textContent='獎勵：+'+r.exp+' XP  +'+r.crystal+'💠  +'+r.gold+'🪙';

}

async function startQuiz(){

if(!Quiz.unit){toast('⚠️ 請先選擇單元','bad');return}

const pubEl=document.querySelector('input[name=pub]:checked');if(pubEl)Quiz.pub=pubEl.value;

const diffEl=$('#diffS');if(diffEl){Quiz.diff=+diffEl.value;

if(sysCfg().diffMode==='隨機')Quiz.diff=clamp(Quiz.diff+((Math.random()*21)|0)-10,1,100);} /* 難度模式由管理員全域設定 */

const aiEl=$('#useAI');Quiz.useAI=true; /* 修煉場必定使用 AI API 出題 */

Quiz.phase='LOADING';showLoading();

setTimeout(async()=>{

let aiQ=null;try{aiQ=await aiGenerateQuiz(Quiz.subj,Quiz.unit,Quiz.diff)}catch(e){}

if(!aiQ){ /* v4.1：AI 失敗自動改用本地題庫（不再卡住），仍保留明確改用按鈕與提示 */
  const q=bankQ(Quiz.subj,Quiz.unit,Quiz.diff);
  if(q){
    Quiz.q=q;
    Quiz.q.id=newQid();
    Quiz.sel=null;Quiz.t0=Date.now();
    Quiz.phase='ANSWERING';
    vQuestion();
    toast('⚠️ AI 出題失敗，已改用本地題庫（僅本題）','bad');
    return;
  }
  Quiz.phase='IDLE';

$('#view').innerHTML=back()+'<h3 class="vt">⚠️ 出題失敗</h3>'+

'<div class="panel2" style="border-left:4px solid var(--red);margin-bottom:14px;line-height:1.9;font-size:13.5px">❌ 出題服務暫時無法使用，請稍後重試。<br>若持續發生，請聯絡管理員檢查系統設定。</div>'+

'<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn big" onclick="startQuiz()">🔄 重試</button>'+

'<button class="btn ghost big" onclick="startQuizBank()">📚 改用本地題庫（僅本題）</button></div>';

return;

}

Quiz.q=aiQ;
Quiz.q.id=newQid();

Quiz.sel=null;Quiz.t0=Date.now();

Quiz.phase='ANSWERING';vQuestion();

},400);

}

function startQuizBank(){ /* 使用者明確選擇才改用本地題庫 */

Quiz.phase='LOADING';showLoading();

setTimeout(()=>{const q=bankQ(Quiz.subj,Quiz.unit,Quiz.diff);if(!q){Quiz.phase='IDLE';toast('⚠️ 找不到題目，請選擇其他單元','bad');return;}Quiz.q=q;Quiz.q.id=newQid();Quiz.sel=null;Quiz.t0=Date.now();Quiz.phase='ANSWERING';vQuestion()},300);

}

function showLoading(){

$('#view').innerHTML='<div style="text-align:center;padding:60px 0"><div style="font-size:60px;animation:spP 1s infinite">🤖</div>'+

'<p style="font-family:var(--serif);font-weight:900;color:var(--gold2);font-size:17px;margin:12px 0">AI 正在出題中...</p>'+

'<p style="display:inline-block;margin-top:10px;background:rgba(0,0,0,.25);border:1px dashed #6b4a1f;color:#ffb26b;padding:8px 12px;border-radius:5px;font-size:12.5px">'+pick(TIPS)+'</p></div>';

}

/* ════════════════════════════════════════════
   vQuestion 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 5 個單位：showLevelUpFX, qMarkSeen, vQuestion, weekKey, getWeekly
   ════════════════════════════════════════════ */
function showLevelUpFX(newLv){const overlay=document.createElement('div');overlay.style.cssText='position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);animation:fadeIn .3s';overlay.innerHTML='<div style="text-align:center;animation:levelUp 1s ease-out"><div style="font-size:48px">🎉</div><div style="font-size:28px;color:var(--gold);font-family:var(--serif);margin:8px 0">LEVEL UP!</div><div style="font-size:20px;color:var(--txt)">Lv.'+newLv+'</div></div>';overlay.onclick=()=>overlay.remove();document.body.appendChild(overlay);for(let i=0;i<12;i++){const p=document.createElement('span');p.style.cssText='position:fixed;font-size:'+(14+Math.random()*10)+'px;pointer-events:none;z-index:201;left:'+(Math.random()*100)+'vw;top:-20px;animation:rewardDrop '+(1+Math.random()*1.5)+'s ease-in forwards;animation-delay:'+(Math.random()*0.5)+'s';p.textContent=['⭐','✨','🌟','💫','🎊'][Math.floor(Math.random()*5)];document.body.appendChild(p);setTimeout(()=>p.remove(),3000)}setTimeout(()=>overlay.remove(),3000)}


/* ════════════════════════════════════════════
   vQuestion 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：qMarkSeen, vQuestion
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vQuestion 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：qMarkSeen, vQuestion
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vQuestion 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：qMarkSeen, vQuestion
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vQuestion 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：qMarkSeen, vQuestion
   ════════════════════════════════════════════ */

async function vQuestion(){
  if(!await needJs(['js/views/vQuestion.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vQuestion();
}





function weekKey(){const d=new Date();const on=new Date(d.getFullYear(),0,1);const wn=Math.ceil((((d-on)/86400000)+on.getDay()+1)/7);return d.getFullYear()+'-W'+wn}

function getWeekly(g){

if(!g.weekly)g.weekly={wk:'',n:0,claimed:false};

const wk=weekKey();

if(g.weekly.wk!==wk)g.weekly={wk,n:0,claimed:false};

return g.weekly;

}


function selectOpt(i){

if(Quiz.phase!=='ANSWERING')return;

Quiz.sel=i;

document.querySelectorAll('.optBtn').forEach((b,idx)=>b.classList.toggle('sel',idx===i));

updSubmit();

}

function updSubmit(){const b=$('#submitBtn');if(b)b.classList.toggle('dis',Quiz.sel===null)}

function submitAns(){

if(Quiz.phase!=='ANSWERING'||Quiz.sel===null)return;

Quiz.phase='SUBMITTED';

const q=Quiz.q,ok=Quiz.sel===q['答案'];

document.querySelectorAll('.optBtn').forEach(b=>b.classList.add('lock'));

document.getElementById('opt'+q['答案']).classList.add('ok');

if(!ok)document.getElementById('opt'+Quiz.sel).classList.add('no');

const el=((Date.now()-Quiz.t0)/1000).toFixed(1);

const R=settle(ok,el);

Quiz.phase='SETTLING';

setTimeout(()=>{Quiz.phase='RESULT';vResult(ok,el,R)},500);

}

function settle(ok,el){

const u=me(),g=u.g,R={exp:0,cr:0,au:0,drop:null,extra:''};

logAns(g,ok,el); /* 記錄作答過程與秒數（供師/管端檢視）*/

if(Quiz.mode==='terr'){

recordAns(g,ok,Quiz.diff,Quiz.subj);

if(ok){addCombo(g);R.exp=grantExp(g,Quiz.diff,false,Quiz.subj);const rw=grantRew(g,Quiz.diff,g.combo);R.cr=rw.crystal;R.au=rw.gold;R.dm=rw.diamond;R.drop=rollDrop(g,Quiz.diff)}

else resetCombo(g);

const tr=captureTerr(g,Quiz.terrName,ok);

if(ok)updMission(g,'territory',1);

R.extra=tr.ok?'<div class="rwRow"><span class="rwChip">🚩 '+tr.msg+'</span><span class="rwChip">💎+'+tr.rw.d+'</span><span class="rwChip">🪙+'+tr.rw.au+'</span><span class="rwChip">💠+'+tr.rw.crystal+'</span><span class="rwChip">✨+'+tr.rw.starlight+'</span><span class="rwChip">⛏️+'+tr.rw.ironOre+'</span><span class="rwChip">🔩+'+tr.rw.enhStone+'</span><span class="rwChip">🧪+'+tr.rw.labMat+'</span>'+(tr.rw.honor?'<span class="rwChip">🏅+'+tr.rw.honor+'</span>':'')+'</div>'

:'<div class="rwRow"><span class="rwChip" style="border-color:#8f272b;color:#ffb4ab">⚔️ '+tr.msg+'</span></div>';

}else if(Quiz.mode==='retry'){

const w=g.wrong[Quiz.retrySubj][Quiz.retryIdx];w.done=ok;

recordAns(g,ok,50,Quiz.retrySubj);

if(ok){addCombo(g);g.stats.retry=(g.stats.retry||0)+1;R.exp=grantExp(g,50,true,Quiz.retrySubj);updMission(g,'retry',1);R.extra='<div class="rwRow"><span class="rwChip">✏️ 錯題重練成功！經驗 ×1.5</span></div>'}

else resetCombo(g);

}else{

recordAns(g,ok,Quiz.diff,Quiz.subj);

if(ok){addCombo(g);R.exp=grantExp(g,Quiz.diff,false,Quiz.subj);const rw=grantRew(g,Quiz.diff,g.combo);R.cr=rw.crystal;R.au=rw.gold;R.dm=rw.diamond;R.drop=rollDrop(g,Quiz.diff)}

else{resetCombo(g);const e=effOf(g);if(e.wrong_next_drop)g._nextDrop=true;addWrong(g,Quiz.subj,Quiz.q,Quiz.sel)}

}

checkTitlesAch(g);saveU(u);hud();

return R;

}

/* ════════════════════════════════════════════
   vResult 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vResult
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vResult 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vResult
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vResult 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vResult
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vResult 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vResult
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vResult 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vResult
   ════════════════════════════════════════════ */
async function vResult(){
  if(!await needJs(['js/views/vResult.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vResult();
}





