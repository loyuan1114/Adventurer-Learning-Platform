/* vBuffStore — BUFF 商店 */
function vBuffStore(){
  const u=me(), g=u.g;
  const buffs=[
    {id:'exp',n:'經驗加成',d:'戰鬥經驗 +50%',cost:{gold:5000},dur:3600,icon:'⭐'},
    {id:'gold',n:'金幣加成',d:'獲得金幣 +30%',cost:{gold:3000},dur:3600,icon:'💰'},
    {id:'drop',n:'掉落加成',d:'道具掉落率 +25%',cost:{gems:50},dur:3600,icon:'🎁'},
    {id:'stamina',n:'體力無限',d:'不消耗體力',cost:{gems:100},dur:1800,icon:'⚡'},
    {id:'pk',n:'PK 免費',d:'競技場免費挑戰',cost:{gold:10000},dur:3600,icon:'⚔️'},
    {id:'luck',n:'幸運之星',d:'暴擊率 +15%、暴擊傷害 +20%',cost:{gems:200},dur:7200,icon:'🍀'},
  ];
  let h=back()+'<h3 class="vt">🛍️ BUFF 商店 <span class="vsub">購买臨時增益・戰力飆升</span></h3>';
  h+='<div class="chip coin">💰 '+numFmt(g.gold)+'</div> <div class="chip gem">💎 '+numFmt(g.gems)+'</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-top:12px">';
  buffs.forEach(b=>{
    const active=g.buffs&&g.buffs[b.id]&&g.buffs[b.id]>Date.now();
    const costKey=Object.keys(b.cost)[0], costVal=b.cost[costKey];
    const canBuy=(costKey==='gold'?g.gold:g.gems)>=costVal;
    h+=`<div class="panel2 ${active?'impcard':''}" style="position:relative;${active?'border-color:var(--gold);box-shadow:0 0 12px rgba(242,193,78,.3)':''}">`;
    if(active) h+=`<div class="stockTag" style="background:var(--teal)">✅ 生效中</div>`;
    h+=`<div style="font-size:32px;text-align:center">${b.icon}</div><b style="display:block;text-align:center;font-family:var(--serif);color:var(--gold2);margin:6px 0">${b.n}</b>`;
    h+=`<div class="skTxt" style="text-align:center">${b.d}</div>`;
    h+=`<div class="chip ${costKey==='gold'?'coin':'gem'}" style="margin:8px auto;display:block;text-align:center">${b.icon} ${numFmt(costVal)} ${costKey==='gold'?'金幣':'寶石'}</div>`;
    h+=`<div class="skTxt" style="text-align:center">持續 ${Math.floor(b.dur/60)} 分鐘</div>`;
    h+=`<button class="btn ${active?'dis':'big'}" style="margin-top:10px;width:100%" ${active?'disabled':''} onclick="buyBuff('${b.id}')">${active?'✅ 已生效':'🛒 購買'}</button>`;
    h+='</div>';
  });
  h+='</div>';
  if(g.buffs){
    h+='<div class="panel2" style="margin-top:14px"><b>⏱️ 目前生效 BUFF</b>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">';
    Object.entries(g.buffs).forEach(([id,exp])=>{
      if(exp>Date.now()){
        const b=buffs.find(x=>x.id===id);
        const left=Math.ceil((exp-Date.now())/60000);
        h+=`<span class="chip" style="background:rgba(242,193,78,.15);border-color:var(--goldD)">${b?.icon||'✨'} ${b?.n||id} <b>${left}分</b></span>`;
      }
    });
    h+='</div></div>';
  }
  $('#view').innerHTML=h;
}
function buyBuff(id){
  const u=me(), g=u.g;
  const buffs={exp:{cost:{gold:5000},dur:3600},gold:{cost:{gold:3000},dur:3600},drop:{cost:{gems:50},dur:3600},stamina:{cost:{gems:100},dur:1800},pk:{cost:{gold:10000},dur:3600},luck:{cost:{gems:200},dur:7200}};
  const b=buffs[id]; if(!b) return;
  const costKey=Object.keys(b.cost)[0], costVal=b.cost[costKey];
  if((costKey==='gold'?g.gold:g.gems)<costVal) return toast(`⚠️ ${costKey==='gold'?'金幣':'寶石'}不足`,`bad`);
  if(costKey==='gold') g.gold-=costVal; else g.gems-=costVal;
  g.buffs=g.buffs||{}; g.buffs[id]=Date.now()+b.dur*1000;
  set(LS.users,get(LS.users,[])); toast(`✅ 購買成功！${id} BUFF 生效 ${b.dur/60} 分鐘`); vBuffStore();
}