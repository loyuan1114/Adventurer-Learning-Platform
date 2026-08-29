/* ════ 🛡️ 公會管理：查看、調等級、解散 ════ */

/* ════════════════════════════════════════════
   vGuildsAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGuildsAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGuildsAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGuildsAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGuildsAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGuildsAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGuildsAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGuildsAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGuildsAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGuildsAdmin
   ════════════════════════════════════════════ */
async function vGuildsAdmin(){
  if(!await needJs(['js/views/vGuildsAdmin.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vGuildsAdmin();
}






function adminSetGuildLv(id){

const lv=Math.max(1,parseInt(($('#gdlv_'+id)||{}).value)||1);

const guilds=get(LS.guilds,[]);const gd=guilds.find(x=>x.id===id);if(!gd)return;

gd.level=lv;set(LS.guilds,guilds);toast('🛡️ 公會「'+gd.name+'」等級已設為 Lv.'+lv);vGuildsAdmin();

}

function adminDisbandGuild(id){

const guilds=get(LS.guilds,[]);const gd=guilds.find(x=>x.id===id);if(!gd)return;

if(!confirm('確定解散公會「'+gd.name+'」？所有會員將退出。'))return;

const us=get(LS.users,[]);gd.members.forEach(uid=>{const mu=us.find(x=>x.id===uid);if(mu&&mu.g)mu.g.guildId=null});set(LS.users,us);

set(LS.guilds,guilds.filter(x=>x.id!==id));toast('💥 已解散公會「'+gd.name+'」');vGuildsAdmin();

}

/* ════ 📸 動態管理：查看全部限時動態、刪除違規內容 ════ */

/* ════════════════════════════════════════════
   vContentAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vContentAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vContentAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vContentAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vContentAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vContentAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vContentAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vContentAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vContentAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vContentAdmin
   ════════════════════════════════════════════ */
async function vContentAdmin(){
  if(!await needJs(['js/views/vContentAdmin.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vContentAdmin();
}






function adminDelStory(id){

const s=get(LS.stories,[]).find(x=>x.id===id);if(s){cloudDelete(s.img);cloudDelete(s.vid)}

set(LS.stories,get(LS.stories,[]).filter(x=>x.id!==id));toast('🗑 已刪除該動態');vContentAdmin();

}

function adminClearStories(){

if(!confirm('確定清空所有限時動態？'))return;

get(LS.stories,[]).forEach(s=>{cloudDelete(s.img);cloudDelete(s.vid)});

set(LS.stories,[]);toast('🧹 已清空所有動態');vContentAdmin();

}

/* ════ 📚 課本網址管理：新增/刪除課本講解與課外考卷的連結 ════ */

/* ════════════════════════════════════════════
   vBooksAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBooksAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vBooksAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBooksAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vBooksAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBooksAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vBooksAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBooksAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vBooksAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBooksAdmin
   ════════════════════════════════════════════ */
async function vBooksAdmin(){
  if(!await needJs(['js/views/vBooksAdmin.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vBooksAdmin();
}






function adminAddBook(){

const pub=$('#bkPub').value,type=$('#bkType').value,subj=$('#bkSubj').value,title=($('#bkTitle').value||'').trim(),url=($('#bkUrl').value||'').trim();

if(!title)return toast('⚠️ 請輸入標題','bad');

if(!/^https?:\/\//.test(url))return toast('⚠️ 網址需以 http:// 或 https:// 開頭','bad');

const books=get(LS.books,[]);

books.push({id:'bk'+Date.now()+Math.floor(Math.random()*1e4),publisher:pub,type,subject:subj,title,url,t:Date.now()});

set(LS.books,books);toast('📚 已新增：'+pub+'・'+type+'・'+title);vBooksAdmin();

}

function adminDelBook(id){

if(!confirm('刪除這筆連結？'))return;

set(LS.books,get(LS.books,[]).filter(x=>x.id!==id));toast('🗑 已刪除');vBooksAdmin();

}

/* ════════════════════════════════════════════
   vGameSet 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：MISSION_POOL, vGameSet
   ════════════════════════════════════════════ */
const MISSION_POOL=[

{id:'m1',n:'✅ 答對 10 題',k:'answer',g:10,rw:{crystal:15,gold:30}},

{id:'m2',n:'🏟️ 完成 2 場 PK',k:'pk',g:2,rw:{crystal:20,gold:50}},

{id:'m3',n:'🔥 達成 8 連擊',k:'combo',g:8,rw:{crystal:25,starlight:2}},

{id:'m4',n:'💪 完成 5 題困難50+',k:'hard',g:5,rw:{crystal:30,gold:60}},

{id:'m5',n:'📈 獲得 100 經驗',k:'exp',g:100,rw:{gold:50,starlight:1}},

{id:'m6',n:'🎁 進行 1 次抽卡',k:'gacha',g:1,rw:{enhStone:1,gold:20}},

{id:'m7',n:'🔨 強化武器 1 次',k:'enhance',g:1,rw:{crystal:15,gold:30}},

{id:'m8',n:'❌ 重練 2 題錯題',k:'retry',g:2,rw:{crystal:20,starlight:3}},

{id:'m9',n:'🗺️ 征服 1 塊領土',k:'territory',g:1,rw:{diamond:2,gold:50}},

{id:'m10',n:'⚒️ 累計鍛造 2 次',k:'forge',g:2,rw:{ironOre:5,crystal:20}},

{id:'m11',n:'🧪 挑戰實驗室 1 次',k:'lab',g:1,rw:{labMat:10,gold:40}},

{id:'m12',n:'🤝 贈送好友精力 1 次',k:'giftEnergy',g:1,rw:{crystal:15,gold:30}},

{id:'m13',n:'📥 領取好友精力 1 次',k:'recvEnergy',g:1,rw:{gold:50}},

{id:'m14',n:'📖 答題累計 20 題',k:'answerTotal',g:20,rw:{quizPts:20,gold:40}},

{id:'m15',n:'🏅 PK 獲勝 1 場',k:'pkWin',g:1,rw:{honor:10,crystal:15}}

];

/* ════════════════════════════════════════════
   vGameSet 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGameSet
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGameSet 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGameSet
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGameSet 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGameSet
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGameSet 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGameSet
   ════════════════════════════════════════════ */
async function vGameSet(){
  if(!await needJs(['js/views/vGameSet.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vGameSet();
}






function saveGameSet(){

const pk=Math.max(1,parseInt($('#gsPk').value)||5);

const dm=Math.max(1,Math.min(MISSION_POOL.length,parseInt($('#gsDm').value)||15));

const wk=Math.max(1,parseInt($('#gsWk').value)||200);

const tl=$('#gsTl').checked;

const dmEl=document.querySelector('input[name=gsDmode]:checked');const dm2=dmEl?dmEl.value:'精準';

setSysCfg({pkDaily:pk,dailyMissions:dm,weeklyGoal:wk,timeLock:tl,diffMode:dm2});

toast('💾 遊戲設定已儲存：PK '+pk+' 場／日任務 '+dm+'／週目標 '+wk+'／時間鎖'+(tl?'開':'關')+'／難度 '+dm2);vGameSet();

}

function adminResetAllG(){

if(!confirm('⚠️ 確定重置【全部學生】的遊戲數據？等級/貨幣/收藏/裝備將歸零，無法復原！'))return;

if(!confirm('🔁 再次確認：真的要重置所有學生的遊戲進度？'))return;

const us=get(LS.users,[]);let n=0;

us.forEach(x=>{if(x.role==='student'&&x.g){x.g=newGame();n++}});

set(LS.users,us);toast('🔄 已重置 '+n+' 名學生的遊戲數據');

}

/* 用戶管理：改用本機資料（透過 set() 自動同步雲端）；含搜尋與單獨重設密碼 */
/* ════════════════════════════════════════════
   vUsers 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vUsers
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vUsers 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vUsers
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vUsers 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vUsers
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vUsers 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vUsers
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vUsers 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vUsers
   ════════════════════════════════════════════ */
async function vUsers(){
  if(!await needJs(['js/views/vUsers.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vUsers();
}





function nuRoleChange(sel){const w=$('#nuClsWrap');if(w)w.style.display=sel.value==='student'?'':'none';const w2=$('#nuClsWrap2');if(w2)w2.style.display=sel.value==='student'?'':'none'}
/* 帳號主檔（伺服器 users_index.json）：列出所有帳號（有誰誰誰），並顯示主檔與本機差異 */
async function showUsersIndex(){
  toast('📡 讀取伺服器帳號主檔…');
  let idx=null,err='';
  if(SUPA_ON&&WTOKEN){
    try{
      const r=await fetch(SUPA_URL+'/rest/v1/admin/users_index',{headers:supaHeaders()});
      const j=await r.json().catch(()=>null);
      if(r.ok&&j&&j.ok)idx=j.index||[];
      else err='HTTP '+r.status+(j&&j.message?' '+j.message:'');
    }catch(e){err=e.message}
  }
  const local=get(LS.users,[]);
  const roleIcon=x=>x.role==='admin'?'👑':x.role==='teacher'?'👩‍🏫':x.role==='parent'?'👨‍👩‍👧':'👤';
  const roleName=x=>x.role==='admin'?'管理員':x.role==='teacher'?'老師':x.role==='parent'?'家長':'學生';
  let html='<h3 class="mt">🗂️ 帳號主檔（伺服器 users_index.json）</h3><p class="msub">所有帳號的備援清單；任何帳號檔遺失/被刪時，伺服器會自動從此檔復原。</p>';
  if(idx===null){
    html+='<div class="panel2" style="color:var(--red)">⚠️ 無法讀取主檔'+(err?('：'+esc(err)):'')+'</div>';
  }else if(!idx.length){
    html+='<p class="empty">主檔目前為空</p>';
  }else{
    html+='<div class="panel2" style="max-height:340px;overflow-y:auto"><table><thead><tr><th>身份</th><th>姓名</th><th>帳號</th><th>角色</th><th>主檔</th><th>本機</th></tr></thead><tbody>'+
      idx.map(x=>{
        const localHas=local.some(u=>u.username===x.username);
        return '<tr><td>'+roleIcon(x)+'</td><td>'+esc(x.name)+'</td><td><code>'+esc(x.username)+'</code></td><td>'+roleName(x)+(x.master?'（主）':'')+'</td><td style="color:var(--green)">✔</td><td style="color:'+(localHas?'var(--green)':'var(--red)')+'">'+(localHas?'✔':'✘ 本機缺')+'</td></tr>';
      }).join('')+'</tbody></table></div>'+
      '<div style="font-size:11px;color:var(--mut);margin-top:6px">共 '+idx.length+' 個帳號（主檔）；主檔 ✔＝伺服器有紀錄，本機 ✔＝此瀏覽器清單也有</div>';
  }
  html+='<div class="mBtns"><button class="btn ghost" onclick="closeModal()">關閉</button></div>';
  openModal(html);
}
function jsA(s){return esc(String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'"))}
function uRenderRows(){
const q=(($('#uSearch')||{}).value||'').trim().toLowerCase();
const us=get(LS.users,[]);
const classes=get(LS.classes,{ids:[],names:{}});
const roleLabel=r=>r==='admin'?'👑 管理員':r==='teacher'?'👩‍🏫 老師':r==='parent'?'👨‍👩‍👧 家長':'👤 學生';
const list=us.filter(x=>{if(!q)return true;const cls=x.classId||x.class_id||'';const clsName=(classes.names&&classes.names[cls])||'';return [x.name,x.username,x.role,roleLabel(x.role),cls,clsName].join(' ').toLowerCase().indexOf(q)>-1});
let rows=list.map(x=>{const cls=x.classId||x.class_id||'';return '<tr><td>'+roleLabel(x.role)+'</td><td>'+esc(x.name)+'</td><td>'+esc(x.username)+'</td><td><code>••••••</code></td><td>'+(cls?esc((classes.names&&classes.names[cls])||cls):'—')+'</td><td>'+fmt(x.createdAt||x.created_at)+'</td>'+
'<td style="display:flex;gap:6px;flex-wrap:wrap">'+
(x.role!=='admin'?'<button class="btn mini" title="模擬登入" onclick="impersonate(\'' + jsA(x.username) + '\')">🎭</button>':'')+
(x.role==='parent'?'<button class="btn mini" title="連結管理" onclick="adminConsentManage(\'' + jsA(x.username) + '\')">🔗</button>':'')+
'<button class="btn ghost mini" title="重設密碼" onclick="adminResetPw(\'' + jsA(x.username) + '\')">🔑</button>'+
(x.role!=='admin'?'<button class="btn danger mini" title="刪除" onclick="delUser(\'' + jsA(x.username) + '\')">🗑</button>':'')+
'</td></tr>'}).join('');
if(!rows)rows='<tr><td colspan="7" style="text-align:center;color:var(--mut);padding:14px">找不到符合的用戶</td></tr>';
const tb=$('#uTbody');if(tb)tb.innerHTML=rows;
const ct=$('#uCount');if(ct)ct.textContent=q?(list.length+' / '+us.length):us.length;
}
function adminResetPw(username){
const us=get(LS.users,[]);const u=us.find(x=>x.username===username);
if(!u)return toast('⚠️ 找不到帳號','bad');
const np=prompt('為「'+u.name+'（'+username+'）」設定新密碼（至少 4 碼）：','');
if(np===null)return;
const p=(np||'').trim();
if(p.length<4)return toast('⚠️ 密碼至少 4 碼','bad');
u.password=p;set(LS.users,us);
 toast('🔑 已重設「'+u.name+'」的密碼為：'+p);
}
function adminConsentManage(username){
const consents=get('ADV9_PARENT_CONSENTS',{requests:[]});
const reqs=consents.requests.filter(r=>r.parent===username);
let h='<h3 class="mt">🔗 連結管理（家長：'+esc(username)+'）</h3>';
if(!reqs.length){
  h+='<p class="empty">此家長沒有任何連結要求</p>';
}else{
  h+='<div class="panel2" style="max-height:340px;overflow-y:auto">';
  reqs.forEach(function(r){
    const st=r.status==='pending'?'📨 待處理':r.status==='granted'?'✅ 已授權':r.status==='denied'?'❌ 已拒絕':r.status==='revoked_by_admin'?'🛡️ 管理員已撤銷':'🚫 已撤銷';
    h+='<div class="rwRow" style="justify-content:space-between;margin-bottom:6px">';
    h+='<span>👶 '+esc(r.child)+' <code style="font-size:11px">'+esc(r.id)+'</code></span>';
    h+='<div style="display:flex;gap:6px;align-items:center"><span style="font-size:12px;color:var(--mut)">'+st+'</span>';
    if(r.status==='pending'||r.status==='granted')h+='<button class="btn danger mini" title="強制撤銷" onclick="adminConsentRevoke(\''+jsA(r.id)+'\',\''+jsA(username)+'\')">🚫</button>';
    h+='<button class="btn ghost mini" title="強制解除連結（刪除紀錄）" onclick="adminConsentUnlink(\''+jsA(r.id)+'\',\''+jsA(username)+'\')">🗑</button>';
    h+='</div></div>';
  });
  h+='</div>';
}
h+='<div class="mBtns"><button class="btn ghost" onclick="closeModal()">關閉</button></div>';
openModal(h);
}
function adminConsentRevoke(id,parentUsername){
const consents=get('ADV9_PARENT_CONSENTS',{requests:[]});
const req=consents.requests.find(r=>r.id===id);
if(!req)return toast('找不到紀錄','bad');
req.status='revoked_by_admin';
req.revokedAt=new Date().toISOString();
set('ADV9_PARENT_CONSENTS',consents);
toast('🛡️ 已由管理員撤銷此連結');
adminConsentManage(parentUsername);
}
function adminConsentUnlink(id,parentUsername){
if(!confirm('確定刪除此連結紀錄？此操作無法復原！'))return;
const consents=get('ADV9_PARENT_CONSENTS',{requests:[]});
consents.requests=consents.requests.filter(r=>r.id!==id);
set('ADV9_PARENT_CONSENTS',consents);
toast('🗑 已刪除連結紀錄');
adminConsentManage(parentUsername);
}
async function delUser(username){
if(!confirm('確定刪除用戶「'+username+'」？此操作無法復原！'))return;
if(SUPA_ON&&WTOKEN){try{const rr=await fetch(SUPA_URL+'/rest/v1/admin/users/delete',{method:'POST',headers:supaHeaders(),body:JSON.stringify({username})});if(!rr.ok){const msg=await rr.text().catch(()=>'');return toast('⚠️ VPS 刪除失敗（HTTP '+rr.status+'）'+(msg?'：'+msg:''),'bad')}}catch(e){return toast('⚠️ VPS 刪除失敗，帳號未刪除','bad')}}
const us=get(LS.users,[]).filter(x=>x.username!==username);
set(LS.users,us);
toast('🗑 已刪除 '+username);
uRenderRows();
}

/* ════════════════════════════════════════════
   vCodesAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vCodesAdmin, codeRwText
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vCodesAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vCodesAdmin, codeRwText
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vCodesAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vCodesAdmin, codeRwText
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vCodesAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vCodesAdmin, codeRwText
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vCodesAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vCodesAdmin, codeRwText
   ════════════════════════════════════════════ */
async function vCodesAdmin(){
  if(!await needJs(['js/views/vCodesAdmin.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vCodesAdmin();
}












const randCode=()=>Array.from({length:8},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[(Math.random()*32)|0]).join('');

function genCodes(){

const g=id=>+($(id).value)||0;

const rewards={};

if(g('#gcGold'))rewards.gold=g('#gcGold');if(g('#gcCry'))rewards.crystal=g('#gcCry');

if(g('#gcDia'))rewards.diamond=g('#gcDia');if(g('#gcSl'))rewards.starlight=g('#gcSl');

if(g('#gcEnh'))rewards.enhStone=g('#gcEnh');if(g('#gcIron'))rewards.ironOre=g('#gcIron');

if(g('#gcHonor'))rewards.honor=g('#gcHonor');if(g('#gcQp'))rewards.quizPts=g('#gcQp');

if(g('#gcPk'))rewards.extraPk=g('#gcPk');if(g('#gcQuiz'))rewards.extraQuiz=g('#gcQuiz');

const ch=$('#gcChar').value;if(ch){rewards.grantChar=ch;rewards.grantCat='character'}

if(g('#gcShards'))rewards.grantShards=g('#gcShards');

if(!Object.keys(rewards).length)return toast('⚠️ 請至少設定一項獎勵','bad');

const n=Math.min(999,Math.max(1,g('#gcNum')));

const note=$('#gcNote').value.trim()||'管理員禮包';

const codes=get(LS.codes,[]);

codes.unshift({code:randCode(),note,rewards,maxUses:n,usedBy:[],time:Date.now()});

set(LS.codes,codes);toast('🎁 已生成 1 組禮包碼（可用 '+n+' 次）');vCodesAdmin();

}

function copyCode(c){if(navigator.clipboard)navigator.clipboard.writeText(c);toast('📋 已複製：'+c)}

function delCode(c){if(!confirm('刪除此禮包碼？'))return;set(LS.codes,get(LS.codes,[]).filter(x=>x.code!==c));vCodesAdmin()}

/* ════════════════════════════════════════════
   vPostAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPostAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vPostAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPostAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vPostAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPostAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vPostAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPostAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vPostAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPostAdmin
   ════════════════════════════════════════════ */
async function vPostAdmin(){
  if(!await needJs(['js/views/vPostAdmin.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vPostAdmin();
}






function postAnn(){const u=me();const t=$('#annT').value.trim(),c=$('#annC').value.trim();

if(!t||!c)return toast('⚠️ 請填寫標題與內容','bad');

const as=get(LS.ann,[]);as.unshift({id:Date.now(),title:t,content:c,author:u.name,time:Date.now()});

set(LS.ann,as);toast('📢 公告已發布');vPostAdmin()}

function delAnn(id){if(!confirm('刪除此公告？'))return;set(LS.ann,get(LS.ann,[]).filter(a=>a.id!==id));vPostAdmin()}

/* ════════════════════════════════════════════
   vApiKeys 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：AI_PRIORITY, apiModelOpts, vApiKeys
   ════════════════════════════════════════════ */
const AI_PRIORITY=['openai','deepseek','gemini','qwen','kimi','ollama'];


/* ════════════════════════════════════════════
   vApiKeys 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：apiModelOpts, vApiKeys
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vApiKeys 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：apiModelOpts, vApiKeys
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vApiKeys 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：apiModelOpts, vApiKeys
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   vApiKeys 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：apiModelOpts, vApiKeys
   ════════════════════════════════════════════ */

async function vApiKeys(){
  if(!await needJs(['js/views/vApiKeys.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vApiKeys();
}





function addApiKey(){const input=$('#newApiKey');const key=(input.value||'').trim();if(!key){toast('請輸入 API 金鑰','bad');return}const provider=$('#newApiProvider').value;let model=($('#newApiModel').value||'').trim()||AI_PROVIDERS[provider].defModel;const pv=AI_PROVIDERS[provider];if(pv.banned&&pv.banned.includes(model)){model=pv.defModel;toast('🚫 該模型已禁用，改用 '+model)}const data=get(LS.apiKeys,{keys:[],currentIndex:0,lastUsedTime:null});if(data.keys.some(k=>k.key===key)){toast('此金鑰已存在','bad');return}data.keys.push({key:key,provider:provider,model:model,addedAt:new Date().toISOString(),useCount:0,lastUsed:null});set(LS.apiKeys,data);toast('✅ 金鑰已新增（'+pv.n+'）');vApiKeys()}
function importApiKeysTxt(){
const raw=($('#apiKeyTxt').value||'').trim();if(!raw)return toast('請先貼上金鑰（每行一組）','bad');
const lines=raw.split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!/^(#|\/\/|;)/.test(s));
if(!lines.length)return toast('沒有可匯入的金鑰','bad');
const data=get(LS.apiKeys,{keys:[],currentIndex:0,lastUsedTime:null});
const provider=$('#txtApiProvider').value;let model=($('#txtApiModel').value||'').trim()||AI_PROVIDERS[provider].defModel;
const pv=AI_PROVIDERS[provider];if(pv.banned&&pv.banned.includes(model)){model=pv.defModel}
let added=0,skip=0;
lines.forEach(key=>{
  if(data.keys.some(k=>k.key===key)){skip++;return}
  let p=provider,m=model;
  if(/^AIza/i.test(key)){p='gemini';m=AI_PROVIDERS.gemini.defModel}
  data.keys.push({key,provider:p,model:m,addedAt:new Date().toISOString(),useCount:0,lastUsed:null});added++;
});
set(LS.apiKeys,data);
toast('📥 匯入完成：新增 '+added+' 組，略過重複 '+skip+' 組');
vApiKeys();}
function removeApiKey(idx){const data=get(LS.apiKeys,{keys:[],currentIndex:0,lastUsedTime:null});if(idx<0||idx>=data.keys.length)return;const removed=data.keys.splice(idx,1)[0];if(data.currentIndex>=data.keys.length)data.currentIndex=0;else if(data.currentIndex>idx)data.currentIndex--;set(LS.apiKeys,data);toast('🗑️ 已刪除金鑰');vApiKeys()}
async function testApiKey(idx){const data=get(LS.apiKeys,{keys:[],currentIndex:0,lastUsedTime:null});if(idx>=data.keys.length)return toast('金鑰不存在','bad');const key=data.keys[idx];const pv=AI_PROVIDERS[key.provider||'gemini'];toast('正在測試金鑰（'+pv.n+'）...');try{const start=Date.now();const answer=await callOneAI(key,'請回答：1+1=? 只回答數字','你是計算小助手。');const elapsed=Date.now()-start;toast('✅ 金鑰 '+(idx+1)+'（'+pv.n+'）可用 ('+elapsed+'ms) 回應：'+String(answer).substring(0,20));}catch(e){toast('❌ 金鑰 '+(idx+1)+'（'+pv.n+'）測試失敗：'+e.message,'bad');}}
async function testAllApiKeys(){const data=get(LS.apiKeys,{keys:[],currentIndex:0,lastUsedTime:null});if(!data.keys.length)return toast('尚無金鑰','bad');toast('正在依序測試所有金鑰...');for(let i=0;i<data.keys.length;i++){await testApiKey(i);await new Promise(r=>setTimeout(r,500));}}
/* ════════════════════════════════════════════
   vClasses 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vClasses
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vClasses 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vClasses
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vClasses 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vClasses
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vClasses 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vClasses
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vClasses 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vClasses
   ════════════════════════════════════════════ */
async function vClasses(){
  if(!await needJs(['js/views/vClasses.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vClasses();
}





function addClass(){const id=$('#newClassId').value.trim();const name=$('#newClassName').value.trim();if(!id||!name)return toast('請填寫班級代號和名稱','bad');const classes=get(LS.classes,{ids:[],names:{}});if(classes.ids.includes(id))return toast('此班級代號已存在','bad');classes.ids.push(id);classes.names[id]=name;set(LS.classes,classes);const u=me();if(u&&u.role==='teacher'){u.managedClassIds=u.managedClassIds||[];if(!u.managedClassIds.includes(id))u.managedClassIds.push(id);saveU(u)}toast('✅ 班級 '+name+' 已新增');const _u=me();if(_u&&_u.role==='teacher')tGo('cls');else vClasses()}
function removeClass(id){if(!confirm('確定刪除此班級？'))return;const classes=get(LS.classes,{ids:[],names:{}});classes.ids=classes.ids.filter(x=>x!==id);delete classes.names[id];set(LS.classes,classes);const us=get(LS.users,[]);us.forEach(x=>{if(x.managedClassIds)x.managedClassIds=x.managedClassIds.filter(c=>c!==id)});set(LS.users,us);toast('🗑️ 班級已刪除');const _u=me();if(_u&&_u.role==='teacher')tGo('cls');else vClasses()}
function editClassName(id){const classes=get(LS.classes,{ids:[],names:{}});const newName=prompt('請輸入新的班級名稱：',classes.names[id]||id);if(!newName)return;classes.names[id]=newName;set(LS.classes,classes);toast('✅ 班級名稱已更新');const _u=me();if(_u&&_u.role==='teacher')tGo('cls');else vClasses()}
/* ════════════════════════════════════════════
   vTHome 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTHome
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vTHome 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTHome
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vTHome 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTHome
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vTHome 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTHome
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vTHome 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTHome
   ════════════════════════════════════════════ */
async function vTHome(){
  if(!await needJs(['js/views/vTHome.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vTHome();
}





/* ════════════════════════════════════════════
   vRegStu 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRegStu
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vRegStu 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRegStu
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vRegStu 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRegStu
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vRegStu 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRegStu
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vRegStu 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRegStu
   ════════════════════════════════════════════ */
async function vRegStu(){
  if(!await needJs(['js/views/vRegStu.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vRegStu();
}





function impStuFile(inp){const f=inp.files&&inp.files[0];if(!f)return;const rd=new FileReader();rd.onload=e=>{$('#impStuTxt').value=e.target.result;toast('📄 已讀入 '+f.name+'，請確認後點「批次匯入」')};rd.readAsText(f,'utf-8')}
async function doImportStu(){
  const txt = ($('#impStuTxt').value || '').trim();
  if(!txt) return toast('請先貼上或選擇 TXT 內容','bad');

  const u = me();
  const classes = get(LS.classes, {ids:[], names:{}});
  const gradeName = {7:'七',8:'八',9:'九'};
  const numName = {1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'七',8:'八',9:'九'};

  let ok = 0, skip = 0;
  const logs = [];

  const lines = txt.split(/\r?\n/);
  for(const line of lines){
    const s = line.trim();
    if(!s) continue;
    const p = s.split(/\s+/);
    if(p.length < 4){
      skip++;
      logs.push('⚠️ 格式錯誤：'+esc(s));
      continue;
    }
    const name = p[0];
    const clsRaw = p[1].replace(/班$/,'');
    const seat = p[2];
    const pw = p[3];

    if(!classes.ids.includes(clsRaw)){
      classes.ids.push(clsRaw);
      const m = clsRaw.match(/^([1-9])0?(\d)$/);
      classes.names[clsRaw] = (m && gradeName[m[1]]) ? gradeName[m[1]]+'年'+(numName[+m[2]]||m[2])+'班' : clsRaw;
      classes.ids.sort();
    }

    const { data, error } = await supabaseRPC.rpc('teacher_register_student', {
      p_username: pw,
      p_name: name,
      p_password: pw,
      p_class_id: clsRaw
    });

    if (error) {
      skip++;
      logs.push('❌ ' + name + ' 註冊失敗：' + error.message);
    } else {
      ok++;
      logs.push('✅ ' + name + '｜' + clsRaw + '班 ' + seat + '號｜帳號：' + pw);
    }
  }

  set(LS.classes, classes);
  if(u && u.role === 'teacher') saveU(u);

  const lg = $('#impStuLog');
  if(lg) lg.innerHTML = logs.join('<br>');

  toast('📥 批次匯入完成：成功 ' + ok + ' 筆，失敗 ' + skip + ' 筆');
}

async function doRegStu() {
  const username = $('#regStuUser').value.trim();
  const password = $('#regStuPass').value;
  const name = $('#regStuName').value.trim();
  const classId = $('#regStuClass').value;

  if (!username || !password || !name) return toast('請填寫所有欄位', 'bad');
  if (!validPassword(password)) return toast('⚠️ 密碼只能使用英文、數字或特殊符號（不能有中文或空白）、至少 4 碼', 'bad');

  try {
    const response = await fetch(
      SUPA_URL + '/rest/v1/rpc/teacher_register_student',
      {
        method: 'POST',
        headers: supaHeaders(),
        body: JSON.stringify({
          p_username: username,
          p_name: name,
          p_password: password,
          p_class_id: classId
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    toast('✅ ' + data.message);

    // 同步到本機（固定為 student）
    let localUsers = get(LS.users, []);
    const newUser = {
      id: username,
      username: username,
      name: name,
      role: 'student',      // ← 固定為學生
      password: password,
      classId: classId,
      g: newGame(),
      createdAt: new Date().toISOString()
    };
    let existing = localUsers.find(x => x.username === username);
    if (existing) {
      Object.assign(existing, newUser);
    } else {
      localUsers.push(newUser);
    }
    set(LS.users, localUsers);

    tGo('reg');
  } catch (error) {
    toast('❌ 註冊失敗：' + error.message, 'bad');
  }
}

/* ════════════════════════════════════════════
   vAStats 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vAStats, st2
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAStats 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vAStats, st2
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAStats 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vAStats, st2
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAStats 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vAStats, st2
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vAStats 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vAStats, st2
   ════════════════════════════════════════════ */
async function vAStats(){
  if(!await needJs(['js/views/vAStats.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vAStats();
}












/* ════════════════════════════════════════════
   vResetAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vResetAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vResetAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vResetAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vResetAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vResetAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vResetAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vResetAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vResetAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vResetAdmin
   ════════════════════════════════════════════ */
async function vResetAdmin(){
  if(!await needJs(['js/views/vResetAdmin.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vResetAdmin();
}






function resetDefault(){if(!confirm('確定要重置為預設資料嗎？'))return;seed();localStorage.removeItem(LS.ses);toast('🔄 已重置');enter()}

function wipeAll(){if(!confirm('⚠️ 將清除所有數據，無法復原！確定？'))return;

Object.values(LS).forEach(k=>localStorage.removeItem(k));toast('🗑 已清除');enter()}

function openAddUser(isAdmin){

openModal('<h3 class="mt">'+(isAdmin?'👥 建立新帳號':'📝 新增帳號')+'</h3>'+

'<label class="mlab">身份<select id="nuRole" onchange="nuRoleChange(this)">'+

(isAdmin?'<option value="student">👤 學生</option><option value="teacher">👩‍🏫 老師</option><option value="parent">👨‍👩‍👧 家長</option><option value="admin">👑 管理員</option>'

:'<option value="student">👤 學生</option><option value="teacher">👩‍🏫 老師</option><option value="parent">👨‍👩‍👧 家長</option>')+'</select></label>'+

'<label class="mlab">姓名<input id="nuName" placeholder="例：王小明"></label>'+

'<label class="mlab" id="nuClsWrap2">班級（學生）<select id="nuClass"><option value="">未分班</option></select></label>'+

'<label class="mlab">帳號<input id="nuUser" placeholder="英文或數字"></label>'+

'<label class="mlab">密碼<input id="nuPass" placeholder="至少 4 碼，僅限英文/數字/符號"></label>'+

'<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button><button class="btn" onclick="createUser()">建立</button></div>');

if(SUPA_ON&&WTOKEN){fetch(SUPA_URL+'/rest/v1/class/list',{headers:{'x-adv9-token':WTOKEN}}).then(function(r){return r.json()}).then(function(d){if(d.ok&&d.classes){var sel=document.getElementById('nuClass');if(!sel)return;d.classes.forEach(function(c){var opt=document.createElement('option');opt.value=c.id;opt.textContent=c.name+' ('+c.code+')';sel.appendChild(opt)})}}).catch(function(){})}

}

async function createUser(){

const role=$('#nuRole').value,name=$('#nuName').value.trim(),cls=$('#nuClass').value.trim();

const username=$('#nuUser').value.trim(),password=$('#nuPass').value;

if(!name||!username||password.length<4)return toast('⚠️ 請填寫完整（密碼至少 4 碼）','bad');

if(!validPassword(password))return toast('⚠️ 密碼只能使用英文、數字或特殊符號（不能有中文或空白）','bad');

const us=get(LS.users,[]);

if(us.some(x=>x.username===username))return toast('⚠️ 帳號已存在','bad');

us.push({id:username,role,name,username,password,classId:role==='student'?(cls||'701'):null,managedClassIds:role==='teacher'?['701','702']:[],isSchoolAdmin:false,createdAt:Date.now(),g:role==='student'?newGame():null});

const nu=us[us.length-1];
if(SUPA_ON&&WTOKEN){try{const rr=await fetch(SUPA_URL+'/rest/v1/admin/users/create',{method:'POST',headers:supaHeaders(),body:JSON.stringify(nu)});if(!rr.ok)return toast('⚠️ VPS 建立帳號失敗（HTTP '+rr.status+'）','bad')}catch(e){return toast('⚠️ VPS 建立帳號失敗','bad')}}
set(LS.users,us);closeModal();toast('✅ 已建立帳號：'+username);

if(CUR.role==='admin')vUsers();

}
/* 建立帳號：改用本機（透過 set() 自動同步雲端）；資料庫無 admin_register_user RPC */
async function adminAddUser(){
const role=$('#nuRole').value;
const name=$('#nuName').value.trim();
const un=$('#nuUser').value.trim();
const pw=$('#nuPass').value;
const classId=(role==='student')?$('#nuCls').value:null;
if(!name||!un||!pw)return toast('請填寫姓名/帳號/密碼','bad');
if(pw.length<4)return toast('密碼至少 4 碼','bad');
if(!validPassword(pw))return toast('⚠️ 密碼只能使用英文、數字或特殊符號（不能有中文或空白）','bad');
const us=get(LS.users,[]);
if(us.some(x=>x.username===un))return toast('⚠️ 帳號「'+un+'」已存在','bad');
const nu={id:un,username:un,name:name,role:role,password:pw,classId:classId,g:role==='student'?newGame():null,createdAt:new Date().toISOString()};
if(role==='teacher'||role==='parent'){nu.managedClassIds=[];nu.isSchoolAdmin=false;nu.classId=null}
if(SUPA_ON&&WTOKEN){try{const rr=await fetch(SUPA_URL+'/rest/v1/admin/users/create',{method:'POST',headers:supaHeaders(),body:JSON.stringify(nu)});if(!rr.ok)return toast('⚠️ VPS 建立帳號失敗（HTTP '+rr.status+'）','bad')}catch(e){return toast('⚠️ VPS 建立帳號失敗','bad')}}
us.push(nu);
set(LS.users,us);
toast('✅ 已建立'+(role==='teacher'?'教師':role==='parent'?'家長':'學生')+'帳號：'+name+'（'+un+'）');
vUsers();
}

function openImp(){

const us=get(LS.users,[]).filter(x=>x.role!=='admin');

openModal('<h3 class="mt">🎭 模擬登入 (無需密碼)</h3><p class="msub">選擇要登入的學生或老師，無需密碼即可進入其帳號。</p>'+

'<label class="mlab">選擇要登入的學生或老師<select id="impSel"><option value="">-- 請選擇 --</option>'+

us.map(x=>'<option value="'+esc(x.username)+'">'+(x.role==='teacher'?'👩‍🏫':'👤')+' '+esc(x.name)+'（'+esc(x.username)+'）</option>').join('')+'</select></label>'+

'<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button><button class="btn" onclick="doImp()">立即登入</button></div>');

}

function doImp(){const v=$('#impSel').value;if(!v)return toast('⚠️ 請選擇帳號','bad');closeModal();impersonate(v)}

/* 模擬登入：直接用本機（已從雲端同步）的帳號資料，無需連網、無需密碼；資料庫並無 users 表，原本的雲端抓取一定失敗 */
function impersonate(username){
  const localUsers=get(LS.users,[]);
  const target=localUsers.find(x=>x.username===username);
  if(!target){toast('⚠️ 找不到帳號：'+username,'bad');return;}
  const m=me();
  set(LS.ses,{u:username,imp:m?m.username:false});
  enter();
}

function backAdmin(){const s=get(LS.ses);if(s&&s.imp){set(LS.ses,{u:s.imp,imp:false});enter()}else logout()}

/* 🕒 在線跨過 21:00 時自動發放排行榜信件（每 5 分鐘檢查一次）*/

setInterval(()=>{try{const u=me();if(u&&u.role==='student'){deliverRankMail();checkArenaDailyMail()}}catch(e){}},300000);

/* ════════ 🎮 遊戲中心：5 款可玩小遊戲 ════════ */
const GAME_LIST=[
{n:'五子棋',t:'棋盤策略',i:'⚫',play:'gGomoku()'},
{n:'2048',t:'數字益智',i:'🔢',play:'g2048()'},
{n:'記憶翻牌',t:'記憶訓練',i:'🃏',play:'gMemory()'},
{n:'俄羅斯方塊',t:'方塊益智',i:'🧱',play:'gTetris()'},
{n:'貪吃蛇',t:'休閒生存',i:'🐍',play:'gSnake()'}
];
function gameBack(){gameStop();vGames()}
function gameReward(name,score,gold,xp){const u=me(),g=u.g;gold=Math.max(0,Math.min(300,gold|0));xp=Math.max(0,Math.min(300,xp|0));g.gold+=gold;if(xp>0){g.xp+=xp;while(g.xp>=g.needXp&&g.lv<effMaxLv()){g.xp-=g.needXp;g.lv++;g.needXp=CFG.needXp(g.lv)}}saveU(u);hud();toast('🎮 '+name+' 結算：得分 '+score+'｜🪙+'+gold+' ✨+'+xp+' XP');duelRecord(name,score)}
/* ════════ ⚔️ 好友遊戲 PK（雙人對戰）════════ */
const DUEL_GAMES=[{n:'2048',f:'g2048',i:'🔢'},{n:'貪吃蛇',f:'gSnake',i:'🐍'},{n:'記憶翻牌',f:'gMemory',i:'🃏'},{n:'俄羅斯方塊',f:'gTetris',i:'🧱'}];
function duelChallenge(fid){
const fr=get(LS.users,[]).find(x=>x.id===fid);if(!fr)return;
openModal('<h3 class="mt">🎮 好友遊戲 PK</h3><p class="msub">向 '+esc(fr.name)+' 發起挑戰：選好遊戲後你先上場打一局，對方應戰後<b>比分數定勝負</b>（🏆 贏家 🪙100 ✨50｜輸家 🪙20 參加獎｜平手各得 🪙50）</p>'+
'<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">'+DUEL_GAMES.map(x=>'<button class="btn ghost" onclick="duelStart(\''+fid+'\',\''+x.n+'\')">'+x.i+' '+x.n+'</button>').join('')+'</div>'+
'<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button></div>');
}
function duelStart(fid,game){
const u=me();const fr=get(LS.users,[]).find(x=>x.id===fid);
const ds=get(LS.duels,[]);
const d={id:'d'+Date.now()+((Math.random()*1000)|0),game,a:u.id,aName:u.name,b:fid,bName:fr?fr.name:'?',aScore:null,bScore:null,status:'playing',winner:null,t:Date.now()};
ds.push(d);set(LS.duels,ds);closeModal();
CUR.duelId=d.id;
toast('⚔️ PK 開始！完成一局「'+game+'」，你的分數將登記為挑戰成績');
window[DUEL_GAMES.find(x=>x.n===game).f]();
}
function duelAccept(id){
const d=get(LS.duels,[]).find(x=>x.id===id);if(!d)return;
CUR.duelId=id;
toast('⚔️ 應戰「'+d.game+'」！完成一局登記你的成績');
window[DUEL_GAMES.find(x=>x.n===d.game).f]();
}
function duelRecord(game,score){ /* gameReward 結算後掛鉤：登記 PK 成績並自動判定勝負 */
if(!CUR.duelId)return;
const u=me();const ds=get(LS.duels,[]);const d=ds.find(x=>x.id===CUR.duelId);
CUR.duelId=null;
if(!d||d.game!==game||d.status==='done')return;
if(d.a===u.id&&d.aScore==null){d.aScore=score;d.status='waiting';set(LS.duels,ds);
setTimeout(()=>toast('📨 PK 成績 '+score+' 分已登記，等待 '+d.bName+' 應戰！'),900);return}
if(d.b===u.id&&d.bScore==null){d.bScore=score;d.status='done';
const us=get(LS.users,[]);const A=us.find(x=>x.id===d.a),B=us.find(x=>x.id===d.b);
const win=d.aScore===d.bScore?null:(d.aScore>d.bScore?A:B);const lose=win?(win===A?B:A):null;
if(win&&win.g){win.g.gold+=100;win.g.xp+=50;while(win.g.xp>=win.g.needXp&&win.g.lv<effMaxLv()){win.g.xp-=win.g.needXp;win.g.lv++;win.g.needXp=CFG.needXp(win.g.lv)}}
if(lose&&lose.g)lose.g.gold+=20;
if(!win){if(A&&A.g)A.g.gold+=50;if(B&&B.g)B.g.gold+=50}
d.winner=win?win.id:null;set(LS.users,us);set(LS.duels,ds);hud();
const meWin=win&&win.id===u.id;
setTimeout(()=>openModal('<h3 class="mt">'+(win?(meWin?'🏆 PK 勝利！':'💀 PK 落敗'):'🤝 平手！')+'</h3>'+
'<div style="text-align:center;font-size:46px;margin:8px 0">'+(win?(meWin?'🏆':'😢'):'🤝')+'</div>'+
'<div style="text-align:center;font-size:14px;margin-bottom:8px">'+esc(d.game)+'｜'+esc(d.aName)+'：'+d.aScore+' 分 vs '+esc(d.bName)+'：'+d.bScore+' 分</div>'+
'<div class="rwRow">'+(win?(meWin?'<span class="rwChip">🪙 +100</span><span class="rwChip">✨ +50 XP</span>':'<span class="rwChip">🪙 +20（參加獎）</span>'):'<span class="rwChip">🪙 +50（平手各得）</span>')+'</div>'+
'<div class="mBtns"><button class="btn" onclick="closeModal();vGames()">確定</button></div>'),700);
}
}
function duelPanel(){
const u=me();const ds=get(LS.duels,[]).filter(d=>d.a===u.id||d.b===u.id).sort((a,b)=>b.t-a.t).slice(0,12);
if(!ds.length)return '<p class="empty">尚無 PK 紀錄；到 👥好友 列表按「🎮 遊戲PK」向好友發起挑戰！</p>';
return ds.map(d=>{
const mine=d.a===u.id;
const st=d.status==='done'?(d.winner?(d.winner===u.id?'🏆 你贏了':'💀 你輸了'):'🤝 平手'):d.status==='waiting'?(mine?'⏳ 等待 '+esc(d.bName)+' 應戰':'📥 等你應戰！'):'🎮 進行中';
const btn=(!mine&&d.status==='waiting'&&d.bScore==null)?'<button class="btn mini" onclick="duelAccept(\''+d.id+'\')">⚔️ 應戰</button>':(mine&&d.status==='playing'&&d.aScore==null?'<button class="btn mini" onclick="duelAccept(\''+d.id+'\')">▶️ 繼續挑戰</button>':'');
return '<div class="panel2 frIt"><b style="flex:1">'+(mine?'📤 你 → '+esc(d.bName):'📥 '+esc(d.aName)+' → 你')+'｜'+esc(d.game)+'</b><span style="font-size:12px;color:var(--mut)">'+(d.aScore!=null?esc(d.aName)+' '+d.aScore+'分':'')+(d.bScore!=null?'｜'+esc(d.bName)+' '+d.bScore+'分':'')+'</span><span style="font-size:12.5px">'+st+'</span>'+btn+'</div>'}).join('');
}
/* ════════════════════════════════════════════
   vGames 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：gameKey, gameStop, vGames
   ════════════════════════════════════════════ */
function gameKey(fn){if(window._gKey)window.removeEventListener('keydown',window._gKey);window._gKey=fn;if(fn)window.addEventListener('keydown',fn)}

function gameStop(){gameKey(null);if(window._gTimer){clearInterval(window._gTimer);window._gTimer=null}}

/* ════════════════════════════════════════════
   vGames 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGames
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGames 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGames
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGames 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGames
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGames 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGames
   ════════════════════════════════════════════ */
async function vGames(){
  if(!await needJs(['js/views/vGames.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vGames();
}





/* --- 2048 --- */
function g2048(){
gameStop();
CUR.g2048={b:Array(16).fill(0),score:0,over:false,won:false};
add2048();add2048();
$('#view').innerHTML='<button class="btn ghost mini back" onclick="gameBack()">← 返回遊戲中心</button><h3 class="vt">🔢 2048 <span class="vsub" id="g2048s">分數 0</span></h3>'+
'<div id="g2048b" style="display:grid;grid-template-columns:repeat(4,72px);gap:8px;justify-content:center;margin:14px auto"></div>'+
'<div style="display:flex;flex-direction:column;align-items:center;gap:6px;margin:8px 0"><button class="btn mini" style="width:66px;font-size:16px" onclick="move2048(0)">⬆️</button><div style="display:flex;gap:6px"><button class="btn mini" style="width:66px;font-size:16px" onclick="move2048(3)">⬅️</button><button class="btn mini" style="width:66px;font-size:16px" onclick="move2048(2)">⬇️</button><button class="btn mini" style="width:66px;font-size:16px" onclick="move2048(1)">➡️</button></div></div>'+
'<p style="text-align:center;color:var(--mut);font-size:12.5px">鍵盤方向鍵或點擊上方按鈕移動合併；合到 2048 獲勝！結束時依分數發 🪙/✨ 獎勵</p>'+
'<div style="text-align:center"><button class="btn mini" onclick="g2048()">🔄 重新開始</button></div>';
draw2048();
gameKey(e=>{const d={ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3}[e.key];if(d===undefined)return;e.preventDefault();move2048(d)});
}
function move2048(dir){
const s=CUR.g2048;if(s.over)return;
const idx=(i,j)=>dir===3?i*4+j:dir===1?i*4+(3-j):dir===0?j*4+i:(3-j)*4+i;
let moved=false;
for(let i=0;i<4;i++){
const line=[];for(let j=0;j<4;j++){const v=s.b[idx(i,j)];if(v)line.push(v)}
for(let j=0;j<line.length-1;j++){if(line[j]===line[j+1]){line[j]*=2;s.score+=line[j];line.splice(j+1,1)}}
for(let j=0;j<4;j++){const nv=line[j]||0;const k=idx(i,j);if(s.b[k]!==nv)moved=true;s.b[k]=nv}
}
if(!moved)return;
add2048();
if(s.b.includes(2048)&&!s.won){s.won=true;toast('🏆 達成 2048！傳奇！')}
if(!can2048()){s.over=true;gameStop();gameReward('2048',s.score,Math.floor(s.score/40),Math.floor(s.score/80))}
draw2048();
}
function draw2048(){
const s=CUR.g2048;const colors={2:'#3b4a6b',4:'#455a86',8:'#f59e0b',16:'#f97316',32:'#ef4444',64:'#e11d48',128:'#a855f7',256:'#7c3aed',512:'#2563eb',1024:'#0ea5e9',2048:'#22c55e'};
const el=$('#g2048b');if(!el)return;
el.innerHTML=s.b.map(v=>'<div style="width:72px;height:72px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:'+(v>=1024?17:22)+'px;background:'+(v?(colors[v]||'#16a34a'):'rgba(0,0,0,.25)')+';color:#fff">'+(v||'')+'</div>').join('');
const sc=$('#g2048s');if(sc)sc.textContent='分數 '+s.score+(s.over?'｜💀 遊戲結束':'');
}
/* --- 貪吃蛇 --- */
function gSnake(){
gameStop();
CUR.snake={s:[[8,10],[7,10],[6,10]],d:[1,0],nd:[1,0],f:null,score:0,over:false};
snakeFood();
$('#view').innerHTML='<button class="btn ghost mini back" onclick="gameBack()">← 返回遊戲中心</button><h3 class="vt">🐍 貪吃蛇 <span class="vsub" id="snakeS">分數 0</span></h3>'+
'<canvas id="snakeC" width="400" height="400" style="display:block;margin:10px auto;background:rgba(0,0,0,.3);border-radius:8px;max-width:100%"></canvas>'+
'<div style="display:flex;flex-direction:column;align-items:center;gap:6px;margin:8px 0"><button class="btn mini" style="width:66px;font-size:16px" onclick="snakeDir(0,-1)">⬆️</button><div style="display:flex;gap:6px"><button class="btn mini" style="width:66px;font-size:16px" onclick="snakeDir(-1,0)">⬅️</button><button class="btn mini" style="width:66px;font-size:16px" onclick="snakeDir(0,1)">⬇️</button><button class="btn mini" style="width:66px;font-size:16px" onclick="snakeDir(1,0)">➡️</button></div></div>'+
'<p style="text-align:center;color:var(--mut);font-size:12.5px">鍵盤方向鍵或點擊按鈕控制；吃到食物 +1 分；撞牆/撞自己結束</p>'+
'<div style="text-align:center"><button class="btn mini" onclick="gSnake()">🔄 重新開始</button></div>';
gameKey(e=>{const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(!m)return;e.preventDefault();const st=CUR.snake;if(m[0]!==-st.d[0]||m[1]!==-st.d[1])st.nd=m});
window._gTimer=setInterval(snakeTick,140);
snakeDraw();
}
function snakeTick(){
const st=CUR.snake;if(!st||st.over)return;
st.d=st.nd;
const h=[st.s[0][0]+st.d[0],st.s[0][1]+st.d[1]];
if(h[0]<0||h[0]>=20||h[1]<0||h[1]>=20||st.s.some(q=>q[0]===h[0]&&q[1]===h[1])){st.over=true;gameStop();gameReward('貪吃蛇',st.score,st.score*3,st.score*2);snakeDraw();return}
st.s.unshift(h);
if(h[0]===st.f[0]&&h[1]===st.f[1]){st.score++;snakeFood()}else st.s.pop();
snakeDraw();
}
function snakeDraw(){
const c=document.getElementById('snakeC');if(!c)return;const x=c.getContext('2d');x.clearRect(0,0,400,400);const st=CUR.snake;
x.fillStyle='#f59e0b';x.fillRect(st.f[0]*20+3,st.f[1]*20+3,14,14);
st.s.forEach((q,i)=>{x.fillStyle=i?'#22c55e':'#4ade80';x.fillRect(q[0]*20+1,q[1]*20+1,18,18)});
const sc=$('#snakeS');if(sc)sc.textContent='分數 '+st.score+(st.over?'｜💀 遊戲結束':'');
}
/* --- 記憶翻牌 --- */
function gMemory(){
gameStop();
const ems=['🍎','🍌','🍇','🍓','🍑','🍍','🥝','🍉','🍒','🌽','🥕','🍄','🌸','🌻','🍀','⭐','🌙','☀️'];
const deck=ems.concat(ems).map(v=>({v,open:false,done:false}));
for(let i=deck.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;const t=deck[i];deck[i]=deck[j];deck[j]=t}
CUR.mem={deck,first:-1,lock:false,moves:0,pairs:0};
$('#view').innerHTML='<button class="btn ghost mini back" onclick="gameBack()">← 返回遊戲中心</button><h3 class="vt">🃏 記憶翻牌 <span class="vsub" id="memS">配對 0/18｜步數 0</span></h3>'+
'<div id="memB" style="display:grid;grid-template-columns:repeat(6,58px);gap:6px;justify-content:center;margin:14px auto"></div>'+
'<p style="text-align:center;color:var(--mut);font-size:12.5px">6x6 卡片配對：翻開兩張相同即消除；步數越少獎勵越高</p>'+
'<div style="text-align:center"><button class="btn mini" onclick="gMemory()">🔄 重新開始</button></div>';
memDraw();
}
function memFlip(i){
const m=CUR.mem;if(!m||m.lock)return;const c=m.deck[i];if(c.open||c.done)return;
c.open=true;
if(m.first<0){m.first=i;memDraw();return}
m.moves++;
const f=m.deck[m.first];m.first=-1;
if(f.v===c.v){f.done=c.done=true;m.pairs++;memDraw();
if(m.pairs===18){const sc=Math.max(20,600-m.moves*10);gameReward('記憶翻牌',sc,Math.floor(sc/5),Math.floor(sc/10))}
}else{m.lock=true;memDraw();setTimeout(()=>{f.open=c.open=false;m.lock=false;memDraw()},650)}
}
function memDraw(){
const m=CUR.mem;const el=$('#memB');if(!el)return;
el.innerHTML=m.deck.map((c,i)=>'<div onclick="memFlip('+i+')" style="width:58px;height:58px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:26px;cursor:pointer;background:'+(c.done?'rgba(34,197,94,.25)':c.open?'#2a3a63':'rgba(124,77,255,.3)')+';border:1px solid var(--line)">'+(c.open||c.done?c.v:'❓')+'</div>').join('');
const s=$('#memS');if(s)s.textContent='配對 '+m.pairs+'/18｜步數 '+m.moves;
}
/* --- 五子棋（15x15，簡易 AI）--- */
function gGomoku(){
gameStop();
CUR.gmk={b:Array(225).fill(0),over:false,two:false,turn:1};
$('#view').innerHTML='<button class="btn ghost mini back" onclick="gameBack()">← 返回遊戲中心</button><h3 class="vt">⚫ 五子棋 <span class="vsub" id="gmkS">你執黑棋｜15x15 大棋盤</span></h3>'+
'<div id="gmkB" style="display:grid;grid-template-columns:repeat(15,26px);gap:1px;justify-content:center;margin:12px auto"></div>'+
'<p style="text-align:center;color:var(--mut);font-size:12.5px">點擊落子；連成五子獲勝；AI 會學習你的佈局攻防</p>'+
'<div style="text-align:center;display:flex;gap:8px;justify-content:center"><button class="btn mini" onclick="gGomoku()">🔄 重新開始</button><button class="btn teal mini" onclick="gGomoku2()">👥 雙人對戰（同機）</button></div>';
gmkDraw();
}
function gGomoku2(){ /* 雙人同機對戰：黑白輪流落子 */
gameStop();
CUR.gmk={b:Array(225).fill(0),over:false,two:true,turn:1};
$('#view').innerHTML='<button class="btn ghost mini back" onclick="gameBack()">← 返回遊戲中心</button><h3 class="vt">⚫⚪ 五子棋雙人對戰 <span class="vsub" id="gmkS">⚫ 黑棋回合｜同機輪流落子</span></h3>'+
'<div id="gmkB" style="display:grid;grid-template-columns:repeat(15,26px);gap:1px;justify-content:center;margin:12px auto"></div>'+
'<p style="text-align:center;color:var(--mut);font-size:12.5px">和好友同一台電腦輪流點擊落子；先連成五子者獲勝</p>'+
'<div style="text-align:center;display:flex;gap:8px;justify-content:center"><button class="btn mini" onclick="gGomoku2()">🔄 重新開始</button><button class="btn ghost mini" onclick="gGomoku()">🤖 單人模式</button></div>';
gmkDraw();
}
function gmkPut(i){
const s=CUR.gmk;if(!s||s.over||s.b[i])return;
if(s.two){ /* 雙人模式：黑白輪流 */
s.b[i]=s.turn;
if(gmkWin(s.turn)){s.over=true;gmkDraw();const w=s.turn===1?'⚫ 黑棋':'⚪ 白棋';toast('🏆 '+w+' 五子連線獲勝！');const t=$('#gmkS');if(t)t.textContent='🏆 '+w+' 獲勝！';gameReward('五子棋雙人',60,40,20);return}
s.turn=s.turn===1?2:1;const t=$('#gmkS');if(t)t.textContent=(s.turn===1?'⚫ 黑棋':'⚪ 白棋')+' 回合｜同機輪流落子';gmkDraw();return}
s.b[i]=1;
if(gmkWin(1)){s.over=true;gmkDraw();toast('🏆 五子連線，你贏了！');gameReward('五子棋',100,100,60);return}
const j=gmkAI();if(j>=0)s.b[j]=2;
if(gmkWin(2)){s.over=true;gmkDraw();toast('💀 AI 獲勝，再接再厲！','bad');gameReward('五子棋',10,10,5);return}
gmkDraw();
}
function gmkDraw(){
const s=CUR.gmk;const el=$('#gmkB');if(!el)return;
el.innerHTML=s.b.map((v,i)=>'<div onclick="gmkPut('+i+')" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:17px;cursor:pointer;background:rgba(141,110,99,.25);border:1px solid rgba(141,110,99,.5)">'+(v===1?'⚫':v===2?'⚪':'')+'</div>').join('');
}
/* --- 俄羅斯方塊 --- */
const TET_SHAPES=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]];
const TET_COLORS=['#0ea5e9','#f59e0b','#a855f7','#2563eb','#f97316','#ef4444','#22c55e'];
function gTetris(){
gameStop();
CUR.tet={b:Array.from({length:20},()=>Array(10).fill(0)),cur:null,ci:0,x:3,y:0,score:0,lines:0,over:false};
tetSpawn();
$('#view').innerHTML='<button class="btn ghost mini back" onclick="gameBack()">← 返回遊戲中心</button><h3 class="vt">🧱 俄羅斯方塊 <span class="vsub" id="tetS">分數 0｜消除 0 列</span></h3>'+
'<canvas id="tetC" width="200" height="400" style="display:block;margin:10px auto;background:rgba(0,0,0,.35);border-radius:8px"></canvas>'+
'<div style="display:flex;gap:6px;justify-content:center;margin:8px 0;flex-wrap:wrap"><button class="btn mini" style="width:60px;font-size:15px" onclick="tetCmd(\'l\')">⬅️</button><button class="btn mini" style="width:60px;font-size:15px" onclick="tetCmd(\'u\')">🔄</button><button class="btn mini" style="width:60px;font-size:15px" onclick="tetCmd(\'r\')">➡️</button><button class="btn mini" style="width:60px;font-size:15px" onclick="tetCmd(\'d\')">⬇️</button><button class="btn mini" style="width:60px;font-size:15px" onclick="tetCmd(\'hd\')">⏬</button></div>'+
'<p style="text-align:center;color:var(--mut);font-size:12.5px">鍵盤：⬅️➡️ 移動｜⬆️ 旋轉｜⬇️ 軟降｜空白鍵 硬降；或點擊上方按鈕操作；消列得分</p>'+
'<div style="text-align:center"><button class="btn mini" onclick="gTetris()">🔄 重新開始</button></div>';
gameKey(e=>{
const s=CUR.tet;if(!s||s.over)return;
if(e.key==='ArrowLeft'){e.preventDefault();if(!tetHit(s.cur,s.x-1,s.y))s.x--}
else if(e.key==='ArrowRight'){e.preventDefault();if(!tetHit(s.cur,s.x+1,s.y))s.x++}
else if(e.key==='ArrowDown'){e.preventDefault();if(!tetHit(s.cur,s.x,s.y+1))s.y++}
else if(e.key==='ArrowUp'){e.preventDefault();tetRot()}
else if(e.key===' '){e.preventDefault();while(!tetHit(s.cur,s.x,s.y+1))s.y++;tetLock()}
tetDraw();
});
window._gTimer=setInterval(tetTick,480);
tetDraw();
}
function tetSpawn(){const s=CUR.tet;s.ci=(Math.random()*7)|0;s.cur=TET_SHAPES[s.ci].map(r=>r.slice());s.x=3;s.y=0;
if(tetHit(s.cur,s.x,s.y)){s.over=true;gameStop();gameReward('俄羅斯方塊',s.score,Math.floor(s.score/10),Math.floor(s.score/20))}}
function tetCmd(c){const s=CUR.tet;if(!s||s.over)return;
if(c==='l'&&!tetHit(s.cur,s.x-1,s.y))s.x--;
else if(c==='r'&&!tetHit(s.cur,s.x+1,s.y))s.x++;
else if(c==='d'&&!tetHit(s.cur,s.x,s.y+1))s.y++;
else if(c==='u')tetRot();
else if(c==='hd'){while(!tetHit(s.cur,s.x,s.y+1))s.y++;tetLock()}
tetDraw()}
function tetLock(){
const s=CUR.tet;
s.cur.forEach((r,y)=>r.forEach((v,x)=>{if(v&&s.y+y>=0)s.b[s.y+y][s.x+x]=s.ci+1}));
let cleared=0;
s.b=s.b.filter(row=>{if(row.every(v=>v)){cleared++;return false}return true});
while(s.b.length<20)s.b.unshift(Array(10).fill(0));
if(cleared){s.lines+=cleared;s.score+=[0,100,300,600,1000][cleared]}
s.score+=10;
tetSpawn();
}
function tetTick(){const s=CUR.tet;if(!s||s.over)return;if(!tetHit(s.cur,s.x,s.y+1))s.y++;else tetLock();tetDraw()}
function tetDraw(){
const c=document.getElementById('tetC');if(!c)return;const x=c.getContext('2d');x.clearRect(0,0,200,400);
const s=CUR.tet;
for(let yy=0;yy<20;yy++)for(let xx=0;xx<10;xx++){if(s.b[yy][xx]){x.fillStyle=TET_COLORS[s.b[yy][xx]-1];x.fillRect(xx*20+1,yy*20+1,18,18)}}
if(s.cur&&!s.over){x.fillStyle=TET_COLORS[s.ci];s.cur.forEach((r,yy)=>r.forEach((v,xx)=>{if(v&&s.y+yy>=0)x.fillRect((s.x+xx)*20+1,(s.y+yy)*20+1,18,18)}))}
const sc=$('#tetS');if(sc)sc.textContent='分數 '+s.score+'｜消除 '+s.lines+' 列'+(s.over?'｜💀 遊戲結束':'');
}

/* ════════ 啟動 ════════ */

(function(){

const bg=$('#bgfx');

for(let i=0;i<55;i++){const s=document.createElement('i');s.className='star';

s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';

s.style.animationDelay=(Math.random()*3)+'s';s.style.opacity=.25+Math.random()*.6;bg.appendChild(s)}

for(let i=0;i<12;i++){const e=document.createElement('i');e.className='ember';

e.style.left=Math.random()*100+'%';e.style.animationDuration=(6+Math.random()*8)+'s';

e.style.animationDelay=(Math.random()*8)+'s';bg.appendChild(e)}

/* 啟動爆發特效：LOGO 四周金光星花噴發 */

const _bu=$('#ldBurst');

if(_bu){for(let i=0;i<16;i++){const sp=document.createElement('span');const ang=Math.random()*Math.PI*2,dist=70+Math.random()*90;

sp.style.setProperty('--dx',(Math.cos(ang)*dist)+'px');sp.style.setProperty('--dy',(Math.sin(ang)*dist)+'px');

sp.style.animationDelay=(Math.random()*0.25)+'s';sp.textContent=['✨','🌟','⭐','💥','🔥','💫'][i%6];

_bu.appendChild(sp);setTimeout(()=>sp.remove(),1400)}}

(function() {
  var elPct = document.getElementById('ldPct');
  var elTip = document.getElementById('ldTip');
  var elSplash = document.getElementById('splash');
  
  var tips = ['⚔️ 正在喚醒精靈嚮導…', '🏰 正在建造無限競技塔…', '🎴 正在洗牌 SSR 卡池…', '⚒️ 正在鍛造傳說裝備…', '🗺️ 正在繪製領土地圖…', '🌟 傳說冒險即將開始！'];
  var ti = 0, ld = 0;
  
  // Initialize
  if (elTip) elTip.textContent = tips[0];
  if (elPct) elPct.textContent = '0%';
  
  // Update tips
  var tipInt = setInterval(function() {
    ti++;
    if (elTip && ti < tips.length) {
      elTip.textContent = tips[ti];
    }
    if (ti >= tips.length) clearInterval(tipInt);
  }, 500);
  
  // Update progress
  var ldInt = setInterval(function() {
    ld = Math.min(100, ld + 3 + Math.floor(Math.random() * 5));
    if (elPct) elPct.textContent = ld + '%';
    if (ld >= 100) {
      clearInterval(ldInt);
      clearInterval(tipInt);
    }
  }, 50);
  
  // Hide splash after delay
  setTimeout(function() {
    if (elPct) elPct.textContent = '100%';
    if (elSplash) {
      elSplash.style.display = 'none';
      setTimeout(function() {
        if (typeof enter === 'function') enter();
      }, 100);
    }
  }, 1500);
  
})();

})();