/* ════════════════════════════════════════════
   vSubj 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vSubj
   ════════════════════════════════════════════ */
function vSubj(){

qReset();Quiz.phase='SELECT_MODE';

const _g=me().g,_e=effOf(_g);const _cp=Math.round(((1+(_e.all_exp_bonus||0)+(_e.exp_bonus||0))-1)*100);

$('#view').innerHTML=back()+'<h3 class="vt">⚔️ 選擇科目 <span class="vsub">修煉場｜答題戰鬥</span></h3>'+

'<div class="panel2" style="margin-bottom:12px;font-size:12.5px;border-left:4px solid var(--gold);color:var(--mut)">💪 目前收藏與升星全經驗加成：<b style="color:var(--gold2)">+'+_cp+'%</b>（另有科目/難度/連擊加成，結算時顯示完整明細）｜5★覺醒滿配技能效果最高 <b style="color:var(--gold2)">+275%（總倍率 3.75）</b>｜等級上限 <b style="color:var(--gold2)">Lv.300</b></div>'+

'<div class="subjGrid">'+

Object.keys(SUBJ).map(s=>'<button class="subjB" style="background:'+SUBJ[s].c+'" onclick="vUnitList(\''+s+'\')">'+SUBJ[s].i+'<br>'+s+'</button>').join('')+'</div>'+

'<div style="margin-top:14px;text-align:center"><button class="btn teal" onclick="pickLearningPathSubject()">🗺️ AI 學習路徑</button></div>';

}

function pickLearningPathSubject(){
  var h='<h2 class="mt">🗺️ AI 個人化學習路徑</h2>';
  h+='<p style="color:var(--mut);font-size:13px;margin-bottom:14px">選擇科目查看 AI 根據你的答題弱點規劃的學習順序</p>';
  h+='<div class="subjGrid">';
  Object.keys(SUBJ).forEach(function(s){
    h+='<button class="subjB" style="background:'+SUBJ[s].c+'" onclick="closeModal();generateLearningPath(\''+s+'\')">'+SUBJ[s].i+'<br>'+s+'</button>';
  });
  h+='</div>';
  h+='<div class="mBtns"><button class="btn ghost" onclick="closeModal()">關閉</button></div>';
  openModal(h);
}
