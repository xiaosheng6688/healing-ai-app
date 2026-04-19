// 批量部署脚本
const fs = require('fs');
const path = require('path');

const BASE = __dirname;
const TEMP = process.env.TEMP;

// ===================== ADMIN HTML =====================
const adminHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>为你好心语 · 管理后台</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'PingFang SC','Microsoft YaHei',sans-serif;background:#0a0a1a;color:#e2d9f3;min-height:100vh}
.header{padding:24px 32px;background:#1a1a2e;border-bottom:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;gap:16px}
.header h1{font-size:20px;font-weight:600;color:#c9a0f0}
.header span{font-size:12px;color:#6b5b7a;background:#2a2a3e;padding:4px 12px;border-radius:20px}
.container{max-width:1000px;margin:0 auto;padding:32px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
.stat{background:#1a1a2e;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;text-align:center}
.stat .num{font-size:28px;font-weight:700;color:#c9a0f0}
.stat .label{font-size:12px;color:#6b5b7a;margin-top:4px}
.refresh{background:#2a2a3e;border:1px solid rgba(255,255,255,0.1);color:#c9a0f0;padding:8px 16px;border-radius:10px;cursor:pointer;font-size:13px}
.refresh:hover{background:#3a3a4e}
table{width:100%;border-collapse:collapse;background:#1a1a2e;border-radius:16px;overflow:hidden}
th{background:#2a2a3e;padding:14px 16px;text-align:left;font-size:12px;color:#6b5b7a;font-weight:500}
td{padding:14px 16px;font-size:13px;border-top:1px solid rgba(255,255,255,0.04)}
tr:hover{background:rgba(255,255,255,0.02)}
.status{font-size:12px;padding:3px 10px;border-radius:20px;font-weight:500}
.status.pending{background:rgba(234,179,8,0.15);color:#eab308}
.status.paid{background:rgba(34,197,94,0.15);color:#22c55e}
.status.rejected{background:rgba(239,68,68,0.15);color:#ef4444}
.btn{font-size:12px;padding:6px 14px;border-radius:8px;border:none;cursor:pointer;font-weight:500;transition:all 0.2s}
.btn-approve{background:rgba(34,197,94,0.2);color:#22c55e;border:1px solid rgba(34,197,94,0.3)}
.btn-approve:hover{background:rgba(34,197,94,0.3)}
.btn-reject{background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.2)}
.btn-reject:hover{background:rgba(239,68,68,0.25)}
.order-id{font-family:monospace;font-size:11px;color:#8b7ba0;background:#2a2a3e;padding:2px 8px;border-radius:4px}
.amount{font-weight:600;color:#c9a0f0}
.msg{padding:10px 16px;border-radius:10px;font-size:13px;margin-bottom:20px;display:none}
.msg.show{display:block}
.msg.success{background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);color:#22c55e}
.msg.error{background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#ef4444}
h2{font-size:16px;font-weight:500;margin-bottom:16px;color:#c9a0f0}
.empty{text-align:center;padding:60px;color:#6b5b7a;font-size:14px}
</style>
</head>
<body>
<div class="header">
  <h1>🌧️ 为你好心语 · 管理后台</h1>
  <span id="timer">加载中...</span>
  <button class="refresh" onclick="loadOrders()" style="margin-left:auto">🔄 刷新</button>
</div>
<div class="container">
<div id="msg" class="msg"></div>
<div class="stats">
  <div class="stat"><div class="num" id="total">-</div><div class="label">总订单</div></div>
  <div class="stat"><div class="num" id="pending">-</div><div class="label">待处理</div></div>
  <div class="stat"><div class="num" id="paid">-</div><div class="label">已支付</div></div>
  <div class="stat"><div class="num" id="income">¥0</div><div class="label">总收入</div></div>
</div>
<h2>📋 订单列表</h2>
<div id="orders"></div>
</div>
<script>
var apiBase = location.protocol+'//'+location.host;
var msgTimer;
function showMsg(txt, type) {
  var el = document.getElementById('msg');
  el.textContent = txt; el.className = 'msg show ' + type;
  clearTimeout(msgTimer);
  msgTimer = setTimeout(function(){ el.className='msg'; }, 4000);
}
function loadOrders() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', apiBase+'/api/admin/orders', true);
  xhr.onload = function() {
    try {
      var d = JSON.parse(xhr.responseText);
      var orders = d.orders || [];
      var pending = orders.filter(function(o){ return o.status==='pending'; }).length;
      var paid = orders.filter(function(o){ return o.status==='paid'; }).length;
      var income = orders.filter(function(o){ return o.status==='paid'; }).reduce(function(s,o){ return s+(o.amount||0); }, 0);
      document.getElementById('total').textContent = orders.length;
      document.getElementById('pending').textContent = pending;
      document.getElementById('paid').textContent = paid;
      document.getElementById('income').textContent = '¥'+income;
      if (orders.length === 0) {
        document.getElementById('orders').innerHTML = '<div class="empty">暂无订单</div>';
        return;
      }
      var html = '<table><tr><th>订单号</th><th>用户</th><th>套餐</th><th>金额</th><th>状态</th><th>时间</th><th>操作</th></tr>';
      orders.forEach(function(o) {
        var planName = {month:'月度¥29',quarter:'季度¥69',year:'年度¥199',key:'激活码'}[o.plan] || o.plan;
        var statusClass = {pending:'pending',paid:'paid',rejected:'rejected'}[o.status] || '';
        var statusText = {pending:'待处理',paid:'已支付',rejected:'已拒绝'}[o.status] || o.status;
        var date = o.created ? new Date(o.created).toLocaleString('zh-CN') : '-';
        var actions = '';
        if (o.status === 'pending') {
          actions = '<button class="btn btn-approve" onclick="confirmOrder(\''+o.orderId+'\')">✓ 开通VIP</button> ' +
                   '<button class="btn btn-reject" onclick="rejectOrder(\''+o.orderId+'\')">✗ 拒绝</button>';
        } else {
          actions = '<span style="color:#6b5b7a;font-size:12px">'+statusText+'</span>';
        }
        html += '<tr><td><span class="order-id">'+o.orderId+'</span></td><td>'+(o.userId||'-')+'</td><td>'+planName+'</td><td class="amount">¥'+o.amount+'</td><td><span class="status '+statusClass+'">'+statusText+'</span></td><td style="color:#6b5b7a;font-size:12px">'+date+'</td><td>'+actions+'</td></tr>';
      });
      html += '</table>';
      document.getElementById('orders').innerHTML = html;
    } catch(e) { showMsg('加载失败: '+e.message, 'error'); }
  };
  xhr.onerror = function() { showMsg('网络错误', 'error'); };
  xhr.send();
}
function confirmOrder(orderId) {
  if (!confirm('确认开通该用户VIP？')) return;
  var xhr = new XMLHttpRequest();
  xhr.open('POST', apiBase+'/api/admin/confirm', true);
  xhr.setRequestHeader('Content-Type','application/json');
  xhr.onload = function() {
    try {
      var r = JSON.parse(xhr.responseText);
      if (r.ok) { showMsg('✓ '+r.message, 'success'); loadOrders(); }
      else { showMsg('✗ '+r.message, 'error'); }
    } catch(e) { showMsg('操作失败', 'error'); }
  };
  xhr.send(JSON.stringify({orderId:orderId}));
}
function rejectOrder(orderId) {
  if (!confirm('确认拒绝该订单？')) return;
  var xhr = new XMLHttpRequest();
  xhr.open('POST', apiBase+'/api/admin/reject', true);
  xhr.setRequestHeader('Content-Type','application/json');
  xhr.onload = function() { loadOrders(); showMsg('已拒绝', 'error'); };
  xhr.send(JSON.stringify({orderId:orderId}));
}
function startTimer() {
  var el = document.getElementById('timer');
  function tick() {
    var now = new Date().toLocaleString('zh-CN');
    el.textContent = now;
  }
  tick();
  setInterval(tick, 1000);
}
loadOrders();
startTimer();
setInterval(loadOrders, 30000);
</script>
</body>
</html>`;

// ===================== PROMOTE HTML =====================
const promoteHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>深夜树洞 · 为你好心语</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'PingFang SC','Microsoft YaHei',sans-serif;background:linear-gradient(180deg,#0a0a1a,#1a1a3e,#0d0d2a);min-height:100vh;color:#e0d8f0}
.rain{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden}
.rain-drop{position:absolute;width:2px;background:linear-gradient(to bottom,transparent,rgba(180,140,255,0.4));animation:fall linear infinite}
@keyframes fall{to{transform:translateY(100vh)}}
.container{max-width:600px;margin:0 auto;padding:20px;position:relative;z-index:1}
.hero{text-align:center;padding:60px 0 30px}
.hero-emoji{font-size:72px;margin-bottom:16px;animation:float 3s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.hero h1{font-size:28px;font-weight:700;margin-bottom:8px;background:linear-gradient(135deg,#c9a0f0,#9b6ee0);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{font-size:16px;color:#a090c0;line-height:1.6;margin-bottom:20px}
.tagline{background:rgba(155,110,224,0.15);border:1px solid rgba(155,110,224,0.3);border-radius:20px;padding:8px 20px;display:inline-block;font-size:14px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:30px 0}
.stat{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;text-align:center}
.stat .n{font-size:28px;font-weight:700;color:#c9a0f0}
.stat .l{font-size:12px;color:#6b5b7a;margin-top:4px}
.features{margin:20px 0}
.feat{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-bottom:12px;display:flex;align-items:center;gap:16px}
.feat-icon{font-size:32px;flex-shrink:0}
.feat h3{font-size:15px;margin-bottom:4px}
.feat p{font-size:13px;color:#6b5b7a}
.testimonials{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin:20px 0}
.testi{font-size:14px;color:#a090c0;line-height:1.7;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.05)}
.testi:last-child{margin-bottom:0;padding-bottom:0;border-bottom:none}
.testi strong{color:#c9a0f0}
.cta{text-align:center;padding:30px 0}
.btn{display:inline-block;background:linear-gradient(135deg,#9b6ee0,#7c3aed);color:white;text-decoration:none;font-size:18px;font-weight:600;padding:18px 48px;border-radius:50px;box-shadow:0 8px 32px rgba(155,110,224,0.4);transition:transform 0.2s,box-shadow 0.2s}
.btn:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(155,110,224,0.5)}
.price{text-align:center;margin:20px 0}
.price-note{font-size:13px;color:#6b5b7a;margin-top:8px}
.footer{text-align:center;padding:30px 0;color:#4a3a5a;font-size:12px}
</style>
</head>
<body>
<div class="rain" id="rain"></div>
<div class="container">
<div class="hero">
  <div class="hero-emoji">🌧️</div>
  <h1>为你好心语</h1>
  <p>深夜睡不着？来这里<br>有人真的在听</p>
  <div class="tagline">💜 免费10次/天 · 24小时在线</div>
</div>
<div class="stats">
  <div class="stat"><div class="n">10</div><div class="l">免费对话/天</div></div>
  <div class="stat"><div class="n">24h</div><div class="l">全天陪伴</div></div>
  <div class="stat"><div class="n">0</div><div class="l">评判/说教</div></div>
</div>
<div class="features">
  <div class="feat"><div class="feat-icon">🌧️</div><div><h3>雨夜治愈氛围</h3><p>打开就是雨夜，仿佛有人陪着你</p></div></div>
  <div class="feat"><div class="feat-icon">💜</div><div><h3>高级共情陪伴</h3><p>不说教、不评判，只是安静陪着你</p></div></div>
  <div class="feat"><div class="feat-icon">🔐</div><div><h3>完全私密</h3><p>不保存对话，不追踪数据，只属于你的树洞</p></div></div>
  <div class="feat"><div class="feat-icon">💰</div><div><h3>解锁VIP无限陪伴</h3><p>¥29/月，无限次对话，永久陪伴</p></div></div>
</div>
<div class="testimonials">
  <div class="testi">"我好累" → <strong>「嗯…辛苦了。不是那种客套的辛苦了，是真的觉得你撑了很久吧。」</strong></div>
  <div class="testi">"被朋友背叛了" → <strong>「被最信任的人伤害，那种感觉不是生气，是心空了一块。」</strong></div>
  <div class="testi">"有时候觉得活着没意思" → <strong>「有时候不是真的想死，只是太累了，想让一切停一下。」</strong></div>
</div>
<div class="cta">
  <a href="/#chat" class="btn">🌧️ 打开心语</a>
  <div class="price">
    <div style="font-size:24px;font-weight:700;color:#c9a0f0">¥29/月</div>
    <div class="price-note">每天不到1块钱，换无限次深夜陪伴</div>
  </div>
</div>
<div class="footer">
  <p>🌧️ 为你好心语 · 温暖治愈你的每一个夜晚</p>
</div>
</div>
<script>
var drops = 30;
for (var i=0;i<drops;i++){
  var d = document.createElement('div');
  d.className = 'rain-drop';
  d.style.left = Math.random()*100+'%';
  d.style.animationDuration = (2+Math.random()*3)+'s';
  d.style.animationDelay = Math.random()*5+'s';
  d.style.height = (10+Math.random()*20)+'px';
  d.style.opacity = 0.1+Math.random()*0.3;
  document.getElementById('rain').appendChild(d);
}
</script>
</body>
</html>`;

// Write admin.html
fs.writeFileSync(path.join(BASE, 'admin.html'), adminHtml, 'utf8');
console.log('OK admin.html ('+adminHtml.length+' bytes)');

// Write promote.html
fs.writeFileSync(path.join(BASE, 'promote.html'), promoteHtml, 'utf8');
console.log('OK promote.html ('+promoteHtml.length+' bytes)');

// Copy QR codes if they exist in public dir
var srcDir = path.join(BASE, 'public');
var files = ['wechat-pay.png','alipay-pay.png','icon-192.png','icon-512.png','manifest.json'];
files.forEach(function(f) {
  var src = path.join(srcDir, f);
  if (fs.existsSync(src)) {
    console.log('OK (exists): '+f);
  } else {
    console.log('MISSING: '+f);
  }
});

console.log('\nDeploy complete!');
console.log('Static files: '+BASE);
