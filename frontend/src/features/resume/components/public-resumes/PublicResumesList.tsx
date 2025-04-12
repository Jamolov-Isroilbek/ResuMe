import { ResumeCard } from "@/features/resume/components/resume-card/ResumeCard";
import { Resume } from "@/types/shared/resume";
import { useResumeActions } from "@/features/resume/hooks";
import { useState, useEffect } from "react";

interface PublicResumeListProps {
  resumes: Resume[];
  currentUserId?: number;
  refreshResumes: () => void;
  toggleFavoriteInState: (resumeId: number, updatedResume: Resume) => void;
}

export const PublicResumeList: React.FC<PublicResumeListProps> = ({
  resumes,
  currentUserId,
  refreshResumes,
  toggleFavoriteInState,
}) => {
  const { handleView, handleDownload, handleShare, handleFavorite } = useResumeActions();

  // Use local state to reflect immediate UI changes
  const [localResumes, setLocalResumes] = useState<Resume[]>(resumes);

  useEffect(() => {
    setLocalResumes(resumes);
  }, [resumes]);

  const handleFavoriteToggle = async (resumeId: number) => {
    try {
      const updatedResume = await handleFavorite(resumeId);
      
      // Update local state immediately for UI feedback
      setLocalResumes(prev => 
        prev.map(resume => 
          resume.id === resumeId 
            ? { 
                ...resume, 
                is_favorited: !resume.is_favorited,
                favorite_count: typeof resume.favorite_count === "number"
                  ? (resume.is_favorited ? resume.favorite_count - 1 : resume.favorite_count + 1)
                  : resume.favorite_count
              } 
            : resume
        )
      );
      
      // Also update the parent state
      toggleFavoriteInState(resumeId, updatedResume);
    } catch (err) {
      console.error("Failed to toggle favorite", err);
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
