// src/pages/PublicResumes.tsx
import React, { useState, useEffect } from "react";
import { useAsync } from "@/lib/hooks/useAsync";
import { useAuth } from "@/providers/AuthProvider";
import api from "@/lib/api/axiosClient";
import { Loader } from "@/lib/ui/common/Loader";
import { ResumeCard } from "@/features/resume/components/resume-card/ResumeCard";
import { SortingDropdown } from "@/lib/ui/buttons/SortingDropdown";
import { defaultOrderingMapping } from "@/lib/utils/orderingMapping";
import { Resume, ResumeStatus, PrivacySettings } from "@/types/shared/resume";
import { useResumeActions } from "@/features/resume/hooks/useResumeActions";

interface PublicResumeResponse {
  count: number;
  results: Resume[];
}

const PublicResumes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("Newest");
  const {
    data: response,
    loading,
    error,
  } = useAsync(() =>
    api.get<PublicResumeResponse>(
      `/public-resumes/?ordering=${defaultOrderingMapping[sortOption]}`
    ),
    [sortOption]
  );
  const [activeTab, setActiveTab] = useState<"published" | "favorites">("published");
  const currentUser = useAuth().user;
  const [publicResumes, setPublicResumes] = useState<Resume[]>([]);
  
  const { handleView, handleDownload, handleShare, handleFavorite } = useResumeActions();

  useEffect(() => {
    if (response?.data?.results) {
      setPublicResumes(response.data.results);
    }
  }, [response]);

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

  const renderTabs = () => (
    <div className="mb-4 flex space-x-4 border-b">
      <button
        className={`py-2 px-4 ${
          activeTab === "published" ? "border-b-2 border-blue-500 font-bold" : ""
        }`}
        onClick={() => setActiveTab("published")}
      >
        Published
      </button>
      <button
        className={`py-2 px-4 ${
          activeTab === "favorites" ? "border-b-2 border-blue-500 font-bold" : ""
        }`}
        onClick={() => setActiveTab("favorites")}
      >
        Favorites
      </button>
    </div>
  );

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Public Resumes</h2>
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 mb-4 sm:mb-0"
        />
        <SortingDropdown
          sortOption={sortOption}
          setSortOption={setSortOption}
        />
      </div>
      {renderTabs()}
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-center text-red-500">{error.message}</div>
      ) : filteredResumes.length > 0 ? (
        <div className="space-y-4">
          {filteredResumes.map((resume: Resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onView={() => handleView(resume.id)}
              onDownload={() => handleDownload(resume.id, resume.title)}
              onFavorite={() => handleFavorite(resume.id, setPublicResumes)}
              onShare={() => handleShare(resume.id)}
              ownResume={false}
              displayMode="public"
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">
          No public resumes found matching your search.
        </p>
      )}
    </div>
  );
};

export default PublicResumes;