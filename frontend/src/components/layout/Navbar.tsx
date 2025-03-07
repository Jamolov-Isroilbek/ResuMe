import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <img
        src="/logo.png"
        alt="Logo"
        className="w-16 cursor-pointer"
        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
      />

      <div className="space-x-4">
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
                navigate('/login');
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button variant="primary" onClick={() => navigate('/register')}>
              Register
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;