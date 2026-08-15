/* ADV9 自架後端 v3（零依賴・伺服器權威安全版・單獨帳號檔案版）
   安全與儲存重點：
   - 帳號資料獨立存放於 data/users/<username>.json
   - 帳號憑證(password/pwHash/salt)只存伺服器，GET 一律抹除 → 前端永遠看不到密碼
   - 登入發 token；所有寫入需帶 x-adv9-token
   - 密碼統一以 scrypt 雜湊 + 每帳號隨機鹽儲存，絕不存明文
   - 娃娃 API 依「擁有者 / admin」授權，杜絕越權讀寫他人資料
   - 登入失敗次數限制，防暴力破解
   - 靜態檔用 path.resolve + 前綴檢查，防路徑穿越 */
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto'),child_process=require('child_process');
const ROOT=__dirname;
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
const GLOBAL_KEYS=new Set(['ADV9_USERS','ADV9_ANN','ADV9_CODES','ADV9_CHAT','ADV9_SES','ADV9_HOMEWORK','ADV9_SUBMISSIONS','ADV9_FRIENDS','ADV9_GROUPS','ADV9_PM','ADV9_TRADES','ADV9_GSHOP','ADV9_APIKEYS','ADV9_CLASSES','ADV9_MARKET','ADV9_SETTINGS','ADV9_ACADYR','ADV9_DUELS','ADV9_STORIES','ADV9_GUILDS','ADV9_BOOKS','ADV9_NOTIF','ADV9_LOCAL','ADV9_DOLLS','ADV9_SHOP_DOLLS','ADV9_DOLL_EVENTS','ADV9_SYS_SETTINGS','ADV9_ADMIN_OP_LOGS','ADV9_TEACHERQ','ADV9_EXAMDATE','ADV9_ARENA_MAIL','ADV9_AI_RECENT']);
const MASTER={user:'adv9boss',salt:'ADV9|v1|9f3a7',hash:'c25eba85d26bc97f09b85878ff6b4a6322acd3c740485bf09a4930b7f49e5c42',name:'總管理員'};
/* 伺服器專用 pepper：可用環境變數 ADV9_PEPPER 覆寫（建議部署時設定為隨機長字串）*/
const SERVER_PEPPER=process.env.ADV9_PEPPER||'adv9-server-pepper-v1';

/* ── SHA-256 雜湊函數 ── */
function sha256(ascii){
  function R(v,a){return(v>>>a)|(v<<(32-a));}
  var mp=Math.pow,mw=mp(2,32),res='';
  var words=[],abl=ascii.length*8;
  var hash=sha256.h=sha256.h||[],k=sha256.k=sha256.k||[],pc=k.length,ic={};
  for(var cand=2;pc<64;cand++){if(!ic[cand]){for(var i=0;i<313;i+=cand)ic[i]=cand;hash[pc]=(mp(cand,.5)*mw)|0;k[pc++]=(mp(cand,1/3)*mw)|0;}}
  ascii+='\x80';
  while(ascii.length%64-56)ascii+='\x00';
  for(var i=0;i<ascii.length;i++){var j=ascii.charCodeAt(i);if(j>>8)return'';words[i>>2]|=j<<((3-i)%4)*8;}
  words[words.length]=(abl/mw)|0;words[words.length]=abl;
  for(var j=0;j<words.length;){
    var w=words.slice(j,j+=16),oh=hash;
    hash=hash.slice(0,8);
    for(var i=0;i<64;i++){
      var w15=w[i-15],w2=w[i-2],a=hash[0],e=hash[4];
      var t1=hash[7]+(R(e,6)^R(e,11)^R(e,25))+((e&hash[5])^((~e)&hash[6]))+k[i]+(w[i]=(i<16)?w[i]:(w[i-16]+(R(w15,7)^R(w15,18)^(w15>>>3))+w[i-7]+(R(w2,17)^R(w2,19)^(w2>>>10)))|0);
      var t2=(R(a,2)^R(a,13)^R(a,22))+((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));
      hash=[(t1+t2)|0].concat(hash);hash[4]=(hash[4]+t1)|0;
    }
    for(var i=0;i<8;i++)hash[i]=(hash[i]+oh[i])|0;
  }
  for(var i=0;i<8;i++)for(var j=3;j+1;j--){var b=(hash[i]>>(j*8))&255;res+=((b<16)?0:'')+b.toString(16);}
  return res;
}

/* ── scrypt 雜湊驗證 ── */
function hashPassword(pw,salt){
  return new Promise(function(resolve,reject){
    crypto.scrypt(pw,salt,64,function(err,derived){
      if(err)return reject(err);
      resolve(derived.toString('hex'));
    });
  });
}
function verifyHash(pw,hash,salt){
  return new Promise(function(resolve,reject){
    crypto.scrypt(pw,salt,64,function(err,derived){
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

/* 個別帳號檔案儲存機制 (data/users/<username>.json) */
var userSaveTimers={};
function saveUserFile(username){
  if(!username)return;
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
  return Object.keys(ACC).map(function(un){
    var u=ACC[un]||{};
    return {id:u.id||un,username:un,name:u.name||un,role:u.role||'student',classId:u.classId||null,managedClassIds:u.managedClassIds||[],isSchoolAdmin:!!u.isSchoolAdmin,pwHash:u.pwHash||'',salt:u.salt||'',master:!!u.master,createdAt:u.createdAt||new Date().toISOString()};
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
      if(!ir||!ir.username||ACC[ir.username])return;
      ACC[ir.username]={id:ir.id||ir.username,username:ir.username,name:ir.name||ir.username,role:ir.role||'student',classId:ir.classId||null,managedClassIds:ir.managedClassIds||[],isSchoolAdmin:!!ir.isSchoolAdmin,pwHash:ir.pwHash||'',salt:ir.salt||'',master:!!ir.master,password:'',g:null,createdAt:ir.createdAt||new Date().toISOString()};
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
  ACC[MASTER.user]={id:MASTER.user,username:MASTER.user,name:MASTER.name,role:'admin',password:'',pwHash:MASTER.hash,master:true,isSchoolAdmin:true,classId:null,createdAt:new Date().toISOString(),g:null};
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

/* token */
function newToken(un,role){var t=crypto.randomBytes(24).toString('hex');TOK[t]={username:un,role:role,exp:Date.now()+30*864e5};saveTOK();return t}
function checkToken(t){if(!t)return null;var e=TOK[t];if(!e)return null;if(e.exp&&e.exp<Date.now()){delete TOK[t];saveTOK();return null}return e}
/* 抹除憑證欄位，避免任何 GET 回應外洩密碼/雜湊/鹽 */
function sanitize(u){var c={};for(var k in u)if(k!=='password'&&k!=='pwHash'&&k!=='salt')c[k]=u[k];return c}
function usersArray(){return Object.keys(ACC).map(function(k){return sanitize(ACC[k])})}
/* 登入失敗次數限制（防暴力破解）：5 次失敗鎖 5 分鐘 */
var loginFails={};
function loginLocked(un){var f=loginFails[un||''];return !!(f&&f.until&&Date.now()<f.until)}
function loginFail(un){var f=loginFails[un||'']||{n:0,until:0};f.n++;if(f.n>=5)f.until=Date.now()+5*60*1000;loginFails[un||'']=f}
function loginOk(un){loginFails[un||'']={n:0,until:0}}

/* ADV9_USERS 智能合併：依寫入者身分授權 */
function mergeUsers(incoming,w){
  if(!Array.isArray(incoming)||!w)return;
  var isAdmin=w.role==='admin', isStaff=isAdmin||w.role==='teacher';
  var byName={}; incoming.forEach(function(u){if(u&&u.username)byName[u.username]=u});
  function hashIfPlain(iu){ /* 若有明文密碼則雜湊後回傳（絕不存明文），否則原物件 */
    if(typeof iu.password==='string'&&iu.password!==''){
      var salt=crypto.randomBytes(16).toString('hex');
      var n=Object.assign({},iu);n.salt=salt;n.pwHash=crypto.scryptSync(iu.password,salt,64).toString('hex');n.password='';return n;
    }
    return iu;
  }
  incoming.forEach(function(iu){
    if(!iu||!iu.username)return; var un=iu.username, ex=ACC[un];
    if(!ex){
      if(isStaff){
        ACC[un]=hashIfPlain(iu);
        saveUserFile(un);
      }
      return;
    }       /* 建立：僅 admin/teacher；明文密碼自動雜湊 */
    var self=(un===w.username), canEdit=isStaff||self;
    if(canEdit && ('g' in iu)) ex.g=iu.g;                         /* 存檔：本人或職員 */
    if(canEdit){ if('name'in iu)ex.name=iu.name; if('prof'in iu)ex.prof=iu.prof; }
    if(isStaff && ('classId'in iu)) ex.classId=iu.classId;        /* 班級：職員 */
    /* 密碼：本人或 admin 可改；主管理員密碼由伺服器設定不走此路；一律雜湊，絕不存明文 */
    if(un!==MASTER.user && (isAdmin||self) && typeof iu.password==='string' && iu.password!==''){
      var salt=crypto.randomBytes(16).toString('hex');
      ex.salt=salt; ex.pwHash=crypto.scryptSync(iu.password,salt,64).toString('hex'); ex.password='';
    }
    if(isAdmin && iu.role) ex.role=iu.role;                      /* 身分：僅 admin */
    ACC[un]=ex;
    saveUserFile(un);
  });
  /* 不因前端清單暫時不完整而刪除教師/學生帳號；帳號只能由明確刪除流程移除。 */
}
var MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.ico':'image/x-icon'};
function cors(res,req){var origin=req&&req.headers&&req.headers.origin;var allow=process.env.ADV9_ALLOWED_ORIGIN||origin||'*';res.setHeader('Access-Control-Allow-Origin',allow);res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS,PATCH');res.setHeader('Access-Control-Allow-Headers','Content-Type,x-adv9-token');res.setHeader('Access-Control-Expose-Headers','Content-Type');}
function readBody(req,cb){var ch=[],len=0,max=60*1024*1024;req.on('data',function(c){len+=c.length;if(len>max){try{req.destroy()}catch(e){}return}ch.push(c)});req.on('end',function(){cb(Buffer.concat(ch))});req.on('error',function(){cb(null)});}
var BUILD='v'+Date.now().toString(36); /* 每次部署/重啟皆異，前端 poll 偵測到版本變化即自動重新整理 */
var server=http.createServer(function(req,res){
  cors(res,req);
  var u,p;try{u=new URL(req.url,'http://x');p=decodeURIComponent(u.pathname)}catch(e){res.writeHead(400);return res.end('bad url')}
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
  var tok=req.headers['x-adv9-token']||'';
  var _reqStart=Date.now();
  res.on('finish',function(){try{
    var line=new Date().toISOString()+' '+req.method+' '+req.url+' '+res.statusCode+' '+((req.socket&&req.socket.remoteAddress)||'?')+' '+String(req.headers['user-agent']||'').slice(0,60);
    fs.appendFileSync(ACCESSLOG,line+'\n');
    try{if(fs.statSync(ACCESSLOG).size>2*1024*1024){fs.copyFileSync(ACCESSLOG,ACCESSLOG+'.old');fs.writeFileSync(ACCESSLOG,'')}}catch(e2){}
  }catch(e){}});

  /* 管理資料的權威寫入端點：帳號/API 不再依賴前端 localStorage 或延遲佇列 */
  if(req.method==='POST'&&p==='/rest/v1/admin/users/create'){var cw=checkToken(tok);if(!cw||(cw.role!=='admin'&&cw.role!=='teacher')){res.writeHead(403);return res.end('forbidden')}return readBody(req,function(b){try{var nu=JSON.parse(b.toString('utf8'));if(!nu.username||!nu.password){res.writeHead(400);return res.end('missing account')}if(ACC[nu.username]){res.writeHead(409);return res.end('account exists')}mergeUsers([nu],cw);saveKV();saveIndex(); /* 立即寫入主檔，防建立後崩潰/被刪遺失 */res.writeHead(201,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,user:sanitize(ACC[nu.username])}))}catch(e){res.writeHead(400);res.end('bad account')}})}
  /* 刪除帳號（僅管理員；主管理員不可刪；同步移除獨立帳號檔與其私有 KV 資料）*/
  if(req.method==='POST'&&p==='/rest/v1/admin/users/delete'){
    var dw=checkToken(tok); if(!dw || dw.role!=='admin'){res.writeHead(403);return res.end('forbidden')}
    return readBody(req,function(b){try{
      var j=JSON.parse(b.toString('utf8')); var un=(j.username||'').trim();
      if(!un||!ACC[un]){res.writeHead(404);return res.end('account not found')}
      if(ACC[un].master){res.writeHead(403);return res.end('cannot delete master admin')}
      deleteUserFile(un); delete ACC[un];
      Object.keys(KV).forEach(function(k){if(k.indexOf(un+':')===0)delete KV[k]});
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
      ONLINE[hw.username]={t:now,hide:!!j.hide};
      Object.keys(ONLINE).forEach(function(k){if(now-ONLINE[k].t>90000)delete ONLINE[k]});
      saveOnline();
      var list=Object.keys(ONLINE).filter(function(k){return !ONLINE[k].hide&&now-ONLINE[k].t<=45000}).sort();
      res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,online:list}));
    }catch(e){res.writeHead(400);res.end('bad heartbeat')}})
  }
  if((req.method==='POST'||req.method==='PUT')&&p==='/rest/v1/admin/users/sync'){
    var aw=checkToken(tok); if(!aw || (aw.role!=='admin'&&aw.role!=='teacher')){res.writeHead(403);return res.end('forbidden')}
    return readBody(req,function(b){try{var j=JSON.parse(b.toString('utf8'));mergeUsers(j.users||j,aw);saveKV();saveIndex();console.log('[SYNC]',aw.username,'role='+aw.role,'users='+((Array.isArray(j.users)?j.users:j)||[]).length);res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,users:usersArray()}))}catch(e){res.writeHead(400);res.end('bad users')}})
  }
  if((req.method==='POST'||req.method==='PUT')&&p==='/rest/v1/admin/api_keys'){
    var ak=checkToken(tok); if(!ak || ak.role!=='admin'){res.writeHead(403);return res.end('forbidden')}
    return readBody(req,function(b){try{var j=JSON.parse(b.toString('utf8'));KV['ADV9_APIKEYS']=j;saveKV();res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}))}catch(e){res.writeHead(400);res.end('bad api keys')}})
  }

  /* 📡 即時推送（SSE 長連線）：KV 一變更立即廣播給所有在線客戶端（IG/FB 式秒收，不需輪詢等待） */
  var SSE_CLIENTS=[]; /* {id,res,user} */
  function sseBroadcast(rows){
    var payload='event: kv\ndata: '+JSON.stringify(rows)+'\n\n';
    for(var i=SSE_CLIENTS.length-1;i>=0;i--){
      try{SSE_CLIENTS[i].res.write(payload)}catch(e){SSE_CLIENTS.splice(i,1)}
    }
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
    return readBody(req,function(b){
      try{var arr=JSON.parse(b.toString('utf8'));var list=Array.isArray(arr)?arr:[arr];var pushRows=[];
      list.forEach(function(row){
        if(!row||row.k==null)return;
        if(row.k===USERS_KEY){mergeUsers(row.v,w);pushRows.push({k:USERS_KEY,v:usersArray()})}
        else if(GLOBAL_KEYS.has(row.k)){KV[row.k]=row.v;pushRows.push({k:row.k,v:row.v})}
        else {KV[w.username+':'+row.k]=row.v}
      });saveKV();
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
        var un=j.username;
        ACC[un]=j;
        saveUserFile(un);
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
        if(j.kv){ KV=j.kv; }
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
      var fn=path.join('/tmp','adv9_'+crypto.randomBytes(8).toString('hex')+ext);fs.writeFileSync(fn,b);
      var r=child_process.spawnSync('python3',[path.join(ROOT,'docx_extract.py'),fn],{encoding:'utf8',timeout:15000});try{fs.unlinkSync(fn)}catch(e){}
      if(r.status!==0){res.writeHead(400);return res.end('parse failed')}
      res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});res.end(r.stdout||'[]');
    }catch(e){res.writeHead(500);res.end('parse error')}})
  }

  /* 登入：伺服器端驗證，回傳帳號＋token（不回傳密碼）*/
  if(req.method==='POST'&&p==='/rest/v1/rpc/login_user'){
    return readBody(req,async function(b){
      var un,pw;try{var j=JSON.parse(b.toString('utf8'));un=j.p_username;pw=j.p_password}catch(e){}
      if(loginLocked(un)){res.writeHead(429,{'Content-Type':'text/plain; charset=utf-8'});return res.end('嘗試次數過多，請 5 分鐘後再試')}
      var ex=ACC[un]; var ok=false;
      if(ex){
        if(ex.master){ /* 主管理員：固定 SHA-256 雜湊（雜湊值寫死在 MASTER.hash，密碼由伺服器設定）*/
          ok=sha256(un+'|'+(pw==null?'':pw)+'|'+MASTER.salt)===ex.pwHash;
        } else if(ex.pwHash){ /* 已雜湊：scrypt 驗證 */
          ok=await verifyHash(pw==null?'':pw,ex.pwHash,ex.salt||SERVER_PEPPER);
        } else if(typeof ex.password==='string'&&ex.password!==''){ /* 舊明文：驗證後自動升級為雜湊 */
          ok=String(ex.password)===(pw==null?'':pw);
          if(ok){var salt=crypto.randomBytes(16).toString('hex');ex.salt=salt;ex.pwHash=await hashPassword(pw==null?'':pw,salt);ex.password='';saveACC();}
        }
      }
      if(!ok){loginFail(un);res.writeHead(401,{'Content-Type':'text/plain; charset=utf-8'});return res.end('帳號或密碼錯誤')}
      loginOk(un);
      var t=newToken(un,ex.role);
      var out={id:ex.id||ex.username,username:ex.username,name:ex.name,role:ex.role,class_id:ex.classId||null,managedClassIds:Array.isArray(ex.managedClassIds)?ex.managedClassIds:[],isSchoolAdmin:!!ex.isSchoolAdmin,prof:ex.prof||null,created_at:ex.createdAt||null,game_data:ex.g||null,token:t};
      res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(out));
    });
  }
  /* 媒體 */
  var m=p.match(/^\/storage\/v1\/object\/(?:public\/)?media\/(.+)$/);
  if(m){
    var name=path.basename(m[1]),file=path.join(MEDIA,name);
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
          } else { DOLL[dk]=j; saveDOLL(); }
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
  /* 靜態檔（path.resolve + 前綴檢查防路徑穿越）*/
  if(req.method==='GET'){
    var rel=(p==='/'?'/index.html':p);
    var f2=path.resolve(PUB,'.'+rel);
    if(f2!==PUB && !f2.startsWith(PUB+path.sep)){res.writeHead(403);return res.end('403')}
    return fs.readFile(f2,function(e,d){if(e){res.writeHead(404);return res.end('404 not found')}var ext=path.extname(f2).toLowerCase();var hd={'Content-Type':MIME[ext]||'application/octet-stream'};if(ext==='.html'||ext==='.js'||ext==='.css')hd['Cache-Control']='no-cache';hd['X-ADV9-VER']=BUILD;res.writeHead(200,hd);res.end(d)});
  }
  if(!res.headersSent){ res.writeHead(404); res.end('404'); }
});
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
setInterval(arenaMailTick, 60000);
arenaMailTick(); /* 啟動時若恰為 09:00 附近也補算一次 */

server.listen(PORT,'0.0.0.0',function(){console.log('ADV9 backend v3 (secure) on :'+PORT)});
