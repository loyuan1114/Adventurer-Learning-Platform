/* ════════════════════════════════════════════
   vTerminal 虛擬終端機 v2 — 多系統選擇
   Linux / Kali / macOS / Windows
   ════════════════════════════════════════════ */

var TERM_OS=localStorage.getItem('term_os')||'linux';
var TERM_OS_INFO={
  linux:{name:'Linux',prompt:'$',color:'#27c93f',userColor:'#61afef',hostColor:'#c678dd',pathColor:'#e06c75',user:'user',host:'adv9',banner:'Ubuntu 22.04.3 LTS',motd:'Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)'},
  kali:{name:'Kali Linux',prompt:'$',color:'#36b527',userColor:'#36b527',hostColor:'#e06c75',pathColor:'#e5c07b',user:'kali',host:'kali',banner:'Kali GNU/Linux Rolling',motd:'┌──(kali@kali)-[~]\n└─$'},
  macos:{name:'macOS',prompt:'%',color:'#27c93f',userColor:'#61afef',hostColor:'#c678dd',pathColor:'#e06c75',user:'user',host:'MacBook',banner:'macOS Sonoma 14.3',motd:'Last login: '+new Date().toUTCString()+' on ttys000'},
  windows:{name:'Windows',prompt:'>',color:'#cccccc',userColor:'#56b6c2',hostColor:'#e5c07b',pathColor:'#98c379',user:'Admin',host:'DESKTOP',banner:'Windows 11 Pro (Build 22631)',motd:'Microsoft Windows [Version 10.0.22631.3447]\n(c) Microsoft Corporation. All rights reserved.'}
};

var TERM_FS={
  linux:{
    '/':{type:'dir',children:['home','etc','var','usr','bin','tmp','opt','root']},
    '/home':{type:'dir',children:['user']},
    '/home/user':{type:'dir',children:['Documents','Downloads','.bashrc','.profile','server.js','Dockerfile']},
    '/home/user/Documents':{type:'dir',children:['notes.txt','project/']},
    '/home/user/Documents/notes.txt':{type:'file',content:'TODO:\n- Fix bug #42\n- Deploy v2.0\n- Write tests'},
    '/etc':{type:'dir',children:['passwd','hosts','nginx/']},
    '/var':{type:'dir',children:['log','www']},
    '/tmp':{type:'dir',children:[]},
    '/usr':{type:'dir',children:['bin','lib','share']}
  },
  kali:{
    '/':{type:'dir',children:['home','etc','var','usr','bin','opt','usr/share/wordlists']},
    '/home':{type:'dir',children:['kali']},
    '/home/kali':{type:'dir',children:['Desktop','Documents','.zshrc','tools/']},
    '/home/kali/Desktop':{type:'dir',children:['burpsuite.desktop','metasploit.desktop']},
    '/home/kali/tools':{type:'dir',children:['nmap','sqlmap','hashcat']},
    '/opt':{type:'dir',children:['metasploit','burpsuite']},
    '/usr/share/wordlists':{type:'dir',children:['rockyou.txt',' SecLists/']}
  },
  macos:{
    '/':{type:'dir',children:['Users','Applications','System','Library','Volumes']},
    '/Users':{type:'dir',children:['user']},
    '/Users/user':{type:'dir',children:['Desktop','Documents','Downloads','.zshrc','Projects/']},
    '/Users/user/Projects':{type:'dir',children:['adv9/','portfolio/']},
    '/Applications':{type:'dir',children:['Safari.app','Xcode.app','Terminal.app']}
  },
  windows:{
    'C:\\':{type:'dir',children:['Users','Windows','Program Files','Program Files (x86)']},
    'C:\\Users':{type:'dir',children:['Admin','Public']},
    'C:\\Users\\Admin':{type:'dir',children:['Desktop','Documents','Downloads','.bashrc']},
    'C:\\Users\\Admin\\Desktop':{type:'dir',children:['project.zip','notes.txt']},
    'C:\\Windows':{type:'dir',children:['System32','SysWOW64']},
    'C:\\Program Files':{type:'dir',children:['Google','Mozilla Firefox','Nodejs']}
  }
};

var _termHist=[];
var _termHistIdx=-1;
var _termCwd='/';

function vTerminal(){
  var u=me();
  var o=TERM_OS_INFO[TERM_OS];
  var osKeys=Object.keys(TERM_OS_INFO);
  var osBtns=osKeys.map(function(k){
    var info=TERM_OS_INFO[k];
    var active=k===TERM_OS;
    return '<button class="btn '+(active?'':'ghost')+' mini" onclick="termSwitchOS(\''+k+'\')" style="font-size:11px">'+info.name+'</button>';
  }).join('');

  $('#view').innerHTML=back()+
  '<h3 class="vt">💻 虛擬終端機 <span class="vsub">'+o.name+' 模擬</span></h3>'+
  '<div style="margin-bottom:8px;display:flex;gap:4px;flex-wrap:wrap;align-items:center">'+
  '<span style="font-size:12px;color:var(--mut);margin-right:4px">選擇系統：</span>'+
  osBtns+'</div>'+
  '<div id="termWrap" style="position:relative;border-radius:10px;overflow:hidden;border:2px solid #333;box-shadow:0 8px 32px rgba(0,0,0,.6)">'+
  '<div style="background:#2d2d2d;padding:8px 14px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #444">'+
  '<div style="width:12px;height:12px;border-radius:50%;background:#ff5f56"></div>'+
  '<div style="width:12px;height:12px;border-radius:50%;background:#ffbd2e"></div>'+
  '<div style="width:12px;height:12px;border-radius:50%;background:#27c93f"></div>'+
  '<span style="flex:1;text-align:center;font-size:12px;color:#888;font-family:monospace">'+o.user+'@'+o.host+' ~ </span>'+
  '</div>'+
  '<div id="termBox" style="background:#1a1a2e;padding:16px;min-height:420px;max-height:62vh;overflow-y:auto;font-family:\'Cascadia Code\',\'Fira Code\',\'Source Code Pro\',\'Consolas\',\'Courier New\',monospace;font-size:13.5px;line-height:1.65;color:#e0e0e0;white-space:pre-wrap;word-break:break-all;cursor:text" onclick="document.getElementById(\'termInput\').focus()"></div>'+
  '<div style="background:#1a1a2e;padding:0 16px 14px;display:flex;gap:0;align-items:center;border-top:1px solid #333">'+
  '<span style="color:'+o.color+';font-weight:700;font-family:inherit;white-space:nowrap;user-select:none"><span style="color:'+o.userColor+'">'+o.user+'</span><span style="color:#abb2bf">@</span><span style="color:'+o.hostColor+'">'+o.host+'</span> <span style="color:'+o.pathColor+'">~</span> <span style="color:'+o.color+'">'+o.prompt+'</span> </span>'+
  '<input id="termInput" style="flex:1;padding:6px 0;background:transparent;border:none;color:#e0e0e0;font-family:inherit;font-size:13.5px;outline:none;caret-color:'+o.color+'" autofocus>'+
  '</div></div>';

  _termCwd='/home/'+o.user;
  var box=$('#termBox');
  termPrintRaw('<span style="color:'+o.color+'">'+o.banner+'</span>');
  termPrintRaw('<span style="color:#5c6370">'+o.motd+'</span>');
  termPrintRaw('');
  if(TERM_OS==='kali'){
    termPrintRaw('<span style="color:#36b527">┌──(kali@kali)-[~]</span>');
    termPrintRaw('<span style="color:#36b527">└─$ </span><span style="color:#5c6370">echo "Welcome to Kali!"</span>');
    termPrintRaw('<span style="color:#e0e0e0">Welcome to Kali!</span>');
    termPrintRaw('');
  }
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

function termSwitchOS(os){
  TERM_OS=os;
  try{localStorage.setItem('term_os',os)}catch(e){}
  _termCwd='/home/'+TERM_OS_INFO[os].user;
  vTerminal();
}

function termPrintRaw(html){
  var box=$('#termBox');if(!box)return;
  var div=document.createElement('div');
  div.innerHTML=html;
  box.appendChild(div);
  box.scrollTop=box.scrollHeight;
}

function termPrompt(){
  var o=TERM_OS_INFO[TERM_OS];
  var cwd=_termCwd||'/home/'+o.user;
  var display=cwd.replace('/home/'+o.user,'~');
  return '<span style="color:'+o.userColor+'">'+o.user+'</span><span style="color:#abb2bf">@</span><span style="color:'+o.hostColor+'">'+o.host+'</span> <span style="color:'+o.pathColor+'">'+escHtml(display)+'</span> <span style="color:'+o.color+'">'+o.prompt+'</span> ';
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

  if(cmd==='clear'||cmd==='cls'){var b=$('#termBox');if(b)b.innerHTML='';return}

  if(cmd==='help'||cmd==='man'){
    var o=TERM_OS_INFO[TERM_OS];
    termPrintRaw('<span style="color:#e5c07b">═══ '+o.name+' Terminal 說明 ═══</span>');
    termPrintRaw('<span style="color:#5c6370">─────────────────────────────────────────</span>');
    termPrintRaw('<span style="color:'+o.color+'">help</span>          <span style="color:#abb2bf">顯示此說明</span>');
    termPrintRaw('<span style="color:'+o.color+'">date</span>          <span style="color:#abb2bf">顯示日期時間</span>');
    termPrintRaw('<span style="color:'+o.color+'">whoami</span>        <span style="color:#abb2bf">使用者資訊</span>');
    termPrintRaw('<span style="color:'+o.color+'">uname -a</span>      <span style="color:#abb2bf">系統資訊</span>');
    termPrintRaw('<span style="color:'+o.color+'">ls [-la]</span>      <span style="color:#abb2bf">列出檔案</span>');
    termPrintRaw('<span style="color:'+o.color+'">cd [路徑]</span>     <span style="color:#abb2bf">切換目錄</span>');
    termPrintRaw('<span style="color:'+o.color+'">pwd</span>           <span style="color:#abb2bf">目前目錄</span>');
    termPrintRaw('<span style="color:'+o.color+'">cat [檔]</span>      <span style="color:#abb2bf">檔案內容</span>');
    termPrintRaw('<span style="color:'+o.color+'">echo [字串]</span>   <span style="color:#abb2bf">印出文字</span>');
    termPrintRaw('<span style="color:'+o.color+'">stats</span>         <span style="color:#abb2bf">玩家統計</span>');
    termPrintRaw('<span style="color:'+o.color+'">ping [host]</span>   <span style="color:#abb2bf">ping 測試</span>');
    termPrintRaw('<span style="color:'+o.color+'">top</span>           <span style="color:#abb2bf">系統監控</span>');
    if(TERM_OS==='kali'){
      termPrintRaw('<span style="color:'+o.color+'">nmap [host]</span>   <span style="color:#abb2bf">網路掃描</span>');
      termPrintRaw('<span style="color:'+o.color+'">msfconsole</span>    <span style="color:#abb2bf">Metasploit</span>');
      termPrintRaw('<span style="color:'+o.color+'">airmon-ng</span>     <span style="color:#abb2bf">無線網路</span>');
      termPrintRaw('<span style="color:'+o.color+'">hashcat</span>       <span style="color:#abb2bf">密碼破解</span>');
    }
    termPrintRaw('<span style="color:'+o.color+'">sudo [cmd]</span>    <span style="color:#abb2bf">管理員執行</span>');
    termPrintRaw('<span style="color:#5c6370">─────────────────────────────────────────</span>');
    termPrintRaw('<span style="color:#5c6370">Ctrl+L 清除 | Ctrl+C 中斷 | ↑↓ 歷史 | AI 自動回覆未知指令</span>');
    return}

  if(cmd==='date'||cmd==='date -u'){
    var now=new Date();
    termPrintRaw('<span style="color:#e0e0e0">'+now.toLocaleString('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})+' CST</span>');
    return}

  if(cmd==='whoami'){
    var o=TERM_OS_INFO[TERM_OS];
    termPrintRaw('<span style="color:#e0e0e0">'+o.user+'</span>');
    return}

  if(cmd==='uname'||cmd==='uname -a'){
    var o=TERM_OS_INFO[TERM_OS];
    if(TERM_OS==='linux')termPrintRaw('<span style="color:#e0e0e0">Linux adv9 5.15.0-91-generic #101-Ubuntu SMP '+((navigator&&navigator.userAgent)||'x86_64')+'</span>');
    else if(TERM_OS==='kali')termPrintRaw('<span style="color:#e0e0e0">Linux kali 6.5.0-kali3-amd64 #1 SMP Debian 6.5.0-13 '+((navigator&&navigator.userAgent)||'x86_64')+'</span>');
    else if(TERM_OS==='macos')termPrintRaw('<span style="color:#e0e0e0">Darwin MacBook.local 23.3.0 Darwin Kernel Version 23.3.0 x86_64</span>');
    else termPrintRaw('<span style="color:#e0e0e0">Windows DESKTOP '+((navigator&&navigator.userAgent)||'Win32')+'</span>');
    return}

  if(cmd==='pwd'){
    termPrintRaw('<span style="color:#e0e0e0">'+_termCwd+'</span>');
    return}

  if(cmd==='cd'||cmd==='cd ~'){
    _termCwd='/home/'+TERM_OS_INFO[TERM_OS].user;return}
  if(cmd.startsWith('cd ')){
    var d=cmd.slice(3).trim();
    if(d==='..'){
      var parts=_termCwd.split('/').filter(Boolean);
      parts.pop();
      _termCwd='/'+parts.join('/')||'/home/'+TERM_OS_INFO[TERM_OS].user;
    }else if(d==='/'){
      _termCwd='/';
    }else if(d.startsWith('/')){
      _termCwd=d;
    }else{
      var base=_termCwd==='/'?'/':_termCwd+'/';
      _termCwd=base+d;
    }
    var fs=TERM_FS[TERM_OS]||{};
    if(!fs[_termCwd]){termPrintRaw('<span style="color:#e06c75">bash: cd: '+escHtml(d)+': No such file or directory</span>');_termCwd='/home/'+TERM_OS_INFO[TERM_OS].user}
    return}

  if(cmd==='ls'||cmd==='ls -la'||cmd==='ls -l'){
    var fs=TERM_FS[TERM_OS]||{};
    var dir=fs[_termCwd];
    if(!dir||dir.type!=='dir'){termPrintRaw('<span style="color:#e06c75">ls: cannot access \''+escHtml(_termCwd)+'\': No such file or directory</span>');return}
    var items=dir.children||[];
    if(!items.length){termPrintRaw('<span style="color:#5c6370">(empty directory)</span>');return}
    if(cmd==='ls -la'||cmd==='ls -l'){
      termPrintRaw('<span style="color:#5c6370">total '+items.length+'</span>');
      items.forEach(function(name){
        var p=_termCwd==='/'?'/':_termCwd+'/';
        var full=p+name;
        var isDir=fs[full]&&fs[full].type==='dir';
        var perms=isDir?'drwxr-xr-x':'-rw-r--r--';
        var color=isDir?'#61afef':'#e0e0e0';
        termPrintRaw('<span style="color:#5c6370">'+perms+'</span>  <span style="color:'+color+'">'+escHtml(name)+'</span>');
      });
    }else{
      var line=items.map(function(name){
        var p=_termCwd==='/'?'/':_termCwd+'/';
        var full=p+name;
        var isDir=fs[full]&&fs[full].type==='dir';
        return '<span style="color:'+(isDir?'#61afef':'#e0e0e0')+'">'+escHtml(name)+(isDir?'/':'')+'</span>';
      }).join('  ');
      termPrintRaw(line);
    }
    return}

  if(cmd.startsWith('cat ')){
    var f=cmd.slice(4).trim();
    var fs=TERM_FS[TERM_OS]||{};
    var base=_termCwd==='/'?'/':_termCwd+'/';
    var full=base+f;
    if(fs[full]&&fs[full].type==='file'){
      termPrintRaw('<span style="color:#e0e0e0">'+escHtml(fs[full].content||'(empty)')+'</span>');
    }else{
      termPrintRaw('<span style="color:#e06c75">cat: '+escHtml(f)+': No such file or directory</span>');
    }
    return}

  if(cmd.startsWith('echo ')){
    termPrintRaw('<span style="color:#e0e0e0">'+escHtml(cmd.slice(5))+'</span>');
    return}

  if(cmd==='stats'||cmd==='stat'){
    var u=me();if(!u||!u.g){termPrintRaw('<span style="color:#e06c75">Error: not logged in</span>');return}
    var g=u.g;
    termPrintRaw('<span style="color:#e5c07b">═══ 📊 玩家統計 ═══</span>');
    termPrintRaw('<span style="color:#27c93f">user</span>      <span style="color:#e0e0e0">'+u.username+'</span>');
    termPrintRaw('<span style="color:#27c93f">level</span>     <span style="color:#e0e0e0">Lv.'+g.lv+' ('+titleOf(g.lv)+')</span>');
    termPrintRaw('<span style="color:#27c93f">xp</span>        <span style="color:#e0e0e0">'+g.xp+'/'+g.needXp+'</span>');
    termPrintRaw('<span style="color:#27c93f">power</span>     <span style="color:#e0e0e0">'+power(g)+'</span>');
    termPrintRaw('<span style="color:#e5c07b">gold</span> '+g.gold+'  <span style="color:#61afef">crystal</span> '+g.crystal+'  <span style="color:#c678dd">diamond</span> '+g.diamond);
    return}

  if(cmd==='exam'){
    var n=examCountdown();var d=examDate();
    termPrintRaw('<span style="color:#e5c07b">📝 國中教育會考</span>');
    termPrintRaw('<span style="color:#e0e0e0">倒數: <span style="color:#e06c75;font-weight:bold">'+n+' 天</span></span>');
    termPrintRaw('<span style="color:#e0e0e0">日期: '+d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()+'</span>');
    return}

  if(cmd.startsWith('ping ')){
    var host=cmd.slice(5).trim();
    termPrintRaw('<span style="color:#e0e0e0">PING '+escHtml(host)+' 56(84) bytes of data.</span>');
    for(var i=1;i<=4;i++){termPrintRaw('<span style="color:#e0e0e0">64 bytes from '+escHtml(host)+': icmp_seq='+i+' ttl=64 time='+(1+Math.random()*5).toFixed(3)+' ms</span>')}
    termPrintRaw('<span style="color:#e0e0e0">--- '+escHtml(host)+' ping statistics ---</span>');
    termPrintRaw('<span style="color:#e0e0e0">4 packets transmitted, 4 received, 0% packet loss</span>');
    return}

  if(cmd==='top'||cmd==='htop'){
    termPrintRaw('<span style="color:#e0e0e0"><span style="color:#e5c07b">top</span> - '+new Date().toLocaleTimeString()+' up 1 day, load average: 0.42, 0.38, 0.35</span>');
    termPrintRaw('<span style="color:#e0e0e0">Tasks: <span style="color:#e5c07b">12</span> total, <span style="color:#27c93f">2</span> running, <span style="color:#61afef">10</span> sleeping</span>');
    termPrintRaw('<span style="color:#e0e0e0">%Cpu(s): <span style="color:#27c93f">2.3</span> us, 0.8 sy, 96.5 id</span>');
    termPrintRaw('<span style="color:#e0e0e0">MiB Mem: <span style="color:#e5c07b">8192.0</span> total, <span style="color:#27c93f">5234.1</span> free, <span style="color:#e06c75">2103.4</span> used</span>');
    return}

  /* ── Kali 專屬指令 ── */
  if(TERM_OS==='kali'){
    if(cmd==='nmap'||cmd.startsWith('nmap ')){
      var host=cmd==='nmap'?'localhost':cmd.slice(5).trim();
      termPrintRaw('<span style="color:#36b527">Starting Nmap 7.94SVN ( https://nmap.org )</span>');
      termPrintRaw('<span style="color:#e0e0e0">Nmap scan report for '+escHtml(host)+' (127.0.0.1)</span>');
      termPrintRaw('<span style="color:#e0e0e0">Host is up (0.0023s latency).</span>');
      termPrintRaw('<span style="color:#e0e0e0">PORT     STATE  SERVICE</span>');
      termPrintRaw('<span style="color:#e0e0e0">22/tcp   open   ssh</span>');
      termPrintRaw('<span style="color:#e0e0e0">80/tcp   open   http</span>');
      termPrintRaw('<span style="color:#e0e0e0">443/tcp  open   https</span>');
      termPrintRaw('<span style="color:#e0e0e0">3306/tcp open   mysql</span>');
      termPrintRaw('<span style="color:#36b527">Nmap done: 1 IP address (1 host up) scanned in 0.42s</span>');
      return}

    if(cmd==='msfconsole'){
      termPrintRaw('<span style="color:#e0e0e0">     =[ metasploit v6.3.44-dev ]</span>');
      termPrintRaw('<span style="color:#e0e0e0">+ -- --=[ 2380 exploits - 1241 auxiliary ]</span>');
      termPrintRaw('<span style="color:#e0e0e0">+ -- --=[ 429 payloads - 47 encoders - 11 nops ]</span>');
      termPrintRaw('<span style="color:#e0e0e0">+ -- --=[ 9 evasion ]</span>');
      termPrintRaw('<span style="color:#36b527">msf6 ></span> <span style="color:#5c6370">type "help" for commands</span>');
      return}

    if(cmd==='airmon-ng'){
      termPrintRaw('<span style="color:#e0e0e0">PHY     Interface   Driver      Chipset</span>');
      termPrintRaw('<span style="color:#e0e0e0">phy0    wlan0       ath9k_htc   Qualcomm Atheros Communications AR9271 802.11n</span>');
      termPrintRaw('<span style="color:#5c6370">Use "airmon-ng start wlan0" to enable monitor mode</span>');
      return}

    if(cmd==='hashcat'){
      termPrintRaw('<span style="color:#e0e0e0">hashcat (v6.2.6) starting</span>');
      termPrintRaw('<span style="color:#e0e0e0">CUDA API (CUDA 12.2)</span>');
      termPrintRaw('<span style="color:#e0e0e0">* Device #1: NVIDIA GeForce RTX 3080, 9528MB, 68MCU</span>');
      termPrintRaw('<span style="color:#5c6370">Usage: hashcat -m 0 -a 0 hash.txt wordlist.txt</span>');
      return}

    if(cmd==='sudo apt update'){
      termPrintRaw('<span style="color:#e0e0e0">Hit:1 http://kali.download/kali kali-rolling InRelease</span>');
      termPrintRaw('<span style="color:#e0e0e0">Reading package lists... Done</span>');
      termPrintRaw('<span style="color:#e0e0e0">All packages are up to date.</span>');
      return}

    if(cmd==='sudo apt upgrade'){
      termPrintRaw('<span style="color:#e0e0e0">Reading package lists... Done</span>');
      termPrintRaw('<span style="color:#e0e0e0">Building dependency tree... Done</span>');
      termPrintRaw('<span style="color:#e0e0e0">0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.</span>');
      return}
  }

  /* ── macOS 專屬 ── */
  if(TERM_OS==='macos'){
    if(cmd==='brew'){
      termPrintRaw('<span style="color:#e0e0e0">Example usage:</span>');
      termPrintRaw('<span style="color:#e0e0e0">  brew search <text></span>');
      termPrintRaw('<span style="color:#e0e0e0">  brew install <formula></span>');
      termPrintRaw('<span style="color:#e0e0e0">  brew upgrade</span>');
      return}
    if(cmd==='open .'){
      termPrintRaw('<span style="color:#5c6370">Opening Finder at current directory...</span>');
      return}
  }

  /* ── Windows 專屬 ── */
  if(TERM_OS==='windows'){
    if(cmd==='dir'){
      var fs=TERM_FS[TERM_OS]||{};
      var dir=fs[_termCwd];
      if(!dir){termPrintRaw('<span style="color:#e06c75">File Not Found</span>');return}
      termPrintRaw('<span style="color:#e0e0e0"> Volume in drive C has no label.</span>');
      termPrintRaw('<span style="color:#e0e0e0"> Directory of '+_termCwd+'</span>');
      termPrintRaw('');
      (dir.children||[]).forEach(function(name){
        var p=_termCwd.endsWith('\\')?_termCwd:_termCwd+'\\';
        var full=p+name;
        var isDir=fs[full]&&fs[full].type==='dir';
        termPrintRaw('<span style="color:#98c379">'+(isDir?'<DIR>      ':'           ')+'</span><span style="color:#e0e0e0">'+escHtml(name)+'</span>');
      });
      return}
    if(cmd==='ipconfig'){
      termPrintRaw('<span style="color:#e0e0e0">Windows IP Configuration</span>');
      termPrintRaw('<span style="color:#e0e0e0">Ethernet adapter Ethernet:</span>');
      termPrintRaw('<span style="color:#e0e0e0">   IPv4 Address: 192.168.1.100</span>');
      termPrintRaw('<span style="color:#e0e0e0">   Subnet Mask: 255.255.255.0</span>');
      termPrintRaw('<span style="color:#e0e0e0">   Default Gateway: 192.168.1.1</span>');
      return}
    if(cmd.startsWith('type ')){
      var f=cmd.slice(5).trim();
      var fs=TERM_FS[TERM_OS]||{};
      var p=_termCwd.endsWith('\\')?_termCwd:_termCwd+'\\';
      var full=p+f;
      if(fs[full]&&fs[full].type==='file'){
        termPrintRaw('<span style="color:#e0e0e0">'+escHtml(fs[full].content||'(empty)')+'</span>');
      }else{
        termPrintRaw('<span style="color:#e06c75">The system cannot find the file specified: '+escHtml(f)+'</span>');
      }
      return}
  }

  if(!cmd)return;

  /* sudo */
  if(cmd.startsWith('sudo ')){
    var sc=cmd.slice(5).trim();
    var o=TERM_OS_INFO[TERM_OS];
    termPrintRaw('<span style="color:#e5c07b">[sudo] password for '+o.user+': </span><span style="color:#5c6370">********</span>');
    termPrintRaw('<span style="color:#e0e0e0">'+o.user+'@'+o.host+':~$ '+escHtml(sc)+'</span>');
    if(sc==='rm -rf /'||sc==='rm -rf /*'){
      termPrintRaw('<span style="color:#e06c75">Nice try! 這裡是虛擬終端機。</span>');
    }else{
      try{
        var r=await callAI('你是 '+TERM_OS_INFO[TERM_OS].name+' 終端機。用戶以 root 執行了「'+sc+'」。請用'+TERM_OS_INFO[TERM_OS].name+' root 終端的語氣簡短回覆（3行以內），模擬真實回應。不要用 markdown。','你是 root 終端機，語氣簡潔，3行以內。');
        termPrintRaw('<span style="color:#e0e0e0">'+escHtml(r||'(no output)')+'</span>');
      }catch(e){termPrintRaw('<span style="color:#e06c75">error: '+escHtml(e.message||'unknown')+'</span>')}
    }
    return}

  /* AI fallback */
  termPrintRaw('<span style="color:#5c6370">⏳ 正在處理...</span>');
  try{
    var aiReply=await callAI('你是 '+TERM_OS_INFO[TERM_OS].name+' 終端機（'+TERM_OS+'）。用戶輸入了：「'+cmd+'」。請用'+TERM_OS_INFO[TERM_OS].name+'終端機的格式簡短回覆（3行以內），不要使用 markdown。如果是指令就模擬回應，閒聊就用終端風格。','你是 '+TERM_OS_INFO[TERM_OS].name+' 終端機。回覆像真實終端一樣簡潔，純文字，3行以內。');
    termPrintRaw('<span style="color:#e0e0e0">'+escHtml(aiReply||'(no output)')+'</span>');
  }catch(e){termPrintRaw('<span style="color:#e06c75">'+TERM_OS_INFO[TERM_OS].prompt+': '+escHtml(cmd.split(' ')[0])+': command not found</span>')}
  termPrintRaw('');
}

function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
