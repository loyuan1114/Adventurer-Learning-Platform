/* ════════════════════════════════════════════
   vPkRank 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPkRank
   ════════════════════════════════════════════ */
function vPkRank(){

const us=get(LS.users,[]).filter(x=>x.role==='student'&&x.g);

const arr=us.map(x=>({n:x.name,best:x.g.arena.best||1,win:x.g.pk.win,me:x.id===me().id})).sort((a,b)=>b.best-a.best||b.win-a.win);

const med=['🥇','🥈','🥉'];

openModal('<h3 class="mt">🏆 競技塔排名（歷史最佳層數）</h3>'+

(arr.map((e,i)=>'<div class="panel2 rankIt'+(i===0?' top0':'')+'" '+(e.me?'style="border-color:var(--gold)"':'')+'>'+

'<span class="rMed">'+(med[i]||'🎖')+'</span><b class="rName" '+(e.me?'style="color:var(--gold2)"':'')+'>'+esc(e.n)+'</b>'+

'<span class="rLv">第'+e.best+'層</span><span class="rXp">'+e.win+'勝</span></div>').join('')||'<p class="empty">尚無玩家</p>')+

'<div class="mBtns"><button class="btn" onclick="closeModal()">確定</button></div>');

}
