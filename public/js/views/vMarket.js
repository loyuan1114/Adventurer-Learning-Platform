/* vMarket — 市場交易 */
function vMarket(){
  var u=me(); if(!u) return;
  var g=u.g;
  var h=back()+'<h3 class="vt">🏪 市場交易 <span class="vsub">買賣道具・裝備交易・稀有物品</span></h3>';

  h+='<div class="rwRow">';
  h+='<button class="rwChip" onclick="marketTab(\'buy\')">🛒 購買</button>';
  h+='<button class="rwChip" onclick="marketTab(\'sell\')">💰 販售</button>';
  h+='<button class="rwChip" onclick="marketTab(\'my\')">📦 我的上架</button>';
  h+='<button class="rwChip" onclick="marketTab(\'history\')">📜 交易紀錄</button>';
  h+='</div>';

  h+='<div id="marketArea"></div>';
  $('#view').innerHTML=h;
  marketTab('buy');
}

function marketTab(tab){
  window._marketTab=tab;
  var area=document.getElementById('marketArea');
  if(!area) return;
  if(tab==='buy') marketRenderBuy(area);
  else if(tab==='sell') marketRenderSell(area);
  else if(tab==='my') marketRenderMy(area);
  else if(tab==='history') marketRenderHistory(area);
}

function marketRenderBuy(area){
  var u=me(); if(!u) return;
  var marketItems=[
    {id:'mi1',name:'生命藥水',icon:'🧪',desc:'恢復 200 HP',price:50,cat:'consumable',stock:99},
    {id:'mi2',name:'魔力藥水',icon:'💧',desc:'恢復 100 MP',price:80,cat:'consumable',stock:99},
    {id:'mi3',name:'強化石',icon:'🔨',desc:'裝備強化材料',price:200,cat:'material',stock:50},
    {id:'mi4',name:'精煉石',icon:'✨',desc:'裝備精煉材料',price:500,cat:'material',stock:30},
    {id:'mi5',name:'副本鑰匙',icon:'🔑',desc:'開啟副本門票',price:300,cat:'consumable',stock:20},
    {id:'mi6',name:'回城卷軸',icon:'📜',desc:'立即返回城鎮',price:100,cat:'consumable',stock:99},
    {id:'mi7',name:'經驗水晶',icon:'💠',desc:'獲得 500 經驗值',price:1000,cat:'consumable',stock:10},
    {id:'mi8',name:'寶石箱',icon:'💎',desc:'隨機獲得 10-50 寶石',price:2000,cat:'consumable',stock:5}
  ];

  var h='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--gold2);font-size:15px">🛒 商店物品</b>';
  h+='<div class="chip" style="margin-left:8px">💰 你的金幣：'+numFmt(u.g.gold||0)+'</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:10px">';

  marketItems.forEach(function(item){
    var canBuy=(u.g.gold||0)>=item.price;
    h+='<div class="panel2" style="text-align:center;padding:12px">';
    h+='<div style="font-size:32px">'+item.icon+'</div>';
    h+='<b style="font-size:13px;font-family:var(--serif);color:var(--gold2);display:block;margin:6px 0">'+esc(item.name)+'</b>';
    h+='<div style="font-size:11px;color:var(--mut);margin-bottom:8px">'+esc(item.desc)+'</div>';
    h+='<div class="chip" style="font-size:12px;color:#ffd700;margin-bottom:8px">💰 '+item.price+'</div>';
    h+='<div style="font-size:11px;color:var(--mut)">庫存：'+item.stock+'</div>';
    h+='<button class="btn '+(canBuy?'':'dis')+' mini" style="margin-top:8px;width:100%" '+(canBuy?'':'disabled')+' onclick="marketBuy(\''+item.id+'\','+item.price+')">購買</button>';
    h+='</div>';
  });
  h+='</div></div>';
  area.innerHTML=h;
}

function marketRenderSell(area){
  var u=me(); if(!u) return;
  var bag=u.g.bag?u.g.bag.items:[];
  var h='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--gold2);font-size:15px">💰 販售物品</b>';
  h+='<div class="skTxt" style="margin-top:4px">選擇背包中的物品上架販售</div>';

  if(bag.length){
    h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-top:10px">';
    bag.forEach(function(item,idx){
      var price=Math.max(1,Math.floor((item.price||10)*0.5));
      h+='<div class="panel2" style="text-align:center;padding:10px">';
      h+='<div style="font-size:24px">'+(item.icon||'📦')+'</div>';
      h+='<b style="font-size:12px;display:block;margin:4px 0">'+esc(item.name)+'</b>';
      h+='<div style="font-size:11px;color:var(--mut)">建議售價：💰 '+price+'</div>';
      h+='<button class="btn mini" style="margin-top:6px;width:100%" onclick="marketSell('+idx+')">上架販售</button>';
      h+='</div>';
    });
    h+='</div>';
  }else{
    h+='<div class="empty" style="margin-top:10px">背包是空的，無法販售</div>';
  }
  h+='</div>';
  area.innerHTML=h;
}

function marketRenderMy(area){
  var u=me(); if(!u) return;
  var listings=get('ADV9_MARKET',[]).filter(function(l){return l.seller===u.username});
  var h='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--gold2);font-size:15px">📦 我的上架物品</b>';
  h+='<div class="chip" style="margin-left:8px">'+listings.length+' 件上架中</div>';

  if(listings.length){
    h+='<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">';
    listings.forEach(function(l){
      h+='<div style="display:flex;align-items:center;gap:8px;padding:8px;background:rgba(0,0,0,.1);border-radius:8px">';
      h+='<span style="font-size:20px">'+(l.icon||'📦')+'</span>';
      h+='<div style="flex:1"><b style="font-size:12px">'+esc(l.name)+'</b><div style="font-size:11px;color:var(--mut)">💰 '+l.price+' 金幣</div></div>';
      h+='<button class="btn mini danger" onclick="marketUnlist(\''+l.id+'\')">下架</button>';
      h+='</div>';
    });
    h+='</div>';
  }else{
    h+='<div class="empty" style="margin-top:10px">暫無上架物品</div>';
  }
  h+='</div>';
  area.innerHTML=h;
}

function marketRenderHistory(area){
  var u=me(); if(!u) return;
  var logs=get('ADV9_MARKET_LOG',[]).filter(function(l){return l.buyer===u.username||l.seller===u.username}).slice(-15).reverse();
  var h='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--gold2);font-size:15px">📜 交易紀錄</b>';

  if(logs.length){
    h+='<div style="margin-top:10px">';
    logs.forEach(function(l){
      var isBuy=l.buyer===u.username;
      h+='<div class="chip">'+new Date(l.ts).toLocaleString()+' '+(isBuy?'購買':'販售')+' '+esc(l.name)+' '+((isBuy?'-':'+')+l.price)+' 💰</div>';
    });
    h+='</div>';
  }else{
    h+='<div class="empty" style="margin-top:10px">暫無交易紀錄</div>';
  }
  h+='</div>';
  area.innerHTML=h;
}

function marketBuy(id,price){
  var u=me(); if(!u) return;
  if((u.g.gold||0)<price) return toast('⚠️ 金幣不足','bad');
  var items={
    mi1:{name:'生命藥水',icon:'🧪',type:'consumable',cat:'consumable',desc:'恢復 200 HP',effect:{hp:200},price:50},
    mi2:{name:'魔力藥水',icon:'💧',type:'consumable',cat:'consumable',desc:'恢復 100 MP',effect:{mp:100},price:80},
    mi3:{name:'強化石',icon:'🔨',type:'material',cat:'material',desc:'裝備強化材料',price:200},
    mi4:{name:'精煉石',icon:'✨',type:'material',cat:'material',desc:'裝備精煉材料',price:500},
    mi5:{name:'副本鑰匙',icon:'🔑',type:'consumable',cat:'consumable',desc:'開啟副本門票',price:300},
    mi6:{name:'回城卷軸',icon:'📜',type:'consumable',cat:'consumable',desc:'立即返回城鎮',price:100},
    mi7:{name:'經驗水晶',icon:'💠',type:'consumable',cat:'consumable',desc:'獲得 500 經驗值',effect:{exp:500},price:1000},
    mi8:{name:'寶石箱',icon:'💎',type:'consumable',cat:'consumable',desc:'隨機獲得 10-50 寶石',price:2000}
  };
  var item=items[id]; if(!item) return;
  u.g.gold-=price;
  if(id==='mi3'){u.g.enhanceStones=(u.g.enhanceStones||0)+1;}
  else if(id==='mi4'){u.g.refineStones=(u.g.refineStones||0)+1;}
  else if(id==='mi5'){u.g.dunKeys=(u.g.dunKeys||0)+1;}
  else if(id==='mi7'){u.g.exp=(u.g.exp||0)+500;}
  else if(id==='mi8'){
    var gems=Math.floor(Math.random()*41)+10;
    u.g.gems=(u.g.gems||0)+gems;
    toast('💎 獲得 '+gems+' 寶石！');
  }else{
    u.g.bag=u.g.bag||{items:[],capacity:50};
    u.g.bag.items.push({name:item.name,icon:item.icon,type:item.type,cat:item.cat,desc:item.desc,effect:item.effect,price:item.price,rarity:'N',count:1});
  }
  set(LS.users,get(LS.users,[]));
  toast('✅ 購買成功！-'+price+' 金幣');
  marketTab('buy');
}

function marketSell(idx){
  var u=me(); if(!u) return;
  var item=u.g.bag?u.g.bag.items[idx]:null;
  if(!item) return toast('⚠️ 找不到物品','bad');
  var price=Math.max(1,Math.floor((item.price||10)*0.5));
  if(!confirm('確定以 '+price+' 金幣上架「'+item.name+'」？')) return;

  var listings=get('ADV9_MARKET',[]);
  listings.push({
    id:'ml_'+Date.now(),name:item.name,icon:item.icon,desc:item.desc,
    price:price,seller:u.username,ts:Date.now()
  });
  set('ADV9_MARKET',listings);

  u.g.bag.items.splice(idx,1);
  set(LS.users,get(LS.users,[]));
  toast('✅ 已上架「'+item.name+'」（💰 '+price+'）');
  marketTab('sell');
}

function marketUnlist(id){
  var u=me(); if(!u) return;
  var listings=get('ADV9_MARKET',[]);
  var idx=listings.findIndex(function(l){return l.id===id&&l.seller===u.username});
  if(idx<0) return toast('⚠️ 找不到上架物品','bad');
  var item=listings[idx];
  listings.splice(idx,1);
  set('ADV9_MARKET',listings);

  u.g.bag=u.g.bag||{items:[],capacity:50};
  u.g.bag.items.push({name:item.name,icon:item.icon,desc:item.desc,price:item.price,rarity:'N',count:1,type:'other',cat:'other'});
  set(LS.users,get(LS.users,[]));
  toast('✅ 已下架「'+item.name+'」');
  marketTab('my');
}
window.vMarket=vMarket;
