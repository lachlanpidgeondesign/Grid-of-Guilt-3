import { ROOM_MAP } from "../components/authoredRooms";
import type { Door } from "../generator/puzzleGenerator";

export type BorderEdge = "top" | "right" | "bottom" | "left";

export interface RoomBorderEdges {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export interface SuppressedEdge {
  row: number;
  col: number;
  edge: BorderEdge;
}

/**
 * Which room-border edges should be drawn for cell (row, col).
 *
 * A cell edge is a room border when the neighbouring cell is out of bounds or
 * belongs to a different room. This is an N-agnostic, value-equality
 * reimplementation of the daily game's original ROOM_CELLS-membership version;
 * it produces identical output for the authored 5x5 level (verified) and also
 * works for the generator's numeric room maps.
 *
 * SAFETY NOTE — value-equality vs region identity:
 * This function decides "same room" by comparing map VALUES, not by comparing
 * connected-region identity. That is only correct because every map used in
 * this codebase guarantees:
 *   (1) each room value identifies a single CONTIGUOUS (4-connected) region,
 *       and
 *   (2) distinct rooms never share a value.
 * The authored ROOM_MAP satisfies both by construction, and the generator's
 * generateConnectedRooms() provably satisfies both: it seeds exactly N rooms
 * with distinct indices 0..N-1 and only ever grows a room by adding cells
 * 4-adjacent to it, so no room can fragment and no index is reused.
 * Do NOT reuse this helper for an arbitrary map where two non-adjacent regions
 * might share a value — for that you would need to compare region identity.
 *
 * @param map   Room map: each entry identifies the room a cell belongs to
 *              (string room name for the daily game, numeric index for the
 *              generator). Defaults to the authored daily room map so existing
 *              daily call sites remain unchanged.
 * @param doors Doors whose edges should be treated as openings (gaps) in the
 *              room border. NOTE: the gap logic is intentionally NOT yet
 *              implemented — this parameter only establishes the seam for a
 *              later step. It currently has no effect on the returned edges.
 */
export function getRoomBorderEdges(
  row: number,
  col: number,
  map: ReadonlyArray<ReadonlyArray<string | number>> = ROOM_MAP,
  doors: readonly Door[] = [],
): RoomBorderEdges {
  void doors; // seam only; gap logic implemented in a later step
  const nRows = map.length;
  const nCols = map[0]?.length ?? 0;
  const room = map[row]?.[col];
  const sameRoom = (r: number, c: number): boolean =>
    r >= 0 && r < nRows && c >= 0 && c < nCols && map[r][c] === room;
  return {
    top: !sameRoom(row - 1, col),
    bottom: !sameRoom(row + 1, col),
    left: !sameRoom(row, col - 1),
    right: !sameRoom(row, col + 1),
  };
}

/**
 * Map a door to the two border edges it should suppress (open), one on each of
 * the two cells it sits between.
 *
 * - dir "right" at (r,c): the RIGHT edge of (r,c) AND the LEFT edge of (r,c+1)
 * - dir "down"  at (r,c): the BOTTOM edge of (r,c) AND the TOP edge of (r+1,c)
 *
 * Pure helper; not yet wired into rendering.
 */
export function doorSuppressedEdges(door: Door): [SuppressedEdge, SuppressedEdge] {
  if (door.dir === "right") {
    return [
      { row: door.r, col: door.c, edge: "right" },
      { row: door.r, col: door.c + 1, edge: "left" },
    ];
  }
  return [
    { row: door.r, col: door.c, edge: "bottom" },
    { row: door.r + 1, col: door.c, edge: "top" },
  ];
}

/**
 * Fraction of a cell's length occupied by a door: this is the SINGLE source of
 * truth shared by (a) the door graphic's pill length in the overlay and (b)
 * the width of the gap cut into the room border, so the opening can never
 * drift from the graphic. Windows reuse it only for graphic length (they do
 * not cut the wall).
 */
export const DOOR_GAP_FRACTION = 0.6;

/**
 * Build the set of "row,col,edge" keys whose room border a door opens (cuts a
 * centred gap in). Reuses doorSuppressedEdges so both adjacent cells' shared
 * edge are gapped consistently from either side.
 *
 * IMPORTANT — daily-game parity: this is a NEW export. It is called ONLY by
 * the generator. The daily game passes no doors and never calls this, so with
 * an empty door list it returns an empty set and no gap path is reachable.
 */
export function doorSuppressedEdgeSet(doors: readonly Door[]): Set<string> {
  const s = new Set<string>();
  for (const d of doors) {
    const [a, b] = doorSuppressedEdges(d);
    s.add(`${a.row},${a.col},${a.edge}`);
    s.add(`${b.row},${b.col},${b.edge}`);
  }
  return s;
}
