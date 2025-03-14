import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import {
  onValue,
  push,
  ref,
  runTransaction,
  set,
  update,
} from 'firebase/database'
import { database } from '../firebase'
import { usePlayer } from '../context/PlayerContext'
import { useNavigate } from 'react-router-dom'
import FloatingEmoji from '../components/Game/FloatingEmoji'
import EmojiPanel from '../components/Game/EmojiPanel'
import GameBoard from '../components/Game/GameBoard'
import GameInfo from '../components/Game/GameInfo'

// Emoji reactions
const emojis = ['😄', '😮', '😱', '🤪', '😎', '🤯', '❤️']
const THRESHOLD = 100 * 1000

const GameScreen = () => {
  const [roomState, setRoomState] = useState<any>(null)
  const { currentPlayer, playerName, roomId } = usePlayer()

  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don’t interfere if we have no room or no current player
      if (!roomId || !currentPlayer) return

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.keyCode == 32) {
        e.preventDefault() // Prevent scrolling
      }

      // Check if the space bar (bomb planting) was pressed
      if (e.keyCode === 32) {
        // Bomb planting logic here; you can replace currentX/Y with your actual position values.
        handlePlantBomb()
        return // Exit early to avoid executing movement logic
      }

      let newDirection: 'up' | 'down' | 'left' | 'right' | null = null
      let deltaX = 0
      let deltaY = 0

      switch (e.key) {
        case 'ArrowUp':
          newDirection = 'up'
          deltaY = -1
          break
        case 'ArrowDown':
          newDirection = 'down'
          deltaY = 1
          break
        case 'ArrowLeft':
          newDirection = 'left'
          deltaX = -1
          break
        case 'ArrowRight':
          newDirection = 'right'
          deltaX = 1
          break
        default:
          return // ignore other keys
      }

      // If we got a direction, update the DB
      if (newDirection) {
        // Retrieve the current player’s position from roomState if available
        const playerState = roomState?.players?.[currentPlayer]
        if (!playerState?.position) return

        const oldX = playerState.position.x
        const oldY = playerState.position.y

        // Compute new position
        const newX = oldX + deltaX
        const newY = oldY + deltaY

        // (Optional) Check if new position is valid or blocked by a wall
        const board = roomState?.board
        if (board) {
          const cell = board[newY]?.[newX]
          // If the cell is a wall or out of bounds, do nothing
          if (!cell || cell.type === 'wall' || cell.type === 'obstacle') {
            return
          }
        }

        // Update the player’s direction and position in Firebase
        const playerRef = ref(
          database,
          `gameRooms/${roomId}/players/${currentPlayer}`
        )
        update(playerRef, {
          direction: newDirection,
          position: { x: newX, y: newY },
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [roomId, currentPlayer, roomState])

  const handlePlantBomb = () => {
    const currentPosition =
      currentPlayer === 'player1'
        ? roomState.players?.player1?.position
        : roomState.players?.player2?.position
    const bomb = {
      x: currentPosition.x,
      y: currentPosition.y,
      plantedAt: Date.now(),
      plantedBy: currentPlayer,
    }

    const bombsRef = ref(database, `gameRooms/${roomId}/bombs`)

    runTransaction(bombsRef, (currentBombs) => {
      const now = Date.now()
      // Ensure currentBombs is an array; if not, initialize it as empty
      const bombsArray = Array.isArray(currentBombs) ? currentBombs : []

      // Count active bombs for the current player (bombs planted within the last 3 seconds)
      const playerActiveBombCount = bombsArray.filter(
        (b) => b.plantedBy === currentPlayer && now - b.plantedAt < 3000
      ).length

      // If the current player has 5 or more active bombs, do not add a new bomb
      if (playerActiveBombCount >= 3) {
        return bombsArray
      }

      // Add the new bomb without removing expired bombs
      return [...bombsArray, bomb]
    })
  }

  const applyBombExplosions = (room: any) => {
    // Use the room parameter from Firebase instead of roomState
    if (!room || !room.board || !room.bombs || !room.players) {
      return room // Nothing to do if the room data is missing
    }
    const now = Date.now()
    const bombsArray = Array.isArray(room.bombs) ? room.bombs : []

    // We'll track indices of bombs that are done exploding (bombAge >= 4000)
    const bombsToRemove = []

    bombsArray.forEach((bomb, index) => {
      const bombAge = now - bomb.plantedAt

      // If bomb is currently exploding (3-4 seconds after planting)
      if (bombAge >= 3000 && bombAge < 4000) {
        // The bomb affects its own cell and adjacent cells (up, down, left, right)
        explodeCell(room, bomb.x, bomb.y)
        explodeCell(room, bomb.x, bomb.y - 1)
        explodeCell(room, bomb.x, bomb.y + 1)
        explodeCell(room, bomb.x - 1, bomb.y)
        explodeCell(room, bomb.x + 1, bomb.y)
      }

      // If bomb is older than 4 seconds, mark it to remove
      if (bombAge >= 4000) {
        bombsToRemove.push(index)
      }
    })

    // Remove bombs that finished exploding
    bombsToRemove
      .sort((a, b) => b - a)
      .forEach((idx) => {
        bombsArray.splice(idx, 1)
      })

    // Store back updated bombs array
    room.bombs = bombsArray

    return room
  }

  const explodeCell = (room: any, x: number, y: number) => {
    // Ensure x, y are in range
    if (y < 0 || y >= room.board.length || x < 0 || x >= room.board[0].length) {
      return
    }

    const cell = room.board[y][x]
    // If it's a wall, no effect
    if (cell.type === 'wall') {
      return
    }

    // If it's an obstacle, destroy it (turn into an empty cell)
    if (cell.type === 'obstacle') {
      cell.type = 'empty'
    }

    // Damage players if they're in this cell
    const p1 = room.players.player1
    const p2 = room.players.player2

    if (p1 && p1.position && p1.position.x === x && p1.position.y === y) {
      if (p1.health > 0) {
        p1.health = p1.health - 1
        console.log(`Player1 hit at (${x}, ${y}). New health: ${p1.health}`)
      }
    }
    if (p2 && p2.position && p2.position.x === x && p2.position.y === y) {
      if (p2.health > 0) {
        p2.health = p2.health - 1
        console.log(`Player2 hit at (${x}, ${y}). New health: ${p2.health}`)
      }
    }
  }

  useEffect(() => {
    if (!roomId) return

    const interval = setInterval(() => {
      const roomRef = ref(database, `gameRooms/${roomId}`)
      runTransaction(roomRef, (room) => {
        if (!room) return room // If room is null, nothing to do.
        const updatedRoom = applyBombExplosions(room)
        return updatedRoom
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [roomId])

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
      if (data.board) {
        setRoomState(data)
      }
      if (data.status === 'waiting') navigate('/waiting')
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
  }, [roomId])

  console.log(roomState, roomState?.players?.player1)

  return (
    <div className="h-dvh sm:h-auto sm:min-h-full bg-slate-900 flex flex-col p-4 sm:p-8">
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
      <GameInfo
        currentPlayer={currentPlayer}
        player1={roomState?.players?.player1}
        player2={roomState?.players?.player2}
      />

      {/* Game Board with Emoji Reactions - Responsive layout */}
      <div className="flex-1 flex justify-center items-center gap-4">
        <div
          className="order-1 sm:order-2 flex items-center justify-center w-full overflow-hidden  "
          // Limit the containing box so it never exceeds 70% of the viewport height
          style={{ maxHeight: '70vh' }}
        >
          {/* Inner wrapper that maintains a perfect square. */}
          <div
            style={{
              width: 'min(70vh, 100%)',
              height: 'min(70vh, 100%)',
              aspectRatio: '1 / 1',
            }}
          >
            {roomState?.board &&
            roomState?.players?.player1 &&
            roomState?.players?.player2 ? (
              <GameBoard
                board={roomState.board}
                player1={roomState?.players?.player1}
                player2={roomState?.players?.player2}
                bombs={roomState.bombs}
              />
            ) : roomState === null ? (
              <button onClick={() => navigate('/')} className="text-gray-100">
                Restart game
              </button>
            ) : (
              <p className="text-white">Loading board...</p>
            )}
          </div>
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
