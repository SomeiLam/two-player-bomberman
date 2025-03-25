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
  const gameOverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const moveCooldownRef = useRef<boolean>(false)
  const bombCooldownRef = useRef<boolean>(false)

  // Generic helper function to perform an action with a specified cooldown.
  const performAction = (
    action: () => void,
    cooldownRef: React.MutableRefObject<boolean>,
    cooldownDuration: number
  ) => {
    if (cooldownRef.current) return
    action() // Execute the action.
    cooldownRef.current = true
    setTimeout(() => {
      cooldownRef.current = false
    }, cooldownDuration)
  }

  // Subscribe to room state updates.
  useEffect(() => {
    if (!roomId) {
      navigate('/')
    }
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

      // Bomb placement (space key) gets its own cooldown.
      if (e.key === ' ') {
        performAction(
          () => {
            handlePlantBomb()
          },
          bombCooldownRef,
          300
        ) // Set bomb cooldown duration (e.g., 300ms).
        return
      }

      // Wrap movement logic with cooldown.
      performAction(
        () => {
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
        },
        moveCooldownRef,
        200
      )
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [roomId, currentPlayer, gameOver])

  // Mobile: Handle direction button presses.
  const handleDirection = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!roomId || !currentPlayer || gameOver) return
    performAction(
      () => {
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
      },
      moveCooldownRef,
      200
    )
  }

  // Modified handlePlantBomb function with explosionTime.
  const handlePlantBomb = () => {
    // If on cooldown, exit immediately.
    if (bombCooldownRef.current) return
    // Set the bomb on cooldown.
    bombCooldownRef.current = true

    const latestRoomState = roomStateRef.current
    const currentPosition =
      currentPlayer === 'player1'
        ? latestRoomState?.players?.player1?.position
        : latestRoomState?.players?.player2?.position
    if (!currentPosition) {
      bombCooldownRef.current = false // Reset if position not available.
      return
    }

    // Set explosionTime to 3 seconds in the future.
    const now = Date.now()
    const bomb = {
      x: currentPosition.x,
      y: currentPosition.y,
      plantedAt: now,
      explosionTime: now + 3000, // Set explosion time at planting.
      plantedBy: currentPlayer,
      exploded: false,
    }

    const bombsRef = ref(database, `gameRooms/${roomId}/bombs`)
    runTransaction(bombsRef, (currentBombs) => {
      const now = Date.now()
      const bombsArray = Array.isArray(currentBombs) ? currentBombs : []
      // Count active bombs by checking if current time is before explosionTime.
      const playerActiveBombCount = bombsArray.filter(
        (b) => b.plantedBy === currentPlayer && now < b.explosionTime
      ).length

      if (playerActiveBombCount >= 3) {
        return bombsArray
      }
      return [...bombsArray, bomb]
    })

    // Reset bomb cooldown after 300ms.
    setTimeout(() => {
      bombCooldownRef.current = false
    }, 300)
  }

  // Cleanup: remove current player's data.
  const cleanupPlayer = async () => {
    if (!roomId) return
    const roomRef = ref(database, `gameRooms/${roomId}`)
    if (gameOver) {
      await remove(roomRef)
    } else {
      await update(roomRef, {
        status: 'waiting',
        [`players/${currentPlayer}`]: null,
        waitingStartedAt: Date.now(),
      })
    }
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
    const handleCleanup = () => {
      cleanupPlayer()
    }

    window.addEventListener('beforeunload', handleCleanup)
    window.addEventListener('pagehide', handleCleanup) // For Safari and some mobile browsers
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleCleanup()
      }
    })

    return () => {
      window.removeEventListener('beforeunload', handleCleanup)
      window.removeEventListener('pagehide', handleCleanup)
      document.removeEventListener('visibilitychange', handleCleanup)
    }
  }, [currentPlayer, roomState])

  // Set timeout to auto-exit after game over.
  useEffect(() => {
    if (gameOver) {
      gameOverTimeoutRef.current = setTimeout(() => {
        handleExit()
      }, 10000)
    }

    return () => {
      if (gameOverTimeoutRef.current) {
        clearTimeout(gameOverTimeoutRef.current)
      }
    }
  }, [gameOver])

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
