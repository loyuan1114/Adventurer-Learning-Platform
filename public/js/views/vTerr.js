/* ════════════════════════════════════════════
   vTerr 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTerr
   ════════════════════════════════════════════ */
function vTerr(){

const u=me(),g=u.g;

const total=Object.keys(g.territory.owned).length;

const tg=terrTarget(g);

$('#view').innerHTML=back()+'<h3 class="vt">🗺️ 領土征服戰 <span class="vsub">已占 '+total+'/2500｜每科 500 關｜越後面關卡物資越多・無上限</span></h3>'+

'<div class="terrInfo"><span>📈 <b>越打越多</b>：每一關獎勵隨關卡成長，全物資（💎🪙💠✨⛏️🔩🧪🏅）一次入袋</span><span>⭐ <b>領土升級</b>：點已占領地可升級至 Lv.5（提升掉落與掟蓕收益）｜👑 頭目關 3 倍｜🎯 今日目標加倍</span></div>'+

(tg?'<p style="color:var(--gold2);font-size:13px;margin-bottom:8px">🎯 今日目標：<b>'+tg.name+'</b>（'+tg.subj+'｜獎勵加倍）</p>':'')+

(total?(g.territory.sweepDate===today()?'<button class="btn ghost mini dis" style="margin-bottom:10px">🧹 今日已掃蕩（明天再來）</button>':'<button class="btn teal mini" style="margin-bottom:10px" onclick="sweep()">🧹 一鍵掃蕩（+'+(total*10)+'🪙 +'+(total*2)+'💠）｜每日限 1 次</button>'):'')+

Object.keys(TERR_MAP).map(s=>{

const T=TERR_MAP[s],cnt=terrIdx(g,s);

return '<div class="panel2" style="border-color:'+T.c+';margin-bottom:12px">'+

'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b style="font-family:var(--serif);color:'+T.c+'">'+T.i+' '+s+'</b>'+

'<span style="font-size:12.5px;color:var(--mut)">'+cnt+'/100'+(cnt>=100?' ✅ 全境占领':'')+'</span></div>'+

'<div class="bar qpb" style="margin-bottom:8px"><i style="width:'+cnt+'%"></i></div>'+

'<div class="terrGrid">'+T.t.map((t,i)=>{

const key=s+'|'+t.n;

const has=!!g.territory.owned[key];

const isNext=(i===cnt); /* 只能按順序征服，下一關可點 */

const locked=!has&&!isNext;

const num=t.n.replace(s+'秘境·','');

return '<button class="terrChip '+(has?'done':isNext?'next':'lock')+(t.boss?' boss':'')+'" '+(has?'':'style="--tc:'+T.c+'" ')+

(locked?'disabled':has?'onclick="terrUpgrade(\''+key.replace(/'/g,"\\'")+'\')"':'onclick="terrBattle(\''+s+'\','+i+')"')+'>'+

'<span class="tcNum">'+(has?'✅':isNext?'⚔️':'🔒')+' '+num+'</span><span class="tcLv">'+(has?'⭐'+((g.territory.levels&&g.territory.levels[key])||1):'Lv.'+t.d)+'</span></button>';

}).join('')+'</div></div>';

}).join('');

}
