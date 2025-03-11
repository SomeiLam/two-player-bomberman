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

export const generateBoard = (rows = 11, cols = 11): GameBoard => {
  // Step 1: Generate the board with borders, static walls, and random obstacles.
  const board: Cell[][] = []
  for (let i = 0; i < rows; i++) {
    const row: Cell[] = []
    for (let j = 0; j < cols; j++) {
      let cellType: Cell['type'] = 'empty'

      // Border walls
      if (i === 0 || i === rows - 1 || j === 0 || j === cols - 1) {
        cellType = 'wall'
      }
      // Static walls in a checkerboard pattern
      else if (i % 2 === 0 && j % 2 === 0) {
        cellType = 'wall'
      }
      // Random obstacles
      else if (Math.random() < 0.3) {
        cellType = 'obstacle'
      }

      row.push({ type: cellType })
    }
    board.push(row)
  }

  // Step 2: Define the four available corners within the playable area.
  // (Using index 1 and rows-2/cols-2 because border cells are walls.)
  const corners: { [key: string]: Position } = {
    topLeft: { row: 1, col: 1 },
    topRight: { row: 1, col: cols - 2 },
    bottomLeft: { row: rows - 2, col: 1 },
    bottomRight: { row: rows - 2, col: cols - 2 },
  }

  // Get the keys and randomly select two distinct corners.
  const cornerKeys = Object.keys(corners)
  // Shuffle the keys
  for (let i = cornerKeys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cornerKeys[i], cornerKeys[j]] = [cornerKeys[j], cornerKeys[i]]
  }
  const player1CornerKey = cornerKeys[0]
  const player2CornerKey = cornerKeys[1]
  const player1Pos = corners[player1CornerKey]
  const player2Pos = corners[player2CornerKey]

  // Step 3: Ensure that the starting positions themselves are empty.
  board[player1Pos.row][player1Pos.col].type = 'empty'
  board[player2Pos.row][player2Pos.col].type = 'empty'

  // Step 4: Ensure adjacent cells for each corner are empty.
  // We adjust based on each specific corner.
  const clearCell = (r: number, c: number) => {
    // Only clear if it's within the board bounds and not a border wall.
    if (r > 0 && r < rows - 1 && c > 0 && c < cols - 1) {
      board[r][c].type = 'empty'
    }
  }

  // For player1:
  if (player1CornerKey === 'topLeft') {
    clearCell(player1Pos.row, player1Pos.col + 1)
    clearCell(player1Pos.row + 1, player1Pos.col)
  } else if (player1CornerKey === 'topRight') {
    clearCell(player1Pos.row, player1Pos.col - 1)
    clearCell(player1Pos.row + 1, player1Pos.col)
  } else if (player1CornerKey === 'bottomLeft') {
    clearCell(player1Pos.row, player1Pos.col + 1)
    clearCell(player1Pos.row - 1, player1Pos.col)
  } else if (player1CornerKey === 'bottomRight') {
    clearCell(player1Pos.row, player1Pos.col - 1)
    clearCell(player1Pos.row - 1, player1Pos.col)
  }

  // For player2:
  if (player2CornerKey === 'topLeft') {
    clearCell(player2Pos.row, player2Pos.col + 1)
    clearCell(player2Pos.row + 1, player2Pos.col)
  } else if (player2CornerKey === 'topRight') {
    clearCell(player2Pos.row, player2Pos.col - 1)
    clearCell(player2Pos.row + 1, player2Pos.col)
  } else if (player2CornerKey === 'bottomLeft') {
    clearCell(player2Pos.row, player2Pos.col + 1)
    clearCell(player2Pos.row - 1, player2Pos.col)
  } else if (player2CornerKey === 'bottomRight') {
    clearCell(player2Pos.row, player2Pos.col - 1)
    clearCell(player2Pos.row - 1, player2Pos.col)
  }

  return {
    board,
    player1Position: player1Pos,
    player2Position: player2Pos,
  }
}
