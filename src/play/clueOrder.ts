// Grid of Guilt — /play/ clue ordering + results helpers.
//
// Pure logic (no DOM, no React, no figma imports) so scripts/selftest.ts can
// import it directly.

import type { GeneratedLevel } from "../app/generator/puzzleGenerator";

// Non-starter suspect indices in fixed index order (Amy, Ben, Cole…).
export function activeSuspectIdxs(level: Pick<GeneratedLevel, "N" | "starterIdx">): number[] {
  const out: number[] = [];
  for (let i = 0; i < level.N; i++) {
    if (i !== level.starterIdx) out.push(i);
  }
  return out;
}

// Display order for the clue list: index order, with satisfied clues dropped to
// the bottom (keeping their relative order). The murderer is never placed last,
// so the list position can't give the answer away — if the computed order would
// end on the murderer, the last two entries are swapped.
export function clueDisplayOrder(
  activeIdxs: number[],
  murdererIdx: number,
  satisfied: ReadonlySet<number>,
): number[] {
  const unsatisfied = activeIdxs.filter((i) => !satisfied.has(i));
  const done = activeIdxs.filter((i) => satisfied.has(i));
  const order = [...unsatisfied, ...done];
  const last = order.length - 1;
  if (last > 0 && order[last] === murdererIdx) {
    [order[last], order[last - 1]] = [order[last - 1], order[last]];
  }
  return order;
}

// The room the murderer (and the body) share — used in the results line.
export function murdererRoomName(level: GeneratedLevel): string {
  const [r, c] = level.sol[level.murdererIdx];
  return level.rooms[level.map[r][c]].name;
}
