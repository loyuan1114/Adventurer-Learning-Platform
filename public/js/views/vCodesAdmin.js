/* ════════════════════════════════════════════
   vCodesAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vCodesAdmin, codeRwText
   ════════════════════════════════════════════ */
function vCodesAdmin(){

const cs=get(LS.codes,[]);

const allChars=Object.keys(CHARS);

$('#view').innerHTML='<h3 class="vt">🎁 禮包碼生成器 <span class="vsub">支援送角色・加戰鬥次數</span></h3>'+

'<div class="panel2" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;align-items:end">'+

'<label>🪙 金幣<input id="gcGold" type="number" value="50" min="0"></label>'+

'<label>💠 水晶<input id="gcCry" type="number" value="0" min="0"></label>'+

'<label>💎 鑽石<input id="gcDia" type="number" value="0" min="0"></label>'+

'<label>✨ 星光碎片<input id="gcSl" type="number" value="0" min="0"></label>'+

'<label>🔩 強化石<input id="gcEnh" type="number" value="0" min="0"></label>'+

'<label>⛏️ 鐵礦<input id="gcIron" type="number" value="0" min="0"></label>'+

'<label>🏅 榮譽幣<input id="gcHonor" type="number" value="0" min="0"></label>'+

'<label>📖 答題積分<input id="gcQp" type="number" value="0" min="0"></label>'+

'<label>🏟️ 額外PK次數<input id="gcPk" type="number" value="0" min="0"></label>'+

'<label>⚔️ 額外修煉場次數<input id="gcQuiz" type="number" value="0" min="0"></label>'+

'<label>🧑 贈送角色<select id="gcChar"><option value="">（不送）</option>'+allChars.map(c=>'<option value="'+c+'">'+c+'（'+CHARS[c].r+'）</option>').join('')+'</select></label>'+

'<label>🧩 角色碎片數<input id="gcShards" type="number" value="0" min="0"></label>'+

'<label>可用次數<input id="gcNum" type="number" value="1" min="1" max="999"></label>'+

'<label style="grid-column:span 2">備註<input id="gcNote" placeholder="例：課堂表現獎勵"></label>'+

'<button class="btn" onclick="genCodes()">🎁 生成</button></div>'+

'<h3 class="vt" style="margin-top:16px">🗝 禮包碼清單</h3>'+

(cs.length?'<div class="tblWrap"><table><thead><tr><th>序號</th><th>獎勵</th><th>備註</th><th>狀態</th><th>建立</th><th>操作</th></tr></thead><tbody>'+

cs.map(c=>'<tr><td><code>'+c.code+'</code></td><td style="white-space:normal;max-width:300px">'+codeRwText(c.rewards)+'</td><td>'+esc(c.note)+'</td><td>'+(c.usedBy.length>=c.maxUses?'✔ 已用完':'🟢 '+c.usedBy.length+'/'+c.maxUses)+'</td><td>'+fmt(c.time)+'</td>'+

'<td style="display:flex;gap:6px"><button class="btn mini" onclick="copyCode(\''+c.code+'\')">複製</button><button class="btn danger mini" onclick="delCode(\''+c.code+'\')">🗑</button></td></tr>').join('')+

'</tbody></table></div>':'<p class="empty">尚無禮包碼</p>');

}

function codeRwText(r){const p=[];if(r.gold)p.push('🪙'+r.gold);if(r.crystal)p.push('💠'+r.crystal);if(r.diamond)p.push('💎'+r.diamond);

if(r.starlight)p.push('✨'+r.starlight);if(r.enhStone)p.push('🔩'+r.enhStone);if(r.ironOre)p.push('⛏️'+r.ironOre);

if(r.honor)p.push('🏅'+r.honor);if(r.quizPts)p.push('📖'+r.quizPts);

if(r.grantChar)p.push('🧑角色:'+r.grantChar);if(r.grantShards)p.push('🧩碎片×'+r.grantShards);

if(r.extraPk)p.push('🏟️PK+'+r.extraPk);if(r.extraQuiz)p.push('⚔️修煉+'+r.extraQuiz);

return p.join(' ')||'—'}
