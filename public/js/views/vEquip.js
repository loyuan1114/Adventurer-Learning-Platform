/* vEquip — 裝備管理 */
function vEquip(){
  const u=me(), g=u.g, equip=g.equip||{};
  const slots=['weapon','helmet','armor','boots','gloves','ring','necklace','artifact'];
  const slotNames={weapon:'武器',helmet:'頭盔',armor:'護甲',boots:'靴子',gloves:'手套',ring:'戒指',necklace:'項鍊',artifact:'神器'};
  const slotIcons={weapon:'⚔️',helmet:'🪖',armor:'🛡️',boots:'👢',gloves:'🧤',ring:'💍',necklace:'📿',artifact:'🏺'};

  let h=back()+'<h3 class="vt">⚔️ 裝備欄 <span class="vsub">穿戴・強化・精煉・套裝效果</span></h3>';
  h+='<div class="dollView"><div class="dollAvatar"><div class="dollIcon" style="font-size:60px">'+(u.prof?.avatar?avatarHtml(u,60):'🧑‍🎓')+'</div></div><div class="dollSlots">';
  slots.forEach(s=>{
    const it=equip[s];
    h+=`<div class="slotRow" onclick="equipSlotAct('${s}')"><div class="slotIcon">${slotIcons[s]}</div><div class="slotLabel">${slotNames[s]}</div>`;
    if(it){
      const rc={N:'rarN',R:'rarR',SR:'rarSR',SSR:'rarSSR',UR:'rarUR',INF:'equipINF'}[it.rarity||'N']||'rarN';
      h+=`<div class="slotItem ${rc}"><b>${esc(it.name)}</b> <span class="${rc}">${rarityLabel(it.rarity)}</span> Lv.${it.lv||0}</div>`;
      h+=`<div class="slotBtns"><button class="btn mini ghost" onclick="event.stopPropagation();equipUnequip('${s}')">卸下</button></div>`;
    }else h+=`<div class="slotEmpty">空閒</div><div class="slotBtns"><button class="btn mini" onclick="event.stopPropagation();equipFromBag('${s}')">穿戴</button></div>`;
    h+='</div>';
  });
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:14px"><b>💎 套裝效果</b>';
  const sets={};
  Object.values(equip).forEach(it=>{if(it.set) sets[it.set]=(sets[it.set]||0)+1;});
  if(Object.keys(sets).length){
    h+='<div style="margin-top:8px">'+Object.entries(sets).map(([set,count])=>`<div class="chip" style="background:rgba(242,193,78,.15);border-color:var(--goldD)">${set} (${count}/${setReq(set)}) ${count>=setReq(set)?'✅ 已啟用':''}</div>`).join('')+'</div>';
  }else h+='<div class="empty" style="margin-top:8px">無套裝效果</div>';
  h+='</div>';

  h+='<div class="panel2" style="margin-top:14px"><b>🔧 快速操作</b>';
  h+='<div class="rwRow"><button class="rwChip" onclick="equipAuto()">⚡ 一鍵穿戴最強</button><button class="rwChip" onclick="equipAllUnequip()">📦 全部卸下</button><button class="rwChip" onclick="vForge()">🔨 前往鍛造</button></div></div>';
  $('#view').innerHTML=h;
}
function equipSlotAct(s){
  const u=me(), it=u.g.equip[s];
  if(!it) return equipFromBag(s);
  let h=`<div class="mt">${equipSlotIcon(s)} <b>${esc(it.name)}</b> <span class="${rarityClass(it.rarity)}">${rarityLabel(it.rarity)}</span></div>`;
  h+=`<div class="msub">Lv.${it.lv||0} / ${it.maxLv||u.g.lv*100}</div>`;
  if(it.mainStat) h+=`<div class="skTxt">主屬性：${it.mainStat} +${it.mainVal}</div>`;
  if(it.subStats) h+=`<div class="skTxt">副屬性：${Object.entries(it.subStats).map(([k,v])=>`${k}+${v}`).join('、')}</div>`;
  h+=`<div class="mBtns"><button class="btn" onclick="closeModal();vForge()">🔨 強化/精煉</button><button class="btn danger" onclick="equipUnequip('${s}');closeModal()">卸下</button><button class="btn ghost" onclick="closeModal()">取消</button></div>`;
  openModal(h);
}
function equipFromBag(s){
  const u=me(), bag=u.g.bag?.items||[], equips=bag.filter((it,i)=>it.type==='equip'&&it.slot===s).map((it,i)=>({...it,bagIdx:bag.indexOf(it)}));
  if(!equips.length) return toast('⚠️ 背包無此部位裝備','bad');
  let h=`<div class="mt">選擇裝備：${equipSlotIcon(s)} ${slotNames[s]}</div>`;
  h+=equips.map(e=>`<div class="panel2" style="margin:6px 0;cursor:pointer" onclick="equipConfirm(${e.bagIdx},'${s}');closeModal()"><b>${esc(e.name)}</b> <span class="${rarityClass(e.rarity)}">${rarityLabel(e.rarity)}</span> Lv.${e.lv||0}</div>`).join('');
  openModal(h);
}
function equipConfirm(bagIdx,slot){
  const u=me(), it=u.g.bag.items[bagIdx]; if(!it) return;
  const old=u.g.equip[slot]; u.g.equip[slot]=u.g.bag.items.splice(bagIdx,1)[0]; if(old) u.g.bag.items.push(old);
  set(LS.users,get(LS.users,[])); toast(`✅ 已裝備 ${u.g.equip[slot].name}`); vEquip();
}
function equipUnequip(s){
  const u=me(), it=u.g.equip[s]; if(!it) return;
  u.g.bag=u.g.bag||{items:[],capacity:50};
  if(u.g.bag.items.length>=u.g.bag.capacity) return toast('⚠️ 背包已滿','bad');
  u.g.bag.items.push(u.g.equip[s]); delete u.g.equip[s];
  set(LS.users,get(LS.users,[])); toast('📦 已卸下'); vEquip();
}
function equipAuto(){
  const u=me(), bag=u.g.bag?.items||[], slots=['weapon','helmet','armor','boots','gloves','ring','necklace','artifact'];
  let changed=0;
  slots.forEach(s=>{
    const candidates=bag.filter(it=>it.type==='equip'&&it.slot===s).sort((a,b)=>(b.rarity||'N').localeCompare(a.rarity||'N')||(b.lv||0)-(a.lv||0));
    if(candidates.length){const idx=bag.indexOf(candidates[0]); equipConfirm(idx,s); changed++;}
  });
  toast(changed?`✅ 已自動穿戴 ${changed} 件裝備`:'⚠️ 無可穿戴裝備');
}
function equipAllUnequip(){
  const u=me(), equip=u.g.equip||{};
  let cnt=0;
  Object.keys(equip).forEach(s=>{if(equip[s]){equipUnequip(s);cnt++;}});
  toast(`📦 已卸下 ${cnt} 件裝備`);
}
function setReq(set){const req={novice:2,apprentice:3,expert:4,master:5,legend:6,mythic:8};return req[set]||4}
function equipSlotIcon(s){const i={weapon:'⚔️',helmet:'🪖',armor:'🛡️',boots:'👢',gloves:'🧤',ring:'💍',necklace:'📿',artifact:'🏺'};return i[s]||'📦'}
function slotNames(s){const n={weapon:'武器',helmet:'頭盔',armor:'護甲',boots:'靴子',gloves:'手套',ring:'戒指',necklace:'項鍊',artifact:'神器'};return n[s]||s}