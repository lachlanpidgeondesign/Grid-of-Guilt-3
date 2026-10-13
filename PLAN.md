# Grid of Guilt — Levels + new tutorial

Goal: a new entry page at `/play/` where players pick **Easy, Medium or Hard** (three fixed, hand-picked levels), with a new interactive tutorial on first play, a results screen with "Next level", and a rebuilt How to Play screen with "Replay tutorial". The existing daily game and Generator mode keep working exactly as they do now.

Read `.github/copilot-instructions.md` first. Work top to bottom; start at the first unticked phase. Each phase ends with self-test, review, commit.

Coordinates in this plan are **(row, col), 1-indexed**. Level JSON and code use 0-indexed.

---

## [x] Phase 0 — Branch and baseline

Stage 1 (level files and clue model) was built before this plan existed. These files already exist: `src/app/levels/clues.ts`, `loadLevel.ts`, `easy.json`, `medium.json`, `hard.json`, `scripts/verifyLevels.ts`, `scripts/traceGrade.ts`, `scripts/dumpCandidates.ts`, `scripts/summarise.ts`, `scripts/candidates/`.

- Create and switch to a branch `play-levels`. Commit everything currently uncommitted as `Baseline: Stage 1 level data`.
- Add npm scripts: `"verify:levels": "tsx scripts/verifyLevels.ts"` and `"selftest": "tsx scripts/selftest.ts"`. Add `tsx` as a devDependency.
- Create `scripts/selftest.ts`: a list of named assertions, run in order, printing `PASS name` / `FAIL name: reason`, ending with `SELFTEST PASS (n)` or `SELFTEST FAIL (k of n)` and exit code 1 on failure. Start with one assertion: all three levels load via `loadLevel`.
- Confirm `npm run build` succeeds before any change, and record the result.

**Done when**
- On branch `play-levels`, baseline committed.
- `npm run selftest` and `npm run build` both run. (`verify:levels` is allowed to fail on Easy until Phase 1.)

---

## [x] Phase 1 — Finish level data

<!-- Done: crime cell blocked in psCreate/countSolutions/hint; loadLevel uses static JSON imports (sync, no fetch); plain "must be…" clue wording; verifyLevels prints from the loaded level; selftest at 6 assertions; generator still makes 8/8 candidates at 5/7/9. -->

**1a. Grader: block the crime scene cell.** The game never lets a suspect be placed on the body's cell, but `psCreate` in `src/app/generator/constraintSolver.ts` builds candidates from clues alone and never excludes it. This is why Easy fails `gradeNoGuess`. Make the crime scene cell start with no candidates. Then check `countSolutions`, `nextHintFromBoard` and `reasonedLookahead` treat it as unplaceable too; fix any that don't. Update the copied `psCreate` in `scripts/traceGrade.ts` to match.

**1b. Plain clue wording.** `loadLevel.ts` must build every clue's `text` from `clueText()` in `clues.ts`. No generator flavour text ("Was confirmed in the … all evening") may reach a frozen level. Expected wording, e.g. `must be in the <em>Library</em>`, `must be in an <em>even-numbered row</em>`. Update door/window wording to match the design reference: `must be next to a <em>door</em>` / `must not be next to a <em>door</em>`, and the same for `window` (was "doorway"). Relative clues: `must be above {Name}` (no "in the house").

**1c. Verify.** `scripts/verifyLevels.ts` prints, per level, from the LOADED level: solution count, `solvable`, solve order as names, murderer, and each clue (tags stripped) in display order. Remove the old "candidate source" sections.

**1d. Generator sanity.** Run `scripts/dumpCandidates.ts` once, writing to `scripts/candidates-after/` (do not overwrite `scripts/candidates/`). Report valid candidates and attempts per size.

Expected solve facts (from independent analysis; use them in self-tests):
| Level | Pre-placed | Murderer | Opening move |
|---|---|---|---|
| easy | Dylan (4,2) | Eve | Row 3: only (3,4) can hold anyone → Cole |
| medium | Cole (3,5) | Dylan | — |
| hard | Cole (3,8) | Hugo | — |

**Done when**
- `npm run verify:levels`: all three levels show `solutions=1`, `solvable=true`, plain wording.
- `traceGrade` on Easy shows the first deduction is (3,4) occupied → Cole.
- Self-tests added: each level unique + solvable; no clue text contains "all evening", "Witnesses" or "spotted"; each clue is true at its suspect's solution cell.
- Generator still produces candidates at 5, 7 and 9 (counts reported).
- The only src change outside `src/app/levels/` is the crime-cell fix in `constraintSolver.ts`.

---

## [x] Phase 2 — Shared board component  <!-- Board extracted to src/app/shared/PlayBoard.tsx; Generator uses it with no behaviour change; overlay props inert when omitted; reviewer PASS. -->

Extract the board from `GeneratorGameInner` (`src/app/generator/GeneratorGame.tsx`) into a reusable component, e.g. `src/app/shared/PlayBoard.tsx`. Generator mode must then use it, with **no visible or behavioural change**.

The board takes a `GeneratedLevel` plus board state, and supports what both the levels and the tutorial need:
- Rendering: cells, room fills, room labels, doors, windows, body, placed suspects, X and dot marks, row/column numbers, red outlines for rule errors, murderer outline on win.
- Input: tap cycle on empty cells (empty → X → dot → empty), drag-to-paint X, drag suspects from tray to board and back, pinned starter.
- Optional overlay props (unused by Generator, needed for the tutorial):
  - `dimmedCells: Set<string>` — rendered dark, not interactive.
  - `hatchedCells: Set<string>` — diagonal-stripe overlay (see tutorial frames).
  - `xOnlyCells: Set<string> | null` — when set, X can only be placed on these cells; taps and paint elsewhere are ignored; dots disabled.
  - `canPlace?: (suspectIdx, row, col) => boolean | string` — veto a drop; a string is a message to show. A vetoed drop returns the suspect to the tray and shakes the target cell.
  - `allowTray: boolean`, `locked: boolean`.
- Keep `nextHintFromBoard` working with the board's state.

**Done when**
- Generator mode, by hand: generate 5×5, 7×7, 9×9; place, drag back, X, dot, paint, undo, hint, reveal, win. All behave as before.
- `npm run build` passes.
- Self-test: a small render-free check that the overlay prop types exist is enough; behaviour is checked by hand and by the reviewer.

---

## [x] Phase 3 — `/play/` entry and landing screen  <!-- Added play/index.html + src/play/ (main, LevelsApp state machine, LandingScreen, storage); second vite entry; storage/unlock self-tests; reviewer PASS. -->

- Add `play/index.html` (copy the head of `index.html` — fonts, meta, viewport) mounting `src/play/main.tsx` → `LevelsApp`. Add it to `build.rollupOptions.input` in `vite.config.ts` alongside the existing entry. The existing `index.html` and its app are untouched.
- Must work at both `/play/` in dev and under the GitHub Pages base path in a Pages build (`base` already handles the repo name).
- `LevelsApp` holds screen state: `landing | tutorial | level | results`, plus a How to Play overlay. No router.
- Landing screen:
  - Grid of Guilt logo/title (reuse StartScreen's visual style; do not edit StartScreen).
  - Three buttons: Easy (5×5), Medium (7×7), Hard (9×9). **Unlock in order:** Easy is open; Medium unlocks when Easy is solved; Hard when Medium is solved. A locked button shows a lock and "Solve Easy to unlock" / "Solve Medium to unlock", and isn't tappable.
  - A ✓ on each solved level, with best time. A level with saved progress shows "In progress".
  - Tapping a **solved** level opens a small sheet: "You solved this in {time}." with "Replay" (clears that level's saved state and starts fresh; best time is kept) and "Cancel".
  - A "How to play" link.
- Storage helper `src/play/storage.ts`: keys prefixed `gog-play-`; every read/write in try/catch; works with storage empty or unavailable. Keys: `gog-play-tutorial-seen` (boolean), `gog-play-progress` (`{ easy?: {solved, bestSeconds, hints}, … }`), `gog-play-state-{easy|medium|hard}` (in-progress board, see Phase 4).
- Add a "Reset progress" control reachable only with `?debug` in the URL (clears all `gog-play-` keys, reloads).

**Done when**
- `npm run dev` → `/play/` shows the landing screen; `/` still shows the original game unchanged.
- `npm run build` produces both pages; open the built `/play/` with a static server and it loads.
- Self-tests: storage helpers return defaults when storage throws; progress round-trips; unlock rules (Medium locked until Easy solved, Hard until Medium solved).

---

## [x] Phase 4 — Level player and results · CHECKPOINT  <!-- Built src/play/LevelPlayer, ResultsScreen, ClueRow (ClueSpec chips/icons), playHint, clueOrder, share; saved-state resume + win→results; desktop two-column via additive PlayBoard trayPortal; reviewer PASS (round 2). -->

Layout reference: `docs/design-ref/level-layout.png`. Match it on mobile; where this plan differs, the plan wins.

**Mobile layout (top to bottom)**
- Header bar (purple, as reference): back arrow (→ landing), "Grid of Guilt" title, share button.
- Game bar (dark, as reference): pause button, timer, knife mark (decorative, centre), then three round buttons on the right in this order: undo, hint (lightbulb), ••• menu. Undo uses the same round button style as hint; it's disabled (dimmed) when there's nothing to undo.
- Board (`PlayBoard` with `LEVELS[difficulty]`).
- Tray, then clue list.

**Desktop layout (viewport ≥ 900px wide):** header and game bar span the full width. Below them, two columns: the board on the left, sized to fit the viewport height; tray then clue list on the right. Dragging from the right-hand tray onto the board must work. Below 900px, use the mobile layout.

**Controls**
- Undo: steps back one action (place, move, remove, X, dot, a whole drag-paint stroke counts as one action). Undo history is part of the saved state.
- Hint (lightbulb): unlimited, counted.
- Pause: stops the timer and covers the board with a "Paused" panel and a Resume button (the board is hidden so pausing isn't free thinking time). Switching tabs or leaving the page pauses automatically.
- ••• menu: "How to play", "Restart level" (asks to confirm; clears the board, timer and hint count).
- Share: Web Share API with a link to `/play/`, falling back to copying the link. After a win it shares "I caught the murderer on Grid of Guilt {Easy|Medium|Hard} in {time}" plus the link.
- No Reveal, no Regenerate, no size picker.

**Clues**
- Order = suspect index order (Amy, Ben, Cole…), skipping the pre-placed suspect. **Never** list the murderer last by rule. A satisfied clue gets a tick and drops to the bottom; the others keep their order.
- Render from the `ClueSpec`, not the text string: suspect names coloured and underlined; room → room chip in that room's colour; door → the board's door icon after the text; window → the board's window icon (as in the reference).

**Saved state**
- Save the in-progress level to `gog-play-state-{level}` after every change: placements, X and dot marks, elapsed time, hints used, undo history.
- Returning to an unsolved level resumes exactly where the player left off. The back arrow just leaves; nothing is lost.
- On win: clear that level's saved state, save the result to `gog-play-progress` (keep the best time), unlock the next level.

**Win and results**
- Board shows the murderer outline (existing `isMurderer` style), pause ~1.5s (instant under reduced motion), then the results screen.
- Results: heading "{Murderer} is the murderer!"; line "{Murderer} was in the {Room} with the victim."; time and hints used; share button; primary "Next level" (Easy → Medium → Hard), on Hard "Back to levels"; secondary "Back to levels".

**Done when**
- All three levels can be completed by hand and with the hint button alone (hint never stalls).
- Leaving mid-level and returning restores board, marks, timer and hints exactly, including after a reload.
- Results, unlocks and ticks persist after reload.
- Mobile layout correct at 390×844; desktop two-column layout correct at 1280×800.
- Self-tests: clue display order never ends with the murderer for any level; results line names the correct room; saved state round-trips; a corrupt saved state falls back to a fresh board without crashing.
- STOP for Lachlan. Report with screenshots of all three boards at 390px wide and one at desktop width, so room-label overlap and layout can be checked, plus a phone test list.

---

## [ ] Phase 5 — Tutorial · CHECKPOINT

Rebuild the tutorial on `PlayBoard` inside `/play/`. Do not reuse or edit `src/app/components/TutorialScreen.tsx`. Reference frames are in `docs/tutorial-ref/` ("Tutorial v2 - 1.png" … "Tutorial v2 - 7.png"); match their layout. Where this plan differs from the frames, the plan wins.

**Trigger**
- First time a player taps any level on the landing screen and `gog-play-tutorial-seen` isn't set → tutorial first. "Start game" on the last step goes straight into the level they tapped.
- Completing or skipping sets `gog-play-tutorial-seen`.
- "Replay tutorial" (Phase 6) runs it again; at the end, "Start game" returns to wherever it was opened from (see Phase 6).

**Layout:** same mobile/desktop rules as Phase 4 (two columns from 900px; step text sits above the tray on the right). Clues use the Phase 4 clue renderer (room chips).

**Board** (store as `src/play/tutorialLevel.json`, loaded with `loadLevel`)
```
     1  2  3  4  5
1    B  K  K  K  K
2    B  H  H  L  L
3    B  H  H  L  L
4    B  B  S  S  S
5    B  B  S  S  S
B Bedroom · K Kitchen · H Hall · L Bathroom · S Study
```
- Body at (3,1). No doors, no windows.
- Cast (index order): Adam, Tom, Ruby, Kate, Eve. Adam pre-placed at (4,3).
- Solution: Tom (2,2), Ruby (1,4), Kate (3,5), Eve (5,1). Murderer: Eve.
- Clues: Tom `room Hall`; Ruby `colParity even`; Kate `column 5`; Eve `relative below Ruby`.
- Display order: Tom, Ruby, Kate, Eve. Tray order the same. A ticked clue drops to the bottom; others keep order.
- Use the frames' character art and names.

**Steps** (Skip, top right, on every step → sets seen flag, goes to the level the player tapped, or back to where Replay was opened)
1. **Intro.** Heading "How to Play Grid of Guilt". Line: "A murder has taken place in this house!" Body: "To catch the killer, you'll need to find out where everyone was at the time of the murder. The murderer was in the same room as the victim. No one can stand where the body lies." Button: Next.
2. **"Rule: Only one suspect per room."** Everything except the Study dimmed. Hatch (4,4) (4,5) (5,3) (5,4) (5,5). Tip: "Tip: place X's to mark where suspects can't go." + "Tap on the [hatch] squares to place a [X]". X allowed only on hatched cells (tap or drag-paint). Auto-advance ~400ms after all are X'd.
3. **"Rule: Only one suspect per row and column."** Hatch (1,3) (2,3) (3,3) (4,1) (4,2). Previously X'd cells stay lit; others dimmed. Same tip and advance.
4. **"Rule: Suspects can't touch, even diagonally."** Hatch (3,2) (3,4) (5,2). Same tip and advance.
5. **"Rule: All the clues must be true."** Board undimmed. Tray: Tom only active. Tip: "Tom must be in the [Hall chip]. Where can he go?" Only (2,2) accepted; any other drop is vetoed with a shake. Advance on placement.
6. **"Now finish the puzzle."** Tray: Ruby, Kate, Eve. **Forced-placement guard:** a drop is accepted only if that cell is the suspect's solution cell AND, given the suspects already placed, it is that suspect's only legal cell (rows, columns, rooms, touching, body cell, and their clue; a relative clue whose referent isn't placed counts as satisfied). Otherwise veto: shake + "Not yet — {name} could still go in more than one place." (or "{name} can't go there." if the cell isn't legal at all). Correct order: Ruby → Kate → Eve (Kate is only forced once Ruby takes row 1).
7. **Reveal.** Remaining empty cells fill with X. Eve gets the murderer outline. Heading "Eve is the murderer!" Body: "Well done! Eve was in the same room as the murder victim. Are you ready to play?" Button: "Start game".

**Done when**
- Tutorial completes by following the steps; every wrong action in steps 2–6 is ignored or vetoed, never accepted.
- Skip works on every step and sets the flag.
- First tap on any level shows the tutorial once; later taps go straight in.
- Self-tests: tutorial level unique; clues true at solution; guard accepts Ruby/Kate before Eve and rejects Eve until both are placed; guard rejects a correct-cell drop that isn't yet forced.
- STOP for Lachlan with a phone test list (pacing, auto-advance timing, drag-paint on hatched cells, veto feel).

---

## [ ] Phase 6 — How to Play screen

Rebuild for `/play/` only, as a new component (do not edit `HowToPlayModal.tsx`, which the daily game still uses). Reference: `docs/tutorial-ref/1790849911769_image.png`; where this plan differs, the plan wins.

- Title: "How to Play Grid of Guilt".
- Intro: "A murder has taken place in this house. The murderer was alone in the same room as the victim." / "Use your deduction skills to find out where everyone was at the time of the murder."
- **Rules**, each with a small illustration on the right (static mini-boards in the style of the reference; names Ruby/Adam/Tom instead of Ella/Adam/Tom), in this order:
  1. "Each room can only have one suspect."
  2. "Each row and column can only have one suspect."
  3. "Suspects can't touch — not even diagonally."
  4. "Each suspect has their own rule that you must follow when placing them." (example tile + "Tom must be in the [Hall chip]")
- **Controls** block:
  - "Drag a suspect onto the board to place them."
  - "Tap a cell once for an X: no one can be here."
  - "Tap again for a dot: someone must be here, but you don't know who yet. Mark the dot's row, column, room and neighbours with Xs."
  - "Tap a third time to clear the cell."
  - "Drag across cells to mark several Xs at once."
- Button: "Replay tutorial".
- Opens from the landing link and the level's ••• menu. Closes with ✕, Escape, or tapping outside. On desktop it's a centred modal; on mobile a full-height sheet.
- Replay from inside a level: the level's board, timer and history are kept (timer paused while the tutorial runs); at the end of the tutorial (or Skip), return to that level exactly as it was. Replay from landing returns to landing.

**Done when**
- Opens and closes from both places; focus moves in on open and back on close.
- Replay mid-level returns to an unchanged level (placements, marks, timer).
- No edits to `HowToPlayModal.tsx`, `TutorialScreen.tsx` or anything else used by the daily game.

---

## Decisions to confirm
- Undo is a third round button in the game bar, left of hint.
- Dot marks stay (tap cycle empty → X → dot → empty).
- Pause hides the board; switching tabs auto-pauses.
- Share before a win shares the link; after a win shares the time.
- Desktop two-column layout from 900px wide.
- Tutorial keeps the name Eve (the 5×5 game cast also has an Eve).

### From reviews
- Phase 0 ❓ `typescript` added as a devDependency (not only `tsx`) — needed for the earlier type-check follow-up.
- Phase 0 ❓ `scripts/candidates.zip` committed as a tracked binary alongside the JSON source.
- Phase 1 ❓ Frozen level data isn't in the app bundle yet (tree-shaken until Phase 3/4 wires `LEVELS` in); bundling + no-fetch proven via esbuild for now.
- Phase 1 ⚪ `clues.ts` "below" branch keeps a pre-existing no-op `getOtherCell(...)` call; could be dropped.
- Phase 2 ❓ Undo of a drag-paint still steps one cell at a time, exactly as the generator always did (Phase 4 wants a whole stroke = one undo for `/play/`).
- Phase 3 ❓ Solved sheet shows a "{Level} solved" header above the spec's "You solved this in {time}." line.
- Phase 3 ❓ How-to-play overlay copy is written fresh (not lifted from the daily game's How to Play screen); closes via "Got it" only.
- Phase 3 ❓ `play/index.html` is marked `noindex, nofollow` (matches the daily page).
- Phase 4 ❓ Header bar uses the app's teal `#01394b`, not the plan's "purple" — the reference image `docs/design-ref/level-layout.png` doesn't exist and teal keeps /play/ cohesive. Confirm or send a purple.
- Phase 4 ❓ Game bar is `#01262f` (darker teal); round buttons match the generator's style.
- Phase 4 ❓ Win→results delay is 1500ms (0 under reduced motion).
- Phase 4 ❓ Added a QA deep-link `?debug&open=easy|medium|hard` that opens a level board directly (gated behind `?debug`, used for screenshots/testing).
- Phase 4 ❓ Hint is unlimited + counted; pressing Hint reveals the next step (toggle hides it); the count only increments on reveal.
