/** Glyphs used while a character is still "decoding". */
export const SCRAMBLE_GLYPHS = '!<>-_\/[]{}=+*^?#01ΛΔΣ';

export function randomGlyph(): string {
  return SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
}

/**
 * One frame of a left-to-right decode: characters before the reveal point are final,
 * the rest are glyphs. Spaces never scramble so the line keeps its shape.
 */
export function scrambleFrame(target: string, progress: number, glyph: () => string = randomGlyph): string {
  const p = Math.min(1, Math.max(0, progress));
  const revealed = Math.floor(target.length * p);
  let out = '';
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    out += i < revealed || ch === ' ' ? ch : glyph();
  }
  return out;
}
