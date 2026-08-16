/* ════════════════════════════════════════════
   vInfinityExchange 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：getAdaptedLevelRequirement, vInfinityExchange
   ════════════════════════════════════════════ */
function getAdaptedLevelRequirement(targetLvl, adminMaxLvl){
  return adminMaxLvl < targetLvl ? adminMaxLvl : targetLvl;
}

function vInfinityExchange(){
  const sys = get('ADV9_SYS_SETTINGS', { max_level: 300 });
  const adminMaxLvl = sys.max_level || 300;
  const d = rerollGet();
  const exProgress = get('ADV9_INF_EXCHANGE', { currentStage: 1, history: [] });

  const pkTower = get('ADV9_PK_TOWER_FLOOR', 0);
  const subStages = get('ADV9_SUBJECT_STAGES', { chinese:0, math:0, english:0, science:0, social:0, will:0, luck:0 });
  const charLvl = me().level || 1;
  const eqData = eqGet();
  const equippedList = Object.values(eqData.equipped||{}).map(id => (eqData.owned||[]).find(x => x.id === id)).filter(Boolean);
  const all7GearLv100 = equippedList.length >= 7 && equippedList.every(g => (g.level||1) >= 100);
  const gear5ZZZOrInf = equippedList.filter(g => g.rarity==='ZZZ' || g.rarity==='∞').length >= 5;
  const all7SubjectsZZPlus = REROLL_ATTRS.every(a => ['ZZ','ZZZ','∞'].includes(d.attr[a.id]));
  const infDomainClears = get('ADV9_INF_DOMAIN_CLEARS', 0);
  const freePointsAllocated = isFreePointsFullyAllocated();

  const stages = [
    {
      stage: 1, title: '第 1 階段 — 啟程之證',
      desc: '無限競技塔 500 層 ＋ 5 個學科各 50 關',
      check: () => pkTower >= 500 && ['chinese','math','english','science','social'].every(k => (subStages[k]||0) >= 50),
      statusText: () => '競技塔: ' + pkTower + '/500｜5學科各50關: ' + (['chinese','math','english','science','social'].every(k => (subStages[k]||0) >= 50)?'✅':'❌')
    },
    {
      stage: 2, title: '第 2 階段 — 進階之證',
      desc: '無限競技塔 1000 層 ＋ 5 個學科各 100 關',
      check: () => pkTower >= 1000 && ['chinese','math','english','science','social'].every(k => (subStages[k]||0) >= 100),
      statusText: () => '競技塔: ' + pkTower + '/1000｜5學科各100關: ' + (['chinese','math','english','science','social'].every(k => (subStages[k]||0) >= 100)?'✅':'❌')
    },
    {
      stage: 3, title: '第 3 階段 — 強者之證',
      desc: '無限競技塔 2000 層 ＋ 角色等級 ' + getAdaptedLevelRequirement(100, adminMaxLvl) + ' (等級適配)',
      check: () => pkTower >= 2000 && charLvl >= getAdaptedLevelRequirement(100, adminMaxLvl),
      statusText: () => '競技塔: ' + pkTower + '/2000｜等級: ' + charLvl + '/' + getAdaptedLevelRequirement(100, adminMaxLvl)
    },
    {
      stage: 4, title: '第 4 階段 — 大師之證',
      desc: '無限競技塔 3000 層 ＋ 角色等級 ' + getAdaptedLevelRequirement(200, adminMaxLvl) + ' (等級適配)',
      check: () => pkTower >= 3000 && charLvl >= getAdaptedLevelRequirement(200, adminMaxLvl),
      statusText: () => '競技塔: ' + pkTower + '/3000｜等級: ' + charLvl + '/' + getAdaptedLevelRequirement(200, adminMaxLvl)
    },
    {
      stage: 5, title: '第 5 階段 — 裝備之證',
      desc: '無限競技塔 4000 層 ＋ 全身 7 件裝備全部強化至 100 級',
      check: () => pkTower >= 4000 && all7GearLv100,
      statusText: () => '競技塔: ' + pkTower + '/4000｜7件+100裝備: ' + (all7GearLv100?'✅':'❌')
    },
    {
      stage: 6, title: '第 6 階段 — 全能之證',
      desc: '無限競技塔 5000 層 ＋ 【等級 ' + getAdaptedLevelRequirement(250, adminMaxLvl) + ' ＋ 七學科皆達 ZZ 階級以上 ＋ 5 學科各 150 關】',
      check: () => pkTower >= 5000 && charLvl >= getAdaptedLevelRequirement(250, adminMaxLvl) && all7SubjectsZZPlus && ['chinese','math','english','science','social'].every(k => (subStages[k]||0) >= 150),
      statusText: () => '競技塔: ' + pkTower + '/5000｜等級: ' + charLvl + '/' + getAdaptedLevelRequirement(250, adminMaxLvl) + '｜全ZZ+: ' + (all7SubjectsZZPlus?'✅':'❌') + '｜150關: ' + (['chinese','math','english','science','social'].every(k => (subStages[k]||0) >= 150)?'✅':'❌')
    },
    {
      stage: 7, title: '第 7 階段 — 神話之證',
      desc: '無限競技塔 6000 層 ＋ 【等級 ' + getAdaptedLevelRequirement(300, adminMaxLvl) + ' ＋ 5學科各200關 ＋ 5件裝備達 ZZZ/∞ ＋ ∞神域通關10次 ＋ 自由點數全數分配】',
      check: () => pkTower >= 6000 && charLvl >= getAdaptedLevelRequirement(300, adminMaxLvl) && ['chinese','math','english','science','social'].every(k => (subStages[k]||0) >= 200) && gear5ZZZOrInf && infDomainClears >= 10 && freePointsAllocated,
      statusText: () => '競技塔: ' + pkTower + '/6000｜等級: ' + charLvl + '/' + getAdaptedLevelRequirement(300, adminMaxLvl) + '｜200關: ' + (['chinese','math','english','science','social'].every(k => (subStages[k]||0) >= 200)?'✅':'❌') + '｜5件ZZZ+: ' + (gear5ZZZOrInf?'✅':'❌') + '｜神域10次: ' + infDomainClears + '/10｜點數配滿: ' + (freePointsAllocated?'✅':'❌')
    }
  ];

  let html = back() + '<h3 class="vt">♾️ ∞ 神階七階段換取系統 <span class="vsub">挑戰極限成就・免機率解鎖神階學科</span></h3>';
  html += '<div class="panel2" style="margin-bottom:12px">';
  html += '<div style="font-size:13px;color:var(--gold2)"><b>當前管理員設定等級上限：</b>' + adminMaxLvl + ' 級（等級條件已自動適配）</div>';
  html += '<div style="font-size:12px;color:var(--mut);margin-top:4px">提示：七階段依序解鎖，每次換取可指定一個尚未達 ∞ 之學科。每個學科僅能獲得一次 ∞。</div>';
  html += '</div>';

  html += '<div style="display:flex;flex-direction:column;gap:12px">';
  stages.forEach(st => {
    const isDone = exProgress.history.some(h => h.stage === st.stage);
    const canDo = !isDone && exProgress.currentStage === st.stage;
    const isLocked = !isDone && exProgress.currentStage < st.stage;
    const ok = st.check();

    html += '<div class="panel2" style="border-left:4px solid ' + (isDone?'var(--green)':canDo?(ok?'var(--gold)':'var(--red)'):'var(--line)') + '">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">';
    html += '<b style="font-size:16px;color:' + (isDone?'var(--green)':canDo?'var(--gold2)':'var(--mut)') + '">' + st.title + '</b>';
    if (isDone) html += '<span style="color:var(--green);font-weight:700">✅ 已完成換取</span>';
    else if (canDo) html += '<span style="color:' + (ok?'var(--gold2)':'var(--red)') + ';font-weight:700">' + (ok?'✨ 條件已達成！':'🔒 條件未完全達成') + '</span>';
    else html += '<span style="color:var(--mut)">🔒 需完成上階段</span>';
    html += '</div>';
    html += '<div style="font-size:13px;color:var(--txt);margin-top:6px">' + st.desc + '</div>';
    html += '<div style="font-size:12px;color:var(--teal);margin-top:4px">進度：' + st.statusText() + '</div>';

    if (canDo && ok) {
      const unobtainedAttrs = REROLL_ATTRS.filter(a => d.attr[a.id] !== '∞');
      if (unobtainedAttrs.length > 0) {
        html += '<div style="margin-top:10px;display:flex;gap:8px;align-items:center">';
        html += '<select id="exAttrSel_' + st.stage + '" style="width:auto">';
        unobtainedAttrs.forEach(a => {
          html += '<option value="' + a.id + '">' + a.icon + ' ' + a.name + '</option>';
        });
        html += '</select>';
        html += '<button class="btn mini" onclick="executeInfinityExchange(' + st.stage + ')">🏆 立即換取該學科 ∞</button>';
        html += '</div>';
      } else {
        html += '<div style="color:var(--gold2);font-weight:700;margin-top:8px">🎉 恭喜！您所有學科皆已達到 ∞ 神階！</div>';
      }
    }
    html += '</div>';
  });
  html += '</div>';

  if (exProgress.history.length > 0) {
    html += '<div class="panel2" style="margin-top:16px"><b style="color:var(--gold2)">📜 歷史換取紀錄</b>';
    html += '<div style="margin-top:8px;font-size:12px;display:flex;flex-direction:column;gap:4px">';
    exProgress.history.forEach(h => {
      const aObj = REROLL_ATTRS.find(x => x.id === h.subject);
      html += '<div>• [' + new Date(h.timestamp).toLocaleDateString() + '] 階段 ' + h.stage + ' → 獲得 <b style="color:var(--gold2)">' + (aObj?aObj.name:h.subject) + ' ∞</b>（競技塔 ' + h.pkTower + ' 層）</div>';
    });
    html += '</div></div>';
  }

  $('#view').innerHTML = html;
}
