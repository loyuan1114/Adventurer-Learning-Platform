/* ════════════════════════════════════════════
   vExch 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vExch
   ════════════════════════════════════════════ */
function vExch(){

const g=me().g;

$('#view').innerHTML=back()+'<h3 class="vt">🔄 兌換所 <span class="vsub">💠'+g.crystal+'｜🪙'+g.gold+'｜💎'+g.diamond+'｜🏅'+g.honor+'｜📖'+g.quizPts+'｜🧪'+g.labMat+'</span></h3>'+

CFG.EXCH.map((e,i)=>'<div class="panel2" style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><b style="flex:1">'+e.d+'</b><button class="btn mini" onclick="exch('+i+')">兌換</button></div>').join('');

}
