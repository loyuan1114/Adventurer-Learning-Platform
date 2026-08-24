/* ADV9 自架後端 v4（Argon2 雜湊・伺服器權威安全版・單獨帳號檔案版）
   Copyright (C) 2026 loyuan1114
   Licensed under the GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later).
   安全與儲存重點：
   - 帳號資料獨立存放於 data/users/<username>.json
   - 帳號憑證(password/pwHash/salt)只存伺服器，GET 一律抹除 → 前端永遠看不到密碼
   - 登入發 token；所有寫入需帶 x-adv9-token
   - 密碼統一以 Argon2id 雜湊 + 每帳號隨機鹽儲存，絕不存明文
   - 娃娃 API 依「擁有者 / admin」授權，杜絕越權讀寫他人資料
   - 登入失敗次數限制，防暴力破解
   - 靜態檔用 path.resolve + 前綴檢查，防路徑穿越 */
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto'),child_process=require('child_process'),cluster=require('cluster'),os=require('os');
let argon2;try{argon2=require('argon2')}catch(e){console.warn('[warn] argon2 not installed, falling back to scrypt')}
const ROOT=__dirname;
const PYTHON=process.platform==='win32'?'python':'python3';
const TMPDIR=process.platform==='win32'?(process.env.TEMP||'C:\\Windows\\Temp'):'/tmp';
const PUB=path.join(ROOT,'public'),MEDIA=path.join(ROOT,'media'),DATA=path.join(ROOT,'data'),USERSDIR=path.join(DATA,'users');
const KVFILE=path.join(DATA,'kv.json'),ACCFILE=path.join(DATA,'accounts.json'),TOKFILE=path.join(DATA,'tokens.json');
const INDEXFILE=path.join(DATA,'users_index.json'); /* 全帳號主檔：所有帳號的備援清單（「有誰誰誰」），帳號遺失時自動復原 */
const ACCESSLOG=path.join(DATA,'access.log'); /* 存取日誌：診斷「同步失敗」時確認請求是否真的到達伺服器 */
const ONLINEFILE=path.join(DATA,'online.json'); /* 上線狀態：客戶端每 ~25 秒心跳報到 */
const DOLLFILE=path.join(DATA,'dolls.json'),SHOPFILE=path.join(DATA,'shop.json'),EVENTFILE=path.join(DATA,'events.json');
const SETTINGSDIR=path.join(DATA,'settings'), SYSSETFILE=path.join(SETTINGSDIR,'system.json');
const PORT=process.env.PORT||8080;
const USERS_KEY='ADV9_USERS';
/* 資料隔離：下列 key 為全服共享（社交/系統/市集/聊天/排名/好友/公告等），原樣保留；
   其餘 key 視為個人資料，寫入時自動加 username: 前綴，避免所有學生共用同一份。 */
const GLOBAL_KEYS=new Set(['ADV9_USERS','ADV9_ANN','ADV9_CODES','ADV9_CHAT','ADV9_SES','ADV9_HOMEWORK','ADV9_SUBMISSIONS','ADV9_FRIENDS','ADV9_GROUPS','ADV9_PM','ADV9_TRADES','ADV9_GSHOP','ADV9_APIKEYS','ADV9_CLASSES','ADV9_MARKET','ADV9_SETTINGS','ADV9_ACADYR','ADV9_DUELS','ADV9_STORIES','ADV9_GUILDS','ADV9_BOOKS','ADV9_NOTIF','ADV9_LOCAL','ADV9_DOLLS','ADV9_SHOP_DOLLS','ADV9_DOLL_EVENTS','ADV9_SYS_SETTINGS','ADV9_ADMIN_OP_LOGS','ADV9_TEACHERQ','ADV9_EXAMDATE','ADV9_ARENA_MAIL','ADV9_AI_RECENT','ADV9_MUSIC_LINKS','ADV9_MUSIC_REQS','ADV9_PIXELS','ADV9_SUDOKU','ADV9_CLASSWAR','ADV9_VIDEOS','ADV9_AI_PROVIDERS','ADV9_QBANK','ADV9_TRUST','ADV9_PARENT_CONSENTS']);
const MASTER={user:'adv9boss',salt:'ADV9|v1|9f3a7',hash:'c25eba85d26bc97f09b85878ff6b4a6322acd3c740485bf09a4930b7f49e5c42',name:'總管理員'};
/* 伺服器專用 pepper：環境變數 ADV9_PEPPER 優先，否則存於 data/pepper.json，無則自動產生 */
const PEPPERFILE=path.join(DATA,'pepper.json');
let SERVER_PEPPER=process.env.ADV9_PEPPER;
if(!SERVER_PEPPER){
  try{
    if(fs.existsSync(PEPPERFILE)){var _pj=JSON.parse(fs.readFileSync(PEPPERFILE,'utf8'));SERVER_PEPPER=_pj&&_pj.pepper}
  }catch(e){}
}
/* 僅 master 同步產生並寫入 pepper 檔（寫入後驗證存在）；worker 只從 env 或檔案載入 */
if(!SERVER_PEPPER&&cluster.isMaster){
  SERVER_PEPPER=crypto.randomBytes(48).toString('hex');
  try{fs.writeFileSync(PEPPERFILE,JSON.stringify({pepper:SERVER_PEPPER},null,2))}catch(e){}
}
if(!SERVER_PEPPER){
  console.error('[FATAL] 無法取得伺服器 pepper（env ADV9_PEPPER 或 '+PEPPERFILE+' 皆失敗），拒絕啟動');
  process.exit(1);
}
if(cluster.isMaster){try{fs.accessSync(PEPPERFILE)}catch(e){console.error('[FATAL] master 啟動時找不到 pepper 檔 '+PEPPERFILE);process.exit(1)}}

/* ── SHA-256 雜湊函數 ── */
function sha256(input){
  return crypto.createHash('sha256').update(input).digest('hex');
}

/* ── Argon2id 雜湊驗證（fallback: scrypt）── */
async function hashPassword(pw,salt){
  if(argon2){
    return await argon2.hash(pw,{type:argon2.argon2id,memoryCost:65536,timeCost:3,parallelism:4});
  }
  return new Promise(function(resolve,reject){
    crypto.scrypt(pw,salt,64,function(err,derived){
      if(err)return reject(err);
      resolve(derived.toString('hex'));
    });
  });
}
async function verifyHash(pw,hash,salt){
  if(argon2&&hash&&hash.startsWith('$argon2')){
    return await argon2.verify(hash,pw);
  }
  return new Promise(function(resolve,reject){
    crypto.scrypt(pw,salt||'fallback',64,function(err,derived){
      if(err)return resolve(false);
      resolve(derived.toString('hex')===hash);
    });
  });
}

[DATA,USERSDIR,SETTINGSDIR,MEDIA,PUB].forEach(function(d){try{fs.mkdirSync(d,{recursive:true})}catch(e){}});
function loadJSON(f,d){try{return JSON.parse(fs.readFileSync(f,'utf8'))||d}catch(e){return d}}

var KV=loadJSON(KVFILE,{}), ACC={}, TOK=loadJSON(TOKFILE,{});
var DOLL=loadJSON(DOLLFILE,{}), SHOP=loadJSON(SHOPFILE,[]), EVENTS=loadJSON(EVENTFILE,[]);
var SYSSET=loadJSON(SYSSETFILE, {
  max_level: 300,
  free_point_single_limit: 300,
  allow_admin_custom_infinity_req: true,
  event_mode_active: false,
  festival_mode_active: false,
  refund_amount: 5000,
  promo_codes: {}
});
function saveSYSSET(){try{fs.writeFileSync(SYSSETFILE, JSON.stringify(SYSSET, null, 2))}catch(e){console.error('saveSYSSET', e)}}
function saveKV(){try{fs.writeFileSync(KVFILE, JSON.stringify(KV, null, 2))}catch(e){console.error('saveKV', e)}}
function saveTOK(){try{fs.writeFileSync(TOKFILE, JSON.stringify(TOK, null, 2))}catch(e){console.error('saveTOK', e)}}
function saveDOLL(){try{fs.writeFileSync(DOLLFILE, JSON.stringify(DOLL, null, 2))}catch(e){console.error('saveDOLL', e)}}
function saveSHOP(){try{fs.writeFileSync(SHOPFILE, JSON.stringify(SHOP, null, 2))}catch(e){console.error('saveSHOP', e)}}
function saveEVENTS(){try{fs.writeFileSync(EVENTFILE, JSON.stringify(EVENTS, null, 2))}catch(e){console.error('saveEVENTS', e)}}
function saveACC(){Object.keys(ACC).forEach(function(un){saveUserFile(un)})}

/* ── 叢集（多 CPU）：master 持權威狀態、worker 跑 HTTP ──
   worker 的儲存函式改為透過 IPC 送給 master 合併/落檔，master 再廣播最新狀態給所有 worker，
   確保 2 顆 CPU 都能同時服務請求、狀態仍單一權威（無狀態 HMAC token 跨 worker 皆可驗證）*/
var ipcSend=function(m){try{if(process.send)process.send(m)}catch(e){}};
var IS_WORKER=cluster.isWorker;
if(IS_WORKER){
  saveKV=function(){ipcSend({__adv9:1,t:'kv',d:KV})};
  saveTOK=function(){};
  saveDOLL=function(){ipcSend({__adv9:1,t:'doll',d:DOLL})};
  saveSHOP=function(){ipcSend({__adv9:1,t:'shop',d:SHOP})};
  saveEVENTS=function(){ipcSend({__adv9:1,t:'events',d:EVENTS})};
  saveSYSSET=function(){ipcSend({__adv9:1,t:'sysset',d:SYSSET})};
  saveIndex=function(){ipcSend({__adv9:1,t:'index'})};
  saveUserFile=function(username){if(!username)return;ipcSend({__adv9:1,t:'acc',un:username,d:ACC[username]||null})};
  deleteUserFile=function(username){if(!username)return;ipcSend({__adv9:1,t:'acc-del',un:username})};
  saveOnline=function(){var now=Date.now();if(now-_onlineSaveT<15000)return;_onlineSaveT=now;ipcSend({__adv9:1,t:'online',d:ONLINE})};
  reconcileIndex=function(){};
  /* 登入時向 master 補查帳號（建帳/改密碼後立即登入的競態：master 權威狀態）*/
  var _accFetchWaiters={};
  process.on('message',function(im){if(im&&im.__adv9===1&&im.t==='acc-fetch-resp'&&_accFetchWaiters[im.un]){var fn=_accFetchWaiters[im.un];delete _accFetchWaiters[im.un];fn(im.d)}});
  function askMasterAcc(un){return new Promise(function(resolve){var t=setTimeout(function(){delete _accFetchWaiters[un];resolve(null)},800);_accFetchWaiters[un]=function(d){clearTimeout(t);resolve(d)};ipcSend({__adv9:1,t:'acc-fetch',un:un})})}
}

/* 個別帳號檔案儲存機制 (data/users/<username>.json) */
var userSaveTimers={};
function isValidUsername(un){return typeof un==='string'&&un.length>=1&&un.length<=64&&/^[a-zA-Z0-9_\u4e00-\u9fff]+$/.test(un)}
function saveUserFile(username){
  if(!username||!isValidUsername(username))return;
  if(userSaveTimers[username])return;
  userSaveTimers[username]=setTimeout(function(){
    delete userSaveTimers[username];
    if(!ACC[username]) return;
    try{
      var uFile=path.join(USERSDIR, username+'.json');
      var tmp=uFile+'.tmp';
      fs.writeFileSync(tmp, JSON.stringify(ACC[username], null, 2));
      fs.renameSync(tmp, uFile);
      saveIndex();
    }catch(e){console.error('saveUserFile', username, e&&e.message)}
  }, 300);
}

function deleteUserFile(username){
  if(!username)return;
  try{
    var uFile=path.join(USERSDIR, username+'.json');
    if(fs.existsSync(uFile)) fs.unlinkSync(uFile);
    saveIndex();
  }catch(e){console.error('deleteUserFile', username, e&&e.message)}
}

/* ── 全帳號主檔（備援）：列出所有人，帳號檔遺失/被刪時自動復原 ── */
function indexOfACC(){
  return Object.keys(ACC).filter(function(un){return !(ACC[un]&&ACC[un].hidden)}).map(function(un){
    var u=ACC[un]||{};
    return {id:u.id||un,username:un,name:u.name||un,role:u.role||'student',classId:u.classId||null,managedClassIds:u.managedClassIds||[],isSchoolAdmin:!!u.isSchoolAdmin,tokenVer:u.tokenVer||0,master:!!u.master,createdAt:u.createdAt||new Date().toISOString()};
  });
}
function saveIndex(){ /* 同步寫入（檔案小），建立/刪除帳號後立即呼叫 */
  try{
    var tmp=INDEXFILE+'.tmp';
    fs.writeFileSync(tmp, JSON.stringify(indexOfACC(),null,1));
    fs.renameSync(tmp, INDEXFILE);
  }catch(e){console.error('saveIndex',e&&e.message)}
}
var _lastReconcile=0;
function reconcileIndex(){ /* 從主檔復原遺失帳號（含檔名清單），最多每 30 秒執行一次 */
  if(Date.now()-_lastReconcile<30000)return;
  _lastReconcile=Date.now();
  try{
    var idx=loadJSON(INDEXFILE,null);
    if(!Array.isArray(idx))return;
    var restored=[];
    idx.forEach(function(ir){
      if(!ir||!ir.username||ACC[ir.username]||ir.hidden)return;
      ACC[ir.username]={id:ir.id||ir.username,username:ir.username,name:ir.name||ir.username,role:ir.role||'student',classId:ir.classId||null,managedClassIds:ir.managedClassIds||[],isSchoolAdmin:!!ir.isSchoolAdmin,pwHash:ir.pwHash||'',salt:ir.salt||'',tokenVer:ir.tokenVer||0,master:!!ir.master,password:'',g:null,createdAt:ir.createdAt||new Date().toISOString()};
      saveUserFile(ir.username);
      restored.push(ir.username);
    });
    if(restored.length)console.log('[RESTORE] 帳號主檔復原 '+restored.length+' 個帳號：'+restored.join('、'));
  }catch(e){console.error('reconcileIndex',e&&e.message)}
}

/* 從 data/users/ 載入所有個別帳號檔案 */
try{
  var ufiles=fs.readdirSync(USERSDIR);
  ufiles.forEach(function(f){
    if(f.endsWith('.json')){
      var uData=loadJSON(path.join(USERSDIR,f),null);
      if(uData && uData.username){
        ACC[uData.username]=uData;
      }
    }
  });
}catch(e){console.error('load users dir error',e)}

/* 遷移：若舊 data/accounts.json 存在，轉存入 data/users/ 個別檔案 */
var oldACC=loadJSON(ACCFILE,null);
if(oldACC && typeof oldACC==='object'){
  Object.keys(oldACC).forEach(function(un){
    if(!ACC[un] && oldACC[un]){
      ACC[un]=oldACC[un];
      saveUserFile(un);
    }
  });
  try{fs.renameSync(ACCFILE, ACCFILE+'.bak')}catch(e){}
}

/* 遷移：舊版把帳號放在 KV → 搬進私有 ACC 並存成獨立檔案 */
if(KV[USERS_KEY]){
  (Array.isArray(KV[USERS_KEY])?KV[USERS_KEY]:[]).forEach(function(u){
    if(u&&u.username&&!ACC[u.username]){
      ACC[u.username]=u;
      saveUserFile(u.username);
    }
  });
  delete KV[USERS_KEY];
  saveKV();
}

/* 種子：主管理員（只存雜湊，不存明文）*/
if(!ACC[MASTER.user]){
  ACC[MASTER.user]={id:MASTER.user,username:MASTER.user,name:MASTER.name,role:'admin',password:'',pwHash:MASTER.hash,master:true,isSchoolAdmin:true,mustChangePw:false,tokenVer:0,classId:null,createdAt:new Date().toISOString(),g:null};
  saveUserFile(MASTER.user);
}

/* 啟動復原：從全帳號主檔（users_index.json）補回遺失/被刪的帳號 */
reconcileIndex();
saveIndex();

/* 上線狀態：載入心跳記錄，清除超過 90 秒未報到者 */
var ONLINE={};
try{var _ol=loadJSON(ONLINEFILE,{});if(_ol&&typeof _ol==='object')ONLINE=_ol}catch(e){}
(function(){var now=Date.now();Object.keys(ONLINE).forEach(function(k){if(now-ONLINE[k].t>90000)delete ONLINE[k]})})();
var _onlineSaveT=0;
function saveOnline(){try{var now=Date.now();if(now-_onlineSaveT<15000)return;_onlineSaveT=now;var tmp=ONLINEFILE+'.tmp';fs.writeFileSync(tmp,JSON.stringify(ONLINE));fs.renameSync(tmp,ONLINEFILE)}catch(e){}}

/* token：無狀態 HMAC（任何 worker 皆可驗證，不需共享 token 表）*/
function tokenSig(p){return crypto.createHmac('sha256',SERVER_PEPPER).update(p).digest('base64')}
function accTokenVer(un){return (ACC[un]&&ACC[un].tokenVer)||0}
function newToken(un,role){var p=Buffer.from(JSON.stringify({u:un,r:role,tv:accTokenVer(un),exp:Date.now()+30*864e5})).toString('base64');return p+'.'+tokenSig(p)}
function checkToken(t){
  if(!t)return null;
  var i=t.lastIndexOf('.');if(i<1)return null;
  var p=t.slice(0,i),s=t.slice(i+1);
  if(s.length!==44)return null;
  try{
    if(!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(tokenSig(p))))return null;
    var e=JSON.parse(Buffer.from(p,'base64').toString('utf8'));if(!e||!e.u)return null;if(!ACC[e.u])return null;if(e.exp&&e.exp<Date.now())return null;if((e.tv||0)!==accTokenVer(e.u))return null;return{username:e.u,role:(ACC[e.u]&&ACC[e.u].role)||'student',exp:e.exp}
  }catch(x){return null}
}
/* 抹除憑證欄位，避免任何 GET 回應外洩密碼/雜湊/鹽 */
function sanitize(u){var c={};for(var k in u)if(k!=='password'&&k!=='pwHash'&&k!=='salt')c[k]=u[k];return c}
function usersArray(){return Object.keys(ACC).filter(function(k){return !(ACC[k]&&ACC[k].hidden)}).map(function(k){return sanitize(ACC[k])})}
/* 登入失敗次數限制（防暴力破解）：5 次失敗鎖 5 分鐘 */
var loginFails={};
function loginKey(un,ip){return String(un||'')+'|'+String(ip||'')}
function loginLocked(un,ip){var f=loginFails[loginKey(un,ip)];return !!(f&&f.until&&Date.now()<f.until)}
function loginFail(un,ip){var k=loginKey(un,ip),f=loginFails[k]||{n:0,until:0};f.n++;if(f.n>=5)f.until=Date.now()+5*60*1000;loginFails[k]=f}
function loginOk(un,ip){loginFails[loginKey(un,ip)]={n:0,until:0}}

/* ADV9_USERS 智能合併：依寫入者身分授權 */
async function mergeUsers(incoming,w){
  if(!Array.isArray(incoming)||!w)return;
  var isAdmin=w.role==='admin', isStaff=isAdmin||w.role==='teacher';
  var byName={}; incoming.forEach(function(u){if(u&&u.username)byName[u.username]=u});
   async function hashIfPlain(iu){ /* 若有明文密碼則雜湊後回傳（絕不存明文），否則原物件 */
    if(typeof iu.password==='string'&&iu.password!==''){
      var salt=crypto.randomBytes(16).toString('hex');
      var n=Object.assign({},iu);n.salt=salt;
      n.pwHash=await hashPassword(iu.password,salt);
      n.password='';return n;
    }
    return iu;
  }
  for(const iu of incoming){
    if(!iu||!iu.username)return; var un=iu.username, ex=ACC[un];
    if(!ex){
      if(isStaff){
        var created=await hashIfPlain(iu);
        if(!created.createdAt)created.createdAt=new Date().toISOString();
        if(!created.id)created.id=un;
        if(!created.role)created.role='student';
        if(created.tokenVer==null)created.tokenVer=0;
        ACC[un]=created;
        saveUserFile(un);
      }
      continue;
    }       /* 建立：僅 admin/teacher；明文密碼自動雜湊 */
    var self=(un===w.username), canEdit=isStaff||self;
    if(canEdit && ('g' in iu)) ex.g=iu.g;                         /* 存檔：本人或職員 */
    if(canEdit){ if('name'in iu)ex.name=iu.name; if('prof'in iu)ex.prof=iu.prof; }
    if(isStaff && ('classId'in iu)) ex.classId=iu.classId;        /* 班級：職員 */
    /* 密碼：本人或 admin 可改；主管理員密碼由伺服器設定不走此路；一律雜湊，絕不存明文 */
    if(un!==MASTER.user && (isAdmin||self) && typeof iu.password==='string' && iu.password!==''){
      var salt=crypto.randomBytes(16).toString('hex');
      ex.salt=salt;
      ex.pwHash=await hashPassword(iu.password,salt);
      ex.tokenVer=(ex.tokenVer||0)+1;
      ex.password='';
      ex.mustChangePw=false;
    }
    if(isAdmin && iu.role) ex.role=iu.role;                      /* 身分：僅 admin */
    ACC[un]=ex;
    saveUserFile(un);
  }
  /* 不因前端清單暫時不完整而刪除教師/學生帳號；帳號只能由明確刪除流程移除。 */
}
var MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.ico':'image/x-icon'};
function corsOrigin(req){
  var o=req&&req.headers&&req.headers.origin||'';
  if(!o)return null;
  try{var h=new URL(o).hostname}catch(e){return null}
  /* 允許清單：localhost/127.0.0.1 任意 port + env ADV9_ALLOWED_ORIGINS（完整 origin 精確比對）*/
  if(h==='localhost'||h==='127.0.0.1')return o;
  var extra=process.env.ADV9_ALLOWED_ORIGINS||'';
  if(extra){var list=extra.split(',').map(function(s){return s.trim()}).filter(Boolean);if(list.indexOf(o)>=0)return o;}
  return null;
}
function cors(res,req){var origin=corsOrigin(req);if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Access-Control-Allow-Credentials','true');}res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS,PATCH');res.setHeader('Access-Control-Allow-Headers','Content-Type,x-adv9-token');res.setHeader('Access-Control-Expose-Headers','Content-Type');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','SAMEORIGIN');}
/* 輸入清洗：所有寫入 KV 的資料都過此函式——字串截斷、陣列/物件深度與數量設上限，防超長輸入塞爆記憶體 */
function sanitizeInput(v,depth){
  if(depth>6)return undefined;
  if(typeof v==='string'){return v.length>100000?v.slice(0,100000):v;}
  if(typeof v==='number'){return isFinite(v)?v:0;}
  if(v===null||v===undefined||typeof v==='boolean')return v;
  if(Array.isArray(v)){if(v.length>2000)return undefined;var a=[];for(var i=0;i<v.length;i++){var s=sanitizeInput(v[i],depth+1);if(s!==undefined)a.push(s)}return a;}
  if(typeof v==='object'){var keys=Object.keys(v);if(keys.length>2000)return undefined;var o={};for(var j=0;j<keys.length;j++){var s2=sanitizeInput(v[keys[j]],depth+1);if(s2!==undefined)o[keys[j]]=s2}return o;}
  return undefined;
}
function readBody(req,cb){var ch=[],len=0,max=60*1024*1024;req.on('data',function(c){len+=c.length;if(len>max){try{req.destroy()}catch(e){}return}ch.push(c)});req.on('end',function(){cb(Buffer.concat(ch))});req.on('error',function(){cb(null)});}
var _logBuf=[];var _logTimer=null;
function flushLogs(){_logTimer=null;if(!_logBuf.length)return;var chunk=_logBuf.join('\n')+'\n';_logBuf=[];fs.appendFile(ACCESSLOG,chunk,function(){})}
function accessLog(line){
  line=String(line).replace(/\?[^ ]*/g,''); /* 不記錄 query string（避免 SSE ?token= 外洩）*/
  _logBuf.push(line);
  if(_logBuf.length>=50&&!_logTimer)flushLogs();
  else if(!_logTimer)_logTimer=setTimeout(flushLogs,5000);
}
var BUILD='v'+Date.now().toString(36); /* 每次部署/重啟皆異，前端 poll 偵測到版本變化即自動重新整理 */
/* 📡 SSE 長連線客戶端列表（模組範圍，所有請求共用） */
var SSE_CLIENTS=[]; /* {id,res,user} */
function sseBroadcast(rows){
  var payload='event: kv\ndata: '+JSON.stringify(rows)+'\n\n';
  for(var i=SSE_CLIENTS.length-1;i>=0;i--){
    try{SSE_CLIENTS[i].res.write(payload)}catch(e){SSE_CLIENTS.splice(i,1)}
  }
}
var server=http.createServer(function(req,res){
  cors(res,req);
  var u,p;try{u=new URL(req.url,'http://x');p=decodeURIComponent(u.pathname)}catch(e){res.writeHead(400);return res.end('bad url')}
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
  var tok=req.headers['x-adv9-token']||'';
  /* 首次登入強制改密碼：未改密碼前封鎖所有端點，僅放行帳號同步（改密碼）與登入 */
  try{var _mtw=checkToken(tok);
    if(_mtw&&ACC[_mtw.username]&&ACC[_mtw.username].mustChangePw===true&&!(req.method==='POST'&&p==='/rest/v1/adv9_kv')){
      res.writeHead(403,{'Content-Type':'application/json; charset=utf-8'});
      return res.end(JSON.stringify({error:'must_change_pw',message:'首次登入請先修改密碼'}));
    }
  }catch(_me){}
  var _reqStart=Date.now();
  res.on('finish',function(){try{
    accessLog(new Date().toISOString()+' '+req.method+' '+req.url+' '+res.statusCode+' '+((req.socket&&req.socket.remoteAddress)||'?')+' '+String(req.headers['user-agent']||'').slice(0,60));
    try{if(fs.statSync(ACCESSLOG).size>2*1024*1024){flushLogs();fs.copyFileSync(ACCESSLOG,ACCESSLOG+'.old');fs.writeFileSync(ACCESSLOG,'')}}catch(e2){}
  }catch(e){}});

  /* 管理資料的權威寫入端點：帳號/API 不再依賴前端 localStorage 或延遲佇列 */
  if(req.method==='POST'&&p==='/rest/v1/admin/users/create'){var cw=checkToken(tok);if(!cw||(cw.role!=='admin'&&cw.role!=='teacher')){res.writeHead(403);return res.end('forbidden')}return readBody(req,function(b){try{var nu=JSON.parse(b.toString('utf8'));if(!nu.username||!nu.password){res.writeHead(400);return res.end('missing account')}if(!isValidUsername(nu.username)){res.writeHead(400);return res.end('invalid username')}if(ACC[nu.username]){res.writeHead(409);return res.end('account exists')}if(!nu.createdAt)nu.createdAt=new Date().toISOString();if(!nu.role)nu.role='student';mergeUsers([nu],cw);saveKV();saveIndex(); /* 立即寫入主檔，防建立後崩潰/被刪遺失 */res.writeHead(201,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,user:sanitize(ACC[nu.username])}))}catch(e){res.writeHead(400);res.end('bad account')}})}
  /* 刪除帳號（僅管理員；主管理員不可刪；同步移除獨立帳號檔與其私有 KV 資料）*/
  if(req.method==='POST'&&p==='/rest/v1/admin/users/delete'){
    var dw=checkToken(tok); if(!dw || dw.role!=='admin'){res.writeHead(403);return res.end('forbidden')}
    return readBody(req,function(b){try{
      var j=JSON.parse(b.toString('utf8')); var un=(j.username||'').trim();
      if(!un||!ACC[un]){res.writeHead(404);return res.end('account not found')}
      if(ACC[un].master){res.writeHead(403);return res.end('cannot delete master admin')}
      deleteUserFile(un); delete ACC[un];
      var delKeys=[];Object.keys(KV).forEach(function(k){if(k.indexOf(un+':')===0){delete KV[k];delKeys.push(k)}});
      if(delKeys.length)ipcSend({__adv9:1,t:'kv-del',keys:delKeys});
      saveKV(); saveIndex(); /* 立即更新主檔（同步寫入，防刪除後崩潰遺失） */
      res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}));
    }catch(e){res.writeHead(400);res.end('bad delete')}})
  }
  /* 全帳號主檔查詢（管理員限定）：列出所有帳號（有誰誰誰）*/
  if(req.method==='GET'&&p==='/rest/v1/admin/users_index'){
    var iw=checkToken(tok); if(!iw || iw.role!=='admin'){res.writeHead(403);return res.end('forbidden')}
    reconcileIndex();
    res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});return res.end(JSON.stringify({ok:true,index:indexOfACC()}));
  }
  /* 👁 上線狀態心跳：有效 token 每 ~25 秒報到；回應在線名單（隱藏上線者會被過濾掉）*/
  if(req.method==='POST'&&p==='/rest/v1/user/heartbeat'){
    var hw=checkToken(tok); if(!hw){res.writeHead(401);return res.end('unauthorized')}
    return readBody(req,function(b){try{
      var j={};try{j=JSON.parse(b.toString('utf8')||'{}')}catch(e){}
      var now=Date.now();
      var prev=ONLINE[hw.username]&&ONLINE[hw.username].t;
      ONLINE[hw.username]={t:now,hide:!!j.hide};
      if(prev&&now-prev>5000&&now-prev<120000){var delta=Math.round((now-prev)/1000);ipcSend({__adv9:1,t:'hb',un:hw.username,delta:delta});}
      Object.keys(ONLINE).forEach(function(k){if(now-ONLINE[k].t>90000)delete ONLINE[k]});
      saveOnline();
      var list=Object.keys(ONLINE).filter(function(k){return !ONLINE[k].hide&&now-ONLINE[k].t<=45000}).sort();
      res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,online:list}));
    }catch(e){res.writeHead(400);res.end('bad heartbeat')}})
  }
  /* 🏆 班級戰：全班總答題數 + 在線分鐘（v4.0）*/
  if(req.method==='GET'&&p==='/rest/v1/class_war'){
    var cw2=checkToken(tok); if(!cw2){res.writeHead(401);return res.end('need login')}
    var cwData=((KV['ADV9_CLASSWAR']||{}).online)||{};
    var byClass={};
    Object.keys(ACC).forEach(function(un){
      var u=ACC[un];if(!u||u.role!=='student')return;
      var cid=u.classId||'未分班';
      var b=byClass[cid]||(byClass[cid]={classId:cid,total:0,minutes:0,users:0});
      b.users++;
      if(u.g&&u.g.stats)b.total+=(u.g.stats.total||0);
      b.minutes+=Math.round((cwData[un]||0)/60);
    });
    var cwRows=Object.keys(byClass).map(function(k){return byClass[k]}).sort(function(a,b){return (b.total-a.total)||(b.minutes-a.minutes)});
    res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true,rows:cwRows}));
  }
  /* 🧩 數獨 9x9：py 出題（sudoku_gen.py）、同場競速 + 個人最佳（v4.0）*/
  function sudokuRun(){
    return new Promise(function(resolve){
      try{
        child_process.execFile(PYTHON,[path.join(ROOT,'sudoku_gen.py')],{timeout:10000},function(e,so){
          if(e){resolve(null);return}
          var g=null;try{g=JSON.parse(so)}catch(x){}
          if(!g||!g.board||!g.answer||g.board.length!==81||g.answer.length!==81)resolve(null);else resolve(g);
        });
      }catch(e){resolve(null)}
    });
  }
  function sudokuGet(){return KV['ADV9_SUDOKU']||(KV['ADV9_SUDOKU']={current:null,best:{}})}
  if(req.method==='GET'&&p==='/rest/v1/sudoku/new'){
    var sw=checkToken(tok); if(!sw){res.writeHead(401);return res.end('need login')}
    var sk=sudokuGet(),now=Date.now(),cur=sk.current;
    var force=(new URL(req.url,'http://x')).searchParams.get('force')==='1'&&sw.role==='admin';
    if(!cur||force||(cur.ts&&now-cur.ts>4*3600*1000)){ /* 題目每 4 小時輪換；管理員可 ?force=1 立即換新 */
      sudokuRun().then(function(g){
        if(!g){res.writeHead(503,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:false,msg:'題目生成失敗'}))}
        sk.current={id:Date.now().toString(36),board:g.board,answer:g.answer,ts:now,done:{}};
        saveKV();
        res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,id:sk.current.id,board:sk.current.board,ts:sk.current.ts}));
      });
      return;
    }
    res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true,id:cur.id,board:cur.board,ts:cur.ts}));
  }
  if(req.method==='POST'&&p==='/rest/v1/sudoku/submit'){
    return readBody(req,function(b){try{
      var sw2=checkToken(tok); if(!sw2){res.writeHead(401);return res.end('need login')}
      var j={};try{j=JSON.parse(b.toString('utf8')||'{}')}catch(e){}
      var sk2=sudokuGet(),cur2=sk2.current;
      if(!cur2||cur2.id!==j.id){res.writeHead(400,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:false,msg:'題目已輪換，請重新載入'}))}
      var grid=String(j.grid||'').replace(/[^0-9]/g,'');
      if(grid.length!==81){res.writeHead(400,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:false,msg:'答案格式錯誤'}))}
      if(grid!==cur2.answer){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:false,msg:'答案不正確，再試試！'}))}
      var sec=Math.max(1,Math.min(86400,parseInt(j.sec,10)||0));
      if(!cur2.done[sw2.username]||sec<cur2.done[sw2.username])cur2.done[sw2.username]=sec;
      if(!sk2.best[sw2.username]||sec<sk2.best[sw2.username])sk2.best[sw2.username]=sec;
      saveKV();
      res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,sec:sec}));
    }catch(e){res.writeHead(400);res.end('bad submit')}})
  }
  if(req.method==='GET'&&p==='/rest/v1/sudoku/rank'){
    var sw3=checkToken(tok); if(!sw3){res.writeHead(401);return res.end('need login')}
    var sk3=sudokuGet();
    var done=[];if(sk3.current&&sk3.current.done)Object.keys(sk3.current.done).forEach(function(un){done.push({username:un,sec:sk3.current.done[un]})});
    done.sort(function(a,b){return a.sec-b.sec});
    var best=Object.keys(sk3.best||{}).map(function(un){return {username:un,sec:sk3.best[un]}}).sort(function(a,b){return a.sec-b.sec});
    res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true,currentId:sk3.current?sk3.current.id:null,done:done,best:best}));
  }
  if((req.method==='POST'||req.method==='PUT')&&p==='/rest/v1/admin/users/sync'){
    var aw=checkToken(tok); if(!aw || (aw.role!=='admin'&&aw.role!=='teacher')){res.writeHead(403);return res.end('forbidden')}
    return readBody(req,async function(b){try{var j=JSON.parse(b.toString('utf8'));await mergeUsers(j.users||j,aw);saveKV();saveIndex();console.log('[SYNC]',aw.username,'role='+aw.role,'users='+((Array.isArray(j.users)?j.users:j)||[]).length);res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,users:usersArray()}))}catch(e){res.writeHead(400);res.end('bad users')}})
  }
  if((req.method==='POST'||req.method==='PUT')&&p==='/rest/v1/admin/api_keys'){
    var ak=checkToken(tok); if(!ak || ak.role!=='admin'){res.writeHead(403);return res.end('forbidden')}
    return readBody(req,function(b){try{var j=JSON.parse(b.toString('utf8'));KV['ADV9_APIKEYS']=j;saveKV();res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}))}catch(e){res.writeHead(400);res.end('bad api keys')}})
  }

  /* KV 讀取（含抹除密碼後的帳號清單）；支援 ?k=KEY1,KEY2 只回傳指定 key（輕量快速輪詢）*/
  if(req.method==='GET'&&p==='/rest/v1/adv9_kv'){
    var w=checkToken(tok);
    reconcileIndex(); /* 定期從主檔復原遺失帳號 */
    res.setHeader('X-ADV9-VER',BUILD);
    var only=null;
    try{var qk=new URL(req.url,'http://x').searchParams.get('k');if(qk&&qk.trim())only=new Set(qk.split(',').map(function(s){return s.trim()}).filter(Boolean))}catch(e){}
    var rows=[];
    Object.keys(KV).forEach(function(k){
      if(only&&!only.has(k))return;
      if(GLOBAL_KEYS.has(k)){
        /* API 金鑰只能由管理員讀取，避免學生/老師取得第三方金鑰。 */
        if(k!=='ADV9_APIKEYS' || (w && w.role==='admin')) rows.push({k:k,v:KV[k]});
      } else if(w && k.indexOf(w.username+':')===0){ rows.push({k:k.slice(w.username.length+1), v:KV[k]}); }
    });
    if(!only)rows.push({k:USERS_KEY,v:usersArray()});
    res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(rows));
  }
  /* KV 寫入（需 token；帳號表走授權合併）*/
  if(req.method==='POST'&&p==='/rest/v1/adv9_kv'){
    var w=checkToken(tok);
    if(!w){res.writeHead(401,{'Content-Type':'text/plain; charset=utf-8'});return res.end('需要登入')}
    return readBody(req,async function(b){
      try{var arr=JSON.parse(b.toString('utf8'));var list=Array.isArray(arr)?arr:[arr];var pushRows=[];
      for(const row of list){
        if(!row||row.k==null)continue;
        row.v=sanitizeInput(row.v,0);
        if(row.k===USERS_KEY){await mergeUsers(row.v,w);pushRows.push({k:USERS_KEY,v:usersArray()})}
        else if(GLOBAL_KEYS.has(row.k)){KV[row.k]=row.v;pushRows.push({k:row.k,v:row.v})}
        else {KV[w.username+':'+row.k]=row.v}
      }saveKV();
      if(pushRows.length)sseBroadcast(pushRows); /* 📡 即時推送給所有在線端 */
      res.writeHead(201,{'Content-Type':'application/json'});res.end('[]')}
      catch(e){res.writeHead(400);res.end('bad json')}
    });
  }
  /* SSE 即時串流：EventSource 長連線，連上先送快照、之後每筆 KV 變更即時推送 */
  if(req.method==='GET'&&p==='/rest/v1/stream'){
    var qs='';try{qs=(u.searchParams&&u.searchParams.get)?(u.searchParams.get('token')||''):''}catch(e){}
    var w=checkToken(tok||qs);
    if(!w){res.writeHead(401,{'Content-Type':'text/plain; charset=utf-8'});return res.end('需要登入')}
    res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache','Connection':'keep-alive'});
    res.write('retry: 3000\n\n');
    var sid=Date.now()+'-'+Math.random();
    SSE_CLIENTS.push({id:sid,res:res,user:w.username});
    var snap=[];
    ['ADV9_PM','ADV9_TRADES','ADV9_DUELS','ADV9_GROUPS','ADV9_USERS','ADV9_FRIENDS','ADV9_CHAT','ADV9_ANN','ADV9_NOTIF'].forEach(function(k){if(KV[k]!==undefined)snap.push({k:k,v:KV[k]})});
    try{res.write('event: kv\ndata: '+JSON.stringify(snap)+'\n\n')}catch(e){}
    req.on('close',function(){for(var i=SSE_CLIENTS.length-1;i>=0;i--){if(SSE_CLIENTS[i].id===sid)SSE_CLIENTS.splice(i,1)}});
    return;
  }
  /* 系統設定 (system.json) 讀寫 */
  if(p==='/rest/v1/system_settings'){
    if(req.method==='GET'){
      var w=checkToken(tok);
      if(!w || w.role!=='admin'){
        res.writeHead(403,{'Content-Type':'text/plain; charset=utf-8'});
        return res.end('僅限管理員操作');
      }
      res.writeHead(200,{'Content-Type':'application/json'});
      return res.end(JSON.stringify(SYSSET));
    }
    if(req.method==='POST'||req.method==='PUT'){
      var w=checkToken(tok);
      if(!w || w.role!=='admin'){
        res.writeHead(403,{'Content-Type':'text/plain; charset=utf-8'});
        return res.end('僅限管理員操作');
      }
      return readBody(req,function(b){
        try{
          var j=JSON.parse(b.toString('utf8'));
          SYSSET=Object.assign(SYSSET,j);
          saveSYSSET();
          res.writeHead(200,{'Content-Type':'application/json'});
          res.end(JSON.stringify(SYSSET));
        }catch(e){res.writeHead(400);res.end('bad json')}
      });
    }
  }

  /* 單一玩家 JSON 匯出 */
  if(req.method==='GET'&&p.startsWith('/rest/v1/user_export/')){
    var targetUn=decodeURIComponent(p.replace('/rest/v1/user_export/',''));
    var w=checkToken(tok);
    if(!w || (w.role!=='admin' && w.username!==targetUn)){
      res.writeHead(403,{'Content-Type':'text/plain; charset=utf-8'});
      return res.end('無權限匯出該使用者資料');
    }
    var targetAcc=ACC[targetUn];
    if(!targetAcc){
      res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});
      return res.end('找不到該使用者');
    }
    res.writeHead(200,{
      'Content-Type':'application/json; charset=utf-8',
      'Content-Disposition':'attachment; filename="'+encodeURIComponent(targetAcc.role||'user')+'_'+encodeURIComponent(targetUn)+'.json"'
    });
    return res.end(JSON.stringify(sanitize(targetAcc),null,2));
  }

  /* 單一玩家 JSON 匯入 */
  if(req.method==='POST'&&p==='/rest/v1/user_import'){
    var w=checkToken(tok);
    if(!w || w.role!=='admin'){
      res.writeHead(403,{'Content-Type':'text/plain; charset=utf-8'});
      return res.end('僅限管理員操作');
    }
    return readBody(req,function(b){
      try{
        var j=JSON.parse(b.toString('utf8'));
        if(!j || !j.username){
          res.writeHead(400);return res.end('缺少 username 欄位');
        }
        var un=String(j.username).replace(/[^a-zA-Z0-9_\-]/g,'').slice(0,64);
        if(!un){res.writeHead(400);return res.end('username 不合法')}
        if(un===MASTER.user){res.writeHead(403);return res.end('不可覆蓋 master 帳號')}
        var safe={};
        safe.id=un;
        safe.username=un;
        safe.name=String(j.name||un).slice(0,128);
        safe.role=['student','teacher','admin'].includes(j.role)?j.role:'student';
        safe.classId=j.classId||null;
        safe.prof=j.prof||null;
        safe.g=j.g||{};
        safe.master=!!j.master;
        safe.isSchoolAdmin=!!j.isSchoolAdmin;
        safe.tokenVer=typeof j.tokenVer==='number'?j.tokenVer:0;
        safe.createdAt=j.createdAt||new Date().toISOString();
        if(j.pwHash) safe.pwHash=String(j.pwHash).slice(0,512);
        if(j.salt) safe.salt=String(j.salt).slice(0,256);
        ACC[un]=safe;
        saveUserFile(un);
        saveIndex();
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify({ok:true,username:un}));
      }catch(e){res.writeHead(400);res.end('bad json')}
    });
  }

  /* 全系統備份匯出 */
  if(req.method==='GET'&&p==='/rest/v1/system_backup'){
    var w=checkToken(tok);
    if(!w || w.role!=='admin'){
      res.writeHead(403,{'Content-Type':'text/plain; charset=utf-8'});
      return res.end('僅限管理員操作');
    }
    var backupData={
      timestamp: Date.now(),
      system_settings: SYSSET,
      users: Object.keys(ACC).map(k => sanitize(ACC[k])),
      kv: KV
    };
    res.writeHead(200,{
      'Content-Type':'application/json; charset=utf-8',
      'Content-Disposition':'attachment; filename="adv9_backup_'+Date.now()+'.json"'
    });
    return res.end(JSON.stringify(backupData,null,2));
  }

  /* 全系統還原 */
  if(req.method==='POST'&&p==='/rest/v1/system_restore'){
    var w=checkToken(tok);
    if(!w || w.role!=='admin'){
      res.writeHead(403,{'Content-Type':'text/plain; charset=utf-8'});
      return res.end('僅限管理員操作');
    }
    return readBody(req,function(b){
      try{
        var j=JSON.parse(b.toString('utf8'));
        if(j.system_settings){ SYSSET=j.system_settings; saveSYSSET(); }
        if(j.kv){ KV=j.kv; saveKV(); }
        if(Array.isArray(j.users)){
          j.users.forEach(u=>{
            if(u&&u.username){
              ACC[u.username]=u;
              saveUserFile(u.username);
            }
          });
        }
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify({ok:true}));
      }catch(e){res.writeHead(400);res.end('bad json')}
    });
  }

  /* 本地 Ollama 代理：前端 → 本伺服器 → http://127.0.0.1:11434（不走第三方、不留金鑰；任何登入者可呼叫，模型/主機可由管理員在 ADV9_APIKEYS 設定）*/
  if(req.method==='POST'&&p==='/rest/v1/ai/ollama'){
    var ow=checkToken(tok); if(!ow){res.writeHead(401,{'Content-Type':'text/plain; charset=utf-8'});return res.end('需要登入');}
    return readBody(req,function(b){
      if(!b||b.length>2*1024*1024){res.writeHead(413);return res.end('too large');}
      var j;try{j=JSON.parse(b.toString('utf8'))}catch(e){res.writeHead(400);return res.end('bad json');}
      var model=String(j.model||'qwen2.5:0.6b').slice(0,128);
      var host=String(j.host||'http://127.0.0.1:11434').slice(0,256);
      if(!/^https?:\/\//.test(host)){res.writeHead(400);return res.end('bad host');}
      var payload=JSON.stringify({model:model,messages:Array.isArray(j.messages)?j.messages:[],stream:false,temperature:typeof j.temperature==='number'?j.temperature:0.7});
      var ureq=http.request(host+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(payload)},timeout:120000},function(ures){
        var ch=[];ures.on('data',function(c){ch.push(c);if(ch.length>2*1024*1024){try{ures.destroy()}catch(e){}}});ures.on('end',function(){
          res.writeHead(ures.statusCode||500,{'Content-Type':'application/json; charset=utf-8'});
          res.end(Buffer.concat(ch));
        });
      });
      ureq.on('error',function(){res.writeHead(502,{'Content-Type':'text/plain; charset=utf-8'});res.end('無法連線本地 Ollama（'+host+'）— 請確認已安裝並啟動 ollama serve')});
      ureq.on('timeout',function(){try{ureq.destroy()}catch(e){}res.writeHead(504);res.end('ollama timeout')});
      ureq.write(payload);ureq.end();
    });
  }
  /* 背景音樂清單：回傳 media/music/ 下的音檔檔名（供前端播放器選曲）*/
  if(req.method==='GET'&&p==='/rest/v1/media/music'){
    var mw=checkToken(tok); if(!mw){res.writeHead(401);return res.end('need login')}
    fs.readdir(MEDIA+'/music',function(e,files){
      if(e){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});return res.end('[]');}
      var okExt={'.mp3':1,'.ogg':1,'.wav':1,'.flac':1,'.m4a':1,'.opus':1};
      var list=(files||[]).filter(function(f){return okExt[path.extname(f).toLowerCase()]}).sort();
      res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});
      res.end(JSON.stringify(list));
    });
    return;
  }

  /* Word/文字題目解析：只在 VPS 端解析，不把題目上傳到第三方 */
  if(req.method==='POST'&&p==='/rest/v1/docx_questions'){
    var w=checkToken(tok); if(!w || (w.role!=='teacher'&&w.role!=='admin')){res.writeHead(403);return res.end('forbidden');}
    return readBody(req,function(b){try{
      if(!b||b.length<4){res.writeHead(400);return res.end('empty file')}
var ext='.docx';
      if(b[0]===0x50&&b[1]===0x4B){ext='.docx'}                                   /* PK zip → docx */
      else if(b[0]===0x25&&b[1]===0x50){ext='.pdf'}                               /* %PDF → pdf */
      else if(b[0]===0xD0&&b[1]===0xCF){res.writeHead(415,{'Content-Type':'text/plain; charset=utf-8'});return res.end('此為舊版 .doc 格式，請先用 Word「另存新檔」存成 .docx 或 .txt 後再上傳')} /* OLE → 舊版 doc */
      else{ext='.txt'}                                                            /* 其餘視為純文字 */
      var fn=path.join(TMPDIR,'adv9_'+crypto.randomBytes(8).toString('hex')+ext);fs.writeFileSync(fn,b);
      var r=child_process.spawnSync(PYTHON,[path.join(ROOT,'docx_extract.py'),fn],{encoding:'utf8',timeout:15000});try{fs.unlinkSync(fn)}catch(e){}
      if(r.status!==0){res.writeHead(400);return res.end('parse failed')}
      res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});res.end(r.stdout||'[]');
    }catch(e){res.writeHead(500);res.end('parse error')}})
  }

  /* ═══ 作業檔案匯入（docx/txt 解析）：教師上傳 .docx 或 .txt，伺服器提取純文字回傳；另附 6 行一題格式解析結果 ═══ */
  /* 6 行一題解析：line1=題目, line2-5=四選項, line6=答案(a-d/1-4/選項全文) */
  function parseQuizTextSrv(text){
    var lines=[];(text||'').replace(/^\uFEFF/,'').split(/\r?\n/).forEach(function(l,i){if(l.trim())lines.push({n:i+1,s:l.trim()})});
    var qs=[],errs=[],i=0;
    function ai(a,o){a=a.trim();if(/^[a-dA-D]$/.test(a))return 'ABCD'.indexOf(a.toUpperCase());if(/^[1-4]$/.test(a))return +a-1;for(var k=0;k<4;k++){if(o[k]===a)return k}return -1}
    while(i<lines.length){
      if(lines.length-i<6){errs.push({line:lines[i].n,message:'題目區塊不足 6 行'});break}
      var b=lines.slice(i,i+6);
      var idx=ai(b[5].s,[b[1].s,b[2].s,b[3].s,b[4].s]);
      if(!b[0].s||!b[1].s||!b[2].s||!b[3].s||!b[4].s)errs.push({line:b[0].n,message:'題目或選項為空'});
      else if(idx<0)errs.push({line:b[5].n,message:'無法辨識答案：'+b[5].s});
      else qs.push({q:b[0].s,options:[b[1].s,b[2].s,b[3].s,b[4].s],answer:idx});
      i+=6;
    }
    return errs.length?{ok:false,errors:errs}:{ok:true,questions:qs};
  }
  if(req.method==='POST'&&p==='/rest/v1/homework/parse_file'){
    var hw=checkToken(tok);if(!hw||(hw.role!=='teacher'&&hw.role!=='admin')){res.writeHead(403);return res.end('forbidden')}
    var ct=req.headers['content-type']||'';
    if(ct.indexOf('multipart/form-data')<0){res.writeHead(400,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:false,msg:'需要 multipart/form-data'}))}
    var boundaryMatch=ct.match(/boundary=(.+)/);
    if(!boundaryMatch){res.writeHead(400,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:false,msg:'缺少 boundary'}))}
    var boundary=boundaryMatch[1].trim();
    readBody(req,function(buf){
      if(!buf||buf.length<4){res.writeHead(400,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:false,msg:'空檔案'}))}
      /* 簡易 multipart 解析：找 boundary 分隔段，提取檔案名稱與內容 */
      var sep=Buffer.from('--'+boundary);
      var parts=[];
      var pos=0;
      while(pos<buf.length){
        var idx=buf.indexOf(sep,pos);
        if(idx<0)break;
        var start=idx+sep.length;
        /* 跳過 boundary 後的 CRLF */
        if(buf[start]===0x0D&&buf[start+1]===0x0A)start+=2;
        else{pos=start;continue}
        /* 找下一個 boundary 作為結束 */
        var endIdx=buf.indexOf(sep,start);
        if(endIdx<0)endIdx=buf.length;
        /* 回退到結尾 CRLF 前 */
        var partEnd=endIdx;
        if(partEnd>=2&&buf[partEnd-2]===0x0D&&buf[partEnd-1]===0x0A)partEnd-=2;
        var partData=buf.slice(start,partEnd);
        /* 分離 header 與 body：找 \r\n\r\n */
        var headerEnd=partData.indexOf(Buffer.from('\r\n\r\n'));
        if(headerEnd<0){pos=endIdx;continue}
        var headers=partData.slice(0,headerEnd).toString('utf8');
        var body=partData.slice(headerEnd+4);
        /* 提取 filename */
        var fnMatch=headers.match(/filename="([^"]+)"/i);
        var nameMatch=headers.match(/name="([^"]+)"/i);
        if(fnMatch){parts.push({filename:fnMatch[1],name:nameMatch?nameMatch[1]:'file',data:body})}
        pos=endIdx;
      }
      if(!parts.length){res.writeHead(400,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:false,msg:'未找到檔案欄位'}))}
      var f=parts[0];
      var fname=(f.filename||'').toLowerCase();
      var content='';
      if(fname.endsWith('.txt')){
        content=f.data.toString('utf8');
      }else if(fname.endsWith('.docx')){
        /* docx 為 zip：解壓縮 word/document.xml 後用 regex 提取 <w:t> 標籤內文字 */
        try{
          var str=f.data.toString('binary');
          /* docx 內含 word/document.xml（也可能在 word/_rels/document.xml.rels 裡，但幾乎所有 docx 都有 word/document.xml）*/
          /* 使用 unzip 簡易提取：找 word/document.xml 在 zip 中的 local file header */
          var xmlContent='';
          var scanPos=0;
          var marker=Buffer.from('word/document.xml');
          while(scanPos<f.data.length){
            var found=f.data.indexOf(marker,scanPos);
            if(found<0)break;
            /* 向前找 local file header signature (PK\x03\x04) 以取得壓縮方法與大小 */
            var hdrStart=Math.max(0,found-30);
            var sig=f.data.readUInt32LE(hdrStart);
            if(sig===0x04034B50){
              var compMethod=f.data.readUInt16LE(hdrStart+8);
              var compSize=f.data.readUInt32LE(hdrStart+18);
              var uncompSize=f.data.readUInt32LE(hdrStart+22);
              var fnameLen=f.data.readUInt16LE(hdrStart+26);
              var extraLen=f.data.readUInt16LE(hdrStart+28);
              var dataStart=hdrStart+30+fnameLen+extraLen;
              if(compMethod===0){
                /* stored (未壓縮) */
                xmlContent=f.data.slice(dataStart,dataStart+uncompSize).toString('utf8');
                break;
              }else{
                /* deflate 壓縮：用 Node.js zlib */
                try{
                  var zlib=require('zlib');
                  var compressed=f.data.slice(dataStart,dataStart+compSize);
                  xmlContent=zlib.inflateRawSync(compressed).toString('utf8');
                  break;
                }catch(zErr){
                  /* zlib 失敗嘗試 inflateSync */
                  try{
                    var zlib2=require('zlib');
                    xmlContent=zlib2.inflateSync(f.data.slice(dataStart,dataStart+compSize)).toString('utf8');
                    break;
                  }catch(zErr2){
                    scanPos=found+marker.length;continue;
                  }
                }
              }
            }
            scanPos=found+marker.length;
          }
          if(!xmlContent){
            /* fallback：直接從二進位中 regex 搜尋 <w:t> 標籤 */
            var binStr=f.data.toString('binary');
            var re=/<w:t[^>]*>([^<]+)<\/w:t>/g;
            var m2;var texts=[];
            while((m2=re.exec(binStr))!==null){texts.push(m2[1])}
            content=texts.join('');
          }else{
            var re2=/<w:t[^>]*>([^<]+)<\/w:t>/g;
            var m3;var texts2=[];
            while((m3=re2.exec(xmlContent))!==null){texts2.push(m3[1])}
            content=texts2.join('');
          }
        }catch(e){
          /* 最終 fallback：嘗試 regex 於原始 buffer */
          try{
            var rawStr=f.data.toString('binary');
            var re3=/<w:t[^>]*>([^<]+)<\/w:t>/g;
            var m4;var texts3=[];
            while((m4=re3.exec(rawStr))!==null){texts3.push(m4[1])}
            content=texts3.join('');
          }catch(e2){content='[解析失敗: '+e2.message+']'}
        }
      }else{
        /* 其他格式嘗試當純文字讀取 */
        content=f.data.toString('utf8');
      }
      res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});
      res.end(JSON.stringify({ok:true,content:content,filename:f.filename,parsed:parseQuizTextSrv(content)}));
    });
    return;
  }

  /* 登入：伺服器端驗證，回傳帳號＋token（不回傳密碼）*/
  if(req.method==='POST'&&p==='/rest/v1/rpc/login_user'){
    return readBody(req,async function(b){
      var un,pw;try{var j=JSON.parse(b.toString('utf8'));un=String(j.p_username||'').slice(0,64);pw=String(j.p_password||'').slice(0,128)}catch(e){}
      var ip=req.socket&&req.socket.remoteAddress;
      if(loginLocked(un,ip)){res.writeHead(429,{'Content-Type':'text/plain; charset=utf-8'});return res.end('嘗試次數過多，請 5 分鐘後再試')}
      var ex=ACC[un],ok=false,reFetched=false;
      while(true){
        ok=false;
        if(ex){
          if(ex.master){ /* 主管理員：固定 SHA-256 雜湊（雜湊值寫死在 MASTER.hash，密碼由伺服器設定）*/
            ok=sha256(un+'|'+(pw==null?'':pw)+'|'+MASTER.salt)===ex.pwHash;
          } else if(ex.pwHash){ /* 已雜湊：Argon2id 驗證 */
            ok=await verifyHash(pw==null?'':pw,ex.pwHash,ex.salt||SERVER_PEPPER);
          } else if(typeof ex.password==='string'&&ex.password!==''){ /* 舊明文：驗證後自動升級為 Argon2id 雜湊 */
            ok=String(ex.password)===(pw==null?'':pw);
            if(ok){var salt=crypto.randomBytes(16).toString('hex');ex.salt=salt;ex.pwHash=await hashPassword(pw==null?'':pw,salt);ex.tokenVer=(ex.tokenVer||0)+1;ex.password='';saveACC();}
          }
        }
        if(ok)break;
        if(!reFetched&&IS_WORKER){ /* 本 worker 無此帳號/密碼已變更：向 master 補查（權威狀態；create 的 acc 訊息可能稍晚才到 master，故重試數次）*/
          reFetched=true;var fresh=null;
          for(var fi=0;fi<5&&!fresh;fi++){
            fresh=await askMasterAcc(un);
            if(!fresh&&fi<4)await new Promise(function(r){setTimeout(r,250)});
          }
          if(fresh){ACC[un]=fresh;ex=fresh;continue}
        }
        break;
      }
      if(!ok){loginFail(un,ip);res.writeHead(401,{'Content-Type':'text/plain; charset=utf-8'});return res.end('帳號或密碼錯誤')}
      loginOk(un,ip);
      var t=newToken(un,ex.role);
      var out={id:ex.id||ex.username,username:ex.username,name:ex.name,role:ex.role,class_id:ex.classId||null,managedClassIds:Array.isArray(ex.managedClassIds)?ex.managedClassIds:[],isSchoolAdmin:!!ex.isSchoolAdmin,prof:ex.prof||null,created_at:ex.createdAt||null,game_data:ex.g||null,token:t,must_change_pw:ex.mustChangePw===true};
      res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(out));
    });
  }
  /* 媒體 */
  var m=p.match(/^\/storage\/v1\/object\/(?:public\/)?media\/(.+)$/);
  if(m){
    var rawName=path.basename(m[1]);
    var name=rawName.replace(/[^a-zA-Z0-9_\-\.]/g,'_').slice(0,128);
    if(!name||name.startsWith('.')){res.writeHead(400);return res.end('invalid filename')}
    var file=path.join(MEDIA,name);
    if(req.method==='GET'){return fs.readFile(file,function(e,d){if(e){res.writeHead(404);return res.end('not found')}var ext=path.extname(name).toLowerCase();res.writeHead(200,{'Content-Type':MIME[ext]||'application/octet-stream','Cache-Control':'public,max-age=31536000'});res.end(d)});}
    if(req.method==='POST'||req.method==='PUT'){ if(!checkToken(tok)){res.writeHead(401);return res.end('need login')} return readBody(req,function(b){if(!b){res.writeHead(400);return res.end('no body')}fs.writeFile(file,b,function(e){if(e){res.writeHead(500);return res.end('write err')}res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({Key:'media/'+name}))})});}
    if(req.method==='DELETE'){ if(!checkToken(tok)){res.writeHead(401);return res.end('need login')} fs.unlink(file,function(){});res.writeHead(200);return res.end('[]');}
  }
  /* 娃娃 API（依擁有者 / admin 授權）*/
  var dm=p.match(/^\/rest\/v1\/doll\/(.+)$/);
  if(dm){
    var dk=decodeURIComponent(dm[1]);
    var w=checkToken(tok);
    if(!w){res.writeHead(401);return res.end('need login')}
    var isAdmin=w.role==='admin';
    var ownKey='dolls:'+w.username;
    var isGlobal=(dk==='admin/dolls'||dk==='shop_dolls'||dk==='events');
    /* 授權：全域管理 key 僅 admin；其餘只能操作自己的 dolls:<username> */
    if(isGlobal && !isAdmin){res.writeHead(403);return res.end('forbidden')}
    if(!isGlobal && dk!==ownKey){res.writeHead(403);return res.end('forbidden')}
    if(req.method==='GET'){
      if(isGlobal && dk==='admin/dolls'){
        var owners=Object.keys(DOLL);
        var result=owners.map(function(o){return{owner:o,dolls:DOLL[o]||[]}});
        res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(result));
      }
      res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(DOLL[dk]||null));
    }
    if(req.method==='POST'||req.method==='PUT'){
      return readBody(req,function(b){
        try{var j=JSON.parse(b.toString('utf8'));
          if(isGlobal){
            if(dk==='shop_dolls')SHOP=j; else if(dk==='events')EVENTS=j; else {var obj={};j.forEach(function(r){if(r.owner)obj[r.owner]=r.dolls});DOLL=obj;}
            saveDOLL();saveSHOP();saveEVENTS();
          } else {
            if(Array.isArray(j)){ /* 一人一個娃娃：擁有者名下超過 1 個即拒絕（v4.0）*/
              var mine=j.filter(function(x){return x&&x.owner===w.username});
              if(mine.length>1){res.writeHead(400,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:false,msg:'每個人只能擁有一個娃娃'}));}
            }
            DOLL[dk]=j; saveDOLL();
          }
          res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(j));
        }catch(e){res.writeHead(400);res.end('bad json')}
      });
    }
    if(req.method==='DELETE'){
      if(isGlobal){res.writeHead(403);return res.end('forbidden')} /* 全域資料不開放單鍵刪除 */
      delete DOLL[dk];saveDOLL();res.writeHead(200);return res.end('[]');
    }
  }
  /* 即時發放（獨立端點：免 15 秒雲端輪詢、避免競態，直接對 ACC 加總並落檔）*/
  if(req.method==='POST'&&p==='/rest/v1/grant'){
    var w=checkToken(tok); if(!w){res.writeHead(401,{'Content-Type':'text/plain; charset=utf-8'});return res.end('需要登入');}
    if(w.role!=='admin'&&w.role!=='teacher'){res.writeHead(403,{'Content-Type':'text/plain; charset=utf-8'});return res.end('forbidden');}
    return readBody(req,function(b){
      try{
        var j=JSON.parse(b.toString('utf8')||'{}');
        var rw=j.rw||{}, char=(j.char||''), target=(j.target||'all');
        var targets=[];
        if(target==='all'){ targets=Object.keys(ACC).filter(function(un){return ACC[un].role==='student';}); }
        else if(ACC[target]){ targets=[target]; }
        else { res.writeHead(400,{'Content-Type':'text/plain; charset=utf-8'});return res.end('找不到目標'); }
        var n=0;
        targets.forEach(function(un){
          var g=ACC[un].g; if(!g)return;
          for(var k in rw){ if(!(rw[k]>0))continue;
            if(k==='star'){ if(!g.star||typeof g.star!=='object')g.star={coin:0}; g.star.coin=(Number(g.star.coin)||0)+rw[k]; }
            else { g[k]=(Number(g[k])||0)+rw[k]; }
          }
          if(char && g.owned && g.owned.character && g.owned.character.indexOf(char)<0){ g.owned.character.push(char); }
          saveUserFile(un); n++;
        });
        res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,n:n}));
      }catch(e){res.writeHead(400);res.end('bad json');}
    });
  }
  /* 管理員：寫入目標用戶的 reroll 屬性資料 */
  if(req.method==='POST'&&p==='/rest/v1/admin/reroll_grant'){
    var w=checkToken(tok); if(!w){res.writeHead(401,{'Content-Type':'text/plain; charset=utf-8'});return res.end('需要登入');}
    if(w.role!=='admin'){res.writeHead(403,{'Content-Type':'text/plain; charset=utf-8'});return res.end('forbidden');}
    return readBody(req,function(b){
      try{
        var j=JSON.parse(b.toString('utf8')||'{}');
        var target=j.target,attr=j.attr,value=j.value;
        if(!target||!attr){res.writeHead(400,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:'缺少 target 或 attr'}));}
        if(!ACC[target]){res.writeHead(404,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:'找不到用戶 '+target}));}
        var rkey=target+'|reroll';
        var rd=typeof KV[rkey]==='object'&&KV[rkey]?KV[rkey]:{attr:{}};
        if(typeof rd.attr!=='object')rd.attr={};
        rd.attr[attr]=value||'∞';
        KV[rkey]=rd;
        saveKV();
        res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}));
      }catch(e){res.writeHead(400);res.end('bad json');}
    });
  }
  /* 管理員/教師：發放裝備（寫入目標學生的隔離 ADV9_EQUIP，client 雲端同步後可見）*/
  if(req.method==='POST'&&p==='/rest/v1/grant_equip'){
    var w=checkToken(tok); if(!w){res.writeHead(401,{'Content-Type':'text/plain; charset=utf-8'});return res.end('需要登入');}
    if(w.role!=='admin'&&w.role!=='teacher'){res.writeHead(403,{'Content-Type':'text/plain; charset=utf-8'});return res.end('forbidden');}
    return readBody(req,function(b){
      try{
        var j=JSON.parse(b.toString('utf8')||'{}');
        var eq=j.eq, target=(j.target||'all');
        if(!eq||typeof eq!=='object'){res.writeHead(400,{'Content-Type':'text/plain; charset=utf-8'});return res.end('缺少 eq');}
        var targets=[];
        if(target==='all'){ targets=Object.keys(ACC).filter(function(un){return ACC[un]&&ACC[un].role==='student';}); }
        else if(ACC[target]){ targets=[target]; }
        else { res.writeHead(400,{'Content-Type':'text/plain; charset=utf-8'});return res.end('找不到目標'); }
        var n=0;
        targets.forEach(function(un){
          var key=un+':ADV9_EQUIP';
          var d=KV[key]?JSON.parse(JSON.stringify(KV[key])):{owned:[],equipped:{頭:null,衣服:null,褲子:null,鞋子:null,武器:null,戒指:null,項鍊:null}};
          if(!d.owned)d.owned=[];
          var item=JSON.parse(JSON.stringify(eq)); item.id='eq'+Date.now()+Math.random().toString(36).slice(2,8);
          d.owned.push(item); KV[key]=d; n++;
        });
        saveKV();
        res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,n:n}));
      }catch(e){res.writeHead(400,{'Content-Type':'text/plain; charset=utf-8'});res.end('bad json');}
    });
  }
  /* ═══════ 新增 API：AI Provider / 出題驗證 / 同意 / 信任 / 沙盒 ═══════ */

  /* AI Provider CRUD（管理員限定）*/
  if(req.method==='GET'&&p==='/rest/v1/ai/providers'){
    var pw=checkToken(tok);if(!pw||pw.role!=='admin'){res.writeHead(403);return res.end('forbidden')}
    var data=KV['ADV9_AI_PROVIDERS']||{providers:[],usage:[]};
    /* 隱藏 API Key 回傳 */
    var safe=JSON.parse(JSON.stringify(data));
    safe.providers.forEach(function(p){p.api_key=p.api_key?'***'+p.api_key.slice(-4):''});
    res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(safe));
  }
  if((req.method==='POST'||req.method==='PUT')&&p==='/rest/v1/ai/providers'){
    var pw2=checkToken(tok);if(!pw2||pw2.role!=='admin'){res.writeHead(403);return res.end('forbidden')}
    return readBody(req,function(b){try{
      var j=JSON.parse(b.toString('utf8'));
      var data=KV['ADV9_AI_PROVIDERS']||{providers:[],usage:[]};
      if(j.id){/* 更新 */
        var idx=data.providers.findIndex(function(x){return x.id===j.id});
        if(idx>=0){Object.assign(data.providers[idx],j,data.providers[idx]);}
        else{j.id='ap_'+Date.now();data.providers.push(j);}
      }else{/* 新增 */
        j.id='ap_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
        j.created_at=new Date().toISOString();
        data.providers.push(j);
      }
      j.updated_at=new Date().toISOString();
      KV['ADV9_AI_PROVIDERS']=data;saveKV();
      res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}));
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }
  if(req.method==='DELETE'&&p.startsWith('/rest/v1/ai/providers/')){
    var pw3=checkToken(tok);if(!pw3||pw3.role!=='admin'){res.writeHead(403);return res.end('forbidden')}
    var pid=p.replace('/rest/v1/ai/providers/','');
    var data2=KV['ADV9_AI_PROVIDERS']||{providers:[],usage:[]};
    data2.providers=data2.providers.filter(function(x){return x.id!==pid});
    KV['ADV9_AI_PROVIDERS']=data2;saveKV();
    res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true}));
  }
  if(req.method==='POST'&&p.startsWith('/rest/v1/ai/providers/')&&p.endsWith('/test')){
    var pw4=checkToken(tok);if(!pw4){res.writeHead(401);return res.end('need login')}
    var pid2=p.replace('/rest/v1/ai/providers/','').replace('/test','');
    var data3=KV['ADV9_AI_PROVIDERS']||{providers:[],usage:[]};
    var prov=data3.providers.find(function(x){return x.id===pid2});
    if(!prov){res.writeHead(404);return res.end('provider not found')}
    /* 簡單測試：嘗試呼叫 API */
    return readBody(req,function(b){try{
      var j2=JSON.parse(b.toString('utf8')||'{}');
      var prompt=j2.prompt||'請回答：1+1=? 只回答數字';
      /* 轉發到 provider */
      var timeout=prov.timeout||15000;
      var url=prov.base_url||'';
      if(prov.provider_type==='ol'){url='/rest/v1/ai/ollama';}
      var payload;
      if(prov.provider_type==='gm'){
        url='https://generativelanguage.googleapis.com/v1beta/models/'+prov.model_name+':generateContent?key='+prov.api_key;
        payload=JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.7,maxOutputTokens:256}});
      }else if(prov.provider_type==='ol'){
        payload=JSON.stringify({model:prov.model_name,host:prov.api_key||'http://127.0.0.1:11434',messages:[{role:'user',content:prompt}],temperature:0.7});
      }else{
        payload=JSON.stringify({model:prov.model_name,messages:[{role:'user',content:prompt}],temperature:0.7,max_tokens:256});
      }
      var headers={'Content-Type':'application/json'};
      if(prov.provider_type!=='gm'&&prov.provider_type!=='ol'){headers['Authorization']='Bearer '+prov.api_key;}
      var req2=http.request(url,{method:'POST',headers:headers,timeout:timeout},function(ures){
        var ch=[];ures.on('data',function(c){ch.push(c)});ures.on('end',function(){
          var body=Buffer.concat(ch).toString();
          try{var rj=JSON.parse(body);
            var txt='NO_CONTENT';
            if(rj.choices&&rj.choices[0]&&rj.choices[0].message)txt=rj.choices[0].message.content;
            else if(rj.candidates&&rj.candidates[0])txt=rj.candidates[0].content.parts[0].text;
            else if(rj.message)txt=rj.message.content;
            res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,response:txt.substring(0,200),status:ures.statusCode}));
          }catch(e2){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,status:ures.statusCode,response:body.substring(0,200)}));}
        });
      });
      req2.on('error',function(e3){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:e3.message}));});
      req2.on('timeout',function(){try{req2.destroy()}catch(e4){}res.writeHead(504);res.end(JSON.stringify({ok:false,error:'timeout'}));});
      req2.write(payload);req2.end();
    }catch(e5){res.writeHead(400);res.end('bad json')}});
  }

  /* 出題驗證（教師/管理員限定）*/
  if(req.method==='POST'&&p==='/rest/v1/questions/validate'){
    var qw=checkToken(tok);if(!qw||(qw.role!=='teacher'&&qw.role!=='admin')){res.writeHead(403);return res.end('forbidden')}
    return readBody(req,function(b){try{
      var questions=JSON.parse(b.toString('utf8'));
      if(!Array.isArray(questions))questions=[questions];
      var validator=path.join(ROOT,'tools','question_validator.py');
      if(!fs.existsSync(validator)){res.writeHead(500);return res.end('validator not found')}
      var fn=path.join(TMPDIR,'adv9_vq_'+crypto.randomBytes(4).toString('hex')+'.json');
      fs.writeFileSync(fn,JSON.stringify(questions));
      var r=child_process.spawnSync(PYTHON,[validator,fn],{encoding:'utf8',timeout:15000});
      try{fs.unlinkSync(fn)}catch(e2){}
      if(r.status!==0){res.writeHead(500);return res.end('validation failed')}
      res.writeHead(200,{'Content-Type':'application/json'});res.end(r.stdout||'{}');
    }catch(e){res.writeHead(500);res.end('validate error')}});
  }

  /* 同意管理（學生限定）*/
  if(req.method==='POST'&&p==='/rest/v1/consent/grant'){
    var cw2=checkToken(tok);if(!cw2||cw2.role!=='student'){res.writeHead(403);return res.end('forbidden')}
    return readBody(req,function(b){try{
      var j=JSON.parse(b.toString('utf8')||'{}');
      var sid=cw2.username;
      var consentKey=sid+':ADV9_CONSENT';
      var consentData=KV[consentKey]||{events:[]};
      var now=new Date().toISOString();
      /* 停用現有同意 */
      consentData.events.forEach(function(e){if(e.status==='granted'&&!e.revoked_at){e.status='revoked';e.revoked_at=now;}});
      consentData.events.push({
        id:'ce_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),
        student_id:sid,status:'granted',scope:j.scope||'frontend_trace',
        granted_at:now,revoked_at:null,data_deletion_due_at:null,data_purged:false
      });
      KV[consentKey]=consentData;saveKV();
      res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}));
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }
  if(req.method==='POST'&&p==='/rest/v1/consent/revoke'){
    var cw3=checkToken(tok);if(!cw3||cw3.role!=='student'){res.writeHead(403);return res.end('forbidden')}
    var sid2=cw3.username;
    var consentKey2=sid2+':ADV9_CONSENT';
    var cd=KV[consentKey2]||{events:[]};
    var now2=new Date().toISOString();
    cd.events.forEach(function(e){if(e.status==='granted'&&!e.revoked_at){e.status='revoked';e.revoked_at=now2;e.data_deletion_due_at=new Date(Date.now()+7*86400000).toISOString();}});
    KV[consentKey2]=cd;saveKV();
    res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true}));
  }
  if(req.method==='GET'&&p.startsWith('/rest/v1/consent/status/')){
    var cw4=checkToken(tok);if(!cw4){res.writeHead(401);return res.end('need login')}
    var target=p.replace('/rest/v1/consent/status/','');
    /* 只有本人、家長、管理員可查 */
    if(cw4.username!==target&&cw4.role!=='admin'&&cw4.role!=='teacher'){
      res.writeHead(403);return res.end('forbidden');
    }
    var cd2=KV[target+':ADV9_CONSENT']||{events:[]};
    var active=cd2.events.find(function(e){return e.status==='granted'&&!e.revoked_at});
    res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true,active:!!active,event:active||null}));
  }

  /* 信任公約 & 邀請管理 */
  if(req.method==='POST'&&p==='/rest/v1/trust/agreement/accept'){
    var cw5=checkToken(tok);if(!cw5){res.writeHead(401);return res.end('need login')}
    return readBody(req,function(b){try{
      var trust=KV['ADV9_TRUST']||{parents:[],students:[],invitations:[],violation_logs:[]};
      var now3=new Date().toISOString();
      var existing=trust.parents.find(function(p2){return p2.username===cw5.username});
      if(existing&&existing.suspension_status==='suspended'){res.writeHead(403);return res.end('suspended')}
      if(existing){existing.trust_agreement_accepted=true;existing.accepted_at=now3;}
      else{trust.parents.push({id:'p_'+Date.now(),username:cw5.username,name:cw5.name||cw5.username,trust_agreement_accepted:true,accepted_at:now3,suspension_status:null,suspended_until:null,suspension_reason:null});}
      KV['ADV9_TRUST']=trust;saveKV();
      res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}));
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }
  if(req.method==='POST'&&p==='/rest/v1/trust/invitations'){
    var cw6=checkToken(tok);if(!cw6||cw6.role!=='admin'){res.writeHead(403);return res.end('forbidden')}
    return readBody(req,function(b){try{
      var j=JSON.parse(b.toString('utf8'));
      var trust2=KV['ADV9_TRUST']||{parents:[],students:[],invitations:[],violation_logs:[]};
      /* 檢查家長停權 */
      var pe=trust2.parents.find(function(p2){return p2.username===cw6.username});
      if(pe&&pe.suspension_status==='suspended'){res.writeHead(403);return res.end('suspended')}
      /* 檢查冷卻 */
      var cd3=trust2.invitations.find(function(i){return i.parent_id===cw6.username&&i.student_id===j.student_id&&i.status==='declined'&&i.cooldown_until&&Date.now()<new Date(i.cooldown_until).getTime()});
      if(cd3){res.writeHead(429);return res.end('cooldown')}
      trust2.invitations.push({id:'inv_'+Date.now(),parent_id:cw6.username,student_id:j.student_id,task_id:null,message:j.message||'邀請你加入學習挑戰',status:'pending',created_at:new Date().toISOString(),responded_at:null,cooldown_until:null});
      KV['ADV9_TRUST']=trust2;saveKV();
      res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}));
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }
  if(req.method==='POST'&&p.startsWith('/rest/v1/trust/invitations/')&&(p.endsWith('/accept')||p.endsWith('/decline'))){
    var cw7=checkToken(tok);if(!cw7||cw7.role!=='student'){res.writeHead(403);return res.end('forbidden')}
    var invId=p.split('/')[5];
    var status=p.endsWith('/accept')?'accepted':'declined';
    return readBody(req,function(b){try{
      var trust3=KV['ADV9_TRUST']||{parents:[],students:[],invitations:[],violation_logs:[]};
      var inv=trust3.invitations.find(function(i2){return i2.id===invId&&i2.student_id===cw7.username});
      if(!inv){res.writeHead(404);return res.end('not found')}
      var now4=new Date().toISOString();
      inv.status=status;inv.responded_at=now4;
      if(status==='declined')inv.cooldown_until=new Date(Date.now()+24*3600000).toISOString();
      if(status==='accepted'){
        var existing2=trust3.students.find(function(s){return s.username===cw7.username});
        if(existing2){existing2.guardian_id=inv.parent_id;}
        else{trust3.students.push({id:'s_'+Date.now(),username:cw7.username,guardian_id:inv.parent_id,guardian_mode_enabled:false,last_consent_at:now4,last_consent_revoked_at:null,active_consent_id:null});}
      }
      KV['ADV9_TRUST']=trust3;saveKV();
      res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}));
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }

  /* 違規偵測 */
  if(req.method==='POST'&&p==='/rest/v1/trust/violation/detect'){
    var cw8=checkToken(tok);if(!cw8||cw8.role!=='admin'){res.writeHead(403);return res.end('forbidden')}
    return readBody(req,function(b){try{
      var j=JSON.parse(b.toString('utf8'));
      var trust4=KV['ADV9_TRUST']||{parents:[],students:[],invitations:[],violation_logs:[]};
      trust4.violation_logs.push({
        id:'vl_'+Date.now(),parent_id:j.parent_id,student_id:j.student_id,
        violation_type:j.violation_type||'unknown',attempted_action:j.attempted_action||'',
        request_payload_summary:j.summary||'',detected_at:new Date().toISOString(),
        result:j.result||'detected',suspension_applied:!!j.suspend
      });
      /* 自動停權 */
      if(j.suspend){
        var pe2=trust4.parents.find(function(p2){return p2.username===j.parent_id});
        if(pe2){pe2.suspension_status='suspended';pe2.suspended_until=new Date(Date.now()+30*86400000).toISOString();pe2.suspension_reason=j.violation_type;}
      }
      KV['ADV9_TRUST']=trust4;saveKV();
      res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}));
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }

  /* ── 沙盒執行安全輔助 ──
     SB_ENV：最小環境變數（PATH/SYSTEMROOT/TEMP/TMP），不洩漏 ADV9_PEPPER 等機密
     SB_PATTERNS：靜態黑名單（best-effort，非完整沙箱；僅擋明顯攻擊主機的模式） */
  var SB_ENV={PATH:process.env.PATH||'',SYSTEMROOT:process.env.SYSTEMROOT||'C:\\Windows',TEMP:process.env.TEMP||'C:\\Windows\\Temp',TMP:process.env.TMP||'C:\\Windows\\Temp'};
  var SB_PATTERNS=[/child_process/,/require\s*\(/,/os\.system/,/subprocess/,/\bsocket\b/i,/Runtime\.getRuntime\(\)\.exec/,/popen\s*\(/i,/ctypes/i,/processbuilder/i,/rmtree/i,/eval\s*\(/i,/exec\(base64/i];
  function sbRateLimit(username){
    var now=Date.now(),w=Math.floor(now/60000);
    if(!sbRateLimit._gc||now-sbRateLimit._gc>300000){ /* 定期清掉過期視窗，防 map 無限成長 */
      sbRateLimit._gc=now;
      Object.keys(SB_RATE).forEach(function(k){if(SB_RATE[k].win!==w)delete SB_RATE[k]});
    }
    var e=SB_RATE[username];
    if(!e||e.win!==w){e={win:w,n:0};SB_RATE[username]=e;}
    e.n++;return e.n<=10;
  }
  function sbScan(code){
    for(var i=0;i<SB_PATTERNS.length;i++){if(SB_PATTERNS[i].test(code))return false;}
    return true;
  }
  var SB_RATE={};
  /* 程式碼沙盒執行 */
  if(req.method==='POST'&&p==='/rest/v1/sandbox/run'){
    var cw9=checkToken(tok);if(!cw9){res.writeHead(401);return res.end('need login')}
    return readBody(req,function(b){try{
      if(!sbRateLimit(cw9.username)){res.writeHead(429);return res.end('rate limit: max 10 executions/min')}
      var j=JSON.parse(b.toString('utf8'));
      var lang=String(j.lang||'python').slice(0,10);
      var code=String(j.code||'');
      if(!code){res.writeHead(400);return res.end('no code')}
      if(Buffer.byteLength(code,'utf8')>50*1024){res.writeHead(413);return res.end('submission too large (max 50KB)')}
      if(!sbScan(code)){res.writeHead(400);return res.end('blocked: dangerous pattern detected')}
      /* 每次執行使用獨立暫存目錄，結束後遞迴清除 */
      var sbDir=fs.mkdtempSync(path.join(os.tmpdir(),'adv9sb-'));
      var result={stdout:'',stderr:'',exit_code:1,time_ms:0,error:null};
      var t0=Date.now();
      try{
        if(lang==='python'){
          var fn=path.join(sbDir,'main.py');fs.writeFileSync(fn,code);
          var r2=child_process.spawnSync(PYTHON,['-I',fn],{encoding:'utf8',cwd:sbDir,env:SB_ENV,timeout:3000,killSignal:'SIGKILL',maxBuffer:1024*1024,windowsHide:true});
          result.stdout=r2.stdout||'';result.stderr=r2.stderr||'';result.exit_code=r2.status;
        }else if(lang==='cpp'){
          var src=path.join(sbDir,'main.cpp'),outFn=path.join(sbDir,'prog'+(process.platform==='win32'?'.exe':''));
          fs.writeFileSync(src,code);
          var rc=child_process.spawnSync('g++',[src,'-o',outFn,'-std=c++17','-pthread'],{encoding:'utf8',cwd:sbDir,env:SB_ENV,timeout:5000,killSignal:'SIGKILL',maxBuffer:1024*1024,windowsHide:true});
          if(rc.status===0){
            var r3=child_process.spawnSync(outFn,[],{encoding:'utf8',cwd:sbDir,env:SB_ENV,timeout:3000,killSignal:'SIGKILL',maxBuffer:1024*1024,windowsHide:true});
            result.stdout=r3.stdout||'';result.stderr=r3.stderr||'';result.exit_code=r3.status;
          }else{result.stderr=(rc.stderr||'')+'\n編譯失敗';result.exit_code=rc.status;}
        }else if(lang==='java'){
          /* Java：寫入對應 class 的 .java 檔案 */
          var clsMatch=code.match(/public\s+class\s+(\w+)/);
          var clsName=clsMatch?clsMatch[1]:'Main';
          var javaFile=path.join(sbDir,clsName+'.java');
          fs.writeFileSync(javaFile,code);
          var rc2=child_process.spawnSync('javac',[javaFile],{encoding:'utf8',cwd:sbDir,env:SB_ENV,timeout:5000,killSignal:'SIGKILL',maxBuffer:1024*1024,windowsHide:true});
          if(rc2.status===0){
            var r4=child_process.spawnSync('java',['-cp',sbDir,clsName],{encoding:'utf8',cwd:sbDir,env:SB_ENV,timeout:3000,killSignal:'SIGKILL',maxBuffer:1024*1024,windowsHide:true});
            result.stdout=r4.stdout||'';result.stderr=r4.stderr||'';result.exit_code=r4.status;
          }else{result.stderr=(rc2.stderr||'')+'\n編譯失敗';result.exit_code=rc2.status;}
        }else{result.error='不支援的語言：'+lang+'。支援：python/cpp/java';}
      }catch(e5){result.error=e5.message;}
      finally{try{fs.rmSync(sbDir,{recursive:true,force:true})}catch(ec){}}
      result.time_ms=Date.now()-t0;
      res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(result));
    }catch(e6){res.writeHead(400);res.end('bad json')}});
  }
  if(req.method==='GET'&&p==='/rest/v1/sandbox/languages'){
    res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify([{id:'python',name:'Python'},{id:'cpp',name:'C++'},{id:'java',name:'Java'}]));
  }

  /* ── C++ 計算黑盒：修練場模擬/掉落（邏輯封裝於編譯後的 calc_blackbox，黑盒不揭露內部）── */
  function runBlackbox(body,cb){
    var exe=path.join(ROOT,'calc_blackbox'+(process.platform==='win32'?'.exe':''));
    if(!fs.existsSync(exe)){return jsCalc(body,cb)}
    try{
      var r=child_process.spawnSync(exe,[],{input:body,encoding:'utf8',timeout:10000,maxBuffer:1024*1024});
      if(r.status!==0){return jsCalc(body,cb)}
      cb(null,JSON.parse(r.stdout||'{}'));
    }catch(e){jsCalc(body,cb)}
  }
  /* JS fallback：沒有 C++ 黑盒時用純 JS 同邏輯（結果與 C++ 略有不同但規則一致） */
  function jsCalc(body,cb){
    try{
      var j=JSON.parse(body),a=j.action||'simulate';
      function mulberry32(seed){var t=seed>>>0;return function(){t+=0x6D2B79F5;var r=Math.imul(t^t>>>15,1|t);r^=r+Math.imul(r^r>>>7,61|t);return((r^r>>>14)>>>0)/4294967296}}
      function pickRng(seedStr){var h=2166136261;for(var i=0;i<seedStr.length;i++){h^=seedStr.charCodeAt(i);h=Math.imul(h,16777619)}return mulberry32(h)}
      if(a==='simulate'){
        var ticks=Math.max(1,Math.min(100000,Number(j.ticks)||1));
        var enemies=Math.max(0,Math.min(1000,Number(j.enemies)||0));
        var r=pickRng(String(j.seed||1)),td=0,k=0,ts=0;
        for(var t=0;t<ticks;t++){for(var e=0;e<enemies;e++){if(r()<0.72){td+=8+Math.floor(r()*30);if(r()<0.38)k++}}if(r()<0.02)break;ts++}
        return cb(null,{totalDamage:td,kills:k,tickSurvived:ts,rounds:ticks,fallback:true});
      }
      if(a==='loot'){
        var count=Math.max(1,Math.min(50,Number(j.count)||1)),tier=Math.max(1,Math.min(10,Number(j.tier)||1));
        var r2=pickRng(String(j.seed||1)+'L'),out=[];
        var slots=['武器','護甲','戒指','項鏈','護符','鞋子','頭盔','盾牌'],attrs=['攻擊','防禦','生命','魔力','敏捷','暴擊'];
        for(var i2=0;i2<count;i2++){
          var roll=Math.floor(r2()*100);
          var rar=roll+(tier>=5?4:0)>=97?'UR':roll+(tier>=5?4:0)>=88?'SSR':roll+(tier>=5?4:0)>=70?'SR':roll+(tier>=5?4:0)>=40?'R':'N';
          out.push({slot:slots[Math.floor(r2()*8)],rarity:rar,attr:attrs[Math.floor(r2()*6)],value:3+Math.floor(r2()*18)+tier*4});
        }
        return cb(null,out);
      }
      if(a==='sm2'){
        var q=Math.max(0,Math.min(5,Number(j.quality)||0)),reps=Number(j.reps)||0,iv=Number(j.intervalDays)||1,ef=Number(j.ease)||2.5,lp=Number(j.lapses)||0;
        if(ef<1.3)ef=2.5;
        if(q<3){reps=0;iv=1;if(ef>1.3)ef-=0.2;lp++;}else{reps++;if(reps===1)iv=1;else if(reps===2)iv=6;else iv=iv*ef;if(iv>365)iv=365;ef=ef+(0.1-(5-q)*(0.08+(5-q)*0.02));if(ef<1.3)ef=1.3;}
        return cb(null,{intervalDays:Math.round(iv*10)/10,ease:Math.round(ef*100)/100,reps:reps,lapses:lp,dueInDays:Math.round(iv),status:q<3?'again':(reps<=2?'learning':'review'),fallback:true});
      }
      if(a==='rogue'){
        var stage=Math.max(1,Math.min(50,Number(j.stage)||1)),level=Math.max(1,Number(j.level)||1),flavor=Math.max(0,Math.min(2,Number(j.flavor)||0));
        var r3=pickRng(String(j.seed||1)+'R'+level),types=['battle','study','event','treasure'];
        var titles=[['迷霧森林','古代遺跡','星夜草原','裂谷深淵','暮色高塔','寂靜冰原'],['知識迷宮','考場幻境','課本之森','錯題沼澤','公式岩洞','概念星河'],['問題迴廊','記憶試煉','理解之橋','反思秘境','領悟聖殿','超越之塔']];
        var choices=[['正面迎戰','繞道偷襲','呼叫同伴','專心冥想'],['複習重點','挑戰難題','請教導師','休息恢復'],['仔細觀察','大膽嘗試','記錄筆記','分享心得']];
        var route=[];
        for(var s2=0;s2<stage;s2++){
          var t2=s2%5===4||s2===stage-1?1:Math.floor(r3()*4);
          var nch=2+Math.floor(r3()*3),cs=[];
          for(var c2=0;c2<nch;c2++)cs.push({text:choices[flavor][Math.floor(r3()*4)],effect:String(1+Math.floor(r3()*4))});
          route.push({id:'s'+s2+'_'+Math.floor(10+r3()*90),type:types[t2],title:titles[flavor][Math.floor(r3()*6)],choices:cs,reward:(level+1)*(3+Math.floor(r3()*6))*(s2+1)});
        }
        return cb(null,{route:route,fallback:true});
      }
      if(a==='pick'){
        var count2=Math.max(1,Math.min(200,Number(j.count)||1)),pool=j.pool||[];
        if(!pool.length)return cb(null,[]);
        var r4=pickRng(String(j.seed||1)+'P'),arr=pool.map(function(x){return{x:x,acc:(Number(x.acc)||0)+r4()*0.15}});
        arr.sort(function(a,b){return a.acc-b.acc});
        return cb(null,arr.slice(0,count2).map(function(x){return x.x.id}));
      }
      cb(null,{error:'unknown action '+a});
    }catch(e){cb(null,{error:e.message})}
  }
  if(req.method==='POST'&&p.indexOf('/rest/v1/calc/')===0){
    var cwA=checkToken(tok);if(!cwA){res.writeHead(401);return res.end('need login')}
    return readBody(req,function(b){try{
      var j=JSON.parse(b.toString('utf8'));
      if(p==='/rest/v1/calc/simulate')j.action='simulate';
      else if(p==='/rest/v1/calc/loot')j.action='loot';
      else if(p==='/rest/v1/calc/sm2')j.action='sm2';
      else if(p==='/rest/v1/calc/rogue')j.action='rogue';
      else if(p==='/rest/v1/calc/pick')j.action='pick';
      else {res.writeHead(404);return res.end('unknown calc action')}
      runBlackbox(JSON.stringify(j),function(err,out){
        if(err){res.writeHead(500,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:String(err)}))}
        if(!out||out.error){res.writeHead(500,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:(out&&out.error)||'blackbox error'}))}
        res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(out));
      });
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }

  /* ═══ 學習寶庫（v8.0）：筆記 / 閃卡 / 測驗規劃 / 進度追蹤 ═══
     AI 生成在前端（callAI），server 負責儲存 + 排程計算（C++ SM-2，無 C++ 自動 JS fallback）*/
  function libGet(){return KV['ADV9_LEARNLIB']||(KV['ADV9_LEARNLIB']={notes:{},cards:{},plans:{},prog:{}})}
  function libNote(id){var L=libGet();return L.notes[id]||null}
  /* 筆記 CRUD */
  if(req.method==='GET'&&p==='/rest/v1/lib/notes'){
    var lw=checkToken(tok);if(!lw){res.writeHead(401);return res.end('need login')}
    var L=libGet(),arr=Object.keys(L.notes).map(function(k){return L.notes[k]}).filter(function(n){return n.owner===lw.username||lw.role==='admin'}).sort(function(a,b){return b.updatedAt-a.updatedAt});
    res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(arr));
  }
  if(req.method==='POST'&&p==='/rest/v1/lib/notes'){
    var lw2=checkToken(tok);if(!lw2){res.writeHead(401);return res.end('need login')}
    return readBody(req,function(b){try{
      var j=JSON.parse(b.toString('utf8'));
      var L=libGet(),id=j.id||('n'+Date.now().toString(36)+Math.random().toString(36).slice(2,6));
      var n={id:id,owner:lw2.username,title:String(j.title||'未命名筆記').slice(0,200),sourceType:String(j.sourceType||'text').slice(0,20),content:String(j.content||'').slice(0,100000),outline:Array.isArray(j.outline)?j.outline:[],summary:String(j.summary||'').slice(0,20000),definitions:Array.isArray(j.definitions)?j.definitions:[],tags:Array.isArray(j.tags)?j.tags.map(String).slice(0,50):[],sources:Array.isArray(j.sources)?j.sources:[],createdAt:(L.notes[id]&&L.notes[id].createdAt)||Date.now(),updatedAt:Date.now()};
      L.notes[id]=n;saveKV();
      res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(n));
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }
  if(req.method==='DELETE'&&p.indexOf('/rest/v1/lib/notes/')===0){
    var lw3=checkToken(tok);if(!lw3){res.writeHead(401);return res.end('need login')}
    var L=libGet(),nid=p.split('/').pop();
    var n=L.notes[nid];if(!n){res.writeHead(404);return res.end('note not found')}
    if(n.owner!==lw3.username&&lw3.role!=='admin'){res.writeHead(403);return res.end('forbidden')}
    delete L.notes[nid];
    Object.keys(L.cards).forEach(function(k){if(L.cards[k].noteId===nid)delete L.cards[k]});
    saveKV();res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true}));
  }
  /* 閃卡：CRUD + SM-2 複習回報 */
  if((req.method==='GET'||req.method==='POST')&&p==='/rest/v1/lib/cards'){
    var cw=checkToken(tok);if(!cw){res.writeHead(401);return res.end('need login')}
    if(req.method==='GET'){
      var L2=libGet(),arr2=Object.keys(L2.cards).map(function(k){return L2.cards[k]}).filter(function(c){return c.owner===cw.username}).sort(function(a,b){return a.sm2.due-b.sm2.due});
      return res.end(JSON.stringify(arr2));
    }
    return readBody(req,function(b){try{
      var j2=JSON.parse(b.toString('utf8')),L2=libGet(),cid=j2.id||('c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6));
      var c={id:cid,owner:cw.username,noteId:String(j2.noteId||''),front:String(j2.front||'').slice(0,5000),back:String(j2.back||'').slice(0,5000),tags:Array.isArray(j2.tags)?j2.tags.map(String).slice(0,30):[],sm2:{reps:0,interval:0,ease:2.5,lapses:0,due:Date.now()},createdAt:Date.now()};
      L2.cards[cid]=c;saveKV();
      res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(c));
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }
  if(req.method==='POST'&&p==='/rest/v1/lib/cards/review'){
    var cw2=checkToken(tok);if(!cw2){res.writeHead(401);return res.end('need login')}
    return readBody(req,function(b){try{
      var j3=JSON.parse(b.toString('utf8')),L2=libGet(),card=L2.cards[String(j3.id||'')];
      if(!card||card.owner!==cw2.username){res.writeHead(404);return res.end('card not found')}
      var q=Math.max(0,Math.min(5,Number(j3.quality)||0));
      var payload={action:'sm2',quality:q,reps:card.sm2.reps,intervalDays:card.sm2.interval,ease:card.sm2.ease,lapses:card.sm2.lapses};
      runBlackbox(JSON.stringify(payload),function(err,out){
        if(err||!out||out.error){res.writeHead(500);return res.end(JSON.stringify({error:'schedule failed'}));}
        card.sm2.reps=out.reps;card.sm2.interval=out.intervalDays;card.sm2.ease=out.ease;card.sm2.lapses=out.lapses;
        card.sm2.due=Date.now()+(out.dueInDays||1)*86400000;
        card.reviews=card.reviews||[];card.reviews.push({t:Date.now(),q:q});
        saveKV();
        res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true,card:card}));
      });
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }
  /* 測驗規劃：設定考試日期與科目 → 系統依剩餘天數自動規劃複習進度 */
  if(req.method==='GET'&&p==='/rest/v1/lib/plan'){
    var pw=checkToken(tok);if(!pw){res.writeHead(401);return res.end('need login')}
    var L3=libGet();res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(L3.plans[pw.username]||{examDate:null,subjects:[],plan:[]}));
  }
  if(req.method==='POST'&&p==='/rest/v1/lib/plan'){
    var pw2=checkToken(tok);if(!pw2){res.writeHead(401);return res.end('need login')}
    return readBody(req,function(b){try{
      var j4=JSON.parse(b.toString('utf8')),L3=libGet();
      var plan={examDate:Number(j4.examDate)||null,subjects:Array.isArray(j4.subjects)?j4.subjects.map(String).slice(0,30):[],plan:Array.isArray(j4.plan)?j4.plan:[]};
      L3.plans[pw2.username]=plan;saveKV();
      res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(plan));
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }
  /* 進度追蹤：記錄每章節完成狀態，供個人化出題/複習 */
  if(req.method==='POST'&&p==='/rest/v1/lib/progress'){
    var pw3=checkToken(tok);if(!pw3){res.writeHead(401);return res.end('need login')}
    return readBody(req,function(b){try{
      var j5=JSON.parse(b.toString('utf8')),L4=libGet();
      var prog=L4.prog[pw3.username]||(L4.prog[pw3.username]={units:{},answered:0,correct:0});
      if(j5.unit){var u=prog.units[String(j5.unit)]||(prog.units[String(j5.unit)]={attempts:0,correct:0,last:0});u.attempts++;u.last=Date.now();if(j5.correct)u.correct++;prog.answered++;if(j5.correct)prog.correct++;}
      saveKV();
      res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(prog));
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }
if(req.method==='GET'&&p==='/rest/v1/lib/progress'){
    var pw4=checkToken(tok);if(!pw4){res.writeHead(401);return res.end('need login')}
    var L4=libGet();res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(L4.prog[pw4.username]||{units:{},answered:0,correct:0}));
  }
  /* ═══ 創作中心（v8.0）：心智圖 / 教材漫畫 / AI 播客 / AI 導師對話記錄 ═══
     內容由前端 callAI 生成，server 儲存 + 個人化路線（rogue 黑盒）選擇 */
  function crGet(){if(!KV['ADV9_CREATE'])KV['ADV9_CREATE']={};var C=KV['ADV9_CREATE'];if(!C.minds)C.minds={};if(!C.mangas)C.mangas={};if(!C.podcasts)C.podcasts={};if(!C.tutors)C.tutors={};if(!C.infos)C.infos={};if(!C.transcripts)C.transcripts={};return C}
  /* 心智圖：儲存 + 列表 */
  if(req.method==='GET'&&p==='/rest/v1/cr/minds'){
    var cw3=checkToken(tok);if(!cw3){res.writeHead(401);return res.end('need login')}
    var C=crGet(),arr3=Object.keys(C.minds).map(function(k){return C.minds[k]}).filter(function(m){return m.owner===cw3.username||cw3.role==='admin'}).sort(function(a,b){return b.updatedAt-a.updatedAt});
    res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(arr3));
  }
  if(req.method==='POST'&&p==='/rest/v1/cr/minds'){
    var cw4=checkToken(tok);if(!cw4){res.writeHead(401);return res.end('need login')}
    return readBody(req,function(b){try{
      var j=JSON.parse(b.toString('utf8')),C=crGet(),mid=j.id||('m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6));
      C.minds[mid]={id:mid,owner:cw4.username,noteId:String(j.noteId||''),title:String(j.title||'心智圖').slice(0,200),nodes:Array.isArray(j.nodes)?j.nodes:[],createdAt:(C.minds[mid]&&C.minds[mid].createdAt)||Date.now(),updatedAt:Date.now()};
      saveKV();res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(C.minds[mid]));
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }
  /* 教材漫畫：儲存 + 列表 */
  if(req.method==='GET'&&p==='/rest/v1/cr/mangas'){
    var mw=checkToken(tok);if(!mw){res.writeHead(401);return res.end('need login')}
    var C2=crGet(),arr4=Object.keys(C2.mangas).map(function(k){return C2.mangas[k]}).filter(function(m){return m.owner===mw.username||mw.role==='admin'}).sort(function(a,b){return b.updatedAt-a.updatedAt});
    res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(arr4));
  }
  if(req.method==='POST'&&p==='/rest/v1/cr/mangas'){
    var mw2=checkToken(tok);if(!mw2){res.writeHead(401);return res.end('need login')}
    return readBody(req,function(b){try{
      var j2=JSON.parse(b.toString('utf8')),C2=crGet(),mid2=j2.id||('ma'+Date.now().toString(36)+Math.random().toString(36).slice(2,6));
      C2.mangas[mid2]={id:mid2,owner:mw2.username,noteId:String(j2.noteId||''),title:String(j2.title||'教材漫畫').slice(0,200),panels:Array.isArray(j2.panels)?j2.panels:[],createdAt:(C2.mangas[mid2]&&C2.mangas[mid2].createdAt)||Date.now(),updatedAt:Date.now()};
      saveKV();res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(C2.mangas[mid2]));
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }
  /* AI 播客：儲存 + 列表 */
  if(req.method==='GET'&&p==='/rest/v1/cr/podcasts'){
    var pw5=checkToken(tok);if(!pw5){res.writeHead(401);return res.end('need login')}
    var C3=crGet(),arr5=Object.keys(C3.podcasts).map(function(k){return C3.podcasts[k]}).filter(function(m){return m.owner===pw5.username||pw5.role==='admin'}).sort(function(a,b){return b.updatedAt-a.updatedAt});
    res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(arr5));
  }
  if(req.method==='POST'&&p==='/rest/v1/cr/podcasts'){
    var pw6=checkToken(tok);if(!pw6){res.writeHead(401);return res.end('need login')}
    return readBody(req,function(b){try{
      var j3=JSON.parse(b.toString('utf8')),C3=crGet(),pid=j3.id||('p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6));
      C3.podcasts[pid]={id:pid,owner:pw6.username,noteId:String(j3.noteId||''),title:String(j3.title||'AI 播客').slice(0,200),script:String(j3.script||'').slice(0,50000),audio:j3.audio||null,createdAt:(C3.podcasts[pid]&&C3.podcasts[pid].createdAt)||Date.now(),updatedAt:Date.now()};
      saveKV();res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(C3.podcasts[pid]));
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }
  /* AI 導師對話記錄（每人一份，保存前 200 則） */
  if((req.method==='GET'||req.method==='POST')&&p==='/rest/v1/cr/tutors'){
    var tw=checkToken(tok);if(!tw){res.writeHead(401);return res.end('need login')}
    if(req.method==='GET'){
      var C4=crGet();res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(C4.tutors[tw.username]||[]));
    }
    return readBody(req,function(b){try{
      var j4=JSON.parse(b.toString('utf8')),C4=crGet();
      var list=C4.tutors[tw.username]||(C4.tutors[tw.username]=[]);
      if(j4.msg&&j4.msg.q)list.push({q:String(j4.msg.q).slice(0,5000),a:String(j4.msg.a||'').slice(0,20000),t:Date.now()});
      if(list.length>200)list.splice(0,list.length-200);
      saveKV();res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true,count:list.length}));
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }
  /* 個人化冒險路線：種子=玩家名+等級 → 每人路線不同、同人穩定 */
  if(req.method==='GET'&&p==='/rest/v1/cr/journey'){
    var jw=checkToken(tok);if(!jw){res.writeHead(401);return res.end('need login')}
    var uj=ACC[jw.username]||{};
    var g=uj.g||{};
    var seed=0;for(var ii=0;ii<jw.username.length;ii++)seed=seed*31+jw.username.charCodeAt(ii);
    var stage=Math.min(50,Math.max(1,Math.floor(((g.lv||1)-1)/5)+1));
    var payload={action:'rogue',seed:seed,stage:stage,level:g.lv||1,flavor:(g.equip&&g.equip.character?Number(g.equip.character)%3:0)};
    runBlackbox(JSON.stringify(payload),function(err,out){
      if(err||!out||out.error){res.writeHead(500);return res.end(JSON.stringify({error:'journey failed'}));}
      res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(out));
    });
  }
  /* 個人化出題推薦：依錯題/弱項選題（weak 欄位由前端從進度計算） */
  if(req.method==='POST'&&p==='/rest/v1/cr/recommend'){
    var rw=checkToken(tok);if(!rw){res.writeHead(401);return res.end('need login')}
    return readBody(req,function(b){try{
      var j6=JSON.parse(b.toString('utf8')),pool=Array.isArray(j6.pool)?j6.pool:[];
      var payload2={action:'pick',seed:0,count:Number(j6.count)||10,pool:pool};
      var h=0;for(var k2=0;k2<rw.username.length;k2++)h=h*31+rw.username.charCodeAt(k2);
      payload2.seed=h+ (Number(j6.seed)||0);
      runBlackbox(JSON.stringify(payload2),function(err2,out2){
        if(err2||!out2||out2.error){res.writeHead(500);return res.end(JSON.stringify({error:'recommend failed'}));}
        res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ids:out2}));
      });
    }catch(e){res.writeHead(400);res.end('bad json')}});
  }

  /* 資訊圖：儲存 + 列表 */
  if(req.method==='GET'&&p==='/rest/v1/cr/infos'){
    var iw=checkToken(tok);if(!iw){res.writeHead(401);return res.end('need login')}
    var C5=crGet(),arrI=Object.keys(C5.infos).map(function(k){return C5.infos[k]}).filter(function(m){return m.owner===iw.username||iw.role==='admin'}).sort(function(a,b){return b.updatedAt-a.updatedAt});
    res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(arrI));
  }
  if(req.method==='POST'&&p==='/rest/v1/cr/infos'){
    var iw2=checkToken(tok);if(!iw2){res.writeHead(401);return res.end('need login')}
    return readBody(req,function(b){try{
      var j7=JSON.parse(b.toString('utf8')),C5=crGet(),iid=j7.id||('i'+Date.now().toString(36)+Math.random().toString(36).slice(2,6));
      C5.infos[iid]={id:iid,owner:iw2.username,noteId:String(j7.noteId||''),title:String(j7.title||'資訊圖').slice(0,200),sections:Array.isArray(j7.sections)?j7.sections:[],stats:Array.isArray(j7.stats)?j7.stats:[],hero:String(j7.hero||'').slice(0,2000),createdAt:(C5.infos[iid]&&C5.infos[iid].createdAt)||Date.now(),updatedAt:Date.now()};
      saveKV();res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(C5.infos[iid]));
    }catch(e){res.writeHead(400);return res.end('bad json: '+String(e&&e.message||e).slice(0,200))}});
  }
  /* 即時轉錄：儲存 + 列表 */
  if(req.method==='GET'&&p==='/rest/v1/cr/transcripts'){
    var tw2=checkToken(tok);if(!tw2){res.writeHead(401);return res.end('need login')}
    var C6=crGet(),arrT=Object.keys(C6.transcripts).map(function(k){return C6.transcripts[k]}).filter(function(m){return m.owner===tw2.username||tw2.role==='admin'}).sort(function(a,b){return b.updatedAt-a.updatedAt});
    res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(arrT));
  }
  if(req.method==='POST'&&p==='/rest/v1/cr/transcripts'){
    var tw3=checkToken(tok);if(!tw3){res.writeHead(401);return res.end('need login')}
    return readBody(req,function(b){try{
      var j8=JSON.parse(b.toString('utf8')),C6=crGet(),tid=j8.id||('t'+Date.now().toString(36)+Math.random().toString(36).slice(2,6));
      C6.transcripts[tid]={id:tid,owner:tw3.username,title:String(j8.title||'轉錄稿').slice(0,200),text:String(j8.text||'').slice(0,100000),noteId:String(j8.noteId||''),createdAt:(C6.transcripts[tid]&&C6.transcripts[tid].createdAt)||Date.now(),updatedAt:Date.now()};
      saveKV();res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(C6.transcripts[tid]));
    }catch(e){res.writeHead(400);return res.end('bad json: '+String(e&&e.message||e).slice(0,200))}});
  }

  /* 創作中心資源刪除：/rest/v1/cr/<type>/<id> */
  if(req.method==='DELETE'&&p.indexOf('/rest/v1/cr/')===0){
    var dw=checkToken(tok);if(!dw){res.writeHead(401);return res.end('need login')}
    var parts=p.split('/'),rtype=parts[4],rid=parts[5];if(!rtype||!rid){res.writeHead(400);return res.end('bad path')}
    var C7=crGet(),bucket=C7[rtype];if(!bucket||!bucket[rid]){res.writeHead(404);return res.end('not found')}
    if(bucket[rid].owner!==dw.username&&dw.role!=='admin'){res.writeHead(403);return res.end('forbidden')}
    delete bucket[rid];saveKV();res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true}));
  }

  /* 靜態檔（path.resolve + 前綴檢查防路徑穿越）*/
  if(req.method==='GET'){
    var rel=(p==='/'?'/index.html':p);
    var f2=path.resolve(PUB,'.'+rel);
    if(f2!==PUB && !f2.startsWith(PUB+path.sep)){res.writeHead(403);return res.end('403')}
    return fs.readFile(f2,function(e,d){if(e){res.writeHead(404);return res.end('404 not found')}var ext=path.extname(f2).toLowerCase();var hd={'Content-Type':MIME[ext]||'application/octet-stream'};if(ext==='.html'||ext==='.js'||ext==='.css')hd['Cache-Control']='no-cache';hd['X-ADV9-VER']=BUILD;res.writeHead(200,hd);res.end(d)});
  }
  if(!res.headersSent){ res.writeHead(404); res.end('404'); }
});
/* ═══ WebSocket Real-time PK ═══ */
function createWebSocketServer(server) {
  server.on('upgrade', function(req, socket, head) {
    if (req.url !== '/ws/pk' && req.url.indexOf('/ws/pk?') !== 0) { socket.destroy(); return; }
    /* 升級前驗 token：sec-websocket-protocol 或 ?token= */
    var wsTok = '';
    try {
      var proto = req.headers['sec-websocket-protocol'];
      if (proto) wsTok = String(proto).split(',')[0].trim();
      if (!wsTok) wsTok = new URL(req.url, 'http://x').searchParams.get('token') || '';
    } catch(e) {}
    var wsAuth = checkToken(wsTok);
    if (!wsAuth) { socket.destroy(); return; }

    var key = req.headers['sec-websocket-key'];
    var accept = crypto.createHash('sha1')
      .update(key + '258EAFA5-E914-47DA-95CA-5AB5DC65C740')
      .digest('base64');
    
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      'Sec-WebSocket-Accept: ' + accept + '\r\n\r\n'
    );
    
    socket._pkRoom = null;
    socket._pkUser = wsAuth.username; /* 身分來自升級時驗證的 token，不信任客戶端訊息 */
    socket._pkAlive = true;
    
    socket.on('data', function(data) {
      try {
        if (data.length < 2) return;
        var opcode = data[0] & 0x0f;
        if (opcode === 8) { socket._pkAlive = false; socket.destroy(); return; }
        if (opcode !== 1) return;
        
        var mask = (data[1] & 0x80) !== 0;
        var payloadLen = data[1] & 0x7f;
        var offset = 2;
        
        if (payloadLen === 126) {
          payloadLen = data.readUInt16BE(2);
          offset = 4;
        } else if (payloadLen === 127) {
          payloadLen = Number(data.readBigUInt64BE(2));
          offset = 10;
        }
        
        if (mask) {
          var maskKey = data.slice(offset, offset + 4);
          offset += 4;
          for (var i = 0; i < payloadLen; i++) {
            data[offset + i] = data[offset + i] ^ maskKey[i % 4];
          }
        }
        
        var msg = JSON.parse(data.slice(offset, offset + payloadLen).toString('utf8'));
        handlePkMessage(socket, msg);
      } catch(e) {}
    });
    
    socket.on('close', function() { socket._pkAlive = false; cleanupPkSocket(socket); });
    socket.on('error', function() { socket._pkAlive = false; });
  });
}

var PK_ROOMS = {};

/* ═══ Real-time Class Competition ═══ */
var CLASS_COMPETITIONS = {};

function startClassCompetition(classId, teacherId, subject, duration) {
  var compId = 'comp_' + Date.now();
  CLASS_COMPETITIONS[compId] = {
    id: compId,
    classId: classId,
    teacher: teacherId,
    subject: subject,
    duration: duration || 300000, // 5 minutes default
    questions: [],
    participants: {},
    startTime: Date.now(),
    status: 'active'
  };
  return compId;
}

function handleClassCompMessage(socket, msg) {
  if (msg.type === 'comp_join') {
    var comp = CLASS_COMPETITIONS[msg.compId];
    if (!comp || comp.status !== 'active') return;
    comp.participants[socket._pkUser] = { score: 0, answers: [], startTime: Date.now() };
    broadcastToRoom('comp_' + msg.compId, { type: 'comp_joined', user: socket._pkUser, count: Object.keys(comp.participants).length });
  }
  else if (msg.type === 'comp_answer') {
    var comp = CLASS_COMPETITIONS[msg.compId];
    if (!comp) return;
    var p = comp.participants[socket._pkUser];
    if (!p) return;
    p.answers.push({ q: msg.qIndex, correct: msg.correct, time: msg.time });
    if (msg.correct) p.score += Math.max(10, 100 - Math.floor(msg.time / 1000));

    // Broadcast to teacher
    var teacherSocket = PK_ROOMS['comp_' + msg.compId] && PK_ROOMS['comp_' + msg.compId][comp.teacher];
    if (teacherSocket) {
      wsSend(teacherSocket, { type: 'comp_update', user: socket._pkUser, score: p.score, total: Object.keys(comp.participants).length });
    }
  }
  else if (msg.type === 'comp_end') {
    var comp = CLASS_COMPETITIONS[msg.compId];
    if (!comp) return;
    comp.status = 'finished';
    var results = Object.keys(comp.participants).map(function(u) {
      return { user: u, score: comp.participants[u].score, correct: comp.participants[u].answers.filter(function(a){return a.correct}).length };
    }).sort(function(a,b){return b.score - a.score});
    broadcastToRoom('comp_' + msg.compId, { type: 'comp_results', results: results });
    delete CLASS_COMPETITIONS[msg.compId];
  }
}

function handlePkMessage(socket, msg) {
  if (msg.type === 'join') {
    socket._pkRoom = msg.room || 'lobby';
    if (!PK_ROOMS[socket._pkRoom]) PK_ROOMS[socket._pkRoom] = {};
    PK_ROOMS[socket._pkRoom][socket._pkUser] = socket;
    broadcastToRoom(socket._pkRoom, {type: 'user_joined', user: socket._pkUser, users: Object.keys(PK_ROOMS[socket._pkRoom])});
  }
  else if (msg.type === 'challenge') {
    var target = PK_ROOMS[msg.room || 'lobby'] && PK_ROOMS[msg.room || 'lobby'][msg.target];
    if (target) {
      wsSend(target, {type: 'challenge_received', from: socket._pkUser, subj: msg.subj, unit: msg.unit});
    }
  }
  else if (msg.type === 'challenge_accept') {
    var challenger = PK_ROOMS[msg.room || 'lobby'] && PK_ROOMS[msg.room || 'lobby'][msg.from];
    if (challenger) {
      wsSend(challenger, {type: 'challenge_accepted', by: socket._pkUser});
      var battleRoom = 'battle_' + Date.now();
      PK_ROOMS[battleRoom] = {};
      PK_ROOMS[battleRoom][socket._pkUser] = socket;
      PK_ROOMS[battleRoom][msg.from] = challenger;
      socket._pkRoom = battleRoom;
      challenger._pkRoom = battleRoom;
      broadcastToRoom(battleRoom, {type: 'battle_start', room: battleRoom});
    }
  }
  else if (msg.type === 'answer') {
    var room = PK_ROOMS[socket._pkRoom];
    if (room) {
      for (var u in room) {
        if (u !== socket._pkUser) {
          wsSend(room[u], {type: 'opponent_answered', user: socket._pkUser, correct: msg.correct, time: msg.time});
        }
      }
    }
  }
  else if (msg.type === 'comp_start') {
    var compId = startClassCompetition(msg.classId || 'default', socket._pkUser, msg.subject || '數學', msg.duration || 300000);
    socket._pkRoom = 'comp_' + compId;
    if (!PK_ROOMS['comp_' + compId]) PK_ROOMS['comp_' + compId] = {};
    PK_ROOMS['comp_' + compId][socket._pkUser] = socket;
    wsSend(socket, { type: 'comp_started', compId: compId, subject: msg.subject || '數學', duration: msg.duration || 300000 });
  }
  else if (msg.type === 'comp_join' || msg.type === 'comp_answer' || msg.type === 'comp_end') {
    handleClassCompMessage(socket, msg);
  }
  else if (msg.type === 'battle_end') {
    broadcastToRoom(socket._pkRoom, {type: 'battle_over', winner: msg.winner, loser: msg.loser});
    delete PK_ROOMS[socket._pkRoom];
  }
}

function wsSend(socket, data) {
  if (!socket || socket.destroyed) return;
  var payload = Buffer.from(JSON.stringify(data), 'utf8');
  var header;
  if (payload.length < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = payload.length;
  } else if (payload.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
  }
  try { socket.write(Buffer.concat([header, payload])); } catch(e) {}
}

function broadcastToRoom(room, data) {
  if (!PK_ROOMS[room]) return;
  for (var u in PK_ROOMS[room]) {
    wsSend(PK_ROOMS[room][u], data);
  }
}

function cleanupPkSocket(socket) {
  if (socket._pkRoom && PK_ROOMS[socket._pkRoom]) {
    delete PK_ROOMS[socket._pkRoom][socket._pkUser];
    if (Object.keys(PK_ROOMS[socket._pkRoom]).length === 0) {
      delete PK_ROOMS[socket._pkRoom];
    } else {
      broadcastToRoom(socket._pkRoom, {type: 'user_left', user: socket._pkUser});
    }
  }
}

createWebSocketServer(server);

/* ── 每日 09:00 PK 無限競技塔 排名獎勵 ──
   伺服器每日 09:00 依「無限競技塔 最高層數(g.arena.floor)」對全體帳號排名，
   把每人獎勵寫入 KV['ADV9_ARENA_MAIL']（陣列）。客戶端雲端同步（每 15 秒）會把該 KV 拉進
   localStorage，再由 adv9_plus.js 的 checkArenaDailyMail() 發放到玩家信箱 g.mail。 */
function arenaFloorOf(u){ try{ var g=u&&u.g; return Math.max((g&&g.arena&&(g.arena.best||g.arena.floor))||1,1); }catch(e){ return 1; } }
function computeArenaDailyMail(){
  try{
    var users=Object.keys(ACC).map(function(k){return ACC[k];}).filter(function(x){return x&&x.role==='student';});
    var list=users.map(function(u){ return {username:u.username, floor:arenaFloorOf(u)}; });
    list.sort(function(a,b){ return b.floor-a.floor; });
    var d=new Date(); var ds=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
    var rewards=list.map(function(rec,i){
      var rank=i+1, rw;
      if(rank===1) rw={diamond:10,crystal:500,starlight:300};
      else if(rank===2) rw={diamond:6,crystal:300,starlight:200};
      else if(rank===3) rw={diamond:3,crystal:200,starlight:100};
      else if(rank<=10) rw={crystal:100};
      else rw={crystal:20};
      return {username:rec.username, rank:rank, floor:rec.floor, rw:rw, date:ds};
    });
    KV['ADV9_ARENA_MAIL']=rewards; saveKV();
    console.log('[arena] 每日 PK 競技塔排名獎勵已計算，共 '+rewards.length+' 人，日期 '+ds);
  }catch(e){ console.error('[arena] compute error', e&&e.message); }
}
var _arenaMailDate=null;
function arenaMailTick(){
  try{
    var now=new Date();
    if(now.getHours()===9 && now.getMinutes()<2){
      var ds=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
      if(_arenaMailDate!==ds){ _arenaMailDate=ds; computeArenaDailyMail(); }
    }
  }catch(e){}
}
/* ── 叢集啟動：master 持狀態 + IPC 合併/廣播；worker 監聽 HTTP ── */
if(cluster.isMaster){
  var _broadcast=function(m){Object.keys(cluster.workers).forEach(function(id){try{var w=cluster.workers[id];if(w&&w.isConnected())w.send(m)}catch(e){}})};
  var _lastOnlineBc=0;
  cluster.on('message',function(w,m){
    if(!m||m.__adv9!==1)return;
    try{
      if(m.t==='kv'){Object.keys(m.d).forEach(function(k){KV[k]=m.d[k]});saveKV();_broadcast({__adv9:1,t:'kv',d:m.d});}
      else if(m.t==='kv-del'){(m.keys||[]).forEach(function(k){delete KV[k]});saveKV();_broadcast({__adv9:1,t:'kv-del',keys:m.keys});}
      else if(m.t==='acc'){if(m.d)ACC[m.un]=m.d;saveUserFile(m.un);_broadcast({__adv9:1,t:'acc',un:m.un,d:ACC[m.un]||null});}
      else if(m.t==='acc-del'){deleteUserFile(m.un);delete ACC[m.un];saveIndex();_broadcast({__adv9:1,t:'acc-del',un:m.un});}
      else if(m.t==='index'){saveIndex();}
      else if(m.t==='online'){Object.keys(m.d||{}).forEach(function(k){ONLINE[k]=m.d[k]});saveOnline();if(Date.now()-_lastOnlineBc>10000){_lastOnlineBc=Date.now();_broadcast({__adv9:1,t:'online',d:ONLINE});}}
      else if(m.t==='hb'){CW.online[m.un]=(CW.online[m.un]||0)+(m.delta||0);CW.dirty=true;}
      else if(m.t==='doll'){DOLL=m.d;saveDOLL();_broadcast({__adv9:1,t:'doll',d:DOLL});}
      else if(m.t==='shop'){SHOP=m.d;saveSHOP();_broadcast({__adv9:1,t:'shop',d:SHOP});}
      else if(m.t==='events'){EVENTS=m.d;saveEVENTS();_broadcast({__adv9:1,t:'events',d:EVENTS});}
      else if(m.t==='sysset'){SYSSET=m.d;saveSYSSET();_broadcast({__adv9:1,t:'sysset',d:SYSSET});}
      else if(m.t==='acc-fetch'){try{cluster.workers[w.id]&&cluster.workers[w.id].send({__adv9:1,t:'acc-fetch-resp',un:m.un,d:ACC[m.un]||null})}catch(e){}}
    }catch(e){console.error('[cluster] master handler',e&&e.message)}
  });
  var _exitTimes=[];
  cluster.on('exit',function(w,code,sig){
    console.log('[cluster] worker '+w.id+' died ('+code+'/'+sig+')');
    var now=Date.now();
    _exitTimes=_exitTimes.filter(function(t){return now-t<60000});
    _exitTimes.push(now);
    if(_exitTimes.length>8){console.error('[cluster] 頻繁崩潰，停止重啟');process.exit(1);}
    if(!process.exitRequested)forkWorker();
  });
  process.on('SIGTERM',function(){process.exitRequested=1;for(var id in cluster.workers){try{cluster.workers[id].kill()}catch(e){}}setTimeout(function(){process.exit(0)},1500)});
  process.on('SIGINT',function(){process.exitRequested=1;for(var id in cluster.workers){try{cluster.workers[id].kill()}catch(e){}}setTimeout(function(){process.exit(0)},1500)});
  function forkWorker(){var w=cluster.fork();w.send({__adv9:1,t:'boot',build:BUILD,kv:KV,acc:ACC,online:ONLINE,doll:DOLL,shop:SHOP,events:EVENTS,sysset:SYSSET});return w}
  /* 每 30 秒從主檔復原帳號（master 權威；復原出新帳號才廣播）*/
  var _accSet=new Set(Object.keys(ACC));
  setInterval(function(){
    reconcileIndex();
    Object.keys(ACC).forEach(function(un){if(!_accSet.has(un)){_accSet.add(un);_broadcast({__adv9:1,t:'acc',un:un,d:ACC[un]});}});
  },30000);
  setInterval(arenaMailTick,60000);
  arenaMailTick(); /* 啟動時若恰為 09:00 附近也補算一次 */
  /* 班級戰在線時間：master 權威累計，每 60 秒落 KV 並廣播（v4.0）*/
  var CW={online:{},dirty:false};
  try{var _cwt=KV['ADV9_CLASSWAR'];if(_cwt&&_cwt.online)CW=_cwt;}catch(e){}
  setInterval(function(){
    if(CW.dirty){
      CW.dirty=false;
      KV['ADV9_CLASSWAR']=CW;
      saveKV();
      _broadcast({__adv9:1,t:'kv',d:{'ADV9_CLASSWAR':CW}});
    }
  },60000);
  var N=Math.min(Math.max(os.cpus().length||1,1),4);
  for(var i=0;i<N;i++)forkWorker();
  console.log('');console.log('  🎮 master 啟動，fork '+N+' 個 worker（node '+process.version+'）PORT:'+PORT);console.log('');
}else{
  /* worker：等待 master 的 boot 快照 → 開始監聽；之後以廣播同步狀態 */
  var booted=false;
  var _urlPrinted=false;
  process.on('message',function(m){
    if(!m||m.__adv9!==1)return;
    if(m.t==='boot'){
      BUILD=m.build;KV=m.kv||{};ACC=m.acc||{};ONLINE=m.online||{};DOLL=m.doll||{};SHOP=m.shop||[];EVENTS=m.events||[];SYSSET=m.sysset||SYSSET;
      if(!booted){booted=true;server.listen(PORT,'0.0.0.0',function(){
        var url='http://127.0.0.1:'+PORT;
        console.log('');
        console.log('  ╔══════════════════════════════════════════╗');
        console.log('  ║  🎮 Adventurer Learning Platform        ║');
        console.log('  ║  冒險者學習平台 v8.0.1                  ║');
        console.log('  ╠══════════════════════════════════════════╣');
        console.log('  ║  🌐 '+url+'               ║');
        console.log('  ╚══════════════════════════════════════════╝');
        console.log('');
        if(!_urlPrinted){_urlPrinted=true;
          try{var cp=require('child_process');
            if(process.platform==='win32')cp.exec('start "" "'+url+'"');
            else if(process.platform==='darwin')cp.exec('open "'+url+'"');
            else cp.exec('xdg-open "'+url+'"');
          }catch(e){}
        }
      })}
    }
    else if(m.t==='kv'){Object.keys(m.d||{}).forEach(function(k){KV[k]=m.d[k]})}
    else if(m.t==='kv-del'){(m.keys||[]).forEach(function(k){delete KV[k]})}
    else if(m.t==='acc'){if(m.d)ACC[m.un]=m.d;else delete ACC[m.un]}
    else if(m.t==='acc-del'){delete ACC[m.un]}
    else if(m.t==='online'){Object.keys(m.d||{}).forEach(function(k){ONLINE[k]=m.d[k]})}
    else if(m.t==='doll'){DOLL=m.d}
    else if(m.t==='shop'){SHOP=m.d}
    else if(m.t==='events'){EVENTS=m.d}
    else if(m.t==='sysset'){SYSSET=m.d}
  });
  process.on('disconnect',function(){console.error('[cluster] master 斷線，worker 退出');process.exit(1)});
  setTimeout(function(){if(!booted){console.error('[cluster] 未收到 master boot，退出');process.exit(1)}},5000);
}
