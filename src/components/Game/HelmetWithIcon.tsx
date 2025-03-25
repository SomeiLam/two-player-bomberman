import { Direction, UserIcon } from '../../type'
import { getIconComponent } from '../getIconComponent'
import PlayerHelmet from '../../assets/PlayerHelmet'

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

export default HelmetWithIcon
