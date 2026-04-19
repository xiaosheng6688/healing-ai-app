# 💙 为你好心语 - 部署指南

## 快速开始（本地开发）

```bash
npm install
npm run build
npm start
```

访问 http://localhost:3000

---

## 部署到 Render（推荐）

### 1. 创建GitHub仓库
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/healing-ai-companion.git
git push -u origin main
```

### 2. 在Render创建服务
1. 访问 https://dashboard.render.com
2. 点击 "New Web Service"
3. 连接GitHub仓库
4. 配置：
   - Build Command: `npm install && npm run build`
   - Start Command: `node server.js`
5. 添加环境变量：
   - `AI_KEY`: your-deepseek-api-key
6. 点击 "Create Web Service"

### 3. 获得固定域名
Render会自动分配 `https://your-app.onrender.com`

---

## 部署到 Railway

1. 访问 https://railway.app
2. 从GitHub导入项目
3. 添加环境变量 `AI_KEY`
4. 部署完成

---

## 当前临时访问地址

🌐 **应用地址**: https://stockings-varieties-scheme-inc.trycloudflare.com

⚠️ 注意：这是临时隧道地址，重启后会变化。请尽快部署到Render获得固定域名。

---

## VIP激活码

- `XINYU666` - 7天VIP
- `XINYU888` - 30天VIP  
- `XINYU2026` - 永久VIP
- `FREEVIP` - 1天体验

---

## 推广页面

访问 `/promo.html` 查看推广海报页面，可分享到朋友圈。

示例: https://stockings-varieties-scheme-inc.trycloudflare.com/promo.html

---

## 文件结构

```
healing-ai-app/
├── server.js          # 后端服务
├── package.json       # 依赖配置
├── render.yaml        # Render部署配置
├── Procfile           # 进程配置
├── public/            # 静态资源
│   ├── promo.html     # 推广页面
│   └── admin.html     # 管理后台
├── src/               # 前端源码
│   ├── pages/         # 页面组件
│   └── lib/           # 工具函数
└── data/              # 数据存储
    ├── users.json     # 用户数据
    ├── vip.json       # VIP数据
    └── usage.json     # 使用统计
```

---

## 技术栈

- 前端: React + Vite + Tailwind CSS
- 后端: Node.js + Express (简化版)
- AI: DeepSeek API
- 部署: Render / Railway / Cloudflare Tunnel

---

## 联系方式

有问题？联系开发者获取支持。

---

**祝你早日盈利！🚀**
