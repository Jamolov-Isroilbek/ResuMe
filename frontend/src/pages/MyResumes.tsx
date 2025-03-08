// src/pages/MyResumes.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { ResumeCard } from "@/components/resume/ResumeCard";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Resume, ResumeStatus } from "@/services/types";

interface ResumeResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Resume[];
}

const MyResumes: React.FC = () => {
  // Use the enum type for activeTab:
  const [activeTab, setActiveTab] = useState<ResumeStatus>(ResumeStatus.PUBLISHED);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      const response = await api.get<ResumeResponse>("/resumes/");
      setResumes(response.data.results ?? []);
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Group resumes using the enum values
  const drafts = resumes.filter((r) => r.resume_status === ResumeStatus.DRAFT);
  const archives = resumes.filter((r) => r.resume_status === ResumeStatus.ARCHIVED);
  const published = resumes.filter(
    (r) => r.resume_status !== ResumeStatus.DRAFT && r.resume_status !== ResumeStatus.ARCHIVED
  );

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      try {
        await api.delete(`/resumes/${id}/`);
        setResumes((prev) => prev.filter((r) => r.id !== id));
      } catch (error) {
        console.error("Failed to delete resume:", error);
      }
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await api.put(`/resumes/${id}/`, { resume_status: ResumeStatus.ARCHIVED });
      setResumes((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, resume_status: ResumeStatus.ARCHIVED } : r
        )
      );
    } catch (error) {
      console.error("Failed to archive resume:", error);
      alert("Error archiving resume. Check console for details.");
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await api.put(`/resumes/${id}/`, { resume_status: ResumeStatus.PUBLISHED });
      setResumes((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, resume_status: ResumeStatus.PUBLISHED } : r
        )
      );
    } catch (error) {
      console.error("Failed to publish resume:", error);
      alert("Error publishing resume. Check console for details.");
    }
  };

  // Render tab navigation using the enum
  const renderTabs = () => (
    <div className="mb-4 flex space-x-4 border-b">
      <button
        className={`py-2 px-4 ${
          activeTab === ResumeStatus.PUBLISHED ? "border-b-2 border-blue-500 font-bold" : ""
        }`}
        onClick={() => setActiveTab(ResumeStatus.PUBLISHED)}
      >
        Published
      </button>
      <button
        className={`py-2 px-4 ${
          activeTab === ResumeStatus.DRAFT ? "border-b-2 border-blue-500 font-bold" : ""
        }`}
        onClick={() => setActiveTab(ResumeStatus.DRAFT)}
      >
        Drafts
      </button>
      <button
        className={`py-2 px-4 ${
          activeTab === ResumeStatus.ARCHIVED ? "border-b-2 border-blue-500 font-bold" : ""
        }`}
        onClick={() => setActiveTab(ResumeStatus.ARCHIVED)}
      >
        Archived
      </button>
    </div>
  );

  // Filter resumes based on activeTab
  let filteredResumes: Resume[] = [];
  if (activeTab === ResumeStatus.DRAFT) {
    filteredResumes = drafts;
  } else if (activeTab === ResumeStatus.ARCHIVED) {
    filteredResumes = archives;
  } else {
    filteredResumes = published;
  }

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Resumes</h1>
        <Button variant="primary" onClick={() => navigate("/create-resume")}>
          Create New
        </Button>
      </div>
      {renderTabs()}
      <div className="space-y-4">
        {filteredResumes.map((resume) => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            onView={() => {
              const url = `${process.env.REACT_APP_API_URL}/resumes/${resume.id}/view/`;
              window.open(url, "_blank");
            }}
            onEdit={() => navigate(`/resumes/${resume.id}/edit`)}
            onDelete={() => handleDelete(resume.id)}
            onArchive={activeTab === ResumeStatus.PUBLISHED ? () => handleArchive(resume.id) : undefined}
            onPublish={activeTab === ResumeStatus.ARCHIVED ? () => handlePublish(resume.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default MyResumes;
