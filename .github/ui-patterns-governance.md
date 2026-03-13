# Game UI Patterns Governance

> **Effective**: March 12, 2026  
> **Scope**: All game projects across the games portfolio  
> **Authority**: This document defines mandatory UI/UX patterns for all game projects.  
> Referenced by: `AGENTS.md` § 10 (Game UI Requirements)

---

## 1. Purpose

This governance establishes a **consistent, professional UI/UX baseline** across all game projects. It ensures users experience familiar navigation patterns, animations, and settings workflows regardless of which game they play.

---

## 2. Mandatory UI Patterns

Every game project **MUST** implement:

### 2.1 Animated Splash Screen

**Purpose**: Create a professional first impression with branded game identity.

**Requirements**:
- Display for **2-3 seconds** before transitioning to landing
- **Animated logo** specific to the game (ships, cards, dice, pawns, etc.)
- Subtle animations (fade-in, pulse, grid effects, scale)
- Backdrop blur or gradient background matching game theme
- Smooth fade-out transition to landing screen

**Technical**:
- File: `src/ui/molecules/Splash.tsx` + `Splash.module.css`
- Use CSS keyframe animations (not JS-driven)
- Export interface: `{ onComplete: () => void }`
- Drop-shadow/glow effects for visual impact

**Example animations**:
- Grid flow with stroke-dasharray
- Logo scale + opacity
- Subtle element movement (ships, pieces, cards)
- Pulsing glow effects

---

### 2.2 Landing/Difficulty Screen

**Purpose**: Game start configuration and difficulty selection.

**Requirements**:
- **Difficulty options**: at least Easy/Hard (extensible)
- Game description and rules preview
- Visual quick-start icons/info
- Clear CTA button for each difficulty
- Respond to difficulty in later game logic

**Technical**:
- File: `src/ui/molecules/Landing.tsx` + `Landing.module.css`
- Export interface: `{ onStart: (difficulty: string) => void }`
- Accept difficulty as prop parameter
- Slide-up animations on load

**State Management**:
- Pass difficulty to `useGame()` hook or context
- AI should adjust targeting strategy based on difficulty
- Easy: random/naive tactics
- Hard: probability-density / intelligent tactics

---

### 2.3 Settings Modal (Baseline + Extensions)

**Purpose**: Unified game settings across all projects.

**Baseline Components** (ALL games):

| Setting | Component | Type | Notes |
|---|---|---|---|
| Sound Volume | Range slider | 0-100% | Affects all SFX |
| Theme Selection | Theme grid | Multi-button | All 7 color themes |
| Game Rules | Static list | Reference | Quick rules reminder |

**How to Extend**:
- Keep baseline sections intact
- Add game-specific sections after Rules
- Examples: Difficulty modifier, AI personality, animation speed, color-blind modes

**Example Extensions**:
- Chess: **Opening Book** (classical, modern, random)
- Poker: **Hand History** (track recent hands)
- Minesweeper: **Grid Size** (8x8, 10x10, 16x16)
- Checkers: **Variant** (English, International, etc.)

**Technical**:
- Base file: `src/ui/molecules/SettingsModal.tsx`
- Extend by adding `<div className={styles.section}>` blocks
- Import `useThemeContext()` and `useSoundEffects()`
- Use CSS Grid for consistent layout
- Dialog with backdrop blur

---

### 2.4 Hamburger Menu Navigation

**Purpose**: Quick access to game controls and settings.

**Baseline Items** (ALL games):

- 🎮 **New Game** — return to landing screen
- ⚙️ **Settings** — open settings modal
- ℹ️ **About** — open about modal

**How to Extend**:
- Add game-specific options between Settings and About
- Examples: Stats, achievements, leaderboards, help

**Technical**:
- File: `src/ui/molecules/HamburgerMenu.tsx` + `HamburgerMenu.module.css`
- Fixed position in header
- Click-outside to close
- Smooth animation on open/close (rotate icon + slide dropdown)

---

### 2.5 About Modal

**Purpose**: Game information, features, and technology credits.

**Sections**:
- Game title + tagline
- About (description)
- Features (bulleted list, game-specific)
- Technology (React, TypeScript, WASM if applicable)
- Copyright/Creator info

**Extensibility**:
- Game-specific features list
- Custom technology stacks
- Credits for game design/art

---

## 3. App Layout Pattern

```
<ThemeProvider>
  <SoundProvider>
    <ErrorBoundary>
      <App />  ← Manages screen transitions
        ├─ <Splash />      (2-3 sec, then onComplete)
        ├─ <Landing />     (difficulty select, then onStart)
        └─ <GameScreen /> (with <HamburgerMenu />, <SettingsModal />, <AboutModal />)
    </ErrorBoundary>
  </SoundProvider>
</ThemeProvider>
```

**State Management in App**:
```typescript
type AppScreen = 'splash' | 'landing' | 'game'
const [screen, setScreen] = useState<AppScreen>('splash')
const [showSettings, setShowSettings] = useState(false)
const [showAbout, setShowAbout] = useState(false)
```

---

## 4. Theming & Color System

All games use the same **7 color themes**:

| ID | Name | Accent Color | Hex |
|---|---|---|---|
| rose | Rose Garden | #ff6b9d | |
| chiba | Chiba Nights | #ff6584 | |
| ocean | Ocean Depths | #0096d9 | |
| forest | Forest Glade | #22bb88 | |
| sunset | Sunset Blaze | #ff8844 | |
| midnight | Midnight Blue | #1a3a52 | |
| highcontrast | High Contrast | #ffff00 | |

**CSS Variables**:
- `--accent`: theme accent color
- `--bg-image`: background image/gradient
- Theme-specific layer stacks via CSS custom properties

**Import**: `@/domain/themes` exports `COLOR_THEMES` array

---

## 5. Animation Principles

All UI animations follow these principles:

### Consistency
- Use `cubic-bezier(0.34, 1.56, 0.64, 1)` for bouncy spring feel
- Use `ease-in-out` for smooth transitions
- Duration: 0.2s - 0.3s for micro-interactions, 0.6s - 1s for major transitions

### Accessibility
- Gate all transitions behind `@media (prefers-reduced-motion: no-preference)`
- Hover effects gated behind `@media (hover: hover)` for devices without hover
- No auto-play animations that distract (splash screen is acceptable one-time)

### Touch Optimization
- Buttons: min 44px x 44px touch targets
- Use `.touch` class (from `useResponsiveState`) for larger padding/font sizes
- Avoid hover-based tooltips; use long-press or modal alternatives

---

## 6. Implementation Checklist

### For New Game Projects

- [ ] Create `src/ui/molecules/Splash.tsx` with game-specific logo animation
- [ ] Create `src/ui/molecules/Landing.tsx` with difficulty options
- [ ] Copy `src/ui/molecules/SettingsModal.tsx` baseline
- [ ] Copy `src/ui/molecules/HamburgerMenu.tsx` baseline
- [ ] Copy `src/ui/molecules/AboutModal.tsx` and customize
- [ ] Update `src/ui/molecules/index.ts` to export all five components
- [ ] Update `src/ui/organisms/App.tsx` to manage screen states and modals
- [ ] Add header styling to `App.module.css` (header flex layout with title + menu)
- [ ] Integrate `useGame()` (or equivalent) with difficulty parameter
- [ ] Test transitions: Splash → Landing → Game → Settings/About modals
- [ ] Verify animations respect `prefers-reduced-motion`
- [ ] Check touch targets on mobile (44px minimum)

### For Updating Existing Games

- [ ] Add Splash screen if missing
- [ ] Implement Landing screen with difficulty selection
- [ ] Refactor App.tsx to manage screen state
- [ ] Adopt baseline SettingsModal + extend with game-specific options
- [ ] Integrate HamburgerMenu into game header
- [ ] Test full flow on desktop + mobile

---

## 7. CSS Module Structure

**Splash.module.css**:
- `.splash` — container with backdrop
- `.container` — centered content
- `.logoWrapper` — SVG wrapper with animations
- `.title`, `.subtitle` — text styling

**Landing.module.css**:
- `.landing` — full-screen container
- `.buttonGroup` — difficulty button layout
- `.btn.easy`, `.btn.hard` — difficulty-specific styles
- `.info` — game overview cards

**SettingsModal.module.css**:
- `.modal` — dialog backdrop
- `.section` — grouped settings
- `.themeGrid` — theme selector grid
- `.slider` — custom range input styling

**HamburgerMenu.module.css**:
- `.hamburger` — icon button with animated lines
- `.dropdown` — dropdown menu container
- `.item` — menu item hover states

---

## 8. Conditional Logic Pattern

All games should pass difficulty to their AI/CPU logic:

```typescript
// In useGame() or equivalent
const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('hard')

// On landing difficulty select
const handleDifficultySelect = (diff) => {
  setDifficulty(diff)
  setScreen('game')
}

// In AI move selection
function getCpuMove(board: Board, difficulty: string) {
  if (difficulty === 'easy') {
    return getRandomMove(board)  // Naive/random
  }
  return getIntelligentMove(board)  // Probability-weighted, strategic, etc.
}
```

---

## 9. Governance Binding

This standard is **mandatory** for all game projects. Violations require:
1. Approval from architecture review
2. Documentation of exceptions in project AGENTS.md
3. Justification in pull request description

All AGENTS.md files must reference this document in section § 10 (Game UI Requirements).

---

## 10. Evolution & Updates

This governance document is **living**. Updates require:
1. Consensus from game project maintainers
2. Update across ALL affected repositories
3. Bump effective date and version
4. Communicate changes via team channels

**Last Updated**: March 12, 2026
