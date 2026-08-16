/* ════════════════════════════════════════════
   vAnn 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vAnn
   ════════════════════════════════════════════ */
function vAnn(){const as=get(LS.ann,[]);

$('#view').innerHTML=back()+'<h3 class="vt">📢 公告欄</h3>'+

(as.length?as.map(a=>'<div class="panel2 annIt"><b>'+esc(a.title)+'</b><span class="annMeta">'+esc(a.author)+'｜'+fmt(a.time)+'</span><p>'+esc(a.content)+'</p></div>').join(''):'<p class="empty">尚無公告</p>')}
