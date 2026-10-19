// Grid of Guilt — tutorial level.
//
// The tutorial runs on its own 5×5 board with a dedicated cast (Adam, Tom,
// Ruby, Kate, Eve) that differs from the generator roster, so it builds its own
// GeneratedLevel + suspect list here rather than going through loadLevel (which
// is tied to the frozen easy/medium/hard IDs and suspectsForSize).
//
// Pure TS, no DOM/React, so scripts/selftest.ts can import it.

import type { GeneratedLevel, RoomPalette } from "../app/generator/puzzleGenerator";
import type { GeneratorSuspect } from "../app/generator/suspects";
import { clueCheck, clueText, type ClueSpec } from "../app/levels/clues";

import tutorialData from "./tutorialLevel.json";

interface TutorialLevelData {
  N: number;
  map: number[][];
  rooms: RoomPalette[];
  sol: Array<[number, number]>;
  cast: string[];
  starterIdx: number;
  murdererIdx: number;
  crimeSceneCell: [number, number] | null;
  clues: Array<ClueSpec | null>;
  doors: [];
  windows: [];
  doorCells: string[];
  windowCells: string[];
}

const DATA = tutorialData as unknown as TutorialLevelData;

// Cast art: names from the tutorial frames, sprites + colours borrowed from the
// shared avatar sheet so each suspect reads as a distinct face.
export const TUTORIAL_SUSPECTS: GeneratorSuspect[] = [
  { name: "Adam", color: "#6a2f9e", sprite: { left: "-405.41%", top: "-229.73%" } },
  { name: "Tom", color: "#b25a00", sprite: { left: "-504.05%", top: "-229.73%" } },
  { name: "Ruby", color: "#e3202d", sprite: { left: "-109.46%", top: "-229.73%" } },
  { name: "Kate", color: "#0a7d2e", sprite: { left: "-10.81%", top: "-229.73%" } },
  { name: "Eve", color: "#0071cb", sprite: { left: "-208.11%", top: "-229.73%" } },
];

export const TUTORIAL_CLUES: Array<ClueSpec | null> = DATA.clues;

/** Build the tutorial's GeneratedLevel (same shape PlayBoard consumes). */
export function buildTutorialLevel(): GeneratedLevel {
  const levelShape = {
    N: DATA.N,
    map: DATA.map,
    rooms: DATA.rooms,
    sol: DATA.sol,
    doorCells: new Set(DATA.doorCells),
    windowCells: new Set(DATA.windowCells),
  };

  const names = DATA.cast;

  const clues = DATA.clues.map((spec, idx) => {
    if (spec === null) {
      const [row, col] = DATA.sol[idx];
      return {
        type: "starter",
        text: "",
        check: (tr: number, tc: number) => tr === row && tc === col,
      };
    }
    return {
      type: spec.kind,
      text: clueText(spec, levelShape, names),
      check: clueCheck(spec, levelShape),
    };
  });

  return {
    N: DATA.N,
    map: DATA.map,
    rooms: DATA.rooms,
    suspects: names.map((name) => ({ name, id: name.slice(0, 2).toUpperCase() })),
    sol: DATA.sol,
    murdererIdx: DATA.murdererIdx,
    starterIdx: DATA.starterIdx,
    crimeSceneCell: DATA.crimeSceneCell,
    clues,
    orderedIdxs: Array.from({ length: DATA.N }, (_, index) => index),
    doors: DATA.doors,
    windows: DATA.windows,
    doorCells: new Set(DATA.doorCells),
    windowCells: new Set(DATA.windowCells),
  };
}

export const TUTORIAL_LEVEL: GeneratedLevel = buildTutorialLevel();
export const TUTORIAL_CAST_NAMES: string[] = DATA.cast;
export const TUTORIAL_CAST_COLORS: string[] = TUTORIAL_SUSPECTS.map((s) => s.color);
