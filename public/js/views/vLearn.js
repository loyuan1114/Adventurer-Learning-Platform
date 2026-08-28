/* vLearn — 學習中心 */
function vLearn(){
  const u=me(), g=u.g;
  const subjects=[
    {id:'math',n:'數學',em:'🧮',color:'#e91e63',units:['數與量','幾何','代數','統計','機率']},
    {id:'chinese',n:'國文',em:'📖',color:'#ff9800',units:['文言文','現代文','寫作','語文常識','鑑賞賞析']},
    {id:'english',n:'英文',em:'🔤',color:'#2196f3',units:['單字','文法','閱讀','聽力','寫作']},
    {id:'science',n:'自然',em:'🔬',color:'#4caf50',units:['物理','化學','生物','地科','綜合']},
    {id:'social',n:'社會',em:'🌏',color:'#9c27b0',units:['歷史','地理','公民','經濟','社會議題']},
  ];
  let h=back()+'<h3 class="vt">📚 學習中心 <span class="vsub">選擇科目・單元複習・專項突破</span></h3>';
  h+='<div class="subjGrid" style="margin-top:8px">';
  subjects.forEach(s=>{
    const prog=g.subjProgress?.[s.id]||0;
    h+=`<button class="subjB" style="background:linear-gradient(135deg,${s.color},${shadeColor(s.color,-30)})" onclick="learnSubject('${s.id}')"><div class="fIco">${s.em}</div><b>${s.n}</b><div class="skTxt" style="margin-top:4px">進度：${prog}%</div></button>`;
  });
  h+='</div>';

  h+='<div class="panel2" style="margin-top:14px"><b>🎯 專項練習</b>';
  h+='<div class="rwRow"><button class="rwChip" onclick="learnMode(\'wrong\')">❌ 錯題重練</button><button class="rwChip" onclick="learnMode(\'weak\')">🎯 弱點強化</button><button class="rwChip" onclick="learnMode(\'exam\')">📝 會考模擬</button><button class="rwChip" onclick="learnMode(\'speed\')">⚡ 极速答題</button></div></div>';

  h+='<div class="panel2" style="margin-top:14px"><b>📊 學習統計</b>';
  const stats=g.learnStats||{todayQ:0,todayCorrect:0,totalQ:0,totalCorrect:0,streak:0};
  h+='<div class="statGrid" style="margin-top:8px">';
  h+=stat('今日題數',stats.todayQ);
  h+=stat('今日正確',stats.todayCorrect);
  h+=stat('正確率',stats.todayQ?Math.round(stats.todayCorrect/stats.todayQ*100)+'%':'0%');
  h+=stat('總題數',stats.totalQ);
  h+=stat('連續天數',stats.streak);
  h+=stat('總正確率',stats.totalQ?Math.round(stats.totalCorrect/stats.totalQ*100)+'%':'0%');
  h+='</div></div>';
  $('#view').innerHTML=h;
}
function learnSubject(id){
  const subjects={math:'數學',chinese:'國文',english:'英文',science:'自然',social:'社會'};
  toast(`📚 進入 ${subjects[id]} 專區…`); setTimeout(()=>{if(typeof tGo==='function') tGo('unitList')},500);
}
function learnMode(mode){
  const modes={wrong:'錯題重練',weak:'弱點強化',exam:'會考模擬',speed:'極速答題'};
  toast(`🎯 啟動 ${modes[mode]}…`); setTimeout(()=>{if(typeof tGo==='function') tGo('quiz')},500);
}
function shadeColor(c,p){const n=parseInt(c.slice(1),16),r=Math.max(0,Math.min(255,(n>>16)+p)),g=Math.max(0,Math.min(255,((n>>8)&255)+p)),b=Math.max(0,Math.min(255,(n&255)+p));return '#'+(1<<24|r<<16|g<<8|b).toString(16).slice(1)}
function stat(l,v){return `<div class="statIt"><span>${l}</span><b>${v}</b></div>`}