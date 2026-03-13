/**
 * Board operations — pure functions for creating and manipulating game state.
 * No React, no DOM — purely functional transformations.
 */

import { GRID_SIZE, SHIP_DEFS } from './constants'
import type { Board, CellState, Coord, FireResult, Orientation, Ship, ShipDef } from './types'

/** Create an empty board */
export function createBoard(size: number = GRID_SIZE): Board {
  const grid: CellState[][] = Array.from({ length: size }, () =>
    Array.from<CellState>({ length: size }).fill('empty'),
  )
  return { size, grid, ships: [] }
}

/** Get cells a ship would occupy given origin + orientation */
export function getShipCells(origin: Coord, orientation: Orientation, length: number): Coord[] {
  const cells: Coord[] = []
  for (let i = 0; i < length; i++) {
    cells.push({
      row: origin.row + (orientation === 'vertical' ? i : 0),
      col: origin.col + (orientation === 'horizontal' ? i : 0),
    })
  }
  return cells
}

/** Check if a ship placement is valid (in bounds, no overlaps) */
export function canPlaceShip(
  board: Board,
  origin: Coord,
  orientation: Orientation,
  length: number,
): boolean {
  const cells = getShipCells(origin, orientation, length)
  return cells.every(
    (c) =>
      c.row >= 0 &&
      c.row < board.size &&
      c.col >= 0 &&
      c.col < board.size &&
      board.grid[c.row][c.col] === 'empty',
  )
}

/** Place a ship on the board — returns new board or null if invalid */
export function placeShip(
  board: Board,
  def: ShipDef,
  origin: Coord,
  orientation: Orientation,
): Board | null {
  if (!canPlaceShip(board, origin, orientation, def.length)) {
    return null
  }

  const cells = getShipCells(origin, orientation, def.length)
  const newGrid = board.grid.map((row) => [...row])
  for (const c of cells) {
    newGrid[c.row][c.col] = 'ship'
  }

  const ship: Ship = { def, origin, orientation, cells }
  return { ...board, grid: newGrid, ships: [...board.ships, ship] }
}

/** Fire at a cell — returns updated board and result */
export function fireAt(board: Board, coord: Coord): { board: Board; result: FireResult } {
  const cell = board.grid[coord.row][coord.col]

  if (cell === 'hit' || cell === 'miss') {
    return { board, result: { result: 'already', sunkShip: null } }
  }

  const newGrid = board.grid.map((row) => [...row])
  const isHit = cell === 'ship'
  newGrid[coord.row][coord.col] = isHit ? 'hit' : 'miss'
  const newBoard: Board = { ...board, grid: newGrid }

  let sunkShip: Ship | null = null
  if (isHit) {
    sunkShip =
      board.ships.find(
        (ship) =>
          ship.cells.some((c) => c.row === coord.row && c.col === coord.col) &&
          ship.cells.every((c) => {
            if (c.row === coord.row && c.col === coord.col) {
              return true
            }
            return newGrid[c.row][c.col] === 'hit'
          }),
      ) ?? null
  }

  return {
    board: newBoard,
    result: { result: isHit ? 'hit' : 'miss', sunkShip },
  }
}

/** Place ships randomly on a board */
export function placeShipsRandomly(board: Board): Board {
  let current = board
  for (const def of SHIP_DEFS) {
    let placed = false
    while (!placed) {
      const orientation: Orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical'
      const origin: Coord = {
        row: Math.floor(Math.random() * GRID_SIZE),
        col: Math.floor(Math.random() * GRID_SIZE),
      }
      const result = placeShip(current, def, origin, orientation)
      if (result) {
        current = result
        placed = true
      }
    }
  }
  return current
}
