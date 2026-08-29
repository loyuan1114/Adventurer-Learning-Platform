/* vStats — 統計報表 */
function vStats(){
  var u=me(); if(!u) return;
  var g=u.g;
  var h=back()+'<h3 class="vt">📊 統計報表 <span class="vsub">學習數據・成長曲線・成就一覽</span></h3>';

  h+='<div class="tabRow">';
  ['overview','learning','combat','history'].forEach(function(t,i){
    var labels={overview:'📈 總覽',learning:'📚 學習',combat:'⚔️ 戰鬥',history:'📜 歷史'};
    h+='<button class="tabB '+(i===0?'on':'')+'" onclick="statsTab(\''+t+'\')">'+labels[t]+'</button>';
  });
  h+='</div>';
  h+='<div id="statsArea"></div>';
  $('#view').innerHTML=h;
  statsTab('overview');
}

function statsTab(tab){
  window._statsTab=tab;
  document.querySelectorAll('.tabB').forEach(function(b){
    b.classList.toggle('on',b.onclick&&b.onclick.toString().indexOf(tab)>=0);
  });
  var area=document.getElementById('statsArea');
  if(!area) return;
  var u=me(),g=u.g;
  if(tab==='overview') statsRenderOverview(area,u,g);
  else if(tab==='learning') statsRenderLearning(area,u,g);
  else if(tab==='combat') statsRenderCombat(area,u,g);
  else if(tab==='history') statsRenderHistory(area,u,g);
}

function statsRenderOverview(area,u,g){
  var totalExp=g.exp||0;
  var totalGold=g.gold||0;
  var totalGames=(g.gameStats||{}).total||0;
  var winGames=(g.gameStats||{}).wins||0;
  var totalDungeon=(g.dunCleared?Object.keys(g.dunCleared).length:0);
  var totalPk=g.pkWin||0;
  var totalWrong=(g.wrongBook||[]).length;
  var masteredWrong=(g.wrongBook||[]).filter(function(w){return w.mastered}).length;
  var videosWatched=g.videosWatched||0;
  var days=Math.max(1,Math.floor((Date.now()-new Date(u.createdAt||Date.now()).getTime())/86400000));

  var h='<div class="panel2" style="margin-top:12px"><b style="color:var(--gold2);font-size:15px">📈 總覽數據</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:10px">';
  var stats=[
    {icon:'⭐',label:'等級',value:'Lv.'+g.lv,color:'var(--gold2)'},
    {icon:'📊',label:'經驗值',value:numFmt(totalExp),color:'var(--teal)'},
    {icon:'💰',label:'金幣',value:numFmt(totalGold),color:'#ffd700'},
    {icon:'💎',label:'寶石',value:g.gems||0,color:'#2196f3'},
    {icon:'🎮',label:'遊戲場數',value:totalGames,color:'#ff9800'},
    {icon:'🏆',label:'遊戲勝場',value:winGames,color:'#4caf50'},
    {icon:'⚔️',label:'PK 勝場',value:totalPk,color:'#e91e63'},
    {icon:'🏰',label:'副本通關',value:totalDungeon,color:'#9c27b0'}
  ];
  stats.forEach(function(s){
    h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px">';
    h+='<div style="font-size:22px">'+s.icon+'</div>';
    h+='<div style="font-size:20px;font-weight:900;color:'+s.color+';margin:4px 0">'+s.value+'</div>';
    h+='<div style="font-size:11px;color:var(--mut)">'+s.label+'</div>';
    h+='</div>';
  });
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b style="color:var(--teal);font-size:15px">📅 每日平均</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:10px">';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px">';
  h+='<div style="font-size:16px;font-weight:900;color:var(--gold2)">'+Math.round(totalExp/days)+'</div>';
  h+='<div style="font-size:11px;color:var(--mut)">每日平均經驗</div></div>';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px">';
  h+='<div style="font-size:16px;font-weight:900;color:#ffd700">'+Math.round(totalGold/days)+'</div>';
  h+='<div style="font-size:11px;color:var(--mut)">每日平均金幣</div></div>';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px">';
  h+='<div style="font-size:16px;font-weight:900;color:var(--teal)">'+days+'</div>';
  h+='<div style="font-size:11px;color:var(--mut)">遊玩天數</div></div>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b style="color:#e91e63;font-size:15px">🏅 成就系統</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-top:10px">';
  var achievements=[
    {id:'first_login',name:'初次冒險',desc:'首次登入',icon:'🌟',unlocked:true},
    {id:'lv10',name:'初露鋒芒',desc:'達到 Lv.10',icon:'⚔️',unlocked:g.lv>=10},
    {id:'lv30',name:'身經百戰',desc:'達到 Lv.30',icon:'🛡️',unlocked:g.lv>=30},
    {id:'lv50',name:'勇者傳說',desc:'達到 Lv.50',icon:'👑',unlocked:g.lv>=50},
    {id:'first_pk',name:'PK 新手',desc:'完成首次 PK',icon:'🥊',unlocked:totalPk>0},
    {id:'pk10',name:'PK 專家',desc:'累計 10 勝 PK',icon:'🏆',unlocked:totalPk>=10},
    {id:'dungeon1',name:'副本猎人',desc:'首次通關副本',icon:'🏰',unlocked:totalDungeon>0},
    {id:'wrong_master',name:'錯題克星',desc:'掌握 10 道錯題',icon:'📚',unlocked:masteredWrong>=10},
    {id:'video5',name:'好學之人',desc:'觀看 5 部影片',icon:'🎬',unlocked:videosWatched>=5},
    {id:'rich',name:'小富翁',desc:'累計 10000 金幣',icon:'💰',unlocked:totalGold>=10000}
  ];
  achievements.forEach(function(a){
    h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,'+(a.unlocked?'.15':'.05')+');border-radius:8px;opacity:'+(a.unlocked?'1':'.4')+'">';
    h+='<div style="font-size:28px">'+(a.unlocked?a.icon:'🔒')+'</div>';
    h+='<div style="font-size:12px;font-weight:700;margin-top:4px;color:'+(a.unlocked?'var(--gold2)':'var(--mut)')+'">'+a.name+'</div>';
    h+='<div style="font-size:10px;color:var(--mut)">'+a.desc+'</div>';
    h+='</div>';
  });
  h+='</div></div>';
  area.innerHTML=h;
}

function statsRenderLearning(area,u,g){
  var videosWatched=g.videosWatched||0;
  var totalWrong=(g.wrongBook||[]).length;
  var masteredWrong=(g.wrongBook||[]).filter(function(w){return w.mastered}).length;
  var h='<div class="panel2" style="margin-top:12px"><b style="color:#ff9800;font-size:15px">🎯 學習進度</b>';
  h+='<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">';
  var learnStats=[
    {label:'影片學習',done:videosWatched,total:12,icon:'🎬',color:'var(--teal)'},
    {label:'錯題掌握',done:masteredWrong,total:Math.max(1,totalWrong),icon:'❌',color:'#4caf50'},
    {label:'副本探索',done:(g.dunCleared?Object.keys(g.dunCleared).length:0),total:5,icon:'🏰',color:'#9c27b0'},
    {label:'PK 對戰',done:g.pkWin||0,total:Math.max(1,(g.pkWin||0)+5),icon:'⚔️',color:'#e91e63'},
    {label:'故事完成',done:(g.stories&&g.stories.completed)?Object.keys(g.stories.completed).length:0,total:5,icon:'📖',color:'#ff9800'},
    {label:'語言包收集',done:g.langUnlocked?Object.keys(g.langUnlocked).length:0,total:10,icon:'🌍',color:'#2196f3'}
  ];
  learnStats.forEach(function(s){
    var pct=Math.min(100,Math.round(s.done/s.total*100));
    h+='<div style="display:flex;align-items:center;gap:10px">';
    h+='<span style="font-size:18px">'+s.icon+'</span>';
    h+='<div style="flex:1">';
    h+='<div style="display:flex;justify-content:space-between;font-size:12px"><span>'+s.label+'</span><span style="color:var(--mut)">'+s.done+'/'+s.total+'</span></div>';
    h+='<div style="background:rgba(0,0,0,.2);border-radius:6px;height:8px;margin-top:4px;overflow:hidden">';
    h+='<div style="height:100%;width:'+pct+'%;background:'+s.color+';border-radius:6px"></div></div></div>';
    h+='<span style="font-size:12px;font-weight:700;color:'+s.color+'">'+pct+'%</span></div>';
  });
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b style="color:var(--teal);font-size:15px">📋 活動紀錄</b>';
  var recentLogs=[
    {icon:'🎬',text:'影片觀看',count:videosWatched},
    {icon:'📝',text:'錯題收集',count:totalWrong},
    {icon:'✅',text:'錯題掌握',count:masteredWrong}
  ];
  h+='<div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">';
  recentLogs.forEach(function(l){
    h+='<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">';
    h+='<span style="font-size:16px">'+l.icon+'</span>';
    h+='<span style="flex:1;font-size:12px">'+l.text+'</span>';
    h+='<span style="font-size:13px;font-weight:700;color:var(--gold2)">'+l.count+'</span>';
    h+='</div>';
  });
  h+='</div></div>';
  area.innerHTML=h;
}

function statsRenderCombat(area,u,g){
  var totalPk=g.pkWin||0;
  var pkLoss=g.pkLoss||0;
  var totalGames=(g.gameStats||{}).total||0;
  var winGames=(g.gameStats||{}).wins||0;
  var totalDungeon=(g.dunCleared?Object.keys(g.dunCleared).length:0);
  var pkStreak=g.pkStreak||0;
  var pkRating=g.pkRating||1000;
  var gameRate=totalGames>0?Math.round(winGames/totalGames*100):0;
  var pkTotal=totalPk+pkLoss;
  var pkRate=pkTotal>0?Math.round(totalPk/pkTotal*100):0;

  var h='<div class="panel2" style="margin-top:12px"><b style="color:#e91e63;font-size:15px">⚔️ 戰鬥統計</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:10px">';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px;font-weight:900;color:var(--green)">'+totalPk+'</div><div style="font-size:11px;color:var(--mut)">PK 勝場</div></div>';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px;font-weight:900;color:#ff8a80">'+pkLoss+'</div><div style="font-size:11px;color:var(--mut)">PK 敗場</div></div>';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px;font-weight:900;color:var(--gold2)">'+pkRate+'%</div><div style="font-size:11px;color:var(--mut)">PK 勝率</div></div>';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px;font-weight:900;color:#ff9800">'+pkStreak+'</div><div style="font-size:11px;color:var(--mut)">最高連勝</div></div>';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px;font-weight:900;color:#9c27b0">'+pkRating+'</div><div style="font-size:11px;color:var(--mut)">PK 評分</div></div>';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px;font-weight:900;color:var(--teal)">'+totalDungeon+'</div><div style="font-size:11px;color:var(--mut)">副本通關</div></div>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b style="color:#ff9800;font-size:15px">🎮 遊戲統計</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:10px">';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px;font-weight:900;color:var(--gold2)">'+totalGames+'</div><div style="font-size:11px;color:var(--mut)">總場數</div></div>';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px;font-weight:900;color:var(--green)">'+winGames+'</div><div style="font-size:11px;color:var(--mut)">勝場</div></div>';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px;font-weight:900;color:var(--teal)">'+gameRate+'%</div><div style="font-size:11px;color:var(--mut)">勝率</div></div>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>📊 排行規則</b><div class="skTxt" style="margin-top:6px">';
  h+='PK 評分勝利 +25 分，失敗 -15 分。副本通關數反映你的冒險經驗。遊戲勝場包含所有小遊戲的累計成績。</div></div>';
  area.innerHTML=h;
}

function statsRenderHistory(area,u,g){
  var h='<div class="panel2" style="margin-top:12px"><b style="color:var(--gold2);font-size:15px">📜 活動歷史</b>';
  var logs=[];
  (g.videoLogs||[]).forEach(function(l){logs.push({icon:'🎬',text:l.title,ts:l.ts,detail:'+'+l.ap+' AP'})});
  (g.pkLogs||[]).forEach(function(l){logs.push({icon:l.win?'🏆':'💥',text:'PK vs '+l.opponent,ts:l.ts,detail:l.win?'勝利':'失敗'})});
  (g.stories&&g.stories.logs||[]).forEach(function(l){logs.push({icon:'📖',text:l.title,ts:l.ts,detail:l.result})});
  logs.sort(function(a,b){return(b.ts||0)-(a.ts||0)});
  logs=logs.slice(0,20);

  if(logs.length){
    h+='<div style="max-height:400px;overflow-y:auto">';
    logs.forEach(function(l){
      h+='<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06)">';
      h+='<span style="font-size:18px">'+l.icon+'</span>';
      h+='<div style="flex:1"><div style="font-size:12px;font-weight:700">'+esc(l.text)+'</div>';
      h+='<div style="font-size:11px;color:var(--mut)">'+(l.ts?new Date(l.ts).toLocaleString():'')+'</div></div>';
      h+='<span style="font-size:11px;color:var(--gold2)">'+l.detail+'</span>';
      h+='</div>';
    });
    h+='</div>';
  }else{
    h+='<div class="empty" style="margin-top:10px">暫無活動紀錄</div>';
  }
  h+='</div>';

  h+='<div class="panel2" style="margin-top:12px"><b style="color:var(--teal);font-size:15px">💡 成長建議</b>';
  var totalWrong=(g.wrongBook||[]).length;
  var masteredWrong=(g.wrongBook||[]).filter(function(w){return w.mastered}).length;
  var videosWatched=g.videosWatched||0;
  var totalPk=g.pkWin||0;
  var totalDungeon=(g.dunCleared?Object.keys(g.dunCleared).length:0);
  h+='<div style="margin-top:8px;font-size:12px;line-height:1.8;color:var(--mut)">';
  if(g.lv<10) h+='🌟 你還在冒險初期，多答題和玩遊戲可以快速升級！<br>';
  if(totalWrong>masteredWrong) h+='📝 你有 '+(totalWrong-masteredWrong)+' 道錯題尚未掌握，建議多多複習！<br>';
  if(videosWatched<5) h+='🎬 多觀看教學影片可以獲得額外獎勵，推薦「學習方法論」！<br>';
  if(totalPk<5) h+='⚔️ 多參與 PK 對戰可以提升排名和獲得獎勵！<br>';
  if(totalDungeon<3) h+='🏰 副本探索可以獲得稀有裝備和材料，別忘了挑戰！<br>';
  if(g.lv>=30) h+='🎯 你已經是經驗豐富的冒險者了，繼續保持！<br>';
  if(!h.includes('<br>')) h+='🎉 你的發展相當均衡，繼續保持！<br>';
  h+='</div></div>';
  area.innerHTML=h;
}
window.vStats=vStats;
