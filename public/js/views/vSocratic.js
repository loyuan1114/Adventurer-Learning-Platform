/* ════════════════════════════════════════════
   AI 蘇格拉底提示系統 v2
   管理員統一設定 + 安全過濾器 + 自主思考指數
   ════════════════════════════════════════════ */

/* 載入管理員設定的提示模板，若無則用預設 */
function getSocraticTemplates(){
  try{
    var custom=get('ADV9_SOCRATIC_TEMPLATES',null);
    if(custom&&typeof custom==='object')return custom;
  }catch(e){}
  return{
    hint:'你是一位蘇格拉底式導師。學生正在回答以下問題：\n\n【題目】{question}\n【學生答案】{student_answer}\n【正確答案】{correct_answer}\n\n規則：\n1. 絕對不可直接說出正確答案\n2. 只能用反問、提示、方向引導\n3. 幫助學生發現自己的錯誤\n4. 每次只給一個小提示\n5. 用友善鼓勵的語氣\n\n請根據學生的回答給予下一步引導提示。',
    findError:'你是「找碴模式」的 AI 出題者。請根據以下題目和詳解，故意在詳解中植入 1 個邏輯錯誤或計算錯誤。\n\n【題目】{question}\n【選項】{options}\n【正確答案】{answer}\n【原始詳解】{explanation}\n\n要求：\n1. 在詳解的某一步驟中植入錯誤（如計算錯、邏輯反轉、符號錯誤）\n2. 其餘步驟必須正確\n3. 錯誤必須是學生能發現的\n4. 輸出格式：{"wrong_explanation":"植入錯誤後的詳解","error_location":"錯誤所在的步驟編號(1-based)","error_type":"計算錯誤/邏輯錯誤/符號錯誤/單位錯誤","error_description":"錯誤的簡短說明"}',
    codeDebug:'你是一位程式除錯導師。學生的程式碼有問題，但你不能直接給出修正後的完整程式碼。\n\n【題目】{question}\n【語言】{language}\n【學生程式碼】{student_code}\n【執行結果】{result}\n\n規則：\n1. 不可直接給出完整的修正程式碼\n2. 只能指出問題所在的行數或區段\n3. 用反問引導學生思考\n4. 提供除錯方向而非答案\n5. 每次只提示一個問題',
    explanation:'你是解題說明助手。請根據以下題目生成詳細的解題步驟。\n\n【題目】{question}\n【選項】{options}\n【正確答案】{answer}\n\n要求：\n1. 逐步解釋每個步驟\n2. 說明為什麼其他選項是錯的\n3. 用學生能理解的語言\n4. 適當使用類比或例子'
  };
}

/* 安全過濾器：確保 AI 不直接給答案 */
function filterAiAnswer(text,correctAnswer){
  if(!text)return text;
  var lower=text.toLowerCase();
  var ansLower=(correctAnswer||'').toLowerCase();
  if(ansLower&&ansLower.length>0){
    var patterns=['答案是','答案為','正確答案是','正確答案為','answer is','the answer','所以選','因此選','故選','應該選','應該選擇','正確選項是'];
    for(var i=0;i<patterns.length;i++){
      var idx=lower.indexOf(patterns[i]);
      if(idx>-1){
        var end=idx+patterns[i].length+ansLower.length+20;
        var nearby=lower.substring(idx,Math.min(end,lower.length));
        if(nearby.indexOf(ansLower)>-1){
          return text.substring(0,idx)+'⚠️（AI 提示已過濾）'+text.substring(Math.min(end,text.length));
        }
      }
    }
  }
  return text;
}

/* 計算自主思考指數 */
function calcAutonomyScore(session){
  var score=50;
  if(session.focus_time_seconds>60)score+=10;
  if(session.focus_time_seconds>180)score+=10;
  score-=Math.min(20,session.paste_count*5);
  score-=Math.min(10,session.long_paste_count*10);
  if(session.edit_count>=3&&session.edit_count<=20)score+=10;
  score-=Math.min(15,session.window_switch_count*3);
  score-=Math.min(10,Math.floor(session.idle_time_seconds/30)*2);
  return Math.max(0,Math.min(100,score));
}

/* ═══ 管理員設定頁：統一設定蘇格拉底模板 ═══ */
function vSocraticAdmin(){
  var u=me();if(!u||u.role!=='admin')return toast('僅限管理員','bad');
  var tpl=getSocraticTemplates();

  let h=back()+'<h3 class="vt">🤖 蘇格拉底提示設定</h3>';
  h+='<div class="panel2" style="margin-bottom:12px;font-size:12px;color:var(--mut)">管理員可在此統一設定 AI 提示模板。模板中的 {question} {student_answer} {correct_answer} 等變數會自動替換。</div>';

  h+='<div class="panel2" style="padding:14px;margin-bottom:12px">';
  h+='<label class="mlab">💡 蘇格拉底提示模板</label>';
  h+='<textarea id="socHint" rows="8" style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:12px;resize:vertical;font-family:monospace">'+esc(tpl.hint)+'</textarea>';
  h+='</div>';

  h+='<div class="panel2" style="padding:14px;margin-bottom:12px">';
  h+='<label class="mlab">🔍 找碴模式模板</label>';
  h+='<textarea id="socFindError" rows="8" style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:12px;resize:vertical;font-family:monospace">'+esc(tpl.findError)+'</textarea>';
  h+='</div>';

  h+='<div class="panel2" style="padding:14px;margin-bottom:12px">';
  h+='<label class="mlab">🐛 程式除錯模板</label>';
  h+='<textarea id="socCodeDebug" rows="8" style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:12px;resize:vertical;font-family:monospace">'+esc(tpl.codeDebug)+'</textarea>';
  h+='</div>';

  h+='<div class="panel2" style="padding:14px;margin-bottom:12px">';
  h+='<label class="mlab">📖 詳解生成模板</label>';
  h+='<textarea id="socExplanation" rows="6" style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:12px;resize:vertical;font-family:monospace">'+esc(tpl.explanation)+'</textarea>';
  h+='</div>';

  h+='<button class="btn big" onclick="saveSocraticTemplates()">💾 儲存模板</button>';
  h+=' <button class="btn ghost" onclick="resetSocraticTemplates()">🔄 恢復預設</button>';

  $('#view').innerHTML=h;
}

function saveSocraticTemplates(){
  var tpl={
    hint:($('#socHint').value||'').trim(),
    findError:($('#socFindError').value||'').trim(),
    codeDebug:($('#socCodeDebug').value||'').trim(),
    explanation:($('#socExplanation').value||'').trim()
  };
  if(!tpl.hint)return toast('蘇格拉底提示模板不可為空','bad');
  set('ADV9_SOCRATIC_TEMPLATES',tpl);
  toast('✅ 模板已儲存');
  vSocraticAdmin();
}

function resetSocraticTemplates(){
  if(!confirm('確定恢復預設模板？'))return;
  try{localStorage.removeItem('ADV9_SOCRATIC_TEMPLATES')}catch(e){}
  toast('✅ 已恢復預設');
  vSocraticAdmin();
}
