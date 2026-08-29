/* vRank — 排行榜 */
function vRank(){
  var u=me(); if(!u) return;
  var g=u.g;
  var h=back()+'<h3 class="vt">📈 排行榜 <span class="vsub">全服排名・等級排行・戰力比拼</span></h3>';

  h+='<div class="tabRow">';
  ['level','gold','power','pk','arena','exp'].forEach(function(t,i){
    var labels={level:'⭐ 等級',gold:'💰 金幣',power:'⚡ 戰力',pk:'⚔️ PK',arena:'🏟️ 競技',exp:'📊 經驗'};
    h+='<button class="tabB '+(i===0?'on':'')+'" onclick="rankTab(\''+t+'\')">'+labels[t]+'</button>';
  });
  h+='</div>';

  h+='<div id="rankArea"></div>';
  $('#view').innerHTML=h;
  rankTab('level');
}

function rankTab(tab){
  window._rankTab=tab;
  document.querySelectorAll('.tabB').forEach(function(b){
    b.classList.toggle('on',b.onclick&&b.onclick.toString().indexOf(tab)>=0);
  });

  var users=get(LS.users,[]).filter(function(u){return u.role!=='admin'||u.g});
  var area=document.getElementById('rankArea');
  if(!area) return;

  var metrics={
    level:{fn:function(u){return(u.g||{}).lv||0},label:'等級',format:function(v){return 'Lv.'+v},color:'var(--gold2)'},
    gold:{fn:function(u){return(u.g||{}).gold||0},label:'金幣',format:function(v){return numFmt(v)},color:'#ffd700'},
    power:{fn:function(u){var g=u.g||{};return(g.atk||0)+(g.def||0)+(g.hp||0)+(g.spd||0)+(g.crit||0)},label:'戰力',format:function(v){return numFmt(v)},color:'#ff9800'},
    pk:{fn:function(u){return(u.g||{}).pkWin||0},label:'PK勝場',format:function(v){return v+' 勝'},color:'#e91e63'},
    arena:{fn:function(u){return(u.g||{}).arena?((u.g||{}).arena.best||1):1},label:'競技塔層數',format:function(v){return '第'+v+'層'},color:'#9c27b0'},
    exp:{fn:function(u){return(u.g||{}).exp||0},label:'經驗值',format:function(v){return numFmt(v)},color:'var(--teal)'}
  };

  var m=metrics[tab]||metrics.level;
  users.sort(function(a,b){return m.fn(b)-m.fn(a)});
  var myRank=-1;
  users.forEach(function(usr,i){if(usr.username===u.username) myRank=i+1});

  var h='<div class="panel2" style="margin-top:12px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  h+='<b style="color:'+m.color+';font-size:15px">🏆 '+m.label+'排行榜</b>';
  if(myRank>0) h+='<div class="chip" style="margin-left:8px">你的排名：#'+myRank+'</div>';
  h+='<div class="chip">共 '+users.length+' 人</div>';
  h+='</div>';

  h+='<div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">';
  var medals=['🥇','🥈','🥉'];
  users.slice(0,30).forEach(function(usr,i){
    var val=m.fn(usr);
    var isMe=usr.username===u.username;
    var medal=i<3?medals[i]:(i+1);
    h+='<div class="rankIt '+(isMe?'top0':'')+'" style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:'+(isMe?'rgba(255,215,0,.1)':'rgba(0,0,0,.1)')+';border-radius:8px;border:1px '+(isMe?'solid var(--gold)':'solid transparent')+';cursor:pointer" onclick="rankDetail(\''+usr.username+'\')">';
    h+='<span style="min-width:32px;text-align:center;font-size:'+(i<3?'18px':'13px')+'">'+medal+'</span>';
    h+='<div style="font-size:20px">'+((usr.prof&&usr.prof.avatar)?avatarHtml(usr,28):'🧑‍🎓')+'</div>';
    h+='<div style="flex:1;min-width:0">';
    h+='<b style="font-size:13px;color:'+(isMe?'var(--gold2)':'var(--txt)')+'">'+esc(usr.name||usr.username)+'</b>';
    h+='<div style="font-size:11px;color:var(--mut)">'+((usr.g||{}).lv||1)+' 級・'+titleOf((usr.g||{}).lv||1)+'</div>';
    h+='</div>';
    h+='<div style="text-align:right"><div style="font-size:14px;font-weight:900;color:'+m.color+'">'+m.format(val)+'</div></div>';
    h+='</div>';
  });
  h+='</div></div>';

  if(!users.length) h+='<div class="panel2 empty" style="margin-top:12px">暫無排行資料</div>';

  h+='<div class="panel2" style="margin-top:12px"><b>📊 排行規則</b><div class="skTxt" style="margin-top:6px">';
  h+='排行榜每分鐘自動更新。等級排名依照經驗值排序，金幣排名依持有量，戰力依角色屬性總和（攻+防+血+速+暴擊），PK排名依累計勝場，競技塔依最高通關層數。點擊玩家可查看詳細資料。</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>🏅 等級稱號</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px;margin-top:8px">';
  var titles=[
    {min:1,name:'冒險新手',icon:'🌱'},
    {min:10,name:'初級戰士',icon:'⚔️'},
    {min:20,name:'中級冒險者',icon:'🛡️'},
    {min:30,name:'高級獵人',icon:'🏹'},
    {min:40,name:'精英戰士',icon:'🗡️'},
    {min:50,name:'傳說勇者',icon:'👑'},
    {min:60,name:'神話英雄',icon:'🌟'},
    {min:70,name:'遠古守護者',icon:'🏰'},
    {min:80,name:'永恆之光',icon:'✨'},
    {min:90,name:'至高無上',icon:'💫'},
    {min:100,name:'傳奇冒險者',icon:'🏆'}
  ];
  titles.forEach(function(t){
    var active=g.lv>=t.min;
    h+='<div style="text-align:center;padding:6px;background:rgba(0,0,0,'+(active?'.15':'.05')+');border-radius:6px;opacity:'+(active?'1':'.3')+'">';
    h+='<div style="font-size:16px">'+(active?t.icon:'🔒')+'</div>';
    h+='<div style="font-size:10px;font-weight:700;color:'+(active?'var(--gold2)':'var(--mut)')+'">'+t.name+'</div>';
    h+='<div style="font-size:9px;color:var(--mut)">Lv.'+t.min+'+</div>';
    h+='</div>';
  });
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>📋 我的排名摘要</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:8px">';
  var allUsers=get(LS.users,[]).filter(function(u){return u.role!=='admin'||u.g});
  var myRanks={};
  var rankDefs=[
    {key:'lv',label:'等級',fn:function(u){return(u.g||{}).lv||0}},
    {key:'gold',label:'金幣',fn:function(u){return(u.g||{}).gold||0}},
    {key:'power',label:'戰力',fn:function(u){var g=u.g||{};return(g.atk||0)+(g.def||0)+(g.hp||0)+(g.spd||0)+(g.crit||0)}},
    {key:'pk',label:'PK',fn:function(u){return(u.g||{}).pkWin||0}},
    {key:'exp',label:'經驗',fn:function(u){return(u.g||{}).exp||0}}
  ];
  rankDefs.forEach(function(r){
    var sorted=allUsers.slice().sort(function(a,b){return r.fn(b)-r.fn(a)});
    var rank=sorted.findIndex(function(usr){return usr.username===u.username})+1;
    myRanks[r.key]=rank>0?('#'+rank):'N/A';
  });
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap">';
  Object.keys(myRanks).forEach(function(k){
    h+='<div class="chip">'+rankDefs.find(function(r){return r.key===k}).label+'：'+myRanks[k]+'</div>';
  });
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>🏅 等級稱號</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px;margin-top:8px">';
  var titles=[
    {min:1,name:'冒險新手',icon:'🌱'},
    {min:10,name:'初級戰士',icon:'⚔️'},
    {min:20,name:'中級冒險者',icon:'🛡️'},
    {min:30,name:'高級獵人',icon:'🏹'},
    {min:40,name:'精英戰士',icon:'🗡️'},
    {min:50,name:'傳說勇者',icon:'👑'},
    {min:60,name:'神話英雄',icon:'🌟'},
    {min:70,name:'遠古守護者',icon:'🏰'},
    {min:80,name:'永恒之光',icon:'✨'},
    {min:90,name:'至高無上',icon:'💫'},
    {min:100,name:'傳奇冒險者',icon:'🏆'}
  ];
  titles.forEach(function(t){
    var active=g.lv>=t.min;
    h+='<div style="text-align:center;padding:6px;background:rgba(0,0,0,'+(active?'.15':'.05')+');border-radius:6px;opacity:'+(active?'1':'.3')+'">';
    h+='<div style="font-size:16px">'+(active?t.icon:'🔒')+'</div>';
    h+='<div style="font-size:10px;font-weight:700;color:'+(active?'var(--gold2)':'var(--mut)')+'">'+t.name+'</div>';
    h+='<div style="font-size:9px;color:var(--mut)">Lv.'+t.min+'+</div>';
    h+='</div>';
  });
  h+='</div></div>';

  area.innerHTML=h;
}

function rankDetail(username){
  var users=get(LS.users,[]);
  var usr=users.find(function(u){return u.username===username});
  if(!usr) return toast('⚠️ 找不到使用者','bad');
  var g=usr.g||{};
  var totalPk=g.pkWin||0;
  var pkLoss=g.pkLoss||0;
  var pkTotal=totalPk+pkLoss;
  var power=(g.atk||0)+(g.def||0)+(g.hp||0)+(g.spd||0)+(g.crit||0);

  var h='<div style="padding:10px">';
  h+='<div style="text-align:center;margin-bottom:12px">';
  h+='<div style="font-size:48px">'+((usr.prof&&usr.prof.avatar)?avatarHtml(usr,48):'🧑‍🎓')+'</div>';
  h+='<b style="font-family:var(--serif);color:var(--gold2);font-size:18px;display:block;margin-top:8px">'+esc(usr.name||usr.username)+'</b>';
  h+='<div style="font-size:12px;color:var(--mut)">Lv.'+(g.lv||1)+' '+titleOf(g.lv||1)+(g.rebirth?' ｜ 🔁 轉生×'+g.rebirth:'')+'</div>';
  h+='</div>';

  h+='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">';
  h+='<div class="panel2" style="text-align:center"><div style="font-size:18px;font-weight:900;color:var(--gold2)">'+numFmt(g.exp||0)+'</div><div style="font-size:11px;color:var(--mut)">經驗值</div></div>';
  h+='<div class="panel2" style="text-align:center"><div style="font-size:18px;font-weight:900;color:#ffd700">'+numFmt(g.gold||0)+'</div><div style="font-size:11px;color:var(--mut)">金幣</div></div>';
  h+='<div class="panel2" style="text-align:center"><div style="font-size:18px;font-weight:900;color:#e91e63">'+totalPk+'</div><div style="font-size:11px;color:var(--mut)">PK 勝場 ('+Math.round(pkTotal>0?totalPk/pkTotal*100:0)+'%)</div></div>';
  h+='<div class="panel2" style="text-align:center"><div style="font-size:18px;font-weight:900;color:#9c27b0">第'+((g.arena&&g.arena.best)||1)+'層</div><div style="font-size:11px;color:var(--mut)">競技塔</div></div>';
  h+='<div class="panel2" style="text-align:center"><div style="font-size:18px;font-weight:900;color:#ff9800">'+numFmt(power)+'</div><div style="font-size:11px;color:var(--mut)">戰力</div></div>';
  h+='<div class="panel2" style="text-align:center"><div style="font-size:18px;font-weight:900;color:var(--teal)">'+(g.gems||0)+'</div><div style="font-size:11px;color:var(--mut)">寶石</div></div>';
  h+='</div>';

  h+='<div class="panel2" style="margin-top:10px"><b style="font-size:13px">📦 裝備</b>';
  h+='<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">';
  var equipSlots=['weapon','armor','accessory'];
  equipSlots.forEach(function(slot){
    var it=g.equip&&g.equip[slot];
    h+='<div class="chip">'+(it?esc(it.name):slot)+'</div>';
  });
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:8px"><b style="font-size:13px">📜 活動紀錄</b>';
  var logs=[];
  (g.videoLogs||[]).forEach(function(l){logs.push({icon:'🎬',text:l.title,ts:l.ts,detail:'+'+l.ap+' AP'})});
  (g.pkLogs||[]).forEach(function(l){logs.push({icon:l.win?'🏆':'💥',text:'PK vs '+l.opponent,ts:l.ts,detail:l.win?'勝利':'失敗'})});
  logs.sort(function(a,b){return(b.ts||0)-(a.ts||0)});
  logs=logs.slice(0,5);
  if(logs.length){
    h+='<div style="margin-top:6px">';
    logs.forEach(function(l){
      h+='<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06)">';
      h+='<span style="font-size:14px">'+l.icon+'</span>';
      h+='<span style="flex:1;font-size:11px">'+esc(l.text)+' <span style="color:var(--mut)">'+(l.ts?new Date(l.ts).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'}):'')+'</span></span>';
      h+='<span style="font-size:10px;color:var(--gold2)">'+l.detail+'</span>';
      h+='</div>';
    });
    h+='</div>';
  }else{
    h+='<div style="font-size:11px;color:var(--mut);padding:6px 0">暫無活動紀錄</div>';
  }
  h+='</div>';

  h+='<div class="mBtns"><button class="btn" onclick="closeModal()">關閉</button></div></div>';
  openModal(h);
}

function rankExport(){
  var users=get(LS.users,[]).filter(function(u){return u.role!=='admin'||u.g});
  var csv='排名,使用者,等級,經驗值,金幣,PK勝場\n';
  users.sort(function(a,b){return((b.g||{}).exp||0)-((a.g||{}).exp||0)});
  users.slice(0,100).forEach(function(usr,i){
    var g=usr.g||{};
    csv+=(i+1)+','+(usr.name||usr.username)+','+(g.lv||1)+','+(g.exp||0)+','+(g.gold||0)+','+(g.pkWin||0)+'\n';
  });
  var blob=new Blob([csv],{type:'text/csv'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url; a.download='rank_export_'+new Date().toISOString().slice(0,10)+'.csv';
  a.click(); URL.revokeObjectURL(url);
  toast('📊 排行資料已匯出');
}
window.vRank=vRank;
