import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();    
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-center p-6">
      {/* Navigation Bar */}
      <nav className="w-full flex justify-between items-center p-4 bg-white shadow-md">
        <img src="/logo.png" alt="ResuMe Logo" className="w-16" />
        <div className="space-x-6">
          <Link to="/dashboard" className="text-primary hover:underline">Home</Link>
          <Link to="/my-resumes" className="text-primary hover:underline">My Resumes</Link>
          <Link to="/profile" className="text-primary hover:underline">Profile</Link>
          <Link to="/about" className="text-primary hover:underline">About</Link>
          <Link to="/features" className="text-primary hover:underline">Features</Link>
          <Link to="/contact" className="text-primary hover:underline">Contact</Link>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-md">
          Logout
        </button>
      </nav>

      {/* Hero Section */}
      <div className="mt-12">
        <h1 className="text-4xl font-bold text-primary">Your Resumes in One Place</h1>
        <p className="text-lg text-textDark mt-2">
          Create, edit, and manage your professional resumes effortlessly.
        </p>
        <Link to="/create-resume">
          <button className="mt-6 px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-secondary transition">
            Create a New Resume
          </button>
        </Link>
      </div>

      {/* Features Overview */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
        <div className="p-6 bg-white shadow-md rounded-lg">
          <h3 className="text-xl font-bold text-primary">AI-Powered Suggestions</h3>
          <p className="text-textDark">Get intelligent recommendations for your resume.</p>
        </div>
        <div className="p-6 bg-white shadow-md rounded-lg">
          <h3 className="text-xl font-bold text-primary">Pre-Made Templates</h3>
          <p className="text-textDark">Choose from a variety of professional resume layouts.</p>
        </div>
        <div className="p-6 bg-white shadow-md rounded-lg">
          <h3 className="text-xl font-bold text-primary">Export to PDF</h3>
          <p className="text-textDark">Easily download your resume in a professional format.</p>
        </div>
      </div>

      {/* User's Resumes */}
      <div className="mt-12 px-6">
        <h2 className="text-3xl font-bold text-primary">Your Resumes</h2>
        <p className="text-textDark">Manage your existing resumes below.</p>

        {/* Resume List (Placeholder for Now) */}
        <div className="mt-6 bg-white shadow-md p-4 rounded-lg">
          <p className="text-lg text-textDark">No resumes found. Start by creating one.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 p-4 bg-gray-100">
        <p className="text-textDark">&copy; 2025 ResuMe. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
