/* ════════════════════════════════════════════
   vTHome — 教師首頁
   班級管理・作業發布・成績查看・學生監控
   ════════════════════════════════════════════ */

function vTHome(){
  var u=me();if(!u)return;
  var g=u.g;
  var h=back()+'<h3 class="vt">🏠 教師首頁 <span class="vsub">班級管理・作業發布・成績監控</span></h3>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">';
  h+='<div style="font-size:40px;animation:bob 2s infinite">👨‍🏫</div>';
  h+='<div><b style="font-family:var(--serif);color:var(--gold2);font-size:16px;display:block">歡迎回來，'+esc(u.name||u.username)+'</b>';
  h+='<div style="font-size:12px;color:var(--mut)">教師管理控制台・'+new Date().toLocaleDateString('zh-TW')+'</div></div>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--teal);font-size:14px">📊 班級總覽</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:10px">';
  var users=get(LS.users,[]);
  var myClassCode=u.classCode||'';
  var myStudents=users.filter(function(x){
    return x.role==='student'&&x.classCode===myClassCode;
  });
  var totalStudents=users.filter(function(x){return x.role==='student'}).length;
  var avgLevel=0;
  var totalXP=0;
  var activeCount=0;
  var today=new Date().toISOString().slice(0,10);
  for(var i=0;i<myStudents.length;i++){
    var sg=myStudents[i].g||{};
    totalXP+=(sg.xp||0);
    avgLevel+=(sg.lv||1);
    var lastLogin=myStudents[i].lastLogin||'';
    if(lastLogin.indexOf(today)===0)activeCount++;
  }
  if(myStudents.length>0)avgLevel=Math.round(avgLevel/myStudents.length);

  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">👥</div><div style="font-size:20px;font-weight:900;color:var(--teal)">'+myStudents.length+'</div><div style="font-size:10px;color:var(--mut)">班級學生</div></div>';
  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">🟢</div><div style="font-size:20px;font-weight:900;color:#4caf50">'+activeCount+'</div><div style="font-size:10px;color:var(--mut)">今日活躍</div></div>';
  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">⭐</div><div style="font-size:20px;font-weight:900;color:var(--gold2)">'+avgLevel+'</div><div style="font-size:10px;color:var(--mut)">平均等級</div></div>';
  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">🌐</div><div style="font-size:20px;font-weight:900;color:#2196f3">'+totalStudents+'</div><div style="font-size:10px;color:var(--mut)">全校學生</div></div>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--gold2);font-size:14px">🛠️ 快速操作</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-top:10px">';
  var actions=[
    {icon:'📝',name:'發布作業',fn:"needJs(['js/views/vHomework.js']).then(()=>vHomework())",color:'#4caf50'},
    {icon:'📊',name:'查看成績',fn:"needJs(['js/views/vStats.js']).then(()=>vStats())",color:'#2196f3'},
    {icon:'👥',name:'管理名冊',fn:"needJs(['js/views/vRoster.js']).then(()=>vRoster())",color:'#ff9800'},
    {icon:'🏆',name:'排行榜',fn:"needJs(['js/views/vRank.js']).then(()=>vRank())",color:'var(--gold2)'},
    {icon:'💬',name:'公告系統',fn:"needJs(['js/views/vAnn.js']).then(()=>vAnn())",color:'#9c27b0'},
    {icon:'📋',name:'作業管理',fn:"needJs(['js/views/vHomework.js']).then(()=>vHomework())",color:'#e91e63'},
    {icon:'📈',name:'學情分析',fn:"vTHomeAnalysis()",color:'#00bcd4'},
    {icon:'🎮',name:'遊戲管理',fn:"needJs(['js/views/vGames.js']).then(()=>vGames())",color:'#ff5722'}
  ];
  for(var a=0;a<actions.length;a++){
    var act=actions[a];
    h+='<div class="feat" style="--fc:'+act.color+';cursor:pointer" onclick="'+act.fn+'">';
    h+='<span class="fIco">'+act.icon+'</span>';
    h+='<b>'+act.name+'</b></div>';
  }
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center">';
  h+='<b style="color:var(--purple);font-size:14px">📋 班級學生列表</b>';
  h+='<button class="btn ghost mini" onclick="vTHome()">🔄 刷新</button></div>';
  if(myStudents.length){
    h+='<div style="max-height:300px;overflow-y:auto;margin-top:10px">';
    var sortedStudents=myStudents.slice().sort(function(a,b){return(b.g&&b.g.lv||1)-(a.g&&a.g.lv||1)});
    for(var s=0;s<sortedStudents.length;s++){
      var st=sortedStudents[s];
      var sg=st.g||{};
      var eq=(sg.equip&&sg.equip.character&&CHARS&&CHARS[sg.equip.character])?CHARS[sg.equip.character].icon:'🧑‍🎓';
      var lastLogin=st.lastLogin||'';
      var isOnline=lastLogin.indexOf(today)===0;
      h+='<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;margin-bottom:4px;background:rgba(0,0,0,.1);border-radius:8px;cursor:pointer" onclick="vTHomeStudent(\''+esc(st.username)+'\')">';
      h+='<span style="font-size:18px">'+eq+'</span>';
      h+='<div style="flex:1">';
      h+='<div style="font-size:13px;font-weight:600;color:var(--txt)">'+esc(st.name||st.username)+'</div>';
      h+='<div style="font-size:11px;color:var(--mut)">Lv.'+(sg.lv||1)+' '+titleOf(sg.lv||1)+'</div>';
      h+='</div>';
      h+='<div style="text-align:right">';
      h+='<div style="font-size:12px;color:var(--gold2)">'+(sg.gold||0)+' 🪙</div>';
      h+='<div style="width:8px;height:8px;border-radius:50%;background:'+(isOnline?'#4caf50':'#666')+';margin-left:auto;margin-top:4px"></div>';
      h+='</div>';
      h+='</div>';
    }
    h+='</div>';
  }else{
    h+='<div class="empty" style="margin-top:10px;text-align:center;padding:16px">';
    h+='<div style="font-size:28px;opacity:.3">👥</div>';
    h+='<div style="font-size:13px;color:var(--mut);margin-top:8px">尚無班級學生</div>';
    h+='<div style="font-size:11px;color:var(--mut);margin-top:4px">學生註冊時輸入你的邀請碼即可加入班級</div>';
    h+='</div>';
  }
  h+='</div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:#ff9800;font-size:14px">📅 今日提醒</b>';
  h+='<div style="margin-top:10px">';
  var reminders=[];
  var allHW=get('ADV9_HOMEWORKS',[]);
  var dueSoon=allHW.filter(function(hw){
    if(!hw.dueDate)return false;
    var due=new Date(hw.dueDate);
    var now=new Date();
    var diff=due-now;
    return diff>0&&diff<86400000*2;
  });
  if(dueSoon.length>0){
    reminders.push({icon:'⏰',text:dueSoon.length+' 份作業即將截止',color:'#ff9800'});
  }
  if(myStudents.length>0){
    var lowLevel=myStudents.filter(function(x){return(x.g&&x.g.lv||1)<3}).length;
    if(lowLevel>0){
      reminders.push({icon:'⚠️',text:lowLevel+' 名學生等級偏低',color:'#f44336'});
    }
  }
  if(!reminders.length){
    reminders.push({icon:'✅',text:'目前無待處理事項',color:'var(--teal)'});
  }
  for(var rm=0;rm<reminders.length;rm++){
    var rem=reminders[rm];
    h+='<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:6px;background:rgba(0,0,0,.1);border-radius:8px;border-left:3px solid '+rem.color+'">';
    h+='<span>'+rem.icon+'</span>';
    h+='<span style="font-size:13px;color:'+rem.color+'">'+rem.text+'</span>';
    h+='</div>';
  }
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:#2196f3;font-size:14px">🔗 班級邀請碼</b>';
  h+='<div style="display:flex;gap:8px;margin-top:10px;align-items:center">';
  h+='<div style="flex:1;padding:10px;background:#1a1a2e;border-radius:8px;font-family:monospace;font-size:14px;color:var(--gold2);text-align:center;letter-spacing:2px">'+esc(myClassCode||'尚未設定')+'</div>';
  h+='<button class="btn ghost mini" onclick="thomeCopyCode()">📋 複製</button>';
  h+='</div>';
  h+='<div style="margin-top:8px;display:flex;gap:8px;align-items:flex-end">';
  h+='<div><label style="font-size:11px;color:var(--mut)">設定邀請碼</label>';
  h+='<input id="thCodeInput" class="inp" value="' + esc(u.classCode || '') + '" style="margin-top:4px;width:140px" placeholder="輸入邀請碼"></div>';
  h+='<button class="btn gold mini" onclick="thCodeSave()">💾 儲存</button>';
  h+='</div>';
  h+='<div style="font-size:11px;color:var(--mut);margin-top:6px">💡 將此邀請碼提供給學生，註冊時輸入即可加入你的班級。</div>';
  h+='</div>';

  h+='<div class="panel2" style="margin-top:12px;padding:10px;border-left:4px solid #2196f3">';
  h+='<div style="font-size:12px;color:var(--mut)">💡 教師首頁提供班級管理的總覽。你可以快速發布作業、查看學生成績、管理名冊。學生註冊時輸入你的邀請碼即可加入班級。</div>';
  h+='</div>';

  $('#view').innerHTML=h;
}

function vTHomeStudent(username){
  var users=get(LS.users,[]);
  var student=null;
  for(var i=0;i<users.length;i++){
    if(users[i].username===username){student=users[i];break}
  }
  if(!student){toast('找不到學生','bad');return}
  var sg=student.g||{};
  var h='<div style="padding:16px">';
  h+='<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">';
  var eq=(sg.equip&&sg.equip.character&&CHARS&&CHARS[sg.equip.character])?CHARS[sg.equip.character].icon:'🧑‍🎓';
  h+='<div style="font-size:36px">'+eq+'</div>';
  h+='<div><b style="font-family:var(--serif);color:var(--gold2);font-size:18px;display:block">'+esc(student.name||student.username)+'</b>';
  h+='<div style="font-size:12px;color:var(--mut)">@'+esc(student.username)+' · Lv.'+(sg.lv||1)+' '+titleOf(sg.lv||1)+'</div></div>';
  h+='</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:6px;margin-bottom:14px">';
  h+='<div style="text-align:center;padding:8px;background:#1a1a2e;border-radius:6px"><div style="font-size:14px">⭐</div><div style="font-size:14px;font-weight:900;color:var(--teal)">'+(sg.lv||1)+'</div><div style="font-size:9px;color:var(--mut)">等級</div></div>';
  h+='<div style="text-align:center;padding:8px;background:#1a1a2e;border-radius:6px"><div style="font-size:14px">🪙</div><div style="font-size:14px;font-weight:900;color:var(--gold2)">'+(sg.gold||0)+'</div><div style="font-size:9px;color:var(--mut)">金幣</div></div>';
  h+='<div style="text-align:center;padding:8px;background:#1a1a2e;border-radius:6px"><div style="font-size:14px">💎</div><div style="font-size:14px;font-weight:900;color:#2196f3">'+(sg.crystal||0)+'</div><div style="font-size:9px;color:var(--mut)">水晶</div></div>';
  h+='<div style="text-align:center;padding:8px;background:#1a1a2e;border-radius:6px"><div style="font-size:14px">📝</div><div style="font-size:14px;font-weight:900;color:#ff9800">'+((sg.quizLogs)||[]).length+'</div><div style="font-size:9px;color:var(--mut)">測驗</div></div>';
  h+='</div>';
  h+='<div style="font-size:12px;color:var(--mut);margin-bottom:10px"><b>最近測驗紀錄：</b></div>';
  var logs=(sg.quizLogs||[]).slice(-5).reverse();
  if(logs.length){
    for(var l=0;l<logs.length;l++){
      var log=logs[l];
      h+='<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:12px">';
      h+='<span style="color:var(--mut)">'+(log.date||'')+'</span>';
      h+='<span>答對 '+(log.correct||0)+'/'+(log.total||0)+'</span>';
      h+='<span style="color:var(--gold2);font-weight:700">'+(log.score||0)+' 分</span>';
      h+='</div>';
    }
  }else{
    h+='<div style="font-size:12px;color:var(--mut);padding:8px 0">尚無測驗紀錄</div>';
  }
  h+='<div style="display:flex;gap:8px;margin-top:14px">';
  h+='<button class="btn ghost" onclick="closeModal()">返回</button>';
  h+='</div></div>';
  openModal(h);
}

function vTHomeAnalysis(){
  var users=get(LS.users,[]);
  var myClassCode=(me()||{}).classCode||'';
  var myStudents=users.filter(function(x){
    return x.role==='student'&&x.classCode===myClassCode;
  });
  var h=back()+'<h3 class="vt">📈 學情分析 <span class="vsub">班級成績分佈・學習趨勢</span></h3>';
  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--teal);font-size:14px">📊 等級分佈</b>';
  h+='<div style="margin-top:10px">';
  var levelBuckets=[0,0,0,0,0];
  for(var i=0;i<myStudents.length;i++){
    var lv=myStudents[i].g&&myStudents[i].g.lv||1;
    if(lv<5)levelBuckets[0]++;
    else if(lv<10)levelBuckets[1]++;
    else if(lv<15)levelBuckets[2]++;
    else if(lv<20)levelBuckets[3]++;
    else levelBuckets[4]++;
  }
  var bucketLabels=['Lv.1-4','Lv.5-9','Lv.10-14','Lv.15-19','Lv.20+'];
  var bucketColors=['#4caf50','#2196f3','#ff9800','#e91e63','var(--gold2)'];
  var maxBucket=Math.max.apply(null,levelBuckets.concat([1]));
  for(var b=0;b<levelBuckets.length;b++){
    var pct=myStudents.length>0?Math.round(levelBuckets[b]/myStudents.length*100):0;
    h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
    h+='<span style="font-size:11px;color:var(--mut);min-width:60px">'+bucketLabels[b]+'</span>';
    h+='<div style="flex:1;height:18px;background:#1a1a2e;border-radius:4px;overflow:hidden">';
    h+='<div style="height:100%;width:'+Math.round(levelBuckets[b]/maxBucket*100)+'%;background:'+bucketColors[b]+';border-radius:4px"></div></div>';
    h+='<span style="font-size:11px;color:var(--mut);min-width:50px;text-align:right">'+levelBuckets[b]+' 人 ('+pct+'%)</span></div>';
  }
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:#ff9800;font-size:14px">🏆 班級 Top 10</b>';
  h+='<div style="margin-top:10px">';
  var sorted=myStudents.slice().sort(function(a,b){return(b.g&&b.g.lv||1)-(a.g&&a.g.lv||1)}).slice(0,10);
  for(var t=0;t<sorted.length;t++){
    var ts=sorted[t];
    var tg=ts.g||{};
    var medal=t===0?'🥇':t===1?'🥈':t===2?'🥉':(t+1)+'.';
    h+='<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:12px">';
    h+='<span style="min-width:28px">'+medal+'</span>';
    h+='<span style="flex:1;color:var(--txt)">'+esc(ts.name||ts.username)+'</span>';
    h+='<span style="color:var(--gold2);font-weight:700">Lv.'+(tg.lv||1)+'</span>';
    h+='<span style="color:var(--mut)">'+(tg.gold||0)+' 🪙</span></div>';
  }
  h+='</div></div>';
  h+='<div style="margin-top:12px"><button class="btn" onclick="vTHome()">⬅ 返回首頁</button></div>';
  $('#view').innerHTML=h;
}

function thomeCopyCode(){
  var code=(me()||{}).classCode||'';
  if(!code){toast('尚未設定邀請碼','bad');return}
  try{
    navigator.clipboard.writeText(code);
    toast('📋 已複製邀請碼');
  }catch(e){
    toast('邀請碼：'+code);
  }
}
function thCodeSave() {
  var el = document.getElementById('thCodeInput');
  var code = el ? el.value.trim() : '';
  if (!code || code.length < 3) { toast('邀請碼至少3個字元', 'bad'); return; }
  var u = me();
  if (u) { u.classCode = code; saveU(u); }
  toast('✅ 邀請碼已儲存：' + code);
}
window.thCodeSave = thCodeSave;
window.vTHome=vTHome;
