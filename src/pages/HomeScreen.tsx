import { useRef } from 'react'
import { Gamepad2, Bomb, Sparkle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { get, ref, set } from 'firebase/database'
import { database } from '../firebase'
import { usePlayer } from '../context/PlayerContext'

const roomId = 'roomId_123'

const initialPlayer = {
  health: 3,
  position: {
    x: 0,
    y: 0,
  },
  emoji: null,
}

const HomeScreen = () => {
  const nameInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { setPlayerName, setCurrentPlayer, setIcon, setRoomId } = usePlayer()

  const handleStart = async () => {
    let playerName = nameInputRef.current?.value.trim()

    const roomRef = ref(database, `gameRooms/${roomId}`)
    const snapshot = await get(roomRef)
    setRoomId(roomId)

    if (snapshot.exists()) {
      // The room exists; check if player1 is already set
      const data = snapshot.val()
      if (data.players && data.players.player1) {
        if (!playerName) {
          playerName = 'Jujube'
        }
        // Player1 exists, so add player2
        await set(ref(database, `gameRooms/${roomId}/players/player2`), {
          name: playerName && playerName?.length > 0 ? playerName : 'Jujube',
          icon: 'Squirrel',
          ...initialPlayer,
        })
        setCurrentPlayer('player2')
        setIcon('Squirrel')
      } else {
        if (!playerName) {
          playerName = 'Bubettino'
        }
        // No player1 exists; add the new player as player1
        await set(ref(database, `gameRooms/${roomId}/players/player1`), {
          name: playerName && playerName?.length > 0 ? playerName : 'Bubettino',
          icon: 'Cat',
          ...initialPlayer,
        })
        setCurrentPlayer('player1')
      }
    } else {
      if (!playerName) {
        playerName = 'Jujube'
      }
      // The room doesn't exist; create a new room with the player as player1
      await set(roomRef, {
        status: 'waiting',
        players: {
          player1: {
            name: playerName,
            icon: 'Cat',
            ...initialPlayer,
          },
        },
      })
      setCurrentPlayer('player1')
    }
    setPlayerName(playerName)

    // Navigate to the waiting room
    navigate('/waiting')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              bottom: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              right: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          >
            <Sparkle className="text-white/10 w-8 h-8" />
          </div>
        ))}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          >
            <Bomb className="text-white/10 w-8 h-8" />
          </div>
        ))}
      </div>

      <div className="relative z-10 text-center">
        <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mb-8 animate-pulse">
          BOMB MASTERS
        </h1>
        <div className="flex items-center justify-center mb-8">
          <Gamepad2 className="w-12 h-12 text-pink-500 animate-bounce" />
        </div>

        {/* Name Input Field */}
        <div className="mb-8">
          <div className="relative group w-64 mx-auto">
            <input
              type="text"
              ref={nameInputRef}
              placeholder="Enter your name"
              className="w-64 px-6 py-4 text-lg bg-white/10 backdrop-blur-xl border-2 border-transparent 
                rounded-xl text-white placeholder-white/50 outline-none transition-all duration-300
                focus:border-pink-500 focus:bg-white/20 focus:shadow-[0_0_20px_rgba(219,39,119,0.3)]"
            />
            <div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 opacity-0 
              group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
            />
          </div>
        </div>

        {/* Start Button */}
        <button
          className="px-16 py-6 text-2xl font-bold text-white rounded-full transition-all duration-300
            bg-gradient-to-r from-pink-600 to-purple-600 transform hover:scale-105 shadow-[0_0_20px_rgba(219,39,119,0.5)] hover:shadow-[0_0_30px_rgba(219,39,119,0.8)]"
          onClick={handleStart}
        >
          START GAME
        </button>

        <div className="mt-4 text-white/50 text-sm">
          Enter your name to start
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
