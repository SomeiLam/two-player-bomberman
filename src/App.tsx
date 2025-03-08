import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './pages/HomeScreen'
import WaitingRoom from './pages/WaitingRoom'
import GameScreen from './pages/GameScreen'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/waiting" element={<WaitingRoom />} />
        <Route path="/game" element={<GameScreen />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
