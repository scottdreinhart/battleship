import { SHIP_DEFS } from '@/domain/constants'
import type { Board } from '@/domain/types'

import { cx } from '@/ui/utils/cssModules'
import styles from './ShipList.module.css'

interface ShipListProps {
  board: Board
  label: string
}

export function ShipList({ board, label }: ShipListProps) {
  return (
    <div className={styles.list}>
      <h3 className={styles.heading}>{label}</h3>
      {SHIP_DEFS.map((def) => {
        const ship = board.ships.find((s) => s.def.name === def.name)
        const isSunk =
          ship !== undefined && ship.cells.every((c) => board.grid[c.row][c.col] === 'hit')
        return (
          <div key={def.name} className={cx(styles.ship, isSunk && styles.sunk)}>
            <span className={styles.name}>{def.name}</span>
            <span className={styles.dots}>
              {Array.from({ length: def.length }, (_, i) => (
                <span key={i} className={styles.dot} />
              ))}
            </span>
          </div>
        )
      })}
    </div>
  )
}
