
/* ── 稀有度系統 ── */
const EQ_RAR_GOLD=R=>({R:'#22c55e',E:'#4fc3f7',A:'#fff176',S:'#64b5f6',SS:'#9575cd',SSS:'#e040fb',Z:'#ff5252',ZZ:'#ff9800',ZZZ:'#f50057','∞':'#fff'}[R]||'#999');
const EQ_RAR_BORDER=(r)=>'equipCard'+{R:'R',E:'E',A:'A',S:'S',SS:'SS',SSS:'SSS',Z:'Z',ZZ:'ZZ',ZZZ:'ZZZ','∞':'INF'}[r]||'';
const EQ_MAIN_ATTR={'頭':'防禦%','衣服':'生命','褲子':'減傷','鞋子':'冷卻','武器':'傷害%','戒指':'暴傷','項鍊':'運氣'};
const EQ_SUB_STAT_POOL=['暴擊','暴傷','冷卻','減傷','運氣','生命','防禦'];
const EQ_SUB_ICON={'暴擊':'🎯','暴傷':'💥','冷卻':'⏱️','減傷':'🛡️','運氣':'🍀','生命':'❤️','防禦':'🏰'};

/* ── 20 種武器 ── */
const EQ_WEAPONS=[
  {id:1,name:'劍',icon:'⚔️',desc:'均衡型'},
  {id:2,name:'匕首',icon:'🗡️',desc:'暴擊+'},
  {id:3,name:'弓',icon:'🏹',desc:'遠程'},
  {id:4,name:'弩',icon:'🎯',desc:'爆發+'},
  {id:5,name:'法杖',icon:'🪄',desc:'施法快'},
  {id:6,name:'法球',icon:'🔮',desc:'魔傷+'},
  {id:7,name:'魔導書',icon:'📖',desc:'範圍攻擊'},
  {id:8,name:'長槍',icon:'⚡',desc:'穿透'},
  {id:9,name:'戰斧',icon:'🪓',desc:'高傷'},
  {id:10,name:'戰錘',icon:'🔨',desc:'暈眩'},
  {id:11,name:'刀',icon:'🌙',desc:'吸血'},
  {id:12,name:'拳套',icon:'🥊',desc:'連擊'},
  {id:13,name:'迴旋鏢',icon:'🪃',desc:'回返彈道'},
  {id:14,name:'魔音琴',icon:'🎸',desc:'減益輔助'},
  {id:15,name:'雙刃',icon:'🔪',desc:'雙次攻擊'},
  {id:16,name:'炸彈',icon:'💣',desc:'範圍爆破'},
  {id:17,name:'羽扇',icon:'🪶',desc:'風系控制'},
  {id:18,name:'劍盾',icon:'🛡️',desc:'防禦型'},
  {id:19,name:'鏈刃',icon:'⛓️',desc:'中距離控場'},
  {id:20,name:'聖杖',icon:'🌟',desc:'聖屬性'}
];

/* ── 裝備生成 ── */
function eqCap(eq){ /* 卡片等級上限 = 玩家當前等級 ×100（Lv.1→100、Lv.2→200…）；原稀有度上限為下限 */
  const u=me();const plv=(u&&u.g&&u.g.lv)||1;
  return Math.max(eq.maxLevel||100,plv*100);
}
function eqUpgrade(eq,cost){
  if(eq.level>=eqCap(eq))return false;
  const costNeed=eqUpgradeCost(eq.level,eq.rarity);
  if(cost<costNeed)return false;
  eq.level+=1;eq.mainValue=parseFloat((eq.mainValue*1.02).toFixed(2));
  if(eq.rarity==='∞'){if(eq.level%30===0)eq.subStats.forEach(s=>s.value=parseFloat((s.value*1.05).toFixed(2)))}
  else{if(eq.level%20===0)eq.subStats.forEach(s=>s.value=parseFloat((s.value*1.05).toFixed(2)))}
  return true;
}

/* ── 裝備資料存取 ── */
function eqGet(){return get('ADV9_EQUIP',{owned:[],equipped:{'頭':null,'衣服':null,'褲子':null,'鞋子':null,'武器':null,'戒指':null,'項鍊':null}})}
function eqSet(d){set('ADV9_EQUIP',d)}
function eqAdd(eq){const d=eqGet();d.owned.push(eq);eqSet(d)}
function eqRemove(id){const d=eqGet();d.owned=d.owned.filter(x=>x.id!==id);eqSet(d)}
function eqEquip(slot,id){const d=eqGet();d.equipped[slot]=id;eqSet(d)}
function eqUnequip(slot){const d=eqGet();d.equipped[slot]=null;eqSet(d)}

/* ── 七大神級屬性 + 階級表 ── */
const REROLL_ATTRS=[
  {id:'chinese',name:'國語・理解力',icon:'📖',stat:'傷害%'},
  {id:'math',name:'數學・邏輯力',icon:'➗',stat:'暴擊%'},
  {id:'english',name:'英語・語感力',icon:'🔤',stat:'冷卻%'},
  {id:'science',name:'自然・探索力',icon:'🔬',stat:'暴傷%'},
  {id:'social',name:'社會・洞察力',icon:'🌏',stat:'防禦%'},
  {id:'will',name:'意志・專注力',icon:'🧘',stat:'減傷%'},
  {id:'luck',name:'冒險・運氣',icon:'🍀',stat:'運氣'}
];
const REROLL_BONUS={
  R:{flat:2,mult:1},E:{flat:4,mult:1},A:{flat:8,mult:1},S:{flat:15,mult:1},
  SS:{flat:22,mult:1},SSS:{flat:30,mult:1},Z:{flat:40,mult:1},ZZ:{flat:50,mult:1},
  ZZZ:{flat:65,mult:1},'∞':{flat:0,mult:2.5} /* ×150% 即 2.5x 乘法 */
};
const REROLL_WEIGHTS={R:30.7799,E:25,A:18,S:12,SS:8,SSS:4,Z:2,ZZ:0.2,ZZZ:0.02,'∞':0.0001};

/* 💎 單一貨幣池：寶石(原 ADV9_REROLL.gems) 與 鑽石(g.diamond) 統一為 g.diamond */
function rrGemBal(){const u=me();return Number(u&&u.g?u.g.diamond:0)||0}
function rrGemEarn(n){const u=me();if(!u||!u.g)return;u.g.diamond=(Number(u.g.diamond)||0)+n;saveU(u);if(typeof hud==='function')hud()}
function rrGemSpend(n){const u=me();if(!u||!u.g)return false;if((Number(u.g.diamond)||0)<n)return false;u.g.diamond-=n;saveU(u);if(typeof hud==='function')hud();return true}
function rerollGet(){
  const d=get('ADV9_REROLL',{attr:{},pity:{stage:1,count:0},autoDelete:'ZZZ',autoOn:false,autoTimer:null,totalRolls:0});
  /* 遷移：舊版 ADV9_REROLL.gems → 統一 💎(g.diamond)（一次性） */
  if(d.gems!==undefined&&d.gems!==null&&!d.__mig){rrGemEarn(Number(d.gems)||0);delete d.gems;d.__mig=true;rerollSet(d)}
  /* 讓 d.gems 即時映射 g.diamond（不可枚舉，避免被寫回 localStorage） */
  Object.defineProperty(d,'gems',{enumerable:false,configurable:true,
    get(){return rrGemBal()},
    set(v){const u=me();if(u&&u.g){u.g.diamond=v;saveU(u);if(typeof hud==='function')hud()}}
  });
  return d;
}
function rerollSet(d){set('ADV9_REROLL',d)}
function rerollRollAttr(attrId){
  const d=rerollGet();const gems=d.gems||0;
  if(gems<1000)return{ok:false,msg:'💎 寶石不足（需 1000）'};
  d.gems-=1000;d.totalRolls=(d.totalRolls||0)+1;
  /* 保底 */
  const p=d.pity||{stage:1,count:0};p.count+=(activeBuff('double_luck')?2:1);
  let result=null;
  if(p.stage===1&&p.count>=200){result='Z';p.count=0}
  else if(p.stage===2&&p.count>=500){result='ZZ';p.count=0}
  else if(p.stage===3&&p.count>=1000){result='ZZZ';p.count=0}
  else{
    const keys=EQ_RARITIES;const weights={...REROLL_WEIGHTS};
    const total=Object.values(weights).reduce((a,b)=>a+b,0);let r=Math.random()*total;
    for(const k of keys){r-=weights[k]||0;if(r<=0){result=k;break}}
  }
  /* 跳階段 */
  if(result==='Z')p.stage=2;if(result==='ZZ')p.stage=3;if(result==='ZZZ'||result==='∞'){p.stage=1;p.count=0}
  d.pity=p;d.attr[attrId]=result;rerollSet(d);
  return{ok:true,result};
}
function rerollRollAll(){
  const selected=[...document.querySelectorAll('.rerollPick:checked')].map(x=>x.value);
  if(!selected.length)return{ok:false,msg:'請至少勾選一個屬性'};
  return rerollRollAllBatch(selected);
}
function rerollAutoDelete(d){
  const threshold=d.autoDelete||'ZZZ';const thresholds=['R','E','A','S','SS','SSS','Z','ZZ','ZZZ','∞'];
  const maxIdx=thresholds.indexOf(threshold);if(maxIdx<0)return[];
  const toDel=[];REROLL_ATTRS.forEach(a=>{if(d.attr[a.id]&&thresholds.indexOf(d.attr[a.id])<=maxIdx){toDel.push(d.attr[a.id]);d.attr[a.id]=null}});return toDel;
}
function rerollRollAllBatch(selectedIds){
  /* 一次roll全部7個 */
  const d=rerollGet();if((d.gems||0)<500)return{ok:false,msg:'💎 寶石不足'};
  const ids=Array.isArray(selectedIds)&&selectedIds.length?selectedIds:REROLL_ATTRS.map(a=>a.id); d.gems-=500;d.totalRolls=(d.totalRolls||0)+ids.length;
  const results={};const thresholds=['R','E','A','S','SS','SSS','Z','ZZ','ZZZ','∞'];
  REROLL_ATTRS.filter(a=>ids.includes(a.id)).forEach(a=>{
    if(d.attr[a.id]&&thresholds.indexOf(d.attr[a.id])<=thresholds.indexOf(d.autoDelete||'ZZZ')){d.attr[a.id]=null}
    const p=d.pity||{stage:1,count:0};p.count+=(activeBuff('double_luck')?2:1);
    let result=null; const previous=d.attr[a.id];
    if(p.stage===1&&p.count>=200){result='Z';p.count=0}
    else if(p.stage===2&&p.count>=500){result='ZZ';p.count=0}
    else if(p.stage===3&&p.count>=1000){result='ZZZ';p.count=0}
    else{const keys=EQ_RARITIES;const weights={...REROLL_WEIGHTS};const total=Object.values(weights).reduce((a,b)=>a+b,0);let r=Math.random()*total;for(const k of keys){r-=weights[k]||0;if(r<=0){result=k;break}}}
    if(result==='Z')p.stage=2;if(result==='ZZ')p.stage=3;if(result==='ZZZ'||result==='∞'){p.stage=1;p.count=0}
    if(previous&&result===previous){const pi=EQ_RARITIES.indexOf(result);result=EQ_RARITIES[(pi+1)%EQ_RARITIES.length]}
    d.pity=p;results[a.id]=result;
  });
  rerollSet(d);return{ok:true,results};
}
function rerollGrantInfinity(attrId){
  const d=rerollGet();if(!(typeof IS_ADMIN==='function'&&IS_ADMIN()))return{ok:false,msg:'⚠️ 僅管理員可使用'};
  d.attr[attrId]='∞';rerollSet(d);return{ok:true};
}
function rerollGemsForRolls(n){
  /* 100連抽回饋：每100抽返5000宝石 */
  const d=rerollGet();const total=d.totalRolls||0;const batch= Math.floor(total/100);
  const currentBatch=Math.floor((total+n)/100);
  if(currentBatch>batch)d.gems=(d.gems||0)+(currentBatch-batch)*5000;
}

/* ── 公開 API（供外部呼叫）─ */
window.getRerollBonuses=function(){
  const d=rerollGet();const out={};
  const attrMap = {
    chinese: 'language', math: 'math', english: 'english',
    science: 'science', social: 'social', will: 'will', luck: 'luck'
  };
  REROLL_ATTRS.forEach(a=>{
    const r=d.attr[a.id]||'R';
    const b=REROLL_BONUS[r]||{flat:2,mult:1};
    const key = attrMap[a.id] || a.id;
    out[key]={flat:b.flat,mult:b.mult,rarity:r};
  });
  return out;
};
window.getRerollTitle=function(){
  const d=rerollGet();
  const allInf=REROLL_ATTRS.every(a=>d.attr[a.id]==='∞');
  return allInf?'神':null;
};
window.getMaxLevel=function(){
  if(typeof window.ADMIN_MAX_LEVEL === 'number' && window.ADMIN_MAX_LEVEL > 0) return window.ADMIN_MAX_LEVEL;
  const sys=get('ADV9_SYS_SETTINGS',{max_level:300});
  return sys.max_level||300;
};
window.getTotalFreePoints=function(){
  var u=(typeof me==='function')?me():null;
  var lv=(u&&u.g&&u.g.lv)||1;
  return lv*3; /* 與「目前等級」綁定，不給滿級預支 */
};

/* ── 副本系統 ── */


/* 戰鬥模擬 */
function simulateDungeonBattle(playerPower,waveNum,difficulty){
  const baseEnemy=10+waveNum*8;
  const diffMul={normal:1,hard:1.5,hell:2,myth:2.5,inf:3}[difficulty]||1;
  const isBoss=waveNum>=DUNGEON_WAVES[difficulty];
  const enemyPower=baseEnemy*diffMul*(isBoss?3:1);
  const ratio=playerPower/Math.max(1,enemyPower);
  let winChance=ratio>=1.5?90:ratio>=1.2?75:ratio>=1?60:ratio>=.8?40:ratio>=.6?25:10;
  /* 裝備加成 */
  const eqData=eqGet();let bonus=0;
  EQ_SLOT.forEach((s,i)=>{const eid=eqData.equipped[s];const eq=eqData.owned.find(x=>x.id===eid);if(eq){
    if(eq.slot==='武器')bonus+=eq.mainValue*.5;
    if(eq.slot==='戒指')bonus+=eq.subStats.find(x=>x.stat==='暴擊')?.value||0;
    if(eq.slot==='項鍊')bonus+=eq.subStats.find(x=>x.stat==='運氣')?.value||0;
  }});
  winChance=Math.min(95,Math.max(5,winChance+bonus));
  const won=Math.random()*100<winChance;
  return{won,winChance:Math.round(winChance),damage:Math.round(enemyPower*.3+Math.random()*enemyPower*.2)};
}

/* ══════════════════════════════════════════════════════════════
   UI 渲染函數
   ══════════════════════════════════════════════════════════════ */

/* ── 裝備面板 ── */
/* ════════════════════════════════════════════
   vEquip 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 4 個單位：EQ_SLOT, EQ_SLOT_ICON, eqUpgradeCost, vEquip
   ════════════════════════════════════════════ */
const EQ_SLOT=['頭','衣服','褲子','鞋子','武器','戒指','項鍊'];

const EQ_SLOT_ICON=['🪖','👕','👖','👟','⚔️','💍','📿'];

function eqUpgradeCost(lv,rarity){return rarity==='∞'?Math.max(1,Math.ceil(lv/10)):Math.ceil((lv+1)/5)}

/* ════════════════════════════════════════════
   vEquip 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vEquip
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vEquip 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vEquip
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vEquip 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vEquip
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vEquip 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vEquip
   ════════════════════════════════════════════ */
async function vEquip(){
  if(!await needJs(['js/views/vEquip.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vEquip();
}





function eqCardHtml(eq,d){
  const rc=eq.rarity;const borderCls='equipCard'+{R:'R',E:'E',A:'A',S:'S',SS:'SS',SSS:'SSS',Z:'Z',ZZ:'ZZ',ZZZ:'ZZZ','∞':'INF'}[rc]||'';
  const mainStr=EQ_MAIN_ATTR[eq.slot]+': '+eq.mainValue;
  const subHtml=eq.subStats.map(s=>'<div><span>'+EQ_SUB_ICON[s.stat]+' '+s.stat+'</span><span class="sv">'+s.value+'</span></div>').join('');
  const isEquipped=d.equipped[eq.slot]===eq.id;
  return'<div class="equipCard '+borderCls+'" style="animation:pop .3s">'+
    '<div class="equipName equip'+rc+'">'+eq.name+'</div>'+
    '<div class="equipSub">'+eq.slot+'｜'+rc+'級｜'+mainStr+'</div>'+
    '<div class="equipSubs">'+subHtml+'</div>'+
    '<div class="equipLv">⚒️ +'+(eq.level||0)+' / '+eqCap(eq)+'</div>'+
    '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'+
    (isEquipped?'<button class="btn mini" disabled>✅ 已裝備</button>'+
      '<button class="btn ghost mini danger" onclick="eqDrop(\''+eq.slot+'\')">卸下</button>'+
      '<button class="btn mini danger" onclick="eqDelete(\''+eq.id+'\')">🗑️</button>':
      '<button class="btn mini" onclick="eqEquipNow(\''+eq.id+'\',\''+eq.slot+'\')">裝備</button>'+
      '<button class="btn ghost mini" onclick="eqDelete(\''+eq.id+'\')">🗑️</button>')+
    (eq.level<eqCap(eq)?'<button class="btn teal mini" onclick="eqUpgradeNow(\''+eq.id+'\')">⚒️強化(🔩'+eqUpgradeCost(eq.level,eq.rarity)+')</button>':'')+
    '</div></div>';
}
function eqEquipNow(id,slot){const d=eqGet();const eq=d.owned.find(x=>x.id===id);if(!eq)return;
  if(d.equipped[slot]&&d.equipped[slot]!==id){const old=d.equipped[slot];d.equipped[slot]=id;eqSet(d);toast('✅ 已裝備 '+eq.name+'，舊裝備送回背包')}
  else{d.equipped[slot]=id;eqSet(d);toast('✅ 已裝備 '+eq.name)}vEquip()}
function eqDrop(slot){const d=eqGet();d.equipped[slot]=null;eqSet(d);toast('卸下 '+EQ_SLOT_ICON[EQ_SLOT.indexOf(slot)]+slot);vEquip()}
/* 🖱 點部位列（🪖頭/👕衣服…）→ 開啟該部位裝備選擇視窗 */
function eqPickSlot(slot){
  const d=eqGet();const list=d.owned.filter(x=>x.slot===slot);
  if(!list.length){toast('⚠️ 還沒有「'+slot+'」部位的裝備，去副本打怪吧','bad');return}
  const si=EQ_SLOT.indexOf(slot);
  openModal('<h3 class="mt">'+EQ_SLOT_ICON[si]+' 選擇'+slot+'裝備</h3>'+
    '<div style="max-height:52vh;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">'+
    list.map(eq=>{
      const isEq=d.equipped[slot]===eq.id;
      return '<div class="equipCard '+(EQ_RAR_BORDER?EQ_RAR_BORDER(eq.rarity):'')+'" style="animation:pop .3s">'+
        '<div class="equipName equip'+eq.rarity+'">'+esc(eq.name)+'</div>'+
        '<div class="equipSub">'+eq.slot+'｜'+eq.rarity+'級｜'+eq.mainAttr+': '+eq.mainValue+'</div>'+
        '<div class="equipLv">⚒️ +'+(eq.level||0)+' / '+eqCap(eq)+'</div>'+
        (isEq?'<button class="btn mini" style="margin-top:8px" disabled>✅ 已裝備</button>':
        '<button class="btn mini" style="margin-top:8px" onclick="eqEquipNow(\''+eq.id+'\',\''+slot+'\');closeModal()">裝備</button>')+
      '</div>';
    }).join('')+
    '</div><div class="mBtns"><button class="btn ghost" onclick="closeModal()">關閉</button></div>');
}
function eqDelete(id){if(!confirm('確定拆解此裝備？'))return;eqRemove(id);toast('🗑️ 已拆解');vEquip()}
function eqShowDetail(id){const d=eqGet();const eq=d.owned.find(x=>x.id===id);if(!eq)return;
  const subHtml=eq.subStats.map(s=>'<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px"><span>'+EQ_SUB_ICON[s.stat]+' '+s.stat+'</span><b style="color:var(--gold2)">'+s.value+'</b></div>').join('');
  openModal('<h3 class="mt">🔍 裝備詳情</h3>'+
    '<div class="equipCard '+EQ_RAR_BORDER(eq.rarity)+'" style="margin-bottom:12px">'+
    '<div class="equipName equip'+eq.rarity+'">'+eq.name+'</div>'+
    '<div class="equipSub">'+eq.slot+'｜'+eq.rarity+'級｜主屬性: '+eq.mainAttr+' '+eq.mainValue+'</div>'+
    '<div style="margin-top:8px">'+subHtml+'</div>'+
    '<div class="equipLv">⚒️ 強化 +'+(eq.level||0)+' / '+eqCap(eq)+'</div>'+
    '</div><div class="mBtns"><button class="btn" onclick="eqEquipNow(\''+eq.id+'\',\''+eq.slot+'\');closeModal()">裝備</button><button class="btn ghost" onclick="closeModal()">關閉</button></div>');
}
function eqUpgradeNow(id){
  const d=eqGet();const eq=d.owned.find(x=>x.id===id);if(!eq)return;
  const cost=eqUpgradeCost(eq.level,eq.rarity);
  if((d.enhStone||0)<cost)return toast('🔩 強化石不足（需 '+cost+'）','bad');
  if(eq.level>=eqCap(eq))return toast('⚠️ 已達最高等級（等於玩家等級 ×100）','bad');
  d.enhStone-=cost;eqUpgrade(eq,cost);eqSet(d);saveU(me());hud();
  toast('⚒️ '+eq.name+' 強化至 +'+eq.level+'！');vEquip();
}

/* ── 副本面板 ── */
let _dunLoopToken=0,_dunWaveTimer=null; /* 防止重複開戰造成多條 rAF 鏈 */

/* ════════════════════════════════════════════
   vDungeon 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 18 個單位：EQ_RARITIES, EQ_RAR_WEIGHT, rollEqRarity, DUNGEON_DUNGEONS, DUNGEON_WAVES, DUNGEON_LOOT, genDungeonMap, CUR_DUNGEON, DUNGEON_CANVAS, DUNGEON_PLAYER, DUNGEON_ENEMIES, dunLog…
   ════════════════════════════════════════════ */
const EQ_RARITIES=['R','E','A','S','SS','SSS','Z','ZZ','ZZZ','∞'];

const EQ_RAR_WEIGHT={R:307799,E:250000,A:180000,S:120000,SS:80000,SSS:40000,Z:20000,ZZ:2000,ZZZ:200,'∞':1};

function rollEqRarity(dungeonTier){
  /* dungeonTier: 0=普通,1=困難,2=地獄,3=神話,4=∞神域 */
  const keys=EQ_RARITIES;const weights={...EQ_RAR_WEIGHT};
  if(dungeonTier===0){delete weights['Z'];delete weights['ZZ'];delete weights['ZZZ'];delete weights['∞']}
  else if(dungeonTier===1){delete weights['Z'];delete weights['ZZ'];delete weights['ZZZ'];delete weights['∞']}
  else if(dungeonTier===2){delete weights['ZZ'];delete weights['ZZZ'];delete weights['∞']}
  else if(dungeonTier===3){delete weights['∞']}
  const total=Object.values(weights).reduce((a,b)=>a+b,0);
  let r=Math.random()*total;for(const k of keys){if(!weights[k])continue;r-=weights[k];if(r<=0)return k}
  return 'R';
}

const DUNGEON_DUNGEONS={
  normal:{name:'普通副本',tier:0,rarityPool:['R','E','A','S','SS'],minTerritory:0,pkTower:0},
  hard:{name:'困難副本',tier:1,rarityPool:['S','SS','SSS','Z'],minTerritory:50,pkTower:0},
  hell:{name:'地獄副本',tier:2,rarityPool:['SS','SSS','Z','ZZ'],minTerritory:100,pkTower:100},
  myth:{name:'神話副本',tier:3,rarityPool:['SSS','Z','ZZ','ZZZ'],minTerritory:0,pkTower:300},
  inf:{name:'∞神域',tier:4,rarityPool:['Z','ZZ','ZZZ','∞'],minTerritory:0,pkTower:500}
};

const DUNGEON_WAVES={normal:5,hard:10,hell:20,myth:20,inf:20};

const DUNGEON_LOOT={normal:1,hard:2,hell:5,myth:5,inf:5};

function genDungeonMap(difficulty){
  const cfg=DUNGEON_DUNGEONS[difficulty];if(!cfg)return[];
  const waves=DUNGEON_WAVES[difficulty];const map=[];
  for(let w=1;w<=waves;w++){
    const isBoss=w===waves;
    const isMiniBoss=w%5===0&&!isBoss;
    map.push({wave:w,type:isBoss?'boss':isMiniBoss?'mini':'normal',name:isBoss?'💀 BOSS':'👹 小怪波 '+w});
  }
  return map;
}

let CUR_DUNGEON=null; /* {type, map, currentWave, battleState} */

let DUNGEON_CANVAS=null,DUNGEON_CTX=null,DUNGEON_ANIM=null;

let DUNGEON_PLAYER={x:320,y:300,hp:100,maxHp:100,pw:50,cd:0,autoAtk:true,keys:{}};

let DUNGEON_ENEMIES=[];

function dunLog(html){ /* 前置加入日誌，最多保留 60 筆，避免快速點擊讓 DOM 無限膨脹 */
  const log=document.getElementById('dunLog');if(!log)return;
  log.insertAdjacentHTML('afterbegin',html);
  while(log.children.length>60)log.removeChild(log.lastChild);
}

/* ════════════════════════════════════════════
   vDungeon 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vDungeon
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vDungeon 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vDungeon
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vDungeon 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vDungeon
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vDungeon 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vDungeon
   ════════════════════════════════════════════ */
async function vDungeon(){
  if(!await needJs(['js/views/vDungeon.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vDungeon();
}





function initDungeonCanvas(){
  const c=document.getElementById('dungeonCanvas');if(!c)return;
  DUNGEON_CANVAS=c;DUNGEON_CTX=c.getContext('2d');
  /* 鍵盤事件 */
  if(!window._dunKeyHandler){
    window._dunKeyHandler=function(e){
      if(!CUR_DUNGEON||CUR_DUNGEON.phase!=='playing')return;
      if(e.key==='w'||e.key==='W'||e.key==='ArrowUp')DUNGEON_PLAYER.y=Math.max(20,DUNGEON_PLAYER.y-6);
      if(e.key==='s'||e.key==='S'||e.key==='ArrowDown')DUNGEON_PLAYER.y=Math.min(380,DUNGEON_PLAYER.y+6);
      if(e.key==='a'||e.key==='A'||e.key==='ArrowLeft')DUNGEON_PLAYER.x=Math.max(20,DUNGEON_PLAYER.x-6);
      if(e.key==='d'||e.key==='D'||e.key==='ArrowRight')DUNGEON_PLAYER.x=Math.min(620,DUNGEON_PLAYER.x+6);
      if(e.key==='j'||e.key==='J')dunAction('attack');
      if(e.key==='1')dunAction('skill1');
      if(e.key==='2')dunAction('skill2');
      if(e.key===' ')dunAction('dodge');
    };
    window.addEventListener('keydown',window._dunKeyHandler);
  }
  dunDraw();
}

function dunKey(down,key){
  if(!down)return;
  if(key==='w'||key==='arrowup')DUNGEON_PLAYER.y=Math.max(20,DUNGEON_PLAYER.y-6);
  if(key==='s'||key==='arrowdown')DUNGEON_PLAYER.y=Math.min(380,DUNGEON_PLAYER.y+6);
  if(key==='a'||key==='arrowleft')DUNGEON_PLAYER.x=Math.max(20,DUNGEON_PLAYER.x-6);
  if(key==='d'||key==='arrowright')DUNGEON_PLAYER.x=Math.min(620,DUNGEON_PLAYER.x+6);
}

function dunAction(action){
  if(!CUR_DUNGEON||CUR_DUNGEON.phase!=='playing')return;
  const p=DUNGEON_PLAYER;if(!p)return;
  if(action==='attack'){
    /* 攻擊最接近的敵人 */
    let nearest=null,minDist=9999;
    DUNGEON_ENEMIES.forEach(e=>{if(!e.alive)return;const dx=p.x-e.x,dy=p.y-e.y;const dist=Math.sqrt(dx*dx+dy*dy);if(dist<minDist){minDist=dist;nearest=e}});
    if(nearest&&minDist<80){
      const dmg=Math.round(p.pw*(0.8+Math.random()*0.4));
      nearest.hp-=dmg;
      dunLog('<div class="dmg">⚔️ 你對 '+nearest.name+' 造成 '+dmg+' 點傷害！（剩餘 '+Math.max(0,nearest.hp)+' HP）</div>');
      if(nearest.hp<=0){nearest.alive=false;dunLog('<div class="info">💀 '+nearest.name+' 被擊敗！</div>')}
    }else dunLog('<div class="info">📭 太遠了，接近敵人再攻擊！</div>');
  }else if(action==='skill1'){
    if(p.skills[1]>0)return;p.skills[1]=60;
    DUNGEON_ENEMIES.forEach(e=>{if(!e.alive)return;const dmg=Math.round(p.pw*1.5*(0.8+Math.random()*0.4));e.hp-=dmg;
      if(e.hp<=0){e.alive=false;dunLog('<div class="crit">🔥 技能1 擊敗了 '+e.name+'！</div>')}
      else dunLog('<div class="dmg">🔥 技能1 對 '+e.name+' 造成 '+dmg+' 點傷害！</div>');
    });
  }else if(action==='skill2'){
    if(p.skills[2]>0)return;p.skills[2]=90;
    const heal=Math.round(p.maxHp*0.3);p.hp=Math.min(p.maxHp,p.hp+heal);
    dunLog('<div class="heal">💫 技能2 恢復 '+heal+' HP！</div>');
  }else if(action==='dodge'){
    if(p.dodgeCd>0)return;p.dodgeCd=120;p.dodging=true;
    setTimeout(()=>{if(DUNGEON_PLAYER)DUNGEON_PLAYER.dodging=false},500);
    dunLog('<div class="info">💨 閃避中！（5秒內不受傷害）</div>');
  }
  updateDunUI();dunDraw();
}

function dunDraw(){
  const c=DUNGEON_CANVAS;if(!c)return;const ctx=DUNGEON_CTX;if(!ctx)return;
  ctx.fillStyle='#0a0e1a';ctx.fillRect(0,0,640,400);
  /* 網格 */
  ctx.strokeStyle='rgba(44,61,99,.3)';ctx.lineWidth=1;
  for(let x=0;x<640;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,400);ctx.stroke()}
  for(let y=0;y<400;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(640,y);ctx.stroke()}
  /* 玩家 */
  const p=DUNGEON_PLAYER;if(p){
    ctx.fillStyle=p.dodging?'rgba(255,217,122,.5)':'rgba(56,217,192,.8)';
    ctx.beginPath();ctx.arc(p.x,p.y,16,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 14px sans-serif';ctx.textAlign='center';
    ctx.fillText('🧑',p.x,p.y+5);
  }
  /* 敵人 */
  DUNGEON_ENEMIES.forEach(e=>{
    if(!e.alive)return;
    ctx.fillStyle='#ef5350';ctx.beginPath();ctx.arc(e.x,e.y,14,0,Math.PI*2);ctx.fill();
    ctx.font='16px serif';ctx.textAlign='center';
    ctx.fillText(e.type==='boss'?'👹':'👾',e.x,e.y+5);
    /* HP bar */
    ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(e.x-14,e.y-22,28,4);
    ctx.fillStyle='#ef5350';ctx.fillRect(e.x-14,e.y-22,28*(e.hp/e.maxHp),4);
  });
  /* 紅圈預警（BOSS技能） */
  DUNGEON_ENEMIES.forEach(e=>{
    if(!e.alive||e.type!=='boss')return;
    if(e.atkCd>40){ctx.strokeStyle='rgba(239,83,80,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p?p.x:320,p?p.y:300,60,0,Math.PI*2);ctx.stroke()}
  });
}

function updateDunUI(){
  const p=DUNGEON_PLAYER;if(!p)return;
  const hpBar=document.getElementById('dunPlayerHp');const hpTxt=document.getElementById('dunHpTxt');
  const enemyHpBar=document.getElementById('dunEnemyHp');const enemyHpTxt=document.getElementById('dunEnemyHpTxt');
  const mobList=document.getElementById('dunMobList');
  if(hpBar)hpBar.style.width=(p.hp/p.maxHp*100)+'%';
  if(hpTxt)hpTxt.textContent=Math.max(0,p.hp)+'/'+p.maxHp;
  const alive=DUNGEON_ENEMIES.filter(e=>e.alive);
  if(alive.length){
    const boss=alive.find(e=>e.type==='boss');
    if(boss&&enemyHpBar){enemyHpBar.style.width=(boss.hp/boss.maxHp*100)+'%'}
    if(enemyHpTxt)enemyHpTxt.textContent=alive.map(e=>e.name+(e.type==='boss'?'(BOSS)':'')).join(', ')+' ('+alive.length+'隻)';
  }else{if(enemyHpBar)enemyHpBar.style.width='0%';if(enemyHpTxt)enemyHpTxt.textContent='-'}
  if(mobList)mobList.innerHTML=DUNGEON_ENEMIES.map(e=>
    '<span class="dungeonMob '+(e.alive?(e.type==='boss'?'boss':'alive'):'dead')+'">'+e.emoji+' '+(e.type==='boss'?'BOSS':'小怪')+'</span>'
  ).join('');
}

function renderDungeonBattle(){
  const d=CUR_DUNGEON;if(!d||d.phase==='done')return'';
  let html='';
  html+='<div class="panel" style="margin-top:14px;padding:12px"><h4 style="font-family:var(--serif);color:var(--gold2);margin-bottom:8px">⚔️ 副本進行中：'+DUNGEON_DUNGEONS[d.type]?.name+'</h4>';
  /* 地圖 + 戰鬥 */
  html+='<div style="display:grid;grid-template-columns:1fr 300px;gap:12px;align-items:start">';
  /* 地圖區 */
  html+='<div><div style="font-size:13px;font-weight:700;margin-bottom:6px;color:var(--txt)">🗺️ 地圖</div>';
  html+='<div class="dungeonCanvasWrap"><canvas id="dungeonCanvas" width="640" height="400"></canvas>';
  html+='<div class="touchControls" id="touchCtrl"><div class="touchDpad">'+
    '<div class="empty"></div><div class="touchCtrl" ontouchstart="dunKey(true,\'w\')" ontouchend="dunKey(false,\'w\')">⬆️</div><div class="empty"></div>'+
    '<div class="touchCtrl" ontouchstart="dunKey(true,\'a\')" ontouchend="dunKey(false,\'a\')">⬅️</div>'+
    '<div class="touchCtrl" onclick="dunAction(\'attack\')" style="background:rgba(239,83,80,.3)">⚔️</div>'+
    '<div class="touchCtrl" ontouchstart="dunKey(true,\'d\')" ontouchend="dunKey(false,\'d\')">➡️</div>'+
    '<div class="empty"></div><div class="touchCtrl" ontouchstart="dunKey(true,\'s\')" ontouchend="dunKey(false,\'s\')">⬇️</div><div class="empty"></div>'+
  '</div><div style="display:flex;gap:8px;justify-content:center;margin-top:8px">'+
  '<button class="touchCtrl" onclick="dunAction(\'skill1\')" style="background:rgba(100,181,246,.3)">1️⃣</button>'+
  '<button class="touchCtrl" onclick="dunAction(\'skill2\')" style="background:rgba(149,117,205,.3)">2️⃣</button>'+
  '<button class="touchCtrl" onclick="dunAction(\'skill3\')" style="background:rgba(224,64,251,.3)">3️⃣</button>'+
  '<button class="touchCtrl" onclick="dunAction(\'dodge\')" style="background:rgba(255,152,0,.3)">💨</button>'+
  '</div></div></div>';
  /* 資訊區 */
  html+='<div>';
  html+='<div class="dungeonHUD">';
  html+='<div class="dungeonWave">波次 '+(d.currentWave||1)+'/'+(d.map?.length||0)+'</div>';
  html+='<div class="dungeonHPBar"><div class="bar" style="height:12px"><i id="dunPlayerHp" style="width:100%;background:linear-gradient(90deg,#4caf50,#8ee06a)"></i></div>';
  html+='<div style="font-size:11px;color:var(--mut)">❤️ <span id="dunHpTxt">100/100</span></div></div>';
  html+='</div>';
  html+='<div class="dungeonEnemyHP" style="margin-bottom:8px"><div class="bar" style="height:12px"><i id="dunEnemyHp" style="width:0%;background:linear-gradient(90deg,#e5484d,#ff8a80)"></i></div>';
  html+='<div style="font-size:11px;color:var(--mut)">👹 敵人 HP: <span id="dunEnemyHpTxt">-</span></div></div>';
  html+='<div style="font-size:12px;color:var(--mut);margin-bottom:6px">👾 小怪列表：</div>';
  html+='<div class="dungeonMobList" id="dunMobList"></div>';
  html+='<div style="font-size:12px;color:var(--mut);margin:6px 0 3px">📜 戰鬥日誌：</div>';
  html+='<div class="dungeonLog" id="dunLog"></div>';
  html+='<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">'+
    '<button class="btn mini" onclick="dunAction(\'attack\')">⚔️ 普攻</button>'+
    '<button class="btn ghost mini" onclick="dunAction(\'skill1\')">🔥 技能1</button>'+
    '<button class="btn ghost mini" onclick="dunAction(\'skill2\')">💫 技能2</button>'+
    '<button class="btn ghost mini" onclick="dunAction(\'dodge\')">💨 閃避</button>'+
    '<button class="btn ghost mini" onclick="dunCancel()">✕ 撤退</button>'+
    '</div></div></div></div></div>';
  return html;
}
function enterDungeon(type){
  const u=me();if(!u||!u.g)return toast('⚠️ 請先登入','bad');
  if(CUR_DUNGEON&&CUR_DUNGEON.phase==='playing')return toast('⚠️ 副本進行中，先撤退或等結束','bad');
  const cfg=DUNGEON_DUNGEONS[type];if(!cfg)return;
  if(_dunWaveTimer){clearTimeout(_dunWaveTimer);_dunWaveTimer=null}
  CUR_DUNGEON={type,map:genDungeonMap(type),currentWave:0,phase:'playing',players:1,loot:[],_loopToken:0};
  vDungeon();
  startDungeonWave();
}
function startDungeonWave(){
  if(!CUR_DUNGEON||CUR_DUNGEON.phase!=='playing')return;
  const w=CUR_DUNGEON.currentWave;
  if(w>=CUR_DUNGEON.map.length){dungeonComplete();return}
  CUR_DUNGEON._loopToken=++_dunLoopToken; /* 舊 rAF 鏈在下一個 frame 自動停止 */
  const wave=CUR_DUNGEON.map[w];CUR_DUNGEON.currentWave=w+1;
  const enemyCount=wave.type==='boss'?1:2+Math.floor(Math.random()*2);
  DUNGEON_ENEMIES=[];
  for(let i=0;i<enemyCount;i++){
    let ex=100+Math.random()*440,ey=50+Math.random()*300;
    while(Math.hypot(ex-320,ey-300)<90){ex=100+Math.random()*440;ey=50+Math.random()*300} /* 別貼著玩家出生 */
    DUNGEON_ENEMIES.push({
      id:i,x:ex,y:ey,
      hp:wave.type==='boss'?200+w*20:30+w*5,maxHp:wave.type==='boss'?200+w*20:30+w*5,
      pw:wave.type==='boss'?30+w*5:5+w*2,
      type:wave.type,name:wave.type==='boss'?'BOSS':'小怪',
      alive:true,emoji:wave.type==='boss'?'👹':'👾',
      atkCd:0
    });
  }
  /* 重置玩家 */
  const u=me();const g=u.g;
  DUNGEON_PLAYER={x:320,y:300,hp:100,maxHp:100,pw:power(g)*0.05+10,cd:0,dodging:false,dodgeCd:0,skills:{1:0,2:0}};
  dunLog('<div class="info">📢 波次 '+(w+1)+': '+wave.name+' 出現！</div>');
  initDungeonCanvas();
  dunLoop();
  updateDunUI();
}
function dunLoop(){
  if(!CUR_DUNGEON||CUR_DUNGEON.phase!=='playing'||_dunLoopToken!==CUR_DUNGEON._loopToken)return;
  const p=DUNGEON_PLAYER;if(!p)return;
  /* 更新冷卻 */
  if(p.cd>0)p.cd--;if(p.dodgeCd>0)p.dodgeCd--;if(p.skills[1]>0)p.skills[1]--;if(p.skills[2]>0)p.skills[2]--;
  /* 敵人AI */
  DUNGEON_ENEMIES.forEach(e=>{
    if(!e.alive)return;
    const dx=p.x-e.x,dy=p.y-e.y;const dist=Math.sqrt(dx*dx+dy*dy);
    if(dist>40){e.x+=dx/dist*1.5;e.y+=dy/dist*1.5;e.x=Math.max(20,Math.min(620,e.x));e.y=Math.max(20,Math.min(380,e.y))}
    if(dist<50&&e.atkCd<=0&&!p.dodging){
      const dmg=Math.round(e.pw*(0.7+Math.random()*0.6));
      p.hp-=dmg;e.atkCd=60;
      dunLog('<div class="dmg">💥 '+e.name+' 對你造成 '+dmg+' 點傷害！（HP: '+p.hp+'/'+p.maxHp+'）</div>');
      if(p.hp<=0){dungeonFail();return}
    }
    if(e.atkCd>0)e.atkCd--;
  });
  /* 檢查波次是否清除 */
  const alive=DUNGEON_ENEMIES.filter(e=>e.alive);
  if(!alive.length){
    dunLog('<div class="info">✨ 波次 '+CUR_DUNGEON.currentWave+' 清除！</div>');
    if(_dunWaveTimer)clearTimeout(_dunWaveTimer);
    _dunWaveTimer=setTimeout(()=>startDungeonWave(),1500);
    return;
  }
  dunDraw();updateDunUI();
  DUNGEON_ANIM=requestAnimationFrame(dunLoop);
}
function dungeonComplete(){
  if(!CUR_DUNGEON)return;CUR_DUNGEON.phase='done';
  if(_dunWaveTimer){clearTimeout(_dunWaveTimer);_dunWaveTimer=null}
  if(DUNGEON_ANIM)cancelAnimationFrame(DUNGEON_ANIM);
  dunLog('<div class="info" style="font-size:16px">🎉 副本通關！</div>');
  /* 計算掉落 */
  const type=CUR_DUNGEON.type;const cfg=DUNGEON_DUNGEONS[type];const count=DUNGEON_LOOT[type];
  const extra=count+Math.floor(CUR_DUNGEON.players*0.1*count); /* 人數加成 */
  const looted=[];
  for(let i=0;i<Math.min(extra,10);i++){
    const slot=pick(EQ_SLOT);const eq=genEquipment(slot,cfg.tier);
    eqAdd(eq);looted.push(eq);
  }
  /* Z以上全服公告 */
  const zOrAbove=looted.some(e=>{const ord={R:0,E:1,A:2,S:3,SS:4,SSS:5,Z:6,ZZ:7,ZZZ:8,'∞':9};return(ord[e.rarity]||0)>=6});
  if(zOrAbove){
    const chat=get(LS.chat,[]);
    chat.push({user:'系統',role:'system',text:'📢 全服公告：'+me().name+' 在【'+cfg.name+'】獲得 Z 以上裝備！',time:Date.now()});
    set(LS.chat,chat);
  }
  /* 顯示掉落 */
  const lootHtml=looted.map(eq=>'<div class="equipCard '+EQ_RAR_BORDER(eq.rarity)+'" style="margin:4px 0"><div class="equipName equip'+eq.rarity+'">'+eq.name+'</div><div class="equipSub">'+eq.slot+'｜'+eq.rarity+'｜主屬性: '+eq.mainAttr+': '+eq.mainValue+'</div></div>').join('');
  openModal('<h3 class="mt">🎉 副本通關！</h3>'+
    '<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2)">🏆 '+cfg.name+' 第 '+CUR_DUNGEON.currentWave+' 波全部清除！</b></div>'+
    '<div style="margin-bottom:12px"><b style="color:var(--teal)">🎁 獲得裝備（'+looted.length+'件）：</b><div style="margin-top:8px">'+lootHtml+'</div></div>'+
    '<div class="mBtns"><button class="btn" onclick="closeModal();vDungeon()">返回副本</button></div>');
  CUR_DUNGEON=null;saveU(me());hud();
}
function dungeonFail(){
  if(!CUR_DUNGEON)return;CUR_DUNGEON.phase='failed';
  if(_dunWaveTimer){clearTimeout(_dunWaveTimer);_dunWaveTimer=null}
  if(DUNGEON_ANIM)cancelAnimationFrame(DUNGEON_ANIM);
  dunLog('<div class="dmg" style="font-size:16px">💀 你被擊敗了...</div>');
  setTimeout(()=>{
    openModal('<h3 class="mt">💀 副本失敗</h3><p class="msub">你已被擊敗，返回副本選擇界面。</p>'+
      '<div class="mBtns"><button class="btn" onclick="closeModal();vDungeon()">返回</button></div>');
    CUR_DUNGEON=null;
  },2000);
}
function dunCancel(){
  if(!CUR_DUNGEON)return;if(_dunWaveTimer){clearTimeout(_dunWaveTimer);_dunWaveTimer=null}
  if(DUNGEON_ANIM)cancelAnimationFrame(DUNGEON_ANIM);
  CUR_DUNGEON=null;toast('已撤退');vDungeon();
}

/* ── 重新滾動統計值面板 ── */

/* ════════════════════════════════════════════
   vReroll 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：EQ_BADGE_CSS, vReroll
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vReroll 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：EQ_BADGE_CSS, vReroll
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vReroll 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：EQ_BADGE_CSS, vReroll
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vReroll 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：EQ_BADGE_CSS, vReroll
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vReroll 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：EQ_BADGE_CSS, vReroll
   ════════════════════════════════════════════ */

async function vReroll(){
  if(!await needJs(['js/views/vReroll.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vReroll();
}





function rerollOne(attrId){
  const r=rerollRollAttr(attrId);
  if(!r.ok){toast(r.msg,'bad');return}
  toast('🔄 '+attrId+' → '+r.result);rerollGemsForRolls(1);vReroll();
}
function rerollAll(){
  const d=rerollGet();if((d.gems||0)<500)return toast('💎 寶石不足（需 500）','bad');
  const selected=[...document.querySelectorAll('.rerollPick:checked')].map(x=>x.value);if(!selected.length)return toast('請至少勾選一個屬性','bad');
  const r=rerollRollAllBatch(selected);
  if(!r.ok){toast(r.msg,'bad');return}
  toast('✨ 全部重新滾動完成！');rerollGemsForRolls(selected.length);vReroll();
}
function toggleAutoReroll(on){const d=rerollGet();d.autoOn=on;rerollSet(d);if(on)startAutoReroll()}
function startAutoReroll(){
  const tick=()=>{
    const d=rerollGet();if(!d.autoOn||d.gems<7000){d.autoOn=false;rerollSet(d);return}
    const r=rerollRollAllBatch(REROLL_ATTRS.map(a=>a.id));
    if(r.ok)toast('🔄 自動滾動完成！');
    rerollSet(d);
    /* 1秒後繼續 */
    setTimeout(()=>{const d2=rerollGet();if(d2.autoOn&&d2.gems>=7000)tick()},1000);
  };tick();
}
function setAutoDelete(v){const d=rerollGet();d.autoDelete=v;rerollSet(d)}
function rerollGrant(attrId){
  const r=rerollGrantInfinity(attrId);
  if(!r.ok){toast(r.msg,'bad');return}
  toast('👑 已授予 '+attrId+' ∞ 神階！');vReroll();
}

/* ══════════════════════════════════════════════════════════════
   九大強化版新系統實作
   ══════════════════════════════════════════════════════════════ */

/* ── 1. 自由加點系統 ── */
function freePointsGet(){
  const u=me();
  const blank={allocated:{luck_drop:0,combat_power:0,gem_bonus:0,gold_bonus:0,gacha_luck:0}};
  if(!u||!u.g)return blank;
  u.g.freePoints=u.g.freePoints||blank;
  u.g.freePoints.allocated=u.g.freePoints.allocated||blank.allocated;
  return u.g.freePoints;
}
function freePointsSet(d){
  const u=me();if(!u||!u.g)return;
  u.g.freePoints=d;saveU(u);
}

function getFreePointsInfo(){
  const maxLvl = window.getMaxLevel();
  const curLvl = (typeof me==='function' && me() && me().g && me().g.lv) ? me().g.lv : 1;
  const totalEarned = curLvl * 3; /* 自由點數 = 目前等級 × 3，不預支滿級 */
  const d = freePointsGet();
  const alloc = d.allocated || {};
  const totalAllocated = Object.values(alloc).reduce((a,b)=>a+b, 0);
  const remaining = Math.max(0, totalEarned - totalAllocated);
  const sys = get('ADV9_SYS_SETTINGS', { free_point_single_limit: 300 });
  const singleLimit = sys.free_point_single_limit || 300;
  return { maxLvl, curLvl, totalEarned, totalAllocated, remaining, singleLimit, alloc };
}

function isFreePointsFullyAllocated(){
  const info = getFreePointsInfo();
  if (info.remaining === 0) return true;
  const dirs = ['luck_drop', 'combat_power', 'gem_bonus', 'gold_bonus', 'gacha_luck'];
  const allMaxed = dirs.every(k => (info.alloc[k] || 0) >= info.singleLimit);
  return allMaxed;
}

/* ════════════════════════════════════════════
   vFreePoints 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vFreePoints
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vFreePoints 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vFreePoints
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vFreePoints 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vFreePoints
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vFreePoints 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vFreePoints
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vFreePoints 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vFreePoints
   ════════════════════════════════════════════ */
async function vFreePoints(){
  if(!await needJs(['js/views/vFreePoints.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vFreePoints();
}






function addFreePoint(key, delta){
  const info = getFreePointsInfo();
  const fp = freePointsGet();
  let val = fp.allocated[key] || 0;
  if (delta > 0) {
    if (info.remaining <= 0) return toast('⚠️ 尚無剩餘自由點數', 'bad');
    const realAdd = Math.min(delta, info.remaining, info.singleLimit - val);
    if (realAdd <= 0) return toast('⚠️ 已達該方向單項上限 (' + info.singleLimit + ')', 'bad');
    fp.allocated[key] = val + realAdd;
  } else if (delta < 0) {
    const realSub = Math.min(Math.abs(delta), val);
    fp.allocated[key] = val - realSub;
  }
  freePointsSet(fp);
  vFreePoints();
}

function resetFreePoints(){
  const fp = freePointsGet();
  fp.allocated = { luck_drop: 0, combat_power: 0, gem_bonus: 0, gold_bonus: 0, gacha_luck: 0 };
  freePointsSet(fp);
  toast('✅ 已重置自由加點');
  vFreePoints();
}

/* ── 2. ∞ 七階段換取系統 ── */

/* ════════════════════════════════════════════
   vInfinityExchange 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：getAdaptedLevelRequirement, vInfinityExchange
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vInfinityExchange 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：getAdaptedLevelRequirement, vInfinityExchange
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vInfinityExchange 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：getAdaptedLevelRequirement, vInfinityExchange
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vInfinityExchange 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：getAdaptedLevelRequirement, vInfinityExchange
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vInfinityExchange 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：getAdaptedLevelRequirement, vInfinityExchange
   ════════════════════════════════════════════ */

async function vInfinityExchange(){
  if(!await needJs(['js/views/vInfinityExchange.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vInfinityExchange();
}






function executeInfinityExchange(stageNum){
  const sel = $('#exAttrSel_' + stageNum);
  if (!sel) return;
  const attrId = sel.value;
  const aObj = REROLL_ATTRS.find(x => x.id === attrId);
  if (!confirm('確定要將【' + (aObj?aObj.name:attrId) + '】提升至 ∞ 神階嗎？此選擇無法變更。')) return;

  const d = rerollGet();
  d.attr[attrId] = '∞';
  rerollSet(d);

  const exProgress = get('ADV9_INF_EXCHANGE', { currentStage: 1, history: [] });
  exProgress.history.push({
    stage: stageNum,
    subject: attrId,
    timestamp: Date.now(),
    pkTower: get('ADV9_PK_TOWER_FLOOR', 0),
    is_admin_grant: false
  });
  exProgress.currentStage = stageNum + 1;
  set('ADV9_INF_EXCHANGE', exProgress);

  toast('🎉 成功完成第 ' + stageNum + ' 階段換取！獲得 ' + (aObj?aObj.name:attrId) + ' ∞！');
  vInfinityExchange();
}

/* ── 3. 雙倍增益商店與增益背包 ── */
function buffGet(){
  return get('ADV9_BUFFS', {
    inventory: [
      { id: 'b1', type: 'double_luck', name: '🍀 雙倍運氣券', duration: '1小時', durationMs: 3600000 },
      { id: 'b2', type: 'double_gold', name: '💰 雙倍金幣券', duration: '1小時', durationMs: 3600000 }
    ],
    active: null
  });
}
function buffSet(d){ set('ADV9_BUFFS', d); }

function checkBuffActive(){
  const b = buffGet();
  if (b.active && b.active.expireTime && Date.now() > b.active.expireTime) {
    b.active = null;
    buffSet(b);
  }
  return b.active;
}
function activeBuff(t){const b=checkBuffActive();return (b&&(!t||b.type===t))?b:null;}

/* ════════════════════════════════════════════
   vBuffStore 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBuffStore
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vBuffStore 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBuffStore
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vBuffStore 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBuffStore
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vBuffStore 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBuffStore
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vBuffStore 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBuffStore
   ════════════════════════════════════════════ */
async function vBuffStore(){
  if(!await needJs(['js/views/vBuffStore.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vBuffStore();
}






function buyBuff(idx, payMethod){
  const shopItems = [
    { type: 'double_luck', name: '🍀 雙倍運氣券', duration: '1小時', costCoins: 20, costGems: 1000, ms: 3600000 },
    { type: 'double_gold', name: '💰 雙倍金幣券', duration: '1小時', costCoins: 20, costGems: 1000, ms: 3600000 },
    { type: 'double_gems', name: '💎 雙倍寶石券', duration: '1小時', costCoins: 30, costGems: 1500, ms: 3600000 },
    { type: 'double_chests', name: '🎁 雙倍寶箱券', duration: '1小時', costCoins: 40, costGems: 2000, ms: 3600000 }
  ];
  const item = shopItems[idx];
  if (!item) return;

  if (payMethod === 'coins') {
    const u=me();u.g.star=u.g.star||{coin:0}; let coins=Number(u.g.star.coin)||0;
    if (coins < item.costCoins) return toast('⭐ 星辰幣不足', 'bad');
    u.g.star.coin=coins-item.costCoins; saveU(u);
  } else {
    let r = rerollGet();
    if (r.gems < item.costGems) return toast('💎 寶石不足', 'bad');
    r.gems -= item.costGems;
    rerollSet(r);
  }

  const b = buffGet();
  b.inventory.push({ id: 'b_' + Date.now(), type: item.type, name: item.name, duration: item.duration, durationMs: item.ms });
  buffSet(b);
  toast('✅ 購買成功，已放入增益道具背包！');
  vBuffStore();
}

function useBuff(index){
  const b = buffGet();
  const active = checkBuffActive();
  const item = b.inventory[index];
  if (!item) return;

  if (active) {
    if (!confirm('當前已有『' + active.name + '』生效中，替換將終止原增益。是否確定使用？')) return;
  }

  b.active = {
    type: item.type,
    name: item.name,
    startTime: Date.now(),
    expireTime: Date.now() + item.durationMs
  };
  b.inventory.splice(index, 1);
  buffSet(b);
  toast('🔥 已激活 ' + item.name + '！');
  vBuffStore();
}

/* ── 4. 社交送禮與禮物盒 ── */
function openGiftBoxModal(buffIndex){
  const b = buffGet();
  const item = b.inventory[buffIndex];
  if (!item) return;
  var _u=me();
  const friends = get(LS.users, []).filter(u => _u && u.id !== _u.id);

  let html = '<h3 class="mt">🎁 包裝禮物盒並贈送</h3>';
  html += '<p class="msub">將『' + item.name + '』包裝為禮物盒發送給好友</p>';
  html += '<label class="mlab">選擇接收好友：<select id="giftFriendSel">';
  friends.forEach(f => { html += '<option value="' + f.id + '">' + esc(f.name) + '</option>'; });
  html += '</select></label>';
  html += '<label class="mlab">選擇禮物盒包裝顏色：<select id="giftBoxColor">';
  html += '<option value="white">⚪ 白色：普通禮物盒</option>';
  html += '<option value="blue">🔵 藍色：稀有禮物盒</option>';
  html += '<option value="purple">🟣 紫色：史詩禮物盒</option>';
  html += '<option value="gold">🟡 金色：傳說禮物盒</option>';
  html += '<option value="rainbow">🌈 彩虹色：∞ 神級禮物盒</option>';
  html += '</select></label>';
  html += '<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button><button class="btn" onclick="sendGiftBox(' + buffIndex + ')">📤 確定送出</button></div>';
  openModal(html);
}

function sendGiftBox(buffIndex){
  const friendId = $('#giftFriendSel').value;
  const color = $('#giftBoxColor').value;
  const b = buffGet();
  const item = b.inventory[buffIndex];
  if (!item || !friendId) return;

  const logs = get('ADV9_GIFT_LOGS', []);
  var _gu=me();
  logs.push({
    id: 'gift_' + Date.now(),
    from: _gu?_gu.id:'',
    fromName: _gu?_gu.name:'',
    to: friendId,
    item: item,
    boxColor: color,
    timestamp: Date.now()
  });
  set('ADV9_GIFT_LOGS', logs);

  b.inventory.splice(buffIndex, 1);
  buffSet(b);
  closeModal();
  toast('🎁 禮物盒已成功送出！');
  vBuffStore();
}

/* ── 5. 管理員專屬面板與設定 ── */
/* ════════════════════════════════════════════
   vAdminPanel 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vAdminPanel, adminSystemBackup
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAdminPanel 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vAdminPanel, adminSystemBackup
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAdminPanel 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vAdminPanel, adminSystemBackup
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAdminPanel 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vAdminPanel, adminSystemBackup
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAdminPanel 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vAdminPanel, adminSystemBackup
   ════════════════════════════════════════════ */
async function vAdminPanel(){
  if(!await needJs(['js/views/vAdminPanel.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vAdminPanel();
}











function saveAdminSysSettings(){
  const maxLvl = Math.max(300, +$('#admMaxLvlInput').value || 300); /* 最低 300，不可調低 */
  const singleCap = +$('#admSingleCapInput').value || 300;
  const sys = get('ADV9_SYS_SETTINGS', {});
  sys.max_level = maxLvl;
  sys.free_point_single_limit = singleCap;
  set('ADV9_SYS_SETTINGS', sys);
  window.ADMIN_MAX_LEVEL = maxLvl;
  toast('✅ 系統參數已成功儲存！');
}

function toggleFestivalMode(on){
  const sys = get('ADV9_SYS_SETTINGS', {});
  sys.festival_mode = on;
  set('ADV9_SYS_SETTINGS', sys);
  toast(on ? '🎉 全校節日雙倍歡樂時間已開啟！' : '節日模式已關閉');
}

function adminGrantInfinity(){
  const uid = $('#admGrantUser').value;
  const attrId = $('#admGrantAttr').value;
  const reason = $('#admGrantReason').value.trim();
  if (!reason) return toast('⚠️ 請輸入發放原因', 'bad');
  if (!uid) return toast('⚠️ 請選擇目標用戶', 'bad');

  /* 寫入目標用戶的 reroll 資料（經由 server KV） */
  fetch(SUPA_URL+'/rest/v1/admin/reroll_grant',{
    method:'POST',
    headers:{'Content-Type':'application/json',...supaHeaders()},
    body:JSON.stringify({target:uid,attr:attrId,value:'∞',reason})
  }).then(r=>r.json()).then(j=>{
    if(j.ok){
      const logs = get('ADV9_ADMIN_OP_LOGS', []);
      logs.push({time:Date.now(),op:'GRANT_INFINITY',target:uid,attr:attrId,reason,operator:me()?me().username:'?'});
      set('ADV9_ADMIN_OP_LOGS', logs);
      toast('👑 已贈送 ∞ 給 '+uid+' 並寫入管理員日誌！');
    } else { toast('⚠️ 發送失敗：'+(j.error||'未知錯誤'),'bad'); }
  }).catch(()=>toast('⚠️ 伺服器連線失敗','bad'));
}

function adminCreateCode(){
  const code = $('#admCodeInput').value.trim().toUpperCase();
  const coins = +$('#admCodeCoins').value || 0;
  const gems = +$('#admCodeGems').value || 0;
  if (!code) return toast('⚠️ 請輸入禮包碼', 'bad');

  const sys = get('ADV9_SYS_SETTINGS', { promo_codes: {} });
  sys.promo_codes = sys.promo_codes || {};
  sys.promo_codes[code] = { star_coins: coins, gems: gems, used: [] };
  set('ADV9_SYS_SETTINGS', sys);
  toast('🎁 禮包碼 [' + code + '] 生成成功！');
}

function adminExportUserJSON(){
  const selEl=document.getElementById('admGrantUser')||document.getElementById('admUserSelect');
  const uid=selEl?selEl.value:'';
  const users=get(LS.users,[]);
  const u=uid?users.find(x=>x.username===uid):me();
  if(!u)return toast('⚠️ 找不到用戶資料','bad');
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(u, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", u.role + "_" + u.username + ".json");
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
}

function adminImportUserJSON(input){
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    try {
      const j = JSON.parse(e.target.result);
      if (j && j.username) {
        saveU(j);
        toast('✅ 使用者資料匯入成功！');
      }
    } catch(err) { toast('⚠️ 無效的 JSON 檔案', 'bad'); }
  };
  reader.readAsText(file);
}


function adminSystemRestore(input){
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    try {
      const j = JSON.parse(e.target.result);
      fetch('/rest/v1/system_restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-adv9-token': WTOKEN },
        body: JSON.stringify(j)
      }).then(r => r.json()).then(res => {
        if (res.ok) toast('✅ 全系統還原成功！');
      });
    } catch(err) { toast('⚠️ 還原失敗', 'bad'); }
  };
  reader.readAsText(file);
}


/* ══════════════════════════════════════════════════════════════
   整合進主介面
   ══════════════════════════════════════════════════════════════ */

/* 直接在 FEATS 陣列結尾追加新功能 */
FEATS.push(
  ['⚔️','裝備紙娃娃','7欄位・稀有度 Roll・升級','#ff9800','vEquip()'],
  ['🏰','副本戰鬥','2D即時戰鬥・打怪掉裝備','#ef5350','vDungeon()'],
  ['💪','自由加點','5大方向加成・點數分配','#26a69a','vFreePoints()'],
  ['♾️','∞ 神階換取','七階段考驗・神級學科換取','#7e57c2','vInfinityExchange()'],
  ['🧪','雙倍增益與商店','星辰幣・4種雙倍・7種時長','#ffa726','vBuffStore()'],
  ['💻','虛擬終端','AI 驅動・模擬真實指令列','#00e676','vTerminal()'],
  ['👑','管理員系統控制台','等級上限・單項上限・備份還原・禮包碼','#e53935','vAdminPanel()', true]
);

/* ════════════════════════════════════════════
   vTerminal 虛擬終端機（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTerminal
   ════════════════════════════════════════════ */
async function vTerminal(){
  if(!await needJs(['js/views/vTerminal.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vTerminal();
}


/* Real-time PK WebSocket */
var _pkWs=null;
function pkWsConnect(room,user){
  if(_pkWs){try{_pkWs.close()}catch(e){}}
  var proto=location.protocol==='https:'?'wss:':'ws:';
  _pkWs=new WebSocket(proto+'//'+location.host+'/ws/pk?token='+encodeURIComponent(WTOKEN||''));
  _pkWs.onopen=function(){_pkWs.send(JSON.stringify({type:'join',room:room,user:user}))};
  _pkWs.onmessage=function(e){try{var m=JSON.parse(e.data);handlePkWsMsg(m)}catch(e){}};
  _pkWs.onclose=function(){_pkWs=null};
}
function pkWsSend(data){if(_pkWs&&_pkWs.readyState===1)_pkWs.send(JSON.stringify(data))}
function handlePkWsMsg(m){
  if(m.type==='challenge_received'){toast('⚔️ '+m.from+' 向你發起 PK 挑戰！')}
  else if(m.type==='battle_start'){toast('⚔️ PK 開始！')}
  else if(m.type==='opponent_answered'){/* update opponent status */}
  else if(m.type==='battle_over'){toast(m.winner?'🏆 你贏了！':'💀 你輸了...')}
  else if(m.type==='user_joined'){/* update lobby */}
  else if(m.type==='user_left'){/* update lobby */}
  else if(m.type==='comp_started'){toast('🎮 班級競賽已建立！ID: '+m.compId)}
}

/* ═══ 班級即時競賽 ═══ */
var _compWs=null,_compId=null,_compTimer=null;

function startClassCompetition(){
  var subj=prompt('科目（數學/英文/自然/社會）：')||'數學';
  var dur=parseInt(prompt('時間（秒）：','300'))||300;
  var ws=location.protocol==='https:'?'wss:':'ws:';
  _compWs=new WebSocket(ws+'//'+location.host+'/ws/pk');
  _compWs.onopen=function(){
    var _cu=me();if(!_cu)return;
    _compWs.send(JSON.stringify({type:'join',room:'comp',user:_cu.username}));
    _compWs.send(JSON.stringify({type:'comp_start',subject:subj,duration:dur*1000}));
  };
  _compWs.onmessage=function(e){
    try{var m=JSON.parse(e.data);handleCompMsg(m)}catch(e){}
  };
  toast('🎮 班級競賽已開始！'+dur+' 秒');
}

function joinCompetition(compId){
  var ws=location.protocol==='https:'?'wss:':'ws:';
  _compWs=new WebSocket(ws+'//'+location.host+'/ws/pk?token='+encodeURIComponent(WTOKEN||''));
  _compId=compId;
  _compWs.onopen=function(){
    var _ju=me();if(!_ju)return;
    _compWs.send(JSON.stringify({type:'join',room:'comp_'+compId,user:_ju.username}));
    _compWs.send(JSON.stringify({type:'comp_join',compId:compId}));
  };
  _compWs.onmessage=function(e){
    try{var m=JSON.parse(e.data);handleCompMsg(m)}catch(e){}
  };
}

function handleCompMsg(m){
  if(m.type==='comp_joined'){
    toast('👤 '+m.user+' 加入了競賽（共 '+m.count+' 人）');
  }else if(m.type==='comp_update'){
    // Teacher sees live updates
  }else if(m.type==='comp_results'){
    var h='<h2 class="mt">🏆 競賽結果</h2><div id="compResults">';
    m.results.forEach(function(r,i){
      var medals=['🥇','🥈','🥉'];
      h+='<div class="rwRow"><span style="font-size:20px">'+(medals[i]||'')+'</span> <strong>'+esc(r.user)+'</strong> <span style="margin-left:auto;color:var(--mut)">'+r.score+' 分 | '+r.correct+' 題</span></div>';
    });
    h+='</div><div class="mBtns"><button class="btn ghost" onclick="closeModal()">關閉</button></div>';
    openModal(h);
  }
}
