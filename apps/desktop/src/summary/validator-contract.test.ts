// Locks the contract between buildFinalSystemPrompt (this fork's
// meetily-style final-render prompt) and the upstream enhance validator it
// is streamed through in workflow.ts: the streamed output's first H1 must
// fuzzy-match the first template section's title, with no separate
// meeting-title heading.
import { describe, expect, it } from "vitest";

import { createEnhanceValidator } from "~/store/zustand/ai-task/task-configs/enhance-validator";

import { buildFinalSystemPrompt } from "./prompts";

const SECTIONS = [
  { title: "Summary", description: "One-paragraph executive summary." },
  { title: "Key Decisions", description: "Bullet list of decisions." },
];

describe("buildFinalSystemPrompt / createEnhanceValidator contract", () => {
  it("requires the system prompt's opening line to match the validator's first section", () => {
    const prompt = buildFinalSystemPrompt({
      sections: SECTIONS,
      language: null,
    });
    expect(prompt).toContain(
      'first line of the output must be exactly "# Summary"',
    );
  });

  it("validates a conformant streamed prefix", () => {
    const validator = createEnhanceValidator({
      title: "",
      description: null,
      sections: SECTIONS,
    });

    const streamedPrefix =
      "# Summary\n\n- point one about the meeting discussion so far";
    expect(streamedPrefix.trim().length).toBeGreaterThan(30);

    expect(validator(streamedPrefix)).toEqual({ valid: true });
  });

  it("rejects a nonconformant streamed prefix (meeting-title heading instead of first section)", () => {
    const validator = createEnhanceValidator({
      title: "",
      description: null,
      sections: SECTIONS,
    });

    const streamedPrefix =
      "# Weekly Team Sync\n\n- some unrelated preamble content here";
    expect(streamedPrefix.trim().length).toBeGreaterThan(30);

    const result = validator(streamedPrefix);
    expect(result.valid).toBe(false);
  });
});
