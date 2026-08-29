/* vVideos — 影片學習 */
function vVideos(){
  var u=me(); if(!u) return;
  var g=u.g;
  var h=back()+'<h3 class="vt">🎬 影片學習 <span class="vsub">觀看教學影片・學習知識・獲得獎勵</span></h3>';

  h+='<div class="rwRow">';
  h+='<button class="rwChip" onclick="videoFilterCat(\'all\')">📚 全部</button>';
  h+='<button class="rwChip" onclick="videoFilterCat(\'math\')">🧮 數學</button>';
  h+='<button class="rwChip" onclick="videoFilterCat(\'english\')">🔤 英文</button>';
  h+='<button class="rwChip" onclick="videoFilterCat(\'science\')">🔬 自然</button>';
  h+='<button class="rwChip" onclick="videoFilterCat(\'social\')">🌏 社會</button>';
  h+='<button class="rwChip" onclick="videoFilterCat(\'general\')">📖 通識</button>';
  h+='</div>';

  var vids=[
    {id:'v1',cat:'math',title:'基礎代數入門',desc:'一次方程式、變數與運算規則',icon:'🧮',dur:'12:30',views:342,reward:3,completed:g.videoDone&&g.videoDone.v1},
    {id:'v2',cat:'math',title:'幾何基本概念',desc:'三角形、四邊形面積與周長',icon:'📐',dur:'15:45',views:218,reward:3,completed:g.videoDone&&g.videoDone.v2},
    {id:'v3',cat:'math',title:'統計與機率',desc:'平均數、中位數、眾數與基礎機率',icon:'📊',dur:'18:20',views:156,reward:4,completed:g.videoDone&&g.videoDone.v3},
    {id:'v4',cat:'english',title:'文法基礎：時態',desc:'現在式、過去式、未來式用法',icon:'📝',dur:'14:10',views:405,reward:3,completed:g.videoDone&&g.videoDone.v4},
    {id:'v5',cat:'english',title:'閱讀理解技巧',desc:'如何快速掌握文章主旨與細節',icon:'📖',dur:'16:50',views:289,reward:3,completed:g.videoDone&&g.videoDone.v5},
    {id:'v6',cat:'english',title:'英語聽力訓練',desc:'常見听力情境與答題策略',icon:'🎧',dur:'20:00',views:178,reward:4,completed:g.videoDone&&g.videoDone.v6},
    {id:'v7',cat:'science',title:'物理：力與運動',desc:'牛頓三大運動定律詳解',icon:'⚡',dur:'17:30',views:267,reward:4,completed:g.videoDone&&g.videoDone.v7},
    {id:'v8',cat:'science',title:'化學：元素與化合物',desc:'週期表與常見化學反應',icon:'🧪',dur:'19:15',views:198,reward:4,completed:g.videoDone&&g.videoDone.v8},
    {id:'v9',cat:'science',title:'生物：細胞與遺傳',desc:'細胞結構、DNA與基因運作',icon:'🔬',dur:'16:00',views:223,reward:3,completed:g.videoDone&&g.videoDone.v9},
    {id:'v10',cat:'social',title:'地理：氣候與地形',desc:'全球氣候帶與台灣地形特色',icon:'🌍',dur:'13:40',views:134,reward:3,completed:g.videoDone&&g.videoDone.v10},
    {id:'v11',cat:'social',title:'歷史：近代史關鍵事件',desc:'從工業革命到現代社會變遷',icon:'📜',dur:'22:10',views:112,reward:4,completed:g.videoDone&&g.videoDone.v11},
    {id:'v12',cat:'general',title:'學習方法論',desc:'高效記憶法、筆記技巧與時間管理',icon:'💡',dur:'11:20',views:567,reward:2,completed:g.videoDone&&g.videoDone.v12}
  ];

  var watched=g.videosWatched||0;
  var todayCount=g.videosToday||0;
  var maxDaily=5;

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  h+='<div><b style="color:var(--gold2);font-size:15px">📊 觀看統計</b></div>';
  h+='<div style="display:flex;gap:8px">';
  h+='<div class="chip">📅 今日已看：'+todayCount+'/'+maxDaily+'</div>';
  h+='<div class="chip">🎬 總觀看數：'+watched+'</div>';
  h+='<div class="chip">🏆 已完成：'+(g.videoDone?Object.keys(g.videoDone).length:0)+'/'+vids.length+'</div>';
  h+='</div></div>';

  if(todayCount>0){
    h+='<div style="background:rgba(0,0,0,.2);border-radius:6px;height:6px;margin-top:8px;overflow:hidden">';
    h+='<div style="height:100%;width:'+Math.min(100,todayCount/maxDaily*100)+'%;background:linear-gradient(90deg,var(--teal),var(--gold2));border-radius:6px"></div></div>';
  }
  h+='</div>';

  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-top:12px">';
  var filtered=window._videoCat&&window._videoCat!=='all'?vids.filter(function(v){return v.cat===window._videoCat}):vids;
  filtered.forEach(function(v){
    var done=v.completed;
    h+='<div class="panel2" style="position:relative;'+(done?'border-color:var(--green);background:rgba(76,175,80,.08)':'')+'">';
    if(done) h+='<div class="stockTag" style="background:var(--green)">✅ 已看完</div>';
    h+='<div style="display:flex;gap:10px;align-items:flex-start">';
    h+='<div style="font-size:36px;flex-shrink:0">'+v.icon+'</div>';
    h+='<div style="flex:1;min-width:0">';
    h+='<b style="font-family:var(--serif);color:var(--gold2);font-size:14px;display:block">'+esc(v.title)+'</b>';
    h+='<div style="font-size:12px;color:var(--mut);margin-top:2px">'+esc(v.desc)+'</div>';
    h+='<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">';
    h+='<span class="chip" style="font-size:10px">⏱ '+v.dur+'</span>';
    h+='<span class="chip" style="font-size:10px">👁 '+v.views+'</span>';
    h+='<span class="chip" style="font-size:10px;color:var(--gold2)">+'+v.reward+' AP</span>';
    h+='</div></div></div>';
    h+='<button class="btn '+(done?'ghost':'teal mini')+' big" style="width:100%;margin-top:10px" onclick="videoWatch(\''+v.id+'\','+v.reward+')">'+(done?'🔄 重看':'▶️ 開始觀看')+'</button>';
    h+='</div>';
  });
  h+='</div>';

  if(!filtered.length) h+='<div class="panel2 empty" style="margin-top:12px">此分類暫無影片</div>';

  h+='<div class="panel2" style="margin-top:14px"><b>📜 近期觀看紀錄</b>';
  var logs=(g.videoLogs||[]).slice(-8).reverse();
  if(logs.length){
    h+='<div style="margin-top:8px">';
    logs.forEach(function(l){
      h+='<div class="chip">'+new Date(l.ts).toLocaleString()+' '+esc(l.title)+' +'+l.ap+' AP</div>';
    });
    h+='</div>';
  }else{
    h+='<div class="empty">暫無觀看紀錄</div>';
  }
  h+='</div>';

  h+='<div class="panel2" style="margin-top:12px"><b>🎯 觀看里程碑</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px;margin-top:8px">';
  var milestones=[
    {req:1,name:'初觀者',icon:'🎬',done:watched>=1},
    {req:3,name:'學習新手',icon:'📖',done:watched>=3},
    {req:5,name:'勤學之人',icon:'📝',done:watched>=5},
    {req:8,name:'知識探索者',icon:'🔍',done:watched>=8},
    {req:12,name:'全科達人',icon:'🏆',done:watched>=12},
    {req:20,name:'影片大師',icon:'👑',done:watched>=20}
  ];
  milestones.forEach(function(m){
    h+='<div style="text-align:center;padding:8px;background:rgba(0,0,0,'+(m.done?'.15':'.05')+');border-radius:6px;opacity:'+(m.done?'1':'.4')+'">';
    h+='<div style="font-size:20px">'+(m.done?m.icon:'🔒')+'</div>';
    h+='<div style="font-size:10px;font-weight:700;color:'+(m.done?'var(--gold2)':'var(--mut)')+'">'+m.name+'</div>';
    h+='<div style="font-size:9px;color:var(--mut)">觀看 '+m.req+' 部</div>';
    h+='</div>';
  });
  h+='</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>💡 學習小提醒</b><div class="skTxt" style="margin-top:6px">';
  h+='每天觀看教學影片可獲得 AP 獎勵，每日上限 '+maxDaily+' 支。完成所有影片還有額外獎勵！建議搭配📝筆記加深記憶。觀看越多影片，解鎖更多里程碑！</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>📊 科目完成進度</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:6px;margin-top:8px">';
  var catDone={math:0,english:0,science:0,social:0,general:0};
  var catTotal={math:0,english:0,science:0,social:0,general:0};
  vids.forEach(function(v){catTotal[v.cat]=(catTotal[v.cat]||0)+1;if(v.completed)catDone[v.cat]=(catDone[v.cat]||0)+1});
  var catNames={math:'🧮 數學',english:'🔤 英文',science:'🔬 自然',social:'🌏 社會',general:'📖 通識'};
  Object.keys(catNames).forEach(function(c){
    var pct=catTotal[c]>0?Math.round(catDone[c]/catTotal[c]*100):0;
    h+='<div style="text-align:center;padding:8px;background:rgba(0,0,0,.1);border-radius:6px">';
    h+='<div style="font-size:12px;font-weight:700">'+catNames[c]+'</div>';
    h+='<div style="font-size:14px;font-weight:900;color:var(--gold2);margin:4px 0">'+pct+'%</div>';
    h+='<div style="font-size:10px;color:var(--mut)">'+catDone[c]+'/'+catTotal[c]+'</div>';
    h+='</div>';
  });
  h+='</div></div>';

  $('#view').innerHTML=h;
}

function videoFilterCat(cat){
  window._videoCat=cat;
  vVideos();
}

function videoResetDaily(){
  var u=me(); if(!u) return;
  u.g.videosToday=0;
  set(LS.users,get(LS.users,[]));
  toast('📅 今日觀看次數已重置');
  vVideos();
}

function videoWatch(id,reward){
  var u=me(); if(!u) return;
  var g=u.g;
  var todayCount=g.videosToday||0;
  if(todayCount>=5) return toast('⚠️ 今日觀看已達上限（5支/日）','bad');

  var titles={
    v1:'基礎代數入門',v2:'幾何基本概念',v3:'統計與機率',
    v4:'文法基礎：時態',v5:'閱讀理解技巧',v6:'英語聽力訓練',
    v7:'物理：力與運動',v8:'化學：元素與化合物',v9:'生物：細胞與遺傳',
    v10:'地理：氣候與地形',v11:'歷史：近代史關鍵事件',v12:'學習方法論'
  };

  var title=titles[id]||'未知影片';
  var h='<div style="text-align:center;padding:20px 0">';
  h+='<div style="font-size:60px;animation:bob 2s infinite">▶️</div>';
  h+='<b style="font-family:var(--serif);color:var(--gold2);font-size:18px;display:block;margin:12px 0">'+esc(title)+'</b>';
  h+='<div id="videoTimer" style="font-size:24px;font-weight:900;color:var(--teal);margin:16px 0">觀看中… 0:00</div>';
  h+='<div style="background:var(--panel);border-radius:8px;height:8px;margin:12px 20px;overflow:hidden"><div id="videoBar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--teal),var(--gold2));border-radius:8px;transition:width 0.3s"></div></div>';
  h+='<div style="font-size:12px;color:var(--mut)">影片播放模擬中，請稍候…</div>';
  h+='</div>';
  openModal(h);

  var elapsed=0;
  var total=10;
  var timer=setInterval(function(){
    elapsed++;
    var pct=Math.min(100,Math.round(elapsed/total*100));
    var sec=elapsed;
    var min=Math.floor(sec/60);
    var s=sec%60;
    var timerEl=document.getElementById('videoTimer');
    var barEl=document.getElementById('videoBar');
    if(timerEl) timerEl.textContent='觀看中… '+min+':'+(s<10?'0':'')+s;
    if(barEl) barEl.style.width=pct+'%';
    if(elapsed>=total){
      clearInterval(timer);
      videoComplete(id,title,reward);
    }
  },1000);

  window._videoInterval=timer;
}

function videoComplete(id,title,reward){
  var u=me(); if(!u) return;
  var g=u.g;
  g.videosWatched=(g.videosWatched||0)+1;
  g.videosToday=(g.videosToday||0)+1;
  g.videoDone=g.videoDone||{};
  g.videoDone[id]=true;
  g.gold=(g.gold||0)+reward*10;
  g.exp=(g.exp||0)+reward*5;
  g.videoLogs=g.videoLogs||[];
  g.videoLogs.push({id:id,title:title,ap:reward,ts:Date.now()});
  if(g.videoLogs.length>50) g.videoLogs=g.videoLogs.slice(-50);
  set(LS.users,get(LS.users,[]));
  closeModal();
  toast('🎬 觀看完成！+'+reward+' AP，+'+reward*10+' 金幣');
  vVideos();
}
window.vVideos=vVideos;
