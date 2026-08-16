/* ════════════════════════════════════════════
   vClassPK 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vClassPK
   ════════════════════════════════════════════ */
function vClassPK(){
  const users=get(LS.users,[]).filter(x=>x.role==='student'&&x.classId);
  const classes=get(LS.classes,{ids:[],names:{}});
  const byCls={};
  users.forEach(u=>{
    const t=(u.g&&u.g.stats&&u.g.stats.total)||0;
    if(!byCls[u.classId])byCls[u.classId]={n:0,total:0,top:[]};
    byCls[u.classId].n++;
    byCls[u.classId].total+=t;
    byCls[u.classId].top.push({name:u.name,t});
  });
  const rows=Object.keys(byCls).map(cid=>({cid:cid,row:byCls[cid]})).sort((a,b)=>b.row.total-a.row.total);
  const best=rows.length?rows[0].row.total:1;
  const medals=['🥇','🥈','🥉'];
  $('#view').innerHTML=back()+'<h3 class="vt">🏫 班級總題數 PK <span class="vsub">全班累計作答總題數對抗賽</span></h3>'+
  '<div class="panel2" style="margin-bottom:10px;font-size:12.5px;color:var(--mut);border-left:4px solid var(--teal)">每個班級以「全班累計作答總題數」互相比拚，每天全班一起答題，班級排名就會往上衝！</div>'+
  (rows.length?rows.map((r,i)=>{const pct=Math.max(4,Math.round(r.row.total/best*100));
    return '<div class="panel2" style="margin-bottom:8px;display:flex;align-items:center;gap:10px"><span style="font-size:22px">'+(medals[i]||(i+1))+'</span>'+
    '<div style="flex:1;min-width:0"><b style="font-size:14px;color:var(--gold2)">'+(classes.names[r.cid]||r.cid)+' 班</b>'+
    '<div style="font-size:11.5px;color:var(--mut)">'+r.row.n+' 人｜共 '+r.row.total.toLocaleString()+' 題</div>'+
    '<div style="height:6px;background:rgba(255,255,255,.08);border-radius:3px;margin-top:5px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--gold),var(--gold2))"></div></div></div>'+
    '<div style="font-size:11px;color:var(--mut);text-align:right;line-height:1.7">🏅 '+r.row.top.slice(0,3).map(t=>esc(t.name)+' '+t.t.toLocaleString()+'題').join('<br>')+'</div></div>'}).join(''):'<p class="empty">尚無班級資料</p>');
}
