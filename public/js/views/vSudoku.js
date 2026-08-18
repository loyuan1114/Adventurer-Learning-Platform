/* ════════════════════════════════════════════
   vSudoku 畫面模組 — 數獨排位系統
   10 段位 × 5 階段，Solo 模式（9×9 / 16×16），PK 模式（12×12）
   ════════════════════════════════════════════ */

var SUDOKU_SERVER = 'http://10.67.50.212:8083';

var SUDOKU_TIERS = [
  {name:'銅板',en:'Bronze',   color:'#cd7f32'},
  {name:'白銀',en:'Silver',   color:'#c0c0c0'},
  {name:'黃金',en:'Gold',     color:'#ffd700'},
  {name:'鉑金',en:'Platinum', color:'#e5e4e2'},
  {name:'鑽石',en:'Diamond',  color:'#b9f2ff'},
  {name:'大師',en:'Master',   color:'#ff6b6b'},
  {name:'宗師',en:'Grandmaster', color:'#c47bff'},
  {name:'傳說',en:'Legend',   color:'#ff9f43'},
  {name:'神話',en:'Mythic',   color:'#ff4757'},
  {name:'至尊',en:'Supreme',  color:'#ffd32a'}
];

function _sdRanking(){
  var def={tier:0,stage:0,wins:0,losses:0,history:[]};
  try{var d=JSON.parse(localStorage.getItem('sudoku_ranking'));if(d&&typeof d==='object')return d}catch(e){}
  return def;
}

function _sdSaveRanking(r){
  try{localStorage.setItem('sudoku_ranking',JSON.stringify(r))}catch(e){}
}

function _sdTierLabel(tier,stage){
  var t=SUDOKU_TIERS[Math.max(0,Math.min(9,tier))];
  return '<span style="color:'+t.color+'">'+t.name+'</span> <span style="opacity:.7">階段'+(stage+1)+'</span>';
}

function _sdProgressHTML(tier,stage){
  var t=SUDOKU_TIERS[Math.max(0,Math.min(9,tier))];
  var wins=0, losses=0;
  var r=_sdRanking();
  var last5=r.history.slice(-5);
  var ww=0,ll=0;
  last5.forEach(function(h){if(h.result==='win')ww++;else ll++});
  wins=ww;losses=ll;
  var pct=Math.min(100,Math.round((wins/5)*100));
  return '<div style="margin:8px 0">'+_sdTierLabel(tier,stage)+'</div>'+
    '<div style="background:#1a1a2e;border-radius:8px;overflow:hidden;height:22px;position:relative;margin-bottom:4px">'+
    '<div style="background:linear-gradient(90deg,'+t.color+','+t.color+'88);height:100%;width:'+pct+'%;transition:width .4s"></div>'+
    '<span style="position:absolute;top:0;left:0;right:0;text-align:center;line-height:22px;font-size:12px;color:#fff">'+wins+'/5 勝 (近5場)</span>'+
    '</div>'+
    '<div style="font-size:12px;color:var(--mut)">總計 '+r.wins+' 勝 '+r.losses+' 敗</div>';
}

function _sdCooldownKey(mode){
  return 'sudoku_cd_' + mode;
}

function _sdCooldownRemaining(mode){
  var ms={solo9:90*60000,solo16:120*60000};
  var limit=ms[mode];if(!limit)return 0;
  try{var t=parseInt(localStorage.getItem(_sdCooldownKey(mode)),10);if(!t)return 0;var rem=t+limit-Date.now();return rem>0?rem:0}catch(e){return 0}
}

function _sdSetCooldown(mode){
  try{localStorage.setItem(_sdCooldownKey(mode),String(Date.now()))}catch(e){}
}

function _sdFormatTime(sec){
  var m=Math.floor(sec/60),s=sec%60;
  return (m<10?'0':'')+m+':'+(s<10?'0':'')+s;
}

function _sdGridHTML(board,size){
  var br=0,bc=0;
  if(size===9){br=3;bc=3}else if(size===12){br=4;bc=3}else{br=4;bc=4}
  var html='<table class="sd-grid" style="border-collapse:collapse;margin:0 auto">';
  for(var r=0;r<size;r++){
    html+='<tr>';
    for(var c=0;c<size;c++){
      var val=board[r][c];
      var bt='',rt='',bb='',bl='';
      if(c%bc===0&&c>0)bt='border-left:2px solid #888;';
      if(r%br===0&&r>0)rt='border-top:2px solid #888;';
      var editable=val===0;
      var cls=editable?'sd-cell-editable':'sd-cell-fixed';
      html+='<td class="'+cls+'" data-r="'+r+'" data-c="'+c+'" style="'+bt+rt+bb+bl+'">';
      if(!editable){
        html+='<span class="sd-val">'+val+'</span>';
      }
      html+='</td>';
    }
    html+='</tr>';
  }
  html+='</table>';
  return html;
}

function _sdNumpadHTML(size){
  var html='<div class="sd-numpad" style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px;margin:10px auto;max-width:400px">';
  html+='<button class="sd-num-btn" data-val="0" style="background:#ff4757;color:#fff">✕</button>';
  for(var i=1;i<=size;i++){
    html+='<button class="sd-num-btn" data-val="'+i+'">'+i+'</button>';
  }
  html+='</div>';
  return html;
}

function _sdCountProgress(grid,size){
  var filled=0,total=size*size;
  for(var r=0;r<size;r++)for(var c=0;c<size;c++)if(grid[r][c]!==0)filled++;
  return {filled:filled,total:total,pct:Math.round((filled/total)*100)};
}

function vSudoku(){
  $('#view').innerHTML=back()+'<h3 class="vt">🧩 數獨排位 <span class="vsub">排位競速・多種尺寸</span></h3>'+
  '<div id="sdBody"></div>';
  _sdShowMain();
}

function _sdShowMain(){
  var r=_sdRanking();
  var html='<div class="panel2" style="margin-bottom:10px">'+_sdProgressHTML(r.tier,r.stage)+'</div>';
  html+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">';
  html+='<button class="btn" onclick="sdStartSolo(9)" style="flex:1;min-width:140px">🎯 Solo 9×9<br><span style="font-size:11px;opacity:.7">10 分鐘限時</span></button>';
  html+='<button class="btn" onclick="sdStartSolo(16)" style="flex:1;min-width:140px">🎯 Solo 16×16<br><span style="font-size:11px;opacity:.7">25 分鐘限時</span></button>';
  html+='<button class="btn" onclick="sdStartPK()" style="flex:1;min-width:140px">⚔️ PK 12×12<br><span style="font-size:11px;opacity:.7">10 人即時對戰</span></button>';
  html+='</div>';
  var cd9=_sdCooldownRemaining('solo9');
  var cd16=_sdCooldownRemaining('solo16');
  if(cd9>0||cd16>0){
    html+='<div class="panel2" style="margin-bottom:10px;font-size:13px;color:var(--mut)">';
    if(cd9>0)html+='⏱ 9×9 冷卻中：'+_sdFormatTime(Math.ceil(cd9/1000))+'<br>';
    if(cd16>0)html+='⏱ 16×16 冷卻中：'+_sdFormatTime(Math.ceil(cd16/1000));
    html+='</div>';
  }
  html+='<div style="font-size:13px;color:var(--mut);margin-bottom:8px"><b>段位一覽</b></div>';
  html+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">';
  for(var i=0;i<SUDOKU_TIERS.length;i++){
    var t=SUDOKU_TIERS[i];
    var active=i===r.tier;
    html+='<div style="background:'+(active?'#1a1a2e':'#111')+';border:1px solid '+(active?t.color:'#333')+';border-radius:8px;padding:8px 12px;font-size:12px;flex:1;min-width:90px;text-align:center">';
    html+='<div style="color:'+t.color+';font-size:14px;font-weight:bold">'+t.name+'</div>';
    html+='<div style="opacity:.6;font-size:11px">'+t.en+'</div>';
    if(active){
      html+='<div style="margin-top:4px;color:'+t.color+'">階段 '+(r.stage+1)+'/5</div>';
    }
    html+='</div>';
  }
  html+='</div>';
  html+='<div class="panel2" style="margin-bottom:10px;font-size:13px;color:var(--mut);line-height:1.8;border-left:4px solid var(--gold)">';
  html+='<b>進位規則</b><br>';
  html+='• 同段位內升階段：近 5 場勝場 ≥ 3 即升<br>';
  html+='• 段位晉級：在最高階段時近 5 場勝場 ≥ 3<br>';
  html+='• 降級：近 5 場負場 ≥ 3 降 1 階段<br>';
  html+='• Solo 9×9：每 90 分鐘可玩，限時 10 分鐘<br>';
  html+='• Solo 16×16：每 2 小時可玩，限時 25 分鐘<br>';
  html+='• PK 12×12：10 人同時競速，30 分鐘限時';
  html+='</div>';
  var hist=r.history.slice(-10).reverse();
  if(hist.length>0){
    html+='<div style="font-size:13px;color:var(--mut);margin-bottom:8px"><b>最近對戰紀錄</b></div>';
    html+='<table style="width:100%;font-size:12px;border-collapse:collapse">';
    html+='<tr style="color:var(--mut);border-bottom:1px solid #333"><td>日期</td><td>結果</td><td>尺寸</td><td>用時</td></tr>';
    hist.forEach(function(h){
      var rc=h.result==='win'?'color:#2ed573':'color:#ff4757';
      html+='<tr style="border-bottom:1px solid #222"><td>'+h.date+'</td><td style="'+rc+'">'+(h.result==='win'?'✅ 勝':'❌ 敗')+'</td><td>'+(h.size||9)+'×'+(h.size||9)+'</td><td>'+(h.time||'-')+'</td></tr>';
    });
    html+='</table>';
  }
  html+='<div style="text-align:center;margin-top:12px"><button class="btn" onclick="sdResetRanking()" style="font-size:11px;opacity:.6">重置排位資料</button></div>';
  $('#sdBody').innerHTML=html;
  _sdStartCooldownTimers();
}

var _sdCDTimer=null;
function _sdStartCooldownTimers(){
  if(_sdCDTimer)clearInterval(_sdCDTimer);
  _sdCDTimer=setInterval(function(){
    var cd9=_sdCooldownRemaining('solo9');
    var cd16=_sdCooldownRemaining('solo16');
    if(!cd9&&!cd16){clearInterval(_sdCDTimer);_sdCDTimer=null;return}
    var el=$('#sdBody');if(!el)return;
    var cdDiv=el.querySelector('.sd-cd-display');
    if(cdDiv){
      var t='';
      if(cd9>0)t+='⏱ 9×9 冷卻：'+_sdFormatTime(Math.ceil(cd9/1000))+'  ';
      if(cd16>0)t+='⏱ 16×16 冷卻：'+_sdFormatTime(Math.ceil(cd16/1000));
      cdDiv.textContent=t;
    }
  },1000);
}

function sdResetRanking(){
  if(!confirm('確定要重置排位資料嗎？所有進度將清除！'))return;
  _sdSaveRanking({tier:0,stage:0,wins:0,losses:0,history:[]});
  _sdShowMain();
}

/* ── Solo Mode ── */
var _sdSoloState=null;

function sdStartSolo(size){
  var mode=size===16?'solo16':'solo9';
  var cd=_sdCooldownRemaining(mode);
  if(cd>0){
    alert('冷卻中，請等待 '+_sdFormatTime(Math.ceil(cd/1000)));
    return;
  }
  var timeLimit=size===16?25*60:10*60;
  $('#sdBody').innerHTML='<div style="text-align:center;padding:40px"><div style="font-size:40px;animation:bob 1s infinite">🧩</div><p style="color:var(--mut);margin-top:10px">正在生成 '+size+'×'+size+' 題目...</p></div>';
  fetch(SUDOKU_SERVER+'/sudoku?size='+size)
    .then(function(r){return r.json()})
    .then(function(data){
      if(!data||!data.puzzle||!data.solution){
        $('#sdBody').innerHTML='<div style="text-align:center;padding:40px;color:var(--ff)">題目生成失敗，請稍後再試</div>';
        return;
      }
      var grid=data.puzzle.map(function(r){return r.slice()});
      _sdSoloState={
        size:size,
        solution:data.solution,
        grid:grid,
        puzzle:data.puzzle,
        timeLimit:timeLimit,
        elapsed:0,
        timer:null,
        active:true,
        selectedCell:null
      };
      _sdRenderSolo();
    })
    .catch(function(e){
      $('#sdBody').innerHTML='<div style="text-align:center;padding:40px;color:var(--ff)">無法連線到數獨伺服器<br><small>'+String(e)+'</small></div>';
    });
}

function _sdRenderSolo(){
  var s=_sdSoloState;if(!s)return;
  var prog=_sdCountProgress(s.grid,s.size);
  var remain=Math.max(0,s.timeLimit-s.elapsed);
  var timeColor=remain<60?'color:#ff4757':'';
  var html='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px">';
  html+='<div><span style="color:var(--gold)">🎯 Solo '+s.size+'×'+s.size+'</span></div>';
  html+='<div style="font-size:18px;font-weight:bold;'+timeColor+'">'+_sdFormatTime(Math.ceil(remain/1000))+'</div>';
  html+='<div style="font-size:12px;color:var(--mut)">完成 '+prog.pct+'%</div>';
  html+='</div>';
  html+='<div style="overflow-x:auto">'+_sdGridHTML(s.grid,s.size)+'</div>';
  html+=_sdNumpadHTML(s.size);
  html+='<div style="text-align:center;margin-top:8px"><button class="btn" onclick="sdSoloQuit()">退出</button></div>';
  $('#sdBody').innerHTML=html;
  _sdBindGrid(s);
  _sdBindNumpad(s);
  if(!s.timer){
    s.timer=setInterval(function(){
      if(!s||!s.active)return;
      s.elapsed+=1000;
      if(s.elapsed>=s.timeLimit){
        _sdSoloFinish(false);
        return;
      }
      var remain2=Math.max(0,s.timeLimit-s.elapsed);
      var el=$('#sdBody');if(!el)return;
      var timeEl=el.querySelector('.sd-timer-val');
      if(timeEl){
        timeEl.textContent=_sdFormatTime(Math.ceil(remain2/1000));
        if(remain2<60000)timeEl.style.color='#ff4757';
      }
      var progEl=el.querySelector('.sd-prog-val');
      if(progEl){
        var p2=_sdCountProgress(s.grid,s.size);
        progEl.textContent='完成 '+p2.pct+'%';
      }
    },1000);
  }
}

function _sdBindGrid(s){
  var cells=document.querySelectorAll('.sd-cell-editable');
  cells.forEach(function(td){
    td.onclick=function(){
      var cells2=document.querySelectorAll('.sd-cell-editable');
      cells2.forEach(function(c){c.classList.remove('sd-selected')});
      td.classList.add('sd-selected');
      s.selectedCell={r:parseInt(td.dataset.r),c:parseInt(td.dataset.c)};
      var v=s.grid[s.selectedCell.r][s.selectedCell.c];
      var numBtns=document.querySelectorAll('.sd-num-btn');
      numBtns.forEach(function(b){
        b.classList.remove('sd-num-active');
        if(parseInt(b.dataset.val)===v)b.classList.add('sd-num-active');
      });
    };
  });
}

function _sdBindNumpad(s){
  var btns=document.querySelectorAll('.sd-num-btn');
  btns.forEach(function(btn){
    btn.onclick=function(){
      if(!s.selectedCell)return;
      var val=parseInt(btn.dataset.val);
      var r=s.selectedCell.r,c=s.selectedCell.c;
      s.grid[r][c]=val;
      var td=document.querySelector('.sd-cell-editable[data-r="'+r+'"][data-c="'+c+'"]');
      if(td){
        td.innerHTML=val>0?'<span class="sd-val">'+val+'</span>':'';
        td.classList.remove('sd-selected');
      }
      btns.forEach(function(b){b.classList.remove('sd-num-active')});
      btn.classList.add('sd-num-active');
      var prog=_sdCountProgress(s.grid,s.size);
      var progEl=document.querySelector('.sd-prog-val');
      if(progEl)progEl.textContent='完成 '+prog.pct+'%';
      if(prog.filled===prog.total){
        var correct=true;
        for(var rr=0;rr<s.size&&correct;rr++){
          for(var cc=0;cc<s.size&&correct;cc++){
            if(s.grid[rr][cc]!==s.solution[rr][cc])correct=false;
          }
        }
        if(correct)_sdSoloFinish(true);
      }
    };
  });
}

function _sdSoloFinish(won){
  var s=_sdSoloState;if(!s)return;
  s.active=false;
  if(s.timer){clearInterval(s.timer);s.timer=null}
  _sdSetCooldown(s.size===16?'solo16':'solo9');
  var elapsedStr=_sdFormatTime(Math.ceil(s.elapsed/1000));
  var r=_sdRanking();
  r.history.push({
    date:new Date().toLocaleDateString(),
    result:won?'win':'lose',
    time:elapsedStr,
    size:s.size,
    mode:'solo'
  });
  if(won){
    r.wins++;
    _sdCheckAdvancement(r);
  }else{
    r.losses++;
    _sdCheckDemotion(r);
  }
  _sdSaveRanking(r);
  _sdSoloState=null;
  var html='<div style="text-align:center;padding:30px">';
  if(won){
    html+='<div style="font-size:48px;margin-bottom:10px">🎉</div>';
    html+='<div style="font-size:20px;color:#2ed573;font-weight:bold">完成！</div>';
    html+='<div style="color:var(--mut);margin:8px 0">用時 '+elapsedStr+'</div>';
  }else{
    html+='<div style="font-size:48px;margin-bottom:10px">⏰</div>';
    html+='<div style="font-size:20px;color:#ff4757;font-weight:bold">時間到！</div>';
    html+='<div style="color:var(--mut);margin:8px 0">'+_sdFormatTime(s.timeLimit)+' 已用完</div>';
  }
  html+='<div style="margin:12px 0">'+_sdProgressHTML(r.tier,r.stage)+'</div>';
  html+='<button class="btn" onclick="sdBackToMain()" style="margin-top:10px">返回主頁</button>';
  html+='</div>';
  $('#sdBody').innerHTML=html;
}

function sdSoloQuit(){
  if(_sdSoloState){
    _sdSoloState.active=false;
    if(_sdSoloState.timer){clearInterval(_sdSoloState.timer);_sdSoloState.timer=null}
  }
  _sdSoloState=null;
  _sdShowMain();
}

function sdBackToMain(){
  _sdShowMain();
}

/* ── Advancement / Demotion Logic ── */
function _sdCheckAdvancement(r){
  var last5=r.history.slice(-5);
  var wins=0;
  last5.forEach(function(h){if(h.result==='win')wins++});
  if(wins>=3){
    if(r.stage<4){
      r.stage++;
    }else if(r.tier<9){
      r.tier++;
      r.stage=0;
    }
  }
}

function _sdCheckDemotion(r){
  var last5=r.history.slice(-5);
  var losses=0;
  last5.forEach(function(h){if(h.result==='lose')losses++});
  if(losses>=3){
    if(r.stage>0){
      r.stage--;
    }else if(r.tier>0){
      r.tier--;
      r.stage=4;
    }
  }
}

/* ── PK Mode (12×12) ── */
var _sdPKState=null;

function sdStartPK(){
  $('#sdBody').innerHTML='<div style="text-align:center;padding:40px"><div style="font-size:40px;animation:bob 1s infinite">⚔️</div><p style="color:var(--mut);margin-top:10px">正在生成 PK 題目並匹配玩家...</p></div>';
  fetch(SUDOKU_SERVER+'/sudoku?size=12')
    .then(function(r){return r.json()})
    .then(function(data){
      if(!data||!data.puzzle||!data.solution){
        $('#sdBody').innerHTML='<div style="text-align:center;padding:40px;color:var(--ff)">題目生成失敗</div>';
        return;
      }
      _sdPKSimulate(data);
    })
    .catch(function(e){
      $('#sdBody').innerHTML='<div style="text-align:center;padding:40px;color:var(--ff)">無法連線到數獨伺服器</div>';
    });
}

function _sdPKSimulate(data){
  var grid=data.puzzle.map(function(r){return r.slice()});
  var players=[];
  var botNames=['小明','阿華','小美','大雄','靜香','胖虎','小夫','櫻桃','紫蘭'];
  var used={};
  var uname='你';
  used[uname]=true;
  for(var i=0;i<9;i++){
    var nm=botNames[i];
    used[nm]=true;
    players.push({
      name:nm,
      progress:0,
      solved:false,
      finishTime:null,
      isBot:true
    });
  }
  players.push({name:uname,progress:0,solved:false,finishTime:null,isBot:false});
  _sdPKState={
    size:12,
    solution:data.solution,
    grid:grid,
    puzzle:data.puzzle,
    timeLimit:30*60,
    elapsed:0,
    timer:null,
    active:true,
    players:players,
    selectedCell:null,
    botInterval:null
  };
  _sdPKSimulateBots();
  _sdRenderPK();
}

function _sdPKSimulateBots(){
  var s=_sdPKState;if(!s)return;
  s.botInterval=setInterval(function(){
    if(!s||!s.active){clearInterval(s.botInterval);s.botInterval=null;return}
    s.players.forEach(function(p){
      if(!p.isBot||p.solved)return;
      var inc=Math.random()*1.5;
      p.progress=Math.min(100,p.progress+inc);
      if(p.progress>=100&&!p.solved){
        p.solved=true;
        p.finishTime=s.elapsed;
        p.progress=100;
      }
    });
    _sdUpdatePKLeaderboard();
  },2000);
}

function _sdRenderPK(){
  var s=_sdPKState;if(!s)return;
  var prog=_sdCountProgress(s.grid,s.size);
  var remain=Math.max(0,s.timeLimit-s.elapsed);
  var timeColor=remain<120000?'color:#ff4757':'';
  var html='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px">';
  html+='<div><span style="color:#ff6b6b">⚔️ PK 12×12</span> <span style="font-size:11px;color:var(--mut)">10 人對戰</span></div>';
  html+='<div class="sd-timer-val" style="font-size:18px;font-weight:bold;'+timeColor+'">'+_sdFormatTime(Math.ceil(remain/1000))+'</div>';
  html+='</div>';
  html+='<div style="display:flex;gap:12px;flex-wrap:wrap">';
  html+='<div style="flex:1;min-width:300px">';
  html+='<div style="overflow-x:auto">'+_sdGridHTML(s.grid,s.size)+'</div>';
  html+=_sdNumpadHTML(s.size);
  html+='<div style="text-align:center;margin-top:8px"><button class="btn" onclick="sdPKQuit()">退出</button></div>';
  html+='</div>';
  html+='<div style="width:220px;min-width:180px">';
  html+='<div style="font-size:13px;color:var(--mut);margin-bottom:6px"><b>即時排行榜</b></div>';
  html+='<div id="sdPKLeaderboard" style="font-size:12px"></div>';
  html+='</div>';
  html+='</div>';
  $('#sdBody').innerHTML=html;
  _sdBindGrid(s);
  _sdBindNumpad(s);
  _sdUpdatePKLeaderboard();
  if(!s.timer){
    s.timer=setInterval(function(){
      if(!s||!s.active)return;
      s.elapsed+=1000;
      if(s.elapsed>=s.timeLimit){
        _sdPKFinish();
        return;
      }
      var remain2=Math.max(0,s.timeLimit-s.elapsed);
      var el=$('#sdBody');if(!el)return;
      var timeEl=el.querySelector('.sd-timer-val');
      if(timeEl){
        timeEl.textContent=_sdFormatTime(Math.ceil(remain2/1000));
        if(remain2<120000)timeEl.style.color='#ff4757';
      }
    },1000);
  }
}

function _sdUpdatePKLeaderboard(){
  var s=_sdPKState;if(!s)return;
  var el=document.getElementById('sdPKLeaderboard');if(!el)return;
  var sorted=s.players.slice().sort(function(a,b){
    if(a.solved&&b.solved)return a.finishTime-b.finishTime;
    if(a.solved)return -1;
    if(b.solved)return 1;
    return b.progress-a.progress;
  });
  var html='';
  sorted.forEach(function(p,i){
    var name=p.isBot?p.name:'<b style="color:var(--gold)">'+p.name+'</b>';
    var status=p.solved?'✅ '+_sdFormatTime(Math.ceil(p.finishTime/1000)):'進度 '+Math.round(p.progress)+'%';
    var medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
    var rowColor=i<3?'color:var(--gold2)':'';
    html+='<div style="padding:4px 0;border-bottom:1px solid #222;'+rowColor+'">';
    html+=medal+(i+1)+'. '+name+' <span style="float:right;opacity:.7">'+status+'</span>';
    html+='</div>';
  });
  el.innerHTML=html;
}

function _sdPKFinish(){
  var s=_sdPKState;if(!s)return;
  s.active=false;
  if(s.timer){clearInterval(s.timer);s.timer=null}
  if(s.botInterval){clearInterval(s.botInterval);s.botInterval=null}
  var me=null;
  s.players.forEach(function(p){if(!p.isBot)me=p});
  var won=me&&me.solved;
  var elapsedStr=_sdFormatTime(Math.ceil(s.elapsed/1000));
  var r=_sdRanking();
  r.history.push({
    date:new Date().toLocaleDateString(),
    result:won?'win':'lose',
    time:elapsedStr,
    size:12,
    mode:'pk'
  });
  if(won){r.wins++;_sdCheckAdvancement(r)}
  else{r.losses++;_sdCheckDemotion(r)}
  _sdSaveRanking(r);
  _sdPKState=null;
  var sorted=s.players.slice().sort(function(a,b){
    if(a.solved&&b.solved)return a.finishTime-b.finishTime;
    if(a.solved)return -1;
    if(b.solved)return 1;
    return b.progress-a.progress;
  });
  var myRank=-1;
  sorted.forEach(function(p,i){if(!p.isBot)myRank=i+1});
  var html='<div style="text-align:center;padding:30px">';
  html+='<div style="font-size:48px;margin-bottom:10px">'+(won?'🏆':'😔')+'</div>';
  html+='<div style="font-size:20px;font-weight:bold;color:'+(won?'#2ed573':'#ff4757')+'">'+(won?'PK 勝利！':'PK 落敗')+'</div>';
  html+='<div style="color:var(--mut);margin:8px 0">第 '+myRank+' 名 / 10 人 · 用時 '+elapsedStr+'</div>';
  html+='<div class="panel2" style="margin:12px auto;max-width:400px">';
  html+='<div style="font-size:13px;color:var(--mut);margin-bottom:6px"><b>最終排名</b></div>';
  sorted.forEach(function(p,i){
    var medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
    var isMe=!p.isBot;
    var nm=isMe?'<b style="color:var(--gold)">你</b>':p.name;
    var st=p.solved?'✅ '+_sdFormatTime(Math.ceil(p.finishTime/1000)):'進度 '+Math.round(p.progress)+'%';
    html+='<div style="padding:3px 0;font-size:12px;'+(isMe?'color:var(--gold)':'')+'">'+medal+(i+1)+'. '+nm+' <span style="float:right;opacity:.7">'+st+'</span></div>';
  });
  html+='</div>';
  html+='<div style="margin:12px 0">'+_sdProgressHTML(r.tier,r.stage)+'</div>';
  html+='<button class="btn" onclick="sdBackToMain()" style="margin-top:10px">返回主頁</button>';
  html+='</div>';
  $('#sdBody').innerHTML=html;
}

function sdPKQuit(){
  if(_sdPKState){
    _sdPKState.active=false;
    if(_sdPKState.timer){clearInterval(_sdPKState.timer);_sdPKState.timer=null}
    if(_sdPKState.botInterval){clearInterval(_sdPKState.botInterval);_sdPKState.botInterval=null}
  }
  _sdPKState=null;
  _sdShowMain();
}

/* ── Styles ── */
(function(){
  if(document.getElementById('sdStyles'))return;
  var st=document.createElement('style');
  st.id='sdStyles';
  st.textContent=
    '.sd-grid td{width:32px;height:32px;text-align:center;vertical-align:middle;border:1px solid #444;font-size:16px;cursor:default;user-select:none}'+
    '.sd-grid td.sd-cell-editable{cursor:pointer;background:#1a1a2e}'+
    '.sd-grid td.sd-cell-editable:hover{background:#2a2a4e}'+
    '.sd-grid td.sd-cell-fixed{background:#111}'+
    '.sd-grid td.sd-selected{outline:2px solid var(--gold);outline-offset:-1px}'+
    '.sd-val{font-weight:bold;color:var(--gold)}'+
    '.sd-numpad .sd-num-btn{width:36px;height:36px;border:1px solid #444;border-radius:6px;background:#1a1a2e;color:#fff;font-size:14px;cursor:pointer;transition:all .15s}'+
    '.sd-numpad .sd-num-btn:hover{background:#333;border-color:#666}'+
    '.sd-numpad .sd-num-btn.sd-num-active{background:var(--gold);color:#000;border-color:var(--gold)}'+
    '@media(max-width:500px){.sd-grid td{width:26px;height:26px;font-size:13px}.sd-numpad .sd-num-btn{width:30px;height:30px;font-size:12px}}';
  document.head.appendChild(st);
})();
