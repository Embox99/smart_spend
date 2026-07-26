import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "./themeContext";

/** Two independent consumers — they must agree on the same state. */
const Consumer = ({ id }: { id: string }) => {
  const { isDark, toggle } = useTheme();
  return (
    <button type="button" onClick={toggle} data-testid={id}>
      {isDark ? "dark" : "light"}
    </button>
  );
};

describe("ThemeProvider", () => {
  it("keeps every consumer in sync", async () => {
    render(
      <ThemeProvider>
        <Consumer id="a" />
        <Consumer id="b" />
      </ThemeProvider>
    );

    expect(screen.getByTestId("a")).toHaveTextContent("light");
    expect(screen.getByTestId("b")).toHaveTextContent("light");

    await userEvent.click(screen.getByTestId("a"));

    expect(screen.getByTestId("a")).toHaveTextContent("dark");
    expect(screen.getByTestId("b")).toHaveTextContent("dark");
  });

  it("reflects the choice on the html element and in storage", async () => {
    render(
      <ThemeProvider>
        <Consumer id="a" />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByTestId("a"));

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("restores a stored preference on mount", () => {
    localStorage.setItem("theme", "dark");

    render(
      <ThemeProvider>
        <Consumer id="a" />
      </ThemeProvider>
    );

    expect(screen.getByTestId("a")).toHaveTextContent("dark");
  });

  it("throws when used outside the provider", () => {
    expect(() => render(<Consumer id="a" />)).toThrow(
      /must be used inside a ThemeProvider/
    );
  });
});
