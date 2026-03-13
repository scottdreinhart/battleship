# Copilot Runtime Policy — Battleship

> **Authority**: This file is subordinate to `AGENTS.md`. If any rule here conflicts, `AGENTS.md` wins.

Default development shell for this repository: **Bash (WSL Ubuntu)**.

Do not default to PowerShell unless the task is specifically a Windows packaging workflow such as `electron:build:win`.

---

## Package Manager

**pnpm only.** Never use npm, npx, yarn, or generate non-pnpm lockfiles.

---

## Architecture (CLEAN + Atomic Design)

Three layers with strict import boundaries enforced by `eslint-plugin-boundaries`:

| Layer | Path | May Import |
|---|---|---|
| Domain | `src/domain/` | `domain/` only (zero framework deps) |
| App | `src/app/` | `domain/`, `app/` |
| UI | `src/ui/` | `domain/`, `app/`, `ui/` |
| Workers | `src/workers/` | `domain/` only |
| Themes | `src/themes/` | nothing (pure CSS) |

**Component hierarchy**: `atoms/ → molecules/ → organisms/`
**Data flow**: Hooks → Organism → Molecules → Atoms (unidirectional)

---

## Import Rules

- Use path aliases: `@/domain/...`, `@/app/...`, `@/ui/...`.
- Import from barrel `index.ts` files, not internal modules.
- Never use `../../` cross-layer relative imports.

---

## Key Scripts

| Task | Script |
|---|---|
| Dev server | `pnpm start` or `pnpm dev` |
| Build | `pnpm build` |
| Quality gate | `pnpm check` (lint + format:check + typecheck) |
| Auto-fix | `pnpm fix` (lint:fix + format) |
| Full validation | `pnpm validate` (check + build) |
| Clean | `pnpm clean` / `pnpm clean:node` / `pnpm clean:all` / `pnpm reinstall` |

Always prefer `pnpm <script>` over raw CLI commands when a matching script exists.

---

## Shell Routing

Default to **Bash (WSL: Ubuntu)** for all development work.

Use Bash for: installs, dev server, Vite builds, WASM builds, linting, formatting, typechecking, validation, cleanup, Electron dev/preview, Linux Electron packaging, Capacitor sync, docs, and maintenance.

Use **PowerShell** only for:
- `pnpm run electron:build:win`

Use **macOS** only for:
- `pnpm run electron:build:mac`
- `pnpm run cap:init:ios`, `pnpm run cap:open:ios`, `pnpm run cap:run:ios`

Use **Android SDK** only for:
- `pnpm run cap:init:android`, `pnpm run cap:open:android`, `pnpm run cap:run:android`

All other tasks must use **Bash**. Do not switch to PowerShell for ordinary development.

---

## Language Guardrails

Use the repository's approved languages only: HTML, CSS, JavaScript, TypeScript, AssemblyScript, WebAssembly.

Do not introduce orphaned helper scripts or alternate runtimes.

---

## Anti-Orphan-Script Policy

Every new script must: solve a real need, belong to approved languages, fit existing structure, not duplicate existing tooling, have clear purpose.

---

## UI Pattern Requirements

This game implements the **mandatory baseline UI patterns** defined in `.github/ui-patterns-governance.md`. All UI work must follow:

1. **Animated Splash Screen** — 2-3 sec game logo intro before landing screen
2. **Landing Screen** — difficulty selection (Easy/Hard) before game starts
3. **Settings Modal** — theme picker, sound volume, game rules (+ game-specific extensions)
4. **Hamburger Menu** — top-right navigation (New Game, Settings, About)
5. **About Modal** — game info, features, technology stack

All animations must respect `@media (prefers-reduced-motion: no-preference)` for accessibility.

See `.github/ui-patterns-governance.md` for complete specifications, implementation checklists, extensibility patterns, and CSS animation principles.

---

## Behavioral Rules

1. **Minimal change** — modify only what was requested; do not refactor, reorganize, or add dependencies unsolicited.
2. **Preserve style** — match existing code conventions, naming, and formatting.
3. **Cite governance** — if a request violates a rule, name the rule and suggest a compliant alternative.
4. **No new top-level directories** without explicit user instruction.
5. **Use existing scripts** from `package.json` before inventing CLI commands.

## Project Identity Rule

- Preserve project identity. Never rename the project or product to a framework, runtime, or tool name; treat that as forbidden.

## Input & UI Consistency

- Use shared keyboard controller hooks in `src/app` rather than per-component keydown listeners.
- Preserve standard game shell surfaces (splash, landing, HUD/scoreboard, settings menu, scores/history) unless explicitly asked to change them.

## Input Controls Directive (Mandatory)

- All input work must follow `.github/instructions/08-input-controls.instructions.md`.
- Input implementations must remain semantic-action-driven, platform-aware, text-input-safe, and TV-focus-compliant.
- `useKeyboardControls` is a keyboard adapter only; broader orchestration belongs in higher-level app hooks.

### Agent Checklist

- [ ] Use semantic actions as the primary integration surface.
- [ ] Preserve text-input safety and chat/input focus behavior.
- [ ] Keep `useKeyboardControls` as an adapter, not orchestration.
- [ ] Ensure mappings remain unsurprising across Desktop/Web/Mobile/TV.
