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
    <div className="block sm:hidden mt-4">
      <div className="flex justify-evenly items-center">
        <div>
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
              className="bg-slate-700 text-white rounded p-2 mx-1"
              onClick={() => handleDirection('down')}
            >
              <ArrowDown className="h-10 w-10" />
            </button>
            <button
              className="bg-slate-700 text-white rounded p-2 mx-1"
              onClick={() => handleDirection('right')}
            >
              <ArrowRight className="h-10 w-10" />
            </button>
          </div>
        </div>
        <button
          className="bg-amber-600 text-white rounded-3xl p-2 mx-1 h-24 w-24"
          onClick={handlePlantBomb}
        >
          <BombIcon className="h-20 w-20" />
        </button>
      </div>
    </div>
  )
}

export default ControlButtons
