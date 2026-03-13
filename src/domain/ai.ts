/**
 * AI move selection — CPU player logic.
 * Pure functions: given a board state, return the best move.
 */

import type { Board, Coord } from './types'

/** Get all cells that haven't been shot yet */
function getUntriedCells(board: Board): Coord[] {
  const cells: Coord[] = []
  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      const cell = board.grid[row][col]
      if (cell === 'empty' || cell === 'ship') {
        cells.push({ row, col })
      }
    }
  }
  return cells
}

/** Get adjacent untried cells around a coordinate */
function getAdjacentUntried(board: Board, coord: Coord): Coord[] {
  const dirs: Coord[] = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ]
  return dirs
    .map((d) => ({ row: coord.row + d.row, col: coord.col + d.col }))
    .filter(
      (c) =>
        c.row >= 0 &&
        c.row < board.size &&
        c.col >= 0 &&
        c.col < board.size &&
        (board.grid[c.row][c.col] === 'empty' || board.grid[c.row][c.col] === 'ship'),
    )
}

/** Find all unsunk hit cells (hits that belong to ships not yet fully sunk) */
function getUnsunkHits(board: Board): Coord[] {
  const sunkCells = new Set<string>()
  for (const ship of board.ships) {
    if (ship.cells.every((c) => board.grid[c.row][c.col] === 'hit')) {
      for (const c of ship.cells) {
        sunkCells.add(`${c.row},${c.col}`)
      }
    }
  }

  const unsunkHits: Coord[] = []
  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      if (board.grid[row][col] === 'hit' && !sunkCells.has(`${row},${col}`)) {
        unsunkHits.push({ row, col })
      }
    }
  }
  return unsunkHits
}

/**
 * CPU move selection — hunt/target strategy.
 *
 * Target mode: if there are unsunk hits, try adjacent cells.
 * Hunt mode: pick a random untried cell with checkerboard parity.
 */
export function getCpuMove(board: Board): Coord {
  // Target mode — focus around existing unsunk hits
  const unsunkHits = getUnsunkHits(board)
  if (unsunkHits.length > 0) {
    // Try cells adjacent to unsunk hits
    for (const hit of unsunkHits) {
      const adjacent = getAdjacentUntried(board, hit)
      if (adjacent.length > 0) {
        return adjacent[Math.floor(Math.random() * adjacent.length)]
      }
    }
  }

  // Hunt mode — checkerboard pattern for efficiency
  const untried = getUntriedCells(board)
  const checkerboard = untried.filter((c) => (c.row + c.col) % 2 === 0)
  const pool = checkerboard.length > 0 ? checkerboard : untried
  return pool[Math.floor(Math.random() * pool.length)]
}
