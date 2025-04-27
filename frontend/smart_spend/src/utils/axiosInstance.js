import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interseptor

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Responce Interceptor

axiosInstance.interceptors.response.use(
  (responce) => {
    return responce;
  },
  (error) => {
    // Handle common errors
    if (error.responce) {
      if (error.responce.status === 401) {
        //Redirect to login page
        window.location.href = "/login";
      } else if (error.responce.status === 500) {
        console.error("Server Error. Please try again");
      }
    } else if ((error.code = "ECONNABORTED")) {
      console.error("Request timeout. Please try again");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
