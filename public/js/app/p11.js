/* ════════ 錯題/統計/設定/世界頻道/公告 ════════ */

/* ════════════════════════════════════════════
   vWrong 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vWrong
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vWrong 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vWrong
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vWrong 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vWrong
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vWrong 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vWrong
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vWrong 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vWrong
   ════════════════════════════════════════════ */
async function vWrong(){
  if(!await needJs(['js/views/vWrong.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vWrong();
}






function retryQ(s,i){

const g=me().g,w=g.wrong[s][i];

qReset();Quiz.mode='retry';Quiz.retrySubj=s;Quiz.retryIdx=i;Quiz.subj=s;Quiz.sem='';Quiz.unit='錯題重練';Quiz.diff=50;

Quiz.q=JSON.parse(JSON.stringify(w.q));Quiz.q.id=newQid();Quiz.sel=null;Quiz.t0=Date.now();Quiz.phase='ANSWERING';

vQuestion();

}

/* ════════════════════════════════════════════
   vStats 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vStats
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vStats 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vStats
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vStats 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vStats, langStatsHtml
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vStats 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vStats, langStatsHtml
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vStats 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vStats, langStatsHtml
   ════════════════════════════════════════════ */
async function vStats(){
  if(!await needJs(['js/views/vStats.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vStats();
}











/* ── 背景音樂播放器（教師把 mp3/ogg 放 media/music/，學生可選曲 + YouTube）── */
function loadMusicList(cb){if(!WTOKEN){if(cb)cb([]);return}fetch(SUPA_URL+'/rest/v1/media/music',{headers:{'x-adv9-token':WTOKEN}}).then(r=>r.ok?r.json():[]).then(l=>{MUSIC.list=l||[];if(cb)cb(l||[])}).catch(()=>{MUSIC.list=[];if(cb)cb([])})}
function playMusic(){if(!MUSIC.audio||!MUSIC.list.length)return;const f=MUSIC.list[MUSIC.idx];if(!f)return;MUSIC.audio.src=SUPA_URL+'/storage/v1/object/public/media/music/'+encodeURIComponent(f);MUSIC.audio.play().catch(()=>{});saveMusicPref()}
function musicPlay(){
  musicInit();
  /* 先嘗試 server 音樂 */
  if(MUSIC.list.length===0){
    loadMusicList(function(){
      if(MUSIC.list.length){
        if(MUSIC.idx<0)MUSIC.idx=0;playMusic();toast('🎵 開始播放：'+MUSIC.list[MUSIC.idx]);
      }else{
        /* 也嘗試 YouTube 清單 */
        var ytLinks=get(LS.musicLinks,[]);
        if(Array.isArray(ytLinks)&&ytLinks.length>0){
          MUSIC.yt=ytLinks;if(MUSIC.ytIdx===undefined||MUSIC.ytIdx<0)MUSIC.ytIdx=0;
          openYtPlayer(ytLinks[MUSIC.ytIdx].url);
        }else{toast('⚠️ 尚無音樂。請上傳 MP3 或新增 YouTube 連結','bad');}
      }
    });return;
  }
  if(MUSIC.idx<0)MUSIC.idx=0;playMusic();toast('🎵 開始播放：'+MUSIC.list[MUSIC.idx]);
}
function musicStop(){if(MUSIC.audio){MUSIC.audio.pause();MUSIC.audio.currentTime=0}MUSIC.idx=-1;saveMusicPref();toast('⏹ 音樂已停止')}
function musicNext(){
  /* 優先 server 音樂 */
  if(MUSIC.list.length){
    if(!MUSIC.list.length){loadMusicList(musicNext);return}
    MUSIC.idx=(MUSIC.idx+1)%MUSIC.list.length;playMusic();toast('🎵 '+MUSIC.list[MUSIC.idx]);
  }else{
    /* fallback YouTube */
    var ytLinks=get(LS.musicLinks,[]);
    if(Array.isArray(ytLinks)&&ytLinks.length){
      MUSIC.ytIdx=((MUSIC.ytIdx||0)+1)%ytLinks.length;
      openYtPlayer(ytLinks[MUSIC.ytIdx].url);
    }
  }
}
function musicPrev(){
  if(MUSIC.list.length){
    if(!MUSIC.list.length){loadMusicList(musicPrev);return}
    MUSIC.idx=(MUSIC.idx-1+MUSIC.list.length)%MUSIC.list.length;playMusic();toast('🎵 '+MUSIC.list[MUSIC.idx]);
  }else{
    var ytLinks=get(LS.musicLinks,[]);
    if(Array.isArray(ytLinks)&&ytLinks.length){
      MUSIC.ytIdx=((MUSIC.ytIdx||0)-1+ytLinks.length)%ytLinks.length;
      openYtPlayer(ytLinks[MUSIC.ytIdx].url);
    }
  }
}
function musicPick(v){musicInit();MUSIC.idx=parseInt(v,10);if(MUSIC.idx>=0)playMusic();else musicStop()}
/* 管理員 MP3 上傳 */
function adminUploadMp3(){
  var input=document.getElementById('mp3UploadInput');if(!input)return;
  var file=input.files[0];if(!file)return toast('請先選擇 MP3 檔案','bad');
  if(!file.name.match(/\.(mp3|ogg|wav|flac|m4a|opus)$/i))return toast('不支援的格式，請上傳 mp3/ogg/wav/flac','bad');
  if(file.size>20*1024*1024)return toast('檔案過大（最大 20MB）','bad');
  toast('⏳ 上傳中...');
  var reader=new FileReader();
  reader.onload=function(e){
    var data=new Uint8Array(e.target.result);
    fetch(SUPA_URL+'/storage/v1/object/public/media/music/'+encodeURIComponent(file.name),{
      method:'POST',headers:{'Content-Type':'application/octet-stream','x-adv9-token':WTOKEN||''},body:data
    }).then(function(r){return r.json()}).then(function(j){
      toast('✅ 上傳成功：'+file.name);
      loadMusicList();if(typeof renderMusicYt==='function')renderMusicYt();
      input.value='';
    }).catch(function(err){toast('❌ 上傳失敗：'+err.message,'bad');});
  };
  reader.readAsArrayBuffer(file);
}

/* ▶️ YouTube 音樂（v4.0）：管理員放 YT 連結、學生可推薦歌曲 */
function ytIdOf(url){const m=String(url||'').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);return m?m[1]:null}
function openYtPlayer(url){
  const id=ytIdOf(url);if(!id)return toast('無法辨識 YouTube 網址','bad');
  openModal('<div style="text-align:center"><b style="color:var(--gold2)">▶️ YouTube 音樂</b>'+
  '<div style="margin-top:10px;aspect-ratio:16/9;width:100%"><iframe src="https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0" style="width:100%;height:100%;border:0;border-radius:8px" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>'+
  '<button class="btn ghost mini" style="margin-top:10px" onclick="closeModal()">關閉</button></div>');
}
function musicAddYt(title,url){
  const links=get(LS.musicLinks,[]);if(!Array.isArray(links))return toast('音樂清單資料異常','bad');
  links.unshift({title:String(title||'').slice(0,60),url:String(url||'').slice(0,300),ts:Date.now()});
  set(LS.musicLinks,links);
  toast('▶️ 已加入 YouTube 音樂：'+(title||url));
}
function musicDelYt(i){
  const links=get(LS.musicLinks,[]);if(!Array.isArray(links)||!links[i])return;
  links.splice(i,1);set(LS.musicLinks,links);
  toast('🗑 已移除');if(typeof vGameSet==='function'&&vGameSet.cur===true)vGameSet();
}
function musicApproveReq(i){
  const reqs=get(LS.musicReqs,[]);const r=reqs&&reqs[i];
  if(!r)return;
  musicAddYt(r.title,r.url);
  reqs.splice(i,1);set(LS.musicReqs,reqs);
  toast('✅ 已採納推薦並加入音樂清單');if(typeof vGameSet==='function'&&vGameSet.cur===true)vGameSet();
}
function musicDenyReq(i){
  const reqs=get(LS.musicReqs,[]);if(!reqs||!reqs[i])return;
  reqs.splice(i,1);set(LS.musicReqs,reqs);
  toast('已略過推薦');if(typeof vGameSet==='function'&&vGameSet.cur===true)vGameSet();
}

/* ── 新手引導（首登教學，只顯示一次）── */

/* ════════════════════════════════════════════
   vSet 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 7 個單位：BG_PRESETS, AVATAR_EMOJIS, MUSIC, saveMusicPref, musicInit, musicSetVolume, vSet
   ════════════════════════════════════════════ */
const BG_PRESETS={bg1:['🌌 星空藍（預設）',''],bg2:['🌅 暮光橙','linear-gradient(160deg,#2b1055,#7597de 45%,#c98a5a)'],bg3:['🌲 森林綠','linear-gradient(160deg,#0f2027,#203a43 50%,#2c5364)'],bg4:['🌸 櫻花粉','linear-gradient(160deg,#41295a,#752d63 50%,#b06ab3)'],bg5:['🔥 熔岩紅','linear-gradient(160deg,#1f1c18,#5c2018 55%,#8e3b2f)'],bg6:['💜 夢幻紫','linear-gradient(160deg,#141e30,#3a2b63 55%,#6a3f8f)']};


let MUSIC={list:[],idx:-1,audio:null};

function saveMusicPref(){try{localStorage.setItem('ADV9_MUSIC',JSON.stringify({idx:MUSIC.idx}))}catch(e){}}

function musicInit(){if(MUSIC.audio)return;const a=new Audio();a.loop=true;a.volume=.5;MUSIC.audio=a;try{const j=JSON.parse(localStorage.getItem('ADV9_MUSIC')||'{}');if(typeof j.idx==='number')MUSIC.idx=j.idx}catch(e){}}


/* ════════════════════════════════════════════
   vSet 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：AVATAR_EMOJIS, musicSetVolume, vSet
   ════════════════════════════════════════════ */


/* ════════════════════════════════════════════
   vSet 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：AVATAR_EMOJIS, musicSetVolume, vSet
   ════════════════════════════════════════════ */


/* ════════════════════════════════════════════
   vSet 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：AVATAR_EMOJIS, musicSetVolume, vSet
   ════════════════════════════════════════════ */


/* ════════════════════════════════════════════
   vSet 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 6 個單位：AVATAR_EMOJIS, musicSetVolume, vSet, renderMusicYt, openMusicReq, sendMusicReq
   ════════════════════════════════════════════ */


async function vSet(){
  if(!await needJs(['js/views/vSet.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vSet();
}

function renderMusicYt(){
  const box=document.getElementById('musicYtBox');if(!box)return;
  const links=get(LS.musicLinks,[]);MUSIC.yt=Array.isArray(links)?links:[];
  box.style.display=links.length?'block':'none';
  const el=document.getElementById('musicYtList');if(!el)return;
  el.innerHTML=links.map(l=>'<button class="btn ghost mini" style="text-align:left" onclick="openYtPlayer(\''+encodeURIComponent(l.url)+'\')">▶️ '+esc(l.title||l.url)+'</button>').join('');
}

function openMusicReq(){
  openModal('<div class="createForm"><div class="fg"><label>歌曲名稱</label><input id="mrTitle" placeholder="例如：輕快學習音樂"></div>'+
  '<div class="fg"><label>YouTube 網址</label><input id="mrUrl" placeholder="https://www.youtube.com/watch?v=..."></div>'+
  '<button class="btn btn-primary big" style="margin-top:12px" onclick="sendMusicReq()">📩 送出推薦</button></div>');
}

function sendMusicReq(){
  const title=(document.getElementById('mrTitle')||{}).value.trim();
  const url=(document.getElementById('mrUrl')||{}).value.trim();
  if(!url||url.indexOf('youtube.com')<0&&url.indexOf('youtu.be')<0&&url.indexOf('music.youtube.com')<0)return toast('請輸入有效的 YouTube 網址','bad');
  const u=me();
  const reqs=get(LS.musicReqs,[]);
  reqs.unshift({user:u.username,name:u.name,title,url,ts:Date.now()});
  set(LS.musicReqs,reqs);
  closeModal();toast('📩 已送出推薦，管理員審核後就會出現在音樂清單！');
}




function setLangGrid(t){
  const rows=langFind(t||'');
  const g=me().g;
  const el=document.getElementById('setLangGrid');if(!el)return;
  el.innerHTML=rows.slice(0,60).map(x=>{
    const [r,code,name]=x,st=(g.stats.lang||{})[code];
    return '<button class="btn ghost mini" style="font-size:12px;text-align:left" onclick="setLangPref(\''+code+'\')">'+esc(name)+(st?' <span style="color:var(--teal)">('+st.t+')</span>':'')+'</button>';
  }).join('')+(rows.length>60?'<span style="font-size:11px;color:var(--mut)">…共 '+rows.length+' 種，輸入關鍵字可搜尋</span>':'')||'<span style="font-size:12px;color:var(--mut)">找不到，試試別的字。</span>';
}


function setHideOnline(v){const u=myProf();u.prof.hideOnline=!!v;saveU(u);toast(v?'🙈 已隱藏上線狀態（好友將看不到你在線上）':'👁 已公開上線狀態');heartbeat()}

function openChangePw(){

openModal('<h3 class="mt">🔒 修改密碼</h3><p class="msub">所有角色皆可自主變更密碼</p>'+

'<label class="mlab">目前密碼<input id="pwOld" type="password" placeholder="輸入目前密碼"></label>'+

'<label class="mlab">新密碼<input id="pwNew" type="password" placeholder="至少 4 碼，僅限英文/數字/符號"></label>'+

'<label class="mlab">確認新密碼<input id="pwNew2" type="password" placeholder="再次輸入新密碼"></label>'+

'<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button><button class="btn" onclick="doChangePw()">確認修改</button></div>');

}

function doChangePw(){

const u=me();if(!u)return;

const old=$('#pwOld').value,nw=$('#pwNew').value,nw2=$('#pwNew2').value;

if(old!==u.password)return toast('⚠️ 目前密碼錯誤','bad');

if(nw.length<4)return toast('⚠️ 新密碼至少 4 碼','bad');

if(!validPassword(nw))return toast('⚠️ 密碼只能使用英文、數字或特殊符號（不能有中文或空白）','bad');

if(nw!==nw2)return toast('⚠️ 兩次輸入的新密碼不一致','bad');

u.password=nw;saveU(u);closeModal();toast('🔒 密碼已更新，下次登入請使用新密碼');

}

function openChangeName(){
  const u=me();if(!u)return;
  openModal('<h3 class="mt">✏️ 修改姓名</h3><p class="msub">帳號 ID 永遠不變，僅修改顯示名稱</p>'+
    '<label class="mlab">新姓名<input id="newNameInput" placeholder="輸入新姓名（2-20 字元）" value="'+esc(u.name)+'"></label>'+
    '<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button><button class="btn" onclick="doChangeName()">確認修改</button></div>');
}
function doChangeName(){
  const u=me();if(!u)return;
  const nn=$('#newNameInput').value.trim();
  if(!nn||nn.length<2)return toast('⚠️ 姓名至少 2 個字元','bad');
  if(nn.length>20)return toast('⚠️ 姓名最多 20 個字元','bad');
  const us=get(LS.users,[]);
  const dup=us.find(x=>x.id!==u.id&&x.name===nn);
  if(dup)return toast('⚠️ 此姓名已被使用','bad');
  u.name=nn;set(LS.users,us);saveU(u);closeModal();toast('✅ 姓名已改為：'+nn);
}

function resetStats(){if(!confirm('重置統計數據？'))return;

const u=me(),g=u.g;g.stats={total:0,correct:0,maxCombo:0,hardCorrect:0,retry:0,enhance:0,missions:0,subj:{},milestones:[]};

saveU(u);hud();toast('📊 已重置統計')}

function chatRow(c){

const badge=c.role==='admin'?'👑':c.role==='teacher'?'👩‍🏫':c.role==='system'?'📢':'👤';

const u=me();const mine=!!(u&&c.user===u.name);const isSys=c.role==='system';

const av=isSys?'':avatarHtml(get(LS.users,[]).find(x=>x.name===c.user),26);

const nm='<span class="cmName">'+(isSys?'':'<b>'+badge+' '+esc(c.user)+'</b>')+'<span class="cTime">'+fmt(c.time)+'</span></span>';

return '<div class="chatMsg '+(mine?'mine':'')+(isSys?' system':c.role||'')+'">'+av+'<div class="cmCol">'+nm+'<div class="cmBub"><p>'+esc(c.text)+'</p></div></div></div>';

}

/* ════════════════════════════════════════════
   vChatV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vChatV
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vChatV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vChatV
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vChatV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vChatV
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vChatV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vChatV
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vChatV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vChatV
   ════════════════════════════════════════════ */
async function vChatV(){
  if(!await needJs(['js/views/vChatV.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vChatV();
}






function sendChat(){const u=me();const t=$('#chatIn').value.trim();if(!t)return;

const ch=get(LS.chat,[]);ch.push({user:u.name,role:u.role,text:t,time:Date.now()});

if(ch.length>100)ch.splice(0,ch.length-100);

set(LS.chat,ch);$('#chatIn').value='';vChatV()}

/* ════════════════════════════════════════════
   vAnn 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vAnn
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAnn 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vAnn
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAnn 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vAnn
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAnn 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vAnn
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAnn 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vAnn
   ════════════════════════════════════════════ */
async function vAnn(){
  if(!await needJs(['js/views/vAnn.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vAnn();
}






/* ════════ 老師工作台（#5 隱私：只看世界頻道）════════ */

let T_TAB='home';

function renderTeacher(u){
applyMyTheme();

T_TAB='home';

const imp=get(LS.ses).imp;

$('#app').innerHTML=

'<header class="hud"><div class="hudL"><span class="hlogo">👩‍🏫</span><span class="hlv">老師工作台</span><span class="htitle">'+esc(u.name)+'</span></div>'+

'<div class="hudR">'+(imp?'<span class="chip imp">👑 管理員觀察中</span><button class="btn mini" onclick="backAdmin()">返回管理員</button>':'')+

'<button class="btn ghost mini" onclick="openChangePw()">🔒 修改密碼</button><button class="btn ghost mini" onclick="logout()">🚪 登出</button></div></header>'+

'<div class="wrap" style="display:grid;grid-template-columns:200px 1fr;gap:16px">'+

'<aside><div class="panel2" style="display:flex;flex-direction:column;gap:6px">'+

[['home','🏫 我的班級'],['cls','🏫 班級管理'],['hw','📚 班級作業'],['pub','📝 發布作業'],['cross','🔀 跨班檢視'],['reg','📝 學生註冊'],['tfr','👥 教師好友'],['roster','👥 學生名冊'],['audit','🕵️ AI 學情稽核'],['monitor','🔍 聊天監控'],['aiq','🤖 AI 出題'],['lang','🌍 語言包'],['classwar','⚔️ 班級戰'],['trust','🏛 信任管理']].map(t=>

'<button class="btn '+(T_TAB===t[0]?'':'ghost')+' mini" id="tt_'+t[0]+'" onclick="tGo(\''+t[0]+'\')">'+t[1]+'</button>').join('')+

'</div></aside><main id="view" class="panel view"></main></div>';

tGo('home');

}

function tGo(tab){

T_TAB=tab;

['home','cls','hw','pub','cross','reg','tfr','roster','audit','monitor','aiq','lang','classwar','trust'].forEach(t=>{const el=document.getElementById('tt_'+t);if(el)el.className='btn '+(t===tab?'':'ghost')+' mini'});

if(tab==='home')vTHome();else if(tab==='cls')vClasses();else if(tab==='hw')tHwList();else if(tab==='pub')tPub();else if(tab==='cross')tCross();

else if(tab==='tfr')tFriends();else if(tab==='roster')vRoster();else if(tab==='reg')vRegStu();else if(tab==='audit')vAiAudit();else if(tab==='aiq')vAiQuiz();else if(tab==='lang')vLangStudy();else if(tab==='classwar')vClassWar();else if(tab==='trust')vTrust();else vMonitor();

}




/* 年級作業：classId='G78' 表示七年級+八年級 */

function tPub(){

PUB={qs:[],pdf:null};

const u=me();const myIds=(u.managedClassIds||[]).concat(u.classId?[u.classId]:[]).filter(function(x,i,a){return a.indexOf(x)===i;});
$('#view').innerHTML='<h3 class="vt">📝 發布班級作業</h3>'+
'<div id="tPubClassWrap" style="margin:10px 0;color:var(--mut);font-size:12px">⏳ 載入班級…</div>'+

'<div class="panel2" style="display:flex;flex-direction:column;gap:10px;max-width:640px">'+

'<label class="mlab">發布對象<br><span style="display:flex;gap:8px;flex-wrap:wrap;margin-top:5px"><button type="button" class="btn ghost mini" id="hwScopeGrade" onclick="hwScope(\'grade\')">📚 整個年級</button><button type="button" class="btn mini" id="hwScopeClass" onclick="hwScope(\'class\')">🏫 單一班級</button></span></label>'+

'<div id="hwGradeWrap" style="display:none"><label class="mlab">選擇年級（可複選，例：勾 7 和 9 = 七年級+九年級）<span style="display:flex;gap:10px;flex-wrap:wrap;margin-top:5px">'+['7','8','9'].map(g=>'<label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer"><input type="checkbox" id="hwGrade'+g+'" value="'+g+'" style="width:auto">'+g+' 年級</label>').join('')+'</span></label></div>'+

'<div id="hwClassWrap"><label class="mlab">選擇班級<select id="hwClass"><option value="">（載入中…）</option></select></label></div>'+

'<label class="mlab">作業標題<input id="hwTitle" placeholder="例：第七章數學作業"></label>'+

'<label class="mlab">作業說明<textarea id="hwDesc" rows="2" placeholder="作業要求與說明..."></textarea></label>'+

'<label class="mlab">截止時間<input id="hwDeadline" type="datetime-local"></label>'+

'<div><b style="color:var(--teal);font-size:13px">📎 PDF 教材（選填，學生可邊看邊答）</b>'+

'<input type="file" id="hwPdf" accept="application/pdf" onchange="hwPdfUp(this)" style="margin-top:5px"></div>'+

'<div id="hwPdfName" style="font-size:12px;color:var(--mut)"></div>'+

'<div style="margin-top:4px"><b style="color:var(--teal);font-size:13px">📄 題目檔案匯入（.docx / .txt，Word「另存新檔」即可）</b>'+

'<input type="file" id="hwQsFile" accept=".docx,.doc,.txt" onchange="hwQsFileUp(this)" style="margin-top:5px"></div>'+

'<div id="hwQsImportLog" style="font-size:12px;color:var(--mut);margin-top:4px"></div>'+

'<b style="color:var(--teal);font-size:13px">✏️ 題目（'+PUB.qs.length+' 題）</b>'+

'<div id="pubQs"></div>'+

'<div class="panel2" style="background:rgba(0,0,0,.2)"><input id="nqStem" placeholder="題幹...">'+

'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px"><input id="nqA" placeholder="選項A"><input id="nqB" placeholder="選項B"><input id="nqC" placeholder="選項C"><input id="nqD" placeholder="選項D"></div>'+

'<div style="display:flex;gap:8px;margin-top:6px"><select id="nqAns" style="width:auto"><option value="0">答案A</option><option value="1">答案B</option><option value="2">答案C</option><option value="3">答案D</option></select>'+

'<button class="btn ghost mini" onclick="addPubQ()">➕ 加入題目</button><button class="btn ghost mini" onclick="autoPubQ()">🤖 自動出題</button></div></div>'+

'<button class="btn big" onclick="hwPublish()">📢 發布作業</button></div>';

renderPubQs();

fetch('/rest/v1/class/list',{headers:{'x-adv9-token':WTOKEN}}).then(function(r){return r.json()}).then(function(d){
  var sel=document.getElementById('hwClass');
  var wrap=document.getElementById('tPubClassWrap');
  if(!sel)return;
  if(!d||!d.ok||!Array.isArray(d.classes)){
    if(wrap)wrap.innerHTML='<span style="color:#ff8a80">❌ 載入班級失敗</span>';
    sel.innerHTML='<option value="">（載入失敗）</option>';
    return;
  }
  var myClasses=d.classes.filter(function(c){return myIds.indexOf(c.id)>=0;});
  if(!myClasses.length){
    sel.innerHTML='<option value="">（尚未管理任何班級，請先到 🏫 班級管理認領）</option>';
    if(wrap)wrap.innerHTML='<span style="color:var(--mut)">💡 提示：到「🏫 班級管理」建立或認領班級後，這裡就能選擇了</span>';
    return;
  }
  sel.innerHTML=myClasses.map(function(c){return '<option value="'+c.id+'">'+c.name+' ('+c.code+')</option>'}).join('');
  if(wrap)wrap.innerHTML='<span style="color:var(--mut)">已載入 '+myClasses.length+' 個班級</span>';
}).catch(function(){
  var sel=document.getElementById('hwClass');
  if(sel)sel.innerHTML='<option value="">（載入失敗）</option>';
});

}

function hwPdfUp(inp){

const f=inp.files[0];if(!f)return;

const r=new FileReader();

r.onload=e=>{PUB.pdf={dataUrl:e.target.result,name:f.name};$('#hwPdfName').textContent='📎 已選擇：'+f.name};

r.readAsDataURL(f);

}

/* 題目驗證：確保每題都有完整 4 選項、無重複、且答案索引有效（0-3 對應 A-D）*/
/* 純文字題目解析：支援 JSON 陣列（AI 格式）或逐題文字格式（同 Word 解析規則）*/
/* 匯入題目（docx/txt 通用）：逐題驗證，回報略過的壞題 */
function hwQsFileUp(inp){
  const f=inp.files&&inp.files[0];if(!f)return;
  const log=document.getElementById('hwQsImportLog');if(log)log.textContent='⏳ 解析 '+f.name+' ...';
  const ext=(f.name.split('.').pop()||'').toLowerCase();
  if(ext==='doc'){if(log)log.textContent='⚠️ 舊版 .doc 請先用 Word「另存新檔」存成 .docx 或 .txt 再上傳';return}
  if(ext==='txt'){const rd=new FileReader();rd.onload=e=>{importQuestions(parseTxtQuestions(String(e.target.result||'')),log)};rd.readAsText(f,'utf-8');return}
  const rd=new FileReader();rd.onload=async e=>{
    try{
      const resp=await fetch(SUPA_URL+'/rest/v1/docx_questions',{method:'POST',headers:supaHeaders(),body:e.target.result});
      const txt=await resp.text();
      if(!resp.ok)return log?log.textContent='⚠️ 解析失敗（HTTP '+resp.status+'）：'+txt:null;
      let qs;try{qs=JSON.parse(txt)}catch(_){return log?log.textContent='⚠️ 伺服器回應無法解析':null}
      importQuestions(qs,log);
    }catch(err){if(log)log.textContent='⚠️ 上傳失敗：'+err.message}
  };
  rd.readAsArrayBuffer(f);
}
function addPubQ(){

const stem=$('#nqStem').value.trim();

const opts=[$('#nqA').value.trim(),$('#nqB').value.trim(),$('#nqC').value.trim(),$('#nqD').value.trim()];

if(!stem||opts.some(o=>!o))return toast('⚠️ 請填寫完整題目與四個選項','bad');

/* 題目驗證：4 選項無重複、答案索引有效 */
const nq={'題目':stem,'選項':opts,'答案':+$('#nqAns').value,'解析':'（老師未提供解析）'};
const nv=validateQuestion(nq);
if(!nv.ok)return toast('⚠️ 題目有誤：'+nv.msg,'bad');

/* #6 每題賦予唯一 id，作答/批改才能正確對應 */

nq.id=newQid();PUB.qs.push(nq);

$('#nqStem').value='';$('#nqA').value='';$('#nqB').value='';$('#nqC').value='';$('#nqD').value='';

renderPubQs();

}

function autoPubQ(){

const q=bankQ('數學','整數運算',30);const av=validateQuestion(q);if(!av.ok)return toast('⚠️ 自動題目有誤：'+av.msg,'bad');q.id=newQid();PUB.qs.push(q);renderPubQs();toast('🤖 已自動加入一題');

}


function hwPublish(){

const u=me();

const title=$('#hwTitle').value.trim(),desc=$('#hwDesc').value.trim();

const dl=$('#hwDeadline').value;

if(!title)return toast('⚠️ 請填寫標題','bad');

let classId;
if(HW_SCOPE==='grade'){
  const gs=['7','8','9'].filter(g=>{const el=document.getElementById('hwGrade'+g);return el&&el.checked});
  if(!gs.length)return toast('⚠️ 請勾選至少一個年級','bad');
  classId='G'+gs.join('');
}else{
  classId=($('#hwClass')&&$('#hwClass').value)||'';
  if(!classId)return toast('⚠️ 請選擇班級','bad');
}

if(!PUB.qs.length)return toast('⚠️ 請至少加入一題','bad');

/* 發布前逐題驗證，避免發布出沒有正確答案或選項重複的題目 */
for(let qi=0;qi<PUB.qs.length;qi++){const qv=validateQuestion(PUB.qs[qi]);if(!qv.ok)return toast('⚠️ 第 '+(qi+1)+' 題有誤：'+qv.msg+'（請修正或刪除後再發布）','bad')}

const deadline=dl?new Date(dl).getTime():Date.now()+7*86400000;

const hws=get(LS.hw,[]);

/* 發布時隨機打亂題目順序（每次發布都不同），避免學生照順序背答案 */
const qs=shuffleQOrder(PUB.qs.slice());

hws.unshift({id:'h'+Date.now(),classId,teacherId:u.id,title,desc,questions:qs,pdf:PUB.pdf,totalPts:qs.length*10,deadline,publishedAt:Date.now()});

set(LS.hw,hws);

toast('📢 作業已發布至 '+hwTargetLabel({classId})+'！');tGo('hw');

}

function tHwList(){

const u=me();const hws=get(LS.hw,[]).filter(h=>hwForTeacher(h,u));

const subs=get(LS.sub,[]);const us=get(LS.users,[]);

$('#view').innerHTML='<h3 class="vt">📚 班級作業管理</h3>'+

(hws.length?hws.map(h=>{

const hs=subs.filter(s=>s.hwId===h.id);

return '<div class="panel2" style="margin-bottom:10px"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><b style="flex:1;font-family:var(--serif);color:var(--gold2)">'+esc(h.title)+' <span style="font-size:11px;color:var(--mut)">'+hwTargetLabel(h)+'｜截止 '+fmt(h.deadline)+'</span></b>'+

'<button class="btn danger mini" onclick="delHw(\''+h.id+'\')">🗑 刪除作業</button>'+
'<button class="btn teal mini" onclick="hwWeakness(\''+h.id+'\')">📊 弱點分析</button></div>'+

'<div style="font-size:12px;color:var(--mut);margin:4px 0">提交：'+hs.length+' 人｜題目 '+h.questions.length+' 題</div>'+

(hs.length?hs.map(s=>{const stu=us.find(x=>x.id===s.studentId);

return '<div style="display:flex;gap:8px;align-items:center;padding:5px 0;border-top:1px solid var(--line)"><b style="flex:1;font-size:13px">'+(stu?esc(stu.name):'未知')+'</b>'+
((s.blurCount||0)>=3?'<span style="font-size:11px;color:#ff8a80" title="作答期間離窗 '+(s.blurCount||0)+' 次">⚠️離窗'+(s.blurCount||0)+'</span>':'')+
(s.score!=null?'<b style="color:var(--green);font-size:13px">'+s.score+' 分</b>':'<button class="btn mini" onclick="hwGrade(\''+s.id+'\')">✏️ 批改</button>')+'</div>'}).join(''):'<p style="font-size:12px;color:var(--mut)">尚無人提交</p>')+

'</div>'}).join('')

:'<p class="empty">尚未發布作業，點左側「📝 發布作業」</p>');

}

function delHw(id){

if(!confirm('🗑 確定刪除此作業？學生的提交紀錄也會一併刪除！'))return;

set(LS.hw,get(LS.hw,[]).filter(h=>h.id!==id));

set(LS.sub,get(LS.sub,[]).filter(s=>s.hwId!==id));

toast('🗑 作業已刪除');tGo('hw');

}

function hwGrade(sid){

const subs=get(LS.sub,[]);const s=subs.find(x=>x.id===sid);

const h=get(LS.hw,[]).find(x=>x.id===s.hwId);

const L=['A','B','C','D'];

let auto=0;h.questions.forEach(q=>{if(s.answers[q.id]===q['答案'])auto+=Math.round(h.totalPts/h.questions.length)});

openModal('<h3 class="mt">✏️ 批改作業</h3>'+

((s.blurCount||0)>=1?'<div style="font-size:12px;color:#ff8a80;margin-bottom:8px">⚠️ 作答期間離窗 '+(s.blurCount||0)+' 次</div>':'')+

'<div style="font-size:13px;line-height:1.9">'+h.questions.map((q,i)=>{const sel=s.answers[q.id];const ok=sel===q['答案'];

return '<div style="margin-bottom:6px">'+(ok?'✅':'❌')+' '+esc(q['題目'])+'<br><span style="color:'+(ok?'var(--green)':'#ff8a80')+';font-size:12px">學生答案：('+L[sel]+') '+esc(q['選項'][sel])+'</span></div>'}).join('')+'</div>'+

'<label class="mlab">分數（總分 '+h.totalPts+'）<input id="grScore" type="number" value="'+auto+'" min="0" max="'+h.totalPts+'"></label>'+

'<label class="mlab">評語<textarea id="grFb" rows="2" placeholder="給學生的評語..."></textarea></label>'+

'<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button><button class="btn" onclick="hwSaveGrade(\''+sid+'\')">儲存批改</button></div>');

}

function hwSaveGrade(sid){

const subs=get(LS.sub,[]);const s=subs.find(x=>x.id===sid);

s.score=clamp(+$('#grScore').value||0,0,999);s.feedback=$('#grFb').value;s.gradedAt=Date.now();

set(LS.sub,subs);closeModal();toast('✅ 批改已儲存');tHwList();

}

/* 📊 弱點分析：每題錯誤人數統計 + AI 快速評估 */
function hwWeakness(id){
  const h=get(LS.hw,[]).find(x=>x.id===id);if(!h)return;
  const subs=get(LS.sub,[]).filter(s=>s.hwId===id);
  const us=get(LS.users,[]);
  const stats=h.questions.map(q=>{
    const wrong=subs.filter(s=>s.answers[q.id]==null||s.answers[q.id]!==q['答案']);
    return{q,wrong};
  }).sort((a,b)=>b.wrong.length-a.wrong.length);
  openModal('<h3 class="mt">📊 弱點分析：'+esc(h.title)+'</h3>'+
    '<div style="font-size:12px;color:var(--mut);margin-bottom:8px">已提交 '+subs.length+' 人 · 每題錯誤人數（由高到低）</div>'+
    '<div style="max-height:44vh;overflow-y:auto">'+
    stats.map(s=>'<div style="padding:6px;border-bottom:1px solid var(--line)"><div style="font-size:12.5px">'+(s.wrong.length?'❌':'✅')+' '+esc(String(s.q['題目']||'').slice(0,60))+'…</div>'+
      '<div style="font-size:11.5px;color:'+(s.wrong.length?'#ff8a80':'var(--green)')+'">錯 '+s.wrong.length+'/'+subs.length+' 人'+(s.wrong.length?' · '+s.wrong.slice(0,3).map(w=>{const st=us.find(x=>x.id===w.studentId);return st?esc(st.name):'?'}).join('、')+(s.wrong.length>3?' 等':'')+'':'')+'</div></div>').join('')+
    '</div>'+
    '<div style="margin-top:10px"><button class="btn teal" onclick="hwAiEval(\''+id+'\')">🤖 AI 快速評估</button><button class="btn ghost" onclick="closeModal()">關閉</button></div>'+
    '<div id="hwAiOut" style="margin-top:10px;font-size:12.5px;line-height:1.7;white-space:pre-wrap;max-height:26vh;overflow-y:auto"></div>');
}
async function hwAiEval(id){
  const out=document.getElementById('hwAiOut');if(!out)return;
  out.textContent='🤖 AI 分析中...';
  try{
    const h=get(LS.hw,[]).find(x=>x.id===id);
    const subs=get(LS.sub,[]).filter(s=>s.hwId===id);
    if(!subs.length){out.textContent='尚無人提交，無法分析';return}
    const wrongByQ=h.questions.map(q=>({
      題目:String(q['題目']||'').slice(0,80),
      錯誤人數:subs.filter(s=>s.answers[q.id]==null||s.answers[q.id]!==q['答案']).length,
      解析:(q['解析']||'').slice(0,80)
    })).sort((a,b)=>b.錯誤人數-a.錯誤人數).slice(0,8);
    const prompt='以下是一份國中班級作業的每題錯誤人數統計（共 '+subs.length+' 人提交）：\n'+JSON.stringify(wrongByQ,null,2)+'\n請用繁體中文簡潔分析：1) 全班最弱的 1-2 個概念 2) 可能原因 3) 給老師 2-3 條具體教學建議。';
    const txt=await callAI(prompt,'你是一位有 15 年經驗的國中教師與試題分析專家。');
    out.textContent=txt;
  }catch(e){out.textContent='⚠️ '+e.message}
}

let CROSS_CLASS=null;

function tCross(){

const u=me();

const cd=get(LS.classes,{ids:[],names:{}});const classes=cd.ids; /* 實際班級清單，無預設寫死 */

if(!classes.length){$('#view').innerHTML='<h3 class="vt">🔀 跨班級檢視</h3><p class="empty">尚無班級，請先於「🏫 班級管理」新增班級</p>';return}

if(!CROSS_CLASS||!classes.includes(CROSS_CLASS))CROSS_CLASS=classes[0];

const canView=u.isSchoolAdmin||(u.managedClassIds||[]).length>0;

const hws=get(LS.hw,[]).filter(h=>h.classId===CROSS_CLASS||(hwGrades(h.classId)&&hwGrades(h.classId).indexOf(String(CROSS_CLASS||'')[0])>-1));

const subs=get(LS.sub,[]);const us=get(LS.users,[]).filter(x=>x.classId===CROSS_CLASS&&x.g);

$('#view').innerHTML='<h3 class="vt">🔀 跨班級檢視 <span class="vsub">'+(canView?'':'⚠️ 需老師或學校管理員權限')+'</span></h3>'+

'<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'+classes.map(c=>'<button class="btn '+(CROSS_CLASS===c?'':'ghost')+' mini" onclick="CROSS_CLASS=\''+c+'\';tCross()">'+esc(cd.names[c]||c)+'</button>').join('')+'</div>'+

'<div class="statGrid">'+

st('🎒 學生數',us.length)+

st('📚 作業數',hws.length)+

st('📈 平均Lv',us.length?(us.reduce((s,x)=>s+x.g.lv,0)/us.length).toFixed(1):'—')+

st('📤 提交數',hws.reduce((s,h)=>s+subs.filter(x=>x.hwId===h.id).length,0))+'</div>'+

'<div class="semT">📚 該班作業完成率</div>'+

(hws.length?hws.map(h=>{const cnt=subs.filter(s=>s.hwId===h.id).length;const pct=us.length?Math.round(cnt/us.length*100):0;

return '<div class="panel2" style="margin-bottom:8px"><b style="font-size:13.5px">'+esc(h.title)+'</b><div class="bar qpb" style="margin-top:5px"><i style="width:'+pct+'%"></i></div><span style="font-size:11.5px;color:var(--mut)">'+cnt+'/'+us.length+'（'+pct+'%）</span></div>'}).join(''):'<p class="empty">該班尚無作業</p>')+

'<div class="semT">🏆 該班學習排行</div>'+

(us.length?us.slice().sort((a,b)=>(b.g.lv*100000+b.g.stats.correct)-(a.g.lv*100000+a.g.stats.correct)).slice(0,8).map((s,i)=>'<div class="panel2 rankIt'+(i===0?' top0':'')+'"><span class="rMed">'+(i<3?['🥇','🥈','🥉'][i]:'🎖')+'</span><b class="rName">'+esc(s.name)+'</b><span class="rLv">Lv.'+s.g.lv+'</span><span class="rXp">答對 '+s.g.stats.correct+'</span></div>').join(''):'<p class="empty">該班尚無學生</p>');

}

function tFriends(){

const u=me();const frs=getFriends(u.id);

const pend=get(LS.fr,[]).filter(f=>f.status==='pending'&&f.b===u.id);

$('#view').innerHTML='<h3 class="vt">👥 教師好友 <span class="vsub">可添加老師/家長/學生</span></h3>'+

'<div class="panel2" style="margin-bottom:12px;display:flex;gap:8px"><input id="tfrSearch" placeholder="輸入名稱搜尋（老師/家長/學生）..."><button class="btn mini" onclick="tfrSearch()">🔍 搜尋</button></div>'+

'<div id="tfrRes"></div>'+

(pend.length?'<div class="semT">📥 收到的好友申請</div>'+pend.map(f=>{const from=get(LS.users,[]).find(x=>x.id===f.a);

return '<div class="panel2 frIt"><b style="flex:1">'+(from?esc(from.name):'未知')+'</b><button class="btn mini" onclick="frAccept(\''+f.a+'\');tFriends()">✅ 接受</button></div>'}).join(''):'')+

'<div class="semT">🤝 好友列表</div>'+

(frs.length?frs.map(f=>{const fid=f.a===u.id?f.b:f.a;const fr=get(LS.users,[]).find(x=>x.id===fid);if(!fr)return'';

return '<div class="panel2 frIt"><b style="flex:1">'+esc(fr.name)+' <span style="font-size:11px;color:var(--mut)">'+(fr.role==='teacher'?'👩‍🏫 老師':fr.role==='student'?'👤 學生':'👨‍👩‍👧 家長')+'</span></b>'+

'<button class="btn teal mini" onclick="openPm(\''+fid+'\')">💬 私訊</button>'+

'<button class="btn ghost mini" onclick="tShare(\''+fid+'\')">📤 分享作業模板</button>'+

'<button class="btn danger mini" onclick="frDel(\''+f.a+'\',\''+f.b+'\');tFriends()">🗑</button></div>'}).join('')

:'<p class="empty">尚無好友</p>');

}

function tfrSearch(){

const u=me();const q=$('#tfrSearch').value.trim();if(!q)return;

const us=get(LS.users,[]).filter(x=>x.id!==u.id&&(x.name.includes(q)||x.username.includes(q)||x.id.includes(q)));

const frs=get(LS.fr,[]);

$('#tfrRes').innerHTML=us.length?us.map(x=>{

const rel=frs.find(f=>(f.a===u.id&&f.b===x.id)||(f.a===x.id&&f.b===u.id));

return '<div class="panel2 frIt"><b style="flex:1">'+esc(x.name)+' <span style="font-size:11px;color:var(--mut)">'+(x.role==='teacher'?'👩‍🏫 老師':x.role==='student'?'👤 學生':'👨‍👩‍👧 家長')+'</span></b>'+

(rel?(rel.status==='accepted'?'✅ 已是好友':'⏳ 已發送'):'<button class="btn mini" onclick="frAdd(\''+x.id+'\');tFriends()">➕ 加為好友</button>')+'</div>'}).join('')

:'<p style="color:var(--mut);font-size:13px;padding:8px">找不到符合的使用者</p>';

}

function tShare(fid){

const fr=get(LS.users,[]).find(x=>x.id===fid);

toast('📤 已分享作業模板給 '+(fr?fr.name:'好友')+'！');

}

/* ════════════════════════════════════════════
   vRoster 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRoster
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vRoster 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRoster
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vRoster 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRoster
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vRoster 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRoster
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vRoster 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRoster
   ════════════════════════════════════════════ */
async function vRoster(fGrade,fClass){
  if(!await needJs(['js/views/vRoster.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vRoster(fGrade,fClass);
}






/* 🔍 學生詳情：師/管端檢視作答過程與作答時間 */

function stuDetail(id,fMode,fSubj){

const s=get(LS.users,[]).find(x=>x.id===id);if(!s)return;

const g=s.g||{};const all=(g.answerLog||[]).slice().reverse();

fMode=fMode||'全部';fSubj=fSubj||'全部';

const modes=['全部'].concat([...new Set(all.map(a=>a.mode).filter(Boolean))]);

const subjs=['全部'].concat([...new Set(all.map(a=>a.sub).filter(Boolean))]);

const log=all.filter(a=>(fMode==='全部'||a.mode===fMode)&&(fSubj==='全部'||a.sub===fSubj));

window._alogView=log; /* 供計算機過程彈窗讀取 */

const avg=log.length?(log.reduce((a,b)=>a+(b.sec||0),0)/log.length).toFixed(1):'—';

const acc=g.stats&&g.stats.total?Math.round(g.stats.correct/g.stats.total*100):0;

const eid=esc(id);

const opt=(arr,cur)=>arr.map(x=>'<option value="'+esc(x)+'"'+(x===cur?' selected':'')+'>'+esc(x)+'</option>').join('');

openModal('<h3 class="mt">🔍 '+esc(s.name)+' 的學習紀錄</h3>'+

'<p class="msub">'+(s.classId||'—')+'班｜Lv.'+(g.lv||1)+'｜答對 '+((g.stats||{}).correct||0)+'/'+((g.stats||{}).total||0)+'（正確率 '+acc+'%）｜這些紀錄平均 '+avg+' 秒</p>'+

'<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;align-items:center">'+

'<label style="font-size:12.5px;color:var(--mut)">🏷️ 模式<select id="alogMode" style="width:auto;margin-left:5px" onchange="stuDetail(\''+eid+'\',this.value,document.getElementById(\'alogSubj\').value)">'+opt(modes,fMode)+'</select></label>'+

'<label style="font-size:12.5px;color:var(--mut)">📚 科目<select id="alogSubj" style="width:auto;margin-left:5px" onchange="stuDetail(\''+eid+'\',document.getElementById(\'alogMode\').value,this.value)">'+opt(subjs,fSubj)+'</select></label>'+

'<span style="font-size:12px;color:var(--gold2)">共 '+log.length+' 筆</span></div>'+

'<div class="alogGrid">'+

(log.length?log.map((a,i)=>'<div class="alogCard '+(a.ok?'ok':'no')+'">'+

'<div class="alogTop"><span class="rsBadge">'+(a.ok?'✅ 答對':'❌ 答錯')+'</span><span class="alogTag">'+esc(a.mode||'')+'</span><span class="alogTag">'+esc(a.sub||'')+'</span><span class="alogTime">'+fmt(a.t)+'</span></div>'+

'<div class="alogStem">'+esc(a.stem||'（無題目）')+'</div>'+

'<div class="alogBot"><span class="ansv">✍️ '+esc(a.sel||'—')+(a.ok?'':' <span style="color:var(--mut)">/ 正解 '+esc(a.ans||'')+'</span>')+'</span><span class="sec">⏱️ '+(a.sec!=null?a.sec+'s':'—')+'</span>'+(a.calc?'<span class="calc" style="cursor:pointer" onclick="showCalc('+i+')" title="點擊查看計算過程">🧮 計算過程</span>':'')+'</div>'+

'</div>').join(''):'<p class="empty" style="grid-column:1/-1">此條件尚無作答紀錄</p>')+

'</div><div class="mBtns"><button class="btn" onclick="closeModal()">關閉</button></div>');

const mb=$('#mbody');if(mb)mb.style.maxWidth='900px'; /* 加寬面板以容納 16:9 卡片網格 */

}

/* 🧮 查看學生計算機草稿（不破壞 stuDetail 視窗的第二層彈窗）*/


/* 🕵️ AI 學情稽核：依作答紀錄偵測異常（作答過快/過慢、數學無過程、正確率驟升）*/



/* ════════════════════════════════════════════
   vAiAudit 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：auditMetrics, auditFlags, vAiAudit
   ════════════════════════════════════════════ */


/* ════════════════════════════════════════════
   vAiAudit 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：auditMetrics, auditFlags, vAiAudit
   ════════════════════════════════════════════ */


/* ════════════════════════════════════════════
   vAiAudit 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：auditMetrics, auditFlags, vAiAudit
   ════════════════════════════════════════════ */


/* ════════════════════════════════════════════
   vAiAudit 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：auditMetrics, auditFlags, vAiAudit
   ════════════════════════════════════════════ */


/* ════════════════════════════════════════════
   vAiAudit 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：auditMetrics, auditFlags, vAiAudit
   ════════════════════════════════════════════ */


async function vAiAudit(){
  if(!await needJs(['js/views/vAiAudit.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vAiAudit();
}






function auditAI(){

const rows=window._auditRows||[];

const box=$('#auditAI');if(!box)return;

const data=rows.filter(r=>r.m.n>0).map(r=>({'姓名':r.s.name,'紀錄數':r.m.n,'平均秒':r.m.avg,'答對極快題':r.m.fast,'慢題':r.m.slow,'數學無過程題':r.m.mathNoProc,'正確率前半':r.m.earlyAcc,'正確率後半':r.m.lateAcc}));

if(!data.length){box.innerHTML='<div class="panel2" style="color:var(--mut)">目前無可分析的作答紀錄。</div>';return}

box.innerHTML='<div class="panel2" style="color:var(--teal)">🤖 AI 分析中…</div>';

const prompt='你是學習數據分析師。以下是班上學生的作答指標（JSON）：'+JSON.stringify(data)+'\n\n請找出可能「作答太快」、「作答太慢」、「數學答對卻沒有計算過程」、「正確率突然飆升（可能作弊）」的學生，用繁體中文條列，每人一行：姓名→異常類型→給老師的建議（如口試、面談）。語氣客觀、提醒這只是參考。若大家都正常請直接說明。';

callGemini(prompt,'你是客觀的學習數據分析師，只提供參考研判。').then(res=>{box.innerHTML='<div class="panel2" style="border-left:4px solid var(--teal);white-space:pre-wrap;line-height:1.8;font-size:13.5px"><b style="color:var(--gold2);font-family:var(--serif)">🤖 AI 綜合研判</b><br>'+esc(String(res||'').trim())+'</div>'}).catch(e=>{box.innerHTML='<div class="panel2" style="color:#ff8a80">⚠️ AI 分析失敗（請確認已設定 API 金鑰），但上方的異常初篩仍可參考。</div>'})

}

/* #5 老師聊天監控：僅世界頻道（公開）；好友私聊(LS.pm)與群組聊天絕不顯示 */

/* ════════════════════════════════════════════
   vMonitor 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMonitor
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMonitor 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMonitor
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMonitor 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMonitor
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMonitor 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMonitor
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMonitor 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMonitor
   ════════════════════════════════════════════ */
async function vMonitor(){
  if(!await needJs(['js/views/vMonitor.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vMonitor();
}






function clearChat(){if(!confirm('清空所有聊天紀錄？'))return;set(LS.chat,[]);vMonitor();toast('🗑 已清空')}
