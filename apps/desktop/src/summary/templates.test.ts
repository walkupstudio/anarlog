import { describe, expect, it } from "vitest";

import { templateSectionSchema } from "@hypr/store";

import {
  DAILY_STANDUP_SECTIONS,
  DEFAULT_SUMMARY_SECTIONS,
  STANDARD_MEETING_SECTIONS,
} from "./templates";

describe("seed template sections", () => {
  it("are valid canonical template sections", () => {
    for (const section of [
      ...STANDARD_MEETING_SECTIONS,
      ...DAILY_STANDUP_SECTIONS,
    ]) {
      expect(() => templateSectionSchema.parse(section)).not.toThrow();
    }
  });

  it("standard meeting has the meetily section set with evidence-backed action items", () => {
    const titles = STANDARD_MEETING_SECTIONS.map((s) => s.title);
    expect(titles).toEqual([
      "Summary",
      "Key Decisions",
      "Action Items",
      "Discussion Highlights",
    ]);
    const actionItems = STANDARD_MEETING_SECTIONS[2];
    expect(actionItems.description).toContain("Owner");
    expect(actionItems.description).toContain("Timestamp");
  });

  it("default sections are the standard meeting sections", () => {
    expect(DEFAULT_SUMMARY_SECTIONS).toBe(STANDARD_MEETING_SECTIONS);
  });
});
