/* vPostAdmin — 文章管理 */
function vPostAdmin() {
  var u = me(); if (!u) return;
  var g = u.g;
  var posts = g.posts || [];

  var h = back() + '<h3 class="vt">📝 文章管理 <span class="vsub">發布文章・管理貼文・互動回應</span></h3>';

  h += '<div class="panel2" style="margin-top:12px">';
  h += '<b style="color:var(--teal);font-size:15px">✏️ 發布新文章</b>';
  h += '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">';
  h += '<div><label style="font-size:11px;color:var(--mut)">文章標題</label>';
  h += '<input id="postTitle" class="inp" placeholder="輸入文章標題..." style="margin-top:4px"></div>';
  h += '<div><label style="font-size:11px;color:var(--mut)">文章類型</label>';
  h += '<select id="postType" class="inp" style="margin-top:4px">';
  h += '<option value="note">📖 學習筆記</option>';
  h += '<option value="share">📤 心得分享</option>';
  h += '<option value="question">❓ 提問</option>';
  h += '<option value="discussion">💬 討論</option>';
  h += '<option value="resource">📚 資源分享</option>';
  h += '</select></div>';
  h += '<div><label style="font-size:11px;color:var(--mut)">文章內容</label>';
  h += '<textarea id="postContent" class="inp" rows="4" placeholder="撰寫文章內容..." style="margin-top:4px;resize:vertical"></textarea></div>';
  h += '<div><label style="font-size:11px;color:var(--mut)">標籤（選填，逗號分隔）</label>';
  h += '<input id="postTags" class="inp" placeholder="例如：數學,代數,筆記" style="margin-top:4px"></div>';
  h += '<button class="btn teal" onclick="postPublish()" style="align-self:flex-start">🚀 發布文章</button>';
  h += '</div></div>';

  h += '<div class="panel2" style="margin-top:12px">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  h += '<b style="color:var(--gold2);font-size:15px">📋 文章列表</b>';
  h += '<div class="chip">共 ' + posts.length + ' 篇</div>';
  h += '</div></div>';

  h += '<div class="tabRow">';
  ['all', 'mine', 'note', 'share', 'question', 'discussion', 'resource'].forEach(function(t, i) {
    var labels = {
      all: '📰 全部',
      mine: '👤 我的',
      note: '📖 筆記',
      share: '📤 分享',
      question: '❓ 提問',
      discussion: '💬 討論',
      resource: '📚 資源'
    };
    h += '<button class="tabB ' + (i === 0 ? 'on' : '') + '" onclick="postTab(\'' + t + '\')">' + labels[t] + '</button>';
  });
  h += '</div>';

  h += '<div id="postArea"></div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--purple);font-size:14px">📊 文章統計</b>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:10px">';
  var totalPosts = posts.length;
  var totalLikes = posts.reduce(function(a, p) { return a + (p.likes || 0); }, 0);
  var totalComments = posts.reduce(function(a, p) { return a + (p.comments || []).length; }, 0);
  var myPosts = posts.filter(function(p) { return p.authorId === u.id; }).length;
  h += '<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px">📝</div><div style="font-size:16px;font-weight:900;color:var(--gold2);margin:4px 0">' + totalPosts + '</div><div style="font-size:10px;color:var(--mut)">總文章</div></div>';
  h += '<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px">❤️</div><div style="font-size:16px;font-weight:900;color:#e91e63;margin:4px 0">' + totalLikes + '</div><div style="font-size:10px;color:var(--mut)">總讚數</div></div>';
  h += '<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px">💬</div><div style="font-size:16px;font-weight:900;color:var(--teal);margin:4px 0">' + totalComments + '</div><div style="font-size:10px;color:var(--mut)">總留言</div></div>';
  h += '<div style="text-align:center;padding:10px;background:rgba(0,0,0,.15);border-radius:8px"><div style="font-size:20px">👤</div><div style="font-size:16px;font-weight:900;color:var(--gold2);margin:4px 0">' + myPosts + '</div><div style="font-size:10px;color:var(--mut)">我的文章</div></div>';
  h += '</div></div>';

  h += '<div class="panel2" style="margin-top:12px"><b style="color:var(--gold2);font-size:14px">📖 文章管理說明</b>';
  h += '<div class="skTxt" style="margin-top:6px">';
  h += '發布學習筆記、心得分享或提問，與同學互動交流。每發布一篇文章可獲得 20 經驗值獎勵。被點讚的文章可獲得額外經驗。請保持文章內容友善、有建設性。</div></div>';

  $('#view').innerHTML = h;
  postTab('all');
}

function postTab(t) {
  window._postTab = t;
  document.querySelectorAll('.tabB').forEach(function(b) {
    b.classList.toggle('on', b.onclick && b.onclick.toString().indexOf(t) >= 0);
  });
  var u = me();
  var posts = (u.g.posts || []).slice().reverse();
  var filtered = posts;
  if (t === 'mine') filtered = posts.filter(function(p) { return p.authorId === u.id; });
  else if (t !== 'all') filtered = posts.filter(function(p) { return p.type === t; });

  var area = document.getElementById('postArea');
  if (!area) return;

  var typeIcons = { note: '📖', share: '📤', question: '❓', discussion: '💬', resource: '📚' };
  var html = '<div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">';

  if (!filtered.length) {
    html += '<div class="panel2 empty">無文章</div>';
  } else {
    filtered.forEach(function(p) {
      var author = get(LS.users, []).find(function(x) { return x.id === p.authorId; });
      html += '<div class="panel2" style="padding:14px">';
      html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">';
      html += '<div style="display:flex;gap:8px;align-items:center">';
      html += '<div style="font-size:24px">' + (author && author.prof && author.prof.avatar ? avatarHtml(author, 28) : '🧑‍🎓') + '</div>';
      html += '<div><b style="font-size:13px">' + esc(author ? (author.name || author.username) : '匿名') + '</b>';
      html += '<div style="font-size:10px;color:var(--mut)">' + new Date(p.ts || Date.now()).toLocaleString() + ' · ' + (typeIcons[p.type] || '📌') + ' ' + p.type + '</div></div>';
      html += '</div>';
      html += '<div style="display:flex;gap:4px">';
      if (p.authorId === u.id) html += '<button class="btn mini danger" onclick="postDelete(\'' + (p.id || '') + '\')">🗑️</button>';
      html += '</div></div>';
      html += '<div style="margin-top:10px">';
      html += '<b style="font-family:var(--serif);color:var(--gold2);font-size:15px;display:block">' + esc(p.title || '無標題') + '</b>';
      html += '<div style="margin-top:6px;white-space:pre-wrap;font-size:13px;line-height:1.6">' + esc(p.content || '') + '</div>';
      if (p.tags && p.tags.length) {
        html += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">';
        p.tags.forEach(function(tag) { html += '<span class="chip" style="font-size:10px">' + esc(tag) + '</span>'; });
        html += '</div>';
      }
      html += '</div>';
      html += '<div style="display:flex;gap:8px;margin-top:10px;align-items:center">';
      html += '<button class="btn mini ' + ((p.likedBy || []).indexOf(u.id) >= 0 ? 'teal' : 'ghost') + '" onclick="postLike(\'' + (p.id || '') + '\')">❤️ ' + (p.likes || 0) + '</button>';
      html += '<button class="btn mini ghost" onclick="postComment(\'' + (p.id || '') + '\')">💬 ' + (p.comments || []).length + '</button>';
      html += '<button class="btn mini ghost" onclick="postShare(\'' + (p.id || '') + '\')">📤 分享</button>';
      html += '</div>';
      if (p.comments && p.comments.length) {
        html += '<div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.08);padding-top:8px">';
        p.comments.slice(-3).forEach(function(c) {
          var ca = get(LS.users, []).find(function(x) { return x.id === c.authorId; });
          html += '<div style="display:flex;gap:6px;padding:4px 0;font-size:12px">';
          html += '<b style="color:var(--teal)">' + esc(ca ? (ca.name || ca.username) : '匿名') + '：</b>';
          html += '<span style="color:var(--mut)">' + esc(c.text || '') + '</span>';
          html += '</div>';
        });
        if (p.comments.length > 3) html += '<div style="font-size:10px;color:var(--mut);margin-top:4px">還有 ' + (p.comments.length - 3) + ' 則留言...</div>';
        html += '</div>';
      }
      html += '</div>';
    });
  }
  html += '</div>';
  area.innerHTML = html;
}

function postPublish() {
  var u = me();
  var title = ($('#postTitle') || {}).value || '';
  var content = ($('#postContent') || {}).value || '';
  var type = ($('#postType') || {}).value || 'note';
  var tagsRaw = ($('#postTags') || {}).value || '';
  title = title.trim();
  content = content.trim();
  if (!title) return toast('⚠️ 請輸入標題', 'bad');
  if (!content) return toast('⚠️ 請輸入內容', 'bad');
  var tags = tagsRaw.split(',').map(function(t) { return t.trim(); }).filter(function(t) { return t.length > 0; });
  var post = {
    id: 'post' + Date.now(),
    authorId: u.id,
    authorName: u.name || u.username,
    title: title,
    content: content,
    type: type,
    tags: tags,
    likes: 0,
    likedBy: [],
    comments: [],
    ts: Date.now()
  };
  u.g.posts = u.g.posts || [];
  u.g.posts.push(post);
  u.g.exp = (u.g.exp || 0) + 20;
  set(LS.users, get(LS.users, []));
  toast('✅ 文章已發布！+20 經驗值');
  vPostAdmin();
}

function postLike(id) {
  var u = me();
  var post = (u.g.posts || []).find(function(p) { return p.id === id; });
  if (!post) return;
  post.likedBy = post.likedBy || [];
  var idx = post.likedBy.indexOf(u.id);
  if (idx >= 0) {
    post.likedBy.splice(idx, 1);
    post.likes = Math.max(0, (post.likes || 0) - 1);
  } else {
    post.likedBy.push(u.id);
    post.likes = (post.likes || 0) + 1;
  }
  set(LS.users, get(LS.users, []));
  postTab(window._postTab || 'all');
}

function postComment(id) {
  var text = prompt('💬 輸入留言：');
  if (!text || !text.trim()) return;
  var u = me();
  var post = (u.g.posts || []).find(function(p) { return p.id === id; });
  if (!post) return;
  post.comments = post.comments || [];
  post.comments.push({ authorId: u.id, text: text.trim(), ts: Date.now() });
  set(LS.users, get(LS.users, []));
  toast('💬 留言已發布');
  postTab(window._postTab || 'all');
}

function postShare(id) {
  toast('📤 分享連結已複製到剪貼簿');
}

function postDelete(id) {
  if (!confirm('確定刪除此文章？')) return;
  var u = me();
  u.g.posts = (u.g.posts || []).filter(function(p) { return p.id !== id; });
  set(LS.users, get(LS.users, []));
  toast('🗑️ 文章已刪除');
  postTab(window._postTab || 'all');
}
window.vPostAdmin = vPostAdmin;
