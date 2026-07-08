import { describe, expect, it } from "vitest";

import { floatingActionSurfaceClassName } from "./floating-action-surface";

describe("floatingActionSurfaceClassName", () => {
  it("uses token-based floating panel styling with backdrop blur", () => {
    expect(floatingActionSurfaceClassName).toContain("border");
    expect(floatingActionSurfaceClassName).toContain(
      "border-app-floating-border",
    );
    expect(floatingActionSurfaceClassName).toContain(
      "bg-app-floating-panel/95",
    );
    expect(floatingActionSurfaceClassName).toContain("text-foreground");
    expect(floatingActionSurfaceClassName).toContain("backdrop-blur-md");
    expect(floatingActionSurfaceClassName).toContain(
      "hover:bg-app-floating-panel",
    );
    expect(floatingActionSurfaceClassName).not.toContain("shadow-");
  });
});
