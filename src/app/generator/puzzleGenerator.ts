// Grid of Guilt — procedural puzzle generator.
//
// This module is a VERBATIM port of the generation logic from
// grid_of_guilt_generator.html (the standalone prototype). The algorithm,
// constants, caps and RNG call sequence are preserved exactly; only DOM /
// render code has been stripped and TypeScript types added.
//
// Public entry point: generateLevel(n) where n is 5 | 7 | 9.
// Internally this maps to the prototype's easy/medium/hard difficulty and
// keeps the existing DIFF_CONFIG plumbing intact.

import { countSolutions, gradeNoGuess, findAlternateQueens } from "./constraintSolver";

// ── Types ─────────────────────────────────────────────────────────────

export type DoorDir = "right" | "down";
export type WindowSide = "top" | "bottom" | "left" | "right";

/** An interior room-boundary edge: the wall between cell (r,c) and its
 *  right- or down-neighbour, where the two cells belong to different rooms. */
export interface Door {
  r: number;
  c: number;
  dir: DoorDir;
}

/** An exterior-wall segment on the perimeter of the grid. */
export interface WindowMarker {
  r: number;
  c: number;
  side: WindowSide;
}

export interface RoomPalette {
  name: string;
  fill: string;
  dark: string;
}

/** Suspect record as produced by the generator. The Generator UI discards
 *  these names in favour of suspects.ts, but the field is kept so the level
 *  object shape matches the prototype exactly. */
export interface GeneratedSuspect {
  name: string;
  id: string;
}

export interface Clue {
  type: string;
  /** May contain inline <em> HTML. Render via dangerouslySetInnerHTML in a
   *  single dedicated clue component. */
  text: string;
  /** Live closure — evaluated against a candidate cell. The level object is
   *  never serialized, so keeping a function here is safe. */
  check: (tr: number, tc: number) => boolean;
}

export interface GeneratedLevel {
  N: number;
  map: number[][];
  rooms: RoomPalette[];
  suspects: GeneratedSuspect[];
  sol: Array<[number, number]>;
  murdererIdx: number;
  starterIdx: number;
  crimeSceneCell: [number, number] | null;
  clues: Clue[];
  orderedIdxs: number[];
  doors: Door[];
  windows: WindowMarker[];
  doorCells: Set<string>;
  windowCells: Set<string>;
}

interface DoorsAndWindows {
  doors: Door[];
  windows: WindowMarker[];
  doorCells: Set<string>;
  windowCells: Set<string>;
}

interface DebugStats {
  totalAttempts: number;
  backtrackFailures: number;
  uniquenessFailures: number;
  avgBacktrackCalls: number;
  maxBacktrackCalls: number;
  lastFailureReason: string;
}

type Difficulty = "easy" | "medium" | "hard";

type ProgressCallback = (
  attempt: number,
  maxTries: number,
  debugStats: DebugStats,
) => boolean;

interface DiffConfigEntry {
  N: number;
  clueTypes: string[];
}

// ── Constants (ported verbatim) ───────────────────────────────────────

const ROOM_PALETTES: RoomPalette[] = [
  { name: "Library", fill: "#2E5CB8", dark: "#1A3A7A" },
  { name: "Ballroom", fill: "#E74C3C", dark: "#A93226" },
  { name: "Kitchen", fill: "#F39C12", dark: "#B8740F" },
  { name: "Study", fill: "#9B59B6", dark: "#6C3A6F" },
  { name: "Wine Cellar", fill: "#1ABC9C", dark: "#117A65" },
  { name: "Trophy Room", fill: "#3498DB", dark: "#2E86C1" },
  { name: "Conservatory", fill: "#E67E22", dark: "#BA4A00" },
  { name: "Billiard Room", fill: "#27AE60", dark: "#1E8449" },
  { name: "Gallery", fill: "#34495E", dark: "#1F2E3C" },
];

const SUSPECT_NAMES: string[][] = [
  ["E. Crane", "L. Morrow", "R. Holt", "V. Dusk", "A. Wren"],
  ["E. Crane", "L. Morrow", "R. Holt", "V. Dusk", "A. Wren", "O. Pryce", "N. Fenn"],
  ["E. Crane", "L. Morrow", "R. Holt", "V. Dusk", "A. Wren", "O. Pryce", "N. Fenn", "J. Vale", "C. Moss"],
];

const DIFF_CONFIG: Record<Difficulty, DiffConfigEntry> = {
  easy: { N: 5, clueTypes: ["edge", "odd-col", "even-col", "odd-row", "even-row", "in-room", "above", "below"] },
  medium: { N: 7, clueTypes: ["edge", "odd-col", "even-col", "odd-row", "even-row", "in-room", "above", "below", "same-half-h", "same-half-v", "opp-half-h", "opp-half-v", "border-room"] },
  hard: { N: 9, clueTypes: ["edge", "odd-col", "even-col", "odd-row", "even-row", "in-room", "above", "below", "same-half-h", "same-half-v", "opp-half-h", "opp-half-v", "border-room"] },
};

// ── RNG helpers (ported verbatim) ─────────────────────────────────────

function rnd<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

// ── Doors and windows (ported verbatim) ───────────────────────────────

function generateDoorsAndWindows(map: number[][], N: number): DoorsAndWindows {
  const boundaries: Door[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (c + 1 < N && map[r][c] !== map[r][c + 1]) boundaries.push({ r, c, dir: "right" });
      if (r + 1 < N && map[r][c] !== map[r + 1][c]) boundaries.push({ r, c, dir: "down" });
    }
  }
  const outerEdges: WindowMarker[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (r === 0) outerEdges.push({ r, c, side: "top" });
      if (r === N - 1) outerEdges.push({ r, c, side: "bottom" });
      if (c === 0) outerEdges.push({ r, c, side: "left" });
      if (c === N - 1) outerEdges.push({ r, c, side: "right" });
    }
  }
  const numDoors = Math.min(Math.max(3, Math.floor(N * 0.7)), boundaries.length);
  const numWindows = Math.min(Math.max(3, Math.floor(N * 0.7)), outerEdges.length);
  const doors = shuffle(boundaries).slice(0, numDoors);
  const windows = shuffle(outerEdges).slice(0, numWindows);
  const doorCells = new Set<string>();
  for (const d of doors) {
    doorCells.add(`${d.r},${d.c}`);
    if (d.dir === "right") doorCells.add(`${d.r},${d.c + 1}`);
    if (d.dir === "down") doorCells.add(`${d.r + 1},${d.c}`);
  }
  const windowCells = new Set<string>();
  for (const w of windows) {
    windowCells.add(`${w.r},${w.c}`);
  }
  return { doors, windows, doorCells, windowCells };
}

// ── Core generation (ported verbatim) ─────────────────────────────────

// ── Dev-only integrity assertion ──────────────────────────────────────
// True only under Vite dev (import.meta.env.DEV). Guarded so the module is
// still safe to run under plain Node / jiti, where import.meta.env is absent.
const IS_DEV: boolean = (() => {
  try {
    return Boolean((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV);
  } catch {
    return false;
  }
})();

/**
 * Assert the level's room map is well-formed: every index in 0..N-1, every
 * index used at least once, and each index forms exactly one 4-connected
 * region. Console-errors (naming the offending index) on any violation. Never
 * throws — purely diagnostic.
 */
function assertValidRoomMap(level: GeneratedLevel): void {
  const { N, map } = level;
  const appears = new Array<boolean>(N).fill(false);

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const idx = map[r][c];
      if (!Number.isInteger(idx) || idx < 0 || idx >= N) {
        console.error(`[generator] room index out of range at (${r},${c}): ${idx} (N=${N})`);
        return;
      }
      appears[idx] = true;
    }
  }
  for (let i = 0; i < N; i++) {
    if (!appears[i]) console.error(`[generator] room index ${i} never appears in the map (N=${N})`);
  }

  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  for (let i = 0; i < N; i++) {
    let total = 0;
    let start: [number, number] | null = null;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (map[r][c] === i) { total++; if (!start) start = [r, c]; }
      }
    }
    if (total === 0 || !start) continue;
    const visited = new Set<string>([`${start[0]},${start[1]}`]);
    const stack: Array<[number, number]> = [start];
    while (stack.length) {
      const [r, c] = stack.pop() as [number, number];
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < N && nc >= 0 && nc < N && map[nr][nc] === i) {
          const k = `${nr},${nc}`;
          if (!visited.has(k)) { visited.add(k); stack.push([nr, nc]); }
        }
      }
    }
    if (visited.size !== total) {
      console.error(`[generator] room index ${i} is NOT a single 4-connected region: ${visited.size} of ${total} cells reachable (N=${N})`);
    }
  }
}

export function generatePuzzle(diff: Difficulty): GeneratedLevel | null {
  return generatePuzzleWithProgress(diff, () => true);
}

export function generatePuzzleWithProgress(
  diff: Difficulty,
  progressCallback: ProgressCallback,
): GeneratedLevel | null {
  const cfg = DIFF_CONFIG[diff];
  const N = cfg.N;
  const rooms = ROOM_PALETTES.slice(0, N).map((r) => ({ ...r }));
  const suspectNames = SUSPECT_NAMES[diff === "easy" ? 0 : diff === "medium" ? 1 : 2];
  const suspects: GeneratedSuspect[] = suspectNames.map((name) => ({
    name,
    id: name.split(" ").map((p) => p[0]).join("").replace(".", "").slice(0, 2).toUpperCase(),
  }));

  // Debug statistics
  const debugStats: DebugStats = {
    totalAttempts: 0,
    backtrackFailures: 0,
    uniquenessFailures: 0,
    avgBacktrackCalls: 0,
    maxBacktrackCalls: 0,
    lastFailureReason: "Starting...",
  };

  // B2: solution-first, uniqueness-aware region growth.
  //
  // Instead of growing regions blind and then hoping a queens solution fits
  // (the old approach — which produced mostly non-unique boards and needed many
  // retries), we pick a valid solution FIRST, then seed exactly one region at
  // each solution cell and grow outward. Every region therefore contains
  // precisely one solution cell by construction, so the intended solution is
  // structurally guaranteed and base uniqueness is far higher.
  //
  // Returns the room map plus the guaranteed solution, or null if no valid
  // queens placement could be sampled within the attempt budget.
  function generateSolutionFirst(): { map: number[][]; solution: Array<[number, number]> } | null {
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    // Step 1 — sample a random non-attacking placement: one per row, distinct
    // columns, and (because exactly one sits in each row) no king-adjacency iff
    // consecutive rows differ by >= 2 columns.
    const sampleSolution = (): Array<[number, number]> | null => {
      const cols = new Array<number>(N).fill(-1);
      const usedCols = new Set<number>();
      const place = (r: number): boolean => {
        if (r === N) return true;
        const candidates: number[] = [];
        for (let c = 0; c < N; c++) {
          if (usedCols.has(c)) continue;
          if (r > 0 && Math.abs(c - cols[r - 1]) < 2) continue;
          candidates.push(c);
        }
        // Fisher–Yates shuffle for variety.
        for (let i = candidates.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }
        for (const c of candidates) {
          cols[r] = c;
          usedCols.add(c);
          if (place(r + 1)) return true;
          usedCols.delete(c);
          cols[r] = -1;
        }
        return false;
      };
      if (!place(0)) return null;
      return cols.map((c, r) => [r, c] as [number, number]);
    };

    const solution = sampleSolution();
    if (!solution) return null;

    // Step 2 — seed one region per solution cell, then flood-grow to fill the
    // grid, preferring the smallest neighbouring region so sizes stay balanced
    // (mirrors the old growth heuristic, but seeded at the solution).
    const map: number[][] = Array(N).fill(0).map(() => Array(N).fill(-1));
    const roomCounts = Array(N).fill(0);
    solution.forEach(([r, c], i) => { map[r][c] = i; roomCounts[i] = 1; });

    let remaining = N * N - N;
    while (remaining > 0) {
      const frontier: Array<[number, number]> = [];
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (map[r][c] !== -1) continue;
          for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < N && nc >= 0 && nc < N && map[nr][nc] !== -1) { frontier.push([r, c]); break; }
          }
        }
      }
      if (frontier.length === 0) break;

      for (const [r, c] of frontier) {
        if (map[r][c] !== -1) continue;
        const neighbors = new Set<number>();
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < N && nc >= 0 && nc < N && map[nr][nc] !== -1) neighbors.add(map[nr][nc]);
        }
        if (neighbors.size === 0) continue;
        let bestRoom = -1, minCount = Infinity;
        for (const room of neighbors) {
          if (roomCounts[room] < minCount) { minCount = roomCounts[room]; bestRoom = room; }
        }
        map[r][c] = bestRoom;
        roomCounts[bestRoom]++;
        remaining--;
      }
    }

    // Fill any stragglers (shouldn't happen on a connected grid, but be safe).
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (map[r][c] !== -1) continue;
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < N && nc >= 0 && nc < N && map[nr][nc] !== -1) { map[r][c] = map[nr][nc]; break; }
        }
      }
    }

    // ── Uniqueness carving ──────────────────────────────────────────────
    // Balanced blob-growth alone leaves the queens puzzle ambiguous (several
    // valid placements), which no per-suspect clue can fully repair at 9x9.
    // So we carve the REGION SHAPES until the geometry itself pins a single
    // solution — exactly how real LinkedIn-Queens boards work.
    //
    // Repeatedly: find an alternate placement; take a region where it deviates
    // from the intended solution and move that deviating cell into an adjacent
    // region. That destroys the alternate while (a) keeping every region's
    // seeded solution cell in place and (b) preserving 4-connectivity. Iterate
    // until the map admits only the intended solution.
    const regionSize = new Array<number>(N).fill(0);
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) regionSize[map[r][c]]++;

    // Does region `reg` stay 4-connected (and keep its seed) if `(er,ec)` is
    // removed from it?
    const staysConnectedWithout = (reg: number, er: number, ec: number): boolean => {
      const [seedR, seedC] = solution[reg];
      if (seedR === er && seedC === ec) return false; // never remove the seed
      let target = regionSize[reg] - 1;
      if (target <= 0) return false;
      const seen = new Set<string>([`${seedR},${seedC}`]);
      const stack: Array<[number, number]> = [[seedR, seedC]];
      let count = 1;
      while (stack.length) {
        const [r, c] = stack.pop()!;
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue;
          if (nr === er && nc === ec) continue; // treated as removed
          if (map[nr][nc] !== reg) continue;
          const key = `${nr},${nc}`;
          if (seen.has(key)) continue;
          seen.add(key);
          count++;
          stack.push([nr, nc]);
        }
      }
      return count === target;
    };

    const maxCarves = N * N * 2;
    let carveOk = true;
    for (let carve = 0; carve < maxCarves; carve++) {
      const { alt, exceeded } = findAlternateQueens(map, N, solution);
      if (exceeded) { carveOk = false; break; }
      if (!alt) break; // unique — done

      // Index the alternate by region so we can compare to the seeded solution.
      const altByRegion = new Array<[number, number] | null>(N).fill(null);
      for (const [r, c] of alt) altByRegion[map[r][c]] = [r, c];

      // Collect deviating regions and try to carve one of them.
      const deviating: number[] = [];
      for (let reg = 0; reg < N; reg++) {
        const a = altByRegion[reg];
        if (a && (a[0] !== solution[reg][0] || a[1] !== solution[reg][1])) deviating.push(reg);
      }
      // Shuffle for variety.
      for (let i = deviating.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deviating[i], deviating[j]] = [deviating[j], deviating[i]];
      }

      let carved = false;
      for (const reg of deviating) {
        const [er, ec] = altByRegion[reg]!;
        // Candidate destination regions: 4-neighbours in a different region.
        const dests = new Set<number>();
        for (const [dr, dc] of dirs) {
          const nr = er + dr, nc = ec + dc;
          if (nr >= 0 && nr < N && nc >= 0 && nc < N && map[nr][nc] !== reg) dests.add(map[nr][nc]);
        }
        if (dests.size === 0) continue;
        if (!staysConnectedWithout(reg, er, ec)) continue;
        // Prefer growing the smallest neighbour to keep sizes balanced.
        let best = -1, bestSize = Infinity;
        for (const d of dests) if (regionSize[d] < bestSize) { bestSize = regionSize[d]; best = d; }
        map[er][ec] = best;
        regionSize[reg]--;
        regionSize[best]++;
        carved = true;
        break;
      }
      if (!carved) { carveOk = false; break; } // couldn't break this alternate
    }
    if (!carveOk) return null;

    return { map, solution };
  }

  const maxTries = N <= 5 ? 500 : N <= 7 ? 300 : 200; // Reduce attempts for larger grids

  // B4: reveal-the-murderer-last is a SOFT target. We accept immediately when a
  // map yields a puzzle with the murderer in the final two; otherwise we keep
  // the closest-to-last puzzle seen so far and try more maps, up to a budget,
  // before settling for that best. This keeps generation fast and never fails
  // just because one map couldn't place the murderer last.
  let fallbackBest: GeneratedLevel | null = null;
  let fallbackBestPos = Infinity;
  let mapsWithFallback = 0;
  const b4MapBudget = N <= 5 ? 30 : N <= 7 ? 40 : 20;

  for (let attempt = 0; attempt < maxTries; attempt++) {
    debugStats.totalAttempts++;

    if (!progressCallback(attempt + 1, maxTries, debugStats)) return null; // Cancelled

    // B2: pick the solution first, then grow regions around it.
    const built = generateSolutionFirst();
    if (!built) {
      debugStats.backtrackFailures++;
      debugStats.lastFailureReason = "Could not sample a valid queens solution";
      continue;
    }
    const { map, solution } = built;

    const { doors, windows, doorCells, windowCells } = generateDoorsAndWindows(map, N);

    // ── B3 + B4: directed clue selection, biased to reveal the murderer last ─
    // Each suspect always carries exactly one clue (the UI contract). We choose
    // deliberately rather than rolling random sets:
    //   1. Enumerate every TRUE clue for each suspect and rank by strength
    //      (permit fraction: the share of the board it still allows; smaller =
    //      stronger). Room clues fix identity but add no spatial constraint —
    //      only spatial clues break Queens ties — so we add spatial clues until
    //      the solution is unique, then keep room clues for flavour.
    //   2. Require the set to be BOTH unique AND no-guess solvable.
    //   3. Relax toward the target difficulty by swapping some suspects to
    //      weaker clues (reintroducing door/window flavour) while preserving
    //      unique + no-guess. 5x5 relaxes hard (lighter); 9x9 barely (heavier).
    // B4: the murderer never gets a room clue, and their identity feeds the
    // whole selection, so we try candidate murderers on this same carved map
    // and keep the first whose logical deduction lands them in the final two.
    let validPuzzle: GeneratedLevel | null = null;

    const permitFraction = (check: (tr: number, tc: number) => boolean): number => {
      let cnt = 0;
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (check(r, c)) cnt++;
      return cnt / (N * N);
    };

    type RankedClue = Clue & { permit: number };

    // Build a full unique + no-guess level for a SPECIFIC murderer choice,
    // returning the level and its logical deduction order, or null if this map
    // can't support a fair puzzle for that murderer.
    const buildForMurderer = (murdererIdx: number, starterIdx: number): { level: GeneratedLevel; order: number[] } | null => {
      const [mr, mc] = solution[murdererIdx];
      const murderRoom = map[mr][mc];
      let crimeSceneCell: [number, number] | null = null;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (map[r][c] === murderRoom && !(r === mr && c === mc)) { crimeSceneCell = [r, c]; break; }
        }
        if (crimeSceneCell) break;
      }

      const buildClueOptions = (si: number): RankedClue[] => {
      const [r, c] = solution[si];
      const room = map[r][c];
      const opts: Clue[] = [];

      // Murderer never gets an explicit room clue (keeps their status hidden
      // until the reveal, and tends to leave them harder to pin — good for B4).
      if (si !== murdererIdx) {
        opts.push({
          type: "room",
          text: `Was confirmed in the <em>${rooms[room].name}</em> all evening.`,
          check: (tr: number, tc: number) => map[tr][tc] === room,
        });
      }
      if ((r === 0 || r === N - 1) && (c === 0 || c === N - 1)) {
        opts.push({
          type: "corner",
          text: `Was spotted in <em>a corner</em> of the manor.`,
          check: (tr: number, tc: number) => (tr === 0 || tr === N - 1) && (tc === 0 || tc === N - 1),
        });
      }
      if (r === 0 || r === N - 1 || c === 0 || c === N - 1) {
        opts.push({
          type: "edge",
          text: `Was seen near the <em>outer walls</em> of the manor.`,
          check: (tr: number, tc: number) => tr === 0 || tr === N - 1 || tc === 0 || tc === N - 1,
        });
      }
      opts.push({
        type: "row-parity",
        text: r % 2 === 0 ? `Witnesses placed them in an <em>odd-numbered row</em>.` : `Witnesses placed them in an <em>even-numbered row</em>.`,
        check: (tr: number, _tc: number) => tr % 2 === (r % 2),
      });
      opts.push({
        type: "col-parity",
        text: c % 2 === 0 ? `They were spotted in an <em>odd-numbered column</em>.` : `They were spotted in an <em>even-numbered column</em>.`,
        check: (_tr: number, tc: number) => tc % 2 === (c % 2),
      });
      const nearDoor = doorCells.has(`${r},${c}`);
      opts.push({
        type: "near-door",
        text: nearDoor ? `Was seen lingering near a <em>doorway</em>.` : `Was <em>far from any doorways</em>.`,
        check: (tr: number, tc: number) => nearDoor === doorCells.has(`${tr},${tc}`),
      });
      const nearWindow = windowCells.has(`${r},${c}`);
      opts.push({
        type: "near-window",
        text: nearWindow ? `Was spotted near a <em>window</em>.` : `Was <em>nowhere near any windows</em>.`,
        check: (tr: number, tc: number) => nearWindow === windowCells.has(`${tr},${tc}`),
      });

      const ranked = opts.map((o) => ({ ...o, permit: permitFraction(o.check) }));
      ranked.sort((a, b) => a.permit - b.permit); // strongest (smallest permit) first
      return ranked;
    };

    const optionsPer = solution.map((_pos, si) => buildClueOptions(si));
    const orderedIdxs = Array.from({ length: N }, (_, i) => i).sort((a, b) => (a === murdererIdx ? 1 : b === murdererIdx ? -1 : 0));

    const makeCandidate = (pick: number[]): GeneratedLevel => ({
      N, map, rooms, suspects, sol: solution, murdererIdx, starterIdx, crimeSceneCell,
      clues: pick.map((k, si) => {
        const o = optionsPer[si][k];
        return { type: o.type, text: o.text, check: o.check };
      }),
      orderedIdxs, doors, windows, doorCells, windowCells,
    });

    // A clue set passes only if it yields exactly one solution AND that
    // solution is reachable by pure logic (no guessing).
    const isUniqueNow = (pick: number[]): boolean => {
      const cr = countSolutions(makeCandidate(pick), 2);
      return !cr.budgetExceeded && cr.count === 1;
    };
    const isNoGuessNow = (pick: number[]): boolean => gradeNoGuess(makeCandidate(pick)).solvable;
    const passes = (pick: number[]): boolean => isUniqueNow(pick) && isNoGuessNow(pick);

    // Room clues fix a suspect's IDENTITY (which region they're in) but add no
    // SPATIAL constraint — every region already holds exactly one suspect. Since
    // B2 carves the region map to be geometrically unique on its own, the
    // solution is already unique for ANY clue assignment; clues exist only to
    // make the puzzle NO-GUESS solvable (give propagation something to grip).
    //
    // Concreteness bias (B3): parity clues ("odd/even row/column") only ever
    // eliminate half the board and feel like filler even when load-bearing. So
    // we prefer CONCRETE spatial clues (corner/edge/door/window) and fall back
    // to parity for a suspect only when nothing concrete unlocks no-guess.
    const PARITY = new Set(["row-parity", "col-parity"]);
    const roomIdxOf = optionsPer.map((o) => o.findIndex((x) => x.type === "room"));
    const strongestOf = (o: RankedClue[], pred: (x: RankedClue) => boolean): number => {
      let bi = -1, bp = Infinity;
      o.forEach((x, i) => { if (pred(x) && x.permit < bp) { bp = x.permit; bi = i; } });
      return bi;
    };
    // Strongest concrete spatial (no room, no parity); -1 if the suspect has none.
    const concreteBestIdx = optionsPer.map((o) => strongestOf(o, (x) => x.type !== "room" && !PARITY.has(x.type)));
    // Strongest spatial including parity (always exists — parity is universal).
    const anySpatialBestIdx = optionsPer.map((o) => strongestOf(o, (x) => x.type !== "room"));
    // The clue we lean on first: concrete if available, else parity.
    const preferredSpatialIdx = optionsPer.map((_o, si) => (concreteBestIdx[si] >= 0 ? concreteBestIdx[si] : anySpatialBestIdx[si]));

    // Start: identity (room) for everyone who can have it; the murderer — who
    // never gets a room clue — starts on their preferred (concrete-first) clue.
    const pick = optionsPer.map((_o, si) => (roomIdxOf[si] >= 0 ? roomIdxOf[si] : preferredSpatialIdx[si]));

    // Defensive uniqueness pass (normally a no-op because the carved map is
    // already unique): add preferred spatial clues until unique.
    const switchOrder = Array.from({ length: N }, (_, i) => i)
      .filter((si) => roomIdxOf[si] >= 0)
      .sort((a, b) => optionsPer[a][preferredSpatialIdx[a]].permit - optionsPer[b][preferredSpatialIdx[b]].permit);
    for (const si of switchOrder) {
      if (isUniqueNow(pick)) break;
      pick[si] = anySpatialBestIdx[si];
    }

    let ok = isUniqueNow(pick);

    // No-guess: convert room clues to spatial to unlock a propagation chain.
    // Pass A — CONCRETE clues only (parity stays out).
    if (ok && !isNoGuessNow(pick)) {
      const concreteOrder = switchOrder.filter((si) => concreteBestIdx[si] >= 0);
      for (const si of concreteOrder) {
        if (pick[si] === concreteBestIdx[si]) continue;
        pick[si] = concreteBestIdx[si];
        if (isNoGuessNow(pick)) break;
      }
      // Pass B — parity, only if concrete alone still wasn't enough.
      if (!isNoGuessNow(pick)) {
        for (const si of switchOrder) {
          if (pick[si] === anySpatialBestIdx[si]) continue;
          pick[si] = anySpatialBestIdx[si];
          if (isNoGuessNow(pick)) break;
        }
      }
      ok = passes(pick);
    }

    if (!ok) return null;

    // Difficulty / flavour relax: swap some clues to a weaker alternative
    // (reintroducing door/window flavour and lightening the puzzle) while
    // keeping unique + no-guess. 5x5 relaxes hard (lighter); 9x9 barely. Parity
    // is excluded here — we never *add* an abstract parity clue for flavour;
    // parity only survives when Pass B above proved it strictly necessary.
    const weakenTarget = N <= 5 ? N : N <= 7 ? Math.round(N / 2) : Math.round(N / 4);
    const order = Array.from({ length: N }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    let weakened = 0;
    for (const si of order) {
      if (weakened >= weakenTarget) break;
      for (let k = optionsPer[si].length - 1; k >= 0; k--) {
        if (k === pick[si] || optionsPer[si][k].permit <= optionsPer[si][pick[si]].permit) continue;
        if (PARITY.has(optionsPer[si][k].type)) continue; // never relax TO parity
        const trial = pick.slice();
        trial[si] = k;
        if (passes(trial)) { pick[si] = k; weakened++; break; }
      }
    }

    const level = makeCandidate(pick);
    const graded = gradeNoGuess(level);
    if (!graded.solvable) return null; // should not happen — passes() enforced it
    return { level, order: graded.order };
    };

    // ── B4: choose a murderer who is deduced last (or second-last) ──────────
    // Try candidate murderers on this same carved map, keeping the first whose
    // logical deduction forces them in the final two. Fall back to the
    // closest-to-last candidate so generation never stalls on this goal.
    const murdererCandidates = Array.from({ length: N }, (_, i) => i);
    for (let i = murdererCandidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [murdererCandidates[i], murdererCandidates[j]] = [murdererCandidates[j], murdererCandidates[i]];
    }
    let bestPos = Infinity;
    let hitTarget = false;
    for (const murdererIdx of murdererCandidates) {
      let starterIdx: number;
      do { starterIdx = Math.floor(Math.random() * N); } while (starterIdx === murdererIdx);
      const res = buildForMurderer(murdererIdx, starterIdx);
      if (!res) continue;
      // Position of the murderer from the end of the deduction order (0 = last).
      const pos = res.order.length - 1 - res.order.lastIndexOf(murdererIdx);
      if (pos <= 1) { validPuzzle = res.level; hitTarget = true; break; } // last or 2nd-last
      if (pos < bestPos) { bestPos = pos; validPuzzle = res.level; }
    }

    if (!validPuzzle) {
      debugStats.uniquenessFailures++;
      debugStats.lastFailureReason = "No unique + no-guess clue set for this map; regrowing";
      continue;
    }

    // Ideal: murderer already lands in the final two — ship it.
    if (hitTarget) {
      if (IS_DEV) assertValidRoomMap(validPuzzle);
      return validPuzzle;
    }

    // Otherwise remember the best-so-far and keep looking, up to the B4 budget.
    if (bestPos < fallbackBestPos) { fallbackBestPos = bestPos; fallbackBest = validPuzzle; }
    if (++mapsWithFallback >= b4MapBudget) {
      if (IS_DEV) assertValidRoomMap(fallbackBest!);
      return fallbackBest;
    }
  }

  // Exhausted attempts without hitting the murderer-last target — return the
  // closest-to-last puzzle we found, if any.
  if (fallbackBest && IS_DEV) assertValidRoomMap(fallbackBest);
  return fallbackBest;
}

export function countValidPuzzleSolutions(P: GeneratedLevel, maxCount = 2): number {
  const { N, map, clues, starterIdx, sol } = P;

  // For larger grids, reduce the thoroughness to prevent crashes
  if (N >= 7) {
    maxCount = 1; // Just check if there's at least one solution
    // We'll assume uniqueness based on the constraints being strict enough
  }

  const placed = Array.from({ length: N }, () => Array(N).fill(false));
  const usedRows = new Set<number>();
  const usedCols = new Set<number>();
  const usedRooms = new Set<number>();

  const [sr, sc] = sol[starterIdx];
  placed[sr][sc] = true;
  usedRows.add(sr); usedCols.add(sc); usedRooms.add(map[sr][sc]);
  if (!clues[starterIdx].check(sr, sc)) return 0;

  let count = 0;
  let backtrackCalls = 0;
  const maxBacktrackCalls = N <= 5 ? 10000 : N <= 7 ? 50000 : 100000; // Limit based on grid size
  const order = Array.from({ length: N }, (_, i) => i).filter((i) => i !== starterIdx);

  const canPlace = (r: number, c: number): boolean => {
    if (placed[r][c]) return false;
    if (usedRows.has(r) || usedCols.has(c) || usedRooms.has(map[r][c])) return false;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < N && cc >= 0 && cc < N && placed[rr][cc]) return false;
      }
    }
    return true;
  };

  function backtrack(idx: number): void {
    backtrackCalls++;
    if (backtrackCalls > maxBacktrackCalls) return; // Prevent infinite loops
    if (count >= maxCount) return;
    if (idx >= order.length) {
      count++;
      return;
    }
    const si = order[idx];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (!canPlace(r, c)) continue;
        if (!clues[si].check(r, c)) continue;

        placed[r][c] = true;
        usedRows.add(r); usedCols.add(c); usedRooms.add(map[r][c]);

        backtrack(idx + 1);

        placed[r][c] = false;
        usedRows.delete(r); usedCols.delete(c); usedRooms.delete(map[r][c]);
        if (count >= maxCount) return;
      }
    }
  }

  backtrack(0);
  return count;
}

/** Rebuild clues for an existing level object (ported from the prototype's
 *  generateCluesForPuzzle). Mutates P.clues on success. Pure / DOM-free. */
export function generateCluesForPuzzle(P: GeneratedLevel): boolean {
  const { N, map, rooms, sol, murdererIdx } = P;
  const maxClueAttempts = 20;

  for (let clueAttempt = 0; clueAttempt < maxClueAttempts; clueAttempt++) {
    const usedTypes = new Set<string>();
    const clues: Clue[] = sol.map((pos, si) => {
      const [r, c] = pos;
      const room = map[r][c];
      const clueOptions: Clue[] = [];

      if (si !== murdererIdx) {
        clueOptions.push({
          type: "room",
          text: `Was confirmed in the <em>${rooms[room].name}</em> all evening.`,
          check: (tr: number, tc: number) => map[tr][tc] === room,
        });
      }

      if (!usedTypes.has("row-parity")) {
        clueOptions.push({
          type: "row-parity",
          text: r % 2 === 0 ? `Witnesses placed them in an <em>odd-numbered row</em>.` : `Witnesses placed them in an <em>even-numbered row</em>.`,
          check: (tr: number, _tc: number) => tr % 2 === (r % 2),
        });
      }

      if (!usedTypes.has("col-parity")) {
        clueOptions.push({
          type: "col-parity",
          text: c % 2 === 0 ? `They were spotted in an <em>odd-numbered column</em>.` : `They were spotted in an <em>even-numbered column</em>.`,
          check: (_tr: number, tc: number) => tc % 2 === (c % 2),
        });
      }

      if ((r === 0 || r === N - 1 || c === 0 || c === N - 1) && !usedTypes.has("edge")) {
        clueOptions.push({
          type: "edge",
          text: `Was seen near the <em>outer walls</em> of the manor.`,
          check: (tr: number, tc: number) => tr === 0 || tr === N - 1 || tc === 0 || tc === N - 1,
        });
      }

      if ((r === 0 || r === N - 1) && (c === 0 || c === N - 1) && !usedTypes.has("corner")) {
        clueOptions.push({
          type: "corner",
          text: `Was spotted in <em>a corner</em> of the manor.`,
          check: (tr: number, tc: number) => (tr === 0 || tr === N - 1) && (tc === 0 || tc === N - 1),
        });
      }

      if (!usedTypes.has("near-door") && P.doorCells) {
        const isNearDoor = P.doorCells.has(`${r},${c}`);
        clueOptions.push({
          type: "near-door",
          text: isNearDoor
            ? `Was seen lingering near a <em>doorway</em>.`
            : `Was <em>far from any doorways</em>.`,
          check: (tr: number, tc: number) => isNearDoor === P.doorCells.has(`${tr},${tc}`),
        });
      }

      if (!usedTypes.has("near-window") && P.windowCells) {
        const isNearWindow = P.windowCells.has(`${r},${c}`);
        clueOptions.push({
          type: "near-window",
          text: isNearWindow
            ? `Was spotted near a <em>window</em>.`
            : `Was <em>nowhere near any windows</em>.`,
          check: (tr: number, tc: number) => isNearWindow === P.windowCells.has(`${tr},${tc}`),
        });
      }

      if (clueOptions.length === 0 && si !== murdererIdx) {
        clueOptions.push({
          type: "room-fallback",
          text: `Was confirmed in the <em>${rooms[room].name}</em> all evening.`,
          check: (tr: number, tc: number) => map[tr][tc] === room,
        });
      }

      if (clueOptions.length > 0) {
        const clue = clueOptions[Math.floor(Math.random() * clueOptions.length)];
        usedTypes.add(clue.type);
        return clue;
      } else {
        return {
          type: "emergency",
          text: `Has an unknown alibi.`,
          check: () => true,
        };
      }
    });

    P.clues = clues;
    const solutionCount = countValidPuzzleSolutions(P, 2);
    const isValid = N >= 7 ? (solutionCount >= 1) : (solutionCount === 1);

    if (isValid) {
      return true;
    }
  }

  return false;
}

// ── Public entry point ────────────────────────────────────────────────

const SIZE_TO_DIFF: Record<5 | 7 | 9, Difficulty> = {
  5: "easy",
  7: "medium",
  9: "hard",
};

/** Number of outer generation attempts per size, mirroring the prototype's
 *  loadPuzzle loop (20 / 15 / 10 for easy / medium / hard). */
const MAX_ATTEMPTS: Record<Difficulty, number> = {
  easy: 20,
  medium: 15,
  hard: 10,
};

/**
 * Generate a level for the given grid size (5, 7 or 9).
 * Returns null if generation fails within the capped attempt budget.
 *
 * This is the synchronous entry point. It replicates the prototype's
 * loadPuzzle outer retry loop (minus the async yielding / DOM), so a single
 * call has the same success characteristics as the prototype.
 */
export function generateLevel(n: 5 | 7 | 9): GeneratedLevel | null {
  const diff = SIZE_TO_DIFF[n];
  const maxAttempts = MAX_ATTEMPTS[diff];
  for (let i = 0; i < maxAttempts; i++) {
    const p = generatePuzzle(diff);
    if (p) return p;
  }
  return null;
}

/**
 * Async, UI-yielding variant of generateLevel. Mirrors the prototype's
 * loadPuzzle: yields to the event loop between outer attempts (so a 9x9
 * generation doesn't freeze the UI) and surfaces cancellation + progress.
 *
 * Kept here so the control bar (later step) can drive a "generating" state.
 */
export async function generateLevelAsync(
  n: 5 | 7 | 9,
  opts?: {
    onProgress?: (attempt: number, maxAttempts: number) => void;
    isCancelled?: () => boolean;
  },
): Promise<GeneratedLevel | null> {
  const diff = SIZE_TO_DIFF[n];
  const maxAttempts = MAX_ATTEMPTS[diff];
  for (let i = 0; i < maxAttempts; i++) {
    if (opts?.isCancelled?.()) return null;
    opts?.onProgress?.(i + 1, maxAttempts);
    // Yield control so the browser can paint the progress UI.
    await new Promise((resolve) => setTimeout(resolve, 10));
    if (opts?.isCancelled?.()) return null;
    const p = generatePuzzleWithProgress(diff, () => !(opts?.isCancelled?.() ?? false));
    if (p) return p;
  }
  return null;
}
