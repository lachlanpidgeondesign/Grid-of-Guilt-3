import svgPathsEnd from "../../imports/svg-8afbcemiql";
import CharacterAvatar, { type SpritePos } from "./CharacterAvatar";

// Per-suspect label colours for the authored daily suspects. Used as the
// default when a caller passes only a `name`. The generator passes an explicit
// `color` from suspects.ts.
const SUSPECT_COLORS: Record<string, string> = {
  Eve: "#055b0f",
  Amy: "#e3202d",
  Dylan: "#a25603",
  Ben: "#4d243d",
  Jess: "#0071cb",
};

export interface SuspectTileProps {
  name: string;
  onClick?: () => void;
  selected?: boolean;
  isMurderer?: boolean;
  inGrid?: boolean;
  gridScale?: number;
  shaking?: boolean;
  /** Explicit label colour. Defaults to the authored lookup by name. */
  color?: string;
  /** Show the name label under the avatar. Defaults to true (daily). */
  showName?: boolean;
  /** Forwarded to CharacterAvatar; defaults to authored lookup by name. */
  spritePos?: SpritePos;
  /** Forwarded to CharacterAvatar; defaults to the authored sheet. */
  spriteSrc?: string;
  /** Forwarded to CharacterAvatar; defaults to `name === "Eve"`. */
  showEveBadge?: boolean;
}

export function SuspectTile({
  name,
  onClick,
  selected,
  isMurderer = false,
  inGrid = false,
  gridScale = 1,
  shaking = false,
  color,
  showName = true,
  spritePos,
  spriteSrc,
  showEveBadge,
}: SuspectTileProps) {
  const resolvedColor = color ?? (SUSPECT_COLORS[name] || "#333");
  const isEve = name === "Eve";
  const s = inGrid ? gridScale : 1;
  const tileSize = 64 * s;
  const avatarSize = 32 * s;
  const fontSize = Math.max(8, 16 * s);
  const borderRadius = 8 * s;

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none${shaking ? " puzzle-shake" : ""}`}
      style={{ width: tileSize, height: tileSize, backgroundColor: "#f5f5f5", borderRadius, gap: 4 * s, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          borderRadius,
          border: isMurderer
            ? `${3 * s}px solid #e01c44`
            : selected
            ? `${2 * s}px solid #01394b`
            : `${1 * s}px solid ${isEve ? "#678893" : "#678893"}`,
          boxShadow: `0px ${1 * s}px 0px 0px ${isEve ? "#678893" : "#678893"}`,
          inset: isMurderer ? `${-1.5 * s}px` : selected ? `${-1 * s}px` : 0,
        }}
      />
      <CharacterAvatar name={name} size={avatarSize} spritePos={spritePos} spriteSrc={spriteSrc} showEveBadge={showEveBadge} />
      {showName && (
        <div
          className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-center whitespace-nowrap"
          style={{ color: resolvedColor, fontSize, lineHeight: 1.3, minWidth: "100%" }}
        >
          {name}
        </div>
      )}
      {isMurderer && (
        <div className="absolute" style={{ right: -4 * s, bottom: 2 * s, width: 17.748 * s, height: 15.847 * s }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.7483 16.5051">
            <path d={svgPathsEnd.p21975a00} fill="#01394B" />
            <path d={svgPathsEnd.p15300cf0} fill="#E6EBED" />
            <path d={svgPathsEnd.pd144900} fill="#678893" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default SuspectTile;
