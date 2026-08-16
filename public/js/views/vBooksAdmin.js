/* ════════════════════════════════════════════
   vBooksAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBooksAdmin
   ════════════════════════════════════════════ */
function vBooksAdmin(){

const books=get(LS.books,[]);const subjs=Object.keys(SUBJ);

$('#view').innerHTML='<h3 class="vt">📚 課本網址 <span class="vsub">共 '+books.length+' 筆｜學生端「📚 課本講解」可點進去看</span></h3>'+

'<div class="panel2" style="margin-bottom:14px"><b style="color:var(--gold2)">➕ 新增連結</b>'+

'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center">'+

'<select id="bkPub" style="width:auto">'+['南一','翰林','康軒','其他'].map(p=>'<option>'+p+'</option>').join('')+'</select>'+

'<select id="bkType" style="width:auto"><option>課本講解</option><option>課外考卷</option></select>'+

'<select id="bkSubj" style="width:auto"><option value="">（不分科）</option>'+subjs.map(s=>'<option>'+s+'</option>').join('')+'</select>'+

'<input id="bkTitle" placeholder="標題（如：第一課 整數運算）" style="width:200px">'+

'<input id="bkUrl" placeholder="https://網址" style="width:260px">'+

'<button class="btn teal" onclick="adminAddBook()">新增</button></div></div>'+

(books.length?['南一','翰林','康軒','其他'].filter(p=>books.some(b=>b.publisher===p)).map(p=>'<div class="panel2" style="margin-bottom:10px"><b style="color:var(--gold2)">📘 '+p+'</b>'+

books.filter(b=>b.publisher===p).map(b=>'<div class="frIt" style="padding:6px 0;border-bottom:1px solid var(--line)"><b style="flex:1;font-size:13px">'+(b.type==='課本講解'?'📖':'📝')+' '+(b.subject?'['+esc(b.subject)+'] ':'')+esc(b.title)+' <span style="color:var(--mut);font-size:11px">'+esc((b.url||'').slice(0,40))+'…</span></b>'+

'<a href="'+encodeURI(b.url)+'" target="_blank" class="btn ghost mini">🔗 預覽</a><button class="btn danger mini" onclick="adminDelBook(\''+b.id+'\')">🗑</button></div>').join('')+'</div>').join(''):'<p class="empty">尚未新增任何連結</p>');

}
