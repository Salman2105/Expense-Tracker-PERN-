import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("../domain/auth/useAuth", () => ({
  useAuth: () => ({
    logout: vi.fn(),
    user: {
      username: "demo",
      profilePicture: null,
    },
  }),
}));

vi.mock("../i18n/i18n-context", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

import AppLayout from "../app/layouts/AppLayout";

describe("test infrastructure", () => {
  it("renders React components with jest-dom assertions", () => {
    render(<button type="button">Save changes</button>);

    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("exposes a mobile drawer trigger in the app layout", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 375,
    });

    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "Open navigation menu" })).toBeInTheDocument();
  });
});