// src/hooks/useGame.ts
import { useState, useEffect, useRef } from 'react'
import { ref, onValue, update, runTransaction, remove } from 'firebase/database'
import { database } from '../firebase'
import { Room, PlayerType } from '../type'
import { useNavigate } from 'react-router-dom'

export const useGame = (roomId: string, currentPlayer: PlayerType) => {
  const [roomState, setRoomState] = useState<Room | null>(null)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [timeLeft, setTimeLeft] = useState<number>(60)
  const navigate = useNavigate()

  // Ref to hold the latest room state for event handlers.
  const roomStateRef = useRef<Room | null>(null)

  // Subscribe to room state updates.
  useEffect(() => {
    if (!roomId) return
    const roomRef = ref(database, `gameRooms/${roomId}`)
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      setRoomState(data)
      roomStateRef.current = data

      // Mark game over if status is "ended".
      if (data && data.status === 'ended') {
        setGameOver(true)
      }
      // Navigate to waiting if status becomes "waiting".
      if (data && data.status === 'waiting') {
        navigate('/waiting')
      }
    })
    return () => unsubscribe()
  }, [roomId, navigate])

  // Timer effect: count down when game is in progress.
  useEffect(() => {
    if (roomState && roomState.status === 'in-progress') {
      // Reset timer at game start.
      setTimeLeft(60)
      const roomRef = ref(database, `gameRooms/${roomId}`)
      const timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time expired: update room status to "ended" and mark game as over.
            update(roomRef, { status: 'ended' })
            setGameOver(true)
            clearInterval(timerInterval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timerInterval)
    }
    // If roomState is null and game is over, navigate home.
    if (!roomState && gameOver) {
      navigate('/')
    }
  }, [roomState?.status, roomId, gameOver, navigate])

  // Handle keyboard movement and bomb planting.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!roomId || !currentPlayer || gameOver) return

      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)
      ) {
        e.preventDefault()
      }

      if (e.key === ' ') {
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
          return
      }

      const latestRoomState = roomStateRef.current
      const playerState = latestRoomState?.players?.[currentPlayer]
      if (!playerState?.position) return

      const newX = playerState.position.x + deltaX
      const newY = playerState.position.y + deltaY

      // Check boundaries, obstacles, and bombs
      if (latestRoomState?.board) {
        const cell = latestRoomState.board[newY]?.[newX]
        const hasBomb = latestRoomState.bombs?.some(
          (bomb) => bomb.x === newX && bomb.y === newY
        )

        if (
          !cell ||
          cell.type === 'wall' ||
          cell.type === 'obstacle' ||
          hasBomb
        ) {
          return // Can't move into blocked cell
        }
      }

      // Update player's position in Firebase
      const playerRef = ref(
        database,
        `gameRooms/${roomId}/players/${currentPlayer}`
      )
      update(playerRef, {
        direction: newDirection,
        position: { x: newX, y: newY },
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [roomId, currentPlayer, gameOver])

  // Mobile: Handle direction button presses.
  const handleDirection = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!roomId || !currentPlayer || gameOver) return
    const latestRoomState = roomStateRef.current
    const playerState = latestRoomState?.players?.[currentPlayer]
    if (!playerState?.position) return

    let deltaX = 0,
      deltaY = 0
    switch (direction) {
      case 'up':
        deltaY = -1
        break
      case 'down':
        deltaY = 1
        break
      case 'left':
        deltaX = -1
        break
      case 'right':
        deltaX = 1
        break
      default:
        return
    }

    const newX = playerState.position.x + deltaX
    const newY = playerState.position.y + deltaY

    // Check boundaries, obstacles, and bombs
    if (latestRoomState?.board) {
      const cell = latestRoomState.board[newY]?.[newX]
      const hasBomb = latestRoomState.bombs?.some(
        (bomb) => bomb.x === newX && bomb.y === newY
      )

      if (
        !cell ||
        cell.type === 'wall' ||
        cell.type === 'obstacle' ||
        hasBomb
      ) {
        return // Can't move into blocked cell
      }
    }

    const playerRef = ref(
      database,
      `gameRooms/${roomId}/players/${currentPlayer}`
    )
    update(playerRef, {
      direction,
      position: { x: newX, y: newY },
    })
  }

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
      const playerActiveBombCount = bombsArray.filter(
        (b) => b.plantedBy === currentPlayer && now - b.plantedAt < 3000
      ).length

      if (playerActiveBombCount >= 3) {
        return bombsArray
      }
      return [...bombsArray, bomb]
    })
  }

  // Cleanup: remove current player's data.
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
    const roomRef = ref(database, `gameRooms/${roomId}`)
    if (roomState?.status === 'ended') {
      await remove(roomRef)
    } else if (roomState?.status === 'in-progress') {
      await cleanupPlayer()
    }
    navigate('/')
  }

  return {
    roomState,
    handleExit,
    handleSendEmoji,
    handlePlantBomb,
    handleDirection, // Expose for mobile button controls.
    gameOver,
    timeLeft,
  }
}
