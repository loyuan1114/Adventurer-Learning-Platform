/* ════════ 設定 ════════ */


/* 實際升級上限：管理員可在控制台設定（下限 300，調高無上限）*/

/* ===== AI API 整合層：多供應商優先順序 OpenAI → DeepSeek → Gemini（禁用 2.0 Flash Lite）→ Qwen → Kimi ===== */
const GEMINI_MODELS=['gemini-3.5-flash-lite','gemini-3.6-flash'];
const AI_PROVIDERS={
openai:{n:'OpenAI GPT',type:'oa',url:'https://api.openai.com/v1/chat/completions',defModel:'gpt-4',models:['gpt-4','gpt-4o','gpt-4o-mini','gpt-4-turbo']},
deepseek:{n:'DeepSeek',type:'oa',url:'https://api.deepseek.com/chat/completions',defModel:'deepseek-v4',models:['deepseek-v4','deepseek-chat','deepseek-reasoner']},
gemini:{n:'Google Gemini',type:'gm',defModel:'gemini-3.5-flash-lite',models:['gemini-3.5-flash-lite','gemini-3.6-flash'],banned:['gemini-2.0-flash-lite']},
qwen:{n:'Qwen 通義千問',type:'oa',url:'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',defModel:'qwen3.8',models:['qwen3.8','qwen-plus','qwen-turbo']},
kimi:{n:'Moonshot Kimi',type:'oa',url:'https://api.moonshot.cn/v1/chat/completions',defModel:'kimi-3k',models:['kimi-3k','moonshot-v1-8k','moonshot-v1-32k']},
ollama:{n:'Ollama 本地',type:'ol',url:'/rest/v1/ai/ollama',defModel:'qwen2.5:0.6b',models:['qwen2.5:0.6b','qwen2.5:1.7b','qwen2.5:3b','qwen2.5:7b','qwen2.5:14b','qwen3:0.6b','qwen3:4b','deepseek-r1:1.7b','deepseek-r1:7b','llama3.2:1b','llama3.2:3b','phi3.5:3.8b'],keyHint:'Ollama 金鑰欄位請填主機位址（預設 http://127.0.0.1:11434）'}};
async function callAI(prompt,sys){
const data=get(LS.apiKeys,{keys:[],currentIndex:0,lastUsedTime:null});
if(!data.keys.length)throw new Error('沒有可用的 API 金鑰');
const _deadline=Date.now()+45000; /* 45 秒總超時，避免用戶長時間等待 */
for(const p of AI_PRIORITY){ /* 依供應商優先順序逐一備援切換 */
for(const k of data.keys.filter(x=>(x.provider||'gemini')===p)){
if(Date.now()>_deadline)break; /* 超過總時限即放棄 */
try{const txt=await callOneAI(k,prompt,sys);k.useCount=(k.useCount||0)+1;k.lastUsed=new Date().toISOString();set(LS.apiKeys,data);return txt}catch(e){}
}}
throw new Error('所有 API 金鑰均失敗（已依優先順序嘗試全部供應商）')}
async function callGemini(prompt,systemInstruction){return callAI(prompt,systemInstruction)}
function getNextApiKey(){const data=get(LS.apiKeys,{keys:[],currentIndex:0,lastUsedTime:null});if(!data.keys.length)return null;const now=Date.now();if(data.lastUsedTime&&(now-data.lastUsedTime)>30000){data.currentIndex=(data.currentIndex+1)%data.keys.length}const keyObj=data.keys[data.currentIndex];data.lastUsedTime=now;keyObj.useCount=(keyObj.useCount||0)+1;keyObj.lastUsed=new Date().toISOString();set(LS.apiKeys,data);return keyObj}
function advanceApiKey(){const data=get(LS.apiKeys,{keys:[],currentIndex:0,lastUsedTime:null});if(!data.keys.length)return null;data.currentIndex=(data.currentIndex+1)%data.keys.length;data.lastUsedTime=Date.now();set(LS.apiKeys,data);return data.keys[data.currentIndex]}
async function callGeminiLegacy(prompt,systemInstruction){let keyData=getNextApiKey();if(!keyData)throw new Error('沒有可用的 API 金鑰');const tried=new Set();while(keyData&&!tried.has(keyData.key)){tried.add(keyData.key);try{const model=keyData.model||'gemini-2.0-flash-lite';const url='https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent?key='+keyData.key;const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system_instruction:{parts:[{text:systemInstruction||'你是一個專業的出題助手。'}]},contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.7,maxOutputTokens:4096}})});if(!res.ok){keyData=advanceApiKey();continue;}const json=await res.json();if(!json.candidates||!json.candidates[0])throw new Error('No candidates');return json.candidates[0].content.parts[0].text}catch(e){keyData=advanceApiKey();}}throw new Error('所有 API 金鑰均失敗')}

/* ═══ callAIV2：整合自訂 providers + Gemini 用量平分 + 用量追蹤 ═══ */
function callAIGetProviders(){try{return get('ADV9_AI_PROVIDERS',{providers:[],usage:[]})}catch(e){return{providers:[],usage:[]}}}
function callAISetProviders(d){try{set('ADV9_AI_PROVIDERS',d)}catch(e){}}
function callAITrackUsage(pid,toks){
  var d=callAIGetProviders();var today=new Date().toISOString().slice(0,10);
  var ex=d.usage.find(function(u){return u.provider_id===pid&&u.date===today});
  if(ex){ex.call_count++;ex.tokens_used+=toks||0;}
  else{d.usage.push({date:today,provider_id:pid,call_count:1,tokens_used:toks||0});}
  var cutoff=new Date(Date.now()-7*86400000).toISOString().slice(0,10);
  d.usage=d.usage.filter(function(u){return u.date>=cutoff});
  callAISetProviders(d);
}
function callAIRateLimit(pid){
  var d=callAIGetProviders();var p=d.providers.find(function(x){return x.id===pid});
  if(!p)return true;
  var today=new Date().toISOString().slice(0,10);
  var todayU=d.usage.filter(function(u){return u.provider_id===pid&&u.date===today});
  var tc=todayU.reduce(function(s,u){return s+u.call_count},0);
  var tt=todayU.reduce(function(s,u){return s+u.tokens_used},0);
  /* Gemini 用量平分：若 rate_limit_per_hour=0 則自動計算 */
  var rl=p.rate_limit_per_hour;
  var tb=p.token_budget_per_day;
  if(p.provider_type==='gm'){
    var gmKeys=d.providers.filter(function(x){return x.provider_type==='gm'});
    if(gmKeys.length>1){
      /* 平分：基礎額度 / key 數量 */
      var baseRl=p._base_rate_limit||rl;
      var baseTb=p._base_token_budget||tb;
      if(!p._base_rate_limit&&rl>0){p._base_rate_limit=rl;p._base_token_budget=tb;callAISetProviders(d);}
      rl=Math.floor((p._base_rate_limit||60)/gmKeys.length);
      tb=Math.floor((p._base_token_budget||100000)/gmKeys.length);
    }
  }
  if(rl>0&&tc>=rl)return false;
  if(tb>0&&tt>=tb)return false;
  return true;
}
function callAIEstimateTokens(text){if(!text)return 0;return Math.ceil(text.length*1.5)}
async function callAICallEndpoint(provider,prompt,sys){
  var type=provider.provider_type||'oa';var timeout=provider.timeout||25000;
  var ac=new AbortController();var timer=setTimeout(function(){ac.abort()},timeout);
  try{
    if(type==='ol'){
      var res=await fetch('/rest/v1/ai/ollama',{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json',...(typeof WTOKEN!=='undefined'&&WTOKEN?{'x-adv9-token':WTOKEN}:{})},body:JSON.stringify({model:provider.model_name,host:provider.api_key||'http://127.0.0.1:11434',messages:[{role:'system',content:sys||'你是一個專業助手。'},{role:'user',content:prompt}],temperature:provider.temperature||0.7})});
      if(!res.ok)throw new Error('HTTP '+res.status);var j=await res.json();if(!j.message||!j.message.content)throw new Error('No content');return j.message.content;
    }
    if(type==='gm'){
      var url='https://generativelanguage.googleapis.com/v1beta/models/'+provider.model_name+':generateContent?key='+provider.api_key;
      var res2=await fetch(url,{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({system_instruction:{parts:[{text:sys||'你是一個專業助手。'}]},contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:provider.temperature||0.7,maxOutputTokens:provider.max_tokens||4096}})});
      if(!res2.ok)throw new Error('HTTP '+res2.status);var j2=await res2.json();if(!j2.candidates||!j2.candidates[0])throw new Error('No candidates');return j2.candidates[0].content.parts[0].text;
    }
    var res3=await fetch(provider.base_url,{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json','Authorization':'Bearer '+provider.api_key},body:JSON.stringify({model:provider.model_name,messages:[{role:'system',content:sys||'你是一個專業助手。'},{role:'user',content:prompt}],temperature:provider.temperature||0.7,max_tokens:provider.max_tokens||4096})});
    if(!res3.ok)throw new Error('HTTP '+res3.status);var j3=await res3.json();if(!j3.choices||!j3.choices[0])throw new Error('No choices');return j3.choices[0].message.content;
  }finally{clearTimeout(timer)}
}
async function callAIV2(prompt,sys,opts){
  opts=opts||{};
  var d=callAIGetProviders();
  for(var i=0;i<d.providers.length;i++){
    var p=d.providers[i];
    if(!callAIRateLimit(p.id))continue;
    try{var result=await callAICallEndpoint(p,prompt,sys);callAITrackUsage(p.id,callAIEstimateTokens(result));return result;}catch(e){}
  }
  return callAI(prompt,sys);
}

/* 將 AI 回應中的 LaTeX 語法轉換為一般可讀數學符號（含 JSON 轉義後的殘留物，如 \t+imes） */

/* ════════ 學科 ════════ */


/* ════════ 角色/寵物/動漫/隊友 ════════ */


const PETS={

'魔法小貓':{r:'N',icon:'🐱',sk:[['撒嬌','經驗+3%',{exp_bonus:.03}],['招財','金幣+5%',{gold_bonus:.05}]]},

'水藍龜':{r:'N',icon:'🐢',sk:[['潮汐','水晶+5%',{crystal_bonus:.05}],['硬殼','8%連擊保護',{combo_protect:.08}]]},

'書蟲':{r:'N',icon:'🐛',sk:[['啃書','國文經驗+5%',{chinese_exp_bonus:.05}],['蛻變','掉落+2%',{drop_bonus:.02}]]},

'閃電貂':{r:'R',icon:'🐿️',sk:[['雷光','經驗+8%',{exp_bonus:.08}],['敏捷','掉落+3%',{drop_bonus:.03}],['靜電','15%連擊保護',{combo_protect:.15}]]},

'小火龍':{r:'R',icon:'🦎',sk:[['龍息','20%連擊保護',{combo_protect:.20}],['龍威','PK+5%',{pk_power_bonus:.05}]]},

'冰晶兔':{r:'R',icon:'🐰',sk:[['冰鏡','速度+20%',{speed_bonus:.20}],['月影','掉落+4%',{drop_bonus:.04}]]},

'暗影鴉':{r:'R',icon:'🐦‍⬛',sk:[['暗襲','困難經驗+10%',{exp_hard_bonus:.10}],['夜眼','PK+5%',{pk_power_bonus:.05}]]},

'時空獸':{r:'SR',icon:'🦄',sk:[['時空跳躍','答錯後下次必掉落',{wrong_next_drop:true}],['加速','經驗+10%',{exp_bonus:.10}],['時停','30%連擊保護',{combo_protect:.30}]]},

'翡翠鹿':{r:'SR',icon:'🦌',sk:[['森之恩','強化+5%',{enhance_bonus:.05}],['靈光','品質+20%',{quality_up:.20}],['祝福','水晶+15%',{crystal_bonus:.15}]]},

'星辰鷹':{r:'SR',icon:'🦅',sk:[['星襲','PK+12%',{pk_power_bonus:.12}],['鷹眼','連擊加成×1.5',{combo_multiplier:1.5}]]},

'月光狼':{r:'SSR',icon:'🐺',sk:[['月嚎','全經驗+18%',{all_exp_bonus:.18}],['銀牙','掉落+8% 水晶+25%',{drop_bonus:.08,crystal_bonus:.25}],['月守','每日5次連擊保護',{combo_protect_daily:5}]]},

'彩虹龍':{r:'SSR',icon:'🐉',sk:[['虹光','掉落+12%',{drop_bonus:.12}],['龍鱗','品質+40%',{quality_up:.40}],['龍威','PK+15%',{pk_power_bonus:.15}]]},

'九尾狐':{r:'UR',icon:'🦊',sk:[['魅惑','經驗+25% 掉落+15%',{exp_bonus:.25,drop_bonus:.15}],['幻術','保底-8 品質+60%',{pity_reduce:8,quality_up:.60}],['妖火','金幣+30%',{gold_bonus:.30}]]},

'創世鳳凰':{r:'UR',icon:'🐦‍🔥',sk:[['涅槃','掉落+20%',{drop_bonus:.20}],['永焱','水晶+40% 每日10次保護',{crystal_bonus:.40,combo_protect_daily:10}],['神翼','PK+25%',{pk_power_bonus:.25}]]},

/* ── 擴充寵物 50 ── */
'岩漿蝸牛':{r:'R',icon:'🐌',sk:[['熔岩護甲','10%連擊保護',{combo_protect:.10}],['高溫','金幣+8%',{gold_bonus:.08}]]},
'冰晶企鵝':{r:'SR',icon:'🐧',sk:[['滑行','速度+25%',{speed_bonus:.25}],['堅冰','連擊保護20%',{combo_protect:.20}]]},
'閃電松鼠':{r:'R',icon:'🐿️',sk:[['電擊','掉落+4%',{drop_bonus:.04}],['敏捷','經驗+6%',{exp_bonus:.06}]]},
'幽靈貓':{r:'SSR',icon:'👻',sk:[['虛化','連擊保護35%',{combo_protect:.35}],['夜視','PK+10%',{pk_power_bonus:.10}],['靈體','水晶+20%',{crystal_bonus:.20}]]},
'寶石龜':{r:'SR',icon:'🐢',sk:[['堅殼','防禦+20%',{defense_bonus:.20}],['聚寶','金幣+25%',{gold_bonus:.25}]]},
'烈焰獨角獸':{r:'UR',icon:'🦄',sk:[['聖火','全經驗+20%',{all_exp_bonus:.20}],['獨角','品質+30%',{quality_up:.30}],['淨化','保底-5抽',{pity_reduce:5}]]},
'暗影狼':{r:'R',icon:'🐺',sk:[['狼嚎','PK+6%',{pk_power_bonus:.06}],['潛伏','掉落+4%',{drop_bonus:.04}]]},
'星辰蝶':{r:'SR',icon:'🦋',sk:[['星粉','水晶+18%',{crystal_bonus:.18}],['閃光','連擊保護15%',{combo_protect:.15}]]},
'機械龍':{r:'SSR',icon:'🤖',sk:[['鋼鐵之翼','掉落+10%',{drop_bonus:.10}],['雷射','PK+14%',{pk_power_bonus:.14}],['裝甲','連擊保護30%',{combo_protect:.30}]]},
'泡泡魚':{r:'N',icon:'🐟',sk:[['泡沫','連擊保護8%',{combo_protect:.08}],['水潤','金幣+5%',{gold_bonus:.05}]]},
'仙人掌':{r:'N',icon:'🌵',sk:[['尖刺','反傷3%',{thorns:.03}],['耐旱','經驗+3%',{exp_bonus:.03}]]},
'小石怪':{r:'R',icon:'🪨',sk:[['地震','金幣+10%',{gold_bonus:.10}],['岩盾','連擊保護15%',{combo_protect:.15}]]},
'風精靈':{r:'SR',icon:'🍃',sk:[['疾風','速度+30%',{speed_bonus:.30}],['隱形','掉落+5%',{drop_bonus:.05}]]},
'水精靈':{r:'R',icon:'💧',sk:[['治癒','任務獎勵+10%',{mission_bonus:.10}],['浪潮','水晶+10%',{crystal_bonus:.10}]]},
'火精靈':{r:'SSR',icon:'🔥',sk:[['烈焰','PK+12%',{pk_power_bonus:.12}],['高溫','金幣+20%',{gold_bonus:.20}],['燃燒','掉落+6%',{drop_bonus:.06}]]},
'土精靈':{r:'R',icon:'🪨',sk:[['大地','強化+4%',{enhance_bonus:.04}],['肥沃','鐵礦+20%',{iron_bonus:.20}]]},
'月兔':{r:'R',icon:'🐇',sk:[['月光','水晶+12%',{crystal_bonus:.12}],['跳躍','速度+15%',{speed_bonus:.15}]]},
'太陽鳥':{r:'SR',icon:'🐦',sk:[['日光','全經驗+8%',{all_exp_bonus:.08}],['輝煌','掉落+5%',{drop_bonus:.05}]]},
'星河鯨':{r:'UR',icon:'🐋',sk:[['星爆','全經驗+22%',{all_exp_bonus:.22}],['潮汐','水晶+40%',{crystal_bonus:.40}],['超光速','PK+16%',{pk_power_bonus:.16}]]},
'電鰻':{r:'R',icon:'🐍',sk:[['放電','連擊保護12%',{combo_protect:.12}],['導電','金幣+8%',{gold_bonus:.08}]]},
'冰蛇':{r:'SR',icon:'🐍',sk:[['凍結','PK+8%',{pk_power_bonus:.08}],['蛻皮','強化+5%',{enhance_bonus:.05}]]},
'火狐':{r:'SSR',icon:'🦊',sk:[['妖火','掉落+9%',{drop_bonus:.09}],['靈巧','速度+25%',{speed_bonus:.25}],['魅惑','PK+12%',{pk_power_bonus:.12}]]},
'木靈':{r:'R',icon:'🌲',sk:[['治癒','任務+8%',{mission_bonus:.08}],['生長','鐵礦+15%',{iron_bonus:.15}]]},
'金剛鸚鵡':{r:'R',icon:'🦜',sk:[['模仿','經驗+5%',{exp_bonus:.05}],['對話','社會+8%',{social_exp_bonus:.08}]]},
'幽靈蝠':{r:'SR',icon:'🦇',sk:[['超音波','掉落+5%',{drop_bonus:.05}],['暗影','連擊保護25%',{combo_protect:.25}]]},
'獨角甲蟲':{r:'R',icon:'🪲',sk:[['角力','強化+4%',{enhance_bonus:.04}],['堅���','防禦+10%',{defense_bonus:.10}]]},
'彩虹蛇':{r:'SR',icon:'���',sk:[['��彩','全��驗+10%',{all_exp_bonus:.10}],['蛻皮','品質+15%',{quality_up:.15}]]},
'鑽石龜':{r:'SSR',icon:'💎',sk:[['堅�������������可摧','連擊保護40%',{combo_protect:.40}],['聚財','金幣+30%',{gold_bonus:.30}]]},
'翡翠龍':{r:'UR',icon:'🐉',sk:[['青玉','水晶+35%',{crystal_bonus:.35}],['龍威','PK+20%',{pk_power_bonus:.20}],['翡翠','全經驗+18%',{all_exp_bonus:.18}]]},
'小鳳凰':{r:'SR',icon:'🐦‍🔥',sk:[['涅槃','復活1次',{combo_protect_daily:1}],['火焰','掉落+6%',{drop_bonus:.06}]]},
'黑豹':{r:'R',icon:'🐆',sk:[['獵殺','PK+6%',{pk_power_bonus:.06}],['夜行','掉落+4%',{drop_bonus:.04}]]},
'白熊':{r:'SR',icon:'🐻‍❄️',sk:[['蠻力','PK+10%',{pk_power_bonus:.10}],['厚皮','連擊保護20%',{combo_protect:.20}]]},
'小飛龍':{r:'R',icon:'🐲',sk:[['飛行','速度+15%',{speed_bonus:.15}],['噴火','金幣+8%',{gold_bonus:.08}]]},
'變色龍':{r:'N',icon:'🦎',sk:[['偽裝','連擊保護10%',{combo_protect:.10}],['伸舌','掉落+2%',{drop_bonus:.02}]]},
'樹懶':{r:'N',icon:'🦥',sk:[['慢活','任務獎勵+5%',{mission_bonus:.05}],['睡眠','經驗+2%',{exp_bonus:.02}]]},
'袋鼠':{r:'R',icon:'🦘',sk:[['跳擊','PK+5%',{pk_power_bonus:.05}],['育兒','任務+8%',{mission_bonus:.08}]]},
'無尾熊':{r:'N',icon:'🐨',sk:[['可愛','金幣+5%',{gold_bonus:.05}],['睡眠','連擊保護5%',{combo_protect:.05}]]},
'劍齒虎':{r:'SSR',icon:'🐯',sk:[['猛擊','PK+15%',{pk_power_bonus:.15}],['利齒','掉落+8%',{drop_bonus:.08}]]},
'長毛象':{r:'SR',icon:'🐘',sk:[['巨力','金幣+20%',{gold_bonus:.20}],['厚皮','連擊保護25%',{combo_protect:.25}]]},
'翼手龍':{r:'R',icon:'🦅',sk:[['俯衝','掉落+4%',{drop_bonus:.04}],['視野','經驗+6%',{exp_bonus:.06}]]},
'菊石':{r:'N',icon:'🐚',sk:[['化石','社會+5%',{social_exp_bonus:.05}],['漩渦','水晶+5%',{crystal_bonus:.05}]]},
'三葉蟲':{r:'R',icon:'🐜',sk:[['遠古','全經驗+4%',{all_exp_bonus:.04}],['堅韌','強化+3%',{enhance_bonus:.03}]]},
'迅猛龍':{r:'SSR',icon:'🦖',sk:[['速度','PK+13%',{pk_power_bonus:.13}],['爪擊','掉落+7%',{drop_bonus:.07}]]},
'三角龍':{r:'SR',icon:'🦕',sk:[['衝撞','PK+10%',{pk_power_bonus:.10}],['護盾','連擊保護30%',{combo_protect:.30}]]},
'滄龍':{r:'UR',icon:'🐊',sk:[['深海','水晶+35%',{crystal_bonus:.35}],['霸主','PK+18%',{pk_power_bonus:.18}],['古神','全經驗+20%',{all_exp_bonus:.20}]]},
'海豚':{r:'R',icon:'🐬',sk:[['聲納','掉落+4%',{drop_bonus:.04}],['靈活','速度+15%',{speed_bonus:.15}]]},
'虎鯨':{r:'SR',icon:'🐳',sk:[['狩獵','PK+10%',{pk_power_bonus:.10}],['族群','任務+12%',{mission_bonus:.12}]]},
'小丑魚':{r:'N',icon:'🐠',sk:[['共生','金幣+5%',{gold_bonus:.05}],['鮮豔','經驗+3%',{exp_bonus:.03}]]},
'水母':{r:'R',icon:'🪸',sk:[['毒刺','PK+5%',{pk_power_bonus:.05}],['發光','水晶+8%',{crystal_bonus:.08}]]},
'海馬':{r:'SR',icon:'🐴',sk:[['育兒','任務+15%',{mission_bonus:.15}],['優雅','掉落+5%',{drop_bonus:.05}]]}

};

const ANIME={

'熱血劍士':{r:'R',icon:'🗡️',o:'熱血少年漫',q:'我的劍，為了守護同伴而揮！',sk:[['熱血','經驗+8%',{exp_bonus:.08}],['劍氣','PK+5%',{pk_power_bonus:.05}]]},

'天才魔法師':{r:'R',icon:'🧙‍♂️',o:'魔法學院',q:'知識就是最強的魔法。',sk:[['冥想','10%連擊保護',{combo_protect:.10}],['智慧','PK+8%',{pk_power_bonus:.08}]]},

'元氣少女':{r:'R',icon:'🎀',o:'校園物語',q:'加油加油！你一定可以的！',sk:[['打氣','自然經驗+12%',{science_exp_bonus:.12}],['幸運','掉落+3%',{drop_bonus:.03}]]},

'冷酷槍手':{r:'R',icon:'🎯',o:'西部傳奇',q:'我的子彈，從不落空。',sk:[['精準','困難題額外5水晶',{hard_crystal_bonus:5}],['冷靜','強化+3%',{enhance_bonus:.03}]]},

'傳說勇者':{r:'SR',icon:'🛡️',o:'勇者傳說',q:'10 連擊時，力量將覺醒！',sk:[['覺醒','10連擊經驗×1.5',{combo10_exp_mult:1.5}],['勇氣','全經驗+8%',{all_exp_bonus:.08}],['鬥志','PK+10%',{pk_power_bonus:.10}]]},

'怪盜紳士':{r:'SR',icon:'🎩',o:'怪盜物語',q:'預告函已寄出，寶物我收下了。',sk:[['盜寶','掉落+8% 品質+30%',{drop_bonus:.08,quality_up:.30}],['身手','PK+12%',{pk_power_bonus:.12}]]},

'料理達人':{r:'SR',icon:'🍳',o:'美食獵人',q:'美味的料理能治癒一切！',sk:[['盛宴','社會經驗+15%',{social_exp_bonus:.15}],['分享','全經驗+5%',{all_exp_bonus:.05}],['刀工','PK+8%',{pk_power_bonus:.08}]]},

'劍聖前輩':{r:'SSR',icon:'⚔️',o:'劍道物語',q:'劍之道，在於心。',sk:[['劍心','全經驗+20%',{all_exp_bonus:.20}],['劍壓','PK+18%',{pk_power_bonus:.18}],['劍運','掉落+8%',{drop_bonus:.08}]]},

'魔法學園長':{r:'SSR',icon:'📖',o:'魔法學院',q:'學習，是最美的魔法。',sk:[['博學','全經驗+22%',{all_exp_bonus:.22}],['結界','每日5次連擊保護',{combo_protect_daily:5}],['威嚴','PK+15%',{pk_power_bonus:.15}]]},

'宇宙海賊':{r:'UR',icon:'🏴‍☠️',o:'星海冒險',q:'我的征途是星辰大海！',sk:[['霸氣','全經驗+30%',{all_exp_bonus:.30}],['掠奪','掉落+15% 水晶+50%',{drop_bonus:.15,crystal_bonus:.50}],['船長','PK+20% 保底-8',{pk_power_bonus:.20,pity_reduce:8}]]},

'時空旅者':{r:'UR',icon:'⏳',o:'時空物語',q:'時間會給出答案。',sk:[['時之王','PK每日1次必勝',{pk_guaranteed_win:1}],['時旅','全經驗+25%',{all_exp_bonus:.25}],['時運','掉落+15%',{drop_bonus:.15}]]},

/* ── 擴充動漫英雄／傳說 50 ── */
'劍心浪人':{r:'SR',icon:'🗡️',o:'傳說系列',sk:[['居合斬','PK+10%',{pk_power_bonus:.10}],['心眼','經驗+8%',{exp_bonus:.08}]]},
'炎之料理人':{r:'R',icon:'🍳',o:'傳說系列',sk:[['火焰料理','社會+10%',{social_exp_bonus:.10}],['飽足','任務+5%',{mission_bonus:.05}]]},
'冰之魔女':{r:'SSR',icon:'❄️',o:'傳說系列',sk:[['絕對零度','PK+15%',{pk_power_bonus:.15}],['冰盾','連擊保護35%',{combo_protect:.35}]]},
'雷之勇者':{r:'SR',icon:'⚡',o:'傳說系列',sk:[['雷鳴','全經驗+8%',{all_exp_bonus:.08}],['電光','掉落+6%',{drop_bonus:.06}]]},
'風之俠客':{r:'R',icon:'🎐',o:'傳說系列',sk:[['疾風','速度+20%',{speed_bonus:.20}],['風刃','掉落+4%',{drop_bonus:.04}]]},
'光之戰士':{r:'SSR',icon:'✨',o:'傳說系列',sk:[['聖光','PK+14%',{pk_power_bonus:.14}],['淨化','連擊保護30%',{combo_protect:.30}]]},
'暗之王子':{r:'UR',icon:'🌑',o:'傳說系列',sk:[['暗影','PK+22%',{pk_power_bonus:.22}],['虛無','全經驗+18%',{all_exp_bonus:.18}],['深淵','水晶+30%',{crystal_bonus:.30}]]},
'鋼之鍊金術師':{r:'SR',icon:'🔩',o:'傳說系列',sk:[['等價交換','強化+6%',{enhance_bonus:.06}],['煉成','鐵礦+30%',{iron_bonus:.30}]]},
'音之詩人':{r:'R',icon:'🎵',o:'傳說系列',sk:[['鎮魂曲','連擊保護15%',{combo_protect:.15}],['協奏','經驗+5%',{exp_bonus:.05}]]},
'花之妖精':{r:'SR',icon:'🌸',o:'傳說系列',sk:[['花粉','掉落+6%',{drop_bonus:.06}],['治癒','任務+10%',{mission_bonus:.10}]]},
'星之魔導士':{r:'SSR',icon:'🌠',o:'傳說系列',sk:[['流星','PK+12%',{pk_power_bonus:.12}],['星塵','水晶+25%',{crystal_bonus:.25}]]},
'月之祭司':{r:'R',icon:'🌙',o:'傳說系列',sk:[['月光','社會+10%',{social_exp_bonus:.10}],['祝福','經驗+4%',{exp_bonus:.04}]]},
'太陽神官':{r:'SR',icon:'☀️',o:'傳說系列',sk:[['烈日','金幣+20%',{gold_bonus:.20}],['神諭','掉落+5%',{drop_bonus:.05}]]},
'海之王者':{r:'SSR',icon:'🌊',o:'傳說系列',sk:[['海嘯','PK+15%',{pk_power_bonus:.15}],['潮汐','水晶+20%',{crystal_bonus:.20}]]},
'山之巨人':{r:'R',icon:'🏔️',o:'傳說系列',sk:[['重擊','PK+6%',{pk_power_bonus:.06}],['石膚','連擊保護20%',{combo_protect:.20}]]},
'林之獵手':{r:'SR',icon:'🌳',o:'傳說系列',sk:[['叢林','自然+15%',{science_exp_bonus:.15}],['陷阱','掉落+5%',{drop_bonus:.05}]]},
'沙漠法師':{r:'R',icon:'🏜️',o:'傳說系列',sk:[['沙暴','PK+6%',{pk_power_bonus:.06}],['乾旱','金幣+10%',{gold_bonus:.10}]]},
'冰原戰士':{r:'SR',icon:'❄️',o:'傳說系列',sk:[['寒冰','PK+10%',{pk_power_bonus:.10}],['堅韌','連擊保護25%',{combo_protect:.25}]]},
'火山祭司':{r:'SSR',icon:'🌋',o:'傳說系列',sk:[['熔岩','掉落+9%',{drop_bonus:.09}],['爆發','PK+13%',{pk_power_bonus:.13}]]},
'天空騎士':{r:'UR',icon:'☁️',o:'傳說系列',sk:[['雲霄','全經驗+24%',{all_exp_bonus:.24}],['風暴','PK+20%',{pk_power_bonus:.20}],['雷電','水晶+35%',{crystal_bonus:.35}]]},
'幻影盜賊':{r:'R',icon:'🎭',o:'傳說系列',sk:[['偷竊','掉落+4%',{drop_bonus:.04}],['幻術','連擊保護15%',{combo_protect:.15}]]},
'機械戰士':{r:'SR',icon:'🤖',o:'傳說系列',sk:[['裝甲','防禦+20%',{defense_bonus:.20}],['雷射','PK+10%',{pk_power_bonus:.10}]]},
'生化人':{r:'R',icon:'🧪',o:'傳說系列',sk:[['再生','任務+8%',{mission_bonus:.08}],['強化','經驗+6%',{exp_bonus:.06}]]},
'超能力者':{r:'SSR',icon:'🧠',o:'傳說系列',sk:[['念力','全經驗+14%',{all_exp_bonus:.14}],['預知','掉落+7%',{drop_bonus:.07}]]},
'宇宙刑警':{r:'SR',icon:'👮',o:'傳說系列',sk:[['正義','PK+10%',{pk_power_bonus:.10}],['追蹤','掉落+5%',{drop_bonus:.05}]]},
'時空巡邏者':{r:'UR',icon:'⏰',o:'傳說系列',sk:[['時間線','全經驗+22%',{all_exp_bonus:.22}],['修正','保底-8抽',{pity_reduce:8}]]},
'異界召喚師':{r:'SSR',icon:'📖',o:'傳說系列',sk:[['召喚','掉落+8%',{drop_bonus:.08}],['契約','PK+14%',{pk_power_bonus:.14}]]},
'惡魔獵人':{r:'R',icon:'🔫',o:'傳說系列',sk:[['狩獵','PK+6%',{pk_power_bonus:.06}],['聖水','連擊保護10%',{combo_protect:.10}]]},
'天使獵人':{r:'SR',icon:'🏹',o:'傳說系列',sk:[['狙擊','PK+10%',{pk_power_bonus:.10}],['淨化','掉落+5%',{drop_bonus:.05}]]},
'龍騎士':{r:'UR',icon:'🐉',o:'傳說系列',sk:[['龍騎','PK+25%',{pk_power_bonus:.25}],['龍焰','全經驗+20%',{all_exp_bonus:.20}],['龍鱗','品質+35%',{quality_up:.35}]]},
'獅子王':{r:'SR',icon:'🦁',o:'百獸之王',sk:[['獅吼','PK+12%',{pk_power_bonus:.12}],['獸王','金幣+15%',{gold_bonus:.15}]]},
'虎王':{r:'R',icon:'🐯',o:'百獸之王',sk:[['猛虎','PK+8%',{pk_power_bonus:.08}],['威嚇','掉落+3%',{drop_bonus:.03}]]},
'豹王':{r:'SR',icon:'🐆',o:'百獸之王',sk:[['獵豹','速度+25%',{speed_bonus:.25}],['尖爪','掉落+5%',{drop_bonus:.05}]]},
'狼王':{r:'SSR',icon:'🐺',o:'百獸之王',sk:[['狼群','任務+15%',{mission_bonus:.15}],['嚎叫','PK+12%',{pk_power_bonus:.12}]]},
'狐王':{r:'UR',icon:'🦊',o:'百獸之王',sk:[['妖狐','全經驗+25%',{all_exp_bonus:.25}],['幻術','品質+40%',{quality_up:.40}],['魅惑','PK+18%',{pk_power_bonus:.18}]]},
'熊王':{r:'R',icon:'🐻',o:'百獸之王',sk:[['巨力','金幣+10%',{gold_bonus:.10}],['厚皮','連擊保護15%',{combo_protect:.15}]]},
'象王':{r:'SR',icon:'🐘',o:'百獸之王',sk:[['碾壓','PK+10%',{pk_power_bonus:.10}],['記憶','經驗+8%',{exp_bonus:.08}]]},
'鯨王':{r:'SSR',icon:'🐋',o:'百獸之王',sk:[['巨浪','水晶+25%',{crystal_bonus:.25}],['迴聲','掉落+7%',{drop_bonus:.07}]]},
'鷹王':{r:'R',icon:'🦅',o:'百獸之王',sk:[['鷹眼','困難題+8%',{exp_hard_bonus:.08}],['翱翔','速度+15%',{speed_bonus:.15}]]},
'蛇王':{r:'SR',icon:'🐍',o:'百獸之王',sk:[['毒牙','PK+10%',{pk_power_bonus:.10}],['蛻變','強化+5%',{enhance_bonus:.05}]]},
'蠍王':{r:'R',icon:'🦂',o:'百獸之王',sk:[['毒刺','PK+6%',{pk_power_bonus:.06}],['堅硬','連擊保護10%',{combo_protect:.10}]]},
'蜘蛛王':{r:'SSR',icon:'🕷️',o:'百獸之王',sk:[['蛛網','連擊保護35%',{combo_protect:.35}],['毒液','PK+12%',{pk_power_bonus:.12}]]},
'蜈蚣王':{r:'R',icon:'🐛',o:'百獸之王',sk:[['多足','速度+15%',{speed_bonus:.15}],['毒霧','掉落+3%',{drop_bonus:.03}]]},
'甲蟲王':{r:'SR',icon:'🪲',o:'百獸之王',sk:[['鐵甲','防禦+20%',{defense_bonus:.20}],['角力','PK+8%',{pk_power_bonus:.08}]]},
'蝴蝶王':{r:'R',icon:'🦋',o:'百獸之王',sk:[['鱗粉','掉落+4%',{drop_bonus:.04}],['蛻變','經驗+6%',{exp_bonus:.06}]]},
'蜜蜂王':{r:'SSR',icon:'🐝',o:'百獸之王',sk:[['蜂群','任務+15%',{mission_bonus:.15}],['蜂蜜','金幣+20%',{gold_bonus:.20}]]},
'蟻王':{r:'SR',icon:'🐜',o:'百獸之王',sk:[['軍團','連擊保護25%',{combo_protect:.25}],['搬運','鐵礦+30%',{iron_bonus:.30}]]},
'螳螂王':{r:'R',icon:'🦗',o:'百獸之王',sk:[['鐮刀','PK+6%',{pk_power_bonus:.06}],['隱身','掉落+3%',{drop_bonus:.03}]]},
'蜻蜓王':{r:'SR',icon:'🪰',o:'百獸之王',sk:[['飛行','速度+20%',{speed_bonus:.20}],['複眼','掉落+5%',{drop_bonus:.05}]]},
'獨角仙王':{r:'UR',icon:'🪲',o:'百獸之王',sk:[['角鬥','PK+20%',{pk_power_bonus:.20}],['硬殼','全經驗+18%',{all_exp_bonus:.18}],['大地','鐵礦+50%',{iron_bonus:.50}]]}

};

const TEAMMATES={

'數學偵探':{r:'SR',icon:'🔍',o:'偵探學園',q:'真相，永遠只有一個！',sk:[['推理','數學+18%',{math_exp_bonus:.18}],['洞察','全經驗+5%',{all_exp_bonus:.05}]]},

'科學小助手':{r:'R',icon:'🧪',o:'實驗室物語',q:'實驗出真知！',sk:[['實驗','自然+12%',{science_exp_bonus:.12}],['細心','掉落+3%',{drop_bonus:.03}]]},

'文學少女':{r:'R',icon:'📚',o:'圖書館之戀',q:'書中有黃金屋。',sk:[['閱讀','國文+12%',{chinese_exp_bonus:.12}],['靜心','經驗+3%',{exp_bonus:.03}]]},

'運動健將':{r:'R',icon:'🏀',o:'熱血球場',q:'不到最後一秒不放棄！',sk:[['活力','經驗+6%',{exp_bonus:.06}],['耐力','連擊保護10%',{combo_protect:.10}]]},

'音樂才子':{r:'SR',icon:'🎹',o:'交響樂章',q:'音樂是靈魂的語言。',sk:[['節奏','藝文+15%',{all_exp_bonus:.05}],['共鳴','水晶+10%',{crystal_bonus:.10}]]},

'班級導師':{r:'SR',icon:'👩‍🏫',o:'校園日常',q:'每個學生都是寶藏。',sk:[['教導','全經驗+10%',{all_exp_bonus:.10}],['關懷','任務獎勵+15%',{mission_bonus:.15}]]},

/* ── 擴充隊友 50 ── */
'班長小惠':{r:'N',icon:'👩‍🎓',sk:[['班級凝聚力','任務獎勵+10%',{mission_bonus:.10}],['整潔','經驗+3%',{exp_bonus:.03}]]},
'副班長阿豪':{r:'R',icon:'🧑‍🎓',sk:[['輔助','全經驗+4%',{all_exp_bonus:.04}],['協調','連擊保護10%',{combo_protect:.10}]]},
'學藝股長小美':{r:'SR',icon:'👩‍🏫',sk:[['才藝','藝文+15%',{art_exp_bonus:.15}],['安排','任務+10%',{mission_bonus:.10}]]},
'風紀股長阿強':{r:'R',icon:'🧑‍✈️',sk:[['秩序','PK+5%',{pk_power_bonus:.05}],['紀律','強化+3%',{enhance_bonus:.03}]]},
'康樂股長小翔':{r:'SR',icon:'🏀',sk:[['康樂','健體+15%',{pe_exp_bonus:.15}],['活力','經驗+8%',{exp_bonus:.08}]]},
'衛生股長小潔':{r:'N',icon:'🧹',sk:[['衛生','任務+5%',{mission_bonus:.05}],['清潔','金幣+5%',{gold_bonus:.05}]]},
'圖書股長小書':{r:'R',icon:'📚',sk:[['閱讀','國文+10%',{chinese_exp_bonus:.10}],['整理','社會+5%',{social_exp_bonus:.05}]]},
'資訊股長小智':{r:'SSR',icon:'💻',sk:[['科技','科技+20%',{tech_exp_bonus:.20}],['程式','經驗+10%',{exp_bonus:.10}],['駭客','掉落+6%',{drop_bonus:.06}]]},
'服務股長小愛':{r:'SR',icon:'❤️',sk:[['服務','任務+15%',{mission_bonus:.15}],['關懷','連擊保護20%',{combo_protect:.20}]]},
'體育股長小剛':{r:'R',icon:'🏋️',sk:[['體育','健體+10%',{pe_exp_bonus:.10}],['體能','經驗+6%',{exp_bonus:.06}]]},
'數學小老師小明':{r:'SR',icon:'📐',sk:[['數感','數學+18%',{math_exp_bonus:.18}],['解題','答題積分+10%',{quiz_pts_bonus:.10}]]},
'英文小老師小莉':{r:'R',icon:'🔤',sk:[['語感','英文+12%',{english_exp_bonus:.12}],['聽力','經驗+5%',{exp_bonus:.05}]]},
'國文小老師小文':{r:'SSR',icon:'📖',sk:[['文學','國文+20%',{chinese_exp_bonus:.20}],['寫作','答題積分+15%',{quiz_pts_bonus:.15}],['背誦','經驗+8%',{exp_bonus:.08}]]},
'自然小老師小科':{r:'R',icon:'🔬',sk:[['實驗','自然+12%',{science_exp_bonus:.12}],['觀察','掉落+4%',{drop_bonus:.04}]]},
'社會小老師小史':{r:'SR',icon:'🌍',sk:[['歷史','社會+15%',{social_exp_bonus:.15}],['地理','經驗+6%',{exp_bonus:.06}]]},
'美術小老師小藝':{r:'R',icon:'🎨',sk:[['繪畫','藝文+10%',{art_exp_bonus:.10}],['審美','社會+5%',{social_exp_bonus:.05}]]},
'音樂小老師小音':{r:'SR',icon:'🎵',sk:[['節奏','藝文+15%',{art_exp_bonus:.15}],['協奏','連擊保護20%',{combo_protect:.20}]]},
'童軍小老師小童':{r:'N',icon:'⛺',sk:[['露營','健體+5%',{pe_exp_bonus:.05}],['合作','任務+5%',{mission_bonus:.05}]]},
'輔導小老師小輔':{r:'SR',icon:'🧠',sk:[['輔導','全經驗+6%',{all_exp_bonus:.06}],['諮詢','連擊保護25%',{combo_protect:.25}]]},
'特教小老師小特':{r:'R',icon:'🤝',sk:[['包容','任務+8%',{mission_bonus:.08}],['同理','經驗+4%',{exp_bonus:.04}]]},
'學霸阿翰':{r:'SSR',icon:'🏆',sk:[['全科','全經驗+18%',{all_exp_bonus:.18}],['筆記','答題積分+20%',{quiz_pts_bonus:.20}],['專注','連擊保護30%',{combo_protect:.30}]]},
'學霸小華':{r:'R',icon:'📝',sk:[['勤學','經驗+8%',{exp_bonus:.08}],['記憶','社會+5%',{social_exp_bonus:.05}]]},
'學霸小芬':{r:'SR',icon:'✏️',sk:[['解題','數學+15%',{math_exp_bonus:.15}],['分析','自然+10%',{science_exp_bonus:.10}]]},
'運動健將阿偉':{r:'R',icon:'🏃',sk:[['跑步','健體+10%',{pe_exp_bonus:.10}],['毅力','連擊保護15%',{combo_protect:.15}]]},
'運動健將小婷':{r:'SR',icon:'🏊',sk:[['游泳','健體+15%',{pe_exp_bonus:.15}],['耐力','經驗+8%',{exp_bonus:.08}]]},
'文藝青年小星':{r:'R',icon:'🌟',sk:[['文藝','藝文+10%',{art_exp_bonus:.10}],['創作','國文+8%',{chinese_exp_bonus:.08}]]},
'文藝青年小月':{r:'SSR',icon:'🌙',sk:[['詩詞','國文+18%',{chinese_exp_bonus:.18}],['音樂','藝文+15%',{art_exp_bonus:.15}],['浪漫','掉落+6%',{drop_bonus:.06}]]},
'程式高手小碼':{r:'SR',icon:'🖥️',sk:[['編碼','科技+18%',{tech_exp_bonus:.18}],['除錯','經驗+8%',{exp_bonus:.08}]]},
'機器人專家小機':{r:'R',icon:'🤖',sk:[['機械','科技+10%',{tech_exp_bonus:.10}],['維修','強化+4%',{enhance_bonus:.04}]]},
'生物達人小生':{r:'SR',icon:'🧬',sk:[['生態','自然+15%',{science_exp_bonus:.15}],['基因','水晶+10%',{crystal_bonus:.10}]]},
'化學達人小化':{r:'R',icon:'⚗️',sk:[['反應','自然+10%',{science_exp_bonus:.10}],['調配','鐵礦+15%',{iron_bonus:.15}]]},
'物理達人小物':{r:'SSR',icon:'⚡',sk:[['力學','自然+18%',{science_exp_bonus:.18}],['電磁','PK+10%',{pk_power_bonus:.10}],['光學','掉落+6%',{drop_bonus:.06}]]},
'地球科學達人小地':{r:'R',icon:'🌎',sk:[['地質','社會+10%',{social_exp_bonus:.10}],['氣象','自然+8%',{science_exp_bonus:.08}]]},
'歷史達人小史':{r:'SR',icon:'📜',sk:[['史實','社會+15%',{social_exp_bonus:.15}],['考據','任務+10%',{mission_bonus:.10}]]},
'地理達人小地':{r:'R',icon:'🗺️',sk:[['地形','社會+10%',{social_exp_bonus:.10}],['導航','領土加成',{territory_bonus:true}]]},
'公民達人小公':{r:'SR',icon:'⚖️',sk:[['法治','社會+15%',{social_exp_bonus:.15}],['倫理','連擊保護20%',{combo_protect:.20}]]},
'生涯規劃師小規':{r:'R',icon:'🧭',sk:[['規劃','任務+10%',{mission_bonus:.10}],['引導','經驗+5%',{exp_bonus:.05}]]},
'輔導老師小慧':{r:'SSR',icon:'🧡',sk:[['輔導','全經驗+14%',{all_exp_bonus:.14}],['開導','連擊保護35%',{combo_protect:.35}],['支持','任務+15%',{mission_bonus:.15}]]},
'圖書館員小書':{r:'R',icon:'📚',sk:[['整理','國文+8%',{chinese_exp_bonus:.08}],['推薦','社會+8%',{social_exp_bonus:.08}]]},
'實驗室助理小助':{r:'SR',icon:'🧪',sk:[['協助','自然+12%',{science_exp_bonus:.12}],['記錄','水晶+10%',{crystal_bonus:.10}]]},
'社團社長小社':{r:'R',icon:'🎪',sk:[['領導','任務+10%',{mission_bonus:.10}],['組織','經驗+6%',{exp_bonus:.06}]]},
'義工小善':{r:'SR',icon:'🤲',sk:[['服務','任務+15%',{mission_bonus:.15}],['關懷','連擊保護15%',{combo_protect:.15}]]},
'同學小甲':{r:'N',icon:'🧑‍🤝‍🧑',sk:[['陪伴','經驗+3%',{exp_bonus:.03}],['鼓勵','連擊保護5%',{combo_protect:.05}]]},
'同學小乙':{r:'N',icon:'🧑‍🤝‍🧑',sk:[['打氣','任務+5%',{mission_bonus:.05}],['聊天','社會+3%',{social_exp_bonus:.03}]]},
'同學小丙':{r:'R',icon:'👫',sk:[['互助','全經驗+4%',{all_exp_bonus:.04}],['友誼','金幣+5%',{gold_bonus:.05}]]},
'同學小丁':{r:'SR',icon:'🧑‍🎓',sk:[['合作','任務+12%',{mission_bonus:.12}],['研究','答題積分+10%',{quiz_pts_bonus:.10}]]},
'轉學生小新':{r:'R',icon:'🆕',sk:[['新鮮','經驗+6%',{exp_bonus:.06}],['適應','連擊保護10%',{combo_protect:.10}]]},
'留學生小洋':{r:'SR',icon:'🌏',sk:[['國際','英文+15%',{english_exp_bonus:.15}],['文化','社會+10%',{social_exp_bonus:.10}]]},
'畢業學長小畢':{r:'SSR',icon:'🎓',sk:[['傳承','全經驗+16%',{all_exp_bonus:.16}],['指導','強化+6%',{enhance_bonus:.06}],['榜樣','任務+15%',{mission_bonus:.15}]]},
'傳說導師小賢':{r:'UR',icon:'🧙‍♂️',sk:[['名師指導','全經驗+28%',{all_exp_bonus:.28}],['題海戰術','答題積分+25%',{quiz_pts_bonus:.25}],['超凡入聖','保底-10抽、品質+50%',{pity_reduce:10,quality_up:.50}]]}

};
const POOLS={character:CHARS,pet:PETS,anime:ANIME,teammate:TEAMMATES};


/* 自動上網檢索相關圖片（Bing 圖片縮圖服務，免金鑰）；載入失敗自動退回 emoji */



/* ════════ 每日任務池 ════════ */


/* ════════ 稱號 ════════ */

const TITLES=[

{id:'t0',n:'初出茅廬',d:'答對 1 題',bonus:{},chk:g=>g.stats.correct>=1},

{id:'t1',n:'勤學不倦',d:'答對 50 題',bonus:{exp_bonus:.02},chk:g=>g.stats.correct>=50},

{id:'t2',n:'學海無涯',d:'答對 200 題',bonus:{exp_bonus:.03},chk:g=>g.stats.correct>=200},

{id:'t3',n:'題海戰神',d:'答對 500 題',bonus:{exp_bonus:.05},chk:g=>g.stats.correct>=500},

{id:'t4',n:'千題斬',d:'答對 1000 題',bonus:{all_exp_bonus:.05},chk:g=>g.stats.correct>=1000},

{id:'t5',n:'連擊新星',d:'最高 10 連擊',bonus:{},chk:g=>g.stats.maxCombo>=10},

{id:'t6',n:'連擊高手',d:'最高 30 連擊',bonus:{drop_bonus:.02},chk:g=>g.stats.maxCombo>=30},

{id:'t7',n:'連擊大師',d:'最高 50 連擊',bonus:{drop_bonus:.03},chk:g=>g.stats.maxCombo>=50},

{id:'t8',n:'PK新星',d:'PK 勝 5 場',bonus:{pk_power_bonus:.03},chk:g=>g.pk.win>=5},

{id:'t9',n:'PK高手',d:'PK 勝 30 場',bonus:{pk_power_bonus:.05},chk:g=>g.pk.win>=30},

{id:'t10',n:'PK傳說',d:'PK 勝 100 場',bonus:{pk_power_bonus:.08},chk:g=>g.pk.win>=100},

{id:'t11',n:'抽卡達人',d:'累計抽卡 100 次',bonus:{},chk:g=>g.gacha.total>=100},

{id:'t12',n:'收藏新手',d:'收藏 20 個',bonus:{},chk:g=>collCount(g)>=20},

{id:'t13',n:'收藏大師',d:'收藏 40 個',bonus:{quality_up:.1},chk:g=>collCount(g)>=40},

{id:'t14',n:'困難征服者',d:'困難題答對 50',bonus:{exp_hard_bonus:.05},chk:g=>(g.stats.hardCorrect||0)>=50},

{id:'t15',n:'學霸',d:'等級 25',bonus:{all_exp_bonus:.03},chk:g=>g.lv>=25},

{id:'t16',n:'大學霸',d:'等級 40',bonus:{all_exp_bonus:.05},chk:g=>g.lv>=40},

{id:'t17',n:'鍛造學徒',d:'鍛造 5 次',bonus:{},chk:g=>g.forgeCount>=5},

{id:'t18',n:'鍛造大師',d:'鍛造 20 次',bonus:{quality_up:.15},chk:g=>g.forgeCount>=20},

{id:'t19',n:'實驗室達人',d:'完成 5 個實驗',bonus:{},chk:g=>(g.lab||[]).length>=5},

{id:'t20',n:'社交蝴蝶',d:'好友 3 人',bonus:{},chk:g=>friendCount(g)>=3},

{id:'t21',n:'簽到達人',d:'累計簽到 30 天',bonus:{},chk:g=>(g.sign.total||0)>=30},

{id:'t22',n:'錯題克星',d:'重練成功 100 題',bonus:{retry_exp_bonus:.1},chk:g=>(g.stats.retry||0)>=100},

{id:'t23',n:'覺醒者',d:'覺醒 1 個角色',bonus:{all_exp_bonus:.04},chk:g=>g.awaken.length>=1},

{id:'t24',n:'競技塔征服者',d:'PK 競技塔 第20層',bonus:{pk_power_bonus:.1},chk:g=>(g.arena.best||1)>=20},

{id:'t25',n:'全領域之王',d:'PK 競技塔 第50層',bonus:{all_exp_bonus:.1},chk:g=>(g.arena.best||1)>=50}

];

/* ════════ 成就 ════════ */

const ACH=[

{id:'a1',n:'初次答題',stages:[{g:1,rw:{gold:50}},{g:10,rw:{gold:100}},{g:50,rw:{crystal:30}}],prog:g=>g.stats.total},

{id:'a2',n:'百題斬',stages:[{g:100,rw:{crystal:50}},{g:500,rw:{diamond:3}},{g:1000,rw:{diamond:8}}],prog:g=>g.stats.total},

{id:'a3',n:'連擊之路',stages:[{g:5,rw:{gold:80}},{g:10,rw:{crystal:30}},{g:30,rw:{starlight:5}}],prog:g=>g.stats.maxCombo},

{id:'a4',n:'等級里程碑',stages:[{g:5,rw:{gold:100}},{g:15,rw:{crystal:50}},{g:30,rw:{diamond:5}}],prog:g=>g.lv},

{id:'a5',n:'PK征途',stages:[{g:1,rw:{honor:10}},{g:5,rw:{honor:30}},{g:20,rw:{diamond:5}}],prog:g=>g.pk.win},

{id:'a6',n:'收藏之路',stages:[{g:5,rw:{gold:100}},{g:10,rw:{crystal:50}},{g:25,rw:{starlight:8}}],prog:g=>collCount(g)},

{id:'a7',n:'抽卡初體驗',stages:[{g:1,rw:{gold:50}},{g:10,rw:{crystal:30}},{g:50,rw:{starlight:5}}],prog:g=>g.gacha.total},

{id:'a8',n:'鍛造之路',stages:[{g:1,rw:{ironOre:3}},{g:5,rw:{ironOre:8}},{g:20,rw:{starlight:10}}],prog:g=>g.forgeCount},

{id:'a9',n:'強化專家',stages:[{g:1,rw:{gold:60}},{g:5,rw:{enhStone:5}},{g:10,rw:{diamond:3}}],prog:g=>g.stats.enhance||0},

{id:'a10',n:'實驗室先鋒',stages:[{g:1,rw:{labMat:10}},{g:3,rw:{labMat:25}},{g:6,rw:{diamond:5}}],prog:g=>(g.lab||[]).length},

{id:'a11',n:'簽到持之以恆',stages:[{g:3,rw:{gold:100}},{g:7,rw:{crystal:50}},{g:30,rw:{diamond:8}}],prog:g=>g.sign.total||0},

{id:'a12',n:'錯題重練',stages:[{g:5,rw:{gold:80}},{g:20,rw:{crystal:40}},{g:100,rw:{diamond:6}}],prog:g=>g.stats.retry||0},

{id:'a13',n:'社交達人',stages:[{g:1,rw:{gold:60}},{g:3,rw:{crystal:30}},{g:5,rw:{starlight:5}}],prog:g=>friendCount(g)},

{id:'a14',n:'任務完成者',stages:[{g:5,rw:{gold:100}},{g:20,rw:{crystal:50}},{g:50,rw:{diamond:5}}],prog:g=>g.stats.missions||0},

{id:'a15',n:'榮譽戰士',stages:[{g:20,rw:{gold:100}},{g:100,rw:{crystal:60}},{g:300,rw:{diamond:8}}],prog:g=>g.honor},

{id:'a16',n:'知識累積',stages:[{g:100,rw:{gold:80}},{g:500,rw:{crystal:40}},{g:2000,rw:{diamond:6}}],prog:g=>g.quizPts},

{id:'a17',n:'競技塔攀登',stages:[{g:5,rw:{gold:150}},{g:10,rw:{crystal:80}},{g:20,rw:{diamond:5}}],prog:g=>g.arena.best||1},

{id:'a18',n:'領土擴張',stages:[{g:10,rw:{gold:120}},{g:50,rw:{crystal:60}},{g:100,rw:{diamond:6}}],prog:g=>Object.keys(g.territory.owned).length}

];

/* ════════ 自然實驗室 ════════ */


/* ════════ 題庫 ════════ */

const BANK={'輔導':{'自我認識':{'簡單':[

 {'題目':'下列何者最有助於「認識自己」？','選項':['觀察自己在各種情境的反應與想法','只聽別人的評價從不思考','每天做完全相同的事','遇到挫折就立刻放棄'],'答案':0,'解析':'1. 自我認識來自觀察與反思\n2. 結合他人回饋與自我覺察\n3. 靜態不變的生活無法加深認識'},

 {'題目':'「自我概念」是指？','選項':['自己對自己的整體看法與評價','別人眼中的我','成績單上的分數','父母對我的期望'],'答案':0,'解析':'1. 自我概念＝對自己的看法\n2. 由自我覺察與經驗累積\n3. 不等於他人評價'},

 {'題目':'認識自己的「優點」可以怎麼做？','選項':['回顧自己成功與擅長的事','只看自己的缺點','和別人比較外貌','忽視自己的興趣'],'答案':0,'解析':'1. 從成就與擅長處發現優勢\n2. 也可透過他人回饋確認\n3. 自我認識需全面不偏廢'},

 {'題目':'下列哪個是良好的「自我覺察」習慣？','選項':['情緒來時先停一下，問自己為什麼','壓抑所有情緒不想它','隨意發洩情緒不顧後果','把情緒都怪到別人身上'],'答案':0,'解析':'1. 停頓與提問是覺察關鍵\n2. 辨識情緒來源\n3. 有助自我調整'},

 {'題目':'透過「心理測驗」認識自己時，應抱持什麼態度？','選項':['當作參考，搭配真實生活經驗判斷','完全相信測驗結果','測驗結果不好就否定自己','只看自己喜歡的結果'],'答案':0,'解析':'1. 測驗僅是參考工具\n2. 需與現實經驗互相驗證\n3. 避免過度依賴標籤'},

 {'題目':'「生涯興趣」的探索與下列何者最相關？','選項':['我喜歡做什麼、擅長做什麼','別人希望我做什麼','社會上哪個行業賺最多','父母從事的職業'],'答案':0,'解析':'1. 興趣＝內在動機來源\n2. 結合能力與價值觀\n3. 生涯規劃以自我為中心向外'},

 {'題目':'正確的自我期許應該是？','選項':['設定合理目標並努力實踐','訂下永遠達不到的目標','拿自己與明星比較','別人做什麼我就做什麼'],'答案':0,'解析':'1. 合理目標可激勵成長\n2. 過高目標易生挫敗\n3. 期許應符合自我認識'},

 {'題目':'認識自己的「限制」有何意義？','選項':['接納限制、調整方法，仍可發展','代表自己很差','直接放棄努力','請別人代替自己完成'],'答案':0,'解析':'1. 接納限制是成熟表現\n2. 可尋求替代策略\n3. 限制不否定全部價值'}],

 '困難':[{'題目':'「鏡中自我」理論主張自我概念主要來自？','選項':['重要他人對自己的看法與反應','自己的出生家庭背景','基因決定的性格','每天的運氣'],'答案':0,'解析':'1. 庫里（Cooley）鏡中自我\n2. 經由他人眼光形成自我\n3. 重要他人影響最大'}]}},'綜合活動':{'自我探索':{'簡單':[

 {'題目':'下列何者屬於「自我探索」的具體行動？','選項':['記錄自己的興趣與情緒變化','整天打電動不與人互動','拒絕嘗試任何新事物','完全模仿別人的生活方式'],'答案':0,'解析':'1. 記錄與反思是探索工具\n2. 探索需開放與行動\n3. 模仿不等於認識自己'},

 {'題目':'了解自己的「價值觀」對生活有何幫助？','選項':['幫助做出符合本心的選擇','讓別人決定我的事','只在乎物質享受','隨波逐流最輕鬆'],'答案':0,'解析':'1. 價值觀是選擇的羅盤\n2. 讓決定更一致\n3. 價值觀需自我澄清'}]}},'數學':{'110年會考':{'簡單':[{"題目": "算式 (-8)+(-2)×(-3) 之值為何？", "選項": ["-14", "-2", "18", "30"], "答案": 2, "解析": ""}, {"題目": "若二元一次聯立方程式 {x=4y, 6y-x=10} 的解為 x=a，y=b，則 a+b 之值為何？", "選項": ["20", "15", "10", "5"], "答案": 3, "解析": ""}, {"題目": "5^6 是 5^3 的多少倍？", "選項": ["2", "3", "25", "125"], "答案": 0, "解析": ""}, {"題目": "利用乘法公式判斷，下列等式何者成立？", "選項": ["248^2+248×52+52^2=300^2", "248^2-248×48-48^2=200^2", "248^2+2×248×52+52^2=300^2", "248^2-2×248×48-48^2=200^2"], "答案": 0, "解析": ""}, {"題目": "將一半徑為6的圓形紙片，沿著兩條半徑剪開形成兩個扇形。若其中一個扇形的弧長為5π，則另一個扇形的圓心角度數是多少？", "選項": ["30", "60", "105", "210"], "答案": 1, "解析": ""}, {"題目": "美美和小儀到超市購物，且超市正在舉辦摸彩活動，單次消費金額每滿100元可以拿到1張摸彩券。已知美美一次購買5盒餅乾拿到3張摸彩券；小儀一次購買5盒餅乾與1個蛋糕拿到4張摸彩券。若每盒餅乾的售價為x元，每個蛋糕的售價為150元，則x的範圍為下列何者？", "選項": ["50≤x<60", "60≤x<70", "70≤x<80", "80≤x<90"], "答案": 3, "解析": ""}],'困難':[{"題目": "已知 a_1，a_2，……，a_40 為一等差數列，其中 a_1 為正數，且 a_20+a_22=0。判斷下列敘述何者正確？", "選項": ["數列中 a_1 為最大值", "數列中 a_40 為最大值", "數列中 a_21 為最大值", "數列中 a_22 為最大值"], "答案": 2, "解析": ""}, {"題目": "已知 a=-5/223，b=6/263，c=-7/293，判斷下列各式之值何者最大？", "選項": ["|a+b+c|", "|a+b-c|", "|a-b+c|", "|a-b-c|"], "答案": 1, "解析": ""}, {"題目": "若坐標平面上二次函數 y=a(x+b)^2+c 的圖形，經過平移後可與 y=(x+3)^2 的圖形完全疊合，則 a、b、c 的值可能為下列哪一組？", "選項": ["a=1，b=0，c=-2", "a=2，b=6，c=0", "a=-1，b=-3，c=0", "a=-2，b=3，c=-2"], "答案": 2, "解析": ""}, {"題目": "已知捷立租車行有甲、乙兩個營業據點，顧客租車後當日須於營業結束前在任意一個據點還車。某日營業結束清點車輛時，發現在甲歸還的自行車比從甲出租的多4輛。若當日從甲出租且在甲歸還的自行車為15輛，從乙出租且在乙歸還的自行車為13輛，則關於當日從甲、乙出租的自行車數量，下列比較何者正確？", "選項": ["從甲出租的比從乙出租的多2輛", "從甲出租的比從乙出租的少2輛", "從甲出租的比從乙出租的多6輛", "從甲出租的比從乙出租的少6輛"], "答案": 2, "解析": ""}, {"題目": "若 a、b 為正整數，且 a×b=2^5×3^2×5，則下列何者不可能為 a、b 的最大公因數？", "選項": ["1", "6", "8", "12"], "答案": 2, "解析": ""}, {"題目": "小文原本計畫使用甲、乙兩臺影印機於10：00開始一起印製文件並持續到下午，但10：00時有人正在使用乙，於是他先使用甲印製，於10：05才開始使用乙一起印製，且到10：15時乙印製的總張數與甲相同，到10：45時甲、乙印製的總張數合計為2100張。若甲、乙的印製張數與印製時間皆成正比，則依照小文原本的計畫，甲、乙印製的總張數會在哪個時間達到2100張？", "選項": ["10：40", "10：41", "10：42", "10：43"], "答案": 3, "解析": ""}]},'111年會考':{'簡單':[{"題目": "計算多項式 6x^2+4x 除以 2x^2 後，得到的餘式為何？", "選項": ["0", "4x", "3x", "2x"], "答案": 1, "解析": ""}, {"題目": "下列何者為156的質因數？", "選項": ["2", "4", "6", "8"], "答案": 0, "解析": ""}, {"題目": "算式 9/22+11/18-(23/22-7/18)之值為何？", "選項": ["1", "2", "3", "4"], "答案": 0, "解析": ""}, {"題目": "√2022 的值介於下列哪兩個數之間？", "選項": ["44與45", "45與46", "46與47", "47與48"], "答案": 1, "解析": ""}, {"題目": "已知坐標平面上有一直線L與一點A。若L的方程式為x=-2，A點坐標為(6,5)，則A點到直線L的距離為何？", "選項": ["8", "5", "4", "3"], "答案": 0, "解析": ""}],'困難':[{"題目": "多項式 39x^2+5x-14 可因式分解成(3x+a)(bx+c)，其中a、b、c均為整數，求 a+2c 之值為何？", "選項": ["-11", "-5", "5", "11"], "答案": 1, "解析": ""}, {"題目": "箱子內有分別標示號碼1~6的球，每個號碼各2顆，總共12顆。已知小茹先從箱內抽出5顆球且不將球放回箱內，這5顆球的號碼分別是1、2、3、4、5。若小茹再從箱內抽出1顆球，則這顆球的號碼為6的機率為何？", "選項": ["1/7", "1/6", "2/7", "1/5"], "答案": 2, "解析": ""}, {"題目": "已知一元二次方程式 (x-2)^2=3 的兩根為a、b，且 a>b，求 2a+b 之值為何？", "選項": ["2+3√3", "2+3√3", "2+3√3", "2+3√3"], "答案": 1, "解析": ""}, {"題目": "已知 p=7.52×10^(-6)，下列關於p值的敘述何者正確？", "選項": ["p=0.00000752", "p=0.0000752", "p=0.000752", "p=0.00752"], "答案": 0, "解析": ""}, {"題目": "已知坐標平面上有二次函數 y=-(x+6)^2+5 的圖形，函數圖形與x軸相交於(a,0)、(b,0)兩點，其中 a<b，則 a^2+b^2 的值為何？", "選項": ["37", "38", "42", "46"], "答案": 3, "解析": ""}]},'112年會考':{'簡單':[{"題目": "(-3)^3 之值為何？", "選項": ["-27", "-9", "9", "27"], "答案": 0, "解析": ""}, {"題目": "下列何者為多項式 x^2-36 的因式？", "選項": ["x-6", "x-12", "x-18", "x-36"], "答案": 0, "解析": ""}, {"題目": "化簡 √135 的結果為下列何者？", "選項": ["3√5", "3√15", "3√15", "9√5"], "答案": 0, "解析": ""}, {"題目": "坐標平面上，一次函數 y=-2x-6 的圖形通過下列哪一個點？", "選項": ["(0,-6)", "(-3,0)", "(0,6)", "(3,0)"], "答案": 0, "解析": ""}, {"題目": "已知 a=-1，b=-1¾，c=-1⅝，下列關於 a、b、c 三數的大小關係，何者正確？", "選項": ["a<b<c", "b<a<c", "c<b<a", "c<a<b"], "答案": 2, "解析": ""}],'困難':[{"題目": "有多少個正整數是18的倍數，同時也是216的因數？", "選項": ["3", "4", "5", "6"], "答案": 2, "解析": ""}, {"題目": "利用公式解可得一元二次方程式 3x^2-11x-1=0 的兩解為 a、b，且 a>b，求 a 值為何？", "選項": ["(11-√133)/6", "(11+√133)/6", "(11-√125)/6", "(11+√125)/6"], "答案": 1, "解析": ""}, {"題目": "若想在等差數列 1,2,3,4,5 中插入一些數，使得新的數列也是等差數列，且新的數列的首項仍是1，末項仍是5，則新的數列的項數可能為下列何者？", "選項": ["5", "7", "9", "10"], "答案": 2, "解析": ""}, {"題目": "已知某速食店販售的套餐內容為一片雞排和一杯可樂，且一份套餐的價錢比單點一片雞排再單點一杯可樂的總價錢便宜40元。阿俊打算到該速食店買兩份套餐，若他發現店內有特價活動：凡是購買兩份套餐，第二份套餐可享半價優惠，則阿俊購買兩份套餐的總花費與單點兩片雞排和兩杯可樂的總花費相比，可省下多少元？", "選項": ["40", "60", "80", "100"], "答案": 3, "解析": ""}, {"題目": "已知2019年我國進入「高齡社會」，預測2025年會進入「超高齡社會」。假設我國2019年與2025年總人口數皆為2300萬人，且2019年與2025年65歲以上人口數分別為370萬人與514萬人，則下列關於2019年至2025年的敘述，何者正確？", "選項": ["2025年65歲以上人口數比2019年增加了27%", "2025年65歲以上人口數比2019年增加了39%", "2019年至2025年，每年平均增加24萬人", "2019年至2025年，每年平均增加36萬人"], "答案": 1, "解析": ""}]},'113年會考':{'簡單':[{"題目": "算式 3/7-(-1/4)之值為何？", "選項": ["-3/28", "3/28", "13/28", "25/28"], "答案": 2, "解析": ""}, {"題目": "若二元一次聯立方程式 {5x-3y=28, y=-3x} 的解為 {x=a, y=b}，則 a+b 之值為何？", "選項": ["-2", "-6", "-8", "-10"], "答案": 2, "解析": ""}, {"題目": "箱內有50顆白球和10顆紅球，小慧打算從箱內抽球31次，每次從箱內抽出一球，如果抽出白球則將白球放回箱內，如果抽出紅球則不將紅球放回箱內。已知小慧在前30次抽球時共抽出20顆白球與10顆紅球，若在第31次抽球時抽到紅球的機率為 P1，抽到白球的機率為 P2，則 P1、P2 的大小關係為何？", "選項": ["P1 < P2", "P1 = P2", "P1 > P2", "無法判斷"], "答案": 3, "解析": ""}, {"題目": "若 a = 3.2×10^(-5)，b = 7.5×10^(-5)，c = 6.3×10^(-6)，則 a、b、c 的大小關係為何？", "選項": ["a < b < c", "a < c < b", "c < a < b", "c < b < a"], "答案": 1, "解析": ""}, {"題目": "下列何者為多項式 5x(5x-2)-4(5x-2)^2 的因式分解？", "選項": ["(5x-2)(x-2)", "(5x-2)(x+2)", "(5x-2)(35x+2)", "(5x-2)(35x-2)"], "答案": 2, "解析": ""}],'困難':[{"題目": "將 9/(4-√7) 化簡為 a+b√7，其中 a、b 為整數，則 a+b 之值為何？", "選項": ["40", "41", "42", "43"], "答案": 1, "解析": ""}, {"題目": "甲、乙兩個二次函數分別為 y=(x+20)^2+60、y=-(x-30)^2+60，判斷下列敘述何者正確？", "選項": ["甲的頂點比乙的頂點高", "甲的頂點比乙的頂點低", "兩函數的頂點高度相同", "兩函數的頂點高度無法比較"], "答案": 0, "解析": ""}, {"題目": "甲、乙兩個最簡分數分別為 10/a、18/b，其中 a、b 為正整數。若將甲、乙通分化成相同的分母後，甲的分子變為120，乙的分子變為90，則 a+b 之值為何？", "選項": ["33", "35", "37", "39"], "答案": 0, "解析": ""}, {"題目": "有研究報告指出，1880年至2020年全球平均氣溫上升趨勢約為每十年上升0.08℃。已知2020年全球平均氣溫為14.88℃，假設未來的全球平均氣溫上升趨勢不變，則下列哪一個年份的全球平均氣溫最接近15.5℃？", "選項": ["2080", "2090", "2100", "2110"], "答案": 1, "解析": ""}, {"題目": "△ABC中，∠B=55°，∠C=65°。今分別以B、C為圓心，BC長為半徑畫弧，兩弧在BC的兩側分別交於D、E兩點，則四邊形DBCE的四個內角，下列何者正確？", "選項": ["∠D=55°，∠E=65°", "∠D=65°，∠E=55°", "∠D=∠E=55°", "∠D=∠E=60°"], "答案": 0, "解析": ""}]},'114年會考':{'簡單':[{"題目": "計算 (5x² − 2x) − (4 − 3x) 的結果，與下列何者相同？", "選項": ["5x² − 3x", "5x² + x − 4", "5x² − 5x + 4", "5x² − 5x − 4"], "答案": 1, "解析": ""}, {"題目": "利用乘法公式判斷，下列算式之值，何者與其他不相同？", "選項": ["(106² − 4²) × (108² − 2²)", "(107² − 3²) × (107² − 1²)", "(108² − 2²) × (106² − 2²)", "(109² − 1²) × (105² − 1²)"], "答案": 1, "解析": ""}, {"題目": "已知甲方程式為 (x − 4)² = 9，乙方程式為 (x + 9)² = −4。關於甲、乙兩方程式的解的情形，下列敘述何者正確？", "選項": ["甲有兩個相異的解，乙無解", "甲有兩個相異的解，乙有兩個相異的解", "甲有兩個相同的解，乙無解", "甲有兩個相同的解，乙有兩個相異的解"], "答案": 0, "解析": ""}],'困難':[{"題目": "已知a、b、c皆為正整數，且a、b兩數的最大公因數與最小公倍數分別為11與88。關於a、b、c三數的最大公因數與最小公倍數，甲、乙兩人分別提出看法如下： 甲：a、b、c三數的最大公因數可能比11大 乙：a、b、c三數的最小公倍數可能比88小 對於甲、乙兩人的看法，下列判斷何者正確？", "選項": ["甲、乙皆正確", "甲、乙皆錯誤", "甲正確，乙錯誤", "甲錯誤，乙正確"], "答案": 3, "解析": ""}, {"題目": "坐標平面上有二次函數 y = −(x + 7)² + 12 的圖形，今將此圖形向右平移10單位，平移過程中此圖形與y軸的交點也會跟著變化。假設此圖形與y軸的交點為P，判斷在平移過程中，P點位置的變化情形為下列何者？", "選項": ["持續向下", "持續向上", "先向下再向上", "先向上再向下"], "答案": 3, "解析": ""}, {"題目": "小桃騎乘該自行車時，原本使用的前齒輪為33齒，後齒輪為21齒。根據上文，他從原本的前後齒輪組合切換成下列四種組合中的哪一種後，踩起來最費力？", "選項": ["前齒輪不變，後齒輪切換為18齒", "前齒輪不變，後齒輪切換為24齒", "前齒輪切換為22齒，後齒輪不變", "前齒輪切換為44齒，後齒輪不變"], "答案": 2, "解析": ""}]}},'社會':{'110年會考':{'簡單':[{"題目": "中國某一跨海大橋於2018年完工，其連結了中國兩個特別行政區及一個經濟特區，可縮短往來三地的距離，及強化三地經濟社會的交流。上述跨海大橋應位於下列哪條河川的出海口附近？", "選項": ["遼河", "海河", "珠江", "長江"], "答案": 0, "解析": ""}, {"題目": "考古學者在臺灣東部發現距今約三萬年前的史前人類生活遺跡，推估當時的人們已經懂得打製粗糙的石器，但還沒有磨製石器的技巧，也不懂如何蓋房子，而是住在天然的洞穴裡。這些人最可能屬於下列哪一個文化？", "選項": ["長濱文化", "大坌坑文化", "圓山文化", "拍瀑拉文化"], "答案": 1, "解析": ""}, {"題目": "以下是一位外國記者對臺灣的記錄：「在插滿了新國旗的建築物內，擠入了許多情緒高昂的人們。新國旗以藍色為背景，中間有隻黃色老虎，尾巴翹得半天高；官員與群眾燃放鞭炮互相祝賀。」根據上述記錄判斷，此事件最可能發生於下列何時？", "選項": ["1895年", "1912年", "1945年", "1949年"], "答案": 3, "解析": ""}, {"題目": "「十七世紀時，臺灣某地區的許多原住民能夠閱讀西班牙文，而在當時的歷史記載中，荷蘭人在此地區探查金礦時，需要會說西班牙話的人才，並且以銀幣作為餽贈原住民的禮物。」根據上述判斷，此地區最可能為下列何處？", "選項": ["臺南", "高雄", "臺東", "花蓮"], "答案": 2, "解析": ""}, {"題目": "在咖啡廳打工的大牛，自從年齡不受《勞動基準法》童工規定的保護後，老闆開始要求他每週五加班到凌晨。某日，大牛與客人發生衝突，因而被移送少年法庭審理。根據上述內容判斷，下列敘述何者正確？", "選項": ["大牛未滿16歲", "大牛未滿18歲", "大牛未滿20歲", "大牛已滿20歲"], "答案": 2, "解析": ""}, {"題目": "我國中央政府基於五權分立、相互制衡的理念而運作，某些職務雖具有其法定職權，但行使職權時經常需要取得其他機關的同意才能完成，例如緊急命令的發布就包含了許多法定程序。根據我國《憲法》規定，下列關於緊急命令的敘述，何者正確？", "選項": ["由總統發布，事後須經行政院追認", "由總統發布，事後須經立法院追認", "由行政院發布，事後須經總統追認", "由行政院發布，事後須經立法院追認"], "答案": 1, "解析": ""}, {"題目": "近來許多地方政府重新整頓閒置空間，每逢週末舉辦藝文活動，並對外進行攤位招商，有時還搭配煙火秀吸引遊客。由於此舉易造成周邊交通壅塞，加上地方財政困窘，因而輿論對此有正反兩面的評價。根據上述判斷，下列何者最可能為反對者的論點？", "選項": ["可增加地方政府的財政收入", "可促進地方的經濟發展", "可提升地方的觀光形象", "可造成地方的環境汙染"], "答案": 0, "解析": ""}, {"題目": "下列是不同月分到某地旅遊應注意的事項：「一月溫度較低且降雨機率高，記得準備厚外套、手套、圍巾和雨具；四月時山花漸開，下雨的機率漸減；七、八月氣候偏乾且日照強烈，應注意防曬；十月時氣溫轉涼，且夜晚溫度較低，應攜帶保暖衣物。」根據上述判斷，此地最可能位於下列何處？", "選項": ["日本京都", "韓國首爾", "臺灣臺北", "臺灣臺東"], "答案": 0, "解析": ""}, {"題目": "為促進太陽能產業的發展，印度與法國於2015年宣布推動國際太陽能聯盟，計畫讓121個擁有豐富太陽能資源的國家加入，提供資金協助成員國發展乾淨且負擔得起的太陽能發電。此計畫最主要是希望成員國之間能互相合作，以達成下列何種目標？", "選項": ["減少石油使用", "發展太空科技", "促進經濟成長", "改善交通運輸"], "答案": 2, "解析": ""}, {"題目": "下列為兩本不同時代史書對中國長江中下游某地景觀的描述：史書一：「地廣人稀，以稻米為飯，以魚類為菜，採行火耕等原始的耕種方式。人們沒有積蓄，……既無挨餓受凍之人，也沒有千金之家。」史書二：「在這裡，你可以看到各個河川湖泊都有漁夫捕魚，田野裡有農夫耕種，都市裡有商人從事買賣。這裡物產豐富，是一個富饒的地方。」根據上述判斷，從史書一到史書二的變化，最可能是下列何者所造成？", "選項": ["人口增加", "交通改善", "技術進步", "政策變遷"], "答案": 1, "解析": ""}, {"題目": "以下是一位西方記者對時事的報導：「過去美歐人士在中國許多城市高高在上，不僅享有領事裁判權保護，更有本國軍隊在中國駐紮。但『戰爭』改變了一切，領事裁判權被取消，租界中的外國軍隊也撤離了。」根據上述判斷，此事件最可能發生於下列何時？", "選項": ["1842年", "1901年", "1943年", "1949年"], "答案": 2, "解析": ""}, {"題目": "小蔡多次趁消費時詐騙某一店家財物，老闆不甘受騙報警處理。雖然小蔡遭逮後深表懊悔，並賠償店家損失達成和解，老闆也決定不提出告訴，但警方仍依法將他移送法辦，最後小蔡被法院判處罰金。根據上述判斷，小蔡被法院判處罰金，最主要是因為下列何者？", "選項": ["違反《民法》", "違反《刑法》", "違反《行政罰法》", "違反《消費者保護法》"], "答案": 3, "解析": ""}, {"題目": "「飛行釀酒師」是一個特別的行業，他們搭乘飛機穿梭在全球各地的葡萄園提供技術指導，尤其是在秋季葡萄採收時最為忙碌。某一釀酒師在澳洲葡萄採收的季節前往該國協助，則他最可能在何時前往澳洲？", "選項": ["1月至3月", "4月至6月", "7月至9月", "10月至12月"], "答案": 2, "解析": ""}, {"題目": "「早期，臺灣中部山區的原住民開墾坡地時，會先砍伐樹木，待其充分乾燥後點火焚燒，坡地因此留下不少灰燼，可作為肥料。首年的收穫相當可觀，但通常僅能耕作3至5年，便須放棄該地，另覓新地耕種。」根據上述判斷，上述耕種方式最可能造成下列何種問題？", "選項": ["土壤鹽化", "土壤侵蝕", "地層下陷", "河川汙染"], "答案": 0, "解析": ""}, {"題目": "歷史上某種組織的設立目的，是為了保護城市同業會員的利益，其作法包括：(1)禁止非會員營業；(2)會員間有互助救濟的責任；(3)規定價格、品質、工資、工作條件，以保障會員的利益。根據上述判斷，此組織最可能為下列何者？", "選項": ["中世紀歐洲的基爾特", "古羅馬的元老院", "中國唐代的坊市", "日本江戶時代的藩"], "答案": 0, "解析": ""}],'困難':[{"題目": "小芳撰寫「臺灣糖業發展」的課堂報告，想討論在十九世紀中後期臺灣糖業所發生的變化，下列何者最能夠呈現當時的變化？", "選項": ["糖業技術的改良", "糖業市場的擴大", "糖業政策的變遷", "糖業人口的增加"], "答案": 3, "解析": ""}, {"題目": "「吳生是徽州人，參加科舉考試屢屢失利，但他沒有放棄金榜題名的希望。為了糊口謀生，在這個徽州商人活躍於全國，形成商幫組織的時代，他未從商而選擇行醫。有一年，吳生遠赴雲南，為當地的官員治病而聲名大噪。」根據上述判斷，吳生選擇行醫而不從商，最可能是下列何種心態？", "選項": ["追求更高的收入", "追求更高的社會地位", "不願離開家鄉", "不善與人交往"], "答案": 0, "解析": ""}, {"題目": "有一本1926年出版的書籍，對於臺北名勝介紹如下：「圓山公園位在距離臺北車站1.8哩之處，隔基隆河與臺灣神社相望，樹木繁盛，滿山翠綠。園內有市立動物園，動物園飼養著 various animals。」根據上述判斷，此書出版時，圓山公園最可能具備下列何種特色？", "選項": ["具有宗教與休閒功能", "具有商業與娛樂功能", "具有教育與文化功能", "具有軍事與防衛功能"], "答案": 2, "解析": ""}, {"題目": "阿治在網路上分享自己潛水過程中觸碰綠蠵龜的影片，引發了爭議。由於他隨意觸碰保育類動物的行為，涉嫌違反《野生動物保育法》，一旦確定行為違法，最重將可能面臨有期徒刑一年。根據我國《刑法》規定，此種有期徒刑最短應為幾個月？", "選項": ["1個月", "2個月", "3個月", "6個月"], "答案": 1, "解析": ""}, {"題目": "有鑑於以往選舉活動過於密集，除了選務工作須花費大量成本外，也容易造成社會紛擾，於是我國目前採用每隔兩年交錯的原則，分別辦理中央層級與地方層級公職人員的選舉。根據上述判斷，我國採取此種選舉制度的目的，最主要是為了下列何者？", "選項": ["減少選舉成本", "提高投票率", "維護社會穩定", "保障公民權利"], "答案": 2, "解析": ""}, {"題目": "小毛：「老師，為什麼每年學校都要送應屆考生包子、蛋糕和粽子的餐盒？」老師：「因為包子、蛋糕和粽子的諧音為『包高中』，寓有對考生祝福吉利的意思。」上述學校作為，最能反映我國社會的下列何種現象？", "選項": ["宗教信仰的多樣性", "民俗文化的傳承", "教育制度的變遷", "飲食文化的多元"], "答案": 3, "解析": ""}, {"題目": "某內閣制國家在國會大選結束後，該國最大黨因與其他政黨在移民、環保政策等問題上難以達成共識，導致遲遲無法組成聯合政府。根據上述內容判斷，下列何者最可能為該國的選舉制度特色？", "選項": ["採行兩黨制", "採行多黨制", "採行總統制", "採行半總統制"], "答案": 2, "解析": ""}, {"題目": "2018年的「世界音樂節@臺灣」邀請了世界各地的音樂團體來臺演出，其中來自厄瓜多的樂團帶來安地斯山風情的音樂，讓我們可以藉此欣賞該國的文化特色。上述文化特色最可能與下列何者有關？", "選項": ["印第安文化", "馬雅文化", "阿茲特克文化", "奧爾梅克文化"], "答案": 2, "解析": ""}, {"題目": "以下是一位學者對於歷史上某次政治改革所做的評論：「憲法由資政院起草議決，皇帝頒布；修正權屬於國會；皇帝權力以憲法規定者為限。上述這些規定雖限制了部分皇權，卻仍然保留了許多君主專制的色彩。」根據上述判斷，此改革最可能為下列何者？", "選項": ["日本明治維新", "清末預備立憲", "中華民國臨時約法", "中華民國憲法"], "答案": 0, "解析": ""}, {"題目": "上文提及馬歇爾被派遣到的「殖民地」，最可能是下列何地？", "選項": ["印度", "非洲", "美洲", "東南亞"], "答案": 0, "解析": ""}, {"題目": "文中雙底線處的遺址已被列入世界文化遺產，它被指定為世界遺產最可能與下列何者有關？", "選項": ["古代城市規劃", "宗教建築", "農業灌溉", "貿易路線"], "答案": 2, "解析": ""}, {"題目": "根據上文判斷，臺灣雲豹原始的棲息環境主要為下列何種天然植被？", "選項": ["闊葉林", "針葉林", "熱帶雨林", "草原"], "答案": 0, "解析": ""}, {"題目": "文中多數受訪者目擊雲豹的地點為下列哪兩個原住民族的主要分布地區？", "選項": ["排灣族與魯凱族", "阿美族與卑南族", "泰雅族與布農族", "鄒族與賽夏族"], "答案": 0, "解析": ""}, {"題目": "文中國際組織的分布區域及成員性質，與下列何者最類似？", "選項": ["聯合國", "世界貿易組織", "國際原子能總署", "國際特赦組織"], "答案": 3, "解析": ""}, {"題目": "根據上述內容判斷，下列何者最符合文中提及的觀點？", "選項": ["環境保護與經濟發展無法並存", "環境保護需要全民共同參與", "環境保護應由政府主導", "環境保護需要國際合作"], "答案": 3, "解析": ""}, {"題目": "若小名要響應文中提及的主題日，下列何種作法最適當？", "選項": ["減少使用塑膠製品", "參加淨灘活動", "種植一棵樹", "節約用水"], "答案": 1, "解析": ""}]},'111年會考':{'簡單':[{"題目": "臺灣一處具有特殊泥岩惡地景觀的地點，於2020年7月由地方政府審議通過為地質公園。該地位處板塊交界附近及海岸山脈最南端，泥岩夾雜外來岩塊的地層，為該地質公園主要的景觀特色。根據上述資訊判斷，該地質公園最可能位於下列何處？", "選項": ["花蓮縣", "臺東縣", "屏東縣", "嘉義縣"], "答案": 2, "解析": ""}, {"題目": "根據經濟部水利署的統計，截至2019年底，臺灣40座主要水庫中，淤積率超過30%的共有15座，例如霧社水庫淤積率達74.8%、烏山頭水庫達49.2%，顯示水庫淤積問題嚴重。根據上述判斷，下列何者最可能是造成水庫淤積嚴重的人為因素？", "選項": ["山區濫墾濫伐", "河川改道", "海平面上升", "地層下陷"], "答案": 1, "解析": ""}, {"題目": "「柯因奈語」(Koine)，又稱「通用希臘語」，是大約發源於西元前四世紀的國際性語言。此一語言因某帝國在政治上統一了愛琴海地區各希臘城邦，融合了該地區多種方言發展而成，並隨著帝國的擴張而流通於地中海東部地區。根據上文判斷，此帝國最可能為下列何者？", "選項": ["波斯帝國", "亞歷山大帝國", "羅馬帝國", "拜占庭帝國"], "答案": 3, "解析": ""}, {"題目": "某宮廟因違法擴建道路及廟宇建築，涉嫌竊占國土及濫墾山坡地，相關單位多次介入協調，要求廟方自行拆除，但該廟負責人認為廟地選址及擴建的決定皆為神明指示，堅決不願退讓。根據我國《憲法》規定，上述事件涉及的衝突最可能是下列何者？", "選項": ["信仰自由與財產權", "信仰自由與環境權", "財產權與環境權", "環境權與生存權"], "答案": 2, "解析": ""}, {"題目": "國中生小安寄了一封陳情信給某位公職人員，信中敘述父親因沉迷賭博，導致家中債臺高築，害他的父母離異、家庭破碎，希望有人能幫幫他，讓父親不再沉溺賭海。該名公職人員收到信後，立即指示相關單位協助處理。根據上述判斷，該名公職人員最可能為下列何者？", "選項": ["總統", "立法委員", "監察委員", "市議員"], "答案": 1, "解析": ""}, {"題目": "歐盟基於公眾健康及動物福利等理由，於2012年起，禁止境內農民以傳統格子籠方式飼養蛋雞，並立法規定市售雞蛋必須明確標示其飼養方式，讓消費者可以在平飼(即室內放養)、放牧(即室外放養)及格子籠(即傳統籠飼)三種不同飼養方式的雞蛋之間做選擇。根據上述判斷，歐盟此項規定最主要是為了下列何種目的？", "選項": ["提高雞蛋產量", "保障消費者選擇權", "降低雞蛋生產成本", "增加農民收入"], "答案": 2, "解析": ""}, {"題目": "臺灣某茶商為了提高自有茶園的茶葉產量，以供應國內日益成長的罐裝茶及手搖茶市場需求，且能與由越南、斯里蘭卡等產區進口的低價茶葉競爭，因而導入滴灌技術，精準計算用水量與施肥量，並縮短採收期。根據上述判斷，此茶商導入滴灌技術的目的，最主要是為了下列何者？", "選項": ["節省人力成本", "提高茶葉品質", "減少環境汙染", "降低生產成本"], "答案": 0, "解析": ""}, {"題目": "「歷史事實」與「歷史解釋」的區別，在於歷史事實是客觀呈現過去發生的事件；而歷史解釋則是後人運用歷史資料，對相關歷史事件進行的詮釋與評價。下列敘述中，何者最適合歸類為「歷史解釋」？", "選項": ["臺南市於1624年被荷蘭人佔領", "臺灣於1895年因《馬關條約》而割讓給日本", "鄭成功於1662年驅逐荷蘭人，收復臺灣", "日本領臺後推動土地調查，目的是為了增加稅收"], "答案": 1, "解析": ""}, {"題目": "日本料理「天婦羅」，是將食材裹上澱粉漿之後下鍋油炸，這種料理源自於天主教徒在齋戒期間，將食材油炸後食用。在沒有冷凍技術的時代，因為油炸食物容易保存，所以水手於遠洋航行時，經常攜帶天婦羅。上述關於天婦羅的敘述，最適合用來說明下列何者？", "選項": ["日本與歐洲的飲食文化交流", "日本飲食文化的多樣性", "日本與歐洲的貿易往來", "日本宗教信仰的多樣性"], "答案": 2, "解析": ""}, {"題目": "一列火車在德國官方祕密安排下，從蘇黎世出發前往俄國，車上乘客包括列寧及其布爾什維克黨同志，這些人曾因為反對俄國政府而流亡海外。列寧等人沿途經過德國、瑞典、芬蘭，最後抵達俄國聖彼得堡。根據上述內容判斷，列寧等人乘火車前往俄國的目的，最可能是為了下列何者？", "選項": ["參加選舉", "推動改革", "發動革命", "簽訂和約"], "答案": 2, "解析": ""}, {"題目": "我國國會可對中央政府部分官員的人事提名案行使同意權，並在投票表決前，藉由提問來審查被提名人是否適任。根據我國公職人員的法定職權判斷，下列哪一個問題的提問對象最可能為行政院院長？", "選項": ["未來將如何落實居住正義？", "未來將如何推動能源轉型？", "未來將如何提升臺灣的國際地位？", "未來將如何解決少子女化問題？"], "答案": 2, "解析": ""}],'困難':[{"題目": "以下是中國天津某年慶祝元旦的相關報導：「政府要求各機關及各民眾團體，在元旦上午參加慶祝中華民國成立的紀念大會。當晚民眾提燈遍遊街市，高呼『勿忘國恥』、『抵制日貨』等口號。」根據上述報導判斷，此文最可能描述的是下列何年？", "選項": ["民國2年", "民國4年", "民國8年", "民國14年"], "答案": 1, "解析": ""}, {"題目": "謝先生是王小姐的前夫，但謝先生屢次侵擾王小姐的住處，甚至還到她上班的地方騷擾，最後謝先生因違反保護令的相關規定，被判處拘役四十天。根據上述內容判斷，下列敘述何者最符合我國法律規定？", "選項": ["王小姐可對謝先生提起公訴", "謝先生的行為已構成家庭暴力", "王小姐必須對謝先生提起公訴", "謝先生的行為不構成犯罪"], "答案": 0, "解析": ""}, {"題目": "某日阿蔚透過網路觀看立法院的議事實況轉播，根據我國現行法律規定，他最可能看見下列何者的轉播情況？", "選項": ["立法委員質詢行政院院長", "立法委員審查中央政府總預算", "立法委員討論停權處分", "立法委員進行假投票"], "答案": 0, "解析": ""}, {"題目": "「紓解訟源」是近年司法改革的重點之一，其目的是希望讓民眾在提起訴訟前，能透過公正且具有與法院確定判決相同效力的途徑來解決糾紛，這種方式既可避免耗時的訴訟程序，也能減少當事人間的對立。根據上述判斷，下列何者最符合「紓解訟源」的做法？", "選項": ["擴大訴訟法律扶助", "增設法院簡易庭", "推動調解制度", "提高法官員額"], "答案": 3, "解析": ""}, {"題目": "中國近代某一文章提到：「政府假借預備立憲的美名卻實行中央集權，假借推行新政卻搜刮民間錢財，對外則割讓土地，並出賣採礦權與鐵路經營權。人民反對政策，可能會被處死；人民不反對政策，也可能會被處死。既然如此，人民不如揭竿而起。」根據上文判斷，此文章最可能寫於下列何時？", "選項": ["鴉片戰爭後", "清末新政時期", "辛亥革命後", "軍閥割據時期"], "答案": 0, "解析": ""}, {"題目": "根據上文中裕鐸與洋行的會談結果，當時臺灣對外貿易的情況，最可能是下列何者？", "選項": ["臺灣以出口茶葉為主", "臺灣以出口糖為主", "臺灣以出口稻米為主", "臺灣以出口樟腦為主"], "答案": 3, "解析": ""}, {"題目": "根據上文，外國商人分析臺灣道重申外國商船不得在安平附近起卸貨物的原因，最可能與下列何者有關？", "選項": ["安平港的港口條件不佳", "安平港的腹地太小", "安平港的貿易量太大", "安平港的治安不好"], "答案": 2, "解析": ""}, {"題目": "文中針對我國咖啡的相關敘述，下列何者最適當？", "選項": ["我國咖啡產量足以內銷", "我國咖啡品質優於國外", "我國咖啡價格低於國外", "我國咖啡市場規模不斷擴大"], "答案": 2, "解析": ""}, {"題目": "根據文中內容判斷，南韓政府的作法與下列何項敘述最相符？", "選項": ["提高法定退休年齡", "鼓勵生育", "限制企業僱用外國勞工", "減少女性就業機會"], "答案": 3, "解析": ""}, {"題目": "文中所提提及南韓政府修改法律的目的，與下列我國的何項作法最類似？", "選項": ["推動新南向政策", "推動少子女化對策", "推動銀髮族就業", "推動產業自動化"], "答案": 3, "解析": ""}, {"題目": "文中日本文學家描述的城市現象，與下列何者的關係最密切？", "選項": ["都市化", "人口老化", "全球化", "少子女化"], "答案": 0, "解析": ""}, {"題目": "文中關於城市居民居住區域分布所呈現的問題，是下列何者的關懷重點？", "選項": ["環境正義", "世代正義", "種族平等", "性別平等"], "答案": 0, "解析": ""}]},'112年會考':{'簡單':[{"題目": "近年來，在政府與民間的努力下，開發出米麵包、米蛋糕、米布丁、米鳳梨酥、米冰淇淋等新米食。上述作法最可能達成下列何項效益？", "選項": ["促進國產稻米多元利用", "降低國產稻米生產成本", "減少國外稻米進口數量", "增加國產稻米耕種面積"], "答案": 0, "解析": ""}, {"題目": "格陵蘭島位處北極圈附近，某研究針對島上居民進行「氣候變遷對人類心理影響」的抽樣調查，結果顯示大部分受訪者曾親身經歷全球暖化對生活帶來的影響，氣候變遷正為北極地區居民帶來心理上的衝擊。上述調查結果最適合用來支持下列何項論點？", "選項": ["全球暖化會直接導致犯罪率上升", "氣候變遷會影響居民的心理健康", "全球暖化會造成國際貿易增加", "氣候變遷會增加居民的經濟收入"], "答案": 1, "解析": ""}, {"題目": "清末一位知識分子提到：「今日多數的中國婦女終身只待在家中，不曾見過什麼人、沒去過其他城市、身邊沒有學習的夥伴而孤陋寡聞，只能學一些無關緊要的東西，而這些東西遠比識字讀書對國家有益的學問更為重要。」請問上文中的「有益的學問」最可能是指下列何者？", "選項": ["女紅技藝", "家政管理", "儒家經典", "西方科學"], "答案": 3, "解析": ""}, {"題目": "李科羅是一位天主教傳教士，1655年前往廈門傳教，並得到當地統治者「國姓爺」的關照；他也為國姓爺父子擔任使者，出使菲律賓。但1663年李科羅結束使者任務返回廈門時，廈門已落入清軍手中，國姓爺的兒子鄭經撤退至臺灣。根據上述內容，李科羅離開廈門前往臺灣，最可能是在西元哪一年？", "選項": ["1655", "1661", "1663", "1665"], "答案": 1, "解析": ""}, {"題目": "我國國民在面對新冠肺炎疫情時，可透過接種疫苗來降低染疫風險，但逾期停留或逾期居留的外國人卻無法接種疫苗，一旦染疫後，可能也無法得到適當的醫療服務，甚至危及他們的生命安全。根據我國《憲法》增修條文的規定，政府對於上述狀況，應採行下列何種措施？", "選項": ["提供移民署的聯繫方式", "說明接種疫苗的副作用", "保障全民的生命健康權", "公布各國疫情的相關資訊"], "答案": 3, "解析": ""}, {"題目": "棗椰樹屬於棕櫚科植物，主要分布在熱帶乾燥地區，其果實稱為椰棗，既可作糧食，又是製糖的原料。全球有上億棵棗椰樹，其中前兩大分布區為西亞和甲地區，椰棗也成為這些地區的重要出口商品。根據上文，甲地區最可能位於下列何處？", "選項": ["北非地中海沿岸", "中非剛果盆地", "南非開普敦", "東非衣索比亞"], "答案": 0, "解析": ""}, {"題目": "某地區於2017年入選為世界遺產，該地區涵蓋了森林、谷地、潟湖及珊瑚礁等景觀，遺產的中心是玻里尼西亞普遍可見的毛利集會中心，此遺產是毛利文化極具代表性的見證。根據上文判斷，該世界遺產最可能位於下列何處？", "選項": ["紐西蘭", "夏威夷", "澳洲", "馬達加斯加"], "答案": 0, "解析": ""}, {"題目": "《周成過臺灣》是著名的民間傳說，其時代背景符合史實。故事描述周成拋下故鄉泉州的妻兒，獨自來臺經商。適逢淡水、雞籠開港通商，周成在大稻埕從事新興商品出口而致富。後因思念妻兒，返回泉州團聚，但妻兒已不知去向。周成再度來臺經商，尋找妻兒多年未果，最後孤獨病逝。根據上文判斷，周成從事的「新興商品」最可能為下列何者？", "選項": ["稻米", "茶葉", "糖", "鴉片"], "答案": 3, "解析": ""}, {"題目": "以下是某歷史人物在其著作中的相關內容：「我們可以假設人類在社會形成以前，所有人都是平等的。然而人們為了解決集體生活所產生的問題，透過公眾的協商形成公意，且將全部的權利轉讓給整個團體。如此一來，每個人都等於把權利轉讓給了所有人，也就等於沒有向任何人讓渡任何權利。因此每個人在結合了其他人的力量後，也能受到這些力量的保護。」請問上文中的「公意」最可能是指下列何者？", "選項": ["獨裁者的意志", "統治者的命令", "全體人民的意志", "多數人民的意志"], "答案": 1, "解析": ""}, {"題目": "「關於我的『政治主張』，因為和蔣委員長在意見上的衝突，已經沒有和解的跡象。我考慮了三種方法來解決此事，第一是辭職、第二是勸諫、第三是兵諫。第一個方法因為我的國難當頭，不應該辭職；第二個方法因為委員長認為我的主張是錯誤的，也不會接受；只剩下第三個方法了。」請問上文中的「我」最可能為下列何人？", "選項": ["汪精衛", "張學良", "何應欽", "蔣經國"], "答案": 2, "解析": ""}, {"題目": "雅加達自十七世紀以來一直是印尼的政治、經濟中心，不過由於人口過於集中加上大量開發，對環境已產生過多負荷。近年來，雅加達的民眾飽受交通壅塞、空氣汙染、地層下陷及水患之苦，印尼政府因此決定遷都至婆羅洲島的努山塔拉。根據上文判斷，印尼政府遷都最主要是為了下列何種目的？", "選項": ["發展觀光產業", "促進區域均衡", "改善居住環境", "增加就業機會"], "答案": 0, "解析": ""}, {"題目": "國際刑警組織共有195個成員國，總部建有一個存放上百萬名國際刑事罪犯檔案的資料庫供成員國使用。我國目前受限於一個中國原則，無法加入此國際組織，因此未能分享或接收國際犯罪情報，對維護國內治安造成不利影響。根據上文判斷，我國無法加入國際刑警組織，最主要是因為下列何者？", "選項": ["我國不是聯合國會員國", "我國不是世界貿易組織會員", "我國不承認一個中國原則", "中國大陸反對我國加入"], "答案": 2, "解析": ""}, {"題目": "甲在質詢行政院衛生福利部部長時，指出某飲料製造商早已知道自家產品出現變質問題，嚴重影響消費者權益，但該公司卻不主動回收處理，反而繼續販售變質的產品，對於這種明知產品有問題卻不願負責的行為，甲認為政府應該對該公司處以重罰，以維護消費者權益。根據我國《憲法》規定，甲行使的職權最可能為下列何者？", "選項": ["立法權", "質詢權", "調查權", "彈劾權"], "答案": 1, "解析": ""}, {"題目": "「距今六千多年前，此地區的人們觀察到，大約每隔365天，天狼星在拂曉的時候，和太陽同時位於東方的地平線上。因此他們定365天為一年，每年分為12個月，每月30天，並在年末增加5天的節日。」請問上文中的「此地區」最可能位於下列何處？", "選項": ["兩河流域", "尼羅河流域", "印度河流域", "黃河流域"], "答案": 2, "解析": ""}],'困難':[{"題目": "某中共領導人接見日本國會議員時提到：「戰後日本很快就發達起來，這經驗很值得中國學習。當然，別人的經驗照搬也不行，中國有中國的條件，日本有日本的條件。我們不但要引進外國的資金和技術，也要學習外國的管理經驗。」請問上文中的「戰後日本發達」，最可能是指日本的哪一個階段？", "選項": ["戰後復興", "明治維新", "江戶時代", "昭和初期"], "答案": 2, "解析": ""}, {"題目": "西元前十ㄧ世紀周人滅商後，其勢力持續向東方擴展，由於周管轄的土地與人口在短時間內急速增加，為了天下的長治久安，因此周朝的統治者，設計出一套有效的政治制度管理各地，以鞏固其對全國的統治權。根據上文判斷，此制度最可能為下列何者？", "選項": ["郡縣制", "分封制", "科舉制", "內閣制"], "答案": 0, "解析": ""}, {"題目": "「某位君主為了統治上的考量，需要招募許多能夠書寫的人才。一開始在他的國度中，竟然找不到太多有文化的人，這是因為西羅馬帝國滅亡後，城市生活逐漸消失，文化知識也幾乎被完全遺忘。後來在君主的支持下，學者們開始從各地的修道院中找尋古代的書籍，重新編寫適合宮廷使用的教科書。」請問上文中的「君主」最可能為下列何者？", "選項": ["查理曼大帝", "拿破崙", "屋大維", "查士丁尼"], "答案": 3, "解析": ""}, {"題目": "「飢餓行銷」是一種常見的行銷手法，指的是業者在短時間內利用各種管道宣傳大批民眾排隊購買的熱潮，營造該項商品都會很快被搶購一空的情況，透過媒體將商品炒作成為時下流行的商品，進而刺激民眾的購買慾望。根據上述定義判斷，下列何者最符合「飢餓行銷」的定義？", "選項": ["便利商店推出期間限定商品", "某品牌手機上市時宣傳限量供應", "超市推出買一送一的促销活動", "網路商店推出免運費的優惠"], "答案": 2, "解析": ""}, {"題目": "若有人為了在選舉時讓支持的候選人當選，配合動員把戶籍遷移到非實際居住的行政區，企圖影響選舉結果，此種行為可能觸犯《刑法》，檢察官將代表國家主動起訴違法者。根據上述內容判斷，檢察官起訴違法者的法律依據，與下列何者最為相關？", "選項": ["保障人民的選舉權", "維護選舉的公正性", "保障人民的居住自由", "維護國家的安全秩序"], "答案": 2, "解析": ""}, {"題目": "臺灣少子女化危機惡化的速度超乎想像，面對人口負成長的人口懸崖，有學者認為政府過往提出的相關政策已是緩不濟急，或許可以透過社會增加的方向，思考提高國民人數的對策。下列何者屬於「社會增加」的措施？", "選項": ["提高生育率", "降低死亡率", "引進外籍勞工", "提高結婚率"], "答案": 1, "解析": ""}, {"題目": "明清時期，蠶絲業是中國江南地區的重要產業。當時產出的生絲，主要供應國內需求，部分對外出口。下列何者最可能反映1830年代生絲出口的情況？", "選項": ["生絲出口量大幅下降", "生絲出口國家增加", "生絲出口量維持穩定", "生絲出口價格大幅上漲"], "答案": 0, "解析": ""}, {"題目": "為維護消費者權益，政府制定法律對市場上供應不實有機農產品的業者處以罰鍰，同時也能保障生產真正有機農產品農民的權益。上述主管機關對不實業者的處罰，與下列何者受到的處罰類似？", "選項": ["違反勞動基準法", "違反食品衛生管理法", "違反電信管理法", "違反建築法規"], "答案": 3, "解析": ""}, {"題目": "上文中「唐手佐久川」與王國的使節團得以前往中國，最可能與當時中國何項外交政策有關？", "選項": ["朝貢體系", "海禁政策", "閉關自守", "通商口岸"], "答案": 2, "解析": ""}, {"題目": "上文提及「政治局勢發生變化」，造成「唐手」向外傳播，此一變化最可能是指下列何者？", "選項": ["明朝建立", "清朝入關", "日本明治維新", "琉球被日本吞併"], "答案": 3, "解析": ""}, {"題目": "上文中登山步道開放的起始時間，主要是因為此時已具備下列何項條件？", "選項": ["政府開放山林政策", "當地居民同意", "山區道路改善", "登山裝備進步"], "答案": 1, "解析": ""}, {"題目": "文中提及奴隸的輸出地最可能包含下列何者？", "選項": ["非洲西海岸", "南美洲東岸", "東南亞島嶼", "北美洲南岸"], "答案": 3, "解析": ""}, {"題目": "文中提到船隻改走新的通航路線，是因此航路具備下列哪一優勢？", "選項": ["航程較短", "海盜較少", "天氣穩定", "港口較多"], "答案": 2, "解析": ""}, {"題目": "關於文中活動理念對臺灣帶來影響的過程，最適合以下列何者說明？", "選項": ["活動理念先傳入臺灣，再傳入其他國家", "活動理念先在其他國家實踐，再傳入臺灣", "活動理念先在臺灣實踐，再傳入其他國家", "活動理念在臺灣與其他國家同時實踐"], "答案": 1, "解析": ""}, {"題目": "關於文末前、後所提及我國的二項法規，下列敘述何者最適當？", "選項": ["兩者皆是法律", "兩者皆是命令", "前者是法律，後者是命令", "前者是命令，後者是法律"], "答案": 2, "解析": ""}]},'113年會考':{'簡單':[{"題目": "「格外品」意指市場規格之外但品質無虞的農產品，例如規格不符或賣相不佳。格外品會被農民分享給親友或作為肥料跟飼料，盛產時還可能出現遭大量棄置的問題。下列何項作法較能改善格外品被棄置的問題？", "選項": ["鼓勵農民減少種植面積", "利用網路平台販售格外品", "要求通路業者提高收購價格", "政府全面收購格外品供作肥料"], "答案": 1, "解析": ""}, {"題目": "彰化平原上曾有一個稱為「七十二庄」的組織，由漳州人和客家人聯合成立，他們透過共同的宗教活動，強化組織內部的連結，以抵抗鄰近泉州人的勢力。上述組織的成立，最可能與下列何者相關？", "選項": ["土地拓墾", "土地重劃", "農地改革", "農地重劃"], "答案": 0, "解析": ""}, {"題目": "「某國在十九世紀末設置一個機構，最初是顧及戰後返國的軍人，身上可能帶有病菌，因而先送往此處進行消毒及隔離，後來也在此處收容戰爭俘虜。在該國曾參與的甲午戰爭、第一次世界大戰、第二次世界大戰，及多次對外侵略戰爭中，這個機構也成為安置戰爭傷患的地方。」請問上述機構最可能位於下列何地？", "選項": ["新加坡", "沖繩", "香港", "澳門"], "答案": 1, "解析": ""}, {"題目": "以下是學者對歷史上臺灣的土地開發模式，所做出的分析：「十七世紀時，『甲』透過提供土地、耕牛、資金借貸，招募『乙』修築城堡、耕種稻米與甘蔗。甲、乙兩者之間雖然互相依賴，但也存在緊張關係。」上文中的甲、乙，最可能分別為下列何者？", "選項": ["荷蘭東印度公司、原住民族", "荷蘭東印度公司、漢人移民", "明鄭政權、原住民族", "明鄭政權、漢人移民"], "答案": 1, "解析": ""}, {"題目": "新聞報導：大法官解釋第748號解釋文，宣告《民法》中未有保障同性婚姻之規定，違反《憲法》保障人民平等權與婚姻自由之意旨，相關機關應在兩年內完成法律修正或制定，若未完成，同性二人得依《民法》第972條規定，二人以上證人之簽名，向戶政機關辦理結婚登記。根據我國《憲法》增修條文規定，上述新聞事件涉及的政府機關分別是下列何者？", "選項": ["行政院、立法院", "司法院、行政院", "司法院、考試院", "立法院、監察院"], "答案": 1, "解析": ""}, {"題目": "小央花費數萬元購買限量模型，將商品帶回家後遭到父母反對，並立刻陪同小央返回店家要求退貨。根據我國法律規定，就小央的年齡而言，此項契約須經法定代理人同意才具備效力。由此可知，小央的年齡最可能為下列何者？", "選項": ["15歲以上未滿18歲", "12歲以上未滿15歲", "7歲以上未滿12歲", "7歲以下"], "答案": 0, "解析": ""}, {"題目": "我國原本允許進口新鮮山竹，但2003年時，因新鮮山竹有引進害蟲的疑慮，所以政府禁止進口，於是市面上只能買到進口的冷凍山竹。2019年4月，政府公告將開放經殺蟲處理的新鮮山竹進口，規定需檢附植物檢疫證書，且每一批進口山竹都須經檢驗合格才能上市。根據上述內容判斷，此政策改變的影響，下列何者最合理？", "選項": ["國內山竹價格將會上漲", "國內山竹種植面積將增加", "民眾可購買到進口新鮮山竹", "民眾將面臨更多進口水果的選擇"], "答案": 2, "解析": ""}, {"題目": "日本某地因位處冬季季風迎風面，季風經日本海挾帶豐沛水氣形成大量降雪，待降雪季節結束，積雪剷除後的道路兩側留下垂直壁立高達十多公尺的雪壁，吸引大量遊客前來。上述雪壁形成的氣候條件，與下列何地最為相似？", "選項": ["臺灣北部", "馬祖列島", "西藏高原", "日本北海道"], "答案": 3, "解析": ""}, {"題目": "「十四世紀時，由於此物產的生產與銷售，帶動一股商業活動：中國結合自身及波斯生產的原料，製作成具有特色的商品後，由中國銷往印度、埃及、波斯等地。十六世紀起，此物產的生產與銷售改由歐洲人主導，他們在美洲種植此物產後，再銷往歐洲，並以此物產獲取大量財富。」請問上文中的「此物產」最可能為下列何者？", "選項": ["瓷器", "茶葉", "絲綢", "棉花"], "答案": 3, "解析": ""}, {"題目": "臺灣製鞋業在國內及海外約有3,000多家工廠，為了拓展製鞋版圖，國內幾家製鞋大廠持續計畫在其他國家籌設新廠。根據製鞋業的產業特色判斷，最可能前往具備下列何種條件的國家？", "選項": ["先進的科技水準", "豐富的天然資源", "廉價的勞動力", "良好的治安環境"], "答案": 2, "解析": ""}],'困難':[{"題目": "荔枝為臺灣受歡迎的水果之一，目前主要種植在中南部。政府為了推廣臺灣荔枝，與澳洲合作，推動南半球生產計畫，在澳洲尋找與臺灣荔枝種植的氣候條件相似的地點，並於完成隔離檢疫試驗後，正式引進試種。根據上文，澳洲引進臺灣荔枝的試種地點，最可能具備下列何種氣候特色？", "選項": ["夏季炎熱，冬季寒冷乾燥", "夏季高溫多雨，冬季溫和少雨", "全年高溫，有明顯的乾季", "全年涼爽，多霧多雨"], "答案": 1, "解析": ""}, {"題目": "清末某位知識分子提出下述主張：「本世紀女權的問題，關鍵在於政治參與。我認為女子能成為議員，也期望中國在海陸軍、財政部門、外交部門有女性任職，更希望女子能被選舉為總統。」請問上述主張最可能與下列何者有關？", "選項": ["維新變法", "辛亥革命", "新文化運動", "中共革命"], "答案": 2, "解析": ""}, {"題目": "「東漢末年戰亂頻仍，知識分子四散遷徙，人才難覓。曹丕在正式建立曹魏政權前，為了改善人才選用方式，於延康元年(220年)實施此方法，在各郡設置中正官，……。」上文中的「此方法」最可能為下列何者？", "選項": ["察舉制", "九品官人法", "科舉制", "徵辟制"], "答案": 1, "解析": ""}, {"題目": "我國少子化與高齡化的情況日益嚴重，未來恐面臨勞動力不足的危機。政府除了促進人口成長以減緩影響程度外，根據人力運用調查資料顯示，2018年時約有150萬的壯年人口，年齡介於45-64歲，其中48萬人未就業。政府若能提高壯年人口的勞動參與率，增加勞動力供給，將有助於解決勞動力不足的問題。若政府成功使其中10%的未就業壯年人口投入勞動市場，則當時我國整體勞動力變化的情形，下列何者最合理？", "選項": ["增加48萬人", "增加48萬人", "增加102萬人", "增加150萬人"], "答案": 2, "解析": ""}, {"題目": "「自來水管在租界內埋設，沿街每十數步設置四尺高的吸水鐵桶，鐵桶下面與水管連接，使用時將鐵桶上的機關轉開，水就會激射而下。自來水管理單位有兩處，法國租界的管理處設於佛拉西斯，公共租界的管理處設於上海機器房。」上述現象最可能出現在下列何者？", "選項": ["鴉片戰爭後的香港", "開港通商後的天津", "《馬關條約》簽訂後的上海", "《馬關條約》簽訂後的重慶"], "答案": 2, "解析": ""}, {"題目": "藍蟹原產於美洲，因國際貿易蓬勃發展，透過船舶的壓艙水被帶往地中海，由於該地氣候適宜生長又缺乏天敵，藍蟹數量大幅增加，而使原生物種的生存空間受到擠壓。在法國 地中海沿岸也發現藍蟹蹤跡，造成原生蛤蜊的數量下降。若將上述事件的因果關係整理如下：國際貿易→壓艙水→藍蟹入侵→競爭食物→蛤蜊減少，請問「競爭食物」在此因果關係中屬於何種角色？", "選項": ["目標", "原因", "結果", "篩選"], "答案": 3, "解析": ""}, {"題目": "英國的英格蘭足球超級聯賽，在最接近11月11日的比賽日，會舉辦紀念活動：比賽前由軍人、球員與觀眾一起進行默哀儀式，各隊球衣上印有紅花圖案，其餘參與者也在衣服上別上紅花。上述紀念活動最可能與下列何者有關？", "選項": ["紀念第一次世界大戰中陣亡的將士", "祈求足球比賽順利進行", "支持退伍軍人的公益活動", "慶祝英國王室的生日"], "答案": 0, "解析": ""}, {"題目": "1970年11月恆河出海口附近出現一座長3.5公里、寬3公里，最高點僅2公尺的沙洲島，因其位處印度與孟加拉領海交界處，引發兩國領土爭議，但在爭議還未解決之前，這座沙洲島就因為自然力量而消失。下列對於這座沙洲島消失原因的推論，何者最合理？", "選項": ["沙洲島地處地震帶，因海底地震而沉沒", "沙洲島鄰近熱帶氣旋路徑，因暴潮侵蝕而消失", "沙洲島位於板塊交界處，因板塊擠壓而隆起", "沙洲島因海水升溫，造成冰川融化而淹没"], "答案": 1, "解析": ""}, {"題目": "根據上文，「新電影」出現之前的戰後臺灣電影，最不可能播映下列何種劇情？", "選項": ["兄弟姐妹因貧困分離", "兒女出人頭地以報父母恩", "年輕情侶私奔而被族人制裁", "女子因追求愛情而與家人爭執"], "答案": 2, "解析": ""}, {"題目": "根據上文，「新電影」發展之初，最可能以下列何者作為電影題材？", "選項": ["臺灣民間故事", "早期移民來臺歷史", "政府遷臺後社會百態", "戰後農村生活景象"], "答案": 2, "解析": ""}, {"題目": "上文「削蘋果事件」中，國家企圖限制的人民權利類型，與下列何者最相似？", "選項": ["罷工權", "閱報自由", "集會自由", "選舉權"], "答案": 1, "解析": ""}]},'114年會考':{'簡單':[{"題目": "一國若發生重大自然災害，可能會直接衝擊該國的經濟活動，而成為較脆弱的投資環境。臺灣因位於地震帶常發生地震，且易受颱風侵襲，於2015年被某金融機構列為最脆弱的十個國家之一。下列哪一國家最可能也因為常發生上述二種自然災害而列名其中？", "選項": ["日本", "伊朗", "北韓", "澳洲"], "答案": 2, "解析": ""}, {"題目": "2019年底，臺灣的農場與牧場，正式迎來首批合法的農業移工，其中2名是酪農移工，其餘5名則是外展農業移工。外展農業移工意指由農會、漁會、農林漁牧有關之合作社，或非營利組織等「外展機構」所聘僱的外國人，並由外展機構指派其至服務的場所從事農務工作。上述政策的推行主要是為了因應下列何項問題？", "選項": ["農業勞動力老化", "農產品的安全性", "農村失業率偏高", "稻米的生產過剩"], "答案": 1, "解析": ""}, {"題目": "某部電影描述主角與母親及只會說華語的祖母，同住在美國舊金山華人聚集的街區，並出現拿筷子吃飯、與家人共度春節及清明節等原鄉文化情節，而主角雖然從小在美國長大，但在生活中仍經常使用華語。上述電影情節的文化意涵及傳播方式，與下列何者呈現的概念最相近？", "選項": ["利用國際婦女節倡導家務分工性別平權理念", "來自泰、緬的新住民與移工齊聚慶祝潑水節", "推行國語運動貶低母語所產生的不平等現象", "華人認為烏鴉象徵厄運，在日本則象徵吉祥"], "答案": 2, "解析": ""}, {"題目": "某研究於2018年調查發現，臺灣不同地區民眾對於各種社會議題的關注傾向與程度有所差異，其中部分地區的民眾對於自身周遭環境的議題更加關切，例如離島地區。下列何者最可能為離島地區民眾較為關注的議題？", "選項": ["適當管制房價，降低民眾租屋或購屋的負擔", "落實區域間資源分配，讓民眾獲得同等醫療品質", "管制重工業廢水的排放，避免造成土壤重金屬汙染", "大規模土石流或崩塌，可能導致建築物毀損及人員傷亡"], "答案": 1, "解析": ""}, {"題目": "「十一世紀時，旅居中國的穆斯林商人，在生活方面可以依照自身的習俗行事，例如他們在廣州的清真寺高塔上，懸掛旗幟、燈火來指引船隻出入港口。但在貿易方面，仍須受到官方機構的管轄，此機構負責收取關稅、接運貢品，並執行香料、珊瑚及象牙等進口商品的專賣，監督商家船隻的活動。」上述的「機構」最可能是下列何者？", "選項": ["洋行", "驛站", "市舶司", "總理各國事務衙門"], "答案": 2, "解析": ""}, {"題目": "「巴黎和會引起中國強烈的民族情緒，在部分知識分子的心中，西方角色從啟蒙者轉變為壓迫者，因此他們逐漸對維護帝國主義、資本主義的西方國家感到失望。在五四運動後，有些知識分子開始轉向世界革命理論，試圖從俄國革命家對於受壓迫民族的呼籲，以及俄國新政權宣布放棄沙皇時代在中國特權的聲明中，找到改變中國的出路。」上述內容最可能與下列何者有關？", "選項": ["中華民國的建立", "西安事變的發生", "中國共產黨的成立", "文化大革命的發動"], "答案": 0, "解析": ""}, {"題目": "一間跨國咖啡公司打算在某國的傳統文化觀光區設立分店，但卻因為品牌形象與當地建築、傳統飲食習慣不同而引發居民抗議。該公司為此改變店面沿用的品牌風格，除了採用相容於該區環境的色系，還將原本的英文招牌改用當地文字呈現，並增加販售具當地料理特色的創意餐點，希望透過這些舉動降低當地的反彈聲浪。上述跨國公司的舉動，與下列何者最相符？", "選項": ["成立跨國企業，強化國際分工", "憑藉強勢文化，推動產業轉型", "尊重多元文化，促進文化融合", "凝聚社區認同，發展社區組織"], "答案": 0, "解析": ""}, {"題目": "美國於2022年6月21日起，禁止進口來自中國新疆的商品，因為美國政府認為這些商品是強迫維吾爾人勞動的產物。如果企業想要繼續將在新疆生產的商品出口至美國，則必須提出充足的證據，證明商品的生產過程沒有涉及強迫勞動問題。美國執行上述管制措施的主要理由，最可能是下列何者？", "選項": ["擴大對外貿易的出超金額", "減少全球化下的貿易障礙", "保障旅外國民的工作權益", "避免侵害人權的商業行為"], "答案": 2, "解析": ""}, {"題目": "某大學於學期末時，在校內美食街設立意見回饋箱，消費者有任何建議都可以寫在意見單上投入回饋箱中，學校會參考這些回饋的意見，藉以改善未來美食街的營運方式。根據上述內容判斷，下列何項回饋意見最能提升市場的競爭程度？", "選項": ["廠商應提供校內師生購買餐點九折優惠", "應要求廠商提供餐點食材的生產履歷證明", "希望廠商販售份量較少且價格較便宜的餐點", "學校應招募更多廠商進駐美食街提供多元餐點"], "答案": 0, "解析": ""}, {"題目": "近年來由於新冠肺炎疫情造成嚴重的通貨膨脹，使得甲地的房價及物價高漲，影響其生活品質。此外，因為在鄰國的乙地1天的薪水，在甲地約1小時就賺得到，於是有一部分的甲地人搬至乙地居住，再利用遠距工作或每天通勤至甲地上班，藉以降低房租及生活消費。上述甲地與乙地依序最可能位於何國？", "選項": ["法國、英國", "美國、墨西哥", "土耳其、希臘", "馬來西亞、新加坡"], "答案": 0, "解析": ""}, {"題目": "以下是學者對於中國史上某制度的論述：「此制度的基本涵義是指統治者透過任用非世襲的官員，建立中央集權的政府。這個制度初步發展於東周，在秦王朝統一天下後全面施行，隋唐等朝代都繼續沿用，也影響了周遭的日本、朝鮮，是中國重要的制度。」根據上述內容判斷，該制度最可能是下列何者？", "選項": ["郡縣制度", "封建制度", "科舉制度", "九品官人法"], "答案": 1, "解析": ""}, {"題目": "下列是某地方政府勞工局處理一件勞資糾紛的部分過程： 勞工局：「根據貴公司的員工出勤紀錄，員工確實常加班工作，依法雇主應給付加班費。」 雇主：「可是我又沒強迫員工留下來加班，有時候他們留在公司也不一定是為了工作，只是下班後不想那麼早離開而已。」 勞工局：「依照《勞動事件法》規定，出勤紀錄內記載的勞工出勤時間，都預設勞工是經雇主同意而加班工作。若雇主認為員工並非因加班工作而留在公司，則須由雇主提出證明。」 根據上述《勞動事件法》的規定判斷，下列何者最可能是當初立法時考量的理由？", "選項": ["消除職場上出現的性別歧視行為", "確保勞工可維持基本的生活水準", "禁止超時工作以保障童工的身心健康", "平衡勞資雙方之間權力不對等的關係"], "答案": 3, "解析": ""}, {"題目": "碳匯是指能夠吸收及儲存含碳化合物的天然或人工「倉庫」，如森林、草原、濕地、土壤、海洋等。為了達成2050年「碳中和」目標，各國除了減少二氧化碳的排放之外，也積極擴大國家的碳匯。根據上文所述，若要增加一國的碳匯，則下列何種方法最為適切？", "選項": ["以焚林的方式，快速取得種植經濟作物的土地", "於屋頂上方設置太陽能發電板，增加電力供給", "恢復曾經消失的農地，採友善環境的耕作方式", "選用當地食材以減少運輸距離，降低食物里程"], "答案": 0, "解析": ""}],'困難':[{"題目": "理加頭目所屬部落與鄰近部落衝突頻繁，而荷蘭人未能妥善協助調停，心生不滿的他在日本人勸說下，帶族人前往日本尋求援助。理加返鄉後，立即遭到荷蘭人的監禁，進而引發日人挾持臺灣長官的衝突事件，更導致江戶幕府一度關閉荷蘭在日本的商館以作為制裁。上述事件最可能發生於下列何時何地？", "選項": ["十六世紀的澎湖", "十七世紀的大員", "十八世紀的淡水", "十九世紀的卑南"], "答案": 2, "解析": ""}, {"題目": "甲、乙二則資料呈現不同時代官方興建公共建設的相關情況： 甲資料：統治者為了加強對國內各地的控制，便於運送物資及兵力，下令修鑿運河，強行徵召數百萬人民從事勞役。 乙資料：某地方政府研擬興建社會住宅，當地議會要求依法召開公聽會聽取附近居民的意見，作為後續制定政策的參考。 根據甲、乙二項資料判斷，關於不同時代官方興建公共建設作法的敘述，下列何者最適當？", "選項": ["甲資料顯示當時的市場勞動權利受法律保障", "乙資料顯示當時的政府權力受到約束與制衡", "二則資料皆顯示公共建設以促進公平正義為主要考量", "二則資料皆顯示公共意見是經由大眾反覆討論而形成"], "答案": 1, "解析": ""}, {"題目": "「社會企業」是近年頗受關注的概念，其中公司型的社會企業透過商業活動營利，以改善社會或環境問題為目標，並非以讓出資者獲利為唯一考量，而企業獲得的利潤，也將繼續投入改善社會或環境問題的商業活動，希望讓社會企業得以永續經營。下列何種作法與上述提及的企業經營模式最相符？", "選項": ["運用低價策略創造企業優勢", "制定法律推行友善勞工政策", "提倡公平貿易幫助小農發展", "募集善心捐款扶助弱勢群體"], "答案": 3, "解析": ""}, {"題目": "某日新聞報導有位失智症患者將土地、房屋贈送給陌生人的糾紛，由於小明的爺爺是中度失智症患者，家人擔心爺爺也會做出類似行為而導致權益受損，便向律師諮詢。律師建議家屬可向法院提出聲請，對爺爺作出監護宣告。上述律師的建議內容應是希望達成下列何項法律效果？", "選項": ["讓爺爺成為無行為能力人，以保障其財產", "讓爺爺成為限制行為能力人，以保障其財產", "讓爺爺成為無行為能力人，以保障其契約自由", "讓爺爺成為限制行為能力人，以保障其契約自由"], "答案": 3, "解析": ""}, {"題目": "2020年之前，臺灣與日本都面臨勞力短缺的問題，但日本提供比臺灣更高的薪資吸引國際移工，因此許多菲律賓籍移工較願意前往日本工作。不過2022年底時，許多在日本工作的菲律賓籍移工發現，雖然每個月都拿出相同金額的日幣兌換成菲律賓披索匯回家鄉，但年底換到的菲律賓披索卻比年初減少了約10%，因此他們打算改往澳洲工作。上述國際移工變更工作地的考量，其原因之一最可能為下列何者？", "選項": ["菲律賓披索相對日幣升值", "菲律賓披索相對新臺幣貶值", "去臺灣工作的機會成本比去日本低", "去澳洲工作的機會成本比去日本高"], "答案": 1, "解析": ""}, {"題目": "文中博物館的展品說明，最可能以何種語文為主？", "選項": ["英文", "法文", "葡萄牙文", "西班牙文"], "答案": 2, "解析": ""}, {"題目": "多數國家使用0～9這十個數字作為車牌編碼的組合，但我國僅使用其中九個數字。根據文中內容判斷，其原因最可能為下列何者？", "選項": ["倫理價值具有約束力", "民間習俗具有強制力", "法律規定受宗教信仰影響", "政府施政受社會規範影響"], "答案": 0, "解析": ""}, {"題目": "文中關於民眾選擇車牌號碼的敘述，最適合用來說明下列哪一觀點？", "選項": ["廠商之間的價格競爭將使消費者受惠", "市場的競爭程度越高對消費者越有利", "負向誘因促使民眾的行為發生改變", "不同人對同一誘因的感受有所不同"], "答案": 3, "解析": ""}, {"題目": "某民眾的車牌被別人惡意拔走，導致他違反文末所述的規定而受罰。若該民眾對此處罰不服，依法採行下列何種處理方式最適當？", "選項": ["向中央立法機關提出訴願", "向地方行政機關提出請願", "透過行政救濟途徑維護權益", "透過刑事訴訟途徑維護權益"], "答案": 2, "解析": ""}, {"題目": "巴斯人的宗教信仰，最可能是下列何者？", "選項": ["祆教", "佛教", "猶太教", "基督教"], "答案": 0, "解析": ""}, {"題目": "十九世紀上半葉，巴斯人與中國商人的主要貿易模式，最可能是下列何者？", "選項": ["巴斯人賣瓷器到中國以換取茶葉", "巴斯人賣鴉片到中國以取得白銀", "巴斯人賣鹿皮到中國以獲得棉花", "巴斯人賣茶葉到中國以交換工業品"], "答案": 3, "解析": ""}, {"題目": "依據上文及圖(二十一)中的資訊判斷，該冰山漂流的方向應為下列何者？", "選項": ["東北向西南", "西南向東北", "東南向西北", "西北向東南"], "答案": 3, "解析": ""}, {"題目": "上述冰山若撞上南喬治亞島，其產生的影響最可能為下列何者？", "選項": ["巨浪侵襲島嶼陸地，阻礙工業發展", "附近海水鹽度上升，改變海洋生態", "威脅北美洲與非洲之間的船隻安全", "島嶼海岸遭受破壞，危及動物棲地"], "答案": 3, "解析": ""}]}},'自然':{'110年會考':{'簡單':[{"題目": "小茹統計某漁港每日的潮汐水位高度資料，她發現此漁港最高的滿潮水位高於平均海平面高度2公尺，而最低的乾潮水位低於平均海平面高度2公尺。根據小茹的統計資料，此漁港的潮差應為下列何者？", "選項": ["2公尺", "4公尺", "6公尺", "8公尺"], "答案": 3, "解析": ""}, {"題目": "阿華分別進入甲和乙兩種環境，在甲環境中肌肉出現顫抖的現象，而在乙環境中皮膚表面的血管擴張、血液量增加。若僅以調節體溫恆定的正常反應判斷，則下列有關甲、乙環境溫度的敘述，何者合理？", "選項": ["甲、乙兩環境溫度均高於體溫", "甲、乙兩環境溫度均低於體溫", "甲環境溫度低於體溫，乙環境溫度高於體溫", "甲環境溫度高於體溫，乙環境溫度低於體溫"], "答案": 2, "解析": ""}, {"題目": "死海是位於以色列和約旦邊界的湖泊，因湖水的蒸發量大於由河水和降雨的補充量，所以死海的鹽分濃度逐漸升高。目前每公升湖水含有340公克的鹽，約為一般海水的10倍，且不含任何魚類或其他水生生物。根據上述判斷，死海不含任何魚類或其他水生生物的最主要原因為下列何者？", "選項": ["湖水溫度過高", "湖水鹽分過高", "湖水深度過深", "湖水面積過小"], "答案": 3, "解析": ""}, {"題目": "小雨想替盛開的百合花進行人工授粉，則他需將百合花的花粉沾至下列哪一構造？", "選項": ["柱頭", "花藥", "子房", "胚珠"], "答案": 1, "解析": ""}, {"題目": "小蘭看到一則網路新聞說「將銀幣放入牛奶中，可以抑制細菌生長！」她針對此新聞設計下列實驗。先將甲、乙和丙三個相同的燒杯和銀幣都消毒殺菌後，再將鮮奶開封立刻檢測細菌數，並將等量鮮奶分別倒入甲、乙、丙三個燒杯中。甲燒杯不放入銀幣，乙燒杯放入1個銀幣，丙燒杯放入2個銀幣。將三個燒杯放在相同且適當的環境中，每隔一段時間，分別檢測各燒杯中的細菌數。根據上述實驗設計判斷，此實驗的控制變因最可能為下列何者？", "選項": ["燒杯大小", "鮮奶量", "銀幣數量", "環境溫度"], "答案": 1, "解析": ""}, {"題目": "以白光照射一張單色圖卡，圖卡反射紅光，吸收其他顏色的光。若改以藍光照射此圖卡，則關於此時圖卡上的色光吸收或反射情形，下列何者最有可能發生？", "選項": ["圖卡反射藍光", "圖卡吸收藍光", "圖卡反射紅光", "圖卡吸收紅光"], "答案": 2, "解析": ""}, {"題目": "下列為四本書的書名，每本書的書名分別顯示出所要介紹的內容，書中會列舉一些植物詳細說明其特徵，則哪一本書最不可能以蘇鐵作為這些植物的主要例子？", "選項": ["裸子植物大觀", "單子葉植物圖鑑", "台灣原生植物", "植物界的活化石"], "答案": 0, "解析": ""}, {"題目": "小紀在某株植物上取了四個條件相同的枝條，分別標示為甲、乙、丙、丁，並對枝條上的葉子進行以下處理(已知葉片塗上白膠處的氣孔無法進行蒸散作用)：甲：不做任何處理。乙：葉片上表面塗白膠。丙：葉片下表面塗白膠。丁：葉片上下表面皆塗白膠。將四個枝條分別放入已知重量的密封塑膠袋中，經過一段時間後，取出枝條並秤量塑膠袋的重量，下列關於塑膠袋重量變化的敘述，何者正確？", "選項": ["甲增加最多", "乙增加最多", "丙增加最多", "丁增加最多"], "答案": 3, "解析": ""}, {"題目": "小新專題研究的題目是「日常生活的食物油條」，他在報告中提到：「部分業者使用碳酸氫銨(NH4HCO3)做為食品膨鬆劑，在高溫油炸的過程中，碳酸氫銨會分解產生氨氣(NH3)、水和二氧化碳(CO2)，使油條膨脹鬆軟。」根據上述判斷，碳酸氫銨分解的反應式，下列何者正確？", "選項": ["NH4HCO3→NH3+H2O+CO2", "NH4HCO3→NH3+H2O+CO", "NH4HCO3→NH3+H2+CO2", "NH4HCO3→N2+H2O+CO2"], "答案": 1, "解析": ""}, {"題目": "美美到日月潭附近露營，看見甲、乙兩星正好在頭頂上方的位置；4小時後，美美再度觀察，發現甲、乙兩星已經不在原先的位置。若美美想再次找到甲、乙兩星，尋找的方式與其主要原因，下列何者最合理？", "選項": ["向東尋找，因為地球自西向東自轉", "向西尋找，因為地球自西向東自轉", "向東尋找，因為地球繞太陽公轉", "向西尋找，因為地球繞太陽公轉"], "答案": 2, "解析": ""}, {"題目": "患有「胃酸過多症」的患者，即使空腹也會大量分泌胃酸(HCl)，使胃液的pH值在2左右，並引起胃灼熱或胃痛等症狀。此時，可服用胃藥，胃藥中的成分如碳酸氫鈉(NaHCO3)、氫氧化鋁(Al(OH)3)或氫氧化鎂(Mg(OH)2)等，可中和胃酸。若患者長期服用含鋁的胃藥，最可能造成何種影響？", "選項": ["骨質疏鬆", "鐵質貧血", "鈣質流失", "鋁中毒"], "答案": 1, "解析": ""}, {"題目": "流星雨是流星在短時間內較密集出現的天文現象，觀測時通常會選擇視野開闊且黑暗無光害的地點，因此除了避開路燈、建築物燈光等人為光害，也會盡量避開月光等天然光害，以提高觀測成功率。根據上述判斷，下列何時最不適合觀測流星雨？", "選項": ["新月期間", "滿月期間", "上弦月期間", "下弦月期間"], "答案": 1, "解析": ""}],'困難':[{"題目": "下列分別為阿牧和小菲兩人將鋰、氦、氬、鉀、鈉和氖共六種元素分類的說明：阿牧：依照常溫常壓下元素是否為固態進行分類。小菲：依照是否會和水反應並冒泡進行分類。根據上述判斷，阿牧和小菲的分類結果，下列何者正確？", "選項": ["阿牧：固態有4種，液態有2種", "小菲：會反應有4種，不會反應有2種", "阿牧：固態有3種，液態有3種", "小菲：會反應有3種，不會反應有3種"], "答案": 0, "解析": ""}, {"題目": "下列為探討製造氧氣的實驗，實驗步驟如下：一、將胡蘿蔔磨成泥狀後，取20公克放入錐形瓶中，並在瓶內裝入足以淹沒胡蘿蔔的水。二、將上述錐形瓶與薊頭漏斗、橡皮軟管及試管連接。三、在試管內裝入水。四、自薊頭漏斗注入過氧化氫溶液。五、觀察試管中是否有氣泡產生，並以燃燒的試細棒伸入試管內，觀察火燄是否復燃。根據上述判斷，關於此實驗的敘述，下列何者正確？", "選項": ["此實驗使用過氧化氫做為催化劑", "此實驗使用胡蘿蔔做為催化劑", "此實驗產生的氣體為氫氣", "此實驗的燃燒試細棒會復燃"], "答案": 3, "解析": ""}, {"題目": "柴油引擎排放的廢氣含有較多的氮氧化物(NOx)，若能加入氨氣與柴油引擎產生的氮氧化物反應，則可減少排放廢氣造成的空氣汙染。氨氣與氮氧化物的反應中，速率最快的是下列何者？", "選項": ["氨氣+一氧化氮→氮+水", "氨氣+二氧化氮→氮+水", "氨氣+一氧化二氮→氮+水", "氨氣+三氧化二氮→氮+水"], "答案": 3, "解析": ""}, {"題目": "小宏利用解剖顯微鏡觀察蝴蝶幼蟲的細部構造，在觀察時，載物板上的幼蟲不斷地往右上角移動，則在視野下觀察到幼蟲的移動方向應為下列何者？", "選項": ["左上角", "右上角", "左下角", "右下角"], "答案": 1, "解析": ""}, {"題目": "鐵原子(Fe)、鐵離子(Fe3+)和亞鐵離子(Fe2+)三種粒子中，下列數值的比較何者正確？", "選項": ["質子數：Fe>Fe3+>Fe2+", "電子數：Fe>Fe2+>Fe3+", "中子數：Fe3+>Fe2+>Fe", "原子量：Fe3+>Fe2+>Fe"], "答案": 0, "解析": ""}, {"題目": "小平心臟內的某一個瓣膜不能完全閉合，當他的心室收縮時，其心臟內的充氧血會逆流回心房。根據上述，推測此閉合不全的瓣膜最可能位於下列何處？", "選項": ["左心房與左心室之間", "右心房與右心室之間", "左心室與主動脈之間", "右心室與肺動脈之間"], "答案": 2, "解析": ""}, {"題目": "將小球固定在細繩的一端，阿峰手持細繩的另一端，施力使小球在水平面上作等速率圓周運動，手的位置保持不動。已知小球每秒旋轉2圈，且當時間t=0 s時小球位於手的正東方。若阿峰突然放手，則關於小球脫手後的行進方向，下列何者正確？", "選項": ["朝正北方飛出", "朝正東方飛出", "朝正南方飛出", "朝正西方飛出"], "答案": 0, "解析": ""}, {"題目": "乙酸異丁酯是存在於哈密瓜等水果中，具果香味的化合物。乙酸異丁酯可由乙酸和異丁醇經濃硫酸脫水的反應而產生，為一種酯化反應，已知此反應的化學反應式中，各反應物和生成物的分子數之比例為1：1：1：1。若以碳12的原子量為12、氧16的原子量為16、氫1的原子量為1計算，下列關於此反應的敘述，何者正確？", "選項": ["反應物總質量等於生成物總質量", "反應物總分子數等於生成物總分子數", "反應物總原子數等於生成物總原子數", "反應物總體積等於生成物總體積"], "答案": 2, "解析": ""}, {"題目": "已知某種酵素最適合在37度C及pH=8的環境中作用，且在pH<5的環境下會被完全破壞。若某人吃下此種酵素，則此酵素在口腔、胃及小腸中的活性大小，下列何者最合理？", "選項": ["口腔>胃>小腸", "口腔>小腸>胃", "小腸>口腔>胃", "小腸>胃>口腔"], "答案": 1, "解析": ""}, {"題目": "根據本文，「柔珠」屬於下列何種物質？", "選項": ["離子化合物", "共價化合物", "元素", "混合物"], "答案": 1, "解析": ""}, {"題目": "下列物質(單個)的粒子大小比較，何者正確？", "選項": ["原子>分子>離子", "分子>原子>離子", "離子>原子>分子", "離子>分子>原子"], "答案": 2, "解析": ""}, {"題目": "根據本文，若小敏在向同學說明「茶包天燈」成因後，想要再舉一個科學原理相同的例子，則下列何者最合適？", "選項": ["熱氣球上升", "風力發電", "水力發電", "太陽能熱水器"], "答案": 0, "解析": ""}, {"題目": "根據本文，下列有關甲類生物的推論，何者最合理？", "選項": ["甲類生物出現在寒武紀之前", "甲類生物出現在恐龍滅絕之後", "甲類生物出現在人類出現之後", "甲類生物出現在恐龍出現之前"], "答案": 0, "解析": ""}]},'111年會考':{'簡單':[{"題目": "氣象報導時常可見「百帕」一詞，下列有關百帕的敘述何者正確？", "選項": ["百帕是溫度的單位", "百帕是氣壓的單位", "百帕是濕度的單位", "百帕是風速的單位"], "答案": 1, "解析": ""}, {"題目": "成熟的蓮霧會自然從樹上掉落到地面，蓮霧在掉落的過程中，其速率逐漸增加。上述現象是下列何種能量減少而轉換成其他形式的能量所造成的？", "選項": ["動能", "位能", "熱能", "化學能"], "答案": 2, "解析": ""}, {"題目": "博物館的貴重畫冊常會保存在充滿氮氣的密閉容器中，以防止畫冊氧化。上述使用氮氣的原因，主要是考量氮氣具有下列何種性質？", "選項": ["不易與其他物質反應", "不溶於水", "不會助燃", "不會破壞臭氧層"], "答案": 0, "解析": ""}, {"題目": "人類將人工魚礁投入水底以增加藻類、珊瑚及魚類的棲息空間，這些魚礁最可能被置放在下列哪一地區？", "選項": ["深海平原", "大陸棚", "海溝", "大洋中脊"], "答案": 3, "解析": ""}, {"題目": "下列為四種植物對於環境刺激的感應，何者從接受刺激到出現反應，所需的時間最長？", "選項": ["含羞草受到觸碰後葉子合攏", "捕蠅草受到昆蟲觸碰後葉子閉合", "向日葵花盤隨太陽轉動", "鐵線蕨葉片受到觸碰後捲曲"], "答案": 2, "解析": ""}, {"題目": "製作蛋糕時，常會在白色的鮮奶油中加入些許色素混合，使其顏色變化增加美觀，而鮮奶油仍維持原本的性質。做好的蛋糕需妥善冷藏，以防止鮮奶油腐壞變質。關於上述鮮奶油「變色」與「變質」的改變，下列敘述何者正確？", "選項": ["兩者皆為物理變化", "兩者皆為化學變化", "變色是化學變化，變質是物理變化", "變色是物理變化，變質是化學變化"], "答案": 3, "解析": ""}, {"題目": "蘋果酸是蘋果等水果中含有的成分，化學式為C₄H₆O₅，分子中含有兩個—COOH原子團，是蘋果的酸味來源，常作為食品添加劑。關於蘋果酸的說明，下列何者正確？", "選項": ["蘋果酸是一種有機酸", "蘋果酸是一種無機酸", "蘋果酸含有碳、氫、氧三種元素", "蘋果酸是一種碳水化合物"], "答案": 2, "解析": ""}, {"題目": "人類的ABO血型是由一對遺傳因子控制，而控制此血型的遺傳因子有I^A、I^B和i三種型式，其中I^A和I^B是顯性，i是隱性，血型和基因型的關係如下：A型(I^A I^A或I^A i)、B型(I^B I^B或I^B i)、AB型(I^A I^B)、O型(ii)。已知小美的血型為A型，小華的血型為B型，若兩人婚後生下一個O型的小孩，則小美與小華的基因型，下列何者最合理？", "選項": ["小美為I^A i，小華為I^B i", "小美為I^A I^A，小華為I^B i", "小美為I^A i，小華為I^B I^B", "小美為I^A I^A，小華為I^B I^B"], "答案": 0, "解析": ""}, {"題目": "根據地震波波速變化可知，地球內部可分為地殼、地函、地核三層。上述分層與岩石圈和軟流圈厚度範圍的關係，下列何者最合理？", "選項": ["岩石圈包含地殼與地函上部", "岩石圈僅包含地殼", "軟流圈包含地殼與地函上部", "軟流圈僅包含地函上部"], "答案": 1, "解析": ""}],'困難':[{"題目": "下列選項中的四個活動，光線經過「」中的裝置後，哪一個不會改變光的傳播方向？", "選項": ["開水龍頭→「水龍頭」", "看電影→「投影機」", "照鏡子→「鏡子」", "戴眼鏡→「鏡片」"], "答案": 0, "解析": ""}, {"題目": "一株植物含有不同類型的細胞，以榕樹為例，關於其可行光合作用的細胞數目(甲)與可行呼吸作用的細胞數目(乙)之比較及其原因，下列何者最合理？", "選項": ["甲>乙，因為光合作用需要更多能量", "甲<乙，因為只有葉肉細胞可進行光合作用", "甲=乙，因為所有細胞都可進行光合作用和呼吸作用", "甲>乙，因為只有葉肉細胞可進行光合作用"], "答案": 3, "解析": ""}, {"題目": "「一氧化二氮無色、無味，在常溫常壓下為氣態。它會吸收地表輻射，也對人體的中樞神經有作用，常在醫療上作為麻醉使用。」根據上述介紹，可知一氧化二氮會造成溫室效應，其原因與下列何種氣體造成溫室效應的原理最相似？", "選項": ["氧氣", "二氧化碳", "氮氣", "氫氣"], "答案": 3, "解析": ""}, {"題目": "為避免攝取過量咖啡因，可先降低咖啡豆中的咖啡因含量。將咖啡豆浸泡在有機溶劑中，咖啡因會溶於溶劑中，之後取出咖啡豆加熱，使溶劑揮發掉。二氯甲烷是過往常用的有機溶劑之一，但因擔憂二氯甲烷的殘留，現今較常使用水或二氧化碳作為萃取溶劑。根據上述判斷，使用水或二氧化碳作為萃取溶劑的優點，下列何者最合理？", "選項": ["價格便宜", "不易殘留", "萃取效率高", "不會影響咖啡風味"], "答案": 1, "解析": ""}, {"題目": "小禮將一杯20℃的純水分為甲、乙兩杯，甲、乙兩杯純水的質量分別為M_甲、M_乙，他將兩杯水分別以相同的熱源加熱，並記錄其加熱時間與上升溫度。已知M_甲:M_乙=2:1，若要使甲杯水上升10℃所需的時間為t，則要使乙杯水上升10℃所需的時間為下列何者？", "選項": ["t/4", "t/2", "t", "2t"], "答案": 2, "解析": ""}, {"題目": "「新聞報導某處養殖池的白蝦大量暴斃，調查後初步推測是高溫與暴雨，使養殖池的溶氧量和pH值劇烈變化，導致水質改變所造成的。專家建議為避免白蝦大量死亡，應注意水質變化，並在暴雨後適時補充養分。」根據上述判斷，暴雨後養殖池的溶氧量和pH值變化，下列何者最合理？", "選項": ["溶氧量增加，pH值降低", "溶氧量降低，pH值降低", "溶氧量增加，pH值升高", "溶氧量降低，pH值升高"], "答案": 2, "解析": ""}, {"題目": "有一個帶電的離子含有X、Y、Z三種粒子(質子、電子、中子，未依照順序排列)，且X、Y、Z的粒子數目依序為N_X、N_Y、N_Z。已知X的數目為8、Y的數目為8、Z的數目為10，則此離子最可能為下列何者？", "選項": ["原子", "陰離子", "陽離子", "中性分子"], "答案": 0, "解析": ""}, {"題目": "已知蜂蜜中含有分解澱粉的酵素。現有甲、乙兩試管皆裝有等量且濃度相同的澱粉液，隨機在其中一支加入蜂蜜，另一支加入等量的水。將兩支試管充分搖勻，靜置於適宜的溫度，待一段時間後，以碘液檢測兩支試管的顏色變化。下列關於此實驗的敘述，何者正確？", "選項": ["加入蜂蜜的試管會呈現藍黑色", "加入水的試管會呈現藍黑色", "兩支試管都會呈現藍黑色", "兩支試管都不會呈現藍黑色"], "答案": 2, "解析": ""}, {"題目": "阿忠與小志想要移動地上的書櫃，發現書櫃裝滿書時，他們無法推動書櫃，因此將裡面的書先拿下，之後就可以輕鬆推動書櫃。兩人對此現象的解釋如下：阿忠：由牛頓第二運動定律可知，質量越小，加速度越大，因此越容易推動。小志：由牛頓第二運動定律可知，質量越小，加速度越小，因此越容易推動。判斷兩人的解釋，下列何者正確？", "選項": ["阿忠正確，小志錯誤", "阿忠錯誤，小志正確", "兩人都正確", "兩人都錯誤"], "答案": 0, "解析": ""}, {"題目": "小淳和朋友到新竹的新月沙灣玩水，他們在早上8點到達。他觀察當地的海浪變化，發現下列現象：①早上10點時，海浪打到沙灘上的位置，比他們8點剛到的時候更接近陸地。②下午2點時，海浪打到沙灘上的位置，比他們10點的時候更遠離陸地。根據上述觀察判斷，小淳看到的現象，下列何者最合理？", "選項": ["早上8點是滿潮，10點是乾潮", "早上8點是乾潮，10點是滿潮", "早上8點是滿潮，下午2點是乾潮", "早上8點是乾潮，下午2點是滿潮"], "答案": 1, "解析": ""}]},'112年會考':{'簡單':[{"題目": "若將某區域的原始森林育林成種植單一物種的樹林時，則此區域最可能出現下列何種變化？", "選項": ["物種多樣性降低", "土壤肥力增加", "水源涵養能力增加", "空氣品質改善"], "答案": 0, "解析": ""}, {"題目": "豆腐乳為一種傳統發酵食品，其一做法是將豆腐接種毛黴菌以進行發酵，當豆腐被菌絲完全覆蓋後，再加入調味料而製成。下列有關毛黴菌構造的敘述，何者最合理？", "選項": ["毛黴菌是多細胞生物", "毛黴菌具有葉綠體", "毛黴菌的細胞壁含有幾丁質", "毛黴菌的遺傳物質為RNA"], "答案": 2, "解析": ""}, {"題目": "「若食物中所含的糖分容易被人體快速吸收，則會使血糖急遽上升，而引起某激素分泌增加，進而造成血糖快速下降，甚至形成餐後血糖過低的現象。」根據上述，有關此激素的敘述，下列何者最合理？", "選項": ["由肝臟分泌", "由胰臟分泌", "由腎臟分泌", "由腦下垂體分泌"], "答案": 1, "解析": ""}, {"題目": "舞臺劇演出時，通常會讓周遭的環境昏暗，再用聚光燈來照射演員，讓觀眾能看見演員的表演。有關觀眾能看見演員表演的敘述，下列何者最合理？", "選項": ["演員的眼睛發出光線到觀眾的眼睛", "觀眾的眼睛發出光線到演員的眼睛", "聚光燈的光線反射到演員的眼睛", "聚光燈的光線從演員身上反射到觀眾的眼睛"], "答案": 3, "解析": ""}, {"題目": "道耳頓提出原子說後，越來越多的科學發現及證據顯示，原始的原子說需要修正。下列哪一項最可能是因為電子的發現，原子說需要修正的內容？", "選項": ["原子不可再分", "原子是球形的", "原子量為整數", "原子種類有限"], "答案": 0, "解析": ""}, {"題目": "「白噪音」為一種人類可聽見的聲波，此聲波在各頻率的響度大致相同。在自然界中，類似的聲音包括雨聲、海浪聲等，而家中電風扇所製造出的聲音也與白噪音相似。科學家研究發現，白噪音能掩蔽環境中使人煩躁的聲音，使人的注意力更加集中。根據上文，下列何者最可能是白噪音能使人注意力集中的原因？", "選項": ["白噪音的音量比環境噪音大", "白噪音能降低大腦對環境噪音的敏感度", "白噪音能增加大腦的血液循環", "白噪音能使眼睛更專注"], "答案": 1, "解析": ""}, {"題目": "阿正閱讀一篇報導寫著：日本學者分析史前人類遺骸後，認為當時住在沖繩的史前人類很可能來自於臺灣，研究團隊為了驗證從臺灣航海遷徙的可能性，於2019年進行實驗。如圖(七)所示，他們在臺東市的杉原灣放置竹筏模型，並在模型上裝置GPS定位系統，若竹筏隨海流漂流至沖繩，則能驗證遷徙的可能性。根據海洋洋流的特性判斷，竹筏模型最可能隨何種海流漂流至沖繩？", "選項": ["黑潮", "親潮", "日本暖流", "千島寒流"], "答案": 0, "解析": ""}],'困難':[{"題目": "已知維管束植物可進行某種代謝作用，其反應式為：「甲+二氧化碳→氧氣+乙+水」。有關甲的名稱及其在植物體內主要運送的構造，下列何者最合理？", "選項": ["水分、木質部", "水分、韌皮部", "養分、木質部", "養分、韌皮部"], "答案": 0, "解析": ""}, {"題目": "在超市買到的蘋果可能是幾個月前就已經採摘下來了。為了長時間保存，會在蘋果表面塗上食用蠟，減少與氧氣接觸。蘋果熟化過程會將澱粉轉成糖，過程中會需要氧氣並產生二氧化碳，相關反應式如下：澱粉+水→糖，糖+氧氣→二氧化碳+水。若將剛採摘的蘋果及將蘋果放置數月後的蘋果，分別以碘液檢測，則兩者在檢測結果的差異，下列何者最合理？", "選項": ["則兩者都會變藍黑色", "則兩者都不會變藍黑色", "則剛採摘的蘋果變藍黑色，放置數月的蘋果不變藍黑色", "則剛採摘的蘋果不變藍黑色，放置數月的蘋果變藍黑色"], "答案": 2, "解析": ""}, {"題目": "砒霜是一種毒物，主成分為三氧化二砷(As₂O₃)。古代製作砒霜的技術較不成熟，砒霜中會含有少量的不純物質──硫或硫化物，硫或硫化物接觸到銀，會使銀氧化產生黑色的硫化銀。因此，古代的銀針如果遇到含有硫或硫化物的砒霜，銀針就會變黑。根據上述原理，下列敘述何者最合理？", "選項": ["銀針變黑，表示食物中含有砒霜", "銀針不變黑，表示食物中不含砒霜", "銀針變黑，表示食物中含有硫或硫化物", "銀針不變黑，表示食物中不含硫或硫化物"], "答案": 2, "解析": ""}, {"題目": "取甲、乙兩種化合物，分別在足量的氧氣中燃燒，反應式分別為：甲+3O₂→2CO₂+3H₂O，乙+3O₂→2CO₂+2H₂O。關於甲、乙兩種化合物的組成，下列敘述何者正確？", "選項": ["甲含有碳、氫、氧三種元素", "乙含有碳、氫、氧三種元素", "甲、乙兩者都含有碳、氫兩種元素", "甲、乙兩者都含有碳、氫、氧三種元素"], "答案": 2, "解析": ""}, {"題目": "下列為某牌口香糖廣告的說明：人體口腔中的環境接近中性，在用餐後一段時間會變酸，而增加蛀牙機率。除了每日正確刷牙外，在餐後嚼食無糖口香糖，可刺激唾液分泌，有效「中和」口腔酸性環境，進而降低蛀牙風險。根據上述廣告內容，判斷餐後嚼食無糖口香糖降低蛀牙風險的原理，與下列何者最相似？", "選項": ["使用含氟牙膏刷牙", "定期更換牙刷", "使用牙線清除牙縫", "嚼食木糖醇口香糖"], "答案": 1, "解析": ""}, {"題目": "小逸每天中午都會記錄升旗臺上的竿影變化，他經過多年的測量發現在不考慮天氣因素的情況下，每年的1月底及11月底各有1次中午無竿影的紀錄。已知升旗臺上的旗竿鉛直立於地面上，且小逸居住在北半球，則小逸可能居住在下列何緯度附近？", "選項": ["北緯22度", "北緯23.5度", "北緯25度", "北緯30度"], "答案": 1, "解析": ""}, {"題目": "軟骨發育不全症是體染色體中FGFR3基因發生突變所造成，患者具有身材矮小、四肢短小變形等特徵，若親代只有其中一方為患者，子代就會有50%以上的罹病率。已知阿佑的父母皆為正常人，但阿佑有一個患有軟骨發育不全症的妹妹，則下列關於阿佑的敘述，何者正確？", "選項": ["阿佑必定為正常人", "阿佑必定為患者", "阿佑有50%的機率為患者", "阿佑有25%的機率為患者"], "答案": 1, "解析": ""}, {"題目": "下列為一則新聞報導：「一場泳池慶生派對中，工作人員在泳池中倒入大量的液態氮，以製造煙霧效果並且炒熱氣氛，最後卻造成數人昏迷送醫。有人分析：『氮氣和池水中的氯不會有交互作用，這起事件與池水中的氯無關，主要原因是液態氮氣化後會吸收大量的熱，使得周圍空氣中的氧氣凝結成液態氧，造成缺氧』。」根據上述分析，下列敘述何者正確？", "選項": ["液態氮沸點低於液態氧", "液態氮沸點高於液態氧", "氮的活性比氧高", "氮的活性比氧低"], "答案": 0, "解析": ""}]},'113年會考':{'簡單':[{"題目": "木糖醇是一種可以代替蔗糖的食品添加物。若要知道木糖醇是否和乙醇一樣都是醇類，應查詢木糖醇的何項資訊？", "選項": ["外觀", "酸鹼值", "化學式", "沸點"], "答案": 2, "解析": ""}, {"題目": "人體副甲狀腺分泌的激素是經由X所運送，若此激素分泌過多，會影響骨骼中的Y含量，可能造成骨質疏鬆。根據上述說明，推論X和Y最可能為下列何者？", "選項": ["血液、鈣", "血液、鐵", "淋巴、鈣", "淋巴、鐵"], "答案": 0, "解析": ""}, {"題目": "虎門銷煙為清朝銷毀鴉片的歷史事件。把海水引入浸泡池浸泡鴉片，之後再加入石灰等物質，石灰遇水會改變水溫，此改變也利於將鴉片溶於水中，等退潮時再排入海中。關於上述銷煙過程的改變，下列何者最合理？", "選項": ["石灰遇水產生放熱反應，提高水溫", "石灰遇水產生吸熱反應，降低水溫", "石灰遇水產生放熱反應，降低水溫", "石灰遇水產生吸熱反應，提高水溫"], "答案": 0, "解析": ""}, {"題目": "將裝有紅棕色二氧化氮(NO₂)氣體的密閉玻璃瓶放入冰水中，二氧化氮會互相結合產生無色的四氧化二氮(N₂O₄)氣體，瓶內的顏色會逐漸變淡，反應式為：2NO₂ ⇌ N₂O₄ + 熱量。若改將此密閉玻璃瓶放入熱水中，關於瓶內的氣體變化，下列何者最合理？", "選項": ["紅棕色變深", "紅棕色變淡", "氣體體積縮小", "氣體總量減少"], "答案": 0, "解析": ""}, {"題目": "老師選用基因型皆為Aa的雄、雌長翅果蠅進行交配，並要求學生觀察1000隻第一子代果蠅的表現型與數量。已知小坪僅觀察到4隻長翅果蠅及6隻短翅果蠅後，就直接推測「長翅為隱性」。關於小坪的推論與觀察，下列何者最合理？", "選項": ["小坪的推論正確，因為長翅數量較少", "小坪的推論正確，因為短翅數量較少", "小坪的推論不正確，因為樣本數太少", "小坪的推論不正確，因為長翅果蠅數量太少"], "答案": 2, "解析": ""}, {"題目": "以下為某篇關於重力波的報導：「重力波」是愛因斯坦預言的物理現象之一。當帶有質量的物體進行加速度運動時，會在時空中產生波動，這種波就是重力波，重力波的傳播不需要介質，即使在真空中也能傳遞。請問下列哪一個現象，最可能產生重力波？", "選項": ["燭火器的火苗", "電風扇的風葉", "噴射機的飛行", "兩顆黑洞的互相繞轉"], "答案": 3, "解析": ""}, {"題目": "已知刺絲胞動物皆生活在水中。小花看到某網友提到：「所有刺絲胞動物都生活在海洋中。例如海月水母就是一種生活在海洋中的刺絲胞動物」，若小花想驗證「所有刺絲胞動物都生活在海洋中」的結論是否正確，最適合採用下列何種方法？", "選項": ["查找刺絲胞動物的共同特徵", "查找海洋中還有哪些動物是刺絲胞動物", "查找淡水中有沒有刺絲胞動物", "查找水螅蟲是否為刺絲胞動物"], "答案": 2, "解析": ""}],'困難':[{"題目": "以下為某學生在同一時間、同一花圃內，種植甲、乙、丙三種不同品牌薄荷種子的步驟：1.在花圃內畫設L甲、L乙、L丙三條種植的路線。2.分別平均在路線L甲灑上甲品牌種子、路線L乙灑上乙品牌種子、路線L丙灑上丙品牌種子。3.等待一段時間後，分別量測並記錄三條路線中，每個品牌種子發芽後植株的高度。關於此實驗的設計，下列何者最合理？", "選項": ["應使用相同的種子品牌", "應使用相同的種植路線", "應選擇不同的花圃進行實驗", "應選擇相同品牌的種子在不同路線種植"], "答案": 3, "解析": ""}, {"題目": "小書與小花將某株被子植物莖部的形成層外圍構造剔除，發現此株植物逐漸因根部無法獲得養分而死亡，以下為兩人對此株植物的推論：小書：此株植物較可能為雙子葉植物。小花：此株植物較可能為單子葉植物。請問兩人的推論，下列何者正確？", "選項": ["小書正確，因為雙子葉植物才有形成層", "小書正確，因為雙子葉植物的根才有維管束", "小花正確，因為單子葉植物才有形成層", "小花正確，因為單子葉植物的根才有維管束"], "答案": 0, "解析": ""}, {"題目": "某篇關於氫應用的報導說明如下：「金屬多以氧化物的形式封藏於岩石礦物中，可利用氫和氧易起反應的特性，將氧從礦物中移除，留下可用的純金屬和水。」關於上述畫線處的反應，最可能是下列何者？", "選項": ["碳還原氧化鐵", "二氧化碳與水反應", "鉀與水反應", "鎂與氧反應"], "答案": 2, "解析": ""}, {"題目": "青蛙的染色體有13對，其中1對為性染色體。在不考慮突變的情況下，雌蛙卵巢內經減數分裂後的卵子，應有幾條性染色體？", "選項": ["1", "2", "12", "13"], "答案": 0, "解析": ""}, {"題目": "一座游泳池裡有多少的尿？安賽蜜是優酪乳中的甜味劑，不易被人體消化，會由尿液排出體外。研究團隊檢測加拿大游泳池的安賽蜜濃度，一座84萬公升游泳池的安賽蜜濃度為每公升35微克，若推算此游泳池的尿液總量為多少公升？（假設每人每次排尿量約為200毫升，尿液的安賽蜜濃度為每公升800微克）", "選項": ["3.5", "6", "7.35", "36.75"], "答案": 2, "解析": ""}, {"題目": "已知甲、乙兩種不同的金屬元素分別與同濃度的鹽酸反應，反應後只會產生氫氣與金屬的氯化物。取甲金屬24.3g與鹽酸反應，另取乙金屬65.4g與鹽酸反應，兩個反應所產生的氫氣量相同。若甲的原子量為24.3，化合價為n1；乙的原子量為65.4，化合價為n2，則n1與n2的大小關係為何？", "選項": ["n1=n2", "n1>n2", "n1<n2", "無法判斷"], "答案": 1, "解析": ""}, {"題目": "小美在植物圖鑑中看到杜鵑花科(Ericaceae)中的金毛杜鵑(Rhododendron oldhamii)後，若想要依學名搜尋與此植物同屬但不同物種的植物，則鍵入的關鍵字應為下列何者？", "選項": ["Ericaceae", "Rhododendron", "oldhamii", "Rhododendron oldhamii"], "答案": 1, "解析": ""}]},'114年會考':{'簡單':[{"題目": "孕婦產檢時常使用超聲波來檢查腹中胎兒的生長情形，當醫生使用超聲波進行檢查時，孕婦對超聲波的聽覺感受，下列說明何者最合理？", "選項": ["孕婦會聽見低沉的轟隆聲", "孕婦會聽見尖銳刺耳的聲音", "因頻率過高，故孕婦聽不見超聲波", "因波速過快，故孕婦聽不見超聲波"], "答案": 2, "解析": ""}, {"題目": "有報導指出：「在都市觀察到麻雀的頻率有變少的趨勢，可能的原因很多，其中之一為白尾八哥的入侵。白尾八哥築巢偏好的位置與麻雀相近，食物種類也相似，甚至被觀察到會以麻雀幼鳥為食。」根據上述報導，白尾八哥與麻雀之間最符合下列哪兩種交互作用？", "選項": ["競爭、掠食", "競爭、共生", "共生、掠食", "寄生、掠食"], "答案": 0, "解析": ""}, {"題目": "某電玩公司為了防止兒童誤吞遊戲主機的遊戲卡，因而在遊戲卡塗上苯甲地那銨。苯甲地那銨是非常苦的物質，其濃度只要達到______，也就是每1000 g的溶液中含有30 mg的苯甲地那銨，便會苦到讓人難以忍受。上述空格最適合填入下列何者？", "選項": ["30%", "30 mg", "30 ppm", "30 g/cm³"], "答案": 2, "解析": ""}, {"題目": "房產專家建議，若可以選擇，住在臺北的居民，其陽臺面對的方向盡量不要朝向北邊、東北邊。因為冬天的時候容易下雨，且陽臺面對的方向易有強風，雨水會直接打向陽臺，容易使晾晒的衣物淋溼。專家的這個建議是否適用於其他地區？", "選項": ["適用於臺南，因為冬天時位處季風迎風面的臺南氣候偏溼", "適用於基隆，因為冬天時位處季風背風面的基隆氣候偏溼", "不適用於宜蘭，因為冬天時位處季風迎風面的宜蘭氣候偏乾", "不適用於高雄，因為冬天時位處季風背風面的高雄氣候偏乾"], "答案": 3, "解析": ""}],'困難':[{"題目": "有三顆小球，在紅光照射下，觀察到小球分別呈現紅色、紅色、黑色，關於這三顆小球在白光照射下所呈現顏色的推論，下列何者最合理？", "選項": ["至少有一顆紅球", "至少有一顆黑球", "最多有兩顆白球", "最多有兩顆綠球"], "答案": 0, "解析": ""}, {"題目": "為了減少溫室氣體，地質學家將二氧化碳變成岩石的一部分。將發電廠產生的二氧化碳灌入大量的水中，以管線將這些氣泡水輸送到數公里遠的區域，接著透過高壓將氣泡水注入地下一千公尺深的岩層中，這些氣泡水會和鈣、鎂等離子反應而「固化」，並填充岩層空隙。二氧化碳一但固化後，就能存在岩層中。上述二氧化碳變成岩石一部分的過程，是利用下列二氧化碳(水溶液)的何種性質？", "選項": ["密度大於空氣", "溶於水呈酸性", "可與鈣離子反應產生難溶於水的碳酸鹽", "可與鈉離子反應產生易溶於水的碳酸鹽"], "答案": 2, "解析": ""}, {"題目": "阿偉想要藉由實驗比較鋁和銅的比熱大小關係，若加熱條件相同，且忽略熱量散失，則下列四種方式，哪一種最合理？", "選項": ["分別加熱相同體積的鋁和銅，先開始熔化者比熱較小", "分別加熱相同體積的鋁和銅，溫度上升較快者比熱較小", "分別加熱相同質量的鋁和銅，先開始熔化者比熱較小", "分別加熱相同質量的鋁和銅，溫度上升較快者比熱較小"], "答案": 3, "解析": ""}, {"題目": "阿貴在做砝碼質量為200 g的實驗時，他施一個鉛直向上的定力將彈簧秤以穩定且緩慢的速度提高10 cm，並使砝碼上升5 cm，此過程彈簧秤拉力所作的功為多少gw·cm？", "選項": ["1000", "1500", "2000", "3000"], "答案": 1, "解析": ""}]}},'英文':{'110年會考':{'簡單':[{"題目": "Listen! The baby ______ in the bedroom. Why don't you go in and take a look?", "選項": ["is crying", "cries", "cried", "was crying"], "答案": 0, "解析": ""}, {"題目": "Jill is ______ that the city park is closed for the music festival because now she has no place to walk her dog.", "選項": ["excited", "afraid", "upset", "bored"], "答案": 2, "解析": ""}, {"題目": "Steven wants to be a ______, because he loves to watch people enjoy the food he makes.", "選項": ["coach", "dentist", "chef", "pilot"], "答案": 2, "解析": ""}, {"題目": "Paul misses his parents a lot. He ______ them since he came to work in Taiwan a year ago.", "選項": ["doesn't see", "didn't see", "hasn't seen", "won't see"], "答案": 2, "解析": ""}, {"題目": "Our teacher Ms. Wu seldom laughs, but when she ______, everyone in the same building can hear her.", "選項": ["does", "is", "has", "was"], "答案": 0, "解析": ""}, {"題目": "My sister is coming to my home today. She ______ with me for a week.", "選項": ["stayed", "stays", "will stay", "has stayed"], "答案": 3, "解析": ""}, {"題目": "Edward had worked as a computer engineer for ten years. This ______ helped him a lot when he started his own online business.", "選項": ["place", "time", "money", "experience"], "答案": 0, "解析": ""}, {"題目": "If you're interested in our business plan, ______ this number and ask for Ms. Lee for more information.", "選項": ["touch", "reach", "write", "call"], "答案": 3, "解析": ""}, {"題目": "Jimmy would not get up for breakfast, ______ his dad had already tried to pull him out of bed for five minutes.", "選項": ["so", "but", "if", "because"], "答案": 0, "解析": ""}, {"題目": "Duncan spent all his money trying to ______ the bookstore his mom left him. Sadly, it went out of business last month.", "選項": ["find", "build", "keep", "close"], "答案": 1, "解析": ""}, {"題目": "Fiona loves listening to her children sing songs ______ at school.", "選項": ["quietly", "bravely", "shyly", "beautifully"], "答案": 3, "解析": ""}, {"題目": "Beverly eats lots of snacks ______ meals. That's why she is often too full to eat any dinner.", "選項": ["between", "behind", "beside", "beyond"], "答案": 3, "解析": ""}, {"題目": "Nora: Can I check your drawer for some tools we can use? Matt: Sure. Take a look ______ you want. You might find something helpful.", "選項": ["whenever", "wherever", "whatever", "whoever"], "答案": 2, "解析": ""}, {"題目": "What can we learn about Lynn from the dialogue?", "選項": ["She doesn't like parties.", "She lost her camera.", "She took many photos at the party.", "She gave Tom a gift."], "答案": 2, "解析": ""}],'困難':[{"題目": "What can we learn about The Piano Lesson from the reading?", "選項": ["It was painted in 1885.", "It was painted by Henri Matisse.", "It was painted in Paris.", "It was painted by Claude Monet."], "答案": 3, "解析": ""}, {"題目": "What does \"do that\" mean in the reading?", "選項": ["Paint a picture.", "Play the piano.", "Teach a class.", "Go to a concert."], "答案": 1, "解析": ""}, {"題目": "What is NOT used in the reading to refer to Henri Matisse?", "選項": ["The artist.", "The French painter.", "The writer of the book.", "The man in the picture."], "答案": 0, "解析": ""}, {"題目": "What idea is talked about in the reading?", "選項": ["How to paint a picture.", "How to play the piano.", "How to teach a class.", "How to write a book."], "答案": 2, "解析": ""}, {"題目": "Which is true about Teachers' Day from the reading?", "選項": ["It is celebrated in June.", "Students give gifts to teachers.", "Teachers get a day off.", "Students write letters to teachers."], "答案": 1, "解析": ""}, {"題目": "What does \"not everyone hailed this decision\" mean in the reading?", "選項": ["Everyone was happy about it.", "Not everyone was happy about it.", "No one was happy about it.", "Everyone was against it."], "答案": 2, "解析": ""}, {"題目": "What does the writer try to do with this reading?", "選項": ["To explain why Teachers' Day is important.", "To describe how Teachers' Day is celebrated.", "To compare Teachers' Day in different countries.", "To suggest ways to celebrate Teachers' Day."], "答案": 2, "解析": ""}, {"題目": "Why does National Formosa Railway write this letter?", "選項": ["To advertise new train routes.", "To inform passengers of schedule changes.", "To apologize for late trains.", "To invite people to a special event."], "答案": 1, "解析": ""}, {"題目": "What is true about NFR's trains between August 14 and 28, 2016?", "選項": ["All trains will be canceled.", "Only morning trains will run.", "Some trains will not stop at certain stations.", "All trains will be free."], "答案": 2, "解析": ""}, {"題目": "Below are the ideas that are talked about in the reading. a. The problems Darayya faces during the war. b. How the library helps people in Darayya. c. Why the library is important to the people. d. How the library was built. Which of these ideas is NOT talked about in the reading?", "選項": ["a", "b", "c", "d"], "答案": 0, "解析": ""}, {"題目": "Why do people in Darayya go to the library even during the war?", "選項": ["To borrow books.", "To escape the bombs.", "To meet friends.", "To find information."], "答案": 1, "解析": ""}, {"題目": "What do we know about Darayya's library?", "選項": ["It was built before the war.", "It has more than 15,000 books.", "It is the only library in Syria.", "It is run by the government."], "答案": 1, "解析": ""}, {"題目": "請依題組文章作答，選出最適合填入文章中標示_35_之空格的選項。", "選項": ["before", "since", "although", "because"], "答案": 2, "解析": ""}, {"題目": "請依題組文章作答，選出最適合填入文章中標示_36_之空格的選項。", "選項": ["before", "since", "although", "because"], "答案": 3, "解析": ""}, {"題目": "請依題組文章作答，選出最適合填入文章中標示_37_之空格的選項。", "選項": ["before", "since", "although", "because"], "答案": 3, "解析": ""}]},'111年會考':{'簡單':[{"題目": "The movie starts at two o'clock, _____ let's meet at the theater at one forty-five.", "選項": ["and", "but", "so", "or"], "答案": 2, "解析": ""}, {"題目": "Peter is afraid of the dark. He even leaves the _____ on when sleeping.", "選項": ["light", "radio", "television", "window"], "答案": 0, "解析": ""}, {"題目": "Pam is a _____ baseball player; she has more fans than any other player on her team.", "選項": ["lonely", "poor", "popular", "quiet"], "答案": 2, "解析": ""}, {"題目": "I did not do my homework, so my teacher said I _____ stay after school to finish it.", "選項": ["could", "would", "might", "should"], "答案": 1, "解析": ""}, {"題目": "Kevin has only enough money for the bag or the shoes. That is a hard _____ to make.", "選項": ["choice", "game", "promise", "mistake"], "答案": 1, "解析": ""}, {"題目": "It was _____ for us to answer the math question because we've done the same kind of problems many times.", "選項": ["easy", "boring", "interesting", "surprising"], "答案": 0, "解析": ""}, {"題目": "Although it took me lots of time _____ a big meal for ten people, I was happy that everyone enjoyed it.", "選項": ["buy", "cook", "find", "share"], "答案": 1, "解析": ""}, {"題目": "Don't let the children swim in the river. We don't know how _____ it is.", "選項": ["deep", "clean", "cold", "wide"], "答案": 1, "解析": ""}, {"題目": "Bob is _____ of the boys in the family. He never does any housework. His brothers all help with cleaning and cooking.", "選項": ["the laziest", "the kindest", "the smartest", "the strongest"], "答案": 0, "解析": ""}, {"題目": "Aunt Gina has lived in this town for more than sixty years, so she _____ it very well.", "選項": ["visits", "knows", "likes", "leaves"], "答案": 2, "解析": ""}, {"題目": "We won't see the sun even after the typhoon leaves, because the news said that heavy rain would _____ tomorrow.", "選項": ["come", "go", "fall", "last"], "答案": 2, "解析": ""}, {"題目": "Yesterday when I got home from work, my brother _____ for dinner, so he invited me to join him.", "選項": ["cooks", "cooked", "was cooking", "has cooked"], "答案": 0, "解析": ""}, {"題目": "You were _____ not to lend Amy money. She never gives back what she borrows.", "選項": ["careful", "wrong", "right", "kind"], "答案": 3, "解析": ""}, {"題目": "Have you found a summer job yet? Mr. Firth _____ someone to take care of his kids from July to August.", "選項": ["has", "uses", "wants", "knows"], "答案": 2, "解析": ""}, {"題目": "David looked out of the balcony window and saw a woman get in his car _____ away.", "選項": ["running", "riding", "driving", "walking"], "答案": 1, "解析": ""}, {"題目": "The police haven't found the little girl who _____ at a supermarket. They'll keep looking.", "選項": ["went shopping", "was shopping", "got missing", "got lost"], "答案": 2, "解析": ""}, {"題目": "Buses to the airport only come once every hour, and we just missed _____ . Why didn't you hurry?", "選項": ["them", "it", "one", "that"], "答案": 0, "解析": ""}, {"題目": "Ariel _____ every night for a week before her Chinese test and got a very good grade.", "選項": ["has studied", "studies", "studied", "will study"], "答案": 3, "解析": ""}],'困難':[{"題目": "While reading this story, Brad saw the word \"trolling\" and didn't know what it meant. He could _____ look it up in the dictionary.", "選項": ["either", "never", "only", "also"], "答案": 2, "解析": ""}, {"題目": "What does Tea-Rock celebrate?", "選項": ["The opening of a new store.", "Its 20th birthday.", "A national holiday.", "A special local event."], "答案": 1, "解析": ""}, {"題目": "Here is the postcard Jason is going to send to Tea-Rock 20. What else does he need to send this postcard?", "選項": ["A map.", "A stamp.", "A photo.", "A pen."], "答案": 2, "解析": ""}, {"題目": "What can we learn about sugar from the infographic?", "選項": ["Sugar is found in only a few foods.", "Sugar is the main source of energy for the body.", "Too much sugar can lead to health problems.", "Sugar is good for building strong bones."], "答案": 3, "解析": ""}, {"題目": "What can be a reason why the list of \"Sugar that is hidden in foods and drinks\" is longer in the Western diet?", "選項": ["Western people eat more vegetables.", "Western people drink more water.", "Western people eat more processed foods.", "Western people cook more at home."], "答案": 0, "解析": ""}, {"題目": "Why did Darrell tell Marina to go to Pinterest?", "選項": ["To find a new recipe.", "To learn a new language.", "To plan a vacation.", "To get some new ideas."], "答案": 3, "解析": ""}, {"題目": "What does it mean when you learn something from A to Z?", "選項": ["You forget everything.", "You learn everything about it.", "You only learn the basics.", "You don't learn anything new."], "答案": 1, "解析": ""}, {"題目": "Which idea is talked about in the first paragraph of the reading?", "選項": ["Tabata training is easy.", "Tabata training is a type of exercise.", "Tabata training was invented in Japan.", "Tabata training is only for athletes."], "答案": 1, "解析": ""}, {"題目": "Who might find that Tabata training is right for them?", "選項": ["A person who has only 4 minutes to exercise.", "A person who likes to exercise for a long time.", "A person who doesn't like to exercise.", "A person who wants to lose weight without exercising."], "答案": 0, "解析": ""}, {"題目": "Which is true about Tabata training?", "選項": ["It takes 20 minutes to complete.", "It involves doing the same exercise for 4 minutes.", "It includes 8 rounds of exercise.", "It is only for young people."], "答案": 3, "解析": ""}, {"題目": "There are four important points in the report: a. What \"No Overtime Day\" is b. Why some people are against it c. The results of a survey d. What \"No Overtime Day\" means for employees Which of these points is NOT mentioned in the report?", "選項": ["a", "b", "c", "d"], "答案": 2, "解析": ""}, {"題目": "What does resentful mean in the reading?", "選項": ["Happy.", "Angry.", "Sad.", "Tired."], "答案": 1, "解析": ""}, {"題目": "What does Cameroon's government most likely think of Ambazonia?", "選項": ["It wants Ambazonia to be independent.", "It wants Ambazonia to be part of Cameroon.", "It wants Ambazonia to be part of Nigeria.", "It wants Ambazonia to be a new country."], "答案": 1, "解析": ""}, {"題目": "What does Elisa Grant try to tell readers by talking about the history of Cameroon?", "選項": ["It is important to learn from history.", "History is always repeated.", "History can help us understand the present.", "History is written by the winners."], "答案": 0, "解析": ""}, {"題目": "What is recommended to people who are visiting the Southend Trail?", "選項": ["Bring a map.", "Wear comfortable shoes.", "Bring plenty of water.", "Start the trail early in the morning."], "答案": 3, "解析": ""}, {"題目": "What does lodging mean in the reading?", "選項": ["A place to eat.", "A place to stay.", "A place to shop.", "A place to work."], "答案": 2, "解析": ""}, {"題目": "Kaylen will start his trip from Cove. He plans to visit one of the old castles. He also wants to see the sea lions at Sea Lion Point and the art gallery in Endicott. What is the best route for him?", "選項": ["Cove → Endicott → Sea Lion Point", "Cove → Sea Lion Point → Endicott", "Cove → Endicott → Sea Lion Point → Cove", "Cove → Sea Lion Point → Endicott → Cove"], "答案": 3, "解析": ""}, {"題目": "English words are made of 26 letters, and palindromes and anagrams are two kinds of word games. A palindrome is a word that reads the same from left to right and right to left, like \"noon.\" An anagram is a word made by changing the order of the letters in another word, like \"listen\" and \"silent.\" Which of the following is an anagram of \"earth\"?", "選項": ["heart", "there", "three", "these"], "答案": 0, "解析": ""}]},'112年會考':{'簡單':[{"題目": "Dennis enjoys _____ in public. He is proud of his beautiful voice.", "選項": ["dancing", "painting", "singing", "writing"], "答案": 2, "解析": ""}, {"題目": "Mrs. Johnson can't hear very well. If you need to talk to her, you must _____.", "選項": ["speak louder", "keep quiet", "talk to her by email", "walk up to her quickly"], "答案": 0, "解析": ""}, {"題目": "People got very excited when they watched Ms. Smith _____ at the party.", "選項": ["perform", "performs", "performing", "performed"], "答案": 0, "解析": ""}, {"題目": "I tried on these shoes in several different _____ , and I thought the white pair looked best.", "選項": ["colors", "designs", "sizes", "styles"], "答案": 3, "解析": ""}, {"題目": "Rex did not feel the earthquake this morning. He _____ in the park at the time.", "選項": ["runs", "ran", "was running", "has been running"], "答案": 2, "解析": ""}, {"題目": "Mr. Lee has worked in the same store for ten years; he's never thought about _____.", "選項": ["retire", "to retire", "retired", "retiring"], "答案": 3, "解析": ""}, {"題目": "I didn't take the bus today because it was _____. All the seats were taken and I had to stand all the way.", "選項": ["crowded", "noisy", "dirty", "slow"], "答案": 0, "解析": ""}, {"題目": "Don't go away when you're cooking, _____ the food might burn.", "選項": ["and", "but", "or", "so"], "答案": 2, "解析": ""}, {"題目": "Jerry wanted to know _____ he was kicked off the soccer team, but no one gave him the answer.", "選項": ["why", "when", "where", "how"], "答案": 0, "解析": ""}, {"題目": "Jenny is already forty, doesn't have a job and often makes trouble for her parents. _____ They love their daughter, though, and don't mind helping her.", "選項": ["for", "if", "as", "since"], "答案": 3, "解析": ""}, {"題目": "Ed and Jill _____ camping this weekend, so they have to finish their homework by Friday.", "選項": ["go", "went", "are going", "have gone"], "答案": 3, "解析": ""}, {"題目": "Doraemon, a blue Japanese robot cat, has hated mice since his ears _____ by a mouse.", "選項": ["bite", "bit", "are bitten", "were bitten"], "答案": 2, "解析": ""}, {"題目": "If we play some interesting games in class, there _____ more fun in learning English.", "選項": ["is", "was", "will be", "has been"], "答案": 3, "解析": ""}, {"題目": "The _____ of this shop was so bad; I never got any answer after I emailed them many times.", "選項": ["service", "business", "sale", "product"], "答案": 0, "解析": ""}, {"題目": "It's not easy to see those islands clearly from here on sunny days, and it's even _____ on cloudy days.", "選項": ["better", "harder", "higher", "wider"], "答案": 1, "解析": ""}, {"題目": "Do you remember the CD I was looking for for months? I _____ found it in a small record shop downtown.", "選項": ["easily", "nearly", "quietly", "finally"], "答案": 3, "解析": ""}, {"題目": "Business at Jane's shop has not been good these days. And the new supermarket across the street _____ things at much lower prices, so she is worried.", "選項": ["sells", "sold", "will sell", "has sold"], "答案": 0, "解析": ""}, {"題目": "Scott wasn't sure if the young woman before him was _____ pulled him out of a car accident last night.", "選項": ["one", "that", "she", "what"], "答案": 3, "解析": ""}, {"題目": "I _____ swimming for several years before I went to this high school. I gave it up because I didn't have enough time.", "選項": ["played", "had played", "have played", "was playing"], "答案": 0, "解析": ""}],'困難':[{"題目": "Frank Kane is so good in the movie that many people _____ he will win the best actor award.", "選項": ["hope", "predict", "wonder", "decide"], "答案": 2, "解析": ""}, {"題目": "The new medicine that just came out on the market _____ thousands of lives.", "選項": ["saved", "has saved", "was saving", "was saved"], "答案": 2, "解析": ""}, {"題目": "Now I often think of those days with Pip, my pet dog. When I read in my room, he sat by my feet. When I went for a walk, he ran around me. He brought me much _____ than I could have expected.", "選項": ["stress", "trouble", "worry", "joy"], "答案": 1, "解析": ""}, {"題目": "According to the notes, which is the WRONG way to help a baby bird that is out of its nest?", "選項": ["Take it to a vet if you can.", "Place it back into its nest.", "Keep it away from cats and dogs.", "Leave it where you found it."], "答案": 2, "解析": ""}, {"題目": "According to the notes, what do birds do if their babies have the smell of people?", "選項": ["They move the babies to a new nest.", "They ask people for help.", "They kill the babies.", "They stop feeding the babies."], "答案": 0, "解析": ""}, {"題目": "According to the reading, which is one of the reasons for food waste?", "選項": ["People buy too much food.", "People don't know how to cook.", "Farmers don't grow enough food.", "Restaurants don't serve enough food."], "答案": 2, "解析": ""}, {"題目": "What is the trick that the mosquito uses in rain?", "選項": ["It hides under leaves.", "It flies away from the rain.", "It lets the rain hit it.", "It flies in the same direction as the rain."], "答案": 3, "解析": ""}, {"題目": "What keeps a mosquito safe in the rain?", "選項": ["Its small size", "Its strong wings", "Its hard body", "Its light weight"], "答案": 0, "解析": ""}, {"題目": "When would it be dangerous for a mosquito in the rain?", "選項": ["When it is flying", "When it is resting", "When it is drinking", "When it is mating"], "答案": 2, "解析": ""}, {"題目": "What do the three stories in the reading all talk about?", "選項": ["How small things can do big things", "How people can learn from animals", "How animals can survive in nature", "How science can explain strange things"], "答案": 1, "解析": ""}, {"題目": "What do we know about \"For Elise\" from the reading?", "選項": ["It was written for a woman named Elise.", "It was written by Beethoven.", "It was written in 1810.", "It was written in Vienna."], "答案": 3, "解析": ""}, {"題目": "What can we learn about the three women from the stories?", "選項": ["They were all famous.", "They were all musicians.", "They all had something to do with music.", "They all lived in the 19th century."], "答案": 3, "解析": ""}, {"題目": "What idea does Jesse Cohen talk about in the reading?", "選項": ["Why people should exercise more", "How to make friends easily", "Why small talk is important", "How to be a good listener"], "答案": 0, "解析": ""}, {"題目": "In the third paragraph, why does Jesse Cohen think \"this rule can be bad for children\"?", "選項": ["They may not learn new things.", "They may not make new friends.", "They may not be able to speak.", "They may not be able to think."], "答案": 0, "解析": ""}, {"題目": "In the reading, after Jesse Cohen talks about an idea, he often gives an example to show that his idea is correct. Which of the following is an example he gives?", "選項": ["He talks about his own experience.", "He talks about a scientific study.", "He talks about a famous person.", "He talks about a news story."], "答案": 2, "解析": ""}, {"題目": "What is the reading mostly about?", "選項": ["Why people should be more kind", "How people can communicate better", "Why people should talk more", "How people can make more friends"], "答案": 1, "解析": ""}, {"題目": "What does it mean when someone has empathy?", "選項": ["They are good at talking.", "They can understand how others feel.", "They are very smart.", "They like to help others."], "答案": 3, "解析": ""}, {"題目": "Which is true about Marie Colvin?", "選項": ["She was a famous writer.", "She was a famous singer.", "She was a famous teacher.", "She was a famous reporter."], "答案": 3, "解析": ""}, {"題目": "Select the correct option to fill in blank 42:", "選項": ["although", "because", "since", "so"], "答案": 2, "解析": ""}, {"題目": "Select the correct option to fill in blank 43:", "選項": ["although", "because", "since", "so"], "答案": 0, "解析": ""}]},'113年會考':{'簡單':[{"題目": "My_____hurts so much that I cannot even turn my head.", "選項": ["arm", "knee", "neck", "stomach"], "答案": 2, "解析": ""}, {"題目": "Our school basketball team won the national game last night. We are so_____them.", "選項": ["popular with", "proud of", "sorry for", "worried about"], "答案": 1, "解析": ""}, {"題目": "Tomorrow is Sam's last day in the office. Nobody knows why he decided to_____.", "選項": ["hide", "leave", "pack", "walk"], "答案": 1, "解析": ""}, {"題目": "It's not a good idea to go mountain climbing in this bad_____. We should wait until the typhoon goes away.", "選項": ["chance", "dream", "habit", "weather"], "答案": 3, "解析": ""}, {"題目": "Chris loves walking with Anna on snowy days, but Anna hates_____very much.", "選項": ["them", "so", "one", "it"], "答案": 3, "解析": ""}, {"題目": "Lora likes to eat bananas that are already a little brown on the outside, and so_____I.", "選項": ["am", "do", "have", "will"], "答案": 0, "解析": ""}, {"題目": "Your refrigerator shouldn't be making loud noises now, but if it_____does, just give me a call and I'll come check it again.", "選項": ["already", "even", "finally", "still"], "答案": 3, "解析": ""}, {"題目": "After winning money in the card game, Jay decided to try again. He felt that he might also be_____a second time.", "選項": ["famous", "interested", "lucky", "ready"], "答案": 2, "解析": ""}, {"題目": "The knife doesn't cut very well. It's not as_____as before.", "選項": ["bright", "heavy", "quick", "sharp"], "答案": 3, "解析": ""}, {"題目": "John will stay with his sister until he_____an apartment.", "選項": ["will find", "would find", "finds", "found"], "答案": 2, "解析": ""}, {"題目": "Students_____to go on the school trip should ask their parents first.", "選項": ["who want", "want", "who they want", "what they want"], "答案": 0, "解析": ""}, {"題目": "The temple sits alone in the mountains at a height of 3,000m_____sea level.", "選項": ["above", "at", "below", "in"], "答案": 0, "解析": ""}, {"題目": "Patty spent several days planning to invite Charlie to dinner,_____she couldn't say a word when they met.", "選項": ["but", "if", "or", "so"], "答案": 0, "解析": ""}, {"題目": "I can't tell you what I think of the movie because I_____it. I'll probably watch it this Saturday.", "選項": ["am not seeing", "don't see", "haven't seen", "won't see"], "答案": 2, "解析": ""}, {"題目": "The new guy at the help desk answers calls like a_____. There are no ups and downs in his voice and you can't tell if he is happy or sad.", "選項": ["father", "foreigner", "radio", "robot"], "答案": 3, "解析": ""}, {"題目": "Jasmine planned to spend her summer in the country, but right after she got there, she started to_____the noise in the city.", "選項": ["enjoy", "mind", "miss", "notice"], "答案": 2, "解析": ""}, {"題目": "\"Bad traffic\" is perhaps the_____excuse for being late when your boss knows it only takes you five minutes to walk to work.", "選項": ["easiest", "oldest", "smartest", "worst"], "答案": 1, "解析": ""}, {"題目": "The housework in Mr. and Mrs. Wang's family_____between them and their kids. Everyone's got their own job to do.", "選項": ["is shared", "are shared", "shares", "share"], "答案": 0, "解析": ""}, {"題目": "I want to find another dentist because_____pulled out a good tooth last time I went to him.", "選項": ["I", "me", "mine", "myself"], "答案": 2, "解析": ""}],'困難':[{"題目": "Mom: Linda, you've been playing computer games all evening! Have you finished your report? Linda: Well,_____most of it this afternoon, and I'll finish it by Friday.", "選項": ["I would do", "I did", "I was doing", "I'll do"], "答案": 1, "解析": ""}, {"題目": "Why did Philip go out?", "選項": ["To meet a woman.", "To look for his father.", "To ask the police for help.", "To buy food for his brother."], "答案": 3, "解析": ""}, {"題目": "Why was Philip's father angry?", "選項": ["He forgot his keys.", "The woman was hiding from him.", "The police didn't believe what he said.", "Philip and his brother went out at night."], "答案": 2, "解析": ""}, {"題目": "Kevin is going to buy some fresh bread at Baker's Kitchen. He loves white bread, his mom likes farm bread, his father enjoys bagels, and his sister eats only challah. Which is the earliest possible time for him to get all these breads for his family?", "選項": ["11:00am.", "4:00pm.", "5:00pm.", "7:00pm."], "答案": 1, "解析": ""}, {"題目": "What do we know about Baker's Kitchen?", "選項": ["It is open five days a week.", "Its breads are half price one hour before closing.", "Its croissants and pretzels are sold on weekends.", "Its members can save $100 when they shop on Fridays."], "答案": 2, "解析": ""}, {"題目": "What is recommended to people who want to visit the festival?", "選項": ["Using the free festival bus service.", "Visiting the festival on the weekend.", "Entering Satyr's Park from Fox Street.", "Parking in Garden Square and walking to the festival."], "答案": 3, "解析": ""}, {"題目": "What can we learn about the farmers' market from the map?", "選項": ["The farmers' market is next to the flower market.", "The farmers' market and the festival are on the same block.", "You can go to the farmers' market by taking Bus No. 157 to Puppy Street.", "The nearest metro station to the farmers' market is the Koala Street Station."], "答案": 1, "解析": ""}, {"題目": "What kind of people do Yan's and Chang's friends most likely think Yan and Chang are?", "選項": ["They enjoy good food.", "They don't like to share.", "They like to make friends.", "They don't like new things."], "答案": 0, "解析": ""}, {"題目": "What is it in the second story?", "選項": ["A big knife.", "The horse.", "Lunch.", "One of Chang's ducks or chickens."], "答案": 3, "解析": ""}, {"題目": "Why does the writer talk about doctors and a health center in the reading?", "選項": ["To explain Chen's services.", "To talk about Chen's future plans.", "To explain Chen's love for books.", "To show why bookstores are important."], "答案": 3, "解析": ""}, {"題目": "Why is Chen Bing-Hong's job important in the example he gave?", "選項": ["It allows people to get books as gifts.", "It saves people money on new books.", "It gives people hope to follow their dreams.", "It helps people think of special moments in the past."], "答案": 1, "解析": ""}, {"題目": "What is his magic?", "選項": ["Fixing books.", "Making book owners smile.", "Finding books that are long lost.", "Changing his bookstore into a library."], "答案": 1, "解析": ""}, {"題目": "According to the reading, why did Rohla and Kreytenberg open Habibi & Hawara?", "選項": ["To help refugees live better in Austria.", "To collect money to help Syria fight the war.", "To help Austrians learn about the war in Syria.", "To help refugees go back to their home countries."], "答案": 0, "解析": ""}, {"題目": "What can we learn about Habibi & Hawara?", "選項": ["It was moved from Syria to Austria.", "It may finally be sold to its workers.", "It has cooking classes in Syrian food.", "It is an important meeting place for Syrians."], "答案": 2, "解析": ""}, {"題目": "What does it mean when people beg to differ?", "選項": ["They do not agree.", "They look different.", "They cannot speak for others.", "They do not notice something."], "答案": 0, "解析": ""}, {"題目": "What does it mean when someone is an advocate of something?", "選項": ["They talk a lot but do little about it.", "They believe it is good and should be done.", "They have had some bad experiences with it.", "They are one of the first people who have done it."], "答案": 1, "解析": ""}, {"題目": "What is special about the extinct frog in Smith's book?", "選項": ["It can live in a dirty living space.", "It might help fix a health problem.", "It eats its babies when it cannot find food.", "It is the first extinct animal that people studied."], "答案": 1, "解析": ""}, {"題目": "Why does Ellen Zimmer use the words from Dr. Solomon Wang?", "選項": ["To start a new topic.", "To share a big dream.", "To make her idea clearer.", "To invite people to take action."], "答案": 2, "解析": ""}, {"題目": "What does Ellen Zimmer most likely think about bringing back extinct animals?", "選項": ["It is possible.", "It is dangerous.", "It is not possible.", "It is not dangerous."], "答案": 0, "解析": ""}]},'114年會考':{'簡單':[{"題目": "When I was a teenager, I was very________. But now, it's easier for me to talk to people.", "選項": ["happy", "lazy", "popular", "shy"], "答案": 3, "解析": ""}, {"題目": "Lena doesn't want to go________with John because she is afraid of water.", "選項": ["dancing", "hiking", "sailing", "shopping"], "答案": 2, "解析": ""}, {"題目": "Cindy enjoys________ her dad read stories to her before bed.", "選項": ["to listen to", "listening to", "listen to", "listens to"], "答案": 1, "解析": ""}, {"題目": "Dad is busy cooking in the kitchen. Dinner will be________in ten minutes.", "選項": ["free", "full", "medium", "ready"], "答案": 3, "解析": ""}, {"題目": "There are so many new________in the office. It'll take me some time to remember who is who.", "選項": ["faces", "ideas", "rules", "tools"], "答案": 0, "解析": ""}, {"題目": "I feel like a ________. I was looking for my keys for hours but they have been in my pocket the whole time.", "選項": ["fool", "ghost", "king", "stranger"], "答案": 0, "解析": ""}, {"題目": "Mr. and Mrs. Wu have three daughters. Two are in high school, and________is in elementary school.", "選項": ["each", "the other", "the one", "the next"], "答案": 1, "解析": ""}, {"題目": "It is hard for trees to ________along this beach because of the strong winds from the sea.", "選項": ["blow", "build", "follow", "grow"], "答案": 3, "解析": ""}, {"題目": "Christmas ________and I want to visit my aunt abroad. Do you have any plans yet?", "選項": ["came", "comes", "is coming", "was coming"], "答案": 2, "解析": ""}, {"題目": "Jo won't be happy if you're late for his party tonight, so ________sure that you arrive on time.", "選項": ["make", "makes", "to make", "is making"], "答案": 0, "解析": ""}, {"題目": "You may have a long drive because of the terrible ________. There are usually a lot of cars and buses during this time.", "選項": ["experience", "machine", "service", "traffic"], "答案": 3, "解析": ""}, {"題目": "In the future, there will________be greater basketball players than Stephen Curry, but now we believe he is the best!", "選項": ["again", "already", "never", "perhaps"], "答案": 3, "解析": ""}, {"題目": "I guess the rainwater has come in from the kitchen. See? ________ of the windows are closed except the one in the kitchen.", "選項": ["All", "Both", "Most", "Some"], "答案": 2, "解析": ""}, {"題目": "________machines have been used to pick fruits for a long time, they were not used on strawberry farms until several years ago.", "選項": ["Although", "Because", "Before", "If"], "答案": 0, "解析": ""}, {"題目": "There are online videos that teach you exercises you can do at home. They'll________you a trip to the gym, and some money too.", "選項": ["cost", "give", "keep", "save"], "答案": 3, "解析": ""}, {"題目": "Jane's parents are always happy to see their grandchildren, but mine ________less so when I visit them with my kids.", "選項": ["is", "are", "do", "does"], "答案": 1, "解析": ""}, {"題目": "Before she________about it, you should tell Daphne you broke her favorite cup.", "選項": ["asks", "asked", "was asking", "will ask"], "答案": 0, "解析": ""}, {"題目": "It was very windy this morning. Some of the shirts on the balcony were blown away ________in the pond.", "選項": ["fell", "and fell", "fallen", "and fallen"], "答案": 1, "解析": ""}],'困難':[{"題目": "What happened to Rex?", "選項": ["He got lost.", "He got hurt.", "He bit people.", "He ate too much."], "答案": 1, "解析": ""}, {"題目": "How did the writer help Rex?", "選項": ["By calling the police.", "By making him exercise.", "By taking him to see a doctor.", "By looking for a new home for him."], "答案": 1, "解析": ""}, {"題目": "What do we know about Mark from the dialogue?", "選項": ["He made Linda unhappy.", "He is looking for a new job.", "He did not like Linda's cake.", "He is getting married to Jenny."], "答案": 1, "解析": ""}, {"題目": "Which is most likely an example of stealing someone's thunder?", "選項": ["Dennis never changes his mind except when his wife tells him to.", "Melisa tells Tom she'll go to the party but tells her mom she'll stay home.", "Jeff tells everyone he'll move abroad when Ivy is still telling them about her baby.", "Alisa says she doesn't care what we have for lunch but also doesn't like the restaurant we chose. likely 可能"], "答案": 0, "解析": ""}, {"題目": "What can you do with a White Lake City Card?", "選項": ["Save 20% on children's train tickets.", "Visit any public museum in the city for free.", "Take a train to places out of the three zones.", "Move around the city by metro as much as you want."], "答案": 2, "解析": ""}, {"題目": "Stacy is going to White Lake City and is staying at a hotel near the White Lake Main Station. She wants to visit the Museum of White Lake City History on Friday and see White Lake on Saturday. If she plans to buy (a) White Lake City Card(s), which of the four choices will be best for her and cost her the least?", "選項": ["A 3-day Card for Zone 1.", "A Weekend Card for Zones 1-3.", "A 1-day Card for Zone 1 and a Weekend Card for Zones 1-2.", "A 1-day Card for Zones 1-2 and a Weekend Card for Zones 1-2."], "答案": 3, "解析": ""}, {"題目": "What is Rolling Acres?", "選項": ["A zoo.", "A campground.", "A vacation farm.", "A family restaurant."], "答案": 2, "解析": ""}, {"題目": "What do we learn from the first paragraph?", "選項": ["What Libby does at Rolling Acres.", "What visitors think of Rolling Acres.", "Why Libby's grandparents started Rolling Acres.", "What the Larson family's plans are for Rolling Acres."], "答案": 2, "解析": ""}, {"題目": "What does making sacrifices mean?", "選項": ["Learning to make money and use it wisely.", "Getting to know different sides of your family.", "Making excuses for failing to do something difficult.", "Giving up something important to do something else."], "答案": 0, "解析": ""}, {"題目": "What do the comics tell us?", "選項": ["Enjoy life while we can.", "Follow the old ways of life.", "Save our planet before it's too late.", "Treat others the way we want to be treated."], "答案": 3, "解析": ""}, {"題目": "What can we learn about the people in the comics?", "選項": ["They made fire before starting a fight.", "They fought for land and plants all the time.", "They prayed to the statues beside a large fire.", "They used statues to show how strong they were."], "答案": 2, "解析": ""}, {"題目": "What does did it in Picture 7 mean?", "選項": ["Fall to the ground.", "Cut down the last trees.", "Move the statues to fighting grounds.", "Understand how important trees were."], "答案": 3, "解析": ""}, {"題目": "What did Ariely try to find out in the origami study?", "選項": ["If he could stop the IKEA effect.", "Why people love making origami.", "Why IKEA furniture is so famous.", "If anyone shared his IKEA experience."], "答案": 1, "解析": ""}, {"題目": "Which is true about the origami study?", "選項": ["Buyers would spend less on builders' origami than builders would.", "Builders and buyers needed to decide a price on the origami they made.", "Builders knew others would not pay as much for the origami as they would.", "Buyers would spend more on builders' origami after knowing how they were made."], "答案": 3, "解析": ""}, {"題目": "Jerry just can't get his daughter Mia to eat more vegetables at dinner. Every time he tries to do so, there is always a lot of shouting and crying. If Jerry wants to have Mia eat more vegetables by using the IKEA effect, what should he do?", "選項": ["Tell Mia that he cooks the vegetables just for her.", "Ask Mia to help him cook vegetables for her meal.", "Give Mia her favorite candy after she eats vegetables.", "Ask Mia what vegetables she likes and cook them for her."], "答案": 0, "解析": ""}, {"題目": "What is the reading mainly about?", "選項": ["The tips on using a picture to tell a story.", "The change that electricity brought to people's lives.", "The history behind the picture of a UK electricity worker.", "The story of a famous UK electricity worker from the 1970s."], "答案": 1, "解析": ""}, {"題目": "In the UK in the 1970s, what did people most likely think of the UK electricity workers?", "選項": ["They were not brave enough to fix their problems.", "They worked like robots and never learned to change.", "They were asking too much and did not know when to stop.", "They did not care whether their job might hurt people's health."], "答案": 2, "解析": ""}, {"題目": "Why does the writer put the \" \" mark around the word dark in the last sentence?", "選項": ["To say that the \"dark\" time was actually not dark.", "To tell people that the word was said by the government.", "To mean both the days without lights and the difficult lives people lived.", "To show that the government and the electricity workers both lost their fights."], "答案": 2, "解析": ""}]}}
};

function bankQ(subj,unit,diff){

const tier=diff>=50?'困難':'簡單';

const _mu=(typeof me==='function'&&me())?me():null;const g=_mu&&_mu.g?_mu.g:null;

if(subj==='數學'&&Math.random()<.5)return procMathQ(tier); /* 數學半數改用隨機出題器，避免題庫太小一直重複 */

try{const qs=BANK[subj][unit][tier];if(qs&&qs.length){

const unseen=g?qs.filter(q=>!qSeenHas(g,q)):qs; /* 優先出沒出過的題 */

if(!unseen.length){if(subj==='數學')return procMathQ(tier); /* 數學全出過→改隨機出題器，不重複 */

if(g){g.qSeen=(g.qSeen||[]).filter(h=>!qs.some(q=>qHash(q['題目'])===h));saveU(_mu)}} /* 其餘科目全部出過則重置本單元輪迴 */

return shuffleQ(JSON.parse(JSON.stringify(pick(unseen.length?unseen:qs))))}}catch(e){}

return fallbackQ(subj,unit,tier);

}

/* 數學隨機出題器：每次隨機數字，題目永不重複 */



/* 打亂題目陣列順序（Fisher-Yates），不回傳新陣列 */

/* 題目去重：每位學生記錄出過的題目雜湊，確保每次題目都不一樣 */





/* ════════ 遊戲資料結構 ════════ */




function isoToday(){return new Date().toISOString().slice(0,10)}
function isoYesterday(d){const dt=new Date(d+"T12:00:00");dt.setDate(dt.getDate()-1);return dt.toISOString().slice(0,10)}

function friendCount(g){return get(LS.fr,[]).filter(f=>f.status==='accepted'&&(f.a===me().id||f.b===me().id)).length}


/* 收藏等級（無上限）：每級技能效果 +2%；舊存檔無 collLv 時預設 Lv.1 */



function effOf(g){

const e={};const add=(o,m)=>{for(const k in o){const v=o[k];if(typeof v==='boolean')e[k]=true;else if(k==='pity_reduce'||k==='quality_up')e[k]=Math.max(e[k]||0,v);/* 保底減抽與品質提升為固定效果，不隨星級倍率縮放 */else e[k]=(e[k]||0)+v*m}};

for(const cat of ['character','pet','anime','teammate']){const n=g.equip[cat];if(!n)continue;const it=findIt(cat,n);if(!it)continue;

const merged={};it.sk.forEach(s=>{for(const k in s[2]){const v=s[2][k];if(typeof v==='boolean')merged[k]=true;else merged[k]=(merged[k]||0)+v}});

add(merged,(CFG.STAR_BONUS[g.stars[n]||1]||1)*(g.awaken.includes(n)?1.5:1)*(1+(collLvOf(g,n)-1)*.02));}

const tt=TITLES.find(t=>t.id===g.equippedTitle);if(tt)add(tt.bonus,1);

const gd=guildOf(g);if(gd)add({all_exp_bonus:Math.min(10,gd.level||1)*.01},1); /* 公會加成：每級全經驗+1%（最高 10 級） */

return e;

}

const isEarly=()=>{const h=new Date().getHours();return h>=6&&h<8};

function rewardOn(g){if(!sysCfg().timeLock)return true;const h=new Date().getHours(),wd=new Date().getDay()<5;return wd?(h>=6&&h<22):(h>=6&&h<23)} /* 時間鎖由管理員全域設定 */

const timeStatus=g=>!sysCfg().timeLock?'🔓 獎勵解鎖':rewardOn(g)?(isEarly()?'🌅 早鳥加成中':'🟢 獎勵開放中'):'🔴 獎勵關閉';



function power(g){

let p=g.lv*10;

g.weapons.forEach(w=>{p+=(CFG.QBASE[w.q]||5)+(w.lv||0)*8});

const e=effOf(g);let s=0;for(const k in e){const v=e[k];if(typeof v==='number'&&v>0)s+=v}p+=Math.floor(s*50);

for(const n in g.stars)p+=g.stars[n]*15;

for(const n in (g.collLv||{}))p+=((g.collLv[n]||1)-1)*5; /* 收藏等級加成戰力 */

if(g.potion.at&&(Date.now()-new Date(g.potion.at))/60000<10)p+=g.potion.bonus;

return p;

}

/* #9 物品價值估算（交易 40% 下限的基準）*/


/* ════════ 語言包（v4.0）：211 種語言 × 8 大區（含客家五腔・閩南四腔・北越語），代碼唯一，可直接搜尋 ════════ */
const LANG_DATA={
'非洲':[['af','阿非利卡語'], ['am','阿姆哈拉語'], ['ha','豪薩語'], ['ig','伊博語'], ['zu','祖魯語'], ['xh','科薩語'], ['rw','盧安達語'], ['sw','史瓦希里語'], ['lin','林格拉語'], ['lug','盧幹達語'], ['mg','馬拉加斯語'], ['nya','齊切瓦語'], ['nde','恩德貝萊語'], ['nso','北索托語'], ['sn','修納語'], ['so','索馬利語'], ['st','索托語'], ['tn','塞茨瓦納語'], ['son','桑海語'], ['ti','提格利尼亞語'], ['tso','聰加語'], ['aeb','突尼西亞語'], ['ve','溫達語'], ['wo','沃洛夫語'], ['yo','約魯巴語'], ['ber','柏柏爾語'], ['ff','富拉語'], ['din','丁卡語'], ['kro','克魯語'], ['ss','斯瓦蒂語'], ['ki','吉庫尤語'], ['luo','盧歐語'], ['aka','加納語'], ['ee','埃維語'], ['bm','班巴拉語'], ['man','曼丁哥語'], ['sg','桑戈語'], ['kau','卡努里語']],
'亞洲(西亞/南亞/中亞)':[['bn','孟加拉語'], ['hi','印地語'], ['ur','烏爾都語'], ['fa','波斯語'], ['prs','達里語'], ['ps','普什圖語'], ['si','僧伽羅語'], ['ta','坦米爾語'], ['te','泰盧固語'], ['mr','馬拉地語'], ['gu','古吉拉特語'], ['kn','卡納達語'], ['ml','馬拉雅拉姆語'], ['or','奧里亞語'], ['pa','旁遮普語'], ['ne','尼泊爾語'], ['dv','迪維希語'], ['sd','信德語'], ['as','阿薩姆語'], ['sa','梵語'], ['ku','庫德語'], ['bal','俾路支語'], ['tg','塔吉克語'], ['tk','土庫曼語'], ['kk','哈薩克語'], ['ky','吉爾吉斯語'], ['uz','烏茲別克語'], ['ug','維吾爾語'], ['tt','韃靼語'], ['bak','巴什基爾語'], ['che','車臣語'], ['sah','雅庫特語'], ['mn','蒙古語'], ['hy','亞美尼亞語'], ['ka','喬治亞語'], ['abk','阿布哈茲語']],
'東亞':[['zh-CN','中文簡體'], ['zh-TW','中文繁體'], ['yue','粵語'], ['ja','日語'], ['ko','韓語'], ['nan','閩南語（臺灣）'], ['nan-FJ','閩南語（福建）'], ['nan-CS','潮州話'], ['nan-HN','海南話'], ['hak','客家話（四縣腔）'], ['hak-HL','客家話（海陸腔）'], ['hak-DP','客家話（大埔腔）'], ['hak-RP','客家話（饒平腔）'], ['hak-ZA','客家話（詔安腔）'], ['bo','藏語'], ['mnc','滿語'], ['ryu','琉球語']],
'東南亞':[['vi','越南語（南方）'], ['vi-N','北越語（北方口音）'], ['th','泰語'], ['lo','寮語'], ['my','緬甸語'], ['km','高棉語'], ['id','印尼語'], ['ms','馬來語'], ['fil','菲律賓語'], ['jv','爪哇語'], ['su','巽他語'], ['ban','巴厘語'], ['min','米南佳保語'], ['ace','亞齊語'], ['bug','布吉語'], ['day','達雅語'], ['iba','伊班語'], ['dtp','卡達山語'], ['duz','杜順語'], ['mdh','馬京達瑙語'], ['cbk','查瓦卡諾語'], ['bik','比科爾語'], ['pam','邦板牙語'], ['ilo','伊洛卡諾語'], ['pag','班詩蘭語'], ['ceb','宿霧語'], ['hil','希利蓋農語'], ['war','瓦瑞瓦瑞語'], ['sur','蘇里高語'], ['mrw','馬拉瑙語'], ['bku','巴瑤語']],
'歐洲':[['en','英語'], ['fr','法語'], ['de','德語'], ['es','西班牙語'], ['pt','葡萄牙語'], ['it','義大利語'], ['nl','荷蘭語'], ['pl','波蘭語'], ['ru','俄語'], ['uk','烏克蘭語'], ['be','白俄羅斯語'], ['bg','保加利亞語'], ['cs','捷克語'], ['sk','斯洛伐克語'], ['hu','匈牙利語'], ['ro','羅馬尼亞語'], ['el','希臘語'], ['sq','阿爾巴尼亞語'], ['sr','塞爾維亞語'], ['hr','克羅埃西亞語'], ['bs','波士尼亞語'], ['cnr','蒙特內哥羅語'], ['sl','斯洛維尼亞語'], ['sv','瑞典語'], ['da','丹麥語'], ['no','挪威語'], ['fi','芬蘭語'], ['et','愛沙尼亞語'], ['lv','拉脫維亞語'], ['lt','立陶宛語'], ['is','冰島語'], ['fo','法羅語'], ['mt','馬爾他語'], ['ga','愛爾蘭語'], ['gd','蘇格蘭蓋爾語'], ['cy','威爾斯語'], ['eu','巴斯克語'], ['ca','加泰隆尼亞語'], ['gl','加利西亞語'], ['oc','奧克語'], ['br','布列塔尼語'], ['co','科西嘉語'], ['sc','薩丁尼亞語'], ['fur','弗留利語'], ['rm','羅曼什語'], ['la','拉丁語'], ['cu','教會斯拉夫語']],
'美洲':[['nv','納瓦荷語'], ['iu','因紐特語'], ['cr','克里語'], ['oj','奧吉布瓦語'], ['dak','達科他語'], ['chr','切羅基語'], ['bla','黑腳語'], ['nah','納瓦特爾語'], ['quc','基切語'], ['yua','瑪雅語'], ['qu','克丘亞語'], ['ay','艾馬拉語'], ['gn','瓜拉尼語'], ['arn','馬普切語'], ['srn','蘇里南語'], ['ht','海地克里奧爾語'], ['jam','牙買加克里奧爾語'], ['pt-BR','巴西葡萄牙語']],
'大洋洲':[['mi','毛利語'], ['fj','斐濟語'], ['sm','薩摩亞語'], ['to','東加語'], ['ty','大溪地語'], ['haw','夏威夷語'], ['tkl','托克勞語'], ['na','諾魯語'], ['pau','帛琉語'], ['ch','查莫羅語'], ['mh','馬紹爾語'], ['pi','皮欽語'], ['ho','希里莫圖語'], ['bi','比斯拉馬語'], ['gil','吉里巴斯語'], ['tvl','吐瓦魯語']],
'人工/特殊':[['eo','世界語'], ['tlh','克林貢語'], ['sjn','精靈語'], ['navi','納美語'], ['tok','道本語'], ['jbo','邏輯語'], ['ia','國際語'], ['ie','西方語']],
};
const LANG_REGIONS=Object.keys(LANG_DATA);
const LANG_TOTAL=LANG_REGIONS.reduce((n,r)=>n+LANG_DATA[r].length,0); /* v4.0：語言總數動態計算 */

/* ══════ AI 翻譯系統已獨立至 js/i18n.js ══════ */
function t(zhStr){return typeof ti==='function'?ti(zhStr):zhStr}
/* ════════ 帳號 / session ════════ */

function seed(){

const now=Date.now();

const mk=(role,name,u,p,cls,mgd,adm)=>({id:u,role,name,username:u,password:p,classId:cls,managedClassIds:mgd||[],isSchoolAdmin:!!adm,createdAt:now,g:role==='student'?newGame():null});

set(LS.users,[

{id:MASTER_ADMIN.user,username:MASTER_ADMIN.user,name:MASTER_ADMIN.name,role:'admin',password:'',pwHash:MASTER_ADMIN.hash,master:true,isSchoolAdmin:true,createdAt:now,g:null}

]); /* 發布版：固定管理員（密碼雜湊儲存、不存明文）；教師由管理員建立、學生由教師註冊/匯入 */

set(LS.ann,[{id:4,title:'⚔️ v8.0.0 會考題庫 543 題上線！',content:'導入 110~114 年會考真實考題（數學、英文、自然、社會共 20 份），BANK 題庫從 11 題擴充至 543 題，涵蓋簡單/困難雙難度。',time:now},{id:3,title:'🌍 v4.0 語言包・數獨・像素畫板上線！',content:'「語言自學」改名「語言包」：211 種語言含客家話五腔、閩南語四腔、北越語；AI 出題失敗自動重試＋本地題庫備援。新增像素畫板（16~256 可存可分享）、數獨 9×9 排位（同場競速＋個人最佳）、班級戰（全班答題數＋在線時間）、介面顏色主題、管理員 YT 音樂連結。',time:now},{id:2,title:'📚 v4.0 社會科＝歷史＋地理＋公民',content:'「社會」科目單元已標示子科目（歷史／地理／公民），學習目標更清楚！',time:now},{id:1,title:'📢 歡迎來到全領域冒險者養成系統 v8.0！',content:'全領域大更新：SM-2 閃卡、C++ 黑盒計算、AI 導師、心智圖、教材漫畫、AI 播客、會考題庫⋯⋯開始冒險吧！',author:'系統',time:now}]);

set(LS.codes,[{code:'ADVENTURE',note:'新生禮包',rewards:{gold:50,crystal:30,extraPk:1},maxUses:50,usedBy:[],time:now}]);

set(LS.chat,[{user:'系統',role:'system',text:'⚔️ v8.0.0 會考題庫上線！543 題真實會考考題（110~114年・數學/英文/自然/社會）、SM-2 閃卡、AI 導師、心智圖、教材漫圖！',time:now}]);

set(LS.fr,[]);set(LS.gr,[]);set(LS.hw,[]);set(LS.sub,[]);set(LS.pm,{});set(LS.trades,[]);set(LS.market,[]);set(LS.duels,[]);
if(!get(LS.classes,null)){set(LS.classes,{ids:['701','702','703'],names:{'701':'七年一班','702':'七年二班','703':'七年三班'}});}

const _existingKeys=get(LS.apiKeys,null);if(!_existingKeys||!_existingKeys.keys||_existingKeys.keys.length===0){const _defaultKeys=[];/* 已移除硬編碼金鑰：請由管理員於「🔑 API 金鑰管理」自行新增 */const _nowIso=new Date().toISOString();set(LS.apiKeys,{keys:_defaultKeys.map(k=>({...k,addedAt:_nowIso,useCount:0,lastUsed:null})),currentIndex:0,lastUsedTime:null})}

}

if(!get(LS.users))seed();

const me=()=>{const s=get(LS.ses);if(!s)return null;if(s.local)return get(LS.local,[]).find(x=>x.username===s.u)||null;return get(LS.users,[]).find(x=>x.username===s.u)};

function saveU(u){if(u.localOnly){const arr=get(LS.local,[]);const i=arr.findIndex(x=>x.id===u.id);if(i>-1)arr[i]=u;else arr.push(u);set(LS.local,arr);return} /* 📴 本機帳號只存本地不上雲 */ const us=get(LS.users,[]);const i=us.findIndex(x=>x.id===u.id);if(i>-1){us[i]=u;set(LS.users,us)}}

/* 補齊學生遊戲資料：以 newGame() 為範本深層合併，保留玩家既有數值、補上所有缺失欄位（避免舊存檔缺欄位導致 renderStudent 拋錯、UI 空白） */

function enter(){

expireVideos(); /* 影片訊息 3 天自動過期清除，釋放儲存空間 */

autoPromote(); /* 跨學年度自動升級檢查 */

const u=me();

if(!u){$('#app').style.display='none';$('#login').style.display='grid';return}

$('#login').style.display='none';const _app=$('#app');_app.style.display='block';_app.classList.remove('appIn');void _app.offsetWidth;_app.classList.add('appIn'); /* 進入主畫面動畫 */

startHeartbeat(); /* 👁 重新整理/恢復登入時也要啟動（否則心跳與即時輪詢不會跑） */
startFastSync(); /* 📨 開始即時訊息輪詢 */

if(u.role==='admin')renderAdmin(u);else if(u.role==='teacher')renderTeacher(u);else if(u.role==='parent')renderParent(u);else renderStudent(u);

/* 🔄 版本更新重新整理後：自動還原上次看的私聊與滾動位置（滑到哪就回到哪） */
try{if(localStorage.getItem('ADV9_UPDATE_RESTORE')){
  localStorage.removeItem('ADV9_UPDATE_RESTORE');
  const l=JSON.parse(localStorage.getItem('ADV9_LASTPM')||'{}')||{};
  if(l.fid&&l.fid!==u.id)setTimeout(()=>{try{openPm(l.fid);setTimeout(()=>{const pb=$('#pmBox');if(pb&&typeof l.top==='number'&&l.top>0)pb.scrollTop=l.top},450)}catch(e){}},700);
}}catch(e){}

if(u.role==='student'){try{deliverRankMail();checkArenaDailyMail();const n=unreadNotifs();if(n)setTimeout(()=>toast('🔔 你有 '+n+' 則新通知（到限時動態頁面查看）'),900);const um=unreadMail(u.g);if(um)setTimeout(()=>toast('📩 信箱有 '+um+' 封未領獎勵（社群中心→信箱）'),1600)}catch(e){}} /* 登入：發放排行榜信件、提醒通知與信箱 */

if(u.role==='student'&&isGrade9(u)){try{refreshExamDateAI(false).then(()=>{if(me()&&me().id===u.id&&$('#view'))vHome&&vHome()})}catch(e){}} /* 9 年級登入自動讓 AI 查一次會考日期（後台靜默） */

if(u.role==='student'&&u.graduated&&!u.gradSeen){ /* 畢業後首次登入→自動彈畢業典禮 */

const us=get(LS.users,[]);const x=us.find(v=>v.id===u.id);if(x){x.gradSeen=true;set(LS.users,us)}

setTimeout(()=>{try{gradCeremony()}catch(e){}},1200);

}

}

async function loadVpsPrivateData(){if(!WTOKEN)return;try{const r=await fetch(SUPA_URL+'/rest/v1/adv9_kv?select=k,v',{headers:{'x-adv9-token':WTOKEN}});if(!r.ok)return;const rows=await r.json();(Array.isArray(rows)?rows:[]).forEach(x=>{if(x&&x.k&&x.k!=='ADV9_USERS')localStorage.setItem(x.k,JSON.stringify(x.v))});}catch(e){}}

function logout(){localStorage.removeItem(LS.ses);WTOKEN='';stopHeartbeat();stopFastSync();_onlineSet=new Set();try{localStorage.removeItem('ADV9_WTOKEN')}catch(e){}enter()}

/* 影片訊息 3 天過期：移除影片資料、保留一條「已過期」標記（適用於私聊、群組、公會）*/

const VIDEO_TTL=3*86400000; /* 影片保存期限：3 天 */

function expireVideos(){

const now=Date.now();let changed=false;

const mark=m=>{if(m&&m.vid&&(now-m.t)>VIDEO_TTL){cloudDelete(m.vid);delete m.vid;m.expired=true;changed=true}}; /* 雲端檔一併刪除，釋放 1GB 儲存額度 */

try{const pm=get(LS.pm,{});for(const k in pm)(pm[k]||[]).forEach(mark);if(changed)set(LS.pm,pm)}catch(e){}

try{let g2=false;const gr=get(LS.gr,[]);gr.forEach(x=>(x.msgs||[]).forEach(m=>{const b=changed;mark(m);if(changed!==b)g2=true}));if(g2)set(LS.gr,gr)}catch(e){}

try{let g3=false;const gd=get(LS.guilds,[]);gd.forEach(x=>(x.msgs||[]).forEach(m=>{const b=changed;mark(m);if(changed!==b)g3=true}));if(g3)set(LS.guilds,gd)}catch(e){}

}

/* ════════ 年度自動升級（701→801→901→🎓畢業標記）════════ */




function runPromotion(times){

times=times||1;

const us=get(LS.users,[]);let promoted=0,grads=0;

for(let t=0;t<times;t++){

/* 學生班級 +1；九年級升級則畢業標記（轉入校友/畢業存檔，保留帳號與進度）*/

us.forEach(x=>{

if(x.role!=='student'||x.graduated||!x.classId)return;

const nid=promoteClassId(x.classId);

if(nid==='GRAD'){x.graduated=true;x.gradYear=acadYear();grads++}

else if(nid){x.prevClassId=x.classId;x.classId=nid;promoted++}

});

/* 班級清單與名稱同步升級 */

const cls=get(LS.classes,{ids:[],names:{}});const nids=[];const nnames={};

cls.ids.forEach(id=>{const nid=promoteClassId(id);

if(nid&&nid!=='GRAD'){if(!nids.includes(nid)){nids.push(nid);nnames[nid]=promoteNameOnce(cls.names[id]||nid)}}

else if(!nid){if(!nids.includes(id)){nids.push(id);nnames[id]=cls.names[id]||id}}

});

/* 自動補齊新七年級班級（供新生匯入）*/

cls.ids.forEach(id=>{const m=String(id).match(/^7(\d+)(.*)$/);if(m){const sid='7'+m[1]+m[2];if(!nids.includes(sid)){nids.push(sid);nnames[sid]=cls.names[id]||sid}}});

cls.ids=nids.sort();cls.names=nnames;set(LS.classes,cls);

/* 教師管理班級同步升級 */

us.forEach(x=>{if(x.managedClassIds&&x.managedClassIds.length){x.managedClassIds=x.managedClassIds.map(id=>{const nid=promoteClassId(id);return (nid&&nid!=='GRAD')?nid:id}).filter((v,i,a)=>a.indexOf(v)===i)}});

}

set(LS.users,us);

return{promoted,grads};

}

function autoPromote(){

const cur=acadYear();const last=get(LS.acad,null);

if(last===null){set(LS.acad,cur);return}

if(cur<=last)return;

const r=runPromotion(cur-last);

set(LS.acad,cur);

setTimeout(()=>toast('📅 學年度結算：班級自動升級 '+r.promoted+' 人，🎓 畢業標記 '+r.grads+' 人'),600);

}

/* ════════ 🎓 畢業系統：會考倒數、畢業存檔、AI 祝福、校友繼續玩（傳承轉生）════════ */


function examDate(){ /* 預設算法：國中教育會考≈當學年度隔年 5 月第三個週六（AI 查到確切日期時優先用 AI）*/

const cache=get('ADV9_EXAMDATE',null);const wantY=acadYear()+1;

if(cache&&cache.year===wantY&&cache.date){const d=new Date(cache.date);if(!isNaN(d))return d}

const y=wantY;const d=new Date(y,4,1);const firstSat=1+((6-d.getDay())+7)%7;

return new Date(y,4,firstSat+14);

}

function examCountdown(){const n=Math.ceil((examDate()-Date.now())/86400000);return n}

function examSrc(){const c=get('ADV9_EXAMDATE',null);return (c&&c.year===acadYear()+1&&c.src==='ai')?'ai':'est'}

/* 🤖 讓 AI 幫忙查今年會考日期（每年只查一次，結果快取；查不到就用預設算法）*/

async function refreshExamDateAI(force){

const wantY=acadYear()+1;const cache=get('ADV9_EXAMDATE',null);

if(!force&&cache&&cache.year===wantY&&cache.src==='ai')return cache; /* 今年已查過 */

try{

const prompt='請告訴我台灣 '+wantY+' 年「國中教育會考」的正式考試日期（通常在 5 月，為連續兩天的週六日）。只回傳第一天的日期，格式嚴格為 YYYY-MM-DD，不要任何其他文字。';

const res=await callGemini(prompt,'你是台灣教育資訊助手，只回傳 YYYY-MM-DD 日期。');

const m=String(res||'').match(/(\d{4})-(\d{2})-(\d{2})/);

if(m){const iso=m[1]+'-'+m[2]+'-'+m[3];const d=new Date(iso);

if(!isNaN(d)&&+m[1]===wantY){const rec={year:wantY,date:iso,src:'ai'};set('ADV9_EXAMDATE',rec);return rec}}

}catch(e){}

const rec={year:wantY,date:examDate().toISOString().slice(0,10),src:'est'};set('ADV9_EXAMDATE',rec);return rec; /* 退回預設算法 */

}

function examRefresh(){toast('🤖 AI 查詢會考日期中…');refreshExamDateAI(true).then(rec=>{toast(rec.src==='ai'?'✅ AI 已更新會考日期：'+rec.date:'⚠️ 暫時查不到，已使用預估日期',rec.src==='ai'?'':'bad');if(typeof vHome==='function'&&me()&&me().role==='student')vHome()})}

/* 💾 畢業存檔：把完整進度下載成 JSON 紀念檔（也可當備份） */

function gradExport(){

const u=me();

const data={'版本':'ADV9畢業存檔','姓名':u.name,'帳號':u.username,'畢業年度':u.gradYear||acadYear(),'匯出時間':new Date().toISOString(),'紀念話':u.gradMsg||'',game:u.g};

const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});

const a=document.createElement('a');a.href=URL.createObjectURL(blob);

a.download='畢業存檔_'+u.name+'_'+(u.gradYear||acadYear())+'.json';a.click();

setTimeout(()=>URL.revokeObjectURL(a.href),3000);

toast('💾 畢業存檔已下載（請好好保存這份回憶）');

}

/* 🤖 AI 畢業祝福：優先用 Gemini 量身生成，失敗退回內建語錄 */

const GRAD_QUOTES=['三年磨一劍，今日露鋒芒——帶著這份堅持，去看更大的世界吧！','畢業不是終點，而是你用努力換來的新地圖。','你在這裡留下的每一道答題痕跡，都會變成未來的底氣。','鐘聲響起，少年啟程；願你帶著勇氣，一路發光。','曾經的難題都成了勳章，未來的未知都是寶藏。'];

async function gradAiMsg(u){

if(u.gradMsg)return u.gradMsg;

let msg=null;

try{const g=u.g;

const prompt='你是台灣國中的導師。學生「'+u.name+'」今天畢業了，他在學習冒險遊戲中達成：等級 Lv.'+g.lv+'、累計答對 '+(g.stat&&g.stat.ok||0)+' 題、最高連擊 '+(g.stat&&g.stat.maxCombo||g.combo||0)+'、收藏 '+((g.owned&&Object.values(g.owned).reduce((a,b)=>a+b.length,0))||0)+' 位夥伴。請用繁體中文寫一句 40 字以內的畢業祝福，溫暖有力、結合他的成就，直接輸出祝福語本身，不要引號或其他文字。';

msg=(await callGemini(prompt,'你是溫暖的導師，只輸出一句祝福語。')||'').trim().replace(/^["「」']+|["「」']+$/g,'').slice(0,80)}catch(e){}

if(!msg)msg=pick(GRAD_QUOTES); /* AI 失敗退回內建語錄 */

const us=get(LS.users,[]);const x=us.find(v=>v.id===u.id);if(x){x.gradMsg=msg;set(LS.users,us)}u.gradMsg=msg;

return msg;

}

/* 🎓 畢業典禮：統計回顧＋AI 祝福＋存檔＋繼續遊玩說明 */

function gradCeremony(){

const u=me(),g=u.g;

const coll=(g.owned&&Object.values(g.owned).reduce((a,b)=>a+b.length,0))||0;

openModal('<h3 class="mt" style="text-align:center;font-size:24px">🎓 恭喜畢業！</h3>'+

'<p style="text-align:center;color:var(--gold2);font-family:var(--serif);font-weight:900">'+esc(u.name)+'　'+(u.gradYear||acadYear())+' 學年度畢業生</p>'+

'<div class="statGrid" style="margin:12px 0">'+

'<div class="panel2 statIt"><span>等級</span><b>Lv.'+g.lv+'</b></div>'+

'<div class="panel2 statIt"><span>累計答對</span><b>'+((g.stat&&g.stat.ok)||0)+'</b></div>'+

'<div class="panel2 statIt"><span>最高連擊</span><b>'+((g.stat&&g.stat.maxCombo)||g.combo||0)+'</b></div>'+

'<div class="panel2 statIt"><span>收藏夥伴</span><b>'+coll+'</b></div>'+

'<div class="panel2 statIt"><span>戰力</span><b>'+power(g)+'</b></div>'+

'<div class="panel2 statIt"><span>轉生次數</span><b>'+(g.rebirth||0)+'</b></div></div>'+

'<div id="gradMsgBox" class="panel2" style="margin-bottom:12px;border-left:4px solid var(--gold);font-size:14.5px;line-height:1.8;font-family:var(--serif)">✨ 導師正在為你寫下祝福…</div>'+

'<div class="panel2" style="margin-bottom:12px;font-size:12.5px;color:var(--mut);line-height:1.8"><b style="color:var(--teal)">🎓 畢業後怎麼繼續玩？</b><br>① 校友模式：帳號永久保留，所有功能照常玩，頂著 🎓 校友徽章繼續衝排行榜<br>② 傳承轉生：重置等級重新冒險，保留全部收藏，每次轉生永久 全經驗+10%・掉落+5%<br>③ 本機珍藏：下載存檔後選擇退出伺服器，資料只存手機不佔用後端</div>'+

'<div class="mBtns" style="justify-content:center;flex-wrap:wrap"><button class="btn teal" onclick="gradExport()">💾 下載畢業存檔</button>'+

'<button class="btn ghost" onclick="rebirth()">🔁 傳承轉生</button>'+

'<button class="btn" onclick="closeModal()">🎓 校友模式（繼續玩）</button>'+

'<button class="btn danger" onclick="gradLeaveServer()">📴 只存手機（退出伺服）</button></div>');

gradAiMsg(u).then(msg=>{const b=$('#gradMsgBox');if(b)b.innerHTML='💬 '+esc(msg)});

}

/* 🔁 傳承轉生（New Game+）：重置等級與貨幣，保留收藏/成就/好友，每次轉生永久加成 */

function rebirth(){

const u=me(),g=u.g;

if(!u.graduated)return toast('🔁 傳承轉生限畢業校友使用','bad');

if(!confirm('🔁 傳承轉生：等級、經驗、金幣、水晶將重置，但保留全部收藏、成就、好友，並永久獲得全經驗+10%、掉落+5%（可累加）。確定？'))return;

g.rebirth=(g.rebirth||0)+1;

g.lv=1;g.xp=0;g.needXp=CFG.needXp(1);g.gold=0;g.crystal=0;g.combo=0;

saveU(u);closeModal();hud();toast('🔁 第 '+g.rebirth+' 次轉生完成！永久加成：全經驗+'+(g.rebirth*10)+'%・掉落+'+(g.rebirth*5)+'%');vHome();

}

/* 📴 只存手機（退出伺服）：下載存檔 → 從雲端移除帳號（不佔用後端）→ 轉為本機帳號繼續在本裝置遊玩 */

function gradLeaveServer(){

const u=me();if(!u)return;

if(!confirm('📴 退出伺服器：將先下載你的存檔，然後從雲端移除你的帳號（不再佔用後端）。資料會保存在這台裝置，你也可用下載的存檔在別台裝置匯入。確定？'))return;

gradExport(); /* 先下載備份 */

u.localOnly=true;

const arr=get(LS.local,[]);if(!arr.find(x=>x.id===u.id))arr.push(u);set(LS.local,arr); /* 存入本機（不上雲）*/

const us=get(LS.users,[]).filter(x=>x.id!==u.id);set(LS.users,us); /* 從雲端共享名單移除，釋放後端 */

set(LS.ses,{u:u.username,local:true});

closeModal();toast('📴 已轉為本機帳號，資料不再佔用後端。請保管下載的存檔！');enter();

}

/* 📥 匯入畢業存檔（別台裝置恢復本機帳號）*/

function importSaveFile(inp){

const f=inp.files[0];if(!f)return;

const r=new FileReader();

r.onload=e=>{try{const d=JSON.parse(e.target.result);

if(!d||!d.game||!d['帳號'])return toast('⚠️ 存檔格式不正確','bad');

const arr=get(LS.local,[]);

const acc={id:'local_'+d['帳號'],username:d['帳號'],name:d['姓名']||d['帳號'],role:'student',password:'',classId:'GRAD',graduated:true,gradYear:d['畢業年度'],gradMsg:d['紀念話']||'',gradSeen:true,localOnly:true,g:fillGame(d.game)};

const i=arr.findIndex(x=>x.id===acc.id);if(i>-1)arr[i]=acc;else arr.push(acc);set(LS.local,arr);

set(LS.ses,{u:acc.username,local:true});toast('📥 存檔已匯入，歡迎回來！');enter();

}catch(err){toast('⚠️ 匯入失敗：檔案損壞','bad')}};

r.readAsText(f);

}

/* 登入入口：不選身分，完全依帳號密碼自動辨識；?portal=admin 為管理員專用入口、?portal=staff 為師生入口 */

const PORTAL=(new URLSearchParams(location.search).get('portal')||'').toLowerCase();

/* 從登入器（?portal=xxx）首次進入本分頁時清除舊登入，強制顯示登入畫面；登入後由 doLogin 重新建立 session，重新整理也不再被登出 */
if(PORTAL && !sessionStorage.getItem('ADV9_PORTAL_ENTERED')){sessionStorage.setItem('ADV9_PORTAL_ENTERED','1');set(LS.ses,null);}

(function(){const s=$('#lgPortalSub'),n=$('#lgNote');

if(PORTAL==='admin'){if(s)s.textContent='👑 管理員專用入口｜輸入管理員帳號密碼';if(n)n.textContent='🔒 此入口僅供管理員登入'}

else if(PORTAL==='teacher'){if(s)s.textContent='👩‍🏫 老師專用入口｜輸入老師帳號密碼';if(n)n.textContent='🔒 此入口僅供老師登入，老師帳號請由管理員建立'}

else if(PORTAL==='student'){if(s)s.textContent='👤 學生專用入口｜輸入學生帳號密碼';if(n)n.textContent='🔒 此入口僅供學生登入，學生帳號請由老師建立'}

else if(PORTAL==='staff'){if(s)s.textContent='👩‍🏫👤 老師／學生入口｜輸入帳號密碼即可';if(n)n.textContent='沒有帳號？學生請由老師建立，老師請由管理員建立'}

else{if(n)n.textContent='系統會依帳號自動判定您是學生、老師還是管理員'}})();

async function doLogin() {
  const un = $('#lgUser').value.trim();
  const pw = $('#lgPass').value;
  if(!validUsername(un)){fail('⚠️ 帳號格式不正確（僅限英數底線點，2～40 字）');return} /* 🛡️ 防注入：帳號格式驗證 */
  if(!pw||pw.length>100){fail('⚠️ 請輸入密碼');return}
  const _loc=get(LS.local,[]).find(x=>x.username===un); /* 📴 本機畢業帳號：直接本地登入，不靠雲端 */
  if(_loc){set(LS.ses,{u:un,local:true});enter();return}
  if(isMasterLogin(un,pw)&&(SUPA_ON===false||location.hostname.indexOf('github.io')>=0)){ /* 👑 本機主管登入（GitHub Pages 單管理員 / 離線模式）：先驗證，成功即本機登入，不靠雲端 */
    const us=get(LS.users,[]);let a=us.find(x=>x.username===MASTER_ADMIN.user);
    if(!a){a={id:MASTER_ADMIN.user,username:MASTER_ADMIN.user,name:MASTER_ADMIN.name,role:'admin',password:'',pwHash:MASTER_ADMIN.hash,master:true,isSchoolAdmin:true,createdAt:new Date().toISOString(),g:null};us.push(a)}
    else{a.role='admin';a.master=true;a.password='';a.pwHash=MASTER_ADMIN.hash;a.isSchoolAdmin=true}
    set(LS.users,us);set(LS.ses,{u:MASTER_ADMIN.user});enter();return;
  }

  try {
    // 先嘗試本地伺服器 API（更可靠）
    let acc = null;
    let supaFailed = false;

    // 方法 1：呼叫本地伺服器 API
    try {
      const srvRes = await fetch(SUPA_URL + '/rest/v1/rpc/login_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_username: un, p_password: pw })
      });
      console.log('[LOGIN] Server response:', srvRes.status, srvRes.statusText);
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        console.log('[LOGIN] Server data:', srvData);
        if (srvData && srvData.token) {
          acc = srvData;
        }
      } else {
        const errText = await srvRes.text();
        console.error('[LOGIN] Server error:', errText);
      }
    } catch(e) {
      console.error('[LOGIN] Fetch failed:', e.message);
      supaFailed = true;
    }

    // 方法 2：如果本地 API 失敗，嘗試 Supabase
    if (!acc) {
      try {
        const response = await fetch(
          SUPA_URL + '/rest/v1/rpc/login_user',
          {
            method: 'POST',
            headers: supaHeaders(),
            body: JSON.stringify({ p_username: un, p_password: pw })
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.token) acc = data;
        }
      } catch(e) { supaFailed = true; }
    }

    // 方法 3：完全離線模式 - 使用 localStorage
    if (!acc) {
      const localUser = get(LS.users, []).find(x => x.username === un);
      if (localUser && localUser.password === pw) {
        acc = { ...localUser, token: 'local_' + Date.now() };
      }
    }

    if (!acc) {
      const errMsg = supaFailed ? '伺服器無法連線（' + SUPA_URL + '）' : '帳號或密碼錯誤';
      fail('⚠️ 登入失敗：' + errMsg);
      console.error('[LOGIN] All methods failed. SUPA_ON=' + SUPA_ON + ', SUPA_URL=' + SUPA_URL + ', supaFailed=' + supaFailed);
      return;
    }
    if(acc&&acc.token){WTOKEN=acc.token;try{localStorage.setItem('ADV9_WTOKEN',acc.token)}catch(e){};
      if(acc.must_change_pw===true){toast('首次登入請先修改密碼','bad');try{openChangePw()}catch(e){}}
      await loadVpsPrivateData()} /* 🎫 存登入 token 供後續寫入授權 */

    // ⭐ 終極防護：確保 g 永遠完整
    if (acc.game_data) {
      acc.g = acc.game_data;
      // 補齊所有可能缺失的關鍵欄位
      if (!acc.g.weapons) acc.g.weapons = [];
      if (!acc.g.stats) acc.g.stats = { total: 0, correct: 0, maxCombo: 0, hardCorrect: 0, retry: 0, enhance: 0, missions: 0, subj: {}, milestones: [] };
      if (!acc.g.owned) acc.g.owned = { character: [], pet: [], anime: [], teammate: [] };
      if (!acc.g.equip) acc.g.equip = { character: null, pet: null, anime: null, teammate: null };
      if (!acc.g.gacha) acc.g.gacha = { total: 0, sinceSR: 0, sinceSSR: 0, sinceUR: 0, hist: [] };
      // 其他欄���可以繼���補，���至��� weapons 是必須的
    } else if (acc.role === 'student') {
      acc.g = newGame(); // 如果完全沒有遊戲資料，直接給新的
    } else {
      acc.g = null;
    }
    delete acc.game_data;

    // 身份檢查
    if (PORTAL === 'admin' && acc.role !== 'admin') {
      fail('⚠️ 此入口僅供管理員登入，請改用老師或學生登入器');
      return;
    }
    if (PORTAL === 'teacher' && acc.role !== 'teacher') {
      fail('⚠️ 此入口僅供老師登入，請改用正確的登入器');
      return;
    }
    if (PORTAL === 'student' && acc.role !== 'student') {
      fail('⚠️ 此入口僅供學生登入，請改用正確的登入器');
      return;
    }
    if (PORTAL === 'staff' && acc.role === 'admin') {
      fail('⚠️ 管理員請使用管理員登入器');
      return;
    }

    // ⭐ 強制同步到本機（覆蓋）
    let localUsers = get(LS.users, []);
    const priorUser = localUsers.find(x => x.username === acc.username) || {};
    const newUser = {
      ...priorUser,
      id: acc.id || acc.username,
      username: acc.username,
      name: acc.name || priorUser.name || acc.username,
      role: acc.role,
      password: acc.password || priorUser.password || '',
      classId: acc.class_id || priorUser.classId || null,
      managedClassIds: Array.isArray(acc.managedClassIds) ? acc.managedClassIds : (priorUser.managedClassIds || []),
      isSchoolAdmin: acc.isSchoolAdmin !== undefined ? !!acc.isSchoolAdmin : !!priorUser.isSchoolAdmin,
      prof: acc.prof || priorUser.prof || null,
      g: acc.g,
      createdAt: acc.created_at || priorUser.createdAt || new Date().toISOString()
    };
    const existingIndex = localUsers.findIndex(x => x.username === acc.username);
    if (existingIndex !== -1) {
      localUsers[existingIndex] = newUser;
    } else {
      localUsers.push(newUser);
    }
    set(LS.users, localUsers);

    // ⭐ 設置 session（這是關鍵）
    set(LS.ses, { u: acc.username, imp: false });
    startHeartbeat(); /* 👁 開始上線狀態心跳 */
    startFastSync(); /* 📨 開始即時訊息輪詢 */

    // 登入成功後續
    $('#lgPass').value = '';
    loginFX(acc.name);
    setTimeout(() => {
      enter();
      toast('⚔️ 歡迎回來，' + acc.name + '！');
      if (acc.role === 'student') {
        const sr = checkSign(acc.g);
        saveU(acc);
        if (sr) openModal('...');
      }
    }, 750);
  } catch (error) {
    fail('⚠️ ' + error.message);
  }
}

window.doLogin=doLogin;


function fail(m){toast(m,'bad');const c=document.querySelector('.lgCard');c.classList.add('shake');setTimeout(()=>c.classList.remove('shake'),420)}

function resetFromLogin(){if(!confirm('重置為預設資料？（清除所有變更）'))return;seed();toast('🔄 已重置為預設資料')}

