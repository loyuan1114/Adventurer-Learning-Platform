/* vDoll — 夥伴/紙娃娃系統 */
function vDoll(){
  const u=me(), g=u.g, dolls=g.dolls||[];
  let h=back()+'<h3 class="vt">🎀 夥伴收集 <span class="vsub">收集・培養・互動・出戰夥伴</span></h3>';
  h+='<div class="rwRow"><button class="rwChip" onclick="dollSummon()">🎲 召喚夥伴</button><button class="rwChip" onclick="dollShop()">🏪 夥伴商店</button><button class="rwChip" onclick="dollAlbum()">📖 圖鑑</button></div>';

  if(!dolls.length){
    h+='<div class="panel2 empty" style="margin-top:16px">尚無夥伴，點擊「召喚夥伴」開始收集！</div>';
  }else{
    h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-top:12px">';
    dolls.forEach((d,i)=>{
      const rarity=d.rarity||'N', rc={N:'rarN',R:'rarR',SR:'rarSR',SSR:'rarSSR',UR:'rarUR',INF:'equipINF'}[rarity]||'rarN';
      const active=g.activeDoll===d.id;
      h+=`<div class="dollCard ${rarity} ${active?'active':''}" onclick="dollSelect(${i})" style="cursor:pointer"><div class="dollAvatar">${d.icon||'🧸'}</div><div class="dollInfo"><h4>${esc(d.name)}</h4><div class="dollMeta"><span class="rarityTag rarity-${rarity}">${rarity}</span><span>Lv.${d.lv||1}</span><span>❤️ ${d.bond||0}</span></div>`;
      if(active) h+='<div style="color:var(--teal);font-size:11px;margin-top:4px">✅ 出戰中</div>';
      h+='</div></div>';
    });
    h+='</div>';
  }

  const activeDoll=dolls.find(d=>d.id===g.activeDoll);
  if(activeDoll){
    h+='<div class="panel2" style="margin-top:14px"><b>🎯 當前出戰：'+esc(activeDoll.name)+'</b>';
    h+='<div class="dollStats" style="margin-top:10px">';
    ['atk','def','hp','spd','crit'].forEach(s=>{
      const v=activeDoll.stats?.[s]||0, max=100;
      h+=`<div class="statBar"><div class="statLbl"><span>${s.toUpperCase()}</span><span>${v}/${max}</span></div><div class="statTrack"><div class="statFill ${s==='atk'?'w':s==='def'?'o':s==='hp'?'r':'a'}" style="width:${Math.min(100,v/max*100)}%"></div></div></div>`;
    });
    h+='</div>';
    h+='<div class="dollInteract" style="margin-top:12px">';
    ['feed','play','train'].forEach(a=>{
      const label={feed:'🍖 喂食',play:'🎮 玩耍',train:'⚔️ 訓練'}[a];
      h+=`<button class="dollIBtn" onclick="dollInteract('${activeDoll.id}','${a}')"><div class="iIcon">${label[0]}</div><div class="iLabel">${label.slice(2)}</div></button>`;
    });
    h+='</div></div>';
  }
  $('#view').innerHTML=h;
}
function dollSummon(){
  const u=me(); if(u.g.gems<50) return toast('⚠️ 需要 50 寶石','bad');
  u.g.gems-=50;
  const pool=[{id:'doll_slime',name:'史萊姆',icon:'🟢',rarity:'N',stats:{atk:10,def:15,hp:50,spd:10,crit:5}},{id:'doll_fairy',name:'小精靈',icon:'🧚',rarity:'R',stats:{atk:25,def:20,hp:40,spd:30,crit:15}},{id:'doll_knight',name:'見習騎士',icon:'🛡️',rarity:'SR',stats:{atk:40,def:45,hp:60,spd:20,crit:10}},{id:'doll_dragon',name:'幼龍',icon:'🐉',rarity:'SSR',stats:{atk:60,def:50,hp:80,spd:35,crit:20}},{id:'doll_goddess',name:'女神',icon:'👼',rarity:'UR',stats:{atk:80,def:70,hp:100,spd:50,crit:30}}];
  const rates=[50,30,15,4,1], r=Math.random()*100; let sum=0, idx=0;
  rates.forEach((rate,i)=>{sum+=rate; if(r<=sum&&idx===0) idx=i;});
  const newDoll={...pool[idx],id:pool[idx].id+'_'+Date.now(),lv:1,exp:0,bond:0,ts:Date.now()};
  u.g.dolls=u.g.dolls||[]; u.g.dolls.push(newDoll);
  set(LS.users,get(LS.users,[])); toast(`✨ 召喚獲得：${newDoll.icon} ${newDoll.name} (${newDoll.rarity})`); vDoll();
}
function dollSelect(idx){
  const u=me(); u.g.activeDoll=u.g.dolls[idx].id; set(LS.users,get(LS.users,[])); toast('✅ 已設為出戰夥伴'); vDoll();
}
function dollInteract(id,act){
  const u=me(), d=u.g.dolls.find(x=>x.id===id); if(!d) return;
  const gains={feed:{exp:10,bond:5},play:{exp:5,bond:10},train:{exp:20,bond:2}};
  d.exp+=gains[act].exp; d.bond+=gains[act].bond;
  if(d.exp>=d.lv*100){d.lv++; d.exp=0; toast(`🎉 ${d.name} 升級到 Lv.${d.lv}!`);}
  set(LS.users,get(LS.users,[])); toast(`✅ 互動完成 +${gains[act].exp}經驗 +${gains[act].bond}好感`); vDoll();
}
function dollShop(){toast('🏪 夥伴商店開發中…')}
function dollAlbum(){toast('📖 圖鑑功能開發中…')}