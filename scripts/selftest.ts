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
