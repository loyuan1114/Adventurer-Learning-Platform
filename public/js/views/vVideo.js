/* ════════════════════════════════════════════
   vVideo 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   🎬 創作分享・影片（v4.1）：上傳 ≤5 分鐘 mp4/webm，像 YT 發影片
   ════════════════════════════════════════════ */
const VD_MAX_SEC=300; /* 5 分鐘 */
const VD_MAX_MB=60;
function vdAll(){const v=get(LS.videos,{});return Array.isArray(v)?v:[]}
function vdSave(v){set(LS.videos,v)}

function vVideo(){
  const u=me();if(!u)return toast('請先登入','bad');
  $('#view').innerHTML=back()+'<h3 class="vt">🎬 創作影片 <span class="vsub">像 YT 發影片・最長 5 分鐘</span></h3>'+
  '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">'+
  '<button class="btn mini" onclick="vdUploadUi()">📤 上傳影片</button>'+
  '<button class="btn ghost mini" onclick="vdMy()">🎞 我的影片</button>'+
  '<button class="btn ghost mini" onclick="vdGallery()">🌍 全部影片</button></div>'+
  '<div id="vdView" class="panel2" style="min-height:220px"></div>';
  vdGallery();
}

function vdUploadUi(){
  const u=me();if(!u)return;
  $('#vdView').innerHTML=
  '<div style="border:2px dashed var(--line);border-radius:10px;padding:30px;text-align:center">'+
  '<div style="font-size:44px">🎥</div>'+
  '<p style="font-size:13.5px;color:var(--mut);margin:8px 0 14px">選擇 mp4 / webm 影片（最長 <b style="color:var(--gold2)">5 分鐘</b>，最大 <b style="color:var(--gold2)">60MB</b>）</p>'+
  '<input type="file" id="vdFile" accept="video/mp4,video/webm" style="display:none" onchange="vdCheckFile(this)">'+
  '<button class="btn big" onclick="document.getElementById(\'vdFile\').click()">📁 選擇影片</button></div>'+
  '<div id="vdUpInfo" style="margin-top:10px;font-size:12.5px;color:var(--mut)"></div>';
}

function vdCheckFile(inp){
  const u=me();if(!u)return toast('請先登入','bad');
  const f=inp.files&&inp.files[0];if(!f)return;
  const box=$('#vdUpInfo');if(!box)return;
  if(f.size>VD_MAX_MB*1024*1024){toast('⚠️ 檔案超過 '+VD_MAX_MB+'MB，無法上傳','bad');return}
  box.innerHTML='<span style="color:var(--gold2)">📄 '+esc(f.name)+'（'+(f.size/1024/1024).toFixed(1)+' MB）檢查時長…</span>';
  const url=URL.createObjectURL(f);
  const v=document.createElement('video');
  v.preload='metadata';v.src=url;
  v.onloadedmetadata=()=>{
    const sec=v.duration;
    URL.revokeObjectURL(url);
    if(!isFinite(sec)||sec<=0){box.innerHTML='<span style="color:var(--red)">❌ 無法讀取影片資訊</span>';return}
    if(sec>VD_MAX_SEC){box.innerHTML='<span style="color:var(--red)">❌ 影片長 '+Math.round(sec)+' 秒，超過 5 分鐘（300 秒）限制</span>';return}
    box.innerHTML='<span style="color:var(--green)">✅ 時長 '+Math.round(sec)+' 秒（'+(sec/60).toFixed(1)+' 分），符合限制</span>'+
    '<div style="margin-top:8px"><label style="font-size:12px;color:var(--mut)">📝 標題：<input id="vdTitle" maxlength="40" value="'+esc(f.name.replace(/\.[^.]+$/,'').slice(0,40))+'" style="width:100%;padding:6px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt)"></label></div>'+
    '<button class="btn big" style="margin-top:10px" onclick="vdUpload(this)">🚀 上傳分享</button>';
  };
  v.onerror=()=>{URL.revokeObjectURL(url);box.innerHTML='<span style="color:var(--red)">❌ 無法讀取影片資訊（格式不支援？）</span>'};
}

async function vdUpload(btn){
  const u=me();if(!u)return;
  const inp=document.getElementById('vdFile');
  const f=inp&&inp.files&&inp.files[0];if(!f)return toast('請重新選擇影片','bad');
  const title=((document.getElementById('vdTitle')||{}).value||'').trim()||'未命名影片';
  const ext=f.name.match(/\.(mp4|webm)$/i);const e=(ext&&ext[1].toLowerCase())||'mp4';
  const name='v_'+u.id+'_'+Date.now().toString(36)+'.'+e;
  btn.disabled=true;btn.textContent='⏳ 上傳中…';
  try{
    const h=supaHeaders();delete h['Content-Type'];
    const r=await fetch(SUPA_URL+'/storage/v1/object/public/media/'+name,{method:'POST',headers:h,body:f});
    if(!r.ok)throw Error('HTTP '+r.status);
    const all=vdAll();
    const item={id:Date.now().toString(36),uid:u.id,title:title.slice(0,40),url:'media/'+name,open:true,ts:Date.now(),likes:{}};
    all.unshift(item);vdSave(all);
    toast('🎬 影片已上傳並公開！');
    vdGallery();
  }catch(err){
    btn.disabled=false;btn.textContent='🚀 上傳分享';
    toast('❌ 上傳失敗（'+err.message+'）','bad');
  }
}

function vdMy(){
  const u=me();if(!u)return;
  const mine=vdAll().filter(v=>v.uid===u.id);
  $('#vdView').innerHTML=mine.length?'<div class="pxGrid">'+mine.map(v=>vdCard(v,true)).join('')+'</div>':'<div class="panel2" style="text-align:center;padding:40px;color:var(--mut)">🎬 還沒有影片，點「📤 上傳影片」發佈第一部吧！</div>';
}

function vdGallery(){
  let out=vdAll().filter(v=>v.open).sort((a,b)=>b.ts-a.ts);
  if(out.length>100)out=out.slice(0,100);
  $('#vdView').innerHTML=out.length?'<div class="pxGrid">'+out.map(v=>vdCard(v,false)).join('')+'</div>':'<div class="panel2" style="text-align:center;padding:40px;color:var(--mut)">🌍 尚無公開影片，來當第一個創作者吧！</div>';
}

function vdCard(v,mine){
  const u=me();
  const likes=Object.keys(v.likes||{}).length;
  const author=(get(LS.users,[]).find(x=>x.id===v.uid)||{}).name||v.uid;
  const dur=(v.url)&&(vdDurCache(v.id))||'';
  return '<div class="panel2" style="margin:0;padding:10px">'+
  '<div onclick="vdPlay(\''+v.id+'\')" style="cursor:pointer;position:relative;border-radius:6px;overflow:hidden;background:#0a0f1c;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center">'+
  '<span style="font-size:38px">🎬</span>'+
  '<span style="position:absolute;bottom:6px;right:8px;background:rgba(0,0,0,.7);color:#fff;font-size:10.5px;padding:2px 6px;border-radius:4px">'+(dur||'▶ 播放')+'</span></div>'+
  '<div style="display:flex;align-items:center;gap:6px;margin-top:6px"><b style="font-size:12.5px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(v.title)+'</b>'+
  (v.open?'<span style="font-size:10px;color:var(--green);border:1px solid var(--green);border-radius:6px;padding:0 5px">🌍</span>':'<span style="font-size:10px;color:var(--mut);border:1px solid var(--line);border-radius:6px;padding:0 5px">🔒</span>')+'</div>'+
  '<div style="font-size:11px;color:var(--mut)">👤 '+esc(author)+'</div>'+
  '<div style="display:flex;gap:6px;margin-top:6px;align-items:center">'+
  '<button class="btn ghost mini" onclick="vdLike(\''+v.id+'\')">'+(u&&v.likes&&v.likes[u.id]?'❤️':'🤍')+' '+likes+'</button>'+
  '<button class="btn ghost mini" onclick="vdPlay(\''+v.id+'\')">▶ 播放</button>'+
  (mine?'<button class="btn ghost mini" onclick="vdToggle(\''+v.id+'\')">'+(v.open?'🔒 改私人':'🌍 改公開')+'</button><button class="btn ghost mini" onclick="vdDel(\''+v.id+'\')">🗑</button>':'')+
  '</div></div>';
}

function vdDurCache(id){const v=vdAll().find(x=>x.id===id);return v&&v._dur||''}

function vdPlay(id){
  const v=vdAll().find(x=>x.id===id);if(!v)return;
  const author=(get(LS.users,[]).find(x=>x.id===v.uid)||{}).name||v.uid;
  openModal('<div style="max-width:760px;width:100%"><h4 style="margin:0 0 8px;color:var(--gold2)">▶ '+esc(v.title)+'</h4>'+
  '<div style="font-size:11.5px;color:var(--mut);margin-bottom:8px">👤 '+esc(author)+'｜'+fmt(v.ts)+'</div>'+
  '<video src="'+(SUPA_URL+'/storage/v1/object/public/'+v.url)+'" controls autoplay style="width:100%;border-radius:8px;background:#000;max-height:60vh"></video></div>');
}

function vdLike(id){
  const u=me();if(!u)return toast('請先登入','bad');
  const all=vdAll();
  const v=all.find(x=>x.id===id);if(!v)return;
  v.likes=v.likes||{};if(v.likes[u.id])delete v.likes[u.id];else v.likes[u.id]=1;
  vdSave(all);vdGallery();
}

function vdToggle(id){
  const u=me();if(!u)return;
  const all=vdAll();const v=all.find(x=>x.id===id);
  if(!v||v.uid!==u.id)return;
  v.open=!v.open;vdSave(all);
  toast(v.open?'🌍 已公開':'🔒 已設為私人');vdMy();
}

function vdDel(id){
  const u=me();if(!u)return;
  const all=vdAll();const v=all.find(x=>x.id===id);
  if(!v||v.uid!==u.id)return;
  if(!confirm('刪除這部影片？'))return;
  try{
    const h=supaHeaders();delete h['Content-Type'];
    fetch(SUPA_URL+'/storage/v1/object/public/'+v.url,{method:'DELETE',headers:h}).catch(()=>{});
  }catch(e){}
  vdSave(all.filter(x=>x.id!==id));
  toast('🗑 已刪除');vdMy();
}
