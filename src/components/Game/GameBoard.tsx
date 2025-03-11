import { Bomb, BrickWall, Cat } from 'lucide-react'
import React from 'react'
import { Cell } from '../../utils/gameBoard'
import PlayerHelmet from '../../assets/PlayerHelmet'
import { UserIcon } from '../../type'
import { getIconComponent } from '../getIconComponent'

interface Position {
  x: number
  y: number
}

interface GameBoardProps {
  board: Cell[][]
  player1Position: Position
  player2Position: Position
  player1Icon: UserIcon
  player2Icon: UserIcon
  bombs?: { row: number; col: number }[] // Optional bomb positions
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  player1Position,
  player2Position,
  player1Icon,
  player2Icon,
  bombs = [],
}) => {
  // Calculate cell dimensions based on board rows/cols
  const rows = board.length
  const cols = board[0]?.length || 0

  return (
    <div className="relative w-full h-full">
      {/* The board grid */}
      <div
        className="w-full h-full grid gap-1 bg-emerald-900/20 p-2 sm:p-4 rounded-2xl"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {board.map((row, i) =>
          row.map((cell, j) => {
            const cellContent =
              cell.type === 'wall' ? (
                <BrickWall className="w-full h-full scale-125 text-slate-600" />
              ) : cell.type === 'obstacle' ? (
                <BrickWall className="w-full h-full bg-amber-900/50 rounded-lg text-amber-800/20" />
              ) : player1Position.x === j && player1Position.y === i ? (
                <div className="w-full h-full bg-emerald-800/20 text-red text-lg">
                  <HelmetWithIcon player="1" icon={player1Icon} />
                </div>
              ) : player2Position.x === j && player2Position.y === i ? (
                <div className="w-full h-full bg-emerald-800/20 text-red text-lg">
                  <HelmetWithIcon player="2" icon={player2Icon} />
                </div>
              ) : (
                <div className="w-full h-full bg-emerald-800/20" />
              )

            return (
              <div
                key={`${i}-${j}`}
                className="aspect-square rounded-md flex items-center justify-center relative"
              >
                {cellContent}
              </div>
            )
          })
        )}
      </div>

      <div>
        {/* Optionally render bombs if provided */}
        {bombs.map((bomb, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: `${((bomb.row + 0.5) / rows) * 100}%`,
              left: `${((bomb.col + 0.5) / cols) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Bomb className="w-8 h-8 text-white" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default GameBoard

const HelmetWithIcon = ({
  player,
  icon,
}: {
  player: '1' | '2'
  icon: UserIcon
}) => {
  const IconComponent = getIconComponent(icon)
  return (
    <div style={{ position: 'relative' }}>
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
