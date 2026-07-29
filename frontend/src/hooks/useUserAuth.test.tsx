import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AxiosError, AxiosHeaders } from "axios";
import type { ReactNode } from "react";
import { useUserAuth } from "./useUserAuth";
import UserProvider from "../context/userContext";
import axiosInstance from "../utils/axiosInstance";
import { hasLiveSession, setSessionExpiry } from "../utils/token";

const navigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom"
    );
  return { ...actual, useNavigate: () => navigate };
});

const get = vi.spyOn(axiosInstance, "get");
let queryClient: QueryClient;

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <QueryClientProvider client={queryClient}>
      <UserProvider>{children}</UserProvider>
    </QueryClientProvider>
  </MemoryRouter>
);

const axiosErrorWithStatus = (status: number) => {
  const headers = new AxiosHeaders();
  return new AxiosError("failed", "ERR", { headers }, undefined, {
    status,
    statusText: "",
    headers,
    config: { headers },
    data: {},
  });
};

beforeEach(() => {
  navigate.mockClear();
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  setSessionExpiry(new Date(Date.now() + 3_600_000).toISOString());
});

afterEach(() => {
  get.mockReset();
});

describe("useUserAuth", () => {
  it("keeps the session when the profile request fails on the network", async () => {
    // No response at all — the classic dropped-connection shape.
    get.mockRejectedValue(new AxiosError("Network Error", "ERR_NETWORK"));

    const { result } = renderHook(() => useUserAuth(), { wrapper });

    await waitFor(() => expect(result.current.isUnavailable).toBe(true));
    expect(navigate).not.toHaveBeenCalled();
    expect(hasLiveSession()).toBe(true);
  });

  it("keeps the session when the server answers 500", async () => {
    get.mockRejectedValue(axiosErrorWithStatus(500));

    const { result } = renderHook(() => useUserAuth(), { wrapper });

    await waitFor(() => expect(result.current.isUnavailable).toBe(true));
    expect(navigate).not.toHaveBeenCalled();
    expect(hasLiveSession()).toBe(true);
  });

  it("ends the session only when it is rejected", async () => {
    get.mockRejectedValue(axiosErrorWithStatus(401));

    renderHook(() => useUserAuth(), { wrapper });

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith("/login", { replace: true })
    );
    expect(hasLiveSession()).toBe(false);
  });

  it("reports the user once loaded", async () => {
    get.mockResolvedValue({
      data: { _id: "u1", fullName: "Ada", email: "a@b.co" },
    } as never);

    const { result } = renderHook(() => useUserAuth(), { wrapper });

    await waitFor(() => expect(result.current.user?.fullName).toBe("Ada"));
    expect(result.current.isUnavailable).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
