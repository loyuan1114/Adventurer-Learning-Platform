/* vGuild — 公會系統 (玩家視角) */
function vGuild(){
  const u=me(), g=u.g, myGuild=g.guildId?get(LS.guilds,[]).find(x=>x.id===g.guildId):null, allGuilds=get(LS.guilds,[]);
  let h=back()+'<h3 class="vt">🏰 公會系統 <span class="vsub">加入/創建公會・公會任務・領地戰</span></h3>';

  if(myGuild){
    const isLeader=myGuild.leader===u.id, isOfficer=myGuild.officers?.includes(u.id);
    h+='<div class="panel2" style="margin-bottom:12px;border-left:4px solid var(--gold)"><b style="color:var(--gold2)">🏰 我的公會：'+esc(myGuild.name)+'</b>';
    h+=`<div class="skTxt" style="margin-top:6px">等級：Lv.${myGuild.lv||1} (${numFmt(myGuild.exp||0)}/${numFmt((myGuild.lv||1)*10000)} EXP) ｜ 成員：${myGuild.members.length}/${myGuild.maxMembers||30} ｜ 資金：${numFmt(myGuild.fund||0)} ｜ 貢獻：${g.guildContrib||0}</div>`;
    h+=`<div class="rwRow" style="margin-top:8px"><button class="rwChip" onclick="guildMembers()">👥 成員管理</button><button class="rwChip" onclick="vGShop()">🏪 公會商店</button><button class="rwChip" onclick="guildTasks()">📋 公會任務</button><button class="rwChip" onclick="guildTerritory()">🗺️ 領地戰</button>${isLeader||isOfficer?'<button class="rwChip" onclick="guildManage()">⚙️ 管理公會</button>':''}<button class="rwChip danger" onclick="guildLeave()">🚪 退出公會</button></div></div>`;
  }else{
    h+='<div class="panel2" style="margin-bottom:12px"><b>🔍 瀏覽公會</b>';
    if(!allGuilds.length) h+='<div class="empty">尚無公會，快創建第一個！</div>';
    else{
      h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:8px;margin-top:8px">';
      allGuilds.forEach(guild=>{
        h+=`<div class="panel2"><b>${esc(guild.name)}</b> ${guild.tag?`<span class="chip">[${esc(guild.tag)}]</span>`:''}<div class="skTxt">Lv.${guild.lv||1} ｜ ${guild.members.length}/${guild.maxMembers||30} 人 ｜ ${guild.desc||'無簡介'}</div><button class="btn mini" style="margin-top:8px;width:100%" onclick="guildApply('${guild.id}')">📝 申請加入</button></div>`;
      });
      h+='</div>';
    }
    h+='</div>';
  }

  h+='<div class="panel2"><b style="color:var(--gold2)">➕ 創建公會</b>';
  h+='<input id="newGName" placeholder="公會名稱" style="margin-top:8px">';
  h+='<input id="newGTag" placeholder="公會標籤 (2-4字，可選)" maxlength="4" style="margin-top:6px">';
  h+='<input id="newGDesc" placeholder="公會簡介/招募條件" style="margin-top:6px">';
  h+='<div class="mBtns" style="margin-top:10px"><button class="btn" onclick="guildCreate()">創建公會 (5000 金)</button></div></div>';
  $('#view').innerHTML=h;
}
function guildCreate(){
  const u=me(), n=$('#newGName').value.trim(), tag=$('#newGTag').value.trim().toUpperCase(), d=$('#newGDesc').value.trim();
  if(!n) return toast('⚠️ 請輸入公會名稱','bad');
  if(u.g.gold<5000) return toast('⚠️ 需要 5000 金幣','bad');
  const guild={id:'gd'+Date.now(),name:n,tag:tag||n.slice(0,4),desc:d,leader:u.id,leaderName:u.name,officers:[],members:[{id:u.id,name:u.name,role:'leader',contrib:0,joinAt:Date.now()}],maxMembers:30,lv:1,exp:0,fund:0,territories:[],created:Date.now()};
  const all=get(LS.guilds,[]); all.push(guild); set(LS.guilds,all);
  u.g.guildId=guild.id; u.g.guildContrib=0; u.g.gold-=5000; set(LS.users,get(LS.users,[]));
  toast('✅ 公會創建成功！'); vGuild();
}
function guildApply(id){
  const u=me(), guild=get(LS.guilds,[]).find(x=>x.id===id); if(!guild) return;
  if(guild.members.some(m=>m.id===u.id)) return toast('⚠️ 已在該公會','bad');
  guild.applications=guild.applications||[]; if(!guild.applications.includes(u.id)) guild.applications.push(u.id);
  set(LS.guilds,get(LS.guilds,[])); toast('📝 申請已發送'); vGuild();
}
function guildLeave(){
  if(!confirm('確定退出公會？')) return;
  const u=me(), guild=get(LS.guilds,[]).find(x=>x.id===u.g.guildId); if(!guild) return;
  if(guild.leader===u.id) return toast('⚠️ 會長請先轉讓或解散','bad');
  guild.members=guild.members.filter(m=>m.id!==u.id); u.g.guildId=null; u.g.guildContrib=0;
  set(LS.guilds,get(LS.guilds,[])); set(LS.users,get(LS.users,[])); toast('🚪 已退出公會'); vGuild();
}
function guildMembers(){
  const u=me(), guild=get(LS.guilds,[]).find(x=>x.id===u.g.guildId); if(!guild) return;
  let h='<div class="mt">公會成員</div><div style="max-height:400px;overflow:auto">';
  guild.members.forEach(m=>{
    const mem=get(LS.users,[]).find(x=>x.id===m.id); if(!mem) return;
    const online=Date.now()-(mem.g?.lastLogin||0)<300000;
    h+=`<div class="frIt"><div style="font-size:24px">${mem.prof?.avatar?avatarHtml(mem,36):'🧑‍🎓'}</div><div class="collInfo"><b>${esc(mem.name)}</b> <span class="chip">${m.role}</span><div class="skTxt">貢獻：${m.contrib} ｜ Lv.${mem.g?.lv||1} ｜ ${online?'線上':'離線'}</div></div>`;
    if(u.id===guild.leader&&m.id!==u.id) h+=`<button class="btn mini" onclick="guildPromote('${m.id}')">${m.role==='member'?'設為幹部':'撤銷幹部'}</button><button class="btn mini danger" onclick="guildKick('${m.id}')">踢出</button>`;
    h+='</div>';
  });
  h+='</div>'; openModal(h);
}
function guildPromote(id){
  const u=me(), guild=get(LS.guilds,[]).find(x=>x.id===u.g.guildId); if(!guild||guild.leader!==u.id) return;
  const m=guild.members.find(x=>x.id===id); if(!m) return;
  if(m.role==='member'){m.role='officer'; guild.officers=guild.officers||[]; if(!guild.officers.includes(id)) guild.officers.push(id);}
  else{m.role='member'; guild.officers=guild.officers.filter(x=>x!==id);}
  set(LS.guilds,get(LS.guilds,[])); toast('✅ 職位已更新'); guildMembers();
}
function guildKick(id){
  if(!confirm('確定踢出？')) return;
  const u=me(), guild=get(LS.guilds,[]).find(x=>x.id===u.g.guildId); if(!guild||guild.leader!==u.id) return;
  guild.members=guild.members.filter(m=>m.id!==id); guild.officers=guild.officers.filter(x=>x!==id);
  const target=get(LS.users,[]).find(x=>x.id===id); if(target){target.g.guildId=null; target.g.guildContrib=0;}
  set(LS.guilds,get(LS.guilds,[])); set(LS.users,get(LS.users,[])); toast('👢 已踢出'); guildMembers();
}
function guildManage(){toast('⚙️ 公會管理功能開發中…')}
function guildTasks(){toast('📋 公會任務功能開發中…')}
function guildTerritory(){toast('🗺️ 領地戰功能開發中…')}