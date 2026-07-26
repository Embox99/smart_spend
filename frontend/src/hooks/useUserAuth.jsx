import { useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATH } from "../utils/apiPaths";
import { getToken, clearToken } from "../utils/token";

/**
 * Loads the signed-in user once per session and mirrors it into UserContext,
 * which the layout and side menu read from.
 */
export const useUserAuth = () => {
  const { user, updateUser, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const { data, isError } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axiosInstance.get(API_PATH.AUTH.GET_USER_INFO);
      return res.data;
    },
    enabled: Boolean(getToken()),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) updateUser(data);
  }, [data, updateUser]);

  useEffect(() => {
    if (!isError) return;
    clearToken();
    clearUser();
    navigate("/login", { replace: true });
  }, [isError, clearUser, navigate]);

  return { user, isLoading: !user && !isError };
};
