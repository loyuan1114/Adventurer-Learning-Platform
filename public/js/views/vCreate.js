/* ════════════════════════════════════════════
   vCreate 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含：心智圖 / 教材漫畫 / AI 播客 / AI 導師
   ════════════════════════════════════════════ */
let CR={tab:'mind',gen:0};
function vCreate(){
  $('#view').innerHTML=back()+'<h3 class="vt">🎨 創作中心 <span class="vsub">心智圖・教材漫畫・AI 播客・AI 導師</span></h3>'+
  '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">'+
  '<button class="btn '+(CR.tab==='mind'?'gold':'ghost')+'" onclick="CR.tab=\'mind\';vCreate()">🗺️ 心智圖</button>'+
  '<button class="btn '+(CR.tab==='manga'?'gold':'ghost')+'" onclick="CR.tab=\'manga\';vCreate()">📖 教材漫畫</button>'+
  '<button class="btn '+(CR.tab==='podcast'?'gold':'ghost')+'" onclick="CR.tab=\'podcast\';vCreate()">🎧 AI 播客</button>'+
  '<button class="btn '+(CR.tab==='info'?'gold':'ghost')+'" onclick="CR.tab=\'info\';vCreate()">📊 資訊圖</button>'+
  '<button class="btn '+(CR.tab==='live'?'gold':'ghost')+'" onclick="CR.tab=\'live\';vCreate()">🎙️ 即時轉錄</button>'+
  '<button class="btn '+(CR.tab==='tutor'?'gold':'ghost')+'" onclick="CR.tab=\'tutor\';vCreate()">🤖 AI 導師</button></div>'+
  '<div id="crBody"></div>';
  if(CR.tab==='mind')crMinds();
  else if(CR.tab==='manga')crMangas();
  else if(CR.tab==='podcast')crPodcasts();
  else if(CR.tab==='info')crInfos();
  else if(CR.tab==='live')crLive();
  else if(CR.tab==='tutor')crTutor();
}

async function crApi(method,path,body){
  try{
    const r=await fetch(SUPA_URL+path,{method:method,headers:supaHeaders(),body:body?JSON.stringify(body):undefined});
    return await r.json();
  }catch(e){toast('伺服器連線失敗','bad');return null}
}

async function crNotePicker(cb){
  const arr=await crApi('GET','/rest/v1/lib/notes')||[];
  if(!arr.length){toast('請先在「📝 筆記寶庫」建立筆記','bad');return}
  const h='<div style="display:flex;flex-direction:column;gap:6px;max-height:50vh;overflow-y:auto">'+arr.map(n=>'<button onclick="crPickNote(\''+n.id+'\')" style="text-align:left;padding:10px;background:var(--panel);border:1px solid var(--line);border-radius:6px;cursor:pointer;color:var(--txt);font-size:13px">📒 '+esc(n.title)+'</button>').join('')+'</div>';
  window.crPickNote=function(id){closeModal();cb(id)};
  showModal('選擇筆記',h);
}

/* ── 心智圖：選筆記 → AI 生成節點樹 → SVG 呈現 ── */
async function crMinds(){
  const arr=await crApi('GET','/rest/v1/cr/minds')||[];
  const box=document.getElementById('crBody');if(!box)return;
  box.innerHTML='<div style="margin-bottom:10px"><button class="btn teal" onclick="crMindNew()">＋ 從筆記生成心智圖</button></div>'+
  (arr.length?'<div style="display:flex;flex-wrap:wrap;gap:10px">'+arr.map(m=>'<div class="panel2" style="flex:1;min-width:220px;cursor:pointer" onclick="crMindShow(\''+m.id+'\')"><b>🗺️ '+esc(m.title)+'</b><div style="font-size:11px;color:var(--mut)">'+new Date(m.updatedAt).toLocaleString()+'</div></div>').join('')+'</div>':'<p class="empty">還沒有心智圖。從筆記生成第一個吧！</p>');
}

function crMindNew(){crNotePicker(crMindGen)}

async function crMindGen(noteId){
  const notes=await crApi('GET','/rest/v1/lib/notes')||[];
  const n=notes.find(x=>x.id===noteId);if(!n){toast('找不到筆記','bad');return}
  const content=(n.title||'')+'。'+(n.content||'')+' '+(n.outline||[]).join(' ')+' '+(n.summary||'');
  toast('AI 生成心智圖...');
  try{
    const out=await callAI('根據以下教材，生成心智圖。輸出 JSON：{"root":"主題","nodes":[{"id":1,"text":"節點文字","parent":0}]}，parent 為父節點 id（根節點 parent 為 0）。最多 20 個節點。只輸出 JSON。\n\n教材：\n'+content.slice(0,8000));
    const m=out.match(/\{[\s\S]*\}/);if(!m)throw new Error('no json');
    const j=JSON.parse(m[0]);
    const nodes=j.nodes||[];if(!nodes.length)throw new Error('empty');
    const mind=await crApi('POST','/rest/v1/cr/minds',{title:n.title,nodes:nodes});
    if(mind){toast('心智圖已生成','ok');crMindShow(mind.id)}
  }catch(e){toast('AI 失敗：'+e.message,'bad')}
}

function crMindShow(id){
  crApi('GET','/rest/v1/cr/minds').then(arr=>{
    const m=(arr||[]).find(x=>x.id===id);if(!m)return;
    const nodes=m.nodes||[];
    const byId={};nodes.forEach(n=>byId[n.id]=n);
    const children={};nodes.forEach(n=>{const p=n.parent||0;(children[p]=children[p]||[]).push(n)});
    const depthMap={};nodes.forEach(n=>{let d=0,p=n.parent;while(p&&byId[p]){d++;p=byId[p].parent||0}depthMap[n.id]=d});
    const maxD=Math.max(0,...nodes.map(n=>depthMap[n.id]||0));
    const W=900,H=Math.max(300,maxD*110+60);
    let svg='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;background:rgba(0,0,0,.15);border-radius:8px">';
    const pos={};nodes.forEach(n=>{const d=depthMap[n.id]||0;const x=80+d*220;const sib=children[d]||[];const idx=sib.indexOf(n);const span=sib.length||1;const y=(idx+0.5)*(H/span);pos[n.id]={x:x,y:y}});
    nodes.forEach(n=>{if(n.parent){const p=pos[n.parent];if(p){pos[n.id].y=(pos[n.id].y+p.y)/2;svg+='<line x1="'+p.x+'" y1="'+p.y+'" x2="'+pos[n.id].x+'" y2="'+pos[n.id].y+'" stroke="#8b6ce0" stroke-width="1.5"/>'}}});
    nodes.forEach(n=>{const p=pos[n.id];const t=(n.text||'').slice(0,40);svg+='<circle cx="'+p.x+'" cy="'+p.y+'" r="16" fill="'+(n.parent?'#3d5afe':'#ffd700')+'" opacity=".9"/>';svg+='<text x="'+(p.x+22)+'" y="'+(p.y+4)+'" fill="#fff" font-size="12">'+esc(t)+'</text>'});
    svg+='</svg>';
    $('#view').innerHTML=back('vCreate()')+'<h3 class="vt">🗺️ '+esc(m.title)+'</h3>'+svg+
    '<div style="margin-top:10px;display:flex;gap:8px"><button class="btn gold" onclick="crMindGen(\''+m.noteId+'\')">🔄 重新生成</button><button class="btn ghost" onclick="crMindDel(\''+m.id+'\')">🗑️ 刪除</button></div>';
  });
}

async function crMindDel(id){
  const r=await crApi('DELETE','/rest/v1/cr/minds/'+id);
  toast('已刪除','ok');vCreate();
}

/* ── 教材漫畫：選筆記 → AI 生成分鏡 → SVG 多格漫畫 ── */
async function crMangas(){
  const arr=await crApi('GET','/rest/v1/cr/mangas')||[];
  const box=document.getElementById('crBody');if(!box)return;
  box.innerHTML='<div style="margin-bottom:10px"><button class="btn teal" onclick="crNotePicker(crMangaGen)">＋ 從筆記生成教材漫畫</button></div>'+
  (arr.length?'<div style="display:flex;flex-wrap:wrap;gap:10px">'+arr.map(m=>'<div class="panel2" style="flex:1;min-width:220px;cursor:pointer" onclick="crMangaShow(\''+m.id+'\')">📖 <b>'+esc(m.title)+'</b><div style="font-size:11px;color:var(--mut)">'+(m.panels||[]).length+' 格・'+new Date(m.updatedAt).toLocaleString()+'</div></div>').join('')+'</div>':'<p class="empty">還沒有漫畫。把筆記變成漫畫吧！</p>');
}

async function crMangaGen(noteId){
  const notes=await crApi('GET','/rest/v1/lib/notes')||[];
  const n=notes.find(x=>x.id===noteId);if(!n){toast('找不到筆記','bad');return}
  const content=(n.title||'')+'。'+(n.content||'')+' '+(n.outline||[]).join(' ')+' '+(n.summary||'');
  toast('AI 編劇中...');
  try{
    const out=await callAI('把以下教材改編成 6 格教學漫畫（適合國中生）。輸出 JSON 陣列：[{"scene":"場景描述","character":"出現角色","text":"對白或旁白"}] 共 6 格。只輸出 JSON 陣列。\n\n教材：\n'+content.slice(0,8000));
    const m=out.match(/\[[\s\S]*\]/);if(!m)throw new Error('no json');
    const panels=JSON.parse(m[0]);
    if(!Array.isArray(panels)||!panels.length)throw new Error('empty');
    const manga=await crApi('POST','/rest/v1/cr/mangas',{title:n.title,panels:panels});
    if(manga){toast('漫畫已生成','ok');crMangaShow(manga.id)}
  }catch(e){toast('AI 失敗：'+e.message,'bad')}
}

function crMangaShow(id){
  crApi('GET','/rest/v1/cr/mangas').then(arr=>{
    const m=(arr||[]).find(x=>x.id===id);if(!m)return;
    const panels=m.panels||[];
    const colors=['#ff8a80','#80d8ff','#b9f6ca','#ffd8a8','#ea80fc','#a7ffeb'];
    $('#view').innerHTML=back('vCreate()')+'<h3 class="vt">📖 '+esc(m.title)+'</h3>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">'+panels.map((p,i)=>'<div class="panel2" style="background:'+colors[i%6]+'22;border:2px solid '+colors[i%6]+'">'+
    '<div style="font-size:11px;color:var(--mut)">第 '+(i+1)+' 格</div>'+
    '<div style="height:120px;display:flex;align-items:center;justify-content:center;font-size:40px;background:rgba(0,0,0,.15);border-radius:6px;margin:6px 0">'+crIcon(p.scene||'')+'</div>'+
    '<div style="font-size:11px;color:var(--teal)">'+esc(p.scene||'')+'</div>'+
    '<div style="font-size:13px;margin-top:4px">'+esc(p.text||'')+'</div>'+
    '<div style="font-size:11px;margin-top:4px">👤 '+(p.character||'旁白')+'</div></div>').join('')+'</div>'+
    '<div style="margin-top:10px"><button class="btn ghost" onclick="crMangaGen(\''+m.noteId+'\')">🔄 重新編劇</button></div>';
  });
}

function crIcon(scene){const s=(scene||'');if(s.indexOf('教室')>=0||s.indexOf('葉')>=0||s.indexOf('植物')>=0||s.indexOf('樹')>=0)return '🌿';if(s.indexOf('實驗')>=0||s.indexOf('燒杯')>=0)return '⚗️';if(s.indexOf('太陽')>=0||s.indexOf('光')>=0)return '☀️';if(s.indexOf('水')>=0)return '💧';if(s.indexOf('山')>=0)return '⛰️';if(s.indexOf('星')>=0)return '✨';if(s.indexOf('公式')>=0)return '➗';return '📚'}

/* ── AI 播客：選筆記 → 生成口語稿 → 語音合成（Web Speech API）── */
async function crPodcasts(){
  const arr=await crApi('GET','/rest/v1/cr/podcasts')||[];
  const box=document.getElementById('crBody');if(!box)return;
  box.innerHTML='<div style="margin-bottom:10px"><button class="btn teal" onclick="crNotePicker(crPodcastGen)">＋ 從筆記生成 AI 播客</button></div>'+
  (arr.length?'<div style="display:flex;flex-wrap:wrap;gap:10px">'+arr.map(m=>'<div class="panel2" style="flex:1;min-width:220px;cursor:pointer" onclick="crPodcastShow(\''+m.id+'\')">🎧 <b>'+esc(m.title)+'</b><div style="font-size:11px;color:var(--mut)">'+(m.script||'').length+' 字</div></div>').join('')+'</div>':'<p class="empty">還沒有播客。把筆記變成「用聽的」吧！</p>');
}

async function crPodcastGen(noteId){
  const notes=await crApi('GET','/rest/v1/lib/notes')||[];
  const n=notes.find(x=>x.id===noteId);if(!n){toast('找不到筆記','bad');return}
  const content=(n.title||'')+'。'+(n.content||'')+' '+(n.outline||[]).join(' ')+' '+(n.summary||'');
  toast('AI 撰寫播客稿...');
  try{
    const out=await callAI('把以下教材改寫成 2 分鐘的 podcast 口語稿（自然、親切、適合通勤聽）。輸出 JSON：{"title":"集數標題","script":"完整口語稿"}。只輸出 JSON。\n\n教材：\n'+content.slice(0,8000));
    const m=out.match(/\{[\s\S]*\}/);if(!m)throw new Error('no json');
    const j=JSON.parse(m[0]);
    const pod=await crApi('POST','/rest/v1/cr/podcasts',{title:(j.title||n.title),script:(j.script||'')});
    if(pod){toast('播客已生成','ok');crPodcastShow(pod.id)}
  }catch(e){toast('AI 失敗：'+e.message,'bad')}
}

function crPodcastShow(id){
  crApi('GET','/rest/v1/cr/podcasts').then(arr=>{
    const m=(arr||[]).find(x=>x.id===id);if(!m)return;
    $('#view').innerHTML=back('vCreate()')+'<h3 class="vt">🎧 '+esc(m.title)+'</h3>'+
    '<div class="panel2"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">'+
    '<button class="btn teal" onclick="crSpeak()">🔊 播放</button>'+
    '<button class="btn ghost" onclick="speechSynthesis.cancel()">⏹ 停止</button>'+
    '<button class="btn ghost" onclick="crPodcastGen(\''+m.noteId+'\')">🔄 重新生成</button></div>'+
    '<div style="font-size:13.5px;line-height:2;white-space:pre-wrap">'+esc(m.script||'')+'</div></div>';
  });
}

function crSpeak(){
  try{
    const t=document.querySelector('#view .panel2');const txt=(t&&t.textContent)||'';
    const ut=new SpeechSynthesisUtterance(txt);
    ut.lang=langPref()||'zh-TW';ut.rate=1;speechSynthesis.cancel();speechSynthesis.speak(ut);
  }catch(e){toast('語音無法播放','bad')}
}

/* ── 資訊圖：選筆記 → AI 生成摘要視覺化（統計數字 + 重點段落）── */
async function crInfos(){
  const arr=await crApi('GET','/rest/v1/cr/infos')||[];
  const box=document.getElementById('crBody');if(!box)return;
  box.innerHTML='<div style="margin-bottom:10px"><button class="btn teal" onclick="crNotePicker(crInfoGen)">＋ 從筆記生成資訊圖</button></div>'+
  (arr.length?'<div style="display:flex;flex-wrap:wrap;gap:10px">'+arr.map(m=>'<div class="panel2" style="flex:1;min-width:220px;cursor:pointer" onclick="crInfoShow(\''+m.id+'\')">📊 <b>'+esc(m.title)+'</b><div style="font-size:11px;color:var(--mut)">'+(m.sections||[]).length+' 段・'+new Date(m.updatedAt).toLocaleString()+'</div></div>').join('')+'</div>':'<p class="empty">還沒有資訊圖。把筆記變成一眼看懂的視覺摘要吧！</p>');
}

async function crInfoGen(noteId){
  const notes=await crApi('GET','/rest/v1/lib/notes')||[];
  const n=notes.find(x=>x.id===noteId);if(!n){toast('找不到筆記','bad');return}
  const content=(n.title||'')+'。'+(n.content||'')+' '+(n.outline||[]).join(' ')+' '+(n.summary||'');
  toast('AI 製作資訊圖...');
  try{
    const out=await callAI('根據以下教材，製作一頁式資訊圖（infographic）。輸出 JSON：{"title":"標題","hero":"一句話總結（大字）","stats":[{"label":"統計數字標籤","value":"數字或百分比"}...3-4 個],"sections":[{"title":"重點標題","points":["重點1","重點2"]}...3-5 段]}。只輸出 JSON。\n\n教材：\n'+content.slice(0,8000));
    const m=out.match(/\{[\s\S]*\}/);if(!m)throw new Error('no json');
    const j=JSON.parse(m[0]);
    if(!(j.sections&&j.sections.length))throw new Error('empty');
    const info=await crApi('POST','/rest/v1/cr/infos',{title:(j.title||n.title),hero:(j.hero||''),stats:Array.isArray(j.stats)?j.stats:[],sections:j.sections});
    if(info){toast('資訊圖已生成','ok');crInfoShow(info.id)}
  }catch(e){toast('AI 失敗：'+e.message,'bad')}
}

function crInfoShow(id){
  crApi('GET','/rest/v1/cr/infos').then(arr=>{
    const m=(arr||[]).find(x=>x.id===id);if(!m)return;
    const sections=m.sections||[],stats=m.stats||[];
    const colors=['#ffd740','#3d5afe','#00e676','#ff6e40','#e040fb','#00bcd4'];
    $('#view').innerHTML=back('vCreate()')+'<h3 class="vt">📊 '+esc(m.title)+'</h3>'+
    '<div class="panel2" style="border-left:5px solid var(--gold2);background:linear-gradient(135deg,rgba(255,215,64,.08),rgba(61,90,254,.08))">'+
    '<div style="font-size:26px;font-weight:900;font-family:var(--serif);line-height:1.4;text-align:center;padding:10px">'+esc(m.hero||'')+'</div>'+
    (stats.length?'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-top:14px">'+stats.map((s,i)=>'<div class="panel2" style="text-align:center;padding:12px;background:rgba(0,0,0,.18)"><div style="font-size:26px;font-weight:900;color:'+colors[i%6]+'">'+esc(s.value||'')+'</div><div style="font-size:11px;color:var(--mut)">'+esc(s.label||'')+'</div></div>').join('')+'</div>':'')+
    '<div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">'+sections.map((s,i)=>'<div class="panel2" style="border-top:3px solid '+colors[i%6]+'"><b style="color:'+colors[i%6]+'">'+esc(s.title||'')+'</b><ul style="margin:8px 0 0 18px;font-size:13px;line-height:1.8">'+(s.points||[]).map(esc).map(x=>'<li>'+x+'</li>').join('')+'</ul></div>').join('')+'</div></div>'+
    '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn gold" onclick="crInfoGen(\''+m.noteId+'\')">🔄 重新生成</button><button class="btn ghost" onclick="crInfoExport(\''+m.id+'\')">📤 匯出圖片</button><button class="btn ghost" onclick="crInfoDel(\''+m.id+'\')">🗑️ 刪除</button></div>';
  });
}

async function crInfoDel(id){
  const r=await crApi('DELETE','/rest/v1/cr/infos/'+id);
  toast('已刪除','ok');vCreate();
}

function crInfoExport(id){
  const el=document.querySelector('#view .panel2');
  if(!el){toast('請先開啟資訊圖','bad');return}
  try{
    import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js').then(()=>{
      html2canvas(el,{backgroundColor:'#121212',scale:2}).then(canvas=>{
        const a=document.createElement('a');a.download=(id||'infographic')+'.png';a.href=canvas.toDataURL('image/png');a.click();
        toast('已匯出 PNG','ok');
      });
    });
  }catch(e){toast('匯出失敗：'+e.message,'bad')}
}

/* ── 即時轉錄：Web Speech API 語音轉文字 → 存成筆記 ── */
let CR_REC=null,CR_REC_TXT='',CR_REC_FINAL='';
function crLive(){
  const box=document.getElementById('crBody');if(!box)return;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  box.innerHTML='<div class="panel2"><b style="color:var(--teal)">🎙️ 即時轉錄</b> <span style="font-size:12px;color:var(--mut)">說話自動轉文字，結束後可一鍵存成筆記</span>'+
  '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">'+
  '<button class="btn teal" onclick="crRecStart()">▶ 開始錄音</button>'+
  '<button class="btn ghost" onclick="crRecStop()">⏹ 停止</button>'+
  '<button class="btn gold" onclick="crRecSave()">💾 存成筆記</button>'+
  '<button class="btn ghost" onclick="crRecClear()">🗑️ 清除</button></div>'+
  '<div id="crRecStatus" style="margin-top:10px;font-size:12px;color:var(--mut)">尚未開始</div>'+
  '<div id="crRecText" class="panel2" style="margin-top:10px;min-height:120px;white-space:pre-wrap;line-height:1.8;font-size:14px">'+(CR_REC_TXT?esc(CR_REC_TXT):'<span style="color:var(--mut)">轉錄文字會顯示在這裡…</span>')+'</div></div>'+
  (window.SpeechRecognition||window.webkitSpeechRecognition?'':'<div class="panel2" style="margin-top:10px;border-left:4px solid var(--red)">⚠️ 此瀏覽器不支援語音辨識，請改用 Chrome/Edge。</div>');
}

function crRecStart(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){toast('瀏覽器不支援語音辨識','bad');return}
  try{speechSynthesis.cancel();}catch(e){}
  CR_REC_TXT=CR_REC_TXT||'';CR_REC_FINAL='';
  const rec=new SR();
  rec.lang=langPref()||'zh-TW';rec.continuous=true;rec.interimResults=true;
  rec.onresult=e=>{
    let interim='';
    for(let i=e.resultIndex;i<e.results.length;i++){const tr=e.results[i][0].transcript;if(e.results[i].isFinal)CR_REC_FINAL+=tr+' ';else interim+=tr}
    const status=document.getElementById('crRecStatus');
    if(status){status.textContent='🎙️ 錄音中… 已轉錄 '+CR_REC_FINAL.split(' ').length+' 字'+(interim?'：'+interim:'')}
    const box=document.getElementById('crRecText');
    if(box)box.innerHTML=esc(CR_REC_FINAL+interim);
  };
  rec.onerror=e=>{const s=document.getElementById('crRecStatus');if(s)s.textContent='❌ 錯誤：'+e.error;toast('錄音錯誤：'+e.error,'bad')};
  rec.onend=()=>{const s=document.getElementById('crRecStatus');if(s)s.textContent='⏹ 已停止（共轉錄 '+CR_REC_FINAL.split(' ').length+' 字）'};
  CR_REC=rec;rec.start();
  const s=document.getElementById('crRecStatus');if(s)s.textContent='🎙️ 開始錄音…';
}

function crRecStop(){if(CR_REC){try{CR_REC.stop()}catch(e){}CR_REC=null;const s=document.getElementById('crRecStatus');if(s)s.textContent='⏹ 已停止（共轉錄 '+CR_REC_FINAL.split(' ').length+' 字）'}}

function crRecClear(){CR_REC_TXT='';CR_REC_FINAL='';const box=document.getElementById('crRecText');if(box)box.innerHTML='<span style="color:var(--mut)">轉錄文字會顯示在這裡…</span>';const s=document.getElementById('crRecStatus');if(s)s.textContent='已清除'}

async function crRecSave(){
  const txt=(CR_REC_FINAL||'').trim()||(CR_REC_TXT||'').trim();
  if(txt.length<5){toast('沒有可儲存的轉錄內容','bad');return}
  const title=(prompt('筆記標題：',new Date().toLocaleString()+' 轉錄')||'').trim()||'未命名轉錄';
  const r=await crApi('POST','/rest/v1/cr/transcripts',{title:title,text:txt,noteId:''});
  if(r){
    const n=await crApi('POST','/rest/v1/lib/notes',{title:title,sourceType:'audio',content:txt,outline:[],summary:'',definitions:[],tags:['轉錄'],sources:['🎙️ 語音轉錄']});
    if(n){toast('已存成筆記','ok');setTimeout(vNotes,600)}
  }
}

/* ── AI 導師：針對筆記內容問答，對話記錄存 server ── */
async function crTutor(){
  const hist=await crApi('GET','/rest/v1/cr/tutors')||[];
  const box=document.getElementById('crBody');if(!box)return;
  let chatHtml=(hist.length?hist.map(m=>'<div style="max-width:85%"><div style="background:rgba(61,90,254,.2);padding:8px 10px;border-radius:8px 8px 8px 2px">'+esc(m.q)+'</div><div style="background:rgba(0,0,0,.2);padding:8px 10px;border-radius:8px 2px 8px 8px;margin-top:3px">'+esc(m.a)+'</div><div style="font-size:10px;color:var(--mut)">'+new Date(m.t).toLocaleTimeString()+'</div></div>').join(''):'<div style="text-align:center;color:var(--mut);font-size:11px">開始提問吧！</div>');
  box.innerHTML='<div class="panel2"><b>🤖 AI 導師</b> <span style="font-size:12px;color:var(--mut)">針對你的筆記提問，AI 會根據內容回答</span>'+
  '<div style="margin-top:8px"><select id="crTutorNote" class="inp" onchange="crTutorCtx()"><option value="">不指定（自由提問）</option></select></div>'+
  '<div id="crTutorChat" style="max-height:50vh;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin:10px 0;padding:10px;background:rgba(0,0,0,.15);border-radius:8px">'+chatHtml+'</div>'+
  '<div style="display:flex;gap:8px"><input id="crTutorQ" class="inp" placeholder="輸入你的問題..." onkeydown="crTutorEnter(event)"><button class="btn teal" onclick="crTutorAsk()">送出</button></div></div>';
  crApi('GET','/rest/v1/lib/notes').then(notes=>{
    const sel=document.getElementById('crTutorNote');if(!sel)return;
    sel.innerHTML='<option value="">不指定（自由提問）</option>'+(notes||[]).map(n=>'<option value="'+n.id+'">'+esc(n.title)+'</option>').join('');
    const chosen=localStorage.getItem('ADV9_TUTOR_NOTE');if(chosen)sel.value=chosen;
  });
}

function crTutorEnter(ev){if(ev&&ev.key==='Enter')crTutorAsk()}

let crTutorCtxNote='';
function crTutorCtx(){const s=document.getElementById('crTutorNote');crTutorCtxNote=s?s.value:'';try{localStorage.setItem('ADV9_TUTOR_NOTE',crTutorCtxNote)}catch(e){}}

async function crTutorAsk(){
  const q=document.getElementById('crTutorQ').value.trim();if(!q)return;
  const chat=document.getElementById('crTutorChat');if(!chat)return;
  chat.innerHTML+='<div style="max-width:85%;align-self:flex-end;background:rgba(0,230,118,.15);padding:8px 10px;border-radius:8px 8px 2px 8px">'+esc(q)+'</div>';
  document.getElementById('crTutorQ').value='';
  let ctx='';
  if(crTutorCtxNote){
    const notes=await crApi('GET','/rest/v1/lib/notes')||[];
    const n=notes.find(x=>x.id===crTutorCtxNote);
    if(n)ctx=(n.content||'')+' '+(n.outline||[]).join(' ')+' '+(n.summary||'');
  }
  toast('AI 思考中...');
  try{
    const a=await callAI((ctx?'根據以下筆記內容回答問題，引用筆記內容佐證：\n筆記：'+ctx.slice(0,8000)+'\n\n問題：':'請以教學者的口吻回答國中生：')+q,'你是一個親切耐心的 AI 導師，善用比喻與生活例子');
    chat.innerHTML+='<div style="max-width:85%;background:rgba(0,0,0,.25);padding:8px 10px;border-radius:8px 2px 8px 8px;white-space:pre-wrap">'+esc(a)+'</div>';
    crApi('POST','/rest/v1/cr/tutors',{msg:{q:q,a:a}});
    chat.scrollTop=chat.scrollHeight;
  }catch(e){toast('AI 失敗：'+e.message,'bad')}
}