/* ════════════════════════════════════════════
   vAdminPanel — AP 管理控制台（管理員專用）
   ════════════════════════════════════════════ */
function safeJson(r){return r.ok?r.json():r.text().then(function(t){throw new Error(t)})}
async function vAdminPanel(){
  if(!WTOKEN){
    $('#view').innerHTML=back()+'<div class="panel2" style="padding:20px;text-align:center"><b style="color:#ffcc80">⚠️ Token 已過期或遺失</b><div style="margin-top:10px;font-size:12px;color:var(--mut)">請重新登入以取得新 token</div><button class="btn teal" style="margin-top:12px" onclick="logout()">🔐 重新登入</button></div>';
    return;
  }
  if(!(typeof IS_ADMIN==='function'&&IS_ADMIN())) return toast('⚠️ 僅管理員可進入','bad');
  let h=back()+'<h3 class="vt">📊 AP 管理控制台 <span class="vsub">規則設定・手動發放・審計追蹤</span></h3>';
  h+='<div id="apTabs" style="display:flex;gap:6px;margin:10px 0 14px;flex-wrap:wrap"></div>';
  h+='<div id="apContent"></div>';
  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--blue);font-size:15px">📚 班級管理</b>';
  h+='<div id="clsManageSection"></div>';
  h+='</div>';
  $('#view').innerHTML=h;
  window._apTab=0;
  apRenderTabs();
  apLoadTab(0);
  apLoadClassManagement();
}

function apRenderTabs(){
  const tabs=['📊 統計總覽','⚙️ 獎勵規則','💰 手動發放','📋 審計日誌','🔍 用戶查詢'];
  $('#apTabs').innerHTML=tabs.map((t,i)=>'<button class="btn '+(window._apTab===i?'':'ghost')+' mini" onclick="apLoadTab('+i+')" style="font-size:12.5px">'+t+'</button>').join('');
}

function apLoadTab(idx){
  window._apTab=idx;
  apRenderTabs();
  const el=$('#apContent');
  if(idx===0) apStats(el);
  else if(idx===1) apRules(el);
  else if(idx===2) apGrant(el);
  else if(idx===3) apAudit(el);
  else if(idx===4) apUserSearch(el);
}

/* ──────────── Tab 1: 統計總覽 ──────────── */
async function apStats(el){
  el.innerHTML='<div style="padding:20px;text-align:center;color:var(--mut)">⏳ 載入統計資料…</div>';
  try{
    const r=await fetch('/rest/v1/ap/stats',{headers:{'x-adv9-token':WTOKEN}});
    const d=await safeJson(r);
    if(!d.ok) throw new Error(d.msg||'載入失敗');
    const s=d.stats;
    let h='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px">';
    const cards=[
      {icon:'🪙',label:'總發放 AP',val:s.total_earned,color:'var(--gold2)'},
      {icon:'🔥',label:'總消耗 AP',val:s.total_spent,color:'#ff8a80'},
      {icon:'🌊',label:'流通 AP',val:s.circulating,color:'var(--teal)'},
      {icon:'👥',label:'活躍用戶',val:s.active_users,color:'#a5d6a7'}
    ];
    cards.forEach(c=>{
      h+='<div class="panel2" style="text-align:center;padding:14px 10px"><div style="font-size:22px;margin-bottom:4px">'+c.icon+'</div><div style="font-size:20px;font-weight:900;color:'+c.color+'">'+(c.val!=null?Number(c.val).toLocaleString():'-')+'</div><div style="font-size:11px;color:var(--mut);margin-top:2px">'+c.label+'</div></div>';
    });
    h+='</div>';
    if(s.inflation_risk!=null){
      const risk=s.inflation_risk;
      const riskColor=risk>0.7?'#ff8a80':risk>0.4?'#ffcc80':'#a5d6a7';
      const riskLabel=risk>0.7?'⚠️ 高':risk>0.4?'⚡ 中':'✅ 低';
      h+='<div class="panel2" style="padding:12px;border-left:4px solid '+riskColor+'"><b style="color:var(--gold2);font-size:13px">📈 通脹風險評估</b>';
      h+='<div style="margin-top:6px;font-size:24px;font-weight:900;color:'+riskColor+'">'+(risk*100).toFixed(1)+'%</div>';
      h+='<div style="font-size:12px;color:var(--mut);margin-top:2px">風險等級：'+riskLabel+'</div>';
      h+='<div class="bar" style="margin-top:8px;height:6px;border-radius:3px;background:#1a1a2e"><i style="width:'+(risk*100)+'%;background:'+riskColor+';border-radius:3px;display:block;height:100%"></i></div></div>';
    }
    el.innerHTML=h;
  }catch(e){el.innerHTML='<div class="panel2" style="color:#ff8a80">❌ '+esc(e.message)+'</div>';}
}

/* ──────────── Tab 2: 獎勵規則 ──────────── */
async function apRules(el){
  el.innerHTML='<div style="padding:20px;text-align:center;color:var(--mut)">⏳ 載入規則…</div>';
  try{
    const r=await fetch('/rest/v1/ap/rules',{headers:{'x-adv9-token':WTOKEN}});
    const d=await safeJson(r);
    if(!d.ok) throw new Error(d.msg||'載入失敗');
    window._apRulesData=d;
    let h='<div class="panel2" style="margin-bottom:12px;border-left:4px solid var(--teal);padding:12px"><b style="color:var(--teal);font-size:13px">📌 平台最低限制（唯讀）</b>';
    const pm=d.platform_min||{};
    const pmKeys=['daily_cap','weekly_cap','monthly_cap'];
    h+='<div style="display:flex;gap:16px;margin-top:6px;font-size:12px;color:var(--mut)">';
    pmKeys.forEach(k=>{if(pm[k]!=null) h+='<span>'+k+': <b style="color:var(--gold2)">'+pm[k]+'</b></span>';});
    h+='</div></div>';

    h+='<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2);font-size:14px">🌐 全域上限 (global_caps)</b>';
    const gc=d.global_caps||{};
    h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px">';
    h+='<div><label style="font-size:11px;color:var(--mut)">每日上限</label><input id="apGcDaily" type="number" value="'+(gc.daily_total||0)+'"></div>';
    h+='<div><label style="font-size:11px;color:var(--mut)">每週上限</label><input id="apGcWeekly" type="number" value="'+(gc.weekly_total||0)+'"></div>';
    h+='<div><label style="font-size:11px;color:var(--mut)">每月上限</label><input id="apGcMonthly" type="number" value="'+(gc.monthly_total||0)+'"></div>';
    h+='</div></div>';

    const rules=d.rules||{};
    const ruleTypes=[
      {key:'daily_login',name:'📅 每日登入',desc:'每日登入獎勵'},
      {key:'quiz_correct',name:'✅ 答題正確',desc:'答對一題獲得'},
      {key:'quiz_perfect',name:'💯 滿分通关',desc:'全部答對額外獎勵'},
      {key:'streak_bonus',name:'🔥 連續登入',desc:'連續登入額外獎勵'},
      {key:'homework_done',name:'📝 完成作業',desc:'繳交作業獎勵'},
      {key:'homework_perfect',name:'🌟 作業滿分',desc:'作業全對額外獎勵'},
      {key:'daily_mission',name:'🎯 每日任務',desc:'完成每日任務獎勵'},
      {key:'weekly_mission',name:'📆 每週任務',desc:'完成每週任務獎勵'},
      {key:'pk_win',name:'⚔️ PK 勝利',desc:'PK 勝利獎勵'},
      {key:'pk_loss',name:'🛡️ PK 參與',desc:'PK 參與安慰獎'},
      {key:'trading',name:'🤝 交易達成',desc:'完成交易獎勵'},
      {key:'tutor',name:'👨‍🏫 輔導他人',desc:'輔導其他玩家獎勵'}
    ];
    h+='<div class="panel2"><b style="color:var(--gold2);font-size:14px">⚙️ 各項獎勵設定</b><div style="margin-top:8px;font-size:11px;color:var(--mut)">修改後按「儲存規則」統一送出。Num = AP 數量，Cap = 個人每日上限（0 = 無限制）。</div>';
    h+='<div class="tblWrap" style="margin-top:10px"><table><thead><tr><th>獎勵類型</th><th>啟用</th><th>AP</th><th>每日上限</th><th>每週上限</th><th>每月上限</th><th>描述</th></tr></thead><tbody>';
    ruleTypes.forEach(rt=>{
      const r=rules[rt.key]||{};
      h+='<tr>';
      h+='<td style="font-size:12.5px">'+rt.name+'</td>';
      h+='<td><input type="checkbox" id="apR_'+rt.key+'_en" '+(r.enabled!==false?'checked':'')+'></td>';
      h+='<td><input type="number" id="apR_'+rt.key+'_ap" value="'+(r.ap||0)+'" style="width:60px"></td>';
      h+='<td><input type="number" id="apR_'+rt.key+'_dm" value="'+(r.daily_cap||0)+'" style="width:60px"></td>';
      h+='<td><input type="number" id="apR_'+rt.key+'_wm" value="'+(r.weekly_cap||0)+'" style="width:60px"></td>';
      h+='<td><input type="number" id="apR_'+rt.key+'_mm" value="'+(r.monthly_cap||0)+'" style="width:60px"></td>';
      h+='<td style="font-size:11px;color:var(--mut)">'+rt.desc+'</td>';
      h+='</tr>';
    });
    h+='</tbody></table></div></div>';

    h+='<div style="margin-top:12px;display:flex;gap:8px;align-items:center">';
    h+='<button class="btn mini teal" onclick="apSaveRules()">💾 儲存規則</button>';
    h+='<span id="apRulesMsg" style="font-size:12px;color:var(--mut)"></span>';
    h+='</div>';
    el.innerHTML=h;
  }catch(e){el.innerHTML='<div class="panel2" style="color:#ff8a80">❌ '+esc(e.message)+'</div>';}
}

async function apSaveRules(){
  var msg=$('#apRulesMsg');if(msg){msg.textContent='⏳ 儲存中…';msg.style.color='var(--mut)';}
  const rules=window._apRulesData?.rules||{};
  const types=['daily_login','quiz_correct','quiz_perfect','streak_bonus','homework_done','homework_perfect','daily_mission','weekly_mission','pk_win','pk_loss','trading','tutor'];
  types.forEach(k=>{
    rules[k]={
      enabled:$('#apR_'+k+'_en').checked,
      ap:+$('#apR_'+k+'_ap').value||0,
      daily_cap:+$('#apR_'+k+'_dm').value||0,
      weekly_cap:+$('#apR_'+k+'_wm').value||0,
      monthly_cap:+$('#apR_'+k+'_mm').value||0
    };
  });
  const global_caps={
    daily_total:+$('#apGcDaily').value||0,
    weekly_total:+$('#apGcWeekly').value||0,
    monthly_total:+$('#apGcMonthly').value||0
  };
  try{
    const r=await fetch('/rest/v1/ap/rules',{
      method:'POST',
      headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
      body:JSON.stringify({rules,global_caps,reason:'管理員後台修改獎勵規則'})
    });
    const d=await safeJson(r);
    if(d.ok){msg.textContent='✅ 已儲存';msg.style.color='var(--teal)';toast('✅ 規則已更新');}
    else throw new Error(d.msg||'儲存失敗');
  }catch(e){msg.textContent='❌ '+e.message;msg.style.color='#ff8a80';}
}

/* ──────────── Tab 3: 手動發放 ──────────── */
async function apGrant(el){
  let h='<div class="panel2"><b style="color:var(--gold2);font-size:14px">💰 手動發放 AP</b>';
  h+='<div style="margin-top:10px">';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  h+='<div><label style="font-size:11px;color:var(--mut)">目標用戶名稱</label><input id="apGrantUser" placeholder="username"></div>';
  h+='<div><label style="font-size:11px;color:var(--mut)">發放 AP 數量</label><input id="apGrantAmt" type="number" value="100" min="1"></div>';
  h+='</div>';
  h+='<div style="margin-top:8px"><label style="font-size:11px;color:var(--mut)">發放原因（必填）</label><input id="apGrantReason" placeholder="請輸入原因，留作審計紀錄…"></div>';
  h+='<div style="margin-top:10px;display:flex;gap:8px;align-items:center">';
  h+='<button class="btn mini teal" onclick="apDoGrant()">💰 確認發放</button>';
  h+='<span id="apGrantMsg" style="font-size:12px;color:var(--mut)"></span>';
  h+='</div>';
  h+='<div id="apGrantResult" style="margin-top:10px;display:none"></div>';
  h+='</div></div>';
  el.innerHTML=h;
}

async function apDoGrant(){
  const user=($('#apGrantUser')?.value||'').trim();
  const amt=+(($('#apGrantAmt')?.value||'0'));
  const reason=($('#apGrantReason')?.value||'').trim();
  const msg=$('#apGrantMsg');
  const res=$('#apGrantResult');
  if(!user.trim()){msg.textContent='⚠️ 請輸入目標用戶名';msg.style.color='#ffcc80';return;}
  if(amt<=0){msg.textContent='⚠️ 數量須大於 0';msg.style.color='#ffcc80';return;}
  if(!reason.trim()){msg.textContent='⚠️ 請填寫發放原因';msg.style.color='#ffcc80';return;}
  msg.textContent='⏳ 發放中…';msg.style.color='var(--mut)';
  res.style.display='none';
  try{
    const r=await fetch('/rest/v1/ap/grant',{
      method:'POST',
      headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
      body:JSON.stringify({target_user:user.trim(),amount:amt,reason:reason.trim(),type:'ADMIN_GRANT'})
    });
    const d=await safeJson(r);
    if(d.ok){
      msg.textContent='✅ 已發放 '+amt+' AP 給 '+user.trim();msg.style.color='var(--teal)';
      toast('✅ 已發放 AP');
      res.style.display='block';
      res.innerHTML='<div class="panel2" style="border-left:4px solid var(--teal);font-size:12.5px;padding:10px">✅ <b>發放成功</b><br>目標：'+esc(user.trim())+'<br>數量：'+amt+' AP<br>原因：'+esc(reason.trim())+'<br>時間：'+new Date().toLocaleString()+'</div>';
      if($('#apGrantReason')) $('#apGrantReason').value='';
    }else throw new Error(d.msg||'發放失敗');
  }catch(e){
    msg.textContent='❌ '+e.message;msg.style.color='#ff8a80';
    res.style.display='block';
    res.innerHTML='<div class="panel2" style="border-left:4px solid #ff8a80;font-size:12.5px;padding:10px;color:#ff8a80">❌ 發放失敗：'+esc(e.message)+'</div>';
  }
}

/* ──────────── Tab 4: 審計日誌 ──────────── */
async function apAudit(el){
  el.innerHTML='<div style="padding:20px;text-align:center;color:var(--mut)">⏳ 載入審計日誌…</div>';
  try{
    const r=await fetch('/rest/v1/ap/audit?limit=100',{headers:{'x-adv9-token':WTOKEN}});
    const d=await safeJson(r);
    if(!d.ok) throw new Error(d.msg||'載入失敗');
    const logs=d.audit||[];
    let h='<div class="panel2"><b style="color:var(--gold2);font-size:14px">📋 最近 '+logs.length+' 筆審計紀錄</b>';
    if(logs.length){
      h+='<div class="tblWrap" style="margin-top:10px"><table><thead><tr><th>時間</th><th>管理員</th><th>操作</th><th>目標</th><th>變更</th><th>原因</th></tr></thead><tbody>';
      logs.forEach(l=>{
        const ts=l.ts?new Date(l.ts).toLocaleString():'-';
        const typeColors={ADMIN_GRANT:'var(--teal)',RULE_UPDATE:'var(--gold2)',BALANCE_CHANGE:'#ffcc80'};
        const tc=typeColors[l.type]||'var(--mut)';
        h+='<tr>';
        h+='<td style="font-size:11.5px;white-space:nowrap">'+ts+'</td>';
        h+='<td style="font-size:12px">'+esc(l.admin||'-')+'</td>';
        h+='<td style="font-size:12px"><span style="color:'+tc+';font-weight:600">'+esc(l.type||'-')+'</span></td>';
        h+='<td style="font-size:12px">'+esc(l.target||'-')+'</td>';
        h+='<td style="font-size:11.5px">'+esc((l.old_val!=null?l.old_val+'→':'')+(l.new_val!=null?l.new_val:''))+'</td>';
        h+='<td style="font-size:11.5px;color:var(--mut)">'+esc(l.reason||'-')+'</td>';
        h+='</tr>';
      });
      h+='</tbody></table></div>';
    }else h+='<div class="empty" style="margin-top:10px">暫無審計紀錄</div>';
    h+='</div>';
    el.innerHTML=h;
  }catch(e){el.innerHTML='<div class="panel2" style="color:#ff8a80">❌ '+esc(e.message)+'</div>';}
}

/* ──────────── Tab 5: 用戶查詢 ──────────── */
function apUserSearch(el){
  let h='<div class="panel2"><b style="color:var(--gold2);font-size:14px">🔍 用戶 AP 查詢</b>';
  h+='<div style="display:flex;gap:8px;margin-top:10px;align-items:center">';
  h+='<input id="apQueryUser" placeholder="輸入用戶名稱 (username)">';
  h+='<button class="btn mini teal" onclick="apDoUserQuery()">🔍 查詢</button>';
  h+='</div>';
  h+='<div id="apQueryResult" style="margin-top:12px"></div>';
  h+='</div>';
  el.innerHTML=h;
}

async function apDoUserQuery(){
  const user=(($('#apQueryUser')||{}).value||'').trim();
  const res=$('#apQueryResult');
  if(!user){res.innerHTML='<div style="color:#ffcc80;font-size:12px">⚠️ 請輸入用戶名稱</div>';return;}
  res.innerHTML='<div style="color:var(--mut);font-size:12px">⏳ 查詢中…</div>';
  try{
    const r=await fetch('/rest/v1/ap/balance?target='+encodeURIComponent(user),{headers:{'x-adv9-token':WTOKEN}});
    const d=await safeJson(r);
    if(!d.ok) throw new Error(d.msg||'查詢失敗');
    const b=d.balance||d;
    let h='<div class="panel2" style="border-left:4px solid var(--teal);padding:12px">';
    h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">';
    h+='<span style="font-size:18px">👤</span>';
    h+='<b style="color:var(--gold2);font-size:14px">'+esc(b.username||user)+'</b>';
    if(b.name&&b.name!==b.username) h+='<span style="font-size:12px;color:var(--mut)">('+esc(b.name)+')</span>';
    h+='</div>';
    h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px">';
    const info=[
      {icon:'💰',label:'目前 AP',val:b.balance,color:'var(--gold2)'},
      {icon:'🪙',label:'累計獲得',val:b.total_earned,color:'var(--teal)'},
      {icon:'🔥',label:'累計消耗',val:b.total_spent,color:'#ff8a80'},
      {icon:'📅',label:'今日已獲',val:b.today_earned,color:'#a5d6a7'}
    ];
    info.forEach(i=>{
      h+='<div style="text-align:center;padding:8px;background:#1a1a2e;border-radius:6px"><div style="font-size:14px">'+i.icon+'</div><div style="font-size:16px;font-weight:900;color:'+i.color+'">'+(i.val!=null?Number(i.val).toLocaleString():'-')+'</div><div style="font-size:10px;color:var(--mut)">'+i.label+'</div></div>';
    });
    h+='</div>';
    if(b.cap_usage){
      h+='<div style="margin-top:10px;font-size:12px;color:var(--mut)"><b>限額使用：</b></div>';
      h+='<div style="display:flex;gap:12px;margin-top:4px;font-size:11.5px;flex-wrap:wrap">';
      Object.entries(b.cap_usage).forEach(([k,v])=>{
        h+='<span style="color:var(--gold2)">'+k+': '+v.used+'/'+v.limit+'</span>';
      });
      h+='</div>';
    }
    if(b.recent&&b.recent.length){
      h+='<div style="margin-top:10px;font-size:12px;color:var(--mut)"><b>近期紀錄：</b></div>';
      h+='<div style="margin-top:4px;max-height:200px;overflow:auto">';
      b.recent.slice(0,10).forEach(tx=>{
        const sign=tx.amount>0?'+':'';
        const clr=tx.amount>0?'var(--teal)':'#ff8a80';
        h+='<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #222;font-size:11.5px">';
        h+='<span style="color:var(--mut)">'+(tx.ts?new Date(tx.ts).toLocaleString():'')+'</span>';
        h+='<span>'+esc(tx.type||'')+'</span>';
        h+='<span style="color:'+clr+';font-weight:600">'+sign+tx.amount+'</span>';
        h+='</div>';
      });
      h+='</div>';
    }
    h+='</div>';
    res.innerHTML=h;
  }catch(e){res.innerHTML='<div class="panel2" style="color:#ff8a80;border-left:4px solid #ff8a80;padding:10px">❌ '+esc(e.message)+'</div>';}
}

async function apLoadClassManagement(){
  var el=document.getElementById('clsManageSection');
  if(!el)return;
  el.innerHTML='<div style="padding:12px;color:var(--mut)">⏳ 載入班級資料…</div>';
  try{
    var r=await fetch('/rest/v1/class/list',{headers:{'x-adv9-token':WTOKEN}});
    var d=await safeJson(r);
    if(!d.ok)throw new Error(d.reason||'載入失敗');
    var classes=d.classes||[];

    var allUsers=LS&&LS.users?LS.users:{};
    var userList=Array.isArray(allUsers)?allUsers:Object.keys(allUsers).map(function(k){return allUsers[k]});
    var students=userList.filter(function(u){return u&&u.role==='student'});

    var h='<div style="margin-top:10px">';
    h+='<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">';
    h+='<input id="clsNewName" class="inp" placeholder="新班級名稱" style="flex:1;font-size:12px">';
    h+='<button class="btn mini teal" onclick="apCreateClass()">➕ 建立班級</button>';
    h+='<span id="clsMsg" style="font-size:12px;color:var(--mut)"></span>';
    h+='</div>';

    if(classes.length===0){
      h+='<div style="color:var(--mut);font-size:12px;padding:8px 0">尚無班級</div>';
    }else{
      h+='<div class="tblWrap"><table><thead><tr><th>班級名稱</th><th>邀請碼</th><th>教師</th><th>學生數</th><th>建立時間</th></tr></thead><tbody>';
      classes.forEach(function(c){
        h+='<tr>';
        h+='<td style="font-size:12.5px">'+esc(c.name)+'</td>';
        h+='<td style="font-size:12px;font-family:monospace;color:var(--gold2)">'+esc(c.code)+'</td>';
        h+='<td style="font-size:12px">'+esc(c.teacherId)+'</td>';
        h+='<td style="font-size:12px;text-align:center">'+c.studentCount+'</td>';
        h+='<td style="font-size:11px;color:var(--mut)">'+(c.createdAt?new Date(c.createdAt).toLocaleDateString():'-')+'</td>';
        h+='</tr>';
      });
      h+='</tbody></table></div>';
    }

    h+='<div style="margin-top:16px;border-top:1px solid rgba(255,255,255,.08);padding-top:12px">';
    h+='<b style="color:var(--teal);font-size:13px">👤 指派學生到班級</b>';
    if(students.length===0){
      h+='<div style="color:var(--mut);font-size:12px;padding:8px 0">尚無學生帳號</div>';
    }else{
      h+='<div style="margin-top:8px">';
      students.forEach(function(su){
        var currentClass=su.classId||'';
        h+='<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04)">';
        h+='<span style="flex:1;font-size:12px">'+esc(su.name||su.username)+'</span>';
        h+='<select id="clsAssign_'+esc(su.username)+'" class="inp" style="width:160px;font-size:11px">';
        h+='<option value="">-- 未分班 --</option>';
        classes.forEach(function(c){
          var sel=c.id===currentClass?' selected':'';
          h+='<option value="'+esc(c.id)+'"'+sel+'>'+esc(c.name)+'</option>';
        });
        h+='</select>';
        h+='<button class="btn mini teal" onclick="apAssignStudent(\''+esc(su.username)+'\')">💾 存檔</button>';
        h+='</div>';
      });
      h+='</div>';
    }
    h+='</div>';
    h+='</div>';
    el.innerHTML=h;
  }catch(e){el.innerHTML='<div style="color:#ff8a80;font-size:12px">❌ '+esc(e.message)+'</div>';}
}

async function apCreateClass(){
  var inp=document.getElementById('clsNewName');
  var msg=document.getElementById('clsMsg');
  var name=(inp?inp.value:'').trim();
  if(!name){if(msg){msg.textContent='⚠️ 請輸入班級名稱';msg.style.color='#ffcc80';}return;}
  if(msg){msg.textContent='⏳ 建立中…';msg.style.color='var(--mut)';}
  try{
    var r=await fetch('/rest/v1/class/create',{
      method:'POST',
      headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
      body:JSON.stringify({name:name})
    });
    var d=await safeJson(r);
    if(d.ok){
      if(msg){msg.textContent='✅ 已建立班級：'+d.name+'（邀請碼：'+d.code+'）';msg.style.color='var(--teal)';}
      toast('✅ 班級已建立');
      if(inp)inp.value='';
      apLoadClassManagement();
    }else{
      if(msg){msg.textContent='❌ '+d.reason;msg.style.color='#ff8a80';}
    }
  }catch(e){if(msg){msg.textContent='❌ '+e.message;msg.style.color='#ff8a80';}}
}

async function apAssignStudent(username){
  var sel=document.getElementById('clsAssign_'+username);
  var classId=sel?sel.value:'';
  try{
    var r=await fetch('/rest/v1/class/assign',{
      method:'POST',
      headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
      body:JSON.stringify({studentId:username,classId:classId})
    });
    var d=await safeJson(r);
    if(d.ok){
      toast('✅ 已將 '+username+' 指派到'+(classId?'班級':'未分班'));
      apLoadClassManagement();
    }else{
      toast('❌ '+d.reason,'bad');
    }
  }catch(e){toast('❌ '+e.message,'bad');}
}

window.apAssignClass=function(username){apAssignStudent(username)};
window.apCreateClass=apCreateClass;
window.apAssignStudent=apAssignStudent;
window.apLoadClassManagement=apLoadClassManagement;
window.apSaveRules=apSaveRules;
window.apDoGrant=apDoGrant;
window.apDoUserQuery=apDoUserQuery;
window.apLoadTab=apLoadTab;
