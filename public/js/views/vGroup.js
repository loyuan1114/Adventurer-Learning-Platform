/* vGroup — 組隊/隊伍系統 */
function vGroup(){
  const u=me(), g=u.g, party=g.partyId?get('ADV9_PARTIES',[]).find(p=>p.id===g.partyId):null;
  let h=back()+'<h3 class="vt">👥 隊伍系統 <span class="vsub">組隊探索・共享經驗・隊伍技能</span></h3>';

  if(party){
    h+='<div class="panel2" style="margin-bottom:12px;border-left:4px solid var(--teal)"><b style="color:var(--teal)">🏷️ 隊伍：'+esc(party.name)+'</b> <span class="chip">ID: '+party.id.slice(-6)+'</span>';
    h+=`<div class="skTxt" style="margin-top:6px">隊長：${esc(party.leaderName)} ｜ 成員：${party.members.length}/${party.maxSize} ｜ 狀態：${party.inDungeon?'🏰 副本中':'🏠 待機中'}</div>`;
    h+='<div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">';
    party.members.forEach(m=>{
      const mem=get(LS.users,[]).find(x=>x.id===m.id);
      if(!mem) return;
      const isLeader=m.id===party.leader, isMe=m.id===u.id;
      h+=`<div class="frIt"><div style="font-size:24px">${mem.prof?.avatar?avatarHtml(mem,36):'🧑‍🎓'}</div><div class="collInfo"><b>${esc(mem.name)}${isLeader?' 👑':' '}${isMe?' (你)':''}</b><div class="skTxt">Lv.${mem.g?.lv||1} ｜ ${jobName(mem.g?.job)} ｜ HP:${mem.g?.hp||0}/${mem.g?.maxHp||100}</div></div><div style="display:flex;gap:4px">`;
      if(isLeader&&!isMe) h+=`<button class="btn mini danger" onclick="partyKick('${m.id}')">踢出</button>`;
      if(isMe&&!isLeader) h+=`<button class="btn mini danger" onclick="partyLeave()">退出隊伍</button>`;
      if(isLeader) h+=`<button class="btn mini teal" onclick="partyInvite()">邀請成員</button>`;
      h+='</div></div>';
    });
    h+='</div>';
    if(party.leader===u.id){
      h+='<div class="rwRow" style="margin-top:8px"><button class="rwChip" onclick="partyEnterDungeon()">🏰 進入副本</button><button class="rwChip" onclick="partyEnterPK()">⚔️ 隊伍PK</button><button class="rwChip danger" onclick="partyDisband()">解散隊伍</button></div>';
    }else{
      h+='<div class="rwRow" style="margin-top:8px"><button class="rwChip danger" onclick="partyLeave()">退出隊伍</button></div>';
    }
    h+='</div>';
  }else{
    h+='<div class="panel2" style="margin-bottom:12px"><b>🔍 公開隊伍</b>';
    const parties=get('ADV9_PARTIES',[]).filter(p=>!p.inDungeon&&p.members.length<p.maxSize);
    if(!parties.length) h+='<div class="empty">暫無公開隊伍</div>';
    else{
      h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px;margin-top:8px">';
      parties.forEach(p=>{
        h+=`<div class="panel2"><b>${esc(p.name)}</b><div class="skTxt">隊長：${esc(p.leaderName)} ｜ ${p.members.length}/${p.maxSize} 人 ｜ ${p.target||'自由活動'}</div><button class="btn mini" style="margin-top:8px;width:100%" onclick="partyApply('${p.id}')">📝 申請加入</button></div>`;
      });
      h+='</div>';
    }
    h+='</div>';

    h+='<div class="panel2"><b style="color:var(--gold2)">➕ 創建隊伍</b>';
    h+='<input id="ptName" placeholder="隊伍名稱" style="margin-top:8px">';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">';
    h+='<select id="ptTarget"><option value="dungeon">🏰 副本探索</option><option value="pk">⚔️ 競技場</option><option value="territory">🗺️ 領土推進</option><option value="boss">👑 世界首領</option><option value="free">🆓 自由活動</option></select>';
    h+='<input id="ptMax" type="number" placeholder="最大人數" value="4" min="2" max="5">';
    h+='</div>';
    h+='<div class="mBtns" style="margin-top:10px"><button class="btn" onclick="partyCreate()">創建隊伍</button></div></div>';
  }
  $('#view').innerHTML=h;
}
function partyCreate(){
  const u=me(), name=$('#ptName').value.trim()||u.name+'的隊伍', target=$('#ptTarget').value, max=+$('#ptMax').value||4;
  const party={id:'pt'+Date.now(),name,leader:u.id,leaderName:u.name,members:[{id:u.id,name:u.name}],maxSize:max,target,inDungeon:false,created:Date.now()};
  const parties=get('ADV9_PARTIES',[]); parties.push(party); set('ADV9_PARTIES',parties);
  u.g.partyId=party.id; set(LS.users,get(LS.users,[])); toast('✅ 隊伍創建成功'); vGroup();
}
function partyApply(id){
  const u=me(), parties=get('ADV9_PARTIES',[]), p=parties.find(x=>x.id===id); if(!p) return;
  if(p.members.some(m=>m.id===u.id)) return toast('⚠️ 已在隊伍中','bad');
  p.applications=p.applications||[]; if(!p.applications.includes(u.id)) p.applications.push(u.id);
  set('ADV9_PARTIES',parties); toast('📝 申請已發送，等待隊長批准');
}
function partyInvite(){
  const u=me(), party=get('ADV9_PARTIES',[]).find(p=>p.id===u.g.partyId); if(!party||party.leader!==u.id) return;
  let h='<div class="mt">邀請玩家</div><input id="piSearch" placeholder="搜尋玩家名稱" style="margin-top:8px"><button class="btn" style="margin-top:8px" onclick="partyDoInvite()">搜尋並邀請</button><div id="piResults" style="margin-top:12px"></div>';
  openModal(h);
}
function partyDoInvite(){
  const q=$('#piSearch').value.trim(); if(!q) return toast('⚠️ 輸入關鍵字','bad');
  const results=get(LS.users,[]).filter(x=>x.name.includes(q)&&x.id!==u.id).slice(0,10);
  $('#piResults').innerHTML=results.map(r=>`<div class="frIt"><b>${esc(r.name)}</b> Lv.${r.g?.lv||1} <button class="btn mini" onclick="partySendInvite('${r.id}')">邀請</button></div>`).join('');
}
function partySendInvite(id){
  const u=me(), party=get('ADV9_PARTIES',[]).find(p=>p.id===u.g.partyId), target=get(LS.users,[]).find(x=>x.id===id);
  if(!party||!target) return; target.g.partyInvites=target.g.partyInvites||[]; target.g.partyInvites.push({partyId:party.id,partyName:party.name,from:u.name,ts:Date.now()});
  set(LS.users,get(LS.users,[])); toast(`✅ 已邀請 ${target.name}`); closeModal();
}
function partyAcceptInvite(partyId){
  const u=me(), parties=get('ADV9_PARTIES',[]), p=parties.find(x=>x.id===partyId); if(!p) return toast('⚠️ 隊伍不存在','bad');
  if(p.members.length>=p.maxSize) return toast('⚠️ 隊伍已滿','bad');
  p.members.push({id:u.id,name:u.name}); u.g.partyId=partyId; u.g.partyInvites=u.g.partyInvites.filter(i=>i.partyId!==partyId);
  set('ADV9_PARTIES',parties); set(LS.users,get(LS.users,[])); toast('✅ 已加入隊伍'); vGroup();
}
function partyLeave(){
  const u=me(), parties=get('ADV9_PARTIES',[]), p=parties.find(x=>x.id===u.g.partyId); if(!p) return;
  if(p.leader===u.id){partyDisband(); return}
  p.members=p.members.filter(m=>m.id!==u.id); u.g.partyId=null; set('ADV9_PARTIES',parties); set(LS.users,get(LS.users,[])); toast('🚪 已退出隊伍'); vGroup();
}
function partyKick(id){
  const u=me(), parties=get('ADV9_PARTIES',[]), p=parties.find(x=>x.id===u.g.partyId); if(!p||p.leader!==u.id) return;
  p.members=p.members.filter(m=>m.id!==id);
  const target=get(LS.users,[]).find(x=>x.id===id); if(target) target.g.partyId=null;
  set('ADV9_PARTIES',parties); set(LS.users,get(LS.users,[])); toast('👢 已踢出成員'); vGroup();
}
function partyDisband(){
  const u=me(), parties=get('ADV9_PARTIES',[]), p=parties.find(x=>x.id===u.g.partyId); if(!p||p.leader!==u.id) return;
  p.members.forEach(m=>{const t=get(LS.users,[]).find(x=>x.id===m.id); if(t) t.g.partyId=null;});
  set('ADV9_PARTIES',parties.filter(x=>x.id!==p.id)); set(LS.users,get(LS.users,[])); toast('💥 隊伍已解散'); vGroup();
}
function partyEnterDungeon(){toast('🏰 隊伍副本功能開發中…')}
function partyEnterPK(){toast('⚔️ 隊伍PK功能開發中…')}
function jobName(j){const J={war:'戰士',mage:'法師',archer:'弓箭手',assassin:'刺客',tank:'坦克',support:'支援'};return J[j]||'無'}