/* ════════════════════════════════════════════
   vRegStu 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRegStu
   ════════════════════════════════════════════ */
function vRegStu(){const u=me();if(!u)return;const classes=get(LS.classes,{ids:[],names:{}});const classOpts=classes.ids.map(id=>'<option value="'+id+'">'+(classes.names[id]||id)+'</option>').join('');$('#view').innerHTML='<h3 class="vt">📝 學生註冊</h3><span class="vsub">單筆新增或 TXT 批次匯入學生帳號</span>'+
'<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;margin-top:15px">'+
'<div class="panel2" style="flex:1;min-width:300px;max-width:400px"><b style="color:var(--gold2)">➕ 單筆新增</b><label class="mlab" style="margin-top:10px">帳號<input id="regStuUser" style="width:100%;margin-top:4px" placeholder="學生登入帳號"></label><label class="mlab" style="margin-top:10px">密碼<input id="regStuPass" type="password" style="width:100%;margin-top:4px" placeholder="登入密碼"></label><label class="mlab" style="margin-top:10px">姓名<input id="regStuName" style="width:100%;margin-top:4px" placeholder="學生姓名"></label><label class="mlab" style="margin-top:10px">班級<select id="regStuClass" style="width:100%;margin-top:4px">'+classOpts+'</select></label><button class="btn teal" style="margin-top:15px;width:100%" onclick="doRegStu()">註冊學生</button></div>'+
'<div class="panel2" style="flex:1.4;min-width:340px"><b style="color:var(--gold2)">📄 TXT 批次匯入（每列：名字 班級 座號 密碼，密碼即學號=登入帳號）</b>'+
'<div style="font-size:12px;color:var(--mut);margin:6px 0;line-height:1.8">範例：<br><code style="color:var(--teal)">王小明 801班 15 S112001<br>張美麗 801班 02 S112002</code><br>班級不存在時自動建立並納入您的管理班級</div>'+
'<input type="file" accept=".txt" style="margin-bottom:8px;font-size:12px" onchange="impStuFile(this)">'+
'<textarea id="impStuTxt" rows="7" style="width:100%;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);padding:8px;font-size:13px" placeholder="貼上或選擇 TXT 檔…每列一筆：名字 班級 座號 密碼"></textarea>'+
'<button class="btn teal" style="margin-top:10px;width:100%" onclick="doImportStu()">📥 批次匯入</button><div id="impStuLog" style="font-size:12px;margin-top:8px;line-height:1.8"></div></div>'+
'</div>'}
