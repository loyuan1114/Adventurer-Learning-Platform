/* ════════════════════════════════════════════
   vShopV — 嘉獎兌換 Dashboard（Commendation AP）
   ════════════════════════════════════════════ */
function vShopV(){
  var u=me();if(!u){toast('請先登入','bad');return}
  var S={balance:0,commendations:0,ledger:[]};
  window._vSV=S;

  $('#view').innerHTML=back()+
    '<h3 class="vt">🏫 嘉獎系統 <span class="vsub">嘉獎兌換・鼓勵同學・紀錄查詢</span></h3>'+
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">'+
      '<div class="panel2" style="flex:1;min-width:130px;text-align:center;padding:18px 14px">'+
        '<div style="font-size:12px;color:var(--mut);margin-bottom:6px">AP 餘額</div>'+
        '<div id="vSVBal" style="font-size:28px;font-weight:900;color:var(--gold2)">0</div>'+
      '</div>'+
      '<div class="panel2" style="flex:1;min-width:130px;text-align:center;padding:18px 14px">'+
        '<div style="font-size:12px;color:var(--mut);margin-bottom:6px">嘉獎數量</div>'+
        '<div id="vSVComms" style="font-size:28px;font-weight:900;color:var(--teal)">0</div>'+
      '</div>'+
    '</div>'+
    '<div class="panel2" style="margin-bottom:14px;border-left:4px solid var(--gold2)">'+
      '<div style="font-size:14px;color:var(--gold2);font-weight:700">兌換比例：10 AP = 1 嘉獎</div>'+
    '</div>'+
    '<div class="panel2" style="margin-bottom:14px">'+
      '<b style="color:var(--gold2)">🏫 兌換嘉獎</b>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">'+
        '<div><div style="font-size:12px;color:var(--mut);margin-bottom:4px">目標用戶</div>'+
          '<input id="vSVTarget" placeholder="username"></div>'+
        '<div><div style="font-size:12px;color:var(--mut);margin-bottom:4px">AP 金額</div>'+
          '<input id="vSVAmount" type="number" min="1" placeholder="10" oninput="_svPreview()"></div>'+
      '</div>'+
      '<div style="margin-top:8px"><div style="font-size:12px;color:var(--mut);margin-bottom:4px">理由</div>'+
        '<input id="vSVReason" placeholder="兌換理由 (選填)"></div>'+
      '<div id="vSVPreview" style="margin-top:8px;font-size:13px;color:var(--mut)"></div>'+
      '<button class="btn" onclick="vSVSubmit()" style="margin-top:10px;width:100%">兌換嘉獎</button>'+
    '</div>'+
    '<div class="panel2"><b style="color:var(--gold2)">📋 嘉獎紀錄</b>'+
      '<div id="vSVLedger" style="margin-top:10px"><p style="color:var(--mut)">載入中...</p></div>'+
    '</div>';

  _svFetchData();
}

function _svPreview(){
  var amt=parseInt($('#vSVAmount').value)||0;
  var el=document.getElementById('vSVPreview');
  if(el)el.textContent=amt>0?'將兌換 '+Math.floor(amt/10)+' 嘉獎（每 10 AP = 1 嘉獎）':'';
}

function _svFetchData(){
  var S=window._vSV;if(!S)return;
  var u=me();if(u&&u.g){S.commendations=u.g.commendations||0}
  fetch('/rest/v1/ap/balance',{headers:{'x-adv9-token':WTOKEN}})
    .then(function(r){return r.json()}).then(function(d){
      if(d.ok){S.balance=d.balance||0;_svUpdateStats()}
    }).catch(function(){});
  fetch('/rest/v1/ap/ledger',{headers:{'x-adv9-token':WTOKEN}})
    .then(function(r){return r.json()}).then(function(d){
      if(d.ok){S.ledger=d.ledger||[];_svUpdateLedger()}
    }).catch(function(){});
}

function _svUpdateStats(){
  var S=window._vSV;if(!S)return;
  var el;
  el=document.getElementById('vSVBal');if(el)el.textContent=S.balance;
  el=document.getElementById('vSVComms');if(el)el.textContent=S.commendations;
}

function _svUpdateLedger(){
  var S=window._vSV;if(!S)return;
  var el=document.getElementById('vSVLedger');if(!el)return;
  var items=S.ledger.filter(function(e){return e.type==='COMMENDATION'}).slice(-10).reverse();
  if(!items.length){el.innerHTML='<p style="color:var(--mut);font-size:13px">尚無嘉獎紀錄</p>';return}
  el.innerHTML=items.map(function(e){
    var dt=new Date(e.ts);var mm=String(dt.getMonth()+1).padStart(2,'0');
    var dd=String(dt.getDate()).padStart(2,'0');
    var target=e.target_user?' '+esc(e.target_user):'';
    var reason=e.reason?' — '+esc(e.reason):'';
    var sign=e.amount>0?'<span style="color:var(--green)">+'+e.amount+' AP</span>':'<span style="color:var(--red)">'+e.amount+' AP</span>';
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px">'+
      '<span><span style="color:var(--mut)">'+mm+'/'+dd+'</span> 嘉獎'+target+reason+'</span>'+
      '<span>'+sign+'</span></div>';
  }).join('');
}

async function vSVSubmit(){
  var target=$('#vSVTarget').value.trim();
  var amount=parseInt($('#vSVAmount').value)||0;
  var reason=$('#vSVReason').value.trim();
  if(!target){toast('請輸入目標用戶','bad');return}
  if(!amount||amount<10){toast('AP 金額至少 10','bad');return}
  try{
    var r=await fetch('/rest/v1/ap/commendation',{
      method:'POST',headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
      body:JSON.stringify({target_user:target,ap_amount:amount,reason:reason||undefined})
    });
    var d=await r.json();
    if(d.ok){
      var commsAdded=d.commendations_added||0;
      toast('✅ 兌換成功！'+commsAdded+' 嘉獎');
      var u=me();if(u&&u.g){
        u.g.apBalance=d.balance||0;
        u.g.commendations=(u.g.commendations||0)+commsAdded;
        saveU(u);
      }
      fetchApBalance();
      var S=window._vSV;if(S){S.balance=d.balance||0;S.commendations=(S.commendations||0)+commsAdded}
      $('#vSVTarget').value='';$('#vSVAmount').value='';$('#vSVReason').value='';
      var pv=document.getElementById('vSVPreview');if(pv)pv.textContent='';
      _svUpdateStats();_svFetchData();
    }else{toast('❌ '+((d&&d.error)||'兌換失敗'),'bad')}
  }catch(e){toast('❌ 網路錯誤','bad')}
}
