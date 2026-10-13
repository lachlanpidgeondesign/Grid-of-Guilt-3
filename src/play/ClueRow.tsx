// Grid of Guilt — /play/ clue rendering.
//
// Renders a clue from its ClueSpec (not the generator's HTML text string):
// suspect names are coloured + underlined, a room becomes a chip in that
// room's colour, and door/window clues show the board's door/window icon.

import type { ClueSpec } from "../app/levels/clues";
import type { RoomPalette } from "../app/generator/puzzleGenerator";

// Small inline copies of the board's door/window pill markers.
function DoorIcon() {
  return (
    <svg viewBox="0 0 33 7" width="24" height="6" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }} aria-label="door">
      <rect x="0.5" y="0.5" width="32" height="6" rx="3" fill="#FE9B00" stroke="black" />
      <circle cx="26" cy="3.5" r="1.5" fill="#573603" />
    </svg>
  );
}
function WindowIcon() {
  return (
    <svg viewBox="0 0 33 7" width="24" height="6" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }} aria-label="window">
      <rect x="0.5" y="0.5" width="32" height="6" rx="3" fill="#8BD6F9" stroke="black" />
      <path d="M16.5 5L16.5 2" stroke="black" />
    </svg>
  );
}

function RoomChip({ room }: { room: RoomPalette }) {
  // Mirror the board's room label pill (RoomLabels in PlayBoard): uppercase bold
  // white text, the room's fill with a darker border, a fully-rounded pill.
  return (
    <span
      className="inline-flex items-center font-['Inter:Bold',sans-serif] font-bold uppercase whitespace-nowrap"
      style={{
        backgroundColor: room.fill,
        border: `1.5px solid ${room.dark}`,
        color: "#fcfcfc",
        borderRadius: 999,
        padding: "1px 7px",
        fontSize: 11,
        letterSpacing: "0.03em",
        lineHeight: 1.35,
        verticalAlign: "middle",
      }}
    >
      {room.name}
    </span>
  );
}

function SuspectName({ name, color }: { name: string; color: string }) {
  return (
    <span className="font-['Inter:Bold',sans-serif] font-bold underline" style={{ color }}>
      {name}
    </span>
  );
}

export interface ClueContentProps {
  spec: ClueSpec;
  rooms: RoomPalette[];
  suspectNames: string[];
  suspectColors: string[];
}

// The clue text/content after the suspect's own name (which the row renders).
export function ClueContent({ spec, rooms, suspectNames, suspectColors }: ClueContentProps) {
  switch (spec.kind) {
    case "room": {
      const room = rooms.find((r) => r.name === spec.room);
      return (
        <>
          must be in the {room ? <RoomChip room={room} /> : <strong>{spec.room}</strong>}
        </>
      );
    }
    case "corner":
      return <>must be in a corner</>;
    case "edge":
      return <>must be along an outer wall</>;
    case "rowParity":
      return <>must be in an {spec.parity === "odd" ? "odd" : "even"}-numbered row</>;
    case "colParity":
      return <>must be in an {spec.parity === "odd" ? "odd" : "even"}-numbered column</>;
    case "door":
      return (
        <>
          must {spec.near ? "" : "not "}be next to a <DoorIcon />
        </>
      );
    case "window":
      return (
        <>
          must {spec.near ? "" : "not "}be next to a <WindowIcon />
        </>
      );
    case "row":
      return <>must be in row {spec.row}</>;
    case "column":
      return <>must be in column {spec.column}</>;
    case "relative": {
      const other = (
        <SuspectName
          name={suspectNames[spec.otherSuspectIdx] ?? `Suspect ${spec.otherSuspectIdx + 1}`}
          color={suspectColors[spec.otherSuspectIdx] ?? "#191919"}
        />
      );
      const rel =
        spec.relation === "leftOf" ? "to the left of" :
        spec.relation === "rightOf" ? "to the right of" :
        spec.relation === "above" ? "above" : "below";
      return <>must be {rel} {other}</>;
    }
  }
}

export default ClueContent;
