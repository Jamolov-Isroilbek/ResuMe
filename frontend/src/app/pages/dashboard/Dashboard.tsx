import React, { useState, useEffect } from "react";
import api from "@/lib/api/axiosClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/lib/ui/buttons/Button";
import { ResumeCard } from "@/features/resume/components/resume-card/ResumeCard";
import { Resume } from "@/types/shared/resume";
import { Pagination } from "@/lib/ui/navigation/Pagination";
import { useResumeActions } from "@/features/resume/hooks/useResumeActions";
import { useAuth } from "@/providers/AuthProvider";

interface ResumeResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Resume[];
}

const Dashboard: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const { handleView, handleDelete, handleDownload } = useResumeActions();
  const { user } = useAuth();

  const fetchResumes = async (page: number) => {
    setLoading(true);
    try {
      const response = await api.get<ResumeResponse>(
        `/resumes/?page=${page}&page_size=10`
      );
      setResumes(response.data.results);
      setTotalCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes(currentPage);
  }, [currentPage]);

  const handleCreate = () => {
    if (!user) navigate("/login?redirect=/create-resume");
    else navigate("/create-resume");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-300 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <div className="text-center mt-12 px-4">
        <h1 className="text-4xl font-bold">Your Resumes in One Place</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
          Create, edit, and manage your professional resumes effortlessly.
        </p>
        <Button
          variant="primary"
          className="mt-6 px-6 py-2"
          onClick={handleCreate}
        >
          Create a New Resume
        </Button>
      </div>

      {/* Features Overview */}
      <div className="mt-12 px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "AI-Powered Suggestions",
            content: "Get intelligent recommendations for your resume.",
          },
          {
            title: "Pre-Made Templates",
            content: "Choose from professional resume layouts.",
          },
          {
            title: "Export to PDF",
            content: "Download in professional format.",
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="p-6 bg-white dark:bg-zinc-800 shadow-md rounded-lg transition-colors duration-300"
          >
            <h3 className="text-xl font-bold">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {feature.content}
            </p>
          </div>
        ))}
      </div>

      {/* Resume List */}
      <div className="mt-16 px-4">
        <h2 className="text-3xl font-bold mb-6">Recent Resumes</h2>
        <div className="space-y-4">
          {resumes.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 mt-6 text-sm italic">
              You haven’t created any resumes yet. Let’s build one!
            </p>
          ) : (
            resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onView={() => handleView(resume.id)}
                onDownload={() => handleDownload(resume.id, resume.title)}
                displayMode="dashboard"
              />
            ))
          )}
        </div>
        {totalCount > 10 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={totalCount}
              pageSize={10}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 p-6 bg-gray-100 dark:bg-zinc-800 text-center text-sm text-gray-600 dark:text-gray-400 rounded-lg">
        &copy; 2025 ResuMe. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Dashboard;
