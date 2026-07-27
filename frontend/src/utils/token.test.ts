import { describe, expect, it } from "vitest";
import { clearSession, hasLiveSession, setSessionExpiry } from "./token";

const inMinutes = (minutes: number) =>
  new Date(Date.now() + minutes * 60_000).toISOString();

describe("session expiry", () => {
  it("reports a live session while the expiry is ahead", () => {
    setSessionExpiry(inMinutes(60));

    expect(hasLiveSession()).toBe(true);
  });

  it("reports no session once the expiry has passed", () => {
    setSessionExpiry(inMinutes(-1));

    expect(hasLiveSession()).toBe(false);
  });

  it("reports no session when nothing was stored", () => {
    expect(hasLiveSession()).toBe(false);
  });

  it("reports no session for an unparseable value", () => {
    localStorage.setItem("sessionExpiresAt", "not-a-date");

    expect(hasLiveSession()).toBe(false);
  });

  it("forgets the session on clear", () => {
    setSessionExpiry(inMinutes(60));
    clearSession();

    expect(hasLiveSession()).toBe(false);
  });

  it("never stores anything token-shaped", () => {
    setSessionExpiry(inMinutes(60));

    // The whole point: a script reading localStorage finds no credential.
    expect(JSON.stringify(localStorage)).not.toContain("eyJ");
  });
});
