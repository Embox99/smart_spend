import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import type { AuthResponse } from "@shared/types";
import AuthLayout from "../../components/layouts/AuthLayout";
import Input from "../../components/inputs/input";
import ProfilePhotoSelector from "../../components/inputs/ProfilePhotoSelector";
import { validateEmail } from "../../utils/helper";
import axiosInstance, { apiErrorMessage } from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPaths";
import { useUser } from "../../hooks/useUser";
import { setToken } from "../../utils/token";
import uploadImage from "../../utils/uploadImage";

const SignUp = () => {
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { updateUser } = useUser();

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();

    if (!fullName) {
      setError("Please enter your name");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data } = await axiosInstance.post<AuthResponse>(
        API_PATH.AUTH.REGISTER,
        { fullName, email, password }
      );

      if (!data.token) throw new Error("Registration did not return a token");
      setToken(data.token);

      // The upload endpoint requires authentication, so the avatar goes up
      // after the account exists. A failure here must not block sign-up.
      let signedUpUser = data.user;
      if (profilePic) {
        try {
          const uploaded = await uploadImage(profilePic);
          signedUpUser = uploaded.user ?? data.user;
        } catch {
          toast.error("Account created, but the photo could not be uploaded");
        }
      }

      updateUser(signedUpUser);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Create an Account
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-[5px] mb-6">
          Join us today by entering your details below.
        </p>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="Your name"
              type="text"
            />
            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="you@example.com"
              type="email"
            />
            <div className="col-span-2">
              <Input
                value={password}
                onChange={({ target }) => setPassword(target.value)}
                label="Password"
                placeholder="Min 6 characters"
                type="password"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-red-500 text-xs pb-2.5">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <p className="text-[13px] text-slate-700 dark:text-slate-300 mt-3">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
