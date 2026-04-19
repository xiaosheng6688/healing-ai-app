import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, BookOpen, Music, BarChart3, Sparkles, Droplets, Crown, Heart } from 'lucide-react'
import { checkVIP, getFreeChats, getUserId } from '../lib/api'

export default function Home() {
  const nav = useNavigate()
  const [vipStatus, setVipStatus] = useState(checkVIP)
  const [freeChats, setFreeChats] = useState(getFreeChats)
  const [timeGreet, setTimeGreet] = useState('')

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 6) setTimeGreet('深夜')
    else if (h < 9) setTimeGreet('清晨')
    else if (h < 12) setTimeGreet('上午')
    else if (h < 14) setTimeGreet('中午')
    else if (h < 18) setTimeGreet('下午')
    else if (h < 22) setTimeGreet('傍晚')
    else setTimeGreet('夜晚')

    // 检查VIP状态
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/vip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: getUserId() })
        });
        const data = await res.json();
        if (data.isVIP) {
          setVipStatus({ vip: true, vipUntil: data.vipUntil });
        }
        setFreeChats(data.freeRemaining ?? 10);
      } catch {}
    };
    checkStatus();
  }, [])

  // 多层雨滴
  const raindrops = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100 + '%',
    delay: Math.random() * 4 + 's',
    dur: (1.5 + Math.random() * 3) + 's',
    op: 0.15 + Math.random() * 0.35,
    size: Math.random() > 0.8 ? 'lg' : Math.random() > 0.5 ? 'md' : 'sm'
  }))

  // 星星
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    top: Math.random() * 40 + '%',
    left: Math.random() * 100 + '%',
    dur: (2 + Math.random() * 4) + 's',
    delay: Math.random() * 3 + 's'
  }))

  const features = [
    { icon: MessageCircle, title: 'AI陪伴', desc: '温暖倾听，永远在线', color: 'from-purple-500 to-pink-500', path: '/chat' },
    { icon: BarChart3, title: '情绪追踪', desc: '记录心情，了解自己', color: 'from-blue-500 to-cyan-500', path: '/mood' },
    { icon: Music, title: '冥想引导', desc: '深呼吸，放松身心', color: 'from-green-500 to-emerald-500', path: '/meditate' },
    { icon: BookOpen, title: '情绪日记', desc: '书写疗愈，记录成长', color: 'from-amber-500 to-orange-500', path: '/diary' },
  ]

  const moods = [
    { emoji: '😊', label: '开心', color: 'from-yellow-400 to-orange-400' },
    { emoji: '😔', label: '难过', color: 'from-blue-400 to-indigo-400' },
    { emoji: '😰', label: '焦虑', color: 'from-purple-400 to-pink-400' },
    { emoji: '😌', label: '平静', color: 'from-green-400 to-teal-400' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden rain-bg">
      {/* 雨滴背景 */}
      {raindrops.map(d => (
        <div 
          key={d.id} 
          className={`raindrop ${d.size === 'lg' ? 'raindrop-lg' : ''}`}
          style={{ 
            left: d.left, 
            animationDuration: d.dur, 
            animationDelay: d.delay,
            opacity: d.op
          }} 
        />
      ))}
      
      {/* 星星 */}
      {stars.map(s => (
        <div 
          key={'star'+s.id}
          className="star"
          style={{
            top: s.top,
            left: s.left,
            animationDuration: s.dur,
            animationDelay: s.delay
          }}
        />
      ))}
      
      {/* 月光 */}
      <div className="moon-glow" />
      
      {/* 云朵 */}
      <div className="cloud" style={{ top: '5%', left: '5%', width: '180px', height: '90px', animationDuration: '15s' }} />
      <div className="cloud" style={{ top: '12%', right: '10%', width: '140px', height: '70px', animationDuration: '20s' }} />
      <div className="cloud" style={{ top: '20%', left: '30%', width: '100px', height: '50px', animationDuration: '25s', opacity: 0.2 }} />
      
      {/* 光晕效果 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/3 rounded-full blur-3xl" />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 px-5 pt-10 pb-28">
        {/* Logo和标题 */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10 mb-4 shadow-2xl">
            <Droplets size={36} className="text-purple-300 breathing" />
          </div>
          <h1 className="text-3xl font-light text-white mb-2">
            为你好<span className="text-gradient font-medium">心语</span>
          </h1>
          <p className="text-gray-400 text-sm mb-3">{timeGreet}好 🌙 今晚，让我陪你</p>
          
          {/* 状态显示 */}
          {vipStatus.vip ? (
            <div className="inline-flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2">
              <Crown size={14} />
              <span className="vip-badge">VIP</span>
              <span>尊享会员 · 无限陪伴</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-xs text-gray-400 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <Heart size={12} className="text-pink-400" />
              <span>今日免费 <span className="text-purple-400 font-bold">{freeChats}</span>/10 次</span>
            </div>
          )}
        </div>

        {/* 心情选择 */}
        <div className="glass p-5 mb-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-yellow-400" />
            <span className="text-sm text-gray-300">今晚，你的心情是？</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {moods.map(m => (
              <button key={m.label} onClick={() => nav('/chat')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br ${m.color} bg-opacity-10 hover:scale-105 transition-all`}>
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs text-gray-300">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 功能入口 */}
        <div className="grid grid-cols-2 gap-3 mb-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {features.map(({ icon: Icon, title, desc, color, path }) => (
            <button key={title} onClick={() => nav(path)}
              className="glass flex flex-col items-start gap-3 p-4 text-left hover:border-purple-500/30 transition-all active:scale-95">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <div className="text-white font-medium text-sm">{title}</div>
                <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* 治愈语录 */}
        <div className="glass p-5 text-center mb-5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-gray-300 text-sm leading-relaxed italic">
            "你不需要总是坚强，<br />
            偶尔脆弱也没关系。<br />
            今晚，让心语陪你一起，<br />
            慢慢好起来。"
          </p>
          <div className="flex justify-center gap-2 mt-3">
            <span className="text-xs text-gray-500">— 心语</span>
          </div>
        </div>

        {/* 开始按钮 */}
        <button onClick={() => nav('/chat')}
          className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white font-medium py-4 rounded-2xl shadow-xl shadow-purple-900/40 active:scale-[0.98] transition-transform btn-pulse animate-fade-in text-base"
          style={{ animationDelay: '0.4s' }}>
          开始陪伴 🌸
        </button>
        
        {/* 提示 */}
        <p className="text-center text-gray-600 text-xs mt-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          安全 · 私密 · 24小时陪伴
        </p>
      </div>

      {/* 海浪效果 */}
      <div className="wave-container">
        <div className="wave" />
      </div>
    </div>
  )
}
