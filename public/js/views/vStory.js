/* ════════════════════════════════════════════
   vStory 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 1 個單位：vStory
   ════════════════════════════════════════════ */
function vStory(){

const u=me(),now=Date.now();const list=storyList();

CUR.socialTab='story';

$('#view').innerHTML=back()+socialTabs('story')+'<h3 class="vt">📸 限時動態 <span class="vsub">24 小時後自動消失｜可選僅好友或所有人可見</span>'+

'<button class="btn ghost mini" style="margin-left:auto" onclick="vNotifs()">🔔 通知'+(unreadNotifs()?' <b style="color:#ff8a80">'+unreadNotifs()+'</b>':'')+'</button></h3>'+

'<div class="panel2" style="margin-bottom:12px"><b style="color:var(--gold2);font-family:var(--serif)">✏️ 發布動態</b>'+

'<textarea id="stTxt" rows="2" placeholder="分享你的冒險…（文字或照片至少擇一）" style="margin-top:8px"></textarea>'+

'<div style="display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap">'+

'<label class="btn ghost mini" style="display:inline-flex;align-items:center;cursor:pointer">📷 加照片<input type="file" accept="image/*" style="display:none" onchange="onStoryPhoto(this)"></label>'+

'<label class="btn ghost mini" style="display:inline-flex;align-items:center;cursor:pointer">🎞 加影片<input type="file" accept="video/*" style="display:none" onchange="onStoryVideo(this)"></label>'+

'<span style="font-size:11px;color:var(--mut);flex-basis:100%">📸 上傳照片/影片即代表你同意以 CC0 公眾領域授權釋出（所有人皆可自由使用）</span>'+

'<label style="font-size:11.5px;color:var(--mut);display:inline-flex;align-items:center;gap:3px;cursor:pointer"><input type="checkbox" id="stMute" style="width:auto">🔇靜音</label>'+

'<span id="stImgTip" style="font-size:12px;color:var(--teal)">'+(CUR.storyImg?'✅ 已選照片':CUR.storyVid?'✅ 已選影片':'')+'</span>'+

'<select id="stVis" style="width:auto"><option value="all">🌍 所有人可見</option><option value="friends">👥 僅好友可見</option><option value="bff">💖 僅摯友可見</option></select>'+

'<button class="btn mini" onclick="postStory()">🚀 發布</button></div></div>'+

(list.length?list.map(s=>{const mine=s.uid===u.id;const su=get(LS.users,[]).find(x=>x.id===s.uid);const mins=Math.floor((now-s.t)/60000);const ago=mins<60?mins+' 分鐘前':Math.floor(mins/60)+' 小時前';const left=Math.max(1,Math.ceil((86400000-(now-s.t))/3600000));

return '<div class="panel2" style="margin-bottom:10px"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'+avatarHtml(su,26)+'<b style="color:var(--gold2)">'+esc(mine?s.n:dispName(s.uid))+'</b>'+

'<span style="font-size:11px;color:var(--mut)">'+(s.vis==='friends'?'👥 僅好友':s.vis==='bff'?'💖 僅摯友':'🌍 公開')+'｜'+ago+'｜⏳ 剩 '+left+' 小時</span>'+

(mine?'<button class="btn danger mini" style="margin-left:auto" onclick="delStory(\''+s.id+'\')">↩ 收回</button>':'')+'</div>'+

(s.text?'<div style="margin-top:6px;font-size:14px;white-space:pre-wrap;line-height:1.7">'+esc(s.text)+'</div>':'')+

(s.img?'<img src="'+mediaUrl(s.img)+'" style="max-width:300px;max-height:300px;border-radius:8px;margin-top:8px;display:block;cursor:zoom-in" loading="lazy" onclick="zoomEl(this)" title="點擊放大">':'')+

(s.vid?'<div style="margin-top:8px">'+vidTag(s.vid,s.muted,460)+'</div>':'')+

(()=>{const lk=s.likes||{};const n=Object.keys(lk).length;const iLiked=!!lk[u.id];const names=Object.values(lk).slice(0,6).join('、');

return '<div style="display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap">'+

'<button class="btn ghost mini" style="'+(iLiked?'color:#ff8a80;border-color:#8f272b;':'')+'" onclick="likeStory(\''+s.id+'\')">'+(iLiked?'❤️ 已讚':'🤍 讚')+(n?' '+n:'')+'</button>'+

(n?'<span style="font-size:11px;color:var(--mut)">❤️ '+esc(names)+(n>6?' 等 '+n+' 人':'')+'</span>':'')+'</div>'})()+'</div>'}).join(''):'<p class="empty">目前沒有動態，來發第一則吧！</p>');

}
