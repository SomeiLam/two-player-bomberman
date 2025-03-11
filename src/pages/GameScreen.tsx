import { useEffect, useState } from 'react'
import { Heart, BrickWall, ArrowLeft } from 'lucide-react'
import { get, onValue, ref, remove, update } from 'firebase/database'
import { database } from '../firebase'
import { usePlayer } from '../context/PlayerContext'
import { useNavigate } from 'react-router-dom'
import FloatingEmoji from '../components/Game/FloatingEmoji'
import EmojiPanel from '../components/Game/EmojiPanel'
import { getIconComponent } from '../components/getIconComponent'
import GameBoard from '../components/Game/GameBoard'

// Emoji reactions
const emojis = ['😄', '😮', '😱', '🤪', '😎', '🤯', '❤️']
const THRESHOLD = 100 * 1000

const GameScreen = () => {
  const [roomState, setRoomState] = useState<any>(null)
  const { currentPlayer, roomId } = usePlayer()

  const navigate = useNavigate()

  const handleExit = async () => {
    if (roomState?.status === 'in-progress') {
      await cleanupPlayer()
    }
    navigate('/')
  }

  // Handle sending an emoji
  const handleSendEmoji = (emoji: number) => {
    if (roomId && currentPlayer) {
      const playerRef = ref(
        database,
        `gameRooms/${roomId}/players/${currentPlayer}`
      )
      update(playerRef, {
        emoji: { value: emoji, timestamp: Date.now() },
      })
        .then(() => console.log('Emoji updated in Firebase'))
        .catch((error) => console.error('Error updating emoji:', error))
    }
  }

  const cleanupPlayer = async () => {
    const roomRef = ref(database, `gameRooms/${roomId}`)
    await update(roomRef, {
      status: 'waiting',
      [`players/${currentPlayer}`]: null, // Setting the player node to null removes it.
    })
  }

  useEffect(() => {
    const roomRef = ref(database, `gameRooms/${roomId}`)
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      setRoomState(data)
      if (data.status === 'waiting') navigate('/waiting')
    })

    // Attach a listener for page unload (closing the tab or browser)
    const handleBeforeUnload = async () => {
      await cleanupPlayer()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    // Cleanup subscription on unmount
    return () => {
      unsubscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [roomId])

  console.log(roomState, roomState?.players?.player1)

  const IconComponent1 = getIconComponent(
    roomState?.players?.player1?.icon || 'Cat'
  )
  const IconComponent2 = getIconComponent(
    roomState?.players?.player2?.icon || 'Squirrel'
  )

  return (
    <div className="min-h-svh bg-slate-900 flex flex-col p-4 sm:p-8">
      {/* Exit Button */}
      <button
        className="absolute left-4 top-4 text-white/70 hover:text-white flex items-center 
        gap-2 transition-colors duration-300 group z-10"
        onClick={handleExit}
      >
        <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="hidden sm:inline">Exit Game</span>
      </button>

      {/* Game Header - Responsive layout */}
      <div className="flex flex-row justify-between items-center gap-4 sm:gap-8 my-6 sm:my-8">
        {/* Player 1 Stats */}
        <div className="relative flex items-center justify-between gap-2 bg-white/10 rounded-xl py-4 px-2 sm:p-4">
          <IconComponent1 className="w-10 h-10 p-2 sm:w-12 sm:h-12 rounded-full bg-pink-500/50" />

          <div>
            <p className="text-white font-bold text-center text-xs sm:text-xl truncate">
              {roomState?.players?.player1?.name || 'Player 1'}
            </p>
            <div className="flex gap-1">
              {[...Array(roomState?.players?.player1?.health || 3)].map(
                (_, i) => (
                  <Heart
                    key={i}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500"
                  />
                )
              )}
            </div>
          </div>
          {currentPlayer === 'player1' && (
            <div
              className="absolute -bottom-3 sm:-bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r 
      from-pink-500 to-purple-500 px-4 py-1 rounded-full text-white text-xs sm:text-sm font-semibold
      shadow-[0_0_10px_rgba(219,39,119,0.3)]"
            >
              You
            </div>
          )}
        </div>
        {/* Timer */}
        <div className="text-2xl sm:text-4xl font-bold text-white">2:30</div>

        {/* Player 2 Stats */}
        <div className="relative flex items-center justify-between gap-2 sm:gap-4 bg-white/10 rounded-xl py-4 px-2 sm:p-4">
          <div>
            <p className="text-white font-bold text-center text-xs sm:text-xl truncate">
              {roomState?.players?.player2?.name || 'Player 2'}
            </p>
            <div className="flex gap-1">
              {[...Array(roomState?.players?.player2?.health || 3)].map(
                (_, i) => (
                  <Heart
                    key={i}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500"
                  />
                )
              )}
            </div>
          </div>
          <IconComponent2 className="w-10 h-10 p-2 sm:w-12 sm:h-12 rounded-full bg-blue-500/50" />
          {currentPlayer === 'player2' && (
            <div
              className="absolute -bottom-3 sm:-bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r 
      from-blue-500 to-purple-500 px-4 py-1 rounded-full text-white text-xs sm:text-sm font-semibold
      shadow-[0_0_10px_rgba(219,39,119,0.3)]"
            >
              You
            </div>
          )}
        </div>
      </div>

      {/* Game Board with Emoji Reactions - Responsive layout */}
      <div className="flex-1 flex justify-center items-center gap-4">
        <div
          className="order-1 sm:order-2 flex-1 flex items-center justify-center 
      min-w-[280px] w-full max-w-[600px] aspect-square md:max-w-[1000px]"
        >
          {roomState?.board &&
          roomState?.players?.player1 &&
          roomState?.players?.player2 ? (
            <GameBoard
              board={roomState.board}
              player1Position={roomState?.players?.player1?.position}
              player2Position={roomState?.players?.player2?.position}
              player1Icon={roomState?.players?.player1?.icon}
              player2Icon={roomState?.players?.player2?.icon}
              bombs={roomState.bombs}
            />
          ) : roomState?.status === 'waiting' ? (
            <button onClick={() => navigate('/waiting')}>Go back</button>
          ) : (
            <p className="text-white">Loading board...</p>
          )}
        </div>
      </div>

      {/* Use the separate EmojiPanel component */}
      <EmojiPanel emojis={emojis} onEmojiSend={handleSendEmoji} />

      {/* Floating Emoji Animation Container for Player 1 */}
      {roomState?.players?.player1?.emoji &&
        Date.now() - roomState.players.player1.emoji.timestamp < THRESHOLD && (
          <FloatingEmoji player1Emoji={roomState.players.player1.emoji} />
        )}

      {/* Floating Emoji Animation Container for Player 2 */}
      {roomState?.players?.player2?.emoji &&
        Date.now() - roomState.players.player2.emoji.timestamp < THRESHOLD && (
          <FloatingEmoji player2Emoji={roomState.players.player2.emoji} />
        )}
    </div>
  )
}

export default GameScreen
