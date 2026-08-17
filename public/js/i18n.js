/* ════════════════════════════════════════════
   AI 即時翻譯系統 v5.0
   選語言 → AI 現場翻譯所有 UI 文字 → 存 localStorage
   第二次直接套快取，不用再翻
   ════════════════════════════════════════════ */

const I18N_CACHE_KEY='adv9_i18n_cache';
const I18N_BATCH_SIZE=80;

/* ── 快取管理 ── */
function getI18nCache(){
  try{return JSON.parse(localStorage.getItem(I18N_CACHE_KEY))||{}}catch(e){return{}}
}
function setI18nCache(code,obj){
  const c=getI18nCache();c[code]=obj;
  try{localStorage.setItem(I18N_CACHE_KEY,JSON.stringify(c))}catch(e){}
}
function getCachedTranslation(code,zhStr){
  const c=getI18nCache();
  return c[code]&&c[code][zhStr]?c[code][zhStr]:null;
}

/* ── 掃描頁面上所有中文文字 ── */
function collectAllZhTexts(){
  const texts=new Set();
  const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
    acceptNode:function(n){
      if(!n.parentElement)return NodeFilter.FILTER_REJECT;
      const tag=n.parentElement.tagName;
      if(['SCRIPT','STYLE','TEXTAREA','INPUT'].includes(tag))return NodeFilter.FILTER_REJECT;
      const txt=n.textContent.trim();
      if(!txt||txt.length<2)return NodeFilter.FILTER_REJECT;
      if(/[\u4e00-\u9fff]/.test(txt))return NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_REJECT;
    }
  });
  while(walk.nextNode()){texts.add(walk.currentNode.textContent.trim())}
  return[...texts];
}

/* ── 用 AI 批次翻譯 ── */
async function aiTranslateBatch(texts,targetLang,langName){
  const sys='你是專業翻譯員。把下面的中文 UI 文字翻譯成'+langName+'。'+
    '規則：1)保持簡潔 2)保持原始含義 3)UI 按鈕/標籤要自然 4)'+
    '只回傳 JSON，格式：{"中文原文":"翻譯"}，不要其他文字。'+
    '如果翻譯後太長就縮短，但不能改變意思。';
  const chunks=[];
  for(let i=0;i<texts.length;i+=I18N_BATCH_SIZE){
    chunks.push(texts.slice(i,i+I18N_BATCH_SIZE));
  }
  const allTranslations={};
  for(const chunk of chunks){
    const obj={};chunk.forEach(function(t,i){obj['K'+(i+1)]=t});
    const prompt='請翻譯以下中文為'+langName+'，回傳 JSON：\n'+JSON.stringify(obj);
    try{
      const raw=await callAI(prompt,sys);
      const match=raw.match(/\{[\s\S]*\}/);
      if(match){
        const parsed=JSON.parse(match[0]);
        chunk.forEach(function(t,i){
          const translated=parsed['K'+(i+1)];
          if(translated&&translated!==t)allTranslations[t]=translated;
        });
      }
    }catch(e){console.warn('AI translate chunk error:',e)}
  }
  return allTranslations;
}

/* ── 主翻譯流程 ── */
async function translateAndApply(langCode){
  if(!langCode)return;
  const cached=getI18nCache()[langCode];
  const cachedCount=cached?Object.keys(cached).length:0;
  if(cachedCount>50){
    applyTranslations(langCode);
    toast('🌐 '+langName(langCode)+' 已套用（'+cachedCount+' 筆快取）');
    return;
  }
  toast('🌐 正在用 AI 翻譯為 '+langName(langCode)+'...');
  const texts=collectAllZhTexts();
  if(!texts.length){toast('⚠️ 找不到可翻譯的文字');return}
  try{
    const translations=await aiTranslateBatch(texts,langCode,langName(langCode));
    setI18nCache(langCode,translations);
    applyTranslations(langCode);
    toast('✅ '+langName(langCode)+' 翻譯完成！（'+Object.keys(translations).length+' 筆）');
  }catch(e){
    toast('❌ 翻譯失敗：'+e.message);
  }
}

/* ── 套用翻譯到 DOM ── */
function applyTranslations(langCode){
  const cache=getI18nCache()[langCode]||{};
  const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
    acceptNode:function(n){
      if(!n.parentElement)return NodeFilter.FILTER_REJECT;
      const tag=n.parentElement.tagName;
      if(['SCRIPT','STYLE','TEXTAREA','INPUT'].includes(tag))return NodeFilter.FILTER_REJECT;
      const txt=n.textContent.trim();
      if(!txt||txt.length<2)return NodeFilter.FILTER_REJECT;
      if(/[\u4e00-\u9fff]/.test(txt)&&cache[txt])return NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_REJECT;
    }
  });
  const nodes=[];
  while(walk.nextNode())nodes.push(walk.currentNode);
  nodes.forEach(function(n){
    const txt=n.textContent.trim();
    if(cache[txt])n.textContent=n.textContent.replace(txt,cache[txt]);
  });
}

/* ── 快速翻譯單字（從快取取）── */
function ti(zhStr){
  const code=typeof langPref==='function'?langPref():null;
  if(!code)return zhStr;
  return getCachedTranslation(code,zhStr)||zhStr;
}

/* ── 清除快取 ── */
function clearI18nCache(){
  try{localStorage.removeItem(I18N_CACHE_KEY)}catch(e){}
  toast('🗑️ 翻譯快取已清除');
}

/* ── 查看快取狀態 ── */
function i18nCacheInfo(){
  const c=getI18nCache();
  let info='📊 翻譯快取狀態：\n';
  for(const lang in c){
    info+=langName(lang)+'：'+Object.keys(c[lang]).length+' 筆\n';
  }
  if(!Object.keys(c).length)info+='（尚無快取）';
  return info;
}
