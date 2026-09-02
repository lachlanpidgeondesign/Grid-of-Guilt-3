import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import svgPaths from "../../imports/svg-tum7nfzkr8";
import svgPathsEnd from "../../imports/svg-8afbcemiql";
import imgKitchen2 from "figma:asset/9104999f932b07a5050d85863767ef76ed9b8e15.png";
import imgHall2 from "figma:asset/97798e672f287290b8b3ebd22e7872d802818fc1.png";
import imgBathroom21 from "figma:asset/34b2ff7499c55faf6a79d53dffadcccefbb227b7.png";
import imgStudy22 from "figma:asset/7cde95b866ca537e31bc0f215294f33698b82be1.png";
import imgBedroom21 from "figma:asset/4a466bdc58ef88612b0027afdd441e2ca60b2f77.png";
import imgSkull from "figma:asset/a3421f4c3e01f93f3d4ecd691c2877bc43bb85f8.png";
import imgStripes from "figma:asset/e7789f7cef376d54a6decdc1ea68368daf83f3d6.png";
import imgRedStripes from "figma:asset/6ef35fa416ded2d3144709b550f95331c3928998.png";
import imgKnifePng from "figma:asset/58d165bd57360408c1c72634c155b7d947ea2f28.png";
import EndGameScreen from "./EndGameScreen";
import StartScreen from "./StartScreen";
import HowToPlayModal from "./HowToPlayModal";
import TutorialScreen from "./TutorialScreen";
import {
  trackTutorialStarted,
  trackPuzzleStarted,
  trackPuzzleCompleted,
  trackUndoUsed,
  trackPlacementError,
  trackRuleViolation,
  trackHintUsed,
  trackHowToPlayOpened,
} from "./analytics";
import CharacterAvatar from "../shared/CharacterAvatar";
import SuspectTile from "../shared/SuspectTile";
import { getRoomBorderEdges } from "../shared/boardGeometry";
import { ROOM_COLORS, ROOM_MAP, ROOM_CELLS } from "./authoredRooms";
import GeneratorGame from "../generator/GeneratorGame";

type SuspectName = "Amy" | "Dylan" | "Ben" | "Jess";
type CellContent = SuspectName | "Eve" | "X" | "skull" | null;

interface Action {
  type: "place-suspect" | "place-x" | "remove-x" | "remove-suspect";
  row: number;
  col: number;
  previousContent: CellContent;
}

const SOLUTION: Record<SuspectName | "Eve", [number, number]> = {
  Dylan: [0, 0],
  Eve: [1, 3],
  Ben: [2, 1],
  Amy: [3, 4],
  Jess: [4, 2],
};

const MURDERER = "Amy";

const ALL_SUSPECTS: (SuspectName | "Eve")[] = ["Amy", "Dylan", "Ben", "Jess", "Eve"];

// Exclamation mark SVG path (from Figma)
const EXCLAMATION_PATH = "M3 10.5C3 9.675 2.325 9 1.5 9C0.675 9 0 9.675 0 10.5C0 11.325 0.675 12 1.5 12C2.325 12 3 11.325 3 10.5ZM1.5 7.39363C0.675 7.39363 0 6.78931 0 6.037V1.35663C0 0.610482 0.675 0 1.5 0C2.325 0 3 0.604316 3 1.35663V6.037C3 6.78314 2.325 7.39363 1.5 7.39363Z";

interface PlacementErrors {
  crossHatchCells: Set<string>;
  redOutlineCells: Set<string>;
  hasError: boolean;
}

function getPlacementErrors(grid: CellContent[][]): PlacementErrors {
  const suspects: { name: string; row: number; col: number }[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const cell = grid[r][c];
      if (cell && cell !== "X" && cell !== "skull") {
        suspects.push({ name: cell, row: r, col: c });
      }
    }
  }

  const crossHatchCells = new Set<string>();
  const redOutlineCells = new Set<string>();
  let hasError = false;

  for (let i = 0; i < suspects.length; i++) {
    for (let j = i + 1; j < suspects.length; j++) {
      const a = suspects[i];
      const b = suspects[j];
      const rowDiff = Math.abs(a.row - b.row);
      const colDiff = Math.abs(a.col - b.col);

      // Same row
      if (a.row === b.row) {
        hasError = true;
        crossHatchCells.add(`${a.row},${a.col}`);
        crossHatchCells.add(`${b.row},${b.col}`);
        for (let c = 0; c < 5; c++) redOutlineCells.add(`${a.row},${c}`);
      }

      // Same column
      if (a.col === b.col) {
        hasError = true;
        crossHatchCells.add(`${a.row},${a.col}`);
        crossHatchCells.add(`${b.row},${b.col}`);
        for (let r = 0; r < 5; r++) redOutlineCells.add(`${r},${a.col}`);
      }

      // Adjacent (including diagonals)
      if (rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)) {
        hasError = true;
        crossHatchCells.add(`${a.row},${a.col}`);
        crossHatchCells.add(`${b.row},${b.col}`);
        redOutlineCells.add(`${a.row},${a.col}`);
        redOutlineCells.add(`${b.row},${b.col}`);
      }

      // Same room
      const roomA = ROOM_MAP[a.row][a.col];
      const roomB = ROOM_MAP[b.row][b.col];
      if (roomA === roomB) {
        hasError = true;
        crossHatchCells.add(`${a.row},${a.col}`);
        crossHatchCells.add(`${b.row},${b.col}`);
        redOutlineCells.add(`${a.row},${a.col}`);
        redOutlineCells.add(`${b.row},${b.col}`);
      }
    }
  }

  return { crossHatchCells, redOutlineCells, hasError };
}

function RedCrossHatch() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 3 }}>
      <img src={imgRedStripes} alt="" className="absolute inset-0 size-full object-cover pointer-events-none" />
    </div>
  );
}

function JailBars({ cellSize }: { cellSize: number }) {
  const barCount = 5;
  const barWidth = Math.max(3, cellSize * 0.05);
  const crossBarH = Math.max(3, cellSize * 0.045);

  // Haptic feedback on mobile when the bars land
  useEffect(() => {
    const startTap = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(10);
    }, 300);
    // Heavier thud when bars land (~300ms delay + 60% of 700ms animation)
    const landThud = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate([30, 40, 15]);
    }, 720);
    return () => { clearTimeout(startTap); clearTimeout(landThud); };
  }, []);

  return (
    <>
      <style>{`
        @keyframes jail-slide-down {
          0% { transform: translateY(-100%); }
          60% { transform: translateY(4%); }
          75% { transform: translateY(-2%); }
          100% { transform: translateY(0%); }
        }
      `}</style>
      {/* Clip container — crops bars to Ben's cell so they appear from the top edge */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 8 }}
      >
        {/* Animated inner — slides down within the clip */}
        <div
          className="absolute inset-0"
          style={{ animation: "jail-slide-down 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both" }}
        >
          <svg
            className="absolute pointer-events-none"
            style={{ left: 0, top: 0, width: "100%", height: "100%" }}
            viewBox={`0 0 ${cellSize} ${cellSize}`}
            fill="none"
            preserveAspectRatio="none"
          >
            {/* Vertical bars */}
            {Array.from({ length: barCount }, (_, i) => {
              const x = (cellSize / (barCount + 1)) * (i + 1);
              return (
                <rect
                  key={`v${i}`}
                  x={x - barWidth / 2}
                  y={0}
                  width={barWidth}
                  height={cellSize}
                  rx={barWidth / 2}
                  fill="#3a3a3a"
                />
              );
            })}
            {/* Top horizontal bar */}
            <rect x={0} y={cellSize * 0.08} width={cellSize} height={crossBarH} rx={crossBarH / 2} fill="#4a4a4a" />
            {/* Bottom horizontal bar */}
            <rect x={0} y={cellSize * 0.88} width={cellSize} height={crossBarH} rx={crossBarH / 2} fill="#4a4a4a" />
            {/* Middle horizontal bar */}
            <rect x={0} y={cellSize * 0.48} width={cellSize} height={crossBarH} rx={crossBarH / 2} fill="#4a4a4a" />
          </svg>
          {/* Subtle shadow behind bars for depth */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "rgba(0,0,0,0.08)", borderRadius: "inherit" }}
          />
        </div>
      </div>
    </>
  );
}

function ErrorBanner({ scale = 1 }: { scale?: number }) {
  const padding = Math.max(8, 12 * scale);
  const fontSize = Math.max(11, 15 * scale);
  const borderRadius = 8 * scale;
  return (
    <div
      className="relative shrink-0 w-full"
      style={{ backgroundColor: "#ffcbcb", borderRadius, padding }}
    >
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{ inset: 0, border: "1px solid red", borderRadius }}
      />
      <p
        className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-black"
        style={{ fontSize, lineHeight: 1.35 }}
      >
        Oops! Suspects can't share a row, column, or touch each other.
      </p>
    </div>
  );
}

function HintBanner({ text, scale = 1 }: { text: string; scale?: number }) {
  const padding = Math.max(8, 12 * scale);
  const fontSize = Math.max(11, 15 * scale);
  const borderRadius = 8 * scale;
  return (
    <div
      className="relative shrink-0 w-full"
      style={{ backgroundColor: "#e6ebed", borderRadius, padding }}
    >
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{ inset: 0, border: "1px solid #678893", borderRadius }}
      />
      <p
        className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-black"
        style={{ fontSize, lineHeight: 1.35 }}
      >
        {text}
      </p>
    </div>
  );
}

function StripeOverlay() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
      <img src={imgStripes} alt="" className="absolute inset-0 size-full object-cover pointer-events-none" />
    </div>
  );
}

function XMark({ scale = 1 }: { scale?: number }) {
  const size = 32 * scale;
  return (
    <svg className="shrink-0" style={{ width: size, height: size }} fill="none" viewBox="0 0 32 32">
      <path d="M10 10L22 22" stroke="#666666" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M10 22L22 10" stroke="#666666" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function SkullIcon({ scale = 1 }: { scale?: number }) {
  const size = 48 * scale;
  return (
    <img
      src={imgSkull}
      alt="Murder location"
      className="shrink-0 object-contain pointer-events-none"
      style={{ width: size, height: size }}
    />
  );
}

function Timer({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return (
    <span className="font-['Inter:Regular',sans-serif] font-normal text-[15px] text-[#fcfcfc] whitespace-nowrap">
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}

export default function PuzzleGame() {
  const [grid, setGrid] = useState<CellContent[][]>(() => {
    const g: CellContent[][] = Array.from({ length: 5 }, () => Array(5).fill(null));
    g[2][1] = "Ben";
    g[2][2] = "skull";
    return g;
  });

  const [selectedSuspect, setSelectedSuspect] = useState<SuspectName | "Eve" | null>(null);
  const [actionHistory, setActionHistory] = useState<Action[]>([]);
  const [timer, setTimer] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [showEndGame, setShowEndGame] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [returnedFromEnd, setReturnedFromEnd] = useState(false);
  const [gridSize, setGridSize] = useState(300);
  const [layoutReady, setLayoutReady] = useState(false);
  const outerRef = useRef<HTMLDivElement>(null);
  const [hintData, setHintData] = useState<{ text: string; cells: Set<string>; pendingCells: Set<string> } | null>(null);

  // Analytics counters (refs to avoid re-renders)
  const undoCountRef = useRef(0);
  const hintCountRef = useRef(0);
  const placementErrorCountRef = useRef(0);
  const ruleViolationCountRef = useRef(0);
  const tutorialStartTimeRef = useRef(0);

  // Intro animation state
  const [introPhase, setIntroPhase] = useState<'waiting' | 'scanning' | 'found' | 'revealing' | 'done'>('waiting');
  const introOverlayRef = useRef<HTMLDivElement>(null);
  const introStartRef = useRef(Date.now());
  const introRAFRef = useRef(0);
  const [showExclamation, setShowExclamation] = useState(false);

  const SCAN_DURATION = 3000;
  const FOUND_DURATION = 1500;
  const REVEAL_DURATION = 1000;

  // Store last scanning positions so flashlights freeze when found
  const frozenPosRef = useRef({ f2x: 0, f2y: 0, f3x: 0, f3y: 0, f4x: 0, f4y: 0 });

  useEffect(() => {
    if (introPhase !== 'scanning' && introPhase !== 'found') {
      cancelAnimationFrame(introRAFRef.current);
      return;
    }

    const animate = () => {
      const now = Date.now();
      const elapsed = now - introStartRef.current;
      const gs = gridSize;

      if (introPhase === 'scanning') {
        const t = Math.min(elapsed / SCAN_DURATION, 1);
        
        // All flashlights sweep to find skull at C3 (row 2, col 2 → 0.5, 0.5 in normalized coords - center of grid)
        // f1: sweeps from top-left toward center
        const f1x = gs * 0.1 + (gs * 0.5 - gs * 0.1) * t;
        const f1y = gs * 0.1 + (gs * 0.5 - gs * 0.1) * t;
        
        // f2: top-right sweeping to center
        const f2x = gs * 0.9 - (gs * 0.9 - gs * 0.5) * t;
        const f2y = gs * 0.1 + (gs * 0.5 - gs * 0.1) * t;
        
        // f3: bottom-left sweeping to center
        const f3x = gs * 0.1 + (gs * 0.5 - gs * 0.1) * t;
        const f3y = gs * 0.9 - (gs * 0.9 - gs * 0.5) * t;
        
        // f4: bottom-right sweeping toward center
        const f4x = gs * 0.9 - (gs * 0.9 - gs * 0.5) * t;
        const f4y = gs * 0.9 - (gs * 0.9 - gs * 0.5) * t;

        if (introOverlayRef.current) {
          const r = gs * 0.18;
          const el = introOverlayRef.current;
          el.style.setProperty('--f1x', `${f1x}px`);
          el.style.setProperty('--f1y', `${f1y}px`);
          el.style.setProperty('--f2x', `${f2x}px`);
          el.style.setProperty('--f2y', `${f2y}px`);
          el.style.setProperty('--f3x', `${f3x}px`);
          el.style.setProperty('--f3y', `${f3y}px`);
          el.style.setProperty('--f4x', `${f4x}px`);
          el.style.setProperty('--f4y', `${f4y}px`);
          el.style.setProperty('--fr', `${r}px`);
        }

        // Check if f1 has reached the skull - when it's close enough, trigger found phase
        const skullX = gs * 0.5;
        const skullY = gs * 0.5;
        const distToSkull = Math.sqrt(Math.pow(f1x - skullX, 2) + Math.pow(f1y - skullY, 2));
        
        // Trigger "found" when f1 is within a small radius of the skull (before t reaches 1)
        if (distToSkull < gs * 0.08 || t >= 1) {
          // Capture final scanning positions before transitioning
          frozenPosRef.current = { f2x, f2y, f3x, f3y, f4x, f4y };
          setIntroPhase('found');
          introStartRef.current = Date.now();
          setShowExclamation(true);
        }
      } else if (introPhase === 'found') {
        const t = Math.min((now - introStartRef.current) / FOUND_DURATION, 1);
        // f1 locks onto skull position at C3 (row 2, col 2 - center of grid)
        const skullX = gs * 0.5; // Center of column 2
        const skullY = gs * 0.5; // Center of row 2
        // Other flashlights converge to skull position with ease-out cubic
        const { f2x: f2x0, f2y: f2y0, f3x: f3x0, f3y: f3y0, f4x: f4x0, f4y: f4y0 } = frozenPosRef.current;
        const convergeT = Math.min(t / 0.6, 1); // converge in first 60% of found phase
        const ease = 1 - Math.pow(1 - convergeT, 3); // ease-out cubic
        const f2x = f2x0 + (skullX - f2x0) * ease;
        const f2y = f2y0 + (skullY - f2y0) * ease;
        const f3x = f3x0 + (skullX - f3x0) * ease;
        const f3y = f3y0 + (skullY - f3y0) * ease;
        const f4x = f4x0 + (skullX - f4x0) * ease;
        const f4y = f4y0 + (skullY - f4y0) * ease;

        if (introOverlayRef.current) {
          const r = gs * 0.18;
          const el = introOverlayRef.current;
          el.style.setProperty('--f1x', `${skullX}px`);
          el.style.setProperty('--f1y', `${skullY}px`);
          el.style.setProperty('--f2x', `${f2x}px`);
          el.style.setProperty('--f2y', `${f2y}px`);
          el.style.setProperty('--f3x', `${f3x}px`);
          el.style.setProperty('--f3y', `${f3y}px`);
          el.style.setProperty('--f4x', `${f4x}px`);
          el.style.setProperty('--f4y', `${f4y}px`);
          el.style.setProperty('--fr', `${r}px`);
        }

        if (t >= 1) {
          setIntroPhase('revealing');
          setTimeout(() => {
            setIntroPhase('done');
            trackPuzzleStarted();
          }, REVEAL_DURATION);
        }
      }

      introRAFRef.current = requestAnimationFrame(animate);
    };

    introRAFRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(introRAFRef.current);
  }, [introPhase, gridSize]);

  // Drag & drop state
  const [dragState, setDragState] = useState<{ name: SuspectName | "Eve"; fromGrid: [number, number] | null } | null>(null);
  const dragPosRef = useRef({ x: 0, y: 0 });
  const floatingRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, moved: false });
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);

  // X-painting state
  const xPaintingRef = useRef<{ active: boolean; placedCells: { row: number; col: number; prev: CellContent }[] }>({ active: false, placedCells: [] });

  // Rule tapping state
  const [shakingSuspect, setShakingSuspect] = useState<string | null>(null);
  const [flashingRoom, setFlashingRoom] = useState<string | null>(null);

  // Auto-clear shake/flash
  useEffect(() => {
    if (!shakingSuspect) return;
    const t = setTimeout(() => setShakingSuspect(null), 600);
    return () => clearTimeout(t);
  }, [shakingSuspect]);

  useEffect(() => {
    if (!flashingRoom) return;
    const t = setTimeout(() => setFlashingRoom(null), 1200);
    return () => clearTimeout(t);
  }, [flashingRoom]);

  const handleRuleSuspectTap = (name: string) => setShakingSuspect(name);
  const handleRuleRoomTap = (room: string) => setFlashingRoom(room);

  // Helper: get grid cell from pointer position (uses gridSize to avoid TDZ with cellSize)
  const getCellFromPointer = (clientX: number, clientY: number): [number, number] | null => {
    const gc = gridContainerRef.current;
    if (!gc) return null;
    const rect = gc.getBoundingClientRect();
    const cs = gridSize / 5;
    const col = Math.floor((clientX - rect.left) / cs);
    const row = Math.floor((clientY - rect.top) / cs);
    if (row >= 0 && row < 5 && col >= 0 && col < 5) return [row, col];
    return null;
  };

  const isOverTray = (clientX: number, clientY: number): boolean => {
    const tray = trayRef.current;
    if (!tray) return false;
    const rect = tray.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  };

  const updateFloatingPos = (clientX: number, clientY: number) => {
    dragPosRef.current = { x: clientX, y: clientY };
    if (floatingRef.current) {
      const ts = 64 * (gridSize / 358);
      floatingRef.current.style.transform = `translate(${clientX - ts / 2}px, ${clientY - ts / 2}px)`;
    }
  };

  // gridRef for reading grid in event handlers without stale closures
  const gridRef = useRef(grid);
  gridRef.current = grid;

  // Drag start (from tray or grid)
  const handlePointerDown = (e: React.PointerEvent, name: SuspectName | "Eve", fromGrid: [number, number] | null) => {
    if (gameWon || introPhase !== 'done') return;
    e.preventDefault();
    // Capture pointer to receive all events even if finger moves off element
    try { (e.target as Element).setPointerCapture(e.pointerId); } catch (_) {}
    // Prevent page scrolling on mobile during drag
    const preventScroll = (te: TouchEvent) => te.preventDefault();
    document.addEventListener("touchmove", preventScroll, { passive: false });
    dragStartRef.current = { x: e.clientX, y: e.clientY, moved: false };
    const startFromGrid = fromGrid;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - dragStartRef.current.x;
      const dy = ev.clientY - dragStartRef.current.y;
      if (!dragStartRef.current.moved && Math.sqrt(dx * dx + dy * dy) > 5) {
        dragStartRef.current.moved = true;
        if (startFromGrid) {
          setGrid(prev => {
            const ng = prev.map(r => [...r]);
            ng[startFromGrid[0]][startFromGrid[1]] = null;
            return ng;
          });
        }
        setSelectedSuspect(null);
        setDragState({ name, fromGrid: startFromGrid });
        updateFloatingPos(ev.clientX, ev.clientY);
      }
      if (dragStartRef.current.moved) {
        updateFloatingPos(ev.clientX, ev.clientY);
      }
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("touchmove", preventScroll);
      if (!dragStartRef.current.moved) {
        if (startFromGrid) {
          handleCellClick(startFromGrid[0], startFromGrid[1]);
        } else {
          handleSuspectClick(name);
        }
        return;
      }
      const cell = getCellFromPointer(ev.clientX, ev.clientY);
      const overTray = isOverTray(ev.clientX, ev.clientY);

      setGrid(prev => {
        const ng = prev.map(r => [...r]);
        if (cell) {
          const [row, col] = cell;
          const targetCell = ng[row][col];
          if (targetCell === null || targetCell === "X") {
            ng[row][col] = name;
            if (startFromGrid) {
              setActionHistory(h => [...h,
                { type: "remove-suspect", row: startFromGrid[0], col: startFromGrid[1], previousContent: name },
                { type: "place-suspect", row, col, previousContent: targetCell }
              ]);
            } else {
              setActionHistory(h => [...h, { type: "place-suspect", row, col, previousContent: targetCell }]);
            }
            if (checkWin(ng)) setGameWon(true);
          } else {
            if (startFromGrid) ng[startFromGrid[0]][startFromGrid[1]] = name;
          }
        } else if (overTray && startFromGrid) {
          setActionHistory(h => [...h, { type: "remove-suspect", row: startFromGrid[0], col: startFromGrid[1], previousContent: name }]);
        } else {
          if (startFromGrid) ng[startFromGrid[0]][startFromGrid[1]] = name;
        }
        return ng;
      });
      setDragState(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // X-painting: pointer down on empty/X grid cell (paint X on empty, erase X on X)
  const handleGridPointerDown = (e: React.PointerEvent, row: number, col: number) => {
    if (gameWon || introPhase !== 'done') return;
    if (selectedSuspect) {
      handleCellClick(row, col);
      return;
    }
    if (dragState) return;
    const content = gridRef.current[row][col];
    if (content !== null && content !== "X") return;
    e.preventDefault();
    // Capture pointer and prevent scrolling for X-painting on mobile
    try { (e.target as Element).setPointerCapture(e.pointerId); } catch (_) {}
    const preventScroll = (te: TouchEvent) => te.preventDefault();
    document.addEventListener("touchmove", preventScroll, { passive: false });
    dragStartRef.current = { x: e.clientX, y: e.clientY, moved: false };
    const paintedSet = new Set<string>();
    const eraseMode = content === "X";
    xPaintingRef.current = { active: true, placedCells: [] };

    const paintCell = (r: number, c: number) => {
      const key = `${r},${c}`;
      if (paintedSet.has(key)) return;
      paintedSet.add(key);
      if (eraseMode) {
        setGrid(prev => {
          if (prev[r][c] !== "X") return prev;
          const ng = prev.map(row => [...row]);
          ng[r][c] = null;
          xPaintingRef.current.placedCells.push({ row: r, col: c, prev: "X" });
          return ng;
        });
      } else {
        setGrid(prev => {
          if (prev[r][c] !== null) return prev;
          const ng = prev.map(row => [...row]);
          ng[r][c] = "X";
          xPaintingRef.current.placedCells.push({ row: r, col: c, prev: null });
          return ng;
        });
      }
    };

    paintCell(row, col);

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - dragStartRef.current.x;
      const dy = ev.clientY - dragStartRef.current.y;
      if (!dragStartRef.current.moved && Math.sqrt(dx * dx + dy * dy) > 5) {
        dragStartRef.current.moved = true;
      }
      if (dragStartRef.current.moved) {
        const c = getCellFromPointer(ev.clientX, ev.clientY);
        if (c) paintCell(c[0], c[1]);
      }
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("touchmove", preventScroll);
      const placed = xPaintingRef.current.placedCells;
      if (placed.length > 0) {
        setActionHistory(h => [...h, ...placed.map(p => ({
          type: eraseMode ? "remove-x" as const : "place-x" as const,
          row: p.row,
          col: p.col,
          previousContent: p.prev
        }))]);
      } else if (!dragStartRef.current.moved) {
        handleCellClick(row, col);
      }
      xPaintingRef.current = { active: false, placedCells: [] };
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Timer - only starts after intro animation completes
  useEffect(() => {
    if (gameWon || introPhase !== 'done' || showHowToPlay || showTutorial) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameWon, introPhase, showHowToPlay, showTutorial]);

  // Jail animation + transition to end game screen when puzzle is solved
  useEffect(() => {
    if (!gameWon) return;
    trackPuzzleCompleted({
      completion_time_seconds: timer,
      undo_count: undoCountRef.current,
      hint_count: hintCountRef.current,
      placement_error_count: placementErrorCountRef.current,
      rule_violation_count: ruleViolationCountRef.current,
    });
    // 2.5s pause for jail animation to play, then show end game screen
    const timeout = setTimeout(() => setShowEndGame(true), 2500);
    return () => clearTimeout(timeout);
  }, [gameWon]);

  // Responsive grid sizing - useLayoutEffect to prevent initial flash at wrong size
  useLayoutEffect(() => {
    const update = () => {
      if (!outerRef.current) return;
      const vh = window.innerHeight;
      const availableW = Math.min(outerRef.current.clientWidth - 32, 500);

      // Fixed pixel elements: header(44) + pt(8) + spacer(16) + spacer(16) + pb(16)
      const fixedH = 100;
      const availH = vh - fixedH;

      // Scaled elements as ratios of gridSize (gridScale = gridSize/358):
      // buttons(36) + tray(80) = 116 → ratio = 116/358
      const companionRatio = 116 / 358;
      // Rules ideal: padTop(16) + 4 items(19*4) + 3 gaps(12*3) + banner(44) + bannerGap(12) + buffer(8) = 174 → ratio = 174/358
      const rulesIdealRatio = 174 / 358;
      // Rules minimum: padTop(16) + 3 items(19*3) + 2 gaps(12*2) = 97 → ratio = 97/358
      const rulesMinRatio = 97 / 358;

      const maxGrid = Math.min(availableW, 500);

      // Two-phase approach:
      // Phase 1: Shrink grid first, keeping rules at ideal height (4+ rules visible)
      const phase1Grid = availH / (1 + companionRatio + rulesIdealRatio);
      
      // Phase 2: Both shrink together, keeping rules at minimum height (3 rules visible)
      const phase2Grid = availH / (1 + companionRatio + rulesMinRatio);

      let finalSize: number;
      // Use Phase 1 as long as the grid doesn't get too small
      // Once grid would be < 250px with ideal rules, switch to Phase 2
      if (phase1Grid >= 250) {
        finalSize = Math.min(phase1Grid, maxGrid);
      } else {
        // Phase 2: maintain minimum 3 rules, grid can shrink further
        finalSize = Math.min(phase2Grid, maxGrid);
        finalSize = Math.max(180, finalSize);
      }

      setGridSize(finalSize);
      setLayoutReady(true);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const cellSize = gridSize / 5;
  const gridScale = gridSize / 358;
  const gridBorderRadius = 8 * gridScale;

  const placedSuspects = new Set<string>();
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const cell = grid[r][c];
      if (cell && cell !== "X" && cell !== "skull") placedSuspects.add(cell);
    }
  }

  const checkWin = useCallback((g: CellContent[][]) => {
    for (const [name, [row, col]] of Object.entries(SOLUTION)) {
      if (g[row][col] !== name) return false;
    }
    return true;
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (gameWon || introPhase !== 'done') return;
    const current = grid[row][col];
    if (current === "Ben" || current === "skull") return;

    if (selectedSuspect) {
      if (current && current !== "X") {
        setSelectedSuspect(null);
        return;
      }
      const newGrid = grid.map((r) => [...r]);
      newGrid[row][col] = selectedSuspect;
      setGrid(newGrid);
      setActionHistory((h) => [...h, { type: "place-suspect", row, col, previousContent: current }]);
      setSelectedSuspect(null);
      if (checkWin(newGrid)) setGameWon(true);
    } else {
      if (current === null) {
        const newGrid = grid.map((r) => [...r]);
        newGrid[row][col] = "X";
        setGrid(newGrid);
        setActionHistory((h) => [...h, { type: "place-x", row, col, previousContent: null }]);
      } else if (current === "X") {
        const newGrid = grid.map((r) => [...r]);
        newGrid[row][col] = null;
        setGrid(newGrid);
        setActionHistory((h) => [...h, { type: "place-x", row, col, previousContent: "X" }]);
      } else {
        const newGrid = grid.map((r) => [...r]);
        newGrid[row][col] = null;
        setGrid(newGrid);
        setActionHistory((h) => [...h, { type: "remove-suspect", row, col, previousContent: current }]);
      }
    }
  };

  const handleSuspectClick = (name: SuspectName) => {
    if (gameWon || introPhase !== 'done') return;
    setSelectedSuspect((prev) => (prev === name ? null : name));
  };

  const handleStartGame = () => {
    setShowStartScreen(false);
    setShowTutorial(true);
    trackTutorialStarted();
    tutorialStartTimeRef.current = Date.now();
  };

  // Launch generator mode. Deliberately does NOT go through handleStartGame
  // (which forces the tutorial) and does not touch introPhase.
  const handleStartGenerator = () => {
    setShowStartScreen(false);
    setShowGenerator(true);
  };

  const handleTutorialDone = () => {
    setShowTutorial(false);
    setIntroPhase('scanning');
    introStartRef.current = Date.now();
  };

  const handleUndo = () => {
    if (actionHistory.length === 0 || gameWon || !!hintData) return;
    const last = actionHistory[actionHistory.length - 1];
    const newGrid = grid.map((r) => [...r]);
    newGrid[last.row][last.col] = last.previousContent;
    setGrid(newGrid);
    setActionHistory((h) => h.slice(0, -1));
    setSelectedSuspect(null);
    undoCountRef.current += 1;
    trackUndoUsed(undoCountRef.current);
  };

  // Hint computation
  const computeHint = (): { text: string; cells: Set<string>; pendingCells: Set<string> } | null => {
    const isEmpty = (r: number, c: number) => grid[r][c] === null;
    const suspPos: Partial<Record<SuspectName, [number, number]>> = {};
    for (const name of ALL_SUSPECTS) {
      const p = findSuspect(name);
      if (p) suspPos[name] = p;
    }

    // Priority 1: Incorrect suspect placed
    for (const name of ALL_SUSPECTS) {
      const pos = suspPos[name];
      if (!pos) continue;
      const [sr, sc] = SOLUTION[name];
      if (pos[0] !== sr || pos[1] !== sc) {
        return { text: `Hint: ${name} is not in the right position. Tap them to pick them back up.`, cells: new Set([`${pos[0]},${pos[1]}`]), pendingCells: new Set() };
      }
    }

    // Priority 2: Incorrect X placed (X at a solution cell)
    for (const [name, [sr, sc]] of Object.entries(SOLUTION)) {
      if (grid[sr][sc] === "X") {
        return { text: `Hint: A suspect belongs here. Remove the X.`, cells: new Set([`${sr},${sc}`]), pendingCells: new Set([`${sr},${sc}`]) };
      }
    }

    // All placed suspects are correct. Build list of correctly placed suspects (incl Ben)
    const correctlyPlaced: { row: number; col: number; room: string }[] = [
      { row: 2, col: 1, room: "bedroom" },
    ];
    for (const name of ALL_SUSPECTS) {
      if (suspPos[name]) {
        const [r, c] = suspPos[name]!;
        correctlyPlaced.push({ row: r, col: c, room: ROOM_MAP[r][c] });
      }
    }

    // Priority 3: Same room elimination — one suspect at a time
    for (const s of correctlyPlaced) {
      const cells = ROOM_CELLS[s.room];
      const roomElim = new Set<string>();
      if (cells) for (const ck of cells) {
        const [r, c] = ck.split(",").map(Number);
        if (isEmpty(r, c)) roomElim.add(ck);
      }
      if (roomElim.size > 0) {
        const allCells = new Set(roomElim);
        allCells.add(`${s.row},${s.col}`);
        return { text: "Hint: Only 1 suspect per room. Eliminate the striped cells.", cells: allCells, pendingCells: roomElim };
      }
    }

    // Priority 4: Row/column elimination — one suspect at a time
    for (const s of correctlyPlaced) {
      const rcElim = new Set<string>();
      for (let c = 0; c < 5; c++) if (isEmpty(s.row, c)) rcElim.add(`${s.row},${c}`);
      for (let r = 0; r < 5; r++) if (isEmpty(r, s.col)) rcElim.add(`${r},${s.col}`);
      if (rcElim.size > 0) {
        const allCells = new Set(rcElim);
        allCells.add(`${s.row},${s.col}`);
        return { text: "Hint: No 2 suspects in the same row or column. Eliminate the striped cells.", cells: allCells, pendingCells: rcElim };
      }
    }

    // Priority 5: Adjacent elimination — one suspect at a time
    for (const s of correctlyPlaced) {
      const adjElim = new Set<string>();
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = s.row + dr, nc = s.col + dc;
        if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && isEmpty(nr, nc)) adjElim.add(`${nr},${nc}`);
      }
      if (adjElim.size > 0) {
        const allCells = new Set(adjElim);
        allCells.add(`${s.row},${s.col}`);
        return { text: "Hint: Suspects can't touch each other. Eliminate the striped cells.", cells: allCells, pendingCells: adjElim };
      }
    }

    // STRATEGIC HINTS (Priority 6-11)
    // Guide the player through logical deduction steps for this level

    // Priority 6: Hall cells A4, A5 must be eliminated (Kitchen constraint)
    if (isEmpty(0, 3) || isEmpty(0, 4)) {
      const elimCells = new Set<string>();
      if (isEmpty(0, 3)) elimCells.add("0,3");
      if (isEmpty(0, 4)) elimCells.add("0,4");
      if (elimCells.size > 0) {
        // Highlight all kitchen cells plus the elimination cells
        const kitchenCells = ["0,0", "0,1", "0,2"];
        const allCells = new Set([...kitchenCells, ...elimCells]);
        return { text: "Hint: A suspect must be in the Kitchen. Eliminate the striped cells.", cells: allCells, pendingCells: elimCells };
      }
    }

    // Priority 7: Cells E4, E5 must be eliminated (Hall and Study constraint)
    if (isEmpty(4, 3) || isEmpty(4, 4)) {
      const elimCells = new Set<string>();
      if (isEmpty(4, 3)) elimCells.add("4,3");
      if (isEmpty(4, 4)) elimCells.add("4,4");
      if (elimCells.size > 0) {
        // Highlight Hall and Study cells plus the elimination cells
        const hallCells = ["0,3", "0,4", "1,2", "1,3", "1,4"];
        const studyCells = ["2,2", "2,3", "2,4", "3,2", "3,3", "3,4"];
        const allCells = new Set([...hallCells, ...studyCells, ...elimCells]);
        return { text: "Hint: Suspects must be in the Hall and Study. Eliminate the striped cells.", cells: allCells, pendingCells: elimCells };
      }
    }

    // Priority 8: Place Dylan at A1
    if (!suspPos["Dylan"]) {
      return { text: "Hint: Place Dylan on the highlighted cell. They were spotted in a corner and can't be in the Bathroom.", cells: new Set(["0,0"]), pendingCells: new Set(["0,0"]) };
    }

    // Priority 9: Place Jess at E3
    if (!suspPos["Jess"]) {
      return { text: "Hint: Place Jess on the highlighted cell. They were seen in the Bathroom.", cells: new Set(["4,2"]), pendingCells: new Set(["4,2"]) };
    }

    // Priority 10: Place Eve at B4
    if (!suspPos["Eve"]) {
      return { text: "Hint: Place Eve on the highlighted cell. They were spotted in an even column.", cells: new Set(["1,3"]), pendingCells: new Set(["1,3"]) };
    }

    // Priority 11: Place Amy at D5 (the murderer)
    if (!suspPos["Amy"]) {
      return { text: "Hint: Place the final suspect on the highlighted cell. They were seen on the outer walls.", cells: new Set(["3,4"]), pendingCells: new Set(["3,4"]) };
    }

    return null;
  };

  const handleHint = () => {
    if (gameWon) return;
    if (hintData) { setHintData(null); return; }
    const hint = computeHint();
    setHintData(hint);
    if (hint) {
      hintCountRef.current += 1;
      trackHintUsed(hintCountRef.current);
    }
  };

  // Auto-clear hint when all pending cells are resolved
  useEffect(() => {
    if (!hintData) return;

    // For "not in right position" hints: clear when the suspect is removed from the wrong cell
    if (hintData.text.includes("not in the right position")) {
      // The cells set contains the wrong position cell; check if suspect is still there
      const wrongCells = [...hintData.cells];
      const suspectStillThere = wrongCells.some((ck) => {
        const [r, c] = ck.split(",").map(Number);
        const cell = grid[r][c];
        // Check if there's a moveable suspect in the wrong position
        return cell !== null && cell !== "X" && cell !== "skull";
      });
      if (!suspectStillThere) { setHintData(null); }
      return; // Don't continue to other checks for wrong placement hints
    }

    if (hintData.pendingCells.size > 0) {
      const isRemoveXHint = hintData.text.includes("Remove the X");
      const isPlaceXHint = hintData.text.includes("Place an X");
      const isPlaceSuspectHint = hintData.text.includes("Place") && !isPlaceXHint;
      const allResolved = [...hintData.pendingCells].every((ck) => {
        const [r, c] = ck.split(",").map(Number);
        const cell = grid[r][c];
        if (isRemoveXHint) {
          // Resolved when the X is gone (null or suspect)
          return cell !== "X";
        }
        if (isPlaceXHint) {
          // Resolved when an X is placed
          return cell === "X";
        }
        if (isPlaceSuspectHint) {
          // Resolved when a suspect is placed (not null, not X, not skull)
          return cell !== null && cell !== "X" && cell !== "skull";
        }
        // Elimination hints: resolved when cell is filled
        return cell !== null;
      });
      if (allResolved) setHintData(null);
    } else {
      // Elimination hint with no specific pending cells:
      // Check if all originally empty highlighted cells are now filled
      const allFilled = [...hintData.cells].every((ck) => {
        const [r, c] = ck.split(",").map(Number);
        return grid[r][c] !== null;
      });
      if (allFilled) setHintData(null);
    }
  }, [grid, hintData]);

  // Check rules
  const findSuspect = (name: string): [number, number] | null => {
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (grid[r][c] === name) return [r, c];
    return null;
  };
  const amyPos = findSuspect("Amy");
  const dylanPos = findSuspect("Dylan");
  const benPos = findSuspect("Ben");
  const jessPos = findSuspect("Jess");

  const findEve = (): [number, number] | null => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (grid[r][c] === "Eve") return [r, c];
      }
    }
    return null;
  };
  const evePos = findEve();

  const rules = [
    dylanPos ? (dylanPos[0] === 0 && dylanPos[1] === 0) || (dylanPos[0] === 0 && dylanPos[1] === 4) || (dylanPos[0] === 4 && dylanPos[1] === 0) || (dylanPos[0] === 4 && dylanPos[1] === 4) : false,
    jessPos ? ROOM_MAP[jessPos[0]]?.[jessPos[1]] === "bathroom" : false,
    evePos ? evePos[1] === 1 || evePos[1] === 3 : false, // Eve in even column (1-indexed: col 2 or 4 = 0-indexed: col 1 or 3)
    amyPos ? amyPos[0] === 0 || amyPos[0] === 4 || amyPos[1] === 0 || amyPos[1] === 4 : false,
  ];

  const getCellRounding = (row: number, col: number): string => {
    const r = gridBorderRadius;
    return `${row === 0 && col === 0 ? r : 0}px ${row === 0 && col === 4 ? r : 0}px ${row === 4 && col === 4 ? r : 0}px ${row === 4 && col === 0 ? r : 0}px`;
  };

  // Rules area scroll detection
  const clueAreaRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [scrollThumbTop, setScrollThumbTop] = useState(0);
  const [scrollThumbHeight, setScrollThumbHeight] = useState(60);

  const updateScrollInfo = useCallback(() => {
    const el = clueAreaRef.current;
    if (!el) return;
    const hasScroll = el.scrollHeight > el.clientHeight + 1;
    setNeedsScroll(hasScroll);
    if (hasScroll) {
      const thumbH = Math.max(20, (el.clientHeight / el.scrollHeight) * 100);
      const scrollRatio = el.scrollTop / (el.scrollHeight - el.clientHeight);
      const thumbTop = scrollRatio * (100 - thumbH);
      setScrollThumbHeight(thumbH);
      setScrollThumbTop(thumbTop);
    }
  }, []);

  useEffect(() => {
    updateScrollInfo();
    window.addEventListener("resize", updateScrollInfo);
    return () => window.removeEventListener("resize", updateScrollInfo);
  }, [updateScrollInfo]);

  useEffect(() => {
    const el = clueAreaRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollInfo);
    return () => el.removeEventListener("scroll", updateScrollInfo);
  }, [updateScrollInfo]);

  useEffect(() => {
    setTimeout(updateScrollInfo, 500);
  }, [rules[0], rules[1], rules[2], rules[3], gridSize, updateScrollInfo]);

  // FLIP animation for rules reordering
  const ruleRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const prevPositions = useRef<Record<number, number>>({});

  // Capture positions before render
  useLayoutEffect(() => {
    // After DOM update, check if positions changed and animate
    const animations: { el: HTMLDivElement; from: number; to: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const el = ruleRefs.current[i];
      if (!el) continue;
      const newTop = el.offsetTop;
      const oldTop = prevPositions.current[i];
      if (oldTop !== undefined && Math.abs(oldTop - newTop) > 1) {
        animations.push({ el, from: oldTop - newTop, to: 0 });
      }
      prevPositions.current[i] = newTop;
    }
    // Apply FLIP animations
    for (const { el, from } of animations) {
      el.style.transform = `translateY(${from}px)`;
      el.style.transition = "none";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease";
          el.style.transform = "translateY(0)";
        });
      });
    }
  });

  // Capture positions before state changes for FLIP
  useEffect(() => {
    for (let i = 0; i < 4; i++) {
      const el = ruleRefs.current[i];
      if (el) prevPositions.current[i] = el.offsetTop;
    }
  });

  const ruleItems = [
    <p key="r0" className="font-['Inter:Regular',sans-serif]" style={{ fontSize: "inherit" }}>
      <span className="font-['Inter:Bold',sans-serif] font-bold text-[#a25603] underline decoration-solid cursor-pointer" onClick={() => handleRuleSuspectTap("Dylan")}>Dylan</span>
      <span className="font-normal">{` was spotted in a corner of the house`}</span>
    </p>,
    <p key="r1" className="font-['Inter:Regular',sans-serif]" style={{ fontSize: "inherit" }}>
      <span className="font-['Inter:Bold',sans-serif] font-bold text-[#0071cb] underline decoration-solid cursor-pointer" onClick={() => handleRuleSuspectTap("Jess")}>Jess</span>
      <span className="font-normal">{` was seen in the `}</span>
      <span className="inline-block align-middle cursor-pointer" onClick={() => handleRuleRoomTap("bathroom")} style={{ height: '1.2em', transform: 'translateY(-0.05em)' }}>
        <img alt="Bathroom" src={imgBathroom21} className="h-full object-contain inline-block" />
      </span>
    </p>,
    <p key="r2" className="font-['Inter:Regular',sans-serif]" style={{ fontSize: "inherit" }}>
      <span className="font-['Inter:Bold',sans-serif] font-bold text-[#055b0f] underline decoration-solid cursor-pointer" onClick={() => handleRuleSuspectTap("Eve")}>Eve</span>
      <span className="font-normal">{` was spotted in an even column`}</span>
    </p>,
    <p key="r3" className="font-['Inter:Regular',sans-serif]" style={{ fontSize: "inherit" }}>
      <span className="font-['Inter:Bold',sans-serif] font-bold text-[#e3202d] underline decoration-solid cursor-pointer" onClick={() => handleRuleSuspectTap("Amy")}>Amy</span>
      <span className="font-normal">{` was seen on the outer walls of the house`}</span>
    </p>,
  ];

  const borderW = Math.max(2, 3 * gridScale);
  const tileSize = 64 * gridScale;
  const trayGap = 12 * gridScale;
  const btnHeight = Math.max(28, 36 * gridScale);
  const btnIconSize = Math.max(16, 20 * gridScale);
  const btnFontSize = Math.max(12, 15 * gridScale);
  const btnGap = Math.max(4, 8 * gridScale);

  // Calculate min-height for rules: enough for 2 rules
  const ruleItemH = Math.max(19, 19 * gridScale);
  const ruleGap = 12 * gridScale;
  const rulesPadTop = 16 * gridScale;
  const rulesMinH = rulesPadTop + ruleItemH * 3 + ruleGap * 2;

  const placementErrors = getPlacementErrors(grid);

  // Rule error detection: a rule is in error when the suspect is placed but the rule is NOT satisfied
  const ruleErrors = [
    dylanPos !== null && !rules[0],     // Dylan placed but not in corner
    jessPos !== null && !rules[1],      // Jess placed but not in bathroom
    evePos !== null && !rules[2],       // Eve placed but not in even column
    amyPos !== null && !rules[3],       // Amy placed but not on outer walls
  ];

  // Cells that get cross-hatch from rule violations
  const ruleCrossHatchCells = new Set<string>();
  if (ruleErrors[0] && dylanPos) ruleCrossHatchCells.add(`${dylanPos[0]},${dylanPos[1]}`);
  if (ruleErrors[1] && jessPos) ruleCrossHatchCells.add(`${jessPos[0]},${jessPos[1]}`);
  if (ruleErrors[2] && evePos) ruleCrossHatchCells.add(`${evePos[0]},${evePos[1]}`);
  if (ruleErrors[3] && amyPos) ruleCrossHatchCells.add(`${amyPos[0]},${amyPos[1]}`);

  // Combined cross-hatch cells (placement + rule errors)
  const allCrossHatchCells = new Set([...placementErrors.crossHatchCells, ...ruleCrossHatchCells]);

  // Valid cells per suspect based on their rule (for drag/select dimming)
  const activeSuspect = dragState?.name ?? selectedSuspect;
  const validCellsForActive = (() => {
    if (!activeSuspect) return null;
    const cells = new Set<string>();
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        let valid = false;
        if (activeSuspect === "Dylan") valid = (r === 0 && c === 0) || (r === 0 && c === 4) || (r === 4 && c === 0) || (r === 4 && c === 4);
        else if (activeSuspect === "Jess") valid = ROOM_MAP[r][c] === "bathroom";
        else if (activeSuspect === "Eve") valid = c === 1 || c === 3;
        else if (activeSuspect === "Amy") valid = r === 0 || r === 4 || c === 0 || c === 4;
        else valid = true; // Ben is pre-placed, no rule
        if (valid) cells.add(`${r},${c}`);
      }
    }
    return cells;
  })();

  const hasAnyError = placementErrors.hasError || ruleErrors.some(Boolean);

  // Track placement errors & rule violations (fire once per new occurrence)
  const prevPlacementErrorRef = useRef(false);
  const prevRuleViolationRef = useRef(false);
  const hasRuleViolation = ruleErrors.some(Boolean);

  useEffect(() => {
    if (placementErrors.hasError && !prevPlacementErrorRef.current && !gameWon) {
      placementErrorCountRef.current += 1;
      trackPlacementError(placementErrorCountRef.current);
    }
    prevPlacementErrorRef.current = placementErrors.hasError;
  }, [placementErrors.hasError, gameWon]);

  useEffect(() => {
    if (hasRuleViolation && !prevRuleViolationRef.current && !gameWon) {
      ruleViolationCountRef.current += 1;
      trackRuleViolation(ruleViolationCountRef.current);
    }
    prevRuleViolationRef.current = hasRuleViolation;
  }, [hasRuleViolation, gameWon]);

  // Sort rules: errors first (top), then normal (original order), then fulfilled (bottom)
  const sortedRuleOrder = [0, 1, 2, 3].sort((a, b) => {
    const aError = ruleErrors[a] ? -1 : 0;
    const bError = ruleErrors[b] ? -1 : 0;
    const aFulfilled = rules[a] ? 1 : 0;
    const bFulfilled = rules[b] ? 1 : 0;
    const aPriority = aError || aFulfilled; // -1 for error, 0 for normal, 1 for fulfilled
    const bPriority = bError || bFulfilled;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a - b;
  });

  // Generator mode: early return AFTER all hooks so the daily board (and its
  // resize listeners + intro animation loop) never mounts underneath it.
  if (showGenerator) {
    return <GeneratorGame onBackToStart={() => { setShowGenerator(false); setShowStartScreen(true); }} />;
  }

  return (
    <div ref={outerRef} className="flex flex-col h-[100dvh] w-full overflow-hidden" style={{ visibility: layoutReady ? 'visible' : 'hidden', backgroundColor: introPhase === 'done' ? '#fcfcfc' : introPhase === 'revealing' ? '#fcfcfc' : '#0a0a0a', transition: introPhase === 'revealing' ? `background-color ${REVEAL_DURATION}ms ease-out` : 'none' }}>
      <style>{`
        .clue-scroll::-webkit-scrollbar { display: none; }
        @keyframes puzzle-shake-kf {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-4px) rotate(-2deg); }
          30% { transform: translateX(3px) rotate(1.5deg); }
          45% { transform: translateX(-3px) rotate(-1deg); }
          60% { transform: translateX(2px) rotate(1deg); }
          75% { transform: translateX(-1px); }
        }
        .puzzle-shake { animation: puzzle-shake-kf 0.5s ease-in-out; }
        @keyframes puzzle-room-flash-kf {
          0% { opacity: 0; }
          25% { opacity: 1; }
          50% { opacity: 0.2; }
          75% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        .puzzle-room-flash { animation: puzzle-room-flash-kf 1.2s ease-in-out forwards; }
        @keyframes intro-exclamation-pop {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          50% { transform: scale(1.3) rotate(5deg); opacity: 1; }
          70% { transform: scale(0.9) rotate(-2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .intro-exclamation { animation: intro-exclamation-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes intro-reveal-fade {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes intro-fade-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .intro-overlay-dark {
          background: rgba(0,0,0,0.93);
          -webkit-mask-image:
            radial-gradient(circle var(--fr) at var(--f1x) var(--f1y), transparent 30%, black 90%),
            radial-gradient(circle var(--fr) at var(--f2x) var(--f2y), transparent 30%, black 90%),
            radial-gradient(circle var(--fr) at var(--f3x) var(--f3y), transparent 30%, black 90%),
            radial-gradient(circle var(--fr) at var(--f4x) var(--f4y), transparent 30%, black 90%);
          -webkit-mask-composite: source-in, source-in, source-in;
          mask-image:
            radial-gradient(circle var(--fr) at var(--f1x) var(--f1y), transparent 30%, black 90%),
            radial-gradient(circle var(--fr) at var(--f2x) var(--f2y), transparent 30%, black 90%),
            radial-gradient(circle var(--fr) at var(--f3x) var(--f3y), transparent 30%, black 90%),
            radial-gradient(circle var(--fr) at var(--f4x) var(--f4y), transparent 30%, black 90%);
          mask-composite: intersect;
        }
        @keyframes intro-eve-pop {
          0% { opacity: 0; transform: scale(0); }
          60% { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes intro-skull-pulse {
          0%, 100% { box-shadow: 0 0 15px 5px rgba(255,0,0,0.3); }
          50% { box-shadow: 0 0 25px 10px rgba(255,0,0,0.6); }
        }
        .intro-skull-glow {
          animation: intro-skull-pulse 0.8s ease-in-out infinite;
        }
      `}</style>
      {/* Header */}
      <div className="h-[44px] shrink-0 w-full relative z-10" style={{ backgroundColor: introPhase === 'done' ? '#01394b' : introPhase === 'revealing' ? '#01394b' : '#0a0a0a', transition: introPhase === 'revealing' ? `background-color ${REVEAL_DURATION * 0.5}ms ease-out` : 'none' }}>
        <div aria-hidden="true" className="absolute border-[#678893] border-b border-solid inset-0 pointer-events-none" style={{ opacity: introPhase === 'done' ? 1 : introPhase === 'revealing' ? 1 : 0, transition: introPhase === 'revealing' ? `opacity ${REVEAL_DURATION * 0.5}ms ease-out` : 'none' }} />
        <div className="flex items-center justify-center size-full">
          <div
            className="flex items-center justify-between px-[12px] w-full max-w-[500px]"
            style={
              introPhase === 'done'
                ? { opacity: 1 }
                : introPhase === 'revealing'
                ? { animation: `intro-fade-up ${REVEAL_DURATION * 0.6}ms ease-out both` }
                : { opacity: 0 }
            }
          >
            <div className="w-[116px]"><Timer seconds={timer} /></div>
            <div className="shrink-0" style={{ width: 31.359, height: 28, filter: "drop-shadow(0px 1.16px 0px #678893)" }}>
              <img src={imgKnifePng} alt="Knife" className="block size-full object-contain" />
            </div>
            <div className="flex items-center justify-end">
              <button className="bg-[#fcfcfc] flex gap-[6px] h-[28px] items-center px-[8px] py-[6px] rounded-[99px] relative cursor-pointer" onClick={() => { setShowHowToPlay(true); trackHowToPlayOpened(timer <= 10 ? "early_game" : "during_game"); }}>
                <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[99px]" />
                <div className="overflow-clip relative shrink-0 size-[20px]">
                  <div className="absolute inset-[5%]">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                      <path d={svgPaths.p32e8da40} fill="black" />
                    </svg>
                  </div>
                </div>
                <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[13px] text-[#191919] whitespace-nowrap">How to play</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game content - fills remaining space */}
      <div className="flex-1 flex flex-col items-center min-h-0 overflow-hidden relative z-20">
        <div className="flex flex-col items-center w-full max-w-[500px] min-h-0 flex-1 pt-[8px] pb-[16px]">
          {/* Grid with labels */}
          <div className="flex items-start justify-center w-full shrink-0 p-[0px]">
            <div className="relative flex">
              {/* Row labels (A-E) */}
              <div 
                className="flex flex-col pr-[8px] relative"
                style={{
                  height: gridSize,
                  marginTop: `calc(${Math.max(12, 15 * gridScale)}px + 20px)`, // Match column label height + padding
                }}
              >
                {['1', '2', '3', '4', '5'].map((label) => (
                  <div 
                    key={label} 
                    className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#191919]"
                    style={{ 
                      fontSize: Math.max(12, 15 * gridScale),
                      height: cellSize,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: introPhase === 'done' ? 1 : introPhase === 'revealing' ? 1 : 0,
                      transition: introPhase === 'revealing' ? `opacity ${REVEAL_DURATION}ms ease-out` : 'none',
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
              
              {/* Grid and column labels container */}
              <div className="flex flex-col">
                {/* Column labels (1-5) */}
                <div 
                  className="flex justify-around items-center pb-[12px] relative"
                  style={{
                    width: gridSize,
                  }}
                >
                  {['1', '2', '3', '4', '5'].map((label) => (
                    <div 
                      key={label} 
                      className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#191919]"
                      style={{ 
                        fontSize: Math.max(12, 15 * gridScale),
                        width: cellSize,
                        textAlign: 'center',
                        opacity: introPhase === 'done' ? 1 : introPhase === 'revealing' ? 1 : 0,
                        transition: introPhase === 'revealing' ? `opacity ${REVEAL_DURATION}ms ease-out` : 'none',
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
                
                {/* Outer wrapper for shadow - sits outside overflow:hidden */}
                <div
                  className="relative"
                  style={{
                    width: gridSize,
                    height: gridSize,
                    borderRadius: gridBorderRadius,
                    boxShadow: introPhase === 'done' || introPhase === 'revealing'
                      ? `0px ${Math.max(2, 4 * gridScale)}px 0px 0px #191919`
                      : `0px ${Math.max(2, 4 * gridScale)}px 0px 0px #111`,
                    transition: introPhase === 'revealing' ? `box-shadow ${REVEAL_DURATION}ms ease-out` : 'none',
                  }}
                >
              {/* Room labels - always visible, even during intro */}
              <div>
                <div style={{ position: "absolute", left: `${cellSize * 1.5}px`, transform: "translateX(-50%) translateY(-50%)", top: 0, width: `${71.74 * gridScale}px`, height: `${23.867 * gridScale}px`, zIndex: 40 }}>
                  <img alt="Kitchen" src={imgKitchen2} className="size-full object-contain" />
                </div>
                <div style={{ position: "absolute", left: `${cellSize * 3.5}px`, transform: "translateX(-50%) translateY(-50%)", top: 0, width: `${48 * gridScale}px`, height: `${24 * gridScale}px`, zIndex: 40 }}>
                  <img alt="Hall" src={imgHall2} className="size-full object-contain" />
                </div>
                <div style={{ position: "absolute", left: `${cellSize * 1}px`, transform: "translateX(-50%) translateY(-50%)", top: `${cellSize * 1}px`, width: `${76 * gridScale}px`, height: `${24 * gridScale}px`, zIndex: 40 }}>
                  <img alt="Bedroom" src={imgBedroom21} className="size-full object-contain" />
                </div>
                <div style={{ position: "absolute", left: `${cellSize * 3.5}px`, transform: "translateX(-50%) translateY(-50%)", top: `${cellSize * 2}px`, width: `${56.336 * gridScale}px`, height: `${23.867 * gridScale}px`, zIndex: 40 }}>
                  <img alt="Study" src={imgStudy22} className="size-full object-contain" />
                </div>
                <div style={{ position: "absolute", left: `${cellSize * 1}px`, transform: "translateX(-50%) translateY(-50%)", top: `${cellSize * 3}px`, width: `${85 * gridScale}px`, height: `${24 * gridScale}px`, zIndex: 40 }}>
                  <img alt="Bathroom" src={imgBathroom21} className="size-full object-contain" />
                </div>
              </div>

              {/* Dark cover for room labels area during intro */}
              {(introPhase === 'waiting' || introPhase === 'scanning' || introPhase === 'found') && (
                <div className="absolute pointer-events-none" style={{
                  left: 0, right: 0, top: `${-14 * gridScale}px`, height: `${14 * gridScale}px`,
                  background: 'rgba(0,0,0,0.93)', zIndex: 50,
                }} />
              )}
              {introPhase === 'revealing' && (
                <div className="absolute pointer-events-none" style={{
                  left: 0, right: 0, top: `${-14 * gridScale}px`, height: `${14 * gridScale}px`,
                  background: 'rgba(0,0,0,0.93)', zIndex: 50,
                  animation: `intro-reveal-fade ${REVEAL_DURATION}ms ease-out forwards`,
                }} />
              )}

              {/* Inner grid with overflow hidden to clip corners */}
              <div ref={gridContainerRef} className="relative size-full" style={{ touchAction: "none" }}>
                {/* Grid cells */}
                {Array.from({ length: 5 }, (_, row) =>
                  Array.from({ length: 5 }, (_, col) => {
                    const room = ROOM_MAP[row][col];
                    const bgColor = ROOM_COLORS[room];
                    const content = grid[row][col];
                    const edges = getRoomBorderEdges(row, col);
                    const rounding = getCellRounding(row, col);
                    const cellKey = `${row},${col}`;
                    const hasRedOutline = placementErrors.redOutlineCells.has(cellKey);
                    const hasCrossHatch = allCrossHatchCells.has(cellKey);

                    return (
                      <div
                        key={`${row}-${col}`}
                        className="absolute flex items-center justify-center cursor-pointer overflow-visible"
                        style={{
                          left: col * cellSize,
                          top: row * cellSize,
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: bgColor,
                          borderRadius: rounding,
                          touchAction: "none",
                        }}
                        onPointerDown={(e) => {
                          const ct = grid[row][col];
                          if (ct && ct !== "X" && ct !== "Ben" && ct !== "skull" && (ALL_SUSPECTS.includes(ct as any) || ct === "Eve")) {
                            handlePointerDown(e, ct as any, [row, col]);
                          } else {
                            handleGridPointerDown(e, row, col);
                          }
                        }}
                      >
                        <div
                          className="absolute pointer-events-none"
                          style={{ inset: -0.5, border: "1px solid #666", borderRadius: rounding }}
                        />
                        {/* Red error outline for placement violations */}
                        {hasRedOutline && !gameWon && (
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              inset: -1,
                              border: `${Math.max(1.5, 2 * gridScale)}px solid #FF0000`,
                              borderRadius: rounding,
                              zIndex: 6,
                            }}
                          />
                        )}
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            inset: `${edges.top ? -borderW / 2 : 0}px ${edges.right ? -borderW / 2 : 0}px ${edges.bottom ? -borderW / 2 : 0}px ${edges.left ? -borderW / 2 : 0}px`,
                            borderTop: edges.top ? `${borderW}px solid #191919` : "none",
                            borderBottom: edges.bottom ? `${borderW}px solid #191919` : "none",
                            borderLeft: edges.left ? `${borderW}px solid #191919` : "none",
                            borderRight: edges.right ? `${borderW}px solid #191919` : "none",
                            borderRadius: rounding,
                            zIndex: 5,
                          }}
                        />
                        <div className="relative z-[1] flex items-center justify-center">
                          {content === "Ben" && (
                            <div style={
                              introPhase === 'done'
                                ? { opacity: 1, transform: 'scale(1)' }
                                : introPhase === 'revealing'
                                ? { animation: `intro-eve-pop ${REVEAL_DURATION * 0.4}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${REVEAL_DURATION * 0.3}ms both` }
                                : { opacity: 0, transform: 'scale(0)' }
                            }>
                              <SuspectTile name="Ben" inGrid gridScale={gridScale} shaking={shakingSuspect === "Ben"} />
                            </div>
                          )}
                          {content === "Eve" && (
                            <SuspectTile name="Eve" inGrid gridScale={gridScale} isMurderer={gameWon && content === MURDERER} shaking={shakingSuspect === "Eve"} />
                          )}
                          {content === "skull" && <SkullIcon scale={gridScale} />}
                          {content === "X" && <XMark scale={gridScale} />}
                          {content && !["Eve", "Ben", "skull", "X"].includes(content) && (
                            <SuspectTile
                              name={content}
                              inGrid
                              gridScale={gridScale}
                              isMurderer={gameWon && content === MURDERER}
                              shaking={shakingSuspect === content}
                            />
                          )}
                        </div>
                        {/* Jail bars animation on Eve's cell when game is won */}
                        {gameWon && content === MURDERER && <JailBars cellSize={cellSize} />}
                        {hasCrossHatch && !gameWon && <RedCrossHatch />}
                        {hintData && !gameWon && hintData.pendingCells.has(cellKey) && grid[row][col] === null && <StripeOverlay />}
                        {hintData && !gameWon && !hintData.cells.has(cellKey) && (
                          <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 4 }} />
                        )}
                        {validCellsForActive && !gameWon && !validCellsForActive.has(cellKey) && !hintData && (
                          <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 4 }} />
                        )}
                        {flashingRoom && ROOM_MAP[row][col] === flashingRoom && (
                          <div className="absolute inset-0 pointer-events-none puzzle-room-flash" style={{ backgroundColor: "rgba(255,255,255,0.5)", zIndex: 7, borderRadius: rounding }} />
                        )}
                      </div>
                    );
                  })
                )}
                {/* Intro dark overlay with flashlight cutouts */}
                {introPhase === 'waiting' && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ zIndex: 50, borderRadius: gridBorderRadius, backgroundColor: 'rgba(0,0,0,0.93)' }}
                  />
                )}
                {(introPhase === 'scanning' || introPhase === 'found') && (
                  <div
                    ref={introOverlayRef}
                    className="absolute inset-0 pointer-events-none intro-overlay-dark"
                    style={{ zIndex: 50, borderRadius: gridBorderRadius, '--f1x': '0px', '--f1y': '0px', '--f2x': '0px', '--f2y': '0px', '--f3x': '0px', '--f3y': '0px', '--f4x': '0px', '--f4y': '0px', '--fr': '50px' } as React.CSSProperties}
                  />
                )}

                {/* Intro overlay fade-out during revealing */}
                {introPhase === 'revealing' && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      zIndex: 50,
                      borderRadius: gridBorderRadius,
                      backgroundColor: 'rgba(0,0,0,0.92)',
                      animation: `intro-reveal-fade ${REVEAL_DURATION}ms ease-out forwards`,
                    }}
                  />
                )}

                {/* Red glow on skull cell when found */}
                {(introPhase === 'found') && (
                  <div
                    className="absolute pointer-events-none intro-skull-glow"
                    style={{
                      left: 0,
                      top: cellSize,
                      width: cellSize,
                      height: cellSize,
                      zIndex: 49,
                      borderRadius: 0,
                    }}
                  />
                )}

              </div>

              {/* Exclamation mark rendered via portal below */}
                </div>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="h-[16px] shrink-0" />

          {/* Buttons */}
          <div
            className="w-full px-[16px] shrink-0"
            style={
              introPhase === 'done'
                ? { opacity: 1, transform: 'translateY(0)' }
                : introPhase === 'revealing'
                ? { animation: `intro-fade-up ${REVEAL_DURATION * 0.6}ms ease-out ${REVEAL_DURATION * 0.1}ms both` }
                : { opacity: 0, transform: 'translateY(20px)' }
            }
          >
            <div className="flex w-full" style={{ gap: btnGap }}>
              {returnedFromEnd ? (
                <button
                  className="flex-1 rounded-[50px] relative bg-[#01394b] flex items-center justify-center cursor-pointer"
                  style={{ height: btnHeight, gap: btnGap }}
                  onClick={() => setShowEndGame(true)}
                >
                  <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[50px] shadow-[0px_2px_0px_0px_#678893]" />
                  <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#fcfcfc]" style={{ fontSize: btnFontSize }}>Back to results</span>
                </button>
              ) : (
                <>
                  <button
                    className="flex-1 rounded-[50px] relative bg-[#01394b] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                    style={{ opacity: actionHistory.length === 0 || gameWon || hintData ? 0.3 : 1, height: btnHeight, gap: btnGap }}
                    onClick={handleUndo}
                    disabled={actionHistory.length === 0 || gameWon || !!hintData}
                  >
                    <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[50px] shadow-[0px_2px_0px_0px_#678893]" />
                    <div className="overflow-clip relative shrink-0" style={{ width: btnIconSize, height: btnIconSize }}>
                      <div className="absolute inset-[1.97%_8.14%_1.98%_8.12%]">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.7471 19.209">
                          <path d={svgPaths.p1fb2dbf0} fill="#FCFCFC" />
                        </svg>
                      </div>
                    </div>
                    <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#fcfcfc]" style={{ fontSize: btnFontSize }}>Undo</span>
                  </button>
                  <button
                    className="flex-1 rounded-[50px] relative bg-[#01394b] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                    style={{ opacity: gameWon || hintData ? 0.3 : 1, height: btnHeight, gap: btnGap }}
                    onClick={handleHint}
                    disabled={gameWon || !!hintData}
                  >
                    <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[50px] shadow-[0px_2px_0px_0px_#678893]" />
                    <div className="overflow-clip relative shrink-0" style={{ width: btnIconSize, height: btnIconSize }}>
                      <div className="absolute inset-[7.52%_6.25%_9.38%_6.25%]">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5 16.6206">
                          <path d={svgPaths.p17129b00} fill="#FCFCFC" stroke="#FCFCFC" strokeWidth="0.625" />
                        </svg>
                      </div>
                    </div>
                    <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#fcfcfc]" style={{ fontSize: btnFontSize }}>Hint</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="h-[16px] shrink-0" />

          {/* Suspect Tray - all 4 slots always rendered, placed ones collapse smoothly */}
          <div
            ref={trayRef}
            className="w-full shrink-0 relative"
            style={{
              paddingTop: `${32 * gridScale}px`,
              touchAction: "none",
              ...(introPhase === 'done'
                ? { opacity: 1, transform: 'translateY(0)' }
                : introPhase === 'revealing'
                ? { animation: `intro-fade-up ${REVEAL_DURATION * 0.6}ms ease-out ${REVEAL_DURATION * 0.2}ms both` }
                : { opacity: 0, transform: 'translateY(20px)' }),
            }}
          >
            <div
              className="flex justify-center items-end z-10 relative"
              style={{ marginTop: `${-24 * gridScale}px` }}
            >
              {ALL_SUSPECTS.map((name) => {
                const isPlaced = placedSuspects.has(name);
                const isDragging = dragState?.name === name;
                return (
                  <div
                    key={name}
                    style={{
                      width: isPlaced || isDragging ? 0 : tileSize,
                      height: tileSize,
                      opacity: isPlaced || isDragging ? 0 : 1,
                      marginLeft: isPlaced || isDragging ? 0 : trayGap / 2,
                      marginRight: isPlaced || isDragging ? 0 : trayGap / 2,
                      transform: isPlaced || isDragging ? "scale(0.5)" : "scale(1)",
                      transition: isDragging ? "none" : "width 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, margin 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease",
                      overflow: isPlaced || isDragging ? "hidden" : "visible",
                      flexShrink: 0,
                      touchAction: "none",
                    }}
                    onPointerDown={(e) => {
                      if (!isPlaced) handlePointerDown(e, name, null);
                    }}
                  >
                    <div style={{ width: tileSize, height: tileSize }}>
                      <SuspectTile
                        name={name}
                        selected={selectedSuspect === name}
                        gridScale={gridScale}
                        inGrid
                        shaking={shakingSuspect === name}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-[#e6ebed] w-full" style={{ height: `${48 * gridScale}px`, marginTop: `${-40 * gridScale}px` }} />
          </div>

          {/* Rules area - flex-1 to fill, min-h ensures 3 rules visible */}
          <div
            className="w-full max-w-[500px] flex-1 flex overflow-hidden"
            style={{
              gap: `${16 * gridScale}px`,
              paddingLeft: `${16 * gridScale}px`,
              paddingRight: `${8 * gridScale}px`,
              paddingTop: rulesPadTop,
              minHeight: rulesMinH,
              ...(introPhase === 'done'
                ? { opacity: 1, transform: 'translateY(0)' }
                : introPhase === 'revealing'
                ? { animation: `intro-fade-up ${REVEAL_DURATION * 0.6}ms ease-out ${REVEAL_DURATION * 0.3}ms both` }
                : { opacity: 0, transform: 'translateY(20px)' }),
            }}
          >
            <div
              ref={clueAreaRef}
              className="flex-1 flex flex-col min-h-0 overflow-y-auto clue-scroll"
              style={{
                scrollbarWidth: "none",
                gap: ruleGap,
              }}
            >
              {hintData && !gameWon ? (
                <HintBanner text={hintData.text} scale={gridScale} />
              ) : placementErrors.hasError && !gameWon ? (
                <ErrorBanner scale={gridScale} />
              ) : null}
              {sortedRuleOrder.map((i) => {
                const isError = ruleErrors[i] && !gameWon;
                const isFulfilled = rules[i] && !gameWon;
                return (
                <div
                  key={i}
                  ref={(el) => { ruleRefs.current[i] = el; }}
                  className="flex items-center shrink-0 w-full"
                  style={{
                    opacity: isFulfilled ? 0.4 : gameWon ? 0.4 : 1,
                    gap: `${8 * gridScale}px`,
                    transition: "opacity 0.35s ease",
                  }}
                >
                  {/* Checkbox: error (red !), fulfilled (green tick), or empty */}
                  {isError ? (
                    <div className="shrink-0 flex items-center overflow-clip" style={{ backgroundColor: "red", borderRadius: `${4 * gridScale}px`, padding: `${3 * gridScale}px` }}>
                      <div className="overflow-clip shrink-0 relative" style={{ width: `${12 * gridScale}px`, height: `${12 * gridScale}px` }}>
                        <div className="absolute" style={{ inset: `0 ${37.5}%` }}>
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 12">
                            <path d={EXCLAMATION_PATH} fill="white" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                  <div className="relative shrink-0" style={{ backgroundColor: isFulfilled || gameWon ? "#666" : "#fcfcfc", borderRadius: `${4 * gridScale}px`, transition: "background-color 0.3s ease" }}>
                    <div className="flex items-center overflow-clip" style={{ padding: `${3 * gridScale}px`, borderRadius: "inherit" }}>
                      <div className="overflow-clip shrink-0 relative" style={{ width: `${13 * gridScale}px`, height: `${13 * gridScale}px` }}>
                        {(isFulfilled || gameWon) && (
                          <div className="absolute inset-[9.38%_0]">
                            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 10.5625">
                              <path d={svgPathsEnd.p2bd41600} fill="white" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-0 pointer-events-none" style={{ borderRadius: `${4 * gridScale}px` }} />
                  </div>
                  )}
                  <div className="flex-1 min-w-0" style={{ fontSize: `${Math.max(10, 13 * gridScale)}px`, fontWeight: isError ? "bold" : undefined }}>{ruleItems[i]}</div>
                </div>
                );
              })}
            </div>
            {needsScroll && (
              <div className="bg-[#e6ebed] shrink-0 self-stretch relative" style={{ width: `${6 * gridScale}px`, borderRadius: 99 }}>
                <div
                  className="bg-[#678893] absolute"
                  style={{
                    width: `${6 * gridScale}px`,
                    height: `${scrollThumbHeight}%`,
                    borderRadius: 99,
                    top: `${scrollThumbTop}%`,
                    transition: "top 0.1s ease-out",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating drag element */}
      {dragState && (
        <div
          ref={(el) => {
            floatingRef.current = el;
            if (el) {
              const { x, y } = dragPosRef.current;
              el.style.transform = `translate(${x - tileSize / 2}px, ${y - tileSize / 2}px)`;
            }
          }}
          className="fixed top-0 left-0 pointer-events-none"
          style={{ zIndex: 9999, width: tileSize, height: tileSize, opacity: 0.9 }}
        >
          <SuspectTile name={dragState.name} inGrid gridScale={gridScale} />
        </div>
      )}

      {/* Exclamation mark near skull during found/revealing phase - rendered outside overflow:hidden containers */}
      {showExclamation && introPhase !== 'done' && gridContainerRef.current && (() => {
        const rect = gridContainerRef.current!.getBoundingClientRect();
        return (
          <div
            className="fixed pointer-events-none intro-exclamation"
            style={{
              left: rect.left + cellSize * 2 + cellSize * 0.15,
              top: rect.top + cellSize * 2 - cellSize * 0.35,
              zIndex: 10002,
              width: cellSize * 0.5,
              height: cellSize * 0.5,
            }}
          >
            <svg viewBox="0 0 40 40" className="size-full drop-shadow-[0_2px_8px_rgba(255,0,0,0.7)]">
              <circle cx="20" cy="20" r="18" fill="#FF0000" stroke="#fff" strokeWidth="2" />
              <text x="20" y="28" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="bold" fontFamily="Arial, sans-serif">!</text>
            </svg>
          </div>
        );
      })()}

      {/* End game screen */}
      {showEndGame && (
        <EndGameScreen seconds={timer} onBack={() => { setShowEndGame(false); setReturnedFromEnd(true); }} />
      )}

      {/* How to play modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {/* Tutorial screen */}
      {showTutorial && (
        <TutorialScreen onPlay={handleTutorialDone} startTime={tutorialStartTimeRef.current} />
      )}

      {/* Start screen */}
      {showStartScreen && (
        <StartScreen onStart={handleStartGame} onGenerator={handleStartGenerator} />
      )}
    </div>
  );
}