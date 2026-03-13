/**
 * Game constants — magic numbers & config extracted to a single source of truth.
 */

import type { GameStats, ShipDef } from './types'

export const GRID_SIZE = 10

export const CPU_DELAY_MS = 400

export const SHIP_DEFS: readonly ShipDef[] = [
  { name: 'Carrier', length: 5 },
  { name: 'Battleship', length: 4 },
  { name: 'Cruiser', length: 3 },
  { name: 'Submarine', length: 3 },
  { name: 'Destroyer', length: 2 },
]

export const DEFAULT_STATS: GameStats = {
  wins: 0,
  losses: 0,
  streak: 0,
  bestStreak: 0,
}
