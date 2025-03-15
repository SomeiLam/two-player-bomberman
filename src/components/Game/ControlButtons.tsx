import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BombIcon,
} from 'lucide-react'
import { Direction } from '../../type'

const ControlButtons = ({
  handleDirection,
  handlePlantBomb,
}: {
  handleDirection: (direction: Direction) => void
  handlePlantBomb: () => void
}) => {
  return (
    <div className="block sm:hidden">
      <div className="flex justify-center mb-2">
        <button
          className="bg-slate-700 text-white rounded p-2 mx-1"
          onClick={() => handleDirection('up')}
        >
          <ArrowUp className="h-10 w-10" />
        </button>
      </div>
      <div className="flex justify-center mb-2">
        <button
          className="bg-slate-700 text-white rounded p-2 mx-1"
          onClick={() => handleDirection('left')}
        >
          <ArrowLeft className="h-10 w-10" />
        </button>
        <button
          className="bg-amber-600 text-white rounded p-2 mx-1"
          onClick={handlePlantBomb}
        >
          <BombIcon className="h-10 w-10" />
        </button>
        <button
          className="bg-slate-700 text-white rounded p-2 mx-1"
          onClick={() => handleDirection('right')}
        >
          <ArrowRight className="h-10 w-10" />
        </button>
      </div>
      <div className="flex justify-center">
        <button
          className="bg-slate-700 text-white rounded p-2 mx-1"
          onClick={() => handleDirection('down')}
        >
          <ArrowDown className="h-10 w-10" />
        </button>
      </div>
    </div>
  )
}

export default ControlButtons
