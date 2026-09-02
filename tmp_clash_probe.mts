import { generateLevel, type GeneratedLevel } from "./src/app/generator/puzzleGenerator.ts";
import { doorSuppressedEdgeSet } from "./src/app/shared/boardGeometry.ts";

const REFERENCE_CELL = 358 / 5;

function computePlacements(level: GeneratedLevel, cellSize: number, cellScale: number) {
  const map = level.map;
  const N = map.length;
  const fontSize = Math.max(7, 11 * cellScale);
  const padX = Math.max(4, 8 * cellScale);
  const borderW = Math.max(1, 2 * cellScale);
  const pillH = Math.max(13, 22 * cellScale);
  const estWidth = (name: string) => name.length * fontSize * 0.66 + padX * 2 + borderW * 2;
  const cellsByRoom = new Map<number, Array<[number, number]>>();
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const idx = map[r][c] as number;
    const arr = cellsByRoom.get(idx) ?? []; arr.push([r, c]); cellsByRoom.set(idx, arr);
  }
  const out: Array<{ row: number; x0: number; x1: number; y0: number; y1: number }> = [];
  for (const [idx, cells] of cellsByRoom) {
    const minRow = Math.min(...cells.map(([r]) => r));
    const topRow = cells.filter(([r]) => r === minRow).map(([, c]) => c).sort((a, b) => a - b);
    const spanCenterCol = (topRow[0] + topRow[topRow.length - 1] + 1) / 2;
    const centerX = spanCenterCol * cellSize;
    const centerY = minRow * cellSize;
    const w = estWidth(level.rooms[idx].name.split(" ")[0]);
    out.push({ row: minRow, x0: centerX - w / 2, x1: centerX + w / 2, y0: centerY - pillH / 2, y1: centerY + pillH / 2 });
  }
  return out;
}

function clash(level: GeneratedLevel): boolean {
  const cs = REFERENCE_CELL, gap = 3;
  const p = computePlacements(level, cs, 1);
  for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) {
    const a = p[i], b = p[j];
    if (a.x0 < b.x1 + gap && a.x1 > b.x0 - gap && a.y0 < b.y1 + gap && a.y1 > b.y0 - gap) return true;
  }
  const topMarkers: Array<[number, number]> = [];
  for (const w of level.windows) if (w.side === "top") topMarkers.push([w.r, w.c]);
  for (const key of doorSuppressedEdgeSet(level.doors)) if (key.endsWith(",top")) {
    const [r, c] = key.slice(0, key.lastIndexOf(",")).split(",").map(Number);
    topMarkers.push([r, c]);
  }
  for (const pl of p) for (const [r, c] of topMarkers) {
    if (r !== pl.row) continue;
    if (pl.x0 < (c + 1) * cs && pl.x1 > c * cs) return true;
  }
  return false;
}

for (const n of [5, 7, 9] as const) {
  let clashCount = 0, total = 0, maxRetries = 0;
  for (let i = 0; i < 200; i++) {
    // simulate the retry loop
    let tries = 0; let accepted: GeneratedLevel | null = null;
    while (tries < 16) {
      const lvl = generateLevel(n);
      total++;
      if (!lvl) break;
      if (clash(lvl)) { clashCount++; tries++; continue; }
      accepted = lvl; break;
    }
    maxRetries = Math.max(maxRetries, tries);
    if (!accepted) console.log(`N=${n} run ${i}: hit cap without clean level`);
  }
  console.log(`N=${n}: generated=${total} clashed=${clashCount} (${(100*clashCount/total).toFixed(1)}%) maxRetriesInAnyRun=${maxRetries}`);
}
