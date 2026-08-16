/* ════════════════════════════════════════════
   vContentAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vContentAdmin
   ════════════════════════════════════════════ */
function vContentAdmin(){

const now=Date.now();const st=get(LS.stories,[]).filter(s=>now-s.t<86400000).sort((a,b)=>b.t-a.t);

$('#view').innerHTML='<h3 class="vt">📸 動態管理 <span class="vsub">有效限時動態 '+st.length+' 則｜管理員可刪除任何內容</span></h3>'+

'<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap"><button class="btn danger mini" onclick="adminClearStories()">🧹 清空所有動態</button></div>'+

(st.length?st.map(s=>{const mins=Math.floor((now-s.t)/60000);const ago=mins<60?mins+' 分鐘前':Math.floor(mins/60)+' 小時前';

return '<div class="panel2" style="margin-bottom:10px"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b style="color:var(--gold2)">'+esc(s.n)+'</b>'+

'<span style="font-size:11px;color:var(--mut)">'+(s.vis==='friends'?'👥 僅好友':s.vis==='bff'?'💖 僅摯友':'🌍 公開')+'｜'+ago+'</span>'+

'<button class="btn danger mini" style="margin-left:auto" onclick="adminDelStory(\''+s.id+'\')">🗑 刪除</button></div>'+

(s.text?'<div style="margin-top:6px;font-size:13.5px;white-space:pre-wrap">'+esc(s.text)+'</div>':'')+

(s.img?'<img src="'+mediaUrl(s.img)+'" style="max-width:220px;max-height:220px;border-radius:8px;margin-top:6px;display:block">':'')+

(s.vid?'<video src="'+mediaUrl(s.vid)+'" controls style="max-width:220px;border-radius:8px;margin-top:6px;display:block"></video>':'')+'</div>'}).join(''):'<p class="empty">目前沒有限時動態</p>');

}
