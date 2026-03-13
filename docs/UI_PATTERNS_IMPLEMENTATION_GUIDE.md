# Game UI Patterns Implementation Guide

## Quick Start: Copy Baseline Components to Your Game

This guide shows how to adapt battleship's UI patterns to your game project.

### Step 1: Copy Base Components

From battleship's `src/ui/molecules/`:
```
Splash.tsx + Splash.module.css
Landing.tsx + Landing.module.css  
SettingsModal.tsx + SettingsModal.module.css
HamburgerMenu.tsx + HamburgerMenu.module.css
AboutModal.tsx + AboutModal.module.css
```

Into your game's `src/ui/molecules/`.

### Step 2: Customize Each Component

#### Splash.tsx
Replace the SVG inside with your game's logo:
```typescript
// Instead of ships and explosions, use:
// - Chess: ♚♕ pieces
// - Poker: ♠♥ cards
// - Minesweeper: 💣 mine
// - Checkers: circles/discs
```

**Key**: Keep the animations and fade-out timing.

#### Landing.tsx
Game description is already extensible:
```typescript
// Change these strings:
"BATTLESHIP" // → "Your Game Title"
"Naval Warfare Strategy Game" // → your game's tagline
// The difficulty buttons (Easy/Hard) stay the same
```

#### SettingsModal.tsx
**Baseline stays identical** — add game-specific sections:

```typescript
<div className={styles.section}>
  <h3 className={styles.sectionTitle}>Your Custom Section</h3>
  {/* Add grid-size select, variant picker, etc. */}
</div>
```

Examples:
- Chess: `Opening Book Selection` (Classical, Modern, Random)
- Poker: `Hand History Tracking` (On/Off)
- Minesweeper: `Grid Difficulty` (8x8, 10x10, 16x16)

#### HamburgerMenu.tsx
**No changes needed** — fully reusable.

#### AboutModal.tsx
Customize these sections:
```typescript
"BATTLESHIP" → "Your Game Name"
"Naval Warfare Strategy Game" → description
// Update features list
// Update technology list if different stack
```

### Step 3: Update App.tsx

1. Import all five components
2. Add `AppScreen` state type
3. Manage transitions:
```typescript
type AppScreen = 'splash' | 'landing' | 'game'
const [screen, setScreen] = useState<AppScreen>('splash')
const [showSettings, setShowSettings] = useState(false)
const [showAbout, setShowAbout] = useState(false)

// Render Splash → Landing → Game with modals
```

4. Wrap App output in header with hamburger menu:
```tsx
<div className={styles.header}>
  <h1 className={styles.title}>Your Game</h1>
  <HamburgerMenu 
    onSettings={() => setShowSettings(true)}
    onNewGame={handleNewGame}
    onAbout={() => setShowAbout(true)}
  />
</div>
```

### Step 4: Integrate Difficulty into Game Logic

In your game hook (e.g., `useGame()`):

```typescript
interface UseGameReturn {
  state: GameState
  difficulty: 'easy' | 'hard'
  setDifficulty: (d: 'easy' | 'hard') => void
  // ... other methods
}

export function useGame(): UseGameReturn {
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('hard')
  // ...
  
  // Pass difficulty to CPU/AI logic
  const getCpuMove = () => {
    return difficulty === 'easy' 
      ? getRandomMove(state.board)
      : getSmartMove(state.board)  // AI, ML, WASM, etc.
  }
}
```

### Step 5: Update Molecules Barrel

In `src/ui/molecules/index.ts`:
```typescript
export { AboutModal } from './AboutModal'
export { GameBoard } from './GameBoard'  // your existing
export { HamburgerMenu } from './HamburgerMenu'
export { Landing } from './Landing'
export { SettingsModal } from './SettingsModal'
export { Splash } from './Splash'
export { YourGameComponents } from './...'  // all your game-specific molecules
```

### Step 6: Update Governance

In your game's `AGENTS.md`, add this section before the end:

```markdown
## 10. Game UI Requirements

**Authority**: `.github/ui-patterns-governance.md`

This project implements the mandatory baseline UI patterns:
- Splash Screen: `src/ui/molecules/Splash.tsx`
- Landing Screen: `src/ui/molecules/Landing.tsx`
- Settings Modal: `src/ui/molecules/SettingsModal.tsx` (+ custom sections)
- Hamburger Menu: `src/ui/molecules/HamburgerMenu.tsx`
- About Modal: `src/ui/molecules/AboutModal.tsx`

See `.github/ui-patterns-governance.md` for full specifications.
```

And add to `.github/copilot-instructions.md`:

```markdown
## UI Pattern Requirements

This game implements the mandatory baseline UI patterns defined in `.github/ui-patterns-governance.md`:
- Animated splash screen with game logo
- Landing screen with difficulty selection
- Settings modal (theme + sound + rules + game-specific options)
- Hamburger menu navigation
- About modal

All animations respect `@media (prefers-reduced-motion: no-preference)`.
```

### Step 7: Test the Flow

```
pnpm dev
# 1. See splash screen (2-3 sec)
# 2. Transition to landing screen  
# 3. Select difficulty
# 4. Game starts with hamburger menu in header
# 5. Click hamburger → click Settings
#    - Change theme → game updates
#    - Adjust volume
#    - Add game-specific custom settings
# 6. Navigate: New Game → back to landing
```

### Step 8: Validation

```bash
pnpm typecheck    # No errors
pnpm lint         # No errors
pnpm build        # Success
```

---

## Customization Examples

### Chess: Add Opening Book Selection

In `SettingsModal.tsx`, after the Game Rules section:

```tsx
<div className={styles.section}>
  <h3 className={styles.sectionTitle}>Opening Book</h3>
  <div className={styles.buttonGroup}>
    {['Classical', 'Modern', 'Random'].map(book => (
      <button
        key={book}
        onClick={() => setOpeningBook(book)}
        className={selectedBook === book ? styles.active : ''}
      >
        {book}
      </button>
    ))}
  </div>
</div>
```

### Minesweeper: Add Grid Size Selection

```tsx
<div className={styles.section}>
  <h3 className={styles.sectionTitle}>Grid Size</h3>
  <div className={styles.buttonGroup}>
    {[{ label: 'Small', size: 8 }, { label: 'Medium', size: 10 }, 
      { label: 'Large', size: 16 }].map(opt => (
      <button key={opt.label} onClick={() => setGridSize(opt.size)}>
        {opt.label} ({opt.size}×{opt.size})
      </button>
    ))}
  </div>
</div>
```

### Poker: Add Hand History Tracking

```tsx
<div className={styles.section}>
  <h3 className={styles.sectionTitle}>Hand History</h3>
  <label>
    <input 
      type="checkbox" 
      checked={trackHands}
      onChange={(e) => setTrackHands(e.target.checked)}
    />
    Track recent hands
  </label>
</div>
```

---

## Animation Principles

### Splash Screen
- Grid flow: `stroke-dasharray` animation
- Logo: `scale(0.8) → scale(1)` with `cubic-bezier(0.34, 1.56, 0.64, 1)`
- Fade out: Last 0.5s of 2.5s total
- Supports both SVG (vector) and Canvas (bitmap) logos

### Landing Screen
- Slide up: `transform: translateY(30px)` → `0` over 0.6s
- Stagger children: 0.1s delays (splash complete → landing appear smooth)
- Button hover: Scale + shadow + color shift

### Modals
- Backdrop blur: `blur(4px)`
- Content scale: `scale(0.95)` → `scale(1)`
- Duration: 0.3s with `cubic-bezier(0.34, 1.56, 0.64, 1)`

### All
- Respect `@media (prefers-reduced-motion: no-preference)`
- Hover states gated behind `@media (hover: hover)`
- Touch targets ≥ 44px

---

## File Structure Reference

```
your-game/
├── .github/
│   ├── AGENTS.md (add § 10)
│   ├── copilot-instructions.md (add "UI Pattern Requirements")
│   └── ui-patterns-governance.md (copy from battleship)
├── src/
│   ├── domain/
│   │   ├── types.ts (ensure Difficulty type if used)
│   │   └── themes.ts (already has COLOR_THEMES)
│   ├── app/
│   │   ├── useGame.ts (or equivalent — add difficulty param)
│   │   ├── useTheme.ts (no changes)
│   │   ├── useSoundEffects.ts (no changes)
│   │   └── ThemeContext.tsx (no changes)
│   └── ui/
│       ├── molecules/
│       │   ├── Splash.tsx ← COPY & CUSTOMIZE LOGO
│       │   ├── Splash.module.css ← COPY
│       │   ├── Landing.tsx ← COPY & CUSTOMIZE TEXT
│       │   ├── Landing.module.css ← COPY
│       │   ├── SettingsModal.tsx ← COPY & EXTEND
│       │   ├── SettingsModal.module.css ← COPY
│       │   ├── HamburgerMenu.tsx ← COPY
│       │   ├── HamburgerMenu.module.css ← COPY
│       │   ├── AboutModal.tsx ← COPY & CUSTOMIZE
│       │   ├── AboutModal.module.css ← COPY
│       │   ├── index.ts ← ADD TO EXPORTS
│       │   └── [your game components]
│       └── organisms/
│           ├── App.tsx ← REFACTOR FOR SCREEN STATES
│           └── App.module.css ← ADD HEADER STYLES
```

---

## Support & Questions

Refer to:
- `.github/ui-patterns-governance.md` — Complete specifications
- `battleship/src/ui/molecules/*` — Reference implementations
- This file — Adaptation guide

Last updated: March 12, 2026
