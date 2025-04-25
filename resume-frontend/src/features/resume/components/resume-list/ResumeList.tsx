// src/features/resume/components/resume-list/ResumeList.tsx
import { ResumeCard } from "@/features/resume/components/resume-card/ResumeCard";
import { Resume, ResumeStatus } from "@/types/shared/resume";
import { useResumeActions } from "@/features/resume/hooks/useResumeActions";
import { useNavigate } from "react-router-dom";
interface ResumeListProps {
  resumes: Resume[];
  activeTab: ResumeStatus;
  refetchResumes: () => void;
}

export const ResumeList: React.FC<ResumeListProps> = ({ resumes, activeTab, refetchResumes, }) => {
  const { handleView, handleDownload, handleDelete, handleArchive, handlePublish, handleShare, handleFavorite } = 
    useResumeActions(refetchResumes);

  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {resumes.map((resume) => (
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
  );
};