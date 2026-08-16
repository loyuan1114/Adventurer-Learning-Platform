/* ════════════════════════════════════════════
   vColl 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vColl
   ════════════════════════════════════════════ */
function vColl(){

const g=me().g,tab=CUR.collTab,filter=CUR.collFilter,sort=CUR.collSort;

const src=POOLS[tab],owned=g.owned[tab];

let items=owned.map(n=>({n,...src[n]}));

if(filter!=='all')items=items.filter(it=>it.r===filter);

const rv={N:1,R:2,SR:3,SSR:4,UR:5};

if(sort==='rarity')items.sort((a,b)=>rv[b.r]-rv[a.r]);

else if(sort==='star')items.sort((a,b)=>(g.stars[b.n]||1)-(g.stars[a.n]||1));

else if(sort==='name')items.sort((a,b)=>a.n.localeCompare(b.n,'zh-Hant'));

$('#view').innerHTML=back()+'<h3 class="vt">🐾 收藏與裝備 <span class="vsub">收藏 '+collCount(g)+'｜✨ '+g.starlight+'</span></h3>'+

'<div class="panel2" style="margin-bottom:12px;font-size:12.5px;line-height:1.9;border-left:4px solid #c9a6ff">'+

'<b style="color:#c9a6ff">📌 兩種升級方式，效果不同：</b><br>'+

'🌟 <b>收藏「升星」</b>（角色/寵物/動漫/隊友）：消耗 <b style="color:#c9a6ff">✨星光碎片</b>，提升星級 → <b>技能效果倍率</b>（最高5★，滿星可覺醒 ×1.5，<b style="color:var(--gold2)">5★覺醒合計 +275％，總倍率 3.75</b>，修煉場確實套用）；【天命】抽卡保底減抽與【神蹟】品質提升為<b>固定效果</b>，不隨星級縮放<br>'+

'⬆️ <b>收藏「升級」</b>（角色/寵物/動漫/隊友）：消耗 <b style="color:var(--gold2)">🪙金幣＋💠水晶</b>，提升等級 → 每級技能效果 <b>+2%</b>，<b style="color:var(--gold2)">等級無上限</b>，與升星加成相乘疊加，並提升⚡戰力<br>'+

'🔨 <b>裝備「強化」</b>（武器/防具，在🎒背包）：消耗 <b style="color:#ff9d7a">🔩強化石</b>，提升 +等級 → <b>⚡戰力</b>（最高+15，有成功率與降級風險）</div>'+

'<div class="tabRow">'+['character','pet','anime','teammate'].map(c=>

'<button class="tabB '+(tab===c?'on':'')+'" onclick="CUR.collTab=\''+c+'\';vColl()">'+

(c==='character'?'🧑 角色':c==='pet'?'🐾 寵物':c==='anime'?'🎬 動漫':'🤝 隊友')+'（'+g.owned[c].length+'）</button>').join('')+'</div>'+

'<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">'+

'<select onchange="CUR.collFilter=this.value;vColl()" style="width:auto"><option value="all">全部稀有度</option>'+['N','R','SR','SSR','UR'].map(r=>'<option value="'+r+'" '+(filter===r?'selected':'')+'>'+r+'</option>').join('')+'</select>'+

'<select onchange="CUR.collSort=this.value;vColl()" style="width:auto"><option value="rarity" '+(sort==='rarity'?'selected':'')+'>按稀有度</option><option value="star" '+(sort==='star'?'selected':'')+'>按星級</option><option value="name" '+(sort==='name'?'selected':'')+'>按名稱</option></select>'+

'<button class="btn teal mini" onclick="autoTeam()">🌟 一鍵最強裝備</button></div>'+

(items.length?items.map(it=>{

const star=g.stars[it.n]||1,awk=g.awaken.includes(it.n),eq=g.equip[tab]===it.n;

const lv=collLvOf(g,it.n);const lc=collLvCost(lv);

const mult=CFG.STAR_BONUS[star]*(awk?1.5:1)*(1+(lv-1)*.02);

return '<div class="panel2 collIt"><div class="pBox">'+collImg(it.n,tab,it.icon)+'</div><div class="collInfo">'+

'<b class="rar'+it.r+'">'+it.n+' <span style="font-size:11px">'+'★'.repeat(star)+'｜Lv.'+lv+(awk?'｜🔥覺醒':'')+'</span><span class="upType star">培養加成 +'+Math.round((mult-1)*100)+'%</span></b>'+

'<div class="skTxt">'+it.sk.map(s=>s[0]+'：'+s[1]).join('｜')+(it.o?'｜'+it.o:'')+'</div></div>'+

'<div style="display:flex;flex-direction:column;gap:5px">'+

'<button class="btn mini '+(eq?'dis':'')+'" onclick="equip(\''+tab+'\',\''+it.n+'\')">'+(eq?'✅ 裝備中':'裝備')+'</button>'+

'<button class="btn teal mini" onclick="collLvUp(\''+it.n+'\')">⬆️ 升級（🪙'+lc.au+' 💠'+lc.cr+'）</button>'+

(star<5?'<button class="btn ghost mini" onclick="starUp(\''+it.n+'\')">🌟 升星（'+CFG.STAR_COST[star+1]+'✨）</button>'

:(awk?'':'<button class="btn danger mini" onclick="awaken(\''+it.n+'\')">🔥 覺醒</button>'))+

'</div></div>'}).join('')

:'<p class="empty">🎁 此分類尚無收藏，快去抽卡吧！</p>');

}
