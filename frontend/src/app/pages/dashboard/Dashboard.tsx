import React, { useState, useEffect } from "react";
import api from "@/lib/api/axiosClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/lib/ui/buttons/Button";
import { ResumeCard } from "@/features/resume/components/resume-card/ResumeCard";
import { Resume } from "@/types/shared/resume";
import { Pagination } from "@/lib/ui/navigation/Pagination";
import { useResumeActions } from "@/features/resume/hooks/useResumeActions";

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

  const fetchResumes = async (page: number) => {
    setLoading(true);
    try {
      // Adjust the endpoint as needed; assuming pagination params: page and page_size
      const response = await api.get<ResumeResponse>(`/resumes/?page=${page}&page_size=10`);
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
          <div key={index} className="p-6 bg-white shadow-md rounded-lg">
            <h3 className="text-xl font-bold text-primary">{feature.title}</h3>
            <p className="text-textDark mt-2">{feature.content}</p>
          </div>
        ))}
      </div>

      <div className="min-h-screen bg-background p-6">
      <h1 className="text-3xl font-bold mb-6">Recent Resumes</h1>
      <div className="space-y-4">
        {resumes.map((resume) => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            onView={() => navigate(`/resumes/${resume.id}/view`)}
            onEdit={() => navigate(`/resumes/${resume.id}/edit`)}
            onDelete={() => handleDelete(resume.id)}
            onDownload={() => handleDownload(resume.id, resume.title)}
            displayMode="dashboard"
          />
        ))}
      </div>
      {totalCount > 10 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalCount}
          pageSize={10}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>

      {/* Footer */}
      <footer className="mt-12 p-4 bg-gray-100 rounded-lg">
        <p className="text-textDark">
          &copy; 2025 ResuMe. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
