import { ResumeCard } from "@/features/resume/components/resume-card/ResumeCard";
import { Resume } from "@/types/shared/resume";
import { useResumeActions } from "@/features/resume/hooks";
import { useState, useEffect } from "react";

interface PublicResumeListProps {
  resumes: Resume[];
  currentUserId?: number;
  refreshResumes: () => void; // New prop to refresh the list
}

export const PublicResumeList: React.FC<PublicResumeListProps> = ({
  resumes,
  currentUserId,
  refreshResumes,
}) => {
  const { handleView, handleDownload, handleShare, handleFavorite } = useResumeActions();

  // Use local state to reflect immediate UI changes
  const [localResumes, setLocalResumes] = useState<Resume[]>(resumes);

  // Sync local state when the resumes prop changes
  useEffect(() => {
    setLocalResumes(resumes);
  }, [resumes]);

  const handleFavoriteToggle = async (resumeId: number) => {
    // Find the resume to toggle
    const currentResume = localResumes.find(r => r.id === resumeId);
    if (!currentResume) return;
    
    const newFavoriteState = !currentResume.is_favorited;
    
    // Optimistically update local state
    const updatedResumes = localResumes.map(r =>
      r.id === resumeId ? { ...r, is_favorited: newFavoriteState } : r
    );
    setLocalResumes(updatedResumes);
    
    try {
      // Call the backend to toggle favorite
      await handleFavorite(resumeId);
      // After a successful update, call the refresh callback
      refreshResumes();
    } catch (error) {
      console.error("Failed to toggle favorite", error);
      // Revert local state if API call fails
      setLocalResumes(localResumes);
    }
  };

  return (
    <div className="space-y-4">
      {localResumes.map((resume) => (
        <ResumeCard
          key={resume.id}
          resume={resume}
          onView={() => handleView(resume.id)}
          onDownload={() => handleDownload(resume.id, resume.title)}
          onFavorite={() => handleFavoriteToggle(resume.id)}
          onShare={() => handleShare(resume.id)}
          ownResume={resume.user?.id === currentUserId}
          displayMode="public"
        />
      ))}
    </div>
  );
};
