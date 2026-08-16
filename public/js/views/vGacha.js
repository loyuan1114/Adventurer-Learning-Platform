/* ════════════════════════════════════════════
   vGacha 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 4 個單位：plvNeed, gachaRates, plvBoxHtml, vGacha
   ════════════════════════════════════════════ */
const plvNeed=lv=>lv*2; /* 升級所需抽數：卡池等級×2（Lv1→2 需 2 抽、Lv50→51 需 100 抽） */

function gachaRates(g){const lv=Math.min(100,(g.gacha&&g.gacha.plv)||1),t=(lv-1)/99;

const UR=+(0.10*t).toFixed(4),SSR=+(0.15*t).toFixed(4),SR=+(0.25*t).toFixed(4),R=+(0.30*t).toFixed(4);

return{UR,SSR,SR,R,N:+(1-UR-SSR-SR-R).toFixed(4)}}

function plvBoxHtml(g){const gc=g.gacha,lv=Math.min(100,gc.plv||1),xp=gc.pxp||0,need=plvNeed(lv),rt=gachaRates(g),pct=v=>+(v*100).toFixed(1)+'%';

return '<b style="color:var(--gold2)">🃏 卡池等級 Lv.'+lv+' / 100</b> <span style="font-size:11.5px;color:var(--mut)">升級需抽數＝等級×2・免費升級不耗任何資源</span>'+

'<div class="bar" style="margin:6px 0"><i style="width:'+(lv>=100?100:Math.min(100,xp/need*100))+'%"></i></div>'+

'<div style="font-size:12px;color:var(--mut)">'+(lv>=100?'🎉 已滿級！UR 機率 10%':'升級進度 '+xp+'/'+need+' 抽')+'｜目前機率：N '+pct(rt.N)+'｜R '+pct(rt.R)+'｜SR '+pct(rt.SR)+'｜SSR '+pct(rt.SSR)+'｜UR '+pct(rt.UR)+'</div>'}

function vGacha(){

const g=me().g,e=effOf(g),red=e.pity_reduce||0;

$('#view').innerHTML=back()+'<h3 class="vt">🎁 召喚抽卡 <span class="vsub">💠 '+g.crystal+'</span></h3>'+

'<div class="panel2" style="margin-bottom:10px;font-size:12.5px;color:var(--gold2)">🔮 召喚抽卡 Lv.'+Math.min(100,(g.gacha&&g.gacha.plv)||1)+'｜'+(gachaRates(g).UR*100).toFixed(1)+'% UR｜累計 '+g.gacha.total+' 抽｜SR 保底還差 '+Math.max(0,10-red-g.gacha.sinceSR)+'｜SSR 還差 '+Math.max(0,50-red-g.gacha.sinceSSR)+'｜UR 還差 '+Math.max(0,100-red-g.gacha.sinceUR)+'</div>'+

'<div class="panel2" id="plvBox" style="margin-bottom:10px">'+plvBoxHtml(g)+'</div>'+

'<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">'+

[['全部池','all'],['🧑 角色','character'],['🐾 寵物','pet'],['🎬 動漫','anime'],['🤝 隊友','teammate']].map(p=>'<label style="font-size:13px;cursor:pointer"><input type="radio" name="pool" value="'+p[1]+'" '+(p[1]==='all'?'checked':'')+' style="width:auto"> '+p[0]+'</label>').join('')+'</div>'+

'<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn big" style="background:linear-gradient(180deg,#b39ddb,#7c4dff);border-color:#4527a0;color:#fff" onclick="pull(1)">單抽<br>💠30</button>'+

'<button class="btn big" onclick="pull(10)">十連抽<br>💠270（必得SR+）</button>'+

''+

'<div id="gRes"></div>'+

'<div class="panel2" style="margin-top:12px;font-size:12px;color:var(--mut)">機率隨卡池等級提升：Lv1 原始 N 100% → Lv100 UR 10%（升級所需抽數＝等級×2，免費升級）｜10抽保底SR・50抽保底SSR・100抽保底UR</div>';

}
