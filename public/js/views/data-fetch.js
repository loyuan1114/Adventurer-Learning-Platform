/* ════════════════════════════════════════════
   data-fetch.js — 資料獲取工具（從 Server 拉取最新資料，避免 localStorage 舊資料）
   ════════════════════════════════════════════ */

function safeJson(r){
  if(!r.ok){
    if(r.status===401||r.status===403){
      return Promise.resolve({ok:false,reason:'auth_error',status:r.status});
    }
    return r.text().then(function(t){throw new Error(t||('HTTP '+r.status))});
  }
  return r.json();
}

/* 取得所有用戶清單（含 classId、managedClassIds 等） */
async function fetchUsers(){
  const r=await fetch('/rest/v1/users',{headers:{'x-adv9-token':WTOKEN}});
  const d=await safeJson(r);
  return d.ok?d.users||[]:[];
}

/* 取得所有班級清單（含 code、teacherId、studentCount 等） */
async function fetchClasses(){
  const r=await fetch('/rest/v1/class/list',{headers:{'x-adv9-token':WTOKEN}});
  const d=await safeJson(r);
  return d.ok?d.classes||[]:[];
}

/* 取得用戶的 managedClassIds（含 classId） */
async function fetchMyManagedClasses(){
  const u=me();
  if(!u)return [];
  const classes=await fetchClasses();
  const myIds=(u.managedClassIds||[]).concat(u.classId?[u.classId]:[]).filter(function(x,i,a){return a.indexOf(x)===i;});
  return classes.filter(function(c){return myIds.indexOf(c.id)>=0;});
}

/* 取得單一用戶資料 */
async function fetchUser(username){
  const users=await fetchUsers();
  return users.find(function(u){return u.username===username;});
}

/* 取得用戶的班級名稱（用 code 或 id） */
async function getClassName(classId){
  const classes=await fetchClasses();
  const c=classes.find(function(c){return c.id===classId;});
  return c?c.name:'';
}

/* 取得用戶的班級代號 */
async function getClassCode(classId){
  const classes=await fetchClasses();
  const c=classes.find(function(c){return c.id===classId;});
  return c?c.code:'';
}

window.fetchUsers=fetchUsers;
window.fetchClasses=fetchClasses;
window.fetchMyManagedClasses=fetchMyManagedClasses;
window.fetchUser=fetchUser;
window.getClassName=getClassName;
window.getClassCode=getClassCode;

/* ════════════════════════════════════════════
   定期同步：每 30 秒從 Server 拉取最新資料更新 localStorage
   ════════════════════════════════════════════ */
(function(){
  if(window._adv9SyncStarted)return;window._adv9SyncStarted=true;
  var syncInterval=30000;
  
  async function syncData(){
    if(!WTOKEN)return;
    try{
      var users=await fetchUsers();
      if(users.length){
        var existing=get(LS.users,[]);
        var map={};
        existing.forEach(function(u){map[u.username]=u;});
        users.forEach(function(u){if(map[u.username]){Object.assign(map[u.username],u);}});
        set(LS.users,Object.values(map));
      }
      
      var classes=await fetchClasses();
      if(classes.length){
        var cd={ids:classes.map(function(c){return c.id;}),names:{}};
        classes.forEach(function(c){cd.names[c.id]=c.name;});
        set(LS.classes,cd);
      }
    }catch(e){console.warn('同步失敗:',e);}
  }
  
  setInterval(syncData,syncInterval);
  setTimeout(syncData,5000);
})();