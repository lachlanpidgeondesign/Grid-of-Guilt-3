import svgPaths from "./svg-v4vc9c4n3n";

function HeadingContainer() {
  return (
    <div className="content-stretch flex flex-col font-bold gap-[16px] items-center relative shrink-0 text-[#191919] text-center w-full" data-name="Heading Container">
      <p className="font-['Literata:Bold',sans-serif] leading-[34px] relative shrink-0 text-[24px] whitespace-nowrap">Tutorial</p>
      <p className="font-['Inter:Bold',sans-serif] leading-[21px] min-w-full not-italic relative shrink-0 text-[16px] w-[min-content]">The rules</p>
    </div>
  );
}

function EvenColumn() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Even Column">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-black whitespace-nowrap">
        <p className="leading-[25px]">row</p>
      </div>
      <div className="flex items-center justify-center relative shrink-0 size-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="relative size-[16px]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <path clipRule="evenodd" d={svgPaths.p18ce9300} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Rule() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="Rule">
      <ol className="block font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#191919] text-[20px] whitespace-nowrap" start="1">
        <li className="ms-[30px]">
          <span className="leading-[25px]">Only 1 suspect per</span>
        </li>
      </ol>
      <EvenColumn />
    </div>
  );
}

function EvenColumn1() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Even Column">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-black whitespace-nowrap">
        <p className="leading-[25px]">column</p>
      </div>
      <div className="relative shrink-0 size-[16px]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <path clipRule="evenodd" d={svgPaths.p18ce9300} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Rule1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Rule">
      <ol className="block font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#191919] text-[20px] whitespace-nowrap" start="2">
        <li className="ms-[30px]">
          <span className="leading-[25px]">Only 1 suspect per</span>
        </li>
      </ol>
      <EvenColumn1 />
    </div>
  );
}

function Group1() {
  return (
    <div className="h-[16px] relative shrink-0 w-[11.2px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.2001 16">
        <g id="Group 48717">
          <path d={svgPaths.p173c46e0} fill="var(--fill-0, black)" id="Vector" />
          <path d={svgPaths.p19542d00} fill="var(--fill-0, black)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function EvenColumn2() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Even Column">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-black whitespace-nowrap">
        <p className="leading-[25px]">room</p>
      </div>
      <Group1 />
    </div>
  );
}

function Rule2() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Rule">
      <ol className="block font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#191919] text-[20px] whitespace-nowrap" start="3">
        <li className="ms-[30px]">
          <span className="leading-[25px]">Only 1 suspect per</span>
        </li>
      </ol>
      <EvenColumn2 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[6.25%]" data-name="Group">
      <div className="absolute inset-[-3.57%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.0002 15">
          <g id="Group">
            <path d={svgPaths.p1663fc00} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.p2e7a6280} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function StreamlinePlumpNoTouchSign() {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]" data-name="streamline-plump:no-touch-sign">
      <Group />
    </div>
  );
}

function EvenColumn3() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Even Column">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-black whitespace-nowrap">
        <p className="leading-[25px]">touch</p>
      </div>
      <StreamlinePlumpNoTouchSign />
    </div>
  );
}

function Rule3() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Rule">
      <ol className="block font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#191919] text-[20px] whitespace-nowrap" start="4">
        <li className="ms-[30px]">
          <span className="leading-[25px]">No suspects can</span>
        </li>
      </ol>
      <EvenColumn3 />
    </div>
  );
}

function Rules() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[25px] items-start pl-[12px] pr-[20px] py-[20px] relative rounded-[8px] shrink-0" data-name="Rules">
      <div aria-hidden="true" className="absolute border border-[#ccc] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_3px_0px_0px_#ccc]" />
      <Rule />
      <Rule1 />
      <Rule2 />
      <Rule3 />
    </div>
  );
}

function TutorialContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center max-w-[500px] relative shrink-0 w-full" data-name="Tutorial Container">
      <HeadingContainer />
      <Rules />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[21px] min-w-full not-italic relative shrink-0 text-[#191919] text-[16px] text-center w-[min-content]">There is only one right answer, and no guessing is needed.</p>
    </div>
  );
}

export default function Tutorial() {
  return (
    <div className="bg-[#f9f7f6] content-stretch flex flex-col items-center p-[20px] relative size-full" data-name="Tutorial">
      <TutorialContainer />
    </div>
  );
}