/* ════════════════════════════════════════════
   vGames 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGames
   ════════════════════════════════════════════ */
function vGames(){
gameStop();
const playable=GAME_LIST.filter(x=>x.play);
$('#view').innerHTML=back()+'<h3 class="vt">🎮 遊戲中心 <span class="vsub">5 款經典小遊戲｜結算發 🪙/✨ 獎勵</span></h3>'+
'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin-bottom:16px">'+
playable.map(x=>'<div class="panel2" style="text-align:center;cursor:pointer" onclick="'+x.play+'"><div style="font-size:38px">'+x.i+'</div><b style="color:var(--gold2)">'+x.n+'</b><div style="font-size:11.5px;color:var(--mut);margin:4px 0">'+x.t+'</div><button class="btn mini">▶️ 開始遊戲</button></div>').join('')+'</div>'+
'<div class="semT">⚔️ 好友遊戲 PK（雙人對戰）</div>'+duelPanel();
}
