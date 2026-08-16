/* ════════════════════════════════════════════
   vResetAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vResetAdmin
   ════════════════════════════════════════════ */
function vResetAdmin(){$('#view').innerHTML='<h3 class="vt">🔄 重置系統</h3>'+

'<div class="panel2" style="margin-bottom:12px"><b>🔄 重置為預設資料</b><p style="color:var(--mut);font-size:13px;margin:6px 0 12px">將所有數據恢復為系統預設值。</p>'+

'<button class="btn" onclick="resetDefault()">🔄 重置為預設資料</button></div>'+

'<div class="panel2" style="border-color:#6e2a2d"><b style="color:#ff8a80">⚠️ 清除所有數據</b><p style="color:var(--mut);font-size:13px;margin:6px 0 12px">完全清空所有資料並登出。此操作無法復原！</p>'+

'<button class="btn danger" onclick="wipeAll()">⚠️ 清除所有數據</button></div>'}
