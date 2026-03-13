/**
 * Game rules — win/loss/draw detection.
 * Pure functions operating on domain types only.
 */

import type { Board } from './types'

/** Check if all ships on a board have been sunk */
export function allShipsSunk(board: Board): boolean {
  return (
    board.ships.length > 0 &&
    board.ships.every((ship) => ship.cells.every((c) => board.grid[c.row][c.col] === 'hit'))
  )
}

/** Count how many ships have been sunk */
export function sunkCount(board: Board): number {
  return board.ships.filter((ship) => ship.cells.every((c) => board.grid[c.row][c.col] === 'hit'))
    .length
}

/** Count total hits on a board */
export function hitCount(board: Board): number {
  let count = 0
  for (const row of board.grid) {
    for (const cell of row) {
      if (cell === 'hit') {
        count++
      }
    }
  }
  return count
}

/** Count total shots taken against a board */
export function shotCount(board: Board): number {
  let count = 0
  for (const row of board.grid) {
    for (const cell of row) {
      if (cell === 'hit' || cell === 'miss') {
        count++
      }
    }
  }
  return count
}
