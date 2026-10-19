// Grid of Guilt — /play/ intro "searching for the body" animation geometry.
//
// Pure, DOM-free and React-free so scripts/selftest.ts can import it. All the
// positions are computed in the board's grid coordinate space (pixels within
// the gridContainer, origin top-left). The intro adapts to EACH level because
// every position is derived from the level's crime-scene cell — the lead
// flashlight always ends exactly on the body, wherever it is.
//
// The visual: four flashlights cut through a dark overlay (see PlayBoard). They
// begin at spread "search" origins and roam the grid; the lead light homes in
// on the body while the others wander general spots, then in the "found" phase
// the others converge onto the body too.

export interface Pt {
  x: number;
  y: number;
}

// Timeline (ms). Full-motion only — reduced-motion skips the intro entirely.
export const INTRO_SCAN_MS = 4200; // roam + lead light homes on the body
export const INTRO_FOUND_MS = 1400; // others converge; red pulse + "!" beat
export const INTRO_REVEAL_MS = 700; // dark overlay fades out
export const INTRO_TOTAL_MS = INTRO_SCAN_MS + INTRO_FOUND_MS + INTRO_REVEAL_MS;

const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);

export function easeOutCubic(t: number): number {
  const c = clamp01(t);
  return 1 - Math.pow(1 - c, 3);
}

// Smooth ease-in-out for the roam so lights accelerate away and settle gently.
function easeInOut(t: number): number {
  const c = clamp01(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

const lerp = (a: Pt, b: Pt, k: number): Pt => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });

/** Pixel centre of the body (crime-scene) cell within the grid container. */
export function bodyCenterPx(crimeCell: [number, number], cellSize: number): Pt {
  const [r, c] = crimeCell;
  return { x: c * cellSize + cellSize / 2, y: r * cellSize + cellSize / 2 };
}

/** The four flashlight radius in px — a fraction of the grid, so the beams are
 *  the same visual size on every board. */
export function lightRadiusPx(gridSize: number): number {
  return gridSize * 0.19;
}

// Spread origins where the beams begin roaming — general spots across the grid,
// deliberately NOT the body, so the sweep reads as "looking around" first.
export function flashlightStartsPx(gridSize: number): Pt[] {
  return [
    { x: gridSize * 0.18, y: gridSize * 0.22 },
    { x: gridSize * 0.82, y: gridSize * 0.18 },
    { x: gridSize * 0.20, y: gridSize * 0.80 },
    { x: gridSize * 0.84, y: gridSize * 0.84 },
  ];
}

// General roam targets for the three non-lead lights during the scan (they
// wander the grid; they only converge on the body in the found phase).
export function searchTargetsPx(gridSize: number): Pt[] {
  return [
    { x: gridSize * 0.70, y: gridSize * 0.35 },
    { x: gridSize * 0.35, y: gridSize * 0.68 },
    { x: gridSize * 0.58, y: gridSize * 0.58 },
  ];
}

// Decaying circular wander, zero at t=0 and t=1 so each light begins exactly at
// its start and ends exactly on its target — this is what guarantees the lead
// light lands precisely on the body regardless of where the body is.
function wander(t: number, gridSize: number, seed: number): Pt {
  const env = Math.sin(Math.PI * clamp01(t)) * gridSize * 0.1;
  const turns = 1.3 + seed * 0.5;
  const a = seed * 1.7;
  return {
    x: Math.cos(a + t * turns * Math.PI * 2) * env,
    y: Math.sin(a * 1.3 + t * turns * Math.PI * 2) * env,
  };
}

/**
 * Positions of all four flashlights during the SCAN phase at progress t∈[0,1].
 * Light 0 (the lead) homes on the body; lights 1–3 roam toward general search
 * targets. All include a decaying wander. At t=1 the lead is exactly on the body
 * and each other light is exactly on its roam target (its "frozen" position for
 * the found phase).
 */
export function scanLightPositions(
  t: number,
  crimeCell: [number, number],
  cellSize: number,
  gridSize: number,
): Pt[] {
  const c = clamp01(t);
  const body = bodyCenterPx(crimeCell, cellSize);
  const starts = flashlightStartsPx(gridSize);
  const targets = searchTargetsPx(gridSize);
  const k = easeInOut(c);
  const lead = add(lerp(starts[0], body, k), wander(c, gridSize, 0));
  const rest = targets.map((tg, i) => add(lerp(starts[i + 1], tg, k), wander(c, gridSize, i + 1)));
  return [lead, ...rest];
}

/**
 * Positions during the FOUND phase at progress t∈[0,1]. The lead light stays on
 * the body; the three others converge from their frozen scan-end positions onto
 * the body (ease-out cubic over the first 60% of the phase). At t=1 every light
 * is exactly on the body.
 */
export function foundLightPositions(
  t: number,
  frozen: Pt[],
  crimeCell: [number, number],
  cellSize: number,
): Pt[] {
  const body = bodyCenterPx(crimeCell, cellSize);
  const k = easeOutCubic(Math.min(clamp01(t) / 0.6, 1));
  return frozen.map((p, i) => (i === 0 ? body : lerp(p, body, k)));
}
