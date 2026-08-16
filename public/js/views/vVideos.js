/* ════════════════════════════════════════════
   vVideos 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：VIDEO_SUBJ, vVideos
   ════════════════════════════════════════════ */
const VIDEO_SUBJ=['數學','英文','國文','自然','社會','綜合活動','健體','藝文']; /* 影片資料夾現有的 8 大領域 */

function vVideos(){

const _g=me()&&me().g?me().g:null;const vd=_g&&_g.video&&_g.video.date===today()?_g.video.count:0;

$('#view').innerHTML=back()+'<h3 class="vt">🎬 影片專區 <span class="vsub">八大領域・知識點動畫講解・影片已全部內嵌</span></h3>'+

'<div class="panel2" style="margin-bottom:12px;font-size:12.5px;color:var(--gold2)">🎁 觀看獎勵：看滿 60 秒關閉即可領取 🪙+30 💠+10 🧪+3｜每部影片限領 1 次｜今日已領 '+vd+'/3</div>'+

'<div class="featGrid">'+VIDEO_SUBJ.map((s,i)=>{const d=SUBJ[s];const cnt=Object.values(d.u).reduce((a,b)=>a+b.length,0);

return '<div class="feat" style="--fc:'+d.c+';animation:pop .38s both;animation-delay:'+(i*0.04).toFixed(2)+'s" onclick="vVideoSub(\''+s+'\')"><span class="fIco">'+d.i+'</span><b>'+s+'</b><i>'+cnt+' 部知識影片</i></div>'}).join('')+'</div>';

}
