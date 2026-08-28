/* vFreePoints — 自由屬性點分配 */
function vFreePoints(){
  const u=me(), g=u.g, free=g.freePoints||0;
  const attrs=[
    {id:'str',n:'力量',ic:'💪',d:'物理攻擊+1、負重+5'},
    {id:'agi',n:'敏捷',ic:'🏃',d:'閃避+0.5%、暴擊+0.3%、速度+1'},
    {id:'vit',n:'體質',ic:'❤️',d:'最大HP+10、HP回復+1'},
    {id:'int',n:'智力',ic:'🧠',d:'魔法攻擊+1、最大MP+5、MP回復+0.5'},
    {id:'wis',n:'感知',ic:'👁️',d:'魔法防禦+1、命中+0.5%、掉落率+0.2%'},
    {id:'luk',n:'幸運',ic:'🍀',d:'暴擊傷害+1%、金幣+1%、稀有掉落+0.5%'},
  ];
  let h=back()+'<h3 class="vt">✨ 自由屬性點 <span class="vsub">可用點數：<b style="color:var(--gold2)">'+free+'</b> ｜單項上限：'+(get(LS.settings,{}).free_point_single_limit||300)+'</span></h3>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:12px">';
  attrs.forEach(a=>{
    const val=g.attrs?.[a.id]||0;
    h+=`<div class="panel2" style="text-align:center;padding:16px"><div style="font-size:32px">${a.ic}</div><b style="display:block;font-family:var(--serif);color:var(--gold2);margin:8px 0;font-size:16px">${a.n}</b><div class="chip" style="margin:0 auto 8px;font-size:14px"><b>${val}</b></div><div class="skTxt">${a.d}</div>`;
    h+=`<div class="rwRow" style="justify-content:center"><button class="rwChip" onclick="fpAdd('${a.id}',1)" ${free<=0||val>=300?'disabled':''}>+1</button><button class="rwChip" onclick="fpAdd('${a.id}',10)" ${free<10||val>=290?'disabled':''}>+10</button><button class="rwChip" onclick="fpAdd('${a.id}',100)" ${free<100||val>=200?'disabled':''}>+100</button><button class="rwChip danger" onclick="fpAdd('${a.id}',-val)" ${val<=0?'disabled':''}>重置</button></div></div>`;
  });
  h+='</div>';

  h+='<div class="panel2" style="margin-top:14px"><b>📊 衍生屬性預覽</b>';
  const derived=calcDerived(g);
  h+='<div class="statGrid" style="margin-top:8px">';
  Object.entries(derived).forEach(([k,v])=>h+=`<div class="statIt"><span>${k}</span><b>${v}</b></div>`);
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:14px"><b>💡 建議分配</b>';
  h+='<div class="rwRow"><button class="rwChip" onclick="fpPreset(\'war\')">⚔️ 戰士型</button><button class="rwChip" onclick="fpPreset(\'mage\')">🔮 法師型</button><button class="rwChip" onclick="fpPreset(\'archer\')">🏹 弓手型</button><button class="rwChip" onclick="fpPreset(\'tank\')">🛡️ 坦克型</button><button class="rwChip" onclick="fpPreset(\'balance\')">⚖️ 均衡型</button></div></div>';
  $('#view').innerHTML=h;
}
function fpAdd(id,delta){
  const u=me(), g=u.g;
  if(delta>0){
    if(g.freePoints<delta) return toast('⚠️ 點數不足','bad');
    if((g.attrs?.[id]||0)+delta>300) return toast('⚠️ 單項上限 300','bad');
    g.freePoints-=delta; g.attrs=g.attrs||{}; g.attrs[id]=(g.attrs[id]||0)+delta;
  }else{
    g.freePoints+=(g.attrs?.[id]||0); g.attrs[id]=0;
  }
  applyAttrs(g); set(LS.users,get(LS.users,[])); vFreePoints();
}
function fpPreset(type){
  const u=me(), g=u.g;
  const presets={war:{str:100,vit:50,agi:20},mage:{int:100,wis:50,vit:20},archer:{agi:100,str:30,luk:20},tank:{vit:100,str:30,wis:20},balance:{str:40,agi:40,vit:40,int:30,wis:30,luk:20}};
  const p=presets[type]; if(!p) return;
  let need=Object.values(p).reduce((a,b)=>a+b,0);
  if(g.freePoints<need) return toast(`⚠️ 需要 ${need} 點，現有 ${g.freePoints}`,'bad');
  Object.entries(p).forEach(([k,v])=>{g.attrs=g.attrs||{}; g.attrs[k]=v;});
  g.freePoints-=need; applyAttrs(g); set(LS.users,get(LS.users,[])); toast(`✅ 已套用 ${type} 分配`); vFreePoints();
}
function calcDerived(g){
  const a=g.attrs||{};
  return {'物攻':(a.str||0)+Math.floor((a.agi||0)*0.3),'魔攻':(a.int||0)+Math.floor((a.wis||0)*0.3),'最大HP':(g.lv||1)*100+(a.vit||0)*10,'最大MP':(g.lv||1)*50+(a.int||0)*5,'閃避%':((a.agi||0)*0.5).toFixed(1),'暴擊%':((a.agi||0)*0.3+(a.luk||0)*0.5).toFixed(1),'暴傷%':150+(a.luk||0),'掉落率%':((a.wis||0)*0.2+(a.luk||0)*0.5).toFixed(1)};
}
function applyAttrs(g){g.maxHp=calcDerived(g)['最大HP']; g.maxMp=calcDerived(g)['最大MP']}