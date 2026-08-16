/* ════════════════════════════════════════════
   vPostAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPostAdmin
   ════════════════════════════════════════════ */
function vPostAdmin(){

const as=get(LS.ann,[]);

$('#view').innerHTML='<h3 class="vt">📢 發布公告</h3><div class="panel2" style="display:flex;flex-direction:column;gap:10px;max-width:620px">'+

'<input id="annT" placeholder="標題"><textarea id="annC" rows="3" placeholder="內容"></textarea>'+

'<button class="btn" style="align-self:flex-start" onclick="postAnn()">📢 發布全校公告</button></div>'+

'<h3 class="vt" style="margin-top:16px">📜 公告紀錄</h3>'+

(as.length?as.map(a=>'<div class="panel2 annIt"><b>'+esc(a.title)+'</b><span class="annMeta">'+esc(a.author)+'｜'+fmt(a.time)+'</span><p>'+esc(a.content)+'</p>'+

'<button class="btn danger mini" onclick="delAnn('+a.id+')">刪除</button></div>').join(''):'<p class="empty">尚無公告</p>');

}
