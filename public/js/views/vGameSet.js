/* vGameSet — 遊戲設定後台 */
function vGameSet(){
  if(!(typeof IS_ADMIN==='function'&&IS_ADMIN())) return toast('⚠️ 僅管理員可進入','bad');
  const sys=get(LS.settings,{max_level:300,free_point_single_limit:300,festival_mode:false,pkDaily:5,dailyMissions:15,weeklyGoal:200,timeLock:true,diffMode:'精準'});
  let h=back()+'<h3 class="vt">⚙️ 遊戲全域設定 <span class="vsub">系統參數・功能開關・經濟調控</span></h3>';

  h+='<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2)">🎮 核心參數</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-top:8px">';
  const fields=[
    {k:'max_level',l:'最高等級',t:'number',v:sys.max_level||300},
    {k:'free_point_single_limit',l:'自由點單項上限',t:'number',v:sys.free_point_single_limit||300},
    {k:'pkDaily',l:'PK每日次數',t:'number',v:sys.pkDaily||5},
    {k:'dailyMissions',l:'每日任務數',t:'number',v:sys.dailyMissions||15},
    {k:'weeklyGoal',l:'每週目標經驗',t:'number',v:sys.weeklyGoal||200},
    {k:'goldDropRate',l:'金幣掉落率(%)',t:'number',v:sys.goldDropRate||100,step:10},
    {k:'expRate',l:'經驗率(%)',t:'number',v:sys.expRate||100,step:10},
    {k:'dropRate',l:'道具掉落率(%)',t:'number',v:sys.dropRate||100,step:10},
  ];
  fields.forEach(f=>{h+=`<div><label style="font-size:12px;color:var(--mut)">${f.l}：</label><input id="gs_${f.k}" type="${f.t}" value="${f.v}" ${f.step?`step="${f.step}"`:''}></div>`;});
  h+='</div></div>';

  h+='<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2)">🎛️ 功能開關</b>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:8px">';
  const toggles=[
    {k:'festival_mode',l:'🎉 節日雙倍模式',v:sys.festival_mode},
    {k:'timeLock',l:'⏰ 時間鎖定(防刷)',v:sys.timeLock!==false},
    {k:'pvpEnabled',l:'⚔️ 開啟PVP',v:sys.pvpEnabled!==false},
    {k:'guildWarEnabled',l:'🏰 公會戰',v:sys.guildWarEnabled!==false},
    {k:'marketEnabled',l:'🏪 玩家市場',v:sys.marketEnabled!==false},
    {k:'dungeonEnabled',l:'🏰 副本系統',v:sys.dungeonEnabled!==false},
    {k:'dollEnabled',l:'🎀 夥伴系統',v:sys.dollEnabled!==false},
    {k:'forgeEnabled',l:'🔨 鍛造系統',v:sys.forgeEnabled!==false},
  ];
  toggles.forEach(t=>{h+=`<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px"><input type="checkbox" id="gs_${t.k}" ${t.v?'checked':''} onchange="saveGameSet()"> ${t.l}</label>`;});
  h+='</div></div>';

  h+='<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2)">💰 經濟調控</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-top:8px">';
  ['goldCap','gemCap','staminaRegen','offlineExpHours'].forEach(k=>{
    h+=`<div><label style="font-size:12px;color:var(--mut)">${{goldCap:'金幣上限',gemCap:'寶石上限',staminaRegen:'體力回復(分)',offlineExpHours:'離線經驗(時)'}[k]}：</label><input id="gs_${k}" type="number" value="${sys[k]||0}"></div>`;
  });
  h+='</div></div>';

  h+='<div class="panel2"><b style="color:var(--gold2)">📝 難度模式</b>';
  h+='<div style="margin-top:8px"><select id="gs_diffMode" onchange="saveGameSet()">';
  ['精準','寬鬆','地獄'].forEach(m=>h+=`<option value="${m}" ${sys.diffMode===m?'selected':''}>${m}</option>`);
  h+='</select></div></div>';

  h+='<div class="mBtns" style="margin-top:14px"><button class="btn big" onclick="saveGameSet()">💾 儲存所有設定</button></div>';
  $('#view').innerHTML=h;
}
function saveGameSet(){
  const sys=get(LS.settings,{});
  ['max_level','free_point_single_limit','pkDaily','dailyMissions','weeklyGoal','goldDropRate','expRate','dropRate','goldCap','gemCap','staminaRegen','offlineExpHours'].forEach(k=>{
    const el=$('#gs_'+k); if(el) sys[k]=+el.value||0;
  });
  ['festival_mode','timeLock','pvpEnabled','guildWarEnabled','marketEnabled','dungeonEnabled','dollEnabled','forgeEnabled'].forEach(k=>{
    const el=$('#gs_'+k); if(el) sys[k]=el.checked;
  });
  sys.diffMode=$('#gs_diffMode').value;
  set(LS.settings,sys); toast('✅ 設定已儲存'); vGameSet();
}