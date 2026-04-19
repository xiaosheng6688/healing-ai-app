import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Plus } from 'lucide-react'

export default function Diary() {
  const nav = useNavigate()
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('diary_entries') || '[]') } catch { return [] }
  })
  const [newEntry, setNewEntry] = useState('')
  const [show, setShow] = useState(false)

  const save = (text) => {
    if (!text.trim()) return
    const entry = { id: Date.now(), text: text.trim(), date: new Date().toLocaleString('zh-CN') }
    const updated = [entry, ...entries].slice(0, 100)
    setEntries(updated)
    localStorage.setItem('diary_entries', JSON.stringify(updated))
    setNewEntry('')
    setShow(false)
  }

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' }}>
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <button onClick={() => nav('/')} className="p-2 rounded-xl hover:bg-white/10"><ArrowLeft size={20} className="text-gray-400"/></button>
        <span className="font-medium">情绪日记</span>
        <button onClick={() => setShow(true)} className="ml-auto p-2 bg-purple-600/30 rounded-xl"><Plus size={18}/></button>
      </div>
      <div className="px-5 py-6 max-w-md mx-auto space-y-4">
        {entries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-3 opacity-30"/>
            <p>还没有日记</p>
            <p className="text-xs mt-1">点击右上角 + 写点什么吧</p>
          </div>
        )}
        {entries.map(e => (
          <div key={e.id} className="glass p-4">
            <div className="text-xs text-gray-500 mb-2">{e.date}</div>
            <p className="text-gray-300 text-sm leading-relaxed">{e.text}</p>
          </div>
        ))}
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShow(false)}/>
          <div className="relative w-full bg-[#1a1a2e] rounded-t-3xl p-5 border-t border-white/10">
            <h3 className="text-white font-medium mb-3">写日记</h3>
            <textarea value={newEntry} onChange={e => setNewEntry(e.target.value)} rows={5}
              placeholder="今晚，我的心情是..."
              className="w-full bg-white/10 border border-white/15 rounded-xl p-3 text-white placeholder-gray-600 text-sm resize-none focus:outline-none"/>
            <div className="flex gap-3 mt-3">
              <button onClick={() => setShow(false)} className="flex-1 py-3 rounded-xl bg-white/10 text-gray-400">取消</button>
              <button onClick={() => save(newEntry)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
