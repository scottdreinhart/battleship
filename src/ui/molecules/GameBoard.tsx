import { memo } from 'react'

import type { Board } from '@/domain/types'

import { Cell } from '@/ui/atoms/Cell'
import styles from './GameBoard.module.css'

interface GameBoardProps {
  board: Board
  showShips: boolean
  onCellClick?: (row: number, col: number) => void
  disabled?: boolean
  label: string
  touchOptimized?: boolean
}

function GameBoardComponent({
  board,
  showShips,
  onCellClick,
  disabled,
  label,
  touchOptimized,
}: GameBoardProps) {
  const colHeaders = Array.from({ length: board.size }, (_, i) => String.fromCharCode(65 + i))
  const rowHeaders = Array.from({ length: board.size }, (_, i) => String(i + 1))

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.label}>{label}</h2>
      <div
        className={styles.grid}
        role="grid"
        aria-label={label}
        style={{ '--grid-size': board.size } as React.CSSProperties}
      >
        {/* Corner spacer */}
        <div className={styles.corner} />
        {/* Column headers */}
        {colHeaders.map((ch) => (
          <div key={ch} className={styles.header}>
            {ch}
          </div>
        ))}
        {/* Rows */}
        {board.grid.map((row, ri) => (
          <div key={ri} className={styles.row} role="row">
            <div className={styles.rowHeader}>{rowHeaders[ri]}</div>
            {row.map((cell, ci) => (
              <Cell
                key={ci}
                state={cell}
                showShip={showShips}
                onClick={onCellClick ? () => onCellClick(ri, ci) : undefined}
                disabled={disabled}
                touchOptimized={touchOptimized}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export const GameBoard = memo(GameBoardComponent)
