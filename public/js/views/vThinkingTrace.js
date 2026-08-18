/* ════════════════════════════════════════════
   vThinkingTrace — 前端思考痕跡追蹤引擎
   追蹤 keydown/paste/blur/focus/停留時間/修改次數
   計算自主思考指數，綁定同意事件
   ════════════════════════════════════════════ */

let THINK_TRACE={
  active:false,
  sessionId:null,
  questionId:null,
  consentEventId:null,
  startTime:0,
  focusTime:0,
  idleTime:0,
  lastActivity:0,
  editCount:0,
  pasteCount:0,
  longPasteCount:0,
  windowSwitchCount:0,
  keyTimes:[],
  _focusInterval:null,
  _blurTime:0
};

/* 啟動思考追蹤 */
function startThinkingTrace(questionId){
  const u=me();if(!u||!u.g)return;
  const sid=u.username;

  /* 檢查是否有有效同意 */
  const consent=getActiveConsent(sid);
  if(!consent){
    THINK_TRACE.active=false;
    return null;
  }

  const now=Date.now();
  THINK_TRACE={
    active:true,
    sessionId:'tt_'+now+'_'+Math.random().toString(36).slice(2,8),
    questionId:questionId||'unknown',
    consentEventId:consent.id,
    startTime:now,
    focusTime:0,
    idleTime:0,
    lastActivity:now,
    editCount:0,
    pasteCount:0,
    longPasteCount:0,
    windowSwitchCount:0,
    keyTimes:[],
    _focusInterval:null,
    _blurTime:0
  };

  /* 監聽全域事件 */
  document.addEventListener('keydown',_traceKeydown);
  document.addEventListener('paste',_tracePaste);
  document.addEventListener('focus',_traceFocus);
  document.addEventListener('blur',_traceBlur);

  /* 定期更新專注時間 */
  THINK_TRACE._focusInterval=setInterval(function(){
    if(!THINK_TRACE.active)return;
    const now=Date.now();
    if(THINK_TRACE._blurTime===0){
      /* 視窗聚焦中 */
      THINK_TRACE.focusTime+=1;
    }
  },1000);

  return THINK_TRACE.sessionId;
}

/* 停止追蹤 */
function stopThinkingTrace(){
  if(!THINK_TRACE.active)return null;
  const u=me();if(!u||!u.g)return null;

  const now=Date.now();
  const totalTime=Math.floor((now-THINK_TRACE.startTime)/1000);

  /* 移除事件監聽 */
  document.removeEventListener('keydown',_traceKeydown);
  document.removeEventListener('paste',_tracePaste);
  document.removeEventListener('focus',_traceFocus);
  document.removeEventListener('blur',_traceBlur);

  if(THINK_TRACE._focusInterval){
    clearInterval(THINK_TRACE._focusInterval);
    THINK_TRACE._focusInterval=null;
  }

  /* 計算打字節奏分數 */
  var rhythmScore=0;
  if(THINK_TRACE.keyTimes.length>2){
    var intervals=[];
    for(var i=1;i<THINK_TRACE.keyTimes.length;i++){
      intervals.push(THINK_TRACE.keyTimes[i]-THINK_TRACE.keyTimes[i-1]);
    }
    var avg=intervals.reduce(function(a,b){return a+b},0)/intervals.length;
    var variance=intervals.reduce(function(s,v){return s+(v-avg)*(v-avg)},0)/intervals.length;
    var stdDev=Math.sqrt(variance);
    /* 標準差越小=打字越規律=越可能是自動化 */
    rhythmScore=Math.max(0,Math.min(1,1-stdDev/2000));
  }

  /* 建立 session 資料 */
  var session={
    id:THINK_TRACE.sessionId,
    student_id:u.username,
    question_id:THINK_TRACE.questionId,
    consent_event_id:THINK_TRACE.consentEventId,
    started_at:new Date(THINK_TRACE.startTime).toISOString(),
    ended_at:new Date(now).toISOString(),
    total_seconds:totalTime,
    focus_time_seconds:THINK_TRACE.focusTime,
    idle_time_seconds:THINK_TRACE.idleTime,
    edit_count:THINK_TRACE.editCount,
    paste_count:THINK_TRACE.pasteCount,
    long_paste_count:THINK_TRACE.longPasteCount,
    window_switch_count:THINK_TRACE.windowSwitchCount,
    typing_rhythm_score:rhythmScore,
    autonomy_score:0,
    mode:'normal',
    guardian_source:null
  };

  /* 計算自主思考指數 */
  session.autonomy_score=calcAutonomyScore(session);

  /* 儲存 */
  var traceKey='ADV9_THINK_TRACE_'+u.username;
  var traceData=get(traceKey,{sessions:[]});
  traceData.sessions.push(session);
  /* 只保留最近 100 筆 */
  if(traceData.sessions.length>100){
    traceData.sessions=traceData.sessions.slice(-100);
  }
  set(traceKey,traceData);

  THINK_TRACE.active=false;
  return session;
}

/* 事件處理器 */
function _traceKeydown(e){
  if(!THINK_TRACE.active)return;
  const now=Date.now();
  THINK_TRACE.lastActivity=now;
  THINK_TRACE.editCount++;
  THINK_TRACE.keyTimes.push(now);
  /* 限制記錄量 */
  if(THINK_TRACE.keyTimes.length>500)THINK_TRACE.keyTimes.shift();
}

function _tracePaste(e){
  if(!THINK_TRACE.active)return;
  THINK_TRACE.pasteCount++;
  var text='';
  if(e.clipboardData)text=e.clipboardData.getData('text')||'';
  if(text.length>100)THINK_TRACE.longPasteCount++;
}

function _traceFocus(e){
  if(!THINK_TRACE.active)return;
  if(THINK_TRACE._blurTime>0){
    var idleDuration=Math.floor((Date.now()-THINK_TRACE._blurTime)/1000);
    THINK_TRACE.idleTime+=idleDuration;
    THINK_TRACE._blurTime=0;
  }
}

function _traceBlur(e){
  if(!THINK_TRACE.active)return;
  THINK_TRACE._blurTime=Date.now();
  THINK_TRACE.windowSwitchCount++;
}

/* 查看思考追蹤報告（學生自己看） */
function vThinkingReport(){
  const u=me();if(!u||!u.g)return;
  const traceKey='ADV9_THINK_TRACE_'+u.username;
  const traceData=get(traceKey,{sessions:[]});
  const sessions=traceData.sessions||[];

  let h=back()+'<h3 class="vt">📊 我的思考報告</h3>';

  if(!sessions.length){
    h+='<div class="panel2" style="color:var(--mut);font-size:13px;padding:16px;text-align:center">尚無思考追蹤紀錄。</div>';
    $('#view').innerHTML=h;return;
  }

  /* 統計 */
  var totalFocus=sessions.reduce(function(s,x){return s+x.focus_time_seconds},0);
  var totalEdit=sessions.reduce(function(s,x){return s+x.edit_count},0);
  var totalPaste=sessions.reduce(function(s,x){return s+x.paste_count},0);
  var avgAutonomy=Math.round(sessions.reduce(function(s,x){return s+x.autonomy_score},0)/sessions.length);

  h+='<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">';
  h+='<div class="panel2" style="padding:10px 16px;text-align:center"><div style="font-size:20px;font-weight:bold;color:var(--teal)">'+sessions.length+'</div><div style="font-size:11px;color:var(--mut)">總追蹤次數</div></div>';
  h+='<div class="panel2" style="padding:10px 16px;text-align:center"><div style="font-size:20px;font-weight:bold;color:#4caf50">'+Math.round(totalFocus/60)+'</div><div style="font-size:11px;color:var(--mut)">專注分鐘</div></div>';
  h+='<div class="panel2" style="padding:10px 16px;text-align:center"><div style="font-size:20px;font-weight:bold;color:#2196f3">'+avgAutonomy+'</div><div style="font-size:11px;color:var(--mut)">平均思考指數</div></div>';
  h+='<div class="panel2" style="padding:10px 16px;text-align:center"><div style="font-size:20px;font-weight:bold;color:#ff9800">'+totalPaste+'</div><div style="font-size:11px;color:var(--mut)">貼上次數</div></div>';
  h+='</div>';

  /* 近 10 筆紀錄 */
  h+='<h4 style="margin-bottom:8px">📋 近期紀錄</h4>';
  sessions.slice(-10).reverse().forEach(function(s){
    var scoreColor=s.autonomy_score>=70?'#4caf50':s.autonomy_score>=40?'#ff9800':'#f44336';
    h+='<div class="panel2" style="margin-bottom:6px;padding:10px;font-size:12px">';
    h+='<div style="display:flex;justify-content:space-between">';
    h+='<span>📝 '+esc(s.question_id)+'</span>';
    h+='<span style="color:'+scoreColor+';font-weight:bold">思考指數 '+s.autonomy_score+'</span>';
    h+='</div>';
    h+='<div style="color:var(--mut);margin-top:4px">';
    h+='專注 '+s.focus_time_seconds+'s | 修改 '+s.edit_count+' 次 | 貼上 '+s.paste_count+' 次 | 切換 '+s.window_switch_count+' 次';
    h+='</div></div>';
  });

  $('#view').innerHTML=h;
}

/* 查看學生思考報告（家長/管理員看） */
function vStudentThinkingReport(studentId){
  const u=me();if(!u||!u.g)return;
  const traceKey='ADV9_THINK_TRACE_'+studentId;
  const traceData=get(traceKey,{sessions:[]});
  const sessions=traceData.sessions||[];

  let h=back()+'<h3 class="vt">📊 '+esc(studentId)+' 思考報告</h3>';

  if(!sessions.length){
    h+='<div class="panel2" style="color:var(--mut);font-size:13px;padding:16px;text-align:center">該學生尚無思考追蹤紀錄。</div>';
    $('#view').innerHTML=h;return;
  }

  var totalFocus=sessions.reduce(function(s,x){return s+x.focus_time_seconds},0);
  var totalEdit=sessions.reduce(function(s,x){return s+x.edit_count},0);
  var totalPaste=sessions.reduce(function(s,x){return s+x.paste_count},0);
  var totalLongPaste=sessions.reduce(function(s,x){return s+x.long_paste_count},0);
  var totalSwitch=sessions.reduce(function(s,x){return s+x.window_switch_count},0);
  var avgAutonomy=Math.round(sessions.reduce(function(s,x){return s+x.autonomy_score},0)/sessions.length);

  h+='<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">';
  h+='<div class="panel2" style="padding:10px 16px;text-align:center"><div style="font-size:20px;font-weight:bold;color:var(--teal)">'+avgAutonomy+'</div><div style="font-size:11px;color:var(--mut)">自主思考指數</div></div>';
  h+='<div class="panel2" style="padding:10px 16px;text-align:center"><div style="font-size:20px;font-weight:bold;color:#4caf50">'+Math.round(totalFocus/60)+'</div><div style="font-size:11px;color:var(--mut)">專注分鐘</div></div>';
  h+='<div class="panel2" style="padding:10px 16px;text-align:center"><div style="font-size:20px;font-weight:bold;color:#ff9800">'+totalPaste+'</div><div style="font-size:11px;color:var(--mut)">貼上'+(totalLongPaste>0?'(長'+totalLongPaste+')':'')+'</div></div>';
  h+='<div class="panel2" style="padding:10px 16px;text-align:center"><div style="font-size:20px;font-weight:bold;color:#2196f3">'+totalSwitch+'</div><div style="font-size:11px;color:var(--mut)">視窗切換</div></div>';
  h+='</div>';

  /* 詳細紀錄 */
  h+='<h4 style="margin-bottom:8px">📋 詳細紀錄</h4>';
  sessions.slice(-20).reverse().forEach(function(s){
    var scoreColor=s.autonomy_score>=70?'#4caf50':s.autonomy_score>=40?'#ff9800':'#f44336';
    h+='<div class="panel2" style="margin-bottom:6px;padding:10px;font-size:12px">';
    h+='<div style="display:flex;justify-content:space-between">';
    h+='<span>'+new Date(s.started_at).toLocaleString('zh-TW')+'</span>';
    h+='<span style="color:'+scoreColor+';font-weight:bold">'+s.autonomy_score+'</span>';
    h+='</div>';
    h+='<div style="color:var(--mut);margin-top:4px">';
    h+='專注 '+s.focus_time_seconds+'s | 閒置 '+s.idle_time_seconds+'s | 修改 '+s.edit_count+' | 貼上 '+s.paste_count+' | 切換 '+s.window_switch_count+' | 節奏分數 '+Math.round(s.typing_rhythm_score*100)+'%';
    h+='</div></div>';
  });

  $('#view').innerHTML=h;
}
