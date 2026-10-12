import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { countSolutions, gradeNoGuess } from "../src/app/generator/constraintSolver";
import { suspectsForSize } from "../src/app/generator/suspects";
import { clueText, type ClueSpec } from "../src/app/levels/clues";
import { buildLevel, type FrozenLevelData, type LevelId } from "../src/app/levels/loadLevel";

interface CandidateExpectation {
  file: string;
  clues: Array<ClueSpec | null>;
  starterIdx: number;
}

const expectedByLevel: Record<LevelId, CandidateExpectation> = {
  easy: {
    file: "easy-5.json",
    starterIdx: 3,
    clues: [
      { kind: "room", room: "Library" },
      { kind: "rowParity", parity: "even" },
      { kind: "colParity", parity: "even" },
      null,
      { kind: "colParity", parity: "odd" },
    ],
  },
  medium: {
    file: "medium-6.json",
    starterIdx: 2,
    clues: [
      { kind: "edge" },
      { kind: "door", near: true },
      null,
      { kind: "rowParity", parity: "even" },
      { kind: "rowParity", parity: "odd" },
      { kind: "room", room: "Trophy Room" },
      { kind: "corner" },
    ],
  },
  hard: {
    file: "hard-4.json",
    starterIdx: 2,
    clues: [
      { kind: "door", near: true },
      { kind: "room", room: "Ballroom" },
      null,
      { kind: "room", room: "Study" },
      { kind: "rowParity", parity: "odd" },
      { kind: "room", room: "Trophy Room" },
      { kind: "window", near: false },
      { kind: "rowParity", parity: "even" },
      { kind: "room", room: "Gallery" },
    ],
  },
};

function checkSpec(spec: ClueSpec, level: FrozenLevelData, suspectIdx: number): boolean {
  const [row, col] = level.sol[suspectIdx];

  switch (spec.kind) {
    case "room":
      return level.rooms[level.map[row][col]]?.name === spec.room;
    case "corner":
      return (row === 0 || row === level.N - 1) && (col === 0 || col === level.N - 1);
    case "edge":
      return row === 0 || row === level.N - 1 || col === 0 || col === level.N - 1;
    case "rowParity":
      return (((row + 1) % 2 === 0) ? "even" : "odd") === spec.parity;
    case "colParity":
      return (((col + 1) % 2 === 0) ? "even" : "odd") === spec.parity;
    case "door":
      return level.doorCells.includes(`${row},${col}`) === spec.near;
    case "window":
      return level.windowCells.includes(`${row},${col}`) === spec.near;
    case "row":
      return row === spec.row - 1;
    case "column":
      return col === spec.column - 1;
    case "relative": {
      const [otherRow, otherCol] = level.sol[spec.otherSuspectIdx];
      if (spec.relation === "leftOf") return col < otherCol;
      if (spec.relation === "rightOf") return col > otherCol;
      if (spec.relation === "above") return row < otherRow;
      return row > otherRow;
    }
  }
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(here, "..");
  const candidateDir = path.join(repoRoot, "scripts", "candidates");
  const levelDir = path.join(repoRoot, "src", "app", "levels");
  const requested = process.argv.slice(2) as LevelId[];
  const levelIds = requested.length > 0 ? requested : (["easy", "medium", "hard"] as LevelId[]);
  let hadFailure = false;

  for (const levelId of levelIds) {
    const expectation = expectedByLevel[levelId];
    if (!expectation) {
      throw new Error(`Unknown level id: ${levelId}`);
    }
    const candidate = await readJson<FrozenLevelData>(path.join(candidateDir, expectation.file));
    const suspectNames = suspectsForSize(candidate.N).map((suspect) => suspect.name);

    console.log(`== ${levelId.toUpperCase()} candidate source ==`);
    for (let suspectIdx = 0; suspectIdx < expectation.clues.length; suspectIdx++) {
      const spec = expectation.clues[suspectIdx];
      if (spec === null) {
        const ok = suspectIdx === expectation.starterIdx;
        console.log(`starter suspect=${suspectNames[suspectIdx]} ok=${ok}`);
        if (!ok) {
          hadFailure = true;
        }
        continue;
      }
      const ok = checkSpec(spec, candidate, suspectIdx);
      const [row, col] = candidate.sol[suspectIdx];
      console.log(`clue suspect=${suspectNames[suspectIdx]} ok=${ok} cell=(${row},${col}) text=${clueText(spec, undefined, suspectNames)}`);
      if (!ok) {
        hadFailure = true;
      }
    }

    const frozen = await readJson<FrozenLevelData>(path.join(levelDir, `${levelId}.json`));
    const level = buildLevel(frozen);
    const count = countSolutions(level, 2);
    const grade = gradeNoGuess(level);
    const displayNames = suspectsForSize(level.N).map((suspect) => suspect.name);
    const displayOrder = grade.order.map((idx) => displayNames[idx]);
    const clueLines = frozen.clues.map((spec, idx) => {
      if (spec === null) return `${displayNames[idx]}: [starter]`;
      return `${displayNames[idx]}: ${clueText(spec, undefined, displayNames)}`;
    });

    console.log(`== ${levelId.toUpperCase()} frozen level ==`);
    console.log(`solutions=${count.count} budgetExceeded=${count.budgetExceeded} steps=${count.steps}`);
    console.log(`solvable=${grade.solvable}`);
    console.log(`order=${displayOrder.join(" -> ")}`);
    console.log(`murderer=${displayNames[level.murdererIdx]}`);
    console.log("clues=");
    for (const line of clueLines) console.log(`- ${line}`);

    if (count.count !== 1 || count.budgetExceeded || !grade.solvable) {
      hadFailure = true;
    }
  }

  if (hadFailure) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});