import React, { useEffect, useState } from "react";
import api from "../services/api";

const Profile: React.FC = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    profile_picture: "/media/profile_pics/default.png", // ✅ Default profile image
    date_joined: "",
  });

  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFileInput, setShowFileInput] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("❌ No authentication token found.");
        alert("You need to log in again.");
        return;
      }

      console.log("🔍 Using token for request:", token); // ✅ Log the token for debugging

      try {
        const response = await api.get("/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("✅ Profile fetched successfully:", response.data);
        setUser({
          ...response.data,
          profile_picture:
            response.data.profile_picture || "/media/profile_pics/default.png", // ✅ Use default if missing
        });
        setNewUsername(response.data.username);
        setNewEmail(response.data.email);
      } catch (error: any) {
        console.error(
          "❌ Failed to fetch profile:",
          error.response?.data || error
        );
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpdateProfilePicture = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("profile_picture", selectedFile);

    try {
      const response = await api.put("/me/", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Profile picture updated successfully!");
      setUser({ ...user, profile_picture: response.data.profile_picture }); // Update UI
      setShowFileInput(false); // ✅ Hide file input after upload
    } catch (error) {
      console.error("❌ Failed to update profile picture", error);
    }
  };

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append("username", newUsername);
    formData.append("email", newEmail);
    if (selectedFile) {
      formData.append("profile_picture", selectedFile);
    }

    try {
      const response = await api.put("/me/", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Profile updated successfully");
      setUser(response.data);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const handleUpdateUsername = async () => {
    try {
      await api.put(
        "/me/",
        { username: newUsername },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Username updated successfully!");
    } catch (error) {
      console.error("Failed to update username", error);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.oldPassword || !passwords.newPassword) {
      alert("❌ Both fields are required.");
      return;
    }
    try {
      await api.put("/change-password/", {
          old_password: passwords.oldPassword,
          new_password: passwords.newPassword
        }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Password updated successfully!");
      setPasswords({ oldPassword: "", newPassword: "" }); // ✅ Clear fields after success
    } catch (error: any) {
      console.error("Failed to change password", error);
      alert("❌ " + (error.response?.data?.old_password || error.response?.data?.new_password || "Password change failed"));
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center">
        {/* Profile Picture */}
        <img
          src={user.profile_picture}
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto border-4 border-gray-300 shadow-md"
          onError={(e) =>
            (e.currentTarget.src =
              "http://localhost:8000/media/profile_pics/default.png")
          }
        />

        {/* Upload Profile Picture */}
        <button
          onClick={() => setShowFileInput(!showFileInput)}
          className="mt-4 bg-gray-500 text-white px-6 py-2 rounded-md shadow hover:bg-gray-600 transition"
        >
          Update Profile Picture
        </button>

        {/* File Upload (Only Shows When Button is Clicked) */}
        {showFileInput && (
          <div className="mt-2">
            <input
              type="file"
              onChange={handleFileChange}
              className="border p-2 w-full"
            />
            <button
              onClick={handleUpdateProfilePicture}
              className="mt-2 bg-blue-500 text-white px-6 py-2 rounded-md shadow hover:bg-blue-600 transition"
            >
              Upload
            </button>
          </div>
        )}

        {/* Profile Info */}
        <h2 className="text-2xl font-bold mt-4">{user.username}</h2>
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mt-2"
        />

        <input
          type="text"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mt-2"
        />

        <button
          onClick={handleUpdateProfile}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md shadow hover:bg-blue-600 transition"
        >
          Update Profile
        </button>

        {/* Change Password */}
        <input
          type="password"
          placeholder="Old Password"
          onChange={(e) =>
            setPasswords({ ...passwords, oldPassword: e.target.value })
          }
          className="w-full px-4 py-2 border rounded-md mt-2"
        />
        <input
          type="password"
          placeholder="New Password"
          onChange={(e) =>
            setPasswords({ ...passwords, newPassword: e.target.value })
          }
          className="w-full px-4 py-2 border rounded-md mt-2"
        />
        <button
          onClick={handleChangePassword}
          className="bg-red-500 text-white px-6 py-2 rounded-md mt-2"
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default Profile;
