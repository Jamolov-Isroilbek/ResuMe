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
    <div className="min-h-screen bg-background p-6">
      <ResumesHeader 
        sortOption={sortOption} 
        setSortOption={setSortOption} 
      />
      
      <ResumeTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <ResumeList 
        resumes={filteredResumes} 
        activeTab={activeTab} 
      />
    </div>
  );
};

export default MyResumes;