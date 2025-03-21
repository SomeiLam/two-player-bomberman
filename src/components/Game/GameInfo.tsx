import { Heart } from 'lucide-react'
import React from 'react'
import { getIconComponent } from '../getIconComponent'
import { UserIcon } from '../../type'
import classNames from 'classnames'

interface Player {
  name: string
  icon?: UserIcon
  health: number
}

interface GameInfoProps {
  currentPlayer: string
  player1: Player
  player2: Player
  timeLeft?: number
  gameOver: boolean
}

const GameInfo: React.FC<GameInfoProps> = ({
  currentPlayer,
  player1,
  player2,
  timeLeft = 180,
  gameOver,
}) => {
  const IconComponent1 = getIconComponent(player1?.icon || 'Cat')
  const IconComponent2 = getIconComponent(player2?.icon || 'Squirrel')

  return (
    <div className="flex flex-row justify-between items-center gap-4 sm:gap-8 my-6 sm:mt-4 sm:mb-0">
      {/* Player 1 Stats */}
      <div
        className={classNames(
          'relative flex items-center justify-between gap-2 bg-white/10 rounded-xl p-2 sm:p-4',
          {
            'border border-purple-500 sm:border-0': currentPlayer === 'player1',
          }
        )}
      >
        <IconComponent1 className="w-10 h-10 p-2 sm:w-12 sm:h-12 rounded-full bg-pink-500/50" />

        <div>
          <p className="text-white font-bold text-center text-xs sm:text-xl truncate">
            {player1?.name || 'Player 1'}
          </p>
          <div className="flex gap-1">
            {player1?.health > 0 &&
              [...Array(player1?.health)]?.map((_, i) => (
                <Heart
                  key={i}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500"
                />
              ))}
            {player1?.health < 3 &&
              [...Array(3 - player1?.health)]?.map((_, i) => (
                <Heart key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              ))}
          </div>
        </div>
        {currentPlayer === 'player1' && (
          <div
            className="hidden sm:block absolute -bottom-4 sm:-bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r 
  from-pink-500 to-purple-500 px-4 py-1 rounded-full text-white text-xs sm:text-sm font-semibold
  shadow-[0_0_10px_rgba(219,39,119,0.3)]"
          >
            You
          </div>
        )}
      </div>
      {/* Timer */}
      {!gameOver && (
        <div className="text-2xl sm:text-4xl font-bold text-white">
          {timeLeft}
        </div>
      )}

      {/* Player 2 Stats */}
      <div
        className={classNames(
          'relative flex items-center justify-between gap-2 bg-white/10 rounded-xl p-2 sm:p-4',
          {
            'border border-purple-500 sm:border-0': currentPlayer === 'player2',
          }
        )}
      >
        <div>
          <p className="text-white font-bold text-center text-xs sm:text-xl truncate">
            {player2?.name || 'Player 2'}
          </p>
          <div className="flex gap-1">
            {player2?.health > 0 &&
              [...Array(player2?.health)]?.map((_, i) => (
                <Heart
                  key={i}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500"
                />
              ))}
            {player2?.health < 3 &&
              [...Array(3 - player2?.health)]?.map((_, i) => (
                <Heart key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              ))}
          </div>
        </div>
        <IconComponent2 className="w-10 h-10 p-2 sm:w-12 sm:h-12 rounded-full bg-blue-500/50" />
        {currentPlayer === 'player2' && (
          <div
            className="hidden sm:block absolute -bottom-3 sm:-bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r 
  from-blue-500 to-purple-500 px-4 py-1 rounded-full text-white text-xs sm:text-sm font-semibold
  shadow-[0_0_10px_rgba(219,39,119,0.3)]"
          >
            You
          </div>
        )}
      </div>
    </div>
  )
}

export default GameInfo
