import { useEffect, useState } from 'react'
import { Heart, BrickWall, ArrowLeft } from 'lucide-react'
import { onValue, ref, remove, update } from 'firebase/database'
import { database } from '../firebase'
import { usePlayer } from '../context/PlayerContext'
import { useNavigate } from 'react-router-dom'
import FloatingEmoji from '../components/Game/FloatingEmoji'
import EmojiPanel from '../components/Game/EmojiPanel'
import { getIconComponent } from '../components/getIconComponent'

// Emoji reactions
const emojis = ['😄', '😮', '😱', '🤪', '😎', '🤯', '❤️']
const THRESHOLD = 100 * 1000

const GameScreen = () => {
  const [roomState, setRoomState] = useState<any>(null)
  const { currentPlayer, roomId } = usePlayer()

  const navigate = useNavigate()

  const handleExit = async () => {
    await cleanupPlayer()
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

  // Function to remove the current player's data from Firebase.
  const cleanupPlayer = async () => {
    await remove(ref(database, `gameRooms/${roomId}/players/${currentPlayer}`))
    // Optionally, remove the entire room if no players remain.
  }

  useEffect(() => {
    const roomRef = ref(database, `gameRooms/${roomId}`)
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      setRoomState(data)
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
  console.log(roomState)

  const IconComponent1 = getIconComponent(
    roomState?.players?.player1?.icon || 'Cat'
  )
  const IconComponent2 = getIconComponent(
    roomState?.players?.player2?.icon || 'Squirrel'
  )

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-4 sm:p-8">
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
        <div className="flex items-center justify-between gap-2 bg-white/10 rounded-xl py-4 px-2 sm:p-4">
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
        </div>
        {/* Timer */}
        <div className="text-2xl sm:text-4xl font-bold text-white">2:30</div>

        {/* Player 2 Stats */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 bg-white/10 rounded-xl py-4 px-2 sm:p-4">
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
        </div>
      </div>

      {/* Game Board with Emoji Reactions - Responsive layout */}
      <div className="flex-1 flex justify-center items-center gap-4">
        {/* Game Board - Responsive scaling */}
        {/* <div
          className="order-1 sm:order-2 flex-1 flex items-center justify-center 
          min-w-[280px] w-full max-w-[600px] aspect-square md:max-w-[1000px]"
        >
          <div className="w-full h-full grid grid-cols-11 gap-1 bg-emerald-900/20 p-2 sm:p-4 rounded-2xl">
            {grid.map((row, i) =>
              row.map((_, j) => {
                const isWall =
                  i === 0 ||
                  i === 10 ||
                  j === 0 ||
                  j === 10 ||
                  (i % 2 === 0 && j % 2 === 0)
                const isObstacle = !isWall && Math.random() < 0.3

                return (
                  <div
                    key={`${i}-${j}`}
                    className={`aspect-square rounded-md flex items-center justify-center
                      ${
                        isWall
                          ? 'bg-slate-700'
                          : isObstacle
                            ? 'bg-amber-900/50'
                            : 'bg-emerald-800/20'
                      }`}
                  >
                    {isWall ? (
                      <BrickWall className="w-full h-full text-slate-600" />
                    ) : Math.random() < 0.1 && !isWall && !isObstacle ? (
                      <Bomb className="w-full h-full p-1 text-white/50" />
                    ) : null}
                  </div>
                )
              })
            )}
          </div>
        </div> */}
        <div
          className="order-1 sm:order-2 flex-1 flex items-center justify-center 
      min-w-[280px] w-full max-w-[600px] aspect-square md:max-w-[1000px]"
        >
          {roomState?.board ? (
            <div className="w-full h-full grid grid-cols-11 gap-1 bg-emerald-900/20 p-2 sm:p-4 rounded-2xl">
              {roomState.board.map((row: any, i: number) =>
                row.map((cell: any, j: number) => {
                  // Determine what to render based on cell.type
                  const cellContent =
                    cell.type === 'wall' ? (
                      <BrickWall className="w-full h-full scale-125 text-slate-600" />
                    ) : cell.type === 'obstacle' ? (
                      // You can render an obstacle icon, e.g., a Bomb icon, or just a colored div
                      <BrickWall className="w-full h-full bg-amber-900/50 rounded-lg text-amber-800/20" />
                    ) : (
                      <div className="w-full h-full bg-emerald-800/20" />
                    )

                  return (
                    <div
                      key={`${i}-${j}`}
                      className="aspect-square rounded-md flex items-center justify-center"
                    >
                      {cellContent}
                    </div>
                  )
                })
              )}
            </div>
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
