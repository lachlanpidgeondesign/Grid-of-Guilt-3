import svgPaths from "../../imports/svg-r62c0oyv3y";
import svgPathsRules from "../../imports/svg-v4vc9c4n3n";
import svgPathsStripes from "../../imports/svg-ahmqpv5a1q";
import imgImage24 from "figma:asset/6bdc180aa5e05c3ba389fbac3599c491940173f2.png";
import imgImage29 from "figma:asset/d34acba5abc649030f58a8d31ec6f9d063e4909d.png";
import imgStudyTutorial from "figma:asset/12ecde2fbad882f6964d798f8bd15f0a39040844.png";
import imgLivingRoomTutorial from "figma:asset/5b1c84b9227e505224c24f36c9637f4bf2c40a23.png";
import imgHallTutorial from "figma:asset/133a0546f85dcedc191833d094e034ec119aeda6.png";
import imgKitchenTutorial from "figma:asset/292ce3ca603b4f4b13cee1c9f620cc2575454434.png";
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { trackTutorialStepReached, trackTutorialCompleted, trackTutorialPlayClicked, trackTutorialSkippedIntro, trackTutorialSkippedDuring } from "./analytics";
import svgPathsEnd from "../../imports/svg-8afbcemiql";
import TutorialIntro from "../../imports/Tutorial-2007-552";

const DESIGN_W = 390;
const DESIGN_H = 620;

/* ---- Suspect data for placement steps ---- */
const SUSPECT_DATA: Record<string, { name: string; color: string; crop: { left: string; top: string }; hairPath?: string; hairVB?: string; hairW?: number; hairH?: number; hairTop?: number; hairLeft?: number }> = {
  tom: { name: "Tom", color: "#a25603", crop: { left: "-503.07%", top: "-16.61%" } },
  ella: { name: "Ella", color: "#e3202d", crop: { left: "-109.85%", top: "-19.07%" } },
  kate: { name: "Kate", color: "#055b0f", crop: { left: "-504.82%", top: "-118.06%" },
    hairPath: "M2.44922 2.35523L9.54007 0.163819C9.96976 1.96851 10.957 4.41773 11.9883 4.41773C13.0195 4.41773 14.0518 1.96851 14.5674 0.163819L22.043 2.35523C22.9023 2.78491 24.6211 4.00523 24.6211 5.44898L23.5898 6.22241H1.41797L0.128906 5.44898C0.128906 4.00523 1.67578 2.78491 2.44922 2.35523Z",
    hairVB: "0 0 24.75 6.35132", hairW: 24.492, hairH: 6.059, hairTop: 18.95, hairLeft: 0.26 },
  adam: { name: "Adam", color: "#4d243d", crop: { left: "-306.31%", top: "-124.94%" } },
};
const TRAY_HAIR = "M3.16667 3.04514L12.3346 0.211807C12.8902 2.54514 14.1667 5.71181 15.5 5.71181C16.8333 5.71181 18.168 2.54514 18.8346 0.211807L28.5 3.04514C29.6111 3.6007 31.8333 5.17847 31.8333 7.04514L30.5 8.04514H1.83333L0.166667 7.04514C0.166667 5.17847 2.16667 3.6007 3.16667 3.04514Z";
const CORRECT_PLACEMENTS: Record<string, string> = { "kitchen-1-0": "ella", "hall-2-3": "tom", "living-3-1": "kate" };
const PLACEMENT_CELLS = [
  { id: "kitchen-1-0", left: 0, top: 57.5 },
  { id: "hall-2-3", left: 172.5, top: 115 },
  { id: "living-3-1", left: 57.5, top: 172.5 },
];

// Tutorial room cells for flash overlay (4x4 grid, row/col)
const TUT_HALL_CELLS: [number, number][] = [
  [0, 1], [0, 3],
  [1, 1], [1, 2], [1, 3],
  [2, 1], [2, 2], [2, 3],
];
const TUT_KITCHEN_CELLS: [number, number][] = [[0, 0], [1, 0], [2, 0]];
const TUT_LIVING_CELLS: [number, number][] = [[3, 0], [3, 1], [3, 2], [3, 3]];
const TUT_STUDY_CELLS: [number, number][] = [[0, 2]];
const TUT_ROOM_CELLS: Record<string, [number, number][]> = {
  hall: TUT_HALL_CELLS, kitchen: TUT_KITCHEN_CELLS, living: TUT_LIVING_CELLS, study: TUT_STUDY_CELLS,
};

// Map grid (row,col) → placement cell ID
const TUT_CELL_MAP: Record<string, string> = {
  "1,0": "kitchen-1-0",
  "2,3": "hall-2-3",
  "3,1": "living-3-1",
};

interface TutorialScreenProps {
  onPlay: () => void;
  startTime?: number;
}

function TutorialGrid() {
  return (
    <div className="relative shrink-0" style={{ width: 230, height: 230, boxShadow: "0px 2.409px 0px 0px #191919", borderRadius: 6.425 }}>
      {/* Base grid cells */}
      <div className="absolute left-0 overflow-clip rounded-[6.425px]" style={{ width: 230, height: 230 }}>
        {/* Hall cells (light teal) */}
        <div className="absolute bg-[#d7f0f3]" style={{ left: 115, top: 115, width: 57.5, height: 57.5 }}>
          <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        <div className="absolute bg-[#d7f0f3]" style={{ left: 172.5, top: 115, width: 57.5, height: 57.5 }}>
          <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        <div className="absolute bg-[#d7f0f3]" style={{ left: 115, top: 57.5, width: 57.5, height: 57.5 }}>
          <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>

        {/* Kitchen room (pink) - Area 1 */}
        <div className="absolute" style={{ left: 0, top: 0, width: 57.5, height: 172.5 }}>
          <div className="overflow-clip relative size-full">
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
              <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 57.5, width: 57.5, height: 57.5 }}>
              <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 115, width: 57.5, height: 57.5 }}>
              <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
          </div>
          <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -1.198, border: "2.396px solid black" }} />
        </div>

        {/* Study room (blue/purple) - Area 4 with Adam tile */}
        <div className="absolute" style={{ left: 115, top: 0, width: 58, height: 57 }}>
          {/* Cell behind (hall) */}
          <div className="absolute bg-[#d7f0f3]" style={{ left: -57.5, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          {/* Study cell with Adam */}
          <div className="absolute bg-[#dde0ff]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full">
              {/* Adam tile */}
              <div className="bg-[#f5f5f5] flex flex-col items-center justify-center relative rounded-[6.188px]" style={{ width: 49.5, height: 49.5, gap: 3.094 }}>
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[6.188px]" style={{ border: "0.773px solid #678893", boxShadow: "0px 0.773px 0px 0px #678893" }} />
                <div className="bg-[#f5f5f5] relative rounded-[6.188px]" style={{ width: 24.75, height: 24.75 }}>
                  <div className="absolute rounded-[4.125px]" style={{ width: 24.75, height: 24.75, left: 0, top: 0 }}>
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4.125px]">
                      <img alt="" className="absolute max-w-none" style={{ height: "378.38%", left: "-306.31%", top: "-124.94%", width: "614.86%" }} src={imgImage24} />
                    </div>
                  </div>
                </div>
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#4d243d] text-center" style={{ fontSize: 12.375, lineHeight: "16.242px" }}>Adam</p>
              </div>
            </div>
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          {/* Hall cells below study */}
          <div className="absolute bg-[#d7f0f3]" style={{ left: 57.5, top: 57.5, width: 58.299, height: 57.5 }}>
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 57.5, top: 0, width: 58.299, height: 57.5 }}>
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
        </div>

        {/* Hall/area 2 with thick border */}
        <div className="absolute pointer-events-none rounded-tr-[8px]" style={{ left: 57.5, top: 0, width: 172.5, height: 172.5 }}>
          {/* Empty hall cell */}
          <div className="absolute bg-[#d7f0f3]" style={{ left: 0, top: 57.5, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 0.5, top: 115, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          {/* Hall border SVG */}
          <div className="absolute" style={{ left: 0, top: 0, width: 172.5, height: 172.5 }}>
            <div className="absolute" style={{ inset: "-0.69%" }}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 174.896 174.896">
                <path d={svgPaths.pad94680} stroke="black" strokeWidth="2.39583" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Outer border */}
      <div className="absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[6.425px]" style={{ width: 230, height: 230 }}>
        <div aria-hidden="true" className="absolute pointer-events-none rounded-[7.629px]" style={{ inset: -1.204, border: "2.409px solid #191919" }} />
      </div>

      {/* Living room (green) - bottom row */}
      <div className="absolute pointer-events-none" style={{ left: 0, top: 172.5, width: 230, height: 57.5, borderRadius: "0 0 6.389px 6.389px" }}>
        <div className="overflow-clip relative size-full" style={{ borderRadius: "inherit" }}>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 57.5, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 115, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 172.5, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full">
              <div className="relative shrink-0" style={{ width: 40, height: 40 }}>
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage29} />
              </div>
            </div>
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
        </div>
        <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -1.198, border: "2.396px solid black", borderRadius: "0 0 7.587px 7.587px" }} />
      </div>

      {/* Room labels */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% + 29.18px)", top: "calc(50% - 115px)", width: 38.353, height: 16 }}>
        <img alt="Study" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgStudyTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% - 0.18px)", top: "calc(50% + 58px)", width: 65.647, height: 16 }}>
        <img alt="Living Room" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgLivingRoomTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% + 28.47px)", top: "calc(50% - 58px)", width: 32.941, height: 16 }}>
        <img alt="Hall" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHallTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% - 85.76px)", top: "calc(50% - 115px)", width: 48.471, height: 16 }}>
        <img alt="Kitchen" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgKitchenTutorial} />
      </div>
    </div>
  );
}

/* ---- Stripe overlay for interactive cells ---- */

function StripeSvg() {
  return (
    <div className="absolute pointer-events-none" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
      <div className="absolute" style={{ inset: "-5.89%" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64.2764 64.2764">
          <path d={svgPathsStripes.p26fa9e80} stroke="#191919" strokeLinecap="square" strokeWidth="4.79167" />
          <path d={svgPathsStripes.p3d6d5360} stroke="#191919" strokeLinecap="square" strokeWidth="4.79167" />
          <path d={svgPathsStripes.p19400500} stroke="#191919" strokeWidth="4.79167" />
        </svg>
      </div>
    </div>
  );
}

function XMark() {
  return (
    <div className="relative shrink-0" style={{ width: 32, height: 32 }}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <path d="M10 10L22 22" stroke="#666" strokeLinecap="round" strokeWidth="1.5" />
        <path d="M10 22L22 10" stroke="#666" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/* Inline icons for the "Tap on" instruction */
function InlineStripeSvg() {
  return (
    <div className="relative shrink-0" style={{ width: 32, height: 32 }}>
      <div className="overflow-clip relative size-full">
        <div className="absolute" style={{ left: 0, top: 0, width: 32, height: 32 }}>
          <div className="absolute" style={{ inset: "-5.89%" }}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 35.7712 35.7712">
              <path d={svgPathsStripes.p3124bd00} stroke="#191919" strokeLinecap="square" strokeWidth="2.66667" />
              <path d={svgPathsStripes.p39b49e00} stroke="#191919" strokeLinecap="square" strokeWidth="2.66667" />
              <path d={svgPathsStripes.p15052f40} stroke="#191919" strokeWidth="2.66667" />
            </svg>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: -0.5, border: "1px solid #ccc" }} />
    </div>
  );
}

function InlineXIcon() {
  return (
    <div className="relative shrink-0" style={{ width: 32, height: 32 }}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <rect height="31" stroke="#ccc" width="31" x="0.5" y="0.5" />
        <path d="M10 10L22 22" stroke="#666" strokeLinecap="round" strokeWidth="1.5" />
        <path d="M10 22L22 10" stroke="#666" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/* ---- Interactive Row Rule Grid (Step 3) ---- */

function RowRuleGrid({ xCells, onCellClick }: { xCells: Set<string>; onCellClick: (id: string) => void }) {
  // Clickable cells in row 0 (besides Adam at col 2): kitchen(0,0), hall(0,1), hall(0,3)
  const interactiveCells: { id: string; left: number }[] = [
    { id: "kitchen-0-0", left: 0 },
    { id: "hall-0-1", left: 57.5 },
    { id: "hall-0-3", left: 172.5 },
  ];

  return (
    <div className="relative shrink-0" style={{ width: 230, height: 230, boxShadow: "0px 2.409px 0px 0px #191919", borderRadius: 6.425 }}>
      {/* Base grid cells - entirely decorative */}
      <div className="absolute left-0 overflow-clip rounded-[6.425px] pointer-events-none" style={{ width: 230, height: 230 }}>
        {/* Hall cells (light teal) - rows 2-3 */}
        <div className="absolute bg-[#d7f0f3]" style={{ left: 115, top: 115, width: 57.5, height: 57.5 }}>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        <div className="absolute bg-[#d7f0f3]" style={{ left: 172.5, top: 115, width: 57.5, height: 57.5 }}>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        <div className="absolute bg-[#d7f0f3]" style={{ left: 115, top: 57.5, width: 57.5, height: 57.5 }}>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>

        {/* Kitchen room (pink) - Area 1 */}
        <div className="absolute" style={{ left: 0, top: 0, width: 57.5, height: 172.5 }}>
          <div className="overflow-clip relative size-full">
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 57.5, width: 57.5, height: 57.5 }}>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 115, width: 57.5, height: 57.5 }}>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
          </div>
          <div aria-hidden="true" className="absolute" style={{ inset: -1.198, border: "2.396px solid black" }} />
        </div>

        {/* Study room (blue/purple) - Area 4 with Adam tile */}
        <div className="absolute" style={{ left: 115, top: 0, width: 58, height: 57 }}>
          {/* Hall cell left of study (row 0, col 1) */}
          <div className="absolute bg-[#d7f0f3]" style={{ left: -57.5, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          {/* Study cell with Adam */}
          <div className="absolute bg-[#dde0ff]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full">
              <div className="bg-[#f5f5f5] flex flex-col items-center justify-center relative rounded-[6.188px]" style={{ width: 49.5, height: 49.5, gap: 3.094 }}>
                <div aria-hidden="true" className="absolute inset-0 rounded-[6.188px]" style={{ border: "0.773px solid #678893", boxShadow: "0px 0.773px 0px 0px #678893" }} />
                <div className="bg-[#f5f5f5] relative rounded-[6.188px]" style={{ width: 24.75, height: 24.75 }}>
                  <div className="absolute rounded-[4.125px]" style={{ width: 24.75, height: 24.75, left: 0, top: 0 }}>
                    <div className="absolute inset-0 overflow-hidden rounded-[4.125px]">
                      <img alt="" className="absolute max-w-none" style={{ height: "378.38%", left: "-306.31%", top: "-124.94%", width: "614.86%" }} src={imgImage24} />
                    </div>
                  </div>
                </div>
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#4d243d] text-center" style={{ fontSize: 12.375, lineHeight: "16.242px" }}>Adam</p>
              </div>
            </div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          {/* Hall cells row 1 */}
          <div className="absolute bg-[#d7f0f3]" style={{ left: 57.5, top: 57.5, width: 58.299, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          {/* Hall cell right of Adam (row 0, col 3) */}
          <div className="absolute bg-[#d7f0f3]" style={{ left: 57.5, top: 0, width: 58.299, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
        </div>

        {/* Hall/area 2 with thick border */}
        <div className="absolute rounded-tr-[8px]" style={{ left: 57.5, top: 0, width: 172.5, height: 172.5 }}>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 0, top: 57.5, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 0.5, top: 115, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute" style={{ left: 0, top: 0, width: 172.5, height: 172.5 }}>
            <div className="absolute" style={{ inset: "-0.69%" }}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 174.896 174.896">
                <path d={svgPaths.pad94680} stroke="black" strokeWidth="2.39583" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Outer border */}
      <div className="absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[6.425px]" style={{ width: 230, height: 230 }}>
        <div aria-hidden="true" className="absolute rounded-[7.629px]" style={{ inset: -1.204, border: "2.409px solid #191919" }} />
      </div>

      {/* Living room (green) - bottom row */}
      <div className="absolute pointer-events-none" style={{ left: 0, top: 172.5, width: 230, height: 57.5, borderRadius: "0 0 6.389px 6.389px" }}>
        <div className="overflow-clip relative size-full" style={{ borderRadius: "inherit" }}>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 57.5, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 115, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 172.5, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full">
              <div className="relative shrink-0" style={{ width: 40, height: 40 }}>
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgImage29} />
              </div>
            </div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
        </div>
        <div aria-hidden="true" className="absolute" style={{ inset: -1.198, border: "2.396px solid black", borderRadius: "0 0 7.587px 7.587px" }} />
      </div>

      {/* Dark overlay on rows 1-3 */}
      <div className="absolute pointer-events-none" style={{ left: 1, top: 57, width: 229, height: 173, backgroundColor: "rgba(25,25,25,0.8)" }} />

      {/* Room labels - z-60 to sit above stripes (z-50) */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% + 29.18px)", top: "calc(50% - 115px)", width: 38.353, height: 16, zIndex: 60 }}>
        <img alt="Study" className="absolute inset-0 max-w-none object-cover size-full" src={imgStudyTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% - 0.18px)", top: "calc(50% + 58px)", width: 65.647, height: 16, zIndex: 60 }}>
        <img alt="Living Room" className="absolute inset-0 max-w-none object-cover size-full" src={imgLivingRoomTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% + 28.47px)", top: "calc(50% - 58px)", width: 32.941, height: 16, zIndex: 60 }}>
        <img alt="Hall" className="absolute inset-0 max-w-none object-cover size-full" src={imgHallTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% - 85.76px)", top: "calc(50% - 115px)", width: 48.471, height: 16, zIndex: 60 }}>
        <img alt="Kitchen" className="absolute inset-0 max-w-none object-cover size-full" src={imgKitchenTutorial} />
      </div>

      {/* ===== Clickable overlay layer - on top of everything ===== */}
      {interactiveCells.map(({ id, left }) => (
        <div
          key={id}
          className="absolute overflow-clip cursor-pointer"
          style={{ left, top: 0, width: 57.5, height: 57.5, zIndex: 50 }}
          onClick={() => !xCells.has(id) && onCellClick(id)}
        >
          {xCells.has(id) ? (
            <div className="flex items-center justify-center size-full">
              <XMark />
            </div>
          ) : (
            <StripeSvg />
          )}
        </div>
      ))}
    </div>
  );
}

/* ---- Interactive Column Rule Grid (Step 4) ---- */

function ColumnRuleGrid({ colXCells, onCellClick }: { colXCells: Set<string>; onCellClick: (id: string) => void }) {
  const interactiveCells: { id: string; left: number; top: number }[] = [
    { id: "col-hall-1-2", left: 115, top: 57.5 },
    { id: "col-hall-2-2", left: 115, top: 115 },
    { id: "col-living-3-2", left: 115, top: 172.5 },
  ];

  return (
    <div className="relative shrink-0" style={{ width: 230, height: 230, boxShadow: "0px 2.409px 0px 0px #191919", borderRadius: 6.425 }}>
      {/* Base grid cells - entirely decorative */}
      <div className="absolute left-0 overflow-clip rounded-[6.425px] pointer-events-none" style={{ width: 230, height: 230 }}>
        {/* Hall cells (light teal) - rows 2-3 */}
        <div className="absolute bg-[#d7f0f3]" style={{ left: 115, top: 115, width: 57.5, height: 57.5 }}>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        <div className="absolute bg-[#d7f0f3]" style={{ left: 172.5, top: 115, width: 57.5, height: 57.5 }}>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        <div className="absolute bg-[#d7f0f3]" style={{ left: 115, top: 57.5, width: 57.5, height: 57.5 }}>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>

        {/* Kitchen room (pink) - Area 1 */}
        <div className="absolute" style={{ left: 0, top: 0, width: 57.5, height: 172.5 }}>
          <div className="overflow-clip relative size-full">
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
              <div className="flex items-center justify-center size-full"><XMark /></div>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 57.5, width: 57.5, height: 57.5 }}>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 115, width: 57.5, height: 57.5 }}>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
          </div>
          <div aria-hidden="true" className="absolute" style={{ inset: -1.198, border: "2.396px solid black" }} />
        </div>

        {/* Study room (blue/purple) - Area 4 with Adam tile */}
        <div className="absolute" style={{ left: 115, top: 0, width: 58, height: 57 }}>
          <div className="absolute bg-[#d7f0f3]" style={{ left: -57.5, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#dde0ff]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full">
              <div className="bg-[#f5f5f5] flex flex-col items-center justify-center relative rounded-[6.188px]" style={{ width: 49.5, height: 49.5, gap: 3.094 }}>
                <div aria-hidden="true" className="absolute inset-0 rounded-[6.188px]" style={{ border: "0.773px solid #678893", boxShadow: "0px 0.773px 0px 0px #678893" }} />
                <div className="bg-[#f5f5f5] relative rounded-[6.188px]" style={{ width: 24.75, height: 24.75 }}>
                  <div className="absolute rounded-[4.125px]" style={{ width: 24.75, height: 24.75, left: 0, top: 0 }}>
                    <div className="absolute inset-0 overflow-hidden rounded-[4.125px]">
                      <img alt="" className="absolute max-w-none" style={{ height: "378.38%", left: "-306.31%", top: "-124.94%", width: "614.86%" }} src={imgImage24} />
                    </div>
                  </div>
                </div>
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#4d243d] text-center" style={{ fontSize: 12.375, lineHeight: "16.242px" }}>Adam</p>
              </div>
            </div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 57.5, top: 57.5, width: 58.299, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 57.5, top: 0, width: 58.299, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
        </div>

        {/* Hall/area 2 with thick border */}
        <div className="absolute rounded-tr-[8px]" style={{ left: 57.5, top: 0, width: 172.5, height: 172.5 }}>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 0, top: 57.5, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 0.5, top: 115, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute" style={{ left: 0, top: 0, width: 172.5, height: 172.5 }}>
            <div className="absolute" style={{ inset: "-0.69%" }}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 174.896 174.896">
                <path d={svgPaths.pad94680} stroke="black" strokeWidth="2.39583" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Outer border */}
      <div className="absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[6.425px]" style={{ width: 230, height: 230 }}>
        <div aria-hidden="true" className="absolute rounded-[7.629px]" style={{ inset: -1.204, border: "2.409px solid #191919" }} />
      </div>

      {/* Living room (green) - bottom row */}
      <div className="absolute pointer-events-none" style={{ left: 0, top: 172.5, width: 230, height: 57.5, borderRadius: "0 0 6.389px 6.389px" }}>
        <div className="overflow-clip relative size-full" style={{ borderRadius: "inherit" }}>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 57.5, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 115, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 172.5, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full">
              <div className="relative shrink-0" style={{ width: 40, height: 40 }}>
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgImage29} />
              </div>
            </div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
        </div>
        <div aria-hidden="true" className="absolute" style={{ inset: -1.198, border: "2.396px solid black", borderRadius: "0 0 7.587px 7.587px" }} />
      </div>

      {/* Dark overlay on columns 0-1 (rows 1-3) */}
      <div className="absolute pointer-events-none" style={{ left: 1, top: 57, width: 114, height: 172, backgroundColor: "rgba(25,25,25,0.8)" }} />
      {/* Dark overlay on column 3 (rows 1-3) */}
      <div className="absolute pointer-events-none" style={{ left: 173, top: 57, width: 57, height: 172, backgroundColor: "rgba(25,25,25,0.8)" }} />

      {/* Room labels - z-60 to sit above stripes (z-50) */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% + 29.29px)", top: "calc(50% - 116.6px)", width: 38.353, height: 16, zIndex: 60 }}>
        <img alt="Study" className="absolute inset-0 max-w-none object-cover size-full" src={imgStudyTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% - 0.4px)", top: "calc(50% + 57.5px)", width: 65.647, height: 16, zIndex: 60 }}>
        <img alt="Living Room" className="absolute inset-0 max-w-none object-cover size-full" src={imgLivingRoomTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% + 28.79px)", top: "calc(50% - 58.01px)", width: 32.941, height: 16, zIndex: 60 }}>
        <img alt="Hall" className="absolute inset-0 max-w-none object-cover size-full" src={imgHallTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% - 85.64px)", top: "calc(50% - 115.6px)", width: 48.471, height: 16, zIndex: 60 }}>
        <img alt="Kitchen" className="absolute inset-0 max-w-none object-cover size-full" src={imgKitchenTutorial} />
      </div>

      {/* ===== Clickable overlay layer - on top of everything ===== */}
      {interactiveCells.map(({ id, left, top }) => (
        <div
          key={id}
          className="absolute overflow-clip cursor-pointer"
          style={{ left, top, width: 57.5, height: 57.5, zIndex: 50 }}
          onClick={() => !colXCells.has(id) && onCellClick(id)}
        >
          {colXCells.has(id) ? (
            <div className="flex items-center justify-center size-full">
              <XMark />
            </div>
          ) : (
            <StripeSvg />
          )}
        </div>
      ))}
    </div>
  );
}

/* ---- Interactive Touch Rule Grid (Step 5) ---- */

function TouchRuleGrid({ touchXCells, onCellClick }: { touchXCells: Set<string>; onCellClick: (id: string) => void }) {
  const interactiveCells: { id: string; left: number; top: number }[] = [
    { id: "touch-hall-1-1", left: 57.5, top: 57.5 },
    { id: "touch-hall-1-3", left: 172.5, top: 57.5 },
  ];

  return (
    <div className="relative shrink-0" style={{ width: 230, height: 230, boxShadow: "0px 2.409px 0px 0px #191919", borderRadius: 6.425 }}>
      <div className="absolute left-0 overflow-clip rounded-[6.425px] pointer-events-none" style={{ width: 230, height: 230 }}>
        <div className="absolute bg-[#d7f0f3]" style={{ left: 115, top: 115, width: 57.5, height: 57.5 }}>
          <div className="flex items-center justify-center size-full"><XMark /></div>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        <div className="absolute bg-[#d7f0f3]" style={{ left: 172.5, top: 115, width: 57.5, height: 57.5 }}>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        <div className="absolute bg-[#d7f0f3]" style={{ left: 115, top: 57.5, width: 57.5, height: 57.5 }}>
          <div className="flex items-center justify-center size-full"><XMark /></div>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        <div className="absolute" style={{ left: 0, top: 0, width: 57.5, height: 172.5 }}>
          <div className="overflow-clip relative size-full">
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
              <div className="flex items-center justify-center size-full"><XMark /></div>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 57.5, width: 57.5, height: 57.5 }}>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 115, width: 57.5, height: 57.5 }}>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
          </div>
          <div aria-hidden="true" className="absolute" style={{ inset: -1.198, border: "2.396px solid black" }} />
        </div>
        <div className="absolute" style={{ left: 115, top: 0, width: 58, height: 57 }}>
          <div className="absolute bg-[#d7f0f3]" style={{ left: -57.5, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#dde0ff]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full">
              <div className="bg-[#f5f5f5] flex flex-col items-center justify-center relative rounded-[6.188px]" style={{ width: 49.5, height: 49.5, gap: 3.094 }}>
                <div aria-hidden="true" className="absolute inset-0 rounded-[6.188px]" style={{ border: "0.773px solid #678893", boxShadow: "0px 0.773px 0px 0px #678893" }} />
                <div className="bg-[#f5f5f5] relative rounded-[6.188px]" style={{ width: 24.75, height: 24.75 }}>
                  <div className="absolute rounded-[4.125px]" style={{ width: 24.75, height: 24.75, left: 0, top: 0 }}>
                    <div className="absolute inset-0 overflow-hidden rounded-[4.125px]">
                      <img alt="" className="absolute max-w-none" style={{ height: "378.38%", left: "-306.31%", top: "-124.94%", width: "614.86%" }} src={imgImage24} />
                    </div>
                  </div>
                </div>
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#4d243d] text-center" style={{ fontSize: 12.375, lineHeight: "16.242px" }}>Adam</p>
              </div>
            </div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 57.5, top: 57.5, width: 58.299, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 57.5, top: 0, width: 58.299, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
        </div>
        <div className="absolute rounded-tr-[8px]" style={{ left: 57.5, top: 0, width: 172.5, height: 172.5 }}>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 0, top: 57.5, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 0.5, top: 115, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute" style={{ left: 0, top: 0, width: 172.5, height: 172.5 }}>
            <div className="absolute" style={{ inset: "-0.69%" }}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 174.896 174.896">
                <path d={svgPaths.pad94680} stroke="black" strokeWidth="2.39583" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[6.425px]" style={{ width: 230, height: 230 }}>
        <div aria-hidden="true" className="absolute rounded-[7.629px]" style={{ inset: -1.204, border: "2.409px solid #191919" }} />
      </div>
      <div className="absolute pointer-events-none" style={{ left: 0, top: 172.5, width: 230, height: 57.5, borderRadius: "0 0 6.389px 6.389px" }}>
        <div className="overflow-clip relative size-full" style={{ borderRadius: "inherit" }}>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 57.5, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 115, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 172.5, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full">
              <div className="relative shrink-0" style={{ width: 40, height: 40 }}>
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgImage29} />
              </div>
            </div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
        </div>
        <div aria-hidden="true" className="absolute" style={{ inset: -1.198, border: "2.396px solid black", borderRadius: "0 0 7.587px 7.587px" }} />
      </div>
      <div className="absolute pointer-events-none" style={{ left: 1, top: 57, width: 57, height: 172, backgroundColor: "rgba(25,25,25,0.8)" }} />
      <div className="absolute pointer-events-none" style={{ left: 58, top: 114, width: 57, height: 115, backgroundColor: "rgba(25,25,25,0.8)" }} />
      <div className="absolute pointer-events-none" style={{ left: 173, top: 114, width: 57, height: 115, backgroundColor: "rgba(25,25,25,0.8)" }} />
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% + 29.29px)", top: "calc(50% - 116.6px)", width: 38.353, height: 16, zIndex: 60 }}>
        <img alt="Study" className="absolute inset-0 max-w-none object-cover size-full" src={imgStudyTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% - 0.4px)", top: "calc(50% + 57.5px)", width: 65.647, height: 16, zIndex: 60 }}>
        <img alt="Living Room" className="absolute inset-0 max-w-none object-cover size-full" src={imgLivingRoomTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% + 28.79px)", top: "calc(50% - 58.01px)", width: 32.941, height: 16, zIndex: 60 }}>
        <img alt="Hall" className="absolute inset-0 max-w-none object-cover size-full" src={imgHallTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% - 85.64px)", top: "calc(50% - 115.6px)", width: 48.471, height: 16, zIndex: 60 }}>
        <img alt="Kitchen" className="absolute inset-0 max-w-none object-cover size-full" src={imgKitchenTutorial} />
      </div>
      {interactiveCells.map(({ id, left, top }) => (
        <div key={id} className="absolute overflow-clip cursor-pointer" style={{ left, top, width: 57.5, height: 57.5, zIndex: 50 }} onClick={() => !touchXCells.has(id) && onCellClick(id)}>
          {touchXCells.has(id) ? (<div className="flex items-center justify-center size-full"><XMark /></div>) : (<StripeSvg />)}
        </div>
      ))}
    </div>
  );
}

/* ---- Interactive Remaining X's Grid (Step 6) ---- */

function RemainingXGrid({ remainXCells, onCellClick }: { remainXCells: Set<string>; onCellClick: (id: string) => void }) {
  const interactiveCells: { id: string; left: number; top: number }[] = [
    { id: "remain-kitchen-2-0", left: 0, top: 115 },
    { id: "remain-hall-2-1", left: 58, top: 115 },
    { id: "remain-living-3-0", left: 0, top: 172.5 },
  ];

  return (
    <div className="relative shrink-0" style={{ width: 230, height: 230, boxShadow: "0px 2.409px 0px 0px #191919", borderRadius: 6.425 }}>
      <div className="absolute left-0 overflow-clip rounded-[6.425px] pointer-events-none" style={{ width: 230, height: 230 }}>
        <div className="absolute bg-[#d7f0f3]" style={{ left: 115, top: 115, width: 57.5, height: 57.5 }}>
          <div className="flex items-center justify-center size-full"><XMark /></div>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        <div className="absolute bg-[#d7f0f3]" style={{ left: 172.5, top: 115, width: 57.5, height: 57.5 }}>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        <div className="absolute bg-[#d7f0f3]" style={{ left: 115, top: 57.5, width: 57.5, height: 57.5 }}>
          <div className="flex items-center justify-center size-full"><XMark /></div>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        <div className="absolute" style={{ left: 0, top: 0, width: 57.5, height: 172.5 }}>
          <div className="overflow-clip relative size-full">
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
              <div className="flex items-center justify-center size-full"><XMark /></div>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 57.5, width: 57.5, height: 57.5 }}>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 115, width: 57.5, height: 57.5 }}>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
          </div>
          <div aria-hidden="true" className="absolute" style={{ inset: -1.198, border: "2.396px solid black" }} />
        </div>
        <div className="absolute" style={{ left: 115, top: 0, width: 58, height: 57 }}>
          <div className="absolute bg-[#d7f0f3]" style={{ left: -57.5, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#dde0ff]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full">
              <div className="bg-[#f5f5f5] flex flex-col items-center justify-center relative rounded-[6.188px]" style={{ width: 49.5, height: 49.5, gap: 3.094 }}>
                <div aria-hidden="true" className="absolute inset-0 rounded-[6.188px]" style={{ border: "0.773px solid #678893", boxShadow: "0px 0.773px 0px 0px #678893" }} />
                <div className="bg-[#f5f5f5] relative rounded-[6.188px]" style={{ width: 24.75, height: 24.75 }}>
                  <div className="absolute rounded-[4.125px]" style={{ width: 24.75, height: 24.75, left: 0, top: 0 }}>
                    <div className="absolute inset-0 overflow-hidden rounded-[4.125px]">
                      <img alt="" className="absolute max-w-none" style={{ height: "378.38%", left: "-306.31%", top: "-124.94%", width: "614.86%" }} src={imgImage24} />
                    </div>
                  </div>
                </div>
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#4d243d] text-center" style={{ fontSize: 12.375, lineHeight: "16.242px" }}>Adam</p>
              </div>
            </div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 57.5, top: 57.5, width: 58.299, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 57.5, top: 0, width: 58.299, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
        </div>
        <div className="absolute rounded-tr-[8px]" style={{ left: 57.5, top: 0, width: 172.5, height: 172.5 }}>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 0, top: 57.5, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 0.5, top: 115, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute" style={{ left: 0, top: 0, width: 172.5, height: 172.5 }}>
            <div className="absolute" style={{ inset: "-0.69%" }}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 174.896 174.896">
                <path d={svgPaths.pad94680} stroke="black" strokeWidth="2.39583" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[6.425px]" style={{ width: 230, height: 230 }}>
        <div aria-hidden="true" className="absolute rounded-[7.629px]" style={{ inset: -1.204, border: "2.409px solid #191919" }} />
      </div>
      <div className="absolute pointer-events-none" style={{ left: 0, top: 172.5, width: 230, height: 57.5, borderRadius: "0 0 6.389px 6.389px" }}>
        <div className="overflow-clip relative size-full" style={{ borderRadius: "inherit" }}>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 57.5, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 115, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 172.5, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full">
              <div className="relative shrink-0" style={{ width: 40, height: 40 }}>
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgImage29} />
              </div>
            </div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
        </div>
        <div aria-hidden="true" className="absolute" style={{ inset: -1.198, border: "2.396px solid black", borderRadius: "0 0 7.587px 7.587px" }} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% + 29.29px)", top: "calc(50% - 116.6px)", width: 38.353, height: 16, zIndex: 60 }}>
        <img alt="Study" className="absolute inset-0 max-w-none object-cover size-full" src={imgStudyTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% - 0.4px)", top: "calc(50% + 57.5px)", width: 65.647, height: 16, zIndex: 60 }}>
        <img alt="Living Room" className="absolute inset-0 max-w-none object-cover size-full" src={imgLivingRoomTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% + 28.79px)", top: "calc(50% - 58.01px)", width: 32.941, height: 16, zIndex: 60 }}>
        <img alt="Hall" className="absolute inset-0 max-w-none object-cover size-full" src={imgHallTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% - 85.64px)", top: "calc(50% - 115.6px)", width: 48.471, height: 16, zIndex: 60 }}>
        <img alt="Kitchen" className="absolute inset-0 max-w-none object-cover size-full" src={imgKitchenTutorial} />
      </div>
      {interactiveCells.map(({ id, left, top }) => (
        <div key={id} className="absolute overflow-clip cursor-pointer" style={{ left, top, width: 57.5, height: 57.5, zIndex: 50 }} onClick={() => !remainXCells.has(id) && onCellClick(id)}>
          {remainXCells.has(id) ? (<div className="flex items-center justify-center size-full"><XMark /></div>) : (<StripeSvg />)}
        </div>
      ))}
    </div>
  );
}

/* ---- Step 2: The Rules ---- */

/* ---- Suspect tile at grid size (49.5px) ---- */
function GridSuspectTile({ suspect, isMurderer, selected, shaking }: { suspect: string; isMurderer?: boolean; selected?: boolean; shaking?: boolean }) {
  const d = SUSPECT_DATA[suspect];
  return (
    <div className={`bg-[#f5f5f5] flex flex-col items-center justify-center relative rounded-[6.188px] select-none${shaking ? " puzzle-shake" : ""}`} style={{ width: 49.5, height: 49.5, gap: 3.094 }}>
      <div
        aria-hidden="true"
        className="absolute pointer-events-none rounded-[6.188px]"
        style={
          isMurderer
            ? { border: "2.5px solid #e01c44", boxShadow: "0px 0.773px 0px 0px #ccc", inset: -1.25 }
            : selected
            ? { border: "1.55px solid #01394b", boxShadow: "0px 0.773px 0px 0px #678893", inset: -0.773 }
            : { border: "0.773px solid #678893", boxShadow: "0px 0.773px 0px 0px #678893", inset: 0 }
        }
      />
      <div className="bg-[#f5f5f5] overflow-hidden relative rounded-[6.188px]" style={{ width: 24.75, height: 24.75 }}>
        <img alt="" className="absolute max-w-none pointer-events-none" style={{ height: "378.38%", width: "614.86%", left: d.crop.left, top: d.crop.top }} src={imgImage24} />
        {d.hairPath && <div className="absolute" style={{ width: d.hairW, height: d.hairH, left: d.hairLeft, top: d.hairTop }}>
          <div className="absolute" style={{ inset: "-2.7% -0.53% -2.13% -0.53%" }}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={d.hairVB}><path d={d.hairPath} fill="#055B0F" stroke="#055B0F" strokeWidth="0.257812" /></svg>
          </div>
        </div>}
      </div>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-center" style={{ color: d.color, fontSize: 12.375, lineHeight: "16.242px" }}>{d.name}</p>
    </div>
  );
}

/* ---- Animation styles ---- */
const shakeStyle = `
@keyframes tutShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-3px)}40%{transform:translateX(3px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
@keyframes puzzle-shake-kf{0%,100%{transform:translateX(0)}15%{transform:translateX(-4px) rotate(-2deg)}30%{transform:translateX(3px) rotate(1.5deg)}45%{transform:translateX(-3px) rotate(-1deg)}60%{transform:translateX(2px) rotate(1deg)}75%{transform:translateX(-1px)}}
.puzzle-shake{animation:puzzle-shake-kf 0.5s ease-in-out}
@keyframes puzzle-room-flash-kf{0%{opacity:0}25%{opacity:1}50%{opacity:0.2}75%{opacity:0.8}100%{opacity:0}}
.puzzle-room-flash{animation:puzzle-room-flash-kf 1.2s ease-in-out forwards}
`;

/* ---- Place Suspects Grid (Step 7) ---- */
function PlaceSuspectsGrid({ placed, shakeCell, onCellClick, shakingSuspect }: { placed: Record<string, string>; shakeCell: string | null; onCellClick: (id: string) => void; shakingSuspect?: string | null }) {
  return (
    <div className="relative shrink-0" style={{ width: 230, height: 230, boxShadow: "0px 2.409px 0px 0px #191919", borderRadius: 6.425 }}>
      <div className="absolute left-0 overflow-clip rounded-[6.425px] pointer-events-none" style={{ width: 230, height: 230 }}>
        {/* Hall col 2 row 2 - X */}
        <div className="absolute bg-[#d7f0f3]" style={{ left: 115, top: 115, width: 57.5, height: 57.5 }}>
          <div className="flex items-center justify-center size-full"><XMark /></div>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        {/* Hall col 3 row 2 - placeable */}
        <div className="absolute bg-[#d7f0f3]" style={{ left: 172.5, top: 115, width: 57.5, height: 57.5 }}>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        {/* Hall col 2 row 1 - X */}
        <div className="absolute bg-[#d7f0f3]" style={{ left: 115, top: 57.5, width: 57.5, height: 57.5 }}>
          <div className="flex items-center justify-center size-full"><XMark /></div>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        {/* Kitchen */}
        <div className="absolute" style={{ left: 0, top: 0, width: 57.5, height: 172.5 }}>
          <div className="overflow-clip relative size-full">
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
              <div className="flex items-center justify-center size-full"><XMark /></div>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
            {/* Kitchen row 1 - placeable */}
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 57.5, width: 57.5, height: 57.5 }}>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 115, width: 57.5, height: 57.5 }}>
              <div className="flex items-center justify-center size-full"><XMark /></div>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
          </div>
          <div aria-hidden="true" className="absolute" style={{ inset: -1.198, border: "2.396px solid black" }} />
        </div>
        {/* Study + adjacent */}
        <div className="absolute" style={{ left: 115, top: 0, width: 58, height: 57 }}>
          <div className="absolute bg-[#d7f0f3]" style={{ left: -57.5, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#dde0ff]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full">
              <GridSuspectTile suspect="adam" shaking={shakingSuspect === "adam"} />
            </div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 57.5, top: 57.5, width: 58.299, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 57.5, top: 0, width: 58.299, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
        </div>
        {/* Hall area */}
        <div className="absolute rounded-tr-[8px]" style={{ left: 57.5, top: 0, width: 172.5, height: 172.5 }}>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 0, top: 57.5, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 0.5, top: 115, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute" style={{ left: 0, top: 0, width: 172.5, height: 172.5 }}>
            <div className="absolute" style={{ inset: "-0.69%" }}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 174.896 174.896">
                <path d={svgPaths.pad94680} stroke="black" strokeWidth="2.39583" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {/* Outer border */}
      <div className="absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[6.425px]" style={{ width: 230, height: 230 }}>
        <div aria-hidden="true" className="absolute rounded-[7.629px]" style={{ inset: -1.204, border: "2.409px solid #191919" }} />
      </div>
      {/* Living room */}
      <div className="absolute pointer-events-none" style={{ left: 0, top: 172.5, width: 230, height: 57.5, borderRadius: "0 0 6.389px 6.389px" }}>
        <div className="overflow-clip relative size-full" style={{ borderRadius: "inherit" }}>
          {/* Living col 1 - placeable */}
          <div className="absolute bg-[#ccf5eb]" style={{ left: 57.5, top: 0, width: 57.5, height: 57.5 }}>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 115, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 172.5, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full">
              <div className="relative shrink-0" style={{ width: 40, height: 40 }}>
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgImage29} />
              </div>
            </div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
        </div>
        <div aria-hidden="true" className="absolute" style={{ inset: -1.198, border: "2.396px solid black", borderRadius: "0 0 7.587px 7.587px" }} />
      </div>
      {/* Room labels */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% + 29.29px)", top: "calc(50% - 116.6px)", width: 38.353, height: 16, zIndex: 60 }}>
        <img alt="Study" className="absolute inset-0 max-w-none object-cover size-full" src={imgStudyTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% - 0.4px)", top: "calc(50% + 57.5px)", width: 65.647, height: 16, zIndex: 60 }}>
        <img alt="Living Room" className="absolute inset-0 max-w-none object-cover size-full" src={imgLivingRoomTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% + 28.79px)", top: "calc(50% - 58.01px)", width: 32.941, height: 16, zIndex: 60 }}>
        <img alt="Hall" className="absolute inset-0 max-w-none object-cover size-full" src={imgHallTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% - 85.64px)", top: "calc(50% - 115.6px)", width: 48.471, height: 16, zIndex: 60 }}>
        <img alt="Kitchen" className="absolute inset-0 max-w-none object-cover size-full" src={imgKitchenTutorial} />
      </div>
      {/* Clickable placement cells */}
      {PLACEMENT_CELLS.map(({ id, left, top }) => (
        <div
          key={id}
          className="absolute cursor-pointer"
          style={{ left, top, width: 57.5, height: 57.5, zIndex: 50, animation: shakeCell === id ? "tutShake 0.4s ease" : undefined }}
          onClick={() => onCellClick(id)}
        >
          {placed[id] && (
            <div className="flex items-center justify-center size-full">
              <GridSuspectTile suspect={placed[id]} shaking={shakingSuspect === placed[id]} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---- Completed Grid (Step 8) ---- */
function CompletedGrid() {
  return (
    <div className="relative shrink-0" style={{ width: 230, height: 230, boxShadow: "0px 2.409px 0px 0px #191919", borderRadius: 6.425 }}>
      <div className="absolute left-0 overflow-clip rounded-[6.425px] pointer-events-none" style={{ width: 230, height: 230 }}>
        <div className="absolute bg-[#d7f0f3]" style={{ left: 115, top: 115, width: 57.5, height: 57.5 }}>
          <div className="flex items-center justify-center size-full"><XMark /></div>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        {/* Tom at hall col 3 row 2 */}
        <div className="absolute bg-[#d7f0f3]" style={{ left: 172.5, top: 115, width: 57.5, height: 57.5 }}>
          <div className="flex items-center justify-center size-full"><GridSuspectTile suspect="tom" /></div>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        <div className="absolute bg-[#d7f0f3]" style={{ left: 115, top: 57.5, width: 57.5, height: 57.5 }}>
          <div className="flex items-center justify-center size-full"><XMark /></div>
          <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
        </div>
        {/* Kitchen with Ella at row 1 */}
        <div className="absolute" style={{ left: 0, top: 0, width: 57.5, height: 172.5 }}>
          <div className="overflow-clip relative size-full">
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
              <div className="flex items-center justify-center size-full"><XMark /></div>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 57.5, width: 57.5, height: 57.5 }}>
              <div className="flex items-center justify-center size-full"><GridSuspectTile suspect="ella" /></div>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
            <div className="absolute bg-[#f6d6e5]" style={{ left: 0, top: 115, width: 57.5, height: 57.5 }}>
              <div className="flex items-center justify-center size-full"><XMark /></div>
              <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
            </div>
          </div>
          <div aria-hidden="true" className="absolute" style={{ inset: -1.198, border: "2.396px solid black" }} />
        </div>
        {/* Study with Adam */}
        <div className="absolute" style={{ left: 115, top: 0, width: 58, height: 57 }}>
          <div className="absolute bg-[#d7f0f3]" style={{ left: -57.5, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#dde0ff]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><GridSuspectTile suspect="adam" /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 57.5, top: 57.5, width: 58.299, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 57.5, top: 0, width: 58.299, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
        </div>
        {/* Hall area */}
        <div className="absolute rounded-tr-[8px]" style={{ left: 57.5, top: 0, width: 172.5, height: 172.5 }}>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 0, top: 57.5, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#d7f0f3]" style={{ left: 0.5, top: 115, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute" style={{ left: 0, top: 0, width: 172.5, height: 172.5 }}>
            <div className="absolute" style={{ inset: "-0.69%" }}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 174.896 174.896">
                <path d={svgPaths.pad94680} stroke="black" strokeWidth="2.39583" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[6.425px]" style={{ width: 230, height: 230 }}>
        <div aria-hidden="true" className="absolute rounded-[7.629px]" style={{ inset: -1.204, border: "2.409px solid #191919" }} />
      </div>
      {/* Living room with Kate (murderer) */}
      <div className="absolute pointer-events-none" style={{ left: 0, top: 172.5, width: 230, height: 57.5, borderRadius: "0 0 6.389px 6.389px" }}>
        <div className="overflow-clip relative size-full" style={{ borderRadius: "inherit" }}>
          {/* Kate at living col 1 */}
          <div className="absolute bg-[#ccf5eb]" style={{ left: 57.5, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><GridSuspectTile suspect="kate" isMurderer /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 0, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 115, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full"><XMark /></div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
          <div className="absolute bg-[#ccf5eb]" style={{ left: 172.5, top: 0, width: 57.5, height: 57.5 }}>
            <div className="flex items-center justify-center size-full">
              <div className="relative shrink-0" style={{ width: 40, height: 40 }}>
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgImage29} />
              </div>
            </div>
            <div aria-hidden="true" className="absolute" style={{ inset: -0.402, border: "0.803px solid #666" }} />
          </div>
        </div>
        <div aria-hidden="true" className="absolute" style={{ inset: -1.198, border: "2.396px solid black", borderRadius: "0 0 7.587px 7.587px" }} />
      </div>
      {/* Room labels */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% + 29.29px)", top: "calc(50% - 116.6px)", width: 38.353, height: 16, zIndex: 60 }}>
        <img alt="Study" className="absolute inset-0 max-w-none object-cover size-full" src={imgStudyTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% - 0.4px)", top: "calc(50% + 57.5px)", width: 65.647, height: 16, zIndex: 60 }}>
        <img alt="Living Room" className="absolute inset-0 max-w-none object-cover size-full" src={imgLivingRoomTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% + 28.79px)", top: "calc(50% - 58.01px)", width: 32.941, height: 16, zIndex: 60 }}>
        <img alt="Hall" className="absolute inset-0 max-w-none object-cover size-full" src={imgHallTutorial} />
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: "calc(50% - 85.64px)", top: "calc(50% - 115.6px)", width: 48.471, height: 16, zIndex: 60 }}>
        <img alt="Kitchen" className="absolute inset-0 max-w-none object-cover size-full" src={imgKitchenTutorial} />
      </div>
    </div>
  );
}

/* ---- Step 7 Rules (matches real game styling) ---- */
function Step7Rules({ s, placed, onSuspectTap, onRoomTap }: {
  s: number;
  placed: Record<string, string>;
  onSuspectTap: (name: string) => void;
  onRoomTap: (room: string) => void;
}) {
  const tomPlaced = Object.values(placed).includes("tom");
  const ellaPlaced = Object.values(placed).includes("ella");
  const katePlaced = Object.values(placed).includes("kate");

  const rules = [tomPlaced, ellaPlaced, katePlaced && ellaPlaced];

  const fs = 13 * s;
  const checkSize = 13 * s;
  const checkPad = 3 * s;
  const checkBR = 4 * s;
  const ruleGap = 12 * s;

  // FLIP animation refs
  const ruleRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const prevPos = useRef<Record<number, number>>({});

  useLayoutEffect(() => {
    const anims: { el: HTMLDivElement; from: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const el = ruleRefs.current[i];
      if (!el) continue;
      const newTop = el.offsetTop;
      const oldTop = prevPos.current[i];
      if (oldTop !== undefined && Math.abs(oldTop - newTop) > 1) {
        anims.push({ el, from: oldTop - newTop });
      }
      prevPos.current[i] = newTop;
    }
    for (const { el, from } of anims) {
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

  useEffect(() => {
    for (let i = 0; i < 3; i++) {
      const el = ruleRefs.current[i];
      if (el) prevPos.current[i] = el.offsetTop;
    }
  });

  // Sort: fulfilled to bottom, maintain original order otherwise
  const sortedOrder = [0, 1, 2].sort((a, b) => {
    const af = rules[a] ? 1 : 0;
    const bf = rules[b] ? 1 : 0;
    if (af !== bf) return af - bf;
    return a - b;
  });

  const ruleItems = [
    // Tom must be in the Hall
    <div key="r0" className="flex items-center" style={{ gap: 4 * s }}>
      <p className="font-['Inter:Regular',sans-serif]" style={{ fontSize: fs }}>
        <span className="font-['Inter:Bold',sans-serif] font-bold underline decoration-solid cursor-pointer" style={{ color: "#a25603" }} onClick={() => onSuspectTap("tom")}>Tom</span>
        <span className="font-normal">{" must be in the"}</span>
      </p>
      <img alt="Hall" src={imgHallTutorial} className="object-contain shrink-0 cursor-pointer" onClick={() => onRoomTap("hall")} style={{ height: 16 * s }} />
    </div>,
    // Ella must be in the first column
    <p key="r1" className="font-['Inter:Regular',sans-serif]" style={{ fontSize: fs }}>
      <span className="font-['Inter:Bold',sans-serif] font-bold underline decoration-solid cursor-pointer" style={{ color: "#e3202d" }} onClick={() => onSuspectTap("ella")}>Ella</span>
      <span className="font-normal">{" must be in the first column"}</span>
    </p>,
    // Kate must be below Ella
    <p key="r2" className="font-['Inter:Regular',sans-serif]" style={{ fontSize: fs }}>
      <span className="font-['Inter:Bold',sans-serif] font-bold underline decoration-solid cursor-pointer" style={{ color: "#055b0f" }} onClick={() => onSuspectTap("kate")}>Kate</span>
      <span className="font-normal">{" must be below "}</span>
      <span className="font-['Inter:Bold',sans-serif] font-bold underline decoration-solid cursor-pointer" style={{ color: "#e3202d" }} onClick={() => onSuspectTap("ella")}>Ella</span>
      <span className="font-normal">{" in the house"}</span>
    </p>,
  ];

  return (
    <div className="flex flex-col w-full" style={{ gap: ruleGap, paddingLeft: 16 * s, paddingRight: 8 * s, paddingTop: 16 * s }}>
      {sortedOrder.map((i) => {
        const isFulfilled = rules[i];
        return (
          <div
            key={i}
            ref={(el) => { ruleRefs.current[i] = el; }}
            className="flex items-center shrink-0 w-full"
            style={{
              opacity: isFulfilled ? 0.4 : 1,
              gap: 8 * s,
              transition: "opacity 0.35s ease",
            }}
          >
            {/* Checkbox matching real game */}
            <div className="relative shrink-0" style={{ backgroundColor: isFulfilled ? "#666" : "#fcfcfc", borderRadius: checkBR, transition: "background-color 0.3s ease" }}>
              <div className="flex items-center overflow-clip" style={{ padding: checkPad, borderRadius: "inherit" }}>
                <div className="overflow-clip shrink-0 relative" style={{ width: checkSize, height: checkSize }}>
                  {isFulfilled && (
                    <div className="absolute inset-[9.38%_0]">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 10.5625">
                        <path d={svgPathsEnd.p2bd41600} fill="white" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-0 pointer-events-none" style={{ borderRadius: checkBR }} />
            </div>
            <div className="flex-1 min-w-0">{ruleItems[i]}</div>
          </div>
        );
      })}
    </div>
  );
}

function RulesCard({ s }: { s: number }) {
  const iconSize = 16 * s;
  const fontSize = 20 * s;
  const lineHeight = `${25 * s}px`;
  const gap = 25 * s;

  return (
    <div
      className="relative flex flex-col items-start w-full"
      style={{
        backgroundColor: "#f5f5f5",
        borderRadius: 8 * s,
        paddingLeft: 12 * s,
        paddingRight: 20 * s,
        paddingTop: 20 * s,
        paddingBottom: 20 * s,
        gap,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          border: `1px solid #ccc`,
          borderRadius: 8 * s,
          boxShadow: `0px ${3 * s}px 0px 0px #ccc`,
        }}
      />

      {/* Rule 1: Only 1 suspect per row */}
      <div className="flex items-center" style={{ gap: 4 * s }}>
        <ol className="block font-['Inter:Regular',sans-serif] font-normal text-[#191919] whitespace-nowrap" style={{ fontSize, lineHeight }} start={1}>
          <li style={{ marginLeft: 30 * s }}>
            <span style={{ lineHeight }}>Only 1 suspect per</span>
          </li>
        </ol>
        <div className="flex items-center" style={{ gap: 6 * s }}>
          <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-black" style={{ fontSize, lineHeight }}>row</span>
          <div className="flex items-center justify-center" style={{ width: iconSize, height: iconSize }}>
            <div className="rotate-90" style={{ width: iconSize, height: iconSize }}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                <path clipRule="evenodd" d={svgPathsRules.p18ce9300} fill="black" fillRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Rule 2: Only 1 suspect per column */}
      <div className="flex items-center" style={{ gap: 4 * s }}>
        <ol className="block font-['Inter:Regular',sans-serif] font-normal text-[#191919] whitespace-nowrap" style={{ fontSize, lineHeight }} start={2}>
          <li style={{ marginLeft: 30 * s }}>
            <span style={{ lineHeight }}>Only 1 suspect per</span>
          </li>
        </ol>
        <div className="flex items-center" style={{ gap: 6 * s }}>
          <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-black" style={{ fontSize, lineHeight }}>column</span>
          <div style={{ width: iconSize, height: iconSize }}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <path clipRule="evenodd" d={svgPathsRules.p18ce9300} fill="black" fillRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Rule 3: Only 1 suspect per room */}
      <div className="flex items-center" style={{ gap: 4 * s }}>
        <ol className="block font-['Inter:Regular',sans-serif] font-normal text-[#191919] whitespace-nowrap" style={{ fontSize, lineHeight }} start={3}>
          <li style={{ marginLeft: 30 * s }}>
            <span style={{ lineHeight }}>Only 1 suspect per</span>
          </li>
        </ol>
        <div className="flex items-center" style={{ gap: 6 * s }}>
          <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-black" style={{ fontSize, lineHeight }}>room</span>
          <div style={{ width: 11.2 * s, height: iconSize }}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.2001 16">
              <path d={svgPathsRules.p173c46e0} fill="black" />
              <path d={svgPathsRules.p19542d00} fill="black" />
            </svg>
          </div>
        </div>
      </div>

      {/* Rule 4: No suspects can touch */}
      <div className="flex items-center" style={{ gap: 4 * s }}>
        <ol className="block font-['Inter:Regular',sans-serif] font-normal text-[#191919] whitespace-nowrap" style={{ fontSize, lineHeight }} start={4}>
          <li style={{ marginLeft: 30 * s }}>
            <span style={{ lineHeight }}>No suspects can</span>
          </li>
        </ol>
        <div className="flex items-center" style={{ gap: 6 * s }}>
          <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-black" style={{ fontSize, lineHeight }}>touch</span>
          <div className="overflow-clip" style={{ width: iconSize, height: iconSize }}>
            <div className="relative" style={{ inset: "6.25%", width: iconSize * 0.875, height: iconSize * 0.875 }}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.0002 15">
                <path d={svgPathsRules.p1663fc00} stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                <path d={svgPathsRules.p2e7a6280} stroke="black" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TutorialScreen({ onPlay, startTime }: TutorialScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [step, setStep] = useState(0); // 0, 1, 2, 3
  const maxStepRef = useRef(0);

  // Track tutorial step progression
  useEffect(() => {
    if (step > maxStepRef.current) {
      maxStepRef.current = step;
      trackTutorialStepReached(step);
    }
    if (step >= 8) {
      const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
      trackTutorialCompleted(duration);
    }
  }, [step, startTime]);
  const [xCells, setXCells] = useState<Set<string>>(new Set());
  const [colXCells, setColXCells] = useState<Set<string>>(new Set());
  const [touchXCells, setTouchXCells] = useState<Set<string>>(new Set());
  const [remainXCells, setRemainXCells] = useState<Set<string>>(new Set());
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [placedSuspects, setPlacedSuspects] = useState<Record<string, string>>({});
  const [shakeCell, setShakeCell] = useState<string | null>(null);
  const [wrongTooltip, setWrongTooltip] = useState<string | null>(null);

  // Step 7 interactivity state (matching real game)
  const [tutShaking, setTutShaking] = useState<string | null>(null);
  const [tutFlashing, setTutFlashing] = useState<string | null>(null);
  const [tutDrag, setTutDrag] = useState<string | null>(null);
  const tutDragPosRef = useRef({ x: 0, y: 0 });
  const tutFloatingRef = useRef<HTMLDivElement>(null);
  const tutGridRef = useRef<HTMLDivElement>(null);

  // Auto-clear shake/flash
  useEffect(() => {
    if (!tutShaking) return;
    const t = setTimeout(() => setTutShaking(null), 600);
    return () => clearTimeout(t);
  }, [tutShaking]);

  useEffect(() => {
    if (!tutFlashing) return;
    const t = setTimeout(() => setTutFlashing(null), 1200);
    return () => clearTimeout(t);
  }, [tutFlashing]);

  useEffect(() => {
    const updateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Use tighter padding on mobile so content can be larger
      const padX = vw < 500 ? 16 : 40;
      const padY = vh < 700 ? 20 : 40;
      const availW = vw - padX;
      const availH = vh - padY;

      const scaleH = availH / DESIGN_H;
      // Scale based on height only — width handles itself via text wrapping and centering
      const s = Math.min(scaleH, 1.3);
      setScale(Math.max(0.45, s));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const s = scale;

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleStripeCellClick = useCallback((id: string) => {
    setXCells(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleColCellClick = useCallback((id: string) => {
    setColXCells(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Auto-advance to next step when all 3 row cells are X'd
  useEffect(() => {
    if (step === 3 && xCells.size >= 3) {
      const timer = setTimeout(() => setStep(4), 400);
      return () => clearTimeout(timer);
    }
  }, [step, xCells]);

  const handleTouchCellClick = useCallback((id: string) => {
    setTouchXCells(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleRemainCellClick = useCallback((id: string) => {
    setRemainXCells(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Auto-advance to next step when all 3 column cells are X'd
  useEffect(() => {
    if (step === 4 && colXCells.size >= 3) {
      const timer = setTimeout(() => setStep(5), 400);
      return () => clearTimeout(timer);
    }
  }, [step, colXCells]);

  const handlePlacementCellClick = useCallback((cellId: string) => {
    if (!selectedSuspect) return;
    if (placedSuspects[cellId]) return; // already filled
    if (CORRECT_PLACEMENTS[cellId] === selectedSuspect) {
      // Correct placement
      setPlacedSuspects(prev => ({ ...prev, [cellId]: selectedSuspect }));
      setSelectedSuspect(null);
      setWrongTooltip(null);
    } else {
      // Wrong placement - shake + tooltip
      setShakeCell(cellId);
      setWrongTooltip(cellId);
      setTimeout(() => setShakeCell(null), 400);
      setTimeout(() => setWrongTooltip(null), 2000);
    }
  }, [selectedSuspect, placedSuspects]);

  // Step 7: tap suspect name → shake, tap room → flash
  const handleTutSuspectTap = useCallback((name: string) => setTutShaking(name), []);
  const handleTutRoomTap = useCallback((room: string) => setTutFlashing(room), []);

  // Step 7: try placing a suspect at a grid cell (from drag or click)
  const tryPlaceSuspect = useCallback((suspect: string, row: number, col: number) => {
    const cellId = TUT_CELL_MAP[`${row},${col}`];
    if (!cellId || placedSuspects[cellId]) return false;
    if (CORRECT_PLACEMENTS[cellId] === suspect) {
      setPlacedSuspects(prev => ({ ...prev, [cellId]: suspect }));
      setSelectedSuspect(null);
      setWrongTooltip(null);
      return true;
    } else {
      setShakeCell(cellId);
      setWrongTooltip(cellId);
      setTimeout(() => setShakeCell(null), 400);
      setTimeout(() => setWrongTooltip(null), 2000);
      return false;
    }
  }, [placedSuspects]);

  // Step 7: drag-and-drop handler for tray suspects
  const handleTutPointerDown = useCallback((e: React.PointerEvent, suspect: string) => {
    e.preventDefault();
    try { (e.target as Element).setPointerCapture(e.pointerId); } catch (_) {}
    const preventScroll = (te: TouchEvent) => te.preventDefault();
    document.addEventListener("touchmove", preventScroll, { passive: false });
    const startX = e.clientX, startY = e.clientY;
    let moved = false;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (!moved && Math.sqrt(dx * dx + dy * dy) > 5) {
        moved = true;
        setSelectedSuspect(null);
        setTutDrag(suspect);
      }
      if (moved) {
        tutDragPosRef.current = { x: ev.clientX, y: ev.clientY };
        if (tutFloatingRef.current) {
          const ts = 49.5 * scale * 1.25;
          tutFloatingRef.current.style.transform = `translate(${ev.clientX - ts / 2}px, ${ev.clientY - ts / 2}px)`;
        }
      }
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("touchmove", preventScroll);
      if (!moved) {
        // Tap → toggle selection
        setSelectedSuspect(prev => prev === suspect ? null : suspect);
        return;
      }
      // Check if dropped on grid cell
      const gc = tutGridRef.current;
      if (gc) {
        const rect = gc.getBoundingClientRect();
        const col = Math.floor((ev.clientX - rect.left) / (rect.width / 4));
        const row = Math.floor((ev.clientY - rect.top) / (rect.height / 4));
        if (row >= 0 && row < 4 && col >= 0 && col < 4) {
          tryPlaceSuspect(suspect, row, col);
        }
      }
      setTutDrag(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [scale, tryPlaceSuspect]);

  // Auto-advance to next step when all 2 touch cells are X'd
  useEffect(() => {
    if (step === 5 && touchXCells.size >= 2) {
      const timer = setTimeout(() => setStep(6), 400);
      return () => clearTimeout(timer);
    }
  }, [step, touchXCells]);

  // Auto-advance to next step when all 3 remaining cells are X'd
  useEffect(() => {
    if (step === 6 && remainXCells.size >= 3) {
      const timer = setTimeout(() => setStep(7), 400);
      return () => clearTimeout(timer);
    }
  }, [step, remainXCells]);

  // Auto-advance when all 3 suspects are placed
  useEffect(() => {
    if (step === 7 && Object.keys(placedSuspects).length >= 3) {
      const timer = setTimeout(() => setStep(8), 600);
      return () => clearTimeout(timer);
    }
  }, [step, placedSuspects]);

  const handleSkip = () => {
    if (step === 0) {
      trackTutorialSkippedIntro();
      onPlay();
    } else {
      trackTutorialSkippedDuring(step);
      onPlay();
    }
  };

  const handlePlayTutorial = () => {
    trackTutorialPlayClicked();
    setStep(2); // Skip to "To start there will be one suspect on the grid"
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-[#f9f7f6] flex flex-col items-center"
      style={{ padding: 20, overflow: step === 0 ? "auto" : "hidden" }}
    >
      <div
        className="flex flex-col items-center w-full"
        style={{
          maxWidth: 400 * s,
          gap: 24 * s,
          position: "relative",
        }}
      >
        {/* Skip button - show for steps 3+ (after clicking Start Interactive Tutorial) */}
        {step >= 3 && (
          <div 
            className="absolute top-0 right-0"
            style={{ zIndex: 10 }}
          >
            <button
              onClick={handleSkip}
              className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#666] cursor-pointer bg-transparent border-none"
              style={{ fontSize: 15 * s, lineHeight: `${20 * s}px` }}
            >
              Skip
            </button>
          </div>
        )}

        {/* Step 0: New How to Play intro screen (scrollable) */}
        {step === 0 && (
          <div className="w-full">
            <TutorialIntro 
              onSkipClick={handleSkip}
              onPlayClick={handlePlayTutorial}
            />
          </div>
        )}

        {/* Old Step 0 and Step 1 are now removed */}

        {/* Step 2: To start there will be one suspect on the grid */}
        {step === 2 && (
          <>
            {/* Heading */}
            <div className="flex flex-col items-center text-center text-[#191919] w-full" style={{ gap: 16 * s }}>
              <p
                className="font-['Literata:Bold',sans-serif] font-bold shrink-0"
                style={{ fontSize: 24 * s, lineHeight: `${34 * s}px` }}
              >
                Tutorial
              </p>
              <p
                className="font-['Inter:Regular',sans-serif] font-normal w-full"
                style={{ fontSize: 15 * s, lineHeight: `${20 * s}px` }}
              >
                To start there will be one suspect on the grid
              </p>
            </div>

            {/* Grid */}
            <div style={{ width: 230 * s, height: 230 * s, margin: "0 auto" }}>
              <div style={{ transform: `scale(${s})`, transformOrigin: "top left", width: 230, height: 230 }}>
                <TutorialGrid />
              </div>
            </div>

            {/* Motivational text */}
            <p
              className="font-['Inter:Regular',sans-serif] font-normal text-center text-[#191919] w-full"
              style={{ fontSize: 15 * s, lineHeight: `${20 * s}px` }}
            >
              Now, it&rsquo;s your turn to place the suspects and find the murderer
            </p>

            {/* Start interactive tutorial button */}
            <button
              onClick={handleNext}
              className="bg-[#191919] flex items-center justify-center rounded-[50px] cursor-pointer"
              style={{ paddingLeft: 24 * s, paddingRight: 24 * s, paddingTop: 12 * s, paddingBottom: 12 * s }}
            >
              <span
                className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#fcfcfc] text-center whitespace-nowrap"
                style={{ fontSize: 15 * s, lineHeight: `${20 * s}px` }}
              >
                Start interactive tutorial
              </span>
            </button>
          </>
        )}

        {/* Step 3: Row rule - interactive stripe-to-X */}
        {step === 3 && (
          <>
            {/* Heading */}
            <div className="flex flex-col items-center text-center text-[#191919] w-full" style={{ gap: 16 * s }}>
              <p
                className="font-['Literata:Bold',sans-serif] font-bold shrink-0"
                style={{ fontSize: 24 * s, lineHeight: `${34 * s}px` }}
              >
                Tutorial
              </p>
              <div className="flex items-center justify-center w-full" style={{ gap: 4 * s }}>
                <p
                  className="font-['Inter:Regular',sans-serif] font-normal text-[#191919] whitespace-nowrap"
                  style={{ fontSize: 17 * s, lineHeight: `${22 * s}px` }}
                >
                  Rule: Only 1 suspect per
                </p>
                <div className="flex items-center" style={{ gap: 6 * s }}>
                  <span
                    className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-black"
                    style={{ fontSize: 17 * s, lineHeight: `${22 * s}px` }}
                  >
                    row
                  </span>
                  <div className="flex items-center justify-center" style={{ width: 16 * s, height: 16 * s }}>
                    <div className="rotate-90" style={{ width: 16 * s, height: 16 * s }}>
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                        <path clipRule="evenodd" d={svgPathsStripes.p18ce9300} fill="black" fillRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Grid */}
            <div style={{ width: 230 * s, height: 230 * s, margin: "0 auto" }}>
              <div style={{ transform: `scale(${s})`, transformOrigin: "top left", width: 230, height: 230 }}>
                <RowRuleGrid xCells={xCells} onCellClick={handleStripeCellClick} />
              </div>
            </div>

            {/* Info text */}
            <div className="flex flex-col items-center w-full" style={{ gap: 24 * s }}>
              <p
                className="font-['Inter:Regular',sans-serif] font-normal text-center text-[#191919] w-full"
                style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
              >
                As Adam is in the first row, no other suspects can be in that row.
              </p>

              {/* "Tap on the [stripe] squares to place a [X]" */}
              <div className="flex items-center justify-center" style={{ gap: 8 * s }}>
                <p
                  className="font-['Inter:Regular',sans-serif] font-normal text-[#191919] text-center whitespace-nowrap"
                  style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
                >
                  Tap on the
                </p>
                <div style={{ transform: `scale(${s})`, transformOrigin: "center", width: 32 * s, height: 32 * s }}>
                  <div style={{ transform: `scale(${1})`, transformOrigin: "top left" }}>
                    <InlineStripeSvg />
                  </div>
                </div>
                <p
                  className="font-['Inter:Regular',sans-serif] font-normal text-[#191919] text-center whitespace-nowrap"
                  style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
                >
                  squares to place a
                </p>
                <div style={{ transform: `scale(${s})`, transformOrigin: "center", width: 32 * s, height: 32 * s }}>
                  <div style={{ transform: `scale(${1})`, transformOrigin: "top left" }}>
                    <InlineXIcon />
                  </div>
                </div>
              </div>

              <p
                className="font-['Inter:Regular',sans-serif] font-normal text-center text-[#191919] w-full"
                style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
              >
                You can use the X's to mark where suspects cannot go.
              </p>
            </div>
          </>
        )}

        {/* Step 4: Column rule - interactive stripe-to-X */}
        {step === 4 && (
          <>
            {/* Heading */}
            <div className="flex flex-col items-center text-center text-[#191919] w-full" style={{ gap: 16 * s }}>
              <p
                className="font-['Literata:Bold',sans-serif] font-bold shrink-0"
                style={{ fontSize: 24 * s, lineHeight: `${34 * s}px` }}
              >
                Tutorial
              </p>
              <div className="flex items-center justify-center w-full" style={{ gap: 4 * s }}>
                <p
                  className="font-['Inter:Regular',sans-serif] font-normal text-[#191919] whitespace-nowrap"
                  style={{ fontSize: 17 * s, lineHeight: `${22 * s}px` }}
                >
                  Rule: Only 1 suspect per
                </p>
                <div className="flex items-center" style={{ gap: 6 * s }}>
                  <span
                    className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-black"
                    style={{ fontSize: 17 * s, lineHeight: `${22 * s}px` }}
                  >
                    column
                  </span>
                  <div style={{ width: 16 * s, height: 16 * s }}>
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                      <path clipRule="evenodd" d={svgPathsStripes.p18ce9300} fill="black" fillRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Grid */}
            <div style={{ width: 230 * s, height: 230 * s, margin: "0 auto" }}>
              <div style={{ transform: `scale(${s})`, transformOrigin: "top left", width: 230, height: 230 }}>
                <ColumnRuleGrid colXCells={colXCells} onCellClick={handleColCellClick} />
              </div>
            </div>

            {/* Info text */}
            <div className="flex flex-col items-center w-full" style={{ gap: 24 * s }}>
              <p
                className="font-['Inter:Regular',sans-serif] font-normal text-center text-[#191919] w-full"
                style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
              >
                As Adam is in the first row, no other suspects can be in that row.
              </p>

              {/* "Tap on the [stripe] squares to place a [X]" */}
              <div className="flex items-center justify-center" style={{ gap: 8 * s }}>
                <p
                  className="font-['Inter:Regular',sans-serif] font-normal text-[#191919] text-center whitespace-nowrap"
                  style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
                >
                  Tap on the
                </p>
                <div style={{ transform: `scale(${s})`, transformOrigin: "center", width: 32 * s, height: 32 * s }}>
                  <div style={{ transform: `scale(${1})`, transformOrigin: "top left" }}>
                    <InlineStripeSvg />
                  </div>
                </div>
                <p
                  className="font-['Inter:Regular',sans-serif] font-normal text-[#191919] text-center whitespace-nowrap"
                  style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
                >
                  squares to place a
                </p>
                <div style={{ transform: `scale(${s})`, transformOrigin: "center", width: 32 * s, height: 32 * s }}>
                  <div style={{ transform: `scale(${1})`, transformOrigin: "top left" }}>
                    <InlineXIcon />
                  </div>
                </div>
              </div>

              <p
                className="font-['Inter:Regular',sans-serif] font-normal text-center text-[#191919] w-full"
                style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
              >
                You can use the X's to mark where suspects cannot go.
              </p>
            </div>
          </>
        )}

        {/* Step 5: Touch rule - interactive stripe-to-X */}
        {step === 5 && (
          <>
            <div className="flex flex-col items-center text-center text-[#191919] w-full" style={{ gap: 16 * s }}>
              <p
                className="font-['Literata:Bold',sans-serif] font-bold shrink-0"
                style={{ fontSize: 24 * s, lineHeight: `${34 * s}px` }}
              >
                Tutorial
              </p>
              <div className="flex items-center justify-center w-full" style={{ gap: 4 * s }}>
                <p
                  className="font-['Inter:Regular',sans-serif] font-normal text-[#191919] whitespace-nowrap"
                  style={{ fontSize: 17 * s, lineHeight: `${22 * s}px` }}
                >
                  Rule: No suspects can
                </p>
                <div className="flex items-center" style={{ gap: 6 * s }}>
                  <span
                    className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-black"
                    style={{ fontSize: 17 * s, lineHeight: `${22 * s}px` }}
                  >
                    touch
                  </span>
                  <div className="overflow-clip" style={{ width: 16 * s, height: 16 * s }}>
                    <div className="relative" style={{ inset: "6.25%", width: 16 * s * 0.875, height: 16 * s * 0.875 }}>
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.0002 15">
                        <path d={svgPathsRules.p1663fc00} stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                        <path d={svgPathsRules.p2e7a6280} stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ width: 230 * s, height: 230 * s, margin: "0 auto" }}>
              <div style={{ transform: `scale(${s})`, transformOrigin: "top left", width: 230, height: 230 }}>
                <TouchRuleGrid touchXCells={touchXCells} onCellClick={handleTouchCellClick} />
              </div>
            </div>

            <div className="flex flex-col items-center w-full" style={{ gap: 24 * s }}>
              <p
                className="font-['Inter:Regular',sans-serif] font-normal text-center text-[#191919] w-full"
                style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
              >
                No other suspects can be next to another suspect. Even diagonally!
              </p>

              <div className="flex items-center justify-center" style={{ gap: 8 * s }}>
                <p
                  className="font-['Inter:Regular',sans-serif] font-normal text-[#191919] text-center whitespace-nowrap"
                  style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
                >
                  Tap on the
                </p>
                <div style={{ transform: `scale(${s})`, transformOrigin: "center", width: 32 * s, height: 32 * s }}>
                  <div style={{ transform: `scale(${1})`, transformOrigin: "top left" }}>
                    <InlineStripeSvg />
                  </div>
                </div>
                <p
                  className="font-['Inter:Regular',sans-serif] font-normal text-[#191919] text-center whitespace-nowrap"
                  style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
                >
                  squares to place a
                </p>
                <div style={{ transform: `scale(${s})`, transformOrigin: "center", width: 32 * s, height: 32 * s }}>
                  <div style={{ transform: `scale(${1})`, transformOrigin: "top left" }}>
                    <InlineXIcon />
                  </div>
                </div>
              </div>

              <p
                className="font-['Inter:Regular',sans-serif] font-normal text-center text-[#191919] w-full"
                style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
              >
                You can use the X's to mark where suspects cannot go.
              </p>
            </div>
          </>
        )}

        {/* Step 6: Remaining X's - interactive stripe-to-X */}
        {step === 6 && (
          <>
            <div className="flex flex-col items-center text-center text-[#191919] w-full whitespace-nowrap" style={{ gap: 16 * s }}>
              <p
                className="font-['Literata:Bold',sans-serif] font-bold shrink-0"
                style={{ fontSize: 24 * s, lineHeight: `${34 * s}px` }}
              >
                Tutorial
              </p>
              <p
                className="font-['Inter:Regular',sans-serif] font-normal"
                style={{ fontSize: 17 * s, lineHeight: `${22 * s}px` }}
              >
                Let's place the remaining X's
              </p>
            </div>

            <div style={{ width: 230 * s, height: 230 * s, margin: "0 auto" }}>
              <div style={{ transform: `scale(${s})`, transformOrigin: "top left", width: 230, height: 230 }}>
                <RemainingXGrid remainXCells={remainXCells} onCellClick={handleRemainCellClick} />
              </div>
            </div>

            <div className="flex flex-col items-center w-full" style={{ gap: 24 * s }}>
              <p
                className="font-['Inter:Regular',sans-serif] font-normal text-center text-[#191919] w-full"
                style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
              >
                Suspects can't be in these squares
              </p>

              <div className="flex items-center justify-center" style={{ gap: 8 * s }}>
                <p
                  className="font-['Inter:Regular',sans-serif] font-normal text-[#191919] text-center whitespace-nowrap"
                  style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
                >
                  Tap on the
                </p>
                <div style={{ transform: `scale(${s})`, transformOrigin: "center", width: 32 * s, height: 32 * s }}>
                  <div style={{ transform: `scale(${1})`, transformOrigin: "top left" }}>
                    <InlineStripeSvg />
                  </div>
                </div>
                <p
                  className="font-['Inter:Regular',sans-serif] font-normal text-[#191919] text-center whitespace-nowrap"
                  style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
                >
                  squares to place a
                </p>
                <div style={{ transform: `scale(${s})`, transformOrigin: "center", width: 32 * s, height: 32 * s }}>
                  <div style={{ transform: `scale(${1})`, transformOrigin: "top left" }}>
                    <InlineXIcon />
                  </div>
                </div>
              </div>

              <p
                className="font-['Inter:Regular',sans-serif] font-normal text-center text-[#191919] w-full"
                style={{ fontSize: 16 * s, lineHeight: `${21 * s}px` }}
              >
                You can use the X's to mark where suspects cannot go.
              </p>
            </div>
          </>
        )}

        {/* Step 7: Place suspects (matches real game look & feel) */}
        {step === 7 && (() => {
          const tileS7 = 49.5 * s * 1.25;
          const gapS7 = 8 * s * 1.25;
          return (
          <>
            <style>{shakeStyle}</style>
            <div className="flex flex-col items-center text-center text-[#191919] w-full" style={{ gap: 16 * s }}>
              <p className="font-['Literata:Bold',sans-serif] font-bold shrink-0" style={{ fontSize: 24 * s, lineHeight: `${34 * s}px` }}>Tutorial</p>
              <p className="font-['Inter:Regular',sans-serif] font-normal w-full" style={{ fontSize: 17 * s, lineHeight: `${22 * s}px` }}>Place the suspects based on their rules</p>
            </div>

            {/* Grid with placement cells + flash overlay */}
            <div className="relative" style={{ width: 230 * s, height: 230 * s, margin: "0 auto" }}>
              <div ref={tutGridRef} style={{ transform: `scale(${s})`, transformOrigin: "top left", width: 230, height: 230, position: "relative" }}>
                <PlaceSuspectsGrid placed={placedSuspects} shakeCell={shakeCell} onCellClick={handlePlacementCellClick} shakingSuspect={tutShaking} />
                {/* Room flash overlay */}
                {tutFlashing && TUT_ROOM_CELLS[tutFlashing]?.map(([r, c]) => (
                  <div
                    key={`flash-${r}-${c}`}
                    className="absolute pointer-events-none puzzle-room-flash"
                    style={{
                      left: c * 57.5,
                      top: r * 57.5,
                      width: 57.5,
                      height: 57.5,
                      backgroundColor: "rgba(255,255,255,0.5)",
                      zIndex: 70,
                    }}
                  />
                ))}
              </div>
              {/* Wrong tooltip */}
              {wrongTooltip && (() => {
                const cell = PLACEMENT_CELLS.find(c => c.id === wrongTooltip);
                if (!cell) return null;
                return (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: cell.left * s + 28.75 * s,
                      top: cell.top * s - 8 * s,
                      transform: "translate(-50%, -100%)",
                      zIndex: 100,
                    }}
                  >
                    <div className="bg-[#191919] text-white rounded-[6px] whitespace-nowrap" style={{ padding: `${4 * s}px ${8 * s}px`, fontSize: 11 * s, lineHeight: `${14 * s}px` }}>
                      That&rsquo;s not the right square!
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "100%", width: 0, height: 0, borderLeft: `${5 * s}px solid transparent`, borderRight: `${5 * s}px solid transparent`, borderTop: `${5 * s}px solid #191919` }} />
                  </div>
                );
              })()}
            </div>

            {/* Suspect tray — matching real game layout */}
            <div className="relative shrink-0 w-full" style={{ paddingTop: 20 * s }}>
              <div className="flex justify-center items-end z-10 relative" style={{ marginTop: -15 * s }}>
                {(["tom", "ella", "kate"] as const).map(id => {
                  const isPlaced = Object.values(placedSuspects).includes(id);
                  const isDragging = tutDrag === id;
                  return (
                    <div
                      key={id}
                      style={{
                        width: isPlaced || isDragging ? 0 : tileS7,
                        height: tileS7,
                        opacity: isPlaced || isDragging ? 0 : 1,
                        marginLeft: isPlaced || isDragging ? 0 : gapS7 / 2,
                        marginRight: isPlaced || isDragging ? 0 : gapS7 / 2,
                        transform: isPlaced || isDragging ? "scale(0.5)" : "scale(1)",
                        transition: isDragging ? "none" : "width 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, margin 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease",
                        overflow: isPlaced || isDragging ? "hidden" : "visible",
                        flexShrink: 0,
                        touchAction: "none",
                      }}
                      onPointerDown={(e) => { if (!isPlaced) handleTutPointerDown(e, id); }}
                    >
                      <div style={{ width: tileS7, height: tileS7 }}>
                        <div style={{ transform: `scale(${s * 1.25})`, transformOrigin: "top left" }}>
                          <GridSuspectTile
                            suspect={id}
                            selected={selectedSuspect === id}
                            shaking={tutShaking === id}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-[#e6ebed] w-full" style={{ height: 31 * s * 1.25, marginTop: -25 * s * 1.25 }} />
            </div>

            {/* Rules — matching real game with FLIP reordering + clickable names/rooms */}
            <Step7Rules s={s} placed={placedSuspects} onSuspectTap={handleTutSuspectTap} onRoomTap={handleTutRoomTap} />

            {/* Floating drag tile */}
            {tutDrag && (
              <div
                ref={(el) => {
                  tutFloatingRef.current = el;
                  if (el) {
                    const { x, y } = tutDragPosRef.current;
                    const ts = 49.5 * s * 1.25;
                    el.style.transform = `translate(${x - ts / 2}px, ${y - ts / 2}px)`;
                  }
                }}
                className="fixed top-0 left-0 pointer-events-none"
                style={{ zIndex: 9999, opacity: 0.9 }}
              >
                <div style={{ transform: `scale(${s * 1.25})`, transformOrigin: "top left" }}>
                  <GridSuspectTile suspect={tutDrag} />
                </div>
              </div>
            )}
          </>
          );
        })()}

        {/* Step 8: Kate is the murderer - final */}
        {step >= 8 && (
          <>
            <div className="flex flex-col items-center text-center text-[#191919] w-full" style={{ gap: 16 * s }}>
              <p className="font-['Literata:Bold',sans-serif] font-bold shrink-0" style={{ fontSize: 24 * s, lineHeight: `${34 * s}px` }}>Tutorial</p>
              <p className="font-['Inter:Regular',sans-serif] font-normal w-full" style={{ fontSize: 17 * s, lineHeight: `${22 * s}px` }}>Kate is the murderer!</p>
            </div>

            <div style={{ width: 230 * s, height: 230 * s, margin: "0 auto" }}>
              <div style={{ transform: `scale(${s})`, transformOrigin: "top left", width: 230, height: 230 }}>
                <CompletedGrid />
              </div>
            </div>

            <p className="font-['Inter:Regular',sans-serif] font-normal text-center text-[#191919] w-full" style={{ fontSize: 15 * s, lineHeight: `${20 * s}px` }}>
              Well done! Kate was in the same room as the murder. Are you ready to play?
            </p>

            <button
              onClick={onPlay}
              className="bg-[#191919] flex items-center justify-center rounded-[50px] cursor-pointer"
              style={{ paddingLeft: 24 * s, paddingRight: 24 * s, paddingTop: 12 * s, paddingBottom: 12 * s }}
            >
              <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#fcfcfc] text-center whitespace-nowrap" style={{ fontSize: 15 * s, lineHeight: `${20 * s}px` }}>
                Start game
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}