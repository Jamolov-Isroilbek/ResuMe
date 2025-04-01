import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/lib/ui/buttons/Button";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-black dark:text-white flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="mb-6">
        <img src="/logo.png" alt="ResuMe Logo" className="w-24 h-24 mx-auto" />
      </div>

      <h1 className="text-4xl font-bold text-primary mb-4 text-center">
        Build Your Resume in Minutes
      </h1>
      <p className="text-lg text-textDark dark:text-gray-300 mb-6 text-center">
        Create a professional resume with AI-powered suggestions.
      </p>

      <div className="flex gap-4">
        {isAuthenticated ? (
          <Button variant="primary" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              className="px-6 py-2"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button
              variant="primary"
              className="px-6 py-2"
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
