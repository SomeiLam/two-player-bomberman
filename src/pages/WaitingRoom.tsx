import { useEffect, useState } from 'react'
import { Loader, ArrowLeft, BombIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PlayerCard from '../components/WaitingRoom/PlayerCard'
import { usePlayer } from '../context/PlayerContext'
import IconPicker from '../components/WaitingRoom/IconPicker'
import ExplosionTransition from '../components/WaitingRoom/ExplosionTransition'
import { useWaitingRoom } from '../hooks/useWaitingRoom'
import { cleanupPlayerWithGrace } from '../utils/gameRoom'

const WaitingRoom = () => {
  const roomId = 'room_1'
  const { currentPlayer, playerName } = usePlayer()
  const { roomState, cleanupPlayer, startGame, timeLeft, extendTimer } =
    useWaitingRoom(roomId, currentPlayer)
  const navigate = useNavigate()
  const [explosionActive, setExplosionActive] = useState(false)
  const [exiting, setExiting] = useState(false)

  // Format time (mm:ss)
  const formatTime = (seconds: number) => {
    const secs = Math.floor(seconds)
    const minutes = Math.floor(secs / 60)
    const remainder = secs % 60
    return `${minutes}:${remainder < 10 ? '0' : ''}${remainder}`
  }

  // When timer reaches 0, show 0 for one tick then display "Exiting..." for 3 seconds
  useEffect(() => {
    if (timeLeft === 0 && !exiting) {
      // Trigger the exiting state after showing 0 for one tick.
      setExiting(true)
      setTimeout(() => {
        navigate('/')
      }, 1000)
    }
  }, [timeLeft, exiting, navigate])

  const handleExit = async () => {
    await cleanupPlayerWithGrace(roomId, currentPlayer)
    navigate('/')
  }

  const handleStartGame = async () => {
    await startGame()
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
    if (!playerName) navigate('/')
    // Cleanup on page unload (closing tab or browser)
    const handleBeforeUnload = async () => {
      await cleanupPlayerWithGrace(roomId, currentPlayer)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [playerName, currentPlayer, navigate, cleanupPlayer])

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

        <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-2">
          Waiting Room
        </h2>

        {/* Display countdown timer */}
        <div className="text-2xl sm:text-4xl font-bold text-center text-white mb-8">
          {formatTime(timeLeft)}
        </div>

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
              icon={roomState?.players?.player1?.icon ?? 'Cat'}
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
              icon={roomState?.players?.player2?.icon ?? 'Squirrel'}
              youBadge={currentPlayer === 'player2' ? true : false}
            />
          </div>
        ) : (
          <div className="flex justify-around items-center gap-8">
            <div className="flex flex-col items-center gap-4">
              <Loader className="w-12 h-12 text-purple-400 animate-spin" />
              <p className="text-purple-300 text-lg">
                {exiting ? 'Going back...' : 'Loading room data...'}
              </p>
            </div>
          </div>
        )}
        <div className="mt-5">
          <IconPicker extendTimer={extendTimer} />
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
