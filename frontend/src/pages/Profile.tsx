import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  if (!isAuthenticated) {
    return <p className="text-center text-red-500">You must be logged in to access this page.</p>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put("/auth/update-profile/", formData);
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="bg-white shadow-md rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold text-primary mb-4">Update Profile</h2>
        {message && <p className="text-green-500">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="New Username"
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="New Email"
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="New Password"
            className="w-full px-4 py-2 border rounded-md"
          />
          <button type="submit" className="w-full bg-primary text-white py-2 rounded-md hover:bg-secondary">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
