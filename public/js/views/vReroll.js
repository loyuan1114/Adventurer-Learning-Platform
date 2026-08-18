/* ════════════════════════════════════════════
   vReroll 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：EQ_BADGE_CSS, vReroll
   ════════════════════════════════════════════ */
const EQ_BADGE_CSS=(r)=>'rerollBadge '+{R:'R',E:'E',A:'A',S:'S',SS:'SS',SSS:'SSS',Z:'Z',ZZ:'ZZ',ZZZ:'ZZZ','∞':'INF'}[r]||'';

function vReroll(){
  const d=rerollGet();const gems=d.gems||0;
  let html=back()+'<h3 class="vt">✦ 重新滾動統計值 <span class="vsub">每人僅一個角色｜寶石滾動七大神級屬性</span></h3>';
  html+='<div class="rerollPanel">';
  /* 左側：屬性列表 */
  html+='<div>';
  REROLL_ATTRS.forEach(a=>{
    const r=d.attr[a.id]||'R';const b=REROLL_BONUS[r]||{flat:2,mult:1};
    const multStr=r==='∞'?'×2.5（乘法）':b.mult>1?'×'+b.mult:'+'+b.flat;
    html+='<div class="rerollAttrRow">'; html+='<input class="rerollPick" type="checkbox" value="'+a.id+'" checked>'; html+='<input class="rerollPick" type="checkbox" value="'+a.id+'" checked>';
    html+='<span class="rerollAttrIcon">'+a.icon+'</span>';
    html+='<span class="rerollAttrName">'+a.name+'<br><span style="font-size:11px;color:var(--mut)">→ '+a.stat+'</span></span>';
    html+='<span class="rerollBadge '+EQ_BADGE_CSS(r)+'">'+r+'</span>';
    html+='<span class="rerollBonus">'+multStr+'</span>';
    html+='<div class="rerollBtns">';
    html+='<button class="btn mini" onclick="rerollOne(\''+a.id+'\')">🔄 單滾(💎1000)</button>';
    if(IS_ADMIN()){html+='<button class="btn mini" style="background:linear-gradient(180deg,#ffd97a,#e0a63a)" onclick="rerollGrant(\''+a.id+'\')">👑 授予∞</button>'}
    html+='</div></div>';
  });
  html+='<div class="panel2" style="margin-top:12px">';
  html+='<button class="btn big" style="width:100%" onclick="rerollAll()">🔄 全部重新滾動（💎500）</button>';
  html+='<div style="display:flex;gap:8px;margin-top:8px;align-items:center">';
  html+='<label style="font-size:12px;color:var(--mut)"><input type="checkbox" '+((d.autoOn||false)?'checked':'')+' onchange="toggleAutoReroll(this.checked)"> 自動滾動</label>';
  html+='<span style="font-size:11px;color:var(--mut)">每輪7000 💎，7屬性各1000</span>';
  html+='</div></div>';
  html+='<div class="panel2 rerollAutoDel" style="margin-top:8px">';
  html+='<label style="font-size:12px;color:var(--mut)">自動刪除門檻（選定階及以下一起刪除）：</label>';
  html+='<select onchange="setAutoDelete(this.value)" style="margin-top:4px">'+
    ['R','E','A','S','SS','SSS','Z','ZZ','ZZZ'].map(r=>'<option value="'+r+'" '+(d.autoDelete===r?'selected':'')+'>'+r+' 及以下</option>').join('')+
    '</select></div>';
  html+='</div>';
  /* 右側：保底進度 + 寶石 */
  html+='<div class="rerollSide">';
  const _ab=activeBuff();
  if(_ab){html+='<div class="panel2" style="border-left:4px solid var(--teal)"><b style="color:var(--teal)">🔥 增益生效中</b><div style="font-size:13px;margin-top:4px;font-weight:700">'+_ab.name+(activeBuff('double_luck')?' <span style="color:var(--teal)">運氣 ×2</span>':'')+'</div><div style="font-size:11px;color:var(--mut)">剩餘 '+Math.max(0,Math.floor((_ab.expireTime-Date.now())/1000))+' 秒</div></div>'}
  html+='<div class="panel2"><b style="font-family:var(--serif);color:var(--gold2)">💎 寶石</b><div style="font-size:28px;font-family:var(--serif);font-weight:900;color:#d9a7ff;margin:8px 0">'+gems+'</div>';
  html+='<div style="font-size:12px;color:var(--mut)">滾動1個統計值 = 1000 💎｜滾動所有 = 500 💎</div>';
  html+='<div style="font-size:12px;color:var(--mut);margin-top:4px">100連抽回饋 +5,000 💎（當前共 '+((d.totalRolls||0))+' 抽）</div></div>';
  /* 保底進度 */
  const p=d.pity||{stage:1,count:0};
  const stageNames={1:'階段1（200抽保Z）',2:'階段2（500抽保ZZ）',3:'階段3（1000抽保ZZZ）'};
  const stageMax={1:200,2:500,3:1000};
  html+='<div class="panel2" style="margin-top:8px"><b style="font-family:var(--serif);color:var(--gold2)">🎯 保底進度</b>';
  html+='<div style="font-size:12px;color:var(--mut);margin-top:6px">'+stageNames[p.stage]+'｜進度 '+p.count+'/'+stageMax[p.stage]+'</div>';
  html+='<div class="bar" style="margin-top:6px"><i style="width:'+(p.count/stageMax[p.stage]*100)+'%;background:linear-gradient(90deg,#a855f7,#64b5f6)"></i></div>';
  html+='<div style="font-size:11px;color:var(--mut);margin-top:4px">自然抽出 Z→跳階段2｜ZZ→跳階段3｜ZZZ/∞→重置</div></div>';
  /* 神稱號 */
  const allInf=REROLL_ATTRS.every(a=>d.attr[a.id]==='∞');
  html+='<div class="panel2" style="margin-top:8px;border-left:4px solid '+CFG.RAR_C['∞']+'"><b style="font-family:var(--serif);color:var(--gold2)">👑 神稱號</b>';
  html+='<div style="font-size:12px;color:var(--mut);margin-top:4px">';
  if(allInf){html+='🎉 恭喜！7個屬性全部 ∞，獲得稱號「<span class="equipINF" style="font-weight:900">神</span>」！'}
  else{const infCount=REROLL_ATTRS.filter(a=>d.attr[a.id]==='∞').length;html+='還需 '+infCount+' 個 ∞ 才能解鎖「神」稱號'}
  html+='</div></div>';
  html+='</div></div>';
  $('#view').innerHTML=html;
}
