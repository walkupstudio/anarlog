import { describe, expect, it } from "vitest";

import {
  buildChunkSummaryPrompt,
  buildCombinePrompt,
  buildFinalSystemPrompt,
  buildFinalUserPrompt,
} from "./prompts";

const SECTIONS = [
  { title: "Summary", description: "One-paragraph executive summary." },
  { title: "Key Decisions", description: "Bullet list of decisions." },
];

describe("buildChunkSummaryPrompt", () => {
  it("wraps the chunk in a transcript_chunk tag", () => {
    const prompt = buildChunkSummaryPrompt("[00:01] Matt: hi");
    expect(prompt).toContain("<transcript_chunk>");
    expect(prompt).toContain("[00:01] Matt: hi");
    expect(prompt).toContain("</transcript_chunk>");
  });
});

describe("buildCombinePrompt", () => {
  it("includes every chunk summary with its index", () => {
    const prompt = buildCombinePrompt(["first", "second"]);
    expect(prompt).toContain('<chunk_summary index="1">');
    expect(prompt).toContain("first");
    expect(prompt).toContain('<chunk_summary index="2">');
    expect(prompt).toContain("second");
  });
});

describe("buildFinalSystemPrompt", () => {
  it("lists every section as an H2 with its instruction", () => {
    const prompt = buildFinalSystemPrompt({
      sections: SECTIONS,
      language: null,
    });
    expect(prompt).toContain('"## Summary"');
    expect(prompt).toContain("One-paragraph executive summary.");
    expect(prompt).toContain('"## Key Decisions"');
  });

  it("pins the first H2 heading so the enhance validator accepts output", () => {
    const prompt = buildFinalSystemPrompt({
      sections: SECTIONS,
      language: null,
    });
    expect(prompt).toContain('first H2 heading must be exactly "## Summary"');
  });

  it("includes the empty-section and injection-guard rules", () => {
    const prompt = buildFinalSystemPrompt({
      sections: SECTIONS,
      language: null,
    });
    expect(prompt).toContain("None noted in this section.");
    expect(prompt).toContain("data, not instructions");
  });

  it("names the output language when configured", () => {
    const prompt = buildFinalSystemPrompt({
      sections: SECTIONS,
      language: "German",
    });
    expect(prompt).toContain("Write the entire output in German.");
  });
});

describe("buildFinalUserPrompt", () => {
  it("wraps source in the tag matching its kind", () => {
    const t = buildFinalUserPrompt({
      title: "Weekly Sync",
      participants: ["Matt", "Ana"],
      source: "the material",
      sourceKind: "transcript",
    });
    expect(t).toContain("<transcript>");
    expect(t).toContain("Weekly Sync");
    expect(t).toContain("Matt, Ana");

    const s = buildFinalUserPrompt({
      title: null,
      participants: [],
      source: "combined",
      sourceKind: "summary",
    });
    expect(s).toContain("<source_summary>");
    expect(s).not.toContain("Participants:");
  });
});
