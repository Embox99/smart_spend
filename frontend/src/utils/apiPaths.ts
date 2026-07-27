export const BASE_URL: string =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API_PATH = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    LOGOUT: "/api/v1/auth/logout",
    GET_USER_INFO: "/api/v1/auth/getUser",
  },
  DASHBOARD: {
    GET_DATA: "/api/v1/dashboard",
  },
  INCOME: {
    ADD_INCOME: "/api/v1/income/add",
    GET_ALL_INCOME: "/api/v1/income/get",
    UPDATE_INCOME: (id: string) => `/api/v1/income/${id}`,
    DELETE_INCOME: (id: string) => `/api/v1/income/${id}`,
    DOWNLOAD_INCOME: "/api/v1/income/downloadexcel",
  },
  EXPENSE: {
    ADD_EXPENSE: "/api/v1/expense/add",
    GET_ALL_EXPENSE: "/api/v1/expense/get",
    UPDATE_EXPENSE: (id: string) => `/api/v1/expense/${id}`,
    DELETE_EXPENSE: (id: string) => `/api/v1/expense/${id}`,
    DOWNLOAD_EXPENSE: "/api/v1/expense/downloadexcel",
  },
  BUDGET: {
    GET_BUDGETS: "/api/v1/budget", // + ?month=YYYY-MM
    UPSERT_BUDGET: "/api/v1/budget",
    DELETE_BUDGET: (id: string) => `/api/v1/budget/${id}`,
  },
  IMAGE: {
    UPLOAD_IMAGE: "/api/v1/auth/upload-image",
  },
} as const;
