// src/hooks/useBombExplosions.ts
import { useEffect } from 'react'
import { ref, runTransaction, get } from 'firebase/database'
import { database } from '../firebase'
import { Room } from '../type'

const applyBombExplosions = (room: Room): Room => {
  if (!room || !room.board || !room.bombs || !room.players) return room

  const now = Date.now()
  const bombsArray = Array.isArray(room.bombs) ? room.bombs : []
  const bombsToRemove: number[] = []

  bombsArray.forEach((bomb, index) => {
    const bombAge = now - bomb.plantedAt

    // Process explosion if bomb is in its explosion window and hasn't been processed.
    if (bombAge >= 3000 && bombAge < 4000 && !bomb.exploded) {
      bomb.exploded = true

      // Define explosion area (bomb cell + adjacent cells)
      const explosionCoordinates = [
        [bomb.x, bomb.y],
        [bomb.x, bomb.y - 1],
        [bomb.x, bomb.y + 1],
        [bomb.x - 1, bomb.y],
        [bomb.x + 1, bomb.y],
      ]

      explosionCoordinates.forEach(([x, y]) => {
        // Check boundaries.
        if (
          y < 0 ||
          y >= room.board.length ||
          x < 0 ||
          x >= room.board[0].length
        ) {
          return
        }
        const cell = room.board[y][x]
        if (cell.type === 'obstacle') {
          cell.type = 'empty'
        }
        // Damage players.
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

    // Mark bomb for removal if older than 4000ms.
    if (bombAge >= 4000) {
      bombsToRemove.push(index)
    }
  })

  // Remove expired bombs.
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

const useBombExplosions = (roomId: string, enabled: boolean = true) => {
  useEffect(() => {
    if (!roomId || !enabled) return

    const roomRef = ref(database, `gameRooms/${roomId}`)
    const interval = setInterval(async () => {
      try {
        // Quick check: if no bombs exist, skip transaction.
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

        // Introduce a small random delay to help reduce collisions.
        const randomDelay = Math.floor(Math.random() * 200)
        await new Promise((resolve) => setTimeout(resolve, randomDelay))

        await runTransaction(roomRef, (currentRoom: any) => {
          if (!currentRoom) return currentRoom
          const updatedRoom = applyBombExplosions(currentRoom)
          return updatedRoom
        })
      } catch (error: any) {
        if (error.message && error.message.includes('maxretry')) {
          console.error('Bomb explosion transaction maxretry reached:', error)
          // Optionally, you can choose to skip this cycle
        } else {
          console.error('Error during bomb explosion transaction:', error)
        }
      }
    }, 1500) // Increase interval from 1000ms to 1500ms.

    return () => clearInterval(interval)
  }, [roomId, enabled])
}

export default useBombExplosions
