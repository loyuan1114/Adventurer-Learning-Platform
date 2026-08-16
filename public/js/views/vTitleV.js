/* ════════════════════════════════════════════
   vTitleV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTitleV
   ════════════════════════════════════════════ */
function vTitleV(){

const g=me().g;

$('#view').innerHTML=back()+'<h3 class="vt">🎖 稱號與成就 <span class="vsub">稱號可配戴，提供屬性加成</span></h3>'+

'<div class="semT">✅ 已解鎖稱號（點擊配戴）</div>'+

g.titles.map(id=>{const t=TITLES.find(x=>x.id===id);if(!t)return'';const on=g.equippedTitle===id;

return '<button class="unitRow" style="color:'+(on?'var(--gold2)':'var(--txt)')+'" onclick="setTitle(\''+id+'\')">'+(on?'👑 ':'')+t.n+'｜'+t.d+(Object.keys(t.bonus).length?'｜加成：'+JSON.stringify(t.bonus):'')+'</button>'}).join('')+

'<div class="semT">🔒 未解鎖稱號</div>'+

TITLES.filter(t=>!g.titles.includes(t.id)).map(t=>'<div class="unitRow" style="color:var(--mut);cursor:default">🔒 '+t.n+'｜'+t.d+'</div>').join('')+

'<div class="semT">🏅 多階段成就</div>'+

ACH.map(a=>{const p=a.prog(g);const claimed=g.ach[a.id]||0;

return '<div class="panel2" style="margin-bottom:8px"><b style="font-size:14px">'+a.n+'</b> <span style="font-size:11.5px;color:var(--mut)">進度 '+p+'</span>'+

'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">'+a.stages.map((s,i)=>{

const done=i<claimed,cur=i===claimed&&p>=s.g;

return '<span style="font-size:11px;padding:3px 9px;border-radius:99px;border:1px solid '+(done?'var(--green)':cur?'var(--gold)':'var(--line)')+';color:'+(done?'var(--green)':cur?'var(--gold2)':'var(--mut)')+'">'+(done?'✅':'')+' 階段'+(i+1)+'（'+s.g+'）'+(cur?' 可領':'')+'</span>'}).join('')+'</div>'+

(claimed<a.stages.length&&p>=a.stages[claimed].g?'<button class="btn mini" style="margin-top:6px" onclick="claimAch(\''+a.id+'\')">領取階段 '+(claimed+1)+'</button>':'')+

'</div>'}).join('');

}
