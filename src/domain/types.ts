/**
 * Central type definitions — pure domain types, no framework dependencies.
 */

/** Shared theme types — identical across all games */

export interface ColorTheme {
  readonly id: string
  readonly label: string
  readonly accent: string
}

export interface ColorblindMode {
  readonly id: string
  readonly label: string
  readonly description?: string
}

export interface ThemeSettings {
  colorTheme: string
  mode: string
  colorblind: string
}

export interface GameStats {
  wins: number
  losses: number
  streak: number
  bestStreak: number
}

/** Grid coordinate */
export interface Coord {
  readonly row: number
  readonly col: number
}

/** Ship orientation on the board */
export type Orientation = 'horizontal' | 'vertical'

/** Blueprint for a ship type (name + length) */
export interface ShipDef {
  readonly name: string
  readonly length: number
}

/** A placed ship instance on a board */
export interface Ship {
  readonly def: ShipDef
  readonly origin: Coord
  readonly orientation: Orientation
  readonly cells: readonly Coord[]
}

/** State of a single cell on the board */
export type CellState = 'empty' | 'ship' | 'hit' | 'miss'

/** Full board state */
export interface Board {
  readonly size: number
  readonly grid: CellState[][]
  readonly ships: readonly Ship[]
}

/** Phase of the game */
export type GamePhase = 'placement' | 'battle' | 'gameOver'

/** Which player's turn it is during battle */
export type Turn = 'player' | 'cpu'

/** Outcome of firing at a cell */
export type ShotResult = 'hit' | 'miss' | 'already'

/** Result of a shot including whether a ship was sunk */
export interface FireResult {
  readonly result: ShotResult
  readonly sunkShip: Ship | null
}

/** Complete game state */
export interface GameState {
  readonly phase: GamePhase
  readonly turn: Turn
  readonly playerBoard: Board
  readonly cpuBoard: Board
  readonly winner: Turn | null
  readonly placementShipIndex: number
  readonly placementOrientation: Orientation
  readonly message: string
}
