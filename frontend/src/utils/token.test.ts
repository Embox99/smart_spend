import { describe, expect, it } from "vitest";
import { clearToken, getToken, isTokenValid, setToken } from "./token";

/** Builds an unsigned JWT-shaped string with the given expiry. */
const tokenExpiringIn = (seconds: number): string => {
  const payload = { exp: Math.floor(Date.now() / 1000) + seconds };
  return `header.${btoa(JSON.stringify(payload))}.signature`;
};

describe("token", () => {
  it("round-trips through localStorage", () => {
    setToken("abc");
    expect(getToken()).toBe("abc");
    clearToken();
    expect(getToken()).toBeNull();
  });

  it("accepts a token that has not expired", () => {
    expect(isTokenValid(tokenExpiringIn(3600))).toBe(true);
  });

  it("rejects an expired token", () => {
    expect(isTokenValid(tokenExpiringIn(-60))).toBe(false);
  });

  it("rejects anything that is not a readable token", () => {
    expect(isTokenValid(null)).toBe(false);
    expect(isTokenValid("")).toBe(false);
    expect(isTokenValid("garbage")).toBe(false);
    expect(isTokenValid("a.not-base64!.c")).toBe(false);
    expect(isTokenValid(`header.${btoa('{"sub":"x"}')}.sig`)).toBe(false);
  });
});
