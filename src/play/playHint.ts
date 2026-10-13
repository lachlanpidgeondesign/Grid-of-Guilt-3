// Grid of Guilt — /play/ hint composer.
//
// Wraps the pure deduction engine (nextHintFromBoard) and turns its result into
// a short banner message plus the cells to light up (hintCells) and the exact
// target cells to stripe (hintPendingCells). Unlike the generator, /play/ does
// not escalate on repeated presses — each press shows the next deducible step,
// and the press is counted by the caller. The engine never stalls on a solvable
// board, so pressing Hint repeatedly always makes progress.

import type { GeneratedLevel } from "../app/generator/puzzleGenerator";
import { nextHintFromBoard, type HintBoardCell } from "../app/generator/constraintSolver";

export interface PlayHint {
  text: string;
  cells: Set<string>;
  pendingCells: Set<string>;
}

const key = (r: number, c: number) => `${r},${c}`;
const setOf = (arr: Array<[number, number]>) => new Set(arr.map(([r, c]) => key(r, c)));

export function computeHint(
  level: GeneratedLevel,
  board: HintBoardCell[][],
  suspectNames: string[],
): PlayHint {
  const res = nextHintFromBoard(level, board);
  const nameOf = (si: number | null) => (si !== null ? suspectNames[si] ?? "A suspect" : "A suspect");

  switch (res.kind) {
    case "solved":
      return { text: "Everything that can be placed is already placed.", cells: new Set(), pendingCells: new Set() };
    case "none":
      return { text: "No further step can be deduced from the board as it stands.", cells: new Set(), pendingCells: new Set() };
    case "inconsistent": {
      const cell = new Set([key(res.cell[0], res.cell[1])]);
      if (res.reason === "wrong-suspect") {
        return { text: `${nameOf(res.suspectIdx)} is in a spot that breaks a rule or their clue. Tap them to pick them back up.`, cells: cell, pendingCells: new Set() };
      }
      if (res.reason === "dot-not-occupied") {
        return { text: "One of your dots is on a cell nobody can stand on. Tap it to clear it.", cells: cell, pendingCells: new Set() };
      }
      return { text: "One of your X marks is on a cell a suspect must occupy. Remove that X.", cells: cell, pendingCells: cell };
    }
    case "eliminate": {
      const unit = setOf(res.unitCells);
      const targets = setOf(res.targetCells);
      let why: string;
      if (res.rule === "room") {
        const room = level.rooms[level.map[res.sourceCell![0]][res.sourceCell![1]]].name;
        why = `Only one suspect per room — look at the ${room}.`;
      } else if (res.rule === "row") {
        why = `No two suspects share a row — look at row ${res.sourceCell![0] + 1}.`;
      } else if (res.rule === "col") {
        why = `No two suspects share a column — look at column ${res.sourceCell![1] + 1}.`;
      } else if (res.rule === "adjacency") {
        why = "Suspects can't stand next to each other — look at the touching cells.";
      } else {
        why = "No remaining suspect's clue allows these cells.";
      }
      return { text: `${why} Mark the striped cells with X.`, cells: new Set([...unit, ...targets]), pendingCells: targets };
    }
    case "place": {
      const unit = setOf(res.unitCells);
      const target = new Set([key(res.targetCell[0], res.targetCell[1])]);
      const who = nameOf(res.suspectIdx);
      let why: string;
      if (res.rule === "clue-single" || res.rule === "occupant") {
        why = `${who} has only one spot left that fits.`;
      } else {
        const unitName = res.rule === "unit-room"
          ? `the ${level.rooms[level.map[res.targetCell[0]][res.targetCell[1]]].name}`
          : res.rule === "unit-row" ? `row ${res.targetCell[0] + 1}` : `column ${res.targetCell[1] + 1}`;
        why = `${who} must go in ${unitName} — it has only one spot left.`;
      }
      return { text: `${why} Place them on the striped cell.`, cells: new Set([...unit, ...target]), pendingCells: target };
    }
    case "reasoned": {
      const premiseName = res.premiseRule === "unit-room"
        ? `the ${level.rooms[level.map[res.premiseCell[0]][res.premiseCell[1]]].name}`
        : res.premiseRule === "unit-row" ? `row ${res.premiseCell[0] + 1}` : `column ${res.premiseCell[1] + 1}`;
      const premiseUnit = setOf(res.premiseUnit);
      if (res.outcome.kind === "place") {
        const who = nameOf(res.outcome.suspectIdx);
        const target = new Set([key(res.outcome.targetCell[0], res.outcome.targetCell[1])]);
        return {
          text: `Because ${premiseName} must hold someone, ${who} has only one legal cell left. Place them on the striped cell.`,
          cells: new Set([...premiseUnit, ...target]),
          pendingCells: target,
        };
      }
      const targets = setOf(res.outcome.targetCells);
      return {
        text: `Because ${premiseName} must hold someone, some cells can be ruled out. Mark the striped cells with X.`,
        cells: new Set([...premiseUnit, ...targets]),
        pendingCells: targets,
      };
    }
  }
}
