import { getCpuMove } from '@/domain/ai'
import { createBoard, fireAt, placeShip, placeShipsRandomly } from '@/domain/board'
import { CPU_DELAY_MS, SHIP_DEFS } from '@/domain/constants'
import { allShipsSunk } from '@/domain/rules'
import type { GameState, Orientation } from '@/domain/types'
import { useEffect, useState } from 'react'

const createInitialState = (): GameState => ({
  phase: 'placement',
  turn: 'player',
  playerBoard: createBoard(),
  cpuBoard: createBoard(),
  winner: null,
  placementShipIndex: 0,
  placementOrientation: 'horizontal',
  message: 'Place your Carrier',
})

export const useGame = () => {
  const [state, setState] = useState<GameState>(createInitialState)

  const toggleOrientation = () => {
    setState((previous) => {
      if (previous.phase !== 'placement') {
        return previous
      }

      const nextOrientation: Orientation =
        previous.placementOrientation === 'horizontal' ? 'vertical' : 'horizontal'

      return {
        ...previous,
        placementOrientation: nextOrientation,
      }
    })
  }

  const placeCurrentShip = (row: number, col: number) => {
    setState((previous) => {
      if (previous.phase !== 'placement') {
        return previous
      }

      const shipDef = SHIP_DEFS[previous.placementShipIndex]
      if (!shipDef) {
        return previous
      }

      const placedBoard = placeShip(
        previous.playerBoard,
        shipDef,
        { row, col },
        previous.placementOrientation,
      )

      if (!placedBoard) {
        return { ...previous, message: `Can't place ${shipDef.name} there` }
      }

      const nextShipIndex = previous.placementShipIndex + 1
      const allShipsPlaced = nextShipIndex >= SHIP_DEFS.length

      if (!allShipsPlaced) {
        return {
          ...previous,
          playerBoard: placedBoard,
          placementShipIndex: nextShipIndex,
          message: `Place your ${SHIP_DEFS[nextShipIndex].name}`,
        }
      }

      return {
        ...previous,
        phase: 'battle',
        turn: 'player',
        playerBoard: placedBoard,
        cpuBoard: placeShipsRandomly(createBoard()),
        message: 'Fire at enemy waters',
      }
    })
  }

  const fire = (row: number, col: number) => {
    setState((previous) => {
      if (previous.phase !== 'battle' || previous.turn !== 'player') {
        return previous
      }

      const fired = fireAt(previous.cpuBoard, { row, col })
      if (fired.result.result === 'already') {
        return { ...previous, message: 'You already fired there' }
      }

      if (allShipsSunk(fired.board)) {
        return {
          ...previous,
          phase: 'gameOver',
          winner: 'player',
          cpuBoard: fired.board,
          message: 'You win! Enemy fleet destroyed.',
        }
      }

      return {
        ...previous,
        cpuBoard: fired.board,
        turn: 'cpu',
        message: fired.result.result === 'hit' ? 'Direct hit! CPU turn...' : 'Miss. CPU turn...',
      }
    })
  }

  useEffect(() => {
    if (state.phase !== 'battle' || state.turn !== 'cpu') {
      return
    }

    const timerId = window.setTimeout(() => {
      setState((previous) => {
        if (previous.phase !== 'battle' || previous.turn !== 'cpu') {
          return previous
        }

        const target = getCpuMove(previous.playerBoard)
        const fired = fireAt(previous.playerBoard, target)

        if (allShipsSunk(fired.board)) {
          return {
            ...previous,
            phase: 'gameOver',
            winner: 'cpu',
            playerBoard: fired.board,
            message: 'CPU wins! Your fleet was sunk.',
          }
        }

        return {
          ...previous,
          playerBoard: fired.board,
          turn: 'player',
          message:
            fired.result.result === 'hit'
              ? 'CPU scored a hit. Your turn.'
              : 'CPU missed. Your turn.',
        }
      })
    }, CPU_DELAY_MS)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [state.phase, state.turn, state.playerBoard])

  const newGame = () => {
    setState(createInitialState())
  }

  return {
    state,
    placeCurrentShip,
    toggleOrientation,
    fire,
    newGame,
  }
}
