/* ════════════════════════════════════════════
   vVideoSub 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：showRewardFX, vVideoSub, grantRw
   ════════════════════════════════════════════ */
function showRewardFX(rewards){const icons={gold:'💰',crystal:'💎',diamond:'💠',starlight:'✨',honor:'🏅',quizPts:'📝',enhStone:'⚒️',ironOre:'⛏️',labMat:'🧪'};let delay=0;Object.entries(rewards).forEach(([k,v])=>{if(v&&v>0&&icons[k]){setTimeout(()=>{const el=document.createElement('span');el.style.cssText='position:fixed;font-size:24px;pointer-events:none;z-index:200;left:'+(30+Math.random()*40)+'vw;top:10vh;animation:rewardDrop .8s ease-out forwards';el.textContent=icons[k]+' +'+v;document.body.appendChild(el);setTimeout(()=>el.remove(),1200)},delay);delay+=150}})}

function vVideoSub(s){

const d=SUBJ[s];

$('#view').innerHTML=back('vVideos()')+'<h3 class="vt" style="color:'+d.c+'">'+d.i+' '+s+'影片 <span class="vsub">點選單元直接播放</span></h3>'+

Object.keys(d.u).map(sem=>'<div class="panel2" style="margin-bottom:10px"><b style="color:'+d.c+';font-family:var(--serif)">📖 '+sem+'</b><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">'+

d.u[sem].map(t=>'<button class="btn ghost mini" onclick="openVideoT(\''+s+'\',\''+sem+'\',\''+t.replace(/'/g,"\\'")+'\')">▶ '+t+'</button>').join('')+'</div></div>').join('');

}

function grantRw(g,rw){if(rw.gold)g.gold+=rw.gold;if(rw.crystal)g.crystal+=rw.crystal;if(rw.diamond)g.diamond+=rw.diamond;

if(rw.starlight)g.starlight+=rw.starlight;if(rw.ironOre)g.ironOre+=rw.ironOre;if(rw.enhStone)g.enhStone+=rw.enhStone;

if(rw.labMat)g.labMat+=rw.labMat;if(rw.honor)g.honor+=rw.honor;if(rw.quizPts)g.quizPts+=rw.quizPts;showRewardFX(rw)}
