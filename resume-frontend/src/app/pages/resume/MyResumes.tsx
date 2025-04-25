// src/pages/MyResumes.tsx
import React, { useEffect, useState } from "react";
import api from "@/lib/api/axiosClient";
import { Loader } from "@/lib/ui/common/Loader";
import { Resume, ResumeStatus } from "@/types/shared/resume";
import { defaultOrderingMapping } from "@/lib/utils/orderingMapping";
import { ResumeTabs } from "@/features/resume/components/resume-tabs/ResumeTabs";
import { ResumesHeader } from "@/features/resume/components/resumes-header/ResumesHeader";
import { ResumeList } from "@/features/resume/components/resume-list/ResumeList";
import { useFilteredResumes } from "@/features/resume/hooks/useFilteredResumes";
import { TooltipIcon } from "@/lib/ui/common/TooltipIcon";

interface ResumeResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Resume[];
}

const MyResumes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ResumeStatus>(
    ResumeStatus.PUBLISHED
  );
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("Newest");

  const { filteredResumes } = useFilteredResumes(resumes, activeTab);

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

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto bg-white dark:bg-zinc-900 text-black dark:text-white transition-colors duration-300">
      <ResumesHeader sortOption={sortOption} setSortOption={setSortOption} />

      <div className="flex justify-between items-center mb-2">
        <ResumeTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <TooltipIcon content="Tabs let you filter your resumes by status. Drafts are still in progress, Published resumes are active and visible, and Archived ones are hidden but not deleted. To view resume stats, visit the Profile section." />
      </div>

      {filteredResumes.length > 0 ? (
        <div className="spacy-4">
          <ResumeList
            resumes={filteredResumes}
            activeTab={activeTab}
            refetchResumes={fetchResumes}
          />
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          No resumes found in this category.
        </p>
      )}
    </div>
  );
};

export default MyResumes;
