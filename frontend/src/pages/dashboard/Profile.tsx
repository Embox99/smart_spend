import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { LuTrash2, LuUpload } from "react-icons/lu";
import type { User } from "@shared/types";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Input from "../../components/inputs/input";
import CharAvatar from "../../components/cards/CharAvatar";
import axiosInstance, { apiErrorMessage } from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPaths";
import { queryKeys } from "../../utils/queryKeys";
import { useUser } from "../../hooks/useUser";
import { validateEmail } from "../../utils/helper";
import uploadImage from "../../utils/uploadImage";

const Profile = () => {
  const { user, updateUser } = useUser();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Seed the form once the user arrives, without clobbering later edits.
  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setEmail(user.email);
  }, [user]);

  const applyUser = (next: User) => {
    updateUser(next);
    queryClient.setQueryData(queryKeys.user, next);
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return toast.error("Name is required");
    if (!validateEmail(email)) return toast.error("Enter a valid email address");

    setSavingProfile(true);
    try {
      const { data } = await axiosInstance.patch<User>(
        API_PATH.AUTH.UPDATE_PROFILE,
        { fullName, email }
      );
      applyUser(data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("The new passwords do not match");
    }

    setSavingPassword(true);
    try {
      await axiosInstance.patch(API_PATH.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed — other devices were signed out");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to change password"));
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePhotoChange = async (file: File) => {
    try {
      const uploaded = await uploadImage(file);
      applyUser(uploaded.user);
      toast.success("Photo updated");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to upload the photo"));
    }
  };

  const handlePhotoRemove = async () => {
    try {
      const { data } = await axiosInstance.delete<User>(
        API_PATH.AUTH.REMOVE_PROFILE_IMAGE
      );
      applyUser(data);
      toast.success("Photo removed");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to remove the photo"));
    }
  };

  return (
    <DashboardLayout activeMenu="Profile">
      <div className="my-5 mx-auto max-w-2xl">
        <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
          Profile
        </h4>

        {/* ── photo ── */}
        <div className="card mb-6">
          <h5 className="text-lg mb-4">Photo</h5>
          <div className="flex items-center gap-5">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt=""
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <CharAvatar
                fullName={user?.fullName}
                width="w-20"
                height="h-20"
                style="text-xl"
              />
            )}

            <div className="flex flex-wrap gap-2">
              <label className="add-btn cursor-pointer">
                <LuUpload className="text-base" />
                {user?.profileImageUrl ? "Replace" : "Upload"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handlePhotoChange(file);
                    e.target.value = "";
                  }}
                />
              </label>

              {user?.profileImageUrl && (
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => void handlePhotoRemove()}
                >
                  <LuTrash2 className="text-base" /> Remove
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            PNG, JPEG or WebP, up to 2 MB.
          </p>
        </div>

        {/* ── details ── */}
        <form className="card mb-6" onSubmit={handleProfileSubmit}>
          <h5 className="text-lg mb-4">Details</h5>
          <Input
            value={fullName}
            onChange={({ target }) => setFullName(target.value)}
            label="Full Name"
            type="text"
          />
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            type="email"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="add-btn add-btn-fill"
              disabled={savingProfile}
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* ── password ── */}
        <form className="card" onSubmit={handlePasswordSubmit}>
          <h5 className="text-lg mb-1">Password</h5>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            Changing it signs you out everywhere else.
          </p>
          <Input
            value={currentPassword}
            onChange={({ target }) => setCurrentPassword(target.value)}
            label="Current Password"
            type="password"
          />
          <Input
            value={newPassword}
            onChange={({ target }) => setNewPassword(target.value)}
            label="New Password"
            placeholder="Min 6 characters"
            type="password"
          />
          <Input
            value={confirmPassword}
            onChange={({ target }) => setConfirmPassword(target.value)}
            label="Confirm New Password"
            type="password"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="add-btn add-btn-fill"
              disabled={savingPassword}
            >
              {savingPassword ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
