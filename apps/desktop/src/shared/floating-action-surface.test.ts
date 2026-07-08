import { describe, expect, it } from "vitest";

import {
  floatingActionPrimarySurfaceClassName,
  floatingActionSurfaceClassName,
} from "./floating-action-surface";

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

describe("floatingActionPrimarySurfaceClassName", () => {
  it("overrides the panel surface with the primary action tokens", () => {
    expect(floatingActionPrimarySurfaceClassName).toContain("bg-primary");
    expect(floatingActionPrimarySurfaceClassName).toContain(
      "text-primary-foreground",
    );
    expect(floatingActionPrimarySurfaceClassName).toContain(
      "border-transparent",
    );
    expect(floatingActionPrimarySurfaceClassName).toContain(
      "hover:bg-primary/90",
    );
    expect(floatingActionPrimarySurfaceClassName).not.toContain("shadow-");
  });
});
