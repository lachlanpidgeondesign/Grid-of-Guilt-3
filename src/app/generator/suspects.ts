import type { SpritePos } from "../shared/CharacterAvatar";

export interface GeneratorSuspect {
  /** Display name. Index order is fixed and stable; slice to the first N. */
  name: string;
  /** Per-suspect label colour (daily-game convention, NOT per-room). */
  color: string;
  /** Sprite-sheet offset into the shared avatar sheet. */
  sprite: SpritePos;
}

// Ordered table of 9 suspects for the Generator mode.
//
// Sprite offsets index the shared avatar sheet
// (src/assets/6bdc180a…png), a 6-col × 3-row grid of face tiles. The offsets
// follow the daily game's derived grid: left = -10.81% - 98.65%·col,
// top = -10.81% - 109.46%·row. Indices 1–5 reuse the daily game's five
// known-good offsets; 6–9 use four further visually distinct tiles.
export const GENERATOR_SUSPECTS: GeneratorSuspect[] = [
  { name: "Amy", color: "#e3202d", sprite: { left: "-109.46%", top: "-229.73%" } }, // r2,c1
  { name: "Ben", color: "#b25a00", sprite: { left: "-504.05%", top: "-229.73%" } }, // r2,c5
  { name: "Cole", color: "#8f6b00", sprite: { left: "-108.11%", top: "-120.27%" } }, // r1,c1
  { name: "Dylan", color: "#055b0f", sprite: { left: "-10.81%", top: "-229.73%" } }, // r2,c0
  { name: "Eve", color: "#00695f", sprite: { left: "-208.11%", top: "-229.73%" } }, // r2,c2
  { name: "Finn", color: "#0071cb", sprite: { left: "-306.76%", top: "-10.81%" } }, // r0,c3
  { name: "Greta", color: "#2f3fa8", sprite: { left: "-10.81%", top: "-120.27%" } }, // r1,c0
  { name: "Hugo", color: "#6a2f9e", sprite: { left: "-405.41%", top: "-229.73%" } }, // r2,c4
  { name: "Iris", color: "#4d243d", sprite: { left: "-208.11%", top: "-120.27%" } }, // r1,c2
];

/** Return the first `n` suspect records (n = 5, 7 or 9). */
export function suspectsForSize(n: number): GeneratorSuspect[] {
  return GENERATOR_SUSPECTS.slice(0, n);
}
