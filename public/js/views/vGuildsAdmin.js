/* vGuildsAdmin — 公會管理後台 */
function vGuildsAdmin(){
  if(!(typeof IS_ADMIN==='function'&&IS_ADMIN())) return toast('⚠️ 僅管理員可進入','bad');
  const guilds=get(LS.guilds,[]);
  let h=back()+'<h3 class="vt">🏰 公會管理後台 <span class="vsub">查看/管理所有公會・解散・轉讓・資金調整</span></h3>';
  h+='<div class="panel2"><b>📋 公會列表</b>';
  if(!guilds.length) h+='<div class="empty">尚無公會</div>';
  else{
    h+='<div class="tblWrap" style="margin-top:8px"><table><thead><tr><th>名稱</th><th>標籤</th><th>會長</th><th>等級</th><th>成員</th><th>資金</th><th>領地</th><th>操作</th></tr></thead><tbody>';
    guilds.forEach(g=>{
      const leader=get(LS.users,[]).find(x=>x.id===g.leader);
      h+=`<tr><td>${esc(g.name)}</td><td>${g.tag?`[${esc(g.tag)}]`:'-'}</td><td>${esc(leader?.name||'未知')}</td><td>Lv.${g.lv||1}</td><td>${g.members.length}/${g.maxMembers||30}</td><td>${numFmt(g.fund||0)}</td><td>${g.territories?.length||0}</td><td>`;
      h+=`<button class="btn mini ghost" onclick="adminViewGuild('${g.id}')">查看</button> `;
      h+=`<button class="btn mini" onclick="adminGuildFund('${g.id}')">💰 資金</button> `;
      h+=`<button class="btn mini danger" onclick="adminDisbandGuild('${g.id}')">解散</button></td></tr>`;
    });
    h+='</tbody></table></div>';
  }
  h+='</div>';
  $('#view').innerHTML=h;
}
function adminViewGuild(id){
  const guild=get(LS.guilds,[]).find(x=>x.id===id); if(!guild) return;
  let h=`<div class="mt">${esc(guild.name)} ${guild.tag?`[${esc(guild.tag)}]`:''}</div>`;
  h+=`<div class="msub">會長：${esc(get(LS.users,[]).find(u=>u.id===guild.leader)?.name||'未知')} ｜ Lv.${guild.lv||1} ｜ EXP: ${numFmt(guild.exp||0)} ｜ 資金：${numFmt(guild.fund||0)} ｜ 成員：${guild.members.length}/${guild.maxMembers||30}</div>`;
  h+='<div style="margin-top:12px;max-height:300px;overflow:auto"><b>成員列表：</b>';
  guild.members.forEach(m=>{
    const mem=get(LS.users,[]).find(x=>x.id===m.id);
    h+=`<div class="frIt" style="margin:4px 0"><b>${esc(mem?.name||m.name)}</b> <span class="chip">${m.role}</span> 貢獻：${m.contrib}</div>`;
  });
  h+='</div>';
  openModal(h);
}
function adminGuildFund(id){
  const guild=get(LS.guilds,[]).find(x=>x.id===id); if(!guild) return;
  let h=`<div class="mt">調整公會資金：${esc(guild.name)}</div><div class="msub">目前資金：${numFmt(guild.fund||0)}</div>`;
  h+=`<input id="gaFund" type="number" placeholder="調整金額 (正數增加、負數扣除)" style="margin-top:8px">`;
  h+=`<input id="gaReason" placeholder="調整原因" style="margin-top:6px">`;
  h+=`<div class="mBtns" style="margin-top:10px"><button class="btn" onclick="adminSaveGuildFund('${id}')">確定調整</button><button class="btn ghost" onclick="closeModal()">取消</button></div>`;
  openModal(h);
}
function adminSaveGuildFund(id){
  const guild=get(LS.guilds,[]).find(x=>x.id===id); if(!guild) return;
  const amt=+$('#gaFund').value||0, reason=$('#gaReason').value.trim();
  if(!amt||!reason) return toast('⚠️ 金額與原因必填','bad');
  guild.fund=(guild.fund||0)+amt; if(guild.fund<0) guild.fund=0;
  guild.fundLogs=guild.fundLogs||[]; guild.fundLogs.push({amt,reason,admin:me().name,ts:Date.now()});
  set(LS.guilds,get(LS.guilds,[])); toast(`✅ 資金已調整 ${amt>0?'+':''}${amt}`); closeModal(); vGuildsAdmin();
}
function adminDisbandGuild(id){
  if(!confirm('確定解散此公會？此操作不可逆！')) return;
  const guild=get(LS.guilds,[]).find(x=>x.id===id); if(!guild) return;
  guild.members.forEach(m=>{const u=get(LS.users,[]).find(x=>x.id===m.id); if(u){u.g.guildId=null; u.g.guildContrib=0;}});
  set(LS.guilds,get(LS.guilds,[]).filter(x=>x.id!==id)); set(LS.users,get(LS.users,[])); toast('💥 公會已解散'); vGuildsAdmin();
}