import { lazy, Suspense, type ReactElement } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import { isTokenValid } from "./utils/token";

// Charts and the emoji picker are heavy and only needed once signed in.
const Login = lazy(() => import("./pages/auth/Login"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const Home = lazy(() => import("./pages/dashboard/Home"));
const Income = lazy(() => import("./pages/dashboard/Income"));
const Expense = lazy(() => import("./pages/dashboard/Expense"));
const Budgets = lazy(() => import("./pages/dashboard/Budgets"));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const Root = () => (
  <Navigate to={isTokenValid() ? "/dashboard" : "/login"} replace />
);

const protectedRoutes: { path: string; element: ReactElement }[] = [
  { path: "/dashboard", element: <Home /> },
  { path: "/income", element: <Income /> },
  { path: "/expense", element: <Expense /> },
  { path: "/budgets", element: <Budgets /> },
];

const App = () => (
  <Router>
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />

        {protectedRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={<ProtectedRoute>{element}</ProtectedRoute>}
          />
        ))}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>

    <Toaster toastOptions={{ style: { fontSize: "13px" } }} />
  </Router>
);

export default App;
