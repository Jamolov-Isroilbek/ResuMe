import React, { useCallback, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Loader } from "@/lib/ui/common/Loader";
import { Resume, ResumeStatus, PrivacySettings } from "@/types/shared/resume";
import { PublicResumesHeader } from "@/features/resume/components/public-resumes/PublicResumesHeader";
import { PublicResumesTabs } from "@/features/resume/components/public-resumes/PublicResumesTabs";
import { PublicResumeList } from "@/features/resume/components/public-resumes/PublicResumesList";
import { usePublicResumes } from "@/features/resume/hooks/usePublicResumes";
import { useResumeActions } from "@/features/resume/hooks/useResumeActions";
import { TooltipIcon } from "@/lib/ui/common/TooltipIcon";

const PublicResumes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("Newest");
  const [activeTab, setActiveTab] = useState<"published" | "favorites">(
    "published"
  );
  const { user: currentUser } = useAuth();

  // Destructure the refresh function along with publicResumes, isLoading, and error.
  const {
    publicResumes,
    isLoading,
    error,
    refresh: refreshResumes,
    toggleFavoriteInState,
  } = usePublicResumes(sortOption);
  const { handleView, handleDownload, handleShare, handleFavorite } =
    useResumeActions();
  
  const handleToggleFavorite = useCallback((resumeId: number, updatedResume: Resume) => {
    toggleFavoriteInState(resumeId, updatedResume);
  }, [toggleFavoriteInState]);

  const filteredResumes =
    publicResumes?.filter((resume: Resume) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = resume.title.toLowerCase().includes(searchLower);
      const isPublished =
        resume.resume_status === ResumeStatus.PUBLISHED &&
        resume.privacy_setting === PrivacySettings.PUBLIC;

      if (activeTab === "favorites") {
        return matchesSearch && isPublished && resume.is_favorited;
      }
      return (
        matchesSearch &&
        isPublished &&
        (!currentUser || resume.user?.id !== currentUser.id)
      );
    }) || [];

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto bg-white dark:bg-zinc-900 text-black dark:text-white transition-colors duration-300">
      <h2 className="text-3xl font-bold text-center mb-6">Public Resumes</h2>

      <PublicResumesHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />

      <div className="flex items-center justify-between">
        <PublicResumesTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <TooltipIcon content="Only resumes marked as Public and Published are shown here. Some users may choose to hide personal details or appear as anonymous for privacy." />
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <div className="text-center text-red-500">{error.message}</div>
      ) : filteredResumes.length > 0 ? (
        <PublicResumeList
          resumes={filteredResumes}
          currentUserId={currentUser?.id}
          refreshResumes={refreshResumes}
          toggleFavoriteInState={handleToggleFavorite}
        />
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          No public resumes found matching your search.
        </p>
      )}
    </div>
  );
};

export default PublicResumes;
