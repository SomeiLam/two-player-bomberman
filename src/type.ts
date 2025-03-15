export type UserIcon =
  | 'Cat'
  | 'Squirrel'
  | 'Dog'
  | 'Rabbit'
  | 'Turtle'
  | 'Bird'
  | 'Baby'
  | 'Ghost'
  | 'Fish'
  | 'Rat'

export type Direction = 'down' | 'up' | 'left' | 'right'
export type PlayerType = 'player1' | 'player2'

export interface Room {
  board?: Cell[][]
  players?: {
    player1?: Player
    player2?: Player
  }
  bombs?: {
    x: number
    y: number
    plantedAt: number
    plantedBy: PlayerType
    exploded: boolean
  }[]
  status?: 'waiting' | 'in-progress' | 'ended'
  waitingStartedAt: number
  timer?: number
}

export interface Player {
  direction: Direction
  health: 0 | 1 | 2 | 3
  icon?: UserIcon
  name: string
  position: {
    x: number
    y: number
  }
  emoji?: {
    timestamp: number
    value: number
  } | null
}

export interface Cell {
  type: 'wall' | 'obstacle' | 'empty'
}

export interface Position {
  row: number
  col: number
}

export interface GameBoard {
  board: Cell[][]
  player1Position: Position
  player2Position: Position
}
