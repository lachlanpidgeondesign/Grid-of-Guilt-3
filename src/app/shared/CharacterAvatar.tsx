import svgPaths from "../../imports/svg-tum7nfzkr8";
import imgImage24 from "figma:asset/6bdc180aa5e05c3ba389fbac3599c491940173f2.png";

export interface SpritePos {
  left: string;
  top: string;
}

// Sprite-sheet offsets for the authored daily suspects. Used as the default
// lookup when a caller passes only a `name` (daily-game behaviour). The
// generator passes an explicit `spritePos` instead (see suspects.ts).
const SPRITE_POSITIONS: Record<string, SpritePos> = {
  Eve: { left: "-10.81%", top: "-229.73%" },
  Amy: { left: "-109.46%", top: "-229.73%" },
  Dylan: { left: "-108.11%", top: "-120.27%" },
  Ben: { left: "-504.05%", top: "-229.73%" },
  Jess: { left: "-208.11%", top: "-229.73%" },
};

export interface CharacterAvatarProps {
  name: string;
  size?: number;
  /** Explicit sprite-sheet offset. Defaults to the authored lookup by name. */
  spritePos?: SpritePos;
  /** Sprite sheet image source. Defaults to the authored sheet. */
  spriteSrc?: string;
  /** Draw the green Eve underline badge. Defaults to `name === "Eve"`. */
  showEveBadge?: boolean;
}

export function CharacterAvatar({
  name,
  size = 32,
  spritePos,
  spriteSrc = imgImage24,
  showEveBadge,
}: CharacterAvatarProps) {
  const pos = spritePos ?? SPRITE_POSITIONS[name];
  if (!pos) return null;
  const eveBadge = showEveBadge ?? name === "Eve";
  return (
    <div className="overflow-hidden relative shrink-0" style={{ width: size, height: size, borderRadius: size * 0.25 }}>
      <img
        alt=""
        className="absolute max-w-none pointer-events-none"
        style={{ height: "378.38%", width: "614.86%", left: pos.left, top: pos.top }}
        src={spriteSrc}
      />
      {eveBadge && (
        <div className="absolute left-0 right-0" style={{ bottom: 0, height: size * 0.26 }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 8.72164">
            <path d={svgPaths.p34b2e6c0} fill="#055B0F" stroke="#055B0F" strokeWidth="0.333333" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default CharacterAvatar;
