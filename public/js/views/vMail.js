/* vMail — 郵件系統 */
function vMail(){
  const u=me(), mails=u.g.mail||[];
  let h=back()+'<h3 class="vt">📬 郵件系統 <span class="vsub">系統通知・好友私信・獎勵領取</span></h3>';
  h+='<div class="tabRow">';
  ['all','unread','system','social','rewards'].forEach((t,i)=>{
    const label={all:'📬 全部',unread:`🆕 未讀${mails.filter(m=>!m.read).length?' ('+mails.filter(m=>!m.read).length+')':''}`,system:'⚙️ 系統',social:'👥 社交',rewards:'🎁 獎勵'}[t];
    h+=`<button class="tabB ${i===0?'on':''}" onclick="mailTab('${t}')">${label}</button>`;
  });
  h+='</div>';
  h+='<div id="mailArea"></div>';
  $('#view').innerHTML=h;
  mailTab('all');
}
function mailTab(t){
  window._mailTab=t;
  document.querySelectorAll('.tabB').forEach(b=>b.classList.toggle('on',b.onclick.toString().includes(t)));
  const u=me(), mails=u.g.mail||[];
  let filtered=mails;
  if(t==='unread') filtered=mails.filter(m=>!m.read);
  else if(t==='system') filtered=mails.filter(m=>m.sys);
  else if(t==='social') filtered=mails.filter(m=>m.from&&!m.sys);
  else if(t==='rewards') filtered=mails.filter(m=>m.rewards);
  const area=$('#mailArea');
  if(!filtered.length){area.innerHTML='<div class="panel2 empty">無郵件</div>'; return;}
  let h='<div style="display:flex;flex-direction:column;gap:8px">';
  filtered.slice(0,50).forEach(m=>{
    h+=`<div class="panel2 ${!m.read?'impcard':''}" style="position:relative;cursor:pointer" onclick="mailOpen('${m.id}')">`;
    if(!m.read) h+=`<div class="stockTag" style="background:var(--teal);top:8px;right:8px">🆕</div>`;
    h+=`<b>${esc(m.title)}</b>${m.sys?' <span class="chip">系統</span>':m.from?' <span class="chip">'+esc(m.from)+'</span>':''}`;
    h+=`<div class="skTxt">${new Date(m.ts).toLocaleString()}</div>`;
    if(m.rewards) h+=`<div class="chip" style="margin-top:4px">🎁 有附件</div>`;
    h+='</div>';
  });
  h+='</div>';
  if(mails.some(m=>!m.read)) h+=`<div class="mBtns" style="margin-top:10px;justify-content:center"><button class="btn teal" onclick="mailReadAll()">✅ 全部標記已讀</button></div>`;
  area.innerHTML=h;
}
function mailOpen(id){
  const u=me(), mail=u.g.mail.find(m=>m.id===id); if(!mail) return;
  if(!mail.read){mail.read=true; set(LS.users,get(LS.users,[]));}
  let h=`<div class="mt">${esc(mail.title)}</div><div class="msub">${mail.sys?'📢 系統郵件':'👤 來自：'+esc(mail.from||'未知')} ｜ ${new Date(mail.ts).toLocaleString()}</div>`;
  h+=`<div style="margin-top:12px;white-space:pre-wrap">${esc(mail.content)}</div>`;
  if(mail.rewards){
    h+=`<div style="margin-top:12px;padding:12px;background:rgba(242,193,78,.1);border:1px solid var(--goldD);border-radius:8px"><b>🎁 附件獎勵：</b>`;
    Object.entries(mail.rewards).forEach(([k,v])=>{
      const label={gold:'金幣',gems:'寶石',exp:'經驗',item:'道具'}[k]||k;
      h+=`<div class="chip" style="margin:4px">${label} x${v}</div>`;
    });
    if(!mail.claimed){
      h+=`<div class="mBtns" style="margin-top:10px"><button class="btn big" onclick="mailClaim('${id}');closeModal()">🎁 領取附件</button></div>`;
    }else h+=`<div class="chip ok" style="margin-top:10px">✅ 已領取</div>`;
    h+='</div>';
  }
  h+=`<div class="mBtns" style="margin-top:10px"><button class="btn danger" onclick="mailDelete('${id}');closeModal()">🗑️ 刪除</button><button class="btn ghost" onclick="closeModal()">關閉</button></div>`;
  openModal(h);
}
function mailClaim(id){
  const u=me(), mail=u.g.mail.find(m=>m.id===id); if(!mail||mail.claimed) return;
  Object.entries(mail.rewards).forEach(([k,v])=>{if(k==='gold') u.g.gold+=v; else if(k==='gems') u.g.gems+=v; else if(k==='exp') u.g.exp+=v; else if(k==='item'){u.g.bag=u.g.bag||{items:[],capacity:50}; u.g.bag.items.push({id:v,count:1});}});
  mail.claimed=true; set(LS.users,get(LS.users,[])); toast('✅ 獎勵已領取'); mailTab(window._mailTab||'all');
}
function mailDelete(id){
  const u=me(); u.g.mail=u.g.mail.filter(m=>m.id!==id); set(LS.users,get(LS.users,[])); toast('🗑️ 已刪除'); mailTab(window._mailTab||'all');
}
function mailReadAll(){
  const u=me(); u.g.mail.forEach(m=>m.read=true); set(LS.users,get(LS.users,[])); toast('✅ 全部標記已讀'); mailTab('all');
}