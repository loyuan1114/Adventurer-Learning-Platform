/* ════════════════════════════════════════════
   vForge 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vForge
   ════════════════════════════════════════════ */
function vForge(){

const g=me().g;

$('#view').innerHTML=back()+'<h3 class="vt">⚒️ 裝備鍛造坊 <span class="vsub">⛏️鐵礦 '+g.ironOre+'｜✨星光碎片 '+g.starlight+'｜🧪實驗素材 '+g.labMat+'｜鍛造 '+g.forgeCount+' 次</span></h3>'+

'<div class="forgeAnvil" id="anvil">🔨⚒️</div>'+

'<p style="text-align:center;font-size:12px;color:var(--mut);margin-bottom:14px">消耗鐵礦、星光碎片與實驗素材，依配方機率鍛造出不同品質裝備（普通/優秀/精良/史詩/傳說）｜共 '+CFG.FORGE_RECIPES.length+' 種配方</p>'+

'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px">'+

CFG.FORGE_RECIPES.map(r=>{

const can=Object.keys(r.mats).every(k=>Number(g[k])>=Number(r.mats[k]));

return '<div class="panel2"><b style="font-family:var(--serif);color:var(--gold2)">'+r.name+' <span style="font-size:11px;color:var(--mut)">['+r.slot+']</span></b>'+

'<div style="font-size:12px;color:var(--mut);margin:5px 0">材料：'+Object.keys(r.mats).map(k=>(k==='ironOre'?'⛏️鐵礦':k==='starlight'?'✨星光碎片':k==='labMat'?'🧪實驗素材':k)+' ×'+r.mats[k]).join('＋')+'</div>'+

'<div style="font-size:11.5px;color:var(--teal)">成功率 '+Math.round(r.rate*100)+'%</div>'+

'<button class="btn mini '+(can?'':'dis')+'" style="margin-top:8px" onclick="doForge(\''+r.id+'\')">🔨 鍛造</button></div>'}).join('')+'</div>';

}
