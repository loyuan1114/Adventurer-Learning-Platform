/* ════════ 引擎：經驗/獎勵/連擊/掉落 ════════ */

function grantExp(g,diff,retry,subj){

if(!rewardOn(g))return 0;

let base=CFG.dRew(diff).exp;if(retry)base=Math.floor(base*1.5);

let m=CFG.lvMult(Math.min(g.lv,CFG.MAX_LV));

if(isEarly())m*=1.05;

/* 收藏與升星加成倍率（單獨計算，供明細顯示；5★覺醒��配最�� +275% = 總倍率 3.75）*/

let cm=1;

const e=effOf(g);cm*=(1+(e.all_exp_bonus||0)+(e.exp_bonus||0));

cm*=(1+0.10*(g.rebirth||0)); /* 🔁 傳承轉生��每次轉生永久全經驗+10% */

const sk={'數學':'math_exp_bonus','英文':'english_exp_bonus','國文':'chinese_exp_bonus','自然':'science_exp_bonus','社會':'social_exp_bonus'}[subj];

if(sk)cm*=(1+(e[sk]||0));

cm*=diff>=50?(1+(e.exp_hard_bonus||0)):(1+(e.exp_easy_bonus||0));

if(g.combo>=10&&e.combo10_exp_mult)cm*=e.combo10_exp_mult;

const baseV=Math.floor(base*m);

const xp=Math.floor(base*m*cm);

window._expCalc={base:baseV,pct:Math.round((cm-1)*100),xp:xp}; /* 供結算畫面顯示公式明細 */

g.xp+=xp;g.quizPts+=Math.floor(xp/5);updMission(g,'exp',xp);

while(g.xp>=g.needXp&&g.lv<effMaxLv()){g.xp-=g.needXp;g.lv++;g.needXp=CFG.needXp(g.lv);toast('🌟 等級提升！Lv.'+g.lv+' 【'+titleOf(g.lv)+'】');showLevelUpFX(g.lv)}

return xp;

}

function grantRew(g,diff,combo){

if(!rewardOn(g))return{crystal:0,gold:0,diamond:0};

const e=effOf(g);

let cr=Math.floor(CFG.dRew(diff).crystal*(1+(e.crystal_bonus||0)));

let au=CFG.dRew(diff).gold+(e.gold_per_correct||0);

au=Math.floor(au*(1+(e.gold_bonus||0)));

if(combo===5)cr+=5;if(combo===10)cr+=15;

if(diff>=50&&e.hard_crystal_bonus)cr+=e.hard_crystal_bonus;

let dm=Math.floor(cr*0.25);g.crystal+=cr;g.gold+=au;g.diamond=(Number(g.diamond)||0)+dm;return{crystal:cr,gold:au,diamond:dm};

}

function addCombo(g){g.combo++;if(g.combo>g.stats.maxCombo)g.stats.maxCombo=g.combo;updMission(g,'combo',g.combo)}

function resetCombo(g){

const e=effOf(g);

if((e.combo_protect||0)>0&&Math.random()<e.combo_protect)return false;

g.combo=0;return true;

}

function comboBonus(g){const e=effOf(g);let b=0;for(const t in CFG.COMBO)if(g.combo>=t)b=CFG.COMBO[t];

if(e.combo_bonus_double)b*=2;if(e.combo_multiplier)b*=e.combo_multiplier;return b+(e.combo_extra||0)}

function rollQuality(g){const e=effOf(g);let r=Math.random(),q;

q=r<.35?'普通':r<.65?'優秀':r<.85?'精良':r<.96?'史詩':'傳說';

if((e.quality_up||0)>0&&Math.random()<e.quality_up){const i=CFG.QUAL.indexOf(q);if(i<4)q=CFG.QUAL[i+1]}

return q;

}

function rollDrop(g,diff){

if(!rewardOn(g))return null;

if(g._nextDrop){g._nextDrop=false;return genDrop(g)}

const rate=CFG.dropRate(diff)+comboBonus(g)+(isEarly()?.03:0)+(effOf(g).drop_bonus||0)+0.05*(g.rebirth||0); /* 🔁 轉生每次掉落+5% */

return Math.random()<rate?genDrop(g):null;

}

function genDrop(g){

const r=Math.random();

if(r<.18){const c=2+((Math.random()*7)|0);g.enhStone+=c;return{t:'🔩 強化石 ×'+c}}

if(r<.26){const c=1+((Math.random()*3)|0);g.ironOre+=c;return{t:'⛏️ 鐵礦 ×'+c}}

if(r<.36){g.protect++;return{t:'🛡️ 保護卷軸 ×1'}}

if(r<.48){const c=10+((Math.random()*31)|0);g.crystal+=c;return{t:'💠 水晶 ×'+c}}

if(r<.60){const c=20+((Math.random()*61)|0);g.gold+=c;return{t:'🪙 金幣 ×'+c}}

if(r<.70){const c=1+((Math.random()*5)|0);g.starlight+=c;return{t:'✨ 星光碎片 ×'+c}}

if(r<.78){const c=2+((Math.random()*5)|0);g.labMat+=c;return{t:'🧪 實驗素材 ×'+c}}

const q=rollQuality(g),slot=pick(['頭盔','胸甲','護腕','鞋子','項鍊','戒指']);

g.weapons.push({n:q+slot,q,lv:0,slot});

return{t:'🛡️ '+q+slot+'（新裝備）'};

}

/* 📝 作答過程紀錄：供師/管端檢視（題目、選項、對錯、作答秒數，最多保留 60 筆）*/


function recordAns(g,ok,diff,subj){

g.stats.total++;updMission(g,'answer',ok?1:0);updMission(g,'answerTotal',1);

if(diff>=50)updMission(g,'hard',ok?1:0);

if(ok){g.stats.correct++;if(diff>=50)g.stats.hardCorrect=(g.stats.hardCorrect||0)+1;

if(subj)g.stats.subj[subj]=(g.stats.subj[subj]||0)+1;

if(guildOf(g)){g.guildCoin=(g.guildCoin||0)+1} /* 在公會時每答對一題 +1 公會幣 */

}

}


function checkTitlesAch(g){

for(const t of TITLES)if(t.chk(g)&&!g.titles.includes(t.id)){g.titles.push(t.id);toast('🎖 解鎖稱號：'+t.n)}

for(const a of ACH){

const p=a.prog(g);const claimed=g.ach[a.id]||0;

a.stages.forEach((s,i)=>{if(p>=s.g&&i===claimed){

g.ach[a.id]=i+1;

if(s.rw.gold)g.gold+=s.rw.gold;if(s.rw.crystal)g.crystal+=s.rw.crystal;if(s.rw.diamond)g.diamond+=s.rw.diamond;

if(s.rw.starlight)g.starlight+=s.rw.starlight;if(s.rw.ironOre)g.ironOre+=s.rw.ironOre;

if(s.rw.enhStone)g.enhStone+=s.rw.enhStone;if(s.rw.labMat)g.labMat+=s.rw.labMat;if(s.rw.honor)g.honor+=s.rw.honor;

toast('🏅 成就達成：'+a.n+'（階段'+(i+1)+'）');

}});

}

const pw=power(g);

for(const m of CFG.MILE)if(pw>=m&&!g.stats.milestones.includes(m)){g.stats.milestones.push(m);g.diamond+=3;g.crystal+=50;toast('⚡ 戰力里程碑 '+m+'！+3💎 +50💠')}

}

/* ════════ #7 收藏四分頁＋升星/強化分流說明 ════════ */


/* ════════════════════════════════════════════
   vColl 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 5 個單位：imgQOf, collImg, collLvOf, collLvCost, vColl
   ════════════════════════════════════════════ */
function imgQOf(name,cat){const sfx={character:' 奇幻角色 插畫',pet:' 奇幻寵物 插畫',anime:' 動漫風格 動漫角色',teammate:' 動漫 隊友 組隊小隊 角色'}[cat]||' 插畫';return encodeURIComponent(name+sfx)}

function collImg(name,cat,icon,px){px=px||52;return '<img src="https://tse2.mm.bing.net/th?q='+imgQOf(name,cat)+'&w='+(px*2)+'&h='+(px*2)+'&c=7&rs=1" alt="" loading="lazy" style="width:'+px+'px;height:'+px+'px;border-radius:10px;object-fit:cover;background:rgba(0,0,0,.25)" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'\'"><span style="display:none;font-size:'+Math.round(px*.72)+'px;line-height:1">'+icon+'</span>'}

const collLvOf=(g,n)=>((g.collLv||{})[n])||1;

const collLvCost=lv=>({au:120+lv*80,cr:25+lv*15});

/* ════════════════════════════════════════════
   vColl 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vColl
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vColl 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vColl
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vColl 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vColl
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vColl 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vColl
   ════════════════════════════════════════════ */
async function vColl(){
  if(!await needJs(['js/views/vColl.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vColl();
}






function equip(cat,n){const u=me();u.g.equip[cat]=n;saveU(u);hud();toast('✅ 已裝備 '+n);vColl()}

function starUp(n){const u=me(),g=u.g,star=g.stars[n]||1,cost=CFG.STAR_COST[star+1];

if(Number(g.starlight)<Number(cost))return toast('✨ 星光碎片不足（需 '+cost+'）','bad');

g.starlight=Number(g.starlight)-Number(cost);g.stars[n]=star+1;saveU(u);hud();toast('🌟 '+n+' 升至 '+(star+1)+' 星！技能倍率提升');vColl()}

function collLvUp(n){const u=me(),g=u.g;if(!g.collLv)g.collLv={};

const lv=collLvOf(g,n);const c=collLvCost(lv);

if(g.gold<c.au)return toast('🪙 金幣不足（需 '+c.au+'）','bad');

if(g.crystal<c.cr)return toast('💠 水晶不足（需 '+c.cr+'）','bad');

g.gold-=c.au;g.crystal-=c.cr;g.collLv[n]=lv+1;

saveU(u);hud();toast('⬆️ '+n+' 升至 Lv.'+(lv+1)+'！技能效果 +2%（等級無上限）');vColl()}

function awaken(n){const u=me(),g=u.g;

if(Number(g.starlight)<100||Number(g.diamond)<20)return toast('資源不足（需 ✨100 + 💎20）','bad');

g.starlight=Number(g.starlight)-100;g.diamond=Number(g.diamond)-20;g.awaken.push(n);

saveU(u);hud();toast('🔥 '+n+' 覺醒成功！技能效果 ×1.5');vColl()}

function autoTeam(){const u=me(),g=u.g;const rv={N:1,R:2,SR:3,SSR:4,UR:5};

for(const cat of ['character','pet','anime','teammate']){

const owned=g.owned[cat];if(!owned.length)continue;

owned.sort((a,b)=>rv[POOLS[cat][b].r]-rv[POOLS[cat][a].r]);

g.equip[cat]=owned[0];

}

saveU(u);hud();toast('🌟 已自動裝備最強陣容');vColl()}
