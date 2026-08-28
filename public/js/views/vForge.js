/* vForge — 鍛造/強化系統 */
function vForge(){
  const u=me(), g=u.g;
  let h=back()+'<h3 class="vt">🔨 鍛造工坊 <span class="vsub">強化・精煉・鑲嵌・重鑄・分解</span></h3>';
  h+='<div class="tabRow">';
  ['enhance','refine','socket','reforge','dismantle'].forEach((t,i)=>{
    const label={enhance:'⬆️ 強化',refine:'✨ 精煉',socket:'💎 鑲嵌',reforge:'🔄 重鑄',dismantle:'🗑️ 分解'}[t];
    h+=`<button class="tabB ${i===0?'on':''}" onclick="forgeTab('${t}')">${label}</button>`;
  });
  h+='</div>';
  h+='<div id="forgeArea"></div>';
  $('#view').innerHTML=h;
  forgeTab('enhance');
}
function forgeTab(t){
  window._forgeTab=t;
  document.querySelectorAll('.tabB').forEach(b=>b.classList.toggle('on',b.onclick.toString().includes(t)));
  const area=$('#forgeArea');
  if(t==='enhance') renderForgeEnhance(area);
  else if(t==='refine') renderForgeRefine(area);
  else if(t==='socket') renderForgeSocket(area);
  else if(t==='reforge') renderForgeReforge(area);
  else if(t==='dismantle') renderForgeDismantle(area);
}
function renderForgeEnhance(area){
  const u=me(), equip=u.g.equip||{};
  let h='<div class="panel2" style="margin-bottom:12px"><b>⬆️ 裝備強化</b><div class="skTxt">強化等級上限 = 角色等級 × 100</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-top:8px">';
  Object.entries(equip).forEach(([slot,it])=>{
    if(!it) return;
    const maxLv=u.g.lv*100, curLv=it.lv||0;
    const cost=Math.floor(100*Math.pow(1.5,curLv));
    const rate=Math.max(10,100-curLv*2);
    h+=`<div class="panel2" style="padding:10px;text-align:center"><div class="equipName">${esc(it.name)}</div><div class="chip">Lv.${curLv}/${maxLv}</div><div class="skTxt">${numFmt(cost)} 金幣 ｜ 成功率 ${rate}%</div><button class="btn mini ${curLv>=maxLv?'dis':''}" ${curLv>=maxLv?'disabled':''} onclick="forgeEnhance('${slot}')">強化</button></div>`;
  });
  h+='</div></div>';
  area.innerHTML=h;
}
function renderForgeRefine(area){
  const u=me(), equip=u.g.equip||{};
  let h='<div class="panel2" style="margin-bottom:12px"><b>✨ 屬性精煉</b><div class="skTxt">重新隨機副屬性・需消耗精煉石</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-top:8px">';
  Object.entries(equip).forEach(([slot,it])=>{
    if(!it||!it.subStats) return;
    h+=`<div class="panel2" style="padding:10px"><div class="equipName">${esc(it.name)}</div><div class="skTxt">副屬性：${Object.entries(it.subStats).map(([k,v])=>`${k}+${v}`).join('、')}</div><button class="btn mini" onclick="forgeRefine('${slot}')">精煉 (10石)</button></div>`;
  });
  h+='</div></div>';
  area.innerHTML=h;
}
function renderForgeSocket(area){
  const u=me(), equip=u.g.equip||{}, gems=u.g.gems||0;
  let h='<div class="panel2" style="margin-bottom:12px"><b>💎 寶石鑲嵌</b><div class="chip gem">💎 '+gems+'</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-top:8px">';
  Object.entries(equip).forEach(([slot,it])=>{
    if(!it) return;
    const sockets=it.sockets||0, maxSockets=3;
    h+=`<div class="panel2" style="padding:10px"><div class="equipName">${esc(it.name)}</div><div class="skTxt">孔位：${sockets}/${maxSockets}</div>`;
    if(sockets<maxSockets) h+=`<button class="btn mini" onclick="forgeSocket('${slot}')">鑲嵌 (50寶石)</button>`;
    else h+=`<div class="chip ok">已滿</div>`;
    h+='</div>';
  });
  h+='</div></div>';
  area.innerHTML=h;
}
function renderForgeReforge(area){
  const u=me(), equip=u.g.equip||{};
  let h='<div class="panel2" style="margin-bottom:12px"><b>🔄 重鑄裝備</b><div class="skTxt">保留強化等級・重隨機主副屬性・需重鑄符</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-top:8px">';
  Object.entries(equip).forEach(([slot,it])=>{
    if(!it) return;
    h+=`<div class="panel2" style="padding:10px"><div class="equipName">${esc(it.name)}</div><div class="skTxt">主屬性：${it.mainStat||'-'} +${it.mainVal||0}</div><button class="btn mini danger" onclick="forgeReforge('${slot}')">重鑄 (1符)</button></div>`;
  });
  h+='</div></div>';
  area.innerHTML=h;
}
function renderForgeDismantle(area){
  const u=me(), bag=u.g.bag?.items||[];
  let h='<div class="panel2" style="margin-bottom:12px"><b>🗑️ 裝備分解</b><div class="skTxt">分解獲得強化石・精煉石・材料</div>';
  const equips=bag.filter(it=>it.type==='equip');
  if(!equips.length) h+='<div class="empty" style="margin-top:8px">背包無裝備可分解</div>';
  else{
    h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-top:8px">';
    equips.forEach((it,idx)=>{
      const realIdx=bag.indexOf(it);
      const gain={stones:Math.max(1,(it.lv||0)),refine:Math.max(1,Math.floor((it.lv||0)/10))};
      h+=`<div class="panel2" style="padding:10px"><div class="equipName">${esc(it.name)}</div><div class="skTxt">Lv.${it.lv||0} ｜ 獲得：${gain.stones}強化石 ${gain.refine}精煉石</div><button class="btn mini danger" onclick="forgeDismantle(${realIdx})">分解</button></div>`;
    });
    h+='</div>';
  }
  h+='</div>';
  area.innerHTML=h;
}
function forgeEnhance(slot){
  const u=me(), it=u.g.equip[slot]; if(!it) return;
  const cost=Math.floor(100*Math.pow(1.5,it.lv||0)), rate=Math.max(10,100-(it.lv||0)*2);
  if(u.g.gold<cost) return toast('⚠️ 金幣不足','bad');
  u.g.gold-=cost;
  if(Math.random()*100<rate){it.lv=(it.lv||0)+1; toast(`✅ 強化成功！Lv.${it.lv}`); if(typeof floatTxt==='function') floatTxt(`+${it.lv}`,'good');}else{toast('💥 強化失敗，等級不變'); if(typeof floatTxt==='function') floatTxt('失敗','bad');}
  set(LS.users,get(LS.users,[])); forgeTab('enhance');
}
function forgeRefine(slot){
  const u=me(), it=u.g.equip[slot]; if(!it) return;
  if((u.g.refineStones||0)<10) return toast('⚠️ 精煉石不足','bad');
  u.g.refineStones-=10;
  const attrs=['atk','def','hp','spd','crit','dmgRed','healPow','cdRed'];
  it.subStats={}; attrs.sort(()=>Math.random()-0.5).slice(0,3).forEach(a=>it.subStats[a]=Math.floor(Math.random()*50)+10);
  set(LS.users,get(LS.users,[])); toast('✅ 精煉完成'); forgeTab('refine');
}
function forgeSocket(slot){
  const u=me(), it=u.g.equip[slot]; if(!it) return;
  if(u.g.gems<50) return toast('⚠️ 寶石不足','bad');
  u.g.gems-=50; it.sockets=(it.sockets||0)+1;
  const gems=['紅寶石','藍寶石','綠寶石','黃寶石','紫寶石'];
  it.gems=it.gems||[]; it.gems.push(gems[Math.floor(Math.random()*gems.length)]);
  set(LS.users,get(LS.users,[])); toast('✅ 鑲嵌成功'); forgeTab('socket');
}
function forgeReforge(slot){
  const u=me(), it=u.g.equip[slot]; if(!it) return;
  if((u.g.reforgeTokens||0)<1) return toast('⚠️ 重鑄符不足','bad');
  u.g.reforgeTokens--;
  const mainAttrs=['atk','def','hp','spd','crit'];
  it.mainStat=mainAttrs[Math.floor(Math.random()*mainAttrs.length)];
  it.mainVal=Math.floor(Math.random()*100)+50;
  set(LS.users,get(LS.users,[])); toast('✅ 重鑄完成'); forgeTab('reforge');
}
function forgeDismantle(idx){
  const u=me(), bag=u.g.bag.items; if(idx<0||idx>=bag.length) return;
  const it=bag[idx]; const gain={stones:Math.max(1,(it.lv||0)),refine:Math.max(1,Math.floor((it.lv||0)/10))};
  u.g.enhanceStones=(u.g.enhanceStones||0)+gain.stones; u.g.refineStones=(u.g.refineStones||0)+gain.refine;
  bag.splice(idx,1); set(LS.users,get(LS.users,[])); toast(`✅ 分解獲得 ${gain.stones}強化石 ${gain.refine}精煉石`); forgeTab('dismantle');
}