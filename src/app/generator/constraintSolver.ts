// Grid of Guilt — fast constraint solver / solution counter.
//
// The game is LinkedIn Queens plus identity clues: place N suspects so that
// each occupies a distinct row, column and room, no two are king-adjacent
// (the 8 surrounding cells), and every suspect satisfies its own clue
// predicate. The starter suspect is pinned to its solution cell.
//
// This module provides a solution COUNTER that stops early once it has seen
// `cap` solutions — counting to 2 is enough to decide uniqueness, which is all
// the generator needs and is vastly cheaper than exhaustive enumeration.
//
// It replaces the app's original fixed-order, all-cells backtracker with an
// MRV (minimum-remaining-values) search over suspects: at each step it expands
// the suspect with the fewest legal candidate cells left, which prunes the
// search space by orders of magnitude and makes true uniqueness affordable at
// 9x9. Pure / DOM-free.

import type { GeneratedLevel } from "./puzzleGenerator";

export interface CountResult {
  /** Number of full solutions found, capped at `cap`. */
  count: number;
  /** True if the internal work budget was exhausted before the search
   *  completed (result is then a lower bound; treat as "unknown/too hard"). */
  budgetExceeded: boolean;
  /** Backtracking steps consumed (diagnostic). */
  steps: number;
}

/**
 * Count valid full placements for a level, stopping once `cap` are found.
 *
 * @param level The level whose clues/map/constraints define the puzzle.
 * @param cap   Stop after this many solutions (default 2 → uniqueness test).
 * @param stepBudget Safety limit on backtracking steps. Default scales with N.
 */
export function countSolutions(
  level: GeneratedLevel,
  cap = 2,
  stepBudget?: number,
): CountResult {
  const { N, map, clues, starterIdx, sol, crimeSceneCell } = level;
  const budget = stepBudget ?? (N <= 5 ? 200_000 : N <= 7 ? 1_000_000 : 4_000_000);

  // Per-suspect candidate cells: every cell whose clue holds for that suspect.
  // The starter is pinned to exactly its solution cell. The body's cell is
  // never a candidate for anyone — no suspect can stand on the crime scene.
  const candidates: Array<Array<[number, number]>> = [];
  for (let si = 0; si < N; si++) {
    if (si === starterIdx) {
      candidates.push([[sol[si][0], sol[si][1]]]);
      continue;
    }
    const list: Array<[number, number]> = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (crimeSceneCell && r === crimeSceneCell[0] && c === crimeSceneCell[1]) continue;
        if (clues[si].check(r, c)) list.push([r, c]);
      }
    }
    candidates.push(list);
  }

  const usedRows = new Set<number>();
  const usedCols = new Set<number>();
  const usedRooms = new Set<number>();
  const placedAt: Array<[number, number]> = [];
  const placedSet = new Set<string>();
  const done = new Array<boolean>(N).fill(false);

  // Pin the starter up-front (it has a single candidate) so MRV never wastes a
  // level on it and adjacency around it is enforced from the start.
  const [sr, sc] = sol[starterIdx];
  if (!clues[starterIdx].check(sr, sc)) return { count: 0, budgetExceeded: false, steps: 0 };
  usedRows.add(sr); usedCols.add(sc); usedRooms.add(map[sr][sc]);
  placedAt.push([sr, sc]); placedSet.add(`${sr},${sc}`);
  done[starterIdx] = true;

  const legal = (r: number, c: number): boolean => {
    if (placedSet.has(`${r},${c}`)) return false;
    if (usedRows.has(r) || usedCols.has(c) || usedRooms.has(map[r][c])) return false;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < N && cc >= 0 && cc < N && placedSet.has(`${rr},${cc}`)) return false;
      }
    }
    return true;
  };

  let count = 0;
  let steps = 0;
  let budgetExceeded = false;

  const search = (remaining: number): void => {
    if (count >= cap || budgetExceeded) return;
    if (remaining === 0) { count++; return; }
    if (++steps > budget) { budgetExceeded = true; return; }

    // MRV: choose the unplaced suspect with the fewest currently-legal cells.
    let bestSi = -1;
    let bestCells: Array<[number, number]> | null = null;
    let bestLen = Infinity;
    for (let si = 0; si < N; si++) {
      if (done[si]) continue;
      const legalCells: Array<[number, number]> = [];
      for (const [r, c] of candidates[si]) {
        if (legal(r, c)) legalCells.push([r, c]);
      }
      if (legalCells.length < bestLen) {
        bestLen = legalCells.length;
        bestCells = legalCells;
        bestSi = si;
        if (bestLen === 0) break; // dead end — prune immediately
      }
    }

    if (bestLen === 0 || bestSi === -1 || !bestCells) return; // no placement possible

    done[bestSi] = true;
    for (const [r, c] of bestCells) {
      usedRows.add(r); usedCols.add(c); usedRooms.add(map[r][c]);
      placedAt.push([r, c]); placedSet.add(`${r},${c}`);

      search(remaining - 1);

      usedRows.delete(r); usedCols.delete(c); usedRooms.delete(map[r][c]);
      placedAt.pop(); placedSet.delete(`${r},${c}`);
      if (count >= cap || budgetExceeded) break;
    }
    done[bestSi] = false;
  };

  search(N - 1); // starter already placed
  return { count, budgetExceeded, steps };
}

/** Convenience: is this level's solution unique (exactly one placement)? */
export function isUnique(level: GeneratedLevel, stepBudget?: number): boolean {
  const res = countSolutions(level, 2, stepBudget);
  return !res.budgetExceeded && res.count === 1;
}

// ── Clue-free queens uniqueness (for region carving / B2) ─────────────────
//
// A well-formed LinkedIn-Queens board is uniquely solvable from its REGION
// SHAPES alone — no textual clues required. This helper searches the pure
// geometric puzzle (one occupant per row, distinct columns, distinct regions,
// no king-adjacency) for a placement that DIFFERS from the intended solution.
// If it finds one, that witness tells the carver exactly where the region map
// is still ambiguous. If none exists, the region map is already unique.
//
// Because exactly one occupant lands in each row, king-adjacency reduces to
// "consecutive rows must differ by at least two columns", which makes the
// search fast.

export interface AlternateResult {
  /** A per-row placement (length N) that differs from `intended`, or null if
   *  the region map admits only the intended solution. */
  alt: Array<[number, number]> | null;
  /** True if the step budget ran out before the search finished (result is
   *  then inconclusive; the caller should treat the map as not-yet-proven). */
  exceeded: boolean;
}

export function findAlternateQueens(
  map: number[][],
  N: number,
  intended: Array<[number, number]>,
  stepBudget = 3_000_000,
): AlternateResult {
  const intendedSet = new Set(intended.map(([r, c]) => `${r},${c}`));
  const usedCols = new Set<number>();
  const usedRegions = new Set<number>();
  const placed: Array<[number, number]> = [];

  let found: Array<[number, number]> | null = null;
  let exceeded = false;
  let steps = 0;

  const dfs = (r: number): void => {
    if (found || exceeded) return;
    if (++steps > stepBudget) { exceeded = true; return; }
    if (r === N) {
      // A complete placement — accept only if it deviates from the intended.
      for (const [pr, pc] of placed) {
        if (!intendedSet.has(`${pr},${pc}`)) { found = placed.slice(); return; }
      }
      return;
    }
    // Randomise column order so successive carves explore different witnesses.
    const cols: number[] = [];
    for (let c = 0; c < N; c++) cols.push(c);
    for (let i = cols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cols[i], cols[j]] = [cols[j], cols[i]];
    }
    for (const c of cols) {
      if (usedCols.has(c)) continue;
      const reg = map[r][c];
      if (usedRegions.has(reg)) continue;
      if (r > 0) {
        const [, pc] = placed[r - 1];
        if (Math.abs(pc - c) <= 1) continue; // king-adjacency with the row above
      }
      placed.push([r, c]);
      usedCols.add(c);
      usedRegions.add(reg);
      dfs(r + 1);
      placed.pop();
      usedCols.delete(c);
      usedRegions.delete(reg);
      if (found || exceeded) return;
    }
  };

  dfs(0);
  return { alt: found, exceeded };
}


// ── No-guess solvability grader ───────────────────────────────────────────
//
// Decides whether a level can be solved by pure logical propagation — no
// backtracking, no guessing — and, if so, in what order the suspects become
// individually forced. This is the "fairness" bar (like a Sudoku that never
// needs a guess) and also feeds the "murderer deduced last" goal in B4.
//
// It uses only elementary deductions, mirroring what a human actually does:
//   • Suspect single — a suspect that fits in exactly one remaining cell.
//   • Line/room single — a row, column or room with exactly one cell that can
//     still hold anyone (that cell must be occupied).
//   • Placement fallout — placing an occupant empties its row, column, room and
//     the eight king-adjacent cells, and removes that suspect from every other
//     cell.
//   • Occupant resolution — an occupied cell whose candidate set has collapsed
//     to a single suspect binds that identity.
// If these run dry before every suspect is pinned, the puzzle needs a guess and
// is graded unsolvable-without-guessing.

export interface GradeResult {
  /** True iff every suspect was forced by propagation alone. */
  solvable: boolean;
  /** Suspect indices in the order they became individually determined. The
   *  starter (a given, not a deduction) is first. Empty if a contradiction was
   *  hit. Only meaningful when `solvable` is true. */
  order: number[];
}

const UNKNOWN = 0;
const QUEEN = 1;
const EMPTY = 2;

// ── Shared propagation core ────────────────────────────────────────────────
// The elementary deduction engine used by BOTH the no-guess grader and the
// hint lookahead. Extracting it means the two can never drift apart: a hint is
// literally the grader's own reasoning, one step at a time.
//
// A PropState is a mutable snapshot of a partially-deduced board. `state` marks
// each cell UNKNOWN / QUEEN (occupied) / EMPTY; `occupant` binds an identity to
// a queen once known (-1 = occupied but unidentified — the intermediate a dot
// represents); `cellSuspects` is the live candidate set per cell.
interface PropState {
  N: number;
  map: number[][];
  cellSuspects: Array<Array<Set<number>>>;
  state: number[][];
  occupant: number[][];
  suspectCell: Array<[number, number] | null>;
  order: number[];
  contradiction: boolean;
}

function psCreate(level: Pick<GeneratedLevel, "N" | "map" | "clues" | "crimeSceneCell">): PropState {
  const { N, map, clues, crimeSceneCell } = level;
  const cellSuspects: Array<Array<Set<number>>> = [];
  for (let r = 0; r < N; r++) {
    const row: Array<Set<number>> = [];
    for (let c = 0; c < N; c++) {
      const s = new Set<number>();
      for (let si = 0; si < N; si++) if (clues[si].check(r, c)) s.add(si);
      row.push(s);
    }
    cellSuspects.push(row);
  }
  const state = Array.from({ length: N }, () => new Array<number>(N).fill(UNKNOWN));
  // The body's cell can never hold a suspect: start it with no candidates and
  // mark it empty, so row/column/room "single" deductions see it as
  // unoccupiable from the very first pass.
  if (crimeSceneCell) {
    const [cr, cc] = crimeSceneCell;
    cellSuspects[cr][cc].clear();
    state[cr][cc] = EMPTY;
  }
  return {
    N,
    map,
    cellSuspects,
    state,
    occupant: Array.from({ length: N }, () => new Array<number>(N).fill(-1)),
    suspectCell: new Array<[number, number] | null>(N).fill(null),
    order: [],
    contradiction: false,
  };
}

function psClone(ps: PropState): PropState {
  return {
    N: ps.N,
    map: ps.map,
    cellSuspects: ps.cellSuspects.map((row) => row.map((s) => new Set(s))),
    state: ps.state.map((r) => r.slice()),
    occupant: ps.occupant.map((r) => r.slice()),
    suspectCell: ps.suspectCell.map((x) => (x ? [x[0], x[1]] as [number, number] : null)),
    order: ps.order.slice(),
    contradiction: ps.contradiction,
  };
}

function psSetEmpty(ps: PropState, r: number, c: number): void {
  if (ps.state[r][c] === QUEEN) { ps.contradiction = true; return; }
  if (ps.state[r][c] === EMPTY) return;
  ps.state[r][c] = EMPTY;
  ps.cellSuspects[r][c].clear();
}

// Mark (r,c) occupied. Empties its row, column, room and king-neighbours, but
// does not yet bind an identity.
function psMakeQueen(ps: PropState, r: number, c: number): void {
  const { N, map } = ps;
  if (ps.state[r][c] === EMPTY) { ps.contradiction = true; return; }
  if (ps.state[r][c] === QUEEN) return;
  ps.state[r][c] = QUEEN;
  const room = map[r][c];
  for (let k = 0; k < N; k++) {
    if (k !== c) psSetEmpty(ps, r, k);
    if (k !== r) psSetEmpty(ps, k, c);
  }
  for (let rr = 0; rr < N; rr++) {
    for (let cc = 0; cc < N; cc++) {
      if ((rr !== r || cc !== c) && map[rr][cc] === room) psSetEmpty(ps, rr, cc);
    }
  }
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < N && cc >= 0 && cc < N) psSetEmpty(ps, rr, cc);
    }
  }
}

// Bind suspect `si` to cell (r,c): make it a queen if needed, then remove si
// from every other cell and record the deduction.
function psAssign(ps: PropState, r: number, c: number, si: number): void {
  const { N } = ps;
  if (ps.suspectCell[si] !== null) return;
  psMakeQueen(ps, r, c);
  if (ps.contradiction) return;
  ps.occupant[r][c] = si;
  ps.suspectCell[si] = [r, c];
  ps.cellSuspects[r][c] = new Set<number>([si]);
  for (let rr = 0; rr < N; rr++) {
    for (let cc = 0; cc < N; cc++) {
      if (rr === r && cc === c) continue;
      ps.cellSuspects[rr][cc].delete(si);
    }
  }
  ps.order.push(si);
}

// Run the deduction fixpoint. `allowUnitQueen` gates the ONE rule that invents
// an occupied-but-unidentified cell (line/room single with an ambiguous
// occupant): the grader needs it (that is how it reasons past a purely
// geometric squeeze); the hint lookahead runs it OFF for the flat base state
// and turns it ON only inside a single hypothesis (see nextHintFromBoard).
function psPropagate(ps: PropState, allowUnitQueen: boolean): void {
  const { N } = ps;
  let changed = true;
  let guard = 0;
  const guardMax = N * N * N * 4 + 1000;
  while (changed && !ps.contradiction && guard++ < guardMax) {
    changed = false;

    // A cell that can host no one is empty.
    for (let r = 0; r < N && !ps.contradiction; r++) {
      for (let c = 0; c < N; c++) {
        if (ps.state[r][c] === UNKNOWN && ps.cellSuspects[r][c].size === 0) {
          psSetEmpty(ps, r, c);
          changed = true;
        }
      }
    }
    if (ps.contradiction) break;

    // Occupant resolution: a queen whose candidate set is a single suspect.
    for (let r = 0; r < N && !ps.contradiction; r++) {
      for (let c = 0; c < N; c++) {
        if (ps.state[r][c] === QUEEN && ps.occupant[r][c] === -1 && ps.cellSuspects[r][c].size === 1) {
          const si = ps.cellSuspects[r][c].values().next().value as number;
          if (ps.suspectCell[si] === null) { psAssign(ps, r, c, si); changed = true; }
        }
      }
    }
    if (ps.contradiction) break;

    // Suspect single: a suspect that fits exactly one remaining cell.
    for (let si = 0; si < N && !ps.contradiction; si++) {
      if (ps.suspectCell[si] !== null) continue;
      let cnt = 0, fr = -1, fc = -1;
      for (let r = 0; r < N && cnt < 2; r++) {
        for (let c = 0; c < N; c++) {
          if (ps.state[r][c] !== EMPTY && ps.cellSuspects[r][c].has(si)) { cnt++; fr = r; fc = c; if (cnt >= 2) break; }
        }
      }
      if (cnt === 0) { ps.contradiction = true; break; }
      if (cnt === 1) { psAssign(ps, fr, fc, si); changed = true; }
    }
    if (ps.contradiction) break;
    if (changed) continue;

    // Line/room single: a unit with no queen yet and exactly one cell that can
    // still be occupied — that cell must be the queen.
    const tryUnitSingle = (cells: Array<[number, number]>): void => {
      let hasQueen = false, cnt = 0, fr = -1, fc = -1;
      for (const [r, c] of cells) {
        if (ps.state[r][c] === QUEEN) { hasQueen = true; break; }
        if (ps.state[r][c] === UNKNOWN && ps.cellSuspects[r][c].size > 0) { cnt++; fr = r; fc = c; }
      }
      if (hasQueen) return;
      if (cnt === 0) { ps.contradiction = true; return; }
      if (cnt === 1) {
        const cand = ps.cellSuspects[fr][fc];
        if (cand.size === 1) { psAssign(ps, fr, fc, cand.values().next().value as number); changed = true; }
        else if (allowUnitQueen) { psMakeQueen(ps, fr, fc); changed = true; }
      }
    };

    for (let r = 0; r < N && !ps.contradiction; r++) {
      tryUnitSingle(Array.from({ length: N }, (_, c) => [r, c] as [number, number]));
    }
    for (let c = 0; c < N && !ps.contradiction; c++) {
      tryUnitSingle(Array.from({ length: N }, (_, r) => [r, c] as [number, number]));
    }
    const roomCells = new Map<number, Array<[number, number]>>();
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const room = ps.map[r][c];
        if (!roomCells.has(room)) roomCells.set(room, []);
        roomCells.get(room)!.push([r, c]);
      }
    }
    for (const cells of roomCells.values()) {
      if (ps.contradiction) break;
      tryUnitSingle(cells);
    }
  }
}

export function gradeNoGuess(level: GeneratedLevel): GradeResult {
  const { starterIdx, sol } = level;
  const ps = psCreate(level);
  // The starter is a given: pin it first so its geometry propagates.
  psAssign(ps, sol[starterIdx][0], sol[starterIdx][1], starterIdx);
  psPropagate(ps, true);

  if (ps.contradiction) return { solvable: false, order: [] };

  // Fully solved only if every suspect is pinned to its solution cell.
  for (let si = 0; si < level.N; si++) {
    const cell = ps.suspectCell[si];
    if (!cell || cell[0] !== sol[si][0] || cell[1] !== sol[si][1]) {
      return { solvable: false, order: [] };
    }
  }
  return { solvable: true, order: ps.order };
}

// ── Hint engine (built on the gradeNoGuess deduction rules) ────────────────
//
// Finds the SINGLE next step a player can logically take FROM THE CURRENT BOARD
// (their placements + X marks), not from the pristine level. It reuses exactly
// the elementary deductions gradeNoGuess uses — placement fallout (one per
// row/column/room, no king-adjacency), clue predicates, suspect-single and
// unit-single — restricted to the subset a player can actually perform with the
// interface (place a named suspect, or X a cell). It never uses the "occupied
// but unidentified" intermediate that the UI can't represent.
//
// Consistency: deduction from a false premise is meaningless, so before hinting
// we check the board against the known unique solution. A misplaced suspect or
// an X sitting on a solution cell returns `inconsistent` (the solution is used
// ONLY to refuse — never to choose the next step).

export type HintResult =
  | { kind: "solved" }
  | { kind: "inconsistent"; reason: "wrong-suspect" | "x-on-solution" | "dot-not-occupied"; suspectIdx: number | null; cell: [number, number] }
  | { kind: "eliminate"; rule: "room" | "row" | "col" | "adjacency" | "no-candidate"; sourceSuspectIdx: number | null; sourceCell: [number, number] | null; unitCells: Array<[number, number]>; targetCells: Array<[number, number]> }
  | { kind: "place"; rule: "clue-single" | "unit-room" | "unit-row" | "unit-col" | "occupant"; suspectIdx: number | null; unitCells: Array<[number, number]>; targetCell: [number, number] }
  // A conclusion reached by internally hypothesising that a forced-occupied cell
  // is occupied and propagating one ply. `premiseCell`/`premiseUnit` describe the
  // hidden middle step ("the Library must hold someone"); the outcome is either a
  // NAMED placement or an elimination the player can actually perform. The dot is
  // never involved — this replaces the old anonymous dead-end entirely.
  | {
      kind: "reasoned";
      premiseRule: "unit-room" | "unit-row" | "unit-col";
      premiseCell: [number, number];
      premiseUnit: Array<[number, number]>;
      outcome:
        | { kind: "place"; suspectIdx: number; unitCells: Array<[number, number]>; targetCell: [number, number] }
        | { kind: "eliminate"; sourceSuspectIdx: number; sourceCell: [number, number]; targetCells: Array<[number, number]> };
    }
  | { kind: "none" };

export type HintBoardCell = number | "X" | "dot" | "skull" | null;

export function nextHintFromBoard(level: GeneratedLevel, board: HintBoardCell[][]): HintResult {
  const { N, map, clues, sol } = level;

  // Index the board. A "dot" is the player's neutral "occupied, identity
  // unknown" note — it plays the role of the intermediate queen that occupant
  // resolution needs, so the engine READS it (it just never suggests placing
  // one). Dots take no part in win-checking or live error-hatching.
  const placedCell = new Array<[number, number] | null>(N).fill(null);
  const isX: boolean[][] = Array.from({ length: N }, () => new Array<boolean>(N).fill(false));
  const isDot: boolean[][] = Array.from({ length: N }, () => new Array<boolean>(N).fill(false));
  const isBlocked: boolean[][] = Array.from({ length: N }, () => new Array<boolean>(N).fill(false)); // skull
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const cell = board[r][c];
      if (cell === "X") isX[r][c] = true;
      else if (cell === "dot") isDot[r][c] = true;
      else if (cell === "skull") isBlocked[r][c] = true;
      else if (typeof cell === "number") placedCell[cell] = [r, c];
    }
  }

  // ── Consistency (uses `sol` ONLY to refuse) ──────────────────────────────
  for (let si = 0; si < N; si++) {
    const p = placedCell[si];
    if (p && (p[0] !== sol[si][0] || p[1] !== sol[si][1])) {
      return { kind: "inconsistent", reason: "wrong-suspect", suspectIdx: si, cell: p };
    }
  }
  for (let si = 0; si < N; si++) {
    const [sr, sc] = sol[si];
    if (isX[sr][sc]) return { kind: "inconsistent", reason: "x-on-solution", suspectIdx: si, cell: [sr, sc] };
  }
  // A dot asserts "someone is here". If it is not a solution cell, nobody can
  // be — caught on Hint just like a misplaced suspect (never live-hatched).
  const isSolutionCell: boolean[][] = Array.from({ length: N }, () => new Array<boolean>(N).fill(false));
  for (let si = 0; si < N; si++) isSolutionCell[sol[si][0]][sol[si][1]] = true;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (isDot[r][c] && !isSolutionCell[r][c]) {
        return { kind: "inconsistent", reason: "dot-not-occupied", suspectIdx: null, cell: [r, c] };
      }
    }
  }

  if (placedCell.every((p) => p !== null)) return { kind: "solved" };

  // Occupied cells = placed suspects (identity known) + dots (identity unknown).
  // Both forbid their row/column/room/king-neighbours and both satisfy their
  // unit. `si` is null for a dot.
  const occ: Array<{ si: number | null; r: number; c: number }> = [];
  placedCell.forEach((p, si) => { if (p) occ.push({ si, r: p[0], c: p[1] }); });
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (isDot[r][c]) occ.push({ si: null, r, c });

  const dots: Array<[number, number]> = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (isDot[r][c]) dots.push([r, c]);

  const isDotCell = (r: number, c: number) => isDot[r][c];
  const isOccupied = (r: number, c: number) => typeof board[r][c] === "number" || isDot[r][c];
  // A cell is "open" if a suspect could still be dropped on it (truly empty).
  const isOpen = (r: number, c: number) => board[r][c] === null;
  // A cell a suspect could still be assigned to: empty OR already dotted
  // (dotting only asserts occupancy, not identity).
  const isPlaceable = (r: number, c: number) => board[r][c] === null || isDot[r][c];

  // Geometry exclusion: an occupied cell forbids its row, column, room and the
  // eight king-adjacent cells.
  const excludedByGeometry = (r: number, c: number): boolean => {
    for (const p of occ) {
      if (p.r === r && p.c === c) continue;
      if (p.r === r || p.c === c) return true;
      if (map[p.r][p.c] === map[r][c]) return true;
      if (Math.abs(p.r - r) <= 1 && Math.abs(p.c - c) <= 1) return true;
    }
    return false;
  };

  // ── Priority 1: eliminations implied by an occupied cell ─────────────────
  // (matches the daily game: one source at a time, room → row/col → adjacency).
  // A dot is a valid source — that is exactly how hints continue past the old
  // dead-end once the player has marked occupied cells.
  const roomCellsOf = (room: number): Array<[number, number]> => {
    const out: Array<[number, number]> = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (map[r][c] === room) out.push([r, c]);
    return out;
  };

  for (const p of occ) {
    const room = map[p.r][p.c];
    const targets = roomCellsOf(room).filter(([r, c]) => isOpen(r, c));
    if (targets.length > 0) {
      return { kind: "eliminate", rule: "room", sourceSuspectIdx: p.si, sourceCell: [p.r, p.c], unitCells: roomCellsOf(room), targetCells: targets };
    }
  }
  for (const p of occ) {
    const rowCells: Array<[number, number]> = Array.from({ length: N }, (_, c) => [p.r, c] as [number, number]);
    const rowTargets = rowCells.filter(([r, c]) => isOpen(r, c));
    if (rowTargets.length > 0) {
      return { kind: "eliminate", rule: "row", sourceSuspectIdx: p.si, sourceCell: [p.r, p.c], unitCells: rowCells, targetCells: rowTargets };
    }
    const colCells: Array<[number, number]> = Array.from({ length: N }, (_, r) => [r, p.c] as [number, number]);
    const colTargets = colCells.filter(([r, c]) => isOpen(r, c));
    if (colTargets.length > 0) {
      return { kind: "eliminate", rule: "col", sourceSuspectIdx: p.si, sourceCell: [p.r, p.c], unitCells: colCells, targetCells: colTargets };
    }
  }
  for (const p of occ) {
    const adj: Array<[number, number]> = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = p.r + dr, cc = p.c + dc;
      if (rr >= 0 && rr < N && cc >= 0 && cc < N) adj.push([rr, cc]);
    }
    const adjTargets = adj.filter(([r, c]) => isOpen(r, c));
    if (adjTargets.length > 0) {
      return { kind: "eliminate", rule: "adjacency", sourceSuspectIdx: p.si, sourceCell: [p.r, p.c], unitCells: adj, targetCells: adjTargets };
    }
  }

  // Candidate model for clue-based steps: which UNPLACED suspects can still
  // occupy each placeable cell (clue holds and no occupied cell forbids it).
  // Dotted cells are placeable, so they get candidates too — that is what lets
  // occupant resolution name a dot. The body's cell is never placeable (in the
  // live board it carries the skull; this guard also covers callers that omit
  // it), so no suspect is ever a candidate there.
  const [csR, csC] = level.crimeSceneCell ?? [-1, -1];
  const cand: Array<Array<Set<number>>> = Array.from({ length: N }, () => Array.from({ length: N }, () => new Set<number>()));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!isPlaceable(r, c) || excludedByGeometry(r, c) || (r === csR && c === csC)) continue;
      for (let si = 0; si < N; si++) {
        if (placedCell[si]) continue;
        if (clues[si].check(r, c)) cand[r][c].add(si);
      }
    }
  }

  // ── Priority 2: occupant resolution (a dot with exactly one candidate) ────
  // The dot is already known to be occupied; if only one unplaced suspect can
  // legally be there, that suspect is named — no dotting suggested, just the
  // conclusion.
  for (const [r, c] of dots) {
    if (cand[r][c].size === 1) {
      const si = cand[r][c].values().next().value as number;
      const unit: Array<[number, number]> = [];
      for (let rr = 0; rr < N; rr++) for (let cc = 0; cc < N; cc++) if (clues[si].check(rr, cc)) unit.push([rr, cc]);
      return { kind: "place", rule: "occupant", suspectIdx: si, unitCells: unit, targetCell: [r, c] };
    }
  }

  // ── Priority 3: clue-based dead cell (no unplaced suspect can be here) ────
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (isOpen(r, c) && !excludedByGeometry(r, c) && cand[r][c].size === 0) {
        return { kind: "eliminate", rule: "no-candidate", sourceSuspectIdx: null, sourceCell: null, unitCells: [[r, c]], targetCells: [[r, c]] };
      }
    }
  }

  // ── Priority 4: suspect-single (a suspect fits exactly one placeable cell) ─
  for (let si = 0; si < N; si++) {
    if (placedCell[si]) continue;
    let cnt = 0; let fr = -1, fc = -1;
    for (let r = 0; r < N && cnt < 2; r++) {
      for (let c = 0; c < N; c++) {
        if (cand[r][c].has(si)) { cnt++; fr = r; fc = c; if (cnt >= 2) break; }
      }
    }
    if (cnt === 1) {
      const unit: Array<[number, number]> = [];
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (clues[si].check(r, c)) unit.push([r, c]);
      return { kind: "place", rule: "clue-single", suspectIdx: si, unitCells: unit, targetCell: [fr, fc] };
    }
  }

  // ── Priority 5: unit-single (a row / column / room with one placeable cell) ─
  // When the single viable cell has a KNOWN identity, emit the named placement.
  // When it is anonymous (forced-occupied, identity ambiguous), DON'T dead-end:
  // fall through to the reasoned lookahead below, which hypothesises occupancy
  // and reports the named conclusion that hypothesis unlocks.
  const anonForced: Array<{ cell: [number, number]; unit: Array<[number, number]>; rule: "unit-room" | "unit-row" | "unit-col" }> = [];
  const unitScan = (cells: Array<[number, number]>, rule: "unit-row" | "unit-col" | "unit-room"): HintResult | null => {
    // Skip units already satisfied by an occupied cell (placed suspect or dot).
    if (cells.some(([r, c]) => isOccupied(r, c))) return null;
    const viable = cells.filter(([r, c]) => isPlaceable(r, c) && !excludedByGeometry(r, c) && cand[r][c].size > 0);
    if (viable.length === 1) {
      const [r, c] = viable[0];
      if (cand[r][c].size === 1) {
        const only = cand[r][c].values().next().value as number;
        return { kind: "place", rule, suspectIdx: only, unitCells: cells, targetCell: [r, c] };
      }
      // Forced-occupied but ambiguous — remember it for the lookahead.
      anonForced.push({ cell: [r, c], unit: cells, rule });
    }
    return null;
  };
  for (let r = 0; r < N; r++) {
    const hit = unitScan(Array.from({ length: N }, (_, c) => [r, c] as [number, number]), "unit-row");
    if (hit) return hit;
  }
  for (let c = 0; c < N; c++) {
    const hit = unitScan(Array.from({ length: N }, (_, r) => [r, c] as [number, number]), "unit-col");
    if (hit) return hit;
  }
  const rooms = new Set<number>();
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) rooms.add(map[r][c]);
  for (const room of rooms) {
    const hit = unitScan(roomCellsOf(room), "unit-room");
    if (hit) return hit;
  }

  // ── Reasoned one-ply lookahead (item 4) ──────────────────────────────────
  // For each forced-occupied-but-ambiguous cell, HYPOTHESISE it is occupied
  // (identity unknown), propagate the shared deduction core one ply, and see
  // what named conclusion falls out. This is exactly the grader's own
  // occupied-unknown reasoning, surfaced as a single actionable step — the
  // player never has to mark the intermediate. Read-only: the player's board is
  // untouched.
  //
  // Ranking (as specified): prefer an outcome that NAMES a placement over one
  // that only eliminates; among placements, prefer the shortest chain (fewest
  // newly-forced cells to reach the name). We approximate chain length by the
  // propagation's growth in resolved suspects; ties break by scan order.
  const reasoned = reasonedLookahead(level, placedCell, isDot, anonForced);
  if (reasoned) return reasoned;

  return { kind: "none" };
}

// Build the shared PropState that represents the player's current board, then
// run the reasoned hypotheses. Kept separate to keep nextHintFromBoard legible.
function reasonedLookahead(
  level: GeneratedLevel,
  placedCell: Array<[number, number] | null>,
  isDot: boolean[][],
  anonForced: Array<{ cell: [number, number]; unit: Array<[number, number]>; rule: "unit-room" | "unit-row" | "unit-col" }>,
): HintResult | null {
  if (anonForced.length === 0) return null;
  const { N } = level;

  // Base state = player's board expressed in PropState terms: placed suspects
  // assigned (identity known), dots as unidentified queens, everything else left
  // to the candidate init. Propagate WITHOUT the unit-queen rule so the base is
  // exactly what the player can see; each hypothesis then adds one queen and
  // propagates WITH the full rule set (that is the "one ply" of extra reasoning).
  const makeBase = (): PropState => {
    const ps = psCreate(level);
    for (let si = 0; si < N; si++) {
      const p = placedCell[si];
      if (p) psAssign(ps, p[0], p[1], si);
    }
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (isDot[r][c]) psMakeQueen(ps, r, c);
    psPropagate(ps, false);
    return ps;
  };
  const base = makeBase();
  if (base.contradiction) return null;

  const baseResolved = base.suspectCell.filter((x) => x !== null).length;

  let best: { res: HintResult; isPlace: boolean; chain: number } | null = null;

  for (const forced of anonForced) {
    const [fr, fc] = forced.cell;
    // Skip if the base already resolved this cell (a prior assign covered it).
    if (base.state[fr][fc] === EMPTY) continue;
    const hyp = psClone(base);
    psMakeQueen(hyp, fr, fc);
    if (hyp.contradiction) continue;
    psPropagate(hyp, true);
    if (hyp.contradiction) continue;

    // Did a NEW suspect get named as a direct consequence? Prefer that.
    let placeOutcome: { suspectIdx: number; cell: [number, number] } | null = null;
    for (let si = 0; si < N; si++) {
      if (base.suspectCell[si] === null && hyp.suspectCell[si] !== null) {
        const cell = hyp.suspectCell[si]!;
        // Don't report the premise cell itself as the "placement" — we want a
        // conclusion elsewhere, or a genuine naming of that very cell.
        placeOutcome = { suspectIdx: si, cell: [cell[0], cell[1]] };
        // Prefer naming a cell OTHER than the hypothesised one when possible,
        // but a name on the premise cell is still a valid, useful conclusion.
        if (cell[0] !== fr || cell[1] !== fc) break;
      }
    }

    const chain = hyp.suspectCell.filter((x) => x !== null).length - baseResolved;

    if (placeOutcome) {
      const unit: Array<[number, number]> = [];
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (level.clues[placeOutcome.suspectIdx].check(r, c)) unit.push([r, c]);
      const res: HintResult = {
        kind: "reasoned",
        premiseRule: forced.rule,
        premiseCell: forced.cell,
        premiseUnit: forced.unit,
        outcome: { kind: "place", suspectIdx: placeOutcome.suspectIdx, unitCells: unit, targetCell: placeOutcome.cell },
      };
      if (!best || (!best.isPlace) || chain < best.chain) best = { res, isPlace: true, chain };
      continue;
    }

    // Otherwise: did the hypothesis newly EMPTY any cell the player could X?
    // (An elimination conclusion — weaker than a name, but still progress.)
    const newlyEmpty: Array<[number, number]> = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (base.state[r][c] !== EMPTY && hyp.state[r][c] === EMPTY && !(r === fr && c === fc)) newlyEmpty.push([r, c]);
    }
    if (newlyEmpty.length > 0 && (!best || !best.isPlace)) {
      const res: HintResult = {
        kind: "reasoned",
        premiseRule: forced.rule,
        premiseCell: forced.cell,
        premiseUnit: forced.unit,
        outcome: { kind: "eliminate", sourceSuspectIdx: -1, sourceCell: forced.cell, targetCells: newlyEmpty },
      };
      if (!best) best = { res, isPlace: false, chain };
    }
  }

  return best ? best.res : null;
}


