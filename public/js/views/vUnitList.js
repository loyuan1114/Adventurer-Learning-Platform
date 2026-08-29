/* vUnitList — 單元列表 */
function vUnitList() {
  var u = me(); if (!u) return;
  var g = u.g;

  var h = back() + '<h3 class="vt">📚 單元列表 <span class="vsub">學習進度・科目章節・完成狀態</span></h3>';

  var subjects = [
    { id: 'math', name: '數學', icon: '🧮', color: '#2196f3', units: [
      { id: 'm1', name: '整數與分數', desc: '正負數、分數運算', lv: 1, exp: 20 },
      { id: 'm2', name: '小數與百分比', desc: '小數運算、百分比應用', lv: 3, exp: 25 },
      { id: 'm3', name: '代數基礎', desc: '變數、方程式、不等式', lv: 8, exp: 35 },
      { id: 'm4', name: '幾何圖形', desc: '面積、周長、體積計算', lv: 12, exp: 40 },
      { id: 'm5', name: '統計與機率', desc: '數據分析、機率計算', lv: 18, exp: 45 },
      { id: 'm6', name: '函數與圖形', desc: '線性函數、二次函數', lv: 25, exp: 50 },
      { id: 'm7', name: '三角比', desc: '三角函數、三角比應用', lv: 35, exp: 60 },
      { id: 'm8', name: '數列與級數', desc: '等差、等比數列', lv: 45, exp: 70 }
    ]},
    { id: 'english', name: '英文', icon: '🔤', color: '#4caf50', units: [
      { id: 'e1', name: '基本文法', desc: '主詞、動詞、受詞', lv: 1, exp: 20 },
      { id: 'e2', name: '時態', desc: '現在式、過去式、未來式', lv: 5, exp: 25 },
      { id: 'e3', name: '片語與成語', desc: '常見片語用法', lv: 10, exp: 35 },
      { id: 'e4', name: '閱讀測驗', desc: '文章理解與分析', lv: 15, exp: 40 },
      { id: 'e5', name: '寫作技巧', desc: '書信、作文格式', lv: 22, exp: 50 },
      { id: 'e6', name: '聽力訓練', desc: '聽力理解與筆記', lv: 30, exp: 55 },
      { id: 'e7', name: '會話練習', desc: '日常對話情境', lv: 40, exp: 60 },
      { id: 'e8', name: '進階文法', desc: '假設語氣、被動語態', lv: 50, exp: 70 }
    ]},
    { id: 'science', name: '自然', icon: '🔬', color: '#ff9800', units: [
      { id: 's1', name: '物質與能量', desc: '物質三態、能量轉換', lv: 2, exp: 20 },
      { id: 's2', name: '力與運動', desc: '牛頓定律、力學基礎', lv: 7, exp: 30 },
      { id: 's3', name: '地球科學', desc: '板塊、氣候、水循環', lv: 12, exp: 35 },
      { id: 's4', name: '生物體系', desc: '細胞、組織、器官', lv: 18, exp: 45 },
      { id: 's5', name: '化學反應', desc: '酸鹼、氧化還原', lv: 25, exp: 50 },
      { id: 's6', name: '電與磁', desc: '電路、電磁感應', lv: 32, exp: 55 },
      { id: 's7', name: '宇宙與天文', desc: '太陽系、恆星演化', lv: 42, exp: 65 },
      { id: 's8', name: '環境生態', desc: '生態系、環境保護', lv: 55, exp: 75 }
    ]},
    { id: 'social', name: '社會', icon: '🌏', color: '#e91e63', units: [
      { id: 'so1', name: '歷史基礎', desc: '台灣歷史重要事件', lv: 2, exp: 20 },
      { id: 'so2', name: '地理環境', desc: '地形、氣候、資源', lv: 8, exp: 30 },
      { id: 'so3', name: '公民與社會', desc: '法律、政治制度', lv: 15, exp: 40 },
      { id: 'so4', name: '世界歷史', desc: '工業革命、世界大戰', lv: 22, exp: 45 },
      { id: 'so5', name: '經濟學基礎', desc: '供需、市場、通膨', lv: 30, exp: 55 },
      { id: 'so6', name: '文化與多元', desc: '各國文化比較', lv: 38, exp: 60 },
      { id: 'so7', name: '全球議題', desc: '氣候變遷、國際關係', lv: 48, exp: 70 },
      { id: 'so8', name: '哲學思辨', desc: '倫理學、邏輯推理', lv: 60, exp: 80 }
    ]}
  ];

  var totalUnits = 0;
  var completedUnits = 0;
  var totalExp = 0;
  var earnedExp = 0;
  subjects.forEach(function(s) {
    s.units.forEach(function(un) {
      totalUnits++;
      totalExp += un.exp;
      if (g.unitDone && g.unitDone[un.id]) {
        completedUnits++;
        earnedExp += un.exp;
      }
    });
  });

  h += '<div class="panel2" style="margin-top:12px">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  h += '<b style="color:var(--gold2);font-size:15px">📊 學習總覽</b>';
  h += '<div class="chip">進度：' + completedUnits + '/' + totalUnits + ' 單元</div>';
  h += '</div>';
  h += '<div style="background:rgba(0,0,0,.25);border-radius:8px;height:8px;margin-top:8px;overflow:hidden">';
  h += '<div style="height:100%;width:' + (totalUnits ? Math.round(completedUnits / totalUnits * 100) : 0) + '%;background:linear-gradient(90deg,var(--teal),var(--gold2));border-radius:8px;transition:width .3s"></div>';
  h += '</div>';
  h += '<div style="display:flex;justify-content:space-between;margin-top:4px">';
  h += '<span style="font-size:11px;color:var(--mut)">完成度 ' + (totalUnits ? Math.round(completedUnits / totalUnits * 100) : 0) + '%</span>';
  h += '<span style="font-size:11px;color:var(--mut)">經驗：' + numFmt(earnedExp) + '/' + numFmt(totalExp) + '</span>';
  h += '</div></div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--teal);font-size:14px">🔬 篩選科目</b>';
  h += '<div class="rwRow" style="margin-top:8px">';
  h += '<button class="rwChip" onclick="unitFilterSubject(\'all\')">📚 全部</button>';
  subjects.forEach(function(s) {
    h += '<button class="rwChip" onclick="unitFilterSubject(\'' + s.id + '\')">' + s.icon + ' ' + s.name + '</button>';
  });
  h += '</div></div>';

  window._unitSubjects = subjects;

  h += '<div id="unitSubjectArea"></div>';

  h += '<div class="panel2" style="margin-top:14px"><b style="color:var(--purple);font-size:14px">🏆 學習里程碑</b>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px;margin-top:10px">';
  var milestones = [
    { req: 1, name: '初學者', icon: '🌱' },
    { req: 5, name: '小有進度', icon: '📖' },
    { req: 10, name: '勤學不輟', icon: '📝' },
    { req: 15, name: '博學多聞', icon: '🎓' },
    { req: 20, name: '學識淵博', icon: '🏆' },
    { req: 28, name: '全科達人', icon: '👑' },
    { req: 32, name: '學霸傳說', icon: '💫' }
  ];
  milestones.forEach(function(m) {
    var reached = completedUnits >= m.req;
    h += '<div style="text-align:center;padding:8px;background:rgba(0,0,0,' + (reached ? '.15' : '.05') + ');border-radius:6px;opacity:' + (reached ? '1' : '.4') + '">';
    h += '<div style="font-size:20px">' + (reached ? m.icon : '🔒') + '</div>';
    h += '<div style="font-size:10px;font-weight:700;color:' + (reached ? 'var(--gold2)' : 'var(--mut)') + '">' + m.name + '</div>';
    h += '<div style="font-size:9px;color:var(--mut)">' + m.req + ' 單元</div>';
    h += '</div>';
  });
  h += '</div></div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--gold2);font-size:14px">📖 單元學習說明</b>';
  h += '<div class="skTxt" style="margin-top:6px">';
  h += '每個科目包含多個學習單元，依等級解鎖。完成單元可獲得經驗值與金幣獎勵（經驗值隨等級增加）。所有單元完成後將解鎖全科達人里程碑。部分高級單元需要轉生才能解鎖。使用上方篩選按鈕可快速切換科目。</div></div>';

  $('#view').innerHTML = h;
  unitFilterSubject('all');
}

function unitFilterSubject(subjId) {
  window._unitFilter = subjId;
  var subjects = window._unitSubjects || [];
  var g = me().g;
  var filtered = subjId === 'all' ? subjects : subjects.filter(function(s) { return s.id === subjId; });
  var area = document.getElementById('unitSubjectArea');
  if (!area) return;

  var html = '';
  filtered.forEach(function(subj) {
    var subjDone = subj.units.filter(function(u) { return g.unitDone && g.unitDone[u.id]; }).length;
    html += '<div class="panel2" style="margin-top:12px;border-left:4px solid ' + subj.color + '">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center">';
    html += '<b style="color:' + subj.color + ';font-size:15px">' + subj.icon + ' ' + subj.name + '</b>';
    html += '<div class="chip">' + subjDone + '/' + subj.units.length + '</div>';
    html += '</div>';
    html += '<div style="background:rgba(0,0,0,.2);border-radius:6px;height:4px;margin-top:6px;overflow:hidden">';
    html += '<div style="height:100%;width:' + (subj.units.length ? Math.round(subjDone / subj.units.length * 100) : 0) + '%;background:' + subj.color + ';border-radius:6px"></div>';
    html += '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-top:10px">';
    subj.units.forEach(function(unit) {
      var done = g.unitDone && g.unitDone[unit.id];
      var canStart = g.lv >= unit.lv;
      html += '<div class="panel2" style="padding:10px;' + (done ? 'border-color:var(--green);background:rgba(76,175,80,.08)' : canStart ? '' : 'opacity:.5') + '">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center">';
      html += '<b style="font-size:12px;color:' + (done ? 'var(--green)' : 'var(--txt)') + '">' + (done ? '✅ ' : '📖 ') + esc(unit.name) + '</b>';
      if (!done && !canStart) html += '<span class="chip" style="font-size:9px">Lv.' + unit.lv + '+</span>';
      html += '</div>';
      html += '<div style="font-size:10px;color:var(--mut);margin-top:2px">' + esc(unit.desc) + '</div>';
      html += '<div style="font-size:10px;color:var(--gold2);margin-top:2px">+' + unit.exp + ' EXP</div>';
      if (!done && canStart) html += '<button class="btn mini teal" style="margin-top:6px;width:100%" onclick="unitComplete(\'' + unit.id + '\',\'' + unit.name + '\',' + unit.exp + ')">開始學習</button>';
      html += '</div>';
    });
    html += '</div></div>';
  });
  area.innerHTML = html;
}

function unitComplete(id, name, expReward) {
  var u = me(), g = u.g;
  g.unitDone = g.unitDone || {};
  if (g.unitDone[id]) return toast('⚠️ 此單元已完成', 'bad');
  g.unitDone[id] = true;
  var goldReward = 30 + g.lv * 2;
  var actualExp = expReward || (20 + g.lv);
  g.gold = (g.gold || 0) + goldReward;
  g.exp = (g.exp || 0) + actualExp;
  set(LS.users, get(LS.users, []));
  toast('✅ 單元完成！「' + name + '」+' + actualExp + ' EXP +' + goldReward + ' 金');
  vUnitList();
}

function unitReview(id, name) {
  var h = '<div style="padding:10px">';
  h += '<b style="font-family:var(--serif);color:var(--gold2);font-size:16px;display:block;margin-bottom:10px">📖 複習：' + name + '</b>';
  h += '<div class="panel2">';
  h += '<div style="text-align:center;padding:20px">';
  h += '<div style="font-size:48px">📖</div>';
  h += '<div style="font-size:14px;color:var(--gold2);margin-top:8px">📖 單元複習模式</div>';
  h += '<div style="font-size:12px;color:var(--mut);margin-top:4px">選擇要複習的單元，系統會自動出題</div>';
  h += '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">';
  h += '<button class="btn gold mini" onclick="toast(\'開始複習此單元\')">📚 開始複習</button>';
  h += '<button class="btn ghost mini" onclick="toast(\'隨機抽取題目\')">🎲 隨機出題</button>';
  h += '</div>';
  h += '</div></div>';
  h += '<div class="mBtns"><button class="btn" onclick="closeModal()">關閉</button></div></div>';
  openModal(h);
}

function unitProgress() {
  var u = me(), g = u.g;
  var subjects = window._unitSubjects || [];
  var h = '<div style="padding:10px">';
  h += '<b style="font-family:var(--serif);color:var(--gold2);font-size:16px;display:block;margin-bottom:10px">📊 學習進度總覽</b>';
  h += '<div class="panel2">';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px">';
  subjects.forEach(function(subj) {
    var done = subj.units.filter(function(u) { return g.unitDone && g.unitDone[u.id]; }).length;
    var pct = subj.units.length ? Math.round(done / subj.units.length * 100) : 0;
    h += '<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px">';
    h += '<div style="font-size:24px">' + subj.icon + '</div>';
    h += '<div style="font-size:12px;font-weight:700;margin-top:4px">' + subj.name + '</div>';
    h += '<div style="font-size:16px;font-weight:900;color:' + subj.color + ';margin:4px 0">' + pct + '%</div>';
    h += '<div style="font-size:10px;color:var(--mut)">' + done + '/' + subj.units.length + '</div>';
    h += '<div style="background:rgba(0,0,0,.2);border-radius:4px;height:4px;margin-top:4px;overflow:hidden">';
    h += '<div style="height:100%;width:' + pct + '%;background:' + subj.color + ';border-radius:4px"></div>';
    h += '</div></div>';
  });
  h += '</div></div>';
  h += '<div class="mBtns"><button class="btn" onclick="closeModal()">關閉</button></div></div>';
  openModal(h);
}
window.vUnitList = vUnitList;
