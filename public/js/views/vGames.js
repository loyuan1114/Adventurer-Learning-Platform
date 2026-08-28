/* vGames — 遊戲管理後台 */
function vGames(){
  if(!(typeof IS_ADMIN==='function'&&IS_ADMIN())) return toast('⚠️ 僅管理員可進入','bad');
  const games=get('ADV9_GAMES',[]);
  let h=back()+'<h3 class="vt">🎮 遊戲管理後台 <span class="vsub">小遊戲配置・獎勵設定・開關控制</span></h3>';
  h+='<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2)">➕ 新增/編輯遊戲</b>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">';
  h+='<input id="gmId" placeholder="遊戲ID (如: snake)">';
  h+='<input id="gmName" placeholder="顯示名稱">';
  h+='</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px">';
  h+='<select id="gmCat"><option value="arcade">🕹️ 街機</option><option value="puzzle">🧩 益智</option><option value="action">⚡ 動作</option><option value="quiz">📝 問答</option><option value="idle">🛌 放置</option></select>';
  h+='<input id="gmIcon" placeholder="圖示 (emoji)">';
  h+='<input id="gmOrder" type="number" placeholder="排序" value="0">';
  h+='</div>';
  h+='<textarea id="gmDesc" placeholder="遊戲描述" style="margin-top:8px;min-height:60px"></textarea>';
  h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px">';
  h+='<input id="gmRewGold" type="number" placeholder="金幣獎勵" value="0">';
  h+='<input id="gmRewExp" type="number" placeholder="經驗獎勵" value="0">';
  h+='<input id="gmRewGem" type="number" placeholder="寶石獎勵" value="0">';
  h+='<input id="gmCooldown" type="number" placeholder="冷卻(秒)" value="60">';
  h+='</div>';
  h+='<label style="display:flex;align-items:center;gap:6px;margin-top:8px;font-size:13px"><input type="checkbox" id="gmEnabled" checked> 啟用遊戲</label>';
  h+='<div class="mBtns" style="margin-top:10px"><button class="btn" onclick="adminSaveGame()">💾 儲存遊戲</button></div></div>';

  h+='<div class="panel2"><b>📋 遊戲列表</b>';
  if(!games.length) h+='<div class="empty">尚無遊戲</div>';
  else{
    h+='<div class="tblWrap" style="margin-top:8px"><table><thead><tr><th>圖示</th><th>名稱</th><th>分類</th><th>狀態</th><th>獎勵</th><th>冷卻</th><th>操作</th></tr></thead><tbody>';
    games.forEach(g=>{
      const status=g.enabled?'<span class="chip ok">✅ 啟用</span>':'<span class="chip">⛔ 停用</span>';
      const rew=[g.rewardGold>0?`💰${g.rewardGold}`:'',g.rewardExp>0?`⭐${g.rewardExp}`:'',g.rewardGem>0?`💎${g.rewardGem}`:''].filter(Boolean).join('、')||'無';
      h+=`<tr><td>${g.icon||'🎮'}</td><td>${esc(g.name)}</td><td>${g.cat}</td><td>${status}</td><td>${rew}</td><td>${g.cooldown||60}s</td><td><button class="btn mini ghost" onclick="adminEditGame('${g.id}')">編輯</button><button class="btn mini ${g.enabled?'danger':'teal'}" onclick="adminToggleGame('${g.id}')">${g.enabled?'停用':'啟用'}</button><button class="btn mini danger" onclick="adminDelGame('${g.id}')">刪除</button></td></tr>`;
    });
    h+='</tbody></table></div>';
  }
  h+='</div>';
  $('#view').innerHTML=h;
}
function adminSaveGame(){
  const id=$('#gmId').value.trim(), name=$('#gmName').value.trim(), cat=$('#gmCat').value, icon=$('#gmIcon').value.trim(), order=+$('#gmOrder').value||0;
  const desc=$('#gmDesc').value.trim(), rewGold=+$('#gmRewGold').value||0, rewExp=+$('#gmRewExp').value||0, rewGem=+$('#gmRewGem').value||0, cd=+$('#gmCooldown').value||60, enabled=$('#gmEnabled').checked;
  if(!id||!name) return toast('⚠️ ID與名稱必填','bad');
  const games=get('ADV9_GAMES',[]), idx=games.findIndex(x=>x.id===id);
  const game={id,name,cat,icon,order,desc,rewardGold:rewGold,rewardExp:rewExp,rewardGem:rewGem,cooldown:cd,enabled};
  if(idx>=0) games[idx]=game; else games.push(game);
  games.sort((a,b)=>a.order-b.order); set('ADV9_GAMES',games); toast('✅ 遊戲已儲存'); vGames();
}
function adminEditGame(id){
  const games=get('ADV9_GAMES',[]), g=games.find(x=>x.id===id); if(!g) return;
  $('#gmId').value=g.id; $('#gmName').value=g.name; $('#gmCat').value=g.cat; $('#gmIcon').value=g.icon||''; $('#gmOrder').value=g.order||0;
  $('#gmDesc').value=g.desc||''; $('#gmRewGold').value=g.rewardGold||0; $('#gmRewExp').value=g.rewardExp||0; $('#gmRewGem').value=g.rewardGem||0; $('#gmCooldown').value=g.cooldown||60; $('#gmEnabled').checked=g.enabled!==false;
}
function adminToggleGame(id){
  const games=get('ADV9_GAMES',[]), g=games.find(x=>x.id===id); if(!g) return;
  g.enabled=!g.enabled; set('ADV9_GAMES',games); toast(g.enabled?'✅ 已啟用':'⛔ 已停用'); vGames();
}
function adminDelGame(id){
  if(!confirm('確定刪除？')) return;
  set('ADV9_GAMES',get('ADV9_GAMES',[]).filter(x=>x.id!==id)); toast('🗑️ 已刪除'); vGames();
}