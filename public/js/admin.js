/* ════════════════════════════════════════════════════
   管理員面板（vAdminPanel 與管理/備份功能）
   由 tools/build/split.py 從 public/index.html 抽出（懶載入模組）
   ════════════════════════════════════════════════════ */
function vAdminPanel(){
  if (!window.IS_ADMIN) return toast('⚠️ 僅管理員可進入', 'bad');
  const sys = get('ADV9_SYS_SETTINGS', { max_level: 300, free_point_single_limit: 300, festival_mode: false });

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
  get(LS.users,[]).forEach(u => { html += '<option value="' + u.id + '">' + esc(u.name) + ' (' + u.username + ')</option>'; });
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

  $('#view').innerHTML = html;
}

function saveAdminSysSettings(){
  const maxLvl = Math.max(300, +$('#admMaxLvlInput').value || 300); /* 最低 300，不可調低 */
  const singleCap = +$('#admSingleCapInput').value || 300;
  const sys = get('ADV9_SYS_SETTINGS', {});
  sys.max_level = maxLvl;
  sys.free_point_single_limit = singleCap;
  set('ADV9_SYS_SETTINGS', sys);
  window.ADMIN_MAX_LEVEL = maxLvl;
  toast('✅ 系統參數已成功儲存！');
}

function toggleFestivalMode(on){
  const sys = get('ADV9_SYS_SETTINGS', {});
  sys.festival_mode = on;
  set('ADV9_SYS_SETTINGS', sys);
  toast(on ? '🎉 全校節日雙倍歡樂時間已開啟！' : '節日模式已關閉');
}

function adminGrantInfinity(){
  const uid = $('#admGrantUser').value;
  const attrId = $('#admGrantAttr').value;
  const reason = $('#admGrantReason').value.trim();
  if (!reason) return toast('⚠️ 請輸入發放原因', 'bad');

  const d = rerollGet();
  d.attr[attrId] = '∞';
  rerollSet(d);

  const logs = get('ADV9_ADMIN_OP_LOGS', []);
  logs.push({
    time: Date.now(),
    op: 'GRANT_INFINITY',
    target: uid,
    attr: attrId,
    reason: reason,
    operator: me().username
  });
  set('ADV9_ADMIN_OP_LOGS', logs);
  toast('👑 已成功贈送 ∞ 並寫入管理員日誌！');
}

function adminCreateCode(){
  const code = $('#admCodeInput').value.trim().toUpperCase();
  const coins = +$('#admCodeCoins').value || 0;
  const gems = +$('#admCodeGems').value || 0;
  if (!code) return toast('⚠️ 請輸入禮包碼', 'bad');

  const sys = get('ADV9_SYS_SETTINGS', { promo_codes: {} });
  sys.promo_codes = sys.promo_codes || {};
  sys.promo_codes[code] = { star_coins: coins, gems: gems, used: [] };
  set('ADV9_SYS_SETTINGS', sys);
  toast('🎁 禮包碼 [' + code + '] 生成成功！');
}

function adminExportUserJSON(){
  const u = me();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(u, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", u.role + "_" + u.username + ".json");
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
}

function adminImportUserJSON(input){
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    try {
      const j = JSON.parse(e.target.result);
      if (j && j.username) {
        saveU(j);
        toast('✅ 使用者資料匯入成功！');
      }
    } catch(err) { toast('⚠️ 無效的 JSON 檔案', 'bad'); }
  };
  reader.readAsText(file);
}

function adminSystemBackup(){
  window.location.href = '/rest/v1/system_backup';
}

function adminSystemRestore(input){
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    try {
      const j = JSON.parse(e.target.result);
      fetch('/rest/v1/system_restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-adv9-token': WTOKEN },
        body: JSON.stringify(j)
      }).then(r => r.json()).then(res => {
        if (res.ok) toast('✅ 全系統還原成功！');
      });
    } catch(err) { toast('⚠️ 還原失敗', 'bad'); }
  };
  reader.readAsText(file);
}
