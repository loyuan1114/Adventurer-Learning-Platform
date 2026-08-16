/* ════════════════════════════════════════════
   vVideoSub 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vVideoSub
   ════════════════════════════════════════════ */
function vVideoSub(s){

const d=SUBJ[s];

$('#view').innerHTML=back('vVideos()')+'<h3 class="vt" style="color:'+d.c+'">'+d.i+' '+s+'影片 <span class="vsub">點選單元直接播放</span></h3>'+

Object.keys(d.u).map(sem=>'<div class="panel2" style="margin-bottom:10px"><b style="color:'+d.c+';font-family:var(--serif)">📖 '+sem+'</b><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">'+

d.u[sem].map(t=>'<button class="btn ghost mini" onclick="openVideoT(\''+s+'\',\''+sem+'\',\''+t.replace(/'/g,"\\'")+'\')">▶ '+t+'</button>').join('')+'</div></div>').join('');

}
