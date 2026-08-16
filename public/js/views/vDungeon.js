/* ════════════════════════════════════════════
   vDungeon 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vDungeon
   ════════════════════════════════════════════ */
function vDungeon(){
  const u=me(),g=u.g;
  const terrOwned=Object.keys(g.territory?.owned||{}).length;
  const pkBest=g.arena?.best||1;
  let html=back()+'<h3 class="vt">🏰 副本戰鬥 <span class="vsub">2D 俯視角即時戰鬥・裝備僅此獲取</span></h3>';
  html+='<div class="panel2" style="margin-bottom:10px;font-size:12.5px;color:var(--mut);line-height:1.8;border-left:4px solid var(--gold)">📜 副本規則：每副本有固定波次，擊敗最後BOSS獲得裝備寶箱<br>個人掉落制｜Z以上全服公告<br>難度：普通(R~A)・困難(S~SS,領土50關)・地獄(SSS~Z,領土100關/PK塔100層)・神話(ZZ~ZZZ,PK塔300層)・∞神域(極低概率,PK塔500層+五科各50關)</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:14px">';
  Object.keys(DUNGEON_DUNGEONS).forEach(k=>{
    const cfg=DUNGEON_DUNGEONS[k];const waves=DUNGEON_WAVES[k];const loot=DUNGEON_LOOT[k];
    const canEnter=k==='normal'||(k==='hard'&&terrOwned>=50)||(k==='hell'&&terrOwned>=100&&pkBest>=100)||(k==='myth'&&pkBest>=300)||(k==='inf'&&pkBest>=500);
    const unlock=k==='normal'?'初始開放':k==='hard'?'領土50關':k==='hell'?'領土100關 + PK塔100層':k==='myth'?'PK塔300層':'PK塔500層+五科各50關';
    html+='<div class="panel2" style="'+(canEnter?'':'opacity:.5;cursor:not-allowed')+';border-left:4px solid var(--gold)">';
    html+='<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-family:var(--serif);color:var(--gold2)">'+cfg.name+'</b>';
    if(canEnter)html+='<button class="btn mini" onclick="enterDungeon(\''+k+'\')">進入</button>';
    else html+='<span style="font-size:11px;color:var(--mut)">🔒 '+unlock+'</span>';
    html+='</div><div style="font-size:12px;color:var(--mut);margin-top:6px">'+
      '波次 '+waves+' 關｜掉落 '+loot+' 件｜稀有度 '+cfg.rarityPool.join(' ~ ')+'</div></div>';
  });
  html+='</div>';
  if(CUR_DUNGEON&&CUR_DUNGEON.type){html+=renderDungeonBattle()}
  $('#view').innerHTML=html;
}
