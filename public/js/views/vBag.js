/* ════════════════════════════════════════════
   vBag 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vBag
   ════════════════════════════════════════════ */
function vBag(){

const g=me().g;

const slots=[...new Set(g.weapons.map(w=>w.slot||'其他'))];

$('#view').innerHTML=back()+'<h3 class="vt">🎒 背包與裝備 <span class="vsub">共 '+g.weapons.length+' 件｜🔨 強化＝⚡戰力（有別於收藏升星）</span></h3>'+

'<div class="panel2" style="margin-bottom:10px;font-size:13px">🔩 強化石 <b style="color:var(--gold2)">'+g.enhStone+'</b>｜🛡️ 保護卷軸 <b style="color:var(--gold2)">'+g.protect+'</b>｜🧿 防爆盾 <b style="color:var(--gold2)">'+g.shield+'</b>｜⛏️ 鐵礦 <b style="color:var(--gold2)">'+g.ironOre+'</b>｜🧪 實驗素材 <b style="color:var(--gold2)">'+g.labMat+'</b></div>'+

'<div class="panel2" style="margin-bottom:12px;font-size:12.5px;line-height:1.9;border-left:4px solid #ff9d7a">'+

'<b style="color:#ff9d7a">🔨 裝備強化規則：</b>消耗 🔩強化石 提升 +等級，每級 <b>⚡戰力 +8</b>；+5 起有失敗率，失敗可能降級（保護卷軸防降級、防爆盾防爆炸）。最高 +15。可點「📤 上架市集」賣給全服玩家。</div>'+

'<div class="panel2" style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">'+

'<input placeholder="🔍 搜尋裝備名稱..." value="'+esc(CUR.bagSearch||'')+'" oninput="CUR.bagSearch=this.value;renderBagList()" style="flex:1;min-width:150px">'+

'<select onchange="CUR.bagQuality=this.value;renderBagList()" style="width:auto">'+['全部'].concat(CFG.QUAL).map(q=>'<option '+(CUR.bagQuality===q?'selected':'')+'>'+q+'</option>').join('')+'</select>'+

'<select onchange="CUR.bagSlot=this.value;renderBagList()" style="width:auto"><option>全部</option>'+slots.map(s=>'<option '+(CUR.bagSlot===s?'selected':'')+'>'+s+'</option>').join('')+'</select>'+

'<select onchange="CUR.bagSort=this.value;renderBagList()" style="width:auto">'+[['enh','按強化等級'],['quality','按品質'],['name','按名稱']].map(o=>'<option value="'+o[0]+'" '+(CUR.bagSort===o[0]?'selected':'')+'>'+o[1]+'</option>').join('')+'</select>'+

'<button class="btn teal mini" onclick="batchEnh()">⚒️ 一鍵批量強化</button></div>'+

'<div id="bagList"></div>';

renderBagList();

}
