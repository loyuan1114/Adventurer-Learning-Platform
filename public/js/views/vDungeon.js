/* vDungeon — 副本探索 */
function vDungeon(){
  const u=me(), g=u.g;
  const dungeons=[
    {id:'d1',n:'🌲 新手森林',reqLv:1,stamina:5,rewards:['基礎裝備','金幣','經驗'],boss:'🌳 樹精長老',cleared:g.dunCleared?.d1},
    {id:'d2',n:'🏜️ 烈日沙漠',reqLv:10,stamina:10,rewards:['稀有材料','寶石','強化石'],boss:'🦂 沙漠蠍王',cleared:g.dunCleared?.d2},
    {id:'d3',n:'❄️ 極寒冰窟',reqLv:25,stamina:15,rewards:['史詩裝備','寵物蛋','稱號'],boss:'🐻‍❄️ 冰霜巨熊',cleared:g.dunCleared?.d3},
    {id:'d4',n:'🌋 熔岩火山',reqLv:40,stamina:20,rewards:['傳說材料','鑽石','專屬技能書'],boss:'🌋 熔岩領主',cleared:g.dunCleared?.d4},
    {id:'d5',n:'🏰 遠古遺跡',reqLv:60,stamina:30,rewards:['神話裝備','∞碎片','專屬坐騎'],boss:'🤖 遠古守護者',cleared:g.dunCleared?.d5},
  ];
  let h=back()+'<h3 class="vt">🏰 副本探索 <span class="vsub">挑戰副本・擊敗首領・獲取豐厚獎勵</span></h3>';
  h+='<div class="chip">⚡ 體力：'+(g.stamina||100)+'/100</div> <div class="chip">🔑 副本鑰匙：'+(g.dunKeys||0)+'</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-top:12px">';
  dungeons.forEach(d=>{
    const canEnter=g.lv>=d.reqLv;
    const cleared=d.cleared;
    h+=`<div class="panel2 ${cleared?'impcard':''}" style="position:relative;${cleared?'border-color:var(--green);background:rgba(76,175,80,.1)':''}">`;
    if(cleared) h+=`<div class="stockTag" style="background:var(--green)">✅ 已通關</div>`;
    h+=`<div style="font-size:28px;text-align:center;margin-bottom:8px">${d.n.split(' ')[0]}</div><b style="display:block;text-align:center;font-family:var(--serif);color:var(--gold2)">${d.n.split(' ').slice(1).join(' ')}</b>`;
    h+=`<div class="skTxt" style="text-align:center;margin:6px 0">需求等級：Lv.${d.reqLv} ｜ 體力：${d.stamina} ｜ 首領：${d.boss}</div>`;
    h+=`<div style="display:flex;gap:4px;justify-content:center;margin:8px 0">${d.rewards.map(r=>`<span class="chip" style="font-size:10px;padding:2px 8px">${r}</span>`).join('')}</div>`;
    h+=`<button class="btn ${canEnter?'':'dis'} big" style="width:100%" ${canEnter?'':'disabled'} onclick="dungeonEnter('${d.id}')">${cleared?'🔄 重置挑戰':'🚪 進入副本'}</button>`;
    h+='</div>';
  });
  h+='</div>';

  h+='<div class="panel2" style="margin-top:14px"><b>📜 近期探索紀錄</b>';
  const logs=get('ADV9_DUNGEON_LOG',[]).slice(-10).reverse();
  if(logs.length) h+='<div style="margin-top:8px">'+logs.map(l=>`<div class="chip">${new Date(l.ts).toLocaleString()} ${l.dungeon} ${l.result?'✅ 勝利':'❌ 失敗'} ${l.rewards?('獲得：'+l.rewards.join('、')):''}</div>`).join('')+'</div>';
  else h+='<div class="empty">暫無探索紀錄</div>';
  h+='</div>';
  $('#view').innerHTML=h;
}
function dungeonEnter(id){
  const u=me(), g=u.g;
  const dungeons={d1:{reqLv:1,stamina:5,bossHP:500,rewards:['基礎劍','金幣x100','經驗x50']},d2:{reqLv:10,stamina:10,bossHP:2000,rewards:['稀有礦石','寶石x10','強化石x5']},d3:{reqLv:25,stamina:15,bossHP:5000,rewards:['史詩護甲','寵物蛋x1','稱號:冰霜獵手']},d4:{reqLv:40,stamina:20,bossHP:10000,rewards:['傳說材料','鑽石x5','技能書:火焰風暴']},d5:{reqLv:60,stamina:30,bossHP:20000,rewards:['神話武器','∞碎片x10','坐騎:遠古巨龍']}};
  const d=dungeons[id]; if(!d) return;
  if(g.lv<d.reqLv) return toast(`⚠️ 需要 Lv.${d.reqLv} 以上`,`bad`);
  if((g.stamina||100)<d.stamina) return toast('⚠️ 體力不足','bad');
  g.stamina-=d.stamina;
  toast(`🏰 進入副本… 模擬戰鬥中`);
  setTimeout(()=>{
    const win=Math.random()<0.7+(g.lv*0.005);
    const log={dungeon:id,result:win,rewards:win?d.rewards:[],ts:Date.now()};
    const logs=get('ADV9_DUNGEON_LOG',[]); logs.push(log); if(logs.length>50) logs.shift(); set('ADV9_DUNGEON_LOG',logs);
    if(win){
      g.dunCleared=g.dunCleared||{}; g.dunCleared[id]=true;
      d.rewards.forEach(r=>{if(r.includes('金幣')) g.gold+=+r.match(/\d+/)[0]; if(r.includes('經驗')) g.exp+=+r.match(/\d+/)[0]; if(r.includes('寶石')) g.gems+=+r.match(/\d+/)[0];});
      toast(`🏆 通關成功！獲得：${d.rewards.join('、')}`);
      if(!g.dunCleared[id]){g.gold+=200; g.exp+=100; toast('🎉 首通獎勵 +200金 +100經驗');}
    }else toast('💥 挑戰失敗，扣除體力');
    set(LS.users,get(LS.users,[])); vDungeon();
  },1500);
}