/* ════════════════════════════════════════════
   vUsers 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vUsers
   ════════════════════════════════════════════ */
function vUsers(){
const classes=get(LS.classes,{ids:[],names:{}});
const clsIds=Array.isArray(classes.ids)?classes.ids:[];
const clsNames=(classes.names&&typeof classes.names==='object')?classes.names:{};
const clsOpts=clsIds.map(id=>'<option value="'+id+'">'+(clsNames[id]||id)+'</option>').join('');
const us=get(LS.users,[]);
$('#view').innerHTML='<h3 class="vt">👥 所有用戶 <span class="vsub">共 <b id="uCount">'+us.length+'</b> 人</span></h3>'+
'<div class="panel2" style="margin-bottom:14px"><b style="color:var(--gold2)">➕ 建立帳號（教師/學生/家長）</b>'+
'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center">'+
'<select id="nuRole" style="width:auto" onchange="nuRoleChange(this)"><option value="teacher">👩‍🏫 教師</option><option value="student">👤 學生</option><option value="parent">👨‍👩‍👧 家長</option></select>'+
'<input id="nuName" placeholder="姓名" style="width:120px">'+
'<input id="nuUser" placeholder="登入帳號" style="width:140px">'+
'<input id="nuPass" placeholder="登入密碼" style="width:130px">'+
'<span id="nuClsWrap" style="display:none">班級 <select id="nuCls" style="width:auto">'+clsOpts+'</select></span>'+
'<button class="btn teal" onclick="adminAddUser()">單筆建立</button>'+
'<button class="btn gold mini" onclick="openBulkCreate()">📋 批量建立</button></div>'+
'<div style="font-size:11.5px;color:var(--mut);margin-top:6px">家長帳號建立後可於「➕ 連結孩子」送出查看要求，學生同意後方可查看其學習狀況（學生可隨時拒絕/撤銷）</div></div>'+
'<div style="margin-bottom:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><input id="uSearch" placeholder="🔍 搜尋姓名／帳號／身份／班級…" style="width:300px;max-width:100%" oninput="uRenderRows()"><button class="btn ghost mini" onclick="showUsersIndex()" title="伺服器主檔：列出所有帳號，帳號遺失時會自動復原">🗂️ 帳號主檔</button></div>'+
'<div class="tblWrap"><table><thead><tr><th>身份</th><th>姓名</th><th>帳號</th><th>密碼</th><th>班級</th><th>建立</th><th>操作</th></tr></thead><tbody id="uTbody"></tbody></table></div>';
uRenderRows();
}

function openBulkCreate(){
  const classes=get(LS.classes,{ids:[],names:{}});
  const clsIds=Array.isArray(classes.ids)?classes.ids:[];
  const clsNames=(classes.names&&typeof classes.names==='object')?classes.names:{};
  
  let html='<h3 class="mt">📋 批量建立帳號</h3>'+
  '<div style="font-size:11.5px;color:var(--mut);margin-bottom:8px;line-height:1.6">'+
  '<b>格式（每列一筆，空白分隔，密碼即學號=登入帳號）：</b><br>'+
  '👩‍🏫 老師：姓名 班級 座號 密碼 密碼即學號=登入帳號<br>'+
  '👤 學生：姓名 班級 座號 密碼 密碼即學號=登入帳號（無班級則自動建立）<br>'+
  '👨‍👩‍👧 家長：姓名 登入帳號 登入密碼</div>'+
  '<div style="margin-top:8px"><label class="mlab">身分 <select id="bulkRole" onchange="bulkRoleChange(this)">'+
  '<option value="teacher">👩‍🏫 教師</option><option value="student">👤 學生</option><option value="parent">👨‍👩‍👧 家長</option></select></label></div>'+
  '<div style="margin-top:8px"><label class="mlab">班級選項（學生專用）<select id="bulkCls" style="width:auto" disabled>'+
  '<option value="">（學生無班級則自動建立）</option>' +
  Object.entries(classes.names).map(([id,name])=>'<option value="'+name+'">'+name+' ('+id+')</option>').join('') +
  '</select></label></div>'+
  '<div style="margin-top:10px;padding:10px;background:rgba(0,0,0,.2);border:1px dashed rgba(255,255,255,.2);border-radius:6px">'+
  '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'+
  '<label class="btn ghost mini" style="cursor:pointer">📄 上傳 TXT<input type="file" accept=".txt,.csv" onchange="bulkFileUp(this)" style="display:none"></label>'+
  '<label class="btn ghost mini" style="cursor:pointer">🖼️ 上傳圖片（OCR）<input type="file" accept="image/*" onchange="bulkImgUp(this)" style="display:none"></label>'+
  '<span id="bulkFileName" style="font-size:11px;color:var(--mut)"></span>'+
  '</div></div>'+
  '<label class="mlab">貼上或選擇 TXT 檔...<br>每列一筆：<b>姓名 班級 座號 密碼</b>，密碼即學號=登入帳號<textarea id="bulkText" rows="10" style="font-family:monospace;font-size:12px" placeholder="王小明 801班 01 S111201&#10;張美麗 801班 02 S111202"></textarea></label>'+
  '<div class="mBtns"><button class="btn ghost" onclick="closeModal()">取消</button><button class="btn teal" onclick="doBulkCreate()">🚀 批次匯入</button></div>';
  openModal(html);
  window._bulkClasses=classes;
}

function bulkFileUp(inp){
  const f=inp.files&&inp.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=function(e){
    const ta=document.getElementById('bulkText');
    if(ta){
      ta.value=e.target.result;
      document.getElementById('bulkFileName').textContent='✅ '+f.name+'（'+(e.target.result||'').split('\n').length+' 行）';
    }
  };
  rd.readAsText(f,'utf-8');
}

function bulkImgUp(inp){
  const f=inp.files&&inp.files[0];if(!f)return;
  document.getElementById('bulkFileName').textContent='⏳ OCR 辨識中... '+f.name;
  if(typeof Tesseract==='undefined'){
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    s.onload=function(){doOCR(f)};
    s.onerror=function(){
      document.getElementById('bulkFileName').textContent='❌ OCR 函式庫載入失敗，請改用 TXT 檔';
    };
    document.head.appendChild(s);
  }else{
    doOCR(f);
  }
}

async function doOCR(f){
  try{
    const result=await Tesseract.recognize(f,'chi_tra+eng',{logger:function(){}});
    const text=result.data.text||'';
    const ta=document.getElementById('bulkText');
    if(ta){
      ta.value=text;
      const lineCount=text.split('\n').filter(function(l){return l.trim()}).length;
      document.getElementById('bulkFileName').textContent='✅ '+f.name+' OCR 完成（'+lineCount+' 行），請檢查後送出';
    }
  }catch(e){
    document.getElementById('bulkFileName').textContent='❌ OCR 失敗：'+e.message;
  }
}

function bulkRoleChange(sel){
  const cls=document.getElementById('bulkCls');
  if(cls)cls.disabled=sel.value!=='student';
}

async function doBulkCreate(){
  const role=document.getElementById('bulkRole').value;
  const text=document.getElementById('bulkText').value.trim();
  if(!text)return toast('⚠️ 請貼上資料','bad');
  const btn=document.querySelector('#mbody .btn.teal');
  if(btn){btn.disabled=true;btn.textContent='⏳ 建立中...';}
  try{
    const r=await fetch('/rest/v1/admin/users/bulk_create',{method:'POST',headers:{'Content-Type':'application/json','x-adv9-token':WTOKEN},body:JSON.stringify({role:role,text:text})});
    const d=await r.json().catch(()=>({ok:false,reason:'回應解析失敗'}));
    if(d.ok){
      toast('✅ 批量建立完成：成功 '+d.created+' 筆，失敗 '+d.failed+' 筆');
      if(d.errors.length)toast('⚠️ 部分失敗：'+d.errors.slice(0,3).join('；'),'bad');
      closeModal();
      if(typeof vUsers==='function')vUsers();
    }else{
      toast('❌ '+d.reason,'bad');
    }
  }catch(e){toast('❌ 網路錯誤：'+e.message,'bad');}
  finally{if(btn){btn.disabled=false;btn.textContent='🚀 開始建立';}}
}
window.openBulkCreate=openBulkCreate;
window.bulkRoleChange=bulkRoleChange;
window.doBulkCreate=doBulkCreate;
