/**
 * useGame — orchestrates full Battleship game state.
 * Manages placement phase, battle phase, CPU turns, and game-over detection.
 * CPU moves run off the main thread via a Web Worker (WASM-first, JS fallback).
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { getCpuMove } from '@/domain/ai'
import { createBoard, fireAt, placeShip, placeShipsRandomly } from '@/domain/board'
import { CPU_DELAY_MS, SHIP_DEFS } from '@/domain/constants'
import { allShipsSunk } from '@/domain/rules'
import type { Board, Coord, GamePhase, GameState, Orientation, Turn } from '@/domain/types'

function initialState(): GameState {
  return {
    phase: 'placement',
    turn: 'player',
    playerBoard: createBoard(),
    cpuBoard: placeShipsRandomly(createBoard()),
    winner: null,
    placementShipIndex: 0,
    placementOrientation: 'horizontal',
    message: `Place your ${SHIP_DEFS[0].name} (${SHIP_DEFS[0].length} cells)`,
  }
}

/** Request a CPU move from the Web Worker, or fall back to main-thread JS */
function requestCpuMove(board: Board, worker: Worker | null): Promise<Coord> {
  if (worker) {
    return new Promise<Coord>((resolve) => {
      const handler = (e: MessageEvent<{ row: number; col: number }>) => {
        worker.removeEventListener('message', handler)
        resolve({ row: e.data.row, col: e.data.col })
      }
      worker.addEventListener('message', handler)
      worker.postMessage({ board })
    })
  }
  return Promise.resolve(getCpuMove(board))
}

function createWorker(): Worker | null {
  try {
    return new Worker(new URL('@/workers/ai.worker.ts', import.meta.url), {
      type: 'module',
    })
  } catch {
    return null
  }
}

export interface UseGameReturn {
  state: GameState
  placeCurrentShip: (row: number, col: number) => void
  toggleOrientation: () => void
  fire: (row: number, col: number) => void
  newGame: () => void
}

export function useGame(): UseGameReturn {
  const [state, setState] = useState<GameState>(initialState)
  const cpuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const mountedRef = useRef(true)

  // Create worker on mount, terminate on unmount
  useEffect(() => {
    workerRef.current = createWorker()
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (cpuTimerRef.current) {
        clearTimeout(cpuTimerRef.current)
      }
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  // CPU turn logic — off-thread via worker
  useEffect(() => {
    if (state.phase !== 'battle' || state.turn !== 'cpu') {
      return
    }

    cpuTimerRef.current = setTimeout(() => {
      const playerBoard = state.playerBoard
      requestCpuMove(playerBoard, workerRef.current).then((move) => {
        if (!mountedRef.current) {
          return
        }
        setState((prev) => {
          if (prev.phase !== 'battle' || prev.turn !== 'cpu') {
            return prev
          }

          const { board: newPlayerBoard, result } = fireAt(prev.playerBoard, move)

          let phase: GamePhase = 'battle'
          let winner: Turn | null = null
          let message: string

          if (allShipsSunk(newPlayerBoard)) {
            phase = 'gameOver'
            winner = 'cpu'
            message = 'CPU wins! All your ships have been sunk.'
          } else if (result.sunkShip) {
            message = `CPU sank your ${result.sunkShip.def.name}!`
          } else if (result.result === 'hit') {
            message = 'CPU hit your ship!'
          } else {
            message = 'CPU missed. Your turn!'
          }

          return {
            ...prev,
            playerBoard: newPlayerBoard,
            phase,
            winner,
            turn: phase === 'gameOver' ? prev.turn : 'player',
            message,
          }
        })
      })
    }, CPU_DELAY_MS)
  }, [state.phase, state.turn, state.playerBoard])

  const placeCurrentShip = useCallback((row: number, col: number) => {
    setState((prev) => {
      if (prev.phase !== 'placement') {
        return prev
      }

      const def = SHIP_DEFS[prev.placementShipIndex]
      const result = placeShip(prev.playerBoard, def, { row, col }, prev.placementOrientation)
      if (!result) {
        return { ...prev, message: "Can't place there — try another spot." }
      }

      const nextIndex = prev.placementShipIndex + 1
      if (nextIndex >= SHIP_DEFS.length) {
        return {
          ...prev,
          playerBoard: result,
          phase: 'battle',
          placementShipIndex: nextIndex,
          message: 'All ships placed! Click the enemy grid to fire.',
        }
      }

      const nextDef = SHIP_DEFS[nextIndex]
      return {
        ...prev,
        playerBoard: result,
        placementShipIndex: nextIndex,
        message: `Place your ${nextDef.name} (${nextDef.length} cells)`,
      }
    })
  }, [])

  const toggleOrientation = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'placement') {
        return prev
      }
      const newOrientation: Orientation =
        prev.placementOrientation === 'horizontal' ? 'vertical' : 'horizontal'
      return { ...prev, placementOrientation: newOrientation }
    })
  }, [])

  const fire = useCallback((row: number, col: number) => {
    setState((prev) => {
      if (prev.phase !== 'battle' || prev.turn !== 'player') {
        return prev
      }

      const { board: newCpuBoard, result } = fireAt(prev.cpuBoard, { row, col })

      if (result.result === 'already') {
        return { ...prev, message: "You've already fired there." }
      }

      let phase: GamePhase = 'battle'
      let winner: Turn | null = null
      let message: string
      let nextTurn: Turn = 'cpu'

      if (allShipsSunk(newCpuBoard)) {
        phase = 'gameOver'
        winner = 'player'
        message = 'You win! All enemy ships sunk!'
      } else if (result.sunkShip) {
        message = `You sank the enemy ${result.sunkShip.def.name}!`
      } else if (result.result === 'hit') {
        message = 'Hit! Nice shot!'
      } else {
        message = 'Miss! CPU is thinking...'
      }

      if (phase === 'gameOver') {
        nextTurn = prev.turn
      }

      return {
        ...prev,
        cpuBoard: newCpuBoard,
        phase,
        winner,
        turn: nextTurn,
        message,
      }
    })
  }, [])

  const newGame = useCallback(() => {
    if (cpuTimerRef.current) {
      clearTimeout(cpuTimerRef.current)
    }
    setState(initialState())
  }, [])

  return { state, placeCurrentShip, toggleOrientation, fire, newGame }
}
