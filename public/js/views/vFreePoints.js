/* ════════════════════════════════════════════
   vFreePoints 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vFreePoints
   ════════════════════════════════════════════ */
function vFreePoints(){
  const info = getFreePointsInfo();
  let html = back() + '<h3 class="vt">💪 自由加點系統 <span class="vsub">每級獲得 3 點｜最大可獲得 ' + info.totalEarned + ' 點</span></h3>';
  html += '<div class="panel2" style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  html += '<div><b>目前等級：</b><span style="color:var(--gold2)">' + info.curLvl + ' 級</span>（滿級 ' + info.maxLvl + '）｜<b>總自由點數：</b><span style="color:var(--teal)">' + info.totalEarned + ' 點</span></div>';
  html += '<div><b>已分配：</b>' + info.totalAllocated + ' 點｜<b>剩餘可分配：</b><b style="color:' + (info.remaining>0?'var(--gold2)':'var(--mut)') + ';font-size:18px">' + info.remaining + '</b> 點</div>';
  html += '</div>';

  const directions = [
    { key: 'luck_drop', name: '🥠 運氣（掉落品質）', desc: '提升副本裝備掉落品質與寶箱稀有度 (+0.15%/點)', effect: (v) => '掉落品質 +' + (v*0.15).toFixed(2) + '%' },
    { key: 'combat_power', name: '⚔️ 戰力（面板強化）', desc: '增加攻擊、生命與防禦基礎數值 (攻+2, 血+20, 防+1/點)', effect: (v) => '攻 +' + (v*2) + '｜血 +' + (v*20) + '｜防 +' + (v*1) },
    { key: 'gem_bonus', name: '💎 寶石加成', desc: '副本與任務結算獲得寶石加成 (+0.5%/點)', effect: (v) => '寶石獲得量 +' + (v*0.5).toFixed(1) + '%' },
    { key: 'gold_bonus', name: '🪙 金幣加成', desc: '副本與任務結算獲得金幣加成 (+1%/點)', effect: (v) => '金幣獲得量 +' + (v*1) + '%' },
    { key: 'gacha_luck', name: '🍀 運氣加成（抽卡/幸運）', desc: '微幅提升抽卡幸運、暴擊率與幸運一擊 (暴擊+0.05%/點)', effect: (v) => '暴擊率 +' + (v*0.05).toFixed(2) + '%' }
  ];

  html += '<div style="display:flex;flex-direction:column;gap:10px">';
  directions.forEach(d => {
    const val = info.alloc[d.key] || 0;
    html += '<div class="panel2" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">';
    html += '<div style="flex:1;min-width:200px">';
    html += '<div style="font-weight:700;font-size:15px;color:var(--gold2)">' + d.name + '</div>';
    html += '<div style="font-size:12px;color:var(--mut);margin-top:2px">' + d.desc + '</div>';
    html += '<div style="font-size:12px;color:var(--teal);margin-top:4px">目前效果：' + d.effect(val) + '（' + val + ' / ' + info.singleLimit + '）</div>';
    html += '</div>';
    html += '<div style="display:flex;align-items:center;gap:6px">';
    html += '<button class="btn mini ghost" onclick="addFreePoint(\'' + d.key + '\', -10)">-10</button>';
    html += '<button class="btn mini ghost" onclick="addFreePoint(\'' + d.key + '\', -1)">-1</button>';
    html += '<span style="font-family:var(--serif);font-weight:900;font-size:16px;min-width:40px;text-align:center">' + val + '</span>';
    html += '<button class="btn mini" onclick="addFreePoint(\'' + d.key + '\', 1)">+1</button>';
    html += '<button class="btn mini" onclick="addFreePoint(\'' + d.key + '\', 10)">+10</button>';
    html += '</div>';
    html += '</div>';
  });
  html += '</div>';
  html += '<div style="margin-top:16px;text-align:right">';
  html += '<button class="btn danger mini" onclick="resetFreePoints()">🔄 重置全部分配</button>';
  html += '</div>';
  $('#view').innerHTML = html;
}
