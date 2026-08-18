/* ════════════════════════════════════════════
   AI 蘇格拉底提示系統 + 安全過濾器
   — AI 不能直接給完整答案，只能引導
   ════════════════════════════════════════════ */

const SOCRATIC={
  /* 蘇格拉底提示模板 */
  hint:'你是一位蘇格拉底式導師。學生正在回答以下問題：\n\n【題目】{question}\n【學生答案】{student_answer}\n【正確答案】{correct_answer}\n\n規則：\n1. 絕對不可直接說出正確答案\n2. 只能用反問、提示、方向引導\n3. 幫助學生發現自己的錯誤\n4. 每次只給一個小提示\n5. 用友善鼓勵的語氣\n\n請根據學生的回答給予下一步引導提示。',

  findError:'你是「找碴模式」的 AI 出題者。請根據以下題目和詳解，故意在詳解中植入 1 個邏輯錯誤或計算錯誤。\n\n【題目】{question}\n【選項】{options}\n【正確答案】{answer}\n【原始詳解】{explanation}\n\n要求：\n1. 在詳解的某一步驟中植入錯誤（如計算錯、邏輯反轉、符號錯誤）\n2. 其餘步驟必須正確\n3. 錯誤必須是學生能發現的\n4. 輸出格式：{"wrong_explanation":"植入錯誤後的詳解","error_location":"錯誤所在的步驟編號(1-based)","error_type":"計算錯誤/邏輯錯誤/符號錯誤/單位錯誤","error_description":"錯誤的簡短說明"}',

  codeDebug:'你是一位程式除錯導師。學生的程式碼有問題，但你不能直接給出修正後的完整程式碼。\n\n【題目】{question}\n【語言】{language}\n【學生程式碼】{student_code}\n【執行結果】{result}\n\n規則：\n1. 不可直接給出完整的修正程式碼\n2. 只能指出問題所在的行數或區段\n3. 用反問引導學生思考\n4. 提供除錯方向而非答案\n5. 每次只提示一個問題',

  explanation:'你是解題說明助手。請根據以下題目生成詳細的解題步驟。\n\n【題目】{question}\n【選項】{options}\n【正確答案】{answer}\n\n要求：\n1. 逐步解釋每個步驟\n2. 說明為什麼其他選項是錯的\n3. 用學生能理解的語言\n4. 適當使用類比或例子',

  /* 安全過濾器：確保 AI 不直接給答案 */
  filterAnswer:function(text,correctAnswer){
    if(!text)return text;
    var lower=text.toLowerCase();
    var ansLower=(correctAnswer||'').toLowerCase();
    /* 檢測是否直接透露答案 */
    if(ansLower&&ansLower.length>0){
      var patterns=[
        '答案是','答案為','正確答案是','正確答案為','answer is','the answer',
        '所以選','因此選','故選','應該選','應該選擇','正確選項是'
      ];
      for(var i=0;i<patterns.length;i++){
        var idx=lower.indexOf(patterns[i]);
        if(idx>-1){
          /* 檢查答案是否在該句子附近 */
          var nearby=lower.substring(idx,idx+patterns[i].length+ansLower.length+20);
          if(nearby.indexOf(ansLower)>-1){
            /* 替換為安全提示 */
            return text.substring(0,idx)+'⚠️（AI 提示已過濾）'+text.substring(idx+patterns[i].length+ansLower.length+20);
          }
        }
      }
    }
    return text;
  }
};

/* 計算自主思考指數 */
function calcAutonomyScore(session){
  var score=50; /* 基礎分 */
  /* 專注時間加分 */
  if(session.focus_time_seconds>60)score+=10;
  if(session.focus_time_seconds>180)score+=10;
  /* 貼上行為扣分 */
  score-=Math.min(20,session.paste_count*5);
  score-=Math.min(10,session.long_paste_count*10);
  /* 修改次數加分（適度修改=思考） */
  if(session.edit_count>=3&&session.edit_count<=20)score+=10;
  /* 視窗切換扣分 */
  score-=Math.min(15,session.window_switch_count*3);
  /* 閒置時間扣分 */
  score-=Math.min(10,Math.floor(session.idle_time_seconds/30)*2);
  return Math.max(0,Math.min(100,score));
}
