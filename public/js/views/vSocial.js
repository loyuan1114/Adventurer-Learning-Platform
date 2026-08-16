/* ════════════════════════════════════════════
   vSocial 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vSocial
   ════════════════════════════════════════════ */
function vSocial(tab){CUR.socialTab=tab||CUR.socialTab||'fr';

if(CUR.socialTab==='gr')vGroup();else if(CUR.socialTab==='story')vStory();else if(CUR.socialTab==='mail')vMail();else vFriends();}
