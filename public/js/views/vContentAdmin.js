/* vContentAdmin — 內容管理後台 */
function vContentAdmin(){
  if(!(typeof IS_ADMIN==='function'&&IS_ADMIN())) return toast('⚠️ 僅管理員可進入','bad');
  let h=back()+'<h3 class="vt">📝 內容管理後台 <span class="vsub">題庫・教材・公告・故事統一管理</span></h3>';

  h+='<div class="tabRow">';
  ['questions','materials','announcements','stories'].forEach((t,i)=>{
    const label={questions:'📝 題庫',materials:'📚 教材',announcements:'📢 公告',stories:'📖 故事'}[t];
    h+=`<button class="tabB ${i===0?'on':''}" onclick="contentAdminTab('${t}')">${label}</button>`;
  });
  h+='</div>';
  h+='<div id="contentAdminArea"></div>';
  $('#view').innerHTML=h;
  contentAdminTab('questions');
}
function contentAdminTab(t){
  window._contentAdminTab=t;
  document.querySelectorAll('.tabB').forEach(b=>b.classList.toggle('on',b.onclick.toString().includes(t)));
  const area=$('#contentAdminArea');
  if(t==='questions') renderContentQuestions(area);
  else if(t==='materials') renderContentMaterials(area);
  else if(t==='announcements') renderContentAnnouncements(area);
  else if(t==='stories') renderContentStories(area);
}
function renderContentQuestions(area){
  const qs=get('ADV9_QUESTIONS',[]);
  let h='<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2)">➕ 新增題目</b>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">';
  h+='<input id="cqSubj" placeholder="科目">';
  h+='<select id="cqDiff"><option value="1">⭐ 簡單</option><option value="2" selected>⭐⭐ 普通</option><option value="3">⭐⭐⭐ 困難</option><option value="4">⭐⭐⭐⭐ 專家</option><option value="5">⭐⭐⭐⭐⭐ 大師</option></select>';
  h+='</div>';
  h+='<textarea id="cqStem" placeholder="題目內容" style="margin-top:6px;min-height:60px"></textarea>';
  h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:6px">';
  [0,1,2,3].forEach(i=>h+=`<input id="cqOpt${i}" placeholder="選項 ${String.fromCharCode(65+i)}">`);
  h+='</div>';
  h+='<div style="display:flex;gap:8px;margin-top:6px">';
  h+='<select id="cqAns"><option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></select>';
  h+='<input id="cqExplain" placeholder="解析 (可選)" style="flex:1">';
  h+='<button class="btn" onclick="adminAddQuestion()">新增題目</button>';
  h+='</div></div>';

  h+='<div class="panel2"><b>📋 題庫列表 (共 '+qs.length+' 題)</b>';
  if(!qs.length) h+='<div class="empty">題庫為空</div>';
  else{
    h+='<div class="tblWrap" style="margin-top:8px"><table><thead><tr><th>ID</th><th>科目</th><th>難度</th><th>題目</th><th>答案</th><th>操作</th></tr></thead><tbody>';
    qs.slice(-50).reverse().forEach(q=>{
      h+=`<tr><td>${q.id}</td><td>${q.subj}</td><td>${'⭐'.repeat(q.diff||1)}</td><td>${esc(q.stem).slice(0,50)}...</td><td>${String.fromCharCode(65+(q.ans||0))}</td><td><button class="btn mini ghost" onclick="adminEditQuestion('${q.id}')">編輯</button><button class="btn mini danger" onclick="adminDelQuestion('${q.id}')">刪除</button></td></tr>`;
    });
    h+='</tbody></table></div>';
  }
  h+='</div>';
  area.innerHTML=h;
}
function renderContentMaterials(area){
  const mats=get(LS.books,[]);
  let h='<div class="panel2"><b>📚 教材管理</b><div class="skTxt">請至「教材管理」頁面操作</div></div>';
  area.innerHTML=h;
}
function renderContentAnnouncements(area){
  const anns=get(LS.ann,[]);
  let h='<div class="panel2"><b>📢 公告管理</b><div class="skTxt">請至「公告欄」頁面操作</div></div>';
  area.innerHTML=h;
}
function renderContentStories(area){
  const stories=get(LS.stories,[]);
  let h='<div class="panel2"><b>📖 故事管理</b><div class="skTxt">故事系統開發中…</div></div>';
  area.innerHTML=h;
}
function adminAddQuestion(){
  const subj=$('#cqSubj').value.trim(), diff=+$('#cqDiff').value, stem=$('#cqStem').value.trim();
  const opts=[0,1,2,3].map(i=>$('#cqOpt'+i).value.trim());
  const ans=+$('#cqAns').value, explain=$('#cqExplain').value.trim();
  if(!subj||!stem||opts.some(o=>!o)) return toast('⚠️ 請填寫完整','bad');
  const qs=get('ADV9_QUESTIONS',[]);
  qs.push({id:'q'+Date.now(),subj,diff,stem,opts,ans,explain,ts:Date.now()});
  set('ADV9_QUESTIONS',qs); toast('✅ 題目新增成功'); contentAdminTab('questions');
}
function adminDelQuestion(id){
  if(!confirm('確定刪除？')) return;
  const qs=get('ADV9_QUESTIONS',[]).filter(q=>q.id!==id);
  set('ADV9_QUESTIONS',qs); toast('🗑️ 已刪除'); contentAdminTab('questions');
}
function adminEditQuestion(id){
  const qs=get('ADV9_QUESTIONS',[]), q=qs.find(x=>x.id===id); if(!q) return;
  let h=`<div class="mt">編輯題目：${q.id}</div>`;
  h+=`<input id="eqSubj" value="${esc(q.subj)}" style="margin-top:8px">`;
  h+=`<select id="eqDiff" style="margin-top:6px"><option value="1"${q.diff===1?' selected':''}>⭐</option><option value="2"${q.diff===2?' selected':''}>⭐⭐</option><option value="3"${q.diff===3?' selected':''}>⭐⭐⭐</option><option value="4"${q.diff===4?' selected':''}>⭐⭐⭐⭐</option><option value="5"${q.diff===5?' selected':''}>⭐⭐⭐⭐⭐</option></select>`;
  h+=`<textarea id="eqStem" style="margin-top:6px;min-height:60px">${esc(q.stem)}</textarea>`;
  q.opts.forEach((o,i)=>h+=`<input id="eqOpt${i}" value="${esc(o)}" placeholder="選項 ${String.fromCharCode(65+i)}" style="margin-top:6px">`);
  h+=`<select id="eqAns" style="margin-top:6px"><option value="0"${q.ans===0?' selected':''}>A</option><option value="1"${q.ans===1?' selected':''}>B</option><option value="2"${q.ans===2?' selected':''}>C</option><option value="3"${q.ans===3?' selected':''}>D</option></select>`;
  h+=`<input id="eqExplain" value="${esc(q.explain||'')}" placeholder="解析" style="margin-top:6px">`;
  h+=`<div class="mBtns" style="margin-top:10px"><button class="btn" onclick="adminSaveQuestion('${id}')">💾 儲存</button><button class="btn ghost" onclick="closeModal()">取消</button></div>`;
  openModal(h);
}
function adminSaveQuestion(id){
  const qs=get('ADV9_QUESTIONS',[]), idx=qs.findIndex(x=>x.id===id); if(idx<0) return;
  qs[idx].subj=$('#eqSubj').value.trim(); qs[idx].diff=+$('#eqDiff').value; qs[idx].stem=$('#eqStem').value.trim();
  qs[idx].opts=[0,1,2,3].map(i=>$('#eqOpt'+i).value.trim()); qs[idx].ans=+$('#eqAns').value; qs[idx].explain=$('#eqExplain').value.trim();
  set('ADV9_QUESTIONS',qs); toast('✅ 已儲存'); closeModal(); contentAdminTab('questions');
}