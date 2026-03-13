import { useEffect, useRef, useState } from 'react'
import styles from './HamburgerMenu.module.css'

export interface HamburgerMenuProps {
  onSettings: () => void
  onNewGame: () => void
  onAbout: () => void
}

/**
 * Hamburger menu for navigation and quick actions.
 */
export function HamburgerMenu({ onSettings, onNewGame, onAbout }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMenuItemClick = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <div ref={menuRef} className={styles.menu}>
      <button
        type="button"
        className={`${styles.hamburger} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span className={styles.line} />
        <span className={styles.line} />
        <span className={styles.line} />
      </button>

      {isOpen && (
        <nav className={styles.dropdown}>
          <ul className={styles.list}>
            <li>
              <button
                type="button"
                className={styles.item}
                onClick={() => handleMenuItemClick(onNewGame)}
              >
                <span className={styles.icon}>🎮</span>
                New Game
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.item}
                onClick={() => handleMenuItemClick(onSettings)}
              >
                <span className={styles.icon}>⚙️</span>
                Settings
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.item}
                onClick={() => handleMenuItemClick(onAbout)}
              >
                <span className={styles.icon}>ℹ️</span>
                About
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  )
}
