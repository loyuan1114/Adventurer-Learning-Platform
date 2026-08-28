const fs = require('fs');
const path = require('path');

const viewsDir = 'C:/Users/weimyown/AppData/Local/Temp/Adventurer-Learning-Platform/public/js/views';
const stubs = ['vMarket','vMiss','vMonitor','vNotifs','vPK','vPkRank','vPostAdmin','vQuestion','vRank','vReady','vRegStu','vResetAdmin','vResult','vRoster','vShopV','vSocial','vSpeedMatch','vStats','vStory','vTerr','vTHome','vTitleV','vUnitList','vVideos','vVideoSub','vWrong'];

function makeView(v) {
  const name = v.replace(/^v/, '');
  const icon = {
    vMarket: '🏪', vMiss: '📝', vMonitor: '📊', vNotifs: '🔔', vPK: '⚔️',
    vPkRank: '🏆', vPostAdmin: '📋', vQuestion: '❓', vRank: '📈',
    vReady: '✅', vRegStu: '👨‍🎓', vResetAdmin: '🔄', vResult: '📊',
    vRoster: '👥', vShopV: '🛍️', vSocial: '👥', vSpeedMatch: '⚡',
    vStats: '📊', vStory: '📖', vTerr: '🏰', vTHome: '🏠',
    vTitleV: '🏅', vUnitList: '📚', vVideos: '🎬', vVideoSub: '📺',
    vWrong: '❌', vPostAdmin: '📋'
  }[v] || '📄';

  return `/* ${v} — ${name} */
function ${v}(){
  const u=me();if(!u){toast('請先登入','bad');return}
  const h='<h2 class="mt">${icon} ${name}</h2>' +
    '<div class="rwRow"><span class="rwChip">👤 '+esc(u.name||u.username)+'</span></div>' +
    '<p class="msub" style="color:var(--mut);margin:16px 0">此功能正在完善中，敬請期待。</p>' +
    '<div class="mBtns"><button class="btn" onclick="closeModal()">關閉</button></div>';
  openModal(h);
}
`;
}

stubs.forEach(v => {
  fs.writeFileSync(path.join(viewsDir, v + '.js'), makeView(v));
  console.log('Fixed:', v + '.js');
});
console.log('Fixed', stubs.length, 'stub views');