/* vFriends — 好友系統 */
function vFriends(){
  const u=me(), g=u.g, friends=g.friends||[], requests=g.friendRequests||[];
  let h=back()+'<h3 class="vt">👥 好友系統 <span class="vsub">添加好友・組隊聊天・贈送禮物</span></h3>';
  h+='<div class="tabRow">';
  ['list','requests','search','blacklist'].forEach((t,i)=>{
    const label={list:'👥 好友列表',requests:`📥 申請${requests.length?' ('+requests.length+')':''}`,search:'🔍 搜尋玩家',blacklist:'🚫 黑名單'}[t];
    h+=`<button class="tabB ${i===0?'on':''}" onclick="friendsTab('${t}')">${label}</button>`;
  });
  h+='</div>';
  h+='<div id="friendsArea"></div>';
  $('#view').innerHTML=h;
  friendsTab('list');
}
function friendsTab(t){
  window._friendsTab=t;
  document.querySelectorAll('.tabB').forEach(b=>b.classList.toggle('on',b.onclick.toString().includes(t)));
  const area=$('#friendsArea'), u=me();
  if(t==='list') renderFriendsList(area,u);
  else if(t==='requests') renderFriendRequests(area,u);
  else if(t==='search') renderFriendSearch(area);
  else if(t==='blacklist') renderBlacklist(area,u);
}
function renderFriendsList(area,u){
  const friends=u.g.friends||[];
  let h='<div class="panel2">';
  if(!friends.length) h+='<div class="empty">好友列表為空，快去搜尋新朋友吧！</div>';
  else{
    h+='<div style="display:flex;flex-direction:column;gap:8px">';
    friends.forEach(fid=>{
      const f=get(LS.users,[]).find(x=>x.id===fid);
      if(!f) return;
      const online=Date.now()-(f.g?.lastLogin||0)<300000;
      h+=`<div class="frIt"><div style="font-size:28px">${f.prof?.avatar?avatarHtml(f,40):'🧑‍🎓'}</div><div class="collInfo"><b>${esc(f.name)}</b><div class="skTxt">Lv.${f.g?.lv||1} ｜ ${jobName(f.g?.job)} ｜ ${online?'<span class="onDot on"></span>線上':'<span class="onDot off"></span>離線'}</div></div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn mini" onclick="friendChat('${fid}')">💬 聊天</button><button class="btn mini ghost" onclick="friendTeam('${fid}')">👥 組隊</button><button class="btn mini teal" onclick="friendGift('${fid}')">🎁 贈禮</button><button class="btn mini danger" onclick="friendRemove('${fid}')">刪除</button></div></div>`;
    });
    h+='</div>';
  }
  h+='</div>';
  area.innerHTML=h;
}
function renderFriendRequests(area,u){
  const reqs=u.g.friendRequests||[];
  let h='<div class="panel2">';
  if(!reqs.length) h+='<div class="empty">無好友申請</div>';
  else{
    h+='<div style="display:flex;flex-direction:column;gap:8px">';
    reqs.forEach(fid=>{
      const f=get(LS.users,[]).find(x=>x.id===fid);
      if(!f) return;
      h+=`<div class="frIt"><div style="font-size:28px">${f.prof?.avatar?avatarHtml(f,40):'🧑‍🎓'}</div><div class="collInfo"><b>${esc(f.name)}</b><div class="skTxt">Lv.${f.g?.lv||1} 想加你為好友</div></div><div style="display:flex;gap:6px"><button class="btn teal" onclick="friendAccept('${fid}')">✅ 接受</button><button class="btn danger" onclick="friendReject('${fid}')">❌ 拒絕</button></div></div>`;
    });
    h+='</div>';
  }
  h+='</div>';
  area.innerHTML=h;
}
function renderFriendSearch(area){
  let h='<div class="panel2"><b>🔍 搜尋玩家</b>';
  h+='<input id="frSearch" placeholder="輸入玩家名稱或 ID" style="margin-top:8px">';
  h+='<button class="btn" style="margin-top:8px" onclick="friendDoSearch()">搜尋</button>';
  h+='<div id="frResults" style="margin-top:12px"></div></div>';
  area.innerHTML=h;
}
function renderBlacklist(area,u){
  const bl=u.g.blacklist||[];
  let h='<div class="panel2">';
  if(!bl.length) h+='<div class="empty">黑名單為空</div>';
  else{
    h+='<div style="display:flex;flex-direction:column;gap:8px">';
    bl.forEach(fid=>{
      const f=get(LS.users,[]).find(x=>x.id===fid);
      if(!f) return;
      h+=`<div class="frIt"><div style="font-size:28px">${f.prof?.avatar?avatarHtml(f,40):'🧑‍🎓'}</div><div class="collInfo"><b>${esc(f.name)}</b></div><button class="btn mini ghost" onclick="friendUnblock('${fid}')">🔓 解除封鎖</button></div>`;
    });
    h+='</div>';
  }
  h+='</div>';
  area.innerHTML=h;
}
function friendDoSearch(){
  const q=$('#frSearch').value.trim(); if(!q) return toast('⚠️ 請輸入關鍵字','bad');
  const results=get(LS.users,[]).filter(x=>x.name.includes(q)||x.id.includes(q)).slice(0,20);
  const el=$('#frResults');
  if(!results.length) el.innerHTML='<div class="empty">找不到玩家</div>';
  else el.innerHTML=results.map(f=>`<div class="frIt"><div style="font-size:28px">${f.prof?.avatar?avatarHtml(f,40):'🧑‍🎓'}</div><div class="collInfo"><b>${esc(f.name)}</b><div class="skTxt">ID: ${f.id} ｜ Lv.${f.g?.lv||1}</div></div><button class="btn mini" onclick="friendAdd('${f.id}')">➕ 加好友</button></div>`).join('');
}
function friendAdd(id){
  const u=me(); if(u.id===id) return toast('⚠️ 不能加自己','bad');
  if(u.g.friends?.includes(id)) return toast('⚠️ 已是好友','bad');
  const target=get(LS.users,[]).find(x=>x.id===id); if(!target) return toast('⚠️ 玩家不存在','bad');
  target.g.friendRequests=target.g.friendRequests||[]; if(!target.g.friendRequests.includes(u.id)) target.g.friendRequests.push(u.id);
  set(LS.users,get(LS.users,[])); toast('✅ 好友申請已發送'); friendDoSearch();
}
function friendAccept(id){
  const u=me(); u.g.friends=u.g.friends||[]; u.g.friends.push(id); u.g.friendRequests=u.g.friendRequests.filter(x=>x!==id);
  const target=get(LS.users,[]).find(x=>x.id===id); if(target){target.g.friends=target.g.friends||[]; target.g.friends.push(u.id);}
  set(LS.users,get(LS.users,[])); toast('✅ 已成為好友'); friendsTab('requests');
}
function friendReject(id){
  const u=me(); u.g.friendRequests=u.g.friendRequests.filter(x=>x!==id);
  set(LS.users,get(LS.users,[])); toast('❌ 已拒絕'); friendsTab('requests');
}
function friendRemove(id){
  if(!confirm('確定刪除好友？')) return;
  const u=me(); u.g.friends=u.g.friends.filter(x=>x!==id);
  const target=get(LS.users,[]).find(x=>x.id===id); if(target) target.g.friends=target.g.friends.filter(x=>x!==u.id);
  set(LS.users,get(LS.users,[])); toast('🗑️ 已刪除'); friendsTab('list');
}
function friendBlock(id){
  const u=me(); u.g.blacklist=u.g.blacklist||[]; if(!u.g.blacklist.includes(id)) u.g.blacklist.push(id);
  friendRemove(id); toast('🚫 已加入黑名單');
}
function friendUnblock(id){
  const u=me(); u.g.blacklist=u.g.blacklist.filter(x=>x!==id); set(LS.users,get(LS.users,[])); toast('🔓 已解除封鎖'); friendsTab('blacklist');
}
function friendChat(id){toast('💬 私聊功能開發中…')}
function friendTeam(id){toast('👥 組隊邀請已發送')}
function friendGift(id){
  const u=me(); const items=u.g.bag?.items||[]; if(!items.length) return toast('⚠️ 背包為空','bad');
  let h='<div class="mt">選擇贈送物品</div><div style="max-height:300px;overflow:auto">';
  items.forEach((it,i)=>{h+=`<div class="panel2" style="margin:4px 0" onclick="friendGiftConfirm('${id}',${i});closeModal()"><b>${esc(it.name)}</b> x${it.count||1}</div>`;});
  h+='</div>'; openModal(h);
}
function friendGiftConfirm(fid,idx){
  const u=me(), it=u.g.bag.items[idx]; if(!it) return;
  const target=get(LS.users,[]).find(x=>x.id===fid); if(!target) return toast('⚠️ 玩家不存在','bad');
  target.g.bag=target.g.bag||{items:[],capacity:50};
  if(target.g.bag.items.length>=target.g.bag.capacity) return toast('⚠️ 對方背包已滿','bad');
  u.g.bag.items.splice(idx,1); target.g.bag.items.push(it); set(LS.users,get(LS.users,[])); toast(`🎁 已贈送 ${it.name} 給 ${target.name}`);
}
function jobName(j){const J={war:'戰士',mage:'法師',archer:'弓箭手',assassin:'刺客',tank:'坦克',support:'支援'};return J[j]||'無'}