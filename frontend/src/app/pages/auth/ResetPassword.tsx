// 📁 src/app/pages/auth/ResetPassword.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "@/lib/api/axiosClient";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      try {
        await axiosClient.post("/auth/check-reset-token/", { uid, token });
        setTokenValid(true);
      } catch {
        setTokenValid(false);
      } finally {
        setChecking(false);
      }
    };

    if (uid && token) checkToken();
  }, [uid, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!uid || !token) {
      setError("Invalid reset link.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await axiosClient.post("/auth/reset-password/", {
        uid,
        token,
        password,
        confirm,
      });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 w-96">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
          Reset Password
        </h2>

        {checking ? (
          <p className="text-center text-gray-600 dark:text-gray-300">
            Checking token...
          </p>
        ) : tokenValid === false ? (
          <div className="text-center text-red-500 dark:text-red-400">
            <p className="text-lg font-semibold">❌ This reset link has expired or is invalid.</p>
            <p className="mt-2">Please request a new password reset.</p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="mt-4 text-blue-600 dark:text-blue-400 underline"
            >
              Request New Link
            </button>
          </div>
        ) : success ? (
          <p className="text-green-500 text-center dark:text-green-400">
            ✅ Password updated! Redirecting to login...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm dark:text-red-400">{error}</p>}
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
