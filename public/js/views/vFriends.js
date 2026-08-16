/* ════════════════════════════════════════════
   vFriends 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vFriends
   ════════════════════════════════════════════ */
function vFriends(){

CUR.socialTab='fr';

const u=me(),g=u.g;const frs=getFriends(u.id);

const pend=get(LS.fr,[]).filter(f=>f.status==='pending'&&f.b===u.id);

const trades=get(LS.trades,[]);

const myIn=trades.filter(t=>t.to===u.id&&t.status==='pending');

const myOut=trades.filter(t=>t.from===u.id&&t.status==='pending');

const d=today();
if(g.energy.date!==d){const prev=g.streak||{date:'',count:0};if(prev.date===yesterday(d))g.streak={date:d,count:prev.count+1};else g.streak={date:d,count:1};g.energy={date:d,sent:[],received:[]}}

$('#view').innerHTML=back()+socialTabs('fr')+'<h3 class="vt">👥 好友 <span class="vsub">好友 '+frs.length+' 人｜聊天・傳照片・交易</span></h3>'+

'<div style="font-size:12.5px;color:var(--mut);margin-bottom:8px">👁 我的狀態：'+onlHtml(u)+' <span style="margin-left:6px">遊戲開著＋登入＝在線；可到 ⚙️ 設定「隱藏我的上線狀態」</span></div>'+

'<div class="panel2" style="margin-bottom:12px;display:flex;gap:8px"><input id="frSearch" placeholder="輸入玩家名稱搜尋..."><button class="btn mini" onclick="frSearch()">🔍 搜尋</button></div>'+

'<div id="frSearchRes"></div>'+

(pend.length?'<div class="semT">📥 收到的好友申請</div>'+pend.map(f=>{const from=get(LS.users,[]).find(x=>x.id===f.a);

return '<div class="panel2 frIt"><b style="flex:1">'+(from?esc(from.name):'未知')+'</b><button class="btn mini" onclick="frAccept(\''+f.a+'\')">✅ 接受</button><button class="btn ghost mini" onclick="frReject(\''+f.a+'\')">❌ 拒絕</button></div>'}).join(''):'')+

(myIn.length?'<div class="semT">📦 收到的交易提案（'+myIn.length+'）</div>'+myIn.map(t=>tradeRow(t,true)).join(''):'')+

(myOut.length?'<div class="semT">📤 我發出的交易（'+myOut.length+'）</div>'+myOut.map(t=>tradeRow(t,false)).join(''):'')+

'<div class="semT">🤝 好友列表</div>'+

(frs.length?frs.slice().sort((x,y)=>{const fx=x.a===u.id?x.b:x.a,fy=y.a===u.id?y.b:y.a;return (isBff(fy)?1:0)-(isBff(fx)?1:0)}).map(f=>{const fid=f.a===u.id?f.b:f.a;const fr=get(LS.users,[]).find(x=>x.id===fid);if(!fr)return'';

const canSend=!g.energy.sent.includes(fid);const canRecv=!g.energy.received.includes(fid);

return '<div class="panel2 frIt"><span class="onDot '+( _onlineSet.has(fr.username||fr.id)?'on':'off')+'" data-u="'+esc(fr.username||fr.id)+'" title="上線狀態"></span>'+avatarHtml(fr,28)+'<b style="flex:1">'+(isBff(fid)?'💖 ':'')+esc(dispName(fid))+onlHtml(fr)+' <span style="font-size:11px;color:var(--mut)">'+(fr.role==='teacher'?'👩‍🏫':'👤')+' Lv.'+(fr.g?fr.g.lv:'—')+'</span></b>'+

'<button class="btn ghost mini" title="設為摯友" onclick="bffToggle(\''+fid+'\')">'+(isBff(fid)?'💖':'🤍')+'</button>'+

'<button class="btn ghost mini" title="設定暱稱" onclick="setFrNick(\''+fid+'\')">✏️</button>'+

'<button class="btn teal mini" onclick="openPm(\''+fid+'\')">💬 聊天<span class="pmBadge" data-f="'+esc(fid)+'" style="display:none;margin-left:5px;min-width:16px;height:16px;line-height:16px;padding:0 4px;border-radius:8px;background:var(--red);color:#fff;font-size:10px;justify-content:center;align-items:center"></span></button>'+

'<button class="btn mini" onclick="openTrade(\''+fid+'\')">🤝 交易</button>'+

(fr.role==='student'?'<button class="btn mini" style="background:linear-gradient(180deg,#b39ddb,#7c4dff);border-color:#4527a0;color:#fff" onclick="duelChallenge(\''+fid+'\')">🎮 遊戲PK</button>':'')+

'<button class="btn ghost mini" onclick="frInfo(\''+fid+'\')">📋</button>'+

'<button class="btn mini '+(canSend?'':'dis')+'" onclick="frSend(\''+fid+'\')">🎁 贈精力</button>'+

'<button class="btn teal mini '+(canRecv?'':'dis')+'" onclick="frRecv(\''+fid+'\')">📥 領精力</button>'+

'<button class="btn danger mini" onclick="frDel(\''+f.a+'\',\''+f.b+'\')">🗑</button></div>'}).join('')

:'<p class="empty">尚無好友，快搜尋玩家加好友吧！</p>');
refreshPmBadges(); /* 📨 未讀徽章 */

}
