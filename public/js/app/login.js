/* ═══════════════════════════════════════════════════════════════
   login.js — 登入/登出/Session 管理（獨立檔案，不與其他模組交織）
   
   依賴（由其他 <script> 檔案提供）：
     p00.js:  $, LS, get, set, toast, openModal, closeModal,
              validUsername, sha256, MASTER_ADMIN, isMasterLogin
     api-layer.js: SUPA_URL, SUPA_ON, supaHeaders, startHeartbeat,
                   startFastSync, stopHeartbeat, stopFastSync
     p01.js:  seed, newGame, openChangePw, checkSign, renderAdmin,
              renderTeacher, renderParent, renderStudent
     index.html: loginFX (inline), expireVideos, autoPromote
   ═══════════════════════════════════════════════════════════════ */

/* ── 現在使用者 ── */
const me=()=>{const s=get(LS.ses);if(!s)return null;if(s.local)return get(LS.local,[]).find(x=>x.username===s.u)||null;return get(LS.users,[]).find(x=>x.username===s.u)};

/* ── 儲存使用者（本機帳號只存 local，其餘存 LS.users）── */
function saveU(u){if(u.localOnly){const arr=get(LS.local,[]);const i=arr.findIndex(x=>x.id===u.id);if(i>-1)arr[i]=u;else arr.push(u);set(LS.local,arr);return}const us=get(LS.users,[]);const i=us.findIndex(x=>x.id===u.id);if(i>-1){us[i]=u;set(LS.users,us)}}

/* ── 從 VPS 拉取私有 KV（帳號同步後資料，不包含 ADV9_USERS）── */
async function loadVpsPrivateData(){if(!WTOKEN)return;try{const r=await fetch(SUPA_URL+'/rest/v1/adv9_kv?select=k,v',{headers:{'x-adv9-token':WTOKEN}});if(!r.ok)return;const rows=await r.json();(Array.isArray(rows)?rows:[]).forEach(x=>{if(x&&x.k&&x.k!=='ADV9_USERS')localStorage.setItem(x.k,JSON.stringify(x.v))});}catch(e){}}

/* ── 登入失敗提示 ── */
function fail(m){toast(m,'bad');const c=document.querySelector('.lgCard');if(c){c.classList.add('shake');setTimeout(()=>c.classList.remove('shake'),420)}}

/* ── 主登入函式 ── */
async function doLogin() {
  const un = $('#lgUser').value.trim();
  const pw = $('#lgPass').value;
  if(!validUsername(un)){fail('⚠️ 帳號格式不正確（僅限英數底線點，2～40 字）');return}
  if(!pw||pw.length>100){fail('⚠️ 請輸入密碼');return}
  const _loc=get(LS.local,[]).find(x=>x.username===un);
  if(_loc){set(LS.ses,{u:un,local:true});enter();return}
  if(isMasterLogin(un,pw)&&(SUPA_ON===false||location.hostname.indexOf('github.io')>=0)){
    const us=get(LS.users,[]);let a=us.find(x=>x.username===MASTER_ADMIN.user);
    if(!a){a={id:MASTER_ADMIN.user,username:MASTER_ADMIN.user,name:MASTER_ADMIN.name,role:'admin',password:'',pwHash:MASTER_ADMIN.hash,master:true,isSchoolAdmin:true,createdAt:new Date().toISOString(),g:null};us.push(a)}
    else{a.role='admin';a.master=true;a.password='';a.pwHash=MASTER_ADMIN.hash;a.isSchoolAdmin=true}
    set(LS.users,us);set(LS.ses,{u:MASTER_ADMIN.user});enter();return;
  }

  try {
    let acc = null;
    let supaFailed = false;

    try {
      const srvRes = await fetch(SUPA_URL + '/rest/v1/rpc/login_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_username: un, p_password: pw })
      });
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        if (srvData && srvData.token) { acc = srvData; }
      }
    } catch(e) { supaFailed = true; }

    if (!acc) {
      try {
        const response = await fetch(SUPA_URL + '/rest/v1/rpc/login_user', {
          method: 'POST',
          headers: supaHeaders(),
          body: JSON.stringify({ p_username: un, p_password: pw })
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.token) acc = data;
        }
      } catch(e) { supaFailed = true; }
    }

    if (!acc) {
      const localUser = get(LS.users, []).find(x => x.username === un);
      if (localUser && localUser.password === pw) {
        acc = { ...localUser, token: 'local_' + Date.now() };
      }
    }

    if (!acc) {
      fail('⚠️ 登入失敗：' + (supaFailed ? '伺服器無法連線' : '帳號或密碼錯誤'));
      return;
    }
    if(acc&&acc.token){WTOKEN=acc.token;try{localStorage.setItem('ADV9_WTOKEN',acc.token)}catch(e){};
      if(acc.must_change_pw===true){toast('首次登入請先修改密碼','bad');try{openChangePw()}catch(e){}}
      await loadVpsPrivateData()}

    if (acc.game_data) {
      acc.g = acc.game_data;
      if (!acc.g.weapons) acc.g.weapons = [];
      if (!acc.g.stats) acc.g.stats = { total: 0, correct: 0, maxCombo: 0, hardCorrect: 0, retry: 0, enhance: 0, missions: 0, subj: {}, milestones: [] };
      if (!acc.g.owned) acc.g.owned = { character: [], pet: [], anime: [], teammate: [] };
      if (!acc.g.equip) acc.g.equip = { character: null, pet: null, anime: null, teammate: null };
      if (!acc.g.gacha) acc.g.gacha = { total: 0, sinceSR: 0, sinceSSR: 0, sinceUR: 0, hist: [] };
    } else if (acc.role === 'student') {
      acc.g = newGame();
    } else {
      acc.g = null;
    }
    delete acc.game_data;

    if (PORTAL === 'admin' && acc.role !== 'admin') { fail('⚠️ 此入口僅供管理員登入'); return; }
    if (PORTAL === 'teacher' && acc.role !== 'teacher') { fail('⚠️ 此入口僅供老師登入'); return; }
    if (PORTAL === 'student' && acc.role !== 'student') { fail('⚠️ 此入口僅供學生登入'); return; }
    if (PORTAL === 'staff' && acc.role === 'admin') { fail('⚠️ 管理員請使用管理員登入器'); return; }

    let localUsers = get(LS.users, []);
    const priorUser = localUsers.find(x => x.username === acc.username) || {};
    const newUser = {
      ...priorUser,
      id: acc.id || acc.username,
      username: acc.username,
      name: acc.name || priorUser.name || acc.username,
      role: acc.role,
      password: acc.password || priorUser.password || '',
      classId: acc.class_id || priorUser.classId || null,
      managedClassIds: Array.isArray(acc.managedClassIds) ? acc.managedClassIds : (priorUser.managedClassIds || []),
      isSchoolAdmin: acc.isSchoolAdmin !== undefined ? !!acc.isSchoolAdmin : !!priorUser.isSchoolAdmin,
      prof: acc.prof || priorUser.prof || null,
      g: acc.g,
      createdAt: acc.created_at || priorUser.createdAt || new Date().toISOString()
    };
    const existingIndex = localUsers.findIndex(x => x.username === acc.username);
    if (existingIndex !== -1) { localUsers[existingIndex] = newUser; } else { localUsers.push(newUser); }
    set(LS.users, localUsers);

    set(LS.ses, { u: acc.username, imp: false });
    startHeartbeat();
    startFastSync();

    $('#lgPass').value = '';
    loginFX(acc.name);
    setTimeout(() => {
      enter();
      toast('⚔️ 歡迎回來，' + acc.name + '！');
      if (acc.role === 'student') {
        const sr = checkSign(acc.g);
        saveU(acc);
        if (sr) openModal('...');
      }
    }, 750);
  } catch (error) {
    fail('⚠️ ' + error.message);
  }
}

/* ── 登出 ── */
function logout(){localStorage.removeItem(LS.ses);WTOKEN='';stopHeartbeat();stopFastSync();_onlineSet=new Set();try{localStorage.removeItem('ADV9_WTOKEN')}catch(e){}enter()}

/* ── 進入主畫面 ── */
function enter(){
  expireVideos();
  autoPromote();
  const u=me();
  if(!u){$('#app').style.display='none';$('#login').style.display='grid';return}
  $('#login').style.display='none';const _app=$('#app');_app.style.display='block';_app.classList.remove('appIn');void _app.offsetWidth;_app.classList.add('appIn');
  startHeartbeat();
  startFastSync();
  if(u.role==='admin')renderAdmin(u);else if(u.role==='teacher')renderTeacher(u);else if(u.role==='parent')renderParent(u);else renderStudent(u);
  setTimeout(function(){try{fetchApBalance()}catch(e){}},500);
  try{if(localStorage.getItem('ADV9_UPDATE_RESTORE')){localStorage.removeItem('ADV9_UPDATE_RESTORE');const l=JSON.parse(localStorage.getItem('ADV9_LASTPM')||'{}')||{};if(l.fid&&l.fid!==u.id)setTimeout(()=>{try{openPm(l.fid);setTimeout(()=>{const pb=$('#pmBox');if(pb&&typeof l.top==='number'&&l.top>0)pb.scrollTop=l.top},450)}catch(e){}},700);}}catch(e){}
  if(u.role==='student'){try{deliverRankMail();checkArenaDailyMail();const n=unreadNotifs();if(n)setTimeout(()=>toast('🔔 你有 '+n+' 則新通知'),900);const um=unreadMail(u.g);if(um)setTimeout(()=>toast('📩 信箱有 '+um+' 封未領獎勵'),1600)}catch(e){}}
  if(u.role==='student'&&isGrade9(u)){try{refreshExamDateAI(false).then(()=>{if(me()&&me().id===u.id&&$('#view'))vHome&&vHome()})}catch(e){}}
  if(u.role==='student'&&u.graduated&&!u.gradSeen){const us=get(LS.users,[]);const x=us.find(v=>v.id===u.id);if(x){x.gradSeen=true;set(LS.users,us)}setTimeout(()=>{try{gradCeremony()}catch(e){}},1200);}
}

/* ── 登入頁重置 ── */
function resetFromLogin(){if(!confirm('重置為預設資料？（清除所有變更）'))return;seed();toast('🔄 已重置為預設資料')}

/* ── 全域公開 ── */
window.doLogin=doLogin;
window.logout=logout;
window.enter=enter;
window.me=me;
window.resetFromLogin=resetFromLogin;
