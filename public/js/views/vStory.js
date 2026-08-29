/* vStory — 故事模式 */
function vStory(){
  var u=me(); if(!u) return;
  var g=u.g;
  var h=back()+'<h3 class="vt">📖 故事模式 <span class="vsub">冒險故事・選擇冒險・角色養成</span></h3>';

  var stories=g.stories||{};
  var storyList=[
    {id:'s1',title:'🌲 森林的召喚',desc:'你是一名住在村莊邊緣的少年，某天在森林裡發現了一個神秘的符文…',chapters:5,diff:'🌱 簡單',reqLv:1,rewards:'經驗・金幣・稀有道具',completed:stories.s1},
    {id:'s2',title:'🏜️ 沙漠神殿',desc:'傳說中，沙漠深處有一座被遺忘的神殿，裡面藏著古代魔法的秘密…',chapters:7,diff:'⚔️ 中等',reqLv:10,rewards:'經驗・寶石・稱號',completed:stories.s2},
    {id:'s3',title:'❄️ 冰封王座',desc:'北方的冰原上，一位被冰封千年的王者即將甦醒…',chapters:8,diff:'🔥 困難',reqLv:25,rewards:'經驗・史詩裝備・特殊技能',completed:stories.s3},
    {id:'s4',title:'🌋 熔岩之心',desc:'火山深處的熔岩之心正在躁動，一股黑暗力量正在甦醒…',chapters:10,diff:'💀 噩夢',reqLv:40,rewards:'經驗・傳說材料・專屬稱號',completed:stories.s4},
    {id:'s5',title:'🏰 王都守衛戰',desc:'黑暗大軍逼近王都，身為勇者的你必須挺身而出…',chapters:12,diff:'👑 地獄',reqLv:60,rewards:'經驗・神話裝備・終極稱號',completed:stories.s5}
  ];

  h+='<div class="panel2" style="margin-top:12px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  h+='<b style="color:var(--gold2);font-size:15px">📊 故事進度</b>';
  var completed=storyList.filter(function(s){return s.completed}).length;
  h+='<div class="chip">📖 已完成 '+completed+'/'+storyList.length+'</div>';
  h+='</div></div>';

  h+='<div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">';
  storyList.forEach(function(s){
    var canPlay=g.lv>=s.reqLv;
    var done=s.completed;
    h+='<div class="panel2" style="position:relative;'+(done?'border-color:var(--green);background:rgba(76,175,80,.06)':'')+'">';
    if(done) h+='<div class="stockTag" style="background:var(--green)">✅ 已通關</div>';
    h+='<div style="display:flex;gap:12px;align-items:flex-start">';
    h+='<div style="font-size:40px;flex-shrink:0">'+s.title.split(' ')[0]+'</div>';
    h+='<div style="flex:1;min-width:0">';
    h+='<b style="font-family:var(--serif);color:var(--gold2);font-size:16px;display:block">'+esc(s.title.split(' ').slice(1).join(' '))+'</b>';
    h+='<div style="font-size:12px;color:var(--mut);margin-top:4px;line-height:1.6">'+esc(s.desc)+'</div>';
    h+='<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">';
    h+='<span class="chip" style="font-size:10px">'+s.diff+'</span>';
    h+='<span class="chip" style="font-size:10px">📖 '+s.chapters+' 章</span>';
    h+='<span class="chip" style="font-size:10px">🎯 需求 Lv.'+s.reqLv+'</span>';
    h+='<span class="chip" style="font-size:10px;color:var(--gold2)">🏆 '+s.rewards+'</span>';
    h+='</div></div></div>';
    h+='<button class="btn '+(done?'ghost':canPlay?'gold':'dis')+' big" style="width:100%;margin-top:10px" '+(canPlay?'':'disabled')+' onclick="storyStart(\''+s.id+'\')">'+(done?'🔄 重玩':canPlay?'📖 開始冒險':'🔒 需要 Lv.'+s.reqLv)+'</button>';
    h+='</div>';
  });
  h+='</div>';

  if(stories.current){
    h+='<div class="panel2" style="margin-top:14px;border-left:4px solid var(--gold2)">';
    h+='<b style="color:var(--gold2)">📌 目前進行中</b>';
    var cur=storyList.find(function(s){return s.id===stories.current});
    if(cur){
      h+='<div style="margin-top:6px;font-size:13px">'+esc(cur.title)+' — 第 '+((stories.chapter||0)+1)+'/'+cur.chapters+' 章</div>';
      h+='<button class="btn gold" style="margin-top:8px" onclick="storyContinue()">📖 繼續冒險</button>';
    }
    h+='</div>';
  }

  h+='<div class="panel2" style="margin-top:14px"><b>📜 冒險紀錄</b>';
  var logs=(stories.logs||[]).slice(-8).reverse();
  if(logs.length){
    h+='<div style="margin-top:8px">';
    logs.forEach(function(l){
      h+='<div class="chip">'+new Date(l.ts).toLocaleString()+' '+esc(l.title)+' '+l.result+'</div>';
    });
    h+='</div>';
  }else{
    h+='<div class="empty">暫無冒險紀錄</div>';
  }
  h+='</div>';

  h+='<div class="panel2" style="margin-top:12px"><b>💡 故事小提醒</b><div class="skTxt" style="margin-top:6px">';
  h+='每個故事有多個章節，你的選擇會影響劇情走向與結局。完成故事可獲得豐厚獎勵，部分裝備和稱號只在故事模式中獲得！嘗試不同選擇可以體驗不同結局。</div></div>';

  h+='<div class="panel2" style="margin-top:12px"><b>🏅 故事成就</b>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px;margin-top:8px">';
  var storyAch=[
    {name:'故事新手',desc:'完成第 1 個故事',icon:'📖',done:completed>=1},
    {name:'冒險者',desc:'完成 3 個故事',icon:'🗺️',done:completed>=3},
    {name:'故事大師',desc:'完成所有故事',icon:'🏆',done:completed>=5},
    {name:'探索者',desc:'嘗試所有選擇',icon:'🔍',done:false},
    {name:'完美主義',desc:'全故事 100% 通關',icon:'👑',done:completed>=5}
  ];
  storyAch.forEach(function(a){
    h+='<div style="text-align:center;padding:8px;background:rgba(0,0,0,'+(a.done?'.15':'.05')+');border-radius:6px;opacity:'+(a.done?'1':'.4')+'">';
    h+='<div style="font-size:18px">'+(a.done?a.icon:'🔒')+'</div>';
    h+='<div style="font-size:10px;font-weight:700;color:'+(a.done?'var(--gold2)':'var(--mut)')+'">'+a.name+'</div>';
    h+='<div style="font-size:9px;color:var(--mut)">'+a.desc+'</div>';
    h+='</div>';
  });
  h+='</div></div>';

  $('#view').innerHTML=h;
}

function storyStart(id){
  var u=me(); if(!u) return;
  var g=u.g;
  var storyList=[
    {id:'s1',title:'森林的召喚',chapters:5,scenes:[
      {text:'你在村莊邊緣的森林散步時，發現了一個發光的符文石。',choices:['拾起符文石','繞道離開','大聲呼救']},
      {text:'符文石發出溫暖的光芒，你感到一股神秘的力量湧入體內。',choices:['繼續前進','返回村莊','尋找更多線索']},
      {text:'森林深處傳來奇怪的聲音，你決定……',choices:['深入探索','原路返回','尋找掩護']},
      {text:'你找到了一座隱藏的神殿，裡面似乎有寶藏。',choices:['進入神殿','在門外觀察','離開此地']},
      {text:'恭喜你完成了「森林的召喚」！你獲得了神秘的力量。',choices:['結束']}
    ]},
    {id:'s2',title:'沙漠神殿',chapters:7,scenes:[
      {text:'你跟隨地圖來到了茫茫沙漠，遠處隱約可見一座古老建築。',choices:['前往神殿','尋找水源','原地休息']},
      {text:'神殿入口前有兩條路，一條明亮一條陰暗。',choices:['走明亮的路','走陰暗的路','嘗試第三條路']},
      {text:'你發現了一間充滿機關的房間。',choices:['小心通過','暴力破解','尋找繞路']},
      {text:'深處的壁畫似乎在訴說一段歷史。',choices:['仔細研究','拍照記錄','無視繼續']},
      {text:'你遇到了守護神殿的石像鬼。',choices:['戰鬥','說服','逃跑']},
      {text:'石像鬼倒下後，露出一條通往密室的通道。',choices:['進入密室','警戒周圍','檢查戰利品']},
      {text:'恭喜你完成了「沙漠神殿」！古代的秘密已揭開。',choices:['結束']}
    ]}
  ];

  var story=storyList.find(function(s){return s.id===id});
  if(!story) return toast('⚠️ 故事資料載入失敗','bad');

  g.stories=g.stories||{};
  g.stories.current=id;
  g.stories.chapter=0;
  g.stories.choice=[];
  set(LS.users,get(LS.users,[]));

  storyScene(story,0);
}

function storyScene(story,chapter){
  if(!story||!story.scenes||chapter>=story.scenes.length) return storyEnd(story);
  var scene=story.scenes[chapter];
  var h='<div style="padding:10px">';
  h+='<div style="font-size:16px;font-weight:900;font-family:var(--serif);color:var(--gold2);margin-bottom:6px">📖 '+esc(story.title)+'</div>';
  h+='<div style="font-size:11px;color:var(--mut);margin-bottom:12px">第 '+(chapter+1)+'/'+story.scenes.length+' 章</div>';
  h+='<div class="panel2" style="margin-bottom:14px;font-size:13px;line-height:1.8;border-left:4px solid var(--gold2)">'+esc(scene.text)+'</div>';
  h+='<div style="display:flex;flex-direction:column;gap:8px">';
  scene.choices.forEach(function(c,i){
    h+='<button class="btn" onclick="storyChoice(\''+story.id+'\','+chapter+','+i+')">'+esc(c)+'</button>';
  });
  h+='</div></div>';
  openModal(h);
}

function storyChoice(storyId,chapter,choiceIdx){
  var u=me(); if(!u) return;
  u.g.stories=u.g.stories||{};
  u.g.stories.choice=u.g.stories.choice||[];
  u.g.stories.choice[chapter]=choiceIdx;
  u.g.stories.chapter=chapter+1;
  set(LS.users,get(LS.users,[]));

  var storyList=[
    {id:'s1',title:'森林的召喚',chapters:5,scenes:[
      {text:'你在村莊邊緣的森林散步時，發現了一個發光的符文石。',choices:['拾起符文石','繞道離開','大聲呼救']},
      {text:'符文石發出溫暖的光芒，你感到一股神秘的力量湧入體內。',choices:['繼續前進','返回村莊','尋找更多線索']},
      {text:'森林深處傳來奇怪的聲音，你決定……',choices:['深入探索','原路返回','尋找掩護']},
      {text:'你找到了一座隱藏的神殿，裡面似乎有寶藏。',choices:['進入神殿','在門外觀察','離開此地']},
      {text:'恭喜你完成了「森林的召喚」！你獲得了神秘的力量。',choices:['結束']}
    ]},
    {id:'s2',title:'沙漠神殿',chapters:7,scenes:[
      {text:'你跟隨地圖來到了茫茫沙漠，遠處隱約可見一座古老建築。',choices:['前往神殿','尋找水源','原地休息']},
      {text:'神殿入口前有兩條路，一條明亮一條陰暗。',choices:['走明亮的路','走陰暗的路','嘗試第三條路']},
      {text:'你發現了一間充滿機關的房間。',choices:['小心通過','暴力破解','尋找繞路']},
      {text:'深處的壁畫似乎在訴說一段歷史。',choices:['仔細研究','拍照記錄','無視繼續']},
      {text:'你遇到了守護神殿的石像鬼。',choices:['戰鬥','說服','逃跑']},
      {text:'石像鬼倒下後，露出一條通往密室的通道。',choices:['進入密室','警戒周圍','檢查戰利品']},
      {text:'恭喜你完成了「沙漠神殿」！古代的秘密已揭開。',choices:['結束']}
    ]}
  ];
  var story=storyList.find(function(s){return s.id===storyId});
  if(story) storyScene(story,chapter+1);
}

function storyEnd(story){
  var u=me(); if(!u) return;
  var g=u.g;
  g.stories=g.stories||{};
  g.stories.completed=g.stories.completed||{};
  g.stories.completed[story.id]=true;
  g.stories.logs=g.stories.logs||[];
  g.stories.logs.push({id:story.id,title:story.title,result:'✅ 通關',ts:Date.now()});
  g.stories.current=null;
  var bonus={gold:200+g.lv*10,exp:100+g.lv*5};
  g.gold=(g.gold||0)+bonus.gold;
  g.exp=(g.exp||0)+bonus.exp;
  set(LS.users,get(LS.users,[]));
  closeModal();
  toast('🎉 故事完成！+'+bonus.gold+' 金幣 +'+bonus.exp+' 經驗');
  vStory();
}

function storyContinue(){
  var u=me(); if(!u) return;
  var current=u.g.stories&&u.g.stories.current;
  var chapter=u.g.stories&&u.g.stories.chapter||0;
  if(!current) return toast('⚠️ 沒有進行中的故事','bad');
  var storyList=[
    {id:'s1',title:'森林的召喚',chapters:5,scenes:[
      {text:'你在村莊邊緣的森林散步時，發現了一個發光的符文石。',choices:['拾起符文石','繞道離開','大聲呼救']},
      {text:'符文石發出溫暖的光芒，你感到一股神秘的力量湧入體內。',choices:['繼續前進','返回村莊','尋找更多線索']},
      {text:'森林深處傳來奇怪的聲音，你決定……',choices:['深入探索','原路返回','尋找掩護']},
      {text:'你找到了一座隱藏的神殿，裡面似乎有寶藏。',choices:['進入神殿','在門外觀察','離開此地']},
      {text:'恭喜你完成了「森林的召喚」！你獲得了神秘的力量。',choices:['結束']}
    ]},
    {id:'s2',title:'沙漠神殿',chapters:7,scenes:[
      {text:'你跟隨地圖來到了茫茫沙漠，遠處隱約可見一座古老建築。',choices:['前往神殿','尋找水源','原地休息']},
      {text:'神殿入口前有兩條路，一條明亮一條陰暗。',choices:['走明亮的路','走陰暗的路','嘗試第三條路']},
      {text:'你發現了一間充滿機關的房間。',choices:['小心通過','暴力破解','尋找繞路']},
      {text:'深處的壁畫似乎在訴說一段歷史。',choices:['仔細研究','拍照記錄','無視繼續']},
      {text:'你遇到了守護神殿的石像鬼。',choices:['戰鬥','說服','逃跑']},
      {text:'石像鬼倒下後，露出一條通往密室的通道。',choices:['進入密室','警戒周圍','檢查戰利品']},
      {text:'恭喜你完成了「沙漠神殿」！古代的秘密已揭開。',choices:['結束']}
    ]}
  ];
  var story=storyList.find(function(s){return s.id===current});
  if(story) storyScene(story,chapter);
}
window.vStory=vStory;
