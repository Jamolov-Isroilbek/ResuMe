import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/lib/ui/buttons/Button";
import { ThemeToggle } from "@/context/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        <button
          ref={buttonRef}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="text-white focus:outline-none transition duration-200"
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            className="absolute top-16 left-0 w-full bg-gray-900 p-4 z-50 shadow-md border-t border-gray-700"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <ThemeToggle />
            </div>

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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Menu (existing code) */}
      <div className="hidden md:flex space-x-4 items-center">
        <Link
          to="/public-resumes"
          className="hover:text-gray-300 flex items-center"
        >
          Public Resumes
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              to="/my-resumes"
              className="hover:text-gray-300 flex items-center"
            >
              My Resumes
            </Link>
            <Link
              to="/profile"
              className="hover:text-gray-300 flex items-center"
            >
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
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
