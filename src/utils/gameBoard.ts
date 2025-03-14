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

  // Define a helper to clear a cell (set to 'empty') if it's not a border.
  const clearCell = (r: number, c: number) => {
    if (r > 0 && r < rows - 1 && c > 0 && c < cols - 1) {
      board[r][c].type = 'empty'
    }
  }

  // Step 4: Clear all adjacent cells (top, bottom, left, right) for each starting position.
  // For player1:
  if (player1Pos.row > 0) clearCell(player1Pos.row - 1, player1Pos.col) // top
  if (player1Pos.row < rows - 1) clearCell(player1Pos.row + 1, player1Pos.col) // bottom
  if (player1Pos.col > 0) clearCell(player1Pos.row, player1Pos.col - 1) // left
  if (player1Pos.col < cols - 1) clearCell(player1Pos.row, player1Pos.col + 1) // right

  // For player2:
  if (player2Pos.row > 0) clearCell(player2Pos.row - 1, player2Pos.col) // top
  if (player2Pos.row < rows - 1) clearCell(player2Pos.row + 1, player2Pos.col) // bottom
  if (player2Pos.col > 0) clearCell(player2Pos.row, player2Pos.col - 1) // left
  if (player2Pos.col < cols - 1) clearCell(player2Pos.row, player2Pos.col + 1) // right

  // Optionally, you can add additional logic to clear diagonal neighbors if needed.

  return {
    board,
    player1Position: player1Pos,
    player2Position: player2Pos,
  }
}
