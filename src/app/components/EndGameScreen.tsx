import svgPaths from "../../imports/svg-82qq91gab8";
import imgKnifePng from "figma:asset/58d165bd57360408c1c72634c155b7d947ea2f28.png";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { trackFeedbackLinkClicked, trackBackButtonClicked } from "./analytics";

const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfZhK11MwEOe83XJPAkYh5vkjf7Ku-Sk28g6f8I1fK1bYzsgw/viewform?usp=dialog";

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function todayFormatted() {
  const d = new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

interface EndGameScreenProps {
  seconds: number;
  onBack: () => void;
}

export default function EndGameScreen({ seconds, onBack }: EndGameScreenProps) {
  // Subtle confetti celebration on mount
  useEffect(() => {
    const headerColors = ["#01394b", "#678893", "#e6ebed", "#0a4d63", "#3a6f7f", "#4a8a9a", "#b0c4cc"];

    const gentleBurst = (x: number, y: number, delay: number) => {
      return setTimeout(() => {
        confetti({
          particleCount: 18,
          spread: 280,
          startVelocity: 18,
          gravity: 0.6,
          ticks: 90,
          origin: { x, y },
          colors: headerColors,
          zIndex: 10001,
          scalar: 0.7,
          drift: 0,
        });
      }, delay);
    };

    const bursts = [
      gentleBurst(0.5, 0.35, 300),
      gentleBurst(0.3, 0.25, 800),
      gentleBurst(0.7, 0.3, 1300),
      gentleBurst(0.5, 0.2, 1900),
      gentleBurst(0.4, 0.35, 2500),
      gentleBurst(0.6, 0.25, 3200),
    ];

    return () => bursts.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="bg-[#fcfcfc] flex flex-col items-center justify-start fixed inset-0"
      style={{ zIndex: 10000, animation: "endgame-fade-in 0.6s ease-out forwards" }}
    >
      <style>{`
        @keyframes endgame-fade-in {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="w-full max-w-[500px]">
        <div className="flex items-center px-[12px] py-[10px]">
          <button onClick={() => { trackBackButtonClicked(); onBack(); }} className="shrink-0 size-[24px] cursor-pointer bg-transparent border-none p-0">
            <svg className="block size-full" fill="none" viewBox="0 0 24 24">
              <path d="M15 18L9 12L15 6" stroke="#191919" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center gap-[24px] w-full max-w-[500px] px-[16px] pb-[24px]">
        {/* Puzzle Info */}
        <div className="flex gap-[8px] items-center justify-center">
          <div className="flex gap-[6px] items-center">
            <div className="shrink-0" style={{ width: 26.879, height: 24, filter: "drop-shadow(0px 1px 0px #678893)" }}>
              <img src={imgKnifePng} alt="Knife" className="block size-full object-contain" />
            </div>
            <p className="font-['Literata',serif] font-bold text-[18px] text-[#01394b] whitespace-nowrap">Grid of Guilt</p>
          </div>
          <div className="h-[16px] relative shrink-0 w-0">
            <div className="absolute inset-[-3.13%_-0.5px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 17">
                <path d="M0.5 0.5V16.5" stroke="#666666" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <p className="font-['Inter',sans-serif] font-normal text-[16px] text-[#333] text-center whitespace-nowrap">{todayFormatted()}</p>
        </div>

        {/* Well done text */}
        <p className="font-['Literata',serif] font-bold text-[24px] text-[#191919] text-center whitespace-nowrap" style={{ lineHeight: "34px" }}>
          Well done!
          <br />
          Amy is the Murderer!
        </p>

        {/* Time card */}
        <div className="bg-[#e6ebed] relative rounded-[16px] w-full">
          <div aria-hidden="true" className="absolute border-2 border-[#678893] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_2px_0px_0px_#678893]" />
          <div className="flex flex-col items-center p-[24px]">
            <div className="flex flex-col gap-[4px] items-center">
              <p className="font-['Inter',sans-serif] font-semibold text-[16px] text-[#333] text-center" style={{ lineHeight: "21px" }}>TIME</p>
              <p className="font-['Literata',serif] font-bold text-[34px] text-[#191919]">{formatTime(seconds)}</p>
            </div>
          </div>
        </div>

        {/* Feedback card */}
        <a
          href={GOOGLE_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#e6ebed] relative rounded-[16px] w-full no-underline block cursor-pointer"
          onClick={() => trackFeedbackLinkClicked()}
        >
          <div aria-hidden="true" className="absolute border-2 border-[#678893] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_2px_0px_0px_#678893]" />
          <div className="flex flex-col items-center p-[24px]">
            <div className="flex flex-col items-center text-center">
              <p className="font-['Inter',sans-serif] font-normal text-[15px] text-[#191919]" style={{ lineHeight: "20px" }}>
                Any feedback or suggestions?
              </p>
              <p className="font-['Inter',sans-serif] font-semibold text-[15px] text-[#191919] underline" style={{ lineHeight: "20px" }}>
                Let us know
              </p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}