/* ════════════════════════════════════════════
   vUnitList 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：UNIT_TAG_COLOR, vUnitList
   ════════════════════════════════════════════ */
const UNIT_TAG_COLOR={'歷史':'#ef9a9a','地理':'#80cbc4','公民':'#ffe082','全科':'#b0bec5'};

function vUnitList(subj){

Quiz.subj=subj;const S=SUBJ[subj];

$('#view').innerHTML=back('vSubj()')+'<h3 class="vt">'+S.i+' '+subj+'｜選擇學期與單元 <span class="vsub">點選單元即進入出發設定</span></h3>'+

'<div class="panel2">'+Object.keys(S.u).map(sem=>'<div class="semT">📚 '+sem+'</div>'+

S.u[sem].map(un=>{
  const name=Array.isArray(un)?un[0]:un;
  const tag=Array.isArray(un)?un[1]:'';
  const tc=UNIT_TAG_COLOR[tag]||'var(--mut)';
  return '<button class="unitRow" onclick="vReady(\''+sem+'\',\''+name+'\')">➜ '+name+(tag?' <span class="vsub" style="color:'+tc+';font-size:10px;border:1px solid '+tc+'33;border-radius:6px;padding:0 5px">'+tag+'</span>':'')+'</button>';
}).join('')).join('')+'</div>';

}
