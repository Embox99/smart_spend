import { useContext, useEffect } from "react";
import { UserContext } from "../context/userContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATH } from "../utils/apiPaths";
import { useNavigate } from "react-router-dom";

export const useUserAuth = () => {
  const { user, updateUser, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchUserInfo = async () => {
      try {
        const responce = await axiosInstance.get(API_PATH.AUTH.GET_USER_INFO);

        if (isMounted && responce.data) {
          updateUser(responce.data);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        if (isMounted) {
          clearUser();
          navigate("/login");
        }
      }
    };
    fetchUserInfo();
    return () => {
      isMounted = false;
    };
  },[updateUser, clearUser, navigate]);
};
