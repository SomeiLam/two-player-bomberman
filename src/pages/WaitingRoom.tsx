import { useEffect, useState } from 'react'
import { Loader, ArrowLeft, BombIcon } from 'lucide-react'
import { ref, onValue, remove, update } from 'firebase/database'
import { database } from '../firebase'
import { useNavigate } from 'react-router-dom'
import PlayerCard from '../components/WaitingRoom/PlayerCard'
import { usePlayer } from '../context/PlayerContext'
import IconPicker from '../components/WaitingRoom/IconPicker'
import { generateBoard } from '../utils/gameBoard'
import ExplosionTransition from '../components/WaitingRoom/ExplosionTransition'

const WaitingRoom = () => {
  const [roomState, setRoomState] = useState<any>(null)
  const [explosionActive, setExplosionActive] = useState(false)
  const roomId = 'roomId_123'
  const { currentPlayer, playerName } = usePlayer()
  const navigate = useNavigate()

  const handleExit = async () => {
    await cleanupPlayer()
    navigate('/')
  }

  const handleStartGame = async () => {
    const boardData = generateBoard() // Create a new 11x11 board
    if (roomId) {
      const roomRef = ref(database, `gameRooms/${roomId}`)
      await update(roomRef, {
        'players/player1/position': {
          x: boardData.player1Position.col,
          y: boardData.player1Position.row,
        },
        'players/player2/position': {
          x: boardData.player2Position.col,
          y: boardData.player2Position.row,
        },
      })
      await update(roomRef, {
        board: boardData.board,
        bombs: [],
        status: 'in-progress',
      })
    }
  }

  // Function to remove the current player's data from Firebase.
  const cleanupPlayer = async () => {
    console.log(roomState.players)
    if (Object.keys(roomState.players).length === 2) {
      await remove(
        ref(database, `gameRooms/${roomId}/players/${currentPlayer}`)
      )
    } else if (Object.keys(roomState.players).length === 1) {
      await remove(ref(database, `gameRooms/${roomId}}`))
    }

    //  remove the entire room if no players remain.
  }

  useEffect(() => {
    if (roomState?.status === 'in-progress' && !explosionActive) {
      setExplosionActive(true)
      setTimeout(() => {
        navigate('/game')
      }, 2000)
    }
  }, [navigate, roomState?.status, explosionActive])

  useEffect(() => {
    const roomRef = ref(database, `gameRooms/${roomId}`)
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      setRoomState(data)
    })

    if (!playerName) navigate('/')
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
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      {explosionActive && (
        <ExplosionTransition
          onComplete={() => {
            navigate('/game')
          }}
        />
      )}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl py-12 px-6 sm:p-12 w-full max-w-3xl relative">
        {/* Exit Button */}
        <button
          className="absolute left-4 top-4 sm:left-8 sm:top-8 text-white/70 hover:text-white flex items-center gap-2 
          transition-colors duration-300 group"
          onClick={handleExit}
        >
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
          Exit
        </button>

        <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-12">
          Waiting Room
        </h2>

        {roomState ? (
          <div className="flex justify-around items-center gap-1">
            {/* Player 1 */}
            <PlayerCard
              playerName={
                roomState?.players?.player1
                  ? roomState?.players?.player1?.name
                  : 'Player 1'
              }
              status={roomState?.players?.player1 ? 'ready' : 'waiting'}
              icon={
                roomState?.players?.player1
                  ? roomState?.players?.player1?.icon
                  : 'Cat'
              }
              youBadge={currentPlayer === 'player1' ? true : false}
            />

            {!roomState?.players?.player1 || !roomState?.players?.player2 ? (
              <div className="flex flex-col items-center gap-4">
                <Loader className="w-12 h-12 text-purple-400 animate-spin" />
                <p className="text-purple-300 text-lg hidden sm:block">
                  Waiting for opponent...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <BombIcon className="w-12 h-12 sm:w-20 sm:h-20 text-purple-300" />
                <p className="text-purple-300 text-lg sm:text-3xl">
                  Let's boom
                </p>
              </div>
            )}

            {/* Player 2 */}
            <PlayerCard
              playerName={
                roomState?.players?.player2
                  ? roomState?.players?.player2?.name
                  : 'Player 2'
              }
              status={roomState?.players?.player2 ? 'ready' : 'waiting'}
              icon={
                roomState?.players?.player2
                  ? roomState?.players?.player2?.icon
                  : 'Squirrel'
              }
              youBadge={currentPlayer === 'player2' ? true : false}
            />
          </div>
        ) : (
          <div className="flex justify-around items-center gap-8">
            <div className="flex flex-col items-center gap-4">
              <Loader className="w-12 h-12 text-purple-400 animate-spin" />
              <p className="text-purple-300 text-lg">Loading room data...</p>
            </div>
          </div>
        )}
        <div className="mt-5">
          <IconPicker />
        </div>
        <div className="flex justify-center w-full">
          {roomState?.status === 'waiting' &&
            (!roomState?.players?.player1 || !roomState?.players?.player2 ? (
              <button
                disabled
                className="sm:w-[300px] mt-5 px-3 sm:px-8 py-2 sm:py-4 sm:text-xl font-bold text-white/50 
            bg-white/10 rounded-xl cursor-not-allowed border border-white/5
            transition-all duration-300"
              >
                Waiting for Players...
              </button>
            ) : (
              <button
                onClick={handleStartGame}
                className="sm:w-[200px] mt-5 px-3 sm:px-8 py-2 sm:py-4 sm:text-xl font-bold text-white 
          bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl
          transform hover:scale-[1.02] transition-all duration-300
          shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:shadow-[0_0_30px_rgba(219,39,119,0.5)] animate-glow"
              >
                Start Game
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}

export default WaitingRoom
