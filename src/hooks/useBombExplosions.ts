// src/hooks/useBombExplosions.ts
import { useEffect } from 'react'
import { ref, runTransaction, get } from 'firebase/database'
import { database } from '../firebase'
import { Room } from '../type'

/**
 * Processes bomb explosions on the room:
 * - For bombs between 3000 and 4000ms (and not already exploded), mark them exploded.
 * - Explosions affect the bomb’s cell and adjacent cells.
 *   - If a cell is an obstacle, change it to empty.
 *   - If a player is in that cell and has health, reduce their health by one.
 * - Remove bombs older than 4000ms.
 */
const applyBombExplosions = (room: Room): Room => {
  if (!room || !room.board || !room.bombs || !room.players) return room

  const now = Date.now()
  const bombsArray = Array.isArray(room.bombs) ? room.bombs : []
  const bombsToRemove: number[] = []

  bombsArray.forEach((bomb, index) => {
    const bombAge = now - bomb.plantedAt

    // Process explosion (if bomb is exploding and hasn't been processed)
    if (bombAge >= 3000 && bombAge < 4000 && !bomb.exploded) {
      bomb.exploded = true

      // Explosion affects the bomb cell and its four adjacent cells.
      const explosionCoordinates = [
        [bomb.x, bomb.y],
        [bomb.x, bomb.y - 1],
        [bomb.x, bomb.y + 1],
        [bomb.x - 1, bomb.y],
        [bomb.x + 1, bomb.y],
      ]

      explosionCoordinates.forEach(([x, y]) => {
        // Check boundaries of the board.
        if (
          y < 0 ||
          y >= room.board.length ||
          x < 0 ||
          x >= room.board[0].length
        ) {
          return
        }
        const cell = room.board[y][x]
        // Destroy obstacles by setting them to empty.
        if (cell.type === 'obstacle') {
          cell.type = 'empty'
        }
        // Damage players in the cell.
        const p1 = room.players.player1
        const p2 = room.players.player2
        if (
          p1 &&
          p1.position &&
          p1.position.x === x &&
          p1.position.y === y &&
          p1.health > 0
        ) {
          p1.health -= 1
        }
        if (
          p2 &&
          p2.position &&
          p2.position.x === x &&
          p2.position.y === y &&
          p2.health > 0
        ) {
          p2.health -= 1
        }
      })
    }

    // Mark bombs older than 4000ms for removal.
    if (bombAge >= 4000) {
      bombsToRemove.push(index)
    }
  })

  // Remove expired bombs (starting from the highest index).
  bombsToRemove
    .sort((a, b) => b - a)
    .forEach((idx) => {
      bombsArray.splice(idx, 1)
    })

  room.bombs = bombsArray
  // End the game if any player's health is zero or below.
  if (
    (room.players.player1 && room.players.player1.health <= 0) ||
    (room.players.player2 && room.players.player2.health <= 0)
  ) {
    room.status = 'ended'
  }

  return room
}

/**
 * useBombExplosions runs a transaction on the room node every second,
 * applying explosion logic via applyBombExplosions.
 *
 * The `enabled` flag allows you to disable explosion updates (for example, when the game is over).
 */
const useBombExplosions = (roomId: string, enabled: boolean = true) => {
  useEffect(() => {
    if (!roomId || !enabled) return

    const roomRef = ref(database, `gameRooms/${roomId}`)
    const interval = setInterval(async () => {
      try {
        // Optional: First check if there are bombs at all.
        const snapshot = await get(roomRef)
        const room = snapshot.val()
        if (
          !room ||
          !room.bombs ||
          !Array.isArray(room.bombs) ||
          room.bombs.length === 0
        ) {
          return
        }

        // Run a transaction on the entire room.
        await runTransaction(roomRef, (currentRoom: any) => {
          if (!currentRoom) return currentRoom
          const updatedRoom = applyBombExplosions(currentRoom)
          return updatedRoom
        })
      } catch (error: any) {
        console.error('Error in bomb explosion transaction:', error)
      }
    }, 1000) // Run every second.

    return () => clearInterval(interval)
  }, [roomId, enabled])
}

export default useBombExplosions
