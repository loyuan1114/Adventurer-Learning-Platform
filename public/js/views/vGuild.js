/* ════════════════════════════════════════════
   vGuild 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGuild
   ════════════════════════════════════════════ */
function vGuild(){

const u=me(),g=u.g;const guilds=get(LS.guilds,[]);const gd=guildOf(g);

if(!gd){

$('#view').innerHTML=back('vHome()')+'<h3 class="vt">🛡️ ��會 <span class="vsub">加入公會享全會經驗加成｜每級全經驗+1%（最高 10 級）</span></h3>'+

'<div class="panel2" style="margin-bottom:12px;max-width:480px"><b style="color:var(--gold2);font-family:var(--serif)">🆕 創建���會</b>'+

'<p style="font-size:12px;color:var(--mut);margin:5px 0">創建需 🪙500，創建者自動成為會長。會員可捐獻金幣升級，公會等級越高全體會員經驗加成越高。</p>'+

'<div style="display:flex;gap:8px;margin-top:8px"><input id="gdName" placeholder="公會名稱"><button class="btn mini" onclick="guildCreate()">創建（🪙500）</button></div></div>'+

(guilds.length?'<div class="semT">🌐 可加入的公會</div>'+guilds.sort((a,b)=>(b.level||1)-(a.level||1)).map(x=>'<div class="panel2 frIt"><b style="flex:1">🛡️ '+esc(x.name)+' <span style="font-size:11px;color:var(--mut)">Lv.'+(x.level||1)+'｜'+x.members.length+' 人｜全經驗+'+Math.min(10,x.level||1)+'%</span></b><button class="btn mini" onclick="guildJoin(\''+x.id+'\')">加入</button></div>').join(''):'<p class="empty">目前沒有公會，來創立第一個吧！</p>');

return;

}

const isLeader=gd.leader===u.id;const need=GUILD_NEED(gd.level||1);const us=get(LS.users,[]);

$('#view').innerHTML=back()+'<h3 class="vt">🛡️ '+esc(gd.name)+' <span class="vsub">Lv.'+(gd.level||1)+'｜'+gd.members.length+' 位會員｜全經驗加成 +'+Math.min(10,gd.level||1)+'%</span></h3>'+

'<div class="panel2" style="margin-bottom:12px;border-left:4px solid #8e24aa"><b style="color:var(--gold2);font-family:var(--serif)">📈 公會等級 Lv.'+(gd.level||1)+'</b>'+

'<div class="bar" style="margin:6px 0"><i style="width:'+Math.min(100,(gd.fund||0)/need*100)+'%"></i></div>'+

'<div style="font-size:12px;color:var(--mut)">公會資金 '+(gd.fund||0)+' / '+need+'（升到 Lv.'+((gd.level||1)+1)+'）｜目前加成：全體會員經驗 +'+Math.min(10,gd.level||1)+'%</div>'+

'<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;align-items:center"><input id="gdDon" type="number" min="10" value="100" style="width:120px"><button class="btn mini" onclick="guildDonate()">💰 捐獻金幣</button>'+

'<span style="font-size:12px;color:var(--mut)">你的🪙'+g.gold+'｜🪙公會幣 '+(g.guildCoin||0)+'｜累計捐獻 '+((gd.contrib&&gd.contrib[u.id])||0)+'</span></div></div>'+

guildShopHtml(gd,g)+

'<div class="panel2" style="margin-bottom:12px"><b style="color:var(--teal);font-family:var(--serif)">💬 公會訊息</b>'+

'<div class="chatBox" id="gdBox" style="height:220px;margin-top:8px">'+((gd.msgs||[]).map(m=>pmRow(m,u.id)).join('')||'<p class="empty">尚無訊息</p>')+'</div>'+

'<div style="display:flex;gap:8px;margin-top:10px"><input id="gdMsg" placeholder="對公會說點話..." onkeydown="if(event.key===\'Enter\')guildSend()"><button class="btn mini" onclick="guildSend()">發送</button></div></div>'+

'<div class="semT">👥 會員列表（依捐獻排序）</div>'+

gd.members.slice().sort((a,b)=>((gd.contrib&&gd.contrib[b])||0)-((gd.contrib&&gd.contrib[a])||0)).map(uid=>{const mu=us.find(x=>x.id===uid);if(!mu)return'';

return '<div class="panel2 frIt"><b style="flex:1">'+(uid===gd.leader?'👑':'🛡️')+' '+esc(mu.name)+' <span style="font-size:11px;color:var(--mut)">'+(uid===gd.leader?'會長｜':'')+'捐獻 '+((gd.contrib&&gd.contrib[uid])||0)+'</span></b>'+

(isLeader&&uid!==u.id?'<button class="btn danger mini" onclick="guildKick(\''+uid+'\')">踢出</button>':'')+'</div>'}).join('')+

'<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">'+'<button class="btn mini" onclick="guildPvp()">⚔️ 公會PVP</button>'+(isLeader?'<button class="btn danger mini" onclick="guildDisband()">💥 解散公會</button>':'<button class="btn ghost mini" onclick="guildLeave()">🚪 退出公會</button>')+'</div>';

const b=$('#gdBox');if(b)b.scrollTop=b.scrollHeight;

}
