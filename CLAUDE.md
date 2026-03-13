# Habit Tracker — Claude Instructions

## Project Overview
A React SPA habit tracking app with gamification (XP/levels). Frontend only — the backend API is a separate repo. Auth and DB via Supabase. See `src/` for all source code.

## Developer Profile
- Senior/expert React developer — skip basic explanations, use precise terminology
- Familiar with Supabase, Framer Motion, Recharts, React Router

## Git Workflow
- Primary working branches: `local` or `feature/<description>`
- Merge `local`/`feature` → `dev` for test deployment
- Merge `dev` → `main` for production
- **Never force push.** Confirm with the user before any destructive git operation.
- PRs target `dev`, not `main`.

## Code Change Philosophy
- **Focused by default:** Only touch what was asked. Avoid scope creep.
- **Leave no dead code:** If we iterate and replace something, delete the old version — don't leave remnants, commented-out code, or unused imports.
- **Recommend refactors proactively** when you notice an opportunity, but wait for explicit confirmation before proceeding with any refactor.
- Do not add docstrings, comments, or type annotations to code you didn't change.

## Architecture Constraints — Always Respect
1. **State via Context API only.** No Redux, Zustand, or other state libraries.
2. **API calls in `/src/api/` only.** Never call Axios or Supabase directly from components or pages. All data fetching goes through the api layer.
3. **No new npm dependencies** without explicit user approval. Surface the package and its purpose in the planning/spec phase and get approval before installing.
4. **CSS files per component.** No inline `style={{...}}` on JSX elements.

## Before Making Changes
Always do all three before touching code:
1. **Read related files** — understand all components, hooks, and contexts that touch the feature
2. **Check git history** — `git log` and `git blame` to understand why things are the way they are
3. **Ask for intent** — clarify the goal before implementing if there's any ambiguity

## Handling Ambiguity
**Ask first, always.** Do not make assumptions on unclear tasks. Clarify intent before writing any code.

## Testing & Docker
- No automated tests currently written.
- Proactively identify **high-value test opportunities** (critical flows, regression-prone logic) and surface them to the user.
- When the user approves, write the tests and run them to verify quality after changes are complete.
- Preferred test tooling: React Testing Library + Jest (already in project).
- For test cycles after plan execution: use Docker to build and verify the app runs correctly
  ```bash
  docker build --build-arg BUILD_ENV=dev -t habit-tracker:local .
  docker run -p 8080:8080 habit-tracker:local
  ```
- `BUILD_ENV` options: `prod`, `qa`, `dev`, `local`

## Communication Style
- Explain decisions and trade-offs as you go — narrate your approach.
- Keep explanations precise and technical (senior audience).
- Use markdown links for file references: [Component.js](src/components/Component.js)
- Surface blockers, risks, and unexpected findings immediately.

## Settings System
- **Context:** `src/contexts/SettingsContext.js` — `SettingsProvider` wraps the app in `App.js`. Consume with `useSettings()` hook.
- **Persistence:** All settings stored as a JSON object in `localStorage` under the key `app_settings`. Defaults are defined in the `DEFAULTS` constant in `SettingsContext.js`.
- **Adding a new setting:** Add the key + default to `DEFAULTS`, then add a row to `SettingsModal.js` + a CSS entry in `SettingsModal.css` if needed.
- **Current settings:**
  - `timeSensitivityEnabled` (bool, default `true`) — shows/hides the Time Sensitive category in Priority mode (`WeeklyHabitsList.js`)

## Mobile Modal Pattern
All popup modals must follow the `HabitModal` pattern for mobile consistency:
- **Mobile** (`isMobile` from `react-device-detect`): full-width container, `width: "calc(100% - 0px)"`, `maxWidth: "calc(100% - 0px)"`, `height: 100dvh` backdrop, `maxHeight: "calc(100dvh - 24px)"` on the inner panel
- **Desktop**: fixed max-width (typically 400–500px), centered, standard `100vh` backdrop with `padding: 20`
- **Never use `BottomSheet`** for modals — it was the old pattern. All modals use the centered overlay approach.
- For CSS-class-based modals (e.g. `SettingsModal`), use `@media (max-width: 640px)` to apply `width: 100%; max-width: 100%`

## Help Page Rule
**Before completing any feature or user-facing change, check whether it should be documented in `src/pages/HelpPage.js`.** If the change affects how a user interacts with the app (new UI, new toggle, new behavior), add or update the relevant section in HelpPage. This is a standing requirement — do not skip it.

## Things to Never Do
- Never force push or run destructive git commands without explicit confirmation
- Never leave `console.log` or debug statements in committed code
- Never modify files outside the scope of the requested change without flagging it first
- Never add inline styles
- Never call the backend API directly from a component — always go through `/src/api/`
- Never install a new npm package without user approval
