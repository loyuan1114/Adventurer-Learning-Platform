/* ════════════════════════════════════════════
   vAiQuiz 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vAiQuiz
   ════════════════════════════════════════════ */
function vAiQuiz(){
const grades=['7上','7下','8上','8下','9上','9下'];
const subjects=Object.keys(SUBJ);
const firstSubj=subjects[0];
const firstGrade=grades[0];
const firstUnits=(SUBJ[firstSubj]&&SUBJ[firstSubj].u&&SUBJ[firstSubj].u[firstGrade])||[];
$('#view').innerHTML='<div style="max-width:800px;margin:0 auto;padding:20px">'+
'<div style="text-align:center;margin-bottom:24px">'+
'<div style="font-size:40px;margin-bottom:8px">🤖</div>'+
'<h2 style="color:var(--gold2);margin:0 0 6px">AI 智慧出題</h2>'+
'<p style="color:var(--mut);font-size:13px;margin:0">選擇年級、科目、單元，AI 自動生成高品質題目</p>'+
'</div>'+
'<div class="panel2" style="padding:16px;margin-bottom:16px">'+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
'<div><label style="font-size:12px;color:var(--mut);display:block;margin-bottom:4px">年級</label>'+
'<select id="aiGrade" onchange="updateAiUnits()" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--line);background:var(--bg2);color:var(--fg)">'+
grades.map(g=>'<option value="'+g+'">'+g+'</option>').join('')+'</select></div>'+
'<div><label style="font-size:12px;color:var(--mut);display:block;margin-bottom:4px">科目</label>'+
'<select id="aiSubject" onchange="updateAiUnits()" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--line);background:var(--bg2);color:var(--fg)">'+
subjects.map(s=>'<option value="'+s+'">'+s+'</option>').join('')+'</select></div>'+
'<div><label style="font-size:12px;color:var(--mut);display:block;margin-bottom:4px">單元</label>'+
'<select id="aiUnit" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--line);background:var(--bg2);color:var(--fg)">'+
firstUnits.map(u=>'<option value="'+u+'">'+u+'</option>').join('')+'</select></div>'+
'<div><label style="font-size:12px;color:var(--mut);display:block;margin-bottom:4px">難度</label>'+
'<select id="aiDiff" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--line);background:var(--bg2);color:var(--fg)">'+
'<option value="簡單">簡單</option><option value="中等" selected>中等</option><option value="困難">困難</option></select></div>'+
'<div><label style="font-size:12px;color:var(--mut);display:block;margin-bottom:4px">題目數量（可自由輸入 1~50）</label>'+
'<input id="aiCount" type="number" min="1" max="50" value="5" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--line);background:var(--bg2);color:var(--fg)"></div>'+
'</div>'+
'<button class="btn teal" onclick="aiGenQuiz()" style="width:100%;margin-top:14px;padding:10px;font-size:14px">🤖 AI 生成題目</button>'+
'</div>'+
'<div id="aiResults"></div>'+
'</div>';
}
