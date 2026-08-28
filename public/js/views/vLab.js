/* vLab — 實驗室/研究所 */
function vLab(){
  const u=me(), g=u.g, lab=g.lab||{level:1,exp:0,research:null,progress:0,slots:1};
  const researches=[
    {id:'r1',n:'🧪 基礎鍛造術',reqLv:1,cost:{gold:1000},time:60,reward:{forgeExp:100},desc:'提升強化成功率 5%'},
    {id:'r2',n:'⚗️ 高等鍊金術',reqLv:10,cost:{gold:5000,gems:10},time:180,reward:{alchemyExp:200},desc:'藥水效果 +20%'},
    {id:'r3',n:'🔮 魔法附魔研究',reqLv:25,cost:{gold:20000,gems:50},time:360,reward:{enchantExp:300},desc:'附魔屬性 +15%'},
    {id:'r4',n:'🧬 基因改造技術',reqLv:40,cost:{gold:100000,gems:200},time:720,reward:{breedExp:500},desc:'寵物繁育稀有度 +10%'},
    {id:'r5',n:'⚛️ 量子鍛造理論',reqLv:60,cost:{gold:500000,gems:1000},time:1440,reward:{quantumExp:1000},desc:'解鎖 ∞ 神階裝備'},
  ];
  let h=back()+'<h3 class="vt">🔬 研究所 <span class="vsub">投入資源研發科技・獲得永久加成</span></h3>';
  h+='<div class="panel2" style="margin-bottom:12px"><b>🏢 研究所等級：Lv.'+lab.level+'</b>';
  h+=`<div class="bar" style="margin:8px 0;height:12px"><i style="width:${Math.min(100,lab.exp/((lab.level)*1000)*100)}%"></i></div>`;
  h+=`<div class="skTxt">經驗：${lab.exp}/${lab.level*1000} ｜ 研究槽位：${lab.slots} ｜ ${lab.research?'進行中：'+researches.find(r=>r.id===lab.research)?.n:'閒置中'}</div></div>`;

  h+='<div class="panel2" style="margin-bottom:12px"><b>📚 可研究項目</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-top:8px">';
  researches.forEach(r=>{
    const done=g.researchDone?.includes(r.id), active=lab.research===r.id, canStart=g.lv>=r.reqLv&&!done&&!active&&lab.research===null;
    const costStr=Object.entries(r.cost).map(([k,v])=>`${k==='gold'?'💰':'💎'}${v}`).join(' ');
    h+=`<div class="panel2 ${done?'impcard':''}" style="position:relative;${done?'border-color:var(--green);opacity:.8':''}">`;
    if(done) h+=`<div class="stockTag" style="background:var(--green)">✅ 已完成</div>`;
    if(active) h+=`<div class="stockTag" style="background:var(--teal)">🔬 研究中 ${lab.progress}%</div>`;
    h+=`<b style="display:block;font-family:var(--serif);color:var(--gold2);margin-bottom:6px">${r.n}</b>`;
    h+=`<div class="skTxt">${r.desc}</div>`;
    h+=`<div class="skTxt">需求：Lv.${r.reqLv} ｜ 成本：${costStr} ｜ 時間：${r.time}分</div>`;
    if(active){
      h+=`<div class="bar" style="margin:8px 0"><i style="width:${lab.progress}%"></i></div>`;
      h+=`<button class="btn mini ghost" style="width:100%" onclick="labCancel()">取消研究</button>`;
    }else if(done){
      h+=`<div class="chip ok" style="margin-top:8px">永久效果已生效</div>`;
    }else if(canStart){
      h+=`<button class="btn" style="width:100%;margin-top:8px" onclick="labStart('${r.id}')">🚀 開始研究</button>`;
    }else{
      h+=`<button class="btn dis" style="width:100%;margin-top:8px" disabled>${g.lv<r.reqLv?'等級不足':lab.research?'槽位占用中':'已完成'}</button>`;
    }
    h+='</div>';
  });
  h+='</div></div>';

  h+='<div class="panel2"><b>⚡ 已生效加成</b>';
  const done=g.researchDone||[];
  if(done.length){
    h+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">';
    done.forEach(id=>{const r=researches.find(x=>x.id===id); if(r) h+=`<span class="chip" style="background:rgba(76,175,80,.15);border-color:#4caf50">${r.n} ✅</span>`;});
    h+='</div>';
  }else h+='<div class="empty" style="margin-top:8px">尚無完成研究</div>';
  h+='</div>';
  $('#view').innerHTML=h;
}
function labStart(id){
  const u=me(), g=u.g, r={r1:{cost:{gold:1000},time:60},r2:{cost:{gold:5000,gems:10},time:180},r3:{cost:{gold:20000,gems:50},time:360},r4:{cost:{gold:100000,gems:200},time:720},r5:{cost:{gold:500000,gems:1000},time:1440}}[id];
  if(!r) return;
  Object.entries(r.cost).forEach(([k,v])=>{if((k==='gold'?g.gold:g.gems)<v) return toast(`⚠️ ${k==='gold'?'金幣':'寶石'}不足`,`bad`);});
  Object.entries(r.cost).forEach(([k,v])=>{if(k==='gold') g.gold-=v; else g.gems-=v;});
  g.lab=g.lab||{level:1,exp:0}; g.lab.research=id; g.lab.progress=0; g.lab.startAt=Date.now(); g.lab.duration=r.time*60000;
  set(LS.users,get(LS.users,[])); toast('🔬 研究已開始'); vLab();
  labTick(id);
}
function labTick(id){
  const u=me(), g=u.g; if(!g.lab||g.lab.research!==id) return;
  const elapsed=Date.now()-g.lab.startAt, total=g.lab.duration;
  g.lab.progress=Math.min(100,Math.floor(elapsed/total*100));
  if(g.lab.progress>=100){
    g.researchDone=g.researchDone||[]; if(!g.researchDone.includes(id)) g.researchDone.push(id);
    g.lab.research=null; g.lab.progress=0; g.lab.exp=(g.lab.exp||0)+50;
    if(g.lab.exp>=g.lab.level*1000){g.lab.level++; g.lab.exp=0; toast('🏢 研究所升級！');}
    set(LS.users,get(LS.users,[])); toast('✅ 研究完成！'); vLab(); return;
  }
  set(LS.users,get(LS.users,[])); setTimeout(()=>labTick(id),5000);
}
function labCancel(){
  const u=me(), g=u.g; if(!g.lab||!g.lab.research) return;
  const r={r1:{cost:{gold:1000}},r2:{cost:{gold:5000,gems:10}},r3:{cost:{gold:20000,gems:50}},r4:{cost:{gold:100000,gems:200}},r5:{cost:{gold:500000,gems:1000}}}[g.lab.research];
  if(r) Object.entries(r.cost).forEach(([k,v])=>{if(k==='gold') g.gold+=Math.floor(v*0.5); else g.gems+=Math.floor(v*0.5);});
  g.lab.research=null; g.lab.progress=0; set(LS.users,get(LS.users,[])); toast('⏹️ 研究已取消，退還 50% 成本'); vLab();
}