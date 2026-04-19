import React from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Chat from './pages/Chat'
import Mood from './pages/Mood'
import Meditate from './pages/Meditate'
import Diary from './pages/Diary'
import Home from './pages/Home'
import Subscription from './pages/Subscription'
import { Heart, MessageCircle, BookOpen, Music, BarChart3, Crown } from 'lucide-react'

function NavBar() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const items = [
    { path: '/', icon: Heart, label: '首页' },
    { path: '/chat', icon: MessageCircle, label: '陪伴' },
    { path: '/mood', icon: BarChart3, label: '情绪' },
    { path: '/meditate', icon: Music, label: '冥想' },
    { path: '/diary', icon: BookOpen, label: '日记' },
    { path: '/subscribe', icon: Crown, label: '会员' },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#1a1a2e]/90 border-t border-white/10">
      <div className="flex justify-around items-center max-w-md mx-auto py-2">
        {items.map(({ path, icon: Icon, label }) => (
          <button key={path} onClick={() => nav(path)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all min-w-[48px] ${
              pathname === path ? 'text-purple-400' : 'text-gray-600 hover:text-gray-400'
            }`}>
            <Icon size={21} />
            <span className="text-[10px] mt-0.5">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="pb-[68px] min-h-screen" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/meditate" element={<Meditate />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/subscribe" element={<Subscription />} />
        </Routes>
        <NavBar />
      </div>
    </BrowserRouter>
  )
}
