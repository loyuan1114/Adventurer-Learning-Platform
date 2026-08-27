
/* ════════════════════════════════════════════════════════════════

1['修煉場精靈嚮導'] 2.PK無限競技塔 3['領土每科']100關 4['好友']/群組聊天傳照片

5['老師看不到私聊'] 6['作業題目']ID修復 7['收藏升星']vs裝備強化分流 8['全服商店'] 9['好友交易']40%保障

純前端單一檔案，資料存於 localStorage（ADV9_*）

════════════════════════════════════════════════════════════════ */

const DEFAULTS={adm:{u:"admin01",p:"A@2026",name:"公會會長"}}; /* 發布版：僅預設管理員帳號 */

const $=s=>document.querySelector(s);

/* 全域狀態變數（避免 ReferenceError） */
var WTOKEN=localStorage.getItem('ADV9_WTOKEN')||'';var _onlineSet=new Set();var _es=null;var _hbTimer=null;var _fastT=null;

const LS={users:'ADV9_USERS',ann:'ADV9_ANN',codes:'ADV9_CODES',chat:'ADV9_CHAT',ses:'ADV9_SES',hw:'ADV9_HOMEWORK',sub:'ADV9_SUBMISSIONS',fr:'ADV9_FRIENDS',gr:'ADV9_GROUPS',pm:'ADV9_PM',trades:'ADV9_TRADES',gshop:'ADV9_GSHOP',apiKeys:'ADV9_APIKEYS',classes:'ADV9_CLASSES',market:'ADV9_MARKET',settings:'ADV9_SETTINGS',acad:'ADV9_ACADYR',duels:'ADV9_DUELS',stories:'ADV9_STORIES',guilds:'ADV9_GUILDS',books:'ADV9_BOOKS',notif:'ADV9_NOTIF',local:'ADV9_LOCAL',dolls:'ADV9_DOLLS',shopDolls:'ADV9_SHOP_DOLLS',events:'ADV9_DOLL_EVENTS',musicLinks:'ADV9_MUSIC_LINKS',musicReqs:'ADV9_MUSIC_REQS',pixels:'ADV9_PIXELS',videos:'ADV9_VIDEOS'};

const get=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};

const set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}if(typeof supaPush==='function')supaPush(k,v)};
window.get=get;window.set=set;

/* 🛡️ 防注入：清除使用者輸入中的 HTML/腳本危險字元（用於訊息、昵稱、動態等儲存前清洗）*/
/* 帳號合法性：僅允許英數底線點，防止異常輸入 */
function validUsername(u){return /^[A-Za-z0-9_.@-]{2,40}$/.test(String(u||''))}
/* 🔒 密碼規則：只能是英文字母/數字/特殊符號（可印 ASCII），不能有中文或空白，至少 4 碼 */
/* 🔐 SHA-256（純 JS，支援 file:// 離線）：用於固定管理員密碼雜湊（加密儲存，不存明文）*/
function sha256(ascii){function R(v,a){return(v>>>a)|(v<<(32-a));}var mp=Math.pow,mw=mp(2,32),res='';var words=[],abl=ascii.length*8;var hash=sha256.h=sha256.h||[],k=sha256.k=sha256.k||[],pc=k.length,ic={};for(var cand=2;pc<64;cand++){if(!ic[cand]){for(var i=0;i<313;i+=cand)ic[i]=cand;hash[pc]=(mp(cand,.5)*mw)|0;k[pc++]=(mp(cand,1/3)*mw)|0;}}ascii+='\x80';while(ascii.length%64-56)ascii+='\x00';for(var i=0;i<ascii.length;i++){var j=ascii.charCodeAt(i);if(j>>8)return'';words[i>>2]|=j<<((3-i)%4)*8;}words[words.length]=(abl/mw)|0;words[words.length]=abl;for(var j=0;j<words.length;){var w=words.slice(j,j+=16),oh=hash;hash=hash.slice(0,8);for(var i=0;i<64;i++){var w15=w[i-15],w2=w[i-2],a=hash[0],e=hash[4];var t1=hash[7]+(R(e,6)^R(e,11)^R(e,25))+((e&hash[5])^((~e)&hash[6]))+k[i]+(w[i]=(i<16)?w[i]:(w[i-16]+(R(w15,7)^R(w15,18)^(w15>>>3))+w[i-7]+(R(w2,17)^R(w2,19)^(w2>>>10)))|0);var t2=(R(a,2)^R(a,13)^R(a,22))+((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));hash=[(t1+t2)|0].concat(hash);hash[4]=(hash[4]+t1)|0;}for(var i=0;i<8;i++)hash[i]=(hash[i]+oh[i])|0;}for(var i=0;i<8;i++)for(var j=3;j+1;j--){var b=(hash[i]>>(j*8))&255;res+=((b<16)?0:'')+b.toString(16);}return res;}
/* 👑 固定管理員：密碼以 SHA-256 雜湊儲存（檔案中只有 hash，看不到明文；localStorage 也不會洩密碼）*/
const MASTER_ADMIN={user:'adv9boss',salt:'ADV9|v1|9f3a7',hash:'c25eba85d26bc97f09b85878ff6b4a6322acd3c740485bf09a4930b7f49e5c42',name:'總管理員'};
function isMasterLogin(u,p){return u===MASTER_ADMIN.user&&sha256(u+'|'+p+'|'+MASTER_ADMIN.salt)===MASTER_ADMIN.hash}



const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));




/* 系統可調設定（後台可自訂）：PK每日次數、每日任務數、每週任務目標 */
function sysCfg(){return Object.assign({pkDaily:5,dailyMissions:15,weeklyGoal:200,timeLock:true,diffMode:'精準'},get(LS.settings,{}))}
function setSysCfg(p){set(LS.settings,Object.assign(sysCfg(),p))}
function toast(m,t){const d=document.createElement('div');d.className='toast '+(t||'');d.textContent=m;$('#toasts').appendChild(d);setTimeout(()=>d.classList.add('out'),2600);setTimeout(()=>d.remove(),3100)}

function floatTxt(txt,cls,el){const r=el?el.getBoundingClientRect():{left:innerWidth/2,top:innerHeight/3,width:0};

const d=document.createElement('div');d.className='floater '+cls;d.textContent=txt;

d.style.left=(r.left+r.width/2+rnd(-22,22))+'px';d.style.top=(r.top+8)+'px';$('#fxlayer').appendChild(d);setTimeout(()=>d.remove(),1100)}

function openModal(h){$('#mbody').innerHTML=h;const modal=$('#modal');modal.style.display='flex';modal.classList.add('modalAnim');setTimeout(()=>modal.classList.remove('modalAnim'),350)}

function closeModal(){$('#modal').style.display='none';const mb=$('#mbody');if(mb)mb.style.maxWidth=''}
