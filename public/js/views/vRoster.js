/* ════════════════════════════════════════════
   vRoster 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRoster
   ════════════════════════════════════════════ */
function vRoster(fGrade,fClass){

const all=get(LS.users,[]).filter(x=>x.role==='student');

fGrade=fGrade||'全部';fClass=fClass||'全部';

const gLabel=gr=>({'7':'七年級','8':'八年級','9':'九年級'}[gr]||(gr+' 年級'));

const gradeOf=c=>String(c||'').charAt(0)||'其他';

const grades=['全部'].concat([...new Set(all.map(s=>gradeOf(s.classId)))].sort());

/* 班級選單依已選年級而定 */

const clsPool=all.filter(s=>fGrade==='全部'||gradeOf(s.classId)===fGrade);

const classes=['全部'].concat([...new Set(clsPool.map(s=>s.classId||'—'))].sort());

if(fClass!=='全部'&&!classes.includes(fClass))fClass='全部';

const list=all.filter(s=>(fGrade==='全部'||gradeOf(s.classId)===fGrade)&&(fClass==='全部'||s.classId===fClass));

/* 依班級分組 */

const byCls={};list.forEach(s=>{const c=s.classId||'—';(byCls[c]=byCls[c]||[]).push(s)});

const clsKeys=Object.keys(byCls).sort();

const opt=(arr,cur)=>arr.map(x=>'<option value="'+esc(x)+'"'+(x===cur?' selected':'')+'>'+esc(x==='全部'?'全部':x)+'</option>').join('');

const gopt=grades.map(x=>'<option value="'+esc(x)+'"'+(x===fGrade?' selected':'')+'>'+esc(x==='全部'?'全部年級':gLabel(x))+'</option>').join('');

$('#view').innerHTML='<h3 class="vt">👥 學生名冊 <span class="vsub">依年級、班級分類｜共 '+all.length+' 人，篩選後 '+list.length+' 人</span></h3>'+

'<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;align-items:center">'+

'<label style="font-size:12.5px;color:var(--mut)">🎓 年級<select style="width:auto;margin-left:5px" onchange="vRoster(this.value,\'\')">'+gopt+'</select></label>'+

'<label style="font-size:12.5px;color:var(--mut)">🏫 班級<select style="width:auto;margin-left:5px" onchange="vRoster(\''+esc(fGrade)+'\',this.value)">'+opt(classes,fClass)+'</select></label></div>'+

(clsKeys.length?clsKeys.map(c=>{const arr=byCls[c].slice().sort((a,b)=>(b.g?power(b.g):0)-(a.g?power(a.g):0));

return '<div class="panel2" style="margin-bottom:12px"><b style="font-family:var(--serif);color:var(--gold2);font-size:15px">🏫 '+esc(c)+' 班 <span style="font-size:11.5px;color:var(--mut)">'+arr.length+' 人</span></b>'+

'<div class="tblWrap" style="margin-top:8px"><table><thead><tr><th>姓名</th><th>帳號</th><th>等級</th><th>⚡戰力</th><th>答對</th><th>🪙金幣</th></tr></thead><tbody>'+

arr.map(s=>{const g=s.g||{};return '<tr style="cursor:pointer" onclick="stuDetail(\''+esc(s.id)+'\')"><td>'+esc(s.name)+' 🔍</td><td>'+esc(s.username)+'</td><td>Lv.'+(g.lv||1)+'</td><td>'+(g?power(g):0)+'</td><td>'+((g.stats||{}).correct||0)+'</td><td>'+(g.gold||0)+'</td></tr>'}).join('')+

'</tbody></table></div></div>'}).join('')+'<p style="font-size:12px;color:var(--mut)">💡 點擊任一學生可查看其【作答過程與作答時間】</p>':'<p class="empty">此年級/班級尚無學生</p>');

}
