export interface Cell {
  type: 'wall' | 'obstacle' | 'empty'
}

export const generateBoard = (rows = 11, cols = 11): Cell[][] => {
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
  return board
}
