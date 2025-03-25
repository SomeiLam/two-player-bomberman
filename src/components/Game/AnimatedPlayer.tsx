import React from 'react'
import { UserIcon } from '../../type'
import HelmetWithIcon from './HelmetWithIcon'

interface AnimatedPlayerProps {
  player: '1' | '2'
  position: { x: number; y: number }
  cellSize: number
  icon: UserIcon
  direction: 'up' | 'down' | 'left' | 'right'
}

const AnimatedPlayer: React.FC<AnimatedPlayerProps> = ({
  player,
  position,
  cellSize,
  icon,
  direction,
}) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: cellSize,
    height: cellSize,
    top: position.y * cellSize,
    left: position.x * cellSize,
    transition: 'top 300ms ease, left 300ms ease',
    zIndex: 10,
  }

  return (
    <div style={style}>
      <HelmetWithIcon player={player} icon={icon} direction={direction} />
    </div>
  )
}

export default AnimatedPlayer
