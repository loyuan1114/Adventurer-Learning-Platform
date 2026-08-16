/* ════════════════════════════════════════════
   vSet 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）
   含 7 個單位：BG_PRESETS, AVATAR_EMOJIS, MUSIC, saveMusicPref, musicInit, musicSetVolume, vSet
   ════════════════════════════════════════════ */
const BG_PRESETS={bg1:['🌌 星空藍（預設）',''],bg2:['🌅 暮光橙','linear-gradient(160deg,#2b1055,#7597de 45%,#c98a5a)'],bg3:['🌲 森林綠','linear-gradient(160deg,#0f2027,#203a43 50%,#2c5364)'],bg4:['🌸 櫻花粉','linear-gradient(160deg,#41295a,#752d63 50%,#b06ab3)'],bg5:['🔥 熔岩紅','linear-gradient(160deg,#1f1c18,#5c2018 55%,#8e3b2f)'],bg6:['💜 夢幻紫','linear-gradient(160deg,#141e30,#3a2b63 55%,#6a3f8f)']};

const AVATAR_EMOJIS=['🧑‍🎓','👩‍🎓','🦊','🐱','🐶','🐼','🐸','🦁','🐯','🦄','🐲','👻','🤖','👽','🧙','🥷','🦸','🧛','😎','🤠','🐧','🦉','🐢','🐳'];

let MUSIC={list:[],idx:-1,audio:null};

function saveMusicPref(){try{localStorage.setItem('ADV9_MUSIC',JSON.stringify({idx:MUSIC.idx}))}catch(e){}}

function musicInit(){if(MUSIC.audio)return;const a=new Audio();a.loop=true;a.volume=.5;MUSIC.audio=a;try{const j=JSON.parse(localStorage.getItem('ADV9_MUSIC')||'{}');if(typeof j.idx==='number')MUSIC.idx=j.idx}catch(e){}}

function musicSetVolume(v){if(MUSIC.audio)MUSIC.audio.volume=Math.max(0,Math.min(1,v))}

function vSet(){

const u=me(),g=u.g;const c=sysCfg();const pf=u.prof||{};

$('#view').innerHTML=back()+'<h3 class="vt">⚙️ 設定</h3>'+

'<div class="panel2" style="margin-bottom:10px;font-size:13px;color:var(--mut);border-left:4px solid var(--teal)">🛡️ 獎勵時間鎖與難度模式由管理員統一設定<br>目前：'+(c.timeLock?'🔒 時間鎖啟用（平日 6:00~22:00／週末 6:00~23:00 開放）':'🔓 時間鎖關閉（獎勵全天開放）')+'｜🎯 難度模式：'+c.diffMode+(c.diffMode==='隨機'?'（±10）':'')+'</div>'+

/* 頭像 */

'<div class="panel2" style="margin-bottom:10px"><b style="color:var(--gold2);font-family:var(--serif)">🙋 我的頭像</b> <span style="vertical-align:middle;margin-left:6px">'+avatarHtml(u,36)+'</span>'+

'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">'+AVATAR_EMOJIS.map(e=>'<button class="btn ghost mini" style="font-size:18px;padding:5px 9px'+(pf.avatar===e?';border-color:var(--gold)':'')+'" onclick="setAvatar(\''+e+'\')">'+e+'</button>').join('')+'</div>'+

'<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><label class="btn ghost mini" style="display:inline-flex;align-items:center;cursor:pointer">📷 上傳照片當頭像<input type="file" accept="image/*" style="display:none" onchange="onAvatarFile(this)"></label>'+

'<button class="btn ghost mini" onclick="setAvatar(\'\')">🧹 恢復預設</button><span style="font-size:11px;color:var(--mut);flex-basis:100%">📸 上傳照片即代表你同意以 CC0 公眾領域授權釋出（所有人皆可自由使用）</span></div></div>'+

/* 背景 */

'<div class="panel2" style="margin-bottom:10px"><b style="color:var(--gold2);font-family:var(--serif)">🎨 介面背景</b>'+

'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">'+Object.keys(BG_PRESETS).map(k=>'<button class="btn ghost mini" style="'+(((pf.bg||'bg1')===k)||(!pf.bg&&k==='bg1')?'border-color:var(--gold);color:var(--gold2)':'')+'" onclick="setBg(\''+k+'\')">'+BG_PRESETS[k][0]+'</button>').join('')+'</div>'+

'<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><label class="btn ghost mini" style="display:inline-flex;align-items:center;cursor:pointer">🖼 用照片當背景<input type="file" accept="image/*" style="display:none" onchange="onBgFile(this)"></label>'+

(pf.bg&&pf.bg.indexOf('data:')===0?'<span style="font-size:12px;color:var(--teal);align-self:center">✅ 目前使用照片背景</span>':'')+'<span style="font-size:11px;color:var(--mut);flex-basis:100%">📸 照片素材請使用 CC0 公眾領域授權內容（如 Pixabay／Unsplash／Wikimedia Commons）</span></div></div>'+

/* 音樂 */

'<div class="panel2" style="margin-bottom:10px"><b style="color:var(--gold2);font-family:var(--serif)">🎵 背景音樂</b> <span style="font-size:11.5px;color:var(--mut)">教師可將 mp3/ogg 上傳到 media/music/ 資料夾</span>'+

'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;align-items:center">'+

'<select id="musicSel" style="flex:1;min-width:160px;padding:6px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--txt)" onchange="musicPick(this.value)"><option value="-1">（關閉音樂）</option></select>'+

'<button class="btn mini" onclick="musicPlay()">▶ 播放</button>'+

'<button class="btn ghost mini" onclick="musicPrev()">⏮</button>'+

'<button class="btn ghost mini" onclick="musicNext()">⏭</button>'+

'<button class="btn ghost mini" onclick="musicStop()">⏹ 停止</button></div>'+

'<div style="display:flex;gap:8px;align-items:center;margin-top:8px"><span style="font-size:11px;color:var(--mut)">音量</span><input type="range" min="0" max="100" value="50" oninput="musicSetVolume(this.value/100)" style="flex:1"></div></div>'+

/* 好友申請隱私 */

'<div class="panel2" style="margin-bottom:10px"><b style="color:var(--gold2);font-family:var(--serif)">🔒 好友申請</b> <span style="font-size:11.5px;color:var(--mut)">控制誰可以向你發送好友申請</span>'+

'<div style="display:flex;gap:8px;margin-top:8px"><select id="frPriv" style="width:auto" onchange="setFrPrivacy(this.value)"><option value="all"'+(pf.frPrivacy!=='off'?' selected':'')+'>🌍 所有人都可以加我</option><option value="off"'+(pf.frPrivacy==='off'?' selected':'')+'>🚫 關閉好友申請</option></select></div></div>'+

/* 上線狀態隱私 */

'<div class="panel2" style="margin-bottom:10px"><b style="color:var(--gold2);font-family:var(--serif)">👁 上線狀態</b> <span style="font-size:11.5px;color:var(--mut)">其他人是否看得到你在線上</span>'+

'<label style="display:flex;gap:8px;align-items:center;margin-top:8px;cursor:pointer"><input type="checkbox" id="hideOnline" style="width:auto"'+(pf.hideOnline?' checked':'')+' onchange="setHideOnline(this.checked)"> 🙈 隱藏我的上線狀態（好友看不到我的「● 線上」）</label></div>'+

'<div style="display:flex;gap:10px;flex-wrap:wrap">'+

'<button class="btn ghost mini" onclick="openChangeName()">✏️ 修改姓名</button>'+
 '<button class="btn ghost mini" onclick="openChangePw()">🔒 修改密碼</button>'+

'<button class="btn ghost mini" onclick="resetStats()">📊 重置統計</button></div>';

musicInit();
const ms=document.getElementById('musicSel');
loadMusicList(list=>{
  ms.innerHTML='<option value="-1">（關閉音樂）</option>'+list.map((f,i)=>'<option value="'+i+'"'+(i===MUSIC.idx?' selected':'')+'>'+esc(f)+'</option>').join('');
  if(MUSIC.idx>=0)ms.value=String(MUSIC.idx);
});

}
