import svgPaths from "./svg-2efs1myuhm";
import imgImage18 from "figma:asset/6bdc180aa5e05c3ba389fbac3599c491940173f2.png";
import imgImage31 from "figma:asset/c88f951204d36c25219b109b767f6479e4eb9af4.png";
import imgHallTutorial from "figma:asset/133a0546f85dcedc191833d094e034ec119aeda6.png";

function DylanTile() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[4.006px] shrink-0 size-[16.023px]" data-name="Dylan Tile">
      <div className="absolute left-0 rounded-[2.671px] size-[16.023px] top-0" data-name="image 18">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.671px]">
          <img alt="" className="absolute h-[378.38%] left-[-503.07%] max-w-none top-[-16.61%] w-[614.86%]" src={imgImage18} />
        </div>
      </div>
    </div>
  );
}

function AmyTile() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[2.003px] items-center justify-center relative rounded-[4.006px] shrink-0 size-[32.046px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border-[#678893] border-[0.501px] border-solid inset-0 pointer-events-none rounded-[4.006px] shadow-[0px_0.501px_0px_0px_#678893]" />
      <DylanTile />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#a25603] text-[8.012px] text-center w-[min-content]">
        <p className="leading-[10.515px]">Tom</p>
      </div>
    </div>
  );
}

function Cell() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[74.45px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[74.45px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-[4.159265995025635px_4.159px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <AmyTile />
        <div className="absolute left-0 size-[37.225px] top-0" data-name="image 31">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage31} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell1() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[74.45px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[37.23px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[4.159265995025635px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute left-0 size-[37.225px] top-0" data-name="image 31">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage31} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Amy() {
  return (
    <div className="bg-[#f5f5f5] overflow-clip relative rounded-[4.006px] shrink-0 size-[16.023px]" data-name="Amy">
      <div className="absolute left-0 rounded-[2.671px] size-[16.023px] top-0" data-name="image 24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.671px]">
          <img alt="" className="absolute h-[378.38%] left-[-109.85%] max-w-none top-[-19.07%] w-[614.86%]" src={imgImage18} />
        </div>
      </div>
    </div>
  );
}

function AmyTile1() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[2.003px] items-center justify-center relative rounded-[4.006px] shrink-0 size-[32.046px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border-[#678893] border-[0.501px] border-solid inset-0 pointer-events-none rounded-[4.006px] shadow-[0px_0.501px_0px_0px_#678893]" />
      <Amy />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#e3202d] text-[8.012px] text-center w-[min-content]">
        <p className="leading-[10.515px]">Ella</p>
      </div>
    </div>
  );
}

function Cell2() {
  return (
    <div className="absolute bg-[#ffd4d4] left-0 min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-[4.159265995025635px_4.159px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <AmyTile1 />
        <div className="absolute left-0 size-[37.225px] top-0" data-name="image 31">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage31} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell3() {
  return (
    <div className="absolute bg-[#ffd4d4] left-0 min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[37.23px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell4() {
  return (
    <div className="absolute bg-[#ffd4d4] left-0 min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[74.45px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell5() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[37.55px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[4.159265995025635px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute left-0 size-[37.225px] top-0" data-name="image 31">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage31} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute bg-[#f5f5f5] left-0 rounded-[4.006px] size-[16.023px] top-0">
      <div className="absolute left-0 rounded-[2.671px] size-[16.023px] top-0" data-name="image 24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.671px]">
          <img alt="" className="absolute h-[378.38%] left-[-306.31%] max-w-none top-[-124.94%] w-[614.86%]" src={imgImage18} />
        </div>
      </div>
    </div>
  );
}

function DylanTile1() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[4.006px] shrink-0 size-[16.023px]" data-name="Dylan Tile">
      <Frame />
    </div>
  );
}

function AmyTile2() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[2.003px] items-center justify-center relative rounded-[4.006px] shrink-0 size-[32.046px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border-[#678893] border-[0.501px] border-solid inset-0 pointer-events-none rounded-[4.006px] shadow-[0px_0.501px_0px_0px_#678893]" />
      <DylanTile1 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#4d243d] text-[8.012px] text-center w-[min-content]">
        <p className="leading-[10.515px]">Adam</p>
      </div>
    </div>
  );
}

function Cell6() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[74.45px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-[4.159265995025635px_4.159px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <AmyTile2 />
        <div className="absolute left-0 size-[37.225px] top-0" data-name="image 31">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage31} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Wrong() {
  return <div className="-translate-y-1/2 absolute left-0 size-[37.225px] top-1/2" data-name="Wrong" />;
}

function Cell7() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[37.23px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[37.23px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[4.159265995025635px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <Wrong />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell8() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[37.23px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[74.45px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function SudokuGrid() {
  return (
    <div className="absolute left-0 overflow-clip rounded-[4.159px] size-[112px] top-0" data-name="Sudoku Grid">
      <Cell />
      <Cell1 />
      <Cell2 />
      <Cell3 />
      <Cell4 />
      <Cell5 />
      <Cell6 />
      <Cell7 />
      <Cell8 />
    </div>
  );
}

function Border() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 rounded-[4.159px] size-[112px] top-1/2" data-name="Border">
      <div aria-hidden="true" className="absolute border-[#191919] border-[1.56px] border-solid inset-[-0.78px] pointer-events-none rounded-[4.939px]" />
    </div>
  );
}

function Grid() {
  return (
    <div className="relative shadow-[0px_1.56px_0px_0px_#191919] shrink-0 size-[112px] rounded-[4.159px]" data-name="Grid">
      <SudokuGrid />
      <Border />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[21px] min-h-px min-w-px not-italic relative text-[#191919] text-[16px]">Each Row and Column can only have one suspect.</p>
      <Grid />
    </div>
  );
}

function Cell9() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[74.45px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[74.45px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell10() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[74.45px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[37.23px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Amy1() {
  return (
    <div className="bg-[#f5f5f5] overflow-clip relative rounded-[4.006px] shrink-0 size-[16.023px]" data-name="Amy">
      <div className="absolute left-0 rounded-[2.671px] size-[16.023px] top-0" data-name="image 24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.671px]">
          <img alt="" className="absolute h-[378.38%] left-[-109.85%] max-w-none top-[-19.07%] w-[614.86%]" src={imgImage18} />
        </div>
      </div>
    </div>
  );
}

function AmyTile3() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[2.003px] items-center justify-center relative rounded-[4.006px] shrink-0 size-[32.046px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border-[#678893] border-[0.501px] border-solid inset-0 pointer-events-none rounded-[4.006px] shadow-[0px_0.501px_0px_0px_#678893]" />
      <Amy1 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#e3202d] text-[8.012px] text-center w-[min-content]">
        <p className="leading-[10.515px]">Ella</p>
      </div>
    </div>
  );
}

function Cell11() {
  return (
    <div className="absolute bg-[#ffd4d4] left-0 min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-[4.159265995025635px_4.159px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <AmyTile3 />
        <div className="absolute left-0 size-[37.225px] top-0" data-name="image 31">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage31} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell12() {
  return (
    <div className="absolute bg-[#ffd4d4] left-0 min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[37.23px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell13() {
  return (
    <div className="absolute bg-[#ffd4d4] left-0 min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[74.45px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell14() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[37.55px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-0" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute bg-[#f5f5f5] left-0 rounded-[4.006px] size-[16.023px] top-0">
      <div className="absolute left-0 rounded-[2.671px] size-[16.023px] top-0" data-name="image 24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.671px]">
          <img alt="" className="absolute h-[378.38%] left-[-306.31%] max-w-none top-[-124.94%] w-[614.86%]" src={imgImage18} />
        </div>
      </div>
    </div>
  );
}

function DylanTile2() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[4.006px] shrink-0 size-[16.023px]" data-name="Dylan Tile">
      <Frame1 />
    </div>
  );
}

function AmyTile4() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[2.003px] items-center justify-center relative rounded-[4.006px] shrink-0 size-[32.046px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border-[#678893] border-[0.501px] border-solid inset-0 pointer-events-none rounded-[4.006px] shadow-[0px_0.501px_0px_0px_#678893]" />
      <DylanTile2 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#4d243d] text-[8.012px] text-center w-[min-content]">
        <p className="leading-[10.515px]">Adam</p>
      </div>
    </div>
  );
}

function Cell16() {
  return (
    <div className="absolute bg-[#ffd4d4] left-0 min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-0" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell15() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[74.45px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-[4.159265995025635px_4.159px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <AmyTile4 />
        <Cell16 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute bg-[#f5f5f5] left-0 rounded-[4.006px] size-[16.023px] top-0">
      <div className="absolute left-0 rounded-[2.671px] size-[16.023px] top-0" data-name="image 24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.671px]">
          <img alt="" className="absolute h-[378.38%] left-[-306.31%] max-w-none top-[-124.94%] w-[614.86%]" src={imgImage18} />
        </div>
      </div>
    </div>
  );
}

function DylanTile3() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[4.006px] shrink-0 size-[16.023px]" data-name="Dylan Tile">
      <Frame2 />
    </div>
  );
}

function AmyTile5() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[2.003px] items-center justify-center relative rounded-[4.006px] shrink-0 size-[32.046px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border-[#678893] border-[0.501px] border-solid inset-0 pointer-events-none rounded-[4.006px] shadow-[0px_0.501px_0px_0px_#678893]" />
      <DylanTile3 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#4d243d] text-[8.012px] text-center w-[min-content]">
        <p className="leading-[10.515px]">Adam</p>
      </div>
    </div>
  );
}

function Cell17() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[37.23px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[37.23px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-[4.159265995025635px_4.159px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <AmyTile5 />
        <div className="absolute left-0 size-[37.225px] top-0" data-name="image 31">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage31} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell18() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[37.23px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[74.45px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function SudokuGrid1() {
  return (
    <div className="absolute left-0 overflow-clip rounded-[4.159px] size-[112px] top-0" data-name="Sudoku Grid">
      <Cell9 />
      <Cell10 />
      <Cell11 />
      <Cell12 />
      <Cell13 />
      <Cell14 />
      <Cell15 />
      <Cell17 />
      <Cell18 />
    </div>
  );
}

function Border1() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 rounded-[4.159px] size-[112px] top-1/2" data-name="Border">
      <div aria-hidden="true" className="absolute border-[#191919] border-[1.56px] border-solid inset-[-0.78px] pointer-events-none rounded-[4.939px]" />
    </div>
  );
}

function Grid1() {
  return (
    <div className="relative shadow-[0px_1.56px_0px_0px_#191919] shrink-0 size-[112px] rounded-[4.159px]" data-name="Grid">
      <SudokuGrid1 />
      <Border1 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[21px] min-h-px min-w-px not-italic relative text-[#191919] text-[16px]">Suspects cannot touch - even diagonally.</p>
      <Grid1 />
    </div>
  );
}

function Cell19() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[74.45px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[74.45px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell20() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[74.45px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[37.23px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell21() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[37.55px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-0" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell22() {
  return (
    <div className="absolute bg-[#ffd4d4] left-[74.45px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-0" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute bg-[#f5f5f5] left-0 rounded-[4.006px] size-[16.023px] top-0">
      <div className="absolute left-0 rounded-[2.671px] size-[16.023px] top-0" data-name="image 24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.671px]">
          <img alt="" className="absolute h-[378.38%] left-[-306.31%] max-w-none top-[-124.94%] w-[614.86%]" src={imgImage18} />
        </div>
      </div>
    </div>
  );
}

function DylanTile4() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[4.006px] shrink-0 size-[16.023px]" data-name="Dylan Tile">
      <Frame3 />
    </div>
  );
}

function AmyTile6() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[2.003px] items-center justify-center relative rounded-[4.006px] shrink-0 size-[32.046px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border-[#678893] border-[0.501px] border-solid inset-0 pointer-events-none rounded-[4.006px] shadow-[0px_0.501px_0px_0px_#678893]" />
      <DylanTile4 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#4d243d] text-[8.012px] text-center w-[min-content]">
        <p className="leading-[10.515px]">Adam</p>
      </div>
    </div>
  );
}

function Cell23() {
  return (
    <div className="absolute bg-[#d7f0f3] left-[37.23px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[74.45px]" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[4.159265995025635px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <AmyTile6 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Amy2() {
  return (
    <div className="bg-[#f5f5f5] overflow-clip relative rounded-[4.006px] shrink-0 size-[16.023px]" data-name="Amy">
      <div className="absolute left-0 rounded-[2.671px] size-[16.023px] top-0" data-name="image 24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.671px]">
          <img alt="" className="absolute h-[378.38%] left-[-109.85%] max-w-none top-[-19.07%] w-[614.86%]" src={imgImage18} />
        </div>
      </div>
    </div>
  );
}

function AmyTile7() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[2.003px] items-center justify-center relative rounded-[4.006px] shrink-0 size-[32.046px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border-[#678893] border-[0.501px] border-solid inset-0 pointer-events-none rounded-[4.006px] shadow-[0px_0.501px_0px_0px_#678893]" />
      <Amy2 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#e3202d] text-[8.012px] text-center w-[min-content]">
        <p className="leading-[10.515px]">Ella</p>
      </div>
    </div>
  );
}

function Cell24() {
  return (
    <div className="absolute bg-[#d7f0f3] left-0 min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[4.159265995025635px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <AmyTile7 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell25() {
  return (
    <div className="absolute bg-[#d7f0f3] left-0 min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[37.23px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell26() {
  return (
    <div className="absolute bg-[#d7f0f3] left-0 min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[74.45px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell27() {
  return (
    <div className="absolute bg-[#d7f0f3] left-[37.23px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-[37.23px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Cell28() {
  return (
    <div className="absolute bg-[#d7f0f3] left-[37.55px] min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-0" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function Frame7() {
  return (
    <div className="absolute h-[111.676px] left-0 top-0 w-[74.775px]">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Cell25 />
        <Cell26 />
        <Cell27 />
        <div className="absolute left-[37px] size-[37.225px] top-[74px]" data-name="image 31">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage31} />
        </div>
        <div className="absolute left-0 size-[37.225px] top-0" data-name="image 31">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage31} />
        </div>
        <Cell28 />
      </div>
      <div aria-hidden="true" className="absolute border-[1.75px] border-black border-solid inset-[-0.875px] pointer-events-none" />
    </div>
  );
}

function SudokuGrid2() {
  return (
    <div className="absolute left-0 overflow-clip rounded-[4.159px] size-[112px] top-0" data-name="Sudoku Grid">
      <Cell19 />
      <Cell20 />
      <Cell21 />
      <Cell22 />
      <Cell23 />
      <Cell24 />
      <Frame7 />
    </div>
  );
}

function Border2() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 rounded-[4.159px] size-[112px] top-1/2" data-name="Border">
      <div aria-hidden="true" className="absolute border-[#191919] border-[1.56px] border-solid inset-[-0.78px] pointer-events-none rounded-[4.939px]" />
    </div>
  );
}

function Grid2() {
  return (
    <div className="relative shadow-[0px_1.56px_0px_0px_#191919] shrink-0 size-[112px] rounded-[4.159px]" data-name="Grid">
      <SudokuGrid2 />
      <Border2 />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[15.75px] left-[calc(50%-18.79px)] top-[calc(50%-56.88px)] w-[32.426px]" data-name="Hall - Tutorial">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHallTutorial} />
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[21px] min-h-px min-w-px not-italic relative text-[#191919] text-[16px]">Each room can only have one suspect.</p>
      <Grid2 />
    </div>
  );
}

function DylanTile5() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[8px] shrink-0 size-[32px]" data-name="Dylan Tile">
      <div className="absolute left-0 rounded-[5.333px] size-[32px] top-0" data-name="image 18">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[5.333px]">
          <img alt="" className="absolute h-[378.38%] left-[-503.07%] max-w-none top-[-16.61%] w-[614.86%]" src={imgImage18} />
        </div>
      </div>
    </div>
  );
}

function AmyTile8() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col gap-[4px] items-center justify-center relative rounded-[8px] shrink-0 size-[64px]" data-name="Amy Tile">
      <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_0px_0px_#678893]" />
      <DylanTile5 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#a25603] text-[16px] text-center w-[min-content]">
        <p className="leading-[21px]">Tom</p>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0 w-[160px]" data-name="Text">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-black text-center whitespace-nowrap">
        <p className="text-[13px] whitespace-pre">
          <span className="[text-decoration-skip-ink:none] decoration-solid font-['Inter:Bold',sans-serif] font-bold leading-[18px] not-italic text-[#a25603] underline">Tom</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[18px] not-italic">{` must be `}</span>
          <span className="leading-[18px]">
            <br aria-hidden="true" />
          </span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[18px] not-italic">in th</span>
          <span className="leading-[18px]">e</span>
          <span className="leading-[18px] text-[#fcfcfc]">{` hall`}</span>
        </p>
      </div>
      <div className="absolute h-[15.75px] left-[87px] top-[20px] w-[32.426px]" data-name="Hall - Tutorial">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHallTutorial} />
      </div>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 size-[111px]">
      <AmyTile8 />
      <Text />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[21px] min-h-px min-w-px not-italic relative text-[#191919] text-[16px]">Each suspect has their own rule that you must follow when placing them.</p>
      <Frame11 />
    </div>
  );
}

function Cell29() {
  return (
    <div className="absolute bg-[#d7f0f3] left-0 min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-0" data-name="Cell">
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function SudokuGrid3() {
  return (
    <div className="absolute left-0 overflow-clip rounded-[4.159px] size-[37px] top-0" data-name="Sudoku Grid">
      <Cell29 />
    </div>
  );
}

function Border3() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 rounded-[4.159px] size-[37px] top-1/2" data-name="Border">
      <div aria-hidden="true" className="absolute border-[#191919] border-[1.56px] border-solid inset-[-0.78px] pointer-events-none rounded-[4.939px]" />
    </div>
  );
}

function Grid3() {
  return (
    <div className="relative shadow-[0px_1.56px_0px_0px_#191919] shrink-0 size-[37px] rounded-[4.159px]" data-name="Grid">
      <SudokuGrid3 />
      <Border3 />
    </div>
  );
}

function X1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="X">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="X">
          <path d="M6.25 6.25L13.75 13.75" id="Vector 129" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="0.9375" />
          <path d="M6.25 13.75L13.75 6.25" id="Vector 130" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeWidth="0.9375" />
        </g>
      </svg>
    </div>
  );
}

function Cell30() {
  return (
    <div className="absolute bg-[#d7f0f3] left-0 min-h-[20.79633140563965px] min-w-[20.79633140563965px] size-[37.225px] top-0" data-name="Cell">
      <div className="content-center flex flex-wrap gap-y-[4.159265995025635px] items-center justify-center min-h-[inherit] min-w-[inherit] overflow-clip relative rounded-[inherit] size-full">
        <X1 />
      </div>
      <div aria-hidden="true" className="absolute border-[#666] border-[0.52px] border-solid inset-[-0.26px] pointer-events-none" />
    </div>
  );
}

function SudokuGrid4() {
  return (
    <div className="absolute left-0 overflow-clip rounded-[4.159px] size-[37px] top-0" data-name="Sudoku Grid">
      <Cell30 />
    </div>
  );
}

function Border4() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 rounded-[4.159px] size-[37px] top-1/2" data-name="Border">
      <div aria-hidden="true" className="absolute border-[#191919] border-[1.56px] border-solid inset-[-0.78px] pointer-events-none rounded-[4.939px]" />
    </div>
  );
}

function Grid4() {
  return (
    <div className="relative shadow-[0px_1.56px_0px_0px_#191919] shrink-0 size-[37px] rounded-[4.159px]" data-name="Grid">
      <SudokuGrid4 />
      <Border4 />
    </div>
  );
}

function X() {
  return (
    <div className="content-center flex flex-wrap gap-[0px_7px] items-center relative shrink-0" data-name="X">
      <Grid3 />
      <div className="h-0 relative shrink-0 w-[23px]">
        <div className="absolute inset-[-3.68px_-2.17%_-3.68px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.5 7.36396">
            <path d={svgPaths.p39b93b70} fill="var(--stroke-0, #CCCCCC)" id="Vector 144" />
          </svg>
        </div>
      </div>
      <Grid4 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[0] min-h-px min-w-px not-italic relative text-[#191919] text-[0px]">
        <span className="font-['Inter:Bold',sans-serif] font-bold leading-[21px] text-[16px]">TIP:</span>
        <span className="leading-[21px] text-[16px]">{` Tap an empty cell to mark it with X. Use X marks to eliminate cells where suspects can't go.`}</span>
      </p>
      <X />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[21px] not-italic relative shrink-0 text-[#191919] text-[16px] w-full">Rules</p>
      <Frame4 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 350 1">
            <path d="M0 0.5H350" id="Vector 141" stroke="var(--stroke-0, #CCCCCC)" />
          </svg>
        </div>
      </div>
      <Frame5 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 350 1">
            <path d="M0 0.5H350" id="Vector 141" stroke="var(--stroke-0, #CCCCCC)" />
          </svg>
        </div>
      </div>
      <Frame6 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 350 1">
            <path d="M0 0.5H350" id="Vector 141" stroke="var(--stroke-0, #CCCCCC)" />
          </svg>
        </div>
      </div>
      <Frame9 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 350 1">
            <path d="M0 0.5H350" id="Vector 141" stroke="var(--stroke-0, #CCCCCC)" />
          </svg>
        </div>
      </div>
      <Frame10 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 350 1">
            <path d="M0 0.5H350" id="Vector 144" stroke="var(--stroke-0, #CCCCCC)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function HeadingContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="Heading Container">
      <p className="font-['Literata:Bold',sans-serif] font-bold leading-[34px] relative shrink-0 text-[#191919] text-[24px] text-center whitespace-nowrap">How to Play</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[21px] min-w-full not-italic relative shrink-0 text-[#191919] text-[16px] w-[min-content] whitespace-pre-wrap">
        {`A murder has taken place in this house. The murderer was alone in the same room as the victim. `}
        <br aria-hidden="true" />
        <br aria-hidden="true" />
        Use your deductions skills to find out where everyone was at the time of the murder.
      </p>
      <Frame8 />
    </div>
  );
}

function ButtonContainer({ onSkipClick, onPlayClick }: { onSkipClick: () => void; onPlayClick: () => void }) {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0 w-[350px]" data-name="Button Container">
      <button 
        onClick={onSkipClick}
        className="flex-[1_0_0] h-[44px] min-h-px min-w-px relative rounded-[50px] cursor-pointer bg-transparent" 
        data-name="Play Button"
      >
        <div aria-hidden="true" className="absolute border border-[#ccc] border-solid inset-0 pointer-events-none rounded-[50px]" />
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[24px] py-[12px] relative size-full">
            <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191919] text-[15px] text-center whitespace-nowrap">
              <p className="leading-[20px]">Skip tutorial</p>
            </div>
          </div>
        </div>
      </button>
      <button
        onClick={onPlayClick}
        className="bg-[#191919] flex-[1_0_0] min-h-px min-w-px relative rounded-[50px] cursor-pointer border-none" 
        data-name="Play Button"
      >
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[24px] py-[12px] relative w-full">
            <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#fcfcfc] text-[15px] text-center whitespace-nowrap">
              <p className="leading-[20px]">Play tutorial</p>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

function InfoContainer({ onSkipClick, onPlayClick }: { onSkipClick: () => void; onPlayClick: () => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center max-w-[500px] relative shrink-0 w-full" data-name="Info Container">
      <HeadingContainer />
      <ButtonContainer onSkipClick={onSkipClick} onPlayClick={onPlayClick} />
    </div>
  );
}

export default function Tutorial({ onSkipClick, onPlayClick }: { onSkipClick: () => void; onPlayClick: () => void }) {
  return (
    <div className="bg-[#f9f7f6] content-stretch flex flex-col items-center relative size-full px-[0px] py-[20px]" data-name="Tutorial">
      <InfoContainer onSkipClick={onSkipClick} onPlayClick={onPlayClick} />
    </div>
  );
}