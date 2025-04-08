import React, { useState } from "react";
import api from "@/lib/api/axiosClient";
import { useAsync } from "@/lib/hooks/useAsync";
import { Button } from "@/lib/ui/buttons/Button";
import { Loader } from "@/lib/ui/common/Loader";
import { APIResponse } from "@/types/shared/api";
import { ProfileStats } from "@/features/profile/ProfileStats";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { InputField } from "@/features/resume/components/form";

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

  const navigate = useNavigate();
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

    await api.put("/me/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete your account? This action is permanent and will remove all your resumes."
    );
    if (!confirmDelete) return;

    try {
      await api.delete("/users/me/delete/");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      document.cookie = "refresh=; Max-Age=0; path=/;";
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete account. Please try again.");
      console.error("Account deletion failed:", error);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500">Error loading profile</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12">
      <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-800 rounded-xl shadow-md p-6">
        <ProfileStats />
        <form onSubmit={handleUpdateProfile} className="space-y-8">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-32">
              <img
                src={
                  `${user?.data.profile_picture}?v=${Date.now()}` ||
                  "/default.png"
                }
                alt="Profile"
                className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md"
                onError={(e) => {
                  e.currentTarget.src = "/defaultr.png";
                }}
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-700 transition">
                Edit
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              PNG, JPG, or JPEG – Max 5MB
            </p>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white pt-6 pb-2">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Username"
                type="text"
                value={formState.username}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />
              <InputField
                label="Email"
                type="email"
                value={formState.email}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="pt-10 border-t border-gray-200 dark:border-zinc-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Change Password
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Current Password"
                type="password"
                value={formState.oldPassword}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    oldPassword: e.target.value,
                  }))
                }
              />
              <InputField
                label="New Password"
                type="password"
                value={formState.newPassword}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
              />
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm mt-2">{passwordError}</p>
            )}
            <Button
              variant="secondary"
              onClick={handleChangePassword}
              className="w-full mt-4"
            >
              Update Password
            </Button>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-6 hover:bg-blue-700 transition"
          >
            Save Changes
          </Button>

          <Button
            variant="danger"
            className="w-full mt-2 hover:bg-red-700 transition"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
