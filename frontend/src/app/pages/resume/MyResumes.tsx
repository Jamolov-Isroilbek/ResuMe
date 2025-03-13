// src/pages/MyResumes.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api/axiosClient";
import { ResumeCard } from "@/features/resume/components/resume-card/ResumeCard";
import { Button } from "@/lib/ui/buttons/Button";
import { Loader } from "@/lib/ui/common/Loader";
import { Resume, ResumeStatus } from "@/types/shared/resume";
import { SortingDropdown } from "@/lib/ui/buttons/SortingDropdown";
import { defaultOrderingMapping } from "@/lib/utils/orderingMapping";
import { useResumeActions } from "@/features/resume/hooks/useResumeActions";

interface ResumeResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Resume[];
}

const MyResumes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ResumeStatus>(ResumeStatus.PUBLISHED);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("Newest");
  const navigate = useNavigate();
  const { handleDelete, handleArchive, handlePublish, handleDownload, handleShare } = 
    useResumeActions(setResumes);

  const fetchResumes = async () => {
    try {
      const response = await api.get<ResumeResponse>(
        `/resumes/?ordering=${defaultOrderingMapping[sortOption]}`
      );
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
  }, [sortOption]);

  const drafts = resumes.filter((r) => r.resume_status === ResumeStatus.DRAFT);
  const archives = resumes.filter((r) => r.resume_status === ResumeStatus.ARCHIVED);
  const published = resumes.filter(
    (r) => r.resume_status !== ResumeStatus.DRAFT && r.resume_status !== ResumeStatus.ARCHIVED
  );

  const renderTabs = () => (
    <div className="mb-4 flex space-x-4 border-b">
      {Object.values(ResumeStatus).map(status => (
        <button
          key={status}
          className={`py-2 px-4 ${
            activeTab === status ? "border-b-2 border-blue-500 font-bold" : ""
          }`}
          onClick={() => setActiveTab(status)}
        >
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  );

  const filteredResumes = activeTab === ResumeStatus.DRAFT ? drafts :
    activeTab === ResumeStatus.ARCHIVED ? archives : published;

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Resumes</h1>
        <div className="flex items-center gap-4">
          <SortingDropdown
            sortOption={sortOption}
            setSortOption={setSortOption}
          />
          <Button variant="primary" onClick={() => navigate("/create-resume")}>
            Create New
          </Button>
        </div>
      </div>

      {renderTabs()}
      <div className="space-y-4">
        {filteredResumes.map((resume) => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            onView={() => window.open(
              `${process.env.REACT_APP_API_URL}/resumes/${resume.id}/view/`,
              "_blank"
            )}
            onEdit={() => navigate(`/resumes/${resume.id}/edit`)}
            onDownload={() => handleDownload(resume.id, resume.title)}
            onShare={() => handleShare(resume.id)}
            onDelete={() => handleDelete(resume.id)}
            onArchive={
              activeTab === ResumeStatus.PUBLISHED
                ? () => handleArchive(resume.id)
                : undefined
            }
            onPublish={
              activeTab === ResumeStatus.ARCHIVED
                ? () => handlePublish(resume.id)
                : undefined
            }
            ownResume={true}
            displayMode="my"
          />
        ))}
      </div>
    </div>
  );
};

export default MyResumes;