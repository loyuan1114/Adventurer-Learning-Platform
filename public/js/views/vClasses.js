/* vClasses — 班級系統（學生/老師版） */
function safeJson(r){return r.ok?r.json():r.text().then(function(t){throw new Error(t)})}
function vClasses(){
  var u=me();if(!u)return;
  var g=u.g||{};
  var role=u.role||'student';
  var h=back()+'<h3 class="vt">🏫 班級系統 <span class="vsub">'+(role==='teacher'?'管理班級學生':'查看班級資訊')+'</span></h3>';

  if(role==='teacher'){
    /* 老師版：顯示自己班級的學生列表 */
    h+='<div class="panel2" style="margin-top:12px">';
    h+='<b style="color:var(--teal);font-size:15px">📋 我的班級學生</b>';
    h+='<div id="classList" style="margin-top:10px">載入中…</div>';
    h+='</div>';

    /* 新增學生到班級 */
    h+='<div class="panel2" style="margin-top:12px">';
    h+='<b style="color:var(--gold2);font-size:15px">➕ 新增學生到班級</b>';
    h+='<div style="margin-top:8px;font-size:12px;color:var(--mut)">從未分班學生中選擇加入你的班級</div>';
    h+='<div id="addStudentList" style="margin-top:10px">載入中…</div>';
    h+='</div>';

  }else{
    /* 學生版：顯示自己的班級資訊 */
    h+='<div class="panel2" style="margin-top:12px">';
    if(g.classId){
      h+='<b style="color:var(--teal);font-size:15px">🏠 我的班級</b>';
      h+='<div style="margin-top:8px" id="myClassInfo">載入中…</div>';
    }else{
      h+='<b style="color:var(--orange);font-size:15px">⚠️ 尚未分班</b>';
      h+='<div style="margin-top:8px;font-size:12px;color:var(--mut)">請聯繫管理員或老師將你加入班級</div>';
    }
    h+='</div>';

    /* 班級成員 */
    if(g.classId){
      h+='<div class="panel2" style="margin-top:12px">';
      h+='<b style="color:var(--purple);font-size:15px">👥 班級成員</b>';
      h+='<div id="memberList" style="margin-top:10px">載入中…</div>';
      h+='</div>';
    }
  }

  $('#view').innerHTML=h;

  /* 載入班級資料 */
  if(role==='teacher'){
    vClassesLoadTeacher();
  }else if(g.classId){
    vClassesLoadStudent(g.classId);
  }
}
window.vClasses=vClasses;

function vClassesLoadTeacher(){
  var u=me();if(!u)return;
  var teacherClassId=u.classId||'';
  fetch('/rest/v1/class/list',{headers:{'x-adv9-token':WTOKEN}}).then(safeJson).then(function(d){
    if(!d.ok||!d.classes)return;
    var myClass=d.classes.find(function(c){return c.id===teacherClassId});
    if(!myClass){
      var el=document.getElementById('classList');
      if(el)el.innerHTML='<div style="color:var(--mut);font-size:12px">你尚未被指派班級，請聯繫管理員</div>';
      return;
    }

    /* 顯示班級資訊 */
    var infoEl=document.getElementById('classList');
    if(infoEl){
      infoEl.innerHTML='<div style="font-size:13px"><b>'+esc(myClass.name)+'</b> <span style="color:var(--mut)">('+esc(myClass.code)+')</span> ｜ 學生 '+myClass.studentCount+' 人</div>';
    }

    /* 載入班級學生 */
    fetch('/rest/v1/users',{headers:{'x-adv9-token':WTOKEN}}).then(safeJson).then(function(res){
      if(!res.ok)return;
      var students=(res.users||[]).filter(function(s){return s.classId===teacherClassId&&s.role==='student';});
      var addList=document.getElementById('addStudentList');
      if(!students.length){
        if(addList)addList.innerHTML='<div style="color:var(--mut);font-size:12px">班級內無學生</div>';
        return;
      }
      var html='';
      students.forEach(function(s){
        html+='<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">';
        html+='<span style="font-size:16px">🧑‍🎓</span>';
        html+='<div style="flex:1;font-size:12px"><b>'+esc(s.name||s.username)+'</b> <span style="color:var(--mut)">@'+esc(s.username)+'</span></div>';
        html+='<button class="btn ghost mini" onclick="vClassRemoveStudent(\''+esc(s.username)+'\')" style="font-size:10px;color:#ef4444">移除</button>';
        html+='</div>';
      });
      var listEl=document.getElementById('memberList');
      if(listEl)listEl.innerHTML=html;
    }).catch(function(){});

    /* 載入未分班學生 */
    fetch('/rest/v1/users',{headers:{'x-adv9-token':WTOKEN}}).then(safeJson).then(function(res){
      if(!res.ok)return;
      var unassigned=(res.users||[]).filter(function(s){return !s.classId&&s.role==='student';});
      var addEl=document.getElementById('addStudentList');
      if(!unassigned.length){
        if(addEl)addEl.innerHTML='<div style="color:var(--mut);font-size:12px">無未分班學生</div>';
        return;
      }
      var html='';
      unassigned.forEach(function(s){
        html+='<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">';
        html+='<span style="font-size:16px">🧑‍🎓</span>';
        html+='<div style="flex:1;font-size:12px"><b>'+esc(s.name||s.username)+'</b> <span style="color:var(--mut)">@'+esc(s.username)+'</span></div>';
        html+='<button class="btn mini" onclick="vClassAddStudent(\''+esc(s.username)+'\')">加入班級</button>';
        html+='</div>';
      });
      if(addEl)addEl.innerHTML=html;
    }).catch(function(){});

  }).catch(function(){});
}

function vClassesLoadStudent(classId){
  fetch('/rest/v1/class/list',{headers:{'x-adv9-token':WTOKEN}}).then(safeJson).then(function(d){
    if(!d.ok||!d.classes)return;
    var myClass=d.classes.find(function(c){return c.id===classId});
    if(!myClass)return;
    var el=document.getElementById('myClassInfo');
    if(el){
      el.innerHTML='<div style="font-size:13px"><b>'+esc(myClass.name)+'</b> <span style="color:var(--mut)">('+esc(myClass.code)+')</span> ｜ 學生 '+myClass.studentCount+' 人</div>';
    }
    /* 載入成員 */
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
  fetch('/rest/v1/class/assign',{
    method:'POST',
    headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
    body:JSON.stringify({studentId:username,classId:u.classId||''})
  }).then(safeJson).then(function(d){
    if(d.ok){toast('✅ 已加入班級');vClassesLoadTeacher();}
    else{toast('❌ '+(d.reason||'操作失敗'),'bad');}
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
    if(d.ok){toast('✅ 已移除');vClassesLoadTeacher();}
    else{toast('❌ '+(d.reason||'操作失敗'),'bad');}
  }).catch(function(){toast('❌ 網路錯誤','bad');});
}
window.vClassRemoveStudent=vClassRemoveStudent;