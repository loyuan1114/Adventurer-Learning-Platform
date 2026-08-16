/* ════════════════════════════════════════════
   vAStats 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 2 個單位：vAStats, st2
   ════════════════════════════════════════════ */
function vAStats(){

const us=get(LS.users,[]),stu=us.filter(x=>x.role==='student');

const avg=stu.length?(stu.reduce((s,x)=>s+(x.g?x.g.lv:1),0)/stu.length).toFixed(1):'—';

$('#view').innerHTML='<h3 class="vt">📊 數據總覽</h3><div class="statGrid">'+

st2('👥 總用戶',us.length)+st2('🎒 學生',stu.length)+st2('👩‍🏫 老師',us.filter(x=>x.role==='teacher').length)+st2('📈 平均Lv',avg)+

st2('📢 公告',get(LS.ann,[]).length)+st2('🎁 禮包碼',get(LS.codes,[]).length)+st2('💬 聊天',get(LS.chat,[]).length)+st2('📚 作業',get(LS.hw,[]).length)+

st2('🤝 交易',get(LS.trades,[]).length)+'</div>';

}

const st2=(l,v)=>'<div class="panel2 statIt"><span>'+l+'</span><b>'+v+'</b></div>';
