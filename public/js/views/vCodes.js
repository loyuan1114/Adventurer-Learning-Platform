/* ════════════════════════════════════════════
   vCodes 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vCodes
   ════════════════════════════════════════════ */
function vCodes(){

const g=me().g;

$('#view').innerHTML=back()+'<h3 class="vt">✨ 密碼與禮包兌換 <span class="vsub">系統自動辨識禮包碼／彩蛋密碼</span></h3>'+

'<div class="panel2" style="max-width:540px">'+

'<div style="display:flex;gap:8px"><input id="codeIn" placeholder="輸入禮包碼或彩蛋密碼..." style="text-transform:uppercase"><button class="btn" onclick="redeemAny()">兌換</button></div>'+

'<p style="margin-top:10px;color:var(--mut);font-size:12.5px">📌 禮包碼由管理員後台生成；彩蛋密碼隱藏在遊戲各處。</p>'+

'<p style="margin-top:6px;font-size:12px;color:var(--teal)">已領取的彩蛋：'+(g.eggs.length?g.eggs.join('、'):'無')+'</p></div>';

}
