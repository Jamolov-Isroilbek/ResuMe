import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { useResumes } from "@/hooks/useResumes";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { resumes, loading } = useResumes();

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Hero Section */}
      <div className="text-center mt-12">
        <h1 className="text-4xl font-bold text-primary">
          Your Resumes in One Place
        </h1>
        <p className="text-lg text-textDark mt-2">
          Create, edit, and manage your professional resumes effortlessly.
        </p>
        <Button
          variant="primary"
          className="mt-6 px-6 py-2"
          onClick={() => navigate("/create-resume")}
        >
          Create a New Resume
        </Button>
      </div>

      {/* Features Overview */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "AI-Powered Suggestions",
            content: "Get intelligent recommendations for your resume."
          },
          {
            title: "Pre-Made Templates",
            content: "Choose from professional resume layouts."
          },
          {
            title: "Export to PDF",
            content: "Download in professional format."
          }
        ].map((feature, index) => (
          <div key={index} className="p-6 bg-white shadow-md rounded-lg">
            <h3 className="text-xl font-bold text-primary">{feature.title}</h3>
            <p className="text-textDark mt-2">{feature.content}</p>
          </div>
        ))}
      </div>

      {/* User's Resumes */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-primary">Your Resumes</h2>
        <p className="text-textDark mt-2">Manage your existing resumes below.</p>

        {loading ? (
          <Loader />
        ) : resumes.length === 0 ? (
          <div className="mt-6 bg-white shadow-md p-4 rounded-lg">
            <p className="text-lg text-textDark">
              No resumes found. Start by creating one.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white shadow-md p-4 rounded-lg hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold">{resume.title}</h3>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 p-4 bg-gray-100 rounded-lg">
        <p className="text-textDark">&copy; 2025 ResuMe. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;