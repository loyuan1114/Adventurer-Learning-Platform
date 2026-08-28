/* vSocial — Social */
function vSocial(){
  const u=me();if(!u){toast('請先登入','bad');return}
  const h='<h2 class="mt">👥 Social</h2>' +
    '<div class="rwRow"><span class="rwChip">👤 '+esc(u.name||u.username)+'</span></div>' +
    '<p class="msub" style="color:var(--mut);margin:16px 0">此功能正在完善中，敬請期待。</p>' +
    '<div class="mBtns"><button class="btn" onclick="closeModal()">關閉</button></div>';
  openModal(h);
}
