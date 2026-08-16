/* ════════════════════════════════════════════
   vChatV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vChatV
   ════════════════════════════════════════════ */
function vChatV(){

const ch=get(LS.chat,[]);

$('#view').innerHTML=back()+'<h3 class="vt">💬 世界頻道 <span class="vsub">公開聊天｜所有人可見</span></h3>'+

'<div class="chatBox" id="chatBox">'+(ch.slice(-50).map(chatRow).join('')||'<p class="empty">還沒有訊息</p>')+'</div>'+

'<div style="display:flex;gap:8px;margin-top:10px"><input id="chatIn" placeholder="說點什麼..." onkeydown="if(event.key===\'Enter\')sendChat()"><button class="btn" onclick="sendChat()">發送</button></div>';

const b=$('#chatBox');b.scrollTop=b.scrollHeight;

}
