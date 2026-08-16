/* ════════════════════════════════════════════
   vReady 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 4 個單位：deTex, parseAiQuestions, vReady, aiRecentPromptBlock
   ════════════════════════════════════════════ */
function deTex(s){if(typeof s!=='string')return s;let t=s;
t=t.replace(/\\\\(?=[A-Za-z])/g,'\\'); /* JSON 雙反斜線形式（\\\\times）先歸一為單反斜線 */
t=t.replace(/\\left|\\right/g,'');
t=t.replace(/\\text\{([^{}]*)\}/g,'$1');
t=t.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g,'($1)/($2)');
t=t.replace(/\frac\{([^{}]*)\}\{([^{}]*)\}/g,'($1)/($2)');
t=t.replace(/\\sqrt\{([^{}]*)\}/g,'√($1)');
t=t.replace(/\\times/g,'×');
t=t.replace(/\times/g,'×');
t=t.replace(/\\div/g,'÷').replace(/\\cdot/g,'·').replace(/\\pm/g,'±');
t=t.replace(/\\neq/g,'≠');
t=t.replace(/\neq/g,'≠');
t=t.replace(/\\leq?/g,'≤').replace(/\\geq?/g,'≥');
t=t.replace(/\\pi/g,'π').replace(/\\degree/g,'°').replace(/\^\{?\\circ\}?/g,'°');
t=t.replace(/\^\{([^{}]*)\}/g,'^($1)');
t=t.replace(/\\%/g,'%').replace(/\\,|\\;|\\ /g,' ');
t=t.replace(/\$\$?/g,'');
return t}

function parseAiQuestions(text,subject){let cleaned=text.trim();cleaned=cleaned.replace(/```json\s*/gi,'').replace(/```\s*/g,'');cleaned=deTex(cleaned);/* 先轉換 LaTeX，避免 \\times 等被 JSON 轉義成亂碼 */const arrMatch=cleaned.match(/\[[\s\S]*\]/);if(!arrMatch)throw new Error('無法解析 AI 回應，請重試');let questions;try{questions=JSON.parse(arrMatch[0])}catch{throw new Error('JSON 解析失敗，請重試')}if(!Array.isArray(questions))throw new Error('回應格式錯誤');const badWords=['圖','照片','圖片','圖像','如圖','下圖','附圖','看圖'];const listenWords=['聽力','聽','錄音','播放','audio','listening','請聽'];questions=questions.filter(q=>{if(!q['題目']||!q['選項']||!Array.isArray(q['選項'])||q['選項'].length!==4)return false;if(typeof q['答案']!=='number'||q['答案']<0||q['答案']>3)return false;const all=q['題目']+' '+q['選項'].join(' ');for(const w of badWords){if(all.includes(w))return false}for(const w of listenWords){if(all.toLowerCase().includes(w.toLowerCase()))return false}/* 所有科目一律過濾照片與聽力題 */return true});questions.forEach(q=>{q['題目']=deTex(q['題目']);q['選項']=q['選項'].map(deTex);if(q['解析'])q['解析']=deTex(q['解析'])});/* 解析後再清一次殘留符號 */return questions}

function vReady(sem,unit){

Quiz.sem=sem;Quiz.unit=unit;const g=me().g,md=maxDiff(g);

$('#view').innerHTML=back('vUnitList(\''+Quiz.subj+'\')')+

'<h3 class="vt">'+SUBJ[Quiz.subj].i+' '+Quiz.subj+'｜'+sem+'｜'+unit+' <span class="vsub">出發設定</span></h3>'+

'<div class="panel2"><b style="color:var(--teal)">📖 版本</b><div style="display:flex;gap:14px;margin:8px 0">'+

['康軒版','翰林版','南一版'].map((p,i)=>'<label style="font-size:13px;cursor:pointer"><input type="radio" name="pub" value="'+p+'" '+(i===0?'checked':'')+' style="width:auto"> '+p+'</label>').join('')+'</div>'+

'<b style="color:var(--teal)">🎯 難度（1~'+md+'）</b>'+

'<div style="display:flex;gap:12px;align-items:center;margin:8px 0"><input type="range" id="diffS" min="1" max="'+md+'" value="'+Math.min(50,md)+'" oninput="diffChg()" style="flex:1">'+

'<b id="diffL" style="color:var(--gold2);min-width:130px"></b></div>'+

'<div id="diffD" style="font-size:12px;color:var(--mut)"></div><div id="diffR" style="font-size:12px;color:var(--green);margin-top:4px"></div>'+

'<button class="btn big" style="font-size:18px;padding:16px;margin-top:12px" onclick="startQuiz()">⚔️ 開始答題</button></div>';

diffChg();

}

function aiRecentPromptBlock(recent){return recent&&recent.length?('8. 下列是最近已出過的題目，絕對禁止與其完全相同、僅改數字或僅換人名：\n'+recent.map((r,i)=>(i+1)+'. '+r).join('\n')+'\n9. 請刻意使用與上述範例完全不同的數字組合、情境與題型（若題目型態一直相同，請換一種問法）\n10. 本次出題隨機碼：'+Math.random().toString(36).slice(2,9)+'，每題必須是全新題目\n\nJSON 格式：[{"題目":"...","選項":["A","B","C","D"],"答案":0,"解析":"..."}]'):('8. 必須是全新題目，不可與常見模板完全相同或僅改數字\n9. 本次出題隨機碼：'+Math.random().toString(36).slice(2,9)+'，請從不同角度、數字、情境出題\n\nJSON 格式：[{"題目":"...","選項":["A","B","C","D"],"答案":0,"解析":"..."}]')}
