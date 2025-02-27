import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      {/* ✅ Clicking Logo redirects users based on authentication status */}
      <img
        src="/logo.png"
        alt="ResuMe Logo"
        className="w-16 cursor-pointer"
        onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
      />

      <div className="space-x-6">
        <Link to="/public-resumes" className="text-white hover:underline">
          Public Resumes
        </Link>

        {isAuthenticated ? (
          <>
            <Link to="/my-resumes" className="text-white hover:underline">
              My Resumes
            </Link>
            <Link to="/profile" className="text-white hover:underline">
              Profile
            </Link>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-white hover:underline">Login</Link>
            <Link to="/register" className="text-white hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
