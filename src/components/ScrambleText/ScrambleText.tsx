import { ElementType } from 'react';
import { useScramble } from '../../hooks/useScramble';

interface ScrambleTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  delayMs?: number;
  durationMs?: number;
  /** Re-run the decode when the pointer enters. */
  replayOnHover?: boolean;
}

/**
 * Text that decodes from glyphs. The real text lives in a visually hidden span, so screen
 * readers and accessible names always get the final copy — never the glyph noise.
 */
export function ScrambleText({
  text,
  as: Tag = 'span',
  className,
  delayMs,
  durationMs,
  replayOnHover = false,
}: ScrambleTextProps) {
  const { display, replay } = useScramble(text, { delayMs, durationMs });
  return (
    <Tag className={className} onMouseEnter={replayOnHover ? replay : undefined}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </Tag>
  );
}
