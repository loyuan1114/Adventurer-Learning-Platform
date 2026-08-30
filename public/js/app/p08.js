/* ════════ 全服玩家自由交易市集 ════════ */

/* ════════════════════════════════════════════
   vMarket 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMarket
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMarket 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMarket
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMarket 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMarket
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMarket 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMarket
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vMarket 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMarket
   ════════════════════════════════════════════ */
async function vMarket(){
  if(!await needJs(['js/views/vGShop.js', 'js/views/vMarket.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vMarket();
}






function marketListItem(ri){

const u=me(),g=u.g;const w=g.weapons[ri];if(!w)return;

const min=Math.ceil(itemValue(w)*CFG.TRADE_MIN_RATIO);

openModal('<h3 class="mt">📤 上架全服市集</h3>'+

'<p class="msub">'+esc(w.n)+' +'+(w.lv||0)+'（'+w.q+'）｜參考價值 🪙'+itemValue(w)+'｜最低定價 🪙'+min+'（40% 保障）</p>'+

'<label class="mlab">定價（🪙 金幣）<input id="mktPrice" type="number" min="'+min+'" value="'+itemValue(w)+'"></label>'+

'<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button><button class="btn" onclick="doMarketList('+ri+')">確認上架</button></div>');

}

function doMarketList(ri){

const u=me(),g=u.g;const w=g.weapons[ri];if(!w)return;

const min=Math.ceil(itemValue(w)*CFG.TRADE_MIN_RATIO);

const price=parseInt($('#mktPrice').value);

if(!price||price<min)return toast('⚠️ 定價不得低於 🪙'+min+'（物品價值 40%）','bad');

const mkt=get(LS.market,[]);

mkt.push({id:'m'+Date.now()+Math.floor(Math.random()*1000),sellerId:u.id,seller:u.name,w:JSON.parse(JSON.stringify(w)),price,t:Date.now()});

g.weapons.splice(ri,1);

set(LS.market,mkt);saveU(u);closeModal();hud();

toast('���� 已上架「'+w.n+'」🪙'+price+'，可在 🌐全服商店→玩家市集 查看');vBag();

}

function marketBuy(id){

const u=me(),g=u.g;const mkt=get(LS.market,[]);

const it=mkt.find(x=>x.id===id);

if(!it)return toast('⚠️ 商品已售出或下架','bad');

if(it.sellerId===u.id)return toast('⚠️ 不能購買自己上架的物品','bad');

if(g.gold<it.price)return toast('🪙 金幣不足（需 '+it.price+'）','bad');

g.gold-=it.price;g.weapons.push(it.w);

set(LS.market,mkt.filter(x=>x.id!==id));

const us=get(LS.users,[]);const seller=us.find(x=>x.id===it.sellerId);

if(seller&&seller.g){seller.g.gold+=it.price;set(LS.users,us)}

saveU(u);hud();toast('✅ 購買成功：'+it.w.n+'（🪙'+it.price+'），已放入背包');vMarket();

}

function marketCancel(id){

const u=me(),g=u.g;const mkt=get(LS.market,[]);

const it=mkt.find(x=>x.id===id);if(!it)return;

if(it.sellerId!==u.id)return toast('⚠️ 只能下架自己的商品','bad');

g.weapons.push(it.w);

set(LS.market,mkt.filter(x=>x.id!==id));

saveU(u);toast('↩️ 已下架「'+it.w.n+'」，物品已退回背包');vMarket();

}

/* ════════ 鍛造坊 ════════ */

/* ════════════════════════════════════════════
   vForge 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vForge
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vForge 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vForge
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vForge 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vForge
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vForge 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vForge
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vForge 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vForge
   ════════════════════════════════════════════ */
async function vForge(){
  if(!await needJs(['js/views/vForge.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vForge();
}






function doForge(id){

const u=me(),g=u.g;const r=CFG.FORGE_RECIPES.find(x=>x.id===id);

for(const k in r.mats){if((Number(g[k])||0)<Number(r.mats[k]))return toast('⚠️ 材料不足','bad')}

for(const k in r.mats){g[k]=Number(g[k])-Number(r.mats[k])}

g.forgeCount++;updMission(g,'forge',1);

const anvil=$('#anvil');if(anvil){anvil.classList.add('strike');

for(let i=0;i<6;i++){const sp=document.createElement('span');sp.className='sparkFx';sp.textContent='✨';

sp.style.left='50%';sp.style.top='120px';sp.style.setProperty('--dx',rnd(-60,60)+'px');sp.style.setProperty('--dy',rnd(-70,-20)+'px');

$('#view').appendChild(sp);setTimeout(()=>sp.remove(),700)}

setTimeout(()=>anvil.classList.remove('strike'),300)}

setTimeout(()=>{

if(Math.random()<r.rate){

const tot=Object.values(r.qw).reduce((a,b)=>a+b,0);let roll=Math.random()*tot,q='普通',c=0;

for(const k in r.qw){c+=r.qw[k];if(roll<c){q=k;break}}

const name=pick(r.pool);

const forged={n:q+name,q,lv:0,slot:r.slot};g.weapons.push(forged);const ed=eqGet();ed.owned=ed.owned||[];ed.owned.push({id:'forge'+Date.now()+Math.random().toString(36).slice(2,6),name:q+name,rarity:q,slot:r.slot,level:0,maxLevel:q==='∞'?150:100,mainAttr:EQ_MAIN_ATTR[r.slot]||'戰力',mainValue:1,subStats:[]});eqSet(ed);

saveU(u);hud();toast('⚒️ 鍛造成功！獲得 '+q+name+'（'+q+'品質）');

floatTxt('⚒️ '+q,'good',anvil);

}else{

saveU(u);hud();toast('💥 鍛造失敗...','bad');

}

vForge();

},400);

}

/* ════════ 背包/強化（#7 裝備強化＝戰力）════════ */

/* ════════════════════════════════════════════
   vBag 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBag
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vBag 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBag
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vBag 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBag
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vBag 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBag
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vBag 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBag
   ════════════════════════════════════════════ */
async function vBag(){
  if(!await needJs(['js/views/vBag.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vBag();
}






function renderBagList(){

const u=me();if(!u)return;const g=u.g;

let items=(g.weapons||[]).map((w,ri)=>({w,ri})); /* 保留真實索引，避免過濾後錯位 */

if(CUR.bagSearch){const s=CUR.bagSearch.toLowerCase();items=items.filter(x=>(x.w.n||'').toLowerCase().includes(s));}

if(CUR.bagQuality&&CUR.bagQuality!=='全部')items=items.filter(x=>x.w.q===CUR.bagQuality);

if(CUR.bagSlot&&CUR.bagSlot!=='全部')items=items.filter(x=>(x.w.slot||'其他')===CUR.bagSlot);

if(CUR.bagSort==='quality'){const qo={'傳說':0,'史詩':1,'精良':2,'優秀':3,'普通':4};items.sort((a,b)=>(qo[a.w.q]??5)-(qo[b.w.q]??5));}

else if(CUR.bagSort==='name')items.sort((a,b)=>(a.w.n||'').localeCompare(b.w.n||'','zh-Hant'));

else items.sort((a,b)=>(b.w.lv||0)-(a.w.lv||0));

const box=$('#bagList');if(!box)return;

box.innerHTML=items.length?items.map(x=>{const w=x.w,ri=x.ri;

return '<div class="panel2" style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap"><b style="color:'+(CFG.QUAL_C[w.q]||'var(--txt)')+'">🛡️ '+esc(w.n||'未知')+' +'+(w.lv||0)+'<span class="upType enh">強化｜⚡+'+((w.lv||0)*8)+'</span></b>'+

'<span style="font-size:11.5px;color:var(--mut)">'+(w.slot||'')+'｜成功率 '+Math.round((CFG.ENH.rate[w.lv||0]||0)*100)+'%｜價值 🪙'+itemValue(w)+'</span>'+

'<span style="display:flex;gap:6px;margin-left:auto;flex-wrap:wrap"><button class="btn mini" onclick="enh('+ri+',0)">強化</button><button class="btn ghost mini" onclick="enh('+ri+',1)">🛡️保護</button><button class="btn ghost mini" onclick="enh('+ri+',2)">🧿防爆</button><button class="btn teal mini" onclick="marketListItem('+ri+')">📤 上架市集</button></span></div>'}).join(''):'<p class="empty">沒有符合條件的裝備（答題掉落或鍛造可獲得）</p>';

}

function batchEnh(){

const u=me(),g=u.g;

if(!g.weapons.length)return toast('🎒 背包沒有裝備','bad');

let ok=0,fail=0,used=0;

for(const w of g.weapons){

const lv=w.lv||0;if(lv>=15)continue;

const cost=CFG.ENH.cost(lv);

if(Number(g.enhStone)<cost)break;

g.enhStone=Number(g.enhStone)-cost;used+=cost;

g.stats.enhance=(g.stats.enhance||0)+1;updMission(g,'enhance',1);

const rate=CFG.ENH.rate[lv]+(effOf(g).enhance_bonus||0);

if(Math.random()<rate){w.lv=lv+1;ok++}

else{const pen=CFG.ENH.pen(lv);w.lv=Math.max(0,lv-pen);fail++}

}

if(!used)return toast('🔩 強化石不足或裝備皆已滿級','bad');

saveU(u);hud();toast('⚒️ 批量強化完成：成功 '+ok+'｜失敗 '+fail+'（耗 🔩'+used+'）');vBag();

}

function enh(i,mode){

const u=me(),g=u.g;const w=g.weapons[i];if(!w)return;

const lv=w.lv||0;if(lv>=15)return toast('已達最高 +15','bad');

const cost=CFG.ENH.cost(lv);

if(Number(g.enhStone)<cost)return toast('🔩 強化石不足（需 '+cost+'）','bad');

if(mode===1&&Number(g.protect)<1)return toast('🛡️ 保護卷軸不足','bad');

if(mode===2&&Number(g.shield)<1)return toast('🧿 防爆盾不足','bad');

g.enhStone=Number(g.enhStone)-cost;if(mode===1)g.protect--;if(mode===2)g.shield--;

g.stats.enhance=(g.stats.enhance||0)+1;updMission(g,'enhance',1);

let rate=CFG.ENH.rate[lv]+(effOf(g).enhance_bonus||0);

if(Math.random()<rate){w.lv=lv+1;toast('✅ 強化成功！+'+w.lv+'（⚡+'+(w.lv*8)+'）');_enhResult='ok'}

else{const pen=CFG.ENH.pen(lv);

if(pen>0&&mode!==1){if(mode===2)toast('💥 強化失敗！防爆盾保住等級');else{w.lv=Math.max(0,lv-pen);toast('💥 強化失敗！-'+pen+' 級','bad')}_enhResult='no'}

else{toast('💥 強化失敗（無懲罰）','bad');_enhResult='no'}}

saveU(u);hud();vBag();if(_enhResult){setTimeout(()=>{const card=document.querySelector('.upType.enh');if(card){const p=card.closest('.panel2');if(p){p.classList.add(_enhResult==='ok'?'enhOk':'enhNo');setTimeout(()=>p.classList.remove('enhOk','enhNo'),700)}}},50);_enhResult=null}

}

/* ════════ 排行榜（#8 零分也顯示）════════ */

function lb(g,board){

const us=get(LS.users,[]).filter(x=>x.role==='student'&&x.g);

const arr=us.map(x=>{

const gg=x.g;

const v=board==='等級'?gg.lv:board==='連擊'?gg.stats.maxCombo:board==='收藏'?collCount(gg):board==='戰力'?power(gg):gg.stats.correct;

var _me=me();
return{n:x.name,v:Number(v)||0,me:_me&&x.id===_me.id,title:TITLES.find(t=>t.id===gg.equippedTitle)};

});

arr.sort((a,b)=>b.v-a.v);

return arr.map((e,i)=>({...e,rank:i+1}));

}

/* ════════════════════════════════════════════
   vRank 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRank
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vRank 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRank
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vRank 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRank
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vRank 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRank
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vRank 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRank
   ════════════════════════════════════════════ */
async function vRank(){
  if(!await needJs(['js/views/vRank.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vRank();
}






const RANK_RW={1:{diamond:20,gold:1000,crystal:300,starlight:10,honor:10},2:{diamond:12,gold:600,crystal:180,starlight:6,honor:6},3:{diamond:8,gold:400,crystal:120,starlight:4,honor:4}}; /* 加碼版排名獎勵 */

function claimRankRw(){ /* 5 個榜單分開計算，各自每日領 1 次 */

const u=me(),g=u.g,d=today();

if(!g.rankClaim||g.rankClaim.date!==d)g.rankClaim={date:d,boards:[]};

const got=[];

for(const b of ['答題','等級','連擊','收藏','戰力']){

if(g.rankClaim.boards.includes(b))continue;

const e=lb(g,b).find(x=>x.me);const r=e?e.rank:99;

if(r<=3){grantRw(g,RANK_RW[r]);g.rankClaim.boards.push(b);got.push(b+'第'+r+'名')}

}

if(!got.length)return toast('⚠️ 沒有可領的排名獎勵','bad');

saveU(u);hud();toast('🎁 已領取：'+got.join('、'));vRank();

}

function lbGo(b,el){

if(el){document.querySelectorAll('#view .btn.mini').forEach(x=>{x.className='btn ghost mini'});el.className='btn mini'}

const g=me().g,med=['🥇','🥈','🥉'];

$('#lbBox').innerHTML=lb(g,b).map(e=>'<div class="panel2 rankIt'+(e.rank===1?' top0':'')+'" '+(e.me?'style="border-color:var(--gold)"':'')+'>'+

'<span class="rMed">'+(med[e.rank-1]||'🎖')+'</span><b class="rName" '+(e.me?'style="color:var(--gold2)"':'')+'>'+esc(e.n)+(e.title?' <span style="font-size:11px;color:#c9a6ff">['+e.title.n+']</span>':'')+'</b><b style="color:var(--teal)">'+e.v+'</b></div>').join('')||'<p class="empty">尚無玩家</p>';

}
