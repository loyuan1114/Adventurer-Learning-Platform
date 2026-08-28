/* vLangStudy — 語言學習 */
function vLangStudy(){
  const u=me(), g=u.g, lang=g.lang||{current:'zh-TW',learned:{},dailyStreak:0,lastStudy:0};
  const langs=[
    {code:'en',n:'English',em:'🇺🇸',native:'英語'},
    {code:'ja',n:'日本語',em:'🇯🇵',native:'日語'},
    {code:'ko',n:'한국어',em:'🇰🇷',native:'韓語'},
    {code:'fr',n:'Français',em:'🇫🇷',native:'法語'},
    {code:'de',n:'Deutsch',em:'🇩🇪',native:'德語'},
    {code:'es',n:'Español',em:'🇪🇸',native:'西班牙語'},
  ];
  let h=back()+'<h3 class="vt">🌍 語言學習 <span class="vsub">每日打卡・詞彙累積・會話練習</span></h3>';
  h+='<div class="panel2" style="margin-bottom:12px"><b>📅 今日進度</b>';
  const today=new Date().toDateString(), last=lang.lastStudy?new Date(lang.lastStudy).toDateString():null;
  const studiedToday=today===last;
  h+=`<div class="rwRow"><span class="rwChip">${studiedToday?'✅ 已學習':'⏳ 待學習'}</span><span class="rwChip">🔥 連續 ${lang.dailyStreak||0} 天</span><span class="rwChip">📖 累積單字 ${Object.keys(lang.learned||{}).length} 個</span></div>`;
  h+='<div class="rwRow" style="margin-top:8px">';
  langs.forEach(l=>{
    const learned=lang.learned?.[l.code]||0;
    h+=`<button class="rwChip ${lang.current===l.code?'active':''}" onclick="langSwitch('${l.code}')" style="font-size:12px;padding:6px 10px">${l.em} ${l.native} (${learned})</button>`;
  });
  h+='</div></div>';

  h+='<div class="panel2" style="margin-bottom:12px"><b>🎯 學習模式</b>';
  h+='<div class="rwRow"><button class="rwChip" onclick="langMode(\'vocab\')">📖 單字卡</button><button class="rwChip" onclick="langMode(\'listening\')">👂 聽力練習</button><button class="rwChip" onclick="langMode(\'speaking\')">🗣️ 口說跟讀</button><button class="rwChip" onclick="langMode(\'quiz\')">📝 閱讀測驗</button></div></div>';

  h+='<div class="panel2"><b>📝 單字卡練習</b>';
  const vocab={en:['hello','world','study','learn','language','practice','daily','progress','success','future'],ja:['こんにちは','世界','勉強','学習','言語','練習','毎日','進歩','成功','未来'],ko:['안녕하세요','세계','공부','학습','언어','연습','매일','진보','성공','미래']};
  const currentVocab=vocab[lang.current]||vocab.en;
  const word=currentVocab[Math.floor(Math.random()*currentVocab.length)];
  h+=`<div style="text-align:center;padding:20px"><div style="font-size:48px;margin-bottom:12px">${word}</div><button class="btn big" onclick="langMarkLearned('${word}')">📥 標記已學會</button><button class="btn ghost" style="margin-left:8px" onclick="vLangStudy()">🔄 換一個</button></div>`;
  h+='<div class="skTxt" style="margin-top:12px;text-align:center">今日新學：'+(lang.todayLearned||0)+' 詞</div></div>';
  $('#view').innerHTML=h;
}
function langSwitch(code){
  const u=me(); u.g.lang=u.g.lang||{current:'zh-TW'}; u.g.lang.current=code; set(LS.users,get(LS.users,[])); toast(`🌍 已切換至 ${code}`); vLangStudy();
}
function langMode(mode){
  const modes={vocab:'單字卡',listening:'聽力',speaking:'口說',quiz:'測驗'};
  toast(`🎯 進入 ${modes[mode]} 模式…`); setTimeout(()=>{if(typeof tGo==='function') tGo('quiz')},500);
}
function langMarkLearned(word){
  const u=me(); u.g.lang=u.g.lang||{current:'zh-TW',learned:{},dailyStreak:0,lastStudy:0,todayLearned:0};
  const lang=u.g.lang; lang.learned[lang.current]=lang.learned[lang.current]||{}; lang.learned[lang.current][word]=true;
  lang.todayLearned=(lang.todayLearned||0)+1;
  const today=new Date().toDateString(), last=lang.lastStudy?new Date(lang.lastStudy).toDateString():null;
  if(today!==last){lang.dailyStreak=(lang.dailyStreak||0)+1; lang.lastStudy=Date.now();}
  set(LS.users,get(LS.users,[])); toast(`✅ 已學會：「${word}」`); vLangStudy();
}