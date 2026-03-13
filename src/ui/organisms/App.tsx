import { useState } from 'react'
import { useGame } from '@/app/useGame'
import { useResponsiveState } from '@/app/useResponsiveState'
import { useSoundEffects } from '@/app/useSoundEffects'
import { SHIP_DEFS } from '@/domain/constants'
import {
  AboutModal,
  GameBoard,
  HamburgerMenu,
  Landing,
  SettingsModal,
  ShipList,
  Splash,
  StatusBar,
} from '@/ui/molecules'

import { cx } from '@/ui/utils/cssModules'
import styles from './App.module.css'

type AppScreen = 'splash' | 'landing' | 'game'

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('splash')
  const [showSettings, setShowSettings] = useState(false)
  const [showAbout, setShowAbout] = useState(false)

  const { state, placeCurrentShip, toggleOrientation, fire, newGame } = useGame()
  const sfx = useSoundEffects()
  const responsive = useResponsiveState()

  const handleSplashComplete = () => {
    sfx.onClick()
    setScreen('landing')
  }

  const handleDifficultySelect = () => {
    sfx.onConfirm()
    setScreen('game')
  }

  const handlePlayerBoardClick = (row: number, col: number) => {
    if (state.phase !== 'placement') {
      return
    }
    sfx.onSelect()
    placeCurrentShip(row, col)
  }

  const handleCpuBoardClick = (row: number, col: number) => {
    if (state.phase !== 'battle' || state.turn !== 'player') {
      return
    }
    sfx.onConfirm()
    fire(row, col)
  }

  const handleNewGame = () => {
    sfx.onClick()
    newGame()
    setScreen('landing')
  }

  const handleRotate = () => {
    sfx.onClick()
    toggleOrientation()
  }

  // Render splash screen
  if (screen === 'splash') {
    return <Splash onComplete={handleSplashComplete} />
  }

  // Render landing screen
  if (screen === 'landing') {
    return <Landing onStart={handleDifficultySelect} />
  }

  // Render main game
  return (
    <div
      className={cx(
        styles.app,
        responsive.compactViewport && styles.compact,
        responsive.touchOptimized && styles.touch,
      )}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>Battleship</h1>
        <HamburgerMenu
          onSettings={() => setShowSettings(true)}
          onNewGame={handleNewGame}
          onAbout={() => setShowAbout(true)}
        />
      </div>

      <StatusBar message={state.message} phase={state.phase} />

      {state.phase === 'placement' && (
        <div className={styles.controls}>
          <button type="button" className={styles.btn} onClick={handleRotate}>
            Rotate ({state.placementOrientation === 'horizontal' ? 'H' : 'V'})
          </button>
          <span className={styles.shipName}>
            {state.placementShipIndex < SHIP_DEFS.length &&
              SHIP_DEFS[state.placementShipIndex].name}
          </span>
        </div>
      )}

      <div className={styles.boards}>
        <div className={styles.boardColumn}>
          <GameBoard
            board={state.playerBoard}
            showShips
            onCellClick={state.phase === 'placement' ? handlePlayerBoardClick : undefined}
            disabled={state.phase !== 'placement'}
            label="Your Fleet"
            touchOptimized={responsive.touchOptimized}
          />
          <ShipList board={state.playerBoard} label="Your Ships" />
        </div>

        {state.phase !== 'placement' && (
          <div className={styles.boardColumn}>
            <GameBoard
              board={state.cpuBoard}
              showShips={state.phase === 'gameOver'}
              onCellClick={handleCpuBoardClick}
              disabled={state.phase === 'gameOver' || state.turn !== 'player'}
              label="Enemy Waters"
              touchOptimized={responsive.touchOptimized}
            />
            <ShipList board={state.cpuBoard} label="Enemy Ships" />
          </div>
        )}
      </div>

      {state.phase === 'gameOver' && (
        <button type="button" className={styles.newGameBtn} onClick={handleNewGame}>
          New Game
        </button>
      )}

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  )
}
