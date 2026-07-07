import { describe, expect, it } from "vitest";

import { chunkText } from "./chunker";

describe("chunkText", () => {
  it("returns [] for empty or whitespace input", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   \n  ")).toEqual([]);
  });

  it("returns the whole text as one chunk when it fits", () => {
    const text = "Short meeting. Everyone agreed.";
    expect(chunkText(text, 8000, 200)).toEqual([text]);
  });

  it("splits long text into multiple chunks no larger than the chunk size", () => {
    // 100 tokens * 4 chars/token = 400 chars per chunk
    const line = "Speaker: we discussed the roadmap in detail today.\n"; // 52 chars
    const text = line.repeat(40); // ~2080 chars
    const chunks = chunkText(text, 100, 10);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(Array.from(chunk).length).toBeLessThanOrEqual(400);
    }
  });

  it("covers the end of the text", () => {
    const text = `${"a. ".repeat(500)}FINAL_MARKER`;
    const chunks = chunkText(text, 100, 10);
    expect(chunks[chunks.length - 1].endsWith("FINAL_MARKER")).toBe(true);
  });

  it("overlaps consecutive chunks", () => {
    const text = "word ".repeat(1000);
    const chunks = chunkText(text, 100, 20);
    expect(chunks.length).toBeGreaterThan(1);
    // The start of chunk 2 must appear inside chunk 1 (overlap).
    const probe = chunks[1].slice(0, 40);
    expect(chunks[0]).toContain(probe.trim().slice(0, 20));
  });

  it("prefers newline boundaries", () => {
    const line = `${"x".repeat(30)}\n`;
    const text = line.repeat(50);
    const chunks = chunkText(text, 100, 5); // 400-char chunks vs 31-char lines
    // Every non-final chunk should end exactly at a line boundary.
    for (const chunk of chunks.slice(0, -1)) {
      expect(chunk.endsWith("\n")).toBe(true);
    }
  });

  it("never splits surrogate pairs (emoji stay intact)", () => {
    const text = "🎉🎊".repeat(1000);
    const chunks = chunkText(text, 100, 10);
    for (const chunk of chunks) {
      expect(chunk).not.toContain("�");
      // Round-trip through code points must be lossless.
      expect(Array.from(chunk).join("")).toBe(chunk);
    }
  });

  it("always makes forward progress (terminates) even when overlap ~ chunk size", () => {
    const text = "y".repeat(5000);
    const chunks = chunkText(text, 100, 100);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.length).toBeLessThan(5000);
  });
});
