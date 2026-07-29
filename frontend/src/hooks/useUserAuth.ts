import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { User } from "@shared/types";
import axiosInstance from "../utils/axiosInstance";
import { API_PATH } from "../utils/apiPaths";
import { queryKeys } from "../utils/queryKeys";
import { clearSession, hasLiveSession } from "../utils/token";
import { useUser } from "./useUser";

interface UseUserAuthResult {
  user: User | null;
  isLoading: boolean;
  /** The profile could not be loaded for a reason other than a dead session. */
  isUnavailable: boolean;
}

/** Only a rejected session should end it; anything else is a transient fault. */
const isSessionRejected = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 401;

/**
 * Loads the signed-in user once per session and mirrors it into UserContext,
 * which the layout and side menu read from.
 */
export const useUserAuth = (): UseUserAuthResult => {
  const { user, updateUser, clearUser } = useUser();
  const navigate = useNavigate();

  const { data, error, isError } = useQuery({
    queryKey: queryKeys.user,
    queryFn: async () => {
      const res = await axiosInstance.get<User>(API_PATH.AUTH.GET_USER_INFO);
      return res.data;
    },
    enabled: hasLiveSession(),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) updateUser(data);
  }, [data, updateUser]);

  useEffect(() => {
    // A dropped connection or a 500 used to land here too, so a moment
    // offline signed the user out of a session that was still perfectly good.
    if (!isSessionRejected(error)) return;
    clearSession();
    clearUser();
    navigate("/login", { replace: true });
  }, [error, clearUser, navigate]);

  const rejected = isSessionRejected(error);

  return {
    user,
    isLoading: !user && !isError,
    isUnavailable: isError && !rejected && !user,
  };
};
