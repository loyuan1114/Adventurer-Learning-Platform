const fs = require('fs');
const base = 'C:/Users/weimyown/AppData/Local/Temp/Adventurer-Learning-Platform/';
const out = base + 'intro-video.html';

// Load slides
eval(fs.readFileSync(base + 'slides-data.js', 'utf8'));

// Build head
const head = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1280, height=720">
<title>ADV9 Adventurer Learning Platform</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0a0a1a;--card:#12122a;--border:#2a2a4a;--accent:#7c3aed;--accent2:#06b6d4;--accent3:#f59e0b;--accent4:#ef4444;--accent5:#10b981;--text:#e2e8f0;--muted:#94a3b8;--white:#fff}
body{font-family:'Inter','Noto Sans TC',sans-serif;background:var(--bg);color:var(--text);overflow:hidden;width:1280px;height:720px}
.sc{width:1280px;height:720px;position:relative}
.s{position:absolute;top:0;left:0;width:1280px;height:720px;display:flex;flex-direction:column;justify-content:center;align-items:center;opacity:0;transform:scale(.95) translateY(20px);transition:all .7s cubic-bezier(.16,1,.3,1);pointer-events:none;padding:60px 80px}
.s.a{opacity:1;transform:scale(1) translateY(0);pointer-events:all}
.s.e{opacity:0;transform:scale(.95) translateY(-20px)}
.bg{position:fixed;top:0;left:0;width:1280px;height:720px;z-index:-1;pointer-events:none}
.bg .o1{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,.12) 0%,transparent 70%);top:-150px;right:-150px;animation:d 10s ease-in-out infinite}
.bg .o2{position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(6,182,212,.1) 0%,transparent 70%);bottom:-150px;left:-150px;animation:d 10s ease-in-out infinite reverse}
@keyframes d{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
.ts{text-align:center}
.ts .logo{font-size:90px;margin-bottom:16px;animation:b 2s ease-in-out infinite}
@keyframes b{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.ts h1{font-size:60px;font-weight:900;background:linear-gradient(135deg,var(--accent),var(--accent2),var(--accent3));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:12px}
.ts .sub{font-size:26px;color:var(--muted);font-weight:500}
.sh{text-align:center}
.sh .ico{font-size:72px;margin-bottom:16px}
.sh h2{font-size:50px;font-weight:800;margin-bottom:8px}
.sh .en{font-size:24px;color:var(--muted);font-weight:500}
.sh .desc{font-size:18px;color:var(--muted);margin-top:12px;max-width:700px}
.fg{display:grid;gap:16px;width:100%;max-width:1100px}
.fg.c2{grid-template-columns:1fr 1fr}
.fg.c3{grid-template-columns:1fr 1fr 1fr}
.fc{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;transition:all .3s}
.fc:hover{border-color:var(--accent);transform:translateY(-3px);box-shadow:0 8px 24px rgba(124,58,237,.15)}
.fc .ci{font-size:32px;margin-bottom:8px}
.fc h3{font-size:18px;font-weight:700;color:var(--white);margin-bottom:2px}
.fc .ce{font-size:13px;color:var(--accent2);margin-bottom:6px}
.fc p{font-size:13px;color:var(--muted);line-height:1.5}
.badge{display:inline-block;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600;margin:4px}
.badge.p{background:rgba(124,58,237,.2);color:var(--accent)}
.badge.c{background:rgba(6,182,212,.2);color:var(--accent2)}
.badge.a{background:rgba(245,158,11,.2);color:var(--accent3)}
.badge.r{background:rgba(239,68,68,.2);color:var(--accent4)}
.badge.g{background:rgba(16,185,129,.2);color:var(--accent5)}
.stats{display:flex;gap:48px;margin-top:28px}
.stat{text-align:center}
.stat .sn{font-size:52px;font-weight:900;background:linear-gradient(135deg,var(--accent3),var(--accent4));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.stat .sl{font-size:15px;color:var(--muted);margin-top:4px}
.tbl{width:100%;max-width:1100px;border-collapse:collapse;font-size:14px}
.tbl th{background:var(--card);padding:12px 14px;text-align:left;font-weight:700;border-bottom:2px solid var(--accent);color:var(--white)}
.tbl td{padding:10px 14px;border-bottom:1px solid var(--border)}
.tbl tr:nth-child(even) td{background:rgba(124,58,237,.04)}
.tbl .hl{color:var(--accent3);font-weight:700}
.code{background:#0d1117;border:1px solid var(--border);border-radius:12px;padding:20px 28px;font-family:'Fira Code',Consolas,monospace;font-size:15px;line-height:1.8;color:#e6edf3;width:100%;max-width:800px;text-align:left}
.code .cm{color:#8b949e}.code .kw{color:#ff7b72}.code .st{color:#a5d6ff}.code .fn{color:#d2a8ff}
.fl{list-style:none;padding:0;width:100%;max-width:1000px}
.fl li{display:flex;align-items:flex-start;gap:14px;padding:10px 0;border-bottom:1px solid var(--border);font-size:17px}
.fl li:last-child{border-bottom:none}
.fl .fi{font-size:26px;flex-shrink:0}
.fl .ft strong{color:var(--white);display:block;margin-bottom:2px}
.fl .ft span{color:var(--muted);font-size:14px}
.tc{display:flex;gap:40px;width:100%;max-width:1100px;align-items:flex-start}
.tc .l,.tc .r{flex:1}
.tc h3{font-size:22px;font-weight:700;margin-bottom:12px;color:var(--white)}
.dc{display:flex;gap:20px;width:100%;max-width:1100px}
.dc .cd{flex:1;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:28px;text-align:center}
.dc .cd .di{font-size:44px;margin-bottom:10px}
.dc .cd h3{font-size:20px;font-weight:700;color:var(--white);margin-bottom:6px}
.dc .cd p{font-size:13px;color:var(--muted);line-height:1.5}
.dc .cd .tg{display:inline-block;background:rgba(124,58,237,.2);color:var(--accent);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;margin-top:10px}
.cta{text-align:center}
.cta h2{font-size:48px;font-weight:900;margin-bottom:12px}
.cta p{font-size:22px;color:var(--muted);margin-bottom:36px}
.cta-btns{display:flex;gap:20px;justify-content:center}
.cta-btn{display:inline-flex;align-items:center;gap:10px;padding:16px 36px;border-radius:12px;font-size:18px;font-weight:700;text-decoration:none;transition:all .3s}
.cta-btn.pri{background:linear-gradient(135deg,var(--accent),#9333ea);color:var(--white)}
.cta-btn.sec{background:var(--card);border:1px solid var(--border);color:var(--text)}
.cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(124,58,237,.3)}
.ag{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;width:100%;max-width:900px}
.ag .ai{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;text-align:center}
.ag .ai .ai-i{font-size:36px;margin-bottom:6px}
.ag .ai h4{font-size:16px;font-weight:700;color:var(--white)}
.ag .ai p{font-size:12px;color:var(--muted);margin-top:4px}
.pb{position:fixed;bottom:0;left:0;width:1280px;height:4px;background:var(--border);z-index:100}
.pb div{height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));width:0%;transition:width .4s ease}
.cnt{position:fixed;bottom:14px;right:30px;font-size:13px;color:var(--muted);z-index:100}
.hint{position:fixed;bottom:14px;left:30px;font-size:13px;color:var(--muted);opacity:.5;z-index:100}
</style>
</head>
<body>
<div class="bg"><div class="o1"></div><div class="o2"></div></div>
<div class="sc" id="slides"></div>
<div class="pb"><div id="bar"></div></div>
<div class="cnt" id="cnt"></div>
<div class="hint">Space / Click / Arrow keys | Press A for auto-play</div>
<script>
const SLIDES=[`;

const tail = `];
let cur=0;
const S=SLIDES.length;
const c=document.getElementById('slides');
const b=document.getElementById('bar');
const n=document.getElementById('cnt');
SLIDES.forEach((h,i)=>{const d=document.createElement('div');d.className='s'+(i===0?' a':'');d.innerHTML=h;c.appendChild(d)});
function ui(){b.style.width=((cur+1)/S*100)+'%';n.textContent=(cur+1)+' / '+S}
function go(i){if(i<0||i>=S)return;const ss=c.querySelectorAll('.s');ss[cur].classList.remove('a');ss[cur].classList.add('e');const p=cur;cur=i;ss[cur].classList.add('a');setTimeout(()=>ss[p].classList.remove('e'),700);ui()}
function nx(){go(cur+1)}function pv(){go(cur-1)}
document.addEventListener('keydown',e=>{if(e.key===' '||e.key==='ArrowRight'||e.key==='Enter'){e.preventDefault();nx()}if(e.key==='ArrowLeft'||e.key==='Backspace'){e.preventDefault();pv()}if(e.key==='Home'){e.preventDefault();go(0)}if(e.key==='End'){e.preventDefault();go(S-1)}});
c.addEventListener('click',e=>{if(e.clientX>640)nx();else pv()});
let at=null;document.addEventListener('keydown',e=>{if(e.key==='a'||e.key==='A'){if(at){clearInterval(at);at=null}else{at=setInterval(nx,5000)}}});
ui();
</script>
</body>
</html>`;

// Combine: head + slide strings + tail
let slidesStr = SLIDES.map(s => {
  // Escape backticks and ${} in slide content
  return '`' + s.replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';
}).join(',\n');

const full = head + slidesStr + tail;
fs.writeFileSync(out, full, 'utf8');
console.log('Written', full.length, 'bytes');
console.log('Slides:', SLIDES.length);
console.log('File:', out);
