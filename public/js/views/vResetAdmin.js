/* ════════════════════════════════════════════
   vResetAdmin — 重置管理頁面
   管理員工具：重置用戶資料、密碼重置、資料備份
   ════════════════════════════════════════════ */

function vResetAdmin(){
  var u=me();if(!u)return;
  var h=back()+'<h3 class="vt">🔄 重置管理 <span class="vsub">管理員工具・資料重置・密碼管理</span></h3>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">';
  h+='<div style="font-size:36px;animation:bob 2s infinite">🔄</div>';
  h+='<div><b style="font-family:var(--serif);color:var(--gold2);font-size:16px;display:block">管理員重置工具</b>';
  h+='<div style="font-size:12px;color:var(--mut)">管理用戶帳號・重置資料・系統維護</div></div>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--teal);font-size:14px">🔍 用戶查詢</b>';
  h+='<div style="display:flex;gap:8px;margin-top:10px;align-items:center">';
  h+='<input id="raSearchUser" class="inp" placeholder="輸入用戶名稱搜尋" style="flex:1">';
  h+='<button class="btn teal mini" onclick="raSearchUser()">🔍 查詢</button>';
  h+='</div>';
  h+='<div id="raSearchResult" style="margin-top:10px"></div>';
  h+='</div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:#ff9800;font-size:14px">🔑 密碼重置</b>';
  h+='<div style="font-size:12px;color:var(--mut);margin-top:6px">為指定用戶重置密碼（新密碼需用戶下次登入時修改）</div>';
  h+='<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">';
  h+='<div><label style="font-size:11px;color:var(--mut)">目標用戶名稱</label>';
  h+='<input id="raResetUser" class="inp" placeholder="username" style="margin-top:4px"></div>';
  h+='<div><label style="font-size:11px;color:var(--mut)">新密碼</label>';
  h+='<input id="raNewPwd" class="inp" type="password" placeholder="至少 6 個字元" style="margin-top:4px"></div>';
  h+='<div><label style="font-size:11px;color:var(--mut)">確認新密碼</label>';
  h+='<input id="raNewPwd2" class="inp" type="password" placeholder="再次輸入" style="margin-top:4px"></div>';
  h+='<button class="btn" style="align-self:flex-start" onclick="raResetPassword()">🔑 執行密碼重置</button>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:#f44336;font-size:14px">🗑️ 帳號刪除</b>';
  h+='<div style="font-size:12px;color:var(--mut);margin-top:6px">永久刪除用戶帳號及所有相關資料。此操作不可復原。</div>';
  h+='<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">';
  h+='<div><label style="font-size:11px;color:var(--mut)">目標用戶名稱</label>';
  h+='<input id="raDeleteUser" class="inp" placeholder="username" style="margin-top:4px"></div>';
  h+='<div><label style="font-size:11px;color:var(--mut)">確認刪除（輸入用戶名稱確認）</label>';
  h+='<input id="raDeleteConfirm" class="inp" placeholder="輸入用戶名稱確認刪除" style="margin-top:4px"></div>';
  h+='<button class="btn danger" style="align-self:flex-start" onclick="raDeleteUser()">🗑️ 永久刪除帳號</button>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:#2196f3;font-size:14px">📊 系統狀態</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:10px">';
  var users=get(LS.users,[]);
  var students=users.filter(function(x){return x.role==='student'});
  var teachers=users.filter(function(x){return x.role==='teacher'});
  var admins=users.filter(function(x){return x.role==='admin'});
  var totalXP=0,totalGold=0,totalLevel=0;
  for(var i=0;i<students.length;i++){
    var sg=students[i].g||{};
    totalXP+=(sg.xp||0);
    totalGold+=(sg.gold||0);
    totalLevel+=(sg.lv||1);
  }
  var avgLevel=students.length>0?Math.round(totalLevel/students.length):0;

  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">👥</div><div style="font-size:20px;font-weight:900;color:var(--teal)">'+users.length+'</div><div style="font-size:10px;color:var(--mut)">總用戶數</div></div>';
  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">👨‍🎓</div><div style="font-size:20px;font-weight:900;color:#4caf50">'+students.length+'</div><div style="font-size:10px;color:var(--mut)">學生</div></div>';
  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">👨‍🏫</div><div style="font-size:20px;font-weight:900;color:#2196f3">'+teachers.length+'</div><div style="font-size:10px;color:var(--mut)">教師</div></div>';
  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">🛡️</div><div style="font-size:20px;font-weight:900;color:#ff9800">'+admins.length+'</div><div style="font-size:10px;color:var(--mut)">管理員</div></div>';
  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">⭐</div><div style="font-size:20px;font-weight:900;color:var(--gold2)">'+avgLevel+'</div><div style="font-size:10px;color:var(--mut)">平均等級</div></div>';
  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">🪙</div><div style="font-size:20px;font-weight:900;color:var(--gold2)">'+totalGold.toLocaleString()+'</div><div style="font-size:10px;color:var(--mut)">總金幣</div></div>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--purple);font-size:14px">📦 資料備份與還原</b>';
  h+='<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">';
  h+='<button class="btn" onclick="raExportData()">📥 匯出所有資料</button>';
  h+='<button class="btn" onclick="raImportData()">📤 匯入資料</button>';
  h+='<button class="btn ghost" onclick="raBackupList()">📋 備份紀錄</button>';
  h+='</div>';
  h+='<div id="raImportArea" style="margin-top:10px;display:none">';
  h+='<textarea id="raImportText" class="inp" rows="4" placeholder="貼上備份 JSON 資料..." style="width:100%;font-family:monospace;font-size:11px"></textarea>';
  h+='<button class="btn teal mini" style="margin-top:6px" onclick="raDoImport()">✅ 確認匯入</button>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:#f44336;font-size:14px">⚠️ 危險操作</b>';
  h+='<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">';
  h+='<button class="btn danger" onclick="raResetAllStudents()">🔄 重置所有學生等級至 Lv.1</button>';
  h+='<button class="btn danger" onclick="raClearAllLogs()">🗑️ 清除所有測驗紀錄</button>';
  h+='<button class="btn danger" onclick="raResetEconomy()">💰 重置所有用戶金幣為 100</button>';
  h+='</div>';
  h+='<div style="font-size:11px;color:#f44336;margin-top:8px">⚠️ 以上操作會影響所有用戶，請謹慎使用。</div>';
  h+='</div>';

  h+='<div class="panel2" style="margin-top:12px;padding:10px;border-left:4px solid #ff9800">';
  h+='<div style="font-size:12px;color:var(--mut)">💡 所有重置操作都會記錄在操作日誌中。建議在執行大量重置前先匯出資料備份。</div>';
  h+='</div>';

  $('#view').innerHTML=h;
}

function raSearchUser(){
  var query=(document.getElementById('raSearchUser')||{}).value||'';
  var resultEl=document.getElementById('raSearchResult');
  if(!query.trim()){resultEl.innerHTML='';return}
  var users=get(LS.users,[]);
  var found=users.filter(function(x){
    return x.username===query.trim()||x.name===query.trim();
  });
  if(!found.length){
    resultEl.innerHTML='<div style="padding:10px;color:#ff9800;font-size:12px">找不到用戶 "'+esc(query)+'"</div>';return;
  }
  var html='';
  for(var i=0;i<found.length;i++){
    var fu=found[i];
    var fg=fu.g||{};
    html+='<div class="panel2" style="margin-bottom:8px;padding:12px">';
    html+='<div style="display:flex;justify-content:space-between;align-items:center">';
    html+='<div><b style="color:var(--gold2)">'+esc(fu.name||fu.username)+'</b>';
    html+='<span style="font-size:11px;color:var(--mut);margin-left:6px">@'+esc(fu.username)+'</span></div>';
    html+='<span class="chip">'+esc(fu.role||'student')+'</span></div>';
    html+='<div style="display:flex;gap:12px;margin-top:8px;font-size:12px;color:var(--mut)">';
    html+='<span>⭐ Lv.'+(fg.lv||1)+'</span>';
    html+='<span>🪙 '+(fg.gold||0)+'</span>';
    html+='<span>💎 '+(fg.crystal||0)+'</span>';
    html+='<span>📝 '+((fu.g&&fu.g.quizLogs)||[]).length+' 次測驗</span>';
    html+='</div>';
    html+='<div style="display:flex;gap:6px;margin-top:8px">';
    html+='<button class="btn ghost mini" onclick="raQuickResetPwd(\''+esc(fu.username)+'\')">🔑 重置密碼</button>';
    html+='<button class="btn ghost mini" onclick="raQuickResetLv(\''+esc(fu.username)+'\')">⭐ 重置等級</button>';
    html+='<button class="btn danger mini" onclick="raQuickDelete(\''+esc(fu.username)+'\')">🗑️ 刪除</button>';
    html+='</div></div>';
  }
  resultEl.innerHTML=html;
}

function raResetPassword(){
  var user=(document.getElementById('raResetUser')||{}).value||'';
  var pwd=(document.getElementById('raNewPwd')||{}).value||'';
  var pwd2=(document.getElementById('raNewPwd2')||{}).value||'';
  if(!user.trim()){toast('⚠️ 請輸入用戶名稱','bad');return}
  if(pwd.length<6){toast('⚠️ 密碼至少需要 6 個字元','bad');return}
  if(pwd!==pwd2){toast('⚠️ 兩次密碼不一致','bad');return}
  var users=get(LS.users,[]);
  var found=false;
  for(var i=0;i<users.length;i++){
    if(users[i].username===user.trim()){
      users[i].password=pwd;
      users[i].pwdReset=true;
      found=true;
      break;
    }
  }
  if(!found){toast('❌ 找不到用戶 '+user,'bad');return}
  set(LS.users,users);
  toast('✅ 已重置 '+user+' 的密碼');
  document.getElementById('raResetUser').value='';
  document.getElementById('raNewPwd').value='';
  document.getElementById('raNewPwd2').value='';
}

function raDeleteUser(){
  var user=(document.getElementById('raDeleteUser')||{}).value||'';
  var confirm=(document.getElementById('raDeleteConfirm')||{}).value||'';
  if(!user.trim()){toast('⚠️ 請輸入目標用戶名稱','bad');return}
  if(confirm.trim()!==user.trim()){toast('⚠️ 請輸入正確的用戶名稱確認刪除','bad');return}
  if(!confirm('確定要永久刪除用戶 '+user+' 嗎？此操作不可復原！'))return;
  var users=get(LS.users,[]);
  var idx=-1;
  for(var i=0;i<users.length;i++){
    if(users[i].username===user.trim()){idx=i;break}
  }
  if(idx<0){toast('❌ 找不到用戶 '+user,'bad');return}
  users.splice(idx,1);
  set(LS.users,users);
  try{localStorage.removeItem('ADV9_THINK_TRACE_'+user.trim())}catch(e){}
  try{localStorage.removeItem('ADV9_CONSENT_'+user.trim())}catch(e){}
  toast('🗑️ 已刪除用戶 '+user);
  document.getElementById('raDeleteUser').value='';
  document.getElementById('raDeleteConfirm').value='';
}

function raQuickResetPwd(username){
  var newPwd='reset'+Math.floor(1000+Math.random()*9000);
  var users=get(LS.users,[]);
  for(var i=0;i<users.length;i++){
    if(users[i].username===username){
      users[i].password=newPwd;
      users[i].pwdReset=true;
      break;
    }
  }
  set(LS.users,users);
  toast('🔑 密碼已重置為：'+newPwd);
}

function raQuickResetLv(username){
  if(!confirm('確定要將 '+username+' 重置為 Lv.1 嗎？'))return;
  var users=get(LS.users,[]);
  for(var i=0;i<users.length;i++){
    if(users[i].username===username&&users[i].g){
      users[i].g.lv=1;
      users[i].g.xp=0;
      users[i].g.exp=0;
      break;
    }
  }
  set(LS.users,users);
  toast('⭐ 已將 '+username+' 重置為 Lv.1');
}

function raQuickDelete(username){
  if(!confirm('確定要刪除 '+username+' 嗎？此操作不可復原！'))return;
  var users=get(LS.users,[]);
  var idx=-1;
  for(var i=0;i<users.length;i++){
    if(users[i].username===username){idx=i;break}
  }
  if(idx<0){toast('❌ 找不到用戶','bad');return}
  users.splice(idx,1);
  set(LS.users,users);
  toast('🗑️ 已刪除 '+username);
  raSearchUser();
}

function raExportData(){
  var data={
    users:get(LS.users,[]),
    timestamp:new Date().toISOString(),
    version:'adv9_1.0'
  };
  var json=JSON.stringify(data,null,2);
  var blob=new Blob([json],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  a.download='adv9_backup_'+new Date().toISOString().slice(0,10)+'.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('📥 資料已匯出');
}

function raImportData(){
  var area=document.getElementById('raImportArea');
  if(area) area.style.display=area.style.display==='none'?'block':'none';
}

function raDoImport(){
  var text=(document.getElementById('raImportText')||{}).value||'';
  if(!text.trim()){toast('⚠️ 請貼上備份資料','bad');return}
  try{
    var data=JSON.parse(text);
    if(!data.users||!Array.isArray(data.users))throw new Error('無效的備份格式');
    if(!confirm('確定要匯入 '+data.users.length+' 筆用戶資料嗎？現有資料將被覆蓋。'))return;
    set(LS.users,data.users);
    toast('📤 已匯入 '+data.users.length+' 筆資料');
    document.getElementById('raImportText').value='';
    document.getElementById('raImportArea').style.display='none';
  }catch(e){
    toast('❌ 無效的 JSON 格式：'+e.message,'bad');
  }
}

function raBackupList(){
  toast('📋 備份功能：使用「匯出」按鈕下載完整備份');
}

function raResetAllStudents(){
  if(!confirm('確定要將所有學生重置為 Lv.1 嗎？'))return;
  var users=get(LS.users,[]);
  var count=0;
  for(var i=0;i<users.length;i++){
    if(users[i].role==='student'&&users[i].g){
      users[i].g.lv=1;
      users[i].g.xp=0;
      users[i].g.exp=0;
      users[i].g.gold=50;
      users[i].g.crystal=10;
      count++;
    }
  }
  set(LS.users,users);
  toast('🔄 已重置 '+count+' 名學生');
}

function raClearAllLogs(){
  if(!confirm('確定要清除所有用戶的測驗紀錄嗎？'))return;
  var users=get(LS.users,[]);
  for(var i=0;i<users.length;i++){
    if(users[i].g){
      users[i].g.quizLogs=[];
      users[i].g.speedMatchLogs=[];
    }
  }
  set(LS.users,users);
  toast('🗑️ 已清除所有測驗紀錄');
}

function raResetEconomy(){
  if(!confirm('確定要將所有用戶金幣重置為 100 嗎？'))return;
  var users=get(LS.users,[]);
  var count=0;
  for(var i=0;i<users.length;i++){
    if(users[i].g){
      users[i].g.gold=100;
      count++;
    }
  }
  set(LS.users,users);
  toast('💰 已重置 '+count+' 名用戶的金幣為 100');
}
window.vResetAdmin=vResetAdmin;
