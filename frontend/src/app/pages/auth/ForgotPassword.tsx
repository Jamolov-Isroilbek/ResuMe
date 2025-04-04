// 📁 src/app/pages/auth/ForgotPassword.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "@/lib/api/axiosClient";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosClient.post("/auth/forgot-password/", { email });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to send reset link", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Forgot Password</h2>
        {submitted ? (
          <p className="text-green-500 text-center">
            ✅ If this email exists, a reset link has been sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
