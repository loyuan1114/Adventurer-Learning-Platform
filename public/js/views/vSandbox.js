/* ════════════════════════════════════════════
   vSandbox — 程式碼沙盒頁 v2
   支援：Python / 草蟒(中文Py) / C++ / 丙正正(中文C++) / Java
   ════════════════════════════════════════════ */

const SANDBOX_LANGS=[
  {id:'python',name:'Python',aliases:['草蟒','蟒蛇','蟒'],ext:'.py',icon:'🐍',defaultCode:'# Python\nprint("Hello, World!")'},
  {id:'cpp',name:'C++',aliases:['丙正正','丙正','C+'],ext:'.cpp',icon:'⚙️',defaultCode:'#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}'},
  {id:'java',name:'Java',aliases:['Java','甲瓦'],ext:'.java',icon:'☕',defaultCode:'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'}
];

let SB_STATE={lang:'python',code:'',output:null,running:false};

/* 從中文名或 id 解析語言 */
function parseSandboxLang(input){
  var s=(input||'').trim().toLowerCase();
  for(var i=0;i<SANDBOX_LANGS.length;i++){
    var l=SANDBOX_LANGS[i];
    if(l.id===s)return l;
    if(l.name.toLowerCase()===s)return l;
    if(l.aliases&&l.aliases.some(function(a){return a.toLowerCase()===s}))return l;
  }
  return SANDBOX_LANGS[0]; /* 預設 Python */
}

function vSandbox(){
  const u=me();if(!u||!u.g)return;
  var langInfo=parseSandboxLang(SB_STATE.lang);

  let h=back()+'<h3 class="vt">💻 程式碼沙盒</h3>';
  h+='<div class="panel2" style="margin-bottom:12px;font-size:12px;color:var(--mut)">在安全沙盒中執行程式碼（CPU/記憶體/時間限制）。支援 '+SANDBOX_LANGS.map(function(l){return l.icon+' '+l.name+(l.aliases.length?' ('+l.aliases[0]+')':'')}).join(' / ')+'</div>';

  /* 語言選擇 */
  h+='<div style="display:flex;gap:6px;margin-bottom:10px">';
  SANDBOX_LANGS.forEach(function(l){
    h+='<button class="btn '+(langInfo.id===l.id?'':'ghost')+' mini" onclick="SB_STATE.lang=\''+l.id+'\';SB_STATE.code=\'\';vSandbox()">'+l.icon+' '+l.name+'</button>';
  });
  h+='</div>';

  /* 程式碼編輯區 */
  var code=SB_STATE.code||langInfo.defaultCode;
  h+='<div class="panel2" style="margin-bottom:10px">';
  h+='<textarea id="sbCode" rows="16" style="width:100%;padding:10px;background:#1e1e1e;border:1px solid var(--line);border-radius:6px;color:#d4d4d4;font-family:Consolas,Monaco,monospace;font-size:13px;resize:vertical;tab-size:4" placeholder="在這裡寫程式碼...">'+esc(code)+'</textarea>';
  h+='</div>';

  /* 控制區 */
  h+='<div style="display:flex;gap:8px;margin-bottom:10px">';
  h+='<button class="btn big" onclick="runSandbox()" '+(SB_STATE.running?'disabled':'')+'>'+(SB_STATE.running?'⏳ 執行中...':'▶️ 執行')+'</button>';
  h+='<button class="btn ghost" onclick="SB_STATE.code=\'\';vSandbox()">🔄 清空</button>';
  h+='</div>';

  /* 輸出區 */
  if(SB_STATE.output){
    h+='<div class="panel2" style="margin-bottom:10px">';
    h+='<div style="font-size:12px;color:var(--mut);margin-bottom:6px">📋 執行結果：</div>';
    if(SB_STATE.output.error){
      h+='<pre style="background:#1e1e1e;color:#f44336;padding:10px;border-radius:6px;font-size:12px;overflow-x:auto;white-space:pre-wrap">'+esc(SB_STATE.output.error)+'</pre>';
    }else{
      h+='<pre style="background:#1e1e1e;color:#d4d4d4;padding:10px;border-radius:6px;font-size:12px;overflow-x:auto;white-space:pre-wrap">'+esc(SB_STATE.output.stdout||'(無輸出)')+'</pre>';
    }
    if(SB_STATE.output.stderr){
      h+='<div style="font-size:11px;color:#ff9800;margin-top:4px">⚠️ '+esc(SB_STATE.output.stderr).substring(0,300)+'</div>';
    }
    h+='<div style="font-size:11px;color:var(--mut);margin-top:6px">執行時間：'+(SB_STATE.output.time_ms||0)+'ms | 退出碼：'+(SB_STATE.output.exit_code||0)+'</div>';
    h+='</div>';
  }

  /* AI 除錯按鈕 */
  if(SB_STATE.output&&(SB_STATE.output.error||SB_STATE.output.exit_code!==0)){
    h+='<button class="btn ghost" onclick="sandboxDebugHint()">🤖 AI 除錯提示（不給完整答案）</button>';
  }

  $('#view').innerHTML=h;
}

async function runSandbox(){
  var code=(document.getElementById('sbCode')||{}).value||'';
  if(!code.trim())return toast('請先寫程式碼','bad');
  SB_STATE.code=code;
  SB_STATE.running=true;
  vSandbox();

  try{
    var res=await fetch('/rest/v1/sandbox/run',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-adv9-token':WTOKEN||''},
      body:JSON.stringify({lang:SB_STATE.lang,code:code})
    });
    var result=await res.json();
    SB_STATE.output=result;
    SB_STATE.running=false;
    vSandbox();
  }catch(e){
    SB_STATE.output={error:'執行失敗：'+e.message};
    SB_STATE.running=false;
    vSandbox();
  }
}

async function sandboxDebugHint(){
  if(!SB_STATE.output)return;
  var code=SB_STATE.code||'';
  var errorMsg=SB_STATE.output.error||SB_STATE.output.stderr||SB_STATE.output.stdout||'';
  var langInfo=parseSandboxLang(SB_STATE.lang);

  try{
    var templates=getSocraticTemplates();
    var prompt=templates.codeDebug
      .replace('{question}','學生的程式碼')
      .replace('{language}',langInfo.name)
      .replace('{student_code}',code.substring(0,500))
      .replace('{result}',errorMsg.substring(0,300));

    toast('🤖 AI 正在分析程式碼...');
    var hint=await callAIV2(prompt,'你是程式除錯導師。不要直接給出完整修正程式碼。');
    toast('💡 '+hint.substring(0,200));
  }catch(e){
    toast('AI 除錯提示失敗：'+e.message,'bad');
  }
}
