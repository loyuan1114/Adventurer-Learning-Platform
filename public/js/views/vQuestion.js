/* ════════════════════════════════════════════
   vQuestion 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：qMarkSeen, vQuestion
   ════════════════════════════════════════════ */
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
