/* vBag — 背包/道具欄 */
function vBag(){
  const u=me(), g=u.g, bag=g.bag||{items:[],capacity:50};
  let h=back()+'<h3 class="vt">🎒 背包 <span class="vsub">容量 '+bag.items.length+'/'+bag.capacity+'・整理・出售・使用</span></h3>';
  h+='<div class="rwRow"><button class="rwChip" onclick="bagSort()">📦 整理背包</button><button class="rwChip" onclick="bagExpand()">📈 擴充容量</button><button class="rwChip" onclick="bagSellJunk()">🗑️ 一鍵出售垃圾</button></div>';

  const cats={equip:'裝備',material:'材料',consumable:'消耗品',quest:'任務',other:'其他'};
  Object.entries(cats).forEach(([cat,label])=>{
    const items=bag.items.filter(i=>i.cat===cat);
    if(!items.length) return;
    h+=`<div class="panel2" style="margin-top:12px"><b style="color:var(--gold2)">${label} (${items.length})</b>`;
    h+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">';
    items.forEach((it,idx)=>{
      const realIdx=bag.items.indexOf(it);
      const rarity=it.rarity||'N';
      const rc={N:'rarN',R:'rarR',SR:'rarSR',SSR:'rarSSR',UR:'rarUR',INF:'equipINF'}[rarity]||'rarN';
      h+=`<div class="equipCard equipCard${rarity}" style="width:160px;flex:none" onclick="bagItemAct(${realIdx})"><div class="equipName">${esc(it.name)}</div><div class="equipSub">${it.icon||'📦'} ${rarityLabel(rarity)}</div>`;
      if(it.count>1) h+=`<div class="chip" style="margin-top:4px;font-size:11px">x${it.count}</div>`;
      if(it.desc) h+=`<div class="skTxt" style="margin-top:4px">${esc(it.desc)}</div>`;
      h+='</div>';
    });
    h+='</div></div>';
  });

  if(!bag.items.length) h+='<div class="panel2 empty">背包是空的 🎒</div>';
  $('#view').innerHTML=h;
}
function bagItemAct(idx){
  const u=me(), it=u.g.bag.items[idx]; if(!it) return;
  let h=`<div class="mt">${it.icon||'📦'} <b>${esc(it.name)}</b> <span class="${rarityClass(it.rarity)}">${rarityLabel(it.rarity)}</span></div>`;
  h+=`<div class="msub">${esc(it.desc||'無描述')}</div>`;
  const actions=[];
  if(it.type==='consumable') actions.push(['使用',`bagUse(${idx})`]);
  if(it.type==='equip') actions.push(['裝備',`bagEquip(${idx})`]);
  actions.push(['出售',`bagSell(${idx})`],['丟棄',`bagDrop(${idx})`],['取消',`closeModal()`]);
  h+='<div class="mBtns">'+actions.map(([t,f])=>`<button class="btn ${t==='丟棄'?'danger':t==='取消'?'ghost':''}" onclick="${f}">${t}</button>`).join('')+'</div>';
  openModal(h);
}
function bagUse(i){const u=me(),it=u.g.bag.items[i];if(!it)return;toast(`使用了 ${it.name}`);if(it.effect)applyItemEffect(u,it);u.g.bag.items.splice(i,1);set(LS.users,get(LS.users,[]));vBag();closeModal()}
function bagEquip(i){const u=me(),it=u.g.bag.items[i];if(!it||!it.slot)return toast('⚠️ 無法裝備','bad');const old=u.g.equip[it.slot];u.g.equip[it.slot]=u.g.bag.items.splice(i,1)[0];if(old)u.g.bag.items.push(old);set(LS.users,get(LS.users,[]));toast(`✅ 已裝備 ${it.name}`);vBag();closeModal()}
function bagSell(i){const u=me(),it=u.g.bag.items[i];if(!it)return;const price=Math.max(1,Math.floor((it.price||10)*0.3));u.g.gold+=price;u.g.bag.items.splice(i,1);set(LS.users,get(LS.users,[]));toast(`💰 出售獲得 ${price} 金幣`);vBag();closeModal()}
function bagDrop(i){const u=me(),it=u.g.bag.items[i];if(!it)return;if(!confirm(`確定丟棄 ${it.name}？`))return;u.g.bag.items.splice(i,1);set(LS.users,get(LS.users,[]));toast('🗑️ 已丟棄');vBag();closeModal()}
function bagSort(){const u=me();u.g.bag.items.sort((a,b)=>(b.rarity||'N').localeCompare(a.rarity||'N')||a.name.localeCompare(b.name));set(LS.users,get(LS.users,[]));toast('✅ 背包已整理');vBag()}
function bagExpand(){const u=me();const cost=u.g.bag.capacity*100;if(u.g.gold<cost)return toast(`⚠️ 需要 ${cost} 金幣`,`bad`);u.g.gold-=cost;u.g.bag.capacity+=10;set(LS.users,get(LS.users,[]));toast(`✅ 背包擴充至 ${u.g.bag.capacity} 格`);vBag()}
function bagSellJunk(){const u=me();let sold=0,gold=0;u.g.bag.items=u.g.bag.items.filter(it=>{if((it.rarity==='N'||it.type==='quest')&&it.price){gold+=Math.max(1,Math.floor(it.price*0.3));sold++;return false}return true});u.g.gold+=gold;set(LS.users,get(LS.users,[]));toast(`🗑️ 出售 ${sold} 件垃圾，獲得 ${gold} 金幣`);vBag()}
function rarityLabel(r){return {N:'普通',R:'稀有',SR:'超稀有',SSR:'傳說',UR:'神話',INF:'∞神階'}[r]||'普通'}
function rarityClass(r){return {N:'rarN',R:'rarR',SR:'rarSR',SSR:'rarSSR',UR:'rarUR',INF:'equipINF'}[r]||'rarN'}
function applyItemEffect(u,it){if(it.effect.hp)u.g.hp=Math.min(u.g.maxHp,u.g.hp+it.effect.hp);if(it.effect.mp)u.g.mp=Math.min(u.g.maxMp,u.g.mp+it.effect.mp);if(it.effect.exp)u.g.exp+=it.effect.exp;if(it.effect.gold)u.g.gold+=it.effect.gold}