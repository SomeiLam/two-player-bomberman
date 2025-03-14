import { BrickWall } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Cell } from '../../utils/gameBoard'
import PlayerHelmet from '../../assets/PlayerHelmet'
import { UserIcon } from '../../type'
import { getIconComponent } from '../getIconComponent'
import player1Bomb from '../../assets/player1-bomb.svg'
import player2Bomb from '../../assets/player2-bomb.svg'
import expose from '../../assets/expose.svg'
import './Game.css'

interface Position {
  x: number
  y: number
}

type Direction = 'up' | 'down' | 'left' | 'right'

interface Player {
  position: Position
  icon: UserIcon
  direction: Direction
}

interface GameBoardProps {
  board: Cell[][]
  player1: Player
  player2: Player
  bombs?: {
    x: number
    y: number
    plantedAt: number
    plantedBy: 'player1' | 'player2'
  }[] // Optional bomb positions
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  player1,
  player2,
  bombs = [],
}) => {
  const rows = board.length
  const cols = board[0]?.length || 0

  // This state updates periodically to force a re-render
  const [currentTime, setCurrentTime] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000) // Update every second
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="relative w-full h-full" style={{ maxHeight: '70vh' }}>
      {/* Board Grid */}
      <div
        className="w-full h-full grid gap-1 bg-emerald-900/20 p-2 rounded-2xl"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {board.map((row, i) =>
          row.map((cell, j) => {
            // Render the base cell: wall, obstacle, or empty.
            const baseContent =
              cell.type === 'wall' ? (
                <BrickWall className="w-full h-full scale-125 text-slate-600" />
              ) : cell.type === 'obstacle' ? (
                <BrickWall className="w-full h-full bg-amber-900/50 rounded-lg text-amber-800/20" />
              ) : (
                <div className="w-full h-full bg-emerald-600/20" />
              )

            // Check if player1 and/or player2 are in this cell.
            const inCellP1 =
              player1.position.x === j && player1.position.y === i
            const inCellP2 =
              player2.position.x === j && player2.position.y === i

            // Determine if this cell is affected by any explosion.
            // For each bomb, if its age is between 3000 and 4000 ms and the cell
            // is in the same row (|bomb.x - j| <= 1) or same column (|bomb.y - i| <= 1),
            // then the explosion affects this cell.
            const explosionInCell = bombs.some((bomb) => {
              const bombAge = currentTime - bomb.plantedAt
              if (bombAge >= 3000 && bombAge < 4000) {
                // Check horizontal explosion (same row)
                if (bomb.y === i && Math.abs(bomb.x - j) <= 1) return true
                // Check vertical explosion (same column)
                if (bomb.x === j && Math.abs(bomb.y - i) <= 1) return true
              }
              return false
            })

            // Render bombs that are still in pre-explosion state (bomb age < 3 seconds) and placed exactly in this cell.
            const bombsInCell = bombs.filter(
              (bomb) =>
                bomb.x === j &&
                bomb.y === i &&
                currentTime - bomb.plantedAt < 3000
            )

            return (
              <div
                key={`${i}-${j}`}
                className="aspect-square rounded-md flex items-center justify-center relative"
              >
                {baseContent}

                {inCellP1 && inCellP2 ? (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        top: -8,
                        left: -8,
                        width: '70%',
                        height: '70%',
                        zIndex: 10,
                      }}
                    >
                      <HelmetWithIcon
                        player="1"
                        icon={player1.icon}
                        direction={player1.direction}
                      />
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -8,
                        right: -8,
                        width: '70%',
                        height: '70%',
                        zIndex: 10,
                      }}
                    >
                      <HelmetWithIcon
                        player="2"
                        icon={player2.icon}
                        direction={player2.direction}
                      />
                    </div>
                  </>
                ) : inCellP1 ? (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '70%',
                      height: '70%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10,
                    }}
                  >
                    <HelmetWithIcon
                      player="1"
                      icon={player1.icon}
                      direction={player1.direction}
                    />
                  </div>
                ) : inCellP2 ? (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '70%',
                      height: '70%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10,
                    }}
                  >
                    <HelmetWithIcon
                      player="2"
                      icon={player2.icon}
                      direction={player2.direction}
                    />
                  </div>
                ) : null}

                {/* Render bomb image if a bomb is placed in this cell and still pre-explosion */}
                {bombsInCell.map((bomb) => (
                  <div
                    key={bomb.plantedAt}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
                  >
                    <img
                      src={
                        bomb.plantedBy === 'player1' ? player1Bomb : player2Bomb
                      }
                      alt="bomb"
                      className="animate-bomb"
                    />
                  </div>
                ))}

                {/* Render explosion overlay if this cell is affected by an explosion and it's not a wall */}
                {explosionInCell && cell.type !== 'wall' && (
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
    </div>
  )
}

export default GameBoard

const HelmetWithIcon = ({
  player,
  icon,
  direction,
}: {
  player: '1' | '2'
  icon: UserIcon
  direction: Direction
}) => {
  // Map direction to rotation degrees; default (down) is 0.
  const rotationMapping: Record<Direction, number> = {
    down: 180,
    left: -90,
    right: 90,
    up: 0,
  }

  // Apply the rotation
  const rotationDeg = rotationMapping[direction]

  const IconComponent = getIconComponent(icon)
  return (
    <div
      style={{ position: 'relative', transform: `rotate(${rotationDeg}deg)` }}
    >
      <PlayerHelmet player={player} />
      <IconComponent
        style={{
          position: 'absolute',
          top: '26%',
          left: '50%',
          transform: 'translate(-50%, 0%)',
          width: '50%',
          height: '50%',
          color: 'black', // or any color
        }}
      />
    </div>
  )
}
