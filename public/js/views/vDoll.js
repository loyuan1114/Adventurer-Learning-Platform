/* ════════════════════════════════════════════
   vDoll 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 22 個單位：DOLL_MBTI, DOLL_MBTI_FULL, DOLL_ELT_EPI, DOLL_ELT_NATURE, DOLL_MBTI_DELTA, DOLL_ELT_DELTA, DOLL_ELT, _dInputOpen, _dRand, _dDefaultMbti, _dPersonality, _dPersonaName…
   ════════════════════════════════════════════ */
const DOLL_ELEMENTS=['金','木','水','火','土']; const DOLL_MBTI=['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']; const DOLL_MBTI_TRAITS={INTJ:'策略觀察',INTP:'好奇研究',ENTJ:'領導果斷',ENTP:'創意辯證',INFJ:'深情洞察',INFP:'理想溫柔',ENFJ:'溫暖引導',ENFP:'熱情探索',ISTJ:'可靠守序',ISFJ:'細心守護',ESTJ:'務實管理',ESFJ:'親切照顧',ISTP:'冷靜實作',ISFP:'感性自由',ESTP:'勇敢行動',ESFP:'開朗感染'};

const DOLL_MBTI_FULL={INTJ:'建築師',INTP:'邏輯學家',ENTJ:'指揮官',ENTP:'辯論家',INFJ:'提倡者',INFP:'調停者',ENFJ:'主人公',ENFP:'競選者',ISTJ:'物流師',ISFJ:'守衛者',ESTJ:'總經理',ESFJ:'執政官',ISTP:'鑑賞家',ISFP:'探險家',ESTP:'企業家',ESFP:'表演者'};

const DOLL_ELT_EPI={'金':'金石','木':'靈木','水':'流水','火':'燄火','土':'磐土'};

const DOLL_ELT_NATURE={'金':'穩重睿智，重視承諾','木':'生機蓬勃，溫柔包容','水':'沉靜靈敏，善解人意','火':'熱情洋溢，敢想敢做','土':'敦厚踏實，堅守原則'};

const DOLL_MBTI_DELTA={INTJ:{logic:14,curiosity:6},INTP:{logic:12,curiosity:12},ENTJ:{logic:10,energy:6},ENTP:{curiosity:12,energy:8},INFJ:{empathy:14,warmth:8},INFP:{empathy:14,warmth:12},ENFJ:{warmth:14,empathy:10},ENFP:{energy:12,warmth:8},ISTJ:{logic:10},ISFJ:{empathy:10,warmth:8},ESTJ:{logic:8,energy:6},ESFJ:{warmth:12,empathy:8},ISTP:{logic:8,curiosity:6},ISFP:{empathy:10,warmth:6},ESTP:{energy:10,logic:4},ESFP:{energy:10,warmth:8}};

const DOLL_ELT_DELTA={'金':{logic:12},'木':{warmth:8,curiosity:4},'水':{empathy:12,warmth:4},'火':{energy:12,curiosity:6},'土':{logic:6,empathy:8}};

const DOLL_ELT={
  '金':{icon:'🪙',color:'#f6d365',border:'#b8860b',trait:'堅定睿智',bondRate:.75,talk:['（閃著沉穩的光）我會替你想清楚。','（認真端詳）細節也很重要。'],feed:['（仔細品嚐）很有價值的心意。']},
  '木':{icon:'🌿',color:'#8bd17c',border:'#3f8f4f',trait:'成長仁慈',bondRate:.9,talk:['（伸展枝葉）我們一起慢慢長大。','（溫柔地）今天也要照顧好自己。'],feed:['（枝葉舒展）好溫暖的心意。']},
  '風':{icon:'🌬️',color:'#7ff0dd',border:'#38d9c0',trait:'自由輕盈',bondRate:.8,
    talk:['（輕盈地飄動）好高好遠…','（轉了個圈）風告訴我一個秘密！','（翹起腳丫）呼～好舒服～','（閉眼感受）你聽，風在唱歌…'],
    feed:['（輕盈地吃下，像羽毛一樣飄起來）','（開心地轉圈）風的味道！','（飄來飄去）好好吃～']},
  '火':{icon:'🔥',color:'#ff8a65',border:'#e64a19',trait:'熱情衝動',bondRate:.6,
    talk:['（眼睛發亮）我想到一個超棒的計畫！','（握拳）讓我來做！現在就現在！','（燦爛笑）太好了太好了！','（激動地跳）我們一起來吧！'],
    feed:['（一口咬下，火花飛濺）好美味！','（吃得熱熱的）嗯～好滿足！','（開心地吃）哈哈哈太好吃了！']},
  '水':{icon:'💧',color:'#82b1ff',border:'#2979ff',trait:'溫柔包容',bondRate:.95,
    talk:['（輕輕微笑）你今天過得好嗎？','（安靜地看著你）我陪著你。','（像水一樣柔和）沒關係的，慢慢來。','（輕柔地）我懂你的感覺…'],
    feed:['（小口品嚐，表情溫柔）謝謝你。','（安靜地吃）好好吃…','（輕柔笑）你的心意我收到了。']},
  '土':{icon:'🌍',color:'#a1887f',border:'#5d4037',trait:'穩重可靠',bondRate:.7,
    talk:['（穩穩地站著）嗯，我聽懂了。','（沉穩地點頭）讓我來幫你。','（堅定的眼神）我會一直陪著你。','（踏實地）一步一步來就好。'],
    feed:['（穩穩地吃）嗯，很實在的味道。','（認真品嚐）這是大地的味道。','（滿意的點頭）很棒的點心。']}
};

let _dCur=null,_dChat=[],_dInputOpen=false;

function _dRand(a,b){return a+Math.random()*(b-a)}

function _dDefaultMbti(d){return DOLL_MBTI[(String(d.id||d.name||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0))%DOLL_MBTI.length]}

function _dPersonality(d){d.mbti=d.mbti||_dDefaultMbti(d);if(!d.personality||typeof d.personality.warmth!=='number'){const base={warmth:50,energy:50,curiosity:50,logic:50,empathy:50};const ed=DOLL_ELT_DELTA[d.element]||{};const md=DOLL_MBTI_DELTA[d.mbti]||{};Object.keys(base).forEach(k=>{base[k]=Math.max(0,Math.min(100,base[k]+(ed[k]||0)+(md[k]||0)))});d.personality=base;}return d.personality}

function _dPersonaName(d){const el=d.element||'金';const ep=DOLL_ELT_EPI[el]||'靈玉';const fn=DOLL_MBTI_FULL[d.mbti]||d.mbti;return ep+'·'+fn}

function _dPersonaDesc(d){const x=_dPersonality(d);const el=d.element||'金';const base=DOLL_ELT_NATURE[el]||'獨特';const tags=[];if(x.empathy>=65)tags.push('心思細膩、善於傾聽');if(x.logic>=65)tags.push('理性果斷、條理分明');if(x.curiosity>=65)tags.push('求知慾旺盛、愛問為什麼');if(x.warmth>=65)tags.push('待人溫暖、總在身旁');if(x.energy>=65)tags.push('活力四射、行動力強');const lows=[];if(x.empathy<=35)lows.push('偶爾顯得疏離');if(x.logic<=35)lows.push('有時憑感覺行事');if(x.energy<=35)lows.push('沉靜慢熱');const bond=d.bond||0;const mood=d.mood||50;const trust=d.trust||0;const bondLine=bond>=80?'與你默契深厚、心意相通':bond>=50?'與你愈來愈有默契':'正一步步向你敞開心房';return base+'，性格'+(tags.length?tags.slice(0,3).join('、'):'中庸沉穩')+(lows.length?'（'+lows.join('、')+'）':'')+'。'+bondLine+'。目前心情'+(mood>=65?'愉悅':mood>=35?'平穩':'低落')+'，對你的信任'+(trust>=65?'深厚':trust>=35?'漸增':'尚淺')+'。'}

function _dPersona(d){d.personaName=d.personaName||_dPersonaName(d);return{name:d.personaName,desc:_dPersonaDesc(d)}}

function _dEvolve(d,type,foodType){
  const x=_dPersonality(d);
  const evo={talk:{curiosity:2,warmth:1},pet:{empathy:2,warmth:1},feed:{}};
  const feed={sweet:{warmth:3},spicy:{energy:3},sour:{curiosity:3},bitter:{logic:3}};
  const ed=DOLL_ELT_DELTA[d.element]||{};
  const aff=ed.energy>ed.empathy?'energy':ed.empathy>ed.logic?'empathy':ed.logic>ed.warmth?'logic':ed.warmth?'warmth':'curiosity';
  const cur=(evo[type]||{});const fx=(type==='feed'&&foodType&&feed[foodType])?feed[foodType]:{};
  Object.keys(x).forEach(k=>{let delta=(cur[k]||0)+(fx[k]||0);if(k===aff)delta+=0.5;delta+=Math.random()>.5?0.6:-0.4;x[k]=Math.max(0,Math.min(100,Math.round((x[k]+delta)*10)/10))});
  d.personalityVersion=(d.personalityVersion||0)+1;d.personalityUpdatedAt=new Date().toISOString();
}

function _dTalkResp(doll,msg){
  const r=DOLL_ELT[doll.element]||DOLL_ELT['?'];
  const base=r.talk[Math.floor(Math.random()*r.talk.length)];
  if(doll.bond>80)return '（很有默契地）'+base;
  if(doll.bond>50)return base;
  return '（有點害羞地）'+base;
}

function _dPetResp(doll){
  const el=DOLL_ELT[doll.element]||DOLL_ELT['風'];
  const r={
    '風':['（輕盈地蹭你的手心，像一陣風）','（轉個圈，發出了輕快的聲音）','（飄來飄去，最後安靜下來）'],
    '火':['（身體微微發燙，蹭了蹭你）','（開心地跳了一下）','（溫暖地靠過來）'],
    '水':['（溫柔地貼近你）','（輕輕波動，像水面）','（安靜地靠在你身邊）'],
    '土':['（穩穩地靠過來）','（輕輕蹭了蹭，很踏實）','（安靜地陪伴著）']
  };
  return (r[doll.element]||r['風'])[Math.floor(Math.random()*(r[doll.element]||r['風']).length)];
}

function vDoll(){
  const u=me(),g=u.g;
  const d=_dGet();
  if(!g.doll)g.doll={list:[],shopBought:[]};
  if(!d.owned)d.owned=[];
  if(!d.shop)d.shop=[];
  _dSet(d);
  const owned=d.owned.filter(x=>x.owner===u.id);
  const shopDolls=d.shop||[];
  const evt=DOLL_EVENTS.find(e=>e.active&&(!e.startTime||e.startTime<=new Date().toISOString())&&(!e.endTime||e.endTime>=new Date().toISOString()));
  const mult=evt?evt.multiplier:1;
  $('#view').innerHTML=back('vHome()')+'<h3 class="vt">🌟 娃娃物語 <span class="vsub">風火水土・四屬性養成系統</span></h3>'+
    (evt?`<div class="panel2" style="margin-bottom:12px;border-left:4px solid var(--green);display:flex;align-items:center;gap:10px"><span style="font-size:22px">⚡</span><div style="flex:1"><b style="color:var(--green);font-size:13px">活動進行中：${evt.type==='bond_double'?'親密度獲取 x'+mult : evt.type==='exp_double'?'經驗值 x'+mult:'掉落率 x'+mult}</b></div><button class="btn ghost mini" onclick="vHome()">✕</button></div>`:'')+
    '<div style="display:flex;gap:10px;align-items:center;margin-bottom:14px;flex-wrap:wrap">'+
      '<button class="btn btn-primary" onclick="showDollCreate()">✨ 創造娃娃</button>'+
      '<button class="btn ghost" onclick="renderDollShop()">🛒 商店</button>'+
      '<span style="font-size:12px;color:var(--mut);margin-left:8px">持有：'+owned.length+' 隻｜總互動：'+owned.reduce((s,x)=>s+(x.interactCount||0),0)+' 次</span>'+
    '</div>'+
    '<div id="dollView">'+dollListHtml(owned,shopDolls,u,g,d,mult)+'</div>';
}

function dollStatHtml(label,label2,val,color){
  return '<div class="statBar"><div class="statLbl"><span>'+label2+'</span><span>'+Math.round(val)+'</span></div><div class="statTrack"><div class="statFill w" style="width:'+Math.min(100,Math.max(0,val))+'%;background:'+color+'"></div></div></div>';
}

function showDollTalkInput(){
  document.getElementById('dollTalkInput').style.display='flex';
  document.getElementById('dollTalkTxt').focus();
}

function doDollTalk(){_dInputOpen=true;showDollTalkInput();}

let DOLL_EVENTS=[];
