import React, { useState, useEffect } from 'react'
import { Crown, Check, Gift, Sparkles, Key, Zap, Shield, Heart } from 'lucide-react'
import { checkVIP, activateVIP, getFreeChats, getUserId } from '../lib/api'

const PLANS = [
  { id: 'month', name: '月度会员', price: 19, original: 29, days: 30, tag: '', desc: '19元/月' },
  { id: 'quarter', name: '季度会员', price: 49, original: 87, days: 90, tag: '热门', desc: '约16元/月' },
  { id: 'year', name: '年度会员', price: 128, original: 348, days: 365, tag: '推荐', desc: '约10.6元/月' },
  { id: 'forever', name: '永久会员', price: 199, original: 999, days: 36500, tag: '超值', desc: '一次购买永久有效' },
]

export default function Subscription() {
  const [vipStatus, setVipStatus] = useState(checkVIP)
  const [tab, setTab] = useState('wechat')
  const [inputCode, setInputCode] = useState('')
  const [codeMsg, setCodeMsg] = useState('')
  const [freeChats, setFreeChats] = useState(getFreeChats)
  const [selectedPlan, setSelectedPlan] = useState('quarter')
  const [showPayment, setShowPayment] = useState(false)

  useEffect(function() {
    const checkStatus = async function() {
      try {
        const res = await fetch('/api/vip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: getUserId() })
        })
        const data = await res.json()
        if (data.isVIP) {
          setVipStatus({ vip: true, vipUntil: data.vipUntil })
        }
        setFreeChats(data.freeRemaining !== undefined ? data.freeRemaining : 10)
      } catch (e) { }
    }
    checkStatus()
  }, [])

  const handleActivate = async function() {
    const result = await activateVIP(inputCode.trim())
    if (result.message) {
      setCodeMsg(result.message)
    } else {
      setCodeMsg(result.ok ? 'VIP已激活！' : '激活码无效')
    }
    if (result.ok) {
      setVipStatus({ vip: true })
      setTimeout(function() { window.location.reload() }, 1500)
    }
  }

  const currentPlan = PLANS.find(function(p) { return p.id === selectedPlan; }) || PLANS[1]

  // 下雨效果
  const raindrops = Array.from({ length: 25 }, function(_, i) {
    return {
      id: i,
      left: Math.random() * 100 + '%',
      delay: Math.random() * 3 + 's',
      dur: (2 + Math.random() * 2) + 's',
    }
  })

  if (vipStatus.vip) {
    return (
      React.createElement('div', { className: 'min-h-screen relative overflow-hidden', style: { background: 'linear-gradient(180deg, #0a0a1a, #1a1a2e)' } },
        raindrops.map(function(d) {
          return React.createElement('div', { key: d.id, className: 'raindrop', style: { left: d.left, animationDuration: d.dur, animationDelay: d.delay } })
        }),
        React.createElement('div', { className: 'relative z-10 max-w-md mx-auto px-5 pt-12 pb-28' },
          React.createElement('div', { className: 'text-center mb-8 animate-fade-in' },
            React.createElement('div', { className: 'inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-white px-5 py-2 rounded-full mb-4' },
              React.createElement(Crown, { size: 18, className: 'text-yellow-400' }),
              React.createElement('span', { className: 'font-bold tracking-wide' }, '心语尊享会员')
            ),
            React.createElement('h1', { className: 'text-2xl font-light text-white mb-2' }, '谢谢你，选择陪伴 🌸'),
            React.createElement('p', { className: 'text-gray-400 text-sm' }, '你的支持让心语能够持续为你服务')
          ),
          React.createElement('div', { className: 'glass p-6 text-center mb-6 animate-fade-in', style: { animationDelay: '0.1s' } },
            React.createElement('div', { className: 'text-5xl mb-4' }, '💎'),
            React.createElement('h2', { className: 'text-xl font-medium text-white mb-2' }, '无限对话 · 无限治愈'),
            React.createElement('p', { className: 'text-gray-400 text-sm' }, '随时来找我，我都在')
          ),
          React.createElement('div', { className: 'space-y-3 animate-fade-in', style: { animationDelay: '0.2s' } },
            ['♾️ 无限次 AI 陪伴对话', '📊 情绪数据分析报告', '🎵 专属冥想引导音频', '📖 情绪日记云端同步', '💝 专属治愈场景主题', '🌟 新功能优先体验'].map(function(item, i) {
              return React.createElement('div', { key: i, className: 'glass flex items-center gap-3 p-4' },
                React.createElement('span', { className: 'text-2xl' }, item[0]),
                React.createElement('span', { className: 'text-gray-200' }, item.slice(2)),
                React.createElement(Check, { size: 18, className: 'ml-auto text-green-400' })
              )
            })
          )
        )
      )
    )
  }

  return (
    React.createElement('div', { className: 'min-h-screen relative overflow-hidden', style: { background: 'linear-gradient(180deg, #0a0a1a, #1a1a2e, #16213e)' } },
      raindrops.map(function(d) {
        return React.createElement('div', { key: d.id, className: 'raindrop', style: { left: d.left, animationDuration: d.dur, animationDelay: d.delay } })
      }),
      React.createElement('div', { className: 'relative z-10 max-w-md mx-auto px-5 pt-10 pb-28' },
        // 标题
        React.createElement('div', { className: 'text-center mb-6 animate-fade-in' },
          React.createElement('div', { className: 'inline-flex items-center gap-2 text-gray-400 mb-3' },
            React.createElement(Crown, { size: 16 }),
            React.createElement('span', { className: 'text-sm' }, '解锁全部功能')
          ),
          React.createElement('h1', { className: 'text-2xl font-light text-white mb-1' }, '让', React.createElement('span', { className: 'text-purple-400' }, '心语'), '陪伴你'),
          React.createElement('p', { className: 'text-gray-400 text-sm' }, '每天10次免费对话，会员无限治愈')
        ),
        // 会员特权
        React.createElement('div', { className: 'glass p-4 mb-5 animate-fade-in', style: { animationDelay: '0.1s' } },
          React.createElement('div', { className: 'grid grid-cols-4 gap-2' },
            [['无限对话', '♾️'], ['情绪报告', '📊'], ['冥想音频', '🎵'], ['日记同步', '☁️']].map(function(item) {
              return React.createElement('div', { key: item[0], className: 'bg-white/5 rounded-xl p-2 text-center' },
                React.createElement('div', { className: 'text-xl mb-0.5' }, item[1]),
                React.createElement('div', { className: 'text-xs text-gray-300' }, item[0])
              )
            })
          )
        ),
        // 套餐选择
        React.createElement('div', { className: 'mb-5 animate-fade-in', style: { animationDelay: '0.15s' } },
          React.createElement('div', { className: 'flex gap-2 overflow-x-auto pb-2' },
            PLANS.map(function(plan) {
              return React.createElement('button', {
                key: plan.id,
                onClick: function() { setSelectedPlan(plan.id) },
                className: 'flex-shrink-0 relative px-4 py-3 rounded-xl text-center transition-all ' + (
                  selectedPlan === plan.id
                    ? 'bg-gradient-to-br from-purple-600/40 to-indigo-600/40 border-2 border-purple-500'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                )
              },
                plan.tag && React.createElement('span', {
                  className: 'absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs bg-gradient-to-r from-orange-500 to-pink-500 text-white px-2 py-0.5 rounded-full'
                }, plan.tag),
                React.createElement('div', { className: 'text-white font-medium text-sm' }, plan.name),
                React.createElement('div', { className: 'text-purple-400 font-bold text-lg' }, '¥' + plan.price),
                React.createElement('div', { className: 'text-gray-500 text-xs' }, plan.desc)
              )
            })
          )
        ),
        // 价格卡片
        React.createElement('div', { className: 'glass p-5 mb-5 relative overflow-hidden animate-fade-in', style: { animationDelay: '0.2s' } },
          React.createElement('div', { className: 'text-center mb-4' },
            React.createElement('div', { className: 'flex items-center justify-center gap-2 mb-1' },
              React.createElement('span', { className: 'text-gray-500 line-through' }, '¥' + currentPlan.original),
              React.createElement('span', { className: 'text-3xl font-bold text-white' }, '¥' + currentPlan.price)
            ),
            React.createElement('p', { className: 'text-gray-500 text-xs' }, currentPlan.name + ' · ' + currentPlan.desc)
          ),
          React.createElement('div', { className: 'space-y-2 mb-4 text-sm' },
            ['无限次 AI 情绪陪伴对话', '每日情绪追踪与数据报告', '专业冥想引导音频', '情绪日记云端同步'].map(function(item, i) {
              return React.createElement('div', { key: i, className: 'flex items-center gap-2 text-gray-300' },
                React.createElement(Check, { size: 14, className: 'text-green-400 flex-shrink-0' }),
                React.createElement('span', null, item)
              )
            })
          ),
          React.createElement('button', {
            onClick: function() { setShowPayment(true) },
            className: 'w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-3 rounded-xl shadow-lg btn-pulse'
          }, '立即开通')
        ),
        // 免费次数
        React.createElement('div', { className: 'text-center mb-5 animate-fade-in', style: { animationDelay: '0.25s' } },
          React.createElement('div', { className: 'inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-2' },
            React.createElement(Gift, { size: 14, className: 'text-purple-400' }),
            React.createElement('span', { className: 'text-gray-300 text-sm' },
              '今日免费: ',
              React.createElement('span', { className: 'font-bold ' + (freeChats > 0 ? 'text-purple-400' : 'text-red-400') }, freeChats),
              '/10 次'
            )
          )
        ),
        // 支付方式
        showPayment && React.createElement('div', { className: 'animate-fade-in' },
          React.createElement('div', { className: 'flex gap-2 mb-4' },
            [
              { key: 'wechat', label: '微信', icon: '💚' },
              { key: 'alipay', label: '支付宝', icon: '💙' },
              { key: 'code', label: '激活码', icon: React.createElement(Key, { size: 16 }) },
            ].map(function(item) {
              return React.createElement('button', {
                key: item.key,
                onClick: function() { setTab(item.key) },
                className: 'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ' + (
                  tab === item.key ? 'bg-white/15 text-white border border-white/20' : 'bg-white/5 text-gray-400 border border-white/5'
                )
              }, item.icon, ' ', item.label)
            })
          ),
          // 微信支付
          tab === 'wechat' && React.createElement('div', { className: 'glass p-5 text-center animate-fade-in' },
            React.createElement('div', { className: 'text-green-400 text-base mb-2 font-bold' }, '💚 微信扫码支付'),
            React.createElement('div', { className: 'text-white text-2xl font-bold mb-3' },
              '¥' + currentPlan.price,
              React.createElement('span', { className: 'text-gray-500 text-sm font-normal ml-2' }, currentPlan.name)
            ),
            React.createElement('div', { className: 'bg-white rounded-2xl p-4 inline-block mb-4 shadow-2xl' },
              React.createElement('img', {
                src: '/wechat-pay.jpg',
                alt: '微信收款码',
                className: 'w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-xl',
                onError: function(e) {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = '<div class="text-gray-400 text-sm p-8">请长按识别或截图扫码</div>'
                }
              })
            ),
            React.createElement('p', { className: 'text-yellow-400 text-xs font-bold mb-3' },
              '⚠️ 请转账 ¥' + currentPlan.price + ' 元（备注手机号）'
            ),
            React.createElement('div', { className: 'bg-white/5 rounded-xl p-3 text-left space-y-1.5' },
              ['① 长按收款码 → 保存到手机', '② 打开微信 → 扫一扫 → 右上角相册', '③ 输入金额 ¥' + currentPlan.price + ' → 转账', '④ 备注「手机号」，24小时内开通VIP'].map(function(p, i) {
                return React.createElement('p', { key: i, className: 'text-gray-300 text-sm flex items-center gap-2' },
                  React.createElement('span', { className: 'text-green-400' }, p.substring(0, 1)),
                  p.substring(1)
                )
              })
            )
          ),
          // 支付宝
          tab === 'alipay' && React.createElement('div', { className: 'glass p-5 text-center animate-fade-in' },
            React.createElement('div', { className: 'text-blue-400 text-base mb-2 font-bold' }, '💙 支付宝扫码支付'),
            React.createElement('div', { className: 'text-white text-2xl font-bold mb-3' },
              '¥' + currentPlan.price,
              React.createElement('span', { className: 'text-gray-500 text-sm font-normal ml-2' }, currentPlan.name)
            ),
            React.createElement('div', { className: 'bg-white rounded-2xl p-4 inline-block mb-4 shadow-2xl' },
              React.createElement('img', {
                src: '/alipay-pay.jpg',
                alt: '支付宝收款码',
                className: 'w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-xl',
                onError: function(e) {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = '<div class="text-gray-400 text-sm p-8">请长按识别或截图扫码</div>'
                }
              })
            ),
            React.createElement('p', { className: 'text-yellow-400 text-xs font-bold mb-3' },
              '⚠️ 请转账 ¥' + currentPlan.price + ' 元（备注手机号）'
            )
          ),
          // 激活码
          tab === 'code' && React.createElement('div', { className: 'glass p-5' },
            React.createElement('div', { className: 'text-center mb-4' },
              React.createElement('div', { className: 'text-3xl mb-2' }, '🔑'),
              React.createElement('p', { className: 'text-gray-400 text-sm' }, '已有激活码？直接激活')
            ),
            React.createElement('div', { className: 'space-y-3' },
              React.createElement('input', {
                type: 'text',
                placeholder: '请输入激活码',
                value: inputCode,
                onChange: function(e) { setInputCode(e.target.value.toUpperCase()) },
                className: 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-center tracking-widest font-mono text-sm focus:outline-none focus:border-purple-400/50'
              }),
              React.createElement('button', {
                onClick: handleActivate,
                className: 'w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-3 rounded-xl'
              }, '立即激活'),
              codeMsg && React.createElement('div', {
                className: 'text-center text-sm p-2 rounded-lg ' + (
                  codeMsg.indexOf('成功') !== -1 || codeMsg.indexOf('已激活') !== -1
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                )
              }, codeMsg)
            ),
            React.createElement('div', { className: 'mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center' },
              React.createElement('p', { className: 'text-yellow-400/80 text-xs' }, '💡 体验激活码'),
              React.createElement('p', { className: 'text-yellow-300 font-mono text-sm mt-1' }, 'XINYU666')
            )
          )
        ),
        // 安全保障
        React.createElement('div', { className: 'mt-5 glass p-4 animate-fade-in', style: { animationDelay: '0.3s' } },
          React.createElement('div', { className: 'flex items-center justify-center gap-4 text-xs text-gray-400' },
            React.createElement('div', { className: 'flex items-center gap-1' }, React.createElement(Shield, { size: 12 }), '安全支付'),
            React.createElement('div', { className: 'flex items-center gap-1' }, React.createElement(Zap, { size: 12 }), '即时激活'),
            React.createElement('div', { className: 'flex items-center gap-1' }, React.createElement(Heart, { size: 12 }), '温馨陪伴')
          )
        ),
        React.createElement('div', { className: 'mt-4 text-center text-gray-600 text-xs' },
          React.createElement('p', null, '转账即表示同意《会员服务协议》'),
          React.createElement('p', { className: 'mt-1' }, '问题联系：xinyu_ai@outlook.com')
        )
      )
    )
  )
}
