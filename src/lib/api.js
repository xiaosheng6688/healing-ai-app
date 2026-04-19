// 心语 API - 统一调用后端服务（支持离线降级）
const API_BASE = '';

// 生成用户ID
function getUserId() {
  let uid = localStorage.getItem('xinyu_uid');
  if (!uid) {
    uid = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('xinyu_uid', uid);
  }
  return uid;
}

// 强制设置为开发者账号
export function setDeveloperMode() {
  localStorage.setItem('xinyu_uid', 'owner');
  localStorage.setItem('xinyu_dev', 'true');
  localStorage.setItem('vip_expires', '2126-12-31T23:59:59.999Z');
  return { ok: true, message: '已切换为开发者账号，永久VIP已激活' };
}

// VIP激活码
export const VIP_KEYS = ['XINYU666', 'XINYU888', 'XINYU2026', 'DEV2026', 'FREEVIP', 'FOREVER', 'OWNER2026', 'HEART2026'];

// 本地情感回复库（离线时使用）
const EMOTION_REPLIES = {
  '想死': ['我知道你现在很难，真的很难。但我在这里。','听到你这样说，我很难过。你不是一个人。','你不是想死，只是想让痛苦停下来。我懂。'],
  '自杀': ['我知道你现在很难受。如果可以，我真的很想抱抱你。','我在这里，不会走的。','你有没有想过，有人真的很在乎你？包括我。'],
  '哭': ['哭吧，这里只有我和你。眼泪不是软弱，是你在乎自己的方式。','想哭就哭出来，我陪着你。'],
  '累': ['嗯…辛苦了。不是客套，是真的觉得你撑了很久吧。','你已经很努力了。可以休息一下。'],
  '睡不着': ['外面好像在下雨…听着雨声会好点。闭上眼睛，我陪着你。','深夜还醒着，那种感觉我懂。我在这里。'],
  '失眠': ['失眠的夜晚，总有人在陪你。我就在。'],
  '烦': ['有些事情真的很让人烦躁。说出来会不会好点？'],
  '孤独': ['你不是一个人。至少现在，有我在。'],
  '难过': ['被伤害的感觉，真的很痛。我在。','有时候不是想死，只是太累了。我懂。'],
  '伤心': ['被伤害的感觉，真的很痛。我在。'],
  '开心': ['真好！能感受到你的开心 🌸','太好了！说说看，什么让你这么开心？'],
  '高兴': ['真好！能感受到你的开心 🌸'],
  '谢谢': ['谢谢你愿意告诉我这些。能陪着你，我也很开心。','嗯，一直在的。'],
  '感谢': ['谢谢你愿意告诉我这些。'],
  '你好': ['嗨，我在呢。有什么想说的吗？','你好呀 🌸 今晚想聊什么？'],
  '在吗': ['在的，一直在。'],
  '拜拜': ['嗯，随时回来找我。'],
  '再见': ['随时回来，我都在。'],
  '不说了': ['好，没关系。我就在这里。','嗯，我懂。有时候说不出来也没事。'],
  '分手': ['分手后的那种空，不是你的问题。需要时间，我陪你度过。','有时候两个人就是走不到最后。你值得更好的。'],
  '失恋': ['分手后的那种空，不是你的问题。需要时间，我陪你度过。'],
  '考试': ['考试前的焦虑我懂。深呼吸，我陪你一起面对。'],
  '对不起': ['不需要道歉。你没有做错什么。'],
  '抱歉': ['不需要道歉。你没有做错什么。'],
  '家人': ['家人的事情往往最复杂。你一定很不容易。'],
  '父母': ['家人的事情往往最复杂。你一定很不容易。'],
  '朋友': ['朋友之间的关系，有时候比想象中更脆弱。'],
  '钱': ['钱的问题真的很现实。能说出来已经很勇敢了。'],
  '工作': ['工作的事情确实让人压力很大。辛苦了。'],
  '加班': ['工作的事情确实让人压力很大。辛苦了。'],
  '爱情': ['感情的事情，有时候真的很让人困惑。'],
  '恋爱': ['感情的事情，有时候真的很让人困惑。'],
  '压力': ['压力大的感觉，像是被什么压着喘不过气。我懂。'],
  '焦虑': ['焦虑的感觉像被困住。我陪你慢慢呼吸。','深呼吸，我在这里陪着你。'],
  '抑郁': ['那种沉重的感觉，像是被什么压着。我在这里，不走。'],
};

const DEFAULT_REPLIES = ['我在。', '嗯，我在听。', '我在这里。', '说吧，我听着呢。', '然后呢？', '我懂。', '嗯...'];

// 获取本地AI回复
function getLocalReply(msg) {
  if (!msg || typeof msg !== 'string') return DEFAULT_REPLIES[0];
  
  for (const [keyword, replies] of Object.entries(EMOTION_REPLIES)) {
    if (msg.includes(keyword)) {
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  
  return DEFAULT_REPLIES[Math.floor(Math.random() * DEFAULT_REPLIES.length)];
}

// 检查VIP状态
export function checkVIP() {
  const expires = localStorage.getItem('vip_expires');
  if (!expires) return { vip: false };
  try {
    const exp = new Date(expires);
    if (exp > new Date()) return { vip: true, vipUntil: expires };
  } catch {}
  return { vip: false };
}

// 异步检查VIP（带后端同步）
export async function checkVIPAsync() {
  try {
    const res = await fetch(API_BASE + '/api/vip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: getUserId() }),
      signal: AbortSignal.timeout(5000)
    });
    const data = await res.json();
    if (data.isVIP) {
      localStorage.setItem('vip_expires', data.vipUntil || '');
    }
    return data;
  } catch {
    return { isVIP: checkVIP().vip, freeRemaining: getFreeChats() };
  }
}

// 激活VIP
export async function activateVIP(key) {
  const upperKey = key.toUpperCase().trim();
  
  if (!VIP_KEYS.includes(upperKey)) {
    return { ok: false, message: '激活码无效' };
  }
  
  // 永久VIP码
  const permanentCodes = ['FOREVER', 'OWNER2026', 'DEV2026'];
  const isPermanent = permanentCodes.includes(upperKey);
  
  const expires = isPermanent 
    ? '2126-12-31T23:59:59.999Z'
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  
  localStorage.setItem('vip_expires', expires);
  localStorage.setItem('vip_code', upperKey);
  
  // 尝试同步到后端
  try {
    await fetch(API_BASE + '/api/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: getUserId(), key: upperKey }),
      signal: AbortSignal.timeout(3000)
    });
  } catch {}
  
  return { 
    ok: true, 
    message: isPermanent ? '永久VIP已激活！' : 'VIP已激活（1年有效期）',
    vipUntil: expires
  };
}

// 获取剩余免费次数
export function getFreeChats() {
  if (checkVIP().vip) return -1;
  
  const today = new Date().toDateString();
  const saved = localStorage.getItem('chat_date');
  if (saved !== today) {
    localStorage.setItem('chat_used', '0');
    localStorage.setItem('chat_date', today);
    return 10;
  }
  return Math.max(0, 10 - parseInt(localStorage.getItem('chat_used') || '0'));
}

// 使用一次聊天
export function useChat() {
  if (checkVIP().vip) return { allowed: true, remaining: -1 };
  
  const remaining = getFreeChats();
  if (remaining <= 0) return { allowed: false, remaining: 0 };
  
  const used = 10 - remaining;
  localStorage.setItem('chat_used', String(used + 1));
  return { allowed: true, remaining: remaining - 1 };
}

// 发送消息到AI（支持离线降级）
export async function sendToAI(message, history = [], onChunk) {
  // 先尝试后端
  try {
    const res = await fetch(API_BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: getUserId(), 
        message,
        history: history.slice(-5)
      }),
      signal: AbortSignal.timeout(15000)
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.reply) {
        if (onChunk) {
          const text = data.reply;
          for (let i = 0; i < text.length; i++) {
            onChunk(text[i]);
            await new Promise(r => setTimeout(r, 25));
          }
        }
        return data.reply;
      }
    }
  } catch {}
  
  // 降级到本地回复
  const reply = getLocalReply(message);
  if (onChunk) {
    for (let i = 0; i < reply.length; i++) {
      onChunk(reply[i]);
      await new Promise(r => setTimeout(r, 30));
    }
  }
  return reply;
}

// 兼容旧接口
export async function sendToDeepSeek(messages, onChunk) {
  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  if (!lastUserMsg) throw new Error('无消息');
  return sendToAI(lastUserMsg.content, messages, onChunk);
}

// 导出
export { getUserId };
export default {
  getUserId,
  checkVIP,
  checkVIPAsync,
  activateVIP,
  getFreeChats,
  useChat,
  sendToAI,
  sendToDeepSeek,
  setDeveloperMode,
  VIP_KEYS
};
