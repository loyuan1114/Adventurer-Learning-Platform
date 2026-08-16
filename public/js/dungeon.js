/* ════════════════════════════════════════════════════
   副本戰鬥（vDungeon）
   由 tools/build/split.py 從 public/index.html 抽出（懶載入模組）
   ════════════════════════════════════════════════════ */
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
