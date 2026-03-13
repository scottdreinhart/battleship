import { cx } from '@/ui/utils/cssModules'
import styles from './StatusBar.module.css'

interface StatusBarProps {
  message: string
  phase: string
}

export function StatusBar({ message, phase }: StatusBarProps) {
  return (
    <div className={cx(styles.bar, phase === 'gameOver' && styles.gameOver)} role="status">
      {message}
    </div>
  )
}
