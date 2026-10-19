// Grid of Guilt — self-test runner.
//
// A flat list of named assertions, run in order. Each prints `PASS <name>` or
// `FAIL <name>: <reason>`. The run ends with `SELFTEST PASS (n)` when all pass,
// or `SELFTEST FAIL (k of n)` and exit code 1 when any fail.
//
// Pure logic only: no DOM, no React. New phases append assertions here.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadLevel, LEVELS, loadLevelClueSpecs, type LevelId } from "../src/app/levels/loadLevel";
import { countSolutions, gradeNoGuess } from "../src/app/generator/constraintSolver";
import { suspectsForSize } from "../src/app/generator/suspects";

// ── Tiny assertion harness ─────────────────────────────────────────────────
type Check = () => void | Promise<void>;
interface Assertion { name: string; check: Check; }

const assertions: Assertion[] = [];
function test(name: string, check: Check): void {
  assertions.push({ name, check });
}

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

// ── Assertions ─────────────────────────────────────────────────────────────

const LEVEL_SIZES: Record<LevelId, number> = { easy: 5, medium: 7, hard: 9 };
const LEVEL_IDS: LevelId[] = ["easy", "medium", "hard"];

test("all three levels load via loadLevel", () => {
  for (const id of LEVEL_IDS) {
    const level = loadLevel(id);
    assert(level.N === LEVEL_SIZES[id], `${id}: expected N=${LEVEL_SIZES[id]}, got ${level.N}`);
    assert(level.clues.length === level.N, `${id}: expected ${level.N} clues, got ${level.clues.length}`);
    assert(level.sol.length === level.N, `${id}: expected ${level.N} solution cells, got ${level.sol.length}`);
  }
});

test("each level has exactly one solution", () => {
  for (const id of LEVEL_IDS) {
    const res = countSolutions(LEVELS[id], 2);
    assert(!res.budgetExceeded, `${id}: solution count budget exceeded`);
    assert(res.count === 1, `${id}: expected 1 solution, got ${res.count}`);
  }
});

test("each level is solvable with no guessing", () => {
  for (const id of LEVEL_IDS) {
    const grade = gradeNoGuess(LEVELS[id]);
    assert(grade.solvable, `${id}: gradeNoGuess returned not solvable`);
  }
});

test("no clue text uses generator flavour words", () => {
  const banned = ["all evening", "Witnesses", "spotted"];
  for (const id of LEVEL_IDS) {
    const level = LEVELS[id];
    const names = suspectsForSize(level.N).map((s) => s.name);
    level.clues.forEach((clue, si) => {
      const text = clue.text;
      if (!text) return; // starter has empty text
      for (const word of banned) {
        assert(!text.toLowerCase().includes(word.toLowerCase()), `${id}/${names[si]}: clue text contains "${word}": ${text}`);
      }
    });
  }
});

test("every clue is true at its suspect's solution cell", () => {
  for (const id of LEVEL_IDS) {
    const level = LEVELS[id];
    for (let si = 0; si < level.N; si++) {
      const [row, col] = level.sol[si];
      assert(level.clues[si].check(row, col), `${id}: clue ${si} is false at its solution cell (${row},${col})`);
    }
  }
});

test("the body cell holds no suspect in any solution", () => {
  for (const id of LEVEL_IDS) {
    const level = LEVELS[id];
    const cs = level.crimeSceneCell;
    if (!cs) continue;
    for (let si = 0; si < level.N; si++) {
      assert(!(level.sol[si][0] === cs[0] && level.sol[si][1] === cs[1]), `${id}: suspect ${si} sits on the body cell`);
    }
  }
});

// PlayBoard (Phase 2) must keep the tutorial overlay props in its public
// Props type. This is a render-free source check — we can't import the TSX
// here (figma: asset imports, React), so we read the file and assert the
// overlay prop names appear inside the exported PlayBoardProps interface.
test("PlayBoard exposes the tutorial overlay prop types", () => {
  const src = readFileSync(fileURLToPath(new URL("../src/app/shared/PlayBoard.tsx", import.meta.url)), "utf8");
  const start = src.indexOf("export interface PlayBoardProps");
  assert(start !== -1, "PlayBoardProps interface not found in PlayBoard.tsx");
  const end = src.indexOf("\n}", start);
  assert(end !== -1, "could not find the end of the PlayBoardProps interface");
  const body = src.slice(start, end);
  const requiredProps = ["dimmedCells", "hatchedCells", "xOnlyCells", "canPlace", "allowTray", "locked"];
  for (const prop of requiredProps) {
    assert(new RegExp(`\\b${prop}\\??:`).test(body), `PlayBoardProps is missing overlay prop "${prop}"`);
  }
});

// ── Phase 3: /play/ storage + unlock rules ──────────────────────────────────
// The storage module reads globalThis.localStorage lazily on each call, so
// installing a fake (or a throwing fake) before use is enough. We install a
// fresh in-memory store per test and remove it afterwards.

interface FakeStore extends Storage {
  _map: Map<string, string>;
}
function makeStore(): FakeStore {
  const m = new Map<string, string>();
  const s: FakeStore = {
    _map: m,
    get length() { return m.size; },
    clear: () => m.clear(),
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => { m.set(k, String(v)); },
    removeItem: (k: string) => { m.delete(k); },
    key: (i: number) => Array.from(m.keys())[i] ?? null,
  };
  return s;
}
function makeThrowingStore(): Storage {
  const bomb = () => { throw new Error("storage unavailable"); };
  return {
    get length(): number { throw new Error("storage unavailable"); },
    clear: bomb, getItem: bomb, setItem: bomb, removeItem: bomb, key: bomb,
  } as unknown as Storage;
}
function installStore(s: Storage | undefined): void {
  (globalThis as { localStorage?: Storage }).localStorage = s as Storage;
}

// Import once; all storage tests share the module (functions re-read storage).
const storage = await import("../src/play/storage");

test("storage helpers return defaults when storage throws", () => {
  installStore(makeThrowingStore());
  try {
    assert(Object.keys(storage.loadProgress()).length === 0, "loadProgress should default to {} when storage throws");
    assert(storage.getTutorialSeen() === false, "getTutorialSeen should default to false when storage throws");
    assert(storage.hasLevelState("easy") === false, "hasLevelState should default to false when storage throws");
    assert(storage.loadLevelState("easy", 5) === null, "loadLevelState should default to null when storage throws");
    // Writes must not throw.
    storage.saveProgress({ easy: { solved: true, bestSeconds: 10, hints: 0 } });
    storage.setTutorialSeen(true);
    storage.saveLevelState("easy", { grid: [], history: [], elapsedSeconds: 0, hints: 0 });
    storage.resetAllProgress();
  } finally {
    installStore(undefined);
  }
});

test("intro-seen flag is per level, round-trips and survives a throw", () => {
  installStore(makeStore());
  try {
    assert(storage.hasSeenIntro("easy") === false, "a fresh store has seen no intro");
    storage.markIntroSeen("easy");
    assert(storage.hasSeenIntro("easy") === true, "marking easy seen must persist");
    assert(storage.hasSeenIntro("medium") === false, "marking easy must not affect medium");
    storage.markIntroSeen("easy"); // idempotent — no throw, still seen
    assert(storage.hasSeenIntro("easy") === true, "re-marking stays seen");
    // Corrupt value → reads as "none seen", writes still succeed.
    (globalThis as { localStorage?: Storage }).localStorage!.setItem("gog-play-intro-seen", "{broken");
    assert(storage.hasSeenIntro("easy") === false, "corrupt intro-seen reads as none");
  } finally {
    installStore(undefined);
  }
  installStore(makeThrowingStore());
  try {
    assert(storage.hasSeenIntro("hard") === false, "hasSeenIntro defaults false when storage throws");
    storage.markIntroSeen("hard"); // must not throw
  } finally {
    installStore(undefined);
  }
});

test("progress round-trips through storage", () => {
  installStore(makeStore());
  try {
    const written = storage.recordSolve("easy", 42, 2);
    assert(written.easy?.solved === true, "recordSolve should mark easy solved");
    assert(written.easy?.bestSeconds === 42, "recordSolve should store the time");
    const reloaded = storage.loadProgress();
    assert(reloaded.easy?.solved === true && reloaded.easy?.bestSeconds === 42 && reloaded.easy?.hints === 2, "progress should round-trip");
    // A worse time never replaces the best; a better time does.
    storage.recordSolve("easy", 99, 5);
    assert(storage.loadProgress().easy?.bestSeconds === 42, "a slower run must not worsen the best time");
    storage.recordSolve("easy", 30, 1);
    assert(storage.loadProgress().easy?.bestSeconds === 30, "a faster run must become the new best time");
  } finally {
    installStore(undefined);
  }
});

test("corrupt progress value falls back to defaults", () => {
  const s = makeStore();
  s.setItem("gog-play-progress", "{not valid json");
  installStore(s);
  try {
    assert(Object.keys(storage.loadProgress()).length === 0, "corrupt progress JSON should yield {}");
  } finally {
    installStore(undefined);
  }
});

test("unlock rules: Medium needs Easy, Hard needs Medium", () => {
  // Nothing solved.
  let p = {} as import("../src/play/storage").ProgressMap;
  assert(storage.isUnlocked("easy", p) === true, "Easy is always unlocked");
  assert(storage.isUnlocked("medium", p) === false, "Medium is locked until Easy is solved");
  assert(storage.isUnlocked("hard", p) === false, "Hard is locked until Medium is solved");
  assert(storage.lockMessage("medium", p) === "Solve Easy to unlock", "Medium lock message");
  assert(storage.lockMessage("hard", p) === "Solve Medium to unlock", "Hard lock message");

  // Easy solved → Medium opens, Hard still locked.
  p = { easy: { solved: true, bestSeconds: 10, hints: 0 } };
  assert(storage.isUnlocked("medium", p) === true, "Medium unlocks once Easy is solved");
  assert(storage.isUnlocked("hard", p) === false, "Hard stays locked until Medium is solved");
  assert(storage.lockMessage("medium", p) === null, "an unlocked level has no lock message");

  // Medium solved → Hard opens.
  p = { easy: { solved: true, bestSeconds: 10, hints: 0 }, medium: { solved: true, bestSeconds: 20, hints: 1 } };
  assert(storage.isUnlocked("hard", p) === true, "Hard unlocks once Medium is solved");
});

test("resetAllProgress clears only gog-play- keys", () => {
  const s = makeStore();
  s.setItem("gog-play-progress", "{}");
  s.setItem("gog-play-tutorial-seen", "true");
  s.setItem("gog-play-state-easy", "{}");
  s.setItem("some-other-app", "keep-me");
  installStore(s);
  try {
    storage.resetAllProgress();
    assert(s.getItem("gog-play-progress") === null, "reset should remove the progress key");
    assert(s.getItem("gog-play-tutorial-seen") === null, "reset should remove the tutorial flag");
    assert(s.getItem("gog-play-state-easy") === null, "reset should remove level state");
    assert(s.getItem("some-other-app") === "keep-me", "reset must not touch non-gog-play keys");
  } finally {
    installStore(undefined);
  }
});

test("formatTime renders m:ss", () => {
  assert(storage.formatTime(0) === "0:00", "0s → 0:00");
  assert(storage.formatTime(9) === "0:09", "9s → 0:09");
  assert(storage.formatTime(65) === "1:05", "65s → 1:05");
  assert(storage.formatTime(600) === "10:00", "600s → 10:00");
});

// ── Phase 4: clue display order, results room, saved-state shape ─────────────
const clueOrder = await import("../src/play/clueOrder");

test("clue display order never ends with the murderer", () => {
  for (const id of LEVEL_IDS) {
    const level = LEVELS[id];
    const active = clueOrder.activeSuspectIdxs(level);
    // Check both the fresh board and every "one clue satisfied" state, plus the
    // all-but-one satisfied states — the murderer must never be last.
    const states: Array<Set<number>> = [new Set()];
    for (const si of active) states.push(new Set([si]));
    for (const si of active) states.push(new Set(active.filter((x) => x !== si)));
    states.push(new Set(active)); // all satisfied
    for (const satisfied of states) {
      const order = clueOrder.clueDisplayOrder(active, level.murdererIdx, satisfied);
      assert(order.length === active.length, `${id}: display order must list every active suspect once`);
      assert(order[order.length - 1] !== level.murdererIdx, `${id}: clue list must not end with the murderer`);
      assert(new Set(order).size === order.length, `${id}: display order must not duplicate a suspect`);
    }
  }
});

test("results line names the murderer's actual room", () => {
  for (const id of LEVEL_IDS) {
    const level = LEVELS[id];
    const [mr, mc] = level.sol[level.murdererIdx];
    const expected = level.rooms[level.map[mr][mc]].name;
    assert(clueOrder.murdererRoomName(level) === expected, `${id}: murdererRoomName must match the body's room`);
    // The murderer shares the body's room.
    const cs = level.crimeSceneCell;
    if (cs) {
      assert(level.map[mr][mc] === level.map[cs[0]][cs[1]], `${id}: murderer must be in the body's room`);
    }
  }
});

test("level state round-trips and corrupt state is rejected", () => {
  installStore(makeStore());
  try {
    const state = {
      grid: Array.from({ length: 5 }, () => Array<number | null>(5).fill(null)),
      history: [{ type: "place-x" as const, row: 0, col: 0, previousContent: null }],
      elapsedSeconds: 73,
      hints: 1,
    };
    storage.saveLevelState("easy", state);
    const back = storage.loadLevelState("easy", 5);
    assert(back !== null, "saved level state should load back");
    assert(back!.elapsedSeconds === 73 && back!.hints === 1, "elapsed/hints must round-trip");
    assert(back!.history.length === 1, "history must round-trip");
    // Wrong board size → rejected (fall back to a fresh board).
    assert(storage.loadLevelState("easy", 7) === null, "a state whose grid size mismatches must be rejected");
    // Corrupt JSON → rejected, no throw.
    (globalThis as { localStorage?: Storage }).localStorage!.setItem("gog-play-state-easy", "{broken");
    assert(storage.loadLevelState("easy", 5) === null, "corrupt saved state must be rejected");
  } finally {
    installStore(undefined);
  }
});

// ── Phase 5: tutorial level ─────────────────────────────────────────────────
const tutorialLevel = await import("../src/play/tutorialLevel");

test("tutorial level has exactly one solution", () => {
  const res = countSolutions(tutorialLevel.TUTORIAL_LEVEL, 2);
  assert(!res.budgetExceeded, "tutorial: solution count budget exceeded");
  assert(res.count === 1, `tutorial: expected 1 solution, got ${res.count}`);
});

test("tutorial clues are true at the solution", () => {
  const L = tutorialLevel.TUTORIAL_LEVEL;
  for (let i = 0; i < L.N; i++) {
    const [r, c] = L.sol[i];
    assert(L.clues[i].check(r, c), `tutorial: clue ${i} false at its solution cell`);
  }
});

// ── /play/ hint flow: eliminations-first, then dot suggestions ──────────────
const playHintPolicy = await import("../src/play/playHintPolicy");
const playHint = await import("../src/play/playHint");
const clues = await import("../src/app/levels/clues");

type HCell = number | "X" | "dot" | "skull" | null;

// A fresh board: starter pinned to its solution cell, body as skull, rest empty.
function freshBoard(level: ReturnType<typeof loadLevel>): HCell[][] {
  const g: HCell[][] = Array.from({ length: level.N }, () => Array<HCell>(level.N).fill(null));
  const [sr, sc] = level.sol[level.starterIdx];
  g[sr][sc] = level.starterIdx;
  const cs = level.crimeSceneCell;
  if (cs) g[cs[0]][cs[1]] = "skull";
  return g;
}

test("play hint offers an elimination before any placement on a fresh board", () => {
  const level = loadLevel("medium");
  const step = playHintPolicy.nextPlayStep(level, freshBoard(level));
  assert(step.kind === "eliminate", `expected an eliminate on a fresh board, got ${step.kind}`);
});

test("play hint falls back to a placement when no X remains", () => {
  const level = loadLevel("medium");
  const N = level.N;
  const missing = level.starterIdx === 0 ? 1 : 0;
  const isSol = (r: number, c: number) => level.sol.some(([sr, sc], si) => si !== missing && sr === r && sc === c);
  const g: HCell[][] = Array.from({ length: N }, () => Array<HCell>(N).fill(null));
  const cs = level.crimeSceneCell;
  for (let si = 0; si < N; si++) {
    if (si === missing) continue;
    const [r, c] = level.sol[si];
    g[r][c] = si;
  }
  if (cs) g[cs[0]][cs[1]] = "skull";
  // X every cell that is neither a placed solution cell, the missing suspect's
  // cell, nor the body — so no forced elimination remains.
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (g[r][c] !== null) continue;
      if (r === level.sol[missing][0] && c === level.sol[missing][1]) continue;
      g[r][c] = "X";
    }
  }
  const step = playHintPolicy.nextPlayStep(level, g);
  assert(step.kind === "place", `expected a placement once X's are exhausted, got ${step.kind}`);
  if (step.kind === "place") {
    assert(step.targetCell[0] === level.sol[missing][0] && step.targetCell[1] === level.sol[missing][1],
      "placement should target the missing suspect's solution cell");
  }
});

test("play hint prefers an available X over an available placement", () => {
  const level = loadLevel("medium");
  const N = level.N;
  const missing = level.starterIdx === 0 ? 1 : 0;
  const g: HCell[][] = Array.from({ length: N }, () => Array<HCell>(N).fill(null));
  const cs = level.crimeSceneCell;
  for (let si = 0; si < N; si++) {
    if (si === missing) continue;
    const [r, c] = level.sol[si];
    g[r][c] = si;
  }
  if (cs) g[cs[0]][cs[1]] = "skull";
  // X everything except the missing suspect's cell AND one open cell in a
  // placed suspect's row (geometry-excluded → still eliminable).
  const [pr] = level.sol[level.starterIdx];
  let leftOpen: [number, number] | null = null;
  for (let c = 0; c < N && !leftOpen; c++) {
    if (g[pr][c] === null && !(pr === level.sol[missing][0] && c === level.sol[missing][1]) && !(cs && pr === cs[0] && c === cs[1])) {
      leftOpen = [pr, c];
    }
  }
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (g[r][c] !== null) continue;
      if (r === level.sol[missing][0] && c === level.sol[missing][1]) continue;
      if (leftOpen && r === leftOpen[0] && c === leftOpen[1]) continue;
      g[r][c] = "X";
    }
  }
  assert(leftOpen !== null, "test setup: expected an open cell in the starter's row");
  const step = playHintPolicy.nextPlayStep(level, g);
  assert(step.kind === "eliminate", `expected an eliminate while an X remains, got ${step.kind}`);
});

// Exhaust every forced X-elimination the board supports, as a player would.
function exhaustEliminations(level: ReturnType<typeof loadLevel>, g: HCell[][]): void {
  for (let guard = 0; guard < 4000; guard++) {
    const e = playHintPolicy.findForcedElimination(level, g);
    if (!e) return;
    for (const [r, c] of e.targetCells) if (g[r][c] === null) g[r][c] = "X";
  }
}

test("play hint suggests a dot when a unit is down to one open square", () => {
  const level = loadLevel("easy");
  const g = freshBoard(level);
  exhaustEliminations(level, g);
  const step = playHintPolicy.nextPlayStep(level, g);
  assert(step.kind === "occupy", `expected a dot suggestion once X's are exhausted, got ${step.kind}`);
  if (step.kind === "occupy") {
    const [r, c] = step.cell;
    assert(g[r][c] === null, "the suggested dot cell must be open");
    assert(level.sol.some(([sr, sc]) => sr === r && sc === c), "the forced-occupied cell must be a solution cell");
  }
});

test("play hint dot suggestion names a dot and stripes exactly one cell", () => {
  const level = loadLevel("easy");
  const names = suspectsForSize(level.N).map((s) => s.name);
  const g = freshBoard(level);
  exhaustEliminations(level, g);
  const { hint } = playHint.computeHint(level, g, names, loadLevelClueSpecs("easy"));
  assert(/place a dot/i.test(hint.text), `dot hint should tell the player to place a dot, got: ${hint.text}`);
  assert(hint.pendingCells.size === 1, "a dot suggestion stripes exactly one cell");
  // The wording must never name a suspect at the dot stage.
  assert(!names.some((n) => hint.text.includes(n)), "a dot suggestion must not name a suspect");
});

test("play hint explains the clue when placing by clue-single", () => {
  const level = loadLevel("medium");
  const names = suspectsForSize(level.N).map((s) => s.name);
  const specs = loadLevelClueSpecs("medium");
  const N = level.N;
  const missing = level.starterIdx === 0 ? 1 : 0;
  const g: HCell[][] = Array.from({ length: N }, () => Array<HCell>(N).fill(null));
  const cs = level.crimeSceneCell;
  for (let si = 0; si < N; si++) {
    if (si === missing) continue;
    const [r, c] = level.sol[si];
    g[r][c] = si;
  }
  if (cs) g[cs[0]][cs[1]] = "skull";
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (g[r][c] !== null) continue;
      if (r === level.sol[missing][0] && c === level.sol[missing][1]) continue;
      g[r][c] = "X";
    }
  }
  const step = playHintPolicy.nextPlayStep(level, g);
  assert(step.kind === "place" && step.rule === "clue-single", `expected a clue-single placement, got ${step.kind}`);
  const { hint } = playHint.computeHint(level, g, names, specs);
  const spec = specs[missing];
  assert(spec !== null, "test setup: the missing suspect should have a clue");
  if (spec) {
    const phrase = clues.clueText(spec, level, names).replace(/<\/?em>/g, "");
    assert(hint.text.includes(phrase), `clue-single hint should state the clue "${phrase}", got: ${hint.text}`);
    assert(hint.text.includes(names[missing]), "clue-single hint should name the suspect");
  }
});

// Apply a hint step to the board exactly as a player following it would.
function applyStep(step: ReturnType<typeof playHintPolicy.nextPlayStep>, g: HCell[][]): void {
  if (step.kind === "eliminate") {
    for (const [r, c] of step.targetCells) if (g[r][c] === null) g[r][c] = "X";
  } else if (step.kind === "occupy") {
    const [r, c] = step.cell;
    if (g[r][c] === null) g[r][c] = "dot";
  } else if (step.kind === "place") {
    const [r, c] = step.targetCell;
    if (step.suspectIdx !== null) g[r][c] = step.suspectIdx;
  } else if (step.kind === "reasoned") {
    if (step.outcome.kind === "eliminate") {
      for (const [r, c] of step.outcome.targetCells) if (g[r][c] === null) g[r][c] = "X";
    } else {
      const [r, c] = step.outcome.targetCell;
      g[r][c] = step.outcome.suspectIdx;
    }
  }
}

for (const id of ["easy", "medium", "hard"] as LevelId[]) {
  test(`play hint reveals the murderer last (${id})`, () => {
    const level = loadLevel(id);
    const g = freshBoard(level);
    // The order in which each suspect first appears on the board as a number.
    const placedOrder: number[] = [];
    const seen = new Set<number>();
    const noteNumbers = () => {
      for (let r = 0; r < level.N; r++) {
        for (let c = 0; c < level.N; c++) {
          const v = g[r][c];
          if (typeof v === "number" && !seen.has(v)) { seen.add(v); placedOrder.push(v); }
        }
      }
    };
    noteNumbers(); // the pre-placed starter
    for (let guard = 0; guard < 6000; guard++) {
      const step = playHintPolicy.nextPlayStep(level, g);
      if (step.kind === "solved" || step.kind === "none" || step.kind === "inconsistent") break;
      applyStep(step, g);
      noteNumbers();
      if (seen.size === level.N) break;
    }
    assert(seen.size === level.N, `hints should resolve every suspect (${id}): got ${seen.size}/${level.N}`);
    assert(placedOrder[placedOrder.length - 1] === level.murdererIdx,
      `the murderer should be the last suspect a hint names (${id}): order ${placedOrder.join(",")}, murderer ${level.murdererIdx}`);
  });
}


// ── /play/ intro animation geometry ─────────────────────────────────────────
const introAnim = await import("../src/play/introAnim");

test("intro easing clamps and hits its endpoints", () => {
  assert(introAnim.easeOutCubic(0) === 0, "easeOutCubic(0) === 0");
  assert(introAnim.easeOutCubic(1) === 1, "easeOutCubic(1) === 1");
  assert(introAnim.easeOutCubic(-5) === 0 && introAnim.easeOutCubic(5) === 1, "easeOutCubic clamps out-of-range t");
});

for (const id of ["easy", "medium", "hard"] as LevelId[]) {
  test(`intro search homes exactly on the body (${id})`, () => {
    const level = loadLevel(id);
    const crime = level.crimeSceneCell;
    assert(crime !== null, `level ${id} must have a crime-scene cell`);
    if (!crime) return;
    const gridSize = 400;
    const cellSize = gridSize / level.N;
    const body = introAnim.bodyCenterPx(crime, cellSize);
    // Body centre sits inside the body cell's bounds.
    assert(body.x > crime[1] * cellSize && body.x < (crime[1] + 1) * cellSize, "body x within its cell");
    assert(body.y > crime[0] * cellSize && body.y < (crime[0] + 1) * cellSize, "body y within its cell");
    // At the end of the scan, the lead light is exactly on the body — the key
    // adaptive property, wherever the body is on this level.
    const scanEnd = introAnim.scanLightPositions(1, crime, cellSize, gridSize);
    const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
    assert(near(scanEnd[0].x, body.x) && near(scanEnd[0].y, body.y), "lead light ends on the body");
    // Lights begin at their spread search origins (not the body).
    const starts = introAnim.flashlightStartsPx(gridSize);
    const scanStart = introAnim.scanLightPositions(0, crime, cellSize, gridSize);
    assert(near(scanStart[0].x, starts[0].x) && near(scanStart[0].y, starts[0].y), "lights start at their origins");
    // In the found phase every light converges onto the body.
    const found = introAnim.foundLightPositions(1, scanEnd, crime, cellSize);
    assert(found.every((p) => near(p.x, body.x) && near(p.y, body.y)), "all lights converge on the body");
  });
}

// ── Runner ─────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  let failures = 0;
  for (const { name, check } of assertions) {
    try {
      await check();
      console.log(`PASS ${name}`);
    } catch (error) {
      failures++;
      console.log(`FAIL ${name}: ${(error as Error).message}`);
    }
  }
  const total = assertions.length;
  if (failures === 0) {
    console.log(`SELFTEST PASS (${total})`);
  } else {
    console.log(`SELFTEST FAIL (${failures} of ${total})`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
