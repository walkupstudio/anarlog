// Ported from meetily's processor.rs chunk_text: character-based token
// estimation with boundary-aware splitting and overlap.

const CHARS_PER_TOKEN = 4;

export function chunkText(
  text: string,
  chunkSizeTokens = 8000,
  overlapTokens = 200,
): string[] {
  if (!text.trim() || chunkSizeTokens <= 0) {
    return [];
  }

  // Operate on code points so surrogate pairs are never split.
  const chars = Array.from(text);
  const chunkSizeChars = chunkSizeTokens * CHARS_PER_TOKEN;
  const overlapChars = Math.min(
    Math.max(overlapTokens, 0) * CHARS_PER_TOKEN,
    chunkSizeChars - 1,
  );

  if (chars.length <= chunkSizeChars) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < chars.length) {
    let end = Math.min(start + chunkSizeChars, chars.length);

    if (end < chars.length) {
      end = findBreakPoint(chars, start, end);
    }

    chunks.push(chars.slice(start, end).join(""));

    if (end >= chars.length) {
      break;
    }

    // Overlap with the previous chunk, but always move forward.
    start = Math.max(end - overlapChars, start + 1);
  }

  return chunks;
}

// Search backwards within the last 20% of the window for, in order of
// preference: a newline, a sentence end, a word boundary.
function findBreakPoint(chars: string[], start: number, end: number): number {
  const searchFloor = start + Math.floor((end - start) * 0.8);

  for (let i = end - 1; i > searchFloor; i--) {
    if (chars[i] === "\n") {
      return i + 1;
    }
  }
  for (let i = end - 1; i > searchFloor; i--) {
    if (chars[i] === "." || chars[i] === "!" || chars[i] === "?") {
      return i + 1;
    }
  }
  for (let i = end - 1; i > searchFloor; i--) {
    if (chars[i] === " ") {
      return i + 1;
    }
  }

  return end;
}
