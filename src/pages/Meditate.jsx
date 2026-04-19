import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Pause, Volume2 } from 'lucide-react'

// Web Audio API 白噪音生成器
class SoundGenerator {
  constructor() {
    this.ctx = null
    this.gainNode = null
    this.sources = []
    this.isPlaying = false
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    }
  }

  // 雨声：粉红噪音 + 滤波
  createRain() {
    this.init()
    const bufferSize = 2 * this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const output = buffer.getChannelData(0)
    
    // 粉红噪音算法
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true

    // 低通滤波模拟雨声
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 800

    this.gainNode = this.ctx.createGain()
    this.gainNode.gain.value = 0.3

    noise.connect(filter)
    filter.connect(this.gainNode)
    this.gainNode.connect(this.ctx.destination)
    
    noise.start()
    this.sources.push(noise)
  }

  // 海浪：布朗噪音 + 周期性音量变化
  createOcean() {
    this.init()
    const bufferSize = 2 * this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const output = buffer.getChannelData(0)
    
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      output[i] = (lastOut + (0.02 * white)) / 1.02
      lastOut = output[i]
      output[i] *= 3.5
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 400

    // 周期性音量变化模拟海浪
    const lfo = this.ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.1 // 10秒一个周期
    
    const lfoGain = this.ctx.createGain()
    lfoGain.gain.value = 0.2
    
    this.gainNode = this.ctx.createGain()
    this.gainNode.gain.value = 0.4

    lfo.connect(lfoGain)
    lfoGain.connect(this.gainNode.gain)
    
    noise.connect(filter)
    filter.connect(this.gainNode)
    this.gainNode.connect(this.ctx.destination)
    
    noise.start()
    lfo.start()
    this.sources.push(noise, lfo)
  }

  // 森林：多个振荡器模拟虫鸣鸟叫
  createForest() {
    this.init()
    
    // 背景风声
    const bufferSize = 2 * this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const output = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.1
    }
    const wind = this.ctx.createBufferSource()
    wind.buffer = buffer
    wind.loop = true
    
    const windFilter = this.ctx.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 300
    windFilter.Q.value = 0.5

    // 虫鸣 - 高频方波
    const cricket1 = this.ctx.createOscillator()
    cricket1.type = 'square'
    cricket1.frequency.value = 4500
    const cricket1Gain = this.ctx.createGain()
    cricket1Gain.gain.value = 0.02
    
    // 另一个虫鸣
    const cricket2 = this.ctx.createOscillator()
    cricket2.type = 'sawtooth'
    cricket2.frequency.value = 5200
    const cricket2Gain = this.ctx.createGain()
    cricket2Gain.gain.value = 0.015

    this.gainNode = this.ctx.createGain()
    this.gainNode.gain.value = 0.5

    wind.connect(windFilter)
    windFilter.connect(this.gainNode)
    cricket1.connect(cricket1Gain)
    cricket1Gain.connect(this.gainNode)
    cricket2.connect(cricket2Gain)
    cricket2Gain.connect(this.gainNode)
    this.gainNode.connect(this.ctx.destination)

    wind.start()
    cricket1.start()
    cricket2.start()
    this.sources.push(wind, cricket1, cricket2)
  }

  // 咖啡馆：人声嗡嗡 + 杯碟碰撞 + 咖啡机蒸汽
  createCafe() {
    this.init()
    
    // 1. 背景人声嗡嗡（粉红噪音低通）
    const bufferSize = 2 * this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const output = buffer.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.15
      b6 = white * 0.115926
    }
    const bg = this.ctx.createBufferSource()
    bg.buffer = buffer
    bg.loop = true
    
    const bgFilter = this.ctx.createBiquadFilter()
    bgFilter.type = 'lowpass'
    bgFilter.frequency.value = 600
    
    const bgGain = this.ctx.createGain()
    bgGain.gain.value = 0.6

    // 2. 咖啡机蒸汽声（白噪音高通）
    const steamBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const steamOut = steamBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      steamOut[i] = (Math.random() * 2 - 1) * 0.3
    }
    const steam = this.ctx.createBufferSource()
    steam.buffer = steamBuffer
    steam.loop = true
    
    const steamFilter = this.ctx.createBiquadFilter()
    steamFilter.type = 'highpass'
    steamFilter.frequency.value = 2000
    
    const steamGain = this.ctx.createGain()
    steamGain.gain.value = 0.08

    // 3. 杯碟轻响（随机高频点击）
    const clickOsc = this.ctx.createOscillator()
    clickOsc.type = 'triangle'
    clickOsc.frequency.value = 8000
    const clickGain = this.ctx.createGain()
    clickGain.gain.value = 0
    
    // LFO控制点击随机出现
    const clickLFO = this.ctx.createOscillator()
    clickLFO.type = 'sawtooth'
    clickLFO.frequency.value = 0.3
    const clickLFOGain = this.ctx.createGain()
    clickLFOGain.gain.value = 0.02
    clickLFO.connect(clickLFOGain)
    clickLFOGain.connect(clickGain.gain)

    // 主增益
    this.gainNode = this.ctx.createGain()
    this.gainNode.gain.value = 0.5

    // 连接
    bg.connect(bgFilter)
    bgFilter.connect(bgGain)
    bgGain.connect(this.gainNode)
    
    steam.connect(steamFilter)
    steamFilter.connect(steamGain)
    steamGain.connect(this.gainNode)
    
    clickOsc.connect(clickGain)
    clickGain.connect(this.gainNode)
    
    this.gainNode.connect(this.ctx.destination)

    // 启动
    bg.start()
    steam.start()
    clickOsc.start()
    clickLFO.start()
    this.sources.push(bg, steam, clickOsc, clickLFO)
  }

  play(type) {
    this.stop()
    this.isPlaying = true
    switch(type) {
      case 'rain': this.createRain(); break
      case 'ocean': this.createOcean(); break
      case 'forest': this.createForest(); break
      case 'cafe': this.createCafe(); break
    }
  }

  stop() {
    this.sources.forEach(s => {
      try { s.stop() } catch(e) {}
    })
    this.sources = []
    this.isPlaying = false
  }

  setVolume(v) {
    if (this.gainNode) {
      this.gainNode.gain.value = v
    }
  }
}

const soundGen = new SoundGenerator()

const scenes = [
  { id: 'rain', emoji: '🌧️', title: '雨夜窗边', desc: '雨滴轻敲窗台的治愈声', duration: '∞', type: 'rain' },
  { id: 'ocean', emoji: '🌊', title: '海边日落', desc: '海浪轻拍沙滩的宁静', duration: '∞', type: 'ocean' },
  { id: 'forest', emoji: '🌲', title: '森林漫步', desc: '风声虫鸣的自然交响', duration: '∞', type: 'forest' },
  { id: 'cafe', emoji: '☕', title: '温暖咖啡馆', desc: '轻柔背景氛围音', duration: '∞', type: 'cafe' },
]

export default function Meditate() {
  const nav = useNavigate()
  const [playing, setPlaying] = useState(false)
  const [active, setActive] = useState(null)
  const [volume, setVolume] = useState(0.5)
  const [time, setTime] = useState(0)
  const timerRef = useRef(null)

  const handlePlay = (scene) => {
    if (active?.id === scene.id && playing) {
      // 暂停
      soundGen.stop()
      setPlaying(false)
      clearInterval(timerRef.current)
    } else {
      // 播放新场景
      setActive(scene)
      soundGen.play(scene.type)
      setPlaying(true)
      setTime(0)
      clearInterval(timerRef.current)
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000)
    }
  }

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    soundGen.setVolume(v)
  }

  useEffect(() => {
    return () => {
      soundGen.stop()
      clearInterval(timerRef.current)
    }
  }, [])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)' }}>
      {/* 雨滴背景 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="raindrop" style={{ 
          left: `${Math.random() * 100}%`, 
          animationDuration: `${2 + Math.random() * 2}s`,
          animationDelay: `${Math.random() * 3}s`
        }} />
      ))}
      
      {/* 顶部栏 */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-4 backdrop-blur-xl bg-[#0a0a1a]/80 border-b border-white/10">
        <button onClick={() => nav('/')} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} className="text-gray-400" />
        </button>
        <span className="text-white font-medium">冥想放松</span>
        {playing && (
          <div className="ml-auto flex items-center gap-2 text-purple-400 text-sm">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            播放中 {formatTime(time)}
          </div>
        )}
      </div>

      <div className="relative z-10 px-5 py-8 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-white mb-2">让心静下来</h2>
          <p className="text-gray-500 text-sm">选择场景，聆听自然的声音</p>
        </div>

        {/* 场景选择 */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {scenes.map(s => (
            <button 
              key={s.id} 
              onClick={() => handlePlay(s)}
              className={`glass p-4 text-left transition-all ${active?.id === s.id ? 'border-purple-500/50 bg-purple-500/10' : 'hover:border-white/20'}`}
            >
              <div className="text-4xl mb-2">{s.emoji}</div>
              <div className="text-white text-sm font-medium">{s.title}</div>
              <div className="text-gray-500 text-xs mt-1">{s.desc}</div>
              <div className="flex items-center gap-1 mt-2">
                <span className={`w-2 h-2 rounded-full ${active?.id === s.id && playing ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                <span className="text-gray-600 text-xs">{active?.id === s.id && playing ? '播放中' : s.duration}</span>
              </div>
            </button>
          ))}
        </div>

        {/* 播放控制 */}
        {active && (
          <div className="glass p-6 text-center animate-fade-in">
            <div className="text-6xl mb-4">{active.emoji}</div>
            <h3 className="text-white font-medium mb-1">{active.title}</h3>
            <p className="text-gray-400 text-sm mb-6">{active.desc}</p>
            
            {/* 播放按钮 */}
            <button 
              onClick={() => handlePlay(active)}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-purple-900/40 hover:scale-105 transition-transform"
            >
              {playing ? (
                <Pause size={32} className="text-white" />
              ) : (
                <Play size={32} className="text-white ml-1" />
              )}
            </button>
            
            <p className="text-gray-500 text-sm mt-4">
              {playing ? '正在播放... 已播放 ' + formatTime(time) : '点击播放'}
            </p>

            {/* 音量控制 */}
            <div className="flex items-center gap-3 mt-6 px-4">
              <Volume2 size={16} className="text-gray-500" />
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #a855f7 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`
                }}
              />
              <span className="text-gray-400 text-xs w-8">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        )}

        {/* 提示 */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-xs">💡 建议佩戴耳机获得最佳体验</p>
          <p className="text-gray-600 text-xs mt-1">声音由AI实时生成，无需下载</p>
        </div>
      </div>

      {/* 海浪效果 */}
      <div className="wave-container">
        <div className="wave" />
      </div>
    </div>
  )
}
