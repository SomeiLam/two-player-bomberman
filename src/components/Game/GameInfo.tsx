import { Heart } from 'lucide-react'
import React from 'react'
import { getIconComponent } from '../getIconComponent'
import { UserIcon } from '../../type'

interface Player {
  name: string
  icon: UserIcon
  health: number
}

interface GameInfoProps {
  currentPlayer: string
  player1: Player
  player2: Player
}

const GameInfo: React.FC<GameInfoProps> = ({
  currentPlayer,
  player1,
  player2,
}) => {
  const IconComponent1 = getIconComponent(player1?.icon || 'Cat')
  const IconComponent2 = getIconComponent(player2?.icon || 'Squirrel')

  return (
    <div className="flex flex-row justify-between items-center gap-4 sm:gap-8 my-6 sm:mt-4 sm:mb-0">
      {/* Player 1 Stats */}
      <div className="relative flex items-center justify-between gap-2 bg-white/10 rounded-xl py-4 px-2 sm:p-4">
        <IconComponent1 className="w-10 h-10 p-2 sm:w-12 sm:h-12 rounded-full bg-pink-500/50" />

        <div>
          <p className="text-white font-bold text-center text-xs sm:text-xl truncate">
            {player1?.name || 'Player 1'}
          </p>
          <div className="flex gap-1">
            {[...Array(player1?.health || 3)].map((_, i) => (
              <Heart
                key={i}
                className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500"
              />
            ))}
          </div>
        </div>
        {currentPlayer === 'player1' && (
          <div
            className="absolute -bottom-3 sm:-bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r 
  from-pink-500 to-purple-500 px-4 py-1 rounded-full text-white text-xs sm:text-sm font-semibold
  shadow-[0_0_10px_rgba(219,39,119,0.3)]"
          >
            You
          </div>
        )}
      </div>
      {/* Timer */}
      <div className="text-2xl sm:text-4xl font-bold text-white">2:30</div>

      {/* Player 2 Stats */}
      <div className="relative flex items-center justify-between gap-2 sm:gap-4 bg-white/10 rounded-xl py-4 px-2 sm:p-4">
        <div>
          <p className="text-white font-bold text-center text-xs sm:text-xl truncate">
            {player2?.name || 'Player 2'}
          </p>
          <div className="flex gap-1">
            {[...Array(player2?.health || 3)].map((_, i) => (
              <Heart
                key={i}
                className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500"
              />
            ))}
          </div>
        </div>
        <IconComponent2 className="w-10 h-10 p-2 sm:w-12 sm:h-12 rounded-full bg-blue-500/50" />
        {currentPlayer === 'player2' && (
          <div
            className="absolute -bottom-3 sm:-bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r 
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
