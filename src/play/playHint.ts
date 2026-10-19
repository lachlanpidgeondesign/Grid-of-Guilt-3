// Grid of Guilt — /play/ hint composer.
//
// Turns a hint step (from the eliminations-first policy, which wraps the pure
// deduction engine) into a short banner message plus the cells to light up
// (hintCells) and the exact target cells to stripe (hintPendingCells). Each
// hint is shown in full on the first press — there is no escalation ladder.
//
// The order the policy feeds here: forced X-eliminations first; then, when a
// row/column/room is down to one open square, "someone must be there — mark it
// with a dot"; then naming the suspect once a dot resolves to one candidate.
// Wording never uses generator flavour text — rooms, rows/columns and suspect
// names only, matching the rest of /play/.

import type { GeneratedLevel } from "../app/generator/puzzleGenerator";
import type { HintResult, HintBoardCell } from "../app/generator/constraintSolver";
import { clueText, type ClueSpec } from "../app/levels/clues";
import { nextPlayStep, type PlayStep } from "./playHintPolicy";

export interface PlayHint {
  text: string;
  cells: Set<string>;
  pendingCells: Set<string>;
}

const key = (r: number, c: number) => `${r},${c}`;
const setOf = (arr: Array<[number, number]>) => new Set(arr.map(([r, c]) => key(r, c)));
const rowLabel = (r: number) => `row ${r + 1}`;
const colLabel = (c: number) => `column ${c + 1}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function unitName(level: GeneratedLevel, rule: "unit-room" | "unit-row" | "unit-col", r: number, c: number): string {
  return rule === "unit-room"
    ? `the ${level.rooms[level.map[r][c]].name}`
    : rule === "unit-row" ? rowLabel(r) : colLabel(c);
}

/** A suspect's clue as a plain sentence fragment (e.g. "must be in a corner"),
 *  stripped of the clue list's <em> emphasis markup. */
function cluePhrase(spec: ClueSpec | undefined, level: GeneratedLevel, suspectNames: string[]): string | null {
  if (!spec) return null;
  return clueText(spec, level, suspectNames).replace(/<\/?em>/g, "");
}

/** A stable identity for a hint step, so the caller can tell a repeated press of
 *  the SAME step from a new one (and only count the latter). */
export function hintSignature(step: PlayStep): string {
  return JSON.stringify(
    step.kind === "occupy" ? ["o", step.cell]
    : step.kind === "eliminate" ? ["e", step.rule, step.targetCells]
    : step.kind === "place" ? ["p", step.rule, step.targetCell, step.suspectIdx]
    : step.kind === "reasoned" ? ["r", step.premiseCell, step.outcome.kind, step.outcome.kind === "place" ? step.outcome.suspectIdx : step.outcome.targetCells]
    : step.kind === "inconsistent" ? ["i", step.reason, step.cell]
    : [step.kind],
  );
}

/** Compute the next full hint for the live board, plus its step signature. */
export function computeHint(
  level: GeneratedLevel,
  board: HintBoardCell[][],
  suspectNames: string[],
  clueSpecs: Array<ClueSpec | null>,
): { hint: PlayHint; signature: string } {
  const step = nextPlayStep(level, board);
  const signature = hintSignature(step);
  const hint = step.kind === "occupy"
    ? composeOccupy(level, step)
    : step.kind === "reasoned"
      ? composeReasoned(level, step)
      : compose(level, step, suspectNames, clueSpecs);
  return { hint, signature };
}

function composeOccupy(level: GeneratedLevel, step: Extract<PlayStep, { kind: "occupy" }>): PlayHint {
  const [r, c] = step.cell;
  const name = unitName(level, step.rule, r, c);
  const unit = setOf(step.unitCells);
  const target = new Set([key(r, c)]);
  return {
    text: `${cap(name)} has only one open square left, so someone must be there. Place a dot on the striped square to mark it — then the squares around it can be ruled out.`,
    cells: new Set([...unit, ...target]),
    pendingCells: target,
  };
}

function compose(
  level: GeneratedLevel,
  res: Exclude<HintResult, { kind: "reasoned" }>,
  suspectNames: string[],
  clueSpecs: Array<ClueSpec | null>,
): PlayHint {
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
        why = `No two suspects share a row — look at ${rowLabel(res.sourceCell![0])}.`;
      } else if (res.rule === "col") {
        why = `No two suspects share a column — look at ${colLabel(res.sourceCell![1])}.`;
      } else if (res.rule === "adjacency") {
        why = "Suspects can't stand next to each other — look at the cells touching a placed suspect.";
      } else {
        why = "No remaining suspect's clue allows this square.";
      }
      return { text: `${why} Mark the striped cells with X.`, cells: new Set([...unit, ...targets]), pendingCells: targets };
    }
    case "place": {
      const unit = setOf(res.unitCells);
      const target = new Set([key(res.targetCell[0], res.targetCell[1])]);
      const who = nameOf(res.suspectIdx);
      if (res.rule === "occupant") {
        const phrase = res.suspectIdx !== null ? cluePhrase(clueSpecs[res.suspectIdx] ?? undefined, level, suspectNames) : null;
        const why = phrase ? `Only ${who} can be on the marked square — they ${phrase}.` : `Only ${who} can be on the marked square.`;
        return { text: `${why} Place them on the striped square.`, cells: new Set([...unit, ...target]), pendingCells: target };
      }
      if (res.rule === "clue-single") {
        const phrase = res.suspectIdx !== null ? cluePhrase(clueSpecs[res.suspectIdx] ?? undefined, level, suspectNames) : null;
        const why = phrase ? `${who} ${phrase}, and only one square left fits.` : `${who} has only one square left that fits their clue.`;
        return { text: `${why} Place them on the striped square.`, cells: new Set([...unit, ...target]), pendingCells: target };
      }
      // Fallback (the policy normally turns a unit-single into a dot step first).
      const name = unitName(level, res.rule, res.targetCell[0], res.targetCell[1]);
      return { text: `${cap(name)} has only one open square left, and only ${who} can go there. Place them on the striped square.`, cells: new Set([...unit, ...target]), pendingCells: target };
    }
  }
}

function composeReasoned(
  level: GeneratedLevel,
  res: Extract<HintResult, { kind: "reasoned" }>,
): PlayHint {
  const premiseName = res.premiseRule === "unit-room"
    ? `the ${level.rooms[level.map[res.premiseCell[0]][res.premiseCell[1]]].name}`
    : res.premiseRule === "unit-row" ? `row ${res.premiseCell[0] + 1}` : `column ${res.premiseCell[1] + 1}`;
  const premiseUnit = setOf(res.premiseUnit);
  const why = `because ${premiseName} must hold someone`;

  if (res.outcome.kind === "eliminate") {
    const targets = setOf(res.outcome.targetCells);
    return { text: `Looking one step ahead, some squares can be ruled out ${why}. Mark the striped cells with X.`, cells: new Set([...premiseUnit, ...targets]), pendingCells: targets };
  }
  const target = new Set([key(res.outcome.targetCell[0], res.outcome.targetCell[1])]);
  return { text: `Looking one step ahead, a suspect has only one legal square left ${why}. Place them on the striped square.`, cells: new Set([...premiseUnit, ...target]), pendingCells: target };
}
