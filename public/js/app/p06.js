/* ════════ 抽卡 ════════ */

/* 卡池等級 1~100：Lv1 原始 N 100%，隨等級逐步解鎖高稀有度，Lv100 UR 達 10%；升級所需抽數＝目前等級×2，升級完全免費不耗任何資源 */




/* ════════════════════════════════════════════
   vGacha 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 4 個單位：plvNeed, gachaRates, plvBoxHtml, vGacha
   ════════════════════════════════════════════ */
const plvNeed=lv=>lv*2; /* 升級所需抽數：卡池等級×2（Lv1→2 需 2 抽、Lv50→51 需 100 抽） */

function gachaRates(g){const lv=Math.min(100,(g.gacha&&g.gacha.plv)||1),t=(lv-1)/99;

const UR=+(0.10*t).toFixed(4),SSR=+(0.15*t).toFixed(4),SR=+(0.25*t).toFixed(4),R=+(0.30*t).toFixed(4);

return{UR,SSR,SR,R,N:+(1-UR-SSR-SR-R).toFixed(4)}}

function plvBoxHtml(g){const gc=g.gacha,lv=Math.min(100,gc.plv||1),xp=gc.pxp||0,need=plvNeed(lv),rt=gachaRates(g),pct=v=>+(v*100).toFixed(1)+'%';

return '<b style="color:var(--gold2)">🃏 卡池等級 Lv.'+lv+' / 100</b> <span style="font-size:11.5px;color:var(--mut)">升級需抽數＝等級×2・免費升級不耗任何資源</span>'+

'<div class="bar" style="margin:6px 0"><i style="width:'+(lv>=100?100:Math.min(100,xp/need*100))+'%"></i></div>'+

'<div style="font-size:12px;color:var(--mut)">'+(lv>=100?'🎉 已滿級！UR 機率 10%':'升級進度 '+xp+'/'+need+' 抽')+'｜目前機率：N '+pct(rt.N)+'｜R '+pct(rt.R)+'｜SR '+pct(rt.SR)+'｜SSR '+pct(rt.SSR)+'｜UR '+pct(rt.UR)+'</div>'}

/* ════════════════════════════════════════════
   vGacha 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGacha
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGacha 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGacha
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGacha 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGacha
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGacha 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGacha
   ════════════════════════════════════════════ */
async function vGacha(){
  if(!await needJs(['js/views/vGacha.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vGacha();
}






function doPull(g,pool,randomValue){

const gc=g.gacha;gc.total++;gc.sinceSR++;gc.sinceSSR++;gc.sinceUR++;updMission(g,'gacha',1);

gc.plv=gc.plv||1;gc.pxp=(gc.pxp||0)+1;while(gc.plv<100&&gc.pxp>=plvNeed(gc.plv)){gc.pxp-=plvNeed(gc.plv);gc.plv++} /* 卡池等級：每抽+1進度，升級需抽數＝等級×2，不耗資源 */

const e=effOf(g),red=e.pity_reduce||0;

let rar=null;

if(gc.sinceUR>=100-red)rar='UR';else if(gc.sinceSSR>=50-red)rar='SSR';else if(gc.sinceSR>=10-red)rar='SR';

if(!rar){const bSSR=gc.sinceSSR>=40?(gc.sinceSSR-40)*.03:0,bUR=gc.sinceUR>=80?(gc.sinceUR-80)*.02:0;

const base=gachaRates(g); /* 機率由卡池等級決定：Lv1 N100% → Lv100 UR10% */

const rates={UR:base.UR+bUR,SSR:base.SSR+bSSR,SR:base.SR,R:base.R,N:base.N};

let roll=typeof randomValue==='number'?randomValue:Math.random(),c=0;rar='N';

for(const k of ['UR','SSR','SR','R','N']){c+=rates[k];if(roll<c){rar=k;break}}}

const src=pool==='all'?Object.assign({},CHARS,PETS,ANIME,TEAMMATES):(POOLS[pool]||CHARS);

const names=Object.keys(src).filter(n=>src[n].r===rar);

const name=names.length?pick(names):pick(Object.keys(src));

const cat=CHARS[name]?'character':PETS[name]?'pet':ANIME[name]?'anime':'teammate';

if(['SR','SSR','UR'].includes(rar))gc.sinceSR=0;

if(['SSR','UR'].includes(rar))gc.sinceSSR=0;

if(rar==='UR')gc.sinceUR=0;

const isNew=!g.owned[cat].includes(name);

if(isNew)g.owned[cat].push(name);

return{n:name,r:rar,cat,icon:src[name].icon,isNew,sk:src[name].sk};

}

async function pullCustom(){
  const raw=String($('#pullN')&&$('#pullN').value||'').trim();
  const n=Number(raw);
  if(!Number.isSafeInteger(n)||n<10)return toast('⚠️ 自訂連抽請輸入 10 以上的整數','bad');
  return pull(n);
}
async function pull(n){
const u=me(),g=u.g,pool=document.querySelector('input[name=pool]:checked').value;
if(!Number.isSafeInteger(n)||n<1)return toast('⚠️ 抽取數量無效','bad');
const cost=n===1?30:n*27;
if(!Number.isSafeInteger(cost)||g.crystal<cost)return toast('💠 水晶不足或抽取數量過大（需 '+cost+'）','bad');
g.crystal-=cost;const res=[];let sr=false;
const randomUrl=new URL('/random',location.origin);randomUrl.port='8091';
for(let base=0;base<n;base+=200000){
  const take=Math.min(200000,n-base);let randoms=null;
  try{const rr=await fetch(randomUrl+'?n='+take);if(rr.ok)randoms=await rr.json()}catch(e){}
  for(let j=0;j<take;j++){const r=doPull(g,pool,randoms&&randoms[j]);res.push(r);if(['SR','SSR','UR'].includes(r.r))sr=true;if((j&511)===0)await new Promise(requestAnimationFrame)}
}
saveU(u);hud();

const pb=document.getElementById('plvBox');if(pb)pb.innerHTML=plvBoxHtml(g); /* 即時更新卡池等級面板 */

const hi=res.filter(r=>['SSR','UR'].includes(r.r)).length;

if(hi){const fl=document.createElement('div');fl.className='gachaFlash';document.body.appendChild(fl);setTimeout(()=>fl.remove(),1000)}

$('#gRes').innerHTML=(hi?'<div style="text-align:center;font-family:var(--serif);font-weight:900;color:var(--gold2);font-size:17px;margin:12px 0">✨ 金光閃爍！高稀有度降臨！</div>':'')+

(n>=10?(()=>{const cnt={};res.forEach(r=>cnt[r.r]=(cnt[r.r]||0)+1);return '<div class="rwRow" style="margin-top:10px">'+['UR','SSR','SR','R','N'].filter(k=>cnt[k]).map(k=>'<span class="rwChip" style="color:'+CFG.RAR_C[k]+'">'+k+' ×'+cnt[k]+'</span>').join('')+'</div>'})():'')+

(()=>{let showRes=res,note='';

if(res.length>60){const hiC=res.filter(r=>['SR','SSR','UR'].includes(r.r));showRes=hiC.length>=60?hiC.slice(0,60):hiC.concat(res.filter(r=>!['SR','SSR','UR'].includes(r.r)).slice(0,60-hiC.length));note='<p style="text-align:center;font-size:12px;color:var(--mut);margin-top:6px">共 '+res.length+' 抽，僅展示 '+showRes.length+' 張（優先高稀有度），全部已入圖鑑</p>'}

return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin-top:12px">'+showRes.map((r,i)=>'<div class="panel2'+(r.r==='UR'?' urCard':r.r==='SSR'?' ssrCard':'')+'" style="border-color:'+CFG.RAR_C[r.r]+';text-align:center;animation:pop .4s both;animation-delay:'+(Math.min(i,30)*.07)+'s">'+

'<div style="display:flex;justify-content:center;margin-bottom:6px">'+collImg(r.n,r.cat,r.icon,64)+'</div><b class="rar'+r.r+'" style="font-size:13px">'+CFG.RAR_S[r.r]+' '+r.n+'</b> '+

(r.isNew?'<span style="background:#e5484d;color:#fff;font-size:10px;padding:2px 6px;border-radius:99px;font-weight:900">NEW</span>':'')+'<div class="skTxt">'+r.sk[0][0]+'：'+r.sk[0][1]+'</div></div>').join('')+'</div>'+note})();
if(res.some(r=>r.r==='UR')){for(let i=0;i<20;i++){const p=document.createElement('span');p.style.cssText='position:fixed;font-size:'+(16+Math.random()*12)+'px;pointer-events:none;z-index:200;left:'+(Math.random()*100)+'vw;top:-30px;animation:goldRain '+(1.5+Math.random()*2)+'s ease-in forwards;animation-delay:'+(Math.random()*0.8)+'s';p.textContent=['✨','🌟','⭐','💎','👑'][Math.floor(Math.random()*5)];document.body.appendChild(p);setTimeout(()=>p.remove(),4000);}const banner=document.createElement('div');banner.style.cssText='position:fixed;top:20vh;left:50%;z-index:200;font-size:32px;font-family:var(--serif);color:var(--gold);text-shadow:0 0 20px rgba(245,158,11,.8);animation:hiBanner 1.4s ease-out forwards;pointer-events:none';banner.textContent='★★★★★ UR 降臨！★★★★★';document.body.appendChild(banner);setTimeout(()=>banner.remove(),2500);}

else if(res.some(r=>r.r==='SSR')){for(let i=0;i<12;i++){const p=document.createElement('span');p.style.cssText='position:fixed;font-size:'+(14+Math.random()*10)+'px;pointer-events:none;z-index:200;left:'+(Math.random()*100)+'vw;top:-30px;animation:goldRain '+(1.2+Math.random()*1.6)+'s ease-in forwards;animation-delay:'+(Math.random()*0.6)+'s';p.textContent=['✨','🌟','⭐','💫'][Math.floor(Math.random()*4)];document.body.appendChild(p);setTimeout(()=>p.remove(),3500);}const banner=document.createElement('div');banner.style.cssText='position:fixed;top:22vh;left:50%;z-index:200;font-size:26px;font-family:var(--serif);color:#c084fc;text-shadow:0 0 18px rgba(168,85,247,.85);animation:hiBanner 1.3s ease-out forwards;pointer-events:none';banner.textContent='✨ ★★★★ SSR 登場！✨';document.body.appendChild(banner);setTimeout(()=>banner.remove(),2200);}

}

/* ════════════════════════════════════════════════

#2【新增】PK 無限競技塔

關卡無限、難度遞增、可一直打、有排名（最高層數）與里程碑獎勵

════════════════════════════════════════════════ */



function pkWinrate(g,pw){const r=power(g)*(1+(effOf(g).pk_power_bonus||0))/Math.max(1,pw);

return r>=1.35?95:r>=1.15?80:r>=1?65:r>=.85?45:r>=.7?30:15}

/* ⚡ 周末決鬥：週六/日限定，匹配對手，比誰先把 5 題全部答對（比总用時）*/



/* ════════════════════════════════════════════
   vSpeedMatch 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 5 個單位：rnd, isWeekend, speedOppTime, vSpeedMatch, Q_SPD
   ════════════════════════════════════════════ */
const rnd=(a,b)=>a+Math.random()*(b-a);



/* ════════════════════════════════════════════
   vSpeedMatch 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：isWeekend, speedOppTime, vSpeedMatch
   ════════════════════════════════════════════ */


/* ════════════════════════════════════════════
   vSpeedMatch 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：isWeekend, speedOppTime, vSpeedMatch
   ════════════════════════════════════════════ */


/* ════════════════════════════════════════════
   vSpeedMatch 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：isWeekend, speedOppTime, vSpeedMatch
   ════════════════════════════════════════════ */


/* ════════════════════════════════════════════
   vSpeedMatch 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：isWeekend, speedOppTime, vSpeedMatch
   ════════════════════════════════════════════ */


async function vSpeedMatch(){
  if(!await needJs(['js/views/vSpeedMatch.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vSpeedMatch();
}





let Q_SPD=null;



function nextSpeedQ(){

if(!Q_SPD)return;

if(Q_SPD.i>=Q_SPD.n)return finishSpeed();

const q=(Q_SPD.subj==='數學'&&typeof procMathQ==='function'&&Math.random()<.6)?procMathQ('簡單'):bankQ(Q_SPD.subj,'速答',30);

Q_SPD.cur=q;

const box=$('#spdBox');if(!box)return;

box.innerHTML='<div style="font-size:12px;color:var(--mut);margin-bottom:6px">第 '+(Q_SPD.i+1)+'/'+Q_SPD.n+' 題｜已答對 '+Q_SPD.correct+'</div>'+

'<div class="qStem" style="font-size:16px">'+esc(q['題目'])+'</div>'+

q['選項'].map((o,i)=>'<button class="optBtn" onclick="answerSpeed('+i+')">'+String.fromCharCode(65+i)+'. '+esc(o)+'</button>').join('');

}

function answerSpeed(sel){

if(!Q_SPD||!Q_SPD.cur)return;

const ok=sel===Q_SPD.cur['答案'];

if(ok)Q_SPD.correct++;else Q_SPD.t0-=4000; /* 答錯：總用時 +4 秒惩罰 */

Q_SPD.i++;nextSpeedQ();

}

function finishSpeed(){

const u=me(),g=u.g;

const myT=+((Date.now()-Q_SPD.t0)/1000).toFixed(1);

const oppT=Q_SPD.opp.ot;

const allCorrect=Q_SPD.correct>=Q_SPD.n;

const win=allCorrect&&myT<=oppT; /* 全對且比對手快才算贏 */

let rwTxt='';

if(win){const cr=40,au=120,hon=15;g.crystal+=cr;g.gold+=au;g.honor+=hon;rwTxt='🎉 勝利！💠+'+cr+' 🪙+'+au+' 🏅+'+hon;saveU(u);hud()}

else rwTxt=allCorrect?'可惜！對手更快一步，下次再拚！':'未全部答對，多加練習吧！';

openModal('<h3 class="mt">⚡ 決鬥結果</h3>'+

'<div class="resBig" style="color:'+(win?'var(--green)':'var(--red)')+'">'+(win?'🏆 你贏了！':'😤 惜敗')+'</div>'+

'<div class="panel2" style="margin-bottom:12px;text-align:center">你：答對 '+Q_SPD.correct+'/'+Q_SPD.n+'，用時 <b style="color:var(--gold2)">'+myT+'s</b><br>'+esc(Q_SPD.opp.name)+'：用時 <b style="color:var(--gold2)">'+oppT+'s</b></div>'+

'<p style="text-align:center;color:var(--teal)">'+rwTxt+'</p>'+

'<div class="mBtns"><button class="btn ghost" onclick="closeModal()">關閉</button><button class="btn" onclick="vSpeedMatch()">⚡ 再來一場</button></div>');

Q_SPD=null;

}

/* ════════════════════════════════════════════
   vPK 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 4 個單位：arenaOpp, arenaDiff, vPK, animPk
   ════════════════════════════════════════════ */
function arenaOpp(floor){

const names=['見習挑戰者','進階學習者','中等高手','觀念大師','陷阱獵人','資優學霸','魔王候補','地獄難題者','傳說級學神','全領域之王','虛空主宰','永恆戰神'];

const icons=['🐣','📖','🦊','🦉','🐺','🦁','👹','🔥','👑','⚡','🌌','♾️'];

const tier=Math.min(names.length-1,Math.floor((floor-1)/5));

const pw=Math.floor(40+floor*32+Math.pow(floor,1.3)*8);

return{n:names[tier]+'・第'+floor+'層',i:icons[tier],lv:Math.min(99,floor*2),pw,floor};

}

function arenaDiff(floor){return Math.min(100,5+floor);} /* 難度隨層數提升 */

/* ════════════════════════════════════════════
   vPK 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPK
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vPK 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPK
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vPK 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPK
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vPK 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPK
   ════════════════════════════════════════════ */
async function vPK(){
  if(!await needJs(['js/views/vSpeedMatch.js', 'js/views/vPK.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vPK();
}





function animPk(id,cls){const el=document.getElementById(id);if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}


function startPk(replayFloor){

const u=me(),g=u.g;

if(!canPk(g))return toast('⚠️ 今日 PK 次數已用完（可用兌換所補次數）','bad');

const floorNo=replayFloor||g.arena.floor;

const replay=!!replayFloor&&replayFloor<g.arena.floor;

const opp=arenaOpp(floorNo);

const pp=Math.floor(power(g)*(1+(effOf(g).pk_power_bonus||0)));

let pHp=100+Math.floor(pp/20),oHp=100+Math.floor(opp.pw/20);

const pMax=pHp,oMax=oHp;

const e=effOf(g);

let guaranteed=false;

if((e.pk_guaranteed_win||0)>0&&g.pk.gwUsed<e.pk_guaranteed_win){g.pk.gwUsed++;guaranteed=true}

openModal('<h3 class="mt">⚔️ 競技塔 第 '+floorNo+' 層'+(replay?'（🕰️ 歷史關卡重打）':'')+'</h3>'+

'<div class="pkArena">'+

'<div class="pkSide me"><div class="pkName" style="color:var(--teal)">🧑 '+esc(u.name)+'</div><div class="pkIco" id="pkMe">🧑‍🎓</div>'+

'<div style="font-size:11px;color:var(--mut)">HP</div><div class="bar hpb"><i id="pkMeHp" style="width:100%"></i></div>'+

'<div style="font-size:11px;margin-top:4px" id="pkMeHpT">'+pHp+'/'+pMax+'</div></div>'+

'<div class="pkSide foe pkSlideR"><div class="pkName" style="color:#ff9d97">'+opp.i+' '+opp.n+'</div><div class="pkIco" id="pkFoe">'+opp.i+'</div>'+

'<div style="font-size:11px;color:var(--mut)">HP</div><div class="bar hpb"><i id="pkFoeHp" style="width:100%"></i></div>'+

'<div style="font-size:11px;margin-top:4px" id="pkFoeHpT">'+oHp+'/'+oMax+'</div></div>'+

'</div>'+

'<div class="pkLog" id="pkLog">📢 戰鬥開始！難度 '+arenaDiff(floorNo)+'/100</div>'+

'<div class="mBtns"><button class="btn" onclick="pkTurn()">⚔️ 攻擊</button></div>');

window._pk={opp,pp,pHp,oHp,pMax,oMax,guaranteed,round:1,done:false,log:[],replay,floorNo};

}

function showFloorPicker(){

const g=me().g;const maxF=g.arena.floor-1;

if(maxF<1)return toast('⚠️ 尚無已通關的歷史關卡，先去挑戰競技塔吧！','bad');

const start=Math.max(1,maxF-19);let btns='';

for(let f=maxF;f>=start;f--)btns+='<button class="btn ghost mini" style="min-width:74px" onclick="closeModal();startPk('+f+')">第 '+f+' 層</button>';

openModal('<h3 class="mt">🕰️ 歷史關卡重打</h3><p class="msub">可自由選擇重複挑戰已通關關卡（1 ~ '+maxF+' 層），完整播放戰鬥與通關特效動畫；獎勵減半、不影響目前層數</p>'+

'<div style="display:flex;gap:8px;margin-bottom:10px"><input id="fpNo" type="number" min="1" max="'+maxF+'" placeholder="輸入層數 1~'+maxF+'"><button class="btn mini" onclick="goFloor()">前往挑戰</button></div>'+

'<div style="display:flex;flex-wrap:wrap;gap:8px">'+btns+'</div>'+

'<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button></div>');

}

function goFloor(){

const g=me().g;const maxF=g.arena.floor-1;const f=parseInt($('#fpNo').value);

if(!f||f<1||f>maxF)return toast('⚠️ 請輸�� 1~'+maxF+' ��層數','bad');

closeModal();startPk(f);

}

function showPkBatch(){
  const u=me(),g=u.g;
  canPk(g);
  const remain=Math.max(0,sysCfg().pkDaily+(g.pkExtra||0)-g.pk.today);
  openModal('<h3 class="mt">⚔️ 選擇挑戰次數</h3>'+
    '<div style="text-align:center;font-size:14px;color:var(--mut);margin:10px 0">當前層數：第 '+g.arena.floor+' 層｜今日剩餘 '+remain+' 場</div>'+
    '<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:15px 0">'+
    [1,5,10,50,100].map(n=>'<button class="btn'+(n===1?' teal':'')+'" style="min-width:80px;padding:12px" onclick="closeModal();startPkBatch('+n+')">'+n+' 次</button>').join('')+
    '</div>'+
    '<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button></div>');
}

async function startPkBatch(count){
  const u=me(),g=u.g;
  let wins=0,losses=0,totalXp=0,totalCr=0,totalAu=0,totalHon=0,totalDia=0,played=0;
  let floor=g.arena.floor;
  openModal('<h3 class="mt">⚔️ 批量挑戰中...</h3><div id="pkBatchProg" style="text-align:center;font-size:16px;margin:20px 0;color:var(--gold)">第 0/'+count+' 場</div><div class="bar" style="margin:10px 20px"><i id="pkBatchBar" style="width:0%"></i></div>');
  for(let i=0;i<count;i++){
    if(!canPk(g)){toast('⚠️ 今日 PK 次數已用完，實際挑戰 '+played+' 場','bad');break}
    const opp=arenaOpp(floor);
    const pp=Math.floor(power(g)*(1+(effOf(g).pk_power_bonus||0)));
    let pHp=100+Math.floor(pp/20),oHp=100+Math.floor(opp.pw/20);
    let win=false;
    const e=effOf(g);
    let guaranteed=false;
    if((e.pk_guaranteed_win||0)>0&&g.pk.gwUsed<e.pk_guaranteed_win){g.pk.gwUsed++;guaranteed=true}
    let round=1;
    while(pHp>0&&oHp>0&&round<=50){
      const crit=Math.random()<.2;
      let dmg=Math.floor(pp/8*rnd(.85,1.15))*(crit?1.8:1);
      oHp=Math.max(0,oHp-dmg);
      if(oHp<=0){win=true;break}
      const oCrit=Math.random()<.12;
      let oDmg=Math.floor(opp.pw/8*rnd(.85,1.15))*(oCrit?1.7:1);
      if(guaranteed&&round===1)oDmg=0;
      pHp=Math.max(0,pHp-oDmg);
      if(pHp<=0){win=false;break}
      round++;
    }
    g.pk.today++;played++;
    if(win){
      wins++;g.pk.win++;g.pk.streak++;
      if(g.pk.streak>g.pk.maxStreak)g.pk.maxStreak=g.pk.streak;
      const cr=12+floor*2,au=25+floor*3,xp=40+floor*4,hon=10;
      let dia=0;
      if(!g.pk.firstWin){g.pk.firstWin=true;dia=1}
      floor++;
      if(floor>g.arena.best)g.arena.best=floor;
      if((floor-1)%5===0)dia+=3;
      totalCr+=cr;totalAu+=au;totalXp+=xp;totalHon+=hon;totalDia+=dia;
    }else{
      losses++;g.pk.lose++;g.pk.streak=0;
    }
    const prog=document.getElementById('pkBatchProg');if(prog)prog.textContent='第 '+(i+1)+'/'+count+' 場';
    const bar=document.getElementById('pkBatchBar');if(bar)bar.style.width=((i+1)/count*100)+'%';
    if(count>1&&i<count-1)await new Promise(r=>setTimeout(r,200));
  }
  g.arena.floor=floor;
  g.crystal+=totalCr;g.gold+=totalAu;g.xp+=totalXp;g.honor+=totalHon;g.diamond+=totalDia;
  while(g.xp>=g.needXp&&g.lv<effMaxLv()){g.xp-=g.needXp;g.lv++;g.needXp=CFG.needXp(g.lv)}
  checkTitlesAch(g);saveU(u);hud();
  openModal('<h3 class="mt">⚔️ 批量挑戰結果</h3>'+
    '<div style="text-align:center;font-size:40px;margin:10px 0">'+(wins>losses?'🏆':'😢')+'</div>'+
    '<div style="text-align:center;font-size:16px;margin:10px 0">挑戰 '+played+' 次｜<span style="color:var(--green)">勝 '+wins+'</span> / <span style="color:#ff7b72">敗 '+losses+'</span></div>'+
    '<div class="rwRow"><span class="rwChip">✨ +'+totalXp+' XP</span><span class="rwChip">💠 +'+totalCr+'</span><span class="rwChip">🪙 +'+totalAu+'</span><span class="rwChip">🏅 +'+totalHon+'</span>'+(totalDia?'<span class="rwChip">💎 +'+totalDia+'</span>':'')+'</div>'+
    '<div style="text-align:center;font-size:13px;color:var(--mut);margin:10px 0">當前層數：第 '+g.arena.floor+' 層｜歷史最佳：第 '+g.arena.best+' 層</div>'+
    '<div class="mBtns"><button class="btn" onclick="closeModal();vPK()">返回</button></div>');
}

function pkTurn(){

const s=window._pk;if(!s||s.done)return;

if(s.round>50){s.done=true;finishPk(false);return} /* 防止無限迴圈：50回合上限 */

const skill=pick(['聖光斬','雷霆一擊','烈焰衝擊','寒冰箭','暗影突襲','旋風斬','神聖審判','破甲重擊']);

const crit=Math.random()<.2;

let dmg=Math.floor(s.pp/8*rnd(.85,1.15))*(crit?1.8:1);

s.oHp=Math.max(0,s.oHp-dmg);

s.log.push((crit?'<span class="crit">💥 爆擊！</span>':'')+' 🧑 '+esc(me().name)+' 使用 【'+skill+'】，造成 <span class="dmg">'+dmg+'</span> 點傷害！');

animPk('pkFoe','hit');animPk('pkMe','atk');
const skillEmojis=['💥','⚡','🔥','💫','✨','🌟'];
const se=skillEmojis[Math.floor(Math.random()*skillEmojis.length)];
const skillEl=document.createElement('span');
skillEl.className='pkSkillFx';
skillEl.textContent=se;
skillEl.style.left='50%';skillEl.style.top='40%';
const pkBody=document.querySelector('.pkArena')||document.querySelector('#mbody');
if(pkBody){pkBody.style.position='relative';pkBody.appendChild(skillEl);setTimeout(()=>skillEl.remove(),600);}

if(crit)floatTxt('💥'+dmg,'crit',$('#pkFoe'));

if(s.oHp<=0){finishPk(true);return}

setTimeout(()=>{

const oSkill=pick(['暗影爪','致命一擊','狂暴衝撞','魔法彈','連環斬']);const oCrit=Math.random()<.12;

let oDmg=Math.floor(s.opp.pw/8*rnd(.85,1.15))*(oCrit?1.7:1);

if(s.guaranteed&&s.round===1)oDmg=0;

s.pHp=Math.max(0,s.pHp-oDmg);

s.log.push((oCrit?'<span class="crit">💥 爆擊！</span>':'')+' '+s.opp.i+' '+s.opp.n+' 使用 【'+oSkill+'】，造成 <span class="dmg">'+oDmg+'</span> 點傷害！');

animPk('pkMe','hit');animPk('pkFoe','atk');

if(s.pHp<=0){finishPk(false);return}

s.round++;drawPk();

},450);

drawPk();

}


function drawPk(){

const s=window._pk;if(!s)return;

const set=(id,v)=>{const el=document.getElementById(id);if(el)el.style.width=v+'%'};

set('pkMeHp',s.pHp/s.pMax*100);set('pkFoeHp',s.oHp/s.oMax*100);
const pHpPct=s.pHp/s.pMax;const oHpPct=s.oHp/s.oMax;
const hpCol=p=>p>0.6?'var(--green)':p>0.3?'var(--gold)':'var(--red)';
const meHpBar=document.getElementById('pkMeHp');if(meHpBar)meHpBar.style.background=hpCol(pHpPct);
const foeHpBar=document.getElementById('pkFoeHp');if(foeHpBar)foeHpBar.style.background=hpCol(oHpPct);

const mt=document.getElementById('pkMeHpT');if(mt)mt.textContent=s.pHp+'/'+s.pMax;

const ft=document.getElementById('pkFoeHpT');if(ft)ft.textContent=s.oHp+'/'+s.oMax;

const lg=document.getElementById('pkLog');if(lg){lg.innerHTML=s.log.slice(-8).join('<br>');lg.scrollTop=lg.scrollHeight}

}

function finishPk(win){

const s=window._pk;s.done=true;

const u=me(),g=u.g;g.pk.today++;updMission(g,'pk',1);

let xp=0,cr=0,au=0,hon=0,dia=0,msg='';

if(win){

g.pk.win++;g.pk.streak++;if(g.pk.streak>g.pk.maxStreak)g.pk.maxStreak=g.pk.streak;

updMission(g,'pkWin',1);

const fl=s.floorNo||g.arena.floor;

cr=12+fl*2;au=25+fl*3;xp=40+fl*4;hon=10;

if(s.replay){cr=Math.max(1,Math.floor(cr/2));au=Math.max(1,Math.floor(au/2));xp=Math.max(1,Math.floor(xp/2));hon=5}

const streakB={3:5,5:12,8:25,10:50};for(const t in streakB)if(g.pk.streak==t)cr+=streakB[t];

if(!g.pk.firstWin){g.pk.firstWin=true;dia+=1}

/* 晉升＋里程碑（歷史關卡重打不影響層數） */

if(!s.replay){

g.arena.floor++;

if(g.arena.floor>g.arena.best)g.arena.best=g.arena.floor;

if((g.arena.floor-1)%5===0){dia+=3;msg='｜🏆 里程碑 第'+(g.arena.floor-1)+'層 +3💎'}

}

g.crystal+=cr;g.gold+=au;g.xp+=xp;g.honor+=hon;g.diamond+=dia;

((()=>{const _ol=g.lv;while(g.xp>=g.needXp&&g.lv<effMaxLv()){g.xp-=g.needXp;g.lv++;g.needXp=CFG.needXp(g.lv)}if(g.lv>_ol)showLevelUpFX(g.lv)})())

}else{g.pk.lose++;g.pk.streak=0}

checkTitlesAch(g);saveU(u);hud();

drawPk();

const mp=document.querySelector('.mpanel');if(mp&&win)mp.classList.add('flashWin');
if(win){for(let i=0;i<8;i++){const sp=document.createElement('span');sp.style.cssText='position:fixed;font-size:20px;pointer-events:none;z-index:200;left:'+(20+Math.random()*60)+'vw;top:30vh;animation:goldRain '+(1+Math.random()*2)+'s ease-in forwards;animation-delay:'+(i*0.1)+'s';sp.textContent=['✨','🌟','⭐','💫'][i%4];document.body.appendChild(sp);setTimeout(()=>sp.remove(),3500);}}

const _pkLog=document.getElementById('pkLog');if(_pkLog)_pkLog.innerHTML+=(win?'<br><span class="crit">'+(s.replay?'🏆 勝利！🕰️ 歷史關卡 第 '+s.floorNo+' 層 重打成功！':'🏆 勝利！晉升第 '+g.arena.floor+' 層')+msg+'</span>':'<br><span class="dmg">'+(s.replay?'💀 戰敗... 第 '+s.floorNo+' 層，可再挑戰':'💀 戰敗... '+g.arena.floor+' 層，可再挑戰')+'</span>');

setTimeout(()=>{

openModal('<h3 class="mt">'+(s.replay?(win?'🏆 歷史關卡 第 '+s.floorNo+' 層 重打成功！':'💀 歷史關卡 第 '+s.floorNo+' 層 挑戰失敗'):(win?'🏆 勝利！晉升第 '+g.arena.floor+' 層':'💀 戰敗・停留第 '+g.arena.floor+' 層'))+'</h3>'+

'<div style="text-align:center;font-size:60px;margin:10px 0">'+(win?'🏆':'😢')+'</div>'+

'<p style="text-align:center;font-size:14px;color:var(--mut)">'+(win?'你擊敗了 '+s.opp.i+' '+s.opp.n+'！':'敗給 '+s.opp.i+' '+s.opp.n+'，提升戰力再來挑戰！')+'</p>'+

(win?'<div class="rwRow"><span class="rwChip">✨ +'+xp+' XP</span><span class="rwChip">💠 +'+cr+'</span><span class="rwChip">🪙 +'+au+'</span><span class="rwChip">🏅 +'+hon+'</span>'+(dia?'<span class="rwChip">💎 +'+dia+'</span>':'')+'</div>':'')+

'<div class="mBtns"><button class="btn ghost" onclick="closeModal();vPK()">返回</button>'+

(s.replay?'<button class="btn" onclick="closeModal();startPk('+s.floorNo+')">🔄 再打一次 第 '+s.floorNo+' 層</button>':

(win?'<button class="btn" onclick="closeModal();startPk()">➡️ 繼續挑戰下一層</button>':'<button class="btn" onclick="closeModal();startPk()">🔄 再挑戰本層</button>'))+'</div>');

},600);

}

/* 競技塔每日排名獎勵：依歷史最佳層數排名，前 3 名每日可領 1 次 */

function arenaRankOf(uid){

const us=get(LS.users,[]).filter(x=>x.role==='student'&&x.g);

const arr=us.map(x=>({id:x.id,best:x.g.arena.best||1,win:x.g.pk.win})).sort((a,b)=>b.best-a.best||b.win-a.win);

const i=arr.findIndex(x=>x.id===uid);return i<0?99:i+1;

}

const ARENA_RW={1:{honor:20,diamond:5,gold:150},2:{honor:12,diamond:3,gold:100},3:{honor:8,diamond:2,gold:60}};

function claimArenaRank(){

const u=me(),g=u.g;

if(g.arenaClaim===today())return toast('⚠️ 今日已領過競技塔排名獎勵','bad');

const r=arenaRankOf(u.id);

if(r>3)return toast('⚠️ 未進入前 3 名，繼續加油！','bad');

g.arenaClaim=today();grantRw(g,ARENA_RW[r]);saveU(u);hud();

toast('🎁 競技塔第 '+r+' 名獎勵已領取！');vPK();

}

/* ════════════════════════════════════════════
   vPkRank 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPkRank
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vPkRank 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPkRank
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vPkRank 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPkRank
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vPkRank 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPkRank
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vPkRank 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPkRank
   ════════════════════════════════════════════ */
async function vPkRank(){
  if(!await needJs(['js/views/vPkRank.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vPkRank();
}






/* 🏫 班級總題數 PK：全班累計作答總題數對抗 */
/* ════════════════════════════════════════════
   vClassPK 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vClassPK
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vClassPK 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vClassPK
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vClassPK 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vClassPK
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vClassPK 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vClassPK
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vClassPK 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vClassPK
   ════════════════════════════════════════════ */
async function vClassPK(){
  if(!await needJs(['js/views/vClassPK.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vClassPK();
}






function spectate(){const a=arenaOpp(1+((Math.random()*10)|0)),b=arenaOpp(1+((Math.random()*10)|0));

const w=a.pw*rnd(.85,1.15)>b.pw*rnd(.85,1.15)?a:b;

toast('👀 '+a.i+a.n+' vs '+b.i+b.n+' → 🏆 '+w.n+' 獲勝！')}

function powerDetail(){const g=me().g;

let wp=0;g.weapons.forEach(w=>{wp+=(CFG.QBASE[w.q]||5)+(w.lv||0)*8});

const e=effOf(g);let s=0;for(const k in e){const v=e[k];if(typeof v==='number'&&v>0)s+=v}

openModal('<h3 class="mt">⚡ 戰力明細</h3><div style="font-size:13.5px;line-height:2">'+

'等級：'+(g.lv*10)+'<br>武器：'+wp+'<br>角色加成：'+Math.floor(s*50)+'<br>升星：'+Object.values(g.stars).reduce((a,b)=>a+b*15,0)+

'<br><b style="color:var(--gold2)">總戰力：'+power(g)+'</b></div><div class="mBtns"><button class="btn" onclick="closeModal()">確定</button></div>')}

function usePotion(){const u=me(),g=u.g;

if(g.gold<200)return toast('🪙 金幣不足','bad');

g.gold-=200;g.potion={at:new Date().toISOString(),bonus:200};

saveU(u);hud();toast('🧪 戰力 +200（10 分鐘）');vPK()}

function canPk(g){const d=today();if(g.pk.date!==d){g.pk.date=d;g.pk.today=0;g.pk.gwUsed=0;g.pk.firstWin=false}return g.pk.today<sysCfg().pkDaily+(g.pkExtra||0)}

/* ════════════════════════════════════════════════

#3【修復＋擴充】領土征服：每科 500 關（共2500關）、可點擊進入

════════════════════════════════════════════════ */

const TERR_MAP={};

(function(){

const icons={'數學':'📐','英文':'🔤','國文':'📖','自然':'🔬','社會':'🌏'};

const colors={'數學':'#ff5252','英文':'#00e5ff','國文':'#448aff','自然':'#69f0ae','社會':'#ffab40'};

for(const s in icons){

const t=[];

for(let i=1;i<=500;i++){

const boss=i%10===0;

t.push({n:(boss?'👑':'')+s+'秘境·'+i,d:Math.min(100,5+Math.floor(i*0.95)),boss});

}

TERR_MAP[s]={i:icons[s],c:colors[s],t};

}

})();

function terrIdx(g,subj){ /* 該科目已征服數 */

return TERR_MAP[subj].t.filter(t=>g.territory.owned[subj+'|'+t.n]).length;

}

/* ════════════════════════════════════════════
   vTerr 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTerr
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vTerr 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTerr
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vTerr 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTerr
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vTerr 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTerr
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vTerr 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTerr
   ════════════════════════════════════════════ */
async function vTerr(){
  if(!await needJs(['js/views/vTerr.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vTerr();
}






function terrTarget(g){

const d=today();

if(g.territory.targetDate!==d){

const un=[];

for(const s in TERR_MAP){const cnt=terrIdx(g,s);if(cnt<100)un.push({subj:s,...TERR_MAP[s].t[cnt]});}

g.territory.target=un.length?pick(un):null;

g.territory.targetDate=d;

}

return g.territory.target;

}

function terrBattle(subj,idx){

const u=me(),g=u.g;

const t=TERR_MAP[subj].t[idx];

qReset();Quiz.mode='terr';Quiz.terrName=subj+'|'+t.n;Quiz.subj=subj;Quiz.diff=t.d;

const sems=Object.keys(SUBJ[subj].u);Quiz.sem=pick(sems);const _pu=pick(SUBJ[subj].u[Quiz.sem]);Quiz.unit=Array.isArray(_pu)?_pu[0]:_pu;

Quiz.phase='LOADING';showLoading();

setTimeout(async()=>{ /* 修復題目重複：領土戰改用 AI 出題（同修煉場），AI 失敗才退回本地題庫 */

let q=null;try{q=await aiGenerateQuiz(subj,Quiz.unit,t.d)}catch(e){}

if(!q)q=bankQ(subj,Quiz.unit,t.d);

Quiz.q=q;Quiz.q.id=newQid();Quiz.sel=null;Quiz.t0=Date.now();Quiz.phase='ANSWERING';vQuestion()},400);

}

function captureTerr(g,key,ok){

if(g.territory.owned[key])return{ok:false,msg:'已占领過',rw:null};

if(!ok)return{ok:false,msg:'答錯！領土守衛擋下了進攻',rw:null};

g.territory.owned[key]={t:Date.now()};

const subj=key.split('|')[0];

const tname=key.split('|')[1];

const isBoss=tname.includes('👑');

const count=Object.keys(g.territory.owned).length;

const tt=(TERR_MAP[subj]&&TERR_MAP[subj].t.find(x=>x.n===tname))||{d:1};

const lvl=tt.d||1;

const stageNum=+(String(tname).split('·')[1])||1; /* 關卡序號 1~100：越後面關卡獎勵越多、完全沒有上限 */

const tgt=g.territory.target;

let x2=1;if(tgt&&tgt.subj===subj&&tname===tgt.name)x2=2;

const bossMul=isBoss?3:1; /* 頭目關（每 10 關）額外 3 倍 */

const sc=(1+stageNum*0.14+count*0.02)*x2*bossMul; /* 成長係數＝關卡×0.14＋占領數×0.02，再乘目標加倍與頭目倍率，無上限 */

const R=(base,per)=>Math.max(1,Math.floor((base+stageNum*per)*sc)); /* 各物資：底值＋關卡成長，再乘成長係數 */

const d=Math.max(1,Math.floor((isBoss?8:2)*(1+stageNum*0.06)*x2)); /* 鑽石隨關卡成長 */

const au=Math.floor((30+lvl*4+stageNum*8)*sc); /* 金幣隨關卡成長 */

const mats={ /* 全物資獎勵，皆隨關卡成長且無上限 */

crystal:R(10,0.6),

starlight:R(2,0.12),

ironOre:R(2,0.14),

enhStone:R(2,0.12),

labMat:R(1,0.1),

honor:Math.max(1,Math.floor((1+stageNum*0.08)*sc))

};

g.diamond+=d;g.gold+=au;g.crystal+=mats.crystal;g.starlight+=mats.starlight;g.ironOre+=mats.ironOre;g.enhStone+=mats.enhStone;g.labMat+=mats.labMat;g.honor+=mats.honor;

return{ok:true,msg:'占领成功！'+tname,rw:Object.assign({d,au},mats),total:count};

}

function sweep(){const u=me(),g=u.g;

if(g.territory.sweepDate===today())return toast('🧹 今日已掃蕩過，明天再來！','bad'); /* 修復：掃蕩每日限 1 次，防連點無限領獎 */

const n=Object.keys(g.territory.owned).length,lm=Math.max(1,Math.floor(n/5)); /* 新增：掃蕩附送實驗素材 */

g.territory.sweepDate=today();const _lv=g.territory.levels||{};const _m=1+Object.values(_lv).reduce((a,b)=>a+((b||1)-1),0)*0.2;const _au=Math.floor(n*10*_m),_cr=Math.floor(n*2*_m);g.gold+=_au;g.crystal+=_cr;g.labMat+=lm;saveU(u);hud();window._sweepInfo={m:_m,au:_au,cr:_cr};

toast('🧹 掃蕩完成：🪙+'+_au+' 💠+'+_cr+' 🧪+'+lm);vTerr()}

/* ⭐ 領土升級：單一領地最高 Lv.5，消耗水晶升級，提升全域一鍵掟蓕收益 */

function terrUpgrade(key){

const u=me(),g=u.g;

if(!g.territory.owned[key])return;

g.territory.levels=g.territory.levels||{};

const cur=g.territory.levels[key]||1;

const tname=key.split('|')[1]||key;

if(cur>=5){openModal('<h3 class="mt">⭐ '+esc(tname)+'</h3><p class="msub">已達最高等級 Lv.5！此領地一鍵收益加成 +100%。</p><div class="mBtns"><button class="btn" onclick="closeModal()">關閉</button></div>');return}

const cost=cur*80;

openModal('<h3 class="mt">⭐ 領土升級：'+esc(tname)+'</h3>'+

'<p class="msub">目前 Lv.'+cur+' → Lv.'+(cur+1)+'（最高 Lv.5）。每升 1 級，全域一鍵收益 +20%。</p>'+

'<div class="panel2" style="margin-bottom:12px">升級需要：💠 '+cost+' 水晶（你有 '+g.crystal+'）</div>'+

'<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button><button class="btn" onclick="doTerrUpgrade(\''+key.replace(/'/g,"\\'")+'\')">⭐ 升級（💠'+cost+'）</button></div>');

}

function doTerrUpgrade(key){

const u=me(),g=u.g;g.territory.levels=g.territory.levels||{};

const cur=g.territory.levels[key]||1;if(cur>=5)return;

const cost=cur*80;

if(g.crystal<cost)return toast('⚠️ 水晶不足','bad');

g.crystal-=cost;g.territory.levels[key]=cur+1;saveU(u);hud();closeModal();

toast('⭐ 升級成功！Lv.'+(cur+1));vTerr()}
