/* ════════════════════════════════════════════
   vTerminal 虛擬終端機（splitall.py 自動拆分，懶載入）
   真實終端機外觀 + AI 回覆
   ════════════════════════════════════════════ */
function vTerminal(){
var u=me();
$('#view').innerHTML=back()+
'<h3 class="vt">💻 虛擬終端機 <span class="vsub">AI 驅動・模擬真實指令列</span></h3>'+
'<div id="termWrap" style="position:relative;border-radius:10px;overflow:hidden;border:2px solid #333;box-shadow:0 8px 32px rgba(0,0,0,.6)">'+
/* ── 標題列（仿終端機標題列）── */
'<div style="background:#2d2d2d;padding:8px 14px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #444">'+
'<div style="width:12px;height:12px;border-radius:50%;background:#ff5f56"></div>'+
'<div style="width:12px;height:12px;border-radius:50%;background:#ffbd2e"></div>'+
'<div style="width:12px;height:12px;border-radius:50%;background:#27c93f"></div>'+
'<span style="flex:1;text-align:center;font-size:12px;color:#888;font-family:monospace">adv9@'+location.hostname+' ~ </span>'+
'</div>'+
/* ── 終端機主體 ── */
'<div id="termBox" style="background:#1a1a2e;padding:16px;min-height:420px;max-height:62vh;overflow-y:auto;font-family:\'Cascadia Code\',\'Fira Code\',\'Source Code Pro\',\'Consolas\',\'Courier New\',monospace;font-size:13.5px;line-height:1.65;color:#e0e0e0;white-space:pre-wrap;word-break:break-all;cursor:text" onclick="document.getElementById(\'termInput\').focus()"></div>'+
/* ── 輸入列 ── */
'<div style="background:#1a1a2e;padding:0 16px 14px;display:flex;gap:0;align-items:center;border-top:1px solid #333">'+
'<span style="color:#27c93f;font-weight:700;font-family:inherit;white-space:nowrap;user-select:none"><span style="color:#61afef">'+(u?u.username:'user')+'</span><span style="color:#abb2bf">@</span><span style="color:#c678dd">adv9</span> <span style="color:#e06c75">~</span> <span style="color:#27c93f">$</span> </span>'+
'<input id="termInput" style="flex:1;padding:6px 0;background:transparent;border:none;color:#e0e0e0;font-family:inherit;font-size:13.5px;outline:none;caret-color:#27c93f" autofocus>'+
'</div>'+
'</div>';
var box=$('#termBox');
termPrintRaw('<span style="color:#c678dd">Adv9 Terminal</span> <span style="color:#61afef">v5.0.0</span> — 虛擬終端機（AI 驅動）');
termPrintRaw('<span style="color:#5c6370">Last login: '+new Date().toLocaleString('en-US',{weekday:'short',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})+' on ttys000</span>');
termPrintRaw('');
var input=$('#termInput');
input.addEventListener('keydown',function(e){
  if(e.key==='Enter'){e.preventDefault();termExec()}
  if(e.key==='ArrowUp'){e.preventDefault();termHistNav(-1)}
  if(e.key==='ArrowDown'){e.preventDefault();termHistNav(1)}
  if(e.key==='l'&&e.ctrlKey){e.preventDefault();var b=$('#termBox');if(b)b.innerHTML=''}
  if(e.key==='c'&&e.ctrlKey){e.preventDefault();termPrintRaw('<span style="color:#abb2bf">^C</span>');input.value=''}
});
input.focus();
}

var _termHist=[];
var _termHistIdx=-1;

function termPrintRaw(html){
var box=$('#termBox');if(!box)return;
var div=document.createElement('div');
div.innerHTML=html;
box.appendChild(div);
box.scrollTop=box.scrollHeight;
}

function termPrompt(){
var u=me();
return '<span style="color:#61afef">'+(u?u.username:'user')+'</span><span style="color:#abb2bf">@</span><span style="color:#c678dd">adv9</span> <span style="color:#e06c75">~</span> <span style="color:#27c93f">$</span> ';
}

function termHistNav(dir){
var input=$('#termInput');if(!input)return;
if(dir===-1&&_termHistIdx>0){_termHistIdx--;input.value=_termHist[_termHistIdx]||''}
if(dir===1){_termHistIdx++;input.value=_termHistIdx>=_termHist.length?'':_termHist[_termHistIdx]||''}
}

async function termExec(){
var input=$('#termInput');if(!input)return;
var cmd=input.value.trim();
input.value='';
if(!cmd)return;
_termHist.push(cmd);
_termHistIdx=_termHist.length;
termPrintRaw(termPrompt()+'<span style="color:#e0e0e0">'+escHtml(cmd)+'</span>');

/* clear */
if(cmd==='clear'||cmd==='cls'){
var b=$('#termBox');if(b)b.innerHTML='';
return}

/* help */
if(cmd==='help'||cmd==='man'){
termPrintRaw('<span style="color:#e5c07b">Adv9 Terminal 使用說明</span>');
termPrintRaw('<span style="color:#5c6370">─────────────────────────────────────────</span>');
termPrintRaw('<span style="color:#27c93f">help</span>          <span style="color:#abb2bf">顯示此說明</span>');
termPrintRaw('<span style="color:#27c93f">date</span>          <span style="color:#abb2bf">顯示目前日期時間</span>');
termPrintRaw('<span style="color:#27c93f">whoami</span>        <span style="color:#abb2bf">顯示使用者資訊</span>');
termPrintRaw('<span style="color:#27c93f">uname -a</span>      <span style="color:#abb2bf">系統資訊</span>');
termPrintRaw('<span style="color:#27c93f">ls</span>            <span style="color:#abb2bf">列出檔案</span>');
termPrintRaw('<span style="color:#27c93f">cat [檔]</span>      <span style="color:#abb2bf">顯示檔案內容</span>');
termPrintRaw('<span style="color:#27c93f">echo [字串]</span>   <span style="color:#abb2bf">印出文字</span>');
termPrintRaw('<span style="color:#27c93f">pwd</span>           <span style="color:#abb2bf">顯示工作目錄</span>');
termPrintRaw('<span style="color:#27c93f">cd [路徑]</span>     <span style="color:#abb2bf">切換目錄</span>');
termPrintRaw('<span style="color:#27c93f">stats</span>         <span style="color:#abb2bf">玩家統計</span>');
termPrintRaw('<span style="color:#27c93f">exam</span>          <span style="color:#abb2bf">會考日期</span>');
termPrintRaw('<span style="color:#27c93f">quiz</span>          <span style="color:#abb2bf">AI 出題</span>');
termPrintRaw('<span style="color:#27c93f">joke</span>          <span style="color:#abb2bf">AI 笑話</span>');
termPrintRaw('<span style="color:#27c93f">sudo [cmd]</span>    <span style="color:#abb2bf">以管理員執行（AI 模擬）</span>');
termPrintRaw('<span style="color:#5c6370">─────────────────────────────────────────</span>');
termPrintRaw('<span style="color:#5c6370">Ctrl+L 清除畫面 | Ctrl+C 中斷 | ↑↓ 歷史紀錄</span>');
termPrintRaw('<span style="color:#5c6370">其他任意指令將由 AI 自動回覆</span>');
return}

/* date */
if(cmd==='date'||cmd==='date -u'){
var now=new Date();
termPrintRaw('<span style="color:#e0e0e0">'+now.toLocaleString('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})+' CST</span>');
termPrintRaw('<span style="color:#5c6370">'+now.toUTCString()+'</span>');
return}

/* whoami */
if(cmd==='whoami'){
var u=me();
termPrintRaw('<span style="color:#e0e0e0">'+(u?u.username:'unknown')+'</span>');
return}

/* uname */
if(cmd==='uname'||cmd==='uname -a'){
termPrintRaw('<span style="color:#e0e0e0">Adv9 '+((navigator&&navigator.userAgent)||'Unknown OS')+' '+location.hostname+':'+location.port+'</span>');
return}

/* pwd */
if(cmd==='pwd'){
termPrintRaw('<span style="color:#e0e0e0">/home/'+((me()&&me().username)||'user')+'</span>');
return}

/* cd */
if(cmd.startsWith('cd ')){
var d=cmd.slice(3).trim();
termPrintRaw('<span style="color:#5c6370">cd: 模擬模式 — 目錄已切換到 '+escHtml(d)+'</span>');
return}

/* ls */
if(cmd==='ls'||cmd==='ls -la'||cmd==='ls -l'){
termPrintRaw('<span style="color:#5c6370">total 42</span>');
termPrintRaw('<span style="color:#5c6370">drwxr-xr-x</span>  <span style="color:#61afef">adv9</span> <span style="color:#61afef">adv9</span>  4096  <span style="color:#e5c07b">'+new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'})+'</span>  <span style="color:#e0e0e0">.</span>');
termPrintRaw('<span style="color:#5c6370">drwxr-xr-x</span>  <span style="color:#61afef">root</span> <span style="color:#61afef">root</span>  4096  <span style="color:#e5c07b">Jan 01 00:00</span>  <span style="color:#e0e0e0">..</span>');
termPrintRaw('<span style="color:#5c6370">drwxr-xr-x</span>  <span style="color:#61afef">adv9</span> <span style="color:#61afef">adv9</span>  4096  <span style="color:#e5c07b">'+new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'})+'</span>  <span style="color:#61afef">data/</span>');
termPrintRaw('<span style="color:#5c6370">drwxr-xr-x</span>  <span style="color:#61afef">adv9</span> <span style="color:#61afef">adv9</span>  4096  <span style="color:#e5c07b">'+new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'})+'</span>  <span style="color:#61afef">public/</span>');
termPrintRaw('<span style="color:#5c6370">-rw-r--r--</span>  <span style="color:#61afef">adv9</span> <span style="color:#61afef">adv9</span> 55681  <span style="color:#e5c07b">'+new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'})+'</span>  <span style="color:#e0e0e0">server.js</span>');
termPrintRaw('<span style="color:#5c6370">-rw-r--r--</span>  <span style="color:#61afef">adv9</span> <span style="color:#61afef">adv9</span>    688  <span style="color:#e5c07b">'+new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'})+'</span>  <span style="color:#e0e0e0">Dockerfile</span>');
termPrintRaw('<span style="color:#5c6370">-rw-r--r--</span>  <span style="color:#61afef">adv9</span> <span style="color:#61afef">adv9</span>    349  <span style="color:#e5c07b">'+new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'})+'</span>  <span style="color:#e0e0e0">docker-compose.yml</span>');
return}

/* cat */
if(cmd.startsWith('cat ')){
var f=cmd.slice(4).trim();
termPrintRaw('<span style="color:#e06c75">cat: '+escHtml(f)+': <span style="color:#5c6370">Permission denied (simulated)</span></span>');
return}

/* echo */
if(cmd.startsWith('echo ')){
termPrintRaw('<span style="color:#e0e0e0">'+escHtml(cmd.slice(5))+'</span>');
return}

/* stats */
if(cmd==='stats'||cmd==='stat'){
var u=me();if(!u||!u.g){termPrintRaw('<span style="color:#e06c75">Error: not logged in</span>');return}
var g=u.g;
termPrintRaw('<span style="color:#e5c07b">═══ 📊 玩家統計 ═══</span>');
termPrintRaw('<span style="color:#27c93f">user</span>      <span style="color:#e0e0e0">'+u.username+'</span>');
termPrintRaw('<span style="color:#27c93f">level</span>     <span style="color:#e0e0e0">Lv.'+g.lv+' ('+titleOf(g.lv)+')</span>');
termPrintRaw('<span style="color:#27c93f">xp</span>        <span style="color:#e0e0e0">'+g.xp+'/'+g.needXp+'</span>');
termPrintRaw('<span style="color:#27c93f">power</span>     <span style="color:#e0e0e0">'+power(g)+'</span>');
termPrintRaw('<span style="color:#27c93f">gold</span>      <span style="color:#e5c07b">'+g.gold+'</span>  <span style="color:#27c93f">crystal</span>  <span style="color:#61afef">'+g.crystal+'</span>  <span style="color:#c678dd">diamond</span>  <span style="color:#56b6c2">'+g.diamond+'</span>');
termPrintRaw('<span style="color:#27c93f">starlight</span> <span style="color:#e5c07b">'+g.starlight+'</span>  <span style="color:#27c93f">honor</span>    <span style="color:#e06c75">'+g.honor+'</span>');
termPrintRaw('<span style="color:#27c93f">combo</span>     <span style="color:#e0e0e0">'+g.combo+'</span>  <span style="color:#27c93f">rebirth</span>  <span style="color:#e0e0e0">'+(g.rebirth||0)+'</span>');
return}

/* exam */
if(cmd==='exam'){
var n=examCountdown();var d=examDate();
termPrintRaw('<span style="color:#e5c07b">📝 國中教育會考</span>');
termPrintRaw('<span style="color:#e0e0e0">倒數: <span style="color:#e06c75;font-weight:bold">'+n+' 天</span></span>');
termPrintRaw('<span style="color:#e0e0e0">日期: '+d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()+'</span>');
termPrintRaw('<span style="color:#e0e0e0">來源: '+(examSrc()==='ai'?'🤖 AI 查詢':'⚠️ 預估')+'</span>');
termPrintRaw('<span style="color:#5c6370">$ examRefresh → 首頁「🔄 AI 更新日期」按鈕</span>');
return}

/* quiz */
if(cmd==='quiz'){
termPrintRaw('<span style="color:#e5c07b">🤖 AI 出題模式</span>');
termPrintRaw('<span style="color:#5c6370">使用「✏️ 修煉場」進行正式答題可獲得經驗和獎勵</span>');
termPrintRaw('<span style="color:#5c6370">$ vSubj() → 進入修煉場</span>');
return}

/* joke */
if(cmd==='joke'){
termPrintRaw('<span style="color:#e5c07b">🤖 正在生成笑話...</span>');
try{
var r=await callAI('講一個簡短的冷笑話，1-2句話就好，用繁體中文回覆。','你是一個終端機，只回覆冷笑話，不要多說。');
termPrintRaw('<span style="color:#e0e0e0">'+escHtml(r||'(empty)')+'</span>');
}catch(e){termPrintRaw('<span style="color:#e06c75">error: '+escHtml(e.message||'unknown')+'</span>')}
return}

/* sudo */
if(cmd.startsWith('sudo ')){
var sc=cmd.slice(5).trim();
termPrintRaw('<span style="color:#e5c07b">[sudo] password for '+((me()&&me().username)||'user')+': </span><span style="color:#5c6370">********</span>');
termPrintRaw('<span style="color:#e0e0e0">root@adv9:~$ '+escHtml(sc)+'</span>');
if(sc==='rm -rf /'||sc==='rm -rf /*'){
termPrintRaw('<span style="color:#e06c75">Nice try! 😏 這裡是虛擬終端機，不會真的刪除任何東西。</span>');
}else{
try{
var r=await callAI('你是 Adv9 伺服器管理員。用戶以 root 權限執行了「'+sc+'」。請用 Linux root 終端機的語氣簡短回覆（3行以內），模擬真實 root 終端回應。不要用 markdown。','你是 root 終端機，語氣簡潔有力，3行以內。');
termPrintRaw('<span style="color:#e0e0e0">'+escHtml(r||'(no output)')+'</span>');
}catch(e){termPrintRaw('<span style="color:#e06c75">error: '+escHtml(e.message||'unknown')+'</span>')}
}
return}

/* ping */
if(cmd.startsWith('ping ')){
var host=cmd.slice(5).trim();
termPrintRaw('<span style="color:#e0e0e0">PING '+escHtml(host)+' ('+escHtml(host)+') 56(84) bytes of data.</span>');
for(var i=1;i<=4;i++){
termPrintRaw('<span style="color:#e0e0e0">64 bytes from '+escHtml(host)+': icmp_seq='+i+' ttl=64 time='+(1+Math.random()*5).toFixed(3)+' ms</span>');
}
termPrintRaw('<span style="color:#e0e0e0">--- '+escHtml(host)+' ping statistics ---</span>');
termPrintRaw('<span style="color:#e0e0e0">4 packets transmitted, 4 received, 0% packet loss, time 3004ms</span>');
return}

/* top / htop */
if(cmd==='top'||cmd==='htop'){
termPrintRaw('<span style="color:#e0e0e0"><span style="color:#e5c07b">top</span> - '+new Date().toLocaleTimeString()+' up 1 day,  3:42,  1 user,  load average: 0.42, 0.38, 0.35</span>');
termPrintRaw('<span style="color:#e0e0e0">Tasks: <span style="color:#e5c07b"> 12</span> total,  <span style="color:#27c93f">  2</span> running,  <span style="color:#61afef"> 10</span> sleeping,  0 stopped,  0 zombie</span>');
termPrintRaw('<span style="color:#e0e0e0">%Cpu(s):  <span style="color:#27c93f"> 2.3</span> us,  0.8 sy,  0.0 ni, 96.5 id,  0.4 wa,  0.0 hi,  0.0 si</span>');
termPrintRaw('<span style="color:#e0e0e0">MiB Mem:  <span style="color:#e5c07b"> 8192.0</span> total,  <span style="color:#27c93f"> 5234.1</span> free,  <span style="color:#e06c75"> 2103.4</span> used,   854.5 buff/cache</span>');
termPrintRaw('<span style="color:#5c6370">──────────────────────────────────────────────────────</span>');
termPrintRaw('<span style="color:#e0e0e0"><span style="color:#e5c07b">  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND</span></span>');
termPrintRaw('<span style="color:#e0e0e0">    1 adv9      20   0  568340  45632  28192 S   0.3   0.5   0:12.34 node</span>');
termPrintRaw('<span style="color:#e0e0e0">  142 adv9      20   0 1234560 128900  45678 S   1.2   1.5   0:45.67 node server</span>');
termPrintRaw('<span style="color:#e0e0e0">  256 adv9      20   0  987654  67890  34567 S   0.1   0.8   0:08.90 docker</span>');
return}

/* 空指令 */
if(!cmd)return;

/* 其他 → AI */
termPrintRaw('<span style="color:#5c6370">⏳ 正在處理...</span>');
try{
var aiReply=await callAI('你是 Adv9 虛擬終端機。用戶輸入了指令：「'+cmd+'」。請用真實 Linux/Windows 終端機的格式簡短回覆（3行以內），不要使用 markdown 格式，不要使用粗體或斜體標記。如果是指令相關問題就模擬終端回應，如果是閒聊就用終端風格回覆。','你是 Adv9 虛擬終端機。回覆要像真實終端一樣簡潔，純文字，3行以內。');
termPrintRaw('<span style="color:#e0e0e0">'+escHtml(aiReply||'(no output)')+'</span>');
}catch(e){termPrintRaw('<span style="color:#e06c75">bash: '+escHtml(cmd.split(' ')[0])+': command not found</span>')}
termPrintRaw('');
}

function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
