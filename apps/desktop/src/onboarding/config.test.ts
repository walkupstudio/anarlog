import { describe, expect, it, vi } from "vitest";

vi.mock("@tauri-apps/plugin-os", () => ({ platform: () => "macos" }));

import { getInitialStep, getNextStep } from "./config";

describe("onboarding steps in local-only mode", () => {
  it("never visits the login step", () => {
    const visited: string[] = [];
    let step: string | null = getInitialStep();
    while (step) {
      visited.push(step);
      step = getNextStep(step as any);
    }
    expect(visited).not.toContain("login");
    expect(visited[0]).toBe("permissions");
    expect(visited[visited.length - 1]).toBe("final");
  });
});
