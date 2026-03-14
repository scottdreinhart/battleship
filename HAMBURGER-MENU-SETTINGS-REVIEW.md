# Hamburger Menu & Settings Screen Review

> Comparing Battleship against TicTacToe (gold standard) and other sibling repos.

---

## 📊 Current State Comparison

### **Battleship** ✅ Foundational, Needs Enhancement

**Current Architecture:**
- **App Screen Navigation**: Loading → Menu → Settings → Game (view-based routing)
- **Settings**: Full-screen `SettingsPanel` on menu screen only
- **In-Game Menu**: None — GameBoard has `onSettings` callback but unused
- **Missing**: In-game quick menu, hamburger button, dropdown behavior hook

**SettingsPanel** (src/ui/molecules/SettingsPanel.tsx):
- ✅ Game mode selector
- ✅ Difficulty selector (easy/medium/hard)  
- ✅ Display preferences
- ✅ Back button to return to menu
- ❌ No theme/sound/colorblind settings (these live in context)
- ❌ No quick-access in-game menu

---

### **TicTacToe** 🏆 Gold Standard

**Architecture:**
- **Dual-Menu System**: 
  1. **HamburgerMenu** — in-game quick settings (top-right header)
  2. **SettingsOverlay** — full-screen comprehensive settings (from menu)

**HamburgerMenu** (src/ui/molecules/HamburgerMenu.tsx):
```
┌─────────────────────────────────────┐
│ Score | Stats | [Hamburger Button]  │ ← Header
└─────────────────────────────────────┘
              ↓ (Portal to fixed position)
         ┌──────────────┐
         │ Difficulty ▼ │ ← Accessible while playing
         │ Series ▼     │
         │ Sound On/Off │
         │ Color Theme  │
         └──────────────┘
```

**Key Features:**
- ✅ 3-line icon animates to X (cubic-bezier spring)
- ✅ Portal-rendered dropdown (fixed position, above all elements)
- ✅ Positioned relative to button + board alignment
- ✅ Click-outside detection (useDropdownBehavior hook)
- ✅ Keyboard support (ESC to close, focus management)
- ✅ Touch-safe (no accidental gameplay triggers)
- ✅ Mobile-optimized (240px width, responsive top/left)

**SettingsOverlay** (src/ui/molecules/SettingsOverlay.tsx):
```
┌─────────────────────────────────────┐
│ ← Settings                          │
├─────────────────────────────────────┤
│ Difficulty    [Easy] [Medium] [Hard]│
│ Series        [1]    [3]     [5]    │
│ Sound         [On/Off]              │
│ Color Theme   [6 Options]           │
│ Display Mode  [Light/Dark/System]   │
│ Colorblind    [5 Options]           │
├─────────────────────────────────────┤
│                        [Cancel] [OK]│
└─────────────────────────────────────┘
```

**Key Features:**
- ✅ Full-screen modal (scrollable if needed)
- ✅ Organized sections (game / theme / accessibility)
- ✅ All context providers integrated (ThemeContext, etc.)
- ✅ Accessible radio/button groups
- ✅ Uses same atoms as HamburgerMenu (DifficultyToggle, SoundToggle, etc.)

---

## 🎯 Pattern for Implementation

Refer to TicTacToe's implementation in `src/ui/molecules/HamburgerMenu.tsx` and `src/app/useDropdownBehavior.ts` for the standard pattern used across all projects.

The dual-menu system (hamburger + full-screen modal) is the authoritative architecture for this repository.
