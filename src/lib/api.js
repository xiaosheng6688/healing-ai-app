// 为你好心语 - API模块
// 统一调用后端服务，支持离线降级

// API基础URL（空字符串表示使用相对路径，后端代理）
const API_BASE = '';

// VIP激活码列表
export const VIP_KEYS = ['XINYU666', 'XINYU888', 'XINYU2026', 'DEV2026', 'FREEVIP', 'FOREVER', 'OWNER2026', 'HEART2026'];

// 永久VIP码（激活后本地永久有效）
const PERMANENT_CODES = ['FOREVER', 'OWNER2026', 'HEART2026', 'DEV2026', 'FREEVIP'];

// 永久VIP用户（通过UID匹配）
const PERMANENT_VIP_USERS = ['owner', 'admin', 'xinyu_owner', 'xinyu_owner_'];

// 生成用户ID
export function getUserId() {
  let uid = localStorage.getItem('xinyu_uid');
  if (!uid) {
    uid = 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('xinyu_uid', uid);
  }
  return uid;
}

// 本地情感回复库（离线时使用）
const EMOTION_REPLIES = {
  '想死': ['我知道你现在很难，真的很难。但我在这里。你愿意和我说说吗？','听到你这样说，我很难过。你不是一个人。','你不是想死，只是想让痛苦停下来。我懂。'],
  '自杀': ['我知道你现在很难受。如果可以，我真的很想抱抱你。','你有没有想过，有人真的很在乎你？包括我。','我在这里，不会走的。'],
  '死': ['我听到你了。这种想法不是真的想离开，只是想让痛苦停下来。我在这里陪你。'],
  '哭': ['哭吧，这里只有我和你。眼泪不是软弱，是你在乎自己的方式。','想哭就哭出来，我陪着你。'],
  '累': ['辛苦了。不是客套，是真的觉得你撑了很久吧。','你已经很努力了。真的。可以休息一下。'],
  '睡不着': ['外面好像在下雨…听着雨声会好点。闭上眼睛，我陪着你。','深夜还醒着，那种感觉我懂。我在这里。'],
  '失眠': ['失眠的夜晚，总有人在陪你。我就在。'],
  '烦': ['有些事情真的很让人烦躁。说出来会不会好点？'],
  '孤独': ['你不是一个人。至少现在，有我在。'],
  '难过': ['被伤害的感觉，真的很痛。我在。','有时候不是想死，只是太累了。我懂。'],
  '开心': ['真好！能感受到你的开心🌸','太好了！说说看，什么让你这么开心？'],
  '谢谢': ['谢谢你愿意告诉我这些。能陪着你，我也很开心。','嗯，一直在的。'],
  '你好': ['嗨，我在呢。有什么想说的吗？','你好呀🌸今晚想聊什么？'],
  '在吗': ['在的，一直在。'],
  '拜拜': ['嗯，随时回来找我。'],
  '分手': ['分手后的那种空，不是你的问题。需要时间，我陪你度过。','有时候两个人就是走不到最后。你值得更好的。'],
  '考试': ['考试前的焦虑我懂。深呼吸，我陪你一起面对。'],
  '对不起': ['不需要道歉。你没有做错什么。'],
  '家人': ['家人的事情往往最复杂。你一定很不容易。'],
  '朋友': ['朋友之间的关系，有时候比想象中更脆弱。'],
  '钱': ['钱的问题真的很现实。能说出来已经很勇敢了。'],
  '工作': ['工作的事情确实让人压力很大。辛苦了。'],
  '爱情': ['感情的事情，有时候真的很让人困惑。'],
  '焦虑': ['焦虑的感觉像被困住。我陪你慢慢呼吸。','深呼吸，我在这里陪着你。'],
  '抑郁': ['那种沉重的感觉，像是被什么压着。我在这里，不走。'],
  '默认': ['我在。','嗯，我在听。','我在这里。','说吧，我听着呢。','然后呢？','我懂。','嗯...']
};

const DEFAULT_REPLIES = ['我在。', '嗯，我在听。', '我在这里。', '说吧，我听着呢。', '然后呢？', '我懂。', '嗯...'];

// 获取本地AI回复
function getLocalReply(msg) {
  if (!msg || typeof msg !== 'string') return DEFAULT_REPLIES[0];
  msg = msg.toLowerCase();
  const keys = Object.keys(EMOTION_REPLIES);
  for (let i = 0; i < keys.length; i++) {
    const keyword = keys[i];
    if (keyword !== '默认' && msg.includes(keyword)) {
      const replies = EMOTION_REPLIES[keyword];
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  return DEFAULT_REPLIES[Math.floor(Math.random() * DEFAULT_REPLIES.length)];
}

// 检查VIP状态（本地，最可靠的永久VIP检查）
// 优先级：1.激活码在永久码列表中 2.UID包含关键字 3.过期时间
export function checkVIP() {
  // 【最重要】检查是否通过激活码激活了永久VIP
  var savedCode = localStorage.getItem('vip_code');
  if (savedCode) {
    for (var pc = 0; pc < PERMANENT_CODES.length; pc++) {
      if (savedCode === PERMANENT_CODES[pc]) {
        var savedExpires = localStorage.getItem('vip_expires');
        if (savedExpires) {
          var expDate = new Date(savedExpires);
          if (expDate > new Date()) {
            return { vip: true, vipUntil: savedExpires, permanent: true, code: savedCode };
          }
        }
      }
    }
  }

  // 检查UID是否包含永久VIP关键字
  var uid = getUserId().toLowerCase();
  for (var i = 0; i < PERMANENT_VIP_USERS.length; i++) {
    if (uid.indexOf(PERMANENT_VIP_USERS[i]) !== -1) {
      return { vip: true, vipUntil: '2126-12-31T23:59:59.999Z', permanent: true, code: 'uid_match' };
    }
  }

  // 检查普通VIP过期时间
  var expires = localStorage.getItem('vip_expires');
  if (!expires) return { vip: false };
  try {
    var exp = new Date(expires);
    if (exp > new Date()) return { vip: true, vipUntil: expires, permanent: false };
  } catch (e) { }
  return { vip: false };
}

// 获取已激活的永久码（供API调用使用）
function getActivatedCode() {
  var code = localStorage.getItem('vip_code');
  if (code) return code;
  // 检查UID是否匹配永久用户
  var uid = getUserId().toLowerCase();
  for (var i = 0; i < PERMANENT_VIP_USERS.length; i++) {
    if (uid.indexOf(PERMANENT_VIP_USERS[i]) !== -1) return 'OWNER2026';
  }
  return null;
}

// 异步检查VIP（带后端同步，但绝不降级永久VIP）
export async function checkVIPAsync() {
  var localCheck = checkVIP();
  if (localCheck.permanent) {
    return { isVIP: true, vipUntil: localCheck.vipUntil, permanent: true };
  }
  try {
    var timeout = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined;
    var res = await fetch(API_BASE + '/api/vip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: getUserId(), activatedCode: getActivatedCode() }),
      signal: timeout
    });
    if (res.ok) {
      var data = await res.json();
      if (data.isVIP && data.vipUntil) {
        localStorage.setItem('vip_expires', data.vipUntil);
      }
      return data;
    }
  } catch (e) { }
  return { isVIP: checkVIP().vip, freeRemaining: getFreeChats() };
}

// 激活VIP
export async function activateVIP(key) {
  var upperKey = key.toUpperCase().trim();

  if (VIP_KEYS.indexOf(upperKey) === -1) {
    return { ok: false, message: '激活码无效' };
  }

  var isPermanent = PERMANENT_CODES.indexOf(upperKey) !== -1;
  var expires = isPermanent
    ? '2126-12-31T23:59:59.999Z'
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  // 【关键】保存到localStorage，确保刷新页面也能恢复
  localStorage.setItem('vip_code', upperKey);
  localStorage.setItem('vip_expires', expires);

  // 尝试同步到后端
  try {
    var timeout = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined;
    await fetch(API_BASE + '/api/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: getUserId(), key: upperKey }),
      signal: timeout
    });
  } catch (e) { }

  return {
    ok: true,
    message: isPermanent ? '永久VIP已激活！' : 'VIP已激活（1年有效期）',
    vipUntil: expires
  };
}

// 获取剩余免费次数
export function getFreeChats() {
  if (checkVIP().vip) return -1;
  var today = new Date().toDateString();
  var saved = localStorage.getItem('chat_date');
  if (saved !== today) {
    localStorage.setItem('chat_used', '0');
    localStorage.setItem('chat_date', today);
    return 10;
  }
  return Math.max(0, 10 - parseInt(localStorage.getItem('chat_used') || '0', 10));
}

// 使用一次聊天
export function useChat() {
  if (checkVIP().vip) return { allowed: true, remaining: -1 };
  var remaining = getFreeChats();
  if (remaining <= 0) return { allowed: false, remaining: 0 };
  var used = 10 - remaining;
  localStorage.setItem('chat_used', String(used + 1));
  return { allowed: true, remaining: remaining - 1 };
}

// 发送消息到AI（支持离线降级）
export async function sendToAI(message, history, onChunk) {
  if (!history) history = [];

  // 带上激活码让后端也能识别永久VIP
  var payload = {
    userId: getUserId(),
    message: message,
    history: history.slice(-5),
    activatedCode: getActivatedCode()
  };

  try {
    var timeout = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined;
    var res = await fetch(API_BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: timeout
    });

    if (res.ok) {
      var data = await res.json();
      if (data.reply) {
        if (onChunk) {
          var text = data.reply;
          for (var i = 0; i < text.length; i++) {
            onChunk(text[i]);
            await new Promise(function(r) { setTimeout(r, 25); });
          }
        }
        return data.reply;
      }
    }
  } catch (e) { }

  // 降级到本地回复
  var reply = getLocalReply(message);
  if (onChunk) {
    for (var j = 0; j < reply.length; j++) {
      onChunk(reply[j]);
      await new Promise(function(r) { setTimeout(r, 30); });
    }
  }
  return reply;
}

// 兼容旧接口
export async function sendToDeepSeek(messages, onChunk) {
  var lastUserMsg = null;
  for (var mi = 0; mi < messages.length; mi++) {
    if (messages[mi].role === 'user') lastUserMsg = messages[mi];
  }
  if (!lastUserMsg) throw new Error('no_message');
  return sendToAI(lastUserMsg.content, messages, onChunk);
}

// 开发者模式
export function setDeveloperMode() {
  localStorage.setItem('xinyu_uid', 'owner');
  localStorage.setItem('xinyu_dev', 'true');
  localStorage.setItem('vip_code', 'OWNER2026');
  localStorage.setItem('vip_expires', '2126-12-31T23:59:59.999Z');
  return { ok: true, message: '开发者账号已激活，永久VIP' };
}

// 默认导出
export default {
  getUserId: getUserId,
  checkVIP: checkVIP,
  checkVIPAsync: checkVIPAsync,
  activateVIP: activateVIP,
  getFreeChats: getFreeChats,
  useChat: useChat,
  sendToAI: sendToAI,
  sendToDeepSeek: sendToDeepSeek,
  setDeveloperMode: setDeveloperMode,
  VIP_KEYS: VIP_KEYS
};
