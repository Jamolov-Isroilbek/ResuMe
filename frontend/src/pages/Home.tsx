import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
      {/* Logo */}
      <div className="mb-6">
        <img src="/logo.png" alt="ResuMe Logo" className="w-24 h-24" />
      </div>

      {/* Hero Section */}
      <h1 className="text-4xl font-bold text-primary mb-4">
        Build Your Resume in Minutes
      </h1>
      <p className="text-lg text-textDark mb-6">
        Create a professional resume with AI-powered suggestions.
      </p>

      {/* Call to Action */}
      <div className="space-x-4">
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 border-2 border-primary text-primary rounded-lg shadow-md hover:bg-primary hover:text-white transition"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          className="px-6 py-2 bg-secondary text-white rounded-lg shadow-md hover:bg-primary transition"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Home;
