/* ════════════════════════════════════════════
   vUnitList 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vUnitList
   ════════════════════════════════════════════ */
function vUnitList(subj){

Quiz.subj=subj;const S=SUBJ[subj];

$('#view').innerHTML=back('vSubj()')+'<h3 class="vt">'+S.i+' '+subj+'｜選擇學期與單元 <span class="vsub">點選單元即進入出發設定</span></h3>'+

'<div class="panel2">'+Object.keys(S.u).map(sem=>'<div class="semT">📚 '+sem+'</div>'+

S.u[sem].map(un=>'<button class="unitRow" onclick="vReady(\''+sem+'\',\''+un+'\')">➜ '+un+'</button>').join('')).join('')+'</div>';

}
