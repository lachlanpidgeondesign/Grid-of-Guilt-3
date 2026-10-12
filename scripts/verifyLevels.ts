// Grid of Guilt — frozen level verifier.
//
// For each frozen level (easy, medium, hard) this prints, FROM THE LOADED
// LEVEL only: the solution count, whether it is solvable with no guessing, the
// logical solve order as suspect names, the murderer, and every clue (HTML tags
// stripped) in display order. Exits 1 if any level is not uniquely solvable.

import { countSolutions, gradeNoGuess } from "../src/app/generator/constraintSolver";
import { suspectsForSize } from "../src/app/generator/suspects";
import { LEVELS, type LevelId } from "../src/app/levels/loadLevel";

function stripTags(text: string): string {
  return text.replace(/<[^>]+>/g, "");
}

const LEVEL_IDS: LevelId[] = ["easy", "medium", "hard"];

function main(): void {
  const requested = process.argv.slice(2) as LevelId[];
  const levelIds = requested.length > 0 ? requested : LEVEL_IDS;
  let hadFailure = false;

  for (const levelId of levelIds) {
    const level = LEVELS[levelId];
    const names = suspectsForSize(level.N).map((suspect) => suspect.name);

    const count = countSolutions(level, 2);
    const grade = gradeNoGuess(level);
    const order = grade.order.map((idx) => names[idx]).join(" -> ");

    console.log(`== ${levelId.toUpperCase()} ==`);
    console.log(`solutions=${count.count} budgetExceeded=${count.budgetExceeded} steps=${count.steps}`);
    console.log(`solvable=${grade.solvable}`);
    console.log(`order=${order || "(unsolved)"}`);
    console.log(`murderer=${names[level.murdererIdx]}`);
    console.log("clues=");
    for (let si = 0; si < level.N; si++) {
      if (si === level.starterIdx) {
        console.log(`- ${names[si]}: [pre-placed]`);
        continue;
      }
      console.log(`- ${names[si]}: ${stripTags(level.clues[si].text)}`);
    }

    if (count.count !== 1 || count.budgetExceeded || !grade.solvable) {
      hadFailure = true;
    }
  }

  if (hadFailure) {
    process.exitCode = 1;
  }
}

main();
