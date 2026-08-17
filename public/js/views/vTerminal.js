/* ════════════════════════════════════════════
   vTerminal 虛擬終端機（splitall.py 自動拆分，懶載入）
   ════════════════════════════════════════════ */
function vTerminal(){
const u=me();
$('#view').innerHTML=back()+
'<h3 class="vt">💻 虛擬終端機 <span class="vsub">AI 驅動・模擬真實指令列</span></h3>'+
'<div class="panel2" style="margin-bottom:10px;border-left:4px solid #00e676;font-size:12.5px;color:var(--mut)">輸入指令，AI 會模擬真實終端回覆。可用指令：help / date / whoami / ls / cat / echo / clear / stats / quiz / joke</div>'+
'<div id="termBox" style="background:#0a0e14;border:1px solid #1e2d4a;border-radius:8px;padding:12px;min-height:400px;max-height:65vh;overflow-y:auto;font-family:\'Cascadia Code\',\'Fira Code\',\'Consolas\',monospace;font-size:13px;line-height:1.7;color:#c5d1de;white-space:pre-wrap;word-break:break-all"></div>'+
'<div style="display:flex;gap:6px;margin-top:8px;align-items:center">'+
'<span style="color:#00e676;font-weight:700;font-family:monospace">$</span>'+
'<input id="termInput" placeholder="輸入指令…" style="flex:1;padding:10px 12px;background:#0a0e14;border:1px solid #1e2d4a;border-radius:6px;color:#c5d1de;font-family:inherit;font-size:13px;outline:none" autofocus>'+
'<button class="btn teal mini" onclick="termExec()">⏎ 執行</button>'+
'</div>';
var box=$('#termBox');
termPrint('green','Adv9 Terminal v5.0.0 — 虛擬終端機（AI 驅動）');
termPrint('gray','輸入 help 查看可用指令。所有指令由 AI 模擬回覆。');
termPrint('gray','────────────────────────────────────────');
box.scrollTop=box.scrollHeight;
var input=$('#termInput');
input.addEventListener('keydown',function(e){if(e.key==='Enter')termExec()});
input.focus();
}

var _termHist=[];
var _termHistIdx=-1;

function termPrint(color,text){
var box=$('#termBox');if(!box)return;
var span=document.createElement('span');
var colors={green:'#00e676',red:'#ff5252',yellow:'#ffd740',cyan:'#00e5ff',gray:'#6b7a8d',white:'#c5d1de'};
span.style.color=colors[color]||colors.white;
span.textContent=text+'\n';
box.appendChild(span);
}

function termPrintHTML(html){
var box=$('#termBox');if(!box)return;
var div=document.createElement('div');
div.innerHTML=html;
box.appendChild(div);
}

async function termExec(){
var input=$('#termInput');if(!input)return;
var cmd=input.value.trim();
input.value='';
if(!cmd)return;
_termHist.push(cmd);
_termHistIdx=_termHist.length;
termPrint('cyan','$ '+cmd);
if(cmd==='clear'){var box=$('#termBox');if(box)box.innerHTML='';termPrint('green','已清除。');return}
if(cmd==='help'){
termPrint('white','可用指令：');
termPrint('gray','  help          顯示此說明');
termPrint('gray','  date          顯示目前日期時間');
termPrint('gray','  whoami        顯示使用者資訊');
termPrint('gray','  ls [路徑]     列出檔案');
termPrint('gray','  cat [檔案]    顯示檔案內容');
termPrint('gray','  echo [文字]   印出文字');
termPrint('gray','  stats         顯示玩家統計');
termPrint('gray','  quiz          AI 出題（選擇題）');
termPrint('gray','  joke          AI 講笑話');
termPrint('gray','  clear         清除畫面');
termPrint('gray','  exam          查詢會考日期');
termPrint('gray','  any other...  AI 自由回覆');
var box=$('#termBox');if(box)box.scrollTop=box.scrollHeight;return}
if(cmd==='date'){var now=new Date();termPrint('white',now.toString());var box=$('#termBox');if(box)box.scrollTop=box.scrollHeight;return}
if(cmd==='whoami'){
var u=me();
termPrint('white','user: '+(u?u.username:'unknown'));
termPrint('white','role: '+(u?u.role:'unknown'));
termPrint('white','level: '+(u&&u.g?u.g.lv:'?'));
termPrint('white','class: '+(u&&u.classId?u.classId:'未分班'));
termPrint('white','platform: Adv9 Learning Platform v5.0.0');
var box=$('#termBox');if(box)box.scrollTop=box.scrollHeight;return}
if(cmd==='stats'){
var u=me();if(!u||!u.g){termPrint('red','錯誤：未登入');return}
var g=u.g;
termPrint('white','═══ 📊 玩家統計 ═══');
termPrint('white','等級: Lv.'+g.lv+' ('+titleOf(g.lv)+')');
termPrint('white','經驗: '+g.xp+'/'+g.needXp);
termPrint('white','戰力: '+power(g));
termPrint('white','金幣: '+g.gold+' | 水晶: '+g.crystal+' | 鑽石: '+g.diamond);
termPrint('white','星芒: '+g.starlight+' | 榮譽: '+g.honor);
termPrint('white','連勝: '+g.combo+' | 轉生: '+(g.rebirth||0));
var box=$('#termBox');if(box)box.scrollTop=box.scrollHeight;return}
if(cmd==='exam'){
var n=examCountdown();var d=examDate();
termPrint('white','📝 國中教育會考倒數: '+n+' 天');
termPrint('white','日期: '+d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate());
termPrint('white','來源: '+(examSrc()==='ai'?'🤖 AI 查詢':'預估'));
termPrint('gray','提示：首頁有「🔄 AI 更新日期」按鈕可自動查詢最新日期');
var box=$('#termBox');if(box)box.scrollTop=box.scrollHeight;return}
if(cmd.startsWith('echo ')){termPrint('white',cmd.slice(5));var box=$('#termBox');if(box)box.scrollTop=box.scrollHeight;return}
if(cmd==='ls'){
termPrint('white','public/    server.js    data/    media/');
termPrint('gray','         docker-compose.yml  Dockerfile  README.md');
var box=$('#termBox');if(box)box.scrollTop=box.scrollHeight;return}
if(cmd.startsWith('cat ')){
termPrint('gray','cat: '+cmd.slice(4)+': 虛擬檔案（模擬模式下僅顯示提示）');
var box=$('#termBox');if(box)box.scrollTop=box.scrollHeight;return}
if(cmd==='quiz'){
termPrint('white','🤖 AI 出題中...');
termPrint('gray','（提示：使用「✏️ 修煉場」進行正式答題可獲得獎勵）');
var box=$('#termBox');if(box)box.scrollTop=box.scrollHeight;return}
if(cmd==='joke'){
termPrint('white','🤖 AI 笑話機器人：');
termPrint('gray','（提示：使用 AI 助理功能可獲得完整回覆）');
var box=$('#termBox');if(box)box.scrollTop=box.scrollHeight;return}
/* 其他指令 → 嘗試用 AI 回覆 */
termPrint('gray','🤖 AI 處理中...');
try{
var aiReply=await callAI('你是 Adv9 虛擬終端機。用戶輸入了一個終端指令：「'+cmd+'」。請用終端機風格簡短回覆（3行以內），模擬真實 Linux/Windows 終端的回應格式。不要使用 markdown 格式。','你是 Adv9 虛擬終端機。回覆要像真實終端一樣簡潔，3行以內。');
termPrint('white',aiReply||'(no response)');
}catch(e){termPrint('red','AI 回覆失敗：'+(e.message||'未知錯誤')+'（請確認已設定 API 金鑰）')}
var box=$('#termBox');if(box)box.scrollTop=box.scrollHeight;
}
