/* vClasses — 班級管理 */
function vClasses(){
  var u=me();if(!u)return;
  var g=u.g||{};
  const myCls=g.classId?get(LS.classes,[]).find(c=>c.id===g.classId):null, allCls=get(LS.classes,[]);
  let h=back()+'<h3 class="vt">🏫 班級系統 <span class="vsub">邀請碼加入班級・班級任務・集體榮譽</span></h3>';

  /* 邀請碼加入班級 */
  h+='<div class="panel2" style="margin-bottom:12px;border-left:4px solid var(--gold2)">';
  h+='<b style="color:var(--gold2);font-size:15px">🔑 使用邀請碼加入班級</b>';
  if(u.classId){
    h+='<div style="margin-top:8px;font-size:12px;color:var(--teal)">✅ 你已加入班級：<b>' + esc(u.classId) + '</b></div>';
    h+='<button class="btn ghost mini" style="margin-top:6px" onclick="classJoinByCode()">🔄 更換班級</button>';
  }else{
    h+='<div style="margin-top:8px;font-size:12px;color:var(--mut)">向老師索取邀請碼，輸入後即可加入班級</div>';
  }
  h+='<div style="display:flex;gap:8px;margin-top:8px;align-items:flex-end">';
  h+='<div><label style="font-size:11px;color:var(--mut)">班級邀請碼</label>';
  h+='<input id="classCodeInput" class="inp" style="margin-top:4px;width:160px" placeholder="例: ABC123" value="' + esc(u.classCode || '') + '"></div>';
  h+='<button class="btn gold" onclick="classJoinByCode()" style="height:36px">🚀 加入班級</button>';
  h+='</div></div>';

  if(myCls){
    h+='<div class="panel2" style="margin-bottom:12px;border-left:4px solid var(--teal)"><b style="color:var(--teal)">🏠 我的班級：'+esc(myCls.name)+'</b>';
    h+=`<div class="skTxt" style="margin-top:6px">班級代碼：<code>${myCls.code}</code> ｜ 成員：${myCls.members.length} 人 ｜ 基金：${numFmt(myCls.fund||0)} 金 ｜ 等級：Lv.${myCls.lv||1}</div>`;
    h+=`<div class="rwRow" style="margin-top:8px"><button class="rwChip" onclick="classViewMembers()">👥 成員名單</button><button class="rwChip" onclick="classTasks()">📋 班級任務</button><button class="rwChip" onclick="classDonate()">💰 捐獻基金</button><button class="rwChip danger" onclick="classLeave()">🚪 退出班級</button></div></div>`;
  }

  h+='<div class="panel2"><b style="color:var(--gold2)">➕ 創建新班級</b>';
  h+='<input id="newClsName" placeholder="班級名稱" style="margin-top:8px">';
  h+='<input id="newClsDesc" placeholder="班級簡介/招生條件" style="margin-top:6px">';
  h+='<div class="mBtns" style="margin-top:10px"><button class="btn" onclick="classCreate()">創建班級 (500 金)</button></div></div>';

  $('#view').innerHTML=h;
}
function classCreate(){
  var u=me();if(!u||!u.g)return toast('⚠️ 請先登入','bad');
  const n=$('#newClsName').value.trim(), d=$('#newClsDesc').value.trim();
  if(!n) return toast('⚠️ 請輸入班級名稱','bad');
  if(u.g.gold<500) return toast('⚠️ 需要 500 金幣','bad');
  const code=Math.random().toString(36).substr(2,6).toUpperCase();
  const cls={id:'cls'+Date.now(),name:n,desc:d,code,owner:u.id,members:[u.id],fund:0,lv:1,exp:0,created:Date.now()};
  const all=get(LS.classes,[]); all.push(cls); set(LS.classes,all);
  u.g.classId=cls.id; u.g.gold-=500; set(LS.users,get(LS.users,[]));
  toast('✅ 班級創建成功！'); vClasses();
}
function classJoin(id){
  const u=me(), cls=get(LS.classes,[]).find(c=>c.id===id); if(!cls) return;
  if(cls.members.includes(u.id)) return toast('⚠️ 已在該班級','bad');
  cls.members.push(u.id); u.g.classId=id; set(LS.classes,get(LS.classes,[])); set(LS.users,get(LS.users,[]));
  toast('✅ 成功加入班級'); vClasses();
}
function classLeave(){
  if(!confirm('確定退出班級？')) return;
  const u=me(), cls=get(LS.classes,[]).find(c=>c.id===u.g.classId); if(!cls) return;
  cls.members=cls.members.filter(x=>x!==u.id); u.g.classId=null; set(LS.classes,get(LS.classes,[])); set(LS.users,get(LS.users,[]));
  toast('🚪 已退出班級'); vClasses();
}
function classViewMembers(){
  const u=me(), cls=get(LS.classes,[]).find(c=>c.id===u.g.classId); if(!cls) return;
  let h='<div class="mt">班級成員</div>';
  h+=cls.members.map(id=>{const m=get(LS.users,[]).find(x=>x.id===id); return m?`<div class="frIt"><div style="font-size:24px">${m.prof?.avatar?avatarHtml(m,36):'🧑‍🎓'}</div><div class="collInfo"><b>${esc(m.name)}</b><div class="skTxt">Lv.${m.g?.lv||1} ｜ ${m.id===cls.owner?'👑 班長':m.id===u.id?'👤 你':'👥 成員'}</div></div></div>`:''}).join('');
  openModal(h);
}
function classTasks(){toast('📋 班級任務功能開發中…')}
function classDonate(){
  const u=me(), amt=prompt('捐獻金額：'); if(!amt||isNaN(amt)||amt<1) return;
  if(u.g.gold<amt) return toast('⚠️ 金幣不足','bad');
  u.g.gold-=amt; const cls=get(LS.classes,[]).find(c=>c.id===u.g.classId); if(cls){cls.fund=(cls.fund||0)+amt; set(LS.classes,get(LS.classes,[]));}
  set(LS.users,get(LS.users,[])); toast(`✅ 捐獻 ${amt} 金幣`); vClasses();
}
function classJoinByCode(){
  var el=document.getElementById('classCodeInput');
  var code=el?el.value.trim():'';
  if(!code||code.length<3){toast('⚠️ 請輸入有效的邀請碼（至少3個字元）','bad');return;}
  fetch('/rest/v1/class/join',{
    method:'POST',
    headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
    body:JSON.stringify({classCode:code})
  }).then(function(r){return r.json()}).then(function(d){
    if(d.ok){
      var u=me();
      if(u){u.classId=d.classId;u.classCode=code;saveU(u);}
      toast('✅ 成功加入班級！老師：'+d.teacher);
      vClasses();
    }else{toast('❌ '+(d.reason||'加入失敗'),'bad');}
  }).catch(function(){toast('❌ 網路錯誤','bad');});
}
window.classJoinByCode=classJoinByCode;
window.classCreate=classCreate;
window.classJoin=classJoin;
window.classLeave=classLeave;
window.classViewMembers=classViewMembers;
window.classTasks=classTasks;
window.classDonate=classDonate;