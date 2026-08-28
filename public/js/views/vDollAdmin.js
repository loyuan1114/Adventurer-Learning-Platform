/* vDollAdmin — 夥伴管理後台 */
function vDollAdmin(){
  if(!(typeof IS_ADMIN==='function'&&IS_ADMIN())) return toast('⚠️ 僅管理員可進入','bad');
  const dolls=get('ADV9_DOLL_TEMPLATES',[]);
  let h=back()+'<h3 class="vt">🎀 夥伴模板管理 <span class="vsub">設定夥伴基礎數值・稀有度・技能</span></h3>';
  h+='<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2)">➕ 新增夥伴模板</b>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">';
  h+='<input id="daId" placeholder="ID (如: doll_phoenix)">';
  h+='<input id="daName" placeholder="名稱">';
  h+='</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px">';
  h+='<input id="daIcon" placeholder="圖示 (emoji)" style="font-size:18px">';
  h+='<select id="daRarity"><option value="N">N 普通</option><option value="R">R 稀有</option><option value="SR">SR 超稀有</option><option value="SSR">SSR 傳說</option><option value="UR">UR 神話</option><option value="INF">INF ∞神階</option></select>';
  h+='<input id="daDesc" placeholder="描述">';
  h+='</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:8px">';
  ['atk','def','hp','spd','crit'].forEach(s=>h+=`<input id="da${s}" type="number" placeholder="${s.toUpperCase()}" value="0">`);
  h+='</div>';
  h+='<textarea id="daSkill" placeholder="技能描述 (JSON)" style="margin-top:8px;min-height:60px">{"name":"","desc":"","cd":0}</textarea>';
  h+='<div class="mBtns" style="margin-top:10px"><button class="btn" onclick="adminAddDollTemplate()">新增模板</button></div></div>';

  h+='<div class="panel2"><b>📋 模板列表</b>';
  if(!dolls.length) h+='<div class="empty">尚無模板</div>';
  else{
    h+='<div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">';
    dolls.forEach(d=>{
      h+=`<div class="dollAdminCard"><div class="dIcon">${d.icon||'🧸'}</div><div class="dInfo"><div class="dName">${esc(d.name)} <span class="rarityTag rarity-${d.rarity}">${d.rarity}</span></div><div class="dMeta">ID: ${d.id} ｜ ATK:${d.atk} DEF:${d.def} HP:${d.hp} SPD:${d.spd} CRIT:${d.crit}</div></div><div class="dActs"><button class="btn mini ghost" onclick="adminEditDollTemplate('${d.id}')">編輯</button><button class="btn mini danger" onclick="adminDelDollTemplate('${d.id}')">刪除</button></div></div>`;
    });
    h+='</div>';
  }
  h+='</div>';
  $('#view').innerHTML=h;
}
function adminAddDollTemplate(){
  const id=$('#daId').value.trim(), name=$('#daName').value.trim(), icon=$('#daIcon').value.trim(), rarity=$('#daRarity').value, desc=$('#daDesc').value.trim();
  const atk=+$('#daatk').value, def=+$('#dadef').value, hp=+$('#dahp').value, spd=+$('#daspd').value, crit=+$('#dacrit').value;
  let skill; try{skill=JSON.parse($('#daSkill').value)}catch(e){skill={}}
  if(!id||!name) return toast('⚠️ ID與名稱必填','bad');
  const dolls=get('ADV9_DOLL_TEMPLATES',[]);
  if(dolls.find(x=>x.id===id)) return toast('❌ ID已存在','bad');
  dolls.push({id,name,icon,rarity,desc,atk,def,hp,spd,crit,skill,ts:Date.now()});
  set('ADV9_DOLL_TEMPLATES',dolls); toast('✅ 模板新增成功'); vDollAdmin();
}
function adminDelDollTemplate(id){
  if(!confirm('確定刪除？')) return;
  set('ADV9_DOLL_TEMPLATES',get('ADV9_DOLL_TEMPLATES',[]).filter(x=>x.id!==id)); toast('🗑️ 已刪除'); vDollAdmin();
}
function adminEditDollTemplate(id){
  const dolls=get('ADV9_DOLL_TEMPLATES',[]), d=dolls.find(x=>x.id===id); if(!d) return;
  let h=`<div class="mt">編輯模板：${esc(d.name)}</div>`;
  h+=`<input id="edaName" value="${esc(d.name)}" style="margin-top:8px">`;
  h+=`<input id="edaIcon" value="${esc(d.icon)}" placeholder="圖示" style="margin-top:6px">`;
  h+=`<select id="edaRarity" style="margin-top:6px"><option value="N"${d.rarity==='N'?' selected':''}>N</option><option value="R"${d.rarity==='R'?' selected':''}>R</option><option value="SR"${d.rarity==='SR'?' selected':''}>SR</option><option value="SSR"${d.rarity==='SSR'?' selected':''}>SSR</option><option value="UR"${d.rarity==='UR'?' selected':''}>UR</option><option value="INF"${d.rarity==='INF'?' selected':''}>INF</option></select>`;
  h+=`<input id="edaDesc" value="${esc(d.desc)}" placeholder="描述" style="margin-top:6px">`;
  ['atk','def','hp','spd','crit'].forEach(s=>h+=`<input id="eda${s}" type="number" value="${d[s]||0}" placeholder="${s.toUpperCase()}" style="margin-top:6px">`);
  h+=`<textarea id="edaSkill" style="margin-top:6px;min-height:60px">${JSON.stringify(d.skill||{},null,2)}</textarea>`;
  h+=`<div class="mBtns" style="margin-top:10px"><button class="btn" onclick="adminSaveDollTemplate('${id}')">💾 儲存</button><button class="btn ghost" onclick="closeModal()">取消</button></div>`;
  openModal(h);
}
function adminSaveDollTemplate(id){
  const dolls=get('ADV9_DOLL_TEMPLATES',[]), idx=dolls.findIndex(x=>x.id===id); if(idx<0) return;
  dolls[idx].name=$('#edaName').value.trim(); dolls[idx].icon=$('#edaIcon').value.trim(); dolls[idx].rarity=$('#edaRarity').value; dolls[idx].desc=$('#edaDesc').value.trim();
  ['atk','def','hp','spd','crit'].forEach(s=>dolls[idx][s]=+$('#eda'+s).value);
  try{dolls[idx].skill=JSON.parse($('#edaSkill').value)}catch(e){}
  set('ADV9_DOLL_TEMPLATES',dolls); toast('✅ 已儲存'); closeModal(); vDollAdmin();
}