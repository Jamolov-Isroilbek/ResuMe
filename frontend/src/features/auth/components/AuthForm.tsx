import { Button } from "@/lib/ui/buttons/Button";
import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "@/lib/api/axiosClient";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = mode === "login" ? "/auth/login/" : "/auth/register/";
      const payload =
        mode === "login"
          ? { username: formData.username, password: formData.password }
          : formData;

      const response = await axiosClient.post(endpoint, payload);

      if (mode === "login") {
        login(response.data.access, response.data.refresh);
        navigate("/dashboard");
      } else {
        const email = response.data.email;
        navigate("/email-verification", { state: { email } });
        // navigate("/login", {
        //   state: { success: "Registration successful! Check your email to verify your account." },
        // });
      }
    } catch (err: any) {
      setFieldErrors(err.response?.data || {});
      setError(
        err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          "An error occurred"
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-900 text-black dark:text-white transition-colors duration-300">
      <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold text-primary mb-4">
          {mode === "login" ? "Login" : "Register"}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-md text-black"
              required
            />
            {fieldErrors.username && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.username}
              </p>
            )}
          </div>

          {mode === "register" && (
            <div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md text-black"
                required
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>
          )}

          <div>
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-md text-black"
              required
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <Button variant="primary" type="submit" className="w-full">
            {mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        {mode === "login" ? (
          <p className="text-sm text-center mt-4">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        ) : (
          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};
