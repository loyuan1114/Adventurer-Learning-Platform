/* ════════════════════════════════════════════
   vAiAudit 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：auditMetrics, auditFlags, vAiAudit
   ════════════════════════════════════════════ */
function auditMetrics(g){

const log=(g&&Array.isArray(g.answerLog))?g.answerLog:[];const n=log.length;

const done=log.filter(a=>a.sec!=null&&!isNaN(a.sec));

const avg=done.length?+(done.reduce((a,b)=>a+b.sec,0)/done.length).toFixed(1):null;

const fast=done.filter(a=>a.ok&&a.sec<=2).length; /* 答對但極快 */

const slow=done.filter(a=>a.sec>=90).length; /* 單題超過 90 秒 */

const mathNoProc=done.filter(a=>a.sub==='數學'&&a.ok&&!a.calc&&a.sec<=3).length; /* 數學答對、無計算過程、又很快 */

let earlyAcc=null,lateAcc=null,spike=0;

if(n>=10){const h=Math.floor(n/2);const e=log.slice(0,h),l=log.slice(h);

earlyAcc=Math.round(e.filter(a=>a.ok).length/e.length*100);lateAcc=Math.round(l.filter(a=>a.ok).length/l.length*100);spike=lateAcc-earlyAcc}

return{n,avg,fast,slow,mathNoProc,earlyAcc,lateAcc,spike}

}

function auditFlags(m){const f=[];

if(m.fast>=3)f.push({i:'⚡',t:'作答過快（'+m.fast+' 題答對且≤２秒）'});

if(m.mathNoProc>=3)f.push({i:'🤔',t:'數學無過程（'+m.mathNoProc+' 題答對但未用計算機且極快）'});

if(m.spike>=40)f.push({i:'📈',t:'正確率驟升（'+m.earlyAcc+'% → '+m.lateAcc+'%）'});

if(m.slow>=3)f.push({i:'🐢',t:'作答過慢（'+m.slow+' 題超過 90 秒）'});

return f}

function vAiAudit(){

const u=me();if(!u||u.role!=='teacher')return;const cls=u.managedClassIds||[];

if(!cls.length&&!u.isSchoolAdmin){$('#view').innerHTML='<h3 class="vt">🕵️ AI 學情稽核</h3><p class="empty">您尚未管理任何班級，請先到「班級管理」新增班級。</p>';return}

const students=get(LS.users,[]).filter(x=>x.role==='student'&&(cls.length?cls.includes(x.classId):true)&&x.g);

const rows=students.map(s=>({s,m:auditMetrics(s.g),f:[]}));rows.forEach(r=>r.f=auditFlags(r.m));

rows.sort((a,b)=>b.f.length-a.f.length);

const flagged=rows.filter(r=>r.f.length);

window._auditRows=rows;

$('#view').innerHTML='<h3 class="vt">🕵️ AI 學情稽核 <span class="vsub">偵測作答過快/過慢、無過程、正確率驟升等異常</span></h3>'+

'<div class="panel2" style="margin-bottom:12px;font-size:12.5px;color:var(--mut);border-left:4px solid var(--gold)">🔍 共 '+students.length+' 名學生，其中 <b style="color:#ff8a80">'+flagged.length+'</b> 名有異常信號。系統已自動初篩，可再點下方讓 AI 綜合研判。<br><span style="color:#ffb26b">⚠️ 異常信號僅供參考，不等於作弊，請結合實際情況判斷。</span></div>'+

'<div style="margin-bottom:12px"><button class="btn" onclick="auditAI()">🤖 讓 AI 綜合研判</button></div>'+

'<div id="auditAI"></div>'+

'<div class="alogGrid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">'+

(rows.length?rows.map((r,i)=>'<div class="alogCard '+(r.f.length?'no':'ok')+'" style="aspect-ratio:auto;cursor:pointer" onclick="stuDetail(\''+esc(r.s.id)+'\')">'+

'<div class="alogTop"><span class="rsBadge">'+(r.f.length?'⚠️ 需關注':'✅ 正常')+'</span><span class="alogTag">'+esc(r.s.classId||'—')+'</span><b style="color:var(--gold2)">'+esc(r.s.name)+'</b></div>'+

'<div style="font-size:12px;color:var(--mut);margin:8px 0">📝 '+r.m.n+' 筆紀錄｜平均 '+(r.m.avg!=null?r.m.avg+'s':'—')+(r.m.earlyAcc!=null?'｜正確率 '+r.m.earlyAcc+'%→'+r.m.lateAcc+'%':'')+'</div>'+

(r.f.length?'<div style="display:flex;flex-direction:column;gap:4px">'+r.f.map(x=>'<span style="font-size:12px;color:#ffb4ab">'+x.i+' '+x.t+'</span>').join('')+'</div>':'<div style="font-size:12px;color:var(--green)">無明顯異常</div>')+

'<div style="font-size:11px;color:var(--mut);margin-top:8px;text-align:right">點擊查看完整作答紀錄 →</div>'+

'</div>').join(''):'<p class="empty" style="grid-column:1/-1">尚無學生資料</p>')+'</div>';

}
