// src/hooks/useBombExplosions.ts
import { useEffect } from 'react'
import { ref, runTransaction, get } from 'firebase/database'
import { database } from '../firebase'
import { Room } from '../type'

const removalDelay = 1000 // 1 second removal delay

// Updated helper that uses a fixed timestamp.
const applyBombExplosionsWithNow = (room: Room, now: number): Room => {
  if (!room || !room.board || !room.bombs || !room.players) return room

  const bombsArray = Array.isArray(room.bombs) ? room.bombs : []
  let changed = false

  // Mark bombs as exploded using the fixed "now"
  const newBombs = bombsArray.map((bomb) => {
    if (!bomb.exploded && now >= bomb.explosionTime) {
      changed = true
      return { ...bomb, exploded: true }
    }
    return bomb
  })

  // Filter out bombs that have been exploded long enough to be removed.
  const bombsAfterRemoval = newBombs.filter((bomb) => {
    if (bomb.exploded && now >= bomb.explosionTime + removalDelay) {
      changed = true
      return false
    }
    return true
  })

  if (!changed) {
    return room
  }

  // Create a new room object with updated bombs.
  const newRoom: Room = { ...room, bombs: bombsAfterRemoval }

  let boardCloned = false

  // Process explosion effects on board and players for bombs that are removed.
  newBombs.forEach((bomb) => {
    if (bomb.exploded && now >= bomb.explosionTime + removalDelay) {
      const explosionCoordinates = [
        [bomb.x, bomb.y],
        [bomb.x, bomb.y - 1],
        [bomb.x, bomb.y + 1],
        [bomb.x - 1, bomb.y],
        [bomb.x + 1, bomb.y],
      ]

      // Clone the board if we haven't already.
      if (!boardCloned) {
        newRoom.board = room?.board?.map((row) =>
          row.map((cell) => ({ ...cell }))
        )
        boardCloned = true
      }

      explosionCoordinates.forEach(([x, y]) => {
        // Skip if out of bounds.
        if (
          y < 0 ||
          !newRoom.board ||
          y >= newRoom.board.length ||
          x < 0 ||
          x >= newRoom.board[0].length
        )
          return

        // Remove obstacles.
        const cell = newRoom.board[y][x]
        if (cell.type === 'obstacle') {
          cell.type = 'empty'
        }

        // Damage players if they're in the explosion radius.
        const p1 = newRoom?.players?.player1
        const p2 = newRoom?.players?.player2
        if (p1 && p1.position.x === x && p1.position.y === y && p1.health > 0) {
          p1.health -= 1
          changed = true
        }
        if (p2 && p2.position.x === x && p2.position.y === y && p2.health > 0) {
          p2.health -= 1
          changed = true
        }
      })
    }
  })

  // End game if any player's health drops to zero.
  if (
    (newRoom?.players?.player1 && newRoom.players.player1.health <= 0) ||
    (newRoom?.players?.player2 && newRoom.players.player2.health <= 0)
  ) {
    newRoom.status = 'ended'
  }

  return newRoom
}

interface UseBombExplosionsParams {
  roomId: string
  enabled?: boolean
  isHost: boolean
}

const useBombExplosions = ({
  roomId,
  enabled = true,
  isHost,
}: UseBombExplosionsParams) => {
  useEffect(() => {
    // Only allow the host (player1) to run bomb explosions.
    if (!roomId || !enabled || !isHost) return

    const roomRef = ref(database, `gameRooms/${roomId}`)
    const interval = setInterval(async () => {
      try {
        const snapshot = await get(roomRef)
        const room = snapshot.val()
        // Only run transaction if at least one bomb is ready to explode.
        if (
          !room?.bombs?.some(
            (bomb: { explosionTime: number }) =>
              Date.now() >= bomb.explosionTime
          )
        ) {
          return
        }

        // Capture a fixed timestamp to be used in all transaction attempts.
        const capturedNow = Date.now()
        let transactionAttempts = 0
        await runTransaction(roomRef, (currentRoom) => {
          transactionAttempts++
          console.log(
            `[Attempt ${transactionAttempts}] Current bombs:`,
            JSON.stringify(currentRoom.bombs)
          )
          const updatedRoom = applyBombExplosionsWithNow(
            currentRoom,
            capturedNow
          )
          console.log(
            `[Attempt ${transactionAttempts}] Updated bombs:`,
            JSON.stringify(updatedRoom.bombs)
          )
          return updatedRoom
        })
          .then((result) => {
            console.log('Transaction committed:', result.committed)
            console.log(
              'Final room state:',
              JSON.stringify(result.snapshot.val(), null, 2)
            )
          })
          .catch((error) => {
            console.error('Error during bomb explosion transaction:', error)
          })
      } catch (error) {
        console.error('Error during bomb explosion transaction:', error)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [roomId, enabled, isHost])
}

export default useBombExplosions
