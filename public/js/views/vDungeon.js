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

function vDungeon(){
  const u=me(),g=u.g;
  const terrOwned=Object.keys(g.territory?.owned||{}).length;
  const pkBest=g.arena?.best||1;
  let html=back()+'<h3 class="vt">🏰 副本戰鬥 <span class="vsub">2D 俯視角即時戰鬥・裝備僅此獲取</span></h3>';
  html+='<div class="panel2" style="margin-bottom:10px;font-size:12.5px;color:var(--mut);line-height:1.8;border-left:4px solid var(--gold)">📜 副本規則：每副本有固定波次，擊敗最後BOSS獲得裝備寶箱<br>個人掉落制｜Z以上全服公告<br>難度：普通(R~A)・困難(S~SS,領土50關)・地獄(SSS~Z,領土100關/PK塔100層)・神話(ZZ~ZZZ,PK塔300層)・∞神域(極低概率,PK塔500層+五科各50關)</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:14px">';
  Object.keys(DUNGEON_DUNGEONS).forEach(k=>{
    const cfg=DUNGEON_DUNGEONS[k];const waves=DUNGEON_WAVES[k];const loot=DUNGEON_LOOT[k];
    const canEnter=k==='normal'||(k==='hard'&&terrOwned>=50)||(k==='hell'&&terrOwned>=100&&pkBest>=100)||(k==='myth'&&pkBest>=300)||(k==='inf'&&pkBest>=500);
    const unlock=k==='normal'?'初始開放':k==='hard'?'領土50關':k==='hell'?'領土100關 + PK塔100層':k==='myth'?'PK塔300層':'PK塔500層+五科各50關';
    html+='<div class="panel2" style="'+(canEnter?'':'opacity:.5;cursor:not-allowed')+';border-left:4px solid var(--gold)">';
    html+='<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-family:var(--serif);color:var(--gold2)">'+cfg.name+'</b>';
    if(canEnter)html+='<button class="btn mini" onclick="enterDungeon(\''+k+'\')">進入</button>';
    else html+='<span style="font-size:11px;color:var(--mut)">🔒 '+unlock+'</span>';
    html+='</div><div style="font-size:12px;color:var(--mut);margin-top:6px">'+
      '波次 '+waves+' 關｜掉落 '+loot+' 件｜稀有度 '+cfg.rarityPool.join(' ~ ')+'</div></div>';
  });
  html+='</div>';
  if(CUR_DUNGEON&&CUR_DUNGEON.type){html+=renderDungeonBattle()}
  $('#view').innerHTML=html;
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
