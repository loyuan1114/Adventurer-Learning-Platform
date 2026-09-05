/* ════════ Supabase 雲端同步層（完整後端）════════
   1. 到 https://supabase.com 建立專案
   2. 在 SQL Editor 執行 supabase_setup.sql
   3. 把下面兩行換成你專案的 Project URL 與 anon public key（Settings → API）
*/
const SUPA_URL=(function(){try{var custom=localStorage.getItem('ADV9_API_URL');if(custom&&custom.trim())return custom.trim()}catch(e){}return location.origin})();      /* 可自訂 API 網址（GitHub Pages 用）：搬機/外網零修改 */
const SUPA_ON=(function(){if(location.hostname.indexOf('github.io')>=0||location.protocol==='file:')return false;try{var custom=localStorage.getItem('ADV9_API_URL');if(custom&&custom.trim())return true}catch(e){}return true})();/* GitHub Pages/離線一律單機模式；本機/VPS 可自訂 API 位址 */
const SUPA_SKIP=['ADV9_SES','ADV9_LOCAL','ADV9_WTOKEN'];/* session 與本機畢業帳號僅存本機，不上雲 */
const SUPA_KEY='';/* 金鑰自動從後端 /rest/v1/key 取得（svcKey 流程）；此處留空即代表「尚未取得」 */
function supaHeaders(){const h={'Content-Type':'application/json'};if(SUPA_KEY)h['apikey']=SUPA_KEY;if(WTOKEN)h['x-adv9-token']=WTOKEN;if(/^eyJ/.test(SUPA_KEY))h['Authorization']='Bearer '+SUPA_KEY;return h}/* 新版 sb_publishable_ 金鑰非 JWT，僅送 apikey；舊版 anon JWT(eyJ...) 才加 Bearer */
/* ☁️ 媒體雲端儲存：照片/影片上傳到 Supabase Storage（media 桶），訊息只存網址 → 突破 3MB 限制
   一次性設定：到 Supabase SQL Editor 執行桌面的 supabase_storage_setup.sql 建立 media 桶 */
const MEDIA_BUCKET='media',MEDIA_MAX=50*1024*1024; /* 單檔上限 50MB */
/* 上傳進度條 UI：upProg(百分比,文字)，傳 null 關閉 */
function cloudUpload(f,done,fail,prog){ /* prog(百分比)：上傳進度回呼（用 XHR 才拿得到即時進度） */
if(!SUPA_ON)return fail&&fail('no-supa');
const ext=((f.type&&f.type.split('/')[1])||'bin').replace(/[^\w]/g,'').slice(0,8);
const name=Date.now().toString(36)+Math.random().toString(36).slice(2,8)+'.'+ext;
const x=new XMLHttpRequest();
x.open('POST',SUPA_URL+'/storage/v1/object/'+MEDIA_BUCKET+'/'+name);
const h=mediaHeaders(f.type||'application/octet-stream');for(const k in h)x.setRequestHeader(k,h[k]);
if(x.upload&&prog)x.upload.onprogress=e=>{if(e.lengthComputable)prog(Math.round(e.loaded/e.total*100))};
x.onload=()=>{if(x.status>=200&&x.status<300)done('/storage/v1/object/public/'+MEDIA_BUCKET+'/'+name);else fail&&fail('HTTP '+x.status)};
x.onerror=()=>fail&&fail('network');
x.send(f);
}
function cloudDelete(url){ /* 盡力而為刪除雲端檔案（過期清理用），非雲端網址自動略過 */
try{if(typeof url!=='string')return;
if(url.indexOf('gd:')===0)return gdDelete(url); /* Google Drive 檔 */
const p='/storage/v1/object/public/'+MEDIA_BUCKET+'/';
if(url.indexOf(p)<0)return;
fetch(SUPA_URL+'/storage/v1/object/'+MEDIA_BUCKET+'/'+url.split(p)[1],{method:'DELETE',headers:mediaHeaders()}).catch(()=>{})}catch(e){}
}
/* 📂 Google Drive 影片儲存（15GB）：透過你自己部署的 Apps Script 橋接上傳到指定資料夾
   設定方法見桌面「google雲端設定說明.txt」；部署完把 /exec 網址貼到下面 GDRIVE_URL 即自動啟用（影片改存 Drive，照片仍走 Supabase） */
const GDRIVE_MAX=30*1024*1024; /* Drive 單支影片上限 30MB（base64 傳輸限制） */
function gdUpload(f,done,fail,prog){
if(!GDRIVE_URL)return fail&&fail('no-gdrive');
const r=new FileReader();
r.onload=e=>{
const x=new XMLHttpRequest();
x.open('POST',GDRIVE_URL); /* 不設 Content-Type → 簡單請求，避開 Apps Script 不支援的 CORS 預檢 */
if(x.upload&&prog)x.upload.onprogress=ev=>{if(ev.lengthComputable)prog(Math.round(ev.loaded/ev.total*100))};
x.onload=()=>{try{const j=JSON.parse(x.responseText);if(j&&j.id)return done('gd:'+j.id)}catch(_){}fail&&fail('bad-response')};
x.onerror=()=>fail&&fail('network');
x.send(JSON.stringify({action:'up',name:'adv9_'+Date.now(),type:f.type||'video/mp4',data:e.target.result.split(',')[1]}));
};
r.readAsDataURL(f);
}
/* 帳號清單防呆：VPS 回傳空清單或只剩主管理員時，拒絕覆蓋本機帳號（避免教師帳號「消失」） */
function applyUsersFromServer(v){
  try{
    const arr=Array.isArray(v)?v:null; if(!arr)return false;
    if(arr.length===0){if(typeof toast==='function')toast('⚠️ VPS 回傳空的帳號清單，已保留本機帳號避免誤刪','bad');return false}
    let local=[];try{local=JSON.parse(localStorage.getItem('ADV9_USERS')||'[]')||[]}catch(e){}
    if(arr.length===1&&local.length>1){if(typeof toast==='function')toast('⚠️ VPS 目前僅剩主管理員帳號，已保留本機教師/學生帳號','bad');return false}
    localStorage.setItem('ADV9_USERS',JSON.stringify(arr));return true;
  }catch(e){return false}
}
/* 啟動時同步載入雲端資料（阻塞式，確保主程式讀到最新全服資料） */
if(SUPA_ON){try{
const x=new XMLHttpRequest();
x.open('GET',SUPA_URL+'/rest/v1/adv9_kv?select=k,v',false);
const H=supaHeaders();for(const hk in H)x.setRequestHeader(hk,H[hk]);
x.send();
if(x.status===200){JSON.parse(x.responseText).forEach(row=>{if(SUPA_SKIP.includes(row.k))return;if(row.k==='ADV9_USERS'){applyUsersFromServer(row.v);return}try{localStorage.setItem(row.k,JSON.stringify(row.v))}catch(e){}});window._supaLoaded=true;console.log('☁️ Supabase 雲端資料已載入')}
else console.warn('Supabase 回應異常('+x.status+')，改用本地資料');
}catch(e){console.warn('Supabase 載入失敗，改用本地資料',e)}}
/* 寫入去抖動批次上傳 */
const _supaQ={};let _supaT=null;
function _curSyncRole(){try{const u=me();return u?u.role:null}catch(e){return null}}
function supaPush(k,v){
if(!SUPA_ON||SUPA_SKIP.includes(k))return;
if(k==='ADV9_USERS'){
  /* 只有管理員/教師能同步帳號清單；學生與未登入一律靜默略過（伺服器會回 403）*/
  const r=_curSyncRole();
  if(r!=='admin'&&r!=='teacher')return;
  fetch(SUPA_URL+'/rest/v1/admin/users/sync',{method:'POST',headers:supaHeaders(),body:JSON.stringify({users:v})}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status)}).catch(e=>{
    if(!window._supaUsersWarnAt||Date.now()-window._supaUsersWarnAt>30000){
      window._supaUsersWarnAt=Date.now();
      let why=(e&&e.message)?e.message:'無法連線';
      try{
        const errBody=JSON.parse(why);
        if(errBody&&errBody.reason)why=errBody.reason;
      }catch(_){}
      if(why.indexOf('forbidden')<0&&why.indexOf('403')<0){
        toast('⚠️ 帳號同步至 VPS 失敗（'+why+'），請檢查連線後重試','bad');
      }
    }
  });
  return;
}
if(k==='ADV9_APIKEYS'){
  if(_curSyncRole()!=='admin')return; /* 金鑰同步僅限管理員 */
  fetch(SUPA_URL+'/rest/v1/admin/api_keys',{method:'POST',headers:supaHeaders(),body:JSON.stringify(v)}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status)}).catch(e=>{console.warn('VPS API key save failed',e)});
  return;
}
_supaQ[k]=v;
if(_supaT)return;
_supaT=setTimeout(()=>{
_supaT=null;
const rows=Object.keys(_supaQ).map(kk=>({k:kk,v:_supaQ[kk],updated_at:new Date().toISOString()}));
for(const kk in _supaQ)delete _supaQ[kk];
fetch(SUPA_URL+'/rest/v1/adv9_kv',{method:'POST',headers:Object.assign(supaHeaders(),{'Prefer':'resolution=merge-duplicates'}),body:JSON.stringify(rows)}).catch(e=>console.warn('Supabase 同步失敗',e));
},400);
}
function flushSupaQ(){ /* 立即上傳佇列（私訊送出用，不等待 400ms debounce） */
if(!_supaQ||!_supaT)return;
clearTimeout(_supaT);_supaT=null;
const rows=Object.keys(_supaQ).map(kk=>({k:kk,v:_supaQ[kk],updated_at:new Date().toISOString()}));
for(const kk in _supaQ)delete _supaQ[kk];
if(rows.length)fetch(SUPA_URL+'/rest/v1/adv9_kv',{method:'POST',headers:Object.assign(supaHeaders(),{'Prefer':'resolution=merge-duplicates'}),body:JSON.stringify(rows)}).catch(e=>console.warn('Supabase 同步失敗',e));
}
/* 👁 上線狀態：每 25 秒向伺服器報到，並取得在線名單（含隱藏上線的隱私設定） */
async function heartbeat(){
  if(!SUPA_ON||!WTOKEN||WTOKEN.indexOf('local_')===0)return;
  try{
    const u=me();
    const r=await fetch(SUPA_URL+'/rest/v1/user/heartbeat',{method:'POST',headers:supaHeaders(),body:JSON.stringify({hide:!!(u&&u.prof&&u.prof.hideOnline)})});
    if(!r.ok)return;
    const j=await r.json().catch(()=>null);
    if(j&&Array.isArray(j.online)){_onlineSet=new Set(j.online);updateOnlBadges()}
  }catch(e){}
}
function startHeartbeat(){
  if(_hbTimer)clearInterval(_hbTimer);
  heartbeat();
  _hbTimer=setInterval(heartbeat,25000);
}
/* 📨 即時訊息引擎：每 4 秒輕量輪詢（只抓 PM/交易/PK），
   私聊視窗開著 → 立刻刷新；新訊息/新請求 → 通知彈窗 + 未讀徽章 */
let _pmReadAt={},_alertedPm={},_alertedTrade=new Set(),_alertedDuel=new Set();
try{_pmReadAt=JSON.parse(localStorage.getItem('ADV9_PM_READ')||'{}')||{}}catch(e){}
function pmUnread(){
  const u=me();if(!u)return {};
  try{const pm=get(LS.pm,{});const out={};
    Object.keys(pm).forEach(k=>{
      if(!k||k.indexOf(u.id)===-1)return;
      const fid=k.split('|').find(x=>x!==u.id);if(!fid)return;
      const last=((pm[k]||[]).slice(-1))[0];
      const lastT=(_pmReadAt[k]||0);
      const n=((pm[k]||[]).filter(m=>m&&m.from!==u.id&&m.t>(lastT||0))).length;
      if(n>0)out[fid]={n,last};
    });
    return out;
  }catch(e){return {}}
}
function pmUnreadTotal(){const o=pmUnread();return Object.keys(o).reduce((s,f)=>s+o[f].n,0)}
function markPmRead(fid){
  const u=me();if(!u)return;
  _pmReadAt[pmId(u.id,fid)]=Date.now();
  try{localStorage.setItem('ADV9_PM_READ',JSON.stringify(_pmReadAt))}catch(e){}
  refreshPmBadges();
}
function refreshPmBadges(){
  const o=pmUnread();
  document.querySelectorAll('.pmBadge').forEach(el=>{
    const fid=el.getAttribute('data-f');
    const n=(fid&&o[fid]&&o[fid].n)||0;
    el.style.display=n>0?'inline-flex':'none';el.textContent=n;
  });
  const tb=document.getElementById('frTabBadge');
  if(tb){const tot=pmUnreadTotal();tb.style.display=tot>0?'inline-flex':'none';tb.textContent=tot>9?'9+':tot}
}
/* 📡 共用處理：把伺服器送來的 KV 資料套用到本地（fastSync 輪詢與 SSE 即時推送共用） */
function applyKvRows(rows){
  if(!Array.isArray(rows))return;
  rows.forEach(row=>{
    if(!row||!row.k)return;
    if(row.k==='ADV9_USERS'){try{applyUsersFromServer(row.v)}catch(e){}return}
    if(SUPA_SKIP.includes(row.k))return;
    if(_supaQ[row.k]!==undefined)return;
    try{
      const cur=localStorage.getItem(row.k);const nv=JSON.stringify(row.v);
      if(cur!==nv){
        localStorage.setItem(row.k,nv);
        if(row.k==='ADV9_PM'){if(typeof onPmUpdate==='function')onPmUpdate()}
        else if(row.k==='ADV9_GROUPS'){if(typeof onGroupUpdate==='function')onGroupUpdate(row.v)}
        else if(row.k==='ADV9_TRADES'){if(typeof onTradeUpdate==='function')onTradeUpdate(row.v)}
        else if(row.k==='ADV9_DUELS'){if(typeof onDuelUpdate==='function')onDuelUpdate(row.v)}
      }
    }catch(e){}
  });
}
/* 📡 SSE 即時長連線：伺服器一有變更立刻推送（IG/FB 式秒收，完全不閃不重載） */
function startStream(){
  try{
    if(_es){_es.close();_es=null}
    if(!SUPA_ON||!WTOKEN||WTOKEN.indexOf('local_')===0)return;
    _es=new EventSource(SUPA_URL+'/rest/v1/stream?token='+encodeURIComponent(WTOKEN));
    _es.addEventListener('kv',function(e){try{applyKvRows(JSON.parse(e.data))}catch(x){}});
  }catch(e){}
}
function fastSync(){
  const u=me();if(!u||!SUPA_ON||!WTOKEN||WTOKEN.indexOf('local_')===0)return;
  fetch(SUPA_URL+'/rest/v1/adv9_kv?select=k,v&k=ADV9_PM,ADV9_TRADES,ADV9_DUELS,ADV9_GROUPS',{headers:supaHeaders()}).then(r=>{
    if(!r.ok)return null;
    return r.json();
  }).then(rows=>{
    if(Array.isArray(rows)&&rows.length)applyKvRows(rows);
  }).catch(()=>{});
}
function onGroupUpdate(v){
  const u=me();if(!u)return;
  const b=$('#gcBox');if(!b)return;
  const gid=CUR.grpId;if(!gid)return;
  const arr=Array.isArray(v)?v:[];
  const gr=arr.find(x=>x&&x.id===gid);if(!gr)return;
  b.innerHTML=((gr.msgs)||[]).map(m=>pmRow(m,u.id,'gr',gid)).join('')||'<p class="empty">尚無訊息</p>';
  b.scrollTop=b.scrollHeight;
}
function onPmUpdate(){
  const u=me();if(!u)return;
  const o=pmUnread();
  Object.keys(o).forEach(fid=>{
    const rec=o[fid];
    if(rec.last&&_alertedPm[fid]!==rec.last.t&&window._pmFid!==fid){
      _alertedPm[fid]=rec.last.t;
      const fr=get(LS.users,[]).find(x=>x.id===fid);
      toast('📩 新訊息：'+(fr?fr.name:fid),'bad');
    }
  });
  refreshPmBadges();
  const b=$('#pmBox');
  if(b&&window._pmFid){
    const pm=get(LS.pm,{});const msgs=pm[pmId(u.id,window._pmFid)]||[];
    b.innerHTML=msgs.map(m=>pmRow(m,u.id,'pm',pmId(u.id,window._pmFid))).join('')||'<p class="empty">尚無訊息</p>';
    b.scrollTop=b.scrollHeight;
    markPmRead(window._pmFid);
  }
}
function onTradeUpdate(v){
  const u=me();if(!u)return;
  const arr=Array.isArray(v)?v:[];
  const mine=arr.filter(t=>t&&t.to===u.id&&t.status==='pending'&&!t.acked);
  if(!mine.length)return;
  const t=mine[mine.length-1];
  if(_alertedTrade.has(t.id))return;
  _alertedTrade.add(t.id);
  const us=get(LS.users,[]);const other=us.find(x=>x.id===t.from);
  showReqPanel('🤝 交易請求',other?(other.name+' 想賣你：<b style="color:var(--gold2)">'+esc(t.itemName)+'</b>（🪙'+t.price+'）'):'有人想賣你物品',t.id,'trade');
}
function onDuelUpdate(v){
  const u=me();if(!u)return;
  const arr=Array.isArray(v)?v:[];
  const mine=arr.filter(d=>d&&d.b===u.id&&d.status==='waiting'&&d.aScore!=null&&d.bScore==null&&!d.declined);
  if(!mine.length)return;
  const d=mine[mine.length-1];
  if(_alertedDuel.has(d.id))return;
  _alertedDuel.add(d.id);
  showReqPanel('🎮 PK 挑戰',(d.aName||'好友')+' 完成「'+esc(d.game)+'」得到 <b style="color:var(--gold2)">'+d.aScore+' 分</b>，等你應戰！',d.id,'duel');
}
function showReqPanel(title,msg,id,kind){
  let el=document.getElementById('reqPanel');
  if(!el){el=document.createElement('div');el.id='reqPanel';document.body.appendChild(el)}
  const btnHtml=kind==='trade'
    ?'<button class="btn mini" onclick="acceptTrade(\''+id+'\');closeReqPanel()">✅ 接受</button><button class="btn ghost mini" onclick="rejectTrade(\''+id+'\');closeReqPanel()">❌ 拒絕</button>'
    :'<button class="btn mini" onclick="duelAccept(\''+id+'\');closeReqPanel()">⚔️ 應戰</button><button class="btn ghost mini" onclick="declineDuel(\''+id+'\');closeReqPanel()">❌ 婉拒</button>';
  el.innerHTML='<div style="position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2000;width:min(92vw,380px);background:var(--panel2);border:1px solid var(--goldD);border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.5);padding:14px 16px;text-align:center">'+
    '<div style="font-size:14.5px;margin-bottom:6px">'+title+'</div>'+
    '<div style="font-size:13px;color:var(--mut);line-height:1.5">'+msg+'</div>'+
    '<div style="display:flex;gap:8px;justify-content:center;margin-top:12px">'+btnHtml+'</div></div>';
  clearTimeout(el._t);
  el._t=setTimeout(()=>{el.remove()},30000);
}
function declineDuel(id){
  const ds=get(LS.duels,[]);const d=ds.find(x=>x.id===id);
  if(d){d.status='declined';set(LS.duels,ds)}
  toast('❌ 已婉拒 PK 挑戰');
}
function startFastSync(){
  if(_fastT)clearInterval(_fastT);
  fastSync();
  _fastT=setInterval(fastSync,2000);
  startStream(); /* 📡 SSE 即時長連線一併啟動（斷線時 EventSource 自動重連並重送快照） */
}
function stopFastSync(){if(_fastT){clearInterval(_fastT);_fastT=null}stopStream()}
/* 🔄 版本更新：只默默記錄新版號。頁面「永不自動重載」（IG/FB 式不閃），
   新版功能在使用者下次自行重新整理後生效；資料（訊息等）靠 SSE 即時推送，與頁面版本無關 */
function scheduleVerReload(){}
/* 每 15 秒背景拉取雲端更新（多裝置同步：市集、PK、聊天等） */
if(SUPA_ON){let _supaErr=0;const _supaTimer=setInterval(()=>{fetch(SUPA_URL+'/rest/v1/adv9_kv?select=k,v',{headers:supaHeaders()}).then(r=>{if(!r.ok){_supaErr++;if(_supaErr>=3){clearInterval(_supaTimer);console.warn('⚠️ VPS 連線持續失敗('+r.status+')，已停止背景同步')}throw new Error('HTTP '+r.status)}const vh=r.headers.get('x-adv9-ver');if(vh){try{localStorage.setItem('ADV9_BUILD',vh)}catch(e){}}_supaErr=0;return r.json()}).then(rows=>{if(!Array.isArray(rows))return;rows.forEach(row=>{if(SUPA_SKIP.includes(row.k)||_supaQ[row.k]!==undefined)return;if(row.k==='ADV9_USERS'){applyUsersFromServer(row.v);return}const cur=localStorage.getItem(row.k);const nv=JSON.stringify(row.v);if(cur!==nv){localStorage.setItem(row.k,nv);if(row.k==='ADV9_PM'){if(typeof onPmUpdate==='function')onPmUpdate()}else if(row.k==='ADV9_GROUPS'){if(typeof onGroupUpdate==='function')onGroupUpdate(row.v)}else if(row.k==='ADV9_TRADES'){if(typeof onTradeUpdate==='function')onTradeUpdate(row.v)}else if(row.k==='ADV9_DUELS'){if(typeof onDuelUpdate==='function')onDuelUpdate(row.v)}}})}).catch(()=>{})},15000)}
/* 未設定連線時顯示提醒徽章 */
if(false)window.addEventListener('load',()=>{const b=document.createElement('div');b.style.cssText='position:fixed;bottom:8px;right:8px;z-index:500;background:rgba(229,72,77,.92);color:#fff;font-size:12px;padding:6px 10px;border-radius:8px;font-family:sans-serif';b.textContent='⚠️ VPS 連線尚未就緒（目前為本地暫存模式）';document.body.appendChild(b)});
/* Supabase RPC 客戶端：登入等伺服器端驗證；未設定連線時自動退回本地驗證 */
const supabaseRPC={rpc:async(fn,args)=>{
/* 建立帳號類 RPC：一律在前端執行（含 newGame() 初始存檔），再由 set() 自動同步雲端 */
if(fn==='admin_register_user'||fn==='teacher_register_student'){
const us=get(LS.users,[]);
if(us.find(x=>x.username===args.p_username))return{data:null,error:{message:'帳號 '+args.p_username+' 已存在'}};
if(fn==='admin_register_user'){
const nu={id:Date.now().toString(36)+Math.floor(Math.random()*1000).toString(36),role:args.p_role,name:args.p_name,username:args.p_username,password:args.p_password,createdAt:new Date().toISOString()};
if(args.p_role==='teacher'){nu.classId=null;nu.managedClassIds=[];nu.isSchoolAdmin=false;nu.g=null}else{nu.classId=args.p_class_id||null;nu.g=newGame()}
us.push(nu);set(LS.users,us);
return{data:{message:'已建立'+(args.p_role==='teacher'?'教師':'學生')+'帳號：'+args.p_name+'（'+args.p_username+'）'},error:null};
}
us.push({id:Date.now().toString(36)+Math.floor(Math.random()*1000).toString(36),role:'student',name:args.p_name,username:args.p_username,password:args.p_password,classId:args.p_class_id||null,createdAt:new Date().toISOString(),g:newGame()});
set(LS.users,us);
return{data:{message:'學生 '+args.p_name+' 註冊成功！'},error:null};
}
if(!SUPA_ON){
if(fn==='login_user'){
const us=get(LS.users,[]);
const acc=us.find(x=>x.username===args.p_username);
if(!acc)return{data:null,error:{message:'帳號不存在'}};
if(acc.password!==args.p_password)return{data:null,error:{message:'密碼錯誤'}};
return{data:acc,error:null};
}
return{data:null,error:{message:'VPS 連線尚未就緒'}};
}
try{
const res=await fetch(SUPA_URL+'/rest/v1/rpc/'+fn,{method:'POST',headers:supaHeaders(),body:JSON.stringify(args)});
const j=await res.json().catch(()=>null);
if(!res.ok)return{data:null,error:{message:(j&&(j.message||j.hint||j.error_description))||('HTTP '+res.status)}};
return{data:j,error:null};
}catch(e){return{data:null,error:{message:e.message}}}
}};