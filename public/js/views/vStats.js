/* ════════════════════════════════════════════
   vStats 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vStats
   ════════════════════════════════════════════ */
function vStats(){

const g=me().g;

const acc=g.stats.total?Math.round(g.stats.correct/g.stats.total*100):0;

let best='—',bestN=0;for(const s in g.stats.subj)if(g.stats.subj[s]>bestN){bestN=g.stats.subj[s];best=s}

$('#view').innerHTML=back()+'<h3 class="vt">📊 統計報表</h3>'+

'<div class="statGrid">'+

st('📝 總答題',g.stats.total)+st('✅ 答對',g.stats.correct)+st('🎯 正確率',acc+'%')+st('🔥 ���高連擊',g.stats.maxCombo)+

st('📈 等級',g.lv)+st('⚡ 戰力',power(g))+st('🏟️ PK勝',g.pk.win)+st('⚒️ 鍛造',g.forgeCount)+

st('🗺️ 領土',Object.keys(g.territory.owned).length)+st('🏟️ 競技塔',g.arena.best||1)+'</div>'+

'<div class="panel2" style="margin:12px 0"><b style="font-family:var(--serif);color:var(--gold2)">📈 五維能力圖</b><div style="margin-top:10px">'+

['數學','英文','國文','自然','社會'].map(s=>{const v=Math.min(100,Math.max(5,Math.round((g.stats.subj[s]||0)/Math.max(1,g.stats.total/5)*100)));

return '<div class="abRow"><span style="width:70px;font-size:12.5px;color:'+SUBJ[s].c+'">'+SUBJ[s].i+' '+s+'</span><div class="bar"><i style="width:'+v+'%;background:'+SUBJ[s].c+'"></i></div><b style="font-size:12px;width:30px;text-align:right">'+v+'</b></div>'}).join('')+'</div></div>'+

'<div class="panel2"><b style="font-family:var(--serif);color:var(--gold2)">📋 本週報告</b><div style="font-size:13px;line-height:2;margin-top:6px">'+

'答題：'+g.stats.total+'｜正確率：'+acc+'%｜最高連擊：'+g.stats.maxCombo+'<br>PK：'+g.pk.win+'/'+(g.pk.win+g.pk.lose)+'｜鍛造：'+g.forgeCount+' 次｜實驗：'+g.lab.length+' 個｜競技塔：第'+(g.arena.best||1)+'層<br>'+

'最強科目：'+(best==='—'?'—':(SUBJ[best]?SUBJ[best].i:'')+' '+best)+'</div></div>';

}
