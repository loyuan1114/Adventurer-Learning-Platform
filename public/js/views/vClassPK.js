/* vClassPK — 班級 PK 賽 */
function vClassPK(){
  const u=me(), g=u.g, cls=get(LS.classes,[]).find(c=>c.id===g.classId);
  if(!cls) return toast('⚠️ 你尚未加入班級','bad');
  const rivals=cls.members.filter(m=>m!==u.id).slice(0,10);
  let h=back()+'<h3 class="vt">⚔️ 班級 PK 賽 <span class="vsub">同班同學切磋・積分排名・榮譽獎勵</span></h3>';
  h+='<div class="panel2" style="margin-bottom:12px"><b>🏆 本班排名</b>';
  const ranked=cls.members.map(id=>{
    const m=get(LS.users,[]).find(x=>x.id===id); return m?{id,name:m.name,lv:m.g?.lv||1,exp:m.g?.exp||0,win:m.g?.pkWin||0}:null;
  }).filter(Boolean).sort((a,b)=>b.exp-a.exp);
  h+='<div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">';
  ranked.slice(0,10).forEach((r,i)=>{
    const me=r.id===u.id;
    h+=`<div class="rankIt ${me?'top0':''}"><span class="rMed">${i+1}</span><div class="rName">${esc(r.name)}${me?' <span class="chip">你</span>':''}</div><div class="rLv">Lv.${r.lv}</div><div class="rXp">${numFmt(r.exp)} EXP</div></div>`;
  });
  h+='</div></div>';

  h+='<div class="panel2" style="margin-bottom:12px"><b>⚔️ 挑戰同學</b>';
  if(!rivals.length) h+='<div class="empty">班級暫無其他同學</div>';
  else{
    h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin-top:8px">';
    rivals.forEach(id=>{
      const m=get(LS.users,[]).find(x=>x.id===id); if(!m) return;
      h+=`<div class="panel2" style="text-align:center;padding:12px"><div style="font-size:28px">${m.prof?.avatar?avatarHtml(m,40):'🧑‍🎓'}</div><b>${esc(m.name)}</b><div class="skTxt">Lv.${m.g?.lv||1} · ${numFmt(m.g?.exp||0)} EXP</div><button class="btn mini" style="margin-top:8px" onclick="classPkChallenge('${id}')">🗡️ 挑戰</button></div>`;
    });
    h+='</div>';
  }
  h+='</div>';

  h+='<div class="panel2"><b>📜 近期對戰紀錄</b>';
  const logs=get('ADV9_CLASSPK_LOG',[]).filter(l=>l.classId===cls.id).slice(-10).reverse();
  if(logs.length) h+='<div style="margin-top:8px">'+logs.map(l=>`<div class="chip">${new Date(l.ts).toLocaleString()} ${esc(l.winner)} 擊敗 ${esc(l.loser)} (${l.mode})</div>`).join('')+'</div>';
  else h+='<div class="empty">暫無對戰紀錄</div>';
  h+='</div>';
  $('#view').innerHTML=h;
}
function classPkChallenge(targetId){
  if(!confirm('確定發起挑戰？')) return;
  toast('⚔️ 挑戰已發送，等待對方接受…');
  setTimeout(()=>{
    const u=me(), target=get(LS.users,[]).find(x=>x.id===targetId);
    if(!target) return toast('⚠️ 找不到對手','bad');
    const win=Math.random()<0.5;
    const log={classId:u.g.classId,winner:win?u.name:target.name,loser:win?target.name:u.name,mode:'班級PK',ts:Date.now()};
    const logs=get('ADV9_CLASSPK_LOG',[]); logs.push(log); set('ADV9_CLASSPK_LOG',logs);
    if(win){u.g.pkWin=(u.g.pkWin||0)+1; u.g.gold+=200; u.g.exp+=100; toast('🏆 挑戰勝利！+200金 +100經驗');}else{toast('💥 挑戰失敗，再接再厲');}
    set(LS.users,get(LS.users,[])); vClassPK();
  },1500);
}