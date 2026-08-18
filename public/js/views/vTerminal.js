/* ════════════════════════════════════════════
   vTerminal 虛擬終端機 v3 — 真實機器模擬 + Agent
   多系統選擇 / 持久歷史 / Agent 面板
   ════════════════════════════════════════════ */

var TERM_OS=localStorage.getItem('term_os')||'linux';
var TERM_HIST_KEY='term_hist_'+TERM_OS;
var _termHist=[];
var _termHistIdx=-1;
var _termCwd='/';
var _termAgentCmds=JSON.parse(localStorage.getItem('term_agent_cmds')||'[]');

var TERM_OS_INFO={
  linux:{name:'Linux',prompt:'$',color:'#27c93f',userColor:'#61afef',hostColor:'#c678dd',pathColor:'#e06c75',user:'user',host:'adv9',banner:'Ubuntu 22.04.3 LTS',motd:'Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)\n\n * Documentation:  https://help.ubuntu.com\n * Management:     https://landscape.canonical.com\n * Support:        https://ubuntu.com/advantage\n\nLast login: '+new Date().toUTCString()+' from 192.168.1.50'},
  kali:{name:'Kali Linux',prompt:'$',color:'#36b527',userColor:'#36b527',hostColor:'#e06c75',pathColor:'#e5c07b',user:'kali',host:'kali',banner:'Kali GNU/Linux Rolling (2024.1)',motd:'┌──(kali㉿kali)-[~]\n└─# cat /etc/motd\n\n,---.  ,---.  ,---.  ,---.  ,---.  ,---.  ,---.  ,---.\n| |-\" | |-\" | |-\" | |-\" | |-\" | |-\" | |-\" | |-\"\n|  _  |  _  |  _  |  _  |  _  |  _  |  _  |  _\n`-\'  `-\'  `-\'  `-\'  `-\'  `-\'  `-\'  `-\'  `-\'\n\nI\'m not a hacker, I just have Kali installed.\n\nLast login: '+new Date().toUTCString()+' from 192.168.1.100'},
  macos:{name:'macOS',prompt:'%',color:'#27c93f',userColor:'#61afef',hostColor:'#c678dd',pathColor:'#e06c75',user:'user',host:'MacBook-Pro',banner:'macOS Sonoma 14.3 (23D56)',motd:'Last login: '+new Date().toUTCString()+' on ttys000'},
  windows:{name:'Windows',prompt:'>',color:'#cccccc',userColor:'#56b6c2',hostColor:'#e5c07b',pathColor:'#98c379',user:'Admin',host:'DESKTOP-3K9Q7',banner:'Microsoft Windows [Version 10.0.22631.3447]',motd:'(c) Microsoft Corporation. All rights reserved.\n\nC:\\Users\\Admin>'}
};

function _mkDir(children){return {d:children||[]}}

var TERM_FS={
  linux:{
    '/':_mkDir(['home','etc','var','usr','bin','sbin','tmp','opt','root','proc','dev']),
    '/home':_mkDir(['user']),
    '/home/user':_mkDir(['Documents','Downloads','.bashrc','.profile','server.js','Dockerfile']),
    '/home/user/Documents':_mkDir(['notes.txt','project']),
    '/home/user/Downloads':_mkDir([]),
    '/home/user/Documents/notes.txt':'TODO:\n- Fix bug #42\n- Deploy v2.0\n- Write tests',
    '/home/user/server.js':'const express=require("express");\nconst app=express();\napp.listen(3000);',
    '/home/user/Dockerfile':'FROM node:18\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD ["node","server.js"]',
    '/home/user/.bashrc':'# ~/.bashrc\nexport PATH=$PATH:/usr/local/bin\nalias ll="ls -la"',
    '/home/user/.profile':'# ~/.profile\nif [ -f "$HOME/.bashrc" ]; then\n  . "$HOME/.bashrc"\nfi',
    '/home/user/Documents/project':_mkDir(['index.js','README.md']),
    '/home/user/Documents/project/index.js':'console.log("Hello World");',
    '/home/user/Documents/project/README.md':'# Project\nA simple Node.js project.',
    '/etc':_mkDir(['hostname','hosts','passwd','os-release','nginx']),
    '/etc/hostname':'adv9',
    '/etc/hosts':'127.0.0.1\tlocalhost\n127.0.1.1\tadv9',
    '/etc/passwd':'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash',
    '/etc/os-release':'NAME="Ubuntu"\nVERSION="22.04.3 LTS"\nID=ubuntu',
    '/etc/nginx':_mkDir(['nginx.conf']),
    '/etc/nginx/nginx.conf':'server {\n  listen 80;\n  location / {\n    proxy_pass http://127.0.0.1:3000;\n  }\n}',
    '/var':_mkDir(['log','www']),
    '/var/log':_mkDir(['syslog','auth.log','kern.log']),
    '/var/log/syslog':new Array(20).fill('Aug 18 00:00:01 adv9 systemd[1]: Started Session 1').join('\n'),
    '/var/log/auth.log':'Aug 18 00:00:01 adv9 sshd[1234]: Accepted password for user from 192.168.1.50',
    '/var/log/kern.log':'[    0.000000] Linux version 5.15.0-91-generic',
    '/var/www':_mkDir(['html']),
    '/var/www/html':_mkDir(['index.html']),
    '/var/www/html/index.html':'<html><body><h1>Hello World</h1></body></html>',
    '/usr':_mkDir(['bin','lib','share']),
    '/usr/bin':_mkDir(['python3','node','npm','git','vim','nano','curl','wget','ssh','gcc','make']),
    '/proc':_mkDir(['cpuinfo','meminfo','uptime']),
    '/proc/cpuinfo':'processor\t: 0\nmodel name\t: Intel Core i7-12700K\ncpu MHz\t\t: 3600.000\ncache size\t: 25600 KB',
    '/proc/meminfo':'MemTotal:       16384000 kB\nMemFree:         8192000 kB\nMemAvailable:   12288000 kB',
    '/proc/uptime':' 12345.67 98765.43',
    '/tmp':_mkDir([]),
    '/opt':_mkDir([]),
    '/root':_mkDir([])
  },
  kali:{
    '/':_mkDir(['home','etc','var','usr','opt','root','tmp','proc']),
    '/home':_mkDir(['kali']),
    '/home/kali':_mkDir(['Desktop','Documents','tools','.zshrc','.zsh_history']),
    '/home/kali/Desktop':_mkDir(['burpsuite.desktop','metasploit.desktop']),
    '/home/kali/Documents':_mkDir([]),
    '/home/kali/tools':_mkDir(['nmap','sqlmap','hashcat','john','hydra','burpsuite','metasploit']),
    '/home/kali/.zshrc':'# Kali .zshrc\nexport PATH=$PATH:/opt/metasploit-framework/bin\nalias msf="msfconsole -q"',
    '/home/kali/.zsh_history':'nmap -sV 192.168.1.0/24\nmsfconsole -q\nsqlmap -u "http://target.com/?id=1" --dbs',
    '/opt':_mkDir(['metasploit','burpsuite','wordlists']),
    '/opt/metasploit':_mkDir(['bin','data','modules']),
    '/opt/burpsuite':_mkDir(['lib']),
    '/opt/wordlists':_mkDir(['rockyou.txt','SecLists']),
    '/opt/wordlists/rockyou.txt':'password\n123456\n12345678\nqwerty\nabc123\nmonkey\nletmein',
    '/opt/wordlists/SecLists':_mkDir(['Discovery','Passwords']),
    '/usr':_mkDir(['bin','share']),
    '/usr/bin':_mkDir(['nmap','sqlmap','hashcat','john','hydra','airmon-ng','msfconsole','curl','wget','ssh','gcc','python3','ruby']),
    '/etc':_mkDir(['hostname','os-release']),
    '/etc/hostname':'kali',
    '/etc/os-release':'NAME="Kali GNU/Linux"\nVERSION="2024.1"\nID=kali',
    '/tmp':_mkDir([]),
    '/root':_mkDir([])
  },
  macos:{
    '/':_mkDir(['Users','Applications','System','Library','Volumes']),
    '/Users':_mkDir(['user']),
    '/Users/user':_mkDir(['Desktop','Documents','Downloads','.zshrc','Projects']),
    '/Users/user/Desktop':_mkDir([]),
    '/Users/user/Documents':_mkDir(['project']),
    '/Users/user/Downloads':_mkDir([]),
    '/Users/user/Projects':_mkDir(['adv9','portfolio']),
    '/Users/user/.zshrc':'# macOS .zshrc\nexport PATH=$PATH:/usr/local/bin',
    '/Applications':_mkDir(['Safari.app','Xcode.app','Terminal.app','Visual Studio Code.app']),
    '/System':_mkDir(['Library']),
    '/Library':_mkDir([]),
    '/Volumes':_mkDir([])
  },
  windows:{
    'C:\\':_mkDir(['Users','Windows','Program Files','Program Files (x86)']),
    'C:\\Users':_mkDir(['Admin','Public']),
    'C:\\Users\\Admin':_mkDir(['Desktop','Documents','Downloads']),
    'C:\\Users\\Admin\\Desktop':_mkDir(['project.zip','notes.txt']),
    'C:\\Users\\Admin\\Desktop\\notes.txt':'TODO:\n- Finish assignment\n- Deploy server',
    'C:\\Users\\Admin\\Documents':_mkDir([]),
    'C:\\Users\\Admin\\Downloads':_mkDir([]),
    'C:\\Users\\Public':_mkDir([]),
    'C:\\Windows':_mkDir(['System32','SysWOW64']),
    'C:\\Windows\\System32':_mkDir([]),
    'C:\\Program Files':_mkDir(['Google','Mozilla Firefox','Nodejs']),
    'C:\\Program Files (x86)':_mkDir([])
  }
};

function vTerminal(){
  var u=me();
  var o=TERM_OS_INFO[TERM_OS];
  _termHist=JSON.parse(localStorage.getItem(TERM_HIST_KEY)||'[]');
  _termHistIdx=_termHist.length;

  var osKeys=Object.keys(TERM_OS_INFO);
  var osBtns=osKeys.map(function(k){
    var info=TERM_OS_INFO[k];
    var active=k===TERM_OS;
    return '<button class="btn '+(active?'':'ghost')+' mini" onclick="termSwitchOS(\''+k+'\')" style="font-size:11px">'+info.name+'</button>';
  }).join('');

  $('#view').innerHTML=back()+
  '<h3 class="vt">💻 虛擬終端機 <span class="vsub">'+o.name+' 模擬環境</span></h3>'+
  '<div style="margin-bottom:8px;display:flex;gap:4px;flex-wrap:wrap;align-items:center">'+
  '<span style="font-size:12px;color:var(--mut);margin-right:4px">系統：</span>'+
  osBtns+'</div>'+
  '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
  /* Terminal */
  '<div style="flex:3;min-width:400px">'+
  '<div id="termWrap" style="position:relative;border-radius:10px;overflow:hidden;border:2px solid #333;box-shadow:0 8px 32px rgba(0,0,0,.6)">'+
  '<div style="background:#2d2d2d;padding:8px 14px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #444">'+
  '<div style="width:12px;height:12px;border-radius:50%;background:#ff5f56"></div>'+
  '<div style="width:12px;height:12px;border-radius:50%;background:#ffbd2e"></div>'+
  '<div style="width:12px;height:12px;border-radius:50%;background:#27c93f"></div>'+
  '<span style="flex:1;text-align:center;font-size:12px;color:#888;font-family:monospace">'+o.user+'@'+o.host+' — '+o.name+' Terminal</span>'+
  '<button class="btn ghost mini" onclick="termClear()" style="font-size:10px;padding:2px 6px">Clear</button>'+
  '</div>'+
  '<div id="termBox" style="background:#0d1117;padding:16px;height:50vh;overflow-y:auto;font-family:\'Cascadia Code\',\'Fira Code\',\'Source Code Pro\',\'Consolas\',monospace;font-size:13px;line-height:1.6;color:#c9d1d9;white-space:pre-wrap;word-break:break-all;cursor:text" onclick="document.getElementById(\'termInput\').focus()"></div>'+
  '<div style="background:#0d1117;padding:0 16px 12px;display:flex;gap:0;align-items:center;border-top:1px solid #21262d">'+
  '<span style="color:'+o.color+';font-weight:700;font-family:inherit;white-space:nowrap;user-select:none" id="termPrompt">'+termPromptHTML()+'</span>'+
  '<input id="termInput" style="flex:1;padding:6px 0;background:transparent;border:none;color:#c9d1d9;font-family:inherit;font-size:13px;outline:none;caret-color:'+o.color+'" autofocus>'+
  '</div></div></div>'+
  /* Agent Panel */
  '<div style="flex:1;min-width:260px">'+
  '<div style="background:#161b22;border:1px solid #30363d;border-radius:10px;overflow:hidden;height:calc(50vh + 52px)">'+
  '<div style="background:#21262d;padding:10px 14px;border-bottom:1px solid #30363d;display:flex;align-items:center;gap:8px">'+
  '<span style="font-size:14px">🤖</span>'+
  '<span style="color:#c9d1d9;font-size:13px;font-weight:600">Agent</span>'+
  '<span style="color:#8b949e;font-size:11px;margin-left:auto">指令助手</span>'+
  '</div>'+
  '<div id="agentBox" style="padding:12px;height:calc(50vh - 80px);overflow-y:auto;font-size:12px;color:#8b949e;line-height:1.6">'+_agentRenderHistory()+'</div>'+
  '<div style="padding:0 12px 12px;display:flex;gap:6px">'+
  '<input id="agentInput" placeholder="輸入指令讓 Agent 執行..." style="flex:1;padding:8px;background:#0d1117;border:1px solid #30363d;border-radius:6px;color:#c9d1d9;font-size:12px;outline:none" onkeydown="if(event.key===\'Enter\')agentExec()">'+
  '<button class="btn mini" onclick="agentExec()" style="font-size:11px">執行</button>'+
  '</div>'+
  '<div style="padding:0 12px 12px">'+
  '<div style="font-size:11px;color:#8b949e;margin-bottom:6px">快速指令：</div>'+
  '<div style="display:flex;flex-wrap:wrap;gap:4px">'+
  ['ls -la','whoami','uname -a','ping localhost','cat /etc/passwd','top','df -h','free -m','netstat -tlnp','history'].map(function(c){
    return '<button class="btn ghost mini" onclick="agentQuick(\''+c+'\')" style="font-size:10px;padding:2px 6px">'+c+'</button>';
  }).join('')+
  '</div></div>'+
  '</div></div></div>';

  _termCwd='/home/'+o.user;
  var box=$('#termBox');
  termPrintRaw('<span style="color:'+o.color+'">'+o.banner+'</span>');
  o.motd.split('\n').forEach(function(l){termPrintRaw('<span style="color:#8b949e">'+escHtml(l)+'</span>')});
  termPrintRaw('');
  var input=$('#termInput');
  input.addEventListener('keydown',function(e){
    if(e.key==='Enter'){e.preventDefault();termExec()}
    if(e.key==='ArrowUp'){e.preventDefault();termHistNav(-1)}
    if(e.key==='ArrowDown'){e.preventDefault();termHistNav(1)}
    if(e.key==='l'&&e.ctrlKey){e.preventDefault();var b=$('#termBox');if(b)b.innerHTML=''}
    if(e.key==='c'&&e.ctrlKey){e.preventDefault();termPrintRaw('<span style="color:#8b949e">^C</span>');input.value=''}
    if(e.key==='Tab'){
      e.preventDefault();
      var v=input.value;
      var fs=TERM_FS[TERM_OS]||{};
      var dir=fs[_termCwd];
      if(dir&&dir.d){
        var matches=dir.d.filter(function(n){return n.startsWith(v.split(' ').pop())});
        if(matches.length===1){input.value=v.split(' ').slice(0,-1).join(' ')+' '+matches[0]}
      }
    }
  });
  input.focus();
}

function termSwitchOS(os){
  TERM_OS=os;
  try{localStorage.setItem('term_os',os)}catch(e){}
  _termCwd='/home/'+TERM_OS_INFO[os].user;
  _termHist=JSON.parse(localStorage.getItem('term_hist_'+os)||'[]');
  vTerminal();
}

function termClear(){var b=$('#termBox');if(b)b.innerHTML=''}

function termPromptHTML(){
  var o=TERM_OS_INFO[TERM_OS];
  var cwd=_termCwd||'/home/'+o.user;
  var display=cwd.replace('/home/'+o.user,'~');
  return '<span style="color:'+o.userColor+'">'+o.user+'</span><span style="color:#8b949e">@</span><span style="color:'+o.hostColor+'">'+o.host+'</span> <span style="color:'+o.pathColor+'">'+escHtml(display)+'</span> <span style="color:'+o.color+'">'+o.prompt+'</span> ';
}

function termPrintRaw(html){
  var box=$('#termBox');if(!box)return;
  var div=document.createElement('div');
  div.innerHTML=html;
  box.appendChild(div);
  box.scrollTop=box.scrollHeight;
}

function termHistNav(dir){
  var input=$('#termInput');if(!input)return;
  if(dir===-1&&_termHistIdx>0){_termHistIdx--;input.value=_termHist[_termHistIdx]||''}
  if(dir===1){_termHistIdx++;input.value=_termHistIdx>=_termHist.length?'':_termHist[_termHistIdx]||''}
}

async function termExec(cmdOverride){
  var input=$('#termInput');
  var cmd=cmdOverride||(input?input.value.trim():'');
  if(input)input.value='';
  if(!cmd)return;
  _termHist.push(cmd);
  _termHistIdx=_termHist.length;
  try{localStorage.setItem(TERM_HIST_KEY,JSON.stringify(_termHist.slice(-500)))}catch(e){}
  if(!cmdOverride)termPrintRaw(termPromptHTML()+'<span style="color:#c9d1d9">'+escHtml(cmd)+'</span>');
  await _termRun(cmd);
}

async function _termRun(cmd){
  if(cmd==='clear'||cmd==='cls'){termClear();return}
  if(cmd==='history'){
    _termHist.forEach(function(c,i){termPrintRaw('<span style="color:#8b949e">'+(i+1).toString().padStart(4)+' </span><span style="color:#c9d1d9">'+escHtml(c)+'</span>')});
    return}

  if(cmd==='help'||cmd==='man'){
    var o=TERM_OS_INFO[TERM_OS];
    termPrintRaw('<span style="color:#e5c07b">═══ '+o.name+' Terminal — 可用指令 ═══</span>');
    ['help|顯示說明','date|日期時間','whoami|使用者','uname -a|系統資訊','ls [-la]|檔案列表','cd [路徑]|切換目錄','pwd|目前目錄','cat [檔]|檔案內容','echo [文字]|印出文字','history|歷史紀錄',
     'top|系統監控','ps aux|處理程序','df -h|磁碟空間','free -m|記憶體','netstat -tlnp|網路連線','ping [host]|ping 測試','ifconfig|網路介面',
     'stats|玩家統計','sudo [cmd]|管理員執行'].forEach(function(x){
      var p=x.split('|');
      termPrintRaw('<span style="color:#27c93f">'+p[0].padEnd(16)+'</span><span style="color:#8b949e">'+p[1]+'</span>');
    });
    if(TERM_OS==='kali'){
      ['nmap [host]|網路掃描','msfconsole|Metasploit','airmon-ng|無線網路','hashcat|密碼破解','sqlmap|SQL注入','john|密碼破解','hydra|暴力破解'].forEach(function(x){
        var p=x.split('|');
        termPrintRaw('<span style="color:#36b527">'+p[0].padEnd(16)+'</span><span style="color:#8b949e">'+p[1]+'</span>');
      });
    }
    if(TERM_OS==='windows'){
      ['dir|檔案列表','ipconfig|網路設定','type [檔]|檔案內容','systeminfo|系統資訊','tasklist|處理程序','whoami /all|詳細資訊'].forEach(function(x){
        var p=x.split('|');
        termPrintRaw('<span style="color:#56b6c2">'+p[0].padEnd(16)+'</span><span style="color:#8b949e">'+p[1]+'</span>');
      });
    }
    termPrintRaw('<span style="color:#8b949e">Ctrl+L 清除 | Ctrl+C 中斷 | ↑↓ 歷史 | Tab 補全 | 未知指令 → AI 回覆</span>');
    return}

  if(cmd==='date'){termPrintRaw('<span style="color:#c9d1d9">'+new Date().toString()+'</span>');return}
  if(cmd==='whoami'){termPrintRaw('<span style="color:#c9d1d9">'+TERM_OS_INFO[TERM_OS].user+'</span>');return}
  if(cmd==='pwd'){termPrintRaw('<span style="color:#c9d1d9">'+_termCwd+'</span>');return}
  if(cmd==='uname'||cmd==='uname -a'){
    var o=TERM_OS_INFO[TERM_OS];
    var s=TERM_OS==='linux'?'Linux adv9 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux':
          TERM_OS==='kali'?'Linux kali 6.5.0-kali3-amd64 #1 SMP Debian x86_64 GNU/Linux':
          TERM_OS==='macos'?'Darwin MacBook-Pro.local 23.3.0 Darwin Kernel Version 23.3.0 x86_64':
          'Windows_desktop DESKTOP-3K9Q7 10.0.22631 N/A Build 22631';
    termPrintRaw('<span style="color:#c9d1d9">'+s+'</span>');return}

  if(cmd==='cd'||cmd==='cd ~'){_termCwd='/home/'+TERM_OS_INFO[TERM_OS].user;return}
  if(cmd.startsWith('cd ')){
    var d=cmd.slice(3).trim();
    if(d==='..'){var parts=_termCwd.split('/').filter(Boolean);parts.pop();_termCwd='/'+parts.join('/')||'/home/'+TERM_OS_INFO[TERM_OS].user}
    else if(d==='/')_termCwd='/';
    else if(d.startsWith('/'))_termCwd=d;
    else{_termCwd=(_termCwd==='/'?'/':_termCwd+'/')+d}
    var fs=TERM_FS[TERM_OS]||{};
    var node=fs[_termCwd];
    if(!node||!node.d){
      termPrintRaw('<span style="color:#f85149">bash: cd: '+escHtml(d)+': No such file or directory</span>');
      _termCwd='/home/'+TERM_OS_INFO[TERM_OS].user;
    }
    return}

  if(cmd==='ls'||cmd==='ls -la'||cmd==='ls -l'){
    var fs=TERM_FS[TERM_OS]||{};
    var dir=fs[_termCwd];
    var children=(dir&&dir.d)?dir.d:[];[];
    if(!children.length){termPrintRaw('<span style="color:#8b949e">(empty)</span>');return}
    if(cmd==='ls -la'||cmd==='ls -l'){
      termPrintRaw('<span style="color:#8b949e">total '+children.length+'</span>');
      children.forEach(function(name){
        var full=_termCwd==='/'?'/':_termCwd+'/';
        full+=name;
        var isDir=_termIsDir(fs,full);
        var perms=isDir?'drwxr-xr-x':'-rw-r--r--';
        var sz=isDir?'4096':String(Math.floor(Math.random()*9000)+1000);
        termPrintRaw('<span style="color:#8b949e">'+perms+' 1 '+TERM_OS_INFO[TERM_OS].user+' '+TERM_OS_INFO[TERM_OS].user+' '+sz.padStart(5)+'  Aug 18 00:00 </span><span style="color:'+(isDir?'#58a6ff':'#c9d1d9')+'">'+escHtml(name)+(isDir?'/':'')+'</span>');
      });
    }else{
      termPrintRaw(children.map(function(n){
        var full=(_termCwd==='/'?'/':_termCwd+'/')+n;
        var isDir=_termIsDir(fs,full);
        return '<span style="color:'+(isDir?'#58a6ff':'#c9d1d9')+'">'+escHtml(n)+(isDir?'/':'')+'</span>';
      }).join('  '));
    }
    return}

  if(cmd.startsWith('cat ')){
    var f=cmd.slice(4).trim();
    var fs=TERM_FS[TERM_OS]||{};
    var base=(_termCwd==='/'?'/':_termCwd+'/');
    var full=base+f;
    var content=_termGetContent(fs,full);
    if(content!==null){termPrintRaw('<span style="color:#c9d1d9">'+escHtml(content)+'</span>')}
    else{termPrintRaw('<span style="color:#f85149">cat: '+escHtml(f)+': No such file or directory</span>')}
    return}

  if(cmd.startsWith('echo ')){
    termPrintRaw('<span style="color:#c9d1d9">'+escHtml(cmd.slice(5))+'</span>');return}

  if(cmd==='ps aux'){
    termPrintRaw('<span style="color:#c9d1d9">USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND</span>');
    termPrintRaw('<span style="color:#c9d1d9">root         1  0.0  0.1 169432 13064 ?        Ss   Aug17   0:02 /sbin/init</span>');
    termPrintRaw('<span style="color:#c9d1d9">'+TERM_OS_INFO[TERM_OS].user.padEnd(10)+'  1234  0.0  0.0  72380  5232 pts/0    Ss   '+new Date().toLocaleTimeString()+'   0:00 bash</span>');
    termPrintRaw('<span style="color:#c9d1d9">'+TERM_OS_INFO[TERM_OS].user.padEnd(10)+'  5678  1.2  2.1 987654 89012 ?        Sl   Aug17   1:23 node server.js</span>');
    termPrintRaw('<span style="color:#c9d1d9">'+TERM_OS_INFO[TERM_OS].user.padEnd(10)+'  9012  0.3  0.5 456789 23456 ?        Sl   Aug17   0:45 python3 sudoku_server.py</span>');
    return}

  if(cmd==='df -h'){
    termPrintRaw('<span style="color:#c9d1d9">Filesystem      Size  Used Avail Use% Mounted on</span>');
    termPrintRaw('<span style="color:#c9d1d9">/dev/sda1        50G   22G   26G  46% /</span>');
    termPrintRaw('<span style="color:#c9d1d9">tmpfs           7.8G  1.2M  7.8G   1% /dev/shm</span>');
    return}

  if(cmd==='free -m'){
    termPrintRaw('<span style="color:#c9d1d9">              total        used        free      shared  buff/cache   available</span>');
    termPrintRaw('<span style="color:#c9d1d9">Mem:          16384        8192        4096         256        4096        7680</span>');
    termPrintRaw('<span style="color:#c9d1d9">Swap:          4096           0        4096</span>');
    return}

  if(cmd==='ifconfig'){
    var ip=TERM_OS==='macos'?'en0':'eth0';
    termPrintRaw('<span style="color:#c9d1d9">'+ip+': flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500</span>');
    termPrintRaw('<span style="color:#c9d1d9">        inet 192.168.1.'+Math.floor(Math.random()*200+100)+'  netmask 255.255.255.0  broadcast 192.168.1.255</span>');
    termPrintRaw('<span style="color:#c9d1d9">        ether '+Array.from({length:6},function(){return Math.floor(Math.random()*256).toString(16).padStart(2,'0')}).join(':')+'</span>');
    return}

  if(cmd==='netstat -tlnp'){
    termPrintRaw('<span style="color:#c9d1d9">Active Internet connections (only servers)</span>');
    termPrintRaw('<span style="color:#c9d1d9">Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name</span>');
    termPrintRaw('<span style="color:#c9d1d9">tcp        0      511 0.0.0.0:8080            0.0.0.0:*               LISTEN      1234/node</span>');
    termPrintRaw('<span style="color:#c9d1d9">tcp        0      5 0.0.0.0:8083            0.0.0.0:*               LISTEN      5678/python3</span>');
    termPrintRaw('<span style="color:#c9d1d9">tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      901/sshd</span>');
    return}

  if(cmd.startsWith('ping ')){
    var host=cmd.slice(5).trim();
    termPrintRaw('<span style="color:#c9d1d9">PING '+escHtml(host)+' (127.0.0.1) 56(84) bytes of data.</span>');
    for(var i=1;i<=4;i++){termPrintRaw('<span style="color:#c9d1d9">64 bytes from '+escHtml(host)+': icmp_seq='+i+' ttl=64 time='+(0.5+Math.random()*2).toFixed(3)+' ms</span>')}
    termPrintRaw('<span style="color:#c9d1d9">--- '+escHtml(host)+' ping statistics ---</span>');
    termPrintRaw('<span style="color:#c9d1d9">4 packets transmitted, 4 received, 0% packet loss, time 3004ms</span>');
    return}

  if(cmd==='top'||cmd==='htop'){
    termPrintRaw('<span style="color:#c9d1d9"><span style="color:#e5c07b">top</span> - '+new Date().toLocaleTimeString()+' up 3 days, 14:23,  1 user,  load average: 0.42, 0.38, 0.35</span>');
    termPrintRaw('<span style="color:#c9d1d9">Tasks: <span style="color:#e5c07b"> 87</span> total,   <span style="color:#27c93f">  3</span> running,  <span style="color:#58a6ff"> 82</span> sleeping,   0 stopped,   2 zombie</span>');
    termPrintRaw('<span style="color:#c9d1d9">%Cpu(s):  <span style="color:#27c93f"> 4.2</span> us,  1.3 sy,  0.0 ni, 93.8 id,  0.5 wa,  0.0 hi,  0.2 si</span>');
    termPrintRaw('<span style="color:#c9d1d9">MiB Mem:  <span style="color:#e5c07b"> 16384.0</span> total,   <span style="color:#27c93f"> 4096.2</span> free,   <span style="color:#f85149"> 8192.4</span> used,   <span style="color:#8b949e"> 4095.4</span> buff/cache</span>');
    termPrintRaw('<span style="color:#8b949e">──────────────────────────────────────────────────────────────────────</span>');
    termPrintRaw('<span style="color:#c9d1d9"><span style="color:#e5c07b">  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND</span></span>');
    termPrintRaw('<span style="color:#c9d1d9">    1 root      20   0  169432  13064   8704 S   0.0   0.1   0:02.34 systemd</span>');
    termPrintRaw('<span style="color:#c9d1d9"> 1234 '+TERM_OS_INFO[TERM_OS].user+'      20   0   72380   5232   3680 S   0.0   0.0   0:00.12 bash</span>');
    termPrintRaw('<span style="color:#c9d1d9"> 5678 '+TERM_OS_INFO[TERM_OS].user+'      20   0  987654  89012  45678 S   1.2   0.5   1:23.45 node server</span>');
    termPrintRaw('<span style="color:#c9d1d9"> 9012 '+TERM_OS_INFO[TERM_OS].user+'      20   0  456789  23456  12345 S   0.3   0.1   0:45.67 python3</span>');
    return}

  if(cmd==='stats'||cmd==='stat'){
    var u=me();if(!u||!u.g){termPrintRaw('<span style="color:#f85149">Error: not logged in</span>');return}
    var g=u.g;
    termPrintRaw('<span style="color:#e5c07b">═══ 📊 玩家統計 ═══</span>');
    termPrintRaw('<span style="color:#27c93f">user</span>      <span style="color:#c9d1d9">'+u.username+'</span>');
    termPrintRaw('<span style="color:#27c93f">level</span>     <span style="color:#c9d1d9">Lv.'+g.lv+' ('+titleOf(g.lv)+')</span>');
    termPrintRaw('<span style="color:#27c93f">xp</span>        <span style="color:#c9d1d9">'+g.xp+'/'+g.needXp+'</span>');
    termPrintRaw('<span style="color:#e5c07b">gold</span> '+g.gold+'  <span style="color:#61afef">crystal</span> '+g.crystal+'  <span style="color:#c678dd">diamond</span> '+g.diamond);
    return}

  if(cmd==='exam'){
    var n=examCountdown();var d=examDate();
    termPrintRaw('<span style="color:#e5c07b">📝 國中教育會考</span>');
    termPrintRaw('<span style="color:#c9d1d9">倒數: <span style="color:#f85149;font-weight:bold">'+n+' 天</span>  日期: '+d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()+'</span>');
    return}

  if(cmd==='systeminfo'){
    termPrintRaw('<span style="color:#c9d1d9">Host Name:                 DESKTOP-3K9Q7</span>');
    termPrintRaw('<span style="color:#c9d1d9">OS Name:                   Microsoft Windows 11 Pro</span>');
    termPrintRaw('<span style="color:#c9d1d9">OS Version:                10.0.22631 N/A Build 22631</span>');
    termPrintRaw('<span style="color:#c9d1d9">System Manufacturer:       Adv9 Virtual Machine</span>');
    termPrintRaw('<span style="color:#c9d1d9">Processor:                 Intel(R) Core(TM) i7-12700K @ 3.60GHz</span>');
    termPrintRaw('<span style="color:#c9d1d9">Total Physical Memory:     16,384 MB</span>');
    return}

  if(cmd==='tasklist'){
    termPrintRaw('<span style="color:#c9d1d9">Image Name                     PID Session Name        Mem Usage</span>');
    termPrintRaw('<span style="color:#c9d1d9">========================= ======== ================ ============</span>');
    termPrintRaw('<span style="color:#c9d1d9">System Idle Process              0 Services                   8 K</span>');
    termPrintRaw('<span style="color:#c9d1d9">node.exe                      1234 Console                89,012 K</span>');
    termPrintRaw('<span style="color:#c9d1d9">python.exe                    5678 Console                23,456 K</span>');
    return}

  /* ── Kali 專屬 ── */
  if(TERM_OS==='kali'){
    if(cmd==='nmap'||cmd.startsWith('nmap ')){
      var host=cmd==='nmap'?'localhost':cmd.slice(5).trim();
      termPrintRaw('<span style="color:#36b527">Starting Nmap 7.94SVN ( https://nmap.org ) at '+new Date().toLocaleTimeString()+'</span>');
      await _termDelay(500);
      termPrintRaw('<span style="color:#c9d1d9">Nmap scan report for '+escHtml(host)+' (127.0.0.1)</span>');
      termPrintRaw('<span style="color:#c9d1d9">Host is up (0.0023s latency).</span>');
      termPrintRaw('<span style="color:#c9d1d9">PORT     STATE  SERVICE     VERSION</span>');
      termPrintRaw('<span style="color:#c9d1d9">22/tcp   open   ssh         OpenSSH 8.9p1</span>');
      termPrintRaw('<span style="color:#c9d1d9">80/tcp   open   http        nginx 1.18.0</span>');
      termPrintRaw('<span style="color:#c9d1d9">443/tcp  open   https       nginx 1.18.0</span>');
      termPrintRaw('<span style="color:#c9d1d9">3306/tcp open   mysql       MySQL 8.0.35</span>');
      termPrintRaw('<span style="color:#36b527">Nmap done: 1 IP address (1 host up) scanned in 0.42s</span>');
      return}

    if(cmd==='msfconsole'){
      termPrintRaw('<span style="color:#c9d1d9">     =[ metasploit v6.3.44-dev ]</span>');
      termPrintRaw('<span style="color:#c9d1d9">+ -- --=[ 2380 exploits - 1241 auxiliary ]</span>');
      termPrintRaw('<span style="color:#c9d1d9">+ -- --=[ 429 payloads - 47 encoders - 11 nops ]</span>');
      termPrintRaw('<span style="color:#36b527">msf6 ></span> <span style="color:#8b949e">Ready for commands...</span>');
      return}

    if(cmd==='airmon-ng'){
      termPrintRaw('<span style="color:#c9d1d9">PHY     Interface   Driver      Chipset</span>');
      termPrintRaw('<span style="color:#c9d1d9">phy0    wlan0       ath9k_htc   Qualcomm Atheros AR9271</span>');
      return}

    if(cmd==='hashcat'){
      termPrintRaw('<span style="color:#c9d1d9">hashcat (v6.2.6) starting...</span>');
      termPrintRaw('<span style="color:#c9d1d9">CUDA API (CUDA 12.2)</span>');
      termPrintRaw('<span style="color:#c9d1d9">* Device #1: NVIDIA GeForce RTX 3080, 9528MB</span>');
      termPrintRaw('<span style="color:#8b949e">Usage: hashcat -m 0 -a 0 hash.txt wordlist.txt</span>');
      return}

    if(cmd.startsWith('sqlmap')){
      termPrintRaw('<span style="color:#c9d1d9">[!] legal disclaimer: Usage of sqlmap for attacking targets...</span>');
      termPrintRaw('<span style="color:#36b527">[*] starting @ '+new Date().toLocaleTimeString()+'</span>');
      termPrintRaw('<span style="color:#c9d1d9">[INFO] testing connection to the target URL</span>');
      termPrintRaw('<span style="color:#c9d1d9">[INFO] testing \'AND boolean-based blind - WHERE or HAVING clause\'</span>');
      return}

    if(cmd==='sudo apt update'){
      termPrintRaw('<span style="color:#c9d1d9">Hit:1 http://kali.download/kali kali-rolling InRelease</span>');
      termPrintRaw('<span style="color:#c9d1d9">Reading package lists... Done</span>');
      termPrintRaw('<span style="color:#c9d1d9">All packages are up to date.</span>');
      return}
  }

  if(!cmd)return;

  /* sudo */
  if(cmd.startsWith('sudo ')){
    var sc=cmd.slice(5).trim();
    var o=TERM_OS_INFO[TERM_OS];
    termPrintRaw('<span style="color:#e5c07b">[sudo] password for '+o.user+': </span><span style="color:#8b949e">********</span>');
    termPrintRaw('<span style="color:#c9d1d9">'+o.user+'@'+o.host+':~$ '+escHtml(sc)+'</span>');
    if(sc==='rm -rf /'||sc==='rm -rf /*'){termPrintRaw('<span style="color:#f85149">Nice try! 這裡是虛擬環境。</span>');return}
    await _termRun(sc);
    return}

  /* AI fallback */
  termPrintRaw('<span style="color:#8b949e">⏳ 正在處理...</span>');
  try{
    var aiReply=await callAI('你是 '+TERM_OS_INFO[TERM_OS].name+' 終端機。用戶輸入：「'+cmd+'」。用'+TERM_OS_INFO[TERM_OS].name+'終端格式簡短回覆（3行以內），不要 markdown，純文字。模擬真實終端回應。','你是 '+TERM_OS_INFO[TERM_OS].name+' 終端機，簡潔，3行以內。');
    termPrintRaw('<span style="color:#c9d1d9">'+escHtml(aiReply||'(no output)')+'</span>');
  }catch(e){termPrintRaw('<span style="color:#f85149">'+escHtml(cmd.split(' ')[0])+': command not found</span>')}
  termPrintRaw('');
}

function _termIsDir(fs,path){
  var node=fs[path];
  return node&&node.d&&Array.isArray(node.d);
}
function _termGetContent(fs,path){
  var node=fs[path];
  if(!node)return null;
  if(typeof node==='string')return node;
  return null;
}
function _termDelay(ms){return new Promise(function(r){setTimeout(r,ms)})}

function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

/* ── Agent Panel ── */
function _agentRenderHistory(){
  if(!_termAgentCmds.length)return '<div style="color:#8b949e;text-align:center;padding:20px">在下方輸入指令<br>Agent 會在終端機執行</div>';
  return _termAgentCmds.map(function(item){
    return '<div style="margin-bottom:8px;border-left:2px solid #30363d;padding-left:8px">'+
      '<div style="color:#58a6ff;font-size:11px">$ '+escHtml(item.cmd)+'</div>'+
      '<div style="color:#8b949e;font-size:10px">'+item.time+'</div>'+
      '</div>';
  }).join('');
}

function agentExec(){
  var input=$('#agentInput');if(!input)return;
  var cmd=input.value.trim();
  if(!cmd)return;
  input.value='';
  var time=new Date().toLocaleTimeString();
  _termAgentCmds.push({cmd:cmd,time:time});
  if(_termAgentCmds.length>50)_termAgentCmds=_termAgentCmds.slice(-50);
  try{localStorage.setItem('term_agent_cmds',JSON.stringify(_termAgentCmds))}catch(e){}
  var box=$('#agentBox');if(box)box.innerHTML=_agentRenderHistory();
  termPrintRaw(termPromptHTML()+'<span style="color:#c9d1d9">'+escHtml(cmd)+'</span>');
  _termRun(cmd);
}

function agentQuick(cmd){
  var input=$('#agentInput');if(input)input.value=cmd;
  agentExec();
}
