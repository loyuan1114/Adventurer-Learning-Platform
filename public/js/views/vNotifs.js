/* ════════════════════════════════════════════
   vNotifs 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vNotifs
   ════════════════════════════════════════════ */
function vNotifs(){

const list=myNotifs().slice(0,50);

openModal('<h3 class="mt">🔔 通知</h3>'+

(list.length?list.map(n=>'<div class="panel2" style="margin-bottom:6px;padding:9px 12px;font-size:13px;'+(n.read?'opacity:.55':'border-left:3px solid var(--gold)')+'">'+esc(n.txt)+'<span class="cTime" style="display:block;margin-top:2px">'+fmt(n.t)+'</span></div>').join(''):'<p class="empty">目前沒有通知</p>')+

'<div class="mBtns"><button class="btn" onclick="closeModal()">關閉</button></div>');

const u=me();const ns=get(LS.notif,[]);let ch=false;ns.forEach(n=>{if(n.to===u.id&&!n.read){n.read=true;ch=true}});if(ch)set(LS.notif,ns); /* 開過即設已讀 */

}
