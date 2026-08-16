/* =====================================================================
   adv9_plus.js — 《全領域冒險者養成系統 v2.0★九大強化版》增量引擎
   設計原則（嚴格遵守）：
   - 保留 adv9 原有結構、原有功能、原有存檔與入口。
   - 所有新功能對接既有全域：me() / get() / set() / LS / toast() / hud() /
     saveU() / REROLL_ATTRS / EQ_SLOT / eqGet() / rerollGet() / window.IS_ADMIN。
   - 每人資料存入 me().g 子欄位（與原帳號同一份存檔）；系統設定存 ADV9_SETTINGS；
     跨使用者資料（禮物/公告/管理日誌）各自獨立 key。
   - 不刪除、不覆寫任何舊資料；∞ 不可被自動刪除；所有重要行為寫入日誌。
   ===================================================================== */
(function(){
'use strict';

/* ── 安全的現有全域存取（若日後結構變動也不會整頁崩潰） ── */
/* 快取目前使用者物件：me()/get() 每次都重新解析 localStorage 會回傳「全新物件」，
   若 cur() 取出後 mutate、persist() 又重新 cur() 取「另一個全新物件」來存檔，改動會遺失。
   這裡快取最後一次取出的物件，persist() 直接存它，確保寫入真正生效（寶石購買/自由加點/管理員發送等才會存檔）。 */
var _CUR=null;
function cur(){ try{ if(typeof me==='function'){var u=me(); if(u&&u.username){ _CUR=u; return u; } } }catch(e){}
  try{ var arr=get(LS.users,[]); var s=get(LS.ses,{}); var f=arr.find(function(x){return x.username===s.username})||null; if(f){_CUR=f;} return f; }catch(e){ return null; } }
function persist(){ try{ if(_CUR) saveU(_CUR); else { var u=cur(); if(u) saveU(u); } }catch(e){} try{ if(typeof hud==='function') hud(); }catch(e){} }
function say(m,t){ try{ toast(m,t); }catch(e){ console.log(m); } }
var IS_ADMIN = function(){ try{ return window.IS_ADMIN===true || (cur()&&cur().role==='admin'); }catch(e){ return false; } };

/* ── 設定層（ADV9_SETTINGS） ── */
function cfg(){ return get(LS.settings,{}); }
function setCfg(o){ var c=cfg(); Object.assign(c,o); set(LS.settings,c); return c; }
function maxLevel(){ var c=cfg(); return (c.maxLevel && c.maxLevel>0) ? c.maxLevel : 300; }
function freeCap(){ var c=cfg(); return (c.freeCap && c.freeCap>0) ? c.freeCap : 300; }

/* ── 使用者子系統資料（惰性初始化，不破壞舊結構） ── */
function sub(key, def){ var u=cur(); if(!u||!u.g) return def; if(u.g[key]===undefined||u.g[key]===null){ u.g[key]=JSON.parse(JSON.stringify(def)); persist(); } return u.g[key]; }
function saveSub(){ persist(); }

/* ── 全域日誌（每人） ── */
function logGD(action, detail){
  var u=cur(); if(!u) return;
  var g=sub('gdLog', []); g.push({t:new Date().toISOString(), action:action, detail:detail});
  if(g.length>200) g=g.slice(-200);
  u.g.gdLog=g; persist();
}
/* 管理員操作日誌（共用 ADV9_ADMINLOG） */
function adminLog(action, detail){
  var arr=get('ADV9_ADMINLOG',[]);
  arr.push({t:new Date().toISOString(), by:(cur()&&cur().username)||'?', action:action, detail:detail});
  if(arr.length>500) arr=arr.slice(-500);
  set('ADV9_ADMINLOG', arr);
}

/* ── 全服公告（沿用既有 ADV9_ANN） ── */
function announce(text, rainbow){
  var arr=get(LS.ann,[]);
  arr.push({text:text, rainbow:!!rainbow, t:Date.now()});
  if(arr.length>60) arr=arr.slice(-60);
  set(LS.ann, arr);
  // 視覺條
  try{
    var d=document.createElement('div'); d.className='gd-ann'; if(rainbow) d.style.backgroundSize='300% 100%';
    d.textContent='📢 '+text; document.body.appendChild(d);
    setTimeout(function(){ d.remove(); }, 6000);
  }catch(e){}
}

/* ════════════════════════════════════════════════════════════
   全域函式（規格三十）
   ════════════════════════════════════════════════════════════ */
/* 注意：遠端 index.html 已內建 window.getMaxLevel / window.getTotalFreePoints（讀 ADV9_SYS_SETTINGS）。
   此處「不」覆寫既有全域，避免破壞遠端原生面板（vStudentPanel/vInfinityExchange/vBuffStore/vAdminPanel）。
   本引擎內部一律使用本地 maxLevel()/FreeP.total()，不受此影響。 */
if (typeof window.getMaxLevel !== 'function') window.getMaxLevel = function(){ return maxLevel(); };
if (typeof window.getTotalFreePoints !== 'function') window.getTotalFreePoints = function(){ var u=cur(); var lv=(u&&u.g&&u.g.lv)||1; return lv*3; }; /* 與目前等級綁定 */
/* getRerollBonuses / getRerollTitle 已由原專案提供，這裡補齊連線金鑰 */
window.ADV9_WIRE = {
  pk_tower: function(){ var u=cur(); return u&&u.g? (u.g.arena? u.g.arena.floor||1 : 1):1; },
  sub_lv_0: function(){ return terrLv(0); },
  sub_lv_1: function(){ return terrLv(1); },
  sub_lv_2: function(){ return terrLv(2); },
  sub_lv_3: function(){ return terrLv(3); },
  sub_lv_4: function(){ return terrLv(4); },
  role: function(){ var u=cur(); return u? u.role : null; },
  max_level: function(){ return maxLevel(); }
};
function terrLv(i){ try{ var u=cur(); if(!u||!u.g) return 0; var k=['chinese','math','english','science','social'][i]; return (u.g.territory&&u.g.territory.levels&&u.g.territory.levels[k])||0; }catch(e){ return 0; } }

/* ════════════════════════════════════════════════════════════
   一、星辰幣（規格二十四）
   ════════════════════════════════════════════════════════════ */
var Star = {
  get: function(){ return sub('star', {coin:0}).coin; },
  add: function(n, reason){ var s=sub('star',{coin:0}); s.coin+=n; saveSub(); logGD('星辰幣變動', (n>=0?'+':'')+n+'（'+(reason||'')+'）'); },
  spend: function(n, reason){ var s=sub('star',{coin:0}); if(s.coin<n) return false; s.coin-=n; saveSub(); logGD('星辰幣變動', '-'+n+'（'+(reason||'')+'）'); return true; }
};

/* ════════════════════════════════════════════════════════════
   二、雙倍增益道具（規格二十五、二十六）
   ════════════════════════════════════════════════════════════ */
var BUFF_TYPES = [
  {id:'luck', icon:'🍀', name:'雙倍運氣券', desc:'副本掉落品質提升、寶箱稀有度提升'},
  {id:'gold', icon:'💰', name:'雙倍金幣券', desc:'副本／任務結算金幣 ×2'},
  {id:'gem',  icon:'💎', name:'雙倍寶石券', desc:'副本／任務結算寶石 ×2'},
  {id:'chest',icon:'🎁', name:'雙倍寶箱券', desc:'副本掉落寶箱數量 ×2'}
];
var BUFF_VERS = [
  {id:'trial', name:'體驗版', min:30,     label:'30 分鐘'},
  {id:'normal',name:'普通版', min:60,    label:'1 小時'},
  {id:'adv',   name:'進階版', min:720,   label:'12 小時'},
  {id:'day',   name:'一日版', min:1440,  label:'24 小時'},
  {id:'week',  name:'週卡版', min:10080, label:'7 天'},
  {id:'month', name:'月卡版', min:43200, label:'30 天'},
  {id:'god',   name:'神級版', min:0,     label:'永久（極稀有）'}
];
function buffPrice(type, ver){
  var base = {luck:80, gold:60, gem:120, chest:100}[type]||80;
  var mult = {trial:1, normal:2, adv:8, day:14, week:60, month:200, god:2000}[ver]||1;
  return base*mult;
}
var Buff = {
  bag: function(){ return sub('buffs', {bag:[], active:null}).bag; },
  active: function(){ return sub('buffs', {bag:[], active:null}).active; },
  add: function(type, ver){
    var b=sub('buffs',{bag:[],active:null});
    b.bag.push({id:'bf'+Date.now()+Math.floor(Math.random()*99), type:type, ver:ver, expire:(ver==='god'?0:Date.now()+BUFF_VERS.find(function(v){return v.id===ver}).min*60000)});
    saveSub(); logGD('獲得增益', type+'/'+ver);
  },
  buy: function(type, ver){
    var price=buffPrice(type,ver);
    var payByStar = Star.get()>=price;
    if(payByStar){ if(!Star.spend(price,'購買 '+type+'/'+ver)) return false; }
    else if((cur().g.crystal||0)>=price){ cur().g.crystal-=price; persist(); }
    else { say('💎 寶石與星辰幣皆不足', 'bad'); return false; }
    Buff.add(type,ver); say('✅ 已購入 '+type+'/'+ver); return true;
  },
  activate: function(id){
    var b=sub('buffs',{bag:[],active:null});
    var item=b.bag.find(function(x){return x.id===id}); if(!item) return;
    // 同時間只能生效一種
    b.active={type:item.type, expire:item.expire, started:Date.now()};
    saveSub(); logGD('啟用增益', item.type+'（單一生效）'); say('✅ 已啟用 '+item.type+' 增益（同一時間僅一種生效）');
  },
  activeType: function(){ var a=Buff.active(); if(!a) return null; if(a.expire&&a.expire<Date.now()) return null; return a.type; },
  adminGrant: function(username, type, ver){
    // 直接發送至指定使用者背包（繞過商店）
    var u=findUser(username); if(!u) { say('找不到使用者','bad'); return false; }
    if(!u.g) u.g={};
    if(!u.g.buffs) u.g.buffs={bag:[],active:null};
    u.g.buffs.bag.push({id:'bf'+Date.now()+Math.floor(Math.random()*99), type:type, ver:ver, expire:(ver==='god'?0:Date.now()+BUFF_VERS.find(function(v){return v.id===ver}).min*60000)});
    saveU(u); adminLog('管理員發送增益', username+' ← '+type+'/'+ver); logGD('管理員發送增益', username+' ← '+type+'/'+ver);
    say('✅ 已發送 '+type+'/'+ver+' 給 '+username); return true;
  }
};

/* ════════════════════════════════════════════════════════════
   三、社交送禮與禮物盒（規格二十七）
   ════════════════════════════════════════════════════════════ */
var GIFT_BOX = {white:'普通禮物盒', blue:'稀有禮物盒', purple:'史詩禮物盒', gold:'傳說禮物盒', rainbow:'∞神級禮物盒'};
function giftBoxByValue(ver){
  if(ver==='god') return 'rainbow';
  if(ver==='month'||ver==='week') return 'gold';
  if(ver==='day'||ver==='adv') return 'purple';
  if(ver==='normal') return 'blue';
  return 'white';
}
var Gift = {
  records: function(){ return get('ADV9_GIFT',[]); },
  inbox: function(){ var u=cur(); return Gift.records().filter(function(r){return r.to===u.username && !r.claimed}); },
  send: function(toUser, buffId, box){
    var u=cur(); var b=sub('buffs',{bag:[],active:null});
    var item=b.bag.find(function(x){return x.id===buffId}); if(!item) return false;
    if(toUser===u.username){ say('不能送給自己','bad'); return false; }
    b.bag=b.bag.filter(function(x){return x.id!==buffId}); saveSub();
    var recs=Gift.records();
    var type=BUFF_TYPES.find(function(x){return x.id===item.type});
    var ver=BUFF_VERS.find(function(v){return v.id===item.ver});
    recs.push({id:'gf'+Date.now(), from:u.username, to:toUser, itemType:item.type, itemVer:item.ver, itemName:type?type.name:'?', verLabel:ver?ver.label:'?', box:box||giftBoxByValue(item.ver), time:new Date().toISOString(), claimed:false});
    set('ADV9_GIFT', recs);
    logGD('贈送禮物', '→ '+toUser+'：'+ (type?type.name:'') +' / '+box);
    say('🎁 已送出禮物給 '+toUser); return true;
  },
  claim: function(id){
    var recs=Gift.records(); var r=recs.find(function(x){return x.id===id}); if(!r||r.claimed) return false;
    var u=cur(); if(u.username!==r.to) return false;
    if(!u.g.buffs) u.g.buffs={bag:[],active:null};
    u.g.buffs.bag.push({id:'bf'+Date.now()+Math.floor(Math.random()*99), type:r.itemType, ver:r.itemVer, expire:(r.itemVer==='god'?0:Date.now()+BUFF_VERS.find(function(v){return v.id===r.itemVer}).min*60000)});
    r.claimed=true; set('ADV9_GIFT', recs); persist();
    logGD('領取禮物', '← '+r.from+'：'+r.itemName); say('🎉 已領取 '+r.from+' 的禮物'); return true;
  }
};

/* ════════════════════════════════════════════════════════════
   四、自由加點系統（規格二十三）
   ════════════════════════════════════════════════════════════ */
var FP_DIRS = [
  {id:'luck',  name:'運氣',     desc:'提升副本裝備掉落品質、寶箱稀有度'},
  {id:'power', name:'戰力',     desc:'直接增加傷害 / 生命 / 防禦等基礎面板'},
  {id:'gem',   name:'寶石加成', desc:'副本／任務結算寶石獲得量提升 %'},
  {id:'gold',  name:'金幣加成', desc:'商店貨幣／金幣獲得量提升 %'},
  {id:'luckB', name:'運氣加成', desc:'微幅加速保底進度、戰鬥觸發幸運一擊'}
];
var FreeP = {
  data: function(){ return sub('freeP', {used:{}, cap:0}); },
  total: function(){ var u=cur(); var lv=(u&&u.g&&u.g.lv)||1; return lv*3; }, /* 自由點數與「目前等級」綁定：每升 1 級拿 3 點，不給滿級預支 */
  allocated: function(){ var d=this.data(); var s=0; FP_DIRS.forEach(function(f){ s+=(d.used[f.id]||0); }); return s; },
  remain: function(){ return this.total()-this.allocated(); },
  add: function(dir){ var d=this.data(); var c=freeCap();
    if(this.remain()<=0){ say('⚠️ 無剩餘自由點數','bad'); return; }
    if((d.used[dir]||0)>=c){ say('⚠️ 該方向已達單項上限 '+c,'bad'); return; }
    d.used[dir]=(d.used[dir]||0)+1; saveSub(); logGD('自由加點', dir+' +1'); this.refresh(); },
  reset: function(){ var d=this.data(); d.used={}; saveSub(); logGD('自由加點重置',''); this.refresh(); say('🔄 已重置自由屬性點'); },
  bonus: function(){ // 回傳各方向加成（百分比 / 倍率）
    var d=this.data(); var u=d.used||{};
    return {
      luck:  (u.luck||0)*0.3,    // 掉落運氣 %
      power: (u.power||0)*0.2,   // 戰力 %（傷害/生命/防禦）
      gem:   (u.gem||0)*0.3,     // 寶石 %
      gold:  (u.gold||0)*0.3,    // 金幣 %
      luckB: (u.luckB||0)*0.1    // 保底加速 / 幸運一擊 %
    };
  },
  refresh: function(){}
};

/* ════════════════════════════════════════════════════════════
   五、∞ 七階段換取制（規格二十）
   ════════════════════════════════════════════════════════════ */
var INFTY = {
  data: function(){ return sub('infty', {stages:[false,false,false,false,false,false,false], got:{}, history:[]}); },
  adaptLevel: function(req){ return Math.min(req, maxLevel()); },
  cond: function(stage){ // 回傳該階段條件與達成狀態
    var g=cur().g; var tower=window.ADV9_WIRE.pk_tower();
    var L=maxLevel();
    if(stage===1) return {need:'無限競技塔 500 層 ＋ 5 科各 50 關', ok: tower>=500 && [0,1,2,3,4].every(function(i){return terrLv(i)>=50;})};
    if(stage===2) return {need:'無限競技塔 1000 層 ＋ 5 科各 100 關', ok: tower>=1000 && [0,1,2,3,4].every(function(i){return terrLv(i)>=100;})};
    if(stage===3){ var lv=this.adaptLevel(100); return {need:'無限競技塔 2000 層 ＋ 角色等級 '+lv+(lv<100?'（已自動適配）':''), ok: tower>=2000 && (g.lv||1)>=lv}; }
    if(stage===4){ var lv4=this.adaptLevel(200); return {need:'無限競技塔 3000 層 ＋ 角色等級 '+lv4+(lv4<200?'（已自動適配）':''), ok: tower>=3000 && (g.lv||1)>=lv4}; }
    if(stage===5) return {need:'無限競技塔 4000 層 ＋ 全身 7 件裝備全強化至 100 級', ok: tower>=4000 && allEquipLv100()};
    if(stage===6){ var lv6=this.adaptLevel(250);
      var allZZ=[0,1,2,3,4,5,6].every(function(i){ var a=(rerollGet().attr||{})[REROLL_ATTRS[i].id]; return a==='ZZ'||a==='ZZZ'||a==='∞'; });
      var sub150=[0,1,2,3,4].every(function(i){return terrLv(i)>=150;});
      return {need:'無限競技塔 5000 層 ＋ 角色等級 '+lv6+(lv6<250?'（自動適配）':'')+' ＋ 七大學科全 ZZ 以上 ＋ 5 科各 150 關', ok: tower>=5000 && (g.lv||1)>=lv6 && allZZ && sub150}; }
    if(stage===7){ var lv7=this.adaptLevel(300);
      var equipHigh=equipCountRarity(['ZZZ','∞'])>=5;
      var tower10=(g.inftyTower10||0)>=10;
      var fpDone=FreeP.allocated()>=FreeP.total();
      return {need:'無限競技塔 6000 層 ＋ 角色等級 '+lv7+(lv7<300?'（自動適配）':'')+' ＋ 5 科各 200 關 ＋ 至少 5 件 ZZZ/∞ 裝備 ＋ ∞神域通關 10 次 ＋ 自由點全分配',
              ok: tower>=6000 && (g.lv||1)>=lv7 && [0,1,2,3,4].every(function(i){return terrLv(i)>=200;}) && equipHigh && tower10 && fpDone}; }
    return {need:'?', ok:false};
  },
  canClaim: function(stage){ var d=this.data(); if(d.stages[stage-1]) return false; if(stage>1 && !d.stages[stage-2]) return false; return this.cond(stage).ok; },
  claim: function(stage, attrId){
    var d=this.data();
    if(!this.canClaim(stage)) { say('⚠️ 條件未達成或順序錯誤','bad'); return false; }
    if(d.got[attrId]) { say('⚠️ 該學科已獲得 ∞','bad'); return false; }
    // 若該學科已透過抽取取得 ∞，則不可重複
    if((rerollGet().attr||{})[attrId]==='∞'){ say('⚠️ 該學科已透過抽取獲得 ∞，不可重複換取','bad'); return false; }
    d.stages[stage-1]=true; d.got[attrId]=true;
    // 寫入重新滾動系統
    var rr=rerollGet(); rr.attr=rr.attr||{}; rr.attr[attrId]='∞'; rerollSet(rr);
    d.history.push({t:new Date().toISOString(), stage:stage, attr:attrId, by:(cur()&&cur().username)||'?', admin:false});
    saveSub(); logGD('∞換取', '第'+stage+'階段 → '+attrId);
    announce('🌟 '+(cur()?cur().username:'某人')+' 於第 '+stage+' 階段換得『'+(REROLL_ATTRS.find(function(a){return a.id===attrId})||{}).name+'』∞！', true);
    say('🌟 成功換取 ∞：'+attrId); return true;
  },
  adminGrant: function(attrId, reason){
    if(!IS_ADMIN()) { say('⚠️ 僅管理員','bad'); return false; }
    var rr=rerollGet(); rr.attr=rr.attr||{}; if(rr.attr[attrId]==='∞'){ say('已為 ∞','bad'); return false; }
    rr.attr[attrId]='∞'; rerollSet(rr);
    var d=this.data(); d.got[attrId]=true; d.history.push({t:new Date().toISOString(), stage:0, attr:attrId, by:(cur()&&cur().username)||'?', admin:true});
    saveSub(); adminLog('管理員贈送∞', attrId+'（'+(reason||'')+'）'); logGD('管理員贈送∞', attrId);
    announce('👑 管理員贈送『'+(REROLL_ATTRS.find(function(a){return a.id===attrId})||{}).name+'』∞！', true);
    say('👑 已贈送 ∞：'+attrId); return true;
  }
};
function allEquipLv100(){ try{ var d=eqGet(); if(!d||!d.owned) return false; var slots=['頭','衣服','褲子','鞋子','武器','戒指','項鍊']; var all=true; slots.forEach(function(s){ var id=d.equipped[s]; if(!id){all=false;return;} var e=d.owned.find(function(x){return x.id===id}); if(!e||(e.lv||0)<100) all=false; }); return all; }catch(e){ return false; } }
function equipCountRarity(rar){ try{ var d=eqGet(); if(!d||!d.owned) return 0; var slots=['頭','衣服','褲子','鞋子','武器','戒指','項鍊']; var n=0; slots.forEach(function(s){ var id=d.equipped[s]; if(!id) return; var e=d.owned.find(function(x){return x.id===id}); if(e && rar.indexOf(e.rarity)>=0) n++; }); return n; }catch(e){ return 0; } }

/* ════════════════════════════════════════════════════════════
   六、即時 2D canvas 戰鬥（規格八～十一）
   ════════════════════════════════════════════════════════════ */
var RARITY_POOL = {simple:['R','E'], normal:['R','E','A'], hard:['A','S','SS'], hell:['SS','SSS','Z'], myth:['ZZ','ZZZ'], inf:['Z','ZZ','ZZZ','∞']};
var RARITY_WEIGHT = {R:30,E:25,A:18,S:12,SS:8,SSS:4,Z:2,ZZ:1,ZZZ:0.5,'∞':0.05};
var DUNGEON_CFG = {
  simple:{name:'簡單', waves:5,  chests:1, pool:['R','E'],        needTerr:0,  needTower:0},
  normal:{name:'普通', waves:10, chests:2, pool:['R','E','A'],    needTerr:0,  needTower:0},
  hard:  {name:'困難', waves:20, chests:5, pool:['A','S','SS'],   needTerr:50, needTower:0},
  hell:  {name:'地獄', waves:20, chests:5, pool:['SS','SSS','Z'], needTerr:100,needTower:100},
  myth:  {name:'神話', waves:20, chests:5, pool:['ZZ','ZZZ'],     needTerr:0,  needTower:300},
  inf:   {name:'∞神域',waves:20, chests:5, pool:['Z','ZZ','ZZZ','∞'], needTerr:0, needTower:500}
};
var MAIN_STAT = {'武器':'傷害%','頭':'防禦%','衣服':'生命','褲子':'減傷','鞋子':'冷卻','戒指':'暴傷','項鍊':'運氣'};
var SUB_POOL = ['暴擊','暴擊傷害','冷卻','減傷','運氣','生命','防禦'];
var WEAPONS = [
  {id:1,name:'劍',emoji:'⚔️',role:'均衡型',atk:10,cd:0.5,sk:['斬擊','橫掃','突刺','劍氣']},
  {id:2,name:'匕首',emoji:'🗡️',role:'暴擊+',atk:8,cd:0.35,sk:['速刺','背刺','影襲','連刃']},
  {id:3,name:'弓',emoji:'🏹',role:'遠程',atk:9,cd:0.6,sk:['射擊','多重箭','穿透箭','暴雨箭']},
  {id:4,name:'弩',emoji:'🎯',role:'爆發+',atk:12,cd:0.8,sk:['狙擊','連弩','爆裂','穿甲']},
  {id:5,name:'法杖',emoji:'🪄',role:'施法快',atk:9,cd:0.4,sk:['魔彈','火球','冰錐','雷擊']},
  {id:6,name:'法球',emoji:'🔮',role:'魔傷+',atk:11,cd:0.55,sk:['虛彈','爆能','黑洞','隕石']},
  {id:7,name:'魔導書',emoji:'📖',role:'範圍',atk:8,cd:0.7,sk:['頁刃','書牆','咒域','禁書']},
  {id:8,name:'長槍',emoji:'⚡',role:'穿透',atk:11,cd:0.6,sk:['刺擊','串刺','龍牙','貫穿']},
  {id:9,name:'戰斧',emoji:'🪓',role:'高傷',atk:14,cd:0.9,sk:['重斬','旋斧','裂地','狂戰']},
  {id:10,name:'戰錘',emoji:'🔨',role:'暈眩',atk:12,cd:0.85,sk:['砸擊','震地','眩暈','崩山']},
  {id:11,name:'刀',emoji:'🌙',role:'吸血',atk:10,cd:0.5,sk:['月斬','血刃','噬魂','月光']},
  {id:12,name:'拳套',emoji:'🥊',role:'連擊',atk:7,cd:0.25,sk:['直拳','連拳','崩拳','霸王']},
  {id:13,name:'迴旋鏢',emoji:'🪃',role:'回返',atk:9,cd:0.6,sk:['投擲','迴旋','三連','風刃']},
  {id:14,name:'魔音琴',emoji:'🎸',role:'減益',atk:8,cd:0.7,sk:['音波','沉默','減速','安魂']},
  {id:15,name:'雙刃',emoji:'🔪',role:'雙次',atk:8,cd:0.4,sk:['雙刺','交斬','亂舞','影雙']},
  {id:16,name:'炸彈',emoji:'💣',role:'範圍',atk:10,cd:0.9,sk:['投彈','爆風','燃燒','核爆']},
  {id:17,name:'羽扇',emoji:'🪶',role:'風控',atk:8,cd:0.6,sk:['風刃','旋風','吹飛','颶風']},
  {id:18,name:'劍盾',emoji:'🛡️',role:'防禦',atk:9,cd:0.55,sk:['盾擊','格擋','反傷','堡壘']},
  {id:19,name:'鏈刃',emoji:'⛓️',role:'控場',atk:10,cd:0.6,sk:['鉤拉','絞殺','束縛','裂鏈']},
  {id:20,name:'聖杖',emoji:'🌟',role:'聖屬',atk:11,cd:0.55,sk:['聖光','淨化','審判','神罰']}
];

function rollRarity(pool, teamBonus){
  // teamBonus: 0~0.4（每多1人+0.1）；提升高階機率
  var weights={}; pool.forEach(function(r){ weights[r]=RARITY_WEIGHT[r]*(1+ (['Z','ZZ','ZZZ','∞'].indexOf(r)>=0? teamBonus*2 : 0)); });
  // 極低 ∞ 不受保底影響、不受雙倍影響
  var total=0; Object.keys(weights).forEach(function(k){ total+=weights[k]; });
  var roll=Math.random()*total;
  for(var k in weights){ roll-=weights[k]; if(roll<=0) return k; }
  return pool[0];
}
function genEquip(rarity, teamBonus){
  var slot=EQ_SLOT[Math.floor(Math.random()*EQ_SLOT.length)];
  var r=rollRarity([rarity], teamBonus); // 以結算時傳入的 rarity 為主
  var subN = (['R','E'].indexOf(r)>=0)?1 : (['A','S'].indexOf(r)>=0)?2 : (['SS','SSS'].indexOf(r)>=0)?3 : 4;
  var subs=[]; var pool=SUB_POOL.slice();
  for(var i=0;i<subN;i++){ var s=pool.splice(Math.floor(Math.random()*pool.length),1)[0]; var base=Math.ceil(Math.random()*8)+2; if(r==='∞') base=Math.round(base*1.5); subs.push({stat:s, value:base}); }
  var mainBase = ({R:5,E:8,A:12,S:18,SS:25,SSS:33,Z:42,ZZ:52,ZZZ:66,'∞':90})[r]||5;
  return {id:'eq'+Date.now()+Math.floor(Math.random()*999), name:r+'裝備', slot:slot, rarity:r, mainStat:MAIN_STAT[slot], mainValue:mainBase, lv:1, subStats:subs};
}

/* ════════════════════════════════════════════════════════════
   UI 基礎：彈窗
   ════════════════════════════════════════════════════════════ */
function el(tag, cls, html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
function openPanel(title, bodyNode, dark){
  closePanel();
  var ov=el('div','gd-overlay');
  var panel=el('div','gd-panel'+(dark?' dark':''));
  var head=el('div','gd-head'); head.appendChild(el('div','gd-title',title));
  var x=el('button','gd-close','✕'); x.onclick=closePanel; head.appendChild(x);
  var body=el('div','gd-body'); body.appendChild(bodyNode);
  panel.appendChild(head); panel.appendChild(body); ov.appendChild(panel);
  ov.addEventListener('click', function(e){ if(e.target===ov) closePanel(); });
  document.body.appendChild(ov); return {ov:ov, body:body};
}
function closePanel(){ var o=document.querySelector('.gd-overlay'); if(o) o.remove(); var c=document.querySelector('.gd-battle-wrap'); /* keep battle separate */ }

function findUser(username){
  var arr=get(LS.users,[]); return arr.find(function(x){return x.username===username;})||null;
}
function friendList(){
  var me2=cur(); if(!me2) return [];
  var fr=get(LS.fr,[]);
  return fr.filter(function(f){return f.status==='accepted' && (f.a===me2.username||f.b===me2.username);})
           .map(function(f){ return f.a===me2.username? f.b : f.a; });
}

/* ════════════════════════════════════════════════════════════
   UI：主選單（浮動啟動鈕）
   ════════════════════════════════════════════════════════════ */
function buildLauncher(){
  if(document.getElementById('gdLaunch')) return;
  var box=el('div','gd-launch'); box.id='gdLaunch';
  var btn=el('button','gd-launch-btn','🚀 九大強化版');
  btn.onclick=openHub;
  box.appendChild(btn);
  document.body.appendChild(box);
}
function openHub(){
  var u=cur();
  if(!u){ say('請先登入','bad'); return; }
  checkArenaDailyMail(); /* 進入功能中心時順便檢查今日 PK 競技塔排名獎勵是否已發放到信箱 */
  var node=el('div');
  node.appendChild(el('div','gd-hint','當前帳號：<b>'+(u.name||u.username)+'</b> ｜ 身分：'+(u.role||'?')+' ｜ 角色等級：'+(u.g?u.g.lv:1)+' ｜ 系統等級上限：'+maxLevel()));
  var grid=el('div','gd-grid');
  var items=[
    {t:'⚔️ 即時戰鬥副本', f:openBattleSelect},
    {t:'🎯 自由加點', f:openFreePoints},
    {t:'♾️ ∞ 七階段換取', f:openInfty},
    {t:'🛒 雙倍增益商店', f:openBuffShop},
    {t:'🎁 社交送禮', f:openGift},
    {t:'🌟 星辰幣：'+Star.get(), f:openBuffShop},
    {t:'📜 我的日誌', f:openMyLog},
    {t:'👑 管理員面板', f:openAdmin, admin:true}
  ];
  items.forEach(function(it){
    if(it.admin && !IS_ADMIN()) return;
    var c=el('div','gd-card'); c.appendChild(el('div','gd-name',it.t));
    var b=el('button','gd-btn sm','開啟'); b.onclick=it.f; c.appendChild(b); grid.appendChild(c);
  });
  node.appendChild(grid);
  openPanel('🚀 九大強化版 功能中心', node, false);
}

/* ── 自由加點面板 ── */
function openFreePoints(){
  var d=FreeP.data();
  var node=el('div');
  node.appendChild(el('div','gd-section',
    '目前等級：<b>'+(cur().g?cur().g.lv:1)+'</b> ｜ 系統等級上限：<b>'+maxLevel()+'</b> ｜ 可獲得總點數（與等級綁定）：<b>'+FreeP.total()+'</b> ｜ 已分配：<b>'+FreeP.allocated()+'</b> ｜ 剩餘：<b class="gd-ok">'+FreeP.remain()+'</b> ｜ 單項上限：<b>'+freeCap()+'</b>'));
  var list=el('div','gd-grid');
  FP_DIRS.forEach(function(dir){
    var c=el('div','gd-card');
    c.appendChild(el('div','gd-name',dir.name));
    c.appendChild(el('div','gd-sub',dir.desc));
    c.appendChild(el('div','gd-sub','已分配：'+(d.used[dir.id]||0)+' / '+freeCap()));
    var row=el('div','gd-row tight');
    var minus=el('button','gd-ptbtn minus','−'); minus.onclick=function(){ if((d.used[dir.id]||0)>0){ d.used[dir.id]--; saveSub(); logGD('自由加點',dir.id+' -1'); openFreePoints(); } };
    var plus=el('button','gd-ptbtn','＋'); plus.onclick=function(){ FreeP.add(dir.id); openFreePoints(); };
    row.appendChild(minus); row.appendChild(plus); c.appendChild(row);
    list.appendChild(c);
  });
  node.appendChild(list);
  node.appendChild(el('div','gd-divider'));
  var reset=el('button','gd-btn ghost','🔄 重置（不限次數，僅清空分配）'); reset.onclick=function(){ FreeP.reset(); openFreePoints(); };
  node.appendChild(reset);
  node.appendChild(el('div','gd-hint','說明：自由加點「與等級綁定」——每升 1 級獲得 3 點，總點數＝目前等級×3（不預支滿級點數）。每點效果溫和但有感：戰力 +0.2%/點、寶石 +0.3%/點、金幣 +0.3%/點、運氣 +0.3%/點（影響掉落品質）、運氣加成 +0.1%/點（微幅加速保底）。'));
  openPanel('🎯 自由加點', node);
}

/* ── ∞ 七階段換取面板 ── */
function openInfty(){
  var d=INFTY.data();
  var node=el('div');
  node.appendChild(el('div','gd-section','目前無限競技塔：<b>'+window.ADV9_WIRE.pk_tower()+' 層</b> ｜ 系統等級上限：<b>'+maxLevel()+'</b>（等級條件已自動適配）'));
  var got=REROLL_ATTRS.filter(function(a){return d.got[a.id];}).map(function(a){return a.icon+a.name;}).join('、')||'（尚無）';
  node.appendChild(el('div','gd-sub','已獲得 ∞ 學科：'+got));
  var list=el('div','gd-grid');
  for(var s=1;s<=7;s++){
    var c=el('div','gd-card');
    var done=d.stages[s-1];
    c.appendChild(el('div','gd-name','第 '+s+' 階段'+(done?' ✅':'')));
    var cond=INFTY.cond(s);
    c.appendChild(el('div','gd-sub',cond.need));
    c.appendChild(el('div','gd-sub', cond.ok?'<span class="gd-ok">條件達成</span>':'<span class="gd-warn">未達成</span>'));
    if(!done && INFTY.canClaim(s)){
      var b=el('button','gd-btn pink sm','選擇學科換取');
      b.onclick=function(stage){ return function(){ pickInftyAttr(stage); }; }(s);
      c.appendChild(b);
    }
    list.appendChild(c);
  }
  node.appendChild(list);
  if(IS_ADMIN()){
    node.appendChild(el('div','gd-divider'));
    var ad=el('div','gd-section');
    ad.appendChild(el('h4','', '👑 管理員：直接贈送 ∞（繞過機率與七階段，必留紀錄）'));
    var row=el('div','gd-row');
    REROLL_ATTRS.forEach(function(a){
      var b=el('button','gd-btn amber sm', a.icon+a.name);
      b.onclick=function(){ INFTY.adminGrant(a.id, '管理員手動贈送'); openInfty(); };
      row.appendChild(b);
    });
    ad.appendChild(row); node.appendChild(ad);
  }
  openPanel('♾️ ∞ 七階段換取', node);
}
function pickInftyAttr(stage){
  var d=INFTY.data();
  var node=el('div');
  node.appendChild(el('div','gd-sub','請選擇一個「尚未獲得 ∞」的學科（每學科僅一次，不可跳階）。'));
  var row=el('div','gd-row');
  REROLL_ATTRS.forEach(function(a){
    var has = d.got[a.id] || (rerollGet().attr||{})[a.id]==='∞';
    var b=el('button','gd-btn sm', a.icon+a.name);
    if(has) b.disabled=true;
    b.onclick=function(){ if(confirm('確定以「'+a.name+'」換取第 '+stage+' 階段 ∞？（此操作會寫入日誌）')){ INFTY.claim(stage,a.id); openInfty(); } };
    row.appendChild(b);
  });
  node.appendChild(row);
  openPanel('選擇 ∞ 學科（第 '+stage+' 階段）', node);
}

/* ── 雙倍增益商店 ── */
function openBuffShop(){
  var node=el('div');
  node.appendChild(el('div','gd-section','🌟 星辰幣：<b>'+Star.get()+'</b> ｜ 💎 寶石：<b>'+(cur().g?cur().g.crystal:0)+'</b>'));
  // 生效中
  var act=Buff.active();
  if(act){ var tname=(BUFF_TYPES.find(function(b){return b.id===act.type})||{}).name||act.type;
    var exp= act.expire? ('剩餘 '+Math.ceil((act.expire-Date.now())/60000)+' 分') :'永久';
    node.appendChild(el('div','gd-sub','目前生效：<span class="gd-ok">'+tname+'</span>（'+exp+'）— 同一時間僅一種生效')); }
  else node.appendChild(el('div','gd-sub','目前無生效增益'));
  var grid=el('div','gd-grid');
  BUFF_TYPES.forEach(function(bt){
    BUFF_VERS.forEach(function(ver){
      var c=el('div','gd-card');
      c.appendChild(el('div','gd-name',bt.icon+' '+bt.name));
      c.appendChild(el('div','gd-sub',ver.label));
      c.appendChild(el('div','gd-sub',bt.desc));
      c.appendChild(el('div','gd-sub','價格：'+buffPrice(bt.id,ver)+'（星辰幣優先，不足扣寶石）'));
      var b=el('button','gd-btn green sm','購買'); b.onclick=function(){ Buff.buy(bt.id,ver); openBuffShop(); };
      c.appendChild(b);
      grid.appendChild(c);
    });
  });
  node.appendChild(grid);
  // 背包 + 啟用
  node.appendChild(el('div','gd-divider'));
  var bag=el('div','gd-section'); bag.appendChild(el('h4','','🎒 增益背包（購買後需手動啟用）'));
  var bg=Buff.bag();
  if(!bg.length) bag.appendChild(el('div','gd-sub','（空）'));
  else {
    /* 依「類型+版本」合併顯示，避免同名增益一張一張列出（如 🍀 雙倍運氣券*2） */
    var groups={};
    bg.forEach(function(it){ var k=it.type+'|'+it.ver; (groups[k]=groups[k]||[]).push(it); });
    Object.keys(groups).forEach(function(k){
      var items=groups[k], it=items[0];
      var tn=(BUFF_TYPES.find(function(b){return b.id===it.type})||{}).name||it.type;
      var vn=(BUFF_VERS.find(function(v){return v.id===it.ver})||{}).label||it.ver;
      var label = items.length>1 ? (tn+'*'+items.length+'（'+vn+'）') : (tn+' / '+vn);
      var row=el('div','gd-row tight');
      row.appendChild(el('span','gd-sub',label));
      var b=el('button','gd-btn sm','啟用'); b.onclick=function(){ Buff.activate(it.id); openBuffShop(); };
      row.appendChild(b); bag.appendChild(row);
    });
  }
  node.appendChild(bag);
  openPanel('🛒 雙倍增益商店', node);
}

/* ── 社交送禮 ── */
function openGift(){
  var u=cur();
  var node=el('div');
  // 收件匣
  var inbox=Gift.inbox();
  var sec=el('div','gd-section'); sec.appendChild(el('h4','','📥 待領取禮物（'+inbox.length+'）'));
  inbox.forEach(function(r){
    var row=el('div','gd-row tight');
    row.appendChild(el('span','gd-sub', r.from+' → '+r.itemName+' / '+r.verLabel+' ['+GIFT_BOX[r.box]+']'));
    var b=el('button','gd-btn green sm','領取'); b.onclick=function(){ Gift.claim(r.id); openGift(); };
    row.appendChild(b); sec.appendChild(row);
  });
  if(!inbox.length) sec.appendChild(el('div','gd-sub','（無）'));
  node.appendChild(sec);
  // 寄出
  var send=el('div','gd-section');
  send.appendChild(el('h4','','🎁 寄出禮物（從背包選增益道具）'));
  var bag=Buff.bag();
  if(!bag.length){ send.appendChild(el('div','gd-sub','背包沒有可送出的增益道具，請先至商店購買。')); }
  else {
    bag.forEach(function(it){
      var tn=(BUFF_TYPES.find(function(b){return b.id===it.type})||{}).name||it.type;
      var vn=(BUFF_VERS.find(function(v){return v.id===it.ver})||{}).label||it.ver;
      var row=el('div','gd-row tight');
      row.appendChild(el('span','gd-sub',tn+' / '+vn));
      var sel=el('select','gd-grow'); friendList().forEach(function(f){ var o=el('option'); o.value=f; o.textContent=f; sel.appendChild(o); });
      if(!friendList().length) sel.appendChild(el('option','','（尚無好友）'));
      var boxsel=el('select',''); Object.keys(GIFT_BOX).forEach(function(k){ var o=el('option'); o.value=k; o.textContent=GIFT_BOX[k]; if(k===giftBoxByValue(it.ver)) o.selected=true; sel; boxsel.appendChild(o); });
      var b=el('button','gd-btn pink sm','送出');
      b.onclick=function(){ if(!friendList().length){ say('請先加好友','bad'); return; }
        if(confirm('確定寄出「'+tn+'」給 '+sel.value+'？一經送出不得撤回。')){ Gift.send(sel.value, it.id, boxsel.value); openGift(); } };
      row.appendChild(sel); row.appendChild(boxsel); row.appendChild(b); send.appendChild(row);
    });
  }
  node.appendChild(send);
  // 贈送紀錄
  var recs=Gift.records().filter(function(r){return r.from===u.username;}).slice(-10).reverse();
  var log=el('div','gd-section'); log.appendChild(el('h4','','📜 我送出的紀錄'));
  recs.forEach(function(r){ log.appendChild(el('div','gd-sub', r.time.slice(0,16)+' → '+r.to+'：'+r.itemName+' ['+GIFT_BOX[r.box]+']'+(r.claimed?' ✅已領':' ⏳未領'))); });
  if(!recs.length) log.appendChild(el('div','gd-sub','（無）'));
  node.appendChild(log);
  openPanel('🎁 社交送禮', node);
}

/* ── 我的日誌 ── */
function openMyLog(){
  var g=cur().g; var arr=(g&&g.gdLog)||[];
  var node=el('div');
  node.appendChild(el('div','gd-sub','以下為你在本系統的重要行為紀錄（抽獎/掉落/送禮/管理員操作/副本通關/貨幣變動/∞換取等）：'));
  var t=el('table','gd-table'); t.innerHTML='<tr><th>時間</th><th>行為</th><th>明細</th></tr>';
  arr.slice(-50).reverse().forEach(function(r){ var tr=el('tr'); tr.innerHTML='<td>'+String(r.t).slice(0,16)+'</td><td>'+esc(r.action)+'</td><td>'+esc(r.detail||'')+'</td>'; t.appendChild(tr); });
  node.appendChild(t);
  openPanel('📜 我的日誌', node);
}

/* ── 管理員面板（規格二十八、二十九） ── */
function openAdmin(){
  if(!IS_ADMIN()){ say('⚠️ 僅管理員','bad'); return; }
  var node=el('div');
  // 系統設定
  var s=el('div','gd-section'); s.appendChild(el('h4','','⚙️ 系統設定（修改立即影響全體升級上限）'));
  var mlRow=el('div','gd-row tight');
  mlRow.appendChild(el('span','gd-label','角色最高等級：'));
  var ml=el('input','gd-grow'); ml.type='number'; ml.value=maxLevel(); ml.min=1; ml.max=9999;
  var mlBtn=el('button','gd-btn sm','儲存'); mlBtn.onclick=function(){ var v=parseInt(ml.value,10); if(v<1){say('數值無效','bad');return;} var old=maxLevel(); setCfg({maxLevel:v}); adminLog('設定最高等級', old+' → '+v); logGD('管理員設定最高等級', old+'→'+v); say('✅ 最高等級已設為 '+v); openAdmin(); };
  mlRow.appendChild(ml); mlRow.appendChild(mlBtn); s.appendChild(mlRow);
  var fcRow=el('div','gd-row tight');
  fcRow.appendChild(el('span','gd-label','自由屬性單項上限：'));
  var fc=el('input','gd-grow'); fc.type='number'; fc.value=freeCap(); fc.min=1; fc.max=9999;
  var fcBtn=el('button','gd-btn sm','儲存'); fcBtn.onclick=function(){ var v=parseInt(fc.value,10); if(v<1){say('數值無效','bad');return;} setCfg({freeCap:v}); adminLog('設定單項上限', v+''); say('✅ 單項上限已設為 '+v); openAdmin(); };
  fcRow.appendChild(fc); fcRow.appendChild(fcBtn); s.appendChild(fcRow);
  node.appendChild(s);
  // 活動模式 / 雙倍歡樂時間
  var act=el('div','gd-section'); act.appendChild(el('h4','','🎉 活動模式'));
  var hb=el('button','gd-btn amber sm','一鍵全班雙倍寶石 1 小時'); hb.onclick=function(){ Buff.adminGrant(cur().username,'gem','day'); say('已對自己示範雙倍歡樂時間（正式請指定對象）'); };
  act.appendChild(hb);
  // 禮包碼
  var codeSec=el('div','gd-section'); codeSec.appendChild(el('h4','','🎟️ 禮包碼生成'));
  var codeIn=el('input','gd-grow'); codeIn.placeholder='禮包碼（英文數字）';
  var codeReward=el('input','gd-grow'); codeReward.placeholder='獎勵說明（如 星辰幣100）';
  var codeBtn=el('button','gd-btn sm','生成'); codeBtn.onclick=function(){ var code=(codeIn.value||'').trim(); if(!code){say('請填寫碼','bad');return;} var codes=get(LS.codes,[]); codes.push({code:code, note:codeReward.value||'', reward:{star:100}, maxUses:50, usedBy:[], time:new Date().toISOString()}); set(LS.codes,codes); adminLog('生成禮包碼', code); say('✅ 禮包碼 '+code+' 已生成'); openAdmin(); };
  var cr=el('div','gd-row tight'); cr.appendChild(codeIn); cr.appendChild(codeReward); cr.appendChild(codeBtn); codeSec.appendChild(cr);
  node.appendChild(codeSec);
  // 發送星辰幣 / 增益
  var grant=el('div','gd-section'); grant.appendChild(el('h4','','🎁 發送（指定對象）'));
  var gUser=el('input','gd-grow'); gUser.placeholder='目標帳號 username';
  var gStar=el('input','gd-grow'); gStar.type='number'; gStar.placeholder='星辰幣數量';
  var gBtn=el('button','gd-btn sm','發星辰幣'); gBtn.onclick=function(){ var tu=findUser(gUser.value.trim()); if(!tu){say('找不到使用者','bad');return;} if(!tu.g)tu.g={}; if(!tu.g.star)tu.g.star={coin:0}; tu.g.star.coin+=(parseInt(gStar.value,10)||0); saveU(tu); adminLog('發送星辰幣', gUser.value+' +'+(parseInt(gStar.value,10)||0)); say('✅ 已發送星辰幣'); openAdmin(); };
  var gr=el('div','gd-row tight'); gr.appendChild(gUser); gr.appendChild(gStar); gr.appendChild(gBtn); grant.appendChild(gr);
  var gType=el('select',''); BUFF_TYPES.forEach(function(b){var o=el('option');o.value=b.id;o.textContent=b.name;gType.appendChild(o);});
  var gVer=el('select',''); BUFF_VERS.forEach(function(v){var o=el('option');o.value=v.id;o.textContent=v.label;gVer.appendChild(o);});
  var gTypeUser=el('input','gd-grow'); gTypeUser.placeholder='目標帳號 username';
  var gbBtn=el('button','gd-btn sm','發增益'); gbBtn.onclick=function(){ Buff.adminGrant(gTypeUser.value.trim(), gType.value, gVer.value); openAdmin(); };
  var gr2=el('div','gd-row tight'); gr2.appendChild(gTypeUser); gr2.appendChild(gType); gr2.appendChild(gVer); gr2.appendChild(gbBtn); grant.appendChild(gr2);
  node.appendChild(grant);
  // 管理日誌
  var al=el('div','gd-section'); al.appendChild(el('h4','','📋 管理員操作日誌'));
  var at=el('table','gd-table'); at.innerHTML='<tr><th>時間</th><th>操作者</th><th>動作</th><th>明細</th></tr>';
  get('ADV9_ADMINLOG',[]).slice(-40).reverse().forEach(function(r){ var tr=el('tr'); tr.innerHTML='<td>'+String(r.t).slice(0,16)+'</td><td>'+esc(r.by)+'</td><td>'+esc(r.action)+'</td><td>'+esc(r.detail||'')+'</td>'; at.appendChild(tr); });
  al.appendChild(at); node.appendChild(al);
  openPanel('👑 管理員面板', node, true);
}

/* ════════════════════════════════════════════════════════════
   即時戰鬥：選關 + 地圖 + canvas
   ════════════════════════════════════════════════════════════ */
var BATTLE = null;
function openBattleSelect(){
  var u=cur(); if(!u||!u.g){ say('請先登入','bad'); return; }
  var node=el('div');
  node.appendChild(el('div','gd-section','選擇副本難度。開放條件不足者將被鎖定。隊伍 1~5 人，每多 1 人掉率 +10%（最高 +40%），採個人掉落制。'));
  var grid=el('div','gd-grid');
  Object.keys(DUNGEON_CFG).forEach(function(key){
    var c=DUNGEON_CFG[key];
    var locked = (c.needTerr>0 && [0,1,2,3,4].every? false : false);
    // 開放條件
    var terr=window.ADV9_WIRE.sub_lv_0(); // 領土以第0科近似（實際應檢查各科）
    var terrOK = minTerr()>=c.needTerr;
    var towerOK = window.ADV9_WIRE.pk_tower()>=c.needTower;
    var lock = (c.needTerr>0 && !terrOK) || (c.needTower>0 && !towerOK);
    var card=el('div','gd-card'+(lock?'':' sel'));
    card.appendChild(el('div','gd-name',c.name+(lock?' 🔒':'')));
    card.appendChild(el('div','gd-sub','關卡 '+c.waves+' ｜ 寶箱 '+c.chests));
    card.appendChild(el('div','gd-sub','掉落：'+c.pool.join('~')));
    if(lock) card.appendChild(el('div','gd-bad','需 領土 '+c.needTerr+' 或 競技塔 '+c.needTower+' 層'));
    else { var b=el('button','gd-btn sm','進入'); b.onclick=function(){ startBattle(key); }; card.appendChild(b); }
    grid.appendChild(card);
  });
  node.appendChild(grid);
  openPanel('⚔️ 即時戰鬥副本選擇', node);
}
function minTerr(){ var m=9999; for(var i=0;i<5;i++){ var v=terrLv(i); if(v<m) m=v; } return m===9999?0:m; }

/* (原 startBattle 已由下方 doStartBattle 取代，避免重複定義) */

function genMap(cfg){
  var nodes=[];
  for(var w=1; w<=cfg.waves; w++){
    var type = w===cfg.waves?'boss' : (w%5===0?'mini':'normal');
    nodes.push({wave:w, type:type, name: type==='boss'?'💀 BOSS': type==='mini'?'👹 精英':'👹 小怪 '+w, done:false, cur:false});
  }
  // 隨機事件/寶箱標記
  nodes.forEach(function(n){ if(n.type==='normal' && Math.random()<0.35) n.event=true; if(n.type!=='boss' && Math.random()<0.3) n.chest=true; });
  return nodes;
}
function renderMap(view, nodes, curIdx){
  view.innerHTML='';
  // 由上而下，每 5 關一行
  for(var i=0;i<nodes.length;i+=5){
    var row=el('div','gd-map-row');
    for(var j=i;j<Math.min(i+5,nodes.length);j++){
      var n=nodes[j]; var cls='gd-node'+(n.type==='boss'?' boss':n.type==='mini'?' mini':n.chest?' chest':n.event?' event':'');
      if(n.done) cls+=' done'; if(j===curIdx) cls+=' cur';
      var e=el('div',cls); e.innerHTML='<div>'+(n.type==='boss'?'💀':n.type==='mini'?'👹':n.chest?'🎁':n.event?'⚡':'👣')+'</div><div>'+n.wave+'</div>';
      row.appendChild(e);
    }
    view.appendChild(row);
  }
}

/* 戰鬥核心（requestAnimationFrame 即時迴圈） */
function Combat(canvas, hud, bossbar, cfg, teamBonus, mapNodes, mapView, user){
  var self=this; this.stopped=false;
  this.canvas=canvas; this.ctx=canvas.getContext('2d'); this.cfg=cfg; this.teamBonus=teamBonus;
  this.mapNodes=mapNodes; this.mapView=mapView; this.user=user;
  this.isHost=true;
  this.settled=false;
  this.W=canvas.width; this.H=canvas.height; this.wave=0; this.waveEnemies=[]; this.projectiles=[]; this.telegraphs=[]; this.particles=[];
  var fp=FreeP.bonus(); var rb=window.getRerollBonuses? window.getRerollBonuses():{};
  // 玩家屬性：結合等級、自由點、滾動加成
  var g=user.g;
  var lvl=g.lv||1;
  var powerMul=1 + (fp.power/100);
  this.player={ x:this.W/2, y:this.H*0.75, vx:0, vy:0, r:16, speed:200,
    hp: 300+lvl*20*powerMul, maxhp:300+lvl*20*powerMul,
    atk: (10+lvl*1.2)*powerMul*(1+(rb&&rb.math?(rb.math.flat||0)/100:0)),
    cd:0.45/Math.max(0.5,(rb&&rb.english?(rb.english.flat||0)/100+1:1)),
    crit:(rb&&rb.math?(rb.math.flat||0):0)+(fp.luck/100*10),
    dodgeCd:0, iframe:0, atkCd:0, skills:[0,0,0,0], aim:{x:this.W/2,y:0} };
  this.buffs={gem:fp.gem/100, gold:fp.gold/100, luck:fp.luck/100, active: Buff.activeType()};
  this.keys={}; this.touch={x:0,y:0,active:false,atk:false,dodge:false,sk:[false,false,false,false]};
  this.boss=null;

  window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKeyUp);
  function onKey(e){ if(['w','a','s','d','j',' '].indexOf(e.key.toLowerCase())>=0 || (e.key>='1'&&e.key<='4')){ self.keys[e.key.toLowerCase()]=true; if(e.key===' ')e.preventDefault(); } }
  function onKeyUp(e){ if(['w','a','s','d','j',' '].indexOf(e.key.toLowerCase())>=0 || (e.key>='1'&&e.key<='4')){ self.keys[e.key.toLowerCase()]=false; } }

  this.start=function(){
    var self2=this;
    this.canvas.addEventListener('mousemove', function(e){ var rect=self2.canvas.getBoundingClientRect(); var rx=(e.clientX-rect.left)/rect.width*self2.W; var ry=(e.clientY-rect.top)/rect.height*self2.H; self2.player.aim.x=rx; self2.player.aim.y=ry; });
    this.nextWave();
    this.raf=requestAnimationFrame(loop);
  };
  this.stop=function(){ this.stopped=true; window.removeEventListener('keydown',onKey); window.removeEventListener('keyup',onKeyUp); cancelAnimationFrame(this.raf); };
  this.nextWave=function(){
    this.wave++;
    if(this.wave>this.cfg.waves){ this.win(); return; }
    this.mapNodes.forEach(function(n,i){ n.cur=(i===self.wave-1); });
    renderMap(this.mapView, this.mapNodes, this.wave-1);
    if(this.wave===this.cfg.waves){ this.spawnBoss(); }
    else { var cnt= 3+Math.floor(this.wave/2); if(this.wave%5===0) cnt=1; this.spawnWave(cnt, this.wave%5===0); }
    hud.querySelector('#gdWave').textContent='關 '+this.wave+'/'+this.cfg.waves;
  };
  this.spawnWave=function(n, elite){
    this.waveEnemies=[];
    for(var i=0;i<n;i++){ var e=this.mkEnemy(80+this.wave*10, elite); e.id='w'+this.wave+'-'+i; this.waveEnemies.push(e); }
  };
  this.spawnBoss=function(){
    this.boss={ id:'w'+this.wave+'-boss', x:this.W/2, y:this.H*0.25, r:42, hp:1200+this.wave*120, maxhp:1200+this.wave*120, atkTimer:2, telegraph:null, phase:0, elite:false };
    this.waveEnemies=[this.boss];
  };
  this.mkEnemy=function(power, elite){
    return { x:Math.random()*this.W, y:Math.random()*this.H*0.4, r:elite?22:16, hp:power, maxhp:power, elite:elite, atk:power*0.3, hit:0 };
  };

  var last=performance.now();
  function loop(now){
    if(self.stopped) return;
    var dt=Math.min(0.05,(now-last)/1000); last=now;
    self.update(dt); self.draw();
    self.raf=requestAnimationFrame(loop);
  }

  this.update=function(dt){
    var p=this.player;
    // 移動
    var dx=0,dy=0;
    if(self.touchMode && self.touch.active){ dx=self.touch.x; dy=self.touch.y; }
    else { if(this.keys['a'])dx-=1; if(this.keys['d'])dx+=1; if(this.keys['w'])dy-=1; if(this.keys['s'])dy+=1; }
    var len=Math.hypot(dx,dy)||1; p.x+=dx/len*p.speed*dt; p.y+=dy/len*p.speed*dt;
    p.x=Math.max(p.r,p.x); p.x=Math.min(this.W-p.r,p.x); p.y=Math.max(p.r,p.y); p.y=Math.min(this.H-p.r,p.y);
    if(p.iframe>0) p.iframe-=dt; if(p.dodgeCd>0) p.dodgeCd-=dt; if(p.atkCd>0) p.atkCd-=dt;
    for(var i=0;i<4;i++) if(p.skills[i]>0) p.skills[i]-=dt;
    // 瞄準（mousemove 已在 start() 註冊一次，避免每幀重複綁定）
    if(!self.touchMode && p.aim.x===self.W/2 && p.aim.y===0){ p.aim.y=self.H*0.3; }
    // 攻擊
    var atk=false;
    if(self.touchMode) atk=self.touch.atk; else atk=this.keys['j'];
    if(atk && p.atkCd<=0){ this.fire(); p.atkCd=p.cd; }
    // 技能
    for(var s=0;s<4;s++){ var pressed = self.touchMode? self.touch.sk[s] : this.keys[String(s+1)]; if(pressed && p.skills[s]<=0){ this.skill(s); p.skills[s]=2.5; } }
    // 閃避
    var dodge = self.touchMode? self.touch.dodge : this.keys[' '];
    if(dodge && p.dodgeCd<=0){ p.iframe=0.4; p.dodgeCd=1.2; var ang=Math.atan2(dy,dx)||-Math.PI/2; p.x+=Math.cos(ang)*60; p.y+=Math.sin(ang)*60; this.burst(p.x,p.y,'#9ef'); }

    // 子彈
    this.projectiles.forEach(function(pr){ pr.x+=pr.vx*dt; pr.y+=pr.vy*dt; });
    this.projectiles=this.projectiles.filter(function(pr){ return pr.x>-20&&pr.x<self.W+20&&pr.y>-20&&pr.y<self.H+20; });
    // 敵人
    var self2=this;
    this.waveEnemies.forEach(function(en){
      if(en===self2.boss){ self2.updateBoss(en,dt); }
      else {
        var a=Math.atan2(p.y-en.y, p.x-en.x); en.x+=Math.cos(a)*60*dt; en.y+=Math.sin(a)*60*dt;
        if(Math.hypot(p.x-en.x,p.y-en.y)<p.r+en.r){ if(p.iframe<=0){ p.hp-=en.atk*dt*10; self2.hitFlash(); } }
      }
    });
    // 子彈打敵人
    this.projectiles.forEach(function(pr){ self2.waveEnemies.forEach(function(en){ if(Math.hypot(pr.x-en.x,pr.y-en.y)<en.r+4){ var dmg=pr.dmg*(pr.crit?2:1); en.hp-=dmg; en.hit=0.1; if(pr.crit)self2.burst(pr.x,pr.y,'#ffd54a'); pr.dead=true; } }); });
    this.projectiles=this.projectiles.filter(function(pr){return !pr.dead;});
    // 敵人死亡
    var bossDead = this.boss && this.boss.hp<=0;
    var dead=this.waveEnemies.filter(function(en){return en.hp<=0;});
    dead.forEach(function(en){ self.burst(en.x,en.y,'#f88'); });
    this.waveEnemies=this.waveEnemies.filter(function(en){return en.hp>0;});
    if(bossDead) this.boss=null; /* BOSS 死亡後必須清除，否則 !this.boss 永遠為 false，nextWave→win 不會觸發，戰鬥卡死在 BOSS 關 */
    if(!this.boss && this.waveEnemies.length===0 && !this.stopped && this.isHost){ this.nextWave(); }
    // 玩家死亡
    if(p.hp<=0){ this.lose(); }
    // 粒子
    this.particles.forEach(function(pt){ pt.x+=pt.vx*dt; pt.y+=pt.vy*dt; pt.life-=dt; });
    this.particles=this.particles.filter(function(pt){return pt.life>0;});
    // HUD
    hud.querySelector('#gdHp').textContent='❤️ '+Math.max(0,Math.ceil(p.hp));
    if(this.boss){ bossbar.style.display='block'; bossbar.querySelector('i').style.width=Math.max(0,this.boss.hp/this.boss.maxhp*100)+'%'; }
    else bossbar.style.display='none';
    var bt=this.buffs.active? ('🟢'+ (BUFF_TYPES.find(function(b){return b.id===this.buffs.active})||{}).name):'';
    hud.querySelector('#gdBuff').textContent=bt;
  };
  this.updateBoss=function(b,dt){
    var p=this.player;
    // 緩慢逼近
    var a=Math.atan2(p.y-b.y, p.x-b.x); b.x+=Math.cos(a)*30*dt; b.y+=Math.sin(a)*30*dt;
    b.atkTimer-=dt;
    if(b.telegraph){ b.telegraph.t-=dt; if(b.telegraph.t<=0){ // 爆發
        if(Math.hypot(p.x-b.telegraph.x,p.y-b.telegraph.y)<b.telegraph.r && p.iframe<=0){ p.hp-=b.maxhp*0.25; this.hitFlash(); }
        b.telegraph=null; } }
    else if(b.atkTimer<=0){ b.atkTimer=2.2; b.telegraph={x:p.x,y:p.y,r:90,t:0.9}; } // 紅圈預警
    if(Math.hypot(p.x-b.x,p.y-b.y)<p.r+b.r && p.iframe<=0){ p.hp-=b.maxhp*0.05; this.hitFlash(); }
  };
  this.fire=function(){
    var p=this.player; var a=Math.atan2(p.aim.y-p.y, p.aim.x-p.x);
    var crit=Math.random()<(p.crit/100);
    this.projectiles.push({x:p.x,y:p.y,vx:Math.cos(a)*420,vy:Math.sin(a)*420,dmg:p.atk,crit:crit});
  };
  this.skill=function(s){
    var p=this.player; var a=Math.atan2(p.aim.y-p.y, p.aim.x-p.x); this.burst(p.x,p.y,'#9ef');
    for(var k=-1;k<=1;k++){ var aa=a+k*0.25; this.projectiles.push({x:p.x,y:p.y,vx:Math.cos(aa)*460,vy:Math.sin(aa)*460,dmg:p.atk*(1.4+s*0.2),crit:Math.random()<(p.crit/100)}); }
  };
  this.burst=function(x,y,c){ for(var i=0;i<8;i++){ var a=Math.random()*6.28; this.particles.push({x:x,y:y,vx:Math.cos(a)*120,vy:Math.sin(a)*120,life:0.5,color:c}); } };
  this.hitFlash=function(){ var cv=this.canvas; cv.style.filter='brightness(2)'; setTimeout(function(){cv.style.filter='';},80); };
  this.draw=function(){
    var c=this.ctx; c.clearRect(0,0,this.W,this.H);
    // 背景格線
    c.strokeStyle='rgba(255,255,255,.05)'; for(var x=0;x<this.W;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,this.H);c.stroke();}
    for(var y=0;y<this.H;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(this.W,y);c.stroke();}
    // 紅圈預警
    if(this.boss&&this.boss.telegraph){ c.fillStyle='rgba(255,60,60,.25)'; c.beginPath(); c.arc(this.boss.telegraph.x,this.boss.telegraph.y,this.boss.telegraph.r,0,6.28); c.fill(); c.strokeStyle='#ff5e5e'; c.beginPath(); c.arc(this.boss.telegraph.x,this.boss.telegraph.y,this.boss.telegraph.r,0,6.28); c.stroke(); }
    // 敵人
    this.waveEnemies.forEach(function(en){ c.fillStyle=en.elite?'#ff9f2e':(en===self.boss?'#ff5e5e':'#ff8080'); c.beginPath(); c.arc(en.x,en.y,en.r,0,6.28); c.fill(); if(en.hit>0){en.hit-=0.05;c.fillStyle='#fff';c.beginPath();c.arc(en.x,en.y,en.r*0.6,0,6.28);c.fill();}
      c.fillStyle='#000'; c.font='10px sans-serif'; c.textAlign='center'; c.fillText(Math.ceil(en.hp),en.x,en.y-en.r-4); });
    // 子彈
    this.projectiles.forEach(function(pr){ c.fillStyle=pr.crit?'#ffd54a':'#9ef'; c.beginPath(); c.arc(pr.x,pr.y,4,0,6.28); c.fill(); });
    // 玩家
    var p=this.player; c.fillStyle=p.iframe>0?'rgba(150,239,255,.6)':'#5b6cff'; c.beginPath(); c.arc(p.x,p.y,p.r,0,6.28); c.fill();
    c.fillStyle='#fff'; c.font='14px sans-serif'; c.textAlign='center'; c.fillText('🛡️',p.x,p.y+5);
    // 粒子
    this.particles.forEach(function(pt){ c.fillStyle=pt.color; c.globalAlpha=Math.max(0,pt.life*2); c.beginPath(); c.arc(pt.x,pt.y,3,0,6.28); c.fill(); c.globalAlpha=1; });
  };
  this.win=function(){
    if(this.settled)return; this.settled=true; this.stopped=true; this.stop();
    settleBattle(true);
  };
  this.lose=function(){
    if(this.settled)return; this.settled=true; this.stopped=true; this.stop();
    settleBattle(false);
  };
}

function bindTouch(touch, joy, keys, battle){
  var jx=0,jy=0; var joyEl=joy.querySelector('i');
  joy.addEventListener('touchstart',start); joy.addEventListener('touchmove',move); joy.addEventListener('touchend',end);
  function start(e){ battle.touch.active=true; var t=e.touches[0]; var r=joy.getBoundingClientRect(); jx=t.clientX-r.left-60; jy=t.clientY-r.top-60; update(); e.preventDefault(); }
  function move(e){ var t=e.touches[0]; var r=joy.getBoundingClientRect(); jx=t.clientX-r.left-60; jy=t.clientY-r.top-60; update(); e.preventDefault(); }
  function end(){ battle.touch.active=false; jx=jy=0; joyEl.style.left='38px'; joyEl.style.top='38px'; }
  function update(){ jx=Math.max(-50,Math.min(50,jx)); jy=Math.max(-50,Math.min(50,jy)); joyEl.style.left=(38+jx)+'px'; joyEl.style.top=(38+jy)+'px'; battle.touch.x=jx/50; battle.touch.y=jy/50; }
  Array.prototype.forEach.call(keys.children,function(b){
    var k=parseInt(b.dataset.k,10);
    b.addEventListener('touchstart',function(e){ if(k===0)battle.touch.atk=true; else if(k===5)battle.touch.dodge=true; else battle.touch.sk[k-1]=true; e.preventDefault(); });
    b.addEventListener('touchend',function(e){ if(k===0)battle.touch.atk=false; else if(k===5)battle.touch.dodge=false; else battle.touch.sk[k-1]=false; e.preventDefault(); });
  });
}

/* 戰鬥結算（規格三十二） */
function settleBattle(won){
  var u=cur(); if(!u||!u.g) return;
  var g=u.g; var node=el('div');
  var rewards={gold:0,gem:0,star:0,xp:0,enhStone:0,chests:0,equips:[]};
  if(won){
    var diff=window.__lastDiff; // 由 startBattle 紀錄
    var cfg=DUNGEON_CFG[diff]||DUNGEON_CFG.simple;
    // 隊伍掉落加成（以最後一次 teamBonus 計）
    var tb = window.__lastTeamBonus||0;
    var luckMul = 1 + (FreeP.bonus().luck/100) + tb; // 運氣與隊伍提升掉落
    if(Buff.activeType()==='luck') luckMul*=1.5;
    rewards.gold = Math.round((50+cfg.waves*20)*(1+(FreeP.bonus().gold/100)) * (Buff.activeType()==='gold'?2:1));
    rewards.gem  = Math.round((30+cfg.waves*10)*(1+(FreeP.bonus().gem/100)) * (Buff.activeType()==='gem'?2:1));
    rewards.star = Math.round(10+cfg.waves*2);
    rewards.xp   = cfg.waves*15;
    rewards.enhStone = cfg.waves;
    rewards.chests = cfg.chests * (Buff.activeType()==='chest'?2:1);
    // 寶箱掉落裝備
    for(var i=0;i<rewards.chests;i++){
      var r=rollRarity(cfg.pool, tb);
      var eq=genEquip(r, tb*0+ (Math.random()<luckMul*0.15?0.2:0));
      eqAdd(eq); rewards.equips.push(eq);
      // Z 以上公告
      if(['Z','ZZ','ZZZ','∞'].indexOf(eq.rarity)>=0){
        if(eq.rarity==='∞') announce('🌈 全服驚喜！'+u.username+' 在「'+cfg.name+'」副本抽出 ∞ 神裝『'+eq.name+'』！', true);
        else announce('🎉 '+u.username+' 在「'+cfg.name+'」副本獲得 '+eq.rarity+' 級裝備『'+eq.name+'』！');
        logGD('裝備掉落', eq.rarity+' '+eq.name+'（'+cfg.name+'）');
      }
    }
    // 寫入帳號
    g.gold=(g.gold||0)+rewards.gold; g.crystal=(g.crystal||0)+rewards.gem; g.enhStone=(g.enhStone||0)+rewards.enhStone;
    g.xp=(g.xp||0)+rewards.xp;
    Star.add(rewards.star,'副本通關');
    if(diff==='inf'){ g.inftyTower10=(g.inftyTower10||0)+1; } // ∞神域通關計次（用於第7階段）
    persist();
  } else {
    node.appendChild(el('div','gd-bad','💀 挑戰失敗，本次不結算獎勵（中途退出等同失敗）。已保留既有進度。'));
  }
  node.appendChild(el('div','gd-title', won?'🏆 通關結算 — '+(DUNGEON_CFG[window.__lastDiff]||{}).name:'💀 失敗'));
  node.appendChild(el('div','gd-section',
    '通關難度：'+(DUNGEON_CFG[window.__lastDiff]||{}).name+'<br>完成關數：'+(DUNGEON_CFG[window.__lastDiff]||{}).waves+'<br>'+
    '金幣 +'+rewards.gold+' ｜ 寶石 +'+rewards.gem+' ｜ 星辰幣 +'+rewards.star+' ｜ 經驗 +'+rewards.xp+' ｜ 強化石 +'+rewards.enhStone+'<br>獲得寶箱：'+rewards.chests+' ｜ 裝備掉落：'+(rewards.equips.length?rewards.equips.map(function(e){return '<span class="gd-rar '+e.rarity+'">'+e.rarity+'</span> '+e.name;}).join('，'):'無')));
  var close=el('button','gd-btn','關閉'); close.onclick=function(){ closePanel(); }; node.appendChild(close);
  openPanel('🏆 副本結算', node);
  logGD('副本通關', (DUNGEON_CFG[window.__lastDiff]||{}).name+' '+(won?'成功':'失敗'));
}

/* startBattle：直接單人挑戰（組隊副本已移除） */
function startBattle(diffKey){
  launchSingle(diffKey);
}
function launchSingle(diffKey){
  var cfg=DUNGEON_CFG[diffKey];
  var team=window.prompt('輸入隊伍人數（1~5，個人掉落制，每多1人掉率+10%）','1');
  team=Math.max(1,Math.min(5, parseInt(team,10)||1));
  var teamBonus=(team-1)*0.1; window.__lastTeamBonus=teamBonus; window.__lastDiff=diffKey;
  buildBattleUI(diffKey, team, teamBonus, null);
}
function buildBattleUI(diffKey, team, teamBonus){
  var u=cur(); var cfg=DUNGEON_CFG[diffKey];
  var eq=eqGet(); var wid=eq.equipped['武器'];
  var ov=el('div','gd-overlay'); ov.style.zIndex=9200;
  var panel=el('div','gd-panel'); panel.style.width='min(820px,98vw)';
  var head=el('div','gd-head'); head.appendChild(el('div','gd-title','⚔️ '+cfg.name+'副本（隊伍 '+team+' 人）'));
  var x=el('button','gd-close','✕'); x.onclick=function(){ if(BATTLE) BATTLE.stop(); ov.remove(); }; head.appendChild(x);
  var body=el('div','gd-body');
  var mapBox=el('div','gd-section'); mapBox.appendChild(el('h4','','🗺️ 副本地圖（BOSS 位於終點）'));
  var mapNodes=genMap(cfg); var mapView=el('div','gd-map'); renderMap(mapView,mapNodes,0); mapBox.appendChild(mapView); body.appendChild(mapBox);
  var wrap=el('div','gd-battle-wrap'); var canvas=el('canvas','gd-canvas'); canvas.width=780; canvas.height=585; wrap.appendChild(canvas);
  var hud=el('div','gd-hud'); hud.innerHTML='<span id="gdHp">❤️ 100</span><span id="gdWave">關 1/'+cfg.waves+'</span><span id="gdBuff"></span>'; wrap.appendChild(hud);
  var bossbar=el('div','gd-bossbar'); bossbar.innerHTML='<i style="width:100%"></i>'; wrap.appendChild(bossbar);
  var touch=el('div','gd-touch'); touch.id='gdTouch'; var joy=el('div','gd-joy'); joy.innerHTML='<i></i>'; touch.appendChild(joy);
  var keys=el('div','gd-keys');
  ['⚔️攻擊','1','2','3','4','💨閃避'].forEach(function(k,i){ var b=el('button','gd-key'+(i===0?' atk':(i===5?' dodge':''))); b.textContent=k; b.dataset.k=i; keys.appendChild(b); });
  touch.appendChild(keys); wrap.appendChild(touch); body.appendChild(wrap);
  panel.appendChild(head); panel.appendChild(body); ov.appendChild(panel); document.body.appendChild(ov);
  BATTLE=new Combat(canvas,hud,bossbar,cfg,teamBonus,mapNodes,mapView,u);
  BATTLE.start();
  if(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)){ touch.classList.add('on'); BATTLE.touchMode=true; bindTouch(touch,joy,keys,BATTLE); }
}

/* ════════════════════════════════════════════════════════════
   啟動
   ════════════════════════════════════════════════════════════ */
/* 每日 PK 無限競技塔排名獎勵：伺服器每日 09:00 計算後寫入 KV ADV9_ARENA_MAIL，
   客戶端雲端同步（每 15 秒）會把該 KV 拉進 localStorage，此處讀取並發放到信箱 g.mail */
function checkArenaDailyMail(){
  try{
    var data=get('ADV9_ARENA_MAIL',[]); if(!Array.isArray(data)||!data.length) return;
    var u=me(); if(!u||!u.g) return;
    var now=new Date(); var ds=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
    u.g.arenaMailClaimed=u.g.arenaMailClaimed||[];
    var changed=false;
    data.forEach(function(entry){
      if(!entry||entry.username!==u.username) return;
      if(entry.date!==ds) return;
      if(u.g.arenaMailClaimed.indexOf(ds+'#'+entry.rank)>=0) return;
      if(typeof addMail==='function'){ addMail(u.g,'🏟️ PK 無限競技塔 每日排名獎勵','恭喜！你在今日 PK 無限競技塔獲得第 '+entry.rank+' 名，排名獎勵已發放到信箱，點下方立即領取！',entry.rw||null); }
      u.g.arenaMailClaimed.push(ds+'#'+entry.rank); changed=true;
    });
    if(changed) saveU(u);
  }catch(e){}
}
function boot(){ buildLauncher(); try{ checkArenaDailyMail(); }catch(e){} setInterval(function(){ try{ checkArenaDailyMail(); }catch(e){} }, 60000); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();

// 暴露給外部（如既有頁面按鈕）呼叫
window.adv9PlusOpen = function(name){ if(name==='battle') openBattleSelect(); else if(name==='free') openFreePoints(); else if(name==='infty') openInfty(); else if(name==='buff') openBuffShop(); else if(name==='gift') openGift(); else if(name==='admin') openAdmin(); else if(name==='hub') openHub(); };
openBattleSelect.toString = openBattleSelect.toString; // noop

})();
