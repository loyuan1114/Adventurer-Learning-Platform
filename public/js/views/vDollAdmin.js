/* ════════════════════════════════════════════
   vDollAdmin 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 5 個單位：_dAdminCat, vDollAdmin, DOLL_IMPRINTS, _dGenId, _dImprint
   ════════════════════════════════════════════ */
let _dAdminCat='角色',_dAdminEditId=null,_dAdminEditIdx=-1;

function vDollAdmin(){
  _dAdminCat='角色';_dAdminEditId=null;_dAdminEditIdx=-1;
  renderDollAdmin();
}

const DOLL_IMPRINTS=['自由之息','烈焰痕跡','靜水流深','大地的懷抱','風之足跡','火之光環','水之淚滴','土之印章','雲中漫步','燼中重生','潮汐記憶','山巒低語','飛翔夢境','永恆火焰','深海之心','磐石之誓'];

function _dGenId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}

function _dImprint(){return DOLL_IMPRINTS[Math.floor(Math.random()*DOLL_IMPRINTS.length)]}
