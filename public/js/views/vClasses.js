/* vClasses — 班級系統（學生/老師版） */
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
function vClasses(){
  var u=me();if(!u)return;
  if(!WTOKEN){
    $('#view').innerHTML=back()+'<div class="panel2" style="padding:20px;text-align:center"><b style="color:#ffcc80">⚠️ Token 已過期或遺失</b><div style="margin-top:10px;font-size:12px;color:var(--mut)">請重新登入以取得新 token</div><button class="btn teal" style="margin-top:12px" onclick="logout()">🔐 重新登入</button></div>';
    return;
  }
  var g=u.g||{};
  var role=u.role||'student';
  var h=back();

  if(role==='teacher'){
    h+='<h3 class="vt">🏫 班級管理 <span class="vsub">管理系統中的班級</span></h3>';
    h+='<div class="panel2" style="margin-top:15px;padding:14px;margin-bottom:14px">';
    h+='<b style="font-size:14px">➕ 新增班級</b>';
    h+='<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center">';
    h+='<input id="newClsCode" placeholder="班級代號（如 704）" style="padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);width:140px">';
    h+='<input id="newClsName" placeholder="班級名稱（如 七年四班）" style="padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);flex:1;min-width:160px">';
    h+='<button class="btn teal" onclick="vClsAdd()">新增</button>';
    h+='<span id="newClsMsg" style="font-size:12px;color:var(--mut)"></span>';
    h+='</div></div>';
    h+='<div id="clsTeacherList" style="display:flex;flex-direction:column;gap:8px">載入中…</div>';

  }else{
    h+='<h3 class="vt">🏫 班級系統 <span class="vsub">查看班級資訊</span></h3>';
    h+='<div class="panel2" style="margin-top:12px">';
    if(g.classId){
      h+='<b style="color:var(--teal);font-size:15px">🏠 我的班級</b>';
      h+='<div style="margin-top:8px" id="myClassInfo">載入中…</div>';
    }else{
      h+='<b style="color:var(--orange);font-size:15px">⚠️ 尚未分班</b>';
      h+='<div style="margin-top:8px;font-size:12px;color:var(--mut)">請聯繫管理員或老師將你加入班級</div>';
    }
    h+='</div>';

    if(g.classId){
      h+='<div class="panel2" style="margin-top:12px">';
      h+='<b style="color:var(--purple);font-size:15px">👥 班級成員</b>';
      h+='<div id="memberList" style="margin-top:10px">載入中…</div>';
      h+='</div>';
    }
  }

  $('#view').innerHTML=h;

  if(role==='teacher'){
    vClsLoadTeacher();
  }else if(g.classId){
    vClassesLoadStudent(g.classId);
  }
}
window.vClasses=vClasses;

function vClsLoadTeacher(){
  var u=me();if(!u)return;
  fetch('/rest/v1/class/list',{headers:{'x-adv9-token':WTOKEN}}).then(safeJson).then(function(d){
    if(!d.ok||!d.classes){
      var el=document.getElementById('clsTeacherList');
      if(el)el.innerHTML='<div style="color:#ff8a80;font-size:12px">❌ 載入失敗</div>';
      return;
    }
    var classes=d.classes;
    var managed=(u.managedClassIds||[]).slice();
    var teacherClassId=u.classId||'';
    var allMine=managed.concat(teacherClassId?[teacherClassId]:[]).filter(function(x,i,a){return a.indexOf(x)===i;});

    var list=document.getElementById('clsTeacherList');
    if(!list)return;
    if(!classes.length){
      list.innerHTML='<p class="empty" style="text-align:center;padding:20px">尚無班級</p>';
      return;
    }
    var html='';
    classes.forEach(function(c){
      var isMine=allMine.indexOf(c.id)>=0;
      html+='<div class="panel2" style="padding:12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">';
      html+='<div style="flex:1;min-width:180px">';
      html+='<b style="font-size:14px">'+esc(c.name)+'</b>';
      html+='<span style="font-size:12px;color:var(--mut);margin-left:8px">('+esc(c.code)+') — '+(c.studentCount||0)+' 名學生</span>';
      if(isMine)html+=' <span style="color:var(--teal);font-size:11px;font-weight:600">✓ 已認領</span>';
      html+='</div>';
      if(isMine){
        html+='<button class="btn ghost mini" disabled style="opacity:.5;cursor:default">認領中</button>';
      }else{
        html+='<button class="btn mini teal" onclick="vClsClaim(\''+esc(c.id)+'\')">認領</button>';
      }
      html+='<button class="btn mini danger" onclick="vClsDelete(\''+esc(c.id)+'\')">刪除</button>';
      html+='</div>';
    });
    list.innerHTML=html;
  }).catch(function(e){
    var el=document.getElementById('clsTeacherList');
    if(el)el.innerHTML='<div style="color:#ff8a80;font-size:12px">❌ 網路錯誤：'+esc(e.message)+'</div>';
  });
}

function vClsAdd(){
  var cEl=document.getElementById('newClsCode');
  var nEl=document.getElementById('newClsName');
  var msg=document.getElementById('newClsMsg');
  var code=cEl?cEl.value.trim():'';
  var name=nEl?nEl.value.trim():'';
  if(!code||!name){if(msg){msg.textContent='⚠️ 請填寫班級代號和名稱';msg.style.color='#ffcc80';}return;}
  if(msg){msg.textContent='⏳ 建立中…';msg.style.color='var(--mut)';}
  fetch('/rest/v1/class/create',{
    method:'POST',
    headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
    body:JSON.stringify({name:name,code:code})
  }).then(safeJson).then(function(d){
    if(d.ok){
      if(msg){msg.textContent='✅ 已建立：'+d.name;msg.style.color='var(--teal)';}
      if(cEl)cEl.value='';if(nEl)nEl.value='';
      try{
        var users=JSON.parse(localStorage.getItem('ADV9_USERS')||'[]');
        var meU=users.find(function(x){return x.username===me().username;});
        if(meU){
          meU.classId=d.classId;
          if(!meU.managedClassIds)meU.managedClassIds=[];
          if(meU.managedClassIds.indexOf(d.classId)<0)meU.managedClassIds.push(d.classId);
          localStorage.setItem('ADV9_USERS',JSON.stringify(users));
        }
      }catch(e){}
      toast('✅ 班級已建立');
      vClsLoadTeacher();
    }else{
      if(d.reason==='auth_error')return;
      if(msg){msg.textContent='❌ '+(d.reason||'建立失敗');msg.style.color='#ff8a80';}
    }
  }).catch(function(e){if(msg){msg.textContent='❌ 網路錯誤：'+e.message;msg.style.color='#ff8a80';}});
}
window.vClsAdd=vClsAdd;

function vClsClaim(classId){
  if(!confirm('確定認領此班級？'))return;
  fetch('/rest/v1/class/claim',{
    method:'POST',
    headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
    body:JSON.stringify({classId:classId})
  }).then(safeJson).then(function(d){
    if(d.ok){
      toast('✅ 已認領：'+d.name);
      try{
        var users=JSON.parse(localStorage.getItem('ADV9_USERS')||'[]');
        var u=users.find(function(x){return x.username===me().username;});
        if(u){u.classId=classId;if(!u.managedClassIds)u.managedClassIds=[];if(u.managedClassIds.indexOf(classId)<0)u.managedClassIds.push(classId);localStorage.setItem('ADV9_USERS',JSON.stringify(users));}
      }catch(e){}
      vClsLoadTeacher();
    }else{
      if(d.reason!=='auth_error')toast('❌ '+(d.reason||'認領失敗'),'bad');
    }
  }).catch(function(e){toast('❌ 網路錯誤：'+e.message,'bad');});
}
window.vClsClaim=vClsClaim;

function vClsDelete(classId){
  if(!confirm('確定刪除此班級？此操作無法復原！'))return;
  fetch('/rest/v1/class/delete',{
    method:'POST',
    headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
    body:JSON.stringify({classId:classId})
  }).then(safeJson).then(function(d){
    if(d.ok){
      toast('✅ 班級已刪除');
      try{
        var users=JSON.parse(localStorage.getItem('ADV9_USERS')||'[]');
        var u=users.find(function(x){return x.username===me().username;});
        if(u){
          if(u.managedClassIds)u.managedClassIds=u.managedClassIds.filter(function(x){return x!==classId;});
          if(u.classId===classId)u.classId=null;
          localStorage.setItem('ADV9_USERS',JSON.stringify(users));
        }
      }catch(e){}
      vClsLoadTeacher();
    }else{
      if(d.reason!=='auth_error')toast('❌ '+(d.reason||'刪除失敗'),'bad');
    }
  }).catch(function(e){toast('❌ 網路錯誤：'+e.message,'bad');});
}
window.vClsDelete=vClsDelete;

function vClassesLoadStudent(classId){
  fetch('/rest/v1/class/list',{headers:{'x-adv9-token':WTOKEN}}).then(safeJson).then(function(d){
    if(!d.ok||!d.classes)return;
    var myClass=d.classes.find(function(c){return c.id===classId});
    if(!myClass)return;
    var el=document.getElementById('myClassInfo');
    if(el){
      el.innerHTML='<div style="font-size:13px"><b>'+esc(myClass.name)+'</b> <span style="color:var(--mut)">('+esc(myClass.code)+')</span> ｜ 學生 '+myClass.studentCount+' 人</div>';
    }
    fetch('/rest/v1/users',{headers:{'x-adv9-token':WTOKEN}}).then(safeJson).then(function(res){
      if(!res.ok)return;
      var students=(res.users||[]).filter(function(s){return s.classId===classId&&s.role==='student';});
      var el2=document.getElementById('memberList');
      if(!el2)return;
      if(!students.length){el2.innerHTML='<div style="color:var(--mut);font-size:12px">班級內無學生</div>';return;}
      var html='';
      students.forEach(function(s){
        html+='<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">';
        html+='<span style="font-size:16px">🧑‍🎓</span>';
        html+='<div style="flex:1;font-size:12px"><b>'+esc(s.name||s.username)+'</b> <span style="color:var(--mut)">@'+esc(s.username)+'</span></div>';
        html+='</div>';
      });
      el2.innerHTML=html;
    }).catch(function(){});
  }).catch(function(){});
}

function vClassAddStudent(username){
  var u=me();if(!u)return;
  var classId=u.classId||'';
  if(!classId){toast('⚠️ 請先認領班級','bad');return;}
  fetch('/rest/v1/class/assign',{
    method:'POST',
    headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
    body:JSON.stringify({studentId:username,classId:classId})
  }).then(safeJson).then(function(d){
    if(d.ok){toast('✅ 已加入班級');vClsLoadTeacher();}
    else{if(d.reason!=='auth_error')toast('❌ '+(d.reason||'操作失敗'),'bad');}
  }).catch(function(){toast('❌ 網路錯誤','bad');});
}
window.vClassAddStudent=vClassAddStudent;

function vClassRemoveStudent(username){
  if(!confirm('確定移除此學生？'))return;
  fetch('/rest/v1/class/assign',{
    method:'POST',
    headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
    body:JSON.stringify({studentId:username,classId:''})
  }).then(safeJson).then(function(d){
    if(d.ok){toast('✅ 已移除');vClsLoadTeacher();}
    else{if(d.reason!=='auth_error')toast('❌ '+(d.reason||'操作失敗'),'bad');}
  }).catch(function(){toast('❌ 網路錯誤','bad');});
}
window.vClassRemoveStudent=vClassRemoveStudent;
