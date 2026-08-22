/* ════ 🎀 娃娃管理後台 ════ */


/* ════════════════════════════════════════════
   vDollAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 5 個單位：_dAdminCat, vDollAdmin, DOLL_IMPRINTS, _dGenId, _dImprint
   ════════════════════════════════════════════ */
let _dAdminCat='角色',_dAdminEditId=null,_dAdminEditIdx=-1;

/* ════════════════════════════════════════════
   vDollAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vDollAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vDollAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vDollAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vDollAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vDollAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vDollAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vDollAdmin
   ════════════════════════════════════════════ */
async function vDollAdmin(){
  if(!await needJs(['js/views/vDollAdmin.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vDollAdmin();
}





const DOLL_IMPRINTS=['自由之息','烈焰痕跡','靜水流深','大地的懷抱','風之足跡','火之光環','水之淚滴','土之印章','雲中漫步','燼中重生','潮汐記憶','山巒低語','飛翔夢境','永恆火焰','深海之心','磐石之誓'];

function _dGenId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}

function _dImprint(){return DOLL_IMPRINTS[Math.floor(Math.random()*DOLL_IMPRINTS.length)]}


function renderDollAdmin(cat){
  if(cat)_dAdminCat=cat;
  const u=me();
  const src=POOLS[_dAdminCat]||POOLS.character;
  const d=_dGet();const shop=d.shop||[];const evt=get(LS.events,[]);
  const users=get(LS.users,[]);
  const allOwned=[];
  users.forEach(us=>{
    const ud=_dGetForUser(us.id);
    (ud.owned||[]).forEach(item=>{if(item.poolName&&src[item.poolName])allOwned.push({...item,owner:us.id,ownerName:us.name})});
  });
  const ownedByCat=allOwned.filter(x=>src[x.poolName]);
  const catNames={character:'角色',pet:'寵物',anime:'動漫',teammate:'隊友'};
  const catIcons={character:'🎴',pet:'🐾',anime:'🎬',teammate:'🤝'};
  const catKeys=['character','pet','teammate','anime'];
  const catBtns=catKeys.map((key,i)=>{
    const label=catNames[key];const icon=catIcons[key];
    const c2=POOLS[key]?Object.keys(POOLS[key]).length:0;
    return '<button class="catTab '+(key===_dAdminCat?'on':'')+'" onclick="renderDollAdmin(\''+key+'\')">'+icon+' '+label+' <span style="font-size:10px;color:var(--mut)">'+c2+'</span></button>';
  }).join('');
  const rarityOrder=['N','R','SR','SSR','UR'];
  const itemsHtml=Object.keys(src).sort((a,b)=>rarityOrder.indexOf(src[b].r)-rarityOrder.indexOf(src[a].r)).map(name=>{
    const item=src[name];
    const ownedCount=allOwned.filter(x=>x.poolName===name).length;
    const totalUsers=users.filter(x=>x.role==='student').length;
    const pct=totalUsers?Math.round(ownedCount/totalUsers*100):0;
    return '<div class="dollAdminCard">'+
      '<div class="dIcon">'+esc(item.icon)+'</div>'+
      '<div class="dInfo">'+
        '<div class="dName">'+esc(name)+' <span class="rarityTag rarity-'+item.r+'">'+item.r+'</span></div>'+
        '<div class="dMeta">擁有 '+ownedCount+'/'+totalUsers+' 人（'+pct+'%）</div>'+
      '</div>'+
      '<div class="dActs">'+
        '<button class="btn mini teal" onclick="addSingleDollAdmin(\''+name+'\')">🎁 送給全體</button>'+
      '</div>'+
    '</div>';
  }).join('');
  // Shop cards (reuse from before)
  const shopCards=shop.map((s,i)=>{
    const el=DOLL_ELT[s.element]||DOLL_ELT['風'];
    return '<div class="shopAdminCard" id="shopCard'+i+'">'+
      '<div class="sHead">'+
        '<div class="sIcon">'+esc(s.emoji||el.icon||'\🌟')+'</div>'+
        '<div style="flex:1"><b style="color:var(--gold2)">'+esc(s.name)+'</b>'+
          '<span class="rarityTag rarity-'+s.rarity+'" style="margin-left:8px">'+s.rarity+'</span>'+
          ' '+esc(s.element)+' \· '+el.trait+
        '</div>'+
        '<div style="color:var(--gold);font-weight:900;font-size:16px">\🪙'+s.price+'</div>'+
        '<div style="display:flex;gap:6px">'+
          '<button class="btn ghost mini" onclick="editShopItem('+i+')">\u270F\uFE0F</button>'+
          '<button class="btn danger mini" onclick="delShopItem('+i+')">🗑</button>'+
        '</div>'+
      '</div>'+
      '<div class="sBody" id="shopBody'+i+'" style="'+(s._edit?'':'display:none')+'">'+
        '<div><label>Emoji</label><input id="sEmoji'+i+'" value="'+esc(s.emoji||el.icon)+'"></div>'+
        '<div><label>名稱</label><input id="sName'+i+'" value="'+esc(s.name)+'"></div>'+
        '<div><label>屬性</label><select id="sElt'+i+'">'+DOLL_ELEMENTS.map(e=>'<option'+(s.element===e?' selected':'')+'>'+e+'</option>').join('')+'</select></div>'+
        '<div><label>稀有度</label><select id="sRare'+i+'">'+DOLL_RARITY.map(r=>'<option'+(s.rarity===r?' selected':'')+'>'+r+'</option>').join('')+'</select></div>'+
        '<div><label>價格 \🪙</label><input id="sPrice'+i+'" type="number" value="'+(s.price||0)+'" min="0"></div>'+
        '<div><label>描述</label><input id="sDesc'+i+'" value="'+esc(s.desc||'')+'"></div>'+
        '<div style="grid-column:span 2;display:flex;gap:6px;margin-top:4px">'+
          '<button class="btn mini" onclick="saveShopItem('+i+')">💾 儲存</button>'+
          '<button class="btn ghost mini" onclick="closeShopEdit('+i+')">取消</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  }).join('');
  // Event cards
  const evtHtml=evt.length?evt.map((e,i)=>{
    const ac=e.active?'<span style="color:var(--green)">🟢 開啟中</span>':'<span style="color:var(--mut)">⚪ 關閉中</span>';
    return '<div class="eventCard '+(e.active?'active':'')+'">'+
      '<div class="eHead">'+
        '<b class="eName">\u26A1 '+(e.name||'未命名活動')+'</b>'+ac+
        '<div style="margin-left:auto;display:flex;gap:6px">'+
          '<button class="btn mini '+(e.active?'':'teal')+'" onclick="toggleEvent('+i+')">'+(e.active?'\u23F8 暫停':'\u25B6 開啟')+'</button>'+
          '<button class="btn ghost mini" onclick="editEvent('+i+')">\u270F\uFE0F</button>'+
          '<button class="btn danger mini" onclick="delEvent('+i+')">🗑</button>'+
        '</div>'+
      '</div>'+
      '<div class="eBody">'+
        '<div><label>經驗倍率</label><input id="evXp'+i+'" type="number" value="'+(e.xpMult||1)+'" step="0.5" min="1"></div>'+
        '<div><label>掉落倍率</label><input id="evDrop'+i+'" type="number" value="'+(e.dropMult||1)+'" step="0.5" min="1"></div>'+
        '<div><label>金幣倍率</label><input id="evGold'+i+'" type="number" value="'+(e.goldMult||1)+'" step="0.5" min="1"></div>'+
        '<div><label>水晶倍率</label><input id="evCry'+i+'" type="number" value="'+(e.cryMult||1)+'" step="0.5" min="1"></div>'+
        '<div><label>結束時間</label><input id="evEnd'+i+'" type="datetime-local" value="'+(e.endTime?new Date(e.endTime).toISOString().slice(0,16):'')+'"></div>'+
        '<div style="grid-column:span 5"><label>說明</label><input id="evNote'+i+'" value="'+esc(e.note||'')+'"></div>'+
        '<div style="grid-column:span 5;display:flex;gap:6px;margin-top:4px">'+
          '<button class="btn mini" onclick="saveEvent('+i+')">💾 儲存</button>'+
          '<button class="btn teal mini" onclick="addEvent()">\u2795 新增活動</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  }).join(''):'<div class="eventCard"><div style="text-align:center;padding:20px;color:var(--mut)"><b>尚無限時活動</b><br><button class="btn teal mini" style="margin-top:10px" onclick="addEvent()">\u2795 新增限時活動</button></div></div>';
  const subTitle={collect:'收藏管理',shop:'商店管理',event:'限時活動'}[_dAdminSub]||'收藏管理';
  $('#view').innerHTML=
    '<h3 class="vt">🎀 娃娃管理 <span class="vsub">'+subTitle+'</span></h3>'+
    '<div class="catTabs">'+
      '<button class="catTab '+(_dAdminSub==='collect'?'on':'')+'" onclick="setDollSub(\'collect\')">🎴 收藏管理</button>'+
      '<button class="catTab '+(_dAdminSub==='shop'?'on':'')+'" onclick="setDollSub(\'shop\')">🏪 商店管理</button>'+
      '<button class="catTab '+(_dAdminSub==='event'?'on':'')+'" onclick="setDollSub(\'event\')">\u26A1 限時活動</button>'+
    '</div>'+
    (_dAdminSub==='collect'?
      '<div style="margin-bottom:12px"><button class="btn teal mini" onclick="addDollAdmin()">? ????</button></div>'+
      '<div style="margin-bottom:12px;font-size:12.5px;color:var(--mut)">?? '+catNames[_dAdminCat]+'??? '+Object.keys(src).length+' ???</div>'+
      '<div class="catTabs">'+catBtns+'</div>'+
      (itemsHtml||'<p class="empty">?????</p>')
    :_dAdminSub==='shop'?
      '<div style="margin-bottom:12px"><button class="btn teal mini" onclick="showShopAdd()">\u2795 新增商店商品</button></div>'+
      (shopCards||'<p class="empty">商店尚無商品</p>')
    :evtHtml);
}
let _dAdminSub='collect';
function setDollSub(s){_dAdminSub=s;renderDollAdmin(_dAdminCat)}

let _dAdminEditItem=null;
function editDollAdmin(id){
  const users=get(LS.users,[]);
  let target=null;
  users.forEach(us=>{
    const ud=_dGetForUser(us.id);
    const found=(ud.owned||[]).find(x=>x.id===id);
    if(found){target=found;target._owner=us.id;target._ownerName=us.name}
  });
  if(!target)return toast('找不到該娃娃','bad');
  _dAdminEditItem=target;_dAdminEditId=id;
  renderDollAdmin(_dAdminCat);
  setTimeout(()=>{
    const m=$('#dollEditModal');
    if(m)m.style.display='flex';
  },50);
}
function closeEditDoll(){_dAdminEditItem=null;_dAdminEditId=null;renderDollAdmin(_dAdminCat)}
function saveEditDoll(){
  if(!_dAdminEditItem)return;
  const name=$('#edName').value.trim();
  if(!name)return toast('請輸入名稱','bad');
  const id=_dAdminEditId;
  const users=get(LS.users,[]);
  users.forEach(us=>{
    const key=_dAdminEditItem._owner||us.id;
    const ud=_dGetForUser(key);
    const doll=(ud.owned||[]).find(x=>x.id===id);
    if(doll){
      doll.name=name;
      doll.emoji=$('#edEmoji').value.trim()||doll.emoji;
      doll.element=$('#edElt').value;
      doll.rarity=$('#edRare').value;
      doll.bond=parseInt($('#edBond').value)||0;
      doll.mood=parseInt($('#edMood').value)||50;
      doll.trust=parseInt($('#edTrust').value)||0;
      doll.imprint=$('#edImprint').value.trim()||doll.imprint;
      _dSetForUser(key,ud);
    }
  });
  _dAdminEditItem=null;_dAdminEditId=null;
  toast('✅ 娃娃已更新');renderDollAdmin(_dAdminCat);
}
function delDollAdmin(id){
  if(!confirm('確定刪除此娃娃？所有互動紀錄將消失。'))return;
  const users=get(LS.users,[]);
  let removed=0;
  users.forEach(us=>{
    const key=us.id;
    const ud=_dGetForUser(key);
    const before=(ud.owned||[]).length;
    ud.owned=(ud.owned||[]).filter(x=>x.id!==id);
    if((ud.owned||[]).length<before)removed++;
    _dSetForUser(key,ud);
  });
  toast('🗑 已刪除（'+removed+' 個用戶）');renderDollAdmin(_dAdminCat);
}
function toggleFavDoll(id){
  const users=get(LS.users,[]);
  users.forEach(us=>{
    const ud=_dGetForUser(us.id);
    (ud.owned||[]).forEach(x=>{
      if(x.id===id)x.fav=!x.fav;
    });
    _dSetForUser(us.id,ud);
  });
  toast((users[0]&&users[0].g&&users[0].g.doll)?'⭐ 已收藏':'☆ 已取消收藏');renderDollAdmin(_dAdminCat);
}
function addDollAdmin(){
  const cats=['character','pet','anime','teammate'];
  const catNames={character:'角色',pet:'寵物',anime:'動漫',teammate:'隊友'};
  const rarities=['N','R','SR','SSR','UR'];
  const src=POOLS[_dAdminCat]||POOLS.character;
  const items=Object.keys(src).map(n=>({n,r:src[n].r,icon:src[n].icon})).sort((a,b)=>rarities.indexOf(a.r)-rarities.indexOf(b.r));
  openModal('<h3 class="mt">➕ 新增收藏（'+catNames[_dAdminCat]+'）</h3>'+
    '<div class="createForm">'+
      '<div class="fg"><label>選擇稀有度篩選</label><select id="ndRare" onchange="filterDollAdmin()">'+
        '<option value="all">全部</option>'+rarities.map(r=>'<option value="'+r+'">'+r+'</option>').join('')+
      '</select></div>'+
      '<div id="ndItems" style="max-height:200px;overflow-y:auto;margin-top:8px">'+
        items.map(it=>'<div style="padding:6px;border-bottom:1px solid var(--line);cursor:pointer;display:flex;align-items:center;gap:8px" onclick="selectDollItem(\''+it.n+'\',this)" data-r="'+it.r+'">'+
          '<span style="font-size:20px">'+it.icon+'</span>'+
          '<span style="flex:1">'+it.n+'</span>'+
          '<span class="rarityTag rarity-'+it.r+'">'+it.r+'</span>'+
        '</div>').join('')+
      '</div>'+
      '<input type="hidden" id="ndItemName" value="">'+
    '</div>'+
    '<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button><button class="btn" onclick="doAddDollAdmin()">✅ 新增到所有學生</button></div>');
}
function filterDollAdmin(){
  const r=$('#ndRare').value;
  document.querySelectorAll('#ndItems > div').forEach(d=>{d.style.display=(r==='all'||d.dataset.r===r)?'':'none'});
}
function selectDollItem(name,el){
  document.querySelectorAll('#ndItems > div').forEach(d=>d.style.background='');
  el.style.background='rgba(242,193,78,.15)';
  $('#ndItemName').value=name;
}
function doAddDollAdmin(){
  const name=$('#ndItemName').value.trim();
  if(!name)return toast('⚠️ 請選擇一個角色/寵物/動漫/隊友','bad');
  const src=POOLS[_dAdminCat]||POOLS.character;
  const item=src[name];if(!item)return toast('找不到該項目','bad');
  const icon=item.icon||'\🌟';
  const rarity=item.r||'R';
  const users=get(LS.users,[]).filter(x=>x.role==='student');
  users.forEach(us=>{
    const ud=_dGetForUser(us.id);
    const owned=ud.owned||[];
    if(!owned.find(x=>x.poolName===name))
      owned.push({id:_dGenId(),poolName:name,icon:icon,rarity:rarity,emoji:icon,name:name+' ('+rarity+')',bond:0,mood:50,trust:0,elementBoost:0,imprint:_dImprint(),owner:us.id,createdAt:new Date().toISOString(),interactCount:0,history:[]});
    ud.owned=owned;_dSetForUser(us.id,ud);
  });
  closeModal();toast('✅ 已新增「'+name+'」到 '+users.length+' 名學生的收藏');renderDollAdmin(_dAdminCat);
}
function addSingleDollAdmin(name){
  const src=POOLS[_dAdminCat]||POOLS.character;
  const item=src[name];if(!item)return toast('找不到該項目','bad');
  const users=get(LS.users,[]).filter(x=>x.role==='student');
  let added=0;
  users.forEach(us=>{
    const ud=_dGetForUser(us.id);
    const owned=ud.owned||[];
    if(!owned.find(x=>x.poolName===name)){
      owned.push({id:_dGenId(),poolName:name,icon:item.icon,rarity:item.r,emoji:item.icon,name:item.icon+' '+name,bond:0,mood:50,trust:0,elementBoost:0,imprint:_dImprint(),owner:us.id,createdAt:new Date().toISOString(),interactCount:0,history:[]});
      added++;
    }
    ud.owned=owned;_dSetForUser(us.id,ud);
  });
  toast('🎁 已新增「'+name+'」到 '+added+' 名學生');renderDollAdmin(_dAdminCat);
}

/* 商店管理 */
function showShopAdd(){
  openModal('<h3 class="mt">➕ 新增商店商品</h3>'+
    '<div class="createForm">'+
      '<div class="fg"><label>名稱</label><input id="nsName" placeholder="商品名稱"></div>'+
      '<div class="fg"><label>Emoji</label><input id="nsEmoji" value="🌟" maxlength="4"></div>'+
      '<div class="fg"><label>屬性</label><select id="nsElt">'+DOLL_ELEMENTS.map(e=>'<option>'+e+'</option>').join('')+'</select></div>'+
      '<div class="fg"><label>稀有度</label><select id="nsRare">'+DOLL_RARITY.map(r=>'<option>'+r+'</option>').join('')+'</select></div>'+
      '<div class="fg"><label>價格 🪙</label><input id="nsPrice" type="number" value="100" min="0"></div>'+
      '<div class="fg"><label>描述</label><input id="nsDesc" placeholder="商品描述"></div>'+
    '</div>'+
    '<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button><button class="btn" onclick="doAddShop()">✅ 上架</button></div>');
}
function doAddShop(){
  const name=$('#nsName').value.trim();
  if(!name)return toast('請輸入名稱','bad');
  const d=_dGet();
  d.shop=d.shop||[];
  const el=DOLL_ELT[$('#nsElt').value]||DOLL_ELT['風'];
  d.shop.push({
    id:'s'+Date.now(),
    name,emoji:$('#nsEmoji').value.trim()||el.icon,
    element:$('#nsElt').value,rarity:$('#nsRare').value,
    price:parseInt($('#nsPrice').value)||100,
    desc:$('#nsDesc').value.trim()
  });
  _dSet(d);toast('✅ 已上架：'+name);renderDollAdmin('shop');
}
function editShopItem(i){
  const d=_dGet();const s=d.shop&&d.shop[i];if(!s)return;
  s._edit=true;_dSet(d);renderDollAdmin('shop');
}
function closeShopEdit(i){
  const d=_dGet();if(d.shop&&d.shop[i])delete d.shop[i]._edit;_dSet(d);renderDollAdmin('shop');
}
function saveShopItem(i){
  const d=_dGet();const s=d.shop&&d.shop[i];if(!s)return;
  s.emoji=$('#sEmoji'+i).value||s.emoji;
  s.name=$('#sName'+i).value.trim()||s.name;
  s.element=$('#sElt'+i).value||s.element;
  s.rarity=$('#sRare'+i).value||s.rarity;
  s.price=parseInt($('#sPrice'+i).value)||s.price;
  s.desc=$('#sDesc'+i).value.trim()||s.desc;
  delete s._edit;_dSet(d);toast('✅ 商品已更新');renderDollAdmin('shop');
}
function delShopItem(i){
  if(!confirm('刪除此商品？'))return;
  const d=_dGet();d.shop.splice(i,1);_dSet(d);toast('🗑 已刪除');renderDollAdmin('shop');
}
function seedDollShop(){
  const d=_dGet();
  if(d.shop&&d.shop.length){return toast('商店已有商品，不會重複加入','bad')}
  d.shop=[
    {id:'s001',name:'星塵少女',emoji:'🌸',element:'風',rarity:'SR',price:200,desc:'輕盈如風的少女，擁有自由之息'},
    {id:'s002',name:'烈�����靈',emoji:'🔥',element:'火',rarity:'SSR',price:500,desc:'���情如火���精靈，燃燒一切阻礙'},
    {id:'s003',name:'靜水之靈',emoji:'💧',element:'水',rarity:'SR',price:250,desc:'溫柔������的靈體，靜水流深'},
    {id:'s004',name:'磐石守卫',emoji:'🪨',element:'土',rarity:'R',price:100,desc:'穩重可靠的守卫，堅如磐石'},
    {id:'s005',name:'月華仙子',emoji:'🌙',element:'風',rarity:'UR',price:1000,desc:'月光下的仙子，擁有傳說力量'},
  ];
  _dSet(d);toast('✅ 已初始化 5 個商店商品');renderDollAdmin('shop');
}

/* 限時活動管理 */
function addEvent(){
  openModal('<h3 class="mt">➕ 新增限時活動</h3>'+
    '<div class="createForm">'+
      '<div class="fg"><label>活動名稱</label><input id="neName" placeholder="例：經驗 x2 活動"></div>'+
      '<div class="fg"><label>說明</label><input id="neNote" placeholder="活動說明"></div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+
        '<div class="fg"><label>經驗倍率</label><input id="neXp" type="number" value="2" min="1" step="0.5"></div>'+
        '<div class="fg"><label>掉落倍率</label><input id="neDrop" type="number" value="2" min="1" step="0.5"></div>'+
        '<div class="fg"><label>金幣倍率</label><input id="neGold" type="number" value="2" min="1" step="0.5"></div>'+
        '<div class="fg"><label>水晶倍率</label><input id="neCry" type="number" value="2" min="1" step="0.5"></div>'+
      '</div>'+
      '<div class="fg"><label>結束時間</label><input id="neEnd" type="datetime-local"></div>'+
    '</div>'+
    '<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button><button class="btn" onclick="doAddEvent()">✅ 新增</button></div>');
}
function doAddEvent(){
  const name=$('#neName').value.trim();
  if(!name)return toast('請輸入活動名稱','bad');
  const evt=get(LS.events,[]);
  // Deactivate existing
  evt.forEach(e=>e.active=false);
  evt.push({
    id:'ev'+Date.now(),name,
    active:true,
    xpMult:parseFloat($('#neXp').value)||2,
    dropMult:parseFloat($('#neDrop').value)||2,
    goldMult:parseFloat($('#neGold').value)||2,
    cryMult:parseFloat($('#neCry').value)||2,
    endTime:$('#neEnd').value?new Date($('#neEnd').value).toISOString():'',
    note:$('#neNote').value.trim(),
    createdAt:new Date().toISOString()
  });
  set(LS.events,evt);toast('✅ 活動已新增');renderDollAdmin('event');
}
function toggleEvent(i){
  const evt=get(LS.events,[]);
  evt[i].active=!evt[i].active;
  set(LS.events,evt);toast(evt[i].active?'⚡ 活動已開啟':'⏸ 活動已暫停');renderDollAdmin('event');
}
function editEvent(i){
  const evt=get(LS.events,[]);const e=evt[i];if(!e)return;
  openModal('<h3 class="mt">✏️ 編輯活動</h3>'+
    '<div class="createForm">'+
      '<div class="fg"><label>活動名稱</label><input id="eeName" value="'+esc(e.name)+'"></div>'+
      '<div class="fg"><label>說明</label><input id="eeNote" value="'+esc(e.note||'')+'"></div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+
        '<div class="fg"><label>經驗倍率</label><input id="eeXp" type="number" value="'+e.xpMult+'" min="1" step="0.5"></div>'+
        '<div class="fg"><label>掉落倍率</label><input id="eeDrop" type="number" value="'+e.dropMult+'" min="1" step="0.5"></div>'+
        '<div class="fg"><label>金幣倍率</label><input id="eeGold" type="number" value="'+e.goldMult+'" min="1" step="0.5"></div>'+
        '<div class="fg"><label>水晶倍率</label><input id="eeCry" type="number" value="'+e.cryMult+'" min="1" step="0.5"></div>'+
      '</div>'+
      '<div class="fg"><label>結束時間</label><input id="eeEnd" type="datetime-local" value="'+(e.endTime?new Date(e.endTime).toISOString().slice(0,16):'')+'"></div>'+
    '</div>'+
    '<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button><button class="btn" onclick="doSaveEvent('+i+')">💾 儲存</button></div>');
}
function doSaveEvent(i){
  const evt=get(LS.events,[]);const e=evt[i];if(!e)return;
  e.name=$('#eeName').value.trim()||e.name;
  e.note=$('#eeNote').value.trim();
  e.xpMult=parseFloat($('#eeXp').value)||1;
  e.dropMult=parseFloat($('#eeDrop').value)||1;
  e.goldMult=parseFloat($('#eeGold').value)||1;
  e.cryMult=parseFloat($('#eeCry').value)||1;
  e.endTime=$('#eeEnd').value?new Date($('#eeEnd').value).toISOString():'';
  set(LS.events,evt);toast('✅ 活動已更新');renderDollAdmin('event');
}
function delEvent(i){
  if(!confirm('刪除此活動？'))return;
  const evt=get(LS.events,[]);evt.splice(i,1);set(LS.events,evt);toast('🗑 已刪除');renderDollAdmin('event');
}

/* 用戶級娃娃工具 */
function _dGetForUser(uid){
  const all=get(LS.dolls,{});
  return all[uid]||{owned:[]};
}
function _dSetForUser(uid,d){
  const all=get(LS.dolls,{});
  all[uid]=d;set(LS.dolls,all);
}
/* 遷移：若 LS.dolls 是老格式（{owned:[],shop:[]}）→ 搬到新格式 */
(function migrateDolls(){
  const raw=localStorage.getItem(LS.dolls);
  if(!raw)return;
  try{
    const obj=JSON.parse(raw);
    if(Array.isArray(obj)){
      // 老格式：直接是 owned 陣列，拆給當前登入者
      const u=me();
      if(u){
        const perUser={owned:obj,shop:[]};
        _dSetForUser(u.id,perUser);
      }
      localStorage.removeItem(LS.dolls);
      toast('🔄 娃娃資料已遷移至新格式');
    }
  }catch(e){}
})();
