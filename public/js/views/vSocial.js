/* vSocial — 社群動態 */
function vSocial() {
  var u = me(); if (!u) return;
  var g = u.g;
  var feed = g.socialFeed || [];

  var h = back() + '<h3 class="vt">🌐 社群動態 <span class="vsub">好友動態・熱門話題・互動交流</span></h3>';

  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--teal);font-size:15px">✏️ 發布動態</b>';
  h += '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">';
  h += '<textarea id="socialContent" class="inp" rows="3" placeholder="分享你的學習心得、問問問題、或發個貼圖吧..." style="resize:vertical"></textarea>';
  h += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">';
  h += '<select id="socialType" class="inp" style="flex:0 0 auto">';
  h += '<option value="text">💬 文字</option>';
  h += '<option value="sticker">貼圖</option>';
  h += '<option value="achievement">🏆 成就</option>';
  h += '</select>';
  h += '<div style="display:flex;gap:4px">';
  ['🎉', '💪', '😊', '🤔', '👀', '🔥', '✨', '🎯'].forEach(function(e) {
    h += '<button class="btn mini ghost" style="font-size:16px;padding:4px" onclick="socialInsertEmoji(\'' + e + '\')">' + e + '</button>';
  });
  h += '</div>';
  h += '<button class="btn teal" onclick="socialPost()">🚀 發布</button>';
  h += '</div></div></div>';

  h += '<div class="tabRow">';
  ['feed', 'hot', 'mine', 'friends'].forEach(function(t, i) {
    var labels = { feed: '📰 全部動態', hot: '🔥 熱門', mine: '👤 我的', friends: '👥 好友' };
    h += '<button class="tabB ' + (i === 0 ? 'on' : '') + '" onclick="socialTab(\'' + t + '\')">' + labels[t] + '</button>';
  });
  h += '</div>';

  h += '<div id="socialFeed"></div>';

  h += '<div class="panel2" style="margin-top:14px"><b style="color:var(--purple);font-size:14px">📊 社群統計</b>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:10px">';
  var totalPosts = feed.length;
  var totalLikes = feed.reduce(function(a, p) { return a + (p.likes || 0); }, 0);
  var myPosts = feed.filter(function(p) { return p.authorId === u.id; }).length;
  var friendsCount = (g.friends || []).length;
  h += '<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px">📝</div><div style="font-size:16px;font-weight:900;color:var(--gold2);margin:4px 0">' + totalPosts + '</div><div style="font-size:10px;color:var(--mut)">總動態</div></div>';
  h += '<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px">❤️</div><div style="font-size:16px;font-weight:900;color:#e91e63;margin:4px 0">' + totalLikes + '</div><div style="font-size:10px;color:var(--mut)">總讚數</div></div>';
  h += '<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px">👤</div><div style="font-size:16px;font-weight:900;color:var(--teal);margin:4px 0">' + myPosts + '</div><div style="font-size:10px;color:var(--mut)">我的動態</div></div>';
  h += '<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px">👥</div><div style="font-size:16px;font-weight:900;color:var(--gold2);margin:4px 0">' + friendsCount + '</div><div style="font-size:10px;color:var(--mut)">好友數</div></div>';
  h += '</div></div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--gold2);font-size:14px">📖 社群規範</b>';
  h += '<div class="skTxt" style="margin-top:6px">';
  h += '社群是交流學習的友善空間。請保持禮貌、尊重他人觀點。禁止發送不當內容、垃圾訊息或人身攻擊。違反規範可能導致帳號限制。每發布一條動態可獲得 5 經驗值，獲得讚數每 10 個可額外獲得 10 金幣。</div></div>';

  $('#view').innerHTML = h;
  socialTab('feed');
}

function socialTab(t) {
  window._socialTab = t;
  document.querySelectorAll('.tabB').forEach(function(b) {
    b.classList.toggle('on', b.onclick && b.onclick.toString().indexOf(t) >= 0);
  });
  var u = me();
  var feed = (u.g.socialFeed || []).slice().reverse();
  var filtered = feed;
  if (t === 'mine') filtered = feed.filter(function(p) { return p.authorId === u.id; });
  else if (t === 'friends') {
    var fIds = u.g.friends || [];
    filtered = feed.filter(function(p) { return fIds.indexOf(p.authorId) >= 0; });
  } else if (t === 'hot') {
    filtered = feed.slice().sort(function(a, b) { return (b.likes || 0) - (a.likes || 0); }).slice(0, 20);
  }

  var area = document.getElementById('socialFeed');
  if (!area) return;

  var html = '<div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">';
  if (!filtered.length) {
    html += '<div class="panel2 empty">暫無動態</div>';
  } else {
    filtered.forEach(function(p) {
      var author = get(LS.users, []).find(function(x) { return x.id === p.authorId; });
      html += '<div class="panel2" style="padding:14px">';
      html += '<div style="display:flex;gap:10px;align-items:flex-start">';
      html += '<div style="font-size:32px;flex-shrink:0">' + (author && author.prof && author.prof.avatar ? avatarHtml(author, 36) : '🧑‍🎓') + '</div>';
      html += '<div style="flex:1;min-width:0">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center">';
      html += '<b style="font-size:13px;color:var(--gold2)">' + esc(author ? (author.name || author.username) : '匿名') + '</b>';
      if (p.authorId === u.id) html += '<button class="btn mini danger" style="font-size:10px" onclick="socialDelete(\'' + (p.id || '') + '\')">🗑️</button>';
      html += '</div>';
      html += '<div style="font-size:10px;color:var(--mut)">' + new Date(p.ts || Date.now()).toLocaleString();
      if (p.type === 'achievement') html += ' · 🏆 成就';
      else if (p.type === 'sticker') html += ' · 貼圖';
      html += '</div>';
      html += '<div style="margin-top:8px;font-size:13px;line-height:1.6;white-space:pre-wrap">' + esc(p.content || '') + '</div>';
      html += '<div style="display:flex;gap:8px;margin-top:10px;align-items:center">';
      html += '<button class="btn mini ' + ((p.likedBy || []).indexOf(u.id) >= 0 ? 'teal' : 'ghost') + '" onclick="socialLike(\'' + (p.id || '') + '\')">❤️ ' + (p.likes || 0) + '</button>';
      html += '<button class="btn mini ghost" onclick="socialComment(\'' + (p.id || '') + '\')">💬 ' + (p.comments || []).length + '</button>';
      html += '</div>';
      if (p.comments && p.comments.length) {
        html += '<div style="margin-top:8px;border-top:1px solid rgba(255,255,255,.08);padding-top:6px">';
        p.comments.slice(-3).forEach(function(c) {
          var ca = get(LS.users, []).find(function(x) { return x.id === c.authorId; });
          html += '<div style="font-size:12px;padding:3px 0"><b style="color:var(--teal)">' + esc(ca ? (ca.name || ca.username) : '匿名') + '：</b>' + esc(c.text || '') + '</div>';
        });
        if (p.comments.length > 3) html += '<div style="font-size:10px;color:var(--mut)">還有 ' + (p.comments.length - 3) + ' 則留言...</div>';
        html += '</div>';
      }
      html += '</div></div></div>';
    });
  }
  html += '</div>';
  area.innerHTML = html;
}

function socialPost() {
  var u = me();
  var content = ($('#socialContent') || {}).value || '';
  var type = ($('#socialType') || {}).value || 'text';
  content = content.trim();
  if (!content) return toast('⚠️ 請輸入內容', 'bad');
  var post = {
    id: 'sf' + Date.now(),
    authorId: u.id,
    content: content,
    type: type,
    likes: 0,
    likedBy: [],
    comments: [],
    ts: Date.now()
  };
  u.g.socialFeed = u.g.socialFeed || [];
  u.g.socialFeed.push(post);
  if (u.g.socialFeed.length > 100) u.g.socialFeed = u.g.socialFeed.slice(-100);
  u.g.exp = (u.g.exp || 0) + 5;
  set(LS.users, get(LS.users, []));
  toast('✅ 動態已發布！+5 經驗值');
  ($('#socialContent') || {}).value = '';
  socialTab(window._socialTab || 'feed');
}

function socialLike(id) {
  var u = me();
  var post = (u.g.socialFeed || []).find(function(p) { return p.id === id; });
  if (!post) return;
  post.likedBy = post.likedBy || [];
  var idx = post.likedBy.indexOf(u.id);
  if (idx >= 0) {
    post.likedBy.splice(idx, 1);
    post.likes = Math.max(0, (post.likes || 0) - 1);
  } else {
    post.likedBy.push(u.id);
    post.likes = (post.likes || 0) + 1;
    if (post.likes % 10 === 0 && post.authorId !== u.id) {
      var author = get(LS.users, []).find(function(x) { return x.id === post.authorId; });
      if (author) {
        author.g = author.g || {};
        author.g.gold = (author.g.gold || 0) + 10;
        set(LS.users, get(LS.users, []));
      }
    }
  }
  set(LS.users, get(LS.users, []));
  socialTab(window._socialTab || 'feed');
}

function socialComment(id) {
  var text = prompt('💬 輸入留言：');
  if (!text || !text.trim()) return;
  var u = me();
  var post = (u.g.socialFeed || []).find(function(p) { return p.id === id; });
  if (!post) return;
  post.comments = post.comments || [];
  post.comments.push({ authorId: u.id, text: text.trim(), ts: Date.now() });
  set(LS.users, get(LS.users, []));
  toast('💬 留言已發布');
  socialTab(window._socialTab || 'feed');
}

function socialDelete(id) {
  if (!confirm('確定刪除此動態？')) return;
  var u = me();
  u.g.socialFeed = (u.g.socialFeed || []).filter(function(p) { return p.id !== id; });
  set(LS.users, get(LS.users, []));
  toast('🗑️ 動態已刪除');
  socialTab(window._socialTab || 'feed');
}

function socialInsertEmoji(emoji) {
  var el = document.getElementById('socialContent');
  if (el) el.value += emoji;
}
window.vSocial = vSocial;
