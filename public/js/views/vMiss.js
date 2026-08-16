/* ════════════════════════════════════════════
   vMiss 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vMiss
   ════════════════════════════════════════════ */
function vMiss(){

const g=me().g,list=getMissions(g);

const claimable=list.filter(m=>m.status==='COMPLETED').length;

const wkly=getWeekly(g),goal=sysCfg().weeklyGoal;

const wPct=Math.min(100,wkly.n/goal*100);

$('#view').innerHTML=back()+'<h3 class="vt">📜 任務中心 <span class="vsub">每日 '+list.length+' 個任務｜全部完成 +3💎｜每日重置</span></h3>'+

'<div class="panel2" style="margin-bottom:12px;border-left:4px solid var(--teal)"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'+

'<b style="font-family:var(--serif);color:var(--teal)">🗓️ 每週任務：累計完成 '+goal+' 個任務進度</b>'+

'<b style="margin-left:auto;color:var(--gold2)">'+Math.min(wkly.n,goal)+'/'+goal+'</b>'+

(wkly.claimed?'<b style="color:var(--green)">已領取</b>':(wkly.n>=goal?'<button class="btn mini" onclick="claimWeekly()">🎁 領取週獎勵</button>':''))+'</div>'+

'<div class="bar qpb" style="margin-top:6px"><i style="width:'+wPct+'%"></i></div>'+

'<span style="font-size:11.5px;color:var(--mut)">週獎勵：💎20 🪙1000 ✨20｜每週一重置</span></div>'+

(claimable?'<button class="btn big" style="max-width:280px;margin-bottom:12px" onclick="claimAll()">🎁 一鍵領取所有獎勵（'+claimable+'）</button>':'')+

list.map(m=>{const done=m.status==='CLAIMED',comp=m.status==='COMPLETED';

return '<div class="panel2" style="display:flex;align-items:center;gap:12px;margin-bottom:9px;'+(done?'opacity:.55':'')+'">'+

'<span style="font-size:26px;flex:none">'+(done?'✅':comp?'🎁':'📌')+'</span><div style="flex:1;min-width:0"><b style="display:block;font-size:14px;color:'+(comp&&!done?'var(--green)':'var(--txt)')+'">'+m.n+'</b>'+

'<span style="font-size:11.5px;color:var(--mut)">獎勵：'+rwText(m.rw)+'</span>'+

'<div class="bar qpb" style="margin-top:5px"><i style="width:'+(m.p/m.g*100)+'%"></i></div></div><b style="color:var(--gold2)">'+m.p+'/'+m.g+'</b>'+

(comp&&!done?'<button class="btn mini" onclick="claimOne(\''+m.id+'\')">領取</button>':done?'<b style="color:var(--green)">已領取</b>':'')+'</div>'}).join('');

}
