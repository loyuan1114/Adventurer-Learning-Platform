/* ════════════════════════════════════════════
   vGroup 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGroup
   ════════════════════════════════════════════ */
function vGroup(){

CUR.socialTab='gr';

const u=me();const groups=get(LS.gr,[]);

const mine=groups.filter(gr=>gr.members.some(m=>m.uid===u.id));

const joinable=groups.filter(gr=>!gr.members.some(m=>m.uid===u.id));

let my=mine.find(gr=>gr.id===CUR.grpId)||mine[0];

if(my)CUR.grpId=my.id;

if(!my){

$('#view').innerHTML=back()+socialTabs('gr')+'<h3 class="vt">🏰 好友群組 <span class="vsub">支援同時加入多個群組</span></h3>'+

'<div class="panel2" style="max-width:480px"><b style="font-family:var(--serif);color:var(--gold2)">創建群組</b>'+

'<p style="font-size:12px;color:var(--mut);margin:5px 0">創建者自動成為管理員（Admin），可邀請/踢出成員、修改公告、解散群組。群組聊天與照片僅成員可見。</p>'+

'<div style="display:flex;gap:8px;margin-top:8px"><input id="grName" placeholder="群組名稱（如：701班）"><button class="btn mini" onclick="grCreate()">創建</button></div></div>'+

(joinable.length?'<div class="semT">可加入的群組</div>'+joinable.map(gr=>'<div class="panel2 frIt"><b style="flex:1">🏰 '+esc(gr.name)+' <span style="font-size:11px;color:var(--mut)">'+gr.members.length+' 人</span></b><button class="btn mini" onclick="grJoin(\''+gr.id+'\')">加入</button></div>').join(''):'');

return;

}

const isAdmin=my.members.find(m=>m.uid===u.id).role==='admin';

const us=get(LS.users,[]);

const msgs=my.msgs||[];

$('#view').innerHTML=back()+socialTabs('gr')+'<h3 class="vt">🏰 '+esc(my.name)+' <span class="vsub">'+my.members.length+' 人｜'+(isAdmin?'你是管理員':'你是成員')+'｜已加入 '+mine.length+' 個群組</span></h3>'+

'<div class="tabRow" style="margin-bottom:10px">'+mine.map(gr=>'<button class="tabB '+(gr.id===my.id?'on':'')+'" onclick="CUR.grpId=\''+gr.id+'\';vGroup()">🏰 '+esc(gr.name)+'</button>').join('')+'<button class="tabB" onclick="grNewPanel()">➕ 創建/加入群組</button></div>'+

'<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2);font-family:var(--serif)">📢 群組公告</b><p style="font-size:13.5px;margin-top:5px;white-space:pre-wrap">'+esc(my.announcement||'（尚無公告）')+'</p>'+

(isAdmin?'<div style="display:flex;gap:8px;margin-top:8px"><input id="grAnn" placeholder="修改公告..." value="'+esc(my.announcement||'')+'"><button class="btn mini" onclick="grAnn(\''+my.id+'\')">更新公告</button></div>':'')+'</div>'+

'<div class="panel2" style="margin-bottom:12px"><b style="color:var(--teal);font-family:var(--serif)">💬 群組聊天（可傳照片/影片・可限看次數）</b>'+

'<div class="chatBox" id="gcBox" style="height:280px;margin-top:8px;'+chatBgStyle('gr|'+my.id)+'">'+(msgs.map(m=>pmRow(m,u.id,'gr',my.id)).join('')||'<p class="empty">尚無訊息</p>')+'</div>'+

'<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;align-items:center"><input id="gcTxt" placeholder="輸入訊息..." style="flex:1;min-width:130px" onkeydown="if(event.key===\'Enter\')sendGroupMsg(\''+my.id+'\')">'+

'<label class="btn ghost mini" style="display:inline-flex;align-items:center;cursor:pointer">📷<input type="file" accept="image/*" style="display:none" onchange="onGroupPhoto(this,\''+my.id+'\')"></label>'+

'<label class="btn ghost mini" style="display:inline-flex;align-items:center;cursor:pointer">🎞 影片<input type="file" accept="video/*" style="display:none" onchange="onGroupVideo(this,\''+my.id+'\')"></label>'+

'<label style="font-size:11.5px;color:var(--mut);display:inline-flex;align-items:center;gap:3px;cursor:pointer"><input type="checkbox" id="gcMute" style="width:auto">🔇靜音</label>'+

'<select id="gcBurn" style="width:auto;font-size:12px;padding:6px"><option value="0">♾ 不限次</option><option value="1">🔥限看1次</option><option value="2">🔥限看2次</option><option value="3">🔥限看3次</option><option value="5">🔥限看5次</option></select>'+

'<button class="btn mini" onclick="sendGroupMsg(\''+my.id+'\')">發送</button></div>'+

'<div style="display:flex;gap:6px;margin-top:8px;align-items:center;flex-wrap:wrap"><label class="btn ghost mini" style="display:inline-flex;align-items:center;cursor:pointer">🖼 聊天背景<input type="file" accept="image/*" style="display:none" onchange="onChatBg(this,\'gr|'+my.id+'\',\'#gcBox\')"></label>'+

'<button class="btn ghost mini" onclick="clearChatBg(\'gr|'+my.id+'\',\'#gcBox\')">🧹 清除背景</button>'+

'<span style="font-size:11px;color:var(--mut)">🔥 限看內容群組內每人各自計算次數</span></div></div>'+

(isAdmin?'<div class="panel2" style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap"><input id="grInv" placeholder="輸入玩家名稱邀請..." style="flex:1;min-width:160px"><button class="btn mini" onclick="grInvite(\''+my.id+'\')">➕ 邀請成員</button><button class="btn danger mini" onclick="grDissolve(\''+my.id+'\')">💥 解散群組</button></div>':'')+

'<div class="semT">成員列表</div>'+

my.members.map(m=>{const mu=us.find(x=>x.id===m.uid);if(!mu)return'';

return '<div class="panel2 frIt"><b style="flex:1">'+(m.role==='admin'?'👑':'👤')+' '+esc(mu.name)+' <span style="font-size:11px;color:var(--mut)">'+(m.role==='admin'?'（管理員）':'')+'</span></b>'+

(isAdmin&&m.uid!==u.id?'<button class="btn danger mini" onclick="grKick(\''+my.id+'\',\''+m.uid+'\')">踢出</button>':'')+

(m.uid===u.id&&!isAdmin?'<button class="btn ghost mini" onclick="grLeave(\''+my.id+'\')">退出群組</button>':'')+'</div>'}).join('');

const b=$('#gcBox');if(b)b.scrollTop=b.scrollHeight;

}
