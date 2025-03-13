import { ResumeCard } from "@/features/resume/components/resume-card/ResumeCard";
import { Resume } from "@/types/shared/resume";
import { useResumeActions } from "@/features/resume/hooks/useResumeActions";

interface PublicResumeListProps {
  resumes: Resume[];
  currentUserId?: number;
}

export const PublicResumeList: React.FC<PublicResumeListProps> = ({
  resumes,
  currentUserId,
}) => {
  const { handleView, handleDownload, handleShare, handleFavorite } = useResumeActions();

  return (
    <div className="space-y-4">
      {resumes.map((resume) => (
        <ResumeCard
          key={resume.id}
          resume={resume}
          onView={() => handleView(resume.id)}
          onDownload={() => handleDownload(resume.id, resume.title)}
          onFavorite={() => handleFavorite(resume.id)}
          onShare={() => handleShare(resume.id)}
          ownResume={resume.user?.id === currentUserId}
          displayMode="public"
        />
      ))}
    </div>
  );
};