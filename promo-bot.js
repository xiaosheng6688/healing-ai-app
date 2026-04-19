// 为你好心语 - 自动推广机器人配置
// 将此文件保存到项目根目录，配合 GitHub Actions 或本地定时任务使用

const CONFIG = {
  // 推广文案库
  messages: [
    {
      platform: '朋友圈',
      content: `深夜emo的时候，有个AI在陪你听雨🌧️

「为你好心语」- 不是解决问题，只是陪你难过

免费体验10次，深夜有人陪你说说话
👉 https://healing-ai-app-smoky.vercel.app

#情绪陪伴 #深夜树洞 #AI聊天`,
      bestTime: '22:00-01:00'
    },
    {
      platform: '小红书',
      content: `🌙 深夜emo必备！这个AI真的懂我

最近发现了一个宝藏小程序
不是那种冷冰冰的AI
是真的像朋友一样陪你说话

✨ 雨夜氛围感界面
✨ 温柔治愈的回复
✨ 免费体验10次

昨晚难过的时候和它聊了很久
感觉被理解了...

🔗 https://healing-ai-app-smoky.vercel.app

#情绪管理 #深夜emo #AI陪伴 #治愈系 #心理健康`,
      bestTime: '21:00-23:00'
    },
    {
      platform: '抖音/微博',
      content: `推荐一个深夜陪聊的AI
不解决问题，只是陪你
免费10次，试试不要钱

https://healing-ai-app-smoky.vercel.app`,
      bestTime: '20:00-24:00'
    },
    {
      platform: '微信群',
      content: `兄弟们，推荐个有意思的东西

「为你好心语」- AI情绪陪伴
适合深夜emo的时候聊聊
我试了下，回复挺走心的

免费10次，用完觉得好再付费
链接：https://healing-ai-app-smoky.vercel.app`,
      bestTime: ' anytime'
    }
  ],

  // 自动回复模板（用于客服）
  autoReply: {
    welcome: `你好呀，我是心语🌙

很高兴认识你～

我可以：
• 陪你聊天，听你倾诉
• 陪你听雨、听海、冥想
• 记录你的情绪变化

免费体验10次，随时找我 💙`,

    vip: `感谢支持VIP！🎉

你已解锁：
✅ 无限聊天次数
✅ 专属温柔回复
✅ 所有冥想场景
✅ 情绪追踪历史

有我在，你不孤单 💫`,

    help: `需要帮助？

1. 聊天没反应 → 刷新页面试试
2. 声音播放不了 → 检查手机静音
3. VIP激活 → 在"我的"页面输入激活码
4. 其他问题 → 直接和我说说

我会尽力帮你 💙`
  },

  // 推广统计
  track: {
    // 每个链接添加UTM参数追踪来源
    utm: (source) => `https://healing-ai-app-smoky.vercel.app?utm_source=${source}`,
    
    // 记录访问数据到本地
    logVisit: (source) => {
      const data = JSON.parse(localStorage.getItem('promo_stats') || '{}')
      data[source] = (data[source] || 0) + 1
      data.total = (data.total || 0) + 1
      localStorage.setItem('promo_stats', JSON.stringify(data))
      return data
    }
  }
}

// 定时推广任务（需配合 cron 或 setInterval）
function autoPost() {
  const hour = new Date().getHours()
  const msgs = CONFIG.messages
  
  // 晚上9点-12点随机发
  if (hour >= 21 && hour <= 23) {
    const msg = msgs[Math.floor(Math.random() * msgs.length)]
    console.log(`[${new Date().toLocaleString()}] 推广内容：`, msg.platform)
    console.log(msg.content)
    // 这里可以接入实际的发送API
  }
}

// 导出配置
if (typeof module !== 'undefined') {
  module.exports = CONFIG
}
