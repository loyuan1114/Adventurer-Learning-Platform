/* ════════════════════════════════════════════
   vQuestion 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 5 個單位：showLevelUpFX, qMarkSeen, vQuestion, weekKey, getWeekly
   ════════════════════════════════════════════ */
function showLevelUpFX(newLv){const overlay=document.createElement('div');overlay.style.cssText='position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);animation:fadeIn .3s';overlay.innerHTML='<div style="text-align:center;animation:levelUp 1s ease-out"><div style="font-size:48px">🎉</div><div style="font-size:28px;color:var(--gold);font-family:var(--serif);margin:8px 0">LEVEL UP!</div><div style="font-size:20px;color:var(--txt)">Lv.'+newLv+'</div></div>';overlay.onclick=()=>overlay.remove();document.body.appendChild(overlay);for(let i=0;i<12;i++){const p=document.createElement('span');p.style.cssText='position:fixed;font-size:'+(14+Math.random()*10)+'px;pointer-events:none;z-index:201;left:'+(Math.random()*100)+'vw;top:-20px;animation:rewardDrop '+(1+Math.random()*1.5)+'s ease-in forwards;animation-delay:'+(Math.random()*0.5)+'s';p.textContent=['⭐','✨','🌟','💫','🎊'][Math.floor(Math.random()*5)];document.body.appendChild(p);setTimeout(()=>p.remove(),3000)}setTimeout(()=>overlay.remove(),3000)}

function qMarkSeen(g,q){if(!g||!q)return;g.qSeen=g.qSeen||[];g.qSeenTxt=g.qSeenTxt||[];const h=qHash(q['題目']);

if(!g.qSeen.includes(h)){g.qSeen.push(h);if(g.qSeen.length>800)g.qSeen=g.qSeen.slice(-800);

g.qSeenTxt.push(String(q['題目']).slice(0,42));if(g.qSeenTxt.length>8)g.qSeenTxt=g.qSeenTxt.slice(-8)}}

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

function weekKey(){const d=new Date();const on=new Date(d.getFullYear(),0,1);const wn=Math.ceil((((d-on)/86400000)+on.getDay()+1)/7);return d.getFullYear()+'-W'+wn}

function getWeekly(g){

if(!g.weekly)g.weekly={wk:'',n:0,claimed:false};

const wk=weekKey();

if(g.weekly.wk!==wk)g.weekly={wk,n:0,claimed:false};

return g.weekly;

}
