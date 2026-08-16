/* ════════════════════════════════════════════
   共用模組（splitall.py 自動拆分）：被多個畫面共用，任一畫面用到才載入
   含 41 個單位：onlHtml, esc, fmt, pick, today, CFG, effMaxLv, SUBJ, CHARS, POOLS, EXPS, newGame…
   ════════════════════════════════════════════ */
function onlHtml(user){
  const un=(user&&(user.username||user.id))||'';
  const on=_onlineSet.has(un);
  return '<span class="onlBadge '+(on?'on':'off')+'" data-u="'+esc(un)+'">'+(on?'● 線上':'○ 離線')+'</span>';
}

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const fmt=t=>new Date(t).toLocaleString('zh-TW',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});

const pick=a=>a[(Math.random()*a.length)|0];

const today=()=>new Date().toDateString();

const CFG={

MAX_LV:300,lvMult:l=>+(1+(l-1)*.04).toFixed(2), /* 等級上限 300 */

needXp:l=>Math.floor(l*80+Math.pow(l,1.5)*20),

dRew:l=>({exp:Math.floor(8+l*1.6),crystal:Math.floor(3+l*.5),gold:Math.floor(8+l*2.5)}),

dropRate:l=>Math.min(.65,.08+l*.006),

dDesc:l=>l<=10?'簡單-基礎題':l<=20?'普通-進階題':l<=35?'中等-多步驟':l<=50?'中上-需思考':l<=65?'較難-觀念題':l<=80?'困難-陷阱++':l<=90?'極難-資優題':'地獄-超級難',

COMBO:{3:.03,6:.06,10:.12,15:.18,20:.25,30:.35},

GACHA:{single:30,ten:270,rates:{N:.5,R:.3,SR:.14,SSR:.05,UR:.01},pity:{SR:10,SSR:50,UR:100}},

ENH:{rate:{0:1,1:1,2:1,3:1,4:1,5:.8,6:.65,7:.5,8:.38,9:.28,10:.2,11:.14,12:.09,13:.05,14:.03},cost:l=>l<=3?1:l<=7?2:l<=11?3:5,pen:l=>l<=5?0:l<=9?1:l<=12?2:3},

STAR_COST:{2:5,3:10,4:20,5:40},STAR_BONUS:{1:1,2:1.3,3:1.6,4:2,5:2.5},

SIGN:{1:{t:'gold',n:100,d:'🪙 金幣 ×100'},2:{t:'crystal',n:50,d:'💠 水晶 ×50'},3:{t:'enhStone',n:10,d:'🔩 強化石 ×10'},4:{t:'starlight',n:5,d:'✨ 星光碎片 ×5'},5:{t:'gold',n:300,d:'🪙 金幣 ×300'},6:{t:'crystal',n:150,d:'💠 水晶 ×150'},7:{t:'diamond',n:10,d:'💎 鑽石 ×10'}},

RAR_C:{N:'#9ca3af',R:'#22c55e',SR:'#3b82f6',SSR:'#a855f7',UR:'#f59e0b'},

RAR_S:{N:'★',R:'★★',SR:'★★★',SSR:'★★★★',UR:'★★★★★'},

QUAL:['普通','優秀','精良','史詩','傳說'],

QUAL_C:{'普通':'#9ca3af','優秀':'#22c55e','精良':'#3b82f6','史詩':'#a855f7','傳說':'#f59e0b'},

QBASE:{'普通':5,'優秀':12,'精良':25,'史詩':50,'傳說':100},

UNLOCK:{1:1,31:5,51:10,71:20,86:30,96:40},

MILE:[100,500,1000,2000,3000,5000,8000,10000,15000,20000],

TRADE_MIN_RATIO:0.40, /* #9 交易價格不得低於物品價值 40% */

FORGE_RECIPES:[

{id:'r1',name:'鐵劍',slot:'武器',mats:{ironOre:3,starlight:1},rate:.85,qw:{'普通':50,'優秀':35,'精良':12,'史詩':3,'傳說':0},pool:['鐵劍','鋼鐵之刃']},

{id:'r2',name:'皮甲',slot:'胸甲',mats:{ironOre:2,starlight:1},rate:.85,qw:{'??':55,'??':30,'??':12,'??':3,'??':0},pool:['??','????']},

{id:'r3',name:'??',slot:'??',mats:{ironOre:2,starlight:2},rate:.8,qw:{'普通':50,'優秀':32,'精良':14,'史詩':4,'傳說':0},pool:['鐵盔','守衛頭盔']},

{id:'r4',name:'護腕',slot:'護腕',mats:{ironOre:1,starlight:2},rate:.8,qw:{'普通':52,'優秀':32,'精良':13,'史詩':3,'傳說':0},pool:['護腕','精鋼護腕']},

{id:'r5',name:'疾風鞋',slot:'鞋子',mats:{ironOre:2,starlight:3},rate:.75,qw:{'普通':45,'優秀':35,'精良':15,'史詩':5,'傳說':0},pool:['疾風鞋','迅捷之靴']},

{id:'r6',name:'項鍊',slot:'項鍊',mats:{ironOre:3,starlight:4},rate:.7,qw:{'普通':40,'優秀':35,'精良':18,'史詩':6,'傳說':1},pool:['項鍊','星辰項鍊']},

{id:'r7',name:'戒指',slot:'戒指',mats:{ironOre:3,starlight:5},rate:.65,qw:{'普通':38,'優秀':35,'精良':19,'史詩':7,'傳說':1},pool:['戒指','賢者之戒']},

{id:'r8',name:'傳說之劍',slot:'武器',mats:{ironOre:10,starlight:15},rate:.4,qw:{'普通':10,'優秀':25,'精良':35,'史詩':25,'傳說':5},pool:['傳說之劍','創世之刃']},

{id:'r9',name:'龍鱗甲',slot:'胸甲',mats:{ironOre:8,starlight:6,labMat:4},rate:.55,qw:{'普通':20,'優秀':32,'精良':28,'史詩':16,'傳說':4},pool:['龍鱗甲','炎龍胸鎧']},

{id:'r10',name:'賢者法杖',slot:'武器',mats:{ironOre:5,starlight:8,labMat:6},rate:.55,qw:{'普通':18,'優秀':30,'精良':30,'史詩':18,'傳說':4},pool:['賢者法杖','奧術權杖']},

{id:'r11',name:'星辰弓',slot:'武器',mats:{ironOre:6,starlight:10,labMat:5},rate:.5,qw:{'普通':15,'優秀':28,'精良':32,'史詩':20,'傳說':5},pool:['星辰弓','流星長弓']},

{id:'r12',name:'守護巨盾',slot:'護腕',mats:{ironOre:12,starlight:4,labMat:8},rate:.6,qw:{'普通':22,'優秀':33,'精良':27,'史詩':14,'傳說':4},pool:['守護巨盾','聖壁之盾']},

{id:'r13',name:'神聖護符',slot:'項鏈',mats:{ironOre:4,starlight:12,labMat:10},rate:.45,qw:{'普通':12,'優秀':26,'精良':34,'史詩':22,'傳說':6},pool:['神聖護符','天使墜飾']},

{id:'r14',name:'創世皇冠',slot:'頭盔',mats:{ironOre:15,starlight:20,labMat:15},rate:.35,qw:{'普通':5,'優秀':18,'精良':32,'史詩':32,'傳說':13},pool:['創世皇冠','永恆王冠']}

],

EXCH:[

{f:'crystal',fn:100,t:'gold',tn:200,d:'💠100 → 🪙200'},

{f:'gold',fn:200,t:'crystal',tn:30,d:'🪙200 → 💠30'},

{f:'honor',fn:20,t:'pkExtra',tn:1,d:'🏅榮譽幣20 → 🏟️PK挑戰券×1'},

{f:'quizPts',fn:50,t:'quizExtra',tn:1,d:'📖答題積分50 → ⚔️修煉場次數×1'},

{f:'honor',fn:100,t:'teammate',tn:'數學偵探',d:'🏅榮譽幣100 → 🤝稀有隊友「數學偵探」'},

{f:'labMat',fn:30,t:'pet',tn:'星辰鷹',d:'🧪實驗素材30 → 🐾限定寵物「星辰鷹」'},

{f:'gold',fn:500,t:'diamond',tn:1,d:'🪙500 → 💎1'},

{f:'starlight',fn:20,t:'diamond',tn:2,d:'✨20 → 💎2'},

{f:'gold',fn:300,t:'labMat',tn:10,d:'🪙300 → 🧪實驗素材10'},

{f:'crystal',fn:100,t:'labMat',tn:15,d:'💠100 → 🧪實驗素材15'}

],

EGGS:{'星空密碼':{t:'starAll',d:'全部角色 +1 星！'},'水晶祕寶':{t:'crystal',n:100,d:'獲得 100 💠！'},'森林之寶':{t:'diamond',n:5,d:'獲得 5 💎！'}}

};

function effMaxLv(){const m=window.getMaxLevel?window.getMaxLevel():CFG.MAX_LV;return Math.max(300,m)}

const SUBJ={

'數學':{c:'#ff5252',i:'📐',u:{'7上':['整數運算','因數倍數與分數','一元一次方程式','二元一次聯立方程','一元一次不等式','數線與絕對值'],'7下':['指數與科學記號','平方根與畢氏定理','因式分解','分式運算','一次函數'],'8上':['乘法公式','多項式加減','分式運算','一次不等式','函數圖形'],'8下':['三角形與全等','四邊形','圓與切線','比例線段','相似形'],'9上':['一元二次方程式','二次函數','判別式與根','餘式定理'],'9下':['圓與切線長','三角比','統計與機率','空間圖形']}},

'英文':{c:'#00e5ff',i:'🔤',u:{'7上':['Be動詞','代名詞','冠詞','Wh-問句','現在簡單式'],'7下':['現在進行式','There be 句型','助動詞 can','祈使句','介系詞'],'8上':['過去簡單式','頻率副詞','比較級與最高級','不定詞','動名詞'],'8下':['現在完成式','被動語態','關係代名詞','條件句','未來式'],'9上':['過去完成式','間接引語','分詞構句','假設語氣'],'9下':['總複習文法','閱讀技巧','克漏字','作文','聽力練習']}},

'國文':{c:'#448aff',i:'📖',u:{'7上':['論語選','孟子選','世說新語','唐詩選','宋詞選'],'7下':['古文選讀','現代散文','新詩','小說選讀','應用文'],'8上':['史記選','唐詩','宋詞','元曲','古文觀止'],'8下':['左傳選','戰國策','明清小說','現代散文','書信'],'9上':['論孟深讀','古文觀止','新詩賞析','小說'],'9下':['總複習','寫作','閱讀測驗','國學常識']}},

'自然':{c:'#69f0ae',i:'🔬',u:{'7上':['細胞與顯微鏡','光合作用','呼吸作用','酵素','生物分類'],'7下':['物質與變化','水溶液','空氣與燃燒','天氣','岩石與礦物'],'8上':['力與運動','壓力','浮力','溫度與熱','電與磁'],'8下':['光與聲音','電磁感應','化學反應速率','電池','有機物'],'9上':['地球與宇宙','板塊運動','天氣系統','能源'],'9下':['生態系','演化','遺傳','總複習']}},

'社會':{c:'#ffab40',i:'🌏',u:{'7上':['臺灣史前文化','荷西統治','臺灣位置','臺灣地形','個人與成長'],'7下':['明清時期','日治時期','臺灣氣候','人口與聚落','家庭與生活'],'8上':['中國上古史','秦漢時期','中國地形','中國氣候','學校生活'],'8下':['宋元明清','民國建立','世界地理','公民社會'],'9上':['世界史','世界區域地理','國家與憲法','政府運作'],'9下':['當代世界','全球化','國際組織','總複習']}},

'綜合活動':{c:'#ff6e40',i:'🧩',u:{'7上':['自我探索','人際關係','學習方法','生涯規劃'],'7下':['情緒管理','消費行為','休閒生活','環境教育'],'8上':['性別平等','法律常識','志願服務','防災教育'],'8下':['職業試探','理財教育','媒體素養','國際理解'],'9上':['升學輔導','壓力調適','生命教育','公民參與'],'9下':['畢業準備','生涯決策','社會適應','總複習']}},

'健體':{c:'#ea80fc',i:'🏃',u:{'7上':['籃球','游泳','田徑','羽球','健康飲食'],'7下':['排球','桌球','體操','足球','急救常識'],'8上':['籃球進階','壘球','舞蹈','網球','用藥安全'],'8下':['羽球進階','武術','韻律活動','游泳進階','心理健康'],'9上':['綜合球類','防身術','體能訓練','運動傷害'],'9下':['終身運動','健康體位','運動計畫','總複習']}},

'藝文':{c:'#b2ff59',i:'🎨',u:{'7上':['素描','水彩','直笛','合唱','版畫'],'7下':['水墨','書法','節奏樂器','戲劇','陶藝'],'8上':['透視圖法','色彩學','樂理','舞蹈','攝影'],'8下':['設計','工藝','音樂欣賞','劇場','動畫'],'9上':['藝術賞析','創作','合奏','編舞','多媒體'],'9下':['畢業製作','藝術評論','展演','總複習']}},

'科技':{c:'#18ffff',i:'💻',u:{'7上':['工程與結構','Scratch 程式','演算法','3D 建模','木工'],'7下':['Python 基礎','網頁 HTML/CSS','機電整合','雷射切割','感測器'],'8上':['Python 進階','數據分析','App 開發','Arduino','AI 體驗'],'8下':['App Inventor','物聯網','機器人','能源科技','創客'],'9上':['專題製作','程式競賽','資料庫','網路安全','科技倫理'],'9下':['AI 應用','未來科技','總複習','作品發表']}},

'輔導':{c:'#ffd54f',i:'🧭',u:{'7上':['自我認識','情緒覺察','人際溝通','適應新環境'],'7下':['壓力管理','時間規劃','衝突處理','生涯探索'],'8上':['自我肯定','網路安全','性別尊重','學習策略'],'8下':['家庭溝通','挫折調適','團體合作','職業認識'],'9上':['生涯抉擇','升學壓力','自我實現','人際關係'],'9下':['未來規劃','生涯輔導','心理健康','總複習']}}

};

const CHARS={

'見習法師':{r:'N',icon:'🧙',sk:[['魔力啟蒙','簡單題經驗+5%',{exp_easy_bonus:.05}],['幸運星','掉落率+2%',{drop_bonus:.02}]]},

'數學精靈':{r:'N',icon:'🧮',sk:[['數字感知','數學經驗+8%',{math_exp_bonus:.08}],['連擊共鳴','3連擊以上經驗+5%',{combo3_exp:.05}]]},

'英文仙子':{r:'N',icon:'🧚',sk:[['語感天賦','英文經驗+8%',{english_exp_bonus:.08}],['守護屏障','10%連擊保護',{combo_protect:.10}]]},

'國文書僮':{r:'N',icon:'📚',sk:[['文學素養','國文經驗+8%',{chinese_exp_bonus:.08}],['溫故知新','重練經驗+10%',{retry_exp_bonus:.10}]]},

'幾何戰士':{r:'R',icon:'📐',sk:[['精準打擊','掉落率+3%',{drop_bonus:.03}],['弱點洞察','20%連擊保護',{combo_protect:.20}],['金幣獵手','每題金幣+5',{gold_per_correct:5}]]},

'雷電忍者':{r:'R',icon:'🥷',sk:[['雷遁','困難題經驗+10%',{exp_hard_bonus:.10}],['連擊加速','連擊加成+3%',{combo_extra:.03}]]},

'海洋祭司':{r:'R',icon:'🌊',sk:[['潮汐祝福','自然經驗+10%',{science_exp_bonus:.10}],['水之屏障','15%連擊保護',{combo_protect:.15}],['海之力','PK戰力+5%',{pk_power_bonus:.05}]]},

'文學劍客':{r:'R',icon:'⚔️',sk:[['劍意','PK戰力+5%',{pk_power_bonus:.05}],['詩心','社會經驗+10%',{social_exp_bonus:.10}]]},

'暗影獵人':{r:'R',icon:'🏹',sk:[['暗影步','25%連擊保護',{combo_protect:.25}],['鷹眼','全經驗+5%',{all_exp_bonus:.05}]]},

'聖光牧師':{r:'R',icon:'✨',sk:[['神恩','每日任務獎勵+15%',{mission_bonus:.15}],['祝福','經驗+5%',{exp_bonus:.05}]]},

'時空旅人':{r:'SR',icon:'🌀',sk:[['時空加速','全經驗+12%',{all_exp_bonus:.12}],['時空屏障','35%連擊保護',{combo_protect:.35}],['機緣','掉落+5%',{drop_bonus:.05}]]},

'星光祭司':{r:'SR',icon:'🌟',sk:[['星光祈願','水晶+20%',{crystal_bonus:.20}],['雙倍連擊','連擊加成加倍',{combo_bonus_double:true}]]},

'龍族騎士':{r:'SR',icon:'🐲',sk:[['龍魂','PK戰力+12%',{pk_power_bonus:.12}],['龍鱗','品質提升+25%',{quality_up:.25}],['龍威','40%連擊保護',{combo_protect:.40}]]},

'鳳凰巫女':{r:'SR',icon:'🔮',sk:[['不死鳥','45%連擊保護',{combo_protect:.45}],['鳳焰','全經驗+10%',{all_exp_bonus:.10}]]},

'大魔導師':{r:'SR',icon:'🪄',sk:[['魔力增幅','強化成功+5%',{enhance_bonus:.05}],['雷霆','數學經驗+15%',{math_exp_bonus:.15}],['魔導威壓','PK+8%',{pk_power_bonus:.08}]]},

'寶藏獵人':{r:'SR',icon:'💰',sk:[['尋寶','掉落+8%',{drop_bonus:.08}],['疾風','速度加成+30%',{speed_bonus:.30}]]},

'聖輝天使':{r:'SSR',icon:'👼',sk:[['聖光庇護','全經驗+20%',{all_exp_bonus:.20}],['天使之盾','每日3次連擊保護',{combo_protect_daily:3}],['神賜','掉落+8%',{drop_bonus:.08}]]},

'月光女神':{r:'SSR',icon:'🌙',sk:[['月華','水晶+35%',{crystal_bonus:.35}],['月之守護','每日5次連擊保護',{combo_protect_daily:5}],['女神祝福','PK+15%',{pk_power_bonus:.15}]]},

'武神戰將':{r:'SSR',icon:'🛡️',sk:[['武神','PK戰力+18%',{pk_power_bonus:.18}],['戰利品','掉落+10% 品質+35%',{drop_bonus:.10,quality_up:.35}]]},

'賢者之石':{r:'SSR',icon:'💎',sk:[['鍊金','全經驗+18% 掉落+8%',{all_exp_bonus:.18,drop_bonus:.08}],['點石成金','領土加成',{territory_bonus:true}],['賢者','品質+30%',{quality_up:.30}]]},

'創世之神':{r:'UR',icon:'🌌',sk:[['創世','全經驗+30%',{all_exp_bonus:.30}],['神蹟','掉落+15% 品質100%提升',{drop_bonus:.15,quality_up:1}],['天命','保底-10抽',{pity_reduce:10}]]},

'永恆之王':{r:'UR',icon:'♾️',sk:[['永恆','全經驗+25%',{all_exp_bonus:.25}],['無盡','水晶+50%',{crystal_bonus:.50}],['王權','PK+20%',{pk_power_bonus:.20}]]},

'財富之神':{r:'UR',icon:'🏆',sk:[['財源','掉落+20% 金幣+50%',{drop_bonus:.20,gold_bonus:.50}],['聚寶盆','每日10次連擊保護',{combo_protect_daily:10}],['金運','品質+80%',{quality_up:.80}]]},

/* ── 擴充角色 50 ── */
'烈焰領主':{r:'UR',icon:'🔥',sk:[['烈焰風暴','全經驗+15%',{all_exp_bonus:.15}],['焚盡','掉落+10%',{drop_bonus:.10}],['火種','PK+8%',{pk_power_bonus:.08}]]},
'冰霜女王':{r:'SSR',icon:'❄️',sk:[['冰凍屏障','連擊保護30%',{combo_protect:.30}],['霜寒','PK+10%',{pk_power_bonus:.10}],['暴雪','水晶+15%',{crystal_bonus:.15}]]},
'大地守衛':{r:'SR',icon:'🪨',sk:[['磐石','防禦+20%',{defense_bonus:.20}],['地裂','金幣+15%',{gold_bonus:.15}],['震盪','強化+3%',{enhance_bonus:.03}]]},
'風行者':{r:'R',icon:'🌪️',sk:[['疾風步','速度+25%',{speed_bonus:.25}],['風刃','掉落+4%',{drop_bonus:.04}]]},
'光之祭司':{r:'SR',icon:'☀️',sk:[['聖光術','任務獎勵+10%',{mission_bonus:.10}],['淨化','連擊保護25%',{combo_protect:.25}]]},
'暗影刺客':{r:'SSR',icon:'🗡️',sk:[['暗殺','PK+15%',{pk_power_bonus:.15}],['潛行','掉落+8%',{drop_bonus:.08}],['毒刃','金幣+20%',{gold_bonus:.20}]]},
'聖騎士':{r:'SR',icon:'🛡️',sk:[['神聖護盾','連擊保護35%',{combo_protect:.35}],['正義','全經驗+6%',{all_exp_bonus:.06}]]},
'狂戰士':{r:'R',icon:'⚔️',sk:[['狂暴','連擊加成+5%',{combo_extra:.05}],['戰吼','困難題經驗+8%',{exp_hard_bonus:.08}]]},
'德魯伊':{r:'SR',icon:'🌿',sk:[['自然共鳴','自然經驗+15%',{science_exp_bonus:.15}],['變形','水晶+10%',{crystal_bonus:.10}]]},
'占星師':{r:'SSR',icon:'🔮',sk:[['星象預測','保底-5抽',{pity_reduce:5}],['命運','掉落+6%',{drop_bonus:.06}],['占卜','全經驗+8%',{all_exp_bonus:.08}]]},
'鍊金術士':{r:'R',icon:'🧪',sk:[['轉換','強化+4%',{enhance_bonus:.04}],['調和','鐵礦+20%',{iron_bonus:.20}]]},
'機械工程師':{r:'SR',icon:'⚙️',sk:[['裝甲','連擊保護20%',{combo_protect:.20}],['精算','金幣+18%',{gold_bonus:.18}]]},
'海盜船長':{r:'R',icon:'🏴‍☠️',sk:[['掠奪','掉落+3%',{drop_bonus:.03}],['航海','經驗+5%',{exp_bonus:.05}]]},
'維京戰士':{r:'SR',icon:'🪓',sk:[['狂怒','PK+10%',{pk_power_bonus:.10}],['硬皮','防禦+15%',{defense_bonus:.15}]]},
'武士':{r:'SSR',icon:'🎌',sk:[['居合斬','PK+18%',{pk_power_bonus:.18}],['武士道','全經驗+10%',{all_exp_bonus:.10}],['刀銘','品質+20%',{quality_up:.20}]]},
'忍者大師':{r:'R',icon:'🥷',sk:[['影分身','連擊保護15%',{combo_protect:.15}],['手裡劍','掉落+3%',{drop_bonus:.03}]]},
'少林武僧':{r:'SR',icon:'🧘',sk:[['氣功','經驗+10%',{exp_bonus:.10}],['鐵布衫','連擊保護25%',{combo_protect:.25}]]},
'埃及法老':{r:'UR',icon:'👑',sk:[['詛咒','PK+20%',{pk_power_bonus:.20}],['金字塔','水晶+40%',{crystal_bonus:.40}],['轉生','每日3次免死',{combo_protect_daily:3}]]},
'希臘英雄':{r:'SSR',icon:'🏛️',sk:[['神力','PK+15%',{pk_power_bonus:.15}],['勇氣','掉落+7%',{drop_bonus:.07}],['智慧','答題積分+15%',{quiz_pts_bonus:.15}]]},
'北歐神祇':{r:'UR',icon:'⚡',sk:[['雷神之鎚','全經驗+30%',{all_exp_bonus:.30}],['英靈殿','金幣+50%',{gold_bonus:.50}],['神域','保底-10抽',{pity_reduce:10}]]},
'量子學者':{r:'SR',icon:'🧬',sk:[['疊加','強化+5%',{enhance_bonus:.05}],['纏繞','連擊保護30%',{combo_protect:.30}]]},
'龍脈術士':{r:'SSR',icon:'🐉',sk:[['龍語','數學經驗+20%',{math_exp_bonus:.20}],['龍鱗','品質+25%',{quality_up:.25}],['龍焰','PK+12%',{pk_power_bonus:.12}]]},
'精靈射手':{r:'R',icon:'🏹',sk:[['鷹眼','困難題額外水晶',{hard_crystal_bonus:3}],['精準','掉落+4%',{drop_bonus:.04}]]},
'矮人鐵匠':{r:'SR',icon:'🔨',sk:[['鍛造大師','強化+8%',{enhance_bonus:.08}],['秘銀','鐵礦+30%',{iron_bonus:.30}]]},
'獸人酋長':{r:'R',icon:'🦷',sk:[['戰斧','PK+6%',{pk_power_bonus:.06}],['圖騰','經驗+5%',{exp_bonus:.05}]]},
'天使長':{r:'UR',icon:'👼',sk:[['神恩','全經驗+28%',{all_exp_bonus:.28}],['復活','每日1次連擊保護',{combo_protect_daily:1}],['聖裁','PK+18%',{pk_power_bonus:.18}]]},
'惡魔領主':{r:'SSR',icon:'😈',sk:[['魔焰','掉落+9%',{drop_bonus:.09}],['契約','金幣+25%',{gold_bonus:.25}],['深淵','水晶+20%',{crystal_bonus:.20}]]},
'時空行者':{r:'SSR',icon:'⏳',sk:[['時間暫停','連擊保護40%',{combo_protect:.40}],['平行','全經驗+12%',{all_exp_bonus:.12}]]},
'元素使':{r:'R',icon:'🌍',sk:[['地火風水','全科目+5%',{all_exp_bonus:.05}],['共鳴','連擊加成+3%',{combo_extra:.03}]]},
'星際獵人':{r:'SR',icon:'🚀',sk:[['雷射瞄準','PK+8%',{pk_power_bonus:.08}],['宇宙視野','掉落+5%',{drop_bonus:.05}]]},
'幻術師':{r:'R',icon:'🎭',sk:[['幻影','連擊保護10%',{combo_protect:.10}],['錯覺','PK+4%',{pk_power_bonus:.04}]]},
'聖殿騎士':{r:'SSR',icon:'⚜️',sk:[['聖盾','連擊保護45%',{combo_protect:.45}],['十字軍','全經驗+14%',{all_exp_bonus:.14}]]},
'黑魔法師':{r:'SR',icon:'🧿',sk:[['詛咒','PK+10%',{pk_power_bonus:.10}],['黑焰','掉落+5%',{drop_bonus:.05}]]},
'白魔法師':{r:'R',icon:'✨',sk:[['治癒','任務獎勵+8%',{mission_bonus:.08}],['祝福','經驗+4%',{exp_bonus:.04}]]},
'拳鬥士':{r:'R',icon:'👊',sk:[['連打','連擊加成+5%',{combo_extra:.05}],['鐵拳','強化+3%',{enhance_bonus:.03}]]},
'劍聖':{r:'UR',icon:'🗡️',sk:[['無雙','PK+25%',{pk_power_bonus:.25}],['劍意','全經驗+22%',{all_exp_bonus:.22}],['極意','品質+40%',{quality_up:.40}]]},
'槍神':{r:'SR',icon:'🔫',sk:[['狙擊','PK+12%',{pk_power_bonus:.12}],['速射','掉落+4%',{drop_bonus:.04}]]},
'弓神':{r:'R',icon:'🏹',sk:[['貫穿','困難題經驗+10%',{exp_hard_bonus:.10}],['神射','水晶+8%',{crystal_bonus:.08}]]},
'盾衛':{r:'R',icon:'🛡️',sk:[['防衛','連擊保護20%',{combo_protect:.20}],['堅韌','金幣+5%',{gold_bonus:.05}]]},
'突擊兵':{r:'SR',icon:'💣',sk:[['爆破','掉落+6%',{drop_bonus:.06}],['戰術','經驗+10%',{exp_bonus:.10}]]},
'醫護兵':{r:'R',icon:'🏥',sk:[['急救','任務獎勵+10%',{mission_bonus:.10}],['鼓舞','連擊保護10%',{combo_protect:.10}]]},
'通訊兵':{r:'SR',icon:'📡',sk:[['情報','答題積分+15%',{quiz_pts_bonus:.15}],['支援','全經驗+6%',{all_exp_bonus:.06}]]},
'特務':{r:'SSR',icon:'🕶️',sk:[['滲透','掉落+8%',{drop_bonus:.08}],['偽裝','PK+14%',{pk_power_bonus:.14}],['暗殺','金幣+20%',{gold_bonus:.20}]]},
'偵探':{r:'R',icon:'🔍',sk:[['推理','社會經驗+12%',{social_exp_bonus:.12}],['觀察','掉落+3%',{drop_bonus:.03}]]},
'寶藏獵人・改':{r:'SR',icon:'💰',sk:[['尋寶','掉落+10%',{drop_bonus:.10}],['幸運','品質+15%',{quality_up:.15}]]},
'冒險王':{r:'R',icon:'🧭',sk:[['導航','領土加成',{territory_bonus:true}],['生存','經驗+5%',{exp_bonus:.05}]]},
'考古學家':{r:'SR',icon:'🏺',sk:[['古物','社會經驗+15%',{social_exp_bonus:.15}],['修復','強化+5%',{enhance_bonus:.05}]]},
'生態學家':{r:'R',icon:'🌳',sk:[['生態','自然經驗+12%',{science_exp_bonus:.12}],['保育','水晶+5%',{crystal_bonus:.05}]]},
'基因學家':{r:'SSR',icon:'🧬',sk:[['突變','全經驗+16%',{all_exp_bonus:.16}],['演化','掉落+7%',{drop_bonus:.07}]]},
'太空人':{r:'UR',icon:'👨‍🚀',sk:[['失重','PK+18%',{pk_power_bonus:.18}],['探索','全經驗+24%',{all_exp_bonus:.24}],['星塵','水晶+45%',{crystal_bonus:.45}]]}

};

const POOLS={character:CHARS,pet:PETS,anime:ANIME,teammate:TEAMMATES};

const EXPS=[

{n:'🧪 酸鹼中和滴定',d:'用氫氧化鈉滴定醋酸，觀察 pH 變化',rw:{exp:80,crystal:15,labMat:8},st:['1. 準備醋酸溶液 50mL','2. 滴入酚酞指示劑數滴','3. 逐滴加入 NaOH 並搖晃','4. 觀察溶液由無色轉為粉紅色','5. 記錄數據並計算濃度'],kn:'酸 + 鹼 → 鹽 + 水，中和點 pH≈7'},

{n:'🔬 光學折射實驗',d:'觀察光線穿過不同介質的折射現象',rw:{exp:90,crystal:18,labMat:9},st:['1. 準備雷射筆與半圓形玻璃','2. 調整入射角 30°','3. 觀察折射角變化','4. 測量入射角與折射角','5. 計算折射率 n=sin i/sin r'],kn:'司乃耳定律：n₁sinθ₁ = n₂sinθ₂'},

{n:'⚡ 電路模擬實驗',d:'組裝串聯與並聯電路，測量電流電壓',rw:{exp:100,crystal:20,labMat:10},st:['1. 準備電池、燈泡、導線','2. 組裝串聯電路','3. 測量各點電流','4. 改組並聯電路','5. 比較串並聯差異'],kn:'歐姆定律 V=IR；串聯電流相同，並聯電壓相同'},

{n:'⚗️ 金屬活性順序',d:'觀察金屬與酸反應的劇烈程度',rw:{exp:100,crystal:20,labMat:10},st:['1. 準備稀鹽酸與數種金屬','2. 分別放入鎂、鋅、鐵、銅','3. 觀察氣泡產生速率','4. 排出活性順序 Mg>Zn>Fe>Cu','5. 記錄實驗結果'],kn:'金屬活性越強，與酸反應越劇烈'},

{n:'💧 水的電解',d:'電解水產生氫氣與氧氣',rw:{exp:120,crystal:25,labMat:12},st:['1. 準備電解槽與電極','2. 加入少量電解質','3. 接通電源','4. 觀察兩極氣泡（陰極 H₂／陽極 O₂）','5. 測量體積比'],kn:'2H₂O → 2H₂↑ + O₂↑，體積比 2:1'},

{n:'🌿 光合作用觀察',d:'觀察水草在光下產生氣泡',rw:{exp:110,crystal:22,labMat:11},st:['1. 準備新鮮水草','2. 放入裝水的燒杯','3. 以漏斗與試管收集氣體','4. 光照一段時間','5. 以餘燼木條檢驗氧氣'],kn:'光合作用：CO₂ + H₂O →(光,葉綠素) 醣類 + O₂'},

{n:'🌋 小蘇打火山',d:'小蘇打粉＋醋產生二氧化碳',rw:{exp:90,crystal:18,labMat:9},st:['1. 堆出火山造型','2. 加入小蘇打粉','3. 倒入醋與色素','4. 觀察泡沫噴發','5. 記錄反應現象'],kn:'NaHCO₃ + CH₃COOH → CO₂↑ + H₂O + CH₃COONa'},

{n:'🧲 電磁感應實驗',d:'移動磁鐵穿過線圈產生感應電流',rw:{exp:115,crystal:23,labMat:11},st:['1. 準備線圈與靈敏電流計','2. 將磁鐵快速插入線圈','3. 觀察電流計指針偏轉','4. 改變磁鐵速度與方向','5. 歸納感應電流規律'],kn:'法拉第定律：磁通量變化產生感應電動勢'}

];

function newGame(){return{

lv:1,xp:0,needXp:CFG.needXp(1),

crystal:100,gold:200,diamond:5000,starlight:5,enhStone:5,protect:2,shield:0,ironOre:10,labMat:0,

honor:0,quizPts:0,pkExtra:0,quizExtra:0,guildCoin:0,

combo:0,forgeCount:0,forgeLv:1,

stats:{total:0,correct:0,maxCombo:0,hardCorrect:0,retry:0,enhance:0,missions:0,subj:{},milestones:[]},

gacha:{total:0,sinceSR:0,sinceSSR:0,sinceUR:0,hist:[],plv:1,pxp:0}, /* plv/pxp：卡池等級與升級進度（抽卡免費累積） */

owned:{character:[],pet:[],anime:[],teammate:[]},

equip:{character:null,pet:null,anime:null,teammate:null},

stars:{},collLv:{},awaken:[],weapons:[],blueprints:[],

titles:['t0'],equippedTitle:'t0',ach:{},

missions:{date:'',list:[]},shop:{date:'',items:[],bought:[],refreshes:0},

wrong:{},qSeen:[],qSeenTxt:[],territory:{owned:{},levels:{},target:'',targetDate:'',sweepDate:''},

pk:{win:0,lose:0,today:0,date:'',streak:0,maxStreak:0,gwUsed:0,firstWin:false},

arena:{floor:1,best:1}, /* #2 PK 無限競技塔 */

video:{date:'',count:0,watched:[]},rankClaim:{date:'',boards:[]},arenaClaim:'', /* 影片觀看獎勵、排行榜/競技塔每日排名獎勵領取紀錄 */

weekly:{wk:'',n:0,claimed:false}, /* 每週任務進度 */

energy:{date:'',sent:[],received:[]},streak:{date:'',count:0},groupId:null,guildId:null,

sign:{cycle:0,last:'',total:0},lab:[],potion:{at:'',bonus:0},

answerLog:[], /* 作答過程紀錄（供師/管端檢視：題目、選項、對錯、作答秒數、是否用計算機）*/

mail:[],rankMailDate:'', /* 📬 信箱：每日 21:00 自動發放排行榜獎勵到信箱 */

theme:'深邃星空',timeLock:true,diffMode:'精準',eggs:[],feedback:[],

doll:{list:[],shopBought:[]}, /* 娃娃系統：list=擁有娃娃，shopBought=已購買商店娃娃ID */

  /* ★ 裝備系統：owned=背包裝備清單，equipped=7個欄位已裝備ID */
  eq:{owned:[],equipped:{'頭':null,'衣服':null,'褲子':null,'鞋子':null,'武器':null,'戒指':null,'項鍊':null}},
  /* ★ 重新滾動統計值系統 */
  rr:{attr:{},pity:{stage:1,count:0},autoDelete:'ZZZ',autoOn:false,autoTimer:null,totalRolls:0},

}}

function maxDiff(g){let m=30;for(const k in CFG.UNLOCK)if(g.lv>=CFG.UNLOCK[k])m=+k+14;return Math.min(100,m)}

function itemValue(w){return Math.max(10, Math.floor(((CFG.QBASE[w.q]||5)+(w.lv||0)*8)*6));}

function fillGame(g){const base=newGame();if(!g||typeof g!=='object'||Array.isArray(g))return base;const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);const merge=(b,o)=>{if(Array.isArray(b)){if(Array.isArray(o))return o;if(isObj(o))return Object.values(o);return b}if(isObj(b)){const r={};const src=isObj(o)?o:{};for(const k in b)r[k]=merge(b[k],src[k]);for(const k in src)if(!(k in r))r[k]=src[k];return r}return o===undefined?b:o};return merge(base,g)}

function loginFX(name){ /* 登入成功→全螢幕過場動畫 */

const ov=document.createElement('div');

ov.style.cssText='position:fixed;inset:0;z-index:300;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 45%,rgba(36,52,94,.97),rgba(10,14,26,.985));animation:fadeOutFx .55s ease 1.05s forwards;pointer-events:none';

ov.innerHTML='<div style="font-size:66px;animation:swordIn .7s cubic-bezier(.2,1.4,.4,1) both">⚔️</div>'+

'<div style="font-family:var(--serif);font-size:24px;font-weight:900;color:var(--gold2);margin-top:12px;animation:riseIn .6s ease .18s both">歡迎回來，'+esc(name)+'！</div>'+

'<div style="font-size:13px;color:var(--mut);margin-top:8px;animation:riseIn .6s ease .34s both">正在進入全領域冒險世界…</div>';

document.body.appendChild(ov);

for(let i=0;i<10;i++){const sp=document.createElement('span');sp.style.cssText='position:fixed;font-size:'+(13+Math.random()*11)+'px;pointer-events:none;z-index:301;left:'+(Math.random()*100)+'vw;top:-24px;animation:goldRain '+(1+Math.random()*1.2)+'s ease-in forwards;animation-delay:'+(Math.random()*0.5)+'s';sp.textContent=['✨','🌟','⭐','💫'][i%4];document.body.appendChild(sp);setTimeout(()=>sp.remove(),2600)}

setTimeout(()=>ov.remove(),1750);

}

function checkSign(g){

const d=today();if(g.sign.last===d)return null;

const y=new Date(Date.now()-86400000).toDateString();

g.sign.cycle=(g.sign.last===y)?g.sign.cycle+1:1;g.sign.last=d;g.sign.total=(g.sign.total||0)+1;

const day=((g.sign.cycle-1)%7)+1,rw=CFG.SIGN[day];

g[rw.t==='enhStone'?'enhStone':rw.t]+=rw.n;

return{day,cycle:g.sign.cycle,rw};

}

let CUR={};

function back(t){return '<button class="btn ghost mini back" onclick="'+(t||'vHome()')+'">← 返回</button>'}

const Quiz={phase:'IDLE',mode:'normal',subj:'',sem:'',unit:'',diff:50,pub:'康軒版',useAI:true,q:null,sel:null,terrName:null,retrySubj:null,retryIdx:null,t0:0};

function qReset(){Quiz.phase='IDLE';Quiz.sel=null;Quiz.q=null}

function logAns(g,ok,el){

if(!Quiz||!Quiz.q)return;

const modeName={terr:'領土征服',retry:'錯題重練',pk:'競技場',weekend:'周末決鬥'}[Quiz.mode]||'修煉場';

const opts=Quiz.q['選項']||[];

g.answerLog=g.answerLog||[];

g.answerLog.push({sub:Quiz.subj||Quiz.retrySubj||'',unit:Quiz.unit||'',stem:String(Quiz.q['題目']||'').slice(0,120),

sel:opts[Quiz.sel]!=null?String(opts[Quiz.sel]).slice(0,40):'',ans:opts[Quiz.q['答案']]!=null?String(opts[Quiz.q['答案']]).slice(0,40):'',

calc:(()=>{const c=document.getElementById('calc');return !!(c&&String(c.value||'').trim())})(), /* 🧮 是否使用計算機草稿 */

calcText:(()=>{const c=document.getElementById('calc');return c?String(c.value||'').trim().slice(0,500):''})(), /* 🧮 計算機草稿內容（供老師看過程） */

ok:!!ok,sec:+el,mode:modeName,t:Date.now()});

if(g.answerLog.length>80)g.answerLog=g.answerLog.slice(-80);

}

function addWrong(g,subj,q,sel){

g.wrong[subj]=g.wrong[subj]||[];

g.wrong[subj].push({q:{'題目':q['題目'],'選項':q['選項'],'答案':q['答案'],'解析':q['解析']},sel,t:fmt(Date.now()),done:false});

if(g.wrong[subj].length>50)g.wrong[subj]=g.wrong[subj].slice(-50);

}

function getShop(g){

const d=today();

if(g.shop.date!==d){

g.shop.date=d;const pool=SHOP_POOL.slice();const items=[];

while(items.length<8&&pool.length){const it=JSON.parse(JSON.stringify(pool.splice((Math.random()*pool.length)|0,1)[0]));

it.disc=Math.random()<.3?(.6+Math.random()*.3):1;

it.hot=Math.random()<.25;items.push(it)}

g.shop.items=items;g.shop.bought=[];g.shop.refreshes=0;

}

return g.shop;

}

function gshopTabs(tab){return '<div class="tabRow" style="margin-bottom:10px"><button class="tabB '+(tab==='official'?'on':'')+'" onclick="CUR.gshopTab=\'official\';vGShop()">🏪 官方商店</button><button class="tabB '+(tab==='market'?'on':'')+'" onclick="CUR.gshopTab=\'market\';vGShop()">🛒 玩家市集</button></div>'}

const st=(l,v)=>'<div class="panel2 statIt"><span>'+l+'</span><b>'+v+'</b></div>';

function importQuestions(qs,log){
  const el=log||document.getElementById('hwQsImportLog');
  if(!Array.isArray(qs)||!qs.length){if(el)el.textContent='⚠️ 檔案中沒有可用的題目';return}
  let ok=0;const bad=[];
  qs.forEach((q,i)=>{
    const v=validateQuestion(q);
    if(!v.ok){bad.push('第 '+(i+1)+' 題：'+v.msg);return}
    q.id=newQid();if(!q['解析'])q['解析']='（未提供解析）';PUB.qs.push(q);ok++;
  });
  renderPubQs();
  if(el)el.textContent=bad.length?('✅ 匯入 '+ok+' 題；略過 '+bad.length+' 題：'+bad.slice(0,5).join('；')):('✅ 成功匯入 '+ok+' 題');
}

function renderPubQs(){

const el=document.getElementById('pubQs');if(!el)return;

el.innerHTML=PUB.qs.map((q,i)=>'<div class="panel2" style="margin-bottom:6px;display:flex;gap:8px;align-items:center"><span style="flex:1;font-size:12.5px">'+(i+1)+'. '+esc(q['題目'])+'</span><button class="btn danger mini" onclick="PUB.qs.splice('+i+',1);renderPubQs()">🗑</button></div>').join('')||'<p style="font-size:12px;color:var(--mut)">尚未加入題目</p>';

}

function showCalc(i){

const a=(window._alogView||[])[i];if(!a)return;

const txt=a.calcText||'（學生未留下計算草稿）';

let pop=document.getElementById('calcPop');if(pop)pop.remove();

pop=document.createElement('div');pop.id='calcPop';

pop.style.cssText='position:fixed;inset:0;z-index:130;background:rgba(4,8,16,.75);display:flex;align-items:center;justify-content:center;padding:20px';

pop.onclick=e=>{if(e.target.id==='calcPop')pop.remove()};

pop.innerHTML='<div class="panel" style="max-width:460px;width:100%;padding:20px"><h3 class="mt">🧮 計算過程</h3>'+

'<p class="msub">'+esc(a.sub||'')+'｜'+esc(a.stem||'')+'</p>'+

'<pre class="calc" style="white-space:pre-wrap;word-break:break-all;padding:12px;border-radius:8px;max-height:50vh;overflow:auto;margin:0">'+esc(txt)+'</pre>'+

'<div class="mBtns"><button class="btn" onclick="document.getElementById(\'calcPop\').remove()">關閉</button></div></div>';

document.body.appendChild(pop);

}

function add2048(){const s=CUR.g2048;const em=[];s.b.forEach((v,i)=>{if(!v)em.push(i)});if(!em.length)return;s.b[em[(Math.random()*em.length)|0]]=Math.random()<.9?2:4}

function can2048(){const b=CUR.g2048.b;for(let i=0;i<16;i++){if(!b[i])return true;const r=i%4;if(r<3&&b[i]===b[i+1])return true;if(i<12&&b[i]===b[i+4])return true}return false}

function snakeFood(){const st=CUR.snake;let p;do{p=[(Math.random()*20)|0,(Math.random()*20)|0]}while(st.s.some(q=>q[0]===p[0]&&q[1]===p[1]));st.f=p}

function snakeDir(dx,dy){const st=CUR.snake;if(!st||st.over)return;if(dx!==-st.d[0]||dy!==-st.d[1])st.nd=[dx,dy]}

function gmkWin(p){
const b=CUR.gmk.b;
for(let y=0;y<15;y++)for(let x=0;x<15;x++){
if(b[y*15+x]!==p)continue;
for(const d of [[1,0],[0,1],[1,1],[1,-1]]){
let k=1;while(k<5){const nx=x+d[0]*k,ny=y+d[1]*k;if(nx<0||nx>=15||ny<0||ny>=15||b[ny*15+nx]!==p)break;k++}
if(k>=5)return true}}
return false}

function gmkAI(){
const b=CUR.gmk.b;let best=-1,bs=-1;
for(let i=0;i<225;i++){
if(b[i])continue;
const x=i%15,y=(i/15)|0;
let sc=0;
for(const d of [[1,0],[0,1],[1,1],[1,-1]]){
for(const p of [2,1]){
let cnt=0;
for(let k=1;k<5;k++){const nx=x+d[0]*k,ny=y+d[1]*k;if(nx<0||nx>=15||ny<0||ny>=15||b[ny*15+nx]!==p)break;cnt++}
for(let k=1;k<5;k++){const nx=x-d[0]*k,ny=y-d[1]*k;if(nx<0||nx>=15||ny<0||ny>=15||b[ny*15+nx]!==p)break;cnt++}
sc+=(p===2?1.1:1)*Math.pow(10,cnt);
}}
sc+=Math.random();
if(sc>bs){bs=sc;best=i}}
return best}

function tetHit(m,px,py){const s=CUR.tet;
for(let y=0;y<m.length;y++)for(let x=0;x<m[0].length;x++){
if(!m[y][x])continue;const nx=px+x,ny=py+y;
if(nx<0||nx>=10||ny>=20)return true;
if(ny>=0&&s.b[ny][nx])return true}
return false}

function tetRot(){const s=CUR.tet;const m=s.cur[0].map((_,i)=>s.cur.map(r=>r[i]).reverse());if(!tetHit(m,s.x,s.y))s.cur=m}

function dollPersonaPreview(){
  const pv=document.getElementById('dPersonaPrev');if(!pv)return;
  const el=(document.getElementById('dNewElement')||{}).value||'金';
  const mbti=((document.getElementById('dNewMbti')||{}).value||'INFJ').split(' ')[0];
  const name=((DOLL_ELT_EPI[el]||'靈玉')+'·'+(DOLL_MBTI_FULL[mbti]||mbti));
  const base=DOLL_ELT_NATURE[el]||'獨特';
  pv.innerHTML='<b>🧬 獨一無二的人格：'+esc(name)+'</b><div style="margin-top:4px;color:var(--mut)">'+esc(base)+'，結合「'+(DOLL_MBTI_TRAITS[mbti]||mbti)+'」的特質，會隨你的互動持續改變。</div>';
}

function selDollElement(e,el){
  document.querySelectorAll('.mbtiBtn').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel');document.getElementById('dNewElement').value=e;
  dollPersonaPreview();
}

function genEquipment(slot,dungeonTier){
  const rarity=rollEqRarity(dungeonTier);
  const name=rarity==='∞'?'∞神器·':'';
  let itemName=name;
  if(slot==='武器'){const w=pick(EQ_WEAPONS);itemName+=w.icon+' '+w.name}else{
    const prefixes={'頭':['鐵','鋼','精金','魔'],'衣服':['布','皮','鎧','板'],'褲子':['腿','膝','護'],'鞋子':['皮','戰','疾'],'戒指':['銀','金','秘'],'項鍊':['骨','玉','水晶']};
    const p=prefixes[slot]?.[Math.floor(Math.random()*4)]||'';itemName+=p+'裝';
  }
  const mainAttr=EQ_MAIN_ATTR[slot];
  const mainVal=Math.round((slot==='武器'?5:slot==='戒指'?3:slot==='項鍊'?2:slot==='鞋子'?1.5:slot==='頭'?2:slot==='衣服'?20:3)*({R:1,E:1.5,A:2,S:2.5,SS:3,SSS:3.5,Z:4,ZZ:5,ZZZ:6,'∞':8}[rarity]||1)*10)/10;
  const subN=eqSubCount(rarity);const subs=[];
  for(let i=0;i<subN;i++){const st=pick(EQ_SUB_STAT_POOL);subs.push({stat:st,value:parseFloat(eqSubValue(rarity,st).toFixed(2))})}
  return{id:'eq'+Date.now()+Math.random().toString(36).slice(2,6),name:itemName,rarity,slot,level:0,maxLevel:rarity==='∞'?150:100,mainAttr,mainValue:mainVal,subStats:subs};
}

function genFixedEquip(slot,rarity){
  const name=rarity==='∞'?'∞神器·':'';
  let itemName=name;
  if(slot==='武器'){const w=pick(EQ_WEAPONS);itemName+=w.icon+' '+w.name}else{
    const prefixes={'頭':['鐵','鋼','精金','魔'],'衣服':['布','皮','鎧','板'],'褲子':['腿','膝','護'],'鞋子':['皮','戰','疾'],'戒指':['銀','金','秘'],'項鍊':['骨','玉','水晶']};
    const p=prefixes[slot]?.[Math.floor(Math.random()*4)]||'';itemName+=p+'裝';
  }
  const mainAttr=EQ_MAIN_ATTR[slot];
  const mainVal=Math.round((slot==='武器'?5:slot==='戒指'?3:slot==='項鍊'?2:slot==='鞋子'?1.5:slot==='頭'?2:slot==='衣服'?20:3)*({R:1,E:1.5,A:2,S:2.5,SS:3,SSS:3.5,Z:4,ZZ:5,ZZZ:6,'∞':8}[rarity]||1)*10)/10;
  const subN=eqSubCount(rarity);const subs=[];
  for(let i=0;i<subN;i++){const st=pick(EQ_SUB_STAT_POOL);subs.push({stat:st,value:parseFloat(eqSubValue(rarity,st).toFixed(2))})}
  return{id:'eq'+Date.now()+Math.random().toString(36).slice(2,6),name:itemName,rarity,slot,level:0,maxLevel:rarity==='∞'?150:100,mainAttr,mainValue:mainVal,subStats:subs};
}
