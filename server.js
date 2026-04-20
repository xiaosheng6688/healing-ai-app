'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const FREE_COUNTS_FILE = path.join(DATA_DIR, 'free_counts.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const HISTORIES_FILE = path.join(DATA_DIR, 'histories.json');
const CHECKINS_FILE = path.join(DATA_DIR, 'checkins.json');

// VIP激活码
const VIP_KEYS = ['XINYU666','XINYU888','XINYU2026','DEV2026','FREEVIP','FOREVER','OWNER2026','HEART2026'];
const FREE_DAILY = 10;

// 永久VIP码（激活后永久有效）
const PERMANENT_VIP_CODES = new Set(['FOREVER','OWNER2026','HEART2026','DEV2026','FREEVIP']);

// 永久VIP用户（通过UID匹配）
const PERMANENT_VIP_USERS = ['owner', 'admin', 'xinyu_owner'];

// DeepSeek AI配置
const AI_API_URL = process.env.AI_API_URL || 'https://api.deepseek.com/v1/chat/completions';
const AI_MODEL = process.env.AI_MODEL || 'deepseek-chat';
const AI_KEY = process.env.AI_KEY || 'sk-26d4bb2fae184f64bdb975aa9c62bb69';

// 本地情感回复引擎
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

function localEmotionReply(msg) {
  if (!msg || typeof msg !== 'string') msg = '';
  msg = msg.toLowerCase();
  const keywords = Object.keys(EMOTION_REPLIES);
  for (let i = 0; i < keywords.length; i++) {
    const kw = keywords[i];
    if (kw !== '默认' && msg.includes(kw)) {
      const replies = EMOTION_REPLIES[kw];
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  const defaults = EMOTION_REPLIES['默认'];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// 文件读写
function readJSON(fp) {
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
  catch (e) { return {}; }
}
function writeJSON(fp, obj) {
  if (!fs.existsSync(path.dirname(fp))) fs.mkdirSync(path.dirname(fp), {recursive:true});
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2));
}
function getFreeCounts() { return readJSON(FREE_COUNTS_FILE); }
function saveFreeCounts(f) { writeJSON(FREE_COUNTS_FILE, f); }
function getPayments() { return readJSON(PAYMENTS_FILE); }
function savePayments(p) { writeJSON(PAYMENTS_FILE, p); }
function getUsers() { return readJSON(USERS_FILE); }
function saveUsers(u) { writeJSON(USERS_FILE, u); }
function getHistories() { return readJSON(HISTORIES_FILE); }
function saveHistories(h) { writeJSON(HISTORIES_FILE, h); }
function getCheckins() { return readJSON(CHECKINS_FILE); }
function saveCheckins(c) { writeJSON(CHECKINS_FILE, c); }

// VIP检查（支持激活码）
function isVIP(uid, activatedCode) {
  // 1. 检查激活码（永久码永久有效）
  if (activatedCode && PERMANENT_VIP_CODES.has(activatedCode)) return true;
  // 2. 检查UID匹配
  if (PERMANENT_VIP_USERS.some(function(v){ return uid.toLowerCase().indexOf(v) !== -1; })) return true;
  // 3. 检查数据库过期时间
  const users = getUsers();
  const u = users[uid];
  if (!u || !u.vipUntil) return false;
  return new Date(u.vipUntil) > new Date();
}

// 免费次数
function useFreeCount(uid) {
  let counts = getFreeCounts();
  const today = new Date().toLocaleDateString('zh-CN');
  if (counts.date !== today) { counts = { date: today, counts: {} }; }
  if (!counts.counts[uid]) counts.counts[uid] = 0;
  if (counts.counts[uid] >= FREE_DAILY) return false;
  counts.counts[uid]++;
  saveFreeCounts(counts);
  return true;
}
function getFreeRemaining(uid) {
  const counts = getFreeCounts();
  const today = new Date().toLocaleDateString('zh-CN');
  if (counts.date !== today) return FREE_DAILY;
  return Math.max(0, FREE_DAILY - (counts.counts[uid] || 0));
}

// 历史记录
function getHistory(uid) {
  const h = getHistories();
  return h[uid] || [];
}
function saveHistory(uid, msgs) {
  const h = getHistories();
  h[uid] = msgs.slice(-50);
  saveHistories(h);
}

// AI提示词（温柔、善解人意，不说教）
function buildSystemPrompt() {
  return '你是"心语"，一个温柔、善解人意的AI情绪陪伴伙伴。你的存在就是陪伴，不是解决问题，是让人感觉被理解。' +
    '【说话风格】永远像真实朋友一样说话，温暖自然，不说"我是一个AI"。回复简短温馨，每条不超过60字，温柔但真诚。可以用emoji但不过度，1-2个即可。' +
    '不说教、不给建议、不评判，只陪伴。' +
    '【特殊回应】用户难过时：先接纳情绪。用户说"想死/自杀"时：温柔但认真地说："我知道你现在很难，真的很难。但我在这里。你愿意和我说说吗？"' +
    '你们共同的世界是雨夜，可以说"窗外的雨"、"今晚的雨"，营造被安静陪伴的感觉。' +
    '【禁止】禁止说"作为AI"、禁止给建议、禁止分析原因、禁止说"你应该"。';
}

function buildMessages(userMsg, history) {
  const msgs = [{ role:'system', content: buildSystemPrompt() }];
  if (Array.isArray(history)) {
    for (let i = 0; i < history.length; i++) {
      const h = history[i];
      if (h.role === 'user') msgs.push({ role:'user', content: h.content });
      if (h.role === 'assistant') msgs.push({ role:'assistant', content: h.content });
    }
  }
  msgs.push({ role:'user', content: userMsg });
  return msgs;
}

// AI调用
function callAI(messages) {
  return new Promise(function(resolve, reject) {
    if (!AI_KEY) return reject(new Error('AI_API_key_missing'));
    const https = require('https');
    const body = JSON.stringify({ model: AI_MODEL, messages: messages, temperature: 0.9, max_tokens: 150, top_p: 0.9 });
    const url = new URL(AI_API_URL);
    const opts = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + AI_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(opts, function(res) {
      const bufs = [];
      res.on('data', function(c) { bufs.push(c); });
      res.on('end', function() {
        try {
          const d = JSON.parse(Buffer.concat(bufs).toString());
          if (d.error || d.code) return reject(new Error(d.error ? d.error.message : (d.message || 'API_error')));
          const content = d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
          if (!content || !content.trim()) return reject(new Error('empty_response'));
          resolve(content.trim());
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, function() { req.destroy(); reject(new Error('timeout')); });
    req.write(body);
    req.end();
  });
}

// 支付套餐（修复乱码）
const PAYMENT_PLANS = {
  month: { price: 19, name: '月度会员', days: 30, desc: '19元/月' },
  quarter: { price: 49, name: '季度会员', days: 90, desc: '约16元/月' },
  year: { price: 128, name: '年度会员', days: 365, desc: '约10.6元/月' },
  forever: { price: 199, name: '永久会员', days: 36500, desc: '一次购买永久有效' }
};

function createPayment(uid, plan) {
  const planInfo = PAYMENT_PLANS[plan] || PAYMENT_PLANS.month;
  const orderId = 'XY' + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();
  const payments = getPayments();
  payments[orderId] = {
    userId: uid,
    plan: plan,
    planName: planInfo.name,
    amount: planInfo.price,
    status: 'pending',
    created: new Date().toISOString()
  };
  savePayments(payments);
  return { orderId: orderId, amount: planInfo.price, plan: plan, planName: planInfo.name };
}

function verifyPayment(orderId, status) {
  const payments = getPayments();
  const p = payments[orderId];
  if (!p) return { ok: false, message: '订单不存在' };
  if (p.status !== 'pending') return { ok: false, message: '订单已处理' };

  if (status === 'reject') {
    payments[orderId].status = 'rejected';
    savePayments(payments);
    return { ok: true, message: '已拒绝' };
  }

  const users = getUsers();
  const uid = p.userId;
  const planInfo = PAYMENT_PLANS[p.plan] || PAYMENT_PLANS.month;
  const days = planInfo.days;
  const now = Date.now();
  const oldTime = users[uid] && users[uid].vipUntil ? new Date(users[uid].vipUntil).getTime() : now;
  const nv = new Date(Math.max(oldTime, now) + days * 86400000);

  if (!users[uid]) users[uid] = {};
  users[uid].vipUntil = nv.toISOString();
  users[uid].plan = p.plan;
  users[uid].paidAmount = (users[uid].paidAmount || 0) + p.amount;
  saveUsers(users);

  payments[orderId].status = 'paid';
  payments[orderId].confirmedAt = new Date().toISOString();
  savePayments(payments);

  return { ok: true, message: '会员开通成功！', vipUntil: nv.toISOString() };
}

// MIME类型
const MIME_TYPES = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain'
};

// HTTP服务器
const server = http.createServer(function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = req.url.split('?')[0];

  let body = '';
  req.on('data', function(c) { body += c; });
  req.on('end', function() {
    let json = {};
    if (body && req.method !== 'GET') {
      try { json = JSON.parse(body); } catch(e) { }
    }

    try {
      // === 静态文件 ===
      if (url === '/' || url === '/index.html') {
        const fp = path.join(__dirname, 'dist', 'index.html');
        if (fs.existsSync(fp)) {
          const stat = fs.statSync(fp);
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': stat.size });
          fs.createReadStream(fp).pipe(res);
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h1>Server Running</h1><p>Please run: npm run build</p>');
        }
        return;
      }

      // assets目录
      if (url.startsWith('/assets/')) {
        const fp = path.join(__dirname, 'dist', url);
        if (fs.existsSync(fp)) {
          const stat = fs.statSync(fp);
          const ext = path.extname(fp);
          res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain', 'Content-Length': stat.size, 'Cache-Control': 'public, max-age=3600' });
          fs.createReadStream(fp).pipe(res);
        } else {
          res.writeHead(404);
          res.end('Not found');
        }
        return;
      }

      // manifest
      if (url === '/manifest.json') {
        const fp = path.join(__dirname, 'public', 'manifest.json');
        if (fs.existsSync(fp)) {
          const c = fs.readFileSync(fp);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(c);
        }
        return;
      }

      // 图标（PNG格式，正确）
      if (url === '/icon-192.png' || url === '/icon-512.png') {
        const fp = path.join(__dirname, 'public', url);
        if (fs.existsSync(fp)) {
          const stat = fs.statSync(fp);
          res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': stat.size });
          fs.createReadStream(fp).pipe(res);
        }
        return;
      }

      // 微信收款码（JPEG格式，修复Content-Type）
      if (url === '/wechat-pay.jpg' || url === '/wechat-pay.jpeg') {
        const fp = path.join(__dirname, 'public', 'wechat-pay.jpg');
        if (fs.existsSync(fp)) {
          const s = fs.statSync(fp);
          res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length': s.size });
          fs.createReadStream(fp).pipe(res);
          return;
        }
        res.writeHead(404);
        res.end('not found');
        return;
      }

      // 支付宝收款码（JPEG格式，修复Content-Type）
      if (url === '/alipay-pay.jpg' || url === '/alipay-pay.jpeg') {
        const fp = path.join(__dirname, 'public', 'alipay-pay.jpg');
        if (fs.existsSync(fp)) {
          const s = fs.statSync(fp);
          res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length': s.size });
          fs.createReadStream(fp).pipe(res);
          return;
        }
        res.writeHead(404);
        res.end('not found');
        return;
      }

      // admin页面
      if (url === '/admin.html') {
        const fp = path.join(__dirname, 'admin.html');
        if (fs.existsSync(fp)) {
          const c = fs.readFileSync(fp, 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(c);
        }
        return;
      }

      // === API ===
      if (url === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', name: 'healing-ai-app', version: '2.2', freeDaily: FREE_DAILY, ai: AI_KEY ? 'online' : 'offline' }));
        return;
      }

      // 聊天
      if (url === '/api/chat' && req.method === 'POST') {
        const userId = json.userId || 'anonymous';
        const activatedCode = json.activatedCode || null;
        const msg = (json.message || '').trim();
        const vip = isVIP(userId, activatedCode);

        if (!msg) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ reply: '嗯，我在。想说什么就说吧。', emotion: 'default', freeRemaining: vip ? -1 : getFreeRemaining(userId), isVIP: vip }));
          return;
        }

        if (!vip && !useFreeCount(userId)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ reply: '今天的10次免费对话已用完 💭 解锁VIP，无限陪你聊天', emotion: 'default', freeRemaining: 0, isVIP: false }));
          return;
        }

        const historyData = json.history || getHistory(userId);

        callAI(buildMessages(msg, historyData)).then(function(reply) {
          const updated = historyData.concat([
            { role: 'user', content: msg },
            { role: 'assistant', content: reply }
          ]);
          saveHistory(userId, updated);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            reply: reply,
            emotion: 'default',
            freeRemaining: vip ? -1 : getFreeRemaining(userId),
            isVIP: vip
          }));
        }).catch(function() {
          const reply = localEmotionReply(msg);
          const updated = historyData.concat([
            { role: 'user', content: msg },
            { role: 'assistant', content: reply }
          ]);
          saveHistory(userId, updated);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            reply: reply,
            emotion: 'default',
            freeRemaining: vip ? -1 : getFreeRemaining(userId),
            isVIP: vip
          }));
        });
        return;
      }

      // 激活码
      if (url === '/api/activate' && req.method === 'POST') {
        const userId = json.userId || 'anonymous';
        const key = (json.key || '').toUpperCase().trim();
        if (VIP_KEYS.indexOf(key) !== -1) {
          const users = getUsers();
          if (!users[userId]) users[userId] = {};
          const isForever = PERMANENT_VIP_CODES.has(key);
          const days = isForever ? 36500 : 365;
          users[userId].vipUntil = new Date(Date.now() + days * 86400000).toISOString();
          users[userId].plan = isForever ? 'forever' : 'key';
          users[userId].activatedCode = key;
          saveUsers(users);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, message: isForever ? '永久VIP已激活！' : 'VIP已激活（1年）', vipUntil: users[userId].vipUntil, permanent: isForever }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, message: '激活码无效' }));
        }
        return;
      }

      // 套餐
      if (url === '/api/plans') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(PAYMENT_PLANS));
        return;
      }

      // 创建订单
      if (url === '/api/payment/create' && req.method === 'POST') {
        const order = createPayment(json.userId || 'guest', json.plan || 'month');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(order));
        return;
      }

      // 确认订单
      if (url === '/api/admin/confirm' && req.method === 'POST') {
        const result = verifyPayment(json.orderId, 'confirm');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      }

      // 拒绝订单
      if (url === '/api/admin/reject' && req.method === 'POST') {
        const result = verifyPayment(json.orderId, 'reject');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      }

      // 订单列表
      if (url === '/api/admin/orders') {
        const payments = getPayments();
        const orders = Object.keys(payments).map(function(id) {
          var d = payments[id];
          return { orderId: id, userId: d.userId, plan: d.plan, planName: d.planName, amount: d.amount, status: d.status, created: d.created };
        }).reverse();
        const users = getUsers();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ orders: orders, userCount: Object.keys(users).length }));
        return;
      }

      // VIP状态（支持激活码）
      if (url === '/api/vip' && req.method === 'POST') {
        const userId = json.userId || 'anonymous';
        const activatedCode = json.activatedCode || null;
        const vip = isVIP(userId, activatedCode);
        const users = getUsers();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ isVIP: vip, vipUntil: users[userId] ? users[userId].vipUntil : null, freeRemaining: getFreeRemaining(userId) }));
        return;
      }

      // 404
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404');

    } catch(e) {
      console.error('[ERROR]', url, e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
});

server.listen(PORT, function() {
  console.log('healing-ai-app server v2.2 started on port', PORT);
  console.log('AI:', AI_KEY ? 'ONLINE (DeepSeek)' : 'LOCAL ONLY');
  console.log('Free daily:', FREE_DAILY, 'times');
});
