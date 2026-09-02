import svgPaths from "../../imports/svg-wnpihame4u";
import imgSubtract from "figma:asset/11b5ce8aa84fd3a9434dff203971b2be0db80ee7.png";
import imgImage27 from "figma:asset/40949af142d0a45ea7a0c2919adabdad5c476997.png";
import imgKnife from "figma:asset/58d165bd57360408c1c72634c155b7d947ea2f28.png";
import { useEffect } from "react";
import { trackStartScreenViewed } from "./analytics";

interface StartScreenProps {
  onStart: () => void;
  onGenerator?: () => void;
}

function KnifeIcon() {
  return (
    <img src={imgKnife} alt="Knife" className="block" style={{ width: 167.994, height: 150, objectFit: "contain" }} />
  );
}

export default function StartScreen({ onStart, onGenerator }: StartScreenProps) {
  useEffect(() => { trackStartScreenViewed(); }, []);
  return (
    <div
      className="bg-[#01394b] fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 10001 }}
    >
      <style>{`
        @keyframes start-fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes start-knife-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
      <div
        className="flex flex-col gap-[56px] items-center w-[278px]"
        style={{ animation: "start-fade-in 0.8s ease-out both" }}
      >
        {/* Crime Desk Presents */}
        <div className="flex flex-col items-center">
          <div className="inline-grid leading-[0] place-items-start relative shrink-0">
            <div className="h-[60px] relative w-[200.893px]">
              <img alt="The Crime Desk" className="absolute block max-w-none size-full" height="60" src={imgSubtract} width="200.893" />
            </div>
          </div>
          <p className="font-['Inter',sans-serif] font-normal text-[15px] text-[#fcfcfc] text-center" style={{ lineHeight: "20px" }}>Presents</p>
        </div>

        {/* Puzzle Start */}
        <div className="flex flex-col gap-[32px] items-center w-full">
          {/* Knife */}
          <div style={{ animation: "start-knife-float 3s ease-in-out infinite", filter: "drop-shadow(0px 6.227px 0px #678893)" }}>
            <KnifeIcon />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-[12px] items-center text-[#fcfcfc] text-center whitespace-nowrap">
            <p className="font-['Literata',serif] font-extrabold text-[40px]" style={{ lineHeight: "41px" }}>Grid of Guilt</p>
            <p className="font-['Inter',sans-serif] font-normal text-[15px]" style={{ lineHeight: "20px" }}>Place the suspects. Find the murderer</p>
          </div>

          {/* Start Button */}
          <button
            className="bg-[#fcfcfc] flex items-center justify-center px-[24px] py-[12px] rounded-[50px] w-[129px] cursor-pointer border-none"
            onClick={onStart}
          >
            <span className="font-['Inter',sans-serif] font-semibold text-[15px] text-[#191919] text-center whitespace-nowrap" style={{ lineHeight: "20px" }}>
              Start game
            </span>
          </button>

          {/* Generator Button */}
          {onGenerator && (
            <button
              className="bg-[#fcfcfc] flex items-center justify-center px-[24px] py-[12px] rounded-[50px] w-[129px] cursor-pointer border-none"
              onClick={onGenerator}
            >
              <span className="font-['Inter',sans-serif] font-semibold text-[15px] text-[#191919] text-center whitespace-nowrap" style={{ lineHeight: "20px" }}>
                Generator
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}