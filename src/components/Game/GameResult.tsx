import { Player } from '../../type'

const GameReport = ({
  gameResult,
}: {
  gameResult: { player1: Player; player2: Player }
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-3xl text-white mb-4">Game Over</h2>
      <div className="text-white mb-4">
        <p>
          Player 1 ({gameResult.player1.name}): {gameResult.player1.health} HP
        </p>
        <p>
          Player 2 ({gameResult.player2.name}): {gameResult.player2.health} HP
        </p>
      </div>
    </div>
  )
}

export default GameReport
