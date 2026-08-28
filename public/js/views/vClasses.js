/* vClasses — 班級管理 */
function vClasses(){
  const u=me(), g=u.g, myCls=g.classId?get(LS.classes,[]).find(c=>c.id===g.classId):null, allCls=get(LS.classes,[]);
  let h=back()+'<h3 class="vt">🏫 班級系統 <span class="vsub">加入/創建班級・班級任務・集體榮譽</span></h3>';

  if(myCls){
    h+='<div class="panel2" style="margin-bottom:12px;border-left:4px solid var(--teal)"><b style="color:var(--teal)">🏠 我的班級：'+esc(myCls.name)+'</b>';
    h+=`<div class="skTxt" style="margin-top:6px">班級代碼：<code>${myCls.code}</code> ｜ 成員：${myCls.members.length} 人 ｜ 基金：${numFmt(myCls.fund||0)} 金 ｜ 等級：Lv.${myCls.lv||1}</div>`;
    h+=`<div class="rwRow" style="margin-top:8px"><button class="rwChip" onclick="classViewMembers()">👥 成員名單</button><button class="rwChip" onclick="classTasks()">📋 班級任務</button><button class="rwChip" onclick="classDonate()">💰 捐獻基金</button><button class="rwChip danger" onclick="classLeave()">🚪 退出班級</button></div></div>`;
  }else{
    h+='<div class="panel2" style="margin-bottom:12px"><b>🔍 瀏覽現有班級</b>';
    if(!allCls.length) h+='<div class="empty">尚無班級，快創建第一個！</div>';
    else{
      h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px;margin-top:8px">';
      allCls.forEach(c=>{
        h+=`<div class="panel2" style="padding:12px"><b>${esc(c.name)}</b><div class="skTxt">代碼：${c.code} ｜ ${c.members.length} 人 ｜ Lv.${c.lv||1}</div><button class="btn mini" style="margin-top:8px" onclick="classJoin('${c.id}')">🚪 申請加入</button></div>`;
      });
      h+='</div>';
    }
    h+='</div>';
  }

  h+='<div class="panel2"><b style="color:var(--gold2)">➕ 創建新班級</b>';
  h+='<input id="newClsName" placeholder="班級名稱" style="margin-top:8px">';
  h+='<input id="newClsDesc" placeholder="班級簡介/招生條件" style="margin-top:6px">';
  h+='<div class="mBtns" style="margin-top:10px"><button class="btn" onclick="classCreate()">創建班級 (500 金)</button></div></div>';

  $('#view').innerHTML=h;
}
function classCreate(){
  const u=me(), n=$('#newClsName').value.trim(), d=$('#newClsDesc').value.trim();
  if(!n) return toast('⚠️ 請輸入班級名稱','bad');
  if(u.g.gold<500) return toast('⚠️ 需要 500 金幣','bad');
  const code=Math.random().toString(36).substr(2,6).toUpperCase();
  const cls={id:'cls'+Date.now(),name:n,desc:d,code,owner:u.id,members:[u.id],fund:0,lv:1,exp:0,created:Date.now()};
  const all=get(LS.classes,[]); all.push(cls); set(LS.classes,all);
  u.g.classId=cls.id; u.g.gold-=500; set(LS.users,get(LS.users,[]));
  toast('✅ 班級創建成功！'); vClasses();
}
function classJoin(id){
  const u=me(), cls=get(LS.classes,[]).find(c=>c.id===id); if(!cls) return;
  if(cls.members.includes(u.id)) return toast('⚠️ 已在該班級','bad');
  cls.members.push(u.id); u.g.classId=id; set(LS.classes,get(LS.classes,[])); set(LS.users,get(LS.users,[]));
  toast('✅ 成功加入班級'); vClasses();
}
function classLeave(){
  if(!confirm('確定退出班級？')) return;
  const u=me(), cls=get(LS.classes,[]).find(c=>c.id===u.g.classId); if(!cls) return;
  cls.members=cls.members.filter(x=>x!==u.id); u.g.classId=null; set(LS.classes,get(LS.classes,[])); set(LS.users,get(LS.users,[]));
  toast('🚪 已退出班級'); vClasses();
}
function classViewMembers(){
  const u=me(), cls=get(LS.classes,[]).find(c=>c.id===u.g.classId); if(!cls) return;
  let h='<div class="mt">班級成員</div>';
  h+=cls.members.map(id=>{const m=get(LS.users,[]).find(x=>x.id===id); return m?`<div class="frIt"><div style="font-size:24px">${m.prof?.avatar?avatarHtml(m,36):'🧑‍🎓'}</div><div class="collInfo"><b>${esc(m.name)}</b><div class="skTxt">Lv.${m.g?.lv||1} ｜ ${m.id===cls.owner?'👑 班長':m.id===u.id?'👤 你':'👥 成員'}</div></div></div>`:''}).join('');
  openModal(h);
}
function classTasks(){toast('📋 班級任務功能開發中…')}
function classDonate(){
  const u=me(), amt=prompt('捐獻金額：'); if(!amt||isNaN(amt)||amt<1) return;
  if(u.g.gold<amt) return toast('⚠️ 金幣不足','bad');
  u.g.gold-=amt; const cls=get(LS.classes,[]).find(c=>c.id===u.g.classId); if(cls){cls.fund=(cls.fund||0)+amt; set(LS.classes,get(LS.classes,[]));}
  set(LS.users,get(LS.users,[])); toast(`✅ 捐獻 ${amt} 金幣`); vClasses();
}