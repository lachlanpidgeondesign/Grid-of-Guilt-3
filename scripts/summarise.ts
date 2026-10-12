import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { gradeNoGuess } from "../src/app/generator/constraintSolver.ts";
import { suspectsForSize } from "../src/app/generator/suspects.ts";
import { doorSuppressedEdgeSet } from "../src/app/shared/boardGeometry.ts";

type Difficulty = "easy" | "medium" | "hard";

type DoorDir = "right" | "down";
type WindowSide = "top" | "bottom" | "left" | "right";

interface Door {
  r: number;
  c: number;
  dir: DoorDir;
}

interface WindowMarker {
  r: number;
  c: number;
  side: WindowSide;
}

interface RoomPalette {
  name: string;
  fill: string;
  dark: string;
}

interface SavedClue {
  type: string;
  text: string;
  check: string;
}

interface SavedLevel {
  N: 5 | 7 | 9;
  map: number[][];
  rooms: RoomPalette[];
  suspects: Array<{ name: string; id: string }>;
  sol: Array<[number, number]>;
  murdererIdx: number;
  starterIdx: number;
  crimeSceneCell: [number, number] | null;
  clues: SavedClue[];
  orderedIdxs: number[];
  doors: Door[];
  windows: WindowMarker[];
  doorCells: string[];
  windowCells: string[];
}

interface Clue {
  type: string;
  text: string;
  check: (tr: number, tc: number) => boolean;
}

interface GeneratedLevelLike {
  N: number;
  map: number[][];
  rooms: RoomPalette[];
  suspects: Array<{ name: string; id: string }>;
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

interface RankedClue extends Clue {
  permit: number;
}

const here = path.dirname(fileURLToPath(import.meta.url));
const candidatesDir = path.join(here, "candidates");
const summaryPath = path.join(candidatesDir, "SUMMARY.md");

const REFERENCE_GRID_WIDTH = 358;
const REFERENCE_CELL = REFERENCE_GRID_WIDTH / 5;

interface LabelPlacement {
  key: string;
  row: number;
  centerX: number;
  centerY: number;
  name: string;
  dark: string;
  fill: string;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface LabelLayout {
  placements: LabelPlacement[];
  pillH: number;
  fontSize: number;
  padX: number;
  borderW: number;
  cellScale: number;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

function coord(cell: [number, number]): string {
  return `(${cell[0] + 1},${cell[1] + 1})`;
}

function difficultyFromN(n: number): Difficulty {
  if (n === 5) return "easy";
  if (n === 7) return "medium";
  return "hard";
}

function candidateFileOrder(name: string): number {
  const match = name.match(/-(\d+)\.json$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function asciiLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

function firstInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function permitFraction(level: SavedLevel, check: (tr: number, tc: number) => boolean): number {
  let count = 0;
  for (let r = 0; r < level.N; r++) {
    for (let c = 0; c < level.N; c++) {
      if (check(r, c)) count += 1;
    }
  }
  return count / (level.N * level.N);
}

function buildClueOptionsForSavedLevel(level: SavedLevel, si: number): RankedClue[] {
  const solution = level.sol;
  const map = level.map;
  const rooms = level.rooms;
  const N = level.N;
  const murdererIdx = level.murdererIdx;
  const doorCells = new Set(level.doorCells);
  const windowCells = new Set(level.windowCells);

  const [r, c] = solution[si];
  const room = map[r][c];
  const opts: Clue[] = [];

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

  const ranked = opts.map((o) => ({ ...o, permit: permitFraction(level, o.check) }));
  ranked.sort((a, b) => a.permit - b.permit);
  return ranked;
}

function rebuildClues(level: SavedLevel): Clue[] {
  return level.clues.map((saved, si) => {
    const options = buildClueOptionsForSavedLevel(level, si);
    const matched = options.find((option) => option.type === saved.type && option.text === saved.text);
    if (!matched) {
      throw new Error(`Could not rebuild clue for suspect index ${si}: ${saved.type} | ${saved.text}`);
    }
    return { type: matched.type, text: matched.text, check: matched.check };
  });
}

function toGeneratedLevel(level: SavedLevel): GeneratedLevelLike {
  return {
    ...level,
    clues: rebuildClues(level),
    doorCells: new Set(level.doorCells),
    windowCells: new Set(level.windowCells),
  };
}

function computeRoomLabelLayout(level: GeneratedLevelLike, cellSize: number, cellScale: number): LabelLayout {
  const map = level.map;
  const N = map.length;

  const pillH = Math.max(13, 22 * cellScale);
  const fontSize = Math.max(7, 11 * cellScale);
  const padX = Math.max(4, 8 * cellScale);
  const borderW = Math.max(1, 2 * cellScale);
  const estWidth = (name: string) => name.length * fontSize * 0.66 + padX * 2 + borderW * 2;

  const cellsByRoom = new Map<number, Array<[number, number]>>();
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const idx = map[r][c] as number;
      const arr = cellsByRoom.get(idx) ?? [];
      arr.push([r, c]);
      cellsByRoom.set(idx, arr);
    }
  }

  const placements: LabelPlacement[] = [];
  for (const [idx, cells] of cellsByRoom) {
    const minRow = Math.min(...cells.map(([r]) => r));
    const topRow = cells.filter(([r]) => r === minRow).map(([, c]) => c).sort((a, b) => a - b);
    const spanCenterCol = (topRow[0] + topRow[topRow.length - 1] + 1) / 2;
    const centerX = spanCenterCol * cellSize;
    const centerY = minRow * cellSize;
    const name = level.rooms[idx].name.split(" ")[0];
    const w = estWidth(name);
    placements.push({
      key: `rl-${idx}`,
      row: minRow,
      centerX,
      centerY,
      name,
      dark: level.rooms[idx].dark,
      fill: level.rooms[idx].fill,
      x0: centerX - w / 2,
      x1: centerX + w / 2,
      y0: centerY - pillH / 2,
      y1: centerY + pillH / 2,
    });
  }

  return { placements, pillH, fontSize, padX, borderW, cellScale };
}

function roomLabelsClash(level: GeneratedLevelLike): boolean {
  const cs = REFERENCE_CELL;
  const gap = 3;
  const { placements } = computeRoomLabelLayout(level, cs, 1);

  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      const a = placements[i];
      const b = placements[j];
      if (a.x0 < b.x1 + gap && a.x1 > b.x0 - gap && a.y0 < b.y1 + gap && a.y1 > b.y0 - gap) return true;
    }
  }

  const topMarkers: Array<[number, number]> = [];
  for (const w of level.windows) if (w.side === "top") topMarkers.push([w.r, w.c]);
  for (const key of doorSuppressedEdgeSet(level.doors)) {
    if (key.endsWith(",top")) {
      const [r, c] = key.slice(0, key.lastIndexOf(",")).split(",").map(Number);
      topMarkers.push([r, c]);
    }
  }
  for (const p of placements) {
    for (const [r, c] of topMarkers) {
      if (r !== p.row) continue;
      const mx0 = c * cs;
      const mx1 = (c + 1) * cs;
      if (p.x0 < mx1 && p.x1 > mx0) return true;
    }
  }

  return false;
}

function formatRoomMap(level: SavedLevel): string {
  const lines = level.map.map((row) => row.map((roomIdx) => asciiLetter(roomIdx)).join(" "));
  const legend = level.rooms.map((room, idx) => `${asciiLetter(idx)} = ${room.name}`).join(", ");
  return [...lines, "", `Legend: ${legend}`].join("\n");
}

function formatDoorWindowList(level: SavedLevel): string {
  const doors = level.doors.map((door) => {
    const a: [number, number] = [door.r + 1, door.c + 1];
    const b: [number, number] = door.dir === "right" ? [door.r + 1, door.c + 2] : [door.r + 2, door.c + 1];
    return `door (${a[0]},${a[1]})|(${b[0]},${b[1]})`;
  });
  const windows = level.windows.map((window) => `window (${window.r + 1},${window.c + 1}) ${window.side}`);
  return [...doors, ...windows].join(", ");
}

function formatSolutionGrid(level: SavedLevel): string {
  const suspects = suspectsForSize(level.N);
  const grid = Array.from({ length: level.N }, () => Array.from({ length: level.N }, () => "."));
  level.sol.forEach(([r, c], si) => {
    grid[r][c] = firstInitial(suspects[si].name);
  });
  return grid.map((row) => row.join(" ")).join("\n");
}

function formatClues(level: SavedLevel): string[] {
  const suspects = suspectsForSize(level.N);
  return level.orderedIdxs
    .filter((si) => si !== level.starterIdx)
    .map((si) => `${suspects[si].name}: ${stripTags(level.clues[si].text)}`);
}

function formatClueTypeCounts(level: SavedLevel): string {
  const counts = new Map<string, number>();
  for (const clue of level.clues) {
    counts.set(clue.type, (counts.get(clue.type) ?? 0) + 1);
  }
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([type, count]) => `${type}: ${count}`).join(", ");
}

function formatDeductionTrace(level: SavedLevel): string {
  const rebuilt = toGeneratedLevel(level);
  const suspects = suspectsForSize(level.N);
  const graded = gradeNoGuess(rebuilt);
  const names = graded.order.map((si) => suspects[si].name);
  const murdererLast = graded.order[graded.order.length - 1] === level.murdererIdx;
  return [
    `solvable: ${graded.solvable}`,
    `order: ${names.join(" -> ")}`,
    `murderer last in order: ${murdererLast ? "yes" : "no"}`,
  ].join("\n");
}

async function readSavedLevel(filePath: string): Promise<SavedLevel> {
  const text = await readFile(filePath, "utf8");
  return JSON.parse(text) as SavedLevel;
}

async function main(): Promise<void> {
  const files = (await readdir(candidatesDir))
    .filter((name) => /^(easy|medium|hard)-\d+\.json$/.test(name))
    .sort((a, b) => {
      const [da] = a.split("-");
      const [db] = b.split("-");
      if (da !== db) return da.localeCompare(db);
      return candidateFileOrder(a) - candidateFileOrder(b);
    });

  const output: string[] = [];
  output.push("rule trace unavailable");
  output.push("");
  output.push("`gradeNoGuess` returns only `solvable` and suspect `order`; it does not expose which deduction rule fired at each step. Source changes in `src/app/generator/constraintSolver.ts` would be required to emit a per-step rule trace.");
  output.push("");
  output.push("`roomLabelsClash` is not exported from `src/app/generator/GeneratorGame.tsx`, so this script copies `computeRoomLabelLayout` and `roomLabelsClash` verbatim into `scripts/summarise.ts` and reuses the real exported `doorSuppressedEdgeSet` helper.");
  output.push("");

  for (const fileName of files) {
    const filePath = path.join(candidatesDir, fileName);
    const saved = await readSavedLevel(filePath);
    const suspects = suspectsForSize(saved.N);
    const rebuilt = toGeneratedLevel(saved);
    const difficulty = difficultyFromN(saved.N);
    const starterCell = saved.sol[saved.starterIdx];
    const murdererName = suspects[saved.murdererIdx].name;
    const starterName = suspects[saved.starterIdx].name;
    const clash = roomLabelsClash(rebuilt);

    output.push(`## ${fileName.replace(/\.json$/, "")}`);
    output.push("");
    output.push(`- ID: ${fileName.replace(/\.json$/, "")}`);
    output.push(`- Difficulty: ${difficulty}`);
    output.push(`- N: ${saved.N}`);
    output.push(`- roomLabelsClash: ${clash}`);
    output.push(`- Starter: ${starterName} ${coord(starterCell)}`);
    output.push(`- Crime scene: ${saved.crimeSceneCell ? coord(saved.crimeSceneCell) : "none"}`);
    output.push(`- Murderer: ${murdererName}`);
    output.push("");
    output.push("### Room Map");
    output.push("");
    output.push("```text");
    output.push(formatRoomMap(saved));
    output.push("```");
    output.push("");
    output.push("### Doors and Windows");
    output.push("");
    output.push(formatDoorWindowList(saved));
    output.push("");
    output.push("### Solution Grid");
    output.push("");
    output.push("```text");
    output.push(formatSolutionGrid(saved));
    output.push("```");
    output.push("");
    output.push("### Clues");
    output.push("");
    for (const clue of formatClues(saved)) output.push(`- ${clue}`);
    output.push("");
    output.push("### Clue Type Counts");
    output.push("");
    output.push(formatClueTypeCounts(saved));
    output.push("");
    output.push("### Deduction Trace");
    output.push("");
    output.push("```text");
    output.push(formatDeductionTrace(saved));
    output.push("```");
    output.push("");
  }

  await writeFile(summaryPath, output.join("\n"), "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});