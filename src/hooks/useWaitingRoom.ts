// useWaitingRoom.ts
import { useState, useEffect } from 'react'
import { ref, onValue, remove, update } from 'firebase/database'
import { database } from '../firebase'
import { generateBoard } from '../utils/gameBoard'
import { Room, PlayerType } from '../type'

export const useWaitingRoom = (roomId: string) => {
  const [roomState, setRoomState] = useState<Room | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(180)
  // Subscribe to room state updates from Firebase.
  useEffect(() => {
    const roomRef = ref(database, `gameRooms/${roomId}`)
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      setRoomState(data)
    })

    return () => {
      unsubscribe()
    }
  }, [roomId])

  // Calculate the remaining time based on waitingStartedAt from the room state.
  useEffect(() => {
    if (roomState && roomState.waitingStartedAt) {
      const intervalId = setInterval(() => {
        // Floor the elapsed time to get whole seconds
        const elapsed = Math.floor(
          (Date.now() - roomState.waitingStartedAt) / 1000
        )
        const remaining = Math.max(180 - elapsed, 0)
        setTimeLeft(remaining)
        if (remaining <= 0) {
          remove(ref(database, `gameRooms/${roomId}`))
          clearInterval(intervalId)
        }
      }, 1000)
      return () => clearInterval(intervalId)
    }
  }, [roomState, roomId])

  /**
   * Cleanup function to remove the current player or the entire room.
   */
  const cleanupPlayer = async (currentPlayer: PlayerType) => {
    const players = roomState?.players ?? {}
    if (Object.keys(players).length === 2) {
      await remove(
        ref(database, `gameRooms/${roomId}/players/${currentPlayer}`)
      )
    } else if (Object.keys(players).length === 1) {
      await remove(ref(database, `gameRooms/${roomId}`))
    }
  }

  /**
   * Start the game by updating player positions, board, bombs, and status.
   */
  const startGame = async () => {
    const boardData = generateBoard()
    const roomRef = ref(database, `gameRooms/${roomId}`)
    await update(roomRef, {
      'players/player1/position': {
        x: boardData.player1Position.col,
        y: boardData.player1Position.row,
      },
      'players/player1/health': 3,
      'players/player2/position': {
        x: boardData.player2Position.col,
        y: boardData.player2Position.row,
      },
      'players/player2/health': 3,
      board: boardData.board,
      bombs: [],
      status: 'in-progress',
    })
  }

  /**
   * Resets the waiting timer by updating waitingStartedAt to the current time.
   */
  const extendTimer = async () => {
    const roomRef = ref(database, `gameRooms/${roomId}`)
    await update(roomRef, { waitingStartedAt: Date.now() })
  }

  return { roomState, cleanupPlayer, startGame, timeLeft, extendTimer }
}
