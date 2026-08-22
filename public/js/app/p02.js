/* ════════ 學生 UI ════════ */


let FEATS=[

['⚔️','修煉場','精靈嚮導・一鍵開始','#ff5252','vSubj()'],

['🏟️','PK 競技塔','無限關卡・排名獎勵','#ff9800','vPK()'],

['🗺️','領土征服','每科100關・共500關','#7c4dff','vTerr()'],

['🎁','抽卡','角色/寵物/動漫/隊友','#ff2d55','vGacha()'],

['🐾','收藏裝備','升星vs強化・分流','#ab47bc','vColl()'],

['⚒️','鍛造坊','自己敲裝備','#8d6e63','vForge()'],

['🎒','背包','武器強化','#00bcd4','vBag()'],

['📜','每日任務','一鍵領取','#00e676','vMiss()'],

['🏪','每日商店','折扣・刷新','#ffd700','vShopV()'],

['🌐','全服商店','限量共享庫存','#e040fb','vGShop()'],

['🎮','遊戲中心','5款經典小遊戲','#f06292','vGames()'],

['🎬','影片專區','8大領域・看完有獎勵','#448aff','openVideoHub()'],

['💬','社群中心','好友・群組・限時動態','#42a5f5','vSocial()'],

['❌','錯題重練','經驗×1.5','#ff5252','vWrong()'],

['🏆','排行榜','含零分玩家','#7c4dff','vRank()'],

['🎖','稱號成就','可配戴加成','#ff4081','vTitleV()'],

['🔄','兌換所','多代幣兌換','#26c6da','vExch()'],

['🧪','自然實驗室','8 個實驗','#00c853','vLab()'],

['🛡️','公會','公會等級・公會商店','#8e24aa','vGuild()'],

['📚','課本講解','115 年南一/翰林・考卷解析','#00acc1','vLearn()'],

['📚','班級作業','PDF 邊看邊答','#26a69a','vHomework()'],

['🎟','密碼禮包','自動辨識','#e040fb','vCodes()'],
['🌍','語言包',LANG_TOTAL+' 種語言・每語言一包・1.3x 獎勵','#29b6f6','vLangStudy()'],

['📝','筆記寶庫','AI 結構化筆記・閃卡複習・考試規劃','#ffd740','vNotes()'],

['🎨','創作中心','心智圖・教材漫畫・AI 播客','#ff6e40','vCreate()'],

['🤖','AI 導師','針對筆記問答・專屬家教','#3d5afe','vTutor()'],

['🗺️','個人冒險','每人路線都不同・roguelike','#8b6ce0','vJourney()'],

['📊','統計報表','週報・弱項','#69f0ae','vStats()'],

['🌟','娃娃物語','風火水土・四屬性養成','#7ff0dd','vDoll()'],

['🎨','像素畫板','16~256 畫布・公開畫廊','#ffab40','vPixel()'],

['🎬','創作影片','發影片・最長 5 分鐘','#ff6e40','vVideo()'],

['🔍','AI 找碴','找出詳解中的錯誤','#ff5722','vFindError()'],

['💻','程式沙盒','安全執行程式碼','#9c27b0','vSandbox()'],

['🛡️','思考守護','同意管理・思考指數','#3f51b5','vConsent()'],

['🏛','信任公約','家庭數位信任','#795548','vTrust()'],

['👨‍👩‍👧','家長查看要求','同意或拒絕家長查看','#e91e63','childConsentPanel()'],

['📊','思考報告','我的自主思考指數','#607d8b','vThinkingReport()'],



['⚔️','班級戰','全班答題數＋在線時間','#ff7043','vClassWar()'],

['💬','世界頻道','公開聊天','#38d9c0','vChatV()'],

['📢','公告欄','全校公告','#f2c14e','vAnn()'],
['⚙️','設定','主題・時間鎖','#546e7a','vSet()'],

['🗺️','AI 學習路徑','弱點分析・個人化推薦','#00bcd4','generateLearningPathUI()'],

['🏟️','班級即時競賽','全班同步答題・即時排名','#ff5722','startClassCompetitionUI()']

];
function langName(code){for(const r in LANG_DATA){const f=LANG_DATA[r].find(x=>x[0]===code);if(f)return f[1]}return code||''}
function langFind(txt){const t=(txt||'').trim().toLowerCase();const out=[];for(const r in LANG_DATA)for(const x of LANG_DATA[r]){if(!t||x[0].toLowerCase().includes(t)||x[1].includes(t))out.push([r,x[0],x[1]])}return out}
function langPref(){const u=me();return (u&&u.prof&&u.prof.langPref)||''}
function setLangPref(code){const u=me();if(!u)return;u.prof=u.prof||{};u.prof.langPref=code;saveU(u);if(code&&typeof translateAndApply==='function'){translateAndApply(code)}hud();const v=$('#view');if(v&&v.textContent&&v.textContent.indexOf('⚙️ 設定')>-1){if(typeof vSet==='function')vSet()}else if(typeof langFilter==='function')langFilter(langFilter.cur||'')}
function langG(g){g=g||{};g.stats=g.stats||{};g.stats.lang=g.stats.lang||{};return g.stats.lang}
/* ════════ 語言自學畫面（v3.0）：選語言 → AI 出題 → 1.3x 獎勵，每語言個別統計 ════════ */
let LQ={code:'',name:'',q:null,phase:'IDLE',sel:-1,t0:0,diff:45};
/* ════════════════════════════════════════════
   vLangStudy 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLangStudy
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vLangStudy 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLangStudy
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vLangStudy 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLangStudy
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vLangStudy 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLangStudy
   ════════════════════════════════════════════ */
async function vLangStudy(){
  if(!await needJs(['js/views/vLangStudy.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vLangStudy();
}
/* ═══ 新增模組：AI 端點 / 找碴 / 沙盒 / 同意 / 信任 / 思考報告 / 蘇格拉底 ═══ */
async function vAiProvider(){if(!await needJs(['js/views/vAiProvider.js']))return toast('模組載入失敗','bad');vAiProvider();}
async function vFindError(){if(!await needJs(['js/views/vSocratic.js','js/views/vFindError.js']))return toast('模組載入失敗','bad');vFindError();}
async function vSandbox(){if(!await needJs(['js/views/vSocratic.js','js/views/vSandbox.js']))return toast('模組載入失敗','bad');vSandbox();}
async function vConsent(){if(!await needJs(['js/views/vConsent.js']))return toast('模組載入失敗','bad');vConsent();}
async function vTrust(){if(!await needJs(['js/views/vTrust.js']))return toast('模組載入失敗','bad');vTrust();}
async function vThinkingReport(){if(!await needJs(['js/views/vThinkingTrace.js']))return toast('模組載入失敗','bad');vThinkingReport();}
function vSocraticAdmin(){needJs(['js/views/vSocratic.js']).then(function(){vSocraticAdmin()});}
/* vLangStudy 已修復參數轉發 */




langFilter.cur='';
function langFilter(cat){
  langFilter.cur=cat;
  document.querySelectorAll('[id^=lgf_]').forEach(b=>{b.style.borderColor=(b.id==='lgf_'+(cat||'全部'))?'var(--gold)':'';b.style.color=(b.id==='lgf_'+(cat||'全部'))?'var(--gold2)':''});
  const t=$('#langSearch')?$('#langSearch').value.trim():'';
  const rows=t?langFind(t):(cat?LANG_DATA[cat].map(x=>[cat,x[0],x[1]]):LANG_REGIONS.flatMap(r=>LANG_DATA[r].map(x=>[r,x[0],x[1]])));
  const g=me().g||{},pref=langPref(),langs=langG(g);
  if(pref)rows.sort((a,b)=>(pref===b[1])-(pref===a[1]));
  const el=$('#langGrid');if(!el)return;
  el.innerHTML=rows.map(x=>{
    const [r,code,name]=x,st=langs[code];
    return '<div class="panel2" style="margin:0;padding:12px;display:flex;flex-direction:column;gap:4px">'+
    '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><b style="font-size:14px">'+esc(name)+'</b><span style="font-size:10px;color:var(--mut)">'+code+'</span>'+
    (pref===code?'<span style="font-size:10px;color:var(--gold2);border:1px solid var(--gold);border-radius:8px;padding:1px 6px">⭐ 我的偏好</span>':'')+'</div>'+
    '<span style="font-size:11px;color:'+(st?'var(--teal)':'var(--mut)')+'">'+(st?('📊 已答 '+st.t+' 題・答對 '+st.c+' 題'):'尚未開始')+'</span>'+
    '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">'+
    '<button class="btn mini" onclick="langStart(\''+code+'\')">✏️ 開始學習</button>'+
    (pref!==code?'<button class="btn ghost mini" onclick="setLangPref(\''+code+'\')">⭐ 設為偏好</button>':'')+
    '</div></div>';
  }).join('')||'<div class="panel2" style="text-align:center;color:var(--mut)">找不到符合的語言，試試別的字。</div>';
}
async function loadLangPack(code){
  /* v4.1：每語言一包 js/langpacks/<code>.js，載入後即時出題（不依賴 AI）*/
  try{
    if(!window.LANG_PACKS)window.LANG_PACKS={};
    if(!window.LANG_PACKS[code])await needJs(['js/langpacks/'+code+'.js']);
    if(!window.LANG_PACKS[code])return null;
    return langQFromPack(code,window.LANG_PACKS[code]);
  }catch(e){return null}
}
function langQFromPack(code,words){
  if(!words||!words.length)return null;
  const idx=Math.floor(Math.random()*words.length);
  const pair=words[idx];
  const others=words.filter((p,i)=>i!==idx&&p[1]!==pair[1]);
  const picks=[pair].concat(others.sort(()=>Math.random()-0.5).slice(0,3)).sort(()=>Math.random()-0.5);
  const name=langName(code)||code;
  return {'題目':'「'+pair[0]+'」用 '+name+'（'+code+'）怎麼說？','選項':picks.map(p=>p[1]),'答案':picks.indexOf(pair),'解析':pair[1]+' 是「'+pair[0]+'」的意思。'};
}
function langStart(code){
  const lu=me();if(lu&&!lu.g){lu.g=newGame();saveU(lu)} /* v4.0：老師/管理員也有遊戲統計 */
  LQ.code=code;LQ.name=langName(code);LQ.phase='LOADING';
  $('#view').innerHTML=back('vLangStudy()')+'<h3 class="vt">🌍 '+esc(LQ.name)+' <span class="vsub">本地語言包・1.3x 獎勵</span></h3>'+
  '<div style="text-align:center;padding:50px 0"><div style="font-size:52px;animation:spP 1s infinite">🌏</div><p style="color:var(--gold2);font-weight:900;font-family:var(--serif)">正在載入 '+esc(LQ.name)+' 語言包…</p></div>';
  loadLangPack(code).then(q=>{
    if(!q){LQ.phase='IDLE';$('#view').innerHTML=back('vLangStudy()')+'<h3 class="vt">🌍 '+esc(LQ.name)+'</h3>'+
      '<div class="panel2" style="border-left:4px solid var(--red);margin-bottom:12px">❌ 語言包載入失敗，請稍後重試。</div>'+
      '<button class="btn big" onclick="langStart(\''+LQ.code+'\')">🔄 重試</button>';return}
    LQ.q=q;LQ.sel=-1;LQ.t0=Date.now();LQ.phase='ANSWERING';langRenderQ();
  }).catch(()=>{LQ.phase='IDLE';toast('⚠️ 載入失敗，請重試','bad')});
}
async function langAsk(){
  /* v4.1：本地語言包優先（即時出題，免等待）；語言包沒有才走 AI，AI 失敗再用 LANG_FALLBACK */
  const diffLabel=LQ.diff>=70?'困難':(LQ.diff>=40?'中等':'簡單');
  const packQ=langQFromPack(LQ.code,window.LANG_PACKS&&window.LANG_PACKS[LQ.code]);
  if(packQ)return packQ;
  try{return await langAskAI(LQ.name,LQ.code,diffLabel)}catch(e){return null}
}
function langRenderQ(){
  const q=LQ.q,st=langG(me().g)[LQ.code]||{t:0,c:0};
  $('#view').innerHTML=back('vLangStudy()')+'<h3 class="vt">🌍 '+esc(LQ.name)+' <span class="vsub">第 '+(st.t+1)+' 題・答對可獲 1.3x 獎勵</span></h3>'+
  '<div class="panel2" style="border-left:4px solid var(--teal);font-size:15.5px;line-height:1.8;margin-bottom:12px">'+esc(q['題目'])+'</div>'+
  '<div id="langOpts" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+q['選項'].map((o,i)=>'<button class="optBtn" id="lopt'+i+'" onclick="langPick('+i+')">'+esc(o)+'</button>').join('')+'</div>'+
  '<div id="langFoot" style="margin-top:12px"></div>';
}
function langPick(i){
  if(LQ.phase!=='ANSWERING')return;
  LQ.sel=i;LQ.phase='SUBMITTED';
  const q=LQ.q,ok=i===q['答案'];
  document.querySelectorAll('#langOpts .optBtn').forEach(b=>b.classList.add('lock'));
  document.getElementById('lopt'+q['答案']).classList.add('ok');
  if(!ok)document.getElementById('lopt'+i).classList.add('no');
  const g=me().g,st=langG(g)[LQ.code]=langG(g)[LQ.code]||{t:0,c:0};
  st.t=(st.t||0)+1;if(ok)st.c=(st.c||0)+1;
  const R=langSettle(g,ok);
  const el=((Date.now()-LQ.t0)/1000).toFixed(1);
  $('#langFoot').innerHTML='<div class="rwRow">'+(ok?'<span class="rwChip" style="border-color:#2e7d32;color:#a5d6a7">✅ 答對了！</span>':'<span class="rwChip" style="border-color:#8f272b;color:#ffb4ab">❌ 答錯了，正確答案：'+esc(q['選項'][q['答案']])+'</span>')+
  '<span class="rwChip">⏱ '+el+'s</span>'+(ok?'<span class="rwChip" style="border-color:var(--gold);color:var(--gold2)">✨ 經驗 +'+R.exp+'</span><span class="rwChip" style="border-color:var(--gold);color:var(--gold2)">🪙 金幣 +'+R.au+'</span><span class="rwChip" style="border-color:var(--gold);color:var(--gold2)">💠 水晶 +'+R.cr+'</span>':'')+'</div>'+
  '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn big" onclick="langStart(\''+LQ.code+'\')">⏭ 下一題</button>'+
  '<button class="btn ghost big" onclick="vLangStudy()">🌍 換語言</button></div>';
}
function langSettle(g,ok){
  recordAns(g,ok,LQ.diff,'lang:'+LQ.code);
  const R={exp:0,cr:0,au:0,dm:0};
  if(ok){
    addCombo(g);
    const xp=grantExp(g,LQ.diff,false,'lang:'+LQ.code),xpE=Math.floor(xp*0.3);
    g.xp+=xpE;R.exp=xp+xpE;
    const rw=grantRew(g,LQ.diff,g.combo),crE=Math.floor(rw.crystal*0.3),auE=Math.floor(rw.gold*0.3),dmE=Math.floor(rw.diamond*0.3);
    g.crystal+=crE;g.gold+=auE;g.diamond=Number(g.diamond||0)+dmE;
    R.cr=rw.crystal+crE;R.au=rw.gold+auE;R.dm=rw.diamond+dmE;
    if(g.xp>=g.needXp&&g.lv<effMaxLv()){g.xp-=g.needXp;g.lv++;g.needXp=CFG.needXp(g.lv);toast('🌟 等級提升！Lv.'+g.lv+' 【'+titleOf(g.lv)+'】')}
  }else resetCombo(g);
  saveU(g);
  return R;
}
/* 本地單字庫 fallback（v4.0）：AI 出題失敗/卡住時的備援題庫（常見語言）*/
const LANG_FALLBACK={
'zh-CN':[['你好','你好'],['谢谢','谢谢'],['再见','再见'],['早上好','早上好'],['水','水'],['朋友','朋友'],['学校','学校'],['学习','学习']],
'zh-TW':[['你好','你好'],['謝謝','謝謝'],['再見','再見'],['早安','早安'],['水','水'],['朋友','朋友'],['學校','學校'],['學習','學習']],
'yue':[['你好','你好'],['多謝','多謝'],['再見','再見'],['早晨','早晨'],['水','水'],['朋友','朋友'],['返學','返學'],['好食','好食']],
'ja':[['你好','こんにちは'],['謝謝','ありがとう'],['再見','さようなら'],['早安','おはよう'],['水','みず'],['朋友','ともだち'],['學校','がっこう'],['學習','べんきょう']],
'ko':[['你好','안녕하세요'],['謝謝','감사합니다'],['再見','안녕히 가세요'],['早安','좋은 아침'],['水','물'],['朋友','친구'],['學校','학교'],['學習','공부']],
'en':[['你好','Hello'],['謝謝','Thank you'],['再見','Goodbye'],['早安','Good morning'],['水','Water'],['朋友','Friend'],['學校','School'],['學習','Study']],
'fr':[['你好','Bonjour'],['謝謝','Merci'],['再見','Au revoir'],['早安','Bonjour'],['水','Eau'],['朋友','Ami'],['學校','École'],['學習','Apprendre']],
'de':[['你好','Hallo'],['謝謝','Danke'],['再見','Auf Wiedersehen'],['早安','Guten Morgen'],['水','Wasser'],['朋友','Freund'],['學校','Schule'],['學習','Lernen']],
'es':[['你好','Hola'],['謝謝','Gracias'],['再見','Adiós'],['早安','Buenos días'],['水','Agua'],['朋友','Amigo'],['學校','Escuela'],['學習','Aprender']],
'pt':[['你好','Olá'],['謝謝','Obrigado'],['再見','Adeus'],['早安','Bom dia'],['水','Água'],['朋友','Amigo'],['學校','Escola'],['學習','Aprender']],
'it':[['你好','Ciao'],['謝謝','Grazie'],['再見','Arrivederci'],['早安','Buongiorno'],['水','Acqua'],['朋友','Amico'],['學校','Scuola'],['學習','Imparare']],
'nl':[['你好','Hallo'],['謝謝','Dank je'],['再見','Tot ziens'],['早安','Goedemorgen'],['水','Water'],['朋友','Vriend'],['學校','School'],['學習','Leren']],
'pl':[['你好','Cześć'],['謝謝','Dziękuję'],['再見','Do widzenia'],['早安','Dzień dobry'],['水','Woda'],['朋友','Przyjaciel'],['學校','Szkoła'],['學習','Uczyć się']],
'ru':[['你好','Привет'],['謝謝','Спасибо'],['再見','До свидания'],['早安','Доброе утро'],['水','Вода'],['朋友','Друг'],['學校','Школа'],['學習','Учить']],
'uk':[['你好','Привіт'],['謝謝','Дякую'],['再見','До побачення'],['早安','Доброго ранку'],['水','Вода'],['朋友','Друг'],['學校','Школа'],['學習','Вчитися']],
'th':[['你好','สวัสดี'],['謝謝','ขอบคุณ'],['再見','ลาก่อน'],['早安','อรุณสวัสดิ์'],['水','น้ำ'],['朋友','เพื่อน'],['學校','โรงเรียน'],['學習','เรียน']],
'vi':[['你好','Xin chào'],['謝謝','Cảm ơn'],['再見','Tạm biệt'],['早安','Chào buổi sáng'],['水','Nước'],['朋友','Bạn'],['學校','Trường học'],['學習','Học']],
'vi-N':[['你好','Xin chào'],['謝謝','Cảm ơn'],['再見','Tạm biệt'],['早安','Chào buổi sáng'],['水','Nước'],['朋友','Bạn'],['學校','Trường học'],['學習','Học tập']],
'id':[['你好','Halo'],['謝謝','Terima kasih'],['再見','Selamat tinggal'],['早安','Selamat pagi'],['水','Air'],['朋友','Teman'],['學校','Sekolah'],['學習','Belajar']],
'ms':[['你好','Halo'],['謝謝','Terima kasih'],['再見','Selamat tinggal'],['早安','Selamat pagi'],['水','Air'],['朋友','Kawan'],['學校','Sekolah'],['學習','Belajar']],
'fil':[['你好','Kumusta'],['謝謝','Salamat'],['再見','Paalam'],['早安','Magandang umaga'],['水','Tubig'],['朋友','Kaibigan'],['學校','Paaralan'],['學習','Mag-aral']],
'jv':[['你好','Halo'],['謝謝','Matur nuwun'],['再見','Pamit'],['早安','Sugeng enjang'],['水','Banyu'],['朋友','Kanca'],['學校','Sekolah'],['學習','Sinau']],
'ceb':[['你好','Kumusta'],['謝謝','Salamat'],['再見','Paalam'],['早安','Maayong buntag'],['水','Tubig'],['朋友','Higala'],['學校','Eskwelahan'],['學習','Tun-an']],
'hi':[['你好','नमस्ते'],['謝謝','धन्यवाद'],['再見','अलविदा'],['早安','सुप्रभात'],['水','पानी'],['朋友','दोस्त'],['學校','विद्यालय'],['學習','सीखना']],
'bn':[['你好','নমস্কার'],['謝謝','ধন্যবাদ'],['再見','বিদায়'],['早安','শুভ সকাল'],['水','পানি'],['朋友','বন্ধু'],['學校','স্কুল'],['學習','শেখা']],
'ta':[['你好','வணக்கம்'],['謝謝','நன்றி'],['再見','பிரியாவிடை'],['早安','காலை வணக்கம்'],['水','தண்ணீர்'],['朋友','நண்பன்'],['學校','பள்ளி'],['學習','கற்றல்']],
'te':[['你好','నమస్కారం'],['謝謝','ధన్యవాదాలు'],['再見','వీడ్కోలు'],['早安','శుభోదయం'],['水','నీరు'],['朋友','స్నేహితుడు'],['學校','పాఠశాల'],['學習','నేర్చుకోవడం']],
'ur':[['你好','سلام'],['謝謝','شکریہ'],['再見','خدا حافظ'],['早安','صبح بخیر'],['水','پانی'],['朋友','دوست'],['學校','اسکول'],['學習','سیکھنا']],
'fa':[['你好','سلام'],['謝謝','ممنون'],['再見','خداحافظ'],['早安','صبح بخیر'],['水','آب'],['朋友','دوست'],['學校','مدرسه'],['學習','یادگیری']],
'sw':[['你好','Habari'],['謝謝','Asante'],['再見','Kwaheri'],['早安','Habari za asubuhi'],['水','Maji'],['朋友','Rafiki'],['學校','Shule'],['學習','Kujifunza']],
'eo':[['你好','Saluton'],['謝謝','Dankon'],['再見','Ĝis revido'],['早安','Bonan matenon'],['水','Akvo'],['朋友','Amiko'],['學校','Lernejo'],['學習','Lerni']],
};
async function langAskAI(name,code,diffLabel){
  function parse(raw){
    const m=raw.match(/\[[\s\S]*?\]/);if(!m)return null;
    let arr;
    try{arr=JSON.parse(m[0])}catch(e){return null}
    if(!Array.isArray(arr)||!arr[0]||typeof arr[0]['題目']!=='string'||!Array.isArray(arr[0]['選項'])||arr[0]['選項'].length<2)return null;
    const q=arr[0];
    q['選項']=q['選項'].slice(0,4);
    if(typeof q['答案']!=='number'||q['答案']<0||q['答案']>=q['選項'].length)q['答案']=0;
    if(typeof q['解析']!=='string')q['解析']='';
    return q;
  }
  function timed(p,ms){ /* 出題防卡住（v4.0）：45 秒無回應即放棄，改用備援 */
    return new Promise((resolve,reject)=>{
      const t=setTimeout(()=>reject(new Error('timeout')),ms);
      p.then(v=>{clearTimeout(t);resolve(v)},e=>{clearTimeout(t);reject(e)});
    });
  }
  const sys='你是專業的語言教學專家，精通各國語言與人工語言（含克林貢語、精靈語、納美語等）。嚴格按照 JSON 格式回應，不要包含任何額外文字或 markdown。';
  const sys2='你是語言教學專家。嚴格按照 JSON 格式回應。';
  try{
    const prompt='生成 1 道語言學習選擇題：\n學習語言：'+name+'（代碼 '+code+'）\n難度：'+diffLabel+'\n題型：單字／片語 中⇄外配對（題目用繁體中文發問，外文部分用該語言正確的文字）\n要求：\n1. 恰好 4 個選項、只有 1 個正確\n2. 外文拼寫必須正確，含該語言的文字系統\n3. 純文字，禁止圖片、照片、「如圖」、聽力題\n4. 題目與選項避免與常見教材模板完全相同\n5. 本次出題隨機碼：'+Math.random().toString(36).slice(2,9)+'\n\nJSON 格式：[{"題目":"...","選項":["A","B","C","D"],"答案":0,"解析":"..."}]';
    const q=parse(await timed(callGemini(prompt,sys),45000));
    if(q)return q;
  }catch(e){}
  try{ /* 第二輪：簡化 prompt（允許羅馬拼音，小語種成功率大增）*/
    const prompt2='出 1 道語言選擇題（語言：'+name+'，代碼 '+code+'，難度 '+diffLabel+'）：一個中文詞對應四個該語言寫法／拼音，只有一個正確。該語言若無文字或難寫，可用羅馬拼音標示。恰好 4 選項。隨機碼 '+Math.random().toString(36).slice(2,9)+'。\n\nJSON：[{"題目":"...","選項":["A","B","C","D"],"答案":0,"解析":"..."}]';
    const q2=parse(await timed(callGemini(prompt2,sys2),45000));
    if(q2)return q2;
  }catch(e){}
  const fb=LANG_FALLBACK[code]; /* 本地單字庫備援（AI 全失敗/卡住時）*/
  if(fb&&fb.length){
    const idx=Math.floor(Math.random()*fb.length);
    const pair=fb[idx];
    const others=fb.filter((p,i)=>i!==idx&&p[1]!==pair[1]);
    const picks=[pair].concat(others.sort(()=>Math.random()-0.5).slice(0,3)).sort(()=>Math.random()-0.5);
    return {'題目':'「'+pair[0]+'」用 '+name+'（'+code+'）怎麼說？','選項':picks.map(p=>p[1]),'答案':picks.indexOf(pair),'解析':pair[1]+' 是「'+pair[0]+'」的意思。'};
  }
  /* v4.1：AI 失敗時改用每語言專屬語言包（js/langpacks/<code>.js）*/
  const packQ=langQFromPack(code,window.LANG_PACKS&&window.LANG_PACKS[code]);
  if(packQ)return packQ;
  return null;
}


/* 🗂 功能分類（排版）：把 32+ 個功能分區顯示，不再全部平鋪 */
const FEAT_CATS=[
  ['🌍 語言包',['vSubj','vLearn','vHomework','vVideos','vLab','vWrong','vStats','vLangStudy','openVideoHub']],
  ['⚔️ 戰鬥冒險',['vPK','vTerr','vDungeon','vInfinityExchange']],
  ['🎁 養成經營',['vGacha','vColl','vForge','vBag','vDoll','vEquip','vFreePoints','vBuffStore']],
  ['💬 社群互動',['vSocial','vChatV','vGuild','vAnn']],
  ['🏆 成就兌換',['vRank','vTitleV','vExch','vMiss','vShopV','vGShop','vGames','vCodes','vClassWar']],
  ['🎨 創作分享',['vPixel','vVideo']],
  ['💻 虛擬終端',['vTerminal']],
  ['🤖 AI 學習',['vFindError','vSandbox','vNotes','vCreate','vTutor','vJourney','generateLearningPathUI']],
  ['🏟️ 班級競賽',['startClassCompetitionUI','vClassWar']],
  ['🛡️ 信任守護',['vConsent','vTrust','vThinkingReport','childConsentPanel']],
  ['⚙️ 系統',['vSet','vAdminPanel']]
];
function featCatsHtml(){
  let h='';
  FEAT_CATS.forEach(c=>{
    const items=FEATS.filter(f=>!(f[5]&&!(typeof IS_ADMIN==='function'&&IS_ADMIN()))).filter(f=>c[1].includes(String(f[4]).replace('()','')));
    if(!items.length)return;
    h+='<div class="featCat">'+c[0]+'</div><div class="featGrid">'+items.map((f,i)=>'<div class="feat" style="--fc:'+f[3]+';animation:pop .38s both;animation-delay:'+(i*0.04).toFixed(2)+'s" onclick="'+f[4]+'"><span class="fIco">'+f[0]+'</span><b>'+f[1]+'</b><i>'+f[2]+'</i></div>').join('')+'</div>';
  });
  return h;
}

function renderStudent(u){

CUR={collTab:'character',collFilter:'all',collSort:'rarity'};

u.g=fillGame(u.g);saveU(u); /* 補齊缺失欄位，避免舊存檔造成 UI 空白 */

applyMyBg(); /* 套用個人背景設定 */

const g=u.g,imp=get(LS.ses).imp;

$('#app').innerHTML=

'<header class="hud"><div class="hudL"><span class="hlogo">⚔️</span>'+

'<span class="hlv" id="hudLv">👑 Lv.'+g.lv+'</span><span class="htitle" id="hudTitle">【 '+titleOf(g.lv)+' 】</span>'+

'<span class="xpwrap"><span class="bar xpb"><i id="hudXpBar" style="width:'+(g.xp/g.needXp*100)+'%"></i></span><b id="hudXpTxt">'+g.xp+'/'+g.needXp+'</b></span></div>'+

'<div class="hudR"><span class="chip">⚡ <b id="hudPow">'+power(g)+'</b></span>'+

'<span class="chip">🔥 <b id="hudCombo">'+g.combo+'</b></span>'+

'<span class="chip cry">💠 <b id="hudCry">'+g.crystal+'</b></span>'+

'<span class="chip coin">🪙 <b id="hudGold">'+g.gold+'</b></span>'+

'<span class="chip gem">💎 <b id="hudDia">'+g.diamond+'</b></span>'+

'<span class="chip sl">✨ <b id="hudSl">'+g.starlight+'</b></span>'+

'<span class="chip honor">🏅 <b id="hudHonor">'+g.honor+'</b></span>'+

(function(){try{var consents=get('ADV9_PARENT_CONSENTS',{requests:[]});var pending=consents.requests.filter(function(r){return r.child===u.username&&r.status==='pending'});return pending.length?'<span class="chip imp" style="cursor:pointer" onclick="childConsentPanel()">📨 家長要求 <b>'+pending.length+'</b></span>':'';}catch(e){return ''}})()+

(u.role==='admin'?'<button class="btn mini teal" onclick="renderAdmin(me())">👑 返回管理員</button>':'')+(imp?'<span class="chip imp">👑 管理員觀察中</span><button class="btn mini" onclick="backAdmin()">返回管理員</button>':'')+

'<button class="btn ghost mini" onclick="logout()">🚪 登出</button></div></header>'+

'<div class="wrap"><main id="view" class="panel view"></main></div>';

vHome();

}

function hud(){

const u=me();if(!u||!u.g)return;const g=u.g;

const s=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};

s('hudLv','👑 Lv.'+g.lv);s('hudTitle','【 '+titleOf(g.lv)+' 】');

s('hudPow',power(g));s('hudCombo',g.combo);

s('hudCry',g.crystal);s('hudGold',g.gold);s('hudDia',g.diamond);s('hudSl',g.starlight);s('hudHonor',g.honor);

s('hudXpTxt',g.xp+'/'+g.needXp);

const b=document.getElementById('hudXpBar');if(b)b.style.width=(g.xp/g.needXp*100)+'%';

}

/* ════════════════════════════════════════════
   vHome 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 47 個單位：SUPA_KEY, WTOKEN, mediaHeaders, upProg, GDRIVE_URL, gdDelete, _hbTimer, stopHeartbeat, updateOnlBadges, _es, stopStream, closeReqPanel…
   ════════════════════════════════════════════ */
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
 const ac=new AbortController();const t=setTimeout(()=>ac.abort(),25000); /* v4.1：AI 25 秒無回應即中止，避免「一直卡住」 */
 const finalize=()=>{clearTimeout(t)};
 if(pv.type==='ol'){ /* 本地 Ollama：經自架伺服器代理，金鑰欄位 = 主機位址 */
 const res=await fetch(pv.url,{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json',...((typeof WTOKEN!=='undefined'&&WTOKEN)?{'x-adv9-token':WTOKEN}:{})},body:JSON.stringify({model,host:k.key||'http://127.0.0.1:11434',messages:[{role:'system',content:sys||'你是一個專業的出題助手。'},{role:'user',content:prompt}],temperature:0.7})});
 finalize();
 if(!res.ok)throw new Error('HTTP '+res.status);
 const j=await res.json();if(!j.message||!j.message.content)throw new Error('No content');
 return j.message.content}
 if(pv.type==='gm'){
 const url='https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent?key='+k.key;
 const res=await fetch(url,{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({system_instruction:{parts:[{text:sys||'你是一個專業的出題助手。'}]},contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.7,maxOutputTokens:4096}})});
 finalize();
 if(!res.ok)throw new Error('HTTP '+res.status);
 const j=await res.json();if(!j.candidates||!j.candidates[0])throw new Error('No candidates');
 return j.candidates[0].content.parts[0].text}
 const res=await fetch(pv.url,{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json','Authorization':'Bearer '+k.key},body:JSON.stringify({model,messages:[{role:'system',content:sys||'你是一個專業的出題助手。'},{role:'user',content:prompt}],temperature:0.7,max_tokens:4096})});
 finalize();
 if(!res.ok)throw new Error('HTTP '+res.status);
 const j=await res.json();if(!j.choices||!j.choices[0])throw new Error('No choices');
 return j.choices[0].message.content}


const TIPS=['💡 氫氣是密度最小的氣體','💡 英文的 I 永遠大寫','💡 歐姆定律 V = IR','💡 電流 I = Q/t','💡 光的入射角等於反射角','💡 質量守恆定律','💡 pH 值越小越酸','💡 地球自轉一圈約 24 小時','💡 三角形內角和 180°','💡 水的電解：氫:氧 = 2:1','💡 光合作用需要光與葉綠素','💡 牛頓第二運動定律 F = ma','💡 連擊 10 以上經驗加成 12%！'];

/* ═══ AI 個人化學習路徑 ═══ */
function analyzeLearningPath(subj){
  var u=me(),g=u.g;
  var wrong=g.wrong||{};
  var subjectWrong=wrong[subj]||[];

  var unitStats={};
  subjectWrong.forEach(function(w){
    var unit=w.unit||'未分類';
    if(!unitStats[unit])unitStats[unit]={total:0,recent:0,items:[]};
    unitStats[unit].total++;
    var wt=new Date(w.t).getTime();
    if(Date.now()-wt<7*86400000)unitStats[unit].recent++;
    unitStats[unit].items.push(w);
  });

  var sorted=Object.keys(unitStats).sort(function(a,b){
    var sa=unitStats[a],sb=unitStats[b];
    var scoreA=sa.total+sa.recent*2;
    var scoreB=sb.total+sb.recent*2;
    return scoreB-scoreA;
  });

  var path=[];
  sorted.forEach(function(unit){
    var s=unitStats[unit];
    var mastery='beginner';
    if(s.total<=2)mastery='learning';
    else if(s.total<=5)mastery='practicing';
    else mastery='needs_review';

    path.push({
      unit:unit,
      mistakes:s.total,
      recentMistakes:s.recent,
      mastery:mastery,
      priority:s.total+s.recent*2
    });
  });

  return path;
}

function generateLearningPathUI(){
  var subj=prompt('選擇科目（數學/英文/自然/社會）：');
  if(subj)generateLearningPath(subj);
}

function startClassCompetitionUI(){
  if(me().role!=='teacher'&&me().role!=='admin')return toast('⚠️ 僅教師/管理員可發起競賽','bad');
  var subj=prompt('科目（數學/英文/自然/社會）：')||'數學';
  var dur=parseInt(prompt('時間（秒）：','300'))||300;
  startClassCompetition();
}

function generateLearningPath(subj){
  var path=analyzeLearningPath(subj);
  var u=me(),g=u.g;

  var h='<h2 class="mt">🗺️ '+esc(subj)+' 學習路徑</h2>';

  if(!path.length){
    h+='<p style="color:var(--mut);text-align:center">目前還沒有答題紀錄，先去修煉場挑戰吧！</p>';
    h+='<div class="mBtns"><button class="btn ghost" onclick="closeModal()">關閉</button></div>';
    openModal(h);
    return;
  }

  h+='<p style="color:var(--mut);font-size:13px">根據你的答題弱點，AI 為你規劃了以下學習順序（弱點優先）</p>';

  path.forEach(function(item,idx){
    var colors={'needs_review':'#ff6b6b','practicing':'#ffa500','learning':'#4ecdc4','beginner':'#95a5a6'};
    var labels={'needs_review':'🔴 需複習','practicing':'🟠 練習中','learning':'🟢 學習中','beginner':'⚪ 初學'};

    h+='<div class="rwRow" style="border-left:4px solid '+colors[item.mastery]+';padding-left:12px;margin:8px 0">';
    h+='<div style="flex:1">';
    h+='<strong>'+(idx+1)+'. '+esc(item.unit)+'</strong>';
    h+='<div style="font-size:12px;color:var(--mut)">'+labels[item.mastery]+' | 錯 '+item.mistakes+' 題 | 近期 '+item.recentMistakes+' 題</div>';
    h+='</div>';
    h+='<button class="btn sm" onclick="closeModal();Quiz.unit=\''+esc(item.unit)+'\';Quiz.subj=\''+esc(subj)+'\';startQuizBank()">開始練習</button>';
    h+='</div>';
  });

  var totalMistakes=path.reduce(function(a,b){return a+b.mistakes},0);
  var needsReview=path.filter(function(p){return p.mastery==='needs_review'}).length;
  h+='<div class="rwRow" style="margin-top:16px;background:#1a2a4a">';
  h+='<span class="rwChip">📊 共 '+path.length+' 單元</span>';
  h+='<span class="rwChip">🔴 需複習 '+needsReview+'</span>';
  h+='<span class="rwChip">📝 共錯 '+totalMistakes+' 題</span>';
  h+='</div>';

  h+='<div class="mBtns"><button class="btn ghost" onclick="closeModal()">關閉</button></div>';
  openModal(h);
}

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

/* ════════════════════════════════════════════
   vHome 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vHome, tutorGuide
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vHome 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vHome, tutorGuide
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vHome 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vHome, tutorGuide
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vHome 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vHome, tutorGuide
   ════════════════════════════════════════════ */
async function vNotes(){if(!await needJs(['js/views/vNotes.js']))return toast('模組載入失敗，請重新整理頁面','bad');if(!nbImportShare())vNotes();}
async function vCreate(){if(!await needJs(['js/views/vCreate.js']))return toast('模組載入失敗，請重新整理頁面','bad');vCreate();}
async function vTutor(){if(!await needJs(['js/views/vCreate.js']))return toast('模組載入失敗，請重新整理頁面','bad');CR.tab='tutor';vCreate();}
async function vJourney(){if(!await needJs(['js/views/vJourney.js']))return toast('模組載入失敗，請重新整理頁面','bad');vJourney();}
async function vHome(){
  if(!await needJs(['js/views/vHome.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vHome();
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


