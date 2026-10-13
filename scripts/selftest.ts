// Grid of Guilt — self-test runner.
//
// A flat list of named assertions, run in order. Each prints `PASS <name>` or
// `FAIL <name>: <reason>`. The run ends with `SELFTEST PASS (n)` when all pass,
// or `SELFTEST FAIL (k of n)` and exit code 1 when any fail.
//
// Pure logic only: no DOM, no React. New phases append assertions here.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadLevel, LEVELS, type LevelId } from "../src/app/levels/loadLevel";
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
    assert(storage.loadLevelState("easy") === null, "loadLevelState should default to null when storage throws");
    // Writes must not throw.
    storage.saveProgress({ easy: { solved: true, bestSeconds: 10, hints: 0 } });
    storage.setTutorialSeen(true);
    storage.saveLevelState("easy", { a: 1 });
    storage.resetAllProgress();
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
