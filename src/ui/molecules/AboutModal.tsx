import { useEffect, useRef } from 'react'
import styles from './AboutModal.module.css'

export interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * About modal — game information and credits.
 */
export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [isOpen])

  return (
    <dialog ref={dialogRef} className={styles.modal} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className={styles.body}>
          <h1 className={styles.title}>Battleship</h1>
          <p className={styles.version}>Classic Naval Warfare Strategy Game</p>

          <div className={styles.section}>
            <h3 className={styles.heading}>About</h3>
            <p className={styles.text}>
              A digital implementation of the classic naval strategy game. Place your fleet
              strategically and engage in tactical combat against an intelligent AI opponent.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>Features</h3>
            <ul className={styles.list}>
              <li>Strategic ship placement phase</li>
              <li>AI opponent with probability density targeting</li>
              <li>Multiple difficulty levels</li>
              <li>Multiple color themes</li>
              <li>Sound effects and music controls</li>
              <li>Responsive design for all devices</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>Technology</h3>
            <ul className={styles.techList}>
              <li>React 19 with TypeScript</li>
              <li>AssemblyScript WASM AI engine</li>
              <li>Web Workers for background processing</li>
              <li>Vite build tool</li>
              <li>CSS Modules with responsive design</li>
            </ul>
          </div>

          <div className={styles.footer}>
            <p className={styles.copyright}>
              © 2026 Battleship Game
              <br />
              Built with ⚔️ and 🎮
            </p>
          </div>
        </div>
      </div>
    </dialog>
  )
}
