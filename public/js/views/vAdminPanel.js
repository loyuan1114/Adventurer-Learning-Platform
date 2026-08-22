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
   html += '<div style="margin-top:8px;font-size:12px;color:var(--mut)">推薦使用 <b>.txt</b>（Word 請另存新檔為純文字）。每題固定 6 行：第 1 行題目、第 2-5 行四個選項、第 6 行正確答案（可填 a/b/c/d、1-4 或選項全文）。</div>';
   html += '<pre style="margin-top:6px;padding:8px;background:#12121f;border:1px solid #333;border-radius:6px;font-size:12px;color:#9fd;line-height:1.8">範例（每題 6 行）：\n題目：下列哪一個是質數？\na. 4\nb. 6\nc. 7\nd. 9\n答案：c\n\n題目：水的化學式為何？\na. CO2\nb. H2O\nc. NaCl\nd. O2\n答案：b</pre>';
  html += '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;align-items:center">';
  html += '<label class="btn mini teal">📂 選擇作業檔案<input type="file" accept=".docx,.txt" style="display:none" id="hwFileInput" onchange="adminParseHomeworkFile(this)"></label>';
  html += '<span id="hwFileName" style="font-size:12px;color:var(--mut)"></span>';
  html += '</div>';
  html += '<div id="hwParseResult" style="margin-top:8px;max-height:360px;overflow:auto;display:none"></div>';
  html += '</div>';

  $('#view').innerHTML = html;
}

function adminSystemBackup(){
  window.location.href = '/rest/v1/system_backup';
}

/* 6 行一題格式解析：回傳 {ok,questions:[{q,options,answer,line}]} 或 {ok:false,errors:[{line,message}]} */
function parseQuizText(text){
  function stripQ(s){s=s.trim();if(s.length>=2&&s[0]==='"'&&s[s.length-1]==='"')return s.slice(1,-1)}
  var lines=[];(text||'').replace(/^\uFEFF/,'').split(/\r?\n/).forEach(function(l,i){var t=stripQ(l);if(t.trim())lines.push({n:i+1,s:t.trim()})});
  var qs=[],errs=[],i=0;
  function ansIdx(a,opts){a=a.trim();if(/^[a-dA-D]$/.test(a))return 'ABCD'.indexOf(a.toUpperCase());if(/^[1-4]$/.test(a))return +a-1;for(var k=0;k<4;k++){if(opts[k]===a)return k}return -1}
  while(i+5<lines.length||((lines.length-i)%6&&i<lines.length)){
    if(lines.length-i<6){errs.push({line:lines[i].n,message:'題目區塊不足 6 行（剩 '+(lines.length-i)+' 行）'});break}
    var b=lines.slice(i,i+6);
    if(!b[0].s)errs.push({line:b[0].n,message:'題目為空'});
    else if(!b[1].s||!b[2].s||!b[3].s||!b[4].s)errs.push({line:b[0].n,message:'選項不可為空'});
    else{var ai=ansIdx(b[5].s,[b[1].s,b[2].s,b[3].s,b[4].s]);
      if(ai<0)errs.push({line:b[5].n,message:'無法辨識答案：'+b[5].s+'（可用 a/b/c/d、1-4 或選項全文）'});
      else qs.push({q:b[0].s,options:[b[1].s,b[2].s,b[3].s,b[4].s],answer:ai,line:b[0].n})}
    i+=6;
  }
  return errs.length?{ok:false,errors:errs}:{ok:true,questions:qs};
}
window.parseQuizText=parseQuizText;
/* 將有效題目加入作業草稿（PUB.qs，同老師「發布作業」格式 {'題目','選項','答案'}）*/
function adminImportParsedQs(){
  var res=window._hwParsed;if(!res||!res.ok||!res.questions.length)return toast('⚠️ 沒有可匯入的題目','bad');
  try{
    if(typeof PUB==='undefined'||!PUB)PUB={qs:[],pdf:null};
    res.questions.forEach(function(q){PUB.qs.push({'題目':q.q,'選項':q.options,'答案':q.answer,'解析':'（檔案匯入）',id:(typeof newQid==='function'?newQid():'q'+Date.now()+Math.random().toString(36).slice(2,7))})});
    if(typeof renderPubQs==='function')try{renderPubQs()}catch(e){}
    toast('✅ 已匯入 '+res.questions.length+' 題至作業草稿');
    if(typeof tGo==='function')try{tGo('pub')}catch(e){}
  }catch(e){toast('⚠️ 匯入失敗：'+e.message,'bad')}
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
    var r=await fetch(SUPA_URL+'/rest/v1/homework/parse_file',{method:'POST',headers:{'x-adv9-token':WTOKEN||''},body:fd});
    var j=await r.json();
    if(j.ok){
      var res=parseQuizText(j.content);window._hwParsed=res;
      var h='<div style="margin-bottom:6px;font-size:12px;color:var(--gold2)">✅ 解析成功 ('+j.content.length+' 字元)</div>';
      if(res.ok){
        h+='<div style="font-size:12px;margin-bottom:6px">共 '+res.questions.length+' 題</div>';
        h+=res.questions.map(function(q,i){return '<div class="panel2" style="margin-bottom:4px;padding:6px;font-size:12.5px"><b>'+(i+1)+'.</b> '+esc(q.q)+'<br><span style="color:var(--mut)">A. '+esc(q.options[0])+'　B. '+esc(q.options[1])+'　C. '+esc(q.options[2])+'　D. '+esc(q.options[3])+'</span><br><span style="color:var(--teal)">✔ 答案：'+esc(q.options[q.answer])+'</span></div>'}).join('');
        h+='<button class="btn mini teal" onclick="adminImportParsedQs()">📥 匯入 '+res.questions.length+' 題</button> ';
      }else{
        h+='<div style="color:#e74c3c;font-size:12.5px">'+res.errors.map(function(e){return '第 '+e.line+' 行：'+esc(e.message)}).join('<br>')+'</div>';
      }
      h+='<details style="margin-top:6px"><summary style="font-size:12px;color:var(--mut);cursor:pointer">原始文字</summary><textarea readonly style="width:100%;height:180px;font-size:13px;padding:8px;border:1px solid #444;border-radius:6px;background:#1a1a2e;color:#eee;resize:vertical">'+esc(j.content)+'</textarea></details>';
      h+='<button class="btn mini ghost" style="margin-top:6px" onclick="navigator.clipboard.writeText(window._hwRawText);toast(\'✅ 已複製\')">📋 複製內容</button>';
      window._hwRawText=j.content;
      resultEl.innerHTML=h;
    }else{
      resultEl.innerHTML='<span style="color:#e74c3c">❌ '+esc(j.msg||'解析失敗')+'</span>';
    }
  }catch(e){
    resultEl.innerHTML='<span style="color:#e74c3c">❌ 網路錯誤: '+esc(e.message)+'</span>';
  }
  input.value='';
}
