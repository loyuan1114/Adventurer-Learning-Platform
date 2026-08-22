/* ════════ 稱號成就 ════════ */

/* ════════════════════════════════════════════
   vTitleV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTitleV
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vTitleV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTitleV
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vTitleV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTitleV
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vTitleV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTitleV
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vTitleV 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vTitleV
   ════════════════════════════════════════════ */
async function vTitleV(){
  if(!await needJs(['js/views/vTitleV.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vTitleV();
}






function setTitle(id){const u=me();u.g.equippedTitle=id;saveU(u);toast('👑 已配戴稱號');vTitleV()}

function claimAch(id){

const u=me(),g=u.g;const a=ACH.find(x=>x.id===id);const claimed=g.ach[id]||0;

const s=a.stages[claimed];if(!s||a.prog(g)<s.g)return toast('⚠️ 尚未達成','bad');

g.ach[id]=claimed+1;grantRw(g,s.rw);

saveU(u);hud();toast('🏅 成就「'+a.n+'」階段'+(claimed+1)+' 已領取！');vTitleV();

}

/* ════════ 兌換所 ════════ */

/* ════════════════════════════════════════════
   vExch 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vExch
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vExch 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vExch
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vExch 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vExch
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vExch 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vExch
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vExch 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vExch
   ════════════════════════════════════════════ */
async function vExch(){
  if(!await needJs(['js/views/vExch.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vExch();
}






function exch(i){

const u=me(),g=u.g,e=CFG.EXCH[i];

if(e.f==='labMat'){if(g.labMat<e.fn)return toast('🧪 實驗素材不足','bad');g.labMat-=e.fn}

else{if((Number(g[e.f])||0)<e.fn)return toast('⚠️ 資源不足','bad');g[e.f]=Number(g[e.f])-e.fn}

if(e.t==='teammate'){if(!g.owned.teammate.includes(e.tn))g.owned.teammate.push(e.tn);toast('🤝 獲得稀有隊友：'+e.tn)}

else if(e.t==='pet'){if(!g.owned.pet.includes(e.tn))g.owned.pet.push(e.tn);toast('🐾 獲得限定寵物：'+e.tn)}

else if(e.t==='blueprint'){if(!g.blueprints.includes(e.tn))g.blueprints.push(e.tn);toast('📜 獲得高階鍛造圖紙：'+e.tn)}

else g[e.t]=(Number(g[e.t])||0)+e.tn;

saveU(u);hud();toast('✅ 兌換成功');vExch();

}

/* ════════ 自然實驗室 ════════ */

/* ════════════════════════════════════════════
   vLab 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLab
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vLab 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLab
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vLab 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLab
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vLab 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLab
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vLab 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vLab
   ════════════════════════════════════════════ */
async function vLab(){
  if(!await needJs(['js/views/vLab.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  vLab();
}






function doExp(i){

const e=EXPS[i];

openModal('<h3 class="mt">'+e.n+'</h3><p class="msub">'+e.d+'</p>'+

'<b style="color:var(--teal);font-size:13px">🧫 實驗步驟</b>'+e.st.map(s=>'<div class="stepLi">'+s+'</div>').join('')+

'<div class="panel2" style="margin-top:10px;color:var(--gold2);font-size:13px">📚 科學知識：'+e.kn+'</div>'+

'<div class="mBtns"><button class="btn ghost" onclick="closeModal()">離開</button><button class="btn teal" onclick="labSim('+i+')">🔬 動手模擬</button><button class="btn" onclick="finExp('+i+')">✅ 完成實驗</button></div>');

}

function finExp(i){

const u=me(),g=u.g;closeModal();

if(!g.lab.includes(i)){g.lab.push(i);grantExp(g,50,false,'自然');g.crystal+=EXPS[i].rw.crystal;g.labMat+=EXPS[i].rw.labMat;updMission(g,'lab',1);saveU(u);hud()}

toast('🧪 實驗完成！+'+EXPS[i].rw.exp+'XP +'+EXPS[i].rw.crystal+'💠 +'+EXPS[i].rw.labMat+'🧪');vLab();

}

/* 🔬 動手實驗模擬：每個實驗都能拖拉滑桿/點按鈕即時看到反應變化 */

function labSim(i){

const e=EXPS[i];

const ctrl=[

'<label class="mlab">💧 滴入 NaOH（mL）：<b id="sv">0</b><input type="range" id="si" min="0" max="50" value="0" oninput="simUpdate(0)"></label>',

'<label class="mlab">🔦 入射角（°）：<b id="sv">30</b><input type="range" id="si" min="0" max="89" value="30" oninput="simUpdate(1)"></label>',

'<div style="display:flex;gap:8px"><button class="btn mini" onclick="window._sc=\'series\';simUpdate(2)">🔌 串聯</button><button class="btn ghost mini" onclick="window._sc=\'parallel\';simUpdate(2)">🔀 並聯</button></div>',

'<div style="display:flex;gap:6px;flex-wrap:wrap">'+['Mg','Zn','Fe','Cu'].map(m=>'<button class="btn ghost mini" onclick="window._sm=\''+m+'\';simUpdate(3)">'+m+'</button>').join('')+'</div>',

'<button class="btn mini" onclick="window._se=(window._se||0)+1;simUpdate(4)">⚡ 通電 1 秒</button>',

'<label class="mlab">☀️ 光照強度：<b id="sv">50</b>%<input type="range" id="si" min="0" max="100" value="50" oninput="simUpdate(5)"></label>',

'<button class="btn mini" onclick="simUpdate(6)">🧪 倒入醋（觸發反應）</button>',

'<label class="mlab">🧲 磁鐵移動速度：<b id="sv">0</b><input type="range" id="si" min="0" max="100" value="0" oninput="simUpdate(7)"></label>'

][i]||'<p class="msub">這個實驗尚無互動模擬。</p>';

openModal('<h3 class="mt">🔬 '+e.n+'：動手模擬</h3>'+

'<div class="panel2" style="margin-bottom:10px">'+ctrl+'</div>'+

'<div id="simOut" class="panel2" style="text-align:center;min-height:110px;font-size:14px"></div>'+

'<div class="mBtns"><button class="btn ghost" onclick="doExp('+i+')">← 返回步驟</button><button class="btn" onclick="finExp('+i+')">✅ 完成實驗</button></div>');

window._sc='series';window._sm='';window._se=0;simUpdate(i);

}

function simUpdate(i){

const out=$('#simOut');if(!out)return;const inp=$('#si');const v=inp?+inp.value:0;const sv=$('#sv');if(sv)sv.textContent=v;

let html='';

if(i===0){const ph=v<25?3+(v/25)*3.5:v===25?7:7+((v-25)/25)*6;const col=ph<6.3?'transparent':ph<7.5?'#ffd6ea':'#ff4fa3';

html='<div style="width:70px;height:90px;margin:0 auto 8px;border:2px solid #999;border-radius:0 0 20px 20px;background:'+(col==='transparent'?'rgba(255,255,255,.15)':col)+';transition:.3s"></div>'+

'pH ≈ <b style="color:var(--gold2);font-size:20px">'+ph.toFixed(1)+'</b><br><span style="color:var(--mut);font-size:12px">'+(ph<6.3?'酸性（酚酞無色）':ph<7.5?'接近中和點！':'鹼性（酚酞變粉紅）')+'</span>'}

else if(i===1){const r=Math.asin(Math.min(1,Math.sin(v*Math.PI/180)/1.5))*180/Math.PI;

html='入射角 <b>'+v+'°</b> → 折射角 <b style="color:var(--teal);font-size:20px">'+r.toFixed(1)+'°</b><br><span style="color:var(--mut);font-size:12px">光由空氣進入玻璃(n=1.5)，向法線偏折；sin i / sin r = 1.5</span>'}

else if(i===2){const s=window._sc==='series';

html='目前：<b style="color:var(--gold2)">'+(s?'串聯':'並聯')+'電路</b><br>'+(s?'💡💡 兩燈較暗（電流小，I=V/2R），一燈壞兩燈均熄':'🔆🔆 兩燈較亮（電流大，I=2V/R），一燈壞另一燈仍亮')+'<br><span style="color:var(--mut);font-size:12px">串聯電流相同、並聯電壓相同</span>'}

else if(i===3){const m=window._sm;const rate={Mg:'⭐⭐⭐⭐ 劇烈冒泡',Zn:'⭐⭐⭐ 明顯冒泡',Fe:'⭐⭐ 緩慢冒泡',Cu:'— 幾乎不反應'}[m];

html=m?('金屬 <b style="color:var(--gold2);font-size:18px">'+m+'</b> + 鹽酸<br>'+rate+'<br><span style="color:var(--mut);font-size:12px">活性順序 Mg&gt;Zn&gt;Fe&gt;Cu</span>'):'點上方金屬放入鹽酸→觀察反應'}

else if(i===4){const s=window._se||0;html='通電 '+s+' 秒<br>🫧 陰極 H₂：<b style="color:var(--teal)">'+(s*2)+'</b> mL　🔥 陽極 O₂：<b style="color:var(--gold2)">'+s+'</b> mL<br><span style="color:var(--mut);font-size:12px">體積比永遠是 H₂:O₂ = 2:1</span>'}

else if(i===5){const b=Math.round(v/100*40);html='光照 '+v+'%<br>🌿 氣泡產生：<b style="color:var(--green);font-size:18px">'+b+'</b> 個/分<br><span style="color:var(--mut);font-size:12px">'+(v<10?'光太弱，幾乎不光合':'光越強光合作用越旺，釋出越多 O₂')+'</span>'}

else if(i===6){out.innerHTML='<div style="font-size:40px;animation:strike .5s">🌋💨</div>嗤——泡沫噴發！<br><span style="color:var(--mut);font-size:12px">NaHCO₃ + 醋酸 → CO₂↑ + 水 + 醋酸鈉，氣體推擠泡沫</span>';return}

else if(i===7){const c=Math.round(v/100*100);html='磁鐵速度 '+v+'<br>電流計指針：<b style="color:var(--teal);font-size:18px">'+(v===0?'― 不偏轉':(c>66?'↺大幅偏轉':c>33?'↺ 中度偏轉':'↺ 小幅偏轉'))+'</b><br><span style="color:var(--mut);font-size:12px">磁鐵越快→磁通量變化越快→感應電流越大（法拉第定律）</span>'}

out.innerHTML=html;

}
