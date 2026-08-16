/* ════════════════════════════════════════════
   vSpeedMatch 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：isWeekend, speedOppTime, vSpeedMatch
   ════════════════════════════════════════════ */
function isWeekend(){const d=new Date().getDay();return d===0||d===6}

function speedOppTime(o){ /* 依對手平均作答速度估算完成時間（基於其真實紀錄，加隨機波動）*/

const log=(o&&o.g&&o.g.answerLog)||[];

const avg=log.length?log.reduce((a,b)=>a+(b.sec||6),0)/log.length:7.5;

let t=0;for(let i=0;i<5;i++)t+=Math.max(2,avg*rnd(.7,1.3));return +t.toFixed(1)}

function vSpeedMatch(){

if(!isWeekend())return toast('⚡ 周末決鬥僅週六、週日開放','bad');

const u=me();

const pool=get(LS.users,[]).filter(x=>x.role==='student'&&x.id!==u.id&&x.g);

const opp=pool.length?pick(pool):{name:'神秘挑戰者',g:{answerLog:[],lv:u.g.lv}}; /* 匹配真實學生，沒人時用電腦對手 */

const subj=pick(['數學','英文','國文','自然','社會']);

Q_SPD={opp:{name:opp.name,id:opp.id||'',ot:speedOppTime(opp)},subj,i:0,n:5,correct:0,t0:Date.now(),qs:[]};

openModal('<h3 class="mt">⚡ 周末決鬥：'+esc(subj)+'題速答賽</h3>'+

'<p class="msub">對手：<b>'+esc(opp.name)+'</b>｜規則：連答 5 題，比誰先全部答對（看總用時）！答錯不扣分但會拖慢你。</p>'+

'<div id="spdBox"></div>');

nextSpeedQ();

}
