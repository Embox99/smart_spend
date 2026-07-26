import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { AuthResponse } from "@shared/types";
import AuthLayout from "../../components/layouts/AuthLayout";
import Input from "../../components/inputs/input";
import { validateEmail } from "../../utils/helper";
import axiosInstance, { apiErrorMessage } from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPaths";
import { useUser } from "../../hooks/useUser";
import { setToken } from "../../utils/token";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { updateUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data } = await axiosInstance.post<AuthResponse>(
        API_PATH.AUTH.LOGIN,
        { email, password }
      );

      if (data.token) {
        setToken(data.token);
        updateUser(data.user);
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Welcome Back
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-[5px] mb-6">
          Please enter your details to log in
        </p>

        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="you@example.com"
            type="email"
          />
          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Min 6 characters"
            type="password"
          />

          {error && (
            <p role="alert" className="text-red-500 text-xs pb-2.5">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-[13px] text-slate-700 dark:text-slate-300 mt-3">
            Don&apos;t have an account?{" "}
            <Link to="/signUp" className="font-medium text-primary underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
