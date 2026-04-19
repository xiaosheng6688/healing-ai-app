import React, { useState, useRef, useEffect } from 'react'
import { Send, ArrowLeft, AlertCircle, Crown, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { sendToAI, checkVIP, getFreeChats, useChat, getUserId, activateVIP } from '../lib/api'

export default function Chat() {
  const nav = useNavigate()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '嗨，我是心语 🌸\n今晚天气有点凉，但我的陪伴是暖的。\n有什么想聊的吗？' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [vipStatus, setVipStatus] = useState(checkVIP())
  const [freeChats, setFreeChats] = useState(getFreeChats())
  const [showVIPModal, setShowVIPModal] = useState(false)
  const [vipCode, setVipCode] = useState('')
  const bottomRef = useRef(null)

  // 初始化
  useEffect(() => {
    setVipStatus(checkVIP())
    setFreeChats(getFreeChats())
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    const text = input.trim()
    setInput('')
    
    // 检查次数
    const chatCheck = useChat()
    if (!chatCheck.allowed) {
      setShowVIPModal(true)
      return
    }
    
    // 添加用户消息
    setMessages(m => [...m, { role: 'user', content: text }])
    setLoading(true)
    setFreeChats(chatCheck.remaining)

    try {
      // 调用AI
      let replyText = ''
      await sendToAI(text, messages, (chunk) => {
        replyText += chunk
        setMessages(m => {
          const last = m[m.length - 1]
          if (last.role === 'assistant' && last.streaming) {
            return [...m.slice(0, -1), { ...last, content: replyText }]
          }
          return [...m, { role: 'assistant', content: replyText, streaming: true }]
        })
      })
      
      // 完成流式输出
      setMessages(m => {
        const last = m[m.length - 1]
        if (last.role === 'assistant') {
          return [...m.slice(0, -1), { role: 'assistant', content: replyText }]
        }
        return m
      })
    } catch (e) {
      setMessages(m => [...m, { 
        role: 'assistant', 
        content: '出了点小问题...但我在这里，能再说说吗？ 💕' 
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault() 
      handleSend() 
    }
  }

  const handleActivateVIP = async () => {
    const res = await activateVIP(vipCode)
    if (res.ok) {
      setVipStatus(checkVIP())
      setShowVIPModal(false)
      alert(res.message)
    } else {
      alert(res.message)
    }
  }

  // 雨滴效果
  const raindrops = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100 + '%',
    delay: Math.random() * 3 + 's',
    dur: (2 + Math.random() * 2) + 's'
  }))

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)',
      paddingBottom: '100px'
    }}>
      {/* 雨滴背景 */}
      {raindrops.map(d => (
        <div 
          key={d.id} 
          className="raindrop"
          style={{ 
            left: d.left, 
            animationDuration: d.dur, 
            animationDelay: d.delay,
            position: 'absolute',
            width: '1px',
            height: '20px',
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))'
          }} 
        />
      ))}
      
      {/* 顶部栏 */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-4" style={{
        background: 'rgba(10,10,26,0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <button onClick={() => nav('/')} style={{ padding: '8px', borderRadius: '8px' }}>
          <ArrowLeft size={20} style={{ color: '#9ca3af' }} />
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px'
          }}>
            🌸
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>心语 · AI陪伴</div>
            {vipStatus.vip ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#fbbf24' }}>
                <Crown size={12} />
                <span>VIP · 无限对话</span>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                今日剩余 <span style={{ color: freeChats > 0 ? '#a855f7' : '#ef4444', fontWeight: 'bold' }}>{freeChats}</span>/10 次
              </div>
            )}
          </div>
        </div>
        {!vipStatus.vip && (
          <button onClick={() => setShowVIPModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '12px', background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              color: '#fff', padding: '8px 16px', borderRadius: '20px', border: 'none'
            }}>
            <Sparkles size={14} />
            升级VIP
          </button>
        )}
      </div>

      {/* 次数用完提示 */}
      {!vipStatus.vip && freeChats === 0 && (
        <div style={{ margin: '16px', padding: '16px', background: 'rgba(168,85,247,0.1)', borderRadius: '12px', border: '1px solid rgba(168,85,247,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={24} style={{ color: '#a855f7' }} />
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontSize: '14px' }}>今日免费次数已用完</p>
              <p style={{ color: '#9ca3af', fontSize: '12px' }}>解锁VIP，无限次陪伴你 🌙</p>
            </div>
            <button onClick={() => setShowVIPModal(true)} 
              style={{ background: '#a855f7', color: '#fff', padding: '8px 16px', borderRadius: '20px', border: 'none', fontSize: '12px' }}>
              解锁
            </button>
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            alignItems: 'flex-end'
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', marginRight: '12px'
              }}>
                🌸
              </div>
            )}
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              background: msg.role === 'user' 
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
                : 'rgba(168,85,247,0.2)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(168,85,247,0.3)',
              color: '#fff',
              fontSize: '14px',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 底部输入区 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px', background: 'linear-gradient(0deg, #0a0a1a 0%, transparent 100%)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px',
          backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)',
          maxWidth: '480px', margin: '0 auto'
        }}>
          <input
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={handleKey}
            placeholder={freeChats > 0 || vipStatus.vip ? "说点什么...我在听" : "今日次数已用完，请升级VIP"}
            disabled={loading || (!vipStatus.vip && freeChats <= 0)}
            style={{
              flex: 1, background: 'transparent', border: 'none', color: '#fff',
              fontSize: '14px', outline: 'none'
            }}
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || loading || (!vipStatus.vip && freeChats <= 0)}
            style={{
              padding: '12px', borderRadius: '12px', border: 'none',
              background: input.trim() && !loading && (vipStatus.vip || freeChats > 0)
                ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'rgba(255,255,255,0.1)',
              color: input.trim() && !loading && (vipStatus.vip || freeChats > 0) ? '#fff' : '#6b7280'
            }}
          >
            {loading ? (
              <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '12px', marginTop: '12px' }}>
          心语会一直陪着你 · 随时来找我 💕
        </p>
      </div>

      {/* VIP弹窗 */}
      {showVIPModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '20px'
        }} onClick={() => setShowVIPModal(false)}>
          <div style={{
            background: '#1a1a2e', padding: '24px', borderRadius: '20px',
            maxWidth: '360px', width: '100%', border: '1px solid rgba(168,85,247,0.3)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', fontSize: '48px', marginBottom: '16px' }}>👑</div>
            <h3 style={{ textAlign: 'center', color: '#fff', marginBottom: '8px' }}>解锁VIP特权</h3>
            <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
              ✅ 无限聊天次数<br/>
              ✅ 所有冥想场景<br/>
              ✅ 情绪历史记录
            </div>
            <input
              type="text"
              value={vipCode}
              onChange={e => setVipCode(e.target.value.toUpperCase())}
              placeholder="输入激活码"
              style={{
                width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                color: '#fff', textAlign: 'center', textTransform: 'uppercase',
                marginBottom: '12px'
              }}
            />
            <button onClick={handleActivateVIP}
              style={{
                width: '100%', padding: '14px', background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                border: 'none', borderRadius: '12px', color: '#fff', fontSize: '16px'
              }}
            >
              激活VIP
            </button>
            <p style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
              激活码：XINYU666 / XINYU888 / DEV2026
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .raindrop {
          animation: fall linear infinite;
        }
        @keyframes fall {
          to { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  )
}
