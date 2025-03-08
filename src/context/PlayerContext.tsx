/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { UserIcon } from '../type'

interface PlayerContextProps {
  roomId: string
  currentPlayer: 'player1' | 'player2'
  playerName: string
  icon: UserIcon
  setRoomId: (roomId: string) => void
  setCurrentPlayer: (player: 'player1' | 'player2') => void
  setPlayerName: (name: string) => void
  setIcon: (icon: UserIcon) => void
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined)

const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [roomId, setRoomId] = useState<string>('')
  const [currentPlayer, setCurrentPlayer] = useState<'player1' | 'player2'>(
    'player1'
  )
  const [playerName, setPlayerName] = useState('')
  const [icon, setIcon] = useState<UserIcon>('Cat')

  return (
    <PlayerContext.Provider
      value={{
        roomId,
        currentPlayer,
        playerName,
        icon,
        setRoomId,
        setCurrentPlayer,
        setPlayerName,
        setIcon,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}

export { PlayerProvider }
