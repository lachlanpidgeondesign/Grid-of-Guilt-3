import type { Door, GeneratedLevel, RoomPalette, WindowMarker } from "../generator/puzzleGenerator";
import { suspectsForSize } from "../generator/suspects";
import { clueText, toSolverClue, type ClueSpec } from "./clues";

import easyData from "./easy.json";
import mediumData from "./medium.json";
import hardData from "./hard.json";

export type LevelId = "easy" | "medium" | "hard";

export interface FrozenLevelData {
  id: LevelId;
  N: number;
  map: number[][];
  rooms: RoomPalette[];
  sol: Array<[number, number]>;
  murdererIdx: number;
  starterIdx: number;
  crimeSceneCell: [number, number] | null;
  clues: Array<ClueSpec | null>;
  doors: Door[];
  windows: WindowMarker[];
  doorCells: string[];
  windowCells: string[];
}

// The three frozen levels are bundled at build time via static JSON imports —
// no runtime fetch, so the loader is synchronous and the data ships inside the
// JS bundle.
const FROZEN: Record<LevelId, FrozenLevelData> = {
  easy: easyData as unknown as FrozenLevelData,
  medium: mediumData as unknown as FrozenLevelData,
  hard: hardData as unknown as FrozenLevelData,
};

function validateClues(data: FrozenLevelData): void {
  if (data.clues.length !== data.N) {
    throw new Error(`Level ${data.id} has ${data.clues.length} clues for N=${data.N}.`);
  }
  for (let suspectIdx = 0; suspectIdx < data.N; suspectIdx++) {
    const spec = data.clues[suspectIdx];
    if (suspectIdx === data.starterIdx) {
      if (spec !== null) {
        throw new Error(`Starter suspect ${suspectIdx} in ${data.id} must have a null clue.`);
      }
      continue;
    }
    if (spec === null) {
      throw new Error(`Non-starter suspect ${suspectIdx} in ${data.id} is missing a clue.`);
    }
  }
}

export function buildLevel(data: FrozenLevelData): GeneratedLevel {
  validateClues(data);

  const suspects = suspectsForSize(data.N).map((suspect) => ({
    name: suspect.name,
    id: suspect.name.slice(0, 2).toUpperCase(),
  }));

  const levelShape = {
    N: data.N,
    map: data.map,
    rooms: data.rooms,
    sol: data.sol,
    doorCells: new Set(data.doorCells),
    windowCells: new Set(data.windowCells),
  };

  const clues = data.clues.map((spec, suspectIdx) => {
    if (spec === null) {
      const [row, col] = data.sol[suspectIdx];
      return {
        type: "starter",
        text: "",
        check: (tr: number, tc: number) => tr === row && tc === col,
      };
    }
    return toSolverClue(spec, levelShape, suspects.map((suspect) => suspect.name));
  });

  return {
    N: data.N,
    map: data.map,
    rooms: data.rooms,
    suspects,
    sol: data.sol,
    murdererIdx: data.murdererIdx,
    starterIdx: data.starterIdx,
    crimeSceneCell: data.crimeSceneCell,
    clues,
    orderedIdxs: Array.from({ length: data.N }, (_, index) => index),
    doors: data.doors,
    windows: data.windows,
    doorCells: new Set(data.doorCells),
    windowCells: new Set(data.windowCells),
  };
}

export function levelClueText(data: FrozenLevelData): string[] {
  const suspectNames = suspectsForSize(data.N).map((suspect) => suspect.name);
  return data.clues.map((spec, suspectIdx) => {
    if (spec === null) {
      return suspectIdx === data.starterIdx ? "" : "[missing clue]";
    }
    return clueText(spec, undefined, suspectNames);
  });
}

export function loadLevel(id: LevelId): GeneratedLevel {
  return buildLevel(FROZEN[id]);
}

/** Raw clue specs per suspect (null for the pre-placed starter). The /play/
 *  clue list renders from these (room chips, door/window icons), not the
 *  generator's HTML text string. */
export function loadLevelClueSpecs(id: LevelId): Array<ClueSpec | null> {
  return FROZEN[id].clues;
}

/** All three frozen levels, built once from the bundled JSON. */
export const LEVELS: Record<LevelId, GeneratedLevel> = {
  easy: buildLevel(FROZEN.easy),
  medium: buildLevel(FROZEN.medium),
  hard: buildLevel(FROZEN.hard),
};