/* ════════════════════════════════════════════
   vSudoku 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vSudoku
   ════════════════════════════════════════════ */
function vSudoku(){
  $('#view').innerHTML=back()+'<h3 class="vt">🧩 數獨排位 <span class="vsub">9×9 競速・py 出題</span></h3>'+
  '<div class="panel2" style="margin-bottom:10px;font-size:13px;color:var(--mut);line-height:1.8;border-left:4px solid var(--gold)">🧩 伺服器（Python）每 4 小時出一道唯一解的數獨，所有人解<b style="color:var(--gold2)">同一張</b>，比誰先完成！<br>⏱ 同場競速排行榜＋個人最佳時間都會記錄。</div>'+
  '<div id="sdBody"><div style="text-align:center;padding:40px"><div style="font-size:40px;animation:bob 1s infinite">🧩</div><p style="color:var(--mut);margin-top:10px">正在載入題目...</p></div></div>';
  sdLoad();
}
