import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/lib/ui/buttons/Button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-16 cursor-pointer"
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
        />


      {/* Mobile Menu Toggle */}
      <div className="md:hidden">
        <Button
          variant="secondary"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          ☰
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-gray-900 p-4 z-50">
          <div className="flex flex-col space-y-4">
            <Link
              to="/"
              className="hover:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/public-resumes"
              className="hover:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Public Resumes
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/my-resumes"
                  className="hover:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Resumes
                </Link>
                <Link
                  to="/profile"
                  className="hover:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                    navigate("/login");
                  }}
                  className="text-left hover:text-gray-300"
                >
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="hover:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hover:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Desktop Menu (existing code) */}
      <div className="hidden md:flex space-x-4">
        <Link to="/public-resumes" className="hover:text-gray-300">
          Public Resumes
        </Link>

        {isAuthenticated ? (
          <>
            <Link to="/my-resumes" className="hover:text-gray-300">
              My Resumes
            </Link>
            <Link to="/profile" className="hover:text-gray-300">
              Profile
            </Link>
            <Button
              variant="danger"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button variant="primary" onClick={() => navigate("/register")}>
              Register
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
