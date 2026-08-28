/* vChatV — 聊天室 */
function vChatV(){
  const u=me(), chat=get(LS.chat,[]).slice(-100);
  let h=back()+'<h3 class="vt">💬 聊天大廳 <span class="vsub">全頻道・即時訊息・表情貼圖</span></h3>';
  h+='<div class="tabRow">';
  ['world','guild','party','whisper'].forEach((ch,i)=>{
    const label={world:'🌍 世界',guild:'🏰 公會',party:'👥 隊伍',whisper:'🤫 私聊'}[ch];
    h+=`<button class="tabB ${i===0?'on':''}" onclick="chatSwitchTab('${ch}')">${label}</button>`;
  });
  h+='</div>';
  h+='<div id="chatArea" style="height:400px;overflow-y:auto;border:1px solid var(--line);border-radius:8px;padding:12px;background:rgba(0,0,0,.25);margin-bottom:12px">';
  chat.forEach(msg=>h+=renderChatMsg(msg,u));
  h+='</div>';
  h+='<div style="display:flex;gap:8px">';
  h+='<input id="chatInput" placeholder="輸入訊息..." style="flex:1" onkeydown="if(event.key===\'Enter\')chatSend()">';
  h+='<button class="btn" onclick="chatSend()">發送</button>';
  h+='<button class="btn ghost" onclick="chatEmojiPicker()">😀</button>';
  h+='</div>';
  $('#view').innerHTML=h;
  scrollChatBottom();
}
let _chatTab='world';
function chatSwitchTab(t){_chatTab=t;document.querySelectorAll('.tabB').forEach(b=>b.classList.toggle('on',b.onclick.toString().includes(t)));vChatV()}
function chatSend(){
  const u=me(), txt=$('#chatInput').value.trim(); if(!txt) return;
  const chat=get(LS.chat,[]);
  chat.push({id:'msg'+Date.now(),ch:_chatTab,from:u.id,name:u.name,avatar:u.avatar,txt:txt,ts:Date.now()});
  if(chat.length>500) chat.splice(0,chat.length-500);
  set(LS.chat,chat); $('#chatInput').value=''; vChatV();
}
function renderChatMsg(msg,me){
  const mine=msg.from===me.id, time=new Date(msg.ts).toLocaleTimeString();
  return `<div class="chatMsg ${mine?'mine':''}"><div class="cmAv">${msg.avatar?`<img src="${esc(msg.avatar)}" width="32" height="32" style="border-radius:50%">`:'👤'}</div><div class="cmCol"><div class="cmName"><b>${esc(msg.name)}</b><span class="cTime">${time}</span></div><div class="cmBub"><p>${esc(msg.txt)}</p></div></div></div>`;
}
function scrollChatBottom(){setTimeout(()=>{const a=$('#chatArea'); if(a)a.scrollTop=a.scrollHeight},50)}
function chatEmojiPicker(){
  const emojis=['😀','😂','😍','😭','😡','👍','👎','❤️','🔥','💯','🎉','💩','🤔','😎','🥳','😴'];
  let h='<div class="mt">選擇表情</div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">';
  emojis.forEach(e=>h+=`<button class="btn mini" onclick="chatInsertEmoji('${e}');closeModal()" style="font-size:20px;padding:8px">${e}</button>`);
  h+='</div>'; openModal(h);
}
function chatInsertEmoji(e){const inp=$('#chatInput'); inp.value+=e; inp.focus()}