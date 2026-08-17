/* ════════════════════════════════════════════
   vPixel 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vPixel
   ════════════════════════════════════════════ */
function vPixel(){
  const u=me();if(!u)return toast('請先登入','bad');
  const has=pxArtOf(u.id).length>0;
  $('#view').innerHTML=back()+'<h3 class="vt">🎨 像素畫板 <span class="vsub">16~256 畫布・可存可分享</span></h3>'+
  '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">'+
  '<button class="btn mini" onclick="pxInit('+(PX.size||32)+')">✏️ 畫布</button>'+
  '<button class="btn ghost mini" onclick="pxMy()">🖼 我的畫作（'+has+'）</button>'+
  '<button class="btn ghost mini" onclick="pxGallery()">🌍 公開畫廊</button></div>'+
  '<div id="pxView" class="panel2" style="min-height:220px"></div>';
  pxInit(PX.size||32);
}
