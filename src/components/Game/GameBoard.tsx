import { BrickWall } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Cell, UserIcon } from '../../type'
import player1Bomb from '../../assets/player1-bomb.svg'
import player2Bomb from '../../assets/player2-bomb.svg'
import expose from '../../assets/expose.svg'
import './Game.css'
import AnimatedPlayer from './AnimatedPlayer'

interface Position {
  x: number
  y: number
}

type Direction = 'up' | 'down' | 'left' | 'right'

interface Player {
  position: Position
  icon?: UserIcon
  direction: Direction
}

interface Bomb {
  x: number
  y: number
  plantedAt: number
  explosionTime: number // Fixed explosion time set at planting (e.g. plantedAt + 3000)
  plantedBy: 'player1' | 'player2'
  exploded?: boolean
}

interface GameBoardProps {
  board: Cell[][]
  player1: Player
  player2: Player
  bombs?: Bomb[] // Updated bomb type with explosionTime and exploded flag.
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  player1,
  player2,
  bombs = [],
}) => {
  const cols = board[0]?.length || 0

  const boardRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(50) // default size

  // Calculate cell size based on container width and number of columns
  useEffect(() => {
    if (boardRef.current) {
      const containerWidth = boardRef.current.clientWidth
      setCellSize(containerWidth / cols)
    }
  }, [cols])

  // Update current time periodically.
  const [currentTime, setCurrentTime] = useState(Date.now())
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Define removal delay for explosion overlay (in ms).
  const removalDelay = 1000

  return (
    <div className="relative w-full h-full" style={{ maxHeight: '70vh' }}>
      {/* Board Grid */}
      <div
        ref={boardRef}
        className="w-full h-full grid gap-1 bg-emerald-900/20 p-2 rounded-2xl"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {board.map((row, i) =>
          row.map((cell, j) => {
            // Render base cell: wall, obstacle, or empty.
            const baseContent =
              cell.type === 'wall' ? (
                <BrickWall className="w-full h-full scale-125 text-slate-600" />
              ) : cell.type === 'obstacle' ? (
                <BrickWall className="w-full h-full bg-amber-900/50 rounded-lg text-amber-800/20" />
              ) : (
                <div className="w-full h-full bg-emerald-600/20" />
              )

            return (
              <div
                key={`${i}-${j}`}
                className="aspect-square rounded-md relative overflow-hidden"
              >
                {baseContent}

                {/* Render bomb icon if a bomb is placed in this cell and it hasn't exploded yet */}
                {bombs
                  .filter(
                    (bomb) =>
                      bomb.x === j &&
                      bomb.y === i &&
                      currentTime < bomb.explosionTime
                  )
                  .map((bomb) => (
                    <div
                      key={bomb.plantedAt}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
                    >
                      <img
                        src={
                          bomb.plantedBy === 'player1'
                            ? player1Bomb
                            : player2Bomb
                        }
                        alt="bomb"
                        className="animate-bomb"
                      />
                    </div>
                  ))}

                {/* Render explosion overlay if a bomb in adjacent cells has exploded and is still in its explosion phase */}
                {bombs.some((bomb) => {
                  // Check if bomb is in its explosion phase: exploded and current time is within removal delay.
                  if (
                    bomb.exploded &&
                    currentTime < bomb.explosionTime + removalDelay
                  ) {
                    // Check if the cell is in the explosion radius (adjacent horizontally or vertically)
                    if (bomb.y === i && Math.abs(bomb.x - j) <= 1) return true
                    if (bomb.x === j && Math.abs(bomb.y - i) <= 1) return true
                  }
                  return false
                }) &&
                  cell.type !== 'wall' && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-30">
                      <img
                        src={expose}
                        alt="explosion"
                        className="w-full h-full object-cover animate-explosion"
                      />
                    </div>
                  )}
              </div>
            )
          })
        )}
      </div>

      {/* Render animated players over the board */}
      <AnimatedPlayer
        player="1"
        position={player1.position}
        cellSize={cellSize}
        icon={player1.icon || 'Cat'}
        direction={player1.direction}
      />
      <AnimatedPlayer
        player="2"
        position={player2.position}
        cellSize={cellSize}
        icon={player2.icon || 'Squirrel'}
        direction={player2.direction}
      />
    </div>
  )
}

export default GameBoard
