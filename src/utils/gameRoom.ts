import { ref, get, remove, update } from 'firebase/database'
import { database } from '../firebase'
import { PlayerType } from '../type'

export const cleanupPlayerWithGrace = async (
  roomId: string,
  currentPlayer: PlayerType
) => {
  const roomRef = ref(database, `gameRooms/${roomId}`)
  const snapshot = await get(roomRef)
  const roomState = snapshot.val()
  const players = roomState?.players ?? {}

  if (Object.keys(players).length === 2) {
    // Remove only the current player if both are present.
    await remove(ref(database, `gameRooms/${roomId}/players/${currentPlayer}`))
  } else if (Object.keys(players).length === 1) {
    // Mark the room for cleanup instead of immediate removal.
    await update(roomRef, { cleanupInitiatedAt: Date.now() })

    // Delay actual removal by 2 seconds to give the remaining client a chance to update.
    setTimeout(async () => {
      const latestSnapshot = await get(roomRef)
      const latestRoomState = latestSnapshot.val()
      const latestPlayers = latestRoomState?.players ?? {}
      if (Object.keys(latestPlayers).length === 1) {
        await remove(roomRef)
      }
    }, 2000)
  }
}
