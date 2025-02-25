import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("🔍 Sending login request:", formData);
      const response = await api.post("/auth/login/", formData);
      console.log("✅ Login successful:", response.data);

      login(response.data.access);
      localStorage.setItem("token", response.data.access); // Store JWT token
      navigate("/dashboard"); // Redirect after login
    } catch (err: any) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="bg-white shadow-md rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold text-primary mb-4">Login</h2>
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
            Login
          </button>
        </form>
        <p className="mt-4 text-textDark">
          Don't have an account?{" "}
          <a href="/register" className="text-primary">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
