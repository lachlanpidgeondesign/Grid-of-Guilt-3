# Grid of Guilt — project rules

Grid of Guilt is a logic puzzle: place one suspect per row, column and room, with no two suspects touching (even diagonally), and every suspect's clue true. The murderer is whoever ends up in the same room as the body. This project adds a new `/play/` page with three fixed levels (Easy 5×5, Medium 7×7, Hard 9×9), a new tutorial, a results screen and a How to Play screen. See `PLAN.md`.

Stack: React 18 + Vite 6 + Tailwind 4, TypeScript (no tsconfig in the repo; don't add one). Deployed to GitHub Pages; `vite.config.ts` sets `base` for Pages builds.

## Files

**Never edit (the daily game must stay exactly as it is):**
- `index.html`, `src/main.tsx`, `src/app/App.tsx`
- `src/app/components/*` — `PuzzleGame.tsx`, `StartScreen.tsx`, `TutorialScreen.tsx`, `HowToPlayModal.tsx`, `EndGameScreen.tsx`, `authoredRooms.ts`, `analytics.ts`
- `scripts/candidates/` (source data for the frozen levels)

**Edit only where PLAN.md says:**
- `src/app/generator/constraintSolver.ts` — Phase 1 crime-cell fix only.
- `src/app/generator/GeneratorGame.tsx` — Phase 2 board extraction only. Generator behaviour must not change.
- `vite.config.ts` — Phase 3: add the second entry only.
- `src/app/levels/*.json` — the frozen levels. Never change geometry, solutions or clues.

**New work goes in:** `src/play/` (the `/play/` app), `src/app/shared/` (shared board), `src/app/levels/`, `play/index.html`, `scripts/`.

## Puzzle rules the code must respect
- Coordinates: code and JSON are 0-indexed `(row, col)`; anything shown to players or written in PLAN.md is 1-indexed.
- The body (crime scene) cell can never hold a suspect, in play, in the grader, in hints and in the tutorial guard.
- "Odd/even-numbered row/column" is 1-indexed from the player's point of view (row 1 is odd).
- "Below/above" means any lower/higher row, not directly adjacent. "Next to a door/window" means the cell is in the level's `doorCells`/`windowCells`.
- Clue wording comes only from `clueText()` in `src/app/levels/clues.ts`. Never show generator flavour text in `/play/`.
- In `/play/`, clues are rendered from their `ClueSpec` (room chips, door/window icons), not from the text string.
- Clue lists are never ordered with the murderer last. Use suspect index order; satisfied clues drop to the bottom.

## Conventions
- Persistence: `localStorage` only, keys prefixed `gog-play-`, every access wrapped in try/catch, and the page must work if storage is empty or unavailable.
- Mobile first (phone web view, ~390px wide). Tap targets ≥ 44px. No hover-only behaviour. Drag and tap must both work.
- Respect `prefers-reduced-motion`: animations become instant or simple fades; timed pauses shorten.
- Reuse the existing look: colours, fonts (Literata headings, Inter body), `SuspectTile`, `CharacterAvatar`, room fills and labels from the generator board. No new UI libraries. No new runtime dependencies without asking.
- Pure logic (level loading, clue checks, the tutorial placement guard, storage helpers) lives in plain TS with no DOM or React, so `scripts/selftest.ts` can import it.
- No analytics in this project. Don't add tracking calls.

## Self-test
- `npm run selftest` runs `scripts/selftest.ts`: named assertions, `PASS`/`FAIL` per line, ending `SELFTEST PASS (n)` or `SELFTEST FAIL (k of n)` with exit code 1 on failure.
- `npm run verify:levels` checks the three frozen levels (unique, solvable, plain wording).
- `npm run build` must pass.
- Every phase that adds logic adds assertions. Run all three before handing to the reviewer.

## Review notes (for the reviewer)
- 🔴 Any diff to a "Never edit" file is a blocker.
- 🔴 Any change to generator behaviour (Phase 2) is a blocker. Compare by hand: generate, place, X, dot, paint, undo, hint, reveal, win.
- 🔴 A suspect can be placed on the body cell anywhere → blocker.
- 🔴 Generator flavour text visible in `/play/` → blocker.
- 🔴 Murderer always last in a clue list → blocker.
- 🔴 A "done when" item in PLAN.md that isn't met is a blocker.
- Check every new `localStorage` access has try/catch and the `gog-play-` prefix.
- This project has **no daily rotation, date seeding, streaks or analytics**. Don't flag their absence. It does have per-level saved state, unlock order and best times: check those survive a reload and a missing or corrupt storage value.
- `/` must still load the original daily game after every phase.

## Process
- Work on branch `play-levels`. Commit after each phase passes review: `Phase N: <title>`. Never push to `main` or any Pages branch; pushing `play-levels` is fine if a remote exists.
- Stop at any phase whose heading includes `CHECKPOINT` after it passes review, and wait for Lachlan.
- If the builder and reviewer disagree after two rounds, stop and report.
- Every report to Lachlan uses one-line emoji items (🔴 🟠 ⚪ ❓ ✅). No paragraphs.
