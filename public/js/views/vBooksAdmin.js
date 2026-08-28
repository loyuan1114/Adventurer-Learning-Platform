/* vBooksAdmin — 圖書/教材管理後台 */
function vBooksAdmin(){
  if(!(typeof IS_ADMIN==='function'&&IS_ADMIN())) return toast('⚠️ 僅管理員可進入','bad');
  const books=get(LS.books,[]);
  let h=back()+'<h3 class="vt">📚 教材圖書管理 <span class="vsub">上傳・分類・審核・下架</span></h3>';
  h+='<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2)">➕ 新增教材</b>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">';
  h+='<input id="bkTitle" placeholder="書名/標題">';
  h+='<select id="bkCat"><option value="textbook">📖 教科書</option><option value="workbook">📝 習作</option><option value="reference">📚 參考書</option><option value="novel">📕 小說</option><option value="other">📦 其他</option></select>';
  h+='</div>';
  h+='<input id="bkAuthor" placeholder="作者" style="margin-top:8px">';
  h+='<input id="bkCover" placeholder="封面圖片 URL" style="margin-top:6px">';
  h+='<textarea id="bkDesc" placeholder="簡介" style="margin-top:6px;min-height:60px"></textarea>';
  h+='<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">';
  h+='<input id="bkFile" type="file" accept=".pdf,.epub,.txt" style="flex:1">';
  h+='<button class="btn" onclick="adminAddBook()">📥 上傳並新增</button>';
  h+='</div></div>';

  h+='<div class="panel2"><b style="color:var(--gold2)">📋 教材列表</b>';
  if(!books.length) h+='<div class="empty">尚無教材</div>';
  else{
    h+='<div class="tblWrap" style="margin-top:8px"><table><thead><tr><th>封面</th><th>書名</th><th>分類</th><th>作者</th><th>狀態</th><th>上傳時間</th><th>操作</th></tr></thead><tbody>';
    books.forEach(b=>{
      const status=b.published?'<span class="chip ok">✅ 上架</span>':'<span class="chip">📦 草稿</span>';
      h+=`<tr><td>${b.cover?`<img src="${esc(b.cover)}" style="width:40px;height:56px;object-fit:cover;border-radius:4px">`:'📖'}</td><td>${esc(b.title)}</td><td>${b.cat}</td><td>${esc(b.author||'-')}</td><td>${status}</td><td>${new Date(b.ts).toLocaleString()}</td><td>`;
      h+=`<button class="btn mini ghost" onclick="adminEditBook('${b.id}')">編輯</button> `;
      h+=`<button class="btn mini ${b.published?'danger':'teal'}" onclick="adminToggleBook('${b.id}')">${b.published?'下架':'上架'}</button> `;
      h+=`<button class="btn mini danger" onclick="adminDelBook('${b.id}')">刪除</button></td></tr>`;
    });
    h+='</tbody></table></div>';
  }
  h+='</div>';
  $('#view').innerHTML=h;
}
function adminAddBook(){
  const t=$('#bkTitle').value.trim(), cat=$('#bkCat').value, a=$('#bkAuthor').value.trim(), cover=$('#bkCover').value.trim(), d=$('#bkDesc').value.trim();
  if(!t) return toast('⚠️ 請輸入書名','bad');
  const books=get(LS.books,[]);
  books.unshift({id:'bk'+Date.now(),title:t,cat,author:a,cover:cover||'',desc:d,published:false,ts:Date.now()});
  set(LS.books,books);
  toast('✅ 教材新增成功'); vBooksAdmin();
}
function adminEditBook(id){
  const books=get(LS.books,[]), b=books.find(x=>x.id===id); if(!b) return;
  let h=`<div class="mt">編輯教材：${esc(b.title)}</div>`;
  h+=`<input id="ebkTitle" value="${esc(b.title)}" style="margin-top:8px">`;
  h+=`<select id="ebkCat" style="margin-top:6px"><option value="textbook"${b.cat==='textbook'?' selected':''}>📖 教科書</option><option value="workbook"${b.cat==='workbook'?' selected':''}>📝 習作</option><option value="reference"${b.cat==='reference'?' selected':''}>📚 參考書</option><option value="novel"${b.cat==='novel'?' selected':''}>📕 小說</option><option value="other"${b.cat==='other'?' selected':''}>📦 其他</option></select>`;
  h+=`<input id="ebkAuthor" value="${esc(b.author||'')}" placeholder="作者" style="margin-top:6px">`;
  h+=`<input id="ebkCover" value="${esc(b.cover||'')}" placeholder="封面 URL" style="margin-top:6px">`;
  h+=`<textarea id="ebkDesc" placeholder="簡介" style="margin-top:6px;min-height:60px">${esc(b.desc||'')}</textarea>`;
  h+=`<div class="mBtns" style="margin-top:10px"><button class="btn" onclick="adminSaveBook('${id}')">💾 儲存</button><button class="btn ghost" onclick="closeModal()">取消</button></div>`;
  openModal(h);
}
function adminSaveBook(id){
  const books=get(LS.books,[]), idx=books.findIndex(x=>x.id===id); if(idx<0) return;
  books[idx].title=$('#ebkTitle').value.trim(); books[idx].cat=$('#ebkCat').value; books[idx].author=$('#ebkAuthor').value.trim(); books[idx].cover=$('#ebkCover').value.trim(); books[idx].desc=$('#ebkDesc').value.trim();
  set(LS.books,books); toast('✅ 已儲存'); closeModal(); vBooksAdmin();
}
function adminToggleBook(id){
  const books=get(LS.books,[]), b=books.find(x=>x.id===id); if(!b) return;
  b.published=!b.published; set(LS.books,books); toast(b.published?'✅ 已上架':'📦 已下架'); vBooksAdmin();
}
function adminDelBook(id){
  if(!confirm('確定刪除此教材？')) return;
  const books=get(LS.books,[]).filter(x=>x.id!==id); set(LS.books,books); toast('🗑️ 已刪除'); vBooksAdmin();
}