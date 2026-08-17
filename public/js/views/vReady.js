/* ════════════════════════════════════════════
   vReady 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：maxDiff, vReady
   ════════════════════════════════════════════ */
function maxDiff(g){let m=30;for(const k in CFG.UNLOCK)if(g.lv>=CFG.UNLOCK[k])m=+k+14;return Math.min(100,m)}

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
