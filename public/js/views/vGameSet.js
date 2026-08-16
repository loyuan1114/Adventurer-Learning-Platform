/* ════════════════════════════════════════════
   vGameSet 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGameSet
   ════════════════════════════════════════════ */
function vGameSet(){

const c=sysCfg();

$('#view').innerHTML='<h3 class="vt">⚙️ 遊戲設定 <span class="vsub">PK 次數／任務數量彈性調整｜即時對全服生效</span></h3>'+

'<div class="panel2" style="max-width:480px;display:flex;flex-direction:column;gap:10px">'+

'<label class="mlab">🏟️ PK 競技塔每日挑戰次數<input id="gsPk" type="number" min="1" max="9999" value="'+c.pkDaily+'"></label>'+

'<label class="mlab">📜 每日任務數量（任務池共 '+MISSION_POOL.length+' 種）<input id="gsDm" type="number" min="1" max="'+MISSION_POOL.length+'" value="'+c.dailyMissions+'"></label>'+

'<label class="mlab">🗓️ 每週任務目標（累計進度）<input id="gsWk" type="number" min="1" max="99999" value="'+c.weeklyGoal+'"></label>'+

'<label style="font-size:13.5px;cursor:pointer"><input type="checkbox" id="gsTl" '+(c.timeLock?'checked':'')+' style="width:auto"> 🔓 啟用獎勵時間鎖（平日 6:00~22:00／週末 6:00~23:00 開放，全服統一）</label>'+

'<div><b style="color:var(--gold2);font-size:13.5px">🎯 難度模式（全服統一）</b><div style="display:flex;gap:14px;margin-top:6px">'+['精準','隨機'].map(m=>'<label style="font-size:13.5px;cursor:pointer"><input type="radio" name="gsDmode" value="'+m+'" '+(c.diffMode===m?'checked':'')+' style="width:auto"> '+m+(m==='隨機'?'（±10）':'')+'</label>').join('')+'</div></div>'+

'<button class="btn" onclick="saveGameSet()">💾 儲存設定</button></div>'+

'<div class="panel2" style="max-width:480px;margin-top:14px;border-left:4px solid var(--gold)"><b style="color:var(--gold2)">📅 年度升級（701→801→901→🎓畢業）</b>'+

'<div style="font-size:12px;color:var(--mut);margin:6px 0;line-height:1.8">每年 8/1 跨學年度時系統會<b>自動</b>執行；也可在此手動執行一次（學生班級+1、九年級畢業標記、班級清單與教師管理班級同步）</div>'+

'<button class="btn danger mini" onclick="if(confirm(\'確定手動執行年度升級？全部學生班級將 +1，九年級將標記畢業！\')){const r=runPromotion(1);toast(\'📅 升級完成：\'+r.promoted+\' 人升級，\'+r.grads+\' 人畢業\')}">📅 手動執行年度升級</button></div>'+

'<div class="panel2" style="max-width:480px;margin-top:14px;border-left:4px solid var(--red)"><b style="color:#ff7b72">⚠️ 重置全部數據（僅限管理員）</b>'+

'<div style="font-size:12px;color:var(--mut);margin:6px 0;line-height:1.8">將所有學生的遊戲進度（等級/貨幣/收藏/裝備…）重置為新帳號狀態，帳號與班級保留；學生/老師端無此功能</div>'+

'<button class="btn danger mini" onclick="adminResetAllG()">⚠️ 重置全部學生遊戲數據</button></div>';

}
