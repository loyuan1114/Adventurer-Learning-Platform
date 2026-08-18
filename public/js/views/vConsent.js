/* ════════════════════════════════════════════
   vConsent — 學生同意機制
   管理思考追蹤的同意/婉拒/退出流程
   ════════════════════════════════════════════ */

function vConsent(){
  const u=me();if(!u||!u.g)return;
  const sid=u.username;
  const consentData=get('ADV9_CONSENT_'+sid,{events:[]});
  const activeEvent=consentData.events.find(function(e){return e.status==='granted'&&!e.revoked_at});

  let h=back()+'<h3 class="vt">🛡️ 思考守護同意管理</h3>';

  /* 當前狀態 */
  h+='<div class="panel2" style="margin-bottom:14px;padding:16px">';
  if(activeEvent){
    h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
    h+='<div style="width:12px;height:12px;border-radius:50%;background:#4caf50"></div>';
    h+='<b style="color:#4caf50">思考追蹤已啟用</b></div>';
    h+='<div style="font-size:12px;color:var(--mut)">';
    h+='同意時間：'+new Date(activeEvent.granted_at).toLocaleString('zh-TW')+'<br>';
    h+='追蹤範圍：'+(activeEvent.scope==='cpp_guardian'?'前端追蹤 + C++ 守護者':'僅前端追蹤')+'<br>';
    h+='撤回後，收集的原始行為資料將於 7 天內刪除。<br>';
    h+='僅保留聚合後、去識別化的統計指標。';
    h+='</div>';
    h+='<button class="btn" style="background:#f44336;color:white;margin-top:10px" onclick="revokeConsent()">🚫 撤回同意</button>';
  }else{
    h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
    h+='<div style="width:12px;height:12px;border-radius:50%;background:#9e9e9e"></div>';
    h+='<b style="color:#9e9e9e">思考追蹤未啟用</b></div>';
    h+='<div style="font-size:12px;color:var(--mut)">你目前沒有啟用思考守護功能。</div>';
  }
  h+='</div>';

  /* 同意歷史 */
  h+='<h4 style="margin-bottom:8px">📋 同意歷史</h4>';
  if(consentData.events.length){
    consentData.events.forEach(function(e,i){
      h+='<div class="panel2" style="margin-bottom:6px;padding:10px;font-size:12px">';
      h+='<div style="display:flex;justify-content:space-between">';
      h+='<span>'+(e.status==='granted'?'✅ 已授權':'🚫 已撤回')+'</span>';
      h+='<span style="color:var(--mut)">'+new Date(e.granted_at).toLocaleString('zh-TW')+'</span></div>';
      h+='<div style="color:var(--mut);margin-top:4px">範圍：'+(e.scope==='cpp_guardian'?'前端+C++':'僅前端')+
        (e.revoked_at?' | 撤回：'+new Date(e.revoked_at).toLocaleString('zh-TW'):'')+
        (e.data_purged?' | 資料已刪除':'')+'</div>';
      h+='</div>';
    });
  }else{
    h+='<div class="panel2" style="color:var(--mut);font-size:13px;padding:12px">尚無同意紀錄。</div>';
  }

  /* 說明區 */
  h+='<div class="panel2" style="margin-top:14px;padding:14px;border-left:4px solid #2196f3">';
  h+='<b style="font-size:13px">📖 關於思考守護</b>';
  h+='<ul style="font-size:12px;color:var(--mut);margin:8px 0 0;padding-left:18px;line-height:1.8">';
  h+='<li>思考守護會追蹤你的作答行為（如專注時間、修改次數、貼上行為等）</li>';
  h+='<li><b>不會記錄</b>你具體打了什麼字</li>';
  h+='<li>僅計算「自主思考指數」等聚合指標</li>';
  h+='<li>這些指標會提供給家長參考，幫助理解你的思考過程</li>';
  h+='<li><b>你隨時可以撤回同意</b>，撤回後追蹤立即停止</li>';
  h+='<li>撤回後，原始行為資料將在 7 天內刪除</li>';
  h+='<li>家長<b>不能</b>強制開啟此功能，必須經過你同意</li>';
  h+='</ul></div>';

  $('#view').innerHTML=h;
}

function grantConsent(scope){
  scope=scope||'frontend_trace';
  const u=me();if(!u||!u.g)return;
  const sid=u.username;
  const now=new Date().toISOString();
  const consentData=get('ADV9_CONSENT_'+sid,{events:[]});

  /* 停用現有同意 */
  consentData.events.forEach(function(e){
    if(e.status==='granted'&&!e.revoked_at){
      e.status='revoked';
      e.revoked_at=now;
      e.data_deletion_due_at=new Date(Date.now()+7*86400000).toISOString();
    }
  });

  /* 新增同意事件 */
  consentData.events.push({
    id:'ce_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),
    student_id:sid,
    status:'granted',
    scope:scope,
    granted_at:now,
    revoked_at:null,
    data_deletion_due_at:null,
    data_purged:false
  });

  set('ADV9_CONSENT_'+sid,consentData);
  toast('✅ 已同意思考追蹤');
  vConsent();
}

function revokeConsent(){
  if(!confirm('確定撤回同意？\n撤回後思考追蹤將立即停止，已收集的原始行為資料將在 7 天內刪除。'))return;
  const u=me();if(!u||!u.g)return;
  const sid=u.username;
  const now=new Date().toISOString();
  const consentData=get('ADV9_CONSENT_'+sid,{events:[]});

  consentData.events.forEach(function(e){
    if(e.status==='granted'&&!e.revoked_at){
      e.status='revoked';
      e.revoked_at=now;
      e.data_deletion_due_at=new Date(Date.now()+7*86400000).toISOString();
    }
  });

  set('ADV9_CONSENT_'+sid,consentData);
  toast('🚫 已撤回同意');
  vConsent();
}

/* 查詢學生目前是否有有效同意 */
function hasActiveConsent(studentId){
  const consentData=get('ADV9_CONSENT_'+studentId,{events:[]});
  return consentData.events.some(function(e){return e.status==='granted'&&!e.revoked_at});
}

/* 取得學生目前的有效同意事件 */
function getActiveConsent(studentId){
  const consentData=get('ADV9_CONSENT_'+studentId,{events:[]});
  return consentData.events.find(function(e){return e.status==='granted'&&!e.revoked_at})||null;
}

/* 排程任務：清除過期的原始行為資料 */
function purgeExpiredConsentData(){
  const now=new Date().toISOString();
  /* 遍歷所有 localStorage 中的同意紀錄 */
  Object.keys(localStorage).forEach(function(key){
    if(key.indexOf('ADV9_CONSENT_')!==0)return;
    const consentData=get(key,{events:[]});
    var changed=false;
    consentData.events.forEach(function(e){
      if(e.revoked_at&&e.data_deletion_due_at&&now>e.data_deletion_due_at&&!e.data_purged){
        /* 刪除對應的思考追蹤資料 */
        var traceKey='ADV9_THINK_TRACE_'+e.student_id;
        var traceData=get(traceKey,{sessions:[]});
        traceData.sessions=traceData.sessions.filter(function(s){
          return s.consent_event_id!==e.id;
        });
        set(traceKey,traceData);
        e.data_purged=true;
        changed=true;
      }
    });
    if(changed)set(key,consentData);
  });
}
