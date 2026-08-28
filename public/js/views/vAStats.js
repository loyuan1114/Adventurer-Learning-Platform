/* vAStats — 管理員統計儀表板 */
function vAStats(){
  if(!(typeof IS_ADMIN==='function'&&IS_ADMIN())) return toast('⚠️ 僅管理員可進入','bad');
  const u=me(), sys=get(LS.settings,{}), users=get(LS.users,[]);
  const totalUsers=users.length;
  const activeUsers=users.filter(x=>x.g&&Date.now()-(x.g.lastLogin||0)<864e5).length;
  const totalGold=users.reduce((a,b)=>a+(b.g?.gold||0),0);
  const totalGems=users.reduce((a,b)=>a+(b.g?.gems||0),0);
  const totalExp=users.reduce((a,b)=>a+(b.g?.exp||0),0);
  const avgLv=users.length?Math.round(users.reduce((a,b)=>a+(b.g?.lv||1),0)/users.length):1;
  const codes=get(LS.codes,[]).length;
  const anns=get(LS.ann,[]).length;
  const guilds=get(LS.guilds,[]).length;
  const hw=get(LS.hw,[]).length;
  const subs=get(LS.sub,[]).length;

  let h=back()+'<h3 class="vt">📊 管理員統計總覽 <span class="vsub">全站數據一覽・即時更新</span></h3>';
  h+='<div class="statGrid">';
  h+=stat('👥 總用戶',totalUsers);
  h+=stat('🟢 今日活躍',activeUsers);
  h+=stat('📈 平均等級',avgLv);
  h+=stat('💰 總金幣',numFmt(totalGold));
  h+=stat('💎 總寶石',numFmt(totalGems));
  h+=stat('⭐ 總經驗',numFmt(totalExp));
  h+=stat('🎫 禮包碼',codes);
  h+=stat('📢 公告數',anns);
  h+=stat('🏰 公會數',guilds);
  h+=stat('📝 作業數',hw);
  h+=stat('📤 繳交數',subs);
  h+=stat('⚙️ 系統設定',Object.keys(sys).length);
  h+='</div>';

  h+='<div class="panel2" style="margin-top:14px"><b style="color:var(--gold2)">📋 詳細用戶列表</b>';
  h+='<div class="tblWrap" style="margin-top:8px"><table><thead><tr><th>用戶</th><th>等級</th><th>職業</th><th>金幣</th><th>寶石</th><th>經驗</th><th>最後登入</th><th>操作</th></tr></thead><tbody>';
  users.slice().sort((a,b)=>(b.g?.exp||0)-(a.g?.exp||0)).forEach(x=>{
    const g=x.g||{};
    const last=g.lastLogin?new Date(g.lastLogin).toLocaleString():'從未';
    h+=`<tr><td>${esc(x.name||x.username)}</td><td>Lv.${g.lv||1}</td><td>${jobName(g.job)}</td><td>${numFmt(g.gold||0)}</td><td>${numFmt(g.gems||0)}</td><td>${numFmt(g.exp||0)}</td><td>${last}</td><td><button class="btn mini ghost" onclick="adminViewUser('${esc(x.id||x.username)}')">查看</button></td></tr>`;
  });
  h+='</tbody></table></div></div>';

  $('#view').innerHTML=h;
}
function stat(label,val){return `<div class="statIt"><span>${label}</span><b>${val}</b></div>`}
function numFmt(n){return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':n}
function jobName(j){const J={war:'戰士',mage:'法師',archer:'弓箭手',assassin:'刺客',tank:'坦克',support:'支援'};return J[j]||'無'}