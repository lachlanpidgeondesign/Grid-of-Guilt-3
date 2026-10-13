// Grid of Guilt — tutorial forced-placement guard.
//
// Pure TS (no DOM/React) so scripts/selftest.ts can import it. Step 6 of the
// tutorial only accepts a drop when it is the suspect's solution cell AND, given
// who is already on the board, that placement is forced: every other cell the
// suspect could legally occupy would immediately strand another still-unplaced
// suspect (leave them with no legal cell). This reproduces the human deduction
// order Ruby → Kate → Eve without hard-coding it.

import type { CellContent } from "../app/shared/PlayBoard";
import { TUTORIAL_LEVEL, TUTORIAL_CAST_NAMES, TUTORIAL_CLUES } from "./tutorialLevel";

type Pos = [number, number];

const N = TUTORIAL_LEVEL.N;
const SOL = TUTORIAL_LEVEL.sol;
const CRIME = TUTORIAL_LEVEL.crimeSceneCell;

/** Suspect index → position for every suspect currently on the board. */
export function placedPositions(grid: CellContent[][]): Map<number, Pos> {
  const placed = new Map<number, Pos>();
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const cell = grid[r][c];
      if (typeof cell === "number") placed.set(cell, [r, c]);
    }
  }
  return placed;
}

function clueSatisfied(placed: Map<number, Pos>, idx: number, r: number, c: number): boolean {
  const spec = TUTORIAL_CLUES[idx];
  if (!spec) return true; // starter has no clue
  if (spec.kind === "relative") {
    const ref = placed.get(spec.otherSuspectIdx);
    if (!ref) return true; // referent not placed yet → counts satisfied
    const [rr, rc] = ref;
    switch (spec.relation) {
      case "below": return r > rr;
      case "above": return r < rr;
      case "leftOf": return c < rc;
      case "rightOf": return c > rc;
    }
  }
  return TUTORIAL_LEVEL.clues[idx].check(r, c);
}

/** Is placing `idx` at (r,c) legal under the board rules given who is placed? */
export function immediateLegal(placed: Map<number, Pos>, idx: number, r: number, c: number): boolean {
  if (r < 0 || r >= N || c < 0 || c >= N) return false;
  if (CRIME && r === CRIME[0] && c === CRIME[1]) return false;
  for (const [other, [pr, pc]] of placed) {
    if (other === idx) continue;
    if (pr === r && pc === c) return false; // cell taken
    if (pr === r) return false; // same row
    if (pc === c) return false; // same column
    if (Math.abs(pr - r) <= 1 && Math.abs(pc - c) <= 1) return false; // touching
  }
  return clueSatisfied(placed, idx, r, c);
}

/** Every cell where `idx` could legally go given the current placements. */
export function legalCells(placed: Map<number, Pos>, idx: number): Pos[] {
  const cells: Pos[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (immediateLegal(placed, idx, r, c)) cells.push([r, c]);
    }
  }
  return cells;
}

/**
 * Is `idx` forced to its solution cell right now? True when the solution cell is
 * legal and every OTHER legal cell for `idx` would immediately strand one of the
 * still-unplaced active suspects.
 */
export function isForced(placed: Map<number, Pos>, idx: number, activeUnplaced: number[]): boolean {
  const [sr, sc] = SOL[idx];
  const legal = legalCells(placed, idx);
  if (!legal.some(([r, c]) => r === sr && c === sc)) return false;

  const others = activeUnplaced.filter((t) => t !== idx);
  for (const [r, c] of legal) {
    if (r === sr && c === sc) continue;
    const next = new Map(placed);
    next.set(idx, [r, c]);
    const strands = others.some((t) => legalCells(next, t).length === 0);
    if (!strands) return false;
  }
  return true;
}

/**
 * Can `idx` be placed now? It must be the (equal-)most constrained suspect still
 * in the tray (fewest legal cells) AND forced to its solution cell. The
 * most-constrained filter reproduces the intended deduction order (Ruby → Kate →
 * Eve): otherwise a suspect that sits on another's only line could look "forced"
 * out of turn.
 */
export function isPlaceable(placed: Map<number, Pos>, idx: number, activeUnplaced: number[]): boolean {
  const myCount = legalCells(placed, idx).length;
  if (myCount === 0) return false;
  for (const t of activeUnplaced) {
    if (t === idx) continue;
    if (legalCells(placed, t).length < myCount) return false;
  }
  return isForced(placed, idx, activeUnplaced);
}

/**
 * Guard a tutorial drop. Returns true to accept, or a short message to reject.
 * `activeIdxs` are the suspects currently available in the tray for this step.
 */
export function tutorialGuard(
  grid: CellContent[][],
  idx: number,
  r: number,
  c: number,
  activeIdxs: number[],
): true | string {
  const placed = placedPositions(grid);
  placed.delete(idx); // ignore the dragged suspect's own prior cell, if any
  const name = TUTORIAL_CAST_NAMES[idx];

  if (!immediateLegal(placed, idx, r, c)) return `${name} can't go there.`;

  const activeUnplaced = activeIdxs.filter((i) => !placed.has(i));
  const [sr, sc] = SOL[idx];
  if (r === sr && c === sc && isPlaceable(placed, idx, activeUnplaced)) return true;

  return `Not yet — ${name} could still go in more than one place.`;
}
