import { describe, expect, it } from "vitest";

import { formatTimestamp, formatTimestampedSegments } from "./transcript";

describe("formatTimestamp", () => {
  it("formats sub-hour times as MM:SS", () => {
    expect(formatTimestamp(0)).toBe("00:00");
    expect(formatTimestamp(59_000)).toBe("00:59");
    expect(formatTimestamp(83_000)).toBe("01:23");
    expect(formatTimestamp(3_599_000)).toBe("59:59");
  });

  it("formats hour-plus times as H:MM:SS", () => {
    expect(formatTimestamp(3_600_000)).toBe("1:00:00");
    expect(formatTimestamp(5_025_000)).toBe("1:23:45");
  });

  it("clamps negative values to zero", () => {
    expect(formatTimestamp(-500)).toBe("00:00");
  });
});

describe("formatTimestampedSegments", () => {
  it("returns empty string for no segments", () => {
    expect(formatTimestampedSegments([])).toBe("");
  });

  it("renders one line per segment offset from the earliest start", () => {
    const result = formatTimestampedSegments([
      { speaker_label: "Matt", start_ms: 10_000, text: "Hello everyone." },
      { speaker_label: "Ana", start_ms: 73_000, text: "Let's start." },
    ]);
    expect(result).toBe(
      "[00:00] Matt: Hello everyone.\n[01:03] Ana: Let's start.",
    );
  });
});
