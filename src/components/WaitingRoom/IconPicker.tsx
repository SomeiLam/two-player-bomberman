import { ref, update } from 'firebase/database'
import { database } from '../../firebase'
import { UserIcon } from '../../type'
import { usePlayer } from '../../context/PlayerContext'
import { getIconComponent } from '../getIconComponent'
import classNames from 'classnames'

const playerIcons: UserIcon[] = [
  'Cat',
  'Squirrel',
  'Dog',
  'Rabbit',
  'Turtle',
  'Bird',
  'Baby',
  'Ghost',
  'Fish',
  'Rat',
]

const IconPicker = ({ extendTimer }: { extendTimer: () => void }) => {
  const { icon, setIcon, currentPlayer, roomId } = usePlayer()

  // This function is called when a user clicks on an icon.
  // It updates the local context and then updates Firebase so that the other user can see the new icon.
  const handleIconClick = (selectedIcon: UserIcon) => {
    setIcon(selectedIcon)
    extendTimer()

    // Update the icon for the current player in Firebase
    // Here, we assume that player info is stored under:
    // gameRooms/{roomId}/players/{currentPlayer}
    if (roomId && currentPlayer) {
      const playerRef = ref(
        database,
        `gameRooms/${roomId}/players/${currentPlayer}`
      )
      update(playerRef, { icon: selectedIcon })
    }
  }

  return (
    <div className="p-4 sm:p-6 rounded-2xl">
      <h3 className="text-white sm:text-xl font-semibold mb-2 sm:mb-6">
        Choose Your Character
      </h3>
      <div className="grid grid-cols-5 gap-2 sm:gap-4">
        {playerIcons.map((Icon, index) => {
          const IconComponent = getIconComponent(Icon)
          return (
            <button
              key={index}
              className={classNames(
                'group relative icon-square aspect-square p-2 sm:p-4 rounded sm:rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(219,39,119,0.2)]',
                {
                  'hover:bg-blue/20': icon === Icon,
                  'hover:bg-white/20': icon !== Icon,
                }
              )}
              onClick={() => handleIconClick(Icon)}
            >
              <IconComponent
                className={classNames(
                  'w-full h-full transition-colors duration-300',
                  {
                    'text-blue-400 group-hover:text-blue': icon === Icon,
                    'text-white/70 group-hover:text-white': icon !== Icon,
                  }
                )}
              />
              <div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 
            opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default IconPicker
