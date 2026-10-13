// Grid of Guilt — /play/ results screen (shown after a win).

import imgKnife from "figma:asset/58d165bd57360408c1c72634c155b7d947ea2f28.png";
import type { LevelId } from "../app/levels/loadLevel";
import { LEVELS } from "../app/levels/loadLevel";
import { suspectsForSize } from "../app/generator/suspects";
import { murdererRoomName } from "./clueOrder";
import { LEVEL_LABEL, LEVEL_ORDER, formatTime } from "./storage";

interface ResultsScreenProps {
  levelId: LevelId;
  seconds: number;
  hints: number;
  onNextLevel: () => void;
  onBackToLevels: () => void;
  onShare: () => void;
}

export default function ResultsScreen({ levelId, seconds, hints, onNextLevel, onBackToLevels, onShare }: ResultsScreenProps) {
  const level = LEVELS[levelId];
  const murderer = suspectsForSize(level.N)[level.murdererIdx];
  const room = murdererRoomName(level);
  const nextIdx = LEVEL_ORDER.indexOf(levelId) + 1;
  const hasNext = nextIdx < LEVEL_ORDER.length;

  return (
    <div className="bg-[#01394b] fixed inset-0 flex flex-col items-center justify-center overflow-y-auto px-[24px]" style={{ zIndex: 10001 }}>
      <div className="flex flex-col items-center w-full max-w-[340px] gap-[28px] py-[40px]">
        <div style={{ filter: "drop-shadow(0px 5px 0px #678893)" }}>
          <img src={imgKnife} alt="Knife" className="block" style={{ width: 90, height: 80, objectFit: "contain" }} />
        </div>

        <div className="flex flex-col items-center gap-[12px] text-center">
          <p className="font-['Literata',serif] font-extrabold text-[28px] text-[#fcfcfc]" style={{ lineHeight: "32px" }}>
            {murderer.name} is the murderer!
          </p>
          <p className="font-['Inter',sans-serif] font-normal text-[15px] text-[#cfe0e5]" style={{ lineHeight: "21px" }}>
            {murderer.name} was in the {room} with the victim.
          </p>
        </div>

        <div className="flex items-center justify-center gap-[32px]">
          <div className="flex flex-col items-center">
            <span className="font-['Literata',serif] font-extrabold text-[24px] text-[#fcfcfc]">{formatTime(seconds)}</span>
            <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#9fb6bd]">Time</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-['Literata',serif] font-extrabold text-[24px] text-[#fcfcfc]">{hints}</span>
            <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#9fb6bd]">{hints === 1 ? "Hint" : "Hints"}</span>
          </div>
        </div>

        <div className="flex flex-col items-stretch w-full gap-[10px]">
          {hasNext ? (
            <button
              onClick={onNextLevel}
              className="w-full rounded-[50px] bg-[#fcfcfc] text-[#191919] font-['Inter',sans-serif] font-semibold text-[15px] py-[13px] border-none cursor-pointer"
            >
              Next level: {LEVEL_LABEL[LEVEL_ORDER[nextIdx]]}
            </button>
          ) : (
            <button
              onClick={onBackToLevels}
              className="w-full rounded-[50px] bg-[#fcfcfc] text-[#191919] font-['Inter',sans-serif] font-semibold text-[15px] py-[13px] border-none cursor-pointer"
            >
              Back to levels
            </button>
          )}
          <button
            onClick={onShare}
            className="w-full rounded-[50px] bg-transparent text-[#fcfcfc] font-['Inter',sans-serif] font-semibold text-[15px] py-[12px] border border-[#678893] cursor-pointer"
          >
            Share
          </button>
          {hasNext && (
            <button
              onClick={onBackToLevels}
              className="w-full font-['Inter',sans-serif] font-semibold text-[14px] text-[#9fb6bd] underline bg-transparent border-none cursor-pointer py-[4px]"
            >
              Back to levels
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
