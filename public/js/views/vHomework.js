/* ════════════════════════════════════════════
   vHomework 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vHomework, hwForStudent
   ════════════════════════════════════════════ */
function vHomework(){

const u=me();const hws=get(LS.hw,[]).filter(h=>hwForStudent(h,u));

const subs=get(LS.sub,[]);

$('#view').innerHTML=back()+'<h3 class="vt">📚 班級作業 <span class="vsub">班級：'+(u.classId||'無')+'</span></h3>'+

(hws.length?hws.map(h=>{

const my=subs.find(s=>s.hwId===h.id&&s.studentId===u.id);

const overdue=Date.now()>h.deadline;

return '<div class="panel2" style="margin-bottom:10px"><b style="font-family:var(--serif);font-size:15.5px;color:var(--gold2)">'+esc(h.title)+'</b>'+

'<div style="font-size:12px;color:var(--mut);margin:4px 0">截止：'+fmt(h.deadline)+(overdue?' <span style="color:#ff8a80">（已截止）</span>':'')+'｜總分：'+h.totalPts+' 分｜題目：'+h.questions.length+' 題'+(h.pdf?'｜📎 '+esc(h.pdf.name):'')+'</div>'+

'<p style="font-size:13px;color:var(--txt)">'+esc(h.desc||'')+'</p>'+

'<div style="margin-top:8px">'+

(my?(my.score!=null?'<b style="color:var(--green)">✅ 已批改：'+my.score+' 分</b> <button class="btn ghost mini" onclick="hwViewGrade(\''+h.id+'\')">查看批改與評語</button>'

:'<b style="color:var(--teal)">⏳ 已提交，等待批改</b>')

:overdue?'<span style="color:var(--mut)">❌ 已截止，無法提交</span>'

:'<button class="btn mini" onclick="hwDo(\''+h.id+'\')">✏️ 開始作答'+(h.pdf?'（含 PDF 教材）':'')+'</button>')+

'</div></div>'}).join('')

:'<p class="empty">目前沒有作業</p>');

}

function hwForStudent(h,u){return h.classId===u.classId||(hwGrades(h.classId)&&hwGrades(h.classId).indexOf(String(u.classId||'')[0])>-1)}
