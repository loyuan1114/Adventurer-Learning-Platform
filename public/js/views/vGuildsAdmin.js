/* ════════════════════════════════════════════
   vGuildsAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGuildsAdmin
   ════════════════════════════════════════════ */
function vGuildsAdmin(){

const guilds=get(LS.guilds,[]);const us=get(LS.users,[]);

$('#view').innerHTML='<h3 class="vt">🛡️ 公會管理 <span class="vsub">共 '+guilds.length+' 個公會</span></h3>'+

(guilds.length?guilds.sort((a,b)=>(b.level||1)-(a.level||1)).map(gd=>{const ld=us.find(x=>x.id===gd.leader);

return '<div class="panel2" style="margin-bottom:10px"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b style="color:var(--gold2);font-family:var(--serif)">🛡️ '+esc(gd.name)+'</b>'+

'<span style="font-size:11.5px;color:var(--mut)">Lv.'+(gd.level||1)+'｜'+gd.members.length+' 人｜會長 '+esc(ld?ld.name:'?')+'｜資金 '+(gd.fund||0)+'</span></div>'+

'<div style="display:flex;gap:6px;margin-top:8px;align-items:center;flex-wrap:wrap">調整等級：<input type="number" id="gdlv_'+gd.id+'" value="'+(gd.level||1)+'" min="1" style="width:80px">'+

'<button class="btn mini" onclick="adminSetGuildLv(\''+gd.id+'\')">儲存等級</button>'+

'<button class="btn danger mini" onclick="adminDisbandGuild(\''+gd.id+'\')">💥 解散</button></div></div>'}).join(''):'<p class="empty">目前沒有公會</p>');

}
