/* ════════ 公會 PK 系統 ════════ */
const PK_DAILY_KEY='ADV9_PK_DAILY';
function loadPkDaily(){try{return JSON.parse(localStorage.getItem(PK_DAILY_KEY)||'{}')}catch(e){return{}}}
function savePkDaily(d){localStorage.setItem(PK_DAILY_KEY,JSON.stringify(d))}
function pkDailyKey(){return new Date().toDateString()}
function getPkToday(gdId){var d=loadPkDaily();return d[gdId]||{challenges:[],wins:0,losses:0}}
function renderGuildPkTab(gd){
  var u=me();var isLeader=gd.leader===u.id;var isMember=gd.members.includes(u.id);
  var today=pkDailyKey();var pkData=getPkToday(gd.id);
  var pkDaily=sysCfg().pkDaily||5;
  var usedToday=pkData.challenges.filter(function(c){return c.date===today}).length;
  var remaining=Math.max(0,pkDaily-usedToday);
  return '<div class="panel2" style="margin-top:14px;border-left:4px solid #ff6b9d">'+
    '<b style="color:#ff6b9d;font-family:var(--serif)">⚔️ 公會 PK 競技場</b>'+
    '<div style="font-size:12px;color:var(--mut);margin:4px 0">每日挑戰次數：'+usedToday+'/'+pkDaily+'｜剩餘：<b style="color:var(--green)">'+remaining+'次</b></div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">'+
    (remaining>0?'<button class="btn mini" style="background:linear-gradient(180deg,#ff6b9d,#d63384);color:#fff" onclick="openPkChallenge(\''+gd.id+'\')">⚔️ 挑戰公會</button>':'<span style="font-size:12px;color:var(--mut)">今日挑戰已用盡</span>')+
    '<button class="btn ghost mini" onclick="openPkHistory(\''+gd.id+'\')">📜 PK 記錄</button>'+
    (isLeader?'<button class="btn ghost mini" onclick="openPkManage(\''+gd.id+'\')">⚙️ 公會設定</button>':'')+
    '</div>'+
    '<div id="pkArea_'+gd.id+'" style="margin-top:10px"></div>'+
  '</div>';
}
function openPkChallenge(gdId){
  var gd=get(LS.guilds,[]).find(function(g){return g.id===gdId});if(!gd)return;
  var today=pkDailyKey();var pkData=getPkToday(gdId);
  var usedToday=pkData.challenges.filter(function(c){return c.date===today}).length;
  var pkDaily=sysCfg().pkDaily||5;
  if(usedToday>=pkDaily)return toast('今日挑戰次數已用盡','bad');
  var others=get(LS.guilds,[]).filter(function(g){return g.id!==gdId&&g.members.length>0});
  if(!others.length)return toast('暫無其他公會可挑戰','bad');
  var opts=others.map(function(g){return '<option value="'+g.id+'">🛡️ '+esc(g.name)+' (Lv.'+(g.level||1)+')</option>'}).join('');
  openModal('<h3 class="mt">⚔️ 挑戰公會</h3><p class="msub">選擇要挑戰的公會</p>'+
    '<div class="field"><label>目標公會</label><select id="pkTarget">'+opts+'</select></div>'+
    '<div class="field"><label>挑戰理由（選填）</label><input id="pkReason" placeholder="來場公平的對決吧！"></div>'+
    '<div class="btn-row">'+
    '<button class="btn ghost mini" onclick="closeModal()">取消</button>'+
    '<button class="btn primary mini" onclick="sendPkChallenge(\''+gdId+'\')">⚔️ 發起挑戰</button>'+
    '</div>');
}
function sendPkChallenge(fromGdId){
  var u=me();var toId=$('#pkTarget').value;var reason=$('#pkReason').value.trim();
  if(!toId)return toast('請選擇目標公會','bad');
  var frs=get(LS.fr,[]);
  var fromGd=get(LS.guilds,[]).find(function(g){return g.id===fromGdId});
  var toGd=get(LS.guilds,[]).find(function(g){return g.id===toId});
  if(!fromGd||!toGd)return;
  var hasFriend=false;
  frs.forEach(function(f){
    if(f.status!=='accepted')return;
    var aM=fromGd.members.includes(f.a),bM=toGd.members.includes(f.b);
    var bM2=fromGd.members.includes(f.b),aM2=toGd.members.includes(f.a);
    if((aM&&bM2)||(bM&&aM2))hasFriend=true;
  });
  if(!hasFriend&&u.role!=='admin')return toast('⚠️ 兩公會需有好友關係才能挑戰','bad');
  var challenges=get(LS.pkChallenges,[]);
  challenges.push({
    id:'pk'+Date.now(),fromId:fromGdId,toId:toId,reason:reason||'公會對決',
    status:'pending',fromScore:0,toScore:0,
    createdAt:Date.now(),resolvedAt:null
  });
  set(LS.pkChallenges,challenges);closeModal();
  toast('⚔️ 挑戰已發送！等待對方接受','ok');
  vGuild();
}
function openPkHistory(gdId){
  var challenges=get(LS.pkChallenges,[]).filter(function(c){return c.fromId===gdId||c.toId===gdId}).sort(function(a,b){return b.createdAt-a.createdAt});
  var gd=get(LS.guilds,[]).find(function(g){return g.id===gdId});
  var html='<div class="semT">📜 PK 記錄</div>';
  if(challenges.length){
    html+=challenges.slice(0,20).map(function(c){
      var isFrom=c.fromId===gdId;var oppId=isFrom?c.toId:c.fromId;
      var opp=get(LS.guilds,[]).find(function(g){return g.id===oppId});
      var icon=c.status==='pending'?'⏳':c.status==='won'?(isFrom?'🏆':'😢'):c.status==='lost'?(isFrom?'😢':'🏆'):'🤝';
      var resultText=c.status==='pending'?'等待中':c.status==='won'?(isFrom?'勝利':'敗北'):(isFrom?'敗北':'勝利');
      return '<div class="panel2" style="margin-bottom:6px;font-size:13px">'+
        icon+' vs 🛡️'+esc(opp?opp.name:'未知')+' <span style="color:var(--mut)">'+resultText+'</span>'+
        (c.reason?'<br><span style="font-size:11px;color:var(--mut)">'+esc(c.reason)+'</span>':'')+
        '<br><span style="font-size:11px;color:var(--mut)">'+new Date(c.createdAt).toLocaleString('zh-TW')+'</span>'+
        '</div>';
    }).join('');
  } else {
    html+='<p class="empty">暫無 PK 記錄</p>';
  }
  $('#pkArea_'+gdId).innerHTML=html;
}
function openPkManage(gdId){
  var gd=get(LS.guilds,[]).find(function(g){return g.id===gdId});if(!gd)return;
  var challenges=get(LS.pkChallenges,[]).filter(function(c){return(c.fromId===gdId||c.toId===gdId)&&c.status==='pending'});
  var html='<div class="semT">⚙️ 公會 PK 設定</div><div class="panel2" style="margin-bottom:10px"><b>Pending 挑戰</b>';
  if(challenges.length){
    html+=challenges.map(function(c){
      var oppId=c.fromId===gdId?c.toId:c.fromId;
      var opp=get(LS.guilds,[]).find(function(g){return g.id===oppId});
      return '<div style="display:flex;gap:8px;align-items:center;margin-top:6px">'+
        '<span style="flex:1">⚔️ vs 🛡️'+esc(opp?opp.name:'未知')+' <span style="font-size:11px;color:var(--mut)">'+c.reason+'</span></span>'+
        '<button class="btn mini" style="background:var(--green);color:#000" onclick="acceptPk(\''+c.id+'\')">✅ 接受</button>'+
        '<button class="btn danger mini" onclick="rejectPk(\''+c.id+'\')">❌ 拒絕</button>'+
        '</div>';
    }).join('');
  } else {
    html+='<p class="empty">暫無待處理挑戰</p>';
  }
  html+='</div>';
  $('#pkArea_'+gdId).innerHTML=html;
}
function acceptPk(pkId){
  var challenges=get(LS.pkChallenges,[]);
  var c=challenges.find(function(x){return x.id===pkId});if(!c)return;
  c.status='accepted';
  var fromGd=get(LS.guilds,[]).find(function(g){return g.id===c.fromId});
  var toGd=get(LS.guilds,[]).find(function(g){return g.id===c.toId});
  if(fromGd&&toGd){
    var fromPower=(fromGd.level||1)*100+fromGd.members.length*10;
    var toPower=(toGd.level||1)*100+toGd.members.length*10;
    var fromRoll=fromPower*(0.7+Math.random()*0.6);
    var toRoll=toPower*(0.7+Math.random()*0.6);
    if(fromRoll>toRoll){c.status='won';c.fromScore=Math.round(fromRoll);c.toScore=Math.round(toRoll);}
    else{c.status='lost';c.fromScore=Math.round(fromRoll);c.toScore=Math.round(toRoll);}
  }
  c.resolvedAt=Date.now();
  set(LS.pkChallenges,challenges);
  toast(c.status==='won'?'🏆 公會 PK 勝利！':'😢 公會 PK 敗北',c.status==='won'?'ok':'bad');
  vGuild();
}
function rejectPk(pkId){
  var challenges=get(LS.pkChallenges,[]).filter(function(x){return x.id!==pkId});
  set(LS.pkChallenges,challenges);toast('已拒絕挑戰','ok');vGuild();
}
