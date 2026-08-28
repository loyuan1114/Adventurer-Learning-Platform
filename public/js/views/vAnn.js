/* vAnn — 公告欄 */
function vAnn(){
  const u=me(), anns=get(LS.ann,[]).sort((a,b)=>b.ts-a.ts);
  let h=back()+'<h3 class="vt">📢 系統公告 <span class="vsub">最新消息・活動資訊・重要通知</span></h3>';
  if(!anns.length){
    h+='<div class="panel2 empty">暫無公告</div>';
  }else{
    anns.forEach(a=>{
      h+=`<div class="annIt panel2" style="margin-bottom:10px"><b>${esc(a.title)}</b>`;
      if(a.pin) h+=`<span class="chip imp">📌 置頂</span>`;
      h+=`<div class="annMeta">🕒 ${new Date(a.ts).toLocaleString()} ${a.author?'｜👤 '+esc(a.author):''}</div>`;
      h+=`<p>${esc(a.content).replace(/\n/g,'<br>')}</p>`;
      if(a.link) h+=`<button class="btn mini ghost" onclick="window.open('${esc(a.link)}')">🔗 前往連結</button>`;
      h+='</div>';
    });
  }
  if(typeof IS_ADMIN==='function'&&IS_ADMIN()){
    h+=`<div class="panel2" style="margin-top:14px"><b style="color:var(--gold2)">➕ 發布新公告</b>`;
    h+=`<input id="annTitle" placeholder="標題" style="margin-top:8px">`;
    h+=`<textarea id="annContent" placeholder="內容（支援換行）" style="margin-top:6px;min-height:80px"></textarea>`;
    h+=`<label style="font-size:12px;margin-top:6px;display:flex;gap:6px;align-items:center"><input type="checkbox" id="annPin"> 📌 置頂公告</label>`;
    h+=`<input id="annLink" placeholder="相關連結 (可選)" style="margin-top:6px">`;
    h+=`<div class="mBtns" style="margin-top:10px"><button class="btn" onclick="adminCreateAnn()">發布公告</button></div></div>`;
  }
  $('#view').innerHTML=h;
}
function adminCreateAnn(){
  const t=$('#annTitle').value.trim(), c=$('#annContent').value.trim(), pin=$('#annPin').checked, link=$('#annLink').value.trim();
  if(!t||!c) return toast('⚠️ 標題與內容不可空白','bad');
  const anns=get(LS.ann,[]);
  anns.unshift({id:'ann'+Date.now(),title:t,content:c,pin,link,author:me().name,ts:Date.now()});
  set(LS.ann,anns);
  toast('✅ 公告發布成功'); vAnn();
}