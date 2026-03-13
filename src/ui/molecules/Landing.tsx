import styles from './Landing.module.css'

export type Difficulty = 'easy' | 'hard'

export interface LandingProps {
  onStart: (difficulty: Difficulty) => void
}

/**
 * Landing screen — game start selection with difficulty options.
 */
export function Landing({ onStart }: LandingProps) {
  return (
    <div className={styles.landing}>
      <div className={styles.content}>
        <h1 className={styles.title}>BATTLESHIP</h1>
        <p className={styles.tagline}>Naval Warfare Strategy Game</p>

        <div className={styles.description}>
          <p>Place your ships strategically, then engage the enemy fleet in tactical combat.</p>
        </div>

        <div className={styles.difficultySection}>
          <h2 className={styles.sectionTitle}>Select Difficulty</h2>
          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={`${styles.btn} ${styles.easy}`}
              onClick={() => onStart('easy')}
            >
              <span className={styles.btnLabel}>Easy</span>
              <span className={styles.btnDesc}>Computer makes random moves</span>
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.hard}`}
              onClick={() => onStart('hard')}
            >
              <span className={styles.btnLabel}>Hard</span>
              <span className={styles.btnDesc}>Intelligent AI opponent</span>
            </button>
          </div>
        </div>

        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span className={styles.icon}>🚢</span>
            <span>Place 5 ships on the grid</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.icon}>🎯</span>
            <span>Find and sink enemy ships</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.icon}>⚔️</span>
            <span>Last fleet standing wins</span>
          </div>
        </div>
      </div>
    </div>
  )
}
