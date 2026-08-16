/* ════════════════════════════════════════════
   vMail 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMail
   ════════════════════════════════════════════ */
function vMail(){

CUR.socialTab='mail';const u=me(),g=u.g;

const mails=(g.mail||[]).slice().sort((a,b)=>b.t-a.t);

const nextTip=new Date().getHours()<21?'今日排行榜獎勵將於 <b style="color:var(--gold2)">今晚 21:00</b> 發放到信箱':'今日排行榜獎勵已發放（若未進前 3 名則無信件）';

$('#view').innerHTML=back()+socialTabs('mail')+'<h3 class="vt">📩 信箱 <span class="vsub">排行榜獎勵每日 21:00 自動寄送</span></h3>'+

'<div class="panel2" style="margin-bottom:12px;font-size:12.5px;color:var(--mut);border-left:4px solid var(--gold)">🕒 '+nextTip+'。</div>'+

(mails.length?mails.map(m=>{const rwTxt=m.rw?Object.keys(m.rw).map(k=>({diamond:'💎',gold:'🪙',crystal:'💠',starlight:'✨',honor:'🏅',ironOre:'⛏️',enhStone:'🔩',labMat:'🧪',quizPts:'📖'}[k]||k)+'+'+m.rw[k]).join(' '):'';

return '<div class="panel2" style="margin-bottom:8px;border-left:4px solid '+(m.claimed?'var(--line)':'var(--gold)')+'"><b style="color:var(--gold2);font-family:var(--serif)">'+esc(m.title)+'</b> <span class="cTime">'+fmt(m.t)+'</span>'+

'<div style="font-size:13px;margin:5px 0;color:var(--txt)">'+esc(m.body)+'</div>'+

(m.rw?'<div style="font-size:12.5px;color:var(--gold2);margin-bottom:6px">🎁 '+rwTxt+'</div>'+(m.claimed?'<span style="font-size:12px;color:var(--green)">✅ 已領取</span>':'<button class="btn mini" onclick="claimMail(\''+m.id+'\')">🎁 領取獎勵</button>'):'')+'</div>'}).join(''):'<p class="empty">信箱空空的～進入排行榜前 3 名，每晚 21:00 就會收到獎勵！</p>');

}
