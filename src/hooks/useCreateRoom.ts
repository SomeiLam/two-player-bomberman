import { ref, get, set, update } from 'firebase/database'
import { database } from '../firebase'
import { Cell, UserIcon } from '../type'

export interface Player {
  direction: string // Adjust type as needed (for example, a union type)
  health: 0 | 1 | 2 | 3
  icon: string
  name: string
  position: { x: number; y: number }
  emoji: null
}

export interface Room {
  board?: Cell[][]
  players?: {
    player1?: Player
    player2?: Player
  }
  status?: 'waiting' | 'in-progress'
}

export interface JoinRoomResult {
  currentPlayer: 'player1' | 'player2'
  playerName: string
  icon: UserIcon
}

/**
 * Custom hook for joining or creating a game room.
 * @returns An object with a joinRoom function.
 */
export const useCreateRoom = () => {
  const initialPlayer = {
    health: 3,
    position: {
      x: 0,
      y: 0,
    },
    direction: 'down',
  }

  const joinRoom = async (
    roomId: string,
    playerName: string
  ): Promise<JoinRoomResult> => {
    const roomRef = ref(database, `gameRooms/${roomId}`)
    const snapshot = await get(roomRef)

    if (snapshot.exists()) {
      const data: Room = snapshot.val()
      if (data.players && data.players.player1) {
        const finalName =
          playerName && playerName.length > 0 ? playerName : 'Jujube'
        await set(ref(database, `gameRooms/${roomId}/players/player2`), {
          name: finalName,
          icon: 'Squirrel',
          ...initialPlayer,
        })
        // Reset the waiting timer when player2 joins
        await update(ref(database, `gameRooms/${roomId}`), {
          status: 'waiting',
          waitingStartedAt: Date.now(),
        })
        return {
          currentPlayer: 'player2',
          playerName: finalName,
          icon: 'Squirrel',
        }
      } else {
        const finalName =
          playerName && playerName.length > 0 ? playerName : 'Bubettino'
        await set(ref(database, `gameRooms/${roomId}/players/player1`), {
          name: finalName,
          icon: 'Cat',
          ...initialPlayer,
        })
        // Also set waitingStartedAt when the room is first created (or first player joins)
        await update(ref(database, `gameRooms/${roomId}`), {
          status: 'waiting',
          waitingStartedAt: Date.now(),
        })
        return { currentPlayer: 'player1', playerName: finalName, icon: 'Cat' }
      }
    } else {
      const finalName =
        playerName && playerName.length > 0 ? playerName : 'Bubettino'
      await set(ref(database, `gameRooms/${roomId}`), {
        status: 'waiting',
        waitingStartedAt: Date.now(), // start the timer here
        players: {
          player1: {
            name: finalName,
            icon: 'Cat',
            ...initialPlayer,
          },
        },
      })
      return { currentPlayer: 'player1', playerName: finalName, icon: 'Cat' }
    }
  }

  return { joinRoom }
}
