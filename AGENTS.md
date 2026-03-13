# AGENTS.md — Repository Governance Constitution

> **Scope**: Repository-wide. This file is the top-level authority for every AI agent,
> IDE assistant, CLI tool, and CI pipeline operating in this repository.
> All other governance files inherit from and must not contradict this document.

---

## 1. Governance Precedence

1. **AGENTS.md** (this file) — supreme authority; overrides all other governance files.
2. `.github/copilot-instructions.md` — repo-wide Copilot runtime policy.
3. `.github/instructions/*.instructions.md` — scoped, numbered instruction files.
4. `docs/**` — human-readable reference documents (informational, not directive).

If any scoped file contradicts AGENTS.md, AGENTS.md wins.

---

## 2. Absolute Package-Manager Rule

This repository uses **pnpm exclusively**.

| Field | Value |
|---|---|
| `packageManager` | `pnpm@10.31.0` |
| `engines.node` | `24.14.0` |
| `engines.pnpm` | `10.31.0` |

### Mandatory

- Use `pnpm install`, `pnpm add`, `pnpm remove`, `pnpm update`, `pnpm exec`, `pnpm run <script>`.
- Preserve `pnpm-lock.yaml` and `pnpm-workspace.yaml`.

### Forbidden

- Never use `npm`, `npx`, `yarn`, or any non-pnpm package manager.
- Never generate `package-lock.json` or `yarn.lock`.
- Never suggest `npm install`, `npm run`, `npx`, or Yarn workflows.

---

## 3. Architecture Preservation

This project enforces **CLEAN Architecture** with three layers:

| Layer | Path | May Import | Must Not Import |
|---|---|---|---|
| **Domain** | `src/domain/` | `domain/` only | `app/`, `ui/`, React, any framework |
| **App** | `src/app/` | `domain/`, `app/` | `ui/` |
| **UI** | `src/ui/` | `domain/`, `app/`, `ui/` | — |
| **Workers** | `src/workers/` | `domain/` only | `app/`, `ui/`, React |
| **Themes** | `src/themes/` | nothing (pure CSS) | everything |

### Component Hierarchy (Atomic Design)

ui/atoms/ → ui/molecules/ → ui/organisms/

Data flows unidirectionally: **Hooks → Organism → Molecules → Atoms**.

### Import Conventions

- Use path aliases: `@/domain`, `@/app`, `@/ui` (configured in `tsconfig.json` and `vite.config.js`).
- Every directory exposes a barrel `index.ts`. Import from the barrel, not internal files.
- Never introduce `../../` cross-layer relative imports.

---

## 4. Path Discipline

| Path | Purpose |
|---|---|
| `src/domain/` | Pure, framework-agnostic game logic |
| `src/app/` | React hooks, context providers, services |
| `src/ui/atoms/` | Smallest reusable UI primitives |
| `src/ui/molecules/` | Composed atom groups |
| `src/ui/organisms/` | Full feature components |
| `src/themes/` | Lazy-loaded CSS theme files |
| `src/wasm/` | WASM AI loader + fallback |
| `src/workers/` | Web Worker entry points |
| `electron/` | Electron main + preload |
| `assembly/` | AssemblyScript source |
| `scripts/` | Build-time Node scripts |
| `public/` | Static assets (manifest, SW, offline page) |
| `dist/` | Vite build output (gitignored) |
| `release/` | Electron Builder output (gitignored) |
| `docs/` | Human-readable documentation |

Do not invent new top-level directories without explicit user instruction.

---

## 5. Cross-platform shell governance

This repository enforces strict shell usage rules to ensure builds and scripts run in the correct environment and to prevent cross-shell command drift.

### Linux builds and development

Linux builds and general development workflows must use **Bash**.

In this repository, Bash is normally provided through:

- **WSL: Ubuntu** (default on Windows development machines)
- native Linux environments
- CI Linux runners

Use Bash for:

- dependency installation (`pnpm install`)
- development server execution (`pnpm run dev`, `pnpm run start`)
- Vite builds (`pnpm run build`, `pnpm run preview`, `pnpm run build:preview`)
- WASM builds (`pnpm run wasm:build`, `pnpm run wasm:build:debug`)
- linting (`pnpm run lint`, `pnpm run lint:fix`)
- formatting (`pnpm run format`, `pnpm run format:check`)
- typechecking (`pnpm run typecheck`)
- validation (`pnpm run check`, `pnpm run fix`, `pnpm run validate`)
- cleanup (`pnpm run clean`, `pnpm run clean:node`, `pnpm run clean:all`, `pnpm run reinstall`)
- Electron development mode (`pnpm run electron:dev`, `pnpm run electron:preview`)
- Linux Electron packaging (`pnpm run electron:build:linux`)
- Capacitor sync (`pnpm run cap:sync`)
- general source editing, documentation, and repository maintenance

If the task is not explicitly a Windows-native or macOS-native packaging task, use Bash.

### Windows builds

Use **PowerShell** only when the task is explicitly Windows-native Electron packaging:

- `pnpm run electron:build:win`

PowerShell is **not** the default shell. Do not use PowerShell for installs, linting, formatting, typechecking, general Vite development, ordinary web builds, docs, cleanup, WASM builds, or Electron dev mode.

### macOS and iOS builds

Use a **native or remote macOS** environment only for:

- `pnpm run electron:build:mac`
- `pnpm run cap:init:ios`
- `pnpm run cap:open:ios`
- `pnpm run cap:run:ios`

iOS builds require Apple hardware. Never suggest iOS commands unless macOS availability is confirmed.

### Android builds

Use an **Android-capable environment** (with Android SDK) only for:

- `pnpm run cap:init:android`
- `pnpm run cap:open:android`
- `pnpm run cap:run:android`

### Shell routing summary

| Environment | Tasks |
|---|---|
| **Bash** (WSL / Linux / CI) | All general development, builds, quality checks, WASM, Electron dev, Linux packaging, Capacitor sync |
| **PowerShell** | `electron:build:win` only |
| **macOS** | `electron:build:mac`, iOS Capacitor tasks |
| **Android SDK** | Android Capacitor tasks |

### Decision rule

Before suggesting commands, determine:

1. General development or maintenance → use **Bash**
2. Windows Electron packaging → use **PowerShell**
3. macOS Electron packaging or iOS work → use **macOS**
4. Android native work → use **Android-capable environment**
5. Everything else → use **Bash**

### Hard-stop rules

Never:
- default to PowerShell for routine development
- present PowerShell as interchangeable with Bash for ordinary tasks
- switch to PowerShell unless the task is Windows-native Electron packaging
- claim iOS tasks can run fully from Windows or WSL
- use the wrong shell when the repository already defines the correct route
- introduce cross-shell command drift

### Required self-check

Before responding, verify:
- Is this an ordinary dev task? → use **Bash** (WSL: Ubuntu on Windows)
- Is this specifically Electron Windows packaging? → use **PowerShell**
- Is this specifically Electron macOS packaging or iOS work? → use **macOS**
- Is this Android native work? → use **Android-capable environment**
- Otherwise → use **Bash**

---

## 6. Language, Syntax, and Script Governance

### Approved primary languages

The preferred and authoritative implementation languages for this repository are:

- HTML
- CSS
- JavaScript
- TypeScript
- AssemblyScript
- WebAssembly

### Language priority order

1. TypeScript
2. JavaScript
3. HTML
4. CSS
5. AssemblyScript
6. WebAssembly

### Default implementation rule

Before creating new code, first ask:

- Can this be done in the existing TypeScript or JavaScript application layer?
- Can this be done inside the current HTML/CSS frontend?
- Does this belong in the existing AssemblyScript/WASM path already defined by the repository?

If yes, do that. Do not introduce a different language or runtime.

### No orphaned scripts rule

Do not create one-off scripts, helper files, or ad hoc automation in random languages.
Never introduce orphaned scripts in languages outside the approved stack unless explicitly requested.

### No parallel toolchain rule

Do not create parallel implementations of the same concern in multiple languages.
There should be one clear implementation path per responsibility.

### File placement and responsibility rule

New files must live in the correct existing system:
- `src/` for app code
- `src/domain/` for pure domain logic
- `src/app/` for hooks, orchestration, services, side effects, and context
- `src/ui/` for UI components
- `assembly/` for AssemblyScript sources
- `scripts/` for approved Node-based build or tooling scripts
- `public/` for static assets

Do not create random utility scripts at repository root.

### Anti-orphan-script policy

Every new script must satisfy all of the following:
- it solves a real repository need
- it belongs to the approved language stack
- it fits the existing project structure
- it is callable from the existing package-script workflow when appropriate
- it does not duplicate an existing script, config, or toolchain
- it has a clear long-term owner and purpose

If a proposed script fails any of these checks, do not create it.

### Hard-stop rules

Never:
- introduce non-approved languages for ordinary repository tasks
- create helper scripts in random languages
- create duplicate build or tooling paths
- scatter automation across multiple runtimes
- bypass the existing TypeScript/JavaScript/AssemblyScript/WASM architecture
- invent a second way to do the same task when the repo already has a governed path

---

## 7. Minimal-Change Principle

- Modify only what the user requested.
- Do not refactor, reformat, or reorganize code beyond the scope of the task.
- Do not add dependencies, files, or scripts unless explicitly asked.
- Do not remove existing functionality to "simplify" unless instructed.
- Preserve existing code style, naming conventions, and file organization.

---

## 8. Response Contract

When producing code or commands:
1. **Use pnpm** — never npm, npx, or yarn.
2. **Respect layer boundaries** — never import across forbidden boundaries.
3. **Use path aliases** — `@/domain/...`, `@/app/...`, `@/ui/...`.
4. **Use existing scripts** — prefer `pnpm <script>` from package.json over raw CLI commands.
5. **Target the correct shell** — see §5.
6. **Cite governance** — if a user request would violate governance, explain which rule blocks it and suggest a compliant alternative.

---

## 9. Self-Check Before Every Response

Before emitting any code, command, or file change, verify:

- [ ] Am I using `pnpm` (not npm/npx/yarn)?
- [ ] Does my import respect the layer boundary table in §3?
- [ ] Am I using path aliases, not relative cross-layer imports?
- [ ] Am I targeting the correct shell/environment per §5?
- [ ] Am I using an approved language per §6?
- [ ] Am I avoiding orphaned scripts and parallel toolchains per §6?
- [ ] Does every new script pass the anti-orphan-script policy in §6?
- [ ] Am I modifying only what was requested per §7?
- [ ] Does my output match an existing `package.json` script where applicable?

If any check fails, fix it before responding.

---

## 10. Game UI Requirements

**Authority**: `.github/ui-patterns-governance.md` (see below for full reference).

This project implements the **mandatory game UI pattern baseline** required across all game projects. The following components are normative:

### Mandatory UI Components

| Component | File | Purpose |
|---|---|---|
| **Splash Screen** | `src/ui/molecules/Splash.tsx` | 2-3 sec animated logo intro |
| **Landing Screen** | `src/ui/molecules/Landing.tsx` | Difficulty selection & game info |
| **Settings Modal** | `src/ui/molecules/SettingsModal.tsx` | Theme, sound, rules (baseline + extensible) |
| **Hamburger Menu** | `src/ui/molecules/HamburgerMenu.tsx` | New Game / Settings / About navigation |
| **About Modal** | `src/ui/molecules/AboutModal.tsx` | Game info, features, technology |

### Screen Transition Flow

```
Splash (2-3s) → Landing (difficulty select)
             → Game Screen (with HamburgerMenu)
                 ↓
              SettingsModal / AboutModal (on demand)
```

### App State Management

```typescript
type AppScreen = 'splash' | 'landing' | 'game'
// Managed in src/ui/organisms/App.tsx
```

### Required Patterns

1. **Animated Logo**: Game-specific SVG or canvas animation (ships, cards, dice, pawns, etc.)
2. **Difficulty Integration**: Pass difficulty to game logic (`easy` = naive AI, `hard` = intelligent AI)
3. **Theme Consistency**: Use colors from `@/domain/themes` (7 standard color themes)
4. **Sound Integration**: Use `useSoundEffects()` for button clicks, transitions
5. **Responsive Design**: Use `useResponsiveState()` for mobile/desktop layouts
6. **Accessibility**: Gate animations behind `@media (prefers-reduced-motion: no-preference)`

### Extensibility

The baseline is intentionally extensible:
- **SettingsModal**: Add game-specific sections after Rules (grid size, variant selection, AI personality, etc.)
- **HamburgerMenu**: Add game-specific menu items between Settings and About
- **AboutModal**: Customize features list and technology stack
- **Splash Logo**: Create unique animation for each game

### Full Documentation

See `.github/ui-patterns-governance.md` for:
- Complete component specifications
- CSS animation principles
- Touch optimization guidelines
- Implementation checklist
- Extension patterns by game type
- Accessibility requirements

---

## Governance Binding

This standard is **mandatory**. All games must implement these patterns before production release. Exceptions require written approval and documentation in the project-specific AGENTS.md.

---

## 11. AI Orchestration Governance

All game projects must implement **scale-aware AI orchestration** that chooses the
simplest execution model that does not block the UI.

### Mandatory

- Implement a synchronous AI entry point such as `computeAiMove` or `computeAIMoves`
  for low-latency scenarios.
- Implement an asynchronous AI entry point such as `computeAiMoveAsync` or an
  equivalent worker-backed service for medium/high-complexity scenarios.
- Prefer **WASM-first** execution where feasible, with a **JS fallback** that preserves
  correctness when WASM or workers are unavailable.
- Gracefully fall back from worker-backed execution to synchronous execution rather
  than crashing or leaving the UI stuck.
- Add tests that validate both sync and async paths, including equivalence for
  deterministic AI and fallback behavior when workers are unavailable.
- Document the complexity decision in the AI engine/service module, including why a
  project uses sync-only, optional async, or async-required execution.

### Performance Guardrails

- Prefer synchronous main-thread AI when decision time is reliably under `10ms`.
- If measured decision time exceeds `10ms`, profile whether worker-backed execution
  improves responsiveness.
- Synchronous AI paths should complete in under `100ms` for expected gameplay.
- Asynchronous AI paths should complete in under `500ms`, including worker overhead,
  for expected gameplay.

### Architectural Intent

- Small fixed-complexity games such as 3×3 tic-tac-toe may correctly choose sync
  main-thread WASM as the default path.
- Larger or state-dependent games should expose async orchestration so UI responsiveness
  does not regress as search depth or board size grows.
- Keep AI computation logic in `src/domain/` where practical, orchestration in
  `src/app/`, worker entry points in `src/workers/`, and WASM loaders in `src/wasm/`.

## Project Identity Security Rule

- Never rename the project, product, app, or package identity to the name of an implementation technology, framework, runtime, or tool used to build it.
- Treat project-identity rewrites based on underlying technology labels as a security and governance violation.
- Preserve user-defined product names unless the user explicitly requests a rename.

## Input & UI Consistency Mandate

- Use centralized keyboard controller hooks in `src/app` (e.g., `useKeyboardControls` or equivalent) instead of scattering key listeners across UI components.
- Avoid direct per-component `document.addEventListener('keydown', ...)` unless wrapped by a shared hook.
- Keep movement/action mappings consistent where mechanics allow (Arrow keys + WASD and documented action keys).
- Maintain standard game shell surfaces where applicable: splash, landing, HUD/scoreboard, settings menu, and scores/history.

---

## Input Controls Directive (Mandatory)

- The full cross-platform input architecture directive is defined in `.github/instructions/08-input-controls.instructions.md`.
- All agent-authored input changes MUST comply with that directive, including semantic action modeling, context-aware behavior, text-input safety, repeat/phase handling, and TV-first focus requirements.
- In conflicts between implementation convenience and directive compliance, directive compliance wins.
- `useKeyboardControls` MUST remain a keyboard adapter (not a monolithic input system); broader orchestration belongs in higher-level app hooks.

### Agent Checklist

- [ ] Input mappings dispatch semantic actions, not raw device events in UI/game logic.
- [ ] Keyboard mappings prefer `event.code` for game controls (WASD, arrows, space, enter).
- [ ] Text-entry safety is preserved (no accidental gameplay triggers while typing).
- [ ] Context-sensitive behavior is explicit (gameplay/menu/chat/modal/disabled).
- [ ] Repeat and key phase (`keydown`/`keyup`) behavior is intentional per action.
- [ ] TV baseline navigation works with D-pad + OK + Back semantics.
