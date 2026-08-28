/* ════════════════════════════════════════════
   vGames — 遊戲獎勵 Dashboard（Game AP）
   ════════════════════════════════════════════ */
function vGames(){
  var u=me();if(!u){toast('請先登入','bad');return}
  var S={balance:0,gameMins:0,gameAp:0,elo:1500,winRate:0,rank:'—',ledger:[]};
  window._vGM=S;
  if(u.g){S.elo=u.g.elo||1500;S.winRate=u.g.winRate||0;S.rank=u.g.rank||'—';S.gameMins=u.g.gameMinsToday||0;S.gameAp=u.g.gameApToday||0}

  $('#view').innerHTML=back()+
    '<h3 class="vt">🎮 遊戲獎勵 <span class="vsub">小遊戲挑戰・Elo 排位・遊戲 AP</span></h3>'+
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">'+
      '<div class="panel2" style="flex:1;min-width:130px;text-align:center;padding:18px 14px">'+
        '<div style="font-size:12px;color:var(--mut);margin-bottom:6px">今日遊戲</div>'+
        '<div id="vGMMins" style="font-size:28px;font-weight:900;color:var(--teal)">'+S.gameMins+' 分鐘</div>'+
      '</div>'+
      '<div class="panel2" style="flex:1;min-width:130px;text-align:center;padding:18px 14px">'+
        '<div style="font-size:12px;color:var(--mut);margin-bottom:6px">遊戲 AP</div>'+
        '<div id="vGMAp" style="font-size:28px;font-weight:900;color:var(--gold2)">'+S.gameAp+'</div>'+
      '</div>'+
    '</div>'+
    (u.role==='admin'?'<div class="panel2" style="margin-bottom:14px">'+
      '<b style="color:var(--gold2)">📊 遊戲統計</b>'+
      '<div style="display:flex;gap:16px;margin-top:10px;font-size:14px;flex-wrap:wrap">'+
        '<span>Elo: <b style="color:var(--teal)" id="vGMElo">'+S.elo+'</b></span>'+
        '<span>勝率: <b style="color:var(--gold2)" id="vGMWin">'+S.winRate+'%</b></span>'+
        '<span>排名: <b style="color:var(--txt)" id="vGMRank">'+esc(S.rank)+'</b></span>'+
      '</div>'+
    '</div>':'')+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">'+
      '<button class="btn teal mini" onclick="vGMSelectType(\'math\')">🧮 數學小挑戰</button>'+
      '<button class="btn mini" onclick="vGMSelectType(\'logic\')">🧩 邏輯謎題</button>'+
      '<button class="btn ghost mini" onclick="vGMSelectType(\'memory\')">🧠 記憶遊戲</button>'+
    '</div>'+
    '<div class="panel2" style="margin-bottom:14px">'+
      '<b style="color:var(--teal)">⚡ 快速提交遊戲結果</b>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">'+
        '<div><div style="font-size:12px;color:var(--mut);margin-bottom:4px">遊戲類型</div>'+
          '<input id="vGMType" value="math" readonly placeholder="math"></div>'+
        '<div><div style="font-size:12px;color:var(--mut);margin-bottom:4px">Elo 分數</div>'+
          '<input id="vGMEloIn" type="number" placeholder="1500"></div>'+
        '<div><div style="font-size:12px;color:var(--mut);margin-bottom:4px">勝率 (%)</div>'+
          '<input id="vGMWinIn" type="number" min="0" max="100" placeholder="50"></div>'+
        '<div><div style="font-size:12px;color:var(--mut);margin-bottom:4px">排名</div>'+
          '<input id="vGMRankIn" placeholder="Gold III"></div>'+
      '</div>'+
      '<div style="margin-top:8px"><div style="font-size:12px;color:var(--mut);margin-bottom:4px">時間 (秒)</div>'+
        '<input id="vGMTime" type="number" min="1" placeholder="120"></div>'+
      '<button class="btn" onclick="vGMSubmit()" style="margin-top:10px;width:100%">提交</button>'+
    '</div>'+
    '<div class="panel2"><b style="color:var(--gold2)">📊 遊戲歷史</b>'+
      '<div id="vGMLedger" style="margin-top:10px"><p style="color:var(--mut)">載入中...</p></div>'+
    '</div>';

  _vgmFetchData();
}

function vGMSelectType(t){var el=$('#vGMType');if(el)el.value=t}

function _vgmFetchData(){
  var S=window._vGM;if(!S)return;
  fetch('/rest/v1/ap/balance',{headers:{'x-adv9-token':WTOKEN}})
    .then(function(r){return r.json()}).then(function(d){
      if(d.ok){S.balance=d.balance||0;_vgmUpdateStats()}
    }).catch(function(){});
  fetch('/rest/v1/ap/ledger',{headers:{'x-adv9-token':WTOKEN}})
    .then(function(r){return r.json()}).then(function(d){
      if(d.ok){S.ledger=d.ledger||[];_vgmUpdateLedger()}
    }).catch(function(){});
}

function _vgmUpdateStats(){
  var S=window._vGM;if(!S)return;
  var el;
  el=document.getElementById('vGMMins');if(el)el.textContent=S.gameMins+' 分鐘';
  el=document.getElementById('vGMAp');if(el)el.textContent=S.gameAp;
  el=document.getElementById('vGMElo');if(el)el.textContent=S.elo;
  el=document.getElementById('vGMWin');if(el)el.textContent=S.winRate+'%';
  el=document.getElementById('vGMRank');if(el)el.textContent=S.rank;
}

function _vgmUpdateLedger(){
  var S=window._vGM;if(!S)return;
  var el=document.getElementById('vGMLedger');if(!el)return;
  var items=S.ledger.filter(function(e){return e.type==='GAME'||e.type==='MUSIC'}).slice(-10).reverse();
  if(!items.length){el.innerHTML='<p style="color:var(--mut);font-size:13px">尚無遊戲紀錄</p>';return}
  el.innerHTML=items.map(function(e){
    var dt=new Date(e.ts);var mm=String(dt.getMonth()+1).padStart(2,'0');
    var dd=String(dt.getDate()).padStart(2,'0');
    var label=e.title||e.action||'遊戲';
    var eloStr=e.elo?' Elo '+e.elo:'';
    var sign=e.amount>0?'<span style="color:var(--green)">+'+e.amount+' AP</span>':'<span style="color:var(--red)">'+e.amount+' AP</span>';
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px">'+
      '<span><span style="color:var(--mut)">'+mm+'/'+dd+'</span> '+esc(label)+eloStr+'</span>'+
      '<span>'+sign+'</span></div>';
  }).join('');
}

async function vGMSubmit(){
  var type=$('#vGMType').value.trim();
  var elo=parseInt($('#vGMEloIn').value)||0;
  var winRate=parseInt($('#vGMWinIn').value)||0;
  var rank=$('#vGMRankIn').value.trim();
  var timeSec=parseInt($('#vGMTime').value)||0;
  if(!type){toast('請選擇遊戲類型','bad');return}
  if(!elo){toast('請輸入 Elo 分數','bad');return}
  try{
    var r=await fetch('/rest/v1/ap/game',{
      method:'POST',headers:{'x-adv9-token':WTOKEN,'Content-Type':'application/json'},
      body:JSON.stringify({elo:elo,winrate:winRate/100,rank:rank||'—',duration_sec:timeSec})
    });
    var d=await r.json();
    if(d.ok){
      toast('✅ 遊戲提交成功！+'+d.ap+' AP');
      var u=me();if(u&&u.g){
        u.g.apBalance=d.balance||0;
        u.g.elo=elo;u.g.winRate=winRate;u.g.rank=rank||'—';
        u.g.gameMinsToday=(u.g.gameMinsToday||0)+Math.ceil(timeSec/60);
        u.g.gameApToday=(u.g.gameApToday||0)+d.ap;
        saveU(u);
      }
      fetchApBalance();
      var S=window._vGM;
      if(S){S.balance=d.balance||0;S.elo=elo;S.winRate=winRate;S.rank=rank||'—';
        S.gameMins=(S.gameMins||0)+Math.ceil(timeSec/60);
        S.gameAp=(S.gameAp||0)+d.ap}
      $('#vGMEloIn').value='';$('#vGMWinIn').value='';$('#vGMRankIn').value='';$('#vGMTime').value='';
      _vgmUpdateStats();_vgmFetchData();
    }else{toast('❌ '+((d&&d.error)||'提交失敗'),'bad')}
  }catch(e){toast('❌ 網路錯誤','bad')}
}
