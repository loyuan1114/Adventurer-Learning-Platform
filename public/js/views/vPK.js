/* ════════════════════════════════════════════
   vPK 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPK
   ════════════════════════════════════════════ */
function vPK(){

const u=me(),g=u.g;

canPk(g);

const opp=arenaOpp(g.arena.floor);

const remain=Math.max(0,sysCfg().pkDaily+(g.pkExtra||0)-g.pk.today);

$('#view').innerHTML=back()+'<h3 class="vt">🏟️ PK 無限競技塔 <span class="vsub">⚡ '+power(g)+'｜'+g.pk.win+'勝 '+g.pk.lose+'敗｜今日剩 '+remain+' 場｜連勝 '+g.pk.streak+'</span></h3>'+

'<div class="panel2" style="margin-bottom:12px;border-left:4px solid var(--gold);display:flex;gap:16px;align-items:center;flex-wrap:wrap">'+

'<div style="font-size:40px">'+opp.i+'</div>'+

'<div style="flex:1;min-width:200px"><b style="font-family:var(--serif);font-size:17px;color:var(--gold2)">目前：第 '+g.arena.floor+' 層｜歷史最佳：第 '+g.arena.best+' 層</b>'+

'<div style="font-size:12.5px;color:var(--mut);margin-top:3px">對手：'+opp.n+'（Lv.'+opp.lv+'｜⚡'+opp.pw+'｜難度 '+arenaDiff(g.arena.floor)+'/100）</div>'+

'<div style="font-size:12.5px;color:var(--teal)">🔮 預測勝率：'+pkWinrate(g,opp.pw)+'%｜勝利→上層+獎勵｜每5層里程碑💎</div></div>'+

'<button class="btn" style="font-size:15px;padding:12px 22px" onclick="showPkBatch()">⚔️ 挑戰本層</button></div>'+

'<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'+

'<button class="btn ghost mini" onclick="spectate()">👀 觀戰模式</button>'+

'<button class="btn ghost mini" onclick="powerDetail()">📊 戰力明細</button>'+

'<button class="btn mini" onclick="usePotion()">🧪 戰力藥水（🪙200，+200，10分）</button>'+

'<button class="btn ghost mini" onclick="showFloorPicker()">🕰️ 歷史關卡重打</button>'+

'<button class="btn teal mini" onclick="vPkRank()">🏆 競技塔排名</button>'+
'<button class="btn teal mini" onclick="vClassPK()">🏫 班級總題數PK</button>'+(isWeekend()?'<button class="btn mini" style="background:linear-gradient(180deg,#ffd97a,#ff8a3d);border-color:#a4531c;color:#3a2703" onclick="vSpeedMatch()">⚡ 周末決鬥（比誰先答對）</button>':'<button class="btn ghost mini dis">⚡ 周末決鬥（限週六日）</button>')+'</div>'+

(()=>{const r=arenaRankOf(u.id);const got=g.arenaClaim===today();const RW={1:'🏅20+💎5+🪙150',2:'🏅12+💎3+🪙100',3:'🏅8+💎2+🪙60'};

return '<div class="panel2" style="margin-bottom:12px;border-left:4px solid var(--teal)"><b style="color:var(--gold2);font-family:var(--serif)">🎁 每日排名獎勵</b> <span style="font-size:11.5px;color:var(--mut)">🥇 '+RW[1]+'｜🥈 '+RW[2]+'｜🥉 '+RW[3]+'</span>'+

'<div style="font-size:12.5px;margin-top:6px;color:'+(r<=3?'var(--gold2)':'var(--mut)')+'">你目前排名：第 '+r+' 名'+(r<=3?(got?'｜✅ 今日已領取':'｜🎁 可領取！'):'｜進入前 3 名每日可領獎')+'</div>'+

(r<=3&&!got?'<button class="btn mini" style="margin-top:6px" onclick="claimArenaRank()">🎁 領取第 '+r+' 名獎勵</button>':'')+'</div>'})()+

'<div class="panel2"><b style="font-family:var(--serif);color:var(--gold2)">📜 競技塔規則</b><div style="font-size:12.5px;color:var(--mut);line-height:1.9;margin-top:5px">'+

'・關卡<b>無限</b>，每層對手越來越強（難度隨層數提升）<br>'+

'・勝利→晉升下一層＋獎勵（💠水晶 🪙金幣 🏅榮譽幣）；連勝加成<br>'+

'・每 5 層里程碑額外 💎鑽石；第20/50層解鎖專屬稱號<br>'+

'・失敗→停留原層，可無限重試<br>'+

'・每日挑戰次數 <b>'+sysCfg().pkDaily+' 場</b>（管理員可彈性調整）＋🏟️挑戰券補次數<br>'+

'・🕰️ 歷史關卡可自由重複挑戰，完整播放戰鬥與通關動畫（獎勵減半）<br>'+

'・排名以「歷史最佳層數」計算</div></div>';

}
