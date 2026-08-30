/* ════ 📩 管理員發信箱 ════ */
function vAdminMail(){
  const users=get(LS.users,[]).filter(u=>u.role==='student');
  const students=users.map(u=>u.username+' ('+(u.name||u.username)+')').join('\n');
  let h='<h3 class="vt">📩 管理員發信箱</h3>';
  h+='<div class="panel2" style="margin-bottom:12px">';
  h+='<div style="font-size:13px;color:var(--mut);margin-bottom:8px">共 '+users.length+' 位學生</div>';
  h+='<div style="margin-bottom:10px"><label style="font-size:12px;color:var(--mut)">🎯 目標學生（username，多人用逗號分隔，空白=全服）</label>';
  h+='<input id="amTo" placeholder="例如: student1,student2 或留空=全服" style="width:100%;padding:8px;margin-top:4px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px"></div>';
  h+='<div style="margin-bottom:10px"><label style="font-size:12px;color:var(--mut)">📝 信件標題</label>';
  h+='<input id="amTitle" placeholder="例如: 🎁 作業完成獎勵" style="width:100%;padding:8px;margin-top:4px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px"></div>';
  h+='<div style="margin-bottom:10px"><label style="font-size:12px;color:var(--mut)">📄 信件內容</label>';
  h+='<textarea id="amBody" rows="3" placeholder="信件內容..." style="width:100%;padding:8px;margin-top:4px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt);font-size:13px;resize:vertical"></textarea></div>';
  h+='<div style="margin-bottom:10px"><label style="font-size:12px;color:var(--mut)">🎁 獎勵（可選，留空=純訊息）</label>';
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">';
  h+='<label style="font-size:12px">🪙 金幣<input id="amGold" type="number" min="0" placeholder="0" style="width:60px;padding:4px;margin-left:4px;background:var(--panel);border:1px solid var(--line);border-radius:4px;color:var(--txt);font-size:12px"></label>';
  h+='<label style="font-size:12px">💎 鑽石<input id="amDiamond" type="number" min="0" placeholder="0" style="width:60px;padding:4px;margin-left:4px;background:var(--panel);border:1px solid var(--line);border-radius:4px;color:var(--txt);font-size:12px"></label>';
  h+='<label style="font-size:12px">💠 水晶<input id="amCrystal" type="number" min="0" placeholder="0" style="width:60px;padding:4px;margin-left:4px;background:var(--panel);border:1px solid var(--line);border-radius:4px;color:var(--txt);font-size:12px"></label>';
  h+='<label style="font-size:12px">✨ 星光<input id="amStarlight" type="number" min="0" placeholder="0" style="width:60px;padding:4px;margin-left:4px;background:var(--panel);border:1px solid var(--line);border-radius:4px;color:var(--txt);font-size:12px"></label>';
  h+='<label style="font-size:12px">🏅 榮譽<input id="amHonor" type="number" min="0" placeholder="0" style="width:60px;padding:4px;margin-left:4px;background:var(--panel);border:1px solid var(--line);border-radius:4px;color:var(--txt);font-size:12px"></label>';
  h+='</div></div>';
  h+='<button class="btn big" onclick="adminSendMail()" style="margin-top:8px">📤 發送信件</button>';
  h+='</div>';
  h+='<div class="panel2"><div style="font-size:12px;color:var(--mut)"><b>📋 學生列表：</b><pre style="white-space:pre-wrap;font-size:11px;color:var(--mut);max-height:200px;overflow-y:auto;margin-top:4px">'+students+'</pre></div></div>';
  $('#view').innerHTML=h;
}
function adminSendMail(){
  const to=document.getElementById('amTo').value.trim();
  const title=document.getElementById('amTitle').value.trim();
  const body=document.getElementById('amBody').value.trim();
  if(!title||!body){return toast('⚠️ 請填寫標題和內容','bad')}
  const rw={};
  const gold=parseInt(document.getElementById('amGold').value)||0;
  const diamond=parseInt(document.getElementById('amDiamond').value)||0;
  const crystal=parseInt(document.getElementById('amCrystal').value)||0;
  const starlight=parseInt(document.getElementById('amStarlight').value)||0;
  const honor=parseInt(document.getElementById('amHonor').value)||0;
  if(gold>0)rw.gold=gold;
  if(diamond>0)rw.diamond=diamond;
  if(crystal>0)rw.crystal=crystal;
  if(starlight>0)rw.starlight=starlight;
  if(honor>0)rw.honor=honor;
  const hasRw=Object.keys(rw).length>0;
  const users=get(LS.users,[]);
  let targets=[];
  if(to){
    const names=to.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
    targets=users.filter(u=>u.role==='student'&&names.includes(u.username.toLowerCase()));
  }else{
    targets=users.filter(u=>u.role==='student');
  }
  if(!targets.length)return toast('⚠️ 找不到目標學生','bad');
  let cnt=0;
  targets.forEach(u=>{
    if(!u.g)return;
    addMail(u.g,title,body,hasRw?rw:null);
    saveU(u);cnt++;
  });
  toast('✅ 已發送給 '+cnt+' 位學生'+(hasRw?'（含獎勵）':''));
  vAdminMail();
}

/* ════ 🎁 資源發放：單人或全服，可直接發資源、送角色、編輯等級 ════ */

/* ════════════════════════════════════════════
   vGrantAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 3 個單位：vGrantAdmin, eqSubCount, eqSubValue
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGrantAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGrantAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGrantAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGrantAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGrantAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGrantAdmin
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   vGrantAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vGrantAdmin
   ════════════════════════════════════════════ */
async function vGrantAdmin(){
  if(!await needJs(['js/views/vGrantAdmin.js']))return toast('模組載入失敗，請重新整理頁面','bad');
  await vGrantAdmin();
}





function eqSubCount(rarity){
  if(rarity==='R'||rarity==='E')return 1;if(rarity==='A'||rarity==='S')return 2;
  if(rarity==='SS'||rarity==='SSS')return 3;return 4;
}

function eqSubValue(rarity,stat){
  const base={'暴擊':.8,'暴傷':1.2,'冷卻':.6,'減傷':.7,'運氣':.5,'生命':15,'防禦':.8}[stat]||1;
  let mult={R:1,E:1.2,A:1.4,S:1.6,SS:1.8,SSS:2,Z:2.5,ZZ:3,ZZZ:3.5,'∞':5}[rarity]||1;
  if(rarity==='∞')mult*=1.5;
  return Math.round(base*mult*100)/100;
}


function grTgtChg(){const one=document.querySelector('input[name=grTgt]:checked').value==='one';const s=$('#grUser');if(s)s.style.display=one?'':'none'}

function adminGrant(){

const rw={gold:+$('#grGold').value||0,crystal:+$('#grCry').value||0,diamond:+$('#grDia').value||0,starlight:+$('#grSl').value||0,ironOre:+$('#grIron').value||0,enhStone:+$('#grEnh').value||0,labMat:+$('#grLab').value||0,honor:+$('#grHon').value||0,quizPts:+$('#grQp').value||0,star:+$('#grStar').value||0};

const char=$('#grChar').value;

const any=Object.values(rw).some(v=>v>0)||char;

if(!any)return toast('⚠️ 請至少填入一項資源或選角色','bad');

const tgt=document.querySelector('input[name=grTgt]:checked').value;

const us=get(LS.users,[]);let n=0;

const give=x=>{if(!x.g)return;for(const k in rw)if(rw[k]>0){if(k==='star'){if(!x.g.star||typeof x.g.star!=='object')x.g.star={coin:0};x.g.star.coin=(Number(x.g.star.coin)||0)+rw[k];}else{x.g[k]=(Number(x.g[k])||0)+rw[k];}}if(char&&!x.g.owned.character.includes(char))x.g.owned.character.push(char);n++};

if(tgt==='all')us.filter(x=>x.role==='student').forEach(give);

else{const id=$('#grUser').value;const x=us.find(v=>v.id===id);if(x)give(x)}

set(LS.users,us);

const parts=Object.keys(rw).filter(k=>rw[k]>0).map(k=>k+'+'+rw[k]);if(char)parts.push('角色:'+char);

toast('🎁 已發放給 '+n+' 名學生：'+(parts.join('、')||'—'));

}
function adminGrantEquip(){
  const slot=document.querySelector('#grEqSlot').value;
  const rarity=document.querySelector('#grEqRar').value;
  const name=(document.querySelector('#grEqName').value||'').trim();
  const tgt=document.querySelector('input[name=grTgt]:checked').value;
  const target=tgt==='one'?$('#grUser').value:'all';
  const eq=genFixedEquip(slot,rarity); if(name)eq.name=name;
  const H={'Content-Type':'application/json'}; if(WTOKEN)H['x-adv9-token']=WTOKEN;
  fetch(SUPA_URL+'/rest/v1/grant_equip',{method:'POST',headers:H,body:JSON.stringify({target:target,eq:eq})})
    .then(r=>r.json()).then(j=>{ if(j&&j.ok)toast('🛡️ 已發放裝備給 '+j.n+' 名學生'); else toast('發放失敗：'+(j&&j.error||'未知'),'bad'); })
    .catch(e=>toast('發放失敗','bad'));
}
