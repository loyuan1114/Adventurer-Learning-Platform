/* ════════════════════════════════════════════
   vShopV — 兌換系統 Dashboard（Exchange/Redemption）
   ════════════════════════════════════════════ */
function safeJson(r){
  if(!r.ok){
    if(r.status===401||r.status===403){
      WTOKEN='';
      try{localStorage.removeItem('ADV9_WTOKEN')}catch(e){}
      toast('⚠️ Token 已失效，請重新登入','bad');
      setTimeout(function(){try{if(typeof logout==='function')logout()}catch(e){location.reload()}},800);
      return Promise.resolve({ok:false,reason:'auth_error'});
    }
    return r.text().then(function(t){throw new Error(t||('HTTP '+r.status))});
  }
  return r.json();
}
function vShopV(){
  var u=me();if(!u){toast('請先登入','bad');return}
  var S={balance:0,commendations:0,exchangeCount:0,items:[],ledger:[]};
  window._vSV=S;

  $('#view').innerHTML=back()+
    '<h3 class="vt">🏫 兌換系統 <span class="vsub">AP 兌換・項目管理・紀錄查詢</span></h3>'+
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">'+
      '<div class="panel2" style="flex:1;min-width:130px;text-align:center;padding:18px 14px">'+
        '<div style="font-size:12px;color:var(--mut);margin-bottom:6px">AP 餘額</div>'+
        '<div id="vSVBal" style="font-size:28px;font-weight:900;color:var(--gold2)">0</div>'+
      '</div>'+
      '<div class="panel2" style="flex:1;min-width:130px;text-align:center;padding:18px 14px">'+
        '<div style="font-size:12px;color:var(--mut);margin-bottom:6px">已兌換</div>'+
        '<div id="vSVExCount" style="font-size:28px;font-weight:900;color:var(--teal)">0</div>'+
      '</div>'+
    '</div>'+
    '<div class="panel2" style="margin-bottom:14px">'+
      '<b style="color:var(--gold2)">🎁 可兌換項目</b>'+
      '<div id="vSVItems" style="margin-top:10px"><p style="color:var(--mut)">載入中...</p></div>'+
    '</div>'+
    '<div class="panel2"><b style="color:var(--gold2)">📋 兌換紀錄</b>'+
      '<div id="vSVLedger" style="margin-top:10px"><p style="color:var(--mut)">載入中...</p></div>'+
    '</div>';

  _svFetchData();
}

function _svFetchData(){
  var S=window._vSV;if(!S)return;
  var u=me();if(u&&u.g){S.commendations=u.g.commendations||0}
  fetch('/rest/v1/ap/balance',{headers:{'x-adv9-token':WTOKEN}})
    .then(safeJson).then(function(d){
      if(d.ok){S.balance=d.balance||0;_svUpdateStats()}
    }).catch(function(){});
  fetch('/rest/v1/ap/exchange_items',{headers:{'x-adv9-token':WTOKEN}})
    .then(safeJson).then(function(d){
      if(d.ok){S.items=d.items||[];_svRenderItems()}
    }).catch(function(){
      S.items=[
        {id:'commendation',name:'嘉獎',icon:'🏅',ap_cost:10,description:'10 AP = 1 嘉獎',enabled:true},
        {id:'coupon',name:'兌換券',icon:'🎫',ap_cost:50,description:'50 AP = 1 張',enabled:true},
        {id:'title',name:'特殊稱號',icon:'⭐',ap_cost:100,description:'解鎖特殊稱號',enabled:true}
      ];
      _svRenderItems();
    });
  fetch('/rest/v1/ap/ledger',{headers:{'x-adv9-token':WTOKEN}})
    .then(safeJson).then(function(d){
      if(d.ok){S.ledger=d.ledger||[];_svUpdateLedger()}
    }).catch(function(){});
}

function _svUpdateStats(){
  var S=window._vSV;if(!S)return;
  var el;
  el=document.getElementById('vSVBal');if(el)el.textContent=S.balance;
  var exCount=0;
  S.ledger.forEach(function(e){if(e.type==='COMMENDATION'&&e.amount<0)exCount+=Math.abs(e.amount)});
  el=document.getElementById('vSVExCount');if(el)el.textContent=exCount;
}

function _svRenderItems(){
  var S=window._vSV;if(!S)return;
  var el=document.getElementById('vSVItems');if(!el)return;
  if(!S.items.length){el.innerHTML='<p style="color:var(--mut);font-size:13px">暫無可兌換項目</p>';return}
  el.innerHTML=S.items.map(function(it){
    var canAfford=S.balance>=it.ap_cost;
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)">'+
      '<span style="font-size:14px">'+esc(it.icon)+' '+esc(it.name)+'<span style="color:var(--mut);font-size:12px;margin-left:6px">'+esc(it.description)+'</span></span>'+
      '<div style="display:flex;align-items:center;gap:8px">'+
        '<span style="font-size:13px;color:var(--gold2)">'+it.ap_cost+' AP</span>'+
        '<button class="btn sv-exchange-btn" data-id="'+esc(it.id)+'"'+(canAfford?'':' disabled style="opacity:0.5;cursor:not-allowed"')+'>兌換</button>'+
      '</div></div>';
  }).join('');
  el.querySelectorAll('.sv-exchange-btn').forEach(function(btn){
    btn.onclick=function(){_svExchange(this.getAttribute('data-id'))};
  });
}

function _svUpdateLedger(){
  var S=window._vSV;if(!S)return;
  var el=document.getElementById('vSVLedger');if(!el)return;
  var items=S.ledger.filter(function(e){return e.type==='COMMENDATION'}).slice(-15).reverse();
  if(!items.length){el.innerHTML='<p style="color:var(--mut);font-size:13px">尚無兌換紀錄</p>';return}
  el.innerHTML=items.map(function(e){
    var dt=new Date(e.ts);var mm=String(dt.getMonth()+1).padStart(2,'0');
    var dd=String(dt.getDate()).padStart(2,'0');
    var itemName=e.item_name||'嘉獎';
    var qty=e.quantity||1;
    var sign=e.amount>0?'<span style="color:var(--green)">+'+e.amount+' AP</span>':'<span style="color:var(--red)">'+e.amount+' AP</span>';
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px">'+
      '<span><span style="color:var(--mut)">'+mm+'/'+dd+'</span> '+esc(itemName)+' ×'+qty+'</span>'+
      '<span>'+sign+'</span></div>';
  }).join('');
}

async function _svExchange(itemId){
  var S=window._vSV;if(!S)return;
  var item=null;
  for(var i=0;i<S.items.length;i++){if(S.items[i].id===itemId){item=S.items[i];break}}
  if(!item){toast('找不到項目','bad');return}
  if(S.balance<item.ap_cost){toast('AP 餘額不足','bad');return}
  try{
    var r=await fetch('/rest/v1/ap/commendation',{
      method:'POST',headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
      body:JSON.stringify({item_id:itemId,quantity:1})
    });
    var d=await safeJson(r);
    if(d.ok){
      var qtyAdded=d.commendations_earned||1;
      toast('✅ 兌換成功！'+esc(d.item_name||item.name)+' ×'+qtyAdded);
      var u=me();if(u&&u.g){
        u.g.apBalance=d.balance||0;
        u.g.commendations=(u.g.commendations||0)+qtyAdded;
        saveU(u);
      }
      fetchApBalance();
      S.balance=d.balance||0;
      S.commendations=(S.commendations||0)+qtyAdded;
      _svUpdateStats();_svFetchData();
    }else{toast('❌ '+((d&&d.error)||'兌換失敗'),'bad')}
  }catch(e){toast('❌ 網路錯誤','bad')}
}
