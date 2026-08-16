/* ════════════════════════════════════════════
   vLearn 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLearn
   ════════════════════════════════════════════ */
function vLearn(){

const books=get(LS.books,[]);

const pubs=['南一','翰林','康軒','其他'];

$('#view').innerHTML=back()+'<h3 class="vt">📚 課本講解 <span class="vsub">115 年南一/翰林課本・課外考卷解析</span></h3>'+

(!books.length?'<p class="empty">目前尚未新增課本/考卷連結，請管理員到後台「📚 課本網址」新增。</p>':

pubs.filter(p=>books.some(b=>b.publisher===p)).map(p=>{

const list=books.filter(b=>b.publisher===p);

const byType=t=>list.filter(b=>b.type===t);

return '<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2);font-family:var(--serif);font-size:16px">📘 '+p+'</b>'+

['課本講解','課外考卷'].filter(t=>byType(t).length).map(t=>

'<div style="margin-top:8px"><div style="font-size:12.5px;color:var(--teal);margin-bottom:5px">'+(t==='課本講解'?'📖':'📝')+' '+t+'</div><div style="display:flex;flex-wrap:wrap;gap:8px">'+

byType(t).map(b=>'<button class="btn ghost mini" onclick="openLearnUrl(\''+b.id+'\')">'+(b.subject?'['+esc(b.subject)+'] ':'')+esc(b.title)+' ▶</button>').join('')+'</div></div>').join('')+'</div>'}).join(''));

}
