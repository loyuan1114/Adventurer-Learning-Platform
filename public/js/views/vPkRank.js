/* vPkRank — PK排行榜 */
function vPkRank(){
  var u=me(); if(!u) return;
  var g=u.g;
  var h=back()+'<h3 class="vt">🏆 PK 排行榜 <span class="vsub">全服排名・評分排行・榮譽殿堂</span></h3>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  h+='<b style="color:var(--gold2);font-size:15px">📊 我的戰績</b>';
  h+='<div style="display:flex;gap:6px">';
  h+='<div class="chip">🏆 評分 '+(g.pkRating||1000)+'</div>';
  h+='<div class="chip">⚔️ '+(g.pkWin||0)+'勝 '+(g.pkLoss||0)+'敗</div>';
  h+='</div></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:10px">';
  var myTotalPk=(g.pkWin||0)+(g.pkLoss||0);
  var myWinRate=myTotalPk>0?Math.round((g.pkWin||0)/myTotalPk*100):0;
  h+='<div style="text-align:center;padding:8px;background:rgba(0,0,0,.15);border-radius:6px"><div style="font-size:18px;font-weight:900;color:var(--green)">'+(g.pkWin||0)+'</div><div style="font-size:10px;color:var(--mut)">勝場</div></div>';
  h+='<div style="text-align:center;padding:8px;background:rgba(0,0,0,.15);border-radius:6px"><div style="font-size:18px;font-weight:900;color:#ff8a80">'+(g.pkLoss||0)+'</div><div style="font-size:10px;color:var(--mut)">敗場</div></div>';
  h+='<div style="text-align:center;padding:8px;background:rgba(0,0,0,.15);border-radius:6px"><div style="font-size:18px;font-weight:900;color:var(--gold2)">'+myWinRate+'%</div><div style="font-size:10px;color:var(--mut)">勝率</div></div>';
  h+='<div style="text-align:center;padding:8px;background:rgba(0,0,0,.15);border-radius:6px"><div style="font-size:18px;font-weight:900;color:#ff9800">'+(g.pkStreak||0)+'</div><div style="font-size:10px;color:var(--mut)">連勝</div></div>';
  h+='</div></div>';

  h+='<div class="tabRow" style="margin-top:12px">';
  ['rating','win','streak','weekly'].forEach(function(t,i){
    var labels={rating:'🏆 評分',win:'⚔️ 勝場',streak:'🔥 連勝',weekly:'📅 本週'};
    h+='<button class="tabB '+(i===0?'on':'')+'" onclick="pkRankTab(\''+t+'\')">'+labels[t]+'</button>';
  });
  h+='</div>';

  h+='<div id="pkRankArea"></div>';
  $('#view').innerHTML=h;
  pkRankTab('rating');
}

function pkRankTab(tab){
  window._pkRankTab=tab;
  document.querySelectorAll('.tabB').forEach(function(b){
    b.classList.toggle('on',b.onclick&&b.onclick.toString().indexOf(tab)>=0);
  });

  var users=get(LS.users,[]).filter(function(u){return(u.g||{}).pkWin||u.role==='admin'});
  var area=document.getElementById('pkRankArea');
  if(!area) return;

  var metrics={
    rating:{fn:function(u){return(u.g||{}).pkRating||1000},label:'評分排行',format:function(v){return v+' 分'},color:'var(--gold2)'},
    win:{fn:function(u){return(u.g||{}).pkWin||0},label:'累計勝場',format:function(v){return v+' 勝'},color:'#e91e63'},
    streak:{fn:function(u){return(u.g||{}).pkStreak||0},label:'最高連勝',format:function(v){return v+' 連勝'},color:'#ff9800'},
    weekly:{fn:function(u){return(u.g||{}).weeklyPkWin||0},label:'本週勝場',format:function(v){return v+' 勝'},color:'var(--teal)'}
  };

  var m=metrics[tab]||metrics.rating;
  users.sort(function(a,b){return m.fn(b)-m.fn(a)});
  var myRank=-1;
  users.forEach(function(usr,i){if(usr.username===me().username) myRank=i+1});

  var h='<div class="panel2" style="margin-top:12px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  h+='<b style="color:'+m.color+';font-size:15px">🏆 '+m.label+'</b>';
  if(myRank>0) h+='<div class="chip" style="margin-left:8px">你的排名：#'+myRank+'</div>';
  h+='<div class="chip">共 '+users.length+' 人</div>';
  h+='</div>';

  h+='<div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">';
  var medals=['🥇','🥈','🥉'];
  users.slice(0,30).forEach(function(usr,i){
    var val=m.fn(usr);
    var isMe=usr.username===me().username;
    var medal=i<3?medals[i]:(i+1);
    h+='<div class="rankIt '+(isMe?'top0':'')+'" style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:'+(isMe?'rgba(255,215,0,.1)':'rgba(0,0,0,.1)')+';border-radius:8px;border:1px '+(isMe?'solid var(--gold)':'solid transparent')+'">';
    h+='<span style="min-width:32px;text-align:center;font-size:'+(i<3?'18px':'13px')+'">'+medal+'</span>';
    h+='<div style="font-size:20px">'+((usr.prof&&usr.prof.avatar)?avatarHtml(usr,28):'🧑‍🎓')+'</div>';
    h+='<div style="flex:1;min-width:0">';
    h+='<b style="font-size:13px;color:'+(isMe?'var(--gold2)':'var(--txt)')+'">'+esc(usr.name||usr.username)+'</b>';
    var ug=usr.g||{};
    h+='<div style="font-size:11px;color:var(--mut)">Lv.'+(ug.lv||1)+' ｜ 勝率 '+(ug.pkWin?Math.round(ug.pkWin/((ug.pkWin||0)+(ug.pkLoss||1))*100):0)+'% ｜ 連勝 '+(ug.pkStreak||0)+'</div>';
    h+='</div>';
    h+='<div style="text-align:right"><div style="font-size:14px;font-weight:900;color:'+m.color+'">'+m.format(val)+'</div></div>';
    h+='</div>';
  });
  h+='</div></div>';

  if(!users.length) h+='<div class="panel2 empty" style="margin-top:12px">暫無 PK 排行資料</div>';

  h+='<div class="panel2" style="margin-top:12px"><b>🏅 PK 等級說明</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px;margin-top:8px">';
  var tiers=[
    {name:'青銅',min:0,color:'#cd7f32',icon:'🥉',desc:'剛開始PK之路'},
    {name:'白銀',min:800,color:'#c0c0c0',icon:'🥈',desc:'有一定實力'},
    {name:'黃金',min:1200,color:'#ffd700',icon:'🥇',desc:'PK高手'},
    {name:'鉑金',min:1600,color:'#e5e4e2',icon:'💎',desc:'頂尖戰力'},
    {name:'鑽石',min:2000,color:'#b9f2ff',icon:'💠',desc:'傳說級強者'},
    {name:'傳說',min:2500,color:'#ff6b6b',icon:'👑',desc:'PK之王'}
  ];
  tiers.forEach(function(t){
    var inTier=(me().g.pkRating||1000)>=t.min;
    h+='<div style="text-align:center;padding:8px;background:rgba(0,0,0,'+(inTier?'.15':'.05')+');border-radius:6px;opacity:'+(inTier?'1':'.4')+'">';
    h+='<div style="font-size:20px">'+t.icon+'</div>';
    h+='<div style="font-size:12px;font-weight:700;color:'+t.color+'">'+t.name+'</div>';
    h+='<div style="font-size:10px;color:var(--mut)">'+t.min+'+</div>';
    h+='<div style="font-size:9px;color:var(--mut)">'+t.desc+'</div>';
    h+='</div>';
  });
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>📊 排行規則</b>';
  h+='<div style="margin-top:6px;font-size:12px;line-height:1.8;color:var(--mut)">';
  h+='• 評分根據 PK 對戰勝負計算：勝利 +25 分，失敗 -15 分<br>';
  h+='• 評分決定你的 PK 等級稱號（青銅 → 白銀 → 黃金 → 鉑金 → 鑽石 → 傳說）<br>';
  h+='• 本週排行榜每週一重置，前 10 名可獲得額外獎勵<br>';
  h+='• 連勝 5 場以上有額外加成獎勵<br>';
  h+='• 排位賽需 Lv.10 以上才能參加';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>🏅 PK 歷史紀錄</b>';
  var u=me();
  var pkLogs=(u.g.pkLogs||[]).slice(-10).reverse();
  if(pkLogs.length){
    h+='<div style="max-height:300px;overflow-y:auto">';
    pkLogs.forEach(function(l){
      h+='<div class="chip">'+new Date(l.ts).toLocaleString()+' '+(l.win?'🏆 勝利':'💥 失敗')+' vs '+esc(l.opponent)+' ('+l.mode+')</div>';
    });
    h+='</div>';
  }else{
    h+='<div class="empty" style="margin-top:8px">暫無 PK 紀錄</div>';
  }
  h+='</div>';

  h+='<div class="panel2" style="margin-top:12px"><b>🔥 連勝獎勵說明</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px;margin-top:8px">';
  var streakRewards=[
    {streak:3,bonus:'💰+100',name:'三連勝'},
    {streak:5,bonus:'💰+200 📊+100',name:'五連勝'},
    {streak:10,bonus:'💰+500 📊+300',name:'十連勝'},
    {streak:20,bonus:'💰+1000 📊+500',name:'二十連勝'}
  ];
  streakRewards.forEach(function(r){
    h+='<div style="text-align:center;padding:8px;background:rgba(0,0,0,.1);border-radius:6px">';
    h+='<div style="font-size:16px">🔥</div>';
    h+='<div style="font-size:11px;font-weight:700;color:var(--gold2)">'+r.name+'</div>';
    h+='<div style="font-size:9px;color:var(--mut)">'+r.bonus+'</div>';
    h+='</div>';
  });
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>📊 PK 分析</b>';
  var u=me(),ug=u.g;
  var myPkWin=ug.pkWin||0;
  var myPkLoss=ug.pkLoss||0;
  var myTotal=myPkWin+myPkLoss;
  var myRate=myTotal>0?Math.round(myPkWin/myTotal*100):0;
  var avgLv=get(LS.users,[]).filter(function(x){return(x.g||{}).pkWin}).reduce(function(s,x){return s+((x.g||{}).lv||1)},0)/Math.max(1,get(LS.users,[]).filter(function(x){return(x.g||{}).pkWin}).length);
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:8px">';
  h+='<div style="text-align:center;padding:8px;background:rgba(0,0,0,.1);border-radius:6px"><div style="font-size:14px;font-weight:900;color:var(--gold2)">'+myRate+'%</div><div style="font-size:10px;color:var(--mut)">你的勝率</div></div>';
  h+='<div style="text-align:center;padding:8px;background:rgba(0,0,0,.1);border-radius:6px"><div style="font-size:14px;font-weight:900;color:var(--teal)">Lv.'+Math.round(avgLv)+'</div><div style="font-size:10px;color:var(--mut)">PK 平均等級</div></div>';
  h+='<div style="text-align:center;padding:8px;background:rgba(0,0,0,.1);border-radius:6px"><div style="font-size:14px;font-weight:900;color:#e91e63">'+(ug.pkRating||1000)+'</div><div style="font-size:10px;color:var(--mut)">你的評分</div></div>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>📅 本週 PK 挑戰進度</b>';
  var weeklyWins=ug.weeklyPkWin||0;
  var weeklyTarget=10;
  h+='<div style="display:flex;align-items:center;gap:8px;margin-top:8px">';
  h+='<div style="flex:1;background:rgba(0,0,0,.2);border-radius:6px;height:10px;overflow:hidden">';
  h+='<div style="height:100%;width:'+Math.min(100,weeklyWins/weeklyTarget*100)+'%;background:linear-gradient(90deg,#e91e63,var(--gold2));border-radius:6px"></div></div>';
  h+='<span style="font-size:12px;color:var(--mut)">'+weeklyWins+'/'+weeklyTarget+'</span></div>';
  h+='<div style="font-size:11px;color:var(--mut);margin-top:4px">完成本週 '+weeklyTarget+' 場 PK 可獲得額外獎勵</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>💡 PK 進階技巧</b>';
  h+='<div style="margin-top:6px;font-size:12px;line-height:1.8;color:var(--mut)">';
  h+='• <b style="color:var(--gold2)">選擇適合的難度</b>：不要好高騖遠，穩紮穩打才是王道<br>';
  h+='• <b style="color:var(--gold2)">利用連勝加成</b>：連勝越多獎勵越高，保持專注<br>';
  h+='• <b style="color:var(--gold2)">觀察對手等級</b>：選擇與自己等級相近的對手<br>';
  h+='• <b style="color:var(--gold2)">善用科目優勢</b>：選擇自己擅長的科目對戰<br>';
  h+='• <b style="color:var(--gold2)">把握每日上限</b>：每日 10 場 PK，合理分配時間';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>🏆 PK 獎勵說明</b>';
  h+='<div style="margin-top:6px;font-size:12px;line-height:1.8;color:var(--mut)">';
  h+='• <b>勝利</b>：+25 評分，💰200 金幣，📊100 經驗<br>';
  h+='• <b>失敗</b>：-15 評分，無金幣獎勵<br>';
  h+='• <b>連勝加成</b>：5連勝 +100金幣，10連勝 +300金幣<br>';
  h+='• <b>排位賽</b>：Lv.10+ 可參加，獎勵翻倍';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>📋 快速操作</b>';
  h+='<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">';
  h+='<button class="btn mini teal" onclick="needJs([\'js/views/vPK.js\']).then(()=>vPK())">⚔️ 前往 PK 對戰</button>';
  h+='<button class="btn mini ghost" onclick="pkRankTab(\'rating\')">🏆 查看評分排行</button>';
  h+='<button class="btn mini ghost" onclick="pkRankTab(\'win\')">⚔️ 查看勝場排行</button>';
  h+='<button class="btn mini ghost" onclick="pkRankTab(\'streak\')">🔥 查看連勝排行</button>';
  h+='</div></div>';

  area.innerHTML=h;
}
window.vPkRank=vPkRank;
