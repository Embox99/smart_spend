import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { hasLiveSession, setSessionExpiry } from "../utils/token";

const inMinutes = (minutes: number) =>
  new Date(Date.now() + minutes * 60_000).toISOString();

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
  it("renders the page while the session is live", () => {
    setSessionExpiry(inMinutes(60));
    renderAt();

    expect(screen.getByText("Secret dashboard")).toBeInTheDocument();
  });

  it("redirects when there is no session", () => {
    renderAt();

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("redirects on a lapsed session rather than rendering first", () => {
    setSessionExpiry(inMinutes(-1));
    renderAt();

    expect(screen.queryByText("Secret dashboard")).not.toBeInTheDocument();
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("discards the stale marker on the way out", () => {
    setSessionExpiry(inMinutes(-1));
    renderAt();

    expect(hasLiveSession()).toBe(false);
  });
});
