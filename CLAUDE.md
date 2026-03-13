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

## Things to Never Do
- Never force push or run destructive git commands without explicit confirmation
- Never leave `console.log` or debug statements in committed code
- Never modify files outside the scope of the requested change without flagging it first
- Never add inline styles
- Never call the backend API directly from a component — always go through `/src/api/`
- Never install a new npm package without user approval
