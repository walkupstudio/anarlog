import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RecapWordmark } from "./wordmark";

describe("RecapWordmark", () => {
  it("renders the name with a blue terminal period", () => {
    render(<RecapWordmark />);
    const mark = screen.getByText("Recap");
    expect(mark).toBeTruthy();
    const period = screen.getByText(".");
    expect(period.className).toContain("text-[hsl(var(--recap-blue))]");
  });
});
