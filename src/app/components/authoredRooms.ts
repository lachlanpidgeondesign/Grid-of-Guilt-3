// Authored (daily) level room data.
//
// Extracted verbatim from PuzzleGame.tsx as part of the shared-component
// refactor (Step 2). Values are identical to the originals; this module exists
// so the daily game and the shared board-geometry helper can reference the
// same authored room map without a circular import.

export const ROOM_COLORS: Record<string, string> = {
  study: "#f6d6e5",
  kitchen: "#dde0ff",
  bedroom: "#fdeed8",
  hall: "#dbedff",
  bathroom: "#ccf5eb",
};

export const ROOM_MAP: string[][] = [
  ["kitchen", "kitchen", "kitchen", "hall", "hall"],
  ["bedroom", "bedroom", "hall", "hall", "hall"],
  ["bedroom", "bedroom", "study", "study", "study"],
  ["bathroom", "bathroom", "study", "study", "study"],
  ["bathroom", "bathroom", "bathroom", "bathroom", "bathroom"],
];

// Which cells belong to each room for thick border drawing
export const ROOM_CELLS: Record<string, Set<string>> = {
  kitchen: new Set(["0,0", "0,1", "0,2"]),
  hall: new Set(["0,3", "0,4", "1,2", "1,3", "1,4"]),
  bedroom: new Set(["1,0", "1,1", "2,0", "2,1"]),
  study: new Set(["2,2", "2,3", "2,4", "3,2", "3,3", "3,4"]),
  bathroom: new Set(["3,0", "3,1", "4,0", "4,1", "4,2", "4,3", "4,4"]),
};
