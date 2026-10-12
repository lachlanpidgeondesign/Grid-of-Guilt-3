import type { Clue, GeneratedLevel } from "../generator/puzzleGenerator";

type LevelShape = Pick<GeneratedLevel, "N" | "map" | "rooms" | "sol" | "doorCells" | "windowCells">;

export type Parity = "odd" | "even";
export type RelativeRelation = "leftOf" | "rightOf" | "above" | "below";

export type ClueSpec =
  | { kind: "room"; room: string }
  | { kind: "corner" }
  | { kind: "edge" }
  | { kind: "rowParity"; parity: Parity }
  | { kind: "colParity"; parity: Parity }
  | { kind: "door"; near: boolean }
  | { kind: "window"; near: boolean }
  | { kind: "row"; row: number }
  | { kind: "column"; column: number }
  | { kind: "relative"; relation: RelativeRelation; otherSuspectIdx: number };

function asDisplayName(index: number, suspectNames?: string[]): string {
  return suspectNames?.[index] ?? `Suspect ${index + 1}`;
}

function getOtherCell(level: LevelShape | undefined, otherSuspectIdx: number): [number, number] {
  if (!level) {
    throw new Error("Relative clues require level data.");
  }
  const cell = level.sol[otherSuspectIdx];
  if (!cell) {
    throw new Error(`Relative clue refers to missing suspect index ${otherSuspectIdx}.`);
  }
  return cell;
}

export function clueText(spec: ClueSpec, level?: LevelShape, suspectNames?: string[]): string {
  switch (spec.kind) {
    case "room":
      return `must be in the <em>${spec.room}</em>`;
    case "corner":
      return "must be in <em>a corner</em>";
    case "edge":
      return "must be along an <em>outer wall</em>";
    case "rowParity":
      return spec.parity === "odd"
        ? "must be in an <em>odd-numbered row</em>"
        : "must be in an <em>even-numbered row</em>";
    case "colParity":
      return spec.parity === "odd"
        ? "must be in an <em>odd-numbered column</em>"
        : "must be in an <em>even-numbered column</em>";
    case "door":
      return spec.near
        ? "must be next to a <em>door</em>"
        : "must not be next to a <em>door</em>";
    case "window":
      return spec.near
        ? "must be next to a <em>window</em>"
        : "must not be next to a <em>window</em>";
    case "row":
      return `must be in <em>row ${spec.row}</em>`;
    case "column":
      return `must be in <em>column ${spec.column}</em>`;
    case "relative": {
      const otherName = asDisplayName(spec.otherSuspectIdx, suspectNames);
      if (spec.relation === "leftOf") return `must be to the <em>left of ${otherName}</em>`;
      if (spec.relation === "rightOf") return `must be to the <em>right of ${otherName}</em>`;
      if (spec.relation === "above") return `must be <em>above ${otherName}</em>`;
      getOtherCell(level, spec.otherSuspectIdx);
      return `must be <em>below ${otherName}</em>`;
    }
  }
}

export function clueCheck(spec: ClueSpec, level: LevelShape): (tr: number, tc: number) => boolean {
  switch (spec.kind) {
    case "room": {
      const roomIndex = level.rooms.findIndex((room) => room.name === spec.room);
      if (roomIndex < 0) {
        throw new Error(`Unknown room in clue spec: ${spec.room}`);
      }
      return (tr, tc) => level.map[tr][tc] === roomIndex;
    }
    case "corner":
      return (tr, tc) => (tr === 0 || tr === level.N - 1) && (tc === 0 || tc === level.N - 1);
    case "edge":
      return (tr, tc) => tr === 0 || tr === level.N - 1 || tc === 0 || tc === level.N - 1;
    case "rowParity":
      return (tr) => (((tr + 1) % 2 === 0) ? "even" : "odd") === spec.parity;
    case "colParity":
      return (_tr, tc) => (((tc + 1) % 2 === 0) ? "even" : "odd") === spec.parity;
    case "door":
      return (tr, tc) => level.doorCells.has(`${tr},${tc}`) === spec.near;
    case "window":
      return (tr, tc) => level.windowCells.has(`${tr},${tc}`) === spec.near;
    case "row":
      return (tr) => tr === spec.row - 1;
    case "column":
      return (_tr, tc) => tc === spec.column - 1;
    case "relative": {
      const [otherRow, otherCol] = getOtherCell(level, spec.otherSuspectIdx);
      if (spec.relation === "leftOf") return (_tr, tc) => tc < otherCol;
      if (spec.relation === "rightOf") return (_tr, tc) => tc > otherCol;
      if (spec.relation === "above") return (tr) => tr < otherRow;
      return (tr) => tr > otherRow;
    }
  }
}

export function toSolverClue(spec: ClueSpec, level: LevelShape, suspectNames?: string[]): Clue {
  if (spec.kind === "relative") {
    throw new Error("Relative clues are not solver-compatible.");
  }

  return {
    type:
      spec.kind === "rowParity"
        ? "row-parity"
        : spec.kind === "colParity"
          ? "col-parity"
          : spec.kind === "door"
            ? "near-door"
            : spec.kind === "window"
              ? "near-window"
              : spec.kind,
    text: clueText(spec, level, suspectNames),
    check: clueCheck(spec, level),
  };
}