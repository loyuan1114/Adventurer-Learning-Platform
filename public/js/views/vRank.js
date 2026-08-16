/* ════════════════════════════════════════════
   vRank 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vRank
   ════════════════════════════════════════════ */
function vRank(){

const g=me().g,d=today();

const RB=['答題','等級','連擊','收藏','戰力'];

const st=RB.map(b=>{const e=lb(g,b).find(x=>x.me);const r=e?e.rank:99;return{b,r,ok:r<=3}});

$('#view').innerHTML=back()+'<h3 class="vt">🏆 排行榜 <span class="vsub">5 個榜單各自前 3 名每日發獎（分開計算）</span></h3>'+

'<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2);font-family:var(--serif)">🎁 每日排名獎勵</b> <span style="font-size:11.5px;color:var(--mut)">🥇 💎20+🪙1000+💠300+✨10+🏅10｜🥈 💎12+🪙600+💠180+✨6+🏅6｜🥉 💎8+🪙400+💠120+✨4+🏅4</span>'+

'<div style="font-size:12.5px;color:var(--teal);margin-top:8px;border-top:1px solid var(--line);padding-top:8px">🕒 <b>每晚 21:00 自動結算</b>，前 3 名獎勵直接寄到【社群中心 → 📩 信箱】，不用手動領取。<button class="btn ghost mini" style="margin-left:6px" onclick="vSocial(\'mail\')">📩 前往信箱</button></div>'+

'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">'+st.map(x=>'<span style="font-size:11.5px;padding:3px 10px;border-radius:99px;border:1px solid '+(x.ok?'var(--gold)':'var(--line)')+';color:'+(x.ok?'var(--gold2)':'var(--mut)')+'">'+x.b+'：第 '+(x.r>50?'—':x.r)+' 名'+(x.ok?' 🏆前3':'')+'</span>').join('')+'</div></div>'+

'<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'+RB.map((b,i)=>'<button class="btn '+(i?'ghost':'')+' mini" onclick="lbGo(\''+b+'\',this)">'+b+'</button>').join('')+'</div>'+

'<div id="lbBox"></div>';

lbGo('答題');

}
