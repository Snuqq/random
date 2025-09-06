import { useEffect, useRef, useState } from 'react'
import './App.css'

// grab all images in src/assets as URLs (Vite)
const imageModules = import.meta.glob('./assets/*.{jpg,jpeg,png,webp}', { eager: true, as: 'url' })
const images = Object.values(imageModules) // array of image URLs

function App() {
  const [flashing, setFlashing] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const audioRef = useRef(null)
  const timeoutRef = useRef(null)

  // Preload audio and images on mount
  useEffect(() => {
    // audio preload
    audioRef.current = new Audio('/vine-boom.mp3')
    audioRef.current.preload = 'auto'
    audioRef.current.volume = 1
    audioRef.current.load()
    const onCanPlay = () => {}
    audioRef.current.addEventListener('canplaythrough', onCanPlay, { once: true })

    // image preload
    images.forEach(src => {
      const img = new Image()
      img.src = src
    })

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('canplaythrough', onCanPlay)
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
      clearTimeout(timeoutRef.current)
    }
  }, []) // eslint-disable-line

  const pickNextIndex = () => {
    if (images.length === 0) return 0
    if (images.length === 1) return 0
    let idx = Math.floor(Math.random() * images.length)
    // avoid immediate repeat
    if (idx === currentIndex) {
      idx = (idx + 1) % images.length
    }
    return idx
  }

  const handleClick = () => {
    // choose image
    const next = pickNextIndex()
    setCurrentIndex(next)

    // play sound
    try {
      if (!audioRef.current) audioRef.current = new Audio('/vine-boom.mp3')
      audioRef.current.currentTime = 0
      audioRef.current.play()
    } catch (e) {}

    // flash image
    setFlashing(true)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setFlashing(false), 220)
  }

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 text-white relative">
      {/* centered wrapper so .btn hover transform won't conflict with centering */}
      <div
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10001
        }}
      >
        <button
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setHovered(false); setPressed(false) }}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onTouchStart={() => { setHovered(true); setPressed(true) }}
          onTouchEnd={() => { setHovered(false); setPressed(false) }}
          onFocus={() => setHovered(true)}
          onBlur={() => { setHovered(false); setPressed(false) }}
          aria-label="Flash image"
          className="btn"
        >
          <span style={{ fontWeight: 700, letterSpacing: 0.3 }}>Press me</span>
        </button>
      </div>

      {flashing && images[currentIndex] && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9998,
            backgroundColor: 'black'
          }}
        >
          <img
            src={images[currentIndex]}
            alt="Flash"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              objectFit: 'fill',
              display: 'block'
            }}
          />
        </div>
      )}
    </div>
  )
}

export default App