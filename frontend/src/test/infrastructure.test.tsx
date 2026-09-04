import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("test infrastructure", () => {
  it("renders React components with jest-dom assertions", () => {
    render(<button type="button">Save changes</button>);

    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });
});