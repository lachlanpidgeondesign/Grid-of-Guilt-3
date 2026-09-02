import svgPaths from "./svg-9z3d8thetx";
import imgImage25 from "figma:asset/6bdc180aa5e05c3ba389fbac3599c491940173f2.png";
import imgImage29 from "figma:asset/d34acba5abc649030f58a8d31ec6f9d063e4909d.png";
import imgBedroom from "figma:asset/4a466bdc58ef88612b0027afdd441e2ca60b2f77.png";
import imgHall22 from "figma:asset/8f450dcfdd8e4c02df06fd458181e63341436d31.png";
import imgBathroom22 from "figma:asset/34b2ff7499c55faf6a79d53dffadcccefbb227b7.png";
import imgKitchen22 from "figma:asset/b468176479fd8214935ec4d58ba27963734ec5c9.png";
import imgStudy23 from "figma:asset/7cde95b866ca537e31bc0f215294f33698b82be1.png";

function Time() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Time">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[6px] relative w-full">
          <p className="font-['SF_Pro:Semibold',sans-serif] font-[590] leading-[22px] relative shrink-0 text-[17px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            9:41
          </p>
        </div>
      </div>
    </div>
  );
}

function DynamicIslandSpacer() {
  return <div className="h-[10px] shrink-0 w-[124px]" data-name="Dynamic Island spacer" />;
}

function Battery() {
  return (
    <div className="h-[13px] relative shrink-0 w-[27.328px]" data-name="Battery">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27.328 13">
        <g id="Battery">
          <rect height="12" id="Border" opacity="0.35" rx="3.8" stroke="var(--stroke-0, white)" width="24" x="0.5" y="0.5" />
          <path d={svgPaths.p3bbd9700} fill="var(--fill-0, white)" id="Cap" opacity="0.4" />
          <rect fill="var(--fill-0, white)" height="9" id="Capacity" rx="2.5" width="21" x="2" y="2" />
        </g>
      </svg>
    </div>
  );
}

function Levels() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Levels">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[7px] items-center justify-center px-[6px] relative w-full">
          <div className="h-[12.226px] relative shrink-0 w-[19.2px]" data-name="Cellular Connection">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.2 12.2264">
              <path clipRule="evenodd" d={svgPaths.p1e09e400} fill="var(--fill-0, white)" fillRule="evenodd" id="Cellular Connection" />
            </svg>
          </div>
          <div className="h-[12.328px] relative shrink-0 w-[17.142px]" data-name="Wifi">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.1417 12.3283">
              <path clipRule="evenodd" d={svgPaths.p18b35300} fill="var(--fill-0, white)" fillRule="evenodd" id="Wifi" />
            </svg>
          </div>
          <Battery />
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Frame">
      <Time />
      <DynamicIslandSpacer />
      <Levels />
    </div>
  );
}

function Logo() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Logo">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#fcfcfc] text-[15px] whitespace-nowrap">00:00</p>
    </div>
  );
}

function LhContainer() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[116px]" data-name="LH Container">
      <Logo />
    </div>
  );
}

function Frame1() {
  return (
    <div className="h-[28px] relative shrink-0 w-[31.359px]">
      <div className="absolute inset-[0_0_-4.15%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31.3591 29.1624">
          <g filter="url(#filter0_d_90_1036)" id="Frame 1984078366">
            <path d={svgPaths.p28515100} fill="var(--fill-0, #01394B)" id="Vector 127" />
            <path d={svgPaths.p3724a900} fill="var(--fill-0, #E6EBED)" id="Vector 126" />
            <path d={svgPaths.p29ae6fc0} fill="var(--fill-0, #678893)" id="Vector" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="29.1624" id="filter0_d_90_1036" width="31.3591" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1.16237" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.403922 0 0 0 0 0.533333 0 0 0 0 0.576471 0 0 0 1 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_90_1036" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_90_1036" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute inset-[5%]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <path d={svgPaths.p32e8da40} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#fcfcfc] content-stretch flex gap-[6px] h-[28px] items-center px-[10px] py-[6px] relative rounded-[99px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[99px]" />
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="What If">
        <Icon />
      </div>
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191919] text-[13px] whitespace-nowrap">
        <p className="leading-[18px]">How to play</p>
      </div>
    </div>
  );
}

function RhContainer() {
  return (
    <div className="content-stretch flex items-center justify-end relative shrink-0 w-[116px]" data-name="RH Container">
      <Button />
    </div>
  );
}

function PuzzleHeader() {
  return (
    <div className="absolute bg-[#01394b] content-stretch flex h-[44px] items-center justify-between left-0 px-[12px] py-[8px] top-[48px] w-[390px]" data-name="Puzzle Header">
      <div aria-hidden="true" className="absolute border-[#678893] border-b border-solid inset-0 pointer-events-none" />
      <LhContainer />
      <Frame1 />
      <RhContainer />
    </div>
  );
}

function Header() {
  return (
    <div className="-translate-x-1/2 absolute bg-[#01394b] h-[92px] left-1/2 top-0 w-[390px]" data-name="Header">
      <div className="absolute content-stretch flex flex-col h-[48px] items-center justify-center left-0 top-0 w-[390px]" data-name="Status Bar">
        <Frame />
      </div>
      <PuzzleHeader />
    </div>
  );
}

function Frame2() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell() {
  return (
    <div className="absolute bg-[#d7f0f3] left-0 min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame2 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame3() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell1() {
  return (
    <div className="absolute bg-[#d7f0f3] left-0 min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[66.75px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame3 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame4() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell2() {
  return (
    <div className="absolute bg-[#d7f0f3] left-0 min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[133.5px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame4 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame5() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell3() {
  return (
    <div className="absolute bg-[#d7f0f3] left-0 min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[200.25px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame5 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame6() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell4() {
  return (
    <div className="absolute bg-[#d7f0f3] left-[66.75px] min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[200.25px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame6 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame9() {
  return (
    <div className="absolute bg-[#f5f5f5] left-0 rounded-[7.417px] size-[29.667px] top-0">
      <div className="absolute left-0 rounded-[7.417px] size-[29.667px] top-0" data-name="image 25">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[7.417px]">
          <img alt="" className="absolute h-[378.38%] left-[-208.11%] max-w-none top-[-229.73%] w-[614.86%]" src={imgImage25} />
        </div>
      </div>
    </div>
  );
}

function DylanTile() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[7.417px] shrink-0 size-[29.667px]" data-name="Dylan Tile">
      <Frame9 />
    </div>
  );
}

function AmyTile() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[3.708px] items-center justify-center relative rounded-[7.417px] shrink-0 size-[59.333px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border-[#ccc] border-[0.927px] border-solid inset-0 pointer-events-none rounded-[7.417px] shadow-[0px_0.927px_0px_0px_#ccc]" />
      <DylanTile />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#0071cb] text-[14.833px] text-center w-[min-content]">
        <p className="leading-[19.469px]">Jess</p>
      </div>
    </div>
  );
}

function Cell5() {
  return (
    <div className="absolute bg-[#d7f0f3] left-[133.5px] min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[200.25px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <AmyTile />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Hall() {
  return (
    <div className="absolute h-[267px] left-[133.5px] top-0 w-[200.25px]" data-name="Hall">
      <Cell />
      <Cell1 />
      <Cell2 />
      <Cell3 />
      <Cell4 />
      <Cell5 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell6() {
  return (
    <div className="absolute bg-[#fdeed8] left-0 min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[66.75px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame7 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame8() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell7() {
  return (
    <div className="absolute bg-[#fdeed8] left-[66.75px] min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame8 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame10() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell8() {
  return (
    <div className="absolute bg-[#fdeed8] left-[66.75px] min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[66.75px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame10 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Amy() {
  return (
    <div className="bg-[#f5f5f5] overflow-clip relative rounded-[7.417px] shrink-0 size-[29.667px]" data-name="Amy">
      <div className="absolute left-0 rounded-[4.944px] size-[29.667px] top-0" data-name="image 24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4.944px]">
          <img alt="" className="absolute h-[378.38%] left-[-109.46%] max-w-none top-[-229.73%] w-[614.86%]" src={imgImage25} />
        </div>
      </div>
    </div>
  );
}

function AmyTile1() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[3.708px] items-center justify-center relative rounded-[7.417px] shrink-0 size-[59.333px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border-[#ccc] border-[0.927px] border-solid inset-0 pointer-events-none rounded-[7.417px] shadow-[0px_0.927px_0px_0px_#ccc]" />
      <Amy />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#e3202d] text-[14.833px] text-center w-[min-content]">
        <p className="leading-[19.469px]">Amy</p>
      </div>
    </div>
  );
}

function Cell9() {
  return (
    <div className="absolute bg-[#fdeed8] left-[133.5px] min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[66.75px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <AmyTile1 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame11() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell10() {
  return (
    <div className="absolute bg-[#fdeed8] left-[200.25px] min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[66.75px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame11 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame12() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell11() {
  return (
    <div className="absolute bg-[#fdeed8] left-[267px] min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[66.75px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame12 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Bedroom() {
  return (
    <div className="absolute h-[133.5px] left-0 top-[200.25px] w-[333.75px]" data-name="Bedroom">
      <Cell6 />
      <Cell7 />
      <Cell8 />
      <Cell9 />
      <Cell10 />
      <Cell11 />
      <div className="absolute h-[133.966px] left-0 top-[0.46px] w-[334.682px]" data-name="Union">
        <div className="absolute inset-[-1.04%_-0.42%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 337.463 136.747">
            <path d={svgPaths.p31364800} fill="var(--stroke-0, black)" id="Union" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame13() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell12() {
  return (
    <div className="absolute bg-[#dde0ff] left-0 min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame13 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function DylanTile1() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[7.417px] shrink-0 size-[29.667px]" data-name="Dylan Tile">
      <div className="absolute left-0 rounded-[4.944px] size-[29.667px] top-0" data-name="image 18">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4.944px]">
          <img alt="" className="absolute h-[378.38%] left-[-108.11%] max-w-none top-[-120.27%] w-[614.86%]" src={imgImage25} />
        </div>
      </div>
    </div>
  );
}

function AmyTile2() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[3.708px] items-center justify-center relative rounded-[7.417px] shrink-0 size-[59.333px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border-[#ccc] border-[0.927px] border-solid inset-0 pointer-events-none rounded-[7.417px] shadow-[0px_0.927px_0px_0px_#ccc]" />
      <DylanTile1 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#a25603] text-[14.833px] text-center w-[min-content]">
        <p className="leading-[19.469px]">Dylan</p>
      </div>
    </div>
  );
}

function Cell13() {
  return (
    <div className="absolute bg-[#dde0ff] left-0 min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[66.75px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <AmyTile2 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame14() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell14() {
  return (
    <div className="absolute bg-[#dde0ff] left-0 min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[133.5px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame14 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame15() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell15() {
  return (
    <div className="absolute bg-[#dde0ff] left-[66.75px] min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame15 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame16() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell16() {
  return (
    <div className="absolute bg-[#dde0ff] left-[66.75px] min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[66.75px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame16 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame17() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell17() {
  return (
    <div className="absolute bg-[#dde0ff] left-[66.75px] min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[133.5px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame17 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Area1() {
  return (
    <div className="absolute h-[200.25px] left-[200.25px] top-0 w-[133.5px]" data-name="Area 3">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Cell12 />
        <Cell13 />
        <Cell14 />
        <Cell15 />
        <Cell16 />
        <Cell17 />
      </div>
      <div aria-hidden="true" className="absolute border-[2.781px] border-black border-solid inset-[-1.391px] pointer-events-none" />
    </div>
  );
}

function Frame18() {
  return (
    <div className="absolute bg-[#f5f5f5] left-0 rounded-[7.417px] size-[29.667px] top-0">
      <div className="absolute left-0 rounded-[4.944px] size-[29.667px] top-0" data-name="image 24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4.944px]">
          <img alt="" className="absolute h-[378.38%] left-[-504.05%] max-w-none top-[-229.73%] w-[614.86%]" src={imgImage25} />
        </div>
      </div>
    </div>
  );
}

function DylanTile2() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[7.417px] shrink-0 size-[29.667px]" data-name="Dylan Tile">
      <Frame18 />
    </div>
  );
}

function AmyTile3() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[3.708px] items-center justify-center relative rounded-[7.417px] shrink-0 size-[59.333px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border-[#ccc] border-[0.927px] border-solid inset-0 pointer-events-none rounded-[7.417px] shadow-[0px_0.927px_0px_0px_#ccc]" />
      <DylanTile2 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#4d243d] text-[14.833px] text-center w-[min-content]">
        <p className="leading-[19.469px]">Ben</p>
      </div>
    </div>
  );
}

function Cell18() {
  return (
    <div className="absolute bg-[#ccf5eb] left-0 min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <AmyTile3 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame19() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell19() {
  return (
    <div className="absolute bg-[#ccf5eb] left-[66.75px] min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame19 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Area() {
  return (
    <div className="absolute h-[66.75px] left-0 top-0 w-[133.5px]" data-name="Area 1">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Cell18 />
        <Cell19 />
      </div>
      <div aria-hidden="true" className="absolute border-[2.781px] border-black border-solid inset-[-1.391px] pointer-events-none" />
    </div>
  );
}

function Cell20() {
  return (
    <div className="absolute bg-[#f6d6e5] left-0 min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <div className="relative shrink-0 size-[46.435px]" data-name="image 29">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage29} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame20() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell21() {
  return (
    <div className="absolute bg-[#f6d6e5] left-0 min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[66.75px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame20 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame21() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell22() {
  return (
    <div className="absolute bg-[#f6d6e5] left-0 min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[133.5px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame21 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Frame22() {
  return (
    <div className="relative shrink-0 size-[29.667px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 29.6667">
        <g id="Frame 1984078378">
          <path d={svgPaths.p13668700} id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
          <path d={svgPaths.p2be5d100} id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="1.39062" />
        </g>
      </svg>
    </div>
  );
}

function Cell23() {
  return (
    <div className="absolute bg-[#f6d6e5] left-[66.75px] min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Frame22 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Eve() {
  return (
    <div className="bg-[#f5f5f5] overflow-clip relative rounded-[7.417px] shrink-0 size-[29.667px]" data-name="Eve">
      <div className="absolute left-0 size-[29.667px] top-0" data-name="image 24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[378.38%] left-[-10.81%] max-w-none top-[-229.73%] w-[614.86%]" src={imgImage25} />
        </div>
      </div>
      <div className="absolute h-[7.726px] left-[0.31px] top-[22.25px] w-[29.358px]">
        <div className="absolute inset-[-2.66%_-0.53%_-2%_-0.53%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.6667 8.08569">
            <path d={svgPaths.pca290f2} fill="var(--fill-0, #055B0F)" id="Vector 136" stroke="var(--stroke-0, #055B0F)" strokeWidth="0.309028" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function EveTile() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[3.708px] items-center justify-center relative rounded-[7.417px] shrink-0 size-[59.333px]" data-name="Eve Tile">
      <div aria-hidden="true" className="absolute border-[#ccc] border-[0.927px] border-solid inset-0 pointer-events-none rounded-[7.417px] shadow-[0px_0.927px_0px_0px_#ccc]" />
      <Eve />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#055b0f] text-[14.833px] text-center w-[min-content]">
        <p className="leading-[19.469px]">Eve</p>
      </div>
    </div>
  );
}

function Cell24() {
  return (
    <div className="absolute bg-[#f6d6e5] left-[66.75px] min-h-[37.290504455566406px] min-w-[37.290504455566406px] size-[66.75px] top-[66.75px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[7.45810079574585px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <EveTile />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.932px] border-solid inset-[-0.466px] pointer-events-none" />
    </div>
  );
}

function Study() {
  return (
    <div className="absolute h-[200.25px] left-0 top-[66.75px] w-[133.5px]" data-name="Study">
      <Cell20 />
      <Cell21 />
      <Cell22 />
      <Cell23 />
      <Cell24 />
      <div className="absolute h-[201.182px] left-[-0.93px] top-[-0.93px] w-[134.432px]" data-name="Union">
        <div className="absolute inset-[-0.69%_-1.03%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 137.213 203.963">
            <path d={svgPaths.p489d180} fill="var(--stroke-0, black)" id="Union" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function SudokuGrid() {
  return (
    <div className="absolute left-0 overflow-clip rounded-[7.458px] size-[333.75px] top-0" data-name="Sudoku Grid">
      <Hall />
      <Bedroom />
      <Area1 />
      <Area />
      <Study />
    </div>
  );
}

function Border() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 rounded-[7.458px] size-[333.75px] top-1/2" data-name="Border">
      <div aria-hidden="true" className="absolute border-[#191919] border-[2.797px] border-solid inset-[-1.399px] pointer-events-none rounded-[8.857px]" />
    </div>
  );
}

function Component5X() {
  return (
    <div className="-translate-x-1/2 absolute left-[calc(50%+12.12px)] shadow-[0px_2.797px_0px_0px_#191919] size-[333.75px] top-[141.58px]" data-name="5x5">
      <SudokuGrid />
      <Border />
      <div className="absolute h-[20.396px] left-[134.73px] top-[256.8px] w-[65.219px]" data-name="Bedroom">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgBedroom} />
      </div>
      <div className="absolute h-[20.396px] left-[146.59px] top-[-10.2px] w-[41.503px]" data-name="Hall - 2 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHall22} />
      </div>
      <div className="absolute h-[20.396px] left-[30.59px] top-[-10.2px] w-[72.571px]" data-name="Bathroom - 2 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgBathroom22} />
      </div>
      <div className="absolute h-[20.396px] left-[236.41px] top-[-10.2px] w-[60.95px]" data-name="Kitchen - 2 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgKitchen22} />
      </div>
      <div className="absolute h-[20.396px] left-[42.65px] top-[56.55px] w-[48.144px]" data-name="Study - 2 3">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgStudy23} />
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col items-center justify-center relative rounded-[3.731px] shrink-0 size-[18.653px]" data-name="Label">
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[3.731px]" />
      <p className="font-['Literata:ExtraBold',sans-serif] font-extrabold leading-[normal] relative shrink-0 text-[11.192px] text-black text-center w-full">1</p>
    </div>
  );
}

function Label1() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col items-center justify-center relative rounded-[3.731px] shrink-0 size-[18.653px]" data-name="Label">
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[3.731px]" />
      <p className="font-['Literata:ExtraBold',sans-serif] font-extrabold leading-[normal] relative shrink-0 text-[11.192px] text-black text-center w-full">2</p>
    </div>
  );
}

function Label2() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col items-center justify-center relative rounded-[3.731px] shrink-0 size-[18.653px]" data-name="Label">
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[3.731px]" />
      <p className="font-['Literata:ExtraBold',sans-serif] font-extrabold leading-[normal] relative shrink-0 text-[11.192px] text-black text-center w-full">3</p>
    </div>
  );
}

function Label3() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col items-center justify-center relative rounded-[3.731px] shrink-0 size-[18.653px]" data-name="Label">
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[3.731px]" />
      <p className="font-['Literata:ExtraBold',sans-serif] font-extrabold leading-[normal] relative shrink-0 text-[11.192px] text-black text-center w-full">4</p>
    </div>
  );
}

function Label4() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col items-center justify-center relative rounded-[3.731px] shrink-0 size-[18.653px]" data-name="Label">
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[3.731px]" />
      <p className="font-['Literata:ExtraBold',sans-serif] font-extrabold leading-[normal] relative shrink-0 text-[11.192px] text-black text-center w-full">5</p>
    </div>
  );
}

function LabelRow() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-[39.25px] pb-[14.922px] px-[24.249px] top-[108px] w-[335.751px]" data-name="Label row">
      <Label />
      <Label1 />
      <Label2 />
      <Label3 />
      <Label4 />
    </div>
  );
}

function Label5() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col items-center justify-center relative rounded-[3.731px] shrink-0 size-[18.653px]" data-name="Label">
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[3.731px]" />
      <p className="font-['Literata:ExtraBold',sans-serif] font-extrabold leading-[normal] relative shrink-0 text-[11.192px] text-black text-center w-full">A</p>
    </div>
  );
}

function Label6() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col items-center justify-center relative rounded-[3.731px] shrink-0 size-[18.653px]" data-name="Label">
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[3.731px]" />
      <p className="font-['Literata:ExtraBold',sans-serif] font-extrabold leading-[normal] relative shrink-0 text-[11.192px] text-black text-center w-full">B</p>
    </div>
  );
}

function Label7() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col items-center justify-center relative rounded-[3.731px] shrink-0 size-[18.653px]" data-name="Label">
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[3.731px]" />
      <p className="font-['Literata:ExtraBold',sans-serif] font-extrabold leading-[normal] relative shrink-0 text-[11.192px] text-black text-center w-full">C</p>
    </div>
  );
}

function Label8() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col items-center justify-center relative rounded-[3.731px] shrink-0 size-[18.653px]" data-name="Label">
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[3.731px]" />
      <p className="font-['Literata:ExtraBold',sans-serif] font-extrabold leading-[normal] relative shrink-0 text-[11.192px] text-black text-center w-full">D</p>
    </div>
  );
}

function Label9() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col items-center justify-center relative rounded-[3.731px] shrink-0 size-[18.653px]" data-name="Label">
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[3.731px]" />
      <p className="font-['Literata:ExtraBold',sans-serif] font-extrabold leading-[normal] relative shrink-0 text-[11.192px] text-black text-center w-full">E</p>
    </div>
  );
}

function LabelRow1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[335.751px] items-start justify-between left-[15px] pr-[5.596px] py-[24.249px] top-[141.58px]" data-name="Label row">
      <Label5 />
      <Label6 />
      <Label7 />
      <Label8 />
      <Label9 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[15px] top-[108px]">
      <Component5X />
      <LabelRow />
      <LabelRow1 />
    </div>
  );
}

function Group1() {
  return (
    <div className="-translate-x-1/2 absolute contents left-1/2 top-[108px]">
      <Group />
    </div>
  );
}

function Suspects() {
  return <div className="-translate-x-1/2 absolute h-[64px] left-1/2 top-[-20px] w-[292px]" data-name="Suspects" />;
}

function Frame23() {
  return (
    <div className="absolute bg-[#e6ebed] h-[48px] left-0 top-[627px] w-[390px]">
      <Suspects />
    </div>
  );
}

function Frame25() {
  return (
    <div className="bg-white relative rounded-[4px] shrink-0 size-[19px]">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Clue() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Clue">
      <Frame25 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-black whitespace-nowrap">
        <p className="text-[13px]">
          <span className="[text-decoration-skip-ink:none] decoration-solid font-['Inter:Bold',sans-serif] font-bold leading-[18px] not-italic text-[#4d243d] underline">Ben</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[18px] not-italic">{` `}</span>
          <span className="leading-[18px]">{`was spotted in a `}</span>
          <span className="font-['Inter:Bold',sans-serif] font-bold leading-[18px] not-italic">corner</span>
          <span className="leading-[18px]">{` of the house`}</span>
        </p>
      </div>
    </div>
  );
}

function Frame26() {
  return (
    <div className="bg-white relative rounded-[4px] shrink-0 size-[19px]">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Clue1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Clue">
      <Frame26 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-black whitespace-nowrap">
        <p className="text-[13px]">
          <span className="[text-decoration-skip-ink:none] decoration-solid font-['Inter:Bold',sans-serif] font-bold leading-[18px] not-italic text-[#e3202d] underline">Amy</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[18px] not-italic">{` `}</span>
          <span className="leading-[18px]">{`was seen on the `}</span>
          <span className="font-['Inter:Bold',sans-serif] font-bold leading-[18px] not-italic">outer walls</span>
          <span className="leading-[18px]">{` of the house`}</span>
        </p>
      </div>
    </div>
  );
}

function Frame27() {
  return (
    <div className="bg-white relative rounded-[4px] shrink-0 size-[19px]">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-black whitespace-nowrap">
        <p className="text-[13px]">
          <span className="[text-decoration-skip-ink:none] decoration-solid font-['Inter:Bold',sans-serif] font-bold leading-[18px] not-italic text-[#a25603] underline">Dylan</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[18px] not-italic">{` `}</span>
          <span className="leading-[18px]">{`was spotted in an `}</span>
          <span className="font-['Inter:Bold',sans-serif] font-bold leading-[18px] not-italic">even-numbered column</span>
        </p>
      </div>
    </div>
  );
}

function Clue2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Clue">
      <Frame27 />
      <Text />
    </div>
  );
}

function Frame28() {
  return (
    <div className="bg-white relative rounded-[4px] shrink-0 size-[19px]">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Clue3() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Clue">
      <Frame28 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-black whitespace-nowrap">
        <p className="text-[13px]">
          <span className="[text-decoration-skip-ink:none] decoration-solid font-['Inter:Bold',sans-serif] font-bold leading-[18px] not-italic text-[#055b0f] underline">Eve</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[18px] not-italic">{` `}</span>
          <span className="leading-[18px]">{`was seen in an `}</span>
          <span className="font-['Inter:Bold',sans-serif] font-bold leading-[18px] not-italic">odd-numbered row</span>
        </p>
      </div>
    </div>
  );
}

function Frame24() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[16px] items-start left-1/2 px-[24px] py-[12px] top-[675px] w-[390px]">
      <Clue />
      <Clue1 />
      <Clue2 />
      <Clue3 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute inset-[1.97%_8.14%_1.98%_8.12%]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.7471 19.209">
        <g id="Icon">
          <path d={svgPaths.p1fb2dbf0} fill="var(--fill-0, #FCFCFC)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TextIconContainer() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text + Icon Container">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Undo">
        <Icon1 />
      </div>
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#fcfcfc] text-[15px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Undo</p>
      </div>
    </div>
  );
}

function TextIconContainer1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text + Icon Container">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Hint">
        <div className="absolute inset-[7.52%_6.25%_9.38%_6.25%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5 16.6206">
            <path d={svgPaths.p17129b00} fill="var(--fill-0, #FCFCFC)" id="Vector" stroke="var(--stroke-0, #FCFCFC)" strokeWidth="0.625" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#fcfcfc] text-[15px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Hint</p>
      </div>
    </div>
  );
}

function ButtonsContainer() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex gap-[8px] items-center left-1/2 px-[16px] top-[492px] w-[390px]" data-name="Buttons Container">
      <div className="bg-[#01394b] flex-[1_0_0] h-[36px] min-h-px min-w-px relative rounded-[50px]" data-name="Puzzle Button/Icon + Text/S">
        <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[50px] shadow-[0px_2px_0px_0px_#678893]" />
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] py-[8px] relative size-full">
            <TextIconContainer />
          </div>
        </div>
      </div>
      <div className="bg-[#01394b] flex-[1_0_0] h-[36px] min-h-px min-w-px relative rounded-[50px]" data-name="Puzzle Button/Icon + Text/S">
        <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[50px] shadow-[0px_2px_0px_0px_#678893]" />
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] py-[8px] relative size-full">
            <TextIconContainer1 />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Game() {
  return (
    <div className="bg-[#fcfcfc] relative size-full" data-name="Game 2">
      <div className="-translate-x-1/2 absolute bottom-0 h-[21px] left-1/2 w-[390px]" data-name="Home Indicator">
        <div className="-translate-x-1/2 absolute backdrop-blur-[32px] bg-[rgba(0,0,0,0.4)] bottom-[8px] h-[5px] left-1/2 rounded-[100px] w-[134px]" data-name="Blur Surface" />
        <div className="-translate-x-1/2 absolute backdrop-blur-[2px] bg-[rgba(255,255,255,0.8)] bottom-[8px] h-[5px] left-1/2 mix-blend-exclusion rounded-[100px] w-[134px]" data-name="Home Indicator" />
      </div>
      <Header />
      <Group1 />
      <Frame23 />
      <Frame24 />
      <ButtonsContainer />
    </div>
  );
}