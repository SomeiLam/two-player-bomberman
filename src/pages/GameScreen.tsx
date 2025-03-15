import { ArrowLeft } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import { useNavigate } from 'react-router-dom'
import FloatingEmoji from '../components/Game/FloatingEmoji'
import EmojiPanel from '../components/Game/EmojiPanel'
import GameBoard from '../components/Game/GameBoard'
import GameInfo from '../components/Game/GameInfo'
import { useGame } from '../hooks/useGame'
import useBombExplosions from '../hooks/useBombExplosions'
import ControlButtons from '../components/Game/ControlButtons'
// Emoji reactions
const emojis = ['😄', '😮', '😱', '🤪', '😎', '🤯', '❤️']
const THRESHOLD = 100 * 1000

const GameScreen = () => {
  const { currentPlayer, roomId } = usePlayer()
  const navigate = useNavigate()
  const {
    roomState,
    handleExit,
    handleSendEmoji,
    handlePlantBomb,
    handleDirection,
    gameOver,
    timeLeft,
  } = useGame(roomId, currentPlayer)

  useBombExplosions(roomId, !gameOver)

  return (
    <div className="sm:h-dvh h-auto sm:min-h-full bg-slate-900 flex flex-col p-4 sm:p-8">
      {/* Exit Button */}
      <button
        className="absolute left-4 top-4 text-white/70 hover:text-white flex items-center 
        gap-2 transition-colors duration-300 group z-10"
        onClick={handleExit}
      >
        <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="hidden sm:inline">Exit Game</span>
      </button>

      {/* Game Header - Responsive layout */}
      {roomState?.players?.player1 && roomState?.players?.player2 && (
        <GameInfo
          currentPlayer={currentPlayer}
          player1={roomState?.players?.player1}
          player2={roomState?.players?.player2}
          timeLeft={timeLeft}
          gameOver={gameOver}
        />
      )}

      {/* Game Board with Emoji Reactions - Responsive layout */}
      <div className="flex-1 flex justify-center items-center gap-4">
        <div
          className="order-1 sm:order-2 flex items-center justify-center w-full overflow-hidden"
          // Limit the containing box so it never exceeds 70% of the viewport height
          style={{ maxHeight: '70vh' }}
        >
          <div
            style={{
              width: 'min(70vh, 100%)',
              height: 'min(70vh, 100%)',
              position: 'relative',
              aspectRatio: '1 / 1',
            }}
          >
            {roomState?.board &&
            roomState?.players?.player1 &&
            roomState?.players?.player2 ? (
              <GameBoard
                board={roomState.board}
                player1={roomState.players.player1}
                player2={roomState.players.player2}
                bombs={roomState.bombs}
              />
            ) : roomState === null ? (
              <button onClick={() => navigate('/')} className="text-gray-100">
                Restart game
              </button>
            ) : (
              <p className="text-white">Loading board...</p>
            )}

            {gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
                <h1 className="text-white text-6xl font-bold">GAME OVER</h1>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Controls: Direction Buttons & Plant Bomb (visible on mobile only) */}
      <ControlButtons
        handleDirection={handleDirection}
        handlePlantBomb={handlePlantBomb}
      />

      {/* Use the separate EmojiPanel component */}
      <EmojiPanel emojis={emojis} onEmojiSend={handleSendEmoji} />

      {/* Floating Emoji Animation Container for Player 1 */}
      {roomState?.players?.player1?.emoji &&
        Date.now() - roomState.players.player1.emoji.timestamp < THRESHOLD && (
          <FloatingEmoji player1Emoji={roomState.players.player1.emoji} />
        )}

      {/* Floating Emoji Animation Container for Player 2 */}
      {roomState?.players?.player2?.emoji &&
        Date.now() - roomState.players.player2.emoji.timestamp < THRESHOLD && (
          <FloatingEmoji player2Emoji={roomState.players.player2.emoji} />
        )}
    </div>
  )
}

export default GameScreen
