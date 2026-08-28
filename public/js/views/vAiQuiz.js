/* vAiQuiz — AI 出題練習 */
function vAiQuiz(){
  const u=me();
  let h=back()+'<h3 class="vt">🤖 AI 智能練習 <span class="vsub">AI 動態生成題目・適性難度・即時解析</span></h3>';
  h+='<div class="panel2" style="margin-bottom:12px"><b>🎯 選擇練習模式</b>';
  h+='<div class="rwRow" style="margin-top:8px">';
  h+='<button class="rwChip" onclick="aiQuizMode(\'adaptive\')">📈 適性練習</button>';
  h+='<button class="rwChip" onclick="aiQuizMode(\'weakness\')">🎯 弱點攻克</button>';
  h+='<button class="rwChip" onclick="aiQuizMode(\'exam\')">📝 會考模擬</button>';
  h+='<button class="rwChip" onclick="aiQuizMode(\'random\')">🎲 隨機挑戰</button>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-bottom:12px"><b>📚 科目選擇</b>';
  h+='<div class="subjGrid" style="margin-top:8px">';
  ['數學','國文','英文','自然','社會'].forEach(s=>{
    const icon={數學:'🧮',國文:'📖',英文:'🔤',自然:'🔬',社會:'🌏'}[s];
    h+=`<button class="subjB" style="background:linear-gradient(135deg,var(--${s}Color||'panel'},#1a2a4a)" onclick="aiQuizSubj('${s}')"><div class="fIco">${icon}</div><b>${s}</b></button>`;
  });
  h+='</div></div>';

  h+='<div class="panel2"><b>📜 近期練習紀錄</b>';
  const logs=get('ADV9_AIQUIZ_LOG',[]).slice(0,10);
  if(logs.length){
    h+='<div style="margin-top:8px">'+logs.map(l=>`<div class="chip">${l.subj} · ${l.mode} · ${l.score}分 · ${l.time}題 · ${new Date(l.ts).toLocaleString()}</div>`).join('')+'</div>';
  }else h+='<div class="empty">尚無練習紀錄</div>';
  h+='</div>';

  $('#view').innerHTML=h;
}
function aiQuizMode(m){
  const modes={adaptive:'適性練習',weakness:'弱點攻克',exam:'會考模擬',random:'隨機挑戰'};
  window._aiQuizMode=m;
  toast(`已選擇：${modes[m]}`);
}
function aiQuizSubj(s){
  if(!window._aiQuizMode) return toast('⚠️ 請先選擇練習模式','bad');
  toast(`🚀 啟動 ${s} ${window._aiQuizMode}…`);
  setTimeout(()=>{if(typeof tGo==='function') tGo('quiz')},500);
}