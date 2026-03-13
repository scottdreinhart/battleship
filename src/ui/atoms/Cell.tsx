import { memo } from 'react'

import type { CellState } from '@/domain/types'

import { cx } from '@/ui/utils/cssModules'
import styles from './Cell.module.css'

interface CellProps {
  state: CellState
  showShip: boolean
  onClick?: () => void
  disabled?: boolean
  touchOptimized?: boolean
}

function CellComponent({ state, showShip, onClick, disabled, touchOptimized }: CellProps) {
  const visible = showShip ? state : state === 'hit' || state === 'miss' ? state : 'empty'

  return (
    <button
      type="button"
      className={cx(
        styles.cell,
        styles[visible],
        disabled && styles.disabled,
        touchOptimized && styles.touchOptimized,
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Cell: ${visible}`}
    />
  )
}

export const Cell = memo(CellComponent)
