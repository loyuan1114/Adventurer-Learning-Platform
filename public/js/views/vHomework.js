/* vHomework — 作業系統 */
function vHomework(){
  const u=me(), g=u.g, isTeacher=u.role==='teacher'||u.role==='admin';
  const hw=isTeacher?get(LS.hw,[]).filter(h=>h.teacher===u.id):get(LS.hw,[]).filter(h=>!h.classId||h.classId===g.classId);
  let h=back()+'<h3 class="vt">📝 作業系統 <span class="vsub">'+(isTeacher?'發布・批改・統計':'接收・完成・繳交')+'</span></h3>';

  if(isTeacher){
    h+='<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2)">➕ 發布新作業</b>';
    h+='<input id="hwTitle" placeholder="作業標題" style="margin-top:8px">';
    h+='<textarea id="hwDesc" placeholder="作業說明" style="margin-top:6px;min-height:60px"></textarea>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">';
    h+='<input id="hwDeadline" type="datetime-local">';
    h+='<select id="hwClass"><option value="">全體學生</option>'+get(LS.classes,[]).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')+'</select>';
    h+='</div>';
    h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px">';
    h+='<input id="hwRewardGold" type="number" placeholder="金幣獎勵" value="100">';
    h+='<input id="hwRewardExp" type="number" placeholder="經驗獎勵" value="50">';
    h+='<input id="hwRewardGem" type="number" placeholder="寶石獎勵" value="0">';
    h+='</div>';
    h+='<div class="mBtns" style="margin-top:10px"><button class="btn" onclick="teacherCreateHW()">📤 發布作業</button></div></div>';
  }

  h+='<div class="panel2"><b>📋 '+(isTeacher?'我的發布':'可接作業')+'</b>';
  if(!hw.length) h+='<div class="empty">'+(isTeacher?'尚未發布作業':'暫無可接作業')+'</div>';
  else{
    h+='<div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">';
    hw.forEach(hw=>{
      const sub=isTeacher?get(LS.sub,[]).filter(s=>s.hwId===hw.id).length:get(LS.sub,[]).some(s=>s.hwId===hw.id&&s.student===u.id);
      const overdue=hw.deadline&&Date.now()>hw.deadline;
      h+=`<div class="panel2 ${overdue?'impcard':''}" style="position:relative;${overdue?'border-color:var(--red)':''}">`;
      if(overdue) h+=`<div class="stockTag" style="background:var(--red)">⏰ 已截止</div>`;
      h+=`<b>${esc(hw.title)}</b> ${isTeacher?'':'<span class="chip">'+(sub?'✅ 已繳交':'📝 未繳交')+'</span>'}`;
      h+=`<div class="skTxt">${esc(hw.desc)}</div>`;
      h+=`<div class="skTxt">截止：${hw.deadline?new Date(hw.deadline).toLocaleString():'無'} ｜ 獎勵：💰${hw.rewardGold||0} ⭐${hw.rewardExp||0} 💎${hw.rewardGem||0}</div>`;
      if(isTeacher){
        h+=`<div class="rwRow" style="margin-top:8px"><button class="rwChip" onclick="teacherViewSub('${hw.id}')">📊 查看繳交</button><button class="rwChip danger" onclick="teacherDelHW('${hw.id}')">🗑️ 刪除</button></div>`;
      }else if(!sub){
        h+=`<div class="rwRow" style="margin-top:8px"><button class="rwChip" onclick="studentDoHW('${hw.id}')">✏️ 開始作答</button></div>`;
      }
      h+='</div>';
    });
    h+='</div>';
  }
  h+='</div>';
  $('#view').innerHTML=h;
}
function teacherCreateHW(){
  const u=me(), title=$('#hwTitle').value.trim(), desc=$('#hwDesc').value.trim(), deadline=$('#hwDeadline').value, classId=$('#hwClass').value;
  const rGold=+$('#hwRewardGold').value||0, rExp=+$('#hwRewardExp').value||0, rGem=+$('#hwRewardGem').value||0;
  if(!title||!desc) return toast('⚠️ 標題與說明必填','bad');
  const hw={id:'hw'+Date.now(),teacher:u.id,teacherName:u.name,title,desc,deadline:deadline?new Date(deadline).getTime():0,classId:classId||null,rewardGold:rGold,rewardExp:rExp,rewardGem:rGem,created:Date.now()};
  const hws=get(LS.hw,[]); hws.unshift(hw); set(LS.hw,hws); toast('✅ 作業發布成功'); vHomework();
}
function teacherViewSub(id){
  const hw=get(LS.hw,[]).find(x=>x.id===id); if(!hw) return;
  const subs=get(LS.sub,[]).filter(s=>s.hwId===id);
  let h=`<div class="mt">${esc(hw.title)} - 繳交情況</div>`;
  if(!subs.length) h+='<div class="empty">暫無繳交</div>';
  else{
    h+='<div class="tblWrap"><table><thead><tr><th>學生</th><th>班級</th><th>分數</th><th>繳交時間</th><th>操作</th></tr></thead><tbody>';
    subs.forEach(s=>{
      const stu=get(LS.users,[]).find(x=>x.id===s.student);
      h+=`<tr><td>${esc(stu?.name||s.student)}</td><td>${stu?.g?.classId?get(LS.classes,[]).find(c=>c.id===stu.g.classId)?.name:'-'}</td><td>${s.score!==undefined?s.score:'待評分'}</td><td>${new Date(s.ts).toLocaleString()}</td><td><button class="btn mini ghost" onclick="teacherGradeSub('${s.id}')">評分</button></td></tr>`;
    });
    h+='</tbody></table></div>';
  }
  openModal(h);
}
function teacherGradeSub(id){
  const subs=get(LS.sub,[]), s=subs.find(x=>x.id===id); if(!s) return;
  const score=prompt('請輸入分數 (0-100):'); if(score===null||isNaN(score)) return;
  s.score=Math.max(0,Math.min(100,+score)); s.gradedAt=Date.now(); s.grader=me().name;
  set(LS.sub,subs); toast('✅ 評分完成'); teacherViewSub(s.hwId);
}
function teacherDelHW(id){
  if(!confirm('確定刪除？')) return;
  set(LS.hw,get(LS.hw,[]).filter(x=>x.id!==id)); toast('🗑️ 已刪除'); vHomework();
}
function studentDoHW(id){
  const hw=get(LS.hw,[]).find(x=>x.id===id); if(!hw) return;
  toast('✏️ 進入作答頁面…'); setTimeout(()=>{if(typeof tGo==='function') tGo('quiz')},500);
}