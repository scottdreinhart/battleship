import { useEffect, useRef, useState } from 'react'
import { useThemeContext } from '@/app/ThemeContext'
import { useSoundEffects } from '@/app/useSoundEffects'
import { COLOR_THEMES } from '@/domain/themes'
import styles from './SettingsModal.module.css'

export interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Settings modal for game preferences.
 * Includes sound volume, theme selection, and other options.
 */
export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, setColorTheme } = useThemeContext()
  const sfx = useSoundEffects()
  const [soundVolume, setSoundVolume] = useState(100)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [isOpen])

  const handleThemeChange = (themeId: string) => {
    sfx.onSelect()
    setColorTheme(themeId)
  }

  const handleVolumeChange = (volume: number) => {
    setSoundVolume(volume)
    sfx.onClick()
  }

  const handleClose = () => {
    sfx.onClick()
    onClose()
  }

  return (
    <dialog ref={dialogRef} className={styles.modal} onClick={handleClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Sound Volume</h3>
          <div className={styles.volumeControl}>
            <span className={styles.icon}>🔊</span>
            <input
              type="range"
              min="0"
              max="100"
              value={soundVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className={styles.slider}
              aria-label="Sound volume"
            />
            <span className={styles.volumeValue}>{soundVolume}%</span>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Theme</h3>
          <div className={styles.themeGrid}>
            {COLOR_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className={`${styles.themeButton} ${
                  settings.colorTheme === theme.id ? styles.active : ''
                }`}
                onClick={() => handleThemeChange(theme.id)}
                title={theme.label}
                aria-label={`Select ${theme.label} theme`}
              >
                <span
                  className={styles.themeSwatch}
                  style={{
                    backgroundColor: theme.accent,
                  }}
                />
                <span className={styles.themeName}>{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Game Rules</h3>
          <ul className={styles.rulesList}>
            <li>Place all 5 ships on your grid before battle begins</li>
            <li>Ships cannot touch or overlap</li>
            <li>Each turn, fire once at an opponent cell</li>
            <li>Destroy all opponent ships to win</li>
          </ul>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.closeButtonFooter} onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  )
}
