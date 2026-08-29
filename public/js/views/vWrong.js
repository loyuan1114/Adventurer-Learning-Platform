/* vWrong — 錯題本 */
function vWrong(){
  var u=me(); if(!u) return;
  var g=u.g;
  var h=back()+'<h3 class="vt">❌ 錯題本 <span class="vsub">收集錯題・反覆練習・攻克弱點</span></h3>';

  var wrongs=g.wrongBook||[];
  var totalQ=wrongs.length;
  var mastered=wrongs.filter(function(w){return w.mastered}).length;
  var unmastered=totalQ-mastered;

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  h+='<b style="color:var(--gold2);font-size:15px">📊 錯題統計</b>';
  h+='<div style="display:flex;gap:8px">';
  h+='<div class="chip">📝 共 '+totalQ+' 題</div>';
  h+='<div class="chip">✅ 已掌握 '+mastered+'</div>';
  h+='<div class="chip" style="color:#ff8a80">❌ 未掌握 '+unmastered+'</div>';
  h+='</div></div>';

  if(totalQ>0){
    var pct=Math.round(mastered/totalQ*100);
    h+='<div style="background:rgba(0,0,0,.2);border-radius:8px;height:10px;margin-top:10px;overflow:hidden">';
    h+='<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#ff8a80,var(--green));border-radius:8px"></div></div>';
    h+='<div style="font-size:11px;color:var(--mut);margin-top:4px;text-align:right">掌握度 '+pct+'%</div>';
  }
  h+='</div>';

  h+='<div class="panel2" style="margin-top:12px"><b style="color:#ff9800;font-size:15px">📊 科目分布</b>';
  h+='<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">';
  var catCounts={math:0,english:0,science:0,social:0,general:0};
  wrongs.forEach(function(w){if(catCounts[w.cat]!==undefined)catCounts[w.cat]++});
  var catLabels={math:'🧮 數學',english:'🔤 英文',science:'🔬 自然',social:'🌏 社會',general:'📖 其他'};
  Object.keys(catLabels).forEach(function(c){
    h+='<div class="chip">'+catLabels[c]+': '+catCounts[c]+' 題</div>';
  });
  h+='</div></div>';

  h+='<div class="rwRow" style="margin-top:12px">';
  h+='<button class="rwChip" onclick="wrongFilter(\'all\')">全部 ('+totalQ+')</button>';
  h+='<button class="rwChip" onclick="wrongFilter(\'math\')">🧮 數學</button>';
  h+='<button class="rwChip" onclick="wrongFilter(\'english\')">🔤 英文</button>';
  h+='<button class="rwChip" onclick="wrongFilter(\'science\')">🔬 自然</button>';
  h+='<button class="rwChip" onclick="wrongFilter(\'social\')">🌏 社會</button>';
  h+='<button class="rwChip" onclick="wrongFilter(\'unmastered\')">❌ 未掌握</button>';
  h+='</div>';

  var filter=window._wrongFilter||'all';
  var filtered=wrongs;
  if(filter==='unmastered') filtered=wrongs.filter(function(w){return !w.mastered});
  else if(filter!=='all') filtered=wrongs.filter(function(w){return w.cat===filter});

  h+='<div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">';
  if(filtered.length){
    filtered.forEach(function(w,idx){
      var realIdx=wrongs.indexOf(w);
      var catIcon={math:'🧮',english:'🔤',science:'🔬',social:'🌏',general:'📖'}[w.cat]||'📝';
      var diffLabel={easy:'🌱 簡單',medium:'⚔️ 中等',hard:'🔥 困難'}[w.diff]||'⚔️ 中等';
      h+='<div class="panel2" style="position:relative;'+(w.mastered?'border-color:var(--green);background:rgba(76,175,80,.06)':'')+'">';
      if(w.mastered) h+='<div class="stockTag" style="background:var(--green)">✅ 已掌握</div>';
      h+='<div style="display:flex;gap:10px;align-items:flex-start">';
      h+='<div style="font-size:24px;flex-shrink:0">'+catIcon+'</div>';
      h+='<div style="flex:1;min-width:0">';
      h+='<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">';
      h+='<b style="font-family:var(--serif);color:var(--gold2);font-size:14px">'+esc(w.question||'未命名題目')+'</b>';
      h+='<span class="chip" style="font-size:10px">'+diffLabel+'</span>';
      h+='</div>';
      if(w.answer) h+='<div style="font-size:12px;color:var(--mut);margin-top:4px">正確答案：<b style="color:var(--green)">'+esc(w.answer)+'</b></div>';
      if(w.wrongAnswer) h+='<div style="font-size:12px;color:#ff8a80;margin-top:2px">你的答案：'+esc(w.wrongAnswer)+'</div>';
      if(w.explanation) h+='<div style="font-size:11px;color:var(--mut);margin-top:4px;background:rgba(255,255,255,.04);padding:6px 8px;border-radius:4px">💡 '+esc(w.explanation)+'</div>';
      h+='<div style="font-size:11px;color:var(--mut);margin-top:4px">錯過 '+w.wrongCount+' 次 ｜ 答對 '+(w.correctCount||0)+'/3 次 ｜ 上次：'+new Date(w.lastWrong).toLocaleDateString()+'</div>';
      h+='</div>';
      h+='<div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">';
      if(!w.mastered) h+='<button class="btn mini teal" onclick="wrongPractice('+realIdx+')">📝 再練一次</button>';
      h+='<button class="btn mini ghost" onclick="wrongDetail('+realIdx+')">📋 詳情</button>';
      if(!w.mastered) h+='<button class="btn mini" onclick="wrongMaster('+realIdx+')">✅ 標記掌握</button>';
      h+='</div></div></div>';
    });
  }else{
    h+='<div class="panel2 empty">🎉 '+(
      filter==='unmastered'?'太棒了！所有錯題都已掌握！':'還沒有錯題，繼續加油！'
    )+'</div>';
  }
  h+='</div>';

  h+='<div class="panel2" style="margin-top:14px"><b>📖 錯題練習模式</b><div class="skTxt" style="margin-top:6px">';
  h+='選擇「再練一次」系統會重新出同類型題目，答對 3 次即可標記為已掌握。定期複習錯題是提高成績的關鍵！</div>';
  h+='<button class="btn gold" style="margin-top:10px" onclick="wrongQuizMode()">🎯 進入錯題練習模式</button></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>💡 錯題小知識</b><div class="skTxt" style="margin-top:6px">';
  h+='研究表明：在錯誤後 24 小時內複習，記憶留存率提升 40%。建議每週至少複習一次錯題本，效果最佳！</div></div>';

  $('#view').innerHTML=h;
}

function wrongFilter(f){
  window._wrongFilter=f;
  vWrong();
}

function wrongPractice(idx){
  var u=me(); if(!u) return;
  var w=u.g.wrongBook[idx]; if(!w) return;
  var h='<div style="padding:10px">';
  h+='<div style="font-size:16px;font-weight:900;font-family:var(--serif);color:var(--gold2);margin-bottom:12px">📝 重新練習</div>';
  h+='<div class="panel2" style="margin-bottom:12px"><b style="font-size:14px">'+esc(w.question||'題目')+'</b></div>';
  var opts=w.options||['A. 選項一','B. 選項二','C. 選項三','D. 選項四'];
  h+='<div style="display:flex;flex-direction:column;gap:8px">';
  opts.forEach(function(o,i){
    h+='<button class="btn" onclick="wrongAnswer('+idx+',\''+esc(w.answer)+'\','+i+')" style="text-align:left;padding:12px">'+esc(o)+'</button>';
  });
  h+='</div></div>';
  openModal(h);
}

function wrongAnswer(idx,correct,chosen){
  var u=me(); if(!u) return;
  var w=u.g.wrongBook[idx]; if(!w) return;
  var opts=w.options||[];
  var chosenText=opts[chosen]||'';
  if(chosenText.indexOf(correct)>=0){
    w.correctCount=(w.correctCount||0)+1;
    if(w.correctCount>=3) w.mastered=true;
    toast('✅ 回答正確！（已答對 '+w.correctCount+'/3 次）');
  }else{
    w.wrongCount=(w.wrongCount||0)+1;
    toast('❌ 回答錯誤，再試試看！','bad');
  }
  w.lastWrong=Date.now();
  set(LS.users,get(LS.users,[]));
  closeModal();
  vWrong();
}

function wrongMaster(idx){
  var u=me(); if(!u) return;
  var w=u.g.wrongBook[idx]; if(!w) return;
  w.mastered=true;
  set(LS.users,get(LS.users,[]));
  toast('✅ 已標記為掌握');
  vWrong();
}

function wrongDetail(idx){
  var u=me(); if(!u) return;
  var w=u.g.wrongBook[idx]; if(!w) return;
  var h='<div style="padding:10px">';
  h+='<div style="font-size:16px;font-weight:900;font-family:var(--serif);color:var(--gold2);margin-bottom:12px">📋 題目詳情</div>';
  h+='<div class="panel2" style="margin-bottom:10px"><b>'+esc(w.question||'題目')+'</b></div>';
  if(w.explanation) h+='<div class="panel2" style="margin-bottom:10px;border-left:4px solid var(--teal)"><b style="color:var(--teal)">💡 解析</b><div class="skTxt" style="margin-top:4px">'+esc(w.explanation)+'</div></div>';
  h+='<div class="panel2" style="margin-bottom:10px">';
  h+='<div class="skTxt">正確答案：<b style="color:var(--green)">'+esc(w.answer||'-')+'</b></div>';
  h+='<div class="skTxt">你的答案：<b style="color:#ff8a80">'+esc(w.wrongAnswer||'-')+'</b></div>';
  h+='<div class="skTxt">錯過 '+w.wrongCount+' 次 ｜ 答對 '+(w.correctCount||0)+' 次</div>';
  h+='</div>';
  h+='<div class="mBtns"><button class="btn" onclick="closeModal()">關閉</button></div></div>';
  openModal(h);
}

function wrongQuizMode(){
  var u=me(); if(!u) return;
  var wrongs=(u.g.wrongBook||[]).filter(function(w){return !w.mastered});
  if(!wrongs.length) return toast('🎉 所有錯題都已掌握！','good');
  var w=wrongs[Math.floor(Math.random()*wrongs.length)];
  var idx=u.g.wrongBook.indexOf(w);
  toast('🎯 隨機抽取錯題');
  wrongPractice(idx);
}

function wrongAddWrong(question,answer,wrongAnswer,cat,diff,explanation){
  var u=me(); if(!u) return;
  u.g.wrongBook=u.g.wrongBook||[];
  var existing=u.g.wrongBook.find(function(w){return w.question===question});
  if(existing){
    existing.wrongCount=(existing.wrongCount||0)+1;
    existing.lastWrong=Date.now();
    existing.mastered=false;
  }else{
    u.g.wrongBook.push({
      question:question,answer:answer,wrongAnswer:wrongAnswer,
      cat:cat||'general',diff:diff||'medium',explanation:explanation||'',
      wrongCount:1,correctCount:0,mastered:false,
      createdAt:Date.now(),lastWrong:Date.now()
    });
  }
  set(LS.users,get(LS.users,[]));
}

function wrongClearMastered(){
  var u=me(); if(!u) return;
  var count=(u.g.wrongBook||[]).filter(function(w){return w.mastered}).length;
  if(!count) return toast('⚠️ 沒有已掌握的錯題','bad');
  if(!confirm('確定清除 '+count+' 道已掌握的錯題？')) return;
  u.g.wrongBook=(u.g.wrongBook||[]).filter(function(w){return !w.mastered});
  set(LS.users,get(LS.users,[]));
  toast('✅ 已清除 '+count+' 道錯題');
  vWrong();
}
window.vWrong=vWrong;
