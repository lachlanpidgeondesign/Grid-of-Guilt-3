// Grid of Guilt — /play/ hint policy (eliminations-first).
//
// Pure, DOM-free, and read-only. Wraps the shared deduction engine
// (nextHintFromBoard) but GUARANTEES that every forced X-elimination the board
// currently supports is offered before any "place a suspect" step. The engine
// itself is correct but orders a couple of placement cases (notably resolving a
// player-placed dot) ahead of a still-available elimination; this layer lifts
// all forced eliminations above placements without touching the engine, so the
// generator's behaviour is unchanged.
//
// Dots are never suggested — they stay an optional scratch note. They are still
// read as "occupied, identity unknown" (matching the engine) so the geometry
// they imply stays consistent.

import type { GeneratedLevel } from "../app/generator/puzzleGenerator";
import {
  nextHintFromBoard,
  type HintResult,
  type HintBoardCell,
} from "../app/generator/constraintSolver";

/** A /play/-only step: a row/column/room is down to one open square, so someone
 *  must be there. We suggest marking it with a dot (occupied, identity unknown)
 *  so the eliminations around it follow — the identity is named later, once the
 *  dot resolves to a single candidate. The shared engine never emits this. */
export interface OccupyStep {
  kind: "occupy";
  rule: "unit-room" | "unit-row" | "unit-col";
  cell: [number, number];
  unitCells: Array<[number, number]>;
}

export type PlayStep = HintResult | OccupyStep;

/**
 * The next hint step for /play/: forced eliminations first, then identity-led
 * placements, then "a square must be occupied — mark it with a dot" for a unit
 * with one open square, and finally the engine's remaining steps. Inconsistency,
 * solved and "none" pass straight through.
 *
 * The murderer is revealed LAST: no hint places or names the murderer (nor dots
 * their cell) while a non-murderer suspect can still be resolved. Once the
 * murderer is the only one left, the normal steps name them.
 */
export function nextPlayStep(level: GeneratedLevel, board: HintBoardCell[][]): PlayStep {
  const res = nextHintFromBoard(level, board);
  // Terminal / inconsistent / already an elimination — nothing to reorder.
  if (res.kind === "eliminate" || res.kind === "inconsistent" || res.kind === "solved" || res.kind === "none") {
    return res;
  }
  // res is "place" or "reasoned". Serve any forced X first (eliminations never
  // reveal the murderer, so they're always safe).
  const elim = findForcedElimination(level, board);
  if (elim) return elim;

  const mi = level.murdererIdx;
  const murderCell = level.sol[mi];

  // Identity-led placement of a NON-murderer (a specific suspect fits exactly one
  // cell, or a dot the player placed resolves to one identity) — the natural
  // direct move.
  if (res.kind === "place" && (res.rule === "occupant" || res.rule === "clue-single") && res.suspectIdx !== mi) {
    return res;
  }

  // Otherwise a unit is down to one open square — suggest marking it occupied (a
  // dot). Prefer a square that isn't the murderer's, so we never point at them
  // while anyone else can still be resolved.
  const occupyNonMurderer = findForcedOccupied(level, board, murderCell);
  if (occupyNonMurderer) return occupyNonMurderer;

  // Nothing left but the murderer. Name them if the engine's own step does so
  // (genuinely last); otherwise fall back to a dot on their cell, else the step.
  if (res.kind === "place" && (res.rule === "occupant" || res.rule === "clue-single")) return res;
  const occupy = findForcedOccupied(level, board);
  if (occupy) return occupy;
  return res;
}

/**
 * Find a forced X-elimination the board currently supports, scanning in the
 * same order the engine uses (room → row → column → adjacency → no-candidate)
 * so the wording and highlights match. Returns null when no open cell can be
 * ruled out yet. Mirrors the engine's P1/P3 candidate model.
 */
export function findForcedElimination(level: GeneratedLevel, board: HintBoardCell[][]): HintResult | null {
  const { N, map, clues } = level;

  const placedCell = new Array<[number, number] | null>(N).fill(null);
  const isDot: boolean[][] = Array.from({ length: N }, () => new Array<boolean>(N).fill(false));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const cell = board[r][c];
      if (cell === "dot") isDot[r][c] = true;
      else if (typeof cell === "number") placedCell[cell] = [r, c];
    }
  }

  // Occupied cells = placed suspects (identity known) + dots (identity unknown).
  const occ: Array<{ si: number | null; r: number; c: number }> = [];
  placedCell.forEach((p, si) => { if (p) occ.push({ si, r: p[0], c: p[1] }); });
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (isDot[r][c]) occ.push({ si: null, r, c });

  const isOpen = (r: number, c: number) => board[r][c] === null;

  const excludedByGeometry = (r: number, c: number): boolean => {
    for (const p of occ) {
      if (p.r === r && p.c === c) continue;
      if (p.r === r || p.c === c) return true;
      if (map[p.r][p.c] === map[r][c]) return true;
      if (Math.abs(p.r - r) <= 1 && Math.abs(p.c - c) <= 1) return true;
    }
    return false;
  };

  const roomCellsOf = (room: number): Array<[number, number]> => {
    const out: Array<[number, number]> = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (map[r][c] === room) out.push([r, c]);
    return out;
  };

  // P1a: an occupied cell rules out the open cells in its room.
  for (const p of occ) {
    const room = map[p.r][p.c];
    const targets = roomCellsOf(room).filter(([r, c]) => isOpen(r, c));
    if (targets.length > 0) {
      return { kind: "eliminate", rule: "room", sourceSuspectIdx: p.si, sourceCell: [p.r, p.c], unitCells: roomCellsOf(room), targetCells: targets };
    }
  }
  // P1b: ...its row, then its column.
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
  // P1c: ...the eight king-adjacent cells.
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

  // P3: an open, non-geometry-excluded cell no remaining suspect's clue allows.
  const [csR, csC] = level.crimeSceneCell ?? [-1, -1];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!isOpen(r, c) || excludedByGeometry(r, c) || (r === csR && c === csC)) continue;
      let hasCandidate = false;
      for (let si = 0; si < N; si++) {
        if (placedCell[si]) continue;
        if (clues[si].check(r, c)) { hasCandidate = true; break; }
      }
      if (!hasCandidate) {
        return { kind: "eliminate", rule: "no-candidate", sourceSuspectIdx: null, sourceCell: null, unitCells: [[r, c]], targetCells: [[r, c]] };
      }
    }
  }

  return null;
}

/**
 * Find a unit (row, column or room) that has exactly one open square a suspect
 * could still occupy — so that square must be occupied. Returns the first such
 * cell (row → column → room scan order) that isn't already marked, so the hint
 * can suggest dotting it. When `avoidCell` is given, units whose single open
 * square is that cell are skipped (used to defer the murderer's own cell). Null
 * when no eligible unit is down to a single open square.
 */
export function findForcedOccupied(
  level: GeneratedLevel,
  board: HintBoardCell[][],
  avoidCell: [number, number] | null = null,
): OccupyStep | null {
  const { N, map, clues } = level;

  const placedCell = new Array<[number, number] | null>(N).fill(null);
  const isDot: boolean[][] = Array.from({ length: N }, () => new Array<boolean>(N).fill(false));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const cell = board[r][c];
      if (cell === "dot") isDot[r][c] = true;
      else if (typeof cell === "number") placedCell[cell] = [r, c];
    }
  }

  const occ: Array<{ r: number; c: number }> = [];
  placedCell.forEach((p) => { if (p) occ.push({ r: p[0], c: p[1] }); });
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (isDot[r][c]) occ.push({ r, c });

  const [csR, csC] = level.crimeSceneCell ?? [-1, -1];
  const isOpen = (r: number, c: number) => board[r][c] === null;
  const isOccupied = (r: number, c: number) => typeof board[r][c] === "number" || isDot[r][c];

  const excludedByGeometry = (r: number, c: number): boolean => {
    for (const p of occ) {
      if (p.r === r && p.c === c) continue;
      if (p.r === r || p.c === c) return true;
      if (map[p.r][p.c] === map[r][c]) return true;
      if (Math.abs(p.r - r) <= 1 && Math.abs(p.c - c) <= 1) return true;
    }
    return false;
  };
  const candidateBearing = (r: number, c: number): boolean => {
    if (r === csR && c === csC) return false;
    for (let si = 0; si < N; si++) {
      if (placedCell[si]) continue;
      if (clues[si].check(r, c)) return true;
    }
    return false;
  };
  // Cells in a unit a suspect could still legally occupy.
  const viableIn = (cells: Array<[number, number]>) =>
    cells.filter(([r, c]) => isOpen(r, c) && !excludedByGeometry(r, c) && candidateBearing(r, c));

  const scan = (cells: Array<[number, number]>, rule: OccupyStep["rule"]): OccupyStep | null => {
    // A unit already holding a suspect or dot is satisfied — skip it.
    if (cells.some(([r, c]) => isOccupied(r, c))) return null;
    const viable = viableIn(cells);
    if (viable.length !== 1) return null;
    const [vr, vc] = viable[0];
    // Skip the deferred cell (the murderer's own square) so it's never the hint.
    if (avoidCell && vr === avoidCell[0] && vc === avoidCell[1]) return null;
    return { kind: "occupy", rule, cell: viable[0], unitCells: cells };
  };

  for (let r = 0; r < N; r++) {
    const hit = scan(Array.from({ length: N }, (_, c) => [r, c] as [number, number]), "unit-row");
    if (hit) return hit;
  }
  for (let c = 0; c < N; c++) {
    const hit = scan(Array.from({ length: N }, (_, r) => [r, c] as [number, number]), "unit-col");
    if (hit) return hit;
  }
  const rooms = new Set<number>();
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) rooms.add(map[r][c]);
  for (const room of rooms) {
    const cells: Array<[number, number]> = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (map[r][c] === room) cells.push([r, c]);
    const hit = scan(cells, "unit-room");
    if (hit) return hit;
  }

  return null;
}
