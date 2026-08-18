/* ════════════════════════════════════════════
   vFindError — AI 找碴模式
   學生找出 AI 詳解中的錯誤，成功給予獎勵
   ════════════════════════════════════════════ */
let FE_STATE={q:null,phase:'LOADING',errorInfo:null,myGuess:''};

async function vFindError(){
  const u=me();if(!u||!u.g)return;
  const g=u.g;
  /* 初始化找碴統計 */
  if(!g.findError)g.findError={total:0,success:0,badges:[]};

  let h=back()+'<h3 class="vt">🔍 AI 找碴模式</h3>';
  h+='<div class="panel2" style="margin-bottom:12px;font-size:12px;color:var(--mut)">找出 AI 詳解中的錯誤，成功可獲得驗證點數和找碴徽章！</div>';

  /* 統計卡片 */
  h+='<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">';
  h+='<div class="panel2" style="padding:10px 16px;text-align:center"><div style="font-size:20px;font-weight:bold;color:var(--teal)">'+g.findError.total+'</div><div style="font-size:11px;color:var(--mut)">已挑戰</div></div>';
  h+='<div class="panel2" style="padding:10px 16px;text-align:center"><div style="font-size:20px;font-weight:bold;color:#4caf50">'+g.findError.success+'</div><div style="font-size:11px;color:var(--mut)">成功</div></div>';
  h+='<div class="panel2" style="padding:10px 16px;text-align:center"><div style="font-size:20px;font-weight:bold;color:#ff9800">'+(g.findError.total?Math.round(g.findError.success/g.findError.total*100):0)+'%</div><div style="font-size:11px;color:var(--mut)">成功率</div></div>';
  h+='</div>';

  /* 已獲得的徽章 */
  if(g.findError.badges&&g.findError.badges.length){
    h+='<div style="margin-bottom:14px"><b style="font-size:13px">🏅 已獲得徽章：</b> ';
    g.findError.badges.forEach(function(b){h+='<span style="background:var(--panel);padding:4px 8px;border-radius:6px;font-size:12px;margin:0 4px">'+b+'</span>'});
    h+='</div>';
  }

  if(FE_STATE.phase==='LOADING'){
    h+='<div style="text-align:center;padding:20px"><button class="btn big" onclick="loadFindErrorQuestion()">🎯 開始找碴</button></div>';
  }else if(FE_STATE.phase==='QUESTION'){
    const q=FE_STATE.q;
    h+='<div class="panel2" style="margin-bottom:12px;padding:14px;border-left:4px solid #ff9800">';
    h+='<div style="font-size:13px;color:var(--mut);margin-bottom:8px">📋 題目：</div>';
    h+='<div style="font-size:14px;margin-bottom:12px">'+esc(q.question_text)+'</div>';
    h+='<div style="font-size:13px;color:var(--mut);margin-bottom:6px">📝 AI 提供的詳解（其中包含 1 個錯誤）：</div>';
    h+='<div style="background:var(--panel);padding:12px;border-radius:8px;font-size:13px;white-space:pre-wrap;line-height:1.6">'+esc(q.wrong_explanation)+'</div>';
    h+='</div>';

    h+='<div class="panel2" style="padding:14px">';
    h+='<label class="mlab">🔍 你找到的錯誤是什麼？（請描述錯誤所在的步驟和錯誤內容）</label>';
    h+='<textarea id="feGuess" rows="4" placeholder="例：第 3 步的計算有問題，2+3 不等於 6..." style="width:100%;padding:8px;margin-top:6px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px;resize:vertical"></textarea>';
    h+='<div style="margin-top:10px;display:flex;gap:8px">';
    h+='<button class="btn big" onclick="submitFindError()">📤 提交找碴</button>';
    h+='<button class="btn ghost" onclick="FE_STATE.phase=\'LOADING\';vFindError()">🔄 換一題</button>';
    h+='</div></div>';
  }else if(FE_STATE.phase==='RESULT'){
    const correct=FE_STATE.correct;
    h+='<div class="panel2" style="padding:16px;text-align:center">';
    if(correct){
      h+='<div style="font-size:40px;margin-bottom:8px">🎉</div>';
      h+='<div style="font-size:18px;font-weight:bold;color:#4caf50;margin-bottom:8px">找碴成功！</div>';
      h+='<div style="font-size:13px;color:var(--mut);margin-bottom:12px">'+FE_STATE.feedback+'</div>';
      h+='<div style="font-size:12px">獲得：驗證點數 +5'+(FE_STATE.newBadge?' | 🏅 '+FE_STATE.newBadge:'')+'</div>';
    }else{
      h+='<div style="font-size:40px;margin-bottom:8px">😅</div>';
      h+='<div style="font-size:18px;font-weight:bold;color:#ff5722;margin-bottom:8px">再接再厲！</div>';
      h+='<div style="font-size:13px;color:var(--mut);margin-bottom:12px">'+FE_STATE.feedback+'</div>';
    }
    h+='<button class="btn big" onclick="FE_STATE.phase=\'LOADING\';vFindError()" style="margin-top:12px">🔄 再來一題</button>';
    h+='</div>';
  }

  $('#view').innerHTML=h;
}

async function loadFindErrorQuestion(){
  FE_STATE.phase='LOADING';
  vFindError();
  try{
    /* 從題庫隨機取一題 */
    const qbank=get('ADV9_QBANK',{questions:[]}).questions||[];
    if(!qbank.length){
      toast('題庫為空，請先匯入題目','bad');
      FE_STATE.phase='LOADING';
      return vFindError();
    }
    const q=qbank[Math.floor(Math.random()*qbank.length)];

    /* 呼叫 AI 生成含錯誤的詳解 */
    const prompt=SOCRATIC.findError
      .replace('{question}',q.question_text)
      .replace('{options}',(q.options||[]).join(', '))
      .replace('{answer}',String(q.answer))
      .replace('{explanation}',q.explanation||'無詳解');

    const raw=await callAIV2(prompt,'你是出題助手。');
    let errorInfo;
    try{
      errorInfo=JSON.parse(raw.replace(/^```json\s*/i,'').replace(/\s*```$/i,''));
    }catch(e){
      errorInfo={
        wrong_explanation:raw,
        error_location:'未知',
        error_type:'未知',
        error_description:'AI 生成的找碴題'
      };
    }

    FE_STATE.q={
      question_text:q.question_text,
      options:q.options,
      answer:q.answer,
      explanation:q.explanation,
      wrong_explanation:errorInfo.wrong_explanation||q.explanation,
      error_location:errorInfo.error_location,
      error_type:errorInfo.error_type,
      error_description:errorInfo.error_description
    };
    FE_STATE.errorInfo=errorInfo;
    FE_STATE.phase='QUESTION';
    vFindError();
  }catch(e){
    toast('生成找碴題失敗：'+e.message,'bad');
    FE_STATE.phase='LOADING';
    vFindError();
  }
}

function submitFindError(){
  const guess=($('#feGuess').value||'').trim();
  if(!guess)return toast('請先描述你找到的錯誤','bad');
  FE_STATE.myGuess=guess;

  const u=me(),g=u.g;
  g.findError=g.findError||{total:0,success:0,badges:[]};
  g.findError.total++;

  /* 簡單匹配：學生描述是否包含錯誤位置或錯誤類型的關鍵詞 */
  const errInfo=FE_STATE.errorInfo;
  const loc=String(errInfo.error_location||'').toLowerCase();
  const desc=(errInfo.error_description||'').toLowerCase();
  const type=(errInfo.error_type||'').toLowerCase();
  const guessLower=guess.toLowerCase();

  var matched=false;
  /* 檢查是否提到錯誤位置 */
  if(loc&&loc!=='未知'&&guessLower.indexOf(loc)>-1)matched=true;
  /* 檢查是否提到錯誤類型 */
  if(type&&type!=='未知'&&(guessLower.indexOf(type)>-1||guessLower.indexOf('錯誤')>-1))matched=true;
  /* 檢查是否提到錯誤描述的關鍵詞 */
  if(desc&&desc.length>2){
    var words=desc.split(/[\s,，、]+/);
    var matchCount=words.filter(function(w){return w.length>1&&guessLower.indexOf(w)>-1}).length;
    if(matchCount>=2)matched=true;
  }

  FE_STATE.correct=matched;
  if(matched){
    g.findError.success++;
    /* 獎勵 */
    g.gold=(g.gold||0)+50;
    /* 徽章系統 */
    var badges=g.findError.badges||[];
    var newBadge=null;
    if(g.findError.success>=1&&!badges.includes('🔍 初級找碴手')){
      badges.push('🔍 初級找碴手');newBadge='🔍 初級找碴手';
    }
    if(g.findError.success>=5&&!badges.includes('🔎 中級找碴手')){
      badges.push('🔎 中級找碴手');newBadge='🔎 中級找碴手';
    }
    if(g.findError.success>=15&&!badges.includes('🕵️ 高級找碴手')){
      badges.push('🕵️ 高級找碴手');newBadge='🕵️ 高級找碴手';
    }
    if(g.findError.success>=30&&!badges.includes('🏅 找碴大師')){
      badges.push('🏅 找碴大師');newBadge='🏅 找碴大師';
    }
    g.findError.badges=badges;
    FE_STATE.newBadge=newBadge;
    FE_STATE.feedback='你成功找到了詳解中的錯誤！獲得 50 金幣'+(newBadge?' 和新徽章：'+newBadge:'')+'。';
  }else{
    FE_STATE.feedback='這次的描述不夠準確。錯誤位置在第 '+FE_STATE.errorInfo.error_location+' 步，類型是：'+FE_STATE.errorInfo.error_type+'。再試試看！';
  }

  saveU(u);
  FE_STATE.phase='RESULT';
  vFindError();
}
