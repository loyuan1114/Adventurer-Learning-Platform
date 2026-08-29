/* ════════ 管理員後台 ════════ */

function renderAdmin(u){
applyMyTheme();

CUR.role='admin';

$('#app').innerHTML=

'<header class="hud"><div class="hudL"><span class="hlogo">👑</span><span class="hlv">管理員後台</span><span class="htitle">👤 超級管理員｜@'+esc(u.username)+'</span></div>'+

'<div class="hudR"><button class="btn mini" onclick="openImp()">🎭 模擬登入</button><button class="btn mini" onclick="openAddUser(true)">👥 建立新帳號</button>'+

'<button class="btn ghost mini" onclick="openChangePw()">🔒 修改密碼</button><button class="btn ghost mini" onclick="logout()">🚪 登出</button></div></header>'+

'<div class="wrap"><nav style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">'+

[['users','👥 用戶管理'],['grant','🎁 資源發放'],['mail_admin','📩 發信箱'],['dolls','🎀 娃娃管理'],['guilds','🛡️ 公會管理'],['content','📸 動態管理'],['books','📚 課本網址'],['codes','🎁 禮包碼生成器'],['post','📢 發布公告'],['monitor','🔍 聊天監控'],['stats','📊 系統統計'],['api','🔑 API 金鑰'],['aiprovider','🤖 AI 端點'],['socratic','🤖 蘇格拉底設定'],['classes','🏫 班級管理'],['game','⚙️ 遊戲設定'],['lang','🌍 語言包'],['trust','🏛 信任管理'],['student_view','🎮 學生遊戲面板'],['reset','🔄 重置系統']].map(t=>'<button class="btn ghost mini" onclick="aGo(\''+t[0]+'\')">'+t[1]+'</button>').join('')+'</nav>'+

'<main id="view" class="panel view"></main></div>';

aGo('users');

}

/* ════════ 家長端 Parent Dashboard ════════ */

function renderParent(u){
applyMyTheme();
CUR.role='parent';
var pendingCount=0;
try{
  var consents=get('ADV9_PARENT_CONSENTS',{requests:[]});
  var users=get(LS.users,[]);
  pendingCount=consents.requests.filter(function(r){
    return users.some(function(x){return x.username===r.child})&&r.status==='pending';
  }).length;
}catch(e){}

$('#app').innerHTML=

'<header class="hud"><div class="hudL"><span class="hlogo">👨‍👩‍👧</span><span class="hlv">家長端</span><span class="htitle">'+esc(u.name)+'</span></div>'+

'<div class="hudR">'+(pendingCount?'<span class="chip imp">📨 '+pendingCount+' 待審</span>':'')+

'<button class="btn mini" onclick="parentRequestLink()">➕ 連結孩子</button>'+

'<button class="btn ghost mini" onclick="openChangePw()">🔒 修改密碼</button><button class="btn ghost mini" onclick="logout()">🚪 登出</button></div></header>'+

'<div class="wrap"><main id="view" class="panel view"></main></div>';

parentDashboard();

}

function parentDashboard(){
var u=me();if(!u)return;
var consents=get('ADV9_PARENT_CONSENTS',{requests:[]});
var users=get(LS.users,[]);
var myReqs=consents.requests.filter(function(r){return r.parent===u.username;});
var granted=myReqs.filter(function(r){return r.status==='granted';});
var pending=myReqs.filter(function(r){return r.status==='pending';});
var denied=myReqs.filter(function(r){return r.status==='denied'||r.status==='revoked'||r.status==='revoked_by_admin';});

var h='<h3 class="vt">👨‍👩‍👧 家長觀察面板</h3>';
h+='<p class="vsub">查看孩子的學習狀態與進度</p>';

/* 已授權的孩子 */
if(granted.length){
  h+='<h4 style="margin:16px 0 8px;color:var(--teal)">✅ 已授權</h4>';
  granted.forEach(function(r){
    var child=users.find(function(x){return x.username===r.child;});
    if(!child)return;
    var g=child.g||{};
    h+='<div class="panel2" style="margin-bottom:10px;padding:14px;cursor:pointer;border-left:4px solid var(--teal)" onclick="parentViewDashboard(\''+jsA(child.username)+'\')">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center">';
    h+='<div><b style="font-size:15px">'+esc(child.name||child.username)+'</b>';
    h+='<span style="font-size:12px;color:var(--mut);margin-left:8px">@'+esc(child.username)+'</span></div>';
    h+='<span class="rwChip">📊 Lv.'+(g.lv||1)+'</span>';
    h+='</div>';
    h+='<div style="font-size:12px;color:var(--mut);margin-top:6px">';
    h+='⚡ '+((g.streak)||0)+' 連擊｜🎯 正確率 '+Math.round(((g.correct||0)/((g.total||1)||1))*100)+'%｜🗡️ '+(g.fightswon||0)+' 勝';
    h+='</div></div>';
  });
}

/* 待處理要求 */
if(pending.length){
  h+='<h4 style="margin:16px 0 8px;color:var(--gold2)">📨 等待孩子回覆</h4>';
  pending.forEach(function(r){
    h+='<div class="panel2" style="margin-bottom:8px;padding:10px;display:flex;justify-content:space-between;align-items:center">';
    h+='<span>'+esc(r.child)+'</span><span style="font-size:12px;color:var(--mut)">已送出 '+new Date(r.createdAt).toLocaleDateString()+'</span>';
    h+='</div>';
  });
}

/* 被拒絕/撤銷 */
if(denied.length){
  h+='<h4 style="margin:16px 0 8px;color:var(--mut)">❌ 未通過</h4>';
  denied.forEach(function(r){
    h+='<div class="panel2" style="margin-bottom:6px;padding:8px;opacity:.6">';
    h+='<span>'+esc(r.child)+'</span> <span style="font-size:11px;color:var(--mut)">（'+(r.status==='denied'?'已拒絕':r.status==='revoked_by_admin'?'管理員已撤銷':'已撤銷')+'）</span>';
    h+='</div>';
  });
}

if(!myReqs.length){
  h+='<div class="panel2" style="text-align:center;padding:40px 20px">';
  h+='<div style="font-size:40px;margin-bottom:12px">👨‍👩‍👧‍👦</div>';
  h+='<p style="color:var(--mut);margin-bottom:16px">尚未連結任何孩子</p>';
  h+='<button class="btn big" onclick="parentRequestLink()">➕ 連結孩子帳號</button>';
  h+='</div>';
}

$('#view').innerHTML=h;
}

function parentGo(tab){
parentDashboard();
}

/* ═══ 家長端 Child Consent Functions ═══ */

function parentRequestLink(){
var u=me(),childName=prompt('請輸入孩子的帳號：');
if(!childName)return;
var users=get(LS.users,[]);
var child=users.find(function(x){return x.username===childName});
if(!child)return toast('找不到該帳號','bad');
var consents=get('ADV9_PARENT_CONSENTS',{requests:[]});
var existing=consents.requests.find(function(r){return r.parent===u.username&&r.child===childName&&(r.status==='pending'||r.status==='granted')});
if(existing)return toast('已有進行中的要求','bad');
consents.requests.push({
id:'pc_'+Date.now(),
parent:u.username,
child:childName,
status:'pending',
createdAt:new Date().toISOString()
});
set('ADV9_PARENT_CONSENTS',consents);
toast('✅ 已送出要求，等待孩子同意');
parentDashboard();
}

function parentGrantView(childUsername){
var consents=get('ADV9_PARENT_CONSENTS',{requests:[]});
var req=consents.requests.find(function(r){return r.parent===me().username&&r.child===childUsername&&r.status==='pending'});
if(!req)return toast('找不到要求','bad');
req.status='granted';
req.grantedAt=new Date().toISOString();
set('ADV9_PARENT_CONSENTS',consents);
toast('✅ 已獲得查看權限');
}

function parentRevokeAccess(childUsername){
var consents=get('ADV9_PARENT_CONSENTS',{requests:[]});
var req=consents.requests.find(function(r){return r.parent===me().username&&r.child===childUsername});
if(!req)return;
req.status='revoked';
req.revokedAt=new Date().toISOString();
set('ADV9_PARENT_CONSENTS',consents);
toast('已撤銷查看權限');
parentDashboard();
}

function childApproveRequest(requestId){
var consents=get('ADV9_PARENT_CONSENTS',{requests:[]});
var req=consents.requests.find(function(r){return r.id===requestId&&r.child===me().username&&r.status==='pending'});
if(!req)return toast('找不到要求','bad');
req.status='granted';
req.grantedAt=new Date().toISOString();
set('ADV9_PARENT_CONSENTS',consents);
toast('✅ 已同意家長查看');
}

function childDenyRequest(requestId){
var consents=get('ADV9_PARENT_CONSENTS',{requests:[]});
var req=consents.requests.find(function(r){return r.id===requestId&&r.child===me().username&&r.status==='pending'});
if(!req)return toast('找不到要求','bad');
req.status='denied';
req.deniedAt=new Date().toISOString();
set('ADV9_PARENT_CONSENTS',consents);
toast('已拒絕');
}

function parentViewDashboard(childUsername){
var consents=get('ADV9_PARENT_CONSENTS',{requests:[]});
var req=consents.requests.find(function(r){return r.parent===me().username&&r.child===childUsername&&r.status==='granted'});
if(!req)return toast('⚠️ 沒有查看權限，請先取得孩子同意','bad');

var users=get(LS.users,[]);
var child=users.find(function(x){return x.username===childUsername});
if(!child||!child.g)return toast('找不到孩子資料','bad');
var g=child.g;

var h='<h2 class="mt">👨‍👩‍👧 家長觀察面板</h2>';
h+='<p style="color:var(--mut)">👤 觀察對象：'+esc(child.name||childUsername)+'</p>';

/* 法律保護條款 */
h+='<div style="background:#1a2a4a;border:2px solid #ff6b6b;border-radius:12px;padding:12px 16px;margin:10px 0">';
h+='<p style="color:#ff6b6b;font-weight:bold;margin:0 0 6px;font-size:13px">⚠️ 重要提醒</p>';
h+='<ul style="color:var(--mut);font-size:12px;margin:0;padding-left:18px;line-height:1.7">';
h+='<li>本面板僅供關心與鼓勵，請勿作為責備依據</li>';
h+='<li>孩子有權隨時<strong style="color:#ff6b6b">撤銷</strong>你的查看權限</li>';
h+='<li>家長<strong style="color:#ff6b6b">不得</strong>因孩子拒絕或撤銷而懲罰、威脅、逼迫或棄養</li>';
h+='<li>違反者將被<strong style="color:#ff6b6b">永久停權</strong>家長端功能</li>';
h+='</ul></div>';

var _streak=(g.streak&&typeof g.streak==='object')?(g.streak.count||0):(g.streak||0);
var _pkWin=((g.pk||{}).win)||0;
var _stats=g.stats||{};
var _acc=Math.round(((_stats.correct)||0)/((_stats.total||0)||1)*100);
h+='<div class="rwRow">';
h+='<span class="rwChip">📊 Lv.'+(g.lv||1)+' '+esc(g.title||'冒險者')+'</span>';
h+='<span class="rwChip">🔥 '+(g.sign&&g.sign.total||0)+' 天簽到</span>';
h+='<span class="rwChip">🎯 正確率 '+_acc+'%</span>';
h+='</div>';
h+='<div class="rwRow">';
h+='<span class="rwChip">🗡️ PK '+_pkWin+' 勝</span>';
h+='<span class="rwChip">🏰 領地 '+Object.keys((g.territory||{}).owned||{}).length+'</span>';
h+='<span class="rwChip">📝 筆記 '+((g.notes&&g.notes.length)||0)+'</span>';
h+='</div>';

var today=new Date(),weekAgo=new Date(today.getTime()-7*86400000);
var weekSessions=(g.sessions||[]).filter(function(s){return new Date(s.date)>=weekAgo});
h+='<h3 style="margin-top:16px">📅 本週活動 ('+weekSessions.length+' 次)</h3>';
h+='<div style="font-size:13px;color:var(--mut)">';
weekSessions.forEach(function(s){h+='<div>• '+new Date(s.date).toLocaleDateString()+' '+new Date(s.date).toLocaleTimeString()+'</div>'});
if(!weekSessions.length)h+='<div>本週無活動紀錄</div>';
h+='</div>';

h+='<div class="mBtns" style="margin-top:16px"><button class="btn ghost" onclick="closeModal();parentDashboard()">返回</button></div>';

openModal(h);
}

/* ═══ 孩子端同意管理 ═══ */

function childConsentPanel(){
var consents=get('ADV9_PARENT_CONSENTS',{requests:[]});
var pending=consents.requests.filter(function(r){return r.child===me().username&&r.status==='pending'});
var granted=consents.requests.filter(function(r){return r.child===me().username&&r.status==='granted'});

var h='<h2 class="mt">🔐 家長查看要求</h2>';

h+='<div style="background:#1a2a4a;border:2px solid #ff6b6b;border-radius:12px;padding:16px;margin:12px 0">';
h+='<p style="color:#ff6b6b;font-weight:bold;margin:0 0 8px">⚠️ 重要提醒</p>';
h+='<ul style="color:var(--mut);font-size:13px;margin:0;padding-left:18px">';
h+='<li>你有權<strong style="color:#ff6b6b">拒絕</strong>任何家長的查看要求</li>';
h+='<li>家長<strong style="color:#ff6b6b">不得</strong>因你拒絕而懲罰、威脅或棄養</li>';
h+='<li>違反者將被<strong style="color:#ff6b6b">永久停權</strong>家長端功能</li>';
h+='<li>你隨時可以<strong style="color:#ff6b6b">撤銷</strong>已同意的查看權限</li>';
h+='</ul></div>';

if(pending.length){
  h+='<h3>📨 待處理要求</h3>';
  pending.forEach(function(r){
    h+='<div class="rwRow" style="justify-content:space-between">';
    h+='<span>'+esc(r.parent)+'</span>';
    h+='<div><button class="btn mini" onclick="childApproveRequest(\''+jsA(r.id)+'\');childConsentPanel()">同意</button> ';
    h+='<button class="btn mini danger" onclick="childDenyRequest(\''+jsA(r.id)+'\');childConsentPanel()">拒絕</button></div>';
    h+='</div>';
  });
}

if(granted.length){
  h+='<h3 style="margin-top:12px">✅ 已授權</h3>';
  granted.forEach(function(r){
    h+='<div class="rwRow" style="justify-content:space-between">';
    h+='<span>'+esc(r.parent)+'</span>';
    h+='<button class="btn mini danger" onclick="if(confirm(\'確定撤銷？\')){childRevokeAccess(\''+jsA(r.id)+'\');childConsentPanel()}">撤銷</button>';
    h+='</div>';
  });
}

if(!pending.length&&!granted.length)h+='<p style="color:var(--mut);text-align:center">目前沒有家長查看要求</p>';

h+='<div class="mBtns"><button class="btn ghost" onclick="closeModal()">關閉</button></div>';
openModal(h);
}

function childRevokeAccess(requestId){
var consents=get('ADV9_PARENT_CONSENTS',{requests:[]});
var req=consents.requests.find(function(r){return r.id===requestId&&r.child===me().username});
if(!req)return;
req.status='revoked';
req.revokedAt=new Date().toISOString();
set('ADV9_PARENT_CONSENTS',consents);
toast('已撤銷查看權限');
}

function aGo(tab){

if(tab==='users')vUsers();else if(tab==='grant')vGrantAdmin();else if(tab==='mail_admin')vAdminMail();else if(tab==='dolls')vDollAdmin();else if(tab==="guilds")vGuildsAdmin();else if(tab==='content')vContentAdmin();else if(tab==='books')vBooksAdmin();else if(tab==='codes')vCodesAdmin();else if(tab==='post')vPostAdmin();

else if(tab==='monitor')vMonitor();else if(tab==='stats')vAStats();else if(tab==='api')vApiKeys();else if(tab==='aiprovider')vAiProvider();else if(tab==='socratic')vSocraticAdmin();else if(tab==='classes')vAdminPanel();else if(tab==='game')vGameSet();else if(tab==='lang')vLangStudy();else if(tab==='trust')vTrust();else if(tab==='student_view')renderStudent(me());else vResetAdmin();

}
