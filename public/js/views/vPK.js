/* vPK — PK對戰 */
function vPK(){
  var u=me(); if(!u) return;
  var g=u.g;
  var h=back()+'<h3 class="vt">⚔️ PK 對戰 <span class="vsub">即時對戰・策略比拼・贏取獎勵</span></h3>';

  var pkWin=g.pkWin||0;
  var pkLoss=g.pkLoss||0;
  var pkStreak=g.pkStreak||0;
  var pkRating=g.pkRating||1000;
  var totalPk=pkWin+pkLoss;
  var winRate=totalPk>0?Math.round(pkWin/totalPk*100):0;

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  h+='<b style="color:var(--gold2);font-size:15px">📊 我的戰績</b>';
  h+='<div class="chip">🏆 評分：'+pkRating+'</div>';
  h+='</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:10px">';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px;font-weight:900;color:var(--green)">'+pkWin+'</div><div style="font-size:11px;color:var(--mut)">勝場</div></div>';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px;font-weight:900;color:#ff8a80">'+pkLoss+'</div><div style="font-size:11px;color:var(--mut)">敗場</div></div>';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px;font-weight:900;color:var(--gold2)">'+winRate+'%</div><div style="font-size:11px;color:var(--mut)">勝率</div></div>';
  h+='<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px;font-weight:900;color:#ff9800">'+pkStreak+'</div><div style="font-size:11px;color:var(--mut)">連勝</div></div>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b style="color:#e91e63;font-size:15px">⚔️ 選擇對戰模式</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:10px">';

  var modes=[
    {id:'random',icon:'🎲',name:'隨機匹配',desc:'與隨機對手 PK，勝者獲得金幣與經驗',reward:'💰 200金・📊 100經驗',req:'無'},
    {id:'subject',icon:'📚',name:'科目對戰',desc:'選擇科目進行知識問答 PK',reward:'💰 300金・📊 150經驗',req:'無'},
    {id:'ranked',icon:'🏆',name:'排位賽',desc:'影響評分排名的正式對戰',reward:'💰 500金・📊 300經驗・🏆 評分',req:'Lv.10+'},
    {id:'friend',icon:'👥',name:'好友對戰',desc:'向好友發起挑戰',reward:'💰 150金・📊 80經驗',req:'需有好友'}
  ];

  modes.forEach(function(mode){
    var canPlay=mode.id!=='ranked'||g.lv>=10;
    h+='<div class="panel2" style="text-align:center;padding:14px;'+(!canPlay?'opacity:.5':'')+'">';
    h+='<div style="font-size:36px">'+mode.icon+'</div>';
    h+='<b style="font-family:var(--serif);color:var(--gold2);font-size:14px;display:block;margin:6px 0">'+mode.name+'</b>';
    h+='<div style="font-size:11px;color:var(--mut);margin-bottom:6px">'+mode.desc+'</div>';
    h+='<div style="font-size:10px;color:var(--gold2);margin-bottom:6px">'+mode.reward+'</div>';
    h+='<div style="font-size:10px;color:var(--mut)">需求：'+mode.req+'</div>';
    h+='<button class="btn '+(canPlay?'teal':'dis')+' big" style="width:100%;margin-top:8px" '+(canPlay?'':'disabled')+' onclick="pkStart(\''+mode.id+'\')">'+(canPlay?'⚔️ 開始對戰':'🔒 '+mode.req)+'</button>';
    h+='</div>';
  });
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b style="color:#ff9800;font-size:15px">📅 今日 PK 挑戰</b>';
  var dailyPk=g.dailyPk||0;
  var maxDailyPk=10;
  h+='<div style="display:flex;align-items:center;gap:8px;margin-top:8px">';
  h+='<div style="flex:1;background:rgba(0,0,0,.2);border-radius:6px;height:10px;overflow:hidden">';
  h+='<div style="height:100%;width:'+Math.min(100,dailyPk/maxDailyPk*100)+'%;background:linear-gradient(90deg,#ff9800,#e91e63);border-radius:6px"></div></div>';
  h+='<span style="font-size:12px;color:var(--mut)">'+dailyPk+'/'+maxDailyPk+'</span></div>';
  h+='<div style="font-size:11px;color:var(--mut);margin-top:4px">每日 PK 上限 '+maxDailyPk+' 場，完成可獲得額外獎勵</div></div>';

  h+='<div class="panel2" style="margin-top:14px"><b>📜 近期對戰紀錄</b>';
  var logs=(g.pkLogs||[]).slice(-8).reverse();
  if(logs.length){
    h+='<div style="margin-top:8px">';
    logs.forEach(function(l){
      var icon=l.win?'🏆':'💥';
      h+='<div class="chip">'+icon+' '+new Date(l.ts).toLocaleString()+' vs '+esc(l.opponent)+' '+(l.win?'勝利':'失敗')+' ('+l.mode+')</div>';
    });
    h+='</div>';
  }else{
    h+='<div class="empty">暫無對戰紀錄</div>';
  }
  h+='</div>';

  h+='<div class="panel2" style="margin-top:12px"><b>💡 PK 小技巧</b><div class="skTxt" style="margin-top:6px">';
  h+='排位賽勝利可提升評分，評分越高匹配的對手越強但獎勵也越豐厚。連勝 5 場以上有額外加成獎勵！每日 PK 上限 10 場，合理分配時間挑戰。</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>📊 PK 等級</b>';
  h+='<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">';
  var pkTiers=[
    {name:'青銅',min:0,color:'#cd7f32'},
    {name:'白銀',min:800,color:'#c0c0c0'},
    {name:'黃金',min:1200,color:'#ffd700'},
    {name:'鉑金',min:1600,color:'#e5e4e2'},
    {name:'鑽石',min:2000,color:'#b9f2ff'},
    {name:'傳說',min:2500,color:'#ff6b6b'}
  ];
  pkTiers.forEach(function(t){
    var active=(g.pkRating||1000)>=t.min;
    h+='<div class="chip" style="border-color:'+(active?t.color:'transparent')+';opacity:'+(active?'1':'.4')+'">'+t.name+'</div>';
  });
  h+='</div></div>';

  $('#view').innerHTML=h;
}

function pkStart(mode){
  var u=me(); if(!u) return;
  var g=u.g;
  var dailyPk=g.dailyPk||0;
  if(dailyPk>=10) return toast('⚠️ 今日 PK 次數已達上限','bad');

  var allUsers=get(LS.users,[]).filter(function(usr){
    return usr.username!==u.username&&usr.role!=='admin'&&(usr.g||{}).lv>=1;
  });
  if(!allUsers.length) return toast('⚠️ 找不到可匹配的對手','bad');
  var opponent=allUsers[Math.floor(Math.random()*allUsers.length)];
  var subjNames=['數學','英文','自然','社會','程式'];
  var subj=mode==='subject'?subjNames[Math.floor(Math.random()*subjNames.length)]:'綜合';

  var questions=[
    {q:'2 + 3 = ?',ans:'5',opts:['4','5','6','7']},
    {q:'英文 "apple" 的中文是？',ans:'蘋果',opts:['蘋果','香蕉','橘子','葡萄']},
    {q:'水的化學式是？',ans:'H2O',opts:['CO2','H2O','O2','N2']},
    {q:'地球繞太陽一圈約多久？',ans:'365天',opts:['30天','365天','1000天','24小時']},
    {q:'光速大約是每秒多少公里？',ans:'30萬',opts:['30萬','300萬','3000萬','3萬']}
  ];
  var q=questions[Math.floor(Math.random()*questions.length)];

  var startTime=Date.now();
  var timeLeft=15;
  var chosen=null;

  function renderPk(){
    var elapsed=Math.floor((Date.now()-startTime)/1000);
    var remain=Math.max(0,15-elapsed);
    var h='<div style="padding:10px;text-align:center">';
    h+='<div style="font-size:16px;font-weight:900;font-family:var(--serif);color:var(--gold2)">⚔️ PK 對戰 — '+subj+'</div>';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0">';
    h+='<div><div style="font-size:14px;font-weight:700">'+esc(u.name)+'</div><div style="font-size:11px;color:var(--mut)">Lv.'+g.lv+'</div></div>';
    h+='<div style="font-size:24px">⚔️</div>';
    h+='<div><div style="font-size:14px;font-weight:700">'+esc(opponent.name||opponent.username)+'</div><div style="font-size:11px;color:var(--mut)">Lv.'+((opponent.g||{}).lv||1)+'</div></div>';
    h+='</div>';
    h+='<div style="font-size:28px;font-weight:900;color:'+(remain<=5?'#ff8a80':'var(--teal))')+'">'+remain+' 秒</div>';
    h+='<div class="panel2" style="margin:12px 0;text-align:left"><b style="font-size:14px">'+esc(q.q)+'</b></div>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    q.opts.forEach(function(o,i){
      var isChosen=chosen===i;
      var isCorrect=o===q.ans;
      var bg='rgba(0,0,0,.15)';
      if(chosen!==null){
        if(isCorrect) bg='rgba(76,175,80,.3)';
        else if(isChosen) bg='rgba(255,82,82,.3)';
      }
      h+='<button class="btn" style="padding:12px;background:'+bg+';text-align:center" '+(chosen!==null?'disabled':'')+' onclick="pkAnswer('+i+')">'+esc(o)+'</button>';
    });
    h+='</div></div>';
    return h;
  }

  openModal(renderPk());

  var timer=setInterval(function(){
    var elapsed=Math.floor((Date.now()-startTime)/1000);
    if(elapsed>=15||chosen!==null){
      clearInterval(timer);
      pkResolve(mode,u,opponent,q,chosen);
      return;
    }
    var modal=document.querySelector('.modal,.openModal,#modal');
    if(modal) modal.innerHTML=renderPk();
  },500);

  window._pkTimer=timer;
}

function pkAnswer(idx){
  if(window._pkAnswered) return;
  window._pkAnswered=true;
  if(window._pkTimer) clearInterval(window._pkTimer);
  var u=me();
  var q=window._pkCurrentQ;
  setTimeout(function(){pkResolve(window._pkMode||'random',u,window._pkOpponent,q,idx)},300);
}

function pkResolve(mode,u,opponent,q,chosen){
  window._pkAnswered=false;
  var g=u.g;
  var correct=chosen!==null&&q&&q.opts&&q.opts[chosen]===q.ans;
  var win=correct||Math.random()<0.3;

  g.dailyPk=(g.dailyPk||0)+1;
  g.pkLogs=g.pkLogs||[];
  g.pkLogs.push({
    opponent:opponent.name||opponent.username,
    mode:mode,win:win,ts:Date.now()
  });
  if(g.pkLogs.length>20) g.pkLogs=g.pkLogs.slice(-20);

  if(win){
    g.pkWin=(g.pkWin||0)+1;
    g.pkStreak=(g.pkStreak||0)+1;
    g.gold=(g.gold||0)+200;
    g.exp=(g.exp||0)+100;
    if(g.pkStreak>=5){g.gold+=100;g.exp+=50;toast('🔥 連勝 '+g.pkStreak+' 場！額外獎勵！');}
    if(mode==='ranked'){g.pkRating=(g.pkRating||1000)+25;}
  }else{
    g.pkLoss=(g.pkLoss||0)+1;
    g.pkStreak=0;
    if(mode==='ranked'){g.pkRating=Math.max(0,(g.pkRating||1000)-15);}
  }

  set(LS.users,get(LS.users,[]));
  closeModal();

  var resultH='<div style="text-align:center;padding:20px">';
  resultH+='<div style="font-size:60px;animation:bob 2s infinite">'+(win?'🏆':'💥')+'</div>';
  resultH+='<b style="font-size:20px;font-family:var(--serif);color:'+(win?'var(--gold2)':'#ff8a80')+';display:block;margin:12px 0">'+(win?'勝利！':'失敗…')+'</b>';
  if(win) resultH+='<div style="font-size:13px;color:var(--mut)">+200 金幣 ・ +100 經驗</div>';
  resultH+='<button class="btn gold big" style="margin-top:16px" onclick="closeModal();vPK()">返回 PK 大廳</button>';
  resultH+='</div>';
  openModal(resultH);

  toast(win?'🏆 PK 勝利！':'💥 PK 失敗',win?'good':'bad');
}
window.vPK=vPK;
