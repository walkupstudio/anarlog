import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const tokensCss = readFileSync(
  join(__dirname, "../../../../packages/ui/src/styles/recap-tokens.css"),
  "utf8",
);
const uiGlobals = readFileSync(
  join(__dirname, "../../../../packages/ui/src/styles/globals.css"),
  "utf8",
);
const desktopGlobals = readFileSync(
  join(__dirname, "../styles/globals.css"),
  "utf8",
);

describe("recap token palette", () => {
  it("defines the spec dark palette", () => {
    expect(tokensCss).toContain("--background: 220 12% 5%");
    expect(tokensCss).toContain("--card: 220 14% 9%");
    expect(tokensCss).toContain("--popover: 220 14% 12%");
    expect(tokensCss).toContain("--border: 220 13% 19%");
    expect(tokensCss).toContain("--foreground: 60 16% 94%");
    expect(tokensCss).toContain("--muted-foreground: 219 6% 57%");
  });

  it("uses electric blue only for primary, ring, and the named token", () => {
    const blueCount = (tokensCss.match(/227 100% 59%/g) ?? []).length;
    // dark: primary + ring + --recap-blue; light: primary + ring + --recap-blue
    expect(blueCount).toBe(6);
    expect(tokensCss).toContain("--recap-blue: 227 100% 59%");
  });

  it("sets 4px radius and is imported last by both stylesheets", () => {
    expect(tokensCss).toContain("--radius: 0.25rem");
    const lastImport = (css: string) =>
      [...css.matchAll(/@import\s+"([^"]+)"/g)].map((m) => m[1]).pop();
    expect(lastImport(uiGlobals)).toContain("recap-tokens");
    expect(lastImport(desktopGlobals)).toContain("recap-tokens");
  });
});
