import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const loadSettings = vi.hoisted(() => vi.fn());

vi.mock("@hypr/plugin-settings", () => ({
  commands: {
    load: loadSettings,
  },
}));

import {
  bootstrapThemeFromSettings,
  normalizeThemePreference,
  resolveBootIsDark,
  themePreferenceFromSettings,
} from "./apply";

function mockSystemTheme(prefersDark: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: prefersDark,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
}

beforeEach(() => {
  loadSettings.mockReset();
  localStorage.clear();
  document.documentElement.className = "";
  mockSystemTheme(false);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("normalizeThemePreference", () => {
  it("returns stored theme values", () => {
    expect(normalizeThemePreference("light")).toBe("light");
    expect(normalizeThemePreference("dark")).toBe("dark");
    expect(normalizeThemePreference("system")).toBe("system");
  });

  it("defaults to dark when nothing is stored (Recap fork)", () => {
    expect(normalizeThemePreference(null)).toBe("dark");
    expect(normalizeThemePreference("invalid")).toBe("dark");
  });
});

describe("themePreferenceFromSettings", () => {
  it("reads the persisted general.theme value", () => {
    expect(
      themePreferenceFromSettings({
        general: { theme: "dark" },
      }),
    ).toBe("dark");
  });

  it("defaults to dark when theme is missing (Recap fork)", () => {
    expect(themePreferenceFromSettings({ general: {} })).toBe("dark");
    expect(themePreferenceFromSettings(undefined)).toBe("dark");
  });
});

describe("resolveBootIsDark", () => {
  it("honors explicit light and dark preferences", () => {
    expect(resolveBootIsDark("light", true)).toBe(false);
    expect(resolveBootIsDark("dark", false)).toBe(true);
  });

  it("follows system preference when stored theme is system, but defaults to dark when missing", () => {
    expect(resolveBootIsDark("system", true)).toBe(true);
    expect(resolveBootIsDark("system", false)).toBe(false);
    expect(resolveBootIsDark(null, true)).toBe(true); // null → "dark" → true
    expect(resolveBootIsDark(null, false)).toBe(true); // null → "dark" → true (Recap fork)
  });

  it("treats invalid boot values as dark (Recap fork default)", () => {
    expect(resolveBootIsDark("legacy-value", true)).toBe(true); // invalid → "dark" → true
    expect(resolveBootIsDark("legacy-value", false)).toBe(true); // invalid → "dark" → true (Recap fork)
  });
});

describe("bootstrapThemeFromSettings", () => {
  it("applies persisted settings before resolving when load is prompt", async () => {
    loadSettings.mockResolvedValue({
      status: "ok",
      data: { general: { theme: "dark" } },
    });

    await bootstrapThemeFromSettings({ timeoutMs: 100 });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("hypr-theme")).toBe("dark");
  });

  it("does not hold startup past the deadline when settings load stalls", async () => {
    vi.useFakeTimers();

    let resolveLoad!: (value: {
      status: "ok";
      data: { general: { theme: "dark" } };
    }) => void;
    loadSettings.mockReturnValue(
      new Promise((resolve) => {
        resolveLoad = resolve;
      }),
    );

    const bootstrap = bootstrapThemeFromSettings({ timeoutMs: 20 });
    let resolved = false;
    void bootstrap.then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(20);

    expect(resolved).toBe(true);
    expect(localStorage.getItem("hypr-theme")).toBe(null);

    resolveLoad({
      status: "ok",
      data: { general: { theme: "dark" } },
    });
    await Promise.resolve();

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("hypr-theme")).toBe("dark");
  });
});
