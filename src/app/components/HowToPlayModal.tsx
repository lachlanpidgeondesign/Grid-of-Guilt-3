import svgPaths from "../../imports/svg-tum7nfzkr8";
import imgImage24 from "figma:asset/6bdc180aa5e05c3ba389fbac3599c491940173f2.png";

const SPRITE_POSITIONS: Record<string, { left: string; top: string }> = {
  Eve: { left: "-10.81%", top: "-229.73%" },
  Amy: { left: "-109.46%", top: "-229.73%" },
};

function MiniAvatar({ name, size = 24 }: { name: string; size?: number }) {
  const pos = SPRITE_POSITIONS[name];
  if (!pos) return null;
  return (
    <div className="overflow-hidden relative shrink-0 inline-block align-middle" style={{ width: size, height: size, borderRadius: size * 0.25 }}>
      <img
        alt=""
        className="absolute max-w-none pointer-events-none"
        style={{ height: "378.38%", width: "614.86%", left: pos.left, top: pos.top }}
        src={imgImage24}
      />
    </div>
  );
}

interface HowToPlayModalProps {
  onClose: () => void;
}

export default function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 10003, animation: "htp-backdrop-in 0.3s ease-out forwards" }}
      onClick={onClose}
    >
      <style>{`
        @keyframes htp-backdrop-in {
          0% { background-color: rgba(0,0,0,0); }
          100% { background-color: rgba(0,0,0,0.5); }
        }
        @keyframes htp-modal-in {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 599px) {
          .htp-modal-panel {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            border-radius: 0 !important;
          }
          .htp-modal-panel .htp-border-overlay {
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .htp-modal-header {
            position: sticky;
            top: 0;
            z-index: 1;
            background: #fcfcfc;
          }
        }
      `}</style>
      <div
        className="htp-modal-panel bg-[#fcfcfc] relative w-[400px] max-w-[90vw] max-h-[85vh] overflow-y-auto"
        style={{
          borderRadius: 16,
          animation: "htp-modal-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          scrollbarWidth: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div aria-hidden="true" className="htp-border-overlay absolute border-2 border-[#678893] border-solid inset-0 pointer-events-none" style={{ borderRadius: 16, boxShadow: "0px 3px 0px 0px #678893" }} />

        {/* Header */}
        <div className="htp-modal-header flex items-center justify-between px-[20px] pt-[20px] pb-[12px]">
          <div className="flex items-center gap-[8px]">
            <div className="overflow-clip relative shrink-0 size-[22px]">
              <div className="absolute inset-[5%]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                  <path d={svgPaths.p32e8da40} fill="#01394b" />
                </svg>
              </div>
            </div>
            <p className="font-['Literata',serif] font-bold text-[20px] text-[#01394b]">How to Play</p>
          </div>
          <button
            onClick={onClose}
            className="size-[28px] rounded-full bg-[#e6ebed] flex items-center justify-center cursor-pointer border-none shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12" stroke="#333" strokeLinecap="round" strokeWidth="2" />
              <path d="M12 2L2 12" stroke="#333" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-[20px] px-[20px] pb-[24px]">
          {/* Goal */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex items-center gap-[6px]">
              <span className="font-['Inter',sans-serif] font-semibold text-[14px] text-[#01394b] bg-[#e6ebed] px-[8px] py-[2px] rounded-[4px]">Goal</span>
            </div>
            <p className="font-['Inter',sans-serif] font-normal text-[14px] text-[#333]" style={{ lineHeight: "20px" }}>
              Place all 4 suspects into the 5×5 grid to reveal who committed the murder.
            </p>
          </div>

          {/* Rules */}
          <div className="flex flex-col gap-[8px]">
            <span className="font-['Inter',sans-serif] font-semibold text-[14px] text-[#01394b] bg-[#e6ebed] px-[8px] py-[2px] rounded-[4px] self-start">Rules</span>
            <div className="flex flex-col gap-[6px]">
              {[
                "No two suspects can be in the same row or column.",
                "No two suspects can be adjacent (including diagonals).",
                "No two suspects can be in the same room.",
                "Each suspect must satisfy their specific clue.",
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-[8px]">
                  <div className="shrink-0 mt-[3px] size-[14px] rounded-full bg-[#01394b] flex items-center justify-center">
                    <span className="font-['Inter',sans-serif] font-bold text-[9px] text-[#fcfcfc]">{i + 1}</span>
                  </div>
                  <p className="font-['Inter',sans-serif] font-normal text-[14px] text-[#333]" style={{ lineHeight: "20px" }}>{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-[8px]">
            <span className="font-['Inter',sans-serif] font-semibold text-[14px] text-[#01394b] bg-[#e6ebed] px-[8px] py-[2px] rounded-[4px] self-start">Controls</span>
            <div className="flex flex-col gap-[6px]">
              {[
                { icon: "drag", text: "Drag suspects from the tray to the grid." },
                { icon: "tap", text: "Tap an empty cell to mark it with X." },
                { icon: "paint", text: "Drag across empty cells to paint multiple X marks." },
                { icon: "clue", text: "Tap a suspect name in the clues to find them." },
                { icon: "room", text: "Tap a room name in the clues to flash it on the grid." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-[8px]">
                  <div className="shrink-0 mt-[2px] size-[16px] flex items-center justify-center">
                    {item.icon === "drag" && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2L8 14M8 2L5 5M8 2L11 5M8 14L5 11M8 14L11 11" stroke="#678893" strokeLinecap="round" strokeWidth="1.5" />
                      </svg>
                    )}
                    {item.icon === "tap" && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="3" stroke="#678893" strokeWidth="1.5" />
                        <circle cx="8" cy="8" r="1" fill="#678893" />
                      </svg>
                    )}
                    {item.icon === "paint" && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8H13" stroke="#678893" strokeLinecap="round" strokeWidth="1.5" />
                        <path d="M5 5L3 8L5 11" stroke="#678893" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      </svg>
                    )}
                    {item.icon === "clue" && <MiniAvatar name="Amy" size={16} />}
                    {item.icon === "room" && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="12" height="12" rx="2" stroke="#678893" strokeWidth="1.5" fill="none" />
                        <rect x="5" y="5" width="6" height="6" rx="1" fill="#678893" opacity="0.3" />
                      </svg>
                    )}
                  </div>
                  <p className="font-['Inter',sans-serif] font-normal text-[14px] text-[#333]" style={{ lineHeight: "20px" }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-[#e6ebed] rounded-[8px] p-[12px] relative">
            <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <p className="font-['Inter',sans-serif] font-normal text-[13px] text-[#333]" style={{ lineHeight: "18px" }}>
              <span className="font-semibold">Tip: </span>
              Use X marks to eliminate cells where suspects can't go. If you get stuck, use the Hint button!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}