import React, { useState, useEffect } from "react";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.data) {
      setFormState(prevState => ({
        ...prevState,
        username: user.data.username || "",
        email: user.data.email || "",
        oldPassword: "",
        newPassword: "",
      }));
    }
  }, [user?.data]);
  
  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      
      // Create a preview URL for immediate display
      const objectUrl = URL.createObjectURL(files[0]);
      setPreviewUrl(objectUrl);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Only append if values are different from current user data
      if (formState.username !== user?.data.username) {
        formData.append("username", formState.username);
      }
      
      if (formState.email !== user?.data.email) {
        formData.append("email", formState.email);
      }
      
      // Only append file if selected
      if (selectedFile) {
        formData.append("profile_picture", selectedFile);
      }
      
      // Only make the request if there are changes
      if (formData.has("username") || formData.has("email") || formData.has("profile_picture")) {
        await api.put("/me/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        
        toast.success("Profile updated successfully");
        
        // Don't reset the preview until we've confirmed the update succeeded
        // The preview will continue to show until the refresh completes
        
        // Refresh user data in the background
        refresh();
      } else {
        toast.info("No changes to save");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.detail || "Failed to update profile");
      // If upload failed, revert to the original image
      setPreviewUrl(null);
    } finally {
      setIsSubmitting(false);
      setSelectedFile(null);
    }
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
      toast.success("Password updated successfully");
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || "Password update failed");
      toast.error("Password update failed");
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

  // Use the preview URL if available, otherwise use the profile picture from the user data
  const profilePicUrl = previewUrl || 
    (user?.data.profile_picture ? `${user.data.profile_picture}?t=${Date.now()}` : "/default.png");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12">
      <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-800 rounded-xl shadow-md p-6">
        <ProfileStats />
        <form onSubmit={handleUpdateProfile} className="space-y-8">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-32">
              <img
                src={profilePicUrl}
                alt="Profile"
                className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md"
                onError={(e) => {
                  e.currentTarget.src = "/default.png";
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
            {selectedFile && (
              <p className="text-sm text-green-500">
                Selected: {selectedFile.name}
              </p>
            )}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
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