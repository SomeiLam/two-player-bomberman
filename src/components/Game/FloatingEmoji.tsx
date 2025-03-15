const FloatingEmoji = ({
  player1Emoji,
  player2Emoji,
}: {
  player1Emoji?: { value: number; timestamp: number }
  player2Emoji?: { value: number; timestamp: number }
}) => {
  const emojis = ['😄', '😮', '😱', '🤪', '😎', '🤯', '❤️']

  return (
    <div className="fixed inset-0 pointer-events-none">
      {player1Emoji !== undefined && (
        <>
          {[...Array(3)].map((_, i) => (
            <div
              key={`p1-${player1Emoji.timestamp}-${i}`}
              className="absolute animate-float-emoji"
              style={{
                left: `${Math.random() * 10}%`,
                bottom: '-50px',
                animationDelay: `${i * 0.5}s`,
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              }}
            >
              {emojis[player1Emoji.value - 1]}
            </div>
          ))}
        </>
      )}

      {player2Emoji !== undefined && (
        <>
          {[...Array(3)].map((_, i) => (
            <div
              key={`p2-${player2Emoji.timestamp}-${i}`}
              className="absolute animate-float-emoji"
              style={{
                right: `${Math.random() * 10}%`,
                bottom: '-50px',
                animationDelay: `${i * 0.5}s`,
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              }}
            >
              {emojis[player2Emoji.value - 1]}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default FloatingEmoji
