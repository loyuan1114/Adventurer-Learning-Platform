/* ════════════════════════════════════════════
   vChatV — 社群互助 Dashboard（Community AP）
   ════════════════════════════════════════════ */
function vChatV(){
  const u=me();
  if(!u){toast('請先登入','bad');return}
  var S={balance:0,helpCount:0,ledger:[]};
  window._vCV=S;

  $('#view').innerHTML=back()+
    '<h3 class="vt">🤝 社群貢獻 <span class="vsub">幫助其他玩家・導師活動・互助紀錄</span></h3>'+
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">'+
      '<div class="panel2" style="flex:1;min-width:130px;text-align:center;padding:18px 14px">'+
        '<div style="font-size:12px;color:var(--mut);margin-bottom:6px">已幫助</div>'+
        '<div id="vCVHelped" style="font-size:28px;font-weight:900;color:var(--teal)">0 人</div>'+
      '</div>'+
      '<div class="panel2" style="flex:1;min-width:130px;text-align:center;padding:18px 14px">'+
        '<div style="font-size:12px;color:var(--mut);margin-bottom:6px">今日上限</div>'+
        '<div id="vCVCap" style="font-size:28px;font-weight:900;color:var(--gold2)">150 AP</div>'+
      '</div>'+
    '</div>'+
    '<div class="panel2" style="margin-bottom:14px">'+
      '<b style="color:var(--teal)">🤝 幫助其他玩家</b>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-top:10px;align-items:end">'+
        '<div><div style="font-size:12px;color:var(--mut);margin-bottom:4px">目標用戶</div>'+
          '<input id="vCVTarget" placeholder="username"></div>'+
        '<div><div style="font-size:12px;color:var(--mut);margin-bottom:4px">說明</div>'+
          '<input id="vCVDetail" placeholder="幫助說明 (選填)"></div>'+
        '<button class="btn teal" onclick="vCVSubmitHelp()" style="margin-top:auto">提交幫助</button>'+
      '</div>'+
    '</div>'+
    '<div class="panel2" style="margin-bottom:14px">'+
      '<b style="color:var(--gold2)">🎓 導師活動</b>'+
      '<div style="display:flex;gap:8px;margin-top:10px;align-items:end">'+
        '<div style="flex:1"><div style="font-size:12px;color:var(--mut);margin-bottom:4px">目標用戶</div>'+
          '<input id="vCVMentor" placeholder="username"></div>'+
        '<button class="btn" onclick="vCVBecomeMentor()" style="margin-top:auto">成為導師</button>'+
      '</div>'+
    '</div>'+
    '<div class="panel2"><b style="color:var(--gold2)">📋 最近幫助紀錄</b>'+
      '<div id="vCVLedger" style="margin-top:10px"><p style="color:var(--mut)">載入中...</p></div>'+
    '</div>';

  _cvFetchData();
}

function _cvFetchData(){
  var S=window._vCV;if(!S)return;
  var u=me();if(u&&u.g){S.helpCount=u.g.communityHelps||0}
  fetch('/rest/v1/ap/balance',{headers:{'x-adv9-token':WTOKEN}})
    .then(function(r){return r.json()}).then(function(d){
      if(d.ok){S.balance=d.balance||0;S.caps=d.caps||{};_cvUpdateStats()}
    }).catch(function(){});
  fetch('/rest/v1/ap/ledger',{headers:{'x-adv9-token':WTOKEN}})
    .then(function(r){return r.json()}).then(function(d){
      if(d.ok){S.ledger=d.ledger||[];_cvUpdateLedger()}
    }).catch(function(){});
}

function _cvUpdateStats(){
  var S=window._vCV;if(!S)return;
  var el;
  el=document.getElementById('vCVHelped');if(el)el.textContent=S.helpCount+' 人';
  el=document.getElementById('vCVCap');if(el)el.textContent=(S.caps.community||150)+' AP';
}

function _cvUpdateLedger(){
  var S=window._vCV;if(!S)return;
  var el=document.getElementById('vCVLedger');if(!el)return;
  var items=S.ledger.filter(function(e){return e.type==='COMMUNITY'}).slice(-10).reverse();
  if(!items.length){el.innerHTML='<p style="color:var(--mut);font-size:13px">尚無幫助紀錄</p>';return}
  el.innerHTML=items.map(function(e){
    var dt=new Date(e.ts);var mm=String(dt.getMonth()+1).padStart(2,'0');
    var dd=String(dt.getDate()).padStart(2,'0');
    var action={help:'幫助',mentor:'導師',answer:'回答'}[e.action]||e.action||'互助';
    var target=e.target_user?' '+esc(e.target_user):'';
    var sign=e.amount>0?'<span style="color:var(--green)">+'+e.amount+' AP</span>':'<span style="color:var(--red)">'+e.amount+' AP</span>';
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px">'+
      '<span><span style="color:var(--mut)">'+mm+'/'+dd+'</span> '+action+target+'</span>'+
      '<span>'+sign+'</span></div>';
  }).join('');
}

async function vCVSubmitHelp(){
  var target=$('#vCVTarget').value.trim();
  var detail=$('#vCVDetail').value.trim();
  if(!target){toast('請輸入目標用戶','bad');return}
  try{
    var r=await fetch('/rest/v1/ap/community',{
      method:'POST',headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
      body:JSON.stringify({action:'help',target_user:target,detail:detail||undefined})
    });
    var d=await r.json();
    if(d.ok){
      toast('✅ 幫助成功！+'+d.ap+' AP');
      var u=me();if(u&&u.g){u.g.apBalance=d.balance||0;saveU(u)}
      fetchApBalance();
      var S=window._vCV;if(S){S.balance=d.balance||0;S.helpCount=(S.helpCount||0)+1}
      $('#vCVTarget').value='';$('#vCVDetail').value='';
      _cvUpdateStats();_cvFetchData();
    }else{toast('❌ '+((d&&d.error)||'提交失敗'),'bad')}
  }catch(e){toast('❌ 網路錯誤','bad')}
}

async function vCVBecomeMentor(){
  var target=$('#vCVMentor').value.trim();
  if(!target){toast('請輸入目標用戶','bad');return}
  try{
    var r=await fetch('/rest/v1/ap/community',{
      method:'POST',headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
      body:JSON.stringify({action:'mentor',target_user:target})
    });
    var d=await r.json();
    if(d.ok){
      toast('✅ 導師活動成功！+'+d.ap+' AP');
      var u=me();if(u&&u.g){u.g.apBalance=d.balance||0;saveU(u)}
      fetchApBalance();
      var S=window._vCV;if(S)S.balance=d.balance||0;
      $('#vCVMentor').value='';_cvUpdateStats();_cvFetchData();
    }else{toast('❌ '+((d&&d.error)||'提交失敗'),'bad')}
  }catch(e){toast('❌ 網路錯誤','bad')}
}
