import svgPaths from "./svg-wnpihame4u";
import imgSubtract from "figma:asset/11b5ce8aa84fd3a9434dff203971b2be0db80ee7.png";
import imgImage27 from "figma:asset/40949af142d0a45ea7a0c2919adabdad5c476997.png";

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[60px] ml-0 mt-0 relative row-1 w-[200.893px]" data-name="Subtract">
        <img alt="" className="absolute block max-w-none size-full" height="60" src={imgSubtract} width="200.893" />
      </div>
    </div>
  );
}

function CrimeDeskContainer() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Crime Desk Container">
      <Group />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] min-w-full not-italic relative shrink-0 text-[#fcfcfc] text-[15px] text-center w-[min-content]">Presents</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="h-[150px] relative shadow-[0px_6.227px_0px_0px_#678893] shrink-0 w-[167.994px]">
      <div className="absolute h-[64.673px] left-[96.88px] top-[5.01px] w-[64.258px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64.2582 64.6725">
          <path d={svgPaths.p1e378000} fill="var(--fill-0, #01394B)" id="Vector 127" />
        </svg>
      </div>
      <div className="absolute h-[90.578px] left-[8.96px] top-[50.64px] w-[128.796px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 128.796 90.5785">
          <path d={svgPaths.p28fd6580} fill="var(--fill-0, #E6EBED)" id="Vector 126" />
        </svg>
      </div>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 167.994 150">
        <path d={svgPaths.p113b1380} fill="var(--fill-0, #678893)" id="Vector" />
      </svg>
      <div className="absolute h-[920px] left-[326px] top-[-616px] w-[1558px]" data-name="image 27">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage27} />
      </div>
    </div>
  );
}

function TextContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center justify-center relative shrink-0 text-[#fcfcfc] text-center whitespace-nowrap" data-name="Text Container">
      <p className="font-['Literata:ExtraBold',sans-serif] font-extrabold leading-[41px] relative shrink-0 text-[40px]">Grid of Guilt</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[15px]">Place the suspects. Find the murderer</p>
    </div>
  );
}

function PuzzleStartContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center relative shrink-0 w-full" data-name="Puzzle Start Container">
      <Frame />
      <TextContainer />
      <div className="bg-[#fcfcfc] content-stretch flex items-center justify-center px-[24px] py-[12px] relative rounded-[50px] shrink-0 w-[129px]" data-name="System Button">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191919] text-[15px] text-center whitespace-nowrap">
          <p className="leading-[20px]">Start game</p>
        </div>
      </div>
    </div>
  );
}

function StartGameContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[56px] items-center relative shrink-0 w-[278px]" data-name="Start Game Container">
      <CrimeDeskContainer />
      <PuzzleStartContainer />
    </div>
  );
}

export default function Intro() {
  return (
    <div className="bg-[#01394b] content-stretch flex items-center justify-center relative size-full" data-name="Intro">
      <StartGameContainer />
    </div>
  );
}