/* ════════════════════════════════════════════════════
   修練場答題流程（Quiz 狀態、qReset、vSubj、vQuestion、結算、掉落、稱號）
   由 tools/build/split.py 從 public/index.html 抽出（懶載入模組）
   ════════════════════════════════════════════════════ */
const Quiz={phase:'IDLE',mode:'normal',subj:'',sem:'',unit:'',diff:50,pub:'康軒版',useAI:true,q:null,sel:null,terrName:null,retrySubj:null,retryIdx:null,t0:0};

function qReset(){Quiz.phase='IDLE';Quiz.sel=null;Quiz.q=null}

function vSubj(){

qReset();Quiz.phase='SELECT_MODE';

const _g=me().g,_e=effOf(_g);const _cp=Math.round(((1+(_e.all_exp_bonus||0)+(_e.exp_bonus||0))-1)*100);

$('#view').innerHTML=back()+'<h3 class="vt">⚔️ 選擇科目 <span class="vsub">修煉場｜答題戰鬥</span></h3>'+

'<div class="panel2" style="margin-bottom:12px;font-size:12.5px;border-left:4px solid var(--gold);color:var(--mut)">💪 目前收藏與升星全經驗加成：<b style="color:var(--gold2)">+'+_cp+'%</b>（另有科目/難度/連擊加成，結算時顯示完整明細）｜5★覺醒滿配技能效果最高 <b style="color:var(--gold2)">+275%（總倍率 3.75）</b>｜等級上限 <b style="color:var(--gold2)">Lv.300</b></div>'+

'<div class="subjGrid">'+

Object.keys(SUBJ).map(s=>'<button class="subjB" style="background:'+SUBJ[s].c+'" onclick="vUnitList(\''+s+'\')">'+SUBJ[s].i+'<br>'+s+'</button>').join('')+'</div>';

}

/* 第一步：選學期→單元（點單元直接進設定，解決卡住問題）*/

function vUnitList(subj){

Quiz.subj=subj;const S=SUBJ[subj];

$('#view').innerHTML=back('vSubj()')+'<h3 class="vt">'+S.i+' '+subj+'｜選擇學期與單元 <span class="vsub">點選單元即進入出發設定</span></h3>'+

'<div class="panel2">'+Object.keys(S.u).map(sem=>'<div class="semT">📚 '+sem+'</div>'+

S.u[sem].map(un=>'<button class="unitRow" onclick="vReady(\''+sem+'\',\''+un+'\')">➜ '+un+'</button>').join('')).join('')+'</div>';

}

/* 第二步：出發設定（難度/版本/AI）＋ 超大開始按鈕 */

function vReady(sem,unit){

Quiz.sem=sem;Quiz.unit=unit;const g=me().g,md=maxDiff(g);

$('#view').innerHTML=back('vUnitList(\''+Quiz.subj+'\')')+

'<h3 class="vt">'+SUBJ[Quiz.subj].i+' '+Quiz.subj+'｜'+sem+'｜'+unit+' <span class="vsub">出發設定</span></h3>'+

'<div class="panel2"><b style="color:var(--teal)">📖 版本</b><div style="display:flex;gap:14px;margin:8px 0">'+

['康軒版','翰林版','南一版'].map((p,i)=>'<label style="font-size:13px;cursor:pointer"><input type="radio" name="pub" value="'+p+'" '+(i===0?'checked':'')+' style="width:auto"> '+p+'</label>').join('')+'</div>'+

'<b style="color:var(--teal)">🎯 難度（1~'+md+'）</b>'+

'<div style="display:flex;gap:12px;align-items:center;margin:8px 0"><input type="range" id="diffS" min="1" max="'+md+'" value="'+Math.min(50,md)+'" oninput="diffChg()" style="flex:1">'+

'<b id="diffL" style="color:var(--gold2);min-width:130px"></b></div>'+

'<div id="diffD" style="font-size:12px;color:var(--mut)"></div><div id="diffR" style="font-size:12px;color:var(--green);margin-top:4px"></div>'+

'<button class="btn big" style="font-size:18px;padding:16px;margin-top:12px" onclick="startQuiz()">⚔️ 開始答題</button></div>';

diffChg();

}

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

if(!aiQ){ /* 不默默退回題庫：顯示錯誤，由使用者選擇重試或明確改用題庫 */

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

setTimeout(()=>{Quiz.q=bankQ(Quiz.subj,Quiz.unit,Quiz.diff);Quiz.q.id=newQid();Quiz.sel=null;Quiz.t0=Date.now();Quiz.phase='ANSWERING';vQuestion()},300);

}

function showLoading(){

$('#view').innerHTML='<div style="text-align:center;padding:60px 0"><div style="font-size:60px;animation:spP 1s infinite">🤖</div>'+

'<p style="font-family:var(--serif);font-weight:900;color:var(--gold2);font-size:17px;margin:12px 0">AI 正在出題中...</p>'+

'<p style="display:inline-block;margin-top:10px;background:rgba(0,0,0,.25);border:1px dashed #6b4a1f;color:#ffb26b;padding:8px 12px;border-radius:5px;font-size:12.5px">'+pick(TIPS)+'</p></div>';

}

function vQuestion(){

const q=Quiz.q,L=['A','B','C','D'],g=me().g;

if(q&&Quiz._seenQid!==q.id){const _u=me();qMarkSeen(_u.g,q);saveU(_u);Quiz._seenQid=q.id} /* 登記已出題目，避免重複 */

$('#view').innerHTML=

'<div class="qStatus"><span class="chip">Lv.'+g.lv+'</span><span class="chip">🔥 '+g.combo+' 連擊</span>'+

'<span class="chip">'+SUBJ[Quiz.subj].i+' '+Quiz.subj+'</span><span class="chip">難度 '+Quiz.diff+'/100</span>'+

(Quiz.mode==='terr'?'<span class="chip" style="color:#c9a6ff">🗺️ 領土戰</span>':'')+

(Quiz.mode==='retry'?'<span class="chip" style="color:#ffb4ab">❌ 錯題重練</span>':'')+

'<button class="btn ghost mini" style="margin-left:auto" onclick="qReset();vHome()">✕</button></div>'+

'<div class="panel2 qCard"><span class="qTag">題目｜'+esc(Quiz.sem||'')+'・'+esc(Quiz.unit)+'</span>'+

'<div class="qStem">'+esc(q['題目'])+'</div></div>'+

q['選項'].map((o,i)=>'<button class="optBtn" id="opt'+i+'" onclick="selectOpt('+i+')">('+L[i]+') '+esc(o)+'</button>').join('')+

'<button class="btn big" id="submitBtn" onclick="submitAns()" style="margin-top:8px">📤 提交答案</button>'+

(Quiz.subj==='數學'?'<div class="panel2" style="margin-top:10px"><span class="qTag">🧮 計算機</span><textarea id="calc" class="calc" rows="3" placeholder="在此打草稿..."></textarea></div>':'');

updSubmit();

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

function vResult(ok,el,R){

const q=Quiz.q,L=['A','B','C','D'],g=me().g;

const eq=g.equip.character?CHARS[g.equip.character]:null;

const quote=eq?'<div class="quote">'+eq.icon+'：'+(ok?pick(['做得好！繼續保持！','太棒了！這題難不倒你！','漂亮！就是這個節奏！']):pick(['沒關係，失敗為成功之母！','別灰心，下次一定可以！','加油，你可以的！']))+'</div>':'';

const chips=['⏱ '+el+'s','🔥 '+g.combo+' 連擊'];

if(R.exp)chips.unshift('✨ +'+R.exp+' XP');

if(R.cr)chips.push('💠 +'+R.cr);if(R.au)chips.push('🪙 +'+R.au);if(R.dm)chips.push('💎 +'+R.dm);

if(R.drop)chips.push(R.drop.t);

const isTerr=Quiz.mode==='terr',isRetry=Quiz.mode==='retry';

$('#view').innerHTML=

'<div class="resBig" style="color:'+(ok?'var(--green)':'#ff7b72')+'">'+(ok?pick(['🎉','✨','🌟','💯','🔥'])+' 答對了！':pick(['😢','💦','🥲','😅'])+' 答錯...')+'</div>'+quote+R.extra+

'<div class="rwRow">'+chips.map(c=>'<span class="rwChip">'+c+'</span>').join('')+'</div>'+

(R.exp&&window._expCalc?'<div class="panel2" style="margin-bottom:10px;border-left:4px solid var(--gold);font-size:13.5px;color:var(--gold2)">📊 修煉數值明細：【基礎數值 '+window._expCalc.base+'】+【收藏與升星加成 +'+window._expCalc.pct+'%】=【最終修煉數值 '+window._expCalc.xp+' XP】</div>':'')+

'<div class="panel2"><b style="color:var(--green)">✅ 正確答案：('+L[q['答案']]+') '+esc(q['選項'][q['答案']])+'</b>'+

(!ok?'<div style="color:#ff7b72;font-size:13px;margin-top:5px">❌ 你的選擇：('+L[Quiz.sel]+') '+esc(q['選項'][Quiz.sel])+'</div>':'')+'</div>'+

'<div class="expl"><b style="color:var(--teal)">💡 解析</b><br>'+esc(q['解析'])+'</div>'+

'<div style="display:flex;gap:10px">'+

(isTerr?'<button class="btn big" onclick="qReset();vTerr()">🗺️ 返回領土</button>'

:isRetry?'<button class="btn big" onclick="qReset();vWrong()">❌ 返回錯題</button>'

:'<button class="btn big" onclick="startQuiz()">➡️ 下一題</button>')+

'<button class="btn ghost big" onclick="qReset();vHome()">🏠 回主選單</button></div>';

}

/* ════════ 引擎：經驗/獎勵/連擊/掉落 ════════ */

function grantExp(g,diff,retry,subj){

if(!rewardOn(g))return 0;

let base=CFG.dRew(diff).exp;if(retry)base=Math.floor(base*1.5);

let m=CFG.lvMult(Math.min(g.lv,CFG.MAX_LV));

if(isEarly())m*=1.05;

/* 收藏與升星加成倍率（單獨計算，供明細顯示；5★覺醒��配最�� +275% = 總倍率 3.75）*/

let cm=1;

const e=effOf(g);cm*=(1+(e.all_exp_bonus||0)+(e.exp_bonus||0));

cm*=(1+0.10*(g.rebirth||0)); /* 🔁 傳承轉生��每次轉生永久全經驗+10% */

const sk={'數學':'math_exp_bonus','英文':'english_exp_bonus','國文':'chinese_exp_bonus','自然':'science_exp_bonus','社會':'social_exp_bonus'}[subj];

if(sk)cm*=(1+(e[sk]||0));

cm*=diff>=50?(1+(e.exp_hard_bonus||0)):(1+(e.exp_easy_bonus||0));

if(g.combo>=10&&e.combo10_exp_mult)cm*=e.combo10_exp_mult;

const baseV=Math.floor(base*m);

const xp=Math.floor(base*m*cm);

window._expCalc={base:baseV,pct:Math.round((cm-1)*100),xp:xp}; /* 供結算畫面顯示公式明細 */

g.xp+=xp;g.quizPts+=Math.floor(xp/5);updMission(g,'exp',xp);

while(g.xp>=g.needXp&&g.lv<effMaxLv()){g.xp-=g.needXp;g.lv++;g.needXp=CFG.needXp(g.lv);toast('🌟 等級提升！Lv.'+g.lv+' 【'+titleOf(g.lv)+'】');showLevelUpFX(g.lv)}

return xp;

}

function grantRew(g,diff,combo){

if(!rewardOn(g))return{crystal:0,gold:0,diamond:0};

const e=effOf(g);

let cr=Math.floor(CFG.dRew(diff).crystal*(1+(e.crystal_bonus||0)));

let au=CFG.dRew(diff).gold+(e.gold_per_correct||0);

au=Math.floor(au*(1+(e.gold_bonus||0)));

if(combo===5)cr+=5;if(combo===10)cr+=15;

if(diff>=50&&e.hard_crystal_bonus)cr+=e.hard_crystal_bonus;

let dm=Math.floor(cr*0.25);g.crystal+=cr;g.gold+=au;g.diamond=(Number(g.diamond)||0)+dm;return{crystal:cr,gold:au,diamond:dm};

}

function addCombo(g){g.combo++;if(g.combo>g.stats.maxCombo)g.stats.maxCombo=g.combo;updMission(g,'combo',g.combo)}

function resetCombo(g){

const e=effOf(g);

if((e.combo_protect||0)>0&&Math.random()<e.combo_protect)return false;

g.combo=0;return true;

}

function comboBonus(g){const e=effOf(g);let b=0;for(const t in CFG.COMBO)if(g.combo>=t)b=CFG.COMBO[t];

if(e.combo_bonus_double)b*=2;if(e.combo_multiplier)b*=e.combo_multiplier;return b+(e.combo_extra||0)}

function rollQuality(g){const e=effOf(g);let r=Math.random(),q;

q=r<.35?'普通':r<.65?'優秀':r<.85?'精良':r<.96?'史詩':'傳說';

if((e.quality_up||0)>0&&Math.random()<e.quality_up){const i=CFG.QUAL.indexOf(q);if(i<4)q=CFG.QUAL[i+1]}

return q;

}

function rollDrop(g,diff){

if(!rewardOn(g))return null;

if(g._nextDrop){g._nextDrop=false;return genDrop(g)}

const rate=CFG.dropRate(diff)+comboBonus(g)+(isEarly()?.03:0)+(effOf(g).drop_bonus||0)+0.05*(g.rebirth||0); /* 🔁 轉生每次掉落+5% */

return Math.random()<rate?genDrop(g):null;

}

function genDrop(g){

const r=Math.random();

if(r<.18){const c=2+((Math.random()*7)|0);g.enhStone+=c;return{t:'🔩 強化石 ×'+c}}

if(r<.26){const c=1+((Math.random()*3)|0);g.ironOre+=c;return{t:'⛏️ 鐵礦 ×'+c}}

if(r<.36){g.protect++;return{t:'🛡️ 保護卷軸 ×1'}}

if(r<.48){const c=10+((Math.random()*31)|0);g.crystal+=c;return{t:'💠 水晶 ×'+c}}

if(r<.60){const c=20+((Math.random()*61)|0);g.gold+=c;return{t:'🪙 金幣 ×'+c}}

if(r<.70){const c=1+((Math.random()*5)|0);g.starlight+=c;return{t:'✨ 星光碎片 ×'+c}}

if(r<.78){const c=2+((Math.random()*5)|0);g.labMat+=c;return{t:'🧪 實驗素材 ×'+c}}

const q=rollQuality(g),slot=pick(['頭盔','胸甲','護腕','鞋子','項鍊','戒指']);

g.weapons.push({n:q+slot,q,lv:0,slot});

return{t:'🛡️ '+q+slot+'（新裝備）'};

}

/* 📝 作答過程紀錄：供師/管端檢視（題目、選項、對錯、作答秒數，最多保留 60 筆）*/

function logAns(g,ok,el){

if(!Quiz||!Quiz.q)return;

const modeName={terr:'領土征服',retry:'錯題重練',pk:'競技場',weekend:'周末決鬥'}[Quiz.mode]||'修煉場';

const opts=Quiz.q['選項']||[];

g.answerLog=g.answerLog||[];

g.answerLog.push({sub:Quiz.subj||Quiz.retrySubj||'',unit:Quiz.unit||'',stem:String(Quiz.q['題目']||'').slice(0,120),

sel:opts[Quiz.sel]!=null?String(opts[Quiz.sel]).slice(0,40):'',ans:opts[Quiz.q['答案']]!=null?String(opts[Quiz.q['答案']]).slice(0,40):'',

calc:(()=>{const c=document.getElementById('calc');return !!(c&&String(c.value||'').trim())})(), /* 🧮 是否使用計算機草稿 */

calcText:(()=>{const c=document.getElementById('calc');return c?String(c.value||'').trim().slice(0,500):''})(), /* 🧮 計算機草稿內容（供老師看過程） */

ok:!!ok,sec:+el,mode:modeName,t:Date.now()});

if(g.answerLog.length>80)g.answerLog=g.answerLog.slice(-80);

}

function recordAns(g,ok,diff,subj){

g.stats.total++;updMission(g,'answer',ok?1:0);updMission(g,'answerTotal',1);

if(diff>=50)updMission(g,'hard',ok?1:0);

if(ok){g.stats.correct++;if(diff>=50)g.stats.hardCorrect=(g.stats.hardCorrect||0)+1;

if(subj)g.stats.subj[subj]=(g.stats.subj[subj]||0)+1;

if(guildOf(g)){g.guildCoin=(g.guildCoin||0)+1} /* 在公會時每答對一題 +1 公會幣 */

}

}

function addWrong(g,subj,q,sel){

g.wrong[subj]=g.wrong[subj]||[];

g.wrong[subj].push({q:{'題目':q['題目'],'選項':q['選項'],'答案':q['答案'],'解析':q['解析']},sel,t:fmt(Date.now()),done:false});

if(g.wrong[subj].length>50)g.wrong[subj]=g.wrong[subj].slice(-50);

}

function checkTitlesAch(g){

for(const t of TITLES)if(t.chk(g)&&!g.titles.includes(t.id)){g.titles.push(t.id);toast('🎖 解鎖稱號：'+t.n)}

for(const a of ACH){

const p=a.prog(g);const claimed=g.ach[a.id]||0;

a.stages.forEach((s,i)=>{if(p>=s.g&&i===claimed){

g.ach[a.id]=i+1;

if(s.rw.gold)g.gold+=s.rw.gold;if(s.rw.crystal)g.crystal+=s.rw.crystal;if(s.rw.diamond)g.diamond+=s.rw.diamond;

if(s.rw.starlight)g.starlight+=s.rw.starlight;if(s.rw.ironOre)g.ironOre+=s.rw.ironOre;

if(s.rw.enhStone)g.enhStone+=s.rw.enhStone;if(s.rw.labMat)g.labMat+=s.rw.labMat;if(s.rw.honor)g.honor+=s.rw.honor;

toast('🏅 成就達成：'+a.n+'（階段'+(i+1)+'）');

}});

}

const pw=power(g);

for(const m of CFG.MILE)if(pw>=m&&!g.stats.milestones.includes(m)){g.stats.milestones.push(m);g.diamond+=3;g.crystal+=50;toast('⚡ 戰力里程碑 '+m+'！+3💎 +50💠')}

}

/* ════════ #7 收藏四分頁＋升星/強化分流說明 ════════ */

