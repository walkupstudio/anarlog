import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ListenActionButton } from "./listen-action";

const { useListenerMock } = vi.hoisted(() => ({
  useListenerMock: vi.fn(),
}));

vi.mock("./floating/options-menu", () => ({
  OptionsMenu: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("./shared", () => ({
  ActionableTooltipContent: () => null,
  RecordingIcon: () => <span />,
  useCurrentNoteHasContent: () => false,
  useListenButtonState: () => ({
    shouldRender: true,
    isDisabled: false,
    warningMessage: "",
  }),
}));

vi.mock("~/store/zustand/tabs", () => ({
  useTabs: (selector: (state: { openNew: () => void }) => unknown) =>
    selector({ openNew: vi.fn() }),
}));

vi.mock("~/stt/contexts", () => ({
  useListener: useListenerMock,
}));

vi.mock("~/stt/useStartListening", () => ({
  useStartListening: () => vi.fn(),
}));

function mockListenerState({ loading }: { loading: boolean }) {
  useListenerMock.mockImplementation((selector) =>
    selector({
      live: { loading, sessionId: loading ? "session-1" : null },
      stop: vi.fn(),
    }),
  );
}

describe("ListenActionButton", () => {
  beforeEach(() => {
    mockListenerState({ loading: false });
  });

  afterEach(() => {
    cleanup();
  });

  test("start-listening button uses the primary surface", () => {
    render(<ListenActionButton sessionId="session-1" />);

    const button = screen.getByRole("button", { name: /Start listening/ });
    expect(button.className).toContain("bg-primary");
    expect(button.className).toContain("text-primary-foreground");
    expect(button.className).toContain("border-transparent");
    expect(button.className).toContain("hover:bg-primary/90");
    expect(button.className).not.toContain("bg-app-floating-panel");
  });

  test("loading (stop) state keeps the primary surface", () => {
    mockListenerState({ loading: true });

    render(<ListenActionButton sessionId="session-1" />);

    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-primary");
    expect(button.className).toContain("text-primary-foreground");
    expect(button.className).not.toContain("bg-app-floating-panel");
  });
});
