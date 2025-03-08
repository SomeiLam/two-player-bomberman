import { Cat } from 'lucide-react'
import classNames from 'classnames'
import { UserIcon } from '../../type'
import { getIconComponent } from '../getIconComponent'

const PlayerCard = ({
  playerName,
  status,
  icon,
  youBadge,
}: {
  playerName: string
  status: 'waiting' | 'ready'
  icon: UserIcon
  youBadge: boolean
}) => {
  const IconComponent = icon ? getIconComponent(icon) : null

  return (
    <div
      className={classNames('text-center relative', {
        'opacity-50': status === 'waiting',
      })}
    >
      {youBadge && (
        <div
          className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r 
      from-pink-500 to-purple-500 px-4 py-1 rounded-full text-white text-xs sm:text-sm font-semibold
      shadow-[0_0_10px_rgba(219,39,119,0.3)]"
        >
          You
        </div>
      )}
      <div
        className={classNames(
          'w-20 h-20 sm:w-32 sm:h-32 rounded-full p-1 mb-4 relative',
          {
            'bg-white/20': status === 'waiting',
            'bg-gradient-to-br from-pink-500 to-purple-500 shadow-[0_0_100px_rgba(219,39,119,0.3)]':
              status === 'ready',
          }
        )}
      >
        <div
          className={classNames(
            'w-full h-full rounded-full flex items-center justify-center',
            {
              'bg-slate-800 ': status === 'ready',
              'bg-slate-900': status === 'waiting',
            }
          )}
        >
          {IconComponent ? (
            <IconComponent
              className={classNames('w-8 h-8 sm:w-16 sm:h-16', {
                'text-white/50': status === 'waiting',
                'text-white': status === 'ready',
              })}
            />
          ) : (
            <Cat
              className={classNames('w-16 h-16 ', {
                'text-white/50': status === 'waiting',
                'text-white': status === 'ready',
              })}
            />
          )}
        </div>
        {youBadge && (
          <div
            className="absolute -bottom-3 sm:-bottom-2 left-1/2 transform -translate-x-1/2
                bg-green-500 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white
                animate-pulse shadow-lg shadow-green-500/20"
          >
            READY
          </div>
        )}
      </div>

      <p
        className={classNames('sm:text-xl font-semibold', {
          'text-white/50': status === 'waiting',
          'text-white': status === 'ready',
        })}
      >
        {playerName}
      </p>
      {status === 'waiting' && (
        <p className="text-white/30 text-sm sm:text-base">Waiting...</p>
      )}
    </div>
  )
}

export default PlayerCard
