import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Calendar } from 'lucide-react'

export default function Mood() {
  const nav = useNavigate()
  const [selected, setSelected] = useState(null)
  const [history, setHistory] = useState([])
  const [saved, setSaved] = useState(false)
  
  const moods = [
    { emoji: '😊', label: '开心', score: 9, color: 'from-yellow-500 to-orange-500' },
    { emoji: '😌', label: '平静', score: 7, color: 'from-green-500 to-teal-500' },
    { emoji: '😔', label: '难过', score: 4, color: 'from-blue-500 to-indigo-500' },
    { emoji: '😰', label: '焦虑', score: 3, color: 'from-purple-500 to-pink-500' },
    { emoji: '😠', label: '生气', score: 2, color: 'from-red-500 to-rose-500' },
    { emoji: '😴', label: '疲惫', score: 5, color: 'from-gray-500 to-slate-500' },
  ]

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('mood_history') || '[]')
    setHistory(h.slice(0, 7))
  }, [saved])

  const saveMood = (mood) => {
    setSelected(mood)
    const entry = {
      id: Date.now(),
      emoji: mood.emoji,
      label: mood.label,
      score: mood.score,
      date: new Date().toLocaleDateString('zh-CN'),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    const updated = [entry, ...JSON.parse(localStorage.getItem('mood_history') || '[]')].slice(0, 30)
    localStorage.setItem('mood_history', JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const avgScore = history.length > 0 
    ? (history.reduce((a, b) => a + b.score, 0) / history.length).toFixed(1)
    : 0

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' }}>
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <button onClick={() => nav('/')} className="p-2 rounded-xl hover:bg-white/10"><ArrowLeft size={20} className="text-gray-400"/></button>
        <span className="font-medium">情绪追踪</span>
      </div>
      
      <div className="px-5 py-6 max-w-md mx-auto">
        {/* 统计卡片 */}
        <div className="glass p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs mb-1">近7天平均情绪</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-light">{avgScore}</span>
              <span className="text-gray-500 text-sm mb-1">/10</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs mb-1">记录天数</p>
            <p className="text-2xl font-light">{history.length}<span className="text-gray-500 text-sm">天</span></p>
          </div>
        </div>

        <h2 className="text-xl font-light mb-2 text-center">今晚，你的心情是？</h2>
        <p className="text-gray-500 text-sm text-center mb-6">选择最符合你现在的情绪</p>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          {moods.map(m => (
            <button key={m.label} onClick={() => saveMood(m)}
              className={`p-4 rounded-2xl text-center transition-all ${selected?.label === m.label ? 'bg-white/20 border-2 border-purple-500' : 'bg-white/5 hover:bg-white/10'}`}>
              <div className="text-4xl mb-2">{m.emoji}</div>
              <div className="text-xs text-gray-400">{m.label}</div>
            </button>
          ))}
        </div>

        {saved && (
          <div className="text-center text-green-400 text-sm mb-4 animate-fade-in">
            ✓ 情绪已记录
          </div>
        )}

        {selected && (
          <div className="glass p-5 text-center mb-6">
            <p className="text-gray-300 text-sm mb-3">当前情绪指数</p>
            <div className="flex items-end gap-2 justify-center mb-3">
              <span className="text-4xl font-light">{selected.score}</span>
              <span className="text-gray-500 text-sm mb-1">/10</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className={`bg-gradient-to-r ${selected.color} h-2 rounded-full transition-all`} style={{ width: selected.score*10+'%' }} />
            </div>
          </div>
        )}

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="glass p-4">
            <div className="flex items-center gap-2 mb-3 text-gray-400 text-sm">
              <Calendar size={14} />
              <span>最近记录</span>
            </div>
            <div className="space-y-2">
              {history.map(h => (
                <div key={h.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{h.emoji}</span>
                    <span className="text-sm text-gray-300">{h.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{h.date}</div>
                    <div className="text-xs text-purple-400">{h.score}分</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => nav('/chat')} className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-3 rounded-xl">
          和心语聊聊 🎈
        </button>
      </div>
    </div>
  )
}
