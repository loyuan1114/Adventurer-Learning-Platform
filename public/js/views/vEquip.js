/* ════════════════════════════════════════════
   vEquip 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 4 個單位：EQ_SLOT, EQ_SLOT_ICON, eqUpgradeCost, vEquip
   ════════════════════════════════════════════ */
const EQ_SLOT=['頭','衣服','褲子','鞋子','武器','戒指','項鍊'];

const EQ_SLOT_ICON=['🪖','👕','👖','👟','⚔️','💍','📿'];

function eqUpgradeCost(lv,rarity){return rarity==='∞'?Math.max(1,Math.ceil(lv/10)):Math.ceil((lv+1)/5)}

function vEquip(){
  const u=me(),g=u.g,d=eqGet();
  const slots=EQ_SLOT.map((s,i)=>{
    const eid=d.equipped[s];const eq=d.owned?.find(x=>x.id===eid);
    const owned=d.owned.filter(x=>x.slot===s);
    return{slot:s,icon:EQ_SLOT_ICON[i],eq,owned,ownedSorted:[...owned].sort((a,b)=>({R:0,E:1,A:2,S:3,SS:4,SSS:5,Z:6,ZZ:7,ZZZ:8,'∞':9}[a.rarity]||0)-({R:0,E:1,A:2,S:3,SS:4,SSS:5,Z:6,ZZ:7,ZZZ:8,'∞':9}[b.rarity]||0))};
  });
  const dollIcon=g.equip?.character?CHARS[g.equip.character]?.icon:'🧑‍🎓';
  let html=back()+'<h3 class="vt">⚔️ 裝備與紙娃娃 <span class="vsub">每人僅一個角色｜7個裝備欄位｜裝備會影響戰鬥屬性</span></h3>';
  html+='<div class="dollView">';
  html+='<div class="panel2 dollAvatar"><div class="dollIcon">'+dollIcon+'</div>';
  html+='<div style="font-size:12px;color:var(--mut);margin-bottom:8px">🧑 '+esc(u.name)+'</div>';
  html+='</div>';
  html+='<div class="dollSlots">';
  slots.forEach(sl=>{
    html+='<div class="slotRow" style="cursor:pointer" onclick="eqPickSlot(\''+sl.slot+'\')">';
    html+='<span class="slotIcon">'+sl.icon+'</span>';
    html+='<span class="slotLabel">'+sl.slot+'</span>';
    if(sl.eq){
      const rc=sl.eq.rarity;
      html+='<span class="slotItem equip'+rc+'">'+esc(sl.eq.name)+' Lv.'+(sl.eq.level||0)+'</span>';
      html+='<div class="slotBtns">';
      html+='<button class="btn ghost mini" onclick="event.stopPropagation();eqShowDetail(\''+sl.eq.id+'\')">👁</button>';
      html+='<button class="btn mini danger" onclick="event.stopPropagation();eqDrop(\''+sl.slot+'\')">卸下</button>';
      html+='</div>';
    }else{html+='<span class="slotEmpty">未裝備（點擊此處裝備）</span>'}
    html+='</div>';
  });
  html+='</div></div>';
  /* 裝備清單 */
  html+='<h4 class="vt" style="margin-top:16px;font-size:16px">🎒 背包裝備（共'+d.owned.length+'件）</h4>';
  html+='<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">';
  EQ_SLOT.forEach((s,i)=>{
    html+='<button class="btn ghost mini" onclick="CUR.equipFilter=\''+s+'\';vEquip()">'+EQ_SLOT_ICON[i]+s+'</button>';
  });
  html+='<button class="btn ghost mini" onclick="CUR.equipFilter=\'all\';vEquip()">全部</button>';
  html+='</div>';
  const filter=CUR.equipFilter||'all';
  const list=filter==='all'?d.owned:d.owned.filter(x=>x.slot===filter);
  if(!list.length)html+='<p class="empty">還没有裝備，去副本打怪吧！</p>';
  else{
    list.sort((a,b)=>({R:0,E:1,A:2,S:3,SS:4,SSS:5,Z:6,ZZ:7,ZZZ:8,'∞':9}[a.rarity]||0)-({R:0,E:1,A:2,S:3,SS:4,SSS:5,Z:6,ZZ:7,ZZZ:8,'∞':9}[b.rarity]||0));
    html+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">';
    list.forEach(eq=>{
      html+=eqCardHtml(eq,d);
    });
    html+='</div>';
  }
  $('#view').innerHTML=html;
}
