/* vGShop — 公會商店 */
function vGShop(){
  const u=me(), g=u.g, guild=g.guildId?get(LS.guilds,[]).find(x=>x.id===g.guildId):null;
  if(!guild) return toast('⚠️ 你尚未加入公會','bad'), vGuild();
  const items=[
    {id:'g_exp',n:'經驗藥水',c:{gp:100},d:'公會經驗 +500',icon:'🧪',limit:10},
    {id:'g_gold',n:'金幣袋',c:{gp:200},d:'金幣 +10,000',icon:'💰',limit:5},
    {id:'g_gem',n:'寶石箱',c:{gp:500},d:'寶石 +50',icon:'💎',limit:3},
    {id:'g_enhance',n:'強化石',c:{gp:300},d:'強化石 x10',icon:'🔨',limit:20},
    {id:'g_refine',n:'精煉石',c:{gp:400},d:'精煉石 x5',icon:'✨',limit:10},
    {id:'g_token',n:'重鑄符',c:{gp:800},d:'重鑄符 x1',icon:'🔄',limit:2},
    {id:'g_key',n:'副本鑰匙',c:{gp:150},d:'副本鑰匙 x1',icon:'🔑',limit:5},
    {id:'g_buff',n:'公會BUFF卷',c:{gp:1000},d:'全員BUFF 1小時',icon:'📜',limit:1},
  ];
  let h=back()+'<h3 class="vt">🏪 公會商店 <span class="vsub">消耗公會貢獻・兌換稀有道具</span></h3>';
  h+='<div class="chip honor">🏆 貢獻：'+(g.guildContrib||0)+'</div> <div class="chip">🏰 公會等級：Lv.'+guild.lv+'</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-top:12px">';
  items.forEach(it=>{
    const bought=(g.guildShopBought?.[it.id]||0);
    const canBuy=bought<it.limit && (g.guildContrib||0)>=it.c.gp;
    h+=`<div class="panel2 ${bought>=it.limit?'impcard':''}" style="position:relative;${bought>=it.limit?'opacity:.6':''}">`;
    if(bought>=it.limit) h+=`<div class="stockTag">售罄</div>`;
    h+=`<div style="font-size:32px;text-align:center">${it.icon}</div><b style="display:block;text-align:center;font-family:var(--serif);color:var(--gold2);margin:6px 0">${it.n}</b>`;
    h+=`<div class="skTxt" style="text-align:center">${it.d}</div>`;
    h+=`<div class="chip honor" style="margin:8px auto;display:block;text-align:center">🏆 ${it.c.gp} 貢獻</div>`;
    h+=`<div class="skTxt" style="text-align:center">限購：${bought}/${it.limit}</div>`;
    h+=`<button class="btn ${canBuy?'':'dis'} big" style="width:100%;margin-top:10px" ${canBuy?'':'disabled'} onclick="gshopBuy('${it.id}')">${bought>=it.limit?'售罄':'兌換'}</button>`;
    h+='</div>';
  });
  h+='</div>';

  h+='<div class="panel2" style="margin-top:14px"><b>📜 兌換紀錄</b>';
  const logs=guild.shopLogs||[];
  if(logs.length) h+='<div style="margin-top:8px">'+logs.slice(-10).reverse().map(l=>`<div class="chip">${new Date(l.ts).toLocaleString()} ${esc(l.buyer)} 兌換 ${l.item} (-${l.cost}貢獻)</div>`).join('')+'</div>';
  else h+='<div class="empty">暫無兌換紀錄</div>';
  h+='</div>';
  $('#view').innerHTML=h;
}
function gshopBuy(id){
  const u=me(), g=u.g, guild=g.guildId?get(LS.guilds,[]).find(x=>x.id===g.guildId):null;
  if(!guild) return toast('⚠️ 你尚未加入公會','bad');
  const items={g_exp:{c:{gp:100},limit:10,reward:{guildExp:500}},g_gold:{c:{gp:200},limit:5,reward:{gold:10000}},g_gem:{c:{gp:500},limit:3,reward:{gems:50}},g_enhance:{c:{gp:300},limit:20,reward:{enhanceStones:10}},g_refine:{c:{gp:400},limit:10,reward:{refineStones:5}},g_token:{c:{gp:800},limit:2,reward:{reforgeTokens:1}},g_key:{c:{gp:150},limit:5,reward:{dunKeys:1}},g_buff:{c:{gp:1000},limit:1,reward:{guildBuff:3600}}};
  const it=items[id]; if(!it) return;
  const bought=(g.guildShopBought?.[id]||0);
  if(bought>=it.limit) return toast('❌ 已達購買上限','bad');
  if((g.guildContrib||0)<it.c.gp) return toast('⚠️ 貢獻不足','bad');
  g.guildContrib-=it.c.gp; g.guildShopBought=g.guildShopBought||{}; g.guildShopBought[id]=bought+1;
  if(it.reward.guildExp) guild.exp=(guild.exp||0)+it.reward.guildExp;
  if(it.reward.gold) g.gold+=it.reward.gold;
  if(it.reward.gems) g.gems+=it.reward.gems;
  if(it.reward.enhanceStones) g.enhanceStones=(g.enhanceStones||0)+it.reward.enhanceStones;
  if(it.reward.refineStones) g.refineStones=(g.refineStones||0)+it.reward.refineStones;
  if(it.reward.reforgeTokens) g.reforgeTokens=(g.reforgeTokens||0)+it.reward.reforgeTokens;
  if(it.reward.dunKeys) g.dunKeys=(g.dunKeys||0)+it.reward.dunKeys;
  if(it.reward.guildBuff){guild.buffEnd=Date.now()+it.reward.guildBuff*1000; toast('✅ 全員 BUFF 已啟用 1 小時');}
  guild.shopLogs=guild.shopLogs||[]; guild.shopLogs.push({buyer:u.name,item:id,cost:it.c.gp,ts:Date.now()});
  set(LS.users,get(LS.users,[])); set(LS.guilds,get(LS.guilds,[])); toast('✅ 兌換成功'); vGShop();
}