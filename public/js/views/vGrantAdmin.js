/* ════════════════════════════════════════════
   vGrantAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGrantAdmin
   ════════════════════════════════════════════ */
function vGrantAdmin(){

const us=get(LS.users,[]).filter(x=>x.role==='student');

const opts=us.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'（'+esc(x.username)+'）</option>').join('');

const allChars=Object.keys(CHARS);

$('#view').innerHTML='<h3 class="vt">🎁 資源發放 <span class="vsub">全服 '+us.length+' 名學生｜可直接發放資源與角色</span></h3>'+

'<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2)">📨 發放對象</b>'+

'<div style="display:flex;gap:10px;align-items:center;margin-top:8px;flex-wrap:wrap"><label style="font-size:13.5px;cursor:pointer"><input type="radio" name="grTgt" value="all" checked style="width:auto" onchange="grTgtChg()"> 🌍 全服學生</label>'+

'<label style="font-size:13.5px;cursor:pointer"><input type="radio" name="grTgt" value="one" style="width:auto" onchange="grTgtChg()"> 👤 指定學生</label>'+

'<select id="grUser" style="width:auto;display:none">'+opts+'</select></div></div>'+

'<div class="panel2" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;align-items:end">'+

'<label>🪙 金幣<input id="grGold" type="number" value="0" min="0"></label>'+

'<label>💠 水晶<input id="grCry" type="number" value="0" min="0"></label>'+

'<label>💎 鑽石<input id="grDia" type="number" value="0" min="0"></label>'+

'<label>✨ 星光<input id="grSl" type="number" value="0" min="0"></label>'+

'<label>⛏️ 鐵礦<input id="grIron" type="number" value="0" min="0"></label>'+

'<label>🔩 強化石<input id="grEnh" type="number" value="0" min="0"></label>'+

'<label>🧪 實驗素材<input id="grLab" type="number" value="0" min="0"></label>'+

'<label>🏅 榮譽幣<input id="grHon" type="number" value="0" min="0"></label>'+

'<label>📖 答題積分<input id="grQp" type="number" value="0" min="0"></label>'+
'<label>⭐ 星辰幣<input id="grStar" type="number" value="0" min="0"></label>'+

'<label>🧑 送角色<select id="grChar"><option value="">（不送）</option>'+allChars.map(c=>'<option value="'+c+'">'+c+'（'+CHARS[c].r+'）</option>').join('')+'</select></label>'+

'</div>'+

'<div class="panel2" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;align-items:end;margin-top:12px">'+
'<label>🛡️ 裝備欄位<select id="grEqSlot">'+['頭','衣服','褲子','鞋子','武器','戒指','項鍊'].map(s=>'<option value="'+s+'">'+s+'</option>').join('')+'</select></label>'+
'<label>稀有度<select id="grEqRar">'+['R','E','A','S','SS','SSS','Z','ZZ','ZZZ','∞'].map(r=>'<option value="'+r+'"'+(r==='SS'?' selected':'')+'>'+r+'</option>').join('')+'</select></label>'+
'<label>名稱(可空)<input id="grEqName" type="text" placeholder="自訂裝備名"></label>'+
'<button class="btn" style="margin-top:0" onclick="adminGrantEquip()">🛡️ 發放裝備</button>'+
'</div>'+
'<button class="btn" style="margin-top:12px" onclick="adminGrant()">🚀 發放</button>';

}
