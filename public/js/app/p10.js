/* ════════ 密碼禮包 ════════ */

/* ════════════════════════════════════════════
   vCodes 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vCodes
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vCodes 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vCodes
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vCodes 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vCodes
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vCodes 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vCodes
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vCodes 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vCodes
   ════════════════════════════════════════════ */
async function vCodes(){
  if(!await needJs(['js/views/vCodes.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vCodes();
}






function redeemAny(){

const u=me(),g=u.g;const input=$('#codeIn').value.trim().toUpperCase();

if(!input)return;

if(CFG.EGGS[input]){

if(g.eggs.includes(input))return toast('⚠️ 此彩蛋已領取過','bad');

g.eggs.push(input);const e=CFG.EGGS[input];

if(e.t==='starAll')for(const n in g.stars)g.stars[n]=Math.min(5,g.stars[n]+1);

if(e.t==='crystal')g.crystal+=e.n;if(e.t==='diamond')g.diamond+=e.n;

saveU(u);hud();toast('🥚 彩蛋密碼！'+e.d);$('#codeIn').value='';return;

}

const codes=get(LS.codes,[]);const c=codes.find(x=>x.code===input);

if(!c)return toast('❌ 無效的禮包碼或彩蛋密碼','bad');

if(c.usedBy.includes(u.id))return toast('⚠️ 你已使用過此禮包碼','bad');

if(c.usedBy.length>=c.maxUses)return toast('⚠️ 此禮包碼已被用���','bad');

c.usedBy.push(u.id);set(LS.codes,codes);

const r=c.rewards||{};

if(r.gold)g.gold+=r.gold;if(r.crystal)g.crystal+=r.crystal;if(r.diamond)g.diamond+=r.diamond;

if(r.starlight)g.starlight+=r.starlight;if(r.enhStone)g.enhStone+=r.enhStone;if(r.ironOre)g.ironOre+=r.ironOre;

if(r.honor)g.honor+=r.honor;if(r.quizPts)g.quizPts+=r.quizPts;

if(r.grantChar){const cat=r.grantCat||'character';if(!g.owned[cat].includes(r.grantChar))g.owned[cat].push(r.grantChar);toast('🎁 獲得角色：'+r.grantChar)}

if(r.grantShards){toast('🧩 獲得角色碎片 ×'+r.grantShards)}

if(r.extraPk){g.pkExtra+=r.extraPk;toast('🏟️ PK 挑戰次數 +'+r.extraPk)}

if(r.extraQuiz){g.quizExtra+=r.extraQuiz;toast('⚔️ 修煉場次數 +'+r.extraQuiz)}

saveU(u);hud();toast('🎁 禮包碼兌換成功！');$('#codeIn').value='';

}

/* ════════════════════════════════════════════════

#4【新增】好友聊天＋傳照片（私聊存 LS.pm，與世界頻道分開）

#9【新增】好友交易（價格不得低於物品價值 40%）

════════════════════════════════════════════════ */

function getFriends(uid){return get(LS.fr,[]).filter(f=>f.status==='accepted'&&(f.a===uid||f.b===uid))}


/* 💬 社群中心：好友 / 群組 / 限時動態 合併分頁籤（統一入口，排版不再雜亂）*/

function socialTabs(active){const g=me()&&me().g;const um=g?unreadMail(g):0;return '<div class="tabRow" style="margin-bottom:14px">'+

[['fr','👥 好友'+(pmUnreadTotal()?' <span id="frTabBadge" style="display:inline-flex;min-width:16px;height:16px;line-height:16px;padding:0 4px;border-radius:8px;background:var(--red);color:#fff;font-size:10px;justify-content:center;align-items:center;margin-left:3px">'+Math.min(pmUnreadTotal(),9)+'</span>':'<span id="frTabBadge" style="display:none"></span>'),'vSocial(\'fr\')'],['gr','🏰 群組','vSocial(\'gr\')'],['story','📸 限時動態','vSocial(\'story\')'],['mail','📩 信箱'+(um?' ('+um+')':''),'vSocial(\'mail\')']].map(t=>'<button class="tabB '+(active===t[0]?'on':'')+'" onclick="'+t[2]+'">'+t[1]+'</button>').join('')+'</div>'}

/* ════════════════════════════════════════════
   vSocial 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vSocial
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vSocial 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vSocial
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vSocial 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vSocial
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vSocial 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vSocial
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vSocial 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vSocial
   ════════════════════════════════════════════ */
async function vSocial(tab){
  if(!await needJs(['js/views/vFriends.js', 'js/views/vGroup.js', 'js/views/vMail.js', 'js/views/vStory.js', 'js/views/vSocial.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vSocial(tab);
}






/* ════════════════════════════════════════════
   vFriends 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：yesterday, vFriends
   ════════════════════════════════════════════ */
const yesterday=(d)=>{const dt=new Date(d);dt.setDate(dt.getDate()-1);return dt.toDateString();};

/* ════════════════════════════════════════════
   vFriends 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vFriends
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vFriends 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vFriends
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vFriends 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vFriends
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vFriends 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vFriends
   ════════════════════════════════════════════ */
async function vFriends(){
  if(!await needJs(['js/views/vFriends.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vFriends();
}






function tradeRow(t,isIn){

const us=get(LS.users,[]);

const other=us.find(x=>x.id===(isIn?t.from:t.to));

return '<div class="panel2 frIt tradeIt"><b style="flex:1">'+(isIn?'📥 ':'📤 ')+esc(other?other.name:'?')+' 想'+(isIn?'賣給你':'買你的')+'：<span style="color:var(--gold2)">'+esc(t.itemName)+'</span> '+

'<span class="valNote">（物品價值 🪙'+t.value+'｜開價 🪙'+t.price+'｜符合40%下限 '+(t.price>=Math.floor(t.value*CFG.TRADE_MIN_RATIO)?'✅':'❌')+'）</span></b>'+

(isIn?'<button class="btn mini" onclick="acceptTrade(\''+t.id+'\')">✅ 接受（付 🪙'+t.price+'）</button><button class="btn ghost mini" onclick="rejectTrade(\''+t.id+'\')">❌ 拒絕</button>'

:'<button class="btn ghost mini" onclick="cancelTrade(\''+t.id+'\')">撤回</button>')+'</div>';

}

function frSearch(){

const u=me();const q=$('#frSearch').value.trim();if(!q)return;

const us=get(LS.users,[]).filter(x=>x.id!==u.id&&(x.name.includes(q)||x.username.includes(q)||x.id.includes(q)));

const frs=get(LS.fr,[]);

$('#frSearchRes').innerHTML=us.length?us.map(x=>{

const rel=frs.find(f=>(f.a===u.id&&f.b===x.id)||(f.a===x.id&&f.b===u.id));

const btn=rel?(rel.status==='accepted'?'✅ 已是好友':rel.a===u.id?'⏳ 已發送申請':'<button class="btn mini" onclick="frAccept(\''+x.id+'\')">✅ 接受申請</button>')

:'<button class="btn mini" onclick="frAdd(\''+x.id+'\')">➕ 加為好友</button>';

return '<div class="panel2 frIt"><b style="flex:1">'+esc(x.name)+' <span style="font-size:11px;color:var(--mut)">'+(x.role==='teacher'?'👩‍🏫':x.role==='admin'?'👑':'👤')+'</span></b>'+btn+'</div>'}).join('')

:'<p style="color:var(--mut);font-size:13px;padding:8px">找不到符合的玩家</p>';

}

function frAdd(tid){

const u=me();const frs=get(LS.fr,[]);

const tgt=get(LS.users,[]).find(x=>x.id===tid);

if(tgt&&tgt.prof&&tgt.prof.frPrivacy==='off')return toast('🔒 對方已關閉好友申請','bad'); /* 好友申請隱私設定 */

if(frs.some(f=>(f.a===u.id&&f.b===tid)||(f.a===tid&&f.b===u.id)))return toast('⚠️ 已有好友關係','bad');

frs.push({a:u.id,b:tid,status:'pending',from:u.id});set(LS.fr,frs);

toast('📨 好友申請已發送！');vFriends();

}

function frAccept(aid){

const u=me();const frs=get(LS.fr,[]);

const f=frs.find(x=>x.a===aid&&x.b===u.id&&x.status==='pending');

if(f)f.status='accepted';set(LS.fr,frs);

toast('🤝 已成為好友！');vFriends();

}

function frReject(aid){

const u=me();set(LS.fr,get(LS.fr,[]).filter(x=>!(x.a===aid&&x.b===u.id&&x.status==='pending')));

toast('已拒絕申請');vFriends();

}

function frDel(a,b){

if(!confirm('刪除此好友？'))return;

set(LS.fr,get(LS.fr,[]).filter(x=>!((x.a===a&&x.b===b)||(x.a===b&&x.b===a))));

toast('🗑 已刪除好友');vFriends();

}

function frInfo(fid){

const fr=get(LS.users,[]).find(x=>x.id===fid);if(!fr)return;

const g=fr.g;

openModal('<h3 class="mt">📋 '+esc(fr.name)+' 的資訊</h3>'+

'<div style="font-size:13.5px;line-height:2">'+

'身份：'+(fr.role==='teacher'?'👩‍🏫 老師':fr.role==='admin'?'👑 管理員':'👤 學生')+'<br>'+

(g?'等級：Lv.'+g.lv+' 【'+titleOf(g.lv)+'】<br>戰力：⚡'+power(g)+'<br>答對：'+g.stats.correct+' 題<br>PK：'+g.pk.win+' 勝<br>連續天數：'+(g.streak?g.streak.count:0)+' 天<br>收藏：'+collCount(g)+' 個':'—')+

'</div><div class="mBtns"><button class="btn" onclick="closeModal()">確定</button></div>');

}

function frSend(fid){

const u=me(),g=u.g;const d=today();
if(g.energy.date!==d){const prev=g.streak||{date:'',count:0};if(prev.date===yesterday(d))g.streak={date:d,count:prev.count+1};else g.streak={date:d,count:1};g.energy={date:d,sent:[],received:[]}}

if(g.energy.sent.includes(fid))return toast('⚠️ 今日已贈送過','bad');

g.energy.sent.push(fid);g.crystal+=5;updMission(g,'giftEnergy',1);

saveU(u);hud();toast('🎁 已贈送友情精力（+5💠 回饋）');vFriends();

}

function frRecv(fid){

const u=me(),g=u.g;const d=today();
if(g.energy.date!==d){const prev=g.streak||{date:'',count:0};if(prev.date===yesterday(d))g.streak={date:d,count:prev.count+1};else g.streak={date:d,count:1};g.energy={date:d,sent:[],received:[]}}

if(g.energy.received.includes(fid))return toast('⚠️ 今日已領取過','bad');

g.energy.received.push(fid);g.crystal+=10;g.gold+=20;updMission(g,'recvEnergy',1);

saveU(u);hud();toast('📥 領取友情精力（+10💠 +20🪙）');vFriends();

}

/* ── #4 好友私聊（含傳照片）── */

function openPm(fid){

const u=me();const fr=get(LS.users,[]).find(x=>x.id===fid);

const id=pmId(u.id,fid);

const pm=get(LS.pm,{});const msgs=pm[id]||[];

window._pmFid=fid; /* 📨 目前開著的私聊對象（即時輪詢會自動刷新此視窗） */
const _mb=$('#mbody');if(_mb)_mb.style.maxWidth='760px'; /* 加寬以容納大照片/影片 */

openModal('<h3 class="mt">💬 與 '+avatarHtml(fr,24)+' '+esc(dispName(fid))+(isBff(fid)?' 💖':'')+onlHtml(fr)+' 的私聊 <span style="font-size:11px;color:var(--mut)">（僅雙方可見・老師無法查看）</span></h3>'+

'<div class="chatBox" id="pmBox" style="height:400px;'+chatBgStyle('pm|'+fid)+'">'+(msgs.map(m=>pmRow(m,u.id,'pm',id)).join('')||'<p class="empty">尚無訊息，打個招呼吧！</p>')+'</div>'+

'<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;align-items:center"><input id="pmTxt" placeholder="輸入訊息..." style="flex:1;min-width:130px" onkeydown="if(event.key===\'Enter\')sendPm(\''+fid+'\')">'+

'<label class="btn ghost mini" style="display:inline-flex;align-items:center;cursor:pointer">📷<input type="file" accept="image/*" style="display:none" onchange="onPmPhoto(this,\''+fid+'\')"></label>'+

'<label class="btn ghost mini" style="display:inline-flex;align-items:center;cursor:pointer">🎞 影片<input type="file" accept="video/*" style="display:none" onchange="onPmVideo(this,\''+fid+'\')"></label>'+

'<label style="font-size:11.5px;color:var(--mut);display:inline-flex;align-items:center;gap:3px;cursor:pointer"><input type="checkbox" id="pmMute" style="width:auto">🔇靜音</label>'+

'<select id="pmBurn" style="width:auto;font-size:12px;padding:6px"><option value="0">♾ 不限次</option><option value="1">🔥限看1次</option><option value="2">🔥限看2次</option><option value="3">🔥限看3次</option><option value="5">🔥限看5次</option></select>'+

'<button class="btn mini" onclick="sendPm(\''+fid+'\')">發送</button></div>'+

'<div style="display:flex;gap:6px;margin-top:8px;align-items:center;flex-wrap:wrap"><label class="btn ghost mini" style="display:inline-flex;align-items:center;cursor:pointer">🖼 聊天背景<input type="file" accept="image/*" style="display:none" onchange="onChatBg(this,\'pm|'+fid+'\',\'#pmBox\')"></label>'+

'<button class="btn ghost mini" onclick="clearChatBg(\'pm|'+fid+'\',\'#pmBox\')">🧹 清除背景</button>'+

'<span style="font-size:11px;color:var(--mut)">🔥 選限看次數後發送的文字/照片/影片，對方每人只能看指定次數</span></div>'+

'<div class="mBtns"><button class="btn ghost" onclick="closeModal()">關閉</button></div>');

const b=$('#pmBox');b.scrollTop=b.scrollHeight;
/* 🎯 記錄目前看的私聊與滾動位置（版本更新後自動還原） */
try{localStorage.setItem('ADV9_LASTPM',JSON.stringify({fid,top:b.scrollHeight}))}catch(e){}
if(!b._lsp){b._lsp=true;b.addEventListener('scroll',function(){try{const rec=JSON.parse(localStorage.getItem('ADV9_LASTPM')||'{}')||{};rec.fid=fid;rec.top=b.scrollTop;localStorage.setItem('ADV9_LASTPM',JSON.stringify(rec))}catch(e){}},{passive:true})}
markPmRead(fid);

}

function pmRow(m,myId,scope,key){

const mine=m.from===myId;

const u=me();const fr=get(LS.users,[]).find(x=>x.id===m.from);

const who=mine?'我':esc(dispName(m.from));

let body;

if(m.recalled)body=msgMedia(m); /* 收回的訊息直接顯示標記 */

else if(m.burn&&scope){const isAdm=u.role==='admin';const n=(m.views&&m.views[u.id])||0; /* 管理員與發送者不受限、不計次 */

body=(isAdm||mine)?'<button class="btn ghost mini" onclick="viewBurn(\''+scope+'\',\''+key+'\','+m.t+')">🔥 限看 '+m.burn+' 次內容（點擊觀看）</button>'

:(n<m.burn?'<button class="btn ghost mini" onclick="viewBurn(\''+scope+'\',\''+key+'\','+m.t+')">🔥 限看 '+m.burn+' 次（已看 '+n+'/'+m.burn+'）點擊觀看</button>':'<span style="font-size:12px;color:var(--mut)">🚫 已達觀看上限（'+m.burn+' 次）</span>')}

else body=msgMedia(m);

const recallBtn=(mine&&!m.recalled&&scope)?'<button onclick="recallMsg(\''+scope+'\',\''+key+'\','+m.t+')" title="收回訊息" style="float:right;background:none;border:none;color:rgba(255,255,255,.8);cursor:pointer;font-size:11px;padding:0 2px;margin-left:6px">↩ 收回</button>':'';

const av=avatarHtml(mine?u:fr,26);

const nm='<span class="cmName">'+(mine?'':'<b>'+who+'</b>'+(fr&&fr.role==='admin'?'<span title="管理員">👑</span>':fr&&fr.role==='teacher'?'<span title="老師">👩‍🏫</span>':''))+'<span class="cTime">'+fmt(m.t)+'</span></span>';

return '<div class="chatMsg '+(mine?'mine':'')+'">'+av+'<div class="cmCol">'+nm+'<div class="cmBub">'+recallBtn+body+'</div></div></div>';

}

/* ↩ 收回訊息：只能收自己的；雲端媒體檔一併刪除，保留「已收回」標記 */

function recallMsg(scope,key,t){

const u=me();if(!confirm('收回這則訊息？對方將看不到內容。'))return;

const wipe=m=>{cloudDelete(m.img);cloudDelete(m.vid);for(const k in m)if(k!=='from'&&k!=='t')delete m[k];m.recalled=true};

if(scope==='pm'){

const pm=get(LS.pm,{});const m=(pm[key]||[]).find(x=>x.t===t&&x.from===u.id);if(!m)return;

wipe(m);set(LS.pm,pm);

const fid=key.split('|').find(x=>x!==u.id);refreshPm(fid);

}else{

const grs=get(LS.gr,[]);const gr=grs.find(x=>x.id===key);if(!gr)return;

const m=(gr.msgs||[]).find(x=>x.t===t&&x.from===u.id);if(!m)return;

wipe(m);set(LS.gr,grs);

const b=$('#gcBox');if(b){b.innerHTML=gr.msgs.map(x=>pmRow(x,u.id,'gr',key)).join('');b.scrollTop=b.scrollHeight;}

}

toast('↩ 訊息已收回');

}

function pmBurnVal(){const s=$('#pmBurn');return s?(+s.value||0):0}

function sendPm(fid){

const u=me();const txt=sanitizeText($('#pmTxt').value.trim(),500);if(!txt)return;

const pm=get(LS.pm,{});const id=pmId(u.id,fid);

const burn=pmBurnVal();

pm[id]=pm[id]||[];pm[id].push(Object.assign({from:u.id,text:txt,t:Date.now()},burn?{burn,views:{}}:{}));

set(LS.pm,pm);$('#pmTxt').value='';

refreshPm(fid);
if(typeof flushSupaQ==='function')flushSupaQ(); /* 立即上傳，讓對方秒收到 */

}

function onPmPhoto(inp,fid){

const f=inp.files[0];if(!f)return;

mediaUpload(f,src=>{ /* ☁️ 優先上雲端，訊息只存網址 */

const u=me();const pm=get(LS.pm,{});const id=pmId(u.id,fid);

const burn=pmBurnVal();

pm[id]=pm[id]||[];pm[id].push(Object.assign({from:u.id,img:src,t:Date.now()},burn?{burn,views:{}}:{}));

try{set(LS.pm,pm)}catch(err){return toast('⚠️ 儲存空間不足','bad')}

refreshPm(fid);toast(burn?'🔥 限看照片已發送（每人限 '+burn+' 次）':'📷 照片已發送');

});

}

function onPmVideo(inp,fid){ /* 影片訊息：可勾🔇靜音、可設限看次數；☁️ 雲端上傳最大 50MB */

const f=inp.files[0];if(!f)return;

const muted=!!($('#pmMute')&&$('#pmMute').checked);const burn=pmBurnVal();

mediaUpload(f,src=>{

const u=me();const pm=get(LS.pm,{});const id=pmId(u.id,fid);

pm[id]=pm[id]||[];pm[id].push(Object.assign({from:u.id,vid:src,muted,t:Date.now()},burn?{burn,views:{}}:{}));

try{set(LS.pm,pm)}catch(err){return toast('⚠️ 儲存空間不足，影片太大','bad')}

refreshPm(fid);toast((muted?'🔇 靜音':'🔊 有聲')+'影片已發送'+(burn?'（每人限看 '+burn+' 次）':''));

});

}

function refreshPm(fid){

const u=me();const id=pmId(u.id,fid);const pm=get(LS.pm,{});const msgs=pm[id]||[];

const b=$('#pmBox');if(b){b.innerHTML=msgs.map(m=>pmRow(m,u.id,'pm',id)).join('')||'<p class="empty">尚無訊息</p>';b.scrollTop=b.scrollHeight;}

}

/* ── #9 好友交易（40% 價值下限）── */

function openTrade(fid){

const u=me(),g=u.g;const fr=get(LS.users,[]).find(x=>x.id===fid);

const wOpts=g.weapons.map((w,i)=>({i,n:w.n+' +'+(w.lv||0)+'（'+w.q+'）',v:itemValue(w)}));

openModal('<h3 class="mt">🤝 與 '+esc(fr?fr.name:'?')+' 交易</h3>'+

'<p class="msub">出售你的裝備給好友。為防止惡意贈送/低價傾銷，<b style="color:var(--gold2)">開價不得低於物品價值的 '+Math.round(CFG.TRADE_MIN_RATIO*100)+'%</b>。</p>'+

'<label class="mlab">選擇要出售的裝備<select id="trItem">'+

(wOpts.length?wOpts.map(w=>'<option value="'+w.i+'" data-v="'+w.v+'">'+w.n+'｜價值 🪙'+w.v+'</option>').join(''):'<option value="">（尚無裝備）</option>')+'</select></label>'+

'<div id="trMin" style="font-size:12px;color:var(--teal);margin-bottom:10px"></div>'+

'<label class="mlab">開價（🪙金幣）<input id="trPrice" type="number" min="0" oninput="trCheck()"></label>'+

'<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button><button class="btn" onclick="proposeTrade(\''+fid+'\')">📤 提出交易</button></div>');

trCheck();

}

function trCheck(){

const sel=$('#trItem');if(!sel||!sel.value&&sel.value!==0)return;

const opt=sel.options[sel.selectedIndex];if(!opt)return;

const v=+opt.dataset.v||0;

const min=Math.floor(v*CFG.TRADE_MIN_RATIO);

const mn=$('#trMin');if(mn)mn.textContent='此裝備價值 🪙'+v+'，最低開價 🪙'+min+'（'+Math.round(CFG.TRADE_MIN_RATIO*100)+'%）';

}

function proposeTrade(fid){

const u=me(),g=u.g;

const sel=$('#trItem');const wi=+sel.value;

const w=g.weapons[wi];if(!w)return toast('⚠️ 請選擇裝備','bad');

const v=itemValue(w);

const min=Math.floor(v*CFG.TRADE_MIN_RATIO);

const price=Math.floor(+$('#trPrice').value||0);

if(price<min)return toast('⚠️ 開價 🪙'+price+' 低於物品價值 '+Math.round(CFG.TRADE_MIN_RATIO*100)+'%（最低 🪙'+min+'）','bad');

const trades=get(LS.trades,[]);

trades.push({id:'tr'+Date.now()+Math.floor(Math.random()*999),from:u.id,to:fid,wi,itemName:w.n+' +'+(w.lv||0)+'（'+w.q+'）',itemData:JSON.parse(JSON.stringify(w)),value:v,price,status:'pending',t:Date.now()});

set(LS.trades,trades);

closeModal();toast('📤 交易提案已發送（🪙'+price+'）');vFriends();

}

function acceptTrade(tid){

const u=me(),g=u.g;

const trades=get(LS.trades,[]);const t=trades.find(x=>x.id===tid);

if(!t||t.status!=='pending')return;

/* 買方：檢查金幣 */

if(Number(g.gold)<t.price)return toast('🪙 金幣不足（需 🪙'+t.price+'）','bad');

/* 賣方：檢查裝備是否還在 */

const seller=get(LS.users,[]).find(x=>x.id===t.from);

if(!seller||!seller.g)return toast('⚠️ 賣家不存在','bad');

const sw=seller.g.weapons[t.wi];

if(!sw||sw.n!==t.itemData.n||(sw.lv||0)!==(t.itemData.lv||0))return toast('⚠️ 該裝備已不存在或已變更','bad');

/* 執行交易：買方付錢收裝備，賣方收錢失去裝備 */

g.gold=Number(g.gold)-t.price;

g.weapons.push(JSON.parse(JSON.stringify(t.itemData)));

seller.g.weapons.splice(t.wi,1);

seller.g.gold=(Number(seller.g.gold)||0)+t.price;

t.status='accepted';

set(LS.trades,trades);

saveU(u);saveU(seller);hud();

toast('✅ 交易完成！獲得 '+t.itemName+'（付出 🪙'+t.price+'）');vFriends();

}

function rejectTrade(tid){

const trades=get(LS.trades,[]);const t=trades.find(x=>x.id===tid);

if(t){t.status='rejected';set(LS.trades,trades);toast('❌ 已拒絕交易');vFriends();}

}

function cancelTrade(tid){

const trades=get(LS.trades,[]);

set(LS.trades,trades.filter(x=>x.id!==tid));

toast('已撤回交易');vFriends();

}

/* ════════════════════════════════════════════════

#4 群組＋群組聊天（含傳照片）

#5 老師看不到學生私聊/群組聊天（隱私）

════════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vGroup 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGroup
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGroup 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGroup
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGroup 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGroup
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGroup 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGroup
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGroup 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGroup
   ════════════════════════════════════════════ */
async function vGroup(){
  if(!await needJs(['js/views/vGroup.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vGroup();
}






function sendGroupMsg(gid){

const u=me();const txt=sanitizeText($('#gcTxt').value.trim(),500);if(!txt)return;

const groups=get(LS.gr,[]);const gr=groups.find(x=>x.id===gid);

const burn=(+($('#gcBurn')?$('#gcBurn').value:0))||0;

gr.msgs=gr.msgs||[];gr.msgs.push(Object.assign({from:u.id,text:txt,t:Date.now()},burn?{burn,views:{}}:{}));

set(LS.gr,groups);$('#gcTxt').value='';

const b=$('#gcBox');if(b){b.innerHTML=gr.msgs.map(m=>pmRow(m,u.id,'gr',gid)).join('');b.scrollTop=b.scrollHeight;}

}

function onGroupPhoto(inp,gid){

const f=inp.files[0];if(!f)return;

const burn=(+($('#gcBurn')?$('#gcBurn').value:0))||0;

mediaUpload(f,src=>{ /* ☁️ 優先上雲端 */

const u=me();const groups=get(LS.gr,[]);const gr=groups.find(x=>x.id===gid);

gr.msgs=gr.msgs||[];gr.msgs.push(Object.assign({from:u.id,img:src,t:Date.now()},burn?{burn,views:{}}:{}));

try{set(LS.gr,groups)}catch(err){return toast('⚠️ 儲存空間不足','bad')}

const b=$('#gcBox');if(b){b.innerHTML=gr.msgs.map(m=>pmRow(m,u.id,'gr',gid)).join('');b.scrollTop=b.scrollHeight;}

toast(burn?'🔥 限看照片已發送（每人限 '+burn+' 次）':'📷 照片已發送到群組');

});

}

function onGroupVideo(inp,gid){ /* 群組影片訊息：可靜音、可限看次數；☁️ 雲端上傳最大 50MB */

const f=inp.files[0];if(!f)return;

const muted=!!($('#gcMute')&&$('#gcMute').checked);const burn=(+($('#gcBurn')?$('#gcBurn').value:0))||0;

mediaUpload(f,src=>{

const u=me();const groups=get(LS.gr,[]);const gr=groups.find(x=>x.id===gid);

gr.msgs=gr.msgs||[];gr.msgs.push(Object.assign({from:u.id,vid:src,muted,t:Date.now()},burn?{burn,views:{}}:{}));

try{set(LS.gr,groups)}catch(err){return toast('⚠️ 儲存空間不足，影片太大','bad')}

const b=$('#gcBox');if(b){b.innerHTML=gr.msgs.map(m=>pmRow(m,u.id,'gr',gid)).join('');b.scrollTop=b.scrollHeight;}

toast((muted?'🔇 靜音':'🔊 有聲')+'影片已發送到群組'+(burn?'（每人限看 '+burn+' 次）':''));

});

}

function grNewPanel(){

const u=me();const groups=get(LS.gr,[]);

const joinable=groups.filter(gr=>!gr.members.some(m=>m.uid===u.id));

openModal('<h3 class="mt">➕ 創建/加入群組</h3><p class="msub">可同時加入多個群組，創建者自動成為管理員</p>'+

'<div style="display:flex;gap:8px;margin-bottom:12px"><input id="grName" placeholder="新群組名稱..."><button class="btn mini" onclick="grCreate()">創建</button></div>'+

(joinable.length?'<div class="semT">可加入的群組</div>'+joinable.map(gr=>'<div class="panel2 frIt"><b style="flex:1">🏰 '+esc(gr.name)+' <span style="font-size:11px;color:var(--mut)">'+gr.members.length+' 人</span></b><button class="btn mini" onclick="grJoin(\''+gr.id+'\')">加入</button></div>').join(''):'<p class="empty">目前沒有其他可加入的群組</p>')+

'<div class="mBtns"><button class="btn ghost" onclick="closeModal()">關閉</button></div>');

}

function grCreate(){

const u=me();const name=$('#grName').value.trim();if(!name)return;

const groups=get(LS.gr,[]);

const nid='g'+Date.now();

groups.push({id:nid,name,ownerId:u.id,announcement:'',members:[{uid:u.id,role:'admin',joinedAt:Date.now()}],msgs:[],createdAt:Date.now()});

set(LS.gr,groups);CUR.grpId=nid;closeModal();toast('🏰 群組「'+name+'」創建成功！你是管理員');vGroup();

}

function grJoin(id){

const u=me();const groups=get(LS.gr,[]);const gr=groups.find(x=>x.id===id);

if(!gr)return;if(gr.members.some(m=>m.uid===u.id))return toast('已在群組中','bad');

gr.members.push({uid:u.id,role:'member',joinedAt:Date.now()});set(LS.gr,groups);CUR.grpId=id;closeModal();

toast('✅ 已加入群組');vGroup();

}

function grInvite(id){

const u=me();const groups=get(LS.gr,[]);const gr=groups.find(x=>x.id===id);

const actor=gr.members.find(m=>m.uid===u.id);

if(!actor||actor.role!=='admin')return toast('⚠️ 只有管理員可邀請','bad');

const q=$('#grInv').value.trim();const target=get(LS.users,[]).find(x=>x.name===q);

if(!target)return toast('⚠️ 找不到該玩家','bad');

if(gr.members.some(m=>m.uid===target.id))return toast('⚠️ 該玩家已在群組中','bad');

gr.members.push({uid:target.id,role:'member',joinedAt:Date.now()});set(LS.gr,groups);

toast('➕ 已邀請 '+target.name);vGroup();

}

function grKick(id,uid){

const u=me();const groups=get(LS.gr,[]);const gr=groups.find(x=>x.id===id);

const actor=gr.members.find(m=>m.uid===u.id);

if(!actor||actor.role!=='admin')return toast('⚠️ 只有管理員可踢出成員','bad');

gr.members=gr.members.filter(m=>m.uid!==uid);set(LS.gr,groups);

toast('👢 已踢出成員');vGroup();

}

function grAnn(id){

const u=me();const groups=get(LS.gr,[]);const gr=groups.find(x=>x.id===id);

const actor=gr.members.find(m=>m.uid===u.id);

if(!actor||actor.role!=='admin')return toast('⚠️ 只有管理員可修改公告','bad');

gr.announcement=$('#grAnn').value;set(LS.gr,groups);

toast('📢 公告已更新');vGroup();

}

function grLeave(id){

const u=me();const groups=get(LS.gr,[]);const gr=groups.find(x=>x.id===id);

gr.members=gr.members.filter(m=>m.uid!==u.id);

if(!gr.members.length){set(LS.gr,groups.filter(x=>x.id!==id))}else set(LS.gr,groups);

if(CUR.grpId===id)CUR.grpId=null;

toast('已退出群組');vGroup();

}

function grDissolve(id){

const u=me();const groups=get(LS.gr,[]);const gr=groups.find(x=>x.id===id);

if(!gr)return;

const actor=gr.members.find(m=>m.uid===u.id);

if(!actor||actor.role!=='admin')return toast('⚠️ 只有群組管理員可解散群組','bad');

if(!confirm('💥 確定解散群組「'+gr.name+'」？所有成員、聊天記錄與公告將一併清除！'))return;

set(LS.gr,groups.filter(x=>x.id!==id));

if(CUR.grpId===id)CUR.grpId=null;

toast('💥 群組��'+gr.name+'」已解散');vGroup();

}

/* ════════ 班級作業（#6 題目ID修復）════════ */

/* ════════════════════════════════════════════
   vHomework 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 6 個單位：vHomework, hwSeed, hwShuffle, hwShowNum, hwGuardOff, hwForStudent
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vHomework 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vHomework, hwForStudent
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vHomework 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vHomework, hwForStudent
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vHomework 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vHomework, hwForStudent
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vHomework 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vHomework, hwForStudent
   ════════════════════════════════════════════ */
async function vHomework(){
  if(!await needJs(['js/views/vHomework.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vHomework();
}









function hwSeed(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}

function hwShuffle(arr,rng){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));const t=a[i];a[i]=a[j];a[j]=t}return a}

function hwShowNum(o,sh){return sh?(parseInt(String(o).trim(),10)+sh):o}

function hwGuardOff(){if(window._hwCtx){document.removeEventListener('contextmenu',window._hwCtx,true);window._hwCtx=null}if(window._hwCopy){document.removeEventListener('copy',window._hwCopy,true);document.removeEventListener('selectstart',window._hwCopy,true);window._hwCopy=null}if(window._hwBlur){window.removeEventListener('blur',window._hwBlur);document.removeEventListener('visibilitychange',window._hwBlur);window._hwBlur=null}const wm=document.getElementById('hwWatermark');if(wm)wm.remove();}



/* ── 作業防作弊：每學生專屬變體（題序/選項/數字皆不同）＋浮水印＋離窗警示 ── */
function hwRng(seed){let s=seed>>>0;return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hwVariant(h,u){ /* 以「學生+作業」為種子，產生固定變體：題序、選項排列、整數選項平移 */
  const rng=hwRng(hwSeed((u.username||u.id||'')+'|'+h.id));
  const order=hwShuffle(h.questions.map((q,i)=>i),rng);
  const opts={},shift={};
  h.questions.forEach(q=>{
    const n=(q['選項']||[]).length;
    opts[q.id]=hwShuffle([...Array(n).keys()],rng);
    const nums=(q['選項']||[]).map(o=>/^-?\d+$/.test(String(o).trim())?parseInt(String(o).trim(),10):null);
    if(nums.length&&nums.every(x=>x!==null)){const off=Math.floor(rng()*21)-10;if(off!==0)shift[q.id]=off;}
  });
  return{order,opts,shift};
}
let hwBlurCount=0;
function hwGuardOn(){window._hwCtx=(e)=>e.preventDefault();document.addEventListener('contextmenu',window._hwCtx,true);window._hwCopy=(e)=>e.preventDefault();document.addEventListener('copy',window._hwCopy,true);document.addEventListener('selectstart',window._hwCopy,true);
  window._hwBlur=()=>{hwBlurCount++;if(hwBlurCount===1)toast('⚠️ 離開視窗已記錄（第 '+hwBlurCount+' 次）','bad');if(hwBlurCount>=3)toast('⚠️ 已離窗 '+hwBlurCount+' 次，老師將看到紀錄！','bad')};
  window.addEventListener('blur',window._hwBlur);document.addEventListener('visibilitychange',window._hwBlur);
  const u=me();let wm=document.getElementById('hwWatermark');if(!wm){wm=document.createElement('div');wm.id='hwWatermark';wm.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;display:flex;align-items:center;justify-content:center;transform:rotate(-22deg);font-size:26px;font-weight:900;color:rgba(120,140,200,.10);letter-spacing:6px;user-select:none';document.body.appendChild(wm);}
  wm.textContent='🔒 '+((u&&(u.name||u.username))||'')+'｜'+new Date().toLocaleString('zh-TW')+'｜禁止截圖分享';
}

function hwDo(id){

const h=get(LS.hw,[]).find(x=>x.id===id);if(!h)return;

/* #6 確保每題都有唯一 id（舊資料可能缺 id，這裡補上）*/

h.questions.forEach(q=>{if(!q.id)q.id=newQid()});

CUR.hw={id,ans:{},ansV:{},cur:0};
hwBlurCount=0;
const u=me();
CUR.hw.variant=hwVariant(h,u); /* 🛡 每學生專屬變體 */
hwGuardOn(); /* 🛡 浮水印＋禁止複製/右鍵＋離窗紀錄 */

renderHwQ(h);

}

function renderHwQ(h){

const st=CUR.hw;const qid=h.questions[st.variant.order[st.cur]].id;const q=h.questions.find(x=>x.id===qid);const L=['A','B','C','D'];
const vp=st.variant.opts[qid]||[];const sh=st.variant.shift[qid]||0;

$('#view').innerHTML=

  (h.pdf?'<div class="pdfWrap"><div><b style="color:var(--teal);font-size:13px">📎 PDF 教材預覽</b>'+

  '<iframe src="'+h.pdf.dataUrl+'" title="PDF 教材"></iframe></div><div>':'')+

'<h3 class="vt">✏️ '+esc(h.title)+' <span class="vsub">第 '+(st.cur+1)+'/'+h.questions.length+' 題</span></h3>'+

'<div class="panel2" style="margin-bottom:10px;font-size:12px;color:var(--mut);border-left:4px solid var(--teal)">🔒 此作業已為你產生<b>專屬變體</b>（題序、選項、數字皆與他人不同）· 離窗 '+(hwBlurCount||0)+' 次</div>'+

'<div class="panel2 qCard"><div class="qStem">'+esc(q['題目'])+'</div></div>'+

vp.map((origIdx,d)=>'<button class="optBtn '+(st.ansV[qid]===d?'sel':'')+'" onclick="hwPick('+d+')">('+L[d]+') '+esc(String(hwShowNum(q['選項'][origIdx],sh)))+'</button>').join('')+

'<div style="display:flex;gap:10px;margin-top:10px">'+

(st.cur>0?'<button class="btn ghost" onclick="hwPrev()">⬅ 上一題</button>':'')+

(st.cur<h.questions.length-1?'<button class="btn" onclick="hwNext()">下一題 ➡</button>'

:'<button class="btn big" onclick="hwSubmit()">📤 提交作業</button>')+'</div>'+

(h.pdf?'</div></div>':'');

}

function hwPick(i){const h=get(LS.hw,[]).find(x=>x.id===CUR.hw.id);const st=CUR.hw;const qid=h.questions[st.variant.order[st.cur]].id;const origIdx=(st.variant.opts[qid]||[])[i];st.ans[qid]=origIdx;st.ansV[qid]=i;renderHwQ(h)}

function hwPrev(){const h=get(LS.hw,[]).find(x=>x.id===CUR.hw.id);CUR.hw.cur--;renderHwQ(h)}

function hwNext(){const h=get(LS.hw,[]).find(x=>x.id===CUR.hw.id);CUR.hw.cur++;renderHwQ(h)}

function hwSubmit(){

const u=me();const st=CUR.hw;hwGuardOff();

const subs=get(LS.sub,[]);

if(subs.some(s=>s.hwId===st.id&&s.studentId===u.id))return toast('⚠️ 已提交過','bad');

subs.push({id:'s'+Date.now(),hwId:st.id,studentId:u.id,answers:st.ans,answersV:st.ansV,variant:st.variant,blurCount:hwBlurCount,submittedAt:Date.now()});

/* 📝 作業作答也記入學習紀錄（供老師依【作業】模式篩選）*/

try{const h=get(LS.hw,[]).find(x=>x.id===st.id);if(h){u.g.answerLog=u.g.answerLog||[];

h.questions.forEach(q=>{const sel=st.ans[q.id];if(sel==null)return;const ok=sel===q['答案'];

u.g.answerLog.push({sub:q['科目']||h.subject||'作業',unit:h.title||'',stem:String(q['題目']||'').slice(0,120),sel:q['選項']&&q['選項'][sel]!=null?String(q['選項'][sel]).slice(0,40):'',ans:q['選項']&&q['選項'][q['答案']]!=null?String(q['選項'][q['答案']]).slice(0,40):'',calc:false,calcText:'',ok:ok,sec:null,mode:'作業',t:Date.now()})});

if(u.g.answerLog.length>80)u.g.answerLog=u.g.answerLog.slice(-80);saveU(u)}}catch(e){}

set(LS.sub,subs);toast('📤 作業已提交，等待老師批改！');vHomework();

}

function hwViewGrade(id){

const u=me();const h=get(LS.hw,[]).find(x=>x.id===id);

const my=get(LS.sub,[]).find(s=>s.hwId===id&&s.studentId===u.id);if(!my)return;

const L=['A','B','C','D'];

$('#view').innerHTML=back('vHomework()')+'<h3 class="vt">📝 '+esc(h.title)+' 批改結果</h3>'+

'<div class="panel2" style="margin-bottom:12px"><b style="font-size:20px;color:var(--green)">得分：'+my.score+' / '+h.totalPts+'</b>'+

'<p style="font-size:13.5px;margin-top:6px;color:var(--gold2)">💬 老師評語：'+esc(my.feedback||'（無評語）')+'</p></div>'+

h.questions.map(q=>{const sel=my.answers[q.id];const ok=sel===q['答案'];const myV=my.answersV&&my.answersV[q.id]!=null?my.answersV[q.id]:sel;const sh=my.variant&&my.variant.shift?my.variant.shift[q.id]:0;const showTxt=my.answersV&&my.answersV[q.id]!=null?String(hwShowNum(q['選項'][sel],sh)):String(q['選項'][sel]);

return '<div class="panel2" style="margin-bottom:8px"><div style="font-size:14px">'+(ok?'✅':'❌')+' '+esc(q['題目'])+'</div>'+

'<div style="font-size:12.5px;margin-top:4px;color:'+(ok?'var(--green)':'#ff8a80')+'">你的答案：('+L[myV]+') '+esc(showTxt)+'</div>'+

(!ok?'<div style="font-size:12.5px;color:var(--green)">正確答案：('+L[q['答案']]+') '+esc(q['選項'][q['答案']])+'</div>':'')+'</div>'}).join('');

}
