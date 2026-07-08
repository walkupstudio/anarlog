import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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

describe("recap font tokens survive the ui dist bundle", () => {
  const distPath = join(__dirname, "../../../../packages/ui/dist/globals.css");

  const readDistCss = () => {
    if (!existsSync(distPath)) {
      throw new Error(
        `packages/ui/dist/globals.css not found — run "pnpm -F @hypr/ui build" before running this test.`,
      );
    }
    return readFileSync(distPath, "utf8");
  };

  it("bundles the Recap font families", () => {
    const distCss = readDistCss();
    expect(distCss).toContain("Inter");
    expect(distCss).toContain("JetBrains Mono");
  });

  it("wins the cascade: the last --font-sans declaration uses Inter", () => {
    const distCss = readDistCss();
    const declarations = [...distCss.matchAll(/--font-sans:\s*([^;]+);/g)].map(
      (m) => m[1],
    );
    expect(declarations.length).toBeGreaterThan(0);
    const lastDeclaration = declarations[declarations.length - 1];
    expect(lastDeclaration).toContain("Inter");
  });
});

describe("editor CSS is fully retokened (no hardcoded hex colors)", () => {
  // No exceptions expected. If a physical-color literal is ever genuinely
  // required (e.g. a fixed-white checkmark that must never invert), add its
  // relative path here with a comment explaining why, and note it in
  // FORK.md's Phase C section.
  const allowlist: string[] = [];

  const editorStylesDir = join(
    __dirname,
    "../../../../packages/editor/src/styles",
  );

  function collectCssFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        return collectCssFiles(fullPath);
      }
      return entry.endsWith(".css") ? [fullPath] : [];
    });
  }

  it("contains no #hex color literals outside the allowlist", () => {
    const hexPattern = /#[0-9a-fA-F]{3,6}\b/g;
    const offenders: string[] = [];

    for (const filePath of collectCssFiles(editorStylesDir)) {
      const relativePath = filePath.slice(
        filePath.indexOf("packages/editor/src/styles"),
      );
      if (allowlist.includes(relativePath)) {
        continue;
      }

      const css = readFileSync(filePath, "utf8");
      const matches = css.match(hexPattern);
      if (matches) {
        offenders.push(`${relativePath}: ${matches.join(", ")}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});
