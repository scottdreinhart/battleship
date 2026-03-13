// =======================================================================
// AI Engine for Battleship — WebAssembly (AssemblyScript)
//
// Probability-density AI: for each untried cell, counts how many valid
// remaining-ship placements could include it. Picks the highest-density
// cell in hunt mode; uses density-weighted selection in target mode.
//
// Board is a flat i32 array of GRID_SIZE * GRID_SIZE cells.
// Cell values: 0 = empty, 1 = ship, 2 = hit, 3 = miss
//
// Ship data is a flat i32 array: [shipCount, len0, cell0_0, cell0_1, ..., len1, ...]
// Each cell is encoded as row * GRID_SIZE + col.
//
// Compile: pnpm wasm:build
// =======================================================================

// ── Constants ──────────────────────────────────────────────────────────────
const GRID_SIZE: i32 = 10
const TOTAL_CELLS: i32 = GRID_SIZE * GRID_SIZE

const CELL_EMPTY: i32 = 0
const CELL_SHIP: i32 = 1
const CELL_HIT: i32 = 2
const CELL_MISS: i32 = 3

// ── PRNG (xorshift32) ─────────────────────────────────────────────────────
let rngState: u32 = 1

export function seedRng(seed: u32): void {
  rngState = seed !== 0 ? seed : 1
}

function nextRandom(): u32 {
  let s = rngState
  s ^= s << 13
  s ^= s >> 17
  s ^= s << 5
  rngState = s
  return s
}

function randomInRange(max: i32): i32 {
  return i32(nextRandom() % u32(max))
}

// ── Board memory layout ──────────────────────────────────────────────
// The host passes board data via setCell / setShipData, then calls getCpuMove.

const board = new StaticArray<i32>(TOTAL_CELLS)
const shipCells = new StaticArray<i32>(256) // flat ship data buffer
let shipDataLen: i32 = 0

export function setCell(index: i32, value: i32): void {
  unchecked(board[index] = value)
}

export function setShipData(index: i32, value: i32): void {
  unchecked(shipCells[index] = value)
}

export function setShipDataLength(len: i32): void {
  shipDataLen = len
}

// ── Helpers ──────────────────────────────────────────────────────────

function cellAt(row: i32, col: i32): i32 {
  return unchecked(board[row * GRID_SIZE + col])
}

function isUntried(row: i32, col: i32): bool {
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
    return false
  }
  const v = cellAt(row, col)
  return v === CELL_EMPTY || v === CELL_SHIP
}

/** Check if a ship (given by offset into shipCells) is fully sunk */
function isShipSunk(offset: i32, length: i32): bool {
  for (let i: i32 = 0; i < length; i++) {
    const cellIdx = unchecked(shipCells[offset + i])
    if (unchecked(board[cellIdx]) !== CELL_HIT) {
      return false
    }
  }
  return true
}

// ── Sunk mask (shared between unsunk-hit detection and density calc) ─────
const sunkMask = new StaticArray<i32>(TOTAL_CELLS)

function computeSunkMask(): void {
  for (let i: i32 = 0; i < TOTAL_CELLS; i++) {
    unchecked(sunkMask[i] = 0)
  }

  let ptr: i32 = 0
  if (shipDataLen > 0) {
    const numShips = unchecked(shipCells[ptr])
    ptr++
    for (let s: i32 = 0; s < numShips; s++) {
      const sLen = unchecked(shipCells[ptr])
      ptr++
      if (isShipSunk(ptr, sLen)) {
        for (let c: i32 = 0; c < sLen; c++) {
          unchecked(sunkMask[unchecked(shipCells[ptr + c])] = 1)
        }
      }
      ptr += sLen
    }
  }
}

// ── Unsunk hit detection ─────────────────────────────────────────────

const unsunkHitRows = new StaticArray<i32>(TOTAL_CELLS)
const unsunkHitCols = new StaticArray<i32>(TOTAL_CELLS)
let unsunkHitCount: i32 = 0

function findUnsunkHits(): void {
  computeSunkMask()

  unsunkHitCount = 0
  for (let row: i32 = 0; row < GRID_SIZE; row++) {
    for (let col: i32 = 0; col < GRID_SIZE; col++) {
      const idx = row * GRID_SIZE + col
      if (unchecked(board[idx]) === CELL_HIT && unchecked(sunkMask[idx]) === 0) {
        unchecked(unsunkHitRows[unsunkHitCount] = row)
        unchecked(unsunkHitCols[unsunkHitCount] = col)
        unsunkHitCount++
      }
    }
  }
}

// ── Remaining ship lengths ───────────────────────────────────────────────
const remainingLens = new StaticArray<i32>(10)
let remainingCount: i32 = 0

function findRemainingShipLengths(): void {
  remainingCount = 0
  let ptr: i32 = 0
  if (shipDataLen > 0) {
    const numShips = unchecked(shipCells[ptr])
    ptr++
    for (let s: i32 = 0; s < numShips; s++) {
      const sLen = unchecked(shipCells[ptr])
      ptr++
      if (!isShipSunk(ptr, sLen)) {
        unchecked(remainingLens[remainingCount] = sLen)
        remainingCount++
      }
      ptr += sLen
    }
  }
}

// ── Probability density map ──────────────────────────────────────────────
// For each untried cell, counts how many valid remaining-ship placements
// could include it. Higher density = higher probability of containing a ship.

const density = new StaticArray<i32>(TOTAL_CELLS)

/** Can this cell host part of a ship? (not blocked by miss or sunk hit) */
function canHostShip(row: i32, col: i32): bool {
  const v = cellAt(row, col)
  if (v === CELL_MISS) return false
  if (v === CELL_HIT) {
    return unchecked(sunkMask[row * GRID_SIZE + col]) === 0
  }
  return true
}

function computeDensity(): void {
  for (let i: i32 = 0; i < TOTAL_CELLS; i++) {
    unchecked(density[i] = 0)
  }

  for (let s: i32 = 0; s < remainingCount; s++) {
    const len = unchecked(remainingLens[s])

    // Horizontal placements
    for (let row: i32 = 0; row < GRID_SIZE; row++) {
      for (let col: i32 = 0; col <= GRID_SIZE - len; col++) {
        let valid: bool = true
        for (let k: i32 = 0; k < len; k++) {
          if (!canHostShip(row, col + k)) {
            valid = false
            break
          }
        }
        if (valid) {
          for (let k: i32 = 0; k < len; k++) {
            if (isUntried(row, col + k)) {
              const idx = row * GRID_SIZE + col + k
              unchecked(density[idx] = unchecked(density[idx]) + 1)
            }
          }
        }
      }
    }

    // Vertical placements
    for (let col: i32 = 0; col < GRID_SIZE; col++) {
      for (let row: i32 = 0; row <= GRID_SIZE - len; row++) {
        let valid: bool = true
        for (let k: i32 = 0; k < len; k++) {
          if (!canHostShip(row + k, col)) {
            valid = false
            break
          }
        }
        if (valid) {
          for (let k: i32 = 0; k < len; k++) {
            if (isUntried(row + k, col)) {
              const idx = (row + k) * GRID_SIZE + col
              unchecked(density[idx] = unchecked(density[idx]) + 1)
            }
          }
        }
      }
    }
  }
}

// ── Adjacent candidate buffer ────────────────────────────────────────────
const adjRows = new StaticArray<i32>(4)
const adjCols = new StaticArray<i32>(4)

function getAdjacentUntried(row: i32, col: i32): i32 {
  let count: i32 = 0
  if (isUntried(row - 1, col)) {
    unchecked(adjRows[count] = row - 1)
    unchecked(adjCols[count] = col)
    count++
  }
  if (isUntried(row + 1, col)) {
    unchecked(adjRows[count] = row + 1)
    unchecked(adjCols[count] = col)
    count++
  }
  if (isUntried(row, col - 1)) {
    unchecked(adjRows[count] = row)
    unchecked(adjCols[count] = col - 1)
    count++
  }
  if (isUntried(row, col + 1)) {
    unchecked(adjRows[count] = row)
    unchecked(adjCols[count] = col + 1)
    count++
  }
  return count
}

// ── Line-following target logic ──────────────────────────────────────────
// When two+ unsunk hits are collinear, extend along that line.

function tryLineTarget(): i32 {
  if (unsunkHitCount < 2) {
    return -1
  }

  for (let i: i32 = 0; i < unsunkHitCount; i++) {
    for (let j: i32 = i + 1; j < unsunkHitCount; j++) {
      const r1 = unchecked(unsunkHitRows[i])
      const c1 = unchecked(unsunkHitCols[i])
      const r2 = unchecked(unsunkHitRows[j])
      const c2 = unchecked(unsunkHitCols[j])

      if (r1 === r2) {
        // Horizontal line — find min/max col among all hits in this row
        let minCol: i32 = c1 < c2 ? c1 : c2
        let maxCol: i32 = c1 > c2 ? c1 : c2
        for (let k: i32 = 0; k < unsunkHitCount; k++) {
          if (unchecked(unsunkHitRows[k]) === r1) {
            const ck = unchecked(unsunkHitCols[k])
            if (ck < minCol) { minCol = ck }
            if (ck > maxCol) { maxCol = ck }
          }
        }
        if (isUntried(r1, minCol - 1)) {
          return r1 * GRID_SIZE + (minCol - 1)
        }
        if (isUntried(r1, maxCol + 1)) {
          return r1 * GRID_SIZE + (maxCol + 1)
        }
      } else if (c1 === c2) {
        // Vertical line — find min/max row among all hits in this col
        let minRow: i32 = r1 < r2 ? r1 : r2
        let maxRow: i32 = r1 > r2 ? r1 : r2
        for (let k: i32 = 0; k < unsunkHitCount; k++) {
          if (unchecked(unsunkHitCols[k]) === c1) {
            const rk = unchecked(unsunkHitRows[k])
            if (rk < minRow) { minRow = rk }
            if (rk > maxRow) { maxRow = rk }
          }
        }
        if (isUntried(minRow - 1, c1)) {
          return (minRow - 1) * GRID_SIZE + c1
        }
        if (isUntried(maxRow + 1, c1)) {
          return (maxRow + 1) * GRID_SIZE + c1
        }
      }
    }
  }
  return -1
}

// ── Main AI entry point ──────────────────────────────────────────────────
// Returns encoded move as row * GRID_SIZE + col

export function getCpuMove(): i32 {
  findUnsunkHits()
  findRemainingShipLengths()

  // Target mode: line-following first (fast, no density needed)
  if (unsunkHitCount >= 2) {
    const lineMove = tryLineTarget()
    if (lineMove >= 0) {
      return lineMove
    }
  }

  // Compute density map (used for both target-adjacent and hunt)
  computeDensity()

  // Target mode: density-weighted adjacent selection
  if (unsunkHitCount > 0) {
    let bestMove: i32 = -1
    let bestDensity: i32 = -1

    for (let i: i32 = 0; i < unsunkHitCount; i++) {
      const adjCount = getAdjacentUntried(
        unchecked(unsunkHitRows[i]),
        unchecked(unsunkHitCols[i]),
      )
      for (let j: i32 = 0; j < adjCount; j++) {
        const r = unchecked(adjRows[j])
        const c = unchecked(adjCols[j])
        const d = unchecked(density[r * GRID_SIZE + c])
        if (d > bestDensity) {
          bestDensity = d
          bestMove = r * GRID_SIZE + c
        }
      }
    }

    if (bestMove >= 0) {
      return bestMove
    }
  }

  // Hunt mode: pick from highest-density cells
  let maxDensity: i32 = 0
  for (let i: i32 = 0; i < TOTAL_CELLS; i++) {
    const d = unchecked(density[i])
    if (d > maxDensity) {
      maxDensity = d
    }
  }

  if (maxDensity > 0) {
    // Count cells at max density, pick one randomly for variety
    let count: i32 = 0
    for (let i: i32 = 0; i < TOTAL_CELLS; i++) {
      if (unchecked(density[i]) === maxDensity) {
        count++
      }
    }

    const pick = randomInRange(count)
    let idx: i32 = 0
    for (let i: i32 = 0; i < TOTAL_CELLS; i++) {
      if (unchecked(density[i]) === maxDensity) {
        if (idx === pick) {
          return i
        }
        idx++
      }
    }
  }

  // Fallback: any untried cell (shouldn't reach here in a valid game)
  let poolCount: i32 = 0
  for (let row: i32 = 0; row < GRID_SIZE; row++) {
    for (let col: i32 = 0; col < GRID_SIZE; col++) {
      if (isUntried(row, col)) {
        poolCount++
      }
    }
  }

  if (poolCount > 0) {
    const pick = randomInRange(poolCount)
    let idx: i32 = 0
    for (let row: i32 = 0; row < GRID_SIZE; row++) {
      for (let col: i32 = 0; col < GRID_SIZE; col++) {
        if (isUntried(row, col)) {
          if (idx === pick) {
            return row * GRID_SIZE + col
          }
          idx++
        }
      }
    }
  }

  return 0
}
