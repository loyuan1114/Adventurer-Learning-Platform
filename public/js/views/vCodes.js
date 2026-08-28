/* vCodes — 禮包碼兌換 */
function vCodes(){
  const u=me();
  let h=back()+'<h3 class="vt">🎫 禮包碼兌換 <span class="vsub">輸入禮包碼領取獎勵・每個碼僅限一次</span></h3>';
  h+='<div class="panel2" style="margin-bottom:12px">';
  h+='<input id="codeInput" placeholder="請輸入禮包碼 (如: WELCOME2026)" style="margin-bottom:8px">';
  h+='<button class="btn big" onclick="redeemCode()">🎁 兌換獎勵</button>';
  h+='</div>';

  h+='<div class="panel2"><b>📜 兌換紀錄</b>';
  const used=u.g.usedCodes||[];
  if(used.length){
    h+='<div style="margin-top:8px">'+used.map(c=>`<div class="chip">${c.code} ｜ ${new Date(c.ts).toLocaleString()} ｜ ${c.rewards.map(r=>`${r.n}x${r.c}`).join('、')}</div>`).join('')+'</div>';
  }else h+='<div class="empty">尚無兌換紀錄</div>';
  h+='</div>';

  if(typeof IS_ADMIN==='function'&&IS_ADMIN()){
    h+='<div class="panel2" style="margin-top:14px"><b style="color:var(--gold2)">👑 管理員：生成禮包碼</b>';
    h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">';
    h+='<input id="admCode" placeholder="禮包碼">';
    h+='<input id="admCodeGold" type="number" placeholder="金幣" style="width:100px">';
    h+='<input id="admCodeGems" type="number" placeholder="寶石" style="width:100px">';
    h+='<input id="admCodeItem" placeholder="道具ID" style="width:120px">';
    h+='<input id="admCodeItemCnt" type="number" placeholder="數量" value="1" style="width:80px">';
    h+='<input id="admCodeExp" type="number" placeholder="經驗" style="width:100px">';
    h+='<input id="admCodeMax" type="number" placeholder="最大使用次數" value="1" style="width:120px">';
    h+='<button class="btn" onclick="adminGenCode()">生成</button>';
    h+='</div></div>';
  }
  $('#view').innerHTML=h;
}
function redeemCode(){
  const code=$('#codeInput').value.trim().toUpperCase(); if(!code) return toast('⚠️ 請輸入禮包碼','bad');
  const u=me(), codes=get(LS.codes,[]), c=codes.find(x=>x.code===code);
  if(!c) return toast('❌ 禮包碼不存在','bad');
  if(c.used>=c.max) return toast('❌ 兌換次數已用完','bad');
  if(u.g.usedCodes?.includes(code)) return toast('❌ 你已兌換過此碼','bad');
  if(c.expire && Date.now()>c.expire) return toast('❌ 禮包碼已過期','bad');
  if(c.lv && u.g.lv<c.lv) return toast(`❌ 需要 Lv.${c.lv} 以上`,'bad');

  let msg='🎁 獲得：';
  if(c.gold){u.g.gold+=c.gold; msg+=` ${c.gold}金`;}
  if(c.gems){u.g.gems+=c.gems; msg+=` ${c.gems}寶石`;}
  if(c.exp){u.g.exp+=c.exp; msg+=` ${c.exp}經驗`;}
  if(c.item){
    const it={id:c.item,count:c.itemCnt||1};
    u.g.bag=u.g.bag||{items:[],capacity:50};
    u.g.bag.items.push(it); msg+=` ${it.id}x${it.count}`;
  }
  c.used++; u.g.usedCodes=u.g.usedCodes||[]; u.g.usedCodes.push({code,ts:Date.now(),rewards:[]});
  if(c.gold) u.g.usedCodes[u.g.usedCodes.length-1].rewards.push({n:'金幣',c:c.gold});
  if(c.gems) u.g.usedCodes[u.g.usedCodes.length-1].rewards.push({n:'寶石',c:c.gems});
  if(c.exp) u.g.usedCodes[u.g.usedCodes.length-1].rewards.push({n:'經驗',c:c.exp});
  if(c.item) u.g.usedCodes[u.g.usedCodes.length-1].rewards.push({n:c.item,c:c.itemCnt||1});
  set(LS.codes,codes); set(LS.users,get(LS.users,[])); toast(msg); $('#codeInput').value=''; vCodes();
}
function adminGenCode(){
  const code=$('#admCode').value.trim().toUpperCase();
  const gold=+$('#admCodeGold').value||0, gems=+$('#admCodeGems').value||0, exp=+$('#admCodeExp').value||0;
  const item=$('#admCodeItem').value.trim(), itemCnt=+$('#admCodeItemCnt').value||1, max=+$('#admCodeMax').value||1;
  if(!code) return toast('⚠️ 請輸入禮包碼','bad');
  const codes=get(LS.codes,[]);
  if(codes.find(x=>x.code===code)) return toast('❌ 碼已存在','bad');
  codes.unshift({code,gold,gems,exp,item:item||null,itemCnt,max,used:0,created:Date.now(),creator:me().name});
  set(LS.codes,codes); toast('✅ 禮包碼生成成功'); vCodes();
}