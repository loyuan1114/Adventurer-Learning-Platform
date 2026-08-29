/* ════════════════════════════════════════════
   vResult — 結果頁面
   測驗結果・成績統計・排行榜・歷史紀錄
   ════════════════════════════════════════════ */

function vResult(){
  var u=me();if(!u)return;
  var g=u.g;
  var h=back()+'<h3 class="vt">📊 結果頁面 <span class="vsub">測驗成績・統計分析・歷史紀錄</span></h3>';

  var quizLogs=g.quizLogs||[];
  var speedMatchLogs=g.speedMatchLogs||[];
  var allResults=quizLogs.concat(speedMatchLogs).sort(function(a,b){return(b.ts||0)-(a.ts||0)});

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">';
  h+='<div style="font-size:36px;animation:bob 2s infinite">📊</div>';
  h+='<div><b style="font-family:var(--serif);color:var(--gold2);font-size:16px;display:block">學習成果總覽</b>';
  h+='<div style="font-size:12px;color:var(--mut)">累計 '+allResults.length+' 次測驗紀錄</div></div>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--teal);font-size:14px">📈 數據統計</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-top:10px">';
  var totalCorrect=0,totalQ=0,totalScore=0;
  var quizCount=quizLogs.length;
  var pkCount=speedMatchLogs.length;
  var bestScore=0;
  var winCount=0;
  for(var i=0;i<quizLogs.length;i++){
    var ql=quizLogs[i];
    totalCorrect+=(ql.correct||0);
    totalQ+=(ql.total||0);
    totalScore+=(ql.score||0);
    if((ql.score||0)>bestScore)bestScore=ql.score||0;
  }
  for(var j=0;j<speedMatchLogs.length;j++){
    var sm=speedMatchLogs[j];
    totalScore+=(sm.score||0);
    if((sm.score||0)>bestScore)bestScore=sm.score||0;
    if(sm.win)winCount++;
  }
  var avgScore=quizCount>0?Math.round(totalScore/quizCount):0;
  var accuracy=totalQ>0?Math.round(totalCorrect/totalQ*100):0;

  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">📝</div><div style="font-size:20px;font-weight:900;color:var(--teal)">'+quizCount+'</div><div style="font-size:10px;color:var(--mut)">測驗次數</div></div>';
  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">✅</div><div style="font-size:20px;font-weight:900;color:#4caf50">'+accuracy+'%</div><div style="font-size:10px;color:var(--mut)">正確率</div></div>';
  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">⭐</div><div style="font-size:20px;font-weight:900;color:var(--gold2)">'+bestScore+'</div><div style="font-size:10px;color:var(--mut)">最高分</div></div>';
  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">📊</div><div style="font-size:20px;font-weight:900;color:#2196f3">'+avgScore+'</div><div style="font-size:10px;color:var(--mut)">平均分</div></div>';
  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">⚔️</div><div style="font-size:20px;font-weight:900;color:#e91e63">'+pkCount+'</div><div style="font-size:10px;color:var(--mut)">PK 次數</div></div>';
  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">🏆</div><div style="font-size:20px;font-weight:900;color:#ff9800">'+winCount+'</div><div style="font-size:10px;color:var(--mut)">PK 勝場</div></div>';
  h+='</div></div>';

  if(totalQ>0){
    h+='<div class="panel2" style="margin-top:12px">';
    h+='<b style="color:#ff9800;font-size:14px">📊 正確率分佈</b>';
    h+='<div style="margin-top:10px">';
    var ranges=[
      {label:'90-100%',min:90,max:100,color:'var(--teal)'},
      {label:'70-89%',min:70,max:89,color:'var(--gold2)'},
      {label:'50-69%',min:50,max:69,color:'#ff9800'},
      {label:'0-49%',min:0,max:49,color:'#f44336'}
    ];
    var rangeCounts=[0,0,0,0];
    for(var r=0;r<quizLogs.length;r++){
      var qlr=quizLogs[r];
      var qa=qlr.total>0?Math.round((qlr.correct||0)/qlr.total*100):0;
      if(qa>=90)rangeCounts[0]++;
      else if(qa>=70)rangeCounts[1]++;
      else if(qa>=50)rangeCounts[2]++;
      else rangeCounts[3]++;
    }
    for(var ri=0;ri<ranges.length;ri++){
      var rr=ranges[ri];
      var pct=quizCount>0?Math.round(rangeCounts[ri]/quizCount*100):0;
      h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
      h+='<span style="font-size:12px;color:var(--mut);min-width:70px">'+rr.label+'</span>';
      h+='<div style="flex:1;height:16px;background:#1a1a2e;border-radius:4px;overflow:hidden">';
      h+='<div style="height:100%;width:'+pct+'%;background:'+rr.color+';border-radius:4px;transition:width .5s"></div></div>';
      h+='<span style="font-size:11px;color:var(--mut);min-width:36px;text-align:right">'+rangeCounts[ri]+' 次</span>';
      h+='</div>';
    }
    h+='</div></div>';
  }

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center">';
  h+='<b style="color:var(--gold2);font-size:14px">📋 最近紀錄</b>';
  h+='<button class="btn ghost mini" onclick="resultClearHistory()">🗑️ 清除歷史</button>';
  h+='</div>';
  if(allResults.length){
    h+='<div style="max-height:400px;overflow-y:auto;margin-top:10px">';
    var display=allResults.slice(0,20);
    for(var d=0;d<display.length;d++){
      var res=display[d];
      var isQuiz=!!res.total;
      var isPK=!!res.mode;
      var score=res.score||0;
      var won=res.win||(isQuiz&&res.correct===res.total);
      var tagColor=won?'var(--teal)':'#ff9800';
      var tagText=isPK?(res.win?'🏆 勝':'💥 敗'):(isQuiz?((res.correct||0)+'/'+res.total):score+' 分');
      var modeLabel=isPK?'⚡ 速配PK':(res.mode||'📝 測驗');
      var time=res.ts?new Date(res.ts).toLocaleString('zh-TW'):'';

      h+='<div style="display:flex;align-items:center;gap:10px;padding:10px;margin-bottom:6px;background:rgba(0,0,0,.15);border-radius:8px;border-left:3px solid '+tagColor+'">';
      h+='<span style="font-size:20px">'+(won?'🎉':'📝')+'</span>';
      h+='<div style="flex:1">';
      h+='<div style="font-size:13px;font-weight:600;color:var(--txt)">'+modeLabel+'</div>';
      h+='<div style="font-size:11px;color:var(--mut)">'+time+'</div>';
      h+='</div>';
      h+='<div style="text-align:right">';
      h+='<div style="font-size:16px;font-weight:900;color:'+tagColor+'">'+tagText+'</div>';
      if(isQuiz&&res.correct!=null) h+='<div style="font-size:10px;color:var(--mut)">正確率 '+Math.round(res.correct/res.total*100)+'%</div>';
      h+='</div>';
      h+='</div>';
    }
    h+='</div>';
  }else{
    h+='<div class="empty" style="margin-top:10px;text-align:center;padding:20px">';
    h+='<div style="font-size:32px;opacity:.3">📊</div>';
    h+='<div style="font-size:13px;color:var(--mut);margin-top:8px">尚無測驗紀錄</div>';
    h+='<button class="btn ghost mini" style="margin-top:10px" onclick="vLearn()">📚 去學習賺經驗</button>';
    h+='</div>';
  }
  h+='</div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--purple);font-size:14px">🏅 成就里程碑</b>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">';
  var milestones=[
    {req:1,icon:'🌱',name:'初學者',desc:'完成第一次測驗',done:quizCount>=1},
    {req:5,icon:'📖',name:'勤學者',desc:'完成 5 次測驗',done:quizCount>=5},
    {req:10,icon:'🏅',name:'学习達人',desc:'完成 10 次測驗',done:quizCount>=10},
    {req:50,icon:'🏆',name:'測驗大師',desc:'完成 50 次測驗',done:quizCount>=50},
    {req:0,icon:'💯',name:'滿分達人',desc:'獲得一次滿分',done:quizLogs.some(function(q){return q.correct===q.total&&q.total>0})},
    {req:0,icon:'🔥',name:'連續答對',desc:'一次答對 10 題以上',done:quizLogs.some(function(q){return(q.correct||0)>=10})},
    {req:0,icon:'⚔️',name:'PK 新手',desc:'完成第一次 PK',done:pkCount>=1},
    {req:0,icon:'👑',name:'PK 冠軍',desc:'PK 獲勝 5 次',done:winCount>=5}
  ];
  for(var m=0;m<milestones.length;m++){
    var ms=milestones[m];
    h+='<div style="padding:8px 12px;background:'+(ms.done?'rgba(76,175,80,.1)':'#111')+';border:1px solid '+(ms.done?'#4caf50':'#333')+';border-radius:8px;min-width:100px;text-align:center;opacity:'+(ms.done?1:0.5)+'">';
    h+='<div style="font-size:20px">'+ms.icon+'</div>';
    h+='<div style="font-size:11px;font-weight:700;color:'+(ms.done?'var(--teal)':'var(--mut)')+'">'+ms.name+'</div>';
    h+='<div style="font-size:9px;color:var(--mut)">'+ms.desc+'</div>';
    if(ms.done) h+='<div style="font-size:9px;color:#4caf50;margin-top:2px">✅ 已達成</div>';
    h+='</div>';
  }
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px;padding:10px;border-left:4px solid #2196f3">';
  h+='<div style="font-size:12px;color:var(--mut)">💡 持續學習可以提升等級和獲得更多獎勵。每次測驗都會記錄你的表現，努力達成更多里程碑吧！</div>';
  h+='</div>';

  $('#view').innerHTML=h;
}

function resultClearHistory(){
  if(!confirm('確定要清除所有測驗歷史紀錄嗎？此操作不可復原。'))return;
  var u=me();if(!u)return;
  u.g.quizLogs=[];
  u.g.speedMatchLogs=[];
  set(LS.users,get(LS.users,[]));
  toast('🗑️ 歷史紀錄已清除');
  vResult();
}

function resultDetail(idx){
  var u=me();if(!u)return;
  var g=u.g;
  var allResults=(g.quizLogs||[]).concat(g.speedMatchLogs||[]).sort(function(a,b){return(b.ts||0)-(a.ts||0)});
  var res=allResults[idx];
  if(!res){toast('找不到紀錄','bad');return}
  var isQuiz=!!res.total;
  var h='<div style="padding:16px">';
  h+='<h4 style="margin-bottom:10px">📝 測驗詳情</h4>';
  h+='<div class="panel2" style="padding:12px">';
  h+='<div style="display:flex;justify-content:space-between;margin-bottom:8px">';
  h+='<span style="color:var(--mut)">'+(res.ts?new Date(res.ts).toLocaleString('zh-TW'):'')+'</span>';
  h+='<span style="color:var(--gold2);font-weight:700">'+(res.score||0)+' 分</span></div>';
  if(isQuiz){
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">';
    h+='<div style="text-align:center;padding:8px;background:#1a1a2e;border-radius:6px"><div style="font-size:14px;font-weight:900;color:#4caf50">'+(res.correct||0)+'</div><div style="font-size:10px;color:var(--mut)">答對</div></div>';
    h+='<div style="text-align:center;padding:8px;background:#1a1a2e;border-radius:6px"><div style="font-size:14px;font-weight:900;color:#f44336">'+((res.total||0)-(res.correct||0))+'</div><div style="font-size:10px;color:var(--mut)">答錯</div></div>';
    h+='</div>';
    h+='<div style="margin-top:8px;font-size:12px;color:var(--mut)">正確率：'+Math.round((res.correct||0)/(res.total||1)*100)+'%</div>';
  }
  h+='</div></div>';
  openModal(h);
}

function resultExportCSV(){
  var u=me();if(!u)return;
  var g=u.g;
  var logs=g.quizLogs||[];
  if(!logs.length){toast('無可匯出的紀錄','bad');return}
  var csv='日期,模式,正確數,總題數,正確率,得分\n';
  for(var i=0;i<logs.length;i++){
    var l=logs[i];
    var acc=l.total>0?Math.round(l.correct/l.total*100):0;
    csv+=(l.date||'')+',測驗,'+(l.correct||0)+','+(l.total||0)+','+acc+'%,'+(l.score||0)+'\n';
  }
  var blob=new Blob([csv],{type:'text/csv'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  a.download='quiz_results_'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast('📥 已匯出 CSV 檔案');
}

function resultShareBest(){
  var u=me();if(!u)return;
  var g=u.g;
  var logs=g.quizLogs||[];
  var best=0;
  for(var i=0;i<logs.length;i++){
    if((logs[i].score||0)>best)best=logs[i].score||0;
  }
  var msg='我在學習平台的最高測驗分數是 '+best+' 分！Lv.'+(g.lv||1)+' '+titleOf(g.lv||1)+' #冒險者學習平台';
  try{
    if(navigator.share){
      navigator.share({title:'學習成績',text:msg});
    }else{
      navigator.clipboard.writeText(msg);
      toast('📋 已複製分享訊息');
    }
  }catch(e){
    toast('📊 最高分：'+best+' 分');
  }
}
window.vResult=vResult;
