/* ════════════════════════════════════════════
   vRegStu — 學生註冊頁面
   新學生帳號建立・資料填寫・班級加入
   ════════════════════════════════════════════ */

function vRegStu(){
  var u=me();
  var h=back()+'<h3 class="vt">👨‍🎓 學生註冊 <span class="vsub">建立新帳號・加入班級</span></h3>';
  h+='<div class="panel2" style="margin-top:12px">';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">';
  h+='<div style="font-size:36px;animation:bob 2s infinite">👨‍🎓</div>';
  h+='<div><b style="font-family:var(--serif);color:var(--gold2);font-size:16px;display:block">建立冒險者帳號</b>';
  h+='<div style="font-size:12px;color:var(--mut)">填寫資料以開始你的冒險旅程</div></div>';
  h+='</div>';
  h+='<div style="font-size:12px;color:var(--mut);margin-bottom:12px;padding:8px 12px;background:rgba(33,150,243,.08);border-left:3px solid #2196f3;border-radius:4px">💡 請確實填寫以下資料，帳號建立後不可更改用戶名稱。</div>';
  h+='</div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--gold2);font-size:14px">📝 基本資料</b>';
  h+='<div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">';

  h+='<div><label style="font-size:11px;color:var(--mut)">用戶名稱 <span style="color:#f44336">*</span></label>';
  h+='<input id="regUsername" class="inp" placeholder="例如 student001" style="margin-top:4px" oninput="regCheckUsername(this.value)">';
  h+='<div id="regUsernameMsg" style="font-size:11px;color:var(--mut);margin-top:4px"></div></div>';

  h+='<div><label style="font-size:11px;color:var(--mut)">密碼 <span style="color:#f44336">*</span></label>';
  h+='<input id="regPassword" class="inp" type="password" placeholder="至少 6 個字元" style="margin-top:4px" oninput="regCheckPwd(this.value)">';
  h+='<div id="regPwdMsg" style="font-size:11px;color:var(--mut);margin-top:4px"></div></div>';

  h+='<div><label style="font-size:11px;color:var(--mut)">確認密碼 <span style="color:#f44336">*</span></label>';
  h+='<input id="regPassword2" class="inp" type="password" placeholder="再次輸入密碼" style="margin-top:4px" oninput="regCheckPwdMatch()">';
  h+='<div id="regPwdMatchMsg" style="font-size:11px;color:var(--mut);margin-top:4px"></div></div>';

  h+='<div><label style="font-size:11px;color:var(--mut)">真實姓名 <span style="color:#f44336">*</span></label>';
  h+='<input id="regRealName" class="inp" placeholder="例如 王小明" style="margin-top:4px"></div>';

  h+='<div><label style="font-size:11px;color:var(--mut)">電子郵件（選填）</label>';
  h+='<input id="regEmail" class="inp" type="email" placeholder="student@example.com" style="margin-top:4px"></div>';

  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--teal);font-size:14px">🏫 班級資訊</b>';
  h+='<div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">';

  h+='<div><label style="font-size:11px;color:var(--mut)">班級邀請碼（選填）</label>';
  h+='<input id="regClassCode" class="inp" placeholder="向老師索取邀請碼" style="margin-top:4px">';
  h+='<div style="font-size:11px;color:var(--mut);margin-top:4px">💡 有邀請碼可直接加入老師的班級，沒有也可以之後再加。</div></div>';

  h+='<div><label style="font-size:11px;color:var(--mut)">年級</label>';
  h+='<div id="regGradeRow" style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">';
  var grades=[{v:'7',n:'七年級',e:'📚'},{v:'8',n:'八年級',e:'📖'},{v:'9',n:'九年級',e:'🎓'}];
  for(var i=0;i<grades.length;i++){
    h+='<button class="rwChip regGradeBtn" data-grade="'+grades[i].v+'" onclick="regPickGrade(\''+grades[i].v+'\')">'+grades[i].e+' '+grades[i].n+'</button>';
  }
  h+='</div></div>';

  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--purple);font-size:14px">🎮 角色選擇</b>';
  h+='<div style="font-size:12px;color:var(--mut);margin-bottom:10px">選擇你的冒險者外觀</div>';
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap">';
  var chars=[
    {id:'warrior',icon:'⚔️',name:'戰士',desc:'力量型'},
    {id:'mage',icon:'🧙',name:'法師',desc:'智力型'},
    {id:'archer',icon:'🏹',name:'弓手',desc:'敏捷型'},
    {id:'healer',icon:'💚',name:'治癒',desc:'支援型'}
  ];
  for(var j=0;j<chars.length;j++){
    h+='<div class="panel2" style="cursor:pointer;padding:12px;text-align:center;border:2px solid var(--line);min-width:80px;transition:all .2s" id="regChar_'+chars[j].id+'" onclick="regPickChar(\''+chars[j].id+'\')">';
    h+='<div style="font-size:28px">'+chars[j].icon+'</div>';
    h+='<div style="font-size:12px;font-weight:700;color:var(--gold2);margin-top:4px">'+chars[j].name+'</div>';
    h+='<div style="font-size:10px;color:var(--mut)">'+chars[j].desc+'</div>';
    h+='</div>';
  }
  h+='</div></div>';

  h+='<div style="display:flex;gap:8px;margin-top:16px">';
  h+='<button class="btn teal" onclick="regSubmit()" style="flex:1">🎯 註冊帳號</button>';
  h+='<button class="btn ghost" onclick="vHome()" style="flex:0.4">⬅ 返回</button>';
  h+='</div>';

  h+='<div id="regResult" style="margin-top:12px"></div>';

  if(u){
    h+='<div class="panel2" style="margin-top:14px;border-left:4px solid var(--teal)">';
    h+='<b style="font-size:13px;color:var(--teal)">ℹ️ 已登入帳號</b>';
    h+='<div style="font-size:12px;color:var(--mut);margin-top:4px">你目前以 <b style="color:var(--gold2)">'+esc(u.name||u.username)+'</b> 的身份登入中。</div>';
    h+='<button class="btn ghost mini" style="margin-top:8px" onclick="regSwitchAccount()">🔄 切換帳號</button>';
    h+='</div>';
  }

  h+='<div class="panel2" style="margin-top:14px;padding:12px;border-left:4px solid #ff9800">';
  h+='<b style="font-size:13px;color:#ff9800">⚠️ 註冊須知</b>';
  h+='<ul style="font-size:12px;color:var(--mut);margin:8px 0 0;padding-left:18px;line-height:1.8">';
  h+='<li>請使用真實姓名以便老師管理成績</li>';
  h+='<li>用戶名稱建立後不可修改</li>';
  h+='<li>同一設備可建立多個帳號</li>';
  h+='<li>忘記密碼請聯絡老師協助重置</li>';
  h+='</ul></div>';

  h+='</div>';
  $('#view').innerHTML=h;
  window._regSelectedChar='warrior';
  window._regSelectedGrade='';
  regHighlightChar();
}

window._regSelectedChar='warrior';
window._regSelectedGrade='';

function regCheckUsername(val){
  var el=document.getElementById('regUsernameMsg');
  if(!el)return;
  val=(val||'').trim();
  if(!val){el.textContent='';el.style.color='var(--mut)';return}
  if(val.length<3){el.textContent='⚠️ 至少需要 3 個字元';el.style.color='#ff9800';return}
  if(!/^[a-zA-Z0-9_]+$/.test(val)){el.textContent='⚠️ 只能使用英文字母、數字和底線';el.style.color='#f44336';return}
  var users=get(LS.users,[]);
  var exists=users.some(function(x){return x.username===val});
  if(exists){el.textContent='❌ 此用戶名稱已被使用';el.style.color='#f44336';return}
  el.textContent='✅ 此用戶名稱可使用';el.style.color='var(--teal)';
}

function regCheckPwd(val){
  var el=document.getElementById('regPwdMsg');
  if(!el)return;
  val=(val||'');
  if(!val){el.textContent='';return}
  if(val.length<6){el.textContent='⚠️ 至少需要 6 個字元';el.style.color='#ff9800';return}
  var hasNum=/\d/.test(val);
  var hasLetter=/[a-zA-Z]/.test(val);
  if(!hasNum||!hasLetter){el.textContent='⚠️ 建議混合字母與數字';el.style.color='#ff9800';return}
  el.textContent='✅ 密碼強度足夠';el.style.color='var(--teal)';
  regCheckPwdMatch();
}

function regCheckPwdMatch(){
  var p1=document.getElementById('regPassword');
  var p2=document.getElementById('regPassword2');
  var el=document.getElementById('regPwdMatchMsg');
  if(!el||!p1||!p2)return;
  if(!p2.value){el.textContent='';return}
  if(p1.value===p2.value){el.textContent='✅ 密碼相符';el.style.color='var(--teal)'}
  else{el.textContent='❌ 兩次密碼不一致';el.style.color='#f44336'}
}

function regPickGrade(g){
  window._regSelectedGrade=g;
  var btns=document.querySelectorAll('.regGradeBtn');
  for(var i=0;i<btns.length;i++){
    btns[i].style.borderColor=btns[i].getAttribute('data-grade')===g?'var(--teal)':'var(--line)';
  }
}

function regPickChar(id){
  window._regSelectedChar=id;
  regHighlightChar();
}

function regHighlightChar(){
  var allIds=['warrior','mage','archer','healer'];
  for(var i=0;i<allIds.length;i++){
    var el=document.getElementById('regChar_'+allIds[i]);
    if(!el)continue;
    if(allIds[i]===window._regSelectedChar){
      el.style.borderColor='var(--gold2)';
      el.style.background='rgba(255,215,0,.08)';
    }else{
      el.style.borderColor='var(--line)';
      el.style.background='transparent';
    }
  }
}

function regSubmit(){
  var username=(document.getElementById('regUsername')||{}).value||'';
  var password=(document.getElementById('regPassword')||{}).value||'';
  var password2=(document.getElementById('regPassword2')||{}).value||'';
  var realName=(document.getElementById('regRealName')||{}).value||'';
  var email=(document.getElementById('regEmail')||{}).value||'';
  var classCode=(document.getElementById('regClassCode')||{}).value||'';
  var resultEl=document.getElementById('regResult');

  username=username.trim();
  realName=realName.trim();
  email=email.trim();
  classCode=classCode.trim();

  if(!username||username.length<3){
    toast('⚠️ 用戶名稱至少需要 3 個字元','bad');return;
  }
  if(!/^[a-zA-Z0-9_]+$/.test(username)){
    toast('⚠️ 用戶名稱只能使用英文字母、數字和底線','bad');return;
  }
  if(!password||password.length<6){
    toast('⚠️ 密碼至少需要 6 個字元','bad');return;
  }
  if(password!==password2){
    toast('⚠️ 兩次密碼不一致','bad');return;
  }
  if(!realName){
    toast('⚠️ 請填寫真實姓名','bad');return;
  }

  var users=get(LS.users,[]);
  var exists=users.some(function(x){return x.username===username});
  if(exists){
    toast('❌ 此用戶名稱已被使用','bad');return;
  }

  var newUser={
    id:'u_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),
    username:username,
    password:password,
    name:realName,
    email:email,
    role:'student',
    char:window._regSelectedChar||'warrior',
    grade:window._regSelectedGrade||'',
    classCode:classCode,
    createdAt:new Date().toISOString(),
    g:{
      lv:1,
      xp:0,
      needXp:100,
      gold:50,
      crystal:10,
      diamond:0,
      hp:100,
      maxHp:100,
      mp:50,
      maxMp:50,
      exp:0,
      stamina:100,
      equip:{weapon:null,armor:null,accessory:null,character:window._regSelectedChar||'warrior'},
      bag:{items:[],capacity:50},
      arena:{best:1},
      rebirth:0,
      equippedTitle:null
    }
  };

  users.push(newUser);
  set(LS.users,users);

  if(resultEl){
    resultEl.innerHTML='<div style="text-align:center;padding:20px">';
    resultEl.innerHTML+='<div style="font-size:48px;animation:pop .3s">🎉</div>';
    resultEl.innerHTML+='<b style="font-family:var(--serif);color:var(--teal);font-size:18px;display:block;margin:10px 0">註冊成功！</b>';
    resultEl.innerHTML+='<div style="font-size:13px;color:var(--mut)">歡迎，冒險者 <b style="color:var(--gold2)">'+esc(realName)+'</b>！</div>';
    resultEl.innerHTML+='<div style="font-size:12px;color:var(--mut);margin-top:4px">你的冒險即將開始...</div>';
    resultEl.innerHTML+='<div style="display:flex;gap:8px;justify-content:center;margin-top:16px">';
    resultEl.innerHTML+='<button class="btn teal" onclick="regGoLogin(\''+esc(username)+'\')">🚀 前往登入</button>';
    resultEl.innerHTML+='<button class="btn ghost" onclick="vRegStu()">📝 再註冊一個</button>';
    resultEl.innerHTML+='</div></div>';
  }

  toast('🎉 註冊成功！歡迎 '+realName);
}

function regGoLogin(username){
  try{
    set(LS.user,{username:username});
  }catch(e){}
  if(typeof vLogin==='function') vLogin();
  else toast('請使用 '+username+' 帳號登入');
}

function regSwitchAccount(){
  if(typeof logout==='function') logout();
  else toast('請重新登入');
}
window.vRegStu=vRegStu;
