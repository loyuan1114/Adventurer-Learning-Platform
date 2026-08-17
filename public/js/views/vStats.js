/* ════════════════════════════════════════════
   vStats 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vStats, langStatsHtml
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

'<div class="panel2" style="margin:12px 0"><b style="font-family:var(--serif);color:var(--gold2)">🌍 語言自學</b><div style="font-size:13px;line-height:2;margin-top:6px">'+

langStatsHtml(g)+'</div></div>'+

'<div class="panel2"><b style="font-family:var(--serif);color:var(--gold2)">📋 本週報告</b><div style="font-size:13px;line-height:2;margin-top:6px">'+

'答題：'+g.stats.total+'｜正確率：'+acc+'%｜最高連擊：'+g.stats.maxCombo+'<br>PK：'+g.pk.win+'/'+(g.pk.win+g.pk.lose)+'｜鍛造：'+g.forgeCount+' 次｜實驗：'+g.lab.length+' 個｜競技塔：第'+(g.arena.best||1)+'層<br>'+

'最強科目：'+(best==='—'?'—':(SUBJ[best]?SUBJ[best].i:'')+' '+best)+'</div></div>';

}

function langStatsHtml(g){
  const langs=(g.stats&&g.stats.lang)||{};
  const codes=Object.keys(langs);
  const langT=Object.values(langs).reduce((a,b)=>a+(b.t||0),0);
  const langC=Object.values(langs).reduce((a,b)=>a+(b.c||0),0);
  let h='答題：<b style="color:var(--teal)">'+langT+'</b> 題｜答對：'+langC+' 題｜正確率：'+(langT?(Math.round(langC/langT*100)):0)+'%<br>';
  if(!codes.length)h+='<span style="color:var(--mut)">還沒開始語言自學，去「🌍 語言自學」挑一個語言吧！</span>';
  else{
    codes.sort((a,b)=>(langs[b].t||0)-(langs[a].t||0));
    h+=codes.slice(0,12).map(c=>{
      const s=langs[c],t=s.t||0,cq=s.c||0;
      return '<div style="display:flex;align-items:center;gap:8px;margin-top:4px"><span style="width:110px;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(langName(c))+'</span><div class="bar" style="flex:1"><i style="width:'+Math.min(100,Math.round(t/Math.max(1,langT)*100))+'%;background:var(--teal)"></i></div><b style="font-size:12px;width:110px;text-align:right;color:'+(t?'var(--teal)':'var(--mut)')+'">'+t+' 題・'+cq+' 對</b></div>';
    }).join('');
    if(codes.length>12)h+='<div style="font-size:11.5px;color:var(--mut);margin-top:4px">…共 '+codes.length+' 種語言</div>';
  }
  return h;
}
