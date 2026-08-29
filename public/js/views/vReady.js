/* ════════════════════════════════════════════
   vReady — 準備頁面
   戰前準備・裝備確認・體力檢查・隊伍編成
   ════════════════════════════════════════════ */

function vReady(){
  var u=me();if(!u)return;
  var g=u.g;
  var h=back()+'<h3 class="vt">✅ 準備頁面 <span class="vsub">戰前準備・裝備確認・狀態檢查</span></h3>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">';
  h+='<div style="font-size:40px;animation:bob 2s infinite">✅</div>';
  h+='<div><b style="font-family:var(--serif);color:var(--gold2);font-size:16px;display:block">出發前的最後準備</b>';
  h+='<div style="font-size:12px;color:var(--mut)">確認你的裝備、體力和狀態都準備好了嗎？</div></div>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--teal);font-size:14px">📊 角色狀態</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:10px">';
  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px">';
  h+='<div style="font-size:18px">❤️</div>';
  h+='<div style="font-size:16px;font-weight:900;color:#f44336">'+(g.hp||0)+'/'+(g.maxHp||100)+'</div>';
  h+='<div style="font-size:10px;color:var(--mut)">生命值</div>';
  h+='<div class="bar" style="margin-top:4px;height:4px;border-radius:2px;background:#333"><i style="width:'+Math.round((g.hp||0)/(g.maxHp||100)*100)+'%;background:#f44336;border-radius:2px;display:block;height:100%"></i></div></div>';

  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px">';
  h+='<div style="font-size:18px">💎</div>';
  h+='<div style="font-size:16px;font-weight:900;color:#2196f3">'+(g.mp||0)+'/'+(g.maxMp||50)+'</div>';
  h+='<div style="font-size:10px;color:var(--mut)">魔力值</div>';
  h+='<div class="bar" style="margin-top:4px;height:4px;border-radius:2px;background:#333"><i style="width:'+Math.round((g.mp||0)/(g.maxMp||50)*100)+'%;background:#2196f3;border-radius:2px;display:block;height:100%"></i></div></div>';

  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px">';
  h+='<div style="font-size:18px">⚡</div>';
  h+='<div style="font-size:16px;font-weight:900;color:var(--gold2)">'+(g.stamina||0)+'/100</div>';
  h+='<div style="font-size:10px;color:var(--mut)">體力</div>';
  h+='<div class="bar" style="margin-top:4px;height:4px;border-radius:2px;background:#333"><i style="width:'+(g.stamina||0)+'%;background:var(--gold2);border-radius:2px;display:block;height:100%"></i></div></div>';

  h+='<div style="text-align:center;padding:10px;background:#1a1a2e;border-radius:8px">';
  h+='<div style="font-size:18px">⭐</div>';
  h+='<div style="font-size:16px;font-weight:900;color:var(--teal)">Lv.'+(g.lv||1)+'</div>';
  h+='<div style="font-size:10px;color:var(--mut)">'+titleOf(g.lv||1)+'</div>';
  h+='<div class="bar" style="margin-top:4px;height:4px;border-radius:2px;background:#333"><i style="width:'+Math.round((g.xp||0)/(g.needXp||100)*100)+'%;background:var(--teal);border-radius:2px;display:block;height:100%"></i></div></div>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--gold2);font-size:14px">⚔️ 裝備確認</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin-top:10px">';
  var slots=[
    {key:'weapon',name:'武器',icon:'⚔️'},
    {key:'armor',name:'防具',icon:'🛡️'},
    {key:'accessory',name:'飾品',icon:'💍'},
    {key:'character',name:'角色',icon:'🧑‍🎓'}
  ];
  for(var i=0;i<slots.length;i++){
    var sl=slots[i];
    var equipped=g.equip&&g.equip[sl.key];
    h+='<div style="padding:12px;background:#1a1a2e;border-radius:8px;text-align:center;border:1px solid '+(equipped?'var(--gold2)':'#333')+'">';
    h+='<div style="font-size:24px">'+(equipped&&equipped.icon?equipped.icon:sl.icon)+'</div>';
    h+='<div style="font-size:11px;color:var(--mut);margin-top:4px">'+sl.name+'</div>';
    if(equipped){
      h+='<div style="font-size:12px;color:var(--gold2);font-weight:700;margin-top:2px">'+esc(equipped.name)+'</div>';
      if(equipped.rarity) h+='<div style="font-size:10px;color:var(--mut)">'+equipped.rarity+'</div>';
    }else{
      h+='<div style="font-size:11px;color:#f44336;margin-top:2px">未裝備</div>';
    }
    h+='</div>';
  }
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:var(--purple);font-size:14px">🎒 背包狀態</b>';
  h+='<div style="display:flex;gap:12px;margin-top:10px;align-items:center">';
  var bag=g.bag||{items:[],capacity:50};
  h+='<div style="flex:1"><div style="font-size:12px;color:var(--mut)">已使用 '+bag.items.length+'/'+bag.capacity+' 格</div>';
  h+='<div class="bar" style="margin-top:4px;height:6px;border-radius:3px;background:#333"><i style="width:'+Math.round(bag.items.length/bag.capacity*100)+'%;background:'+(bag.items.length/bag.capacity>0.8?'#f44336':'var(--teal)')+';border-radius:3px;display:block;height:100%"></i></div></div>';
  h+='<button class="btn ghost mini" onclick="vBag()">📦 查看背包</button>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:#ff9800;font-size:14px">💰 資源總覽</b>';
  h+='<div style="display:flex;gap:12px;margin-top:10px;flex-wrap:wrap">';
  h+='<div style="flex:1;text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">🪙</div><div style="font-size:14px;font-weight:900;color:var(--gold2)">'+(g.gold||0)+'</div><div style="font-size:10px;color:var(--mut)">金幣</div></div>';
  h+='<div style="flex:1;text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">💎</div><div style="font-size:14px;font-weight:900;color:#2196f3">'+(g.crystal||0)+'</div><div style="font-size:10px;color:var(--mut)">水晶</div></div>';
  h+='<div style="flex:1;text-align:center;padding:10px;background:#1a1a2e;border-radius:8px"><div style="font-size:18px">💠</div><div style="font-size:14px;font-weight:900;color:#e91e63">'+(g.diamond||0)+'</div><div style="font-size:10px;color:var(--mut)">鑽石</div></div>';
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<b style="color:#4caf50;font-size:14px">📋 檢查清單</b>';
  h+='<div style="margin-top:10px">';
  var checks=[
    {label:'HP 充滿',ok:(g.hp||0)>=(g.maxHp||100)*0.5,icon:g.hp>=(g.maxHp||100)*0.5?'✅':'⚠️'},
    {label:'MP 充足',ok:(g.mp||0)>=(g.maxMp||50)*0.3,icon:g.mp>=(g.maxMp||50)*0.3?'✅':'⚠️'},
    {label:'體力足夠',ok:(g.stamina||0)>=10,icon:g.stamina>=10?'✅':'⚠️'},
    {label:'武器已裝備',ok:!!(g.equip&&g.equip.weapon),icon:(g.equip&&g.equip.weapon)?'✅':'❌'},
    {label:'防具已裝備',ok:!!(g.equip&&g.equip.armor),icon:(g.equip&&g.equip.armor)?'✅':'❌'},
    {label:'背包未滿',ok:(g.bag||{items:[]}).items.length<(g.bag||{capacity:50}).capacity,icon:(g.bag||{items:[]}).items.length<(g.bag||{capacity:50}).capacity?'✅':'⚠️'}
  ];
  var readyCount=0;
  for(var c=0;c<checks.length;c++){
    var ck=checks[c];
    if(ck.ok)readyCount++;
    h+='<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06)">';
    h+='<span>'+ck.icon+'</span>';
    h+='<span style="flex:1;font-size:13px;color:'+(ck.ok?'var(--teal)':'#ff9800')+'">'+ck.label+'</span>';
    h+='</div>';
  }
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:14px;text-align:center;padding:16px">';
  var readyPct=Math.round(readyCount/checks.length*100);
  h+='<div style="font-size:14px;color:var(--mut);margin-bottom:8px">準備完成度</div>';
  h+='<div style="font-size:36px;font-weight:900;color:'+(readyPct>=80?'var(--teal)':readyPct>=50?'#ff9800':'#f44336')+'">'+readyPct+'%</div>';
  h+='<div class="bar" style="margin:10px auto;max-width:300px;height:8px;border-radius:4px;background:#333"><i style="width:'+readyPct+'%;background:'+(readyPct>=80?'var(--teal)':readyPct>=50?'#ff9800':'#f44336')+';border-radius:4px;display:block;height:100%;transition:width .5s"></i></div>';

  if(readyPct>=80){
    h+='<button class="btn teal" onclick="readyGo()" style="font-size:14px;padding:10px 30px">🚀 出發冒險！</button>';
  }else{
    h+='<div style="font-size:12px;color:#ff9800;margin-bottom:8px">⚠️ 準備不足，建議先完成以下項目：</div>';
    if(!(g.hp||0)>=(g.maxHp||100)*0.5) h+='<button class="btn ghost mini" onclick="readyHeal()">❤️ 恢復 HP</button>';
    if(!(g.mp||0)>=(g.maxMp||50)*0.3) h+='<button class="btn ghost mini" onclick="readyRestoreMp()">💎 恢復 MP</button>';
    if((g.stamina||0)<10) h+='<button class="btn ghost mini" onclick="readyRest()">😴 休息恢復體力</button>';
    if(!(g.equip&&g.equip.weapon)) h+='<button class="btn ghost mini" onclick="vEquip()">⚔️ 去裝備武器</button>';
  }
  h+='</div>';

  h+='<div class="panel2" style="margin-top:12px;padding:10px;border-left:4px solid #2196f3">';
  h+='<div style="font-size:12px;color:var(--mut)">💡 <b>提示：</b>出發前確認 HP、MP 和體力充足，裝備已穿好，背包還有空間裝戰利品。準備好再出發可以大幅提升勝率！</div>';
  h+='</div>';

  $('#view').innerHTML=h;
}

function readyGo(){
  var u=me();if(!u)return;
  var g=u.g;
  var bag=g.bag||{items:[],capacity:50};
  if(bag.items.length>=bag.capacity){
    toast('⚠️ 背包已滿，請先清理背包','bad');return;
  }
  toast('🚀 出發冒險！');
  if(typeof vDungeon==='function') vDungeon();
  else if(typeof vSubj==='function') vSubj();
  else toast('冒險功能準備中...');
}

function readyHeal(){
  var u=me();if(!u)return;
  u.g.hp=u.g.maxHp||100;
  set(LS.users,get(LS.users,[]));
  toast('❤️ HP 已完全恢復');
  vReady();
}

function readyRestoreMp(){
  var u=me();if(!u)return;
  u.g.mp=u.g.maxMp||50;
  set(LS.users,get(LS.users,[]));
  toast('💎 MP 已完全恢復');
  vReady();
}

function readyRest(){
  var u=me();if(!u)return;
  u.g.stamina=Math.min(100,(u.g.stamina||0)+30);
  u.g.hp=Math.min(u.g.maxHp||100,(u.g.hp||0)+Math.floor((u.g.maxHp||100)*0.3));
  set(LS.users,get(LS.users,[]));
  toast('😴 休息完畢，體力和 HP 已恢復');
  vReady();
}

function readyAutoEquip(){
  var u=me();if(!u)return;
  var g=u.g;
  var bag=g.bag||{items:[],capacity:50};
  var slots=['weapon','armor','accessory'];
  var equipped=0;
  for(var s=0;s<slots.length;s++){
    var slot=slots[s];
    if(g.equip&&g.equip[slot])continue;
    var best=null;
    var bestScore=0;
    for(var b=0;b<bag.items.length;b++){
      var item=bag.items[b];
      if(item.slot!==slot)continue;
      var score=(item.atk||0)+(item.def||0)+(item.hp||0)+(item.mp||0);
      if(score>bestScore){bestScore=score;best=b}
    }
    if(best!==null){
      var it=bag.items.splice(best,1)[0];
      g.equip[slot]=it;
      equipped++;
    }
  }
  if(equipped>0){
    set(LS.users,get(LS.users,[]));
    toast('⚔️ 已自動裝備 '+equipped+' 件裝備');
    vReady();
  }else{
    toast('ℹ️ 沒有可裝備的物品');
  }
}

function readyQuickHeal(){
  var u=me();if(!u)return;
  var cost=Math.max(1,Math.floor((u.g.maxHp||100)-(u.g.hp||0))*0.5);
  if(u.g.gold<cost){toast('⚠️ 金幣不足（需要 '+cost+'）','bad');return}
  u.g.gold-=cost;
  u.g.hp=u.g.maxHp||100;
  u.g.mp=u.g.maxMp||50;
  set(LS.users,get(LS.users,[]));
  toast('💊 花費 '+cost+' 金幣完全恢復');
  vReady();
}

function readyShowTips(){
  var tips=[
    '💪 升級可以恢復全部 HP 和 MP',
    '⚔️ 武器影響攻擊力，防具影響防禦力',
    '🎯 困難難度獲得的經驗值是簡單的 2 倍',
    '🎒 背包滿了就無法獲得新的戰利品',
    '🏆 競技塔越高層獎勵越豐富',
    '💎 水晶可以用來抽卡或購買特殊道具'
  ];
  var tip=tips[Math.floor(Math.random()*tips.length)];
  toast(tip);
}
window.vReady=vReady;
