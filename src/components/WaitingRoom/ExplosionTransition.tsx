import { BombIcon } from 'lucide-react'
import React, { useEffect } from 'react'

interface ExplosionTransitionProps {
  onComplete: () => void
  children?: React.ReactNode
}

const ExplosionTransition: React.FC<ExplosionTransitionProps> = ({
  onComplete,
  children,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 1500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Content provided by the parent */}
      {children && <div className="relative z-10">{children}</div>}

      {/* Explosion animation overlay */}
      <div className="explosion-effect absolute" />

      {/* Optional: you can also include some default content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <BombIcon className="w-20 h-20 sm:w-20 sm:h-20 text-purple-300" />
        <p className="text-purple-300 text-3xl sm:text-5xl">Let's boom</p>
      </div>
    </div>
  )
}

export default ExplosionTransition
