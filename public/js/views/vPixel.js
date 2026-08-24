/* ════════════════════════════════════════════
   vPixel — 像素畫板 v2 (makebead.com 風格)
   256色調色盤・多工具・撤銷重做・PNG匯出・鏡像
   ════════════════════════════════════════════ */
var PX_CHARS='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

var PX={size:32,data:[],pal:[],cur:1,lock:false,tool:'pen',title:'',uid:'',idx:-1,
  showGrid:true,mirror:false,undo:[],redo:[],maxUndo:50};

var PX_256=[
  '#000000','#1d2b53','#7e2553','#008751','#ab5236','#5f574f','#c2c3c7','#fff1e8',
  '#ff004d','#ffa300','#ffec27','#00e436','#29adff','#83769c','#ff77a8','#ffccaa',
  '#291814','#111d35','#422136','#125359','#742f29','#49333b','#a28879','#f3ef7d',
  '#be1250','#ff6c24','#a8e72e','#00b543','#065ab5','#754665','#ff6e59','#ff9b63',
  '#641e34','#1b1126','#2e1a47','#1a3a4a','#4d2c2a','#6d3e1a','#8e6c4a','#c9b458',
  '#d4345a','#e8621c','#b5d334','#1fa046','#1478c8','#6b4e71','#ff8577','#f5b789',
  '#410b20','#0f0a1a','#321e38','#0d2935','#3c2017','#583218','#7a5830','#b39c48',
  '#a02850','#d05020','#90c030','#108038','#1060a8','#584060','#e07060','#e0a070',
  '#200910','#080510','#1a0f20','#071820','#281010','#402010','#604020','#907830',
  '#801840','#b04010','#70a020','#086020','#084880','#403050','#c05848','#c08058',
  '#ffffff','#c0c0c0','#808080','#404040','#202020','#101010','#080808','#000000',
  '#ff0000','#cc0000','#990000','#660000','#330000','#ff3300','#ff6600','#ff9900',
  '#ffcc00','#ffff00','#ccff00','#99ff00','#66ff00','#33ff00','#00ff00','#00ff33',
  '#00ff66','#00ff99','#00ffcc','#00ffff','#00ccff','#0099ff','#0066ff','#0033ff',
  '#0000ff','#3300ff','#6600ff','#9900ff','#cc00ff','#ff00ff','#ff00cc','#ff0099',
  '#ff0066','#ff0033','#ff3333','#ff6633','#ff9933','#ffcc33','#ffff33','#ccff33',
  '#99ff33','#66ff33','#33ff33','#33ff66','#33ff99','#33ffcc','#33ffff','#33ccff',
  '#3399ff','#3366ff','#3333ff','#6633ff','#9933ff','#cc33ff','#ff33ff','#ff33cc',
  '#ff3399','#ff3366','#ff6666','#ff9966','#ffcc66','#ffff66','#ccff66','#99ff66',
  '#66ff66','#66ff99','#66ffcc','#66ffff','#66ccff','#6699ff','#6666ff','#9966ff',
  '#cc66ff','#ff66ff','#ff66cc','#ff6699','#ff9999','#ffcc99','#ffff99','#ccff99',
  '#99ff99','#99ffcc','#99ffff','#99ccff','#9999ff','#cc99ff','#ff99ff','#ff99cc',
  '#ffcccc','#ff99cc','#ff66cc','#ff33cc','#cc33cc','#9933cc','#6633cc','#3333cc',
  '#3366cc','#3399cc','#33cccc','#33ffcc','#66ffcc','#99ffcc','#ccffcc','#ffffff'
];

function _pxKey(){var u='';try{var usr=get(LS.user,{});u=usr.username||usr.id||''}catch(e){return 'pixel_art'}return 'pixel_art'+(u?'_'+u:'')}
function pxArtOf(uid){var all=get(LS.pixels,{});return Array.isArray(all[uid])?all[uid]:[]}
function pxSetArt(uid,arts){var all=get(LS.pixels,{});all[uid]=arts;set(LS.pixels,all)}

function _pxLoadCustomPal(){try{return JSON.parse(localStorage.getItem(_pxKey()+'_pal'))||[]}catch(e){return[]}}
function _pxSaveCustomPal(p){try{localStorage.setItem(_pxKey()+'_pal',JSON.stringify(p))}catch(e){}}

function vPixel(){
  var u=me();if(!u)return toast('請先登入','bad');
  var has=pxArtOf(u.id).length>0;
  $('#view').innerHTML=back()+'<h3 class="vt">🎨 像素畫板 <span class="vsub">256色・多工具・PNG匯出</span></h3>'+
  '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">'+
  '<button class="btn mini" onclick="pxInit('+(PX.size||32)+')">✏️ 畫布</button>'+
  '<button class="btn ghost mini" onclick="pxMy()">🖼 我的畫作（'+has+'）</button>'+
  '<button class="btn ghost mini" onclick="pxGallery()">🌍 公開畫廊</button>'+
  '<button class="btn ghost mini" onclick="pxTemplates()">📋 範本</button></div>'+
  '<div id="pxView" class="panel2" style="min-height:220px"></div>';
  pxInit(PX.size||32);
}

function pxInit(size){
  PX.size=size;PX.data=[];PX.pal=PX_256.slice(0,64);PX.cur=1;PX.tool='pen';PX.idx=-1;
  PX.showGrid=true;PX.mirror=false;PX.undo=[];PX.redo=[];
  var custom=_pxLoadCustomPal();
  custom.forEach(function(c){if(PX.pal.indexOf(c)<0)PX.pal.push(c)});
  for(var i=0;i<size*size;i++)PX.data.push(0);
  PX.title='';
  pxEditor();
}

function pxPushUndo(){
  PX.undo.push(PX.data.slice());
  if(PX.undo.length>PX.maxUndo)PX.undo.shift();
  PX.redo=[];
}

function pxUndo(){
  if(!PX.undo.length)return;
  PX.redo.push(PX.data.slice());
  PX.data=PX.undo.pop();
  pxRender();
}
function pxRedo(){
  if(!PX.redo.length)return;
  PX.undo.push(PX.data.slice());
  PX.data=PX.redo.pop();
  pxRender();
}

function pxEditor(){
  var toolBtns=[
    ['pen','✏️ 筆'],['eraser','🧽 橡皮'],['fill','🪣 填滿'],['picker','💧 取色'],['select','⬚ 選取']
  ].map(function(t){
    return '<button class="btn '+(PX.tool===t[0]?'':'ghost')+' mini" onclick="PX.tool=\''+t[0]+'\';pxEditor()">'+t[1]+'</button>';
  }).join('');

  var palHtml='<div style="display:flex;flex-wrap:wrap;gap:2px;margin-bottom:6px">';
  PX.pal.forEach(function(c,i){
    var border=PX.cur===i?'var(--gold)':'var(--line)';
    var bg=c===''?'repeating-conic-gradient(#333 0 25%,#555 0 50%) 0 0/6px 6px':c;
    palHtml+='<button title="'+(i===0?'透明':i+': '+c)+'" style="width:22px;height:22px;border-radius:4px;border:2px solid '+border+';background:'+bg+';cursor:pointer;flex-shrink:0" onclick="PX.cur='+i+';pxEditor()"></button>';
  });
  palHtml+='</div>';

  var h='<div style="display:flex;gap:12px;flex-wrap:wrap">';
  h+='<div style="flex:3;min-width:320px">';

  // Top bar
  h+='<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:8px">';
  h+='<b style="color:var(--gold2);font-size:13px">尺寸</b>';
  [16,24,32,48,64,96,128].forEach(function(s){
    h+='<button class="btn '+(PX.size===s?'':'ghost')+' mini" onclick="pxResize('+s+')" style="font-size:11px">'+s+'×'+s+'</button>';
  });
  h+='<span style="margin-left:auto;font-size:11px;color:var(--mut)">'+PX.size+'×'+PX.size+'</span></div>';

  // Canvas
  h+='<div style="border:1px solid var(--line);border-radius:8px;overflow:auto;max-height:80vh;background:#0a0f1c;display:inline-block;position:relative">';
  h+='<canvas id="pxCv" width="'+PX.size+'" height="'+PX.size+'" style="width:480px;height:480px;image-rendering:pixelated;cursor:crosshair;display:block" onmousedown="pxClick(event)" onmousemove="pxDrag(event)" onmouseup="PX.lock=false" onmouseleave="PX.lock=false"></canvas>';
  h+='</div>';

  // Bottom bar
  h+='<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">';
  h+='<button class="btn ghost mini" onclick="pxUndo()" title="Ctrl+Z">↩️ 撤銷</button>';
  h+='<button class="btn ghost mini" onclick="pxRedo()" title="Ctrl+Y">↪️ 重做</button>';
  h+='<button class="btn ghost mini" onclick="PX.showGrid=!PX.showGrid;pxRender()" style="'+(PX.showGrid?'color:var(--gold)':'')+'">⊞ 網格</button>';
  h+='<button class="btn ghost mini" onclick="PX.mirror=!PX.mirror;pxRender()" style="'+(PX.mirror?'color:var(--gold)':'')+'">↔ 鏡像</button>';
  h+='<button class="btn ghost mini" onclick="pxExportPNG()">📷 匯出PNG</button>';
  h+='<button class="btn ghost mini" onclick="if(confirm(\'確定清空？\')){pxPushUndo();PX.data=[];for(var i=0;i<PX.size*PX.size;i++)PX.data.push(0);pxRender()}">🧹 清空</button>';
  h+='</div></div>';

  // Right panel
  h+='<div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:8px">';

  // Tools
  h+='<div style="display:flex;gap:4px;flex-wrap:wrap">'+toolBtns+'</div>';

  // Palette
  h+='<div style="font-size:12px;color:var(--mut);margin-bottom:2px"><b>調色盤</b></div>';
  h+=palHtml;

  // Custom color
  h+='<div style="display:flex;gap:4px;align-items:center">';
  h+='<input type="color" id="pxColorPick" value="#ff5722" style="width:32px;height:26px;border:none;cursor:pointer">';
  h+='<button class="btn ghost mini" onclick="var c=document.getElementById(\'pxColorPick\').value;PX.pal.push(c);PX.cur=PX.pal.length-1;_pxSaveCustomPal(PX.pal);pxEditor()">+ 加入調色盤</button>';
  h+='</div>';

  // Palette presets
  h+='<div style="font-size:11px;color:var(--mut)">';
  h+='<b>預設 palette：</b> ';
  ['Default64','GameBoy','PICO-8','Sweetie16'].forEach(function(name){
    h+='<button class="btn ghost mini" onclick="pxLoadPalette(\''+name+'\')" style="font-size:10px">'+name+'</button> ';
  });
  h+='</div>';

  // Title
  h+='<label style="font-size:12px;color:var(--mut)">📝 標題：<input id="pxTitle" value="'+esc(PX.title)+'" maxlength="30" style="width:100%;padding:6px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt)"></label>';

  // Save
  h+='<button class="btn big" onclick="pxSave()">💾 儲存畫作</button>';
  if(PX.idx>=0)h+='<button class="btn ghost mini" onclick="pxToggle()">🔁 切換公開/私人</button>';

  h+='</div></div>';
  $('#pxView').innerHTML=h;
  pxRender();
}

function pxRender(){
  var cv=document.getElementById('pxCv');if(!cv)return;
  var ctx=cv.getContext('2d');
  var img=ctx.createImageData(PX.size,PX.size);
  for(var i=0;i<PX.data.length;i++){
    var c=PX.pal[PX.data[i]]||'';
    var hex=c.indexOf('#')===0?c:'#000000';
    img.data[i*4]=parseInt(hex.slice(1,3),16)||0;
    img.data[i*4+1]=parseInt(hex.slice(3,5),16)||0;
    img.data[i*4+2]=parseInt(hex.slice(5,7),16)||0;
    img.data[i*4+3]=PX.data[i]===0?0:255;
  }
  ctx.putImageData(img,0,0);

  // Grid
  if(PX.showGrid&&PX.size<=128){
    var cv=document.getElementById('pxCv');
    var cw=cv?cv.width:480;
    var ch=cv?cv.height:480;
    var cellW=cw/PX.size;
    var cellH=ch/PX.size;
    ctx.strokeStyle='rgba(255,255,255,0.15)';
    ctx.lineWidth=0.5;
    for(var x=0;x<=PX.size;x++){var px=Math.round(x*cellW);ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px,ch);ctx.stroke()}
    for(var y=0;y<=PX.size;y++){var py=Math.round(y*cellH);ctx.beginPath();ctx.moveTo(0,py);ctx.lineTo(cw,py);ctx.stroke()}
  }
}

function pxCellAt(e){
  var cv=document.getElementById('pxCv');if(!cv)return-1;
  var r=cv.getBoundingClientRect();
  var x=Math.floor((e.clientX-r.left)/r.width*PX.size);
  var y=Math.floor((e.clientY-r.top)/r.height*PX.size);
  if(x<0||y<0||x>=PX.size||y>=PX.size)return-1;
  return y*PX.size+x;
}

function pxSetCell(i,val){
  if(i<0||i>=PX.data.length)return;
  PX.data[i]=val;
  if(PX.mirror){
    var x=i%PX.size,y=Math.floor(i/PX.size);
    var mx=PX.size-1-x;
    if(mx!==x)PX.data[y*PX.size+mx]=val;
  }
}

function pxClick(e){
  var i=pxCellAt(e);if(i<0)return;
  pxPushUndo();
  PX.lock=true;
  if(PX.tool==='fill'){pxFill(i,PX.data[i],PX.cur)}
  else if(PX.tool==='picker'){
    PX.cur=PX.data[i];PX.tool='pen';pxEditor();return;
  }
  else if(PX.tool==='eraser'){pxSetCell(i,0)}
  else{pxSetCell(i,PX.cur)}
  pxRender();
}

function pxDrag(e){
  if(!PX.lock)return;
  var i=pxCellAt(e);if(i<0)return;
  if(PX.tool==='pen'){pxSetCell(i,PX.cur);pxRender()}
  else if(PX.tool==='eraser'){pxSetCell(i,0);pxRender()}
}

function pxFill(i,target,repl){
  if(target===repl||PX.data[i]!==target)return;
  var s=PX.size,stack=[i];
  while(stack.length){
    var j=stack.pop();
    if(PX.data[j]!==target)continue;
    PX.data[j]=repl;
    var x=j%s,y=Math.floor(j/s);
    if(x>0)stack.push(j-1);if(x<s-1)stack.push(j+1);
    if(y>0)stack.push(j-s);if(y<s-1)stack.push(j+s);
  }
}

function pxResize(newSize){
  if(newSize===PX.size)return;
  if(PX.data.some(function(v){return v!==0})){
    if(!confirm('改變尺寸會清空畫布，確定？'))return;
  }
  pxInit(newSize);
}

function pxLoadPalette(name){
  var palettes={
    'Default64':PX_256.slice(0,64),
    'GameBoy':['#0f380f','#306230','#8bac0f','#9bbc0f'],
    'PICO-8':['#000000','#1d2b53','#7e2553','#008751','#ab5236','#5f574f','#c2c3c7','#fff1e8','#ff004d','#ffa300','#ffec27','#00e436','#29adff','#83769c','#ff77a8','#ffccaa'],
    'Sweetie16':['#1a1c2c','#5d275d','#b13e53','#ef7d57','#ffcd75','#a7f070','#38b764','#257179','#29366f','#3b5dc9','#41a6f6','#73eff7','#f4f4f4','#94b0c2','#566c86','#333c57']
  };
  PX.pal=palettes[name]||PX_256.slice(0,64);
  PX.cur=1;
  pxEditor();
}

function pxExportPNG(){
  var cv=document.getElementById('pxCv');if(!cv)return;
  var exp=document.createElement('canvas');
  exp.width=PX.size;exp.height=PX.size;
  var ctx=exp.getContext('2d');
  var img=ctx.createImageData(PX.size,PX.size);
  for(var i=0;i<PX.data.length;i++){
    var c=PX.pal[PX.data[i]]||'';
    var hex=c.indexOf('#')===0?c:'#000000';
    img.data[i*4]=parseInt(hex.slice(1,3),16)||0;
    img.data[i*4+1]=parseInt(hex.slice(3,5),16)||0;
    img.data[i*4+2]=parseInt(hex.slice(5,7),16)||0;
    img.data[i*4+3]=PX.data[i]===0?0:255;
  }
  ctx.putImageData(img,0,0);
  var link=document.createElement('a');
  link.download=(PX.title||'pixel_art')+'.png';
  link.href=exp.toDataURL('image/png');
  link.click();
  toast('📷 PNG 已匯出！');
}

function pxSave(){
  var u=me();if(!u||!u.id)return toast('請先登入','bad');
  var title=((document.getElementById('pxTitle')||{}).value||'').trim()||'未命名畫作';
  var arts=pxArtOf(u.id);
  if(arts.length>=20)return toast('畫作數量已達上限（20 張），請先刪除舊作','bad');
  var data='';
  for(var i=0;i<PX.data.length;i++){
    var v=PX.data[i]||0;
    data+=(v<10?String(v):PX_CHARS[v]||'0');
  }
  var art={id:Date.now().toString(36),title:title.slice(0,30),size:PX.size,pal:PX.pal.slice(0,64),data:data,open:PX.idx>=0?arts[PX.idx].open:true,likes:{},ts:Date.now(),uid:u.id};
  if(PX.idx>=0){arts[PX.idx]=art}else{arts.unshift(art)}
  pxSetArt(u.id,arts);
  PX.idx=-1;
  toast('💾 畫作已儲存'+(art.open?'並公開分享！':'（私人）'));
  pxMy();
}

function pxMy(){
  var u=me();if(!u)return;
  var arts=pxArtOf(u.id);
  $('#pxView').innerHTML=arts.length?'<div class="pxGrid">'+arts.map(function(a,i){return pxCard(a,i,true)}).join('')+'</div>':'<div class="panel2" style="text-align:center;padding:40px;color:var(--mut)">🖼 還沒有畫作，先去畫一張吧！</div>';
  pxPaintAll();
}

function pxGallery(){
  var all=get(LS.pixels,{});
  var out=[];
  Object.keys(all).forEach(function(uid){(all[uid]||[]).forEach(function(a){if(a.open)out.push({uid:uid,a:a})})});
  out.sort(function(x,y){return y.a.ts-x.a.ts});
  if(out.length>200)out=out.slice(0,200);
  $('#pxView').innerHTML=out.length?'<div class="pxGrid">'+out.map(function(x){return pxCard(x.a,x.a.id,false)}).join('')+'</div>':'<div class="panel2" style="text-align:center;padding:40px;color:var(--mut)">🌍 尚無公開畫作</div>';
  pxPaintAll();
}

function pxCard(a,idx,mine){
  var u=me();
  var likes=Object.keys(a.likes||{}).length;
  var author=(get(LS.users,[]).find(function(x){return x.id===a.uid})||{}).name||a.uid;
  return '<div class="panel2" style="margin:0;padding:10px">'+
  '<canvas width="'+a.size+'" height="'+a.size+'" style="width:100%;image-rendering:pixelated;border-radius:6px;cursor:zoom-in" data-px="'+encodeURIComponent(JSON.stringify({pal:a.pal,data:a.data,size:a.size}))+'" onclick="pxZoom(\''+a.id+'\')"></canvas>'+
  '<div style="display:flex;align-items:center;gap:6px;margin-top:6px"><b style="font-size:12.5px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(a.title)+'</b><span style="font-size:10.5px;color:var(--mut)">'+a.size+'×'+a.size+'</span></div>'+
  '<div style="font-size:11px;color:var(--mut)">👤 '+esc(author)+'</div>'+
  '<div style="display:flex;gap:6px;margin-top:6px;align-items:center">'+
  '<button class="btn ghost mini" onclick="pxLike(\''+a.id+'\')">'+(u&&a.likes&&a.likes[u.id]?'❤️':'🤍')+' '+likes+'</button>'+
  (mine?'<button class="btn ghost mini" onclick="PX.idx='+idx+';pxToggle()">'+(a.open?'🌍 公開':'🔒 私人')+'</button><button class="btn ghost mini" onclick="PX.idx='+idx+';pxDel()">🗑</button>':'')+
  '<button class="btn ghost mini" onclick="pxLoadArt(\''+a.id+'\')">📝 載入</button>'+
  '</div></div>';
}

function pxLoadArt(id){
  var all=get(LS.pixels,{});
  var art=null;
  Object.keys(all).forEach(function(uid){(all[uid]||[]).forEach(function(a){if(a.id===id)art=a})});
  if(!art)return toast('找不到畫作','bad');
  PX.size=art.size;PX.data=[];PX.pal=art.pal||PX_256.slice(0,64);PX.title=art.title||'';PX.tool='pen';PX.idx=-1;
  PX.showGrid=true;PX.mirror=false;PX.undo=[];PX.redo=[];
  for(var i=0;i<art.data.length;i++){
    var ch=art.data[i]||'0';
    var v=parseInt(ch);if(isNaN(v))v=PX_CHARS.indexOf(ch);
    PX.data.push(v>=0?v:0);
  }
  pxEditor();
  toast('📝 畫作已載入');
}

function pxPaintAll(){
  document.querySelectorAll('canvas[data-px]').forEach(function(cv){
    try{
      var o=JSON.parse(decodeURIComponent(cv.getAttribute('data-px')));
      var ctx=cv.getContext('2d');var img=ctx.createImageData(o.size,o.size);
      for(var i=0;i<o.data.length;i++){
        var ch=o.data[i]||'0';
        var v=parseInt(ch);if(isNaN(v))v=PX_CHARS.indexOf(ch);
        var c=o.pal[v]||'';var hex=c.indexOf('#')===0?c:'#000000';
        img.data[i*4]=parseInt(hex.slice(1,3),16)||0;img.data[i*4+1]=parseInt(hex.slice(3,5),16)||0;img.data[i*4+2]=parseInt(hex.slice(5,7),16)||0;img.data[i*4+3]=v===0?0:255;
      }
      ctx.putImageData(img,0,0);
    }catch(e){}
  });
}

function pxZoom(id){
  var all=get(LS.pixels,{});
  var art=null;
  Object.keys(all).forEach(function(uid){(all[uid]||[]).forEach(function(a){if(a.id===id)art=a})});
  if(!art)return toast('找不到畫作','bad');
  var px=art.size;
  var cell=px<=32?14:(px<=64?9:(px<=128?5:3));
  openModal('<div style="text-align:center"><h4 style="margin:0 0 8px;color:var(--gold2)">🖼 '+esc(art.title||'未命名畫作')+'</h4>'+
  '<canvas id="zoomCv" width="'+px+'" height="'+px+'" style="width:'+(px*cell)+'px;max-width:92vw;image-rendering:pixelated;border:1px solid var(--line);border-radius:8px;background:#0a0f1c"></canvas>'+
  '<div style="margin-top:8px;font-size:11.5px;color:var(--mut)">'+px+'×'+px+'</div>'+
  '<button class="btn ghost mini" style="margin-top:8px" onclick="document.getElementById(\'modal\').style.display=\'none\'">關閉</button></div>');
  var cv=document.getElementById('zoomCv');
  var ctx=cv.getContext('2d');
  var img=ctx.createImageData(px,px);
  for(var i=0;i<art.data.length;i++){
    var ch=art.data[i]||'0';
    var v=parseInt(ch);if(isNaN(v))v=PX_CHARS.indexOf(ch);
    var c=art.pal[v]||'';var hex=c.indexOf('#')===0?c:'#000000';
    img.data[i*4]=parseInt(hex.slice(1,3),16)||0;img.data[i*4+1]=parseInt(hex.slice(3,5),16)||0;img.data[i*4+2]=parseInt(hex.slice(5,7),16)||0;img.data[i*4+3]=v===0?0:255;
  }
  ctx.putImageData(img,0,0);
}

function pxLike(id){
  var u=me();if(!u)return toast('請先登入','bad');
  var all=get(LS.pixels,{});
  Object.keys(all).forEach(function(uid){
    (all[uid]||[]).forEach(function(a){
      if(a.id===id){a.likes=a.likes||{};if(a.likes[u.id])delete a.likes[u.id];else a.likes[u.id]=1}
    });
  });
  set(LS.pixels,all);
  pxGallery();pxPaintAll();
}

function pxToggle(){
  var u=me();if(!u)return;
  var arts=pxArtOf(u.id);var a=arts&&arts[PX.idx];
  if(!a)return;
  a.open=!a.open;
  pxSetArt(u.id,arts);
  toast(a.open?'🌍 已公開分享':'🔒 已設為私人');
  pxMy();pxPaintAll();
}

function pxDel(){
  var u=me();if(!u)return;
  var arts=pxArtOf(u.id);var a=arts&&arts[PX.idx];
  if(!a)return;
  arts.splice(PX.idx,1);
  pxSetArt(u.id,arts);
  PX.idx=-1;
  toast('🗑 已刪除');pxMy();pxPaintAll();
}

function pxTemplates(){
  var templates=[
    {name:'空白 16×16',size:16},
    {name:'空白 32×32',size:32},
    {name:'空白 64×64',size:64}
  ];
  var h='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">';
  templates.forEach(function(t){
    h+='<button class="btn" onclick="pxInit('+t.size+')">'+t.name+'</button>';
  });
  h+='</div>';
  h+='<div style="font-size:12px;color:var(--mut)">選擇尺寸開始繪畫，或從「我的畫作」載入已有作品。</div>';
  $('#pxView').innerHTML=h;
}

document.addEventListener('keydown',function(e){
  if(!document.getElementById('pxCv'))return;
  if(e.ctrlKey&&e.key==='z'){e.preventDefault();pxUndo()}
  if(e.ctrlKey&&e.key==='y'){e.preventDefault();pxRedo()}
});
