import svgPaths from "./svg-xidhpk336g";
import imgKitchen2 from "figma:asset/9104999f932b07a5050d85863767ef76ed9b8e15.png";
import imgHall2 from "figma:asset/97798e672f287290b8b3ebd22e7872d802818fc1.png";
import imgBathroom21 from "figma:asset/34b2ff7499c55faf6a79d53dffadcccefbb227b7.png";
import imgImage24 from "figma:asset/6bdc180aa5e05c3ba389fbac3599c491940173f2.png";
import imgStudy22 from "figma:asset/7cde95b866ca537e31bc0f215294f33698b82be1.png";
import imgBedroom21 from "figma:asset/4a466bdc58ef88612b0027afdd441e2ca60b2f77.png";

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

function Frame() {
  return (
    <div className="h-[28px] relative shrink-0 w-[31.359px]">
      <div className="absolute inset-[0_0_-4.15%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31.3591 29.1624">
          <g filter="url(#filter0_d_2_267)" id="Frame 1984078366">
            <path d={svgPaths.p28515100} fill="var(--fill-0, #01394B)" id="Vector 127" />
            <path d={svgPaths.p3724a900} fill="var(--fill-0, #E6EBED)" id="Vector 126" />
            <path d={svgPaths.p29ae6fc0} fill="var(--fill-0, #678893)" id="Vector" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="29.1624" id="filter0_d_2_267" width="31.3591" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1.16237" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.403922 0 0 0 0 0.533333 0 0 0 0 0.576471 0 0 0 1 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_2_267" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_2_267" mode="normal" result="shape" />
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
    <div className="bg-[#fcfcfc] content-stretch flex gap-[6px] h-[28px] items-center px-[8px] py-[6px] relative rounded-[99px] shrink-0" data-name="Button">
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
    <div className="content-stretch flex items-center justify-end relative shrink-0" data-name="RH Container">
      <Button />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-between max-w-[500px] min-h-px min-w-px relative" data-name="Container">
      <LhContainer />
      <Frame />
      <RhContainer />
    </div>
  );
}

function PuzzleHeader() {
  return (
    <div className="bg-[#01394b] h-[44px] relative shrink-0 w-full" data-name="Puzzle Header">
      <div aria-hidden="true" className="absolute border-[#678893] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] py-[8px] relative size-full">
          <Container />
        </div>
      </div>
    </div>
  );
}

function Cell() {
  return (
    <div className="absolute bg-[#dde0ff] left-[71.6px] min-h-[40px] min-w-[40px] size-[71.6px] top-0" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell1() {
  return (
    <div className="absolute bg-[#dde0ff] left-[143.2px] min-h-[40px] min-w-[40px] size-[71.6px] top-0" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell2() {
  return (
    <div className="absolute bg-[#dde0ff] left-[143.2px] min-h-[40px] min-w-[40px] size-[71.6px] top-[71.6px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Murder() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Murder">
      <div className="absolute inset-[-2.59%_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32.8276">
          <g id="Murder">
            <g filter="url(#filter0_d_2_302)" id="Vector">
              <path d={svgPaths.p39701f80} fill="var(--fill-0, #E3E3E3)" />
              <path d={svgPaths.p39701f80} stroke="var(--stroke-0, #191919)" strokeWidth="1.65517" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.7356" id="filter0_d_2_302" width="31.0805" x="0.461207" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1.65517" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.2 0 0 0 0 0.2 0 0 0 0 0.2 0 0 0 1 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_2_302" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_2_302" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Cell3() {
  return (
    <div className="absolute bg-[#dde0ff] left-[214.8px] min-h-[40px] min-w-[40px] rounded-tr-[7.956px] size-[71.6px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[8px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Murder />
      </div>
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none rounded-tr-[8.456px]" />
    </div>
  );
}

function Cell4() {
  return (
    <div className="absolute bg-[#dde0ff] left-0 min-h-[40px] min-w-[40px] size-[71.6px] top-0" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function CellContainer() {
  return (
    <div className="h-[143.2px] relative shrink-0 w-full" data-name="Cell Container">
      <Cell />
      <Cell1 />
      <Cell2 />
      <Cell3 />
      <Cell4 />
      <div className="absolute inset-[0_0_-0.7%_0]" data-name="Border">
        <div className="absolute inset-[-1.03%_-0.52%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 289.387 147.183">
            <path d={svgPaths.p322e1800} fill="var(--stroke-0, black)" id="Border" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function KitchenContainer() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.956px] items-start right-0 top-0 w-[286.4px]" data-name="Kitchen Container">
      <CellContainer />
      <div className="-translate-x-1/2 absolute h-[23.867px] left-[calc(50%+0.07px)] top-[-12.93px] w-[71.74px]" data-name="Kitchen 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgKitchen2} />
      </div>
    </div>
  );
}

function Cell5() {
  return (
    <div className="absolute bg-[#dbedff] left-[143.2px] min-h-[40px] min-w-[40px] size-[71.6px] top-0" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell6() {
  return (
    <div className="absolute bg-[#dbedff] left-[286.4px] min-h-[40px] min-w-[40px] size-[71.6px] top-0" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell7() {
  return (
    <div className="absolute bg-[#dbedff] left-0 min-h-[40px] min-w-[40px] size-[71.6px] top-[71.6px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell8() {
  return (
    <div className="absolute bg-[#dbedff] left-[143.2px] min-h-[40px] min-w-[40px] size-[71.6px] top-[71.6px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell9() {
  return (
    <div className="absolute bg-[#dbedff] left-[214.8px] min-h-[40px] min-w-[40px] size-[71.6px] top-[71.6px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell10() {
  return (
    <div className="absolute bg-[#dbedff] left-[286.4px] min-h-[40px] min-w-[40px] size-[71.6px] top-[71.6px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell11() {
  return (
    <div className="absolute bg-[#dbedff] left-0 min-h-[40px] min-w-[40px] size-[71.6px] top-[143.2px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell12() {
  return (
    <div className="absolute bg-[#dbedff] left-[71.6px] min-h-[40px] min-w-[40px] size-[71.6px] top-[143.2px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell13() {
  return (
    <div className="absolute bg-[#dbedff] left-[143.2px] min-h-[40px] min-w-[40px] size-[71.6px] top-[143.2px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell14() {
  return (
    <div className="absolute bg-[#dbedff] left-0 min-h-[40px] min-w-[40px] rounded-bl-[7.956px] size-[71.6px] top-[214.8px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none rounded-bl-[8.456px]" />
    </div>
  );
}

function Cell15() {
  return (
    <div className="absolute bg-[#dbedff] left-[71.6px] min-h-[40px] min-w-[40px] size-[71.6px] top-[214.8px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell16() {
  return (
    <div className="absolute bg-[#dbedff] left-[143.2px] min-h-[40px] min-w-[40px] size-[71.6px] top-[214.8px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell17() {
  return (
    <div className="absolute bg-[#dbedff] left-[214.8px] min-h-[40px] min-w-[40px] size-[71.6px] top-[214.8px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell18() {
  return (
    <div className="absolute bg-[#dbedff] left-[286.4px] min-h-[40px] min-w-[40px] rounded-br-[7.956px] size-[71.6px] top-[214.8px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none rounded-br-[8.456px]" />
    </div>
  );
}

function Cell19() {
  return (
    <div className="absolute bg-[#dbedff] left-[143.2px] min-h-[40px] min-w-[40px] size-[71.6px] top-0" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell20() {
  return (
    <div className="absolute bg-[#dbedff] left-[286.4px] min-h-[40px] min-w-[40px] size-[71.6px] top-0" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell21() {
  return (
    <div className="absolute bg-[#dbedff] left-0 min-h-[40px] min-w-[40px] size-[71.6px] top-[71.6px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell22() {
  return (
    <div className="absolute bg-[#dbedff] left-[143.2px] min-h-[40px] min-w-[40px] size-[71.6px] top-[71.6px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell23() {
  return (
    <div className="absolute bg-[#dbedff] left-[214.8px] min-h-[40px] min-w-[40px] size-[71.6px] top-[71.6px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell24() {
  return (
    <div className="absolute bg-[#dbedff] left-[286.4px] min-h-[40px] min-w-[40px] size-[71.6px] top-[71.6px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell25() {
  return (
    <div className="absolute bg-[#dbedff] left-0 min-h-[40px] min-w-[40px] size-[71.6px] top-[143.2px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell26() {
  return (
    <div className="absolute bg-[#dbedff] left-[71.6px] min-h-[40px] min-w-[40px] size-[71.6px] top-[143.2px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell27() {
  return (
    <div className="absolute bg-[#dbedff] left-[143.2px] min-h-[40px] min-w-[40px] size-[71.6px] top-[143.2px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function CellContainer1() {
  return (
    <div className="h-[286.4px] relative shrink-0 w-full" data-name="Cell Container">
      <Cell5 />
      <Cell6 />
      <Cell7 />
      <Cell8 />
      <Cell9 />
      <Cell10 />
      <Cell11 />
      <Cell12 />
      <Cell13 />
      <Cell14 />
      <Cell15 />
      <Cell16 />
      <Cell17 />
      <Cell18 />
      <Cell19 />
      <Cell20 />
      <Cell21 />
      <Cell22 />
      <Cell23 />
      <Cell24 />
      <Cell25 />
      <Cell26 />
      <Cell27 />
      <div className="absolute inset-[0_0_-0.35%_0]" data-name="Border">
        <div className="absolute inset-[-0.52%_-0.42%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 360.985 290.383">
            <path d={svgPaths.p15a07b80} fill="var(--stroke-0, black)" id="Border" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function HallContainer() {
  return (
    <div className="-translate-x-1/2 absolute bottom-0 content-stretch flex flex-col gap-[7.956px] items-start left-1/2 w-[358px]" data-name="Hall Container">
      <CellContainer1 />
      <div className="-translate-y-1/2 absolute aspect-[350/171] left-[43%] right-[43.36%] top-[calc(50%-143.2px)]" data-name="Hall 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHall2} />
      </div>
    </div>
  );
}

function Cell28() {
  return (
    <div className="bg-[#ccf5eb] min-h-[40px] min-w-[40px] relative shrink-0 size-[71.6px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell29() {
  return (
    <div className="bg-[#ccf5eb] min-h-[40px] min-w-[40px] relative shrink-0 size-[71.6px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function CellContainer2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Cell Container">
      <div className="content-stretch flex items-end overflow-clip relative rounded-[inherit] w-full">
        <Cell28 />
        <Cell29 />
      </div>
      <div aria-hidden="true" className="absolute border-[#191919] border-[2.983px] border-solid inset-[-1.492px] pointer-events-none" />
    </div>
  );
}

function BathroomContainer() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[214.8px] top-[214.8px] w-[143.2px]" data-name="Bathroom Container">
      <CellContainer2 />
      <div className="-translate-y-1/2 absolute aspect-[306/86] left-[20.35%] right-[20.35%] top-[calc(50%-35.8px)]" data-name="Bathroom - 2 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgBathroom21} />
      </div>
    </div>
  );
}

function Eve() {
  return (
    <div className="bg-[#f5f5f5] overflow-clip relative rounded-[8px] shrink-0 size-[32px]" data-name="Eve">
      <div className="absolute left-0 size-[32px] top-0" data-name="image 24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[378.38%] left-[-10.81%] max-w-none top-[-229.73%] w-[614.86%]" src={imgImage24} />
        </div>
      </div>
      <div className="absolute h-[8.333px] left-[0.33px] top-[24px] w-[31.667px]">
        <div className="absolute inset-[-2.66%_-0.53%_-2%_-0.53%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 8.72164">
            <path d={svgPaths.p34b2e6c0} fill="var(--fill-0, #055B0F)" id="Vector 136" stroke="var(--stroke-0, #055B0F)" strokeWidth="0.333333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function EveTile() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[4px] items-center justify-center relative rounded-[8px] shrink-0 size-[64px]" data-name="Eve Tile">
      <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_0px_0px_#678893]" />
      <Eve />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#055b0f] text-[16px] text-center w-[min-content]">
        <p className="leading-[21px]">Eve</p>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute h-[107.4px] left-[-17.9px] top-[-17.9px] w-[107.398px]">
      <div className="absolute inset-[-1.96%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 111.618 111.619">
          <g id="Group 48716">
            <path d={svgPaths.p3837ba00} id="Vector 134" stroke="var(--stroke-0, #FF0000)" strokeWidth="5.96667" />
            <path d={svgPaths.p25ffc00} id="Vector 135" stroke="var(--stroke-0, #FF0000)" strokeWidth="5.96667" />
            <path d={svgPaths.p335aff00} id="Vector 132" stroke="var(--stroke-0, #FF0000)" strokeWidth="5.96667" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Wrong() {
  return (
    <div className="-translate-y-1/2 absolute left-0 overflow-clip size-[71.6px] top-1/2" data-name="Wrong">
      <Group />
    </div>
  );
}

function Cell30() {
  return (
    <div className="absolute bg-[#f6d6e5] left-0 min-h-[40px] min-w-[40px] size-[71.6px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-[8px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <EveTile />
        <Wrong />
      </div>
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell31() {
  return (
    <div className="absolute bg-[#f6d6e5] left-0 min-h-[40px] min-w-[40px] size-[71.6px] top-[71.6px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function CellContainer3() {
  return (
    <div className="h-[143.2px] relative rounded-tl-[7.956px] shrink-0 w-[71.6px]" data-name="Cell Container">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Cell30 />
        <Cell31 />
      </div>
      <div aria-hidden="true" className="absolute border-[2.983px] border-black border-solid inset-[-1.492px] pointer-events-none rounded-tl-[9.448px]" />
    </div>
  );
}

function StudyContainer() {
  return (
    <div className="absolute content-stretch flex gap-[7.956px] items-center left-0 top-0" data-name="Study Container">
      <CellContainer3 />
      <div className="-translate-y-1/2 absolute h-[23.867px] left-[7.24px] top-[calc(50%-71.6px)] w-[56.336px]" data-name="Study - 2 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgStudy22} />
      </div>
    </div>
  );
}

function Amy() {
  return (
    <div className="bg-[#f5f5f5] overflow-clip relative rounded-[8px] shrink-0 size-[32px]" data-name="Amy">
      <div className="absolute left-0 rounded-[5.333px] size-[32px] top-0" data-name="image 24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[5.333px]">
          <img alt="" className="absolute h-[378.38%] left-[-109.46%] max-w-none top-[-229.73%] w-[614.86%]" src={imgImage24} />
        </div>
      </div>
    </div>
  );
}

function AmyTile() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[4px] items-center justify-center relative rounded-[8px] shrink-0 size-[64px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border border-[#ccc] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_0px_0px_#ccc]" />
      <Amy />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#e3202d] text-[16px] text-center w-[min-content]">
        <p className="leading-[21px]">Amy</p>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute h-[107.4px] left-[-17.9px] top-[-17.9px] w-[107.398px]">
      <div className="absolute inset-[-1.96%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 111.618 111.619">
          <g id="Group 48716">
            <path d={svgPaths.p3837ba00} id="Vector 134" stroke="var(--stroke-0, #FF0000)" strokeWidth="5.96667" />
            <path d={svgPaths.p25ffc00} id="Vector 135" stroke="var(--stroke-0, #FF0000)" strokeWidth="5.96667" />
            <path d={svgPaths.p335aff00} id="Vector 132" stroke="var(--stroke-0, #FF0000)" strokeWidth="5.96667" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Wrong1() {
  return (
    <div className="absolute left-0 overflow-clip size-[71.6px] top-[0.4px]" data-name="Wrong">
      <Group1 />
    </div>
  );
}

function Cell32() {
  return (
    <div className="absolute bg-[#fdeed8] left-0 min-h-[40px] min-w-[40px] size-[71.6px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-[8px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <AmyTile />
        <Wrong1 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function Cell33() {
  return (
    <div className="absolute bg-[#fdeed8] left-0 min-h-[40px] min-w-[40px] size-[71.6px] top-[71.6px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-[-0.5px] pointer-events-none" />
    </div>
  );
}

function CellContainer4() {
  return (
    <div className="h-[143.2px] relative shrink-0 w-[71.6px]" data-name="Cell Container">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Cell32 />
        <Cell33 />
      </div>
      <div aria-hidden="true" className="absolute border-[2.983px] border-black border-solid inset-[-1.492px] pointer-events-none" />
    </div>
  );
}

function BedroomContainer() {
  return (
    <div className="absolute content-stretch flex items-center left-[71.6px] top-[71.6px]" data-name="Bedroom Container">
      <CellContainer4 />
      <div className="-translate-y-1/2 absolute aspect-[275/86] left-[-3.62%] right-[-2.97%] top-[calc(50%-71.6px)]" data-name="Bedroom - 2 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgBedroom21} />
      </div>
    </div>
  );
}

function Grid() {
  return (
    <div className="relative shadow-[0px_3.978px_0px_0px_#191919] shrink-0 size-[358px]" data-name="Grid">
      <KitchenContainer />
      <HallContainer />
      <BathroomContainer />
      <StudyContainer />
      <BedroomContainer />
    </div>
  );
}

function GridContainer() {
  return (
    <div className="relative shrink-0 w-full" data-name="Grid Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[16px] relative w-full">
          <Grid />
        </div>
      </div>
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
    <div className="max-w-[500px] relative shrink-0 w-full" data-name="Buttons Container">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center max-w-[inherit] px-[16px] relative w-full">
          <div className="bg-[#01394b] flex-[1_0_0] h-[36px] min-h-px min-w-px opacity-30 relative rounded-[50px]" data-name="Puzzle Button/Icon + Text/S">
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
      </div>
    </div>
  );
}

function Amy1() {
  return (
    <div className="overflow-clip relative rounded-[8px] shrink-0 size-[32px]" data-name="Amy">
      <div className="absolute left-0 rounded-[5.333px] size-[32px] top-0" data-name="image 24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[5.333px]">
          <img alt="" className="absolute h-[378.38%] left-[-109.46%] max-w-none top-[-229.73%] w-[614.86%]" src={imgImage24} />
        </div>
      </div>
    </div>
  );
}

function AmyTile1() {
  return (
    <div className="bg-[#fcfcfc] content-stretch flex flex-col gap-[4px] items-center justify-center relative rounded-[8px] shrink-0 size-[64px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_0px_0px_#678893]" />
      <Amy1 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#e3202d] text-[16px] text-center w-[min-content]">
        <p className="leading-[21px]">Amy</p>
      </div>
    </div>
  );
}

function DylanTile() {
  return (
    <div className="relative rounded-[8px] shrink-0 size-[32px]" data-name="Dylan Tile">
      <div className="absolute left-0 rounded-[5.333px] size-[32px] top-0" data-name="image 18">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[5.333px]">
          <img alt="" className="absolute h-[378.38%] left-[-108.11%] max-w-none top-[-120.27%] w-[614.86%]" src={imgImage24} />
        </div>
      </div>
    </div>
  );
}

function AmyTile2() {
  return (
    <div className="bg-[#fcfcfc] content-stretch flex flex-col gap-[4px] items-center justify-center relative rounded-[8px] shrink-0 size-[64px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_0px_0px_#678893]" />
      <DylanTile />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#a25603] text-[16px] text-center w-[min-content]">
        <p className="leading-[21px]">Dylan</p>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute left-0 rounded-[8px] size-[32px] top-0">
      <div className="absolute left-0 rounded-[5.333px] size-[32px] top-0" data-name="image 24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[5.333px]">
          <img alt="" className="absolute h-[378.38%] left-[-504.05%] max-w-none top-[-229.73%] w-[614.86%]" src={imgImage24} />
        </div>
      </div>
    </div>
  );
}

function DylanTile1() {
  return (
    <div className="relative rounded-[8px] shrink-0 size-[32px]" data-name="Dylan Tile">
      <Frame1 />
    </div>
  );
}

function AmyTile3() {
  return (
    <div className="bg-[#fcfcfc] content-stretch flex flex-col gap-[4px] items-center justify-center relative rounded-[8px] shrink-0 size-[64px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_0px_0px_#678893]" />
      <DylanTile1 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#4d243d] text-[16px] text-center w-[min-content]">
        <p className="leading-[21px]">Ben</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute left-0 rounded-[8px] size-[32px] top-0">
      <div className="absolute left-0 rounded-[8px] size-[32px] top-0" data-name="image 25">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[8px]">
          <img alt="" className="absolute h-[378.38%] left-[-208.11%] max-w-none top-[-229.73%] w-[614.86%]" src={imgImage24} />
        </div>
      </div>
    </div>
  );
}

function DylanTile2() {
  return (
    <div className="relative rounded-[8px] shrink-0 size-[32px]" data-name="Dylan Tile">
      <Frame2 />
    </div>
  );
}

function AmyTile4() {
  return (
    <div className="bg-[#fcfcfc] content-stretch flex flex-col gap-[4px] items-center justify-center relative rounded-[8px] shrink-0 size-[64px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_0px_0px_#678893]" />
      <DylanTile2 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#0071cb] text-[16px] text-center w-[min-content]">
        <p className="leading-[21px]">Jess</p>
      </div>
    </div>
  );
}

function Suspects() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex gap-[12px] items-center left-1/2 top-[-24px] w-[292px]" data-name="Suspects">
      <AmyTile1 />
      <AmyTile2 />
      <AmyTile3 />
      <AmyTile4 />
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-[#e6ebed] h-[48px] relative shrink-0 w-full" data-name="Container">
      <Suspects />
    </div>
  );
}

function SuspectTray() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[500px] pt-[32px] relative shrink-0 w-full" data-name="Suspect Tray">
      <Container1 />
    </div>
  );
}

function Error() {
  return (
    <div className="bg-[#ffcbcb] relative rounded-[8px] shrink-0 w-full" data-name="Error">
      <div aria-hidden="true" className="absolute border border-[red] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] min-h-px min-w-px not-italic relative text-[15px] text-black">Oops! Each suspect cannot touch</p>
        </div>
      </div>
    </div>
  );
}

function Checkbox() {
  return (
    <div className="bg-[#fcfcfc] relative rounded-[4px] shrink-0" data-name="Checkbox">
      <div className="content-stretch flex items-center overflow-clip p-[3px] relative rounded-[inherit]">
        <div className="overflow-clip shrink-0 size-[13px]" data-name="ico-tick" />
      </div>
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Clue() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Clue">
      <Checkbox />
      <div className="flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px not-italic relative text-[0px] text-black">
        <p className="text-[13px]">
          <span className="[text-decoration-skip-ink:none] decoration-solid font-['Inter:Bold',sans-serif] font-bold leading-[18px] text-[#e3202d] underline">Amy</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[18px]">{` must be in an even column`}</span>
        </p>
      </div>
    </div>
  );
}

function Checkbox1() {
  return (
    <div className="bg-[#fcfcfc] relative rounded-[4px] shrink-0" data-name="Checkbox">
      <div className="content-stretch flex items-center overflow-clip p-[3px] relative rounded-[inherit]">
        <div className="overflow-clip shrink-0 size-[13px]" data-name="ico-tick" />
      </div>
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-center min-h-px min-w-px relative" data-name="Text">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-black whitespace-nowrap">
        <p className="text-[13px]">
          <span className="[text-decoration-skip-ink:none] decoration-solid font-['Inter:Bold',sans-serif] font-bold leading-[18px] text-[#a25603] underline">Dylan</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[18px]">{` must be in the`}</span>
        </p>
      </div>
      <div className="h-[20px] relative shrink-0 w-[40.936px]" data-name="Hall 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHall2} />
      </div>
    </div>
  );
}

function Clue1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Clue">
      <Checkbox1 />
      <Text />
    </div>
  );
}

function Checkbox2() {
  return (
    <div className="bg-[#fcfcfc] relative rounded-[4px] shrink-0" data-name="Checkbox">
      <div className="content-stretch flex items-center overflow-clip p-[3px] relative rounded-[inherit]">
        <div className="overflow-clip shrink-0 size-[13px]" data-name="ico-tick" />
      </div>
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Clue2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Clue">
      <Checkbox2 />
      <div className="flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px not-italic relative text-[0px] text-black">
        <p className="text-[13px]">
          <span className="[text-decoration-skip-ink:none] decoration-solid font-['Inter:Bold',sans-serif] font-bold leading-[18px] text-[#4d243d] underline">Ben</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[18px]">{` must be above `}</span>
          <span className="[text-decoration-skip-ink:none] decoration-solid font-['Inter:Bold',sans-serif] font-bold leading-[18px] text-[#e3202d] underline">Amy</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[18px]">{` in the house`}</span>
        </p>
      </div>
    </div>
  );
}

function Checkbox3() {
  return (
    <div className="bg-[#fcfcfc] relative rounded-[4px] shrink-0" data-name="Checkbox">
      <div className="content-stretch flex items-center overflow-clip p-[3px] relative rounded-[inherit]">
        <div className="overflow-clip shrink-0 size-[13px]" data-name="ico-tick" />
      </div>
      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Clue3() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Clue">
      <Checkbox3 />
      <div className="flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px not-italic relative text-[0px] text-black">
        <p className="text-[13px]">
          <span className="[text-decoration-skip-ink:none] decoration-solid font-['Inter:Bold',sans-serif] font-bold leading-[18px] text-[#0071cb] underline">Jess</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[18px]">{` must be on the edge of the house`}</span>
        </p>
      </div>
    </div>
  );
}

function ClueContainer() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] h-[113px] items-start min-h-px min-w-px relative" data-name="Clue container">
      <Error />
      <Clue />
      <Clue1 />
      <Clue2 />
      <Clue3 />
    </div>
  );
}

function ScrollBar() {
  return (
    <div className="bg-[#e6ebed] relative rounded-[99px] self-stretch shrink-0 w-[6px]" data-name="Scroll bar">
      <div className="-translate-x-1/2 absolute bg-[#678893] bottom-[39.82%] left-1/2 rounded-[99px] top-0 w-[6px]" data-name="Scroller" />
    </div>
  );
}

function Frame3() {
  return (
    <div className="max-w-[390px] relative shrink-0 w-full">
      <div className="content-stretch flex gap-[16px] items-start max-w-[inherit] pl-[16px] pr-[8px] relative w-full">
        <ClueContainer />
        <ScrollBar />
      </div>
    </div>
  );
}

function GameContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center justify-center pb-[16px] pt-[24px] relative shrink-0 w-full" data-name="Game Container">
      <GridContainer />
      <ButtonsContainer />
      <SuspectTray />
      <Frame3 />
    </div>
  );
}

export default function Start() {
  return (
    <div className="bg-[#fcfcfc] content-stretch flex flex-col items-center justify-center relative size-full" data-name="Start">
      <PuzzleHeader />
      <GameContainer />
    </div>
  );
}