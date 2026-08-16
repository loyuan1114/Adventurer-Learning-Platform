/* ════════════════════════════════════════════
   vLab 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLab
   ════════════════════════════════════════════ */
function vLab(){

const g=me().g;

$('#view').innerHTML=back()+'<h3 class="vt">🧪 自然實驗室 <span class="vsub">🧪 素材 '+g.labMat+'｜完成 '+g.lab.length+'/'+EXPS.length+'</span></h3>'+

EXPS.map((e,i)=>{const done=g.lab.includes(i);

return '<div class="panel2 expIt" style="border-color:'+(done?'#00e676':'var(--line)')+'"><b>'+e.n+' <span style="font-size:11px;color:'+(done?'var(--green)':'var(--gold2)')+'">'+(done?'✅ 已完成':'✨ +'+e.rw.exp+'XP +'+e.rw.crystal+'💠 +'+e.rw.labMat+'🧪')+'</span></b>'+

'<div style="font-size:12px;color:var(--mut);margin:4px 0">'+e.d+'</div>'+

(done?'':'<button class="btn mini" style="background:linear-gradient(180deg,#69f0ae,#00c853);border-color:#00792e;color:#03300f" onclick="doExp('+i+')">🔬 開始實驗</button>')+'</div>'}).join('');

}
