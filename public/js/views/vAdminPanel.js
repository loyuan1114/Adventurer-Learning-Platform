/* ════════════════════════════════════════════
   vAdminPanel 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vAdminPanel, adminSystemBackup
   ════════════════════════════════════════════ */
async function vAdminPanel(){
  if (!(typeof IS_ADMIN==='function'&&IS_ADMIN())) return toast('⚠️ 僅管理員可進入', 'bad');
  const sys = get('ADV9_SYS_SETTINGS', { max_level: 300, free_point_single_limit: 300, festival_mode: false });

  let serverUsers = get(LS.users,[]);
  try {
    const r = await fetch(SUPA_URL+'/rest/v1/admin/users_index',{headers:supaHeaders()});
    if (r.ok) { const d = await r.json(); if(d.index && d.index.length){ serverUsers = d.index; set(LS.users, serverUsers); } }
  } catch(e) {}

  let html = back() + '<h3 class="vt">👑 管理員系統控制台 <span class="vsub">參數設定・貨幣發放・備份還原</span></h3>';

  html += '<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2);font-size:15px">⚙️ 系統參數設定</b>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px">';
  html += '<div><label style="font-size:12px;color:var(--mut)">角色最高等級上限：</label><input id="admMaxLvlInput" type="number" value="' + (sys.max_level||300) + '"></div>';
  html += '<div><label style="font-size:12px;color:var(--mut)">自由屬性點單項上限：</label><input id="admSingleCapInput" type="number" value="' + (sys.free_point_single_limit||300) + '"></div>';
  html += '</div>';
  html += '<div style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">';
  html += '<button class="btn mini" onclick="saveAdminSysSettings()">💾 儲存系統參數</button>';
  html += '<label style="font-size:12px;color:var(--gold2);margin-left:12px"><input type="checkbox" id="admFestivalCheck" ' + (sys.festival_mode?'checked':'') + ' onchange="toggleFestivalMode(this.checked)"> 🎉 開啟節日雙倍歡樂模式</label>';
  html += '</div></div>';

  html += '<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2);font-size:15px">👑 管理員直接贈送 ∞ 神階</b>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px">';
  html += '<select id="admGrantUser">';
  serverUsers.forEach(u => { html += '<option value="' + (u.id||u.username) + '">' + esc(u.name||u.username) + ' (' + u.username + ')</option>'; });
  html += '</select>';
  html += '<select id="admGrantAttr">';
  REROLL_ATTRS.forEach(a => { html += '<option value="' + a.id + '">' + a.icon + ' ' + a.name + '</option>'; });
  html += '</select>';
  html += '<button class="btn mini" onclick="adminGrantInfinity()">👑 贈送 ∞</button>';
  html += '</div>';
  html += '<input id="admGrantReason" placeholder="請輸入發放原因 (備查)..." style="margin-top:6px">';
  html += '</div>';

  html += '<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2);font-size:15px">🎁 生成與管理禮包碼</b>';
  html += '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">';
  html += '<input id="admCodeInput" placeholder="禮包碼 (如: WELCOME2026)">';
  html += '<input id="admCodeCoins" type="number" placeholder="星辰幣" style="width:100px">';
  html += '<input id="admCodeGems" type="number" placeholder="寶石" style="width:100px">';
  html += '<button class="btn mini" onclick="adminCreateCode()">➕ 生成禮包碼</button>';
  html += '</div></div>';

  html += '<div class="panel2"><b style="color:var(--gold2);font-size:15px">💾 資料匯入/匯出與備份還原</b>';
  html += '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">';
  html += '<button class="btn mini ghost" onclick="adminExportUserJSON()">📥 匯出個人 JSON</button>';
  html += '<label class="btn mini ghost">📤 匯入個人 JSON<input type="file" accept=".json" style="display:none" onchange="adminImportUserJSON(this)"></label>';
  html += '<button class="btn mini teal" onclick="adminSystemBackup()">📦 全系統備份下載</button>';
  html += '<label class="btn mini danger">⚠️ 全系統還原<input type="file" accept=".json" style="display:none" onchange="adminSystemRestore(this)"></label>';
  html += '</div></div>';

  html += '<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2);font-size:15px">📄 作業檔案匯入</b>';
  html += '<div style="margin-top:8px;font-size:12px;color:var(--mut)">支援 .docx / .txt 檔案，解析後回傳純文字內容供出題使用。</div>';
  html += '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;align-items:center">';
  html += '<label class="btn mini teal">📂 選擇作業檔案<input type="file" accept=".docx,.txt" style="display:none" id="hwFileInput" onchange="adminParseHomeworkFile(this)"></label>';
  html += '<span id="hwFileName" style="font-size:12px;color:var(--mut)"></span>';
  html += '</div>';
  html += '<div id="hwParseResult" style="margin-top:8px;max-height:300px;overflow:auto;display:none"></div>';
  html += '</div>';

  $('#view').innerHTML = html;
}

function adminSystemBackup(){
  window.location.href = '/rest/v1/system_backup';
}

async function adminParseHomeworkFile(input){
  var file=input.files[0];
  if(!file)return;
  var nameEl=document.getElementById('hwFileName');
  var resultEl=document.getElementById('hwParseResult');
  nameEl.textContent=file.name+' ('+(file.size/1024).toFixed(1)+' KB)';
  resultEl.style.display='block';
  resultEl.innerHTML='<span style="color:var(--mut)">⏳ 解析中...</span>';
  try{
    var fd=new FormData();
    fd.append('file',file);
    var r=await fetch(SUPA_URL+'/rest/v1/homework/parse_file',{method:'POST',headers:{'x-adv9-token':getToken()},body:fd});
    var j=await r.json();
    if(j.ok){
      resultEl.innerHTML='<div style="margin-bottom:6px;font-size:12px;color:var(--gold2)">✅ 解析成功 ('+j.content.length+' 字元)</div>'
        +'<textarea readonly style="width:100%;height:250px;font-size:13px;padding:8px;border:1px solid #444;border-radius:6px;background:#1a1a2e;color:#eee;resize:vertical">'+esc(j.content)+'</textarea>'
        +'<div style="margin-top:6px"><button class="btn mini teal" onclick="navigator.clipboard.writeText(document.querySelector(\'#hwParseResult textarea\').value);toast(\'✅ 已複製\')">📋 複製內容</button></div>';
    }else{
      resultEl.innerHTML='<span style="color:#e74c3c">❌ '+esc(j.msg||'解析失敗')+'</span>';
    }
  }catch(e){
    resultEl.innerHTML='<span style="color:#e74c3c">❌ 網路錯誤: '+esc(e.message)+'</span>';
  }
  input.value='';
}
