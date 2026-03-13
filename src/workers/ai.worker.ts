/**
 * AI Web Worker — off-main-thread computation for CPU moves.
 * WASM-first with JS fallback. Keeps UI at 60 FPS.
 */

import { getCpuMove as getCpuMoveJS } from '@/domain/ai'
import { GRID_SIZE } from '@/domain/constants'
import type { Board, Coord } from '@/domain/types'

// ── Cell encoding (must match assembly/index.ts) ─────────────────────────
const CELL_MAP: Record<string, number> = {
  empty: 0,
  ship: 1,
  hit: 2,
  miss: 3,
}

// ── WASM instance ────────────────────────────────────────────────────────
interface WasmExports {
  setCell(index: number, value: number): void
  setShipData(index: number, value: number): void
  setShipDataLength(len: number): void
  seedRng(seed: number): void
  getCpuMove(): number
}

let wasmExports: WasmExports | null = null

async function initWasm(): Promise<void> {
  try {
    const { AI_WASM_BASE64 } = await import('@/wasm/ai-wasm')
    if (!AI_WASM_BASE64) {
      return
    }
    const binary = Uint8Array.from(atob(AI_WASM_BASE64), (c) => c.charCodeAt(0))
    const compiled = await WebAssembly.compile(binary)
    const instance = await WebAssembly.instantiate(compiled, { env: { abort: () => {} } })
    wasmExports = instance.exports as unknown as WasmExports
  } catch {
    // WASM unavailable — JS fallback will be used
  }
}

const wasmReady = initWasm()

// ── Transfer board state to WASM ─────────────────────────────────────────
function loadBoardIntoWasm(board: Board): void {
  if (!wasmExports) {
    return
  }

  // Write grid cells
  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      wasmExports.setCell(row * GRID_SIZE + col, CELL_MAP[board.grid[row][col]] ?? 0)
    }
  }

  // Write ship data: [shipCount, len0, cell0, cell1, ..., len1, ...]
  let ptr = 0
  wasmExports.setShipData(ptr++, board.ships.length)
  for (const ship of board.ships) {
    wasmExports.setShipData(ptr++, ship.cells.length)
    for (const c of ship.cells) {
      wasmExports.setShipData(ptr++, c.row * GRID_SIZE + c.col)
    }
  }
  wasmExports.setShipDataLength(ptr)

  // Seed PRNG with time-based value
  wasmExports.seedRng((Date.now() & 0x7fffffff) | 1)
}

// ── Message handler ──────────────────────────────────────────────────────
self.onmessage = async (e: MessageEvent<{ board: Board }>) => {
  await wasmReady

  const { board } = e.data
  let move: Coord

  if (wasmExports) {
    loadBoardIntoWasm(board)
    const encoded = wasmExports.getCpuMove()
    move = { row: Math.floor(encoded / GRID_SIZE), col: encoded % GRID_SIZE }
  } else {
    move = getCpuMoveJS(board)
  }

  self.postMessage({ row: move.row, col: move.col })
}

export {}
