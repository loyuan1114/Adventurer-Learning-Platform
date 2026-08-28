/* vGrantAdmin — 贈送管理後台 */
function vGrantAdmin(){
  if(!(typeof IS_ADMIN==='function'&&IS_ADMIN())) return toast('⚠️ 僅管理員可進入','bad');
  const users=get(LS.users,[]);
  let h=back()+'<h3 class="vt">👑 管理員贈送系統 <span class="vsub">給予玩家資源・道具・稱號・夥伴</span></h3>';
  h+='<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2)">🎁 單人贈送</b>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px">';
  h+='<select id="grUser"><option value="">選擇玩家</option>'+users.map(u=>`<option value="${u.id}">${esc(u.name)} (${u.username})</option>`).join('')+'</select>';
  h+='<select id="grType"><option value="gold">💰 金幣</option><option value="gems">💎 寶石</option><option value="exp">⭐ 經驗</option><option value="item">📦 道具</option><option value="equip">⚔️ 裝備</option><option value="doll">🎀 夥伴</option><option value="title">🎖️ 稱號</option><option value="stamina">⚡ 體力</option><option value="points">✨ 自由點</option></select>';
  h+='<input id="grAmount" type="number" placeholder="數量" value="1" min="1">';
  h+='</div>';
  h+='<input id="grItemId" placeholder="道具/裝備/夥伴/稱號 ID (非金幣類必填)" style="margin-top:8px">';
  h+='<input id="grReason" placeholder="發放原因 (必填，留存備查)" style="margin-top:6px">';
  h+='<div class="mBtns" style="margin-top:10px"><button class="btn" onclick="adminGrantSingle()">🎁 發送給單人</button></div></div>';

  h+='<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2)">📢 全服郵件贈送</b>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px">';
  h+='<select id="grAllType"><option value="gold">💰 金幣</option><option value="gems">💎 寶石</option><option value="exp">⭐ 經驗</option><option value="item">📦 道具</option></select>';
  h+='<input id="grAllAmount" type="number" placeholder="數量" value="1" min="1">';
  h+='<input id="grAllItemId" placeholder="道具ID (道具類必填)">';
  h+='</div>';
  h+='<input id="grAllTitle" placeholder="郵件標題" style="margin-top:8px">';
  h+='<textarea id="grAllContent" placeholder="郵件內容" style="margin-top:6px;min-height:60px"></textarea>';
  h+='<div class="mBtns" style="margin-top:10px"><button class="btn teal" onclick="adminGrantAll()">📬 發送全服郵件</button></div></div>';

  h+='<div class="panel2"><b style="color:var(--gold2)">📋 發放記錄</b>';
  const logs=get('ADV9_GRANT_LOG',[]).slice(-20).reverse();
  if(logs.length){
    h+='<div class="tblWrap" style="margin-top:8px"><table><thead><tr><th>時間</th><th>管理員</th><th>目標</th><th>類型</th><th>數量/內容</th><th>原因</th></tr></thead><tbody>';
    logs.forEach(l=>h+=`<tr><td>${new Date(l.ts).toLocaleString()}</td><td>${esc(l.admin)}</td><td>${esc(l.target)}</td><td>${l.type}</td><td>${l.detail}</td><td>${esc(l.reason)}</td></tr>`);
    h+='</tbody></table></div>';
  }else h+='<div class="empty">暫無發放記錄</div>';
  h+='</div>';
  $('#view').innerHTML=h;
}
function adminGrantSingle(){
  const u=me(), targetId=$('#grUser').value, type=$('#grType').value, amount=+$('#grAmount').value||1, itemId=$('#grItemId').value.trim(), reason=$('#grReason').value.trim();
  if(!targetId||!reason) return toast('⚠️ 請選擇玩家並填寫原因','bad');
  const target=get(LS.users,[]).find(x=>x.id===targetId); if(!target) return toast('⚠️ 玩家不存在','bad');
  let detail='';
  switch(type){
    case 'gold': target.g.gold=(target.g.gold||0)+amount; detail=`+${amount}金幣`; break;
    case 'gems': target.g.gems=(target.g.gems||0)+amount; detail=`+${amount}寶石`; break;
    case 'exp': target.g.exp=(target.g.exp||0)+amount; detail=`+${amount}經驗`; break;
    case 'item': if(!itemId) return toast('⚠️ 請填寫道具ID','bad'); target.g.bag=target.g.bag||{items:[],capacity:50}; target.g.bag.items.push({id:itemId,count:amount}); detail=`${itemId}x${amount}`; break;
    case 'equip': if(!itemId) return toast('⚠️ 請填寫裝備ID','bad'); target.g.bag=target.g.bag||{items:[],capacity:50}; target.g.bag.items.push({id:itemId,type:'equip',count:1}); detail=`裝備:${itemId}`; break;
    case 'doll': if(!itemId) return toast('⚠️ 請填寫夥伴ID','bad'); target.g.dolls=target.g.dolls||[]; target.g.dolls.push({id:itemId,name:itemId,lv:1}); detail=`夥伴:${itemId}`; break;
    case 'title': if(!itemId) return toast('⚠️ 請填寫稱號ID','bad'); target.g.titles=target.g.titles||[]; if(!target.g.titles.includes(itemId)) target.g.titles.push(itemId); detail=`稱號:${itemId}`; break;
    case 'stamina': target.g.stamina=Math.min(100,(target.g.stamina||100)+amount); detail=`+${amount}體力`; break;
    case 'points': target.g.freePoints=(target.g.freePoints||0)+amount; detail=`+${amount}自由點`; break;
  }
  const logs=get('ADV9_GRANT_LOG',[]);
  logs.push({admin:u.name,target:target.name,type,detail,reason,ts:Date.now()});
  if(logs.length>100) logs.shift();
  set('ADV9_GRANT_LOG',logs); set(LS.users,get(LS.users,[])); toast(`✅ 已發送給 ${target.name}`); vGrantAdmin();
}
function adminGrantAll(){
  const u=me(), type=$('#grAllType').value, amount=+$('#grAllAmount').value||1, itemId=$('#grAllItemId').value.trim(), title=$('#grAllTitle').value.trim(), content=$('#grAllContent').value.trim();
  if(!title||!content) return toast('⚠️ 標題與內容必填','bad');
  const users=get(LS.users,[]);
  users.forEach(t=>{
    if(t.id===u.id) return;
    switch(type){
      case 'gold': t.g.gold=(t.g.gold||0)+amount; break;
      case 'gems': t.g.gems=(t.g.gems||0)+amount; break;
      case 'exp': t.g.exp=(t.g.exp||0)+amount; break;
      case 'item': if(itemId){t.g.bag=t.g.bag||{items:[],capacity:50}; t.g.bag.items.push({id:itemId,count:amount});} break;
    }
    t.g.mail=t.g.mail||[]; t.g.mail.unshift({id:'mail'+Date.now()+Math.random(),title,content,rewards:{[type]:amount,itemId},read:false,ts:Date.now(),sys:true});
  });
  const logs=get('ADV9_GRANT_LOG',[]);
  logs.push({admin:u.name,target:'全服玩家',type,detail:`${type} x${amount}${itemId?'('+itemId+')':''}`,reason:`全服郵件: ${title}`,ts:Date.now()});
  if(logs.length>100) logs.shift();
  set('ADV9_GRANT_LOG',logs); set(LS.users,users); toast(`✅ 已發送全服郵件給 ${users.length-1} 位玩家`); vGrantAdmin();
}