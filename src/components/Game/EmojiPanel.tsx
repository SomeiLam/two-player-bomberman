import React, { useEffect, useState } from 'react'

interface EmojiPanelProps {
  emojis: string[]
  onEmojiSend: (emojiIndex: number) => void
}

const EmojiPanel: React.FC<EmojiPanelProps> = ({ emojis, onEmojiSend }) => {
  const [activeEmoji, setActiveEmoji] = useState<number | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return

      if (e.key >= '1' && e.key <= String(emojis.length)) {
        e.preventDefault()
        const emojiNumber = Number(e.key)
        onEmojiSend(emojiNumber)
        setActiveEmoji(emojiNumber)
        setTimeout(() => setActiveEmoji(null), 200)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex justify-center gap-2 sm:gap-12 w-full mt-4 sm:mt-10">
      {emojis.map((emoji, i) => (
        <div key={i} className="relative">
          <span className="hidden sm:block text-white/50 text-2xl absolute">
            {i + 1}
          </span>
          <button
            onClick={() => {
              onEmojiSend(i + 1)
              setActiveEmoji(i + 1)
              setTimeout(() => setActiveEmoji(null), 200)
            }}
            className={`w-12 h-12 sm:h-20 sm:w-20 rounded-full bg-white/10 hover:bg-white/20 
              flex items-center justify-center transition-all duration-300 
              ${activeEmoji === i + 1 ? 'scale-110 shadow-[0_0_20px_rgba(219,39,119,0.3)]' : 'hover:scale-110 hover:shadow-[0_0_20px_rgba(219,39,119,0.3)]'}`}
          >
            <span className="text-2xl sm:text-5xl">{emoji}</span>
          </button>
        </div>
      ))}
    </div>
  )
}

export default EmojiPanel
