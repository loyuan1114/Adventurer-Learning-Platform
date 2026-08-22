/* ════════ 影片專區：影片已全部內嵌於同層的「影片專區.html」，不再依賴影片資料夾 ════════ */

const VIDEO_HUB='videos.html'; /* 影片專區（自架部署改用 ASCII 檔名）*/


/* ════════════════════════════════════════════
   vVideos 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：VIDEO_SUBJ, vVideos
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vVideos 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：VIDEO_SUBJ, vVideos
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vVideos 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：VIDEO_SUBJ, vVideos
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vVideos 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：VIDEO_SUBJ, vVideos
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vVideos 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：VIDEO_SUBJ, vVideos
   ════════════════════════════════════════════ */

async function vVideos(){
  if(!await needJs(['js/views/vVideos.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vVideos();
}
/* 直接播放影片（不經過 vVideoSub，直接顯示影片列表）*/
async function vVideosDirect(){
  if(!await needJs(['js/views/vVideos.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vVideos();
}






/* ════════════════════════════════════════════
   vVideoSub 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：showRewardFX, vVideoSub, grantRw
   ════════════════════════════════════════════ */
function showRewardFX(rewards){const icons={gold:'💰',crystal:'💎',diamond:'💠',starlight:'✨',honor:'🏅',quizPts:'📝',enhStone:'⚒️',ironOre:'⛏️',labMat:'🧪'};let delay=0;Object.entries(rewards).forEach(([k,v])=>{if(v&&v>0&&icons[k]){setTimeout(()=>{const el=document.createElement('span');el.style.cssText='position:fixed;font-size:24px;pointer-events:none;z-index:200;left:'+(30+Math.random()*40)+'vw;top:10vh;animation:rewardDrop .8s ease-out forwards';el.textContent=icons[k]+' +'+v;document.body.appendChild(el);setTimeout(()=>el.remove(),1200)},delay);delay+=150}})}

/* ════════════════════════════════════════════
   vVideoSub 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vVideoSub
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vVideoSub 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vVideoSub
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vVideoSub 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vVideoSub
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vVideoSub 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vVideoSub
   ════════════════════════════════════════════ */
async function vVideoSub(subj){
  if(!await needJs(['js/views/vVideoSub.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vVideoSub(subj);
}





function grantRw(g,rw){if(rw.gold)g.gold+=rw.gold;if(rw.crystal)g.crystal+=rw.crystal;if(rw.diamond)g.diamond+=rw.diamond;

if(rw.starlight)g.starlight+=rw.starlight;if(rw.ironOre)g.ironOre+=rw.ironOre;if(rw.enhStone)g.enhStone+=rw.enhStone;

if(rw.labMat)g.labMat+=rw.labMat;if(rw.honor)g.honor+=rw.honor;if(rw.quizPts)g.quizPts+=rw.quizPts;showRewardFX(rw)}


function openVideoHub(){
var old=document.getElementById('vidOv');if(old)old.remove();
var ov=document.createElement('div');ov.id='vidOv';ov.style.cssText='position:fixed;inset:0;z-index:300;background:rgba(5,9,18,.96);display:flex;flex-direction:column';
ov.innerHTML='<div style="display:flex;gap:10px;align-items:center;padding:8px 14px;background:#0a101e;border-bottom:1px solid var(--goldD)"><b style="color:var(--gold2);font-family:var(--serif)">🎬 影片專區 — 八大領域目錄</b>'+
'<a href="'+VIDEO_HUB+'" target="_blank" style="color:#7ff0dd;font-size:12.5px;margin-left:auto">在新分頁開啟 ↗</a>'+
'<button class="btn danger mini" onclick="closeVideoOv()">✕ 關閉</button></div>'+
'<iframe src="'+VIDEO_HUB+'" style="flex:1;border:0;width:100%;background:#0d1526"></iframe>';
document.body.appendChild(ov);
}

function openVideoT(s,sem,t){

const rel=VIDEO_HUB+'#'+encodeURIComponent(s+'/'+sem+'/'+t); /* 以 hash 指定單元，由內嵌版影片總集直接播放 */

window._vidWatch={key:s+'/'+sem+'/'+t,t0:Date.now()}; /* 記錄開始觀看時間，看滿 60 秒關閉可領獎勵 */

const old=document.getElementById('vidOv');if(old)old.remove();

const ov=document.createElement('div');ov.id='vidOv';ov.style.cssText='position:fixed;inset:0;z-index:300;background:rgba(5,9,18,.96);display:flex;flex-direction:column';

ov.innerHTML='<div style="display:flex;gap:10px;align-items:center;padding:8px 14px;background:#0a101e;border-bottom:1px solid var(--goldD)"><b style="color:var(--gold2);font-family:var(--serif)">🎬 '+s+'・'+sem+'・'+t+'</b>'+

'<a href="'+rel+'" target="_blank" style="color:#7ff0dd;font-size:12.5px;margin-left:auto">在新分頁開啟 ↗</a>'+

'<button class="btn danger mini" onclick="closeVideoOv()">✕ 關閉</button></div>'+

'<iframe src="'+rel+'" style="flex:1;border:0;width:100%;background:#0d1526"></iframe>';

document.body.appendChild(ov);

}

function closeVideoOv(){ /* 關閉播放器：看滿 60 秒發放觀看獎勵（每部 1 次、每日 3 部） */

const ov=document.getElementById('vidOv');if(ov)ov.remove();

const w=window._vidWatch;window._vidWatch=null;if(!w)return;

const u=me();if(!u||!u.g)return;const g=u.g;

if(Date.now()-w.t0<60000)return; /* 未看滿 60 秒不發獎 */

g.video=g.video&&g.video.watched?g.video:{date:'',count:0,watched:[]};

if(g.video.date!==today()){g.video.date=today();g.video.count=0}

if(g.video.watched.includes(w.key))return;

if(g.video.count>=3)return toast('🎬 今日影片獎勵已達上限（3 部），明天再來！','bad');

g.video.count++;g.video.watched.push(w.key);if(g.video.watched.length>300)g.video.watched=g.video.watched.slice(-300);

grantRw(g,{gold:30,crystal:10,labMat:3});saveU(u);hud();

toast('🎁 觀看獎勵：🪙+30 💠+10 🧪+3（今日 '+g.video.count+'/3）');

if(document.querySelector('#view .vt'))vVideos&&$('#view').innerHTML.includes('影片專區')&&vVideos();

}

/* ════════ 📸 限時動態：照片/文字、24 小時自動消失、可選僅好友或所有人可見 ════════ */

function myFriendIds(uid){return get(LS.fr,[]).filter(f=>f.status==='accepted'&&(f.a===uid||f.b===uid)).map(f=>f.a===uid?f.b:f.a)}

function storyList(){

const u=me(),now=Date.now();const fr=myFriendIds(u.id);

return get(LS.stories,[]).filter(s=>now-s.t<86400000) /* 24h 內 */

.filter(s=>s.uid===u.id||s.vis==='all'||(s.vis==='friends'&&fr.includes(s.uid))||(s.vis==='bff'&&(profOf(s.uid).bff||[]).includes(u.id))) /* 可見範圍過濾（含摯友） */

.sort((a,b)=>b.t-a.t)}

/* 🔔 通知系統：點讚等互動時推播給對方，雲端同步全服 */

function notifPush(to,txt){const ns=get(LS.notif,[]);ns.push({id:'n'+Date.now()+Math.floor(Math.random()*1e4),to,txt,t:Date.now(),read:false});set(LS.notif,ns.slice(-300))}

function myNotifs(){const u=me();return get(LS.notif,[]).filter(n=>n.to===u.id).sort((a,b)=>b.t-a.t)}

function unreadNotifs(){return myNotifs().filter(n=>!n.read).length}

/* 📬 信箱系統：排行榜獎勵每日 21:00 自動發到信箱（含可領取獎勵）*/



/* 每日 21:00 後首次上線：依五大榜單即時排名，前 3 名的獎勵寄到信箱 */

function deliverRankMail(){

const u=me();if(!u||u.role!=='student')return;const g=u.g;const d=today();

if(new Date().getHours()<21)return; /* 未到 21:00 */

if(g.rankMailDate===d)return; /* 今日已發放 */

g.rankMailDate=d;let cnt=0;

for(const b of ['答題','等級','連擊','收藏','戰力']){

const e=lb(g,b).find(x=>x.me);const r=e?e.rank:99;

if(r<=3){addMail(g,'🏆 '+b+'榜・第 '+r+' 名獎勵','恭喜！你在今日「'+b+'」排行榜獲得第 '+r+' 名，點下方領取獎勵！',RANK_RW[r]);cnt++}

}

if(cnt){saveU(u);setTimeout(()=>toast('📩 收到 '+cnt+' 封排行榜獎勵信件（社群中心→信箱）'),1200)}else saveU(u);

}
function checkArenaDailyMail(){
  try{
    const u=me();if(!u||u.role!=='student')return;const g=u.g;
    const arr=get('ADV9_ARENA_MAIL',null);if(!arr||!arr.length)return;
    const d=today();if(g.arenaMailDate===d)return;
    const rec=arr.find(x=>x.username===u.username);if(!rec||!rec.rw)return;
    addMail(g,'🏆 PK無限競技塔 每日排名獎勵（第 '+rec.rank+' 名）','你在今日無限競技塔排名獲得第 '+rec.rank+' 名（最高第 '+(rec.floor||1)+' 層），獎勵已送達，點下方領取！',rec.rw);
    g.arenaMailDate=d;saveU(u);
  }catch(e){}
}

/* ════════════════════════════════════════════
   vMail 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMail
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMail 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMail
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMail 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMail
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMail 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMail
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMail 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMail
   ════════════════════════════════════════════ */
async function vMail(){
  if(!await needJs(['js/views/vMail.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vMail();
}






function claimMail(id){
const u=me(),g=u.g;const m=(g.mail||[]).find(x=>x.id===id);
if(!m||m.claimed||!m.rw)return;
m.claimed=true;grantRw(g,m.rw);saveU(u);hud();toast('🎁 獎勵已領取！');
if(typeof vMail==='function')vMail();
}

/* ════════════════════════════════════════════
   vNotifs 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vNotifs
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vNotifs 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vNotifs
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vNotifs 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vNotifs
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vNotifs 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vNotifs
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vNotifs 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vNotifs
   ════════════════════════════════════════════ */
async function vNotifs(){
  if(!await needJs(['js/views/vNotifs.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vNotifs();
}






/* ❤️ 動態點讚：再點一次取消；對方會收到通知 */

function likeStory(id){

const u=me();const st=get(LS.stories,[]);const s=st.find(x=>x.id===id);if(!s)return;

s.likes=s.likes||{};

if(s.likes[u.id])delete s.likes[u.id];

else{s.likes[u.id]=u.name;if(s.uid!==u.id)notifPush(s.uid,'❤️ '+u.name+' 讚了你的限時動態'+(s.text?'：「'+s.text.slice(0,14)+(s.text.length>14?'…':'')+'」':''))}

set(LS.stories,st);vStory();

}

/* ════════════════════════════════════════════
   vStory 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vStory
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vStory 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vStory
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vStory 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vStory
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vStory 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vStory
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vStory 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vStory
   ════════════════════════════════════════════ */
async function vStory(){
  if(!await needJs(['js/views/vStory.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vStory();
}






function onStoryPhoto(inp){ /* ☁️ 優先上雲端（原圖、附進度條）；雲端未就緒時退回壓縮內嵌 */

const f=inp.files[0];if(!f)return;

if(f.size>MEDIA_MAX)return toast('⚠️ 檔案請小於 50MB','bad');

const mb=(f.size/1048576).toFixed(1),showProg=f.size>150*1024;

if(showProg)upProg(0,'☁️ 傳送中… 0%（'+mb+'MB）');

const okCb=src=>{if(showProg){upProg(100,'✅ 傳送完成');setTimeout(()=>upProg(null),450)}CUR.storyImg=src;CUR.storyVid=null;const tip=$('#stImgTip');if(tip)tip.textContent='✅ 已選照片';toast('📷 照片已加入，按發布送出')};

cloudUpload(f,okCb,()=>{ /* 退回：壓縮到最長邊 640px 內嵌，避免占滿儲存空間 */

upProg(null);

const r=new FileReader();

r.onload=e=>{const img=new Image();img.onload=()=>{

const mx=640,sc=Math.min(1,mx/Math.max(img.width,img.height));

const cv=document.createElement('canvas');cv.width=Math.round(img.width*sc);cv.height=Math.round(img.height*sc);

cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);

okCb(cv.toDataURL('image/jpeg',.66));

};img.src=e.target.result};

r.readAsDataURL(f);

},pct=>{if(showProg)upProg(pct,'☁️ 傳送中… '+pct+'%（'+mb+'MB）')});

}

function postStory(){

const u=me();const txt=sanitizeText($('#stTxt')?$('#stTxt').value.trim():'',300);const vis=$('#stVis')?$('#stVis').value:'all';

if(!txt&&!CUR.storyImg&&!CUR.storyVid)return toast('⚠️ 請輸入文字或選擇照片/影片','bad');

const now=Date.now();

const all=get(LS.stories,[]);all.filter(s=>now-s.t>=86400000).forEach(s=>{cloudDelete(s.img);cloudDelete(s.vid)}); /* 過期動態連雲端檔一併清除 */

const st=all.filter(s=>now-s.t<86400000);

st.push({id:'st'+now+Math.floor(Math.random()*1e4),uid:u.id,n:u.name,text:txt,img:CUR.storyImg||null,vid:CUR.storyVid||null,muted:!!($('#stMute')&&$('#stMute').checked),vis,t:now});

try{set(LS.stories,st.slice(-60))}catch(err){return toast('⚠️ 儲存空間不足，媒體太大','bad')} /* 最多保留 60 則 */

CUR.storyImg=null;CUR.storyVid=null;toast('📸 動態已發布（'+(vis==='friends'?'僅好友可見':vis==='bff'?'僅摯友可見':'所有人可見')+'）');vStory();

}

function onStoryVideo(inp){ /* 限時動態影片（可靜音）；☁️ 雲端上傳最大 50MB */

const f=inp.files[0];if(!f)return;

mediaUpload(f,src=>{CUR.storyVid=src;CUR.storyImg=null;const tip=$('#stImgTip');if(tip)tip.textContent='✅ 已選影片';toast('🎞 影片已加入，按發布送出')});

}

function delStory(id){

const u=me();const st=get(LS.stories,[]);const s=st.find(x=>x.id===id);

if(!s||s.uid!==u.id)return;

if(!confirm('收回這則動態？所有人都將看不到。'))return;

cloudDelete(s.img);cloudDelete(s.vid); /* 雲端檔一併刪 */

set(LS.stories,st.filter(x=>x.id!==id));toast('↩ 動態已收回');vStory();

}

/* ════════ 🛡️ 公會系統：創建/加入公會、捐獻升級、全會經驗加成、公會門征 ════════ */

function guildOf(g){const gid=g&&g.guildId;if(!gid)return null;return get(LS.guilds,[]).find(x=>x.id===gid)||null}


/* 公會商店：公會等級達標即可用公會幣兑寶箱（含物資與角色）*/

const GUILD_SHOP=[

{id:'gc1',name:'🪨 初級物資寶箱',reqLv:1,cost:30,mats:{gold:300,crystal:60,ironOre:15,enhStone:8},charTier:null},

{id:'gc2',name:'📦 中級物資寶箱',reqLv:3,cost:80,mats:{gold:800,crystal:150,starlight:15,labMat:15,enhStone:15},charTier:['R','SR']},

{id:'gc3',name:'🎁 高級物資寶箱',reqLv:5,cost:180,mats:{gold:2000,crystal:400,diamond:10,starlight:30,labMat:30},charTier:['SR','SSR']},

{id:'gc4',name:'💎 傳說公會寶箱',reqLv:8,cost:400,mats:{gold:5000,crystal:1000,diamond:30,starlight:60,labMat:60},charTier:['SSR','UR']}

];

function guildShopHtml(gd,g){const lv=gd.level||1,coin=g.guildCoin||0;

return '<div class="panel2" style="margin-bottom:12px;border-left:4px solid var(--gold)"><b style="color:var(--gold2);font-family:var(--serif)">🏪 公會商店</b> <span style="font-size:11.5px;color:var(--mut)">你的🪙公會幣 '+coin+'｜公會等級達標即可兑寶箱</span>'+

'<div style="font-size:11px;color:var(--mut);margin:4px 0 8px">🪙 公會幣獲得：在公會時每答對一題 +1｜捐獻公會每 50 金幣 +1</div>'+

GUILD_SHOP.map(s=>{const okLv=lv>=s.reqLv,okCoin=coin>=s.cost;const matTxt=Object.keys(s.mats).map(k=>({gold:'🪙',crystal:'💠',diamond:'💎',starlight:'✨',ironOre:'⛏️',enhStone:'🔩',labMat:'🧪'}[k]+s.mats[k])).join(' ');

return '<div class="panel2" style="margin-bottom:8px;'+(okLv?'':'opacity:.55')+'"><b>'+s.name+'</b> <span style="font-size:11px;color:var(--mut)">需公會 Lv.'+s.reqLv+'｜費🪙公會幣 '+s.cost+'</span>'+

'<div style="font-size:11.5px;color:var(--teal);margin-top:4px">'+matTxt+(s.charTier?'｜🧑 '+s.charTier.join('/')+' 隨機角色×1':'')+'</div>'+

(okLv?'<button class="btn '+(okCoin?'mini':'ghost mini dis')+'" style="margin-top:6px" onclick="openGuildChest(\''+s.id+'\')">'+(okCoin?'🎁 兑換':'🪙公會幣不足')+'</button>':'<div style="font-size:11.5px;color:#ff9d7a;margin-top:6px">🔒 公會達 Lv.'+s.reqLv+' 解鎖</div>')+'</div>'}).join('')+'</div>';

}

function openGuildChest(id){

const u=me(),g=u.g;const gd=guildOf(g);if(!gd)return;

const s=GUILD_SHOP.find(x=>x.id===id);if(!s)return;

if((gd.level||1)<s.reqLv)return toast('🔒 公會等級不足','bad');

if((g.guildCoin||0)<s.cost)return toast('🪙 公會幣不足（需 '+s.cost+'）','bad');

g.guildCoin-=s.cost;

for(const k in s.mats)g[k]=(Number(g[k])||0)+s.mats[k];

let gotChar='';

if(s.charTier){const rar=pick(s.charTier);const pool=Object.keys(CHARS).filter(n=>CHARS[n].r===rar);const name=pool.length?pick(pool):pick(Object.keys(CHARS));

if(!g.owned.character.includes(name))g.owned.character.push(name);gotChar=name+'（'+CHARS[name].r+'）'}

saveU(u);hud();

const matTxt=Object.keys(s.mats).map(k=>({gold:'🪙',crystal:'💠',diamond:'💎',starlight:'✨',ironOre:'⛏️',enhStone:'🔩',labMat:'🧪'}[k]+'+'+s.mats[k])).join(' ');

toast('🎁 '+s.name+' 開啟：'+matTxt+(gotChar?'｜🧑 '+gotChar:''));vGuild();

}

/* ════════ 📚 課本講解：115 年南一/翰林課本與課外考卷解析（網址，由管理員新增） ════════ */

/* ════════════════════════════════════════════
   vLearn 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLearn
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vLearn 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLearn
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vLearn 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLearn
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vLearn 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLearn
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vLearn 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLearn
   ════════════════════════════════════════════ */
async function vLearn(){
  if(!await needJs(['js/views/vLearn.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vLearn();
}






function openLearnUrl(id){

const b=get(LS.books,[]).find(x=>x.id===id);if(!b)return;

const old=document.getElementById('vidOv');if(old)old.remove();

const ov=document.createElement('div');ov.id='vidOv';ov.style.cssText='position:fixed;inset:0;z-index:300;background:rgba(5,9,18,.96);display:flex;flex-direction:column';

ov.innerHTML='<div style="display:flex;gap:10px;align-items:center;padding:8px 14px;background:#0a101e;border-bottom:1px solid var(--goldD)"><b style="color:var(--gold2);font-family:var(--serif)">📚 '+esc(b.publisher)+'・'+esc(b.type)+(b.subject?'・'+esc(b.subject):'')+'・'+esc(b.title)+'</b>'+

'<a href="'+encodeURI(b.url)+'" target="_blank" style="color:#7ff0dd;font-size:12.5px;margin-left:auto">在新分頁開啟 ↗</a>'+

'<button class="btn danger mini" onclick="document.getElementById(\'vidOv\').remove()">✕ 關閉</button></div>'+

'<iframe src="'+encodeURI(b.url)+'" style="flex:1;border:0;width:100%;background:#0d1526" onerror=""></iframe>'+

'<div style="padding:6px 14px;background:#0a101e;font-size:11.5px;color:var(--mut)">若畫面空白，表示該網站不允許內嵌，請點右上「在新分頁開啟」觀看。</div>';

document.body.appendChild(ov);

}

/* ════════════════════════════════════════════
   vGuild 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：GUILD_NEED, vGuild
   ════════════════════════════════════════════ */
const GUILD_NEED=lv=>lv*1000; /* 升級所需捐獻金幣＝等級×1000 */

/* ════════════════════════════════════════════
   vGuild 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGuild
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGuild 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGuild
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGuild 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGuild
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGuild 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGuild
   ════════════════════════════════════════════ */
async function vGuild(){
  if(!await needJs(['js/views/vGuild.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vGuild();
}






function guildCreate(){

const u=me(),g=u.g;const nm=($('#gdName')?$('#gdName').value.trim():'');

if(!nm)return toast('⚠️ 請輸入公會名稱','bad');

if(g.guildId)return toast('⚠️ 你已在公會中','bad');

if(g.gold<500)return toast('🪙 金幣不足（需 500）','bad');

g.gold-=500;

const guilds=get(LS.guilds,[]);const id='gd'+Date.now()+Math.floor(Math.random()*1e4);

guilds.push({id,name:nm,leader:u.id,members:[u.id],level:1,fund:0,contrib:{[u.id]:0},msgs:[],t:Date.now()});

set(LS.guilds,guilds);g.guildId=id;saveU(u);hud();toast('🛡️ 公會「'+nm+'」創建成功！');vGuild();

}

function guildJoin(id){

const u=me(),g=u.g;if(g.guildId)return toast('⚠️ 你已在公會中，請先退出','bad');

const guilds=get(LS.guilds,[]);const gd=guilds.find(x=>x.id===id);if(!gd)return;

if(gd.members.includes(u.id))return;

gd.members.push(u.id);gd.contrib=gd.contrib||{};gd.contrib[u.id]=gd.contrib[u.id]||0;

set(LS.guilds,guilds);g.guildId=id;saveU(u);hud();toast('🛡️ 已加入公會！');vGuild();

}

function guildDonate(){

const u=me(),g=u.g;const gd=guildOf(g);if(!gd)return;

const n=Math.floor(+($('#gdDon')?$('#gdDon').value:0)||0);

if(n<10)return toast('⚠️ 捐獻至少 10 金幣','bad');

if(g.gold<n)return toast('🪙 金幣不足','bad');

g.gold-=n;

const guilds=get(LS.guilds,[]);const G=guilds.find(x=>x.id===gd.id);

G.fund=(G.fund||0)+n;G.contrib=G.contrib||{};G.contrib[u.id]=(G.contrib[u.id]||0)+n;

let ups=0;while(G.fund>=GUILD_NEED(G.level||1)){G.fund-=GUILD_NEED(G.level||1);G.level=(G.level||1)+1;ups++} /* 捐滿自動升級，無上限 */

const coin=Math.floor(n/50);if(coin>0)g.guildCoin=(g.guildCoin||0)+coin; /* 捐獻回饋公會幣：每 50 金幣 +1 */

set(LS.guilds,guilds);saveU(u);hud();

toast((ups?'🎉 公會升級到 Lv.'+G.level+'！':'💰 已捐獻 '+n+' 金幣')+(coin>0?'｜🪙公會幣+'+coin:''));vGuild();

}

function guildSend(){

const u=me(),g=u.g;const gd=guildOf(g);if(!gd)return;

const txt=$('#gdMsg')?$('#gdMsg').value.trim():'';if(!txt)return;

const guilds=get(LS.guilds,[]);const G=guilds.find(x=>x.id===gd.id);

G.msgs=G.msgs||[];G.msgs.push({from:u.id,text:txt,t:Date.now()});if(G.msgs.length>200)G.msgs=G.msgs.slice(-200);

set(LS.guilds,guilds);$('#gdMsg').value='';

const b=$('#gdBox');if(b){b.innerHTML=G.msgs.map(m=>pmRow(m,u.id)).join('');b.scrollTop=b.scrollHeight;}

}

function guildLeave(){

const u=me(),g=u.g;const gd=guildOf(g);if(!gd)return;

if(gd.leader===u.id)return toast('⚠️ 會長請使用「解散公會」或先轉讓','bad');

if(!confirm('確定退出公會？'))return;

const guilds=get(LS.guilds,[]);const G=guilds.find(x=>x.id===gd.id);

G.members=G.members.filter(x=>x!==u.id);

set(LS.guilds,guilds);g.guildId=null;saveU(u);hud();toast('🚪 已退出公會');vGuild();

}

function guildKick(uid){

const u=me(),g=u.g;const gd=guildOf(g);if(!gd||gd.leader!==u.id)return;

if(!confirm('踢出該會員？'))return;

const guilds=get(LS.guilds,[]);const G=guilds.find(x=>x.id===gd.id);

G.members=G.members.filter(x=>x!==uid);

set(LS.guilds,guilds);

const tu=get(LS.users,[]).find(x=>x.id===uid);if(tu&&tu.g){tu.g.guildId=null;saveU(tu)}

toast('👢 已踢出會員');vGuild();

}

function guildDisband(){

const u=me(),g=u.g;const gd=guildOf(g);if(!gd||gd.leader!==u.id)return;

if(!confirm('確定解散公會？所有會員將退出，此操作無法復原。'))return;

const us=get(LS.users,[]);gd.members.forEach(uid=>{const mu=us.find(x=>x.id===uid);if(mu&&mu.g)mu.g.guildId=null});set(LS.users,us);

set(LS.guilds,get(LS.guilds,[]).filter(x=>x.id!==gd.id));

const me2=get(LS.users,[]).find(x=>x.id===u.id);toast('💥 公會已解散');vGuild();

}

/* ════════ ⚔️ 公會 PVP ════════ */

function guildPvp(){
  const u=me(),g=u.g;const gd=guildOf(g);if(!gd)return toast("⚠️ 你尚未加入公會","bad");
  const guilds=get(LS.guilds,[]);const otherGuilds=guilds.filter(x=>x.id!==gd.id);
  if(!otherGuilds.length)return toast("⚠️ 目前沒有其他公會可供挑戰","bad");
  const myPower=power(g);
  const oppHtml=otherGuilds.sort((a,b)=>(b.members.length||0)-(a.members.length||0)).map(x=>{
    const avgLv=x.members.reduce((s,m)=>{const mu=get(LS.users,[]).find(y=>y.id===m);return s+(mu&&mu.g?mu.g.lv:0)},0)/(x.members.length||1);
    return '<div class="panel2 frIt"><b style="flex:1">⚔️ '+esc(x.name)+'</b><span style="font-size:11px;color:var(--mut)">'+x.members.length+' 人｜均 Lv.'+Math.round(avgLv)+'</span><button class="btn mini" onclick="guildPvpChallenge(\''+x.id+'\')">挑戰</button></div>';
  }).join('');
  $('#view').innerHTML=back('vGuild()')+'<h3 class="vt">⚔️ 公會 PVP <span class="vsub">你的戰力 ⚡'+myPower+'｜選擇一個公會發起挑戰</span></h3>'+
    '<div class="panel2" style="margin-bottom:12px;font-size:12.5px;color:var(--gold2)">⚔️ 公會 PVP：與其他公會進行對戰！勝利獎勵 🪙200 ✨50 XP</div>'+
    oppHtml;
}

function guildPvpChallenge(oppId){
  const u=me(),g=u.g;const gd=guildOf(g);if(!gd)return;
  const guilds=get(LS.guilds,[]);const opp=guilds.find(x=>x.id===oppId);if(!opp)return;
  const myPower=power(g);const oppPower=opp.members.reduce((s,m)=>{const mu=get(LS.users,[]).find(y=>y.id===m);return s+(mu&&mu.g?power(mu.g)||0:0)},0)/(opp.members.length||1);
  const winChance=Math.max(0.2,Math.min(0.8,myPower/(myPower+oppPower)));
  openModal('<h3 class="mt">⚔️ 挑戰 '+esc(opp.name)+'</h3>'+
    '<p class="msub">你的戰力 ⚡'+myPower+' vs 對方均戰力 ⚡'+Math.round(oppPower)+'</p>'+
    '<div style="text-align:center;margin:14px 0">'+
    '<span style="font-size:14px;color:var(--mut)">勝利機率: '+Math.round(winChance*100)+'%</span><br>'+
    '<span style="font-size:12px;color:var(--green);margin-top:4px;display:block">勝 → 🪙200 + ✨50 XP</span><br>'+
    '<span style="font-size:12px;color:var(--red);margin-top:2px;display:block">敗 → 無懲罰</span>'+
    '</div>'+
    '<div class="mBtns">'+
    '<button class="btn ghost" onclick="closeModal()">取消</button>'+
    '<button class="btn danger" onclick="doGuildPvp(\''+oppId+'\')">⚔️ 開始挑戰</button>'+
    '</div>');
}

function doGuildPvp(oppId){
  const u=me(),g=u.g;const gd=guildOf(g);if(!gd)return;
  const guilds=get(LS.guilds,[]);const opp=guilds.find(x=>x.id===oppId);if(!opp)return;
  const myPower=power(g);const oppPower=opp.members.reduce((s,m)=>{const mu=get(LS.users,[]).find(y=>y.id===m);return s+(mu&&mu.g?power(mu.g)||0:0)},0)/(opp.members.length||1);
  const winChance=Math.max(0.2,Math.min(0.8,myPower/(myPower+oppPower)));
  const won=Math.random()<winChance;
  if(won){
    g.gold+=200;g.xp+=50;
    while(g.xp>=g.needXp&&g.lv<effMaxLv()){g.xp-=g.needXp;g.lv++;g.needXp=CFG.needXp(g.lv)}
    saveU(u);hud();
    toast('🏆 公會 PVP 勝利！對手：'+esc(opp.name)+'｜🪙+200 ✨+50 XP','success');
  }else{
    toast('💀 公會 PVP 落敗…對手：'+esc(opp.name)+'。下次挑戰！');
  }
  closeModal();vGuild();
}
