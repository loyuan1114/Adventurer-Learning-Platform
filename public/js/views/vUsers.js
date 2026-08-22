/* ════════════════════════════════════════════
   vUsers 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vUsers
   ════════════════════════════════════════════ */
function vUsers(){
const classes=get(LS.classes,{ids:[],names:{}});
const clsOpts=classes.ids.map(id=>'<option value="'+id+'">'+(classes.names[id]||id)+'</option>').join('');
const us=get(LS.users,[]);
$('#view').innerHTML='<h3 class="vt">👥 所有用戶 <span class="vsub">共 <b id="uCount">'+us.length+'</b> 人</span></h3>'+
'<div class="panel2" style="margin-bottom:14px"><b style="color:var(--gold2)">➕ 建立帳號（教師/學生/家長）</b>'+
'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center">'+
'<select id="nuRole" style="width:auto" onchange="nuRoleChange(this)"><option value="teacher">👩‍🏫 教師</option><option value="student">👤 學生</option><option value="parent">👨‍👩‍👧 家長</option></select>'+
'<input id="nuName" placeholder="姓名" style="width:120px">'+
'<input id="nuUser" placeholder="登入帳號" style="width:140px">'+
'<input id="nuPass" placeholder="登入密碼" style="width:130px">'+
'<span id="nuClsWrap" style="display:none">班級 <select id="nuCls" style="width:auto">'+clsOpts+'</select></span>'+
'<button class="btn teal" onclick="adminAddUser()">建立</button></div>'+
'<div style="font-size:11.5px;color:var(--mut);margin-top:6px">家長帳號建立後可於「➕ 連結孩子」送出查看要求，學生同意後方可查看其學習狀況（學生可隨時拒絕/撤銷）</div></div>'+
'<div style="margin-bottom:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><input id="uSearch" placeholder="🔍 搜尋姓名／帳號／身份／班級…" style="width:300px;max-width:100%" oninput="uRenderRows()"><button class="btn ghost mini" onclick="showUsersIndex()" title="伺服器主檔：列出所有帳號，帳號遺失時會自動復原">🗂️ 帳號主檔</button></div>'+
'<div class="tblWrap"><table><thead><tr><th>身份</th><th>姓名</th><th>帳號</th><th>密碼</th><th>班級</th><th>建立</th><th>操作</th></tr></thead><tbody id="uTbody"></tbody></table></div>';
uRenderRows();
}
