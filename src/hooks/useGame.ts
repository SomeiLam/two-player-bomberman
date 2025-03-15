// src/hooks/useGame.ts
import { useState, useEffect, useRef } from 'react'
import { ref, onValue, update, runTransaction } from 'firebase/database'
import { database } from '../firebase'
import { Room, PlayerType } from '../type'
import { useNavigate } from 'react-router-dom'

export const useGame = (roomId: string, currentPlayer: PlayerType) => {
  const [roomState, setRoomState] = useState<Room | null>(null)
  const navigate = useNavigate()

  // Create a ref to store the latest roomState for use in event handlers.
  const roomStateRef = useRef<Room | null>(null)

  // Subscribe to room state updates from Firebase.
  useEffect(() => {
    if (!roomId) return
    const roomRef = ref(database, `gameRooms/${roomId}`)
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      setRoomState(data)
      // Update the ref with the latest data.
      roomStateRef.current = data
      // If room status reverts to 'waiting', navigate back.
      if (data && data.status === 'waiting') {
        navigate('/waiting')
      }
    })
    return () => unsubscribe()
  }, [roomId, navigate])

  // Handle player movement and bomb planting via keydown events.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!roomId || !currentPlayer) return

      // Prevent default behavior for arrow keys and space bar.
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.keyCode === 32) {
        e.preventDefault()
      }

      // Bomb planting when space bar is pressed.
      if (e.keyCode === 32) {
        handlePlantBomb()
        return
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

      // Use the ref to access the most recent room state.
      const latestRoomState = roomStateRef.current
      const playerState = latestRoomState?.players?.[currentPlayer]
      if (!playerState?.position) return

      const oldX = playerState.position.x
      const oldY = playerState.position.y
      const newX = oldX + deltaX
      const newY = oldY + deltaY

      // Optional: Check for boundaries and obstacles on the board.
      if (latestRoomState?.board) {
        const cell = latestRoomState.board[newY]?.[newX]
        if (!cell || cell.type === 'wall' || cell.type === 'obstacle') {
          return
        }
      }

      // Update player's direction and position in Firebase.
      const playerRef = ref(
        database,
        `gameRooms/${roomId}/players/${currentPlayer}`
      )
      update(playerRef, {
        direction: newDirection,
        position: { x: newX, y: newY },
      })
    }

    // Attach the event listener once.
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [roomId, currentPlayer]) // roomState is not a dependency here

  // Bomb planting logic using a transaction.
  const handlePlantBomb = () => {
    const latestRoomState = roomStateRef.current
    const currentPosition =
      currentPlayer === 'player1'
        ? latestRoomState?.players?.player1?.position
        : latestRoomState?.players?.player2?.position
    if (!currentPosition) return

    const bomb = {
      x: currentPosition.x,
      y: currentPosition.y,
      plantedAt: Date.now(),
      plantedBy: currentPlayer,
    }

    const bombsRef = ref(database, `gameRooms/${roomId}/bombs`)

    runTransaction(bombsRef, (currentBombs) => {
      const now = Date.now()
      const bombsArray = Array.isArray(currentBombs) ? currentBombs : []
      // Count active bombs for the current player (planted within last 3 sec)
      const playerActiveBombCount = bombsArray.filter(
        (b) => b.plantedBy === currentPlayer && now - b.plantedAt < 3000
      ).length

      if (playerActiveBombCount >= 3) {
        return bombsArray
      }
      return [...bombsArray, bomb]
    })
  }

  // Cleanup function to remove the current player's data from the room.
  const cleanupPlayer = async () => {
    if (!roomId) return
    const roomRef = ref(database, `gameRooms/${roomId}`)
    await update(roomRef, {
      status: 'waiting',
      [`players/${currentPlayer}`]: null,
      waitingStartedAt: Date.now(),
    })
  }

  // Handle sending an emoji.
  const handleSendEmoji = (emoji: number) => {
    if (!roomId || !currentPlayer) return
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

  // Cleanup on page unload.
  useEffect(() => {
    const handleBeforeUnload = async () => {
      await cleanupPlayer()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [roomId])

  // Explicit exit handler.
  const handleExit = async () => {
    if (roomState?.status === 'in-progress') {
      await cleanupPlayer()
    }
    navigate('/')
  }

  return {
    roomState,
    handleExit,
    handleSendEmoji,
    handlePlantBomb, // Expose if needed for additional UI triggers.
  }
}
