/* vClassWar — 班級戰爭 */
function vClassWar(){
  const u=me(), g=u.g, cls=get(LS.classes,[]).find(c=>c.id===g.classId);
  if(!cls) return toast('⚠️ 你尚未加入班級','bad');
  const wars=get('ADV9_CLASSWARS',[]);
  const activeWar=wars.find(w=>w.classA===cls.id||w.classB===cls.id) && wars.find(w=>!w.ended);
  let h=back()+'<h3 class="vt">🏰 班級戰爭 <span class="vsub">跨班大戰・佔領據點・贏取榮耀</span></h3>';

  if(activeWar){
    const enemyId=activeWar.classA===cls.id?activeWar.classB:activeWar.classA;
    const enemy=get(LS.classes,[]).find(c=>c.id===enemyId);
    const myScore=activeWar.scores[cls.id]||0, enScore=activeWar.scores[enemyId]||0;
    h+='<div class="panel2" style="margin-bottom:12px;border-left:4px solid var(--gold)"><b style="color:var(--gold2)">⚔️ 進行中：對戰 '+esc(enemy?.name||'未知班級')+'</b>';
    h+=`<div class="pkArena" style="margin-top:10px"><div class="pkSide me"><div class="pkName">${esc(cls.name)} (我方)</div><div class="chip" style="font-size:18px;margin:10px 0">${myScore} 分</div></div><div class="pkSide foe"><div class="pkName">${esc(enemy?.name||'敵方')}</div><div class="chip" style="font-size:18px;margin:10px 0">${enScore} 分</div></div></div>`;
    h+=`<div class="rwRow"><button class="rwChip" onclick="classWarAttack()">🗡️ 進攻</button><button class="rwChip" onclick="classWarDefend()">🛡️ 防守</button><button class="rwChip" onclick="classWarSupport()">⚕️ 支援</button></div>`;
    h+='<div class="skTxt" style="margin-top:8px">剩餘時間：'+msToTime(activeWar.endAt-Date.now())+'</div></div>';
  }else{
    h+='<div class="panel2" style="margin-bottom:12px"><b>📋 可宣戰班級</b>';
    const others=get(LS.classes,[]).filter(c=>c.id!==cls.id);
    if(!others.length) h+='<div class="empty">暫無其他班級</div>';
    else{
      h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-top:8px">';
      others.forEach(c=>{
        h+=`<div class="panel2" style="text-align:center;padding:12px"><b>${esc(c.name)}</b><div class="skTxt">${c.members.length} 人 · 平均 Lv.${Math.round(c.members.reduce((a,m)=>a+(get(LS.users,[]).find(x=>x.id===m)?.g?.lv||1),0)/c.members.length)}</div><button class="btn mini teal" style="margin-top:8px" onclick="classWarDeclare('${c.id}')">⚔️ 宣戰</button></div>`;
      });
      h+='</div>';
    }
    h+='</div>';
  }

  h+='<div class="panel2"><b>📜 戰爭歷史</b>';
  const myWars=wars.filter(w=>w.classA===cls.id||w.classB===cls.id).slice(-10).reverse();
  if(myWars.length) h+='<div style="margin-top:8px">'+myWars.map(w=>`<div class="chip">${new Date(w.startAt).toLocaleDateString()} vs ${esc((w.classA===cls.id?w.classB:w.classA)&&get(LS.classes,[]).find(c=>c.id===(w.classA===cls.id?w.classB:w.classA))?.name||'未知')} ${w.winner===cls.id?'🏆 勝':'💥 敗'} (${w.scores[cls.id]||0}:${w.scores[w.classA===cls.id?w.classB:w.classA]||0})</div>`).join('')+'</div>';
  else h+='<div class="empty">暫無戰爭紀錄</div>';
  h+='</div>';
  $('#view').innerHTML=h;
}
function classWarDeclare(enemyId){
  if(!confirm('確定向此班級宣戰？需消耗 5000 班級基金')) return;
  const u=me(), cls=get(LS.classes,[]).find(c=>c.id===u.g.classId);
  if((cls.fund||0)<5000) return toast('⚠️ 班級基金不足','bad');
  cls.fund-=5000;
  const war={id:'war'+Date.now(),classA:cls.id,classB:enemyId,scores:{[cls.id]:0,[enemyId]:0},startAt:Date.now(),endAt:Date.now()+864e5,ended:false};
  const wars=get('ADV9_CLASSWARS',[]); wars.push(war); set('ADV9_CLASSWARS',wars); set(LS.classes,get(LS.classes,[]));
  toast('⚔️ 宣戰成功！戰爭將在 24 小時後結束'); vClassWar();
}
function classWarAttack(){toast('🗡️ 發動進攻…');setTimeout(()=>{const u=me();u.g.exp+=50;u.g.gold+=100;set(LS.users,get(LS.users,[]));toast('✅ 進攻獲得 +50經驗 +100金');vClassWar()},800)}
function classWarDefend(){toast('🛡️ 佈防中…');setTimeout(()=>{const u=me();u.g.exp+=30;set(LS.users,get(LS.users,[]));toast('✅ 防守獲得 +30經驗');vClassWar()},800)}
function classWarSupport(){toast('⚕️ 支援隊友…');setTimeout(()=>{const u=me();u.g.gold+=50;set(LS.users,get(LS.users,[]));toast('✅ 支援獲得 +50金');vClassWar()},800)}
function msToTime(ms){if(ms<=0)return'已結束';const h=Math.floor(ms/36e5),m=Math.floor(ms%36e5/6e4);return h+'時'+m+'分'}