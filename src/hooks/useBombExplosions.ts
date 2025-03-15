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

    // Explode at exactly 3000ms (mark bomb as exploding)
    if (bombAge >= 3000 && !bomb.exploded) {
      bomb.exploded = true
      bomb.explosionAt = now
    }

    // Remove bomb & apply final state changes at 4000ms
    if (bombAge >= 4000) {
      const explosionCoordinates = [
        [bomb.x, bomb.y],
        [bomb.x, bomb.y - 1],
        [bomb.x, bomb.y + 1],
        [bomb.x - 1, bomb.y],
        [bomb.x + 1, bomb.y],
      ]

      explosionCoordinates.forEach(([x, y]) => {
        if (
          y < 0 ||
          y >= room.board!.length ||
          x < 0 ||
          x >= room.board![0].length
        )
          return

        const cell = room.board![y][x]

        // Destroy obstacle now (at bomb removal time)
        if (cell.type === 'obstacle') {
          cell.type = 'empty'
        }

        // Damage players now
        const p1 = room.players!.player1
        const p2 = room.players!.player2

        if (p1?.position.x === x && p1?.position.y === y && p1.health > 0)
          p1.health -= 1

        if (p2?.position.x === x && p2?.position.y === y && p2.health > 0)
          p2.health -= 1
      })

      // Schedule bomb removal
      bombsToRemove.push(index)
    }
  })

  // Remove expired bombs
  bombsToRemove
    .sort((a, b) => b - a)
    .forEach((idx) => bombsArray.splice(idx, 1))

  room.bombs = bombsArray

  // End game if health is depleted
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
        const snapshot = await get(roomRef)
        const room = snapshot.val()
        if (!room?.bombs?.length) return

        await runTransaction(roomRef, (currentRoom) => {
          if (!currentRoom) return currentRoom
          return applyBombExplosions(currentRoom)
        })
      } catch (error) {
        console.error('Error during bomb explosion transaction:', error)
      }
    }, 1000) // Interval reduced to smoothly match bomb phases without overlaps

    return () => clearInterval(interval)
  }, [roomId, enabled])
}

export default useBombExplosions
