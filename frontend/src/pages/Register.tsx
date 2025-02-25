import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Ensure this handles API requests

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("🔍 Registering user:", formData);
      await api.post("/auth/register/", formData);
      console.log("✅ Registration successful");
      navigate("/login");
    } catch (err: any) {
      console.error(
        "❌ Registration failed:",
        err.response?.data || err.message
      );
      setError("Failed to register. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="bg-white shadow-md rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold text-primary mb-4">Register</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-secondary"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-textDark">
          Already have an account?{" "}
          <a href="/login" className="text-primary">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
