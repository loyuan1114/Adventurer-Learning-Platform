/* ════════════════════════════════════════════
   vMonitor 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMonitor
   ════════════════════════════════════════════ */
function vMonitor(){

const ch=get(LS.chat,[]);

$('#view').innerHTML='<h3 class="vt">🔍 聊天監控 <span class="vsub">共 '+ch.length+' 則</span></h3>'+

'<div class="panel2" style="margin-bottom:12px;font-size:12.5px;border-left:4px solid var(--teal);color:var(--mut)">🔒 <b style="color:var(--teal)">隱私保護：</b>此處僅顯示「世界頻道」公開訊息。學生的<b>好友私聊</b>與<b>群組聊天</b>受隱私保護，老師與管理員<b>無法查看</b>。</div>'+

'<div class="chatBox" style="height:380px">'+(ch.map(chatRow).join('')||'<p class="empty">尚無對話</p>')+'</div>';

}
