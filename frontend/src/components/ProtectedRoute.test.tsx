import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { getToken, setToken } from "../utils/token";

const tokenExpiringIn = (seconds: number): string =>
  `header.${btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + seconds })
  )}.sig`;

const renderAt = (path = "/dashboard") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <p>Secret dashboard</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe("ProtectedRoute", () => {
  it("renders the page for a valid token", () => {
    setToken(tokenExpiringIn(3600));
    renderAt();

    expect(screen.getByText("Secret dashboard")).toBeInTheDocument();
  });

  it("redirects when there is no token", () => {
    renderAt();

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("redirects on an expired token rather than rendering first", () => {
    setToken(tokenExpiringIn(-1));
    renderAt();

    expect(screen.queryByText("Secret dashboard")).not.toBeInTheDocument();
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("discards the expired token on the way out", () => {
    setToken(tokenExpiringIn(-1));
    renderAt();

    expect(getToken()).toBeNull();
  });
});
