/* ════════════════════════════════════════════
   vWrong 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vWrong
   ════════════════════════════════════════════ */
function vWrong(){

qReset();const g=me().g;

let h=back()+'<h3 class="vt">❌ 錯題重練 <span class="vsub">經驗 ×1.5｜已重練 '+((g.stats.retry)||0)+' 題</span></h3>';

let any=false;

for(const s of Object.keys(g.wrong)){

const ws=g.wrong[s].map((w,i)=>[w,i]).filter(p=>!p[0].done);

if(!ws.length)continue;any=true;

h+='<div class="semT">'+SUBJ[s].i+' '+s+'（'+ws.length+' 題）</div>';

for(const p of ws.slice(0,5))h+='<div class="panel2" style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="flex:1;font-size:12.5px;color:var(--mut)">'+esc(p[0].q['題目'].slice(0,42))+'…</span>'+

'<button class="btn mini" onclick="retryQ(\''+s+'\','+p[1]+')">重練</button></div>';

}

if(!any)h+='<p class="empty" style="color:var(--green)">🎉 太棒了，沒有待重練的錯題！</p>';

$('#view').innerHTML=h;

}
