// Grid of Guilt — instrumented trace of gradeNoGuess on the frozen EASY level.
//
// This file COPIES gradeNoGuess and only the helpers it needs from
// src/app/generator/constraintSolver.ts. The deduction logic is unchanged; the
// ONLY additions are console.log statements (and, for logging attribution, an
// extra `label` parameter threaded into the unit-single helper). Nothing here
// mutates state differently from the original.
//
// It prints:
//   (a) each suspect's candidate cells before any deduction, plus how the
//       crime-scene cell is treated by the grader;
//   (b) every deduction in the order it fires, with the rule responsible;
//   (c) at the point propagation stops, the cells each unplaced suspect can
//       still occupy and, per row/column/room, the cells that can still hold
//       anyone.
//
// All coordinates are printed 1-indexed as (row,col).

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { GeneratedLevel } from "../src/app/generator/puzzleGenerator";
import { suspectsForSize } from "../src/app/generator/suspects";
import { buildLevel, type FrozenLevelData } from "../src/app/levels/loadLevel";

// 1-indexed cell formatter for human-readable output.
const fmt = (r: number, c: number) => `(${r + 1},${c + 1})`;
const fmtList = (cells: Array<[number, number]>) =>
  cells.length ? cells.map(([r, c]) => fmt(r, c)).join(" ") : "(none)";

let SUSPECT_NAMES: string[] = [];
const sname = (si: number) => SUSPECT_NAMES[si] ?? `Suspect ${si + 1}`;

// ── Verbatim copy of constraintSolver internals (logging added) ────────────

const UNKNOWN = 0;
const QUEEN = 1;
const EMPTY = 2;

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

function psCreate(level: Pick<GeneratedLevel, "N" | "map" | "clues">): PropState {
  const { N, map, clues } = level;
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
  return {
    N,
    map,
    cellSuspects,
    state: Array.from({ length: N }, () => new Array<number>(N).fill(UNKNOWN)),
    occupant: Array.from({ length: N }, () => new Array<number>(N).fill(-1)),
    suspectCell: new Array<[number, number] | null>(N).fill(null),
    order: [],
    contradiction: false,
  };
}

function psSetEmpty(ps: PropState, r: number, c: number): void {
  if (ps.state[r][c] === QUEEN) { ps.contradiction = true; return; }
  if (ps.state[r][c] === EMPTY) return;
  ps.state[r][c] = EMPTY;
  ps.cellSuspects[r][c].clear();
}

function psMakeQueen(ps: PropState, r: number, c: number): void {
  const { N, map } = ps;
  if (ps.state[r][c] === EMPTY) { ps.contradiction = true; return; }
  if (ps.state[r][c] === QUEEN) return;
  ps.state[r][c] = QUEEN;
  console.log(`    [occupied] marked ${fmt(r, c)} as occupied (identity not yet bound)`);
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
  console.log(`    [bind] ${sname(si)} -> ${fmt(r, c)}`);
}

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
          console.log(`  rule=no-candidate: ${fmt(r, c)} can host no suspect -> empty`);
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
          if (ps.suspectCell[si] === null) {
            console.log(`  rule=occupant-resolution: occupied ${fmt(r, c)} collapses to ${sname(si)}`);
            psAssign(ps, r, c, si);
            changed = true;
          }
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
      if (cnt === 0) { console.log(`  rule=suspect-single: ${sname(si)} has no legal cell -> contradiction`); ps.contradiction = true; break; }
      if (cnt === 1) {
        console.log(`  rule=suspect-single: ${sname(si)} fits only ${fmt(fr, fc)}`);
        psAssign(ps, fr, fc, si); changed = true;
      }
    }
    if (ps.contradiction) break;
    if (changed) continue;

    // Line/room single: a unit with no queen yet and exactly one cell that can
    // still be occupied — that cell must be the queen.
    const tryUnitSingle = (cells: Array<[number, number]>, label: string): void => {
      let hasQueen = false, cnt = 0, fr = -1, fc = -1;
      for (const [r, c] of cells) {
        if (ps.state[r][c] === QUEEN) { hasQueen = true; break; }
        if (ps.state[r][c] === UNKNOWN && ps.cellSuspects[r][c].size > 0) { cnt++; fr = r; fc = c; }
      }
      if (hasQueen) return;
      if (cnt === 0) { console.log(`  rule=unit-single[${label}]: unit can hold no one -> contradiction`); ps.contradiction = true; return; }
      if (cnt === 1) {
        const cand = ps.cellSuspects[fr][fc];
        if (cand.size === 1) {
          console.log(`  rule=unit-single[${label}]: only ${fmt(fr, fc)} occupiable, single candidate ${sname(cand.values().next().value as number)}`);
          psAssign(ps, fr, fc, cand.values().next().value as number); changed = true;
        }
        else if (allowUnitQueen) {
          console.log(`  rule=unit-single[${label}]: only ${fmt(fr, fc)} occupiable (ambiguous occupant) -> mark occupied`);
          psMakeQueen(ps, fr, fc); changed = true;
        }
      }
    };

    for (let r = 0; r < N && !ps.contradiction; r++) {
      tryUnitSingle(Array.from({ length: N }, (_, c) => [r, c] as [number, number]), `row ${r + 1}`);
    }
    for (let c = 0; c < N && !ps.contradiction; c++) {
      tryUnitSingle(Array.from({ length: N }, (_, r) => [r, c] as [number, number]), `col ${c + 1}`);
    }
    const roomCells = new Map<number, Array<[number, number]>>();
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const room = ps.map[r][c];
        if (!roomCells.has(room)) roomCells.set(room, []);
        roomCells.get(room)!.push([r, c]);
      }
    }
    for (const [room, cells] of roomCells.entries()) {
      if (ps.contradiction) break;
      tryUnitSingle(cells, `room ${room}`);
    }
  }
}

interface GradeResult {
  solvable: boolean;
  order: number[];
}

// Instrumented gradeNoGuess. Logic identical to the original; logging added.
function gradeNoGuessTraced(level: GeneratedLevel): GradeResult {
  const { starterIdx, sol } = level;
  const ps = psCreate(level);

  // ── (a) Pre-deduction snapshot ─────────────────────────────────────────
  console.log("=== (a) BEFORE ANY DEDUCTION ===");
  console.log(`Starter: ${sname(starterIdx)} pinned at ${fmt(sol[starterIdx][0], sol[starterIdx][1])}`);
  console.log("Each suspect's candidate cells (cells whose clue predicate holds):");
  for (let si = 0; si < level.N; si++) {
    const cells: Array<[number, number]> = [];
    for (let r = 0; r < level.N; r++) {
      for (let c = 0; c < level.N; c++) {
        if (ps.cellSuspects[r][c].has(si)) cells.push([r, c]);
      }
    }
    const tag = si === starterIdx ? " [starter]" : "";
    console.log(`  ${sname(si)}${tag}: ${fmtList(cells)}`);
  }

  // Crime-scene treatment: psCreate/psAssign/psMakeQueen/psPropagate never
  // reference crimeSceneCell, so the grader treats it as an ordinary cell.
  const cs = level.crimeSceneCell;
  if (cs) {
    const [cr, cc] = cs;
    const occupants: number[] = [];
    for (let si = 0; si < level.N; si++) if (ps.cellSuspects[cr][cc].has(si)) occupants.push(si);
    console.log(
      `Crime-scene cell ${fmt(cr, cc)}: treated as IGNORED — the grader never ` +
      `blocks or reserves it. It stays occupiable by: ${occupants.length ? occupants.map(sname).join(", ") : "(no suspect)"}.`,
    );
  } else {
    console.log("Crime-scene cell: none recorded on this level.");
  }

  // ── (b) Deductions in order ────────────────────────────────────────────
  console.log("\n=== (b) DEDUCTIONS IN ORDER ===");
  console.log(`Pin starter ${sname(starterIdx)} at ${fmt(sol[starterIdx][0], sol[starterIdx][1])}:`);
  psAssign(ps, sol[starterIdx][0], sol[starterIdx][1], starterIdx);
  console.log("Run propagation fixpoint:");
  psPropagate(ps, true);

  if (ps.contradiction) {
    console.log("Propagation hit a contradiction.");
  }

  // ── (c) State at the point propagation stops ───────────────────────────
  console.log("\n=== (c) STATE WHEN PROPAGATION STOPS ===");
  console.log("Unplaced suspects and the cells each can still occupy:");
  let anyUnplaced = false;
  for (let si = 0; si < level.N; si++) {
    if (ps.suspectCell[si] !== null) continue;
    anyUnplaced = true;
    const cells: Array<[number, number]> = [];
    for (let r = 0; r < level.N; r++) {
      for (let c = 0; c < level.N; c++) {
        if (ps.state[r][c] !== EMPTY && ps.cellSuspects[r][c].has(si)) cells.push([r, c]);
      }
    }
    console.log(`  ${sname(si)}: ${fmtList(cells)}`);
  }
  if (!anyUnplaced) console.log("  (all suspects placed)");

  const occupiable = (r: number, c: number) =>
    ps.state[r][c] === UNKNOWN && ps.cellSuspects[r][c].size > 0;
  const hasQueen = (cells: Array<[number, number]>) => cells.some(([r, c]) => ps.state[r][c] === QUEEN);
  const describeUnit = (cells: Array<[number, number]>) => {
    if (hasQueen(cells)) return "[already holds an occupant]";
    const open = cells.filter(([r, c]) => occupiable(r, c));
    return fmtList(open);
  };

  console.log("Per ROW, cells that can still hold anyone:");
  for (let r = 0; r < level.N; r++) {
    const cells = Array.from({ length: level.N }, (_, c) => [r, c] as [number, number]);
    console.log(`  row ${r + 1}: ${describeUnit(cells)}`);
  }
  console.log("Per COLUMN, cells that can still hold anyone:");
  for (let c = 0; c < level.N; c++) {
    const cells = Array.from({ length: level.N }, (_, r) => [r, c] as [number, number]);
    console.log(`  col ${c + 1}: ${describeUnit(cells)}`);
  }
  console.log("Per ROOM, cells that can still hold anyone:");
  const roomCells = new Map<number, Array<[number, number]>>();
  for (let r = 0; r < level.N; r++) {
    for (let c = 0; c < level.N; c++) {
      const room = level.map[r][c];
      if (!roomCells.has(room)) roomCells.set(room, []);
      roomCells.get(room)!.push([r, c]);
    }
  }
  for (const [room, cells] of roomCells.entries()) {
    const name = level.rooms[room]?.name ?? `room ${room}`;
    console.log(`  ${name} (idx ${room}): ${describeUnit(cells)}`);
  }

  // Final verdict, matching the original gradeNoGuess.
  if (ps.contradiction) return { solvable: false, order: [] };
  for (let si = 0; si < level.N; si++) {
    const cell = ps.suspectCell[si];
    if (!cell || cell[0] !== sol[si][0] || cell[1] !== sol[si][1]) {
      return { solvable: false, order: [] };
    }
  }
  return { solvable: true, order: ps.order };
}

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(here, "..");
  const easyPath = path.join(repoRoot, "src", "app", "levels", "easy.json");
  const frozen = JSON.parse(await readFile(easyPath, "utf8")) as FrozenLevelData;
  const level = buildLevel(frozen);
  SUSPECT_NAMES = suspectsForSize(level.N).map((s) => s.name);

  console.log(`Tracing gradeNoGuess on frozen EASY (N=${level.N}).`);
  console.log(`Suspects: ${SUSPECT_NAMES.map((n, i) => `${i}=${n}`).join(", ")}`);
  console.log(`Murderer: ${sname(level.murdererIdx)} (idx ${level.murdererIdx})\n`);

  const result = gradeNoGuessTraced(level);
  console.log(`\n=== VERDICT ===`);
  console.log(`solvable=${result.solvable}`);
  console.log(`order=${result.order.map(sname).join(" -> ") || "(empty)"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
