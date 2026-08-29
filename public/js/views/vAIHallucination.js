/* ════════════════════════════════════════════
   vAIHallucination — AI 幻象破除模式
   找出 AI 導師解題步驟中的幻覺錯誤
   ════════════════════════════════════════════ */
function safeJson(r){return r.ok?r.json():r.text().then(function(t){throw new Error(t)})}
var HALL_STATE={q:null,phase:'IDLE',combo:0,streak:0,stats:null,steps:[],wrongIdx:-1,answered:false,round:0,baseAP:10,feedback:'',feedbackType:''};

var HALL_QUESTIONS=[
  {id:1,q:'25 × 4 = ?',correct:100,
   steps:[
     {text:'步驟 1：將 25 拆分為 20 + 5',correct:true},
     {text:'步驟 2：20 × 4 = 80',correct:true},
     {text:'步驟 3：5 × 4 = 15',correct:false,hint:'5 × 4 應等於 20，不是 15'},
     {text:'步驟 4：80 + 20 = 100',correct:true}
   ]},
  {id:2,q:'144 ÷ 12 = ?',correct:12,
   steps:[
     {text:'步驟 1：12 × 10 = 120',correct:true},
     {text:'步驟 2：144 - 120 = 24',correct:true},
     {text:'步驟 3：24 ÷ 12 = 3',correct:true},
     {text:'步驟 4：10 + 3 = 14',correct:false,hint:'10 + 3 應等於 13，不是 14'}
   ]},
  {id:3,q:'(-3) × (-7) = ?',correct:21,
   steps:[
     {text:'步驟 1：負負得正，結果為正數',correct:true},
     {text:'步驟 2：3 × 7 = 21',correct:true},
     {text:'步驟 3：所以 (-3) × (-7) = 24',correct:false,hint:'3 × 7 = 21，不是 24'},
     {text:'步驟 4：驗證：(-3)×(-7) = 21 ✓',correct:true}
   ]},
  {id:4,q:'2³ + 3² = ?',correct:17,
   steps:[
     {text:'步驟 1：2³ = 2 × 2 × 2 = 8',correct:true},
     {text:'步驟 2：3² = 3 × 3 = 9',correct:true},
     {text:'步驟 3：2³ = 2 × 3 = 6',correct:false,hint:'2³ 是 2×2×2=8，不是 2×3=6'},
     {text:'步驟 4：8 + 9 = 17',correct:true}
   ]},
  {id:5,q:'√169 + √25 = ?',correct:18,
   steps:[
     {text:'步驟 1：√169 = 13',correct:true},
     {text:'步驟 2：√25 = 4',correct:false,hint:'√25 應等於 5，不是 4'},
     {text:'步驟 3：13 + 5 = 18',correct:true},
     {text:'步驟 4：所以 √169 + √25 = 18',correct:true}
   ]},
  {id:6,q:'(1/2) + (1/3) = ?',correct:'5/6',
   steps:[
     {text:'步驟 1：找到公分母 6',correct:true},
     {text:'步驟 2：(1/2) = 3/6',correct:true},
     {text:'步驟 3：(1/3) = 2/5',correct:false,hint:'(1/3) 應等於 2/6，不是 2/5'},
     {text:'步驟 4：3/6 + 2/6 = 5/6',correct:true}
   ]},
  {id:7,q:'3x + 7 = 22，求 x = ?',correct:5,
   steps:[
     {text:'步驟 1：3x + 7 = 22',correct:true},
     {text:'步驟 2：3x = 22 - 7 = 15',correct:true},
     {text:'步驟 3：x = 15 × 3 = 45',correct:false,hint:'x = 15 ÷ 3 = 5，不是 15 × 3'},
     {text:'步驟 4：驗證：3(5)+7 = 22 ✓',correct:true}
   ]},
  {id:8,q:'15% of 200 = ?',correct:30,
   steps:[
     {text:'步驟 1：15% = 15/100 = 0.15',correct:true},
     {text:'步驟 2：200 × 0.15 = 25',correct:false,hint:'200 × 0.15 = 30，不是 25'},
     {text:'步驟 3：所以 15% of 200 = 30',correct:true},
     {text:'步驟 4：驗證：30/200 = 0.15 = 15% ✓',correct:true}
   ]},
  {id:9,q:'2x² - 8 = 0，求 x = ?',correct:2,
   steps:[
     {text:'步驟 1：2x² = 8',correct:true},
     {text:'步驟 2：x² = 8 ÷ 2 = 4',correct:true},
     {text:'步驟 3：x = √4 = 2',correct:true},
     {text:'步驟 4：x = √4 = 4',correct:false,hint:'√4 = 2，不是 4'}
   ]},
  {id:10,q:'(2 + 3)² = ?',correct:25,
   steps:[
     {text:'步驟 1：(2 + 3)² = 2² + 3²',correct:false,hint:'(a+b)² ≠ a²+b²，這是常見的幻覺錯誤！應展開為 a²+2ab+b²'},
     {text:'步驟 2：2² = 4',correct:true},
     {text:'步驟 3：3² = 9',correct:true},
     {text:'步驟 4：(2+3)² = 5² = 25',correct:true}
   ]},
  {id:11,q:'-5 - (-3) = ?',correct:-2,
   steps:[
     {text:'步驟 1：-5 - (-3) = -5 + 3',correct:true},
     {text:'步驟 2：負負得正，減去負數等於加上正數',correct:true},
     {text:'步驟 3：-5 + 3 = -8',correct:false,hint:'-5 + 3 = -2，不是 -8'},
     {text:'步驟 4：驗證：(-5)-(-3) = -5+3 = -2 ✓',correct:true}
   ]},
  {id:12,q:'5! = ?',correct:120,
   steps:[
     {text:'步驟 1：5! = 5 × 4 × 3 × 2 × 1',correct:true},
     {text:'步驟 2：5 × 4 = 20',correct:true},
     {text:'步驟 3：20 × 3 = 50',correct:false,hint:'20 × 3 = 60，不是 50'},
     {text:'步驟 4：60 × 2 × 1 = 120',correct:true}
   ]}
];

function hallGetStats(){
  var s=get('ADV9_HALLUCINATION_STATS',{total:0,correct:0,bestStreak:0,totalAP:0});
  return s;
}

function hallSaveStats(s){
  set('ADV9_HALLUCINATION_STATS',s);
}

function hallPickQuestion(){
  var used=get('ADV9_HALLUCINATION_USED',[]);
  var available=HALL_QUESTIONS.filter(function(q){return used.indexOf(q.id)<0});
  if(!available.length){set('ADV9_HALLUCINATION_USED',[]);available=HALL_QUESTIONS.slice()}
  var pick=available[Math.floor(Math.random()*available.length)];
  used.push(pick.id);
  if(used.length>HALL_QUESTIONS.length-2)set('ADV9_HALLUCINATION_USED',used);
  return pick;
}

function hallShuffleSteps(q){
  var steps=q.steps.map(function(s,i){return{idx:i,text:s.text,correct:s.correct,hint:s.hint||''}});
  for(var i=steps.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=steps[i];steps[i]=steps[j];steps[j]=t}
  return steps;
}

function hallEarnAP(amount){
  // AP is awarded server-side via game completion; just sync balance
  if(typeof fetchApBalance==='function')fetchApBalance();
  toast('+'+amount+' AP');
  return amount;
}

function hallShakeEl(el){
  if(!el)return;
  el.style.animation='none';
  el.offsetHeight;
  el.style.animation='hallShake .5s ease';
}

function hallFlashEl(el,color){
  if(!el)return;
  el.style.animation='none';
  el.offsetHeight;
  el.style.animation='hallFlash .6s ease';
  el.style.boxShadow='0 0 20px '+color;
  setTimeout(function(){el.style.boxShadow=''},800);
}

function hallCriticalAnim(){
  var overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML='<div style="font-size:60px;animation:hallCritPop .8s ease forwards">💥 CRIT!</div>';
  document.body.appendChild(overlay);
  setTimeout(function(){overlay.remove()},900);
}

function hallComboAnim(combo){
  var overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;top:20%;left:50%;transform:translateX(-50%);pointer-events:none;z-index:9999';
  overlay.innerHTML='<div style="font-size:36px;font-weight:900;color:var(--gold2);text-shadow:0 0 10px rgba(255,215,0,.8);animation:hallComboFloat 1s ease forwards">'+combo+'x COMBO!</div>';
  document.body.appendChild(overlay);
  setTimeout(function(){overlay.remove()},1100);
}

function vAIHallucination(){
  var u=me();if(!u||!u.g)return;
  var stats=hallGetStats();
  HALL_STATE.stats=stats;

  var accuracy=stats.total?Math.round(stats.correct/stats.total*100):0;
  var comboMultiplier=1+HALL_STATE.combo*0.5;
  if(comboMultiplier>4)comboMultiplier=4;

  var h=back();
  h+='<h3 class="vt">🤖 AI 幻象破除 <span class="vsub">找出 AI 導師的幻覺錯誤</span></h3>';

  /* CSS for animations */
  h+='<style>';
  h+='@keyframes hallShake{0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-4px)}20%,40%,60%,80%{transform:translateX(4px)}}';
  h+='@keyframes hallFlash{0%{box-shadow:0 0 0 0 var(--gold2)}100%{box-shadow:0 0 30px 10px transparent}}';
  h+='@keyframes hallCritPop{0%{transform:scale(0) rotate(-10deg);opacity:0}50%{transform:scale(1.3) rotate(5deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:0}}';
  h+='@keyframes hallComboFloat{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-60px);opacity:0}}';
  h+='@keyframes hallCorrectPulse{0%{box-shadow:0 0 0 0 rgba(76,175,80,.6)}100%{box-shadow:0 0 20px 5px rgba(76,175,80,0)}}';
  h+='@keyframes hallWrongPulse{0%{box-shadow:0 0 0 0 rgba(244,67,54,.6)}100%{box-shadow:0 0 20px 5px rgba(244,67,54,0)}}';
  h+='@keyframes hallMentorBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}';
  h+='@keyframes hallStepReveal{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}';
  h+='@keyframes hallProgressFill{0%{width:0}100%{width:var(--target-w)}}';
  h+='@keyframes hallAPFloat{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-40px);opacity:0}}';
  h+='</style>';

  /* Stats bar */
  h+='<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">';
  h+='<div class="panel2" style="padding:10px 14px;text-align:center;flex:1;min-width:80px">';
  h+='<div style="font-size:20px;font-weight:bold;color:var(--teal)">'+stats.total+'</div>';
  h+='<div style="font-size:11px;color:var(--mut)">已挑戰</div></div>';
  h+='<div class="panel2" style="padding:10px 14px;text-align:center;flex:1;min-width:80px">';
  h+='<div style="font-size:20px;font-weight:bold;color:#4caf50">'+accuracy+'%</div>';
  h+='<div style="font-size:11px;color:var(--mut)">正確率</div></div>';
  h+='<div class="panel2" style="padding:10px 14px;text-align:center;flex:1;min-width:80px">';
  h+='<div style="font-size:20px;font-weight:bold;color:var(--gold2)">'+HALL_STATE.combo+'</div>';
  h+='<div style="font-size:11px;color:var(--mut)">連擊</div></div>';
  h+='<div class="panel2" style="padding:10px 14px;text-align:center;flex:1;min-width:80px">';
  h+='<div style="font-size:20px;font-weight:bold;color:#ff9800">'+stats.bestStreak+'</div>';
  h+='<div style="font-size:11px;color:var(--mut)">最高連擊</div></div>';
  h+='</div>';

  /* Combo multiplier display */
  if(HALL_STATE.combo>0){
    h+='<div style="text-align:center;margin-bottom:10px;font-size:14px;color:var(--gold2);font-weight:bold">';
    h+='🔥 連擊加成 ×'+comboMultiplier.toFixed(1)+'（基礎 '+HALL_STATE.baseAP+' AP → '+Math.round(HALL_STATE.baseAP*comboMultiplier)+' AP）';
    h+='</div>';
  }

  /* AP display */
  var ap=u.g.ap||0;
  h+='<div class="panel2" style="margin-bottom:12px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center">';
  h+='<span style="font-size:13px">💎 AP 餘額：<b style="color:var(--teal)">'+ap+'</b></span>';
  h+='<span style="font-size:11px;color:var(--mut)">累計獲得 '+stats.totalAP+'</span>';
  h+='</div>';

  if(HALL_STATE.phase==='IDLE'){
    h+='<div style="text-align:center;padding:30px">';
    h+='<div style="font-size:64px;animation:hallMentorBounce 2s infinite">🤖</div>';
    h+='<div style="font-family:var(--serif);color:var(--gold2);font-size:20px;font-weight:bold;margin:12px 0">AI 幻象破除</div>';
    h+='<div style="font-size:13px;color:var(--mut);max-width:360px;margin:0 auto 16px">「AI 導師」會給出看似正確的解題步驟，但其中隐藏著一個邏輯錯誤。<br>找出那個錯誤的步驟，破除 AI 的幻覺！</div>';
    h+='<button class="btn big" onclick="hallStart()">🎯 開始破除幻象</button>';
    h+='</div>';

  }else if(HALL_STATE.phase==='PLAYING'&&HALL_STATE.q){
    var q=HALL_STATE.q;
    h+='<div class="panel2" style="margin-bottom:12px;padding:14px;border-left:4px solid #ff9800">';
    h+='<div style="font-size:12px;color:var(--mut);margin-bottom:6px">📋 題目（第 '+HALL_STATE.round+' 題）：</div>';
    h+='<div style="font-size:16px;font-weight:bold;color:var(--txt)">'+esc(q.q)+'</div>';
    h+='</div>';

    h+='<div style="margin-bottom:10px;font-size:13px;color:var(--mut)">🤖 AI 導師的解題過程（點擊錯誤的步驟）：</div>';

    HALL_STATE.steps.forEach(function(step,i){
      var border='3px solid var(--line)';
      var bg='var(--panel)';
      var cursor='pointer';
      var opacity='1';
      if(HALL_STATE.answered){
        cursor='default';
        if(step.correct===false&&i===HALL_STATE.wrongIdx){
          border='3px solid #f44336';
          bg='rgba(244,67,54,.1)';
        }else if(step.correct===true){
          opacity='0.6';
        }
      }
      h+='<div id="hallStep'+i+'" onclick="hallAnswerStep('+i+')" style="padding:12px 14px;margin-bottom:8px;background:'+bg+';border:'+border+';border-radius:8px;cursor:'+cursor+';opacity:'+opacity+';transition:all .3s;font-size:13px;line-height:1.5;display:flex;align-items:flex-start;gap:10px" onmouseover="if(!HALL_STATE.answered)this.style.borderColor=\'var(--gold2)\'" onmouseout="if(!HALL_STATE.answered&&this.style.borderColor!==\'var(--line)\')this.style.borderColor=\'var(--line)\'">';
      h+='<span style="font-size:16px;flex-shrink:0">'+String.fromCharCode(65+i)+'</span>';
      h+='<span>'+esc(step.text)+'</span>';
      h+='</div>';
    });

    if(HALL_STATE.answered){
      h+='<div id="hallFeedback" style="text-align:center;padding:12px;margin-top:8px;border-radius:8px;font-size:14px;font-weight:bold">';
      if(HALL_STATE.feedbackType==='correct'){
        h+='<span style="color:#4caf50">'+HALL_STATE.feedback+'</span>';
      }else{
        h+='<span style="color:#f44336">'+HALL_STATE.feedback+'</span>';
      }
      h+='</div>';
      h+='<div style="text-align:center;margin-top:12px">';
      h+='<button class="btn big" onclick="hallNext()">➡️ 下一題</button>';
      h+='</div>';
    }

  }else if(HALL_STATE.phase==='DONE'){
    var finalStats=hallGetStats();
    var finalAccuracy=finalStats.total?Math.round(finalStats.correct/finalStats.total*100):0;
    h+='<div style="text-align:center;padding:20px">';
    h+='<div style="font-size:60px">🎉</div>';
    h+='<div style="font-family:var(--serif);color:var(--gold2);font-size:22px;font-weight:bold;margin:12px 0">本輪結束！</div>';
    h+='<div style="display:flex;gap:12px;justify-content:center;margin:16px 0;flex-wrap:wrap">';
    h+='<div class="panel2" style="padding:12px 18px;text-align:center"><div style="font-size:24px;font-weight:bold;color:var(--teal)">'+HALL_STATE.round+'</div><div style="font-size:11px;color:var(--mut)">本輪題數</div></div>';
    h+='<div class="panel2" style="padding:12px 18px;text-align:center"><div style="font-size:24px;font-weight:bold;color:#4caf50">'+HALL_STATE.stats.correct+'</div><div style="font-size:11px;color:var(--mut)">總正確</div></div>';
    h+='<div class="panel2" style="padding:12px 18px;text-align:center"><div style="font-size:24px;font-weight:bold;color:var(--gold2)">'+finalAccuracy+'%</div><div style="font-size:11px;color:var(--mut)">正確率</div></div>';
    h+='</div>';
    h+='<button class="btn big" onclick="hallReset()" style="margin-top:12px">🔄 再來 5 題</button>';
    h+='</div>';
  }

  $('#view').innerHTML=h;
}

function hallStart(){
  HALL_STATE.phase='PLAYING';
  HALL_STATE.round=0;
  HALL_STATE.combo=0;
  HALL_STATE.streak=0;
  hallNextQuestion();
}

function hallNextQuestion(){
  var q=hallPickQuestion();
  HALL_STATE.q=q;
  HALL_STATE.steps=hallShuffleSteps(q);
  HALL_STATE.wrongIdx=-1;
  HALL_STATE.answered=false;
  HALL_STATE.feedback='';
  HALL_STATE.feedbackType='';
  HALL_STATE.round++;
  vAIHallucination();
}

function hallAnswerStep(idx){
  if(HALL_STATE.answered)return;
  HALL_STATE.answered=true;
  var step=HALL_STATE.steps[idx];
  var stats=hallGetStats();
  stats.total++;

  if(step.correct===false){
    /* Correct: found the wrong step */
    HALL_STATE.combo++;
    HALL_STATE.streak++;
    if(HALL_STATE.streak>stats.bestStreak)stats.bestStreak=HALL_STATE.streak;
    stats.correct++;

    var comboMultiplier=1+HALL_STATE.combo*0.5;
    if(comboMultiplier>4)comboMultiplier=4;
    var apEarned=Math.round(HALL_STATE.baseAP*comboMultiplier);
    var granted=hallEarnAP(apEarned);

    stats.totalAP+=granted||0;
    HALL_STATE.feedback='✅ 正確！你找到了幻覺錯誤！';
    if(granted)HALL_STATE.feedback+=' +'+granted+' AP';
    if(HALL_STATE.combo>=2)HALL_STATE.feedback+=' (×'+comboMultiplier.toFixed(1)+' 連擊加成)';
    HALL_STATE.feedbackType='correct';
    HALL_STATE.wrongIdx=idx;

    /* Visual feedback */
    var el=document.getElementById('hallStep'+idx);
    if(el){
      el.style.animation='hallCorrectPulse .8s ease';
      el.style.borderColor='#4caf50';
      el.style.background='rgba(76,175,80,.15)';
    }
    /* Show hint */
    if(step.hint){
      var hintEl=document.createElement('div');
      hintEl.style.cssText='padding:8px 12px;margin-top:6px;background:rgba(76,175,80,.1);border-left:3px solid #4caf50;border-radius:6px;font-size:12px;color:var(--mut)';
      hintEl.textContent='💡 '+step.hint;
      if(el)el.appendChild(hintEl);
    }

    /* Critical hit animation for streak >= 3 */
    if(HALL_STATE.combo>=3)hallCriticalAnim();
    /* Combo animation */
    if(HALL_STATE.combo>=2)hallComboAnim(HALL_STATE.combo);
    /* AP float animation */
    if(granted){
      var apFloat=document.createElement('div');
      apFloat.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:9999';
      apFloat.innerHTML='<div style="font-size:28px;font-weight:900;color:var(--teal);animation:hallAPFloat 1s ease forwards">+'+granted+' AP</div>';
      document.body.appendChild(apFloat);
      setTimeout(function(){apFloat.remove()},1100);
    }
  }else{
    /* Wrong: clicked a correct step */
    HALL_STATE.combo=0;
    HALL_STATE.streak=0;
    HALL_STATE.feedback='❌ 這是正確的步驟！AI 的幻覺還在隱藏中...';
    HALL_STATE.feedbackType='wrong';

    var el=document.getElementById('hallStep'+idx);
    if(el){
      el.style.animation='hallWrongPulse .8s ease';
      el.style.borderColor='#f44336';
      el.style.background='rgba(244,67,54,.1)';
    }
    /* Shake animation */
    hallShakeEl(el);

    /* Show correct wrong step */
    HALL_STATE.steps.forEach(function(s,i){
      if(s.correct===false){
        var correctEl=document.getElementById('hallStep'+i);
        if(correctEl){
          correctEl.style.borderColor='#ff9800';
          correctEl.style.background='rgba(255,152,0,.1)';
        }
      }
    });
    HALL_STATE.wrongIdx=HALL_STATE.steps.findIndex(function(s){return s.correct===false});
  }

  hallSaveStats(stats);
  HALL_STATE.stats=stats;

  /* Re-render to update stats display */
  setTimeout(function(){vAIHallucination()},300);
}

function hallNext(){
  if(HALL_STATE.round>=5){
    HALL_STATE.phase='DONE';
    vAIHallucination();
  }else{
    hallNextQuestion();
  }
}

function hallReset(){
  HALL_STATE.phase='IDLE';
  HALL_STATE.q=null;
  HALL_STATE.combo=0;
  HALL_STATE.streak=0;
  HALL_STATE.round=0;
  HALL_STATE.answered=false;
  HALL_STATE.steps=[];
  HALL_STATE.wrongIdx=-1;
  set('ADV9_HALLUCINATION_USED',[]);
  vAIHallucination();
}

window.vAIHallucination=vAIHallucination;
window.hallStart=hallStart;
window.hallAnswerStep=hallAnswerStep;
window.hallNext=hallNext;
window.hallReset=hallReset;
