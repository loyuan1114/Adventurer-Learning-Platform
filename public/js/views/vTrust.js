/* ════════════════════════════════════════════
   vTrust — 家庭數位信任公約 + 家長邀請機制 v2
   修復：增加容錯、明確角色處理、safeSet 防卡住
   ════════════════════════════════════════════ */

function getTrustData(){
  try{return get('ADV9_TRUST',{parents:[],students:[],invitations:[],violation_logs:[]})}
  catch(e){return{parents:[],students:[],invitations:[],violation_logs:[]}}
}

/* 安全寫入：避免資料過大或格式錯誤導致卡住 */
function safeSetTrust(data){
  try{set('ADV9_TRUST',data);return true}catch(e){console.error('safeSetTrust',e);return false}
}

function vTrust(){
  const u=me();
  if(!u){$('#view').innerHTML='<h3 class="vt">🏛 請先登入</h3>';return;}

  let h=back()+'<h3 class="vt">🏛 家庭數位信任公約</h3>';

  try{
    const trust=getTrustData();

    if(u.role==='admin'){
      h+=renderAdminTrustPanel(trust);
    }else if(u.role==='student'){
      h+=renderStudentTrustPanel(u,trust);
    }else{
      /* teacher 或其他角色：顯示為家長/教師視角 */
      h+=renderParentTrustPanel(u,trust);
    }
  }catch(e){
    console.error('vTrust render error',e);
    h+='<div class="panel2" style="padding:16px;color:#f44336">載入錯誤：'+esc(String(e))+'</div>';
    h+='<button class="btn" onclick="vTrust()">🔄 重試</button>';
  }

  $('#view').innerHTML=h;
}

function renderAdminTrustPanel(trust){
  let h='';
  const parents=trust.parents||[];
  const students=trust.students||[];
  const invitations=trust.invitations||[];
  const violations=trust.violation_logs||[];

  h+='<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">';
  h+='<div class="panel2" style="padding:10px 16px;text-align:center"><div style="font-size:20px;font-weight:bold;color:var(--teal)">'+parents.length+'</div><div style="font-size:11px;color:var(--mut)">已註冊家長</div></div>';
  h+='<div class="panel2" style="padding:10px 16px;text-align:center"><div style="font-size:20px;font-weight:bold;color:#4caf50">'+students.length+'</div><div style="font-size:11px;color:var(--mut)">綁定學生</div></div>';
  h+='<div class="panel2" style="padding:10px 16px;text-align:center"><div style="font-size:20px;font-weight:bold;color:#ff9800">'+invitations.filter(function(i){return i.status==='pending'}).length+'</div><div style="font-size:11px;color:var(--mut)">待處理邀請</div></div>';
  h+='<div class="panel2" style="padding:10px 16px;text-align:center"><div style="font-size:20px;font-weight:bold;color:#f44336">'+violations.length+'</div><div style="font-size:11px;color:var(--mut)">違規紀錄</div></div>';
  h+='</div>';

  if(violations.length){
    h+='<h4 style="margin-bottom:8px">🚨 違規紀錄</h4>';
    violations.slice(-10).reverse().forEach(function(v){
      h+='<div class="panel2" style="margin-bottom:6px;padding:10px;border-left:4px solid #f44336;font-size:12px">';
      h+='<div><b>'+esc(v.parent_id||'?')+'</b> → '+esc(v.student_id||'?')+'</div>';
      h+='<div style="color:var(--mut)">類型：'+esc(v.violation_type||'?')+' | 結果：'+esc(v.result||'?')+'</div>';
      h+='</div>';
    });
  }

  /* 所有邀請列表 */
  if(invitations.length){
    h+='<h4 style="margin:14px 0 8px">📋 所有邀請</h4>';
    invitations.slice(-20).reverse().forEach(function(inv){
      const statusText={pending:'⏳ 待回覆',accepted:'✅ 已接受',declined:'❌ 已婉拒'}[inv.status]||inv.status;
      h+='<div class="panel2" style="margin-bottom:4px;padding:8px;font-size:12px">';
      h+=esc(inv.parent_id||'?')+' → '+esc(inv.student_id||'?')+' | '+statusText;
      if(inv.message)h+=' | '+esc(inv.message);
      h+='</div>';
    });
  }

  return h;
}

function renderParentTrustPanel(u,trust){
  let h='';
  const parents=trust.parents||[];
  const parentEntry=parents.find(function(p){return p.username===u.username});

  /* 檢查停權 */
  if(parentEntry&&parentEntry.suspension_status==='suspended'){
    h+='<div class="panel2" style="padding:16px;border-left:4px solid #f44336">';
    h+='<div style="font-size:16px;font-weight:bold;color:#f44336">🚫 帳號已停權</div>';
    h+='<div style="font-size:12px;color:var(--mut);margin-top:6px">原因：'+esc(parentEntry.suspension_reason||'違反信任公約')+'</div>';
    h+='<div style="font-size:12px;color:var(--mut)">停權至：'+(parentEntry.suspended_until?new Date(parentEntry.suspended_until).toLocaleString('zh-TW'):'永久')+'</div>';
    h+='</div>';
    return h;
  }

  if(!parentEntry||!parentEntry.trust_agreement_accepted){
    /* 顯示公約 */
    h+='<div class="panel2" style="padding:20px">';
    h+='<div style="font-size:15px;font-weight:bold;margin-bottom:12px">📜 家庭數位信任公約</div>';
    h+='<div style="font-size:13px;line-height:1.8;margin-bottom:16px">';
    h+='<p>作為家長/監護人，我同意以下條款：</p>';
    h+='<ol style="padding-left:20px">';
    h+='<li><b>尊重學生自主權</b>：不繞過學生同意，不強制開啟高強度監控。</li>';
    h+='<li><b>不強制開啟守護者</b>：只能發送「挑戰邀請」，由學生決定是否接受。</li>';
    h+='<li><b>違規後果</b>：若違反以上承諾，系統將停權我的帳號。</li>';
    h+='<li><b>隱私保護</b>：尊重學生的隱私，不查看受保護的私人通訊。</li>';
    h+='<li><b>信任為本</b>：以理解和引導取代監控和懲罰。</li>';
    h+='</ol></div>';
    h+='<button class="btn big" onclick="acceptTrustAgreement()">✅ 我同意以上公約</button>';
    h+='</div>';
  }else{
    /* 已接受公約：顯示邀請功能 */
    h+='<div class="panel2" style="margin-bottom:14px;padding:12px;border-left:4px solid #4caf50">';
    h+='<div style="font-size:13px;color:#4caf50">✅ 已接受家庭數位信任公約</div>';
    h+='<div style="font-size:11px;color:var(--mut)">接受時間：'+new Date(parentEntry.accepted_at).toLocaleString('zh-TW')+'</div>';
    h+='</div>';

    h+='<h4 style="margin-bottom:8px">📩 發送挑戰邀請</h4>';
    h+='<div class="panel2" style="padding:14px">';
    h+='<div style="margin-bottom:10px"><label class="mlab">學生帳號</label>';
    h+='<input id="trustStudentId" placeholder="輸入學生 username" style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px"></div>';
    h+='<div style="margin-bottom:10px"><label class="mlab">邀請訊息</label>';
    h+='<textarea id="trustMsg" rows="2" placeholder="例：一起來挑戰今日的數學題吧！" style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px;resize:vertical"></textarea></div>';
    h+='<button class="btn teal" onclick="sendTrustInvitation()">📤 發送邀請</button>';
    h+='</div>';

    const myInvites=(trust.invitations||[]).filter(function(i){return i.parent_id===u.username});
    if(myInvites.length){
      h+='<h4 style="margin:14px 0 8px">📋 已發送的邀請</h4>';
      myInvites.forEach(function(inv){
        const statusText={pending:'⏳ 待回覆',accepted:'✅ 已接受',declined:'❌ 已婉拒'}[inv.status]||inv.status;
        h+='<div class="panel2" style="margin-bottom:6px;padding:10px;font-size:12px">';
        h+='<div style="display:flex;justify-content:space-between"><span>→ '+esc(inv.student_id)+'</span><span>'+statusText+'</span></div>';
        if(inv.message)h+='<div style="color:var(--mut)">'+esc(inv.message)+'</div>';
        if(inv.cooldown_until&&Date.now()<new Date(inv.cooldown_until).getTime()){
          h+='<div style="color:#ff9800;font-size:11px">⚠️ 冷卻中，'+new Date(inv.cooldown_until).toLocaleString('zh-TW')+' 後可重發</div>';
        }
        h+='</div>';
      });
    }
  }
  return h;
}

function renderStudentTrustPanel(u,trust){
  let h='';
  const invitations=trust.invitations||[];
  const myInvites=invitations.filter(function(i){return i.student_id===u.username});
  const pendingInvites=myInvites.filter(function(i){return i.status==='pending'});
  const hasGuardian=(trust.students||[]).find(function(s){return s.username===u.username});

  /* 同意管理區塊 */
  h+='<div class="panel2" style="margin-bottom:14px;padding:14px;border-left:4px solid #2196f3">';
  h+='<div style="font-size:14px;font-weight:bold;margin-bottom:8px">🛡️ 思考守護同意</div>';
  if(hasGuardian){
    h+='<div style="font-size:12px;color:var(--mut);margin-bottom:8px">你已綁定家長/監護人：'+esc(hasGuardian.guardian_id)+'</div>';
    /* 檢查是否有有效同意 */
    var consentData=get('ADV9_CONSENT_'+u.username,{events:[]});
    var activeConsent=consentData.events.find(function(e){return e.status==='granted'&&!e.revoked_at});
    if(activeConsent){
      h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="width:10px;height:10px;border-radius:50%;background:#4caf50"></div><span style="font-size:12px;color:#4caf50">思考追蹤已啟用</span></div>';
      h+='<button class="btn" style="background:#f44336;color:white;font-size:12px" onclick="revokeConsent()">🚫 撤回同意</button>';
    }else{
      h+='<div style="font-size:12px;color:var(--mut);margin-bottom:8px">思考守護目前<b>未啟用</b>。啟用後系統會追蹤你的作答行為（專注時間、修改次數等），但不會記錄具體輸入內容。</div>';
      h+='<div style="display:flex;gap:8px">';
      h+='<button class="btn" style="background:#4caf50;color:white" onclick="grantConsent(\'frontend_trace\')">✅ 我同意啟用</button>';
      h+='<button class="btn ghost" style="font-size:12px" onclick="toast(\'已略過，之後可隨時在這裡啟用\')">⏸ 先不要</button>';
      h+='</div>';
    }
  }else{
    h+='<div style="font-size:12px;color:var(--mut)">你尚未綁定家長/監護人。家長發送邀請並你接受後，即可管理思考守護同意。</div>';
  }
  h+='</div>';

  /* 邀請區塊 */
  if(pendingInvites.length){
    h+='<h4 style="margin-bottom:8px">📩 收到的挑戰邀請</h4>';
    pendingInvites.forEach(function(inv){
      const parent=(trust.parents||[]).find(function(p){return p.username===inv.parent_id});
      h+='<div class="panel2" style="margin-bottom:8px;padding:14px;border-left:4px solid #ff9800">';
      h+='<div style="font-size:14px;margin-bottom:6px">來自：'+esc(parent?(parent.name||parent.username):inv.parent_id)+'</div>';
      h+='<div style="font-size:13px;color:var(--mut);margin-bottom:10px">'+esc(inv.message||'邀請你加入學習挑戰')+'</div>';
      h+='<div style="display:flex;gap:8px">';
      h+='<button class="btn" style="background:#4caf50;color:white" onclick="respondInvitation(\''+esc(inv.id)+'\',\'accepted\')">✅ 接受邀請</button>';
      h+='<button class="btn" style="background:#9e9e9e;color:white" onclick="respondInvitation(\''+esc(inv.id)+'\',\'declined\')">❌ 婉拒</button>';
      h+='</div></div>';
    });
  }

  const responded=myInvites.filter(function(i){return i.status!=='pending'});
  if(responded.length){
    h+='<h4 style="margin:14px 0 8px">📋 邀請紀錄</h4>';
    responded.forEach(function(inv){
      const icon={accepted:'✅',declined:'❌'}[inv.status]||'';
      h+='<div class="panel2" style="margin-bottom:6px;padding:10px;font-size:12px">';
      h+=icon+' '+esc(inv.parent_id)+' — '+esc(inv.message||'');
      h+='</div>';
    });
  }

  if(!pendingInvites.length&&!responded.length){
    h+='<div class="panel2" style="color:var(--mut);font-size:13px;padding:16px;text-align:center">暫無邀請。家長可發送挑戰邀請給你。</div>';
  }

  return h;
}

function acceptTrustAgreement(){
  const u=me();if(!u)return toast('請先登入','bad');
  const trust=getTrustData();
  const now=new Date().toISOString();

  /* 檢查停權 */
  const existing=(trust.parents||[]).find(function(p){return p.username===u.username});
  if(existing&&existing.suspension_status==='suspended')return toast('❌ 帳號已被停權','bad');

  if(existing){
    existing.trust_agreement_accepted=true;
    existing.accepted_at=now;
  }else{
    trust.parents=trust.parents||[];
    trust.parents.push({
      id:'p_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),
      username:u.username,
      name:u.name||u.username,
      trust_agreement_accepted:true,
      accepted_at:now,
      suspension_status:null,
      suspended_until:null,
      sponsorship_reason:null
    });
  }

  if(!safeSetTrust(trust)){
    toast('儲存失敗，請稍後再試','bad');return;
  }
  toast('✅ 已接受家庭數位信任公約');
  vTrust();
}

function sendTrustInvitation(){
  const u=me();if(!u)return;
  const studentId=(document.getElementById('trustStudentId')?document.getElementById('trustStudentId').value:'').trim();
  const msg=(document.getElementById('trustMsg')?document.getElementById('trustMsg').value:'').trim();
  if(!studentId)return toast('請輸入學生帳號','bad');

  const trust=getTrustData();

  /* 檢查停權 */
  const pe=(trust.parents||[]).find(function(p){return p.username===u.username});
  if(pe&&pe.suspension_status==='suspended')return toast('❌ 帳號已被停權','bad');

  /* 檢查冷卻 */
  const cd=(trust.invitations||[]).find(function(i){
    return i.parent_id===u.username&&i.student_id===studentId&&i.status==='declined'&&i.cooldown_until&&Date.now()<new Date(i.cooldown_until).getTime();
  });
  if(cd)return toast('⚠️ 冷卻中，'+new Date(cd.cooldown_until).toLocaleString('zh-TW')+' 後再試','bad');

  /* 檢查學生是否存在 */
  const users=get(LS.users,[]);
  const student=users.find(function(s){return s.username===studentId&&s.role==='student'});
  if(!student)return toast('找不到學生：'+studentId,'bad');

  const now=new Date().toISOString();
  trust.invitations=trust.invitations||[];
  trust.invitations.push({
    id:'inv_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),
    parent_id:u.username,
    student_id:studentId,
    task_id:null,
    message:msg||'邀請你加入學習挑戰',
    status:'pending',
    created_at:now,
    responded_at:null,
    cooldown_until:null
  });

  if(!safeSetTrust(trust))return toast('儲存失敗','bad');
  toast('✅ 邀請已發送');
  vTrust();
}

function respondInvitation(invId,status){
  const u=me();if(!u)return;
  const trust=getTrustData();
  const inv=(trust.invitations||[]).find(function(i){return i.id===invId&&i.student_id===u.username});
  if(!inv)return toast('邀請不存在','bad');

  const now=new Date().toISOString();
  inv.status=status;
  inv.responded_at=now;

  if(status==='declined'){
    inv.cooldown_until=new Date(Date.now()+24*3600000).toISOString();
  }

  if(status==='accepted'){
    trust.students=trust.students||[];
    const existing=trust.students.find(function(s){return s.username===u.username});
    if(existing){
      existing.guardian_id=inv.parent_id;
      existing.last_consent_at=now;
    }else{
      trust.students.push({
        id:'s_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),
        username:u.username,
        guardian_id:inv.parent_id,
        guardian_mode_enabled:false,
        last_consent_at:now,
        last_consent_revoked_at:null,
        active_consent_id:null
      });
    }
  }

  if(!safeSetTrust(trust))return toast('儲存失敗','bad');
  toast(status==='accepted'?'✅ 已接受邀請':'已婉拒邀請');
  vTrust();
}
