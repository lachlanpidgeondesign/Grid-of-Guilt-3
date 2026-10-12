import type { Door, GeneratedLevel, RoomPalette, WindowMarker } from "../generator/puzzleGenerator";
import { suspectsForSize } from "../generator/suspects";
import { clueText, toSolverClue, type ClueSpec } from "./clues";

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

const LEVEL_URLS: Record<LevelId, string> = {
  easy: new URL("./easy.json", import.meta.url).href,
  medium: new URL("./medium.json", import.meta.url).href,
  hard: new URL("./hard.json", import.meta.url).href,
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

export async function loadLevel(id: LevelId): Promise<GeneratedLevel> {
  const response = await fetch(LEVEL_URLS[id]);
  if (!response.ok) {
    throw new Error(`Failed to load level ${id}: ${response.status}`);
  }
  const data = (await response.json()) as FrozenLevelData;
  return buildLevel(data);
}