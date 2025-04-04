import React, { useState } from "react";
import api from "@/lib/api/axiosClient";
import { useAsync } from "@/lib/hooks/useAsync";
import { Button } from "@/lib/ui/buttons/Button";
import { Loader } from "@/lib/ui/common/Loader";
import { APIResponse } from "@/types/shared/api";
import { ProfileStats } from "@/features/profile/ProfileStats";

interface UserProfile {
  username: string;
  email: string;
  profile_picture: string;
  date_joined: string;
}

const Profile: React.FC = () => {
  const {
    data: user,
    loading,
    error,
    refresh,
  } = useAsync<APIResponse<UserProfile>>(() => api.get<UserProfile>("/me/"));

  const [passwordError, setPasswordError] = useState("");
  const [formState, setFormState] = useState({
    username: "",
    email: "",
    oldPassword: "",
    newPassword: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", formState.username);
    formData.append("email", formState.email);
    if (selectedFile) formData.append("profile_picture", selectedFile);

    await api.put("/me/", formData);
    refresh();
  };

  const handleChangePassword = async () => {
    try {
      if (!formState.oldPassword || !formState.newPassword) {
        setPasswordError("Both fields are required");
        return;
      }

      await api.put("/change-password/", {
        old_password: formState.oldPassword,
        new_password: formState.newPassword,
      });
      setFormState((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
      setPasswordError("");
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || "Password update failed");
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500">Error loading profile</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12">
      <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-800 rounded-xl shadow-md p-6">
        <form onSubmit={handleUpdateProfile} className="space-y-8">
          {/* Profile Picture */}
          <div className="text-center">
            <img
              src={
                `${user?.data.profile_picture}?v=${Date.now()}` ||
                "/default.png"
              }
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg"
              onError={(e) => {
                e.currentTarget.src = "/defaultr.png";
              }}
            />

            <div className="mt-4">
              <label className="cursor-pointer inline-block text-gray-600 dark:text-gray-300">
                Change Photo
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg border dark:border-zinc-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Your Resume Statistics
            </h2>
            <ProfileStats />
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Username
              </label>
              <input
                type="text"
                value={formState.username}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email
              </label>
              <input
                type="email"
                value={formState.email}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, email: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Password Change */}
          <div className="pt-6 border-t border-gray-200 dark:border-zinc-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Change Password
            </h3>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                value={formState.oldPassword}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    oldPassword: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm"
              />
              <input
                type="password"
                placeholder="New Password"
                value={formState.newPassword}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm"
              />
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
              <Button
                variant="secondary"
                onClick={handleChangePassword}
                className="w-full"
              >
                Update Password
              </Button>
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-6">
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
