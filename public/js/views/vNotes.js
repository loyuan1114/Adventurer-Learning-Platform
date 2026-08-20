/* ════════════════════════════════════════════
   vNotes 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含：筆記管理 / AI 結構化 / 閃卡(間隔重複 SM-2) / 測驗規劃 / 進度追蹤
   ════════════════════════════════════════════ */
let NB={tab:'notes',note:null,editing:false,genState:0,cards:null,cardIdx:0,flip:false};

function vNotes(){
  const u=me();if(!u)return;
  const g=u.g||{};
  const due=(g.stats&&g.stats.dueCards)||0;
  $('#view').innerHTML=back()+'<h3 class="vt">📝 筆記寶庫 <span class="vsub">AI 結構化筆記・閃卡間隔複習・考試規劃・進度追蹤</span></h3>'+
  '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">'+
  '<button class="btn '+(NB.tab==='notes'?'gold':'ghost')+'" onclick="NB.tab=\'notes\';vNotes()">📒 筆記 ('+0+')</button>'+
  '<button class="btn '+(NB.tab==='cards'?'gold':'ghost')+'" onclick="NB.tab=\'cards\';vNotes()">🎴 閃卡'+(due?' <span style="color:#ff5252">('+due+')</span>':'')+'</button>'+
  '<button class="btn '+(NB.tab==='plan'?'gold':'ghost')+'" onclick="NB.tab=\'plan\';vNotes()">🗓️ 考試規劃</button>'+
  '<button class="btn '+(NB.tab==='progress'?'gold':'ghost')+'" onclick="NB.tab=\'progress\';vNotes()">📊 進度</button>'+
  '<button class="btn ghost" onclick="vNotesNew()">＋ 新增筆記</button></div>'+
  '<div id="nbBody"></div>';
  if(NB.tab==='notes'){nbList()}
  else if(NB.tab==='cards'){nbCards()}
  else if(NB.tab==='plan'){nbPlan()}
  else if(NB.tab==='progress'){nbProgress()}
}

async function nbApi(method,path,body){
  try{
    const r=await fetch(SUPA_URL+path,{method:method,headers:supaHeaders(),body:body?JSON.stringify(body):undefined});
    const j=await r.json();
    return j;
  }catch(e){toast('伺服器連線失敗','bad');return null}
}

async function nbList(){
  const arr=await nbApi('GET','/rest/v1/lib/notes')||[];
  const box=document.getElementById('nbBody');if(!box)return;
  if(!arr.length){box.innerHTML='<p class="empty">還沒有筆記。按「＋ 新增筆記」開始，或把影片/PDF/圖片/文字交給 AI 整理成結構化筆記。</p>';return}
  box.innerHTML='<div style="display:flex;flex-direction:column;gap:8px">'+arr.map(n=>
    '<div class="panel2" style="cursor:pointer" onclick="nbOpen(\''+n.id+'\')">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">'+
    '<div><b style="font-family:var(--serif);font-size:15px">'+esc(n.title)+'</b>'+
    '<div style="font-size:11.5px;color:var(--mut)">'+(n.sourceType||'text')+'・'+new Date(n.updatedAt).toLocaleString()+(n.tags&&n.tags.length?'・🏷 '+n.tags.map(esc).join(', '):'')+'</div></div>'+
    '<div style="display:flex;gap:6px"><button class="btn ghost mini" onclick="event.stopPropagation();nbGenMind(\''+n.id+'\')">🗺️ 心智圖</button>'+
    '<button class="btn ghost mini" onclick="event.stopPropagation();nbGenCards(\''+n.id+'\')">🎴 閃卡</button>'+
    '<button class="btn ghost mini" onclick="event.stopPropagation();nbDel(\''+n.id+'\')">🗑️</button></div></div>'+
    (n.summary?'<div style="font-size:12.5px;color:var(--mut);margin-top:6px;border-left:3px solid var(--line);padding-left:8px">'+esc(n.summary)+'</div>':'')+
    '</div>').join('')+'</div>';
}

function nbNotesList(arr){return arr||[]}

function nbOpen(id){
  nbApi('GET','/rest/v1/lib/notes').then(arr=>{
    const n=(arr||[]).find(x=>x.id===id);if(!n)return;
    NB.note=n;NB.tab='notes';
    $('#view').innerHTML=back("vNotes()")+'<h3 class="vt">📒 '+esc(n.title)+'</h3>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">'+
    '<button class="btn ghost mini" onclick="nbOpen(\''+n.id+'\')">↻ 重新整理</button>'+
    '<button class="btn gold mini" onclick="nbGenMind(\''+n.id+'\')">🗺️ 生成心智圖</button>'+
    '<button class="btn gold mini" onclick="nbGenCards(\''+n.id+'\')">🎴 生成閃卡</button>'+
    '<button class="btn ghost mini" onclick="nbExportMd(\''+n.id+'\')">📤 Markdown</button>'+
    '<button class="btn ghost mini" onclick="nbExportJson(\''+n.id+'\')">📦 JSON</button>'+
    '<button class="btn ghost mini" onclick="nbShare(\''+n.id+'\')">🔗 分享</button>'+
    '<button class="btn ghost mini" onclick="nbEdit(\''+n.id+'\')">✏️ 編輯</button></div>'+
    '<div class="panel2" style="line-height:1.9;font-size:13.5px">'+esc(n.content||'').replace(/\n/g,'<br>')+'</div>'+
    (n.outline&&n.outline.length?'<div class="panel2" style="margin-top:10px"><b style="color:var(--teal)">📑 大綱</b><ol style="margin:8px 0 0 18px">'+n.outline.map(esc).map(x=>'<li>'+x+'</li>').join('')+'</ol></div>':'')+
    (n.definitions&&n.definitions.length?'<div class="panel2" style="margin-top:10px"><b style="color:var(--gold2)">📖 定義</b><div style="margin-top:6px">'+n.definitions.map(d=>'<div style="margin-bottom:4px"><b>'+esc(d.t||'')+'</b>：'+esc(d.d||'')+'</div>').join('')+'</div></div>':'')+
    (n.sources&&n.sources.length?'<div class="panel2" style="margin-top:10px;font-size:12px;color:var(--mut)"><b>🔗 來源：</b>'+n.sources.map(esc).join('・')+'</div>':'');
  });
}

function nbEdit(id){
  const n=NB.note;if(!n)return;
  $('#view').innerHTML=back("vNotes()")+'<h3 class="vt">✏️ 編輯筆記</h3>'+
  '<div class="panel2"><label class="lb">標題</label><input id="nbT" class="inp" value="'+esc(n.title)+'">'+
  '<label class="lb">類型</label><select id="nbS" class="inp">'+['text','video','audio','pdf','image','web','slides'].map(t=>'<option value="'+t+'"'+(n.sourceType===t?' selected':'')+'>'+t+'</option>').join('')+'</select>'+
  '<label class="lb">內容</label><textarea id="nbC" class="inp" rows="12" style="font-family:monospace">'+esc(n.content||'')+'</textarea>'+
  '<div style="display:flex;gap:8px;margin-top:10px"><button class="btn teal" onclick="nbSave(\''+n.id+'\')">💾 儲存</button>'+
  '<button class="btn ghost" onclick="nbAiStructure()">🤖 AI 結構化</button>'+
  '<button class="btn ghost" onclick="vNotes()">取消</button></div></div>';
  NB.editing=true;
}

function nbSave(id){
  const n=NB.note;if(!n)return;
  const title=document.getElementById('nbT').value,src=document.getElementById('nbS').value,content=document.getElementById('nbC').value;
  nbApi('POST','/rest/v1/lib/notes',{id:n.id,title:title,sourceType:src,content:content,outline:n.outline||[],summary:n.summary||'',definitions:n.definitions||[],tags:n.tags||[],sources:n.sources||[]}).then(x=>{if(x){toast('已儲存','ok');vNotes()}});
}

async function nbAiStructure(){
  const c=document.getElementById('nbC');if(!c)return;
  const txt=c.value.trim();if(txt.length<10){toast('內容太短，請先貼入教材內容','bad');return}
  toast('AI 整理中...');
  NB.genState=1;
  try{
    const out=await callAI('請將以下教材整理成結構化學習筆記，輸出 JSON：{"outline":["大綱重點..."],"summary":"一段摘要","definitions":[{"t":"名詞","d":"定義"}],"tags":["標籤"]}。只輸出 JSON，不要其他文字。\n\n教材內容：\n'+txt.slice(0,8000));
    const m=out.match(/\{[\s\S]*\}/);if(!m)throw new Error('no json');
    const j=JSON.parse(m[0]);
    const n=NB.note||{};
    n.outline=j.outline||[];n.summary=j.summary||'';n.definitions=j.definitions||[];n.tags=j.tags||[];
    nbApi('POST','/rest/v1/lib/notes',{id:n.id,title:document.getElementById('nbT').value,sourceType:document.getElementById('nbS').value,content:document.getElementById('nbC').value,outline:n.outline,summary:n.summary,definitions:n.definitions,tags:n.tags,sources:n.sources||[]}).then(x=>{if(x){toast('AI 結構化完成','ok');nbOpen(n.id)}});
  }catch(e){toast('AI 失敗：'+e.message,'bad')}
  finally{NB.genState=0}
}

function nbNew(){
  const u=me();if(!u)return;
  const g=u.g||{};
  $('#view').innerHTML=back("vNotes()")+'<h3 class="vt">＋ 新增筆記</h3>'+
  '<div class="panel2"><label class="lb">標題</label><input id="nbT" class="inp" placeholder="例如：光合作用">'+
  '<label class="lb">來源類型</label><select id="nbS" class="inp">'+['text','video','audio','pdf','image','web','slides'].map(t=>'<option value="'+t+'">'+t+'</option>').join('')+'</select>'+
  '<label class="lb">內容（貼上教材文字；影片/PDF 請先轉錄/擷取文字）</label><textarea id="nbC" class="inp" rows="12" style="font-family:monospace" placeholder="貼上教材內容..."></textarea>'+
  '<div style="display:flex;gap:8px;margin-top:10px"><button class="btn teal" onclick="nbCreate()">💾 建立</button>'+
  '<button class="btn ghost" onclick="nbAiStructure()">🤖 AI 結構化（建立後）</button>'+
  '<button class="btn ghost" onclick="vNotes()">取消</button></div></div>';
  NB.editing=true;NB.note={};
}

function nbCreate(){
  const title=document.getElementById('nbT').value,src=document.getElementById('nbS').value,content=document.getElementById('nbC').value;
  if(!content.trim()){toast('請貼入教材內容','bad');return}
  nbApi('POST','/rest/v1/lib/notes',{title:title,sourceType:src,content:content,outline:[],summary:'',definitions:[],tags:[],sources:[]}).then(n=>{if(n){toast('已建立','ok');NB.note=n;nbAiStructure()}});
}

function nbDel(id){
  if(!confirm('刪除這份筆記與其閃卡？'))return;
  nbApi('DELETE','/rest/v1/lib/notes/'+id).then(x=>{if(x){toast('已刪除','ok');vNotes()}});
}

/* 閃卡：列表 + 複習（SM-2 間隔重複，server 用 C++ 黑盒計算排程） */
async function nbCards(){
  const arr=await nbApi('GET','/rest/v1/lib/cards')||[];
  const box=document.getElementById('nbBody');if(!box)return;
  const dueCards=arr.filter(c=>c.sm2&&c.sm2.due<=Date.now());
  const u=me();u.g=u.g||{};u.g.stats=u.g.stats||{};u.g.stats.dueCards=dueCards.length;saveU(u);
  if(!arr.length){box.innerHTML='<p class="empty">還沒有閃卡。到「筆記」分頁對任一筆記按「🎴 閃卡」讓 AI 產生。</p>';return}
  box.innerHTML='<div class="panel2" style="margin-bottom:10px">'+(dueCards.length?'<b style="color:#ff5252">🔔 今天有 '+dueCards.length+' 張卡片待複習</b>：<button class="btn gold" onclick="nbReview()">▶ 開始複習</button>':'<b>✅ 今日複習已完成！</b><button class="btn ghost" onclick="nbReview(true)">🔄 提前複習全部</button>')+'</div>'+
  '<div style="display:flex;flex-wrap:wrap;gap:8px">'+arr.slice(0,200).map(c=>{
    const d=Math.max(0,Math.ceil((c.sm2.due-Date.now())/86400000));
    return '<div class="panel2" style="min-width:150px;flex:1;cursor:pointer" onclick="nbReviewOne(\''+c.id+'\')">'+
    '<div style="font-size:13px">'+esc(c.front.slice(0,60))+'</div>'+
    '<div style="font-size:10.5px;color:var(--mut)">'+(d===0?'今日到期':d+' 天後')+'・熟練度 '+Math.min(5,c.sm2.reps||0)+'・間隔 '+(c.sm2.interval||0)+' 天</div></div>'}).join('')+'</div>';
}

async function nbReview(force){
  const arr=await nbApi('GET','/rest/v1/lib/cards')||[];
  const list=force?arr:arr.filter(c=>c.sm2&&c.sm2.due<=Date.now());
  if(!list.length){toast('沒有可複習的卡片','bad');vNotes();return}
  NB.cards=list;NB.cardIdx=0;NB.flip=false;
  nbReviewShow();
}

function nbReviewShow(){
  const c=NB.cards[NB.cardIdx];if(!c){toast('複習完成！','ok');vNotes();return}
  $('#view').innerHTML=back("vNotes()")+'<h3 class="vt">🎴 閃卡複習 <span style="font-size:12px;color:var(--mut)">'+(NB.cardIdx+1)+'/'+NB.cards.length+'</span></h3>'+
  '<div class="panel2" style="max-width:640px;margin:20px auto;text-align:center;padding:30px;min-height:200px;display:flex;flex-direction:column;justify-content:center;cursor:pointer" onclick="nbFlip()">'+
  (NB.flip?'<div style="font-size:20px;color:var(--gold2)">'+esc(c.back)+'</div>':'<div style="font-size:18px">'+esc(c.front)+'</div>')+
  '<div style="font-size:11px;color:var(--mut);margin-top:14px">'+(NB.flip?'點擊看正面':'點擊看答案')+'</div></div>'+
  (NB.flip?'<div style="max-width:640px;margin:10px auto;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">'+
  [['0','重來','#ff5252'],['3','勉強記住','#ff9800'],['4','記得','#4caf50'],['5','輕鬆記得','#00bcd4']].map(b=>'<button class="btn" style="background:'+b[2]+'" onclick="nbGrade('+b[0]+')">'+b[1]+'</button>').join('')+'</div>':'');
}

function nbFlip(){NB.flip=!NB.flip;nbReviewShow()}

function nbGrade(q){
  const c=NB.cards[NB.cardIdx];if(!c)return;
  nbApi('POST','/rest/v1/lib/cards/review',{id:c.id,quality:Number(q)}).then(x=>{
    if(x&&x.card){const u=me();u.g=u.g||{};u.g.stats=u.g.stats||{};u.g.stats.dueCards=Math.max(0,(u.g.stats.dueCards||1)-1);saveU(u);}
    NB.cardIdx++;NB.flip=false;nbReviewShow();
  });
}

async function nbGenCards(noteId){
  const arr=await nbApi('GET','/rest/v1/lib/notes')||[];
  const n=(arr||[]).find(x=>x.id===noteId);if(!n){toast('找不到筆記','bad');return}
  const content=(n.content||'')+' '+(n.outline||[]).join(' ')+(n.summary||'');
  if(content.length<20){toast('筆記內容不足，請先編輯內容','bad');return}
  toast('AI 產生閃卡中...');
  try{
    const out=await callAI('根據以下教材，產生 8 張記憶閃卡。輸出 JSON 陣列：[{"front":"問題/提示","back":"答案"}...]。只輸出 JSON 陣列。\n\n教材：\n'+content.slice(0,8000));
    const m=out.match(/\[[\s\S]*\]/);if(!m)throw new Error('no json');
    const cards=JSON.parse(m[0]);
    if(!Array.isArray(cards)||!cards.length)throw new Error('empty');
    let saved=0;
    for(const c of cards.slice(0,20)){
      const r=await nbApi('POST','/rest/v1/lib/cards',{noteId:noteId,front:String(c.front||'').slice(0,5000),back:String(c.back||'').slice(0,5000)});
      if(r)saved++;
    }
    toast('已建立 '+saved+' 張閃卡','ok');vNotes();
  }catch(e){toast('AI 失敗：'+e.message,'bad')}
}

function nbReviewOne(id){const arr=NB.cards||[];const i=arr.findIndex(c=>c.id===id);if(i>=0){NB.cardIdx=i;NB.flip=false;nbReviewShow()}}

/* 測驗規劃：設定考試日期與科目，系統自動規劃每日複習 */
async function nbPlan(){
  const plan=await nbApi('GET','/rest/v1/lib/plan')||{examDate:null,subjects:[],plan:[]};
  const box=document.getElementById('nbBody');if(!box)return;
  const examD=plan.examDate?new Date(plan.examDate):null;
  const daysLeft=examD?Math.max(0,Math.ceil((examD-Date.now())/86400000)):null;
  box.innerHTML='<div class="panel2"><b style="color:var(--gold2)">🗓️ 考試規劃</b>'+
  '<div style="margin-top:8px"><label class="lb">考試日期</label><input id="npDate" type="date" class="inp" value="'+(examD?examD.toISOString().slice(0,10):'')+'"></div>'+
  '<div style="margin-top:8px"><label class="lb">科目（逗號分隔）</label><input id="npSubj" class="inp" value="'+esc((plan.subjects||[]).join(','))+'"></div>'+
  '<div style="margin-top:10px;display:flex;gap:8px"><button class="btn teal" onclick="nbPlanSave()">💾 儲存規劃</button>'+
  '<button class="btn gold" onclick="nbPlanAuto()">🤖 自動排複習進度</button></div>'+
  (daysLeft!==null?'<div style="margin-top:10px;font-size:13px;color:'+(daysLeft<=30?'#ff5252':(daysLeft<=90?'#ff9800':'#4caf50'))+'"><b>距考試還有 '+daysLeft+' 天</b></div>':'')+'</div>'+
  (plan.plan&&plan.plan.length?'<div class="panel2" style="margin-top:10px"><b style="color:var(--teal)">📋 複習計畫</b><div style="margin-top:6px">'+plan.plan.map((p,i)=>'<div style="padding:6px 0;border-bottom:1px solid var(--line)"><b>第 '+p.date+' 天</b>：'+p.items.map(esc).join('、')+(p.done?' <span style="color:#4caf50">✓</span>':'')+'</div>').join('')+'</div></div>':'');
}

function nbPlanSave(){
  const d=document.getElementById('npDate').value;
  const subj=(document.getElementById('npSubj').value||'').split(/[,，、]/).map(s=>s.trim()).filter(Boolean);
  const ts=d?new Date(d).getTime():null;
  nbApi('POST','/rest/v1/lib/plan',{examDate:ts,subjects:subj,plan:[]}).then(x=>{if(x){toast('已儲存','ok');nbPlan()}});
}

async function nbPlanAuto(){
  const plan=await nbApi('GET','/rest/v1/lib/plan')||{examDate:null,subjects:[],plan:[]};
  if(!plan.examDate){toast('請先設定考試日期','bad');return}
  const days=Math.max(1,Math.ceil((plan.examDate-Date.now())/86400000));
  const subj=(plan.subjects||[]).slice(0,30);
  if(!subj.length){toast('請先輸入科目','bad');return}
  const itemsPerDay=Math.max(1,Math.ceil(subj.length/days));
  const planArr=[];
  for(let i=0;i<days;i++){
    const start=(i*itemsPerDay)%subj.length;
    const items=[];for(let k=0;k<itemsPerDay;k++)items.push('複習 '+(subj[(start+k)%subj.length]));
    planArr.push({date:i+1,items:items,done:false});
  }
  nbApi('POST','/rest/v1/lib/plan',{examDate:plan.examDate,subjects:subj,plan:planArr}).then(x=>{if(x){toast('已排好 '+days+' 天複習計畫','ok');nbPlan()}});
}

/* 進度追蹤：顯示各單元答題與正確率，標出弱項 */
async function nbProgress(){
  const prog=await nbApi('GET','/rest/v1/lib/progress')||{units:{},answered:0,correct:0};
  const box=document.getElementById('nbBody');if(!box)return;
  const units=prog.units||{};
  const keys=Object.keys(units).sort();
  const weak=keys.filter(k=>units[k].attempts>=3&&units[k].correct/units[k].attempts<0.6);
  box.innerHTML='<div class="panel2"><b>📊 學習進度</b>'+
  '<div style="margin-top:8px;display:flex;gap:16px;flex-wrap:wrap">'+
  '<span>總答題 <b style="color:var(--teal)">'+(prog.answered||0)+'</b></span>'+
  '<span>答對 <b style="color:var(--gold2)">'+(prog.correct||0)+'</span>'+
  '<span>正確率 <b style="color:'+((prog.answered?prog.correct/prog.answered:0)>=0.7?'#4caf50':'#ff5252')+'">'+Math.round((prog.answered?prog.correct/prog.answered:0)*100)+'%</b></span></div>'+
  (weak.length?'<div style="margin-top:10px;color:#ff5252"><b>⚠️ 弱項單元（答對率&lt;60%）：</b>'+weak.map(esc).join('、')+'<button class="btn gold mini" style="margin-left:8px" onclick="nbWeakPractice(\''+weak.join(',')+'\')">🎯 針對練習</button></div>':'')+'</div>'+
  '<div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">'+keys.map(k=>{const uu=units[k];const rate=uu.attempts?uu.correct/uu.attempts:0;return '<div class="panel2" style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span>📚 '+esc(k)+'</span><span style="font-size:12px;color:var(--mut)">'+uu.attempts+' 次・'+(Math.round(rate*100))+'%</span><div style="width:100px;height:8px;background:var(--line);border-radius:4px;overflow:hidden"><div style="width:'+(rate*100)+'%;height:100%;background:'+(rate>=0.6?'#4caf50':'#ff5252')+'"></div></div></div>'}).join('')+'</div>';
}

async function nbWeakPractice(units){
  const arr=await nbApi('GET','/rest/v1/lib/cards')||[];
  const list=arr.filter(c=>{const t=(c.tags||[]).join('');return units.split(',').some(u=>t.includes(u))||(c.noteId&&units.includes(c.noteId))});
  if(!list.length){toast('沒有找到對應弱項的卡片，可先對筆記生成閃卡','bad');return}
  NB.cards=list;NB.cardIdx=0;NB.flip=false;nbReviewShow();
}

/* ── 匯出 / 分享：Markdown・JSON・剪貼簿分享連結 ── */
function nbExportMd(id){
  const n=NB.note||{};if(!n.id){toast('請先開啟筆記','bad');return}
  let md='# '+n.title+'\n\n> 來源：'+n.sourceType+'　更新：'+new Date(n.updatedAt).toLocaleString()+'\n\n';
  md+='## 摘要\n\n'+n.summary+'\n\n';
  if(n.outline&&n.outline.length){md+='## 大綱\n\n'+n.outline.map(x=>'- '+x).join('\n')+'\n\n'}
  md+='## 內容\n\n'+n.content+'\n\n';
  if(n.definitions&&n.definitions.length){md+='## 定義\n\n'+n.definitions.map(d=>'- **'+d.t+'**：'+d.d).join('\n')+'\n\n'}
  if(n.tags&&n.tags.length){md+='## 標籤\n\n'+n.tags.map(t=>'`'+t+'`').join(' ')+'\n'}
  nbDownload((n.title||'筆記')+'.md',md,'text/markdown');
}

function nbExportJson(id){
  const n=NB.note||{};if(!n.id){toast('請先開啟筆記','bad');return}
  nbDownload((n.title||'筆記')+'.json',JSON.stringify(n,null,2),'application/json');
}

function nbDownload(name,content,mime){
  try{
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([content],{type:mime||'text/plain'}));
    a.download=name;a.click();
    URL.revokeObjectURL(a.href);
    toast('已匯出 '+name,'ok');
  }catch(e){toast('匯出失敗：'+e.message,'bad')}
}

function nbShare(id){
  const n=NB.note||{};if(!n.id){toast('請先開啟筆記','bad');return}
  const data=JSON.stringify({t:'adv9note',v:1,id:n.id,title:n.title,content:n.content,outline:n.outline,summary:n.summary,definitions:n.definitions,tags:n.tags});
  const url=location.origin+'/share.html#'+encodeURIComponent(btoa(unescape(encodeURIComponent(data))));
  try{
    if(navigator.clipboard){navigator.clipboard.writeText(url).then(()=>toast('分享連結已複製','ok')).catch(()=>nbShareCopy(url))}
    else nbShareCopy(url);
  }catch(e){nbShareCopy(url)}
}
function nbShareCopy(url){prompt('複製分享連結：',url)}
function nbImportShare(){
  const h=location.hash||'';
  if(!h||h.length<20)return false;
  try{
    const data=JSON.parse(decodeURIComponent(escape(atob(h.slice(1)))));
    if(!(data&&data.t==='adv9note'&&data.content))return false;
    const j={t:'adv9note',v:1,title:data.title,content:data.content,outline:data.outline,summary:data.summary,definitions:data.definitions,tags:data.tags};
    nbApi('POST','/rest/v1/lib/notes',j).then(n=>{if(n){toast('已從分享連結匯入筆記「'+n.title+'」','ok');vNotes()}});
    return true;
  }catch(e){return false}
}