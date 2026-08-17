/* ════════════════════════════════════════════
   vClassWar 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vClassWar
   ════════════════════════════════════════════ */
function vClassWar(){
  $('#view').innerHTML=back()+'<h3 class="vt">⚔️ 班級戰 <span class="vsub">全班總答題數＋在線時間競賽</span></h3>'+
  '<div class="panel2" style="margin-bottom:10px;font-size:13px;color:var(--mut);line-height:1.8;border-left:4px solid var(--teal)">🏆 各班累計「總答題數」與「上線時間（分鐘）」即時排名，全班一起努力就能衝第一！<br>⏱ 答題數每題 +1；上線時間由心跳自動累計。每 30 秒自動更新。</div>'+
  '<div id="cwBody"><div style="text-align:center;padding:40px"><div style="font-size:40px;animation:bob 1s infinite">⚔️</div><p style="color:var(--mut);margin-top:10px">正在統計...</p></div></div>';
  cwLoad();
  if(CW_STATE.timer)clearInterval(CW_STATE.timer);
  CW_STATE.timer=setInterval(cwLoad,30000);
}
