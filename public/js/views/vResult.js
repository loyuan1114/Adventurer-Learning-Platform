/* ════════════════════════════════════════════
   vResult 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vResult
   ════════════════════════════════════════════ */
function vResult(ok,el,R){

const q=Quiz.q,L=['A','B','C','D'],g=me().g;

const eq=g.equip.character?CHARS[g.equip.character]:null;

const quote=eq?'<div class="quote">'+eq.icon+'：'+(ok?pick(['做得好！繼續保持！','太棒了！這題難不倒你！','漂亮！就是這個節奏！']):pick(['沒關係，失敗為成功之母！','別灰心，下次一定可以！','加油，你可以的！']))+'</div>':'';

const chips=['⏱ '+el+'s','🔥 '+g.combo+' 連擊'];

if(R.exp)chips.unshift('✨ +'+R.exp+' XP');

if(R.cr)chips.push('💠 +'+R.cr);if(R.au)chips.push('🪙 +'+R.au);if(R.dm)chips.push('💎 +'+R.dm);

if(R.drop)chips.push(R.drop.t);

const isTerr=Quiz.mode==='terr',isRetry=Quiz.mode==='retry';

$('#view').innerHTML=

'<div class="resBig" style="color:'+(ok?'var(--green)':'#ff7b72')+'">'+(ok?pick(['🎉','✨','🌟','💯','🔥'])+' 答對了！':pick(['😢','💦','🥲','😅'])+' 答錯...')+'</div>'+quote+R.extra+

'<div class="rwRow">'+chips.map(c=>'<span class="rwChip">'+c+'</span>').join('')+'</div>'+

(R.exp&&window._expCalc?'<div class="panel2" style="margin-bottom:10px;border-left:4px solid var(--gold);font-size:13.5px;color:var(--gold2)">📊 修煉數值明細：【基礎數值 '+window._expCalc.base+'】+【收藏與升星加成 +'+window._expCalc.pct+'%】=【最終修煉數值 '+window._expCalc.xp+' XP】</div>':'')+

'<div class="panel2"><b style="color:var(--green)">✅ 正確答案：('+L[q['答案']]+') '+esc(q['選項'][q['答案']])+'</b>'+

(!ok?'<div style="color:#ff7b72;font-size:13px;margin-top:5px">❌ 你的選擇：('+L[Quiz.sel]+') '+esc(q['選項'][Quiz.sel])+'</div>':'')+'</div>'+

'<div class="expl"><b style="color:var(--teal)">💡 解析</b><br>'+esc(q['解析'])+'</div>'+

'<div style="display:flex;gap:10px">'+

(isTerr?'<button class="btn big" onclick="qReset();vTerr()">🗺️ 返回領土</button>'

:isRetry?'<button class="btn big" onclick="qReset();vWrong()">❌ 返回錯題</button>'

:'<button class="btn big" onclick="startQuiz()">➡️ 下一題</button>')+

'<button class="btn ghost big" onclick="qReset();vHome()">🏠 回主選單</button></div>';

}
