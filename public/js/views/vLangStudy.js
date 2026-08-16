/* ════════════════════════════════════════════
   vLangStudy 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLangStudy
   ════════════════════════════════════════════ */
function vLangStudy(){
  const g=me().g,pref=langPref();
  $('#view').innerHTML=back()+'<h3 class="vt">🌍 語言自學 <span class="vsub">203 種語言・AI 出題・獎勵 1.3 倍</span></h3>'+
  '<div class="panel2" style="margin-bottom:10px;line-height:1.9;font-size:13.5px;border-left:4px solid var(--teal)">📖 挑一個想學的語言，AI 會自動出題（單字中⇄外配對）；答對可得 <b style="color:var(--gold2)">1.3 倍</b> 經驗／金幣／水晶，每個語言的答題數都會個別記錄。<br>📌 也可以先在「⚙️ 設定」裡把常用語言設為偏好。</div>'+
  '<div class="panel2" style="margin-bottom:10px;display:flex;gap:6px;flex-wrap:wrap">'+LANG_REGIONS.map(r=>'<button class="btn ghost mini" id="lgf_'+r+'" onclick="langFilter(\''+r+'\')">'+r+'</button>').join('')+
  '<button class="btn ghost mini" id="lgf_全部" onclick="langFilter(\'\')" style="border-color:var(--gold);color:var(--gold2)">全部</button></div>'+
  '<div class="panel2" style="margin-bottom:10px"><input id="langSearch" placeholder="🔍 直接搜尋語言（例：日語、English、zh…）" oninput="langFilter(langFilter.cur||\'\')" style="width:100%;padding:9px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt)"></div>'+
  '<div id="langGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px"></div>';
  langFilter('');
}
