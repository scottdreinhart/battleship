import { useEffect } from 'react'
import styles from './Splash.module.css'

export interface SplashProps {
  onComplete: () => void
}

/**
 * Splash screen with animated logo.
 * Displays for a few seconds then triggers onComplete callback.
 */
export function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className={styles.splash}>
      <div className={styles.container}>
        <div className={styles.logoWrapper}>
          <svg
            className={styles.logo}
            viewBox="0 0 100 100"
            width="120"
            height="120"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Grid background */}
            <g className={styles.grid}>
              {[...Array(10)].map((_, i) => (
                <g key={`grid-${i}`}>
                  <line x1={i * 10} y1="0" x2={i * 10} y2="100" />
                  <line x1="0" y1={i * 10} x2="100" y2={i * 10} />
                </g>
              ))}
            </g>

            {/* Ships */}
            <g className={styles.ships}>
              <rect x="10" y="20" width="40" height="8" rx="2" />
              <rect x="60" y="50" width="30" height="8" rx="2" />
              <rect x="20" y="70" width="20" height="8" rx="2" />
            </g>

            {/* Explosions */}
            <g className={styles.explosions}>
              <circle cx="65" cy="25" r="5" />
              <circle cx="85" cy="60" r="4" />
            </g>
          </svg>
        </div>
        <h1 className={styles.title}>BATTLESHIP</h1>
        <p className={styles.subtitle}>Naval Warfare</p>
      </div>
    </div>
  )
}
