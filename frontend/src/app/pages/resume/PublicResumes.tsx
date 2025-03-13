// src/app/pages/resume/PublicResumes.tsx
import React, { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Loader } from "@/lib/ui/common/Loader";
import { Resume, ResumeStatus, PrivacySettings } from "@/types/shared/resume";
import { PublicResumesHeader } from "@/features/resume/components/public-resumes/PublicResumesHeader";
import { PublicResumesTabs } from "@/features/resume/components/public-resumes/PublicResumesTabs";
import { PublicResumeList } from "@/features/resume/components/public-resumes/PublicResumesList";
import { usePublicResumes } from "@/features/resume/hooks/usePublicResumes";

const PublicResumes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("Newest");
  const [activeTab, setActiveTab] = useState<"published" | "favorites">("published");
  const { user: currentUser } = useAuth();
  const { publicResumes, loading, error } = usePublicResumes(sortOption);  

  const filteredResumes = publicResumes.filter((resume: Resume) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = resume.title.toLowerCase().includes(searchLower);
    const isPublished = resume.resume_status === ResumeStatus.PUBLISHED &&
      resume.privacy_setting === PrivacySettings.PUBLIC;

    if (activeTab === "favorites") {
      return matchesSearch && isPublished && resume.is_favorited;
    }
    return matchesSearch && isPublished && (!currentUser || resume.user?.id !== currentUser.id);
  });

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Public Resumes</h2>
      
      <PublicResumesHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />
      
      <PublicResumesTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-center text-red-500">{error.message}</div>
      ) : filteredResumes.length > 0 ? (
        <PublicResumeList
          resumes={filteredResumes}
          currentUserId={currentUser?.id}
        />
      ) : (
        <p className="text-center text-gray-500 mt-8">
          No public resumes found matching your search.
        </p>
      )}
    </div>
  );
};

export default PublicResumes;