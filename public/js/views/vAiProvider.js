/* ════════════════════════════════════════════
   vAiProvider — AI 端點設定頁（管理員限定）
   支援自訂 OpenAI 相容端點、用量上限、測試連線
   ════════════════════════════════════════════ */
function vAiProvider(){
  const u=me(); if(!u||u.role!=='admin') return toast('僅限管理員','bad');
  const data=get('ADV9_AI_PROVIDERS',{providers:[],usage:[]});
  let h=back()+'<h3 class="vt">🤖 AI 端點設定</h3>';
  h+='<div class="panel2" style="margin-bottom:12px;font-size:12px;color:var(--mut)">支援 OpenAI / Gemini / DeepSeek / Qwen / Kimi / Ollama / LM Studio / vLLM 等 OpenAI 相容端點</div>';

  /* 新增表單 */
  h+='<div class="panel2" style="margin-bottom:14px;padding:14px">';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  h+='<div><label class="mlab">名稱</label><input id="apName" placeholder="例：我的 DeepSeek" style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px"></div>';
  h+='<div><label class="mlab">Provider 類型</label><select id="apType" style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt)"><option value="oa">OpenAI 相容</option><option value="gm">Google Gemini</option><option value="ol">Ollama 本地</option></select></div>';
  h+='<div><label class="mlab">Base URL</label><input id="apUrl" placeholder="https://api.deepseek.com/chat/completions" style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px"></div>';
  h+='<div><label class="mlab">Model Name</label><input id="apModel" placeholder="deepseek-v4" style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px"></div>';
  h+='<div><label class="mlab">API Key</label><input id="apKey" type="password" placeholder="sk-..." style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px"></div>';
  h+='<div><label class="mlab">Temperature</label><input id="apTemp" type="number" min="0" max="2" step="0.1" value="0.7" style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px"></div>';
  h+='<div><label class="mlab">Timeout (ms)</label><input id="apTimeout" type="number" min="5000" max="120000" value="30000" style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px"></div>';
  h+='<div><label class="mlab">Max Tokens</label><input id="apMaxTok" type="number" min="256" max="128000" value="4096" style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px"></div>';
  h+='<div><label class="mlab">每小時呼叫上限</label><input id="apRateLimit" type="number" min="0" value="60" style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px"></div>';
  h+='<div><label class="mlab">每日 Token 上限</label><input id="apTokenBudget" type="number" min="0" value="100000" style="width:100%;padding:8px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px"></div>';
  h+='</div>';
  h+='<div style="margin-top:10px;display:flex;gap:8px">';
  h+='<button class="btn teal" onclick="addAiProvider()">➕ 新增</button>';
  h+='<button class="btn ghost" onclick="testAiProvider()">🔗 測試連線</button>';
  h+='</div></div>';

  /* 現有 providers 列表 */
  h+='<h4 style="margin-bottom:8px">📋 已設定的端點</h4>';
  if(!data.providers.length){
    h+='<div class="panel2" style="color:var(--mut);font-size:13px">尚未新增任何 AI 端點。請在上方表單新增。</div>';
  }else{
    data.providers.forEach(function(p,i){
      const today=new Date().toISOString().slice(0,10);
      const todayUsage=data.usage.filter(u=>u.provider_id===p.id&&u.date===today);
      const totalCalls=todayUsage.reduce(function(s,u){return s+u.call_count},0);
      const totalTokens=todayUsage.reduce(function(s,u){return s+u.tokens_used},0);
      h+='<div class="panel2" style="margin-bottom:8px;padding:12px;border-left:4px solid '+(p.is_local?'#4caf50':'#2196f3')+'">';
      h+='<div style="display:flex;justify-content:space-between;align-items:center">';
      h+='<div><b style="font-size:14px">'+esc(p.name)+'</b> <span style="font-size:11px;color:var(--mut);background:var(--panel);padding:2px 6px;border-radius:4px">'+p.provider_type.toUpperCase()+'</span>';
      h+=' <span style="font-size:11px;color:var(--mut)">'+esc(p.model_name)+'</span></div>';
      h+='<div style="display:flex;gap:4px">';
      h+='<button class="btn mini ghost" onclick="testSingleAiProvider('+i+')">🔗 測試</button>';
      h+='<button class="btn mini ghost" style="color:#f44336" onclick="deleteAiProvider('+i+')">🗑️</button>';
      h+='</div></div>';
      h+='<div style="font-size:12px;color:var(--mut);margin-top:6px">';
      h+='URL: '+esc(p.base_url)+'<br>';
      h+='今日用量: '+totalCalls+'/'+(p.rate_limit_per_hour||'∞')+' 次 | '+totalTokens+'/'+(p.token_budget_per_day||'∞')+' tokens';
      h+='</div></div>';
    });
  }

  /* 用量統計 */
  h+='<h4 style="margin:14px 0 8px">📊 用量統計</h4>';
  h+='<div class="panel2"><div style="font-size:12px;color:var(--mut)">總共 '+data.usage.length+' 筆紀錄。今日總計 '+data.usage.filter(function(u){return u.date===new Date().toISOString().slice(0,10)}).reduce(function(s,u){return s+u.call_count},0)+' 次呼叫</div></div>';

  $('#view').innerHTML=h;
}

function addAiProvider(){
  const name=($('#apName').value||'').trim();
  const type=$('#apType').value;
  const url=($('#apUrl').value||'').trim();
  const model=($('#apModel').value||'').trim();
  const key=($('#apKey').value||'').trim();
  const temp=parseFloat($('#apTemp').value)||0.7;
  const timeout=parseInt($('#apTimeout').value)||30000;
  const maxTokens=parseInt($('#apMaxTok').value)||4096;
  const rateLimit=parseInt($('#apRateLimit').value)||0;
  const tokenBudget=parseInt($('#apTokenBudget').value)||0;

  if(!name)return toast('請填寫名稱','bad');
  if(!url&&type!=='gm')return toast('請填寫 Base URL','bad');
  if(!model)return toast('請填寫 Model Name','bad');
  if(!key&&type!=='ol')return toast('請填寫 API Key','bad');

  const data=get('ADV9_AI_PROVIDERS',{providers:[],usage:[]});
  const provider={
    id:'ap_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),
    name:name,
    base_url:url,
    api_key:key,
    model_name:model,
    provider_type:type,
    is_local:type==='ol',
    timeout:timeout,
    temperature:temp,
    max_tokens:maxTokens,
    rate_limit_per_hour:rateLimit,
    token_budget_per_day:tokenBudget,
    created_at:new Date().toISOString(),
    updated_at:new Date().toISOString()
  };
  data.providers.push(provider);
  set('ADV9_AI_PROVIDERS',data);
  toast('✅ 已新增 '+name);
  vAiProvider();
}

function deleteAiProvider(idx){
  if(!confirm('確定刪除此 AI 端點？'))return;
  const data=get('ADV9_AI_PROVIDERS',{providers:[],usage:[]});
  data.providers.splice(idx,1);
  set('ADV9_AI_PROVIDERS',data);
  toast('已刪除');
  vAiProvider();
}

async function testAiProvider(){
  const url=($('#apUrl').value||'').trim();
  const key=($('#apKey').value||'').trim();
  const model=($('#apModel').value||'').trim();
  const type=$('#apType').value;
  if(!url&&type!=='gm')return toast('請填寫 Base URL','bad');
  toast('🔗 測試連線中...');
  try{
    const start=Date.now();
    const result=await callAiEndpoint({base_url:url,api_key:key,model_name:model,provider_type:type,timeout:15000,temperature:0.7},'請回答：1+1=? 只回答數字');
    toast('✅ 連線成功！('+((Date.now()-start))+'ms) 回應：'+String(result).substring(0,50));
  }catch(e){
    toast('❌ 連線失敗：'+e.message,'bad');
  }
}

async function testSingleAiProvider(idx){
  const data=get('ADV9_AI_PROVIDERS',{providers:[],usage:[]});
  const p=data.providers[idx];
  if(!p)return;
  toast('🔗 測試 '+p.name+'...');
  try{
    const start=Date.now();
    const result=await callAiEndpoint(p,'請回答：1+1=? 只回答數字');
    toast('✅ '+p.name+' 連線成功！('+((Date.now()-start))+'ms) 回應：'+String(result).substring(0,50));
  }catch(e){
    toast('❌ '+p.name+' 連線失敗：'+e.message,'bad');
  }
}

/* 統一 AI 呼叫函數：支援自訂 provider config 物件 */
async function callAiEndpoint(provider,prompt,sys){
  const type=provider.provider_type||'oa';
  const timeout=provider.timeout||25000;
  const ac=new AbortController();
  const timer=setTimeout(function(){ac.abort()},timeout);
  try{
    if(type==='ol'){
      /* Ollama */
      const res=await fetch('/rest/v1/ai/ollama',{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json',...(typeof WTOKEN!=='undefined'&&WTOKEN?{'x-adv9-token':WTOKEN}:{})},body:JSON.stringify({model:provider.model_name,host:provider.api_key||'http://127.0.0.1:11434',messages:[{role:'system',content:sys||'你是一個專業助手。'},{role:'user',content:prompt}],temperature:provider.temperature||0.7})});
      if(!res.ok)throw new Error('HTTP '+res.status);
      const j=await res.json();
      if(!j.message||!j.message.content)throw new Error('No content');
      return j.message.content;
    }
    if(type==='gm'){
      /* Gemini */
      const url='https://generativelanguage.googleapis.com/v1beta/models/'+provider.model_name+':generateContent?key='+provider.api_key;
      const res=await fetch(url,{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({system_instruction:{parts:[{text:sys||'你是一個專業助手。'}]},contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:provider.temperature||0.7,maxOutputTokens:provider.max_tokens||4096}})});
      if(!res.ok)throw new Error('HTTP '+res.status);
      const j=await res.json();
      if(!j.candidates||!j.candidates[0])throw new Error('No candidates');
      return j.candidates[0].content.parts[0].text;
    }
    /* OpenAI 相容 */
    const res=await fetch(provider.base_url,{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json','Authorization':'Bearer '+provider.api_key},body:JSON.stringify({model:provider.model_name,messages:[{role:'system',content:sys||'你是一個專業助手。'},{role:'user',content:prompt}],temperature:provider.temperature||0.7,max_tokens:provider.max_tokens||4096})});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const j=await res.json();
    if(!j.choices||!j.choices[0])throw new Error('No choices');
    return j.choices[0].message.content;
  }finally{clearTimeout(timer)}
}

/* 用量追蹤：每次 AI 呼叫後記錄 */
function trackAiUsage(providerId,tokensUsed){
  const data=get('ADV9_AI_PROVIDERS',{providers:[],usage:[]});
  const today=new Date().toISOString().slice(0,10);
  const existing=data.usage.find(function(u){return u.provider_id===providerId&&u.date===today});
  if(existing){
    existing.call_count++;
    existing.tokens_used+=tokensUsed||0;
  }else{
    data.usage.push({date:today,provider_id:providerId,call_count:1,tokens_used:tokensUsed||0});
  }
  /* 清除 7 天前的舊紀錄 */
  const cutoff=new Date(Date.now()-7*86400000).toISOString().slice(0,10);
  data.usage=data.usage.filter(function(u){return u.date>=cutoff});
  set('ADV9_AI_PROVIDERS',data);
}

/* 用量上限檢查：回傳 true 表示可以繼續呼叫 */
function checkAiRateLimit(providerId){
  const data=get('ADV9_AI_PROVIDERS',{providers:[],usage:[]});
  const p=data.providers.find(function(x){return x.id===providerId});
  if(!p)return true;
  const today=new Date().toISOString().slice(0,10);
  const todayUsage=data.usage.filter(function(u){return u.provider_id===providerId&&u.date===today});
  const totalCalls=todayUsage.reduce(function(s,u){return s+u.call_count},0);
  const totalTokens=todayUsage.reduce(function(s,u){return s+u.tokens_used},0);
  if(p.rate_limit_per_hour>0&&totalCalls>=p.rate_limit_per_hour)return false;
  if(p.token_budget_per_day>0&&totalTokens>=p.token_budget_per_day)return false;
  return true;
}

/* 增強版 callAI：整合自訂 providers + 用量檢查 + 記錄 */
async function callAIV2(prompt,sys,opts){
  opts=opts||{};
  const data=get('ADV9_AI_PROVIDERS',{providers:[],usage:[]});

  /* 先嘗試自訂 providers */
  for(const p of data.providers){
    if(!checkAiRateLimit(p.id))continue;
    try{
      const result=await callAiEndpoint(p,prompt,sys);
      trackAiUsage(p.id,estimateTokens(result));
      return result;
    }catch(e){}
  }

  /* 回退到原有 callAI */
  return callAI(prompt,sys);
}

function estimateTokens(text){
  /* 粗略估算：中文 1 字 ≈ 2 tokens，英文 1 詞 ≈ 1.3 tokens */
  if(!text)return 0;
  return Math.ceil(text.length*1.5);
}
