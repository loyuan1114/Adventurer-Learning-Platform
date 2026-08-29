/* ════════════════════════════════════════════
   data-fetch.js — 資料獲取工具（從 Server 拉取最新資料，避免 localStorage 舊資料）
   ════════════════════════════════════════════ */

function safeJson(r){
  if(!r.ok){
    if(r.status===401||r.status===403){
      WTOKEN='';
      try{localStorage.removeItem('ADV9_WTOKEN')}catch(e){}
      toast('⚠️ Token 已失效，請重新登入','bad');
      setTimeout(function(){try{if(typeof logout==='function')logout()}catch(e){location.reload()}},800);
      return Promise.resolve({ok:false,reason:'auth_error'});
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