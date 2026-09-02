// The ONLY place in the app that renders generator clue HTML. Clue text
// contains inline <em> emphasis produced by the generator; it is trusted,
// app-authored template text (never user input and never fetched), so
// dangerouslySetInnerHTML is safe here.
export interface ClueTextProps {
  html: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ClueText({ html, className, style }: ClueTextProps) {
  return <span className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default ClueText;
