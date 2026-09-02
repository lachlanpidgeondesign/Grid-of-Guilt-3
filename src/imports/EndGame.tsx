import svgPaths from "./svg-82qq91gab8";

function Frame() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Frame">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Frame">
          <path d="M15 18L9 12L15 6" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Header() {
  return (
    <div className="relative shrink-0 w-full" data-name="Header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[10px] relative w-full">
          <Frame />
        </div>
      </div>
    </div>
  );
}

function HeaderContainer() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[390px]" data-name="Header Container">
      <Header />
    </div>
  );
}

function Frame1() {
  return (
    <div className="h-[24px] relative shrink-0 w-[26.879px]">
      <div className="absolute inset-[0_0_-4.15%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26.8792 24.9963">
          <g filter="url(#filter0_d_23_735)" id="Frame 1984078366">
            <path d={svgPaths.p3ef3a200} fill="var(--fill-0, #01394B)" id="Vector 127" />
            <path d={svgPaths.p28d9d800} fill="var(--fill-0, #E6EBED)" id="Vector 126" />
            <path d={svgPaths.paaf3880} fill="var(--fill-0, #678893)" id="Vector" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="24.9963" id="filter0_d_23_735" width="26.8792" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="0.996318" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.403922 0 0 0 0 0.533333 0 0 0 0 0.576471 0 0 0 1 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_23_735" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_23_735" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <Frame1 />
      <p className="font-['Literata:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#01394b] text-[18px] whitespace-nowrap">Grid of Guilt</p>
    </div>
  );
}

function PuzzleInfo() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Puzzle Info">
      <Frame3 />
      <div className="h-[16px] relative shrink-0 w-0">
        <div className="absolute inset-[-3.13%_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 17">
            <path d="M0.5 0.5V16.5" id="Vector 112" stroke="var(--stroke-0, #666666)" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[21px] not-italic relative shrink-0 text-[#333] text-[16px] text-center whitespace-nowrap">10 Mar 2026</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 whitespace-nowrap">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[21px] not-italic relative shrink-0 text-[#333] text-[16px] text-center">TIME</p>
      <p className="font-['Literata:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#191919] text-[34px]">00:06</p>
    </div>
  );
}

function Time() {
  return (
    <div className="bg-[#e6ebed] relative rounded-[16px] shrink-0 w-full" data-name="Time">
      <div aria-hidden="true" className="absolute border-2 border-[#678893] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_2px_0px_0px_#678893]" />
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center p-[24px] relative w-full">
          <Frame2 />
        </div>
      </div>
    </div>
  );
}

function ButtonsContainer() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Buttons Container">
      <Time />
    </div>
  );
}

function ViewButtonContainer() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[4px] shrink-0 w-full" data-name="View Button Container">
      <div className="flex flex-[1_0_0] flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#191919] text-[0px] text-center">
        <p className="text-[15px] whitespace-pre-wrap">
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic">Any feedback or suggestions?</span>
          <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic">{` `}</span>
          <span className="leading-[20px]">
            <br aria-hidden="true" />
          </span>
          <span className="[text-decoration-skip-ink:none] decoration-solid font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic underline">Let us know</span>
        </p>
      </div>
    </div>
  );
}

function LeaderboardCard() {
  return (
    <div className="bg-[#e6ebed] relative rounded-[16px] shrink-0 w-full" data-name="Leaderboard Card">
      <div aria-hidden="true" className="absolute border-2 border-[#678893] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_2px_0px_0px_#678893]" />
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center p-[24px] relative w-full">
          <ViewButtonContainer />
        </div>
      </div>
    </div>
  );
}

function EndGameResultsContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="End Game Results Container">
      <PuzzleInfo />
      <p className="font-['Literata:Bold',sans-serif] font-bold leading-[34px] relative shrink-0 text-[#191919] text-[24px] text-center whitespace-nowrap">
        Well done!
        <br aria-hidden="true" />
        Ben is the Murderer!
      </p>
      <ButtonsContainer />
      <LeaderboardCard />
    </div>
  );
}

function EndGameResults() {
  return (
    <div className="relative shrink-0 w-full" data-name="End Game Results">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center pb-[24px] px-[16px] relative w-full">
          <EndGameResultsContainer />
        </div>
      </div>
    </div>
  );
}

export default function EndGame() {
  return (
    <div className="bg-[#fcfcfc] content-stretch flex flex-col items-start relative size-full" data-name="End Game">
      <HeaderContainer />
      <EndGameResults />
    </div>
  );
}
