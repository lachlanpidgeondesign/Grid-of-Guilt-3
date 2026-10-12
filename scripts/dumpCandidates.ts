import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generatePuzzleWithProgress, type GeneratedLevel } from "../src/app/generator/puzzleGenerator.ts";

type Difficulty = "easy" | "medium" | "hard";

const TARGET_PER_DIFFICULTY = 8;
const MAX_ATTEMPTS_PER_DIFFICULTY = 60;

const DIFFICULTIES: Array<{ difficulty: Difficulty; size: 5 | 7 | 9 }> = [
  { difficulty: "easy", size: 5 },
  { difficulty: "medium", size: 7 },
  { difficulty: "hard", size: 9 },
];

const here = path.dirname(fileURLToPath(import.meta.url));
// Output directory is configurable (first CLI arg, default "candidates") so a
// sanity run can write to a side directory without clobbering the frozen source.
const outDirName = process.argv[2] ?? "candidates";
const outDir = path.join(here, outDirName);

function serializeLevel(level: GeneratedLevel): string {
  return JSON.stringify(
    level,
    (_key, value) => {
      if (value instanceof Set) return [...value].sort();
      if (typeof value === "function") return value.toString();
      return value;
    },
    2,
  );
}

async function writeCandidate(difficulty: Difficulty, index: number, level: GeneratedLevel): Promise<void> {
  const filePath = path.join(outDir, `${difficulty}-${index}.json`);
  await writeFile(filePath, serializeLevel(level) + "\n", "utf8");
}

async function main(): Promise<void> {
  await mkdir(outDir, { recursive: true });

  for (const { difficulty, size } of DIFFICULTIES) {
    let saved = 0;

    console.log(`\n[${difficulty}] target=${TARGET_PER_DIFFICULTY} size=${size} maxAttempts=${MAX_ATTEMPTS_PER_DIFFICULTY}`);

    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_DIFFICULTY && saved < TARGET_PER_DIFFICULTY; attempt++) {
      let lastFailureReason = "No failure reason reported.";

      const level = generatePuzzleWithProgress(difficulty, (_currentAttempt, _maxAttempts, debugStats) => {
        lastFailureReason = debugStats.lastFailureReason;
        return true;
      });

      if (!level) {
        console.log(`[${difficulty}] skipped attempt ${attempt}: ${lastFailureReason}`);
        continue;
      }

      saved += 1;
      await writeCandidate(difficulty, saved, level);
      console.log(`[${difficulty}] saved candidate ${saved}/${TARGET_PER_DIFFICULTY} from attempt ${attempt} -> scripts/${outDirName}/${difficulty}-${saved}.json`);
    }

    if (saved < TARGET_PER_DIFFICULTY) {
      console.log(`[${difficulty}] stopped after ${MAX_ATTEMPTS_PER_DIFFICULTY} attempts with ${saved}/${TARGET_PER_DIFFICULTY} candidates saved.`);
    } else {
      console.log(`[${difficulty}] completed with ${saved}/${TARGET_PER_DIFFICULTY} candidates saved.`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});