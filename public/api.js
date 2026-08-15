/**
 * ADV9 Doll System API
 * 共用 API 層：管理娃娃、MBTI、互動紀錄、商店等
 * 支援本機模式（localStorage）與伺服器模式（REST API）
 */

const ADV9_DOLL_API = (() => {
  'use strict';

  // ─── 常數 ───────────────────────────────────────────────────────────────────
  const STORAGE_PREFIX = 'ADV9_DOLL_';
  const MBTI_TYPES = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  const MBTI_DESC = {
    'INTJ': { name: '策略家', emoji: '🎯', trait: '深思熟慮、獨立', bondRate: 0.8 },
    'INTP': { name: '思想家', emoji: '💡', trait: '理性分析、好奇心', bondRate: 0.7 },
    'ENTJ': { name: '指揮官', emoji: '👑', trait: '領導力、果斷', bondRate: 0.6 },
    'ENTP': { name: '辯論家', emoji: '⚡', trait: '機智、善辯', bondRate: 0.5 },
    'INFJ': { name: '提倡者', emoji: '🌙', trait: '理想主義、直覺', bondRate: 0.9 },
    'INFP': { name: '調停者', emoji: '🌸', trait: '溫柔、同理', bondRate: 0.95 },
    'ENFJ': { name: '主人公', emoji: '✨', trait: '熱情、樂於助人', bondRate: 0.85 },
    'ENFP': { name: '競選者', emoji: '🎈', trait: '樂觀、創意', bondRate: 0.8 },
    'ISTJ': { name: '物流師', emoji: '📋', trait: '負責任、務實', bondRate: 0.7 },
    'ISFJ': { name: '守衛者', emoji: '🛡️', trait: '體貼、可靠', bondRate: 0.9 },
    'ESTJ': { name: '總經理', emoji: '📊', trait: '組織力、直接', bondRate: 0.6 },
    'ESFJ': { name: '執政官', emoji: '🤝', trait: '合群、慷慨', bondRate: 0.85 },
    'ISTP': { name: '鑑賞家', emoji: '🔧', trait: '務實、冷靜', bondRate: 0.65 },
    'ISFP': { name: '探險家', emoji: '🎨', trait: '藝術、隨和', bondRate: 0.9 },
    'ESTP': { name: '企業家', emoji: '🏃', trait: '活潑、冒險', bondRate: 0.55 },
    'ESFP': { name: '表演者', emoji: '🎭', trait: '幽默、熱情', bondRate: 0.6 }
  };

  // ─── 工具函數 ───────────────────────────────────────────────────────────────
  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  // ─── 儲存層（自動偵測環境） ─────────────────────────────────────────────────
  let _useServer = false;
  let _serverUrl = '';
  let _token = '';

  function setServer(url, token) {
    _useServer = true;
    _serverUrl = url.replace(/\/$/, '');
    _token = token || '';
  }

  function setToken(t) {
    _token = t;
  }

  async function _api(key, method, body) {
    if (!_useServer) {
      const storeKey = STORAGE_PREFIX + key;
      if (method === 'GET') {
        try {
          return JSON.parse(localStorage.getItem(storeKey) || 'null');
        } catch (e) {
          return null;
        }
      }
      if (method === 'POST' || method === 'PUT') {
        const data = body || {};
        localStorage.setItem(storeKey, JSON.stringify(data));
        return data;
      }
      if (method === 'DELETE') {
        localStorage.removeItem(storeKey);
        return true;
      }
      return null;
    }

    // 伺服器模式
    const url = _serverUrl + '/rest/v1/doll/' + encodeURIComponent(key);
    const headers = {
      'Content-Type': 'application/json',
      'x-adv9-token': _token
    };
    const opts = { method, headers };
    if (body !== undefined) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    if (!res.ok) throw new Error('API Error: ' + res.status);
    return res.json();
  }

  function _sync(key) {
    // 同步到雲端（若有啟用）
    if (!_useServer) return;
    const storeKey = STORAGE_PREFIX + key;
    const data = localStorage.getItem(storeKey);
    if (!data) return;
    fetch(_serverUrl + '/rest/v1/doll/' + encodeURIComponent(key), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-adv9-token': _token },
      body: data
    }).catch(e => console.warn('Doll sync failed', e));
  }

  // ─── 娃娃資料結構 ───────────────────────────────────────────────────────────
  // 娃娃物件結構：
  // {
  //   id: string,
  //   name: string,
  //   mbti: string,           // 16型MBTI
  //   emoji: string,          // 顯示用 emoji
  //   rarity: 'R' | 'SR' | 'SSR' | 'UR',
  //   bond: number,           // 親密度 0-100
  //   traits: {               // 內在特質（會隨互動改變）
  //     warmth: number,       // 溫暖度 0-100
  //     openness: number,     // 開放度 0-100
  //     responsibility: number, // 責任感 0-100
  //     assertiveness: number   // 主動性 0-100
  //   },
  //   imprint: string,        // 獨特印記（隨機生成）
  //   owner: string,          // 擁有者用戶 ID
  //   createdAt: string,      // 建立時間
  //   lastInteract: string,   // 最後互動時間
  //   interactCount: number,  // 互動次數
  //   history: []             // 互動紀錄 [{time, type, effect}]
  // }

  // ─── 公開 API ───────────────────────────────────────────────────────────────

  /**
   * 建立新娃娃
   */
  async function createDoll(data) {
    const { name, mbti, owner, rarity = 'R' } = data;
    const mbtiInfo = MBTI_DESC[mbti] || MBTI_DESC['INFP'];
    const now = new Date().toISOString();

    const doll = {
      id: genId(),
      name,
      mbti,
      emoji: mbtiInfo.emoji,
      rarity,
      bond: 0,
      traits: {
        warmth: 50,
        openness: 50,
        responsibility: 50,
        assertiveness: 50
      },
      imprint: _genImprint(),
      owner,
      createdAt: now,
      lastInteract: now,
      interactCount: 0,
      history: []
    };

    // 儲存到個人娃娃列表
    const key = 'dolls:' + owner;
    const existing = await _api(key, 'GET') || [];
    existing.push(doll);
    await _api(key, 'POST', existing);
    _sync(key);

    return doll;
  }

  /**
   * 取得用戶所有娃娃
   */
  async function getDolls(owner) {
    const key = 'dolls:' + owner;
    return await _api(key, 'GET') || [];
  }

  /**
   * 取得單一娃娃
   */
  async function getDoll(dollId, owner) {
    const dolls = await getDolls(owner);
    return dolls.find(d => d.id === dollId) || null;
  }

  /**
   * 互動：對話
   * @param {string} dollId
   * @param {string} owner
   * @param {string} message
   */
  async function interactTalk(dollId, owner, message) {
    const dolls = await getDolls(owner);
    const idx = dolls.findIndex(d => d.id === dollId);
    if (idx === -1) throw new Error('娃娃不存在');

    const doll = dolls[idx];
    const mbtiInfo = MBTI_DESC[doll.mbti] || MBTI_DESC['INFP'];

    // 根據 MBTI 和特質生成回應
    const response = _genTalkResponse(doll, message);

    // 改變特質（對話主要影響 warmth 和 openness）
    doll.traits.warmth = Math.min(100, Math.max(0, doll.traits.warmth + _rand(-3, 5)));
    doll.traits.openness = Math.min(100, Math.max(0, doll.traits.openness + _rand(-2, 4)));

    _updateDoll(doll, dolls, 'talk', { response });
    return { doll, response };
  }

  /**
   * 互動：摸頭
   * @param {string} dollId
   * @param {string} owner
   */
  async function interactPet(dollId, owner) {
    const dolls = await getDolls(owner);
    const idx = dolls.findIndex(d => d.id === dollId);
    if (idx === -1) throw new Error('娃娃不存在');

    const doll = dolls[idx];
    const mbtiInfo = MBTI_DESC[doll.mbti] || MBTI_DESC['INFP'];

    // 摸頭增加親密度和 warmth
    const bondGain = Math.round(mbtiInfo.bondRate * _rand(3, 8));
    doll.bond = Math.min(100, doll.bond + bondGain);
    doll.traits.warmth = Math.min(100, Math.max(0, doll.traits.warmth + _rand(2, 6)));
    doll.traits.openness = Math.min(100, Math.max(0, doll.traits.openness + _rand(-1, 3)));

    const response = _genPetResponse(doll);

    _updateDoll(doll, dolls, 'pet', { bondGain, response });
    return { doll, response, bondGain };
  }

  /**
   * 互動：餵食
   * @param {string} dollId
   * @param {string} owner
   * @param {string} foodType - 'sweet' | 'spicy' | 'sour' | 'bitter'
   */
  async function interactFeed(dollId, owner, foodType = 'sweet') {
    const dolls = await getDolls(owner);
    const idx = dolls.findIndex(d => d.id === dollId);
    if (idx === -1) throw new Error('娃娃不存在');

    const doll = dolls[idx];
    const mbtiInfo = MBTI_DESC[doll.mbti] || MBTI_DESC['INFP'];

    // 不同食物影響不同特質
    const effects = {
      'sweet': { warmth: 5, openness: -2, responsibility: 0, assertiveness: 0 },
      'spicy': { warmth: -2, openness: 3, responsibility: 0, assertiveness: 5 },
      'sour': { warmth: 0, openness: 5, responsibility: -2, assertiveness: 2 },
      'bitter': { warmth: -3, openness: 0, responsibility: 5, assertiveness: -2 }
    };

    const effect = effects[foodType] || effects['sweet'];
    doll.traits.warmth = Math.min(100, Math.max(0, doll.traits.warmth + effect.warmth));
    doll.traits.openness = Math.min(100, Math.max(0, doll.traits.openness + effect.openness));
    doll.traits.responsibility = Math.min(100, Math.max(0, doll.traits.responsibility + effect.responsibility));
    doll.traits.assertiveness = Math.min(100, Math.max(0, doll.traits.assertiveness + effect.assertiveness));

    // 親密度增益
    const bondGain = Math.round(mbtiInfo.bondRate * _rand(2, 5));
    doll.bond = Math.min(100, doll.bond + bondGain);

    const response = _genFeedResponse(doll, foodType);

    _updateDoll(doll, dolls, 'feed', { foodType, effect, bondGain, response });
    return { doll, response, bondGain };
  }

  /**
   * 更新娃娃資料
   */
  async function _updateDoll(doll, dolls, type, extra) {
    doll.lastInteract = new Date().toISOString();
    doll.interactCount++;

    // 記錄歷史
    doll.history.push({
      time: doll.lastInteract,
      type,
      ...extra
    });
    // 只保留最近 50 筆
    if (doll.history.length > 50) {
      doll.history = doll.history.slice(-50);
    }

    const idx = dolls.findIndex(d => d.id === doll.id);
    dolls[idx] = doll;
    const key = 'dolls:' + doll.owner;
    await _api(key, 'POST', dolls);
    _sync(key);
  }

  /**
   * 刪除娃娃
   */
  async function deleteDoll(dollId, owner) {
    const dolls = await getDolls(owner);
    const filtered = dolls.filter(d => d.id !== dollId);
    const key = 'dolls:' + owner;
    await _api(key, 'POST', filtered);
    _sync(key);
  }

  /**
   * 管理員：取得所有娃娃（跨用戶）
   */
  async function adminGetAllDolls() {
    if (!_useServer) {
      const result = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX + 'dolls:')) {
          try {
            const owner = key.slice(STORAGE_PREFIX.length);
            const dolls = JSON.parse(localStorage.getItem(key) || '[]');
            result.push({ owner, dolls });
          } catch (e) {}
        }
      }
      return result;
    }
    return await _api('admin/dolls', 'GET');
  }

  /**
   * 管理員：建立商店娃娃
   */
  async function adminCreateShopDoll(data) {
    const { name, mbti, rarity, price, emoji } = data;
    const mbtiInfo = MBTI_DESC[mbti] || MBTI_DESC['INFP'];

    const shopDoll = {
      id: genId(),
      name,
      mbti,
      emoji: emoji || mbtiInfo.emoji,
      rarity,
      price,
      baseTraits: {
        warmth: 50,
        openness: 50,
        responsibility: 50,
        assertiveness: 50
      },
      createdAt: new Date().toISOString()
    };

    const key = 'shop_dolls';
    const existing = await _api(key, 'GET') || [];
    existing.push(shopDoll);
    await _api(key, 'POST', existing);
    _sync(key);

    return shopDoll;
  }

  /**
   * 管理員：取得商店列表
   */
  async function adminGetShop() {
    return await _api('shop_dolls', 'GET') || [];
  }

  /**
   * 管理員：編輯商店娃娃
   */
  async function adminEditShopDoll(dollId, updates) {
    const key = 'shop_dolls';
    const dolls = await _api(key, 'GET') || [];
    const idx = dolls.findIndex(d => d.id === dollId);
    if (idx === -1) throw new Error('娃娃不存在');

    dolls[idx] = { ...dolls[idx], ...updates };
    await _api(key, 'POST', dolls);
    _sync(key);
    return dolls[idx];
  }

  /**
   * 管理員：刪除商店娃娃
   */
  async function adminDeleteShopDoll(dollId) {
    const key = 'shop_dolls';
    const dolls = await _api(key, 'GET') || [];
    const filtered = dolls.filter(d => d.id !== dollId);
    await _api(key, 'POST', filtered);
    _sync(key);
  }

  /**
   * 管理員：設定限時活動
   */
  async function adminSetEvent(eventData) {
    const { type, active, startTime, endTime, multiplier } = eventData;
    const key = 'events:' + type;
    const event = {
      id: genId(),
      type,
      active,
      startTime: startTime || new Date().toISOString(),
      endTime: endTime || null,
      multiplier: multiplier || 2,
      createdAt: new Date().toISOString()
    };

    const existing = await _api('events', 'GET') || [];
    // 移除同類型的舊活動
    const filtered = existing.filter(e => e.type !== type);
    filtered.push(event);
    await _api('events', 'POST', filtered);
    _sync('events');
    return event;
  }

  /**
   * 管理員：取得活動列表
   */
  async function adminGetEvents() {
    return await _api('events', 'GET') || [];
  }

  /**
   * 管理員：啟用/停用活動
   */
  async function adminToggleEvent(eventId, active) {
    const events = await adminGetEvents();
    const idx = events.findIndex(e => e.id === eventId);
    if (idx === -1) throw new Error('活動不存在');

    events[idx].active = active;
    await _api('events', 'POST', events);
    _sync('events');
    return events[idx];
  }

  /**
   * 購買娃娃
   */
  async function buyDoll(dollId, owner, gold) {
    const shopDolls = await adminGetShop();
    const shopDoll = shopDolls.find(d => d.id === dollId);
    if (!shopDoll) throw new Error('娃娃不存在');
    if (shopDoll.price > gold) throw new Error('金幣不足');

    // 扣除金幣
    const key = 'user_gold:' + owner;
    const currentGold = await _api(key, 'GET') || 0;
    await _api(key, 'POST', currentGold - shopDoll.price);

    // 建立娃娃
    const now = new Date().toISOString();
    const doll = {
      id: genId(),
      name: shopDoll.name,
      mbti: shopDoll.mbti,
      emoji: shopDoll.emoji,
      rarity: shopDoll.rarity,
      bond: 0,
      traits: { ...shopDoll.baseTraits },
      imprint: _genImprint(),
      owner,
      createdAt: now,
      lastInteract: now,
      interactCount: 0,
      history: []
    };

    const dollsKey = 'dolls:' + owner;
    const existing = await _api(dollsKey, 'GET') || [];
    existing.push(doll);
    await _api(dollsKey, 'POST', existing);
    _sync(dollsKey);

    return doll;
  }

  /**
   * 檢查當前是否有進行中的活動
   */
  async function getActiveEvent(type) {
    const events = await adminGetEvents();
    const now = new Date().toISOString();
    return events.find(e => e.type === type && e.active &&
      (!e.startTime || e.startTime <= now) &&
      (!e.endTime || e.endTime >= now));
  }

  // ─── 輔助函數 ───────────────────────────────────────────────────────────────

  function _rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function _genImprint() {
    const imprints = [
      '星塵記憶', '月光痕跡', '晨曦印記', '霧中足跡',
      '花瓣殘香', '鐘聲迴響', '風之低語', '影之眷屬',
      '夢境碎片', '時光裂痕', '淚滴结晶', '笑顏永存',
      '孤獨王冠', '勇氣徽章', '溫柔枷鎖', '自由翅膀',
      '沉默雷鳴', '黑夜繁星', '破碎鏡像', '重生火焰'
    ];
    return imprints[Math.floor(Math.random() * imprints.length)];
  }

  function _genTalkResponse(doll, message) {
    const mbtiInfo = MBTI_DESC[doll.mbti] || MBTI_DESC['INFP'];
    const traits = doll.traits;

    // 根據特質調整回應風格
    const warmthLevel = traits.warmth > 70 ? '熱情' : traits.warmth > 40 ? '溫和' : '冷靜';
    const opennessLevel = traits.openness > 70 ? '開朗' : traits.openness > 40 ? '內斂' : '沉默';

    const responses = {
      'INTJ': ['我已經分析過了...答案是這樣的。', '你的想法很有趣，但邏輯上有漏洞。', '讓我思考一下...'],
      'INTP': ['有趣！這讓我想到一個理論...', '從邏輯角度來說...', '嗯...這需要更深入的分析。'],
      'ENTJ': ['讓我來領導這個討論。', '直接說重點就好。', '我有更好的計畫。'],
      'ENTP': ['但如果我們反過來想呢？', '這個觀點很有挑戰性！', '我反對！讓我辯論一下。'],
      'INFJ': ['我感受到你內心的想法...', '每個人都有獨特的光芒。', '我相信事情會好轉的。'],
      'INFP': ['這讓我想到一首詩...', '你的感覺是真實的。', '每個故事都很美。'],
      'ENFJ': ['讓我們一起解決這個問題！', '你很重要，我關心你。', '我相信我們可以一起做得更好。'],
      'ENFP': ['太棒了！讓我們冒險吧！', '我有个超棒的想法！', '生活應該充滿驚喜！'],
      'ISTJ': ['根據經驗來說...', '我會按照規則來做。', '實用才是重點。'],
      'ISFJ': ['我為你準備好了...', '讓我來照顧你。', '一切都會沒問題的。'],
      'ESTJ': ['立刻行動！不要拖延。', '效率才是關鍵。', '按計畫執行。'],
      'ESFJ': ['大家感覺怎麼樣？', '讓我們一起開心！', '我關心每個人的感受。'],
      'ISTP': ['（沉默地操作）', '需要幫忙嗎？', '這個很簡單。'],
      'ISFP': ['美...真好。', '（輕輕點頭）', '每個瞬間都很珍貴。'],
      'ESTP': ['來個刺激的吧！', '行動比說話重要。', '我準備好了！'],
      'ESFP': ['派對時間！', '讓我們玩起來！', '生活就是現在！']
    };

    const baseResponses = responses[doll.mbti] || responses['INFP'];
    const base = baseResponses[Math.floor(Math.random() * baseResponses.length)];

    // 根據親密度調整
    if (doll.bond > 80) {
      return '（親密地看著你）' + base;
    } else if (doll.bond > 50) {
      return base;
    } else {
      return '（有些疏離）' + base;
    }
  }

  function _genPetResponse(doll) {
    const mbtiInfo = MBTI_DESC[doll.mbti] || MBTI_DESC['INFP'];
    const responses = [
      '（輕輕蹭你的手心）',
      '（發出滿足的聲音）',
      '（閉上眼睛享受）',
      '（臉紅）',
      '（輕輕搖晃）',
      '（蹭蹭你）'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  function _genFeedResponse(doll, foodType) {
    const names = {
      'sweet': '甜食',
      'spicy': '辣食',
      'sour': '酸食',
      'bitter': '苦食'
    };
    const responses = [
      '（吃下' + names[foodType] + '，眼睛發亮）',
      '（品嚐' + names[foodType] + '，表情變化）',
      '（享用' + names[foodType] + '，滿足地微笑）'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ─── 匯出 ───────────────────────────────────────────────────────────────────
  return {
    // 設定
    setServer,
    setToken,

    // 常數
    MBTI_TYPES,
    MBTI_DESC,

    // 娃娃操作
    createDoll,
    getDolls,
    getDoll,
    interactTalk,
    interactPet,
    interactFeed,
    deleteDoll,
    buyDoll,

    // 管理員
    adminGetAllDolls,
    adminCreateShopDoll,
    adminGetShop,
    adminEditShopDoll,
    adminDeleteShopDoll,
    adminSetEvent,
    adminGetEvents,
    adminToggleEvent,

    // 活動
    getActiveEvent
  };
})();
